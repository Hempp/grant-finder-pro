import { describe, it, expect, vi } from "vitest";
import { ScholarshipSourceRegistry } from "../scholarship-sources/registry";
import type { ScholarshipSource, ScrapedScholarship } from "../scholarship-sources/types";

function makeMockScholarship(overrides: Partial<ScrapedScholarship> = {}): ScrapedScholarship {
  return {
    title: "Test Scholarship",
    provider: "Test Provider",
    description: "A test scholarship for unit testing purposes.",
    amount: "$5,000",
    amountMin: 5000,
    amountMax: 5000,
    scholarshipType: "merit",
    educationLevels: ["undergraduate"],
    essayRequired: false,
    submissionMethod: "portal",
    tags: ["test"],
    sourceId: "test-1",
    sourceUrl: "https://test.example.com",
    ...overrides,
  };
}

function makeMockSource(overrides: Partial<ScholarshipSource> = {}): ScholarshipSource {
  return {
    id: "test-source",
    name: "Test Source",
    type: "curated",
    isEnabled: () => true,
    scrape: async () => [makeMockScholarship()],
    ...overrides,
  };
}

describe("ScholarshipSourceRegistry", () => {
  it("registers a source and retrieves it via getEnabled", () => {
    const registry = new ScholarshipSourceRegistry();
    const source = makeMockSource({ id: "curated" });
    registry.register(source);

    const enabled = registry.getEnabled();
    expect(enabled).toHaveLength(1);
    expect(enabled[0].id).toBe("curated");
  });

  it("scrapes all enabled sources and returns combined results", async () => {
    const registry = new ScholarshipSourceRegistry();

    registry.register(
      makeMockSource({
        id: "source-a",
        scrape: async () => [
          makeMockScholarship({ title: "Scholarship A1", sourceId: "a1" }),
          makeMockScholarship({ title: "Scholarship A2", sourceId: "a2" }),
        ],
      })
    );
    registry.register(
      makeMockSource({
        id: "source-b",
        scrape: async () => [
          makeMockScholarship({ title: "Scholarship B1", sourceId: "b1" }),
        ],
      })
    );

    const results = await registry.scrapeAll();

    expect(results).toHaveLength(3);
    expect(results.map((r) => r.title)).toEqual(
      expect.arrayContaining(["Scholarship A1", "Scholarship A2", "Scholarship B1"])
    );
  });

  it("handles source errors without crashing and continues other sources", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const registry = new ScholarshipSourceRegistry();

    registry.register(
      makeMockSource({
        id: "good-source",
        scrape: async () => [makeMockScholarship({ title: "Good Scholarship" })],
      })
    );
    registry.register(
      makeMockSource({
        id: "broken-source",
        scrape: async () => {
          throw new Error("Network timeout");
        },
      })
    );

    const results = await registry.scrapeAll();

    // Should still return results from the good source
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("Good Scholarship");

    // Should have logged the error
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("broken-source"),
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});
