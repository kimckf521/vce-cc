import Link from "next/link";
import { CalendarDays, Clock, FileText, TrendingUp } from "lucide-react";

/**
 * What an exam page shows when the paper has no questions yet.
 *
 * Two situations reach this, and they need different promises:
 *   - the paper has not been sat (2026 papers, seeded ahead of the exam)
 *   - it has been sat but VCAA has not published it yet
 *
 * Why the page exists before the paper does: a brand-new URL on a low-authority
 * domain takes weeks to be crawled, indexed and ranked, but the search spike
 * after an exam lasts hours. A page created on the day cannot win; a page
 * created in September and UPDATED on the day can. This panel is what makes
 * that URL worth indexing in the meantime — so it has to earn its place on its
 * own merits, not act as a placeholder holding a slot.
 *
 * The honesty constraint is load-bearing. VCAA does not publish a paper on the
 * day it is sat (measured: 2025 Methods Exam 1 was released T+5 days, the 2024
 * paper T+9), so this panel never implies solutions will appear that afternoon.
 * Promising an afternoon turnaround would be a lie the page cannot keep, and
 * students remember which sites lied to them in November.
 */

export interface TopicShare {
  name: string;
  questionCount: number;
  /** 0–1 share of all questions across the papers analysed. */
  share: number;
}

interface UpcomingExamPanelProps {
  subjectDisplayName: string;
  examLabel: string;
  year: number;
  /** Melbourne-local YYYY-MM-DD, or null when VCAA has published no date. */
  dateISO: string | null;
  datePhrase: string | null;
  timePhrase: string | null;
  /** Whole days until the exam; negative once it has been sat. */
  daysAway: number | null;
  topics: TopicShare[];
  papersAnalysed: number;
  yearsAnalysed: string | null;
  examsHref: string;
}

function countdownLine(daysAway: number): string {
  if (daysAway > 1) return `${daysAway} days away`;
  if (daysAway === 1) return "tomorrow";
  if (daysAway === 0) return "today";
  if (daysAway === -1) return "sat yesterday";
  return `sat ${Math.abs(daysAway)} days ago`;
}

export default function UpcomingExamPanel({
  subjectDisplayName,
  examLabel,
  year,
  dateISO,
  datePhrase,
  timePhrase,
  daysAway,
  topics,
  papersAnalysed,
  yearsAnalysed,
  examsHref,
}: UpcomingExamPanelProps) {
  const hasBeenSat = daysAway !== null && daysAway < 0;

  return (
    <div className="space-y-6">
      {/* Status: where this paper is in its lifecycle. Stated plainly, because
          a vague "coming soon" is exactly what makes a page feel like filler. */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 lg:p-7">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {hasBeenSat
            ? `This paper has been sat — we're waiting on VCAA`
            : `This paper hasn't been sat yet`}
        </h2>

        {dateISO && (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <CalendarDays
                className="mt-0.5 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400"
                aria-hidden="true"
              />
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Exam date</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">
                  {datePhrase}
                  {daysAway !== null && (
                    <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                      · {countdownLine(daysAway)}
                    </span>
                  )}
                </dd>
              </div>
            </div>
            {timePhrase && (
              <div className="flex items-start gap-3">
                <Clock
                  className="mt-0.5 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Sitting time</dt>
                  <dd className="font-medium text-gray-900 dark:text-gray-100">{timePhrase}</dd>
                </div>
              </div>
            )}
          </dl>
        )}

        <p className="mt-5 text-gray-600 dark:text-gray-300">
          VCAA publishes each paper on its own site about a week after the exam is sat — not
          on the day. Once the {year} {examLabel} paper is out, worked solutions for every
          question go up on this page, free, the same as every other year here.
        </p>
      </section>

      {/* The reason this page deserves to exist in September: an original
          analysis of what this paper actually tests, mined from the past papers
          already on the site. Useful whether or not solutions ever appear. */}
      {topics.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 lg:p-7">
          <div className="flex items-start gap-3">
            <TrendingUp
              className="mt-1 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400"
              aria-hidden="true"
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                What usually comes up in {subjectDisplayName} {examLabel}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Every question across {papersAnalysed}{" "}
                {papersAnalysed === 1 ? "paper" : "papers"}
                {yearsAnalysed ? ` (${yearsAnalysed})` : ""}, counted by topic. Past papers
                are not a syllabus — but the weighting has been steady, and it tells you
                where revision time pays.
              </p>
            </div>
          </div>

          <ul className="mt-5 space-y-3">
            {topics.map((t) => (
              <li key={t.name}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{t.name}</span>
                  <span className="shrink-0 text-sm tabular-nums text-gray-500 dark:text-gray-400">
                    {t.questionCount} {t.questionCount === 1 ? "question" : "questions"} ·{" "}
                    {Math.round(t.share * 100)}%
                  </span>
                </div>
                <div
                  className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
                  role="presentation"
                >
                  <div
                    className="h-full rounded-full bg-brand-500 dark:bg-brand-400"
                    style={{ width: `${Math.max(2, Math.round(t.share * 100))}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 lg:p-7">
        <div className="flex items-start gap-3">
          <FileText
            className="mt-1 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400"
            aria-hidden="true"
          />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Practise the real thing while you wait
            </h2>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              Every past {subjectDisplayName} paper on this site is free, with worked
              solutions to every question — no account needed.
            </p>
            <Link
              href={examsHref}
              className="mt-4 inline-flex items-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              Browse {subjectDisplayName} past papers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
