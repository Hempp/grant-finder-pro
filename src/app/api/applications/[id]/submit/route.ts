import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendApplicationConfirmationEmail } from "@/lib/email";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST - Submit an application (transition from ready_for_review → submitted)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

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

    // Only allow submission from appropriate statuses
    if (!["ready_for_review", "in_progress"].includes(application.status)) {
      return NextResponse.json(
        {
          error: `Cannot submit application with status "${application.status}". Must be "ready_for_review" or "in_progress".`,
        },
        { status: 400 }
      );
    }

    const now = new Date();

    // Generate a confirmation number
    const confirmationNumber = generateConfirmationNumber(application.id, now);

    // Update application status to submitted
    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: "submitted",
        submittedAt: now,
        notes: application.notes
          ? `${application.notes}\n\nSubmitted: ${now.toISOString()} | Confirmation: ${confirmationNumber}`
          : `Submitted: ${now.toISOString()} | Confirmation: ${confirmationNumber}`,
      },
      include: {
        grant: true,
        draft: {
          select: {
            completionScore: true,
            overallConfidence: true,
          },
        },
      },
    });

    // Send confirmation email (non-blocking)
    const userEmail = session.user.email;
    const userName = session.user.name || undefined;
    if (userEmail) {
      sendApplicationConfirmationEmail(userEmail, {
        userName,
        grantTitle: updated.grant.title,
        funder: updated.grant.funder || "Unknown Funder",
        confirmationNumber,
        submittedAt: now,
        completionScore: updated.draft?.completionScore || null,
        confidenceScore: updated.draft?.overallConfidence || null,
        grantAmount: updated.grant.amount,
        deadline: updated.grant.deadline,
        applicationId: updated.id,
      }).catch((err) => {
        console.error("Failed to send confirmation email:", err);
      });
    }

    return NextResponse.json({
      ...updated,
      confirmationNumber,
      message: `Application submitted successfully. Confirmation: ${confirmationNumber}`,
    });
  } catch (error) {
    console.error("Failed to submit application:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}

function generateConfirmationNumber(applicationId: string, date: Date): string {
  const prefix = "GP";
  const datePart = date.toISOString().slice(2, 10).replace(/-/g, "");
  const idPart = applicationId.slice(-6).toUpperCase();
  return `${prefix}-${datePart}-${idPart}`;
}
