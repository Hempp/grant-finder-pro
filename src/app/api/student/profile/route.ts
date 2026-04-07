import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET - Fetch StudentProfile for current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Failed to fetch student profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch student profile" },
      { status: 500 }
    );
  }
}

// POST - Create new StudentProfile
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();

    const { firstName, lastName, schoolName, educationLevel, stateOfResidence } = body;

    if (!firstName || !lastName || !schoolName || !educationLevel || !stateOfResidence) {
      return NextResponse.json(
        { error: "Missing required fields: firstName, lastName, schoolName, educationLevel, stateOfResidence" },
        { status: 400 }
      );
    }

    const profile = await prisma.studentProfile.create({
      data: {
        userId,
        ...body,
        profileComplete: isProfileComplete(body),
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error("Failed to create student profile:", error);
    return NextResponse.json(
      { error: "Failed to create student profile" },
      { status: 500 }
    );
  }
}

// PATCH - Update existing StudentProfile
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();

    // Get current profile to merge for profileComplete calculation
    const existing = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    const merged = { ...existing, ...body };

    const profile = await prisma.studentProfile.update({
      where: { userId },
      data: {
        ...body,
        profileComplete: isProfileComplete(merged),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Failed to update student profile:", error);
    return NextResponse.json(
      { error: "Failed to update student profile" },
      { status: 500 }
    );
  }
}

function isProfileComplete(data: Record<string, unknown>): boolean {
  const requiredFields = ["firstName", "lastName", "schoolName", "educationLevel", "stateOfResidence"];
  const optionalEnrichmentFields = ["major", "gpa", "careerGoal"];

  const hasRequired = requiredFields.every(
    (field) => data[field] && String(data[field]).trim() !== ""
  );

  const hasAtLeastOneOptional = optionalEnrichmentFields.some(
    (field) => data[field] && String(data[field]).trim() !== ""
  );

  return hasRequired && hasAtLeastOneOptional;
}
