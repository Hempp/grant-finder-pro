import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Shared API route helpers to stop drift across the 70+ route files.
 *
 * Every route used to start with 5-10 lines of identical scaffolding
 * (auth check, JSON parse, ownership verify). Because the copies
 * diverged subtly — different error messages, different 404-vs-403
 * ordering, some routes skipped the JSON try/catch — bugs landed in
 * some routes that were already fixed in others.
 *
 * Use these helpers for new routes. Incrementally convert old ones
 * when you're in the file anyway.
 *
 * Usage pattern:
 *
 *   const session = await requireAuth();
 *   if (session instanceof NextResponse) return session;
 *   // session.user.id is now guaranteed
 *
 *   const body = await parseJson<MyBody>(request);
 *   if (body instanceof NextResponse) return body;
 *   // body is now typed
 */

/**
 * Require an authenticated user. Returns the session on success, or a
 * 401 Response on failure (the caller returns that Response directly).
 */
export async function requireAuth(): Promise<
  { user: { id: string; email: string | null } } | NextResponse
> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { user: { id: session.user.id, email: session.user.email ?? null } };
}

/**
 * Parse a JSON request body with a typed cast. Returns 400 on invalid
 * JSON. Does NOT validate shape — pair with zod if you need that.
 */
export async function parseJson<T>(request: NextRequest): Promise<T | NextResponse> {
  try {
    return (await request.json()) as T;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

/**
 * Verify the authenticated user owns a resource. Uniform 404-before-403
 * ordering — we don't leak the existence of resources the user can't see.
 *
 * Model names are the lowerCamelCase Prisma client accessors (e.g.
 * "application", "document", "grantOutcome"). The row must expose a
 * `userId` field.
 */
export async function requireOwnership(params: {
  userId: string;
  resourceId: string;
  model:
    | "application"
    | "document"
    | "grantOutcome"
    | "studentApplication"
    | "userApplicationTemplate"
    | "contentBlock";
}): Promise<{ ok: true } | NextResponse> {
  const { userId, resourceId, model } = params;

  // Prisma delegates are typed individually; a dynamic lookup is the
  // simplest escape that keeps this helper generic.
  const delegate = (prisma as unknown as Record<string, {
    findUnique: (args: {
      where: { id: string };
      select: { userId: true };
    }) => Promise<{ userId: string | null } | null>;
  }>)[model];

  if (!delegate) {
    // Programmer error — fail loud in dev, 500 in prod.
    return NextResponse.json(
      { error: `Unknown model: ${model}` },
      { status: 500 }
    );
  }

  const row = await delegate.findUnique({
    where: { id: resourceId },
    select: { userId: true },
  });

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!row.userId || row.userId !== userId) {
    // Use 404 rather than 403 to avoid leaking existence of other users'
    // resources. (Fair compromise — 403 would tell an attacker that the
    // ID exists and belongs to someone else, a soft enumeration vector.)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return { ok: true };
}
