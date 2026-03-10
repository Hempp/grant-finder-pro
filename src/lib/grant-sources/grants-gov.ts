import { GrantSource, ScrapedGrant } from "./types";

interface GrantsGovOpportunity {
  id: string;
  number: string;
  title: string;
  agency?: string | { name: string; code: string };
  category?: { name: string };
  awardCeiling?: number;
  awardFloor?: number;
  closeDate?: string;
  openDate?: string;
  description?: string;
  eligibility?: { applicant?: { types?: string[] } };
  fundingInstrument?: { name: string };
  summary?: { synopsis?: string };
  oppNumber?: string;
  oppTitle?: string;
  agencyName?: string;
  agencyCode?: string;
  oppStatus?: string;
  synopsis?: string;
  openingDate?: string;
  closingDate?: string;
  cfda?: string;
  cfdaNumber?: string;
  estimatedFunding?: number;
  awardCeilingFormatted?: string;
  awardFloorFormatted?: string;
  eligibilities?: string[];
  fundingInstrumentDescription?: string;
  categoryDescription?: string;
}

interface GrantsGovSearchResponse {
  errorcode?: string;
  msg?: string;
  token?: string;
  data?: {
    hitCount?: number;
    oppHits?: GrantsGovOpportunity[];
    searchParams?: Record<string, unknown>;
  };
  oppHits?: GrantsGovOpportunity[];
  totalRecords?: number;
}

const SEARCH_KEYWORDS = [
  // General
  "small business",
  "innovation",
  "research",
  "technology",
  "startup",
  "grant",
  "cooperative agreement",
  // AI & Tech
  "artificial intelligence",
  "machine learning",
  "deep learning",
  "robotics",
  "computer vision",
  "cybersecurity",
  "data science",
  // Healthcare
  "healthcare",
  "biomedical",
  "medical device",
  "clinical research",
  "public health",
  "mental health",
  // Climate & Energy
  "climate change",
  "clean energy",
  "renewable energy",
  "sustainability",
  "environmental",
  "electric vehicle",
  // Education & Workforce
  "STEM education",
  "workforce development",
  "education technology",
  "apprenticeship",
  // Community & Social
  "community development",
  "affordable housing",
  "food security",
  "rural development",
  "minority business",
  // Agriculture
  "agriculture",
  "farming",
  // Infrastructure
  "infrastructure",
  "broadband",
  "transportation",
  // SBIR/STTR
  "SBIR",
  "STTR",
  "Small Business Innovation Research",
];

export class GrantsGovSource implements GrantSource {
  id = "grants_gov";
  name = "Grants.gov";
  type = "federal" as const;

  isEnabled(): boolean {
    return true;
  }

  async scrape(): Promise<ScrapedGrant[]> {
    const seen = new Set<string>();
    const allGrants: ScrapedGrant[] = [];

    for (const keyword of SEARCH_KEYWORDS) {
      try {
        const grants = await this.searchKeyword(keyword);
        for (const grant of grants) {
          const dedupKey = grant.sourceId || grant.title;
          if (!seen.has(dedupKey)) {
            seen.add(dedupKey);
            allGrants.push(grant);
          }
        }
        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Grants.gov search failed for keyword "${keyword}":`, error);
      }
    }

    return allGrants;
  }

  private async searchKeyword(keyword: string): Promise<ScrapedGrant[]> {
    const searchBody: Record<string, unknown> = {
      rows: 50,
      keyword,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch("https://api.grants.gov/v1/api/search2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(searchBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error("Grants.gov API error:", response.status);
        return [];
      }

      const responseData: GrantsGovSearchResponse = await response.json();
      const allOpportunities = responseData.data?.oppHits || responseData.oppHits || [];

      // Filter for only "posted" (open) opportunities
      const opportunities = allOpportunities.filter(
        (opp) => (opp.oppStatus || "").toLowerCase() === "posted"
      );

      return opportunities.map((opp) => this.mapToScrapedGrant(opp));
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        console.error("Grants.gov API request timed out");
      }
      throw error;
    }
  }

  private mapToScrapedGrant(opp: GrantsGovOpportunity): ScrapedGrant {
    const title = opp.oppTitle || opp.title || "Untitled Opportunity";

    let agencyName = "Federal Government";
    if (typeof opp.agency === "string") {
      agencyName = opp.agency;
    } else if (opp.agency?.name) {
      agencyName = opp.agency.name;
    } else if (opp.agencyName) {
      agencyName = opp.agencyName;
    }

    const description =
      opp.synopsis || opp.summary?.synopsis || opp.description || "";

    const awardCeiling =
      opp.awardCeiling ||
      (opp.awardCeilingFormatted
        ? parseFloat(opp.awardCeilingFormatted.replace(/[^0-9.]/g, ""))
        : null);
    const awardFloor =
      opp.awardFloor ||
      (opp.awardFloorFormatted
        ? parseFloat(opp.awardFloorFormatted.replace(/[^0-9.]/g, ""))
        : null);

    const closeDate = opp.closingDate || opp.closeDate || null;
    const oppId = opp.id || opp.oppNumber || opp.number;

    const category =
      opp.categoryDescription ||
      (typeof opp.category === "object" ? opp.category?.name : null) ||
      opp.fundingInstrumentDescription ||
      opp.fundingInstrument?.name ||
      "";

    const eligibility =
      opp.eligibilities?.join(", ") ||
      opp.eligibility?.applicant?.types?.join(", ") ||
      "";

    const agencyCode =
      opp.agencyCode ||
      (typeof opp.agency === "object" ? opp.agency?.code : null);

    const tags = [agencyCode, category, opp.cfdaNumber || opp.cfda].filter(
      Boolean
    ) as string[];

    return {
      title,
      funder: agencyName,
      description,
      amount: awardCeiling ? `Up to $${awardCeiling.toLocaleString()}` : "",
      amountMin: awardFloor || null,
      amountMax: awardCeiling || null,
      deadline: closeDate,
      url: `https://www.grants.gov/search-results-detail/${oppId}`,
      type: "federal",
      category,
      eligibility,
      state: "ALL",
      tags,
      source: "grants.gov",
      agencyName,
      sourceId: oppId || null,
      sourceUrl: `https://www.grants.gov/search-results-detail/${oppId}`,
      nofoUrl: oppId
        ? `https://www.grants.gov/search-results-detail/${oppId}`
        : null,
    };
  }
}
