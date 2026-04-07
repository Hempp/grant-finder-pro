# Student Grants Phase 1: Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the student vertical foundation — schema, signup routing, onboarding wizard, scholarship model, 3 initial sources, matching algorithm, and student dashboard shell.

**Architecture:** Parallel routes (`/student/*`) sharing existing auth, billing, email, and Content Library infrastructure. New Prisma models (StudentProfile, Scholarship, StudentApplication). New scholarship source registry mirroring existing grant source pattern. Student matching algorithm adapted from grant matcher.

**Tech Stack:** Next.js 16, Prisma (PostgreSQL/Neon), TypeScript, Tailwind CSS, NextAuth, Vitest

**Spec:** `docs/superpowers/specs/2026-04-06-student-grants-design.md`

---

## File Map

### New Files
```
prisma/schema.prisma                                    (modify — add 3 models + User.userType)
src/middleware.ts                                       (modify — add /student/* routing)
src/app/(auth)/signup/page.tsx                          (modify — add type selector)
src/app/student/layout.tsx                              (create — student dashboard shell)
src/app/student/page.tsx                                (create — student dashboard home)
src/app/student/onboarding/page.tsx                     (create — 4-step wizard)
src/app/api/student/profile/route.ts                    (create — CRUD)
src/app/api/student/onboarding/route.ts                 (create — mark complete)
src/app/api/student/scholarships/route.ts               (create — search + match)
src/app/api/student/scholarships/discover/route.ts      (create — scrape + save)
src/lib/scholarship-sources/types.ts                    (create — interfaces)
src/lib/scholarship-sources/registry.ts                 (create — source registry)
src/lib/scholarship-sources/curated-database.ts         (create — seed scholarships)
src/lib/scholarship-sources/federal-student-aid.ts      (create — Pell/FSEOG)
src/lib/scholarship-sources/corporate-scholarships.ts   (create — Google/MS/etc)
src/lib/scholarship-sources/index.ts                    (create — register all)
src/lib/scholarship-matcher.ts                          (create — matching algorithm)
src/lib/__tests__/scholarship-matcher.test.ts           (create — matcher tests)
src/lib/__tests__/scholarship-registry.test.ts          (create — registry tests)
```

---

## Task 1: Prisma Schema — Add Student Models

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add userType and payment fields to User model**

In `prisma/schema.prisma`, find the User model and add after the existing fields (before the relations):

```prisma
  // Student support
  userType                String   @default("organization") // "organization" | "student"
  stripePaymentMethodId   String?  // card on file for success fees
  outcomesOverdue         Int      @default(0)

  // Relations
  studentProfile          StudentProfile?
  studentApplications     StudentApplication[]
```

- [ ] **Step 2: Add StudentProfile model**

Add after the Organization model:

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
  educationLevel      String   // hs_senior, undergrad_fr, undergrad_so, undergrad_jr, undergrad_sr,
                               // post_bacc, masters, phd, medical, dental, law

  // Academic
  major               String?
  minor               String?
  gpa                 Float?
  gpaScale            Float    @default(4.0)
  expectedGraduation  String?
  fieldOfStudy        String?  // STEM, humanities, business, health_sciences, arts,
                               // education, social_sciences, law, other

  // Career
  careerGoal          String?
  intendedDegree      String?  // MD, JD, PhD, MBA, etc.

  // Test scores
  satScore            Int?
  actScore            Int?
  greScore            Int?
  mcatScore           Int?
  lsatScore           Int?
  gmatScore           Int?

  // Eligibility
  stateOfResidence    String
  citizenship         String   // us_citizen, permanent_resident, daca, international
  financialNeed       String   @default("not_disclosed")

  // Demographics (optional)
  firstGeneration     Boolean?
  minority            Boolean?
  veteran             Boolean?
  disability          Boolean?
  gender              String?
  ethnicity           String?

  // Activities (JSON)
  extracurriculars    String?
  workExperience      String?
  communityService    String?
  awards              String?
  researchExperience  String?

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

- [ ] **Step 3: Add Scholarship model**

```prisma
model Scholarship {
  id                  String   @id @default(cuid())

  title               String
  provider            String
  description         String
  amount              String?
  amountMin           Int?
  amountMax           Int?
  deadline            DateTime?
  url                 String?
  applicationUrl      String?

  scholarshipType     String   // merit, need, demographic, essay, field_specific,
                               // athletic, community, employer, research, service
  renewable           Boolean  @default(false)
  renewalConditions   String?

  // Requirements
  minGPA              Float?
  maxGPA              Float?
  educationLevels     String?  // JSON array
  fieldsOfStudy       String?  // JSON array
  citizenshipRequired String?
  stateRestriction    String?
  eligibilityText     String?

  // Essay
  essayRequired       Boolean  @default(false)
  essayPrompt         String?
  essayWordLimit      Int?

  // Submission
  submissionMethod    String   @default("portal")
  portalUrl           String?
  portalInstructions  String?

  // Matching
  tags                String?  // JSON array
  matchScore          Int?

  // Source
  sourceId            String?
  sourceUrl           String?
  lastScraped         DateTime?
  status              String   @default("active")

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  applications        StudentApplication[]

  @@index([deadline])
  @@index([scholarshipType])
  @@index([status])
  @@index([stateRestriction])
}
```

- [ ] **Step 4: Add StudentApplication model**

```prisma
model StudentApplication {
  id                  String   @id @default(cuid())
  userId              String
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  scholarshipId       String
  scholarship         Scholarship @relation(fields: [scholarshipId], references: [id], onDelete: Cascade)

  status              String   @default("draft")

  essayDraft          String?
  essayFinal          String?
  responses           String?

  submissionMethod    String?
  confirmationNumber  String?
  submittedAt         DateTime?
  portalInstructions  String?

  awardedAt           DateTime?
  rejectedAt          DateTime?
  awardAmount         Int?
  outcomeReportedAt   DateTime?
  outcomeNotes        String?

  successFeePercent   Int      @default(8)
  successFeeAmount    Int?
  successFeeStatus    String   @default("not_applicable")
  successFeePaidAt    DateTime?
  stripePaymentId     String?
  installmentPlan     String?

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([userId])
  @@index([scholarshipId])
  @@index([status])
  @@index([successFeeStatus])
  @@index([userId, status])
}
```

- [ ] **Step 5: Push schema to database**

Run: `cd ~/grant-finder-pro && npx prisma db push`
Expected: Schema synced, no errors.

- [ ] **Step 6: Regenerate Prisma client**

Run: `cd ~/grant-finder-pro && npx prisma generate`
Expected: Client generated to `src/generated/prisma`.

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add StudentProfile, Scholarship, StudentApplication models"
```

---

## Task 2: Middleware — Route Students to /student/*

**Files:**
- Modify: `middleware.ts`

- [ ] **Step 1: Read current middleware**

Read `middleware.ts` to understand the existing routing logic.

- [ ] **Step 2: Add /student/* to protected routes**

In the middleware config matcher, add `/student/:path*` to the protected patterns. The middleware should protect `/student/*` the same way it protects `/dashboard/*` — redirect unauthenticated users to `/login`.

In the `PUBLIC_ROUTES` array or equivalent, do NOT add `/student` — it must require auth.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: protect /student/* routes in middleware"
```

---

## Task 3: Signup — Add User Type Selector

**Files:**
- Modify: `src/app/(auth)/signup/page.tsx`
- Modify: `src/app/api/auth/register/route.ts`

- [ ] **Step 1: Read the existing signup page and register API**

Read both files to understand the current form structure and registration logic.

- [ ] **Step 2: Add userType to registration API**

In `src/app/api/auth/register/route.ts`, accept `userType` from the request body and pass it to `prisma.user.create()`:

```typescript
const user = await prisma.user.create({
  data: {
    name,
    email,
    password: hashedPassword,
    userType: body.userType || "organization",
    // ... existing fields
  },
});
```

- [ ] **Step 3: Add type selector to signup page**

In the signup page component, add a type selector BEFORE the existing form. Use two card-style buttons:

```tsx
const [userType, setUserType] = useState<"organization" | "student">("organization");

// In JSX, before the form:
<div className="flex gap-4 mb-6">
  <button
    type="button"
    onClick={() => setUserType("organization")}
    className={`flex-1 p-4 rounded-xl border text-left transition-all ${
      userType === "organization"
        ? "border-emerald-500/50 bg-emerald-500/10"
        : "border-slate-700 hover:border-slate-600"
    }`}
  >
    <Building2 className="h-6 w-6 text-emerald-400 mb-2" />
    <p className="text-white font-semibold">Organization</p>
    <p className="text-slate-400 text-xs">Nonprofits, startups, research</p>
  </button>
  <button
    type="button"
    onClick={() => setUserType("student")}
    className={`flex-1 p-4 rounded-xl border text-left transition-all ${
      userType === "student"
        ? "border-emerald-500/50 bg-emerald-500/10"
        : "border-slate-700 hover:border-slate-600"
    }`}
  >
    <GraduationCap className="h-6 w-6 text-emerald-400 mb-2" />
    <p className="text-white font-semibold">Student</p>
    <p className="text-slate-400 text-xs">Undergrad, graduate, medical, law</p>
  </button>
</div>
```

Import `Building2` and `GraduationCap` from `lucide-react`.

- [ ] **Step 4: Pass userType in registration call and update redirect**

In the form submit handler, include `userType` in the POST body to `/api/auth/register`. After successful registration and sign-in, redirect based on type:

```typescript
const redirectUrl = userType === "student" ? "/student/onboarding" : "/dashboard/organization";
router.push(redirectUrl);
```

- [ ] **Step 5: Build and verify**

Run: `npx next build --webpack 2>&1 | tail -5`
Expected: Build passes.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(auth\)/signup/page.tsx src/app/api/auth/register/route.ts
git commit -m "feat: add user type selector to signup (organization vs student)"
```

---

## Task 4: Student Dashboard Layout

**Files:**
- Create: `src/app/student/layout.tsx`

- [ ] **Step 1: Read the existing dashboard layout for reference**

Read `src/app/dashboard/layout.tsx` to understand the sidebar pattern, nav group structure, and mobile toggle.

- [ ] **Step 2: Create student layout**

Create `src/app/student/layout.tsx` as a client component mirroring the dashboard layout but with student-specific navigation:

```typescript
const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/student", icon: Home, label: "Dashboard" },
      { href: "/student/scholarships", icon: Search, label: "Scholarships" },
      { href: "/student/apply", icon: Send, label: "Apply" },
    ],
  },
  {
    label: "My Applications",
    items: [
      { href: "/student/applications", icon: FileText, label: "Applications" },
      { href: "/student/library", icon: BookOpen, label: "Content Library" },
      { href: "/student/documents", icon: Upload, label: "Documents" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/student/profile", icon: User, label: "Profile" },
      { href: "/student/settings", icon: Settings, label: "Settings" },
    ],
  },
];
```

Reuse the same layout structure (sidebar + main content area), same mobile toggle pattern, same ToastProvider/ErrorBoundary wrapping.

- [ ] **Step 3: Commit**

```bash
git add src/app/student/layout.tsx
git commit -m "feat: add student dashboard layout with sidebar navigation"
```

---

## Task 5: Student Profile API

**Files:**
- Create: `src/app/api/student/profile/route.ts`

- [ ] **Step 1: Create profile CRUD API**

Follow the existing `/api/organizations/route.ts` pattern. Implement GET, POST, and PATCH:

**GET:** Fetch the authenticated user's StudentProfile. Return 404 if none exists.

**POST:** Create a new StudentProfile linked to the authenticated user. Accept all fields from the schema. Mark `profileComplete` based on whether required fields (firstName, lastName, schoolName, educationLevel, stateOfResidence) are filled.

**PATCH:** Update existing profile. Recalculate `profileComplete` on each update.

All handlers start with:
```typescript
const session = await auth();
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

- [ ] **Step 2: Create onboarding completion endpoint**

Create `src/app/api/student/onboarding/route.ts` with a POST handler that sets `hasCompletedOnboarding: true` on the User model. Same pattern as existing `/api/user/onboarding/route.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/student/profile/route.ts src/app/api/student/onboarding/route.ts
git commit -m "feat: add student profile CRUD and onboarding API"
```

---

## Task 6: Student Onboarding Wizard

**Files:**
- Create: `src/app/student/onboarding/page.tsx`

- [ ] **Step 1: Read existing onboarding for pattern reference**

Read `src/app/dashboard/onboarding/page.tsx` to match the step management, progress dots, and API call pattern.

- [ ] **Step 2: Build 4-step student onboarding wizard**

Create `src/app/student/onboarding/page.tsx` as a `"use client"` component with 4 steps:

**Step 1 — Who You Are:**
- firstName (Input, required)
- lastName (Input, required)
- schoolName (Input, required)
- educationLevel (Select dropdown with options: hs_senior, undergrad_fr, undergrad_so, undergrad_jr, undergrad_sr, post_bacc, masters, phd, medical, dental, law)
- expectedGraduation (Select: 2025-2032)
- stateOfResidence (Select: US states)

**Step 2 — Academics:**
- major (Input)
- fieldOfStudy (Select: STEM, humanities, business, health_sciences, arts, education, social_sciences, law, other)
- gpa (Input type="number", step="0.01", min="0", max="5")
- careerGoal (Input, placeholder: "e.g., Become a pediatric surgeon")
- intendedDegree (Select: MD, JD, PhD, MBA, MS, MA, MEd, MPH, other — shown only if educationLevel is masters/phd/medical/dental/law)

**Step 3 — Eligibility Boosters:**
- citizenship (Select: us_citizen, permanent_resident, daca, international)
- financialNeed (Select: high, medium, low, not_disclosed)
- firstGeneration (checkbox)
- minority (checkbox)
- veteran (checkbox)
- Test scores section: show relevant score input based on educationLevel (SAT/ACT for undergrad, GRE for grad, MCAT for medical, LSAT for law)

**Step 4 — Your Story:**
- Textarea for personal statement (placeholder: "Paste your personal statement or write a brief version here...")
- "Or upload your resume" link (connects to document upload)
- Activities list: simple repeatable fields (name + role + description), "Add another" button
- "I'll add more later" skip option

**On completion:** POST to `/api/student/profile` with all data, then POST to `/api/student/onboarding`, then `router.push("/student")`.

Use the same visual style: glassmorphic cards, progress dots, emerald accent buttons, slate-800 backgrounds.

- [ ] **Step 3: Commit**

```bash
git add src/app/student/onboarding/page.tsx
git commit -m "feat: add 4-step student onboarding wizard"
```

---

## Task 7: Scholarship Sources

**Files:**
- Create: `src/lib/scholarship-sources/types.ts`
- Create: `src/lib/scholarship-sources/registry.ts`
- Create: `src/lib/scholarship-sources/curated-database.ts`
- Create: `src/lib/scholarship-sources/federal-student-aid.ts`
- Create: `src/lib/scholarship-sources/corporate-scholarships.ts`
- Create: `src/lib/scholarship-sources/index.ts`
- Test: `src/lib/__tests__/scholarship-registry.test.ts`

- [ ] **Step 1: Write the registry test**

Create `src/lib/__tests__/scholarship-registry.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { ScholarshipSourceRegistry } from "../scholarship-sources/registry";
import type { ScholarshipSource, ScrapedScholarship } from "../scholarship-sources/types";

function createMockSource(id: string, scholarships: ScrapedScholarship[]): ScholarshipSource {
  return {
    id,
    name: `Mock ${id}`,
    type: "curated",
    isEnabled: () => true,
    scrape: vi.fn().mockResolvedValue(scholarships),
  };
}

describe("ScholarshipSourceRegistry", () => {
  it("registers and retrieves sources", () => {
    const registry = new ScholarshipSourceRegistry();
    const source = createMockSource("test", []);
    registry.register(source);
    expect(registry.getEnabled()).toHaveLength(1);
    expect(registry.getEnabled()[0].id).toBe("test");
  });

  it("scrapes all enabled sources", async () => {
    const registry = new ScholarshipSourceRegistry();
    const mockScholarship: ScrapedScholarship = {
      title: "Test Scholarship",
      provider: "Test Foundation",
      description: "A test scholarship",
      amount: "$5,000",
      scholarshipType: "merit",
      submissionMethod: "portal",
    };
    registry.register(createMockSource("s1", [mockScholarship]));
    registry.register(createMockSource("s2", [mockScholarship]));
    const results = await registry.scrapeAll();
    expect(results).toHaveLength(2);
  });

  it("handles source errors without crashing", async () => {
    const registry = new ScholarshipSourceRegistry();
    const failingSource: ScholarshipSource = {
      id: "fail",
      name: "Failing Source",
      type: "curated",
      isEnabled: () => true,
      scrape: vi.fn().mockRejectedValue(new Error("Network error")),
    };
    registry.register(failingSource);
    const results = await registry.scrapeAll();
    expect(results).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/scholarship-registry.test.ts`
Expected: FAIL — modules don't exist yet.

- [ ] **Step 3: Create types**

Create `src/lib/scholarship-sources/types.ts`:

```typescript
export interface ScrapedScholarship {
  title: string;
  provider: string;
  description: string;
  amount?: string;
  amountMin?: number;
  amountMax?: number;
  deadline?: Date;
  url?: string;
  applicationUrl?: string;
  scholarshipType: string;
  renewable?: boolean;
  minGPA?: number;
  educationLevels?: string[];
  fieldsOfStudy?: string[];
  citizenshipRequired?: string;
  stateRestriction?: string;
  eligibilityText?: string;
  essayRequired?: boolean;
  essayPrompt?: string;
  essayWordLimit?: number;
  submissionMethod: string;
  portalUrl?: string;
  tags?: string[];
  sourceId?: string;
  sourceUrl?: string;
}

export interface ScholarshipSource {
  id: string;
  name: string;
  type: "federal" | "state" | "corporate" | "foundation" | "curated";
  isEnabled(): boolean;
  scrape(filters?: ScholarshipFilters): Promise<ScrapedScholarship[]>;
}

export interface ScholarshipFilters {
  educationLevel?: string;
  fieldOfStudy?: string;
  state?: string;
  minAmount?: number;
  keyword?: string;
}
```

- [ ] **Step 4: Create registry**

Create `src/lib/scholarship-sources/registry.ts`:

```typescript
import type { ScholarshipSource, ScrapedScholarship } from "./types";

export class ScholarshipSourceRegistry {
  private sources: ScholarshipSource[] = [];

  register(source: ScholarshipSource): void {
    this.sources.push(source);
  }

  getEnabled(): ScholarshipSource[] {
    return this.sources.filter((s) => s.isEnabled());
  }

  async scrapeAll(): Promise<ScrapedScholarship[]> {
    const enabled = this.getEnabled();
    const results: ScrapedScholarship[] = [];

    for (const source of enabled) {
      try {
        const scholarships = await source.scrape();
        results.push(...scholarships);
      } catch (error) {
        console.error(`Scholarship source ${source.id} failed:`, error);
      }
    }

    return results;
  }
}

export const scholarshipSourceRegistry = new ScholarshipSourceRegistry();
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/scholarship-registry.test.ts`
Expected: 3/3 PASS.

- [ ] **Step 6: Create curated database source**

Create `src/lib/scholarship-sources/curated-database.ts` with a hardcoded seed of 50+ scholarships across categories: merit, need-based, STEM, health sciences, minority, first-gen, essay contests, community service, athletic, employer-sponsored. Include well-known ones (Gates Millennium, Jack Kent Cooke, Coca-Cola Scholars, Google Lime, QuestBridge, Dell Scholars, Elks National Foundation, Rotary Peace Fellowship, UNCF, Hispanic Scholarship Fund, APIA Scholars) and niche ones (Tall Clubs International, Duck Brand Duct Tape, Vegetarian Resource Group, Zombie Apocalypse Scholarship). Each entry should have realistic amounts, deadlines (rolling through the year), GPA requirements where applicable, education levels, essay prompts for essay-based ones, and submission methods.

- [ ] **Step 7: Create federal student aid source**

Create `src/lib/scholarship-sources/federal-student-aid.ts` with federal programs: Pell Grant ($7,395 max), FSEOG ($100-$4,000), TEACH Grant ($4,000/yr), Iraq/Afghanistan Service Grant. These are hardcoded since federal program details change annually — note the last-updated date in the source.

- [ ] **Step 8: Create corporate scholarships source**

Create `src/lib/scholarship-sources/corporate-scholarships.ts` with major corporate scholarship programs: Google Lime Scholarship ($10,000), Microsoft Disability Scholarship ($5,000), Amazon Future Engineer ($40,000), Starbucks College Achievement Plan, FedEx Scholarship, Coca-Cola Scholars ($20,000), Burger King Scholars ($1,000-$50,000), Taco Bell Live Más ($5,000-$25,000).

- [ ] **Step 9: Create index and register all sources**

Create `src/lib/scholarship-sources/index.ts`:

```typescript
import { scholarshipSourceRegistry } from "./registry";
import { CuratedDatabaseSource } from "./curated-database";
import { FederalStudentAidSource } from "./federal-student-aid";
import { CorporateScholarshipsSource } from "./corporate-scholarships";

scholarshipSourceRegistry.register(new CuratedDatabaseSource());
scholarshipSourceRegistry.register(new FederalStudentAidSource());
scholarshipSourceRegistry.register(new CorporateScholarshipsSource());

export { scholarshipSourceRegistry };
```

- [ ] **Step 10: Commit**

```bash
git add src/lib/scholarship-sources/ src/lib/__tests__/scholarship-registry.test.ts
git commit -m "feat: add scholarship source registry with 3 initial sources"
```

---

## Task 8: Scholarship Matching Algorithm

**Files:**
- Create: `src/lib/scholarship-matcher.ts`
- Test: `src/lib/__tests__/scholarship-matcher.test.ts`

- [ ] **Step 1: Write matching tests**

Create `src/lib/__tests__/scholarship-matcher.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { calculateScholarshipMatch } from "../scholarship-matcher";

const baseStudent = {
  educationLevel: "undergrad_jr",
  fieldOfStudy: "STEM",
  major: "Computer Science",
  gpa: 3.7,
  gpaScale: 4.0,
  stateOfResidence: "CA",
  citizenship: "us_citizen",
  financialNeed: "medium",
  firstGeneration: true,
  minority: false,
  veteran: false,
  careerGoal: "software engineer at a health tech company",
  extracurriculars: JSON.stringify([{ name: "Robotics Club", role: "President" }]),
};

const baseScholarship = {
  id: "test-1",
  title: "STEM Excellence Award",
  provider: "Tech Foundation",
  description: "For outstanding STEM students pursuing technology careers",
  scholarshipType: "merit",
  minGPA: 3.5,
  educationLevels: JSON.stringify(["undergrad_jr", "undergrad_sr"]),
  fieldsOfStudy: JSON.stringify(["STEM"]),
  citizenshipRequired: "us_citizen",
  stateRestriction: null,
  tags: JSON.stringify(["technology", "engineering", "computer science"]),
};

describe("calculateScholarshipMatch", () => {
  it("returns high score for perfect match", () => {
    const result = calculateScholarshipMatch(baseStudent, baseScholarship);
    expect(result.score).toBeGreaterThan(85);
  });

  it("returns low score when GPA below minimum", () => {
    const lowGPA = { ...baseStudent, gpa: 2.5 };
    const result = calculateScholarshipMatch(lowGPA, baseScholarship);
    expect(result.score).toBeLessThan(30);
  });

  it("returns 0 when education level doesn't match", () => {
    const wrongLevel = { ...baseStudent, educationLevel: "phd" };
    const result = calculateScholarshipMatch(wrongLevel, baseScholarship);
    expect(result.score).toBe(0);
  });

  it("returns 0 when citizenship doesn't match", () => {
    const international = { ...baseStudent, citizenship: "international" };
    const scholarship = { ...baseScholarship, citizenshipRequired: "us_citizen" };
    const result = calculateScholarshipMatch(international, scholarship);
    expect(result.score).toBe(0);
  });

  it("boosts score for first-generation match", () => {
    const firstGenScholarship = {
      ...baseScholarship,
      tags: JSON.stringify(["first-generation", "technology"]),
    };
    const firstGen = { ...baseStudent, firstGeneration: true };
    const notFirstGen = { ...baseStudent, firstGeneration: false };
    const scoreWith = calculateScholarshipMatch(firstGen, firstGenScholarship);
    const scoreWithout = calculateScholarshipMatch(notFirstGen, firstGenScholarship);
    expect(scoreWith.score).toBeGreaterThan(scoreWithout.score);
  });

  it("includes breakdown in result", () => {
    const result = calculateScholarshipMatch(baseStudent, baseScholarship);
    expect(result.breakdown).toHaveProperty("educationLevel");
    expect(result.breakdown).toHaveProperty("fieldOfStudy");
    expect(result.breakdown).toHaveProperty("gpa");
    expect(result.breakdown).toHaveProperty("location");
    expect(result.breakdown).toHaveProperty("demographics");
    expect(result.breakdown).toHaveProperty("keywords");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/__tests__/scholarship-matcher.test.ts`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement the matcher**

Create `src/lib/scholarship-matcher.ts`:

```typescript
interface StudentData {
  educationLevel: string;
  fieldOfStudy?: string | null;
  major?: string | null;
  gpa?: number | null;
  gpaScale?: number;
  stateOfResidence: string;
  citizenship: string;
  financialNeed?: string | null;
  firstGeneration?: boolean | null;
  minority?: boolean | null;
  veteran?: boolean | null;
  careerGoal?: string | null;
  extracurriculars?: string | null;
}

interface ScholarshipData {
  id: string;
  title: string;
  provider: string;
  description: string;
  scholarshipType: string;
  minGPA?: number | null;
  educationLevels?: string | null;
  fieldsOfStudy?: string | null;
  citizenshipRequired?: string | null;
  stateRestriction?: string | null;
  tags?: string | null;
}

interface MatchResult {
  scholarshipId: string;
  score: number;
  breakdown: Record<string, number>;
  reasons: string[];
}

export function calculateScholarshipMatch(
  student: StudentData,
  scholarship: ScholarshipData
): MatchResult {
  const breakdown: Record<string, number> = {};
  const reasons: string[] = [];

  // Hard disqualifiers — return 0 immediately
  const eduLevels = parseJSON<string[]>(scholarship.educationLevels);
  if (eduLevels && eduLevels.length > 0 && !eduLevels.includes(student.educationLevel)) {
    return { scholarshipId: scholarship.id, score: 0, breakdown: {}, reasons: ["Education level mismatch"] };
  }

  if (
    scholarship.citizenshipRequired &&
    scholarship.citizenshipRequired !== "any" &&
    student.citizenship !== scholarship.citizenshipRequired &&
    !(scholarship.citizenshipRequired === "us_citizen_or_pr" &&
      (student.citizenship === "us_citizen" || student.citizenship === "permanent_resident"))
  ) {
    return { scholarshipId: scholarship.id, score: 0, breakdown: {}, reasons: ["Citizenship requirement not met"] };
  }

  // Education level (20%)
  if (!eduLevels || eduLevels.length === 0 || eduLevels.includes(student.educationLevel)) {
    breakdown.educationLevel = 100;
    reasons.push("Education level matches");
  }

  // Field of study (20%)
  const fields = parseJSON<string[]>(scholarship.fieldsOfStudy);
  if (!fields || fields.length === 0) {
    breakdown.fieldOfStudy = 80;
  } else if (student.fieldOfStudy && fields.includes(student.fieldOfStudy)) {
    breakdown.fieldOfStudy = 100;
    reasons.push(`Field of study matches: ${student.fieldOfStudy}`);
  } else {
    breakdown.fieldOfStudy = 20;
  }

  // GPA (15%)
  if (!scholarship.minGPA) {
    breakdown.gpa = 80;
  } else if (student.gpa && student.gpa >= scholarship.minGPA) {
    breakdown.gpa = 100;
    reasons.push(`GPA ${student.gpa} meets minimum ${scholarship.minGPA}`);
  } else if (student.gpa) {
    breakdown.gpa = 0;
    reasons.push(`GPA ${student.gpa} below minimum ${scholarship.minGPA}`);
  } else {
    breakdown.gpa = 50;
  }

  // Location (15%)
  if (!scholarship.stateRestriction) {
    breakdown.location = 85;
  } else if (scholarship.stateRestriction === student.stateOfResidence) {
    breakdown.location = 100;
    reasons.push("State matches");
  } else {
    breakdown.location = 0;
    reasons.push("State restriction doesn't match");
  }

  // Demographics (10%)
  const tags = parseJSON<string[]>(scholarship.tags) || [];
  const tagStr = tags.join(" ").toLowerCase();
  let demoScore = 60;
  if (student.firstGeneration && tagStr.includes("first-generation")) {
    demoScore = 100;
    reasons.push("First-generation match");
  }
  if (student.minority && (tagStr.includes("minority") || tagStr.includes("underrepresented"))) {
    demoScore = 100;
    reasons.push("Demographic match");
  }
  if (student.veteran && tagStr.includes("veteran")) {
    demoScore = 100;
    reasons.push("Veteran match");
  }
  breakdown.demographics = demoScore;

  // Keyword similarity (20%)
  const studentText = [
    student.major,
    student.careerGoal,
    student.fieldOfStudy,
    ...(parseJSON<Array<{ name: string }>>(student.extracurriculars) || []).map((a) => a.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const scholarshipText = [scholarship.title, scholarship.description, ...tags]
    .join(" ")
    .toLowerCase();

  const studentWords = new Set(studentText.split(/\W+/).filter((w) => w.length > 3));
  const scholarshipWords = new Set(scholarshipText.split(/\W+/).filter((w) => w.length > 3));
  const intersection = [...studentWords].filter((w) => scholarshipWords.has(w));
  const union = new Set([...studentWords, ...scholarshipWords]);
  const similarity = union.size > 0 ? intersection.length / union.size : 0;
  breakdown.keywords = Math.min(100, 40 + similarity * 200);

  if (intersection.length > 0) {
    reasons.push(`Keyword matches: ${intersection.slice(0, 3).join(", ")}`);
  }

  // Calculate weighted score
  const weights = {
    educationLevel: 0.2,
    fieldOfStudy: 0.2,
    gpa: 0.15,
    location: 0.15,
    demographics: 0.1,
    keywords: 0.2,
  };

  const score = Math.round(
    Object.entries(weights).reduce((sum, [key, weight]) => {
      return sum + (breakdown[key] || 0) * weight;
    }, 0)
  );

  return { scholarshipId: scholarship.id, score, breakdown, reasons };
}

export function matchScholarshipsToStudent(
  student: StudentData,
  scholarships: ScholarshipData[],
  limit = 50
): MatchResult[] {
  return scholarships
    .map((s) => calculateScholarshipMatch(student, s))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function parseJSON<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/lib/__tests__/scholarship-matcher.test.ts`
Expected: 6/6 PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/scholarship-matcher.ts src/lib/__tests__/scholarship-matcher.test.ts
git commit -m "feat: add scholarship matching algorithm with weighted scoring"
```

---

## Task 9: Scholarship API Routes

**Files:**
- Create: `src/app/api/student/scholarships/route.ts`
- Create: `src/app/api/student/scholarships/discover/route.ts`

- [ ] **Step 1: Create scholarship search API**

Create `src/app/api/student/scholarships/route.ts` with GET handler:
- Authenticate user, fetch their StudentProfile
- Fetch all active scholarships from the database
- Run `matchScholarshipsToStudent()` against the student's profile
- Return sorted results with match scores

- [ ] **Step 2: Create scholarship discovery API**

Create `src/app/api/student/scholarships/discover/route.ts` with POST handler:
- Authenticate user
- Import and call `scholarshipSourceRegistry.scrapeAll()`
- Upsert results into the Scholarship table (dedup by title + provider)
- Return count of new vs updated scholarships

- [ ] **Step 3: Commit**

```bash
git add src/app/api/student/scholarships/
git commit -m "feat: add scholarship search and discovery API routes"
```

---

## Task 10: Student Dashboard Home

**Files:**
- Create: `src/app/student/page.tsx`

- [ ] **Step 1: Build the student dashboard page**

Create `src/app/student/page.tsx` as a `"use client"` component showing:

1. **Welcome header** with student name
2. **Stats row** — 4 StatsCards: Applied, Pending, Won, Total Awarded ($)
3. **Top Matches** — 3-5 scholarship cards showing: title, amount, match %, deadline, and "Apply" button. Data from GET `/api/student/scholarships`
4. **Profile Strength** — Progress bar showing profile completion percentage with nudge text ("Add your GPA to unlock 15 more matches")
5. **Recent Activity** — Simple list of last 5 actions (placeholder for now)

Follow the existing dashboard page pattern for data fetching (useEffect + fetch + loading state).

- [ ] **Step 2: Add onboarding redirect**

If the user hasn't completed onboarding (`!hasCompletedOnboarding`), redirect to `/student/onboarding` using `router.push()`.

- [ ] **Step 3: Build and verify**

Run: `npx next build --webpack 2>&1 | tail -10`
Expected: Build passes with new routes visible.

- [ ] **Step 4: Commit**

```bash
git add src/app/student/page.tsx
git commit -m "feat: add student dashboard home with matches and stats"
```

---

## Task 11: Student Content Library Categories

**Files:**
- Modify: `src/lib/content-library/types.ts`

- [ ] **Step 1: Read current ContentCategory type**

Read `src/lib/content-library/types.ts` to see the existing category union type.

- [ ] **Step 2: Add student categories**

Add new student-specific categories to the `ContentCategory` type:

```typescript
// Add to existing union:
| "personal_statement"
| "activities"
| "work_experience"
| "community_service"
| "awards_honors"
| "career_goals"
| "challenges_overcome"
| "leadership"
| "research_experience"
| "why_this_field"
| "financial_need_statement"
| "diversity_statement"
```

Also update `SOURCE_CONFIDENCE` if it doesn't already include the new categories (they use the same confidence levels — manual: 100, profile: 95, document: 80, website: 70).

- [ ] **Step 3: Commit**

```bash
git add src/lib/content-library/types.ts
git commit -m "feat: add student content categories to Content Library"
```

---

## Task 12: Integration Test — Full Flow

**Files:**
- Run existing test suite + manual verification

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: All existing tests pass + new scholarship tests pass.

- [ ] **Step 2: Build production**

Run: `npx next build --webpack 2>&1 | tail -15`
Expected: Build passes. New routes visible: `/student`, `/student/onboarding`.

- [ ] **Step 3: Push schema to database**

Run: `npx prisma db push`
Expected: Schema synced with StudentProfile, Scholarship, StudentApplication tables created.

- [ ] **Step 4: Commit all remaining changes and push**

```bash
git add -A
git commit -m "feat: student grants Phase 1 complete — schema, onboarding, matching, dashboard"
git push origin main
```

- [ ] **Step 5: Deploy**

Run: `npx vercel --prod --yes`
Expected: Deployed and live.
