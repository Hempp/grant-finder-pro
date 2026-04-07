import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import Anthropic from "@anthropic-ai/sdk";
import { PDFParse } from "pdf-parse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const ANALYSIS_LIMITS: Record<string, number> = {
  free: 0,
  growth: 3,
  pro: 10,
  organization: 999,
};

// GET - Fetch existing analysis for a grant
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const analysis = await prisma.grantAnalysis.findUnique({
      where: { grantId: id },
    });

    if (analysis) {
      return NextResponse.json({
        analyzed: true,
        ...analysis,
        scoringCriteria: JSON.parse(analysis.scoringCriteria),
        requiredSections: JSON.parse(analysis.requiredSections),
        eligibilityReqs: JSON.parse(analysis.eligibilityReqs),
      });
    }

    return NextResponse.json({ analyzed: false });
  } catch (error) {
    console.error("Failed to fetch analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}

// POST - Analyze a grant using Claude AI
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 10 AI requests per minute
    const rateLimitResult = await rateLimit("ai", `user:${session.user.id}`);
    if (!rateLimitResult.success && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // Check plan limits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });

    const plan = (user?.plan as string) || "free";
    const limit = ANALYSIS_LIMITS[plan] ?? 0;

    if (limit === 0) {
      return NextResponse.json(
        { error: "AI analysis is not available on the free plan. Please upgrade to use this feature." },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if analysis already exists (return cached)
    const existing = await prisma.grantAnalysis.findUnique({
      where: { grantId: id },
    });

    if (existing) {
      return NextResponse.json({
        analyzed: true,
        ...existing,
        scoringCriteria: JSON.parse(existing.scoringCriteria),
        requiredSections: JSON.parse(existing.requiredSections),
        eligibilityReqs: JSON.parse(existing.eligibilityReqs),
      });
    }

    // Fetch the grant
    const grant = await prisma.grant.findUnique({
      where: { id },
    });

    if (!grant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }

    // Try to fetch and parse NOFO PDF
    let pdfText = "";
    let pdfPageCount: number | null = null;
    let pdfUrl: string | null = null;

    const candidateUrl = grant.nofoUrl || grant.url;
    if (candidateUrl && (candidateUrl.endsWith(".pdf") || candidateUrl.includes("/pdf"))) {
      pdfUrl = candidateUrl;
      try {
        const pdfResponse = await fetch(candidateUrl, {
          headers: { "User-Agent": "GrantPilot/1.0" },
          signal: AbortSignal.timeout(30000),
        });

        if (pdfResponse.ok) {
          const arrayBuffer = await pdfResponse.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const parser = new PDFParse({ data: buffer });
          const textResult = await parser.getText();
          pdfText = textResult.text.slice(0, 50000);
          pdfPageCount = textResult.total;
          await parser.destroy();
        }
      } catch (pdfError) {
        console.error("PDF parsing failed (non-blocking):", pdfError);
        // PDF failures should not block analysis
      }
    }

    // Build the Claude prompt
    const grantContext = [
      `Title: ${grant.title}`,
      `Funder: ${grant.funder}`,
      grant.agencyName ? `Agency: ${grant.agencyName}` : null,
      grant.description ? `Description: ${grant.description}` : null,
      grant.eligibility ? `Eligibility: ${grant.eligibility}` : null,
      grant.requirements ? `Requirements: ${grant.requirements}` : null,
      grant.amount ? `Award Amount: ${grant.amount}` : null,
      grant.category ? `Category: ${grant.category}` : null,
      grant.type ? `Type: ${grant.type}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const pdfSection = pdfText
      ? `\n\nNOFO/RFP Document Text (${pdfPageCount} pages):\n${pdfText}`
      : "";

    const prompt = `Analyze this grant opportunity and extract structured information. Return ONLY valid JSON (no markdown wrapping).

Grant Information:
${grantContext}${pdfSection}

Return JSON with exactly this structure:
{
  "scoringCriteria": [
    { "name": "string - criterion name", "maxPoints": number, "description": "string - what reviewers look for", "weight": number }
  ],
  "requiredSections": [
    { "title": "string - section name", "wordLimit": number or null, "instructions": "string - what to include", "required": true/false }
  ],
  "eligibilityReqs": [
    { "requirement": "string - the requirement", "type": "string - organization|financial|geographic|programmatic|other", "met": null }
  ],
  "evaluationNotes": "string - key tips for a strong application",
  "confidence": number 1-100
}

If NOFO text is available, extract exact scoring criteria and sections. If not, infer reasonable criteria based on the grant type, funder, and category. For federal grants, use standard merit review criteria. Always include at least 3 scoring criteria and 3 required sections.`;

    // Call Claude
    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    // Extract text from response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON (handle potential markdown wrapping)
    let analysisData;
    try {
      // Try direct parse first
      analysisData = JSON.parse(responseText);
    } catch {
      // Try extracting JSON from markdown code block
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[1].trim());
      } else {
        // Try finding JSON object in the response
        const braceMatch = responseText.match(/\{[\s\S]*\}/);
        if (braceMatch) {
          analysisData = JSON.parse(braceMatch[0]);
        } else {
          throw new Error("Failed to parse AI response as JSON");
        }
      }
    }

    // Save to database
    const analysis = await prisma.grantAnalysis.create({
      data: {
        grantId: id,
        scoringCriteria: JSON.stringify(analysisData.scoringCriteria || []),
        requiredSections: JSON.stringify(analysisData.requiredSections || []),
        eligibilityReqs: JSON.stringify(analysisData.eligibilityReqs || []),
        evaluationNotes: analysisData.evaluationNotes || null,
        pdfUrl,
        pdfPageCount,
        modelUsed: "claude-sonnet-4-20250514",
        confidence: analysisData.confidence || 50,
      },
    });

    return NextResponse.json({
      analyzed: true,
      ...analysis,
      scoringCriteria: analysisData.scoringCriteria,
      requiredSections: analysisData.requiredSections,
      eligibilityReqs: analysisData.eligibilityReqs,
    });
  } catch (error) {
    console.error("Grant analysis failed:", error);
    return NextResponse.json(
      { error: "Analysis failed", details: String(error) },
      { status: 500 }
    );
  }
}
