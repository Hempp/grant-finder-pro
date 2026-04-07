import { prisma } from "@/lib/db";

/**
 * Cross-reference a list of winner names against students who applied
 * through GrantPilot for a given scholarship.
 */
export async function checkWinnerList(
  scholarshipId: string,
  winnerNames: string[]
): Promise<{
  matches: Array<{
    userId: string;
    studentName: string;
    applicationId: string;
    applicationStatus: string;
  }>;
  unmatched: string[];
}> {
  // Get all applications for this scholarship
  const applications = await prisma.studentApplication.findMany({
    where: { scholarshipId },
    include: {
      user: {
        include: {
          studentProfile: {
            select: { firstName: true, lastName: true },
          },
        },
      },
    },
  });

  const matches: Array<{
    userId: string;
    studentName: string;
    applicationId: string;
    applicationStatus: string;
  }> = [];
  const matchedNames = new Set<string>();

  for (const app of applications) {
    const profile = app.user.studentProfile;
    if (!profile) continue;

    const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim().toLowerCase();
    const lastName = (profile.lastName || "").toLowerCase();

    for (const winnerName of winnerNames) {
      const normalizedWinner = winnerName.trim().toLowerCase();
      // Match on full name or last name
      if (normalizedWinner === fullName || normalizedWinner.includes(lastName)) {
        matches.push({
          userId: app.userId,
          studentName: `${profile.firstName} ${profile.lastName}`,
          applicationId: app.id,
          applicationStatus: app.status,
        });
        matchedNames.add(winnerName);
        break;
      }
    }
  }

  const unmatched = winnerNames.filter((n) => !matchedNames.has(n));

  return { matches, unmatched };
}
