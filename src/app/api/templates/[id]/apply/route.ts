import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * POST /api/templates/:id/apply
 * Body: { grantId }
 *
 * Records a use of this template against a target grant and returns the
 * deserialized templateData that the apply-wizard will hydrate into its
 * formData state. The actual Application record is created by the existing
 * /api/applications POST on first autosave — this route does NOT create an
 * Application, which avoids orphan drafts if the user bounces.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  let body: { grantId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.grantId) {
    return NextResponse.json({ error: "grantId is required" }, { status: 400 });
  }

  const template = await prisma.userApplicationTemplate.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  // Confirm the grant is visible to this user (own or public catalog). This
  // mirrors the /api/grants read scope.
  const grant = await prisma.grant.findFirst({
    where: {
      id: body.grantId,
      OR: [{ userId: session.user.id }, { userId: null }],
    },
    select: { id: true, title: true, category: true, type: true },
  });
  if (!grant) {
    return NextResponse.json({ error: "Grant not found" }, { status: 404 });
  }

  // Update usage metrics — lets us sort templates by relevance in the picker.
  await prisma.userApplicationTemplate.update({
    where: { id: template.id },
    data: {
      usageCount: { increment: 1 },
      lastUsedAt: new Date(),
    },
  });

  let prefilledData: unknown;
  try {
    prefilledData = JSON.parse(template.templateData);
  } catch {
    // Corrupted template data shouldn't 500 the user — fall back to empty.
    prefilledData = {};
  }

  return NextResponse.json({
    prefilledData,
    grant,
    template: {
      id: template.id,
      name: template.name,
    },
  });
}
