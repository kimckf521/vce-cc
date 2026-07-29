import { VCE_EXAM_DATES } from "@/lib/exam-config";
import { SUBJECTS, getSubjectMetadata } from "@/lib/subject-context";

/**
 * Pure date/formatting helpers for the public exam-countdown tool.
 *
 * Shared by the server page (SEO shell, FAQ copy) and the client components
 * (live ticking hero, embed widget), so everything here must stay
 * framework-free and importable from both sides.
 *
 * All day maths mirrors components/ExamCountdown.tsx (the internal strip):
 * Melbourne-local calendar dates via the Intl en-CA technique, so counts flip
 * at Melbourne midnight regardless of the server's or visitor's timezone.
 */

/* ── Cached formatters (constructing Intl.DateTimeFormat is expensive; the
      client ticks every second) ─────────────────────────────────────────── */

const MELBOURNE_DAY_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Australia/Melbourne",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const SHORT_DATE_FMT = new Intl.DateTimeFormat("en-AU", {
  timeZone: "UTC",
  weekday: "short",
  day: "numeric",
  month: "short",
});

const FULL_DATE_FMT = new Intl.DateTimeFormat("en-AU", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** The given instant's date as YYYY-MM-DD in Australia/Melbourne. */
export function melbourneDateISOAt(epochMs: number): string {
  // en-CA locale formats as YYYY-MM-DD, which sorts/parses cleanly.
  return MELBOURNE_DAY_FMT.format(new Date(epochMs));
}

/** Whole calendar days from one YYYY-MM-DD to another (both Melbourne-local). */
export function daysBetweenISO(fromISO: string, toISO: string): number {
  return Math.round(
    (Date.parse(`${toISO}T00:00:00Z`) - Date.parse(`${fromISO}T00:00:00Z`)) /
      86_400_000,
  );
}

/** "Thu 5 Nov" — built from parts so no locale sneaks a comma in. */
export function examDatePhrase(dateISO: string): string {
  // The ISO date is already Melbourne-local; format at UTC noon so no
  // timezone shift can move it across midnight.
  const parts = SHORT_DATE_FMT.formatToParts(new Date(`${dateISO}T12:00:00Z`));
  const get = (t: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === t)?.value ?? "";
  return `${get("weekday")} ${get("day")} ${get("month")}`;
}

/** "Thursday 5 November 2026" — for FAQ answers and structured data. */
export function examDateFull(dateISO: string): string {
  const parts = FULL_DATE_FMT.formatToParts(new Date(`${dateISO}T12:00:00Z`));
  const get = (t: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === t)?.value ?? "";
  return `${get("weekday")} ${get("day")} ${get("month")} ${get("year")}`;
}

/**
 * "about 13 weekends" tail, or null under a week — any 7+ day span really
 * does contain a weekend, whereas "about 1 weekend" over Mon–Fri would lie.
 */
export function weekendsPhrase(days: number): string | null {
  if (days < 7) return null;
  const weekends = Math.round(days / 7);
  return `about ${weekends} ${weekends === 1 ? "weekend" : "weekends"}`;
}

/**
 * Rough "enough time for N practice papers" estimate — one full paper every
 * three days is a sustainable, non-crammy pace.
 */
export function practicePapersEstimate(days: number): number {
  return Math.max(1, Math.floor(days / 3));
}

/* ── Sitting-time parsing ────────────────────────────────────────────────── */

/**
 * Parses one clock segment of a VCAA sitting range — "9:00", "10.15 am",
 * "2:00 pm" — into a wall-clock hour/minute. When the segment carries no
 * am/pm marker of its own, the range's trailing marker applies
 * ("2:00–3:45 pm" starts at 2:00 PM). Returns null when the segment doesn't
 * look like a time.
 */
function parseClockSegment(
  segment: string,
  fullRange: string,
): { hour: number; minute: number } | null {
  const match = segment.match(/(\d{1,2})[:.](\d{2})/); // VCAA prints ":" or "."
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const meridiem = /pm/i.test(segment)
    ? "pm"
    : /am/i.test(segment)
      ? "am"
      : /pm/i.test(fullRange)
        ? "pm"
        : "am";
  if (meridiem === "pm" && hour !== 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

/**
 * Start of a VCAA timetable sitting string — "9:00–10.15 am",
 * "11:45 am–2:00 pm", "2:00–3:45 pm" — as a Melbourne wall-clock
 * hour/minute. Returns null when the string doesn't look like a time
 * (countdown falls back to midnight, i.e. date-only).
 */
export function parseSittingStart(
  time: string | null,
): { hour: number; minute: number } | null {
  if (!time) return null;
  const [startRaw] = time.split(/[–—-]/); // VCAA uses an en dash
  return parseClockSegment(startRaw, time);
}

/**
 * End of a VCAA timetable sitting string ("9:00–10.15 am" ends 10:15 AM).
 * Returns null when the string has no parseable end — callers fall back to
 * the start, i.e. "no known end".
 */
export function parseSittingEnd(
  time: string | null,
): { hour: number; minute: number } | null {
  if (!time) return null;
  const segments = time.split(/[–—-]/);
  if (segments.length < 2) return null;
  return parseClockSegment(segments[segments.length - 1], time);
}

/** Melbourne's UTC offset at the given instant, e.g. "+11:00" (AEDT). */
function melbourneOffsetAt(epochMs: number): string {
  try {
    const name = new Intl.DateTimeFormat("en-US", {
      timeZone: "Australia/Melbourne",
      timeZoneName: "longOffset",
    })
      .formatToParts(new Date(epochMs))
      .find((p) => p.type === "timeZoneName")?.value; // "GMT+11:00"
    const m = name?.match(/([+-])(\d{1,2}):(\d{2})/);
    if (m) return `${m[1]}${m[2].padStart(2, "0")}:${m[3]}`;
  } catch {
    // Older Intl without longOffset — fall through to the AEDT default.
  }
  // The VCE written-exam period (late Oct–Nov) is always after daylight
  // saving starts, so AEDT is the safe default.
  return "+11:00";
}

/**
 * Epoch (ms) of a Melbourne wall-clock time on the given date. Guesses AEDT
 * first, then confirms against the real Melbourne offset at that instant so
 * a hypothetical pre-DST date still resolves correctly.
 */
function melbourneEpochMs(dateISO: string, hour: number, minute: number): number {
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  const guess = Date.parse(`${dateISO}T${hh}:${mm}:00+11:00`);
  const offset = melbourneOffsetAt(guess);
  return offset === "+11:00"
    ? guess
    : Date.parse(`${dateISO}T${hh}:${mm}:00${offset}`);
}

/**
 * Epoch (ms) of the exam's sitting start in Melbourne local time. Falls back
 * to Melbourne midnight of the exam date when no sitting time is published.
 */
export function examStartEpochMs(dateISO: string, time: string | null): number {
  const start = parseSittingStart(time) ?? { hour: 0, minute: 0 };
  return melbourneEpochMs(dateISO, start.hour, start.minute);
}

/**
 * Epoch (ms) of the exam's sitting end in Melbourne local time. Falls back
 * to the sitting START when no end is parseable, so callers can detect
 * "no known end" via `endEpochMs === startEpochMs` and keep date-based
 * behaviour instead of dropping the exam at midnight.
 */
export function examEndEpochMs(dateISO: string, time: string | null): number {
  const end = parseSittingEnd(time);
  return end
    ? melbourneEpochMs(dateISO, end.hour, end.minute)
    : examStartEpochMs(dateISO, time);
}

/* ── Exam list assembly ──────────────────────────────────────────────────── */

/**
 * One subject exam, fully pre-formatted and JSON-serialisable so the server
 * page can hand the whole list straight to client components as props.
 */
export interface CountdownExam {
  subjectSlug: string;
  /** "Methods" */
  subjectShort: string;
  /** "VCE Mathematical Methods" */
  subjectDisplay: string;
  /** Single-letter badge, e.g. "M". */
  badge: string;
  /** Tailwind classes for the badge chip, e.g. "bg-violet-500 text-white". */
  badgeClass: string;
  /** "Exam 1" / "Exam 2" / "Exam". */
  label: string;
  /** YYYY-MM-DD, Melbourne-local. */
  dateISO: string;
  /** "Thu 5 Nov". */
  datePhrase: string;
  /** "Thursday 5 November 2026". */
  dateFull: string;
  /** Sitting time as printed on the VCAA timetable, or null if unpublished. */
  time: string | null;
  /** Epoch ms of the sitting start (Melbourne midnight if no time). */
  startEpochMs: number;
  /** Epoch ms of the sitting end (=== startEpochMs when no end is known). */
  endEpochMs: number;
}

/**
 * Whether an exam sitting is over, given the live day count (from
 * `daysBetweenISO(todayISO, exam.dateISO)`) and the current epoch ms.
 *
 * An exam is over when its Melbourne date has passed (`days < 0`), or —
 * for same-day exams with a published sitting end — once the clock passes
 * pens-down, so "underway" doesn't linger until midnight. Exams with no
 * parsed end (endEpochMs === startEpochMs, e.g. date-only entries) keep
 * pure date-based behaviour.
 *
 * This is THE end-of-sitting rule shared by CountdownLive.tsx and
 * components/HomeCountdownStrip.tsx; change it here so the homepage strip
 * and the tools page always agree on which exam is next.
 */
export function isExamOver(
  exam: Pick<CountdownExam, "startEpochMs" | "endEpochMs"> & { days: number },
  nowMs: number,
): boolean {
  return (
    exam.days < 0 ||
    (exam.endEpochMs > exam.startEpochMs && nowMs > exam.endEpochMs)
  );
}

/**
 * Every published subject exam from VCE_EXAM_DATES, soonest first. Null
 * (unpublished) dates and unknown slugs drop out; past exams are NOT
 * filtered here — the client filters against live "now" so cards hide
 * themselves the moment their date passes.
 */
export function buildCountdownExams(): CountdownExam[] {
  return SUBJECTS.flatMap((subject) => {
    const meta = getSubjectMetadata(subject.urlSlug);
    if (!meta) return [];
    return (VCE_EXAM_DATES[subject.urlSlug] ?? [])
      .filter((e): e is typeof e & { date: string } => e.date !== null)
      .map((e) => ({
        subjectSlug: subject.urlSlug as string,
        subjectShort: meta.shortName,
        subjectDisplay: meta.displayName,
        badge: meta.badge,
        badgeClass: meta.colors.badge,
        label: e.label,
        dateISO: e.date,
        datePhrase: examDatePhrase(e.date),
        dateFull: examDateFull(e.date),
        time: e.time,
        startEpochMs: examStartEpochMs(e.date, e.time),
        endEpochMs: examEndEpochMs(e.date, e.time),
      }));
  }).sort((a, b) => a.startEpochMs - b.startEpochMs);
}
