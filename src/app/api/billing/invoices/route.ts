import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

/**
 * List invoices for the authenticated user's Stripe customer.
 *
 * Why list directly from Stripe instead of a local `Invoice` table: Stripe
 * is the system of record for billing events, and storing a shadow table
 * means reconciliation bugs the day a webhook is missed. The tradeoff is
 * one round-trip per page view, which is fine for the settings page.
 *
 * Auth: user must own the stripeCustomerId.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ invoices: [] });
    }

    const list = await getStripe().invoices.list({
      customer: user.stripeCustomerId,
      limit: 24,
    });

    const invoices = list.data
      // Hide draft/void invoices — they confuse users who expect only real bills.
      .filter((inv) => inv.status !== "draft" && inv.status !== "void")
      .map((inv) => ({
        id: inv.id,
        number: inv.number,
        status: inv.status, // paid, open, uncollectible
        amountDue: inv.amount_due,
        amountPaid: inv.amount_paid,
        currency: inv.currency,
        created: inv.created,
        dueDate: inv.due_date,
        description:
          inv.description ||
          inv.lines?.data?.[0]?.description ||
          (inv.metadata?.type === "success_fee"
            ? "Grant success fee"
            : "Subscription"),
        hostedUrl: inv.hosted_invoice_url,
      }));

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("List invoices failed:", error);
    return NextResponse.json(
      { error: "Failed to list invoices" },
      { status: 500 }
    );
  }
}
