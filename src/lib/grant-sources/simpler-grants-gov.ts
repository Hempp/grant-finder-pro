import { GrantSource, ScrapedGrant } from "./types";

interface SimplerOpportunitySummary {
  summary_description?: string | null;
  post_date?: string | null;
  close_date?: string | null;
  close_date_description?: string | null;
  award_ceiling?: number | null;
  award_floor?: number | null;
  estimated_total_program_funding?: number | null;
  expected_number_of_awards?: number | null;
  funding_instruments?: string[];
  funding_categories?: string[];
  applicant_types?: string[];
  is_cost_sharing?: boolean | null;
  is_forecast?: boolean;
  agency_email_address?: string | null;
  agency_contact_description?: string | null;
  additional_info_url?: string | null;
}

interface SimplerOpportunity {
  opportunity_id: string;
  legacy_opportunity_id?: number | null;
  opportunity_number?: string | null;
  opportunity_title?: string | null;
  opportunity_status?: string;
  agency_code?: string | null;
  agency_name?: string | null;
  top_level_agency_code?: string | null;
  top_level_agency_name?: string | null;
  category?: string | null;
  category_explanation?: string | null;
  opportunity_assistance_listings?: Array<{
    assistance_listing_number?: string;
    program_title?: string;
  }>;
  summary?: SimplerOpportunitySummary;
}

interface SimplerSearchResponse {
  status_code?: number;
  message?: string;
  pagination_info?: {
    page_offset: number;
    page_size: number;
    total_pages: number;
    total_records: number;
  };
  data?: SimplerOpportunity[];
}

const API_BASE = "https://api.simpler.grants.gov";
const PAGE_SIZE = 100;
const MAX_PAGES = 20; // Cap at 2000 opportunities per run

export class SimplerGrantsGovSource implements GrantSource {
  id = "simpler_grants_gov";
  name = "Simpler.Grants.gov";
  type = "federal" as const;

  isEnabled(): boolean {
    return !!process.env.SIMPLER_GRANTS_GOV_API_KEY;
  }

  async scrape(): Promise<ScrapedGrant[]> {
    const apiKey = process.env.SIMPLER_GRANTS_GOV_API_KEY;
    if (!apiKey) {
      console.info("SIMPLER_GRANTS_GOV_API_KEY not configured, skipping");
      return [];
    }

    const allGrants: ScrapedGrant[] = [];
    const seen = new Set<string>();

    // Fetch posted opportunities with pagination
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages && page <= MAX_PAGES) {
      try {
        const result = await this.fetchPage(apiKey, page, "posted");
        if (!result) break;

        totalPages = result.totalPages;

        for (const grant of result.grants) {
          const dedupKey = grant.sourceId || grant.title;
          if (!seen.has(dedupKey)) {
            seen.add(dedupKey);
            allGrants.push(grant);
          }
        }

        page++;
        // Rate limiting — conservative since no documented limits
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Simpler.Grants.gov page ${page} failed:`, error);
        break;
      }
    }

    // Also grab forecasted opportunities (upcoming)
    try {
      const forecasted = await this.fetchPage(apiKey, 1, "forecasted");
      if (forecasted) {
        for (const grant of forecasted.grants) {
          const dedupKey = grant.sourceId || grant.title;
          if (!seen.has(dedupKey)) {
            seen.add(dedupKey);
            allGrants.push(grant);
          }
        }
      }
    } catch (error) {
      console.error("Simpler.Grants.gov forecasted fetch failed:", error);
    }

    console.info(`Simpler.Grants.gov: fetched ${allGrants.length} opportunities`);
    return allGrants;
  }

  private async fetchPage(
    apiKey: string,
    page: number,
    status: "posted" | "forecasted"
  ): Promise<{ grants: ScrapedGrant[]; totalPages: number } | null> {
    const body = {
      filters: {
        opportunity_status: { one_of: [status] },
      },
      pagination: {
        page_offset: page,
        page_size: PAGE_SIZE,
        sort_order: [
          { order_by: "post_date", sort_direction: "descending" },
        ],
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${API_BASE}/v1/opportunities/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(
          `Simpler.Grants.gov API error: ${response.status} ${response.statusText}`
        );
        return null;
      }

      const data: SimplerSearchResponse = await response.json();
      const opportunities = data.data || [];
      const totalPages = data.pagination_info?.total_pages || 1;

      return {
        grants: opportunities.map((opp) => this.mapToScrapedGrant(opp)),
        totalPages,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        console.error("Simpler.Grants.gov API request timed out");
      }
      throw error;
    }
  }

  private mapToScrapedGrant(opp: SimplerOpportunity): ScrapedGrant {
    const title = opp.opportunity_title || "Untitled Opportunity";
    const summary = opp.summary;

    const agencyName =
      opp.agency_name ||
      opp.top_level_agency_name ||
      "Federal Government";

    const description = summary?.summary_description || "";
    const awardCeiling = summary?.award_ceiling || null;
    const awardFloor = summary?.award_floor || null;
    const closeDate = summary?.close_date || null;

    // Build detail URL — use legacy ID for grants.gov link, or new ID
    const legacyId = opp.legacy_opportunity_id;
    const detailUrl = legacyId
      ? `https://www.grants.gov/search-results-detail/${legacyId}`
      : `https://simpler.grants.gov/opportunity/${opp.opportunity_id}`;

    // Collect tags from funding categories, instruments, and assistance listings
    const tags: string[] = [];
    if (opp.agency_code) tags.push(opp.agency_code);
    if (opp.top_level_agency_code) tags.push(opp.top_level_agency_code);
    if (summary?.funding_categories) tags.push(...summary.funding_categories);
    if (summary?.funding_instruments) tags.push(...summary.funding_instruments);
    if (opp.opportunity_assistance_listings) {
      for (const listing of opp.opportunity_assistance_listings) {
        if (listing.assistance_listing_number) {
          tags.push(listing.assistance_listing_number);
        }
      }
    }

    // Build eligibility string from applicant types
    const eligibility = summary?.applicant_types
      ? summary.applicant_types
          .map((t) => t.replace(/_/g, " "))
          .join(", ")
      : "";

    // Category from funding categories or opportunity category
    const category = summary?.funding_categories?.length
      ? summary.funding_categories.map((c) => c.replace(/_/g, " ")).join(", ")
      : opp.category || "";

    const nofoUrl = summary?.additional_info_url || null;

    return {
      title,
      funder: agencyName,
      description: description.slice(0, 5000),
      amount: awardCeiling ? `Up to $${awardCeiling.toLocaleString()}` : "",
      amountMin: awardFloor,
      amountMax: awardCeiling,
      deadline: closeDate,
      url: detailUrl,
      type: "federal",
      category,
      eligibility,
      state: "ALL",
      tags,
      source: "simpler.grants.gov",
      agencyName,
      sourceId: opp.opportunity_id,
      sourceUrl: detailUrl,
      nofoUrl,
    };
  }
}
