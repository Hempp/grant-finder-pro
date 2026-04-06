import { PDFParse } from "pdf-parse";

/**
 * Extract raw text from uploaded document content.
 * Supports PDF (via pdf-parse) and plain text formats.
 */
export async function parseDocumentContent(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
    return parsePdf(fileBuffer);
  }

  // Plain text, CSV, markdown
  if (
    mimeType.startsWith("text/") ||
    fileName.endsWith(".txt") ||
    fileName.endsWith(".csv") ||
    fileName.endsWith(".md")
  ) {
    return fileBuffer.toString("utf-8");
  }

  // For DOCX/XLSX, attempt to extract readable text
  const text = fileBuffer.toString("utf-8");
  const stripped = text.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s{3,}/g, "\n");
  if (stripped.trim().length > 100) {
    return stripped.trim();
  }

  throw new Error(`Unsupported file format: ${mimeType} (${fileName})`);
}

async function parsePdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  const text = result.text?.trim();
  await parser.destroy();

  if (!text || text.length < 20) {
    throw new Error("PDF appears to be empty or image-only (no extractable text)");
  }
  return text;
}
