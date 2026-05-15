# Landing Page Editorial Pivot — Design Spec

**Date:** 2026-05-15
**Status:** Design approved, awaiting implementation plan
**Author:** NEXUS-PRIME / Coach Phillips
**Scope:** `src/app/page.tsx` and supporting components only. Dashboards out of scope.

---

## 1. Problem

The current landing page is the textbook 2024 AI-SaaS template: slate-950 background, emerald→teal→cyan gradient, glass-blur cards, lucide icons in 4-card grids, gradient-shimmer headline, fade-in-up motion cascades. It just received an "A+ overhaul" four weeks ago, yet it cannot read as differentiated because **every direct competitor uses the same visual language**. The ceiling on "more polish" is low.

GrantPilot has two assets that ought to be the brand:

1. **A real founder with a story** — Coach Phillips, financial coach at FSC/WALP, building this because he watched families fail to afford grant consultants
2. **Honest pricing** — success-fee model (pay only when you win), inverted from every competitor's upfront SaaS subscription

Both are buried. The redesign promotes them.

## 2. Decision

**Editorial pivot.** Move from "AI startup" visual register to "magazine column / personal letter" register. Concrete shifts:

- Light theme primary (warm cream), dark mode preserved as secondary
- Serif display face (Fraunces) for headlines, Geist Sans body, Geist Mono for numerical proof
- One signature visual element (the compass-G mark already shipped, with a slowly rotating needle) instead of decorative icons across every section
- Asymmetric 12-column grids; everything left-aligned; mark bleeds intentionally past viewport edge
- Information architecture cut from 12 sections to 6
- Founder note promoted from position 9 to position 2
- Motion reduced to one ambient element + state-change hover transitions; no entrance animations

The bet: differentiation + brand equity over incremental SaaS polish.

## 3. Information Architecture

| # | Section | Job | Source |
|---|---|---|---|
| 1 | Hero | Make the promise, show the signature visual, one CTA | Reframed asymmetric layout |
| 2 | Founder Note | The moat — promoted to position 2 | "Why We Built This" rewritten as personal letter with drop cap and signature |
| 3 | How It Works | Three steps, image-led | Absorbs old "How It Works" + "Three Things That Matter" + the data-source logo bar |
| 4 | Smart Fill in 30 Seconds | Proof of product | Existing Smart Fill Showcase, tightened. Hero of the section is an **annotated screenshot of the actual Smart Fill flow** (not a generic "app frame" illustration) — captured at 2× from the live product, AVIF/WebP encoded ≤140KB, with 2–3 callout pins indicating the 3-round auto-optimize step |
| 5 | Pricing — only when you win | Honest pricing as differentiation | Pricing Preview with the GrantPilot-vs-Traditional comparison folded inline |
| 6 | FAQ + Close | Objections + one CTA | Current FAQ merged with Final CTA; Secondary CTA deleted |

**Cuts:** Logo bar (folds into How It Works step 1), The Problem (absorbed into Founder Note), Comparison section (one inline pricing line), Three Things That Matter (duplicates How It Works), Secondary CTA (redundant).

**Section detail asymmetry (intentional).** Hero (§5) and Founder Note (§6) are spec'd to pixel detail because they carry the editorial pivot. How It Works, Smart Fill, Pricing, and FAQ inherit the visual system from §4 but their internal micro-layouts (step alternation pattern, mockup cropping, pricing table structure) are deliberately sketched here and resolved during implementation planning. The planner should treat that as a small design pass, not a full re-brainstorm.

## 4. Visual System

### Typography

| Role | Face | Notes |
|---|---|---|
| Display | **Fraunces** (Google Fonts variable, free) | Variable axes (soft/wonk/opsz) carry the whole display range without buying more fonts. |
| Body | **Geist Sans** (already loaded) | No change. Neutral pairing under a strong display face. |
| Mono | **Geist Mono** (already loaded) | Reserved for figures: "2–5% on win," "141+ scholarships," "$50K–$2M." Numbers carry data-density signal. |

**Type scale (clamped fluid):**

```
display-xl   clamp(48px, 8vw, 96px)   Fraunces 400, tracking -0.03em, leading 1.02
display-lg   clamp(36px, 5vw, 64px)   Fraunces 400, tracking -0.02em, leading 1.05
display-md   clamp(28px, 3.5vw, 44px) Fraunces 500, tracking -0.015em, leading 1.1
body-lg      18px / 28px              Geist Sans 400
body         16px / 26px              Geist Sans 400
body-sm      14px / 22px              Geist Sans 400
caption      13px / 18px              Geist Sans 500, tracking 0.04em, UPPERCASE
mono-num     inherit                  Geist Mono 500, tabular-nums
```

Three display tiers + three body tiers replace the current page's ~8 ad-hoc heading sizes.

### Color tokens

| Token | Light (primary) | Dark (alt) | Use |
|---|---|---|---|
| `--bg` | `#F8F5EE` warm cream | `#0E1714` deep ink | Page background |
| `--surface` | `#FFFFFF` | `#15201C` | Cards |
| `--ink` | `#181614` warm near-black | `#F4EFE4` warm cream | Body text |
| `--ink-2` | `#5E5A52` warm gray | `#A8A29A` | Secondary text |
| `--rule` | `#E6E1D5` | `#283330` | Hairlines, dividers |
| `--accent` | `#0B5A3F` deep emerald-ink | `#34D399` brighter emerald | CTA, founder signature, signature mark |
| `--accent-soft` | `#E3F2EA` | `#0B3329` | Tinted card backgrounds |

Key shift: emerald becomes an *ink*, not a glow. Glow is AI-startup; ink is editorial. Dark mode keeps the brighter emerald to fight a dark surface.

### Surface treatment

- **Out:** glass blur, gradient backgrounds, neon glows, `bg-grid-pattern` overlay, floating colored blur blobs, scroll progress bar
- **In:** hairline borders (1px `--rule`), generous whitespace (96px section padding desktop / 80px mobile), occasional inset shadow on cards, one drop cap on the Founder Note

### Iconography

- `lucide-react` reserved for utility affordances only (chevrons, arrows, check)
- Decorative lucide icons across feature cards retired
- Two custom illustrative marks: (1) compass-G as the hero's animated element, (2) a letter/document mark in the founder signature block

## 5. Hero Treatment

### Desktop layout (≥1024px, 12-col grid, cream background)

- Eyebrow (small caps): `BUILT BY COACH PHILLIPS · EARLY ACCESS`, cols 1–6
- Headline (Fraunces display-xl, deep ink, no gradient): "Stop writing grants. Start winning them." — second line emphasized by *weight* 500 not color, cols 1–7
- Subhead (Geist Sans 18px on `--ink-2`, max 56ch): the current paragraph preserved verbatim — *"Tell us about your work once. We surface grants you actually qualify for, draft each section against the funder's rubric, and show you a score before you submit."* followed by the bold pricing line *"No upfront cost. We earn a small percentage only when you win."* (rendered as a `<span class="font-medium text-ink">` with `mt-3 block`). Cols 1–6.
- Primary CTA: `Start free` (deep emerald fill, no gradient, no glow, no scale-on-hover), cols 1–4
- Secondary text link: `Read the founder's note →` linking to `#founder`
- Founder signature: `— Coach Phillips, founder` (Fraunces italic 14px, `--accent`) under the CTA
- Signature mark (compass-G SVG): cols 8–12, ~480×480px, **bleeds intentionally past the right edge** of the section padding via `.hero-bleed` utility

### Mobile (<768px)

- Mark moves above headline, shrinks to ~200px, centered
- Headline stays left-aligned
- Everything else stacks
- Mark rotation slows or freezes (perf budget)

### Compass mark behavior

- Inline SVG (not `<img>`) so needle and body animate independently
- Needle rotates: 60s per revolution, `linear`, infinite
- `prefers-reduced-motion: reduce`: needle freezes pointing northeast
- Stroke 1.25px hairline; deep-emerald lines on cream; no glow, no shadow, no blur

### Hero deletes

- 4-card glass stat grid removed; the four numbers (2,000+ grants / 141+ scholarships / 12 sources / 0% cost) migrate to How It Works step 1 as contextual evidence
- Decorative background (grid overlay, blob blurs, scroll progress bar)
- Gradient shimmer
- All glass effects

## 6. Founder Note

### Position

Section 2 of 6 — immediately after the hero. Anchor: `#founder`. Hero secondary CTA points here.

### Layout

- Narrow single column, `max-width: 60ch` (~480px)
- Hairline rule top and bottom
- `py-32` desktop / `py-20` mobile

### Composition

- Eyebrow (small caps): `A NOTE FROM THE FOUNDER`
- Drop cap on the first letter — Fraunces 600, `font-size: 4.4em`, `line-height: 1`, `float: left`, `padding: 0.08em 0.12em 0 0`, color `--accent`. **Only drop cap on the entire page.** At <640px shrinks to 3 lines instead of 4.
- Body — Geist Sans 400, 18px / 30px (more leading than other body text), color `--ink`. First-line indent `1.5em` on paragraphs 2–5.
- One pull quote — Fraunces 400, 22px / 32px, italic, left border 1px `--accent`, padding-left 24px. No curly quotes (the rule is the quote).
- Signature block — optional 64×64 B&W headshot, name in small caps (matches eyebrow), role in Fraunces italic, scribbled signature SVG in `--accent` at opacity 0.5

### Copy direction (180 words ±10%)

1. Open with a concrete scene at FSC — a specific person, a specific moment
2. Name the structural unfairness in one line (becomes the pull quote)
3. What you tried first (manually helping clients hitting the wall of your own time)
4. What GrantPilot is, in two sentences — lowercase "we", small claims
5. Close with the inverted promise: "I built it so the platform only earns when you do"

**Hard rules:** First-person singular ("I"), not "we." No statistics. One concrete dollar amount (the $7K consultant fee or similar). Signs with real name, real title, real organization.

### Photo handling

Preferred: small (64×64) circular B&W headshot. Fallback: omit photo; signature mark alone is genuinely fine (New Yorker columnist byline convention).

## 7. Component Inventory

### Scoping strategy

The landing wraps in `<EditorialShell data-theme="editorial">`. Tokens are defined under `[data-theme="editorial"]` in `globals.css`, so Tailwind 4's `@theme inline` resolves `bg-bg` / `text-ink` / `border-rule` to editorial values only inside the shell. Dashboards stay on slate-950 tokens unchanged. **Zero dashboard blast radius.**

### New components — `src/components/landing/`

| Component | Used in | Lines (est.) |
|---|---|---|
| `EditorialShell` | Landing root | 30 |
| `EditorialNav` | Header | 80 |
| `EditorialHero` | Section 1 | 120 |
| `SignatureMark` | Hero, possibly footer | 60 |
| `EditorialSection` | Every content section | 30 |
| `SmallCapsEyebrow` | Every section opener | 15 |
| `FoundersNote` | Section 2 | 60 |
| `DropCap` | FoundersNote only | 20 |
| `PullQuote` | FoundersNote only | 20 |
| `SignatureBlock` | FoundersNote | 50 |
| `HowItWorksStep` | Section 3 | 80 |
| `SmartFillProof` | Section 4 | 100 |
| `EditorialFAQ` | Section 6 | 80 |
| `EditorialCTA` | CTAs across page | 30 |
| `EditorialFooter` | Footer | 100 |

Total ~875 lines across 15 files. `page.tsx` itself drops from 803 → ~200 lines (mostly composition).

### Reused as-is

`Link`, `Image`, `Script` for JSON-LD, `auth` server helper, Lucide icons (only for utility affordances — about 3 uses total).

### Out of scope (untouched)

`src/components/ui/*`, `src/components/dashboard/*`, `src/components/auto-apply/*`, `billing/*`, `subscription/*`, `brand/*`, `illustrations/*`, `providers/*`. Existing `globals.css` rules (`glass-card`, `bg-grid-pattern`, dashboard keyframes) stay defined; the landing simply stops referencing them.

### Tokens added to `globals.css`

```css
[data-theme="editorial"] {
  --bg: #F8F5EE;
  --surface: #FFFFFF;
  --ink: #181614;
  --ink-2: #5E5A52;
  --rule: #E6E1D5;
  --accent: #0B5A3F;
  --accent-soft: #E3F2EA;
}

@media (prefers-color-scheme: dark) {
  [data-theme="editorial"][data-theme-mode="auto"],
  [data-theme="editorial"][data-theme-mode="dark"] {
    --bg: #0E1714;
    --surface: #15201C;
    --ink: #F4EFE4;
    --ink-2: #A8A29A;
    --rule: #283330;
    --accent: #34D399;
    --accent-soft: #0B3329;
  }
}

[data-theme="editorial"] .hero-bleed {
  margin-right: calc(-1 * max(1rem, (100vw - 1280px) / 2 + 1.5rem));
}
```

Tailwind `@theme inline` block gains `--color-bg`, `--color-ink`, `--color-ink-2`, `--color-rule`, `--color-accent`, `--color-accent-soft`, `--color-surface`. Existing tokens stay untouched.

### Fonts

Fraunces added via `next/font/google` in `src/app/layout.tsx` with `subsets: ["latin"]`, `display: "swap"`, `axes: ["SOFT", "WONK", "opsz"]`, `adjustFontFallback: "Times New Roman"`. Exposed as `--font-fraunces`. Geist Sans + Geist Mono unchanged.

### Migration path

**Direct swap** preferred. Single PR rebuilds `page.tsx` and adds tokens; Vercel Preview lets us review pixel-by-pixel before merging. Rollback is `git revert`. ISR caching (`revalidate: 3600`) means production traffic only sees the new page after explicit merge.

## 8. Motion

### Principles

1. Restraint by default. No scroll-triggered entrance animations. Above-the-fold content renders immediately.
2. One moving element per viewport, maximum.
3. Hover = state change, not physics. Color and opacity shifts only. No scale, no translate, no shadow growth.
4. Slow durations on the one thing that moves (compass needle, 60s/rev).
5. `prefers-reduced-motion: reduce` is the *baseline design*, not a fallback.

### Motion budget (entire page)

| Motion | Duration | Easing |
|---|---|---|
| Compass needle rotation | 60s | `linear` |
| CTA hover (color shift) | 150ms | `ease-out` |
| Link hover (underline grow) | 200ms | `ease-out` |
| FAQ accordion expand | 250ms | `ease-out` (CSS `grid-template-rows: 0fr → 1fr`) |
| Image fade-in on load | 300ms | `ease-out` |
| In-page anchor scroll | n/a | `scroll-behavior: smooth` |

### Removed

`animate-fade-in-up` cascade on hero, `animate-text-shimmer` on headline, `hover:scale-[1.02] active:scale-[0.98]` on CTAs, `hover:shadow-emerald-500/40` glow growth, scroll progress bar at top, `pulse-glow`/`pulse-ring` references. Keyframes stay defined in `globals.css` for dashboards but unreferenced by editorial primitives.

### Easing + duration tokens

```css
--ease-out: cubic-bezier(0.25, 0.1, 0.25, 1);
--dur-fast: 150ms;
--dur-base: 250ms;
--dur-needle: 60000ms;
```

## 9. States, Edge Cases, Responsive

### Breakpoints

| Range | Layout |
|---|---|
| <640px | Single column; mark above headline at ~200px; founder column full-width 24px gutters; headshot inline above name |
| 640–1023px | Mostly stacked; founder column 60ch with auto margins; mark to right of headline at ~280px; no bleed |
| ≥1024px | Full 12-col grid; mark bleeds past viewport right edge; founder note centered at 60ch |
| ≥1280px | Identical to desktop; cream margins grow as viewport widens |

### Authentication states

| Visitor state | Hero primary CTA | Header CTA |
|---|---|---|
| Logged out | `Start free` → `/signup` | `Sign in` |
| Logged in | `Go to dashboard` → `/dashboard` or `/student` | `Dashboard` text link |
| Trial-active | Same as logged in | Add small caps eyebrow next to header: `TRIAL · {N} days left` |
| Past-due | Same as logged in | Add muted accent eyebrow: `PAYMENT NEEDED` linking `/dashboard/billing` |

### Color scheme

- Default: light (cream) under `[data-theme="editorial"]`
- `prefers-color-scheme: dark`: auto-applies dark tokens
- Manual toggle: footer text link, stores `theme-mode` in `localStorage`, applies `data-theme-mode` attribute
- Inline `<script>` in `<head>` reads localStorage before first paint to prevent cream flash on dark-mode visitors

### Motion preferences

`prefers-reduced-motion: reduce` → compass needle freezes pointing NE; `scroll-behavior: auto`. Color transitions stay (not "motion").

### Font loading

`display: swap` + Geist Sans fallback + Next's `adjustFontFallback: "Times New Roman"` so first paint is unblocked and CLS stays at 0. If Fraunces fails entirely, headlines render in Geist Sans — less editorial, still functional.

### Image loading

| Asset | Strategy |
|---|---|
| Compass mark | Inline SVG (no network), animated via CSS |
| Founder headshot | `next/image` lazy, `fetchPriority="low"`. Alt: `"Coach Phillips, founder of Family Source Center"`. Falls back to no-photo signature variant if missing. |
| Smart Fill mockup | `next/image` lazy, ≤140KB after compression, AVIF + WebP via Next's auto-format |
| OG/Twitter image regeneration | Out of scope; follow-up PR |

### No-JS resilience

Page renders server-side. Compass needle uses CSS only. FAQ uses native `<details>`. Theme toggle hidden when JS unavailable. Anchor scroll falls back to instant jump. **No-JS visitors see the editorial design intact.**

### Keyboard + screen reader

- Compass mark: `aria-hidden="true"`, `role="presentation"`
- Drop cap: via CSS `::first-letter` — transparent to assistive tech
- Pull quote: wrapped in `<blockquote>`
- All interactive elements: visible 2px focus ring in `--accent`, 2px offset
- Tab order: hero CTA → secondary link → `#founder` → nav items → footer
- Skip-to-content link in `EditorialShell`, visible on focus
- Single `<h1>` in hero, `<h2>` per section, no `<h3>` jumps

### Print stylesheet

```css
@media print {
  [data-theme="editorial"] {
    --bg: #ffffff; --ink: #000000; --accent: #000000; --rule: #000000;
  }
  [data-theme="editorial"] nav,
  [data-theme="editorial"] .hero-bleed,
  [data-theme="editorial"] footer { display: none; }
  [data-theme="editorial"] section { break-inside: avoid; }
}
```

Print "Coach's website" produces a clean B&W founder letter on white paper.

### Out of scope

RTL, i18n, 4K-specific layout, IE/legacy browsers, server error pages, animated OG image regeneration.

## 10. Testing + Validation

### Pre-merge gates

| Gate | Tool | Pass criteria |
|---|---|---|
| Mason Score | `/deploy-mason` → `/mason-audit` on Vercel Preview | ≥95 overall, zero critical violations |
| UX heuristic | `/deploy-ux` → `/ux-full-audit <url>` | All 7 PRISM-UX agents PASS or FLAG; zero BLOCKs |
| Accessibility | PRINCE-HALL + axe-core via Playwright | WCAG 2.2 AA on all pairs; AAA on body text; zero axe criticals |
| Lighthouse | `unlighthouse-ci` | Perf ≥95, A11y 100, SEO ≥95, Best Practices 100 |
| Core Web Vitals | Lighthouse + `web-vitals` | LCP ≤ current+200ms, **CLS = 0**, INP <200ms, TBT <200ms |
| Visual regression | Playwright `toHaveScreenshot` at 375×812, 1024×1366, 1920×1080 | Baseline captured; 0.1% pixel tolerance for future PRs |
| Copy review | `humanizer` skill | Zero hits against Wikipedia "signs of AI writing" patterns |
| Founder voice approval | User | Explicit "sounds like Coach actually wrote this" |
| Print stylesheet | Manual `Cmd+P` preview | Clean B&W one-pager |
| Keyboard pass | Manual tab-through | Correct tab order, visible focus rings everywhere |
| Screen reader pass | VoiceOver on Hero + Founder Note | Drop cap transparent; pull quote announced as blockquote; mark not announced |
| Code review | `superpowers:requesting-code-review` | All findings resolved or explicitly accepted |

### Mason Score pillar targets

| Pillar | Target | Why achievable |
|---|---|---|
| Geometry (25%) | 24/25 | 12-col grid consistent across every section |
| Spacing (25%) | 24/25 | Uniform py-32 / py-20 rhythm |
| Shape (15%) | 14/15 | Hairlines, rectangles, one circular headshot — no mixed-radius cards |
| Balance (15%) | 14/15 | Asymmetric grids that sum to 12 cols; balanced whitespace |
| Typography (10%) | 10/10 | Three display tiers + three body tiers; canonical pairing |
| Responsive (5%) | 5/5 | Three breakpoints, each tested |
| Harmony (5%) | 5/5 | Single accent color consistently used |
| Accessibility (separate) | 95+ | WCAG 2.2 AA, AAA body, reduced-motion respected |

**Target overall: 96+.** Current landing Mason Score captured as baseline at the start of execution.

### Plugins/skills involved

| Skill | Used for |
|---|---|
| `/deploy-mason` | Visual precision audit, Mason Score |
| `/deploy-ux` | PRISM-UX heuristic + flow + WCAG audit |
| `humanizer` | Strips AI writing signals from every copy block |
| `frontend-design` | Component implementation guidance |
| `superpowers:test-driven-development` | Components with logic only (Playwright tests, theme-toggle localStorage) |
| `superpowers:requesting-code-review` | Final review gate |
| `superpowers:verification-before-completion` | Confirm every checklist item |

### Post-launch tracking (7-day window)

Capture baseline numbers before redesign deploys.

| Metric | Acceptable | Rollback trigger |
|---|---|---|
| Signup conversion rate | Flat or up | Down >15% sustained over 5 of 7 days |
| Landing → /signup CTR | Flat or up | Down >20% sustained |
| Bounce rate | Flat or down | Up >25% sustained |
| Avg time on page | Up | Down >30% sustained |
| Production Lighthouse Perf | ≥90 sustained | Drops below 80 |

Editorial bet: higher-quality signups convert at higher rates downstream. **Raw signup rate down + trial-to-paid up = win, not regression.** Need both numbers before judging.

### Rollback path

Single-commit revert. `git revert <merge-commit-sha> && git push origin main`. Vercel auto-redeploys to previous landing within ~2 minutes. Editorial CSS tokens in `globals.css` stay defined (dormant); no dashboard impact.

### Definition of done

1. All pre-merge gates green
2. User approves Vercel Preview at three viewports
3. User approves founder note copy
4. Mason Score ≥95 attached to PR
5. Lighthouse report attached, no regression on LCP/CLS
6. PR merges to `main`
7. Production deploys
8. Day-0 baseline numbers captured
9. 7-day post-launch metrics check passes (or rollback decided)

## 11. Risks (consolidated)

| Risk | Mitigation |
|---|---|
| Fraunces TTFB / LCP impact | Preloaded with `display: swap`, `adjustFontFallback`, Geist Sans fallback. Verify CLS = 0 in Lighthouse. |
| Token scoping mistake (dashboard component dropped into editorial shell) | Dev-only `console.warn` if `data-theme="editorial"` not on a parent of an editorial primitive |
| "Feels static" complaint | Editorial bet — the same bet Stripe, Linear, Posthog make. Quiet pages read more premium for the right audience. |
| Drop cap on mobile breaks paragraph rhythm | At <640px shrinks to 3 lines instead of 4 |
| Performative founder voice | `humanizer` skill on every revision; user must affirm "sounds like Coach"; cap at 2 revision rounds before user writes directly |
| Coach Phillips uncomfortable with front-stage exposure | Confirm before final copy; design is reversible — demote to smaller "Why we built this" block lower on page if needed |
| Mason Score gate could block merge | Capture baseline early; fix structural issues; don't game the score |
| 7-day post-launch window thin for low traffic | Extend to 14 days if <500 visitors |
| Signature-mark bleed past viewport edge | Scoped `.hero-bleed` utility only on hero |
| Past-due eyebrow in nav reading subscription server-side | Already happens for the existing CTA branch — zero new cost |

## 12. Out of Scope (explicit non-goals)

- Dashboard redesign (org and student dashboards untouched)
- Marketing site pages beyond `/` (pricing, resources, trust, terms, privacy)
- Design system rationalization across the whole app
- RTL / i18n
- New UI primitives for dashboards (`Select`, `Combobox`, `Table`, `DropdownMenu`, etc.)
- OG / Twitter image regeneration
- A/B testing of editorial vs. current

These each warrant their own spec when their time comes.

## 13. Next Step

Hand off to `superpowers:writing-plans` to create the implementation plan: file-by-file build order, task breakdown, test gates per task, and the parallel-vs-sequential dependency graph.
