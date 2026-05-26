# Dashboard Wave D — Fresh Session Kickoff

**Date:** 2026-05-26
**Predecessor:** dashboard sweep Waves A + B + C — auth, marketing, dashboard home, MomentumHero, ApplyPanel, plus 9 inner surfaces (4 components + library/audit/onboarding/referrals/documents/applications list) shipped to `main`.

---

## What's already v2 marine

**Authenticated chrome:**
- Dashboard layout (sidebar, mobile header, theme toggle) ✅
- Auth split chrome with AuthMotifPanel ✅
- ApplyPanel (Smart Fill slide-over) ✅

**Dashboard home + components:**
- `/dashboard` home (MomentumHero, pipeline lists) ✅
- ExpiringSoon, ProfileProgressBanner, UpgradePrompt, Breadcrumbs ✅

**Inner pages (shipped):**
- `/dashboard/library` ✅
- `/dashboard/audit` ✅
- `/dashboard/onboarding` ✅
- `/dashboard/referrals` ✅
- `/dashboard/documents` ✅
- `/dashboard/applications` (list page) ✅

---

## Wave D — pending pages (this kickoff's scope)

The four largest surfaces, deferred from the previous sweep for focused attention:

| Surface | Lines | Why it matters |
|---|---|---|
| `/dashboard/settings` | 488 | Subscription/billing UI; touched by every Pro user |
| `/dashboard/team` | 571 | Team seat management; touched by Org-plan customers |
| `/dashboard/organization` | 709 | Org profile (mission, vision, problem, solution) — also the source of the voice profile extraction |
| `/dashboard/grants` (list) | 1,355 | The biggest surface in the app; primary "Find Grants" destination |

**Also pending (smaller, in same sweep):**
- `/dashboard/grants/[id]/apply` page (1,103 lines) — the 5-step manual wizard, alternative to ApplyPanel
- `/dashboard/applications/[id]/draft` (~451 lines) — the section-by-section draft editor
- `/dashboard/applications/[id]` page — application detail
- `/dashboard/grants/[id]` page — grant detail
- `src/components/dashboard/ContentBlockCard.tsx` — used by /library
- `src/components/dashboard/DeadlineTimeline.tsx`
- `src/components/dashboard/SuccessModal.tsx`
- `src/components/dashboard/TemplateMatchPicker.tsx`
- `src/components/dashboard/NotificationBell.tsx`
- `src/components/dashboard/Confetti.tsx` — **delete** (parent spec §5 rejects confetti)
- `src/components/illustrations/ReferralIllustration.tsx` — verify the illustrations themselves carry v2-compatible colors

## Pattern (carried from this sweep — proven across 9 surfaces)

Apply this pattern to every Wave D file:

1. **Page wrapper**: `<div className="p-6 lg:p-8 flex flex-col gap-6">`
2. **Page header**: display-size `<h1>` in `--ink`, body-lg `<p>` in `--ink-2` for subtitle
3. **Cards**: `style={{ background: "var(--surface)", border: "1px solid var(--rule)", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card-soft)" }}`
4. **Section header inside card**: `borderBottom: "1px solid var(--rule)"`
5. **Primary CTAs**: `background: "var(--accent)"` + `className="!text-white"`
6. **Secondary CTAs**: outline-style with `border: "1px solid var(--accent)", color: "var(--accent)"`
7. **Ghost CTAs**: `background: "transparent", color: "var(--ink-2)", border: "1px solid var(--rule)"`
8. **Status pills**: solid background from `--success-soft / --warn-soft / --accent-soft`, matching text color
9. **Form inputs**: `style={{ background: "var(--bg)", border: "1px solid var(--rule)", color: "var(--ink)" }}`
10. **Score displays**: use `<ScoreRing>` — never flat percentage text or hand-rolled SVG gauges
11. **Mono numerals**: `className="font-mono tabular-nums"` for any count, percentage, dollar amount
12. **No hardcoded colors**: no `bg-slate-*`, `text-white`, `bg-emerald-*`, `border-rule`, etc. — all via tokens

## Things to delete during the sweep

- `Confetti.tsx` — parent spec §5 explicitly rejects it. Replace usages with ring-fill celebration.
- Any `bg-gradient-to-r` calls — parent spec §6 rejects gradient pop. Use solid `--accent` instead.
- Stat-card grids that say "X live sources / X grants / X scholarships" — consider whether the visible content replaces the count claim (see TrustBar consolidation pattern).
- `src/components/brand/Logo.tsx` — fully unused, legacy emerald compass mark. Safe delete.

## Acceptance per file

- `npm run build` clean
- `npm test` green (currently 129 passing)
- Self-review: every score uses ScoreRing, every text color resolves through a token, no `bg-slate-*` or `text-white` remains
- Visual smoke test in browser at `localhost:3000/dashboard/<surface>` in both light + dark mode (the global `data-theme-mode` attribute hot-switches)

## Order of attack

Pick highest-leverage first per usage:

1. `/dashboard/grants` list — biggest surface, primary CTA, every user hits it
2. `/dashboard/organization` — onboarding flow + voice-profile source
3. `/dashboard/settings` — every Pro user
4. `/dashboard/team` — only org plans, lower priority
5. `/dashboard/grants/[id]/apply` (the manual wizard) — touched only when user goes off the ApplyPanel path
6. `/dashboard/applications/[id]` + `/draft` subpages
7. Remaining dashboard components (ContentBlockCard, DeadlineTimeline, TemplateMatchPicker, SuccessModal, NotificationBell)
8. Delete Confetti.tsx, src/components/brand/Logo.tsx

Total estimated work: 6–8 hours focused, depending on whether grants list gets a structural refactor or just a token-substitution restyle.

## After Wave D

The remaining v2 backlog (per the original 10x strategy doc):

- Interactive landing hero ("will you win?" demo) — 10x move #3, biggest conversion lever
- WinShareCard primitive + win-moment celebration — 10x move #6
- Real customer-wins consent flow + ticker UI — 10x move #2
- Weekly grant-of-the-day email — 10x move #4
- Voice profile UI on `/dashboard/organization` (re-extract button + last-updated stamp)
- Ring-based loading states across app (replaces generic `Loader2` spinners)
- OG / favicon sweep audit per 10x move #1

These are product-strategy work, not visual restyles. Treat them as separate initiatives, each warranting their own spec.
