import { GrantSource, ScrapedGrant } from "./types";

interface SamGovOpportunity {
  noticeId?: string;
  title?: string;
  description?: string;
  department?: string;
  subtier?: string;
  office?: string;
  type?: string;
  baseType?: string;
  archiveType?: string;
  archiveDate?: string;
  responseDeadLine?: string;
  postedDate?: string;
  award?: {
    amount?: number;
    awardee?: string;
  };
  naicsCode?: string;
  classificationCode?: string;
  pointOfContact?: Array<{
    fullName?: string;
    email?: string;
  }>;
  resourceLinks?: string[];
  uiLink?: string;
}

interface SamGovSearchResponse {
  totalRecords?: number;
  limit?: number;
  offset?: number;
  opportunitiesData?: SamGovOpportunity[];
}

const SEARCH_KEYWORDS = [
  "grant",
  "cooperative agreement",
  "funding opportunity",
];

const SAM_GOV_API_BASE =
  "https://api.sam.gov/opportunities/v2/search";

export class SamGovSource implements GrantSource {
  id = "sam_gov";
  name = "SAM.gov";
  type = "federal" as const;

  isEnabled(): boolean {
    return !!process.env.SAM_GOV_API_KEY;
  }

  async scrape(): Promise<ScrapedGrant[]> {
    const apiKey = process.env.SAM_GOV_API_KEY;
    if (!apiKey) {
      console.warn("SAM.gov API key not configured, skipping");
      return [];
    }

    const seen = new Set<string>();
    const allGrants: ScrapedGrant[] = [];

    for (const keyword of SEARCH_KEYWORDS) {
      try {
        const grants = await this.searchKeyword(keyword, apiKey);
        for (const grant of grants) {
          const dedupKey = grant.sourceId || grant.title;
          if (!seen.has(dedupKey)) {
            seen.add(dedupKey);
            allGrants.push(grant);
          }
        }
        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(
          `SAM.gov search failed for keyword "${keyword}":`,
          error
        );
      }
    }

    return allGrants;
  }

  private async searchKeyword(
    keyword: string,
    apiKey: string
  ): Promise<ScrapedGrant[]> {
    const params = new URLSearchParams({
      api_key: apiKey,
      q: keyword,
      limit: "100",
      postedFrom: this.getDateMonthsAgo(6),
      postedTo: this.getTodayDate(),
      ptype: "o", // opportunities only
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${SAM_GOV_API_BASE}?${params.toString()}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error("SAM.gov API error:", response.status);
        return [];
      }

      const data: SamGovSearchResponse = await response.json();
      const opportunities = data.opportunitiesData || [];

      return opportunities
        .filter((opp) => this.isGrantType(opp))
        .map((opp) => this.mapToScrapedGrant(opp));
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        console.error("SAM.gov API request timed out");
      }
      throw error;
    }
  }

  private isGrantType(opp: SamGovOpportunity): boolean {
    const grantTypes = ["g", "o"]; // grant, other (cooperative agreements)
    const type = (opp.type || opp.baseType || "").toLowerCase();
    return grantTypes.includes(type) || type.includes("grant");
  }

  private mapToScrapedGrant(opp: SamGovOpportunity): ScrapedGrant {
    const title = opp.title || "Untitled Opportunity";
    const agencyName =
      opp.department || opp.subtier || opp.office || "Federal Government";

    const awardAmount = opp.award?.amount || null;

    const tags = [
      opp.naicsCode,
      opp.classificationCode,
      opp.type || opp.baseType,
    ].filter(Boolean) as string[];

    const uiLink =
      opp.uiLink ||
      (opp.noticeId
        ? `https://sam.gov/opp/${opp.noticeId}/view`
        : "https://sam.gov");

    const nofoUrl =
      opp.resourceLinks && opp.resourceLinks.length > 0
        ? opp.resourceLinks[0]
        : null;

    return {
      title,
      funder: agencyName,
      description: opp.description || "",
      amount: awardAmount ? `Up to $${awardAmount.toLocaleString()}` : "",
      amountMin: null,
      amountMax: awardAmount,
      deadline: opp.responseDeadLine || null,
      url: uiLink,
      type: "federal",
      category: opp.classificationCode || "",
      eligibility: "",
      state: "ALL",
      tags,
      source: "sam.gov",
      agencyName,
      sourceId: opp.noticeId || null,
      sourceUrl: uiLink,
      nofoUrl,
    };
  }

  private getTodayDate(): string {
    const d = new Date();
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
  }

  private getDateMonthsAgo(months: number): string {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
  }
}
