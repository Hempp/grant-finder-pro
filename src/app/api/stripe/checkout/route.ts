import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe, PLANS, PlanType } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan, interval = "monthly" } = await request.json();

    if (!plan || !PLANS[plan as PlanType]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (interval !== "monthly" && interval !== "annual") {
      return NextResponse.json({ error: "Invalid billing interval" }, { status: 400 });
    }

    const selectedPlan = PLANS[plan as PlanType];

    // Get the correct price ID based on interval
    const priceId = interval === "annual" && "priceIdAnnual" in selectedPlan
      ? selectedPlan.priceIdAnnual
      : selectedPlan.priceId;

    if (!priceId) {
      return NextResponse.json({ error: "This plan has no price ID configured for the selected interval" }, { status: 400 });
    }

    // Get or create Stripe customer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const checkoutSession = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        plan: plan,
        interval: interval,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan: plan,
          interval: interval,
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
