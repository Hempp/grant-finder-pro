import { describe, it, expect } from "vitest";
import { GrantSourceRegistry } from "../grant-sources/registry";
import type { GrantSource, ScrapedGrant } from "../grant-sources/types";

function makeMockSource(
  overrides: Partial<GrantSource> = {}
): GrantSource {
  return {
    id: "test",
    name: "Test Source",
    type: "federal",
    isEnabled: () => true,
    scrape: async (): Promise<ScrapedGrant[]> => [
      {
        title: "Test Grant",
        funder: "Test Funder",
        description: "Test",
        amount: "$10,000",
        amountMin: null,
        amountMax: 10000,
        deadline: null,
        url: "https://test.gov",
        type: "federal",
        category: "test",
        eligibility: "All",
        state: "ALL",
        tags: [],
        source: "test",
        agencyName: "Test Agency",
        sourceId: "test-1",
        sourceUrl: "https://test.gov",
        nofoUrl: null,
      },
    ],
    ...overrides,
  };
}

describe("GrantSourceRegistry", () => {
  it("register adds source to registry", () => {
    const registry = new GrantSourceRegistry();
    const source = makeMockSource();
    registry.register(source);
    expect(registry.getEnabled()).toHaveLength(1);
    expect(registry.getEnabled()[0].id).toBe("test");
  });

  it("getEnabled filters disabled sources", () => {
    const registry = new GrantSourceRegistry();
    registry.register(makeMockSource({ id: "enabled", isEnabled: () => true }));
    registry.register(
      makeMockSource({ id: "disabled", isEnabled: () => false })
    );
    const enabled = registry.getEnabled();
    expect(enabled).toHaveLength(1);
    expect(enabled[0].id).toBe("enabled");
  });

  it("scrapeAll runs all enabled sources", async () => {
    const registry = new GrantSourceRegistry();
    registry.register(makeMockSource({ id: "source-a" }));
    registry.register(makeMockSource({ id: "source-b" }));
    const results = await registry.scrapeAll();
    expect(results).toHaveLength(2);
    expect(results[0].grants).toHaveLength(1);
    expect(results[1].grants).toHaveLength(1);
  });

  it("scrapeAll handles errors gracefully", async () => {
    const registry = new GrantSourceRegistry();
    registry.register(makeMockSource({ id: "good" }));
    registry.register(
      makeMockSource({
        id: "bad",
        scrape: async () => {
          throw new Error("Network failure");
        },
      })
    );
    const results = await registry.scrapeAll();
    expect(results).toHaveLength(2);

    const good = results.find((r) => r.source === "good");
    const bad = results.find((r) => r.source === "bad");

    expect(good!.grants).toHaveLength(1);
    expect(good!.error).toBeUndefined();

    expect(bad!.grants).toHaveLength(0);
    // Circuit breaker catches the error and serves fallback (empty array)
    // The error is logged but not propagated as a field anymore
    expect(bad!.fromFallback).toBe(true);
  });

  it("empty registry returns empty results", async () => {
    const registry = new GrantSourceRegistry();
    const results = await registry.scrapeAll();
    expect(results).toHaveLength(0);
  });
});
