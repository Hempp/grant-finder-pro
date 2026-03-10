import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_RESULTS = ["awarded", "rejected", "no_response"] as const;

// POST - Report outcome for an application
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { result, notes, feedback, awardAmount } = body;

    // Validate result
    if (!result || !VALID_RESULTS.includes(result)) {
      return NextResponse.json(
        { error: "Invalid result. Must be one of: awarded, rejected, no_response" },
        { status: 400 }
      );
    }

    // Verify application belongs to user
    const application = await prisma.application.findFirst({
      where: { id, userId: session.user.id },
      include: { grant: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Build update data
    const now = new Date();
    const updateData: Record<string, unknown> = {
      status: result === "no_response" ? "submitted" : result,
      outcomeReportedAt: now,
      outcomeNotes: notes || null,
      feedbackReceived: feedback || null,
    };

    if (result === "awarded") {
      updateData.awardedAt = now;
      if (awardAmount) {
        updateData.awardAmount = awardAmount;
      }
    } else if (result === "rejected") {
      updateData.rejectedAt = now;
    }

    // Update the application
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: updateData,
      include: { grant: true },
    });

    // Get user's organization for anonymized demographics
    const organization = await prisma.organization.findUnique({
      where: { userId: session.user.id },
    });

    // Create anonymized GrantOutcome record
    await prisma.grantOutcome.create({
      data: {
        grantId: application.grantId,
        orgType: organization?.type || null,
        orgState: organization?.state || null,
        teamSize: organization?.teamSize || null,
        annualRevenue: organization?.annualRevenue || null,
        result,
        appliedAt: application.submittedAt || application.createdAt,
        resultAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Failed to report outcome:", error);
    return NextResponse.json(
      { error: "Failed to report outcome" },
      { status: 500 }
    );
  }
}

// GET - Check if outcome reporting is needed
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const application = await prisma.application.findFirst({
      where: { id, userId: session.user.id },
      include: { grant: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const now = new Date();
    const deadlinePassed = application.grant.deadline
      ? new Date(application.grant.deadline) < now
      : false;

    const needsOutcome =
      application.status === "submitted" &&
      !application.outcomeReportedAt &&
      deadlinePassed;

    return NextResponse.json({
      needsOutcome,
      applicationId: application.id,
      grantTitle: application.grant.title,
      submittedAt: application.submittedAt,
      deadline: application.grant.deadline,
    });
  } catch (error) {
    console.error("Failed to check outcome status:", error);
    return NextResponse.json(
      { error: "Failed to check outcome status" },
      { status: 500 }
    );
  }
}
