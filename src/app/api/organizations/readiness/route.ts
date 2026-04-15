import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getAccessibleUserIds } from "@/lib/org-context";
import {
  calculateReadinessScore,
  type OrganizationData,
  type DocumentSummary,
  type ReadinessResult,
} from "@/lib/readiness-score";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Phase 2a: members see the OWNER's readiness — there's one
    // organization per team, not per user. findFirst across all
    // accessible userIds picks up the owner's org if the caller is
    // a member, else the caller's own org.
    const accessibleIds = await getAccessibleUserIds(userId);
    const org = await prisma.organization.findFirst({
      where: { userId: { in: accessibleIds } },
    });

    if (!org) {
      const emptyResult: ReadinessResult = {
        score: 0,
        breakdown: {
          profile: { score: 0, weight: 0.2, details: [] },
          documents: { score: 0, weight: 0.2, details: [] },
          financial: { score: 0, weight: 0.15, details: [] },
          team: { score: 0, weight: 0.15, details: [] },
          trackRecord: { score: 0, weight: 0.15, details: [] },
          applicationHistory: { score: 0, weight: 0.15, details: [] },
        },
        actions: [
          { priority: "high", action: "Complete your organization profile" },
        ],
      };
      return NextResponse.json(emptyResult);
    }

    // Fetch documents summary across the whole org pool so a member's
    // uploaded financials count toward the owner's readiness (and vice
    // versa). Solo users are unaffected — accessibleIds is [userId].
    const documents = await prisma.document.findMany({
      where: { userId: { in: accessibleIds } },
      select: { type: true },
    });

    const docTypes = new Set(documents.map((d) => d.type));
    const docs: DocumentSummary = {
      hasPitchDeck: docTypes.has("pitch_deck"),
      hasFinancials: docTypes.has("financials"),
      hasBusinessPlan: docTypes.has("business_plan"),
      totalDocuments: documents.length,
    };

    // Fetch application stats across the org pool — same rationale as
    // documents above (a member's awarded grant counts toward the
    // team track record).
    const [totalApps, awardedApps] = await Promise.all([
      prisma.application.count({ where: { userId: { in: accessibleIds } } }),
      prisma.application.count({
        where: { userId: { in: accessibleIds }, status: "awarded" },
      }),
    ]);

    const orgData: OrganizationData = {
      name: org.name,
      type: org.type,
      ein: org.ein,
      legalStructure: org.legalStructure,
      mission: org.mission,
      teamSize: org.teamSize,
      annualRevenue: org.annualRevenue,
      state: org.state,
      founderBackground: org.founderBackground,
      fundingSeeking: org.fundingSeeking,
      previousFunding: org.previousFunding,
    };

    const result = calculateReadinessScore(orgData, docs, {
      total: totalApps,
      awarded: awardedApps,
    });

    // Cache the result on the Organization row we actually fetched
    // (may belong to the owner, not the session user). Using org.id
    // keeps the update unambiguous when a member recalculates.
    await prisma.organization.update({
      where: { id: org.id },
      data: {
        readinessScore: result.score,
        readinessDetails: JSON.stringify(result.breakdown),
        lastAssessedAt: new Date(),
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to calculate readiness score:", error);
    return NextResponse.json(
      { error: "Failed to calculate readiness score" },
      { status: 500 }
    );
  }
}
