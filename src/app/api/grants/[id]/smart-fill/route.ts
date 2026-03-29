import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { runSmartFill } from "@/lib/smart-fill/smart-fill-engine";
import { PLANS, PlanType } from "@/lib/stripe";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: grantId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  const plan = (user?.plan as PlanType) || "free";
  if (plan === "free" || plan === "growth") {
    return NextResponse.json(
      { error: "Smart Fill requires a Pro or Organization plan", code: "UPGRADE_REQUIRED" },
      { status: 403 }
    );
  }

  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
    select: { id: true },
  });

  if (!grant) {
    return NextResponse.json({ error: "Grant not found" }, { status: 404 });
  }

  try {
    const result = await runSmartFill(grantId, session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Smart Fill failed:", error);
    return NextResponse.json(
      { error: "Smart Fill generation failed. Please try again." },
      { status: 500 }
    );
  }
}
