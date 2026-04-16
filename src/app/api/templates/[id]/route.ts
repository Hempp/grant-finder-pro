import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireOwnership } from "@/lib/api-helpers";
import { getAccessibleUserIds } from "@/lib/org-context";

/**
 * GET /api/templates/:id
 * Returns the full template including serialized templateData so the
 * apply wizard can hydrate form state.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  const { id } = await params;

  const accessibleIds = await getAccessibleUserIds(session.user.id);
  const owned = await requireOwnership({
    userId: session.user.id,
    resourceId: id,
    model: "userApplicationTemplate",
    accessibleUserIds: accessibleIds,
  });
  if (owned instanceof NextResponse) return owned;

  const template = await prisma.userApplicationTemplate.findUnique({
    where: { id },
  });
  // requireOwnership already confirmed existence; the null check is belt-
  // and-suspenders in case of a race condition between the check and the fetch.
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  return NextResponse.json({ template });
}

/**
 * DELETE /api/templates/:id
 * Templates are embedded-data (applications already reference a copy at
 * draft time), so deletion is safe — no cascading impact on in-progress apps.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  const { id } = await params;

  const owned = await requireOwnership({
    userId: session.user.id,
    resourceId: id,
    model: "userApplicationTemplate",
  });
  if (owned instanceof NextResponse) return owned;

  await prisma.userApplicationTemplate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
