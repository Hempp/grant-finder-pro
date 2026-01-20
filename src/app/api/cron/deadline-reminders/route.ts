// Cron endpoint for deadline reminder emails
// Sends reminders at 7 days and 3 days before deadlines
// Run daily via Vercel Cron or external scheduler

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendDeadlineReminderEmail } from "@/lib/email";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // SECURITY: Verify authorization - require CRON_SECRET to be set
  const authHeader = request.headers.get("authorization");

  if (!CRON_SECRET) {
    console.error("CRON_SECRET environment variable not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Starting deadline reminder job...");
    const startTime = Date.now();

    // Get users with deadline reminders enabled
    const users = await prisma.user.findMany({
      where: {
        deadlineReminders: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    let emailsSent = 0;
    let errors = 0;

    // Calculate date ranges for 7-day and 3-day reminders
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);

    for (const user of users) {
      if (!user.email) continue;

      try {
        // Get applications with upcoming deadlines (within 7 days)
        const applications = await prisma.application.findMany({
          where: {
            userId: user.id,
            status: { in: ["draft", "in_progress"] },
            grant: {
              deadline: {
                gte: now,
                lte: sevenDaysFromNow,
              },
            },
          },
          include: {
            grant: true,
          },
          orderBy: {
            grant: {
              deadline: "asc",
            },
          },
        });

        if (applications.length === 0) continue;

        // Format grants for email
        const grants = applications.map((app) => ({
          id: app.grant.id,
          title: app.grant.title,
          funder: app.grant.funder,
          deadline: app.grant.deadline?.toISOString() || "",
          amount: app.grant.amountMax || app.grant.amountMin || 0,
        }));

        await sendDeadlineReminderEmail(user.email, user.name || undefined, grants);
        emailsSent++;
      } catch (err) {
        console.error(`Failed to send deadline reminder to ${user.email}:`, err);
        errors++;
      }
    }

    const duration = Date.now() - startTime;

    console.log(`Deadline reminder job completed in ${duration}ms`);
    console.log(`Sent: ${emailsSent}, Errors: ${errors}`);

    return NextResponse.json({
      success: true,
      message: "Deadline reminders sent",
      stats: {
        usersProcessed: users.length,
        emailsSent,
        errors,
        duration: `${duration}ms`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Deadline reminder job failed:", error);
    return NextResponse.json(
      { error: "Deadline reminder job failed", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
