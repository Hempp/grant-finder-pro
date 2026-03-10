import Stripe from "stripe";

// Only initialize Stripe if we have the key (allows build to succeed)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Create a lazy-initialized Stripe client to avoid build-time errors
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }
  return _stripe;
}

// Export for backwards compatibility - will throw at runtime if key not set
export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    })
  : (null as unknown as Stripe);

// Pricing plans configuration
export const PLANS = {
  free: {
    name: "Starter",
    description: "Get started with grant discovery",
    price: 0,
    priceAnnual: 0,
    priceId: null as string | null,
    priceIdAnnual: null as string | null,
    features: [
      "5 grant matches per month",
      "1 auto-apply draft per month",
      "Save up to 10 grants",
      "Weekly email digest",
      "Basic Grant Readiness Score",
    ],
    limits: {
      matchesPerMonth: 5,
      savedGrants: 10,
      autoApplyPerMonth: 1,
      documents: 3,
      teamMembers: 1,
    },
  },
  growth: {
    name: "Growth",
    description: "For growing organizations",
    price: 24,
    priceAnnual: 228,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID ?? null,
    priceIdAnnual: process.env.STRIPE_GROWTH_ANNUAL_PRICE_ID ?? null,
    features: [
      "25 grant matches per month",
      "5 auto-apply drafts per month",
      "Save up to 50 grants",
      "Daily email alerts",
      "Full Grant Readiness Score",
      "Content Reuse Library (10 blocks)",
      "Standard AI model",
    ],
    limits: {
      matchesPerMonth: 25,
      savedGrants: 50,
      autoApplyPerMonth: 5,
      documents: 20,
      teamMembers: 1,
    },
  },
  pro: {
    name: "Pro",
    description: "For serious grant seekers",
    price: 59,
    priceAnnual: 588,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    priceIdAnnual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? null,
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
    limits: {
      matchesPerMonth: -1,
      savedGrants: -1,
      autoApplyPerMonth: 20,
      documents: -1,
      teamMembers: 3,
    },
  },
  organization: {
    name: "Organization",
    description: "For teams and consultants",
    price: 199,
    priceAnnual: 2028,
    priceId: process.env.STRIPE_ORG_PRICE_ID ?? null,
    priceIdAnnual: process.env.STRIPE_ORG_ANNUAL_PRICE_ID ?? null,
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
    limits: {
      matchesPerMonth: -1,
      savedGrants: -1,
      autoApplyPerMonth: -1,
      documents: -1,
      teamMembers: 10,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;

export function getPlanByPriceId(priceId: string): PlanType | null {
  const priceMap: Record<string, PlanType> = {};
  for (const [plan, config] of Object.entries(PLANS)) {
    if (config.priceId) priceMap[config.priceId] = plan as PlanType;
    if (config.priceIdAnnual) priceMap[config.priceIdAnnual] = plan as PlanType;
  }
  return priceMap[priceId] ?? null;
}

export function getPlanLimits(plan: PlanType) {
  return PLANS[plan]?.limits ?? PLANS.free.limits;
}
