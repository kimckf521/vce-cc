"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUBJECTS, type SubjectSlug } from "@/lib/subject-context";
import DifficultyDistributionControl, {
  type DiffDist,
} from "@/components/DifficultyDistributionControl";
import type { AssessmentDetail } from "@/lib/teacher-assessments";

export type SubjectTopicsMap = Record<
  string,
  { id: string; name: string; slug: string }[]
>;

type StylePreset = "exam1" | "exam2" | "custom";
type TechChoice = "TECH_FREE" | "ANY";

// Exam-style presets mirror the real VCE paper structure: Exam 1 is the
// shorter tech-free paper, Exam 2 the longer CAS-allowed one. Picking a
// preset seeds tech + target marks; every field stays editable afterwards.
const PRESETS: {
  key: StylePreset;
  label: string;
  description: string;
  tech: TechChoice | null;
  targetMarks: number | null;
}[] = [
  {
    key: "exam1",
    label: "Exam 1 style (tech-free)",
    description: "No CAS or notes — 40 marks by default.",
    tech: "TECH_FREE",
    targetMarks: 40,
  },
  {
    key: "exam2",
    label: "Exam 2 style (CAS)",
    description: "Technology allowed — 60 marks by default.",
    tech: "ANY",
    targetMarks: 60,
  },
  {
    key: "custom",
    label: "Custom",
    description: "Set your own tech rule and mark target.",
    tech: null,
    targetMarks: null,
  },
];

const DEFAULT_DIFFICULTY: DiffDist = [30, 50, 20];

export default function NewAssessmentForm({
  topicsBySubject,
  defaultTitle,
}: {
  topicsBySubject: SubjectTopicsMap;
  defaultTitle: string;
}) {
  const router = useRouter();

  const [subjectSlug, setSubjectSlug] = useState<SubjectSlug>("methods");
  const [title, setTitle] = useState(defaultTitle);
  const [preset, setPreset] = useState<StylePreset>("exam1");
  const [customTech, setCustomTech] = useState<TechChoice>("ANY");
  // Default all topics selected; reset whenever the subject changes so the
  // selection always belongs to the current subject's topic list.
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(
    () => new Set((topicsBySubject["methods"] ?? []).map((t) => t.id))
  );
  const [difficulty, setDifficulty] = useState<DiffDist>(DEFAULT_DIFFICULTY);
  const [targetMarks, setTargetMarks] = useState(40);
  const [questionCount, setQuestionCount] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const topics = topicsBySubject[subjectSlug] ?? [];
  const presetMeta = PRESETS.find((p) => p.key === preset)!;
  const tech: TechChoice = presetMeta.tech ?? customTech;

  const difficultyTotal = difficulty[0] + difficulty[1] + difficulty[2];
  const parsedCount = questionCount.trim() === "" ? null : Number(questionCount);
  const countInvalid =
    parsedCount !== null &&
    (!Number.isInteger(parsedCount) || parsedCount < 1);

  const problems: string[] = [];
  if (!title.trim()) problems.push("give the paper a title");
  if (selectedTopicIds.size === 0) problems.push("pick at least one topic");
  if (difficultyTotal !== 100) problems.push("make the difficulty mix 100%");
  if (!Number.isInteger(targetMarks) || targetMarks < 1)
    problems.push("set target marks to a whole number of at least 1");
  if (countInvalid)
    problems.push("leave question count blank or use a whole number of at least 1");
  const canSubmit = problems.length === 0 && !submitting;

  function selectSubject(slug: SubjectSlug) {
    if (slug === subjectSlug) return;
    setSubjectSlug(slug);
    setSelectedTopicIds(new Set((topicsBySubject[slug] ?? []).map((t) => t.id)));
  }

  function selectPreset(key: StylePreset) {
    setPreset(key);
    const meta = PRESETS.find((p) => p.key === key)!;
    if (meta.targetMarks !== null) setTargetMarks(meta.targetMarks);
  }

  function toggleTopic(id: string) {
    setSelectedTopicIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/teacher/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectSlug,
          title: title.trim(),
          autoAssemble: true,
          settings: {
            topicIds: Array.from(selectedTopicIds),
            difficulty: {
              easy: difficulty[0],
              medium: difficulty[1],
              hard: difficulty[2],
            },
            tech,
            targetMarks,
            ...(parsedCount !== null ? { questionCount: parsedCount } : {}),
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.error || "We couldn't assemble your paper just now."
        );
      }
      const assessment: AssessmentDetail = data.assessment;
      router.push(`/teacher/assessments/${assessment.id}`);
      // Keep the in-flight state on while the redirect resolves.
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't assemble your paper just now."
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Subject picker */}
      <section>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 lg:text-lg mb-3">
          Subject
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SUBJECTS.filter((s) => s.available).map((s) => {
            const active = s.urlSlug === subjectSlug;
            return (
              <button
                key={s.urlSlug}
                type="button"
                onClick={() => selectSubject(s.urlSlug)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border p-3 text-left transition-colors",
                  active
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-950"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold flex-shrink-0",
                    s.colors.badge
                  )}
                >
                  {s.badge}
                </span>
                <span
                  className={cn(
                    "text-sm font-semibold truncate",
                    active
                      ? "text-brand-700 dark:text-brand-300"
                      : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  {s.shortName}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Title */}
      <section>
        <label
          htmlFor="assessment-title"
          className="block font-semibold text-gray-800 dark:text-gray-200 lg:text-lg mb-3"
        >
          Title
        </label>
        <input
          id="assessment-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-brand-500"
          placeholder="e.g. Calculus topic test — Term 3"
        />
      </section>

      {/* Style preset */}
      <section>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 lg:text-lg mb-3">
          Paper style
        </h3>
        <div className="space-y-2">
          {PRESETS.map((p) => {
            const active = preset === p.key;
            return (
              <label
                key={p.key}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors",
                  active
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-950"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <input
                  type="radio"
                  name="style-preset"
                  value={p.key}
                  checked={active}
                  onChange={() => selectPreset(p.key)}
                  className="mt-0.5 h-4 w-4 accent-brand-600"
                />
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-sm font-semibold",
                      active
                        ? "text-brand-700 dark:text-brand-300"
                        : "text-gray-800 dark:text-gray-200"
                    )}
                  >
                    {p.label}
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {p.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        {/* Custom preset exposes the tech rule directly */}
        {preset === "custom" && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Technology:
            </span>
            {(
              [
                { value: "TECH_FREE", label: "Tech-free" },
                { value: "ANY", label: "Any (CAS allowed)" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCustomTech(opt.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  customTech === opt.value
                    ? "bg-brand-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Topics */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 lg:text-lg">
            Topics
          </h3>
          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-full",
              selectedTopicIds.size > 0
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400"
            )}
          >
            {selectedTopicIds.size > 0
              ? `${selectedTopicIds.size} of ${topics.length}`
              : "pick at least one"}
          </span>
        </div>
        <div className="space-y-2">
          {topics.map((t) => {
            const checked = selectedTopicIds.has(t.id);
            return (
              <label
                key={t.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors",
                  checked
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-950"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleTopic(t.id)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-md border flex-shrink-0 transition-colors",
                    checked
                      ? "bg-brand-600 border-brand-600 text-white"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                >
                  {checked && <Check className="h-3.5 w-3.5" />}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    checked
                      ? "text-brand-700 dark:text-brand-300"
                      : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  {t.name}
                </span>
              </label>
            );
          })}
          {topics.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We don&apos;t have topics loaded for this subject yet.
            </p>
          )}
        </div>
      </section>

      {/* Difficulty mix */}
      <section>
        <DifficultyDistributionControl
          distribution={difficulty}
          onChange={setDifficulty}
          label="Difficulty mix"
        />
      </section>

      {/* Target marks + optional question count */}
      <section className="grid grid-cols-2 gap-3 lg:gap-4">
        <div>
          <label
            htmlFor="target-marks"
            className="block font-semibold text-gray-800 dark:text-gray-200 lg:text-lg mb-3"
          >
            Target marks
          </label>
          <input
            id="target-marks"
            type="number"
            min={1}
            max={200}
            value={targetMarks}
            onChange={(e) => setTargetMarks(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label
            htmlFor="question-count"
            className="block font-semibold text-gray-800 dark:text-gray-200 lg:text-lg mb-3"
          >
            Max questions{" "}
            <span className="text-xs font-normal text-gray-400 dark:text-gray-500">
              (optional)
            </span>
          </label>
          <input
            id="question-count"
            type="number"
            min={1}
            value={questionCount}
            onChange={(e) => setQuestionCount(e.target.value)}
            placeholder="Auto"
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-brand-500"
          />
          <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
            We may use fewer questions to land exactly on your target marks.
          </p>
        </div>
      </section>

      {/* Errors + submit */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error} Please try again — nothing has been saved.
        </div>
      )}

      <div className="pt-1 pb-4">
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-3 transition-colors"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Assembling your paper…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Assemble paper
            </>
          )}
        </button>
        {!submitting && problems.length > 0 && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            To continue, {problems.join(", ")}.
          </p>
        )}
      </div>
    </form>
  );
}
