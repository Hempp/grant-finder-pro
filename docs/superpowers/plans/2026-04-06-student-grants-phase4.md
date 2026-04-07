# Student Grants Phase 4: Scale — Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement.

**Goal:** Expand scholarship coverage to 200+, add scholarship browse/search UI, winner verification scraping, and the student-facing scholarship detail page.

**Architecture:** 12+ new scholarship sources added to existing registry. New browse page at /student/scholarships. Winner scraping utility for fee verification.

---

## Task 1: Niche Scholarship Sources (5 files, 80+ scholarships)

Create 5 new source files in `src/lib/scholarship-sources/`:

### `niche-scholarships.ts` — 20+ unusual/niche scholarships
- Religious: Knights of Columbus ($1.5K), Presbyterian Church USA ($5K), United Methodist ($5K), Jewish Federation ($5K), Islamic Scholarship Fund ($5K)
- Fraternal: Elks MVS ($60K), Rotary ($30K), Kiwanis ($10K), Lions Club ($5K), Masonic Grand Lodge ($10K)
- Hobby: Tall Clubs ($1K), Duck Tape Prom ($10K), Vegetarian Resource ($10K), Zombie Apocalypse ($2K), Patrick Kerr Skateboard ($5K)
- Condition-specific: ADHD Scholarship ($2K), Diabetes Scholars ($5K), Cancer Survivors ($10K), Hearing Loss ($3K)

### `state-scholarships.ts` — 15+ state-specific programs
- California: Cal Grant ($12.5K), CSAC Middle Class ($10K)
- New York: NYS TAP ($5.5K), Excelsior ($7.5K)
- Texas: TEXAS Grant ($10K), Top 10% ($5K)
- Florida: Bright Futures ($9K), First Generation ($4K)
- Illinois: MAP Grant ($5K)
- Pennsylvania: PHEAA ($4.5K)
- Plus 5-6 more states with major programs

### `professional-associations.ts` — 15+ professional org scholarships
- AMA Foundation ($10K), ABA Legal ($15K), IEEE ($10K), ACM ($10K)
- ASCE Civil Engineering ($5K), ASME Mechanical ($5K)
- APA Psychology ($5K), NASW Social Work ($5K)
- AAAS Science ($5K), ACS Chemistry ($5K)
- AICPA Accounting ($10K), AIA Architecture ($5K)
- NSA Math ($25K), SWE Engineering ($15K), SHPE ($5K)

### `minority-scholarships.ts` — 15+ demographic-specific
- UNCF ($25K), Thurgood Marshall ($10K), Jackie Robinson ($30K)
- Hispanic Scholarship Fund ($5K), LULAC ($2K), Chicano Scholars ($5K)
- APIA Scholars ($20K), Japanese American Citizens League ($5K)
- American Indian College Fund ($10K), Gates Millennium (full ride)
- Point Foundation LGBTQ+ ($10K), Pride Foundation ($12K)
- NAACP ($3K), Congressional Black Caucus ($5K), Ron Brown ($40K)

### `essay-contests.ts` — 10+ essay-based competitions
- Ayn Rand Atlas Shrugged ($10K), Anthem ($2K)
- JFK Profile in Courage ($10K)
- Daughters of the American Revolution ($2.5K)
- VFW Voice of Democracy ($30K)
- Optimist International ($2.5K)
- NFIB Young Entrepreneur ($12K)
- Scholastic Art & Writing ($10K)
- Signet Classics ($1K)
- Atlas Shrugged Essay ($10K)
- Laws of Life Essay ($5K)

---

## Task 2: Scholarship Browse/Search Page

Create `src/app/student/scholarships/page.tsx`:

Full-featured browse page with:
- Search bar (by title, provider, or keyword)
- Filter sidebar/row: type (merit/need/demographic/essay/field), amount range, deadline, education level, field of study
- Scholarship cards in a grid showing: title, provider, amount, deadline, type badge, match % (if profile exists), "Apply" button
- Sort by: match score, deadline (soonest), amount (highest)
- Pagination or infinite scroll
- "Discover New" button that calls POST /api/student/scholarships/discover to scrape fresh data

---

## Task 3: Scholarship Detail Page

Create `src/app/student/scholarships/[id]/page.tsx`:

Show full scholarship details:
- Title, provider, amount range, deadline
- Description (full text)
- Eligibility requirements
- Essay prompt (if required)
- Submission method + instructions
- Match score breakdown (if student has profile)
- "Apply" button → creates StudentApplication and redirects to /student/apply
- "Save for Later" option
- Related scholarships (same type/field)

---

## Task 4: Winner Verification Utility

Create `src/lib/student/winner-verification.ts`:

Function to cross-reference winner names against user database:
```typescript
export async function checkWinnerLists(scholarshipId: string, winnerNames: string[]): Promise<{
  matches: Array<{ userId: string; name: string; applicationId: string }>;
}>
```

This checks if any of the winner names match students who applied through GrantPilot. Used for fee verification when students don't self-report outcomes.

Also create `src/lib/student/outcome-checker.ts` with a function that:
1. Queries all submitted applications past deadline without outcomes
2. Groups by scholarship
3. Returns list for manual/automated winner checking

---

## Task 5: Student Profile Page

Create `src/app/student/profile/page.tsx`:

Editable profile page (not the onboarding wizard — the full profile editor):
- All fields from StudentProfile, organized in sections
- Save button per section
- Profile completeness indicator
- "Import from Resume" button (links to document upload)
- Content Library integration — show content blocks derived from profile

---

## Task 6: Integration + Deploy
