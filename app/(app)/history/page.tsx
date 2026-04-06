import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { TrendingUp, Clock, Trophy, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

  const sessions = await prisma.examSession.findMany({
    where: { userId: user.id },
    orderBy: { completedAt: "desc" },
    take: 50,
  });

  // Compute stats
  const totalSessions = sessions.length;
  const avgScore = totalSessions > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / totalSessions)
    : 0;
  const bestScore = totalSessions > 0
    ? Math.round(Math.max(...sessions.map((s) => s.score)))
    : 0;
  const recentTrend = sessions.length >= 2
    ? Math.round(sessions[0].score - sessions[sessions.length - 1].score)
    : 0;

  // Group by mode for breakdown
  const modeMap = new Map<string, { count: number; totalScore: number }>();
  for (const s of sessions) {
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Exams</p>
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

          {/* Score trend chart (simple bar representation) */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Score Trend</h2>
            <div className="flex items-end gap-1.5 h-32">
              {sessions.slice().reverse().slice(-20).map((s, i) => (
                <div key={s.id} className="flex-1 flex flex-col items-center gap-1" title={`${s.mode}: ${Math.round(s.score)}% — ${formatDate(s.completedAt)}`}>
                  <div
                    className={cn(
                      "w-full rounded-t-md min-h-[4px] transition-all",
                      s.score >= 80 ? "bg-green-400" : s.score >= 50 ? "bg-yellow-400" : "bg-red-400"
                    )}
                    style={{ height: `${Math.max(s.score, 4)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400 dark:text-gray-500">
              <span>Oldest</span>
              <span>Latest</span>
            </div>
          </div>

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
                    <div className={cn(
                      "flex items-center justify-center h-10 w-10 rounded-xl text-sm font-bold",
                      s.score >= 80 ? "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400" :
                      s.score >= 50 ? "bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400" :
                      "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400"
                    )}>
                      {Math.round(s.score)}%
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{s.mode}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {s.correctCount}/{s.totalQuestions} correct
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
    </div>
  );
}
