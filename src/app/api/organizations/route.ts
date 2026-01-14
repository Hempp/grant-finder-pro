import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET - Fetch organization for current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const organization = await prisma.organization.findUnique({
      where: { userId },
    });

    if (!organization) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Failed to fetch organization:", error);
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
