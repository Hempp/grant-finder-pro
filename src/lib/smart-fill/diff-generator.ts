import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { SectionDraft, SectionDiff } from "./types";

const anthropic = new Anthropic();

export async function generateDiffs(
  sections: SectionDraft[],
  userId: string
): Promise<SectionDraft[]> {
  const result: SectionDraft[] = [];

  // Load all user's content blocks for comparison
  const allBlocks = await prisma.contentBlock.findMany({
    where: { userId },
    select: { id: true, content: true, category: true },
  });

  for (const section of sections) {
    if (section.sourcesUsed.length === 0 || !section.content) {
      result.push(section);
      continue;
    }

    const sourceContent = allBlocks
      .filter((b) => section.sourcesUsed.includes(b.id))
      .map((b) => b.content)
      .join("\n\n");

    if (!sourceContent) {
      result.push(section);
      continue;
    }

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: `Compare original company data to AI-generated grant section. Identify key transformations.

ORIGINAL COMPANY DATA:
${sourceContent.slice(0, 3000)}

AI-GENERATED SECTION:
${section.content}

Identify 2-3 most significant changes. For each, explain WHY tied to grant scoring.

Return ONLY valid JSON array:
[{"before":"original phrase","after":"how it appears now","why":"reason tied to scoring"}]`,
        }],
      });

      const text = response.content[0];
      if (text.type === "text") {
        const diffs: SectionDiff[] = JSON.parse(text.text);
        result.push({ ...section, diffs });
      } else {
        result.push(section);
      }
    } catch {
      result.push(section);
    }
  }

  return result;
}
