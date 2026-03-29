import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLibrary, createBlock } from "@/lib/content-library/content-manager";
import { ContentBlockInput } from "@/lib/content-library/types";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { blocks, stats } = await getLibrary(session.user.id);
    return NextResponse.json({ blocks, stats });
  } catch (error) {
    console.error("Failed to fetch content library:", error);
    return NextResponse.json({ error: "Failed to fetch content library" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body: ContentBlockInput = await request.json();
    if (!body.category || !body.title) {
      return NextResponse.json({ error: "category and title are required" }, { status: 400 });
    }
    const block = await createBlock(session.user.id, body);
    return NextResponse.json({ block });
  } catch (error) {
    console.error("Failed to create content block:", error);
    return NextResponse.json({ error: "Failed to create content block" }, { status: 500 });
  }
}
