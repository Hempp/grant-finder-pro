import { createHash, randomBytes } from "crypto";

/**
 * Generate a URL-safe invitation token + its sha256 hash.
 *
 * Store the hash in the database; send the raw token only in the email
 * link. On accept, hash the incoming token and look up by hash. This
 * ensures a database dump alone is insufficient to forge an accepted
 * invitation.
 */
export function generateInvitationToken(): { token: string; tokenHash: string } {
  // 32 bytes = 256 bits of entropy; base64url keeps it URL-safe without
  // percent-encoding artifacts in the email link.
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashInvitationToken(token) };
}

export function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Default TTL: 14 days — long enough for holiday inboxes, short
 *  enough that a stale leaked email isn't a forever foothold. */
export const INVITATION_TTL_DAYS = 14;

export function invitationExpiry(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + INVITATION_TTL_DAYS);
  return d;
}

export const INVITATION_ROLES = ["admin", "editor", "viewer"] as const;
export type InvitationRole = (typeof INVITATION_ROLES)[number];

export function isValidRole(role: string): role is InvitationRole {
  return (INVITATION_ROLES as readonly string[]).includes(role);
}
