import { CalendarDays } from "lucide-react";
import { VCE_EXAM_DATES } from "@/lib/exam-config";
import { getSubjectMetadata } from "@/lib/subject-context";

/**
 * Exam countdown strip — a single calm line showing the nearest upcoming
 * VCAA written exam across the given subjects, e.g.
 * "Methods Exam 1 · 94 days — about 13 weekends".
 *
 * Tone is deliberately supportive, never alarmist: no red, no "ONLY X days
 * left". Renders nothing when no dates are published (null in
 * VCE_EXAM_DATES) or every date has passed, so callers can include it
 * unconditionally.
 *
 * All day maths is done in Australia/Melbourne local dates — where the
 * exams are actually sat — so the count flips at Melbourne midnight
 * regardless of server timezone.
 */

/** Today's date as YYYY-MM-DD in Australia/Melbourne. */
function melbourneTodayISO(): string {
  // en-CA locale formats as YYYY-MM-DD, which sorts/parses cleanly.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Melbourne",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Whole calendar days from one YYYY-MM-DD to another (both Melbourne-local). */
function daysBetweenISO(fromISO: string, toISO: string): number {
  return Math.round(
    (Date.parse(`${toISO}T00:00:00Z`) - Date.parse(`${fromISO}T00:00:00Z`)) /
      86_400_000,
  );
}

/** "Thu 5 Nov" — the exam's calendar date, formatted for Melbourne. */
function examDatePhrase(dateISO: string): string {
  // The ISO date is already Melbourne-local; format at UTC noon so no
  // timezone shift can move it across midnight.
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${dateISO}T12:00:00Z`));
}

/** "94 days — about 13 weekends", "5 days", "tomorrow", "today". */
function countdownPhrase(days: number): string {
  if (days === 0) return "today — you've prepared for this";
  if (days === 1) return "tomorrow — rest up tonight";
  // Only mention weekends from a week out: any 7+ day span really does
  // contain one, whereas "about 1 weekend" over e.g. Mon–Fri would be wrong.
  if (days < 7) return `${days} days`;
  const weekends = Math.round(days / 7);
  return `${days} days — about ${weekends} ${weekends === 1 ? "weekend" : "weekends"}`;
}

export default function ExamCountdown({ subjects }: { subjects: string[] }) {
  const todayISO = melbourneTodayISO();

  // Every published, not-yet-passed exam across the requested subjects,
  // soonest first. Unknown slugs and null (unpublished) dates drop out.
  const upcoming = subjects
    .flatMap((slug) => {
      const meta = getSubjectMetadata(slug);
      return (VCE_EXAM_DATES[slug] ?? [])
        .filter((e) => e.date !== null)
        .map((e) => ({
          label: `${meta?.shortName ?? slug} ${e.label}`,
          days: daysBetweenISO(todayISO, e.date as string),
          dateISO: e.date as string,
          time: e.time,
        }));
    })
    .filter((e) => e.days >= 0)
    .sort((a, b) => a.days - b.days);

  if (upcoming.length === 0) return null;

  const next = upcoming[0];
  const after = upcoming[1];

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950">
        <CalendarDays className="h-4 w-4 text-brand-600 dark:text-brand-400" />
      </div>
      <div className="min-w-0">
        {/* Wrap freely on phones (truncating clips the "— about N weekends" /
            "you've prepared for this" copy mid-word); single clipped line only
            from sm: up, where the quiet "then" tail can run long. */}
        <p className="sm:truncate text-sm text-gray-600 dark:text-gray-300">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {next.label}
          </span>
          {" · "}
          {countdownPhrase(next.days)}
          {/* Second-soonest exam as a quiet tail — desktop only, mobile keeps one clean line */}
          {after && (
            <span className="hidden sm:inline text-gray-400 dark:text-gray-500">
              {" · then "}
              {after.label}{" "}
              {after.days === 0
                ? "today"
                : after.days === 1
                  ? "tomorrow"
                  : `in ${after.days} days`}
            </span>
          )}
        </p>
        {/* Exact sitting details from the VCAA timetable — quiet second line
            so the countdown stays the headline. Time may be null (timetable
            not yet published); the date always renders. */}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {examDatePhrase(next.dateISO)}
          {next.time && ` · ${next.time}`}
        </p>
      </div>
    </div>
  );
}
