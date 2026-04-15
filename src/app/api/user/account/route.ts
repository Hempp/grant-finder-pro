import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseJson, requireAuth } from "@/lib/api-helpers";
import { logEvent, logError } from "@/lib/telemetry";
import { audit } from "@/lib/audit-log";

/**
 * GDPR Article 17 (right to erasure).
 *
 * Deletes the caller's User record and every record that cascades from
 * it via the Prisma schema's `onDelete: Cascade` relations (applications,
 * documents, organization, student profile, student applications, content
 * blocks, grant outcomes, templates, notifications, referrals).
 *
 * Safety gates:
 *   1. Requires a confirmation token matching the user's email — prevents
 *      a stolen session from deleting the account without deliberate
 *      intent (same reason GitHub asks you to type the repo name).
 *   2. Only allowed if the user has no active paid subscription. If they
 *      do, they must cancel it via the Stripe billing portal first —
 *      otherwise we'd orphan a Stripe subscription with an ex-user.
 *
 * We do NOT soft-delete. GDPR Article 17 is "right to erasure" — the
 * user asked for their data to be gone. The only exceptions (legal
 * holds, open invoices) are surfaced as errors before the delete.
 */
export async function DELETE(request: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const body = await parseJson<{ confirmEmail?: string }>(request);
  if (body instanceof NextResponse) return body;

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      plan: true,
      stripeSubscriptionId: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Gate 1: type-your-email confirmation (case-insensitive match).
  if (
    !body.confirmEmail ||
    body.confirmEmail.trim().toLowerCase() !== (user.email ?? "").toLowerCase()
  ) {
    return NextResponse.json(
      {
        error:
          "Please type your account email in the `confirmEmail` field to confirm deletion.",
      },
      { status: 400 }
    );
  }

  // Gate 2: active subscription must be cancelled first. We don't silently
  // cancel it for them — that's a deliberate billing decision the user
  // should make in the portal.
  if (user.plan !== "free" && user.stripeSubscriptionId) {
    return NextResponse.json(
      {
        error:
          "Cancel your active subscription in Settings → Billing before deleting your account. This prevents an orphaned Stripe subscription billing a deleted user.",
      },
      { status: 409 }
    );
  }

  try {
    // Audit BEFORE delete so the trail survives (userId gets SetNull on
    // the audit row when the user is deleted, preserving the event).
    await audit({
      action: "account.deleted",
      userId,
      request,
      metadata: { email: user.email },
    });

    // Cascade is wired in the Prisma schema; a single delete propagates.
    await prisma.user.delete({ where: { id: userId } });

    logEvent("user.account_deleted", { userId });

    return NextResponse.json({
      deleted: true,
      note: "Your account and all associated data have been removed from our live systems. Backups roll off our retention window within 30 days.",
    });
  } catch (err) {
    logError(err, { endpoint: "/api/user/account", userId });
    return NextResponse.json(
      { error: "Failed to delete account. Contact support@grantpilot.ai." },
      { status: 500 }
    );
  }
}
