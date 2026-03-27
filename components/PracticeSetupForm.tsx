"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import TopicDistributionControl from "./TopicDistributionControl";
import DifficultyDistributionControl, { type DiffDist } from "./DifficultyDistributionControl";

interface PracticeSetupFormProps {
  mode: "exam1" | "exam2a" | "exam2b";
  topics: { id: string; name: string; slug: string }[];
  title: string;
}

const MODE_CONFIG = {
  exam1: {
    examCount: 9,
    freedomMin: 5,
    freedomMax: 40,
    freedomStep: 5,
    freedomDefault: 10,
    examDescription: "8–9 short answer questions, matching real Exam 1 format.",
  },
  exam2a: {
    examCount: 20,
    freedomMin: 10,
    freedomMax: 100,
    freedomStep: 5,
    freedomDefault: 20,
    examDescription: "20 multiple choice questions, matching real Exam 2A format.",
  },
  exam2b: {
    examCount: 5,
    freedomMin: 10,
    freedomMax: 100,
    freedomStep: 5,
    freedomDefault: 10,
    examDescription: "5 extended response questions, matching real Exam 2B format.",
  },
} as const;

export default function PracticeSetupForm({ mode, topics, title }: PracticeSetupFormProps) {
  const router = useRouter();
  const cfg = MODE_CONFIG[mode];

  const [version, setVersion] = useState<"exam" | "freedom">("exam");
  const [count, setCount] = useState<number>(cfg.freedomDefault);
  const [distribution, setDistribution] = useState<number[]>([25, 25, 25, 25]);
  const [diffDist, setDiffDist] = useState<DiffDist>([50, 30, 20]);
  const [showSolutions, setShowSolutions] = useState(false);

  const topicTotal = distribution.reduce((a, b) => a + b, 0);
  const diffTotal = diffDist[0] + diffDist[1] + diffDist[2];
  const isValid = topicTotal === 100 && diffTotal === 100;

  const finalCount = version === "exam" ? cfg.examCount : count;

  function handleStart() {
    if (!isValid) return;
    const url = `/practice/session?mode=${mode}&version=${version}&count=${finalCount}&dist=${distribution.join(",")}&diff=${diffDist.join(",")}&solutions=${showSolutions ? "1" : "0"}`;
    router.push(url);
  }

  function adjustCount(delta: number) {
    setCount((prev) => Math.min(cfg.freedomMax, Math.max(cfg.freedomMin, prev + cfg.freedomStep * delta)));
  }

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Back link */}
      <Link
        href="/practice"
        className="inline-flex items-center gap-1.5 text-sm lg:text-base font-medium text-brand-600 hover:text-brand-700 transition-colors"
      >
        ← Practice
      </Link>

      {/* Heading */}
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{title}</h1>

      {/* Mode selection */}
      <div className="space-y-3 lg:space-y-4">
        <h2 className="text-xs lg:text-sm font-semibold text-gray-500 uppercase tracking-widest">Mode</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
          {/* Exam Version card */}
          <button
            type="button"
            onClick={() => setVersion("exam")}
            className={cn(
              "rounded-xl border-2 p-4 lg:p-5 text-left transition-all",
              version === "exam"
                ? "border-brand-500 bg-brand-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            )}
          >
            <div className="font-bold text-gray-900 text-base lg:text-lg mb-1">Exam Version</div>
            <div className="text-xs lg:text-sm text-gray-500">{cfg.examDescription}</div>
          </button>

          {/* Freedom Version card */}
          <button
            type="button"
            onClick={() => setVersion("freedom")}
            className={cn(
              "rounded-xl border-2 p-4 lg:p-5 text-left transition-all",
              version === "freedom"
                ? "border-brand-500 bg-brand-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            )}
          >
            <div className="font-bold text-gray-900 text-base lg:text-lg mb-1">Freedom Version</div>
            <div className="text-xs lg:text-sm text-gray-500">Choose your own question count.</div>
          </button>
        </div>

        {/* Freedom count picker */}
        {version === "freedom" && (
          <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 lg:p-5">
            <span className="text-sm lg:text-base font-medium text-gray-700">Question count</span>
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => adjustCount(-1)}
                disabled={count <= cfg.freedomMin}
                className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-1.5 lg:p-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
              </button>
              <span className="w-14 text-center text-xl lg:text-2xl font-bold text-brand-600 tabular-nums">{count}</span>
              <button
                type="button"
                onClick={() => adjustCount(1)}
                disabled={count >= cfg.freedomMax}
                className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-1.5 lg:p-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Topic distribution */}
      <div className="space-y-3 lg:space-y-4">
        <h2 className="text-xs lg:text-sm font-semibold text-gray-500 uppercase tracking-widest">Topic Distribution</h2>
        <TopicDistributionControl
          topics={topics}
          distribution={distribution}
          onChange={setDistribution}
        />
      </div>

      {/* Difficulty distribution */}
      <div className="space-y-3 lg:space-y-4">
        <h2 className="text-xs lg:text-sm font-semibold text-gray-500 uppercase tracking-widest">Difficulty Distribution</h2>
        <DifficultyDistributionControl
          distribution={diffDist}
          onChange={setDiffDist}
        />
      </div>

      {/* Show solutions toggle */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 lg:px-6 py-4 lg:py-5">
        <div>
          <p className="text-sm lg:text-base font-semibold text-gray-800">Show solutions as I go</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-0.5">Display a solution button on each question</p>
        </div>
        <button
          type="button"
          onClick={() => setShowSolutions((v) => !v)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
            showSolutions ? "bg-brand-600" : "bg-gray-200"
          )}
        >
          <span className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200",
            showSolutions ? "translate-x-5" : "translate-x-0"
          )} />
        </button>
      </div>

      {/* Error message */}
      {!isValid && (
        <p className="text-sm lg:text-base font-medium text-red-600">
          {topicTotal !== 100 && "Topic percentages"}
          {topicTotal !== 100 && diffTotal !== 100 && " and "}
          {diffTotal !== 100 && "difficulty percentages"}
          {" "}must each add up to 100% before you can start.
        </p>
      )}

      {/* Start button */}
      <button
        type="button"
        onClick={handleStart}
        disabled={!isValid}
        className="rounded-xl bg-brand-600 px-8 lg:px-10 py-3 lg:py-4 text-base lg:text-lg font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Start Practice →
      </button>
    </div>
  );
}
