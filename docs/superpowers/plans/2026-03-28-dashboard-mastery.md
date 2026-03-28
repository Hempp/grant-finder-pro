# Dashboard Mastery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Push Mason Score from 74 to 100 (MASTER MASON) and add UX workflow features (onboarding, breadcrumbs, notifications, quick-apply, deadline views, celebrations)

**Architecture:** Phase 1 fixes UI primitives and all 7 dashboard pages for Mason compliance. Phase 2 adds new components and one Prisma migration. All work is in the dashboard — no marketing page changes.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, Prisma, NextAuth, Lucide icons

**Spec:** `docs/superpowers/specs/2026-03-28-dashboard-mastery-design.md`

---

## Phase 1: Mason's Eye Fix Pass (74 → 100)

### Task 1: Update Focus Ring in globals.css

**Files:**
- Modify: `src/app/globals.css:350-358`

- [ ] **Step 1: Replace the existing `.focus-ring` class with focus-visible variant**

In `src/app/globals.css`, find and replace the existing `.focus-ring` block:

```css
/* OLD — remove this block (lines ~350-358) */
.focus-ring {
  transition: box-shadow 0.2s ease;
}

.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.5);
}
```

Replace with:

```css
/* Mason's Eye: Standardized focus ring */
.focus-ring {
  transition: box-shadow 0.2s ease;
}

.focus-ring:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #020617, 0 0 0 4px rgba(16, 185, 129, 0.5);
}
```

The double ring (2px slate-950 offset + 2px emerald) ensures visibility on both light and dark backgrounds.

- [ ] **Step 2: Add confetti keyframes for Phase 2**

At the end of the keyframes section (after the `@keyframes drift` block, around line 254), add:

```css
/* Confetti particle fall */
@keyframes confetti-fall {
  0% {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(100vh) rotate(720deg);
  }
}

.animate-confetti {
  animation: confetti-fall 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style: update focus ring to focus-visible and add confetti keyframes"
```

---

### Task 2: Fix Button Component Focus Ring

**Files:**
- Modify: `src/components/ui/button.tsx:55-61`

- [ ] **Step 1: Update baseStyles to use focus-visible**

In `src/components/ui/button.tsx`, replace the `baseStyles` string:

```typescript
    const baseStyles = `
      inline-flex items-center justify-center gap-2 font-medium
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      active:scale-[0.98]
    `;
```

With:

```typescript
    const baseStyles = `
      inline-flex items-center justify-center gap-2 font-medium
      transition-colors duration-200 ease-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      active:scale-[0.98]
    `;
```

Changes: `focus:` → `focus-visible:`, `transition-all` → `transition-colors`, `ring-offset-slate-900` → `ring-offset-slate-950`.

- [ ] **Step 2: Update all variant focus ring colors to match**

In the same file, update each variant's focus ring from `focus:ring-*` to `focus-visible:ring-*`:

```typescript
    const variants = {
      primary: `
        bg-emerald-500 hover:bg-emerald-400 text-white
        focus-visible:ring-emerald-500
        shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40
      `,
      secondary: `
        bg-slate-700 hover:bg-slate-600 text-white
        border border-slate-600 hover:border-slate-500
        focus-visible:ring-slate-500
      `,
      ghost: `
        hover:bg-slate-800 text-slate-300 hover:text-white
        focus-visible:ring-slate-500
      `,
      danger: `
        bg-red-500 hover:bg-red-400 text-white
        focus-visible:ring-red-500
        shadow-lg shadow-red-500/25 hover:shadow-red-500/40
      `,
      success: `
        bg-green-500 hover:bg-green-400 text-white
        focus-visible:ring-green-500
        shadow-lg shadow-green-500/25 hover:shadow-green-500/40
      `,
      outline: `
        bg-transparent border-2 border-emerald-500 text-emerald-400
        hover:bg-emerald-500/10 hover:text-emerald-300
        focus-visible:ring-emerald-500
      `,
      gradient: `
        bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500
        hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400
        text-white focus-visible:ring-emerald-500
        shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40
        animate-gradient bg-[length:200%_100%]
      `,
    };
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/button.tsx
git commit -m "fix: update Button to use focus-visible and transition-colors"
```

---

### Task 3: Fix Input Component Focus Ring

**Files:**
- Modify: `src/components/ui/input.tsx:17-21`

- [ ] **Step 1: Update Input, Textarea, and Select focus styles**

In `src/components/ui/input.tsx`, update all three components.

For `Input` (line ~20), change the className:

```typescript
          className={`w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:border-transparent transition-colors duration-200 ${error ? "border-red-500" : ""} ${className}`}
```

For `Textarea` (line ~48), same change:

```typescript
          className={`w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:border-transparent transition-colors duration-200 resize-none ${error ? "border-red-500" : ""} ${className}`}
```

For `Select` (line ~77), same change:

```typescript
          className={`w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:border-transparent transition-colors duration-200 ${error ? "border-red-500" : ""} ${className}`}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/input.tsx
git commit -m "fix: update Input/Textarea/Select to focus-visible rings"
```

---

### Task 4: Fix Card Component Border Radius

**Files:**
- Modify: `src/components/ui/card.tsx:23`

- [ ] **Step 1: Update Card base radius from rounded-xl to rounded-2xl**

In `src/components/ui/card.tsx`, change line 23:

```typescript
    const baseStyles = "rounded-2xl transition-all duration-200";
```

Changed: `rounded-xl` → `rounded-2xl`, `duration-300` → `duration-200` (transition unification).

- [ ] **Step 2: Update CardTitle to use font-bold instead of font-semibold**

In `src/components/ui/card.tsx`, change the CardTitle default className (line ~93):

```typescript
        className={`text-lg font-bold text-white ${className}`}
```

Changed: `font-semibold` → `font-bold` (typography: 3 weight limit).

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/card.tsx
git commit -m "fix: Card uses rounded-2xl, duration-200, font-bold"
```

---

### Task 5: Fix Dashboard Layout — Sidebar Navigation

**Files:**
- Modify: `src/app/dashboard/layout.tsx`

This is the largest single task in Phase 1. It fixes touch targets, off-grid values, transitions, font weights, and restructures nav into groups.

- [ ] **Step 1: Replace the navigation array with grouped navigation**

Replace lines 24-31:

```typescript
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Find Grants", href: "/dashboard/grants", icon: Search },
  { name: "Applications", href: "/dashboard/applications", icon: FileText },
  { name: "Documents", href: "/dashboard/documents", icon: Upload },
  { name: "Organization", href: "/dashboard/organization", icon: Building2 },
  { name: "Referrals", href: "/dashboard/referrals", icon: Gift },
];
```

With:

```typescript
const navGroups = [
  {
    label: null,
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Find Grants", href: "/dashboard/grants", icon: Search },
      { name: "Applications", href: "/dashboard/applications", icon: FileText },
      { name: "Documents", href: "/dashboard/documents", icon: Upload },
    ],
  },
  {
    label: "Organization",
    items: [
      { name: "Profile", href: "/dashboard/organization", icon: Building2 },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
  {
    label: "More",
    items: [
      { name: "Referrals", href: "/dashboard/referrals", icon: Gift },
    ],
  },
];
```

- [ ] **Step 2: Replace the nav rendering with grouped rendering**

Replace the `<nav>` block (lines ~132-152):

```tsx
        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              {group.label && (
                <p className="text-xs text-slate-600 uppercase tracking-wider font-medium px-4 pt-6 pb-1">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMobileMenu}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-400 pl-3"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <span className="font-medium text-sm leading-5">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
```

Key fixes:
- `py-3 sm:py-2.5` → `py-3` (on grid, 44px touch target)
- `pl-3.5` → `pl-3` (on grid)
- `hover:translate-x-1` removed (mixed hover type)
- `transition-all` → `transition-colors duration-200`
- `leading-5` added to text (baseline grid)
- `space-y-0.5` → `space-y-1` (on 4px grid)

- [ ] **Step 3: Remove the separate Settings link from the bottom section**

Replace the bottom section (lines ~155-171):

```tsx
        {/* Bottom section */}
        <div className="p-3 border-t border-slate-800/60">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200 w-full"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium text-sm leading-5">Sign Out</span>
          </button>
        </div>
```

Settings is now in the "Organization" nav group, so it's removed from the bottom. Only Sign Out remains.

- [ ] **Step 4: Fix mobile header touch targets**

Update the mobile header hamburger button (around line 58-64):

```tsx
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 min-w-11 min-h-11 flex items-center justify-center text-slate-400 hover:text-white transition-colors duration-200"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
        >
```

Add `min-w-11 min-h-11 flex items-center justify-center` for 44px touch target.

- [ ] **Step 5: Fix sidebar logo font weight**

In the desktop logo section (around line 87-89):

```tsx
            <span className="text-xl font-bold text-white">
              Grant<span className="text-emerald-400">Pilot</span>
            </span>
```

This already uses `font-bold` — no change needed. Verify and move on.

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/layout.tsx
git commit -m "fix: sidebar nav groups, touch targets, on-grid spacing, unified transitions"
```

---

### Task 6: Fix Main Dashboard Page — Spacing, Radius, Typography, Buttons

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Replace the page wrapper with gap-based layout**

Change the root `<div>` (line 201):

```tsx
    <div className="p-6 lg:p-8 flex flex-col gap-8 animate-fade-in">
```

Remove `animate-fade-in` from here only if it was on a child element; keep it on the root.

- [ ] **Step 2: Remove all mb-* and mt-* between sections**

Throughout the file, remove these classes from section containers:
- `mb-6 sm:mb-8` from header div, stats grid, readiness card, upgrade prompt
- `mt-4 sm:mt-8` from quick actions card

Each section is now a direct child of the gap-8 flex container — no margins needed.

- [ ] **Step 3: Fix header buttons**

Replace the button pair (around line 211-224):

```tsx
          <div className="flex gap-3">
            <Link href="/dashboard/grants">
              <Button variant="outline" className="text-sm">
                <Search className="h-4 w-4" />
                Find Grants
              </Button>
            </Link>
            <Link href="/dashboard/documents">
              <Button variant="primary" className="text-sm">
                <Plus className="h-4 w-4" />
                Upload
              </Button>
            </Link>
          </div>
```

Changes: `variant="secondary"` → `variant="outline"`, `variant="gradient"` → `variant="primary"`, removed responsive text-size classes (use `text-sm` always), removed `flex-1 sm:flex-none` wrapper (buttons are intrinsic width).

- [ ] **Step 4: Fix stats grid gap**

```tsx
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
```

Changed: `gap-3 sm:gap-6` → `gap-4 lg:gap-6` (on 4px grid, consistent).

- [ ] **Step 5: Fix grant item inner radius and typography**

For each grant card link in the grants list (around line 419):

```tsx
                  <Link
                    key={grant.id}
                    href={`/dashboard/grants/${grant.id}/apply`}
                    className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-800/80 transition-colors duration-200 border border-transparent hover:border-slate-700 group"
                  >
```

Changes: `rounded-xl` → `rounded-lg` (nested radius), `transition-all duration-200 block` → `transition-colors duration-200`.

- [ ] **Step 6: Fix the match score label**

Replace `text-[10px]` (around line 452):

```tsx
                      <div className="text-slate-500 text-xs leading-4 mt-1">Match</div>
```

Changed: `text-[10px] sm:text-xs` → `text-xs leading-4`.

- [ ] **Step 7: Fix application item inner radius**

For each application card (around line 500):

```tsx
                  <div
                    key={app.id}
                    className="p-4 bg-slate-900/50 rounded-lg hover:bg-slate-800/80 transition-colors duration-200 border border-transparent hover:border-slate-700"
                  >
```

Changed: `rounded-xl` → `rounded-lg`, `transition-all` → `transition-colors`.

- [ ] **Step 8: Fix font-semibold → font-bold throughout**

Replace all `font-semibold` occurrences in this file with `font-bold`:
- Header h1: `font-bold` (already correct)
- Card section titles "Top Matching Grants": `font-bold`
- Card section titles "Recent Applications": `font-bold`
- Grant title `font-medium` (keep as-is — it's a secondary heading)
- Quick Actions h2: `font-bold`

- [ ] **Step 9: Add aria-labels to SVG gauges**

On the readiness gauge SVG (around line 281):

```tsx
                <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36" role="img" aria-label={`Grant readiness score: ${readiness.score} out of 100`}>
```

On each grant match score SVG (around line 435):

```tsx
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 transform -rotate-90" role="img" aria-label={`Match score: ${grant.matchScore || 0} percent`}>
```

- [ ] **Step 10: Fix Quick Actions card transition consistency**

For quick action links, unify to `transition-colors duration-200`:

```tsx
              className="flex flex-col items-center p-4 sm:p-6 bg-slate-900/50 rounded-lg hover:bg-slate-800/80 transition-colors duration-200 text-center border border-transparent hover:border-emerald-500/20 group"
```

Changed: `transition-all duration-300` → `transition-colors duration-200`, removed `card-interactive` class.

Note: Quick Action cards keep `rounded-xl` — they are top-level cards, not nested. Only items *inside* Cards get `rounded-lg`.

Keep the `group-hover:scale-110 transition-transform` on icons (this is the one approved scale transform).

- [ ] **Step 11: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "fix: dashboard spacing, radius, typography, buttons, aria-labels, transitions"
```

---

### Task 7: Fix Grants Page — Spacing and Typography

**Files:**
- Modify: `src/app/dashboard/grants/page.tsx`

- [ ] **Step 1: Read the full file to identify all violations**

```bash
cd /Users/seg/grant-finder-pro
grep -n "font-semibold\|rounded-xl\|mb-6\|mb-8\|mt-4\|mt-8\|duration-300\|text-\[10" src/app/dashboard/grants/page.tsx
```

- [ ] **Step 2: Apply spacing, radius, typography, and transition fixes**

Apply the same mechanical fixes as Task 6:
- Root wrapper: `flex flex-col gap-8` with `p-6 lg:p-8`
- Remove all `mb-*` / `mt-*` between sections
- `font-semibold` → `font-bold`
- `rounded-xl` (nested items) → `rounded-lg`
- `transition-all duration-300` → `transition-colors duration-200`
- `text-[10px]` → `text-xs leading-4`
- Add `leading-5` to `text-sm` elements
- Add `leading-4` to `text-xs` elements

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/grants/page.tsx
git commit -m "fix: grants page spacing, radius, typography, transitions"
```

---

### Task 8: Fix Remaining Dashboard Pages — Bulk Spacing/Typography Pass

**Files:**
- Modify: `src/app/dashboard/applications/page.tsx`
- Modify: `src/app/dashboard/documents/page.tsx`
- Modify: `src/app/dashboard/settings/page.tsx`
- Modify: `src/app/dashboard/organization/page.tsx`
- Modify: `src/app/dashboard/referrals/page.tsx`
- Modify: `src/app/dashboard/grants/[id]/page.tsx`
- Modify: `src/app/dashboard/grants/[id]/apply/page.tsx`
- Modify: `src/app/dashboard/applications/[id]/page.tsx`

- [ ] **Step 1: For each file, run the same grep to find violations**

```bash
for f in src/app/dashboard/applications/page.tsx src/app/dashboard/documents/page.tsx src/app/dashboard/settings/page.tsx src/app/dashboard/organization/page.tsx src/app/dashboard/referrals/page.tsx src/app/dashboard/grants/*/page.tsx src/app/dashboard/applications/*/page.tsx; do
  echo "=== $f ===" && grep -cn "font-semibold\|rounded-xl\|mb-6\|mb-8\|mt-4\|mt-8\|duration-300\|text-\[10\|py-2\.5\|pl-3\.5" "$f" 2>/dev/null
done
```

- [ ] **Step 2: Apply the same mechanical fixes to each file**

For every file:
- Root wrapper: add `p-6 lg:p-8` if missing, use `flex flex-col gap-8` for section spacing
- `font-semibold` → `font-bold`
- Nested `rounded-xl` → `rounded-lg` (only for items inside cards)
- `transition-all duration-300` → `transition-colors duration-200`
- Remove section-level `mb-*` / `mt-*`, rely on parent gap
- Add `aria-required="true"` to required form inputs in organization and apply pages

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/applications/ src/app/dashboard/documents/ src/app/dashboard/settings/ src/app/dashboard/organization/ src/app/dashboard/referrals/ src/app/dashboard/grants/
git commit -m "fix: bulk Mason compliance pass on all remaining dashboard pages"
```

---

### Task 9: Verify Phase 1 — Build Check

- [ ] **Step 1: Run TypeScript compilation check**

```bash
cd /Users/seg/grant-finder-pro
npx tsc --noEmit 2>&1 | head -30
```

Expected: No errors (or only pre-existing Prisma/build errors unrelated to our changes).

- [ ] **Step 2: Grep for any remaining violations**

```bash
grep -rn "font-semibold\|text-\[10px\]\|py-2\.5\|pl-3\.5" src/app/dashboard/ --include="*.tsx" | grep -v node_modules
```

Expected: Zero results.

- [ ] **Step 3: Grep for off-grid margin/padding usage between sections**

```bash
grep -rn "mb-6\|mb-8\|mt-8" src/app/dashboard/ --include="*.tsx" | grep -v node_modules | head -20
```

Expected: Zero results (or only within-component spacing, not between sections).

- [ ] **Step 4: Commit verification results as a tag**

```bash
git tag mason-phase1-complete
```

---

### Task 9.5: Optical Icon Centering + Nav Focus Rings + Icon Gap Cleanup

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/dashboard/layout.tsx`
- Modify: all dashboard page files (icon mr-* cleanup)

- [ ] **Step 1: Add optical centering to Sparkles icon in dashboard header**

In `src/app/dashboard/page.tsx`, find the header Sparkles icon and add `translate-y-px`:

```tsx
            <Sparkles className="h-6 w-6 text-emerald-400 animate-breathe translate-y-px" />
```

- [ ] **Step 2: Add focus-visible rings to sidebar nav links**

In `src/app/dashboard/layout.tsx`, add to each nav `<Link>` className:

```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
```

Apply to both the nav group items and the Sign Out button.

- [ ] **Step 3: Remove stray mr-* on icons inside Buttons**

```bash
grep -rn "mr-1\|mr-2" src/app/dashboard/ --include="*.tsx"
```

For each match inside a `<Button>` (which has `gap-2` in baseStyles), remove the `mr-*` class:
- `<Zap className="h-4 w-4 mr-1" />` → `<Zap className="h-4 w-4" />`
- `<Search className="h-4 w-4 mr-1 sm:mr-2" />` → `<Search className="h-4 w-4" />`

Icons outside Buttons (standalone flex containers) keep their gap from the parent `gap-2`.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/
git commit -m "fix: optical icon centering, nav focus rings, icon gap cleanup"
```

---

## Phase 2: UX Workflow Overhaul

### Task 10: Prisma Migration — Add hasCompletedOnboarding

**Files:**
- Modify: `prisma/schema.prisma:12-70`

- [ ] **Step 1: Add field to User model**

In `prisma/schema.prisma`, add to the User model after the `hasUsedTrial` line:

```prisma
  // Onboarding
  hasCompletedOnboarding Boolean @default(false)
```

- [ ] **Step 2: Add Notification model**

At the end of `prisma/schema.prisma`, add:

```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String   // deadline_approaching, new_match, status_change, trial_expiring
  title     String
  message   String
  grantId   String?
  readAt    DateTime?
  createdAt DateTime @default(now())

  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  grant Grant? @relation(fields: [grantId], references: [id], onDelete: SetNull)

  @@index([userId, readAt])
  @@index([userId, createdAt])
}
```

- [ ] **Step 3: Add the relation fields to User and Grant models**

In the User model, add:

```prisma
  notifications Notification[]
```

In the Grant model, add:

```prisma
  notifications Notification[]
```

- [ ] **Step 4: Generate migration**

```bash
cd /Users/seg/grant-finder-pro
npx prisma migrate dev --name add-onboarding-and-notifications
```

Expected: Migration created successfully.

- [ ] **Step 5: Commit**

```bash
git add prisma/
git commit -m "feat: add hasCompletedOnboarding and Notification model"
```

---

### Task 11: Breadcrumbs Component

**Files:**
- Create: `src/components/dashboard/Breadcrumbs.tsx`
- Modify: `src/app/dashboard/layout.tsx`

- [ ] **Step 1: Create the Breadcrumbs component**

Create `src/components/dashboard/Breadcrumbs.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/grants": "Find Grants",
  "/dashboard/applications": "Applications",
  "/dashboard/documents": "Documents",
  "/dashboard/organization": "Profile",
  "/dashboard/settings": "Settings",
  "/dashboard/referrals": "Referrals",
};

export function Breadcrumbs() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  // Only show breadcrumbs for pages 3+ segments deep
  // e.g., /dashboard/grants/abc123 = ["dashboard", "grants", "abc123"]
  if (segments.length < 3) return null;

  const crumbs: { label: string; href?: string }[] = [];

  // Build breadcrumb trail
  let currentPath = "";
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const isLast = i === segments.length - 1;

    if (i === 0) continue; // skip "dashboard" — it's implied

    const label = routeLabels[currentPath];
    if (label) {
      crumbs.push({ label, href: isLast ? undefined : currentPath });
    } else if (isLast) {
      // Last segment with no label — it's a dynamic segment like "apply"
      const segment = segments[i];
      if (segment === "apply") {
        crumbs.push({ label: "Apply" });
      } else if (segment === "draft") {
        crumbs.push({ label: "Draft" });
      } else {
        // Dynamic ID — skip (the parent label covers it)
      }
    } else {
      // Dynamic ID in the middle — add parent label with ID context
      const parentPath = currentPath.split("/").slice(0, -1).join("/");
      const parentLabel = routeLabels[parentPath];
      if (parentLabel && !crumbs.find((c) => c.label === parentLabel)) {
        crumbs.push({ label: parentLabel, href: parentPath });
      }
    }
  }

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="px-6 lg:px-8 pt-4">
      <ol className="flex items-center gap-2 text-sm">
        <li>
          <Link
            href="/dashboard"
            className="text-slate-500 hover:text-white transition-colors duration-200"
          >
            Dashboard
          </Link>
        </li>
        {crumbs.map((crumb, i) => (
          <li key={i} className="flex items-center gap-2">
            <ChevronRight className="h-3 w-3 text-slate-600" aria-hidden="true" />
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-slate-500 hover:text-white transition-colors duration-200"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-slate-300 font-medium">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 2: Add Breadcrumbs to dashboard layout**

In `src/app/dashboard/layout.tsx`, add import at the top:

```tsx
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";
```

Then in the main content area, add Breadcrumbs between TrialBanner and children (around line 176):

```tsx
      <main id="main-content" className="flex-1 overflow-auto bg-slate-950" role="main">
        <TrialBanner />
        <Breadcrumbs />
        <ErrorBoundary>
          <div className="bg-glow-emerald">
            {children}
          </div>
        </ErrorBoundary>
      </main>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/Breadcrumbs.tsx src/app/dashboard/layout.tsx
git commit -m "feat: add breadcrumb navigation to dashboard"
```

---

### Task 12: Notification Bell Component + API

**Files:**
- Create: `src/components/dashboard/NotificationBell.tsx`
- Create: `src/app/api/notifications/unread/route.ts`
- Modify: `src/app/dashboard/layout.tsx`

- [ ] **Step 1: Create the unread notifications API**

Create `src/app/api/notifications/unread/route.ts`:

```tsx
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0, items: [] });
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
      readAt: null,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    count: notifications.length,
    items: notifications,
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action } = await request.json();

  if (action === "mark_all_read") {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, readAt: null },
      data: { readAt: new Date() },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
```

- [ ] **Step 2: Create the NotificationBell component**

Create `src/components/dashboard/NotificationBell.tsx`:

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Clock, Sparkles, FileText, AlertCircle } from "lucide-react";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
}

const typeIcons: Record<string, { icon: typeof Bell; color: string }> = {
  deadline_approaching: { icon: Clock, color: "text-red-400" },
  new_match: { icon: Sparkles, color: "text-emerald-400" },
  status_change: { icon: FileText, color: "text-blue-400" },
  trial_expiring: { icon: AlertCircle, color: "text-amber-400" },
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications/unread");
      if (res.ok) {
        const data = await res.json();
        setCount(data.count);
        setItems(data.items);
      }
    } catch {
      // silently fail — bell just won't show a count
    }
  }

  async function markAllRead() {
    await fetch("/api/notifications/unread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_all_read" }),
    });
    setCount(0);
    setItems([]);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 min-w-11 min-h-11 flex items-center justify-center text-slate-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-slate-800/50"
        aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full animate-glow-pulse" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl shadow-black/30 z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Notifications</h3>
            {count > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
              >
                Mark all read
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-8 w-8 text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No new notifications</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {items.map((item) => {
                const typeInfo = typeIcons[item.type] || typeIcons.new_match;
                const Icon = typeInfo.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-4 hover:bg-slate-800/50 transition-colors duration-200 border-b border-slate-800/50 last:border-0"
                  >
                    <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${typeInfo.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium leading-5">{item.title}</p>
                      <p className="text-xs text-slate-400 leading-4 mt-1 truncate">{item.message}</p>
                      <p className="text-xs text-slate-600 leading-4 mt-1">{timeAgo(item.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="p-3 border-t border-slate-800">
            <Link
              href="/dashboard/settings"
              className="block text-center text-xs text-slate-500 hover:text-slate-300 transition-colors duration-200"
              onClick={() => setOpen(false)}
            >
              Notification settings
            </Link>
          </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Add NotificationBell to the dashboard layout sidebar**

In `src/app/dashboard/layout.tsx`, add import:

```tsx
import { NotificationBell } from "@/components/dashboard/NotificationBell";
```

In the desktop logo section, add the bell next to the logo:

```tsx
        <div className="hidden lg:flex items-center justify-between p-6 border-b border-slate-800/60">
          <Link href="/" className="flex items-center gap-2 group">
            <Sparkles className="h-8 w-8 text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-xl font-bold text-white">
              Grant<span className="text-emerald-400">Pilot</span>
            </span>
          </Link>
          <NotificationBell />
        </div>
```

Changed the `<div>` from `block` to `flex items-center justify-between` to accommodate the bell.

In the mobile header, add the bell before the hamburger:

```tsx
        <div className="flex items-center gap-1">
          <NotificationBell />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            ...
          >
```

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/NotificationBell.tsx src/app/api/notifications/unread/route.ts src/app/dashboard/layout.tsx
git commit -m "feat: add notification bell with unread count and dropdown"
```

---

### Task 13: Expiring Soon Card (Dashboard)

**Files:**
- Create: `src/components/dashboard/ExpiringSoon.tsx`
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Create the ExpiringSoon component**

Create `src/components/dashboard/ExpiringSoon.tsx`:

```tsx
"use client";

import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui";

interface ExpiringGrant {
  id: string;
  title: string;
  funder: string;
  deadline: string;
  matchScore: number | null;
}

interface ExpiringSoonProps {
  grants: ExpiringGrant[];
}

function daysUntil(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function ExpiringSoon({ grants }: ExpiringSoonProps) {
  const expiring = grants
    .filter((g) => g.deadline && daysUntil(g.deadline) >= 0 && daysUntil(g.deadline) <= 14)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  if (expiring.length === 0) return null;

  return (
    <Card className="border-amber-500/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500/20 p-2 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Expiring Soon</h2>
        </div>
        <Link
          href="/dashboard/grants?sort=deadline"
          className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1 group"
        >
          View all <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {expiring.map((grant) => {
          const days = daysUntil(grant.deadline);
          const urgencyColor = days <= 3 ? "text-red-400" : days <= 7 ? "text-amber-400" : "text-slate-400";
          return (
            <Link
              key={grant.id}
              href={`/dashboard/grants/${grant.id}/apply`}
              className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-800/80 transition-colors duration-200 border border-transparent hover:border-slate-700 group"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-sm text-white font-medium leading-5 truncate group-hover:text-emerald-400 transition-colors duration-200">
                  {grant.title}
                </h3>
                <p className="text-xs text-slate-500 leading-4 truncate">{grant.funder}</p>
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ml-4 flex-shrink-0 ${urgencyColor}`}>
                <Clock className="h-3.5 w-3.5" />
                {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d left`}
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Add ExpiringSoon to the dashboard page**

In `src/app/dashboard/page.tsx`, add import:

```tsx
import { ExpiringSoon } from "@/components/dashboard/ExpiringSoon";
```

In the `fetchData` function, store the full grants list (not just 3):

```tsx
        const allGrants = grantsList;
        setGrants(grantsList.slice(0, 3));
```

Add state for all grants:

```tsx
  const [allGrants, setAllGrants] = useState<Grant[]>([]);
```

Set it in fetchData:

```tsx
        setAllGrants(grantsList);
```

Then render ExpiringSoon between the upgrade prompt and the grants/applications grid:

```tsx
      {/* Expiring Soon */}
      {!loading && <ExpiringSoon grants={allGrants} />}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/ExpiringSoon.tsx src/app/dashboard/page.tsx
git commit -m "feat: add Expiring Soon card to dashboard"
```

---

### Task 14: Deadline Timeline (Grants Page)

**Files:**
- Create: `src/components/dashboard/DeadlineTimeline.tsx`
- Modify: `src/app/dashboard/grants/page.tsx`

- [ ] **Step 1: Create the DeadlineTimeline component**

Create `src/components/dashboard/DeadlineTimeline.tsx`:

```tsx
"use client";

import { useMemo } from "react";

interface TimelineGrant {
  id: string;
  title: string;
  deadline: string | null;
}

interface DeadlineTimelineProps {
  grants: TimelineGrant[];
  onDotClick?: (grantId: string) => void;
}

function daysFromNow(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function DeadlineTimeline({ grants, onDotClick }: DeadlineTimelineProps) {
  const timelineGrants = useMemo(() => {
    return grants
      .filter((g) => g.deadline && daysFromNow(g.deadline) >= 0 && daysFromNow(g.deadline) <= 60)
      .map((g) => ({ ...g, days: daysFromNow(g.deadline!) }))
      .sort((a, b) => a.days - b.days);
  }, [grants]);

  if (timelineGrants.length === 0) return null;

  const markers = [
    { label: "Today", day: 0 },
    { label: "7d", day: 7 },
    { label: "14d", day: 14 },
    { label: "30d", day: 30 },
    { label: "60d", day: 60 },
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
      {/* Mobile: simple summary */}
      <div className="sm:hidden">
        <div className="flex items-center gap-4 text-sm">
          {timelineGrants.filter((g) => g.days <= 7).length > 0 && (
            <span className="text-red-400 font-medium">
              {timelineGrants.filter((g) => g.days <= 7).length} due this week
            </span>
          )}
          {timelineGrants.filter((g) => g.days > 7 && g.days <= 30).length > 0 && (
            <span className="text-amber-400 font-medium">
              {timelineGrants.filter((g) => g.days > 7 && g.days <= 30).length} this month
            </span>
          )}
          {timelineGrants.filter((g) => g.days > 30).length > 0 && (
            <span className="text-slate-400">
              {timelineGrants.filter((g) => g.days > 30).length} later
            </span>
          )}
        </div>
      </div>

      {/* Desktop: visual timeline */}
      <div className="hidden sm:block">
        <div className="relative h-12">
          {/* Track */}
          <div className="absolute top-5 left-0 right-0 h-px bg-slate-700" />

          {/* Markers */}
          {markers.map((marker) => (
            <div
              key={marker.day}
              className="absolute top-0 -translate-x-1/2"
              style={{ left: `${(marker.day / 60) * 100}%` }}
            >
              <p className="text-xs text-slate-600 leading-4 mb-1">{marker.label}</p>
              <div className="w-px h-3 bg-slate-700 mx-auto" />
            </div>
          ))}

          {/* Dots */}
          {timelineGrants.map((grant) => {
            const color =
              grant.days <= 7 ? "bg-red-400" : grant.days <= 30 ? "bg-amber-400" : "bg-slate-400";
            const position = Math.min((grant.days / 60) * 100, 100);
            return (
              <button
                key={grant.id}
                onClick={() => onDotClick?.(grant.id)}
                className={`absolute top-4 -translate-x-1/2 w-2.5 h-2.5 rounded-full ${color} hover:scale-150 transition-transform duration-200 cursor-pointer`}
                style={{ left: `${position}%` }}
                title={`${grant.title} — ${grant.days}d left`}
                aria-label={`${grant.title}, ${grant.days} days until deadline`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add DeadlineTimeline to grants page**

In `src/app/dashboard/grants/page.tsx`, add import:

```tsx
import { DeadlineTimeline } from "@/components/dashboard/DeadlineTimeline";
```

Render it at the top of the page content, after the header and before the filter/search section. Pass the grants array and an `onDotClick` handler that scrolls to the grant:

```tsx
      {/* Deadline Timeline */}
      {!loading && grants.length > 0 && (
        <DeadlineTimeline
          grants={grants}
          onDotClick={(id) => {
            document.getElementById(`grant-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
        />
      )}
```

Add `id={`grant-${grant.id}`}` to each grant card in the list for scroll targeting.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/DeadlineTimeline.tsx src/app/dashboard/grants/page.tsx
git commit -m "feat: add deadline timeline strip to grants page"
```

---

### Task 15: Quick-Apply Button on Grants List

**Files:**
- Modify: `src/app/dashboard/grants/page.tsx`

- [ ] **Step 1: Add Apply button to grant cards with matchScore >= 75**

In the grant card rendering section, add an action area. Find where each grant card's content ends and add:

```tsx
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/50">
                {(grant.matchScore ?? 0) >= 75 && (
                  <Link href={`/dashboard/grants/${grant.id}/apply`}>
                    <Button size="sm" variant="primary">
                      Apply
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
                <Link href={`/dashboard/grants/${grant.id}`}>
                  <Button size="sm" variant={(grant.matchScore ?? 0) >= 75 ? "ghost" : "outline"}>
                    Details
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => { e.preventDefault(); toggleSave(grant.id); }}
                >
                  {grant.saved ? (
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
              </div>
```

Import `ArrowRight` from lucide-react if not already imported. Import `Link` from next/link if not already imported.

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/grants/page.tsx
git commit -m "feat: add quick-apply button on grant cards with 75%+ match"
```

---

### Task 16: Profile Progress Banner

**Files:**
- Create: `src/components/dashboard/ProfileProgressBanner.tsx`
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Create the ProfileProgressBanner component**

Create `src/components/dashboard/ProfileProgressBanner.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui";

interface ProfileField {
  key: string;
  label: string;
  filled: boolean;
  href: string;
}

export function ProfileProgressBanner() {
  const [fields, setFields] = useState<ProfileField[] | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/organizations");
      if (!res.ok) return;
      const data = await res.json();
      const org = data.organization;

      // Also check if user has uploaded at least one document
      const docsRes = await fetch("/api/documents");
      const docsData = docsRes.ok ? await docsRes.json() : { documents: [] };
      const hasDocuments = (docsData.documents || []).length > 0;

      const profileFields: ProfileField[] = [
        { key: "name", label: "Organization name", filled: !!org?.name, href: "/dashboard/organization" },
        { key: "type", label: "Organization type", filled: !!org?.type, href: "/dashboard/organization" },
        { key: "state", label: "State", filled: !!org?.state, href: "/dashboard/organization" },
        { key: "mission", label: "Mission statement", filled: !!org?.mission, href: "/dashboard/organization" },
        { key: "teamSize", label: "Team size", filled: !!org?.teamSize, href: "/dashboard/organization" },
        { key: "revenue", label: "Revenue range", filled: !!org?.revenue, href: "/dashboard/organization" },
        { key: "fundingTarget", label: "Funding target", filled: !!org?.fundingTarget, href: "/dashboard/organization" },
        { key: "documents", label: "At least one document", filled: hasDocuments, href: "/dashboard/documents" },
      ];

      setFields(profileFields);
    } catch {
      // silently fail
    }
  }

  if (!fields || dismissed) return null;

  const filledCount = fields.filter((f) => f.filled).length;
  const percentage = Math.round((filledCount / fields.length) * 100);

  if (percentage >= 80) return null;

  const nextAction = fields.find((f) => !f.filled);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <p className="text-sm font-bold text-white">Profile: {percentage}% complete</p>
            <button
              onClick={() => setDismissed(true)}
              className="text-slate-600 hover:text-slate-400 transition-colors duration-200"
              aria-label="Dismiss profile banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          {nextAction && (
            <p className="text-xs text-slate-400 leading-4">
              Next: Add your {nextAction.label.toLowerCase()} to improve match accuracy
            </p>
          )}
        </div>
        {nextAction && (
          <Link href={nextAction.href} className="flex-shrink-0">
            <Button size="sm" variant="outline">
              Complete
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add to dashboard page**

In `src/app/dashboard/page.tsx`, add import:

```tsx
import { ProfileProgressBanner } from "@/components/dashboard/ProfileProgressBanner";
```

Render it after the stats grid and before the readiness card:

```tsx
      {/* Profile Progress */}
      {!loading && <ProfileProgressBanner />}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/ProfileProgressBanner.tsx src/app/dashboard/page.tsx
git commit -m "feat: add profile progress banner to dashboard"
```

---

### Task 17: Onboarding Wizard

**Files:**
- Create: `src/app/dashboard/onboarding/layout.tsx`
- Create: `src/app/dashboard/onboarding/page.tsx`
- Modify: `src/app/dashboard/layout.tsx`

- [ ] **Step 1: Create onboarding layout (no sidebar)**

Create `src/app/dashboard/onboarding/layout.tsx`:

```tsx
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800/60 p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-emerald-400" />
          <span className="text-xl font-bold text-white">
            Grant<span className="text-emerald-400">Pilot</span>
          </span>
        </Link>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-12">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Create onboarding page**

Create `src/app/dashboard/onboarding/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, CheckCircle, Upload, Sparkles } from "lucide-react";
import { Button, Card, CardContent, Input, Textarea, Select } from "@/components/ui";

const grantTypes = [
  { value: "federal", label: "Federal grants (SBIR, NIH, NSF)" },
  { value: "state", label: "State & local grants" },
  { value: "foundation", label: "Foundation / corporate grants" },
  { value: "all", label: "All of the above" },
];

const orgTypes = [
  { value: "", label: "Select type..." },
  { value: "startup", label: "Startup" },
  { value: "small_business", label: "Small Business" },
  { value: "nonprofit", label: "Nonprofit" },
  { value: "research", label: "Research Institution" },
  { value: "university", label: "University" },
];

const states = [
  { value: "", label: "Select state..." },
  { value: "CA", label: "California" },
  { value: "NY", label: "New York" },
  { value: "TX", label: "Texas" },
  { value: "FL", label: "Florida" },
  { value: "WA", label: "Washington" },
  { value: "MA", label: "Massachusetts" },
  { value: "CO", label: "Colorado" },
  { value: "IL", label: "Illinois" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [profile, setProfile] = useState({
    name: "",
    type: "",
    state: "",
    mission: "",
  });

  function toggleType(value: string) {
    if (value === "all") {
      setSelectedTypes(["federal", "state", "foundation"]);
      return;
    }
    setSelectedTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  async function completeOnboarding() {
    setSaving(true);
    try {
      // Save organization profile
      await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          grantPreferences: selectedTypes,
        }),
      });

      // Mark onboarding complete
      await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });

      router.push("/dashboard?onboarded=true");
    } catch {
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all duration-200 ${
              s === step ? "w-8 bg-emerald-500" : s < step ? "w-2 bg-emerald-500/50" : "w-2 bg-slate-700"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardContent className="p-8 flex flex-col gap-6">
            <div className="text-center">
              <Sparkles className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Welcome to GrantPilot</h1>
              <p className="text-slate-400">What kind of grants are you looking for?</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {grantTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => toggleType(type.value)}
                  className={`flex items-center gap-3 p-4 rounded-lg border text-left transition-colors duration-200 ${
                    selectedTypes.includes(type.value) || (type.value === "all" && selectedTypes.length >= 3)
                      ? "border-emerald-500/50 bg-emerald-500/10 text-white"
                      : "border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedTypes.includes(type.value) || (type.value === "all" && selectedTypes.length >= 3)
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-slate-600"
                    }`}
                  >
                    {(selectedTypes.includes(type.value) || (type.value === "all" && selectedTypes.length >= 3)) && (
                      <CheckCircle className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium leading-5">{type.label}</span>
                </button>
              ))}
            </div>
            <Button
              variant="primary"
              onClick={() => setStep(2)}
              disabled={selectedTypes.length === 0}
              className="w-full"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardContent className="p-8 flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-2">Quick Profile</h1>
              <p className="text-slate-400">Help us find grants that match your organization</p>
            </div>
            <div className="flex flex-col gap-4">
              <Input
                label="Organization Name"
                placeholder="e.g., Acme Research Labs"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              />
              <Select
                label="Organization Type"
                options={orgTypes}
                value={profile.type}
                onChange={(e) => setProfile((p) => ({ ...p, type: e.target.value }))}
              />
              <Select
                label="State"
                options={states}
                value={profile.state}
                onChange={(e) => setProfile((p) => ({ ...p, state: e.target.value }))}
              />
              <Textarea
                label="One-sentence mission"
                placeholder="What does your organization do?"
                maxLength={200}
                value={profile.mission}
                onChange={(e) => setProfile((p) => ({ ...p, mission: e.target.value }))}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep(3)}
                disabled={!profile.name}
                className="flex-1"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardContent className="p-8 flex flex-col gap-6">
            <div className="text-center">
              <Upload className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Upload a Document</h1>
              <p className="text-slate-400">
                Upload a pitch deck or business plan to supercharge your matches
              </p>
            </div>
            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center hover:border-slate-600 transition-colors duration-200">
              <p className="text-slate-400 text-sm">Drag and drop a PDF, or click to browse</p>
              <p className="text-slate-600 text-xs mt-2">You can always add documents later</p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                variant="primary"
                onClick={completeOnboarding}
                isLoading={saving}
                loadingText="Setting up..."
                className="flex-1"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <button
              onClick={completeOnboarding}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors duration-200 text-center"
            >
              Skip for now
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Add onboarding redirect to dashboard layout**

In `src/app/dashboard/layout.tsx`, add an onboarding check. Import `useEffect` and add a redirect:

```tsx
import { useRouter } from "next/navigation";
```

Inside the `DashboardLayout` component, before the return statement:

```tsx
  const router = useRouter();

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const res = await fetch("/api/user/onboarding");
        if (res.ok) {
          const data = await res.json();
          if (!data.hasCompletedOnboarding) {
            router.push("/dashboard/onboarding");
          }
        }
      } catch {
        // silently fail — don't block dashboard access
      }
    }
    checkOnboarding();
  }, [router]);
```

Also create the GET endpoint in `src/app/api/user/onboarding/route.ts` (add to the same file as Step 4):

```tsx
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ hasCompletedOnboarding: true }); // don't redirect unauthenticated
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { hasCompletedOnboarding: true },
  });

  return NextResponse.json({ hasCompletedOnboarding: user?.hasCompletedOnboarding ?? false });
}
```

- [ ] **Step 4: Create onboarding completion API**

Create `src/app/api/user/onboarding/route.ts`:

```tsx
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { hasCompletedOnboarding: true },
  });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/onboarding/ src/app/api/user/onboarding/
git commit -m "feat: add 3-step onboarding wizard for new users"
```

---

### Task 18: Confetti + Success Modal

**Files:**
- Create: `src/components/dashboard/Confetti.tsx`
- Create: `src/components/dashboard/SuccessModal.tsx`
- Modify: `src/app/dashboard/grants/[id]/apply/page.tsx`

- [ ] **Step 1: Create Confetti component**

Create `src/components/dashboard/Confetti.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

const COLORS = ["#10b981", "#14b8a6", "#06b6d4", "#8b5cf6", "#f59e0b", "#ef4444"];

interface ConfettiProps {
  show: boolean;
  onComplete?: () => void;
}

export function Confetti({ show, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<
    { id: number; left: number; color: string; delay: number; size: number }[]
  >([]);

  useEffect(() => {
    if (!show) {
      setParticles([]);
      return;
    }

    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
      size: 4 + Math.random() * 8,
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 3500);

    return () => clearTimeout(timer);
  }, [show, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 animate-confetti"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create SuccessModal component**

Create `src/components/dashboard/SuccessModal.tsx`:

```tsx
"use client";

import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Modal, ModalContent, ModalFooter } from "@/components/ui";
import { Button } from "@/components/ui";
import { Confetti } from "./Confetti";

interface SuccessModalProps {
  show: boolean;
  grantTitle: string;
  applicationId: string;
  onClose: () => void;
}

export function SuccessModal({ show, grantTitle, applicationId, onClose }: SuccessModalProps) {
  return (
    <>
      <Confetti show={show} />
      <Modal isOpen={show} onClose={onClose}>
        <ModalContent className="text-center p-8">
          <div className="bg-emerald-500/20 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Application Submitted!</h2>
          <p className="text-slate-400 text-sm leading-5">
            &ldquo;{grantTitle}&rdquo; has been submitted. We&apos;ll track the outcome and notify you.
          </p>
        </ModalContent>
        <ModalFooter justify="center" className="gap-3">
          <Link href={`/dashboard/applications/${applicationId}`}>
            <Button variant="outline" size="sm">
              Track Application
            </Button>
          </Link>
          <Link href="/dashboard/grants">
            <Button variant="primary" size="sm">
              Apply to Another
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </ModalFooter>
      </Modal>
    </>
  );
}
```

- [ ] **Step 3: Wire SuccessModal into the apply page**

In `src/app/dashboard/grants/[id]/apply/page.tsx`, add imports:

```tsx
import { SuccessModal } from "@/components/dashboard/SuccessModal";
```

Add state:

```tsx
  const [showSuccess, setShowSuccess] = useState(false);
```

After a successful submission (find the submit handler and add after the success response):

```tsx
  setShowSuccess(true);
```

Add the modal at the end of the component's JSX:

```tsx
      <SuccessModal
        show={showSuccess}
        grantTitle={grant?.title || ""}
        applicationId={applicationId || ""}
        onClose={() => {
          setShowSuccess(false);
          router.push("/dashboard/applications");
        }}
      />
```

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/Confetti.tsx src/components/dashboard/SuccessModal.tsx src/app/dashboard/grants/\[id\]/apply/page.tsx
git commit -m "feat: add confetti celebration on application submission"
```

---

### Task 18.5: First Match Celebration Toast

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Add first-match toast to dashboard**

In `src/app/dashboard/page.tsx`, import the toast hook:

```tsx
import { useToast } from "@/components/ui";
```

Inside the component, add:

```tsx
  const { success } = useToast();
```

In the `fetchData` function, after setting grants, add:

```tsx
        // First match celebration
        if (grantsList.length > 0 && !localStorage.getItem("hasSeenFirstMatch")) {
          localStorage.setItem("hasSeenFirstMatch", "true");
          const topGrant = grantsList[0];
          success(
            "Your first match!",
            `GrantPilot found "${topGrant.title}" — ${topGrant.matchScore || 0}% match.`
          );
        }
```

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: add first-match celebration toast on dashboard"
```

---

### Task 19: Contextual Upgrade Prompts

**Files:**
- Modify: `src/app/dashboard/grants/[id]/apply/page.tsx`
- Modify: `src/app/dashboard/grants/page.tsx`

- [ ] **Step 1: Add AI drafting gate on apply page**

In `src/app/dashboard/grants/[id]/apply/page.tsx`, find where the "Generate with AI" button is rendered. Wrap it with a subscription check:

```tsx
{isPro ? (
  <Button onClick={handleGenerate} isLoading={generating}>
    <Sparkles className="h-4 w-4" />
    Generate with AI
  </Button>
) : (
  <UpgradePrompt
    feature="AI Application Intelligence"
    description="Let AI read the RFP and draft this section for you."
    variant="inline"
  />
)}
```

- [ ] **Step 2: Add match limit indicator on grants page**

In `src/app/dashboard/grants/page.tsx`, after loading the grants and before the grants list, add:

```tsx
{!loading && !isPro && subscription?.matchesUsedThisMonth >= 5 && (
  <UpgradePrompt
    feature="Unlimited Grant Matches"
    description={`You've used ${subscription.matchesUsedThisMonth}/5 matches this month. Upgrade for unlimited.`}
    variant="banner"
  />
)}
```

Add the import for `useSubscription` and `UpgradePrompt` if not already present:

```tsx
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/subscription/UpgradePrompt";
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/grants/\[id\]/apply/page.tsx src/app/dashboard/grants/page.tsx
git commit -m "feat: add contextual upgrade prompts at feature gates"
```

---

### Task 20: Final Verification

- [ ] **Step 1: Run TypeScript check**

```bash
cd /Users/seg/grant-finder-pro
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 2: Verify no Mason violations remain**

```bash
grep -rn "font-semibold\|text-\[10px\]\|py-2\.5\|pl-3\.5\|duration-300\|rounded-xl" src/app/dashboard/ --include="*.tsx" | grep -v "rounded-2xl" | head -20
```

Expected: Zero results (or only in non-dashboard files).

- [ ] **Step 3: Verify all new files exist**

```bash
ls -la src/components/dashboard/
ls -la src/app/dashboard/onboarding/
ls -la src/app/api/notifications/unread/
ls -la src/app/api/user/onboarding/
```

Expected: All 10 new files present.

- [ ] **Step 4: Final commit and tag**

```bash
git tag dashboard-mastery-complete
```
