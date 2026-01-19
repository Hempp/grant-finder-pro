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

// POST - Bulk save grants
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
      console.log("Auth check failed, continuing without session:", authError);
    }

    // Build where clause - always include public grants
    const whereClause = session?.user?.id
      ? { OR: [{ userId: session.user.id }, { userId: null }] }
      : { userId: null };

    // Fetch all grants (both user-specific and public ones)
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

    // Sort by personalized match score
    grantsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    return NextResponse.json({
      grants: grantsWithScores,
      hasProfile: !!organization?.profileComplete,
    });
  } catch (error) {
    console.error("Failed to fetch grants:", error);
    return NextResponse.json(
      { error: "Failed to fetch grants" },
      { status: 500 }
    );
  }
}
