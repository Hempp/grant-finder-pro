import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireOwnership } from "@/lib/api-helpers";
import { getAccessibleUserIds } from "@/lib/org-context";
import { logError } from "@/lib/telemetry";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch single application by ID
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const { id } = await params;

  const accessibleUserIds = await getAccessibleUserIds(session.user.id);
  const owned = await requireOwnership({
    userId: session.user.id,
    resourceId: id,
    model: "application",
    accessibleUserIds,
  });
  if (owned instanceof NextResponse) return owned;

  try {
    const application = await prisma.application.findUnique({
      where: { id },
      include: { grant: true },
    });
    // Ownership already verified — belt-and-suspenders for the race where
    // the row is deleted between the ownership check and the fetch.
    if (!application) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(application);
  } catch (err) {
    logError(err, { endpoint: "/api/applications/[id]", method: "GET" });
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

// DELETE - Delete application by ID
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const { id } = await params;

  const owned = await requireOwnership({
    userId: session.user.id,
    resourceId: id,
    model: "application",
  });
  if (owned instanceof NextResponse) return owned;

  try {
    await prisma.application.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    logError(err, { endpoint: "/api/applications/[id]", method: "DELETE" });
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
