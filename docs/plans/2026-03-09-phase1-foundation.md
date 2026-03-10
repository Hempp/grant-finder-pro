# Phase 1: Foundation (Fix & Ship) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the broken production build, update pricing to 4-tier model, rename to GrantPilot, and deploy to Vercel.

**Architecture:** Fix Turbopack/Prisma incompatibility by disabling Turbopack, update Stripe pricing config to 4 tiers (Free/Growth/Pro/Organization), rebrand from "Grant Finder Pro" to "GrantPilot", update landing page messaging, and deploy.

**Tech Stack:** Next.js 16, Prisma 6.x, Stripe, Vercel

---

### Task 1: Fix Turbopack Build Failure

**Files:**
- Modify: `next.config.ts`
- Modify: `package.json`

**Step 1: Disable Turbopack in next.config.ts**

The build fails because Prisma's WASM edge runtime is incompatible with Turbopack. The simplest fix is to use webpack bundler for production builds.

```typescript
// next.config.ts - add turbopack: false to experimental or ensure build uses webpack
const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-dialog", "@radix-ui/react-tabs"],
  },
  // ... existing config
};
```

Since Next.js 16 uses Turbopack by default for `next build`, we need to ensure the build script uses webpack:

In `package.json`, change:
```json
"build": "prisma generate && next build --no-turbopack"
```

**Step 2: Test the build**

Run: `cd ~/grant-finder-pro && npm run build`
Expected: Build succeeds without Turbopack WASM error

**Step 3: Commit**

```bash
cd ~/grant-finder-pro
git add package.json next.config.ts
git commit -m "fix: disable turbopack for production build to resolve Prisma WASM error"
```

---

### Task 2: Update Prisma Schema with New Plan Field Values

**Files:**
- Modify: `prisma/schema.prisma:23`

**Step 1: Update plan default comment**

Change the plan field comment from `// free, pro, teams` to `// free, growth, pro, organization`:

```prisma
plan String @default("free") // free, growth, pro, organization
```

**Step 2: Push schema update**

Run: `cd ~/grant-finder-pro && npx prisma db push`
Expected: Schema synced (no migration needed since it's just a comment and field values haven't changed type)

**Step 3: Commit**

```bash
git add prisma/schema.prisma
git commit -m "chore: update plan field documentation for 4-tier pricing model"
```

---

### Task 3: Update Stripe Pricing Configuration

**Files:**
- Modify: `src/lib/stripe.ts`

**Step 1: Read current stripe.ts for exact structure**

Read `src/lib/stripe.ts` to understand the current PLANS object structure.

**Step 2: Update PLANS configuration**

Replace the existing 3-tier plan config with 4 tiers:

```typescript
export const PLANS = {
  free: {
    name: "Starter",
    description: "Get started with grant discovery",
    price: 0,
    priceAnnual: 0,
    limits: {
      matchesPerMonth: 5,
      autoApplyPerMonth: 1,
      savedGrants: 10,
      documents: 3,
      teamMembers: 1,
    },
    features: [
      "5 grant matches per month",
      "1 auto-apply draft per month",
      "Save up to 10 grants",
      "Weekly email digest",
      "Basic Grant Readiness Score",
    ],
  },
  growth: {
    name: "Growth",
    description: "For growing organizations",
    price: 24,
    priceAnnual: 228, // $19/mo
    limits: {
      matchesPerMonth: 25,
      autoApplyPerMonth: 5,
      savedGrants: 50,
      documents: 20,
      teamMembers: 1,
    },
    features: [
      "25 grant matches per month",
      "5 auto-apply drafts per month",
      "Save up to 50 grants",
      "Daily email alerts",
      "Full Grant Readiness Score",
      "Content Reuse Library (10 blocks)",
      "Standard AI model",
    ],
  },
  pro: {
    name: "Pro",
    description: "For serious grant seekers",
    price: 59,
    priceAnnual: 588, // $49/mo
    limits: {
      matchesPerMonth: -1, // unlimited
      autoApplyPerMonth: 20,
      savedGrants: -1,
      documents: -1,
      teamMembers: 3,
    },
    features: [
      "Unlimited grant matches",
      "20 auto-apply drafts per month",
      "Unlimited saved grants",
      "Real-time alerts",
      "AI Application Intelligence",
      "Scoring Criteria Coverage Map",
      "ROI Dashboard",
      "Funder Intelligence Profiles",
      "Content Reuse Library (unlimited)",
      "Premium AI model (Claude)",
      "Grant Guarantee: win in 12 months or refund",
      "Up to 3 team members",
      "Priority support",
    ],
  },
  organization: {
    name: "Organization",
    description: "For teams and consultants",
    price: 199,
    priceAnnual: 2028, // $169/mo
    limits: {
      matchesPerMonth: -1,
      autoApplyPerMonth: -1,
      savedGrants: -1,
      documents: -1,
      teamMembers: 10,
    },
    features: [
      "Everything in Pro",
      "Unlimited auto-apply drafts",
      "Up to 10 team members",
      "Smart Budget Builder",
      "Competitive Intelligence",
      "Regulatory Radar with impact analysis",
      "Custom AI tone & templates",
      "Full reporting & export",
      "Dedicated success manager",
      "Grant Guarantee",
    ],
  },
} as const;

export type PlanType = keyof typeof PLANS;
```

**Step 3: Update getPlanLimits function**

Ensure `getPlanLimits()` handles the new `growth` and `organization` plan types. The function should reference `PLANS[plan].limits`.

**Step 4: Update getPlanByPriceId function**

Add mappings for new Stripe price IDs:
```typescript
// Add environment variables for new plans:
// STRIPE_GROWTH_PRICE_ID, STRIPE_GROWTH_ANNUAL_PRICE_ID
// STRIPE_ORG_PRICE_ID, STRIPE_ORG_ANNUAL_PRICE_ID
```

**Step 5: Test compilation**

Run: `cd ~/grant-finder-pro && npx tsc --noEmit`
Expected: No type errors

**Step 6: Commit**

```bash
git add src/lib/stripe.ts
git commit -m "feat: update Stripe config to 4-tier pricing (Free/Growth/Pro/Organization)"
```

---

### Task 4: Update Pricing Page UI

**Files:**
- Modify: `src/app/pricing/page.tsx`

**Step 1: Replace plans array with 4 tiers**

```typescript
const plans = [
  {
    id: "free",
    name: "Starter",
    description: "Get started with grant discovery",
    price: 0,
    priceAnnual: 0,
    features: [
      { text: "5 grant matches per month", included: true },
      { text: "1 auto-apply draft per month", included: true },
      { text: "Save up to 10 grants", included: true },
      { text: "Weekly email digest", included: true },
      { text: "Basic Grant Readiness Score", included: true },
      { text: "AI Application Intelligence", included: false },
      { text: "Grant Guarantee", included: false },
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    id: "growth",
    name: "Growth",
    description: "For growing organizations",
    price: 24,
    priceAnnual: 228,
    features: [
      { text: "25 grant matches per month", included: true },
      { text: "5 auto-apply drafts per month", included: true },
      { text: "Save up to 50 grants", included: true },
      { text: "Daily email alerts", included: true },
      { text: "Full Grant Readiness Score", included: true },
      { text: "Content Reuse Library", included: true },
      { text: "Grant Guarantee", included: false },
    ],
    cta: "Start Growing",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For serious grant seekers",
    price: 59,
    priceAnnual: 588,
    features: [
      { text: "Unlimited grant matches", included: true },
      { text: "20 auto-apply drafts per month", included: true },
      { text: "AI Application Intelligence", included: true },
      { text: "Scoring Criteria Coverage Map", included: true },
      { text: "Real-time alerts", included: true },
      { text: "ROI Dashboard", included: true },
      { text: "Grant Guarantee: win or refund", included: true },
      { text: "Up to 3 team members", included: true },
    ],
    cta: "Go Pro",
    popular: true,
  },
  {
    id: "organization",
    name: "Organization",
    description: "For teams and consultants",
    price: 199,
    priceAnnual: 2028,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited auto-apply drafts", included: true },
      { text: "Up to 10 team members", included: true },
      { text: "Smart Budget Builder", included: true },
      { text: "Competitive Intelligence", included: true },
      { text: "Custom AI tone & templates", included: true },
      { text: "Dedicated success manager", included: true },
      { text: "Full reporting & export", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  },
];
```

**Step 2: Update grid from 3-col to 4-col**

Change: `grid md:grid-cols-3` → `grid md:grid-cols-2 lg:grid-cols-4`

**Step 3: Update trial text from 14-day to 21-day**

Replace all "14-day" references with "21-day" and "14" with "21" in trial-related text.

**Step 4: Update annual savings text**

Replace `Save 17%` badge with `Save up to 21%` (Growth tier saves 21%).

**Step 5: Add Grant Guarantee FAQ**

Add a new FAQ card:
```tsx
<Card>
  <CardContent className="p-6">
    <h3 className="text-white font-medium mb-2">
      What is the Grant Guarantee?
    </h3>
    <p className="text-slate-400">
      Pro and Organization plans include our Grant Guarantee: if you don&apos;t
      win a grant within 12 months of subscribing, we&apos;ll refund your
      subscription in full. We&apos;re that confident in our matching.
    </p>
  </CardContent>
</Card>
```

**Step 6: Test the page renders**

Run: `cd ~/grant-finder-pro && npm run dev`
Navigate to: `http://localhost:3000/pricing`
Expected: 4 pricing cards, correct prices, Grant Guarantee FAQ visible

**Step 7: Commit**

```bash
git add src/app/pricing/page.tsx
git commit -m "feat: redesign pricing page with 4-tier model and Grant Guarantee"
```

---

### Task 5: Update Subscription Hook for New Plans

**Files:**
- Modify: `src/hooks/useSubscription.ts`

**Step 1: Add growth and organization plan checks**

Add to the hook:
```typescript
isGrowth: subscription?.plan === 'growth',
isPro: subscription?.plan === 'pro',
isOrganization: subscription?.plan === 'organization',
```

**Step 2: Update canUseFeature logic**

Ensure `canUseFeature` checks against the new plan limits from the updated PLANS config.

**Step 3: Update trial duration from 14 to 21 days**

Find any reference to 14-day trial and update to 21 days.

**Step 4: Commit**

```bash
git add src/hooks/useSubscription.ts
git commit -m "feat: update subscription hook for 4-tier pricing model"
```

---

### Task 6: Rebrand to GrantPilot

**Files:**
- Modify: `src/app/layout.tsx:17` - title and description
- Modify: `src/app/page.tsx` - all "Grant Finder Pro" references
- Modify: `src/app/pricing/page.tsx` - header brand name
- Modify: `src/app/dashboard/layout.tsx` - sidebar brand name
- Modify: `src/app/(auth)/login/page.tsx` - brand name
- Modify: `src/app/(auth)/signup/page.tsx` - brand name
- Modify: `package.json:2` - name field

**Step 1: Global find-and-replace "Grant Finder Pro" → "GrantPilot"**

In each file listed above, replace all instances of "Grant Finder Pro" with "GrantPilot".

**Step 2: Update metadata**

In `src/app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: "GrantPilot - AI-Powered Grant Intelligence Platform",
  description: "Find grants you'll win. AI reads applications, drafts proposals from your data, and predicts your score before you submit.",
};
```

**Step 3: Update package.json name**

```json
"name": "grantpilot"
```

**Step 4: Test all pages render correctly**

Run: `cd ~/grant-finder-pro && npm run dev`
Check: `/`, `/pricing`, `/login`, `/signup`, `/dashboard`
Expected: All show "GrantPilot" branding

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: rebrand from Grant Finder Pro to GrantPilot"
```

---

### Task 7: Update Landing Page Messaging

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Update hero section**

Replace current hero text with new value proposition:

```tsx
<h1>
  Find Grants You&apos;ll Win.
  <br />
  <span className="gradient-text">Apply with Confidence.</span>
</h1>

<p>
  AI reads grant requirements, drafts proposals from your data,
  and predicts your score before you submit. The only grant platform
  with a win guarantee.
</p>
```

**Step 2: Update stats**

Replace current stats with research-backed numbers:

```typescript
{ value: "$592B+", label: "In Annual Grants" },
{ value: "95%", label: "Win Rate (6+ Apps)" },
{ value: "100hrs", label: "Saved Per Application" },
```

**Step 3: Update "How It Works" to 5 steps**

```typescript
[
  { icon: Upload, title: "Build Your Profile", desc: "Tell us about your organization, upload docs. Takes 10 minutes.", num: 1 },
  { icon: Search, title: "Discover Matches", desc: "AI scans federal, state, and foundation grants matched to your profile.", num: 2 },
  { icon: Target, title: "Check Your Readiness", desc: "See your Grant Readiness Score before you invest time applying.", num: 3 },
  { icon: FileText, title: "AI Drafts Your Application", desc: "AI reads the RFP, maps scoring criteria, and drafts each section from your data.", num: 4 },
  { icon: CheckCircle, title: "Review, Polish & Submit", desc: "See your predicted score. Edit with AI suggestions. Submit with confidence.", num: 5 },
]
```

**Step 4: Update features grid with differentiators**

```typescript
[
  { icon: Brain, title: "AI Application Intelligence", desc: "AI reads the RFP, understands scoring criteria, and writes to win." },
  { icon: Target, title: "Grant Readiness Score", desc: "Know if you're ready before you invest 100 hours applying." },
  { icon: BarChart3, title: "Scoring Coverage Map", desc: "See your predicted score per criterion. Fix weak spots before submitting." },
  { icon: Shield, title: "Grant Guarantee", desc: "Pro plans: win a grant in 12 months or get a full refund." },
  { icon: Bell, title: "Regulatory Radar", desc: "Real-time alerts on DOGE cuts, DEI changes, and new funding programs." },
  { icon: Repeat, title: "Smart Content Library", desc: "Write once, reuse everywhere. AI adapts tone and length per funder." },
]
```

**Step 5: Update trial CTA from 14-day to 21-day**

```tsx
<p>
  <Clock className="h-4 w-4 inline mr-1" />
  21-day free Pro trial. No credit card required.
</p>
```

**Step 6: Test landing page**

Run: `cd ~/grant-finder-pro && npm run dev`
Navigate to: `http://localhost:3000`
Expected: New messaging, 5-step flow, updated features, GrantPilot branding

**Step 7: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: update landing page with new value proposition and differentiators"
```

---

### Task 8: Commit Pending Changes and Build

**Files:**
- Various uncommitted files (accessibility improvements, security headers)

**Step 1: Review and stage pending changes**

Run: `cd ~/grant-finder-pro && git status && git diff --stat`

Stage the 9 modified files that contain accessibility and performance improvements.

**Step 2: Commit pending changes**

```bash
git add src/app/(auth)/login/page.tsx src/app/(auth)/signup/page.tsx
git add src/app/api/grants/[id]/route.ts src/app/api/grants/discover/route.ts src/app/api/grants/route.ts
git add src/app/dashboard/grants/page.tsx src/app/dashboard/layout.tsx src/app/layout.tsx
git add middleware.ts
git commit -m "feat: accessibility improvements, performance optimizations, and security headers"
```

**Step 3: Run production build**

Run: `cd ~/grant-finder-pro && npm run build`
Expected: Build succeeds

**Step 4: Commit any build fixes if needed**

---

### Task 9: Deploy to Vercel

**Step 1: Verify Vercel CLI is available**

Run: `which vercel || npm i -g vercel`

**Step 2: Check current Vercel project link**

Run: `cd ~/grant-finder-pro && cat .vercel/project.json`

**Step 3: Deploy**

Run: `cd ~/grant-finder-pro && vercel --prod`
Expected: Deployment succeeds, URL returned

**Step 4: Verify deployment**

Visit the deployment URL and check:
- [ ] Landing page loads with GrantPilot branding
- [ ] Pricing page shows 4 tiers
- [ ] Login/signup pages work
- [ ] Dashboard loads (if logged in)

**Step 5: Commit any deployment config changes**

```bash
git add -A
git commit -m "chore: Phase 1 complete - GrantPilot live with 4-tier pricing"
```

---

## Phase 1 Completion Checklist

- [ ] Turbopack build failure fixed
- [ ] 4-tier pricing model configured (Free $0 / Growth $24 / Pro $59 / Org $199)
- [ ] Rebranded to GrantPilot
- [ ] Landing page updated with new value proposition
- [ ] Pricing page shows 4 tiers with Grant Guarantee
- [ ] 21-day trial (no credit card)
- [ ] Pending accessibility/performance changes committed
- [ ] Production build succeeds
- [ ] Deployed to Vercel
