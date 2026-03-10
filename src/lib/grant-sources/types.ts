export interface ScrapedGrant {
  title: string;
  funder: string;
  description: string;
  amount: string;
  amountMin: number | null;
  amountMax: number | null;
  deadline: string | null;
  url: string;
  type: "federal" | "state" | "foundation" | "corporate";
  category: string;
  eligibility: string;
  state: string;
  tags: string[];
  source: string;
  agencyName: string;
  sourceId: string | null;
  sourceUrl: string | null;
  nofoUrl: string | null;
}

export interface GrantSource {
  id: string;
  name: string;
  type: "federal" | "state" | "foundation" | "corporate";
  scrape(): Promise<ScrapedGrant[]>;
  isEnabled(): boolean;
}
