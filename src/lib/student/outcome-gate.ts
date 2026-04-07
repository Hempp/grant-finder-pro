import { prisma } from "@/lib/db";

export async function checkOutcomeGate(userId: string): Promise<{
  gated: boolean;
  overdueCount: number;
  applications: Array<{ id: string; scholarshipTitle: string; deadline: string }>;
}> {
  const overdue = await prisma.studentApplication.findMany({
    where: {
      userId,
      status: "submitted",
      outcomeReportedAt: null,
      scholarship: {
        deadline: { lt: new Date() },
      },
    },
    include: {
      scholarship: { select: { title: true, deadline: true } },
    },
  });

  return {
    gated: overdue.length > 0,
    overdueCount: overdue.length,
    applications: overdue.map((a) => ({
      id: a.id,
      scholarshipTitle: a.scholarship.title,
      deadline: a.scholarship.deadline?.toISOString() || "",
    })),
  };
}
