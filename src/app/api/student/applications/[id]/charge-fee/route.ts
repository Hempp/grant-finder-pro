import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  chargeStudentSuccessFee,
  createStudentInstallmentPlan,
} from "@/lib/success-fee";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch application and verify ownership
    const application = await prisma.studentApplication.findUnique({
      where: { id },
      include: { scholarship: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (application.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify application is awarded and has an award amount
    if (application.status !== "awarded") {
      return NextResponse.json(
        { error: "Application is not in awarded status" },
        { status: 400 }
      );
    }

    if (!application.awardAmount) {
      return NextResponse.json(
        { error: "No award amount recorded for this application" },
        { status: 400 }
      );
    }

    // Parse optional body
    let installments: number | undefined;
    try {
      const body = await request.json();
      if (body?.installments && typeof body.installments === "number") {
        installments = body.installments;
      }
    } catch {
      // No body or invalid JSON — treat as full charge
    }

    // Charge via installment plan or full charge
    if (installments) {
      const totalFee = Math.round(
        (application.awardAmount * application.successFeePercent) / 100
      );

      const result = await createStudentInstallmentPlan({
        userId: session.user.id,
        applicationId: id,
        totalFee,
        installments,
      });

      return NextResponse.json(result);
    } else {
      const result = await chargeStudentSuccessFee({
        userId: session.user.id,
        applicationId: id,
        awardAmount: application.awardAmount,
        feePercent: application.successFeePercent,
        scholarshipTitle: application.scholarship.title,
      });

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("Failed to charge success fee:", error);
    return NextResponse.json(
      { error: "Failed to process fee charge" },
      { status: 500 }
    );
  }
}
