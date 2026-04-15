import { NextRequest, NextResponse } from "next/server";
import { getLibrary, createBlock } from "@/lib/content-library/content-manager";
import { ContentBlockInput } from "@/lib/content-library/types";
import { parseJson, requireAuth } from "@/lib/api-helpers";
import { getAccessibleUserIds } from "@/lib/org-context";
import { logError } from "@/lib/telemetry";

export async function GET() {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    // Phase 2a: pool-aware read so teammates' blocks populate the whole
    // team's library view. Writes still scoped to the caller.
    const accessibleIds = await getAccessibleUserIds(session.user.id);
    const { blocks, stats } = await getLibrary(accessibleIds);
    return NextResponse.json({ blocks, stats });
  } catch (err) {
    logError(err, { endpoint: "/api/content-library", method: "GET" });
    return NextResponse.json({ error: "Failed to fetch content library" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const body = await parseJson<ContentBlockInput>(request);
  if (body instanceof NextResponse) return body;

  if (!body.category || !body.title) {
    return NextResponse.json({ error: "category and title are required" }, { status: 400 });
  }

  try {
    const block = await createBlock(session.user.id, body);
    return NextResponse.json({ block });
  } catch (err) {
    logError(err, { endpoint: "/api/content-library", method: "POST" });
    return NextResponse.json({ error: "Failed to create content block" }, { status: 500 });
  }
}
