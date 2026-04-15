import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseJson, requireAuth } from "@/lib/api-helpers";
import { logError } from "@/lib/telemetry";

export async function GET() {
  const session = await requireAuth();
  // For the bell, treat unauthenticated as empty — the UI renders nothing
  // anyway and we don't want a flash of 401s in browser devtools.
  if (session instanceof NextResponse) {
    return NextResponse.json({ count: 0, items: [] });
  }
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id, readAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, type: true, title: true, message: true, createdAt: true },
    });
    return NextResponse.json({ count: notifications.length, items: notifications });
  } catch (err) {
    logError(err, { endpoint: "/api/notifications/unread" });
    return NextResponse.json({ count: 0, items: [] });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const body = await parseJson<{ action?: string }>(request);
  if (body instanceof NextResponse) return body;

  if (body.action === "mark_all_read") {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, readAt: null },
      data: { readAt: new Date() },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
