# GrantPilot App Redesign — Design Spec

**Date:** 2026-05-21
**Status:** Vision + scope locked. Per-surface plans + execution to run in a fresh session.
**Predecessor:** the v2 landing redesign (`docs/superpowers/specs/2026-05-19-landing-v2-design.md`) — shipped, on `main`.

---

## 1. North star

> **The Score is the signature. The dashboard is a campaign you're winning, not a database you're querying.**

The v2 landing redesign reached "competent premium" but has no *signature* — nothing that says "GrantPilot" rather than "a well-made SaaS site." This redesign fixes that. Two ideas drive every decision:

1. **Signature object — the Score.** The predicted score (e.g. `94`) is the most emotionally-charged, most ownable element in the product. It becomes a designed, animated object used everywhere: dashboard, lists, the favicon, loading states, the win screen.
2. **Emotional moment — the Win.** The product's emotional truth is *winning money you didn't believe you could get*. The app must celebrate the win — matched grant, a draft crossing 90, a confirmed award — with a real, designed moment.

The differentiator is not another feature. It is that GrantPilot **feels like a campaign with momentum** while Instrumentl / Submittable / consultants feel like research databases.

---

## 2. Design principles

1. **Momentum on every login.** Opening the dashboard must immediately convey forward motion — money in the queue, drafts ready, deadlines closing. The user should feel *closer to funding than yesterday*.
2. **One signature, used relentlessly.** The Score ring appears everywhere. Consistency makes it identity.
3. **Emotion at the value beats, restraint everywhere else.** Motion and celebration fire ONLY at: match found, score climbing, draft optimized, win confirmed. The rest of the app is calm and fast (Emil Kowalski rule — motion clarifies, never decorates).
4. **Dashboard-native layout, v2 design system.** Inter, marine palette, 12-step type scale, radii, tokens, glass, reveal motion all carry over. Layout patterns do NOT — the app gets a sidebar, data tables, dense forms, command surfaces. Do not paste the marketing aesthetic onto a data product.
5. **Honest, never fake.** Same constraint as v2 — no fake numbers, no invented progress. Momentum is shown only from real user data.

---

## 3. The signature object — `ScoreRing`

A circular score gauge replacing the flat green pill used today.

- **Form:** a ring that fills proportional to the score (0–100); the numeral counts up on first paint; ring color interpolates amber → marine → green as the score climbs.
- **Sizes:** `sm` (inline in lists/tables), `md` (cards), `lg` (the hero/detail moment).
- **Motion:** fill + count-up on reveal (respects `prefers-reduced-motion` — snaps to final state). At score ≥ 90, a subtle one-time pulse.
- **Reuse:** match lists, grant detail, draft editor (live-updating as Smart Fill optimizes), the win screen, empty-state illustrations, favicon/loading spinner derivative.

This single component is the visual identity. Build it first; everything else references it.

---

## 4. The momentum dashboard

The logged-in home is reframed from "list of grants" to "your funding campaign."

```
┌──────────────────────────────────────────────────────────────┐
│  ◑ GrantPilot          Discover  Drafts  Submitted   ◐ ⚙ ▾   │  sidebar/topbar
├──────────────────────────────────────────────────────────────┤
│                                                                │
│   Good morning, Sam.   You're closer to funding than Monday.   │  momentum line
│                                                                │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│   │  $420,000   │  │   3 drafts  │  │  2 deadlines│            │  momentum cards
│   │  in your    │  │   at 90+ —  │  │  this week  │            │  (real data only)
│   │  match queue│  │  ready      │  │             │            │
│   └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                │
│   Top match today                              ◯ 94           │  ScoreRing lg
│   NSF SBIR Phase I — Software        $275,000   Draft it →     │
│                                                                │
│   Your pipeline ───────────────────────────────────────────    │
│   ◯88  Knight Foundation · Civic      $125,000   In draft      │
│   ◯91  Coca-Cola Scholars             $20,000    Ready         │
│   ◯82  Gates Health Equity            $500,000   Matched       │
└──────────────────────────────────────────────────────────────┘
```

- **Momentum line** — a real, data-derived sentence ("closer to funding than Monday") computed from pipeline change.
- **Momentum cards** — 3 stat cards: queue value, drafts ready, deadlines. Numbers count up on load (Geist Mono).
- **Pipeline** — the user's grants as a campaign with `ScoreRing` + status, not a neutral table.
- **No empty database feeling.** Even a brand-new user sees an onboarding momentum state ("Let's find your first $100K"), never a blank table.

---

## 5. The win moment

When a grant is matched at a high score, a draft crosses 90, or an award is confirmed:

- The `ScoreRing` completes its fill in a deliberate, slightly slower arc.
- The dollar amount counts up.
- One honest line: *"$275,000. You qualified."* — no exclamation-mark hype.
- Confetti is the lazy version — rejected. The designed version is the ring + the number + the restraint.
- A confirmed real award (future) triggers a fuller celebration screen — the app's single loudest moment.

---

## 6. What carries over from v2 (design system — table stakes)

Reuse directly, do not redesign: Inter font, marine palette + `--accent`/`--success`, the 12-step type scale, `--radius-*`, glass tokens, `--shadow-card*`, `useReveal` motion + `--ease-soft`/`--dur-reveal`, Geist Mono numerals, dark-mode token parity. The app redesign *consumes* the v2 system; it does not re-derive it.

---

## 7. Surface scope (all app surfaces)

| Surface group | Pages | Redesign character |
|---|---|---|
| **Dashboard** | `/dashboard` home, match/discover views, draft editor, submitted | Momentum reframe + `ScoreRing` everywhere. Highest effort. |
| **Auth** | login, signup, password reset | Calm, fast, on-brand. Split layout: form + a quiet ScoreRing/marine motif panel. |
| **Account & billing** | settings, profile, subscription/billing | Dense forms on the v2 system; the success-fee model shown honestly. |
| **Secondary marketing** | `/pricing`, `/resources`, `/trust`, `/team` | Port to the v2 landing system so the whole site is one language. |

---

## 8. Execution plan (fresh session)

Same orchestration as the landing redesign — it worked:

1. **Per-surface plans.** Each surface group gets its own block-by-block plan (`docs/superpowers/plans/`). Dashboard is largest — likely its own multi-block plan.
2. **Foundation block first** — build `ScoreRing` + the momentum primitives + any app-shell tokens before surface work. Everything depends on the signature object.
3. **Waves of parallel worktrees**, one block per worktree, region-disjoint where possible.
4. **Guardian review** per block (spec + code quality + a design-standard pass), `taste-check` / `emil-review` / `impeccable-audit` as the design gates.
5. Sequential merge to `main`, integration verification (build, tests, visual baselines, Lighthouse) per wave.

**Start the fresh session with:** "Execute the app redesign per `docs/superpowers/specs/2026-05-21-app-redesign-design.md` — begin with the foundation block (`ScoreRing` + momentum primitives), then the dashboard plan."

---

## 9. Out of scope / constraints

- No backend / data-model changes. This is a UI/UX redesign — it consumes existing data.
- No fake momentum. Every number on the dashboard is real user data; empty states are designed, not faked.
- Motion stays restrained — celebration only at the value beats; `prefers-reduced-motion` honored.
- The v2 landing (`/`) is done — not re-opened, except the secondary marketing pages adopting its system.
- Accessibility floor: WCAG 2.2 AA, same as v2. The `ScoreRing` must expose its value to screen readers (`role="meter"` / `aria-valuenow`).

---

## 10. The one-line test

Before shipping any app surface, ask: **"Does this make the user feel they're winning a campaign?"** If it feels like querying a database, it's not done.
