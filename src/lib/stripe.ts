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
      "Manual apply only",
      "Save up to 10 grants",
      "Weekly email digest",
      "Basic Grant Readiness Score",
      "Content Library (5 blocks)",
    ],
    limits: {
      matchesPerMonth: 5,
      savedGrants: 10,
      autoApplyPerMonth: 0,
      smartFillPerMonth: 0,
      contentBlocks: 5,
      documents: 3,
      teamMembers: 1,
    },
    successFeePercent: 0,
  },
  growth: {
    name: "Growth",
    description: "For growing organizations",
    price: 29,
    priceAnnual: 228,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID ?? null,
    priceIdAnnual: process.env.STRIPE_GROWTH_ANNUAL_PRICE_ID ?? null,
    features: [
      "25 grant matches per month",
      "5 Smart Fills per month",
      "Content Library (50 blocks)",
      "Website import",
      "Daily email alerts",
      "Full Grant Readiness Score",
      "5% success fee on grants $10K+",
    ],
    limits: {
      matchesPerMonth: 25,
      savedGrants: 50,
      autoApplyPerMonth: 5,
      smartFillPerMonth: 5,
      contentBlocks: 50,
      documents: 20,
      teamMembers: 1,
    },
    successFeePercent: 5,
    successFeeThreshold: 10000,
  },
  pro: {
    name: "Pro",
    description: "For serious grant seekers",
    price: 79,
    priceAnnual: 708,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    priceIdAnnual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? null,
    features: [
      "Unlimited grant matches",
      "25 Smart Fills per month",
      "Unlimited Content Library",
      "AI Application Intelligence",
      "Auto-optimize to 100/100",
      "Scoring + diff transparency",
      "3% success fee on grants won",
      "Grant Guarantee: win in 12 months or 3 months free",
      "Up to 3 team members",
      "Priority support",
    ],
    limits: {
      matchesPerMonth: -1,
      savedGrants: -1,
      autoApplyPerMonth: 25,
      smartFillPerMonth: 25,
      contentBlocks: -1,
      documents: -1,
      teamMembers: 3,
    },
    successFeePercent: 3,
    successFeeThreshold: 0,
  },
  organization: {
    name: "Organization",
    description: "For teams and consultants",
    price: 249,
    priceAnnual: 2388,
    priceId: process.env.STRIPE_ORG_PRICE_ID ?? null,
    priceIdAnnual: process.env.STRIPE_ORG_ANNUAL_PRICE_ID ?? null,
    features: [
      "Everything in Pro",
      "100 Smart Fills per month",
      "Up to 10 team members",
      "2% success fee (lowest rate)",
      "Smart Budget Builder",
      "Competitive Intelligence",
      "Custom AI tone & templates",
      "Dedicated success manager",
      "Full reporting & export",
    ],
    limits: {
      matchesPerMonth: -1,
      savedGrants: -1,
      autoApplyPerMonth: -1,
      smartFillPerMonth: 100,
      contentBlocks: -1,
      documents: -1,
      teamMembers: 10,
    },
    successFeePercent: 2,
    successFeeThreshold: 0,
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

// Success fee calculations
export function getSuccessFeePercent(plan: PlanType): number {
  return PLANS[plan]?.successFeePercent ?? 0;
}

export function getSuccessFeeThreshold(plan: PlanType): number {
  return (PLANS[plan] as { successFeeThreshold?: number })?.successFeeThreshold ?? 0;
}

export function calculateSuccessFee(
  plan: PlanType,
  grantAmount: number
): { feePercent: number; feeAmount: number; applies: boolean } {
  const percent = getSuccessFeePercent(plan);
  const threshold = getSuccessFeeThreshold(plan);

  if (percent === 0 || grantAmount < threshold) {
    return { feePercent: 0, feeAmount: 0, applies: false };
  }

  const feeAmount = Math.round(grantAmount * (percent / 100));
  return { feePercent: percent, feeAmount, applies: true };
}

export async function createSuccessFeeInvoice(
  stripeCustomerId: string,
  grantTitle: string,
  grantAmount: number,
  feeAmount: number,
  feePercent: number
): Promise<string | null> {
  try {
    const stripeClient = getStripe();

    // Create an invoice item
    await stripeClient.invoiceItems.create({
      customer: stripeCustomerId,
      amount: feeAmount * 100, // Stripe uses cents
      currency: "usd",
      description: `GrantPilot Success Fee (${feePercent}%) — "${grantTitle}" ($${grantAmount.toLocaleString()} awarded)`,
    });

    // Create and finalize the invoice
    const invoice = await stripeClient.invoices.create({
      customer: stripeCustomerId,
      collection_method: "charge_automatically",
      auto_advance: true,
      metadata: {
        type: "success_fee",
        grantTitle,
        grantAmount: grantAmount.toString(),
        feePercent: feePercent.toString(),
      },
    });

    return invoice.id;
  } catch (error) {
    console.error("Failed to create success fee invoice:", error);
    return null;
  }
}
