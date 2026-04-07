import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { runSmartFill } from "@/lib/smart-fill/smart-fill-engine";
import { getPlanLimits, PlanType } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 10 AI requests per minute
  const rateLimitResult = await rateLimit("ai", `user:${session.user.id}`);
  if (!rateLimitResult.success && rateLimitResult.response) {
    return rateLimitResult.response;
  }

  const { id: grantId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, autoApplyUsedThisMonth: true },
  });

  const plan = (user?.plan as PlanType) || "free";
  const limits = getPlanLimits(plan);

  // Check if plan allows Smart Fill at all
  if (limits.smartFillPerMonth === 0) {
    return NextResponse.json(
      { error: "Smart Fill requires a paid plan. Upgrade to unlock AI-powered applications.", code: "UPGRADE_REQUIRED" },
      { status: 403 }
    );
  }

  // Enforce monthly Smart Fill limit
  const usedThisMonth = user?.autoApplyUsedThisMonth || 0;
  if (usedThisMonth >= limits.smartFillPerMonth) {
    return NextResponse.json(
      {
        error: "Monthly Smart Fill limit reached",
        message: `You've used all ${limits.smartFillPerMonth} Smart Fills this month. Upgrade for more.`,
        code: "LIMIT_REACHED",
        limit: limits.smartFillPerMonth,
        used: usedThisMonth,
      },
      { status: 429 }
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

    // Increment usage counter on success
    await prisma.user.update({
      where: { id: session.user.id },
      data: { autoApplyUsedThisMonth: { increment: 1 } },
    });

    return NextResponse.json({
      ...result,
      usage: {
        used: usedThisMonth + 1,
        limit: limits.smartFillPerMonth,
        remaining: limits.smartFillPerMonth - usedThisMonth - 1,
      },
    });
  } catch (error) {
    console.error("Smart Fill failed:", error);
    return NextResponse.json(
      { error: "Smart Fill generation failed. Please try again." },
      { status: 500 }
    );
  }
}
