/**
 * Grant Readiness Score Calculation Engine
 *
 * Evaluates an organization's preparedness for grant applications
 * across six weighted factors, producing a 0-100 score with
 * actionable improvement recommendations.
 */

// --- Types ---

export interface OrganizationData {
  name?: string | null;
  type?: string | null;
  ein?: string | null;
  legalStructure?: string | null;
  mission?: string | null;
  teamSize?: string | null;
  annualRevenue?: string | null;
  state?: string | null;
  founderBackground?: string | null;
  fundingSeeking?: string | null;
  previousFunding?: string | null;
}

export interface DocumentSummary {
  hasPitchDeck: boolean;
  hasFinancials: boolean;
  hasBusinessPlan: boolean;
  totalDocuments: number;
}

export interface ReadinessBreakdown {
  profile: CategoryScore;
  documents: CategoryScore;
  financial: CategoryScore;
  team: CategoryScore;
  trackRecord: CategoryScore;
  applicationHistory: CategoryScore;
}

export interface CategoryScore {
  score: number; // 0-100
  weight: number; // 0-1
  details: string[];
}

export interface ReadinessResult {
  score: number; // 0-100
  breakdown: ReadinessBreakdown;
  actions: { priority: "high" | "medium" | "low"; action: string }[];
}

// --- Weights ---

const WEIGHTS = {
  profile: 0.2,
  documents: 0.2,
  financial: 0.15,
  team: 0.15,
  trackRecord: 0.15,
  applicationHistory: 0.15,
} as const;

// --- Scoring Functions ---

function scoreProfile(org: OrganizationData): CategoryScore {
  const fields: { key: keyof OrganizationData; label: string }[] = [
    { key: "name", label: "Organization name" },
    { key: "type", label: "Organization type" },
    { key: "ein", label: "EIN / Tax ID" },
    { key: "legalStructure", label: "Legal structure" },
    { key: "mission", label: "Mission statement" },
    { key: "teamSize", label: "Team size" },
    { key: "annualRevenue", label: "Annual revenue" },
    { key: "state", label: "State" },
  ];

  const present: string[] = [];
  const missing: string[] = [];

  for (const { key, label } of fields) {
    const val = org[key];
    if (val && String(val).trim() !== "") {
      present.push(`${label} provided`);
    } else {
      missing.push(`Missing: ${label}`);
    }
  }

  const score = Math.round((present.length / fields.length) * 100);
  return {
    score,
    weight: WEIGHTS.profile,
    details: [...missing, ...present],
  };
}

function scoreDocuments(docs: DocumentSummary): CategoryScore {
  const details: string[] = [];
  let points = 0;
  const total = 3;

  if (docs.hasPitchDeck) {
    points++;
    details.push("Pitch deck uploaded");
  } else {
    details.push("Missing: Pitch deck");
  }

  if (docs.hasFinancials) {
    points++;
    details.push("Financial documents uploaded");
  } else {
    details.push("Missing: Financial documents");
  }

  if (docs.hasBusinessPlan) {
    points++;
    details.push("Business plan uploaded");
  } else {
    details.push("Missing: Business plan");
  }

  const score = Math.round((points / total) * 100);
  return { score, weight: WEIGHTS.documents, details };
}

function scoreFinancial(org: OrganizationData): CategoryScore {
  const details: string[] = [];
  let points = 0;
  const total = 2;

  if (org.annualRevenue && org.annualRevenue.trim() !== "") {
    points++;
    details.push("Annual revenue provided");
  } else {
    details.push("Missing: Annual revenue figures");
  }

  if (org.fundingSeeking && org.fundingSeeking.trim() !== "") {
    points++;
    details.push("Funding amount sought specified");
  } else {
    details.push("Missing: Funding amount sought");
  }

  const score = Math.round((points / total) * 100);
  return { score, weight: WEIGHTS.financial, details };
}

function scoreTeam(org: OrganizationData): CategoryScore {
  const details: string[] = [];
  let score = 0;

  // Team size: 30 points
  if (org.teamSize && org.teamSize.trim() !== "") {
    score += 30;
    details.push("Team size provided");
  } else {
    details.push("Missing: Team size");
  }

  // Founder background: up to 70 points based on length
  const bg = org.founderBackground?.trim() ?? "";
  if (bg.length === 0) {
    details.push("Missing: Founder/leadership background");
  } else if (bg.length < 50) {
    score += 20;
    details.push("Founder background is brief — add more detail for stronger applications");
  } else if (bg.length < 150) {
    score += 45;
    details.push("Founder background provided — consider expanding with credentials and achievements");
  } else {
    score += 70;
    details.push("Detailed founder background provided");
  }

  return { score: Math.min(score, 100), weight: WEIGHTS.team, details };
}

function scoreTrackRecord(org: OrganizationData): CategoryScore {
  const details: string[] = [];
  const pf = org.previousFunding?.trim() ?? "";

  if (pf.length === 0) {
    return {
      score: 0,
      weight: WEIGHTS.trackRecord,
      details: ["Missing: Previous funding history"],
    };
  }

  let score: number;
  if (pf.length < 30) {
    score = 25;
    details.push("Previous funding mentioned briefly — add amounts, sources, and dates");
  } else if (pf.length < 100) {
    score = 55;
    details.push("Previous funding described — include specific grant names and outcomes for best results");
  } else {
    score = 100;
    details.push("Detailed previous funding history provided");
  }

  return { score, weight: WEIGHTS.trackRecord, details };
}

function scoreApplicationHistory(stats: {
  total: number;
  awarded: number;
}): CategoryScore {
  const details: string[] = [];

  if (stats.total === 0) {
    return {
      score: 0,
      weight: WEIGHTS.applicationHistory,
      details: ["No applications submitted yet — start applying to build your track record"],
    };
  }

  // Base score from total applications (up to 50 points)
  const appPoints = Math.min(stats.total * 10, 50);

  // Win rate bonus (up to 50 points)
  const winRate = stats.total > 0 ? stats.awarded / stats.total : 0;
  const winPoints = Math.round(winRate * 50);

  const score = Math.min(appPoints + winPoints, 100);

  details.push(`${stats.total} application(s) submitted`);
  if (stats.awarded > 0) {
    details.push(
      `${stats.awarded} awarded (${Math.round(winRate * 100)}% win rate)`
    );
  } else {
    details.push("No awards yet — keep applying and refining your proposals");
  }

  return { score, weight: WEIGHTS.applicationHistory, details };
}

// --- Main Calculator ---

export function calculateReadinessScore(
  org: OrganizationData,
  docs: DocumentSummary,
  applicationStats: { total: number; awarded: number }
): ReadinessResult {
  const breakdown: ReadinessBreakdown = {
    profile: scoreProfile(org),
    documents: scoreDocuments(docs),
    financial: scoreFinancial(org),
    team: scoreTeam(org),
    trackRecord: scoreTrackRecord(org),
    applicationHistory: scoreApplicationHistory(applicationStats),
  };

  // Weighted average
  const score = Math.round(
    breakdown.profile.score * breakdown.profile.weight +
      breakdown.documents.score * breakdown.documents.weight +
      breakdown.financial.score * breakdown.financial.weight +
      breakdown.team.score * breakdown.team.weight +
      breakdown.trackRecord.score * breakdown.trackRecord.weight +
      breakdown.applicationHistory.score * breakdown.applicationHistory.weight
  );

  // Generate actions from low-scoring categories
  const actionCandidates: {
    priority: "high" | "medium" | "low";
    action: string;
    sortScore: number;
  }[] = [];

  const categoryActions: {
    key: keyof ReadinessBreakdown;
    action: string;
  }[] = [
    { key: "profile", action: "Complete your organization profile (name, EIN, legal structure, mission, state)" },
    { key: "documents", action: "Upload key documents: pitch deck, financials, and business plan" },
    { key: "financial", action: "Add your annual revenue and specify the funding amount you are seeking" },
    { key: "team", action: "Describe your founder background and team in detail" },
    { key: "trackRecord", action: "Document your previous funding history with amounts and outcomes" },
    { key: "applicationHistory", action: "Submit grant applications to build your track record" },
  ];

  for (const { key, action } of categoryActions) {
    const cat = breakdown[key];
    if (cat.score < 100) {
      const priority: "high" | "medium" | "low" =
        cat.score < 40 ? "high" : cat.score < 70 ? "medium" : "low";
      actionCandidates.push({ priority, action, sortScore: cat.score });
    }
  }

  // Sort: high first, then medium, then low; within same priority, lower score first
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  actionCandidates.sort(
    (a, b) =>
      priorityOrder[a.priority] - priorityOrder[b.priority] ||
      a.sortScore - b.sortScore
  );

  const actions = actionCandidates
    .slice(0, 5)
    .map(({ priority, action }) => ({ priority, action }));

  return { score, breakdown, actions };
}
