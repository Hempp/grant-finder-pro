# App Redesign — Fresh Session Kickoff

## How to start

```bash
cd ~/grant-finder-pro
claude
```

Then paste the kickoff message below as your first message.

---

## Kickoff message (paste verbatim)

```
Resume the GrantPilot app redesign. The landing v2 redesign is complete and
pushed to origin/main. This is the follow-on initiative: extend the design
language to the full app (dashboard, auth, account/billing, secondary
marketing pages).

Design spec: docs/superpowers/specs/2026-05-21-app-redesign-design.md
North star: make the Score the signature object (a ScoreRing component used
everywhere) and reframe the dashboard as a winning campaign, not a database.

FOUNDATION BLOCK IS ALREADY CHECKPOINTED — resume from here, do not restart:

1. ScoreRing (the signature component) is built and guardian-reviewed in the
   worktree at .claude/worktrees/app-foundation-scorering (branch
   worktree-app-foundation-scorering, commit 36cb33a). 12 vitest tests pass,
   tsc + build clean. It is NOT merged — preserve that worktree.

2. The guardian caught a confirmed blocker: the v2 design tokens (--accent,
   --accent-soft, --success, --warn, --ease-soft, plus the type scale and
   motion tokens) are defined ONLY inside [data-theme="editorial"] in
   src/app/globals.css — NOT at :root. ScoreRing and every app surface render
   outside that scope, so the tokens resolve to nothing.

THE FIRST TASK is the token un-fencing: hoist the v2 design system (marine
palette, type scale, radii, motion tokens) from [data-theme="editorial"] to
:root (or a base app theme) so the whole app consumes them. This deliberately
restyles the dashboard to the marine palette — that is intended per spec §6.
Do it carefully; it changes the dashboard's current appearance.

After the token-hoist: ScoreRing's blocker resolves — merge it. Then build the
momentum primitives, then write and execute the dashboard plan, then auth,
account/billing, and the secondary marketing pages.

Use the same orchestration that built the landing redesign: brainstorming →
spec (done) → per-surface plans → execution in isolated git worktrees, one
block per worktree, parallel where region-disjoint → guardian review per block
(spec + code quality + a taste-check/emil-review/impeccable-audit design pass)
→ sequential merge to main → integration verification per wave.

Carried-over constraints:
- No backend / data-model changes — UI/UX only, consumes existing data.
- No fake momentum — every dashboard number is real user data; empty states
  are designed, not faked.
- Restrained motion — celebration only at the value beats (match found, score
  climbing, draft optimized, win); prefers-reduced-motion honored.
- WCAG 2.2 AA floor. ScoreRing exposes its value via role="meter".
- The landing v2 (/) is done — not re-opened, except secondary marketing
  pages adopting its system.
```

---

## What you're starting with

- **origin/main** @ `9828ae8` — landing v2 complete + the app-redesign spec.
- **App-redesign spec:** [`docs/superpowers/specs/2026-05-21-app-redesign-design.md`](../superpowers/specs/2026-05-21-app-redesign-design.md)
- **ScoreRing checkpoint:** worktree `.claude/worktrees/app-foundation-scorering`, branch `worktree-app-foundation-scorering`, commit `36cb33a` — built, guardian-reviewed, not merged.
- **Memory:** `project_app-redesign.md` carries the same checkpoint context.

## The known blocker, in one line

The v2 design tokens are fenced inside `[data-theme="editorial"]`. The app redesign's first job is to un-fence them to `:root`. Then `ScoreRing` works app-wide and can merge.
