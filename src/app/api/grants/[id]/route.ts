import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseJson, requireAuth } from "@/lib/api-helpers";
import { logError } from "@/lib/telemetry";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const grant = await prisma.grant.findUnique({
      where: { id },
    });

    if (!grant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }

    return NextResponse.json({ grant });
  } catch (err) {
    logError(err, { endpoint: "/api/grants/[id]", method: "GET" });
    return NextResponse.json({ error: "Failed to fetch grant" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  try {
    const { id } = await params;

    const body = await parseJson<{ status?: string }>(request);
    if (body instanceof NextResponse) return body;

    const { status } = body;

    // SECURITY: Check if grant exists and verify ownership
    const existingGrant = await prisma.grant.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingGrant) {
      return NextResponse.json(
        { error: "Grant not found" },
        { status: 404 }
      );
    }

    // Allow update only if:
    // 1. Grant has no owner (public grant being saved by user)
    // 2. Grant already belongs to the current user
    if (existingGrant.userId && existingGrant.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this grant" },
        { status: 403 }
      );
    }

    const grant = await prisma.grant.update({
      where: { id },
      data: {
        status,
        userId: session.user.id, // Associate with user when saving
      },
    });

    return NextResponse.json({ grant });
  } catch (err) {
    logError(err, { endpoint: "/api/grants/[id]", method: "PATCH" });
    return NextResponse.json({ error: "Failed to update grant" }, { status: 500 });
  }
}
