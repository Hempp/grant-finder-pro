import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const CRON_SECRET = process.env.CRON_SECRET;

// GET - Find users who need outcome prompts (30-44 days after deadline)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!CRON_SECRET) {
    console.error("CRON_SECRET environment variable not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const fortyFourDaysAgo = new Date(now.getTime() - 44 * 24 * 60 * 60 * 1000);

    // Find submitted applications where:
    // - No outcome has been reported
    // - Grant deadline was 30-44 days ago
    const applications = await prisma.application.findMany({
      where: {
        status: "submitted",
        outcomeReportedAt: null,
        grant: {
          deadline: {
            gte: fortyFourDaysAgo,
            lte: thirtyDaysAgo,
          },
        },
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        grant: {
          select: { title: true, deadline: true },
        },
      },
    });

    let prompted = 0;
    const errors: string[] = [];

    for (const app of applications) {
      try {
        console.log(
          `[outcome-prompt] User ${app.user.email} needs prompting for "${app.grant.title}" (deadline: ${app.grant.deadline?.toISOString()})`
        );
        prompted++;
        // Email integration comes later - for now just log
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        errors.push(`Failed to process app ${app.id}: ${message}`);
        console.error(`[outcome-prompt] Error for app ${app.id}:`, err);
      }
    }

    console.log(
      `[outcome-prompt] Complete: checked=${applications.length}, prompted=${prompted}, errors=${errors.length}`
    );

    return NextResponse.json({
      checked: applications.length,
      prompted,
      errors: errors.length,
    });
  } catch (error) {
    console.error("Failed to run outcome prompts cron:", error);
    return NextResponse.json(
      { error: "Failed to run outcome prompts" },
      { status: 500 }
    );
  }
}
