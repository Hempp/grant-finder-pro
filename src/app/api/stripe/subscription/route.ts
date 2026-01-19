import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLANS, PlanType } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        plan: true,
        stripeCurrentPeriodEnd: true,
        stripeSubscriptionId: true,
        matchesUsedThisMonth: true,
        autoApplyUsedThisMonth: true,
        usageResetDate: true,
        trialEndsAt: true,
        hasUsedTrial: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();

    // Check trial status
    const isTrialActive = user.trialEndsAt && new Date(user.trialEndsAt) > now;
    const trialDaysRemaining = isTrialActive
      ? Math.ceil((new Date(user.trialEndsAt!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // If trial expired and no paid subscription, downgrade to free
    let currentPlan = (user.plan as PlanType) || "free";
    if (
      user.trialEndsAt &&
      new Date(user.trialEndsAt) <= now &&
      !user.stripeSubscriptionId &&
      currentPlan !== "free"
    ) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { plan: "free" },
      });
      currentPlan = "free";
    }

    const planConfig = PLANS[currentPlan];
    const limits = planConfig.limits;

    // Check if usage should be reset (monthly)
    const resetDate = user.usageResetDate ? new Date(user.usageResetDate) : now;
    const daysSinceReset = Math.floor(
      (now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let matchesUsed = user.matchesUsedThisMonth;
    let autoApplyUsed = user.autoApplyUsedThisMonth;

    // Reset if more than 30 days since last reset
    if (daysSinceReset >= 30) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          matchesUsedThisMonth: 0,
          autoApplyUsedThisMonth: 0,
          usageResetDate: now,
        },
      });
      matchesUsed = 0;
      autoApplyUsed = 0;
    }

    return NextResponse.json({
      plan: currentPlan,
      planName: planConfig.name,
      features: planConfig.features,
      limits,
      usage: {
        matchesUsed,
        autoApplyUsed,
        matchesRemaining:
          limits.matchesPerMonth === -1
            ? "unlimited"
            : Math.max(0, limits.matchesPerMonth - matchesUsed),
        autoApplyRemaining:
          limits.autoApplyPerMonth === -1
            ? "unlimited"
            : Math.max(0, limits.autoApplyPerMonth - autoApplyUsed),
      },
      billingPeriodEnd: user.stripeCurrentPeriodEnd,
      daysUntilReset: 30 - daysSinceReset,
      // Trial info
      trial: {
        isActive: isTrialActive,
        endsAt: user.trialEndsAt,
        daysRemaining: trialDaysRemaining,
        hasUsedTrial: user.hasUsedTrial,
        canStartTrial: !user.hasUsedTrial && !user.stripeSubscriptionId,
      },
      hasPaidSubscription: !!user.stripeSubscriptionId,
    });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
