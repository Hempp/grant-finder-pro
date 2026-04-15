import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-helpers";
import { logError } from "@/lib/telemetry";
import { audit } from "@/lib/audit-log";

/** DELETE /api/org/invitations/[id] — revoke a pending invitation. */
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
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const invitation = await prisma.organizationInvitation.findUnique({
      where: { id },
      select: { id: true, organizationId: true, acceptedAt: true, revokedAt: true },
    });
    if (!invitation || invitation.organizationId !== organization.id) {
      // 404 both for "doesn't exist" and "belongs to a different org" —
      // don't leak invitation IDs across tenants.
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }
    if (invitation.acceptedAt) {
      return NextResponse.json(
        { error: "Invitation already accepted; remove the member instead." },
        { status: 409 }
      );
    }
    if (invitation.revokedAt) {
      return NextResponse.json({ success: true, alreadyRevoked: true });
    }

    await prisma.organizationInvitation.update({
      where: { id },
      data: { revokedAt: new Date() },
    });

    await audit({
      action: "org.invitation.revoked",
      userId: session.user.id,
      result: "success",
      resource: id,
      request,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    logError(err, { endpoint: "/api/org/invitations/[id]", method: "DELETE" });
    return NextResponse.json({ error: "Failed to revoke invitation" }, { status: 500 });
  }
}
