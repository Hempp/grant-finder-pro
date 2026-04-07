import { prisma } from "@/lib/db";

/**
 * Find all submitted student applications past their deadline
 * that haven't reported outcomes yet.
 */
export async function getOverdueOutcomes(): Promise<
  Array<{
    applicationId: string;
    userId: string;
    userEmail: string;
    userName: string | null;
    scholarshipId: string;
    scholarshipTitle: string;
    deadline: Date;
    daysPastDeadline: number;
    submittedAt: Date | null;
  }>
> {
  const now = new Date();

  const overdue = await prisma.studentApplication.findMany({
    where: {
      status: "submitted",
      outcomeReportedAt: null,
      scholarship: {
        deadline: { lt: now },
      },
    },
    include: {
      user: { select: { email: true, name: true } },
      scholarship: { select: { id: true, title: true, deadline: true } },
    },
  });

  return overdue.map((app) => ({
    applicationId: app.id,
    userId: app.userId,
    userEmail: app.user.email || "",
    userName: app.user.name,
    scholarshipId: app.scholarship.id,
    scholarshipTitle: app.scholarship.title,
    deadline: app.scholarship.deadline!,
    daysPastDeadline: Math.floor(
      (now.getTime() - (app.scholarship.deadline?.getTime() || 0)) / (1000 * 60 * 60 * 24)
    ),
    submittedAt: app.submittedAt,
  }));
}

/**
 * Group overdue outcomes by nudge timing for email campaigns.
 */
export async function getOutcomeNudgeGroups(): Promise<{
  sevenDay: Awaited<ReturnType<typeof getOverdueOutcomes>>;
  fourteenDay: Awaited<ReturnType<typeof getOverdueOutcomes>>;
  thirtyDay: Awaited<ReturnType<typeof getOverdueOutcomes>>;
}> {
  const all = await getOverdueOutcomes();

  return {
    sevenDay: all.filter((a) => a.daysPastDeadline >= 7 && a.daysPastDeadline < 14),
    fourteenDay: all.filter((a) => a.daysPastDeadline >= 14 && a.daysPastDeadline < 30),
    thirtyDay: all.filter((a) => a.daysPastDeadline >= 30),
  };
}
