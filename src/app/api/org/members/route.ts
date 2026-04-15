import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  requireAuth,
  isMissingTableError,
  migrationPendingResponse,
} from "@/lib/api-helpers";
import { logError } from "@/lib/telemetry";

/**
 * GET /api/org/members — list current members of the caller's org.
 *
 * The owner (Organization.userId) is surfaced as an implicit member
 * with role="owner" at the top of the list. Invitations are served
 * by /api/org/invitations; this endpoint is strictly for ACCEPTED
 * memberships.
 *
 * Both owners and members can list — a member should be able to see
 * who else is on the team. Only owners can mutate (DELETE).
 */
export async function GET() {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  try {
    // Resolve the caller's org: either they own one, or they're a
    // member of exactly one (Phase 2a assumption — single-org
    // membership, enforced by the @@unique on OrganizationMember).
    const [ownedOrg, membership] = await Promise.all([
      prisma.organization.findUnique({
        where: { userId: session.user.id },
        select: { id: true, userId: true, name: true },
      }),
      prisma.organizationMember.findFirst({
        where: { userId: session.user.id },
        select: {
          organization: { select: { id: true, userId: true, name: true } },
        },
      }),
    ]);

    const org = ownedOrg ?? membership?.organization ?? null;
    if (!org) {
      return NextResponse.json({ members: [], organization: null });
    }

    const [owner, members] = await Promise.all([
      prisma.user.findUnique({
        where: { id: org.userId },
        select: { id: true, email: true, name: true, image: true },
      }),
      prisma.organizationMember.findMany({
        where: { organizationId: org.id },
        select: {
          id: true,
          role: true,
          joinedAt: true,
          user: {
            select: { id: true, email: true, name: true, image: true },
          },
        },
        orderBy: { joinedAt: "asc" },
      }),
    ]);

    return NextResponse.json({
      organization: { id: org.id, name: org.name },
      isOwner: session.user.id === org.userId,
      members: [
        ...(owner
          ? [
              {
                id: `owner:${owner.id}`,
                role: "owner" as const,
                user: owner,
                joinedAt: null,
              },
            ]
          : []),
        ...members,
      ],
    });
  } catch (err) {
    if (isMissingTableError(err)) return migrationPendingResponse("Team membership");
    logError(err, { endpoint: "/api/org/members", method: "GET" });
    return NextResponse.json({ error: "Failed to load members" }, { status: 500 });
  }
}
