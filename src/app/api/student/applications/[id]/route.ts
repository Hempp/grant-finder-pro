import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET - Fetch single student application by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (application.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Failed to fetch student application:", error);
    return NextResponse.json(
      { error: "Failed to fetch student application" },
      { status: 500 }
    );
  }
}

// PATCH - Update application fields
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.studentApplication.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { essayDraft, essayFinal, status, responses, notes } = body;

    const updateData: Record<string, unknown> = {};
    if (essayDraft !== undefined) updateData.essayDraft = essayDraft;
    if (essayFinal !== undefined) updateData.essayFinal = essayFinal;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.outcomeNotes = notes;
    if (responses !== undefined) {
      updateData.responses =
        typeof responses === "object"
          ? JSON.stringify(responses)
          : responses;
    }

    const application = await prisma.studentApplication.update({
      where: { id },
      data: updateData,
      include: { scholarship: true },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Failed to update student application:", error);
    return NextResponse.json(
      { error: "Failed to update student application" },
      { status: 500 }
    );
  }
}

// DELETE - Delete single student application
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.studentApplication.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.studentApplication.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete student application:", error);
    return NextResponse.json(
      { error: "Failed to delete student application" },
      { status: 500 }
    );
  }
}
