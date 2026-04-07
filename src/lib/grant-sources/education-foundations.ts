/**
 * Education Foundation Grants Scraper
 *
 * Scrapes and curates education-focused foundation grants from
 * major education philanthropy organizations.
 */

import { GrantSource, ScrapedGrant } from "./types";

export class EducationFoundationsSource implements GrantSource {
  id = "education-foundations";
  name = "Education Foundations";
  type = "foundation" as const;

  isEnabled(): boolean {
    return true;
  }

  async scrape(): Promise<ScrapedGrant[]> {
    const results: ScrapedGrant[] = [];
    const seen = new Set<string>();

    // Try to fetch from foundation APIs/feeds
    const apiResults = await this.scrapeFoundationAPIs();
    for (const g of apiResults) {
      const key = `${g.title}:${g.funder}`.toLowerCase();
      if (!seen.has(key)) { seen.add(key); results.push(g); }
    }

    // Add comprehensive curated education foundation grants
    const curated = this.getCuratedFoundationGrants();
    for (const g of curated) {
      const key = `${g.title}:${g.funder}`.toLowerCase();
      if (!seen.has(key)) { seen.add(key); results.push(g); }
    }

    console.info(`Education Foundations: ${results.length} grants`);
    return results;
  }

  private async scrapeFoundationAPIs(): Promise<ScrapedGrant[]> {
    const results: ScrapedGrant[] = [];

    // Try Candid/Foundation Center API (GuideStar)
    try {
      const url = "https://api.candid.org/grants/v1/search?subject=education&limit=50";
      const response = await fetch(url, {
        headers: {
          "User-Agent": "GrantPilot/1.0",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data) ? data : data.grants || data.results || [];
        for (const item of items) {
          if (item.title || item.name) {
            results.push({
              title: item.title || item.name,
              funder: item.funder || item.foundation || "Unknown Foundation",
              description: item.description || item.purpose || "",
              amount: item.amount ? `$${parseInt(item.amount).toLocaleString()}` : "Varies",
              amountMin: item.amountMin || null,
              amountMax: item.amountMax || item.amount || null,
              deadline: item.deadline || null,
              url: item.url || "",
              type: "foundation",
              category: "education",
              eligibility: item.eligibility || "See requirements",
              state: item.state || "ALL",
              tags: ["education", "foundation", ...(item.tags || [])],
              source: "candid-api",
              agencyName: item.funder || "",
              sourceId: item.id ? `candid-${item.id}` : null,
              sourceUrl: item.url || null,
              nofoUrl: null,
            });
          }
        }
      }
    } catch {
      // Non-blocking
    }

    return results;
  }

  private getCuratedFoundationGrants(): ScrapedGrant[] {
    return [
      // === Bill & Melinda Gates Foundation ===
      {
        title: "Gates Foundation K-12 Education Grants",
        funder: "Bill & Melinda Gates Foundation",
        description: "Supports efforts to ensure all students have access to a high-quality education from kindergarten through college. Focus areas: effective teaching, college-ready standards, innovative school models, and networks that help students succeed.",
        amount: "$500,000,000",
        amountMin: 100000,
        amountMax: 50000000,
        deadline: null,
        url: "https://www.gatesfoundation.org/our-work/programs/us-program/k-12-education",
        type: "foundation",
        category: "education",
        eligibility: "Nonprofits, school districts, higher education institutions, research organizations",
        state: "ALL",
        tags: ["education", "k-12", "gates-foundation", "teaching", "college-readiness"],
        source: "education-foundations",
        agencyName: "Bill & Melinda Gates Foundation",
        sourceId: "gates-k12",
        sourceUrl: null,
        nofoUrl: null,
      },
      {
        title: "Gates Foundation Postsecondary Success",
        funder: "Bill & Melinda Gates Foundation",
        description: "Aims to dramatically increase the number of low-income, first-generation, and students of color who obtain a postsecondary credential with labor market value.",
        amount: "$300,000,000",
        amountMin: 250000,
        amountMax: 25000000,
        deadline: null,
        url: "https://www.gatesfoundation.org/our-work/programs/us-program/postsecondary-success",
        type: "foundation",
        category: "education",
        eligibility: "Higher education institutions, state systems, nonprofits focused on postsecondary completion",
        state: "ALL",
        tags: ["education", "higher-education", "postsecondary", "gates-foundation", "equity"],
        source: "education-foundations",
        agencyName: "Bill & Melinda Gates Foundation",
        sourceId: "gates-postsecondary",
        sourceUrl: null,
        nofoUrl: null,
      },
      // === Lumina Foundation ===
      {
        title: "Lumina Foundation Education Grants",
        funder: "Lumina Foundation",
        description: "Focused on increasing the proportion of Americans with high-quality degrees, certificates, and credentials to 60% by 2025. Funds projects that improve access, affordability, quality, and accountability in higher education.",
        amount: "$75,000,000",
        amountMin: 50000,
        amountMax: 5000000,
        deadline: null,
        url: "https://www.luminafoundation.org/our-work/",
        type: "foundation",
        category: "education",
        eligibility: "Nonprofits, higher education institutions, state agencies, community organizations",
        state: "ALL",
        tags: ["education", "higher-education", "credentials", "attainment", "lumina"],
        source: "education-foundations",
        agencyName: "Lumina Foundation",
        sourceId: "lumina-education",
        sourceUrl: null,
        nofoUrl: null,
      },
      // === Spencer Foundation ===
      {
        title: "Spencer Foundation Research Grants",
        funder: "Spencer Foundation",
        description: "Supports rigorous education research that contributes to the improvement of education. Offers small, mid-size, and large research grants for both emerging and established scholars.",
        amount: "$30,000,000",
        amountMin: 50000,
        amountMax: 1000000,
        deadline: null,
        url: "https://www.spencer.org/grant-programs",
        type: "foundation",
        category: "education",
        eligibility: "Researchers at accredited universities and research institutions worldwide",
        state: "ALL",
        tags: ["education", "research", "spencer", "academic"],
        source: "education-foundations",
        agencyName: "Spencer Foundation",
        sourceId: "spencer-research",
        sourceUrl: null,
        nofoUrl: null,
      },
      // === Walton Family Foundation ===
      {
        title: "Walton Family Foundation K-12 Education Reform",
        funder: "Walton Family Foundation",
        description: "Invests in systemic K-12 education reform including charter schools, school choice, personalized learning, and innovative school design. One of the largest private funders of K-12 education.",
        amount: "$300,000,000",
        amountMin: 50000,
        amountMax: 10000000,
        deadline: null,
        url: "https://www.waltonfamilyfoundation.org/our-work/k-12-education",
        type: "foundation",
        category: "education",
        eligibility: "Charter management organizations, school districts, education nonprofits",
        state: "ALL",
        tags: ["education", "k-12", "charter", "school-choice", "walton"],
        source: "education-foundations",
        agencyName: "Walton Family Foundation",
        sourceId: "walton-k12",
        sourceUrl: null,
        nofoUrl: null,
      },
      // === Kresge Foundation ===
      {
        title: "Kresge Foundation Education Program",
        funder: "The Kresge Foundation",
        description: "Promotes postsecondary access and success for low-income, first-generation, and underrepresented students through institutional transformation, partnerships, and innovative practices.",
        amount: "$50,000,000",
        amountMin: 100000,
        amountMax: 3000000,
        deadline: null,
        url: "https://kresge.org/our-work/education/",
        type: "foundation",
        category: "education",
        eligibility: "Higher education institutions, community-based organizations, education intermediaries",
        state: "ALL",
        tags: ["education", "postsecondary", "access", "kresge", "equity"],
        source: "education-foundations",
        agencyName: "The Kresge Foundation",
        sourceId: "kresge-education",
        sourceUrl: null,
        nofoUrl: null,
      },
      // === Carnegie Corporation ===
      {
        title: "Carnegie Corporation Education Program",
        funder: "Carnegie Corporation of New York",
        description: "Supports research and innovation to improve K-12 education, strengthen teacher preparation, and advance education equity. Focuses on STEM learning, literacy, and integration of immigrants.",
        amount: "$40,000,000",
        amountMin: 100000,
        amountMax: 5000000,
        deadline: null,
        url: "https://www.carnegie.org/programs/education/",
        type: "foundation",
        category: "education",
        eligibility: "Universities, nonprofits, school districts, research organizations",
        state: "ALL",
        tags: ["education", "k-12", "teacher-preparation", "STEM", "carnegie"],
        source: "education-foundations",
        agencyName: "Carnegie Corporation of New York",
        sourceId: "carnegie-education",
        sourceUrl: null,
        nofoUrl: null,
      },
      // === Jack Kent Cooke Foundation ===
      {
        title: "Jack Kent Cooke Foundation Education Grants",
        funder: "Jack Kent Cooke Foundation",
        description: "Invests in removing barriers to educational opportunity for talented students with financial need. Focuses on K-12, undergraduate, and graduate educational access.",
        amount: "$20,000,000",
        amountMin: 100000,
        amountMax: 2000000,
        deadline: null,
        url: "https://www.jkcf.org/our-stories/category/grants/",
        type: "foundation",
        category: "education",
        eligibility: "Schools, school districts, nonprofits serving high-ability, low-income students",
        state: "ALL",
        tags: ["education", "low-income", "high-ability", "jkcf", "access"],
        source: "education-foundations",
        agencyName: "Jack Kent Cooke Foundation",
        sourceId: "jkcf-grants",
        sourceUrl: null,
        nofoUrl: null,
      },
      // === W.K. Kellogg Foundation ===
      {
        title: "Kellogg Foundation Education & Learning",
        funder: "W.K. Kellogg Foundation",
        description: "Supports education from early childhood through postsecondary with focus on racial equity, community engagement, and preparing children for school and life success.",
        amount: "$100,000,000",
        amountMin: 50000,
        amountMax: 5000000,
        deadline: null,
        url: "https://www.wkkf.org/what-we-do/education-and-learning/",
        type: "foundation",
        category: "education",
        eligibility: "Nonprofits, community organizations, educational institutions, tribal organizations",
        state: "ALL",
        tags: ["education", "early-childhood", "racial-equity", "kellogg"],
        source: "education-foundations",
        agencyName: "W.K. Kellogg Foundation",
        sourceId: "kellogg-education",
        sourceUrl: null,
        nofoUrl: null,
      },
      // === Bezos Family Foundation ===
      {
        title: "Bezos Family Foundation Education Initiatives",
        funder: "Bezos Family Foundation",
        description: "Supports programs that inspire and engage young people and help them develop into compassionate, creative, and engaged citizens through brain science-informed education approaches.",
        amount: "$50,000,000",
        amountMin: 100000,
        amountMax: 10000000,
        deadline: null,
        url: "https://www.bezosfamilyfoundation.org/",
        type: "foundation",
        category: "education",
        eligibility: "Education nonprofits, research institutions, youth development organizations",
        state: "ALL",
        tags: ["education", "youth-development", "brain-science", "bezos"],
        source: "education-foundations",
        agencyName: "Bezos Family Foundation",
        sourceId: "bezos-education",
        sourceUrl: null,
        nofoUrl: null,
      },
      // === Broad Foundation ===
      {
        title: "The Broad Foundation Urban Education",
        funder: "The Eli and Edythe Broad Foundation",
        description: "Invests in transforming K-12 urban education through better governance, management, and labor relations. Supports charter schools, leadership development, and systemic reform.",
        amount: "$60,000,000",
        amountMin: 250000,
        amountMax: 10000000,
        deadline: null,
        url: "https://broadfoundation.org/k-12-education/",
        type: "foundation",
        category: "education",
        eligibility: "Urban school districts, charter management organizations, education leadership programs",
        state: "ALL",
        tags: ["education", "urban", "k-12", "leadership", "broad"],
        source: "education-foundations",
        agencyName: "The Eli and Edythe Broad Foundation",
        sourceId: "broad-urban-ed",
        sourceUrl: null,
        nofoUrl: null,
      },
      // === National Science Foundation Education ===
      {
        title: "NSF Directorate for STEM Education (EDU)",
        funder: "National Science Foundation",
        description: "Supports research, development, and evaluation of innovative approaches to STEM education at all levels. Includes programs like IUSE, Noyce, and S-STEM.",
        amount: "$1,000,000,000",
        amountMin: 100000,
        amountMax: 10000000,
        deadline: null,
        url: "https://new.nsf.gov/edu",
        type: "federal",
        category: "education",
        eligibility: "Higher education institutions, nonprofits, school districts, state agencies",
        state: "ALL",
        tags: ["education", "STEM", "NSF", "research", "federal"],
        source: "education-foundations",
        agencyName: "National Science Foundation",
        sourceId: "nsf-edu-directorate",
        sourceUrl: null,
        nofoUrl: null,
      },
      // === Michael & Susan Dell Foundation ===
      {
        title: "Dell Foundation Urban Education",
        funder: "Michael & Susan Dell Foundation",
        description: "Focuses on improving educational outcomes for children and families living in urban poverty. Invests in college readiness, college success, and family financial stability.",
        amount: "$40,000,000",
        amountMin: 100000,
        amountMax: 5000000,
        deadline: null,
        url: "https://www.dell.org/our-work/education/",
        type: "foundation",
        category: "education",
        eligibility: "Nonprofits, school districts, higher education institutions in urban communities",
        state: "ALL",
        tags: ["education", "urban", "college-readiness", "dell"],
        source: "education-foundations",
        agencyName: "Michael & Susan Dell Foundation",
        sourceId: "dell-urban-ed",
        sourceUrl: null,
        nofoUrl: null,
      },
    ];
  }
}
