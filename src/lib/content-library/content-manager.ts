import { prisma } from "@/lib/db";
import {
  ContentBlockInput,
  ContentBlockWithId,
  ContentCategory,
  LibraryStats,
  Conflict,
  SOURCE_CONFIDENCE,
} from "./types";

export async function getLibrary(userId: string): Promise<{
  blocks: ContentBlockWithId[];
  stats: LibraryStats;
}> {
  const blocks = await prisma.contentBlock.findMany({
    where: { userId },
    orderBy: [{ category: "asc" }, { confidence: "desc" }],
  });

  const byCategory: Record<string, number> = {};
  let totalConfidence = 0;

  for (const block of blocks) {
    byCategory[block.category] = (byCategory[block.category] || 0) + 1;
    totalConfidence += block.confidence;
  }

  return {
    blocks: blocks as ContentBlockWithId[],
    stats: {
      total: blocks.length,
      byCategory,
      avgConfidence: blocks.length > 0 ? Math.round(totalConfidence / blocks.length) : 0,
    },
  };
}

export async function getBlocksByCategory(
  userId: string,
  categories: ContentCategory[]
): Promise<ContentBlockWithId[]> {
  const blocks = await prisma.contentBlock.findMany({
    where: { userId, category: { in: categories } },
    orderBy: { confidence: "desc" },
  });
  return blocks as ContentBlockWithId[];
}

export async function createBlock(
  userId: string,
  input: ContentBlockInput
): Promise<ContentBlockWithId> {
  const confidence = input.confidence ?? SOURCE_CONFIDENCE[input.source] ?? 80;

  // Dedup: if same category+title exists, update if new content is richer
  const existing = await prisma.contentBlock.findFirst({
    where: { userId, category: input.category, title: input.title },
  });

  if (existing) {
    // Update only if new content is longer or from a higher-confidence source
    if (input.content.length > existing.content.length || confidence > existing.confidence) {
      const updated = await prisma.contentBlock.update({
        where: { id: existing.id },
        data: {
          content: input.content,
          source: input.source,
          sourceRef: input.sourceRef,
          confidence,
          lastVerified: new Date(),
        },
      });
      return updated as ContentBlockWithId;
    }
    return existing as ContentBlockWithId;
  }

  const block = await prisma.contentBlock.create({
    data: {
      userId,
      category: input.category,
      title: input.title,
      content: input.content,
      source: input.source,
      sourceRef: input.sourceRef,
      confidence,
    },
  });
  return block as ContentBlockWithId;
}

export async function createBlocks(
  userId: string,
  inputs: ContentBlockInput[]
): Promise<ContentBlockWithId[]> {
  const results: ContentBlockWithId[] = [];
  for (const input of inputs) {
    results.push(await createBlock(userId, input));
  }
  return results;
}

export async function updateBlock(
  userId: string,
  blockId: string,
  data: { title?: string; content?: string; category?: string }
): Promise<ContentBlockWithId> {
  const block = await prisma.contentBlock.update({
    where: { id: blockId, userId },
    data: { ...data, confidence: 100, lastVerified: new Date() },
  });
  return block as ContentBlockWithId;
}

export async function deleteBlock(userId: string, blockId: string): Promise<void> {
  await prisma.contentBlock.delete({ where: { id: blockId, userId } });
}

export async function detectConflicts(
  userId: string,
  newBlocks: ContentBlockInput[]
): Promise<Conflict[]> {
  const existing = await prisma.contentBlock.findMany({ where: { userId } });
  const conflicts: Conflict[] = [];

  for (const newBlock of newBlocks) {
    const match = existing.find(
      (e) => e.category === newBlock.category && e.title === newBlock.title
    );
    if (match && match.content !== newBlock.content) {
      const existingIsRicher = match.content.length > newBlock.content.length * 1.5;
      conflicts.push({
        category: newBlock.category as ContentCategory,
        existingTitle: match.title,
        existingContent: match.content,
        newContent: newBlock.content,
        newSource: newBlock.source as ContentBlockInput["source"],
        recommendation: existingIsRicher ? "keep_existing" : "keep_both",
        reason: existingIsRicher
          ? "Existing content is significantly more detailed"
          : "Both versions contain unique information",
      });
    }
  }
  return conflicts;
}
