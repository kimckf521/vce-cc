"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  daysBetweenISO,
  melbourneDateISOAt,
  practicePapersEstimate,
  weekendsPhrase,
  type CountdownExam,
} from "./countdown-lib";

/**
 * Live half of the public exam-countdown page: the ticking hero card for the
 * soonest upcoming exam plus one card per remaining subject exam.
 *
 * Hydration-safe by construction — the first client render uses the same
 * `initialNowMs` the server rendered with, then an effect swaps in the real
 * clock and ticks every second. Finished exams filter themselves out against
 * the live clock — a card disappears once its published sitting ends (or,
 * for date-only entries, when its Melbourne date passes).
 *
 * Tone stays calm and supportive throughout: brand blues, no red, no "ONLY
 * X days left!!" — the countdown is a planning tool, not a panic dial.
 */

interface Props {
  exams: CountdownExam[];
  initialNowMs: number;
}

type LiveExam = CountdownExam & { days: number };

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** One big digit block in the hero countdown. */
function DigitCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-[4.5rem] flex-col items-center rounded-2xl border border-brand-100 bg-white/80 px-3 py-3 dark:border-gray-800 dark:bg-gray-900/70 sm:min-w-[6rem] sm:px-5 sm:py-4">
      <span className="text-4xl font-extrabold tabular-nums text-gray-900 dark:text-gray-100 sm:text-5xl">
        {value}
      </span>
      <span className="mt-1 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </span>
    </div>
  );
}

function DigitColon() {
  return (
    <span
      aria-hidden="true"
      className="text-2xl font-bold text-brand-200 dark:text-gray-700 sm:text-3xl"
    >
      :
    </span>
  );
}

/** Subject letter chip, coloured per subject identity. */
function SubjectChip({ exam }: { exam: CountdownExam }) {
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${exam.badgeClass}`}
      aria-hidden="true"
    >
      {exam.badge}
    </span>
  );
}

/** Supportive one-liner under the hero digits. */
function heroSupportLine(days: number): string {
  if (days === 0) return "Today's the day — one calm read-through of your notes, then trust the work you've put in.";
  if (days === 1) return "Tomorrow — rest up tonight. You've done the preparation.";
  const weekends = weekendsPhrase(days);
  const papers = practicePapersEstimate(days);
  const daysBit = weekends ? `${days} days — ${weekends}` : `${days} days to go`;
  if (days < 3) return `${daysBit}. Time for one last calm practice paper.`;
  return `${daysBit}. Enough time for about ${papers} full practice ${papers === 1 ? "paper" : "papers"} — steady beats cramming.`;
}

/** Friendly state once every published exam has passed. */
function AllDone() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900 sm:p-12">
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        That&apos;s a wrap on the 2026 exams. Well done making it through.
      </p>
      <p className="mx-auto mt-3 max-w-xl text-gray-500 dark:text-gray-400">
        2027 dates land here as soon as VCAA publishes the new timetable — we
        update this page the day it drops. In the meantime, every past paper
        stays free.
      </p>
      <Link
        href="/vce/methods/exams"
        className="mt-6 inline-block rounded-2xl bg-brand-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-700"
      >
        Browse free past papers
      </Link>
    </div>
  );
}

function HeroCard({ exam, nowMs }: { exam: LiveExam; nowMs: number }) {
  const msLeft = Math.max(0, exam.startEpochMs - nowMs);
  const dd = Math.floor(msLeft / 86_400_000);
  const hh = Math.floor((msLeft % 86_400_000) / 3_600_000);
  const mm = Math.floor((msLeft % 3_600_000) / 60_000);
  const started = msLeft === 0;

  return (
    <section
      aria-label={`Next exam: ${exam.subjectDisplay} ${exam.label}`}
      className="rounded-2xl border border-brand-100 bg-gradient-to-b from-brand-50 to-white p-5 dark:border-gray-800 dark:from-gray-950 dark:to-gray-900 sm:p-8"
    >
      <div className="flex items-center gap-2">
        <SubjectChip exam={exam} />
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">
          Next up
        </span>
      </div>

      <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
        {exam.subjectDisplay} — {exam.label}
      </h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 sm:text-base">
        {exam.datePhrase}
        {exam.time && ` · ${exam.time}`} · AEDT (Melbourne)
      </p>

      {started ? (
        <p className="mt-6 text-xl font-semibold text-gray-900 dark:text-gray-100">
          The paper is underway — good luck. You&apos;ve prepared for this.
        </p>
      ) : (
        <>
          <div className="mt-6 flex items-center gap-2 sm:gap-3" role="timer" aria-live="off">
            <DigitCell value={String(dd)} label={dd === 1 ? "day" : "days"} />
            <DigitColon />
            <DigitCell value={pad2(hh)} label="hours" />
            <DigitColon />
            <DigitCell value={pad2(mm)} label="minutes" />
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
            {heroSupportLine(exam.days)}
          </p>
        </>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/vce/${exam.subjectSlug}/exams`}
          className="rounded-2xl bg-brand-600 px-6 py-3.5 text-center font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Practise {exam.subjectShort} with real past papers — free
        </Link>
        <Link
          href="/signup"
          className="rounded-2xl border border-gray-200 px-6 py-3.5 text-center font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Create a free account
        </Link>
      </div>
    </section>
  );
}

function ExamCard({ exam }: { exam: LiveExam }) {
  const weekends = weekendsPhrase(exam.days);
  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-2">
        <SubjectChip exam={exam} />
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {exam.subjectShort} {exam.label}
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
        {exam.datePhrase}
        {exam.time && ` · ${exam.time}`}
      </p>

      {exam.days === 0 ? (
        <p className="mt-4 text-2xl font-extrabold text-gray-900 dark:text-gray-100">
          Today
        </p>
      ) : (
        <>
          <p className="mt-4 text-4xl font-extrabold tabular-nums text-gray-900 dark:text-gray-100">
            {exam.days}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {exam.days === 1 ? "day to go — tomorrow" : "days to go"}
            {weekends && ` — ${weekends}`}
          </p>
        </>
      )}

      <Link
        href={`/vce/${exam.subjectSlug}/exams`}
        className="mt-auto pt-4 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
      >
        {exam.subjectShort} past papers →
      </Link>
    </div>
  );
}

export default function CountdownLive({ exams, initialNowMs }: Props) {
  const [now, setNow] = useState(initialNowMs);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const todayISO = melbourneDateISOAt(now);
  // Props arrive soonest-first from the server; keep that order and just
  // attach live day counts + drop exams that are over: past Melbourne dates,
  // plus same-day exams whose published sitting has ended — so within minutes
  // of pens-down the next exam's ticker takes the hero instead of "underway"
  // lingering until midnight. Exams with no parsed end (endEpochMs ===
  // startEpochMs, e.g. date-only entries) keep the date-based behaviour.
  const upcoming: LiveExam[] = exams
    .map((e) => ({ ...e, days: daysBetweenISO(todayISO, e.dateISO) }))
    .filter(
      (e) =>
        e.days >= 0 && !(e.endEpochMs > e.startEpochMs && now > e.endEpochMs),
    );

  if (upcoming.length === 0) return <AllDone />;

  const [hero, ...rest] = upcoming;

  return (
    <div>
      <HeroCard exam={hero} nowMs={now} />
      {rest.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((e) => (
            <ExamCard key={`${e.subjectSlug}-${e.label}`} exam={e} />
          ))}
        </div>
      )}
    </div>
  );
}
