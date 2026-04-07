export interface ScrapedScholarship {
  title: string;
  provider: string;
  description: string;
  amount?: string;
  amountMin?: number;
  amountMax?: number;
  deadline?: Date;
  url?: string;
  applicationUrl?: string;
  scholarshipType: string;
  renewable?: boolean;
  minGPA?: number;
  educationLevels?: string[];
  fieldsOfStudy?: string[];
  citizenshipRequired?: string;
  stateRestriction?: string;
  eligibilityText?: string;
  essayRequired?: boolean;
  essayPrompt?: string;
  essayWordLimit?: number;
  submissionMethod: string;
  portalUrl?: string;
  tags?: string[];
  sourceId?: string;
  sourceUrl?: string;
}

export interface ScholarshipSource {
  id: string;
  name: string;
  type: "federal" | "state" | "corporate" | "foundation" | "curated";
  isEnabled(): boolean;
  scrape(filters?: ScholarshipFilters): Promise<ScrapedScholarship[]>;
}

export interface ScholarshipFilters {
  educationLevel?: string;
  fieldOfStudy?: string;
  state?: string;
  minAmount?: number;
  keyword?: string;
}
