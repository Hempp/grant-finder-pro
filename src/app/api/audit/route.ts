import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-helpers";
import { logError } from "@/lib/telemetry";
import { getAccessibleUserIds } from "@/lib/org-context";

/**
 * GET /api/audit?limit=50&cursor=... — the caller's audit trail.
 *
 * Scope: the caller sees events for themselves AND (if they own or
 * belong to an org) for every teammate. Same pool-read pattern as
 * grants/applications in Phase 2a. This means a nonprofit owner can
 * see when their grant writer accessed / modified data — the
 * compliance story the /trust page promises.
 *
 * Pagination: cursor-based on `id` (CUIDs sort chronologically-ish,
 * and the (userId, createdAt) index on AuditLog is indexed either
 * way). `limit` clamped to [1, 100] so nobody can request 10K rows
 * through a query-string edit.
 */
export async function GET(request: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const limitRaw = Number(searchParams.get("limit") ?? "50");
  const limit = Math.max(1, Math.min(100, Number.isFinite(limitRaw) ? limitRaw : 50));
  const action = searchParams.get("action") ?? undefined;

  try {
    const accessibleIds = await getAccessibleUserIds(session.user.id);

    const rows = await prisma.auditLog.findMany({
      where: {
        userId: { in: accessibleIds },
        ...(action ? { action } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1, // peek one extra to determine if more exist
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        userId: true,
        action: true,
        resource: true,
        result: true,
        metadata: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    });

    const hasMore = rows.length > limit;
    const trimmed = hasMore ? rows.slice(0, limit) : rows;

    return NextResponse.json({
      events: trimmed.map((r) => ({
        id: r.id,
        action: r.action,
        resource: r.resource,
        result: r.result,
        createdAt: r.createdAt.toISOString(),
        ipAddress: r.ipAddress,
        userAgent: r.userAgent,
        actor: r.user
          ? { name: r.user.name, email: r.user.email }
          : null,
        // metadata is stored as a JSON string — parse on the server so
        // consumers don't each have to handle malformed rows.
        metadata: r.metadata ? safeParse(r.metadata) : null,
      })),
      nextCursor: hasMore ? trimmed[trimmed.length - 1].id : null,
    });
  } catch (err) {
    logError(err, { endpoint: "/api/audit", method: "GET" });
    return NextResponse.json({ error: "Failed to load audit log" }, { status: 500 });
  }
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return { raw: s };
  }
}
