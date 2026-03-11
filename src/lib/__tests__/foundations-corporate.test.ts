import { describe, it, expect } from "vitest";
import { FoundationsSource } from "../grant-sources/foundations";
import { CorporateGrantsSource } from "../grant-sources/corporate";

describe("FoundationsSource", () => {
  const source = new FoundationsSource();

  it("has correct metadata", () => {
    expect(source.id).toBe("foundations");
    expect(source.type).toBe("foundation");
    expect(source.isEnabled()).toBe(true);
  });

  it("returns curated foundation grants", async () => {
    const grants = await source.scrape();
    expect(grants.length).toBeGreaterThanOrEqual(10);
  });

  it("all grants have required fields", async () => {
    const grants = await source.scrape();
    for (const grant of grants) {
      expect(grant.title).toBeTruthy();
      expect(grant.funder).toBeTruthy();
      expect(grant.description.length).toBeGreaterThan(50);
      expect(grant.type).toBe("foundation");
      expect(grant.source).toBe("foundation");
      expect(grant.sourceId).toBeTruthy();
      expect(grant.url).toMatch(/^https?:\/\//);
    }
  });

  it("grants have valid amount ranges", async () => {
    const grants = await source.scrape();
    for (const grant of grants) {
      if (grant.amountMin !== null && grant.amountMax !== null) {
        expect(grant.amountMin).toBeLessThanOrEqual(grant.amountMax);
      }
    }
  });

  it("grants have unique sourceIds", async () => {
    const grants = await source.scrape();
    const ids = new Set(grants.map((g) => g.sourceId));
    expect(ids.size).toBe(grants.length);
  });

  it("includes major foundations", async () => {
    const grants = await source.scrape();
    const funders = grants.map((g) => g.funder);
    expect(funders.some((f) => f.includes("Gates"))).toBe(true);
    expect(funders.some((f) => f.includes("Ford"))).toBe(true);
    expect(funders.some((f) => f.includes("MacArthur"))).toBe(true);
  });
});

describe("CorporateGrantsSource", () => {
  const source = new CorporateGrantsSource();

  it("has correct metadata", () => {
    expect(source.id).toBe("corporate");
    expect(source.type).toBe("corporate");
    expect(source.isEnabled()).toBe(true);
  });

  it("returns curated corporate grants", async () => {
    const grants = await source.scrape();
    expect(grants.length).toBeGreaterThanOrEqual(10);
  });

  it("all grants have required fields", async () => {
    const grants = await source.scrape();
    for (const grant of grants) {
      expect(grant.title).toBeTruthy();
      expect(grant.funder).toBeTruthy();
      expect(grant.description.length).toBeGreaterThan(50);
      expect(grant.type).toBe("corporate");
      expect(grant.source).toBe("corporate");
      expect(grant.sourceId).toBeTruthy();
      expect(grant.url).toMatch(/^https?:\/\//);
    }
  });

  it("grants have unique sourceIds", async () => {
    const grants = await source.scrape();
    const ids = new Set(grants.map((g) => g.sourceId));
    expect(ids.size).toBe(grants.length);
  });

  it("includes major tech companies", async () => {
    const grants = await source.scrape();
    const funders = grants.map((g) => g.funder);
    expect(funders.some((f) => f.includes("Google"))).toBe(true);
    expect(funders.some((f) => f.includes("Microsoft"))).toBe(true);
    expect(funders.some((f) => f.includes("Amazon"))).toBe(true);
  });
});
