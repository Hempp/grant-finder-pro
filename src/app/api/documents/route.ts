import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { parseDocumentContent } from "@/lib/content-library/parse-document";
import { extractBlocksFromDocument } from "@/lib/content-library/extract-documents";
import { createBlocks } from "@/lib/content-library/content-manager";

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

// POST - Upload document, parse it, and auto-extract to Content Library
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const contentType = request.headers.get("content-type") || "";

    let fileName: string;
    let fileBuffer: Buffer;
    let mimeType: string;
    let fileSize: number;

    if (contentType.includes("multipart/form-data")) {
      // Handle multipart file upload
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
      fileName = file.name;
      mimeType = file.type || "application/octet-stream";
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      fileSize = fileBuffer.length;
    } else {
      // Handle JSON with base64 content
      const body = await request.json();
      if (!body.name) {
        return NextResponse.json({ error: "File name required" }, { status: 400 });
      }
      fileName = body.name;
      mimeType = body.mimeType || "application/octet-stream";
      fileSize = body.fileSize || 0;

      if (body.content) {
        // base64-encoded file content
        fileBuffer = Buffer.from(body.content, "base64");
        fileSize = fileBuffer.length;
      } else {
        // Legacy: no content provided, create record only (no parsing)
        const document = await prisma.document.create({
          data: {
            userId,
            name: fileName,
            type: detectDocumentType(fileName),
            filePath: `/uploads/${userId}/${fileName}`,
            fileSize,
            mimeType,
            parsed: false,
          },
        });
        return NextResponse.json(document);
      }
    }

    // Validate file size (50MB max)
    if (fileBuffer.length > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum 50MB." },
        { status: 400 }
      );
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        userId,
        name: fileName,
        type: detectDocumentType(fileName),
        filePath: `/uploads/${userId}/${fileName}`,
        fileSize,
        mimeType,
        parsed: false,
      },
    });

    // Parse document content
    let parsedText: string;
    try {
      parsedText = await parseDocumentContent(fileBuffer, mimeType, fileName);
    } catch (parseError) {
      // Mark as failed but don't block the upload
      await prisma.document.update({
        where: { id: document.id },
        data: {
          parsed: false,
          parsedData: JSON.stringify({
            error: parseError instanceof Error ? parseError.message : "Parse failed",
          }),
        },
      });
      return NextResponse.json({
        ...document,
        parseWarning: "Could not extract text from this file. Try uploading a text-based PDF.",
      });
    }

    // Store parsed text
    await prisma.document.update({
      where: { id: document.id },
      data: {
        parsed: true,
        parsedData: parsedText.slice(0, 100_000), // Cap at 100KB of text
      },
    });

    // Auto-extract to Content Library in background
    let blocksCreated = 0;
    try {
      const blocks = await extractBlocksFromDocument(document.id, userId);
      if (blocks.length > 0) {
        await createBlocks(userId, blocks);
        blocksCreated = blocks.length;
      }
    } catch (extractError) {
      console.error("Content extraction failed (non-blocking):", extractError);
    }

    const updatedDoc = await prisma.document.findUnique({
      where: { id: document.id },
    });

    return NextResponse.json({
      ...updatedDoc,
      blocksCreated,
      message: blocksCreated > 0
        ? `Extracted ${blocksCreated} content blocks from "${fileName}". Your Content Library has been updated.`
        : `Parsed "${fileName}" successfully.`,
    });
  } catch (error) {
    console.error("Failed to upload document:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}

// DELETE - Remove document
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Document ID required" },
        { status: 400 }
      );
    }

    const document = await prisma.document.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (document.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
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
  if (lower.includes("grant") || lower.includes("proposal")) return "grant_proposal";
  if (lower.includes("resume") || lower.includes("cv") || lower.includes("bio")) return "team_bios";
  if (lower.includes("tax") || lower.includes("990") || lower.includes("w9")) return "tax_document";
  return "other";
}
