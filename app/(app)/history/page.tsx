import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Trophy, Flame } from "lucide-react";
import Link from "next/link";
import ScoreTrendChart from "@/components/ScoreTrendChart";
import ExamTypeCard from "@/components/ExamTypeCard";
import { getStudyStreak } from "@/lib/streak";
import BookmarkedSection from "@/components/BookmarkedSection";

const EXAM_TYPES = [
  { mode: "Exam 1", label: "Exam 1 Practice", iconName: "FileText", color: "brand" },
  { mode: "Exam 2A", label: "Exam 2A Practice", iconName: "ClipboardList", color: "blue" },
  { mode: "Exam 2B", label: "Exam 2B Practice", iconName: "Target", color: "green" },
  { mode: "Exam 2A & 2B", label: "Exam 2A & 2B Practice", iconName: "Layers", color: "purple" },
] as const;

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="text-center text-gray-400 dark:text-gray-500 py-20">
        Please log in to view your exam history.
      </div>
    );
  }

  const [sessions, bookmarkedAttempts, bookmarkedSetAttempts] = await Promise.all([
    prisma.examSession.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: "desc" },
      take: 50,
    }),
    prisma.attempt.findMany({
      where: { userId: user.id, bookmarked: true },
      orderBy: { createdAt: "desc" },
      include: {
        question: {
          select: {
            questionNumber: true,
            part: true,
            marks: true,
            exam: { select: { year: true, examType: true } },
            topic: { select: { name: true, slug: true } },
          },
        },
      },
    }),
    prisma.questionSetAttempt.findMany({
      where: { userId: user.id, bookmarked: true },
      orderBy: { createdAt: "desc" },
      include: {
        questionSetItem: {
          select: {
            order: true,
            marks: true,
            content: true,
            topic: { select: { name: true, slug: true } },
            questionSet: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  // Only graded sessions contribute to score stats. Ungraded sessions
  // (Exam 1, Exam 2B) are still listed but excluded from averages/trends.
  const gradedSessions = sessions.filter((s) => s.graded);

  const streak = await getStudyStreak(user.id);
  const chartData = gradedSessions
    .slice()
    .reverse()
    .slice(-20)
    .map((s) => ({
      id: s.id,
      score: s.score,
      mode: s.mode,
      completedAt: s.completedAt.toISOString(),
    }));

  const totalSessions = sessions.length;
  const totalGraded = gradedSessions.length;

  // Build per-mode stats for each exam type card
  const modeStats = EXAM_TYPES.map((type) => {
    const forMode = sessions.filter((s) => s.mode === type.mode);
    const gradedForMode = forMode.filter((s) => s.graded);
    const latest = forMode[0]; // sessions are desc by completedAt
    return {
      ...type,
      count: forMode.length,
      avgScore:
        gradedForMode.length > 0
          ? Math.round(
              gradedForMode.reduce((sum, s) => sum + s.score, 0) /
                gradedForMode.length
            )
          : null,
      bestScore:
        gradedForMode.length > 0
          ? Math.round(Math.max(...gradedForMode.map((s) => s.score)))
          : null,
      latestAt: latest ? latest.completedAt.toISOString() : null,
      latestSessionId: latest?.id ?? null,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Exam History</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Track your performance across practice exams.</p>
      </div>

      {/* Streak banner */}
      {totalSessions > 0 && streak > 0 && (
        <div className="rounded-2xl border border-orange-200 dark:border-orange-900 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40 shadow-sm px-5 py-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900">
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {streak} day streak
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {streak === 1
                ? "Great start! Keep it going tomorrow."
                : streak < 5
                  ? "Keep it up!"
                  : streak < 10
                    ? "You're on fire!"
                    : "Unstoppable!"}
            </p>
          </div>
        </div>
      )}

      {totalSessions === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
          <Trophy className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-gray-500 mb-4">No exam sessions yet. Complete a practice exam to see your history.</p>
          <Link
            href="/practice"
            className="inline-flex rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Start Practice
          </Link>
        </div>
      ) : (
        <>
          {/* Per-mode history cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {modeStats.map((s) => (
              <ExamTypeCard
                key={s.mode}
                mode={s.mode}
                label={s.label}
                iconName={s.iconName}
                color={s.color}
                count={s.count}
                avgScore={s.avgScore}
                bestScore={s.bestScore}
                latestAt={s.latestAt}
                latestSessionId={s.latestSessionId}
              />
            ))}
          </div>

          {/* Score trend chart (graded sessions only) */}
          {totalGraded > 0 && (
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Score Trend</h2>
              <ScoreTrendChart data={chartData} />
            </div>
          )}
        </>
      )}

      {/* Bookmarked questions — from both exam attempts and topic question sets */}
      {(bookmarkedAttempts.length > 0 || bookmarkedSetAttempts.length > 0) && (
        <BookmarkedSection
          examAttempts={bookmarkedAttempts.map((a) => ({
            id: a.id,
            questionId: a.questionId,
            status: a.status,
            year: a.question.exam.year,
            examType: a.question.exam.examType,
            questionNumber: a.question.questionNumber,
            part: a.question.part,
            topicName: a.question.topic.name,
            marks: a.question.marks,
          }))}
          setAttempts={bookmarkedSetAttempts.map((a) => ({
            id: a.id,
            questionSetItemId: a.questionSetItemId,
            status: a.status,
            content: a.questionSetItem.content.split("\n")[0],
            topicName: a.questionSetItem.topic.name,
            topicSlug: a.questionSetItem.topic.slug,
            marks: a.questionSetItem.marks,
          }))}
        />
      )}
    </div>
  );
}
