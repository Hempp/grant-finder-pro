import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  generateApplication,
  determineFunderType,
  gatherUserContext,
} from "@/lib/auto-apply/grant-writer";
import { GrantContext, UserContext } from "@/lib/auto-apply/types";
import { PLANS, PlanType } from "@/lib/stripe";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST - Generate AI application draft
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    // Check subscription and usage limits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        autoApplyUsedThisMonth: true,
        usageResetDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const plan = (user.plan as PlanType) || "free";
    const planLimits = PLANS[plan].limits;

    // Check if user has auto-apply access
    if (planLimits.autoApplyPerMonth === 0) {
      return NextResponse.json(
        {
          error: "Auto-Apply requires a Pro or Teams subscription",
          code: "UPGRADE_REQUIRED"
        },
        { status: 403 }
      );
    }

    // Check if user has reached their limit (if not unlimited)
    if (planLimits.autoApplyPerMonth !== -1) {
      // Check if usage needs reset
      const now = new Date();
      const resetDate = user.usageResetDate ? new Date(user.usageResetDate) : now;
      const daysSinceReset = Math.floor(
        (now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      let currentUsage = user.autoApplyUsedThisMonth;

      // Reset usage if needed
      if (daysSinceReset >= 30) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            autoApplyUsedThisMonth: 0,
            usageResetDate: now,
          },
        });
        currentUsage = 0;
      }

      if (currentUsage >= planLimits.autoApplyPerMonth) {
        return NextResponse.json(
          {
            error: `You've used all ${planLimits.autoApplyPerMonth} Auto-Apply drafts this month. Upgrade to Teams for unlimited.`,
            code: "LIMIT_REACHED",
            used: currentUsage,
            limit: planLimits.autoApplyPerMonth
          },
          { status: 403 }
        );
      }
    }

    // Fetch the application with grant details
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        grant: true,
        draft: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Gather user context (organization profile, documents, previous applications)
    const [organization, documents, previousApplications] = await Promise.all([
      prisma.organization.findUnique({
        where: { userId },
      }),
      prisma.document.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          type: true,
          parsedData: true,
        },
      }),
      prisma.application.findMany({
        where: {
          userId,
          status: { in: ["submitted", "awarded"] },
          id: { not: id }, // Exclude current application
        },
        include: {
          grant: {
            select: { title: true },
          },
        },
        take: 5, // Use last 5 submitted applications for context
        orderBy: { submittedAt: "desc" },
      }),
    ]);

    // Build user context
    const userContext: UserContext = await gatherUserContext(
      organization
        ? {
            name: organization.name,
            type: organization.type,
            legalStructure: organization.legalStructure,
            ein: organization.ein,
            website: organization.website,
            city: organization.city,
            state: organization.state,
            mission: organization.mission,
            vision: organization.vision,
            problemStatement: organization.problemStatement,
            solution: organization.solution,
            targetMarket: organization.targetMarket,
            teamSize: organization.teamSize,
            founderBackground: organization.founderBackground,
            annualRevenue: organization.annualRevenue,
            fundingSeeking: organization.fundingSeeking,
            previousFunding: organization.previousFunding,
          }
        : null,
      documents.map((doc) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        parsedData: doc.parsedData,
      })),
      previousApplications.map((app) => ({
        id: app.id,
        grantTitle: app.grant.title,
        narrative: app.narrative,
        responses: app.responses,
        status: app.status,
      }))
    );

    // Build grant context
    const grant = application.grant;
    const grantContext: GrantContext = {
      id: grant.id,
      title: grant.title,
      funder: grant.funder,
      description: grant.description,
      amount: grant.amount,
      amountMin: grant.amountMin,
      amountMax: grant.amountMax,
      deadline: grant.deadline,
      type: grant.type,
      category: grant.category,
      eligibility: grant.eligibility,
      requirements: grant.requirements,
      url: grant.url,
    };

    // Generate the application
    const result = await generateApplication(grantContext, userContext);

    // Save or update the draft
    const funderType = determineFunderType(grantContext);

    const draft = await prisma.applicationDraft.upsert({
      where: { applicationId: id },
      update: {
        sections: JSON.stringify(result.sections),
        responses: JSON.stringify(result.responses),
        completionScore: result.completionScore,
        overallConfidence: result.overallConfidence,
        missingRequirements: JSON.stringify(result.missingRequirements),
        funderType,
        lastEditedAt: new Date(),
      },
      create: {
        applicationId: id,
        sections: JSON.stringify(result.sections),
        responses: JSON.stringify(result.responses),
        completionScore: result.completionScore,
        overallConfidence: result.overallConfidence,
        missingRequirements: JSON.stringify(result.missingRequirements),
        funderType,
      },
    });

    // Update application status and increment usage counter
    await Promise.all([
      prisma.application.update({
        where: { id },
        data: {
          status: result.completionScore >= 80 ? "ready_for_review" : "in_progress",
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          autoApplyUsedThisMonth: { increment: 1 },
        },
      }),
    ]);

    return NextResponse.json({
      draft: {
        id: draft.id,
        applicationId: draft.applicationId,
        sections: result.sections,
        responses: result.responses,
        completionScore: result.completionScore,
        overallConfidence: result.overallConfidence,
        missingRequirements: result.missingRequirements,
        suggestions: result.suggestions,
        funderType,
        generatedAt: draft.generatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to generate application:", error);
    return NextResponse.json(
      { error: "Failed to generate application draft" },
      { status: 500 }
    );
  }
}
