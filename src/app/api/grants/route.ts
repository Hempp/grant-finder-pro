import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateMatchScore } from "@/lib/grant-matcher";

interface BulkGrant {
  title: string;
  funder: string;
  description?: string;
  amount?: string;
  amountMin?: number | null;
  amountMax?: number | null;
  deadline?: string | null;
  url?: string;
  type?: string;
  category?: string;
  eligibility?: string;
  state?: string;
  tags?: string[];
  source?: string;
  agencyName?: string;
  oppNumber?: string;
}

// POST - Bulk save grants to the shared catalog (admin-only)
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Bulk catalog writes are admin-only. The grant table is a
    // shared discovery catalog — letting any authenticated user push rows
    // into it would let attackers inject phishing links or spam.
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const userEmail = session.user.email?.toLowerCase();
    if (!userEmail || !adminEmails.includes(userEmail)) {
      return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const grants: BulkGrant[] = body.grants || [];

    if (!grants.length) {
      return NextResponse.json({ error: "No grants provided" }, { status: 400 });
    }

    let created = 0;
    let skipped = 0;

    for (const grant of grants) {
      try {
        // Check for existing grant by title + funder or oppNumber
        const existing = await prisma.grant.findFirst({
          where: {
            OR: [
              { title: grant.title, funder: grant.funder },
              ...(grant.oppNumber ? [{ url: { contains: grant.oppNumber } }] : []),
            ],
          },
        });

        if (!existing) {
          await prisma.grant.create({
            data: {
              title: grant.title,
              funder: grant.funder,
              description: grant.description || grant.title,
              amount: grant.amount || "Varies",
              amountMin: grant.amountMin,
              amountMax: grant.amountMax,
              deadline: grant.deadline ? new Date(grant.deadline) : null,
              url: grant.url || "",
              type: grant.type || "federal",
              category: grant.category || "Research",
              eligibility: grant.eligibility || "See grant details",
              state: grant.state || "ALL",
              tags: JSON.stringify(grant.tags || []),
              source: grant.source || "api",
              agencyName: grant.agencyName,
              status: "discovered",
              scrapedAt: new Date(),
            },
          });
          created++;
        } else {
          skipped++;
        }
      } catch {
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      created,
      skipped,
      total: grants.length,
    });
  } catch (error) {
    console.error("Bulk save failed:", error);
    return NextResponse.json(
      { error: "Bulk save failed", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    let session = null;
    try {
      session = await auth();
    } catch (authError) {
      console.info("Auth check failed, continuing without session:", authError);
    }

    // Build where clause - always include public grants, exclude expired
    const now = new Date();
    const baseFilter = {
      OR: [
        { deadline: { gte: now } },  // Future deadline
        { deadline: null },           // Rolling/no deadline (always open)
      ],
    };

    const whereClause = session?.user?.id
      ? { AND: [baseFilter, { OR: [{ userId: session.user.id }, { userId: null }] }] }
      : { AND: [baseFilter, { userId: null }] };

    // Fetch only open grants (not expired)
    const grants = await prisma.grant.findMany({
      where: whereClause,
      orderBy: [
        { matchScore: "desc" },
        { deadline: "asc" },
      ],
    });

    // If user is logged in, calculate personalized match scores
    let organization = null;
    if (session?.user?.id) {
      organization = await prisma.organization.findUnique({
        where: { userId: session.user.id },
      });
    }

    // Calculate personalized scores if user has an organization profile
    const grantsWithScores = grants.map((grant) => {
      if (organization && organization.profileComplete) {
        const matchResult = calculateMatchScore(organization, grant);
        return {
          ...grant,
          matchScore: matchResult.score,
          matchReasons: matchResult.reasons,
          matchBreakdown: matchResult.breakdown,
        };
      }
      return {
        ...grant,
        matchReasons: null,
        matchBreakdown: null,
      };
    });

    // Apply outcome-based match boosts if user has an organization
    if (organization) {
      const grantIds = grantsWithScores.map((g) => g.id);

      const outcomes = await prisma.grantOutcome.findMany({
        where: { grantId: { in: grantIds } },
        select: { grantId: true, result: true, orgType: true, orgState: true, teamSize: true },
      });

      if (outcomes.length > 0) {
        // Group outcomes by grantId
        const outcomesByGrant = new Map<string, typeof outcomes>();
        for (const o of outcomes) {
          const existing = outcomesByGrant.get(o.grantId) || [];
          existing.push(o);
          outcomesByGrant.set(o.grantId, existing);
        }

        for (const grant of grantsWithScores) {
          const grantOutcomes = outcomesByGrant.get(grant.id);
          if (!grantOutcomes) continue;

          // Find similar-org outcomes (at least 1 matching attribute)
          const similarOutcomes = grantOutcomes.filter((o) => {
            let matches = 0;
            if (organization.type && o.orgType === organization.type) matches++;
            if (organization.state && o.orgState === organization.state) matches++;
            if (organization.teamSize && o.teamSize === organization.teamSize) matches++;
            return matches >= 1;
          });

          if (similarOutcomes.length >= 2) {
            const awarded = similarOutcomes.filter((o) => o.result === "awarded").length;
            const winRate = awarded / similarOutcomes.length;

            let matchBoost = 0;
            if (winRate > 0.5) {
              matchBoost = Math.round(5 + winRate * 5); // +5 to +10
            } else if (winRate < 0.2) {
              matchBoost = -5;
            }

            if (matchBoost !== 0 && grant.matchScore != null) {
              grant.matchScore = Math.max(0, Math.min(100, grant.matchScore + matchBoost));
            }
          }
        }
      }
    }

    // Sort by personalized match score
    grantsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    const response = NextResponse.json({
      grants: grantsWithScores,
      hasProfile: !!organization?.profileComplete,
    });
    // Cache discipline: anonymous responses are safe to share at the edge.
    // Authenticated responses are personalized (match scores, organization
    // boosts) and MUST NOT be cached publicly — a CDN could otherwise serve
    // one user's match data to another.
    if (session?.user?.id) {
      response.headers.set("Cache-Control", "private, no-store");
    } else {
      response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    }
    return response;
  } catch (error) {
    console.error("Failed to fetch grants:", error);
    return NextResponse.json(
      { error: "Failed to fetch grants" },
      { status: 500 }
    );
  }
}
