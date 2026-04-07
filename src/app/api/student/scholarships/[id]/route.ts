import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { calculateScholarshipMatch } from "@/lib/scholarship-matcher";

// GET /api/student/scholarships/[id]
// Returns: { scholarship, matchResult?, alreadyApplied: boolean, applicationId?: string }
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { id } = await params;

    const scholarship = await prisma.scholarship.findUnique({ where: { id } });
    if (!scholarship) {
      return NextResponse.json({ error: "Scholarship not found" }, { status: 404 });
    }

    // Check if user already applied
    const existingApp = await prisma.studentApplication.findFirst({
      where: { userId, scholarshipId: id },
      select: { id: true },
    });

    // Try to calculate match if profile exists
    let matchResult = null;
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (profile) {
      matchResult = calculateScholarshipMatch(
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
        scholarship
      );
    }

    return NextResponse.json({
      scholarship,
      matchResult,
      alreadyApplied: Boolean(existingApp),
      applicationId: existingApp?.id ?? null,
    });
  } catch (error) {
    console.error("Failed to fetch scholarship:", error);
    return NextResponse.json({ error: "Failed to fetch scholarship" }, { status: 500 });
  }
}
