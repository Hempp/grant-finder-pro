export type ContentCategory =
  | "company_overview"
  | "mission"
  | "team_bios"
  | "past_performance"
  | "technical_capabilities"
  | "financials"
  | "prior_grants"
  | "partnerships"
  | "dei_statement"
  | "impact_metrics"
  | "facilities"
  | "ip_patents"
  | "environmental"
  | "custom";

export type ContentSource = "profile" | "document" | "website" | "application" | "manual";

export const SOURCE_CONFIDENCE: Record<ContentSource, number> = {
  manual: 100,
  profile: 95,
  application: 90,
  document: 80,
  website: 70,
};

export const CATEGORY_LABELS: Record<ContentCategory, string> = {
  company_overview: "Company Overview",
  mission: "Mission & Vision",
  team_bios: "Team Bios",
  past_performance: "Past Performance",
  technical_capabilities: "Technical Capabilities",
  financials: "Financials",
  prior_grants: "Prior Grants",
  partnerships: "Partnerships",
  dei_statement: "DEI Statement",
  impact_metrics: "Impact Metrics",
  facilities: "Facilities & Equipment",
  ip_patents: "IP & Patents",
  environmental: "Environmental Impact",
  custom: "Custom",
};

export interface ContentBlockInput {
  category: ContentCategory;
  title: string;
  content: string;
  source: ContentSource;
  sourceRef?: string;
  confidence?: number;
}

export interface ContentBlockWithId extends ContentBlockInput {
  id: string;
  userId: string;
  lastVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExtractionResult {
  blocks: ContentBlockInput[];
  conflicts: Conflict[];
  sourceUrl?: string;
}

export interface Conflict {
  category: ContentCategory;
  existingTitle: string;
  existingContent: string;
  newContent: string;
  newSource: ContentSource;
  recommendation: "keep_existing" | "use_new" | "keep_both";
  reason: string;
}

export interface LibraryStats {
  total: number;
  byCategory: Record<string, number>;
  avgConfidence: number;
}
