# Student Grants & Scholarships — Design Spec

**Date:** 2026-04-06
**Status:** Approved
**Version:** 1.0

---

## 1. Overview

Add a complete student-facing vertical to GrantPilot that finds scholarships, drafts essays, and auto-applies — covering undergraduates, graduates, PhD candidates, pre-med, medical, dental, and law students.

**Core insight:** Students fill out the same information 30+ times across scholarship applications. GrantPilot builds their profile once, then AI adapts their story to each scholarship's specific essay prompt and submits on their behalf.

**Business model:** Free unlimited usage with 8% success fee on awards. Subscription tiers exist to waive the fee for high-volume winners.

---

## 2. Architecture: Parallel App with Shared Core

Same Next.js app. Shared infrastructure (auth, billing, email, Smart Fill, Content Library). Separate routes and data models for students vs organizations.

```
Shared Core (existing):
  ├── Auth (NextAuth)
  ├── Stripe billing
  ├── Resend email
  ├── Content Library (ContentBlock model)
  ├── Smart Fill Engine (essay adaptation, not just proposal writing)
  └── PDF parsing (pdf-parse)

Organization Vertical (existing):
  ├── /dashboard/*
  ├── Organization model
  ├── Grant model + sources
  └── Application model

Student Vertical (new):
  ├── /student/*
  ├── StudentProfile model
  ├── Scholarship model + sources
  └── StudentApplication model
```

### Routing Logic

After signup, `userType` on the User model determines routing:
- `organization` → redirect to `/dashboard`
- `student` → redirect to `/student`

Signup page gets a type selector before the form.

---

## 3. Data Model

### User (extend existing)

```prisma
model User {
  // ... existing fields ...
  userType                String   @default("organization") // "organization" | "student"
  stripePaymentMethodId   String?  // card on file for success fees
  outcomesOverdue         Int      @default(0)
  studentProfile          StudentProfile?
}
```

### StudentProfile (new)

```prisma
model StudentProfile {
  id                  String   @id @default(cuid())
  userId              String   @unique
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Identity
  firstName           String
  lastName            String
  dateOfBirth         DateTime?

  // School
  schoolName          String
  schoolType          String   // high_school, community_college, university, graduate_school
  educationLevel      String   // hs_senior, undergrad_fr, undergrad_so, undergrad_jr,
                               // undergrad_sr, post_bacc, masters, phd, medical, dental, law

  // Academic
  major               String?
  minor               String?
  gpa                 Float?
  gpaScale            Float    @default(4.0)
  expectedGraduation  String?  // "2027", "2028", etc.
  fieldOfStudy        String?  // STEM, humanities, business, health_sciences, arts,
                               // education, social_sciences, law, other

  // Career
  careerGoal          String?  // One sentence
  intendedDegree      String?  // MD, JD, PhD, MBA, etc.

  // Test Scores (all optional)
  satScore            Int?
  actScore            Int?
  greScore            Int?
  mcatScore           Int?
  lsatScore           Int?
  gmatScore           Int?

  // Eligibility
  stateOfResidence    String
  citizenship         String   // us_citizen, permanent_resident, daca, international
  financialNeed       String   @default("not_disclosed") // high, medium, low, not_disclosed

  // Demographics (all optional — many scholarships filter on these)
  firstGeneration     Boolean?
  minority            Boolean?
  veteran             Boolean?
  disability          Boolean?
  gender              String?
  ethnicity           String?

  // Activities (JSON arrays)
  extracurriculars    String?  // JSON: [{name, role, years, description}]
  workExperience      String?  // JSON: [{employer, role, dates, description}]
  communityService    String?  // JSON: [{org, role, hours, description}]
  awards              String?  // JSON: [{name, year, description}]
  researchExperience  String?  // JSON: [{lab, topic, advisor, description}]

  // Status
  profileComplete     Boolean  @default(false)
  readinessScore      Int?
  lastAssessedAt      DateTime?

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([userId])
  @@index([educationLevel])
  @@index([stateOfResidence])
  @@index([fieldOfStudy])
}
```

### Scholarship (new)

```prisma
model Scholarship {
  id                  String   @id @default(cuid())

  // Core
  title               String
  provider            String          // Organization offering the scholarship
  description         String          @db.Text
  amount              String?         // Display string: "$5,000", "$500 - $10,000"
  amountMin           Int?
  amountMax           Int?
  deadline            DateTime?
  url                 String?         // Info page
  applicationUrl      String?         // Where to apply

  // Type
  scholarshipType     String          // merit, need, demographic, essay, field_specific,
                                      // athletic, community, employer, research, service
  renewable           Boolean         @default(false)
  renewalConditions   String?

  // Requirements
  minGPA              Float?
  maxGPA              Float?
  educationLevels     String?         // JSON: ["undergrad_fr","undergrad_so",...]
  fieldsOfStudy       String?         // JSON: ["STEM","health_sciences"]
  citizenshipRequired String?         // us_citizen, permanent_resident, any
  stateRestriction    String?         // null = national, "CA" = California only
  eligibilityText     String?         @db.Text

  // Essay
  essayRequired       Boolean         @default(false)
  essayPrompt         String?         @db.Text
  essayWordLimit      Int?

  // Submission
  submissionMethod    String          @default("portal") // email, form, portal, mail
  portalUrl           String?
  portalInstructions  String?         @db.Text

  // Matching
  tags                String?         // JSON array of keywords
  matchScore          Int?            // calculated per student

  // Source tracking
  sourceId            String?
  sourceUrl           String?
  lastScraped         DateTime?
  status              String          @default("active") // active, expired, closed

  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  applications        StudentApplication[]

  @@index([deadline])
  @@index([scholarshipType])
  @@index([status])
  @@index([stateRestriction])
}
```

### StudentApplication (new)

```prisma
model StudentApplication {
  id                  String   @id @default(cuid())
  userId              String
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  scholarshipId       String
  scholarship         Scholarship @relation(fields: [scholarshipId], references: [id], onDelete: Cascade)

  // Status lifecycle: draft → ready → submitted → awarded/rejected
  status              String   @default("draft")

  // Content
  essayDraft          String?  @db.Text  // AI-generated draft
  essayFinal          String?  @db.Text  // Student-approved final
  responses           String?            // JSON: additional form field responses

  // Submission
  submissionMethod    String?            // how this specific app was submitted
  confirmationNumber  String?
  submittedAt         DateTime?
  portalInstructions  String?  @db.Text  // copy-paste guide for portal submissions

  // Outcome
  awardedAt           DateTime?
  rejectedAt          DateTime?
  awardAmount         Int?
  outcomeReportedAt   DateTime?
  outcomeNotes        String?

  // Success fee
  successFeePercent   Int      @default(8)  // 8, 3, or 0 based on tier
  successFeeAmount    Int?                  // calculated on award: awardAmount * percent / 100
  successFeeStatus    String   @default("not_applicable") // not_applicable, pending, charged,
                                                          // installment, waived, disputed
  successFeePaidAt    DateTime?
  stripePaymentId     String?              // Stripe charge/payment intent ID
  installmentPlan     String?              // JSON: [{amount, dueDate, status, stripeId}]

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([userId])
  @@index([scholarshipId])
  @@index([status])
  @@index([successFeeStatus])
  @@index([userId, status])
}
```

### Content Library Categories (student additions)

Extend existing ContentBlock categories with student-specific types:
```
personal_statement, activities, work_experience, community_service,
awards_honors, career_goals, challenges_overcome, leadership,
research_experience, why_this_field, financial_need_statement,
diversity_statement, recommendation_context
```

---

## 4. Student Onboarding Flow

4-step wizard at `/student/onboarding`. Goal: capture enough info to start matching immediately, with optional depth for better matches.

### Step 1: Who You Are (required)
- First name, last name
- School name (autocomplete from database)
- Education level (dropdown: High School Senior through Medical/Law)
- Expected graduation year
- State of residence

### Step 2: Academics (required)
- Major / intended major
- GPA (optional but flagged as "improves matches by 40%")
- Field of study (multi-select: STEM, health sciences, etc.)
- Career goal (one sentence: "Become a pediatric surgeon")
- Intended degree (if grad: MD, PhD, JD, MBA, etc.)

### Step 3: Eligibility Boosters (optional)
- Citizenship status
- Financial need level
- First-generation student?
- Demographics (optional, clearly labeled: "Many scholarships target specific backgrounds")
- Test scores (SAT/ACT/GRE/MCAT/LSAT — whichever applies)

### Step 4: Your Story (the Content Library seed)
- Personal statement textarea (or paste existing one)
- OR upload resume/CV (parsed automatically via document pipeline)
- Activities list (structured: name, role, years, one-line description)
- "Add more later" option — profile doesn't need to be 100% complete

After completion: redirect to `/student/dashboard` with first scholarship matches loading.

---

## 5. Scholarship Sources

### Launch Sources (Phase 1)
Build scrapers for publicly available scholarship data:

1. **Federal Student Aid (studentaid.gov)** — Pell Grants, FSEOG, Federal Work-Study
2. **State Higher Ed Commissions** — Every state has a grants portal (e.g., cal-grants.org, FAFSA state grants)
3. **College Board Scholarship Search** — Public scholarship database
4. **Department of Education** — Federal scholarship programs
5. **NSF GRFP** — Graduate Research Fellowships
6. **NIH F31/F32** — Pre/post-doctoral fellowships
7. **University-specific** — Scrape financial aid pages of top 200 universities
8. **Community foundations** — Local community foundation grants (thousands of small, niche scholarships)
9. **Professional associations** — AMA, ABA, IEEE, ACM etc. all offer student scholarships
10. **Corporate scholarships** — Google, Microsoft, Amazon, Coca-Cola, etc.

### Deep Discovery Sources (the "places they'll never think of")
11. **Religious organizations** — Church-specific, denomination-specific grants
12. **Fraternal organizations** — Elks, Rotary, Kiwanis, Lions Club, Masons
13. **Employer-sponsored** — Many large employers offer scholarships to employees' children
14. **Union scholarships** — AFL-CIO, SEIU, teamsters all have scholarship programs
15. **Ethnicity-specific foundations** — UNCF, Hispanic Scholarship Fund, APIA Scholars, etc.
16. **Disease/condition-specific** — Scholarships for students with specific conditions
17. **Hobby/interest-specific** — Duck calling, duct tape prom dress, tall people scholarships
18. **Military/veteran** — GI Bill adjacent, military family scholarships
19. **Local business scholarships** — Small businesses offering $500-$2,000 (rarely aggregated anywhere)
20. **Essay contest databases** — Many "scholarships" are really essay contests with prizes

### Source Architecture
```
src/lib/scholarship-sources/
  ├── registry.ts              // SourceRegistry pattern (same as grant sources)
  ├── federal-student-aid.ts
  ├── state-commissions.ts
  ├── college-board.ts
  ├── nsf-grfp.ts
  ├── nih-fellowships.ts
  ├── university-scraper.ts
  ├── community-foundations.ts
  ├── professional-associations.ts
  ├── corporate-scholarships.ts
  ├── niche-scholarships.ts    // religious, fraternal, hobby, etc.
  └── essay-contests.ts
```

Each source implements a `ScholarshipSource` interface:
```typescript
interface ScholarshipSource {
  id: string;
  name: string;
  fetch(filters?: ScholarshipFilters): Promise<Scholarship[]>;
  scrapeInterval: number; // hours between scrapes
}
```

### Scholarship Matching Algorithm

Weighted scoring (0-100) adapted from existing grant matcher:

| Factor | Weight | How |
|--------|--------|-----|
| Education level match | 20% | Scholarship's educationLevels includes student's level |
| Field of study match | 20% | Overlap between scholarship fields and student's field |
| GPA eligibility | 15% | Student GPA >= scholarship minGPA |
| Location match | 15% | State restriction matches or national |
| Demographic match | 10% | First-gen, minority, veteran flags align |
| Financial need match | 10% | Need level aligns with scholarship type |
| Keyword similarity | 10% | Career goal + activities vs scholarship description |

---

## 6. Auto-Apply Flow (Batch Review)

### The Experience

1. **Match** — Student logs into dashboard, sees ranked scholarship matches
2. **Select** — Student picks scholarships to apply to (or selects "Apply to All Matches")
3. **AI Drafts** — Smart Fill reads each scholarship's essay prompt + the student's Content Library and drafts a personalized essay per scholarship
4. **Queue** — Student sees a review queue: each application with draft essay, pre-filled fields, and submission method tag (auto/paste-ready)
5. **Review** — Student reads each essay (30 seconds), can edit inline, then approves or skips
6. **Submit** — Approved applications are either:
   - Auto-submitted (email/form) — confirmation shown immediately
   - Paste-ready (portal) — step-by-step guide with copy buttons shown
7. **Track** — All applications tracked in `/student/applications` with status timeline

### Essay Adaptation Logic

Smart Fill already maps content blocks to application sections. For students, the mapping is:

```
Essay Prompt Analysis → Content Block Selection → Draft Generation

Example:
  Prompt: "Describe a challenge you've overcome and what you learned"
  Maps to: challenges_overcome + leadership + personal_statement
  Generates: 500-word essay pulling specific details from student's story,
            adapted to the scholarship's word limit, tone, and focus area
```

The AI instruction for student essays vs org proposals:
- **Voice:** First person, personal narrative (not third-person institutional)
- **Tone:** Authentic, specific, vulnerable where appropriate (not corporate)
- **Structure:** Hook → story → lesson → connection to scholarship mission
- **Adaptation:** Each essay references the specific scholarship provider's values

### Submission Methods

| Method | How It Works | Tag in UI |
|--------|-------------|-----------|
| **Email** | GrantPilot sends email with essay + attachments from student's verified email | "Auto-submit" (green) |
| **Web form** | Pre-fill form fields, student confirms, system submits | "Auto-submit" (green) |
| **Portal** | Generate paste-ready package with copy buttons per field + step-by-step instructions | "Paste-ready" (blue) |
| **Mail/PDF** | Generate formatted PDF, student prints and mails | "Print & mail" (gray) |

---

## 7. Pricing & Revenue

### Student Tiers

| Tier | Price | Includes | Success Fee |
|------|-------|----------|-------------|
| **Free** | $0 | Unlimited matches, unlimited drafts, unlimited auto-apply | 8% on awards |
| **Season Pass** | $29 one-time | 90 days unlimited | 3% on awards |
| **Pro Monthly** | $9.99/mo | Unlimited + priority drafts + score predictions | 0% |
| **Pro Annual** | $79/yr | Same as monthly, save 34% | 0% |

### Success Fee Collection

**Layer 1 — Card on file (primary):**
- Required before first auto-apply submission
- Stripe SetupIntent → save PaymentMethod
- Auto-charge when student reports "awarded" outcome
- Installment option: split fee into 4 monthly payments

**Layer 2 — Outcome tracking (enforcement):**
- Post-deadline email sequence: 7 days, 14 days, 30 days after deadline
- Account gating: cannot submit NEW applications until overdue outcomes reported
- UI banner: "You have X applications past deadline. Report outcomes to continue."

**Layer 3 — Winner verification (detection):**
- Scrape public winner lists from scholarship provider websites
- Cross-reference winner names against user database
- Flag matches for manual verification + auto-prompt outcome report

**Layer 4 — Institutional collection (for school-disbursed awards):**
- Schools with institutional licenses verify awards through financial aid office
- Fee deducted at disbursement or paid from school's admin budget
- Cleanest path for scholarships that pay the school directly

**Layer 5 — Legal terms (backstop):**
- ToS signed at signup: "8% success fee on all awards from applications submitted through GrantPilot"
- Fee is owed regardless of whether award goes to student or school
- 30-day payment window after outcome reported
- Account suspension for non-payment after 90 days

### Celebration UX (PSYCHE-informed)

When a student wins and the fee is charged, frame as achievement, not cost:

```
🎉 Congratulations!

You won the [Scholarship Name]!
Award: $5,000

GrantPilot fee (8%): $400
You earned: $4,600 for 10 minutes of work.
That's $27,600/hour.

[Upgrade to Pro — eliminate fees on future awards]
```

### Institutional Licenses

| Tier | Price | Coverage |
|------|-------|----------|
| High School | $1,500/yr | All seniors get Pro free |
| University | $5,000/yr | All students get Pro free |
| University Premium | $15,000/yr | White-label + API + analytics |
| State System | $50,000/yr | All schools in state |

### Future: Scholarship Provider Marketplace

Scholarship providers pay to reach qualified applicants:
- Featured listing: $500/mo
- Per-applicant: $2/qualified application
- Employer scholarship: $2,000/yr (recruit + fund)

---

## 8. Student Dashboard (`/student/*`)

Completely separate from org dashboard. Same design language (dark theme, emerald accents) but different information architecture.

### Routes

```
/student                    → Dashboard home (matches + stats)
/student/profile            → Edit student profile
/student/scholarships       → Browse/search all scholarships
/student/scholarships/[id]  → Scholarship detail + apply
/student/applications       → All applications with status
/student/applications/[id]  → Application detail + timeline
/student/apply              → Batch review queue
/student/library            → Content Library (essays, activities)
/student/documents          → Uploaded documents
/student/settings           → Account, billing, payment method
/student/onboarding         → First-time setup wizard
```

### Dashboard Home (`/student`)

```
┌──────────────────────────────────────────────────┐
│ Welcome back, [Name]           [Profile] [Alerts]│
├──────────────────────────────────────────────────┤
│                                                  │
│  STATS ROW:                                      │
│  [Applied: 12] [Pending: 8] [Won: 3] [$4,200]  │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  TOP MATCHES (3-5 cards)                         │
│  ┌────────┐ ┌────────┐ ┌────────┐               │
│  │ $5,000 │ │ $2,500 │ │ $1,000 │               │
│  │ Merit  │ │ STEM   │ │ Essay  │               │
│  │ 92%    │ │ 87%    │ │ 84%    │               │
│  │ Due 5d │ │ Due 2w │ │ Due 1m │               │
│  │[Apply] │ │[Apply] │ │[Apply] │               │
│  └────────┘ └────────┘ └────────┘               │
│                        [Apply to All Matches →]  │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  RECENT ACTIVITY                                 │
│  • Essay drafted for XYZ Scholarship       2h ago│
│  • Applied to ABC Foundation Grant       yesterday│
│  • New match: DEF Fellowship (95% match)   3d ago│
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  PROFILE STRENGTH: [████████░░] 78%              │
│  "Add test scores to unlock 15 more matches"     │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Batch Apply Queue (`/student/apply`)

```
┌──────────────────────────────────────────────────┐
│  Review & Submit (8 applications)                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                  │
│                                                  │
│  ┌ APPLICATION 1 of 8 ─────────────────────────┐ │
│  │ Gates Millennium Scholarship — $10,000       │ │
│  │ Due: Jan 15, 2027 │ Method: Auto-submit ✅   │ │
│  │                                              │ │
│  │ ESSAY PROMPT:                                │ │
│  │ "Describe your commitment to community..."   │ │
│  │                                              │ │
│  │ AI DRAFT:                                    │ │
│  │ ┌──────────────────────────────────────────┐ │ │
│  │ │ Growing up in East Oakland, I learned     │ │ │
│  │ │ that community isn't a place — it's a     │ │ │
│  │ │ practice. When our neighborhood clinic    │ │ │
│  │ │ lost funding in 2024, I organized...      │ │ │
│  │ │ [498/500 words]                           │ │ │
│  │ └──────────────────────────────────────────┘ │ │
│  │                                              │ │
│  │ [✏️ Edit] [✓ Approve] [⏭ Skip] [🔄 Redraft] │ │
│  └──────────────────────────────────────────────┘ │
│                                                  │
│  Progress: ████░░░░ 1/8                          │
│  [Submit All Approved →]                         │
└──────────────────────────────────────────────────┘
```

---

## 9. PSYCHE Integration (Psychological Design Principles)

The student dashboard and flows are designed with PSYCHE principles baked in:

### Attention (AT)
- Dashboard shows 3-5 top matches, not 50. Prevents overwhelm.
- Single "Apply to All Matches" CTA is the dominant action.
- Scholarship cards show amount first (largest text) — money is the attention anchor.

### Cognition (CG)
- Onboarding is 4 steps, each under 2 minutes. No step has more than 6 fields.
- Batch apply queue shows one application at a time, not a list. Reduces cognitive load.
- Progress bar shows "1 of 8" — Zeigarnik effect drives completion.

### Emotion (EM)
- Profile strength bar ("78% — add test scores to unlock 15 more matches") creates growth motivation, not shame.
- Win celebration screen frames the fee as "$27,600/hour" — pride, not loss.
- Match percentage on scholarship cards creates excitement and confidence.

### Trust (TR)
- "Card on file" explained transparently: "No charge until you win."
- Success fee terms shown during onboarding, not hidden in ToS.
- Outcome reporting framed as helping other students, not just fee collection.

### Persuasion (PE)
- Default is "Apply to All" — opt-out, not opt-in. Applies Fogg's ability principle.
- Deadline urgency is real and visible ("Due in 5 days" badge).
- Profile strength gamification: "Add X to unlock Y matches" — specific, achievable.

### Resonance (RE)
- Archetype: Mentor/Guide — "We found these for you" (not "browse our database").
- Copy speaks to the student's identity: "Become" language, career goals front and center.
- Activities and awards celebrate who they are, not just what they've done.

### Flow (FL)
- Every action has feedback: draft generated → toast notification, application submitted → confirmation screen.
- Batch queue has clear progress (1/8, 2/8...) — user always knows where they are.
- Error states include next action: "GPA too low for this scholarship — see 12 other matches."

### Harmony (HA)
- Same visual DNA as org side: emerald accents, slate backgrounds, rounded-xl cards, 8px grid.
- Student dashboard is visually distinct (different layout) but harmonious (same design tokens).

### Shadow Guard
- No dark patterns in fee collection. Fee amount always shown before charge.
- No manufactured urgency — deadline badges only show real deadlines.
- No guilt in outcome reporting — "Help other students by sharing your results."
- Installment plans offered proactively, not as a last resort after failed payment.
- "Skip" always available in batch queue — no forced applications.

---

## 10. Signup Flow Changes

### Updated Signup Page

Add a type selector before the existing form:

```
"I'm applying for grants as..."

[🏢 An Organization]        [🎓 A Student]
 Nonprofits, startups,       Undergrad, graduate,
 research institutions       medical, law students
```

Selection sets `userType` on the User model. The rest of the signup form stays the same (name, email, password). After signup:
- Organization → redirect to `/dashboard/onboarding`
- Student → redirect to `/student/onboarding`

---

## 11. Email Additions

### Student-specific emails:

1. **Welcome (student variant)** — "Your scholarship journey starts here. Complete your profile to see matches."
2. **New matches** — "3 new scholarships match your profile this week" (weekly digest)
3. **Deadline reminder** — "XYZ Scholarship closes in 3 days. Your draft is ready to review."
4. **Application submitted** — Confirmation with scholarship details + confirmation number
5. **Outcome prompt** — "Have you heard back from XYZ Scholarship?" (7/14/30 day sequence)
6. **Award celebration** — "You won! Here's your $X,XXX. Fee details inside."
7. **Fee receipt** — Stripe receipt for success fee charge
8. **Installment reminder** — "Your next installment of $XX is due in 3 days"
9. **Profile strength nudge** — "Add your GPA to unlock 15 more matches"

---

## 12. Implementation Phases

### Phase 1: Foundation (Build First)
- Prisma schema changes (StudentProfile, Scholarship, StudentApplication)
- Signup type selector + routing
- Student onboarding wizard (4 steps)
- Student dashboard shell (`/student` routes)
- Scholarship model + 3-5 initial sources (federal, state, curated database)
- Student matching algorithm
- Content Library with student categories

### Phase 2: Auto-Apply Engine
- Essay adaptation in Smart Fill (student voice mode)
- Batch apply queue UI
- Submission handling (email auto-submit + paste-ready packages)
- Application tracking + status timeline
- Confirmation emails

### Phase 3: Revenue
- Stripe card-on-file (SetupIntent)
- Success fee calculation + auto-charge
- Installment plans
- Outcome tracking + nudge email sequence
- Account gating for overdue outcomes
- Celebration + upsell UX

### Phase 4: Scale
- Additional scholarship sources (20+ scrapers)
- Winner list scraping for verification
- Institutional license system
- Scholarship provider marketplace
- Analytics dashboard for schools

---

## 13. Files to Create/Modify

### New Files
```
prisma/schema.prisma                              (extend)
src/app/(auth)/signup/page.tsx                     (modify — add type selector)
src/app/student/layout.tsx                         (new — student layout)
src/app/student/page.tsx                           (new — dashboard)
src/app/student/onboarding/page.tsx                (new — 4-step wizard)
src/app/student/profile/page.tsx                   (new — edit profile)
src/app/student/scholarships/page.tsx              (new — browse)
src/app/student/scholarships/[id]/page.tsx         (new — detail)
src/app/student/applications/page.tsx              (new — list)
src/app/student/applications/[id]/page.tsx         (new — detail + timeline)
src/app/student/apply/page.tsx                     (new — batch queue)
src/app/student/library/page.tsx                   (new — content library)
src/app/student/settings/page.tsx                  (new — account + payment)
src/app/api/student/profile/route.ts               (new — CRUD)
src/app/api/student/scholarships/route.ts          (new — search + match)
src/app/api/student/scholarships/discover/route.ts (new — scrape + save)
src/app/api/student/applications/route.ts          (new — CRUD)
src/app/api/student/applications/[id]/route.ts     (new — detail)
src/app/api/student/applications/[id]/submit/route.ts  (new — submit)
src/app/api/student/applications/[id]/outcome/route.ts (new — report)
src/app/api/student/applications/batch/route.ts    (new — batch draft + submit)
src/app/api/student/onboarding/route.ts            (new — complete onboarding)
src/lib/scholarship-sources/registry.ts            (new)
src/lib/scholarship-sources/federal-student-aid.ts (new)
src/lib/scholarship-sources/state-commissions.ts   (new)
src/lib/scholarship-sources/curated-database.ts    (new)
src/lib/scholarship-matcher.ts                     (new — matching algorithm)
src/lib/smart-fill/essay-adapter.ts                (new — student essay mode)
src/lib/success-fee.ts                             (new — fee calculation + charge)
```

### Modified Files
```
prisma/schema.prisma          — Add StudentProfile, Scholarship, StudentApplication + User.userType
src/app/(auth)/signup/page.tsx — Add type selector
src/lib/email.ts              — Add student email variants
src/middleware.ts              — Route based on userType
```

---

## 14. Success Metrics

| Metric | Target (Month 3) | Target (Year 1) |
|--------|-------------------|------------------|
| Student signups | 1,000 | 50,000 |
| Profile completion rate | 60% | 75% |
| Applications submitted | 5,000 | 200,000 |
| Win rate | 12% | 18% |
| Success fee revenue | $15K | $600K |
| Subscription revenue | $5K | $200K |
| Institutional deals | 3 pilots | 50 schools |
| Net revenue | $20K | $800K+ |
