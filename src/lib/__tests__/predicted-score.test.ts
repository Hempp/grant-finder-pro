import { describe, it, expect } from "vitest";
import { calculatePredictedScores } from "../predicted-score";

const fullOrg = {
  name: "Acme Corp",
  type: "nonprofit",
  mission: "Empower underserved communities through technology education.",
  vision: "A world where everyone has access to quality STEM training.",
  problemStatement:
    "Rural communities lack affordable technology education programs.",
  solution:
    "Mobile computer labs and satellite-based curriculum delivery to rural schools.",
  targetMarket: "Rural K-12 students in the southeastern United States.",
  teamSize: "15",
  founderBackground:
    "Jane Doe has 20 years of experience in nonprofit leadership, an MBA from Stanford, and has secured over $5M in grant funding.",
  annualRevenue: "$2,000,000",
  previousFunding:
    "Received $250,000 from the Ford Foundation in 2023 and $100,000 from NSF SBIR Phase I in 2022.",
};

const emptyOrg = {
  name: "Empty Org",
  type: null,
  mission: null,
  vision: null,
  problemStatement: null,
  solution: null,
  targetMarket: null,
  teamSize: null,
  founderBackground: null,
  annualRevenue: null,
  previousFunding: null,
};

describe("calculatePredictedScores", () => {
  it("team-related criteria maps to founderBackground and teamSize", () => {
    const criteria = [
      { name: "Team Qualifications", maxPoints: 20, description: "Key personnel and team experience" },
    ];
    const result = calculatePredictedScores(criteria, fullOrg);
    const teamScore = result.scores[0];
    expect(teamScore.orgDataUsed).toContain("Founder/Leadership Background");
    expect(teamScore.orgDataUsed).toContain("Team Size");
  });

  it("mission-related criteria maps to mission and problemStatement", () => {
    const criteria = [
      { name: "Statement of Need", maxPoints: 25, description: "Mission and problem being addressed" },
    ];
    const result = calculatePredictedScores(criteria, fullOrg);
    const missionScore = result.scores[0];
    expect(missionScore.orgDataUsed).toContain("Mission Statement");
    expect(missionScore.orgDataUsed).toContain("Problem Statement");
  });

  it("missing org data produces gaps", () => {
    const criteria = [
      { name: "Team Qualifications", maxPoints: 20, description: "Key personnel and team experience" },
    ];
    const result = calculatePredictedScores(criteria, emptyOrg);
    const teamScore = result.scores[0];
    expect(teamScore.gaps.length).toBeGreaterThan(0);
    expect(teamScore.gaps.some((g) => g.includes("Missing"))).toBe(true);
  });

  it("predicted points never exceed maxPoints", () => {
    const criteria = [
      { name: "Team Qualifications", maxPoints: 10, description: "Key personnel and leadership" },
      { name: "Statement of Need", maxPoints: 15, description: "Mission and problem statement" },
      { name: "Technical Approach", maxPoints: 30, description: "Methodology and solution design" },
    ];
    const result = calculatePredictedScores(criteria, fullOrg);
    for (const score of result.scores) {
      expect(score.predictedPoints).toBeLessThanOrEqual(score.maxPoints);
    }
  });

  it("confidence scales with number of matched fields", () => {
    const criteria = [
      { name: "Team Qualifications", maxPoints: 20, description: "Key personnel and team experience" },
    ];
    const fullResult = calculatePredictedScores(criteria, fullOrg);
    const emptyResult = calculatePredictedScores(criteria, emptyOrg);
    expect(fullResult.scores[0].confidence).toBeGreaterThan(
      emptyResult.scores[0].confidence
    );
  });

  it("empty org data = low coverage but not zero (base coverage)", () => {
    const criteria = [
      { name: "Completely Unknown Criterion", maxPoints: 20, description: "Something with no keyword match" },
    ];
    const result = calculatePredictedScores(criteria, emptyOrg);
    // No mapping found -> baseline 30% of maxPoints
    expect(result.scores[0].predictedPoints).toBe(6); // Math.round(20 * 0.3)
    expect(result.scores[0].predictedPoints).toBeGreaterThan(0);
  });

  it("total predicted is sum of individual scores", () => {
    const criteria = [
      { name: "Team Qualifications", maxPoints: 20, description: "Key personnel" },
      { name: "Statement of Need", maxPoints: 25, description: "Mission and problem" },
      { name: "Budget", maxPoints: 15, description: "Financial plan and cost" },
    ];
    const result = calculatePredictedScores(criteria, fullOrg);
    const manualSum = result.scores.reduce((s, sc) => s + sc.predictedPoints, 0);
    expect(result.totalPredicted).toBe(manualSum);
  });

  it("total max is sum of individual maxPoints", () => {
    const criteria = [
      { name: "Team Qualifications", maxPoints: 20, description: "Key personnel" },
      { name: "Statement of Need", maxPoints: 25, description: "Mission and problem" },
    ];
    const result = calculatePredictedScores(criteria, fullOrg);
    expect(result.totalMax).toBe(45);
  });
});
