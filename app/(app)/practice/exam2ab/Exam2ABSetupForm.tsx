"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import TopicDistributionControl, { type Topic } from "@/components/TopicDistributionControl";
import DifficultyDistributionControl, { type DiffDist } from "@/components/DifficultyDistributionControl";

interface Props {
  topics: Topic[];
}

export default function Exam2ABSetupForm({ topics }: Props) {
  const router = useRouter();
  const [distA, setDistA] = useState<number[]>([25, 25, 25, 25]);
  const [distB, setDistB] = useState<number[]>([25, 25, 25, 25]);
  const [diffDist, setDiffDist] = useState<DiffDist>([50, 30, 20]);
  const [showSolutions, setShowSolutions] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(true);

  const totalA = distA.reduce((a, b) => a + b, 0);
  const totalB = distB.reduce((a, b) => a + b, 0);
  const diffTotal = diffDist[0] + diffDist[1] + diffDist[2];
  const isValid = totalA === 100 && totalB === 100 && diffTotal === 100;

  function handleStart() {
    if (!isValid) return;
    const timerParam = timerEnabled ? "&timer=1" : "";
    const countB = Math.random() < 0.5 ? 4 : 5;
    const url = `/practice/session?mode=exam2ab&version=exam&countA=20&countB=${countB}&dist=${distA.join(",")}&distB=${distB.join(",")}&diff=${diffDist.join(",")}&solutions=${showSolutions ? "1" : "0"}${timerParam}`;
    router.push(url);
  }

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Back link */}
      <Link
        href="/practice"
        className="inline-flex items-center gap-1.5 text-sm lg:text-base font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
      >
        ← Practice
      </Link>

      {/* Heading */}
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Exam 2A &amp; 2B Practice</h1>

      {/* Info banner */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-5 lg:px-6 py-4 lg:py-5 text-sm lg:text-base text-gray-600 dark:text-gray-400 flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <svg className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span>
          20 multiple choice questions · 4–5 extended response questions · CAS Calculator allowed
        </span>
      </div>

      {/* Section A distribution */}
      <div className="space-y-3 lg:space-y-4">
        <h2 className="text-xs lg:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          Section A — Multiple Choice Distribution
        </h2>
        <TopicDistributionControl
          topics={topics}
          distribution={distA}
          onChange={setDistA}
        />
      </div>

      {/* Section B distribution */}
      <div className="space-y-3 lg:space-y-4">
        <h2 className="text-xs lg:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          Section B — Extended Response Distribution
        </h2>
        <TopicDistributionControl
          topics={topics}
          distribution={distB}
          onChange={setDistB}
        />
      </div>

      {/* Difficulty distribution */}
      <div className="space-y-3 lg:space-y-4">
        <h2 className="text-xs lg:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          Difficulty Distribution
        </h2>
        <DifficultyDistributionControl
          distribution={diffDist}
          onChange={setDiffDist}
        />
      </div>

      {/* Show solutions toggle */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 lg:px-6 py-4 lg:py-5">
        <div>
          <p className="text-sm lg:text-base font-semibold text-gray-800 dark:text-gray-200">Show solutions as I go</p>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Display a solution button on each question</p>
        </div>
        <button
          type="button"
          onClick={() => setShowSolutions((v) => !v)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
            showSolutions ? "bg-brand-600" : "bg-gray-200 dark:bg-gray-600"
          )}
        >
          <span className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200",
            showSolutions ? "translate-x-5" : "translate-x-0"
          )} />
        </button>
      </div>

      {/* Timer toggle */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 lg:px-6 py-4 lg:py-5">
        <div>
          <p className="text-sm lg:text-base font-semibold text-gray-800 dark:text-gray-200">Exam timer</p>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-0.5">15 min reading time + 2 hour writing time</p>
        </div>
        <button
          type="button"
          onClick={() => setTimerEnabled((v) => !v)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
            timerEnabled ? "bg-brand-600" : "bg-gray-200 dark:bg-gray-600"
          )}
        >
          <span className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200",
            timerEnabled ? "translate-x-5" : "translate-x-0"
          )} />
        </button>
      </div>

      {/* Validation errors */}
      {!isValid && (
        <p className="text-sm lg:text-base font-medium text-red-600 dark:text-red-400">
          All distributions must add up to 100% before you can start.
        </p>
      )}

      {/* Start button */}
      <button
        type="button"
        onClick={handleStart}
        disabled={!isValid}
        className={cn(
          "rounded-xl bg-brand-600 px-8 lg:px-10 py-3 lg:py-4 text-base lg:text-lg font-semibold text-white hover:bg-brand-700 transition-colors",
          !isValid && "opacity-50 cursor-not-allowed"
        )}
      >
        Start Practice →
      </button>
    </div>
  );
}
