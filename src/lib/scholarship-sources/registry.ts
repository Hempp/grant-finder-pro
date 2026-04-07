import type { ScholarshipSource, ScrapedScholarship } from "./types";

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
      try {
        const scholarships = await source.scrape();
        results.push(...scholarships);
      } catch (error) {
        console.error(`Scholarship source ${source.id} failed:`, error);
      }
    }
    return results;
  }
}

export const scholarshipSourceRegistry = new ScholarshipSourceRegistry();
