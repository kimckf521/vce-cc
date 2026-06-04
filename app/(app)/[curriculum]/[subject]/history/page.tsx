import { redirect } from "next/navigation";
import Link from "next/link";
import { History, Trophy, Clock, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  getDbSubjectSlug,
  isKnownSubject,
  getSubjectMetadata,
} from "@/lib/subject-context";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ curriculum: string; subject: string }>;
}

/**
 * Per-subject practice history. Lists every ExamSession the user has
 * completed where at least one question belonged to a topic in THIS subject.
 * Sessions are scoped by walking the join:
 *   ExamSession → ExamSessionQuestion → QuestionSetItem → Topic → Subject
 *
 * Free for every signed-in user — the data here is the user's own practice
 * record, so reviewing it is part of the free tier.
 */
export default async function SubjectHistoryPage({ params }: PageProps) {
  const { curriculum, subject } = await params;

  if (!isKnownSubject(subject)) {
    redirect(`/${curriculum}/methods/history`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const subjectDbSlug = getDbSubjectSlug(subject);
  const meta = getSubjectMetadata(subject);
  const shortName = meta?.shortName ?? subject;

  const sessions = await prisma.examSession.findMany({
    where: {
      userId: user.id,
      // Any session whose questions touch this subject. Most sessions are
      // single-subject (the picker scopes by topic) so the `some` filter is
      // typically exact.
      questions: {
        some: {
          questionSetItem: {
            topic: { subject: { slug: subjectDbSlug } },
          },
        },
      },
    },
    orderBy: { completedAt: "desc" },
    take: 50,
    select: {
      id: true,
      mode: true,
      totalQuestions: true,
      correctCount: true,
      score: true,
      elapsedSeconds: true,
      graded: true,
      completedAt: true,
    },
  });

  const gradedSessions = sessions.filter((s) => s.graded);
  const avgScore =
    gradedSessions.length > 0
      ? Math.round(
          gradedSessions.reduce((sum, s) => sum + s.score, 0) /
            gradedSessions.length
        )
      : null;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center gap-3 mb-1">
          <History className="h-6 w-6 lg:h-7 lg:w-7 text-brand-600 dark:text-brand-400" />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Practice history
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 lg:text-base ml-9">
          {sessions.length === 0
            ? `You haven't completed any ${shortName} practice sessions yet.`
            : `${sessions.length} ${shortName} ${sessions.length === 1 ? "session" : "sessions"} completed.`}
        </p>
      </div>

      {sessions.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6 lg:mb-8">
          <StatCard
            icon={Trophy}
            label="Average score"
            value={avgScore === null ? "—" : `${avgScore}%`}
            sub={
              gradedSessions.length > 0
                ? `${gradedSessions.length} graded`
                : "no graded sessions yet"
            }
          />
          <StatCard
            icon={Clock}
            label="Total sessions"
            value={sessions.length.toString()}
            sub={`Last ${sessions.length === 1 ? "session" : "50 sessions"}`}
          />
        </div>
      )}

      {sessions.length === 0 ? (
        <EmptyState curriculum={curriculum} subject={subject} />
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <SessionRow key={s.id} session={s} curriculum={curriculum} subject={subject} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
      <Icon className="h-5 w-5 text-brand-500 mb-3" />
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>
    </div>
  );
}

function formatDate(d: Date): string {
  return d.toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number | null): string | null {
  if (seconds === null || seconds === 0) return null;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining === 0 ? `${hours}h` : `${hours}h ${remaining}m`;
}

function SessionRow({
  session,
  curriculum,
  subject,
}: {
  session: {
    id: string;
    mode: string;
    totalQuestions: number;
    correctCount: number;
    score: number;
    elapsedSeconds: number | null;
    graded: boolean;
    completedAt: Date;
  };
  curriculum: string;
  subject: string;
}) {
  const duration = formatDuration(session.elapsedSeconds);

  // Score badge — only meaningful for graded sessions.
  const scoreColor = !session.graded
    ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
    : session.score >= 80
      ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
      : session.score >= 50
        ? "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
        : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300";

  return (
    <Link
      href={`/${curriculum}/${subject}/history/${session.id}`}
      className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-4 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{session.mode}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {formatDate(session.completedAt)}
          {duration && <> · {duration}</>}
          {" · "}
          {session.totalQuestions} {session.totalQuestions === 1 ? "question" : "questions"}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
            scoreColor
          )}
        >
          {session.graded ? `${Math.round(session.score)}%` : "Ungraded"}
        </span>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </div>
    </Link>
  );
}

function EmptyState({
  curriculum,
  subject,
}: {
  curriculum: string;
  subject: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 mb-4">
        <History className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        No practice sessions yet
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-5 max-w-sm mx-auto">
        Once you complete a practice session from the Practice page, it'll show up here
        with your score, time, and a link back to review every question.
      </p>
      <Link
        href={`/${curriculum}/${subject}/practice`}
        className="inline-flex items-center rounded-xl bg-brand-600 text-white px-4 py-2 text-sm font-semibold hover:bg-brand-700 transition-colors"
      >
        Start a practice session
      </Link>
    </div>
  );
}
