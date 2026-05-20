# GrantPilot Landing v2 — Design-Standard Cross-Check

**Date:** 2026-05-20
**Reviewer role:** Design-standard guardian
**Branch:** `main`
**Reference systems:** Stripe, Linear, Notion, Vercel, Webflow `DESIGN.md` files (`docs/design/reference/`)
**Spec under review:** `docs/superpowers/specs/2026-05-19-landing-v2-design.md`
**Scope:** Read-only assessment of the integrated v2 landing. Informs Block 5 (alternating feature sections) and Block 8 (motion sweep), both not yet built.

---

## Alignment summary

### Where v2 already meets the Stripe / Linear / Notion bar

- **Restrained accent discipline.** The Zeffy marine `#0066CC` is used the way Stripe uses indigo and Linear uses lavender: one filled CTA per band, eyebrows, inline links. The page never floods a surface with the accent. This is the single hardest thing to get right and v2 has it.
- **Polarity-flipped loud band.** `CtaBanner.tsx` is the one saturated marine moment with a contrast-reversed white CTA. This matches Vercel's `showcase-band-dark` and Webflow's `hero-band-dark` philosophy exactly — the dark/loud band IS the depth cue, used once.
- **Pastel-tinted feature stages are token-driven.** `globals.css:782–791` defines `--section-tint-1..5` and `--section-border-1..5` as a closed set with dark-mode parity (`:854–863`). This mirrors Notion's `card-tint-*` family — a documented, finite tint palette rather than ad-hoc colors.
- **Product-mockup-led sections.** Every section pairs copy with an in-code mockup (`HowItWorksMockup1/2/3`, `HeroPreview`). All five reference systems lead with product UI; v2 follows the rule and keeps a consistent chrome (macOS dots, URL slug, Live badge).
- **Semantic HTML + a11y.** Real `<table>` with `<caption>`/`scope` in `ComparisonSection`, `<article>`+`<dl>` in `PricingCards`, native `<details>` in `EditorialFAQ`, `aria-hidden` on the decorative `FloatingScoreCard`. Matches the structural rigor the reference systems imply.
- **Glassmorphism token system.** `--glass-bg` / `--glass-blur` / `--glass-border` are centralized and used by both `EditorialNav` and `EditorialFAQ` — consistent, not one-off.

### Where v2 falls short of the bar

1. **Geist Mono numerals are specified but never rendered (HIGH).** The spec locks Geist Mono for "scores, amounts, dates, counts" (spec §1, line 18). Every v2 numeric surface — `FloatingScoreCard` score, `PricingCards` `0%`/`$9.99`, all three `HowItWorksMockup` scores/amounts, `HeroPreview` match scores — uses `tabular-nums` on Roboto and **no `font-mono` class**. Only the older `FeatureCarousel.tsx` and `RotatingMatchProof.tsx` correctly apply `font-mono`. The brand's "quiet financial-data signal" (Stripe's tabular-figure principle, Vercel's mono-for-technical principle) is half-implemented: tabular spacing without the mono face. This is a locked-decision violation, not a taste call.
2. **No defined type scale — 115+ hardcoded `text-[NNpx]` across ~13 sizes (HIGH).** Every reference system ships a named token ladder (Stripe `display-xxl`→`micro`, Linear `display-xl`→`caption`, Vercel `display-xl`→`caption-mono`). v2 has none: `text-[11px]`×31, `text-[12px]`×23, `text-[13px]`, `text-[14px]`, `text-[15px]`, `text-[16px]`, `text-[17px]`, `text-[18px]`, `text-[19px]`, `text-[20px]`, `text-[22px]`, `text-[40px]`, `text-[64px]`. The `17/18/19` cluster is three near-identical body sizes that should be one token. Block 5 will add five more sections of this sprawl unless a scale is established first.
3. **Radius language is inconsistent (MEDIUM).** Cards mix `rounded-2xl` (16px, hero preview + mockups), `rounded-xl` (12px, FAQ rows), and `rounded-3xl` (24px, `PricingCards` + `PreLaunchPanel`). Reference systems pick ONE card radius (Linear 12px, Notion 12px, Vercel 8–12px, Webflow 8px) and hold it. v2 has three card radii with no rule for which applies where.
4. **CTA shape is undefined across the system (MEDIUM).** `EditorialCTA` primary renders a **square-cornered** button (no `rounded-*` class at all — `EditorialCTA.tsx:28`), while `EditorialNav`'s CTA is `rounded-lg` and `CtaBanner`'s is `rounded-lg`. The hero's primary CTA and the nav's primary CTA do not share a shape. Every reference system is emphatic here (Webflow: "never uses pill CTAs," Vercel: "pick a scale and stay there").
5. **Section vertical rhythm drifts (MEDIUM).** Section padding ranges across `py-12 md:py-16` (`PricingCards`), `py-20 md:py-28` (`ComparisonSection`, `PreLaunchPanel`), `py-20 md:py-32` (`#how-it-works`, `EditorialFAQ`), `py-20 md:py-28` (`CtaBanner`). Four different vertical-rhythm values. Linear holds `96px` between sections; Vercel holds `96–128px`. v2 needs one section-spacing token.
6. **Elevation is a single hardcoded shadow (LOW–MEDIUM).** Every mockup repeats the literal string `shadow-[0_20px_48px_-12px_rgba(15,23,42,0.18),0_4px_12px_-2px_rgba(15,23,42,0.06)]`. It is a good 2-stop shadow, but it is not tokenized and there is no elevation ladder. Vercel and Webflow both define 4–5 elevation levels; v2 has exactly one and copy-pastes it.

---

## Concrete adjustments

Prioritized. Each names a file and ties to a reference principle. None require new dependencies.

### P1 — Apply Geist Mono to all numerals (locked-decision compliance)

- **Files:** `FloatingScoreCard.tsx:20`, `PricingCards.tsx:47` & `:76`, `HowItWorksMockup1.tsx:44` (`2,141`), `HowItWorksMockup2.tsx:34` & `:37`, `HowItWorksMockup3.tsx:30`, `EditorialHero.tsx:124` & `:131`.
- **Change:** add `font-mono` alongside the existing `tabular-nums` on every element rendering a score, dollar amount, count, or date.
- **Reference:** Stripe DESIGN.md — "Tabular figures for money… the brand quietly signals its financial DNA." Vercel DESIGN.md — "Mono is the voice of the platform." The spec already mandates this; the implementation simply skipped it. `FeatureCarousel.tsx` is the correct in-repo precedent.

### P2 — Establish a named type scale before Block 5

- **File:** `src/app/globals.css` under `[data-theme="editorial"]`.
- **Change:** add a token ladder, e.g. `--text-display`, `--text-h2`, `--text-h3`, `--text-body-lg` (one size, collapses the 17/18/19px cluster), `--text-body` (16px), `--text-small` (14px), `--text-caption` (13px), `--text-micro` (11px), `--text-eyebrow` (12px). Refactor components to consume them. At minimum, fix the `text-[17px]`/`[18px]`/`[19px]` triplet to a single body-lg token.
- **Reference:** Every DESIGN.md ships a `typography:` token block with 10–16 named roles. v2's `text-[NNpx]` sprawl is the exact anti-pattern these systems exist to prevent. **Doing this before Block 5 prevents five new sections of sprawl.**

### P3 — Pick one card radius and one CTA radius

- **Files:** `EditorialCTA.tsx:28` (primary has NO radius — currently square), `PricingCards.tsx:37` & `:66` (`rounded-3xl`), `PreLaunchPanel.tsx:4` (`rounded-3xl`), `EditorialFAQ.tsx:22` (`rounded-xl`), mockup files (`rounded-2xl`).
- **Change:** standardize cards on `rounded-2xl` (16px) — it is already the dominant value (8 uses) and matches Linear's `product-screenshot-card` 16px and Notion's larger feature panels. Pull `PricingCards`/`PreLaunchPanel` down from 24px to 16px. For CTAs, give `EditorialCTA` primary an explicit `rounded-lg` so it matches the nav and banner buttons — a square-cornered hero CTA next to a rounded nav CTA reads as a bug.
- **Reference:** Webflow DESIGN.md — "cards at `rounded.md` 8px… the brand never uses pill CTAs." Vercel DESIGN.md — "pick a scale and stay there." The principle is consistency, not the specific value.

### P4 — Tokenize section vertical rhythm

- **File:** `globals.css` + `page.tsx:97`, `ComparisonSection.tsx:33`, `PricingCards.tsx:27`, `PreLaunchPanel.tsx:3`, `EditorialFAQ.tsx:13`, `CtaBanner.tsx:12`.
- **Change:** add `--section-py` (e.g. `clamp(80px, 9vw, 128px)`) and apply it uniformly. `PricingCards` at `py-12 md:py-16` is visibly tighter than its neighbors and breaks the rhythm; it should match unless the Comparison+Pricing pair is intentionally one combined band (in which case give the *pair* one outer padding and zero the inner).
- **Reference:** Linear `spacing.section` 96px; Vercel `spacing.5xl` 96px between bands. One value, held.

### P5 — Tokenize the elevation shadow

- **File:** `globals.css` + the four mockup files + `EditorialHero.tsx:67`.
- **Change:** define `--shadow-card` (the existing 2-stop value) and, for Block 5, a slightly lighter `--shadow-card-soft` for mockups that sit *inside* an already-tinted container (a tinted stage needs less shadow than a white-on-white card). Reference the token instead of repeating the literal string.
- **Reference:** Vercel DESIGN.md — stacked-shadow elevation ladder (Levels 1–5); Webflow's layered multi-stop recipes. v2 doesn't need 5 levels, but it needs the shadow to be a token, not a copy-pasted string.

### P6 — Eyebrow tracking consistency (LOW)

- **Files:** eyebrows currently use `tracking-[0.12em]`, `tracking-[0.14em]`, `tracking-[0.16em]` interchangeably (`ComparisonSection.tsx:35` vs `HowItWorksStep.tsx:25` vs `CtaBanner.tsx:23`).
- **Change:** pick one eyebrow tracking token. Linear's eyebrow uses a single `+0.4px`; Webflow a single `1.5px`. Block 5 eyebrows must match whatever value is chosen.

---

## Block 5 guidance — alternating feature sections

Block 5 is the largest remaining block: a `FeatureSection.tsx` wrapper plus five inline mockups, each in a `--section-tint-N` container. This is the highest-risk block because it multiplies any inconsistency by five. The reference systems handle exactly this pattern (Notion's pastel feature bands, Webflow's chromatic category cards, Vercel's `feature-mesh-band`). Concrete guidance for the implementer:

### Layout & container

- **One wrapper, `tint` enum 1–5.** Build `FeatureSection.tsx` so the only per-section variables are `tint`, `eyebrow`, `headline`, `body`, `link`, and a `mockup` child. Do not let the five sections diverge structurally — Notion's feature bands are visually identical except for tint.
- **Card radius:** `rounded-2xl` (16px), matching the P3 decision. Do NOT use `rounded-3xl` even though `PricingCards`/`PreLaunchPanel` currently do — those are the files that should change, not the precedent to copy.
- **Container padding:** the spec says `p-10 lg:p-14`. Keep it, but make the *inter-section* gap a single token (`gap-y-12` per spec §4.5). Do not also add `py-8` per section on top of the gap — that double-spaces and breaks rhythm. One spacing mechanism.
- **The tint is the stage, the mockup is the actor.** Inner mockup keeps the **white** `--surface` background and standard chrome. Never tint the mockup itself — Notion's pastel cards hold white product UI inside the tint, never tinted-on-tinted.

### Color & contrast

- **Tints already exist and are correct** (`globals.css:782–791`). Do not add new colors. The five tints + five 8%-opacity borders are a closed set — treat them like Notion's `card-tint-*` family. Adding a sixth breaks the system (every reference DESIGN.md says this explicitly).
- **Border at 8% opacity is deliberately faint** — it is a hairline cue, not a frame. Keep it. Webflow's category cards rely on the fill itself for separation; v2's faint border is the quieter, on-brand choice.
- **Body copy stays `--ink` / `--ink-2`.** Do not tint the text to match the section. The accent color appears only on the eyebrow and the section link (`See how matching works →`), exactly as `HowItWorksStep` already does it.
- **Dark mode:** the dark tints (`globals.css:854–863`) translate the pastels to 10%/4% translucent overlays. Verify each of the five mockups still has ≥4.5:1 text contrast *inside* the tinted container in dark mode — the mockup's white surface flips to `--surface` `#111827`, so this should hold, but confirm per section.

### Typography

- **Apply the P2 type scale from day one.** Block 5 is five sections; if it ships with fresh `text-[NNpx]` values it doubles the existing sprawl. Section headline → `--text-h2` token; body → `--text-body-lg` token; eyebrow → `--text-eyebrow`.
- **All numerals in the five mockups use `font-mono` + `tabular-nums`.** The Score-prediction mockup (`91 / 100` + bar-chart subscores), the Batch mockup (`Submit selected (8)`), and the Billing mockup (`$275,000` → `$11,000` → `$264,000`) are numeral-dense. This is precisely the Stripe "money type" surface — mono is mandatory, not optional. Match `FeatureCarousel.tsx`'s billing block (`:267–282`) as the in-repo precedent.

### Mockup chrome

- **Reuse `HeroPreview` chrome verbatim** (macOS dots, URL slug, Live/Syncing badge, `--shadow-card` token from P5). The spec §1 mandates every mock be "a sibling of `HeroPreview`." The three `HowItWorksMockup` files are the correct template — copy their structure, not their hardcoded shadow string.
- **Mockups inside a tinted container want the *soft* shadow** (`--shadow-card-soft`, P5). A white card on a `#F0F7FF` tint needs less elevation than a white card on pure white — too heavy a shadow on a tinted stage looks like a sticker.

### Alternation

- **Odd sections text-left, even text-right** via `grid lg:grid-cols-2` with a `reverse` prop — `HowItWorksStep.tsx:20–22` already implements this exact pattern with `lg:[&>*:first-child]:col-start-2`. Reuse that mechanism; do not invent a second one.

---

## Block 8 guidance — motion sweep

Block 8 adds the `useReveal()` hook and CSS reveal animations across all sections. The reference systems are quieter on motion than on color/type (Notion's DESIGN.md explicitly defers: "Animation/transition timings not extracted; recommend 150–200ms ease"), but the v2 CSS-only approach is sound. Principles to fold in:

- **The CSS-only + IntersectionObserver decision is correct — do not reverse it.** All five reference brands achieve their polish with restraint, not animation libraries. None of them ship spring physics on a marketing page. The spec's no-Framer-Motion decision (§2.2) aligns with the reference bar. The `+0 KB` bundle budget (spec §9) is the right constraint.
- **One reveal pattern, applied uniformly.** The spec's `--ease-soft: cubic-bezier(0.32,0.72,0,1)` + `--dur-reveal: 520ms` translate-up-16px fade is good. Apply the *same* curve and duration to every section. Reference systems read as "one continuous voice" (Linear's phrase) because they do not vary motion per component. Resist per-section easing.
- **Stagger sparingly.** Within a section (e.g. the five feature sections, or the three How-It-Works steps) a small per-item delay (≤80ms) is fine. Do NOT stagger individual rows inside a mockup — that draws the eye to chrome instead of content. Linear's principle: the product UI is the protagonist; motion must not upstage it.
- **`prefers-reduced-motion` is non-negotiable and already specced** (§7). The hook must short-circuit to "visible immediately." Verify with the OS toggle, not just code review.
- **Nav scroll-state is already motion-correct.** `EditorialNav.tsx:40` transitions `background-color, border-color, backdrop-filter` over `--dur-fast` with `--ease-out`, driven by an IntersectionObserver sentinel — zero scroll listeners. This is the INP-friendly pattern (spec §9); keep Block 8 consistent with it. Do not add a `scroll` event listener anywhere.
- **Hover transitions stay on `--dur-fast` / `--ease-out`** — separate from reveal motion. The codebase already does this consistently (`EditorialCTA`, `EditorialNav`, `PreLaunchPanel`). Block 8 should not touch hover timing.
- **CtaBanner is the loud moment — let motion respect that.** The radial highlight is static. A reveal on the banner is fine; do not add a shimmer/animated gradient. The spec's "quiet → rich → loud" rhythm is a *saturation* ramp, not a *motion* ramp — Block 8 should not try to make the banner move.
- **The `FloatingScoreCard` is decorative and `aria-hidden`.** If it gets an entrance animation, keep it subtle (a settle into its `+2deg` rotation). It must never animate on a loop — looping motion on a marketing hero is the off-brand tell every reference system avoids.

---

## Verdict

The v2 landing is broadly on-target for the Stripe/Linear/Notion/Webflow bar: accent restraint, the single loud band, token-driven tints, product-mockup-led sections, and solid semantic HTML are all genuinely at the reference standard. The gaps are systematization, not taste:

1. **Fix the Geist Mono numerals (P1)** — a locked-spec violation, not a judgment call, and a one-line-per-file change.
2. **Establish the type scale (P2) before Block 5** — otherwise five new sections inherit the sprawl.
3. **Unify card radius and CTA radius (P3)** — a square hero CTA next to a rounded nav CTA is the most visible inconsistency.

P4–P6 are polish that should land in the Block 8 sweep. Block 5's main risk is multiplication of existing inconsistency by five — front-load P2 and P3 so the wrapper is built on a settled foundation.
