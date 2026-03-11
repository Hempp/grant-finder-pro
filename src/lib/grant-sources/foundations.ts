import { GrantSource, ScrapedGrant } from "./types";

interface FoundationGrantEntry {
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
  tags: string[];
  sourceId: string;
}

const FOUNDATION_GRANTS: FoundationGrantEntry[] = [
  // Gates Foundation
  {
    title: "Bill & Melinda Gates Foundation Grand Challenges",
    funder: "Bill & Melinda Gates Foundation",
    description:
      "Grand Challenges grants for bold ideas in global health, development, and education. Supports innovative approaches to solve persistent challenges in infectious diseases, nutrition, sanitation, and agricultural development.",
    amount: "$100,000 - $2,000,000",
    amountMin: 100000,
    amountMax: 2000000,
    deadline: null,
    url: "https://gcgh.grandchallenges.org/",
    category: "Global Health",
    eligibility: "Researchers, nonprofits, and social enterprises worldwide",
    tags: ["global-health", "innovation", "development", "gates"],
    sourceId: "gates-grand-challenges",
  },
  {
    title: "Gates Foundation Education Innovation Grants",
    funder: "Bill & Melinda Gates Foundation",
    description:
      "Grants supporting K-12 education innovations, college readiness programs, and postsecondary success initiatives in the United States.",
    amount: "$50,000 - $1,000,000",
    amountMin: 50000,
    amountMax: 1000000,
    deadline: null,
    url: "https://www.gatesfoundation.org/about/how-we-work/grant-opportunities",
    category: "Education",
    eligibility: "U.S. nonprofits, schools, and educational organizations",
    tags: ["education", "k-12", "college-readiness", "gates"],
    sourceId: "gates-education",
  },
  // Ford Foundation
  {
    title: "Ford Foundation Civic Engagement & Governance",
    funder: "Ford Foundation",
    description:
      "Grants to strengthen democratic values, civic participation, and effective governance. Supports organizations working on voting rights, government accountability, and civic infrastructure.",
    amount: "$100,000 - $5,000,000",
    amountMin: 100000,
    amountMax: 5000000,
    deadline: null,
    url: "https://www.fordfoundation.org/work/our-grants/",
    category: "Civic Engagement",
    eligibility: "Nonprofits working on democratic participation and governance",
    tags: ["civic", "governance", "democracy", "ford"],
    sourceId: "ford-civic",
  },
  {
    title: "Ford Foundation Creativity & Free Expression",
    funder: "Ford Foundation",
    description:
      "Grants supporting artists, cultural institutions, and media organizations that advance social justice narratives and promote diverse creative expression.",
    amount: "$50,000 - $2,000,000",
    amountMin: 50000,
    amountMax: 2000000,
    deadline: null,
    url: "https://www.fordfoundation.org/work/our-grants/",
    category: "Arts & Culture",
    eligibility: "Arts organizations, cultural institutions, and media nonprofits",
    tags: ["arts", "culture", "media", "social-justice", "ford"],
    sourceId: "ford-creativity",
  },
  // MacArthur Foundation
  {
    title: "MacArthur Foundation Big Bets",
    funder: "John D. and Catherine T. MacArthur Foundation",
    description:
      "Large-scale grants addressing critical issues including climate change, nuclear risk, criminal justice reform, and investigative journalism. Supports transformative solutions to society's most pressing problems.",
    amount: "$500,000 - $10,000,000",
    amountMin: 500000,
    amountMax: 10000000,
    deadline: null,
    url: "https://www.macfound.org/programs/",
    category: "Social Impact",
    eligibility: "Nonprofits, research institutions, and advocacy organizations",
    tags: ["climate", "justice", "journalism", "macarthur"],
    sourceId: "macarthur-big-bets",
  },
  // Kresge Foundation
  {
    title: "Kresge Foundation Arts & Culture Program",
    funder: "The Kresge Foundation",
    description:
      "Grants to foster creative placemaking, support cultural institutions in underserved communities, and strengthen the role of arts in community development.",
    amount: "$50,000 - $500,000",
    amountMin: 50000,
    amountMax: 500000,
    deadline: null,
    url: "https://kresge.org/our-work/arts-culture/",
    category: "Arts & Culture",
    eligibility: "Nonprofits and cultural organizations in underserved communities",
    tags: ["arts", "culture", "placemaking", "community", "kresge"],
    sourceId: "kresge-arts",
  },
  {
    title: "Kresge Foundation Health Program",
    funder: "The Kresge Foundation",
    description:
      "Grants promoting health equity, addressing social determinants of health, and building healthy environments in low-income communities.",
    amount: "$100,000 - $1,000,000",
    amountMin: 100000,
    amountMax: 1000000,
    deadline: null,
    url: "https://kresge.org/our-work/health/",
    category: "Healthcare",
    eligibility: "Health-focused nonprofits and community organizations",
    tags: ["health-equity", "community-health", "social-determinants", "kresge"],
    sourceId: "kresge-health",
  },
  // Robert Wood Johnson Foundation
  {
    title: "Robert Wood Johnson Foundation Culture of Health",
    funder: "Robert Wood Johnson Foundation",
    description:
      "Grants building a culture of health in America through evidence-based programs, health equity initiatives, and systems-level change in communities.",
    amount: "$100,000 - $3,000,000",
    amountMin: 100000,
    amountMax: 3000000,
    deadline: null,
    url: "https://www.rwjf.org/en/grants.html",
    category: "Healthcare",
    eligibility: "U.S. nonprofits, universities, and government agencies",
    tags: ["health-equity", "public-health", "community", "rwjf"],
    sourceId: "rwjf-culture-health",
  },
  // Kauffman Foundation
  {
    title: "Kauffman Foundation Entrepreneurship Grants",
    funder: "Ewing Marion Kauffman Foundation",
    description:
      "Grants supporting entrepreneurship ecosystems, startup education, and economic mobility through business creation. Focus on underrepresented founders.",
    amount: "$50,000 - $500,000",
    amountMin: 50000,
    amountMax: 500000,
    deadline: null,
    url: "https://www.kauffman.org/grants/",
    category: "Entrepreneurship",
    eligibility: "Nonprofits, accelerators, and entrepreneurship support organizations",
    tags: ["entrepreneurship", "startups", "economic-mobility", "kauffman"],
    sourceId: "kauffman-entrepreneurship",
  },
  // Knight Foundation
  {
    title: "Knight Foundation Community & National Programs",
    funder: "John S. and James L. Knight Foundation",
    description:
      "Grants for informed and engaged communities through journalism, arts, technology, and civic engagement. Supports local news, community foundations, and public spaces.",
    amount: "$25,000 - $2,000,000",
    amountMin: 25000,
    amountMax: 2000000,
    deadline: null,
    url: "https://knightfoundation.org/apply/",
    category: "Community",
    eligibility: "Nonprofits focused on journalism, arts, or technology for civic good",
    tags: ["journalism", "civic-tech", "community", "knight"],
    sourceId: "knight-community",
  },
  // Bloomberg Philanthropies
  {
    title: "Bloomberg Philanthropies Mayors Challenge",
    funder: "Bloomberg Philanthropies",
    description:
      "Competition for cities to develop innovative solutions to urban challenges. Winning cities receive funding and support to implement bold ideas in public health, climate, and economic development.",
    amount: "$1,000,000 - $5,000,000",
    amountMin: 1000000,
    amountMax: 5000000,
    deadline: null,
    url: "https://www.bloomberg.org/government-innovation/mayors-challenge/",
    category: "Government Innovation",
    eligibility: "U.S. cities and municipalities",
    tags: ["cities", "innovation", "urban", "bloomberg"],
    sourceId: "bloomberg-mayors",
  },
  // Skoll Foundation
  {
    title: "Skoll Foundation Social Entrepreneurship Awards",
    funder: "Skoll Foundation",
    description:
      "Awards for social entrepreneurs driving large-scale change in critical issues including climate, health, education, and economic equity.",
    amount: "$500,000 - $1,500,000",
    amountMin: 500000,
    amountMax: 1500000,
    deadline: null,
    url: "https://skoll.org/about/skoll-awards/",
    category: "Social Enterprise",
    eligibility: "Social enterprises with proven impact models",
    tags: ["social-enterprise", "impact", "scaling", "skoll"],
    sourceId: "skoll-social-entrepreneurs",
  },
  // Rockefeller Foundation
  {
    title: "Rockefeller Foundation Food System Vision Prize",
    funder: "The Rockefeller Foundation",
    description:
      "Grants supporting regenerative and nourishing food systems. Focus on reducing food waste, improving nutrition access, and building resilient agricultural supply chains.",
    amount: "$200,000 - $2,000,000",
    amountMin: 200000,
    amountMax: 2000000,
    deadline: null,
    url: "https://www.rockefellerfoundation.org/food/",
    category: "Agriculture",
    eligibility: "Nonprofits, social enterprises, and research institutions",
    tags: ["food-systems", "agriculture", "nutrition", "rockefeller"],
    sourceId: "rockefeller-food",
  },
  // W.K. Kellogg Foundation
  {
    title: "W.K. Kellogg Foundation Racial Equity Grants",
    funder: "W.K. Kellogg Foundation",
    description:
      "Grants advancing racial equity and healing in communities, supporting children and families, and building equitable systems in education, food, and civic life.",
    amount: "$50,000 - $1,000,000",
    amountMin: 50000,
    amountMax: 1000000,
    deadline: null,
    url: "https://www.wkkf.org/grants",
    category: "Racial Equity",
    eligibility: "Nonprofits focused on racial equity and child/family well-being",
    tags: ["racial-equity", "children", "families", "kellogg"],
    sourceId: "kellogg-racial-equity",
  },
  // Walton Family Foundation
  {
    title: "Walton Family Foundation Environmental Program",
    funder: "Walton Family Foundation",
    description:
      "Grants for freshwater conservation, ocean health, and environmental sustainability. Supports market-based solutions for natural resource management.",
    amount: "$100,000 - $3,000,000",
    amountMin: 100000,
    amountMax: 3000000,
    deadline: null,
    url: "https://www.waltonfamilyfoundation.org/our-work/environment",
    category: "Environmental",
    eligibility: "Environmental nonprofits and conservation organizations",
    tags: ["environment", "conservation", "water", "walton"],
    sourceId: "walton-environment",
  },
];

export class FoundationsSource implements GrantSource {
  id = "foundations";
  name = "Major Foundations";
  type = "foundation" as const;

  isEnabled(): boolean {
    return true;
  }

  async scrape(): Promise<ScrapedGrant[]> {
    return FOUNDATION_GRANTS.map((entry) => ({
      title: entry.title,
      funder: entry.funder,
      description: entry.description,
      amount: entry.amount,
      amountMin: entry.amountMin,
      amountMax: entry.amountMax,
      deadline: entry.deadline,
      url: entry.url,
      type: "foundation" as const,
      category: entry.category,
      eligibility: entry.eligibility,
      state: "ALL",
      tags: entry.tags,
      source: "foundation",
      agencyName: entry.funder,
      sourceId: entry.sourceId,
      sourceUrl: entry.url,
      nofoUrl: null,
    }));
  }
}
