// Grant Scraper - Automated grant finder using Grants.gov API and other sources

interface GrantsGovOpportunity {
  id: string;
  number: string;
  title: string;
  agency: {
    name: string;
    code: string;
  };
  category?: {
    name: string;
  };
  awardCeiling?: number;
  awardFloor?: number;
  closeDate?: string;
  openDate?: string;
  description?: string;
  eligibility?: {
    applicant?: {
      types?: string[];
    };
  };
  fundingInstrument?: {
    name: string;
  };
  summary?: {
    synopsis?: string;
  };
}

interface GrantsGovSearchResponse {
  data: GrantsGovOpportunity[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

interface ScrapedGrant {
  title: string;
  funder: string;
  description: string | null;
  amount: string | null;
  amountMin: number | null;
  amountMax: number | null;
  deadline: Date | null;
  url: string | null;
  type: string;
  category: string | null;
  eligibility: string | null;
  requirements: string | null;
  state: string | null;
  tags: string | null;
  source: string;
  scrapedAt: Date;
  agencyName: string | null;
}

// Grants.gov API search
export async function searchGrantsGov(
  keyword?: string,
  agency?: string,
  category?: string,
  pageSize: number = 100
): Promise<ScrapedGrant[]> {
  try {
    const searchBody: Record<string, unknown> = {
      rows: pageSize,
      oppStatuses: "posted", // Only open opportunities
      sortBy: "openDate",
      sortOrder: "desc",
    };

    if (keyword) searchBody.keyword = keyword;
    if (agency) searchBody.agencies = [agency];
    if (category) searchBody.fundingCategories = [category];

    const response = await fetch("https://api.grants.gov/v1/api/search2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchBody),
    });

    if (!response.ok) {
      console.error("Grants.gov API error:", response.status, await response.text());
      return [];
    }

    const data: GrantsGovSearchResponse = await response.json();

    return data.data.map((opp): ScrapedGrant => ({
      title: opp.title,
      funder: opp.agency?.name || "Federal Government",
      description: opp.summary?.synopsis || opp.description || null,
      amount: opp.awardCeiling ? `Up to $${opp.awardCeiling.toLocaleString()}` : null,
      amountMin: opp.awardFloor || null,
      amountMax: opp.awardCeiling || null,
      deadline: opp.closeDate ? new Date(opp.closeDate) : null,
      url: `https://www.grants.gov/search-results-detail/${opp.id}`,
      type: "federal",
      category: opp.category?.name || opp.fundingInstrument?.name || null,
      eligibility: opp.eligibility?.applicant?.types?.join(", ") || null,
      requirements: null,
      state: "ALL",
      tags: JSON.stringify([opp.agency?.code, opp.category?.name].filter(Boolean)),
      source: "grants.gov",
      scrapedAt: new Date(),
      agencyName: opp.agency?.name || null,
    }));
  } catch (error) {
    console.error("Error fetching from Grants.gov:", error);
    return [];
  }
}

// Search SBIR/STTR opportunities
export async function searchSBIRGrants(): Promise<ScrapedGrant[]> {
  const keywords = ["SBIR", "STTR", "Small Business Innovation Research"];
  const grants: ScrapedGrant[] = [];

  for (const keyword of keywords) {
    const results = await searchGrantsGov(keyword, undefined, undefined, 50);
    grants.push(...results.map(g => ({ ...g, category: "SBIR/STTR" })));
  }

  return grants;
}

// Static corporate grants data (updated manually or via other sources)
export function getCorporateGrants(): ScrapedGrant[] {
  const now = new Date();

  return [
    // AWS
    {
      title: "AWS Activate Program - Founders",
      funder: "Amazon Web Services",
      description: "AWS Activate provides startups with free tools, resources, and more to quickly get started on AWS. The Founders tier offers $1,000 in AWS credits.",
      amount: "$1,000 in credits",
      amountMin: 1000,
      amountMax: 1000,
      deadline: null,
      url: "https://aws.amazon.com/startups/lp/aws-activate-credits",
      type: "corporate",
      category: "Cloud Credits",
      eligibility: "Self-funded startups",
      requirements: "New to AWS Activate, valid business",
      state: "ALL",
      tags: JSON.stringify(["tech", "startup", "cloud", "aws"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Amazon Web Services",
    },
    {
      title: "AWS Activate Program - Portfolio",
      funder: "Amazon Web Services",
      description: "For startups affiliated with AWS Activate Providers (accelerators, VCs, incubators). Up to $100,000 in AWS credits.",
      amount: "Up to $100,000 in credits",
      amountMin: 10000,
      amountMax: 100000,
      deadline: null,
      url: "https://aws.amazon.com/startups/lp/aws-activate-credits",
      type: "corporate",
      category: "Cloud Credits",
      eligibility: "Startups affiliated with AWS Activate Providers",
      requirements: "Must be referred by an Activate Provider",
      state: "ALL",
      tags: JSON.stringify(["tech", "startup", "cloud", "aws", "accelerator"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Amazon Web Services",
    },
    {
      title: "AWS AI Startup Credits",
      funder: "Amazon Web Services",
      description: "Specialized credits for generative AI startups building foundation models. Up to $300,000 in AWS credits.",
      amount: "Up to $300,000 in credits",
      amountMin: 100000,
      amountMax: 300000,
      deadline: null,
      url: "https://aws.amazon.com/startups/lp/aws-activate-credits",
      type: "corporate",
      category: "AI/ML Credits",
      eligibility: "AI startups building foundation models",
      requirements: "Building foundation models, not just wrappers",
      state: "ALL",
      tags: JSON.stringify(["ai", "ml", "startup", "cloud", "aws", "foundation-models"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Amazon Web Services",
    },
    // Google Cloud
    {
      title: "Google Cloud for Startups",
      funder: "Google Cloud",
      description: "Google Cloud for Startups provides up to $350,000 in cloud credits over two years for qualifying startups.",
      amount: "Up to $350,000 in credits",
      amountMin: 100000,
      amountMax: 350000,
      deadline: null,
      url: "https://cloud.google.com/startup",
      type: "corporate",
      category: "Cloud Credits",
      eligibility: "Startups less than 5 years old, new to Google Cloud",
      requirements: "Valid domain email, new to startup program",
      state: "ALL",
      tags: JSON.stringify(["tech", "startup", "cloud", "google", "gcp"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Google Cloud",
    },
    // Microsoft
    {
      title: "Microsoft for Startups Founders Hub",
      funder: "Microsoft",
      description: "Up to $150,000 in Azure credits plus access to development tools, GitHub Enterprise, and Microsoft 365.",
      amount: "Up to $150,000 in credits",
      amountMin: 25000,
      amountMax: 150000,
      deadline: null,
      url: "https://www.microsoft.com/en-us/startups",
      type: "corporate",
      category: "Cloud Credits",
      eligibility: "Early-stage startups",
      requirements: "Building a B2B software product",
      state: "ALL",
      tags: JSON.stringify(["tech", "startup", "cloud", "microsoft", "azure"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Microsoft",
    },
    // FedEx
    {
      title: "FedEx Small Business Grant Contest",
      funder: "FedEx",
      description: "Annual grant contest awarding $250,000+ in grants and prizes to U.S. small businesses. Grand prize of $50,000.",
      amount: "$20,000 - $50,000",
      amountMin: 20000,
      amountMax: 50000,
      deadline: null,
      url: "https://www.fedex.com/en-us/small-business/grant-contest.html",
      type: "corporate",
      category: "Business Grant",
      eligibility: "U.S. for-profit small businesses",
      requirements: "Must use FedEx shipping services",
      state: "ALL",
      tags: JSON.stringify(["small-business", "grant", "fedex"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "FedEx",
    },
    // Verizon
    {
      title: "Verizon Small Business Digital Ready",
      funder: "Verizon",
      description: "Complete free courses and apply for $10,000 grant funding. Multiple rounds throughout the year.",
      amount: "$10,000",
      amountMin: 10000,
      amountMax: 10000,
      deadline: null,
      url: "https://www.verizon.com/business/resources/lp/small-business-digital-ready/",
      type: "corporate",
      category: "Business Grant",
      eligibility: "Small business owners completing 2+ courses",
      requirements: "Complete digital readiness courses",
      state: "ALL",
      tags: JSON.stringify(["small-business", "grant", "verizon", "digital"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Verizon",
    },
    // Walmart
    {
      title: "Walmart Spark Good Local Grants",
      funder: "Walmart Foundation",
      description: "Grants from $250 to $5,000 for local nonprofits and community organizations.",
      amount: "$250 - $5,000",
      amountMin: 250,
      amountMax: 5000,
      deadline: null,
      url: "https://walmart.org/how-we-give/local-community-grants",
      type: "foundation",
      category: "Community Grant",
      eligibility: "501(c)(3) nonprofits, schools, government agencies",
      requirements: "Located within service area of a Walmart store",
      state: "ALL",
      tags: JSON.stringify(["nonprofit", "community", "walmart"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Walmart Foundation",
    },
    // Amber Grant
    {
      title: "Amber Grant for Women",
      funder: "WomensNet",
      description: "Monthly $10,000 grants for women-owned businesses. Year-end $25,000 grant for monthly winners.",
      amount: "$10,000 monthly, $25,000 year-end",
      amountMin: 10000,
      amountMax: 25000,
      deadline: null,
      url: "https://ambergrantsforwomen.com/",
      type: "foundation",
      category: "Women-Owned Business",
      eligibility: "Women 18+, 50%+ woman-owned business",
      requirements: "Complete application and essay",
      state: "ALL",
      tags: JSON.stringify(["women", "women-owned", "small-business"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "WomensNet",
    },
    // NASE
    {
      title: "NASE Growth Grant",
      funder: "National Association for the Self-Employed",
      description: "Quarterly $4,000 grants to help NASE members grow their small businesses.",
      amount: "Up to $4,000",
      amountMin: 1000,
      amountMax: 4000,
      deadline: null,
      url: "https://www.nase.org/become-a-member/member-benefits/business-resources/growth-grants",
      type: "association",
      category: "Business Grant",
      eligibility: "NASE members in good standing",
      requirements: "Active NASE membership",
      state: "ALL",
      tags: JSON.stringify(["self-employed", "small-business", "nase"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "NASE",
    },
    // Cartier Women's Initiative
    {
      title: "Cartier Women's Initiative",
      funder: "Cartier",
      description: "Up to $100,000 in grants for early-stage women entrepreneurs with impact businesses.",
      amount: "Up to $100,000",
      amountMin: 30000,
      amountMax: 100000,
      deadline: null,
      url: "https://www.cartierwomensinitiative.com/",
      type: "foundation",
      category: "Women Entrepreneurs",
      eligibility: "Women entrepreneurs, impact-driven business",
      requirements: "Early-stage business solving social/environmental issues",
      state: "ALL",
      tags: JSON.stringify(["women", "impact", "social-enterprise", "international"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Cartier",
    },
    // Bezos Earth Fund
    {
      title: "Bezos Earth Fund AI Grand Challenge",
      funder: "Bezos Earth Fund",
      description: "Phase I: $50,000 grants. Phase II: Up to $2M for AI projects solving climate and nature challenges.",
      amount: "$50,000 - $2,000,000",
      amountMin: 50000,
      amountMax: 2000000,
      deadline: null,
      url: "https://www.bezosearthfund.org/",
      type: "foundation",
      category: "Climate/AI",
      eligibility: "Organizations using AI for climate solutions",
      requirements: "AI-focused climate or nature project",
      state: "ALL",
      tags: JSON.stringify(["ai", "climate", "environment", "bezos"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Bezos Earth Fund",
    },
    // Second Service Foundation
    {
      title: "Second Service Foundation Veteran Grant",
      funder: "Second Service Foundation",
      description: "$10,000 grants to veteran-owned small businesses. Five awards annually.",
      amount: "$10,000",
      amountMin: 10000,
      amountMax: 10000,
      deadline: null,
      url: "https://www.secondservicefoundation.org/",
      type: "foundation",
      category: "Veteran-Owned Business",
      eligibility: "Veteran-owned small businesses",
      requirements: "Veteran or military spouse ownership",
      state: "ALL",
      tags: JSON.stringify(["veteran", "military", "small-business"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Second Service Foundation",
    },
  ];
}

// State-specific grants data
export function getStateGrants(): ScrapedGrant[] {
  const now = new Date();

  return [
    // California
    {
      title: "California Dream Fund Grant",
      funder: "California Office of the Small Business Advocate",
      description: "Grants up to $10,000 for small businesses in underserved California communities.",
      amount: "Up to $10,000",
      amountMin: 5000,
      amountMax: 10000,
      deadline: null,
      url: "https://calosba.ca.gov/",
      type: "state",
      category: "Small Business",
      eligibility: "California small businesses in underserved communities",
      requirements: "Business in underserved community",
      state: "CA",
      tags: JSON.stringify(["california", "small-business", "underserved"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "California OSBA",
    },
    // Texas
    {
      title: "Texas Enterprise Fund",
      funder: "Office of the Texas Governor",
      description: "Deal-closing grants for companies creating jobs and making capital investments in Texas.",
      amount: "Varies by project",
      amountMin: 50000,
      amountMax: 10000000,
      deadline: null,
      url: "https://gov.texas.gov/business/page/texas-enterprise-fund",
      type: "state",
      category: "Economic Development",
      eligibility: "Companies creating jobs in Texas",
      requirements: "Job creation, capital investment, local support",
      state: "TX",
      tags: JSON.stringify(["texas", "economic-development", "jobs"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Texas Governor's Office",
    },
    // New York
    {
      title: "Empire State Development Grants",
      funder: "Empire State Development",
      description: "Various grant programs for businesses expanding or relocating to New York State.",
      amount: "Varies by program",
      amountMin: 10000,
      amountMax: 5000000,
      deadline: null,
      url: "https://esd.ny.gov/",
      type: "state",
      category: "Economic Development",
      eligibility: "Businesses in New York State",
      requirements: "Job creation or retention",
      state: "NY",
      tags: JSON.stringify(["new-york", "economic-development"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Empire State Development",
    },
    // Florida
    {
      title: "Florida High Tech Corridor Grant",
      funder: "Florida High Tech Corridor Council",
      description: "Funding for technology businesses partnering with Florida universities for R&D.",
      amount: "Varies",
      amountMin: 25000,
      amountMax: 150000,
      deadline: null,
      url: "https://floridahightech.com/",
      type: "state",
      category: "Technology/R&D",
      eligibility: "Tech businesses partnering with FL universities",
      requirements: "University research partnership",
      state: "FL",
      tags: JSON.stringify(["florida", "tech", "research", "university"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Florida High Tech Corridor",
    },
    // Illinois
    {
      title: "Illinois OE3 Small Business Capital Grant",
      funder: "Illinois DCEO",
      description: "Grants from $10,000 to $245,000 for small businesses owned by underrepresented groups.",
      amount: "$10,000 - $245,000",
      amountMin: 10000,
      amountMax: 245000,
      deadline: null,
      url: "https://dceo.illinois.gov/",
      type: "state",
      category: "Small Business",
      eligibility: "Underrepresented business owners, fewer than 10 employees",
      requirements: "Illinois business, underserved community",
      state: "IL",
      tags: JSON.stringify(["illinois", "small-business", "minority", "underserved"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Illinois DCEO",
    },
    // Colorado
    {
      title: "Colorado Advanced Industries Accelerator",
      funder: "Colorado OEDIT",
      description: "Proof of Concept and Early Stage Capital grants for advanced industries startups.",
      amount: "Up to $250,000",
      amountMin: 50000,
      amountMax: 250000,
      deadline: null,
      url: "https://oedit.colorado.gov/advanced-industries-accelerator-programs",
      type: "state",
      category: "Advanced Industries",
      eligibility: "Colorado advanced industry companies",
      requirements: "Tech, cleantech, aerospace, or bioscience focus",
      state: "CO",
      tags: JSON.stringify(["colorado", "tech", "cleantech", "aerospace", "bioscience"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Colorado OEDIT",
    },
    // Massachusetts
    {
      title: "MassVentures START Program",
      funder: "MassVentures",
      description: "Non-dilutive grants of $100,000-$500,000 for companies receiving federal SBIR/STTR Phase II awards.",
      amount: "$100,000 - $500,000",
      amountMin: 100000,
      amountMax: 500000,
      deadline: null,
      url: "https://www.mass-ventures.com/start-program",
      type: "state",
      category: "SBIR/STTR Match",
      eligibility: "Companies with federal SBIR/STTR Phase II awards",
      requirements: "Active SBIR/STTR Phase II from federal agency",
      state: "MA",
      tags: JSON.stringify(["massachusetts", "sbir", "sttr", "matching"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "MassVentures",
    },
    // New Jersey
    {
      title: "NJEDA Small Business Fund",
      funder: "New Jersey Economic Development Authority",
      description: "Funding for NJ small businesses with revenue under $3 million.",
      amount: "Varies",
      amountMin: 5000,
      amountMax: 50000,
      deadline: null,
      url: "https://www.njeda.com/",
      type: "state",
      category: "Small Business",
      eligibility: "NJ businesses under $3M revenue",
      requirements: "New Jersey based business",
      state: "NJ",
      tags: JSON.stringify(["new-jersey", "small-business"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "NJEDA",
    },
    // North Carolina
    {
      title: "One North Carolina Small Business Program",
      funder: "NC Department of Commerce",
      description: "Incentive and matching funds for NC small businesses pursuing federal SBIR/STTR grants.",
      amount: "Up to $1.8M available",
      amountMin: 5000,
      amountMax: 200000,
      deadline: new Date("2026-06-30"),
      url: "https://www.commerce.nc.gov/",
      type: "state",
      category: "SBIR/STTR Support",
      eligibility: "NC small businesses pursuing federal SBIR/STTR",
      requirements: "Active SBIR/STTR application or award",
      state: "NC",
      tags: JSON.stringify(["north-carolina", "sbir", "sttr", "matching"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "NC Commerce",
    },
  ];
}

// Main scraper function - combines all sources
export async function scrapeAllGrants(): Promise<ScrapedGrant[]> {
  const allGrants: ScrapedGrant[] = [];

  // Fetch from Grants.gov with different keywords
  const keywords = [
    "small business",
    "innovation",
    "research",
    "technology",
    "startup",
    "development",
    "clean energy",
    "AI artificial intelligence",
    "healthcare",
    "education",
  ];

  for (const keyword of keywords) {
    console.log(`Searching Grants.gov for: ${keyword}`);
    const results = await searchGrantsGov(keyword, undefined, undefined, 25);
    allGrants.push(...results);
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Add SBIR/STTR grants
  console.log("Searching SBIR/STTR grants...");
  const sbirGrants = await searchSBIRGrants();
  allGrants.push(...sbirGrants);

  // Add corporate grants
  console.log("Adding corporate grants...");
  allGrants.push(...getCorporateGrants());

  // Add state grants
  console.log("Adding state grants...");
  allGrants.push(...getStateGrants());

  // Deduplicate by title
  const seen = new Set<string>();
  const uniqueGrants = allGrants.filter(grant => {
    const key = grant.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`Total unique grants found: ${uniqueGrants.length}`);
  return uniqueGrants;
}

export type { ScrapedGrant };
