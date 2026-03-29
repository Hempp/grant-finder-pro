export interface ScoringCriterion {
  name: string;
  maxPoints: number;
  description: string;
  weight: number;
}

export interface RequiredSection {
  title: string;
  wordLimit?: number;
  instructions: string;
  required: boolean;
}

export interface CriterionScore {
  criterion: string;
  score: number;
  max: number;
  note: string;
}

export interface SectionDiff {
  before: string;
  after: string;
  why: string;
}

export interface Gap {
  field: string;
  reason: string;
  suggestion: string;
  impact: "high" | "medium" | "low";
}

export interface SectionDraft {
  id: string;
  title: string;
  content: string;
  score: number;
  maxScore: number;
  criteriaScores: CriterionScore[];
  diffs: SectionDiff[];
  sourcesUsed: string[];
  gaps: Gap[];
}

export interface SmartFillResult {
  score: number;
  maxScore: number;
  sections: SectionDraft[];
  gaps: Gap[];
  optimizationRounds: number;
}
