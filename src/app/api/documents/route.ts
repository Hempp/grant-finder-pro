import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET - Fetch documents for current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

// POST - Upload/create document record
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const userId = session.user.id;

    const document = await prisma.document.create({
      data: {
        userId,
        name: body.name,
        type: body.type || detectDocumentType(body.name),
        filePath: body.filePath || `/uploads/${userId}/${body.name}`,
        fileSize: body.fileSize || 0,
        mimeType: body.mimeType || "application/octet-stream",
        parsed: false,
      },
    });

    // In production, trigger async parsing job here
    // For demo, we'll simulate parsing
    setTimeout(async () => {
      await prisma.document.update({
        where: { id: document.id },
        data: {
          parsed: true,
          parsedData: JSON.stringify({
            extracted: true,
            fields: ["company_name", "revenue", "team_size", "mission"],
          }),
          updatedAt: new Date(),
        },
      });
    }, 2000);

    return NextResponse.json(document);
  } catch (error) {
    console.error("Failed to create document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}

// DELETE - Remove document
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Document ID required" },
        { status: 400 }
      );
    }

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

function detectDocumentType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes("pitch") || lower.includes("deck")) return "pitch_deck";
  if (lower.includes("financial") || lower.includes("statement")) return "financials";
  if (lower.includes("business") || lower.includes("plan")) return "business_plan";
  return "other";
}
