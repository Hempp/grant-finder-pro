export interface CriterionScore {
  criterion: string;
  maxPoints: number;
  predictedPoints: number;
  confidence: number;
  orgDataUsed: string[];
  gaps: string[];
  suggestion: string;
}

interface OrgProfile {
  name: string;
  type: string | null;
  mission: string | null;
  vision: string | null;
  problemStatement: string | null;
  solution: string | null;
  targetMarket: string | null;
  teamSize: string | null;
  founderBackground: string | null;
  annualRevenue: string | null;
  previousFunding: string | null;
}

interface ScoringCriterion {
  name: string;
  maxPoints: number;
  description: string;
}

type FieldMapping = {
  keywords: string[];
  fields: { key: keyof OrgProfile; weight: number; label: string }[];
  gapMessage: string;
  suggestion: string;
};

const CRITERION_MAPPINGS: FieldMapping[] = [
  {
    keywords: ["team", "personnel", "staff", "leadership", "management", "key personnel"],
    fields: [
      { key: "founderBackground", weight: 0.5, label: "Founder/Leadership Background" },
      { key: "teamSize", weight: 0.3, label: "Team Size" },
    ],
    gapMessage: "Team and personnel information is missing",
    suggestion: "Add detailed team bios, qualifications, and relevant experience to your profile.",
  },
  {
    keywords: ["mission", "purpose", "need", "statement of need", "problem"],
    fields: [
      { key: "mission", weight: 0.5, label: "Mission Statement" },
      { key: "problemStatement", weight: 0.4, label: "Problem Statement" },
    ],
    gapMessage: "Mission and problem statement are missing",
    suggestion: "Clearly articulate your organization's mission and the problem you're addressing.",
  },
  {
    keywords: ["approach", "method", "solution", "technical", "methodology", "strategy", "plan", "design"],
    fields: [
      { key: "solution", weight: 0.5, label: "Solution/Approach" },
      { key: "targetMarket", weight: 0.3, label: "Target Market/Population" },
    ],
    gapMessage: "Solution and approach details are missing",
    suggestion: "Describe your technical approach, methodology, and target population in your profile.",
  },
  {
    keywords: ["budget", "financial", "cost", "funding", "fiscal"],
    fields: [
      { key: "annualRevenue", weight: 0.5, label: "Annual Revenue" },
    ],
    gapMessage: "Financial information is missing",
    suggestion: "Add annual revenue and financial history to demonstrate fiscal responsibility.",
  },
  {
    keywords: ["experience", "track record", "past performance", "capability", "qualifications", "capacity"],
    fields: [
      { key: "previousFunding", weight: 0.5, label: "Previous Funding" },
      { key: "founderBackground", weight: 0.3, label: "Founder/Leadership Background" },
    ],
    gapMessage: "Track record and experience information is missing",
    suggestion: "Document past grants, awards, and relevant organizational achievements.",
  },
  {
    keywords: ["impact", "outcome", "evaluation", "results", "measurable", "goals"],
    fields: [
      { key: "vision", weight: 0.4, label: "Vision" },
      { key: "targetMarket", weight: 0.3, label: "Target Market/Population" },
    ],
    gapMessage: "Impact and outcome information is missing",
    suggestion: "Define measurable outcomes, evaluation methods, and your vision for impact.",
  },
  {
    keywords: ["innovation", "novel", "unique", "creative", "new", "cutting-edge"],
    fields: [
      { key: "solution", weight: 0.5, label: "Solution/Approach" },
    ],
    gapMessage: "Innovation details are missing",
    suggestion: "Highlight what makes your approach unique and innovative compared to existing solutions.",
  },
];

function findMapping(criterionName: string, description: string): FieldMapping | null {
  const searchText = `${criterionName} ${description}`.toLowerCase();

  for (const mapping of CRITERION_MAPPINGS) {
    if (mapping.keywords.some((kw) => searchText.includes(kw))) {
      return mapping;
    }
  }
  return null;
}

export function calculatePredictedScores(
  criteria: ScoringCriterion[],
  org: OrgProfile
): { scores: CriterionScore[]; totalPredicted: number; totalMax: number } {
  const scores: CriterionScore[] = criteria.map((criterion) => {
    const mapping = findMapping(criterion.name, criterion.description);

    if (!mapping) {
      // No mapping found — give a baseline score
      return {
        criterion: criterion.name,
        maxPoints: criterion.maxPoints,
        predictedPoints: Math.round(criterion.maxPoints * 0.3),
        confidence: 20,
        orgDataUsed: [],
        gaps: ["No matching profile data found for this criterion"],
        suggestion: "Review the criterion requirements and update your profile with relevant information.",
      };
    }

    const orgDataUsed: string[] = [];
    const gaps: string[] = [];
    let coverage = 0;

    for (const field of mapping.fields) {
      const value = org[field.key];
      if (value && value.trim().length > 0) {
        orgDataUsed.push(field.label);
        coverage += field.weight;
      } else {
        gaps.push(`Missing: ${field.label}`);
      }
    }

    // Cap coverage at 1.0
    coverage = Math.min(coverage, 1.0);

    const predictedPoints = Math.round(criterion.maxPoints * coverage);
    const confidence = Math.min(95, 30 + orgDataUsed.length * 15);

    return {
      criterion: criterion.name,
      maxPoints: criterion.maxPoints,
      predictedPoints,
      confidence,
      orgDataUsed,
      gaps,
      suggestion: gaps.length > 0 ? mapping.suggestion : "Your profile covers this criterion well. Focus on strengthening your narrative.",
    };
  });

  const totalPredicted = scores.reduce((sum, s) => sum + s.predictedPoints, 0);
  const totalMax = scores.reduce((sum, s) => sum + s.maxPoints, 0);

  return { scores, totalPredicted, totalMax };
}
