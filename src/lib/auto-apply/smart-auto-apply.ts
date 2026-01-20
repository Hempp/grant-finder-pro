// Smart Auto-Apply Orchestrator
// Integrates all intelligence modules for 10x improved grant application filling

import Anthropic from "@anthropic-ai/sdk";
import {
  analyzeField,
  analyzeFields,
  type AnalyzedField,
  type FieldCategory,
} from "./field-intelligence";
import {
  generateResponse,
  generateResponses,
  type GeneratedResponse,
} from "./response-generator";
import {
  extractDocumentData,
  findInDocuments,
  summarizeDocuments,
  type ExtractedDocumentData,
  type DocumentType,
} from "./document-intelligence";
import {
  validateResponse,
  validateApplication,
  deepValidateResponse,
  getImprovementSuggestions,
  type ValidationResult,
} from "./validation-engine";
import {
  type UserContext,
  type GrantContext,
  type ApplicationSection,
  type ResponseData,
  type FunderType,
  FUNDER_TONE_CONFIG,
  SECTION_TEMPLATES,
  FIELD_PATTERNS,
  type FieldInputType,
} from "./types";

const anthropic = new Anthropic();

// Enhanced field detection result
export interface DetectedField {
  fieldId: string;
  fieldLabel: string;
  fieldType: FieldInputType;
  inputType: "text" | "textarea" | "select" | "checkbox" | "radio" | "date" | "number" | "file";
  required: boolean;
  placeholder?: string;
  options?: string[];
  maxLength?: number;
  pattern?: RegExp;
  autoFillValue?: string;
  autoFillConfidence: number;
  category: FieldCategory;
  needsGeneration: boolean;
}

// Form analysis result
export interface FormAnalysis {
  formId: string;
  formTitle?: string;
  fields: DetectedField[];
  sections: {
    title: string;
    fields: string[];
  }[];
  totalFields: number;
  autoFillable: number;
  needsAttention: number;
}

// Auto-fill result
export interface AutoFillResult {
  fieldId: string;
  value: string;
  confidence: number;
  source: "profile" | "document" | "generated" | "previous";
  validation: ValidationResult;
  alternatives?: string[];
}

// Complete application result
export interface SmartApplicationResult {
  formAnalysis: FormAnalysis;
  autoFillResults: Record<string, AutoFillResult>;
  generatedNarratives: Record<string, GeneratedResponse>;
  validationSummary: {
    overallScore: number;
    readinessLevel: "ready" | "needs_work" | "not_ready";
    criticalIssues: string[];
    improvements: string[];
  };
  documentInsights: {
    documentsUsed: string[];
    extractedData: Record<string, unknown>;
    missingDocuments: string[];
  };
  completionMetrics: {
    totalFields: number;
    completedFields: number;
    highConfidenceFields: number;
    needsReviewFields: number;
    completionPercentage: number;
  };
}

/**
 * Detect and analyze form fields from HTML or field definitions
 */
export async function analyzeFormFields(
  formHtml: string,
  grantContext: GrantContext
): Promise<FormAnalysis> {
  // Use AI to extract field information from HTML
  const prompt = `Analyze this grant application form HTML and extract all form fields.

FORM HTML:
${formHtml.substring(0, 15000)}

For each field, identify:
1. Field ID/name
2. Label text
3. Field type (text, textarea, select, checkbox, radio, date, number, file)
4. Whether it's required
5. Placeholder text if any
6. Select/radio options if applicable
7. Character/word limits if specified
8. The category of information it's asking for

Return as JSON:
{
  "formTitle": "string or null",
  "fields": [
    {
      "fieldId": "string",
      "fieldLabel": "string",
      "inputType": "text|textarea|select|checkbox|radio|date|number|file",
      "required": boolean,
      "placeholder": "string or null",
      "options": ["string"] or null,
      "maxLength": number or null,
      "category": "organization_info|contact|project|budget|narrative|attachment|certifications"
    }
  ],
  "sections": [
    {
      "title": "string",
      "fieldIds": ["string"]
    }
  ]
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Enhance fields with smart detection
      const enhancedFields: DetectedField[] = await Promise.all(
        parsed.fields.map(async (field: Record<string, unknown>) => {
          const category = detectFieldCategory(
            field.fieldLabel as string,
            field.fieldId as string
          );
          const autoFillResult = detectAutoFillValue(
            field.fieldLabel as string,
            field.fieldId as string,
            category
          );

          return {
            fieldId: field.fieldId,
            fieldLabel: field.fieldLabel,
            fieldType: mapToFieldInputType(field.inputType as string),
            inputType: field.inputType,
            required: field.required || false,
            placeholder: field.placeholder,
            options: field.options,
            maxLength: field.maxLength,
            category,
            autoFillValue: autoFillResult.value,
            autoFillConfidence: autoFillResult.confidence,
            needsGeneration: shouldGenerateContent(
              field.inputType as string,
              category
            ),
          };
        })
      );

      const autoFillableCount = enhancedFields.filter(
        (f) => f.autoFillConfidence > 70 || !f.needsGeneration
      ).length;

      return {
        formId: `form_${Date.now()}`,
        formTitle: parsed.formTitle,
        fields: enhancedFields,
        sections: parsed.sections || [],
        totalFields: enhancedFields.length,
        autoFillable: autoFillableCount,
        needsAttention: enhancedFields.length - autoFillableCount,
      };
    }
  } catch (error) {
    console.error("Form analysis error:", error);
  }

  // Return empty analysis on failure
  return {
    formId: `form_${Date.now()}`,
    fields: [],
    sections: [],
    totalFields: 0,
    autoFillable: 0,
    needsAttention: 0,
  };
}

/**
 * Detect field category from label and ID
 */
function detectFieldCategory(label: string, fieldId: string): FieldCategory {
  const text = `${label} ${fieldId}`.toLowerCase();

  // Check against known patterns
  for (const [key, config] of Object.entries(FIELD_PATTERNS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(text)) {
        return mapPatternKeyToCategory(key);
      }
    }
  }

  // Fallback heuristics
  if (text.match(/mission|vision|about|overview/)) return "organization_background";
  if (text.match(/problem|need|challenge|issue/)) return "problem_need";
  if (text.match(/solution|approach|method|strategy/)) return "solution_approach";
  if (text.match(/outcome|impact|result|goal/)) return "outcomes_impact";
  if (text.match(/budget|cost|fund|amount|price/)) return "budget_summary";
  if (text.match(/team|staff|personnel|qualification/)) return "team_qualifications";
  if (text.match(/timeline|schedule|milestone/)) return "activities_timeline";
  if (text.match(/partner|collaboration|support/)) return "partnerships";
  if (text.match(/sustain|future|continuation/)) return "sustainability";
  if (text.match(/eval|measure|assess|metric/)) return "evaluation_plan";
  if (text.match(/name|title|organization|company/)) return "organization_identity";
  if (text.match(/address|city|state|zip|phone|email/)) return "contact_info";
  if (text.match(/ein|duns|uei|sam|tax/)) return "certifications";
  if (text.match(/attach|upload|document|file/)) return "attachments";

  return "other";
}

/**
 * Map pattern key to field category
 */
function mapPatternKeyToCategory(key: string): FieldCategory {
  const mapping: Record<string, FieldCategory> = {
    organization_name: "organization_identity",
    ein: "certifications",
    duns: "certifications",
    sam_uei: "certifications",
    website: "contact_info",
    email: "contact_info",
    phone: "contact_info",
    address: "contact_info",
    city: "contact_info",
    state: "contact_info",
    zip: "contact_info",
    amount_requested: "budget_summary",
    annual_budget: "financial_health",
    year_founded: "organization_background",
    staff_count: "organizational_capacity",
    mission: "mission_vision",
    project_title: "project_description",
    project_start_date: "activities_timeline",
    project_end_date: "activities_timeline",
    executive_director: "team_qualifications",
    board_members: "organizational_capacity",
  };

  return mapping[key] || "other";
}

/**
 * Map input type string to FieldInputType
 */
function mapToFieldInputType(inputType: string): FieldInputType {
  const mapping: Record<string, FieldInputType> = {
    text: "text",
    textarea: "textarea",
    select: "select",
    checkbox: "checkbox",
    radio: "radio",
    date: "date",
    number: "number",
    file: "file",
    email: "email",
    phone: "phone",
    url: "url",
  };

  return mapping[inputType] || "text";
}

/**
 * Detect if we can auto-fill from profile data
 */
function detectAutoFillValue(
  label: string,
  fieldId: string,
  category: FieldCategory
): { value?: string; confidence: number } {
  // This would be enhanced with actual profile data lookup
  // For now, return placeholder indicating we can fill it
  const directFillCategories: FieldCategory[] = [
    "organization_identity",
    "contact_info",
    "certifications",
    "financial_health",
    "organizational_capacity",
  ];

  if (directFillCategories.includes(category)) {
    return { confidence: 85 };
  }

  return { confidence: 0 };
}

/**
 * Determine if content needs AI generation
 */
function shouldGenerateContent(
  inputType: string,
  category: FieldCategory
): boolean {
  // File uploads don't need generation
  if (inputType === "file") return false;

  // Short inputs usually don't need generation
  if (["checkbox", "radio", "select", "date", "number"].includes(inputType)) {
    return false;
  }

  // Narrative categories need generation
  const narrativeCategories: FieldCategory[] = [
    "problem_need",
    "solution_approach",
    "project_description",
    "outcomes_impact",
    "evaluation_plan",
    "team_qualifications",
    "organizational_capacity",
    "sustainability",
    "innovation",
    "commercialization",
    "organization_background",
    "mission_vision",
    "budget_justification",
  ];

  return narrativeCategories.includes(category);
}

/**
 * Main smart auto-apply function
 */
export async function smartAutoApply(
  grantContext: GrantContext,
  userContext: UserContext,
  formHtml?: string,
  existingFields?: ApplicationSection[]
): Promise<SmartApplicationResult> {
  // Step 1: Analyze form or use existing field definitions
  let formAnalysis: FormAnalysis;

  if (formHtml) {
    formAnalysis = await analyzeFormFields(formHtml, grantContext);
  } else if (existingFields) {
    formAnalysis = convertSectionsToFormAnalysis(existingFields);
  } else {
    // Use template based on grant type
    const templateKey = determineTemplateKey(grantContext);
    const template = SECTION_TEMPLATES[templateKey] || SECTION_TEMPLATES.simple_application;
    formAnalysis = convertSectionsToFormAnalysis(template);
  }

  // Step 2: Extract data from uploaded documents
  const documentInsights = await processDocuments(userContext.documents);

  // Step 3: Auto-fill direct fields
  const autoFillResults: Record<string, AutoFillResult> = {};

  for (const field of formAnalysis.fields) {
    if (!field.needsGeneration) {
      const result = await autoFillField(
        field,
        userContext,
        documentInsights.extractedData
      );
      autoFillResults[field.fieldId] = result;
    }
  }

  // Step 4: Generate narratives for complex fields
  const narrativeFields = formAnalysis.fields.filter((f) => f.needsGeneration);
  const generatedNarratives: Record<string, GeneratedResponse> = {};

  if (narrativeFields.length > 0) {
    // Prepare fields for generation
    const fieldsForGeneration = narrativeFields.map((f) => ({
      id: f.fieldId,
      question: f.fieldLabel,
      meta: {
        type: f.inputType,
        placeholder: f.placeholder || "",
        required: f.required,
        characterLimit: f.maxLength,
      },
    }));

    // Determine funder type from grant context
    const funderType = (grantContext.type as FunderType) || "foundation";

    // Generate responses for all narrative fields
    // (generateResponses handles analysis internally)
    const responsesMap = await generateResponses(
      fieldsForGeneration,
      grantContext,
      userContext,
      funderType
    );

    // Process the Map results
    for (const [fieldId, response] of responsesMap) {
      generatedNarratives[fieldId] = response;

      // Find the original field to get category/limits
      const originalField = narrativeFields.find((f) => f.fieldId === fieldId);
      const fieldCategory = originalField?.category || "project_description";
      const wordLimit = originalField?.maxLength
        ? Math.floor(originalField.maxLength / 5)
        : undefined;

      // Also add to auto-fill results for unified output
      autoFillResults[fieldId] = {
        fieldId: fieldId,
        value: response.content,
        confidence: response.quality.score / 100, // Normalize to 0-1
        source: "generated",
        validation: validateResponse(response.content, fieldCategory, wordLimit),
        alternatives: response.alternatives,
      };
    }
  }

  // Step 5: Validate entire application
  const validationInput: Record<
    string,
    { content: string; category: FieldCategory; wordLimit?: number }
  > = {};

  for (const [fieldId, result] of Object.entries(autoFillResults)) {
    const field = formAnalysis.fields.find((f) => f.fieldId === fieldId);
    if (field) {
      validationInput[fieldId] = {
        content: result.value,
        category: field.category,
        wordLimit: field.maxLength,
      };
    }
  }

  const applicationValidation = await validateApplication(
    validationInput,
    determineTemplateKey(grantContext),
    determineFunderType(grantContext)
  );

  // Step 6: Calculate completion metrics
  const completedFields = Object.values(autoFillResults).filter(
    (r) => r.value && r.value.length > 0
  );
  const highConfidenceFields = Object.values(autoFillResults).filter(
    (r) => r.confidence >= 75
  );
  const needsReviewFields = Object.values(autoFillResults).filter(
    (r) => r.confidence < 60 || !r.validation.isValid
  );

  return {
    formAnalysis,
    autoFillResults,
    generatedNarratives,
    validationSummary: {
      overallScore: applicationValidation.overallScore,
      readinessLevel: applicationValidation.readinessLevel,
      criticalIssues: applicationValidation.applicationIssues
        .filter((i) => i.type === "error")
        .map((i) => i.message),
      improvements: Object.values(applicationValidation.fieldResults)
        .flatMap((r) => r.improvements)
        .slice(0, 5),
    },
    documentInsights: {
      documentsUsed: documentInsights.documentsUsed,
      extractedData: documentInsights.extractedData,
      missingDocuments: documentInsights.missingDocuments,
    },
    completionMetrics: {
      totalFields: formAnalysis.totalFields,
      completedFields: completedFields.length,
      highConfidenceFields: highConfidenceFields.length,
      needsReviewFields: needsReviewFields.length,
      completionPercentage: Math.round(
        (completedFields.length / formAnalysis.totalFields) * 100
      ),
    },
  };
}

/**
 * Process uploaded documents and extract structured data
 */
async function processDocuments(
  documents: UserContext["documents"]
): Promise<{
  documentsUsed: string[];
  extractedData: Record<string, unknown>;
  missingDocuments: string[];
}> {
  const documentsUsed: string[] = [];
  const extractedData: Record<string, unknown> = {};
  const missingDocuments: string[] = [];

  // Common required document types
  const requiredTypes = ["990", "financials", "business_plan"];

  for (const doc of documents) {
    try {
      const extracted = await extractDocumentData(
        doc.parsedData || "",
        doc.name,
        doc.type as DocumentType | undefined
      );

      if (extracted.confidence > 50) {
        documentsUsed.push(doc.name);
        extractedData[doc.type] = extracted;
      }
    } catch (error) {
      console.error(`Failed to process document ${doc.name}:`, error);
    }
  }

  // Identify missing documents
  for (const type of requiredTypes) {
    if (!documents.some((d) => d.type === type)) {
      missingDocuments.push(type);
    }
  }

  return { documentsUsed, extractedData, missingDocuments };
}

/**
 * Auto-fill a single field from available data sources
 */
async function autoFillField(
  field: DetectedField,
  userContext: UserContext,
  documentData: Record<string, unknown>
): Promise<AutoFillResult> {
  const org = userContext.organization;
  let value = "";
  let confidence = 0;
  let source: AutoFillResult["source"] = "profile";

  // Try to fill from organization profile first
  if (org) {
    const profileValue = getValueFromProfile(field, org);
    if (profileValue) {
      value = profileValue;
      confidence = 0.90; // 90% confidence for profile data
      source = "profile";
    }
  }

  // Try documents if profile didn't have it
  if (!value && documentData) {
    const docValue = getValueFromDocuments(field, documentData);
    if (docValue) {
      value = docValue;
      confidence = 0.75; // 75% confidence for document data
      source = "document";
    }
  }

  // Try previous applications
  if (!value && userContext.previousApplications.length > 0) {
    const prevValue = getValueFromPreviousApps(field, userContext.previousApplications);
    if (prevValue) {
      value = prevValue;
      confidence = 0.65; // 65% confidence for previous app data
      source = "previous";
    }
  }

  // Validate the filled value
  const validation = validateResponse(value, field.category);

  return {
    fieldId: field.fieldId,
    value,
    confidence,
    source,
    validation,
  };
}

/**
 * Get value from organization profile
 */
function getValueFromProfile(
  field: DetectedField,
  org: NonNullable<UserContext["organization"]>
): string | undefined {
  const categoryFieldMap: Record<string, keyof typeof org> = {
    organization_identity: "name",
    mission_vision: "mission",
    contact_info: "city",
    financial_health: "annualRevenue",
    organizational_capacity: "teamSize",
    team_qualifications: "founderBackground",
    problem_need: "problemStatement",
    solution_approach: "solution",
    target_population: "targetMarket",
  };

  const fieldKey = categoryFieldMap[field.category];
  if (fieldKey && org[fieldKey]) {
    return String(org[fieldKey]);
  }

  // Check by field label patterns
  const label = field.fieldLabel.toLowerCase();
  if (label.includes("name") && label.includes("organization")) return org.name;
  if (label.includes("mission")) return org.mission || undefined;
  if (label.includes("ein") || label.includes("tax")) return org.ein || undefined;
  if (label.includes("website") || label.includes("url")) return org.website || undefined;
  if (label.includes("city")) return org.city || undefined;
  if (label.includes("state")) return org.state || undefined;

  return undefined;
}

/**
 * Get value from extracted document data
 */
function getValueFromDocuments(
  field: DetectedField,
  documentData: Record<string, unknown>
): string | undefined {
  // Look through extracted document data for relevant values
  for (const [, data] of Object.entries(documentData)) {
    if (typeof data === "object" && data !== null) {
      const extracted = data as ExtractedDocumentData;

      // Check organization info
      if (extracted.organizationInfo) {
        const info = extracted.organizationInfo;
        if (field.category === "organization_identity" && info.name) {
          return info.name;
        }
        if (field.category === "certifications" && info.ein) {
          return info.ein;
        }
      }

      // Check financial data
      if (extracted.financialData && field.category === "financial_health") {
        const fin = extracted.financialData;
        if (field.fieldLabel.toLowerCase().includes("revenue")) {
          return fin.totalRevenue?.toString();
        }
        if (field.fieldLabel.toLowerCase().includes("budget")) {
          return fin.totalExpenses?.toString();
        }
      }
    }
  }

  return undefined;
}

/**
 * Get value from previous applications
 */
function getValueFromPreviousApps(
  field: DetectedField,
  previousApps: UserContext["previousApplications"]
): string | undefined {
  for (const app of previousApps) {
    if (app.responses) {
      try {
        const responses = JSON.parse(app.responses);
        // Look for matching field
        const matchingKey = Object.keys(responses).find(
          (key) =>
            key.toLowerCase().includes(field.fieldId.toLowerCase()) ||
            field.fieldId.toLowerCase().includes(key.toLowerCase())
        );
        if (matchingKey && responses[matchingKey]) {
          return responses[matchingKey];
        }
      } catch {
        // Skip invalid JSON
      }
    }
  }

  return undefined;
}

/**
 * Convert ApplicationSection[] to FormAnalysis
 */
function convertSectionsToFormAnalysis(
  sections: ApplicationSection[]
): FormAnalysis {
  const fields: DetectedField[] = sections.map((section) => {
    const category = detectFieldCategory(section.title, section.id);
    const inputType =
      section.type === "narrative"
        ? "textarea"
        : section.type === "short_answer"
          ? "text"
          : section.type === "select"
            ? "select"
            : section.type === "checkbox"
              ? "checkbox"
              : section.type === "attachment"
                ? "file"
                : "textarea";

    return {
      fieldId: section.id,
      fieldLabel: section.title,
      fieldType: mapToFieldInputType(inputType),
      inputType: inputType as DetectedField["inputType"],
      required: section.required,
      placeholder: section.instructions,
      maxLength: section.wordLimit || section.characterLimit,
      category,
      autoFillConfidence: shouldGenerateContent(inputType, category) ? 0 : 75,
      needsGeneration: shouldGenerateContent(inputType, category),
    };
  });

  return {
    formId: `template_${Date.now()}`,
    fields,
    sections: [],
    totalFields: fields.length,
    autoFillable: fields.filter((f) => !f.needsGeneration).length,
    needsAttention: fields.filter((f) => f.needsGeneration).length,
  };
}

/**
 * Determine template key from grant context
 */
function determineTemplateKey(grant: GrantContext): string {
  const title = grant.title.toLowerCase();
  const funder = grant.funder.toLowerCase();
  const category = (grant.category || "").toLowerCase();
  const type = (grant.type || "").toLowerCase();

  // SBIR/STTR detection
  if (
    title.includes("sbir") ||
    title.includes("sttr") ||
    category.includes("sbir")
  ) {
    if (title.includes("phase 2") || title.includes("phase ii")) {
      return "sbir_phase2";
    }
    return "sbir_phase1";
  }

  // NSF detection
  if (funder.includes("nsf") || funder.includes("national science foundation")) {
    return "nsf_research";
  }

  // NIH detection
  if (funder.includes("nih") || funder.includes("national institutes of health")) {
    if (title.includes("r21")) return "nih_r21";
    return "nih_r21"; // Default NIH template
  }

  // Category-based detection
  if (category.includes("education") || title.includes("education")) {
    return "education_grant";
  }
  if (
    category.includes("environment") ||
    category.includes("conservation") ||
    title.includes("environment")
  ) {
    return "environmental_grant";
  }
  if (category.includes("health") || title.includes("health")) {
    return "health_services";
  }
  if (
    category.includes("arts") ||
    category.includes("culture") ||
    title.includes("arts")
  ) {
    return "arts_culture";
  }
  if (category.includes("workforce") || title.includes("workforce")) {
    return "workforce_development";
  }
  if (category.includes("tech") || title.includes("innovation")) {
    return "technology_innovation";
  }
  if (funder.includes("community") || type.includes("community")) {
    return "community_foundation";
  }

  // Funder type-based fallback
  if (type.includes("foundation") || funder.includes("foundation")) {
    return "foundation_general";
  }

  return "simple_application";
}

/**
 * Determine funder type from grant context
 */
function determineFunderType(grant: GrantContext): FunderType {
  const type = grant.type?.toLowerCase() || "";
  const funder = grant.funder.toLowerCase();

  if (
    type.includes("federal") ||
    funder.includes("nsf") ||
    funder.includes("nih") ||
    funder.includes("doe") ||
    funder.includes("sbir")
  ) {
    return "federal";
  }
  if (type.includes("foundation") || funder.includes("foundation")) {
    return "foundation";
  }
  if (type.includes("corporate") || funder.includes("inc") || funder.includes("corp")) {
    return "corporate";
  }
  if (type.includes("state")) {
    return "state";
  }

  return "foundation";
}

/**
 * Regenerate a specific field with custom instructions
 */
export async function regenerateField(
  fieldId: string,
  customInstructions: string,
  grantContext: GrantContext,
  userContext: UserContext,
  documentData: Record<string, unknown>
): Promise<GeneratedResponse> {
  // Analyze the field with custom instructions
  const analyzed = await analyzeField(
    customInstructions,
    grantContext,
    userContext,
    {
      type: "textarea",
      required: true,
    }
  );

  // Determine funder type
  const funderType = (grantContext.type as FunderType) || "foundation";

  // Generate new response
  return generateResponse(fieldId, analyzed, grantContext, funderType);
}

/**
 * Get improvement suggestions for a specific field
 */
export async function getFieldImprovements(
  fieldId: string,
  currentContent: string,
  grantContext: GrantContext,
  category: FieldCategory
): Promise<{
  suggestions: string[];
  revisedContent?: string;
  score: number;
}> {
  // Get validation result
  const validation = validateResponse(currentContent, category);

  // Get AI-powered deep validation
  const deepValidation = await deepValidateResponse(
    currentContent,
    fieldId,
    category,
    {
      grantTitle: grantContext.title,
      funder: grantContext.funder,
      funderType: determineFunderType(grantContext),
      requirements: grantContext.requirements || undefined,
    }
  );

  // Combine suggestions
  const suggestions = [
    ...validation.improvements,
    ...deepValidation.keyImprovements,
    ...getImprovementSuggestions(category, validation.score),
  ].slice(0, 6);

  return {
    suggestions,
    revisedContent: deepValidation.suggestedRevision,
    score: deepValidation.score,
  };
}

// Export utility types
export type { FieldCategory, GeneratedResponse, ValidationResult };
