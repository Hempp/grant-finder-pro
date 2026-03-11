import { describe, it, expect, vi, beforeEach } from "vitest";
import { CaliforniaGrantsSource } from "../grant-sources/california-grants";

describe("CaliforniaGrantsSource", () => {
  let source: CaliforniaGrantsSource;

  beforeEach(() => {
    source = new CaliforniaGrantsSource();
    vi.restoreAllMocks();
  });

  it("has correct metadata", () => {
    expect(source.id).toBe("california_grants");
    expect(source.name).toBe("California Grants Portal");
    expect(source.type).toBe("state");
    expect(source.isEnabled()).toBe(true);
  });

  it("returns empty array on API error", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const grants = await source.scrape();
    expect(grants).toEqual([]);
  });

  it("returns empty array on timeout", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(
      Object.assign(new Error("aborted"), { name: "AbortError" })
    );

    const grants = await source.scrape();
    expect(grants).toEqual([]);
  });

  it("parses grants from array response", async () => {
    const mockGrants = [
      {
        title: "Test California Grant",
        grantorName: "California Agency",
        description: "A test grant",
        fundingAmount: "$50,000 - $100,000",
        applicationDeadline: "2027-12-31",
        grantUrl: "https://example.com/grant",
        categories: ["Technology", "Innovation"],
        eligibility: "CA businesses",
        status: "open",
        id: "ca-123",
      },
    ];

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockGrants,
    } as Response);

    const grants = await source.scrape();
    expect(grants).toHaveLength(1);
    expect(grants[0].title).toBe("Test California Grant");
    expect(grants[0].funder).toBe("California Agency");
    expect(grants[0].state).toBe("CA");
    expect(grants[0].type).toBe("state");
    expect(grants[0].amountMin).toBe(50000);
    expect(grants[0].amountMax).toBe(100000);
    expect(grants[0].sourceId).toBe("ca-123");
    expect(grants[0].source).toBe("grants.ca.gov");
  });

  it("filters out closed grants", async () => {
    const mockGrants = [
      { title: "Open Grant", status: "open", id: "1" },
      { title: "Closed Grant", status: "closed", id: "2" },
      { title: "Active Grant", status: "active", id: "3" },
      { title: "Inactive Grant", status: "inactive", id: "4" },
    ];

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockGrants,
    } as Response);

    const grants = await source.scrape();
    expect(grants).toHaveLength(2);
    expect(grants.map((g) => g.title)).toEqual(["Open Grant", "Active Grant"]);
  });

  it("filters out past-deadline grants with no status", async () => {
    const mockGrants = [
      { title: "Past Grant", applicationDeadline: "2020-01-01", id: "1" },
      { title: "Future Grant", applicationDeadline: "2030-01-01", id: "2" },
      { title: "No Deadline Grant", id: "3" },
    ];

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockGrants,
    } as Response);

    const grants = await source.scrape();
    expect(grants).toHaveLength(2);
    expect(grants.map((g) => g.title)).toEqual([
      "Future Grant",
      "No Deadline Grant",
    ]);
  });

  it("handles single amount parsing", async () => {
    const mockGrants = [
      {
        title: "Single Amount",
        fundingAmount: "$250,000",
        status: "open",
        id: "1",
      },
    ];

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockGrants,
    } as Response);

    const grants = await source.scrape();
    expect(grants[0].amountMin).toBeNull();
    expect(grants[0].amountMax).toBe(250000);
    expect(grants[0].amount).toBe("Up to $250,000");
  });

  it("handles missing amount", async () => {
    const mockGrants = [
      { title: "No Amount", status: "open", id: "1" },
    ];

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockGrants,
    } as Response);

    const grants = await source.scrape();
    expect(grants[0].amount).toBe("");
    expect(grants[0].amountMin).toBeNull();
    expect(grants[0].amountMax).toBeNull();
  });

  it("handles wrapped response format", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        grants: [{ title: "Wrapped Grant", status: "open", id: "1" }],
      }),
    } as Response);

    const grants = await source.scrape();
    expect(grants).toHaveLength(1);
    expect(grants[0].title).toBe("Wrapped Grant");
  });
});
