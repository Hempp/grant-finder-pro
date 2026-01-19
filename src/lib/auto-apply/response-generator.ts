// Smart Response Generator
// Generates targeted responses based on field intelligence

import Anthropic from "@anthropic-ai/sdk";
import {
  AnalyzedField,
  FieldCategory,
  analyzeField,
  analyzeFields,
} from "./field-intelligence";
import {
  UserContext,
  GrantContext,
  ResponseData,
  FunderType,
  FUNDER_TONE_CONFIG,
} from "./types";

const anthropic = new Anthropic();

// Response quality levels
export interface ResponseQuality {
  score: number;           // 0-100
  level: "excellent" | "good" | "acceptable" | "needs_work" | "insufficient";
  issues: string[];
  suggestions: string[];
}

// Generated response with full context
export interface GeneratedResponse {
  fieldId: string;
  content: string;
  quality: ResponseQuality;
  wordCount: number;
  characterCount: number;
  sources: string[];
  aiGenerated: boolean;
  needsReview: boolean;
  reviewPrompt?: string;
  alternatives?: string[];  // Alternative phrasings
}

// Category-specific response strategies
const CATEGORY_STRATEGIES: Record<FieldCategory, {
  structure: string;
  keyElements: string[];
  examples?: string;
}> = {
  organization_identity: {
    structure: "Direct answer with exact information",
    keyElements: ["Exact legal name", "Correct format"],
  },
  organization_background: {
    structure: "Chronological narrative highlighting key milestones",
    keyElements: ["Founding story", "Key milestones", "Growth trajectory", "Relevant achievements"],
  },
  mission_vision: {
    structure: "Clear, inspiring statement that connects to funder priorities",
    keyElements: ["Purpose", "Impact", "Values", "Connection to grant"],
  },
  problem_need: {
    structure: "Problem → Evidence → Impact → Urgency",
    keyElements: ["Clear problem definition", "Data/statistics", "Human impact", "Why now"],
    examples: "Example structure: 'In [location], [statistic] of [population] face [problem]. This results in [consequences]. Without intervention, [future impact]. Our research shows...'",
  },
  solution_approach: {
    structure: "What → How → Why it works → Evidence",
    keyElements: ["Clear description", "Methodology", "Evidence base", "Innovation"],
    examples: "Example structure: 'Our approach [name] addresses this through [method]. This is based on [evidence/research]. What makes this unique is...'",
  },
  target_population: {
    structure: "Who → Demographics → Selection → Numbers",
    keyElements: ["Specific demographics", "Selection criteria", "Numbers to serve", "Needs"],
  },
  geographic_scope: {
    structure: "Where → Why there → Local context",
    keyElements: ["Specific boundaries", "Rationale", "Local knowledge"],
  },
  project_description: {
    structure: "Overview → Components → Activities → Timeline",
    keyElements: ["Clear scope", "Key components", "Logical flow", "Deliverables"],
  },
  goals_objectives: {
    structure: "SMART format: Specific, Measurable, Achievable, Relevant, Time-bound",
    keyElements: ["Measurable targets", "Timeline", "Alignment with need"],
    examples: "Example: 'By [date], [action verb] [number] [target] resulting in [outcome], as measured by [metric].'",
  },
  activities_timeline: {
    structure: "Phase/Month → Activities → Milestones → Deliverables",
    keyElements: ["Specific activities", "Realistic timeline", "Dependencies", "Milestones"],
  },
  outcomes_impact: {
    structure: "Outputs → Outcomes → Impact → Measurement",
    keyElements: ["Quantified outputs", "Meaningful outcomes", "Long-term impact", "Metrics"],
    examples: "Differentiate: Outputs (what you produce: 50 workshops), Outcomes (what changes: 200 people gain skills), Impact (long-term: reduced unemployment).",
  },
  evaluation_plan: {
    structure: "Questions → Indicators → Methods → Timeline → Use",
    keyElements: ["Evaluation questions", "Metrics/indicators", "Data collection", "Analysis plan", "Use of findings"],
  },
  team_qualifications: {
    structure: "Role → Person → Qualifications → Relevance",
    keyElements: ["Key roles", "Specific qualifications", "Relevant experience", "Time commitment"],
  },
  organizational_capacity: {
    structure: "Experience → Infrastructure → Track record → Resources",
    keyElements: ["Relevant experience", "Systems/infrastructure", "Past success", "Partnerships"],
  },
  partnerships: {
    structure: "Partner → Role → Value → Commitment",
    keyElements: ["Partner names", "Specific roles", "Why this partner", "Documentation"],
  },
  budget_summary: {
    structure: "Category → Amount → Percentage of total",
    keyElements: ["Total request", "Major categories", "Cost reasonableness"],
  },
  budget_line_items: {
    structure: "Item → Quantity × Rate × Duration = Total",
    keyElements: ["Detailed breakdown", "Calculations shown", "Industry rates"],
  },
  budget_justification: {
    structure: "Item → Rationale → Connection to activities",
    keyElements: ["Clear rationale", "Connection to work plan", "Cost reasonableness"],
    examples: "Example: 'Project Coordinator ($50,000): This FTE will manage day-to-day operations, coordinate with partners, and ensure milestone completion. Rate is based on [source] for similar positions in [location].'",
  },
  sustainability: {
    structure: "Immediate → Short-term → Long-term strategies",
    keyElements: ["Concrete strategies", "Diverse sources", "Realistic timeline", "Institutional commitment"],
  },
  diversified_funding: {
    structure: "Source → Amount → Status → Timeline",
    keyElements: ["Multiple sources", "Confirmed vs. pending", "Percentages"],
  },
  matching_funds: {
    structure: "Source → Type → Amount → Documentation",
    keyElements: ["Eligible sources", "Cash vs. in-kind", "Calculations", "Letters"],
  },
  financial_health: {
    structure: "Revenue trends → Diversification → Stability indicators",
    keyElements: ["Revenue growth", "Diverse sources", "Reserves", "Audit status"],
  },
  innovation: {
    structure: "What's new → Evidence → Comparison → Potential",
    keyElements: ["Clear differentiation", "Evidence base", "Comparison to alternatives", "Potential impact"],
  },
  commercialization: {
    structure: "Market → Customers → Revenue Model → Path to Scale",
    keyElements: ["Market size", "Customer validation", "Business model", "Growth strategy"],
  },
  intellectual_property: {
    structure: "Current IP → Protection Strategy → Freedom to Operate",
    keyElements: ["Existing IP", "Filing plans", "Licensing", "Competitive landscape"],
  },
  risk_mitigation: {
    structure: "Risk → Likelihood → Impact → Mitigation Strategy",
    keyElements: ["Key risks identified", "Assessment", "Concrete mitigation", "Contingency plans"],
    examples: "Example format: 'Risk: [description]. Likelihood: [Low/Medium/High]. Impact: [description]. Mitigation: [specific strategy].'",
  },
  contact_info: {
    structure: "Direct information in requested format",
    keyElements: ["Complete information", "Correct format", "Authorized contact"],
  },
  certifications: {
    structure: "Number/ID with verification status",
    keyElements: ["Valid number", "Correct format", "Active status"],
  },
  attachments: {
    structure: "List required documents with status",
    keyElements: ["All required items", "Correct format", "Page limits"],
  },
  references: {
    structure: "Name → Title → Organization → Contact → Relationship",
    keyElements: ["Appropriate references", "Confirmed availability", "Contact info"],
  },
  other: {
    structure: "Responsive answer addressing the question directly",
    keyElements: ["Direct response", "Relevant details", "Appropriate length"],
  },
};

// Generate a response for a single analyzed field
export async function generateResponse(
  fieldId: string,
  analyzedField: AnalyzedField,
  grant: GrantContext,
  funderType: FunderType
): Promise<GeneratedResponse> {
  const toneConfig = FUNDER_TONE_CONFIG[funderType];
  const strategy = CATEGORY_STRATEGIES[analyzedField.intent.category];

  // Handle direct-fill fields (no AI needed)
  if (analyzedField.intent.responseStrategy === "direct") {
    return generateDirectResponse(fieldId, analyzedField);
  }

  // Handle select/dropdown fields
  if (analyzedField.fieldType === "select" && analyzedField.constraints.options?.length) {
    return generateSelectResponse(fieldId, analyzedField, grant);
  }

  // Build the generation prompt
  const prompt = buildSmartPrompt(analyzedField, grant, toneConfig, strategy);

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: getMaxTokens(analyzedField),
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type === "text") {
      const generatedText = cleanResponse(content.text, analyzedField);
      const quality = assessQuality(generatedText, analyzedField);

      return {
        fieldId,
        content: generatedText,
        quality,
        wordCount: countWords(generatedText),
        characterCount: generatedText.length,
        sources: Object.keys(analyzedField.relevantData),
        aiGenerated: true,
        needsReview: quality.level === "needs_work" || quality.level === "insufficient",
        reviewPrompt: quality.level !== "excellent" && quality.level !== "good"
          ? `This response ${quality.issues[0]?.toLowerCase() || "may need enhancement"}`
          : undefined,
      };
    }
  } catch (error) {
    console.error(`Failed to generate response for ${fieldId}:`, error);
  }

  // Fallback for failed generation
  return {
    fieldId,
    content: "",
    quality: {
      score: 0,
      level: "insufficient",
      issues: ["Generation failed"],
      suggestions: ["Please provide this information manually"],
    },
    wordCount: 0,
    characterCount: 0,
    sources: [],
    aiGenerated: false,
    needsReview: true,
    reviewPrompt: `Please provide: ${analyzedField.originalQuestion}`,
  };
}

// Generate response for direct-fill fields (org name, EIN, etc.)
function generateDirectResponse(
  fieldId: string,
  analyzedField: AnalyzedField
): GeneratedResponse {
  const { intent, relevantData, missingInfo } = analyzedField;

  // Map field categories to specific data fields
  const directMappings: Record<string, string[]> = {
    organization_identity: ["name", "ein", "legalStructure"],
    contact_info: ["city", "state", "website"],
    certifications: ["ein"],
  };

  const fieldsToCheck = directMappings[intent.category] || intent.dataNeeded;
  let content = "";
  const sources: string[] = [];

  for (const field of fieldsToCheck) {
    if (relevantData[field]) {
      content = relevantData[field];
      sources.push(field);
      break;
    }
  }

  if (content) {
    return {
      fieldId,
      content,
      quality: {
        score: 95,
        level: "excellent",
        issues: [],
        suggestions: [],
      },
      wordCount: countWords(content),
      characterCount: content.length,
      sources,
      aiGenerated: false,
      needsReview: false,
    };
  }

  // Missing direct data
  return {
    fieldId,
    content: "",
    quality: {
      score: 0,
      level: "insufficient",
      issues: ["Required information not in profile"],
      suggestions: [`Add ${missingInfo.join(", ")} to your organization profile`],
    },
    wordCount: 0,
    characterCount: 0,
    sources: [],
    aiGenerated: false,
    needsReview: true,
    reviewPrompt: `Please provide your ${intent.category.replace(/_/g, " ")}`,
  };
}

// Generate response for select/dropdown fields
async function generateSelectResponse(
  fieldId: string,
  analyzedField: AnalyzedField,
  grant: GrantContext
): Promise<GeneratedResponse> {
  const options = analyzedField.constraints.options || [];
  const { relevantData, intent } = analyzedField;

  // Try to match based on available data
  const dataString = Object.values(relevantData).join(" ").toLowerCase();
  let bestMatch = "";
  let matchScore = 0;

  for (const option of options) {
    const optionLower = option.toLowerCase();
    // Simple keyword matching
    const keywords = optionLower.split(/\s+/);
    let score = 0;
    for (const keyword of keywords) {
      if (dataString.includes(keyword)) {
        score++;
      }
    }
    if (score > matchScore) {
      matchScore = score;
      bestMatch = option;
    }
  }

  // If no match found, use AI to determine best option
  if (!bestMatch && options.length > 0) {
    try {
      const prompt = `Based on this organization information, select the most appropriate option.

Organization Data:
${Object.entries(relevantData).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

Question: ${analyzedField.originalQuestion}

Options:
${options.map((o, i) => `${i + 1}. ${o}`).join("\n")}

Return ONLY the exact text of the best matching option, nothing else.`;

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 100,
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.content[0];
      if (content.type === "text") {
        const suggested = content.text.trim();
        if (options.some(o => o.toLowerCase() === suggested.toLowerCase())) {
          bestMatch = options.find(o => o.toLowerCase() === suggested.toLowerCase()) || suggested;
        }
      }
    } catch (error) {
      console.error("Failed to determine select option:", error);
    }
  }

  if (bestMatch) {
    return {
      fieldId,
      content: bestMatch,
      quality: {
        score: matchScore > 0 ? 85 : 70,
        level: matchScore > 0 ? "good" : "acceptable",
        issues: matchScore === 0 ? ["Selection based on AI inference"] : [],
        suggestions: [],
      },
      wordCount: countWords(bestMatch),
      characterCount: bestMatch.length,
      sources: Object.keys(relevantData),
      aiGenerated: matchScore === 0,
      needsReview: matchScore === 0,
      reviewPrompt: matchScore === 0 ? "Please verify this selection is correct" : undefined,
    };
  }

  return {
    fieldId,
    content: options[0] || "",
    quality: {
      score: 30,
      level: "needs_work",
      issues: ["Could not determine best option"],
      suggestions: ["Please select the appropriate option"],
    },
    wordCount: 0,
    characterCount: 0,
    sources: [],
    aiGenerated: false,
    needsReview: true,
    reviewPrompt: "Please select the correct option",
  };
}

// Build an intelligent prompt based on analyzed field
function buildSmartPrompt(
  analyzedField: AnalyzedField,
  grant: GrantContext,
  toneConfig: typeof FUNDER_TONE_CONFIG[FunderType],
  strategy: typeof CATEGORY_STRATEGIES[FieldCategory]
): string {
  const { intent, relevantData, extractedContent, previousAnswers, constraints } = analyzedField;

  const wordLimit = constraints.wordLimit || 500;
  const charLimit = constraints.characterLimit;

  let prompt = `You are an expert grant writer with 30+ years of success. Generate a response for this grant application field.

## THE QUESTION
"${analyzedField.originalQuestion}"

## WHAT THEY'RE REALLY ASKING
${intent.coreQuestion}

## WHAT MAKES A STRONG ANSWER
${intent.lookingFor.map(l => `- ${l}`).join("\n")}

## WHAT TO AVOID
${intent.redFlags.map(r => `- ${r}`).join("\n")}

## RESPONSE STRUCTURE
${strategy.structure}

## KEY ELEMENTS TO INCLUDE
${strategy.keyElements.map(e => `- ${e}`).join("\n")}

${strategy.examples ? `## EXAMPLE APPROACH\n${strategy.examples}\n` : ""}

## GRANT CONTEXT
- Funder: ${grant.funder}
- Grant: ${grant.title}
- Focus: ${grant.description?.substring(0, 200) || "General funding"}

## ORGANIZATION DATA
${Object.entries(relevantData).length > 0
  ? Object.entries(relevantData).map(([k, v]) => `- ${formatFieldName(k)}: ${v}`).join("\n")
  : "Limited organization data available - generate based on typical best practices."}

${extractedContent.length > 0 ? `## RELEVANT DOCUMENTS\n${extractedContent.join("\n\n")}\n` : ""}

${previousAnswers.length > 0 ? `## SIMILAR CONTENT FROM PREVIOUS APPLICATIONS\n${previousAnswers.join("\n\n")}\n` : ""}

## WRITING GUIDELINES
- Tone: ${toneConfig.tone}
- Emphasize: ${toneConfig.emphasis.join(", ")}
- Avoid: ${toneConfig.avoid.join(", ")}

## CONSTRAINTS
${wordLimit ? `- Word limit: ${wordLimit} words` : ""}
${charLimit ? `- Character limit: ${charLimit} characters` : ""}
- Be specific and use concrete examples
- Use data and metrics when available
- Connect directly to the funder's priorities

Write the response now. Be concise, specific, and compelling. Do not include any preamble or explanation - just the response content.`;

  return prompt;
}

// Get appropriate max tokens based on field constraints
function getMaxTokens(analyzedField: AnalyzedField): number {
  const { constraints } = analyzedField;

  if (constraints.characterLimit) {
    return Math.min(constraints.characterLimit * 2, 4000);
  }
  if (constraints.wordLimit) {
    return Math.min(constraints.wordLimit * 3, 4000);
  }

  // Defaults based on field type
  const defaults: Record<string, number> = {
    text: 200,
    textarea: 2000,
    table: 3000,
    budget: 2000,
  };

  return defaults[analyzedField.fieldType] || 2000;
}

// Clean the response to fit constraints
function cleanResponse(text: string, analyzedField: AnalyzedField): string {
  let cleaned = text.trim();

  // Remove common AI artifacts
  cleaned = cleaned.replace(/^(Here is|Here's|Based on|I've written|Let me|Sure,)[^.]*\.\s*/i, "");
  cleaned = cleaned.replace(/\n\n+/g, "\n\n");

  // Respect character limit
  if (analyzedField.constraints.characterLimit && cleaned.length > analyzedField.constraints.characterLimit) {
    cleaned = cleaned.substring(0, analyzedField.constraints.characterLimit - 3) + "...";
  }

  // Respect word limit (soft limit - try to trim at sentence boundary)
  if (analyzedField.constraints.wordLimit) {
    const words = cleaned.split(/\s+/);
    if (words.length > analyzedField.constraints.wordLimit) {
      // Find last complete sentence within limit
      let truncated = words.slice(0, analyzedField.constraints.wordLimit).join(" ");
      const lastSentence = truncated.lastIndexOf(".");
      if (lastSentence > truncated.length * 0.7) {
        truncated = truncated.substring(0, lastSentence + 1);
      }
      cleaned = truncated;
    }
  }

  return cleaned;
}

// Assess the quality of a generated response
function assessQuality(content: string, analyzedField: AnalyzedField): ResponseQuality {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  const wordCount = countWords(content);
  const { constraints, intent } = analyzedField;

  // Check if empty
  if (!content || content.length < 10) {
    return {
      score: 0,
      level: "insufficient",
      issues: ["Response is empty or too short"],
      suggestions: ["Provide a complete response to this question"],
    };
  }

  // Check word limit
  if (constraints.wordLimit) {
    if (wordCount > constraints.wordLimit * 1.1) {
      issues.push(`Exceeds word limit (${wordCount}/${constraints.wordLimit})`);
      score -= 15;
    } else if (wordCount < constraints.wordLimit * 0.5 && constraints.wordLimit > 100) {
      issues.push("Response may be too brief");
      suggestions.push("Consider adding more detail");
      score -= 10;
    }
  }

  // Check character limit
  if (constraints.characterLimit && content.length > constraints.characterLimit) {
    issues.push(`Exceeds character limit (${content.length}/${constraints.characterLimit})`);
    score -= 20;
  }

  // Check for key elements (basic check)
  const strategy = CATEGORY_STRATEGIES[intent.category];
  const contentLower = content.toLowerCase();
  let elementsFound = 0;

  for (const element of strategy.keyElements) {
    const keywords = element.toLowerCase().split(/\s+/);
    if (keywords.some(kw => contentLower.includes(kw))) {
      elementsFound++;
    }
  }

  const elementRatio = elementsFound / Math.max(strategy.keyElements.length, 1);
  if (elementRatio < 0.3) {
    suggestions.push("Consider addressing more key elements for this question type");
    score -= 15;
  }

  // Check for red flags
  for (const redFlag of intent.redFlags) {
    const flagKeywords = redFlag.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    if (flagKeywords.some(kw => contentLower.includes(kw))) {
      issues.push(`May contain: ${redFlag}`);
      score -= 5;
    }
  }

  // Check for vague language
  const vagueTerms = ["very", "many", "some", "things", "stuff", "various", "numerous"];
  const vagueCount = vagueTerms.filter(t => contentLower.includes(t)).length;
  if (vagueCount > 3) {
    suggestions.push("Consider using more specific language");
    score -= 5;
  }

  // Determine level
  let level: ResponseQuality["level"];
  if (score >= 90) level = "excellent";
  else if (score >= 75) level = "good";
  else if (score >= 60) level = "acceptable";
  else if (score >= 40) level = "needs_work";
  else level = "insufficient";

  return {
    score: Math.max(0, Math.min(100, score)),
    level,
    issues,
    suggestions,
  };
}

// Format field name for display
function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, " ");
}

// Count words in text
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

// Batch generate responses for multiple fields
export async function generateResponses(
  fields: Array<{
    id: string;
    question: string;
    meta?: {
      type?: string;
      options?: string[];
      wordLimit?: number;
      characterLimit?: number;
      placeholder?: string;
      helpText?: string;
      required?: boolean;
    };
  }>,
  grant: GrantContext,
  context: UserContext,
  funderType: FunderType
): Promise<Map<string, GeneratedResponse>> {
  // First, analyze all fields
  const analyses = await analyzeFields(fields, grant, context);

  // Then generate responses
  const results = new Map<string, GeneratedResponse>();

  // Process in parallel batches
  const batchSize = 3;
  const fieldIds = Array.from(analyses.keys());

  for (let i = 0; i < fieldIds.length; i += batchSize) {
    const batchIds = fieldIds.slice(i, i + batchSize);
    const responses = await Promise.all(
      batchIds.map(async (id) => {
        const analysis = analyses.get(id)!;
        return generateResponse(id, analysis, grant, funderType);
      })
    );
    batchIds.forEach((id, index) => {
      results.set(id, responses[index]);
    });
  }

  return results;
}

// Export types
export type { AnalyzedField };
