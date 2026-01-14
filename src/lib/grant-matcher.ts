/**
 * AI-Powered Grant Matching Service
 * Analyzes organization profiles and calculates personalized match scores for grants
 */

interface Organization {
  id: string;
  name: string;
  type: string | null;
  legalStructure: string | null;
  state: string | null;
  city: string | null;
  mission: string | null;
  vision: string | null;
  problemStatement: string | null;
  solution: string | null;
  targetMarket: string | null;
  teamSize: number | null;
  annualRevenue: string | null;
  fundingSeeking: string | null;
}

interface Grant {
  id: string;
  title: string;
  funder: string;
  description: string | null;
  amount: string | null;
  amountMin: number | null;
  amountMax: number | null;
  type: string | null;
  category: string | null;
  eligibility: string | null;
  requirements: string | null;
  state: string | null;
  region: string | null;
  tags: string | null;
  deadline: Date | null;
}

interface MatchResult {
  grantId: string;
  score: number;
  breakdown: {
    location: number;
    orgType: number;
    category: number;
    amount: number;
    keywords: number;
  };
  reasons: string[];
}

// Keywords for different industries/sectors
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  technology: ['tech', 'software', 'ai', 'machine learning', 'saas', 'cloud', 'digital', 'app', 'platform', 'automation', 'data', 'cyber', 'blockchain', 'iot', 'startup'],
  healthcare: ['health', 'medical', 'biotech', 'pharma', 'clinical', 'patient', 'hospital', 'wellness', 'therapeutic', 'drug', 'diagnosis', 'treatment', 'care'],
  cleantech: ['clean', 'energy', 'solar', 'wind', 'renewable', 'sustainable', 'green', 'environmental', 'climate', 'carbon', 'electric', 'battery', 'efficiency'],
  education: ['education', 'learning', 'training', 'school', 'student', 'teacher', 'curriculum', 'edtech', 'academic', 'university', 'skill'],
  manufacturing: ['manufacturing', 'production', 'industrial', 'factory', 'supply chain', 'logistics', 'assembly', 'materials', 'fabrication'],
  agriculture: ['agriculture', 'farm', 'food', 'crop', 'livestock', 'agtech', 'sustainable', 'organic', 'harvest', 'soil'],
  finance: ['finance', 'fintech', 'banking', 'payment', 'investment', 'insurance', 'lending', 'credit', 'financial'],
  social: ['social', 'community', 'nonprofit', 'impact', 'underserved', 'equity', 'diversity', 'inclusion', 'justice', 'poverty'],
  research: ['research', 'innovation', 'r&d', 'science', 'experiment', 'study', 'discovery', 'laboratory', 'academic'],
};

// Organization type to grant eligibility mapping
const ORG_TYPE_MAPPING: Record<string, string[]> = {
  startup: ['startup', 'small business', 'early stage', 'entrepreneur', 'emerging', 'innovation', 'seed', 'series a'],
  small_business: ['small business', 'sme', 'entrepreneur', 'business owner', 'established business', 'sbir', 'sttr'],
  nonprofit: ['nonprofit', 'non-profit', '501c3', 'charitable', 'foundation', 'ngo', 'social enterprise', 'community'],
  research: ['research', 'academic', 'university', 'institution', 'r&d', 'laboratory', 'scientific', 'researcher'],
};

// Legal structure to grant eligibility mapping
const LEGAL_STRUCTURE_MAPPING: Record<string, string[]> = {
  '501c3': ['nonprofit', '501(c)(3)', 'tax-exempt', 'charitable', 'foundation'],
  'llc': ['llc', 'small business', 'for-profit', 'company'],
  'corp': ['corporation', 'c-corp', 's-corp', 'incorporated', 'company'],
  'sole_proprietor': ['sole proprietor', 'individual', 'self-employed', 'freelance'],
};

/**
 * Calculate match score between an organization and a grant
 */
export function calculateMatchScore(org: Organization, grant: Grant): MatchResult {
  const breakdown = {
    location: calculateLocationScore(org, grant),
    orgType: calculateOrgTypeScore(org, grant),
    category: calculateCategoryScore(org, grant),
    amount: calculateAmountScore(org, grant),
    keywords: calculateKeywordScore(org, grant),
  };

  // Weighted scoring
  const weights = {
    location: 0.20,
    orgType: 0.25,
    category: 0.20,
    amount: 0.15,
    keywords: 0.20,
  };

  const score = Math.round(
    breakdown.location * weights.location +
    breakdown.orgType * weights.orgType +
    breakdown.category * weights.category +
    breakdown.amount * weights.amount +
    breakdown.keywords * weights.keywords
  );

  const reasons = generateMatchReasons(org, grant, breakdown);

  return {
    grantId: grant.id,
    score: Math.min(100, Math.max(0, score)),
    breakdown,
    reasons,
  };
}

/**
 * Calculate location match score (0-100)
 */
function calculateLocationScore(org: Organization, grant: Grant): number {
  if (!grant.state) return 50; // No location requirement = neutral
  
  // National grants match everyone
  if (grant.state === 'ALL') return 85;
  
  // Exact state match
  if (org.state && org.state.toUpperCase() === grant.state.toUpperCase()) {
    return 100;
  }
  
  // Same region bonus
  if (org.state && grant.region) {
    const orgRegion = getRegion(org.state);
    if (orgRegion === grant.region) {
      return 60;
    }
  }
  
  // Different state
  return 20;
}

/**
 * Calculate organization type match score (0-100)
 */
function calculateOrgTypeScore(org: Organization, grant: Grant): number {
  let score = 50; // Base score
  
  const grantText = [
    grant.eligibility || '',
    grant.requirements || '',
    grant.description || '',
    grant.category || '',
  ].join(' ').toLowerCase();

  // Check organization type
  if (org.type) {
    const typeKeywords = ORG_TYPE_MAPPING[org.type.toLowerCase()] || [];
    const matchCount = typeKeywords.filter(kw => grantText.includes(kw)).length;
    if (matchCount > 0) {
      score += Math.min(30, matchCount * 15);
    }
  }

  // Check legal structure
  if (org.legalStructure) {
    const structureKeywords = LEGAL_STRUCTURE_MAPPING[org.legalStructure.toLowerCase()] || [];
    const matchCount = structureKeywords.filter(kw => grantText.includes(kw)).length;
    if (matchCount > 0) {
      score += Math.min(20, matchCount * 10);
    }
  }

  // Check for explicit exclusions
  if (org.type === 'nonprofit' && grantText.includes('for-profit only')) {
    return 10;
  }
  if (org.type !== 'nonprofit' && grantText.includes('nonprofit only')) {
    return 10;
  }

  return Math.min(100, score);
}

/**
 * Calculate category/industry match score (0-100)
 */
function calculateCategoryScore(org: Organization, grant: Grant): number {
  let score = 40; // Base score

  const grantText = [
    grant.title || '',
    grant.description || '',
    grant.category || '',
    grant.tags || '',
  ].join(' ').toLowerCase();

  const orgText = [
    org.mission || '',
    org.problemStatement || '',
    org.solution || '',
    org.targetMarket || '',
  ].join(' ').toLowerCase();

  // Find matching industries
  let industryMatches = 0;
  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    const orgHasIndustry = keywords.some(kw => orgText.includes(kw));
    const grantHasIndustry = keywords.some(kw => grantText.includes(kw));
    
    if (orgHasIndustry && grantHasIndustry) {
      industryMatches++;
      score += 15;
    }
  }

  // Grant category matching
  if (grant.category) {
    const category = grant.category.toLowerCase();
    
    // SBIR/STTR matching for research/innovation orgs
    if ((category === 'sbir' || category === 'sttr') && 
        (org.type === 'research' || orgText.includes('research') || orgText.includes('innovation'))) {
      score += 20;
    }
    
    // Small business grants for startups/small businesses
    if (category === 'small_business' && 
        (org.type === 'startup' || org.type === 'small_business')) {
      score += 15;
    }
    
    // Workforce/training grants
    if (category === 'workforce' && orgText.includes('training')) {
      score += 15;
    }
    
    // Clean energy grants
    if (category === 'energy' && 
        (orgText.includes('energy') || orgText.includes('clean') || orgText.includes('sustainable'))) {
      score += 20;
    }
  }

  return Math.min(100, score);
}

/**
 * Calculate amount match score (0-100)
 */
function calculateAmountScore(org: Organization, grant: Grant): number {
  if (!org.fundingSeeking || !grant.amountMax) {
    return 50; // Neutral if we don't have enough info
  }

  const seekingAmount = parseFundingAmount(org.fundingSeeking);
  if (seekingAmount === 0) return 50;

  const grantMin = grant.amountMin || 0;
  const grantMax = grant.amountMax;

  // Perfect fit: seeking amount is within grant range
  if (seekingAmount >= grantMin && seekingAmount <= grantMax) {
    return 100;
  }

  // Seeking less than min - grant might be too big
  if (seekingAmount < grantMin) {
    const ratio = seekingAmount / grantMin;
    return Math.max(30, Math.round(ratio * 70));
  }

  // Seeking more than max - grant might be too small
  if (seekingAmount > grantMax) {
    const ratio = grantMax / seekingAmount;
    return Math.max(20, Math.round(ratio * 80));
  }

  return 50;
}

/**
 * Calculate keyword similarity score (0-100)
 */
function calculateKeywordScore(org: Organization, grant: Grant): number {
  const orgWords = extractKeywords([
    org.mission || '',
    org.problemStatement || '',
    org.solution || '',
    org.targetMarket || '',
    org.name || '',
  ].join(' '));

  const grantWords = extractKeywords([
    grant.title || '',
    grant.description || '',
    grant.eligibility || '',
    grant.requirements || '',
    parseTags(grant.tags),
  ].join(' '));

  if (orgWords.size === 0 || grantWords.size === 0) {
    return 40;
  }

  // Calculate Jaccard similarity
  const intersection = new Set([...orgWords].filter(w => grantWords.has(w)));
  const union = new Set([...orgWords, ...grantWords]);
  
  const similarity = intersection.size / union.size;
  
  // Scale to 0-100 (multiply by 200 to give more weight to partial matches)
  return Math.min(100, Math.round(similarity * 200) + 30);
}

/**
 * Generate human-readable match reasons
 */
function generateMatchReasons(org: Organization, grant: Grant, breakdown: MatchResult['breakdown']): string[] {
  const reasons: string[] = [];

  // Location
  if (breakdown.location >= 80) {
    if (grant.state === 'ALL') {
      reasons.push('National grant - available in all states');
    } else {
      reasons.push(`Located in ${grant.state} - matches your state`);
    }
  }

  // Organization type
  if (breakdown.orgType >= 70) {
    reasons.push(`Strong fit for ${org.type || 'your organization type'}`);
  }

  // Category
  if (breakdown.category >= 70) {
    reasons.push('Aligns with your industry and mission');
  }

  // Amount
  if (breakdown.amount >= 80) {
    reasons.push('Grant amount matches your funding needs');
  } else if (breakdown.amount >= 60) {
    reasons.push('Grant amount partially matches your needs');
  }

  // Keywords
  if (breakdown.keywords >= 70) {
    reasons.push('Strong keyword match with your profile');
  }

  // Default reason if none
  if (reasons.length === 0) {
    reasons.push('Potential opportunity - review eligibility');
  }

  return reasons;
}

/**
 * Helper: Extract meaningful keywords from text
 */
function extractKeywords(text: string): Set<string> {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
    'used', 'that', 'this', 'these', 'those', 'which', 'who', 'whom', 'whose',
    'what', 'where', 'when', 'why', 'how', 'all', 'each', 'every', 'both',
    'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
    'own', 'same', 'so', 'than', 'too', 'very', 'just', 'also', 'now', 'our',
    'your', 'their', 'its', 'we', 'you', 'they', 'he', 'she', 'it', 'i', 'me',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  return new Set(words);
}

/**
 * Helper: Parse funding amount string to number
 */
function parseFundingAmount(amount: string): number {
  const cleaned = amount.toLowerCase().replace(/[^0-9kmb.]/g, '');
  
  if (cleaned.includes('m')) {
    return parseFloat(cleaned.replace('m', '')) * 1000000;
  }
  if (cleaned.includes('k')) {
    return parseFloat(cleaned.replace('k', '')) * 1000;
  }
  if (cleaned.includes('b')) {
    return parseFloat(cleaned.replace('b', '')) * 1000000000;
  }
  
  return parseFloat(cleaned) || 0;
}

/**
 * Helper: Parse tags JSON string
 */
function parseTags(tags: string | null): string {
  if (!tags) return '';
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed.join(' ') : '';
  } catch {
    return tags;
  }
}

/**
 * Helper: Get region from state code
 */
function getRegion(state: string): string {
  const regions: Record<string, string[]> = {
    'Northeast': ['CT', 'ME', 'MA', 'NH', 'RI', 'VT', 'NJ', 'NY', 'PA'],
    'Southeast': ['AL', 'AR', 'FL', 'GA', 'KY', 'LA', 'MS', 'NC', 'SC', 'TN', 'VA', 'WV'],
    'Midwest': ['IL', 'IN', 'IA', 'KS', 'MI', 'MN', 'MO', 'NE', 'ND', 'OH', 'SD', 'WI'],
    'Southwest': ['AZ', 'NM', 'OK', 'TX'],
    'West': ['AK', 'CA', 'CO', 'HI', 'ID', 'MT', 'NV', 'OR', 'UT', 'WA', 'WY'],
  };

  for (const [region, states] of Object.entries(regions)) {
    if (states.includes(state.toUpperCase())) {
      return region;
    }
  }
  return '';
}

/**
 * Calculate match scores for all grants against an organization
 */
export function matchGrantsToOrganization(org: Organization, grants: Grant[]): Map<string, MatchResult> {
  const results = new Map<string, MatchResult>();
  
  for (const grant of grants) {
    const result = calculateMatchScore(org, grant);
    results.set(grant.id, result);
  }
  
  return results;
}

/**
 * Get top matching grants for an organization
 */
export function getTopMatches(org: Organization, grants: Grant[], limit = 10): Array<Grant & { matchResult: MatchResult }> {
  const results = matchGrantsToOrganization(org, grants);
  
  return grants
    .map(grant => ({
      ...grant,
      matchResult: results.get(grant.id)!,
    }))
    .sort((a, b) => b.matchResult.score - a.matchResult.score)
    .slice(0, limit);
}
