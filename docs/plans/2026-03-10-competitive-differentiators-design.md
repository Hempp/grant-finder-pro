# Competitive Differentiators — Design Document

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build four features that differentiate GrantPilot from every competitor: pluggable grant sources, deep RFP analysis with predicted scoring, grant readiness scores, and win tracking with aggregated insights.

**Architecture:** Each feature is a vertical slice — schema changes, API routes, business logic, and frontend. They share the existing Claude AI integration and Prisma/PostgreSQL stack.

**Tech Stack:** Next.js 16, Prisma 6, Anthropic Claude SDK, pdf-parse, PostgreSQL on Supabase

---

## Feature 1: Pluggable Grant Sources Architecture

**Problem:** Only scraping Grants.gov + hardcoded manual grants. Competitors have 400K+ opportunities.

**Approach:** Hybrid — add Sam.gov + state portals (free), plus build pluggable scraper interface for future sources.

### Interface

```typescript
interface GrantSource {
  id: string;               // "grants_gov", "sam_gov", "state_ca"
  name: string;
  type: "federal" | "state" | "foundation" | "corporate";
  scrape(): Promise<ScrapedGrant[]>;
  isEnabled(): boolean;
}
```

### New Sources
- **Sam.gov** — Free public API, ~60K active opportunities
- **State portals** — Top 10 states by population (CA, TX, FL, NY, PA, IL, OH, GA, NC, MI)

### Schema Changes
```prisma
model Grant {
  sourceUrl    String?    // Original source URL
  sourceId     String?    // External ID (oppNumber, noticeId)
  nofoUrl      String?    // Direct link to NOFO/RFP PDF
}
```

### Expected outcome
800 grants → 3,000-5,000 grants

---

## Feature 2: AI Application Intelligence (Deep RFP Analysis)

**Problem:** No competitor parses the actual RFP, extracts scoring criteria, and predicts your score per criterion.

**Approach:** Fetch NOFO PDF → parse to text → Claude extracts structured criteria → map to user's org data → show predicted score coverage map.

### Flow
1. User clicks "Analyze Grant"
2. Fetch NOFO/RFP PDF from `nofoUrl`
3. Parse PDF to text (`pdf-parse`)
4. Send to Claude with extraction prompt
5. Returns: scoring criteria, required sections, eligibility requirements, evaluation notes
6. Map each criterion to org profile
7. Show predicted score per criterion with gaps and suggestions

### Schema
```prisma
model GrantAnalysis {
  id              String   @id @default(cuid())
  grantId         String   @unique
  grant           Grant    @relation(fields: [grantId], references: [id])
  scoringCriteria String   // JSON: [{name, maxPoints, description, weight}]
  requiredSections String  // JSON: [{title, wordLimit, instructions, required}]
  eligibilityReqs String   // JSON: [{requirement, type, met}]
  evaluationNotes String?
  pdfUrl          String?
  pdfPageCount    Int?
  analyzedAt      DateTime @default(now())
  modelUsed       String   @default("claude-sonnet-4-20250514")
  confidence      Int
}
```

### Predicted Score
```typescript
interface CriterionScore {
  criterion: string;
  maxPoints: number;
  predictedPoints: number;
  confidence: number;
  orgDataUsed: string[];
  gaps: string[];
  suggestion: string;
}
```

### API
- `POST /api/grants/[id]/analyze` — Fetch PDF, parse, analyze, cache
- Plan limits: Free: 0, Growth: 3/mo, Pro: 10/mo, Org: unlimited

### Frontend
- Grant Analysis panel on grant detail page
- Coverage map: green/yellow/red bars per criterion
- Predicted total score prominently displayed

---

## Feature 3: Grant Readiness Score

**Problem:** Users waste 100+ hours applying to grants they can't win.

**Approach:** Global organization readiness score + per-grant application readiness checks.

### Global Organization Readiness (dashboard)

Weighted checklist (0-100):
| Factor | Weight | Checks |
|--------|--------|--------|
| Profile completeness | 20% | Name, type, EIN, mission, team, revenue |
| Documents uploaded | 20% | Pitch deck, financials, business plan |
| Financial readiness | 15% | Revenue figures, budget history |
| Team description | 15% | Founder background, team size, key personnel |
| Track record | 15% | Previous funding, past grants |
| Application history | 15% | Past apps, win rate |

### Per-Grant Application Readiness (grant cards)

```typescript
interface ReadinessCheck {
  category: string;          // "eligibility", "documents", "capacity", "match"
  requirement: string;       // "501(c)(3) status required"
  status: "met" | "partial" | "not_met" | "unknown";
  importance: "critical" | "important" | "nice_to_have";
  action?: string;           // "Upload your 501(c)(3) determination letter"
}
```

Critical failures = "Not Eligible" badge.

### Schema Changes
```prisma
model Organization {
  readinessScore    Int?
  readinessDetails  String?    // JSON breakdown
  lastAssessedAt    DateTime?
}
```

### Frontend
- Radial gauge on dashboard
- Per-grant badge on every grant card (green/yellow/red)
- Readiness detail panel with actionable items

---

## Feature 4: Win Tracking + Aggregated Insights

**Problem:** No outcome data means the platform can't learn or improve predictions.

**Approach:** Prompted outcome collection + anonymized aggregated insights + feedback loop into match scoring.

### Prompted Collection
1. 30 days after deadline → email + in-app notification
2. 14 days later → one follow-up nudge
3. In-app modal when visiting past-deadline application

### Schema Changes
```prisma
model Application {
  outcomeReportedAt  DateTime?
  outcomeNotes       String?
  feedbackReceived   String?
}

model GrantOutcome {
  id            String   @id @default(cuid())
  grantId       String
  grant         Grant    @relation(fields: [grantId], references: [id])
  orgType       String?
  orgState      String?
  teamSize      String?
  annualRevenue String?
  result        String   // "awarded" | "rejected" | "no_response"
  appliedAt     DateTime
  resultAt      DateTime?
  createdAt     DateTime @default(now())
}
```

### Aggregated Insights
- "Organizations like yours won 3 of 8 similar grants" (grant cards)
- "34% award rate based on 12 tracked applications" (grant detail)
- Win rate analytics by org type, state, team size

### Feedback Loop
- Grants where similar orgs won → match score boost (+5-10 points)
- Grants where similar orgs lost → match score penalty
- Compounds over time with more data

### New Cron
- `POST /api/cron/outcome-prompts` — daily, finds past-deadline apps, sends prompts

---

## Implementation Order

1. **Schema migrations** (all four features) — single migration
2. **Pluggable grant sources** — immediate value, more grants
3. **Grant Readiness Score** — builds on existing profile/matcher
4. **Win Tracking** — collection + prompts + cron
5. **AI Application Intelligence** — deepest feature, requires PDF infra

Approved: 2026-03-10
