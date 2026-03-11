import { GrantSource, ScrapedGrant } from "./types";

interface CorporateGrantEntry {
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

const CORPORATE_GRANTS: CorporateGrantEntry[] = [
  // Google
  {
    title: "Google.org Impact Challenge",
    funder: "Google.org",
    description:
      "Grants for nonprofits and social enterprises using technology to tackle the world's biggest challenges. Focus areas include AI for social good, climate, and economic opportunity.",
    amount: "$250,000 - $2,000,000",
    amountMin: 250000,
    amountMax: 2000000,
    deadline: null,
    url: "https://impactchallenge.withgoogle.com/",
    category: "Technology",
    eligibility: "Nonprofits and social enterprises using technology for impact",
    tags: ["technology", "ai", "social-good", "google"],
    sourceId: "google-impact-challenge",
  },
  {
    title: "Google for Startups Cloud Program",
    funder: "Google Cloud",
    description:
      "Up to $200K in Google Cloud credits, technical training, and mentorship for early-stage startups building with cloud and AI technologies.",
    amount: "Up to $200,000",
    amountMin: null,
    amountMax: 200000,
    deadline: null,
    url: "https://cloud.google.com/startup",
    category: "Technology",
    eligibility: "Startups with up to Series A funding",
    tags: ["cloud", "startup", "google", "credits"],
    sourceId: "google-startups-cloud",
  },
  // Microsoft
  {
    title: "Microsoft AI for Good Grants",
    funder: "Microsoft Philanthropies",
    description:
      "Grants providing Azure cloud credits, AI tools, and technical support to organizations working on humanitarian, environmental, accessibility, and cultural heritage challenges.",
    amount: "$50,000 - $500,000",
    amountMin: 50000,
    amountMax: 500000,
    deadline: null,
    url: "https://www.microsoft.com/en-us/ai/ai-for-good",
    category: "Technology",
    eligibility: "Nonprofits, universities, and research organizations",
    tags: ["ai", "cloud", "humanitarian", "microsoft"],
    sourceId: "microsoft-ai-good",
  },
  {
    title: "Microsoft for Startups Founders Hub",
    funder: "Microsoft",
    description:
      "Up to $150K in Azure credits, free access to development tools, mentoring from Microsoft experts, and connections to investors for startups at any stage.",
    amount: "Up to $150,000",
    amountMin: null,
    amountMax: 150000,
    deadline: null,
    url: "https://www.microsoft.com/en-us/startups",
    category: "Technology",
    eligibility: "Startups building B2B or B2C products at any stage",
    tags: ["azure", "startup", "microsoft", "credits"],
    sourceId: "microsoft-founders-hub",
  },
  // Amazon / AWS
  {
    title: "AWS Activate Program",
    funder: "Amazon Web Services",
    description:
      "AWS credits, technical support, and training for startups. Includes up to $100K in credits for portfolio startups and $10K for self-service applicants.",
    amount: "$10,000 - $100,000",
    amountMin: 10000,
    amountMax: 100000,
    deadline: null,
    url: "https://aws.amazon.com/activate/",
    category: "Technology",
    eligibility: "Startups that are unfunded or funded up to Series A",
    tags: ["aws", "cloud", "startup", "amazon"],
    sourceId: "aws-activate",
  },
  {
    title: "Amazon Climate Pledge Fund",
    funder: "Amazon",
    description:
      "Venture investments and grants for companies developing climate technologies and sustainability solutions that help achieve net-zero carbon by 2040.",
    amount: "$500,000 - $10,000,000",
    amountMin: 500000,
    amountMax: 10000000,
    deadline: null,
    url: "https://www.amazon.com/climatepledgefund",
    category: "Clean Energy",
    eligibility: "Climate tech companies and sustainability-focused startups",
    tags: ["climate", "sustainability", "cleantech", "amazon"],
    sourceId: "amazon-climate-pledge",
  },
  // Salesforce
  {
    title: "Salesforce.org Community Grants",
    funder: "Salesforce.org",
    description:
      "Grants of Salesforce product licenses, implementation support, and funding for nonprofits and educational institutions to accelerate their digital transformation.",
    amount: "$10,000 - $250,000",
    amountMin: 10000,
    amountMax: 250000,
    deadline: null,
    url: "https://www.salesforce.org/",
    category: "Technology",
    eligibility: "Nonprofits and educational institutions",
    tags: ["crm", "nonprofit-tech", "digital", "salesforce"],
    sourceId: "salesforce-community",
  },
  // NVIDIA
  {
    title: "NVIDIA Inception Program",
    funder: "NVIDIA",
    description:
      "Program for AI, data science, and HPC startups offering GPU cloud credits, deep learning training, co-marketing support, and investor connections.",
    amount: "Up to $100,000",
    amountMin: null,
    amountMax: 100000,
    deadline: null,
    url: "https://www.nvidia.com/en-us/startups/",
    category: "Technology",
    eligibility: "AI and deep learning startups",
    tags: ["ai", "gpu", "deep-learning", "nvidia"],
    sourceId: "nvidia-inception",
  },
  // Patagonia
  {
    title: "Patagonia Environmental Grants",
    funder: "Patagonia",
    description:
      "Grants for grassroots environmental organizations working on the root causes of environmental crisis. Focuses on biodiversity, climate, communities, land, and water.",
    amount: "$5,000 - $200,000",
    amountMin: 5000,
    amountMax: 200000,
    deadline: null,
    url: "https://www.patagonia.com/actionworks/grants/",
    category: "Environmental",
    eligibility: "Grassroots environmental activist organizations",
    tags: ["environmental", "grassroots", "activism", "patagonia"],
    sourceId: "patagonia-environmental",
  },
  // Walmart
  {
    title: "Walmart Foundation Community Grants",
    funder: "Walmart Foundation",
    description:
      "Local community grants supporting hunger relief, workforce development, disaster preparedness, and community resilience near Walmart store locations.",
    amount: "$250 - $5,000",
    amountMin: 250,
    amountMax: 5000,
    deadline: null,
    url: "https://walmart.org/how-we-give/local-community-grants",
    category: "Community",
    eligibility: "Nonprofits near Walmart facilities",
    tags: ["community", "hunger", "workforce", "walmart"],
    sourceId: "walmart-community",
  },
  {
    title: "Walmart Foundation National Giving Program",
    funder: "Walmart Foundation",
    description:
      "Large-scale grants for workforce development, economic opportunity, and sustainability programs operating at the national level across the United States.",
    amount: "$250,000 - $5,000,000",
    amountMin: 250000,
    amountMax: 5000000,
    deadline: null,
    url: "https://walmart.org/how-we-give",
    category: "Workforce Development",
    eligibility: "National nonprofits focused on workforce and economic opportunity",
    tags: ["workforce", "economic-opportunity", "sustainability", "walmart"],
    sourceId: "walmart-national",
  },
  // Wells Fargo
  {
    title: "Wells Fargo Open for Business Fund",
    funder: "Wells Fargo",
    description:
      "Grants for small business support programs, particularly those serving diverse-owned businesses, providing technical assistance, mentoring, and capital access.",
    amount: "$50,000 - $500,000",
    amountMin: 50000,
    amountMax: 500000,
    deadline: null,
    url: "https://www.wellsfargo.com/about/corporate-responsibility/community-giving/",
    category: "Small Business",
    eligibility: "CDFIs and small business support organizations",
    tags: ["small-business", "diverse-owned", "cdfi", "wells-fargo"],
    sourceId: "wells-fargo-business",
  },
  // Cisco
  {
    title: "Cisco Global Impact Cash Grants",
    funder: "Cisco Foundation",
    description:
      "Grants for nonprofits using technology to address critical human needs including economic empowerment, education, crisis response, and digital inclusion.",
    amount: "$50,000 - $500,000",
    amountMin: 50000,
    amountMax: 500000,
    deadline: null,
    url: "https://www.cisco.com/c/en/us/about/csr/community/nonprofits.html",
    category: "Technology",
    eligibility: "Nonprofits leveraging technology for social impact",
    tags: ["technology", "digital-inclusion", "education", "cisco"],
    sourceId: "cisco-impact",
  },
  // Intel
  {
    title: "Intel Foundation STEM Education Grants",
    funder: "Intel Foundation",
    description:
      "Grants supporting STEM education programs, particularly those increasing participation of women and underrepresented minorities in science, technology, engineering, and mathematics.",
    amount: "$10,000 - $250,000",
    amountMin: 10000,
    amountMax: 250000,
    deadline: null,
    url: "https://www.intel.com/content/www/us/en/corporate-responsibility/social-impact.html",
    category: "Education",
    eligibility: "Educational nonprofits and STEM-focused organizations",
    tags: ["stem", "education", "diversity", "intel"],
    sourceId: "intel-stem",
  },
];

export class CorporateGrantsSource implements GrantSource {
  id = "corporate";
  name = "Corporate Grants";
  type = "corporate" as const;

  isEnabled(): boolean {
    return true;
  }

  async scrape(): Promise<ScrapedGrant[]> {
    return CORPORATE_GRANTS.map((entry) => ({
      title: entry.title,
      funder: entry.funder,
      description: entry.description,
      amount: entry.amount,
      amountMin: entry.amountMin,
      amountMax: entry.amountMax,
      deadline: entry.deadline,
      url: entry.url,
      type: "corporate" as const,
      category: entry.category,
      eligibility: entry.eligibility,
      state: "ALL",
      tags: entry.tags,
      source: "corporate",
      agencyName: entry.funder,
      sourceId: entry.sourceId,
      sourceUrl: entry.url,
      nofoUrl: null,
    }));
  }
}
