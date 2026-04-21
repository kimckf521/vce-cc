import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import EditableScoreBadge from "@/components/EditableScoreBadge";

const MODE_SLUGS: Record<string, { mode: string; label: string }> = {
  exam1: { mode: "Exam 1", label: "Exam 1 Practice" },
  exam2a: { mode: "Exam 2A", label: "Exam 2A Practice" },
  exam2b: { mode: "Exam 2B", label: "Exam 2B Practice" },
  exam2ab: { mode: "Exam 2A & 2B", label: "Exam 2A & 2B Practice" },
};

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

interface PageProps {
  params: Promise<{ mode: string }>;
}

export default async function ModeHistoryPage({ params }: PageProps) {
  const { mode: modeSlug } = await params;
  const modeConfig = MODE_SLUGS[modeSlug];
  if (!modeConfig) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="text-center text-gray-400 dark:text-gray-500 py-20">
        Please log in to view your exam history.
      </div>
    );
  }

  const sessions = await prisma.examSession.findMany({
    where: { userId: user.id, mode: modeConfig.mode },
    orderBy: { completedAt: "desc" },
  });

  const gradedSessions = sessions.filter((s) => s.graded);
  const avgScore =
    gradedSessions.length > 0
      ? Math.round(
          gradedSessions.reduce((sum, s) => sum + s.score, 0) /
            gradedSessions.length
        )
      : null;
  const bestScore =
    gradedSessions.length > 0
      ? Math.round(Math.max(...gradedSessions.map((s) => s.score)))
      : null;

  const practiceUrl = `/practice?mode=${modeSlug}`;

  return (
    <div className="space-y-6">
      <Link
        href="/history"
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Back to History
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {modeConfig.label}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {sessions.length} attempt{sessions.length !== 1 ? "s" : ""}
            {avgScore !== null && (
              <>
                {" · Avg "}
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {avgScore}%
                </span>
                {bestScore !== null && bestScore !== avgScore && (
                  <>
                    {" · Best "}
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {bestScore}%
                    </span>
                  </>
                )}
              </>
            )}
          </p>
        </div>
        <Link
          href={practiceUrl}
          className="shrink-0 inline-flex rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          Start new
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
          <FileText className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-gray-500 mb-4">
            You haven&apos;t attempted this exam type yet.
          </p>
          <Link
            href={practiceUrl}
            className="inline-flex rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Start {modeConfig.label}
          </Link>
        </div>
      ) : (
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
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Attempt #{sessions.length - sessions.indexOf(s)}
                    </p>
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
                    {s.elapsedSeconds
                      ? ` · ${formatElapsed(s.elapsedSeconds)}`
                      : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDate(s.completedAt)}
                </span>
                <Link
                  href={`/history/${s.id}`}
                  aria-label={`View details for attempt ${sessions.length - sessions.indexOf(s)}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  View
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
