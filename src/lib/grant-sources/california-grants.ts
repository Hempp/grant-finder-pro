import { GrantSource, ScrapedGrant } from "./types";

interface CaliforniaGrantResponse {
  title?: string;
  description?: string;
  grantorName?: string;
  fundingAmount?: string;
  matchingFundsRequired?: string | boolean;
  applicationDeadline?: string;
  grantUrl?: string;
  categories?: string[];
  eligibility?: string;
  status?: string;
  id?: string | number;
  fundingSource?: string;
  estimatedAvailableFunds?: string;
  estimatedAwards?: string;
  loiRequired?: boolean;
}

export class CaliforniaGrantsSource implements GrantSource {
  id = "california_grants";
  name = "California Grants Portal";
  type = "state" as const;

  isEnabled(): boolean {
    return true;
  }

  async scrape(): Promise<ScrapedGrant[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch("https://www.grants.ca.gov/api/grants", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error("California Grants API error:", response.status);
        return [];
      }

      const data = await response.json();

      // The API may return an array directly or wrap it in a property
      const grants: CaliforniaGrantResponse[] = Array.isArray(data)
        ? data
        : data?.grants || data?.data || [];

      if (!Array.isArray(grants)) {
        console.error("California Grants API: unexpected response format");
        return [];
      }

      const now = new Date();

      return grants
        .filter((grant) => {
          // Keep grants that are open or have no past deadline
          const status = (grant.status || "").toLowerCase();
          if (status === "closed" || status === "inactive") {
            return false;
          }
          if (status === "open" || status === "active") {
            return true;
          }
          // If no explicit open/closed status, check deadline
          if (grant.applicationDeadline) {
            const deadline = new Date(grant.applicationDeadline);
            if (!isNaN(deadline.getTime()) && deadline < now) {
              return false;
            }
          }
          // Include grants with unknown status or no deadline
          return true;
        })
        .map((grant) => this.mapToScrapedGrant(grant));
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.error("California Grants API request timed out");
      } else {
        console.error("California Grants API scrape failed:", error);
      }
      return [];
    }
  }

  private mapToScrapedGrant(grant: CaliforniaGrantResponse): ScrapedGrant {
    const title = grant.title || "Untitled California Grant";
    const funder = grant.grantorName || "State of California";
    const description = grant.description || "";
    const category =
      grant.categories && grant.categories.length > 0
        ? grant.categories.join(", ")
        : "";
    const eligibility = grant.eligibility || "";
    const deadline = grant.applicationDeadline || null;
    const url = grant.grantUrl || "https://www.grants.ca.gov";
    const sourceId = grant.id ? String(grant.id) : null;

    const amount = this.parseAmount(grant.fundingAmount, grant.estimatedAvailableFunds);

    return {
      title,
      funder,
      description,
      amount: amount.display,
      amountMin: amount.min,
      amountMax: amount.max,
      deadline,
      url,
      type: "state",
      category,
      eligibility,
      state: "CA",
      tags: [
        ...(grant.categories || []),
        grant.matchingFundsRequired ? "matching-funds-required" : null,
      ].filter(Boolean) as string[],
      source: "grants.ca.gov",
      agencyName: funder,
      sourceId,
      sourceUrl: url,
      nofoUrl: url !== "https://www.grants.ca.gov" ? url : null,
    };
  }

  private parseAmount(
    fundingAmount?: string,
    estimatedFunds?: string
  ): { display: string; min: number | null; max: number | null } {
    const raw = fundingAmount || estimatedFunds || "";
    if (!raw) {
      return { display: "", min: null, max: null };
    }

    // Try to extract numeric values
    const numbers = raw.match(/[\d,]+\.?\d*/g);
    if (!numbers || numbers.length === 0) {
      return { display: raw, min: null, max: null };
    }

    const parsed = numbers.map((n) => parseFloat(n.replace(/,/g, "")));

    if (parsed.length === 1) {
      return {
        display: `Up to $${parsed[0].toLocaleString()}`,
        min: null,
        max: parsed[0],
      };
    }

    const min = Math.min(...parsed);
    const max = Math.max(...parsed);
    return {
      display: `$${min.toLocaleString()} - $${max.toLocaleString()}`,
      min,
      max,
    };
  }
}
