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
    name: "Free",
    description: "Get started with grant discovery",
    price: 0,
    priceId: null,
    features: [
      "3 grant matches per month",
      "Basic search filters",
      "Save up to 5 grants",
      "Email alerts (weekly)",
    ],
    limits: {
      matchesPerMonth: 3,
      savedGrants: 5,
      autoApplyPerMonth: 0,
      documents: 2,
    },
  },
  pro: {
    name: "Pro",
    description: "For serious grant seekers",
    price: 49,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "Unlimited grant matches",
      "Advanced AI matching",
      "5 Auto-Apply drafts per month",
      "Unlimited saved grants",
      "Daily email alerts",
      "Priority support",
    ],
    limits: {
      matchesPerMonth: -1, // unlimited
      savedGrants: -1,
      autoApplyPerMonth: 5,
      documents: 20,
    },
  },
  teams: {
    name: "Teams",
    description: "For organizations and consultants",
    price: 149,
    priceId: process.env.STRIPE_TEAMS_PRICE_ID,
    features: [
      "Everything in Pro",
      "Unlimited Auto-Apply drafts",
      "Team collaboration (up to 5)",
      "Grant success analytics",
      "Application pipeline tracking",
      "Dedicated success manager",
    ],
    limits: {
      matchesPerMonth: -1,
      savedGrants: -1,
      autoApplyPerMonth: -1,
      documents: -1,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;

export function getPlanByPriceId(priceId: string): PlanType | null {
  for (const [plan, config] of Object.entries(PLANS)) {
    if (config.priceId === priceId) {
      return plan as PlanType;
    }
  }
  return null;
}

export function getPlanLimits(plan: PlanType) {
  return PLANS[plan].limits;
}
