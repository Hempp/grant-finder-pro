# V2 Landing Redesign — Fresh Session Kickoff

## How to start the new session

In your terminal:

```bash
cd ~/grant-finder-pro
claude
```

Then paste the kickoff message below as your first message in the new conversation.

---

## Kickoff message (paste verbatim)

```
We have a landing-page redesign spec at:
docs/plans/2026-05-18-landing-v2-redesign-brief.md

Current branch: main
Current state: editorial pivot v8 just shipped (PR #1 merged).
Reference: zeffy.com — Stripe/Linear/Notion/Webflow aesthetic.

Use superpowers:brainstorming to clarify these open blockers,
then writing-plans, then subagent-driven-development to execute
the v2 full-page redesign.

Two known blockers to resolve up front:

1. Real product screenshots. public/landing/*.webp are still
   gray placeholders. Alternating feature sections will look
   weak without them. Decide: (a) capture real screenshots from
   the live product first, (b) use stylized mockups like
   FeatureCarousel does, or (c) hold the feature sections
   until real screenshots exist.

2. Testimonial decision. Prior decision was no-fake-until-real
   ("Re-add when we have 3+ named customers with permission").
   The v2 spec asks for a testimonials grid. Pick a path:
   defer the section, use anonymous beta-tester quotes if any
   exist, or replace with an honest "Pre-launch" framing like
   the strip we already have.

The brief defines 10-section structure (sticky nav, hero,
trust bar, how it works, alternating feature sections,
comparison/pricing, testimonials, FAQ, gradient CTA banner,
premium footer) plus aesthetic targets (glassmorphism, soft
gradients, floating overlays, smooth animations).

Carried-over constraints:
- No founder attribution (no "Built by Coach Phillips")
- No fake testimonials
- Scope stays under [data-theme="editorial"]; dashboards untouched
- Roboto for sans, Geist Mono for numerals
- Zeffy-exact palette: bg #FFFFFF, ink #1a1a1a, accent #0066CC,
  pastels for tile chrome
```

---

## What you're starting with

- **Branch:** main (HEAD: `0eb41e0`)
- **Current landing:** v8 — Zeffy-aligned, Roboto, marine blue, FeatureCarousel
- **Spec:** [`docs/plans/2026-05-18-landing-v2-redesign-brief.md`](./2026-05-18-landing-v2-redesign-brief.md)
- **Design + plan docs from v1:** in `docs/plans/`
- **Build state:** green, vitest 8/8, e2e 5/5, visual regression baselines locked

## Anything else useful

- Vercel production: https://grant-finder-pro.vercel.app (and grantpilot.dev)
- PR #1 (now merged): https://github.com/Hempp/grant-finder-pro/pull/1
- Tokens scoped under `[data-theme="editorial"]` in `src/app/globals.css`
- Existing landing primitives in `src/components/landing/`
