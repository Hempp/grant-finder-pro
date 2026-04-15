import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe, getPlanByPriceId } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { sendPaymentFailedEmail, sendSubscriptionCanceledEmail } from "@/lib/email";
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
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

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
          const plan = getPlanByPriceId(priceId) || "pro";

          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: plan,
              stripeSubscriptionId: subscription.id,
              stripePriceId: priceId,
              stripeCurrentPeriodEnd: periodEndDate(subscription),
            },
          });

          console.info(`User ${userId} subscribed to ${plan}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!user) {
          console.error("No user found for subscription:", subscription.id);
          break;
        }

        const priceId = subscription.items.data[0]?.price.id;
        const plan = getPlanByPriceId(priceId) || "pro";

        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: subscription.status === "active" ? plan : "free",
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: periodEndDate(subscription),
          },
        });

        console.info(`Subscription updated for user ${user.id}: ${plan}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!user) {
          console.error("No user found for subscription:", subscription.id);
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

        // Send cancellation notification email
        if (user.email) {
          try {
            await sendSubscriptionCanceledEmail(user.email, user.name || undefined);
            console.info(`Cancellation email sent to ${user.email}`);
          } catch (emailError) {
            console.error(`Failed to send cancellation email to ${user.email}:`, emailError);
          }
        }

        console.info(`Subscription canceled for user ${user.id}`);
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
            // Send payment failed email notification
            if (user.email) {
              try {
                await sendPaymentFailedEmail(user.email, user.name || undefined);
                console.info(`Payment failed email sent to ${user.email}`);
              } catch (emailError) {
                console.error(`Failed to send payment failed email to ${user.email}:`, emailError);
              }
            }
            console.info(`Payment failed for user ${user.id}`);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
