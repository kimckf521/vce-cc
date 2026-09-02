/**
 * Shared date helpers for the VCAA written-exam schedule.
 *
 * Extracted from components/ExamCountdown.tsx so the countdown strip and the
 * upcoming-exam page state agree on what "today" and "how many days" mean.
 * Two copies of this arithmetic would drift, and a countdown that disagrees
 * with the page beside it reads as broken.
 *
 * All day maths is done in Australia/Melbourne local dates — where the exams
 * are actually sat — so counts flip at Melbourne midnight regardless of the
 * server's timezone.
 */
import { VCE_EXAM_DATES, type SubjectExamDate } from "@/lib/exam-config";

/** Today's date as YYYY-MM-DD in Australia/Melbourne. */
export function melbourneTodayISO(): string {
  // en-CA locale formats as YYYY-MM-DD, which sorts/parses cleanly.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Melbourne",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Whole calendar days from one YYYY-MM-DD to another (both Melbourne-local). */
export function daysBetweenISO(fromISO: string, toISO: string): number {
  return Math.round(
    (Date.parse(`${toISO}T00:00:00Z`) - Date.parse(`${fromISO}T00:00:00Z`)) / 86_400_000
  );
}

/** "Thu 5 Nov" — the exam's calendar date, formatted for Melbourne. */
export function examDatePhrase(dateISO: string): string {
  // The ISO date is already Melbourne-local; format at UTC noon so no timezone
  // shift can move it across midnight.
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${dateISO}T12:00:00Z`));
}

/** "Thursday 5 November 2026" — long form, for the upcoming-exam page. */
export function examDateLongPhrase(dateISO: string): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateISO}T12:00:00Z`));
}

/**
 * The scheduled sitting for one paper, or null when VCAA has published no date
 * for it.
 *
 * VCE_EXAM_DATES is keyed by URL subject slug and ordered Exam 1 then Exam 2.
 * Foundation sits a SINGLE paper — one entry labelled "Exam" — and the DB
 * stores it as EXAM_1 (verified: all three Foundation exam rows are EXAM_1), so
 * a single-entry list answers only for EXAM_1 and returns null for EXAM_2
 * rather than mislabelling the one paper as "Exam 2".
 */
export function scheduledExamDate(
  subjectUrlSlug: string,
  examType: "EXAM_1" | "EXAM_2"
): SubjectExamDate | null {
  const sittings = VCE_EXAM_DATES[subjectUrlSlug];
  if (!sittings || sittings.length === 0) return null;
  if (sittings.length === 1) return examType === "EXAM_1" ? sittings[0] : null;
  return sittings[examType === "EXAM_1" ? 0 : 1] ?? null;
}

/**
 * VCAA does not publish an exam paper on the day it is sat. Measured from the
 * PDFs VCAA actually served: the 2025 Methods Exam 1 paper carries a
 * last-modified of 10 Nov 2025 for a 5 Nov exam (T+5 days), and the 2024 paper
 * T+9 days. So a page promising worked solutions must promise them for roughly
 * a week out, not for the afternoon — and must not imply otherwise.
 */
export const VCAA_PAPER_RELEASE_LAG_DAYS = 7;
