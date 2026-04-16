import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  isMissingTableError,
  migrationPendingResponse,
} from "@/lib/api-helpers";
import { logError } from "@/lib/telemetry";
import { hashInvitationToken } from "@/lib/invitation-token";

/**
 * GET /api/org/invitations/preview?token=X
 *
 * Unauthenticated endpoint — the accept-page shows invitation details
 * (org name, inviter, role) before the invitee signs up/in so they know
 * what they're accepting. This is the conversion lift over a blind
 * "Accept invitation" button.
 *
 * We deliberately return the SAME response for every failure mode
 * (not-found / expired / revoked / already-accepted):
 *
 *     { valid: false }
 *
 * That prevents token-harvesting attackers from distinguishing
 * "this token doesn't exist" from "this token is consumed." The email
 * invitee doesn't need that granularity — they either see the preview
 * or get a generic "invitation is invalid or expired" message.
 *
 * No DB mutation. No session required. No rate-limit needed beyond
 * the global one the auth bucket already provides — tokens are
 * 256-bit base64url so brute-force is infeasible.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = (url.searchParams.get("token") ?? "").trim();
  if (!token) {
    return NextResponse.json({ valid: false }, { status: 200 });
  }

  try {
    const tokenHash = hashInvitationToken(token);
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { tokenHash },
      select: {
        email: true,
        role: true,
        expiresAt: true,
        acceptedAt: true,
        revokedAt: true,
        organization: { select: { name: true } },
        invitedBy: { select: { name: true, email: true } },
      },
    });

    if (
      !invitation ||
      invitation.revokedAt ||
      invitation.acceptedAt ||
      invitation.expiresAt.getTime() < Date.now()
    ) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    return NextResponse.json({
      valid: true,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt.toISOString(),
      organizationName: invitation.organization.name,
      inviterName: invitation.invitedBy?.name ?? null,
      inviterEmail: invitation.invitedBy?.email ?? null,
    });
  } catch (err) {
    if (isMissingTableError(err)) return migrationPendingResponse("Team invitations");
    logError(err, { endpoint: "/api/org/invitations/preview", method: "GET" });
    // Uniform error shape — don't leak internal state to the invitee.
    return NextResponse.json({ valid: false }, { status: 200 });
  }
}
