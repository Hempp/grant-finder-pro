import { GrantSource, ScrapedGrant } from "./types";

interface StateGrantEntry {
  title: string;
  funder: string;
  description: string;
  amount: string;
  amountMin: number | null;
  amountMax: number | null;
  deadline: string | null;
  url: string;
  category: string;
  eligibility: string;
  state: string;
  tags: string[];
}

const STATE_GRANTS: StateGrantEntry[] = [
  // California
  {
    title: "California Small Business COVID-19 Relief Grant",
    funder: "California Office of the Small Business Advocate",
    description:
      "Grants for small businesses and nonprofits impacted by COVID-19 and the related health and safety restrictions.",
    amount: "Up to $25,000",
    amountMin: 5000,
    amountMax: 25000,
    deadline: null,
    url: "https://www.grants.ca.gov/",
    category: "Small Business",
    eligibility: "Small businesses with annual revenue under $2.5 million",
    state: "CA",
    tags: ["small-business", "covid-relief", "california"],
  },
  {
    title: "California Clean Vehicle Rebate Project",
    funder: "California Air Resources Board",
    description:
      "Rebates for the purchase or lease of eligible zero-emission and plug-in hybrid vehicles.",
    amount: "Up to $7,500",
    amountMin: 1000,
    amountMax: 7500,
    deadline: null,
    url: "https://cleanvehiclerebate.org/en",
    category: "Clean Energy",
    eligibility: "California residents and businesses",
    state: "CA",
    tags: ["clean-energy", "vehicles", "california"],
  },
  // Texas
  {
    title: "Texas Enterprise Fund",
    funder: "Office of the Governor of Texas",
    description:
      "Deal-closing fund to attract major employers and support job creation in Texas.",
    amount: "Up to $10,000,000",
    amountMin: 50000,
    amountMax: 10000000,
    deadline: null,
    url: "https://gov.texas.gov/business/page/texas-enterprise-fund",
    category: "Economic Development",
    eligibility: "Businesses creating jobs in Texas",
    state: "TX",
    tags: ["economic-development", "jobs", "texas"],
  },
  {
    title: "Texas Workforce Commission Skills Development Fund",
    funder: "Texas Workforce Commission",
    description:
      "Grants for customized job training for Texas businesses and their employees.",
    amount: "Up to $500,000",
    amountMin: 25000,
    amountMax: 500000,
    deadline: null,
    url: "https://twc.texas.gov/programs/skills-development-fund",
    category: "Workforce Development",
    eligibility: "Texas businesses partnered with public community or technical colleges",
    state: "TX",
    tags: ["workforce", "training", "texas"],
  },
  // Florida
  {
    title: "Florida Job Growth Grant Fund",
    funder: "Florida Department of Economic Opportunity",
    description:
      "Funding for public infrastructure and workforce training to support job growth.",
    amount: "Up to $3,000,000",
    amountMin: 100000,
    amountMax: 3000000,
    deadline: null,
    url: "https://floridajobs.org/jobgrowth",
    category: "Economic Development",
    eligibility: "Local governments and state colleges in Florida",
    state: "FL",
    tags: ["infrastructure", "workforce", "florida"],
  },
  // New York
  {
    title: "Empire State Development Grants",
    funder: "Empire State Development",
    description:
      "Funding programs to support economic growth, innovation, and job creation across New York State.",
    amount: "Up to $1,000,000",
    amountMin: 25000,
    amountMax: 1000000,
    deadline: null,
    url: "https://esd.ny.gov/doing-business-ny/grants",
    category: "Economic Development",
    eligibility: "New York businesses and organizations",
    state: "NY",
    tags: ["economic-development", "innovation", "new-york"],
  },
  {
    title: "NY Forward Grant Program",
    funder: "New York State",
    description:
      "Downtown revitalization grants to support community development and small business growth.",
    amount: "Up to $10,000,000",
    amountMin: 100000,
    amountMax: 10000000,
    deadline: null,
    url: "https://esd.ny.gov/ny-forward",
    category: "Community Development",
    eligibility: "New York communities and municipalities",
    state: "NY",
    tags: ["community", "downtown", "new-york"],
  },
  // Pennsylvania
  {
    title: "Pennsylvania First Program",
    funder: "Pennsylvania Department of Community and Economic Development",
    description:
      "Grants to support businesses that create and retain jobs in Pennsylvania.",
    amount: "Up to $5,000,000",
    amountMin: 50000,
    amountMax: 5000000,
    deadline: null,
    url: "https://dced.pa.gov/programs/",
    category: "Economic Development",
    eligibility: "Businesses creating jobs in Pennsylvania",
    state: "PA",
    tags: ["economic-development", "jobs", "pennsylvania"],
  },
  // Illinois
  {
    title: "Illinois Small Business Emergency Loan Fund",
    funder: "Illinois Department of Commerce and Economic Opportunity",
    description:
      "Low-interest loans and grants for small businesses affected by economic disruptions.",
    amount: "Up to $250,000",
    amountMin: 10000,
    amountMax: 250000,
    deadline: null,
    url: "https://dceo.illinois.gov/smallbizassistance.html",
    category: "Small Business",
    eligibility: "Illinois small businesses with fewer than 50 employees",
    state: "IL",
    tags: ["small-business", "emergency", "illinois"],
  },
  // Ohio
  {
    title: "Ohio Innovation Fund",
    funder: "Ohio Development Services Agency",
    description:
      "Grants to support technology-based economic development and innovation in Ohio.",
    amount: "Up to $500,000",
    amountMin: 25000,
    amountMax: 500000,
    deadline: null,
    url: "https://development.ohio.gov/business/state-incentives",
    category: "Innovation",
    eligibility: "Ohio technology companies and startups",
    state: "OH",
    tags: ["innovation", "technology", "ohio"],
  },
  // Georgia
  {
    title: "Georgia Quick Start Training Program",
    funder: "Georgia Department of Economic Development",
    description:
      "Free customized workforce training for qualified new and expanding businesses in Georgia.",
    amount: "Up to $1,000,000",
    amountMin: 0,
    amountMax: 1000000,
    deadline: null,
    url: "https://www.georgia.org/competitive-advantages/workforce/quick-start",
    category: "Workforce Development",
    eligibility: "New or expanding businesses in Georgia",
    state: "GA",
    tags: ["workforce", "training", "georgia"],
  },
  // North Carolina
  {
    title: "One North Carolina Fund",
    funder: "North Carolina Department of Commerce",
    description:
      "Discretionary incentive grants to attract and retain businesses creating quality jobs.",
    amount: "Up to $5,000,000",
    amountMin: 50000,
    amountMax: 5000000,
    deadline: null,
    url: "https://www.commerce.nc.gov/grants-incentives/one-north-carolina-fund",
    category: "Economic Development",
    eligibility: "Businesses creating jobs in North Carolina",
    state: "NC",
    tags: ["economic-development", "jobs", "north-carolina"],
  },
  // Michigan
  {
    title: "Michigan Business Development Program",
    funder: "Michigan Economic Development Corporation",
    description:
      "Performance-based grants for businesses creating qualified new jobs in Michigan.",
    amount: "Up to $10,000,000",
    amountMin: 50000,
    amountMax: 10000000,
    deadline: null,
    url: "https://www.michiganbusiness.org/services/incentives/",
    category: "Economic Development",
    eligibility: "Businesses creating high-wage jobs in Michigan",
    state: "MI",
    tags: ["economic-development", "jobs", "michigan"],
  },
  {
    title: "Michigan STEM Forward Grant",
    funder: "Michigan Department of Labor and Economic Opportunity",
    description:
      "Grants to support STEM education programs and workforce pipeline development.",
    amount: "Up to $250,000",
    amountMin: 10000,
    amountMax: 250000,
    deadline: null,
    url: "https://www.michigan.gov/leo/bureaus-agencies/wd",
    category: "Education",
    eligibility: "Michigan educational institutions and workforce organizations",
    state: "MI",
    tags: ["stem", "education", "michigan"],
  },
];

export class StatePortalsSource implements GrantSource {
  id = "state_portals";
  name = "State Grant Portals";
  type = "state" as const;

  isEnabled(): boolean {
    return true;
  }

  async scrape(): Promise<ScrapedGrant[]> {
    return STATE_GRANTS.map((entry) => ({
      title: entry.title,
      funder: entry.funder,
      description: entry.description,
      amount: entry.amount,
      amountMin: entry.amountMin,
      amountMax: entry.amountMax,
      deadline: entry.deadline,
      url: entry.url,
      type: "state" as const,
      category: entry.category,
      eligibility: entry.eligibility,
      state: entry.state,
      tags: entry.tags,
      source: "state_portal",
      agencyName: entry.funder,
      sourceId: null,
      sourceUrl: entry.url,
      nofoUrl: null,
    }));
  }
}
