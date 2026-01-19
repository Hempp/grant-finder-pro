// Document Intelligence System
// Extracts and structures information from uploaded documents

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

// Document types we can intelligently parse
export type DocumentType =
  | "990"              // IRS Form 990
  | "financials"       // Financial statements
  | "audit"            // Audit report
  | "business_plan"    // Business plan
  | "pitch_deck"       // Investor pitch deck
  | "resume"           // Team bios/resumes
  | "letters_of_support" // Partner letters
  | "research"         // Research papers/data
  | "budget_template"  // Budget spreadsheets
  | "project_plan"     // Project plans
  | "logic_model"      // Logic model/theory of change
  | "needs_assessment" // Community needs assessment
  | "evaluation_report" // Past evaluation reports
  | "annual_report"    // Annual reports
  | "other";

// Structured data extracted from documents
export interface ExtractedDocumentData {
  documentId: string;
  documentType: DocumentType;
  confidence: number;

  // Organization info
  organizationInfo?: {
    name?: string;
    ein?: string;
    address?: string;
    yearFounded?: string;
  };

  // Financial data
  financialData?: {
    totalRevenue?: number;
    totalExpenses?: number;
    netAssets?: number;
    fiscalYear?: string;
    revenueBreakdown?: Record<string, number>;
    expenseBreakdown?: Record<string, number>;
    auditStatus?: string;
  };

  // Team data
  teamData?: {
    keyPersonnel?: Array<{
      name: string;
      title: string;
      qualifications?: string;
      experience?: string;
    }>;
    boardMembers?: string[];
    totalStaff?: number;
  };

  // Project/Program data
  programData?: {
    programs?: Array<{
      name: string;
      description?: string;
      served?: number;
      outcomes?: string[];
    }>;
    totalServed?: number;
    geographicArea?: string;
  };

  // Metrics/Impact data
  impactData?: {
    metrics?: Record<string, number | string>;
    outcomes?: string[];
    achievements?: string[];
  };

  // Research/Evidence data
  evidenceData?: {
    findings?: string[];
    citations?: string[];
    methodology?: string;
  };

  // Raw extracted sections for reference
  rawSections?: Record<string, string>;
}

// Extract structured data from a document
export async function extractDocumentData(
  documentContent: string,
  documentName: string,
  documentType?: DocumentType
): Promise<ExtractedDocumentData> {
  // Determine document type if not provided
  const type = documentType || inferDocumentType(documentName, documentContent);

  // Use appropriate extraction strategy
  switch (type) {
    case "990":
      return extract990Data(documentContent, documentName);
    case "financials":
    case "audit":
      return extractFinancialData(documentContent, documentName, type);
    case "resume":
      return extractResumeData(documentContent, documentName);
    case "business_plan":
    case "pitch_deck":
      return extractBusinessPlanData(documentContent, documentName, type);
    case "letters_of_support":
      return extractLetterData(documentContent, documentName);
    default:
      return extractGeneralData(documentContent, documentName, type);
  }
}

// Infer document type from name and content
function inferDocumentType(name: string, content: string): DocumentType {
  const lowerName = name.toLowerCase();
  const lowerContent = content.toLowerCase().substring(0, 2000);

  if (lowerName.includes("990") || lowerContent.includes("form 990") || lowerContent.includes("return of organization")) {
    return "990";
  }
  if (lowerName.includes("audit") || lowerContent.includes("independent auditor")) {
    return "audit";
  }
  if (lowerName.includes("financial") || lowerContent.includes("balance sheet") || lowerContent.includes("statement of activities")) {
    return "financials";
  }
  if (lowerName.includes("resume") || lowerName.includes("cv") || lowerContent.includes("education") && lowerContent.includes("experience")) {
    return "resume";
  }
  if (lowerName.includes("business plan") || lowerContent.includes("executive summary") && lowerContent.includes("market")) {
    return "business_plan";
  }
  if (lowerName.includes("pitch") || lowerName.includes("deck")) {
    return "pitch_deck";
  }
  if (lowerName.includes("letter") && (lowerContent.includes("support") || lowerContent.includes("partner"))) {
    return "letters_of_support";
  }
  if (lowerName.includes("budget")) {
    return "budget_template";
  }
  if (lowerName.includes("logic model") || lowerContent.includes("theory of change")) {
    return "logic_model";
  }
  if (lowerName.includes("needs assessment") || lowerContent.includes("community needs")) {
    return "needs_assessment";
  }
  if (lowerName.includes("annual report")) {
    return "annual_report";
  }

  return "other";
}

// Extract data from Form 990
async function extract990Data(content: string, name: string): Promise<ExtractedDocumentData> {
  const prompt = `Extract key information from this Form 990 tax filing. Return JSON only.

DOCUMENT CONTENT:
${content.substring(0, 8000)}

Extract:
{
  "organizationInfo": {
    "name": "legal name",
    "ein": "EIN number",
    "address": "full address",
    "yearFounded": "year"
  },
  "financialData": {
    "totalRevenue": number,
    "totalExpenses": number,
    "netAssets": number,
    "fiscalYear": "YYYY",
    "revenueBreakdown": {
      "contributions": number,
      "program_revenue": number,
      "investment_income": number,
      "other": number
    },
    "expenseBreakdown": {
      "program": number,
      "management": number,
      "fundraising": number
    }
  },
  "programData": {
    "programs": [{"name": "...", "description": "...", "expenses": number}],
    "totalServed": number
  },
  "teamData": {
    "keyPersonnel": [{"name": "...", "title": "...", "compensation": number}],
    "totalStaff": number
  }
}

Return only valid JSON.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseContent = response.content[0];
    if (responseContent.type === "text") {
      const extracted = JSON.parse(responseContent.text);
      return {
        documentId: name,
        documentType: "990",
        confidence: 0.85,
        ...extracted,
      };
    }
  } catch (error) {
    console.error("Failed to extract 990 data:", error);
  }

  return {
    documentId: name,
    documentType: "990",
    confidence: 0.3,
    rawSections: { content: content.substring(0, 5000) },
  };
}

// Extract financial data
async function extractFinancialData(
  content: string,
  name: string,
  type: "financials" | "audit"
): Promise<ExtractedDocumentData> {
  const prompt = `Extract financial information from this ${type === "audit" ? "audit report" : "financial statement"}. Return JSON only.

DOCUMENT:
${content.substring(0, 8000)}

Extract:
{
  "financialData": {
    "totalRevenue": number or null,
    "totalExpenses": number or null,
    "netAssets": number or null,
    "fiscalYear": "YYYY",
    "revenueBreakdown": {"source": amount},
    "expenseBreakdown": {"category": amount},
    "auditStatus": "unqualified|qualified|disclaimer|adverse" (if audit)
  },
  "impactData": {
    "metrics": {"metric_name": value},
    "achievements": ["notable achievements"]
  }
}

Return only valid JSON.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseContent = response.content[0];
    if (responseContent.type === "text") {
      const extracted = JSON.parse(responseContent.text);
      return {
        documentId: name,
        documentType: type,
        confidence: 0.8,
        ...extracted,
      };
    }
  } catch (error) {
    console.error("Failed to extract financial data:", error);
  }

  return {
    documentId: name,
    documentType: type,
    confidence: 0.3,
    rawSections: { content: content.substring(0, 5000) },
  };
}

// Extract resume/bio data
async function extractResumeData(content: string, name: string): Promise<ExtractedDocumentData> {
  const prompt = `Extract professional information from this resume/bio. Return JSON only.

DOCUMENT:
${content.substring(0, 5000)}

Extract:
{
  "teamData": {
    "keyPersonnel": [{
      "name": "full name",
      "title": "current title",
      "qualifications": "degrees, certifications",
      "experience": "brief summary of relevant experience"
    }]
  }
}

Return only valid JSON.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseContent = response.content[0];
    if (responseContent.type === "text") {
      const extracted = JSON.parse(responseContent.text);
      return {
        documentId: name,
        documentType: "resume",
        confidence: 0.85,
        ...extracted,
      };
    }
  } catch (error) {
    console.error("Failed to extract resume data:", error);
  }

  return {
    documentId: name,
    documentType: "resume",
    confidence: 0.3,
    rawSections: { content: content.substring(0, 3000) },
  };
}

// Extract business plan / pitch deck data
async function extractBusinessPlanData(
  content: string,
  name: string,
  type: "business_plan" | "pitch_deck"
): Promise<ExtractedDocumentData> {
  const prompt = `Extract key information from this ${type === "business_plan" ? "business plan" : "pitch deck"}. Return JSON only.

DOCUMENT:
${content.substring(0, 10000)}

Extract:
{
  "organizationInfo": {
    "name": "company name",
    "yearFounded": "year if mentioned"
  },
  "programData": {
    "programs": [{"name": "product/service", "description": "brief description"}],
    "geographicArea": "market geography"
  },
  "impactData": {
    "metrics": {"metric": value},
    "achievements": ["traction, milestones"]
  },
  "evidenceData": {
    "findings": ["market insights, validation"],
    "methodology": "approach to market"
  },
  "rawSections": {
    "problem": "problem statement",
    "solution": "solution description",
    "market": "market size/opportunity",
    "competition": "competitive landscape",
    "business_model": "revenue model",
    "team": "team overview",
    "traction": "key metrics/progress",
    "ask": "funding request"
  }
}

Return only valid JSON.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseContent = response.content[0];
    if (responseContent.type === "text") {
      const extracted = JSON.parse(responseContent.text);
      return {
        documentId: name,
        documentType: type,
        confidence: 0.8,
        ...extracted,
      };
    }
  } catch (error) {
    console.error("Failed to extract business plan data:", error);
  }

  return {
    documentId: name,
    documentType: type,
    confidence: 0.3,
    rawSections: { content: content.substring(0, 5000) },
  };
}

// Extract letter of support data
async function extractLetterData(content: string, name: string): Promise<ExtractedDocumentData> {
  const prompt = `Extract information from this letter of support. Return JSON only.

DOCUMENT:
${content.substring(0, 3000)}

Extract:
{
  "teamData": {
    "keyPersonnel": [{
      "name": "signer name",
      "title": "signer title",
      "qualifications": "organization they represent"
    }]
  },
  "rawSections": {
    "partner_org": "partner organization name",
    "commitment": "what they're committing to",
    "relationship": "nature of partnership"
  }
}

Return only valid JSON.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseContent = response.content[0];
    if (responseContent.type === "text") {
      const extracted = JSON.parse(responseContent.text);
      return {
        documentId: name,
        documentType: "letters_of_support",
        confidence: 0.85,
        ...extracted,
      };
    }
  } catch (error) {
    console.error("Failed to extract letter data:", error);
  }

  return {
    documentId: name,
    documentType: "letters_of_support",
    confidence: 0.3,
    rawSections: { content: content.substring(0, 2000) },
  };
}

// General extraction for other document types
async function extractGeneralData(
  content: string,
  name: string,
  type: DocumentType
): Promise<ExtractedDocumentData> {
  const prompt = `Extract useful information from this document for a grant application. Return JSON only.

DOCUMENT TYPE: ${type}
DOCUMENT:
${content.substring(0, 6000)}

Extract any relevant information in this structure:
{
  "organizationInfo": {/* name, address, etc. if present */},
  "financialData": {/* any financial info */},
  "teamData": {/* personnel info */},
  "programData": {/* program/service info */},
  "impactData": {/* metrics, outcomes */},
  "evidenceData": {/* research, data */},
  "rawSections": {/* key text sections with labels */}
}

Include only sections where you found relevant data. Return only valid JSON.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseContent = response.content[0];
    if (responseContent.type === "text") {
      const extracted = JSON.parse(responseContent.text);
      return {
        documentId: name,
        documentType: type,
        confidence: 0.7,
        ...extracted,
      };
    }
  } catch (error) {
    console.error("Failed to extract general data:", error);
  }

  return {
    documentId: name,
    documentType: type,
    confidence: 0.2,
    rawSections: { content: content.substring(0, 4000) },
  };
}

// Find specific information across all documents
export function findInDocuments(
  documents: ExtractedDocumentData[],
  query: {
    type?: "financial" | "team" | "program" | "impact" | "evidence";
    field?: string;
    keywords?: string[];
  }
): Array<{ source: string; data: unknown; confidence: number }> {
  const results: Array<{ source: string; data: unknown; confidence: number }> = [];

  for (const doc of documents) {
    // Type-based search
    if (query.type === "financial" && doc.financialData) {
      if (query.field && doc.financialData[query.field as keyof typeof doc.financialData]) {
        results.push({
          source: doc.documentId,
          data: doc.financialData[query.field as keyof typeof doc.financialData],
          confidence: doc.confidence,
        });
      } else if (!query.field) {
        results.push({
          source: doc.documentId,
          data: doc.financialData,
          confidence: doc.confidence,
        });
      }
    }

    if (query.type === "team" && doc.teamData) {
      results.push({
        source: doc.documentId,
        data: doc.teamData,
        confidence: doc.confidence,
      });
    }

    if (query.type === "program" && doc.programData) {
      results.push({
        source: doc.documentId,
        data: doc.programData,
        confidence: doc.confidence,
      });
    }

    if (query.type === "impact" && doc.impactData) {
      results.push({
        source: doc.documentId,
        data: doc.impactData,
        confidence: doc.confidence,
      });
    }

    if (query.type === "evidence" && doc.evidenceData) {
      results.push({
        source: doc.documentId,
        data: doc.evidenceData,
        confidence: doc.confidence,
      });
    }

    // Keyword search in raw sections
    if (query.keywords && doc.rawSections) {
      for (const [sectionName, sectionContent] of Object.entries(doc.rawSections)) {
        const lowerContent = String(sectionContent).toLowerCase();
        if (query.keywords.some(kw => lowerContent.includes(kw.toLowerCase()))) {
          results.push({
            source: `${doc.documentId}:${sectionName}`,
            data: sectionContent,
            confidence: doc.confidence * 0.8,
          });
        }
      }
    }
  }

  // Sort by confidence
  return results.sort((a, b) => b.confidence - a.confidence);
}

// Summarize document collection for grant application
export function summarizeDocuments(documents: ExtractedDocumentData[]): {
  hasFinancials: boolean;
  hasTeamInfo: boolean;
  hasProgramInfo: boolean;
  hasImpactData: boolean;
  totalRevenue?: number;
  keyPersonnel: string[];
  documentTypes: DocumentType[];
} {
  const summary = {
    hasFinancials: false,
    hasTeamInfo: false,
    hasProgramInfo: false,
    hasImpactData: false,
    totalRevenue: undefined as number | undefined,
    keyPersonnel: [] as string[],
    documentTypes: [] as DocumentType[],
  };

  for (const doc of documents) {
    summary.documentTypes.push(doc.documentType);

    if (doc.financialData) {
      summary.hasFinancials = true;
      if (doc.financialData.totalRevenue) {
        summary.totalRevenue = doc.financialData.totalRevenue;
      }
    }

    if (doc.teamData?.keyPersonnel) {
      summary.hasTeamInfo = true;
      for (const person of doc.teamData.keyPersonnel) {
        if (person.name && !summary.keyPersonnel.includes(person.name)) {
          summary.keyPersonnel.push(person.name);
        }
      }
    }

    if (doc.programData?.programs?.length) {
      summary.hasProgramInfo = true;
    }

    if (doc.impactData?.metrics || doc.impactData?.outcomes?.length) {
      summary.hasImpactData = true;
    }
  }

  return summary;
}
