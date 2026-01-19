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
  ],

  sbir_phase2: [
    {
      id: 'executive_summary',
      type: 'narrative',
      title: 'Executive Summary',
      instructions: 'Summarize the Phase I results, proposed Phase II objectives, and commercialization potential.',
      required: true,
      wordLimit: 750,
      evaluationCriteria: ['Clear summary of Phase I success', 'Compelling Phase II vision', 'Commercialization path'],
      relatedProfileFields: ['mission', 'solution', 'problemStatement'],
      order: 1
    },
    {
      id: 'phase1_results',
      type: 'narrative',
      title: 'Phase I Results',
      instructions: 'Describe the technical achievements and milestones accomplished during Phase I.',
      required: true,
      wordLimit: 2000,
      evaluationCriteria: ['Technical accomplishments', 'Milestone achievement', 'Proof of concept validation'],
      relatedProfileFields: ['solution'],
      order: 2
    },
    {
      id: 'phase2_objectives',
      type: 'narrative',
      title: 'Phase II Research Objectives',
      instructions: 'Define specific, measurable objectives for the Phase II research and development.',
      required: true,
      wordLimit: 1500,
      evaluationCriteria: ['Clear objectives', 'Measurable milestones', 'Technical ambition'],
      relatedProfileFields: ['solution'],
      order: 3
    },
    {
      id: 'technical_approach',
      type: 'narrative',
      title: 'Technical Approach',
      instructions: 'Detail your research methodology, technical milestones, and timeline.',
      required: true,
      wordLimit: 4000,
      evaluationCriteria: ['Technical merit', 'Feasibility', 'Innovation', 'Risk mitigation'],
      relatedProfileFields: ['solution'],
      order: 4
    },
    {
      id: 'team_qualifications',
      type: 'narrative',
      title: 'Team and Facilities',
      instructions: 'Describe key personnel, their qualifications, and available facilities/equipment.',
      required: true,
      wordLimit: 1500,
      evaluationCriteria: ['Relevant expertise', 'Track record', 'Adequate resources'],
      relatedProfileFields: ['founderBackground', 'teamSize'],
      order: 5
    },
    {
      id: 'commercialization_plan',
      type: 'narrative',
      title: 'Commercialization Plan',
      instructions: 'Provide detailed market analysis, business model, competitive landscape, and go-to-market strategy.',
      required: true,
      wordLimit: 3000,
      evaluationCriteria: ['Market understanding', 'Business model viability', 'Path to profitability', 'Competitive advantage'],
      relatedProfileFields: ['targetMarket', 'annualRevenue'],
      order: 6
    },
    {
      id: 'broader_impacts',
      type: 'narrative',
      title: 'Broader Impacts',
      instructions: 'Describe societal benefits, economic impacts, and contributions to scientific knowledge.',
      required: true,
      wordLimit: 1000,
      evaluationCriteria: ['Societal benefit', 'Economic impact', 'Educational contributions'],
      relatedProfileFields: ['mission'],
      order: 7
    },
    {
      id: 'budget_justification',
      type: 'budget',
      title: 'Budget Justification',
      instructions: 'Justify all proposed costs including personnel, equipment, materials, and subcontracts.',
      required: true,
      wordLimit: 2000,
      relatedProfileFields: ['fundingSeeking'],
      order: 8
    }
  ],

  nsf_research: [
    {
      id: 'project_summary',
      type: 'narrative',
      title: 'Project Summary',
      instructions: 'One-page summary including overview, intellectual merit, and broader impacts. Must be understandable to a scientifically literate reader.',
      required: true,
      wordLimit: 350,
      evaluationCriteria: ['Clarity', 'Intellectual merit', 'Broader impacts'],
      relatedProfileFields: ['mission', 'solution'],
      order: 1
    },
    {
      id: 'project_description',
      type: 'narrative',
      title: 'Project Description',
      instructions: 'Comprehensive description of research plan including background, objectives, methodology, and expected outcomes.',
      required: true,
      wordLimit: 7500,
      evaluationCriteria: ['Scientific merit', 'Research plan clarity', 'Methodology rigor', 'Expected outcomes'],
      relatedProfileFields: ['solution', 'problemStatement'],
      order: 2
    },
    {
      id: 'intellectual_merit',
      type: 'narrative',
      title: 'Intellectual Merit',
      instructions: 'How will this research advance knowledge and understanding within its field or across different fields?',
      required: true,
      wordLimit: 1500,
      evaluationCriteria: ['Advancement of knowledge', 'Novel approaches', 'Qualified team'],
      relatedProfileFields: ['solution'],
      order: 3
    },
    {
      id: 'broader_impacts',
      type: 'narrative',
      title: 'Broader Impacts',
      instructions: 'How will this research benefit society and contribute to desired societal outcomes?',
      required: true,
      wordLimit: 1500,
      evaluationCriteria: ['Societal benefit', 'Education integration', 'Underrepresented groups', 'Dissemination'],
      relatedProfileFields: ['mission'],
      order: 4
    },
    {
      id: 'prior_support',
      type: 'narrative',
      title: 'Results from Prior NSF Support',
      instructions: 'If you have received prior NSF support, describe results and publications.',
      required: false,
      wordLimit: 1000,
      relatedProfileFields: ['previousFunding'],
      order: 5
    },
    {
      id: 'facilities_equipment',
      type: 'narrative',
      title: 'Facilities, Equipment, and Other Resources',
      instructions: 'Describe resources available for the project.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: [],
      order: 6
    },
    {
      id: 'data_management',
      type: 'narrative',
      title: 'Data Management Plan',
      instructions: 'Describe how project data will be collected, stored, shared, and preserved.',
      required: true,
      wordLimit: 1000,
      evaluationCriteria: ['Data accessibility', 'Preservation', 'Sharing plan'],
      relatedProfileFields: [],
      order: 7
    }
  ],

  nih_r21: [
    {
      id: 'specific_aims',
      type: 'narrative',
      title: 'Specific Aims',
      instructions: 'State concisely the goals of the proposed research and summarize expected outcomes.',
      required: true,
      wordLimit: 500,
      evaluationCriteria: ['Clear objectives', 'Significance', 'Innovation'],
      relatedProfileFields: ['solution'],
      order: 1
    },
    {
      id: 'research_strategy',
      type: 'narrative',
      title: 'Research Strategy',
      instructions: 'Describe significance, innovation, and approach. Include preliminary data if available.',
      required: true,
      wordLimit: 3000,
      evaluationCriteria: ['Significance', 'Innovation', 'Approach feasibility'],
      relatedProfileFields: ['solution', 'problemStatement'],
      order: 2
    },
    {
      id: 'significance',
      type: 'narrative',
      title: 'Significance',
      instructions: 'Explain the importance of the problem and how it will improve scientific knowledge or clinical practice.',
      required: true,
      wordLimit: 1000,
      evaluationCriteria: ['Problem importance', 'Impact potential', 'Knowledge gap addressed'],
      relatedProfileFields: ['problemStatement'],
      order: 3
    },
    {
      id: 'innovation',
      type: 'narrative',
      title: 'Innovation',
      instructions: 'Explain how the application challenges and seeks to shift current research or clinical practice paradigms.',
      required: true,
      wordLimit: 750,
      evaluationCriteria: ['Novel concepts', 'New methods', 'Paradigm shift'],
      relatedProfileFields: ['solution'],
      order: 4
    },
    {
      id: 'approach',
      type: 'narrative',
      title: 'Approach',
      instructions: 'Describe overall strategy, methodology, and analyses to accomplish the specific aims.',
      required: true,
      wordLimit: 2000,
      evaluationCriteria: ['Methodology rigor', 'Feasibility', 'Potential problems addressed'],
      relatedProfileFields: ['solution'],
      order: 5
    },
    {
      id: 'environment',
      type: 'narrative',
      title: 'Environment',
      instructions: 'Describe the scientific environment and institutional support for the project.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: [],
      order: 6
    },
    {
      id: 'authentication_plan',
      type: 'narrative',
      title: 'Authentication of Key Resources',
      instructions: 'Describe methods to authenticate key biological and/or chemical resources.',
      required: false,
      wordLimit: 500,
      relatedProfileFields: [],
      order: 7
    }
  ],

  community_foundation: [
    {
      id: 'organizational_info',
      type: 'narrative',
      title: 'Organizational Information',
      instructions: 'Describe your organization history, mission, major programs, and community served.',
      required: true,
      wordLimit: 750,
      relatedProfileFields: ['name', 'mission', 'vision'],
      order: 1
    },
    {
      id: 'community_need',
      type: 'narrative',
      title: 'Community Need',
      instructions: 'What community need does this project address? Provide data and context.',
      required: true,
      wordLimit: 750,
      evaluationCriteria: ['Clear need identification', 'Data support', 'Community voice'],
      relatedProfileFields: ['problemStatement', 'targetMarket'],
      order: 2
    },
    {
      id: 'project_description',
      type: 'narrative',
      title: 'Project Description',
      instructions: 'Describe the project, including goals, activities, timeline, and who will be served.',
      required: true,
      wordLimit: 1500,
      evaluationCriteria: ['Clear activities', 'Realistic timeline', 'Target population clarity'],
      relatedProfileFields: ['solution'],
      order: 3
    },
    {
      id: 'community_engagement',
      type: 'narrative',
      title: 'Community Engagement',
      instructions: 'How does your organization engage the community in planning and implementing programs?',
      required: true,
      wordLimit: 500,
      evaluationCriteria: ['Authentic engagement', 'Community ownership', 'Feedback mechanisms'],
      relatedProfileFields: [],
      order: 4
    },
    {
      id: 'partnerships',
      type: 'narrative',
      title: 'Partnerships and Collaboration',
      instructions: 'Describe any partnerships or collaborations involved in this project.',
      required: false,
      wordLimit: 500,
      relatedProfileFields: [],
      order: 5
    },
    {
      id: 'outcomes_measurement',
      type: 'narrative',
      title: 'Outcomes and Measurement',
      instructions: 'What outcomes do you expect and how will you measure and track them?',
      required: true,
      wordLimit: 500,
      evaluationCriteria: ['Measurable outcomes', 'Evaluation plan', 'Data collection'],
      relatedProfileFields: [],
      order: 6
    },
    {
      id: 'organizational_capacity',
      type: 'narrative',
      title: 'Organizational Capacity',
      instructions: 'Describe your organization capacity, key staff, and financial health.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: ['founderBackground', 'teamSize', 'annualRevenue'],
      order: 7
    },
    {
      id: 'budget_narrative',
      type: 'budget',
      title: 'Budget Narrative',
      instructions: 'Provide a budget breakdown and explain how funds will be used.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: ['fundingSeeking'],
      order: 8
    },
    {
      id: 'sustainability',
      type: 'narrative',
      title: 'Sustainability',
      instructions: 'How will this project be sustained after the grant period?',
      required: true,
      wordLimit: 400,
      relatedProfileFields: [],
      order: 9
    },
    {
      id: 'diversity_equity',
      type: 'narrative',
      title: 'Diversity, Equity, and Inclusion',
      instructions: 'How does your organization and this project advance diversity, equity, and inclusion?',
      required: false,
      wordLimit: 400,
      relatedProfileFields: [],
      order: 10
    }
  ],

  arts_culture: [
    {
      id: 'artistic_vision',
      type: 'narrative',
      title: 'Artistic Vision',
      instructions: 'Describe the artistic vision, creative direction, and cultural significance of the project.',
      required: true,
      wordLimit: 1000,
      evaluationCriteria: ['Artistic merit', 'Creative vision', 'Cultural significance'],
      relatedProfileFields: ['mission', 'solution'],
      order: 1
    },
    {
      id: 'project_description',
      type: 'narrative',
      title: 'Project Description',
      instructions: 'Detail the project activities, timeline, key artists involved, and expected outputs.',
      required: true,
      wordLimit: 1500,
      evaluationCriteria: ['Clear activities', 'Achievable timeline', 'Artist credentials'],
      relatedProfileFields: ['solution'],
      order: 2
    },
    {
      id: 'community_impact',
      type: 'narrative',
      title: 'Community Impact',
      instructions: 'How will this project engage and benefit the community? Include audience estimates.',
      required: true,
      wordLimit: 750,
      evaluationCriteria: ['Community engagement', 'Accessibility', 'Audience reach'],
      relatedProfileFields: ['targetMarket'],
      order: 3
    },
    {
      id: 'artist_credentials',
      type: 'narrative',
      title: 'Artist/Organizational Credentials',
      instructions: 'Describe the qualifications and track record of key artists and your organization.',
      required: true,
      wordLimit: 750,
      relatedProfileFields: ['founderBackground'],
      order: 4
    },
    {
      id: 'marketing_outreach',
      type: 'narrative',
      title: 'Marketing and Outreach',
      instructions: 'How will you promote the project and reach your target audience?',
      required: true,
      wordLimit: 500,
      relatedProfileFields: [],
      order: 5
    },
    {
      id: 'budget',
      type: 'budget',
      title: 'Project Budget',
      instructions: 'Provide a detailed budget including artist fees, venue, materials, and marketing.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: ['fundingSeeking'],
      order: 6
    },
    {
      id: 'work_samples',
      type: 'attachment',
      title: 'Work Samples',
      instructions: 'Attach work samples demonstrating artistic quality (images, videos, or links).',
      required: true,
      relatedProfileFields: [],
      order: 7
    }
  ],

  education_grant: [
    {
      id: 'organization_background',
      type: 'narrative',
      title: 'Organization Background',
      instructions: 'Describe your organization, its educational focus, and track record.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: ['name', 'mission', 'vision'],
      order: 1
    },
    {
      id: 'educational_need',
      type: 'narrative',
      title: 'Educational Need',
      instructions: 'What educational gap or need does this project address? Include data on student outcomes.',
      required: true,
      wordLimit: 750,
      evaluationCriteria: ['Clear need', 'Data support', 'Target population'],
      relatedProfileFields: ['problemStatement'],
      order: 2
    },
    {
      id: 'project_design',
      type: 'narrative',
      title: 'Project Design',
      instructions: 'Describe the educational program, curriculum, pedagogy, and learning objectives.',
      required: true,
      wordLimit: 1500,
      evaluationCriteria: ['Sound pedagogy', 'Clear objectives', 'Evidence-based approach'],
      relatedProfileFields: ['solution'],
      order: 3
    },
    {
      id: 'target_population',
      type: 'narrative',
      title: 'Target Population',
      instructions: 'Who will be served? Include demographics, number of students, and selection criteria.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: ['targetMarket'],
      order: 4
    },
    {
      id: 'staff_qualifications',
      type: 'narrative',
      title: 'Staff Qualifications',
      instructions: 'Describe key staff, their qualifications, and relevant experience in education.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: ['founderBackground', 'teamSize'],
      order: 5
    },
    {
      id: 'evaluation_plan',
      type: 'narrative',
      title: 'Evaluation Plan',
      instructions: 'How will you measure student outcomes and program effectiveness?',
      required: true,
      wordLimit: 750,
      evaluationCriteria: ['Measurable outcomes', 'Assessment methods', 'Data collection'],
      relatedProfileFields: [],
      order: 6
    },
    {
      id: 'budget',
      type: 'budget',
      title: 'Budget',
      instructions: 'Provide a budget including personnel, materials, equipment, and evaluation costs.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: ['fundingSeeking'],
      order: 7
    },
    {
      id: 'sustainability',
      type: 'narrative',
      title: 'Sustainability and Scalability',
      instructions: 'How will the program be sustained and potentially scaled after the grant?',
      required: true,
      wordLimit: 400,
      relatedProfileFields: [],
      order: 8
    }
  ],

  environmental_grant: [
    {
      id: 'organization_overview',
      type: 'narrative',
      title: 'Organization Overview',
      instructions: 'Describe your organization and its environmental mission and track record.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: ['name', 'mission'],
      order: 1
    },
    {
      id: 'environmental_issue',
      type: 'narrative',
      title: 'Environmental Issue',
      instructions: 'What environmental problem are you addressing? Include scientific data and local context.',
      required: true,
      wordLimit: 1000,
      evaluationCriteria: ['Scientific basis', 'Local relevance', 'Urgency'],
      relatedProfileFields: ['problemStatement'],
      order: 2
    },
    {
      id: 'project_approach',
      type: 'narrative',
      title: 'Project Approach',
      instructions: 'Describe your conservation/environmental approach, methods, and activities.',
      required: true,
      wordLimit: 1500,
      evaluationCriteria: ['Scientific approach', 'Proven methods', 'Innovation'],
      relatedProfileFields: ['solution'],
      order: 3
    },
    {
      id: 'geographic_scope',
      type: 'narrative',
      title: 'Geographic Scope',
      instructions: 'Define the geographic area where the project will take place and its ecological significance.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: ['city', 'state'],
      order: 4
    },
    {
      id: 'measurable_outcomes',
      type: 'narrative',
      title: 'Measurable Outcomes',
      instructions: 'What specific environmental outcomes do you expect? Include metrics.',
      required: true,
      wordLimit: 750,
      evaluationCriteria: ['Quantifiable metrics', 'Realistic targets', 'Monitoring plan'],
      relatedProfileFields: [],
      order: 5
    },
    {
      id: 'community_involvement',
      type: 'narrative',
      title: 'Community Involvement',
      instructions: 'How will local communities be involved in the project?',
      required: true,
      wordLimit: 500,
      relatedProfileFields: [],
      order: 6
    },
    {
      id: 'partnerships',
      type: 'narrative',
      title: 'Partnerships',
      instructions: 'Describe partnerships with government agencies, academic institutions, or other NGOs.',
      required: false,
      wordLimit: 500,
      relatedProfileFields: [],
      order: 7
    },
    {
      id: 'long_term_conservation',
      type: 'narrative',
      title: 'Long-term Conservation Impact',
      instructions: 'How will this project contribute to long-term conservation goals?',
      required: true,
      wordLimit: 500,
      relatedProfileFields: [],
      order: 8
    },
    {
      id: 'budget',
      type: 'budget',
      title: 'Budget',
      instructions: 'Provide a budget including field work, equipment, personnel, and monitoring costs.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: ['fundingSeeking'],
      order: 9
    }
  ],

  health_services: [
    {
      id: 'organization_description',
      type: 'narrative',
      title: 'Organization Description',
      instructions: 'Describe your healthcare organization, services, and populations served.',
      required: true,
      wordLimit: 750,
      relatedProfileFields: ['name', 'mission'],
      order: 1
    },
    {
      id: 'health_need',
      type: 'narrative',
      title: 'Health Need/Disparity',
      instructions: 'What health need or disparity does this project address? Include epidemiological data.',
      required: true,
      wordLimit: 1000,
      evaluationCriteria: ['Data support', 'Health disparity identified', 'Target population'],
      relatedProfileFields: ['problemStatement'],
      order: 2
    },
    {
      id: 'intervention_design',
      type: 'narrative',
      title: 'Intervention Design',
      instructions: 'Describe the health intervention, evidence base, and implementation plan.',
      required: true,
      wordLimit: 1500,
      evaluationCriteria: ['Evidence-based', 'Feasible implementation', 'Cultural competence'],
      relatedProfileFields: ['solution'],
      order: 3
    },
    {
      id: 'target_population',
      type: 'narrative',
      title: 'Target Population',
      instructions: 'Describe the population to be served, including demographics and recruitment strategy.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: ['targetMarket'],
      order: 4
    },
    {
      id: 'clinical_staff',
      type: 'narrative',
      title: 'Clinical Staff and Qualifications',
      instructions: 'Describe clinical and program staff, their qualifications and licensure.',
      required: true,
      wordLimit: 750,
      relatedProfileFields: ['founderBackground', 'teamSize'],
      order: 5
    },
    {
      id: 'health_outcomes',
      type: 'narrative',
      title: 'Expected Health Outcomes',
      instructions: 'What health outcomes do you expect? Include specific metrics and evaluation plan.',
      required: true,
      wordLimit: 750,
      evaluationCriteria: ['Measurable outcomes', 'Health impact', 'Evaluation rigor'],
      relatedProfileFields: [],
      order: 6
    },
    {
      id: 'quality_assurance',
      type: 'narrative',
      title: 'Quality Assurance',
      instructions: 'Describe your quality assurance and patient safety protocols.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: [],
      order: 7
    },
    {
      id: 'budget',
      type: 'budget',
      title: 'Budget',
      instructions: 'Provide a budget including personnel, supplies, equipment, and indirect costs.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: ['fundingSeeking'],
      order: 8
    }
  ],

  technology_innovation: [
    {
      id: 'executive_summary',
      type: 'narrative',
      title: 'Executive Summary',
      instructions: 'Summarize the technology innovation, market opportunity, and funding request.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: ['mission', 'solution'],
      order: 1
    },
    {
      id: 'technology_description',
      type: 'narrative',
      title: 'Technology Description',
      instructions: 'Describe the technology, its novel aspects, and current development stage.',
      required: true,
      wordLimit: 1500,
      evaluationCriteria: ['Technical innovation', 'Development stage', 'IP position'],
      relatedProfileFields: ['solution'],
      order: 2
    },
    {
      id: 'problem_solution',
      type: 'narrative',
      title: 'Problem and Solution',
      instructions: 'What problem does this technology solve and why is your solution better?',
      required: true,
      wordLimit: 1000,
      evaluationCriteria: ['Clear problem', 'Solution differentiation', 'Value proposition'],
      relatedProfileFields: ['problemStatement', 'solution'],
      order: 3
    },
    {
      id: 'market_analysis',
      type: 'narrative',
      title: 'Market Analysis',
      instructions: 'Describe market size, target customers, and competitive landscape.',
      required: true,
      wordLimit: 1000,
      evaluationCriteria: ['Market size', 'Customer validation', 'Competitive advantage'],
      relatedProfileFields: ['targetMarket'],
      order: 4
    },
    {
      id: 'business_model',
      type: 'narrative',
      title: 'Business Model',
      instructions: 'Describe your revenue model, pricing strategy, and path to profitability.',
      required: true,
      wordLimit: 750,
      evaluationCriteria: ['Revenue clarity', 'Unit economics', 'Scalability'],
      relatedProfileFields: ['annualRevenue'],
      order: 5
    },
    {
      id: 'development_roadmap',
      type: 'narrative',
      title: 'Development Roadmap',
      instructions: 'Outline technical milestones, timeline, and key risks/mitigations.',
      required: true,
      wordLimit: 1000,
      evaluationCriteria: ['Clear milestones', 'Realistic timeline', 'Risk awareness'],
      relatedProfileFields: [],
      order: 6
    },
    {
      id: 'team',
      type: 'narrative',
      title: 'Team',
      instructions: 'Describe founders, key team members, and relevant experience.',
      required: true,
      wordLimit: 750,
      relatedProfileFields: ['founderBackground', 'teamSize'],
      order: 7
    },
    {
      id: 'funding_use',
      type: 'narrative',
      title: 'Use of Funds',
      instructions: 'How will grant funds be used? Provide specific allocation.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: ['fundingSeeking'],
      order: 8
    },
    {
      id: 'traction',
      type: 'narrative',
      title: 'Traction and Validation',
      instructions: 'Describe any traction: customers, pilots, revenue, partnerships, or previous funding.',
      required: false,
      wordLimit: 500,
      relatedProfileFields: ['previousFunding', 'annualRevenue'],
      order: 9
    }
  ],

  workforce_development: [
    {
      id: 'organization_overview',
      type: 'narrative',
      title: 'Organization Overview',
      instructions: 'Describe your organization and its experience in workforce development.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: ['name', 'mission'],
      order: 1
    },
    {
      id: 'workforce_need',
      type: 'narrative',
      title: 'Workforce Need',
      instructions: 'What workforce gap does this program address? Include labor market data.',
      required: true,
      wordLimit: 750,
      evaluationCriteria: ['Labor market data', 'Industry demand', 'Skills gap'],
      relatedProfileFields: ['problemStatement'],
      order: 2
    },
    {
      id: 'program_design',
      type: 'narrative',
      title: 'Program Design',
      instructions: 'Describe the training program, curriculum, and credential/certification offered.',
      required: true,
      wordLimit: 1500,
      evaluationCriteria: ['Industry alignment', 'Competency-based', 'Credential value'],
      relatedProfileFields: ['solution'],
      order: 3
    },
    {
      id: 'target_population',
      type: 'narrative',
      title: 'Target Population',
      instructions: 'Who will be served? Include demographics, barriers to employment, and recruitment plan.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: ['targetMarket'],
      order: 4
    },
    {
      id: 'employer_partnerships',
      type: 'narrative',
      title: 'Employer Partnerships',
      instructions: 'Describe partnerships with employers for curriculum input and job placement.',
      required: true,
      wordLimit: 750,
      evaluationCriteria: ['Employer commitment', 'Job placement pipeline', 'Curriculum input'],
      relatedProfileFields: [],
      order: 5
    },
    {
      id: 'support_services',
      type: 'narrative',
      title: 'Support Services',
      instructions: 'What wrap-around support services will be provided (transportation, childcare, etc.)?',
      required: false,
      wordLimit: 500,
      relatedProfileFields: [],
      order: 6
    },
    {
      id: 'outcomes_metrics',
      type: 'narrative',
      title: 'Outcomes and Metrics',
      instructions: 'What outcomes do you expect? Include job placement rates and wage targets.',
      required: true,
      wordLimit: 500,
      evaluationCriteria: ['Job placement rate', 'Wage outcomes', 'Retention'],
      relatedProfileFields: [],
      order: 7
    },
    {
      id: 'budget',
      type: 'budget',
      title: 'Budget',
      instructions: 'Provide a budget including instruction, support services, and employer engagement.',
      required: true,
      wordLimit: 500,
      relatedProfileFields: ['fundingSeeking'],
      order: 8
    }
  ]
};

// Field type definitions for smart form filling
export type FieldInputType =
  | 'text'           // Single line text
  | 'textarea'       // Multi-line text
  | 'number'         // Numeric input
  | 'currency'       // Dollar amount
  | 'percentage'     // Percentage value
  | 'date'           // Date input
  | 'email'          // Email address
  | 'phone'          // Phone number
  | 'url'            // Website URL
  | 'select'         // Dropdown selection
  | 'multiselect'    // Multiple selection
  | 'radio'          // Radio buttons
  | 'checkbox'       // Checkboxes
  | 'file'           // File upload
  | 'signature'      // Digital signature
  | 'address'        // Full address
  | 'ein'            // Employer ID Number
  | 'duns'           // DUNS number
  | 'sam_uei';       // SAM Unique Entity ID

// Smart field detection patterns
export const FIELD_PATTERNS: Record<string, {
  patterns: RegExp[];
  type: FieldInputType;
  dataSource: string;
}> = {
  organization_name: {
    patterns: [/organization\s*name/i, /legal\s*name/i, /entity\s*name/i, /company\s*name/i],
    type: 'text',
    dataSource: 'organization.name'
  },
  ein: {
    patterns: [/ein/i, /employer\s*id/i, /tax\s*id/i, /federal\s*id/i],
    type: 'ein',
    dataSource: 'organization.ein'
  },
  duns: {
    patterns: [/duns/i, /d-u-n-s/i, /dun\s*&?\s*brad/i],
    type: 'duns',
    dataSource: 'organization.duns'
  },
  sam_uei: {
    patterns: [/sam\s*uei/i, /unique\s*entity\s*id/i, /uei/i],
    type: 'sam_uei',
    dataSource: 'organization.samUei'
  },
  website: {
    patterns: [/website/i, /web\s*address/i, /url/i, /homepage/i],
    type: 'url',
    dataSource: 'organization.website'
  },
  email: {
    patterns: [/email/i, /e-mail/i, /contact\s*email/i],
    type: 'email',
    dataSource: 'contact.email'
  },
  phone: {
    patterns: [/phone/i, /telephone/i, /contact\s*number/i],
    type: 'phone',
    dataSource: 'contact.phone'
  },
  address: {
    patterns: [/address/i, /mailing\s*address/i, /street\s*address/i],
    type: 'address',
    dataSource: 'organization.address'
  },
  city: {
    patterns: [/^city$/i, /city\/town/i],
    type: 'text',
    dataSource: 'organization.city'
  },
  state: {
    patterns: [/^state$/i, /state\/province/i],
    type: 'select',
    dataSource: 'organization.state'
  },
  zip: {
    patterns: [/zip/i, /postal\s*code/i],
    type: 'text',
    dataSource: 'organization.zip'
  },
  amount_requested: {
    patterns: [/amount\s*requested/i, /funding\s*request/i, /grant\s*amount/i, /requesting/i],
    type: 'currency',
    dataSource: 'organization.fundingSeeking'
  },
  annual_budget: {
    patterns: [/annual\s*budget/i, /operating\s*budget/i, /yearly\s*budget/i],
    type: 'currency',
    dataSource: 'organization.annualRevenue'
  },
  year_founded: {
    patterns: [/year\s*founded/i, /established/i, /incorporated/i],
    type: 'number',
    dataSource: 'organization.yearFounded'
  },
  staff_count: {
    patterns: [/number\s*of\s*(staff|employees)/i, /team\s*size/i, /fte/i],
    type: 'number',
    dataSource: 'organization.teamSize'
  },
  mission: {
    patterns: [/mission\s*(statement)?/i, /organization\s*mission/i],
    type: 'textarea',
    dataSource: 'organization.mission'
  },
  project_title: {
    patterns: [/project\s*title/i, /proposal\s*title/i, /program\s*name/i],
    type: 'text',
    dataSource: 'custom'
  },
  project_start_date: {
    patterns: [/start\s*date/i, /begin\s*date/i, /project\s*start/i],
    type: 'date',
    dataSource: 'custom'
  },
  project_end_date: {
    patterns: [/end\s*date/i, /completion\s*date/i, /project\s*end/i],
    type: 'date',
    dataSource: 'custom'
  },
  executive_director: {
    patterns: [/executive\s*director/i, /ceo/i, /president/i, /principal\s*investigator/i],
    type: 'text',
    dataSource: 'organization.executiveDirector'
  },
  board_members: {
    patterns: [/board\s*(members|of\s*directors)/i, /trustees/i],
    type: 'number',
    dataSource: 'organization.boardMembers'
  }
};

// Common select field options
export const SELECT_OPTIONS: Record<string, string[]> = {
  state: [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
  ],
  organization_type: [
    '501(c)(3) Nonprofit',
    '501(c)(4) Social Welfare',
    '501(c)(6) Trade Association',
    'Government Entity',
    'Tribal Organization',
    'Educational Institution',
    'Healthcare Organization',
    'Religious Organization',
    'For-Profit Company',
    'B Corporation',
    'Social Enterprise',
    'Cooperative'
  ],
  geographic_scope: [
    'Local/City',
    'County/Regional',
    'Statewide',
    'Multi-State',
    'National',
    'International'
  ],
  project_type: [
    'Program Support',
    'Capacity Building',
    'Capital/Equipment',
    'Research',
    'Planning/Assessment',
    'Advocacy',
    'Direct Service',
    'Technical Assistance'
  ],
  yes_no: ['Yes', 'No'],
  budget_size: [
    'Under $100,000',
    '$100,000 - $500,000',
    '$500,000 - $1 million',
    '$1 million - $5 million',
    '$5 million - $10 million',
    'Over $10 million'
  ]
};
