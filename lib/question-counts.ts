/**
 * Shared question-counting utilities.
 *
 * Used by: dashboard/page.tsx, profile/page.tsx
 * These compute group counts (MCQs standalone, Section B deduped by examId+questionNumber).
 */

interface BaseQuestion {
  examId: string;
  questionNumber: number;
  part: string | null;
}

interface QuestionWithAttempts extends BaseQuestion {
  attempts: { status: string }[];
}

/**
 * Count question groups: MCQs are standalone, Section B questions are
 * deduplicated by (examId, questionNumber) so each group counts once.
 */
export function computeGroupCount(questions: BaseQuestion[]): number {
  const mcqCount = questions.filter((q) => q.part === null).length;
  const sectionBKeys = new Set(
    questions.filter((q) => q.part !== null).map((q) => `${q.examId}-${q.questionNumber}`)
  );
  return mcqCount + sectionBKeys.size;
}

/**
 * Count attempted and correct groups from questions with attempt data.
 * Returns both counts for use in progress displays.
 */
export function computeAttemptedGroups(
  questions: QuestionWithAttempts[]
): { attempted: number; correct: number } {
  // MCQs
  const attemptedMcqs = questions.filter((q) => q.part === null && q.attempts.length > 0);
  const correctMcqs = attemptedMcqs.filter((q) =>
    q.attempts.some((a) => a.status === "CORRECT")
  );

  // Section B: group key → aggregated statuses
  const sectionBMap = new Map<string, string[]>();
  for (const q of questions.filter((q) => q.part !== null && q.attempts.length > 0)) {
    const key = `${q.examId}-${q.questionNumber}`;
    sectionBMap.set(key, [...(sectionBMap.get(key) ?? []), ...q.attempts.map((a) => a.status)]);
  }

  const sectionBAttempted = sectionBMap.size;
  const sectionBCorrect = Array.from(sectionBMap.values()).filter((statuses) =>
    statuses.some((s) => s === "CORRECT")
  ).length;

  return {
    attempted: attemptedMcqs.length + sectionBAttempted,
    correct: correctMcqs.length + sectionBCorrect,
  };
}
