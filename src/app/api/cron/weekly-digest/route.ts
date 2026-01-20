// Cron endpoint for weekly digest emails
// Sends a summary of new grants, application progress, and upcoming deadlines
// Run weekly (e.g., every Monday at 9am) via Vercel Cron

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWeeklyDigestEmail } from "@/lib/email";

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
    console.log("Starting weekly digest job...");
    const startTime = Date.now();

    // Get users with weekly digest enabled
    const users = await prisma.user.findMany({
      where: {
        weeklyDigest: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    let emailsSent = 0;
    let errors = 0;

    // Date range for "new" grants (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const now = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(now.getDate() + 14);

    for (const user of users) {
      if (!user.email) continue;

      try {
        // Get new grants from last week with match scores
        const newGrants = await prisma.grant.findMany({
          where: {
            userId: user.id,
            createdAt: { gte: oneWeekAgo },
            matchScore: { not: null },
          },
          orderBy: { matchScore: "desc" },
          take: 10,
        });

        // Get user's applications in progress
        const applicationsInProgress = await prisma.application.count({
          where: {
            userId: user.id,
            status: { in: ["draft", "in_progress"] },
          },
        });

        // Get count of upcoming deadlines (within 2 weeks)
        const upcomingDeadlines = await prisma.application.count({
          where: {
            userId: user.id,
            status: { in: ["draft", "in_progress"] },
            grant: {
              deadline: {
                gte: now,
                lte: twoWeeksFromNow,
              },
            },
          },
        });

        // Format grants for email
        const formattedGrants = newGrants.map((grant) => ({
          id: grant.id,
          title: grant.title,
          funder: grant.funder,
          amount: grant.amountMax || grant.amountMin || 0,
          matchScore: grant.matchScore || 0,
        }));

        const stats = {
          applicationsInProgress,
          upcomingDeadlines,
        };

        await sendWeeklyDigestEmail(user.email, user.name || undefined, formattedGrants, stats);
        emailsSent++;
      } catch (err) {
        console.error(`Failed to send weekly digest to ${user.email}:`, err);
        errors++;
      }
    }

    const duration = Date.now() - startTime;

    console.log(`Weekly digest job completed in ${duration}ms`);
    console.log(`Sent: ${emailsSent}, Errors: ${errors}`);

    return NextResponse.json({
      success: true,
      message: "Weekly digests sent",
      stats: {
        usersProcessed: users.length,
        emailsSent,
        errors,
        duration: `${duration}ms`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Weekly digest job failed:", error);
    return NextResponse.json(
      { error: "Weekly digest job failed", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
