import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { generateReferralCode, REFERRAL_CONFIG } from "@/lib/referral";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, referralCode } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Find referrer if referral code provided
    let referrer = null;
    if (referralCode) {
      referrer = await prisma.user.findUnique({
        where: { referralCode: referralCode.toUpperCase() },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with referral data
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split("@")[0],
        referralCode: generateReferralCode(),
        referredById: referrer?.id || null,
        // Give referee their bonus matches
        referralCredits: referrer ? REFERRAL_CONFIG.refereeReward : 0,
      },
    });

    // If referred, create referral record and award referrer
    if (referrer) {
      await prisma.$transaction([
        // Create referral record
        prisma.referral.create({
          data: {
            referrerId: referrer.id,
            refereeId: user.id,
            status: "rewarded",
            referrerReward: REFERRAL_CONFIG.referrerReward,
            refereeReward: REFERRAL_CONFIG.refereeReward,
            rewardedAt: new Date(),
          },
        }),
        // Award referrer their bonus matches
        prisma.user.update({
          where: { id: referrer.id },
          data: {
            referralCredits: {
              increment: REFERRAL_CONFIG.referrerReward,
            },
          },
        }),
      ]);
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      referralBonus: referrer ? REFERRAL_CONFIG.refereeReward : 0,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
