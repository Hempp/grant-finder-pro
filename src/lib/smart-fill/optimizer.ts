import Anthropic from "@anthropic-ai/sdk";
import { GrantContext, FunderType, FUNDER_TONE_CONFIG } from "@/lib/auto-apply/types";
import { SectionDraft, ScoringCriterion } from "./types";

const anthropic = new Anthropic();
const MAX_ROUNDS = 3;

export async function optimizeSections(
  sections: SectionDraft[],
  grant: GrantContext,
  funderType: FunderType,
  toneConfig: (typeof FUNDER_TONE_CONFIG)[FunderType],
  _scoringCriteria: ScoringCriterion[]
): Promise<{ sections: SectionDraft[]; rounds: number }> {
  let current = [...sections];
  let rounds = 0;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const needsImprovement = current.filter(
      (s) => s.score < s.maxScore && s.gaps.length === 0
    );
    if (needsImprovement.length === 0) break;

    rounds++;

    for (let i = 0; i < current.length; i++) {
      const section = current[i];
      if (section.score >= section.maxScore || section.gaps.length > 0) continue;

      const weakCriteria = section.criteriaScores
        .filter((c) => c.score < c.max)
        .map((c) => `- ${c.criterion}: scored ${c.score}/${c.max} — ${c.note}`)
        .join("\n");

      if (!weakCriteria) continue;

      try {
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 3000,
          messages: [{
            role: "user",
            content: `You are a grant writer optimizing a section to score 10/10.

GRANT: ${grant.title} by ${grant.funder} (${funderType})
SECTION: ${section.title}

CURRENT TEXT (scores ${section.score}/${section.maxScore}):
${section.content}

CRITERIA THAT NEED IMPROVEMENT:
${weakCriteria}

FUNDER VALUES:
- Tone: ${toneConfig.tone}
- Emphasize: ${toneConfig.emphasis.join(", ")}

INSTRUCTIONS:
1. Rewrite to address EVERY weak criterion
2. Keep everything that scores well — don't regress
3. Be specific with numbers and evidence
4. Do NOT fabricate facts
5. Stay within the same word count

Return ONLY valid JSON:
{"content":"improved section","score":10,"maxScore":10,"criteriaScores":[{"criterion":"...","score":5,"max":5,"note":"..."}]}`,
          }],
        });

        const text = response.content[0];
        if (text.type === "text") {
          const result = JSON.parse(text.text);
          if (result.score > section.score) {
            current[i] = {
              ...section,
              content: result.content,
              score: result.score,
              criteriaScores: result.criteriaScores || section.criteriaScores,
            };
          }
        }
      } catch {
        // Keep original if optimization fails
      }
    }
  }

  return { sections: current, rounds };
}
