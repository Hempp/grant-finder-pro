// Advanced Field Intelligence System
// Understands what each question is asking and maps the right data

import Anthropic from "@anthropic-ai/sdk";
import { UserContext, GrantContext } from "./types";

const anthropic = new Anthropic();

// Field categories that applications commonly ask about
export type FieldCategory =
  | "organization_identity"      // Name, EIN, legal structure
  | "organization_background"    // History, founding date, milestones
  | "mission_vision"            // Mission, vision, values
  | "problem_need"              // Problem statement, needs assessment
  | "solution_approach"         // Your solution, methodology
  | "target_population"         // Who you serve, demographics
  | "geographic_scope"          // Where you operate
  | "project_description"       // What you're proposing
  | "goals_objectives"          // SMART goals, objectives
  | "activities_timeline"       // What you'll do, when
  | "outcomes_impact"           // Expected results, metrics
  | "evaluation_plan"           // How you'll measure success
  | "team_qualifications"       // Key personnel, expertise
  | "organizational_capacity"   // Ability to execute
  | "partnerships"              // Collaborators, partners
  | "budget_summary"            // Overall budget
  | "budget_line_items"         // Detailed costs
  | "budget_justification"      // Why these costs
  | "sustainability"            // Long-term viability
  | "diversified_funding"       // Other funding sources
  | "matching_funds"            // Cost sharing, match
  | "financial_health"          // Revenue, audits, 990
  | "innovation"                // What's new/different
  | "commercialization"         // Path to market
  | "intellectual_property"     // Patents, IP strategy
  | "risk_mitigation"           // Risks and how to address
  | "contact_info"              // Contact details
  | "certifications"            // DUNS, SAM, certifications
  | "attachments"               // Required documents
  | "references"                // Letters, references
  | "other";                    // Catch-all

// Question intent - what the funder really wants to know
export interface QuestionIntent {
  category: FieldCategory;
  subCategory?: string;
  coreQuestion: string;           // What they're really asking
  lookingFor: string[];           // What makes a strong answer
  redFlags: string[];             // What to avoid
  dataNeeded: string[];           // Organization fields needed
  documentSources: string[];      // Relevant document types
  responseStrategy: "direct" | "synthesize" | "generate" | "extract";
}

// Analyzed field with all context needed for generation
export interface AnalyzedField {
  originalQuestion: string;
  intent: QuestionIntent;
  fieldType: "text" | "textarea" | "number" | "date" | "select" | "multiselect" | "file" | "table" | "budget";
  constraints: {
    wordLimit?: number;
    characterLimit?: number;
    minLength?: number;
    options?: string[];           // For select fields
    format?: string;              // For dates, numbers
    currency?: boolean;
  };
  relevantData: Record<string, string>;  // Mapped org data
  extractedContent: string[];            // Content from documents
  previousAnswers: string[];             // Similar answers from past apps
  confidenceLevel: "high" | "medium" | "low" | "needs_input";
  missingInfo: string[];
}

// Common question patterns mapped to categories
const QUESTION_PATTERNS: Record<string, { category: FieldCategory; keywords: string[] }> = {
  org_name: {
    category: "organization_identity",
    keywords: ["organization name", "legal name", "applicant name", "company name", "entity name"]
  },
  ein: {
    category: "organization_identity",
    keywords: ["ein", "tax id", "federal id", "employer identification", "tax exempt"]
  },
  duns: {
    category: "certifications",
    keywords: ["duns", "sam", "uei", "unique entity", "cage code"]
  },
  address: {
    category: "contact_info",
    keywords: ["address", "location", "street", "city", "state", "zip", "mailing"]
  },
  contact: {
    category: "contact_info",
    keywords: ["contact", "phone", "email", "authorized representative", "project director", "pi name"]
  },
  mission: {
    category: "mission_vision",
    keywords: ["mission", "purpose", "what does your organization do", "organization description"]
  },
  vision: {
    category: "mission_vision",
    keywords: ["vision", "long-term goal", "ultimate aim", "aspiration"]
  },
  history: {
    category: "organization_background",
    keywords: ["history", "founded", "established", "background", "how long", "years in operation"]
  },
  problem: {
    category: "problem_need",
    keywords: ["problem", "need", "challenge", "issue", "gap", "what problem", "why is this needed"]
  },
  solution: {
    category: "solution_approach",
    keywords: ["solution", "approach", "methodology", "how will you", "proposed project", "what will you do"]
  },
  target: {
    category: "target_population",
    keywords: ["target", "serve", "beneficiaries", "population", "who will benefit", "demographics", "clients"]
  },
  geography: {
    category: "geographic_scope",
    keywords: ["geographic", "service area", "region", "where", "location of project", "communities served"]
  },
  goals: {
    category: "goals_objectives",
    keywords: ["goal", "objective", "outcome", "what do you hope to achieve", "expected results"]
  },
  activities: {
    category: "activities_timeline",
    keywords: ["activities", "timeline", "milestones", "schedule", "work plan", "tasks", "deliverables"]
  },
  evaluation: {
    category: "evaluation_plan",
    keywords: ["evaluation", "measure", "assess", "metrics", "indicators", "how will you know", "success"]
  },
  team: {
    category: "team_qualifications",
    keywords: ["team", "staff", "personnel", "qualifications", "experience", "who will", "key people", "bios"]
  },
  capacity: {
    category: "organizational_capacity",
    keywords: ["capacity", "capability", "infrastructure", "resources", "able to", "track record"]
  },
  partners: {
    category: "partnerships",
    keywords: ["partner", "collaborat", "coalition", "alliance", "working with", "mou", "letter of support"]
  },
  budget: {
    category: "budget_summary",
    keywords: ["budget", "cost", "funding", "amount requested", "total project cost"]
  },
  budget_detail: {
    category: "budget_line_items",
    keywords: ["line item", "personnel cost", "equipment", "supplies", "travel", "indirect", "fringe"]
  },
  budget_justify: {
    category: "budget_justification",
    keywords: ["justify", "explain cost", "why this amount", "budget narrative", "cost explanation"]
  },
  sustainability: {
    category: "sustainability",
    keywords: ["sustainability", "after the grant", "long-term", "continue", "maintain", "future funding"]
  },
  other_funding: {
    category: "diversified_funding",
    keywords: ["other funding", "additional support", "funding sources", "revenue", "diversified"]
  },
  match: {
    category: "matching_funds",
    keywords: ["match", "cost share", "in-kind", "leverage", "matching funds"]
  },
  financial: {
    category: "financial_health",
    keywords: ["financial statement", "990", "audit", "revenue", "financial health", "fiscal"]
  },
  innovation: {
    category: "innovation",
    keywords: ["innovation", "novel", "unique", "different", "new approach", "cutting-edge"]
  },
  commercial: {
    category: "commercialization",
    keywords: ["commercial", "market", "customer", "revenue model", "business model", "scale"]
  },
  ip: {
    category: "intellectual_property",
    keywords: ["intellectual property", "patent", "trademark", "license", "ip strategy"]
  },
  risk: {
    category: "risk_mitigation",
    keywords: ["risk", "challenge", "obstacle", "barrier", "mitigation", "contingency"]
  },
  impact: {
    category: "outcomes_impact",
    keywords: ["impact", "difference", "change", "benefit", "outcome", "result"]
  }
};

// Analyze a question to understand what it's really asking
export async function analyzeQuestion(
  question: string,
  grant: GrantContext,
  fieldContext?: { options?: string[]; placeholder?: string; helpText?: string }
): Promise<QuestionIntent> {
  // First try pattern matching for common questions
  const patternMatch = matchQuestionPattern(question);
  if (patternMatch && patternMatch.confidence > 0.8) {
    return buildIntentFromPattern(patternMatch.category, question, grant);
  }

  // Use AI for complex or ambiguous questions
  const prompt = `Analyze this grant application question and determine what the funder really wants to know.

QUESTION: "${question}"
${fieldContext?.helpText ? `HELP TEXT: "${fieldContext.helpText}"` : ""}
${fieldContext?.placeholder ? `PLACEHOLDER: "${fieldContext.placeholder}"` : ""}
${fieldContext?.options ? `OPTIONS: ${fieldContext.options.join(", ")}` : ""}

GRANT CONTEXT:
- Funder: ${grant.funder}
- Grant Type: ${grant.type || "General"}
- Focus: ${grant.description?.substring(0, 300) || "Not specified"}

Categorize this question into ONE of these categories:
${Object.keys(QUESTION_PATTERNS).map(k => `- ${QUESTION_PATTERNS[k].category}`).filter((v, i, a) => a.indexOf(v) === i).join("\n")}

Respond with JSON only:
{
  "category": "category_name",
  "subCategory": "optional specific aspect",
  "coreQuestion": "what they're really asking in simple terms",
  "lookingFor": ["what makes a strong answer", "specific elements they want"],
  "redFlags": ["what to avoid", "common mistakes"],
  "dataNeeded": ["organization fields needed: name, mission, problemStatement, solution, targetMarket, teamSize, founderBackground, annualRevenue, fundingSeeking, previousFunding, ein, website, city, state"],
  "documentSources": ["relevant document types: financials, 990, pitch_deck, business_plan, resume, letters_of_support"],
  "responseStrategy": "direct|synthesize|generate|extract"
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type === "text") {
      const parsed = JSON.parse(content.text);
      return {
        category: parsed.category || "other",
        subCategory: parsed.subCategory,
        coreQuestion: parsed.coreQuestion || question,
        lookingFor: parsed.lookingFor || [],
        redFlags: parsed.redFlags || [],
        dataNeeded: parsed.dataNeeded || [],
        documentSources: parsed.documentSources || [],
        responseStrategy: parsed.responseStrategy || "generate",
      };
    }
  } catch (error) {
    console.error("Failed to analyze question:", error);
  }

  // Fallback
  return {
    category: "other",
    coreQuestion: question,
    lookingFor: [],
    redFlags: [],
    dataNeeded: [],
    documentSources: [],
    responseStrategy: "generate",
  };
}

// Pattern match a question to known categories
function matchQuestionPattern(question: string): { category: FieldCategory; confidence: number } | null {
  const lowerQuestion = question.toLowerCase();
  let bestMatch: { category: FieldCategory; confidence: number } | null = null;
  let highestScore = 0;

  for (const [, pattern] of Object.entries(QUESTION_PATTERNS)) {
    let score = 0;
    for (const keyword of pattern.keywords) {
      if (lowerQuestion.includes(keyword)) {
        score += keyword.split(" ").length; // Longer matches score higher
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = {
        category: pattern.category,
        confidence: Math.min(score / 3, 1), // Normalize
      };
    }
  }

  return bestMatch;
}

// Build intent from pattern match
function buildIntentFromPattern(
  category: FieldCategory,
  question: string,
  grant: GrantContext
): QuestionIntent {
  const intents: Record<FieldCategory, Partial<QuestionIntent>> = {
    organization_identity: {
      lookingFor: ["Legal registered name", "Correct EIN format", "Consistency across documents"],
      redFlags: ["DBA vs legal name confusion", "Incorrect EIN"],
      dataNeeded: ["name", "ein", "legalStructure"],
      responseStrategy: "direct",
    },
    mission_vision: {
      lookingFor: ["Clear articulation of purpose", "Alignment with funder priorities", "Compelling narrative"],
      redFlags: ["Too vague", "Doesn't match funder focus", "Jargon-heavy"],
      dataNeeded: ["mission", "vision"],
      responseStrategy: "direct",
    },
    problem_need: {
      lookingFor: ["Data-backed need", "Clear problem definition", "Urgency", "Local context"],
      redFlags: ["No evidence", "Too broad", "Doesn't connect to solution"],
      dataNeeded: ["problemStatement", "targetMarket"],
      documentSources: ["needs_assessment", "research"],
      responseStrategy: "synthesize",
    },
    solution_approach: {
      lookingFor: ["Clear methodology", "Evidence-based approach", "Innovation", "Feasibility"],
      redFlags: ["Vague plans", "No evidence of effectiveness", "Unrealistic"],
      dataNeeded: ["solution"],
      documentSources: ["business_plan", "pitch_deck"],
      responseStrategy: "synthesize",
    },
    target_population: {
      lookingFor: ["Specific demographics", "Numbers served", "Selection criteria", "Needs of population"],
      redFlags: ["Too vague", "No numbers", "Doesn't match funder priorities"],
      dataNeeded: ["targetMarket"],
      responseStrategy: "synthesize",
    },
    team_qualifications: {
      lookingFor: ["Relevant experience", "Specific credentials", "Track record", "Roles defined"],
      redFlags: ["Generic bios", "No relevant experience", "Key positions unfilled"],
      dataNeeded: ["founderBackground", "teamSize"],
      documentSources: ["resume", "bios"],
      responseStrategy: "synthesize",
    },
    budget_summary: {
      lookingFor: ["Clear total", "Reasonable costs", "Alignment with activities"],
      redFlags: ["Math errors", "Unrealistic", "Missing categories"],
      dataNeeded: ["fundingSeeking"],
      documentSources: ["financials", "budget_template"],
      responseStrategy: "extract",
    },
    budget_line_items: {
      lookingFor: ["Detailed breakdown", "Justified costs", "Industry-standard rates"],
      redFlags: ["Round numbers everywhere", "Missing fringe", "No indirect"],
      dataNeeded: ["fundingSeeking"],
      documentSources: ["financials", "budget_template"],
      responseStrategy: "generate",
    },
    sustainability: {
      lookingFor: ["Concrete plan", "Diverse funding sources", "Realistic timeline"],
      redFlags: ["Only relying on more grants", "Vague", "No plan"],
      dataNeeded: ["annualRevenue", "previousFunding"],
      documentSources: ["financials"],
      responseStrategy: "generate",
    },
    outcomes_impact: {
      lookingFor: ["Measurable outcomes", "Realistic targets", "Clear metrics"],
      redFlags: ["Only outputs not outcomes", "Unmeasurable", "Unrealistic numbers"],
      dataNeeded: ["solution", "targetMarket"],
      responseStrategy: "generate",
    },
    contact_info: {
      lookingFor: ["Complete information", "Correct format", "Authorized person"],
      redFlags: ["Incomplete", "Wrong format"],
      dataNeeded: ["city", "state", "website"],
      responseStrategy: "direct",
    },
    certifications: {
      lookingFor: ["Valid numbers", "Active registration", "Correct format"],
      redFlags: ["Expired", "Invalid format"],
      dataNeeded: ["ein"],
      documentSources: ["sam_registration", "certifications"],
      responseStrategy: "direct",
    },
    geographic_scope: {
      lookingFor: ["Specific area", "Rationale for scope", "Local knowledge"],
      redFlags: ["Too broad without justification"],
      dataNeeded: ["city", "state", "targetMarket"],
      responseStrategy: "synthesize",
    },
    project_description: {
      lookingFor: ["Clear description", "Defined scope", "Logical flow"],
      redFlags: ["Too vague", "Scope creep", "Unrealistic"],
      dataNeeded: ["solution", "problemStatement"],
      documentSources: ["business_plan"],
      responseStrategy: "synthesize",
    },
    goals_objectives: {
      lookingFor: ["SMART goals", "Alignment with need", "Measurable"],
      redFlags: ["Not measurable", "Too many", "Not aligned"],
      dataNeeded: ["solution"],
      responseStrategy: "generate",
    },
    activities_timeline: {
      lookingFor: ["Specific activities", "Realistic timeline", "Milestones"],
      redFlags: ["Vague", "Unrealistic", "Missing key activities"],
      dataNeeded: ["solution"],
      documentSources: ["project_plan"],
      responseStrategy: "generate",
    },
    evaluation_plan: {
      lookingFor: ["Clear metrics", "Data collection plan", "Use of results"],
      redFlags: ["No metrics", "Only outputs", "No plan for use"],
      dataNeeded: [],
      responseStrategy: "generate",
    },
    organizational_capacity: {
      lookingFor: ["Relevant experience", "Infrastructure", "Track record"],
      redFlags: ["No experience", "Overpromising", "No track record"],
      dataNeeded: ["teamSize", "previousFunding", "founderBackground"],
      documentSources: ["financials", "990"],
      responseStrategy: "synthesize",
    },
    partnerships: {
      lookingFor: ["Defined roles", "Letters of support", "Strong partners"],
      redFlags: ["Vague commitments", "No letters", "Weak partners"],
      dataNeeded: [],
      documentSources: ["letters_of_support", "mou"],
      responseStrategy: "synthesize",
    },
    financial_health: {
      lookingFor: ["Clean audit", "Diverse revenue", "Stability"],
      redFlags: ["Deficits", "Single funder dependency", "No audit"],
      dataNeeded: ["annualRevenue", "previousFunding"],
      documentSources: ["financials", "990", "audit"],
      responseStrategy: "extract",
    },
    budget_justification: {
      lookingFor: ["Clear rationale", "Connection to activities", "Reasonable rates"],
      redFlags: ["No justification", "Disconnected from work", "Inflated"],
      dataNeeded: ["fundingSeeking"],
      documentSources: ["budget_template"],
      responseStrategy: "generate",
    },
    diversified_funding: {
      lookingFor: ["Multiple sources", "Realistic projections", "Commitment letters"],
      redFlags: ["Only grants", "Speculative", "No documentation"],
      dataNeeded: ["previousFunding", "annualRevenue"],
      documentSources: ["financials"],
      responseStrategy: "synthesize",
    },
    matching_funds: {
      lookingFor: ["Documented match", "Eligible sources", "Calculations"],
      redFlags: ["Undocumented", "Ineligible", "Math errors"],
      dataNeeded: ["previousFunding"],
      documentSources: ["commitment_letters", "financials"],
      responseStrategy: "extract",
    },
    innovation: {
      lookingFor: ["Clear differentiation", "Evidence base", "Feasibility"],
      redFlags: ["Not actually innovative", "Unproven", "Unrealistic"],
      dataNeeded: ["solution"],
      documentSources: ["research", "pitch_deck"],
      responseStrategy: "synthesize",
    },
    commercialization: {
      lookingFor: ["Market analysis", "Revenue model", "Customer validation"],
      redFlags: ["No market research", "Unrealistic projections"],
      dataNeeded: ["targetMarket", "annualRevenue", "solution"],
      documentSources: ["business_plan", "pitch_deck"],
      responseStrategy: "synthesize",
    },
    intellectual_property: {
      lookingFor: ["Clear IP strategy", "Protection plan", "Freedom to operate"],
      redFlags: ["No strategy", "Infringement risk"],
      dataNeeded: [],
      documentSources: ["patents", "ip_documentation"],
      responseStrategy: "generate",
    },
    risk_mitigation: {
      lookingFor: ["Identified risks", "Mitigation strategies", "Contingencies"],
      redFlags: ["No risks identified", "No mitigation", "Unrealistic"],
      dataNeeded: ["solution"],
      responseStrategy: "generate",
    },
    organization_background: {
      lookingFor: ["Key milestones", "Relevant history", "Growth trajectory"],
      redFlags: ["Too brief", "Irrelevant details"],
      dataNeeded: ["mission", "founderBackground", "previousFunding"],
      responseStrategy: "synthesize",
    },
    attachments: {
      lookingFor: ["Required documents", "Correct format", "Complete"],
      redFlags: ["Missing documents", "Wrong format"],
      dataNeeded: [],
      documentSources: ["all"],
      responseStrategy: "direct",
    },
    references: {
      lookingFor: ["Strong references", "Relevant to project", "Confirmed"],
      redFlags: ["Weak references", "Not confirmed"],
      dataNeeded: [],
      documentSources: ["letters_of_support"],
      responseStrategy: "direct",
    },
    other: {
      lookingFor: [],
      redFlags: [],
      dataNeeded: [],
      responseStrategy: "generate",
    },
  };

  const baseIntent = intents[category] || intents.other;

  return {
    category,
    coreQuestion: question,
    lookingFor: baseIntent.lookingFor || [],
    redFlags: baseIntent.redFlags || [],
    dataNeeded: baseIntent.dataNeeded || [],
    documentSources: baseIntent.documentSources || [],
    responseStrategy: baseIntent.responseStrategy || "generate",
  };
}

// Map organization data to a field based on analyzed intent
export function mapDataToField(
  intent: QuestionIntent,
  context: UserContext
): { data: Record<string, string>; missing: string[]; confidence: "high" | "medium" | "low" } {
  const data: Record<string, string> = {};
  const missing: string[] = [];
  const org = context.organization;

  if (!org) {
    return { data: {}, missing: intent.dataNeeded, confidence: "low" };
  }

  for (const field of intent.dataNeeded) {
    const value = org[field as keyof typeof org];
    if (value && String(value).trim()) {
      data[field] = String(value);
    } else {
      missing.push(field);
    }
  }

  // Calculate confidence based on data availability
  const dataRatio = Object.keys(data).length / Math.max(intent.dataNeeded.length, 1);
  let confidence: "high" | "medium" | "low" = "low";

  if (dataRatio >= 0.8) {
    confidence = "high";
  } else if (dataRatio >= 0.5) {
    confidence = "medium";
  }

  return { data, missing, confidence };
}

// Extract relevant content from documents
export function extractFromDocuments(
  intent: QuestionIntent,
  documents: UserContext["documents"]
): string[] {
  const relevant: string[] = [];

  for (const doc of documents) {
    if (!doc.parsedData) continue;

    // Check if document type matches what we need
    const docType = doc.type.toLowerCase();
    const isRelevant = intent.documentSources.some(source =>
      source === "all" || docType.includes(source) || source.includes(docType)
    );

    if (isRelevant) {
      relevant.push(`[${doc.name}]: ${doc.parsedData.substring(0, 1500)}`);
    }
  }

  return relevant;
}

// Find similar answers from previous applications
export function findPreviousAnswers(
  intent: QuestionIntent,
  previousApps: UserContext["previousApplications"]
): string[] {
  const similar: string[] = [];
  const categoryKeywords = QUESTION_PATTERNS[Object.keys(QUESTION_PATTERNS).find(
    k => QUESTION_PATTERNS[k].category === intent.category
  ) || ""]?.keywords || [];

  for (const app of previousApps) {
    // Check narrative for relevant content
    if (app.narrative) {
      const lowerNarrative = app.narrative.toLowerCase();
      const hasRelevantContent = categoryKeywords.some(kw => lowerNarrative.includes(kw));
      if (hasRelevantContent) {
        similar.push(`[Previous: ${app.grantTitle}]: ${app.narrative.substring(0, 800)}`);
      }
    }

    // Check responses
    if (app.responses) {
      try {
        const responses = JSON.parse(app.responses);
        for (const [key, value] of Object.entries(responses)) {
          if (typeof value === "string" && value.length > 50) {
            const lowerKey = key.toLowerCase();
            const isRelevant = categoryKeywords.some(kw => lowerKey.includes(kw));
            if (isRelevant) {
              similar.push(`[Previous ${key}]: ${value.substring(0, 500)}`);
            }
          }
        }
      } catch {
        // Skip invalid JSON
      }
    }
  }

  return similar.slice(0, 3); // Limit to top 3
}

// Full field analysis - combines all intelligence
export async function analyzeField(
  question: string,
  grant: GrantContext,
  context: UserContext,
  fieldMeta?: {
    type?: string;
    options?: string[];
    wordLimit?: number;
    characterLimit?: number;
    placeholder?: string;
    helpText?: string;
    required?: boolean;
  }
): Promise<AnalyzedField> {
  // Step 1: Understand the question
  const intent = await analyzeQuestion(question, grant, fieldMeta);

  // Step 2: Map organization data
  const { data, missing, confidence } = mapDataToField(intent, context);

  // Step 3: Extract from documents
  const extractedContent = extractFromDocuments(intent, context.documents);

  // Step 4: Find previous answers
  const previousAnswers = findPreviousAnswers(intent, context.previousApplications);

  // Step 5: Determine field type
  let fieldType: AnalyzedField["fieldType"] = "textarea";
  if (fieldMeta?.type) {
    fieldType = fieldMeta.type as AnalyzedField["fieldType"];
  } else if (fieldMeta?.options?.length) {
    fieldType = "select";
  } else if (fieldMeta?.characterLimit && fieldMeta.characterLimit < 200) {
    fieldType = "text";
  } else if (intent.category === "budget_line_items") {
    fieldType = "table";
  } else if (intent.category === "budget_summary" && question.toLowerCase().includes("amount")) {
    fieldType = "number";
  }

  // Step 6: Determine overall confidence
  let confidenceLevel: AnalyzedField["confidenceLevel"] = confidence;
  if (extractedContent.length > 0) {
    confidenceLevel = confidenceLevel === "low" ? "medium" : confidenceLevel;
  }
  if (previousAnswers.length > 0) {
    confidenceLevel = confidenceLevel === "low" ? "medium" : "high";
  }
  if (missing.length > 0 && intent.responseStrategy !== "generate") {
    confidenceLevel = "needs_input";
  }

  return {
    originalQuestion: question,
    intent,
    fieldType,
    constraints: {
      wordLimit: fieldMeta?.wordLimit,
      characterLimit: fieldMeta?.characterLimit,
      options: fieldMeta?.options,
    },
    relevantData: data,
    extractedContent,
    previousAnswers,
    confidenceLevel,
    missingInfo: missing,
  };
}

// Batch analyze multiple fields efficiently
export async function analyzeFields(
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
  context: UserContext
): Promise<Map<string, AnalyzedField>> {
  const results = new Map<string, AnalyzedField>();

  // Process in parallel batches of 5
  const batchSize = 5;
  for (let i = 0; i < fields.length; i += batchSize) {
    const batch = fields.slice(i, i + batchSize);
    const analyses = await Promise.all(
      batch.map(field => analyzeField(field.question, grant, context, field.meta))
    );
    batch.forEach((field, index) => {
      results.set(field.id, analyses[index]);
    });
  }

  return results;
}
