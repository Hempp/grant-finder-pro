import { Redis } from "@upstash/redis";

/**
 * Thin JSON key/value cache over Upstash Redis. Falls back to an
 * in-process Map when UPSTASH_REDIS_REST_URL is not set (development).
 *
 * Designed for read-heavy, lightly-personalized API responses where a
 * short TTL is acceptable (billing list, grant catalogue, dashboard
 * stats). NOT for session state or anything requiring strong
 * consistency.
 */

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// In-process fallback so dev doesn't require Redis. Size-bounded via
// Map insertion order + a small cap; good enough for a dev cache.
const memoryCache = new Map<string, { value: unknown; expiresAt: number }>();
const MEMORY_CAP = 500;

function memoryGet<T>(key: string): T | null {
  const hit = memoryCache.get(key);
  if (!hit) return null;
  if (hit.expiresAt < Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return hit.value as T;
}

function memorySet<T>(key: string, value: T, ttlSeconds: number): void {
  if (memoryCache.size >= MEMORY_CAP) {
    const first = memoryCache.keys().next().value;
    if (first !== undefined) memoryCache.delete(first);
  }
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return memoryGet<T>(key);
  try {
    const raw = await redis.get<T>(key);
    return raw ?? null;
  } catch (err) {
    // Never let a cache fault crash the request — fall back to miss.
    console.warn("cacheGet failure (treating as miss):", err);
    return null;
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  if (!redis) {
    memorySet(key, value, ttlSeconds);
    return;
  }
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    console.warn("cacheSet failure (continuing without cache):", err);
  }
}

export async function cacheDelete(key: string): Promise<void> {
  if (!redis) {
    memoryCache.delete(key);
    return;
  }
  try {
    await redis.del(key);
  } catch (err) {
    console.warn("cacheDelete failure:", err);
  }
}
