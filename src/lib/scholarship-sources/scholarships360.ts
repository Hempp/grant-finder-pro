/**
 * Scholarships360 Scraper
 *
 * Scrapes scholarship data from the Scholarships360 public search API.
 * This is a real web scraper that fetches live data.
 */

import type { ScholarshipSource, ScrapedScholarship, ScholarshipFilters } from "./types";

interface S360Result {
  title?: string;
  sponsor?: string;
  provider?: string;
  description?: string;
  amount?: string;
  award_amount?: string;
  deadline?: string;
  url?: string;
  link?: string;
  gpa?: number;
  min_gpa?: number;
  type?: string;
  category?: string;
  education_level?: string[];
  fields?: string[];
  state?: string;
  citizenship?: string;
  essay_required?: boolean;
  tags?: string[];
}

const SEARCH_CATEGORIES = [
  "stem",
  "nursing",
  "education",
  "business",
  "engineering",
  "computer-science",
  "arts",
  "medical",
  "law",
  "first-generation",
  "low-income",
  "minority",
  "women",
  "veterans",
  "community-service",
  "merit",
  "need-based",
  "essay",
  "no-essay",
  "high-school-seniors",
  "college-freshmen",
  "graduate",
];

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export class Scholarships360Source implements ScholarshipSource {
  id = "scholarships360";
  name = "Scholarships360";
  type = "curated" as const;

  isEnabled(): boolean {
    return true;
  }

  async scrape(_filters?: ScholarshipFilters): Promise<ScrapedScholarship[]> {
    const results: ScrapedScholarship[] = [];
    const seen = new Set<string>();

    for (const category of SEARCH_CATEGORIES) {
      try {
        const scholarships = await this.scrapeCategory(category);
        for (const s of scholarships) {
          const key = `${s.title}:${s.provider}`.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            results.push(s);
          }
        }
        await delay(800);
      } catch (error) {
        console.error(`Scholarships360 category ${category} failed:`, error);
      }
    }

    console.info(`Scholarships360: scraped ${results.length} unique scholarships`);
    return results;
  }

  private async scrapeCategory(category: string): Promise<ScrapedScholarship[]> {
    const url = `https://www.scholarships360.org/wp-json/wp/v2/scholarship?per_page=50&scholarship_category=${category}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "GrantPilot/1.0 (scholarship-aggregator)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      // Fallback: try the sitemap/search approach
      return this.scrapeFallback(category);
    }

    const data: S360Result[] = await response.json();
    return data.map((item) => this.mapToScholarship(item, category)).filter(Boolean) as ScrapedScholarship[];
  }

  private async scrapeFallback(category: string): Promise<ScrapedScholarship[]> {
    // Try the public search page API
    const url = `https://www.scholarships360.org/wp-json/scholarships360/v1/search?category=${category}&limit=50`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "GrantPilot/1.0 (scholarship-aggregator)",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) return [];

      const data = await response.json();
      const items: S360Result[] = Array.isArray(data) ? data : data.results || data.scholarships || [];
      return items.map((item) => this.mapToScholarship(item, category)).filter(Boolean) as ScrapedScholarship[];
    } catch {
      return [];
    }
  }

  private mapToScholarship(item: S360Result, category: string): ScrapedScholarship | null {
    const title = item.title;
    if (!title) return null;

    const amountStr = item.amount || item.award_amount || "";
    const amountNum = parseAmount(amountStr);

    const deadlineStr = item.deadline;
    let deadline: Date | undefined;
    if (deadlineStr) {
      const parsed = new Date(deadlineStr);
      if (!isNaN(parsed.getTime())) deadline = parsed;
    }

    return {
      title,
      provider: item.sponsor || item.provider || "Scholarships360",
      description: item.description || `${title} - ${category} scholarship`,
      amount: amountStr || undefined,
      amountMin: amountNum,
      amountMax: amountNum,
      deadline,
      url: item.url || item.link,
      scholarshipType: mapCategoryToType(category),
      minGPA: item.gpa || item.min_gpa,
      educationLevels: item.education_level || inferEducationLevels(category),
      fieldsOfStudy: item.fields || inferFieldsOfStudy(category),
      citizenshipRequired: item.citizenship,
      stateRestriction: item.state,
      essayRequired: item.essay_required ?? category === "essay",
      submissionMethod: "portal",
      tags: [category, ...(item.tags || [])],
      sourceId: `s360-${slugify(title)}`,
      sourceUrl: item.url || item.link,
    };
  }
}

function parseAmount(str: string): number | undefined {
  if (!str) return undefined;
  const match = str.replace(/,/g, "").match(/(\d+)/);
  return match ? parseInt(match[1]) : undefined;
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80);
}

function mapCategoryToType(category: string): string {
  if (["merit", "no-essay"].includes(category)) return "merit";
  if (["need-based", "low-income"].includes(category)) return "need-based";
  if (["essay"].includes(category)) return "essay";
  if (["minority", "women", "veterans", "first-generation"].includes(category)) return "demographic";
  if (["community-service"].includes(category)) return "community";
  return "merit";
}

function inferEducationLevels(category: string): string[] {
  if (category === "high-school-seniors") return ["high_school_sr"];
  if (category === "college-freshmen") return ["undergrad_fr"];
  if (category === "graduate") return ["masters", "phd"];
  return ["undergrad_fr", "undergrad_so", "undergrad_jr", "undergrad_sr"];
}

function inferFieldsOfStudy(category: string): string[] {
  const fieldMap: Record<string, string[]> = {
    stem: ["STEM"],
    nursing: ["Health Sciences"],
    education: ["Education"],
    business: ["Business"],
    engineering: ["Engineering"],
    "computer-science": ["STEM", "Computer Science"],
    arts: ["Arts & Humanities"],
    medical: ["Health Sciences"],
    law: ["Law"],
  };
  return fieldMap[category] || [];
}
