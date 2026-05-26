import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

const anthropic = new Anthropic();

/**
 * A user's writing voice — what makes their prose recognizably theirs
 * even when discussing grant-application content. Injected into the
 * Smart Fill prompt alongside the funder tone so output sounds like
 * the USER, not generic Claude.
 *
 * Storage shape (User.voiceProfile JSON):
 * - tone: 2–3 word characterization ("plain-spoken academic")
 * - sentencePatterns: structural habits ("opens with concrete example")
 * - vocabularyPreferences: specific words/phrases this user reaches for
 * - framingPatterns: how this user positions ideas (problem→solution)
 * - signaturePhrases: 3–5 exact phrases that recur in their writing
 * - exemplarSentences: 3–5 quoted sentences showing the voice
 * - sources: where the voice was extracted from (org/blocks/docs counts)
 */
export interface VoiceProfile {
  tone: string;
  sentencePatterns: string[];
  vocabularyPreferences: string[];
  framingPatterns: string[];
  signaturePhrases: string[];
  exemplarSentences: string[];
  sources: {
    organizationFields: number;
    contentBlocks: number;
    documents: number;
  };
  extractedAt: string;
}

const MIN_TOTAL_SOURCES = 3;
const MAX_DOCS_TO_SAMPLE = 5;
const MAX_BLOCKS_TO_SAMPLE = 10;
const MAX_DOC_CONTENT_CHARS = 4000; // truncate huge pitch decks per source

interface VoiceSource {
  label: string;
  content: string;
}

/**
 * Collect all the prose a user has authored across the app. Three
 * source types, ranked by voice fidelity:
 *
 * 1. **Organization fields** (mission / vision / problem / solution /
 *    founderBackground) — highest fidelity. Direct user prose, written
 *    in their own voice during onboarding.
 * 2. **Documents** (pitch decks, business plans) — high fidelity if the
 *    parser preserved raw text. These are the user's existing written
 *    materials — most authentic voice signal available.
 * 3. **Content Library blocks** — medium fidelity. Often distilled or
 *    AI-assisted; still useful, but voice may be partially Claude's.
 */
async function collectVoiceSources(userId: string): Promise<{
  sources: VoiceSource[];
  counts: { organizationFields: number; contentBlocks: number; documents: number };
}> {
  const sources: VoiceSource[] = [];
  const counts = { organizationFields: 0, contentBlocks: 0, documents: 0 };

  // 1. Organization prose — direct user voice
  const org = await prisma.organization.findUnique({
    where: { userId },
    select: {
      mission: true,
      vision: true,
      problemStatement: true,
      solution: true,
      targetMarket: true,
      founderBackground: true,
    },
  });
  if (org) {
    const orgFields: Array<[string, string | null]> = [
      ["Mission", org.mission],
      ["Vision", org.vision],
      ["Problem statement", org.problemStatement],
      ["Solution", org.solution],
      ["Target market", org.targetMarket],
      ["Founder background", org.founderBackground],
    ];
    for (const [label, content] of orgFields) {
      if (content && content.trim().length > 30) {
        sources.push({ label: `Organization · ${label}`, content: content.trim() });
        counts.organizationFields++;
      }
    }
  }

  // 2. Documents — raw user materials (pitch decks, business plans, etc)
  const docs = await prisma.document.findMany({
    where: {
      userId,
      parsed: true,
      parsedData: { not: null },
      type: { in: ["pitch_deck", "business_plan", "other"] },
    },
    orderBy: { createdAt: "desc" },
    take: MAX_DOCS_TO_SAMPLE,
    select: { name: true, type: true, parsedData: true },
  });
  for (const doc of docs) {
    if (!doc.parsedData) continue;
    let text = "";
    try {
      const parsed = JSON.parse(doc.parsedData);
      // parsed may be { text }, { content }, { sections: [{ text }] }, or a string
      if (typeof parsed === "string") text = parsed;
      else if (typeof parsed.text === "string") text = parsed.text;
      else if (typeof parsed.content === "string") text = parsed.content;
      else if (Array.isArray(parsed.sections)) {
        text = parsed.sections
          .map((s: { text?: string; content?: string }) => s.text || s.content || "")
          .join("\n\n");
      }
    } catch {
      // parsedData might be raw text, not JSON — try direct
      text = doc.parsedData;
    }
    text = text.trim();
    if (text.length < 100) continue;
    if (text.length > MAX_DOC_CONTENT_CHARS) {
      text = text.slice(0, MAX_DOC_CONTENT_CHARS) + "…";
    }
    sources.push({ label: `Document · ${doc.type} · ${doc.name}`, content: text });
    counts.documents++;
  }

  // 3. Content Library blocks — distilled but still user signal
  const blocks = await prisma.contentBlock.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: MAX_BLOCKS_TO_SAMPLE,
    select: { content: true, category: true, title: true },
  });
  for (const block of blocks) {
    if (!block.content || block.content.trim().length < 50) continue;
    sources.push({
      label: `Content block · ${block.category} · ${block.title}`,
      content: block.content.trim(),
    });
    counts.contentBlocks++;
  }

  return { sources, counts };
}

/**
 * Run voice extraction across all the user's authored prose. Returns
 * the profile and persists it to User.voiceProfile.
 *
 * Returns null if total sources < MIN_TOTAL_SOURCES — voice extracted
 * from too little signal hurts Smart Fill more than it helps.
 */
export async function extractVoiceProfile(
  userId: string
): Promise<VoiceProfile | null> {
  const { sources, counts } = await collectVoiceSources(userId);

  const totalSources = counts.organizationFields + counts.contentBlocks + counts.documents;
  if (totalSources < MIN_TOTAL_SOURCES) {
    return null;
  }

  const sampleText = sources
    .map((s) => `[${s.label}]\n${s.content}`)
    .join("\n\n---\n\n");

  const prompt = `You are analyzing one user's writing voice across ${sources.length} authored sources (organization profile fields, uploaded pitch decks / business plans, content library blocks). Your output drives a downstream AI grant-writer so its output sounds like this person, not like generic ChatGPT-Claude prose.

WRITING SAMPLES (separated by ---):

${sampleText}

Analyze the voice and return ONLY valid JSON in this exact shape:

{
  "tone": "2-3 word characterization (e.g. 'plain-spoken academic', 'warm institutional', 'concise technical')",
  "sentencePatterns": ["structural habit 1", "structural habit 2", "structural habit 3"],
  "vocabularyPreferences": ["specific word/phrase they use", "another", "another"],
  "framingPatterns": ["how they position ideas (e.g. 'leads with the concrete outcome before the mechanism')", "another framing habit"],
  "signaturePhrases": ["exact phrase 1", "exact phrase 2", "exact phrase 3"],
  "exemplarSentences": ["a sentence quoted verbatim that captures the voice", "another verbatim sentence", "another"]
}

RULES:
1. Be specific — "uses active voice" is useless; "favors 'we built X to do Y' over 'X was built'" is useful
2. Quote signaturePhrases and exemplarSentences VERBATIM from the samples — do not invent
3. Weight organization-profile and pitch-deck/business-plan sources higher than content-library blocks (the first two are raw user prose; blocks may have been AI-assisted)
4. If the voice is inconsistent across samples, characterize the DOMINANT voice
5. No filler categories — leave arrays empty if you can't find specific evidence
6. Avoid generic SaaS descriptors ("conversational", "professional") unless you can back them with a specific pattern

Return JSON only.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0];
  if (text.type !== "text") {
    throw new Error("Voice extraction returned non-text response");
  }

  let parsed: Omit<VoiceProfile, "sources" | "extractedAt">;
  try {
    parsed = JSON.parse(text.text);
  } catch {
    // Recover from common LLM wrappings (```json ... ```)
    const match = text.text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Voice extraction did not return JSON");
    parsed = JSON.parse(match[0]);
  }

  const profile: VoiceProfile = {
    tone: parsed.tone || "",
    sentencePatterns: parsed.sentencePatterns || [],
    vocabularyPreferences: parsed.vocabularyPreferences || [],
    framingPatterns: parsed.framingPatterns || [],
    signaturePhrases: parsed.signaturePhrases || [],
    exemplarSentences: parsed.exemplarSentences || [],
    sources: counts,
    extractedAt: new Date().toISOString(),
  };

  await prisma.user.update({
    where: { id: userId },
    data: {
      voiceProfile: JSON.stringify(profile),
      voiceProfileUpdatedAt: new Date(),
    },
  });

  return profile;
}

/**
 * Load a user's stored voice profile, or null if extraction hasn't run
 * yet. Cheap read — called by every Smart Fill invocation.
 */
export async function getVoiceProfile(userId: string): Promise<VoiceProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { voiceProfile: true },
  });
  if (!user?.voiceProfile) return null;
  try {
    return JSON.parse(user.voiceProfile) as VoiceProfile;
  } catch {
    return null;
  }
}

/**
 * Format a voice profile as a prompt fragment for Claude. Returns empty
 * string when no profile — Smart Fill still works without one, just
 * without the voice match.
 */
export function formatVoiceForPrompt(profile: VoiceProfile | null): string {
  if (!profile) return "";

  const sections: string[] = [];
  if (profile.tone) sections.push(`- Tone: ${profile.tone}`);
  if (profile.sentencePatterns.length)
    sections.push(`- Sentence habits: ${profile.sentencePatterns.join("; ")}`);
  if (profile.vocabularyPreferences.length)
    sections.push(`- Reaches for: ${profile.vocabularyPreferences.join(", ")}`);
  if (profile.framingPatterns.length)
    sections.push(`- Framing: ${profile.framingPatterns.join("; ")}`);
  if (profile.signaturePhrases.length)
    sections.push(`- Signature phrases: ${profile.signaturePhrases.map((p) => `"${p}"`).join(", ")}`);
  if (profile.exemplarSentences.length)
    sections.push(
      `- Example sentences (mirror cadence, do not copy):\n  ${profile.exemplarSentences
        .map((s) => `"${s}"`)
        .join("\n  ")}`
    );

  if (sections.length === 0) return "";

  return `\nUSER VOICE (mirror this — output should sound like the user, not generic AI):\n${sections.join("\n")}\n`;
}
