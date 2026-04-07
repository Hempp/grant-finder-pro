import type { ScholarshipSource, ScrapedScholarship, ScholarshipFilters } from "./types";

export class FederalStudentAidSource implements ScholarshipSource {
  id = "federal-student-aid";
  name = "Federal Student Aid Programs";
  type = "federal" as const;

  isEnabled(): boolean {
    return true;
  }

  async scrape(_filters?: ScholarshipFilters): Promise<ScrapedScholarship[]> {
    return FEDERAL_AID_PROGRAMS;
  }
}

const FEDERAL_AID_PROGRAMS: ScrapedScholarship[] = [
  {
    title: "Federal Pell Grant",
    provider: "U.S. Department of Education",
    description:
      "The Pell Grant is the largest federal grant program for undergraduate students, providing need-based aid to low- and moderate-income students. Awards are based on Expected Family Contribution (EFC), cost of attendance, and enrollment status, with a maximum of $7,395 for 2024–25.",
    amount: "Up to $7,395/year",
    amountMin: 650,
    amountMax: 7395,
    deadline: new Date("2026-06-30"),
    url: "https://studentaid.gov/understand-aid/types/grants/pell",
    applicationUrl: "https://studentaid.gov/h/apply-for-aid/fafsa",
    scholarshipType: "need-based",
    renewable: true,
    educationLevels: ["undergraduate"],
    citizenshipRequired: "US Citizen or Eligible Non-Citizen",
    eligibilityText:
      "Must demonstrate financial need via FAFSA, be enrolled in an eligible degree program, and have not yet earned a bachelor's degree.",
    essayRequired: false,
    submissionMethod: "portal",
    portalUrl: "https://studentaid.gov/h/apply-for-aid/fafsa",
    tags: ["federal", "need-based", "grant", "FAFSA", "undergraduate", "largest-grant"],
    sourceId: "pell-grant",
    sourceUrl: "https://studentaid.gov/understand-aid/types/grants/pell",
  },
  {
    title: "Federal Supplemental Educational Opportunity Grant (FSEOG)",
    provider: "U.S. Department of Education",
    description:
      "FSEOG is a campus-based program providing grants to undergraduates with exceptional financial need, with priority given to students who also receive Pell Grants. Participating schools receive a limited allotment of funds each year, so awards are first-come, first-served.",
    amount: "$100–$4,000/year",
    amountMin: 100,
    amountMax: 4000,
    deadline: new Date("2026-06-30"),
    url: "https://studentaid.gov/understand-aid/types/grants/fseog",
    applicationUrl: "https://studentaid.gov/h/apply-for-aid/fafsa",
    scholarshipType: "need-based",
    renewable: true,
    educationLevels: ["undergraduate"],
    citizenshipRequired: "US Citizen or Eligible Non-Citizen",
    eligibilityText:
      "Must demonstrate exceptional financial need, receive a Pell Grant (priority), and be enrolled at a school that participates in the FSEOG program.",
    essayRequired: false,
    submissionMethod: "portal",
    portalUrl: "https://studentaid.gov/h/apply-for-aid/fafsa",
    tags: ["federal", "need-based", "grant", "FAFSA", "campus-based", "FSEOG"],
    sourceId: "fseog",
    sourceUrl: "https://studentaid.gov/understand-aid/types/grants/fseog",
  },
  {
    title: "TEACH Grant",
    provider: "U.S. Department of Education",
    description:
      "The Teacher Education Assistance for College and Higher Education (TEACH) Grant provides up to $4,000 per year to students who intend to teach full-time in high-need subjects in low-income schools. Recipients must fulfill a four-year teaching service obligation or the grant converts to a loan.",
    amount: "Up to $4,000/year",
    amountMin: 100,
    amountMax: 4000,
    deadline: new Date("2026-06-30"),
    url: "https://studentaid.gov/understand-aid/types/grants/teach",
    applicationUrl: "https://studentaid.gov/h/apply-for-aid/fafsa",
    scholarshipType: "service-obligation",
    renewable: true,
    educationLevels: ["undergraduate", "graduate"],
    fieldsOfStudy: [
      "education",
      "teaching",
      "mathematics",
      "science",
      "foreign language",
      "special education",
    ],
    citizenshipRequired: "US Citizen or Eligible Non-Citizen",
    eligibilityText:
      "Must plan to teach in a high-need field at a low-income school for at least 4 years after graduation. Academic performance or financial need qualification required.",
    essayRequired: false,
    submissionMethod: "portal",
    portalUrl: "https://studentaid.gov/h/apply-for-aid/fafsa",
    tags: ["federal", "teaching", "service-obligation", "FAFSA", "education", "STEM"],
    sourceId: "teach-grant",
    sourceUrl: "https://studentaid.gov/understand-aid/types/grants/teach",
  },
  {
    title: "Iraq and Afghanistan Service Grant",
    provider: "U.S. Department of Education",
    description:
      "The Iraq and Afghanistan Service Grant provides financial aid to students whose parent or guardian was a member of the U.S. armed forces who died in military service in Iraq or Afghanistan after September 11, 2001. The award amount equals the Pell Grant maximum for that award year.",
    amount: "Up to $7,395/year",
    amountMin: 1000,
    amountMax: 7395,
    deadline: new Date("2026-06-30"),
    url: "https://studentaid.gov/understand-aid/types/grants/iraq-afghanistan-service",
    applicationUrl: "https://studentaid.gov/h/apply-for-aid/fafsa",
    scholarshipType: "service-benefit",
    renewable: true,
    educationLevels: ["undergraduate"],
    citizenshipRequired: "US Citizen or Eligible Non-Citizen",
    eligibilityText:
      "Parent or guardian must have been a member of the U.S. armed forces who died as a result of service in Iraq or Afghanistan after September 11, 2001. Student must have been under 24 years old or enrolled in college when parent/guardian died.",
    essayRequired: false,
    submissionMethod: "portal",
    portalUrl: "https://studentaid.gov/h/apply-for-aid/fafsa",
    tags: ["federal", "military-family", "veteran", "service-member", "FAFSA", "9-11"],
    sourceId: "iraq-afghanistan-service-grant",
    sourceUrl: "https://studentaid.gov/understand-aid/types/grants/iraq-afghanistan-service",
  },
];
