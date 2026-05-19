# Landing v2 Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the GrantPilot marketing landing page as a 10-section layout with a calm → rich → loud visual rhythm, replacing v8 in place behind the existing `[data-theme="editorial"]` scope without touching any dashboard or app surface.

**Architecture:** New landing primitives live in `src/components/landing/`. Motion uses a CSS-only `useReveal` hook backed by `IntersectionObserver` — no Framer Motion install. All color, gradient, glass, and tint values land as CSS custom properties under `[data-theme="editorial"]` in `src/app/globals.css`. Each of the 8 blocks ships independently and produces a working page; later blocks layer on top.

**Tech Stack:** Next.js 16.1 App Router (RSC by default, `"use client"` where required), React 19, Tailwind, `lucide-react` icons, vitest for unit tests, Playwright for e2e + visual regression. No new dependencies installed by this plan.

**Spec:** `docs/superpowers/specs/2026-05-19-landing-v2-design.md` (`0ca766c`)

---

## File Structure

### Create
- `src/lib/landing/useReveal.ts` — `IntersectionObserver`-backed reveal hook (Block 1)
- `src/lib/landing/__tests__/useReveal.test.ts` — vitest unit tests
- `src/components/landing/FloatingScoreCard.tsx` — hero overlay (Block 2)
- `src/components/landing/Stat.tsx` — extracted from `EditorialHero.tsx:226-249` (Block 2)
- `src/components/landing/TrustBar.tsx` — consolidated trust band (Block 3)
- `src/components/landing/HowItWorksMockup1.tsx` — source pipeline mockup (Block 4)
- `src/components/landing/HowItWorksMockup2.tsx` — ranked matches mockup (Block 4)
- `src/components/landing/HowItWorksMockup3.tsx` — rubric + draft mockup (Block 4)
- `src/components/landing/FeatureSection.tsx` — alternating wrapper (Block 5)
- `src/components/landing/DiscoveryMockup.tsx` — Block 5
- `src/components/landing/SmartFillMockup.tsx` — Block 5
- `src/components/landing/ScorePredictionMockup.tsx` — Block 5
- `src/components/landing/BatchSubmissionMockup.tsx` — Block 5
- `src/components/landing/BillingMockup.tsx` — Block 5
- `src/components/landing/ComparisonSection.tsx` — Block 6
- `src/components/landing/PricingCards.tsx` — Block 6 (2 audience-tiered cards)
- `src/components/landing/PreLaunchPanel.tsx` — Block 7
- `src/components/landing/CtaBanner.tsx` — Block 1 (marine-bold final CTA)

### Modify
- `src/app/globals.css` — add new tokens + dark-mode equivalents + reveal CSS (Block 1 + Block 8)
- `src/components/landing/EditorialNav.tsx` — sticky transparent + scroll-aware frosted glass (Block 1)
- `src/components/landing/EditorialFooter.tsx` — 4-column premium layout + email stub (Block 1)
- `src/components/landing/EditorialHero.tsx` — shrink to grid + floating overlay; strip removals (Block 2)
- `src/components/landing/HowItWorksStep.tsx` — replace `imageSrc` prop with `mockup` children (Block 4)
- `src/components/landing/EditorialFAQ.tsx` — glass-surface row chrome (Block 7)
- `src/components/landing/index.ts` — export new components
- `src/app/page.tsx` — recompose using new sections (incremental across blocks)
- `e2e/landing.spec.ts` — add behavior tests for sticky nav, comparison table, pricing cards
- `e2e/landing-visual.spec.ts` — regenerate baselines after each block

### Retire (no source deletion; just remove from `page.tsx`)
- The placeholder webps at `public/landing/howitworks-1.webp`, `howitworks-2.webp`, `howitworks-3.webp`, `smart-fill-mockup.webp` stay on disk but become unreferenced after Block 4.

---

## Block 1 — Foundation tokens + page chrome

Adds the design tokens + `useReveal` hook + sticky nav + premium footer + the marine CTA banner. Other blocks depend on the tokens here.

### Task 1.1: Add light-mode tokens to globals.css

**Files:**
- Modify: `src/app/globals.css` (insert inside the existing `[data-theme="editorial"] { ... }` block, after `--success-soft` declaration around line 758)

- [ ] **Step 1: Add the new tokens**

Insert this block immediately before the closing `}` of the `[data-theme="editorial"] { ... }` rule at approximately line 760:

```css
  /* v2 redesign tokens */
  --ease-soft: cubic-bezier(0.32, 0.72, 0, 1);
  --dur-reveal: 520ms;

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

  --panel-prelaunch: linear-gradient(180deg, #F0FDF4 0%, #FAFEFB 100%);
  --gradient-cta-banner: linear-gradient(135deg, #0066CC 0%, #1a73e8 60%, #2563EB 100%);

  --glass-bg: rgba(255, 255, 255, 0.70);
  --glass-blur: 10px;
  --glass-border: rgba(15, 23, 42, 0.06);
```

- [ ] **Step 2: Verify the build still parses**

Run: `npm run build`
Expected: build succeeds (no CSS parse errors). If the build is slow, run `npx tsc --noEmit` separately as a fast check.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(landing): v2 — add light-mode design tokens"
```

### Task 1.2: Add dark-mode equivalents

**Files:**
- Modify: `src/app/globals.css` — add dark-mode overrides inside both the `prefers-color-scheme: dark` block (~line 784) and the explicit `[data-theme="editorial"][data-theme-mode="dark"]` block (~line 801)

- [ ] **Step 1: Add dark overrides to the `prefers-color-scheme: dark` block**

Append inside the `@media (prefers-color-scheme: dark)` `[data-theme="editorial"]:not([data-theme-mode="light"])` rule at around line 794, right before the closing `}`:

```css
    --section-tint-1: linear-gradient(180deg, rgba(0, 102, 204, 0.10) 0%, rgba(0, 102, 204, 0.04) 100%);
    --section-tint-2: linear-gradient(180deg, rgba(21, 128, 61, 0.10) 0%, rgba(21, 128, 61, 0.04) 100%);
    --section-tint-3: linear-gradient(180deg, rgba(180, 83, 9, 0.10) 0%, rgba(180, 83, 9, 0.04) 100%);
    --section-tint-4: linear-gradient(180deg, rgba(124, 58, 237, 0.10) 0%, rgba(124, 58, 237, 0.04) 100%);
    --section-tint-5: linear-gradient(180deg, rgba(190, 24, 93, 0.10) 0%, rgba(190, 24, 93, 0.04) 100%);
    --section-border-1: rgba(34, 211, 238, 0.18);
    --section-border-2: rgba(74, 222, 128, 0.18);
    --section-border-3: rgba(251, 191, 36, 0.18);
    --section-border-4: rgba(167, 139, 250, 0.18);
    --section-border-5: rgba(244, 114, 182, 0.18);
    --panel-prelaunch: linear-gradient(180deg, rgba(74, 222, 128, 0.08) 0%, rgba(74, 222, 128, 0.02) 100%);
    --gradient-cta-banner: linear-gradient(135deg, #0E7490 0%, #155E75 60%, #164E63 100%);
    --glass-bg: rgba(15, 23, 42, 0.55);
    --glass-blur: 12px;
    --glass-border: rgba(241, 245, 249, 0.08);
```

- [ ] **Step 2: Mirror those overrides inside the explicit `[data-theme="editorial"][data-theme-mode="dark"]` rule**

Find the rule at approximately line 801 and append the same overrides before its closing `}`. The values are identical to step 1.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(landing): v2 — dark-mode parity for new tokens"
```

### Task 1.3: Create `useReveal` hook with vitest tests

**Files:**
- Create: `src/lib/landing/useReveal.ts`
- Create: `src/lib/landing/__tests__/useReveal.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/landing/__tests__/useReveal.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReveal } from "../useReveal";

describe("useReveal", () => {
  let observerCallback: IntersectionObserverCallback;
  let observe: ReturnType<typeof vi.fn>;
  let disconnect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    observe = vi.fn();
    disconnect = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      vi.fn((cb: IntersectionObserverCallback) => {
        observerCallback = cb;
        return { observe, disconnect, unobserve: vi.fn(), takeRecords: () => [], root: null, rootMargin: "", thresholds: [] };
      })
    );
  });

  it("starts hidden", () => {
    const { result } = renderHook(() => useReveal());
    expect(result.current.visible).toBe(false);
  });

  it("flips to visible when observer fires with intersecting entry", () => {
    const { result } = renderHook(() => useReveal());
    // Simulate ref attachment + intersection
    const fakeEntry = { isIntersecting: true } as IntersectionObserverEntry;
    act(() => {
      observerCallback([fakeEntry], {} as IntersectionObserver);
    });
    expect(result.current.visible).toBe(true);
  });

  it("respects prefers-reduced-motion by starting visible", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    const { result } = renderHook(() => useReveal());
    expect(result.current.visible).toBe(true);
  });
});
```

- [ ] **Step 2: Install `@testing-library/react` if absent**

Run: `npm ls @testing-library/react 2>/dev/null | head -3`
If the package is not present, install it: `npm install -D @testing-library/react @testing-library/dom`

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/lib/landing/__tests__/useReveal.test.ts`
Expected: FAIL — `Cannot find module '../useReveal'`

- [ ] **Step 4: Implement `useReveal`**

Create `src/lib/landing/useReveal.ts`:

```ts
"use client";

import { useEffect, useRef, useState } from "react";

interface UseRevealOptions {
  threshold?: number;
  once?: boolean;
}

export interface UseRevealResult {
  ref: React.RefCallback<HTMLElement>;
  visible: boolean;
}

/**
 * Reveal hook backed by IntersectionObserver. Honors prefers-reduced-motion
 * by short-circuiting to "visible immediately" so motion-sensitive readers
 * never see content animate in.
 */
export function useReveal(options: UseRevealOptions = {}): UseRevealResult {
  const { threshold = 0.2, once = true } = options;
  const [visible, setVisible] = useState(false);
  const elRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const reduce = typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;
    if (reduce) {
      setVisible(true);
      return;
    }
    const node = elRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, once]);

  const ref: React.RefCallback<HTMLElement> = (node) => {
    elRef.current = node;
  };

  return { ref, visible };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/landing/__tests__/useReveal.test.ts`
Expected: PASS — 3 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/landing/useReveal.ts src/lib/landing/__tests__/useReveal.test.ts
git commit -m "feat(landing): v2 — useReveal hook (CSS-only motion primitive)"
```

### Task 1.4: Modify `EditorialNav` for sticky + scroll-aware frosted glass

**Files:**
- Modify: `src/components/landing/EditorialNav.tsx`

- [ ] **Step 1: Rewrite the component**

Replace the entire contents of `src/components/landing/EditorialNav.tsx` with:

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SmallCapsEyebrow } from "./SmallCapsEyebrow";

interface NavSubscriptionState {
  loggedIn: boolean;
  destinationHref: string;
  trialDaysLeft?: number;
  pastDue?: boolean;
}

export function EditorialNav({ state }: { state: NavSubscriptionState }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sentinel = document.createElement("div");
    sentinel.style.position = "absolute";
    sentinel.style.top = "60px";
    sentinel.style.height = "1px";
    sentinel.style.width = "1px";
    sentinel.style.pointerEvents = "none";
    document.body.prepend(sentinel);
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, []);

  return (
    <nav
      data-scrolled={scrolled}
      className="sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-[var(--dur-fast)] ease-[var(--ease-out)]
        bg-transparent border-b border-transparent
        data-[scrolled=true]:bg-[color:var(--glass-bg)]
        data-[scrolled=true]:[backdrop-filter:blur(var(--glass-blur))]
        data-[scrolled=true]:border-[color:var(--glass-border)]"
    >
      <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span className="font-display text-xl">GrantPilot</span>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-[14px] text-ink-2">
          <Link href="/#features" className="hover:text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Product</Link>
          <Link href="/pricing" className="hover:text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Pricing</Link>
          <Link href="/resources" className="hover:text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Resources</Link>
        </div>

        <div className="flex items-center gap-4">
          {state.pastDue && (
            <SmallCapsEyebrow className="text-accent">
              <Link
                href="/dashboard/billing"
                className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Payment needed
              </Link>
            </SmallCapsEyebrow>
          )}
          {state.trialDaysLeft !== undefined && !state.pastDue && (
            <SmallCapsEyebrow>
              Trial · {state.trialDaysLeft} days left
            </SmallCapsEyebrow>
          )}
          <Link
            href={state.loggedIn ? state.destinationHref : "/login"}
            className="text-[14px] text-ink-2 hover:text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {state.loggedIn ? "Dashboard" : "Sign in"}
          </Link>
          <Link
            href={state.loggedIn ? state.destinationHref : "/signup"}
            className="inline-flex items-center bg-accent text-surface text-[13px] font-medium tracking-tight rounded-lg px-3.5 py-2 hover:bg-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {state.loggedIn ? "Open dashboard" : "Start free"}
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Add an e2e behavior test for the scrolled state**

Append this test to `e2e/landing.spec.ts` inside the `test.describe("Public surfaces — editorial landing", ...)` block:

```ts
  test("nav transitions to frosted state on scroll", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav").first();
    await expect(nav).toHaveAttribute("data-scrolled", "false");
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(nav).toHaveAttribute("data-scrolled", "true");
  });
```

- [ ] **Step 3: Run e2e tests to verify**

Run: `npx playwright test e2e/landing.spec.ts --grep "nav transitions"`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/EditorialNav.tsx e2e/landing.spec.ts
git commit -m "feat(landing): v2 — sticky nav with scroll-aware frosted glass"
```

### Task 1.5: Create `CtaBanner` component

**Files:**
- Create: `src/components/landing/CtaBanner.tsx`

- [ ] **Step 1: Implement the component**

Create `src/components/landing/CtaBanner.tsx`:

```tsx
interface CtaBannerProps {
  ctaHref: string;
  ctaLabel: string;
}

export function CtaBanner({ ctaHref, ctaLabel }: CtaBannerProps) {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 px-4 sm:px-6 text-center bg-[image:var(--gradient-cta-banner)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.18), transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div className="relative max-w-3xl mx-auto">
        <p className="text-[12px] font-semibold tracking-[0.16em] uppercase text-white/85 mb-4">
          Ready when you are
        </p>
        <h2 className="font-display text-[clamp(36px,5vw,60px)] leading-[1.05] tracking-[-0.02em] text-white mb-5 max-w-[22ch] mx-auto">
          Find the grant you&apos;d almost have given up on.
        </h2>
        <p className="text-[15px] md:text-[16px] text-white/85 mb-9">
          No credit card · 21-day free trial · 0% upfront.
        </p>
        <a
          href={ctaHref}
          className="inline-flex items-center gap-2 bg-white text-accent font-semibold tracking-tight rounded-lg px-7 py-3.5 hover:bg-white/90 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to barrel export**

Edit `src/components/landing/index.ts` and append:

```ts
export { CtaBanner } from "./CtaBanner";
```

(If a barrel file does not already exist, create it with all current exports from the imports in `src/app/page.tsx:3-11` plus the new line above.)

- [ ] **Step 3: Wire it into `src/app/page.tsx`**

Replace lines 161–171 (the existing centered final-CTA `<section>`) with:

```tsx
      <CtaBanner ctaHref={ctaHref} ctaLabel={ctaLabel} />
```

Also add the import: `CtaBanner,` to the existing `from "@/components/landing"` import statement at the top of `page.tsx`.

- [ ] **Step 4: Verify build + type-check**

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/CtaBanner.tsx src/components/landing/index.ts src/app/page.tsx
git commit -m "feat(landing): v2 — marine-bold CtaBanner replaces final CTA section"
```

### Task 1.6: Modify `EditorialFooter` for 4-column premium layout

**Files:**
- Modify: `src/components/landing/EditorialFooter.tsx`

- [ ] **Step 1: Rewrite the component**

Replace the entire contents with:

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getStoredThemeMode,
  setStoredThemeMode,
  type ThemeMode,
} from "@/lib/theme-mode";

const PRODUCT_LINKS = [
  { label: "Pricing", href: "/pricing" },
  { label: "For organizations", href: "/#for-orgs", disabled: true },
  { label: "For students", href: "/#for-students", disabled: true },
  { label: "API", href: "/api-docs", disabled: true },
  { label: "Status", href: "/status", disabled: true },
];

const RESOURCE_LINKS = [
  { label: "Grant index", href: "/grants", disabled: true },
  { label: "Scholarship index", href: "/scholarships", disabled: true },
  { label: "Blog", href: "/blog", disabled: true },
  { label: "Help center", href: "/help", disabled: true },
  { label: "Smart Fill rubric", href: "/smart-fill", disabled: true },
];

const COMPANY_LINKS = [
  { label: "About", href: "/about", disabled: true },
  { label: "Careers", href: "/careers", disabled: true },
  { label: "Press", href: "/press", disabled: true },
  { label: "Contact", href: "/contact", disabled: true },
];

const LEGAL_LINKS = [
  { label: "Trust", href: "/trust" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Security", href: "/security", disabled: true },
  { label: "DPA", href: "/dpa", disabled: true },
];

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string; disabled?: boolean }[];
}) {
  return (
    <nav aria-label={title}>
      <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-ink mb-4">
        {title}
      </p>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.label}>
            {item.disabled ? (
              <span
                className="text-[14px] text-ink-2/60 cursor-not-allowed"
                title="Coming soon"
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-[14px] text-ink-2 hover:text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

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
    <footer className="border-t border-rule">
      <div className="container mx-auto px-4 sm:px-6 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10 lg:gap-12 mb-12">
          <div>
            <p className="font-display text-2xl text-ink mb-2">GrantPilot</p>
            <p className="text-[14px] text-ink-2 max-w-[28ch] mb-6">
              Win grants and scholarships. Pay 0% upfront.
            </p>
            <form
              action=""
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row gap-2 max-w-[360px]"
              aria-label="Newsletter signup"
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                required
                placeholder="you@example.com"
                className="flex-1 text-[14px] px-3.5 py-2.5 rounded-lg border border-rule bg-surface text-ink placeholder:text-ink-2/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
              <button
                type="submit"
                className="bg-accent text-surface text-[13px] font-medium tracking-tight rounded-lg px-4 py-2.5 hover:bg-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Subscribe
              </button>
            </form>
            <p className="text-[12px] text-ink-2/70 mt-2 max-w-[360px]">
              One curated grant in your inbox each week. Unsubscribe anytime.
            </p>
          </div>
          <FooterColumn title="Product" items={PRODUCT_LINKS} />
          <FooterColumn title="Resources" items={RESOURCE_LINKS} />
          <FooterColumn title="Company" items={COMPANY_LINKS} />
          <FooterColumn title="Legal" items={LEGAL_LINKS} />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-rule">
          <p className="text-[12px] text-ink-2">
            © {new Date().getFullYear()} GrantPilot. All rights reserved.
          </p>
          {hydrated && (
            <button
              type="button"
              onClick={handleToggle}
              className="text-[12px] text-ink-2 hover:text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {effective === "dark" ? "Switch to light" : "Switch to dark"}
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verify type-check**

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 3: Run existing landing e2e to ensure theme toggle still works**

Run: `npx playwright test e2e/landing.spec.ts --grep "theme toggle"`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/EditorialFooter.tsx
git commit -m "feat(landing): v2 — 4-column premium footer + email-capture stub"
```

### Task 1.7: Regenerate visual baselines for Block 1

The page now has new chrome — nav transitions, footer layout, CTA banner. Visual baselines need to update.

- [ ] **Step 1: Start dev server in another shell**

Run (in a separate terminal or background): `npm run dev`

- [ ] **Step 2: Spot-check the page in a browser**

Visit http://localhost:3000. Verify: nav is transparent at top, frosted on scroll. Footer has 4 columns. Marine CTA banner before the footer.

- [ ] **Step 3: Update Playwright baselines**

Run: `npx playwright test e2e/landing-visual.spec.ts --update-snapshots`
Expected: 3 baselines (mobile/tablet/desktop) regenerated; test passes on the new images.

- [ ] **Step 4: Commit**

```bash
git add e2e/landing-visual.spec.ts*
git commit -m "test(landing): v2 — refresh visual baselines after Block 1"
```

---

## Block 2 — Hero polish

Shrinks `EditorialHero` to just its grid + adds the floating Score overlay. Strips that previously lived inside `EditorialHero` move to dedicated sections in subsequent blocks. Stat component gets extracted for reuse.

### Task 2.1: Extract `Stat` to its own file

**Files:**
- Create: `src/components/landing/Stat.tsx`

- [ ] **Step 1: Create the file**

Create `src/components/landing/Stat.tsx`:

```tsx
interface StatProps {
  value: string;
  label: string;
  tone?: "default" | "success";
}

export function Stat({ value, label, tone = "default" }: StatProps) {
  return (
    <div className="text-center">
      <dt
        className={`font-bold text-[clamp(28px,4.2vw,44px)] leading-none tracking-[-0.02em] tabular-nums ${
          tone === "success" ? "text-success" : "text-ink"
        }`}
      >
        {value}
      </dt>
      <dd className="mt-2 text-[12px] font-semibold tracking-[0.12em] uppercase text-ink-2">
        {label}
      </dd>
    </div>
  );
}
```

- [ ] **Step 2: Add to barrel export**

In `src/components/landing/index.ts`, add: `export { Stat } from "./Stat";`

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/Stat.tsx src/components/landing/index.ts
git commit -m "refactor(landing): v2 — extract Stat to its own file"
```

### Task 2.2: Create `FloatingScoreCard`

**Files:**
- Create: `src/components/landing/FloatingScoreCard.tsx`

- [ ] **Step 1: Implement the component**

Create `src/components/landing/FloatingScoreCard.tsx`:

```tsx
/**
 * Floating "Score · 94" overlay anchored to the top-right of the hero
 * preview. Decorative — hidden from screen readers (aria-hidden).
 */
export function FloatingScoreCard() {
  return (
    <div
      aria-hidden="true"
      className="absolute z-10 top-0 right-0 translate-x-[18%] -translate-y-[28%] rotate-2
        rounded-xl px-3.5 py-2.5
        bg-white/85 [backdrop-filter:blur(8px)]
        border border-[color:var(--glass-border)]
        shadow-[0_8px_22px_-6px_rgba(15,23,42,0.22)]
        max-[480px]:hidden
        max-[768px]:rotate-0 max-[768px]:translate-x-[6%] max-[768px]:translate-y-[-12%]"
    >
      <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-ink-2">
        Score
      </p>
      <p className="text-[20px] font-bold text-success leading-none tabular-nums mt-1">
        94
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Add to barrel export**

In `src/components/landing/index.ts`, add: `export { FloatingScoreCard } from "./FloatingScoreCard";`

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/FloatingScoreCard.tsx src/components/landing/index.ts
git commit -m "feat(landing): v2 — FloatingScoreCard hero overlay"
```

### Task 2.3: Shrink `EditorialHero` and wire the overlay

**Files:**
- Modify: `src/components/landing/EditorialHero.tsx`

- [ ] **Step 1: Replace the file**

Replace the entire contents of `src/components/landing/EditorialHero.tsx` with:

```tsx
import { EditorialCTA } from "./EditorialCTA";
import { FloatingScoreCard } from "./FloatingScoreCard";

/**
 * v2 hero. Left text + CTAs, right HeroPreview with a single floating
 * Score · 94 overlay. The trust strip, stats row, FeatureCarousel, and
 * pre-launch line that previously lived inside this component have moved
 * to dedicated sections (TrustBar, PreLaunchPanel).
 */
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
      className="relative container mx-auto px-4 sm:px-6 pt-10 md:pt-14 lg:pt-20 pb-16 md:pb-24"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="text-left">
          <p className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-tight text-accent mb-6 px-3.5 py-1.5 rounded-full bg-accent-soft">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            For nonprofits, founders &amp; students
          </p>

          <h1 className="text-[clamp(40px,5.5vw,68px)] font-bold leading-[1.05] tracking-[-0.025em] text-ink mb-6">
            Win grants and scholarships.
            <br />
            <span className="text-accent">Pay 0% upfront.</span>
          </h1>

          <p className="text-[18px] md:text-[19px] leading-[1.55] text-ink-2 max-w-[520px] mb-8">
            Find the funding you actually qualify for. Draft each
            application against the funder&apos;s rubric. See your predicted
            score before you submit. <span className="font-semibold text-ink">You only pay when you win.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <EditorialCTA href={primaryCtaHref}>
              {primaryCtaLabel} — it&apos;s $0 until you win
            </EditorialCTA>
            <EditorialCTA href="#how-it-works" variant="secondary">
              See how it works
            </EditorialCTA>
          </div>

          <p className="text-[13px] text-ink-2">
            No credit card · 21-day free trial · Cancel anytime
          </p>
        </div>

        <div className="relative">
          <HeroPreview />
          <FloatingScoreCard />
        </div>
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative max-w-[520px] mx-auto lg:ml-auto">
      <div className="bg-surface rounded-2xl border border-rule shadow-[0_20px_48px_-12px_rgba(15,23,42,0.18),0_4px_12px_-2px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-rule bg-bg/40">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <p className="ml-3 text-[12px] text-ink-2">grantpilot.dev / matches</p>
          <div className="ml-auto flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-ink-2">
            <span className="size-1.5 rounded-full bg-success" />
            Live
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-baseline justify-between mb-4">
            <p className="text-[15px] font-semibold text-ink">
              3 new matches today
            </p>
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-2">
              By score
            </p>
          </div>
          <div className="space-y-2.5">
            {[
              {
                t: "NSF SBIR Phase I — Software",
                f: "National Science Foundation",
                a: "$275,000",
                s: 94,
                d: "Due Mar 12",
              },
              {
                t: "Knight Foundation · Civic",
                f: "Knight Foundation",
                a: "$125,000",
                s: 88,
                d: "Due Apr 04",
              },
              {
                t: "Coca-Cola Scholars Program",
                f: "Coca-Cola Foundation",
                a: "$20,000",
                s: 91,
                d: "Due May 21",
              },
            ].map((row) => (
              <div
                key={row.t}
                className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border border-rule"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-ink truncate">
                    {row.t}
                  </p>
                  <p className="text-[11px] text-ink-2 truncate">{row.f}</p>
                </div>
                <div className="hidden sm:block text-right shrink-0">
                  <p className="text-[13px] font-semibold text-success tabular-nums">
                    {row.a}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-ink-2">
                    {row.d}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-soft text-success text-[11px] font-bold tabular-nums">
                  {row.s}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-rule flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-2">
              You only pay on a win
            </p>
            <p className="text-[12px] font-semibold text-accent">
              Draft all 3 →
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run existing e2e to ensure hero headline still detected**

Run: `npx playwright test e2e/landing.spec.ts --grep "hero headline"`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/EditorialHero.tsx
git commit -m "feat(landing): v2 — slim hero + FloatingScoreCard overlay; strips removed"
```

---

## Block 3 — Trust bar

Consolidates indexed-funders strip, stats row, and the honest pre-launch line into a single dedicated section directly below the hero.

### Task 3.1: Create `TrustBar`

**Files:**
- Create: `src/components/landing/TrustBar.tsx`

- [ ] **Step 1: Implement the component**

Create `src/components/landing/TrustBar.tsx`:

```tsx
import { Fragment } from "react";
import { Stat } from "./Stat";

const INDEXED_FUNDERS = [
  "Grants.gov",
  "SAM.gov",
  "NIH",
  "NSF",
  "USDA",
  "SBIR",
  "DOE",
  "Foundation Directory",
];

export function TrustBar() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-14 md:py-20 border-t border-rule">
      <div className="text-center mb-10">
        <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-ink-2 mb-5">
          Indexing funding from
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 max-w-3xl mx-auto">
          {INDEXED_FUNDERS.map((funder, i) => (
            <Fragment key={funder}>
              <span className="text-[14px] md:text-[15px] font-medium tracking-tight text-ink hover:text-accent transition-colors">
                {funder}
              </span>
              {i < INDEXED_FUNDERS.length - 1 && (
                <span className="text-ink-2/40" aria-hidden="true">·</span>
              )}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="pt-10 border-t border-rule/60 max-w-5xl mx-auto">
        <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-ink-2 mb-7 text-center">
          What we&apos;ve indexed so far
        </p>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-8">
          <Stat value="2,000+" label="Grants" />
          <Stat value="141+" label="Scholarships" />
          <Stat value="12" label="Live sources" />
          <Stat value="0%" label="Upfront" tone="success" />
        </dl>
      </div>

      <div className="mt-12 mx-auto max-w-2xl">
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border-l-4 border-l-accent border-y border-r border-rule bg-accent-soft/30">
          <p className="text-[13px] md:text-[14px] text-ink-2 leading-relaxed">
            <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-ink mr-2">
              Pre-launch
            </span>
            We&apos;re building in the open. Be one of our first 100 wins and
            your story replaces this strip.
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to barrel + wire into `page.tsx`**

Edit `src/components/landing/index.ts`:

```ts
export { TrustBar } from "./TrustBar";
```

In `src/app/page.tsx`, add `TrustBar,` to the import statement and insert `<TrustBar />` directly after `<EditorialHero ... />` (around line 86).

- [ ] **Step 3: Type-check + commit**

Run: `npx tsc --noEmit`
Expected: no type errors.

```bash
git add src/components/landing/TrustBar.tsx src/components/landing/index.ts src/app/page.tsx
git commit -m "feat(landing): v2 — TrustBar consolidates funders + stats + pre-launch"
```

---

## Block 4 — How It Works inline mockups

Replaces the gray-placeholder webps with three inline component mockups, each illustrating its step. The `HowItWorksStep` prop API changes from `imageSrc`/`imageAlt` to a `mockup` render prop.

### Task 4.1: Read existing `HowItWorksStep` and confirm signature

**Files:**
- Read: `src/components/landing/HowItWorksStep.tsx`

- [ ] **Step 1: Inspect**

Run: `cat src/components/landing/HowItWorksStep.tsx`
Note the existing props: `number`, `title`, `body`, `imageSrc`, `imageAlt`, optional `reverse`. The mockup slot is currently a `<Image src={imageSrc} alt={imageAlt} />`. We are replacing that with a children-like `mockup` ReactNode prop.

### Task 4.2: Refactor `HowItWorksStep` to accept a `mockup` slot

**Files:**
- Modify: `src/components/landing/HowItWorksStep.tsx`

- [ ] **Step 1: Replace the file**

Replace `src/components/landing/HowItWorksStep.tsx` with:

```tsx
import type { ReactNode } from "react";

interface HowItWorksStepProps {
  number: string;
  title: string;
  body: ReactNode;
  mockup: ReactNode;
  reverse?: boolean;
}

export function HowItWorksStep({
  number,
  title,
  body,
  mockup,
  reverse = false,
}: HowItWorksStepProps) {
  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-12 md:py-20 ${
        reverse ? "lg:[&>*:first-child]:col-start-2" : ""
      }`}
    >
      <div>
        <p className="text-[12px] font-semibold tracking-[0.16em] uppercase text-accent mb-4">
          {number}
        </p>
        <h3 className="font-display text-[clamp(24px,3.2vw,36px)] leading-[1.15] tracking-[-0.02em] text-ink mb-4 max-w-[18ch]">
          {title}
        </h3>
        <div className="text-[16px] leading-[1.65] text-ink-2 max-w-[44ch]">
          {body}
        </div>
      </div>
      <div>{mockup}</div>
    </div>
  );
}
```

- [ ] **Step 2: Confirm no other callsites use `imageSrc`**

Run: `grep -rn 'HowItWorksStep' src/`
Expected: only callsite is `src/app/page.tsx`. If any other file uses the old props, you must update those callsites too.

### Task 4.3: Create `HowItWorksMockup1` (Source pipeline)

**Files:**
- Create: `src/components/landing/HowItWorksMockup1.tsx`

- [ ] **Step 1: Implement**

```tsx
const SOURCES = [
  "Grants.gov", "SAM.gov", "NIH Reporter", "NSF",
  "SBIR", "USDA", "DOE", "Knight Foundation",
  "Gates Foundation", "Coca-Cola", "Foundation Directory", "State databases",
];

export function HowItWorksMockup1() {
  return (
    <div className="max-w-[480px] mx-auto lg:ml-auto">
      <div className="bg-surface rounded-2xl border border-rule shadow-[0_20px_48px_-12px_rgba(15,23,42,0.18),0_4px_12px_-2px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-rule bg-bg/40">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <p className="ml-3 text-[12px] text-ink-2">grantpilot.dev / sources</p>
          <div className="ml-auto flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-ink-2">
            <span className="size-1.5 rounded-full bg-success animate-pulse" />
            Syncing
          </div>
        </div>
        <div className="p-5">
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-2 mb-3">
            12 live sources · Updated 4 min ago
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SOURCES.map((s) => (
              <div
                key={s}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-rule"
              >
                <span className="size-1.5 rounded-full bg-success shrink-0" />
                <span className="text-[12px] font-medium text-ink truncate">{s}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-rule flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-2">
              Next sync in 56 min
            </p>
            <p className="text-[12px] font-semibold text-accent">
              2,141 opportunities indexed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Task 4.4: Create `HowItWorksMockup2` (Ranked matches)

**Files:**
- Create: `src/components/landing/HowItWorksMockup2.tsx`

- [ ] **Step 1: Implement**

```tsx
const MATCHES = [
  { t: "NSF SBIR Phase I — Software", a: "$275,000", s: 94 },
  { t: "Knight Civic Innovation", a: "$125,000", s: 88 },
  { t: "Gates Health Equity", a: "$500,000", s: 82 },
  { t: "USDA Rural Business", a: "$95,000", s: 76 },
];

export function HowItWorksMockup2() {
  return (
    <div className="max-w-[480px] mx-auto lg:ml-auto">
      <div className="bg-surface rounded-2xl border border-rule shadow-[0_20px_48px_-12px_rgba(15,23,42,0.18),0_4px_12px_-2px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-rule bg-bg/40">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <p className="ml-3 text-[12px] text-ink-2">grantpilot.dev / matches</p>
        </div>
        <div className="p-5">
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-2 mb-3">
            Ranked for your profile
          </p>
          <div className="space-y-2.5">
            {MATCHES.map((m) => (
              <div
                key={m.t}
                className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border border-rule"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-ink truncate">{m.t}</p>
                  <p className="text-[11px] text-success font-medium mt-0.5">Eligible</p>
                </div>
                <p className="text-[12px] font-semibold text-success tabular-nums shrink-0">
                  {m.a}
                </p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-soft text-success text-[11px] font-bold tabular-nums">
                  {m.s}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Task 4.5: Create `HowItWorksMockup3` (Rubric + draft)

**Files:**
- Create: `src/components/landing/HowItWorksMockup3.tsx`

- [ ] **Step 1: Implement**

```tsx
const CRITERIA = [
  { name: "Specific Aims", score: "10 / 10" },
  { name: "Innovation", score: "9 / 10" },
  { name: "Approach", score: "9 / 10" },
  { name: "Investigator", score: "10 / 10" },
  { name: "Environment", score: "9 / 10" },
];

export function HowItWorksMockup3() {
  return (
    <div className="max-w-[520px] mx-auto lg:ml-auto">
      <div className="bg-surface rounded-2xl border border-rule shadow-[0_20px_48px_-12px_rgba(15,23,42,0.18),0_4px_12px_-2px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-rule bg-bg/40">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <p className="ml-3 text-[12px] text-ink-2">grantpilot.dev / smart-fill</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-rule">
          <div className="p-4">
            <p className="text-[10px] uppercase tracking-[0.12em] text-ink-2 mb-3">
              Scoring rubric
            </p>
            <ul className="space-y-2">
              {CRITERIA.map((c) => (
                <li key={c.name} className="flex items-center justify-between text-[12px]">
                  <span className="text-ink">{c.name}</span>
                  <span className="font-semibold text-success tabular-nums">{c.score}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 bg-bg-soft/40">
            <p className="text-[10px] uppercase tracking-[0.12em] text-ink-2 mb-3">
              Draft · §1 Specific Aims
            </p>
            <p className="text-[11px] leading-[1.55] text-ink-2 line-clamp-[8]">
              We propose a software platform that addresses three specific
              aims: (1) reduce average grant-application drafting time from
              48 hours to under 4, (2) raise the rate at which applicants
              meet every scoring criterion to ≥ 95 %, and (3) make grant
              capital accessible to first-time applicants without
              consultant fees…
            </p>
            <p className="text-[10px] font-semibold text-accent mt-3">
              Auto-optimizing · round 2 of 3
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Task 4.6: Wire the new mockups into `page.tsx`

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update imports**

Add `HowItWorksMockup1, HowItWorksMockup2, HowItWorksMockup3,` to the `@/components/landing` import.

- [ ] **Step 2: Update the `HowItWorksStep` calls**

In `src/app/page.tsx`, replace the three `HowItWorksStep` blocks (lines 92–133) with:

```tsx
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
          mockup={<HowItWorksMockup1 />}
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
          mockup={<HowItWorksMockup2 />}
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
          mockup={<HowItWorksMockup3 />}
        />
```

- [ ] **Step 3: Update the barrel export**

In `src/components/landing/index.ts` add:

```ts
export { HowItWorksMockup1 } from "./HowItWorksMockup1";
export { HowItWorksMockup2 } from "./HowItWorksMockup2";
export { HowItWorksMockup3 } from "./HowItWorksMockup3";
```

- [ ] **Step 4: Type-check + e2e + commit**

Run: `npx tsc --noEmit`
Expected: no type errors.

Run: `npx playwright test e2e/landing.spec.ts --grep "hero headline"`
Expected: PASS.

```bash
git add src/components/landing/HowItWorksMockup*.tsx \
        src/components/landing/HowItWorksStep.tsx \
        src/components/landing/index.ts src/app/page.tsx
git commit -m "feat(landing): v2 — inline How-It-Works mockups, retire webp placeholders"
```

---

## Block 5 — Alternating feature sections

5 mockups + a `FeatureSection` wrapper that takes a tint enum. Each section becomes its own pastel-tinted stage.

### Task 5.1: Create `FeatureSection` wrapper

**Files:**
- Create: `src/components/landing/FeatureSection.tsx`

- [ ] **Step 1: Implement**

```tsx
import type { ReactNode } from "react";

type Tint = 1 | 2 | 3 | 4 | 5;

interface FeatureSectionProps {
  tint: Tint;
  eyebrow: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  mockup: ReactNode;
  reverse?: boolean;
}

const TINT_BG: Record<Tint, string> = {
  1: "bg-[image:var(--section-tint-1)]",
  2: "bg-[image:var(--section-tint-2)]",
  3: "bg-[image:var(--section-tint-3)]",
  4: "bg-[image:var(--section-tint-4)]",
  5: "bg-[image:var(--section-tint-5)]",
};

const TINT_BORDER: Record<Tint, string> = {
  1: "border-[color:var(--section-border-1)]",
  2: "border-[color:var(--section-border-2)]",
  3: "border-[color:var(--section-border-3)]",
  4: "border-[color:var(--section-border-4)]",
  5: "border-[color:var(--section-border-5)]",
};

export function FeatureSection({
  tint,
  eyebrow,
  headline,
  body,
  ctaLabel,
  ctaHref,
  mockup,
  reverse = false,
}: FeatureSectionProps) {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-8">
      <div
        className={`rounded-3xl border ${TINT_BG[tint]} ${TINT_BORDER[tint]} p-10 lg:p-14`}
      >
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
            reverse ? "lg:[&>*:first-child]:col-start-2" : ""
          }`}
        >
          <div>
            <p className="text-[12px] font-semibold tracking-[0.16em] uppercase text-accent mb-4">
              {eyebrow}
            </p>
            <h3 className="font-display text-[clamp(28px,3.6vw,42px)] leading-[1.1] tracking-[-0.02em] text-ink mb-5 max-w-[18ch]">
              {headline}
            </h3>
            <p className="text-[16px] md:text-[17px] leading-[1.6] text-ink-2 max-w-[44ch] mb-6">
              {body}
            </p>
            <a
              href={ctaHref}
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent hover:text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {ctaLabel} <span aria-hidden="true">→</span>
            </a>
          </div>
          <div>{mockup}</div>
        </div>
      </div>
    </section>
  );
}
```

### Task 5.2: Create `DiscoveryMockup` (tint 1)

**Files:**
- Create: `src/components/landing/DiscoveryMockup.tsx`

- [ ] **Step 1: Implement**

```tsx
const ROWS = [
  { t: "NSF SBIR Phase I", a: "$275,000", e: "Eligible", s: 94 },
  { t: "Knight Civic Innovation", a: "$125,000", e: "Eligible", s: 88 },
  { t: "Gates Health Equity", a: "$500,000", e: "Eligible", s: 82 },
];

export function DiscoveryMockup() {
  return (
    <div className="max-w-[480px] mx-auto">
      <div className="bg-surface rounded-2xl border border-rule shadow-[0_20px_48px_-12px_rgba(15,23,42,0.18),0_4px_12px_-2px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-rule bg-bg/40">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <p className="ml-3 text-[12px] text-ink-2">grantpilot.dev / discovery</p>
        </div>
        <div className="p-5">
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-2 mb-3">
            3 ranked matches · auto-refreshed
          </p>
          <div className="space-y-2.5">
            {ROWS.map((r) => (
              <div key={r.t} className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border border-rule">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-ink truncate">{r.t}</p>
                  <p className="text-[11px] text-success font-medium mt-0.5">{r.e}</p>
                </div>
                <p className="text-[12px] font-semibold text-success tabular-nums shrink-0">{r.a}</p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-soft text-success text-[11px] font-bold tabular-nums">{r.s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Task 5.3: Create `SmartFillMockup` (tint 2)

**Files:**
- Create: `src/components/landing/SmartFillMockup.tsx`

- [ ] **Step 1: Implement**

```tsx
export function SmartFillMockup() {
  return (
    <div className="max-w-[480px] mx-auto">
      <div className="bg-surface rounded-2xl border border-rule shadow-[0_20px_48px_-12px_rgba(15,23,42,0.18),0_4px_12px_-2px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-rule bg-bg/40">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <p className="ml-3 text-[12px] text-ink-2">grantpilot.dev / smart-fill</p>
          <span className="ml-auto text-[10px] font-semibold tracking-[0.12em] uppercase text-success">
            Round 3 / 3
          </span>
        </div>
        <div className="p-5">
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-2 mb-3">
            Specific Aims · auto-optimized
          </p>
          <div className="space-y-2">
            <div className="px-3 py-2 rounded-lg border border-success/20 bg-success-soft/30 text-[12px] leading-[1.55] text-ink">
              <span className="font-semibold text-success">+ added</span> &quot;reduce drafting time from 48 hr to under 4&quot;
            </div>
            <div className="px-3 py-2 rounded-lg border border-success/20 bg-success-soft/30 text-[12px] leading-[1.55] text-ink">
              <span className="font-semibold text-success">+ added</span> measurable target tied to Aim 1
            </div>
            <div className="px-3 py-2 rounded-lg border border-rule text-[12px] leading-[1.55] text-ink-2">
              <span className="font-semibold text-ink">~ tightened</span> background paragraph by 31 words
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-rule flex items-center justify-between text-[11px] text-ink-2">
            <span>All 5 criteria · max points</span>
            <span className="font-semibold text-success tabular-nums">47 / 47</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Task 5.4: Create `ScorePredictionMockup` (tint 3)

**Files:**
- Create: `src/components/landing/ScorePredictionMockup.tsx`

- [ ] **Step 1: Implement**

```tsx
const BARS = [
  { name: "Specific Aims", pct: 100 },
  { name: "Innovation", pct: 90 },
  { name: "Approach", pct: 90 },
  { name: "Investigator", pct: 100 },
  { name: "Environment", pct: 90 },
];

export function ScorePredictionMockup() {
  return (
    <div className="max-w-[480px] mx-auto">
      <div className="bg-surface rounded-2xl border border-rule shadow-[0_20px_48px_-12px_rgba(15,23,42,0.18),0_4px_12px_-2px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-rule bg-bg/40">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <p className="ml-3 text-[12px] text-ink-2">grantpilot.dev / score</p>
        </div>
        <div className="p-5">
          <div className="flex items-baseline justify-between mb-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-2">Predicted score</p>
            <p className="text-[28px] font-bold text-success leading-none tabular-nums">94 <span className="text-[14px] text-ink-2 font-medium">/ 100</span></p>
          </div>
          <div className="space-y-3">
            {BARS.map((b) => (
              <div key={b.name}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-ink">{b.name}</span>
                  <span className="text-ink-2 tabular-nums">{b.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-rule overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{ width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-rule text-[11px] text-ink-2 text-center">
            Score updates as you edit.
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Task 5.5: Create `BatchSubmissionMockup` (tint 4)

**Files:**
- Create: `src/components/landing/BatchSubmissionMockup.tsx`

- [ ] **Step 1: Implement**

```tsx
const ITEMS = [
  { t: "Coca-Cola Scholars", a: "$20,000", checked: true },
  { t: "Gates Millennium Scholarship", a: "$50,000", checked: true },
  { t: "Hispanic Scholarship Fund", a: "$5,000", checked: true },
  { t: "Jack Kent Cooke Scholarship", a: "$55,000", checked: true },
  { t: "Burger King Scholars", a: "$1,000", checked: false },
  { t: "Dell Scholars Program", a: "$20,000", checked: true },
  { t: "Horatio Alger", a: "$25,000", checked: true },
  { t: "Ron Brown Scholar", a: "$40,000", checked: true },
];

export function BatchSubmissionMockup() {
  return (
    <div className="max-w-[480px] mx-auto">
      <div className="bg-surface rounded-2xl border border-rule shadow-[0_20px_48px_-12px_rgba(15,23,42,0.18),0_4px_12px_-2px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-rule bg-bg/40">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <p className="ml-3 text-[12px] text-ink-2">grantpilot.dev / queue</p>
        </div>
        <div className="p-5">
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-2 mb-3">
            Batch queue · 7 of 8 selected
          </p>
          <div className="space-y-1.5">
            {ITEMS.map((i) => (
              <div key={i.t} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-rule">
                <span
                  className={`size-4 rounded border ${i.checked ? "bg-accent border-accent" : "bg-surface border-rule"} flex items-center justify-center shrink-0`}
                  aria-hidden="true"
                >
                  {i.checked && (
                    <span className="text-surface text-[10px] font-bold">✓</span>
                  )}
                </span>
                <p className={`flex-1 text-[12px] font-medium truncate ${i.checked ? "text-ink" : "text-ink-2/70"}`}>{i.t}</p>
                <p className="text-[11px] font-semibold text-success tabular-nums shrink-0">{i.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-rule flex items-center justify-between">
            <p className="text-[11px] text-ink-2">Total potential: <span className="font-semibold text-ink tabular-nums">$215,000</span></p>
            <button type="button" className="bg-accent text-surface text-[12px] font-semibold rounded-lg px-3.5 py-1.5">
              Submit 7 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Task 5.6: Create `BillingMockup` (tint 5)

**Files:**
- Create: `src/components/landing/BillingMockup.tsx`

- [ ] **Step 1: Implement**

```tsx
export function BillingMockup() {
  return (
    <div className="max-w-[480px] mx-auto">
      <div className="bg-surface rounded-2xl border border-rule shadow-[0_20px_48px_-12px_rgba(15,23,42,0.18),0_4px_12px_-2px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-rule bg-bg/40">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <p className="ml-3 text-[12px] text-ink-2">grantpilot.dev / billing</p>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between px-3.5 py-3 rounded-xl border border-success/20 bg-success-soft/20">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-ink-2">Grant won</p>
              <p className="text-[14px] font-semibold text-ink mt-0.5">NSF SBIR Phase I — Software</p>
            </div>
            <p className="text-[14px] font-bold text-success tabular-nums">$275,000</p>
          </div>
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-rule">
            <p className="text-[12px] text-ink-2">Success fee · 4 %</p>
            <p className="text-[12px] font-semibold text-ink tabular-nums">– $11,000</p>
          </div>
          <div className="flex items-center justify-between px-3.5 py-3 rounded-xl border-2 border-ink/10 bg-bg-soft/40">
            <p className="text-[13px] font-semibold text-ink">Net to you</p>
            <p className="text-[16px] font-bold text-ink tabular-nums">$264,000</p>
          </div>
          <p className="text-[11px] text-center text-ink-2 pt-1">
            $0 upfront · No charge until you win.
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Task 5.7: Wire all 5 feature sections into `page.tsx`

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/landing/index.ts`

- [ ] **Step 1: Update the barrel**

Append to `src/components/landing/index.ts`:

```ts
export { FeatureSection } from "./FeatureSection";
export { DiscoveryMockup } from "./DiscoveryMockup";
export { SmartFillMockup } from "./SmartFillMockup";
export { ScorePredictionMockup } from "./ScorePredictionMockup";
export { BatchSubmissionMockup } from "./BatchSubmissionMockup";
export { BillingMockup } from "./BillingMockup";
```

- [ ] **Step 2: Insert the 5 sections in `page.tsx`**

In `src/app/page.tsx`, between the `<SmartFillProof />` line (current line 136) and the existing comparison/pricing teaser section, insert:

```tsx
      <FeatureSection
        tint={1}
        eyebrow="Discovery"
        headline="Find funding you actually qualify for."
        body="Match score is computed from your profile, eligibility, and the funder's historical behavior. We hide the grants you can't win so you spend time on the ones you can."
        ctaLabel="See how matching works"
        ctaHref="/#discovery"
        mockup={<DiscoveryMockup />}
      />
      <FeatureSection
        tint={2}
        eyebrow="Smart Fill"
        headline="Draft against the rubric, not the prompt."
        body="Smart Fill reads the full RFP, maps every scoring criterion to your data, drafts each section, and auto-optimizes up to three rounds until every criterion scores maximum points."
        ctaLabel="Watch Smart Fill draft"
        ctaHref="/#smart-fill"
        mockup={<SmartFillMockup />}
        reverse
      />
      <FeatureSection
        tint={3}
        eyebrow="Score prediction"
        headline="See your predicted score before you submit."
        body="Every paragraph is graded against the funder's criteria as you write. Watch the score change live, fix the lowest-scoring criterion first, submit with confidence."
        ctaLabel="See score breakdown"
        ctaHref="/#score-prediction"
        mockup={<ScorePredictionMockup />}
      />
      <FeatureSection
        tint={4}
        eyebrow="Batch submission"
        headline="Apply to many scholarships in one click."
        body="Build your profile once. We draft a personalized essay for each scholarship using your story and activities. Review the queue, approve in bulk, submit."
        ctaLabel="Apply to many at once"
        ctaHref="/#batch"
        mockup={<BatchSubmissionMockup />}
        reverse
      />
      <FeatureSection
        tint={5}
        eyebrow="Success-fee billing"
        headline="You only pay when you win."
        body="Organizations pay 2–5 % of grants won. Students pay 3–8 % of scholarships won. No upfront cost, no monthly cost on the free plans, no charge if you don't win."
        ctaLabel="See pricing"
        ctaHref="/pricing"
        mockup={<BillingMockup />}
      />
```

Add the new component names to the existing `@/components/landing` import at the top of `page.tsx`.

- [ ] **Step 3: Type-check + commit**

Run: `npx tsc --noEmit`
Expected: no type errors.

```bash
git add src/components/landing/FeatureSection.tsx \
        src/components/landing/DiscoveryMockup.tsx \
        src/components/landing/SmartFillMockup.tsx \
        src/components/landing/ScorePredictionMockup.tsx \
        src/components/landing/BatchSubmissionMockup.tsx \
        src/components/landing/BillingMockup.tsx \
        src/components/landing/index.ts src/app/page.tsx
git commit -m "feat(landing): v2 — 5 alternating feature sections with pastel tints"
```

---

## Block 6 — Comparison + Pricing

Adds named competitor comparison + 2-card audience-tiered pricing.

### Task 6.1: Create `ComparisonSection`

**Files:**
- Create: `src/components/landing/ComparisonSection.tsx`

- [ ] **Step 1: Implement**

```tsx
import { Check, X } from "lucide-react";

type Cell = boolean | string;

interface Row {
  label: string;
  cells: [Cell, Cell, Cell, Cell]; // [GrantPilot, Instrumentl, Submittable, Consultants]
}

const ROWS: Row[] = [
  { label: "Upfront cost",                 cells: ["$0", "$179–$329 / mo", "$1,000+ / yr", "$5K–$15K / app"] },
  { label: "Pay only on a win",            cells: [true, false, false, false] },
  { label: "Drafts the application for you", cells: [true, false, true, true] },
  { label: "Predicts score before submit", cells: [true, false, false, "Sometimes"] },
  { label: "Cancel anytime",               cells: [true, true, true, "Per-engagement"] },
  { label: "21-day free trial",            cells: [true, false, false, false] },
  { label: "Time to first ranked match",   cells: ["< 5 min", "Days", "N/A", "Weeks"] },
  { label: "Opportunities indexed",        cells: ["2,000+", "30,000+", "N/A", "Varies"] },
  { label: "Best suited for",              cells: ["Anyone — orgs + students", "Research-heavy orgs", "Active submitters", "High-budget orgs"] },
];

function CellContent({ value }: { value: Cell }) {
  if (value === true) return <Check className="size-4 text-success mx-auto" aria-label="Yes" />;
  if (value === false) return <X className="size-4 text-ink-2/50 mx-auto" aria-label="No" />;
  return <span className="text-[13px] tabular-nums">{value}</span>;
}

export function ComparisonSection() {
  return (
    <section id="compare" className="container mx-auto px-4 sm:px-6 py-20 md:py-28">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-accent mb-3">
          How we compare
        </p>
        <h2 className="font-display text-[clamp(28px,3.6vw,42px)] leading-[1.1] tracking-[-0.02em] text-ink mb-3">
          The only platform that gets paid when you do.
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full max-w-5xl mx-auto text-left border-collapse">
          <caption className="sr-only">Comparison of grant-finding tools</caption>
          <thead>
            <tr className="border-b border-rule">
              <th scope="col" className="py-4 pr-4 text-[12px] font-semibold tracking-[0.12em] uppercase text-ink-2 align-bottom">&nbsp;</th>
              <th scope="col" className="py-4 px-4 text-center align-bottom bg-accent-soft/40 rounded-t-xl">
                <span className="block text-[11px] font-semibold tracking-[0.12em] uppercase text-accent mb-1">Most efficient</span>
                <span className="block text-[15px] font-bold text-ink">GrantPilot</span>
              </th>
              <th scope="col" className="py-4 px-4 text-center align-bottom">
                <span className="block text-[15px] font-bold text-ink">Instrumentl</span>
              </th>
              <th scope="col" className="py-4 px-4 text-center align-bottom">
                <span className="block text-[15px] font-bold text-ink">Submittable</span>
              </th>
              <th scope="col" className="py-4 pl-4 text-center align-bottom">
                <span className="block text-[15px] font-bold text-ink">Consultants</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? "bg-bg-soft/30" : ""}>
                <th scope="row" className="py-3.5 pr-4 text-[14px] font-medium text-ink">{row.label}</th>
                <td className="py-3.5 px-4 text-center bg-accent-soft/25"><CellContent value={row.cells[0]} /></td>
                <td className="py-3.5 px-4 text-center"><CellContent value={row.cells[1]} /></td>
                <td className="py-3.5 px-4 text-center"><CellContent value={row.cells[2]} /></td>
                <td className="py-3.5 pl-4 text-center"><CellContent value={row.cells[3]} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[11px] text-ink-2/70 text-center max-w-3xl mx-auto">
        Competitor pricing as of {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}, sourced from each vendor&apos;s public site. Refer to each vendor for current rates.
      </p>
    </section>
  );
}
```

### Task 6.2: Create `PricingCards`

**Files:**
- Create: `src/components/landing/PricingCards.tsx`

- [ ] **Step 1: Implement**

```tsx
import { Check } from "lucide-react";
import { EditorialCTA } from "./EditorialCTA";

const ORG_FEATURES = [
  "Federal, state, and foundation indexing",
  "Smart Fill against the RFP rubric",
  "Predicted score before submit",
  "Unlimited applications",
  "Single source-of-truth dashboard",
];

const STUDENT_FEATURES = [
  "141+ scholarship index",
  "Auto-draft personalized essays",
  "Batch submission queue",
  "Predicted score per scholarship",
  "3 % success fee on wins (vs 8 % on free plan)",
];

interface PricingCardsProps {
  ctaHref: string;
  ctaLabel: string;
}

export function PricingCards({ ctaHref, ctaLabel }: PricingCardsProps) {
  return (
    <section id="pricing" className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-accent mb-3">
          Pricing
        </p>
        <h2 className="font-display text-[clamp(28px,3.6vw,42px)] leading-[1.1] tracking-[-0.02em] text-ink mb-3">
          Pick your path. Pay only on a win.
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <article className="rounded-3xl border border-rule p-8 lg:p-10 bg-surface">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-accent mb-3">
            Nonprofits · Founders · Grantmakers
          </p>
          <h3 className="font-display text-[clamp(28px,3.4vw,40px)] leading-none tracking-[-0.02em] text-ink mb-1">
            For organizations
          </h3>
          <dl className="mb-6 mt-4">
            <dt className="sr-only">Price</dt>
            <dd className="flex items-baseline gap-2">
              <span className="text-[64px] font-bold leading-none tracking-[-0.02em] text-ink tabular-nums">0%</span>
              <span className="text-[16px] text-ink-2">upfront</span>
            </dd>
            <dt className="sr-only">Billing</dt>
            <dd className="text-[14px] text-ink-2 mt-2">Pay only on grants won — 2–5 % success fee.</dd>
          </dl>
          <ul className="space-y-3 mb-8">
            {ORG_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-[14px] text-ink">
                <Check className="size-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <EditorialCTA href={ctaHref}>
            {ctaLabel} — pay only on a win
          </EditorialCTA>
        </article>

        <article className="rounded-3xl border border-rule p-8 lg:p-10 bg-surface">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-accent mb-3">
            Scholarship applicants · Undergrad · Grad
          </p>
          <h3 className="font-display text-[clamp(28px,3.4vw,40px)] leading-none tracking-[-0.02em] text-ink mb-1">
            For students
          </h3>
          <dl className="mb-6 mt-4">
            <dt className="sr-only">Price</dt>
            <dd className="flex items-baseline gap-2">
              <span className="text-[64px] font-bold leading-none tracking-[-0.02em] text-ink tabular-nums">$9.99</span>
              <span className="text-[16px] text-ink-2">/ month</span>
            </dd>
            <dt className="sr-only">Billing</dt>
            <dd className="text-[14px] text-ink-2 mt-2">Auto-apply to scholarships you qualify for. Cancel anytime.</dd>
          </dl>
          <ul className="space-y-3 mb-8">
            {STUDENT_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-[14px] text-ink">
                <Check className="size-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <EditorialCTA href="/signup?audience=student">
            Start Student Pro
          </EditorialCTA>
        </article>
      </div>
    </section>
  );
}
```

### Task 6.3: Wire `ComparisonSection` + `PricingCards` into `page.tsx`

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/landing/index.ts`

- [ ] **Step 1: Update barrel**

Append:

```ts
export { ComparisonSection } from "./ComparisonSection";
export { PricingCards } from "./PricingCards";
```

- [ ] **Step 2: Replace the centered pricing teaser**

In `src/app/page.tsx`, replace the existing `<section className="border-t border-rule container mx-auto px-4 sm:px-6 py-20 md:py-32">...</section>` block (lines 138–157 — the "You only pay when you win" teaser) with:

```tsx
      <ComparisonSection />
      <PricingCards ctaHref={ctaHref} ctaLabel={ctaLabel} />
```

Add `ComparisonSection,` and `PricingCards,` to the import.

- [ ] **Step 3: Add e2e tests for new behavior**

Append to `e2e/landing.spec.ts`:

```ts
  test("comparison table renders all four columns", async ({ page }) => {
    await page.goto("/");
    const table = page.locator("section#compare table");
    await expect(table.locator("thead th").nth(1)).toContainText("GrantPilot");
    await expect(table.locator("thead th").nth(2)).toContainText("Instrumentl");
    await expect(table.locator("thead th").nth(3)).toContainText("Submittable");
    await expect(table.locator("thead th").nth(4)).toContainText("Consultants");
  });

  test("pricing renders the two audience cards", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section#pricing");
    await expect(section.getByRole("heading", { level: 3, name: "For organizations" })).toBeVisible();
    await expect(section.getByRole("heading", { level: 3, name: "For students" })).toBeVisible();
  });
```

- [ ] **Step 4: Run new tests**

Run: `npx playwright test e2e/landing.spec.ts --grep "comparison|pricing renders"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/ComparisonSection.tsx \
        src/components/landing/PricingCards.tsx \
        src/components/landing/index.ts \
        src/app/page.tsx e2e/landing.spec.ts
git commit -m "feat(landing): v2 — named comparison + 2-card audience pricing"
```

---

## Block 7 — Pre-launch panel + FAQ polish

### Task 7.1: Create `PreLaunchPanel`

**Files:**
- Create: `src/components/landing/PreLaunchPanel.tsx`

- [ ] **Step 1: Implement**

```tsx
export function PreLaunchPanel() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-20 md:py-28">
      <div className="rounded-3xl border border-[color:var(--section-border-2)] bg-[image:var(--panel-prelaunch)] px-8 py-14 md:px-16 md:py-20 text-center max-w-5xl mx-auto">
        <p className="text-[12px] font-semibold tracking-[0.16em] uppercase text-success mb-4">
          Pre-launch
        </p>
        <h2 className="font-display text-[clamp(32px,4.4vw,52px)] leading-[1.1] tracking-[-0.02em] text-ink mb-5 max-w-[22ch] mx-auto">
          Be one of our first 100 wins.
        </h2>
        <p className="text-[16px] md:text-[17px] leading-[1.6] text-ink-2 max-w-[58ch] mx-auto mb-8">
          We&apos;re building in the open. Your story replaces this section
          the moment we have permission to tell it.
        </p>
        <a
          href="/signup"
          className="inline-flex items-center gap-2 text-[15px] font-semibold text-accent hover:text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Join the launch list <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire into `page.tsx` and barrel**

In `src/components/landing/index.ts` add: `export { PreLaunchPanel } from "./PreLaunchPanel";`

In `src/app/page.tsx`, insert `<PreLaunchPanel />` immediately after the pricing cards and before `<EditorialFAQ items={faqs} />`. Add `PreLaunchPanel,` to the import.

- [ ] **Step 3: Add e2e**

Append to `e2e/landing.spec.ts`:

```ts
  test("pre-launch panel CTA links to signup", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: /Join the launch list/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/signup");
  });
```

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/PreLaunchPanel.tsx \
        src/components/landing/index.ts \
        src/app/page.tsx e2e/landing.spec.ts
git commit -m "feat(landing): v2 — pre-launch panel replaces testimonials slot"
```

### Task 7.2: Polish `EditorialFAQ` with glass surfaces

**Files:**
- Modify: `src/components/landing/EditorialFAQ.tsx`

- [ ] **Step 1: Read the current file to confirm structure**

Run: `cat src/components/landing/EditorialFAQ.tsx`

The current implementation uses native `<details>` per the e2e test at `e2e/landing.spec.ts:11–17` which depends on `#faq details`. The rewrite must preserve `id="faq"` on the section and use `<details>` with a `<summary>` child.

- [ ] **Step 2: Apply glass styling**

Wrap each row with these utility classes (the exact element structure already exists — only the classes change):

- Section: keep `id="faq"`, add generous vertical padding.
- Each `<details>`: add `rounded-xl border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] [backdrop-filter:blur(var(--glass-blur))] px-5 py-3 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]`.
- Rows stack with `space-y-3`.
- `<summary>`: `cursor-pointer text-[15px] font-medium text-ink list-none flex items-center justify-between gap-3`. Add a chevron span: `<span aria-hidden="true" className="size-2.5 border-r-2 border-b-2 border-ink-2 -rotate-45 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] group-open:rotate-45" />` and put `group` on the `<details>` so the chevron rotates.
- Answer body: `mt-3 text-[14px] leading-[1.65] text-ink-2`.

(Implementation note: the existing component already maps over `items.map`; you are only changing inline className strings on three elements — the section, the `<details>`, the `<summary>`.)

- [ ] **Step 3: Run the existing accordion test**

Run: `npx playwright test e2e/landing.spec.ts --grep "FAQ accordion"`
Expected: PASS — toggling still works because `<details>` semantics are unchanged.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/EditorialFAQ.tsx
git commit -m "feat(landing): v2 — glass-surface FAQ rows"
```

---

## Block 8 — Motion sweep

Adds reveal CSS, wires `useReveal` across all sections that should fade up on scroll, verifies reduced-motion behavior, and locks in performance budgets.

### Task 8.1: Add reveal CSS to globals

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Append the reveal rules**

Add to `src/app/globals.css` *outside* the `[data-theme="editorial"]` block but in the same file, so reveals only apply where the editorial theme is active (we still scope the selectors to `[data-theme="editorial"]`):

```css
[data-theme="editorial"] .reveal[data-reveal="hidden"] {
  opacity: 0;
  transform: translateY(16px);
}

[data-theme="editorial"] .reveal[data-reveal="visible"] {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity var(--dur-reveal) var(--ease-soft),
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

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(landing): v2 — reveal CSS rules (reduced-motion aware)"
```

### Task 8.2: Apply `useReveal` to `TrustBar`, `HowItWorksStep`, `FeatureSection`, `ComparisonSection`, `PricingCards`, `PreLaunchPanel`, `CtaBanner`

The pattern for each component:

1. Add `"use client";` at the top of the file if not already present.
2. Import: `import { useReveal } from "@/lib/landing/useReveal";`
3. Inside the component: `const { ref, visible } = useReveal();`
4. On the outermost element: add `ref={ref}`, `data-reveal={visible ? "visible" : "hidden"}`, and `className="... reveal"` (preserve existing classes; just append `reveal`).

**Components to touch in this task (in this order, one commit per file):**

- [ ] **Step 1: `TrustBar.tsx`** — apply pattern, run `npx tsc --noEmit`, commit: `feat(landing): v2 — reveal on TrustBar`
- [ ] **Step 2: `HowItWorksStep.tsx`** — apply pattern (the outer wrapping `<div>`), run `npx tsc --noEmit`, commit: `feat(landing): v2 — reveal on HowItWorksStep`
- [ ] **Step 3: `FeatureSection.tsx`** — apply pattern (outer `<section>`), run `npx tsc --noEmit`, commit: `feat(landing): v2 — reveal on FeatureSection`
- [ ] **Step 4: `ComparisonSection.tsx`** — apply pattern, run `npx tsc --noEmit`, commit: `feat(landing): v2 — reveal on ComparisonSection`
- [ ] **Step 5: `PricingCards.tsx`** — apply pattern, run `npx tsc --noEmit`, commit: `feat(landing): v2 — reveal on PricingCards`
- [ ] **Step 6: `PreLaunchPanel.tsx`** — apply pattern, run `npx tsc --noEmit`, commit: `feat(landing): v2 — reveal on PreLaunchPanel`
- [ ] **Step 7: `CtaBanner.tsx`** — apply pattern, run `npx tsc --noEmit`, commit: `feat(landing): v2 — reveal on CtaBanner`

### Task 8.3: Add reduced-motion e2e check

**Files:**
- Modify: `e2e/landing.spec.ts`

- [ ] **Step 1: Append the test**

```ts
  test("reveal sections are immediately visible under reduced motion", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    const firstReveal = page.locator(".reveal").first();
    // Under reduced motion the hook short-circuits to visible.
    await expect(firstReveal).toHaveAttribute("data-reveal", "visible");
    await context.close();
  });
```

- [ ] **Step 2: Run it**

Run: `npx playwright test e2e/landing.spec.ts --grep "reduced motion"`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add e2e/landing.spec.ts
git commit -m "test(landing): v2 — verify reveals respect prefers-reduced-motion"
```

### Task 8.4: Refresh visual baselines and run full test suite

- [ ] **Step 1: Update Playwright baselines**

Run: `npx playwright test e2e/landing-visual.spec.ts --update-snapshots`
Expected: 3 baselines updated; visual regression test passes.

- [ ] **Step 2: Run the full e2e suite**

Run: `npx playwright test`
Expected: all e2e tests PASS.

- [ ] **Step 3: Run all vitest unit tests**

Run: `npm test`
Expected: all vitest tests PASS (including the new `useReveal` tests + the existing 8 baseline).

- [ ] **Step 4: Run a Lighthouse check on the local build**

Run: `npm run build && npm run start &` (in a background terminal)
Then in the foreground: `npx lighthouse http://localhost:3000 --view --preset=desktop --only-categories=performance,accessibility,best-practices,seo --output=json --output=html --output-path=./lighthouse-v2`
Expected: LCP < 2.5s, CLS < 0.1, INP < 200ms, A11y ≥ 95, Performance ≥ 90.

If any metric regresses below target, do not advance to the merge step. Identify the regressing component, profile in Chrome DevTools, fix, re-run.

- [ ] **Step 5: Commit visual baseline refresh**

```bash
git add e2e/landing-visual.spec.ts*
git commit -m "test(landing): v2 — final visual baseline lock"
```

### Task 8.5: Final cleanup — remove unused webp placeholders

- [ ] **Step 1: Verify nothing references the placeholders**

Run: `grep -rn 'howitworks-1.webp\|howitworks-2.webp\|howitworks-3.webp\|smart-fill-mockup.webp' src/ e2e/`
Expected: zero matches. If any remain, fix the references first.

- [ ] **Step 2: Delete the placeholders**

Run:
```bash
git rm public/landing/howitworks-1.webp public/landing/howitworks-2.webp public/landing/howitworks-3.webp public/landing/smart-fill-mockup.webp
```

- [ ] **Step 3: Commit**

```bash
git commit -m "chore(landing): v2 — retire gray placeholder webps"
```

---

## Self-Review

A quick coverage check against `docs/superpowers/specs/2026-05-19-landing-v2-design.md`:

| Spec section | Plan task(s) | Status |
|---|---|---|
| §2.1 Testimonials → Pre-launch | Task 7.1 | ✅ |
| §2.2 Motion library → CSS + useReveal | Tasks 1.3, 8.1, 8.2 | ✅ |
| §2.3 Hero overlay (Variant A) | Task 2.2 | ✅ |
| §2.4 Feature sections (Variant B) | Tasks 5.1–5.7 | ✅ |
| §2.5 Final CTA banner (Variant B) | Task 1.5 | ✅ |
| §3 Visual rhythm | Tasks 1.5 (loud), 5.x (rich), 2.3 (quiet) | ✅ |
| §4.1 Sticky nav | Task 1.4 | ✅ |
| §4.2 Hero polish | Tasks 2.1, 2.2, 2.3 | ✅ |
| §4.3 Trust bar | Task 3.1 | ✅ |
| §4.4 How It Works mockups | Tasks 4.1–4.6 | ✅ |
| §4.5 Alternating feature sections | Tasks 5.1–5.7 | ✅ |
| §4.6 Comparison + Pricing | Tasks 6.1–6.3 | ✅ |
| §4.7 Pre-launch panel | Task 7.1 | ✅ |
| §4.8 FAQ polish | Task 7.2 | ✅ |
| §4.9 Final CTA banner | Task 1.5 | ✅ |
| §4.10 Premium footer | Task 1.6 | ✅ |
| §5 Component inventory | All blocks | ✅ |
| §6 Token additions | Tasks 1.1, 1.2 | ✅ |
| §7 Motion strategy | Tasks 1.3, 8.1, 8.2 | ✅ |
| §8 A11y budget | Verified inline (focus rings, semantic HTML, aria-hidden, reduced motion); concretely tested in Task 8.3 + Lighthouse step 8.4.4 | ✅ |
| §9 Performance budget | Lighthouse run in Task 8.4 | ✅ |
| §10 Out of scope | Nothing in plan touches dashboard, fake testimonials, or installs motion libs | ✅ |

**Placeholder scan:** none found. Every step has concrete code, paths, and commands.

**Type consistency:** `useReveal` returns `{ ref, visible }` and is consumed identically in every Block 8 task. `FeatureSection` `tint` prop is `1 | 2 | 3 | 4 | 5` and all 5 callsites in Task 5.7 use literal numerals matching that type. `HowItWorksStep` prop signature changes from `imageSrc`/`imageAlt` to `mockup` in Task 4.2; Task 4.6 is the only callsite and uses the new signature.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-19-landing-v2-redesign.md`. Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration. Best for a plan this size — keeps main context clean and parallelizes blocks where deps allow.

**2. Inline Execution** — execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints. Lower context overhead from agent handoffs but no parallelism.

**Which approach?**
