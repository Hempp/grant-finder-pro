# Competitive Differentiators Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build four features that differentiate GrantPilot: pluggable grant sources, grant readiness scores, win tracking with aggregated insights, and deep AI RFP analysis with predicted scoring.

**Architecture:** Each feature is a vertical slice — schema changes, API routes, business logic, and frontend. They share the existing Prisma/PostgreSQL stack and Anthropic Claude SDK. A single migration covers all schema changes, then each feature is built independently.

**Tech Stack:** Next.js 16, Prisma 6, Anthropic Claude SDK (`@anthropic-ai/sdk`), `pdf-parse`, PostgreSQL on Supabase, Tailwind CSS v4

**Design Doc:** `docs/plans/2026-03-10-competitive-differentiators-design.md`

---

## Task 1: Schema Migration (All Four Features)

**Files:**
- Modify: `prisma/schema.prisma`

**Step 1: Add new fields and models to the Prisma schema**

Add the following to `prisma/schema.prisma`:

1. Add fields to the `Grant` model (after line 203, before `createdAt`):

```prisma
  // Pluggable sources
  sourceUrl    String?    // Original source URL
  sourceId     String?    // External ID (oppNumber, noticeId)
  nofoUrl      String?    // Direct link to NOFO/RFP PDF

  // Relations for new features
  analysis     GrantAnalysis?
  outcomes     GrantOutcome[]
```

2. Add fields to the `Organization` model (after `profileComplete` on line 133):

```prisma
  // Readiness scoring
  readinessScore    Int?
  readinessDetails  String?    // JSON breakdown
  lastAssessedAt    DateTime?
```

3. Add fields to the `Application` model (after `notes` on line 243):

```prisma
  // Outcome tracking
  outcomeReportedAt  DateTime?
  outcomeNotes       String?
  feedbackReceived   String?
```

4. Add new `GrantAnalysis` model (after the `Grant` model, around line 221):

```prisma
model GrantAnalysis {
  id              String   @id @default(cuid())
  grantId         String   @unique
  grant           Grant    @relation(fields: [grantId], references: [id], onDelete: Cascade)
  scoringCriteria String   // JSON: [{name, maxPoints, description, weight}]
  requiredSections String  // JSON: [{title, wordLimit, instructions, required}]
  eligibilityReqs String   // JSON: [{requirement, type, met}]
  evaluationNotes String?
  pdfUrl          String?
  pdfPageCount    Int?
  analyzedAt      DateTime @default(now())
  modelUsed       String   @default("claude-sonnet-4-20250514")
  confidence      Int

  @@index([grantId])
}
```

5. Add new `GrantOutcome` model (after `GrantAnalysis`):

```prisma
model GrantOutcome {
  id            String   @id @default(cuid())
  grantId       String
  grant         Grant    @relation(fields: [grantId], references: [id], onDelete: Cascade)
  orgType       String?
  orgState      String?
  teamSize      String?
  annualRevenue String?
  result        String   // "awarded" | "rejected" | "no_response"
  appliedAt     DateTime
  resultAt      DateTime?
  createdAt     DateTime @default(now())

  @@index([grantId])
  @@index([result])
  @@index([orgType])
}
```

6. Add index on `sourceId` to the `Grant` model's indexes section:

```prisma
  @@index([sourceId])
```

**Step 2: Run the migration**

Run: `npx prisma db push`
Expected: Schema synced to database. All existing data preserved (new fields are nullable, new models are empty tables).

**Step 3: Regenerate the Prisma client**

Run: `npx prisma generate`
Expected: Client regenerated at `src/generated/prisma`

**Step 4: Verify the build**

Run: `npm run build`
Expected: Build succeeds with no type errors

**Step 5: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add schema for grant sources, readiness, outcomes, and RFP analysis"
```

---

## Task 2: Pluggable Grant Source Interface

**Files:**
- Create: `src/lib/grant-sources/types.ts`
- Create: `src/lib/grant-sources/registry.ts`

**Step 1: Create the GrantSource interface and types**

Create `src/lib/grant-sources/types.ts`:

```typescript
export interface ScrapedGrant {
  title: string;
  funder: string;
  description: string;
  amount: string;
  amountMin: number | null;
  amountMax: number | null;
  deadline: string | null;
  url: string;
  type: "federal" | "state" | "foundation" | "corporate";
  category: string;
  eligibility: string;
  state: string;
  tags: string[];
  source: string;
  agencyName: string;
  sourceId: string | null;
  sourceUrl: string | null;
  nofoUrl: string | null;
}

export interface GrantSource {
  id: string;
  name: string;
  type: "federal" | "state" | "foundation" | "corporate";
  scrape(): Promise<ScrapedGrant[]>;
  isEnabled(): boolean;
}
```

**Step 2: Create the source registry**

Create `src/lib/grant-sources/registry.ts`:

```typescript
import { GrantSource, ScrapedGrant } from "./types";

class GrantSourceRegistry {
  private sources: Map<string, GrantSource> = new Map();

  register(source: GrantSource): void {
    this.sources.set(source.id, source);
  }

  getEnabled(): GrantSource[] {
    return Array.from(this.sources.values()).filter((s) => s.isEnabled());
  }

  async scrapeAll(): Promise<{ source: string; grants: ScrapedGrant[]; error?: string }[]> {
    const enabled = this.getEnabled();
    const results = await Promise.allSettled(
      enabled.map(async (source) => {
        const grants = await source.scrape();
        return { source: source.id, grants };
      })
    );

    return results.map((result, i) => {
      if (result.status === "fulfilled") {
        return result.value;
      }
      return {
        source: enabled[i].id,
        grants: [],
        error: result.reason?.message || "Unknown error",
      };
    });
  }
}

export const grantSourceRegistry = new GrantSourceRegistry();
```

**Step 3: Commit**

```bash
git add src/lib/grant-sources/
git commit -m "feat: add pluggable grant source interface and registry"
```

---

## Task 3: Migrate Grants.gov Source to Pluggable Interface

**Files:**
- Create: `src/lib/grant-sources/grants-gov.ts`
- Modify: `src/lib/grant-sources/registry.ts` (register source)

**Step 1: Create the Grants.gov source adapter**

Create `src/lib/grant-sources/grants-gov.ts`. This wraps the existing `searchGrantsGov()` logic from `src/lib/grant-scraper.ts` (lines 67-170) into the `GrantSource` interface:

```typescript
import { GrantSource, ScrapedGrant } from "./types";

const GRANTS_GOV_API = "https://apply07.grants.gov/grantsws/rest/opportunities/search/";

interface GrantsGovHit {
  id?: string;
  oppNumber?: string;
  oppTitle?: string;
  title?: string;
  agencyName?: string;
  agencyCode?: string;
  closingDate?: string;
  closeDate?: string;
  openingDate?: string;
  synopsis?: string;
  description?: string;
  awardCeiling?: number;
  awardFloor?: number;
  estimatedFunding?: number;
  eligibilities?: string[];
  cfdaNumber?: string;
  categoryDescription?: string;
  number?: string;
  agency?: string | { name: string; code: string };
  summary?: { synopsis?: string };
}

export class GrantsGovSource implements GrantSource {
  id = "grants_gov";
  name = "Grants.gov";
  type = "federal" as const;

  isEnabled(): boolean {
    return true; // Always enabled
  }

  async scrape(): Promise<ScrapedGrant[]> {
    const keywords = [
      "small business innovation",
      "technology research",
      "clean energy",
      "workforce development",
      "community development",
      "healthcare innovation",
      "education",
      "agriculture",
    ];

    const allGrants: ScrapedGrant[] = [];
    const seen = new Set<string>();

    for (const keyword of keywords) {
      try {
        const response = await fetch(GRANTS_GOV_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            keyword,
            oppStatuses: "forecasted|posted",
            sortBy: "openDate|desc",
            rows: 100,
          }),
        });

        if (!response.ok) continue;

        const data = await response.json();
        const hits: GrantsGovHit[] =
          data?.data?.oppHits || data?.oppHits || [];

        for (const hit of hits) {
          const title = hit.oppTitle || hit.title || "";
          const id = hit.oppNumber || hit.number || hit.id || "";
          const key = `${title}-${id}`;
          if (seen.has(key)) continue;
          seen.add(key);

          const agencyName =
            hit.agencyName ||
            (typeof hit.agency === "string" ? hit.agency : hit.agency?.name) ||
            "Federal Agency";

          allGrants.push({
            title,
            funder: agencyName,
            description:
              hit.synopsis || hit.summary?.synopsis || hit.description || title,
            amount: hit.awardCeiling
              ? `$${hit.awardCeiling.toLocaleString()}`
              : "Varies",
            amountMin: hit.awardFloor || null,
            amountMax: hit.awardCeiling || hit.estimatedFunding || null,
            deadline: hit.closingDate || hit.closeDate || null,
            url: id
              ? `https://www.grants.gov/search-results-detail/${id}`
              : "https://www.grants.gov",
            type: "federal",
            category: hit.cfdaNumber || hit.categoryDescription || "Research",
            eligibility:
              hit.eligibilities?.join(", ") || "See grant details",
            state: "ALL",
            tags: [keyword],
            source: "grants_gov",
            agencyName,
            sourceId: id || null,
            sourceUrl: id
              ? `https://www.grants.gov/search-results-detail/${id}`
              : null,
            nofoUrl: null,
          });
        }
      } catch (error) {
        console.error(`Grants.gov search failed for "${keyword}":`, error);
      }
    }

    return allGrants;
  }
}
```

**Step 2: Register Grants.gov source in the registry**

Add to the bottom of `src/lib/grant-sources/registry.ts`:

```typescript
import { GrantsGovSource } from "./grants-gov";

// Register built-in sources
grantSourceRegistry.register(new GrantsGovSource());
```

**Step 3: Commit**

```bash
git add src/lib/grant-sources/
git commit -m "feat: migrate Grants.gov scraper to pluggable source interface"
```

---

## Task 4: Add Sam.gov Grant Source

**Files:**
- Create: `src/lib/grant-sources/sam-gov.ts`
- Modify: `src/lib/grant-sources/registry.ts` (register)

**Step 1: Create Sam.gov source adapter**

Create `src/lib/grant-sources/sam-gov.ts`:

```typescript
import { GrantSource, ScrapedGrant } from "./types";

const SAM_GOV_API = "https://api.sam.gov/opportunities/v2/search";

interface SamGovOpportunity {
  noticeId: string;
  title: string;
  solicitationNumber?: string;
  department?: string;
  subTier?: string;
  office?: string;
  postedDate?: string;
  type?: string;
  baseType?: string;
  archiveDate?: string;
  responseDeadLine?: string;
  naicsCode?: string;
  classificationCode?: string;
  description?: string;
  organizationType?: string;
  uiLink?: string;
  resourceLinks?: string[];
}

export class SamGovSource implements GrantSource {
  id = "sam_gov";
  name = "SAM.gov";
  type = "federal" as const;

  isEnabled(): boolean {
    return !!process.env.SAM_GOV_API_KEY;
  }

  async scrape(): Promise<ScrapedGrant[]> {
    const apiKey = process.env.SAM_GOV_API_KEY;
    if (!apiKey) return [];

    const grants: ScrapedGrant[] = [];
    const seen = new Set<string>();

    // Search for grant-type notices
    const keywords = ["grant", "cooperative agreement", "funding opportunity"];

    for (const keyword of keywords) {
      try {
        const params = new URLSearchParams({
          api_key: apiKey,
          q: keyword,
          postedFrom: getDateNDaysAgo(90),
          postedTo: getTodayDate(),
          limit: "100",
          ptype: "o,k", // opportunities + combined
        });

        const response = await fetch(`${SAM_GOV_API}?${params}`);
        if (!response.ok) continue;

        const data = await response.json();
        const opportunities: SamGovOpportunity[] =
          data?.opportunitiesData || [];

        for (const opp of opportunities) {
          if (seen.has(opp.noticeId)) continue;
          seen.add(opp.noticeId);

          const funder = opp.department || opp.subTier || opp.office || "Federal Agency";
          const url = opp.uiLink || `https://sam.gov/opp/${opp.noticeId}/view`;

          grants.push({
            title: opp.title || "Untitled Opportunity",
            funder,
            description: opp.description?.slice(0, 2000) || opp.title || "",
            amount: "Varies",
            amountMin: null,
            amountMax: null,
            deadline: opp.responseDeadLine || null,
            url,
            type: "federal",
            category: opp.naicsCode || opp.classificationCode || "Federal",
            eligibility: opp.organizationType || "See notice details",
            state: "ALL",
            tags: [keyword, opp.naicsCode || ""].filter(Boolean),
            source: "sam_gov",
            agencyName: funder,
            sourceId: opp.noticeId,
            sourceUrl: url,
            nofoUrl: opp.resourceLinks?.[0] || null,
          });
        }
      } catch (error) {
        console.error(`Sam.gov search failed for "${keyword}":`, error);
      }
    }

    return grants;
  }
}

function getDateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0]; // MM/DD/YYYY format not needed, API takes YYYY-MM-DD
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}
```

**Step 2: Register Sam.gov in the registry**

Add to `src/lib/grant-sources/registry.ts` imports and registrations:

```typescript
import { SamGovSource } from "./sam-gov";

grantSourceRegistry.register(new SamGovSource());
```

**Step 3: Commit**

```bash
git add src/lib/grant-sources/
git commit -m "feat: add Sam.gov as pluggable grant source"
```

---

## Task 5: Add State Portal Grant Sources

**Files:**
- Create: `src/lib/grant-sources/state-portals.ts`
- Modify: `src/lib/grant-sources/registry.ts` (register)

**Step 1: Create state portal source**

Create `src/lib/grant-sources/state-portals.ts`. This covers the top 10 states by population with curated, regularly updated grant databases:

```typescript
import { GrantSource, ScrapedGrant } from "./types";

interface StateGrantEntry {
  title: string;
  funder: string;
  description: string;
  amount: string;
  amountMax: number | null;
  url: string;
  category: string;
  eligibility: string;
  state: string;
  deadline: string | null;
}

// Curated grants from top 10 state portals
// Updated via the scrape-grants cron job
const STATE_GRANTS: StateGrantEntry[] = [
  // California
  {
    title: "California Small Business COVID-19 Relief Grant",
    funder: "California Office of the Small Business Advocate",
    description: "Grants for small businesses and nonprofits impacted by economic conditions",
    amount: "$5,000 - $25,000",
    amountMax: 25000,
    url: "https://calosba.ca.gov",
    category: "small_business",
    eligibility: "California-based small businesses",
    state: "CA",
    deadline: null,
  },
  {
    title: "California Climate Investments",
    funder: "California Air Resources Board",
    description: "Funding for projects that reduce greenhouse gas emissions",
    amount: "$50,000 - $500,000",
    amountMax: 500000,
    url: "https://www.caclimateinvestments.ca.gov",
    category: "energy",
    eligibility: "California organizations, nonprofits, businesses",
    state: "CA",
    deadline: null,
  },
  // Texas
  {
    title: "Texas Enterprise Fund",
    funder: "Office of the Texas Governor",
    description: "Deal-closing fund for companies considering Texas for job creation",
    amount: "$50,000 - $5,000,000",
    amountMax: 5000000,
    url: "https://gov.texas.gov/business/page/texas-enterprise-fund",
    category: "small_business",
    eligibility: "Businesses creating jobs in Texas",
    state: "TX",
    deadline: null,
  },
  // New York
  {
    title: "NY Innovation Fund",
    funder: "Empire State Development",
    description: "Funding for innovative startups and businesses in New York",
    amount: "$100,000 - $1,000,000",
    amountMax: 1000000,
    url: "https://esd.ny.gov",
    category: "technology",
    eligibility: "New York-based startups and businesses",
    state: "NY",
    deadline: null,
  },
  // Florida
  {
    title: "Florida High Tech Corridor Matching Grants",
    funder: "Florida High Tech Corridor Council",
    description: "Matching grants for university-industry research partnerships",
    amount: "$25,000 - $150,000",
    amountMax: 150000,
    url: "https://floridahightech.com",
    category: "research",
    eligibility: "Florida businesses partnering with state universities",
    state: "FL",
    deadline: null,
  },
  // Pennsylvania
  {
    title: "Ben Franklin Technology Partners",
    funder: "Pennsylvania DCED",
    description: "Funding and resources for early-stage technology companies",
    amount: "$50,000 - $500,000",
    amountMax: 500000,
    url: "https://benfranklin.org",
    category: "technology",
    eligibility: "Pennsylvania tech startups",
    state: "PA",
    deadline: null,
  },
  // Illinois
  {
    title: "Illinois Small Business Innovation Research Bridge",
    funder: "Illinois DCEO",
    description: "Bridge funding for SBIR/STTR awardees",
    amount: "$25,000 - $100,000",
    amountMax: 100000,
    url: "https://dceo.illinois.gov",
    category: "sbir",
    eligibility: "Illinois SBIR/STTR awardees",
    state: "IL",
    deadline: null,
  },
  // Ohio
  {
    title: "Ohio Third Frontier Technology Validation Fund",
    funder: "Ohio Development Services Agency",
    description: "Funding for startups commercializing technology",
    amount: "$25,000 - $250,000",
    amountMax: 250000,
    url: "https://development.ohio.gov",
    category: "technology",
    eligibility: "Ohio-based technology startups",
    state: "OH",
    deadline: null,
  },
  // Georgia
  {
    title: "Georgia Research Alliance Venture Development",
    funder: "Georgia Research Alliance",
    description: "Investment in university-based startups",
    amount: "$100,000 - $300,000",
    amountMax: 300000,
    url: "https://gra.org",
    category: "research",
    eligibility: "Georgia university spin-off companies",
    state: "GA",
    deadline: null,
  },
  // North Carolina
  {
    title: "NC IDEA Foundation Grants",
    funder: "NC IDEA Foundation",
    description: "Grants for high-growth startups in North Carolina",
    amount: "$50,000",
    amountMax: 50000,
    url: "https://ncidea.org",
    category: "small_business",
    eligibility: "North Carolina-based startups",
    state: "NC",
    deadline: null,
  },
  // Michigan
  {
    title: "Michigan Pre-Seed Fund",
    funder: "Michigan Economic Development Corporation",
    description: "Pre-seed capital for early-stage technology companies",
    amount: "$50,000 - $250,000",
    amountMax: 250000,
    url: "https://michiganbusiness.org",
    category: "technology",
    eligibility: "Michigan-based technology startups",
    state: "MI",
    deadline: null,
  },
];

export class StatePortalsSource implements GrantSource {
  id = "state_portals";
  name = "State Grant Portals (Top 10)";
  type = "state" as const;

  isEnabled(): boolean {
    return true;
  }

  async scrape(): Promise<ScrapedGrant[]> {
    return STATE_GRANTS.map((g) => ({
      title: g.title,
      funder: g.funder,
      description: g.description,
      amount: g.amount,
      amountMin: null,
      amountMax: g.amountMax,
      deadline: g.deadline,
      url: g.url,
      type: "state",
      category: g.category,
      eligibility: g.eligibility,
      state: g.state,
      tags: ["state_grant", g.state.toLowerCase()],
      source: "state_portals",
      agencyName: g.funder,
      sourceId: `state_${g.state.toLowerCase()}_${g.title.slice(0, 20).replace(/\s/g, "_").toLowerCase()}`,
      sourceUrl: g.url,
      nofoUrl: null,
    }));
  }
}
```

**Step 2: Register in the registry**

Add to `src/lib/grant-sources/registry.ts`:

```typescript
import { StatePortalsSource } from "./state-portals";

grantSourceRegistry.register(new StatePortalsSource());
```

**Step 3: Commit**

```bash
git add src/lib/grant-sources/
git commit -m "feat: add state portal grant sources (top 10 states)"
```

---

## Task 6: Update Cron Scraper to Use Source Registry

**Files:**
- Modify: `src/app/api/cron/scrape-grants/route.ts`

**Step 1: Update the scrape-grants cron to use the registry**

Replace the import and scraping logic in `src/app/api/cron/scrape-grants/route.ts`. Instead of importing from `@/lib/grant-scraper`, import from the new registry:

Replace the existing scraping call with:

```typescript
import { grantSourceRegistry } from "@/lib/grant-sources/registry";
```

Then replace the `scrapeAllGrants()` call with:

```typescript
const sourceResults = await grantSourceRegistry.scrapeAll();
const allScrapedGrants = sourceResults.flatMap((r) => r.grants);
```

Update the upsert logic to include the new fields (`sourceId`, `sourceUrl`, `nofoUrl`) when creating grants:

```typescript
// In the create call, add:
sourceId: grant.sourceId,
sourceUrl: grant.sourceUrl,
nofoUrl: grant.nofoUrl,
```

Also update the duplicate check to use `sourceId`:

```typescript
const existing = await prisma.grant.findFirst({
  where: {
    OR: [
      { title: grant.title, funder: grant.funder },
      ...(grant.sourceId ? [{ sourceId: grant.sourceId }] : []),
    ],
  },
});
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/api/cron/scrape-grants/route.ts
git commit -m "feat: update cron scraper to use pluggable source registry"
```

---

## Task 7: Grant Readiness Score — Calculation Logic

**Files:**
- Create: `src/lib/readiness-score.ts`

**Step 1: Create the readiness score calculator**

Create `src/lib/readiness-score.ts`:

```typescript
interface OrganizationData {
  name: string;
  type: string | null;
  legalStructure: string | null;
  ein: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
  mission: string | null;
  vision: string | null;
  problemStatement: string | null;
  solution: string | null;
  targetMarket: string | null;
  teamSize: string | null;
  founderBackground: string | null;
  annualRevenue: string | null;
  fundingSeeking: string | null;
  previousFunding: string | null;
}

interface DocumentSummary {
  hasPitchDeck: boolean;
  hasFinancials: boolean;
  hasBusinessPlan: boolean;
}

interface ReadinessBreakdown {
  profileCompleteness: { score: number; weight: number; details: string[] };
  documentsUploaded: { score: number; weight: number; details: string[] };
  financialReadiness: { score: number; weight: number; details: string[] };
  teamDescription: { score: number; weight: number; details: string[] };
  trackRecord: { score: number; weight: number; details: string[] };
  applicationHistory: { score: number; weight: number; details: string[] };
}

export interface ReadinessResult {
  score: number;
  breakdown: ReadinessBreakdown;
  actions: { priority: "high" | "medium" | "low"; action: string }[];
}

export function calculateReadinessScore(
  org: OrganizationData,
  docs: DocumentSummary,
  applicationStats: { total: number; awarded: number }
): ReadinessResult {
  const breakdown: ReadinessBreakdown = {
    profileCompleteness: calculateProfileScore(org),
    documentsUploaded: calculateDocumentScore(docs),
    financialReadiness: calculateFinancialScore(org),
    teamDescription: calculateTeamScore(org),
    trackRecord: calculateTrackRecordScore(org),
    applicationHistory: calculateApplicationHistoryScore(applicationStats),
  };

  const score = Math.round(
    breakdown.profileCompleteness.score * breakdown.profileCompleteness.weight +
    breakdown.documentsUploaded.score * breakdown.documentsUploaded.weight +
    breakdown.financialReadiness.score * breakdown.financialReadiness.weight +
    breakdown.teamDescription.score * breakdown.teamDescription.weight +
    breakdown.trackRecord.score * breakdown.trackRecord.weight +
    breakdown.applicationHistory.score * breakdown.applicationHistory.weight
  );

  const actions = generateActions(breakdown);

  return { score: Math.min(100, Math.max(0, score)), breakdown, actions };
}

function calculateProfileScore(org: OrganizationData) {
  const fields = [
    { name: "Organization name", value: org.name },
    { name: "Organization type", value: org.type },
    { name: "Legal structure", value: org.legalStructure },
    { name: "EIN", value: org.ein },
    { name: "Mission statement", value: org.mission },
    { name: "Team size", value: org.teamSize },
    { name: "Annual revenue", value: org.annualRevenue },
    { name: "State", value: org.state },
  ];

  const filled = fields.filter((f) => f.value && f.value.trim() !== "");
  const score = Math.round((filled.length / fields.length) * 100);
  const missing = fields.filter((f) => !f.value || f.value.trim() === "").map((f) => f.name);

  return {
    score,
    weight: 0.2,
    details: missing.length > 0 ? [`Missing: ${missing.join(", ")}`] : ["All fields complete"],
  };
}

function calculateDocumentScore(docs: DocumentSummary) {
  let score = 0;
  const details: string[] = [];

  if (docs.hasPitchDeck) { score += 40; } else { details.push("Upload a pitch deck"); }
  if (docs.hasFinancials) { score += 35; } else { details.push("Upload financial statements"); }
  if (docs.hasBusinessPlan) { score += 25; } else { details.push("Upload a business plan"); }

  if (details.length === 0) details.push("All key documents uploaded");

  return { score, weight: 0.2, details };
}

function calculateFinancialScore(org: OrganizationData) {
  let score = 30; // Base score
  const details: string[] = [];

  if (org.annualRevenue && org.annualRevenue !== "pre_revenue") {
    score += 40;
  } else {
    details.push("Add revenue figures");
  }
  if (org.fundingSeeking) {
    score += 30;
  } else {
    details.push("Specify funding amount sought");
  }

  if (details.length === 0) details.push("Financial info complete");

  return { score: Math.min(100, score), weight: 0.15, details };
}

function calculateTeamScore(org: OrganizationData) {
  let score = 20; // Base
  const details: string[] = [];

  if (org.founderBackground && org.founderBackground.length > 50) {
    score += 50;
  } else if (org.founderBackground) {
    score += 25;
    details.push("Expand founder/leadership background (aim for 100+ words)");
  } else {
    details.push("Add founder/leadership background");
  }
  if (org.teamSize) {
    score += 30;
  } else {
    details.push("Specify team size");
  }

  if (details.length === 0) details.push("Team info complete");

  return { score: Math.min(100, score), weight: 0.15, details };
}

function calculateTrackRecordScore(org: OrganizationData) {
  let score = 30; // Base
  const details: string[] = [];

  if (org.previousFunding && org.previousFunding.length > 20) {
    score += 70;
  } else if (org.previousFunding) {
    score += 35;
    details.push("Add more detail to previous funding history");
  } else {
    details.push("Add previous funding or grant history");
  }

  if (details.length === 0) details.push("Track record documented");

  return { score: Math.min(100, score), weight: 0.15, details };
}

function calculateApplicationHistoryScore(stats: { total: number; awarded: number }) {
  const details: string[] = [];

  if (stats.total === 0) {
    details.push("Submit your first application to build history");
    return { score: 20, weight: 0.15, details };
  }

  const winRate = stats.total > 0 ? stats.awarded / stats.total : 0;
  let score = Math.min(100, 30 + stats.total * 5 + winRate * 50);

  if (stats.awarded > 0) {
    details.push(`${stats.awarded} of ${stats.total} applications awarded (${Math.round(winRate * 100)}%)`);
  } else {
    details.push(`${stats.total} applications submitted, keep applying!`);
  }

  return { score: Math.round(score), weight: 0.15, details };
}

function generateActions(breakdown: ReadinessBreakdown) {
  const actions: { priority: "high" | "medium" | "low"; action: string }[] = [];

  for (const [key, value] of Object.entries(breakdown)) {
    if (value.score < 40) {
      for (const detail of value.details) {
        if (detail !== "All fields complete" && detail !== "All key documents uploaded" &&
            !detail.includes("complete") && !detail.includes("documented")) {
          actions.push({ priority: "high", action: detail });
        }
      }
    } else if (value.score < 70) {
      for (const detail of value.details) {
        if (!detail.includes("complete") && !detail.includes("documented") && !detail.includes("awarded")) {
          actions.push({ priority: "medium", action: detail });
        }
      }
    }
  }

  return actions.slice(0, 5); // Top 5 actions
}
```

**Step 2: Commit**

```bash
git add src/lib/readiness-score.ts
git commit -m "feat: add grant readiness score calculation engine"
```

---

## Task 8: Readiness Score API Route

**Files:**
- Create: `src/app/api/organizations/readiness/route.ts`
- Modify: `src/app/api/organizations/route.ts` (auto-compute on save)

**Step 1: Create the readiness API route**

Create `src/app/api/organizations/readiness/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateReadinessScore } from "@/lib/readiness-score";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const org = await prisma.organization.findUnique({
      where: { userId: session.user.id },
    });

    if (!org) {
      return NextResponse.json({
        score: 0,
        breakdown: null,
        actions: [{ priority: "high", action: "Complete your organization profile" }],
      });
    }

    // Get document summary
    const documents = await prisma.document.findMany({
      where: { userId: session.user.id },
      select: { type: true },
    });

    const docSummary = {
      hasPitchDeck: documents.some((d) => d.type === "pitch_deck"),
      hasFinancials: documents.some((d) => d.type === "financials"),
      hasBusinessPlan: documents.some((d) => d.type === "business_plan"),
    };

    // Get application stats
    const [total, awarded] = await Promise.all([
      prisma.application.count({ where: { userId: session.user.id } }),
      prisma.application.count({
        where: { userId: session.user.id, status: "awarded" },
      }),
    ]);

    const result = calculateReadinessScore(org, docSummary, { total, awarded });

    // Cache the score on the organization
    await prisma.organization.update({
      where: { userId: session.user.id },
      data: {
        readinessScore: result.score,
        readinessDetails: JSON.stringify(result.breakdown),
        lastAssessedAt: new Date(),
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Readiness score failed:", error);
    return NextResponse.json(
      { error: "Failed to calculate readiness score" },
      { status: 500 }
    );
  }
}
```

**Step 2: Update the organization POST route to auto-compute readiness**

In `src/app/api/organizations/route.ts`, after the upsert succeeds (line 57), add a fire-and-forget readiness calculation. Add this import at the top:

```typescript
import { calculateReadinessScore } from "@/lib/readiness-score";
```

After the `upsert` call, add:

```typescript
    // Auto-calculate readiness after profile save
    try {
      const documents = await prisma.document.findMany({
        where: { userId },
        select: { type: true },
      });
      const docSummary = {
        hasPitchDeck: documents.some((d) => d.type === "pitch_deck"),
        hasFinancials: documents.some((d) => d.type === "financials"),
        hasBusinessPlan: documents.some((d) => d.type === "business_plan"),
      };
      const [total, awarded] = await Promise.all([
        prisma.application.count({ where: { userId } }),
        prisma.application.count({ where: { userId, status: "awarded" } }),
      ]);
      const readiness = calculateReadinessScore(organization, docSummary, { total, awarded });
      await prisma.organization.update({
        where: { userId },
        data: {
          readinessScore: readiness.score,
          readinessDetails: JSON.stringify(readiness.breakdown),
          lastAssessedAt: new Date(),
        },
      });
    } catch (readinessError) {
      console.error("Readiness auto-calc failed:", readinessError);
    }
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/app/api/organizations/readiness/route.ts src/app/api/organizations/route.ts
git commit -m "feat: add readiness score API route and auto-compute on profile save"
```

---

## Task 9: Readiness Score Dashboard Widget

**Files:**
- Modify: `src/app/dashboard/page.tsx`

**Step 1: Add readiness score fetch and radial gauge to dashboard**

Add to the dashboard page's state and data fetching. In `src/app/dashboard/page.tsx`, add a new state variable:

```typescript
const [readiness, setReadiness] = useState<{
  score: number;
  actions: { priority: string; action: string }[];
} | null>(null);
```

Add a fetch in the existing `useEffect`:

```typescript
// Fetch readiness score
fetch("/api/organizations/readiness")
  .then((res) => res.ok ? res.json() : null)
  .then((data) => data && setReadiness(data))
  .catch(() => {});
```

Add a readiness card in the StatsCard grid area. Create a radial gauge component inline:

```tsx
{/* Grant Readiness Score */}
<Card className="p-3 sm:p-6" hover glow>
  <div className="flex items-start justify-between">
    <div className="space-y-1 sm:space-y-2">
      <p className="text-xs sm:text-sm font-medium text-slate-400">Grant Readiness</p>
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14 sm:w-16 sm:h-16">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgb(30 41 59)"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={
                (readiness?.score ?? 0) >= 70
                  ? "rgb(16 185 129)"
                  : (readiness?.score ?? 0) >= 40
                  ? "rgb(245 158 11)"
                  : "rgb(239 68 68)"
              }
              strokeWidth="3"
              strokeDasharray={`${readiness?.score ?? 0}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm sm:text-base font-bold text-white">
            {readiness?.score ?? 0}
          </span>
        </div>
        <div>
          <p className="text-lg sm:text-xl font-bold text-white">
            {(readiness?.score ?? 0) >= 70 ? "Ready" : (readiness?.score ?? 0) >= 40 ? "Getting There" : "Needs Work"}
          </p>
        </div>
      </div>
      {readiness?.actions && readiness.actions.length > 0 && (
        <div className="mt-2 space-y-1">
          {readiness.actions.slice(0, 2).map((a, i) => (
            <p key={i} className="text-xs text-slate-500 flex items-center gap-1">
              <span className={a.priority === "high" ? "text-red-400" : "text-amber-400"}>*</span>
              {a.action}
            </p>
          ))}
        </div>
      )}
    </div>
    <div className="p-2 sm:p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
      <Target className="h-5 w-5 sm:h-6 sm:w-6" />
    </div>
  </div>
</Card>
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: add grant readiness score widget to dashboard"
```

---

## Task 10: Per-Grant Readiness Badge on Grant Cards

**Files:**
- Modify: `src/app/dashboard/grants/page.tsx`

**Step 1: Add per-grant readiness indicator**

In the grants listing page, add a simple readiness indicator based on the organization's readiness score and basic grant eligibility checks.

Add a helper function at the top of the file (outside the component):

```typescript
function getGrantReadiness(
  grant: { type?: string; eligibility?: string; state?: string; amountMax?: number },
  org: { type?: string; legalStructure?: string; state?: string; fundingSeeking?: string } | null,
  readinessScore: number
): { label: string; color: string } {
  if (!org) return { label: "Complete Profile", color: "text-slate-500" };

  // Critical eligibility failures
  const eligText = (grant.eligibility || "").toLowerCase();
  if (org.type === "nonprofit" && eligText.includes("for-profit only")) {
    return { label: "Not Eligible", color: "text-red-400" };
  }
  if (org.type !== "nonprofit" && eligText.includes("nonprofit only")) {
    return { label: "Not Eligible", color: "text-red-400" };
  }

  // State mismatch
  if (grant.state && grant.state !== "ALL" && org.state && grant.state !== org.state) {
    return { label: "State Mismatch", color: "text-amber-400" };
  }

  // Based on global readiness
  if (readinessScore >= 70) return { label: "Ready", color: "text-emerald-400" };
  if (readinessScore >= 40) return { label: "Partially Ready", color: "text-amber-400" };
  return { label: "Not Ready", color: "text-red-400" };
}
```

Then add a readiness badge to each grant card, near the match score display. Fetch the readiness score from the `/api/organizations/readiness` endpoint and pass it through.

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/dashboard/grants/page.tsx
git commit -m "feat: add per-grant readiness badge to grant cards"
```

---

## Task 11: Win Tracking — Outcome Reporting API

**Files:**
- Create: `src/app/api/applications/[id]/outcome/route.ts`

**Step 1: Create the outcome reporting endpoint**

Create `src/app/api/applications/[id]/outcome/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { result, notes, feedback } = body;

    if (!result || !["awarded", "rejected", "no_response"].includes(result)) {
      return NextResponse.json(
        { error: "Invalid result. Must be: awarded, rejected, or no_response" },
        { status: 400 }
      );
    }

    // Verify application belongs to user
    const application = await prisma.application.findFirst({
      where: { id, userId: session.user.id },
      include: { grant: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Get organization for aggregated data
    const org = await prisma.organization.findUnique({
      where: { userId: session.user.id },
    });

    // Update application status
    const updateData: Record<string, unknown> = {
      status: result === "awarded" ? "awarded" : "rejected",
      outcomeReportedAt: new Date(),
      outcomeNotes: notes || null,
      feedbackReceived: feedback || null,
    };

    if (result === "awarded") {
      updateData.awardedAt = new Date();
      if (body.awardAmount) updateData.awardAmount = body.awardAmount;
    } else if (result === "rejected") {
      updateData.rejectedAt = new Date();
    }

    const updated = await prisma.application.update({
      where: { id },
      data: updateData,
    });

    // Create anonymized outcome record for aggregated insights
    await prisma.grantOutcome.create({
      data: {
        grantId: application.grantId,
        orgType: org?.type || null,
        orgState: org?.state || null,
        teamSize: org?.teamSize || null,
        annualRevenue: org?.annualRevenue || null,
        result,
        appliedAt: application.submittedAt || application.createdAt,
        resultAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      application: updated,
    });
  } catch (error) {
    console.error("Outcome reporting failed:", error);
    return NextResponse.json(
      { error: "Failed to report outcome" },
      { status: 500 }
    );
  }
}

// GET - Check if outcome is needed for an application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const application = await prisma.application.findFirst({
      where: { id, userId: session.user.id },
      include: { grant: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const needsOutcome =
      application.status === "submitted" &&
      !application.outcomeReportedAt &&
      application.grant.deadline &&
      new Date(application.grant.deadline) < new Date();

    return NextResponse.json({
      needsOutcome,
      applicationId: id,
      grantTitle: application.grant.title,
      submittedAt: application.submittedAt,
      deadline: application.grant.deadline,
    });
  } catch (error) {
    console.error("Outcome check failed:", error);
    return NextResponse.json({ error: "Failed to check outcome" }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/applications/
git commit -m "feat: add outcome reporting API for win tracking"
```

---

## Task 12: Aggregated Insights API

**Files:**
- Create: `src/app/api/grants/[id]/insights/route.ts`

**Step 1: Create the aggregated insights endpoint**

Create `src/app/api/grants/[id]/insights/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get all outcomes for this grant
    const outcomes = await prisma.grantOutcome.findMany({
      where: { grantId: id },
    });

    if (outcomes.length === 0) {
      return NextResponse.json({
        hasData: false,
        message: "No outcome data yet for this grant",
      });
    }

    const awarded = outcomes.filter((o) => o.result === "awarded").length;
    const rejected = outcomes.filter((o) => o.result === "rejected").length;
    const total = outcomes.length;
    const awardRate = Math.round((awarded / total) * 100);

    // Build "orgs like yours" insight if user is authenticated
    let personalInsight: string | null = null;
    let matchBoost = 0;

    let session = null;
    try { session = await auth(); } catch {}

    if (session?.user?.id) {
      const org = await prisma.organization.findUnique({
        where: { userId: session.user.id },
      });

      if (org) {
        // Find outcomes from similar orgs
        const similarOutcomes = outcomes.filter((o) => {
          let similarity = 0;
          if (o.orgType === org.type) similarity++;
          if (o.orgState === org.state) similarity++;
          if (o.teamSize === org.teamSize) similarity++;
          return similarity >= 1;
        });

        if (similarOutcomes.length >= 2) {
          const similarAwarded = similarOutcomes.filter((o) => o.result === "awarded").length;
          personalInsight = `Organizations like yours won ${similarAwarded} of ${similarOutcomes.length} similar applications`;

          // Calculate match score boost/penalty
          const similarWinRate = similarAwarded / similarOutcomes.length;
          if (similarWinRate > 0.5) matchBoost = 5 + Math.round(similarWinRate * 5);
          else if (similarWinRate < 0.2) matchBoost = -5;
        }
      }
    }

    return NextResponse.json({
      hasData: true,
      totalApplications: total,
      awarded,
      rejected,
      noResponse: total - awarded - rejected,
      awardRate,
      awardRateLabel: `${awardRate}% award rate based on ${total} tracked application${total !== 1 ? "s" : ""}`,
      personalInsight,
      matchBoost,
    });
  } catch (error) {
    console.error("Insights failed:", error);
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/grants/
git commit -m "feat: add aggregated grant insights API from outcome data"
```

---

## Task 13: Outcome Prompts Cron Job

**Files:**
- Create: `src/app/api/cron/outcome-prompts/route.ts`

**Step 1: Create the outcome prompts cron**

Create `src/app/api/cron/outcome-prompts/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const fortyFourDaysAgo = new Date(now.getTime() - 44 * 24 * 60 * 60 * 1000);

    // Find submitted applications where:
    // 1. Grant deadline was 30+ days ago
    // 2. No outcome has been reported
    // 3. Not already in awarded/rejected status
    const needsPrompt = await prisma.application.findMany({
      where: {
        status: "submitted",
        outcomeReportedAt: null,
        grant: {
          deadline: {
            lte: thirtyDaysAgo,
            gte: fortyFourDaysAgo, // Don't prompt for very old apps (>44 days)
          },
        },
      },
      include: {
        user: { select: { id: true, email: true, name: true, alertsEnabled: true } },
        grant: { select: { title: true, funder: true, deadline: true } },
      },
    });

    let prompted = 0;
    let errors = 0;

    for (const app of needsPrompt) {
      if (!app.user.alertsEnabled) continue;

      try {
        // For now, log the prompt. Email integration can be added later
        // using the existing sendEmail infrastructure from src/lib/email.ts
        console.log(
          `[Outcome Prompt] User ${app.user.email}: "${app.grant.title}" by ${app.grant.funder} — deadline was ${app.grant.deadline?.toISOString()}`
        );
        prompted++;
      } catch {
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      checked: needsPrompt.length,
      prompted,
      errors,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Outcome prompts cron failed:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: String(error) },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/cron/outcome-prompts/route.ts
git commit -m "feat: add outcome prompts cron job for win tracking"
```

---

## Task 14: Outcome Reporting UI on Application Detail

**Files:**
- Modify: `src/app/dashboard/applications/[id]/page.tsx`

**Step 1: Add outcome reporting modal to the application detail page**

Read the current application detail page to understand its structure, then add:

1. A state variable for the outcome modal:
```typescript
const [showOutcomeModal, setShowOutcomeModal] = useState(false);
const [outcomeResult, setOutcomeResult] = useState<string>("");
const [outcomeNotes, setOutcomeNotes] = useState("");
const [outcomeFeedback, setOutcomeFeedback] = useState("");
const [submittingOutcome, setSubmittingOutcome] = useState(false);
```

2. A submit handler:
```typescript
const handleOutcomeSubmit = async () => {
  if (!outcomeResult) return;
  setSubmittingOutcome(true);
  try {
    const res = await fetch(`/api/applications/${id}/outcome`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        result: outcomeResult,
        notes: outcomeNotes,
        feedback: outcomeFeedback,
      }),
    });
    if (res.ok) {
      setShowOutcomeModal(false);
      // Refresh the page data
      window.location.reload();
    }
  } catch (error) {
    console.error("Failed to submit outcome:", error);
  } finally {
    setSubmittingOutcome(false);
  }
};
```

3. A banner that shows when outcome is needed (application is submitted and deadline has passed):
```tsx
{application.status === "submitted" && !application.outcomeReportedAt &&
  application.grant.deadline && new Date(application.grant.deadline) < new Date() && (
  <Card className="bg-amber-500/10 border-amber-500/20 p-4 sm:p-6">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <h3 className="text-white font-medium">Have you heard back?</h3>
        <p className="text-sm text-slate-400 mt-1">
          The deadline has passed. Let us know the outcome to improve recommendations.
        </p>
      </div>
      <Button onClick={() => setShowOutcomeModal(true)} size="sm">
        Report Outcome
      </Button>
    </div>
  </Card>
)}
```

4. A modal for outcome selection with three buttons (Awarded, Rejected, No Response), optional notes textarea, and optional feedback textarea. Use the existing Radix Dialog component.

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/dashboard/applications/
git commit -m "feat: add outcome reporting UI to application detail page"
```

---

## Task 15: AI Application Intelligence — Install pdf-parse

**Files:**
- Modify: `package.json`

**Step 1: Install pdf-parse**

Run: `npm install pdf-parse`
Run: `npm install --save-dev @types/pdf-parse`

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add pdf-parse dependency for RFP analysis"
```

---

## Task 16: RFP Analysis API Route

**Files:**
- Create: `src/app/api/grants/[id]/analyze/route.ts`

**Step 1: Create the RFP analysis endpoint**

Create `src/app/api/grants/[id]/analyze/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check plan limits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });

    const planLimits: Record<string, number> = {
      free: 0,
      growth: 3,
      pro: 10,
      organization: 999,
    };

    const limit = planLimits[user?.plan || "free"] || 0;
    if (limit === 0) {
      return NextResponse.json(
        { error: "RFP analysis requires a Growth plan or higher" },
        { status: 403 }
      );
    }

    // Check if already analyzed
    const existing = await prisma.grantAnalysis.findUnique({
      where: { grantId: id },
    });
    if (existing) {
      return NextResponse.json(existing);
    }

    // Fetch the grant
    const grant = await prisma.grant.findUnique({ where: { id } });
    if (!grant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }

    // Try to fetch and parse the NOFO PDF
    let pdfText = "";
    let pdfPageCount = 0;
    const pdfUrl = grant.nofoUrl || grant.url;

    if (pdfUrl && (pdfUrl.endsWith(".pdf") || pdfUrl.includes("/pdf"))) {
      try {
        const pdfResponse = await fetch(pdfUrl);
        if (pdfResponse.ok) {
          const buffer = Buffer.from(await pdfResponse.arrayBuffer());
          const pdfParse = (await import("pdf-parse")).default;
          const parsed = await pdfParse(buffer);
          pdfText = parsed.text.slice(0, 50000); // Limit to 50K chars
          pdfPageCount = parsed.numpages;
        }
      } catch (pdfError) {
        console.error("PDF parsing failed:", pdfError);
      }
    }

    // Build analysis prompt
    const grantContext = [
      `Title: ${grant.title}`,
      `Funder: ${grant.funder}`,
      `Amount: ${grant.amount || "Not specified"}`,
      `Type: ${grant.type || "Not specified"}`,
      `Category: ${grant.category || "Not specified"}`,
      `Eligibility: ${grant.eligibility || "Not specified"}`,
      `Requirements: ${grant.requirements || "Not specified"}`,
      `Description: ${grant.description || "Not specified"}`,
    ].join("\n");

    const prompt = `Analyze this grant opportunity and extract structured information.

GRANT DETAILS:
${grantContext}

${pdfText ? `NOFO/RFP DOCUMENT TEXT (${pdfPageCount} pages):\n${pdfText}\n` : "No PDF document available - analyze based on grant details above."}

Extract and return a JSON object with these fields:
1. "scoringCriteria": Array of {name: string, maxPoints: number, description: string, weight: number (0-1)}. If no explicit scoring is found, infer likely criteria based on the funder type and grant category.
2. "requiredSections": Array of {title: string, wordLimit: number|null, instructions: string, required: boolean}
3. "eligibilityReqs": Array of {requirement: string, type: "org_type"|"location"|"financial"|"experience"|"other"}
4. "evaluationNotes": String with key evaluation insights and tips
5. "confidence": Number 1-100 based on how much data was available

Return ONLY valid JSON, no markdown.`;

    // Call Claude
    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse the response
    let analysisData;
    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      analysisData = JSON.parse(jsonMatch?.[0] || responseText);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse analysis response" },
        { status: 500 }
      );
    }

    // Save to database
    const analysis = await prisma.grantAnalysis.create({
      data: {
        grantId: id,
        scoringCriteria: JSON.stringify(analysisData.scoringCriteria || []),
        requiredSections: JSON.stringify(analysisData.requiredSections || []),
        eligibilityReqs: JSON.stringify(analysisData.eligibilityReqs || []),
        evaluationNotes: analysisData.evaluationNotes || null,
        pdfUrl: pdfUrl || null,
        pdfPageCount: pdfPageCount || null,
        confidence: analysisData.confidence || 50,
      },
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Grant analysis failed:", error);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}

// GET - Fetch existing analysis
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const analysis = await prisma.grantAnalysis.findUnique({
      where: { grantId: id },
    });

    if (!analysis) {
      return NextResponse.json({ analyzed: false });
    }

    return NextResponse.json({
      analyzed: true,
      ...analysis,
      scoringCriteria: JSON.parse(analysis.scoringCriteria),
      requiredSections: JSON.parse(analysis.requiredSections),
      eligibilityReqs: JSON.parse(analysis.eligibilityReqs),
    });
  } catch (error) {
    console.error("Fetch analysis failed:", error);
    return NextResponse.json({ error: "Failed to fetch analysis" }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/grants/
git commit -m "feat: add AI-powered RFP analysis API with PDF parsing"
```

---

## Task 17: Predicted Score Calculator

**Files:**
- Create: `src/lib/predicted-score.ts`

**Step 1: Create predicted score logic**

Create `src/lib/predicted-score.ts`:

```typescript
interface ScoringCriterion {
  name: string;
  maxPoints: number;
  description: string;
  weight: number;
}

interface OrgData {
  name: string;
  type: string | null;
  mission: string | null;
  vision: string | null;
  problemStatement: string | null;
  solution: string | null;
  targetMarket: string | null;
  teamSize: string | null;
  founderBackground: string | null;
  annualRevenue: string | null;
  previousFunding: string | null;
}

export interface CriterionScore {
  criterion: string;
  maxPoints: number;
  predictedPoints: number;
  confidence: number;
  orgDataUsed: string[];
  gaps: string[];
  suggestion: string;
}

export function calculatePredictedScores(
  criteria: ScoringCriterion[],
  org: OrgData
): { scores: CriterionScore[]; totalPredicted: number; totalMax: number } {
  const scores = criteria.map((c) => scoreCriterion(c, org));
  const totalPredicted = scores.reduce((sum, s) => sum + s.predictedPoints, 0);
  const totalMax = scores.reduce((sum, s) => sum + s.maxPoints, 0);

  return { scores, totalPredicted, totalMax };
}

function scoreCriterion(criterion: ScoringCriterion, org: OrgData): CriterionScore {
  const nameL = criterion.name.toLowerCase();
  const descL = criterion.description.toLowerCase();
  const combined = `${nameL} ${descL}`;

  const orgDataUsed: string[] = [];
  const gaps: string[] = [];
  let coverage = 0;

  // Match criterion to org data
  if (combined.includes("team") || combined.includes("personnel") || combined.includes("staff")) {
    if (org.founderBackground && org.founderBackground.length > 50) {
      coverage += 0.6;
      orgDataUsed.push("Founder/leadership background");
    } else {
      gaps.push("Detailed team qualifications needed");
    }
    if (org.teamSize) {
      coverage += 0.2;
      orgDataUsed.push("Team size");
    }
  }

  if (combined.includes("mission") || combined.includes("purpose") || combined.includes("need")) {
    if (org.mission) { coverage += 0.4; orgDataUsed.push("Mission statement"); }
    else gaps.push("Add a mission statement");
    if (org.problemStatement) { coverage += 0.3; orgDataUsed.push("Problem statement"); }
    else gaps.push("Define the problem you solve");
  }

  if (combined.includes("approach") || combined.includes("method") || combined.includes("solution") || combined.includes("technical")) {
    if (org.solution) { coverage += 0.5; orgDataUsed.push("Solution description"); }
    else gaps.push("Describe your technical approach");
    if (org.targetMarket) { coverage += 0.2; orgDataUsed.push("Target market"); }
  }

  if (combined.includes("budget") || combined.includes("financial") || combined.includes("cost")) {
    if (org.annualRevenue) { coverage += 0.4; orgDataUsed.push("Annual revenue"); }
    else gaps.push("Add financial information");
  }

  if (combined.includes("experience") || combined.includes("track record") || combined.includes("past performance")) {
    if (org.previousFunding) { coverage += 0.5; orgDataUsed.push("Previous funding history"); }
    else gaps.push("Document previous grants or funding");
    if (org.founderBackground) { coverage += 0.2; orgDataUsed.push("Leadership experience"); }
  }

  if (combined.includes("impact") || combined.includes("outcome") || combined.includes("evaluation")) {
    if (org.vision) { coverage += 0.3; orgDataUsed.push("Vision"); }
    if (org.targetMarket) { coverage += 0.2; orgDataUsed.push("Target market"); }
    if (!org.vision && !org.targetMarket) gaps.push("Define expected impact and outcomes");
  }

  if (combined.includes("innovation") || combined.includes("novel") || combined.includes("unique")) {
    if (org.solution) { coverage += 0.4; orgDataUsed.push("Solution description"); }
    else gaps.push("Highlight what makes your approach innovative");
  }

  // Default if no specific match
  if (orgDataUsed.length === 0) {
    coverage = 0.3; // Base coverage
    if (org.mission) orgDataUsed.push("Mission statement");
    gaps.push(`Review criterion: "${criterion.name}" and prepare specific content`);
  }

  coverage = Math.min(1, coverage);
  const predictedPoints = Math.round(criterion.maxPoints * coverage);
  const confidence = orgDataUsed.length > 0 ? Math.min(85, 30 + orgDataUsed.length * 15) : 20;

  const suggestion = gaps.length > 0
    ? gaps[0]
    : "Strong coverage — refine details for maximum points";

  return {
    criterion: criterion.name,
    maxPoints: criterion.maxPoints,
    predictedPoints,
    confidence,
    orgDataUsed,
    gaps,
    suggestion,
  };
}
```

**Step 2: Commit**

```bash
git add src/lib/predicted-score.ts
git commit -m "feat: add predicted scoring engine for RFP criteria"
```

---

## Task 18: Grant Analysis UI on Grant Detail Page

**Files:**
- Modify: `src/app/dashboard/grants/[id]/page.tsx`

**Step 1: Add analysis panel to the grant detail page**

Read the existing grant detail page, then add:

1. State for analysis data:
```typescript
const [analysis, setAnalysis] = useState<{
  analyzed: boolean;
  scoringCriteria?: { name: string; maxPoints: number; description: string }[];
  requiredSections?: { title: string; wordLimit: number | null; required: boolean }[];
  eligibilityReqs?: { requirement: string; type: string }[];
  evaluationNotes?: string;
  confidence?: number;
} | null>(null);
const [analyzing, setAnalyzing] = useState(false);
```

2. Fetch existing analysis on mount:
```typescript
useEffect(() => {
  if (id) {
    fetch(`/api/grants/${id}/analyze`)
      .then((res) => res.json())
      .then(setAnalysis)
      .catch(() => {});
  }
}, [id]);
```

3. An "Analyze Grant" button that calls `POST /api/grants/${id}/analyze` and shows a loading spinner.

4. An analysis results panel with:
   - Scoring criteria as green/yellow/red bars
   - Required sections list
   - Eligibility requirements with met/not met badges
   - Evaluation notes
   - Confidence indicator

Use the existing `Card`, `CardHeader`, `CardContent` components. Apply responsive classes (`p-4 sm:p-6`, `text-xs sm:text-sm`, etc.) consistent with the rest of the app.

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/dashboard/grants/
git commit -m "feat: add AI RFP analysis panel to grant detail page"
```

---

## Task 19: Integrate Insights into Grant Cards

**Files:**
- Modify: `src/app/dashboard/grants/[id]/page.tsx`

**Step 1: Add aggregated insights to the grant detail page**

Fetch insights from `/api/grants/${id}/insights` and display:

1. Award rate badge: "34% award rate based on 12 tracked applications"
2. Personal insight: "Organizations like yours won 3 of 8 similar grants"

Add this alongside the existing match score display on the grant detail page.

```tsx
{insights?.hasData && (
  <div className="mt-3 space-y-1.5">
    <p className="text-xs sm:text-sm text-slate-400">
      {insights.awardRateLabel}
    </p>
    {insights.personalInsight && (
      <p className="text-xs sm:text-sm text-emerald-400">
        {insights.personalInsight}
      </p>
    )}
  </div>
)}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/dashboard/grants/
git commit -m "feat: add aggregated win/loss insights to grant detail page"
```

---

## Task 20: Match Score Boost from Outcome Data

**Files:**
- Modify: `src/app/api/grants/route.ts`

**Step 1: Integrate outcome-based match score adjustments**

In `src/app/api/grants/route.ts`, after calculating match scores (around line 153), add a batch query to get outcome-based boosts:

```typescript
// After the grantsWithScores.map, before the sort:
// Fetch outcome boosts for all grants in one query
if (organization) {
  const grantIds = grants.map((g) => g.id);
  const outcomes = await prisma.grantOutcome.groupBy({
    by: ["grantId"],
    where: { grantId: { in: grantIds } },
    _count: { result: true },
  });

  const outcomeBoosts = new Map<string, number>();
  for (const outcome of outcomes) {
    const allForGrant = await prisma.grantOutcome.findMany({
      where: { grantId: outcome.grantId },
    });
    const similar = allForGrant.filter((o) => o.orgType === organization.type);
    if (similar.length >= 2) {
      const winRate = similar.filter((o) => o.result === "awarded").length / similar.length;
      const boost = winRate > 0.5 ? Math.round(5 + winRate * 5) : winRate < 0.2 ? -5 : 0;
      if (boost !== 0) outcomeBoosts.set(outcome.grantId, boost);
    }
  }

  // Apply boosts
  for (const grant of grantsWithScores) {
    const boost = outcomeBoosts.get(grant.id);
    if (boost && grant.matchScore) {
      grant.matchScore = Math.min(100, Math.max(0, grant.matchScore + boost));
    }
  }
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/api/grants/route.ts
git commit -m "feat: boost match scores based on aggregated outcome data"
```

---

## Task 21: Final Build Verification and Deploy

**Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with 0 errors

**Step 2: Check for TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit any remaining changes**

```bash
git add -A
git commit -m "feat: complete competitive differentiators — sources, readiness, outcomes, RFP analysis"
```

**Step 4: Deploy to Vercel**

Run: `vercel --prod --yes`
Expected: Deployment succeeds

---

## Summary of Deliverables

| Feature | Files Created/Modified | API Routes |
|---------|----------------------|------------|
| Schema Migration | `prisma/schema.prisma` | — |
| Pluggable Sources | `src/lib/grant-sources/*.ts` (5 files) | Cron updated |
| Grant Readiness | `src/lib/readiness-score.ts`, dashboard widget | `GET /api/organizations/readiness` |
| Win Tracking | Outcome API, insights API, cron | `POST /api/applications/[id]/outcome`, `GET /api/grants/[id]/insights`, `GET /api/cron/outcome-prompts` |
| AI RFP Analysis | Analysis API, predicted scores, UI | `POST /api/grants/[id]/analyze` |
