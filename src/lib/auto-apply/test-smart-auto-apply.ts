// Test script for smart auto-apply system
// Run with: npx tsx src/lib/auto-apply/test-smart-auto-apply.ts

import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { analyzeField, analyzeFields } from "./field-intelligence";
import { generateResponse, generateResponses } from "./response-generator";
import { extractDocumentData } from "./document-intelligence";
import { validateResponse, validateApplication } from "./validation-engine";
import { smartAutoApply, analyzeFormFields } from "./smart-auto-apply";
import { GrantContext, UserContext } from "./types";

// Mock data for testing
const mockGrant: GrantContext = {
  id: "test-grant-123",
  title: "Small Business Innovation Research (SBIR) Phase I",
  funder: "National Science Foundation",
  description:
    "The NSF SBIR program supports small businesses in developing innovative technologies with commercial potential.",
  amount: "$275,000",
  amountMin: 250000,
  amountMax: 275000,
  deadline: new Date("2024-06-15"),
  type: "federal",
  category: "Technology/Research",
  eligibility:
    "Small business (500 or fewer employees), US-based, at least 51% US-owned",
  requirements:
    "Technical feasibility study, commercialization plan, budget justification, key personnel resumes",
  url: "https://www.nsf.gov/sbir",
};

const mockUserContext: UserContext = {
  organization: {
    name: "TechVentures AI Inc.",
    type: "startup",
    legalStructure: "C-Corporation",
    ein: "12-3456789",
    website: "https://techventures.ai",
    city: "San Francisco",
    state: "CA",
    mission:
      "To democratize artificial intelligence by making advanced ML tools accessible to businesses of all sizes.",
    vision:
      "A world where every business can leverage AI to solve complex problems and drive innovation.",
    problemStatement:
      "Small and medium businesses lack access to enterprise-grade AI tools due to high costs and technical complexity.",
    solution:
      "Our no-code AI platform enables businesses to build, train, and deploy custom ML models without requiring data science expertise.",
    targetMarket:
      "SMBs in healthcare, finance, and retail sectors with 50-500 employees",
    teamSize: "15",
    founderBackground:
      "PhD in Machine Learning from Stanford, 10 years at Google AI, former CTO of acquired startup",
    annualRevenue: "500000",
    fundingSeeking: "2000000",
    previousFunding:
      "Seed round of $1.5M from Y Combinator and angel investors in 2022",
  },
  documents: [],
  previousApplications: [],
};

const hasApiKey = !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim().length > 10;

async function testFieldIntelligence() {
  console.log("\n=== Testing Field Intelligence ===\n");

  if (!hasApiKey) {
    console.log("  [SKIPPED] No Anthropic API key configured");
    console.log("  AI-powered field analysis requires ANTHROPIC_API_KEY");
    return;
  }

  const testQuestions = [
    "Describe your organization's mission and the problem you are addressing.",
    "What is your project budget and how will funds be allocated?",
    "Who are the key personnel and what are their qualifications?",
    "What metrics will you use to measure success?",
  ];

  for (const question of testQuestions) {
    console.log(`\nAnalyzing: "${question.substring(0, 50)}..."`);
    try {
      const analysis = await analyzeField(question, mockGrant, mockUserContext);
      console.log(`  Category: ${analysis.intent.category}`);
      console.log(`  Strategy: ${analysis.intent.responseStrategy}`);
      console.log(`  Confidence: ${analysis.confidenceLevel}`);
      console.log(`  Word Limit: ${analysis.constraints.wordLimit || "none"}`);
    } catch (error) {
      console.error(`  Error: ${error}`);
    }
  }
}

async function testResponseGeneration() {
  console.log("\n=== Testing Response Generation ===\n");

  if (!hasApiKey) {
    console.log("  [SKIPPED] No Anthropic API key configured");
    console.log("  AI-powered response generation requires ANTHROPIC_API_KEY");
    return;
  }

  const analysis = await analyzeField(
    "Describe your organization and its mission.",
    mockGrant,
    mockUserContext
  );

  console.log("Generating response for mission question...");
  const response = await generateResponse(
    "mission-field",
    analysis,
    mockGrant,
    "federal"
  );

  console.log(`\nGenerated Response:`);
  console.log(`  Content: ${response.content.substring(0, 200)}...`);
  console.log(`  Word Count: ${response.wordCount}`);
  console.log(`  Quality Score: ${response.quality.score}`);
  console.log(`  Quality Level: ${response.quality.level}`);
  console.log(`  Needs Review: ${response.needsReview}`);
  if (response.quality.suggestions.length > 0) {
    console.log(`  Suggestions: ${response.quality.suggestions.join(", ")}`);
  }
}

async function testValidation() {
  console.log("\n=== Testing Validation Engine ===\n");

  const testContent = `
    TechVentures AI Inc. is dedicated to democratizing artificial intelligence
    for businesses of all sizes. Our mission is to make advanced machine learning
    tools accessible and affordable, enabling small and medium businesses to
    compete with larger enterprises. Founded in 2022, we have developed a no-code
    AI platform that allows non-technical users to build, train, and deploy
    custom ML models. Our team of 15 includes PhD researchers from Stanford and
    MIT, with collective experience at Google, Meta, and Amazon. We have already
    achieved $500,000 in annual recurring revenue and secured $1.5M in seed funding.
  `;

  console.log("Validating mission/organization content...");
  const validation = validateResponse(testContent, "mission_vision", 300);

  console.log(`\nValidation Results:`);
  console.log(`  Overall Score: ${validation.metrics.overall}`);
  console.log(`  Clarity: ${validation.metrics.clarity}`);
  console.log(`  Specificity: ${validation.metrics.specificity}`);
  console.log(`  Is Valid: ${validation.isValid}`);
  console.log(`  Issues: ${validation.issues.length}`);
  if (validation.issues.length > 0) {
    validation.issues.forEach((issue) => {
      console.log(`    - [${issue.type}] ${issue.message}`);
    });
  }
  console.log(`  Strengths: ${validation.strengths.join(", ")}`);
}

async function testSmartAutoApply() {
  console.log("\n=== Testing Smart Auto-Apply Orchestrator ===\n");

  // Mock application sections - each ApplicationSection represents a single field/question
  const mockSections: import("./types").ApplicationSection[] = [
    {
      id: "org-name",
      type: "short_answer",
      title: "Organization Legal Name",
      instructions: "Enter your organization's legal name as registered",
      required: true,
      relatedProfileFields: ["name"],
      order: 1,
    },
    {
      id: "org-ein",
      type: "short_answer",
      title: "Employer Identification Number (EIN)",
      instructions: "Enter your 9-digit EIN",
      required: true,
      relatedProfileFields: ["ein"],
      order: 2,
    },
    {
      id: "org-mission",
      type: "narrative",
      title: "Describe your organization's mission and the problem you are addressing",
      instructions: "500 words max",
      required: true,
      wordLimit: 500,
      relatedProfileFields: ["mission", "problemStatement"],
      order: 3,
    },
    {
      id: "project-title",
      type: "short_answer",
      title: "Project Title",
      instructions: "Enter a descriptive project title",
      required: true,
      relatedProfileFields: [],
      order: 4,
    },
    {
      id: "project-description",
      type: "narrative",
      title: "Provide a detailed description of your proposed project and its technical approach",
      instructions: "1000 words max",
      required: true,
      wordLimit: 1000,
      relatedProfileFields: ["solution"],
      order: 5,
    },
  ];

  console.log("Running smart auto-apply...");
  console.log(`  Grant: ${mockGrant.title}`);
  console.log(`  Organization: ${mockUserContext.organization?.name}`);
  console.log(`  Total Fields: ${mockSections.length}`);

  try {
    const result = await smartAutoApply(
      mockGrant,
      mockUserContext,
      undefined, // No form HTML
      mockSections
    );

    console.log(`\nResults:`);
    console.log(`  Total Fields Processed: ${result.completionMetrics.totalFields}`);
    console.log(`  Completed Fields: ${result.completionMetrics.completedFields}`);
    console.log(`  High Confidence: ${result.completionMetrics.highConfidenceFields}`);
    console.log(`  Needs Review: ${result.completionMetrics.needsReviewFields}`);
    console.log(
      `  Completion: ${result.completionMetrics.completionPercentage.toFixed(1)}%`
    );
    console.log(`\nValidation Summary:`);
    console.log(`  Overall Score: ${result.validationSummary.overallScore}`);
    console.log(`  Readiness: ${result.validationSummary.readinessLevel}`);
    if (result.validationSummary.criticalIssues.length > 0) {
      console.log(
        `  Critical Issues: ${result.validationSummary.criticalIssues.join(", ")}`
      );
    }

    // Show a sample of generated content
    console.log(`\nSample Auto-Fill Results:`);
    for (const [fieldId, fillResult] of Object.entries(result.autoFillResults).slice(
      0,
      3
    )) {
      console.log(`  ${fieldId}:`);
      console.log(`    Value: ${fillResult.value.substring(0, 100)}...`);
      console.log(`    Confidence: ${(fillResult.confidence * 100).toFixed(0)}%`);
      console.log(`    Source: ${fillResult.source}`);
    }
  } catch (error) {
    console.error(`Error in smart auto-apply: ${error}`);
    throw error;
  }
}

async function runTests() {
  console.log("========================================");
  console.log("   Smart Auto-Apply System Test Suite");
  console.log("========================================");

  try {
    await testFieldIntelligence();
    await testResponseGeneration();
    await testValidation();
    await testSmartAutoApply();

    console.log("\n========================================");
    console.log("   All tests completed successfully!");
    console.log("========================================\n");
  } catch (error) {
    console.error("\n========================================");
    console.error("   Test failed with error:");
    console.error(error);
    console.error("========================================\n");
    process.exit(1);
  }
}

runTests();
