// Cron endpoint for trial ending reminder emails
// Sends reminders at 7 days, 3 days, and 1 day before trial ends
// Run daily via Vercel Cron

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendTrialEndingEmail } from "@/lib/email";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Starting trial reminder job...");
    const startTime = Date.now();

    const now = new Date();

    // Calculate target dates for reminders
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);

    const oneDayFromNow = new Date(now);
    oneDayFromNow.setDate(now.getDate() + 1);

    // Helper to check if a date is within a day window
    const isWithinWindow = (trialEnd: Date, targetDate: Date) => {
      const diff = Math.abs(trialEnd.getTime() - targetDate.getTime());
      const oneDay = 24 * 60 * 60 * 1000;
      return diff < oneDay;
    };

    // Get users on trial with reminders enabled
    const usersOnTrial = await prisma.user.findMany({
      where: {
        trialEndsAt: { not: null, gt: now },
        trialReminders: true,
        plan: "pro", // Only users who are actually on the trial
      },
      select: {
        id: true,
        email: true,
        name: true,
        trialEndsAt: true,
      },
    });

    let emailsSent = 0;
    let errors = 0;
    const remindersBreakdown = { sevenDay: 0, threeDay: 0, oneDay: 0 };

    for (const user of usersOnTrial) {
      if (!user.email || !user.trialEndsAt) continue;

      try {
        let daysRemaining: number | null = null;

        // Check which reminder to send
        if (isWithinWindow(user.trialEndsAt, oneDayFromNow)) {
          daysRemaining = 1;
          remindersBreakdown.oneDay++;
        } else if (isWithinWindow(user.trialEndsAt, threeDaysFromNow)) {
          daysRemaining = 3;
          remindersBreakdown.threeDay++;
        } else if (isWithinWindow(user.trialEndsAt, sevenDaysFromNow)) {
          daysRemaining = 7;
          remindersBreakdown.sevenDay++;
        }

        if (daysRemaining !== null) {
          await sendTrialEndingEmail(user.email, user.name || undefined, daysRemaining);
          emailsSent++;
        }
      } catch (err) {
        console.error(`Failed to send trial reminder to ${user.email}:`, err);
        errors++;
      }
    }

    const duration = Date.now() - startTime;

    console.log(`Trial reminder job completed in ${duration}ms`);
    console.log(`Sent: ${emailsSent}, Errors: ${errors}`);
    console.log(`Breakdown: 7-day: ${remindersBreakdown.sevenDay}, 3-day: ${remindersBreakdown.threeDay}, 1-day: ${remindersBreakdown.oneDay}`);

    return NextResponse.json({
      success: true,
      message: "Trial reminders sent",
      stats: {
        usersOnTrial: usersOnTrial.length,
        emailsSent,
        errors,
        breakdown: remindersBreakdown,
        duration: `${duration}ms`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Trial reminder job failed:", error);
    return NextResponse.json(
      { error: "Trial reminder job failed", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
