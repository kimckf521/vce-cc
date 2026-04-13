import { prisma } from "@/lib/prisma";

/**
 * Compute the current study streak for a user based on ExamSession completions.
 * A streak is the number of consecutive days (ending today or yesterday)
 * with at least one completed exam session.
 */
export async function getStudyStreak(userId: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ d: Date }[]>`
    SELECT DISTINCT DATE("completedAt" AT TIME ZONE 'Australia/Melbourne') AS d
    FROM "ExamSession"
    WHERE "userId" = ${userId}
    ORDER BY d DESC
  `;
  if (rows.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const firstDay = new Date(rows[0].d);
  firstDay.setHours(0, 0, 0, 0);

  // Streak must include today or yesterday
  if (
    firstDay.getTime() !== today.getTime() &&
    firstDay.getTime() !== yesterday.getTime()
  )
    return 0;

  let streak = 1;
  for (let i = 1; i < rows.length; i++) {
    const prev = new Date(rows[i - 1].d);
    const curr = new Date(rows[i].d);
    prev.setHours(0, 0, 0, 0);
    curr.setHours(0, 0, 0, 0);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}
