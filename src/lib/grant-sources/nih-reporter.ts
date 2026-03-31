import { GrantSource, ScrapedGrant } from "./types";

interface NihProject {
  appl_id?: number;
  project_num?: string;
  project_title?: string;
  abstract_text?: string;
  fiscal_year?: number;
  award_amount?: number;
  is_active?: boolean;
  activity_code?: string;
  opportunity_number?: string;
  project_start_date?: string;
  project_end_date?: string;
  contact_pi_name?: string;
  organization?: {
    org_name?: string;
    org_city?: string;
    org_state?: string;
    org_country?: string;
  };
  agency_ic_admin?: {
    code?: string;
    abbreviation?: string;
    name?: string;
  };
  agency_code?: string;
  pref_terms?: string;
  project_detail_url?: string;
  funding_mechanism?: string;
  cfda_code?: string;
}

interface NihSearchResponse {
  meta?: {
    total?: number;
    offset?: number;
    limit?: number;
  };
  results?: NihProject[];
}

const API_BASE = "https://api.reporter.nih.gov/v2/projects/search";
const PAGE_SIZE = 500;
const MAX_PAGES = 6; // Cap at 3000 projects per run

// Activity codes that represent grant opportunities (not contracts/intramural)
const GRANT_ACTIVITY_CODES = [
  "R01", "R21", "R03", "R15", "R34", "R36",  // Research grants
  "K01", "K08", "K23", "K25", "K99",          // Career development
  "F31", "F32",                                 // Fellowships
  "P01", "P20", "P30", "P50",                  // Program/center grants
  "U01", "U19", "U24", "U54",                  // Cooperative agreements
  "T32", "T34",                                 // Training grants
  "DP1", "DP2",                                 // Director's awards
  "SB1",                                        // SBIR/STTR
];

export class NihReporterSource implements GrantSource {
  id = "nih_reporter";
  name = "NIH RePORTER";
  type = "federal" as const;

  isEnabled(): boolean {
    return true; // Free, no key needed
  }

  async scrape(): Promise<ScrapedGrant[]> {
    const seen = new Set<string>();
    const allGrants: ScrapedGrant[] = [];

    // Fetch active grants from current and next fiscal year
    const currentYear = new Date().getFullYear();
    const fiscalYears = [currentYear, currentYear + 1];

    for (const fy of fiscalYears) {
      let offset = 0;
      let total = Infinity;
      let pageCount = 0;

      while (offset < total && pageCount < MAX_PAGES) {
        try {
          const result = await this.fetchPage(fy, offset);
          if (!result) break;

          total = result.total;

          for (const grant of result.grants) {
            const dedupKey = grant.sourceId || grant.title;
            if (!seen.has(dedupKey)) {
              seen.add(dedupKey);
              allGrants.push(grant);
            }
          }

          offset += PAGE_SIZE;
          pageCount++;
          // Rate limit: ~200 req/min allowed, be conservative
          await new Promise((resolve) => setTimeout(resolve, 400));
        } catch (error) {
          console.error(`NIH RePORTER FY${fy} offset ${offset} failed:`, error);
          break;
        }
      }
    }

    console.info(`NIH RePORTER: fetched ${allGrants.length} active grants`);
    return allGrants;
  }

  private async fetchPage(
    fiscalYear: number,
    offset: number
  ): Promise<{ grants: ScrapedGrant[]; total: number } | null> {
    const body = {
      criteria: {
        fiscal_years: [fiscalYear],
        is_active: true,
        activity_codes: GRANT_ACTIVITY_CODES,
      },
      offset,
      limit: PAGE_SIZE,
      sort_field: "award_amount",
      sort_order: "desc",
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`NIH RePORTER API error: ${response.status}`);
        return null;
      }

      const data: NihSearchResponse = await response.json();
      const projects = data.results || [];
      const total = data.meta?.total || 0;

      return {
        grants: projects.map((p) => this.mapToScrapedGrant(p)),
        total,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        console.error("NIH RePORTER API request timed out");
      }
      throw error;
    }
  }

  private mapToScrapedGrant(project: NihProject): ScrapedGrant {
    const title = project.project_title || "Untitled NIH Project";
    const institute = project.agency_ic_admin;
    const agencyName = institute?.name || "National Institutes of Health";

    const amount = project.award_amount || null;
    const endDate = project.project_end_date
      ? project.project_end_date.split("T")[0]
      : null;

    const orgState = project.organization?.org_state || "ALL";

    // Build tags from activity code, institute, terms
    const tags: string[] = [];
    if (project.activity_code) tags.push(project.activity_code);
    if (institute?.abbreviation) tags.push(institute.abbreviation);
    if (project.funding_mechanism) tags.push(project.funding_mechanism);
    if (project.cfda_code) tags.push(project.cfda_code);
    // Add top terms (semicolon-delimited)
    if (project.pref_terms) {
      const terms = project.pref_terms.split(";").slice(0, 5);
      tags.push(...terms.map((t) => t.trim()).filter(Boolean));
    }

    const detailUrl =
      project.project_detail_url ||
      (project.appl_id
        ? `https://reporter.nih.gov/project-details/${project.appl_id}`
        : "https://reporter.nih.gov");

    // Category from funding mechanism or activity code
    const category =
      project.funding_mechanism ||
      project.activity_code ||
      "";

    // Eligibility hint from activity code
    const eligibility = this.getEligibilityHint(project.activity_code);

    return {
      title,
      funder: agencyName,
      description: (project.abstract_text || "").slice(0, 3000),
      amount: amount ? `Up to $${amount.toLocaleString()}` : "",
      amountMin: null,
      amountMax: amount,
      deadline: endDate,
      url: detailUrl,
      type: "federal",
      category,
      eligibility,
      state: orgState,
      tags,
      source: "nih_reporter",
      agencyName,
      sourceId: project.appl_id ? String(project.appl_id) : project.project_num || null,
      sourceUrl: detailUrl,
      nofoUrl: project.opportunity_number
        ? `https://grants.nih.gov/grants/guide/search_results.htm?text_curr=${project.opportunity_number}`
        : null,
    };
  }

  private getEligibilityHint(activityCode?: string): string {
    if (!activityCode) return "";
    if (activityCode.startsWith("R")) return "Research institutions, universities, nonprofits, small businesses";
    if (activityCode.startsWith("K")) return "Early-career investigators at research institutions";
    if (activityCode.startsWith("F")) return "Individual pre/postdoctoral fellows";
    if (activityCode.startsWith("T")) return "Research training programs at institutions";
    if (activityCode.startsWith("P")) return "Multi-project research programs at institutions";
    if (activityCode.startsWith("U")) return "Research institutions via cooperative agreements";
    if (activityCode.startsWith("SB")) return "U.S. small businesses (SBIR/STTR)";
    if (activityCode.startsWith("DP")) return "Exceptional researchers (NIH Director's awards)";
    return "";
  }
}
