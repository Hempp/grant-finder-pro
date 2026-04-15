// Cron endpoint for deadline reminder emails
// Sends reminders at 7 days and 3 days before deadlines
// Run daily via Vercel Cron or external scheduler

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendDeadlineReminderEmail } from "@/lib/email";
import { Notify } from "@/lib/notifications";

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
    console.info("Starting deadline reminder job...");
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

    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);

    // CLOUD-ARCHITECT / DATABASE-SAGE batch fix: one findMany across
    // all reminder-enabled users instead of one per user. At 50 users
    // this drops 50 round-trips → 1. In-memory groupBy after the fetch.
    const userIds = users.filter((u) => u.email).map((u) => u.id);
    const allApplications = userIds.length
      ? await prisma.application.findMany({
          where: {
            userId: { in: userIds },
            status: { in: ["draft", "in_progress"] },
            grant: {
              deadline: { gte: now, lte: sevenDaysFromNow },
            },
          },
          include: { grant: true },
          orderBy: { grant: { deadline: "asc" } },
        })
      : [];

    // Group by userId — callers loop over groups, not DB.
    const appsByUser = new Map<string, typeof allApplications>();
    for (const app of allApplications) {
      const list = appsByUser.get(app.userId) ?? [];
      list.push(app);
      appsByUser.set(app.userId, list);
    }

    for (const user of users) {
      if (!user.email) continue;
      const applications = appsByUser.get(user.id);
      if (!applications || applications.length === 0) continue;

      try {
        // Format grants for email
        const grants = applications.map((app) => ({
          id: app.grant.id,
          title: app.grant.title,
          funder: app.grant.funder,
          deadline: app.grant.deadline?.toISOString() || "",
          amount: app.grant.amountMax || app.grant.amountMin || 0,
        }));

        await sendDeadlineReminderEmail(user.email, user.name || undefined, grants);

        // Surface the same alert in-app so the bell matches the inbox.
        // One notification per grant — easier to dismiss individually.
        for (const app of applications) {
          if (!app.grant.deadline) continue;
          const daysUntil = Math.ceil(
            (new Date(app.grant.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysUntil <= 0) continue;
          Notify.deadlineApproaching({
            userId: user.id,
            grantTitle: app.grant.title,
            grantId: app.grant.id,
            daysUntilDeadline: daysUntil,
          });
        }

        emailsSent++;
      } catch (err) {
        console.error(`Failed to send deadline reminder to ${user.email}:`, err);
        errors++;
      }
    }

    const duration = Date.now() - startTime;

    console.info(`Deadline reminder job completed in ${duration}ms`);
    console.info(`Sent: ${emailsSent}, Errors: ${errors}`);

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
