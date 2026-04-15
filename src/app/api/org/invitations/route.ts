import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseJson, requireAuth } from "@/lib/api-helpers";
import { rateLimit } from "@/lib/rate-limit";
import { logError, logEvent } from "@/lib/telemetry";
import { audit } from "@/lib/audit-log";
import {
  generateInvitationToken,
  invitationExpiry,
  isValidRole,
  INVITATION_ROLES,
} from "@/lib/invitation-token";
import { sendOrganizationInvitationEmail } from "@/lib/email";

/**
 * Team seat invitations. Only the organization owner (Organization.userId)
 * may issue invitations — the additive OrganizationMember model lets
 * non-owner collaborators exist without disturbing the 1-1 owner relation
 * the rest of the codebase relies on.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://grantpilot.ai";

/** GET /api/org/invitations — list outstanding + accepted invitations for the owner's org. */
export async function GET(request: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  try {
    const organization = await prisma.organization.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const invitations = await prisma.organizationInvitation.findMany({
      where: { organizationId: organization.id },
      select: {
        id: true,
        email: true,
        role: true,
        expiresAt: true,
        acceptedAt: true,
        revokedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ invitations });
  } catch (err) {
    logError(err, { endpoint: "/api/org/invitations", method: "GET" });
    return NextResponse.json({ error: "Failed to load invitations" }, { status: 500 });
    void request;
  }
}

/** POST /api/org/invitations — issue a new invitation. */
export async function POST(request: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  // auth bucket — invitations are identity-sensitive enough to
  // warrant the tighter ceiling.
  const rateLimitResult = await rateLimit("auth", `user:${session.user.id}`);
  if (!rateLimitResult.success && rateLimitResult.response) {
    return rateLimitResult.response;
  }

  const body = await parseJson<{ email?: string; role?: string }>(request);
  if (body instanceof NextResponse) return body;

  const email = (body.email ?? "").trim().toLowerCase();
  const role = (body.role ?? "editor").trim().toLowerCase();

  // Basic RFC 5322-lite shape check; we're not aiming for perfect
  // validity, just rejecting obvious junk before spending a send.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  if (!isValidRole(role)) {
    return NextResponse.json(
      { error: `Role must be one of: ${INVITATION_ROLES.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const organization = await prisma.organization.findUnique({
      where: { userId: session.user.id },
      select: { id: true, name: true },
    });
    if (!organization) {
      return NextResponse.json(
        { error: "Complete your organization profile before inviting teammates." },
        { status: 400 }
      );
    }

    // Prevent inviting a user who's already the owner or an active member.
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingUser?.id === session.user.id) {
      return NextResponse.json({ error: "You're already the owner." }, { status: 400 });
    }
    if (existingUser) {
      const existingMember = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: organization.id,
            userId: existingUser.id,
          },
        },
        select: { id: true },
      });
      if (existingMember) {
        return NextResponse.json(
          { error: "That user is already a member of your organization." },
          { status: 409 }
        );
      }
    }

    // Revoke any prior pending invitation to the same email so the
    // invitee always has one live link at a time.
    await prisma.organizationInvitation.updateMany({
      where: {
        organizationId: organization.id,
        email,
        acceptedAt: null,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    const { token, tokenHash } = generateInvitationToken();
    const expiresAt = invitationExpiry();

    const invitation = await prisma.organizationInvitation.create({
      data: {
        organizationId: organization.id,
        email,
        role,
        tokenHash,
        invitedById: session.user.id,
        expiresAt,
      },
      select: {
        id: true,
        email: true,
        role: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    const acceptUrl = `${APP_URL}/invite/accept?token=${token}`;

    const inviter = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });

    await sendOrganizationInvitationEmail({
      to: email,
      inviterName: inviter?.name ?? null,
      organizationName: organization.name,
      role,
      acceptUrl,
      expiresAt,
    });

    await audit({
      action: "org.invitation.created",
      userId: session.user.id,
      result: "success",
      resource: invitation.id,
      metadata: { email, role, organizationId: organization.id },
      request,
    });

    logEvent("org.invitation.created", {
      organizationId: organization.id,
      role,
    });

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (err) {
    logError(err, { endpoint: "/api/org/invitations", method: "POST" });
    return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 });
  }
}
