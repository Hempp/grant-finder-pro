// Script to clean expired grants and scrape fresh open opportunities
// Usage: NODE_TLS_REJECT_UNAUTHORIZED=0 npx tsx scripts/refresh-grants.ts

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { scrapeAllGrants } from "../src/lib/grant-scraper";
import "dotenv/config";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function refreshGrants() {
  const startTime = Date.now();
  console.log("=== GrantPilot Grant Refresh ===\n");

  // Step 1: Count current grants
  const totalBefore = await prisma.grant.count();
  console.log(`Current grants in database: ${totalBefore}`);

  // Step 2: Remove expired grants (no active applications)
  const now = new Date();
  const expired = await prisma.grant.deleteMany({
    where: {
      deadline: { lt: now },
      applications: { none: {} },
    },
  });
  console.log(`Removed ${expired.count} expired grants\n`);

  // Step 3: Scrape fresh grants from all sources
  console.log("Scraping fresh grants from Grants.gov + corporate + state sources...\n");
  const grants = await scrapeAllGrants();
  console.log(`\nScraped ${grants.length} open grants\n`);

  // Step 4: Upsert into database
  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const grant of grants) {
    try {
      const existing = await prisma.grant.findFirst({
        where: { title: grant.title, funder: grant.funder },
      });

      if (existing) {
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
      errors++;
    }
  }

  // Step 5: Summary
  const totalAfter = await prisma.grant.count();
  const openWithDeadline = await prisma.grant.count({
    where: { deadline: { gte: now } },
  });
  const rolling = await prisma.grant.count({
    where: { deadline: null },
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("\n=== Results ===");
  console.log(`Expired removed: ${expired.count}`);
  console.log(`New grants created: ${created}`);
  console.log(`Existing updated: ${updated}`);
  console.log(`Errors: ${errors}`);
  console.log(`\nTotal grants now: ${totalAfter}`);
  console.log(`  Open (with deadline): ${openWithDeadline}`);
  console.log(`  Rolling (no deadline): ${rolling}`);
  console.log(`\nCompleted in ${duration}s`);

  await pool.end();
}

refreshGrants().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
