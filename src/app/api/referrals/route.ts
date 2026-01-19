// API endpoint for referral program

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateReferralCode, getReferralLink, REFERRAL_CONFIG } from "@/lib/referral";

// GET - Fetch user's referral info
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        referralCode: true,
        referralCredits: true,
        referralsSent: {
          select: {
            id: true,
            status: true,
            referrerReward: true,
            createdAt: true,
            referee: {
              select: {
                name: true,
                email: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate referral code if user doesn't have one
    let referralCode = user.referralCode;
    if (!referralCode) {
      referralCode = generateReferralCode();
      await prisma.user.update({
        where: { id: session.user.id },
        data: { referralCode },
      });
    }

    // Calculate stats
    const totalReferrals = user.referralsSent.length;
    const completedReferrals = user.referralsSent.filter(r => r.status === "rewarded").length;
    const pendingReferrals = user.referralsSent.filter(r => r.status === "pending").length;
    const totalEarned = user.referralsSent.reduce((sum, r) => sum + r.referrerReward, 0);

    return NextResponse.json({
      referralCode,
      referralLink: getReferralLink(referralCode),
      stats: {
        totalReferrals,
        completedReferrals,
        pendingReferrals,
        totalEarned,
        creditsAvailable: user.referralCredits,
      },
      rewards: {
        referrerReward: REFERRAL_CONFIG.referrerReward,
        refereeReward: REFERRAL_CONFIG.refereeReward,
      },
      referrals: user.referralsSent.map(r => ({
        id: r.id,
        status: r.status,
        reward: r.referrerReward,
        refereeEmail: r.referee.email ? maskEmail(r.referee.email) : "Unknown",
        refereeName: r.referee.name || "Anonymous",
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching referral info:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral info" },
      { status: 500 }
    );
  }
}

// POST - Regenerate referral code
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await request.json();

    if (action === "regenerate") {
      const newCode = generateReferralCode();

      await prisma.user.update({
        where: { id: session.user.id },
        data: { referralCode: newCode },
      });

      return NextResponse.json({
        success: true,
        referralCode: newCode,
        referralLink: getReferralLink(newCode),
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error processing referral action:", error);
    return NextResponse.json(
      { error: "Failed to process action" },
      { status: 500 }
    );
  }
}

// Helper to mask email for privacy
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const maskedLocal = local.length > 2
    ? local[0] + "***" + local[local.length - 1]
    : "***";
  return `${maskedLocal}@${domain}`;
}
