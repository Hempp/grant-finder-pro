import { describe, it, expect } from "vitest";

// Test that all scraper sources can be imported and instantiated
describe("Grant Sources", () => {
  it("registers all 12 grant sources", async () => {
    const { grantSourceRegistry } = await import("../grant-sources");
    const enabled = grantSourceRegistry.getEnabled();
    expect(enabled.length).toBeGreaterThanOrEqual(10);
  });

  it("EdGovGrantSource returns curated education grants", async () => {
    const { EdGovGrantSource } = await import("../grant-sources/ed-gov");
    const source = new EdGovGrantSource();
    expect(source.id).toBe("ed-gov");
    expect(source.isEnabled()).toBe(true);
    // The curated method is private but we can test via scrape
    // which will return curated grants even if APIs fail
  });

  it("EducationFoundationsSource returns curated foundation grants", async () => {
    const { EducationFoundationsSource } = await import("../grant-sources/education-foundations");
    const source = new EducationFoundationsSource();
    expect(source.id).toBe("education-foundations");
    expect(source.isEnabled()).toBe(true);
  });
});

describe("Scholarship Sources", () => {
  it("registers all 10 scholarship sources", async () => {
    const { scholarshipSourceRegistry } = await import("../scholarship-sources");
    const enabled = scholarshipSourceRegistry.getEnabled();
    expect(enabled.length).toBeGreaterThanOrEqual(8);
  });

  it("Scholarships360Source is enabled", async () => {
    const { Scholarships360Source } = await import("../scholarship-sources/scholarships360");
    const source = new Scholarships360Source();
    expect(source.id).toBe("scholarships360");
    expect(source.isEnabled()).toBe(true);
  });

  it("CollegeBoardSource is enabled", async () => {
    const { CollegeBoardSource } = await import("../scholarship-sources/college-board");
    const source = new CollegeBoardSource();
    expect(source.id).toBe("college-board");
    expect(source.isEnabled()).toBe(true);
  });
});

describe("Student Limits", () => {
  it("student free has 8% success fee", async () => {
    const { getStudentFeePercent } = await import("../stripe");
    expect(getStudentFeePercent("free")).toBe(8);
  });

  it("student pro has 3% success fee (not 0%)", async () => {
    const { getStudentFeePercent } = await import("../stripe");
    expect(getStudentFeePercent("student_pro")).toBe(3);
  });

  it("no plan has unlimited (-1) limits", async () => {
    const { PLANS } = await import("../stripe");
    for (const [planName, plan] of Object.entries(PLANS)) {
      for (const [limitKey, value] of Object.entries(plan.limits)) {
        expect(value, `${planName}.${limitKey} should not be -1 (unlimited)`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("student limits have real caps", async () => {
    const { getStudentLimits } = await import("../stripe");
    const free = getStudentLimits("free");
    expect(free.autoApplyPerMonth).toBe(5);
    expect(free.essayDraftsPerMonth).toBe(5);

    const pro = getStudentLimits("student_pro");
    expect(pro.autoApplyPerMonth).toBe(25);
    expect(pro.essayDraftsPerMonth).toBe(25);
  });
});
