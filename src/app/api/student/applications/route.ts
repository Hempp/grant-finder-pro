import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET - Fetch all StudentApplications for current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const userId = session.user.id;

    const where: Record<string, unknown> = { userId };
    if (status && status !== "all") {
      where.status = status;
    }

    const applications = await prisma.studentApplication.findMany({
      where,
      include: {
        scholarship: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Failed to fetch student applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch student applications" },
      { status: 500 }
    );
  }
}

// POST - Create new StudentApplication
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { scholarshipId } = body;
    const userId = session.user.id;

    if (!scholarshipId) {
      return NextResponse.json(
        { error: "scholarshipId is required" },
        { status: 400 }
      );
    }

    // Verify scholarship exists
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
    });

    if (!scholarship) {
      return NextResponse.json(
        { error: "Scholarship not found" },
        { status: 404 }
      );
    }

    // Check for duplicate application
    const existing = await prisma.studentApplication.findFirst({
      where: { userId, scholarshipId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already applied to this scholarship" },
        { status: 409 }
      );
    }

    // Determine successFeePercent based on user's plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    const planFeeMap: Record<string, number> = {
      free: 8,
      growth: 3,
      pro: 0,
      organization: 0,
    };
    const successFeePercent = planFeeMap[user?.plan ?? "free"] ?? 8;

    const application = await prisma.studentApplication.create({
      data: {
        userId,
        scholarshipId,
        status: "draft",
        successFeePercent,
      },
      include: {
        scholarship: true,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Failed to create student application:", error);
    return NextResponse.json(
      { error: "Failed to create student application" },
      { status: 500 }
    );
  }
}

// DELETE - Delete application by ?id= query param
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Application ID required" },
        { status: 400 }
      );
    }

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
