// Email alerts management endpoint
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";

// GET - Get current alert preferences
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        alertsEnabled: true,
        alertFrequency: true,
        alertCategories: true,
        lastAlertSent: true,
        email: true,
      },
    });

    return NextResponse.json({
      alertsEnabled: user?.alertsEnabled || false,
      alertFrequency: user?.alertFrequency || "daily",
      alertCategories: user?.alertCategories ? JSON.parse(user.alertCategories) : [],
      lastAlertSent: user?.lastAlertSent,
      email: user?.email,
    });
  } catch (error) {
    console.error("Failed to get alert preferences:", error);
    return NextResponse.json(
      { error: "Failed to get alert preferences" },
      { status: 500 }
    );
  }
}

// POST - Update alert preferences
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { alertsEnabled, alertFrequency, alertCategories } = body;

    // Get current user state to check if this is first time enabling
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { alertsEnabled: true, email: true, name: true },
    });

    const wasEnabled = currentUser?.alertsEnabled;

    // Update preferences
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        alertsEnabled: alertsEnabled ?? undefined,
        alertFrequency: alertFrequency ?? undefined,
        alertCategories: alertCategories ? JSON.stringify(alertCategories) : undefined,
      },
      select: {
        alertsEnabled: true,
        alertFrequency: true,
        alertCategories: true,
        email: true,
        name: true,
      },
    });

    // Send welcome email if alerts were just enabled
    if (alertsEnabled && !wasEnabled && user.email) {
      try {
        await sendWelcomeEmail(user.email, user.name || undefined);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      alertsEnabled: user.alertsEnabled,
      alertFrequency: user.alertFrequency,
      alertCategories: user.alertCategories ? JSON.parse(user.alertCategories) : [],
    });
  } catch (error) {
    console.error("Failed to update alert preferences:", error);
    return NextResponse.json(
      { error: "Failed to update alert preferences" },
      { status: 500 }
    );
  }
}
