import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle, XCircle, MinusCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import MathContent from "@/components/MathContent";
import EditableMarksBadge from "@/components/EditableMarksBadge";
import EditablePartMark from "@/components/EditablePartMark";
import { splitExtendedResponse, type ParsedExtendedResponse } from "@/lib/extended-response-parser";

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
              preamble: true,
              parts: true,
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
  const sectionA = session.questions.filter((q) => q.section !== "B") as unknown as SessionQuestion[];
  const sectionB = session.questions.filter((q) => q.section === "B") as unknown as SessionQuestion[];

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
      {(() => {
        const totalMaxMarks = session.questions.reduce(
          (sum, q) => sum + q.questionSetItem.marks,
          0
        );
        const pct = session.graded ? session.score : null;
        // Blend manual per-question marks with session-derived estimates
        // so the Exact total updates live as the student marks parts.
        const totalEffectiveMarks = session.questions.reduce((sum, q) => {
          if (q.marksEarned !== null) return sum + q.marksEarned;
          if (pct !== null)
            return sum + Math.round((pct / 100) * q.questionSetItem.marks);
          return sum;
        }, 0);
        const hasAnyPerQuestionMarks = session.questions.some(
          (q) => q.marksEarned !== null
        );
        const hasAnySignal = hasAnyPerQuestionMarks || session.graded;
        const exactLabel = hasAnySignal
          ? `${totalEffectiveMarks}/${totalMaxMarks}`
          : `— / ${totalMaxMarks}`;
        const scoreLabel = hasAnySignal
          ? `${Math.round((totalEffectiveMarks / totalMaxMarks) * 100)}%`
          : "—";
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Questions" value={String(session.totalQuestions)} />
            <StatCard label="Score" value={scoreLabel} />
            <StatCard label="Exact" value={exactLabel} />
            <StatCard
              label="Time"
              value={
                session.elapsedSeconds
                  ? formatElapsed(session.elapsedSeconds)
                  : "—"
              }
              icon={<Clock className="h-4 w-4" />}
            />
          </div>
        );
      })()}

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
            sessionId={session.id}
            sessionPercent={session.graded ? session.score : null}
          />
          <Section
            title={`Section B — Extended Response (${sectionB.length})`}
            items={sectionB}
            sessionId={session.id}
            sessionPercent={session.graded ? session.score : null}
          />
        </>
      ) : (
        <Section
          title="Questions"
          items={sectionA}
          sessionId={session.id}
          sessionPercent={session.graded ? session.score : null}
        />
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

type PartJson = {
  label: string;
  marks: number;
  content: string;
  solution: string | null;
  subParts?: {
    label: string;
    marks: number;
    content: string;
    solution: string | null;
  }[];
};

/**
 * Build a single labelled solution string for a multi-part item by walking
 * the `parts` JSON and joining each leaf's solution under a heading like
 * `**(a)**` or `**(a.i)**`. Falls back to the top-level `solutionContent`
 * for single-part items, and returns null when neither source has any
 * usable solution text. Used by the history page's per-question card so
 * EXTENDED_ANSWER / EXTENDED_RESPONSE items show their worked solutions
 * (which the picker stores per sub-part, not at the row level).
 */
function combineSolutions(
  partsJson: PartJson[] | null,
  fallback: string | null | undefined
): string | null {
  if (Array.isArray(partsJson) && partsJson.length > 0) {
    const blocks: string[] = [];
    for (const p of partsJson) {
      const sub = Array.isArray(p.subParts) ? p.subParts : null;
      if (sub && sub.length > 0) {
        for (const sp of sub) {
          if (sp.solution && sp.solution.trim().length > 0) {
            blocks.push(`**(${p.label}.${sp.label})**\n\n${sp.solution.trim()}`);
          }
        }
      } else if (p.solution && p.solution.trim().length > 0) {
        blocks.push(`**(${p.label})**\n\n${p.solution.trim()}`);
      }
    }
    if (blocks.length > 0) return blocks.join("\n\n");
  }
  if (fallback && fallback.trim().length > 0) return fallback;
  return null;
}

type SessionQuestion = {
  id: string;
  order: number;
  groupIndex: number | null;
  section: string | null;
  selectedOption: string | null;
  correct: boolean | null;
  marksEarned: number | null;
  subPartMarks: Record<string, number | null> | null;
  questionSetItem: {
    id: string;
    type: "MCQ" | "SHORT_ANSWER" | "EXTENDED_ANSWER" | "EXTENDED_RESPONSE";
    marks: number;
    content: string;
    preamble: string | null;
    parts: PartJson[] | null;
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

function Section({
  title,
  items,
  sessionId,
  sessionPercent,
}: {
  title: string;
  items: SessionQuestion[];
  sessionId: string;
  sessionPercent: number | null;
}) {
  // Group items by `groupIndex` when set (Exam 1 compounds multiple
  // source items into one visible question). If none of the items have
  // a groupIndex, fall back to a flat per-item render (legacy sessions
  // and non-compound modes).
  const hasGroups = items.some((q) => q.groupIndex !== null);
  const grouped: SessionQuestion[][] = [];
  if (hasGroups) {
    const byGroup = new Map<number, SessionQuestion[]>();
    for (const q of items) {
      const key = q.groupIndex ?? -1;
      const list = byGroup.get(key) ?? [];
      list.push(q);
      byGroup.set(key, list);
    }
    // Preserve original order within groups; groups ordered by key
    const keys = Array.from(byGroup.keys()).sort((a, b) => a - b);
    for (const k of keys) grouped.push(byGroup.get(k)!);
  } else {
    for (const q of items) grouped.push([q]);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
        {title}
      </h2>
      <div className="space-y-4">
        {grouped.map((entries, idx) =>
          entries.length === 1 ? (
            <QuestionReviewCard
              key={entries[0].id}
              index={idx + 1}
              entry={entries[0]}
              sessionId={sessionId}
              sessionPercent={sessionPercent}
            />
          ) : (
            <CompoundQuestionCard
              key={`group-${idx}`}
              index={idx + 1}
              entries={entries}
              sessionId={sessionId}
              sessionPercent={sessionPercent}
            />
          )
        )}
      </div>
    </div>
  );
}

// Renders a compound question (multiple source items bundled as one visible
// question, like Exam 1's 8–9 compound questions made of 14–16 items).
// Shows one header with the Q number + aggregate marks badge, then each
// source item as a labelled (a), (b), (c) part with its own editable marks.
function CompoundQuestionCard({
  index,
  entries,
  sessionId,
  sessionPercent,
}: {
  index: number;
  entries: SessionQuestion[];
  sessionId: string;
  sessionPercent: number | null;
}) {
  const partLabels = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const totalMarks = entries.reduce((sum, e) => sum + e.questionSetItem.marks, 0);
  // If the session was graded at the session level and this part has no
  // manually-entered mark, derive a proportional estimate from the overall
  // percentage so the user can see *something* rather than a dash.
  const deriveEstimate = (partMax: number, actual: number | null) => {
    if (actual !== null) return actual;
    if (sessionPercent === null) return null;
    return Math.round((sessionPercent / 100) * partMax);
  };
  // Effective marks per entry: manual value if set, otherwise the
  // session-derived estimate. Summing these gives the live compound total
  // that updates when the student overrides any single part.
  const effectiveEarned = entries.reduce((sum, e) => {
    const actual = e.marksEarned;
    const eff = actual ?? deriveEstimate(e.questionSetItem.marks, null);
    return sum + (eff ?? 0);
  }, 0);
  const allMarked = entries.every((e) => e.marksEarned !== null);
  const hasAnyMarks = entries.some((e) => e.marksEarned !== null);
  const anyEstimateExists = !allMarked && sessionPercent !== null;
  // Null only when there's no manual mark AND no session estimate.
  const displayEarned =
    hasAnyMarks || anyEstimateExists ? effectiveEarned : null;
  const isEstimated = !allMarked && displayEarned !== null;
  const tone =
    displayEarned === null
      ? "bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400"
      : displayEarned === totalMarks
        ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400"
        : displayEarned === 0
          ? "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400"
          : "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400";

  // Topic/subtopic summary — use the first entry's topic/subtopics
  const firstIt = entries[0].questionSetItem;

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
            Q{index}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {firstIt.topic.name}
          </span>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            tone,
            isEstimated && "italic opacity-80"
          )}
          title={isEstimated ? "Estimated from the session score" : undefined}
        >
          {displayEarned !== null
            ? `${displayEarned}/${totalMarks}`
            : `— / ${totalMarks}`}{" "}
          marks
        </span>
      </div>
      <div className="p-5 divide-y divide-dashed divide-gray-200 dark:divide-gray-700">
        {entries.map((entry, i) => (
          <div key={entry.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                ({partLabels[i] ?? i + 1})
              </span>
              <EditableMarksBadge
                sessionId={sessionId}
                questionId={entry.id}
                initialMarksEarned={deriveEstimate(
                  entry.questionSetItem.marks,
                  entry.marksEarned
                )}
                totalMarks={entry.questionSetItem.marks}
                isEstimated={entry.marksEarned === null && sessionPercent !== null}
              />
            </div>
            <MathContent content={entry.questionSetItem.content} />
            {(() => {
              const partsJson = Array.isArray(entry.questionSetItem.parts)
                ? (entry.questionSetItem.parts as PartJson[])
                : null;
              const combined = combineSolutions(
                partsJson,
                entry.questionSetItem.solutionContent
              );
              if (!combined) return null;
              return (
                <details className="mt-2 group rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                  <summary className="cursor-pointer select-none px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 rounded-xl">
                    Show solution
                  </summary>
                  <div className="px-4 pb-3 pt-1 text-sm text-gray-700 dark:text-gray-300">
                    <MathContent content={combined} />
                  </div>
                </details>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}

function QuestionReviewCard({
  index,
  entry,
  sessionId,
  sessionPercent,
}: {
  index: number;
  entry: SessionQuestion;
  sessionId: string;
  sessionPercent: number | null;
}) {
  const it = entry.questionSetItem;
  const isMcq = it.type === "MCQ";
  const options = [
    { letter: "A", text: it.optionA },
    { letter: "B", text: it.optionB },
    { letter: "C", text: it.optionC },
    { letter: "D", text: it.optionD },
  ].filter((o) => o.text != null);

  // Multi-part rendering. Prefer the structured `parts` JSON (used by
  // EXTENDED_ANSWER and EXTENDED_RESPONSE items where content is empty).
  // Fall back to parsing **a.**/**b.** markers in `content` for legacy
  // SHORT_ANSWER items.
  const partsJson = Array.isArray(it.parts) ? (it.parts as PartJson[]) : null;
  const split =
    !isMcq && (!partsJson || partsJson.length === 0)
      ? splitExtendedResponse(it.content, it.solutionContent, it.marks)
      : null;
  const hasJsonParts = !!(partsJson && partsJson.length > 0);
  const hasSubParts =
    hasJsonParts ||
    !!(split && split.parts.length > 1 && split.parts.every((p) => p.part));

  // Marks earned: prefer the manually-entered value; otherwise derive
  // from MCQ auto-grading (full marks / 0 / null for unanswered). If
  // nothing's set but the session was session-graded, estimate
  // proportionally from the session percentage.
  const derivedFromMcq =
    entry.correct === true
      ? it.marks
      : entry.correct === false
        ? 0
        : null;
  const explicitMarks = entry.marksEarned ?? derivedFromMcq;
  const estimatedFromSession =
    explicitMarks === null && sessionPercent !== null
      ? Math.round((sessionPercent / 100) * it.marks)
      : null;
  const displayMarksEarned = explicitMarks ?? estimatedFromSession;
  const isEstimated = explicitMarks === null && estimatedFromSession !== null;
  const subPartMarks = entry.subPartMarks ?? {};

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
          <EditableMarksBadge
            sessionId={sessionId}
            questionId={entry.id}
            initialMarksEarned={displayMarksEarned}
            totalMarks={it.marks}
            readOnly={isMcq || hasSubParts}
            isEstimated={isEstimated}
          />
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {hasJsonParts && partsJson ? (
          <JsonPartsBody
            preamble={it.preamble}
            parts={partsJson}
            sessionId={sessionId}
            questionId={entry.id}
            subPartMarks={subPartMarks}
            sessionPercent={sessionPercent}
          />
        ) : hasSubParts && split ? (
          <MultiPartBody
            split={split}
            sessionId={sessionId}
            questionId={entry.id}
            subPartMarks={subPartMarks}
            sessionPercent={sessionPercent}
          />
        ) : (
          <MathContent content={it.content} />
        )}

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

        {/* Solution. Single-part items keep their solution in the top-level
            `solutionContent` column; multi-part items (EXTENDED_ANSWER /
            EXTENDED_RESPONSE) store one solution per leaf inside the `parts`
            JSON. Stitch the latter into a labelled block so the toggle
            shows every sub-part's worked solution. */}
        {(() => {
          const combined = combineSolutions(partsJson, it.solutionContent);
          if (!combined) return null;
          return (
            <details className="group rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 rounded-xl">
                Show solution
              </summary>
              <div className="px-4 pb-4 pt-1 text-sm text-gray-700 dark:text-gray-300">
                <MathContent content={combined} />
              </div>
            </details>
          );
        })()}
      </div>
    </div>
  );
}

// Renders an EXTENDED_ANSWER / EXTENDED_RESPONSE item from its native
// `parts` JSON. Each top-level part (a, b, c) is one row with its own
// editable mark badge; if a part has subParts (i, ii, ...) those become
// nested rows, each with their own marks. Mark keys are flat strings
// like "a", "a.i", "b" so they line up with the saved `subPartMarks`
// JSON map.
function JsonPartsBody({
  preamble,
  parts,
  sessionId,
  questionId,
  subPartMarks,
  sessionPercent,
}: {
  preamble: string | null;
  parts: PartJson[];
  sessionId: string;
  questionId: string;
  subPartMarks: Record<string, number | null>;
  sessionPercent: number | null;
}) {
  // Flatten to (key, marks) pairs we can mark — sub-parts replace their
  // parent when present.
  type Leaf = { key: string; label: string; marks: number; content: string };
  const leaves: Leaf[] = [];
  for (const p of parts) {
    if (Array.isArray(p.subParts) && p.subParts.length > 0) {
      for (const sp of p.subParts) {
        leaves.push({
          key: `${p.label}.${sp.label}`,
          label: `${p.label}.${sp.label}`,
          marks: sp.marks,
          content: sp.content,
        });
      }
    } else {
      leaves.push({
        key: p.label,
        label: p.label,
        marks: p.marks,
        content: p.content,
      });
    }
  }

  const fullMap: Record<string, number | null> = {};
  for (const l of leaves) fullMap[l.key] = subPartMarks[l.key] ?? null;

  return (
    <div className="space-y-4">
      {preamble && <MathContent content={preamble} />}
      <div className="divide-y divide-dashed divide-gray-200 dark:divide-gray-700">
        {leaves.map((l) => {
          const actual = subPartMarks[l.key] ?? null;
          const estimated =
            actual === null && sessionPercent !== null
              ? Math.round((sessionPercent / 100) * l.marks)
              : null;
          return (
            <div key={l.key} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  ({l.label})
                </span>
                <EditablePartMark
                  sessionId={sessionId}
                  questionId={questionId}
                  partKey={l.key}
                  initialEarned={actual ?? estimated}
                  totalMarks={l.marks}
                  initialSubPartMarks={fullMap}
                  isEstimated={actual === null && estimated !== null}
                />
              </div>
              <MathContent content={l.content} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Renders a multi-part question (EXTENDED_RESPONSE or SHORT_ANSWER with
// "a."/"b." markdown markers) as preamble + per-part rows. Each part
// carries its own editable marks badge so the student can self-mark
// each sub-part.
function MultiPartBody({
  split,
  sessionId,
  questionId,
  subPartMarks,
  sessionPercent,
}: {
  split: ParsedExtendedResponse;
  sessionId: string;
  questionId: string;
  subPartMarks: Record<string, number | null>;
  sessionPercent: number | null;
}) {
  // Build the full map so we send every key on update (not just the one
  // being edited).
  const fullMap: Record<string, number | null> = {};
  for (const p of split.parts) {
    fullMap[p.part] = subPartMarks[p.part] ?? null;
  }

  return (
    <div className="space-y-4">
      {split.preamble && <MathContent content={split.preamble} />}
      <div className="divide-y divide-dashed divide-gray-200 dark:divide-gray-700">
        {split.parts.map((p) => {
          const actual = subPartMarks[p.part] ?? null;
          const estimated =
            actual === null && sessionPercent !== null
              ? Math.round((sessionPercent / 100) * p.marks)
              : null;
          return (
            <div key={p.part} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  ({p.part})
                </span>
                <EditablePartMark
                  sessionId={sessionId}
                  questionId={questionId}
                  partKey={p.part}
                  initialEarned={actual ?? estimated}
                  totalMarks={p.marks}
                  initialSubPartMarks={fullMap}
                  isEstimated={actual === null && estimated !== null}
                />
              </div>
              <MathContent content={p.content} />
            </div>
          );
        })}
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
