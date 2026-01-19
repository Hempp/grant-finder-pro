import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendTrialStartedEmail } from "@/lib/email";

const TRIAL_DAYS = 14;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        plan: true,
        hasUsedTrial: true,
        trialEndsAt: true,
        stripeSubscriptionId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has an active subscription
    if (user.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 }
      );
    }

    // Check if user has already used their trial
    if (user.hasUsedTrial) {
      return NextResponse.json(
        { error: "You have already used your free trial" },
        { status: 400 }
      );
    }

    // Check if trial is still active
    if (user.trialEndsAt && new Date(user.trialEndsAt) > new Date()) {
      return NextResponse.json(
        { error: "You already have an active trial" },
        { status: 400 }
      );
    }

    // Start the trial
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        plan: "pro",
        trialEndsAt,
        hasUsedTrial: true,
        // Reset usage for the trial period
        matchesUsedThisMonth: 0,
        autoApplyUsedThisMonth: 0,
        usageResetDate: new Date(),
      },
      select: {
        email: true,
        name: true,
      },
    });

    // Send trial started email
    if (updatedUser.email) {
      sendTrialStartedEmail(updatedUser.email, updatedUser.name || undefined, TRIAL_DAYS)
        .catch((err) => console.error("Failed to send trial started email:", err));
    }

    return NextResponse.json({
      success: true,
      trialEndsAt,
      daysRemaining: TRIAL_DAYS,
      message: `Your ${TRIAL_DAYS}-day Pro trial has started!`,
    });
  } catch (error) {
    console.error("Trial start error:", error);
    return NextResponse.json(
      { error: "Failed to start trial" },
      { status: 500 }
    );
  }
}

// GET endpoint to check trial status
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
        hasUsedTrial: true,
        trialEndsAt: true,
        stripeSubscriptionId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const isTrialActive = user.trialEndsAt && new Date(user.trialEndsAt) > now;
    const daysRemaining = isTrialActive
      ? Math.ceil((new Date(user.trialEndsAt!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return NextResponse.json({
      hasUsedTrial: user.hasUsedTrial,
      isTrialActive,
      trialEndsAt: user.trialEndsAt,
      daysRemaining,
      canStartTrial: !user.hasUsedTrial && !user.stripeSubscriptionId,
      hasPaidSubscription: !!user.stripeSubscriptionId,
    });
  } catch (error) {
    console.error("Trial status error:", error);
    return NextResponse.json(
      { error: "Failed to get trial status" },
      { status: 500 }
    );
  }
}
