// Cron endpoint for automated scholarship scraping
// Called by Vercel Cron Jobs or external schedulers

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scholarshipSourceRegistry } from "@/lib/scholarship-sources";

const CRON_SECRET = process.env.CRON_SECRET;

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
    console.info("Starting scholarship scraping job...");
    const startTime = Date.now();

    // Step 1: Mark expired scholarships
    const now = new Date();
    await prisma.scholarship.updateMany({
      where: {
        deadline: { lt: now },
        status: "active",
      },
      data: { status: "expired" },
    });

    // Step 2: Scrape from all enabled sources
    const scholarships = await scholarshipSourceRegistry.scrapeAll();

    // Step 3: Upsert into database
    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const scholarship of scholarships) {
      try {
        const existing = await prisma.scholarship.findFirst({
          where: {
            OR: [
              ...(scholarship.sourceId ? [{ sourceId: scholarship.sourceId }] : []),
              { title: scholarship.title, provider: scholarship.provider },
            ],
          },
        });

        const data = {
          title: scholarship.title,
          provider: scholarship.provider,
          description: scholarship.description,
          amount: scholarship.amount || null,
          amountMin: scholarship.amountMin || null,
          amountMax: scholarship.amountMax || null,
          deadline: scholarship.deadline || null,
          url: scholarship.url || null,
          applicationUrl: scholarship.applicationUrl || scholarship.url || null,
          scholarshipType: scholarship.scholarshipType,
          renewable: scholarship.renewable || false,
          minGPA: scholarship.minGPA || null,
          educationLevels: scholarship.educationLevels ? JSON.stringify(scholarship.educationLevels) : null,
          fieldsOfStudy: scholarship.fieldsOfStudy ? JSON.stringify(scholarship.fieldsOfStudy) : null,
          citizenshipRequired: scholarship.citizenshipRequired || null,
          stateRestriction: scholarship.stateRestriction || null,
          eligibilityText: scholarship.eligibilityText || null,
          essayRequired: scholarship.essayRequired || false,
          essayPrompt: scholarship.essayPrompt || null,
          essayWordLimit: scholarship.essayWordLimit || null,
          submissionMethod: scholarship.submissionMethod || "portal",
          portalUrl: scholarship.portalUrl || scholarship.applicationUrl || null,
          tags: scholarship.tags ? JSON.stringify(scholarship.tags) : null,
          sourceId: scholarship.sourceId || null,
          sourceUrl: scholarship.sourceUrl || null,
          lastScraped: new Date(),
          status: "active",
        };

        if (existing) {
          await prisma.scholarship.update({
            where: { id: existing.id },
            data,
          });
          updated++;
        } else {
          await prisma.scholarship.create({ data });
          created++;
        }
      } catch (err) {
        console.error(`Error saving scholarship "${scholarship.title}":`, err);
        errors++;
      }
    }

    const duration = Date.now() - startTime;

    console.info(`Scholarship scraping completed in ${duration}ms`);
    console.info(`Created: ${created}, Updated: ${updated}, Errors: ${errors}`);

    return NextResponse.json({
      success: true,
      message: "Scholarship scraping completed",
      stats: {
        total: scholarships.length,
        created,
        updated,
        errors,
        duration: `${duration}ms`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Scholarship scraping failed:", error);
    return NextResponse.json(
      { error: "Scholarship scraping failed", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
