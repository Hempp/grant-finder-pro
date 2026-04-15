import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe, getPlanByPriceId } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { sendPaymentFailedEmail, sendSubscriptionCanceledEmail } from "@/lib/email";
import { logError, logEvent, logWarning } from "@/lib/telemetry";
import { Notify } from "@/lib/notifications";
import { audit } from "@/lib/audit-log";
import Stripe from "stripe";

// Stripe SDK types lag behind the live API for `current_period_end` and
// `Invoice.subscription`. Define narrow typed views so we never reach for `any`.
type SubscriptionWithPeriod = Stripe.Subscription & {
  current_period_end?: number;
};
type InvoiceWithSubscription = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription | null;
};

function periodEndDate(sub: Stripe.Subscription): Date | null {
  const ts = (sub as SubscriptionWithPeriod).current_period_end;
  return typeof ts === "number" ? new Date(ts * 1000) : null;
}

function invoiceSubscriptionId(inv: Stripe.Invoice): string | null {
  const ref = (inv as InvoiceWithSubscription).subscription;
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref.id;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    logError(error, { step: "stripe.webhook.signature_verification" });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  logEvent("stripe.webhook.verified", { eventType: event.type, eventId: event.id });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription" && session.subscription) {
          const subscriptionData = await getStripe().subscriptions.retrieve(
            session.subscription as string
          );
          const subscription = subscriptionData as Stripe.Subscription;

          const userId = session.metadata?.userId;
          if (!userId) {
            console.error("No userId in session metadata");
            break;
          }

          const priceId = subscription.items.data[0]?.price.id;
          const plan = getPlanByPriceId(priceId);
          if (!plan) {
            // Unknown priceId = new Stripe price not yet synced to
            // getPlanByPriceId. Silently defaulting to "pro" would flip
            // free users into paid tier on mis-sync. Fail loud instead —
            // Stripe will retry, webhook is idempotent.
            logWarning("stripe.webhook.unknown_price_id", {
              priceId,
              subscriptionId: subscription.id,
              userId,
            });
            return NextResponse.json(
              { error: "Unknown price id — please sync SUBSCRIPTION_PLANS" },
              { status: 500 }
            );
          }

          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: plan,
              stripeSubscriptionId: subscription.id,
              stripePriceId: priceId,
              stripeCurrentPeriodEnd: periodEndDate(subscription),
            },
          });

          logEvent("stripe.webhook.checkout_completed", { userId, plan });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!user) {
          // Orphan event: webhook references a subscription we don't have a
          // user mapping for. This is a data-integrity bug worth paging on.
          logWarning("stripe.webhook.orphan", {
            eventType: event.type,
            subscriptionId: subscription.id,
          });
          break;
        }

        const priceId = subscription.items.data[0]?.price.id;
        const plan = getPlanByPriceId(priceId);
        if (!plan) {
          logWarning("stripe.webhook.unknown_price_id", {
            priceId,
            subscriptionId: subscription.id,
            userId: user.id,
          });
          return NextResponse.json(
            { error: "Unknown price id — please sync SUBSCRIPTION_PLANS" },
            { status: 500 }
          );
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: subscription.status === "active" ? plan : "free",
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: periodEndDate(subscription),
          },
        });

        logEvent("stripe.webhook.processed", {
          eventType: event.type,
          userId: user.id,
          plan,
          subscriptionStatus: subscription.status,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!user) {
          logWarning("stripe.webhook.orphan", {
            eventType: event.type,
            subscriptionId: subscription.id,
          });
          break;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: "free",
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
          },
        });

        Notify.subscriptionCanceled({ userId: user.id });
        audit({
          action: "billing.subscription.canceled",
          userId: user.id,
          resource: subscription.id,
        });

        // Send cancellation notification email
        if (user.email) {
          try {
            await sendSubscriptionCanceledEmail(user.email, user.name || undefined);
          } catch (emailError) {
            logError(emailError, { template: "subscription_canceled", userId: user.id });
          }
        }

        logEvent("stripe.webhook.subscription_canceled", { userId: user.id });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoiceSubscriptionId(invoice);

        if (subscriptionId) {
          const user = await prisma.user.findFirst({
            where: { stripeSubscriptionId: subscriptionId },
          });

          if (user) {
            // Reset monthly usage on successful payment
            await prisma.user.update({
              where: { id: user.id },
              data: {
                matchesUsedThisMonth: 0,
                autoApplyUsedThisMonth: 0,
                usageResetDate: new Date(),
              },
            });

            console.info(`Usage reset for user ${user.id}`);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const failedSubscriptionId = invoiceSubscriptionId(invoice);

        if (failedSubscriptionId) {
          const user = await prisma.user.findFirst({
            where: { stripeSubscriptionId: failedSubscriptionId },
          });

          if (user) {
            Notify.paymentFailed({ userId: user.id });
            audit({
              action: "billing.payment.failed",
              userId: user.id,
              resource: failedSubscriptionId,
              result: "failure",
            });
            if (user.email) {
              try {
                await sendPaymentFailedEmail(user.email, user.name || undefined);
              } catch (emailError) {
                logError(emailError, { template: "payment_failed", userId: user.id });
              }
            }
            logEvent("stripe.webhook.payment_failed", { userId: user.id });
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logError(error, { endpoint: "/api/stripe/webhook", eventType: event.type });
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
