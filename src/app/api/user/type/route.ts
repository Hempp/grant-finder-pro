import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true, hasCompletedOnboarding: true },
    });

    return NextResponse.json({
      userType: user?.userType || "organization",
      hasCompletedOnboarding: user?.hasCompletedOnboarding || false,
    });
  } catch (error) {
    console.error("Failed to get user type:", error);
    return NextResponse.json({ error: "Failed to get user type" }, { status: 500 });
  }
}
