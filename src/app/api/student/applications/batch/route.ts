import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateScholarshipEssay } from "@/lib/smart-fill/essay-adapter";
import { checkOutcomeGate } from "@/lib/student/outcome-gate";
import { getStudentLimits, getStudentFeePercent } from "@/lib/stripe";

// POST - Batch draft applications for multiple scholarships
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const gate = await checkOutcomeGate(userId);
    if (gate.gated) {
      return NextResponse.json({
        error: "outcome_gate",
        message: `Report outcomes for ${gate.overdueCount} past-deadline applications before submitting new ones.`,
        overdueApplications: gate.applications,
      }, { status: 403 });
    }

    const body = await request.json();
    const { scholarshipIds } = body as { scholarshipIds: unknown };

    // Validate input
    if (!Array.isArray(scholarshipIds) || scholarshipIds.length === 0) {
      return NextResponse.json(
        { error: "scholarshipIds must be a non-empty array" },
        { status: 400 }
      );
    }

    if (scholarshipIds.length > 20) {
      return NextResponse.json(
        { error: "Cannot batch more than 20 scholarships at a time" },
        { status: 400 }
      );
    }

    // Fetch user (for plan → fee percent + usage limits)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, autoApplyUsedThisMonth: true, usageResetDate: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Enforce monthly auto-apply limit
    const studentLimits = getStudentLimits(user.plan);
    const usedThisMonth = user.autoApplyUsedThisMonth || 0;
    const remaining = studentLimits.autoApplyPerMonth - usedThisMonth;

    if (remaining <= 0) {
      return NextResponse.json({
        error: "Monthly limit reached",
        message: `You've used all ${studentLimits.autoApplyPerMonth} auto-apply drafts this month. ${user.plan === "free" ? "Upgrade to Student Pro for 25/month." : "Your limit resets next billing cycle."}`,
        limit: studentLimits.autoApplyPerMonth,
        used: usedThisMonth,
      }, { status: 429 });
    }

    // Cap batch size to remaining quota
    const allowedCount = Math.min(scholarshipIds.length, remaining);
    const idsToProcess = (scholarshipIds as string[]).slice(0, allowedCount);

    const successFeePercent = getStudentFeePercent(user.plan);

    // Fetch student profile
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found. Please complete your profile first." },
        { status: 422 }
      );
    }

    // Fetch content blocks
    const contentBlocks = await prisma.contentBlock.findMany({
      where: { userId },
    });

    // Fetch scholarships (only process up to the allowed count)
    const scholarships = await prisma.scholarship.findMany({
      where: { id: { in: idsToProcess } },
    });

    if (scholarships.length === 0) {
      return NextResponse.json(
        { error: "No matching scholarships found" },
        { status: 404 }
      );
    }

    // Map profile to essay-adapter shape
    const profileForEssay = {
      firstName: studentProfile.firstName ?? "",
      lastName: studentProfile.lastName ?? "",
      major: studentProfile.major,
      fieldOfStudy: studentProfile.fieldOfStudy,
      careerGoal: studentProfile.careerGoal,
      schoolName: studentProfile.schoolName ?? "",
      educationLevel: studentProfile.educationLevel ?? "",
    };

    // Map content blocks to essay-adapter shape
    const blocksForEssay = contentBlocks.map((b) => ({
      category: b.category,
      title: b.title,
      content: b.content,
    }));

    // Process each scholarship sequentially to avoid rate limits
    const results: Array<{
      id: string;
      scholarshipId: string;
      essayDraft: string | null;
      status: string;
      wordCount: number;
    }> = [];

    let drafted = 0;

    for (const scholarship of scholarships) {
      // Check for existing application
      let application = await prisma.studentApplication.findFirst({
        where: { userId, scholarshipId: scholarship.id },
      });

      // Create if not exists
      if (!application) {
        application = await prisma.studentApplication.create({
          data: {
            userId,
            scholarshipId: scholarship.id,
            status: "draft",
            successFeePercent,
          },
        });
      }

      // Generate essay
      let essayDraft: string | null = null;
      let wordCount = 0;

      try {
        const result = await generateScholarshipEssay({
          essayPrompt:
            scholarship.essayPrompt ||
            "Tell us about yourself and why you deserve this scholarship.",
          wordLimit: scholarship.essayWordLimit || 500,
          scholarshipTitle: scholarship.title,
          scholarshipProvider: scholarship.provider,
          scholarshipDescription: scholarship.description,
          studentProfile: profileForEssay,
          contentBlocks: blocksForEssay,
        });

        essayDraft = result.essay;
        wordCount = result.wordCount;

        // Update application with generated essay
        application = await prisma.studentApplication.update({
          where: { id: application.id },
          data: { essayDraft },
        });

        drafted++;
      } catch (essayError) {
        console.error(
          `Failed to generate essay for scholarship ${scholarship.id}:`,
          essayError
        );
        // Continue processing remaining scholarships even if one fails
      }

      results.push({
        id: application.id,
        scholarshipId: scholarship.id,
        essayDraft: application.essayDraft ?? essayDraft,
        status: application.status,
        wordCount,
      });
    }

    // Increment monthly usage counter
    if (drafted > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { autoApplyUsedThisMonth: { increment: drafted } },
      });
    }

    return NextResponse.json({
      drafted,
      applications: results,
      usage: {
        used: usedThisMonth + drafted,
        limit: studentLimits.autoApplyPerMonth,
        remaining: remaining - drafted,
      },
    });
  } catch (error) {
    console.error("Failed to batch draft applications:", error);
    return NextResponse.json(
      { error: "Failed to batch draft applications" },
      { status: 500 }
    );
  }
}
