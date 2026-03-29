import { GrantSource, ScrapedGrant } from "./types";

interface SamGovOpportunity {
  noticeId?: string;
  title?: string;
  description?: string;
  department?: string;
  subtier?: string;
  office?: string;
  type?: string;
  baseType?: string;
  archiveType?: string;
  archiveDate?: string;
  responseDeadLine?: string;
  postedDate?: string;
  award?: {
    amount?: number;
    awardee?: string;
  };
  naicsCode?: string;
  classificationCode?: string;
  pointOfContact?: Array<{
    fullName?: string;
    email?: string;
  }>;
  resourceLinks?: string[];
  uiLink?: string;
}

interface SamGovSearchResponse {
  totalRecords?: number;
  limit?: number;
  offset?: number;
  opportunitiesData?: SamGovOpportunity[];
}

const SEARCH_KEYWORDS = [
  "grant",
  "cooperative agreement",
  "funding opportunity",
];

const SAM_GOV_API_BASE =
  "https://api.sam.gov/opportunities/v2/search";

export class SamGovSource implements GrantSource {
  id = "sam_gov";
  name = "SAM.gov";
  type = "federal" as const;

  isEnabled(): boolean {
    return true; // Always enabled — uses curated fallback when no API key
  }

  async scrape(): Promise<ScrapedGrant[]> {
    const apiKey = process.env.SAM_GOV_API_KEY;
    if (!apiKey) {
      console.info("SAM.gov API key not configured, using curated federal grants");
      return this.getCuratedFederalGrants();
    }

    const seen = new Set<string>();
    const allGrants: ScrapedGrant[] = [];

    for (const keyword of SEARCH_KEYWORDS) {
      try {
        const grants = await this.searchKeyword(keyword, apiKey);
        for (const grant of grants) {
          const dedupKey = grant.sourceId || grant.title;
          if (!seen.has(dedupKey)) {
            seen.add(dedupKey);
            allGrants.push(grant);
          }
        }
        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(
          `SAM.gov search failed for keyword "${keyword}":`,
          error
        );
      }
    }

    return allGrants;
  }

  private async searchKeyword(
    keyword: string,
    apiKey: string
  ): Promise<ScrapedGrant[]> {
    const params = new URLSearchParams({
      api_key: apiKey,
      q: keyword,
      limit: "100",
      postedFrom: this.getDateMonthsAgo(6),
      postedTo: this.getTodayDate(),
      ptype: "o", // opportunities only
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${SAM_GOV_API_BASE}?${params.toString()}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error("SAM.gov API error:", response.status);
        return [];
      }

      const data: SamGovSearchResponse = await response.json();
      const opportunities = data.opportunitiesData || [];

      return opportunities
        .filter((opp) => this.isGrantType(opp))
        .map((opp) => this.mapToScrapedGrant(opp));
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        console.error("SAM.gov API request timed out");
      }
      throw error;
    }
  }

  private isGrantType(opp: SamGovOpportunity): boolean {
    const grantTypes = ["g", "o"]; // grant, other (cooperative agreements)
    const type = (opp.type || opp.baseType || "").toLowerCase();
    return grantTypes.includes(type) || type.includes("grant");
  }

  private mapToScrapedGrant(opp: SamGovOpportunity): ScrapedGrant {
    const title = opp.title || "Untitled Opportunity";
    const agencyName =
      opp.department || opp.subtier || opp.office || "Federal Government";

    const awardAmount = opp.award?.amount || null;

    const tags = [
      opp.naicsCode,
      opp.classificationCode,
      opp.type || opp.baseType,
    ].filter(Boolean) as string[];

    const uiLink =
      opp.uiLink ||
      (opp.noticeId
        ? `https://sam.gov/opp/${opp.noticeId}/view`
        : "https://sam.gov");

    const nofoUrl =
      opp.resourceLinks && opp.resourceLinks.length > 0
        ? opp.resourceLinks[0]
        : null;

    return {
      title,
      funder: agencyName,
      description: opp.description || "",
      amount: awardAmount ? `Up to $${awardAmount.toLocaleString()}` : "",
      amountMin: null,
      amountMax: awardAmount,
      deadline: opp.responseDeadLine || null,
      url: uiLink,
      type: "federal",
      category: opp.classificationCode || "",
      eligibility: "",
      state: "ALL",
      tags,
      source: "sam.gov",
      agencyName,
      sourceId: opp.noticeId || null,
      sourceUrl: uiLink,
      nofoUrl,
    };
  }

  private getTodayDate(): string {
    const d = new Date();
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
  }

  private getDateMonthsAgo(months: number): string {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
  }

  /** Well-known recurring federal grant programs as fallback when no API key */
  private getCuratedFederalGrants(): ScrapedGrant[] {
    return [
      {
        title: "SBIR Phase I - Department of Defense",
        funder: "Department of Defense",
        description: "Small Business Innovation Research (SBIR) Phase I awards for feasibility studies. Topics cover defense-related technologies including AI, cybersecurity, autonomous systems, advanced materials, and energy.",
        amount: "$50,000 - $275,000",
        amountMin: 50000,
        amountMax: 275000,
        deadline: null,
        url: "https://www.dodsbirsttr.mil",
        type: "federal",
        category: "sbir",
        eligibility: "U.S. small businesses with fewer than 500 employees",
        state: "ALL",
        tags: ["sbir", "defense", "innovation", "phase1"],
        source: "sam_gov",
        agencyName: "Department of Defense",
        sourceId: "dod-sbir-phase1",
        sourceUrl: "https://www.dodsbirsttr.mil",
        nofoUrl: null,
      },
      {
        title: "SBIR Phase I - National Science Foundation",
        funder: "National Science Foundation",
        description: "NSF SBIR Phase I grants support startups and small businesses in transforming scientific discovery into societal and economic benefit. Topics span deep tech, biotech, IT, and advanced manufacturing.",
        amount: "Up to $275,000",
        amountMin: null,
        amountMax: 275000,
        deadline: null,
        url: "https://seedfund.nsf.gov",
        type: "federal",
        category: "sbir",
        eligibility: "U.S. small businesses with innovative technology",
        state: "ALL",
        tags: ["sbir", "nsf", "science", "technology"],
        source: "sam_gov",
        agencyName: "National Science Foundation",
        sourceId: "nsf-sbir-phase1",
        sourceUrl: "https://seedfund.nsf.gov",
        nofoUrl: null,
      },
      {
        title: "STTR Phase I - National Institutes of Health",
        funder: "National Institutes of Health",
        description: "Small Business Technology Transfer (STTR) grants for collaborative research between small businesses and research institutions in biomedical and health-related fields.",
        amount: "Up to $400,000",
        amountMin: null,
        amountMax: 400000,
        deadline: null,
        url: "https://seed.nih.gov",
        type: "federal",
        category: "sttr",
        eligibility: "U.S. small businesses partnered with a research institution",
        state: "ALL",
        tags: ["sttr", "nih", "healthcare", "biomedical"],
        source: "sam_gov",
        agencyName: "National Institutes of Health",
        sourceId: "nih-sttr-phase1",
        sourceUrl: "https://seed.nih.gov",
        nofoUrl: null,
      },
      {
        title: "SBIR Phase I - Department of Energy",
        funder: "Department of Energy",
        description: "DOE SBIR/STTR grants for innovative clean energy, nuclear, environmental management, and advanced scientific computing technologies.",
        amount: "Up to $250,000",
        amountMin: null,
        amountMax: 250000,
        deadline: null,
        url: "https://science.osti.gov/sbir",
        type: "federal",
        category: "sbir",
        eligibility: "U.S. small businesses in energy-related fields",
        state: "ALL",
        tags: ["sbir", "doe", "energy", "cleantech"],
        source: "sam_gov",
        agencyName: "Department of Energy",
        sourceId: "doe-sbir-phase1",
        sourceUrl: "https://science.osti.gov/sbir",
        nofoUrl: null,
      },
      {
        title: "Rural Business Development Grants",
        funder: "USDA Rural Development",
        description: "Grants to support small and emerging businesses in rural areas. Funds can be used for business planning, technical assistance, training, and equipment purchases.",
        amount: "$10,000 - $500,000",
        amountMin: 10000,
        amountMax: 500000,
        deadline: null,
        url: "https://www.rd.usda.gov/programs-services/business-programs/rural-business-development-grants",
        type: "federal",
        category: "small_business",
        eligibility: "Rural public entities, nonprofits, and tribal entities",
        state: "ALL",
        tags: ["usda", "rural", "small_business", "development"],
        source: "sam_gov",
        agencyName: "USDA Rural Development",
        sourceId: "usda-rbdg",
        sourceUrl: "https://www.rd.usda.gov/programs-services/business-programs/rural-business-development-grants",
        nofoUrl: null,
      },
      {
        title: "Economic Development Administration - Public Works",
        funder: "Economic Development Administration",
        description: "EDA Public Works grants for infrastructure improvements that support job creation and economic development in distressed communities.",
        amount: "$100,000 - $3,000,000",
        amountMin: 100000,
        amountMax: 3000000,
        deadline: null,
        url: "https://www.eda.gov/funding/programs/public-works",
        type: "federal",
        category: "workforce",
        eligibility: "State and local governments, nonprofits, tribal organizations",
        state: "ALL",
        tags: ["eda", "infrastructure", "economic_development", "workforce"],
        source: "sam_gov",
        agencyName: "Economic Development Administration",
        sourceId: "eda-public-works",
        sourceUrl: "https://www.eda.gov/funding/programs/public-works",
        nofoUrl: null,
      },
      {
        title: "Community Development Block Grant",
        funder: "Department of Housing and Urban Development",
        description: "CDBG provides communities with resources to address a wide range of community development needs including affordable housing, anti-poverty programs, and infrastructure.",
        amount: "$50,000 - $5,000,000",
        amountMin: 50000,
        amountMax: 5000000,
        deadline: null,
        url: "https://www.hud.gov/program_offices/comm_planning/cdbg",
        type: "federal",
        category: "community",
        eligibility: "Local governments, states, nonprofits",
        state: "ALL",
        tags: ["hud", "community", "housing", "development"],
        source: "sam_gov",
        agencyName: "Department of Housing and Urban Development",
        sourceId: "hud-cdbg",
        sourceUrl: "https://www.hud.gov/program_offices/comm_planning/cdbg",
        nofoUrl: null,
      },
      {
        title: "ARPA-E OPEN Program",
        funder: "Advanced Research Projects Agency-Energy",
        description: "ARPA-E funds high-risk, high-reward energy technology projects that are too early for private-sector investment but could fundamentally change energy infrastructure.",
        amount: "$500,000 - $10,000,000",
        amountMin: 500000,
        amountMax: 10000000,
        deadline: null,
        url: "https://arpa-e.energy.gov",
        type: "federal",
        category: "energy",
        eligibility: "Small businesses, universities, national labs, nonprofits",
        state: "ALL",
        tags: ["arpa-e", "energy", "innovation", "cleantech"],
        source: "sam_gov",
        agencyName: "Advanced Research Projects Agency-Energy",
        sourceId: "arpa-e-open",
        sourceUrl: "https://arpa-e.energy.gov",
        nofoUrl: null,
      },
      {
        title: "National Institute of Standards and Technology - MEP",
        funder: "National Institute of Standards and Technology",
        description: "Manufacturing Extension Partnership grants to help small and mid-sized manufacturers modernize operations, adopt new technologies, and expand into new markets.",
        amount: "$100,000 - $2,000,000",
        amountMin: 100000,
        amountMax: 2000000,
        deadline: null,
        url: "https://www.nist.gov/mep",
        type: "federal",
        category: "manufacturing",
        eligibility: "Manufacturing Extension Partnership centers and manufacturers",
        state: "ALL",
        tags: ["nist", "manufacturing", "mep", "technology"],
        source: "sam_gov",
        agencyName: "National Institute of Standards and Technology",
        sourceId: "nist-mep",
        sourceUrl: "https://www.nist.gov/mep",
        nofoUrl: null,
      },
      {
        title: "EPA Environmental Justice Grants",
        funder: "Environmental Protection Agency",
        description: "Grants for community-based organizations working on environmental justice issues including pollution reduction, clean water access, and climate resilience in underserved communities.",
        amount: "$50,000 - $1,000,000",
        amountMin: 50000,
        amountMax: 1000000,
        deadline: null,
        url: "https://www.epa.gov/environmentaljustice/environmental-justice-grants-funding-and-technical-assistance",
        type: "federal",
        category: "environmental",
        eligibility: "Nonprofits, tribal organizations, community groups",
        state: "ALL",
        tags: ["epa", "environmental", "justice", "community"],
        source: "sam_gov",
        agencyName: "Environmental Protection Agency",
        sourceId: "epa-ej-grants",
        sourceUrl: "https://www.epa.gov/environmentaljustice",
        nofoUrl: null,
      },
      {
        title: "SBA Growth Accelerator Fund",
        funder: "Small Business Administration",
        description: "Competition for accelerators and incubators to provide training, mentoring, and other services to startups in underserved communities.",
        amount: "$50,000 - $150,000",
        amountMin: 50000,
        amountMax: 150000,
        deadline: null,
        url: "https://www.sba.gov/funding-programs/grants",
        type: "federal",
        category: "small_business",
        eligibility: "Accelerators, incubators, and similar organizations",
        state: "ALL",
        tags: ["sba", "accelerator", "startup", "small_business"],
        source: "sam_gov",
        agencyName: "Small Business Administration",
        sourceId: "sba-growth-accelerator",
        sourceUrl: "https://www.sba.gov/funding-programs/grants",
        nofoUrl: null,
      },
      {
        title: "NSF Convergence Accelerator",
        funder: "National Science Foundation",
        description: "NSF Convergence Accelerator program funds use-inspired research teams that address national-scale societal challenges through convergence research.",
        amount: "$750,000 - $5,000,000",
        amountMin: 750000,
        amountMax: 5000000,
        deadline: null,
        url: "https://new.nsf.gov/funding/initiatives/convergence-accelerator",
        type: "federal",
        category: "research",
        eligibility: "Universities, nonprofits, small businesses in multi-disciplinary teams",
        state: "ALL",
        tags: ["nsf", "convergence", "research", "innovation"],
        source: "sam_gov",
        agencyName: "National Science Foundation",
        sourceId: "nsf-convergence",
        sourceUrl: "https://new.nsf.gov/funding/initiatives/convergence-accelerator",
        nofoUrl: null,
      },
    ];
  }
}
