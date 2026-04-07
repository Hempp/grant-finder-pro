import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { matchScholarshipsToStudent } from "@/lib/scholarship-matcher";

// GET /api/student/scholarships — Search & match scholarships for the current student
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) {
      return NextResponse.json(
        { error: "Complete your profile first" },
        { status: 400 }
      );
    }

    // Parse optional query params
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get("type");
    const fieldFilter = searchParams.get("field");
    const minAmountParam = searchParams.get("minAmount");
    const minAmount = minAmountParam ? parseInt(minAmountParam, 10) : null;

    // Build where clause — always filter to active status
    const where: Record<string, unknown> = { status: "active" };
    if (typeFilter) where.scholarshipType = typeFilter;
    if (fieldFilter) {
      // fieldsOfStudy is stored as a JSON array string; use contains for a substring match
      where.fieldsOfStudy = { contains: fieldFilter };
    }
    if (minAmount !== null && !isNaN(minAmount)) {
      where.amountMin = { gte: minAmount };
    }

    const scholarships = await prisma.scholarship.findMany({ where });

    // Run matching algorithm
    const matchResults = matchScholarshipsToStudent(
      {
        educationLevel: profile.educationLevel || "undergrad_fr",
        fieldOfStudy: profile.fieldOfStudy || null,
        major: profile.major || null,
        gpa: profile.gpa ?? null,
        gpaScale: profile.gpaScale ?? null,
        stateOfResidence: profile.stateOfResidence || "",
        citizenship: profile.citizenship || "us_citizen",
        financialNeed: profile.financialNeed || "not_disclosed",
        firstGeneration: profile.firstGeneration ?? false,
        minority: profile.minority ?? false,
        veteran: profile.veteran ?? false,
        careerGoal: profile.careerGoal || null,
        extracurriculars: profile.extracurriculars || null,
      },
      scholarships
    );

    // Merge scholarships with match results and sort by score descending
    const scholarshipMap = new Map(scholarships.map((s) => [s.id, s]));
    const merged = matchResults
      .map((result) => ({
        ...scholarshipMap.get(result.scholarshipId),
        matchScore: result.score,
        matchBreakdown: result.breakdown,
        matchReasons: result.reasons,
      }))
      .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

    return NextResponse.json(merged);
  } catch (error) {
    console.error("Failed to fetch scholarships:", error);
    return NextResponse.json(
      { error: "Failed to fetch scholarships" },
      { status: 500 }
    );
  }
}
