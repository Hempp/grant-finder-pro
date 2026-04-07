import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

// POST — Confirm SetupIntent and save PaymentMethod
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const { setupIntentId } = body as { setupIntentId: string };

    if (!setupIntentId) {
      return NextResponse.json(
        { error: "setupIntentId is required" },
        { status: 400 }
      );
    }

    const setupIntent = await getStripe().setupIntents.retrieve(setupIntentId);

    const paymentMethodId =
      typeof setupIntent.payment_method === "string"
        ? setupIntent.payment_method
        : setupIntent.payment_method?.id;

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "No payment method found on SetupIntent" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { stripePaymentMethodId: paymentMethodId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to confirm SetupIntent:", error);
    return NextResponse.json(
      { error: "Failed to confirm SetupIntent" },
      { status: 500 }
    );
  }
}
