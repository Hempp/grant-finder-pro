import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

/**
 * Organization profile fields extractable from unstructured content
 * (website crawl, uploaded documents, pasted text).
 *
 * Every field is optional — Claude returns only what it can confidently
 * identify. The caller merges into the existing org record with a
 * "fill blanks, don't overwrite" strategy so manually-entered data
 * always takes precedence over inferred data.
 */
export interface ExtractedOrgProfile {
  name?: string;
  type?: "startup" | "nonprofit" | "small_business" | "research" | "government" | "other";
  legalStructure?: string;
  ein?: string;
  city?: string;
  state?: string;
  mission?: string;
  vision?: string;
  problemStatement?: string;
  solution?: string;
  targetMarket?: string;
  teamSize?: string;
  founderBackground?: string;
  annualRevenue?: string;
  fundingSeeking?: string;
  previousFunding?: string;
}

/**
 * Takes raw unstructured text (from a website crawl, document parse, or
 * user paste) and extracts structured org profile fields via Claude.
 *
 * Designed to feel like Google's "import your business" flow — drop in
 * a URL or a document and the profile fills itself.
 *
 * The prompt instructs Claude to be conservative: only return a field
 * when the source text explicitly states or strongly implies it. A wrong
 * auto-fill is worse than a blank field.
 */
export async function extractOrgProfile(
  rawContent: string,
  sourceLabel: string = "website"
): Promise<{ profile: ExtractedOrgProfile; confidence: number }> {
  const trimmed = rawContent.slice(0, 25000); // budget for Claude context

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `You are helping a grant applicant set up their organization profile on GrantPilot.

Extract structured organization data from the following ${sourceLabel} content. Only include fields you can confidently identify — leave out anything you're guessing at. A blank field is better than a wrong one.

Content:
${trimmed}

Return a JSON object with ONLY the fields you found. Use these exact keys:

{
  "name": "Organization legal or doing-business-as name",
  "type": "startup | nonprofit | small_business | research | government | other",
  "legalStructure": "LLC, Corp, 501(c)(3), 501(c)(4), Sole Proprietor, etc.",
  "ein": "XX-XXXXXXX format if found",
  "city": "City name",
  "state": "Two-letter US state code (CA, NY, TX, etc.)",
  "mission": "Mission statement — 1-3 sentences max",
  "vision": "Vision statement if distinct from mission",
  "problemStatement": "What problem the org solves — 1-3 sentences",
  "solution": "How the org solves it — 1-3 sentences",
  "targetMarket": "Who they serve (e.g., 'underserved youth in LA County')",
  "teamSize": "1 | 2-5 | 6-10 | 11-25 | 26-50 | 51-100 | 100+",
  "founderBackground": "Key leadership credentials — 2-3 sentences",
  "annualRevenue": "Approximate range: <100K | 100K-500K | 500K-1M | 1M-5M | 5M-10M | 10M+",
  "fundingSeeking": "What they're seeking funding for — 1-2 sentences",
  "previousFunding": "Known grants, investments, or awards — brief list",
  "confidence": 0-100
}

The "confidence" field is YOUR overall confidence that the extracted data is accurate (not guessed). 90+ means most fields came from explicit statements. Below 50 means you're mostly inferring.

Rules:
- Return ONLY valid JSON, no markdown fences, no commentary
- Omit fields where the content doesn't provide clear evidence
- For teamSize and annualRevenue, use the closest bracket even if approximate
- For state, only return a code if you're confident about the US state
- For type, "nonprofit" includes 501(c)(3), 501(c)(4), fiscal sponsors
- Keep mission/vision/problem/solution concise — these go into form fields, not essays`,
      },
    ],
  });

  const text = response.content[0];
  if (text.type !== "text") {
    return { profile: {}, confidence: 0 };
  }

  try {
    const parsed = JSON.parse(text.text);
    const confidence = typeof parsed.confidence === "number" ? parsed.confidence : 50;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confidence: _, ...profile } = parsed;

    // Strip any keys that aren't in our interface to prevent injection
    const allowed = new Set<string>([
      "name", "type", "legalStructure", "ein", "city", "state",
      "mission", "vision", "problemStatement", "solution", "targetMarket",
      "teamSize", "founderBackground", "annualRevenue", "fundingSeeking",
      "previousFunding",
    ]);
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(profile)) {
      if (allowed.has(k) && typeof v === "string" && v.trim()) {
        clean[k] = v.trim();
      }
    }

    return { profile: clean as ExtractedOrgProfile, confidence };
  } catch {
    return { profile: {}, confidence: 0 };
  }
}

/**
 * Merge extracted fields into an existing org record.
 *
 * Strategy: "fill blanks, don't overwrite." If the org already has a
 * value for a field, keep it — the user's manual input trumps AI
 * inference. Returns only the fields that will actually be written
 * (the delta), so the UI can show "we found 8 new fields" rather than
 * silently updating.
 */
export function mergeOrgProfile(
  existing: Record<string, string | null | undefined>,
  extracted: ExtractedOrgProfile
): { updates: Partial<ExtractedOrgProfile>; fieldsFound: number; fieldsFilled: number } {
  const updates: Record<string, string> = {};
  let fieldsFound = 0;
  let fieldsFilled = 0;

  for (const [key, value] of Object.entries(extracted)) {
    if (!value) continue;
    fieldsFound++;
    // Only fill if the existing field is empty/null/undefined
    const current = existing[key];
    if (!current || current.trim() === "") {
      updates[key] = value;
      fieldsFilled++;
    }
  }

  return { updates: updates as Partial<ExtractedOrgProfile>, fieldsFound, fieldsFilled };
}
