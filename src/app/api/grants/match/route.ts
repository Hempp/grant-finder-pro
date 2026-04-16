import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateMatchScore } from "@/lib/grant-matcher";
import { rateLimit } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/api-helpers";
import { getAccessibleUserIds } from "@/lib/org-context";
import { logError } from "@/lib/telemetry";

/**
 * POST /api/grants/match
 * Recalculate match scores for the user's organization against the
 * catalogue of visible grants (own + public).
 *
 * Pre-round-25 this route did the match math TWICE per grant — once
 * inline and once via getTopMatches — while fetching every Grant column
 * including the TEXT fields (description, eligibility, requirements).
 * At 2K grants that was ~4K calculateMatchScore calls per request plus
 * a 1-2 MB payload over the wire. Now: one Map keyed by grantId, one
 * pass, both the summary stats and the top-20 derived from the same
 * result set.
 */

/** Hard cap to keep a cold-start request under Vercel's 10s budget. */
const MAX_GRANTS_CONSIDERED = 2000;

const GRANT_SELECT_FOR_MATCHING = {
  id: true,
  title: true,
  funder: true,
  description: true,
  amount: true,
  amountMin: true,
  amountMax: true,
  type: true,
  category: true,
  eligibility: true,
  requirements: true,
  state: true,
  region: true,
  tags: true,
  deadline: true,
} as const;

export async function POST() {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    // Rate limit: 10 requests per minute — match recalc is expensive.
    const rateLimitResult = await rateLimit("ai", `user:${session.user.id}`);
    if (!rateLimitResult.success && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // Phase 2a: a member recalculating matches should score against
    // the *team's* organization profile and see the team's grants.
    const accessibleIds = await getAccessibleUserIds(session.user.id);

    const organization = await prisma.organization.findFirst({
      where: { userId: { in: accessibleIds }, profileComplete: true },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "No organization profile found. Please complete your profile first." },
        { status: 400 }
      );
    }

    if (!organization.profileComplete) {
      return NextResponse.json(
        { error: "Please complete your organization profile to get personalized matches." },
        { status: 400 }
      );
    }

    const grants = await prisma.grant.findMany({
      where: {
        OR: [{ userId: { in: accessibleIds } }, { userId: null }],
      },
      select: GRANT_SELECT_FOR_MATCHING,
      orderBy: { deadline: "asc" },
      take: MAX_GRANTS_CONSIDERED,
    });

    // ONE pass. Store in a Map so top-20 can read without re-computing.
    const resultsById = new Map<string, ReturnType<typeof calculateMatchScore>>();
    for (const grant of grants) {
      resultsById.set(grant.id, calculateMatchScore(organization, grant));
    }

    // Derive everything downstream from the single result set.
    let matchedCount = 0;
    let highCount = 0;
    for (const result of resultsById.values()) {
      if (result.score >= 50) matchedCount++;
      if (result.score >= 80) highCount++;
    }

    const topMatches = [...grants]
      .sort(
        (a, b) => (resultsById.get(b.id)?.score ?? 0) - (resultsById.get(a.id)?.score ?? 0)
      )
      .slice(0, 20)
      .map((g) => {
        const result = resultsById.get(g.id)!;
        return {
          id: g.id,
          title: g.title,
          funder: g.funder,
          score: result.score,
          reasons: result.reasons,
          amount: g.amount,
          deadline: g.deadline,
          state: g.state,
        };
      });

    return NextResponse.json({
      success: true,
      totalGrants: grants.length,
      matchedGrants: matchedCount,
      highMatches: highCount,
      topMatches,
      profile: {
        name: organization.name,
        type: organization.type,
        state: organization.state,
        mission:
          organization.mission?.substring(0, 100) +
          (organization.mission && organization.mission.length > 100 ? "..." : ""),
      },
    });
  } catch (error) {
    logError(error, { endpoint: "/api/grants/match", method: "POST" });
    return NextResponse.json({ error: "Failed to calculate matches" }, { status: 500 });
  }
}

/**
 * GET /api/grants/match
 * Get match analysis summary for the user (dashboard stats card).
 * Same single-pass pattern as POST — one scoring loop, multiple derived
 * stats. Only fetches amountMax for the potential-funding math.
 */
export async function GET() {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    // Phase 2a: member reads the team's org + team's grants.
    const accessibleIds = await getAccessibleUserIds(session.user.id);

    const organization = await prisma.organization.findFirst({
      where: { userId: { in: accessibleIds } },
    });

    if (!organization || !organization.profileComplete) {
      return NextResponse.json({
        hasProfile: false,
        message:
          "Complete your organization profile to get personalized grant matches",
        profileFields: {
          name: !!organization?.name,
          type: !!organization?.type,
          state: !!organization?.state,
          mission: !!organization?.mission,
          problemStatement: !!organization?.problemStatement,
          solution: !!organization?.solution,
          fundingSeeking: !!organization?.fundingSeeking,
        },
      });
    }

    const grants = await prisma.grant.findMany({
      where: { userId: null },
      select: GRANT_SELECT_FOR_MATCHING,
      orderBy: { deadline: "asc" },
      take: MAX_GRANTS_CONSIDERED,
    });

    // Single pass — compute score AND track the funding accumulator so
    // we never iterate the grant list twice.
    let scoreSum = 0;
    let highMatches = 0;
    let goodMatches = 0;
    let potentialFunding = 0;
    for (const grant of grants) {
      const score = calculateMatchScore(organization, grant).score;
      scoreSum += score;
      if (score >= 80) highMatches++;
      else if (score >= 60) goodMatches++;
      if (score >= 60 && grant.amountMax) potentialFunding += grant.amountMax;
    }
    const avgScore = grants.length ? Math.round(scoreSum / grants.length) : 0;

    return NextResponse.json({
      hasProfile: true,
      stats: {
        totalGrants: grants.length,
        averageScore: avgScore,
        highMatches,
        goodMatches,
        potentialFunding: formatFunding(potentialFunding),
      },
      profile: {
        name: organization.name,
        type: organization.type,
        state: organization.state,
      },
    });
  } catch (error) {
    logError(error, { endpoint: "/api/grants/match", method: "GET" });
    return NextResponse.json({ error: "Failed to get match summary" }, { status: 500 });
  }
}

function formatFunding(total: number): string {
  if (total >= 1_000_000_000) return `$${(total / 1_000_000_000).toFixed(1)}B`;
  if (total >= 1_000_000) return `$${(total / 1_000_000).toFixed(1)}M`;
  if (total >= 1_000) return `$${(total / 1_000).toFixed(0)}K`;
  return `$${total}`;
}
