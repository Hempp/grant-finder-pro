// Types for the Auto-Apply system

export type SectionType =
  | 'narrative'
  | 'short_answer'
  | 'budget'
  | 'attachment'
  | 'checkbox'
  | 'select'
  | 'table'
  | 'contact_info';

export type FunderType = 'federal' | 'foundation' | 'corporate' | 'state';

export interface ApplicationSection {
  id: string;
  type: SectionType;
  title: string;
  instructions: string;
  required: boolean;
  wordLimit?: number;
  characterLimit?: number;
  evaluationCriteria?: string[];
  relatedProfileFields: string[];
  order: number;
}

export interface ResponseData {
  sectionId: string;
  content: string;
  aiGenerated: boolean;
  userEdited: boolean;
  wordCount: number;
  confidenceScore: number; // 0-100
  sourceReferences: string[]; // which docs/profile fields were used
  needsUserInput: boolean;
  userInputPrompt?: string; // what specific info is missing
  generatedAt: string;
}

export interface Suggestion {
  sectionId: string;
  type: 'improvement' | 'warning' | 'missing_info';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export interface UserContext {
  organization: {
    name: string;
    type: string | null;
    legalStructure: string | null;
    ein: string | null;
    website: string | null;
    city: string | null;
    state: string | null;
    mission: string | null;
    vision: string | null;
    problemStatement: string | null;
    solution: string | null;
    targetMarket: string | null;
    teamSize: string | null;
    founderBackground: string | null;
    annualRevenue: string | null;
    fundingSeeking: string | null;
    previousFunding: string | null;
  } | null;
  documents: {
    id: string;
    name: string;
    type: string;
    parsedData: string | null;
  }[];
  previousApplications: {
    id: string;
    grantTitle: string;
    narrative: string | null;
    responses: string | null;
    status: string;
  }[];
}

export interface GrantContext {
  id: string;
  title: string;
  funder: string;
  description: string | null;
  amount: string | null;
  amountMin: number | null;
  amountMax: number | null;
  deadline: Date | null;
  type: string | null; // federal, foundation, etc.
  category: string | null;
  eligibility: string | null;
  requirements: string | null;
  url: string | null;
}

export interface SectionMapping {
  sectionId: string;
  strategy: 'direct' | 'adapt' | 'generate' | 'missing';
  sourceFields: string[];
  relevanceScore: number; // 0-100
  notes?: string;
}

export interface GenerationResult {
  sections: ApplicationSection[];
  responses: Record<string, ResponseData>;
  completionScore: number;
  overallConfidence: number;
  missingRequirements: string[];
  suggestions: Suggestion[];
}

export interface ApplicationDraft {
  id: string;
  applicationId: string;
  sections: ApplicationSection[];
  responses: Record<string, ResponseData>;
  completionScore: number;
  overallConfidence: number;
  missingRequirements: string[];
  suggestions: Suggestion[];
  funderType: FunderType | string;
  createdAt?: string;
  updatedAt?: string;
}

// Grant writing tone configurations by funder type
export const FUNDER_TONE_CONFIG: Record<FunderType, {
  tone: string;
  emphasis: string[];
  avoid: string[];
}> = {
  federal: {
    tone: 'Technical, rigorous, and methodologically detailed',
    emphasis: [
      'Innovation and scientific merit',
      'Broader impacts',
      'Clear methodology and timeline',
      'Budget justification',
      'Measurable outcomes',
      'Alignment with agency priorities'
    ],
    avoid: [
      'Vague claims without evidence',
      'Marketing language',
      'Emotional appeals',
      'Undefined acronyms'
    ]
  },
  foundation: {
    tone: 'Mission-driven storytelling with impact focus',
    emphasis: [
      'Connection to foundation mission',
      'Human impact and stories',
      'Sustainability plan',
      'Community engagement',
      'Outcomes over outputs'
    ],
    avoid: [
      'Overly technical jargon',
      'Ignoring foundation priorities',
      'Short-term thinking only'
    ]
  },
  corporate: {
    tone: 'Business-oriented with ROI focus',
    emphasis: [
      'Return on investment',
      'Scalability',
      'Brand alignment',
      'Measurable metrics',
      'Market potential'
    ],
    avoid: [
      'Academic language',
      'Ignoring business value',
      'Unrealistic projections'
    ]
  },
  state: {
    tone: 'Local impact focused with practical applications',
    emphasis: [
      'State/local benefits',
      'Job creation',
      'Economic development',
      'Compliance with regulations',
      'Partnerships with local organizations'
    ],
    avoid: [
      'Ignoring local context',
      'Generic approaches',
      'Missing state-specific requirements'
    ]
  }
};

// Standard section templates for different grant types
export const SECTION_TEMPLATES: Record<string, ApplicationSection[]> = {
  sbir_phase1: [
    {
      id: 'executive_summary',
      type: 'narrative',
      title: 'Executive Summary',
      instructions: 'Provide a brief overview of the proposed project including the problem, solution, and expected outcomes.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: ['mission', 'solution', 'problemStatement'],
      order: 1
    },
    {
      id: 'problem_statement',
      type: 'narrative',
      title: 'Problem Statement',
      instructions: 'Describe the problem being addressed, its significance, and current limitations.',
      required: true,
      wordLimit: 1000,
      evaluationCriteria: ['Clarity of problem', 'Market need', 'Innovation opportunity'],
      relatedProfileFields: ['problemStatement', 'targetMarket'],
      order: 2
    },
    {
      id: 'technical_approach',
      type: 'narrative',
      title: 'Technical Approach',
      instructions: 'Detail your methodology, research plan, and technical objectives.',
      required: true,
      wordLimit: 3000,
      evaluationCriteria: ['Technical merit', 'Feasibility', 'Innovation'],
      relatedProfileFields: ['solution'],
      order: 3
    },
    {
      id: 'team_qualifications',
      type: 'narrative',
      title: 'Team Qualifications',
      instructions: 'Describe key personnel qualifications and relevant experience.',
      required: true,
      wordLimit: 1000,
      evaluationCriteria: ['Relevant expertise', 'Track record'],
      relatedProfileFields: ['founderBackground', 'teamSize'],
      order: 4
    },
    {
      id: 'commercialization',
      type: 'narrative',
      title: 'Commercialization Plan',
      instructions: 'Outline your path to market including customers, competition, and revenue model.',
      required: true,
      wordLimit: 1500,
      evaluationCriteria: ['Market understanding', 'Business model viability'],
      relatedProfileFields: ['targetMarket', 'annualRevenue'],
      order: 5
    },
    {
      id: 'budget_narrative',
      type: 'budget',
      title: 'Budget Narrative',
      instructions: 'Justify all proposed costs and explain how they support project objectives.',
      required: true,
      wordLimit: 1000,
      relatedProfileFields: ['fundingSeeking'],
      order: 6
    }
  ],
  foundation_general: [
    {
      id: 'organization_overview',
      type: 'narrative',
      title: 'Organization Overview',
      instructions: 'Describe your organization, its mission, and relevant history.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: ['name', 'mission', 'vision'],
      order: 1
    },
    {
      id: 'statement_of_need',
      type: 'narrative',
      title: 'Statement of Need',
      instructions: 'Explain the problem you are addressing and why it matters.',
      required: true,
      wordLimit: 750,
      relatedProfileFields: ['problemStatement', 'targetMarket'],
      order: 2
    },
    {
      id: 'project_description',
      type: 'narrative',
      title: 'Project Description',
      instructions: 'Describe your proposed project, activities, and timeline.',
      required: true,
      wordLimit: 1500,
      relatedProfileFields: ['solution'],
      order: 3
    },
    {
      id: 'outcomes_evaluation',
      type: 'narrative',
      title: 'Outcomes and Evaluation',
      instructions: 'What outcomes do you expect and how will you measure success?',
      required: true,
      wordLimit: 500,
      relatedProfileFields: [],
      order: 4
    },
    {
      id: 'organizational_capacity',
      type: 'narrative',
      title: 'Organizational Capacity',
      instructions: 'Describe your team and organizational ability to execute this project.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: ['founderBackground', 'teamSize', 'previousFunding'],
      order: 5
    },
    {
      id: 'budget_request',
      type: 'budget',
      title: 'Budget and Request',
      instructions: 'Provide a budget summary and explain how funds will be used.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: ['fundingSeeking', 'annualRevenue'],
      order: 6
    },
    {
      id: 'sustainability',
      type: 'narrative',
      title: 'Sustainability Plan',
      instructions: 'How will this project continue after the grant period?',
      required: true,
      wordLimit: 300,
      relatedProfileFields: [],
      order: 7
    }
  ],
  simple_application: [
    {
      id: 'project_title',
      type: 'short_answer',
      title: 'Project Title',
      instructions: 'Provide a concise title for your project.',
      required: true,
      characterLimit: 100,
      relatedProfileFields: [],
      order: 1
    },
    {
      id: 'organization_name',
      type: 'short_answer',
      title: 'Organization Name',
      instructions: 'Legal name of your organization.',
      required: true,
      relatedProfileFields: ['name'],
      order: 2
    },
    {
      id: 'project_summary',
      type: 'narrative',
      title: 'Project Summary',
      instructions: 'Briefly describe your project and what you hope to accomplish.',
      required: true,
      wordLimit: 300,
      relatedProfileFields: ['mission', 'solution'],
      order: 3
    },
    {
      id: 'amount_requested',
      type: 'short_answer',
      title: 'Amount Requested',
      instructions: 'How much funding are you requesting?',
      required: true,
      relatedProfileFields: ['fundingSeeking'],
      order: 4
    },
    {
      id: 'use_of_funds',
      type: 'narrative',
      title: 'Use of Funds',
      instructions: 'How will you use the grant funds?',
      required: true,
      wordLimit: 500,
      relatedProfileFields: [],
      order: 5
    }
  ]
};
