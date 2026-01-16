import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateMatchScore } from "@/lib/grant-matcher";

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
