# GrantPilot 10x Sweep — Wave Execution Spec

**Date:** 2026-05-24
**Type:** Execution sub-spec under [`2026-05-21-app-redesign-design.md`](./2026-05-21-app-redesign-design.md)
**Reference strategy:** [`docs/plans/2026-05-23-10x-strategy.md`](../../plans/2026-05-23-10x-strategy.md)
**Status:** Design approved — proceeding to per-surface plans.

---

## 1. Why this spec exists

The parent app-redesign spec defines the *what* (ScoreRing signature, momentum dashboard, surface scope) and *visual language*. The 10x strategy doc defines *which moves compound hardest*. This spec defines **how this session ships them in parallel, without taste regression**.

The thesis: a parallel surface sweep without craft gates regresses to mean. We dispatch three agents concurrently, but every surface clears taste-check + emil-review + impeccable-audit before merging. Then we layer Score-as-identity enforcement on top of consistent surfaces — not on inconsistent ones.

---

## 2. Two waves, one session

### Wave 1 — Three parallel surface sweeps

Region-disjoint Next.js route groups. Each agent works in an isolated git worktree, branched from `main` HEAD. No shared files between surfaces.

| Worktree | Surface | File scope |
|---|---|---|
| `wt-marketing-bodies` | `/pricing`, `/resources`, `/trust` | `src/app/pricing/page.tsx`, `src/app/resources/**`, `src/app/trust/page.tsx` (chrome already shipped — *body content only*) |
| `wt-dashboard-v2` | Dashboard surface | `src/app/dashboard/**`, `src/components/dashboard/**` |
| `wt-auth-v2` | Auth flows | `src/app/(auth)/**` — shared `(auth)/layout.tsx` carries v2 chrome |

**Acceptance per surface:**
- Consumes v2 design tokens at `:root` (no `[data-theme="editorial"]` references)
- Uses `<ScoreRing>` wherever a score is shown (not the legacy flat green pill)
- Inter font, marine palette, 12-step type scale, `--radius-*`, glass tokens — straight from v2
- Motion gated by `prefers-reduced-motion`
- WCAG 2.2 AA contrast ratios verified
- `pnpm build` clean, `pnpm test` green, `pnpm test:e2e` baselines updated where visual changed

### Wave 2 — Score-as-identity enforcement + craft polish

After Wave 1 merges sequentially to `main`:

| Pass | Job | Files |
|---|---|---|
| Loading states | Replace generic spinners with small filling `<ScoreRing>` derivative — every async surface | `src/components/ui/Loading*`, `src/app/**/loading.tsx` |
| Share card primitive | `<WinShareCard>` component — ring + dollar amount + "Won via GrantPilot" — anonymous variant. *Not* wired to a flow yet; primitive only. | `src/components/marketing/WinShareCard.tsx` |
| OG sweep audit | Verify favicon + OG + Twitter cards all feature the ring (per 10x move #1) | `src/app/icon.tsx`, `opengraph-image.tsx`, `twitter-image.tsx` |

Wave 2 is single-threaded — sequential commits on `main`, no worktrees.

---

## 3. Taste gates (the "with taste" guarantee)

Per-surface, before merge:

```
worktree complete → tsc clean → build clean → tests green
                  ↓
              taste-check skill   (does it actually look good vs. average work?)
                  ↓
              emil-review skill   (interaction-detail + motion craft)
                  ↓
              impeccable-audit    (9-section design contract pass)
                  ↓
              fix regressions inline (do not punt) → merge
```

**Hard blockers** (any of these stop the merge):
- Score shown without `<ScoreRing>` (any size)
- Motion that fires off-beat (per parent spec §2.3 — celebration only at value beats)
- Decoration without function (gradients/aurora/glassmorphism added "for pop")
- Empty-state shows a blank table instead of an onboarding momentum state
- Generic "Loading..." text instead of a filling ring
- Fake numbers anywhere

**Soft notes** (logged in the PR description, not blockers):
- Type scale drift (using ad-hoc font sizes instead of the 12-step scale)
- Color drift (one-off greens/blues instead of `--accent`/`--success` tokens)

---

## 4. Merge sequence

Smallest blast radius first, biggest last:

1. `wt-auth-v2` → `main`  (smallest surface, lowest risk)
2. `wt-marketing-bodies` → `main`  (medium surface, no shared components with dashboard)
3. `wt-dashboard-v2` → `main`  (largest surface, biggest visual change)

Between each merge: `pnpm build && pnpm test` clean. Hard stop if either breaks.

---

## 5. Parallelization constraints

**Region-disjoint guarantee:** the three Wave 1 worktrees touch zero shared files. Verified by route group:
- `src/app/(auth)/*` ↮ `src/app/dashboard/*` ↮ `src/app/pricing|resources|trust/*`

**Shared component risk:** if any agent needs to edit `src/components/ui/*` (the shared design primitives), they MUST stop and surface it. Cross-worktree edits to `ui/` cause merge conflicts and break the parallel guarantee. Resolution: add the primitive in a pre-wave commit on `main`, or queue it for Wave 2.

**Token contract:** v2 tokens are at `:root` (already shipped per kickoff doc). No worktree should re-fence, re-export, or shadow them.

---

## 6. Out of scope (this session)

- Backend or Prisma schema changes (UI/UX only)
- Interactive landing hero ("will you win?" demo — 10x move #3) — deferred to its own spec
- Weekly grant email infrastructure — 10x move #4, separate initiative
- Smart Fill transparent scorecard — 10x move #5, separate initiative
- New marketing pages or copy rewrites — only restyle existing
- Settings/billing surface — the 4th pending surface from the kickoff doc, deferred to next sweep (would be Wave 1.5 if time permits after the three primary surfaces)

---

## 7. Success criteria

This session ships successfully when, on `main`:

1. The three Wave 1 surfaces visibly belong to the same product as the v2 landing
2. `<ScoreRing>` appears wherever a score is shown — no legacy pill remains in dashboard or marketing
3. Loading states across the app feature the ring derivative
4. `<WinShareCard>` primitive exists and renders correctly in isolation
5. All taste gates passed on every surface (logged in commit messages)
6. Build + tests + e2e green
7. No regression in Lighthouse scores on landing or marketing

---

## 8. Anti-goals — what success is NOT

- Three surfaces that *look* unified but feel like three different products (taste-gate failure)
- Visual consistency at the cost of momentum — if dashboard looks identical to marketing pages, the *campaign* feeling is lost (parent spec §2.4)
- Adding "pop" via decoration to compensate for restraint (parent spec §6 anti-pattern)
- A long PR description celebrating the sweep instead of the user feeling closer to winning money (10x strategy one-line test)
