import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateBlock, deleteBlock } from "@/lib/content-library/content-manager";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const block = await updateBlock(session.user.id, id, body);
    return NextResponse.json({ block });
  } catch (error) {
    console.error("Failed to update content block:", error);
    return NextResponse.json({ error: "Failed to update content block" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await deleteBlock(session.user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete content block:", error);
    return NextResponse.json({ error: "Failed to delete content block" }, { status: 500 });
  }
}
