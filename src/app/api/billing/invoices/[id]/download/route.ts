import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

/**
 * Proxy the Stripe-hosted invoice PDF so we can (a) enforce ownership and
 * (b) hide the Stripe-hosted URL from our users. Stripe rotates the
 * hosted-URL token; fetching on demand is the right move.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: "No billing account" }, { status: 404 });
    }

    const invoice = await getStripe().invoices.retrieve(id);

    // Ownership check — belt-and-suspenders against URL guessing.
    if (invoice.customer !== user.stripeCustomerId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const pdfUrl = invoice.invoice_pdf;
    if (!pdfUrl) {
      return NextResponse.json(
        { error: "Invoice PDF not ready yet — try again in a moment." },
        { status: 409 }
      );
    }

    const pdfRes = await fetch(pdfUrl);
    if (!pdfRes.ok || !pdfRes.body) {
      return NextResponse.json(
        { error: "Failed to fetch invoice PDF" },
        { status: 502 }
      );
    }

    const filename = `grantpilot-invoice-${invoice.number || id}.pdf`;
    return new NextResponse(pdfRes.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        // Private because this response is user-scoped and may contain PII.
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Invoice download failed:", error);
    return NextResponse.json(
      { error: "Failed to download invoice" },
      { status: 500 }
    );
  }
}
