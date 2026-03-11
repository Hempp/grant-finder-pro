import { describe, it, expect, vi, beforeEach } from "vitest";
import { SamGovSource } from "../grant-sources/sam-gov";

describe("SamGovSource", () => {
  let source: SamGovSource;

  beforeEach(() => {
    source = new SamGovSource();
    vi.restoreAllMocks();
  });

  it("has correct metadata", () => {
    expect(source.id).toBe("sam_gov");
    expect(source.name).toBe("SAM.gov");
    expect(source.type).toBe("federal");
  });

  it("is always enabled", () => {
    expect(source.isEnabled()).toBe(true);
  });

  it("returns curated grants when no API key", async () => {
    delete process.env.SAM_GOV_API_KEY;

    const grants = await source.scrape();
    expect(grants.length).toBeGreaterThanOrEqual(10);

    // Verify structure of curated grants
    for (const grant of grants) {
      expect(grant.title).toBeTruthy();
      expect(grant.funder).toBeTruthy();
      expect(grant.description).toBeTruthy();
      expect(grant.type).toBe("federal");
      expect(grant.source).toBe("sam_gov");
      expect(grant.sourceId).toBeTruthy();
    }
  });

  it("curated grants include well-known programs", async () => {
    delete process.env.SAM_GOV_API_KEY;

    const grants = await source.scrape();
    const titles = grants.map((g) => g.title);

    expect(titles).toContain("SBIR Phase I - Department of Defense");
    expect(titles).toContain("SBIR Phase I - National Science Foundation");
    expect(titles).toContain("Community Development Block Grant");
    expect(titles).toContain("ARPA-E OPEN Program");
  });

  it("curated grants have valid amount ranges", async () => {
    delete process.env.SAM_GOV_API_KEY;

    const grants = await source.scrape();
    for (const grant of grants) {
      if (grant.amountMin !== null && grant.amountMax !== null) {
        expect(grant.amountMin).toBeLessThanOrEqual(grant.amountMax);
      }
      if (grant.amountMax !== null) {
        expect(grant.amountMax).toBeGreaterThan(0);
      }
    }
  });

  it("curated grants have unique sourceIds", async () => {
    delete process.env.SAM_GOV_API_KEY;

    const grants = await source.scrape();
    const ids = grants.map((g) => g.sourceId);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});
