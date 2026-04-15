import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseJson, requireAuth } from "@/lib/api-helpers";
import { logError, logEvent } from "@/lib/telemetry";
import { audit } from "@/lib/audit-log";
import { hashInvitationToken } from "@/lib/invitation-token";

/**
 * POST /api/org/invitations/accept — consume a token and create the
 * OrganizationMember row.
 *
 * The accept flow is intentionally split into two network hops:
 *   1. /invite/accept?token=X (page) — checks session, either accepts
 *      or redirects to /signup with ?invite=X carried through.
 *   2. POST /api/org/invitations/accept (this route) — the actual
 *      mutation, invoked from the page once the user is authenticated
 *      and has confirmed the invitation summary.
 *
 * Hashing the token on lookup means a DB dump can't be replayed.
 */
export async function POST(request: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const body = await parseJson<{ token?: string }>(request);
  if (body instanceof NextResponse) return body;

  const token = (body.token ?? "").trim();
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  try {
    const tokenHash = hashInvitationToken(token);
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        organizationId: true,
        email: true,
        role: true,
        expiresAt: true,
        acceptedAt: true,
        revokedAt: true,
        invitedById: true,
      },
    });

    // Uniform error for "not found" / "revoked" / "expired" / "accepted"
    // so a token-harvesting attacker can't distinguish states.
    const invalid = () =>
      NextResponse.json({ error: "Invitation is invalid or expired." }, { status: 400 });

    if (!invitation) return invalid();
    if (invitation.revokedAt) return invalid();
    if (invitation.acceptedAt) return invalid();
    if (invitation.expiresAt.getTime() < Date.now()) return invalid();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });
    if (!user?.email) return invalid();

    // Case-insensitive match on invitation email vs session email.
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      await audit({
        action: "authz.denied",
        userId: session.user.id,
        result: "failure",
        resource: invitation.id,
        metadata: { reason: "invitation_email_mismatch" },
        request,
      });
      return NextResponse.json(
        {
          error:
            "This invitation was sent to a different email. Sign in with that email to accept.",
        },
        { status: 403 }
      );
    }

    // Atomically: create the member row + mark invitation accepted.
    // Using upsert on the member so a duplicate click doesn't 500;
    // the @@unique([organizationId, userId]) guarantees no dupes.
    await prisma.$transaction([
      prisma.organizationMember.upsert({
        where: {
          organizationId_userId: {
            organizationId: invitation.organizationId,
            userId: session.user.id,
          },
        },
        create: {
          organizationId: invitation.organizationId,
          userId: session.user.id,
          role: invitation.role,
          invitedById: invitation.invitedById,
        },
        update: {
          // If somehow already a member (e.g., manual seed), upgrade
          // role to the invitation's role rather than silently ignore.
          role: invitation.role,
        },
      }),
      prisma.organizationInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      }),
    ]);

    await audit({
      action: "org.invitation.accepted",
      userId: session.user.id,
      result: "success",
      resource: invitation.id,
      metadata: { organizationId: invitation.organizationId, role: invitation.role },
      request,
    });

    logEvent("org.invitation.accepted", {
      organizationId: invitation.organizationId,
      role: invitation.role,
    });

    return NextResponse.json({
      success: true,
      organizationId: invitation.organizationId,
      role: invitation.role,
    });
  } catch (err) {
    logError(err, { endpoint: "/api/org/invitations/accept", method: "POST" });
    return NextResponse.json({ error: "Failed to accept invitation" }, { status: 500 });
  }
}
