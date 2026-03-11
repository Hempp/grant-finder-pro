import { GrantSource, ScrapedGrant } from "./types";

export class GrantSourceRegistry {
  private sources: Map<string, GrantSource> = new Map();

  register(source: GrantSource): void {
    this.sources.set(source.id, source);
  }

  getEnabled(): GrantSource[] {
    return Array.from(this.sources.values()).filter((s) => s.isEnabled());
  }

  async scrapeAll(): Promise<{ source: string; grants: ScrapedGrant[]; error?: string }[]> {
    const enabled = this.getEnabled();
    const results = await Promise.allSettled(
      enabled.map(async (source) => {
        const grants = await source.scrape();
        return { source: source.id, grants };
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
