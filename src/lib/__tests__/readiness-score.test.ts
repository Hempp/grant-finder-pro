import { describe, it, expect } from "vitest";
import {
  calculateReadinessScore,
  OrganizationData,
  DocumentSummary,
} from "../readiness-score";

const fullOrg: OrganizationData = {
  name: "Acme Corp",
  type: "nonprofit",
  ein: "12-3456789",
  legalStructure: "501(c)(3)",
  mission: "Empower underserved communities through technology education.",
  teamSize: "15",
  annualRevenue: "$2,000,000",
  state: "CA",
  founderBackground:
    "Jane Doe has 20 years of experience in nonprofit leadership, an MBA from Stanford, and has secured over $5M in grant funding across 12 organizations.",
  fundingSeeking: "$500,000",
  previousFunding:
    "Received $250,000 from the Ford Foundation in 2023 and $100,000 from NSF SBIR Phase I in 2022. Both projects completed on time and under budget.",
};

const emptyOrg: OrganizationData = {};

const fullDocs: DocumentSummary = {
  hasPitchDeck: true,
  hasFinancials: true,
  hasBusinessPlan: true,
  totalDocuments: 3,
};

const noDocs: DocumentSummary = {
  hasPitchDeck: false,
  hasFinancials: false,
  hasBusinessPlan: false,
  totalDocuments: 0,
};

describe("calculateReadinessScore", () => {
  it("complete org profile scores higher than incomplete", () => {
    const complete = calculateReadinessScore(fullOrg, fullDocs, {
      total: 5,
      awarded: 3,
    });
    const incomplete = calculateReadinessScore(emptyOrg, noDocs, {
      total: 0,
      awarded: 0,
    });
    expect(complete.score).toBeGreaterThan(incomplete.score);
  });

  it("missing all documents = low document score", () => {
    const result = calculateReadinessScore(fullOrg, noDocs, {
      total: 0,
      awarded: 0,
    });
    expect(result.breakdown.documents.score).toBe(0);
  });

  it("having all three docs = 100% doc score", () => {
    const result = calculateReadinessScore(fullOrg, fullDocs, {
      total: 0,
      awarded: 0,
    });
    expect(result.breakdown.documents.score).toBe(100);
  });

  it("zero applications = low app history score", () => {
    const result = calculateReadinessScore(fullOrg, fullDocs, {
      total: 0,
      awarded: 0,
    });
    expect(result.breakdown.applicationHistory.score).toBe(0);
  });

  it("high win rate = high app history score", () => {
    const result = calculateReadinessScore(fullOrg, fullDocs, {
      total: 10,
      awarded: 9,
    });
    expect(result.breakdown.applicationHistory.score).toBeGreaterThanOrEqual(
      90
    );
  });

  it("pre-revenue reduces financial score", () => {
    const preRevOrg: OrganizationData = {
      ...fullOrg,
      annualRevenue: "",
    };
    const result = calculateReadinessScore(preRevOrg, fullDocs, {
      total: 5,
      awarded: 3,
    });
    expect(result.breakdown.financial.score).toBeLessThan(100);
  });

  it("short founderBackground gets lower team score than long one", () => {
    const shortBg: OrganizationData = {
      ...fullOrg,
      founderBackground: "Brief bio",
    };
    const longBg: OrganizationData = {
      ...fullOrg,
      founderBackground:
        "Jane Doe has 20 years of experience in nonprofit leadership, an MBA from Stanford, and has secured over $5M in grant funding across 12 organizations.",
    };
    const shortResult = calculateReadinessScore(shortBg, fullDocs, {
      total: 0,
      awarded: 0,
    });
    const longResult = calculateReadinessScore(longBg, fullDocs, {
      total: 0,
      awarded: 0,
    });
    expect(longResult.breakdown.team.score).toBeGreaterThan(
      shortResult.breakdown.team.score
    );
  });

  it("overall score is 0-100", () => {
    const result = calculateReadinessScore(fullOrg, fullDocs, {
      total: 10,
      awarded: 10,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);

    const emptyResult = calculateReadinessScore(emptyOrg, noDocs, {
      total: 0,
      awarded: 0,
    });
    expect(emptyResult.score).toBeGreaterThanOrEqual(0);
    expect(emptyResult.score).toBeLessThanOrEqual(100);
  });

  it("actions are generated for low-scoring areas", () => {
    const result = calculateReadinessScore(emptyOrg, noDocs, {
      total: 0,
      awarded: 0,
    });
    expect(result.actions.length).toBeGreaterThan(0);
    for (const action of result.actions) {
      expect(["high", "medium", "low"]).toContain(action.priority);
      expect(action.action.length).toBeGreaterThan(0);
    }
  });

  it("actions are capped at 5", () => {
    const result = calculateReadinessScore(emptyOrg, noDocs, {
      total: 0,
      awarded: 0,
    });
    expect(result.actions.length).toBeLessThanOrEqual(5);
  });
});
