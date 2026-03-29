# Smart Fill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Users enter their URL and upload docs once. AI fills every grant application to 100/100 automatically, optimizing each section for the grant's scoring criteria.

**Architecture:** Four layers — Content Library (storage + CRUD), Website Intelligence (URL extraction), Smart Fill Engine (AI generate + optimize pipeline), Apply Panel (slide-over UI). Each layer builds on the previous. Content Library is the single source of truth.

**Tech Stack:** Next.js 16, React 19, Prisma, Anthropic Claude SDK, Tailwind CSS, Lucide icons

**Spec:** `docs/superpowers/specs/2026-03-28-smart-fill-design.md`

---

## Phase 1: Content Library Foundation (Tasks 1-5)

### Task 1: Prisma Migration — ContentBlock Model

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add ContentBlock model and User relation**

Add ContentBlock model to end of schema and `contentBlocks ContentBlock[]` to User model relations.

- [ ] **Step 2: Generate Prisma client**

Run: `npx prisma generate`

- [ ] **Step 3: Commit**

### Task 2: Content Library Types

**Files:**
- Create: `src/lib/content-library/types.ts`

Defines ContentCategory, ContentSource, SOURCE_CONFIDENCE, CATEGORY_LABELS, ContentBlockInput, ContentBlockWithId, ExtractionResult, Conflict, LibraryStats.

### Task 3: Content Manager CRUD

**Files:**
- Create: `src/lib/content-library/content-manager.ts`

Functions: getLibrary, getBlocksByCategory, createBlock, createBlocks, updateBlock, deleteBlock, detectConflicts, saveApprovedSections.

### Task 4: Content Library API Routes

**Files:**
- Create: `src/app/api/content-library/route.ts` (GET list, POST create)
- Create: `src/app/api/content-library/[id]/route.ts` (PUT update, DELETE)

### Task 5: Content Library UI + Nav

**Files:**
- Create: `src/components/dashboard/ContentBlockCard.tsx`
- Create: `src/app/dashboard/library/page.tsx`
- Modify: `src/app/dashboard/layout.tsx` (add Library + BookOpen to nav)

---

## Phase 2: Website Intelligence (Tasks 6-8)

### Task 6: Website Extraction Engine

**Files:**
- Create: `src/lib/content-library/extract-website.ts`

Crawls URL, follows grant-relevant internal links (about, team, impact, etc.), strips HTML, sends to Claude for structured extraction into ContentBlockInput array.

### Task 7: Import URL API Route

**Files:**
- Create: `src/app/api/organizations/import-url/route.ts`

POST endpoint that takes URL (or reads from org profile), calls extractFromWebsite, detects conflicts, creates non-conflicting blocks.

### Task 8: Document-to-ContentBlock Extraction

**Files:**
- Create: `src/lib/content-library/extract-documents.ts`

Wraps existing document-intelligence.ts, outputs ContentBlockInput array instead of raw JSON.

---

## Phase 3: Smart Fill Engine (Tasks 9-13)

### Task 9: Smart Fill Types

**Files:**
- Create: `src/lib/smart-fill/types.ts`

Defines ScoringCriterion, RequiredSection, CriterionScore, SectionDiff, Gap, SectionDraft, SmartFillResult.

### Task 10: Smart Fill Engine — Core Pipeline

**Files:**
- Create: `src/lib/smart-fill/smart-fill-engine.ts`

Main runSmartFill function: loads grant + analysis, maps sections to ContentBlock categories, generates each section with Claude (optimized for scoring criteria), calls optimizer, calls diff generator.

### Task 11: Optimizer — Auto-Loop to 100

**Files:**
- Create: `src/lib/smart-fill/optimizer.ts`

Takes sections scoring below 10, rewrites targeting weak criteria, re-scores, repeats up to 3 rounds. Only keeps improvements that increase the score.

### Task 12: Diff Generator

**Files:**
- Create: `src/lib/smart-fill/diff-generator.ts`

Compares generated text to raw ContentBlock source, produces semantic diffs with scoring-criteria reasoning.

### Task 13: Smart Fill API Route

**Files:**
- Create: `src/app/api/grants/[id]/smart-fill/route.ts`

POST endpoint, Pro+ only, calls runSmartFill, returns SmartFillResult.

---

## Phase 4: Apply Panel UI (Tasks 14-17)

### Task 14: Apply Panel Component

**Files:**
- Create: `src/components/dashboard/ApplyPanel.tsx`

Slide-over drawer: loading animation, section list with expand/collapse, score display, diff viewer, gap input with save-to-library, submit with confetti.

### Task 15: Wire Apply Panel into Pages

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/dashboard/grants/page.tsx`

Add ApplyPanel state, trigger from grant cards, render panel.

### Task 16: Auto-Growth — Save Sections to Library

**Files:**
- Modify: `src/components/dashboard/ApplyPanel.tsx`

After successful submit, save approved 10/10 sections back as ContentBlocks with source "application".

### Task 17: Final Verification

Verify all files exist, TypeScript compiles, Prisma generates, tag completion.
