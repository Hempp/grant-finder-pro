import type { ScholarshipSource, ScrapedScholarship } from "./types";
import { withCircuitBreaker } from "../circuit-breaker";

export class ScholarshipSourceRegistry {
  private sources: ScholarshipSource[] = [];

  register(source: ScholarshipSource): void {
    this.sources.push(source);
  }

  getEnabled(): ScholarshipSource[] {
    return this.sources.filter((s) => s.isEnabled());
  }

  async scrapeAll(): Promise<ScrapedScholarship[]> {
    const enabled = this.getEnabled();
    const results: ScrapedScholarship[] = [];

    for (const source of enabled) {
      const { result: scholarships, fromFallback } = await withCircuitBreaker(
        `scholarship-${source.id}`,
        () => source.scrape(),
        [] as ScrapedScholarship[],
      );

      if (fromFallback) {
        console.warn(`[ScholarshipRegistry] ${source.id}: circuit tripped, serving fallback`);
      }

      results.push(...scholarships);
    }

    return results;
  }
}

export const scholarshipSourceRegistry = new ScholarshipSourceRegistry();
