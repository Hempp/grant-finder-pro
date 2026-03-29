import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ hasCompletedOnboarding: true });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hasCompletedOnboarding: true },
    });
    return NextResponse.json({ hasCompletedOnboarding: user?.hasCompletedOnboarding ?? false });
  } catch (error) {
    console.error("Failed to check onboarding status:", error);
    return NextResponse.json({ hasCompletedOnboarding: true });
  }
}

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
    console.error("Failed to update onboarding status:", error);
    return NextResponse.json({ error: "Failed to update onboarding" }, { status: 500 });
  }
}
