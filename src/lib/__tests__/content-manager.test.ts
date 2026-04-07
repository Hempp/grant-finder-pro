import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
const mockFindFirst = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockFindMany = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    contentBlock: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

import { createBlock, detectConflicts } from "../content-library/content-manager";

describe("createBlock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new block when no duplicate exists", async () => {
    mockFindFirst.mockResolvedValue(null);
    const newBlock = {
      id: "new-1",
      userId: "user-1",
      category: "mission",
      title: "Our Mission",
      content: "We build great things.",
      source: "manual",
      confidence: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastVerified: null,
    };
    mockCreate.mockResolvedValue(newBlock);

    const result = await createBlock("user-1", {
      category: "mission",
      title: "Our Mission",
      content: "We build great things.",
      source: "manual",
    });

    expect(mockCreate).toHaveBeenCalledOnce();
    expect(result.id).toBe("new-1");
  });

  it("returns existing block when duplicate has longer content", async () => {
    const existing = {
      id: "existing-1",
      userId: "user-1",
      category: "mission",
      title: "Our Mission",
      content: "We build great things and do even more amazing stuff.",
      source: "manual",
      confidence: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastVerified: null,
    };
    mockFindFirst.mockResolvedValue(existing);

    const result = await createBlock("user-1", {
      category: "mission",
      title: "Our Mission",
      content: "Short.",
      source: "website",
    });

    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(result.id).toBe("existing-1");
  });

  it("updates existing block when new content is richer", async () => {
    const existing = {
      id: "existing-1",
      userId: "user-1",
      category: "mission",
      title: "Our Mission",
      content: "Short.",
      source: "website",
      confidence: 70,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastVerified: null,
    };
    mockFindFirst.mockResolvedValue(existing);
    mockUpdate.mockResolvedValue({ ...existing, content: "Much longer and richer content here.", confidence: 100 });

    const result = await createBlock("user-1", {
      category: "mission",
      title: "Our Mission",
      content: "Much longer and richer content here.",
      source: "manual",
    });

    expect(mockUpdate).toHaveBeenCalledOnce();
    expect(mockCreate).not.toHaveBeenCalled();
    expect(result.content).toBe("Much longer and richer content here.");
  });

  it("updates existing block when new source has higher confidence", async () => {
    const existing = {
      id: "existing-1",
      userId: "user-1",
      category: "mission",
      title: "Our Mission",
      content: "Same length content.",
      source: "website",
      confidence: 70,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastVerified: null,
    };
    mockFindFirst.mockResolvedValue(existing);
    mockUpdate.mockResolvedValue({ ...existing, content: "Same length content.", source: "manual", confidence: 100 });

    const result = await createBlock("user-1", {
      category: "mission",
      title: "Our Mission",
      content: "Same length content.",
      source: "manual",
    });

    expect(mockUpdate).toHaveBeenCalledOnce();
  });
});

describe("detectConflicts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detects conflict when same category+title exists with different content", async () => {
    mockFindMany.mockResolvedValue([
      { category: "mission", title: "Our Mission", content: "Existing long content that has many words." },
    ]);

    const conflicts = await detectConflicts("user-1", [
      { category: "mission", title: "Our Mission", content: "New.", source: "website" },
    ]);

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].recommendation).toBe("keep_existing");
  });

  it("returns empty when no conflicts", async () => {
    mockFindMany.mockResolvedValue([]);

    const conflicts = await detectConflicts("user-1", [
      { category: "mission", title: "Our Mission", content: "New content.", source: "manual" },
    ]);

    expect(conflicts).toHaveLength(0);
  });
});
