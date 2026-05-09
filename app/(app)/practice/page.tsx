import Link from "next/link";
import { PenLine, CheckSquare, FileText, LayoutGrid } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  getPracticeQuestionSetId,
  approvedItemsFilter,
} from "@/lib/question-set-groups";
import { TOPICS } from "@/lib/topics-config";

export const dynamic = "force-dynamic";

type ExamMode = "exam1" | "exam2a" | "exam2b" | "exam2ab";
type QSIType = "MCQ" | "SHORT_ANSWER" | "EXTENDED_ANSWER" | "EXTENDED_RESPONSE";

// Which underlying QuestionSetItem types feed each practice mode. Mirrors the
// itemTypes selection in app/(app)/practice/session/page.tsx so the counts on
// this landing page reflect what the picker will actually draw from.
const MODE_TYPES: Record<ExamMode, QSIType[]> = {
  exam1: ["SHORT_ANSWER", "EXTENDED_ANSWER"],
  exam2a: ["MCQ"],
  exam2b: ["EXTENDED_RESPONSE"],
  exam2ab: ["MCQ", "EXTENDED_RESPONSE"],
};

// Friendly short label for each VCE topic — the canonical names are too long
// for chip-style displays. "Algebra, Number, and Structure" → "Algebra" etc.
function shortTopicName(fullName: string): string {
  return fullName.split(",")[0].trim();
}

interface TopicCount {
  topicId: string;
  shortName: string;
  count: number;
}

/**
 * Pre-aggregates `(topicId × type) → count` from the default question set
 * once, then exposes per-mode lookups so each card renders without
 * duplicating queries. APPROVED-only — matches what the picker sees.
 */
async function loadCounts(): Promise<Record<ExamMode, TopicCount[]>> {
  const setId = await getPracticeQuestionSetId();
  const empty: Record<ExamMode, TopicCount[]> = {
    exam1: [],
    exam2a: [],
    exam2b: [],
    exam2ab: [],
  };
  if (!setId) return empty;

  const grouped = await prisma.questionSetItem.groupBy({
    by: ["topicId", "type"],
    where: approvedItemsFilter(setId),
    _count: true,
  });

  const lookup = new Map<string, number>(); // `${topicId}|${type}` → count
  for (const row of grouped) {
    lookup.set(`${row.topicId}|${row.type}`, row._count);
  }

  const result: Record<ExamMode, TopicCount[]> = {
    exam1: [],
    exam2a: [],
    exam2b: [],
    exam2ab: [],
  };
  for (const mode of Object.keys(MODE_TYPES) as ExamMode[]) {
    for (const t of TOPICS) {
      const count = MODE_TYPES[mode].reduce(
        (sum, type) => sum + (lookup.get(`${t.id}|${type}`) ?? 0),
        0
      );
      result[mode].push({
        topicId: t.id,
        shortName: shortTopicName(t.name),
        count,
      });
    }
  }
  return result;
}

function CountSummary({ counts }: { counts: TopicCount[] }) {
  const total = counts.reduce((s, c) => s + c.count, 0);
  return (
    <div className="space-y-1.5">
      <p className="text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-200">
        {total} {total === 1 ? "question" : "questions"} available
      </p>
      <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {counts
          .map((c) => `${c.shortName}: ${c.count}`)
          .join(" · ")}
      </p>
    </div>
  );
}

export default async function PracticePage() {
  const counts = await loadCounts();

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Practice mode</h1>
      <p className="text-gray-500 dark:text-gray-400 lg:text-base mb-8">
        Choose a practice format and configure your session.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
        {/* Exam 1 Practice */}
        <Link
          href="/practice/exam1"
          className="group rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950 hover:bg-violet-100 dark:hover:bg-violet-900 p-6 lg:p-8 flex flex-col gap-4 lg:gap-5 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-violet-100 dark:bg-violet-900 p-3 lg:p-4">
              <PenLine className="h-6 w-6 lg:h-7 lg:w-7 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-400 px-3 py-1 text-xs lg:text-sm font-semibold">
              No calculator
            </span>
          </div>
          <div>
            <div className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 lg:mb-2">Exam 1 practice</div>
            <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
              Short-answer questions without a CAS calculator. Mirrors the Exam 1 format.
            </p>
          </div>
          <CountSummary counts={counts.exam1} />
          <div className="text-sm lg:text-base font-semibold text-violet-700 dark:text-violet-400 group-hover:translate-x-0.5 transition-transform">Configure and start →</div>
        </Link>

        {/* Exam 2A Practice */}
        <Link
          href="/practice/exam2a"
          className="group rounded-2xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950 hover:bg-sky-100 dark:hover:bg-sky-900 p-6 lg:p-8 flex flex-col gap-4 lg:gap-5 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-sky-100 dark:bg-sky-900 p-3 lg:p-4">
              <CheckSquare className="h-6 w-6 lg:h-7 lg:w-7 text-sky-600 dark:text-sky-400" />
            </div>
            <span className="rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-400 px-3 py-1 text-xs lg:text-sm font-semibold">
              CAS · MCQ
            </span>
          </div>
          <div>
            <div className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 lg:mb-2">Exam 2A practice</div>
            <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
              Multiple-choice questions with a CAS calculator. 20 questions in exam format.
            </p>
          </div>
          <CountSummary counts={counts.exam2a} />
          <div className="text-sm lg:text-base font-semibold text-sky-700 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform">Configure and start →</div>
        </Link>

        {/* Exam 2B Practice */}
        <Link
          href="/practice/exam2b"
          className="group rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900 p-6 lg:p-8 flex flex-col gap-4 lg:gap-5 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-amber-100 dark:bg-amber-900 p-3 lg:p-4">
              <FileText className="h-6 w-6 lg:h-7 lg:w-7 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400 px-3 py-1 text-xs lg:text-sm font-semibold">
              CAS · Extended
            </span>
          </div>
          <div>
            <div className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 lg:mb-2">Exam 2B practice</div>
            <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
              Extended-response questions with a CAS calculator. Multi-part problem-solving.
            </p>
          </div>
          <CountSummary counts={counts.exam2b} />
          <div className="text-sm lg:text-base font-semibold text-amber-700 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">Configure and start →</div>
        </Link>

        {/* Exam 2A & 2B Practice */}
        <Link
          href="/practice/exam2ab"
          className="group rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 p-6 lg:p-8 flex flex-col gap-4 lg:gap-5 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-emerald-100 dark:bg-emerald-900 p-3 lg:p-4">
              <LayoutGrid className="h-6 w-6 lg:h-7 lg:w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs lg:text-sm font-semibold">
              Full exam 2
            </span>
          </div>
          <div>
            <div className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 lg:mb-2">Exam 2A &amp; 2B practice</div>
            <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
              Complete Exam 2 experience — 20 MCQs followed by 4–5 extended-response questions.
            </p>
          </div>
          <CountSummary counts={counts.exam2ab} />
          <div className="text-sm lg:text-base font-semibold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">Configure and start →</div>
        </Link>
      </div>
    </div>
  );
}
