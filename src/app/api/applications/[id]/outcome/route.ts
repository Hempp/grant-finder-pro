import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { calculateSuccessFee, getStripe, PlanType } from "@/lib/stripe";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_RESULTS = ["awarded", "rejected", "no_response"] as const;

// POST - Report outcome for an application
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { result, notes, feedback, awardAmount } = body;

    // Validate result
    if (!result || !VALID_RESULTS.includes(result)) {
      return NextResponse.json(
        { error: "Invalid result. Must be one of: awarded, rejected, no_response" },
        { status: 400 }
      );
    }

    // Verify application belongs to user
    const application = await prisma.application.findFirst({
      where: { id, userId: session.user.id },
      include: { grant: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Get the user's plan and payment info for fee charging
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build update data
    const now = new Date();
    const updateData: Record<string, unknown> = {
      status: result === "no_response" ? "submitted" : result,
      outcomeReportedAt: now,
      outcomeNotes: notes || null,
      feedbackReceived: feedback || null,
    };

    // Success fee tracking state
    let feePercent = 0;
    let feeAmount = 0;
    let applies = false;
    let chargeSucceeded = false;
    let paymentIntentId: string | null = null;

    if (result === "awarded") {
      updateData.awardedAt = now;
      if (awardAmount) {
        updateData.awardAmount = awardAmount;

        // Calculate the success fee
        const feeResult = calculateSuccessFee(user.plan as PlanType, awardAmount);
        feePercent = feeResult.feePercent;
        feeAmount = feeResult.feeAmount;
        applies = feeResult.applies;

        if (applies) {
          if (user.stripeCustomerId && user.stripePaymentMethodId) {
            // Attempt to charge immediately via PaymentIntent
            try {
              const stripe = getStripe();
              const paymentIntent = await stripe.paymentIntents.create({
                amount: feeAmount * 100, // cents
                currency: "usd",
                customer: user.stripeCustomerId,
                payment_method: user.stripePaymentMethodId,
                off_session: true,
                confirm: true,
                description: `GrantPilot Success Fee (${feePercent}%) — "${application.grant.title}"`,
              });

              if (paymentIntent.status === "succeeded") {
                chargeSucceeded = true;
                paymentIntentId = paymentIntent.id;
              }
            } catch (stripeError) {
              console.error("Stripe charge failed for success fee:", stripeError);
              // Fall through — status will be "pending" instead
            }

            updateData.successFeePercent = feePercent;
            updateData.successFeeAmount = feeAmount;
            updateData.successFeeStatus = chargeSucceeded ? "charged" : "pending";
            if (chargeSucceeded) {
              updateData.successFeePaidAt = now;
              updateData.stripePaymentId = paymentIntentId;
            }
          } else {
            // No payment method on file — mark as pending for later collection
            updateData.successFeePercent = feePercent;
            updateData.successFeeAmount = feeAmount;
            updateData.successFeeStatus = "pending";
          }
        } else {
          // Fee doesn't apply (free plan or below threshold)
          updateData.successFeePercent = feePercent;
          updateData.successFeeAmount = 0;
          updateData.successFeeStatus = "waived";
        }
      }
    } else if (result === "rejected") {
      updateData.rejectedAt = now;
    }

    // Update the application
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: updateData,
      include: { grant: true },
    });

    // Get user's organization for anonymized demographics
    const organization = await prisma.organization.findUnique({
      where: { userId: session.user.id },
    });

    // Create anonymized GrantOutcome record
    await prisma.grantOutcome.create({
      data: {
        grantId: application.grantId,
        orgType: organization?.type || null,
        orgState: organization?.state || null,
        teamSize: organization?.teamSize || null,
        annualRevenue: organization?.annualRevenue || null,
        result,
        appliedAt: application.submittedAt || application.createdAt,
        resultAt: now,
        grantAmount: result === "awarded" && awardAmount ? awardAmount : null,
        successFeePercent: applies ? feePercent : null,
        successFeeAmount: applies ? feeAmount : null,
        successFeeStatus: applies
          ? chargeSucceeded
            ? "paid"
            : "pending"
          : null,
      },
    });

    return NextResponse.json({
      success: true,
      application: updatedApplication,
      fee: applies
        ? {
            feePercent,
            feeAmount,
            charged: chargeSucceeded,
            status: chargeSucceeded ? "charged" : "pending",
            paymentIntentId,
          }
        : null,
    });
  } catch (error) {
    console.error("Failed to report outcome:", error);
    return NextResponse.json(
      { error: "Failed to report outcome" },
      { status: 500 }
    );
  }
}

// GET - Check if outcome reporting is needed
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const application = await prisma.application.findFirst({
      where: { id, userId: session.user.id },
      include: { grant: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const now = new Date();
    const deadlinePassed = application.grant.deadline
      ? new Date(application.grant.deadline) < now
      : false;

    const needsOutcome =
      application.status === "submitted" &&
      !application.outcomeReportedAt &&
      deadlinePassed;

    return NextResponse.json({
      needsOutcome,
      applicationId: application.id,
      grantTitle: application.grant.title,
      submittedAt: application.submittedAt,
      deadline: application.grant.deadline,
    });
  } catch (error) {
    console.error("Failed to check outcome status:", error);
    return NextResponse.json(
      { error: "Failed to check outcome status" },
      { status: 500 }
    );
  }
}
