// API endpoint for managing user notification preferences

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - Fetch user notification preferences
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
        deadlineReminders: true,
        weeklyDigest: true,
        trialReminders: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      emailNotifications: user.alertsEnabled,
      alertFrequency: user.alertFrequency,
      alertCategories: user.alertCategories ? JSON.parse(user.alertCategories) : [],
      deadlineReminders: user.deadlineReminders,
      weeklyDigest: user.weeklyDigest,
      trialReminders: user.trialReminders,
    });
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

// PATCH - Update user notification preferences
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      emailNotifications,
      alertFrequency,
      alertCategories,
      deadlineReminders,
      weeklyDigest,
      trialReminders,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (typeof emailNotifications === "boolean") {
      updateData.alertsEnabled = emailNotifications;
    }
    if (alertFrequency) {
      updateData.alertFrequency = alertFrequency;
    }
    if (Array.isArray(alertCategories)) {
      updateData.alertCategories = JSON.stringify(alertCategories);
    }
    if (typeof deadlineReminders === "boolean") {
      updateData.deadlineReminders = deadlineReminders;
    }
    if (typeof weeklyDigest === "boolean") {
      updateData.weeklyDigest = weeklyDigest;
    }
    if (typeof trialReminders === "boolean") {
      updateData.trialReminders = trialReminders;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        alertsEnabled: true,
        alertFrequency: true,
        alertCategories: true,
        deadlineReminders: true,
        weeklyDigest: true,
        trialReminders: true,
      },
    });

    return NextResponse.json({
      success: true,
      preferences: {
        emailNotifications: updatedUser.alertsEnabled,
        alertFrequency: updatedUser.alertFrequency,
        alertCategories: updatedUser.alertCategories
          ? JSON.parse(updatedUser.alertCategories)
          : [],
        deadlineReminders: updatedUser.deadlineReminders,
        weeklyDigest: updatedUser.weeklyDigest,
        trialReminders: updatedUser.trialReminders,
      },
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
