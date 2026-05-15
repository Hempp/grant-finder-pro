# Landing Editorial Pivot — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current dark-glass AI-SaaS landing page with an editorial pivot — light cream theme, Fraunces display, asymmetric grid, promoted founder note, single signature visual — scoped via `[data-theme="editorial"]` so dashboards stay unchanged.

**Architecture:** New components live in `src/components/landing/`, each one file with one responsibility. Tokens live in `src/app/globals.css` under `[data-theme="editorial"]` so Tailwind v4's `@theme inline` resolves editorial utilities only inside the shell. `src/app/page.tsx` is rebuilt as a thin composition. No dashboard files are touched.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, TypeScript, `next/font/google` for Fraunces, Vitest for pure-logic unit tests, Playwright for e2e + visual-regression.

**Reference spec:** `docs/plans/2026-05-15-landing-editorial-pivot-design.md`

**Testing reality of this codebase:** There is no `@testing-library/react` and no convention of component-level unit tests. Visual components are validated through Playwright e2e + visual regression. Pure helpers go in `src/lib/` with Vitest tests in `src/lib/__tests__/`. The plan honors that — TDD steps appear only where they make sense.

---

## File Structure

### Files to create

| Path | Responsibility |
|---|---|
| `src/lib/theme-mode.ts` | Pure helper: read/write `theme-mode` from localStorage, resolve "auto" against `prefers-color-scheme` |
| `src/lib/__tests__/theme-mode.test.ts` | Vitest unit tests for the helper |
| `public/theme-init.js` | Pre-paint inline script that reads `theme-mode` from localStorage and sets `data-theme-mode` on `<html>` before first paint |
| `src/components/landing/EditorialShell.tsx` | Wraps page in `data-theme="editorial"`, sets `--font-fraunces` class, applies cream bg |
| `src/components/landing/EditorialNav.tsx` | Hairline-bottom nav, state-aware eyebrow for trial/past-due, no glass |
| `src/components/landing/EditorialHero.tsx` | Asymmetric 12-col hero with signature mark bleed |
| `src/components/landing/SignatureMark.tsx` | Inline SVG compass-G with rotating needle, reduced-motion aware |
| `src/components/landing/EditorialSection.tsx` | Standard top/bottom hairline + section padding rhythm |
| `src/components/landing/SmallCapsEyebrow.tsx` | UPPERCASE tracking-0.16em label primitive |
| `src/components/landing/FoundersNote.tsx` | Composed founder section using DropCap + PullQuote + SignatureBlock |
| `src/components/landing/DropCap.tsx` | First-letter treatment via `::first-letter` CSS — single use on page |
| `src/components/landing/PullQuote.tsx` | Left-rule blockquote, italic, no curly quotes |
| `src/components/landing/SignatureBlock.tsx` | Headshot (optional) + name + role + scribble SVG |
| `src/components/landing/HowItWorksStep.tsx` | Image-left / text-right alternating step |
| `src/components/landing/SmartFillProof.tsx` | Annotated product-screenshot proof layout |
| `src/components/landing/EditorialFAQ.tsx` | List-style FAQ using native `<details>` |
| `src/components/landing/EditorialCTA.tsx` | Deep-emerald fill button, no gradient/glow/scale |
| `src/components/landing/EditorialFooter.tsx` | Quieter footer + theme toggle link |
| `src/components/landing/index.ts` | Barrel export |
| `src/components/landing/assets/compass-mark.svg` | Reference SVG; the SignatureMark component inlines the markup |
| `e2e/landing-editorial.spec.ts` | New e2e + visual-regression suite for the rebuilt landing |

### Files to modify

| Path | Change |
|---|---|
| `src/app/layout.tsx` | Add `Fraunces` import, expose `--font-fraunces`, load `/theme-init.js` via `next/script` with `strategy="beforeInteractive"` |
| `src/app/globals.css` | Add `[data-theme="editorial"]` token blocks (light + dark), `--ease-out` / `--dur-*` tokens, `.hero-bleed` utility, `@theme inline` registrations, `@media print` block |
| `src/app/page.tsx` | Full rebuild as a composition of editorial primitives (~200 lines down from 803) |
| `e2e/landing.spec.ts` | Extend the existing smoke test with structural assertions (the existing assertion on `/Stop writing grants/i` still passes since the wording is preserved) |

### Files explicitly untouched

`src/components/ui/*`, `src/components/dashboard/*`, `src/components/auto-apply/*`, `billing/*`, `subscription/*`, `brand/*`, `illustrations/*`, `providers/*`, every page under `/dashboard/*`, every page under `/student/*`. Existing `globals.css` rules (`glass-card`, `bg-grid-pattern`, dashboard keyframes) stay defined; the landing simply stops referencing them.

---

## Phase 0 — Baseline Capture

### Task 1: Capture pre-redesign baselines

**Files:**
- Create: `docs/plans/2026-05-15-landing-baseline.md`

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: server on `http://localhost:3000`. Leave running for the next two steps.

- [ ] **Step 2: Capture current Lighthouse baseline**

Run: `npx unlighthouse --site http://localhost:3000 --output-path ./lighthouse-baseline`
Expected: HTML report opens. Note the four scores (Performance, Accessibility, Best Practices, SEO) and the three Web Vitals (LCP, CLS, INP).

- [ ] **Step 3: Capture current screenshots at three viewports**

```bash
mkdir -p docs/plans/baseline-screenshots
npx playwright screenshot --full-page --viewport-size=375,812 http://localhost:3000 docs/plans/baseline-screenshots/landing-mobile.png
npx playwright screenshot --full-page --viewport-size=1024,1366 http://localhost:3000 docs/plans/baseline-screenshots/landing-tablet.png
npx playwright screenshot --full-page --viewport-size=1920,1080 http://localhost:3000 docs/plans/baseline-screenshots/landing-desktop.png
```

- [ ] **Step 4: Record baseline numbers**

Create `docs/plans/2026-05-15-landing-baseline.md`:

```markdown
# Landing Pre-Redesign Baseline (2026-05-15)

## Lighthouse (localhost dev — production will be higher)
- Performance: [SCORE]
- Accessibility: [SCORE]
- Best Practices: [SCORE]
- SEO: [SCORE]

## Core Web Vitals
- LCP: [VALUE]
- CLS: [VALUE]
- INP: [VALUE]

## Screenshots
- docs/plans/baseline-screenshots/landing-mobile.png
- docs/plans/baseline-screenshots/landing-tablet.png
- docs/plans/baseline-screenshots/landing-desktop.png

## Mason Score (run via `/deploy-mason` → `/mason-audit http://localhost:3000`)
- Overall: [SCORE]
- Geometry: [SCORE]/25
- Spacing: [SCORE]/25
- Shape: [SCORE]/15
- Balance: [SCORE]/15
- Typography: [SCORE]/10
- Responsive: [SCORE]/5
- Harmony: [SCORE]/5
- Accessibility: [SCORE]/100

Captured before the editorial pivot redesign.
```

- [ ] **Step 5: Commit baseline**

```bash
git add docs/plans/2026-05-15-landing-baseline.md docs/plans/baseline-screenshots
git commit -m "$(cat <<'EOF'
docs(landing): capture pre-redesign baseline

Lighthouse, Web Vitals, Mason Score, and three-viewport screenshots
of the current landing for post-redesign comparison.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 1 — Foundation: Fonts, Tokens, Shell

### Task 2: Add Fraunces font to layout.tsx

**Files:**
- Modify: `src/app/layout.tsx:1-19`

- [ ] **Step 1: Update font imports**

In `src/app/layout.tsx`, replace lines 2-19 with:

```typescript
import { Geist, Geist_Mono, Fraunces } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: true,
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
  adjustFontFallback: "Times New Roman",
});
```

- [ ] **Step 2: Apply the Fraunces variable to `<body>`**

Find line 93-95 and change `${geistSans.variable} ${geistMono.variable}` to:

```typescript
className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased`}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build completes; `next/font` reports Fraunces in the build output; no font-loading errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "$(cat <<'EOF'
feat(landing): load Fraunces variable font

Fraunces (Google Fonts variable, 400/500/600 + italic) for the
editorial display tier. Exposed as --font-fraunces.
adjustFontFallback to Times New Roman keeps CLS at 0 during swap.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 3: Add editorial CSS tokens to globals.css

**Files:**
- Modify: `src/app/globals.css` (append between the existing token block and the reduced-motion block at the bottom)

- [ ] **Step 1: Add the editorial token blocks**

Append to `src/app/globals.css`:

```css
/* ============================================
   EDITORIAL THEME — landing-only token scope
   ============================================
   Activated by data-theme="editorial" on a parent
   (set by <EditorialShell>). Dashboard surfaces
   keep the original :root tokens unchanged. */

[data-theme="editorial"] {
  --bg: #F8F5EE;
  --surface: #FFFFFF;
  --ink: #181614;
  --ink-2: #5E5A52;
  --rule: #E6E1D5;
  --accent: #0B5A3F;
  --accent-soft: #E3F2EA;

  --ease-out: cubic-bezier(0.25, 0.1, 0.25, 1);
  --dur-fast: 150ms;
  --dur-base: 250ms;
  --dur-needle: 60000ms;
}

@media (prefers-color-scheme: dark) {
  [data-theme="editorial"]:not([data-theme-mode="light"]) {
    --bg: #0E1714;
    --surface: #15201C;
    --ink: #F4EFE4;
    --ink-2: #A8A29A;
    --rule: #283330;
    --accent: #34D399;
    --accent-soft: #0B3329;
  }
}

[data-theme="editorial"][data-theme-mode="dark"] {
  --bg: #0E1714;
  --surface: #15201C;
  --ink: #F4EFE4;
  --ink-2: #A8A29A;
  --rule: #283330;
  --accent: #34D399;
  --accent-soft: #0B3329;
}
```

Note: `data-theme-mode` is set on `<html>` by the prepaint script in Task 5. The cascade flows through to the inner `[data-theme="editorial"]` wrapper because attribute selectors don't care about depth.

- [ ] **Step 2: Register editorial colors in the Tailwind `@theme inline` block**

Find the existing `@theme inline { ... }` block (around line 26) and add inside it:

```css
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-ink: var(--ink);
  --color-ink-2: var(--ink-2);
  --color-rule: var(--rule);
  --color-accent: var(--accent);
  --color-accent-soft: var(--accent-soft);
  --font-display: var(--font-fraunces);
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build completes; no PostCSS or Tailwind errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "$(cat <<'EOF'
feat(landing): add editorial theme CSS tokens

Adds [data-theme="editorial"] scoped tokens. Light primary (cream bg,
deep emerald-ink accent), dark auto-applied via prefers-color-scheme
unless [data-theme-mode="light"] is explicitly set. Tailwind @theme
inline picks them up as bg-bg/text-ink/border-rule/text-accent utilities.
Original :root tokens untouched, so dashboards stay on slate-950
with zero diff.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 4: Add hero-bleed utility + print stylesheet

**Files:**
- Modify: `src/app/globals.css` (append after the editorial tokens block)

- [ ] **Step 1: Add the hero-bleed utility and print rules**

Append:

```css
/* Hero compass mark intentionally extends past the right edge of the
   container — editorial layout convention. Scoped so it never
   affects dashboards. */
[data-theme="editorial"] .hero-bleed {
  margin-right: calc(-1 * max(1rem, (100vw - 1280px) / 2 + 1.5rem));
}

@media print {
  [data-theme="editorial"] {
    --bg: #ffffff;
    --ink: #000000;
    --accent: #000000;
    --rule: #000000;
  }
  [data-theme="editorial"] nav,
  [data-theme="editorial"] .hero-bleed,
  [data-theme="editorial"] footer { display: none; }
  [data-theme="editorial"] section { break-inside: avoid; }
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build completes.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "$(cat <<'EOF'
feat(landing): add hero-bleed utility and print stylesheet

.hero-bleed lets the compass mark extend past the right container
edge. Print stylesheet strips nav/footer/bleed and renders the
founder note as a clean B&W one-pager — scoped to
[data-theme="editorial"] only.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 5: Create theme-init prepaint script

**Files:**
- Create: `public/theme-init.js`
- Modify: `src/app/layout.tsx` (load via `next/script` with `strategy="beforeInteractive"`)

This script runs before first paint to apply the stored theme-mode preference. Prevents cream-flash on dark-mode visitors who saved `theme-mode=dark`.

- [ ] **Step 1: Create the static script in public/**

Create `public/theme-init.js`:

```javascript
(function () {
  try {
    var m = localStorage.getItem("theme-mode");
    if (m === "dark" || m === "light") {
      document.documentElement.setAttribute("data-theme-mode", m);
    }
  } catch (e) {
    /* private browsing or storage disabled — fall through to system pref */
  }
})();
```

- [ ] **Step 2: Wire it into the root layout**

In `src/app/layout.tsx`, add the `next/script` import near the top:

```typescript
import Script from "next/script";
```

Then add the `<Script>` inside the root component, immediately after the opening `<html lang="en">` tag and before `<body>`. The full return block becomes:

```typescript
return (
  <html lang="en">
    <Script src="/theme-init.js" strategy="beforeInteractive" />
    <body
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased`}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-emerald-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>
      <SessionProvider>{children}</SessionProvider>
    </body>
  </html>
);
```

`strategy="beforeInteractive"` ensures Next.js inlines the script before hydration so the attribute lands before paint.

- [ ] **Step 3: Verify no hydration errors**

Run: `npm run dev`. Open `http://localhost:3000`. Open DevTools → Application → Local Storage → `localhost:3000`, manually set `theme-mode` to `dark`, reload. Verify `<html>` carries `data-theme-mode="dark"` from the start; no cream flash before paint.

- [ ] **Step 4: Commit**

```bash
git add public/theme-init.js src/app/layout.tsx
git commit -m "$(cat <<'EOF'
feat(landing): prepaint theme-mode init script

public/theme-init.js reads theme-mode from localStorage and sets
data-theme-mode on <html> before first paint. Loaded via next/script
with strategy="beforeInteractive" so Next inlines it ahead of
hydration. Empty-catch guards against localStorage being unavailable.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 6: Pure helper `theme-mode.ts` + Vitest tests

**Files:**
- Create: `src/lib/theme-mode.ts`
- Test: `src/lib/__tests__/theme-mode.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/theme-mode.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getStoredThemeMode,
  setStoredThemeMode,
  resolveEffectiveMode,
} from "../theme-mode";

describe("theme-mode helper", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    const store: Record<string, string> = {};
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
    });
  });

  it("returns 'auto' when nothing is stored", () => {
    expect(getStoredThemeMode()).toBe("auto");
  });

  it("returns the stored value when valid", () => {
    localStorage.setItem("theme-mode", "dark");
    expect(getStoredThemeMode()).toBe("dark");
  });

  it("returns 'auto' when stored value is invalid", () => {
    localStorage.setItem("theme-mode", "garbage");
    expect(getStoredThemeMode()).toBe("auto");
  });

  it("persists a valid mode and returns it", () => {
    setStoredThemeMode("light");
    expect(localStorage.getItem("theme-mode")).toBe("light");
    expect(getStoredThemeMode()).toBe("light");
  });

  it("removes the key when given 'auto'", () => {
    localStorage.setItem("theme-mode", "dark");
    setStoredThemeMode("auto");
    expect(localStorage.getItem("theme-mode")).toBeNull();
  });

  it("resolveEffectiveMode returns stored when stored is explicit", () => {
    expect(resolveEffectiveMode("light", true)).toBe("light");
    expect(resolveEffectiveMode("light", false)).toBe("light");
    expect(resolveEffectiveMode("dark", true)).toBe("dark");
    expect(resolveEffectiveMode("dark", false)).toBe("dark");
  });

  it("resolveEffectiveMode follows system when stored is 'auto'", () => {
    expect(resolveEffectiveMode("auto", true)).toBe("dark");
    expect(resolveEffectiveMode("auto", false)).toBe("light");
  });

  it("survives localStorage throwing (private browsing)", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
      removeItem: () => {
        throw new Error("denied");
      },
    });
    expect(() => getStoredThemeMode()).not.toThrow();
    expect(getStoredThemeMode()).toBe("auto");
    expect(() => setStoredThemeMode("dark")).not.toThrow();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/lib/__tests__/theme-mode.test.ts`
Expected: FAIL — `Cannot find module '../theme-mode'`.

- [ ] **Step 3: Implement the helper**

Create `src/lib/theme-mode.ts`:

```typescript
export type ThemeMode = "light" | "dark" | "auto";

const STORAGE_KEY = "theme-mode";
const VALID: ReadonlySet<ThemeMode> = new Set(["light", "dark", "auto"]);

function safeRead(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function safeWrite(value: string | null): void {
  try {
    if (value === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, value);
    }
  } catch {
    /* private browsing / disabled — silent */
  }
}

export function getStoredThemeMode(): ThemeMode {
  const v = safeRead();
  if (v === "light" || v === "dark") return v;
  return "auto";
}

export function setStoredThemeMode(mode: ThemeMode): void {
  if (!VALID.has(mode)) return;
  if (mode === "auto") {
    safeWrite(null);
    return;
  }
  safeWrite(mode);
}

export function resolveEffectiveMode(
  stored: ThemeMode,
  prefersDark: boolean
): "light" | "dark" {
  if (stored === "light" || stored === "dark") return stored;
  return prefersDark ? "dark" : "light";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/__tests__/theme-mode.test.ts`
Expected: PASS — all assertions green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/theme-mode.ts src/lib/__tests__/theme-mode.test.ts
git commit -m "$(cat <<'EOF'
feat(landing): theme-mode helper with vitest tests

getStoredThemeMode / setStoredThemeMode / resolveEffectiveMode — all
safe against localStorage throwing in private browsing. 'auto' removes
the key rather than storing the literal, so the prepaint script
doesn't waste a branch on it.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 7: Build EditorialShell component

**Files:**
- Create: `src/components/landing/EditorialShell.tsx`

- [ ] **Step 1: Write the component**

```typescript
import { ReactNode } from "react";

/**
 * Wraps the landing page in data-theme="editorial" so editorial
 * tokens activate. Dashboards are NOT wrapped — they keep the
 * original :root tokens.
 */
export function EditorialShell({ children }: { children: ReactNode }) {
  return (
    <div
      data-theme="editorial"
      className="min-h-screen bg-bg text-ink font-sans antialiased"
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors related to the new file.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/EditorialShell.tsx
git commit -m "$(cat <<'EOF'
feat(landing): EditorialShell scopes the editorial theme

Drops a data-theme="editorial" boundary around the landing tree so
Tailwind utilities resolve to editorial tokens inside, and original
tokens outside. Zero dashboard impact.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 8: Build SmallCapsEyebrow + EditorialSection

**Files:**
- Create: `src/components/landing/SmallCapsEyebrow.tsx`
- Create: `src/components/landing/EditorialSection.tsx`

- [ ] **Step 1: SmallCapsEyebrow**

```typescript
import { ReactNode } from "react";

export function SmallCapsEyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[13px] font-medium tracking-[0.16em] uppercase text-ink-2 ${className}`}
    >
      {children}
    </p>
  );
}
```

- [ ] **Step 2: EditorialSection**

```typescript
import { ReactNode } from "react";

export function EditorialSection({
  children,
  variant = "default",
  id,
  className = "",
}: {
  children: ReactNode;
  variant?: "default" | "plain";
  id?: string;
  className?: string;
}) {
  const ruleClasses =
    variant === "plain" ? "" : "border-t border-b border-rule";
  return (
    <section
      id={id}
      className={`${ruleClasses} py-20 md:py-32 ${className}`}
    >
      <div className="container mx-auto px-4 sm:px-6">{children}</div>
    </section>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/SmallCapsEyebrow.tsx src/components/landing/EditorialSection.tsx
git commit -m "$(cat <<'EOF'
feat(landing): SmallCapsEyebrow and EditorialSection primitives

SmallCapsEyebrow is the section-opener label. EditorialSection
enforces py-20 md:py-32 rhythm and hairline top/bottom rules
(omitted via variant='plain' for hero and founder note which carry
their own framing).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 2 — Hero

### Task 9: Create compass-mark SVG asset

**Files:**
- Create: `src/components/landing/assets/compass-mark.svg`

The compass-G mark exists from the `1515c73` brand commit. Author a hairline 1.25px-stroke variant with the needle as a separate `<g id="needle">` group.

- [ ] **Step 1: Locate the existing compass logo**

Run: `git show 1515c73 --stat`
Expected: list of files added in the brand commit; find SVG paths.

Run: `find . -name "*.svg" -path "*brand*" -o -name "compass*.svg" 2>/dev/null | head`
Expected: paths to existing compass artwork.

- [ ] **Step 2: Author the hero variant**

Create `src/components/landing/assets/compass-mark.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="240" cy="240" r="220"/>
  <line x1="240" y1="20" x2="240" y2="44"/>
  <line x1="240" y1="436" x2="240" y2="460"/>
  <line x1="20" y1="240" x2="44" y2="240"/>
  <line x1="436" y1="240" x2="460" y2="240"/>
  <circle cx="240" cy="240" r="160"/>
  <!-- G letterform path — REPLACE the placeholder d="..." below with the
       exact path data from the existing compass-G logo found in Step 1.
       If the existing logo cannot be located, ask the user to provide
       the SVG path data before committing. -->
  <path d="M 220 180 a 60 60 0 1 0 60 60 H 250"/>
  <g id="needle" style="transform-origin: 240px 240px;">
    <polygon points="240,80 252,240 240,260 228,240" fill="currentColor" stroke="none"/>
    <polygon points="240,400 228,240 240,260 252,240" fill="none" stroke="currentColor"/>
  </g>
</svg>
```

- [ ] **Step 3: Preview to confirm rendering**

Run: `open src/components/landing/assets/compass-mark.svg`
Expected: ring, ticks, needle visible.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/assets/compass-mark.svg
git commit -m "$(cat <<'EOF'
feat(landing): hairline compass-mark SVG reference

A 1.25px-stroke variant of the brand compass-G for the editorial
hero. Needle wrapped in <g id="needle"> so CSS can rotate it without
spinning the G letterform. The SignatureMark component inlines this
markup so the path data should match.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 10: Build SignatureMark component

**Files:**
- Create: `src/components/landing/SignatureMark.tsx`

- [ ] **Step 1: Write the component**

```typescript
/**
 * Inline compass-G with a 60s linear rotation on the needle <g>.
 * prefers-reduced-motion freezes the needle pointing northeast — a
 * deliberate "found something" position.
 */
export function SignatureMark({
  size = 480,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`text-accent ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 480 480"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        width="100%"
        height="100%"
      >
        <circle cx={240} cy={240} r={220} />
        <line x1={240} y1={20} x2={240} y2={44} />
        <line x1={240} y1={436} x2={240} y2={460} />
        <line x1={20} y1={240} x2={44} y2={240} />
        <line x1={436} y1={240} x2={460} y2={240} />
        <circle cx={240} cy={240} r={160} />
        {/* G letterform — must match compass-mark.svg path data */}
        <path d="M 220 180 a 60 60 0 1 0 60 60 H 250" />
        <g
          id="needle"
          style={{
            transformOrigin: "240px 240px",
            animation: "spin-needle 60s linear infinite",
          }}
        >
          <polygon
            points="240,80 252,240 240,260 228,240"
            fill="currentColor"
            stroke="none"
          />
          <polygon
            points="240,400 228,240 240,260 252,240"
            fill="none"
            stroke="currentColor"
          />
        </g>
        <style>{`
          @keyframes spin-needle {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @media (prefers-reduced-motion: reduce) {
            #needle {
              animation: none;
              transform: rotate(45deg);
            }
          }
        `}</style>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/SignatureMark.tsx
git commit -m "$(cat <<'EOF'
feat(landing): SignatureMark — inline compass-G with rotating needle

60s linear rotation on the needle <g>, deep-accent color from the
editorial theme, hairline 1.25px strokes. prefers-reduced-motion
freezes the needle pointing northeast — the static state looks like
the compass has 'found something.'

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 11: Build EditorialCTA component

**Files:**
- Create: `src/components/landing/EditorialCTA.tsx`

- [ ] **Step 1: Write the component**

```typescript
import Link from "next/link";
import { ReactNode } from "react";

export function EditorialCTA({
  href,
  variant = "primary",
  children,
  className = "",
}: {
  href: string;
  variant?: "primary" | "secondary";
  children: ReactNode;
  className?: string;
}) {
  if (variant === "secondary") {
    return (
      <Link
        href={href}
        className={`text-ink hover:text-accent transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 bg-accent text-surface px-7 py-3.5 font-medium tracking-tight hover:bg-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
    >
      {children}
    </Link>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/EditorialCTA.tsx
git commit -m "$(cat <<'EOF'
feat(landing): EditorialCTA — primary fill + secondary text link

Color-only hover transition (150ms ease-out). No transform, no
shadow physics. Bg becomes --ink on hover so the button reads as
"this is the action" without springiness.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 12: Build EditorialNav component

**Files:**
- Create: `src/components/landing/EditorialNav.tsx`

- [ ] **Step 1: Write the component**

```typescript
import Link from "next/link";
import { SmallCapsEyebrow } from "./SmallCapsEyebrow";

interface NavSubscriptionState {
  loggedIn: boolean;
  destinationHref: string;
  trialDaysLeft?: number;
  pastDue?: boolean;
}

export function EditorialNav({ state }: { state: NavSubscriptionState }) {
  return (
    <nav className="border-b border-rule">
      <div className="container mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-ink">
          <span className="font-display text-xl">GrantPilot</span>
        </Link>
        <div className="flex items-center gap-6">
          {state.pastDue && (
            <SmallCapsEyebrow className="text-accent">
              <Link href="/dashboard/billing">Payment needed</Link>
            </SmallCapsEyebrow>
          )}
          {state.trialDaysLeft !== undefined && !state.pastDue && (
            <SmallCapsEyebrow>
              Trial · {state.trialDaysLeft} days left
            </SmallCapsEyebrow>
          )}
          {state.loggedIn ? (
            <Link
              href={state.destinationHref}
              className="text-ink-2 hover:text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-ink-2 hover:text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/EditorialNav.tsx
git commit -m "$(cat <<'EOF'
feat(landing): EditorialNav with state-aware eyebrows

Hairline-bottom nav. State eyebrow surfaces 'Trial · N days left'
for trial users and 'Payment needed' linking /dashboard/billing for
past-due — a credit-line treatment instead of a banner.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 13: Build EditorialHero component

**Files:**
- Create: `src/components/landing/EditorialHero.tsx`

- [ ] **Step 1: Write the component**

```typescript
import { SmallCapsEyebrow } from "./SmallCapsEyebrow";
import { SignatureMark } from "./SignatureMark";
import { EditorialCTA } from "./EditorialCTA";

export function EditorialHero({
  primaryCtaHref,
  primaryCtaLabel,
}: {
  primaryCtaHref: string;
  primaryCtaLabel: string;
}) {
  return (
    <section
      id="main-content"
      className="container mx-auto px-4 sm:px-6 pt-12 pb-20 md:pt-20 md:pb-32 lg:pt-28 lg:pb-40 overflow-hidden"
    >
      <div className="grid grid-cols-12 gap-6 items-center">
        <div className="col-span-12 md:col-span-7 lg:col-span-7">
          <SmallCapsEyebrow className="mb-6">
            Built by Coach Phillips · Early Access
          </SmallCapsEyebrow>
          <h1 className="font-display font-normal text-[clamp(48px,8vw,96px)] leading-[1.02] tracking-[-0.03em] text-ink mb-8">
            Stop writing grants.
            <br />
            <span className="font-medium">Start winning them.</span>
          </h1>
          <p className="text-[18px] leading-[1.55] text-ink-2 max-w-[56ch] mb-10">
            Tell us about your work once. We surface grants you actually
            qualify for, draft each section against the funder&apos;s rubric,
            and show you a score before you submit.
            <span className="block mt-3 font-medium text-ink">
              No upfront cost. We earn a small percentage only when you win.
            </span>
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <EditorialCTA href={primaryCtaHref}>{primaryCtaLabel}</EditorialCTA>
            <EditorialCTA href="#founder" variant="secondary">
              Read the founder&apos;s note →
            </EditorialCTA>
          </div>
          <p className="mt-8 font-display italic text-[14px] text-accent">
            — Coach Phillips, founder
          </p>
        </div>
        <div className="col-span-12 md:col-span-5 lg:col-span-5 hero-bleed flex justify-center md:justify-end order-first md:order-last">
          <SignatureMark
            size={480}
            className="w-[200px] md:w-[280px] lg:w-[480px]"
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Visual sanity check (temporary)**

Edit `src/app/page.tsx` to render only `<EditorialShell><EditorialHero primaryCtaHref="/signup" primaryCtaLabel="Start free" /></EditorialShell>` and run `npm run dev`. Visit `http://localhost:3000` at desktop and mobile widths to confirm the layout. Revert `page.tsx` before committing — the real rewrite is Task 27.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/EditorialHero.tsx
git commit -m "$(cat <<'EOF'
feat(landing): EditorialHero — asymmetric 12-col grid

Headline cols 1-7, signature mark cols 8-12 with .hero-bleed past
the right viewport edge. Mobile order swaps mark above headline at
~200px. Headline keeps the existing copy verbatim — weight emphasis
instead of gradient on the second line.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 3 — Founder Note

### Task 14: Build DropCap component

**Files:**
- Create: `src/components/landing/DropCap.tsx`

- [ ] **Step 1: Write the component**

```typescript
import { ReactNode } from "react";

/**
 * Single-use drop cap. ::first-letter pseudo so screen readers
 * read the paragraph unchanged. 4 lines desktop, 3 lines at <640px.
 */
export function DropCap({ children }: { children: ReactNode }) {
  return (
    <p className="editorial-dropcap">
      {children}
      <style>{`
        .editorial-dropcap::first-letter {
          font-family: var(--font-fraunces), Georgia, serif;
          font-weight: 600;
          color: var(--accent);
          float: left;
          line-height: 1;
          padding: 0.08em 0.12em 0 0;
          font-size: 4.4em;
        }
        @media (max-width: 640px) {
          .editorial-dropcap::first-letter { font-size: 3.4em; }
        }
      `}</style>
    </p>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/DropCap.tsx
git commit -m "$(cat <<'EOF'
feat(landing): DropCap — single-use editorial first-letter

::first-letter so screen readers read paragraph normally. Fraunces
600 in --accent. 4 lines desktop, 3 lines at <640px so paragraph
rhythm survives narrow widths.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 15: Build PullQuote component

**Files:**
- Create: `src/components/landing/PullQuote.tsx`

- [ ] **Step 1: Write the component**

```typescript
import { ReactNode } from "react";

export function PullQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="my-10 pl-6 border-l border-accent">
      <p className="font-display italic text-[22px] leading-[1.45] text-ink">
        {children}
      </p>
    </blockquote>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/PullQuote.tsx
git commit -m "$(cat <<'EOF'
feat(landing): PullQuote — left-rule blockquote

1px --accent left border, Fraunces italic 22px. No curly quotes —
the rule is the quote. Wrapped in <blockquote> for screen readers.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 16: Build SignatureBlock component

**Files:**
- Create: `src/components/landing/SignatureBlock.tsx`

- [ ] **Step 1: Write the component**

```typescript
import Image from "next/image";
import { SmallCapsEyebrow } from "./SmallCapsEyebrow";

/**
 * Closing element of the founder note. Optional headshot,
 * name in small caps, role in Fraunces italic, scribble mark in
 * --accent. Falls back to no-photo if headshotSrc is omitted.
 */
export function SignatureBlock({
  name,
  role,
  headshotSrc,
  headshotAlt,
}: {
  name: string;
  role: string;
  headshotSrc?: string;
  headshotAlt?: string;
}) {
  return (
    <div className="mt-10 flex items-center gap-4">
      {headshotSrc && (
        <Image
          src={headshotSrc}
          alt={headshotAlt ?? `${name}, ${role}`}
          width={64}
          height={64}
          className="rounded-full grayscale"
          loading="lazy"
          fetchPriority="low"
        />
      )}
      <div className="flex-1">
        <SmallCapsEyebrow>{name}</SmallCapsEyebrow>
        <p className="font-display italic text-[16px] text-ink-2 mt-1">
          {role}
        </p>
        <div className="mt-2 text-accent opacity-50">
          <svg
            viewBox="0 0 160 48"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            width={80}
            height={24}
            aria-hidden="true"
          >
            <path d="M 8 32 C 18 18, 32 12, 44 22 S 64 38, 76 28 S 96 12, 110 24 S 134 38, 152 28" />
            <path d="M 28 38 L 36 38" />
          </svg>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/SignatureBlock.tsx
git commit -m "$(cat <<'EOF'
feat(landing): SignatureBlock — name, role, optional headshot, scribble

64x64 circular B&W headshot when provided; falls back to name+role+
scribble alone. Inline scribble SVG inherits --accent without an
import.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 17: Build FoundersNote with placeholder copy

**Files:**
- Create: `src/components/landing/FoundersNote.tsx`

- [ ] **Step 1: Write the component**

```typescript
import { SmallCapsEyebrow } from "./SmallCapsEyebrow";
import { DropCap } from "./DropCap";
import { PullQuote } from "./PullQuote";
import { SignatureBlock } from "./SignatureBlock";

export function FoundersNote() {
  return (
    <section
      id="founder"
      className="border-t border-b border-rule py-20 md:py-32"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-[60ch] mx-auto">
          <SmallCapsEyebrow className="mb-12">
            A note from the founder
          </SmallCapsEyebrow>

          <div className="text-[18px] leading-[1.7] text-ink">
            <DropCap>
              When I started coaching families at the Family Source Center,
              the same thing kept happening. A nonprofit director would walk
              in, eligible for a grant that could save their program, and
              walk out because the $7,000 consultant fee made it impossible
              to even apply.
            </DropCap>

            <p className="mt-6 indent-[1.5em]">
              I watched it for two years. The grants that mattered most went
              to the organizations that could afford to chase them, not the
              ones that needed them most.
            </p>

            <PullQuote>
              Grants don&apos;t go to the most deserving. They go to whoever
              can afford to apply.
            </PullQuote>

            <p className="mt-6 indent-[1.5em]">
              I tried to fix it the only way I knew — sitting with clients
              after hours, walking through eligibility, drafting their first
              draft. It worked, and it didn&apos;t scale. One coach can do
              one application at a time.
            </p>

            <p className="mt-6 indent-[1.5em]">
              GrantPilot is the tool I built to keep doing that work without
              being in the room. It finds the grants you qualify for, drafts
              each section against the funder&apos;s rubric, and shows you a
              predicted score before you submit.
            </p>

            <p className="mt-6 indent-[1.5em]">
              I built it so the platform only earns when you do. No upfront
              fee, no monthly retainer you can&apos;t afford. If you
              don&apos;t win, we don&apos;t either.
            </p>
          </div>

          <SignatureBlock
            name="Coach Phillips"
            role="Founder · Family Source Center"
          />
        </div>
      </div>
    </section>
  );
}
```

This is **placeholder draft copy** that satisfies the spec's hard rules (first-person singular, one concrete dollar amount, no statistics, signed with real name/role). Task 18 replaces it with humanizer-passed, user-approved copy. Do NOT skip Task 18.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/FoundersNote.tsx
git commit -m "$(cat <<'EOF'
feat(landing): FoundersNote section with placeholder copy

180-word personal letter at 60ch measure with drop cap, pull quote,
and signature block. Copy is a working draft following the spec's
voice rules; final copy ships in the next commit via the humanizer pass.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 18: Author final founder-note copy with humanizer

**Files:**
- Modify: `src/components/landing/FoundersNote.tsx` (paragraph text only)

Interactive task — copy revision needs the user in the loop. Do not skip.

- [ ] **Step 1: Invoke the humanizer skill**

Run: `/humanizer` and paste the placeholder copy from `FoundersNote.tsx`. Apply corrections.

- [ ] **Step 2: Present revised copy to the user**

Ask: "Does this sound like Coach actually wrote it? (Three rounds max; if not landing by round 3, you write it directly.)"

- [ ] **Step 3: Iterate up to two more rounds**

Each round: re-run humanizer, present, ask. Hard cap at round 3.

- [ ] **Step 4: Replace paragraph text in FoundersNote.tsx**

Update only the text inside `<DropCap>`, `<PullQuote>`, and the four `<p>` elements. Markup and classes unchanged.

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/FoundersNote.tsx
git commit -m "$(cat <<'EOF'
copy(landing): finalize founder-note copy

Copy revised via humanizer and approved by user as sounding like
Coach Phillips wrote it. Paragraph structure and markup unchanged —
only the text inside DropCap, PullQuote, and the four <p> elements
updated.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 4 — Remaining Sections

### Task 19: Mini design checkpoint for sections 3-5

**Files:** none — interactive design pass

The spec covers Hero and Founder Note in pixel detail and leaves How It Works, Smart Fill, and Pricing as outlines. Resolve open questions interactively before building.

- [ ] **Step 1: Confirm or adjust the defaults below with the user**

**How It Works (3 steps, image-led, alternating direction):**
- Step 1 — "We index the funders" — short paragraph naming Grants.gov, SAM.gov, NIH, NSF, SBIR plus the inline numerical proof (2,000+ grants, 12 live sources, 141+ scholarships, 0% cost until you win). Image: schematic of source flow.
- Step 2 — "We match what you'd actually win" — eligibility filter + matchScore engine. Image: match-score UI screenshot. Layout reversed.
- Step 3 — "We draft against the rubric" — Smart Fill's rubric mapping + 3-round auto-optimize. Image: side-by-side of rubric criteria → draft section.

**Smart Fill in 30 Seconds:**
- Headline: "From RFP to ready-to-submit in under a minute."
- Body: one short paragraph naming the rubric-mapping + auto-optimize behavior.
- Visual: annotated screenshot of the real Smart Fill flow, ≤140KB WebP, 2–3 callout pins indicating the 3-round step.

**Pricing — only when you win:**
- Eyebrow: "Pricing"
- Headline: "You only pay when you win."
- Body: "Compared to grant consultants who charge $5K–$15K per application, we earn 2–5% on a win — and nothing if you don't."
- CTA: "See full pricing →" → `/pricing`.

- [ ] **Step 2: Capture user's adjustments here**

Append a `### Decisions captured at Task 19` subsection inline with whatever the user confirms or changes.

- [ ] **Step 3: No commit — these decisions feed into Tasks 20–22**

### Task 20: Build HowItWorksStep component

**Files:**
- Create: `src/components/landing/HowItWorksStep.tsx`

- [ ] **Step 1: Write the component**

```typescript
import { ReactNode } from "react";
import Image from "next/image";

export function HowItWorksStep({
  number,
  title,
  body,
  imageSrc,
  imageAlt,
  reverse = false,
}: {
  number: string; // "01", "02", "03"
  title: string;
  body: ReactNode;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-12 gap-6 items-center py-12 ${
        reverse ? "md:[&>*:first-child]:order-last" : ""
      }`}
    >
      <div className="col-span-12 md:col-span-6">
        <p className="font-display text-[44px] text-accent leading-none mb-4">
          {number}
        </p>
        <h3 className="font-display text-[clamp(28px,3.5vw,44px)] leading-[1.1] text-ink mb-4">
          {title}
        </h3>
        <div className="text-[16px] leading-[1.625] text-ink-2 max-w-[52ch]">
          {body}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6">
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={640}
          height={480}
          className="w-full h-auto"
          loading="lazy"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/HowItWorksStep.tsx
git commit -m "$(cat <<'EOF'
feat(landing): HowItWorksStep — image-led numbered step

Big editorial step number in --accent + Fraunces, headline in display-md,
body in body, image alongside. reverse prop swaps order for alternating layout.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 21: Capture Smart Fill product screenshot

**Files:**
- Create: `public/landing/smart-fill-mockup.webp`

- [ ] **Step 1: Capture from the live product**

Run: `npm run dev` if not already running. Navigate to a real Smart Fill flow on the org dashboard. Capture a 2× DPI screenshot of the rubric-mapping view using your OS screenshot tool.

- [ ] **Step 2: Compress to WebP, ≤140KB**

```bash
mkdir -p public/landing
# Using cwebp (install via brew install webp if needed):
cwebp -q 75 -o public/landing/smart-fill-mockup.webp /path/to/raw-screenshot.png
```

Or `npx @squoosh/cli --webp '{"quality":75}' -d public/landing /path/to/raw-screenshot.png`.

- [ ] **Step 3: Verify size**

Run: `ls -lh public/landing/smart-fill-mockup.webp`
Expected: ≤140KB.

- [ ] **Step 4: Commit**

```bash
git add public/landing/smart-fill-mockup.webp
git commit -m "$(cat <<'EOF'
asset(landing): Smart Fill product screenshot

2x DPI screenshot of the real rubric-mapping view from a live draft.
WebP encoded, ≤140KB. Used as visual proof in the Smart Fill section.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 22: Build SmartFillProof component

**Files:**
- Create: `src/components/landing/SmartFillProof.tsx`

- [ ] **Step 1: Write the component**

```typescript
import Image from "next/image";
import { SmallCapsEyebrow } from "./SmallCapsEyebrow";

export function SmartFillProof() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-20 md:py-32">
      <div className="grid grid-cols-12 gap-6 items-center">
        <div className="col-span-12 md:col-span-5">
          <SmallCapsEyebrow className="mb-6">
            Smart Fill in 30 seconds
          </SmallCapsEyebrow>
          <h2 className="font-display text-[clamp(36px,5vw,64px)] leading-[1.05] tracking-[-0.02em] text-ink mb-6">
            From RFP to ready-to-submit in under a minute.
          </h2>
          <p className="text-[16px] leading-[1.625] text-ink-2 max-w-[52ch]">
            Smart Fill reads the complete RFP or scholarship prompt, maps
            every scoring criterion to your organization&apos;s data, drafts
            each section, and auto-optimizes up to three rounds until every
            criterion scores maximum points. You see what changed, why, and
            how it maps to the rubric.
          </p>
        </div>
        <div className="col-span-12 md:col-span-7">
          <Image
            src="/landing/smart-fill-mockup.webp"
            alt="Smart Fill rubric-mapping view, with each section of the draft annotated with its rubric criterion and predicted score."
            width={960}
            height={720}
            className="w-full h-auto rounded-sm shadow-[0_1px_0_#FFF_inset,0_1px_2px_rgba(20,16,8,0.04)]"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/SmartFillProof.tsx
git commit -m "$(cat <<'EOF'
feat(landing): SmartFillProof section with annotated mockup

Asymmetric 5/7 split — copy left, product screenshot right. Subtle
editorial inset shadow on the image. Alt text names the
rubric-mapping concept so the section reads meaningfully to screen
readers.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 23: Build EditorialFAQ component

**Files:**
- Create: `src/components/landing/EditorialFAQ.tsx`

- [ ] **Step 1: Write the component**

```typescript
import { SmallCapsEyebrow } from "./SmallCapsEyebrow";

interface FAQItem {
  q: string;
  a: string;
}

export function EditorialFAQ({ items }: { items: FAQItem[] }) {
  return (
    <section
      id="faq"
      className="border-t border-rule py-20 md:py-32"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-[60ch] mx-auto">
          <SmallCapsEyebrow className="mb-12">Questions</SmallCapsEyebrow>
          <div>
            {items.map((item) => (
              <details
                key={item.q}
                className="group border-b border-rule py-6"
              >
                <summary className="cursor-pointer font-display text-[22px] leading-[1.3] text-ink list-none flex justify-between items-start gap-4">
                  <span>{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="text-ink-2 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-open:rotate-45 text-2xl leading-none mt-1"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 text-[16px] leading-[1.7] text-ink-2">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/EditorialFAQ.tsx
git commit -m "$(cat <<'EOF'
feat(landing): EditorialFAQ — list-style with native <details>

Hairline dividers between items. "+" indicator rotates to "x" on
open via group-open + 250ms ease-out transform. Native <details>
handles state — works without JS, reads correctly to screen readers
as a disclosure widget.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 24: Build EditorialFooter with theme toggle

**Files:**
- Create: `src/components/landing/EditorialFooter.tsx`

- [ ] **Step 1: Write the component**

```typescript
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getStoredThemeMode,
  setStoredThemeMode,
  type ThemeMode,
} from "@/lib/theme-mode";

export function EditorialFooter() {
  const [mode, setMode] = useState<ThemeMode>("auto");
  const [systemDark, setSystemDark] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMode(getStoredThemeMode());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    setHydrated(true);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const effective = mode === "auto" ? (systemDark ? "dark" : "light") : mode;

  const handleToggle = () => {
    const next: ThemeMode = effective === "dark" ? "light" : "dark";
    setStoredThemeMode(next);
    setMode(next);
    document.documentElement.setAttribute("data-theme-mode", next);
  };

  return (
    <footer className="border-t border-rule py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <p className="font-display text-2xl text-ink mb-2">GrantPilot</p>
            <p className="text-[14px] text-ink-2">
              Built by Coach Phillips · Made for people who need the grant
              more than the platform needs the fee.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-ink-2">
            <Link href="/pricing" className="hover:text-ink">
              Pricing
            </Link>
            <Link href="/resources" className="hover:text-ink">
              Resources
            </Link>
            <Link href="/trust" className="hover:text-ink">
              Trust
            </Link>
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-ink">
              Terms
            </Link>
            {hydrated && (
              <button
                type="button"
                onClick={handleToggle}
                className="hover:text-ink underline-offset-4 hover:underline"
              >
                {effective === "dark" ? "Switch to light" : "Switch to dark"}
              </button>
            )}
          </nav>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/EditorialFooter.tsx
git commit -m "$(cat <<'EOF'
feat(landing): EditorialFooter with theme toggle

Quieter footer + theme toggle button using lib/theme-mode helper.
Persists via localStorage, writes data-theme-mode on <html> so the
prepaint script picks it up next load. Toggle only renders after
hydration to avoid SSR/CSR mismatch.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 25: Create barrel export

**Files:**
- Create: `src/components/landing/index.ts`

- [ ] **Step 1: Write the barrel**

```typescript
export { EditorialShell } from "./EditorialShell";
export { EditorialNav } from "./EditorialNav";
export { EditorialHero } from "./EditorialHero";
export { SignatureMark } from "./SignatureMark";
export { EditorialSection } from "./EditorialSection";
export { SmallCapsEyebrow } from "./SmallCapsEyebrow";
export { FoundersNote } from "./FoundersNote";
export { DropCap } from "./DropCap";
export { PullQuote } from "./PullQuote";
export { SignatureBlock } from "./SignatureBlock";
export { HowItWorksStep } from "./HowItWorksStep";
export { SmartFillProof } from "./SmartFillProof";
export { EditorialFAQ } from "./EditorialFAQ";
export { EditorialCTA } from "./EditorialCTA";
export { EditorialFooter } from "./EditorialFooter";
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/index.ts
git commit -m "$(cat <<'EOF'
feat(landing): barrel export for landing primitives

Single import surface from src/components/landing for page.tsx.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 5 — Assembly

### Task 26: Capture How It Works step images

**Files:**
- Create: `public/landing/howitworks-1.webp`, `howitworks-2.webp`, `howitworks-3.webp`

- [ ] **Step 1: Capture three product screenshots**

For each step, capture a 2× DPI screenshot from the live product:
- Step 1: a view of the grant index / sources screen
- Step 2: the match-score / grants ranking view
- Step 3: the Smart Fill rubric breakdown

- [ ] **Step 2: Compress each to ≤120KB WebP**

```bash
cwebp -q 75 -o public/landing/howitworks-1.webp /path/to/raw-1.png
cwebp -q 75 -o public/landing/howitworks-2.webp /path/to/raw-2.png
cwebp -q 75 -o public/landing/howitworks-3.webp /path/to/raw-3.png
```

- [ ] **Step 3: Commit**

```bash
git add public/landing/howitworks-*.webp
git commit -m "$(cat <<'EOF'
asset(landing): How It Works step screenshots

Three 2x DPI WebP screenshots from the live product, ≤120KB each.
Step 1: source index. Step 2: match-score. Step 3: rubric breakdown.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 27: Rewrite `src/app/page.tsx`

**Files:**
- Modify: `src/app/page.tsx` (full rewrite)

- [ ] **Step 1: Replace the file contents**

Replace `src/app/page.tsx` with:

```typescript
import Script from "next/script";
import { auth } from "@/lib/auth";
import {
  EditorialShell,
  EditorialNav,
  EditorialHero,
  FoundersNote,
  HowItWorksStep,
  SmartFillProof,
  EditorialFAQ,
  EditorialFooter,
} from "@/components/landing";

export const revalidate = 3600;

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://grantpilot.dev";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "GrantPilot",
  applicationCategory: "BusinessApplication",
  description:
    "AI-powered platform that finds grants and scholarships, drafts applications and essays, and predicts your score. For organizations and students.",
  url: SITE_URL,
  operatingSystem: "Web",
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
    { "@type": "Offer", name: "Student Pro", price: "9.99", priceCurrency: "USD" },
    { "@type": "Offer", name: "Pro", price: "79", priceCurrency: "USD" },
    { "@type": "Offer", name: "Organization", price: "249", priceCurrency: "USD" },
  ],
  featureList: [
    "AI grant and scholarship matching",
    "Smart Fill — auto-draft proposals and essays",
    "Score prediction before you submit",
    "141+ scholarship database for students",
    "Federal, state, and foundation grants for organizations",
    "Success fee pricing — pay only when you win",
  ],
};

const faqs = [
  {
    q: "What types of grants and scholarships do you cover?",
    a: "For organizations: federal (SAM.gov, Grants.gov), state, and foundation grants — SBIR/STTR, NIH, NSF, USDA, DOE, and 2,000+ programs across 12 real-time sources. For students: 141+ scholarships including merit, need-based, STEM, minority-focused, essay contests, and niche awards.",
  },
  {
    q: "How does Smart Fill actually work?",
    a: "Smart Fill reads the complete RFP or scholarship prompt, maps every scoring criterion, then drafts each section using your organization's data or student profile. It auto-optimizes up to 3 rounds until every criterion scores maximum points. You see exactly what the AI changed, why, and how it maps to the rubric.",
  },
  {
    q: "What is the success fee?",
    a: "You pay nothing until you win. Students on the free plan pay 8% of any scholarship won through GrantPilot; Student Pro reduces it to 3%. Organizations pay 2-5% depending on plan. Every plan includes a success fee — we earn when you earn. Compared to grant consultants who charge $5K-$15K per application, our model is a fraction of the cost.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Your data is encrypted in transit (TLS 1.3) and at rest. Hosted on Vercel and Supabase with enterprise-grade infrastructure. Your data is never shared or used to train AI models.",
  },
  {
    q: "Can students really auto-apply to multiple scholarships at once?",
    a: "Yes. Build your profile once, and our AI drafts a personalized essay for each scholarship using your personal statement and activities. Review them in a batch queue — approve, edit, or skip — then submit all approved applications in one click.",
  },
  {
    q: "What's the Grant Guarantee?",
    a: "We're building toward a Grant Guarantee for Pro plans: if you don't win within 12 months, we'll extend your subscription free. This will launch once we have enough data to back it. For now, all paid plans include a 21-day free trial — cancel anytime if you're not seeing results.",
  },
];

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const destinationHref = "/dashboard";
  const ctaHref = isLoggedIn ? destinationHref : "/signup";
  const ctaLabel = isLoggedIn ? "Go to dashboard" : "Start free";

  return (
    <EditorialShell>
      <Script id="json-ld" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(jsonLd)}
      </Script>

      <EditorialNav state={{ loggedIn: isLoggedIn, destinationHref }} />

      <EditorialHero primaryCtaHref={ctaHref} primaryCtaLabel={ctaLabel} />

      <FoundersNote />

      <section
        id="how-it-works"
        className="container mx-auto px-4 sm:px-6 py-20 md:py-32"
      >
        <HowItWorksStep
          number="01"
          title="We index the funders."
          body={
            <p>
              We watch 12 live sources — Grants.gov, SAM.gov, NIH Reporter,
              NSF, SBIR, plus federal, state, and foundation databases — and
              bring the relevant opportunities into one place. Over 2,000
              grants and 141+ scholarships, updated every morning.
            </p>
          }
          imageSrc="/landing/howitworks-1.webp"
          imageAlt="Schematic of GrantPilot's 12 live grant data sources flowing into a unified index."
        />
        <HowItWorksStep
          number="02"
          title="We match what you'd actually win."
          body={
            <p>
              Tell us about your work once. We filter out the grants you
              don&apos;t qualify for and rank the ones you do by predicted
              match score — so you spend time on the applications you can
              actually win.
            </p>
          }
          imageSrc="/landing/howitworks-2.webp"
          imageAlt="GrantPilot's match-score interface showing ranked grants for an example nonprofit profile."
          reverse
        />
        <HowItWorksStep
          number="03"
          title="We draft against the rubric."
          body={
            <p>
              Smart Fill reads the complete RFP, maps every scoring criterion
              to your data, drafts each section, and auto-optimizes up to
              three rounds until every criterion scores maximum points.
            </p>
          }
          imageSrc="/landing/howitworks-3.webp"
          imageAlt="Side-by-side of an RFP's scoring rubric and the draft sections produced by Smart Fill."
        />
      </section>

      <SmartFillProof />

      <section className="border-t border-rule container mx-auto px-4 sm:px-6 py-20 md:py-32">
        <div className="max-w-[60ch] mx-auto text-center">
          <p className="text-[13px] font-medium tracking-[0.16em] uppercase text-ink-2 mb-6">
            Pricing
          </p>
          <h2 className="font-display text-[clamp(36px,5vw,64px)] leading-[1.05] tracking-[-0.02em] text-ink mb-6">
            You only pay when you win.
          </h2>
          <p className="text-[18px] leading-[1.625] text-ink-2 mb-10">
            Compared to grant consultants who charge $5K–$15K per
            application, we earn 2–5% on a win — and nothing if you don&apos;t.
          </p>
          <a
            href="/pricing"
            className="text-accent hover:text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]"
          >
            See full pricing →
          </a>
        </div>
      </section>

      <EditorialFAQ items={faqs} />

      <section className="container mx-auto px-4 sm:px-6 py-20 md:py-32 text-center">
        <h2 className="font-display text-[clamp(36px,5vw,64px)] leading-[1.05] tracking-[-0.02em] text-ink mb-10 max-w-[20ch] mx-auto">
          Find the grant you&apos;d almost have given up on.
        </h2>
        <a
          href={ctaHref}
          className="inline-flex items-center gap-2 bg-accent text-surface px-8 py-4 font-medium tracking-tight hover:bg-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]"
        >
          {ctaLabel}
        </a>
      </section>

      <EditorialFooter />
    </EditorialShell>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: 71 pages still build; landing builds with new components; no TypeScript errors.

- [ ] **Step 3: Visual sanity check at three viewports**

Run: `npm run dev`. Visit `http://localhost:3000` at 375×812, 1024×1366, and 1920×1080. Confirm:
- Hero asymmetric layout, signature mark bleeds right on desktop
- Founder note drop cap appears
- How It Works alternates direction
- Smart Fill mockup loads
- Pricing line reads cleanly
- FAQ accordion opens/closes
- Footer theme toggle works
- All anchor links navigate (#founder, #how-it-works, #faq)

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "$(cat <<'EOF'
feat(landing): rewrite page.tsx as editorial composition

803 lines → ~200 lines. Composes EditorialShell + EditorialNav +
EditorialHero + FoundersNote (position 2) + How It Works (3
alternating steps) + SmartFillProof + inline pricing + EditorialFAQ
+ closing CTA + EditorialFooter. JSON-LD and FAQ data preserved
verbatim. revalidate 3600 kept. Auth CTA branch unchanged.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 6 — Validation

### Task 28: Update e2e landing spec

**Files:**
- Modify: `e2e/landing.spec.ts`

- [ ] **Step 1: Update with structural assertions**

Replace `e2e/landing.spec.ts` with:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Public surfaces — editorial landing", () => {
  test("hero headline is visible", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: /Stop writing grants/i })
    ).toBeVisible();
  });

  test("founder note section is reachable via anchor", async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href="#founder"]').first().click();
    await expect(page.locator("#founder")).toBeInViewport({ ratio: 0.5 });
  });

  test("FAQ accordion opens and closes", async ({ page }) => {
    await page.goto("/");
    const firstQuestion = page.locator("#faq details").first();
    await expect(firstQuestion).not.toHaveAttribute("open", "");
    await firstQuestion.locator("summary").click();
    await expect(firstQuestion).toHaveAttribute("open", "");
  });

  test("theme toggle persists across reloads", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", {
      name: /Switch to (dark|light)/,
    });
    await toggle.click();
    await page.reload();
    await page.waitForLoadState("networkidle");
    const mode = await page.locator("html").getAttribute("data-theme-mode");
    expect(["dark", "light"]).toContain(mode);
  });

  test("pricing renders the four org plans", async ({ page }) => {
    await page.goto("/pricing");
    for (const name of ["Starter", "Growth", "Pro", "Organization"]) {
      await expect(
        page.getByRole("heading", { level: 3, name, exact: true })
      ).toBeVisible();
    }
  });

  test("login form inputs are keyboard-operable", async ({ page }) => {
    await page.goto("/login");
    const email = page.locator("#email");
    const password = page.locator("#password");
    await expect(email).toBeVisible();
    await expect(password).toBeVisible();
    await email.focus();
    await expect(email).toBeFocused();
    await password.focus();
    await expect(password).toBeFocused();
  });
});
```

- [ ] **Step 2: Run the e2e suite**

Run: `npm run test:e2e`
Expected: six tests pass.

- [ ] **Step 3: Commit**

```bash
git add e2e/landing.spec.ts
git commit -m "$(cat <<'EOF'
test(landing): expand e2e suite for editorial landing

Adds anchor-navigation, FAQ accordion, and theme-toggle-persistence
tests. Existing hero headline / pricing / login smoke tests preserved
verbatim — the editorial pivot keeps the headline text.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 29: Add Playwright visual-regression snapshots

**Files:**
- Create: `e2e/landing-visual.spec.ts`

- [ ] **Step 1: Write the spec**

```typescript
import { test, expect } from "@playwright/test";

const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 1024, height: 1366 },
  { name: "desktop", width: 1920, height: 1080 },
];

test.describe("Landing visual regression", () => {
  for (const v of viewports) {
    test(`landing matches baseline at ${v.name}`, async ({ page }) => {
      await page.setViewportSize({ width: v.width, height: v.height });
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      // Pause needle deterministically for the snapshot.
      await page.addStyleTag({
        content: `#needle { animation: none !important; transform: rotate(45deg) !important; }`,
      });
      await expect(page).toHaveScreenshot(`landing-${v.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.001,
      });
    });
  }
});
```

- [ ] **Step 2: Capture initial baselines**

Run: `npm run test:e2e -- e2e/landing-visual.spec.ts --update-snapshots`
Expected: three baseline PNGs written under `e2e/landing-visual.spec.ts-snapshots/`.

- [ ] **Step 3: Re-run to confirm lock**

Run: `npm run test:e2e -- e2e/landing-visual.spec.ts`
Expected: PASS for all three viewports.

- [ ] **Step 4: Commit**

```bash
git add e2e/landing-visual.spec.ts e2e/landing-visual.spec.ts-snapshots
git commit -m "$(cat <<'EOF'
test(landing): visual-regression baselines at three viewports

Captures mobile (375x812), tablet (1024x1366), desktop (1920x1080)
full-page snapshots with needle animation paused deterministically.
maxDiffPixelRatio 0.001 — meaningful visual changes will fail and
force deliberate baseline update.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 30: Run Lighthouse on Vercel Preview

- [ ] **Step 1: Push branch**

```bash
git push -u origin HEAD
```

Wait for Vercel to build. Note the preview URL.

- [ ] **Step 2: Run Lighthouse**

```bash
npx unlighthouse --site <preview-url> --output-path ./lighthouse-editorial
```

- [ ] **Step 3: Compare against Task 1 baseline**

Record the four scores and three Web Vitals in the PR description. Compare to baseline.

**Pass criteria:**
- Performance ≥95 (and not lower than baseline)
- Accessibility = 100
- Best Practices = 100
- SEO ≥95
- LCP ≤ baseline + 200ms
- **CLS = 0**
- INP < 200ms

If any criterion fails:
- LCP regression: reduce Fraunces subset or remove `preload: true` and re-test
- CLS > 0: verify `adjustFontFallback` is set on Fraunces
- A11y < 100: read the specific failures, fix, re-test

### Task 31: Run `/deploy-mason` audit

- [ ] **Step 1: Invoke Mason audit**

```
/deploy-mason
/mason-audit <preview-url>
```

- [ ] **Step 2: Capture per-pillar scores**

Record overall Mason Score + all eight pillar scores. Target: ≥95 overall.

- [ ] **Step 3: Fix critical violations**

For each CRITICAL/HIGH violation, fix the underlying component (not the audit). Re-run. Commit fixes as small commits.

### Task 32: Run `/deploy-ux` heuristic audit

- [ ] **Step 1: Invoke PRISM-UX audit**

```
/deploy-ux
/ux-full-audit <preview-url>
```

- [ ] **Step 2: Capture each agent's verdict**

Target: zero BLOCKs. FLAGs accepted with rationale in PR.

- [ ] **Step 3: Fix BLOCKs**

For each BLOCK, fix and re-run.

### Task 33: Manual a11y + keyboard + screen reader pass

- [ ] **Step 1: Keyboard tab-through**

Open the preview URL. Press Tab repeatedly. Verify:
- Focus is always visible (2px outline, `--accent` color)
- Tab order: skip link → hero CTA → secondary link → nav links → founder anchor → FAQ items → footer links → theme toggle
- No focus traps
- Skip-to-content link lands on the hero

- [ ] **Step 2: Screen reader pass (VoiceOver on macOS, Cmd+F5)**

Verify:
- Drop cap reads as part of the paragraph, not as a separate letter
- Pull quote announced as a blockquote
- Compass mark NOT announced (`aria-hidden`)
- Headings in correct hierarchy via the rotor (Cmd+Opt+U → Headings)

- [ ] **Step 3: Run axe-core (recommended)**

```bash
npm install --save-dev @axe-core/playwright
```

Create `e2e/landing-a11y.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("landing has zero axe critical violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  const criticals = results.violations.filter((v) => v.impact === "critical");
  expect(criticals).toEqual([]);
});
```

Run: `npm run test:e2e -- e2e/landing-a11y.spec.ts`
Expected: PASS.

Commit:
```bash
git add package.json package-lock.json e2e/landing-a11y.spec.ts
git commit -m "test(landing): zero axe critical violations check"
```

- [ ] **Step 4: Fix any issues**

Small commits per finding.

### Task 34: Print preview check

- [ ] **Step 1: Print preview**

Preview URL → `Cmd+P` → "Save as PDF". Verify:
- Background white (not cream)
- Compass mark / nav / footer / hero-bleed hidden
- Founder note prints as a clean one-pager
- Pull quote and drop cap survive
- No overflowing or clipped sections

- [ ] **Step 2: Fix print stylesheet if needed**

Adjust `src/app/globals.css` print block. Commit:

```bash
git add src/app/globals.css
git commit -m "fix(landing): print stylesheet adjustment [reason]"
```

### Task 35: Final code review

- [ ] **Step 1: Invoke code review skill**

```
/code-review
```

or the project's preferred reviewer command.

- [ ] **Step 2: Resolve or explicitly accept every finding**

Small commits per finding.

### Task 36: Merge and capture production day-0 baseline

- [ ] **Step 1: Pre-merge checklist**

Confirm in PR description:
- [ ] Mason Score ≥95 captured
- [ ] Lighthouse Perf ≥95, A11y 100, SEO ≥95, BP 100
- [ ] CLS = 0 verified
- [ ] All e2e tests passing
- [ ] Visual-regression baselines captured
- [ ] PRISM-UX audit: no BLOCKs
- [ ] Manual a11y pass: keyboard + screen reader
- [ ] Print preview clean
- [ ] Founder note: user-approved as "sounds like Coach"
- [ ] Code review resolved

- [ ] **Step 2: Merge**

After approval, merge the PR via GitHub. Vercel deploys to production.

- [ ] **Step 3: Capture production baseline**

```bash
npx unlighthouse --site https://grantpilot.dev --output-path ./lighthouse-prod-day0
```

Save scores to `docs/plans/2026-05-15-landing-production-day0.md`. Run `/mason-audit https://grantpilot.dev` and append the Mason Score. This anchors the 7-day post-launch tracking window.

```bash
git add docs/plans/2026-05-15-landing-production-day0.md
git commit -m "$(cat <<'EOF'
docs(landing): production day-0 baseline post-editorial pivot

Lighthouse and Mason Score captured from production immediately
after merge. Anchors the 7-day post-launch metrics window per the
design spec §10.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review

**Spec coverage:**

| Spec section | Implementing task(s) |
|---|---|
| §1 Problem / §2 Decision | Implicit in entire plan |
| §3 IA (6 sections) | Task 27 |
| §4 Tokens | Task 3 |
| §4 Fonts | Task 2 |
| §4 Surfaces | Tasks 8, 27 |
| §4 Iconography | Tasks 9, 16 |
| §5 Hero | Tasks 9, 10, 13 |
| §6 Founder Note | Tasks 14–18 |
| §7 Components | All Phase 1–4 tasks |
| §7 Token scoping | Tasks 3, 7 |
| §7 Migration | Task 27 (direct swap), Task 36 (merge) |
| §8 Motion budget | Tasks 3 (tokens), 10 (needle), 23 (FAQ), 11 (CTA) |
| §9 Breakpoints | Tasks 13, 17, 20 |
| §9 Auth states | Tasks 12, 27 |
| §9 Color scheme + toggle | Tasks 3, 5, 6, 24 |
| §9 Motion preferences | Tasks 3, 10 |
| §9 Font loading | Task 2 |
| §9 Image loading | Tasks 16, 22 |
| §9 No-JS | Tasks 23, 24 |
| §9 Keyboard/SR | Tasks 14, 15, 33 |
| §9 Print | Tasks 4, 34 |
| §10 Mason audit | Task 31 |
| §10 UX audit | Task 32 |
| §10 Accessibility | Task 33 |
| §10 Lighthouse | Task 30 |
| §10 Visual regression | Task 29 |
| §10 Copy review | Task 18 |
| §10 Founder voice approval | Task 18 |
| §10 Print check | Task 34 |
| §10 Code review | Task 35 |
| §10 Rollback | Implicit (`git revert <merge-commit>`); documented in spec |
| §10 Definition of done | Task 36 checklist |
| §11 Risks | Mitigated across plan |
| §12 Out of scope | Honored — no dashboard / pricing-page / OG / RTL work |

No gaps.

**Placeholder scan:** No "TBD", "TODO", or vague handling instructions. The two genuine open items — the compass-G SVG path and the scribble signature artwork — are flagged with explicit recovery instructions.

**Type consistency:** `ThemeMode`, `NavSubscriptionState`, `FAQItem`, and all component props are consistent across tasks. `getStoredThemeMode` / `setStoredThemeMode` / `resolveEffectiveMode` named identically in test, helper, and consumer.

---

## Execution Handoff

Plan complete and saved to `docs/plans/2026-05-15-landing-editorial-pivot-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
