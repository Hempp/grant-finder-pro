// Validation and Quality Scoring Engine for Auto-Apply
// Ensures generated responses meet grant writing standards

import Anthropic from "@anthropic-ai/sdk";
import type { FieldCategory } from "./field-intelligence";

// Validation result types
export interface ValidationIssue {
  type: "error" | "warning" | "suggestion";
  code: string;
  message: string;
  field?: string;
  position?: { start: number; end: number };
  suggestion?: string;
}

export interface QualityMetrics {
  overall: number; // 0-100
  clarity: number;
  specificity: number;
  relevance: number;
  completeness: number;
  professionalism: number;
  persuasiveness: number;
  compliance: number;
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  metrics: QualityMetrics;
  issues: ValidationIssue[];
  improvements: string[];
  strengths: string[];
}

// Quality thresholds
const QUALITY_THRESHOLDS = {
  minimum: 60,
  good: 75,
  excellent: 90,
};

// Common grant writing issues
const COMMON_ISSUES = {
  vague_language: {
    patterns: [
      /\bvery\b/gi,
      /\breally\b/gi,
      /\bkind of\b/gi,
      /\bsort of\b/gi,
      /\bsomewhat\b/gi,
      /\bfairly\b/gi,
      /\bquite\b/gi,
      /\bsignificant(?:ly)?\b/gi,
      /\bsubstantial(?:ly)?\b/gi,
      /\bmany\b/gi,
      /\bseveral\b/gi,
      /\bnumerous\b/gi,
    ],
    message: "Vague language detected. Use specific numbers and concrete details.",
  },
  passive_voice: {
    patterns: [
      /\bwas\s+\w+ed\b/gi,
      /\bwere\s+\w+ed\b/gi,
      /\bis\s+being\b/gi,
      /\bhas\s+been\b/gi,
      /\bhave\s+been\b/gi,
      /\bwill\s+be\s+\w+ed\b/gi,
    ],
    message: "Consider using active voice for stronger impact.",
  },
  weak_verbs: {
    patterns: [
      /\bwill\s+try\b/gi,
      /\bhope\s+to\b/gi,
      /\bplan\s+to\b/gi,
      /\bintend\s+to\b/gi,
      /\bwould\s+like\b/gi,
      /\bmight\b/gi,
      /\bcould\s+potentially\b/gi,
    ],
    message: "Weak or uncertain language. Use confident, action-oriented verbs.",
  },
  filler_words: {
    patterns: [
      /\bin\s+order\s+to\b/gi,
      /\bdue\s+to\s+the\s+fact\b/gi,
      /\bat\s+this\s+point\s+in\s+time\b/gi,
      /\bit\s+should\s+be\s+noted\b/gi,
      /\bit\s+is\s+important\s+to\s+note\b/gi,
    ],
    message: "Remove filler phrases for concise writing.",
  },
  missing_data: {
    patterns: [
      /\bX+\b/g,
      /\b\[?\s*TBD\s*\]?\b/gi,
      /\b\[?\s*TODO\s*\]?\b/gi,
      /\b\[?\s*INSERT\s*\]?\b/gi,
      /\b\[?\s*PLACEHOLDER\s*\]?\b/gi,
    ],
    message: "Missing data placeholder detected. Fill in specific information.",
  },
  repetition: {
    patterns: [], // Handled separately with word frequency analysis
    message: "Repetitive language detected. Vary your vocabulary.",
  },
};

// Category-specific requirements
const CATEGORY_REQUIREMENTS: Partial<Record<FieldCategory, {
  required: string[];
  recommended: string[];
  wordRange?: { min: number; max: number };
}>> = {
  problem_need: {
    required: ["data", "statistics", "impact"],
    recommended: ["trends", "root cause", "urgency"],
    wordRange: { min: 150, max: 500 },
  },
  solution_approach: {
    required: ["methodology", "activities", "timeline"],
    recommended: ["innovation", "evidence-based", "scalability"],
    wordRange: { min: 200, max: 750 },
  },
  outcomes_impact: {
    required: ["metrics", "measurement", "targets"],
    recommended: ["long-term impact", "sustainability", "replication"],
    wordRange: { min: 150, max: 400 },
  },
  budget_summary: {
    required: ["amounts", "categories", "justification"],
    recommended: ["cost-effectiveness", "leverage", "matching"],
    wordRange: { min: 100, max: 300 },
  },
  team_qualifications: {
    required: ["credentials", "experience", "roles"],
    recommended: ["track record", "capacity", "partnerships"],
    wordRange: { min: 150, max: 400 },
  },
  organization_background: {
    required: ["mission", "history", "programs"],
    recommended: ["achievements", "community connection", "governance"],
    wordRange: { min: 100, max: 350 },
  },
};

/**
 * Validate a single response
 */
export function validateResponse(
  content: string,
  category: FieldCategory,
  wordLimit?: number
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const improvements: string[] = [];
  const strengths: string[] = [];

  // Word count check
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordLimit && wordCount > wordLimit) {
    issues.push({
      type: "error",
      code: "WORD_LIMIT_EXCEEDED",
      message: `Response exceeds word limit (${wordCount}/${wordLimit} words)`,
      suggestion: `Reduce content by ${wordCount - wordLimit} words`,
    });
  }

  // Check for common issues
  for (const [issueType, config] of Object.entries(COMMON_ISSUES)) {
    if (config.patterns.length === 0) continue;

    for (const pattern of config.patterns) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        // Only flag if used excessively (more than once)
        if (matches.length > 1 || issueType === "missing_data") {
          issues.push({
            type: issueType === "missing_data" ? "error" : "warning",
            code: issueType.toUpperCase(),
            message: config.message,
            suggestion:
              issueType === "vague_language"
                ? "Replace with specific numbers or concrete examples"
                : undefined,
          });
          break; // One issue per type
        }
      }
    }
  }

  // Check word repetition
  const wordFrequency = analyzeWordFrequency(content);
  const overusedWords = wordFrequency.filter(
    (w) => w.count > 3 && w.word.length > 4
  );
  if (overusedWords.length > 0) {
    issues.push({
      type: "warning",
      code: "WORD_REPETITION",
      message: `Overused words: ${overusedWords
        .slice(0, 3)
        .map((w) => `"${w.word}" (${w.count}x)`)
        .join(", ")}`,
      suggestion: "Use synonyms to vary your vocabulary",
    });
  }

  // Category-specific validation
  const categoryReqs = CATEGORY_REQUIREMENTS[category];
  if (categoryReqs) {
    // Check word range
    if (categoryReqs.wordRange) {
      if (wordCount < categoryReqs.wordRange.min) {
        issues.push({
          type: "warning",
          code: "TOO_SHORT",
          message: `Response may be too brief for ${category} (${wordCount} words)`,
          suggestion: `Consider expanding to at least ${categoryReqs.wordRange.min} words`,
        });
      }
    }

    // Check for required elements
    const contentLower = content.toLowerCase();
    const missingRequired = categoryReqs.required.filter(
      (req) => !contentLower.includes(req.toLowerCase())
    );
    if (missingRequired.length > 0) {
      improvements.push(
        `Consider adding: ${missingRequired.join(", ")}`
      );
    }

    // Check for recommended elements
    const hasRecommended = categoryReqs.recommended.filter((rec) =>
      contentLower.includes(rec.toLowerCase())
    );
    if (hasRecommended.length > 0) {
      strengths.push(
        `Includes important elements: ${hasRecommended.join(", ")}`
      );
    }
  }

  // Check for positive indicators
  if (content.match(/\d+%|\$[\d,]+|\d+\s*(people|participants|users)/gi)) {
    strengths.push("Includes specific metrics and data points");
  }
  if (content.match(/evidence|research|study|data shows/gi)) {
    strengths.push("References evidence-based support");
  }
  if (content.match(/goal|objective|outcome|result/gi)) {
    strengths.push("Clearly states goals or outcomes");
  }

  // Calculate metrics
  const metrics = calculateQualityMetrics(content, category, issues);

  // Calculate overall score
  const score = Math.round(
    metrics.clarity * 0.15 +
      metrics.specificity * 0.20 +
      metrics.relevance * 0.15 +
      metrics.completeness * 0.20 +
      metrics.professionalism * 0.10 +
      metrics.persuasiveness * 0.10 +
      metrics.compliance * 0.10
  );

  return {
    isValid: issues.filter((i) => i.type === "error").length === 0,
    score,
    metrics,
    issues,
    improvements,
    strengths,
  };
}

/**
 * Validate entire application
 */
export async function validateApplication(
  responses: Record<string, { content: string; category: FieldCategory; wordLimit?: number }>,
  grantType: string,
  funderType: string
): Promise<{
  overallScore: number;
  fieldResults: Record<string, ValidationResult>;
  applicationIssues: ValidationIssue[];
  readinessLevel: "ready" | "needs_work" | "not_ready";
  summary: string;
}> {
  const fieldResults: Record<string, ValidationResult> = {};
  let totalScore = 0;
  let fieldCount = 0;
  const applicationIssues: ValidationIssue[] = [];

  // Validate each field
  for (const [fieldId, data] of Object.entries(responses)) {
    const result = validateResponse(data.content, data.category, data.wordLimit);
    fieldResults[fieldId] = result;
    totalScore += result.score;
    fieldCount++;

    // Collect critical errors
    result.issues
      .filter((i) => i.type === "error")
      .forEach((issue) => {
        applicationIssues.push({
          ...issue,
          field: fieldId,
        });
      });
  }

  const overallScore = fieldCount > 0 ? Math.round(totalScore / fieldCount) : 0;

  // Check for completeness
  const emptyFields = Object.entries(responses).filter(
    ([, data]) => !data.content || data.content.trim().length < 10
  );
  if (emptyFields.length > 0) {
    applicationIssues.push({
      type: "error",
      code: "INCOMPLETE_APPLICATION",
      message: `${emptyFields.length} field(s) are empty or incomplete`,
    });
  }

  // Determine readiness level
  let readinessLevel: "ready" | "needs_work" | "not_ready";
  const criticalErrors = applicationIssues.filter((i) => i.type === "error").length;

  if (criticalErrors === 0 && overallScore >= QUALITY_THRESHOLDS.good) {
    readinessLevel = "ready";
  } else if (criticalErrors <= 2 && overallScore >= QUALITY_THRESHOLDS.minimum) {
    readinessLevel = "needs_work";
  } else {
    readinessLevel = "not_ready";
  }

  // Generate summary
  const summary = generateApplicationSummary(
    overallScore,
    readinessLevel,
    applicationIssues.length,
    Object.values(fieldResults).flatMap((r) => r.strengths)
  );

  return {
    overallScore,
    fieldResults,
    applicationIssues,
    readinessLevel,
    summary,
  };
}

/**
 * AI-powered deep validation using Claude
 */
export async function deepValidateResponse(
  content: string,
  fieldTitle: string,
  category: FieldCategory,
  grantContext: {
    grantTitle: string;
    funder: string;
    funderType: string;
    requirements?: string;
  }
): Promise<{
  score: number;
  feedback: string;
  suggestedRevision?: string;
  keyImprovements: string[];
}> {
  const anthropic = new Anthropic();

  const prompt = `You are a grant writing expert reviewing a response for a ${grantContext.funderType} grant application.

GRANT: ${grantContext.grantTitle}
FUNDER: ${grantContext.funder}
${grantContext.requirements ? `REQUIREMENTS: ${grantContext.requirements}` : ""}

FIELD: ${fieldTitle}
CATEGORY: ${category}

RESPONSE TO REVIEW:
"""
${content}
"""

Evaluate this response as an expert grant reviewer would. Provide:

1. SCORE (0-100): Based on:
   - Clarity and readability
   - Specificity (concrete examples, data)
   - Relevance to the question
   - Persuasiveness
   - Professional tone
   - Alignment with funder priorities

2. FEEDBACK: 2-3 sentences of constructive feedback

3. KEY IMPROVEMENTS: List 2-4 specific improvements that would strengthen this response

4. SUGGESTED REVISION (optional): If the score is below 75, provide a revised version that addresses the main issues while preserving the organization's voice and content

Format your response as JSON:
{
  "score": number,
  "feedback": "string",
  "keyImprovements": ["string", ...],
  "suggestedRevision": "string or null"
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        score: result.score || 70,
        feedback: result.feedback || "Review completed",
        suggestedRevision: result.suggestedRevision || undefined,
        keyImprovements: result.keyImprovements || [],
      };
    }

    return {
      score: 70,
      feedback: "Unable to parse detailed feedback",
      keyImprovements: [],
    };
  } catch (error) {
    console.error("Deep validation error:", error);
    return {
      score: 70,
      feedback: "Validation service temporarily unavailable",
      keyImprovements: [],
    };
  }
}

/**
 * Analyze word frequency in text
 */
function analyzeWordFrequency(
  text: string
): { word: string; count: number }[] {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
    "be", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "must", "shall", "can", "this",
    "that", "these", "those", "it", "its", "they", "them", "their",
    "we", "our", "you", "your", "he", "she", "his", "her", "which",
  ]);

  const frequency: Record<string, number> = {};
  for (const word of words) {
    if (!stopWords.has(word) && word.length > 3) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  }

  return Object.entries(frequency)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculate quality metrics for a response
 */
function calculateQualityMetrics(
  content: string,
  category: FieldCategory,
  issues: ValidationIssue[]
): QualityMetrics {
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const sentenceCount = (content.match(/[.!?]+/g) || []).length;
  const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : wordCount;

  // Issue penalty
  const errorPenalty = issues.filter((i) => i.type === "error").length * 15;
  const warningPenalty = issues.filter((i) => i.type === "warning").length * 5;
  const totalPenalty = Math.min(errorPenalty + warningPenalty, 40);

  // Clarity: based on sentence length and readability
  let clarity = 85;
  if (avgSentenceLength > 30) clarity -= 15;
  if (avgSentenceLength > 40) clarity -= 10;
  if (avgSentenceLength < 10) clarity -= 5;
  clarity = Math.max(50, clarity - totalPenalty * 0.3);

  // Specificity: based on presence of numbers, data, specific terms
  let specificity = 70;
  if (content.match(/\d+%/g)) specificity += 10;
  if (content.match(/\$[\d,]+/g)) specificity += 10;
  if (content.match(/\d+\s*(people|participants|users|beneficiaries)/gi)) specificity += 10;
  if (content.match(/specifically|in particular|for example/gi)) specificity += 5;
  specificity = Math.min(100, Math.max(50, specificity - totalPenalty * 0.4));

  // Relevance: harder to measure without context, use base score with adjustments
  let relevance = 80 - totalPenalty * 0.2;
  relevance = Math.max(50, Math.min(100, relevance));

  // Completeness: based on word count relative to category expectations
  let completeness = 75;
  const categoryReqs = CATEGORY_REQUIREMENTS[category];
  if (categoryReqs?.wordRange) {
    if (wordCount >= categoryReqs.wordRange.min) completeness += 15;
    if (wordCount >= categoryReqs.wordRange.min * 1.5) completeness += 10;
    if (wordCount < categoryReqs.wordRange.min * 0.5) completeness -= 20;
  }
  completeness = Math.max(40, Math.min(100, completeness - totalPenalty * 0.3));

  // Professionalism: based on language quality
  let professionalism = 85;
  if (content.match(/\b(very|really|kind of|sort of)\b/gi)) professionalism -= 5;
  if (content.match(/[!]{2,}/g)) professionalism -= 10;
  if (content.match(/\b(awesome|amazing|incredible)\b/gi)) professionalism -= 5;
  professionalism = Math.max(50, Math.min(100, professionalism - totalPenalty * 0.2));

  // Persuasiveness: based on action verbs and outcome focus
  let persuasiveness = 70;
  if (content.match(/will\s+(achieve|deliver|produce|create|improve)/gi)) persuasiveness += 10;
  if (content.match(/result|impact|outcome|benefit/gi)) persuasiveness += 10;
  if (content.match(/evidence|proven|demonstrated/gi)) persuasiveness += 5;
  persuasiveness = Math.max(50, Math.min(100, persuasiveness - totalPenalty * 0.3));

  // Compliance: based on absence of errors
  let compliance = 100 - errorPenalty - warningPenalty * 0.5;
  compliance = Math.max(40, compliance);

  return {
    overall: Math.round(
      (clarity + specificity + relevance + completeness + professionalism + persuasiveness + compliance) / 7
    ),
    clarity: Math.round(clarity),
    specificity: Math.round(specificity),
    relevance: Math.round(relevance),
    completeness: Math.round(completeness),
    professionalism: Math.round(professionalism),
    persuasiveness: Math.round(persuasiveness),
    compliance: Math.round(compliance),
  };
}

/**
 * Generate application summary
 */
function generateApplicationSummary(
  score: number,
  readiness: string,
  issueCount: number,
  strengths: string[]
): string {
  let summary = "";

  if (readiness === "ready") {
    summary = `Your application is ready for submission with a quality score of ${score}/100. `;
  } else if (readiness === "needs_work") {
    summary = `Your application needs some improvements before submission (score: ${score}/100). `;
  } else {
    summary = `Your application requires significant work before submission (score: ${score}/100). `;
  }

  if (issueCount > 0) {
    summary += `There are ${issueCount} issue(s) to address. `;
  }

  if (strengths.length > 0) {
    summary += `Strengths include: ${strengths.slice(0, 2).join("; ")}.`;
  }

  return summary;
}

/**
 * Get improvement suggestions based on category
 */
export function getImprovementSuggestions(
  category: FieldCategory,
  currentScore: number
): string[] {
  const baseSuggestions: string[] = [];

  if (currentScore < 60) {
    baseSuggestions.push(
      "Add specific data points and statistics to support your claims",
      "Use concrete examples to illustrate your points",
      "Ensure all required information is included"
    );
  } else if (currentScore < 75) {
    baseSuggestions.push(
      "Strengthen your opening statement to immediately engage the reader",
      "Add more measurable outcomes and metrics",
      "Connect your work directly to the funder's stated priorities"
    );
  } else if (currentScore < 90) {
    baseSuggestions.push(
      "Polish language for maximum clarity and impact",
      "Ensure smooth transitions between ideas",
      "Double-check alignment with all stated requirements"
    );
  }

  // Category-specific suggestions
  const categoryMap: Partial<Record<FieldCategory, string[]>> = {
    problem_need: [
      "Include local or regional data specific to your service area",
      "Reference recent research or trends that highlight urgency",
      "Connect the problem to broader societal impacts",
    ],
    solution_approach: [
      "Clearly explain why your approach will work",
      "Reference evidence or best practices supporting your methods",
      "Include a realistic timeline with milestones",
    ],
    outcomes_impact: [
      "Define SMART outcomes (Specific, Measurable, Achievable, Relevant, Time-bound)",
      "Explain your data collection and evaluation methodology",
      "Describe both short-term and long-term impacts",
    ],
    budget_summary: [
      "Justify each budget line item with clear rationale",
      "Show cost-effectiveness or value for money",
      "Mention any matching funds or in-kind contributions",
    ],
    team_qualifications: [
      "Highlight specific credentials relevant to this project",
      "Mention past successes or track record",
      "Describe how the team structure supports project success",
    ],
    sustainability: [
      "Describe multiple funding sources for continuation",
      "Explain how the program will become self-sustaining",
      "Mention any partnerships that support long-term viability",
    ],
  };

  const categorySuggestions = categoryMap[category] || [];

  return [...baseSuggestions, ...categorySuggestions.slice(0, 2)];
}
