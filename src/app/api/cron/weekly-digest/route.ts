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
    console.info("Starting weekly digest job...");
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

    // CLOUD-ARCHITECT batch fix: three queries × N users → 3 queries total.
    // Grants are sorted/scored in memory after the single fetch because
    // Prisma's take+orderBy doesn't compose across users in one query.
    const userIds = users.filter((u) => u.email).map((u) => u.id);
    const [allNewGrants, inProgressCounts, upcomingCounts] = userIds.length
      ? await Promise.all([
          prisma.grant.findMany({
            where: {
              userId: { in: userIds },
              createdAt: { gte: oneWeekAgo },
              matchScore: { not: null },
            },
            orderBy: { matchScore: "desc" },
          }),
          prisma.application.groupBy({
            by: ["userId"],
            where: {
              userId: { in: userIds },
              status: { in: ["draft", "in_progress"] },
            },
            _count: { _all: true },
          }),
          prisma.application.groupBy({
            by: ["userId"],
            where: {
              userId: { in: userIds },
              status: { in: ["draft", "in_progress"] },
              grant: { deadline: { gte: now, lte: twoWeeksFromNow } },
            },
            _count: { _all: true },
          }),
        ])
      : [[], [], []];

    const grantsByUser = new Map<string, typeof allNewGrants>();
    for (const g of allNewGrants) {
      const list = grantsByUser.get(g.userId!) ?? [];
      if (list.length < 10) list.push(g);
      grantsByUser.set(g.userId!, list);
    }
    const inProgressByUser = new Map<string, number>(
      inProgressCounts.map((c) => [c.userId, c._count._all])
    );
    const upcomingByUser = new Map<string, number>(
      upcomingCounts.map((c) => [c.userId, c._count._all])
    );

    for (const user of users) {
      if (!user.email) continue;

      try {
        const newGrants = grantsByUser.get(user.id) ?? [];
        const applicationsInProgress = inProgressByUser.get(user.id) ?? 0;
        const upcomingDeadlines = upcomingByUser.get(user.id) ?? 0;

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

        // Don't send an empty digest — it's the kind of noise that trains
        // users to filter us into a folder they never open. Skip the send
        // if we have nothing genuinely new to report.
        if (
          formattedGrants.length === 0 &&
          applicationsInProgress === 0 &&
          upcomingDeadlines === 0
        ) {
          continue;
        }

        await sendWeeklyDigestEmail(user.email, user.name || undefined, formattedGrants, stats);
        emailsSent++;
      } catch (err) {
        console.error(`Failed to send weekly digest to ${user.email}:`, err);
        errors++;
      }
    }

    const duration = Date.now() - startTime;

    console.info(`Weekly digest job completed in ${duration}ms`);
    console.info(`Sent: ${emailsSent}, Errors: ${errors}`);

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
