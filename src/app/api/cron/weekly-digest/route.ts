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

    // Batched: 5 queries total regardless of user count. Counts were
    // cheap; round-26 also pulls the actual in-flight app records and
    // recent wins because a named application with a deadline badge
    // drives action the way a count never will.
    const userIds = users.filter((u) => u.email).map((u) => u.id);
    const [
      allNewGrants,
      inProgressApps,
      upcomingCounts,
      recentAwardedApps,
    ] = userIds.length
      ? await Promise.all([
          prisma.grant.findMany({
            where: {
              userId: { in: userIds },
              createdAt: { gte: oneWeekAgo },
              matchScore: { not: null },
            },
            orderBy: { matchScore: "desc" },
          }),
          // In-flight apps with the fields the digest actually renders —
          // we used to groupBy for counts; now we findMany and in-memory-
          // slice to top 5 per user, sorted by soonest deadline.
          prisma.application.findMany({
            where: {
              userId: { in: userIds },
              status: { in: ["draft", "in_progress", "ready_for_review"] },
            },
            select: {
              id: true,
              userId: true,
              status: true,
              grant: {
                select: { title: true, funder: true, deadline: true },
              },
            },
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
          prisma.application.findMany({
            where: {
              userId: { in: userIds },
              status: "awarded",
              awardedAt: { gte: oneWeekAgo },
            },
            select: {
              id: true,
              userId: true,
              awardAmount: true,
              awardedAt: true,
              grant: { select: { title: true } },
            },
            orderBy: { awardedAt: "desc" },
          }),
        ])
      : [[], [], [], []];

    const grantsByUser = new Map<string, typeof allNewGrants>();
    for (const g of allNewGrants) {
      const list = grantsByUser.get(g.userId!) ?? [];
      if (list.length < 10) list.push(g);
      grantsByUser.set(g.userId!, list);
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    // Sort in-flight apps: deadline-ascending nulls last. That puts
    // anything overdue / nearest-deadline at the top of each user's
    // section — the most action-triggering ordering.
    const inFlightSorted = [...inProgressApps].sort((a, b) => {
      const ad = a.grant.deadline?.getTime() ?? Number.POSITIVE_INFINITY;
      const bd = b.grant.deadline?.getTime() ?? Number.POSITIVE_INFINITY;
      return ad - bd;
    });
    const inFlightByUser = new Map<string, typeof inFlightSorted>();
    for (const a of inFlightSorted) {
      const list = inFlightByUser.get(a.userId) ?? [];
      if (list.length < 10) list.push(a);
      inFlightByUser.set(a.userId, list);
    }

    const winsByUser = new Map<string, typeof recentAwardedApps>();
    for (const w of recentAwardedApps) {
      const list = winsByUser.get(w.userId) ?? [];
      if (list.length < 5) list.push(w);
      winsByUser.set(w.userId, list);
    }

    const upcomingByUser = new Map<string, number>(
      upcomingCounts.map((c) => [c.userId, c._count._all])
    );

    for (const user of users) {
      if (!user.email) continue;

      try {
        const newGrants = grantsByUser.get(user.id) ?? [];
        const userInFlight = inFlightByUser.get(user.id) ?? [];
        const userWins = winsByUser.get(user.id) ?? [];
        const upcomingDeadlines = upcomingByUser.get(user.id) ?? 0;

        const formattedGrants = newGrants.map((grant) => ({
          id: grant.id,
          title: grant.title,
          funder: grant.funder,
          amount: grant.amountMax || grant.amountMin || 0,
          matchScore: grant.matchScore || 0,
        }));

        const inFlight = userInFlight.map((a) => {
          const deadline = a.grant.deadline ?? null;
          const daysUntilDeadline =
            deadline !== null
              ? Math.ceil((deadline.getTime() - now.getTime()) / msPerDay)
              : null;
          return {
            applicationId: a.id,
            grantTitle: a.grant.title,
            funder: a.grant.funder,
            status: a.status,
            deadline,
            daysUntilDeadline,
          };
        });

        const wins = userWins
          .filter((w) => w.awardedAt !== null)
          .map((w) => ({
            applicationId: w.id,
            grantTitle: w.grant.title,
            awardAmount: w.awardAmount ?? null,
            awardedAt: w.awardedAt as Date,
          }));

        const stats = {
          applicationsInProgress: userInFlight.length,
          upcomingDeadlines,
        };

        // Don't send an empty digest — it's the kind of noise that trains
        // users to filter us into a folder they never open. The richer
        // digest now also skips when the user has zero in-flight work
        // AND zero wins (the two cases that *must* surface).
        if (
          formattedGrants.length === 0 &&
          inFlight.length === 0 &&
          wins.length === 0 &&
          upcomingDeadlines === 0
        ) {
          continue;
        }

        await sendWeeklyDigestEmail(
          user.email,
          user.name || undefined,
          formattedGrants,
          stats,
          inFlight,
          wins
        );
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
