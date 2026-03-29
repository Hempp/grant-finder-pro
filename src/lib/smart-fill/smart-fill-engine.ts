import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { getBlocksByCategory } from "@/lib/content-library/content-manager";
import { ContentCategory } from "@/lib/content-library/types";
import { determineFunderType } from "@/lib/auto-apply/grant-writer";
import { FUNDER_TONE_CONFIG, GrantContext } from "@/lib/auto-apply/types";
import {
  SmartFillResult,
  SectionDraft,
  ScoringCriterion,
  RequiredSection,
  Gap,
} from "./types";
import { optimizeSections } from "./optimizer";
import { generateDiffs } from "./diff-generator";

const anthropic = new Anthropic();

const SECTION_TO_CATEGORIES: Record<string, ContentCategory[]> = {
  executive_summary: ["company_overview", "mission", "impact_metrics"],
  project_summary: ["company_overview", "mission", "impact_metrics"],
  technical_approach: ["technical_capabilities", "past_performance"],
  methodology: ["technical_capabilities", "past_performance"],
  team: ["team_bios", "past_performance"],
  team_qualifications: ["team_bios", "past_performance"],
  budget: ["financials"],
  budget_justification: ["financials"],
  dei: ["dei_statement"],
  equity: ["dei_statement"],
  diversity: ["dei_statement"],
  impact: ["impact_metrics", "mission"],
  sustainability: ["environmental", "impact_metrics"],
  partnerships: ["partnerships"],
  organizational_capacity: ["company_overview", "team_bios", "facilities"],
  prior_experience: ["prior_grants", "past_performance"],
};

function mapSectionToCategories(sectionTitle: string): ContentCategory[] {
  const titleLower = sectionTitle.toLowerCase().replace(/[^a-z]/g, "_");
  for (const [key, categories] of Object.entries(SECTION_TO_CATEGORIES)) {
    if (titleLower.includes(key)) return categories;
  }
  return ["company_overview", "mission"];
}

export async function runSmartFill(
  grantId: string,
  userId: string
): Promise<SmartFillResult> {
  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
    include: { analysis: true },
  });
  if (!grant) throw new Error("Grant not found");

  const grantContext: GrantContext = {
    id: grant.id,
    title: grant.title,
    funder: grant.funder,
    description: grant.description,
    amount: grant.amount,
    amountMin: grant.amountMin,
    amountMax: grant.amountMax,
    deadline: grant.deadline,
    type: grant.type,
    category: grant.category,
    eligibility: grant.eligibility,
    requirements: grant.requirements,
    url: grant.url,
  };

  const funderType = determineFunderType(grantContext);
  const toneConfig = FUNDER_TONE_CONFIG[funderType];

  let scoringCriteria: ScoringCriterion[] = [];
  let requiredSections: RequiredSection[] = [];

  if (grant.analysis) {
    try { scoringCriteria = JSON.parse(grant.analysis.scoringCriteria); } catch { /* empty */ }
    try { requiredSections = JSON.parse(grant.analysis.requiredSections); } catch { /* empty */ }
  }

  if (requiredSections.length === 0) {
    requiredSections = [
      { title: "Executive Summary", instructions: "Provide an overview of your project and organization.", required: true, wordLimit: 500 },
      { title: "Technical Approach", instructions: "Describe your methodology and technical plan.", required: true, wordLimit: 1000 },
      { title: "Team Qualifications", instructions: "Describe your team and their qualifications.", required: true, wordLimit: 500 },
      { title: "Budget Justification", instructions: "Justify your proposed budget.", required: true, wordLimit: 500 },
    ];
  }

  const sections: SectionDraft[] = [];
  const allGaps: Gap[] = [];

  for (const section of requiredSections) {
    const categories = mapSectionToCategories(section.title);
    const blocks = await getBlocksByCategory(userId, categories);
    const contextBlocks = categories.includes("company_overview")
      ? []
      : await getBlocksByCategory(userId, ["company_overview"]);
    const allBlocks = [...blocks, ...contextBlocks];

    const blocksText = allBlocks
      .map((b) => `[${b.category}] ${b.title}: ${b.content}`)
      .join("\n\n");

    const criteriaText = scoringCriteria
      .map((c) => `- ${c.name} (${c.maxPoints} pts): ${c.description}`)
      .join("\n");

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 3000,
        messages: [{
          role: "user",
          content: `You are a grant writer with 20 years experience. Score 10/10 on this section.

GRANT:
- Funder: ${grant.funder} (${funderType})
- Grant: ${grant.title}
- Section: ${section.title}
- Instructions: ${section.instructions}
${section.wordLimit ? `- Word limit: ${section.wordLimit}` : ""}

SCORING CRITERIA:
${criteriaText || "No specific criteria — maximize relevance and impact."}

FUNDER VALUES:
- Tone: ${toneConfig.tone}
- Emphasize: ${toneConfig.emphasis.join(", ")}
- Avoid: ${toneConfig.avoid.join(", ")}

COMPANY DATA:
${blocksText || "No company data available for this section."}

RULES:
1. MAXIMIZE score on every criterion
2. Use specific numbers and metrics from company data
3. Match funder tone
4. Address every criterion explicitly
5. Flag missing data as gaps — NEVER fabricate
6. Stay within word limit

Return ONLY valid JSON:
{"content":"written section","score":8,"maxScore":10,"criteriaScores":[{"criterion":"...","score":5,"max":5,"note":"..."}],"gaps":[{"field":"...","reason":"...","suggestion":"...","impact":"high"}]}`,
        }],
      });

      const text = response.content[0];
      if (text.type === "text") {
        const result = JSON.parse(text.text);
        sections.push({
          id: section.title.toLowerCase().replace(/[^a-z0-9]/g, "_"),
          title: section.title,
          content: result.content,
          score: result.score,
          maxScore: result.maxScore,
          criteriaScores: result.criteriaScores || [],
          diffs: [],
          sourcesUsed: allBlocks.map((b) => b.id),
          gaps: result.gaps || [],
        });
        if (result.gaps) allGaps.push(...result.gaps);
      }
    } catch (error) {
      console.error(`Smart Fill failed for section: ${section.title}`, error);
      sections.push({
        id: section.title.toLowerCase().replace(/[^a-z0-9]/g, "_"),
        title: section.title,
        content: "",
        score: 0,
        maxScore: 10,
        criteriaScores: [],
        diffs: [],
        sourcesUsed: [],
        gaps: [{ field: section.title, reason: "Generation failed", suggestion: "Try again", impact: "high" }],
      });
    }
  }

  // Auto-optimize to 100
  const optimized = await optimizeSections(sections, grantContext, funderType, toneConfig, scoringCriteria);

  // Generate diffs
  const withDiffs = await generateDiffs(optimized.sections, userId);

  const totalScore = withDiffs.reduce((sum, s) => sum + s.score, 0);
  const totalMax = withDiffs.reduce((sum, s) => sum + s.maxScore, 0);

  return {
    score: totalScore,
    maxScore: totalMax,
    sections: withDiffs,
    gaps: allGaps,
    optimizationRounds: optimized.rounds,
  };
}
