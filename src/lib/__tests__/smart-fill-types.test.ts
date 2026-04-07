import { describe, it, expect } from "vitest";
import {
  SOURCE_CONFIDENCE,
  CATEGORY_LABELS,
  type ContentCategory,
  type ContentSource,
} from "../content-library/types";

describe("Content Library types", () => {
  it("has confidence scores for all source types", () => {
    const sources: ContentSource[] = ["manual", "profile", "application", "document", "website"];
    for (const source of sources) {
      expect(SOURCE_CONFIDENCE[source]).toBeGreaterThan(0);
      expect(SOURCE_CONFIDENCE[source]).toBeLessThanOrEqual(100);
    }
  });

  it("manual source has highest confidence", () => {
    expect(SOURCE_CONFIDENCE.manual).toBe(100);
    expect(SOURCE_CONFIDENCE.manual).toBeGreaterThan(SOURCE_CONFIDENCE.website);
    expect(SOURCE_CONFIDENCE.manual).toBeGreaterThan(SOURCE_CONFIDENCE.document);
  });

  it("has labels for all categories", () => {
    const categories: ContentCategory[] = [
      "company_overview", "mission", "team_bios", "past_performance",
      "technical_capabilities", "financials", "prior_grants", "partnerships",
      "dei_statement", "impact_metrics", "facilities", "ip_patents",
      "environmental", "custom",
      // Student
      "personal_statement", "activities", "work_experience", "community_service",
      "awards_honors", "career_goals", "challenges_overcome", "leadership",
      "research_experience", "why_this_field", "financial_need_statement", "diversity_statement",
    ];
    for (const cat of categories) {
      expect(CATEGORY_LABELS[cat]).toBeTruthy();
      expect(typeof CATEGORY_LABELS[cat]).toBe("string");
    }
  });

  it("confidence is ordered: manual > profile > application > document > website", () => {
    expect(SOURCE_CONFIDENCE.manual).toBeGreaterThan(SOURCE_CONFIDENCE.profile);
    expect(SOURCE_CONFIDENCE.profile).toBeGreaterThan(SOURCE_CONFIDENCE.application);
    expect(SOURCE_CONFIDENCE.application).toBeGreaterThan(SOURCE_CONFIDENCE.document);
    expect(SOURCE_CONFIDENCE.document).toBeGreaterThan(SOURCE_CONFIDENCE.website);
  });
});
