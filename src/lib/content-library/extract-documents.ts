import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";
import { ContentBlockInput, ContentCategory } from "./types";

const anthropic = new Anthropic();

export async function extractBlocksFromDocument(
  documentId: string,
  userId: string
): Promise<ContentBlockInput[]> {
  const doc = await prisma.document.findUnique({
    where: { id: documentId, userId },
    select: { id: true, name: true, type: true, parsedData: true },
  });

  if (!doc?.parsedData) return [];

  const parsedContent = typeof doc.parsedData === "string"
    ? doc.parsedData
    : JSON.stringify(doc.parsedData);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: `Extract grant-relevant information from this ${doc.type} document.

Document: ${doc.name}
Content:
${parsedContent.slice(0, 20000)}

Categories: company_overview, mission, team_bios, past_performance,
technical_capabilities, financials, prior_grants, partnerships,
dei_statement, impact_metrics, facilities, ip_patents, environmental

Return JSON array:
[{"category":"team_bios","title":"CEO — Jane Smith","content":"full bio text..."}]

Rules:
- Separate block per distinct piece of information
- Keep specific numbers, dates, metrics
- One block per team member for bios
- Include specific financial figures
- Return ONLY valid JSON`,
    }],
  });

  const content = response.content[0];
  if (content.type !== "text") return [];

  try {
    const extracted = JSON.parse(content.text);
    return extracted.map(
      (item: { category: string; title: string; content: string }) => ({
        category: item.category as ContentCategory,
        title: item.title,
        content: item.content,
        source: "document" as const,
        sourceRef: documentId,
        confidence: 80,
      })
    );
  } catch {
    return [];
  }
}

export async function extractBlocksFromAllDocuments(
  userId: string
): Promise<ContentBlockInput[]> {
  const docs = await prisma.document.findMany({
    where: { userId, parsed: true },
    select: { id: true },
  });

  const allBlocks: ContentBlockInput[] = [];
  for (const doc of docs) {
    const blocks = await extractBlocksFromDocument(doc.id, userId);
    allBlocks.push(...blocks);
  }
  return allBlocks;
}
