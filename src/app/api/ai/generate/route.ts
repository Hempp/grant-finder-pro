import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

interface GenerateRequest {
  field: string;
  context?: Record<string, string>;
  grantInfo?: {
    title: string;
    funder: string;
    amount: number;
    description?: string;
    requirements?: string[];
  };
  organizationInfo?: Record<string, unknown>;
}

// AI content generation endpoint using Claude API
export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { field, context, grantInfo, organizationInfo } = body;

    // If API key available, use Claude
    if (ANTHROPIC_API_KEY) {
      try {
        const content = await generateWithClaude(field, context, grantInfo, organizationInfo);
        return NextResponse.json({ content, source: "claude" });
      } catch (claudeError) {
        console.error("Claude API error, falling back to templates:", claudeError);
        const content = generateContent(field, context, grantInfo, organizationInfo);
        return NextResponse.json({ content, source: "template", error: String(claudeError) });
      }
    }

    // Fallback to templates if no API key
    const content = generateContent(field, context, grantInfo, organizationInfo);
    return NextResponse.json({ content, source: "template", reason: "no_api_key" });
  } catch (error) {
    console.error("Failed to generate content:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}

async function generateWithClaude(
  field: string,
  context?: Record<string, string>,
  grantInfo?: GenerateRequest["grantInfo"],
  orgInfo?: Record<string, unknown>
): Promise<string> {
  const systemPrompt = `You are an expert grant writer with 30 years of experience helping startups and organizations win funding. You write compelling, professional grant application content that is:
- Specific and detailed, not generic
- Backed by concrete examples and metrics when possible
- Aligned with the grant's requirements and goals
- Written in active voice with strong action verbs
- Structured with clear sections and bullet points where appropriate

Current context:
${grantInfo ? `
Grant: ${grantInfo.title}
Funder: ${grantInfo.funder}
Amount: $${grantInfo.amount?.toLocaleString()}
${grantInfo.description ? `Description: ${grantInfo.description}` : ""}
${grantInfo.requirements?.length ? `Requirements: ${grantInfo.requirements.join(", ")}` : ""}
` : ""}
${orgInfo ? `Organization Info: ${JSON.stringify(orgInfo)}` : ""}
${context ? `Previous answers: ${JSON.stringify(context)}` : ""}`;

  const fieldPrompts: Record<string, string> = {
    projectSummary: "Write a compelling 3-paragraph project summary for this grant application. Include the problem being addressed, the proposed solution, and expected outcomes. Be specific and impactful.",

    problemStatement: "Write a detailed problem statement that clearly articulates the challenge being addressed, its impact on stakeholders, current limitations of existing solutions, and why this problem is worth solving now.",

    technicalApproach: "Write a comprehensive technical approach section with 3 phases (Foundation, Development, Validation). Include specific methodologies, milestones, and deliverables. Use bullet points for clarity.",

    teamDescription: "Write a compelling team section highlighting relevant expertise, past accomplishments, and why this team is uniquely positioned to execute this project. Include roles and responsibilities.",

    budgetJustification: "Write a detailed budget justification covering Personnel, Equipment, Other Direct Costs, and Indirect Costs. Explain why each cost is necessary and reasonable for the project.",

    innovationDescription: "Write about the key innovations in this project - what makes it novel, what advances it offers over current approaches, and what unique value it brings.",

    proposedSolution: "Describe the proposed solution in detail - how it works, what makes it effective, and how it addresses the problem statement.",

    expectedOutcomes: "List the expected outcomes and impacts of this project, including measurable metrics, deliverables, and long-term benefits.",

    methodology: "Describe the research methodology in detail, including data collection, analysis approaches, and validation strategies.",

    milestones: "List key project milestones with timeline, including specific deliverables and success criteria for each phase.",

    relevantExperience: "Describe relevant past experience, prior projects, publications, or accomplishments that demonstrate capability to execute this project.",

    keyPersonnel: "List key personnel with their roles, qualifications, and time commitment to this project.",
  };

  const userPrompt = fieldPrompts[field] || `Generate professional content for the "${field}" section of this grant application.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        { role: "user", content: userPrompt }
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Claude API error:", error);
    throw new Error(`Claude API request failed: ${error}`);
  }

  const data = await response.json();
  const generatedText = data.content?.[0]?.text;

  if (!generatedText) {
    console.error("Claude API returned unexpected structure:", JSON.stringify(data));
    throw new Error("Claude API returned no text content");
  }

  return generatedText;
}

function generateContent(
  field: string,
  context?: Record<string, string>,
  grantInfo?: GenerateRequest["grantInfo"],
  orgInfo?: Record<string, unknown>
): string {
  const grantTitle = grantInfo?.title || "this grant opportunity";
  const funder = grantInfo?.funder || "the funding organization";
  const amount = grantInfo?.amount ? `$${grantInfo.amount.toLocaleString()}` : "the requested amount";

  const templates: Record<string, string> = {
    projectSummary: `Our project addresses a critical challenge in our target market through innovative technology solutions. We propose to develop a novel approach specifically designed for ${grantTitle}.

The proposed research will result in a prototype system with direct applications aligned with ${funder}'s mission. Our approach combines cutting-edge technology with proven methodologies, building on our team's extensive experience in this domain.

This Phase I effort will establish technical feasibility and lay the groundwork for commercialization, with a requested budget of ${amount} to achieve key milestones within the project timeline.`,

    problemStatement: `Current solutions face significant limitations that result in substantial costs and inefficiencies for stakeholders. Existing approaches rely on traditional methods which fail to address critical gaps that ${funder} has identified as priorities.

Our research indicates a significant percentage of target users struggle with these pain points, creating an urgent need for innovative solutions. The proposed technology directly addresses these gaps, enabling benefits not possible with current state-of-the-art methods.

The market opportunity is substantial, with growing demand for more effective solutions aligned with the goals of ${grantTitle}.`,

    technicalApproach: `Our technical approach consists of three integrated phases:

**Phase 1 - Foundation Development (Months 1-3):**
• Develop core architecture and infrastructure
• Implement data processing pipeline
• Establish baseline performance metrics

**Phase 2 - Innovation & Development (Months 4-6):**
• Design and implement novel algorithms
• Integrate advanced techniques for improved performance
• Optimize for efficiency and scalability

**Phase 3 - Validation & Integration (Months 7-9):**
• Conduct comprehensive testing with real-world scenarios
• Benchmark against existing solutions
• Prepare documentation and deployment strategy

Key innovations include our proprietary approach, which achieves significant improvements over current methods while reducing resource requirements.`,

    teamDescription: `Our team combines deep technical expertise with proven execution experience:

**Leadership:**
Our founding team brings significant combined years of relevant experience, with backgrounds spanning technology development, industry applications, and business operations.

**Technical Capabilities:**
The team has demonstrated expertise in the core technologies required for this project, with track records of successful development and deployment.

**Advisory Support:**
We have assembled advisors with deep domain expertise and extensive networks in our target market.

The team has collectively demonstrated ability to execute on complex technical projects and bring innovations to market.`,

    budgetJustification: `**Personnel Costs:**
• Principal Investigator - Leading technical development and project management
• Technical Staff - Core development and implementation
• Research Support - Testing, documentation, and analysis

**Equipment & Infrastructure:**
• Computing resources required for development and testing
• Development tools and software licenses
• Infrastructure for prototype deployment

**Other Direct Costs:**
• Data and resource acquisition for development
• Travel for partner meetings and presentations
• Publication and dissemination costs

**Indirect Costs:**
• Facilities and administrative costs at appropriate rates

All costs are justified by project requirements and aligned with ${funder}'s guidelines for ${grantTitle}.`,

    innovationDescription: `Our approach introduces several key innovations:

1. **Novel Methodology:** We employ a unique approach that combines multiple techniques in ways not previously explored, enabling new capabilities.

2. **Efficiency Gains:** Our solution achieves significant improvements in efficiency compared to existing approaches, reducing resource requirements while improving outcomes.

3. **Scalability:** The architecture is designed for scalability from the ground up, enabling deployment across various contexts and scales.

4. **Integration:** We've developed proprietary integration techniques that allow seamless connection with existing systems and workflows.

These innovations position our solution as a significant advancement over current state-of-the-art approaches.`,
  };

  return templates[field] || `Generated content for ${field}. This content is customized for ${grantTitle} from ${funder}. Please review and adjust based on your specific organization details and requirements.`;
}
