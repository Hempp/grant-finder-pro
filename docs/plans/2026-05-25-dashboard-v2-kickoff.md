# Dashboard v2 — Fresh Session Kickoff

**Date:** 2026-05-25
**Predecessor:** [10x Sweep Wave 1](../superpowers/specs/2026-05-24-10x-sweep-design.md) — auth + marketing bodies shipped to `main` at HEAD `54e9d5e`.

---

## What's already shipped (do not redo)

- **Auth surface (4 pages)** — split chrome with quiet marine `AuthMotifPanel`, all forms on v2 marine tokens. Files: `src/app/(auth)/layout.tsx`, `src/components/auth/AuthMotifPanel.tsx`, `src/app/(auth)/{login,signup,forgot-password,reset-password}/page.tsx`.
- **Marketing bodies (3 pages)** — `/pricing`, `/resources`, `/trust` restyled to v2 marine, in-page footers dropped (`EditorialFooter` owns), `<CtaBanner>` from landing reused for peak CTA.
- **ScoreRing usage** — already wired into `/pricing` stats section (97 and 100 — "you keep" and "auto-optimized").

Build + 129 tests green on `main`. Lighthouse/visual baselines NOT re-run yet — that's also pending.

## What this session ships

The **dashboard surface** — the parent spec's centerpiece. Per parent app-redesign spec §3–5:

- The dashboard is reframed from "a list of grants" into "a campaign you're winning"
- `<ScoreRing>` wired wherever a score is shown (no flat pills)
- Momentum hero: greeting line + 3 momentum cards (queue value, drafts ready, deadlines this week)
- Top match row with `<ScoreRing size="lg">` + title + amount + "Draft it →"
- Pipeline list with `<ScoreRing size="sm">` per row
- `Confetti.tsx` rejected — replaced with designed ring + dollar amount celebration
- Empty state is an onboarding momentum state, never a blank table

## Scope this session (smaller than the full app)

Touch only:

- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/page.tsx` (home)
- `src/app/dashboard/grants/page.tsx`
- `src/app/dashboard/applications/page.tsx`
- Relevant components in `src/components/dashboard/` (read all, restyle the ones consumed by the above)

Defer to a follow-up sweep (do NOT touch these):

- `src/app/dashboard/settings/**`
- `src/app/dashboard/team/**`
- `src/app/dashboard/audit/**`
- `src/app/dashboard/library/**`
- `src/app/dashboard/documents/**`
- `src/app/dashboard/organization/**`
- `src/app/dashboard/onboarding/**`
- `src/app/dashboard/referrals/**`

These overlap with the student/* surfaces and the settings/billing follow-up.

## How to start

Sub-agents in this harness are read-only — they will read context and produce plans but cannot Write/Edit/Bash. Execute directly in the main session OR in a fresh worktree from the parent session that has write permissions.

If using a worktree:

```bash
cd ~/grant-finder-pro
git worktree add .claude/worktrees/wt-dashboard-v2 -b worktree-dashboard-v2 main
# Then edit in that worktree path
```

If editing directly on `main`, prefer a feature branch:

```bash
cd ~/grant-finder-pro
git checkout -b dashboard-v2
# Edit; commit per logical change; merge --no-ff back to main
```

## Reference reads (in order, before editing)

1. [Wave 1 spec](../superpowers/specs/2026-05-24-10x-sweep-design.md) — taste gates and acceptance criteria
2. [Parent app-redesign spec](../superpowers/specs/2026-05-21-app-redesign-design.md) — especially §3 (ScoreRing), §4 (momentum dashboard ASCII mock), §5 (win moment)
3. [10x strategy](2026-05-23-10x-strategy.md) — north star (move #7 = daily-habit dashboard)
4. `src/app/globals.css` lines 792-887 — v2 tokens at `:root`
5. `src/components/ui/ScoreRing.tsx` — sm/md/lg sizes, color tier interpolation
6. `src/app/page.tsx` — landing v2 for visual reference
7. `src/components/landing/index.ts` — what marketing primitives are exportable for reuse

## Critical constraints (carried from Wave 1)

- **No backend or Prisma changes** — UI/UX only
- **No fake numbers** — every dashboard metric must derive from real user data; if a data hook is missing, design the empty/onboarding state instead
- **No confetti** — designed ring + dollar amount celebration replaces `Confetti.tsx` usage
- **Motion only at value beats** — match found, score climbing, draft optimized, win confirmed
- **`prefers-reduced-motion` honored**
- **WCAG 2.2 AA** — dashboard contrasts must pass
- **Atomic commits** prefixed `ui(dashboard):` or `feat(dashboard):`

## Taste gates (per Wave 1 spec)

Before merging the dashboard branch:

- `npm run build` clean
- `npm test` green
- Inline self-review pass:
  - Every score uses `<ScoreRing>` (correct size)
  - Marine palette + Inter + 12-step type scale — no ad-hoc styling
  - No decoration-for-pop
  - Momentum hero hits emotionally — "you are closer to funding than yesterday" is the thesis
  - Pipeline feels like victories-in-progress, not a CRUD table

## Then — Wave 2 (still pending after dashboard)

Per [10x sweep spec §2](../superpowers/specs/2026-05-24-10x-sweep-design.md):

- Loading states across the app → ring derivative (replaces generic `Loader2` usage)
- `<WinShareCard>` primitive (ring + dollar amount + "Won via GrantPilot")
- OG/favicon/Twitter card sweep audit per [10x strategy move #1](2026-05-23-10x-strategy.md)

These compound once the dashboard ships on consistent surfaces.

## How to know this session is done

On `main`:
1. Dashboard home (`/dashboard`) feels like opening a campaign dashboard, not a CRUD table
2. Every score in dashboard scope is a `<ScoreRing>` of correct size
3. Momentum hero (greeting line + 3 cards) is wired to real data
4. Build + tests green
5. Lighthouse hasn't regressed on `/dashboard` (run `npx unlighthouse-cli /dashboard` or equivalent)
