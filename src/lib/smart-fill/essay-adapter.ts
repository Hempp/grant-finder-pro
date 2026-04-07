import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

type StudentContentCategory =
  | "personal_statement"
  | "activities"
  | "work_experience"
  | "community_service"
  | "awards_honors"
  | "career_goals"
  | "challenges_overcome"
  | "leadership"
  | "research_experience"
  | "why_this_field"
  | "financial_need_statement"
  | "diversity_statement";

interface StudentProfile {
  firstName: string;
  lastName: string;
  major?: string | null;
  fieldOfStudy?: string | null;
  careerGoal?: string | null;
  schoolName: string;
  educationLevel: string;
}

interface ContentBlock {
  category: string;
  title: string;
  content: string;
}

interface EssayParams {
  essayPrompt: string;
  wordLimit?: number;
  scholarshipTitle: string;
  scholarshipProvider: string;
  scholarshipDescription: string;
  studentProfile: StudentProfile;
  contentBlocks: ContentBlock[];
}

interface EssayResult {
  essay: string;
  wordCount: number;
}

const PROMPT_CATEGORY_MAP: Array<{
  keywords: string[];
  categories: StudentContentCategory[];
}> = [
  {
    keywords: ["challenge", "overcome", "obstacle", "adversity", "struggle"],
    categories: ["challenges_overcome", "leadership"],
  },
  {
    keywords: ["community", "service", "volunteer", "give back"],
    categories: ["community_service", "leadership"],
  },
  {
    keywords: ["career", "goals", "future", "aspiration", "plan"],
    categories: ["career_goals", "why_this_field"],
  },
  {
    keywords: ["leadership", "lead", "leader"],
    categories: ["leadership", "activities"],
  },
  {
    keywords: ["who you are", "about yourself", "tell us about", "describe yourself"],
    categories: ["personal_statement", "activities"],
  },
  {
    keywords: ["research", "study", "academic"],
    categories: ["research_experience", "why_this_field"],
  },
  {
    keywords: ["financial", "need", "hardship", "afford"],
    categories: ["financial_need_statement"],
  },
  {
    keywords: ["diversity", "inclusion", "identity", "background", "culture"],
    categories: ["diversity_statement"],
  },
];

const DEFAULT_CATEGORIES: StudentContentCategory[] = [
  "personal_statement",
  "activities",
  "career_goals",
];

function determineRelevantCategories(
  essayPrompt: string
): StudentContentCategory[] {
  const promptLower = essayPrompt.toLowerCase();
  const matched = new Set<StudentContentCategory>();

  for (const mapping of PROMPT_CATEGORY_MAP) {
    if (mapping.keywords.some((kw) => promptLower.includes(kw))) {
      for (const cat of mapping.categories) {
        matched.add(cat);
      }
    }
  }

  if (matched.size === 0) {
    return DEFAULT_CATEGORIES;
  }

  return Array.from(matched);
}

function selectContentBlocks(
  blocks: ContentBlock[],
  categories: StudentContentCategory[],
  maxBlocks: number = 5
): ContentBlock[] {
  const relevant = blocks.filter((b) =>
    categories.includes(b.category as StudentContentCategory)
  );

  if (relevant.length > 0) {
    return relevant.slice(0, maxBlocks);
  }

  // Fallback: return whatever blocks are available
  return blocks.slice(0, maxBlocks);
}

export async function generateScholarshipEssay(
  params: EssayParams
): Promise<EssayResult> {
  const categories = determineRelevantCategories(params.essayPrompt);
  const selectedBlocks = selectContentBlocks(params.contentBlocks, categories);

  const wordLimit = params.wordLimit || 500;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Generate a scholarship essay for ${params.studentProfile.firstName} ${params.studentProfile.lastName}.

SCHOLARSHIP: ${params.scholarshipTitle} by ${params.scholarshipProvider}
SCHOLARSHIP DESCRIPTION: ${params.scholarshipDescription}

ESSAY PROMPT: ${params.essayPrompt}

WORD LIMIT: ${wordLimit} words

STUDENT PROFILE:
- School: ${params.studentProfile.schoolName}
- Education Level: ${params.studentProfile.educationLevel}
- Major: ${params.studentProfile.major || "Undeclared"}
- Field: ${params.studentProfile.fieldOfStudy || "Not specified"}
- Career Goal: ${params.studentProfile.careerGoal || "Not specified"}

STUDENT'S OWN WORDS AND EXPERIENCES:
${selectedBlocks.map((b) => `[${b.category}] ${b.title}\n${b.content}`).join("\n\n")}

INSTRUCTIONS:
- Write in FIRST PERSON as ${params.studentProfile.firstName}
- Use a personal, authentic narrative voice — NOT corporate or institutional
- Structure: Hook (opening scene/moment) → Story (specific experience) → Lesson (what was learned) → Connection (how this relates to the scholarship's mission)
- Draw specific details, names, dates, and numbers from the student's own content above
- Match the word limit precisely (within 10%)
- Be genuine and specific, not generic
- Reference the scholarship provider's values where natural
- Show, don't tell — use concrete scenes and moments
- DO NOT use AI clichés ("tapestry", "landscape", "journey", "ignited a passion")

Return ONLY the essay text, no headers or labels.`,
      },
    ],
  });

  const textBlock = response.content[0];
  if (textBlock.type !== "text") {
    throw new Error("Unexpected response format from AI");
  }

  const essay = textBlock.text.trim();
  const wordCount = essay.split(/\s+/).filter(Boolean).length;

  return { essay, wordCount };
}

export async function generateBatchEssays(params: {
  scholarships: Array<{
    id: string;
    essayPrompt: string | null;
    essayWordLimit: number | null;
    title: string;
    provider: string;
    description: string;
  }>;
  studentProfile: StudentProfile;
  contentBlocks: ContentBlock[];
}): Promise<Array<{ scholarshipId: string; essay: string; wordCount: number }>> {
  const results: Array<{
    scholarshipId: string;
    essay: string;
    wordCount: number;
  }> = [];

  for (const scholarship of params.scholarships) {
    const essayPrompt = scholarship.essayPrompt
      ? scholarship.essayPrompt
      : `Write a cover letter explaining why you are a strong candidate for the ${scholarship.title} scholarship and how it aligns with your academic and career goals.`;

    const result = await generateScholarshipEssay({
      essayPrompt,
      wordLimit: scholarship.essayWordLimit ?? 500,
      scholarshipTitle: scholarship.title,
      scholarshipProvider: scholarship.provider,
      scholarshipDescription: scholarship.description,
      studentProfile: params.studentProfile,
      contentBlocks: params.contentBlocks,
    });

    results.push({
      scholarshipId: scholarship.id,
      essay: result.essay,
      wordCount: result.wordCount,
    });
  }

  return results;
}
