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
  { value: "EASY", label: "Easy", active: "bg-green-100 text-green-700 border-green-200" },
  { value: "MEDIUM", label: "Medium", active: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "HARD", label: "Hard", active: "bg-red-100 text-red-700 border-red-200" },
] as const;

const FREQUENCY_OPTIONS = [
  { value: "often", label: "Every year" },
  { value: "normal", label: "Most years" },
  { value: "rare", label: "Rare" },
] as const;

export default function TopicFilters({ slug, subtopics }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSubtopic = searchParams.get("subtopic") ?? "";
  const currentExams = (searchParams.get("exam") ?? "").split(",").filter(Boolean);
  const currentDifficulties = (searchParams.get("difficulty") ?? "").split(",").filter(Boolean);
  const currentFrequencies = (searchParams.get("frequency") ?? "").split(",").filter(Boolean);

  const hasFilters =
    currentSubtopic || currentExams.length > 0 || currentDifficulties.length > 0 || currentFrequencies.length > 0;

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
    <div className="flex flex-nowrap overflow-x-auto items-center gap-x-4 lg:gap-x-5 rounded-2xl border border-gray-100 bg-white px-4 lg:px-5 py-3 lg:py-3.5 shadow-sm mb-6 scrollbar-hide">

      {/* ── Subtopic dropdown ─────────────────────────────────── */}
      {subtopics.length > 0 && (
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
            Subtopic
          </span>
          <select
            value={currentSubtopic}
            onChange={(e) =>
              router.push(buildUrl({ subtopic: e.target.value || null }))
            }
            className="rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-3 pr-7 text-sm lg:text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
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

      <div className="h-5 w-px bg-gray-200 shrink-0" />

      {/* ── Exam pills ────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
          Exam
        </span>
        {EXAM_OPTIONS.map(({ value, label }) => {
          const active = currentExams.includes(value);
          return (
            <button
              key={value}
              onClick={() => toggleMulti("exam", currentExams, value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs lg:text-sm font-medium transition-colors whitespace-nowrap",
                active
                  ? "border-brand-300 bg-brand-100 text-brand-700"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="h-5 w-px bg-gray-200 shrink-0" />

      {/* ── Difficulty pills ──────────────────────────────────── */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
          Difficulty
        </span>
        {DIFFICULTY_OPTIONS.map(({ value, label, active: activeStyle }) => {
          const active = currentDifficulties.includes(value);
          return (
            <button
              key={value}
              onClick={() => toggleMulti("difficulty", currentDifficulties, value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs lg:text-sm font-medium transition-colors whitespace-nowrap",
                active
                  ? `border ${activeStyle}`
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="h-5 w-px bg-gray-200 shrink-0" />

      {/* ── Frequency pills ───────────────────────────────────── */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
          Frequency
        </span>
        {FREQUENCY_OPTIONS.map(({ value, label }) => {
          const active = currentFrequencies.includes(value);
          return (
            <button
              key={value}
              onClick={() => toggleMulti("frequency", currentFrequencies, value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs lg:text-sm font-medium transition-colors whitespace-nowrap",
                active
                  ? "border-brand-300 bg-brand-100 text-brand-700"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Clear all ─────────────────────────────────────────── */}
      {hasFilters && (
        <>
          <div className="h-5 w-px bg-gray-200 shrink-0" />
          <Link
            href={`/topics/${slug}`}
            className="text-xs lg:text-sm font-medium text-brand-600 hover:underline whitespace-nowrap shrink-0"
          >
            Clear all
          </Link>
        </>
      )}
    </div>
  );
}
