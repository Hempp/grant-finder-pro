import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch aggregated outcome insights for a grant
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Fetch all outcomes for this grant
    const outcomes = await prisma.grantOutcome.findMany({
      where: { grantId: id },
    });

    if (outcomes.length === 0) {
      return NextResponse.json({ hasData: false });
    }

    const awarded = outcomes.filter((o) => o.result === "awarded").length;
    const rejected = outcomes.filter((o) => o.result === "rejected").length;
    const total = outcomes.length;
    const awardRate = Math.round((awarded / total) * 100);

    const response: Record<string, unknown> = {
      hasData: true,
      awarded,
      rejected,
      total,
      awardRate,
    };

    // If user is authenticated, find similar org outcomes
    const session = await auth();
    if (session?.user?.id) {
      const organization = await prisma.organization.findUnique({
        where: { userId: session.user.id },
      });

      if (organization) {
        const similarOutcomes = outcomes.filter((o) => {
          let matches = 0;
          if (organization.type && o.orgType === organization.type) matches++;
          if (organization.state && o.orgState === organization.state) matches++;
          if (organization.teamSize && o.teamSize === organization.teamSize) matches++;
          return matches >= 1;
        });

        if (similarOutcomes.length >= 2) {
          const similarAwarded = similarOutcomes.filter(
            (o) => o.result === "awarded"
          ).length;
          const similarRate = Math.round(
            (similarAwarded / similarOutcomes.length) * 100
          );
          const matchBoost = similarRate - awardRate;

          let personalInsight: string;
          if (similarRate > awardRate) {
            personalInsight = `Organizations similar to yours have a ${similarRate}% award rate for this grant, which is ${matchBoost} points above average.`;
          } else if (similarRate < awardRate) {
            personalInsight = `Organizations similar to yours have a ${similarRate}% award rate for this grant, which is ${Math.abs(matchBoost)} points below the overall average of ${awardRate}%.`;
          } else {
            personalInsight = `Organizations similar to yours have the same ${similarRate}% award rate as the overall average.`;
          }

          response.similarCount = similarOutcomes.length;
          response.personalInsight = personalInsight;
          response.matchBoost = matchBoost;
        }
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch grant insights:", error);
    return NextResponse.json(
      { error: "Failed to fetch grant insights" },
      { status: 500 }
    );
  }
}
