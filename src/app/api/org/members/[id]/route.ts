import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  requireAuth,
  isMissingTableError,
  migrationPendingResponse,
} from "@/lib/api-helpers";
import { logError } from "@/lib/telemetry";
import { audit } from "@/lib/audit-log";

/**
 * DELETE /api/org/members/[id] — remove a member from the caller's org.
 *
 * Only the org owner can remove a member. The owner's own seat is not
 * removable (they must delete/transfer the org itself). A removed
 * member keeps their account + any resources they authored (userId
 * attribution is preserved); they just lose pool access to the org's
 * shared reads.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const { id } = await params;

  try {
    const organization = await prisma.organization.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!organization) {
      // Either the caller isn't an owner, or they have no org at all.
      // Both cases collapse to 403 — we don't need to distinguish.
      return NextResponse.json(
        { error: "Only the organization owner can remove members." },
        { status: 403 }
      );
    }

    const member = await prisma.organizationMember.findUnique({
      where: { id },
      select: { id: true, organizationId: true, userId: true, role: true },
    });
    if (!member || member.organizationId !== organization.id) {
      // 404 both for "doesn't exist" and "belongs to a different org"
      // to avoid cross-tenant membership enumeration.
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    await prisma.organizationMember.delete({ where: { id } });

    await audit({
      action: "org.member.removed",
      userId: session.user.id,
      result: "success",
      resource: id,
      metadata: {
        removedUserId: member.userId,
        role: member.role,
        organizationId: organization.id,
      },
      request,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (isMissingTableError(err)) return migrationPendingResponse("Team membership");
    logError(err, { endpoint: "/api/org/members/[id]", method: "DELETE" });
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
