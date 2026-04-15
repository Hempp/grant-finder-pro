import { prisma } from "@/lib/db";
import { logError } from "@/lib/telemetry";

/**
 * Notification creation helpers.
 *
 * The Notification model existed from day one but nothing was writing to
 * it — the bell in the nav was effectively decorative. These helpers
 * close the loop: every significant user-scoped event creates an in-app
 * notification that the bell can surface.
 *
 * Design rules:
 *   - Notification creation NEVER throws into the caller. A failed
 *     insert is logged + swallowed; the business action it's attached to
 *     (application submit, fee invoice) must complete regardless.
 *   - `type` is constrained to a small union so the bell + settings can
 *     map type → icon/color/preference-key without stringly-typed drift.
 *   - Titles are action-oriented, messages are one sentence.
 */

export type NotificationType =
  | "application_submitted"
  | "grant_awarded"
  | "fee_invoiced"
  | "deadline_approaching"
  | "new_match"
  | "status_change"
  | "trial_expiring"
  | "payment_failed"
  | "subscription_canceled";

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  grantId?: string | null;
}): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        grantId: params.grantId ?? null,
      },
    });
  } catch (err) {
    // Don't let notification plumbing fail the actual business flow.
    logError(err, { step: "createNotification", type: params.type });
  }
}

/**
 * Typed, pre-formatted event constructors. Each returns a promise but
 * never rejects; call-site code is a one-liner.
 */
export const Notify = {
  applicationSubmitted(params: { userId: string; grantTitle: string; grantId: string }) {
    return createNotification({
      userId: params.userId,
      type: "application_submitted",
      title: "Application submitted",
      message: `You submitted your application for ${params.grantTitle}. We'll remind you when the deadline passes so you can report the outcome.`,
      grantId: params.grantId,
    });
  },

  grantAwarded(params: { userId: string; grantTitle: string; grantId: string; awardAmount: number }) {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(params.awardAmount);
    return createNotification({
      userId: params.userId,
      type: "grant_awarded",
      title: `🎉 You won ${formatted}`,
      message: `Congratulations on your ${params.grantTitle} award. Your invoice history will show the success fee shortly.`,
      grantId: params.grantId,
    });
  },

  feeInvoiced(params: {
    userId: string;
    grantTitle: string;
    grantId: string;
    feeAmount: number;
    feePercent: number;
  }) {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(params.feeAmount);
    return createNotification({
      userId: params.userId,
      type: "fee_invoiced",
      title: "Success fee invoiced",
      message: `${formatted} (${params.feePercent}%) invoiced for ${params.grantTitle}. View it in your billing history.`,
      grantId: params.grantId,
    });
  },

  deadlineApproaching(params: {
    userId: string;
    grantTitle: string;
    grantId: string;
    daysUntilDeadline: number;
  }) {
    const d = params.daysUntilDeadline;
    const noun = d === 1 ? "1 day" : `${d} days`;
    return createNotification({
      userId: params.userId,
      type: "deadline_approaching",
      title: `${noun} until ${params.grantTitle}`,
      message: `Your draft should be submission-ready by the deadline. Tap to review your application.`,
      grantId: params.grantId,
    });
  },

  trialExpiring(params: { userId: string; daysLeft: number }) {
    const d = params.daysLeft;
    return createNotification({
      userId: params.userId,
      type: "trial_expiring",
      title: d <= 1 ? "Your trial ends today" : `Your trial ends in ${d} days`,
      message:
        d <= 1
          ? "Add a payment method to keep your Pro features. You'll stay at your current plan if you don't."
          : `Review your plan options. You won't lose any drafts — only Smart Fill downgrades if you stay on Starter.`,
    });
  },

  paymentFailed(params: { userId: string }) {
    return createNotification({
      userId: params.userId,
      type: "payment_failed",
      title: "We couldn't process your payment",
      message:
        "Update your payment method in Settings to keep your subscription active. We'll retry automatically in 48 hours.",
    });
  },

  subscriptionCanceled(params: { userId: string }) {
    return createNotification({
      userId: params.userId,
      type: "subscription_canceled",
      title: "Subscription ended",
      message:
        "You're on the Starter plan now. Your drafts and Library are intact — resubscribe any time to re-enable Smart Fill.",
    });
  },
};
