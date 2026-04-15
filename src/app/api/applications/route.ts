import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { requireAuth } from "@/lib/api-helpers";
import { logError } from "@/lib/telemetry";
import { getAccessibleUserIds } from "@/lib/org-context";

// GET - Fetch applications for current user
export async function GET(request: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Phase 2a: return applications authored by anyone in the same org
    // (owner + members), not just the caller. Writes below still attach
    // to session.user.id so authorship is preserved.
    const accessibleIds = await getAccessibleUserIds(session.user.id);

    const where: Record<string, unknown> = { userId: { in: accessibleIds } };
    if (status && status !== "all") {
      if (status === "active") {
        where.status = { in: ["draft", "in_progress", "ready_for_review"] };
      } else if (status === "completed") {
        where.status = { in: ["awarded", "rejected"] };
      } else {
        where.status = status;
      }
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        grant: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (err) {
    logError(err, { endpoint: "/api/applications", method: "GET" });
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

// POST - Create new application
export async function POST(request: NextRequest) {
  const postSession = await requireAuth();
  if (postSession instanceof NextResponse) return postSession;
  try {
    const body = await request.json();
    const userId = postSession.user.id;

    const application = await prisma.application.create({
      data: {
        userId,
        grantId: body.grantId,
        status: "draft",
        responses: body.responses ? JSON.stringify(body.responses) : null,
        narrative: body.narrative || null,
        budget: body.budget || null,
        notes: body.notes || null,
      },
      include: {
        grant: true,
      },
    });

    return NextResponse.json(application);
  } catch (err) {
    logError(err, { endpoint: "/api/applications", method: "POST" });
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}

// PATCH - Update application
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    // Verify the application belongs to the user
    const existingApp = await prisma.application.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingApp) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (existingApp.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Handle JSON fields
    if (updates.responses && typeof updates.responses === "object") {
      updates.responses = JSON.stringify(updates.responses);
    }

    // Calculate progress based on filled fields
    const progress = calculateProgress(updates);

    const application = await prisma.application.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date(),
        // Auto-set status based on progress
        status: progress === 100 ? "ready_for_review" : updates.status || "in_progress",
      },
      include: {
        grant: true,
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Failed to update application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

// DELETE - Delete application
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Application ID required" }, { status: 400 });
    }

    // Verify the application belongs to the user
    const existingApp = await prisma.application.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingApp) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (existingApp.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.application.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}

function calculateProgress(data: Record<string, unknown>): number {
  const fields = ["responses", "narrative", "budget"];
  const filled = fields.filter((f) => data[f] && String(data[f]).trim() !== "").length;
  return Math.round((filled / fields.length) * 100);
}
