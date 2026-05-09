import Link from "next/link";
import { PenLine, CheckSquare, FileText, LayoutGrid, Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  getPracticeQuestionSetId,
  approvedItemsFilter,
} from "@/lib/question-set-groups";
import { TOPICS } from "@/lib/topics-config";
import { canAccessPaidPractice } from "@/lib/practice-gate";

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
  const [counts, hasPaid] = await Promise.all([
    loadCounts(),
    canAccessPaidPractice(),
  ]);
  const locked = !hasPaid;

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Practice mode</h1>
      <p className="text-gray-500 dark:text-gray-400 lg:text-base mb-8">
        Choose a practice format and configure your session.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
        {/* Exam 1 Practice — free for everyone */}
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

        {/* Exam 2A Practice — paid */}
        <PracticeCard
          href={locked ? "/pricing" : "/practice/exam2a"}
          locked={locked}
          accent="sky"
          icon={<CheckSquare className="h-6 w-6 lg:h-7 lg:w-7 text-sky-600 dark:text-sky-400" />}
          chip="CAS · MCQ"
          title="Exam 2A practice"
          description="Multiple-choice questions with a CAS calculator. 20 questions in exam format."
          counts={counts.exam2a}
        />

        {/* Exam 2B Practice — paid */}
        <PracticeCard
          href={locked ? "/pricing" : "/practice/exam2b"}
          locked={locked}
          accent="amber"
          icon={<FileText className="h-6 w-6 lg:h-7 lg:w-7 text-amber-600 dark:text-amber-400" />}
          chip="CAS · Extended"
          title="Exam 2B practice"
          description="Extended-response questions with a CAS calculator. Multi-part problem-solving."
          counts={counts.exam2b}
        />

        {/* Exam 2A & 2B Practice — paid */}
        <PracticeCard
          href={locked ? "/pricing" : "/practice/exam2ab"}
          locked={locked}
          accent="emerald"
          icon={<LayoutGrid className="h-6 w-6 lg:h-7 lg:w-7 text-emerald-600 dark:text-emerald-400" />}
          chip="Full exam 2"
          title="Exam 2A & 2B practice"
          description="Complete Exam 2 experience — 20 MCQs followed by 4–5 extended-response questions."
          counts={counts.exam2ab}
        />
      </div>
    </div>
  );
}

// Tailwind needs every class string to be present at build time, so we pre-define
// each accent's full class set rather than interpolating colour names at runtime.
const ACCENT_CLASSES = {
  sky: {
    border: "border-sky-200 dark:border-sky-800",
    bg: "bg-sky-50 dark:bg-sky-950 hover:bg-sky-100 dark:hover:bg-sky-900",
    iconBg: "bg-sky-100 dark:bg-sky-900",
    chip: "bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-400",
    cta: "text-sky-700 dark:text-sky-400",
  },
  amber: {
    border: "border-amber-200 dark:border-amber-800",
    bg: "bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900",
    iconBg: "bg-amber-100 dark:bg-amber-900",
    chip: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400",
    cta: "text-amber-700 dark:text-amber-400",
  },
  emerald: {
    border: "border-emerald-200 dark:border-emerald-800",
    bg: "bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900",
    iconBg: "bg-emerald-100 dark:bg-emerald-900",
    chip: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400",
    cta: "text-emerald-700 dark:text-emerald-400",
  },
} as const;

type AccentKey = keyof typeof ACCENT_CLASSES;

function PracticeCard({
  href,
  locked,
  accent,
  icon,
  chip,
  title,
  description,
  counts,
}: {
  href: string;
  locked: boolean;
  accent: AccentKey;
  icon: React.ReactNode;
  chip: string;
  title: string;
  description: string;
  counts: TopicCount[];
}) {
  const c = ACCENT_CLASSES[accent];
  return (
    <div className="group relative">
      <Link
        href={href}
        className={`block rounded-2xl border ${c.border} ${c.bg} p-6 lg:p-8 transition-all hover:shadow-md ${locked ? "opacity-40" : ""}`}
      >
        <div className="flex flex-col gap-4 lg:gap-5">
          <div className="flex items-center justify-between">
            <div className={`rounded-xl ${c.iconBg} p-3 lg:p-4`}>{icon}</div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full ${c.chip} px-3 py-1 text-xs lg:text-sm font-semibold`}>
                {chip}
              </span>
              {locked && (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900/80 dark:bg-gray-700 text-white shrink-0">
                  <Lock className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 lg:mb-2">{title}</div>
            <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
              {description}
            </p>
          </div>
          <CountSummary counts={counts} />
          <div className={`text-sm lg:text-base font-semibold ${c.cta} group-hover:translate-x-0.5 transition-transform`}>
            {locked ? "See plans →" : "Configure and start →"}
          </div>
        </div>
      </Link>

      {locked && (
        <div className="pointer-events-none absolute bottom-full left-0 mb-2 z-10 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-150 w-60 lg:w-72">
          <div className="rounded-lg bg-gray-900 text-white text-xs lg:text-sm px-3 py-2.5 shadow-lg">
            <p className="font-semibold mb-1">{title}</p>
            <p className="text-gray-300 dark:text-gray-400 leading-relaxed">Standard plan required</p>
            <div className="absolute top-full left-6 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
}
