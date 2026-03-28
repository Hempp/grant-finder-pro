# GrantPilot Dashboard Mastery — Design Spec

**Date:** 2026-03-28
**Goal:** Push Mason Score from 74 (FELLOW CRAFT) to 100 (MASTER MASON) + complete UX workflow overhaul
**Scope:** Dashboard app only (authenticated pages)

---

## Phase 1: Mason's Eye Fix Pass (74 → 100)

### 1.1 Spacing Standardization

**Violations fixed:** S1-003, S3-001, S4-001, B3-002

Define a spacing hierarchy applied to all dashboard pages:

```
Page padding:       p-6 lg:p-8          (24px / 32px)
Section gap:        gap-8               (32px between major sections)
Component gap:      gap-6               (24px between cards in a grid)
Element gap:        gap-4               (16px between items inside a card)
Inline gap:         gap-2               (8px between icon and label)
```

Refactor all dashboard pages to use parent-level `gap-*` or `space-y-*` instead of child-level `mb-*` / `mt-*`. The main dashboard page layout becomes:

```tsx
<div className="p-6 lg:p-8 flex flex-col gap-8">
  {/* Header */}
  {/* Stats */}
  {/* Readiness */}
  {/* Upgrade Prompt */}
  {/* Grants + Applications Grid */}
  {/* Quick Actions */}
</div>
```

**Files to edit:**
- `src/app/dashboard/page.tsx` — replace all `mb-6 sm:mb-8`, `mt-4 sm:mt-8` with parent gap
- `src/app/dashboard/grants/page.tsx` — same pattern
- `src/app/dashboard/applications/page.tsx` — same pattern
- `src/app/dashboard/documents/page.tsx` — same pattern
- `src/app/dashboard/settings/page.tsx` — same pattern
- `src/app/dashboard/organization/page.tsx` — same pattern
- `src/app/dashboard/referrals/page.tsx` — same pattern

### 1.2 Nested Border Radius

**Violations fixed:** G4-002, SH4-002

Radius tier system:

```
Card outer:     rounded-2xl    (16px)
Card inner:     rounded-lg     (8px)   — inner = outer - padding
Pill/badge:     rounded-full
Button:         rounded-lg     (8px)
Input:          rounded-lg     (8px)
```

Apply to:
- Grant items inside card: `rounded-xl` → `rounded-lg`
- Application items inside card: `rounded-xl` → `rounded-lg`
- Quick action cards (they are top-level, keep `rounded-xl`)
- Readiness card inner content needs no radius (flat inside card)

**Files to edit:**
- `src/app/dashboard/page.tsx` — grant items, application items
- `src/components/ui/card.tsx` — verify outer radius is `rounded-2xl`

### 1.3 Touch Targets & Off-Grid Values

**Violations fixed:** R3-001, S1-002, J1-002

Changes:
- Sidebar nav items: `py-3 sm:py-2.5` → `py-3` (consistent 12px, giving 44px total height)
- Active nav state: `pl-3.5` → `pl-3` (12px, on 4px grid)
- Mobile hamburger button: add `min-w-11 min-h-11` (44px touch target)
- Mobile close button in sidebar: add `min-w-11 min-h-11`

**Files to edit:**
- `src/app/dashboard/layout.tsx`

### 1.4 Transition & Hover Unification

**Violations fixed:** J3-001, J3-002

Standard transitions:
```
Color transitions:  transition-colors duration-200
Scale transitions:  transition-transform duration-200  (icons in hover groups only)
Progress bars:      transition-all duration-500        (exception: animated fills)
```

All interactive cards use the same hover pattern: `hover:bg-slate-800/80 transition-colors duration-200`. Remove `duration-300` from Quick Actions. Keep `group-hover:scale-110` on Quick Action icons only (stacked layout warrants it) but add it to grant card score circles and stat card icons for consistency.

**Files to edit:**
- `src/app/dashboard/page.tsx` — unify all durations
- `src/app/dashboard/grants/page.tsx` — unify durations
- `src/app/dashboard/layout.tsx` — nav hover transitions

### 1.5 Focus Rings & Accessibility

**Violations fixed:** SH5-002, PRINCE-HALL A1, A2, A7

Standard focus ring applied globally:
```css
/* In globals.css or as a Tailwind utility */
.focus-ring {
  @apply focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 outline-none;
}
```

Apply to:
- All `<Button>` variants (edit the Button component)
- All `<Input>`, `<Select>`, `<Textarea>` components
- All `<Link>` cards that are interactive
- Sidebar nav items

Accessibility additions:
- SVG radial gauges: add `role="img" aria-label="Match score: {score}%"`
- Readiness gauge: add `role="img" aria-label="Grant readiness: {score} out of 100"`
- Stat cards: add `aria-label` with full description
- Form inputs on org/apply pages: add `aria-required="true"` where required

**Files to edit:**
- `src/components/ui/button.tsx` — add focus ring to base styles
- `src/components/ui/input.tsx` — add focus ring
- `src/app/dashboard/page.tsx` — aria-labels on gauges and stats
- `src/app/dashboard/organization/page.tsx` — aria-required on inputs
- `src/app/dashboard/grants/[id]/apply/page.tsx` — aria-required on inputs
- `src/app/globals.css` — add `.focus-ring` utility

### 1.6 Typography Cleanup

**Violations fixed:** T3-002, T4-001, T1-001

Changes:
- Replace `text-[10px]` with `text-xs` everywhere (the "Match" label under score circles)
- Reduce to 3 font weights: `font-normal` (400), `font-medium` (500), `font-bold` (700)
  - All `font-semibold` → `font-bold` (headings, card titles)
  - Keep `font-medium` for nav items, button text, secondary headings
  - Keep `font-normal` for body text
- Explicit line-heights on small text: `text-xs leading-4`, `text-sm leading-5`

**Files to edit:**
- `src/app/dashboard/page.tsx` — text-[10px], font-semibold instances
- `src/app/dashboard/layout.tsx` — font-semibold in sidebar
- `src/app/dashboard/grants/page.tsx` — font-semibold instances
- `src/app/dashboard/applications/page.tsx` — font-semibold instances
- All other dashboard pages — audit and replace

### 1.7 Button Weight Parity

**Violations fixed:** B2-002

Dashboard header buttons: change from `variant="secondary"` + `variant="gradient"` to `variant="outline"` + `variant="primary"`.

```tsx
<Button variant="outline">
  <Search className="h-4 w-4" />
  Find Grants
</Button>
<Button variant="primary">
  <Plus className="h-4 w-4" />
  Upload
</Button>
```

Rule: no `variant="gradient"` inside the dashboard. Gradient is for marketing pages only. Dashboard uses `primary` (solid), `outline`, and `ghost`.

**Files to edit:**
- `src/app/dashboard/page.tsx` — header buttons

### 1.8 Icon-Label Gap Standardization

**Violations fixed:** G3-001

Two tokens:
- Inline icon-label (buttons, nav, badges): parent `flex items-center gap-2` (8px)
- Stacked icon-label (quick actions, empty states): parent `flex flex-col items-center gap-3` (12px)

Replace all `mr-1`, `mr-2` on icons inside buttons with parent gap. Replace all `mb-2 sm:mb-3` in stacked layouts with `gap-3`.

**Files to edit:**
- `src/app/dashboard/page.tsx` — buttons, quick actions
- `src/app/dashboard/layout.tsx` — nav items (already use gap-3, verify)
- All button instances across dashboard pages

### 1.9 Optical Icon Centering

**Violations fixed:** G5-002

- `Sparkles` in dashboard header: add `translate-y-px`
- Navigation icons: visually inspect each icon at rendered size; apply `-translate-y-px` to any that appear top-heavy (common with Sparkles, TrendingUp, Gift icons from Lucide)
- This is a per-icon visual judgment call during implementation

**Files to edit:**
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/layout.tsx`

---

## Phase 2: UX Workflow Overhaul

### 2.1 First-Time Onboarding Flow

**New files:**
- `src/app/dashboard/onboarding/page.tsx`
- `src/components/dashboard/ProfileProgressBanner.tsx`

**Edited files:**
- `src/app/dashboard/page.tsx` — render progress banner
- `src/app/dashboard/layout.tsx` — redirect to onboarding if `!hasCompletedOnboarding`

**Design:**

3-step wizard (full-page, no sidebar visible):

**Step 1: Goal Setting**
- "What kind of grants?" — multi-select checkboxes (federal, state, foundation, corporate)
- Saves to user preferences for match filtering

**Step 2: Quick Profile**
- Organization name (text input)
- Type (dropdown)
- State (dropdown)
- One-sentence mission (textarea, max 200 chars)
- Saves to Organization model

**Step 3: Upload or Skip**
- Drag-and-drop zone (reuse existing Document upload component)
- "Skip for now" link below
- On completion: redirect to `/dashboard?onboarded=true`

**Onboarding state:** Store `hasCompletedOnboarding` as a boolean on the User model (Prisma migration) or in localStorage. Prisma field is preferred — survives device switches.

**Profile Progress Banner:**
- Shows on dashboard when profile completeness < 80%
- Calculates completeness from: org name, type, state, mission, team size, revenue, funding target, at least 1 document
- Each field = 12.5% (8 fields = 100%)
- Displays: progress bar + "Profile: X% complete" + top suggested next action + CTA button
- Auto-dismisses when ≥ 80%

### 2.2 Breadcrumb Navigation

**New file:** `src/components/dashboard/Breadcrumbs.tsx`

**Edited file:** `src/app/dashboard/layout.tsx`

**Design:**

```tsx
interface BreadcrumbItem {
  label: string;
  href?: string; // undefined = current page (no link)
}
```

Route-to-breadcrumb mapping:
```
/dashboard                          → (no breadcrumbs)
/dashboard/grants                   → (no breadcrumbs — top level)
/dashboard/grants/[id]              → Find Grants > {grant.title}
/dashboard/grants/[id]/apply        → Find Grants > {grant.title} > Apply
/dashboard/applications/[id]        → Applications > {app.grant.title}
/dashboard/applications/[id]/draft  → Applications > {app.grant.title} > Draft
```

Styling: `text-sm text-slate-500` with `text-slate-300 hover:text-white` for links. Separator: `ChevronRight` icon at `h-3 w-3 text-slate-600`.

Rendered in layout.tsx between `<TrialBanner />` and `{children}`, inside a `px-6 lg:px-8 pt-4` container.

Grant titles truncated to 40 chars with ellipsis in breadcrumbs.

### 2.3 Notification Bell

**New files:**
- `src/components/dashboard/NotificationBell.tsx`
- `src/app/api/notifications/unread/route.ts`

**Edited file:** `src/app/dashboard/layout.tsx`

**Design:**

Bell icon in the sidebar header area (next to the logo on desktop, next to hamburger on mobile).

```tsx
// NotificationBell.tsx
// - Fetches GET /api/notifications/unread (returns { count: number, items: Notification[] })
// - Shows bell icon with red dot if count > 0
// - Click opens a dropdown (absolute positioned, not a modal)
// - Dropdown shows 5 most recent: icon + message + relative time
// - "Mark all read" button at top
// - "View settings" link at bottom → /dashboard/settings
```

Notification types and icons:
```
deadline_approaching  → Clock (red)     "NSF SBIR deadline in 3 days"
new_match            → Sparkles (green) "New 87% match: California Clean Tech Fund"
status_change        → FileText (blue)  "Application status updated to: Submitted"
trial_expiring       → AlertCircle (amber) "Your Pro trial ends in 2 days"
```

API: The `/api/notifications/unread` route queries existing Notification model (already in Prisma schema) filtered by `userId` and `readAt IS NULL`, ordered by `createdAt DESC`, limited to 5.

### 2.4 Quick-Apply from Grants List

**Edited file:** `src/app/dashboard/grants/page.tsx`

**Design:**

Add an action area to each grant card in the expanded/detail view:

```tsx
<div className="flex items-center gap-2">
  {grant.matchScore >= 75 && (
    <Link href={`/dashboard/grants/${grant.id}/apply`}>
      <Button size="sm" variant="primary">
        Apply
        <ArrowRight className="h-3 w-3" />
      </Button>
    </Link>
  )}
  <Link href={`/dashboard/grants/${grant.id}`}>
    <Button size="sm" variant="ghost">Details</Button>
  </Link>
  <Button size="sm" variant="ghost" onClick={() => toggleSave(grant.id)}>
    {grant.saved ? <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> : <StarOff className="h-4 w-4" />}
  </Button>
</div>
```

Grants below 75% match still show "Details" as primary action. The threshold encourages users to review lower-match grants before committing to apply.

### 2.5 Deadline Timeline + Expiring Soon Card

**New files:**
- `src/components/dashboard/DeadlineTimeline.tsx` (grants page)
- `src/components/dashboard/ExpiringSoon.tsx` (main dashboard)

**Design — DeadlineTimeline (grants page):**

Horizontal strip at the top of the grants page. Renders grants as dots on a time axis from today to 60 days out.

```
Today          7d           14d           30d          60d
──●────●●──────●─────────────●●●───────────●──────────
```

- Dots color-coded: `bg-red-400` (≤7d), `bg-amber-400` (≤30d), `bg-slate-400` (>30d)
- Hovering a dot shows a tooltip with grant title + exact deadline
- Clicking a dot scrolls to and highlights that grant in the list below
- Built with plain divs and absolute positioning — no chart library
- Responsive: collapses to a simple "X grants due this week, Y this month" summary on mobile

**Design — ExpiringSoon (main dashboard):**

Replaces nothing — inserts between the readiness card and the grants/applications grid.

```tsx
// Shows grants with deadlines in the next 14 days
// Sorted by deadline ascending (most urgent first)
// Max 3 items, "View all →" links to grants page filtered by deadline
// Each item: grant title, funder, deadline with urgency color, match score badge
```

If no grants expire within 14 days, this component renders nothing (not an empty state).

### 2.6 Contextual Upgrade Prompts

**Edited files:**
- `src/app/dashboard/grants/[id]/apply/page.tsx`
- `src/app/dashboard/grants/page.tsx`

**Design:**

Wire the existing `<UpgradePrompt>` component into feature gates:

**AI Drafting gate (apply page):**
When a free user clicks "Generate with AI" on any application section:
```tsx
if (!canUseFeature('ai_drafting')) {
  return <UpgradePrompt
    feature="AI Application Intelligence"
    description="Let AI read the RFP and draft this section for you."
    variant="inline"
  />;
}
```

**Match limit gate (grants page):**
When displaying matches, if user has hit their monthly limit:
```tsx
{matchLimitReached && (
  <UpgradePrompt
    feature="Unlimited Grant Matches"
    description={`You've used ${used}/${limit} matches. Upgrade for unlimited.`}
    variant="banner"
  />
)}
```

**Auto-apply limit gate (apply page):**
Same pattern when auto-apply drafts are exhausted.

No new components needed — `UpgradePrompt` already supports `variant="banner"` and `variant="inline"`.

### 2.7 Success Celebrations

**New files:**
- `src/components/dashboard/Confetti.tsx`
- `src/components/dashboard/SuccessModal.tsx`

**Edited files:**
- `src/app/dashboard/grants/[id]/apply/page.tsx` (submit celebration)
- `src/app/dashboard/page.tsx` (first match toast)

**Design — Confetti:**

Lightweight CSS-only confetti animation. 30 small colored divs with randomized `animation-delay`, `animation-duration`, and `transform` using CSS keyframes. No canvas, no library. Auto-removes after 3 seconds.

```tsx
// <Confetti /> renders a fixed overlay of animated particles
// Triggered by: <Confetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
```

**Design — SuccessModal:**

Shown after application submission:
```
[Confetti animation behind]

  ✅ Application Submitted!

  "{grant.title}" has been submitted.
  We'll track the outcome and notify you.

  [Track Application]  [Apply to Another →]
```

Modal uses the existing `<Modal>` component from `src/components/ui/modal.tsx`. Confetti plays behind it.

**First match celebration:**
When the dashboard loads and `grants.length > 0` for the first time (check localStorage `hasSeenFirstMatch`), show a toast notification:
```
"Your first match! GrantPilot found {title} — {score}% match."
```

Uses existing toast component with a `variant="success"` styling.

### 2.8 Sidebar Navigation Refinement

**Edited file:** `src/app/dashboard/layout.tsx`

**Design:**

Restructure the `navigation` array into groups:

```tsx
const navGroups = [
  {
    label: null, // no label for primary group
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

Section labels styled: `text-xs text-slate-600 uppercase tracking-wider font-medium px-4 pt-6 pb-1`.

Sign Out stays at the bottom, outside the nav groups.

---

## File Manifest

### New Files (10)
| File | Purpose |
|------|---------|
| `src/app/dashboard/onboarding/page.tsx` | 3-step onboarding wizard |
| `src/components/dashboard/ProfileProgressBanner.tsx` | Profile completion banner |
| `src/components/dashboard/Breadcrumbs.tsx` | Route-aware breadcrumbs |
| `src/components/dashboard/NotificationBell.tsx` | Bell icon + dropdown |
| `src/components/dashboard/DeadlineTimeline.tsx` | Horizontal deadline strip |
| `src/components/dashboard/ExpiringSoon.tsx` | Urgency card for dashboard |
| `src/components/dashboard/Confetti.tsx` | CSS confetti animation |
| `src/components/dashboard/SuccessModal.tsx` | Post-submit celebration |
| `src/app/api/notifications/unread/route.ts` | Unread notification API |
| `src/app/dashboard/onboarding/layout.tsx` | Onboarding layout (no sidebar) |

### Edited Files (14)
| File | Changes |
|------|---------|
| `src/app/dashboard/page.tsx` | Spacing, radius, typography, aria, buttons, progress banner, expiring soon card, first-match toast |
| `src/app/dashboard/layout.tsx` | Nav groups, breadcrumbs, notification bell, touch targets, focus rings, transitions, onboarding redirect |
| `src/app/dashboard/grants/page.tsx` | Spacing, typography, quick-apply buttons, deadline timeline, match limit prompt |
| `src/app/dashboard/grants/[id]/apply/page.tsx` | Spacing, AI drafting gate, submit celebration, aria-required |
| `src/app/dashboard/grants/[id]/page.tsx` | Spacing, typography |
| `src/app/dashboard/applications/page.tsx` | Spacing, typography |
| `src/app/dashboard/applications/[id]/page.tsx` | Spacing |
| `src/app/dashboard/applications/[id]/draft/page.tsx` | Spacing |
| `src/app/dashboard/documents/page.tsx` | Spacing |
| `src/app/dashboard/organization/page.tsx` | Spacing, aria-required |
| `src/app/dashboard/settings/page.tsx` | Spacing |
| `src/app/dashboard/referrals/page.tsx` | Spacing |
| `src/components/ui/button.tsx` | Focus ring, remove gradient variant from dashboard |
| `src/app/globals.css` | Focus ring utility class |

### Prisma Migration
- Add `hasCompletedOnboarding Boolean @default(false)` to User model
- This is the chosen approach (not localStorage) — survives device switches and ensures consistent state across sessions

---

## Implementation Order

1. **Phase 1 first** (Mason's Eye fixes) — establishes the token system that Phase 2 builds on
2. Within Phase 1: spacing (1.1) → radius (1.2) → touch targets (1.3) → transitions (1.4) → focus rings (1.5) → typography (1.6) → button parity (1.7) → icon gaps (1.8) → optical centering (1.9)
3. **Phase 2 second** (UX workflow) — builds on the clean foundation
4. Within Phase 2: sidebar groups (2.8) → breadcrumbs (2.2) → onboarding (2.1) → expiring soon + timeline (2.5) → quick apply (2.4) → notifications (2.3) → contextual upgrades (2.6) → celebrations (2.7)

Phase 2 ordering rationale: sidebar and breadcrumbs are layout-level changes that affect all pages, so they go first. Onboarding is highest-leverage UX change. Celebrations are polish — last.

---

## Success Criteria

- Mason Score: 100/100 (MASTER MASON)
- Accessibility Score: 90+ (up from 72)
- All 7 dashboard pages use consistent spacing hierarchy
- New user can go from signup to first grant match in under 5 minutes
- Free user encounters contextual upgrade prompts at feature gates
- Application submission triggers celebration feedback
- No `font-semibold` in dashboard (only normal/medium/bold)
- No `mb-*` between sections (all parent gap)
- No `text-[10px]` arbitrary values
- No `py-2.5` or `pl-3.5` off-grid values
- All interactive elements have focus-visible ring
- Build passes with zero TypeScript errors
