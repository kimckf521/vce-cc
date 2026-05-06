"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  VCAA_TOPIC_DIST,
  VCAA_DIFFICULTY_DIST,
} from "@/lib/exam-config";
import { type Topic } from "@/components/TopicDistributionControl";

interface Props {
  topics: Topic[];
}

// Exam 2A & 2B is an exam simulation only — there is no Freedom Version for
// the combined paper. All distribution / weak-area controls are therefore
// locked to real VCAA averages, and the setup page just confirms what the
// student is about to sit.
export default function Exam2ABSetupForm({ topics: _topics }: Props) {
  const router = useRouter();
  const [showSolutions, setShowSolutions] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(true);

  function handleStart() {
    const timerParam = timerEnabled ? "&timer=1" : "";
    const countB = Math.random() < 0.5 ? 4 : 5;
    const dist = [...VCAA_TOPIC_DIST].join(",");
    const distB = [...VCAA_TOPIC_DIST].join(",");
    const diff = [...VCAA_DIFFICULTY_DIST].join(",");
    const url = `/practice/session?mode=exam2ab&version=exam&countA=20&countB=${countB}&dist=${dist}&distB=${distB}&diff=${diff}&solutions=${showSolutions ? "1" : "0"}${timerParam}`;
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

      {/* Info banner — format summary */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-5 lg:px-6 py-4 lg:py-5 text-sm lg:text-base text-gray-600 dark:text-gray-400 flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <svg className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span>
          Section A: 20 MCQ (20 marks) · Section B: extended response (60 marks) · 80 marks total · CAS Calculator allowed — matches the real VCE Exam 2.
        </span>
      </div>

      {/* Distribution / difficulty mix is locked to real VCAA averages — there
          is no Freedom Version for the combined paper. The locked values live
          on the URL built in handleStart() above. */}

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

      {/* Start button */}
      <button
        type="button"
        onClick={handleStart}
        className="rounded-xl bg-brand-600 px-8 lg:px-10 py-3 lg:py-4 text-base lg:text-lg font-semibold text-white hover:bg-brand-700 transition-colors"
      >
        Start Practice →
      </button>
    </div>
  );
}
