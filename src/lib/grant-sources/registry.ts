import { GrantSource, ScrapedGrant } from "./types";
import { withCircuitBreaker } from "../circuit-breaker";

export class GrantSourceRegistry {
  private sources: Map<string, GrantSource> = new Map();

  register(source: GrantSource): void {
    this.sources.set(source.id, source);
  }

  getEnabled(): GrantSource[] {
    return Array.from(this.sources.values()).filter((s) => s.isEnabled());
  }

  async scrapeAll(): Promise<{ source: string; grants: ScrapedGrant[]; error?: string; fromFallback?: boolean }[]> {
    const enabled = this.getEnabled();
    const results = await Promise.allSettled(
      enabled.map(async (source) => {
        // Circuit breaker: if source has failed 3x, skip for 5 minutes
        const { result: grants, circuitState, fromFallback } = await withCircuitBreaker(
          `grant-${source.id}`,
          () => source.scrape(),
          [] as ScrapedGrant[], // fallback: empty array
        );

        if (fromFallback) {
          console.warn(`[GrantRegistry] ${source.id}: circuit ${circuitState}, serving fallback`);
        }

        return { source: source.id, grants, fromFallback };
      })
    );

    return results.map((result, i) => {
      if (result.status === "fulfilled") {
        return result.value;
      }
      return {
        source: enabled[i].id,
        grants: [],
        error: result.reason?.message || "Unknown error",
      };
    });
  }
}

export const grantSourceRegistry = new GrantSourceRegistry();
