import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateMatchScore, getTopMatches } from "@/lib/grant-matcher";

/**
 * POST /api/grants/match
 * Recalculate match scores for all grants based on user's organization profile
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's organization profile
    const organization = await prisma.organization.findUnique({
      where: { userId: session.user.id },
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

    // Fetch all grants
    const grants = await prisma.grant.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { userId: null },
        ],
      },
    });

    // Calculate match scores
    const matchResults = grants.map((grant) => {
      const result = calculateMatchScore(organization, grant);
      return {
        grantId: grant.id,
        title: grant.title,
        score: result.score,
        reasons: result.reasons,
        breakdown: result.breakdown,
      };
    });

    // Sort by score
    matchResults.sort((a, b) => b.score - a.score);

    // Get top matches
    const topMatches = getTopMatches(organization, grants, 20);

    return NextResponse.json({
      success: true,
      totalGrants: grants.length,
      matchedGrants: matchResults.filter(m => m.score >= 50).length,
      highMatches: matchResults.filter(m => m.score >= 80).length,
      topMatches: topMatches.map(g => ({
        id: g.id,
        title: g.title,
        funder: g.funder,
        score: g.matchResult.score,
        reasons: g.matchResult.reasons,
        amount: g.amount,
        deadline: g.deadline,
        state: g.state,
      })),
      profile: {
        name: organization.name,
        type: organization.type,
        state: organization.state,
        mission: organization.mission?.substring(0, 100) + (organization.mission && organization.mission.length > 100 ? '...' : ''),
      },
    });
  } catch (error) {
    console.error("Failed to calculate matches:", error);
    return NextResponse.json(
      { error: "Failed to calculate matches" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/grants/match
 * Get match analysis summary for the user
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { userId: session.user.id },
    });

    if (!organization || !organization.profileComplete) {
      return NextResponse.json({
        hasProfile: false,
        message: "Complete your organization profile to get personalized grant matches",
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

    // Get all grants and calculate summary stats
    const grants = await prisma.grant.findMany({
      where: { userId: null },
    });

    const scores = grants.map(g => calculateMatchScore(organization, g).score);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const highMatches = scores.filter(s => s >= 80).length;
    const goodMatches = scores.filter(s => s >= 60 && s < 80).length;

    return NextResponse.json({
      hasProfile: true,
      stats: {
        totalGrants: grants.length,
        averageScore: avgScore,
        highMatches,
        goodMatches,
        potentialFunding: calculatePotentialFunding(grants, scores),
      },
      profile: {
        name: organization.name,
        type: organization.type,
        state: organization.state,
      },
    });
  } catch (error) {
    console.error("Failed to get match summary:", error);
    return NextResponse.json(
      { error: "Failed to get match summary" },
      { status: 500 }
    );
  }
}

function calculatePotentialFunding(grants: { amountMax: number | null }[], scores: number[]): string {
  let total = 0;
  grants.forEach((grant, i) => {
    if (scores[i] >= 60 && grant.amountMax) {
      total += grant.amountMax;
    }
  });

  if (total >= 1000000000) {
    return `$${(total / 1000000000).toFixed(1)}B`;
  }
  if (total >= 1000000) {
    return `$${(total / 1000000).toFixed(1)}M`;
  }
  if (total >= 1000) {
    return `$${(total / 1000).toFixed(0)}K`;
  }
  return `$${total}`;
}
