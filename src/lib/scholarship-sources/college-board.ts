/**
 * College Board BigFuture Scholarship Scraper
 *
 * Scrapes scholarship data from College Board's BigFuture scholarship search.
 * Also includes Peterson's and related education scholarship databases.
 */

import type { ScholarshipSource, ScrapedScholarship, ScholarshipFilters } from "./types";

interface CBScholarship {
  name?: string;
  title?: string;
  sponsor?: string;
  organization?: string;
  amount?: string;
  awardAmount?: number;
  amountMin?: number;
  amountMax?: number;
  deadline?: string;
  url?: string;
  description?: string;
  eligibility?: string;
  gpa?: number;
  type?: string;
  renewable?: boolean;
  state?: string;
  fieldsOfStudy?: string[];
  educationLevel?: string[];
}

const SEARCH_QUERIES = [
  // By field
  { keyword: "education", field: "education" },
  { keyword: "teaching", field: "education" },
  { keyword: "STEM", field: "stem" },
  { keyword: "science", field: "stem" },
  { keyword: "technology", field: "stem" },
  { keyword: "engineering", field: "engineering" },
  { keyword: "mathematics", field: "stem" },
  { keyword: "nursing", field: "health" },
  { keyword: "medical", field: "health" },
  { keyword: "business", field: "business" },
  { keyword: "arts", field: "arts" },
  { keyword: "music", field: "arts" },
  { keyword: "writing", field: "arts" },
  { keyword: "computer science", field: "stem" },
  { keyword: "psychology", field: "social_science" },
  { keyword: "social work", field: "social_science" },
  // By demographic
  { keyword: "first generation", field: "general" },
  { keyword: "minority", field: "general" },
  { keyword: "hispanic", field: "general" },
  { keyword: "african american", field: "general" },
  { keyword: "native american", field: "general" },
  { keyword: "women in STEM", field: "stem" },
  { keyword: "veteran", field: "general" },
  { keyword: "disability", field: "general" },
  // By type
  { keyword: "merit", field: "general" },
  { keyword: "need based", field: "general" },
  { keyword: "full ride", field: "general" },
  { keyword: "community college", field: "general" },
  { keyword: "graduate school", field: "general" },
  { keyword: "international student", field: "general" },
];

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export class CollegeBoardSource implements ScholarshipSource {
  id = "college-board";
  name = "College Board & Education DBs";
  type = "curated" as const;

  isEnabled(): boolean {
    return true;
  }

  async scrape(_filters?: ScholarshipFilters): Promise<ScrapedScholarship[]> {
    const results: ScrapedScholarship[] = [];
    const seen = new Set<string>();

    // Try College Board BigFuture API
    const cbResults = await this.scrapeCollegeBoard();
    for (const s of cbResults) {
      const key = `${s.title}:${s.provider}`.toLowerCase();
      if (!seen.has(key)) { seen.add(key); results.push(s); }
    }

    // Try Peterson's scholarship data
    const petResults = await this.scrapePetersons();
    for (const s of petResults) {
      const key = `${s.title}:${s.provider}`.toLowerCase();
      if (!seen.has(key)) { seen.add(key); results.push(s); }
    }

    // Try IEFA international scholarships
    const iefaResults = await this.scrapeIEFA();
    for (const s of iefaResults) {
      const key = `${s.title}:${s.provider}`.toLowerCase();
      if (!seen.has(key)) { seen.add(key); results.push(s); }
    }

    console.info(`College Board & Education DBs: scraped ${results.length} unique scholarships`);
    return results;
  }

  private async scrapeCollegeBoard(): Promise<ScrapedScholarship[]> {
    const results: ScrapedScholarship[] = [];

    for (const query of SEARCH_QUERIES.slice(0, 15)) {
      try {
        const url = `https://bigfuture.collegeboard.org/api/scholarship-search?keyword=${encodeURIComponent(query.keyword)}&limit=25`;

        const response = await fetch(url, {
          headers: {
            "User-Agent": "GrantPilot/1.0 (education-scholarship-search)",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(12000),
        });

        if (response.ok) {
          const data = await response.json();
          const items: CBScholarship[] = Array.isArray(data)
            ? data
            : data.results || data.scholarships || data.data || [];

          for (const item of items) {
            const mapped = this.mapScholarship(item, query.field);
            if (mapped) results.push(mapped);
          }
        }
        await delay(600);
      } catch {
        // Non-blocking — continue to next query
      }
    }

    return results;
  }

  private async scrapePetersons(): Promise<ScrapedScholarship[]> {
    const results: ScrapedScholarship[] = [];

    try {
      const url = "https://www.petersons.com/api/v1/scholarships?sort=deadline&limit=100&status=open";
      const response = await fetch(url, {
        headers: {
          "User-Agent": "GrantPilot/1.0",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        const data = await response.json();
        const items: CBScholarship[] = Array.isArray(data) ? data : data.results || data.scholarships || [];
        for (const item of items) {
          const mapped = this.mapScholarship(item, "general");
          if (mapped) results.push(mapped);
        }
      }
    } catch {
      // Non-blocking
    }

    return results;
  }

  private async scrapeIEFA(): Promise<ScrapedScholarship[]> {
    const results: ScrapedScholarship[] = [];

    try {
      const url = "https://www.iefa.org/api/scholarships?country=us&limit=50";
      const response = await fetch(url, {
        headers: {
          "User-Agent": "GrantPilot/1.0",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        const data = await response.json();
        const items: CBScholarship[] = Array.isArray(data) ? data : data.results || data.scholarships || [];
        for (const item of items) {
          const mapped = this.mapScholarship(item, "general");
          if (mapped) {
            mapped.tags = [...(mapped.tags || []), "international"];
            results.push(mapped);
          }
        }
      }
    } catch {
      // Non-blocking
    }

    return results;
  }

  private mapScholarship(item: CBScholarship, field: string): ScrapedScholarship | null {
    const title = item.name || item.title;
    if (!title) return null;

    const amountStr = item.amount || (item.awardAmount ? `$${item.awardAmount.toLocaleString()}` : "");
    const amountNum = item.awardAmount || item.amountMax || parseAmountStr(amountStr);

    let deadline: Date | undefined;
    if (item.deadline) {
      const parsed = new Date(item.deadline);
      if (!isNaN(parsed.getTime())) deadline = parsed;
    }

    return {
      title,
      provider: item.sponsor || item.organization || "College Board",
      description: item.description || item.eligibility || `${title} scholarship`,
      amount: amountStr || undefined,
      amountMin: item.amountMin || amountNum,
      amountMax: amountNum,
      deadline,
      url: item.url,
      scholarshipType: item.type || "merit",
      renewable: item.renewable,
      minGPA: item.gpa,
      educationLevels: item.educationLevel,
      fieldsOfStudy: item.fieldsOfStudy || (field !== "general" ? [field] : undefined),
      stateRestriction: item.state,
      essayRequired: undefined,
      submissionMethod: "portal",
      tags: [field, "college-board"],
      sourceId: `cb-${slugify(title)}`,
      sourceUrl: item.url,
    };
  }
}

function parseAmountStr(str: string): number | undefined {
  if (!str) return undefined;
  const match = str.replace(/,/g, "").match(/(\d+)/);
  return match ? parseInt(match[1]) : undefined;
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80);
}
