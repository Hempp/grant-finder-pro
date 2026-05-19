# GrantPilot Landing v2 — Design Spec

**Date:** 2026-05-19
**Branch base:** `main` @ `dee6b77` (v8 editorial pivot shipped)
**Source brief:** `docs/plans/2026-05-18-landing-v2-redesign-brief.md`
**Kickoff doc:** `docs/plans/V2-KICKOFF.md`
**Status:** Draft — awaiting user review, then transition to `superpowers:writing-plans`

---

## 1. Locked decisions

These carry forward from prior conversations and the existing constraints list. Do not relitigate during planning or execution.

- **Scope.** Landing surface only. All changes stay under `[data-theme="editorial"]`. The dashboard, `/app`, and any feature surface outside the marketing pages is out of scope.
- **No founder attribution.** No "Built by Coach Phillips," no founder note section, no signature in the footer. `FoundersNote.tsx` remains retired from `page.tsx`.
- **No fake social proof.** No invented testimonials, customer counts, dollar-amount-raised stats we can't substantiate, or logos of organizations we haven't actually served.
- **Typography.** `--font-display` resolves to Roboto inside the editorial scope (`src/app/globals.css:747`). Geist Mono is reserved for numerals (scores, amounts, dates, counts).
- **Palette baseline (Zeffy-exact).** Already in `globals.css:747–758`:
  - `--bg: #FFFFFF`
  - `--ink: #1a1a1a`
  - `--accent: #0066CC` (marine)
  - `--accent-soft: #E0EBFA`
  - `--success: #15803D`
  - `--success-soft: #DCFCE7`
  - `--ink-2: #6B7280`
  - `--rule: #E5E7EB`
- **Screenshots = stylized in-code mockups.** Decision (b) from brainstorm. No real product captures. Every feature mock must look like a sibling of `HeroPreview` (same chrome: macOS dots, URL slug, "Live" badge, rounded `2xl` radius, the same `shadow-[0_20px_48px_-12px_rgba(15,23,42,0.18),...]` depth language).
- **`public/landing/*.webp` placeholders are temporary.** The current 620-byte gray webps in `howitworks-1/2/3.webp` and `smart-fill-mockup.webp` will be replaced by inline component mockups in this redesign, not by raster images.

---

## 2. Proposed decisions

Each marked `[PROPOSED]` is open to user override before implementation begins.

### 2.1 Testimonials section — honest "Pre-launch" framing  `[PROPOSED]`

The brief asks for a testimonials grid (Section 7). The "no fake testimonials" constraint blocks the literal interpretation. The decision is to **replace the grid with a single full-width "Pre-launch · Be one of our first 100 wins" panel** that occupies the same vertical slot. The current pre-launch strip at `EditorialHero.tsx:108–122` becomes the *seed* of this section: pulled out, scaled up, given a stronger headline and a soft container.

**Rationale.** Filling the structural slot keeps page rhythm intact. Turning the absence-of-testimonials into a *positioning* (early mover) rather than a *gap* converts a weakness into a story. (c) anonymous beta quotes was considered and rejected — reads like hedging.

**Override path.** If user provides 3+ real, named, permissioned testimonials before execution, this section gets re-specced as a true testimonials grid. Defer the question to ship.

### 2.2 Motion library — CSS-only + IntersectionObserver  `[PROPOSED]`

Framer Motion is **not** installed (`package.json` shows `next 16.1.1`, `lucide-react ^0.562.0`, no motion lib). Adding it would cost ~40 KB gzipped on initial JS. The brief's motion targets — viewport-triggered fade-ins, hover transitions, gradient banner shimmer — can all be handled with CSS animations + a single `IntersectionObserver` helper.

**Implementation.** A `useReveal()` hook in `src/lib/landing/useReveal.ts` returns a ref + a "visible" boolean from an `IntersectionObserver`. Components add `data-reveal="hidden"` then flip to `data-reveal="visible"` when the observer fires. CSS transitions handle the rest (translate-y, opacity).

**Curves.** Use existing tokens where present (`--ease-out`, `--dur-fast`). Add:
- `--ease-soft: cubic-bezier(0.32, 0.72, 0, 1)`  — for reveal entrances
- `--dur-reveal: 520ms`  — slightly slower than `--dur-fast`, enough to feel intentional

**Reduced motion.** Honor `prefers-reduced-motion: reduce` — the hook short-circuits to "visible immediately."

**Override path.** If we later need spring physics, drag interactions, or shared element transitions, install Framer Motion at that point. Don't preempt.

### 2.3 Hero overlay — Variant A · Minimal  `LOCKED via brainstorm`

A single floating "Score · 94" card overlapping the top-right corner of `HeroPreview`, with slight rotation (`+2deg`), soft glassmorphism (`backdrop-filter: blur(8px)`, `background: rgba(255,255,255,0.85)`), and a `box-shadow: 0 6px 16px -6px rgba(15,23,42,0.22)`. Reinforces the score-prediction feature without crowding the preview.

**Mobile behavior.** On viewports < 768px, the overlay is positioned absolutely but transforms to `rotate(0)` and snaps to the top-right corner with reduced opacity. On viewports < 480px, the overlay is hidden — the preview itself is the focal point and the overlay would clash with the stacked layout.

### 2.4 Feature sections — Variant B · Layered pastel containers  `LOCKED via brainstorm`

Each of the 5 alternating feature sections (Block 3) lives inside a soft-tinted container with its own subtle linear-gradient background. Five containers, five soft tints, drawn from a small palette of accent-tinted and success-tinted pastels.

**Section palette (proposed tints).** Add these to `globals.css` under `[data-theme="editorial"]`:
- `--section-tint-1: linear-gradient(180deg, #F0F7FF 0%, #F5FBFF 100%)`  (Discovery)
- `--section-tint-2: linear-gradient(180deg, #F0FDF4 0%, #F7FCF8 100%)`  (Smart Fill)
- `--section-tint-3: linear-gradient(180deg, #FEF7E0 0%, #FFFBED 100%)`  (Score prediction)
- `--section-tint-4: linear-gradient(180deg, #F5F3FF 0%, #FAF8FF 100%)`  (Batch submission)
- `--section-tint-5: linear-gradient(180deg, #FDF2F8 0%, #FEF7FB 100%)`  (Success-fee billing)

Each container has `border: 1px solid` with the corresponding 8%-opacity accent (`rgba(0,102,204,0.08)`, etc.). Inner mockup keeps the white surface + standard `HeroPreview` chrome — the tint is the section's "stage," the mockup is the "actor."

### 2.5 Final CTA banner — Variant B · Marine bold  `LOCKED via brainstorm`

Full-bleed marine gradient banner replacing the current centered section at `page.tsx:161–171`.

**Background.** `linear-gradient(135deg, #0066CC 0%, #1a73e8 60%, #2563EB 100%)`. White text. The primary CTA button is contrast-reversed: white background with marine text.

**Why this is the only loud moment.** The page's visual rhythm is **quiet → rich → loud (confidence ramp)**. Sticky nav and hero are calm to look mature on first sight. Feature sections build richness through the layered pastel containers to reward scrolling. The final CTA banner is the single high-saturation moment — the conversion peak. The bold treatment is reserved here on purpose.

---

## 3. Visual rhythm — the confidence ramp

The three taste decisions form a coherent gradient down the page. The spec uses this rhythm to settle questions that aren't worth a separate decision:

| Region | Saturation | Why |
|---|---|---|
| **Sticky nav** | quiet (transparent over hero, frosted-glass on scroll) | nav is omnipresent; can't be loud |
| **Hero** | quiet (minimal overlay, white background) | first-impression must read "mature SaaS" |
| **Trust strip / How It Works** | quiet (white sections with soft section dividers) | building rapport |
| **Feature sections × 5** | rich (pastel-tinted containers per section) | reward scrolling, build confidence |
| **Comparison / pricing** | quiet-to-rich (white with strong table chrome) | back to focused for decision-making |
| **Pre-launch panel** *(replaces testimonials)* | rich (soft success-tinted container, large statement) | emotional beat before conversion |
| **FAQ** | quiet (white with soft glassmorphism on accordion rows) | back to focused |
| **Final CTA banner** | **loud** (marine gradient, white text) | the conversion peak |
| **Premium footer** | quiet (white with subtle border-top) | clean exit |

---

## 4. Section-by-section spec (10 sections)

### 4.1 Sticky transparent navbar  ← MODIFY `EditorialNav.tsx`

**Currently** (`EditorialNav.tsx:13`): `<nav className="border-b border-rule">` — not sticky, opaque, has a static border-bottom.

**Spec.**
- `position: sticky; top: 0; z-index: 50;`
- Default state (top of page): transparent background (`bg-transparent`), no border. Logo + nav links visible against the white hero.
- Scrolled state (after `IntersectionObserver` fires on a sentinel below the hero): frosted glass (`bg-white/70`, `backdrop-blur-md`), `border-b border-rule/60`. Transition between states: 240ms `--ease-out`.
- Add 3 nav links between logo and login button: **Product**, **Pricing**, **Resources**. Hidden on viewports < 768px (replaced by a hamburger that opens a slide-down sheet — but the sheet itself is out of scope for v2; for now the links just collapse).
- The primary CTA button (`Start free` or `Go to dashboard`) becomes a real button styled with `bg-accent text-surface rounded-lg px-4 py-2`, not just a text link.
- Keep the trial-days-left and past-due eyebrows.

**A11y.** Focus rings must remain visible against both transparent and frosted backgrounds — keep `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`.

### 4.2 Hero  ← MODIFY `EditorialHero.tsx`

**Currently:** v8 layout — left text + CTAs, right `HeroPreview`. No floating overlays.

**Spec (delta from v8).**
- Add the floating "Score · 94" card (Variant A, section 2.3 above) as a new `FloatingScoreCard` component. Position: absolute, anchored to top-right of the `HeroPreview` container, transformed `translate(20%, -30%)` to overhang the corner.
- Remove the `INDEXED_FUNDERS` strip from inside the hero section (lines 72–90). Move it into Section 4.3 (Trust bar) so the hero stays focused.
- Remove the "Pre-launch" strip from inside the hero (lines 108–122). It becomes the seed of Section 4.7 (Pre-launch panel).
- Remove the "What we've indexed so far" stats (lines 124–134). These migrate to Section 4.3 (Trust bar) as part of a single consolidated trust beat.
- Remove the FeatureCarousel from inside `EditorialHero` (lines 92–106). The hero ends after the main grid + floating overlay. FeatureCarousel becomes optional under-section content — keep the component but stop calling it from `EditorialHero`. The alternating feature sections (Section 4.5) take its narrative role.

**Result.** `EditorialHero` becomes much shorter: pill eyebrow, headline, subhead, CTAs, fine print, and `HeroPreview` + overlay. Everything else moves to dedicated sections.

### 4.3 Trust bar  ← NEW `TrustBar.tsx`

**Spec.**
- Full-width section directly below the hero, white background.
- Three sub-bands in this order:
  1. **"Indexing funding from"** strip — the existing `INDEXED_FUNDERS` array, moved here, kept as text-only (no fake logos). Tighter spacing than current.
  2. **Stats row** — the four `Stat` components from current hero (2,000+ Grants, 141+ Scholarships, 12 Live sources, 0% Upfront), grouped into a single `grid-cols-4` row with thin vertical dividers between cells.
  3. **Honest pre-launch line** — single-line lockup: `Pre-launch · Be one of our first 100 wins.` styled as a small banner with a `bg-accent-soft` left-border accent.
- All three sub-bands separated by `border-t border-rule/60` thin rules.

**A11y.** Stats use `<dl>`/`<dt>`/`<dd>` semantic markup (already in `Stat`).

### 4.4 How It Works  ← MODIFY `HowItWorksStep.tsx`

**Currently:** Three steps rendered with `imageSrc` props pointing to gray placeholder webps. Visually weak.

**Spec.**
- Drop the `imageSrc` / `imageAlt` props entirely. The placeholder webp pattern is retired.
- Replace each step's image side with a small inline mockup — the same `HeroPreview`-style chrome but smaller (`max-w-[380px]`). Each mockup illustrates the step:
  - **01 (Index):** A "Source pipeline" mockup showing 12 source names (Grants.gov, SAM.gov, NIH Reporter, NSF, SBIR, USDA, DOE, Knight, Gates, Coca-Cola, Foundation Directory, State) flowing into a single timestamped index.
  - **02 (Match):** A "Ranked matches" mockup — 3–4 grants with scores 94/88/91/82, eligibility chip ("Eligible") on each.
  - **03 (Draft against rubric):** A "Rubric + draft" mockup — left column with criteria (`Specific Aims`, `Innovation`, `Approach`, `Investigator`, `Environment`) and a checkmark column, right column with a draft preview.
- Section background stays white. Steps reveal on viewport entry via `useReveal()`.
- The numbered "01 / 02 / 03" eyebrow stays — it's the navigation anchor.

### 4.5 Alternating feature sections  ← NEW `FeatureSection.tsx` (wrapper)

**Spec.**
- Five alternating sections, all rendered via a single `FeatureSection` component that takes a `tint` enum (1–5), an `eyebrow`, `headline`, `body`, `link`, and a `mockup` child.
- Layout: `grid-cols-1 lg:grid-cols-2 gap-12 items-center`. Odd sections place text on the left; even sections reverse.
- Container: rounded-2xl, padded `p-10 lg:p-14`, with the section's `--section-tint-N` gradient background and the matching 8%-opacity accent border.
- Inner mockup: white surface (`HeroPreview`-style chrome) with the standard depth shadow.
- Spacing between sections: `py-8` per section + `gap-y-12` between containers. Generous but not loose.

**The five sections.**
1. **Discovery** (tint 1, accent-blue). Mockup = ranked match list with scores. CTA: "See how matching works →".
2. **Smart Fill** (tint 2, success-green). Mockup = rubric panel + draft preview, lifted from the existing `SmartFillProof.tsx` pattern. CTA: "Watch Smart Fill draft →".
3. **Score prediction** (tint 3, amber). Mockup = an `Predicted score · 91 / 100` panel with a horizontal bar chart of criterion-by-criterion subscores. CTA: "See score breakdown →".
4. **Batch submission** (tint 4, purple). Mockup = a checkbox list of 12 scholarships with "Submit selected (8) →" button. CTA: "Apply to many at once →".
5. **Success-fee billing** (tint 5, rose). Mockup = a billing panel showing "Grant won: NSF SBIR ($275,000)" → "Success fee: 4% ($11,000)" → "Net to you: $264,000." Headline emphasizes "$0 upfront, ever." CTA: "See pricing →".

**Reveal motion.** Each section fades up (`translate-y: 16px → 0`, `opacity: 0 → 1`) on viewport entry. Threshold = 0.2.

### 4.6 Comparison / pricing  ← NEW `ComparisonSection.tsx` + `PricingCards.tsx`

**Spec — comparison table.**
- Three-column table: **GrantPilot** | **Consultants ($5K–$15K/app)** | **Subscribe-up-front competitors**.
- Rows: Upfront cost, Time to draft first app, Predicted score before submit, Cancel anytime, 21-day free trial, Pay only on win, Number of opportunities indexed.
- GrantPilot column has soft `bg-accent-soft` highlight. Consultant column gets a subtle red tint on negatives. Competitor column is neutral.
- Each row checkmark/cross uses lucide `<Check>` / `<X>` icons.

**Spec — pricing cards.**
- Three cards: **Free** ($0, 8% success fee), **Pro** ($79/mo, 4% success fee), **Organization** ($249/mo, 2% success fee). Match the JSON-LD pricing structure already in `page.tsx:28–33`.
- Card chrome: rounded-2xl, `border-rule`, white background, generous padding. The middle (Pro) card has a marine border + small "Most popular" pill at top, indicating recommended tier.
- Each card lists 5–7 features with lucide check icons. Bottom of each card has its CTA button — Free has secondary style, Pro and Organization have primary.

**A11y.** Comparison table uses real `<table>` semantics. Pricing cards are `<article>` with proper headings.

### 4.7 Pre-launch panel  ← NEW `PreLaunchPanel.tsx` (replaces testimonials section)

**Spec.**
- Full-width section, soft success-tinted container (`linear-gradient(180deg, #F0FDF4 0%, #FAFEFB 100%)`).
- Single centered statement: `Pre-launch · Be one of our first 100 wins.`
- Below the headline, a one-line subhead: `We're building in the open. Your story replaces this section the moment we have permission to tell it.`
- Subtle CTA: `Join the launch list →` linking to `/signup`. (If a dedicated waitlist endpoint exists by execution time, swap the target then — do not block on it.)
- No fake avatars, no fake quotes, no invented numbers.

**Rhythm note.** This panel exists where competitors put their "Trusted by 12,000 customers" testimonial grids. We use the same vertical slot to make an honest early-mover statement. Cheaper to ship, harder to fake.

### 4.8 FAQ  ← MODIFY `EditorialFAQ.tsx`

**Currently:** Native `<details>` accordion, minimal styling.

**Spec.**
- Keep the native `<details>` semantics — better a11y than a custom accordion.
- Wrap each FAQ row in a glass surface: `bg-white/60`, `backdrop-blur-sm`, `border border-rule/50`, rounded-xl.
- Stagger the rows vertically with `gap-y-3`.
- Animated chevron rotation on open/close: 240ms `--ease-out`.
- The 7 existing FAQ items in `page.tsx:44–69` stay verbatim.

### 4.9 Final CTA banner  ← NEW `CtaBanner.tsx` (replaces `page.tsx:161–171`)

**Spec.**
- Full-bleed (escape the container) marine gradient: `linear-gradient(135deg, #0066CC 0%, #1a73e8 60%, #2563EB 100%)`.
- Centered content, max-width `max-w-3xl`.
- Eyebrow: `Ready when you are` (white, uppercase, tracking-widest).
- Headline: `Find the grant you'd almost have given up on.` (existing copy, white, large display weight).
- Subhead: `No credit card · 21-day free trial · 0% upfront.`
- Primary CTA button: white background, marine text, rounded-lg, prominent.
- Subtle radial highlight at center-bottom of the banner (`radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.15), transparent 70%)`) for depth.

**A11y.** White text on the gradient must pass WCAG AA. `#0066CC` background + `#FFFFFF` text = 5.9:1 (AA pass for normal text, AAA for large text). Verify at darkest end of the gradient.

### 4.10 Premium footer  ← MODIFY `EditorialFooter.tsx`

**Currently:** Single horizontal nav row. Minimal.

**Spec.**
- 4-column grid (`lg:grid-cols-4`, stacks on mobile):
  - **Product:** Pricing · For organizations · For students · API · Status
  - **Resources:** Grant index · Scholarship index · Blog · Help center · Smart Fill rubric
  - **Company:** About · Careers · Press · Contact
  - **Legal:** Trust · Privacy · Terms · Security · DPA
- Above the columns: brand block on the left (`GrantPilot` wordmark + tagline) + email capture on the right (`Get one curated grant in your inbox each week`). Email capture is a simple `<form>` with an input + button; the actual subscription endpoint is out of scope for v2 (form `action=""` placeholder for follow-up phase).
- Below the columns: bottom row with copyright, social icons (lucide: `<Twitter>`, `<Linkedin>`, `<Github>`), and the existing light/dark toggle.
- All link targets check existence in `app/`. Where a route doesn't exist yet, add as `disabled` link with a `title="Coming soon"` — do not add fake pages.

---

## 5. Component inventory

### KEEP — used as-is or with minimal patches
- `EditorialShell.tsx` — wrapper, no change.
- `EditorialCTA.tsx` — used by hero and CTA banner.
- `SmallCapsEyebrow.tsx` — used by nav, trust bar, sections.
- `HowItWorksStep.tsx` — keep the structure, but the `imageSrc`/`imageAlt` props get removed and the image slot becomes a children prop (a mockup component).
- `Stat.tsx` (inline in `EditorialHero.tsx`, line 226) — extract to its own file `src/components/landing/Stat.tsx` so the trust bar can use it.
- `EditorialFAQ.tsx` — keep `<details>` semantics, add glass surface chrome.
- `DropCap.tsx`, `PullQuote.tsx`, `SignatureBlock.tsx`, `SignatureMark.tsx` — currently editorial typography primitives, retain for any long-form pages (not used in v2 landing). Out of scope to touch.

### MODIFY
- `EditorialNav.tsx` — sticky + transparent + scrolled-state frosted glass + 3 nav links + real CTA button.
- `EditorialHero.tsx` — shrink to just hero grid + `FloatingScoreCard`; remove the strips that are migrating to other sections (trust bar, pre-launch panel).
- `EditorialFooter.tsx` — 4-column premium layout + email capture + social icons + bottom row.

### RETIRE — remove imports/usage from `page.tsx`
- `FoundersNote.tsx` — already not imported; keep the file (might be useful later in an `/about` page) but no usage in v2 landing.
- `RotatingMatchProof.tsx` — currently unused per brief. Stay unused. Don't delete; might be useful elsewhere.

### NEW — to be created in `src/components/landing/`
- `FloatingScoreCard.tsx` — the hero overlay (Section 4.2 / 2.3).
- `TrustBar.tsx` — consolidated trust strip + stats + pre-launch line (Section 4.3).
- `FeatureSection.tsx` — alternating wrapper with `tint` prop (Section 4.5).
- `DiscoveryMockup.tsx`, `SmartFillMockup.tsx`, `ScorePredictionMockup.tsx`, `BatchSubmissionMockup.tsx`, `BillingMockup.tsx` — the 5 inline mockups for feature sections.
- `HowItWorksMockup1.tsx`, `HowItWorksMockup2.tsx`, `HowItWorksMockup3.tsx` — the 3 inline mockups replacing the placeholder webps in `HowItWorksStep`.
- `ComparisonSection.tsx` — the comparison table.
- `PricingCards.tsx` — the 3-tier pricing cards.
- `PreLaunchPanel.tsx` — replaces the testimonials section.
- `CtaBanner.tsx` — the marine-gradient final CTA banner.

### NEW — `src/lib/landing/`
- `useReveal.ts` — `IntersectionObserver`-based reveal hook used by sections that fade up on scroll.

---

## 6. Token additions

Add to `src/app/globals.css` under `[data-theme="editorial"]`:

```css
[data-theme="editorial"] {
  /* Motion curves */
  --ease-soft: cubic-bezier(0.32, 0.72, 0, 1);
  --dur-reveal: 520ms;

  /* Section pastel tints (Feature sections, Block 3) */
  --section-tint-1: linear-gradient(180deg, #F0F7FF 0%, #F5FBFF 100%);
  --section-tint-2: linear-gradient(180deg, #F0FDF4 0%, #F7FCF8 100%);
  --section-tint-3: linear-gradient(180deg, #FEF7E0 0%, #FFFBED 100%);
  --section-tint-4: linear-gradient(180deg, #F5F3FF 0%, #FAF8FF 100%);
  --section-tint-5: linear-gradient(180deg, #FDF2F8 0%, #FEF7FB 100%);
  --section-border-1: rgba(0, 102, 204, 0.08);
  --section-border-2: rgba(21, 128, 61, 0.08);
  --section-border-3: rgba(180, 83, 9, 0.08);
  --section-border-4: rgba(124, 58, 237, 0.08);
  --section-border-5: rgba(190, 24, 93, 0.08);

  /* Pre-launch panel */
  --panel-prelaunch: linear-gradient(180deg, #F0FDF4 0%, #FAFEFB 100%);

  /* Final CTA banner */
  --gradient-cta-banner: linear-gradient(135deg, #0066CC 0%, #1a73e8 60%, #2563EB 100%);

  /* Glass surfaces */
  --glass-bg: rgba(255, 255, 255, 0.70);
  --glass-blur: 10px;
  --glass-border: rgba(15, 23, 42, 0.06);
}
```

Update tailwind config (`tailwind.config.ts` or `app/globals.css` if using Tailwind v4 inline) to expose these as utilities where needed. The exact mechanism is determined in writing-plans, not here.

**Dark mode coverage.** The existing `[data-theme="editorial"]:not([data-theme-mode="light"])` and `[data-theme="editorial"][data-theme-mode="dark"]` blocks in `globals.css:784–810` override the core palette for dark mode. The new tokens above must also have dark-mode overrides — for example, the section tints become darker translucent surfaces, the CTA banner gradient becomes a deeper marine, and glass-bg shifts to `rgba(15, 23, 42, 0.55)`. Writing-plans must produce exact dark-mode values for every new token; the spec only commits to "dark mode parity exists" as a constraint.

---

## 7. Motion strategy (consolidated)

- **Library:** none. CSS + `IntersectionObserver`.
- **Hook:** `useReveal()` (see `src/lib/landing/useReveal.ts`).
- **Reveal pattern:**
  ```tsx
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      data-reveal={visible ? "visible" : "hidden"}
      className="reveal"
    >...</div>
  );
  ```
- **CSS:**
  ```css
  [data-theme="editorial"] .reveal[data-reveal="hidden"] {
    opacity: 0;
    transform: translateY(16px);
  }
  [data-theme="editorial"] .reveal[data-reveal="visible"] {
    opacity: 1;
    transform: translateY(0);
    transition: opacity var(--dur-reveal) var(--ease-soft),
                transform var(--dur-reveal) var(--ease-soft);
  }
  @media (prefers-reduced-motion: reduce) {
    [data-theme="editorial"] .reveal[data-reveal] {
      opacity: 1;
      transform: none;
      transition: none;
    }
  }
  ```
- **Threshold:** 0.2 (section is "visible" once 20% of it enters viewport).
- **Hover transitions** stay on `--dur-fast --ease-out` per the existing pattern in `EditorialFooter.tsx:40` and elsewhere.

---

## 8. Accessibility budget (WCAG 2.2 AA)

- **Contrast.**
  - Body text `#1a1a1a` on `#FFFFFF` = 18.5:1 (AAA).
  - Secondary text `#6B7280` on `#FFFFFF` = 4.83:1 (AA).
  - Marine accent `#0066CC` on `#FFFFFF` = 5.93:1 (AA).
  - White text on marine gradient at darkest stop `#0066CC` = 5.93:1 (AA). Verify at every gradient stop including `#2563EB` end (4.78:1 — passes for large text only; **headlines must be ≥ 18.66px bold or 24px regular** to comply on the CTA banner).
- **Keyboard.** All interactive elements (nav links, CTA buttons, FAQ summaries, pricing card CTAs, email capture, social icons, theme toggle) must be focusable in DOM order. Focus rings use existing `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent` pattern.
- **Reduced motion.** All reveal animations short-circuit. Hover transitions remain (they are not motion-triggering in the WCAG sense).
- **Semantic structure.** One `<h1>` (hero). Sections use `<section>` with `aria-labelledby` pointing at their `<h2>`. Comparison uses real `<table>`. FAQ uses `<details>`/`<summary>`. Pricing uses `<article>`. Footer uses `<footer>` with column `<nav>` elements labeled via `aria-label`.
- **Screen reader.** Floating overlay card (`FloatingScoreCard`) is `aria-hidden="true"` — it's a decorative visualization, not new information.

---

## 9. Performance budget (Web Vitals)

| Metric | Target | Notes |
|---|---|---|
| **LCP** | < 2.5s | The LCP element will be the hero headline (`<h1>` in `EditorialHero`). Above-the-fold content must not depend on JS for rendering. `HeroPreview` is server-rendered inline (no async data, no client-only effects). |
| **CLS** | < 0.1 | `FloatingScoreCard` overlay is positioned absolutely — must have explicit `width`/`height` reservations on the preview container to prevent layout shift when it mounts. Hero stats row reserves space for all 4 stat cells from the first paint. |
| **INP** | < 200ms | Reveal hook uses passive observers. FAQ accordion uses native `<details>` (zero JS for open/close). Nav scroll-state transition uses CSS only — no `scroll` listener. |
| **Bundle delta** | + 0 KB of new motion/animation libraries | CSS-only motion. `lucide-react` icons stay tree-shaken (only `Check`, `X`, `Twitter`, `Linkedin`, `Github` get imported). |

If a metric regresses below target on a Vercel preview, the responsible block ships behind a feature flag (or doesn't ship) until fixed.

---

## 10. Out of scope (explicit)

The following are **explicitly NOT in v2**:

- Anything outside `[data-theme="editorial"]`. Dashboards, `/app/*`, auth flows, billing UI, the matching engine, the Smart Fill backend.
- **JSON-LD structured data** at `page.tsx:19–42` stays unchanged. It describes the product (SoftwareApplication, offers, featureList), not the page layout. Pricing-card text must still reflect the same 4 offers ($0 Free, $9.99 Student Pro, $79 Pro, $249 Organization) per spec §12.1, but the JSON-LD itself is not edited as part of v2.
- Real product screenshots. We are not capturing the live product UI in this round.
- Real testimonials. The pre-launch panel replaces the section until 3+ named, permissioned testimonials exist.
- Founder attribution anywhere.
- Framer Motion / GSAP / Lottie / any animation library install.
- A working email-capture endpoint. The footer email form has a placeholder action; wiring is a separate phase.
- A working mobile nav drawer/sheet. The 3 nav links collapse on mobile but no drawer is built in v2.
- An `/about`, `/careers`, `/press`, `/blog`, or any other new route. Footer links to routes that don't exist yet are marked `disabled`.
- Internationalization, RTL, alternate locales.
- A/B testing infrastructure. The redesign ships as the new default.

---

## 11. Open dependencies & sequencing

The brief proposed 7 blocks. Refining with the spec:

| Block | Sections | Depends on | Ship gate |
|---|---|---|---|
| **Block 1 — Page chrome** | 4.1 Nav, 4.10 Footer, 4.9 CTA banner, token additions (§6) | nothing | tsc clean + visual baseline updated |
| **Block 2 — Hero polish** | 4.2 Hero (FloatingScoreCard, strip removals) | Block 1 (token additions) | Lighthouse LCP < 2.5s |
| **Block 3 — Trust bar** | 4.3 TrustBar consolidation | Block 2 (hero strip removals) | visual baseline |
| **Block 4 — How It Works** | 4.4 inline mockups (3) | nothing | visual baseline |
| **Block 5 — Feature sections** | 4.5 FeatureSection wrapper + 5 inline mockups | Block 1 (token additions) | longest block; ship behind a feature flag if half-done |
| **Block 6 — Comparison + Pricing** | 4.6 ComparisonSection, PricingCards | nothing | visual baseline |
| **Block 7 — Pre-launch + FAQ polish** | 4.7 PreLaunchPanel, 4.8 FAQ glass surfaces | nothing | visual baseline |
| **Block 8 — Motion sweep** | `useReveal` hook, reveal CSS, applied to all sections | all visual blocks | reduced-motion verified |

Block 1 unblocks Blocks 2, 3, 5. Blocks 4, 6, 7 are independent and parallelizable. Block 8 is last so reveal animations can be tuned against finished content.

---

## 12. Out-of-spec questions surfaced during write-up

Flagging these so they don't get silently invented in `writing-plans`:

1. **Free plan default vs Student Pro on pricing cards.** The JSON-LD lists "Free, Student Pro ($9.99), Pro ($79), Organization ($249)" — 4 tiers. The pricing cards spec proposes 3 (Free, Pro, Organization). Student Pro is omitted because it's a student-only tier and the landing serves both audiences. **Decision needed:** show 3 generic tiers, or split landing into per-audience views, or show 4 cards. Recommend 3 (status quo).
2. **Comparison table — "Subscribe-up-front competitors" naming.** Is there a specific competitor we're calling out, or is this a category? Recommend keeping it categorical to avoid trademark issues.
3. **Email capture endpoint.** If user has a preferred provider (Resend, Loops, ConvertKit), we can wire it later. Out of scope for v2 markup. **Decision needed:** stub or no email-capture form at all in v2.
4. **Social links in footer — actual handles.** Need real URLs for Twitter/LinkedIn/GitHub. Recommend leaving as TODOs marked in code until handles are confirmed.

---

## 13. Carried constraints checklist

A copy of the constraints from the brief and earlier sessions, to verify before merge:

- [ ] No founder attribution anywhere
- [ ] No fake testimonials, fake stats, invented social proof, or placeholder customer logos
- [ ] No dashboard or app-surface changes
- [ ] All changes scoped under `[data-theme="editorial"]`
- [ ] Roboto for body, Geist Mono for numerals only
- [ ] Zeffy palette baseline preserved
- [ ] No new motion library installed
- [ ] All Lighthouse Web Vitals at or below targets on Vercel preview
- [ ] Visual regression baselines updated
- [ ] vitest + Playwright e2e still green

---

## 14. Next step

After user approval of this spec, transition to `superpowers:writing-plans` to produce a block-by-block implementation plan with atomic-commit targets. Implementation will then run under `superpowers:subagent-driven-development` with `frontend-design` skill engaged per Block, and `gsd-ui-review` runs as the final gate before merge.
