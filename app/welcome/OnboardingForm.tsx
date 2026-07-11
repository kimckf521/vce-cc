"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUBJECTS } from "@/lib/subject-context";
import {
  CURRICULA,
  COMING_SOON_CURRICULA,
} from "@/lib/curriculum-context";
import { saveStudyingSubjects } from "@/app/actions/save-studying-subjects";

type Props = {
  displayName: string | null;
  isReferred: boolean;
  /**
   * Subjects to pre-check. Resolved server-side from the `vce_studying`
   * cookie or the user's PAID enrolments; falls back to Methods for brand
   * new users. Pre-fill makes the form forgiving for returning users.
   */
  initialSelectedSubjects?: string[];
  /**
   * Where "continue free" lands — the user's original `?next=` destination
   * (validated server-side), or /dashboard by default.
   */
  continueHref?: string;
};

/**
 * First-time signup onboarding form. Single page, progressive (curriculum
 * picker → subject multi-select → pricing CTA). Skippable via "or continue
 * free".
 *
 * Subject selection is saved to a cookie via the server action — the
 * dashboard uses it to sort enrolled subjects to the top.
 */
export default function OnboardingForm({
  displayName,
  isReferred,
  initialSelectedSubjects,
  continueHref = "/dashboard",
}: Props) {
  const greetingName = displayName?.trim();
  const greeting = greetingName ? `Welcome, ${greetingName} 👋` : "Welcome 👋";

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    initialSelectedSubjects && initialSelectedSubjects.length > 0
      ? initialSelectedSubjects
      : [SUBJECTS[0].urlSlug]
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSubject(slug: string) {
    setSelectedSubjects((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  async function handleSubscribe() {
    setSubmitting(true);
    setError(null);
    try {
      await saveStudyingSubjects(selectedSubjects);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey: "vceMaths" }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout. Please try again.");
        setSubmitting(false);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unexpected error. Please try again."
      );
      setSubmitting(false);
    }
  }

  async function handleContinueFree() {
    setSubmitting(true);
    try {
      await saveStudyingSubjects(selectedSubjects);
      window.location.href = continueHref;
    } catch {
      window.location.href = continueHref;
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 lg:py-16 px-4 sm:px-6">
      <header className="text-center mb-10 lg:mb-12">
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
          {greeting}
        </h1>
        <p className="mt-3 text-base lg:text-lg text-gray-500 dark:text-gray-400">
          Let&apos;s set up your study.
        </p>
      </header>

      {/* Section 1: Curriculum */}
      <section className="mb-8 lg:mb-10">
        <h2 className="text-sm lg:text-base font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
          1. Your curriculum
        </h2>
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          {CURRICULA.map((c) => (
            <div
              key={c.slug}
              className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white flex-shrink-0">
                <Check className="h-3 w-3" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {c.shortName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {c.displayName}
                </p>
              </div>
            </div>
          ))}
          {COMING_SOON_CURRICULA.map((c) => (
            <div
              key={c.shortName}
              className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0 opacity-50"
            >
              <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-400">
                  {c.shortName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {c.displayName} — coming soon
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Subjects */}
      <section className="mb-8 lg:mb-10">
        <h2 className="text-sm lg:text-base font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
          2. Which maths subjects are you studying?
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Pick all that apply — we&apos;ll personalise your dashboard.
        </p>
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          {SUBJECTS.map((s) => {
            const checked = selectedSubjects.includes(s.urlSlug);
            return (
              <label
                key={s.urlSlug}
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSubject(s.urlSlug)}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold flex-shrink-0",
                    s.colors.badge
                  )}
                >
                  {s.badge}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {s.shortName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {s.displayName}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </section>

      {/* Section 3: Pricing CTA */}
      <section>
        <div className="rounded-2xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/60 p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span className="text-xs lg:text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
              {isReferred ? "Your discount is ready" : "VCE Maths"}
            </span>
          </div>

          <div className="flex items-baseline gap-1 mb-4">
            {isReferred ? (
              <>
                <span className="text-2xl lg:text-3xl font-bold text-gray-400 dark:text-gray-500 line-through mr-2">
                  $9.99
                </span>
                <span className="text-3xl lg:text-4xl font-extrabold text-brand-700 dark:text-brand-300">
                  $4.99
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  /1st month
                </span>
              </>
            ) : (
              <>
                <span className="text-3xl lg:text-4xl font-extrabold text-brand-700 dark:text-brand-300">
                  $9.99
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  /month
                </span>
              </>
            )}
          </div>

          <ul className="space-y-2 mb-6">
            <PerkRow text="All 4 maths subjects, full access" />
            <PerkRow text="Every VCAA past paper" />
            <PerkRow text="Worked solutions + practice mode" />
            <PerkRow text="Cancel any time" />
          </ul>

          <button
            type="button"
            onClick={handleSubscribe}
            disabled={submitting}
            className={cn(
              "block w-full rounded-xl px-5 py-3.5 text-center text-base font-semibold transition-colors",
              "bg-brand-600 hover:bg-brand-700 text-white",
              submitting && "opacity-70 cursor-not-allowed"
            )}
          >
            {submitting
              ? "Loading…"
              : isReferred
                ? "Unlock VCE Maths — $4.99 first month"
                : "Unlock VCE Maths — $9.99/month"}
          </button>

          <button
            type="button"
            onClick={handleContinueFree}
            disabled={submitting}
            className="block w-full text-center mt-3 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            or continue free <ArrowRight className="inline-block h-3 w-3 ml-0.5" />
          </button>

          {error && (
            <p className="mt-3 text-xs text-red-600 dark:text-red-400 text-center">
              {error}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function PerkRow({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-brand-900 dark:text-brand-100">
      <Check className="h-4 w-4 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
      {text}
    </li>
  );
}

// Suppress unused import warning — Link kept for future use
void Link;
