import { GrantSource, ScrapedGrant } from "./types";

interface SbirTopic {
  topic_title?: string;
  branch?: string;
  topic_number?: string;
  topic_description?: string;
  sbir_topic_link?: string;
  subtopics?: Array<{
    subtopic_title?: string;
    subtopic_number?: string;
    subtopic_description?: string;
  }>;
}

interface SbirSolicitation {
  solicitation_title?: string;
  solicitation_number?: string;
  program?: string; // "SBIR" or "STTR"
  phase?: string;   // "Phase I", "Phase II", etc.
  agency?: string;
  branch?: string;
  solicitation_year?: string;
  release_date?: string;
  open_date?: string;
  close_date?: string;
  application_due_date?: string;
  current_status?: string;
  solicitation_agency_url?: string;
  solicitation_topics?: SbirTopic[];
}

const API_BASE = "https://api.www.sbir.gov/public/api/solicitations";
const MAX_ROWS = 50; // API max per request

// Known SBIR/STTR participating agencies
const AGENCIES = [
  "DOD", "HHS", "NASA", "NSF", "DOE",
  "USDA", "EPA", "DOC", "ED", "DOT", "DHS",
];

export class SbirGovSource implements GrantSource {
  id = "sbir_gov";
  name = "SBIR.gov";
  type = "federal" as const;

  isEnabled(): boolean {
    return true; // Free, no key needed
  }

  async scrape(): Promise<ScrapedGrant[]> {
    const seen = new Set<string>();
    const allGrants: ScrapedGrant[] = [];

    // First: fetch all open solicitations across all agencies
    let start = 0;
    let hasMore = true;

    while (hasMore) {
      try {
        const solicitations = await this.fetchOpenSolicitations(start);
        if (solicitations.length === 0) {
          hasMore = false;
          break;
        }

        for (const sol of solicitations) {
          const grants = this.mapSolicitationToGrants(sol);
          for (const grant of grants) {
            const dedupKey = grant.sourceId || grant.title;
            if (!seen.has(dedupKey)) {
              seen.add(dedupKey);
              allGrants.push(grant);
            }
          }
        }

        start += MAX_ROWS;
        if (solicitations.length < MAX_ROWS) hasMore = false;

        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`SBIR.gov fetch at offset ${start} failed:`, error);
        break;
      }
    }

    // Second pass: per-agency search for any stragglers
    for (const agency of AGENCIES) {
      try {
        const solicitations = await this.fetchByAgency(agency);
        for (const sol of solicitations) {
          const grants = this.mapSolicitationToGrants(sol);
          for (const grant of grants) {
            const dedupKey = grant.sourceId || grant.title;
            if (!seen.has(dedupKey)) {
              seen.add(dedupKey);
              allGrants.push(grant);
            }
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`SBIR.gov agency search failed for ${agency}:`, error);
      }
    }

    console.info(`SBIR.gov: fetched ${allGrants.length} open solicitation topics`);
    return allGrants;
  }

  private async fetchOpenSolicitations(start: number): Promise<SbirSolicitation[]> {
    const params = new URLSearchParams({
      open: "1",
      rows: String(MAX_ROWS),
      start: String(start),
      format: "json",
    });

    return this.fetchSolicitations(params);
  }

  private async fetchByAgency(agency: string): Promise<SbirSolicitation[]> {
    const params = new URLSearchParams({
      open: "1",
      agency,
      rows: String(MAX_ROWS),
      format: "json",
    });

    return this.fetchSolicitations(params);
  }

  private async fetchSolicitations(params: URLSearchParams): Promise<SbirSolicitation[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${API_BASE}?${params.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`SBIR.gov API error: ${response.status}`);
        return [];
      }

      const text = await response.text();
      if (!text.trim()) return [];

      // API may return array directly or wrapped object
      const data = JSON.parse(text);
      if (Array.isArray(data)) return data;
      if (data.solicitations) return data.solicitations;
      return [];
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        console.error("SBIR.gov API request timed out");
      }
      throw error;
    }
  }

  /**
   * Each solicitation may contain multiple topics.
   * We create one ScrapedGrant per topic for granularity,
   * falling back to the solicitation itself if no topics.
   */
  private mapSolicitationToGrants(sol: SbirSolicitation): ScrapedGrant[] {
    const topics = sol.solicitation_topics;

    if (!topics || topics.length === 0) {
      return [this.mapSolicitationOnly(sol)];
    }

    return topics.map((topic) => this.mapTopicToGrant(sol, topic));
  }

  private mapTopicToGrant(sol: SbirSolicitation, topic: SbirTopic): ScrapedGrant {
    const program = sol.program || "SBIR";
    const phase = sol.phase || "";
    const agency = sol.agency || sol.branch || "Federal Government";
    const title = topic.topic_title
      ? `${program} ${phase}: ${topic.topic_title}`
      : sol.solicitation_title || `${program} ${phase} Solicitation`;

    const description = topic.topic_description || "";
    const deadline = sol.application_due_date || sol.close_date || null;

    const url = topic.sbir_topic_link || sol.solicitation_agency_url || "https://www.sbir.gov";

    const { amountMin, amountMax, amountStr } = this.getPhaseAmounts(phase, program);

    const tags: string[] = [program, phase, agency].filter(Boolean);
    if (topic.topic_number) tags.push(topic.topic_number);
    if (sol.solicitation_number) tags.push(sol.solicitation_number);

    // Include subtopic titles as additional tags
    if (topic.subtopics) {
      for (const sub of topic.subtopics.slice(0, 3)) {
        if (sub.subtopic_title) tags.push(sub.subtopic_title);
      }
    }

    return {
      title,
      funder: agency,
      description: description.slice(0, 3000),
      amount: amountStr,
      amountMin,
      amountMax,
      deadline,
      url,
      type: "federal",
      category: `${program} ${phase}`.trim(),
      eligibility: "U.S. small businesses with fewer than 500 employees",
      state: "ALL",
      tags,
      source: "sbir.gov",
      agencyName: agency,
      sourceId: topic.topic_number || sol.solicitation_number || null,
      sourceUrl: url,
      nofoUrl: sol.solicitation_agency_url || null,
    };
  }

  private mapSolicitationOnly(sol: SbirSolicitation): ScrapedGrant {
    const program = sol.program || "SBIR";
    const phase = sol.phase || "";
    const agency = sol.agency || sol.branch || "Federal Government";
    const title = sol.solicitation_title || `${program} ${phase} Solicitation`;
    const deadline = sol.application_due_date || sol.close_date || null;
    const url = sol.solicitation_agency_url || "https://www.sbir.gov";

    const { amountMin, amountMax, amountStr } = this.getPhaseAmounts(phase, program);

    return {
      title,
      funder: agency,
      description: `${program} ${phase} solicitation from ${agency}. Year: ${sol.solicitation_year || "N/A"}.`,
      amount: amountStr,
      amountMin,
      amountMax,
      deadline,
      url,
      type: "federal",
      category: `${program} ${phase}`.trim(),
      eligibility: "U.S. small businesses with fewer than 500 employees",
      state: "ALL",
      tags: [program, phase, agency, sol.solicitation_number].filter(Boolean) as string[],
      source: "sbir.gov",
      agencyName: agency,
      sourceId: sol.solicitation_number || null,
      sourceUrl: url,
      nofoUrl: sol.solicitation_agency_url || null,
    };
  }

  /** Typical award ranges by phase */
  private getPhaseAmounts(phase: string, program: string): {
    amountMin: number | null;
    amountMax: number | null;
    amountStr: string;
  } {
    const p = (phase || "").toLowerCase();
    if (p.includes("i") && !p.includes("ii")) {
      return { amountMin: 50000, amountMax: 275000, amountStr: "$50,000 - $275,000" };
    }
    if (p.includes("ii")) {
      return { amountMin: 400000, amountMax: 1750000, amountStr: "$400,000 - $1,750,000" };
    }
    if (p.includes("iii")) {
      return { amountMin: null, amountMax: null, amountStr: "Varies (commercialization)" };
    }
    // Default SBIR range
    return { amountMin: 50000, amountMax: 1750000, amountStr: "$50,000 - $1,750,000" };
  }
}
