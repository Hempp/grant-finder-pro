/**
 * Scholarship Matching Algorithm
 * Calculates personalized match scores between students and scholarships
 */

interface Student {
  educationLevel: string;
  fieldOfStudy: string | null;
  major: string | null;
  gpa: number | null;
  gpaScale: number | null;
  stateOfResidence: string | null;
  citizenship: string | null;
  financialNeed: string | null;
  firstGeneration: boolean;
  minority: boolean;
  veteran: boolean;
  careerGoal: string | null;
  extracurriculars: string | null;
}

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  description: string;
  scholarshipType: string;
  minGPA: number | null;
  educationLevels: string | null;
  fieldsOfStudy: string | null;
  citizenshipRequired: string | null;
  stateRestriction: string | null;
  tags: string | null;
}

interface MatchBreakdown {
  educationLevel: number;
  fieldOfStudy: number;
  gpa: number;
  location: number;
  demographics: number;
  keywords: number;
}

interface MatchResult {
  scholarshipId: string;
  score: number;
  breakdown: MatchBreakdown;
  reasons: string[];
}

/**
 * Safely parse a JSON string, returning null on failure
 */
export function parseJSON<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Calculate the education level score (0-100)
 * Hard disqualifier: if scholarship specifies levels and student doesn't match, return -1 (triggers 0)
 */
function calculateEducationLevelScore(student: Student, scholarship: Scholarship): number {
  const levels = parseJSON<string[]>(scholarship.educationLevels);

  // No restriction — perfect score
  if (!levels || levels.length === 0) return 100;

  // Hard disqualifier if student level not in list
  if (!levels.includes(student.educationLevel)) return -1;

  return 100;
}

/**
 * Calculate the field of study score (0-100)
 */
function calculateFieldOfStudyScore(student: Student, scholarship: Scholarship): number {
  const fields = parseJSON<string[]>(scholarship.fieldsOfStudy);

  // No restriction
  if (!fields || fields.length === 0) return 80;

  if (student.fieldOfStudy && fields.includes(student.fieldOfStudy)) return 100;

  return 20;
}

/**
 * Calculate GPA score (0-100)
 */
function calculateGPAScore(student: Student, scholarship: Scholarship): number {
  // No GPA requirement
  if (!scholarship.minGPA) return 80;

  // Student has no GPA on record
  if (student.gpa === null || student.gpa === undefined) return 50;

  // Normalise student GPA to 4.0 scale if needed
  let normalizedGPA = student.gpa;
  if (student.gpaScale && student.gpaScale !== 4.0) {
    normalizedGPA = (student.gpa / student.gpaScale) * 4.0;
  }

  // Also normalise minGPA: assume it's on a 4.0 scale
  const minGPA = scholarship.minGPA;

  if (normalizedGPA >= minGPA) return 100;

  return 0;
}

/**
 * Calculate location score (0-100)
 */
function calculateLocationScore(student: Student, scholarship: Scholarship): number {
  // No restriction — national scholarship
  if (!scholarship.stateRestriction) return 85;

  if (
    student.stateOfResidence &&
    student.stateOfResidence.toUpperCase() === scholarship.stateRestriction.toUpperCase()
  ) {
    return 100;
  }

  return 0;
}

/**
 * Calculate demographics score (0-100)
 * Base 60; boost to 100 when first-gen/minority/veteran matches scholarship tags
 */
function calculateDemographicsScore(student: Student, scholarship: Scholarship): number {
  let score = 60;

  const tags = parseJSON<string[]>(scholarship.tags) ?? [];
  const tagText = tags.join(" ").toLowerCase();

  if (student.firstGeneration && tagText.includes("first-gen")) {
    score = 100;
  }
  if (student.minority && (tagText.includes("minority") || tagText.includes("underrepresented"))) {
    score = 100;
  }
  if (student.veteran && tagText.includes("veteran")) {
    score = 100;
  }

  return score;
}

/**
 * Extract meaningful keywords from text (removes stop words, short tokens)
 */
function extractKeywords(text: string): Set<string> {
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
    "be", "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "must", "shall", "can", "need", "that", "this",
    "these", "those", "which", "who", "whom", "whose", "what", "where", "when",
    "why", "how", "all", "each", "every", "both", "few", "more", "most",
    "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so",
    "than", "too", "very", "just", "also", "now", "our", "your", "their",
    "its", "we", "you", "they", "he", "she", "it", "i", "me",
  ]);

  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))
  );
}

/**
 * Calculate keyword similarity score using Jaccard similarity (0-100)
 * Formula: 40 + similarity * 200, capped at 100
 */
function calculateKeywordsScore(student: Student, scholarship: Scholarship): number {
  // Build extracurricular text
  const extracurriculars = parseJSON<Array<{ name: string; role?: string }>>(
    student.extracurriculars
  );
  const extracurricularText = extracurriculars
    ? extracurriculars.map((e) => `${e.name} ${e.role ?? ""}`).join(" ")
    : "";

  const studentText = [
    student.major ?? "",
    student.fieldOfStudy ?? "",
    student.careerGoal ?? "",
    extracurricularText,
  ].join(" ");

  const tags = parseJSON<string[]>(scholarship.tags) ?? [];
  const scholarshipText = [
    scholarship.title,
    scholarship.description ?? "",
    tags.join(" "),
  ].join(" ");

  const studentWords = extractKeywords(studentText);
  const scholarshipWords = extractKeywords(scholarshipText);

  if (studentWords.size === 0 || scholarshipWords.size === 0) return 40;

  const intersection = new Set([...studentWords].filter((w) => scholarshipWords.has(w)));
  const union = new Set([...studentWords, ...scholarshipWords]);

  const similarity = intersection.size / union.size;

  return Math.min(100, Math.round(40 + similarity * 200));
}

/**
 * Generate human-readable match reasons
 */
function generateReasons(
  student: Student,
  scholarship: Scholarship,
  breakdown: MatchBreakdown
): string[] {
  const reasons: string[] = [];

  if (breakdown.educationLevel === 100) {
    reasons.push("Education level matches scholarship requirements");
  }
  if (breakdown.fieldOfStudy === 100) {
    reasons.push(`Field of study (${student.fieldOfStudy}) matches scholarship focus`);
  }
  if (breakdown.gpa === 100) {
    reasons.push(`GPA of ${student.gpa} meets the minimum requirement of ${scholarship.minGPA}`);
  }
  if (breakdown.location >= 85) {
    if (!scholarship.stateRestriction) {
      reasons.push("National scholarship — available in all states");
    } else {
      reasons.push(`State of residence (${student.stateOfResidence}) matches scholarship restriction`);
    }
  }
  if (breakdown.demographics === 100) {
    reasons.push("Demographic profile matches scholarship's target population");
  }
  if (breakdown.keywords >= 70) {
    reasons.push("Strong keyword alignment between your profile and scholarship focus");
  }

  if (reasons.length === 0) {
    reasons.push("Potential opportunity — review full eligibility criteria");
  }

  return reasons;
}

/**
 * Calculate match score between a student and a scholarship
 */
export function calculateScholarshipMatch(
  student: Student,
  scholarship: Scholarship
): MatchResult {
  // --- Hard disqualifiers ---

  // Education level
  const eduScore = calculateEducationLevelScore(student, scholarship);
  if (eduScore === -1) {
    return {
      scholarshipId: scholarship.id,
      score: 0,
      breakdown: {
        educationLevel: 0,
        fieldOfStudy: 0,
        gpa: 0,
        location: 0,
        demographics: 0,
        keywords: 0,
      },
      reasons: ["Education level does not match scholarship requirements"],
    };
  }

  // GPA below minimum — hard disqualifier
  if (
    scholarship.minGPA !== null &&
    scholarship.minGPA !== undefined &&
    student.gpa !== null &&
    student.gpa !== undefined
  ) {
    let normalizedGPA = student.gpa;
    if (student.gpaScale && student.gpaScale !== 4.0) {
      normalizedGPA = (student.gpa / student.gpaScale) * 4.0;
    }
    if (normalizedGPA < scholarship.minGPA) {
      return {
        scholarshipId: scholarship.id,
        score: 0,
        breakdown: {
          educationLevel: eduScore,
          fieldOfStudy: 0,
          gpa: 0,
          location: 0,
          demographics: 0,
          keywords: 0,
        },
        reasons: [`GPA of ${student.gpa} is below the minimum requirement of ${scholarship.minGPA}`],
      };
    }
  }

  // Citizenship
  if (
    scholarship.citizenshipRequired === "us_citizen" &&
    student.citizenship === "international"
  ) {
    return {
      scholarshipId: scholarship.id,
      score: 0,
      breakdown: {
        educationLevel: 0,
        fieldOfStudy: 0,
        gpa: 0,
        location: 0,
        demographics: 0,
        keywords: 0,
      },
      reasons: ["Citizenship requirement not met — scholarship requires US citizenship"],
    };
  }

  // --- Weighted scoring ---
  const breakdown: MatchBreakdown = {
    educationLevel: eduScore,
    fieldOfStudy: calculateFieldOfStudyScore(student, scholarship),
    gpa: calculateGPAScore(student, scholarship),
    location: calculateLocationScore(student, scholarship),
    demographics: calculateDemographicsScore(student, scholarship),
    keywords: calculateKeywordsScore(student, scholarship),
  };

  const weights = {
    educationLevel: 0.20,
    fieldOfStudy: 0.20,
    gpa: 0.15,
    location: 0.15,
    demographics: 0.10,
    keywords: 0.20,
  };

  const rawScore =
    breakdown.educationLevel * weights.educationLevel +
    breakdown.fieldOfStudy * weights.fieldOfStudy +
    breakdown.gpa * weights.gpa +
    breakdown.location * weights.location +
    breakdown.demographics * weights.demographics +
    breakdown.keywords * weights.keywords;

  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  return {
    scholarshipId: scholarship.id,
    score,
    breakdown,
    reasons: generateReasons(student, scholarship, breakdown),
  };
}

/**
 * Batch match scholarships to a student
 * Returns scholarships sorted by score descending, filtered to score > 0
 */
export function matchScholarshipsToStudent(
  student: Student,
  scholarships: Scholarship[],
  limit = 50
): MatchResult[] {
  return scholarships
    .map((s) => calculateScholarshipMatch(student, s))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
