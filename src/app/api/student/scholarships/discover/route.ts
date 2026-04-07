import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { scholarshipSourceRegistry } from "@/lib/scholarship-sources";
import type { ScrapedScholarship } from "@/lib/scholarship-sources";

// POST /api/student/scholarships/discover — Scrape all sources and upsert into the database
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const scraped: ScrapedScholarship[] = await scholarshipSourceRegistry.scrapeAll();

    let newCount = 0;
    let updatedCount = 0;

    for (const s of scraped) {
      const mapped = {
        title: s.title,
        provider: s.provider,
        description: s.description,
        amount: s.amount ?? null,
        amountMin: s.amountMin ?? null,
        amountMax: s.amountMax ?? null,
        deadline: s.deadline ?? null,
        url: s.url ?? null,
        applicationUrl: s.applicationUrl ?? null,
        scholarshipType: s.scholarshipType,
        renewable: s.renewable ?? false,
        minGPA: s.minGPA ?? null,
        educationLevels: s.educationLevels ? JSON.stringify(s.educationLevels) : null,
        fieldsOfStudy: s.fieldsOfStudy ? JSON.stringify(s.fieldsOfStudy) : null,
        citizenshipRequired: s.citizenshipRequired ?? null,
        stateRestriction: s.stateRestriction ?? null,
        eligibilityText: s.eligibilityText ?? null,
        essayRequired: s.essayRequired ?? false,
        essayPrompt: s.essayPrompt ?? null,
        essayWordLimit: s.essayWordLimit ?? null,
        submissionMethod: s.submissionMethod,
        portalUrl: s.portalUrl ?? null,
        tags: s.tags ? JSON.stringify(s.tags) : null,
        sourceId: s.sourceId ?? null,
        sourceUrl: s.sourceUrl ?? null,
        status: "active",
      };

      const existing = await prisma.scholarship.findFirst({
        where: { title: s.title, provider: s.provider },
      });

      if (existing) {
        await prisma.scholarship.update({
          where: { id: existing.id },
          data: { ...mapped, lastScraped: new Date() },
        });
        updatedCount++;
      } else {
        await prisma.scholarship.create({
          data: { ...mapped, lastScraped: new Date() },
        });
        newCount++;
      }
    }

    return NextResponse.json({
      discovered: scraped.length,
      new: newCount,
      updated: updatedCount,
    });
  } catch (error) {
    console.error("Failed to discover scholarships:", error);
    return NextResponse.json(
      { error: "Failed to discover scholarships" },
      { status: 500 }
    );
  }
}
