/**
 * Centralised exam configuration.
 *
 * Used by: PracticeSetupForm, practice/session/page.tsx, ExamModeWrapper, Exam2ABModeWrapper
 * All exam timing, question counts, and descriptions live here.
 */

export type ExamMode = "exam1" | "exam2a" | "exam2b" | "exam2ab";

/**
 * Topic weights reflecting recent VCAA Mathematical Methods averages across
 * Exam 1 + Exam 2 (rounded). Exam Version uses these as fixed defaults so
 * the simulation matches what a real paper actually covers rather than
 * letting students dial themselves away from their weaker topics.
 *
 * Order matches the 4 VCE topics in `lib/topics-config.ts`:
 *   [0] Algebra, Number, and Structure
 *   [1] Functions, Relations, and Graphs
 *   [2] Calculus
 *   [3] Data Analysis, Probability, and Statistics
 */
export const VCAA_TOPIC_DIST: [number, number, number, number] = [20, 30, 30, 20];

/**
 * Difficulty spread typical of real VCAA Math Methods papers — medium-heavy
 * with a meaningful chunk of hard questions for top-ATAR discrimination.
 * Order: [easy, medium, hard].
 */
export const VCAA_DIFFICULTY_DIST: [number, number, number] = [25, 55, 20];

export interface ExamModeConfig {
  /** Number of questions in a standard exam */
  examCount: number;
  /** For modes with variable question counts (e.g. Exam 1 can be 8 or 9) */
  examCountRange?: [number, number];
  /** Freedom mode: min questions */
  freedomMin: number;
  /** Freedom mode: max questions */
  freedomMax: number;
  /** Freedom mode: step size for the counter */
  freedomStep: number;
  /** Freedom mode: default question count */
  freedomDefault: number;
  /** Human-readable description of the exam format */
  examDescription: string;
  /** Reading time in seconds */
  readingSeconds: number;
  /** Writing time in seconds */
  writingSeconds: number;
  /** Human-readable timer description */
  timerDescription: string;
  /** Whether a CAS calculator is allowed */
  calculatorAllowed: boolean;
}

export const EXAM_CONFIG: Record<ExamMode, ExamModeConfig> = {
  exam1: {
    examCount: 9,
    examCountRange: [8, 9],
    freedomMin: 5,
    freedomMax: 40,
    freedomStep: 5,
    freedomDefault: 10,
    examDescription:
      "Short-answer questions totalling 40 marks — matches the real VCE Exam 1.",
    readingSeconds: 15 * 60,
    writingSeconds: 60 * 60,
    timerDescription: "15 min reading time + 1 hour writing time (matches VCE Exam 1)",
    calculatorAllowed: false,
  },
  exam2a: {
    examCount: 20,
    freedomMin: 10,
    freedomMax: 100,
    freedomStep: 5,
    freedomDefault: 20,
    examDescription:
      "20 multiple-choice questions worth 20 marks (1 mark each) — matches Section A of VCE Exam 2.",
    readingSeconds: 15 * 60,
    writingSeconds: 30 * 60,
    timerDescription:
      "15 min reading + 30 min writing (Section A's share of the 2-hour Exam 2 budget)",
    calculatorAllowed: true,
  },
  exam2b: {
    examCount: 5,
    examCountRange: [4, 5],
    freedomMin: 10,
    freedomMax: 100,
    freedomStep: 5,
    freedomDefault: 10,
    examDescription:
      "Extended-response questions totalling 60 marks — matches Section B of VCE Exam 2.",
    readingSeconds: 15 * 60,
    writingSeconds: 90 * 60,
    timerDescription:
      "15 min reading + 1.5 hour writing (Section B's share of the 2-hour Exam 2 budget)",
    calculatorAllowed: true,
  },
  exam2ab: {
    examCount: 25,
    freedomMin: 10,
    freedomMax: 100,
    freedomStep: 5,
    freedomDefault: 25,
    examDescription:
      "Full VCE Exam 2: Section A (20 MCQ · 20 marks) + Section B (extended response · 60 marks). 80 marks total.",
    readingSeconds: 15 * 60,
    writingSeconds: 2 * 60 * 60,
    timerDescription: "15 min reading + 2 hour writing (matches VCE Exam 2)",
    calculatorAllowed: true,
  },
};

/**
 * Returns a random exam count from the range (if defined), or the fixed count.
 */
export function getExamQuestionCount(mode: ExamMode): number {
  const cfg = EXAM_CONFIG[mode];
  if (cfg.examCountRange) {
    const [min, max] = cfg.examCountRange;
    return min + Math.floor(Math.random() * (max - min + 1));
  }
  return cfg.examCount;
}
