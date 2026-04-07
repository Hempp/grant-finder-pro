import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: { slidingWindow: vi.fn() },
}));
vi.mock("@upstash/redis", () => ({
  Redis: vi.fn(),
}));
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
      body,
      status: init?.status || 200,
      headers: new Map(Object.entries(init?.headers || {})),
    }),
  },
}));
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: (key: string) => {
      if (key === "x-forwarded-for") return "1.2.3.4";
      return null;
    },
  }),
}));

// No UPSTASH env vars → will use memory fallback
delete process.env.UPSTASH_REDIS_REST_URL;

import { rateLimit, getIdentifier } from "../rate-limit";

describe("rateLimit (memory fallback)", () => {
  it("allows requests under the limit", async () => {
    const result = await rateLimit("api", "test-user-1");
    expect(result.success).toBe(true);
    expect(result.remaining).toBeGreaterThan(0);
  });

  it("blocks requests over the limit", async () => {
    // AI limit is 10 per minute in memory fallback
    const identifier = `user:rate-limit-test-${Date.now()}`;
    for (let i = 0; i < 10; i++) {
      const r = await rateLimit("ai", identifier);
      expect(r.success).toBe(true);
    }
    const blocked = await rateLimit("ai", identifier);
    expect(blocked.success).toBe(false);
  });

  it("auth limit is 5 per minute", async () => {
    const identifier = `user:auth-test-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      const r = await rateLimit("auth", identifier);
      expect(r.success).toBe(true);
    }
    const blocked = await rateLimit("auth", identifier);
    expect(blocked.success).toBe(false);
  });
});

describe("getIdentifier", () => {
  it("returns user ID when provided", async () => {
    const id = await getIdentifier("user-123");
    expect(id).toBe("user:user-123");
  });

  it("falls back to IP from headers", async () => {
    const id = await getIdentifier();
    expect(id).toBe("ip:1.2.3.4");
  });
});
