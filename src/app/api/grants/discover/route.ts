// Manual grant discovery endpoint
// Allows triggering grant search on demand

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { searchGrantsGov, getCorporateGrants, getStateGrants, type ScrapedGrant } from "@/lib/grant-scraper";

interface DiscoverRequest {
  keyword?: string;
  type?: "federal" | "corporate" | "state" | "all";
  state?: string;
  save?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: DiscoverRequest = await request.json();
    const { keyword, type = "all", state, save = false } = body;

    const grants: ScrapedGrant[] = [];

    // Fetch grants based on type
    if (type === "federal" || type === "all") {
      if (keyword) {
        const federal = await searchGrantsGov(keyword, undefined, undefined, 50);
        grants.push(...federal);
      } else {
        // Default federal search
        const federal = await searchGrantsGov("small business", undefined, undefined, 50);
        grants.push(...federal);
      }
    }

    if (type === "corporate" || type === "all") {
      grants.push(...getCorporateGrants());
    }

    if (type === "state" || type === "all") {
      const stateGrants = getStateGrants();
      if (state) {
        grants.push(...stateGrants.filter(g => g.state === state.toUpperCase()));
      } else {
        grants.push(...stateGrants);
      }
    }

    // Filter by state if specified
    let filteredGrants = grants;
    if (state && type !== "state") {
      filteredGrants = grants.filter(g =>
        g.state === state.toUpperCase() || g.state === "ALL"
      );
    }

    // Optionally save to database
    if (save) {
      let saved = 0;
      for (const grant of filteredGrants) {
        try {
          const existing = await prisma.grant.findFirst({
            where: { title: grant.title, funder: grant.funder },
          });

          if (!existing) {
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
            saved++;
          }
        } catch {
          // Skip duplicates or errors
        }
      }

      return NextResponse.json({
        grants: filteredGrants,
        total: filteredGrants.length,
        saved,
      });
    }

    return NextResponse.json({
      grants: filteredGrants,
      total: filteredGrants.length,
    });
  } catch (error) {
    console.error("Grant discovery failed:", error);
    return NextResponse.json(
      { error: "Grant discovery failed", details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to list available grant sources
export async function GET() {
  return NextResponse.json({
    sources: {
      federal: {
        name: "Grants.gov",
        api: "https://api.grants.gov/v1/api/search2",
        description: "Federal government grants",
      },
      corporate: {
        count: getCorporateGrants().length,
        examples: ["AWS", "Google Cloud", "Microsoft", "FedEx", "Verizon"],
      },
      state: {
        count: getStateGrants().length,
        states: [...new Set(getStateGrants().map(g => g.state))],
      },
    },
    usage: {
      discover: "POST /api/grants/discover with { keyword?, type?, state?, save? }",
      scrape: "GET /api/cron/scrape-grants (requires CRON_SECRET)",
    },
  });
}
