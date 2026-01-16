// Cron endpoint for automated grant scraping
// This can be called by Vercel Cron Jobs or external schedulers

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scrapeAllGrants, type ScrapedGrant } from "@/lib/grant-scraper";

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Starting grant scraping job...");
    const startTime = Date.now();

    // Scrape grants from all sources
    const grants = await scrapeAllGrants();

    // Upsert grants into database
    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const grant of grants) {
      try {
        // Check if grant already exists (by title and funder)
        const existing = await prisma.grant.findFirst({
          where: {
            title: grant.title,
            funder: grant.funder,
          },
        });

        if (existing) {
          // Update existing grant
          await prisma.grant.update({
            where: { id: existing.id },
            data: {
              description: grant.description,
              amount: grant.amount,
              amountMin: grant.amountMin,
              amountMax: grant.amountMax,
              deadline: grant.deadline,
              url: grant.url,
              type: grant.type,
              category: grant.category,
              eligibility: grant.eligibility,
              requirements: grant.requirements,
              state: grant.state,
              tags: grant.tags,
              source: grant.source,
              scrapedAt: grant.scrapedAt,
              agencyName: grant.agencyName,
              updatedAt: new Date(),
            },
          });
          updated++;
        } else {
          // Create new grant
          await prisma.grant.create({
            data: {
              title: grant.title,
              funder: grant.funder,
              description: grant.description,
              amount: grant.amount,
              amountMin: grant.amountMin,
              amountMax: grant.amountMax,
              deadline: grant.deadline,
              url: grant.url,
              type: grant.type,
              category: grant.category,
              eligibility: grant.eligibility,
              requirements: grant.requirements,
              state: grant.state,
              tags: grant.tags,
              source: grant.source,
              scrapedAt: grant.scrapedAt,
              agencyName: grant.agencyName,
              status: "discovered",
            },
          });
          created++;
        }
      } catch (err) {
        console.error(`Error saving grant "${grant.title}":`, err);
        errors++;
      }
    }

    const duration = Date.now() - startTime;

    console.log(`Grant scraping completed in ${duration}ms`);
    console.log(`Created: ${created}, Updated: ${updated}, Errors: ${errors}`);

    return NextResponse.json({
      success: true,
      message: "Grant scraping completed",
      stats: {
        total: grants.length,
        created,
        updated,
        errors,
        duration: `${duration}ms`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Grant scraping failed:", error);
    return NextResponse.json(
      { error: "Grant scraping failed", details: String(error) },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
