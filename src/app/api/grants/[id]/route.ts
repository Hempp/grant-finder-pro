import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const grant = await prisma.grant.findUnique({
      where: { id },
    });

    if (!grant) {
      return NextResponse.json(
        { error: "Grant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ grant });
  } catch (error) {
    console.error("Failed to fetch grant:", error);
    return NextResponse.json(
      { error: "Failed to fetch grant" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const grant = await prisma.grant.update({
      where: { id },
      data: { 
        status,
        userId: session.user.id, // Associate with user when saving
      },
    });

    return NextResponse.json({ grant });
  } catch (error) {
    console.error("Failed to update grant:", error);
    return NextResponse.json(
      { error: "Failed to update grant" },
      { status: 500 }
    );
  }
}
