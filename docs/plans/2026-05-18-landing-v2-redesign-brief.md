# GrantPilot Landing v2 — Full Redesign Brief

**Date:** 2026-05-18
**Status:** Brief captured, awaiting fresh-session brainstorming + implementation plan
**Source:** User-supplied spec (delivered across two messages)
**Reference visual:** zeffy.com — "Stripe + Linear + Notion + modern Webflow aesthetic"
**Current branch base:** `landing/editorial-pivot` at commit `b7c7d91` (v8 hero with left/right Zeffy layout, Roboto, white bg, blue+green accents, FeatureCarousel below)

## Reference

> A venture-backed SaaS startup homepage that feels trustworthy, modern, premium, and extremely polished.

Reference visual ancestors: Stripe, Linear, Notion, Vercel, modern Webflow startups, zeffy.com.

## Aesthetic targets

- White / light backgrounds (some sections on light gray for rhythm)
- Soft green + soft blue accent palette (currently `--accent #2563EB`, `--success #15803D`)
- Dark charcoal typography (`--ink #111827`)
- Bright CTA buttons
- Rounded corners (current standard: 12–16px on cards, 999px on chips, 8px on inputs)
- Glassmorphism cards (backdrop-blur + semi-transparent surfaces — currently NOT in use)
- Subtle gradients (linear + radial — currently NOT in use; aurora was removed)
- Floating UI elements (analytics cards layered over hero preview)
- Soft shadows + layered depth
- Smooth modern animations (hover transitions, scroll-triggered fade-in)
- Large bold headlines, minimal paragraph copy, high readability
- Modern sans-serif (currently Roboto in editorial scope; mono Geist Mono on numerals)
- Apple-level polish

## Page structure (in order)

1. **Sticky transparent navbar** — logo + nav links + login + primary CTA. Currently `<EditorialNav>` exists but is not sticky and not transparent.
2. **Hero section** — already at v8: split layout, headline ("Win grants and scholarships. Pay 0% upfront."), subhead, two CTAs, product preview card (HeroPreview = matches inbox mock). Spec asks for additional **floating analytics cards layered over the hero preview** (e.g., a "+$275K matched" card, a "Score: 94" card overlapping the corner).
3. **Trust bar / social proof** — partial. Currently has `INDEXED_FUNDERS` strip below hero. Spec asks for additional: organization/client logos, metrics, "Trusted by thousands" framing. **BLOCKER:** no real customer logos or testimonials exist yet. Need either (a) real customers, (b) "Pre-launch · Be one of our first 100 wins" honest framing (already partially present), or (c) defer this section until launched.
4. **How It Works** — 3 clean animated step cards, icons + illustrations. Currently rendered via `HowItWorksStep` in `src/app/page.tsx`. Needs visual upgrade to match premium aesthetic.
5. **Alternating feature sections** — image-left/text-right alternating. Topics from current product: discovery, Smart Fill draft, score prediction, batch submission, auto-apply queue, success-fee billing. Each section needs its own product screenshot/mockup. **DEPENDENCY:** real product screenshots replacing the gray placeholders at `public/landing/*.webp`.
6. **Comparison / pricing section** — competitor comparison table (GrantPilot vs $5K–$15K consultants vs Subscribe-up-front competitors). Modern pricing cards. Highlight 0% upfront as the key advantage.
7. **Testimonials grid** — rounded cards, user avatars, ratings, soft shadows. **BLOCKER:** still no real testimonials per earlier user decision ("Re-add when we have 3+ named customers with permission"). Decision needed: defer, fake, or replace with anonymous quotes from beta testers if any exist.
8. **FAQ accordion** — currently `EditorialFAQ` with native `<details>`. Visual upgrade to soft glassmorphism rows + smooth height transitions.
9. **Final CTA section** — full-width gradient banner with strong headline + large CTA. Currently a plain centered section in `src/app/page.tsx:163-173`. Needs gradient bg (likely linear from accent-soft to success-soft or similar).
10. **Premium footer** — multi-column links, newsletter signup, social icons, legal pages. Currently `EditorialFooter` is minimal. Needs full multi-column layout with: Product / Resources / Company / Legal columns + email capture + social links.

## UI detail targets

- Smooth hover interactions (color + shadow shifts; no spring-physics)
- Soft scroll animations (fade-in on viewport entry — would need Framer Motion or IntersectionObserver)
- Clean iconography (currently `lucide-react` only used in legacy components; new sections should use lucide consistently)
- Responsive mobile-first
- Elegant gradients (linear gradients on CTAs, soft radial on backgrounds)
- Glassmorphism (`backdrop-blur` + `bg-surface/60` patterns)
- Minimal color palette (current: white, ink, ink-2, rule, accent blue, success green, four pastel tile colors; **could tighten by removing pastel tile system** if it doesn't serve the SaaS register)
- Professional dashboard components (current `HeroPreview` is a good baseline; alternating feature sections need 4–6 more component-quality mocks)

## Tech / dependency considerations

- **Framer Motion** — not currently installed. Needed if we want viewport-triggered fade-in animations beyond CSS transitions. Decision: install + add minimal motion (`motion.div` with `initial`/`whileInView`) OR stick with CSS-only animations (cheaper, less premium feel).
- **Real product screenshots** — still missing at `public/landing/*.webp` (placeholders). Alternating feature sections will look weak without them. **Highest-leverage non-design task before the v2 redesign.**
- **Real customer quotes** — same blocker as testimonial grid section.
- Existing primitives to keep: `EditorialShell`, `EditorialCTA`, `EditorialFAQ`, `RotatingMatchProof` (currently unused, could revive), `FeatureCarousel`, `HeroPreview`, `Stat`.
- Existing primitives that need rework: `EditorialNav` (not sticky/transparent), `EditorialFooter` (not multi-column premium).

## Constraints / non-goals (carried from previous sessions)

- **No founder attribution** anywhere on the page (user direction). No "Built by Coach Phillips," no founder note section.
- **No fake testimonials, fake stats, or invented social proof.** If we don't have it, frame it honestly ("Pre-launch · Be one of our first 100 wins") or omit the section.
- **No dashboards touched.** Everything stays scoped under `[data-theme="editorial"]`. `src/components/landing/*` only.
- **Existing token system is the foundation.** Don't redefine; extend if needed (e.g., glassmorphism utilities, gradient stops as tokens).

## Suggested next session kickoff

1. Open a new conversation in this repo.
2. Reference this file: "Use `docs/plans/2026-05-18-landing-v2-redesign-brief.md` as the input spec."
3. The new session should invoke `superpowers:brainstorming` to clarify the open blockers (testimonials decision, Framer Motion vs CSS-only, real-screenshots prerequisite), then `superpowers:writing-plans` for a full implementation plan, then `superpowers:subagent-driven-development` to execute.
4. Aim for ~30–40 atomic commits across the full page redesign. Phase boundaries should land cleanly to allow incremental shipping.

## Recommended priority order for the v2 redesign

1. **Block 1 (Foundation):** Sticky transparent nav, premium footer, gradient CTA banner. These touch the page chrome that wraps everything.
2. **Block 2 (Hero enhancement):** Glassmorphism on the existing v8 HeroPreview card, 2 floating analytics overlay cards (re-introducing the toast pattern but anchored over the preview).
3. **Block 3 (Feature sections):** Alternating image/text rows. Requires the real product screenshots blocker resolved first.
4. **Block 4 (Comparison + pricing):** Competitor comparison table + 3-tier pricing cards.
5. **Block 5 (FAQ polish):** Glassmorphism + smooth height transition on the existing accordion.
6. **Block 6 (Testimonials):** Gated on the customer-quotes blocker. If no quotes by then, skip and use the honest "Pre-launch" framing.
7. **Block 7 (Motion):** Framer Motion decision + scroll-triggered fade-ins across the page.

## Status of current branch (`landing/editorial-pivot`)

PR #1: https://github.com/Hempp/grant-finder-pro/pull/1
30+ commits ahead of `main`.
Build green, tsc clean, vitest 8/8, Playwright e2e 5/5, visual regression 3/3.
v8 hero shipped at `b7c7d91`.
Ready for PR merge once you decide whether v2 is a new PR on top OR a continuation of this one.
