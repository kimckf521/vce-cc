/**
 * Paper shape detection.
 *
 * `examType` does NOT tell you whether a paper has sections. Foundation Exam 1
 * is a genuine two-section paper (20 MCQ + 12 Section B groups) whose question
 * numbering RESTARTS between sections, so "2023 Foundation Exam 1 Q1" names two
 * different questions. Keying a section label off `examType === "EXAM_1"` left
 * 72 indexable, self-canonicalising URLs sharing byte-identical titles — the
 * exact duplicate pattern the section label exists to break.
 *
 * Detect from the paper's actual shape instead. Thresholds match the prev/next
 * neighbour navigation in the question page, which had this right all along:
 * a real Section A carries many MCQs, a real Section B several question groups.
 * Single-section papers (e.g. Specialist Exam 1, which interleaves standalone
 * and multi-part questions under ONE continuous numbering) fall through to no
 * section label, which is correct — nothing there needs disambiguating.
 */
export interface PaperRow {
  part: string | null;
  questionNumber: number;
}

export function isTwoSectionPaper(rows: PaperRow[]): boolean {
  const mcqCount = rows.filter((q) => q.part === null).length;
  const sectionBCount = new Set(
    rows.filter((q) => q.part !== null).map((q) => q.questionNumber)
  ).size;
  return mcqCount >= 10 && sectionBCount >= 2;
}

/**
 * The " Section A" / " Section B" suffix appended to a question's title, meta
 * description and h1. Empty on single-section papers. Deliberately a suffix
 * rather than fused into the exam label ("Exam 2A"): students search "exam 2",
 * and that substring has to survive intact.
 */
export function sectionSuffix(rows: PaperRow[], part: string | null): string {
  if (!isTwoSectionPaper(rows)) return "";
  return part === null ? " Section A" : " Section B";
}
