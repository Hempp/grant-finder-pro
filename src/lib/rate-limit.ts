import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

// Initialize Redis client - fallback to memory if no Redis configured
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// In-memory fallback for development
const memoryStore = new Map<string, { count: number; reset: number }>();

// Rate limit configurations for different endpoints
export const rateLimiters = {
  // Strict limit for auth endpoints (prevent brute force)
  auth: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests per minute
        analytics: true,
        prefix: "ratelimit:auth",
      })
    : null,

  // Standard API limit
  api: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 m"), // 60 requests per minute
        analytics: true,
        prefix: "ratelimit:api",
      })
    : null,

  // AI endpoints (expensive operations)
  ai: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
        analytics: true,
        prefix: "ratelimit:ai",
      })
    : null,

  // Stripe webhooks (higher limit)
  webhook: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
        analytics: true,
        prefix: "ratelimit:webhook",
      })
    : null,
};

type RateLimitType = keyof typeof rateLimiters;

// Memory-based rate limiting fallback for development
function memoryRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const key = identifier;
  const record = memoryStore.get(key);

  if (!record || now > record.reset) {
    memoryStore.set(key, { count: 1, reset: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, reset: record.reset };
  }

  record.count++;
  return { success: true, remaining: limit - record.count, reset: record.reset };
}

// Get client identifier (IP or user ID)
export async function getIdentifier(userId?: string): Promise<string> {
  if (userId) return `user:${userId}`;

  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0] ?? realIp ?? "anonymous";

  return `ip:${ip}`;
}

// Rate limit check function
export async function rateLimit(
  type: RateLimitType = "api",
  identifier?: string
): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
  response?: NextResponse;
}> {
  const id = identifier ?? (await getIdentifier());
  const limiter = rateLimiters[type];

  // Use memory fallback in development
  if (!limiter) {
    const limits: Record<RateLimitType, { limit: number; window: number }> = {
      auth: { limit: 5, window: 60000 },
      api: { limit: 60, window: 60000 },
      ai: { limit: 10, window: 60000 },
      webhook: { limit: 100, window: 60000 },
    };
    const config = limits[type];
    return memoryRateLimit(`${type}:${id}`, config.limit, config.window);
  }

  try {
    const result = await limiter.limit(id);

    if (!result.success) {
      return {
        success: false,
        remaining: result.remaining,
        reset: result.reset,
        response: NextResponse.json(
          {
            error: "Too many requests",
            message: "Please slow down and try again later",
            retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": String(result.limit),
              "X-RateLimit-Remaining": String(result.remaining),
              "X-RateLimit-Reset": String(result.reset),
              "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)),
            },
          }
        ),
      };
    }

    return {
      success: true,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fail open in case of Redis errors
    return { success: true, remaining: 999, reset: Date.now() + 60000 };
  }
}

// Middleware helper for API routes
export async function withRateLimit(
  type: RateLimitType = "api",
  handler: () => Promise<NextResponse>,
  identifier?: string
): Promise<NextResponse> {
  const result = await rateLimit(type, identifier);

  if (!result.success && result.response) {
    return result.response;
  }

  const response = await handler();

  // Add rate limit headers to successful responses
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set("X-RateLimit-Reset", String(result.reset));

  return response;
}
