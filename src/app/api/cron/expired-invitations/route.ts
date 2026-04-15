// Cron endpoint: revoke expired, still-unaccepted org invitations.
//
// Runs nightly. Without this, expired invitations linger as "pending"
// (UI logic treats them as expired based on expiresAt < now, but they
// count against the seat cap and clutter the history). Revoking them
// makes the list self-cleaning and frees seats on the owner's plan.
//
// Invoked by Vercel Cron — same auth shape as /api/cron/weekly-digest.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isMissingTableError } from "@/lib/api-helpers";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!CRON_SECRET) {
    console.error("CRON_SECRET not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  try {
    const now = new Date();
    const result = await prisma.organizationInvitation.updateMany({
      where: {
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { lt: now },
      },
      data: { revokedAt: now },
    });

    const duration = Date.now() - startedAt;
    console.info(
      `expired-invitations cron: revoked ${result.count} stale invitation(s) in ${duration}ms`
    );

    return NextResponse.json({
      success: true,
      revokedCount: result.count,
      duration: `${duration}ms`,
      timestamp: now.toISOString(),
    });
  } catch (err) {
    if (isMissingTableError(err)) {
      // Migration hasn't run yet in this environment — nothing to
      // clean up. Return success so the cron doesn't alert on a
      // harmless state.
      return NextResponse.json({
        success: true,
        revokedCount: 0,
        reason: "migration_pending",
      });
    }
    console.error("expired-invitations cron failed:", err);
    return NextResponse.json(
      { error: "cron failed", details: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
