import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

// GET — Get current payment method
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripePaymentMethodId: true },
    });

    if (!user?.stripePaymentMethodId) {
      return NextResponse.json({ hasPaymentMethod: false });
    }

    const pm = await getStripe().paymentMethods.retrieve(
      user.stripePaymentMethodId
    );

    return NextResponse.json({
      hasPaymentMethod: true,
      last4: pm.card?.last4,
      brand: pm.card?.brand,
      expMonth: pm.card?.exp_month,
      expYear: pm.card?.exp_year,
    });
  } catch (error) {
    console.error("Failed to get payment method:", error);
    return NextResponse.json(
      { error: "Failed to get payment method" },
      { status: 500 }
    );
  }
}

// POST — Create SetupIntent
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await getStripe().customers.create({
        email: user.email ?? undefined,
        name: user.name ?? undefined,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    const setupIntent = await getStripe().setupIntents.create({
      customer: stripeCustomerId,
      usage: "off_session",
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error("Failed to create SetupIntent:", error);
    return NextResponse.json(
      { error: "Failed to create SetupIntent" },
      { status: 500 }
    );
  }
}

// DELETE — Remove payment method
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripePaymentMethodId: true },
    });

    if (!user?.stripePaymentMethodId) {
      return NextResponse.json(
        { error: "No payment method on file" },
        { status: 404 }
      );
    }

    await getStripe().paymentMethods.detach(user.stripePaymentMethodId);

    await prisma.user.update({
      where: { id: userId },
      data: { stripePaymentMethodId: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove payment method:", error);
    return NextResponse.json(
      { error: "Failed to remove payment method" },
      { status: 500 }
    );
  }
}
