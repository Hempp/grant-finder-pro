# GrantPilot Smart Fill — Design Spec

**Date:** 2026-03-28
**Goal:** Users enter their URL and upload docs once. AI fills every grant application to 100/100 automatically. Users only intervene when the AI needs data it doesn't have.
**Scope:** Content Library, Website Intelligence, Smart Fill Engine, Apply Panel

---

## 1. Website Intelligence Engine

When a user enters their company URL on the org profile page, the system extracts grant-relevant content.

### Crawl Strategy

1. Fetch homepage via server-side fetch (no Puppeteer)
2. Extract internal links from the page
3. Prioritize grant-relevant pages: about, team, impact, mission, partnerships, press
4. Crawl up to 10 internal pages maximum
5. Skip: pricing, blog index, login, terms, privacy, careers listings

### Extraction

AI reads each crawled page and extracts:
- Company name, founding year, location
- Mission / vision / what they do
- Team bios and qualifications
- Impact metrics (numbers served, revenue, outcomes)
- Partnerships and collaborators
- DEI / equity statements
- Technology / methodology descriptions
- Press mentions, awards, certifications

Each extracted piece becomes a ContentBlock with `source: "website"`, the source URL as `sourceRef`, and confidence 70 (scraped data is less reliable than user-entered data).

### Merge Logic

If the org profile already has data for a field (e.g., mission statement), the system compares:
- If the website version is richer (more detail, metrics, specifics), it creates a new ContentBlock alongside the existing one
- If they conflict, both are kept and the user sees a "Review conflict" prompt on the library page
- The AI uses the highest-confidence version when filling applications

### API

**POST `/api/organizations/import-url`**
- Request: `{ url: string }`
- Response: `{ blocksCreated: number, blocks: ContentBlock[], conflicts: Conflict[] }`
- Processing: server-side, synchronous for small sites (<10 pages), returns within 30 seconds

### UI

- New "Import from website" button on `/dashboard/organization` page
- Website field already exists in the Organization model
- Button triggers the import, shows progress, then redirects to Content Library

---

## 2. Content Library

A persistent knowledge base of everything the system knows about the user's company. The single source of truth that all grant applications draw from.

### Data Model

```prisma
model ContentBlock {
  id           String   @id @default(cuid())
  userId       String
  category     String   // see categories below
  title        String
  content      String   @db.Text
  source       String   // profile, document, website, application, manual
  sourceRef    String?  // document ID, URL, or application ID
  confidence   Int      @default(80) // 0-100
  lastVerified DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, category])
  @@index([userId, source])
}
```

### Categories

| Category | Description | Common Sources |
|----------|-------------|----------------|
| `company_overview` | What the company does, elevator pitch | Profile, website, pitch deck |
| `mission` | Mission and vision statements | Profile, website |
| `team_bios` | Individual team member qualifications | Website, resumes, manual |
| `past_performance` | Track record, prior work, case studies | Website, annual reports |
| `technical_capabilities` | Technology, methodology, IP | Pitch deck, business plan |
| `financials` | Revenue, expenses, projections | Financial docs, 990s |
| `prior_grants` | Grants previously won, outcomes | Application history, manual |
| `partnerships` | Collaborators, MOUs, letters of support | Website, manual |
| `dei_statement` | Diversity, equity, inclusion commitment | Website, manual |
| `impact_metrics` | Measurable outcomes, beneficiaries served | Website, annual reports |
| `facilities` | Physical space, equipment, infrastructure | Manual |
| `ip_patents` | Intellectual property, patents, trademarks | Manual, pitch deck |
| `environmental` | Environmental impact, sustainability | Website, manual |
| `custom` | User-defined category | Manual |

### Source Confidence

| Source | Default Confidence | Reasoning |
|--------|-------------------|-----------|
| `manual` | 100 | User authored directly |
| `profile` | 95 | User entered during signup |
| `application` | 90 | User approved this text in a submitted application |
| `document` | 80 | AI extracted from uploaded doc |
| `website` | 70 | AI scraped from public URL |

### Auto-Growth

Every time the user submits an application through Smart Fill, the approved sections are saved back as ContentBlocks with `source: "application"` and `confidence: 90`. The library grows automatically with each application.

### Population Flow

```
User signs up → Org profile fields → ContentBlocks (confidence 95)
User uploads pitch deck → AI parses → ContentBlocks (confidence 80)
User enters URL → AI scrapes → ContentBlocks (confidence 70)
User submits application → Approved sections → ContentBlocks (confidence 90)
User edits library directly → ContentBlocks (confidence 100)
```

### API

**GET `/api/content-library`**
- Response: `{ blocks: ContentBlock[], stats: { total, byCategory, avgConfidence } }`

**POST `/api/content-library`**
- Request: `{ category, title, content, source?, sourceRef? }`
- Response: `{ block: ContentBlock }`

**PUT `/api/content-library/[id]`**
- Request: `{ title?, content?, category? }`
- Response: `{ block: ContentBlock }`
- Side effect: sets `confidence: 100` and `lastVerified: now()` (user touched it)

**DELETE `/api/content-library/[id]`**
- Response: `{ success: true }`

### UI

New page at `/dashboard/library`:
- Blocks grouped by category with collapsible sections
- Each block shows: title, preview text, source badge, confidence indicator, last verified date
- Inline editing — click to expand and edit
- "Add block" button per category
- "Re-import from website" button in header
- Stats bar: "42 blocks | 87% avg confidence | Last updated 2 hours ago"

Navigation: Added to the sidebar under the core group, between "Documents" and "Profile".

---

## 3. Smart Fill Engine

The AI pipeline that takes a grant and produces a 100/100 application draft.

### Pipeline

```
1. ANALYZE  — Read grant requirements + scoring criteria from GrantAnalysis
2. MAP      — For each required section, find matching ContentBlocks by category
3. GENERATE — AI writes each section using matched blocks + funder tone + scoring criteria
4. OPTIMIZE — Auto-loop: re-score, identify weaknesses, rewrite, repeat until 100 or gaps
5. DIFF     — Generate semantic diffs showing what AI changed from raw source and why
6. RETURN   — Full draft with scores, diffs, gaps, optimization round count
```

### Step 1: Analyze

Read the grant's `GrantAnalysis` record which contains:
- `scoringCriteria`: JSON array of `{ name, maxPoints, description, weight }`
- `requiredSections`: JSON array of `{ title, wordLimit, instructions, required }`
- `eligibilityReqs`: JSON array of `{ requirement, type, met }`

If no GrantAnalysis exists, run the existing `parseGrantRequirements()` from `grant-writer.ts` to create one.

### Step 2: Map

For each required section, query ContentBlocks by relevance:
- Match section title keywords to block categories (e.g., "Team Qualifications" → `team_bios` + `past_performance`)
- Include `company_overview` and `mission` for all narrative sections (context)
- Sort matched blocks by confidence descending
- Flag sections with zero matching blocks as gaps

### Step 3: Generate

For each section, send to Claude:

```
ROLE: You are a grant writer with 20 years of experience winning grants.
Your job is to score 10/10 on every section of this application.

GRANT CONTEXT:
- Funder: {funder} (type: {funderType})
- Section: {sectionTitle}
- Instructions: {sectionInstructions}
- Word limit: {wordLimit}
- Scoring criteria: {criteriaForThisSection}
- Funder values: {toneConfig}

COMPANY DATA:
{matchedContentBlocks — full text, with source and confidence noted}

RULES:
1. Score 10/10 on every criterion listed above
2. Use specific numbers and metrics from the company data
3. Match the funder tone ({federal|foundation|corporate|state})
4. Address every scoring criterion explicitly — reviewers score with a checklist
5. If company data is missing for a criterion, flag it as a gap — never fabricate
6. Stay within the word limit

Return JSON:
{
  "content": "the written section text",
  "score": 8,
  "maxScore": 10,
  "criteriaScores": [{"criterion": "...", "score": 5, "max": 5, "note": "..."}],
  "gaps": [{"field": "...", "reason": "...", "suggestion": "...", "impact": "high|medium|low"}]
}
```

### Step 4: Optimize (Auto-Loop)

After initial generation, for any section scoring below 10:

```
Round N:
1. Collect all sections with score < maxScore
2. For each, identify which criteria lost points
3. Send back to Claude with:
   "This section scored {score}/{max}. The following criteria need improvement:
    - {criterion}: scored {x}/{y} because {note}
    Rewrite to address these specifically. Keep everything that already scores well."
4. Re-score the rewritten version
5. If score improved, keep new version. If not, keep original.
6. Repeat until all sections are 10/10 OR 3 rounds max (prevent infinite loops)
```

Maximum 3 optimization rounds. If a section can't reach 10/10 after 3 rounds, it's because of a genuine data gap — surface the gap to the user.

### Step 5: Diff

For each section, generate a semantic diff:
- Compare the final optimized text to the raw ContentBlock source text
- AI produces a plain-English explanation of each major change
- Tied to specific scoring criteria

```json
{
  "diffs": [
    {
      "before": "We help communities access clean water",
      "after": "Since 2019, we've provided clean water access to 12,000 residents across 3 rural counties in Appalachian Kentucky, reducing waterborne illness rates by 34%",
      "why": "Grant scores 25% on measurable impact. Added specific metrics from your impact data and annual report."
    }
  ]
}
```

### API

**POST `/api/grants/[id]/smart-fill`**
- Request: `{ grantId: string }`
- Response:
```json
{
  "score": 100,
  "maxScore": 100,
  "sections": [
    {
      "id": "executive_summary",
      "title": "Executive Summary",
      "content": "...",
      "score": 10,
      "maxScore": 10,
      "criteriaScores": [...],
      "diffs": [...],
      "sourcesUsed": ["block_id_1", "block_id_2"]
    }
  ],
  "gaps": [],
  "optimizationRounds": 2
}
```

### Cost Consideration

Each Smart Fill call makes 1 AI call per section for generation + up to 3 rounds of optimization. A typical 5-section grant = 5-20 Claude API calls. This is a Pro/Organization feature only — free users get the manual apply flow.

---

## 4. Apply Panel (Slide-Over Drawer)

The in-dashboard apply experience. Click "Apply" on any grant → panel slides open → 100/100 draft ready for review.

### Layout

```
┌─────────────────────────────────────────┐
│ ✕  NSF SBIR Phase I — Clean Water Tech  │
│    Score: 100/100 ████████████████ ★     │
├─────────────────────────────────────────┤
│                                         │
│ ● Executive Summary        10/10  ✓     │
│   [Preview text, 2 lines...]            │
│   ▸ View details                        │
│                                         │
│ ● Technical Approach       10/10  ✓     │
│   [Preview text, 2 lines...]            │
│   ▸ View details                        │
│                                         │
│ ● Team Qualifications      10/10  ✓     │
│   [Preview text, 2 lines...]            │
│   ▸ View details                        │
│                                         │
│ ● Budget Justification     10/10  ✓     │
│   [Preview text, 2 lines...]            │
│   ▸ View details                        │
│                                         │
│ ● DEI Plan                 10/10  ✓     │
│   [Preview text, 2 lines...]            │
│   ▸ View details                        │
│                                         │
├─────────────────────────────────────────┤
│ [View what AI optimized]                │
│ [Edit Full Page]     [Submit ★ →]       │
└─────────────────────────────────────────┘
```

### Section States

| Score | Icon | Color | Meaning |
|-------|------|-------|---------|
| 10/10 | ✓ | Green | Perfect. AI addressed every criterion. |
| 7-9/10 | ⚠ | Yellow | Close. User could improve with suggested edits. |
| <7/10 | 🔴 | Red | Gap. AI needs data it doesn't have. |

### Expanded Section View

Clicking "View details" on any section expands to show:
- Full generated text
- Score breakdown per criterion
- "What AI optimized" toggle showing diffs with reasoning
- Inline edit capability
- Sources used (which ContentBlocks)

### Gap Handling

When a section has gaps (AI can't reach 10/10 without more data):

```
● DEI Plan                    6/10  🔴
  ⚠ Missing data for full score:

  ┌─────────────────────────────────┐
  │ Your DEI commitment statement   │
  │ [textarea]                      │
  │                                 │
  │ Saves to your Content Library   │
  │ so you never type this again    │
  │                                 │
  │ [Save & Regenerate Section]     │
  └─────────────────────────────────┘
```

User fills the gap → saves to ContentBlock → AI regenerates that section → re-scores → section goes green.

### Loading State

Sections stream in as they generate:

```
Analyzing grant requirements...         ✓
Mapping your company data...            ✓
Writing Executive Summary...            ✓
Optimizing Executive Summary...         ✓  10/10
Writing Technical Approach...           ⏳ streaming
Writing Team Qualifications...          ○ queued
Writing Budget Justification...         ○ queued
Writing DEI Plan...                     ○ queued
```

User can read completed sections while others are still generating.

### Submit Button States

```
Has gaps:     [Submit (92/100)]      — yellow, shows "X gaps remaining"
All 10/10:    [Submit ★ (100/100)]   — gold, "Perfect score!"
```

No hard block on submitting below 100. But the UI makes it obvious when there's easy points available.

### Panel Dimensions

- Desktop: 560px wide, slides from right edge, semi-transparent backdrop
- Tablet: 480px wide
- Mobile: full screen
- Uses the same slide transition pattern as the existing mobile sidebar

### Component

New file: `src/components/dashboard/ApplyPanel.tsx`

Triggered from:
- Dashboard page grant cards (the "Apply" quick action)
- Grants list page (the quick-apply buttons)
- Grant detail page (replaces the current "Apply" link)

---

## 5. File Manifest

### New Files (15)

| File | Purpose |
|------|---------|
| `src/lib/content-library/extract-website.ts` | Crawl URL, extract grant-relevant content |
| `src/lib/content-library/extract-documents.ts` | Enhanced doc parsing → ContentBlocks |
| `src/lib/content-library/content-manager.ts` | CRUD for ContentBlocks, merge/conflict logic |
| `src/lib/content-library/types.ts` | ContentBlock, ExtractionResult, Conflict types |
| `src/lib/smart-fill/smart-fill-engine.ts` | Full pipeline: analyze → map → generate → optimize |
| `src/lib/smart-fill/optimizer.ts` | Auto-optimize loop (runs until 100 or gaps) |
| `src/lib/smart-fill/diff-generator.ts` | Semantic diff with scoring-criteria reasoning |
| `src/lib/smart-fill/types.ts` | SmartFillResult, SectionDraft, Gap types |
| `src/app/api/organizations/import-url/route.ts` | POST: crawl URL → ContentBlocks |
| `src/app/api/content-library/route.ts` | GET/POST ContentBlocks |
| `src/app/api/content-library/[id]/route.ts` | PUT/DELETE individual ContentBlock |
| `src/app/api/grants/[id]/smart-fill/route.ts` | POST: run Smart Fill pipeline |
| `src/app/dashboard/library/page.tsx` | Content Library UI page |
| `src/components/dashboard/ApplyPanel.tsx` | Slide-over apply drawer |
| `src/components/dashboard/ContentBlockCard.tsx` | Editable block card for library page |

### Edited Files (7)

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Add ContentBlock model + User relation |
| `src/app/dashboard/layout.tsx` | Add "Library" to nav groups |
| `src/app/dashboard/page.tsx` | ApplyPanel trigger on grant cards |
| `src/app/dashboard/grants/page.tsx` | ApplyPanel trigger on grant list |
| `src/app/dashboard/organization/page.tsx` | "Import from website" button |
| `src/lib/auto-apply/grant-writer.ts` | Refactor to accept ContentBlocks as context |
| `src/lib/auto-apply/document-intelligence.ts` | Output ContentBlocks instead of raw JSON |

---

## 6. Implementation Order

1. **Prisma migration** — ContentBlock model
2. **Content Library types + CRUD** — types.ts, content-manager.ts, API routes
3. **Content Library UI** — library page + ContentBlockCard
4. **Document extraction → ContentBlocks** — refactor extract-documents.ts
5. **Website Intelligence** — extract-website.ts + import-url API
6. **Smart Fill types** — types.ts for the pipeline
7. **Smart Fill engine** — the generate + map pipeline
8. **Optimizer** — the auto-loop to 100
9. **Diff generator** — semantic diffs with reasoning
10. **Smart Fill API** — the /smart-fill route
11. **Apply Panel** — the slide-over drawer UI
12. **Wire Apply Panel** — into dashboard, grants page, grant detail
13. **Auto-growth** — save approved sections back to Content Library
14. **Nav update** — add Library to sidebar

---

## 7. Success Criteria

- User enters URL → Content Library populates with 10+ blocks in under 30 seconds
- User uploads pitch deck → Content Library gains 5+ blocks
- User clicks "Apply" on any grant → sees 100/100 draft within 60 seconds
- Sections that can't reach 10/10 show clear gap inputs
- Filling a gap saves to library permanently (never asked twice)
- Approved applications auto-save sections back to library
- 3rd application generates with 95%+ confidence (minimal gaps)
- Apply panel works on mobile (full screen) and desktop (560px drawer)
- Smart Fill is Pro/Organization only — free users get manual apply
