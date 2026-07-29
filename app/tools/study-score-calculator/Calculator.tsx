"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  SUBJECTS,
  estimateStudyScore,
  getSubjectDef,
  isSubjectKey,
  type InputKey,
  type SubjectKey,
} from "@/lib/study-score";

/**
 * Client half of the public study-score calculator. All maths runs locally in
 * lib/study-score.ts — no API calls, results update as the sliders move.
 *
 * State is mirrored into the query string (?subject=methods&e1=72&e2=68&sac=75)
 * via history.replaceState so students can share their result link; the same
 * params are read back on load.
 */

const clampPct = (v: number) => Math.min(100, Math.max(0, Math.round(v)));

/** Lever-specific CTA copy for the strongest sensitivity entry. */
const LEVER_CTA: Record<InputKey, { headline: (label: string) => string; action: string }> = {
  e2: {
    headline: () => "Exam 2 moves your score most",
    action: "Practise full Exam 2 simulations free on ATAR Hero",
  },
  e1: {
    headline: (label) =>
      label === "Exam" ? "The exam moves your score most" : "Exam 1 moves your score most",
    action: "Practise timed exam questions free on ATAR Hero",
  },
  sac: {
    headline: () => "Your SACs move your score most",
    action: "Drill topic-by-topic questions free on ATAR Hero",
  },
};

function ordinal(n: number): string {
  const r = Math.round(n);
  const rem100 = r % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${r}th`;
  const suffix = ["st", "nd", "rd"][(r % 10) - 1] ?? "th";
  return `${r}${suffix}`;
}

/**
 * Compact SVG bell curve of the study-score scale (mean 30, SD 7, truncated at
 * 0 and 50 — the shape VCAA maps aggregates onto) with the user's estimate
 * marked. Pure SVG, no chart libs; colours via Tailwind fill/stroke classes so
 * dark mode just works.
 */
function BellCurve({ score, display }: { score: number; display: string }) {
  const W = 340;
  const H = 128;
  const PAD = 14;
  const BASE_Y = 100;
  const PEAK_Y = 18;
  const x = (s: number) => PAD + (s / 50) * (W - 2 * PAD);
  const y = (s: number) =>
    BASE_Y - (BASE_Y - PEAK_Y) * Math.exp(-((s - 30) ** 2) / (2 * 7 ** 2));

  let curve = `M ${x(0).toFixed(1)} ${y(0).toFixed(1)}`;
  for (let s = 1; s <= 50; s++) curve += ` L ${x(s).toFixed(1)} ${y(s).toFixed(1)}`;
  const area = `${curve} L ${x(50).toFixed(1)} ${BASE_Y} L ${x(0).toFixed(1)} ${BASE_Y} Z`;

  const mx = x(score);
  const my = y(score);
  // Keep the marker label inside the plot; ticks sit at the axis edges.
  const labelX = Math.min(Math.max(mx, PAD + 16), W - PAD - 16);
  const ticks = [0, 10, 20, 30, 40, 50];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label={`Distribution of study scores across the state with your estimate of ${display} marked. Scores centre on 30.`}
    >
      <path d={area} className="fill-brand-500 dark:fill-brand-400" fillOpacity={0.12} />
      <path
        d={curve}
        className="stroke-brand-500 dark:stroke-brand-400"
        strokeWidth={2}
        fill="none"
      />
      <line
        x1={PAD}
        y1={BASE_Y}
        x2={W - PAD}
        y2={BASE_Y}
        className="stroke-gray-300 dark:stroke-gray-600"
        strokeWidth={1}
      />
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={x(t)}
            y1={BASE_Y}
            x2={x(t)}
            y2={BASE_Y + 4}
            className="stroke-gray-300 dark:stroke-gray-600"
            strokeWidth={1}
          />
          <text
            x={x(t)}
            y={BASE_Y + 16}
            textAnchor="middle"
            className="fill-gray-400 dark:fill-gray-500"
            fontSize={10}
          >
            {t}
          </text>
        </g>
      ))}
      {/* User marker */}
      <line
        x1={mx}
        y1={BASE_Y}
        x2={mx}
        y2={my}
        className="stroke-brand-600 dark:stroke-brand-400"
        strokeWidth={2}
        strokeDasharray="3 2"
      />
      <circle cx={mx} cy={my} r={4} className="fill-brand-600 dark:fill-brand-400" />
      <text
        x={labelX}
        y={Math.max(my - 8, 10)}
        textAnchor="middle"
        className="fill-brand-700 dark:fill-brand-300"
        fontSize={11}
        fontWeight={700}
      >
        You: {display}
      </text>
    </svg>
  );
}

function SliderRow({
  id,
  label,
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <label
          htmlFor={id}
          className="text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300"
        >
          {label} <span className="font-normal text-gray-400 dark:text-gray-500">%</span>
        </label>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(clampPct(e.target.value === "" ? 0 : Number(e.target.value)))}
          aria-label={`${label} percent`}
          className="w-20 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 text-right text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      {/* py-2 fattens the touch target for thumbs on phones */}
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand-600 py-2 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>0%</span>
        {hint ? <span className="text-center px-2">{hint}</span> : null}
        <span>100%</span>
      </div>
    </div>
  );
}

export default function Calculator() {
  const searchParams = useSearchParams();

  // Seed state from the query string so shared links reproduce the result.
  const [subject, setSubject] = useState<SubjectKey>(() => {
    const s = searchParams.get("subject");
    return s && isSubjectKey(s) ? s : "methods";
  });
  const readNum = (key: string, fallback: number) => {
    const raw = searchParams.get(key);
    if (raw === null || raw === "") return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? clampPct(n) : fallback;
  };
  // Lazy initialisers: the query string is read once on mount; after that the
  // component owns the state and mirrors it back to the URL below.
  const [sac, setSac] = useState(() => readNum("sac", 65));
  const [e1, setE1] = useState(() => readNum("e1", 60));
  const [e2, setE2] = useState(() => readNum("e2", 55));
  const [copied, setCopied] = useState(false);

  const def = getSubjectDef(subject);
  const hasE2 = def.inputs.some((i) => i.key === "e2");
  const examLabel = def.inputs.find((i) => i.key === "e1")?.label ?? "Exam 1";

  // Mirror state into the URL (shareable), without adding history entries.
  useEffect(() => {
    const q = new URLSearchParams();
    q.set("subject", subject);
    q.set("e1", String(e1));
    if (hasE2) q.set("e2", String(e2));
    q.set("sac", String(sac));
    window.history.replaceState(null, "", `?${q.toString()}`);
  }, [subject, e1, e2, sac, hasE2]);

  const result = useMemo(
    () => estimateStudyScore({ subject, sac, e1, e2 }),
    [subject, sac, e1, e2]
  );

  // When every sensitivity delta is 0 (all inputs at 100), there is no lever
  // to name — don't claim one moves the score while every row shows "—".
  const strongest = result.sensitivity.find((s) => s.delta > 0);
  const cta = strongest ? LEVER_CTA[strongest.input] : null;

  // Nobody is ahead of 100% (or behind 100%) of a cohort they're part of —
  // keep the displayed percentile inside 1–99.
  const displayPct = Math.min(99, Math.max(1, Math.round(result.percentile)));

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. http, old browser) — no-op.
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
      {/* Inputs */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5 sm:p-6 lg:p-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
          Your subject
        </h2>
        {/* Plain toggle buttons (aria-pressed), not ARIA tabs — the tablist
            role promises arrow-key navigation and a tabpanel relationship
            this filter-style switcher doesn't implement. */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-7" role="group" aria-label="Subject">
          {SUBJECTS.map((s) => {
            const active = s.key === subject;
            const short = s.name.split(" ")[0] === "Mathematical" ? "Methods" : s.name.split(" ")[0];
            return (
              <button
                key={s.key}
                aria-pressed={active}
                onClick={() => setSubject(s.key)}
                className={`rounded-xl px-3 py-2.5 text-sm lg:text-base font-semibold transition-colors ${
                  active
                    ? "bg-brand-600 text-white"
                    : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand-300 hover:text-brand-600 dark:hover:text-brand-400"
                }`}
              >
                {short}
              </button>
            );
          })}
        </div>

        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
          Your marks so far
        </h2>
        <div className="space-y-6">
          <SliderRow
            id="ss-sac"
            label="SACs"
            value={sac}
            onChange={setSac}
            hint={subject === "foundation" ? "One figure covers Units 3 and 4" : undefined}
          />
          <SliderRow id="ss-e1" label={examLabel} value={e1} onChange={setE1} />
          {hasE2 && <SliderRow id="ss-e2" label="Exam 2" value={e2} onChange={setE2} />}
        </div>

        <p className="mt-6 text-xs lg:text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
          Enter each assessment as a percentage of its maximum mark. Not sure yet? Use your
          practice-exam averages — the estimate updates live.
        </p>
      </div>

      {/* Result — sticky on desktop so it stays visible while sliding */}
      <div className="lg:sticky lg:top-24 self-start rounded-2xl border border-brand-200 dark:border-brand-800 bg-white dark:bg-gray-900 shadow-xl ring-1 ring-brand-100 dark:ring-brand-900 p-5 sm:p-6 lg:p-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Estimated study score
        </h2>

        <div className="mt-2 flex items-end gap-3 flex-wrap">
          <span className="text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 leading-none">
            {result.display}
          </span>
          <span className="mb-1.5 rounded-full bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 px-3 py-1 text-sm font-semibold text-brand-700 dark:text-brand-400">
            likely {result.band[0]}–{result.band[1]}
          </span>
        </div>

        <p className="mt-3 text-sm lg:text-base text-gray-500 dark:text-gray-400">
          ≈ {ordinal(displayPct)} percentile — ahead of about {displayPct}% of the state on
          2023–2025 numbers.
          {result.display === "45+" && " That's top-2%-of-the-state territory."}
        </p>

        <div className="mt-4">
          <BellCurve score={result.score} display={result.display} />
        </div>

        {/* Sensitivity */}
        <div className="mt-5 rounded-xl bg-gray-50 dark:bg-gray-800/60 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            What moves your score
          </h3>
          <ul className="space-y-1.5">
            {result.sensitivity.map((s) => (
              <li
                key={s.input}
                className="flex items-center justify-between text-sm lg:text-base text-gray-600 dark:text-gray-300"
              >
                <span>+5% on {s.label}</span>
                <span
                  className={`font-semibold ${
                    s.delta > 0
                      ? "text-brand-600 dark:text-brand-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {s.delta > 0 ? `+${s.delta.toFixed(1)}` : "—"}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-lg border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950 p-3.5">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {strongest && cta
                ? cta.headline(strongest.label)
                : "You're already at the ceiling of this estimate — keep it sharp with practice"}
            </p>
            <Link
              href={`/try/vce/${subject}`}
              className="mt-2 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              {cta ? cta.action : "Practise real VCAA exams free on ATAR Hero"} →
            </Link>
          </div>
        </div>

        {/* Honesty footer */}
        <ul className="mt-5 space-y-1.5 text-xs lg:text-sm text-gray-400 dark:text-gray-500 leading-relaxed list-disc pl-4">
          {result.caveats.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>

        <button
          onClick={copyLink}
          className="mt-5 w-full rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm lg:text-base font-semibold text-gray-600 dark:text-gray-300 hover:border-brand-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          {copied ? "Link copied ✓" : "Copy link to this result"}
        </button>
      </div>
    </div>
  );
}
