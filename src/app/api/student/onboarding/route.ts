import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await prisma.user.update({
      where: { id: session.user.id },
      data: { hasCompletedOnboarding: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update student onboarding status:", error);
    return NextResponse.json(
      { error: "Failed to update onboarding" },
      { status: 500 }
    );
  }
}
