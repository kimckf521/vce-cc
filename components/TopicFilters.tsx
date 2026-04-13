"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface SubtopicFilterInfo {
  id: string;
  name: string;
  slug: string;
  frequency: "rare" | "normal" | "often";
}

interface Props {
  slug: string;
  subtopics: SubtopicFilterInfo[];
}

const EXAM_OPTIONS = [
  { value: "EXAM_1", label: "Exam 1" },
  { value: "EXAM_2_MC", label: "Exam 2A" },
  { value: "EXAM_2_B", label: "Exam 2B" },
] as const;

const DIFFICULTY_OPTIONS = [
  { value: "EASY", label: "Easy", active: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800" },
  { value: "MEDIUM", label: "Medium", active: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" },
  { value: "HARD", label: "Hard", active: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800" },
] as const;

export default function TopicFilters({ slug, subtopics }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSubtopic = searchParams.get("subtopic") ?? "";
  const currentExams = (searchParams.get("exam") ?? "").split(",").filter(Boolean);
  const currentDifficulties = (searchParams.get("difficulty") ?? "").split(",").filter(Boolean);

  const hasFilters =
    currentSubtopic || currentExams.length > 0 || currentDifficulties.length > 0;

  function buildUrl(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function toggleMulti(param: string, current: string[], value: string) {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    router.push(buildUrl({ [param]: next.join(",") || null }));
  }

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm mb-6">
      {/* ── Mobile/Tablet: stacked layout ─────────────────────── */}
      <div className="lg:hidden">
        {/* Subtopic dropdown — full width */}
        {subtopics.length > 0 && (
          <div className="px-4 pt-3 pb-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">
              Subtopic
            </span>
            <select
              value={currentSubtopic}
              onChange={(e) =>
                router.push(buildUrl({ subtopic: e.target.value || null }))
              }
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2 pl-3 pr-7 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="">All subtopics</option>
              {subtopics.map((sub) => (
                <option key={sub.id} value={sub.slug}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Exam + Difficulty pills row */}
        <div className="px-4 pb-3 pt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Exam</span>
          {EXAM_OPTIONS.map(({ value, label }) => {
            const active = currentExams.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggleMulti("exam", currentExams, value)}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                  active
                    ? "border-brand-300 dark:border-brand-700 bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-400"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                )}
              >
                {label}
              </button>
            );
          })}

          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Difficulty</span>
          {DIFFICULTY_OPTIONS.map(({ value, label, active: activeStyle }) => {
            const active = currentDifficulties.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggleMulti("difficulty", currentDifficulties, value)}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                  active
                    ? `border ${activeStyle}`
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                )}
              >
                {label}
              </button>
            );
          })}

          {hasFilters && (
            <>
              <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
              <Link
                href={`/topics/${slug}`}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Clear all
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Desktop: single-row inline layout ─────────────────── */}
      <div className="hidden lg:flex flex-wrap items-center gap-x-5 gap-y-2.5 px-5 py-3.5">
        {subtopics.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 whitespace-nowrap">
              Subtopic
            </span>
            <select
              value={currentSubtopic}
              onChange={(e) =>
                router.push(buildUrl({ subtopic: e.target.value || null }))
              }
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-1.5 pl-3 pr-7 text-base text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="">All subtopics</option>
              {subtopics.map((sub) => (
                <option key={sub.id} value={sub.slug}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 whitespace-nowrap">
            Exam
          </span>
          {EXAM_OPTIONS.map(({ value, label }) => {
            const active = currentExams.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggleMulti("exam", currentExams, value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm font-medium transition-colors whitespace-nowrap",
                  active
                    ? "border-brand-300 dark:border-brand-700 bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-400"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 whitespace-nowrap">
            Difficulty
          </span>
          {DIFFICULTY_OPTIONS.map(({ value, label, active: activeStyle }) => {
            const active = currentDifficulties.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggleMulti("difficulty", currentDifficulties, value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm font-medium transition-colors whitespace-nowrap",
                  active
                    ? `border ${activeStyle}`
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {hasFilters && (
          <>
            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />
            <Link
              href={`/topics/${slug}`}
              className="text-sm font-medium text-brand-600 hover:underline whitespace-nowrap"
            >
              Clear all
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
