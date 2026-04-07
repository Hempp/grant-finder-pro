/**
 * US Department of Education Grants Scraper
 *
 * Scrapes education grant opportunities from:
 * 1. ED.gov grant forecast (planned opportunities)
 * 2. ED.gov current opportunities
 * 3. Grants.gov filtered to education agency
 */

import { GrantSource, ScrapedGrant } from "./types";

interface EdGovGrant {
  title?: string;
  name?: string;
  program?: string;
  cfda?: string;
  cfdaNumber?: string;
  description?: string;
  synopsis?: string;
  deadline?: string;
  closeDate?: string;
  estimatedFunding?: number;
  awardCeiling?: number;
  awardFloor?: number;
  eligibility?: string;
  url?: string;
  link?: string;
  status?: string;
  agency?: string;
  office?: string;
  oppNumber?: string;
  category?: string;
}

// CFDA numbers for major ED programs
const ED_CFDA_PREFIXES = [
  "84.",  // All Department of Education programs
];

// Education-specific keywords for Grants.gov search
const EDUCATION_KEYWORDS = [
  "education",
  "school",
  "teacher",
  "student",
  "literacy",
  "STEM education",
  "Title I",
  "Title III",
  "special education",
  "IDEA",
  "Pell",
  "higher education",
  "workforce development",
  "career technical education",
  "early childhood",
  "Head Start",
  "after school",
  "charter school",
  "magnet school",
  "bilingual education",
  "adult education",
  "educational technology",
  "college readiness",
  "dropout prevention",
  "school safety",
  "mental health schools",
  "tribal education",
  "rural education",
];

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export class EdGovGrantSource implements GrantSource {
  id = "ed-gov";
  name = "US Department of Education";
  type = "federal" as const;

  isEnabled(): boolean {
    return true;
  }

  async scrape(): Promise<ScrapedGrant[]> {
    const results: ScrapedGrant[] = [];
    const seen = new Set<string>();

    // 1. Scrape ED.gov grant forecast
    const forecast = await this.scrapeEdGovForecast();
    for (const g of forecast) {
      const key = `${g.title}:${g.funder}`.toLowerCase();
      if (!seen.has(key)) { seen.add(key); results.push(g); }
    }

    // 2. Scrape Grants.gov for education opportunities
    const grantsGov = await this.scrapeGrantsGovEducation();
    for (const g of grantsGov) {
      const key = `${g.title}:${g.funder}`.toLowerCase();
      if (!seen.has(key)) { seen.add(key); results.push(g); }
    }

    // 3. Add curated major ED programs that may not appear in API results
    const curated = this.getCuratedEdPrograms();
    for (const g of curated) {
      const key = `${g.title}:${g.funder}`.toLowerCase();
      if (!seen.has(key)) { seen.add(key); results.push(g); }
    }

    console.info(`ED.gov: scraped ${results.length} education grants`);
    return results;
  }

  private async scrapeEdGovForecast(): Promise<ScrapedGrant[]> {
    const results: ScrapedGrant[] = [];

    try {
      // ED.gov RSS / JSON feed for grant forecast
      const url = "https://www2.ed.gov/fund/grant/apply/forecast/forecast.json";
      const response = await fetch(url, {
        headers: {
          "User-Agent": "GrantPilot/1.0 (education-grant-search)",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(20000),
      });

      if (response.ok) {
        const data = await response.json();
        const items: EdGovGrant[] = Array.isArray(data)
          ? data
          : data.forecasts || data.grants || data.opportunities || [];

        for (const item of items) {
          const mapped = this.mapToGrant(item);
          if (mapped) results.push(mapped);
        }
      }
    } catch (error) {
      console.error("ED.gov forecast scrape failed:", error);
    }

    // Try the XML/RSS feed as fallback
    if (results.length === 0) {
      try {
        const url = "https://www2.ed.gov/fund/grant/apply/forecast/forecast.xml";
        const response = await fetch(url, {
          headers: { "User-Agent": "GrantPilot/1.0" },
          signal: AbortSignal.timeout(15000),
        });

        if (response.ok) {
          const text = await response.text();
          // Parse basic XML items
          const items = text.match(/<item>[\s\S]*?<\/item>/g) || [];
          for (const itemXml of items.slice(0, 50)) {
            const title = extractXmlTag(itemXml, "title");
            const desc = extractXmlTag(itemXml, "description");
            const link = extractXmlTag(itemXml, "link");
            const pubDate = extractXmlTag(itemXml, "pubDate");

            if (title) {
              results.push({
                title,
                funder: "US Department of Education",
                description: desc || title,
                amount: "Varies",
                amountMin: null,
                amountMax: null,
                deadline: pubDate || null,
                url: link || "https://www2.ed.gov/fund/grant/apply/grantapps.html",
                type: "federal",
                category: "education",
                eligibility: "See program requirements",
                state: "ALL",
                tags: ["education", "federal", "ed.gov"],
                source: "ed-gov-forecast",
                agencyName: "US Department of Education",
                sourceId: `edgov-${slugify(title)}`,
                sourceUrl: link || null,
                nofoUrl: null,
              });
            }
          }
        }
      } catch {
        // Non-blocking
      }
    }

    return results;
  }

  private async scrapeGrantsGovEducation(): Promise<ScrapedGrant[]> {
    const results: ScrapedGrant[] = [];

    for (const keyword of EDUCATION_KEYWORDS.slice(0, 10)) {
      try {
        const url = `https://www.grants.gov/grantsws/rest/opportunities/search/v2?keyword=${encodeURIComponent(keyword)}&oppStatuses=posted&rows=25&agency=ED`;

        const response = await fetch(url, {
          headers: {
            "User-Agent": "GrantPilot/1.0",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(15000),
        });

        if (response.ok) {
          const data = await response.json();
          const hits = data.oppHits || data.data?.oppHits || [];

          for (const hit of hits) {
            const grant = this.mapGrantsGovHit(hit);
            if (grant) results.push(grant);
          }
        }

        await delay(600);
      } catch {
        // Non-blocking
      }
    }

    return results;
  }

  private mapGrantsGovHit(hit: Record<string, unknown>): ScrapedGrant | null {
    const title = (hit.title || hit.oppTitle) as string;
    if (!title) return null;

    const agency = (hit.agencyName || hit.agency) as string || "US Department of Education";
    const oppNumber = (hit.number || hit.oppNumber) as string;

    return {
      title,
      funder: agency,
      description: (hit.description || hit.synopsis || title) as string,
      amount: (hit.awardCeiling as number) ? `$${(hit.awardCeiling as number).toLocaleString()}` : "Varies",
      amountMin: (hit.awardFloor as number) || null,
      amountMax: (hit.awardCeiling as number) || null,
      deadline: (hit.closeDate || hit.closingDate) as string || null,
      url: oppNumber
        ? `https://www.grants.gov/search-results-detail/${oppNumber}`
        : "https://www.grants.gov",
      type: "federal",
      category: "education",
      eligibility: ((hit.eligibilities as string[]) || []).join(", ") || "See requirements",
      state: "ALL",
      tags: ["education", "federal", "department-of-education"],
      source: "ed-gov-grants",
      agencyName: agency,
      sourceId: oppNumber ? `edgov-gg-${oppNumber}` : null,
      sourceUrl: null,
      nofoUrl: null,
    };
  }

  private mapToGrant(item: EdGovGrant): ScrapedGrant | null {
    const title = item.title || item.name || item.program;
    if (!title) return null;

    return {
      title,
      funder: item.agency || "US Department of Education",
      description: item.description || item.synopsis || title,
      amount: item.estimatedFunding
        ? `$${item.estimatedFunding.toLocaleString()}`
        : item.awardCeiling
          ? `$${item.awardCeiling.toLocaleString()}`
          : "Varies",
      amountMin: item.awardFloor || null,
      amountMax: item.awardCeiling || item.estimatedFunding || null,
      deadline: item.deadline || item.closeDate || null,
      url: item.url || item.link || "https://www2.ed.gov/fund/grant/apply/grantapps.html",
      type: "federal",
      category: "education",
      eligibility: item.eligibility || "See program requirements",
      state: "ALL",
      tags: ["education", "federal", "ed.gov", ...(item.cfda ? [`cfda-${item.cfda}`] : [])],
      source: "ed-gov",
      agencyName: item.office || item.agency || "US Department of Education",
      sourceId: item.oppNumber ? `edgov-${item.oppNumber}` : `edgov-${slugify(title)}`,
      sourceUrl: item.url || item.link || null,
      nofoUrl: null,
    };
  }

  private getCuratedEdPrograms(): ScrapedGrant[] {
    return [
      {
        title: "Title I, Part A — Improving Basic Programs",
        funder: "US Department of Education",
        description: "Formula grants to local educational agencies (LEAs) to help disadvantaged students meet challenging state academic standards. The largest federal investment in K-12 education.",
        amount: "$18,400,000,000",
        amountMin: 50000,
        amountMax: 500000000,
        deadline: null,
        url: "https://oese.ed.gov/offices/office-of-formula-grants/school-support-and-accountability/title-i-part-a-program/",
        type: "federal",
        category: "education",
        eligibility: "Local educational agencies with high concentrations of low-income students",
        state: "ALL",
        tags: ["education", "title-i", "k-12", "federal", "formula-grant"],
        source: "ed-gov-curated",
        agencyName: "Office of Elementary and Secondary Education",
        sourceId: "edgov-title-i-a",
        sourceUrl: null,
        nofoUrl: null,
      },
      {
        title: "IDEA Part B — Special Education Grants to States",
        funder: "US Department of Education",
        description: "Provides grants to states and territories to assist in providing special education and related services to children with disabilities ages 3-21.",
        amount: "$14,200,000,000",
        amountMin: 100000,
        amountMax: 2000000000,
        deadline: null,
        url: "https://sites.ed.gov/idea/",
        type: "federal",
        category: "education",
        eligibility: "State educational agencies serving children with disabilities",
        state: "ALL",
        tags: ["education", "special-education", "IDEA", "federal"],
        source: "ed-gov-curated",
        agencyName: "Office of Special Education Programs",
        sourceId: "edgov-idea-b",
        sourceUrl: null,
        nofoUrl: null,
      },
      {
        title: "21st Century Community Learning Centers",
        funder: "US Department of Education",
        description: "Supports the creation of community learning centers that provide academic enrichment, literacy education, and other activities during non-school hours for students attending high-poverty and low-performing schools.",
        amount: "$1,300,000,000",
        amountMin: 50000,
        amountMax: 5000000,
        deadline: null,
        url: "https://oese.ed.gov/offices/office-of-formula-grants/school-support-and-accountability/21st-century-community-learning-centers/",
        type: "federal",
        category: "education",
        eligibility: "Local educational agencies, community-based organizations, nonprofits",
        state: "ALL",
        tags: ["education", "after-school", "community", "federal"],
        source: "ed-gov-curated",
        agencyName: "Office of Elementary and Secondary Education",
        sourceId: "edgov-21cclc",
        sourceUrl: null,
        nofoUrl: null,
      },
      {
        title: "Teacher Quality Partnership (TQP) Grants",
        funder: "US Department of Education",
        description: "Competitive grants to improve teacher preparation, develop high-quality pathways into teaching, and address teacher shortages in high-need fields and schools.",
        amount: "$132,000,000",
        amountMin: 500000,
        amountMax: 5000000,
        deadline: null,
        url: "https://oese.ed.gov/offices/office-of-discretionary-grants-support-services/effective-educator-development-programs/teacher-quality-partnership/",
        type: "federal",
        category: "education",
        eligibility: "Partnerships between higher education institutions and high-need school districts",
        state: "ALL",
        tags: ["education", "teacher", "preparation", "federal", "competitive"],
        source: "ed-gov-curated",
        agencyName: "Office of Elementary and Secondary Education",
        sourceId: "edgov-tqp",
        sourceUrl: null,
        nofoUrl: null,
      },
      {
        title: "TRIO Programs — Federal Outreach and Student Services",
        funder: "US Department of Education",
        description: "Eight programs designed to identify and provide services for individuals from disadvantaged backgrounds, including Upward Bound, Talent Search, and Student Support Services.",
        amount: "$1,160,000,000",
        amountMin: 200000,
        amountMax: 1500000,
        deadline: null,
        url: "https://www2.ed.gov/about/offices/list/ope/trio/index.html",
        type: "federal",
        category: "education",
        eligibility: "Institutions of higher education, public and private agencies/organizations",
        state: "ALL",
        tags: ["education", "TRIO", "disadvantaged", "higher-education", "federal"],
        source: "ed-gov-curated",
        agencyName: "Office of Postsecondary Education",
        sourceId: "edgov-trio",
        sourceUrl: null,
        nofoUrl: null,
      },
      {
        title: "Education Innovation and Research (EIR) Program",
        funder: "US Department of Education",
        description: "Provides funding to create, develop, implement, replicate, or take to scale entrepreneurial, evidence-based, field-initiated innovations to improve student achievement.",
        amount: "$245,000,000",
        amountMin: 500000,
        amountMax: 15000000,
        deadline: null,
        url: "https://oese.ed.gov/offices/office-of-discretionary-grants-support-services/innovation-early-learning/education-innovation-and-research-eir/",
        type: "federal",
        category: "education",
        eligibility: "Local educational agencies, state educational agencies, nonprofits, higher education institutions",
        state: "ALL",
        tags: ["education", "innovation", "research", "evidence-based", "federal", "competitive"],
        source: "ed-gov-curated",
        agencyName: "Office of Elementary and Secondary Education",
        sourceId: "edgov-eir",
        sourceUrl: null,
        nofoUrl: null,
      },
      {
        title: "Full-Service Community Schools (FSCS) Program",
        funder: "US Department of Education",
        description: "Provides support for the planning, implementation, and operation of full-service community schools that improve outcomes for students in high-need communities.",
        amount: "$150,000,000",
        amountMin: 500000,
        amountMax: 5000000,
        deadline: null,
        url: "https://oese.ed.gov/offices/office-of-discretionary-grants-support-services/school-choice-improvement-programs/full-service-community-schools-program-fscs/",
        type: "federal",
        category: "education",
        eligibility: "Local educational agencies, nonprofits, higher education institutions in partnership with schools",
        state: "ALL",
        tags: ["education", "community-schools", "federal", "competitive"],
        source: "ed-gov-curated",
        agencyName: "Office of Elementary and Secondary Education",
        sourceId: "edgov-fscs",
        sourceUrl: null,
        nofoUrl: null,
      },
      {
        title: "Career and Technical Education (Perkins V) State Grants",
        funder: "US Department of Education",
        description: "Formula grants to states to develop the academic, career, and technical skills of secondary and postsecondary students enrolled in career and technical education programs.",
        amount: "$1,400,000,000",
        amountMin: 100000,
        amountMax: 200000000,
        deadline: null,
        url: "https://cte.ed.gov/grants/state-grants",
        type: "federal",
        category: "education",
        eligibility: "State agencies, local educational agencies, postsecondary institutions with CTE programs",
        state: "ALL",
        tags: ["education", "career-technical", "Perkins", "CTE", "federal", "formula-grant"],
        source: "ed-gov-curated",
        agencyName: "Office of Career, Technical, and Adult Education",
        sourceId: "edgov-perkins-v",
        sourceUrl: null,
        nofoUrl: null,
      },
      {
        title: "Magnet Schools Assistance Program (MSAP)",
        funder: "US Department of Education",
        description: "Competitive grants to support magnet schools that are part of an approved desegregation plan, offering innovative educational approaches to reduce racial isolation.",
        amount: "$139,000,000",
        amountMin: 500000,
        amountMax: 4000000,
        deadline: null,
        url: "https://oese.ed.gov/offices/office-of-discretionary-grants-support-services/school-choice-improvement-programs/magnet-school-assistance-program-msap/",
        type: "federal",
        category: "education",
        eligibility: "Local educational agencies implementing magnet school programs",
        state: "ALL",
        tags: ["education", "magnet-school", "desegregation", "federal", "competitive"],
        source: "ed-gov-curated",
        agencyName: "Office of Elementary and Secondary Education",
        sourceId: "edgov-msap",
        sourceUrl: null,
        nofoUrl: null,
      },
      {
        title: "Fund for the Improvement of Postsecondary Education (FIPSE)",
        funder: "US Department of Education",
        description: "Supports innovative reform projects that promise significant improvement in postsecondary education, particularly for underserved populations.",
        amount: "$100,000,000",
        amountMin: 100000,
        amountMax: 5000000,
        deadline: null,
        url: "https://www2.ed.gov/about/offices/list/ope/fipse/index.html",
        type: "federal",
        category: "education",
        eligibility: "Accredited institutions of higher education, nonprofits",
        state: "ALL",
        tags: ["education", "postsecondary", "innovation", "FIPSE", "federal", "competitive"],
        source: "ed-gov-curated",
        agencyName: "Office of Postsecondary Education",
        sourceId: "edgov-fipse",
        sourceUrl: null,
        nofoUrl: null,
      },
    ];
  }
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80);
}

function extractXmlTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return match ? match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, "$1").trim() : null;
}
