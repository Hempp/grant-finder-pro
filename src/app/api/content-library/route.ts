import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLibrary, createBlock } from "@/lib/content-library/content-manager";
import { ContentBlockInput } from "@/lib/content-library/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { blocks, stats } = await getLibrary(session.user.id);
  return NextResponse.json({ blocks, stats });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: ContentBlockInput = await request.json();

  if (!body.category || !body.title || !body.content) {
    return NextResponse.json(
      { error: "category, title, and content are required" },
      { status: 400 }
    );
  }

  const block = await createBlock(session.user.id, body);
  return NextResponse.json({ block });
}
