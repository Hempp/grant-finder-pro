import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-helpers";
import { logEvent, logError } from "@/lib/telemetry";

/**
 * GDPR Article 15 (right of access) + Article 20 (right to portability).
 *
 * Returns a structured JSON bundle of every record owned by the calling
 * user. The PII encryption extension in `src/lib/db.ts` ensures encrypted
 * fields are decrypted for the export — the user exports their own
 * plaintext, which is exactly what portability requires.
 *
 * Served as `application/json` with a descriptive filename. The caller
 * is expected to store or pipe it; we don't chunk because even a heavy
 * user has at most a few MB of content across their applications.
 */
export async function GET() {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const userId = session.user.id;
  const generatedAt = new Date().toISOString();

  try {
    const [
      user,
      organization,
      studentProfile,
      applications,
      studentApplications,
      documents,
      contentBlocks,
      grants,
      grantOutcomes,
      applicationTemplates,
      notifications,
      referralsSent,
      referralsReceived,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true, email: true, name: true, plan: true, createdAt: true,
          updatedAt: true, emailVerified: true, referralCode: true,
          referralCredits: true, hasCompletedOnboarding: true,
          matchesUsedThisMonth: true, autoApplyUsedThisMonth: true,
          usageResetDate: true, alertsEnabled: true, alertFrequency: true,
          deadlineReminders: true, weeklyDigest: true, trialReminders: true,
        },
      }),
      prisma.organization.findUnique({ where: { userId } }),
      prisma.studentProfile.findUnique({ where: { userId } }),
      prisma.application.findMany({
        where: { userId },
        include: { grant: { select: { title: true, funder: true } } },
      }),
      prisma.studentApplication.findMany({ where: { userId } }),
      prisma.document.findMany({
        where: { userId },
        select: { id: true, name: true, type: true, mimeType: true, createdAt: true, updatedAt: true },
      }),
      prisma.contentBlock.findMany({ where: { userId } }),
      prisma.grant.findMany({ where: { userId } }),
      prisma.grantOutcome.findMany({ where: { userId } }),
      prisma.userApplicationTemplate.findMany({ where: { userId } }),
      prisma.notification.findMany({ where: { userId } }),
      prisma.referral.findMany({
        where: { referrerId: userId },
        select: {
          id: true, status: true, referrerReward: true, refereeReward: true,
          rewardedAt: true, signupSource: true,
        },
      }),
      prisma.referral.findMany({
        where: { refereeId: userId },
        select: {
          id: true, status: true, rewardedAt: true, signupSource: true,
        },
      }),
    ]);

    logEvent("user.data_export", { userId });

    const bundle = {
      meta: {
        format: "grantpilot-export-v1",
        generatedAt,
        generatedFor: user?.email,
        notes:
          "This export contains every record GrantPilot holds that is scoped to your account. " +
          "Encrypted fields (gender, ethnicity, citizenship, firstName, lastName on student profiles) " +
          "are decrypted here because this is YOUR data.",
      },
      user,
      organization,
      studentProfile,
      applications,
      studentApplications,
      documents,
      contentBlocks,
      grants,
      grantOutcomes,
      applicationTemplates,
      notifications,
      referralsSent,
      referralsReceived,
    };

    const filename = `grantpilot-export-${userId.slice(0, 8)}-${generatedAt.slice(0, 10)}.json`;

    return new NextResponse(JSON.stringify(bundle, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    logError(err, { endpoint: "/api/user/export-data", userId });
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
