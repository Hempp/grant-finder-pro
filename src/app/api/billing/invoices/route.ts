import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-helpers";
import { cacheGet, cacheSet } from "@/lib/cache";
import { logError } from "@/lib/telemetry";

interface InvoiceView {
  id: string;
  number: string | null;
  status: string | null;
  amountDue: number;
  amountPaid: number;
  currency: string;
  created: number;
  dueDate: number | null;
  description: string;
  hostedUrl: string | null | undefined;
}

/**
 * List invoices for the authenticated user's Stripe customer.
 *
 * Stripe is the system of record, but a 5-minute per-user cache keeps
 * the settings page from hammering Stripe's API on every tab switch.
 * Stale reads are acceptable here — a newly-generated success-fee
 * invoice takes a moment to materialize in Stripe anyway, and the
 * user sees "Paid" in the celebration modal right after reporting a
 * win. At 10K monthly-active users this cache turns ~50K Stripe API
 * calls/month into ~10K.
 */
const INVOICE_CACHE_TTL_SECONDS = 300;

export async function GET() {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const cacheKey = `billing:invoices:${session.user.id}`;
    const cached = await cacheGet<InvoiceView[]>(cacheKey);
    if (cached) {
      return NextResponse.json({ invoices: cached });
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

    const invoices: InvoiceView[] = list.data
      // Hide draft/void invoices — they confuse users who expect only real bills.
      .filter((inv) => inv.status !== "draft" && inv.status !== "void")
      .map((inv) => ({
        id: inv.id,
        number: inv.number,
        status: inv.status,
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

    await cacheSet(cacheKey, invoices, INVOICE_CACHE_TTL_SECONDS);

    return NextResponse.json({ invoices });
  } catch (error) {
    logError(error, { endpoint: "/api/billing/invoices" });
    return NextResponse.json(
      { error: "Failed to list invoices" },
      { status: 500 }
    );
  }
}
