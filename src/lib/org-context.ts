import { prisma } from "@/lib/db";
import { isMissingTableError } from "@/lib/api-helpers";

/**
 * Organization-context resolution for Phase 2 seat-sharing reads.
 *
 * Model summary:
 *   - Organization.userId is a 1-1 owner relation (pre-existing).
 *   - OrganizationMember adds non-owner collaborators additively.
 *
 * Read authorization pattern for Phase 2:
 *   Every read route that used `where: { userId: session.user.id }`
 *   now uses `where: { userId: { in: await getAccessibleUserIds(...) } }`.
 *   The returned list is the union of:
 *     - The caller's own userId (covers solo users + each person's
 *       private writes).
 *     - If the caller OWNS an org: every member of that org.
 *     - If the caller is a MEMBER of an org: the owner + every other
 *       member of that org.
 *   Result: everyone in a shared org sees everyone's contributions;
 *   solo users are unchanged.
 *
 * Write routes are intentionally UNCHANGED — they still write with
 * `userId: session.user.id`. That preserves authorship attribution
 * while still surfacing the row to everyone in the same org through
 * the shared-read path.
 *
 * Failure mode: if the OrganizationMember table doesn't exist yet
 * (migration pending on prod), we gracefully fall back to the single-
 * user list. No 500; reads just look exactly like Phase 1 did.
 */
export async function getAccessibleUserIds(sessionUserId: string): Promise<string[]> {
  try {
    // Single query covers all three cases via OR:
    //   (1) orgs I own → pull members' userIds
    //   (2) orgs I'm a member of → pull owner + sibling members
    // Both resolved with two queries kept side-by-side for clarity.
    const [ownedOrg, myMemberships] = await Promise.all([
      prisma.organization.findUnique({
        where: { userId: sessionUserId },
        select: {
          id: true,
          members: { select: { userId: true } },
        },
      }),
      prisma.organizationMember.findMany({
        where: { userId: sessionUserId },
        select: {
          organizationId: true,
          organization: {
            select: {
              userId: true, // owner
              members: { select: { userId: true } },
            },
          },
        },
      }),
    ]);

    const ids = new Set<string>([sessionUserId]);

    if (ownedOrg) {
      for (const m of ownedOrg.members) ids.add(m.userId);
    }

    for (const membership of myMemberships) {
      ids.add(membership.organization.userId);
      for (const sibling of membership.organization.members) {
        ids.add(sibling.userId);
      }
    }

    return Array.from(ids);
  } catch (err) {
    // Pre-migration deploy race: the tables we query don't exist yet.
    // Fall back to just the caller's own id so reads keep working as
    // Phase 1 behaved. Not a silent failure — this path is rare and
    // self-resolving once the migration runs.
    if (isMissingTableError(err)) {
      return [sessionUserId];
    }
    // Anything else is a real bug; let the caller surface a 500.
    throw err;
  }
}
