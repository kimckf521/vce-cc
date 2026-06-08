"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import type { QuestionGroupData } from "@/lib/question-groups";

// Same client-only renderer the topic page uses (ssr:false because it reaches
// for browser APIs). For free/anon users it shows the question + worked
// solution but no save buttons (canTrackProgress=false).
const QuestionGroup = dynamic(() => import("@/components/QuestionGroup"), {
  ssr: false,
});

type Props = {
  groups: QuestionGroupData[];
  subjectName: string;
};

/**
 * Anonymous "taste": renders a handful of free Algebra questions for a
 * logged-out visitor — answer + reveal solutions, but no saving (saving is the
 * reason to register). Then a wall inviting a free account. No load-more, no DB
 * writes; reuses QuestionGroup exactly as a free user sees it on the topic page.
 */
export default function TryFlow({ groups, subjectName }: Props) {
  return (
    <div className="space-y-4 lg:space-y-5">
      {groups.map((group, i) => (
        <QuestionGroup
          key={group.key}
          year={group.year}
          examType={group.examType}
          sectionLabel={group.sectionLabel}
          questionIndex={i + 1}
          frequency={group.frequency}
          topic={group.topicName}
          subtopics={group.subtopics}
          calculatorAllowed={group.calculatorAllowed}
          parts={group.parts}
          isAdmin={false}
          canTrackProgress={false}
          hideTopicBadge
        />
      ))}

      {/* Register wall — honest about the free tier: a free account keeps you
          practising + saves progress; paid unlocks the other topics. */}
      <div className="rounded-2xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/40 p-6 text-center lg:p-8">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900">
          <Sparkles className="h-5 w-5 text-brand-600 dark:text-brand-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 lg:text-xl">
          That&apos;s the free Algebra set for {subjectName}
        </h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-gray-600 dark:text-gray-400 lg:text-base">
          Create a <strong>free account</strong> to keep practising and{" "}
          <strong>save your progress</strong> — no card needed. Unlock every
          topic and timed exams across all 4 subjects with VCE Maths.
        </p>
        <Link
          href="/signup"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 lg:text-base"
        >
          Create your free account
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
          Already have one?{" "}
          <Link
            href="/login"
            className="underline hover:text-brand-600 dark:hover:text-brand-400"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
