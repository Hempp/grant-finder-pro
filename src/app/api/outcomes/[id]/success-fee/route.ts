import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateSuccessFee, createSuccessFeeInvoice, PlanType } from "@/lib/stripe";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST - Process success fee for an awarded grant
export async function POST(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: outcomeId } = await params;

  // Get outcome with grant details
  const outcome = await prisma.grantOutcome.findUnique({
    where: { id: outcomeId },
    include: {
      grant: { select: { title: true, amount: true, amountMax: true } },
    },
  });

  if (!outcome) {
    return NextResponse.json({ error: "Outcome not found" }, { status: 404 });
  }

  if (outcome.result !== "awarded") {
    return NextResponse.json({ error: "Success fee only applies to awarded grants" }, { status: 400 });
  }

  if (outcome.successFeeStatus === "invoiced" || outcome.successFeeStatus === "paid") {
    return NextResponse.json({ error: "Success fee already processed" }, { status: 400 });
  }

  // Get user's plan and Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, stripeCustomerId: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const plan = (user.plan as PlanType) || "free";
  const grantAmount = outcome.grantAmount || outcome.grant.amountMax || parseInt(outcome.grant.amount || "0") || 0;

  if (grantAmount <= 0) {
    return NextResponse.json({ error: "Grant amount not available" }, { status: 400 });
  }

  // Calculate fee
  const { feePercent, feeAmount, applies } = calculateSuccessFee(plan, grantAmount);

  if (!applies) {
    // No fee for this plan/amount — mark as waived
    await prisma.grantOutcome.update({
      where: { id: outcomeId },
      data: { successFeeStatus: "waived", successFeePercent: 0, successFeeAmount: 0 },
    });
    return NextResponse.json({ fee: 0, status: "waived", reason: "Below threshold or free plan" });
  }

  if (!user.stripeCustomerId) {
    // Can't charge without Stripe customer — mark as pending
    await prisma.grantOutcome.update({
      where: { id: outcomeId },
      data: {
        successFeePercent: feePercent,
        successFeeAmount: feeAmount,
        successFeeStatus: "pending",
      },
    });
    return NextResponse.json({
      fee: feeAmount,
      feePercent,
      status: "pending",
      reason: "No payment method on file — will invoice when available",
    });
  }

  // Create Stripe invoice
  const invoiceId = await createSuccessFeeInvoice(
    user.stripeCustomerId,
    outcome.grant.title,
    grantAmount,
    feeAmount,
    feePercent
  );

  // Update outcome with fee details
  await prisma.grantOutcome.update({
    where: { id: outcomeId },
    data: {
      successFeePercent: feePercent,
      successFeeAmount: feeAmount,
      successFeeStatus: invoiceId ? "invoiced" : "pending",
      stripeInvoiceId: invoiceId,
      feeInvoicedAt: invoiceId ? new Date() : null,
    },
  });

  return NextResponse.json({
    fee: feeAmount,
    feePercent,
    grantAmount,
    status: invoiceId ? "invoiced" : "pending",
    invoiceId,
  });
}

// GET - Check success fee status for an outcome
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: outcomeId } = await params;

  const outcome = await prisma.grantOutcome.findUnique({
    where: { id: outcomeId },
    select: {
      successFeePercent: true,
      successFeeAmount: true,
      successFeeStatus: true,
      grantAmount: true,
      result: true,
    },
  });

  if (!outcome) {
    return NextResponse.json({ error: "Outcome not found" }, { status: 404 });
  }

  return NextResponse.json(outcome);
}
