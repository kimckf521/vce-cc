"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import MathContent from "@/components/MathContent";

const INITIAL_SHOW = 5;

interface ExamAttempt {
  id: string;
  questionId: string;
  status: string;
  year: number;
  examType: string;
  questionNumber: number;
  part: string | null;
  topicName: string;
  marks: number;
}

interface SetAttempt {
  id: string;
  questionSetItemId: string;
  status: string;
  content: string;
  topicName: string;
  topicSlug: string;
  marks: number;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "shrink-0 text-xs font-medium px-2 py-0.5 rounded-full",
        status === "CORRECT"
          ? "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
          : status === "INCORRECT"
            ? "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400"
            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
      )}
    >
      {status === "CORRECT"
        ? "Correct"
        : status === "INCORRECT"
          ? "Incorrect"
          : "Review"}
    </span>
  );
}

export default function BookmarkedSection({
  examAttempts,
  setAttempts,
}: {
  examAttempts: ExamAttempt[];
  setAttempts: SetAttempt[];
}) {
  const total = examAttempts.length + setAttempts.length;
  const [expanded, setExpanded] = useState(false);
  const limit = expanded ? total : INITIAL_SHOW;

  // Merge into a single ordered list: exam attempts first, then set attempts
  const allItems: { type: "exam"; data: ExamAttempt }[] | { type: "set"; data: SetAttempt }[] = [];
  for (const a of examAttempts) (allItems as any[]).push({ type: "exam", data: a });
  for (const a of setAttempts) (allItems as any[]).push({ type: "set", data: a });
  const visible = allItems.slice(0, limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          Bookmarked Questions
          <span className="ml-2 text-xs font-normal normal-case tracking-normal text-gray-400 dark:text-gray-500">
            ({total})
          </span>
        </h2>
      </div>
      <div className="space-y-2">
        {visible.map((item: any) => {
          if (item.type === "exam") {
            const a = item.data as ExamAttempt;
            const examLabel =
              a.examType === "EXAM_1" ? "Exam 1" : "Exam 2";
            const qLabel = `Q${a.questionNumber}${a.part ?? ""}`;
            return (
              <Link
                key={a.id}
                href={`/questions/${a.questionId}?from=history`}
                className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-4 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-10 w-10 shrink-0 rounded-xl bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400">
                    <Bookmark className="h-4 w-4 fill-current" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {a.year} {examLabel} · {qLabel}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {a.topicName} · {a.marks} mark
                      {a.marks !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </Link>
            );
          } else {
            const a = item.data as SetAttempt;
            return (
              <Link
                key={a.id}
                href={`/questions/set/${a.questionSetItemId}`}
                className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-4 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
                  <div className="flex items-center justify-center h-10 w-10 shrink-0 rounded-xl bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400">
                    <Bookmark className="h-4 w-4 fill-current" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1 [&_.prose]:text-sm [&_.prose]:text-inherit [&_.katex]:text-sm [&_.katex-display]:text-sm [&_p]:mb-0 [&_.prose]:inline">
                      <MathContent content={a.content} />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {a.topicName} · {a.marks} mark
                      {a.marks !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </Link>
            );
          }
        })}
      </div>

      {total > INITIAL_SHOW && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show all {total} bookmarks
            </>
          )}
        </button>
      )}
    </div>
  );
}
