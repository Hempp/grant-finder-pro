import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, parseJson } from "@/lib/api-helpers";
import { rateLimit } from "@/lib/rate-limit";
import { logError, logEvent, timer } from "@/lib/telemetry";
import { assertPublicHttpUrl, SafeUrlError } from "@/lib/safe-url";
import { extractFromWebsite } from "@/lib/content-library/extract-website";
import { createBlocks, detectConflicts } from "@/lib/content-library/content-manager";
import {
  extractOrgProfile,
  mergeOrgProfile,
} from "@/lib/content-library/extract-org-profile";

/**
 * POST /api/organizations/auto-fill
 *
 * The "Google-for-grants" experience: user pastes a URL (or we read
 * it from their org profile), and we:
 *
 *   1. Crawl the website + subpages (reuses extractFromWebsite)
 *   2. Extract content blocks into the Content Library (reuses createBlocks)
 *   3. Extract structured org profile fields via Claude (NEW — extractOrgProfile)
 *   4. Merge into existing org profile with "fill blanks, don't overwrite" (NEW)
 *
 * The user gets back a summary of what was found + what was auto-filled
 * so they can review and correct.
 *
 * Optionally accepts { source: "paste", content: "..." } for raw text
 * pasted by the user instead of a URL crawl — same extraction pipeline,
 * skip the crawl step.
 */
export async function POST(request: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const rateLimitResult = await rateLimit("ai", `user:${session.user.id}`);
  if (!rateLimitResult.success && rateLimitResult.response) {
    return rateLimitResult.response;
  }

  const body = await parseJson<{
    url?: string;
    source?: "url" | "paste";
    content?: string;
  }>(request);
  if (body instanceof NextResponse) return body;

  const org = await prisma.organization.findUnique({
    where: { userId: session.user.id },
  });

  // Determine the raw content source
  let rawContent: string;
  let sourceLabel: string;
  let blocksCreated = 0;
  let contentBlocks: unknown[] = [];
  let conflicts: unknown[] = [];

  const stop = timer("org.auto_fill");

  try {
    if (body.source === "paste" && body.content?.trim()) {
      // Direct paste — skip crawl, go straight to extraction
      rawContent = body.content.trim();
      sourceLabel = "pasted text";
    } else {
      // URL-based — crawl and extract content blocks first
      let url = body.url?.trim() || org?.website || "";
      if (!url) {
        return NextResponse.json(
          { error: "Provide a URL or paste your company information." },
          { status: 400 }
        );
      }
      if (!url.startsWith("http")) url = `https://${url}`;

      try {
        assertPublicHttpUrl(url);
      } catch (err) {
        if (err instanceof SafeUrlError) {
          return NextResponse.json({ error: err.message }, { status: 400 });
        }
        return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
      }

      // Step 1+2: crawl + extract content blocks (reuses existing pipeline)
      const result = await extractFromWebsite(url);
      if (result.blocks.length > 0) {
        conflicts = await detectConflicts(session.user.id, result.blocks);
        const conflictCategories = new Set(
          (conflicts as { category: string }[]).map((c) => c.category)
        );
        const nonConflicting = result.blocks.filter(
          (b) => !conflictCategories.has(b.category)
        );
        const created = await createBlocks(session.user.id, nonConflicting);
        blocksCreated = created.length;
        contentBlocks = created;
      }

      // Build rawContent from crawled pages for org-profile extraction
      rawContent = result.blocks
        .map((b) => `[${b.category}] ${b.title}\n${b.content}`)
        .join("\n\n");
      sourceLabel = "website";

      // Also update the org's website field if it's blank
      if (org && !org.website) {
        await prisma.organization.update({
          where: { id: org.id },
          data: { website: url },
        });
      }
    }

    if (!rawContent || rawContent.length < 20) {
      return NextResponse.json({
        success: true,
        blocksCreated,
        contentBlocks,
        conflicts,
        profile: { fieldsFound: 0, fieldsFilled: 0, updates: {} },
        message: "Not enough content to extract profile data.",
      });
    }

    // Step 3: Extract structured org profile fields
    const { profile: extracted, confidence } = await extractOrgProfile(
      rawContent,
      sourceLabel
    );

    // Step 4: Merge into existing org — fill blanks, never overwrite
    const existingFields: Record<string, string | null | undefined> = {
      name: org?.name,
      type: org?.type,
      legalStructure: org?.legalStructure,
      ein: org?.ein,
      city: org?.city,
      state: org?.state,
      mission: org?.mission,
      vision: org?.vision,
      problemStatement: org?.problemStatement,
      solution: org?.solution,
      targetMarket: org?.targetMarket,
      teamSize: org?.teamSize,
      founderBackground: org?.founderBackground,
      annualRevenue: org?.annualRevenue,
      fundingSeeking: org?.fundingSeeking,
      previousFunding: org?.previousFunding,
    };

    const { updates, fieldsFound, fieldsFilled } = mergeOrgProfile(
      existingFields,
      extracted
    );

    // Apply the updates if we have any
    if (fieldsFilled > 0 && org) {
      await prisma.organization.update({
        where: { id: org.id },
        data: updates,
      });
    }

    const duration = stop({ source: sourceLabel, fieldsFound, fieldsFilled, confidence });

    logEvent("org.auto_fill.completed", {
      source: sourceLabel,
      fieldsFound,
      fieldsFilled,
      blocksCreated,
      confidence,
      durationMs: duration,
    });

    return NextResponse.json({
      success: true,
      blocksCreated,
      contentBlocks,
      conflicts,
      profile: {
        fieldsFound,
        fieldsFilled,
        updates,
        confidence,
        extracted, // full extraction for the UI to show "we found X"
      },
      message:
        fieldsFilled > 0
          ? `Found ${fieldsFound} fields, auto-filled ${fieldsFilled} blank fields.`
          : fieldsFound > 0
          ? `Found ${fieldsFound} fields, but your profile already has values for all of them.`
          : "Couldn't extract enough structured data. Try pasting your company description directly.",
    });
  } catch (err) {
    logError(err, { endpoint: "/api/organizations/auto-fill", source: body.source });
    return NextResponse.json(
      { error: "Auto-fill failed. Try again or fill in your profile manually." },
      { status: 500 }
    );
  }
}
