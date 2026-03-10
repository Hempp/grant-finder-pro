# GrantPilot Full Sweep Design Document

**Date:** 2026-03-09
**Version:** 2.0.0
**Status:** Approved

---

## 1. Vision

GrantPilot is the **Grant Intelligence Platform** — the first affordable, full-lifecycle grant platform that combines discovery, AI-assisted writing, compliance tracking, and outcome analytics. We don't just help you find grants. We tell you which ones you'll actually win.

**Tagline:** "Find grants you'll win. Apply with confidence."

**Target positioning:** Between Instrumentl ($299+/mo, discovery-focused) and Grantable ($24/mo, writing-focused). We own the full-lifecycle middle market.

---

## 2. Target Audiences (Priority Order)

| Segment | Size | Pain Level | Willingness to Pay |
|---------|------|------------|-------------------|
| Small nonprofits (<$500K budget) | 800K+ in US | Critical | $24-59/mo |
| Small businesses (SBIR/state grants) | 30M+ in US | High | $24-79/mo |
| Minority/women founders | Millions | Critical | $24-59/mo |
| First-time grant applicants | Millions | Critical | Free-$24/mo |
| Grant consultants (multi-client) | 50K+ | High | $79-199/mo |
| Mid-size nonprofits ($500K-$5M) | 200K+ | Medium | $59-199/mo |

---

## 3. Business Model

### 3.1 Pricing Tiers

| | Starter (Free) | Growth ($24/mo) | Pro ($59/mo) | Organization ($199/mo) |
|--|----------------|-----------------|--------------|----------------------|
| **Grant discovery** | 5 matches/mo | 25 matches/mo | Unlimited | Unlimited |
| **Auto-apply drafts** | 1/mo (taste it) | 5/mo | 20/mo | Unlimited |
| **AI model quality** | Basic | Standard | Premium (Claude) | Premium + custom tone |
| **Saved grants** | 10 | 50 | Unlimited | Unlimited |
| **Alerts** | Weekly digest | Daily | Real-time | Real-time + custom |
| **Team members** | 1 | 1 | 3 | 10 |
| **Grant Readiness Score** | Basic | Full | Full + recommendations | Full + benchmarking |
| **Funder Intelligence** | Limited profiles | Full profiles | Profiles + award history | Profiles + competitive intel |
| **Content Reuse Library** | ❌ | 10 blocks | Unlimited | Unlimited + templates |
| **Regulatory Radar** | ❌ | Monthly summary | Real-time alerts | Real-time + impact analysis |
| **Success tracking** | ❌ | Basic | ROI dashboard | Full reporting + export |
| **Budget builder** | ❌ | ❌ | Standard templates | Custom + funder-specific |
| **Support** | Community | Email (48h) | Priority (24h) | Dedicated CSM |
| **Grant Guarantee** | ❌ | ❌ | Win in 12mo or refund | Win in 12mo or refund |
| **Annual discount** | — | $19/mo (21% off) | $49/mo (17% off) | $169/mo (15% off) |

### 3.2 Trial Strategy

- **21-day Pro trial, no credit card required**
- Grant cycles are long — 14 days isn't enough to see value
- No CC = ~3x more signups (industry standard)
- After trial: drop to Free tier (not locked out), nudge to upgrade

### 3.3 Revenue Projections (Conservative)

| Milestone | Users | Paying | MRR |
|-----------|-------|--------|-----|
| Month 6 | 2,000 | 200 (10%) | $8,400 |
| Month 12 | 8,000 | 1,200 (15%) | $52,800 |
| Month 24 | 25,000 | 5,000 (20%) | $235,000 |

### 3.4 Future Add-ons (Phase 2+)

- **Grant Concierge** — Human review of AI drafts ($199/application)
- **Grant Writer Marketplace** — Connect orgs with vetted consultants (15% commission)
- **Funder-side tools** — Let funders publish and manage grants (two-sided marketplace)
- **API access** — For grant consultancies building on our data ($499/mo)

---

## 4. Design Direction

### 4.1 Aesthetic

**Warm & Approachable with Credibility Signals**

- **Palette:** Warm primary (teal/green = growth + money), warm neutrals, accent coral/amber for CTAs
- **Typography:** Clean sans-serif (Inter or similar), generous line height
- **Layout:** Spacious, card-based, lots of whitespace
- **Illustrations:** Friendly, diverse, hand-drawn style (not stock photo)
- **Animations:** Subtle — fade-ins, micro-interactions on hover, progress indicators
- **Tone:** Encouraging, expert but accessible ("You've got this. We'll help.")

### 4.2 Design Principles

1. **Show, don't tell** — Surface dollar amounts, match scores, deadlines prominently
2. **Progressive disclosure** — Don't overwhelm first-timers; reveal complexity as needed
3. **Celebrate progress** — Confetti on first saved grant, milestones on applications submitted
4. **Trust signals everywhere** — "X organizations funded", success rates, security badges
5. **Mobile-first** — Grant managers check deadlines on the go

### 4.3 Key UI Components

- **Grant Card** — Match score (color-coded), amount, deadline countdown, funder logo, one-click save
- **Readiness Meter** — Visual gauge showing org readiness for a specific grant
- **Pipeline Board** — Kanban-style application tracker (Discovered → Saved → Applying → Submitted → Awarded)
- **Regulatory Radar Widget** — Dashboard widget showing recent policy changes affecting user's grants
- **ROI Calculator** — "You've invested X hours. You've won $Y. That's $Z/hour ROI."

---

## 5. Feature Architecture

### 5.1 Core Features (Existing — Fix & Polish)

| Feature | Current State | Required Changes |
|---------|--------------|-----------------|
| Grant Discovery | Working, basic matching | Improve algorithm with funder history + readiness scoring |
| Auto-Apply Drafts | Working, 82% validation | Reposition as "AI-assisted" with human-in-loop editing |
| Organization Profile | Working | Add Grant Readiness Score calculation |
| Application Tracking | Basic CRUD | Add pipeline board (Kanban), deadline countdown |
| Stripe Billing | Working | Update to 4-tier model, add annual billing, Grant Guarantee |
| Email Alerts | Working (Resend) | Add real-time alerts for Pro+, regulatory radar |
| Document Intelligence | Working | Improve parsing for budget extraction |
| Referral Program | Working | Keep as-is, add to onboarding flow |

### 5.2 New Features (Build)

#### A. Grant Readiness Score
- Analyze org profile completeness, financials, team credentials, past grants
- Score 0-100 per grant opportunity
- Show specific gaps: "Add 2 more team bios to improve your score by 15 points"
- Algorithm: Weighted combination of profile completeness (20%), funder alignment (30%), team strength (20%), financial health (15%), past performance (15%)

#### B. Funder Intelligence Profiles
- Aggregate data from IRS 990 filings, USASpending.gov, foundation directories
- Show: total giving, average grant size, acceptance rate estimate, past awardees, giving trends
- "Similar funders" recommendations
- Optimal application timing (when do they review? when do they fund?)

#### C. Regulatory Radar
- Track federal funding changes (DOGE, policy shifts, new programs)
- Monitor SBIR/STTR reauthorization status
- DEI compliance requirement changes
- State-level program updates
- Push notifications for Pro+ users when changes affect saved grants

#### D. Content Reuse Library (Smart Boilerplate)
- Store reusable content blocks: mission, org history, team capacity, impact data
- Tag by content type and funder category
- AI auto-adapts tone, length, and emphasis per funder requirements
- Version history on all blocks

#### E. Smart Budget Builder
- Templates per funder type (NSF, NIH, foundation, state)
- Auto-calculate indirect costs, fringe benefits
- Validate against funder caps and requirements
- Export to funder-required formats (SF-424A, custom Excel, PDF)

#### F. Competitive Intelligence
- "X organizations applied to this funder last year"
- Average award amount and acceptance rate
- Profile of typical awardee (size, type, geography)
- Historical trends (is this funder growing or shrinking?)

#### G. AI Grant Application Intelligence (Flagship Feature)

The core differentiator: AI that reads the RFP, understands what the funder wants, and drafts a tailored application using the user's own data.

**Pipeline:**

1. **Requirement Parser** — User pastes grant URL or uploads RFP/application guidelines. AI extracts:
   - All required sections with word/page limits
   - Eligibility criteria (org type, geography, budget size, certifications)
   - Scoring rubric and weighted criteria
   - Required attachments and formats
   - Budget format requirements and caps
   - Deadlines (LOI, full application, reporting)
   - Funder priorities and language patterns

2. **Eligibility Pre-Check** — Cross-reference parsed requirements against org profile:
   - Green: "You qualify" with evidence
   - Yellow: "Likely qualify, verify X"
   - Red: "Missing requirement: 501(c)(3) status" — saves 100+ hours of wasted effort

3. **Smart Draft Engine** — Generates section-by-section draft pulling from:
   - Organization profile (mission, team, financials)
   - Content Reuse Library (past narratives, boilerplate)
   - Uploaded documents (pitch decks, business plans, impact reports)
   - Previous applications (what worked before)
   - Each section explicitly addresses specific scoring criteria
   - AI explains WHY it wrote what it wrote ("This addresses Criterion 2: Innovation, weighted 25%")

4. **Section-by-Section Review UI** — Human-in-loop editing:
   - Side-by-side: funder requirement on left, draft on right
   - AI suggestions with rationale
   - Tone meter: "This sounds too generic — add specific data"
   - Word count tracker per section with limit warnings
   - "Strengthen" button: AI rewrites weak sections

5. **Compliance Validator** — Pre-submission checklist:
   - Word/page limits check per section
   - All required sections completed
   - Budget math validation (totals match, rates within caps)
   - Required attachments checklist
   - Eligibility assertions verified
   - Formatting requirements met

6. **Scoring Criteria Coverage Map** — The secret weapon:
   - Visual map showing how well the application addresses each scoring criterion
   - Predicted score based on criterion coverage and strength
   - Specific recommendations: "Section 3 doesn't address Feasibility (20% of score). Add a timeline."
   - Overall application strength rating with actionable next steps

7. **Export & Submit** — PDF, Word, or structured data for portal submission

**Data Model:**

```
ApplicationIntelligence
  - applicationId, grantId
  - sourceType (url, upload, manual)
  - sourceUrl, sourceDocument
  - parsedRequirements (JSON: sections, limits, criteria, attachments)
  - scoringRubric (JSON: criteria name, weight, description)
  - eligibilityResults (JSON: criterion, status, evidence)
  - parsedAt

DraftSection
  - applicationIntelligenceId
  - sectionName, sectionOrder
  - requirement (what the funder asked for)
  - wordLimit, pageLimit
  - draftContent (AI-generated)
  - userContent (edited version)
  - sourceReferences (JSON: which org data/content blocks were used)
  - criteriaAddressed (JSON: which scoring criteria this section targets)
  - strengthScore (0-100)
  - status (draft, reviewed, approved)

ComplianceCheck
  - applicationIntelligenceId
  - checkType (word_limit, section_complete, budget_math, attachment, eligibility, format)
  - sectionName
  - status (pass, warning, fail)
  - message
  - checkedAt
```

**API Endpoints:**

```
POST  /api/intelligence/parse          - Parse grant URL or uploaded RFP
GET   /api/intelligence/[id]           - Get parsed requirements
POST  /api/intelligence/[id]/check     - Run eligibility pre-check
POST  /api/intelligence/[id]/draft     - Generate smart draft
PUT   /api/intelligence/[id]/sections  - Update draft sections
POST  /api/intelligence/[id]/validate  - Run compliance validator
GET   /api/intelligence/[id]/coverage  - Get scoring criteria coverage map
POST  /api/intelligence/[id]/export    - Export application (PDF/Word)
```

#### H. Guided First-Timer Experience
- "Grant Writing 101" onboarding wizard
- Readiness assessment before first search
- Recommended starter grants (high acceptance rate, small amounts, simple applications)
- Tooltips and contextual help throughout the app

#### H. Small Business & Minority Founder Tracks
- Dedicated matching for SBIR/STTR, SSBCI, state economic development
- Minority-specific grant database (Google Black Founders, Amber Grants, HerRise, etc.)
- Industry-specific filters (tech, manufacturing, agriculture, services)

#### I. Success Analytics Dashboard (Pro+)
- Win rate by funder, category, grant size
- Total dollars applied for vs. awarded
- Time invested per application
- ROI calculation: dollars won per hour invested
- Trend lines: are you improving?

#### J. Grant Guarantee System
- Pro+ users: automated tracking of grant outcomes
- 12-month window from subscription start
- If no grant awarded: automatic refund processing
- Marketing: "We're so confident in our matching, we guarantee results"

---

## 6. Technical Architecture

### 6.1 Current Stack (Keep)

- **Framework:** Next.js (downgrade from 16 to 15.x to fix Turbopack build, or disable Turbopack)
- **Database:** PostgreSQL via Prisma
- **Auth:** NextAuth.js v5
- **Payments:** Stripe
- **AI:** Anthropic SDK (Claude)
- **Email:** Resend
- **Rate Limiting:** Upstash Redis
- **Deployment:** Vercel

### 6.2 Required Changes

| Change | Reason |
|--------|--------|
| Fix Turbopack/Prisma build failure | Blocks all deployments |
| Update Prisma 6.x → 7.x | Resolve edge runtime WASM issue |
| Add cron job infrastructure | Regulatory radar, funder data scraping |
| Add Redis caching layer | Funder intelligence profiles, search performance |
| Add background job processing | Long-running AI tasks, data aggregation |

### 6.3 New Data Models

```
GrantReadinessScore
  - userId, grantId
  - overallScore (0-100)
  - profileCompleteness, funderAlignment, teamStrength, financialHealth, pastPerformance
  - gaps (JSON array of improvement suggestions)
  - calculatedAt

FunderProfile
  - name, ein, website, type (foundation, corporate, government)
  - totalGiving, averageGrantSize, grantCount
  - focusAreas (JSON), geographicFocus
  - acceptanceRateEstimate
  - pastAwardees (JSON)
  - givingTrend (increasing, stable, decreasing)
  - lastUpdated, dataSource

ContentBlock
  - userId, organizationId
  - type (mission, history, capacity, impact, team, budget_narrative)
  - title, content, tags (JSON)
  - usageCount
  - versions (JSON array)

RegulatoryUpdate
  - title, summary, fullContent
  - source, sourceUrl
  - affectedCategories (JSON)
  - affectedFunderTypes (JSON)
  - severity (info, warning, critical)
  - publishedAt

GrantGuarantee
  - userId, subscriptionId
  - startDate, endDate (12 months)
  - status (active, fulfilled, refunded, expired)
  - grantsApplied, grantsAwarded
  - refundAmount, refundedAt

BudgetTemplate
  - name, funderType, grantType
  - structure (JSON: categories, line items, formulas)
  - indirectCostRate, fringeBenefitRate
  - validationRules (JSON)
```

### 6.4 API Endpoints (New)

```
GET/POST  /api/readiness                    - Calculate readiness scores
GET       /api/funders                       - Search funder profiles
GET       /api/funders/[id]                  - Funder detail + award history
GET       /api/regulatory                    - Regulatory updates feed
GET/POST  /api/content-blocks                - Content reuse library CRUD
POST      /api/budget/generate               - Generate budget from template
GET       /api/analytics/dashboard           - Success analytics data
GET       /api/analytics/roi                 - ROI calculations
POST      /api/guarantee/check               - Check guarantee eligibility
GET       /api/competitive/[grantId]         - Competitive intelligence for a grant
```

---

## 7. Implementation Phases

### Phase 1: Foundation (Fix & Ship) — Week 1
- Fix Turbopack/Prisma build failure
- Update pricing to 4-tier model
- Commit pending accessibility/performance changes
- Deploy to Vercel (get it live)
- Update landing page with new messaging

### Phase 2: Design Overhaul — Weeks 2-3
- Implement warm & approachable design system
- Redesign landing page (new value prop, social proof, trust signals)
- Redesign dashboard (pipeline board, grant cards, readiness meter)
- Redesign pricing page (4 tiers, annual toggle, guarantee badge)
- Mobile responsive pass on all pages
- Guided onboarding wizard for first-timers

### Phase 3: AI Grant Application Intelligence — Weeks 4-6
**The flagship feature. This is what makes GrantPilot the market leader.**
- Requirement Parser (URL + RFP upload → structured requirements)
- Eligibility Pre-Check engine
- Smart Draft Engine (section-by-section, org-data-aware)
- Section-by-Section Review UI (side-by-side funder req + draft)
- Compliance Validator (word limits, completeness, budget math)
- Scoring Criteria Coverage Map (predicted score + recommendations)
- Export system (PDF, Word)

### Phase 4: Intelligence & Analytics — Weeks 7-9
- Grant Readiness Score engine
- Funder Intelligence Profiles (IRS 990 data integration)
- Content Reuse Library
- Regulatory Radar (MVP: manual curation, later: automated scraping)
- Competitive Intelligence (basic: past award data)
- Smart Budget Builder
- Success Analytics Dashboard

### Phase 5: Advanced Features — Weeks 10-12
- Grant Guarantee system
- Small Business & Minority Founder tracks
- Enhanced AI model tiering (basic vs premium per plan)
- Application learning (improve drafts from past wins/losses)

### Phase 6: Growth & Scale — Weeks 13+
- Grant Writer Marketplace
- API for consultancies
- Funder-side tools exploration
- Community features
- International grant expansion

---

## 8. Competitive Moats

1. **AI Grant Application Intelligence** — Nobody parses RFPs, maps scoring criteria, and drafts requirement-aware applications. This is the flagship.
2. **Scoring Criteria Coverage Map** — Users see predicted scores BEFORE submitting. No competitor does this.
3. **Proprietary funder data** — Historical awards from 990s, USASpending.gov. Gets more valuable over time.
4. **Learning org profiles** — Every application teaches the system. Matching accuracy compounds.
5. **Grant Guarantee** — Bold confidence signal. Only Granted AI does this ($680/yr). We offer it at $59/mo.
6. **Regulatory Radar** — Nobody tracks DOGE/DEI/SBIR changes in real-time for grant seekers.
7. **Full lifecycle at accessible price** — Instrumentl charges $299/mo for discovery alone. We offer discovery + writing + tracking at $59/mo.

---

## 9. Success Metrics

| Metric | Target (Month 6) | Target (Month 12) |
|--------|------------------|-------------------|
| Registered users | 2,000 | 8,000 |
| Paying customers | 200 | 1,200 |
| MRR | $8,400 | $52,800 |
| Free → Paid conversion | 10% | 15% |
| Trial → Paid conversion | 25% | 35% |
| Churn rate | <8% | <5% |
| Grants matched | 50K | 500K |
| Applications submitted via platform | 500 | 5,000 |
| Grants awarded (tracked) | 50 | 750 |
| NPS | 40+ | 50+ |

---

## 10. Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Funder AI backlash | Position as "AI-assisted" with human-in-loop, transparency features |
| Instrumentl competitive pressure ($55M raised) | Compete on price + full-lifecycle, not discovery alone |
| Grant Guarantee liability | Cap at subscription fees paid; track win rates to calibrate |
| Regulatory data accuracy | Multiple sources, timestamps, user-reported corrections |
| Build complexity creep | Strict phased approach; ship Phase 1 before starting Phase 2 |

---

## 11. Research Sources

- Instrumentl pricing ($299-899/mo), 4,500 customers, $55M raised
- OpenGrants ($29/mo single tier), grant writer marketplace
- Grantable (Free/$24/$60), AI model quality tiering
- GrantWatch ($49/mo), 350K+ funder profiles
- Granted AI ($220-680/yr), Grant Guarantee model
- Giving USA 2025: $592.5B charitable giving, $109B foundation giving
- $4.4B unclaimed Pell Grants, $4-7B unclaimed matching gifts
- Grant management software market: $2.88B → $7.4B by 2034
- DOGE: $41.5B in federal contract cancellations
- Candid: 67% of funders undecided on AI policy
- GrantHub sunset Jan 31, 2026 (acquisition window)
- 95% of orgs submitting 6+ applications get funded
- Federal applications take 100+ hours at $50-250/hour
