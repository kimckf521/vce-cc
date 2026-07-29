"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import {
  buildCountdownExams,
  daysBetweenISO,
  isExamOver,
  melbourneDateISOAt,
  weekendsPhrase,
} from "@/app/tools/exam-countdown/countdown-lib";

/**
 * Homepage countdown teaser — the soonest upcoming VCAA maths exam as one
 * calm line, e.g. "General Exam 1 · Fri 30 Oct · 92 days — about 13
 * weekends", plus a link to the full countdown tool. Deliberately day-level
 * only: the homepage teases, /tools/exam-countdown has the live digits.
 *
 * Staleness + hydration (mirrors CountdownLive): the homepage HTML may be
 * cached, so a server-computed day count can go stale. The first client
 * render uses the same `initialNowMs` the server rendered with — identical
 * markup, so no hydration mismatch and no flash — then an effect swaps in
 * the real clock. A one-minute interval keeps the count honest if the tab
 * stays open across Melbourne midnight; the display only changes when the
 * day count (or soonest exam) actually changes, so nothing visibly ticks.
 *
 * Tone stays calm and supportive — no red, no "ONLY X days left!!".
 * Renders nothing once every published exam has passed, so callers can
 * include it unconditionally.
 */

// Exam dates are static config (fixed within a deploy) and the builder is
// deterministic, so build the list once per bundle — identical on server
// and client.
const EXAMS = buildCountdownExams();

export default function HomeCountdownStrip({
  initialNowMs,
}: {
  initialNowMs: number;
}) {
  const [now, setNow] = useState(initialNowMs);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const todayISO = melbourneDateISOAt(now);
  // Shared isExamOver rule (countdown-lib) keeps this strip and the tools
  // page agreeing on which exam is next. EXAMS arrives soonest-first, so
  // the first survivor is the next exam.
  const next = EXAMS.map((e) => ({
    ...e,
    days: daysBetweenISO(todayISO, e.dateISO),
  })).find((e) => !isExamOver(e, now));

  if (!next) return null;

  const weekends = weekendsPhrase(next.days);
  const daysPhrase =
    next.days === 0
      ? "today — you've prepared for this"
      : next.days === 1
        ? "tomorrow — rest up tonight"
        : weekends
          ? `${next.days} days — ${weekends}`
          : `${next.days} days`;

  return (
    <div className="mt-8 lg:mt-10 flex justify-center">
      {/* Inline text flow (not flex chunks) so the line wraps gracefully at
          word boundaries on narrow phones; the link stays unbroken. */}
      <p className="max-w-2xl rounded-2xl border border-brand-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/70 px-4 py-2.5 sm:px-5 text-center text-sm lg:text-base leading-relaxed shadow-sm">
        <CalendarDays
          className="mr-1.5 -mt-0.5 inline-block h-4 w-4 text-brand-600 dark:text-brand-400"
          aria-hidden="true"
        />
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {next.subjectShort} {next.label}
        </span>
        <span className="text-gray-600 dark:text-gray-300">
          {" · "}
          {next.datePhrase}
          {" · "}
          {daysPhrase}
          {" · "}
        </span>
        <Link
          href="/tools/exam-countdown"
          className="whitespace-nowrap font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
        >
          Full countdown →
        </Link>
      </p>
    </div>
  );
}
