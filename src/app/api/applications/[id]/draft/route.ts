import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { regenerateSection, gatherUserContext, determineFunderType } from "@/lib/auto-apply/grant-writer";
import { ApplicationSection, GrantContext, UserContext, ResponseData } from "@/lib/auto-apply/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch draft for an application
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch application with draft
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

    if (application.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!application.draft) {
      return NextResponse.json({ error: "No draft found. Generate one first." }, { status: 404 });
    }

    const draft = application.draft;

    return NextResponse.json({
      id: draft.id,
      applicationId: draft.applicationId,
      sections: JSON.parse(draft.sections),
      responses: JSON.parse(draft.responses),
      completionScore: draft.completionScore,
      overallConfidence: draft.overallConfidence,
      missingRequirements: draft.missingRequirements ? JSON.parse(draft.missingRequirements) : [],
      funderType: draft.funderType,
      generatedAt: draft.generatedAt,
      lastEditedAt: draft.lastEditedAt,
      grant: application.grant,
    });
  } catch (error) {
    console.error("Failed to fetch draft:", error);
    return NextResponse.json({ error: "Failed to fetch draft" }, { status: 500 });
  }
}

// PATCH - Update draft (edit responses)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { sectionId, content, regenerate, customInstructions } = body;

    // Fetch application with draft
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

    if (application.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!application.draft) {
      return NextResponse.json({ error: "No draft found" }, { status: 404 });
    }

    const draft = application.draft;
    const sections: ApplicationSection[] = JSON.parse(draft.sections);
    const responses: Record<string, ResponseData> = JSON.parse(draft.responses);

    // Find the section
    const section = sections.find((s) => s.id === sectionId);
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    // If regenerate is requested, use AI to regenerate the section
    if (regenerate) {
      const userId = session.user.id;

      // Gather fresh context
      const [organization, documents, previousApplications] = await Promise.all([
        prisma.organization.findUnique({ where: { userId } }),
        prisma.document.findMany({
          where: { userId },
          select: { id: true, name: true, type: true, parsedData: true },
        }),
        prisma.application.findMany({
          where: {
            userId,
            status: { in: ["submitted", "awarded"] },
            id: { not: id },
          },
          include: { grant: { select: { title: true } } },
          take: 5,
          orderBy: { submittedAt: "desc" },
        }),
      ]);

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

      const newResponse = await regenerateSection(
        section,
        grantContext,
        userContext,
        customInstructions
      );

      responses[sectionId] = newResponse;
    } else {
      // Manual edit
      const currentResponse = responses[sectionId];
      const wordCount = content.split(/\s+/).length;

      responses[sectionId] = {
        ...currentResponse,
        content,
        userEdited: true,
        wordCount,
        // Boost confidence when user edits
        confidenceScore: Math.min(100, (currentResponse?.confidenceScore || 50) + 15),
        needsUserInput: false,
        userInputPrompt: undefined,
      };
    }

    // Recalculate completion score
    const completedSections = Object.values(responses).filter(
      (r) => r.content && !r.needsUserInput
    );
    const completionScore = Math.round((completedSections.length / sections.length) * 100);

    // Calculate average confidence
    const confidenceScores = Object.values(responses).map(
      (r) => r.confidenceScore || 0
    );
    const overallConfidence = Math.round(
      confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
    );

    // Find missing requirements
    const missingRequirements = sections
      .filter((s) => {
        const resp = responses[s.id];
        return s.required && (!resp?.content || resp.needsUserInput);
      })
      .map((s) => s.title);

    // Update the draft
    await prisma.applicationDraft.update({
      where: { id: draft.id },
      data: {
        responses: JSON.stringify(responses),
        completionScore,
        overallConfidence,
        missingRequirements: JSON.stringify(missingRequirements),
        lastEditedAt: new Date(),
      },
    });

    // Update application status based on completion
    await prisma.application.update({
      where: { id },
      data: {
        status: completionScore >= 80 ? "ready_for_review" : "in_progress",
      },
    });

    return NextResponse.json({
      success: true,
      sectionId,
      response: responses[sectionId],
      completionScore,
      overallConfidence,
      missingRequirements,
    });
  } catch (error) {
    console.error("Failed to update draft:", error);
    return NextResponse.json({ error: "Failed to update draft" }, { status: 500 });
  }
}

// DELETE - Delete draft
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch application
    const application = await prisma.application.findUnique({
      where: { id },
      include: { draft: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!application.draft) {
      return NextResponse.json({ error: "No draft found" }, { status: 404 });
    }

    await prisma.applicationDraft.delete({
      where: { id: application.draft.id },
    });

    // Reset application status
    await prisma.application.update({
      where: { id },
      data: { status: "draft" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete draft:", error);
    return NextResponse.json({ error: "Failed to delete draft" }, { status: 500 });
  }
}
