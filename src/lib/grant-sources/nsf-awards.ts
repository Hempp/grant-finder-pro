import { GrantSource, ScrapedGrant } from "./types";

interface NsfAward {
  id?: string;
  title?: string;
  abstractText?: string;
  agency?: string;
  fundsObligatedAmt?: string;
  startDate?: string;
  expDate?: string;
  piFirstName?: string;
  piLastName?: string;
  awardeeCity?: string;
  awardeeStateCode?: string;
  awardeeName?: string;
  fundProgramName?: string;
  primaryProgram?: string;
  poName?: string;
  cfdaNumber?: string;
}

interface NsfSearchResponse {
  response?: {
    award?: NsfAward[];
  };
}

const NSF_PROGRAM_KEYWORDS = [
  "SBIR",
  "STTR",
  "Innovation",
  "Convergence",
  "CAREER",
  "Smart and Connected",
  "Civic Innovation",
];

const NSF_API_BASE = "https://api.nsf.gov/services/v1/awards.json";

export class NsfAwardsSource implements GrantSource {
  id = "nsf_awards";
  name = "NSF Awards";
  type = "federal" as const;

  isEnabled(): boolean {
    return true;
  }

  async scrape(): Promise<ScrapedGrant[]> {
    const seen = new Set<string>();
    const allGrants: ScrapedGrant[] = [];

    for (const keyword of NSF_PROGRAM_KEYWORDS) {
      try {
        const grants = await this.searchProgram(keyword);
        for (const grant of grants) {
          const dedupKey = grant.sourceId || grant.title;
          if (!seen.has(dedupKey)) {
            seen.add(dedupKey);
            allGrants.push(grant);
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`NSF Awards search failed for "${keyword}":`, error);
      }
    }

    return allGrants;
  }

  private async searchProgram(keyword: string): Promise<ScrapedGrant[]> {
    const params = new URLSearchParams({
      keyword,
      printFields:
        "id,title,abstractText,agency,fundsObligatedAmt,startDate,expDate,awardeeName,awardeeStateCode,fundProgramName,primaryProgram,cfdaNumber",
      dateStart: this.getDateMonthsAgo(12),
      dateEnd: this.getTodayDate(),
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${NSF_API_BASE}?${params.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error("NSF Awards API error:", response.status);
        return [];
      }

      const data: NsfSearchResponse = await response.json();
      const awards = data.response?.award || [];

      return awards
        .filter((award) => {
          // Only include awards with future expiration or recent start
          if (award.expDate) {
            const exp = this.parseNsfDate(award.expDate);
            if (exp && exp < new Date()) return false;
          }
          return true;
        })
        .slice(0, 25) // Cap per keyword to avoid overwhelming
        .map((award) => this.mapToScrapedGrant(award));
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        console.error("NSF Awards API request timed out");
      }
      throw error;
    }
  }

  private mapToScrapedGrant(award: NsfAward): ScrapedGrant {
    const title = award.title || "Untitled NSF Award";
    const funder = "National Science Foundation";
    const description = award.abstractText || "";

    const amount = award.fundsObligatedAmt
      ? parseFloat(award.fundsObligatedAmt)
      : null;

    const program =
      award.primaryProgram || award.fundProgramName || "";
    const state = award.awardeeStateCode || "ALL";

    return {
      title,
      funder,
      description: description.slice(0, 2000), // Cap long abstracts
      amount: amount ? `Up to $${amount.toLocaleString()}` : "",
      amountMin: null,
      amountMax: amount,
      deadline: award.expDate || null,
      url: award.id
        ? `https://www.nsf.gov/awardsearch/showAward?AWD_ID=${award.id}`
        : "https://www.nsf.gov/awardsearch/",
      type: "federal",
      category: program,
      eligibility: "",
      state,
      tags: [
        program,
        award.cfdaNumber,
        award.awardeeStateCode,
      ].filter(Boolean) as string[],
      source: "nsf_awards",
      agencyName: funder,
      sourceId: award.id || null,
      sourceUrl: award.id
        ? `https://www.nsf.gov/awardsearch/showAward?AWD_ID=${award.id}`
        : null,
      nofoUrl: null,
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

  private parseNsfDate(dateStr: string): Date | null {
    // NSF dates are MM/DD/YYYY
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    const d = new Date(
      parseInt(parts[2]),
      parseInt(parts[0]) - 1,
      parseInt(parts[1])
    );
    return isNaN(d.getTime()) ? null : d;
  }
}
