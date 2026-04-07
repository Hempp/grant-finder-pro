/**
 * Student Success Fee Engine
 *
 * Handles success fee logic specific to student scholarship awards.
 * For org grant success fees, see src/lib/stripe.ts (calculateSuccessFee / createSuccessFeeInvoice).
 */

import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InstallmentEntry {
  amount: number;       // dollars
  dueDate: string;      // ISO date string (YYYY-MM-DD)
  status: "paid" | "pending" | "failed";
  stripePaymentId: string | null;
}

export type InstallmentPlan = InstallmentEntry[];

// ---------------------------------------------------------------------------
// calculateStudentSuccessFee
// ---------------------------------------------------------------------------

/**
 * Calculate the success fee owed for a student scholarship award.
 *
 * @param awardAmount  Award in dollars
 * @param feePercent   Fee percentage (e.g. 8 for 8%)
 */
export function calculateStudentSuccessFee(
  awardAmount: number,
  feePercent: number
): { feeAmount: number; feeCents: number; applies: boolean } {
  if (feePercent === 0) {
    return { feeAmount: 0, feeCents: 0, applies: false };
  }

  const feeAmount = Math.round(awardAmount * feePercent / 100);
  const feeCents = feeAmount * 100;

  return { feeAmount, feeCents, applies: true };
}

// ---------------------------------------------------------------------------
// chargeStudentSuccessFee
// ---------------------------------------------------------------------------

/**
 * Charge the student success fee immediately via a Stripe PaymentIntent.
 * Updates StudentApplication.successFeeStatus to "charged" on success or
 * "failed" on card decline.
 */
export async function chargeStudentSuccessFee(params: {
  userId: string;
  applicationId: string;
  awardAmount: number;
  feePercent: number;
  scholarshipTitle: string;
}): Promise<{ success: boolean; chargeId?: string; error?: string }> {
  const { userId, applicationId, awardAmount, feePercent, scholarshipTitle } = params;

  // 1. Calculate fee
  const { feeCents, applies } = calculateStudentSuccessFee(awardAmount, feePercent);
  if (!applies) {
    return { success: true };
  }

  // 2. Fetch user payment details
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true, stripePaymentMethodId: true },
  });

  if (!user?.stripePaymentMethodId) {
    return { success: false, error: "no_payment_method" };
  }

  const customer = user.stripeCustomerId ?? undefined;
  const paymentMethod = user.stripePaymentMethodId;

  try {
    // 3. Create and confirm PaymentIntent off-session
    const intent = await getStripe().paymentIntents.create({
      amount: feeCents,
      currency: "usd",
      customer,
      payment_method: paymentMethod,
      off_session: true,
      confirm: true,
      description: `GrantPilot Student Success Fee — "${scholarshipTitle}" ($${awardAmount.toLocaleString()} awarded)`,
    });

    // 4. Persist successful charge to application
    await prisma.studentApplication.update({
      where: { id: applicationId },
      data: {
        successFeeAmount: Math.round(feeCents / 100),
        successFeeStatus: "charged",
        successFeePaidAt: new Date(),
        stripePaymentId: intent.id,
      },
    });

    return { success: true, chargeId: intent.id };
  } catch {
    // 5. Mark as failed on card decline / other Stripe error
    await prisma.studentApplication.update({
      where: { id: applicationId },
      data: { successFeeStatus: "failed" },
    });

    return { success: false, error: "card_declined" };
  }
}

// ---------------------------------------------------------------------------
// createStudentInstallmentPlan
// ---------------------------------------------------------------------------

/**
 * Split a student success fee into installments, charge the first one now,
 * and persist the full plan as JSON on the application.
 */
export async function createStudentInstallmentPlan(params: {
  userId: string;
  applicationId: string;
  totalFee: number;
  installments?: number; // default 4
}): Promise<{
  plan: InstallmentPlan;
  firstChargeResult: { success: boolean; chargeId?: string };
}> {
  const { userId, applicationId, totalFee } = params;
  const count = params.installments ?? 4;

  // 1. Split into installments (last absorbs remainder)
  const base = Math.floor(totalFee / count);
  const remainder = totalFee - base * count;

  const amounts: number[] = Array.from({ length: count }, (_, i) =>
    i === count - 1 ? base + remainder : base
  );

  // 2. Generate due dates (first = today, then +30 days each)
  const now = new Date();
  const dueDates: string[] = amounts.map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i * 30);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  });

  // 3. Charge first installment immediately via Stripe
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true, stripePaymentMethodId: true },
  });

  let firstChargeResult: { success: boolean; chargeId?: string } = {
    success: false,
  };

  if (!user?.stripePaymentMethodId) {
    firstChargeResult = { success: false };
  } else {
    try {
      const intent = await getStripe().paymentIntents.create({
        amount: amounts[0] * 100,
        currency: "usd",
        customer: user.stripeCustomerId ?? undefined,
        payment_method: user.stripePaymentMethodId,
        off_session: true,
        confirm: true,
        description: `GrantPilot Student Success Fee — installment 1 of ${count}`,
      });
      firstChargeResult = { success: true, chargeId: intent.id };
    } catch {
      firstChargeResult = { success: false };
    }
  }

  // 4. Build plan JSON
  const plan: InstallmentPlan = amounts.map((amount, i) => ({
    amount,
    dueDate: dueDates[i],
    status: i === 0 && firstChargeResult.success ? "paid" : "pending",
    stripePaymentId:
      i === 0 && firstChargeResult.success
        ? (firstChargeResult.chargeId ?? null)
        : null,
  }));

  // 5. Persist plan and set installment status
  await prisma.studentApplication.update({
    where: { id: applicationId },
    data: {
      installmentPlan: JSON.stringify(plan),
      successFeeStatus: "installment",
      successFeeAmount: totalFee,
    },
  });

  return { plan, firstChargeResult };
}
