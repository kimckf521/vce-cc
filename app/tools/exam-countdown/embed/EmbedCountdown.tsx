"use client";

import { useEffect, useState } from "react";
import {
  daysBetweenISO,
  melbourneDateISOAt,
  type CountdownExam,
} from "../countdown-lib";

/**
 * Compact single-subject countdown for the embeddable iframe (~600×180).
 *
 * Same hydration-safe ticking pattern as CountdownLive: first client render
 * uses the server's `initialNowMs`, then an effect swaps in the live clock.
 * Light/dark follows the visitor's system preference via the root layout's
 * theme script (`prefers-color-scheme` → `.dark` on <html>), so the widget
 * matches the host page's OS theme even inside an iframe.
 */

interface Props {
  exams: CountdownExam[];
  subjectDisplay: string;
  initialNowMs: number;
  homeUrl: string;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function Digit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-[3.5rem] flex-col items-center rounded-xl border border-brand-100 bg-brand-50/60 px-2 py-1.5 dark:border-gray-800 dark:bg-gray-900">
      <span className="text-2xl font-extrabold tabular-nums leading-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
        {value}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </span>
    </div>
  );
}

function Attribution({ homeUrl }: { homeUrl: string }) {
  return (
    <a
      href={homeUrl}
      target="_blank"
      rel="noopener"
      className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
    >
      atarhero.com.au
    </a>
  );
}

export default function EmbedCountdown({
  exams,
  subjectDisplay,
  initialNowMs,
  homeUrl,
}: Props) {
  const [now, setNow] = useState(initialNowMs);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const todayISO = melbourneDateISOAt(now);
  // Same contention rule as CountdownLive: past dates drop out, and so does a
  // same-day exam once its published sitting has ended — the next exam's
  // ticker takes over instead of "underway" lingering until midnight. Exams
  // with no parsed end (endEpochMs === startEpochMs) stay date-based.
  const next = exams
    .map((e) => ({ ...e, days: daysBetweenISO(todayISO, e.dateISO) }))
    .filter(
      (e) =>
        e.days >= 0 && !(e.endEpochMs > e.startEpochMs && now > e.endEpochMs),
    )[0];

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white px-4 py-3 dark:bg-gray-950">
      {next ? (
        <div className="w-full max-w-[560px]">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {next.subjectDisplay} — {next.label}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {next.datePhrase}
              {next.time && ` · ${next.time}`}
            </p>
          </div>

          <div className="mt-2 flex items-center gap-1.5" role="timer" aria-live="off">
            {(() => {
              const msLeft = Math.max(0, next.startEpochMs - now);
              if (msLeft === 0) {
                return (
                  <p className="py-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    The paper is underway — good luck!
                  </p>
                );
              }
              const dd = Math.floor(msLeft / 86_400_000);
              const hh = Math.floor((msLeft % 86_400_000) / 3_600_000);
              const mm = Math.floor((msLeft % 3_600_000) / 60_000);
              return (
                <>
                  <Digit value={String(dd)} label={dd === 1 ? "day" : "days"} />
                  <span aria-hidden="true" className="font-bold text-brand-200 dark:text-gray-700">:</span>
                  <Digit value={pad2(hh)} label="hours" />
                  <span aria-hidden="true" className="font-bold text-brand-200 dark:text-gray-700">:</span>
                  <Digit value={pad2(mm)} label="minutes" />
                </>
              );
            })()}
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
            <span>All times AEDT (Melbourne)</span>
            <span>
              Countdown by <Attribution homeUrl={homeUrl} />
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-[560px] text-center">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {subjectDisplay}: the 2026 exams are done.
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            2027 dates land here as soon as VCAA publishes them.
          </p>
          <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
            Countdown by <Attribution homeUrl={homeUrl} />
          </p>
        </div>
      )}
    </div>
  );
}
