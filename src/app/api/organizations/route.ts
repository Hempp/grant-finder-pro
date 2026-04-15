import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  calculateReadinessScore,
  type DocumentSummary,
} from "@/lib/readiness-score";
import { requireAuth } from "@/lib/api-helpers";
import { logError } from "@/lib/telemetry";

// GET - Fetch organization for current user
export async function GET() {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const organization = await prisma.organization.findUnique({
      where: { userId: session.user.id },
    });

    if (!organization) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(organization);
  } catch (err) {
    logError(err, { endpoint: "/api/organizations", method: "GET" });
    return NextResponse.json(
      { error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
}

// POST - Create or update organization
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const userId = session.user.id;

    // Upsert organization
    const organization = await prisma.organization.upsert({
      where: { userId },
      update: {
        ...body,
        profileComplete: isProfileComplete(body),
        updatedAt: new Date(),
      },
      create: {
        userId,
        ...body,
        profileComplete: isProfileComplete(body),
      },
    });

    // Auto-calculate readiness score after profile save
    try {
      const documents = await prisma.document.findMany({
        where: { userId },
        select: { type: true },
      });
      const docTypes = new Set(documents.map((d) => d.type));
      const docs: DocumentSummary = {
        hasPitchDeck: docTypes.has("pitch_deck"),
        hasFinancials: docTypes.has("financials"),
        hasBusinessPlan: docTypes.has("business_plan"),
        totalDocuments: documents.length,
      };

      const [totalApps, awardedApps] = await Promise.all([
        prisma.application.count({ where: { userId } }),
        prisma.application.count({ where: { userId, status: "awarded" } }),
      ]);

      const readiness = calculateReadinessScore(organization, docs, {
        total: totalApps,
        awarded: awardedApps,
      });

      await prisma.organization.update({
        where: { userId },
        data: {
          readinessScore: readiness.score,
          readinessDetails: JSON.stringify(readiness.breakdown),
          lastAssessedAt: new Date(),
        },
      });
    } catch (readinessError) {
      console.error("Failed to calculate readiness score:", readinessError);
      // Non-blocking — profile save still succeeds
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Failed to save organization:", error);
    return NextResponse.json(
      { error: "Failed to save organization" },
      { status: 500 }
    );
  }
}

function isProfileComplete(data: Record<string, unknown>): boolean {
  const requiredFields = ["name", "type", "mission", "teamSize", "fundingSeeking"];
  return requiredFields.every((field) => data[field] && String(data[field]).trim() !== "");
}
