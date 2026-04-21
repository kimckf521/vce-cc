import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle, XCircle, MinusCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import MathContent from "@/components/MathContent";

interface PageProps {
  params: Promise<{ id: string }>;
}

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

export default async function HistoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="text-center text-gray-400 dark:text-gray-500 py-20">
        Please log in to view this session.
      </div>
    );
  }

  const session = await prisma.examSession.findFirst({
    where: { id, userId: user.id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          questionSetItem: {
            select: {
              id: true,
              type: true,
              marks: true,
              content: true,
              difficulty: true,
              optionA: true,
              optionB: true,
              optionC: true,
              optionD: true,
              correctOption: true,
              solutionContent: true,
              topic: { select: { name: true } },
              subtopics: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!session) notFound();

  const hasSectionB = session.questions.some((q) => q.section === "B");
  const sectionA = session.questions.filter((q) => q.section !== "B");
  const sectionB = session.questions.filter((q) => q.section === "B");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/history"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Link>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {session.mode}
          </h1>
          {!session.graded && (
            <span className="rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2.5 py-1 text-xs font-medium uppercase tracking-wide">
              Not marked yet
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(session.completedAt)}
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Questions" value={String(session.totalQuestions)} />
        <StatCard
          label="Score"
          value={session.graded ? `${Math.round(session.score)}%` : "—"}
        />
        <StatCard
          label="Correct"
          value={
            session.graded
              ? `${session.correctCount}/${session.totalQuestions}`
              : "—"
          }
        />
        <StatCard
          label="Time"
          value={session.elapsedSeconds ? formatElapsed(session.elapsedSeconds) : "—"}
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      {/* Questions */}
      {session.questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-10 text-center text-sm text-gray-500 dark:text-gray-400">
          No question details were recorded for this session.
        </div>
      ) : hasSectionB ? (
        <>
          <Section
            title={`Section A — Multiple Choice (${sectionA.length})`}
            items={sectionA}
          />
          <Section
            title={`Section B — Extended Response (${sectionB.length})`}
            items={sectionB}
          />
        </>
      ) : (
        <Section title="Questions" items={sectionA} />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>
    </div>
  );
}

type SessionQuestion = {
  id: string;
  order: number;
  section: string | null;
  selectedOption: string | null;
  correct: boolean | null;
  questionSetItem: {
    id: string;
    type: "MCQ" | "SHORT_ANSWER" | "EXTENDED_RESPONSE";
    marks: number;
    content: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    optionA: string | null;
    optionB: string | null;
    optionC: string | null;
    optionD: string | null;
    correctOption: string | null;
    solutionContent: string | null;
    topic: { name: string };
    subtopics: { name: string }[];
  };
};

function Section({ title, items }: { title: string; items: SessionQuestion[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
        {title}
      </h2>
      <div className="space-y-4">
        {items.map((q, idx) => (
          <QuestionReviewCard key={q.id} index={idx + 1} entry={q} />
        ))}
      </div>
    </div>
  );
}

function QuestionReviewCard({
  index,
  entry,
}: {
  index: number;
  entry: SessionQuestion;
}) {
  const it = entry.questionSetItem;
  const isMcq = it.type === "MCQ";
  const options = [
    { letter: "A", text: it.optionA },
    { letter: "B", text: it.optionB },
    { letter: "C", text: it.optionC },
    { letter: "D", text: it.optionD },
  ].filter((o) => o.text != null);

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      {/* Header strip */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
            Q{index}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {it.topic.name}
          </span>
          {it.subtopics.length > 0 && (
            <>
              <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {it.subtopics.map((s) => s.name).join(", ")}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
            {it.difficulty.toLowerCase()}
          </span>
          <span className="rounded-full bg-brand-50 dark:bg-brand-950 px-2 py-0.5 text-[10px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
            {it.marks} mark{it.marks !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        <MathContent content={it.content} />

        {isMcq && (
          <div className="space-y-2">
            {options.map(({ letter, text }) => {
              const isUserAnswer = entry.selectedOption === letter;
              const isCorrectAnswer = it.correctOption === letter;
              return (
                <div
                  key={letter}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border px-3 py-2",
                    isCorrectAnswer
                      ? "border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950"
                      : isUserAnswer
                        ? "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0 mt-0.5 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold",
                      isCorrectAnswer
                        ? "bg-green-200 dark:bg-green-900 text-green-700 dark:text-green-300"
                        : isUserAnswer
                          ? "bg-red-200 dark:bg-red-900 text-red-700 dark:text-red-300"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {letter}
                  </span>
                  <div className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                    <MathContent content={text ?? ""} />
                  </div>
                  {isUserAnswer && (
                    <span className="shrink-0 self-center text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Your answer
                    </span>
                  )}
                </div>
              );
            })}
            <AnswerSummary entry={entry} hasCorrectKey={!!it.correctOption} />
          </div>
        )}

        {/* Solution */}
        {it.solutionContent && (
          <details className="group rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 rounded-xl">
              Show solution
            </summary>
            <div className="px-4 pb-4 pt-1 text-sm text-gray-700 dark:text-gray-300">
              <MathContent content={it.solutionContent} />
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

function AnswerSummary({
  entry,
  hasCorrectKey,
}: {
  entry: SessionQuestion;
  hasCorrectKey: boolean;
}) {
  if (!hasCorrectKey) return null;

  if (entry.selectedOption == null) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <MinusCircle className="h-4 w-4" />
        Not answered
      </div>
    );
  }

  if (entry.correct === true) {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-green-700 dark:text-green-400">
        <CheckCircle className="h-4 w-4" />
        Correct
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs font-medium text-red-700 dark:text-red-400">
      <XCircle className="h-4 w-4" />
      Incorrect
    </div>
  );
}
