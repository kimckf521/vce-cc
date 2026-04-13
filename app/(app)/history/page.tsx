import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { TrendingUp, Clock, Trophy, BarChart2, Flame, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ScoreTrendChart from "@/components/ScoreTrendChart";
import EditableScoreBadge from "@/components/EditableScoreBadge";
import { getStudyStreak } from "@/lib/streak";

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
            questionNumber: true,
            part: true,
            marks: true,
            questionSet: {
              select: {
                year: true,
                examType: true,
                topic: { select: { name: true, slug: true } },
              },
            },
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

  // Compute stats (graded only)
  const totalSessions = sessions.length;
  const totalGraded = gradedSessions.length;
  const avgScore = totalGraded > 0
    ? Math.round(gradedSessions.reduce((sum, s) => sum + s.score, 0) / totalGraded)
    : 0;
  const bestScore = totalGraded > 0
    ? Math.round(Math.max(...gradedSessions.map((s) => s.score)))
    : 0;
  const recentTrend = gradedSessions.length >= 2
    ? Math.round(gradedSessions[0].score - gradedSessions[gradedSessions.length - 1].score)
    : 0;

  // Group by mode for breakdown (graded only)
  const modeMap = new Map<string, { count: number; totalScore: number }>();
  for (const s of gradedSessions) {
    const entry = modeMap.get(s.mode) ?? { count: 0, totalScore: 0 };
    entry.count++;
    entry.totalScore += s.score;
    modeMap.set(s.mode, entry);
  }

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
          {/* Stats overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5">
              <div className="inline-flex rounded-xl bg-brand-50 dark:bg-brand-950 p-2.5 mb-3">
                <BarChart2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalSessions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Exams
                {totalGraded !== totalSessions && (
                  <span className="block text-xs text-gray-400 dark:text-gray-500">
                    {totalGraded} graded
                  </span>
                )}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5">
              <div className="inline-flex rounded-xl bg-blue-50 dark:bg-blue-950 p-2.5 mb-3">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{avgScore}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
            </div>
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5">
              <div className="inline-flex rounded-xl bg-green-50 dark:bg-green-950 p-2.5 mb-3">
                <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{bestScore}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Best Score</p>
            </div>
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5">
              <div className="inline-flex rounded-xl bg-purple-50 dark:bg-purple-950 p-2.5 mb-3">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className={cn("text-2xl font-bold", recentTrend >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                {recentTrend >= 0 ? "+" : ""}{recentTrend}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Trend (first→latest)</p>
            </div>
          </div>

          {/* Mode breakdown */}
          {modeMap.size > 1 && (
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">By Exam Type</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Array.from(modeMap.entries()).map(([mode, data]) => (
                  <div key={mode} className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{mode}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {data.count} exam{data.count !== 1 ? "s" : ""} · Avg {Math.round(data.totalScore / data.count)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score trend chart (graded sessions only) */}
          {totalGraded > 0 && (
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Score Trend</h2>
              <ScoreTrendChart data={chartData} />
            </div>
          )}

          {/* Session list */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Recent Sessions</h2>
            <div className="space-y-2">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-4"
                >
                  <div className="flex items-center gap-4">
                    <EditableScoreBadge
                      sessionId={s.id}
                      initialScore={s.score}
                      totalQuestions={s.totalQuestions}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{s.mode}</p>
                        {!s.graded && (
                          <span className="rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                            Not marked yet
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {s.graded
                          ? `${s.correctCount}/${s.totalQuestions} correct`
                          : `${s.totalQuestions} questions`}
                        {s.elapsedSeconds ? ` · ${formatElapsed(s.elapsedSeconds)}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(s.completedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Bookmarked questions — from both exam attempts and topic question sets */}
      {(bookmarkedAttempts.length > 0 || bookmarkedSetAttempts.length > 0) && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
            Bookmarked Questions
          </h2>
          <div className="space-y-2">
            {/* From exam papers */}
            {bookmarkedAttempts.map((a) => {
              const q = a.question;
              const examLabel = q.exam.examType === "EXAM_1" ? "Exam 1" : "Exam 2";
              const qLabel = `Q${q.questionNumber}${q.part ?? ""}`;
              return (
                <Link
                  key={a.id}
                  href={`/topics/${q.topic.slug}`}
                  className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-4 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400">
                      <Bookmark className="h-4 w-4 fill-current" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {q.exam.year} {examLabel} · {qLabel}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {q.topic.name} · {q.marks} mark{q.marks !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    a.status === "CORRECT" ? "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400" :
                    a.status === "INCORRECT" ? "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400" :
                    "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  )}>
                    {a.status === "CORRECT" ? "Correct" : a.status === "INCORRECT" ? "Incorrect" : "Review"}
                  </span>
                </Link>
              );
            })}
            {/* From topic question sets */}
            {bookmarkedSetAttempts.map((a) => {
              const item = a.questionSetItem;
              const qs = item.questionSet;
              const examLabel = qs.examType === "EXAM_1" ? "Exam 1" : "Exam 2";
              const qLabel = `Q${item.questionNumber}${item.part ?? ""}`;
              return (
                <Link
                  key={a.id}
                  href={`/topics/${qs.topic.slug}`}
                  className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-4 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400">
                      <Bookmark className="h-4 w-4 fill-current" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {qs.year} {examLabel} · {qLabel}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {qs.topic.name} · {item.marks} mark{item.marks !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    a.status === "CORRECT" ? "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400" :
                    a.status === "INCORRECT" ? "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400" :
                    "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  )}>
                    {a.status === "CORRECT" ? "Correct" : a.status === "INCORRECT" ? "Incorrect" : "Review"}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
