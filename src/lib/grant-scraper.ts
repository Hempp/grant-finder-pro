// Grant Scraper - Automated grant finder using Grants.gov API and other sources

// Actual Grants.gov API response structure
interface GrantsGovOpportunity {
  id: string;
  number: string;
  title: string;
  // Agency can be a string (search2 API) or object (v1 API)
  agency?: string | {
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
  // Flat structure (search2 API)
  oppNumber?: string;
  oppTitle?: string;
  agencyName?: string;
  agencyCode?: string;
  oppStatus?: string;
  synopsis?: string;
  openingDate?: string;
  closingDate?: string;
  cfda?: string;
  cfdaNumber?: string;
  estimatedFunding?: number;
  awardCeilingFormatted?: string;
  awardFloorFormatted?: string;
  eligibilities?: string[];
  fundingInstrumentDescription?: string;
  categoryDescription?: string;
}

interface GrantsGovSearchResponse {
  // API wrapper
  errorcode?: string;
  msg?: string;
  token?: string;
  // Nested data structure (actual API response)
  data?: {
    hitCount?: number;
    oppHits?: GrantsGovOpportunity[];
    searchParams?: Record<string, unknown>;
  };
  // Direct structure (fallback)
  oppHits?: GrantsGovOpportunity[];
  totalRecords?: number;
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

    console.log(`Searching Grants.gov with params:`, JSON.stringify(searchBody));

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch("https://api.grants.gov/v1/api/search2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(searchBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unable to read error response");
      console.error("Grants.gov API error:", response.status, errorText);
      return [];
    }

    const responseData: GrantsGovSearchResponse = await response.json();

    // Handle nested API response structure: response.data.oppHits
    const opportunities = responseData.data?.oppHits || responseData.oppHits || [];

    console.log(`Found ${opportunities.length} opportunities from Grants.gov`);

    return opportunities.map((opp): ScrapedGrant => {
      // Get title (handles both formats)
      const title = opp.oppTitle || opp.title || "Untitled Opportunity";

      // Get agency name - can be string or object depending on API version
      let agencyName = "Federal Government";
      if (typeof opp.agency === "string") {
        agencyName = opp.agency;
      } else if (opp.agency?.name) {
        agencyName = opp.agency.name;
      } else if (opp.agencyName) {
        agencyName = opp.agencyName;
      }

      // Get description (flat or nested)
      const description = opp.synopsis || opp.summary?.synopsis || opp.description || null;

      // Get amounts (try formatted first, then raw numbers)
      const awardCeiling = opp.awardCeiling || (opp.awardCeilingFormatted ? parseFloat(opp.awardCeilingFormatted.replace(/[^0-9.]/g, '')) : null);
      const awardFloor = opp.awardFloor || (opp.awardFloorFormatted ? parseFloat(opp.awardFloorFormatted.replace(/[^0-9.]/g, '')) : null);

      // Get deadline (flat or nested)
      const closeDate = opp.closingDate || opp.closeDate;

      // Get opportunity ID (handles both formats)
      const oppId = opp.id || opp.oppNumber || opp.number;

      // Get category
      const category = opp.categoryDescription || (typeof opp.category === "object" ? opp.category?.name : null) || opp.fundingInstrumentDescription || opp.fundingInstrument?.name || null;

      // Get eligibility
      const eligibility = opp.eligibilities?.join(", ") || opp.eligibility?.applicant?.types?.join(", ") || null;

      // Get agency code for tags
      const agencyCode = opp.agencyCode || (typeof opp.agency === "object" ? opp.agency?.code : null);

      return {
        title,
        funder: agencyName,
        description,
        amount: awardCeiling ? `Up to $${awardCeiling.toLocaleString()}` : null,
        amountMin: awardFloor || null,
        amountMax: awardCeiling || null,
        deadline: closeDate ? new Date(closeDate) : null,
        url: `https://www.grants.gov/search-results-detail/${oppId}`,
        type: "federal",
        category,
        eligibility,
        requirements: null,
        state: "ALL",
        tags: JSON.stringify([agencyCode, category, opp.cfdaNumber || opp.cfda].filter(Boolean)),
        source: "grants.gov",
        scrapedAt: new Date(),
        agencyName,
      };
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error("Grants.gov API request timed out");
      } else {
        console.error("Error fetching from Grants.gov:", error.message);
      }
    } else {
      console.error("Error fetching from Grants.gov:", String(error));
    }
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
    // Georgia
    {
      title: "Georgia Small Business Credit Initiative",
      funder: "Georgia Department of Community Affairs",
      description: "Loan guarantees and capital access for Georgia small businesses.",
      amount: "Up to $500,000",
      amountMin: 25000,
      amountMax: 500000,
      deadline: null,
      url: "https://www.dca.ga.gov/",
      type: "state",
      category: "Business Finance",
      eligibility: "Georgia small businesses",
      requirements: "Must be Georgia-based business",
      state: "GA",
      tags: JSON.stringify(["georgia", "small-business", "loan"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Georgia DCA",
    },
    // Pennsylvania
    {
      title: "Ben Franklin Technology Partners Grant",
      funder: "Ben Franklin Technology Partners",
      description: "Early-stage investment and business support for PA tech startups.",
      amount: "Up to $500,000",
      amountMin: 50000,
      amountMax: 500000,
      deadline: null,
      url: "https://benfranklin.org/",
      type: "state",
      category: "Technology",
      eligibility: "Pennsylvania technology startups",
      requirements: "Tech-focused business in PA",
      state: "PA",
      tags: JSON.stringify(["pennsylvania", "tech", "startup"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Ben Franklin",
    },
    // Ohio
    {
      title: "Ohio Third Frontier Technology Grant",
      funder: "Ohio Development Services Agency",
      description: "Funding for technology-based economic development projects in Ohio.",
      amount: "Up to $1,000,000",
      amountMin: 100000,
      amountMax: 1000000,
      deadline: null,
      url: "https://development.ohio.gov/business/third-frontier",
      type: "state",
      category: "Technology",
      eligibility: "Ohio technology companies",
      requirements: "Technology commercialization focus",
      state: "OH",
      tags: JSON.stringify(["ohio", "tech", "third-frontier"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Ohio DSA",
    },
    // Michigan
    {
      title: "Michigan Business Development Program",
      funder: "Michigan Economic Development Corporation",
      description: "Performance-based grants for job creation and capital investment in Michigan.",
      amount: "Varies by project",
      amountMin: 25000,
      amountMax: 10000000,
      deadline: null,
      url: "https://www.michiganbusiness.org/",
      type: "state",
      category: "Economic Development",
      eligibility: "Companies creating jobs in Michigan",
      requirements: "Job creation, capital investment",
      state: "MI",
      tags: JSON.stringify(["michigan", "economic-development", "jobs"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "MEDC",
    },
    // Washington
    {
      title: "Washington Innovation Partnership Zone Grant",
      funder: "Washington State Department of Commerce",
      description: "Grants for innovation partnerships between businesses and research institutions.",
      amount: "Up to $150,000",
      amountMin: 25000,
      amountMax: 150000,
      deadline: null,
      url: "https://www.commerce.wa.gov/",
      type: "state",
      category: "Innovation",
      eligibility: "Washington businesses partnering with research institutions",
      requirements: "Research partnership requirement",
      state: "WA",
      tags: JSON.stringify(["washington", "innovation", "research"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "WA Commerce",
    },
    // Virginia
    {
      title: "Virginia Innovation Partnership Authority Grant",
      funder: "Virginia Innovation Partnership Corporation",
      description: "Funding for commercialization and technology development in Virginia.",
      amount: "Up to $200,000",
      amountMin: 50000,
      amountMax: 200000,
      deadline: null,
      url: "https://www.virginiaipc.org/",
      type: "state",
      category: "Innovation",
      eligibility: "Virginia technology companies",
      requirements: "Virginia-based, technology focus",
      state: "VA",
      tags: JSON.stringify(["virginia", "tech", "innovation"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "VIPC",
    },
    // Arizona
    {
      title: "Arizona Commerce Authority Small Business Capital",
      funder: "Arizona Commerce Authority",
      description: "Capital access programs for Arizona small businesses.",
      amount: "Up to $350,000",
      amountMin: 10000,
      amountMax: 350000,
      deadline: null,
      url: "https://www.azcommerce.com/",
      type: "state",
      category: "Small Business",
      eligibility: "Arizona small businesses",
      requirements: "Arizona-based business",
      state: "AZ",
      tags: JSON.stringify(["arizona", "small-business"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "ACA",
    },
    // Minnesota
    {
      title: "Minnesota Launch MN Grant",
      funder: "Minnesota Department of Employment and Economic Development",
      description: "Grants for early-stage technology startups in Minnesota.",
      amount: "Up to $50,000",
      amountMin: 10000,
      amountMax: 50000,
      deadline: null,
      url: "https://mn.gov/deed/business/financing-business/deed-programs/launch-mn/",
      type: "state",
      category: "Startup",
      eligibility: "Minnesota early-stage startups",
      requirements: "Minnesota-based startup",
      state: "MN",
      tags: JSON.stringify(["minnesota", "startup", "early-stage"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "MN DEED",
    },
    // Oregon
    {
      title: "Oregon InnovateOregon Grant",
      funder: "Business Oregon",
      description: "Funding for Oregon businesses developing innovative technologies.",
      amount: "Up to $100,000",
      amountMin: 25000,
      amountMax: 100000,
      deadline: null,
      url: "https://www.oregon4biz.com/",
      type: "state",
      category: "Innovation",
      eligibility: "Oregon innovative businesses",
      requirements: "Oregon-based, innovative technology",
      state: "OR",
      tags: JSON.stringify(["oregon", "innovation", "tech"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Business Oregon",
    },
    // Nevada
    {
      title: "Nevada Knowledge Fund",
      funder: "Nevada Governor's Office of Economic Development",
      description: "Funding to support technology commercialization from Nevada universities.",
      amount: "Up to $300,000",
      amountMin: 50000,
      amountMax: 300000,
      deadline: null,
      url: "https://goed.nv.gov/",
      type: "state",
      category: "Technology Commercialization",
      eligibility: "Nevada university spin-offs and tech companies",
      requirements: "Connection to Nevada higher education",
      state: "NV",
      tags: JSON.stringify(["nevada", "university", "tech"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Nevada GOED",
    },
    // Utah
    {
      title: "Utah Technology Commercialization and Innovation Program",
      funder: "Utah Governor's Office of Economic Opportunity",
      description: "Grants for commercializing university research and supporting tech startups.",
      amount: "Up to $150,000",
      amountMin: 25000,
      amountMax: 150000,
      deadline: null,
      url: "https://business.utah.gov/",
      type: "state",
      category: "Technology",
      eligibility: "Utah tech startups",
      requirements: "Utah-based, technology focus",
      state: "UT",
      tags: JSON.stringify(["utah", "tech", "commercialization"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Utah GOEO",
    },
    // Connecticut
    {
      title: "Connecticut Innovations Grant",
      funder: "Connecticut Innovations",
      description: "Funding for Connecticut technology and life sciences companies.",
      amount: "Up to $500,000",
      amountMin: 50000,
      amountMax: 500000,
      deadline: null,
      url: "https://ctinnovations.com/",
      type: "state",
      category: "Technology/Life Sciences",
      eligibility: "Connecticut tech and life sciences companies",
      requirements: "Connecticut-based, tech or life sciences",
      state: "CT",
      tags: JSON.stringify(["connecticut", "tech", "life-sciences"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "CT Innovations",
    },
    // Maryland
    {
      title: "Maryland Technology Development Corporation Grant",
      funder: "TEDCO",
      description: "Funding programs for Maryland technology entrepreneurs and startups.",
      amount: "Up to $200,000",
      amountMin: 25000,
      amountMax: 200000,
      deadline: null,
      url: "https://www.tedcomd.com/",
      type: "state",
      category: "Technology",
      eligibility: "Maryland tech startups",
      requirements: "Maryland-based technology company",
      state: "MD",
      tags: JSON.stringify(["maryland", "tech", "startup"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "TEDCO",
    },
    // Indiana
    {
      title: "Indiana 21st Century Research and Technology Fund",
      funder: "Indiana Economic Development Corporation",
      description: "Funding for technology-based economic development in Indiana.",
      amount: "Up to $1,000,000",
      amountMin: 100000,
      amountMax: 1000000,
      deadline: null,
      url: "https://www.iedc.in.gov/",
      type: "state",
      category: "Technology",
      eligibility: "Indiana technology companies",
      requirements: "Indiana-based, technology focus",
      state: "IN",
      tags: JSON.stringify(["indiana", "tech", "research"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "IEDC",
    },
    // Tennessee
    {
      title: "Tennessee Launch Tennessee Grant",
      funder: "LaunchTN",
      description: "Grants and resources for Tennessee-based startups and entrepreneurs.",
      amount: "Up to $50,000",
      amountMin: 5000,
      amountMax: 50000,
      deadline: null,
      url: "https://launchtn.org/",
      type: "state",
      category: "Startup",
      eligibility: "Tennessee startups",
      requirements: "Tennessee-based business",
      state: "TN",
      tags: JSON.stringify(["tennessee", "startup", "entrepreneurship"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "LaunchTN",
    },
    // Missouri
    {
      title: "Missouri Technology Corporation Grant",
      funder: "Missouri Technology Corporation",
      description: "Funding for high-tech startups and entrepreneurs in Missouri.",
      amount: "Up to $300,000",
      amountMin: 50000,
      amountMax: 300000,
      deadline: null,
      url: "https://www.missouritechnology.com/",
      type: "state",
      category: "Technology",
      eligibility: "Missouri technology startups",
      requirements: "Missouri-based, high-tech focus",
      state: "MO",
      tags: JSON.stringify(["missouri", "tech", "startup"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "MTC",
    },
    // Wisconsin
    {
      title: "Wisconsin Economic Development Corporation Grant",
      funder: "WEDC",
      description: "Various grant programs for Wisconsin businesses and communities.",
      amount: "Varies by program",
      amountMin: 10000,
      amountMax: 500000,
      deadline: null,
      url: "https://wedc.org/",
      type: "state",
      category: "Economic Development",
      eligibility: "Wisconsin businesses",
      requirements: "Wisconsin-based business",
      state: "WI",
      tags: JSON.stringify(["wisconsin", "economic-development"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "WEDC",
    },
    // South Carolina
    {
      title: "South Carolina Launch SC Grant",
      funder: "SC Launch",
      description: "Funding for South Carolina technology and innovation companies.",
      amount: "Up to $200,000",
      amountMin: 25000,
      amountMax: 200000,
      deadline: null,
      url: "https://sclaunch.org/",
      type: "state",
      category: "Technology",
      eligibility: "South Carolina tech companies",
      requirements: "South Carolina-based, technology focus",
      state: "SC",
      tags: JSON.stringify(["south-carolina", "tech", "innovation"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "SC Launch",
    },
    // Alabama
    {
      title: "Alabama Innovation Fund",
      funder: "Alabama Department of Commerce",
      description: "Grants for innovative Alabama businesses and startups.",
      amount: "Up to $150,000",
      amountMin: 25000,
      amountMax: 150000,
      deadline: null,
      url: "https://www.madeinalabama.com/",
      type: "state",
      category: "Innovation",
      eligibility: "Alabama innovative businesses",
      requirements: "Alabama-based, innovative technology",
      state: "AL",
      tags: JSON.stringify(["alabama", "innovation", "startup"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "AL Commerce",
    },
    // Kentucky
    {
      title: "Kentucky Innovation Network Grant",
      funder: "Kentucky Cabinet for Economic Development",
      description: "Support for Kentucky entrepreneurs and technology startups.",
      amount: "Up to $100,000",
      amountMin: 10000,
      amountMax: 100000,
      deadline: null,
      url: "https://kyinnovation.com/",
      type: "state",
      category: "Innovation",
      eligibility: "Kentucky entrepreneurs and startups",
      requirements: "Kentucky-based business",
      state: "KY",
      tags: JSON.stringify(["kentucky", "innovation", "entrepreneur"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "KY Innovation",
    },
    // Louisiana
    {
      title: "Louisiana Technology Transfer Office Grant",
      funder: "Louisiana Economic Development",
      description: "Funding for technology commercialization and transfer in Louisiana.",
      amount: "Up to $75,000",
      amountMin: 10000,
      amountMax: 75000,
      deadline: null,
      url: "https://www.opportunitylouisiana.com/",
      type: "state",
      category: "Technology Transfer",
      eligibility: "Louisiana tech entrepreneurs",
      requirements: "Louisiana-based, technology transfer",
      state: "LA",
      tags: JSON.stringify(["louisiana", "tech", "transfer"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "LED",
    },
    // Iowa
    {
      title: "Iowa Innovation Fund",
      funder: "Iowa Economic Development Authority",
      description: "Funding for Iowa businesses developing innovative products and technologies.",
      amount: "Up to $250,000",
      amountMin: 25000,
      amountMax: 250000,
      deadline: null,
      url: "https://www.iowaeda.com/",
      type: "state",
      category: "Innovation",
      eligibility: "Iowa innovative businesses",
      requirements: "Iowa-based, innovative technology",
      state: "IA",
      tags: JSON.stringify(["iowa", "innovation", "tech"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "IEDA",
    },
    // Oklahoma
    {
      title: "Oklahoma i2E Grant",
      funder: "i2E",
      description: "Funding and support for Oklahoma technology entrepreneurs and startups.",
      amount: "Up to $250,000",
      amountMin: 25000,
      amountMax: 250000,
      deadline: null,
      url: "https://i2e.org/",
      type: "state",
      category: "Technology",
      eligibility: "Oklahoma technology startups",
      requirements: "Oklahoma-based, technology focus",
      state: "OK",
      tags: JSON.stringify(["oklahoma", "tech", "startup"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "i2E",
    },
    // Kansas
    {
      title: "NetWork Kansas Grant",
      funder: "NetWork Kansas",
      description: "Various grants and capital access programs for Kansas entrepreneurs.",
      amount: "Up to $150,000",
      amountMin: 5000,
      amountMax: 150000,
      deadline: null,
      url: "https://www.networkkansas.com/",
      type: "state",
      category: "Entrepreneurship",
      eligibility: "Kansas entrepreneurs",
      requirements: "Kansas-based business",
      state: "KS",
      tags: JSON.stringify(["kansas", "entrepreneurship", "small-business"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "NetWork Kansas",
    },
    // New Mexico
    {
      title: "New Mexico Economic Development Department Grant",
      funder: "NM EDD",
      description: "Funding for New Mexico businesses and economic development projects.",
      amount: "Varies by program",
      amountMin: 10000,
      amountMax: 500000,
      deadline: null,
      url: "https://edd.newmexico.gov/",
      type: "state",
      category: "Economic Development",
      eligibility: "New Mexico businesses",
      requirements: "New Mexico-based business",
      state: "NM",
      tags: JSON.stringify(["new-mexico", "economic-development"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "NM EDD",
    },
    // Hawaii
    {
      title: "Hawaii High Technology Development Corporation Grant",
      funder: "HTDC",
      description: "Funding for Hawaii technology companies and innovation projects.",
      amount: "Up to $100,000",
      amountMin: 10000,
      amountMax: 100000,
      deadline: null,
      url: "https://www.htdc.org/",
      type: "state",
      category: "Technology",
      eligibility: "Hawaii technology companies",
      requirements: "Hawaii-based, technology focus",
      state: "HI",
      tags: JSON.stringify(["hawaii", "tech", "innovation"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "HTDC",
    },
    // Alaska
    {
      title: "Alaska Small Business Development Center Grant",
      funder: "Alaska SBDC",
      description: "Support and funding resources for Alaska small businesses.",
      amount: "Varies",
      amountMin: 5000,
      amountMax: 50000,
      deadline: null,
      url: "https://aksbdc.org/",
      type: "state",
      category: "Small Business",
      eligibility: "Alaska small businesses",
      requirements: "Alaska-based business",
      state: "AK",
      tags: JSON.stringify(["alaska", "small-business"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Alaska SBDC",
    },
    // Maine
    {
      title: "Maine Technology Institute Grant",
      funder: "MTI",
      description: "Grants for Maine technology and innovation companies.",
      amount: "Up to $500,000",
      amountMin: 10000,
      amountMax: 500000,
      deadline: null,
      url: "https://www.mainetechnology.org/",
      type: "state",
      category: "Technology",
      eligibility: "Maine technology companies",
      requirements: "Maine-based, technology focus",
      state: "ME",
      tags: JSON.stringify(["maine", "tech", "innovation"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "MTI",
    },
    // Vermont
    {
      title: "Vermont Economic Development Grant",
      funder: "Vermont Agency of Commerce",
      description: "Funding for Vermont businesses and economic development.",
      amount: "Up to $200,000",
      amountMin: 10000,
      amountMax: 200000,
      deadline: null,
      url: "https://accd.vermont.gov/",
      type: "state",
      category: "Economic Development",
      eligibility: "Vermont businesses",
      requirements: "Vermont-based business",
      state: "VT",
      tags: JSON.stringify(["vermont", "economic-development"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "VT Commerce",
    },
    // Rhode Island
    {
      title: "Rhode Island Innovation Voucher",
      funder: "Rhode Island Commerce Corporation",
      description: "Vouchers for Rhode Island small businesses to access innovation services.",
      amount: "Up to $50,000",
      amountMin: 5000,
      amountMax: 50000,
      deadline: null,
      url: "https://commerceri.com/",
      type: "state",
      category: "Innovation",
      eligibility: "Rhode Island small businesses",
      requirements: "Rhode Island-based small business",
      state: "RI",
      tags: JSON.stringify(["rhode-island", "innovation", "voucher"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "RI Commerce",
    },
    // New Hampshire
    {
      title: "New Hampshire Business Finance Authority Grant",
      funder: "NH BFA",
      description: "Financing and grant programs for New Hampshire businesses.",
      amount: "Varies by program",
      amountMin: 10000,
      amountMax: 500000,
      deadline: null,
      url: "https://www.nhbfa.com/",
      type: "state",
      category: "Business Finance",
      eligibility: "New Hampshire businesses",
      requirements: "New Hampshire-based business",
      state: "NH",
      tags: JSON.stringify(["new-hampshire", "business-finance"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "NH BFA",
    },
    // Delaware
    {
      title: "Delaware Division of Small Business Grant",
      funder: "Delaware Division of Small Business",
      description: "Grants and resources for Delaware small businesses.",
      amount: "Up to $50,000",
      amountMin: 5000,
      amountMax: 50000,
      deadline: null,
      url: "https://business.delaware.gov/",
      type: "state",
      category: "Small Business",
      eligibility: "Delaware small businesses",
      requirements: "Delaware-based small business",
      state: "DE",
      tags: JSON.stringify(["delaware", "small-business"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "DE Small Business",
    },
    // West Virginia
    {
      title: "West Virginia Jobs Investment Trust",
      funder: "WV Jobs Investment Trust",
      description: "Investment and grant programs for West Virginia companies.",
      amount: "Up to $500,000",
      amountMin: 25000,
      amountMax: 500000,
      deadline: null,
      url: "https://wvjit.org/",
      type: "state",
      category: "Investment",
      eligibility: "West Virginia companies",
      requirements: "West Virginia-based, job creation",
      state: "WV",
      tags: JSON.stringify(["west-virginia", "investment", "jobs"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "WV JIT",
    },
    // Idaho
    {
      title: "Idaho Technology Grant",
      funder: "Idaho Commerce",
      description: "Funding for Idaho technology and innovation companies.",
      amount: "Up to $100,000",
      amountMin: 10000,
      amountMax: 100000,
      deadline: null,
      url: "https://commerce.idaho.gov/",
      type: "state",
      category: "Technology",
      eligibility: "Idaho technology companies",
      requirements: "Idaho-based, technology focus",
      state: "ID",
      tags: JSON.stringify(["idaho", "tech", "innovation"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Idaho Commerce",
    },
    // Montana
    {
      title: "Montana Board of Investments Grant",
      funder: "Montana Board of Investments",
      description: "Funding programs for Montana businesses and economic development.",
      amount: "Up to $250,000",
      amountMin: 10000,
      amountMax: 250000,
      deadline: null,
      url: "https://investmentmt.com/",
      type: "state",
      category: "Economic Development",
      eligibility: "Montana businesses",
      requirements: "Montana-based business",
      state: "MT",
      tags: JSON.stringify(["montana", "economic-development"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "MT BOI",
    },
    // Wyoming
    {
      title: "Wyoming Business Council Grant",
      funder: "Wyoming Business Council",
      description: "Grants for Wyoming businesses and economic development projects.",
      amount: "Up to $100,000",
      amountMin: 5000,
      amountMax: 100000,
      deadline: null,
      url: "https://wyomingbusiness.org/",
      type: "state",
      category: "Economic Development",
      eligibility: "Wyoming businesses",
      requirements: "Wyoming-based business",
      state: "WY",
      tags: JSON.stringify(["wyoming", "economic-development"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "WY Business Council",
    },
    // North Dakota
    {
      title: "North Dakota Development Fund Grant",
      funder: "ND Development Fund",
      description: "Loans and grants for North Dakota businesses and entrepreneurs.",
      amount: "Up to $300,000",
      amountMin: 10000,
      amountMax: 300000,
      deadline: null,
      url: "https://www.commerce.nd.gov/",
      type: "state",
      category: "Economic Development",
      eligibility: "North Dakota businesses",
      requirements: "North Dakota-based business",
      state: "ND",
      tags: JSON.stringify(["north-dakota", "economic-development"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "ND Commerce",
    },
    // South Dakota
    {
      title: "South Dakota Governor's Office of Economic Development Grant",
      funder: "SD GOED",
      description: "Grants and incentives for South Dakota businesses.",
      amount: "Up to $200,000",
      amountMin: 10000,
      amountMax: 200000,
      deadline: null,
      url: "https://sdgoed.com/",
      type: "state",
      category: "Economic Development",
      eligibility: "South Dakota businesses",
      requirements: "South Dakota-based business",
      state: "SD",
      tags: JSON.stringify(["south-dakota", "economic-development"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "SD GOED",
    },
    // Nebraska
    {
      title: "Invest Nebraska Grant",
      funder: "Invest Nebraska",
      description: "Funding for Nebraska technology and innovation startups.",
      amount: "Up to $250,000",
      amountMin: 25000,
      amountMax: 250000,
      deadline: null,
      url: "https://investnebraska.com/",
      type: "state",
      category: "Innovation",
      eligibility: "Nebraska startups",
      requirements: "Nebraska-based, innovative business",
      state: "NE",
      tags: JSON.stringify(["nebraska", "innovation", "startup"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "Invest Nebraska",
    },
    // Arkansas
    {
      title: "Arkansas Economic Development Commission Grant",
      funder: "AEDC",
      description: "Incentives and grants for Arkansas businesses and job creation.",
      amount: "Varies by program",
      amountMin: 10000,
      amountMax: 500000,
      deadline: null,
      url: "https://www.arkansasedc.com/",
      type: "state",
      category: "Economic Development",
      eligibility: "Arkansas businesses",
      requirements: "Arkansas-based, job creation",
      state: "AR",
      tags: JSON.stringify(["arkansas", "economic-development", "jobs"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "AEDC",
    },
    // Mississippi
    {
      title: "Mississippi Development Authority Grant",
      funder: "MDA",
      description: "Funding for Mississippi businesses and economic development.",
      amount: "Varies by program",
      amountMin: 10000,
      amountMax: 500000,
      deadline: null,
      url: "https://www.mississippi.org/",
      type: "state",
      category: "Economic Development",
      eligibility: "Mississippi businesses",
      requirements: "Mississippi-based business",
      state: "MS",
      tags: JSON.stringify(["mississippi", "economic-development"]),
      source: "manual",
      scrapedAt: now,
      agencyName: "MDA",
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
