import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractFromWebsite } from "@/lib/content-library/extract-website";
import { createBlocks, detectConflicts } from "@/lib/content-library/content-manager";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let { url } = await request.json().catch(() => ({ url: null }));

  if (!url) {
    const org = await prisma.organization.findUnique({
      where: { userId: session.user.id },
      select: { website: true },
    });
    url = org?.website;
  }

  if (!url) {
    return NextResponse.json(
      { error: "No URL provided and no website in organization profile" },
      { status: 400 }
    );
  }

  if (!url.startsWith("http")) url = `https://${url}`;

  try {
    const result = await extractFromWebsite(url);

    if (result.blocks.length === 0) {
      return NextResponse.json({
        blocksCreated: 0, blocks: [], conflicts: [],
        message: "No grant-relevant content could be extracted from this URL",
      });
    }

    const conflicts = await detectConflicts(session.user.id, result.blocks);
    const conflictCategories = new Set(conflicts.map((c) => c.category));
    const nonConflicting = result.blocks.filter((b) => !conflictCategories.has(b.category));
    const created = await createBlocks(session.user.id, nonConflicting);

    return NextResponse.json({ blocksCreated: created.length, blocks: created, conflicts });
  } catch (error) {
    console.error("URL import failed:", error);
    return NextResponse.json({ error: "Failed to extract content from URL" }, { status: 500 });
  }
}
