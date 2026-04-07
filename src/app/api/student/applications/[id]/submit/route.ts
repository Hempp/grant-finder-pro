import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendApplicationConfirmationEmail } from "@/lib/email";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST - Submit a student application (transition from draft/ready → submitted)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const application = await prisma.studentApplication.findUnique({
      where: { id },
      include: { scholarship: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only allow submission from draft or ready statuses
    if (!["draft", "ready"].includes(application.status)) {
      return NextResponse.json(
        {
          error: `Cannot submit application with status "${application.status}". Must be "draft" or "ready".`,
        },
        { status: 400 }
      );
    }

    const now = new Date();

    // Generate confirmation number: GP-YYMMDD-LAST6OFID
    const datePart = now.toISOString().slice(2, 10).replace(/-/g, "");
    const idPart = id.slice(-6).toUpperCase();
    const confirmationNumber = `GP-${datePart}-${idPart}`;

    // Update application status to submitted
    const updated = await prisma.studentApplication.update({
      where: { id },
      data: {
        status: "submitted",
        submittedAt: now,
        essayFinal: application.essayFinal || application.essayDraft,
        confirmationNumber,
        submissionMethod: application.scholarship.submissionMethod,
      },
    });

    // Send confirmation email (non-blocking)
    const userEmail = session.user.email;
    const userName = session.user.name || undefined;
    if (userEmail) {
      sendApplicationConfirmationEmail(userEmail, {
        userName,
        grantTitle: application.scholarship.title,
        funder: application.scholarship.provider,
        confirmationNumber,
        submittedAt: now,
        completionScore: null,
        confidenceScore: null,
        grantAmount: application.scholarship.amount,
        deadline: application.scholarship.deadline,
        applicationId: id,
      }).catch(console.error);
    }

    return NextResponse.json({
      ...updated,
      confirmationNumber,
      message: `Application submitted successfully. Confirmation: ${confirmationNumber}`,
    });
  } catch (error) {
    console.error("Failed to submit student application:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
