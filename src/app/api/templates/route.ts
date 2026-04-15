import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseJson, requireAuth } from "@/lib/api-helpers";

/**
 * User application templates.
 *
 * Templates serialize the apply-wizard form payload so the user can save
 * a polished draft and re-seed future applications with it. Scoped per
 * user — this endpoint never returns another user's templates.
 */

// GET /api/templates?grantCategory=&grantType=
// Returns the authenticated user's templates. Optional filters narrow by
// similarity metadata; grants list & apply wizard use the filtered call
// to surface "Apply with template X" suggestions only for the right grants.
export async function GET(request: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const url = new URL(request.url);
  const grantCategory = url.searchParams.get("grantCategory") || undefined;
  const grantType = url.searchParams.get("grantType") || undefined;

  // "null" means the template applies to any grant, so we always OR it in
  // alongside an exact match. Prisma can't mix nullable values into `in`,
  // so we build AND[] of OR[] clauses.
  const and: { OR: { grantCategory?: string | null; grantType?: string | null }[] }[] = [];
  if (grantCategory) {
    and.push({ OR: [{ grantCategory }, { grantCategory: null }] });
  }
  if (grantType) {
    and.push({ OR: [{ grantType }, { grantType: null }] });
  }

  const templates = await prisma.userApplicationTemplate.findMany({
    where: {
      userId: session.user.id,
      ...(and.length ? { AND: and } : {}),
    },
    orderBy: [{ lastUsedAt: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      name: true,
      description: true,
      grantCategory: true,
      grantType: true,
      usageCount: true,
      lastUsedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ templates });
}

// POST /api/templates
// Body: { name, description?, templateData (JSON object or string), grantCategory?, grantType? }
// Creates a new template scoped to the caller.
export async function POST(request: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const body = await parseJson<{
    name?: string;
    description?: string;
    templateData?: unknown;
    grantCategory?: string;
    grantType?: string;
  }>(request);
  if (body instanceof NextResponse) return body;

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Template name is required" }, { status: 400 });
  }
  if (name.length > 120) {
    return NextResponse.json({ error: "Template name is too long" }, { status: 400 });
  }
  if (body.templateData === undefined || body.templateData === null) {
    return NextResponse.json({ error: "templateData is required" }, { status: 400 });
  }

  const serialized =
    typeof body.templateData === "string"
      ? body.templateData
      : JSON.stringify(body.templateData);

  // Cap at 256KB to avoid DB bloat from accidental pastes of huge blobs.
  if (serialized.length > 256 * 1024) {
    return NextResponse.json(
      { error: "Template is too large (max 256KB)" },
      { status: 413 }
    );
  }

  const created = await prisma.userApplicationTemplate.create({
    data: {
      userId: session.user.id,
      name,
      description: body.description?.trim() || null,
      templateData: serialized,
      grantCategory: body.grantCategory?.trim() || null,
      grantType: body.grantType?.trim() || null,
    },
    select: {
      id: true,
      name: true,
      description: true,
      grantCategory: true,
      grantType: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ template: created }, { status: 201 });
}
