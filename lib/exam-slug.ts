/**
 * Keyword slugs for public exam URLs.
 *
 * Public past-paper pages live at `/[curriculum]/[subject]/exams/[id]`. The
 * `id` segment accepts two shapes:
 *
 *   - keyword slug `2023-exam-1` (canonical) — matches the query shape
 *     students actually search ("vce methods exam 1 2023"), reads well in
 *     SERPs, and stays stable across DB reseeds
 *   - legacy cuid — 308-redirected to the slug URL by the page itself
 *     (the mapping needs a DB lookup, so it can't live in next.config)
 *
 * An exam is uniquely identified by (subject, year, examType), which is why
 * the slug doesn't need the cuid.
 */

export type ExamTypeSlug = { year: number; examType: "EXAM_1" | "EXAM_2" };

export function examSlug(exam: { year: number; examType: string }): string {
  return `${exam.year}-${exam.examType === "EXAM_1" ? "exam-1" : "exam-2"}`;
}

export function parseExamSlug(slug: string): ExamTypeSlug | null {
  const m = slug.match(/^(\d{4})-exam-([12])$/);
  if (!m) return null;
  return { year: Number(m[1]), examType: m[2] === "1" ? "EXAM_1" : "EXAM_2" };
}
