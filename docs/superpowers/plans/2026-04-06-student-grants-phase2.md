# Student Grants Phase 2: Auto-Apply Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the essay adaptation engine, batch apply queue, submission handling, and application tracking so students can review and submit multiple scholarship applications in one session.

**Architecture:** Extends Phase 1 foundation. New Smart Fill essay mode, batch draft API, queue UI at `/student/apply`, application CRUD, and submission flow with confirmation emails.

**Tech Stack:** Next.js 16, Prisma, TypeScript, Tailwind CSS, Anthropic SDK (Claude), Resend

---

## Task 1: Student Application CRUD API

Create `/src/app/api/student/applications/route.ts` with GET, POST, DELETE.

**GET:** Fetch all StudentApplications for authenticated user. Include scholarship data. Support `?status=draft` filter.

**POST:** Create new StudentApplication. Accept `scholarshipId`. Set status "draft", successFeePercent based on user plan (free=8, growth=3, pro=0, organization=0).

**DELETE:** Delete by `?id=` query param. Verify ownership.

Create `/src/app/api/student/applications/[id]/route.ts` with GET, PATCH, DELETE for individual application.

---

## Task 2: Essay Adapter — Student Voice Mode

Create `src/lib/smart-fill/essay-adapter.ts`.

Core function: `generateScholarshipEssay(params)` that:
1. Takes: scholarship (with essayPrompt, essayWordLimit), student profile, content library blocks
2. Selects relevant content blocks based on essay prompt analysis
3. Calls Claude to generate a first-person narrative essay
4. Returns the draft with word count

The Claude prompt should instruct:
- First person voice, personal narrative
- Hook → story → lesson → connection to scholarship's mission
- Reference specific details from student's profile (activities, career goal, challenges)
- Match the word limit (default 500 if not specified)
- Authentic, specific, vulnerable where appropriate
- NOT corporate/institutional tone

---

## Task 3: Batch Draft API

Create `src/app/api/student/applications/batch/route.ts` with POST.

Accepts: `{ scholarshipIds: string[] }`

For each scholarship:
1. Create a StudentApplication if one doesn't exist (status: "draft")
2. Fetch the scholarship's essay prompt
3. Fetch student's content library blocks
4. Call `generateScholarshipEssay()` to draft the essay
5. Save essayDraft on the application

Returns: `{ drafted: count, applications: [{id, scholarshipId, essayDraft, status}] }`

Process sequentially (not parallel) to manage API rate limits.

---

## Task 4: Batch Apply Queue UI

Create `src/app/student/apply/page.tsx` — the core auto-apply experience.

Flow:
1. Page loads, fetches applications with status "draft" that have essay drafts
2. Shows one application at a time (not a list)
3. For each application shows:
   - Scholarship name, amount, deadline, submission method tag
   - Essay prompt
   - AI-drafted essay in an editable textarea
   - Word count
   - 4 action buttons: Edit (toggle textarea edit), Approve, Skip, Redraft
4. Progress bar: "1 of 8"
5. After reviewing all, show "Submit All Approved" button
6. Approved applications get status "ready"

If no drafts exist, show empty state with "Find Scholarships" link.

---

## Task 5: Application Submit Flow

Create `src/app/api/student/applications/[id]/submit/route.ts` with POST.

1. Verify application belongs to user and has status "ready" or "draft" with essayFinal
2. Copy essayDraft to essayFinal if not already set
3. Based on scholarship's submissionMethod:
   - "email": Generate formatted email body (placeholder — actual sending is Phase 4)
   - "portal": Generate paste-ready instructions with the essay + any form fields
   - "form": Same as portal for now
4. Set status to "submitted", generate confirmationNumber, set submittedAt
5. Send confirmation email via Resend (reuse existing sendApplicationConfirmationEmail pattern)
6. Return updated application with confirmationNumber

---

## Task 6: Student Applications List Page

Create `src/app/student/applications/page.tsx`.

Shows:
- Stats row: Total, In Progress, Submitted, Awarded
- Filterable list by status (all/active/submitted/completed)
- Each card shows: scholarship title, amount, status badge, deadline, submission method
- Action buttons based on status: "Review Draft" / "View" / "Report Outcome"
- Link to application detail page

Follow the pattern from `src/app/dashboard/applications/page.tsx`.

---

## Task 7: Student Application Detail Page

Create `src/app/student/applications/[id]/page.tsx`.

Shows:
- Scholarship info header (title, provider, amount, deadline)
- Status timeline (Created → Drafted → Submitted → Under Review → Decision)
- Essay content (read-only for submitted, editable for drafts)
- Submission details (method, confirmation number, submitted date)
- For portal submissions: paste-ready package with copy buttons
- Outcome reporting (if past deadline): awarded/rejected/no response
- Success fee info (if awarded): amount, payment status

---

## Task 8: Integration + Build + Deploy

Run tests, build, push, deploy.
