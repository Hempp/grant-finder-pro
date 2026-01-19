// AI Grant Writing Service
// Core engine for auto-generating grant applications

import Anthropic from "@anthropic-ai/sdk";
import {
  ApplicationSection,
  ResponseData,
  UserContext,
  GrantContext,
  SectionMapping,
  GenerationResult,
  Suggestion,
  FunderType,
  FUNDER_TONE_CONFIG,
  SECTION_TEMPLATES,
} from "./types";

const anthropic = new Anthropic();

// Determine funder type from grant metadata
export function determineFunderType(grant: GrantContext): FunderType {
  const type = grant.type?.toLowerCase() || "";
  const funder = grant.funder.toLowerCase();

  if (type.includes("federal") || funder.includes("nsf") || funder.includes("nih") || funder.includes("doe") || funder.includes("sbir") || funder.includes("sttr")) {
    return "federal";
  }
  if (type.includes("foundation") || funder.includes("foundation") || funder.includes("trust") || funder.includes("fund")) {
    return "foundation";
  }
  if (type.includes("corporate") || funder.includes("inc") || funder.includes("corp") || funder.includes("llc")) {
    return "corporate";
  }
  if (type.includes("state") || grant.category?.toLowerCase().includes("state")) {
    return "state";
  }

  // Default to foundation tone as it's most versatile
  return "foundation";
}

// Parse grant requirements into structured sections
export async function parseGrantRequirements(grant: GrantContext): Promise<ApplicationSection[]> {
  const funderType = determineFunderType(grant);

  // Check if we have a matching template
  const templateKey = getTemplateKey(grant);
  if (templateKey && SECTION_TEMPLATES[templateKey]) {
    return SECTION_TEMPLATES[templateKey];
  }

  // Use AI to parse requirements if no template matches
  const prompt = `Analyze this grant opportunity and extract the required application sections.

Grant Details:
- Title: ${grant.title}
- Funder: ${grant.funder}
- Type: ${grant.type || "Unknown"}
- Description: ${grant.description || "Not provided"}
- Requirements: ${grant.requirements || "Not provided"}
- Eligibility: ${grant.eligibility || "Not provided"}

Based on the grant information, identify all required application sections. For each section, provide:
1. A unique ID (snake_case)
2. The section type (narrative, short_answer, budget, attachment, checkbox, select, table, contact_info)
3. Title
4. Instructions/requirements
5. Whether it's required
6. Word limit if applicable
7. Evaluation criteria if mentioned
8. Order number

Return your analysis as a JSON array of sections. If requirements aren't specified, infer standard sections for a ${funderType} grant.

Return ONLY valid JSON, no other text.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type === "text") {
      const parsed = JSON.parse(content.text);
      return parsed.map((section: Partial<ApplicationSection>, index: number) => ({
        id: section.id || `section_${index + 1}`,
        type: section.type || "narrative",
        title: section.title || `Section ${index + 1}`,
        instructions: section.instructions || "",
        required: section.required ?? true,
        wordLimit: section.wordLimit,
        characterLimit: section.characterLimit,
        evaluationCriteria: section.evaluationCriteria,
        relatedProfileFields: section.relatedProfileFields || [],
        order: section.order || index + 1,
      }));
    }
  } catch (error) {
    console.error("Failed to parse grant requirements:", error);
  }

  // Fallback to simple application template
  return SECTION_TEMPLATES.simple_application;
}

// Get template key based on grant characteristics
function getTemplateKey(grant: GrantContext): string | null {
  const title = grant.title.toLowerCase();
  const funder = grant.funder.toLowerCase();
  const category = (grant.category || "").toLowerCase();

  if (category.includes("sbir") || title.includes("sbir") || title.includes("phase 1") || title.includes("phase i")) {
    return "sbir_phase1";
  }
  if (funder.includes("foundation") || funder.includes("trust")) {
    return "foundation_general";
  }

  return null;
}

// Gather user context from profile and documents
export async function gatherUserContext(
  organization: UserContext["organization"],
  documents: UserContext["documents"],
  previousApplications: UserContext["previousApplications"]
): Promise<UserContext> {
  return {
    organization,
    documents,
    previousApplications,
  };
}

// Map user data to application sections
export async function mapDataToSections(
  context: UserContext,
  sections: ApplicationSection[]
): Promise<SectionMapping[]> {
  const mappings: SectionMapping[] = [];

  for (const section of sections) {
    const mapping = await analyzeDataFit(section, context);
    mappings.push(mapping);
  }

  return mappings;
}

// Analyze how well user data fits a section
async function analyzeDataFit(
  section: ApplicationSection,
  context: UserContext
): Promise<SectionMapping> {
  const org = context.organization;
  const relatedFields = section.relatedProfileFields;
  const availableFields: string[] = [];
  const missingFields: string[] = [];

  // Check which related fields have data
  if (org) {
    for (const field of relatedFields) {
      const value = org[field as keyof typeof org];
      if (value && String(value).trim()) {
        availableFields.push(field);
      } else {
        missingFields.push(field);
      }
    }
  }

  // Check if we have relevant documents
  const relevantDocs = context.documents.filter((doc) => {
    const docContent = (doc.parsedData || "").toLowerCase();
    const sectionTitle = section.title.toLowerCase();
    return (
      docContent.includes(sectionTitle) ||
      sectionTitle.includes(doc.type) ||
      (section.type === "budget" && doc.type === "financials")
    );
  });

  // Check previous applications for similar sections
  const previousContent = context.previousApplications.find((app) => {
    const responses = app.responses ? JSON.parse(app.responses) : {};
    return Object.keys(responses).some(
      (key) => key.toLowerCase().includes(section.id) || section.id.includes(key.toLowerCase())
    );
  });

  // Determine strategy and relevance
  let strategy: SectionMapping["strategy"] = "generate";
  let relevanceScore = 30; // Base score

  if (availableFields.length > 0) {
    relevanceScore += availableFields.length * 15;
    strategy = availableFields.length >= relatedFields.length * 0.7 ? "direct" : "adapt";
  }

  if (relevantDocs.length > 0) {
    relevanceScore += 20;
    strategy = strategy === "generate" ? "adapt" : strategy;
  }

  if (previousContent) {
    relevanceScore += 25;
    strategy = "adapt";
  }

  if (missingFields.length === relatedFields.length && relevantDocs.length === 0) {
    strategy = "missing";
    relevanceScore = Math.min(relevanceScore, 20);
  }

  return {
    sectionId: section.id,
    strategy,
    sourceFields: availableFields,
    relevanceScore: Math.min(relevanceScore, 100),
    notes:
      missingFields.length > 0
        ? `Missing data for: ${missingFields.join(", ")}`
        : undefined,
  };
}

// Generate content for a single section
export async function generateSectionContent(
  section: ApplicationSection,
  context: UserContext,
  mapping: SectionMapping,
  grant: GrantContext
): Promise<ResponseData> {
  const funderType = determineFunderType(grant);
  const toneConfig = FUNDER_TONE_CONFIG[funderType];
  const org = context.organization;

  // Build context from available data
  const contextData: Record<string, string> = {};
  if (org) {
    for (const field of mapping.sourceFields) {
      const value = org[field as keyof typeof org];
      if (value) {
        contextData[field] = String(value);
      }
    }
  }

  // Add relevant document content
  const relevantDocs = context.documents
    .filter((doc) => doc.parsedData)
    .map((doc) => `[${doc.type}]: ${doc.parsedData?.substring(0, 2000)}`)
    .join("\n\n");

  // Find similar content from previous applications
  let previousContent = "";
  for (const app of context.previousApplications) {
    if (app.narrative && section.type === "narrative") {
      previousContent = app.narrative.substring(0, 1500);
      break;
    }
  }

  const prompt = buildGenerationPrompt(
    section,
    grant,
    contextData,
    relevantDocs,
    previousContent,
    toneConfig
  );

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: section.wordLimit ? section.wordLimit * 2 : 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type === "text") {
      const generatedText = content.text;
      const wordCount = generatedText.split(/\s+/).length;

      // Determine if user input is needed
      const needsUserInput = mapping.strategy === "missing" || mapping.relevanceScore < 40;
      let userInputPrompt: string | undefined;

      if (needsUserInput) {
        userInputPrompt = generateInputPrompt(section, mapping);
      }

      return {
        sectionId: section.id,
        content: generatedText,
        aiGenerated: true,
        userEdited: false,
        wordCount,
        confidenceScore: calculateConfidence(mapping, section, wordCount),
        sourceReferences: mapping.sourceFields,
        needsUserInput,
        userInputPrompt,
        generatedAt: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error(`Failed to generate content for section ${section.id}:`, error);
  }

  // Return placeholder if generation fails
  return {
    sectionId: section.id,
    content: "",
    aiGenerated: false,
    userEdited: false,
    wordCount: 0,
    confidenceScore: 0,
    sourceReferences: [],
    needsUserInput: true,
    userInputPrompt: `Please provide content for: ${section.title}`,
    generatedAt: new Date().toISOString(),
  };
}

// Build the generation prompt
function buildGenerationPrompt(
  section: ApplicationSection,
  grant: GrantContext,
  contextData: Record<string, string>,
  documents: string,
  previousContent: string,
  toneConfig: (typeof FUNDER_TONE_CONFIG)[FunderType]
): string {
  const wordLimit = section.wordLimit || 500;

  return `You are an expert grant writer with 30+ years of experience securing funding for organizations. Write content for the following grant application section.

## GRANT INFORMATION
- Grant: ${grant.title}
- Funder: ${grant.funder}
- Amount: ${grant.amount || "Not specified"}
- Description: ${grant.description || "Not provided"}

## SECTION TO WRITE
- Title: ${section.title}
- Type: ${section.type}
- Instructions: ${section.instructions}
- Word Limit: ${wordLimit} words
${section.evaluationCriteria ? `- Evaluation Criteria: ${section.evaluationCriteria.join(", ")}` : ""}

## ORGANIZATION DATA
${Object.entries(contextData)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

${documents ? `## RELEVANT DOCUMENTS\n${documents}` : ""}

${previousContent ? `## PREVIOUS SIMILAR CONTENT (for reference)\n${previousContent}` : ""}

## WRITING GUIDELINES
- Tone: ${toneConfig.tone}
- Emphasize: ${toneConfig.emphasis.join(", ")}
- Avoid: ${toneConfig.avoid.join(", ")}

## REQUIREMENTS
1. Write exactly what the section requires
2. Stay within ${wordLimit} words
3. Be specific and use concrete examples where possible
4. Use data and metrics when available
5. Connect directly to the funder's priorities
6. If critical information is missing, write the best possible content and note what's needed

Write the section content now. Do not include the section title - just the content.`;
}

// Calculate confidence score
function calculateConfidence(
  mapping: SectionMapping,
  section: ApplicationSection,
  wordCount: number
): number {
  let score = mapping.relevanceScore;

  // Adjust based on word count relative to limit
  if (section.wordLimit) {
    const ratio = wordCount / section.wordLimit;
    if (ratio >= 0.7 && ratio <= 1.0) {
      score += 10;
    } else if (ratio < 0.5) {
      score -= 15;
    } else if (ratio > 1.2) {
      score -= 10;
    }
  }

  // Penalize if we're mostly generating without data
  if (mapping.strategy === "generate") {
    score -= 20;
  } else if (mapping.strategy === "missing") {
    score = Math.min(score, 25);
  }

  return Math.max(0, Math.min(100, score));
}

// Generate prompt for user input
function generateInputPrompt(section: ApplicationSection, mapping: SectionMapping): string {
  if (mapping.notes) {
    return `To improve this section, please provide: ${mapping.notes.replace("Missing data for: ", "")}`;
  }
  return `Please review and enhance this ${section.title} section with specific details about your organization.`;
}

// Generate suggestions for improvement
export function generateSuggestions(
  sections: ApplicationSection[],
  responses: Record<string, ResponseData>,
  mappings: SectionMapping[]
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  for (const section of sections) {
    const response = responses[section.id];
    const mapping = mappings.find((m) => m.sectionId === section.id);

    if (!response || !mapping) continue;

    // Check for missing required content
    if (section.required && response.needsUserInput) {
      suggestions.push({
        sectionId: section.id,
        type: "missing_info",
        message: `The "${section.title}" section needs additional information: ${response.userInputPrompt}`,
        priority: "high",
      });
    }

    // Check for low confidence
    if (response.confidenceScore < 50 && !response.needsUserInput) {
      suggestions.push({
        sectionId: section.id,
        type: "improvement",
        message: `The "${section.title}" section could be strengthened with more specific details or data.`,
        priority: "medium",
      });
    }

    // Check word count
    if (section.wordLimit && response.wordCount > section.wordLimit) {
      suggestions.push({
        sectionId: section.id,
        type: "warning",
        message: `The "${section.title}" section exceeds the ${section.wordLimit} word limit by ${response.wordCount - section.wordLimit} words.`,
        priority: "high",
      });
    }

    // Check for very short responses on narrative sections
    if (section.type === "narrative" && response.wordCount < 50) {
      suggestions.push({
        sectionId: section.id,
        type: "warning",
        message: `The "${section.title}" section seems too brief. Consider expanding with more details.`,
        priority: "medium",
      });
    }
  }

  return suggestions;
}

// Main generation function - orchestrates the full workflow
export async function generateApplication(
  grant: GrantContext,
  userContext: UserContext
): Promise<GenerationResult> {
  // Step 1: Parse grant requirements into sections
  const sections = await parseGrantRequirements(grant);

  // Step 2: Map user data to sections
  const mappings = await mapDataToSections(userContext, sections);

  // Step 3: Generate content for each section
  const responses: Record<string, ResponseData> = {};

  for (const section of sections) {
    const mapping = mappings.find((m) => m.sectionId === section.id);
    if (mapping) {
      const response = await generateSectionContent(section, userContext, mapping, grant);
      responses[section.id] = response;
    }
  }

  // Step 4: Calculate completion and confidence scores
  const completedSections = Object.values(responses).filter(
    (r) => r.content && r.content.length > 0 && !r.needsUserInput
  );
  const completionScore = Math.round((completedSections.length / sections.length) * 100);

  const confidenceScores = Object.values(responses).map((r) => r.confidenceScore);
  const overallConfidence = Math.round(
    confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
  );

  // Step 5: Identify missing requirements
  const missingRequirements = sections
    .filter((s) => s.required && responses[s.id]?.needsUserInput)
    .map((s) => s.title);

  // Step 6: Generate suggestions
  const suggestions = generateSuggestions(sections, responses, mappings);

  return {
    sections,
    responses,
    completionScore,
    overallConfidence,
    missingRequirements,
    suggestions,
  };
}

// Regenerate a single section with updated context or instructions
export async function regenerateSection(
  section: ApplicationSection,
  grant: GrantContext,
  userContext: UserContext,
  customInstructions?: string
): Promise<ResponseData> {
  // Create updated section with custom instructions if provided
  const updatedSection = customInstructions
    ? { ...section, instructions: `${section.instructions}\n\nAdditional guidance: ${customInstructions}` }
    : section;

  // Re-map data
  const [mapping] = await mapDataToSections(userContext, [updatedSection]);

  // Generate new content
  return generateSectionContent(updatedSection, userContext, mapping, grant);
}
