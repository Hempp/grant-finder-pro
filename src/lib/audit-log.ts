import { prisma } from "@/lib/db";
import { logError } from "@/lib/telemetry";
import type { NextRequest } from "next/server";

/**
 * Security + billing audit trail writer.
 *
 * Writes to the AuditLog Prisma model — append-only, survives account
 * deletion (User.onDelete = SetNull on the relation). This is the
 * evidence layer auditors ask for when reviewing SOC2 CC6.4 (logging
 * and monitoring) or incident forensics.
 *
 * Audit writes NEVER throw into the caller. A failed insert is logged
 * through telemetry and swallowed — the business action (login, payment,
 * deletion) must complete regardless. The audit trail's job is to
 * remember, not to enforce.
 */

export type AuditAction =
  // Auth
  | "auth.login.success"
  | "auth.login.failure"
  | "auth.register"
  | "auth.logout"
  | "auth.password_reset.requested"
  | "auth.password_reset.completed"
  | "auth.oauth.link"
  // Account lifecycle
  | "account.deleted"
  | "account.exported"
  // Admin-gated actions
  | "admin.grant_bulk_import"
  // Billing / subscriptions
  | "billing.checkout.started"
  | "billing.subscription.created"
  | "billing.subscription.updated"
  | "billing.subscription.canceled"
  | "billing.payment.succeeded"
  | "billing.payment.failed"
  | "billing.invoice.downloaded"
  // Success-fee lifecycle
  | "outcome.fee.invoiced"
  | "outcome.fee.charged"
  | "outcome.fee.failed"
  // Authorization failures (useful for brute-force and probe detection)
  | "authz.denied";

export type AuditResult = "success" | "failure";

export async function audit(params: {
  action: AuditAction;
  result?: AuditResult;
  userId?: string | null;
  resource?: string | null;
  metadata?: Record<string, unknown> | null;
  request?: NextRequest | null;
}): Promise<void> {
  try {
    const { action, result = "success", userId = null, resource = null, metadata, request } = params;

    const ipAddress = request
      ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        null
      : null;
    const userAgent = request ? request.headers.get("user-agent") || null : null;

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        result,
        metadata: metadata ? JSON.stringify(metadata).slice(0, 4096) : null,
        ipAddress,
        userAgent: userAgent ? userAgent.slice(0, 512) : null,
      },
    });
  } catch (err) {
    logError(err, { step: "audit.write", action: params.action });
  }
}
