/**
 * Centralised exam configuration.
 *
 * Used by: PracticeSetupForm, practice/session/page.tsx, ExamModeWrapper, Exam2ABModeWrapper
 * All exam timing, question counts, and descriptions live here.
 */

export type ExamMode =
  | "exam1"
  | "exam2a"
  | "exam2b"
  | "exam2ab"
  // VCE General Mathematics — the full Exam 2 paper. Unlike Methods/Specialist
  // it has no Section A/B split; just ~15-18 multi-part extended-response
  // questions totalling 60 marks.
  | "exam2"
  | "exam"
  // VCE Foundation Mathematics section modes. Its single 80-mark paper splits
  // into Section A (20 marks) + Section B (60 marks), so students can drill
  // either section alone or sit the full paper via "exam".
  | "examA"
  | "examB";

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
 *
 * Methods-only — kept for back-compat. New callers should use
 * `vcaaTopicDistFor(subjectSlug)` which returns the right array length for
 * subjects with more/fewer topics (Specialist=6, General=5, Foundation=4).
 */
export const VCAA_TOPIC_DIST: [number, number, number, number] = [20, 30, 30, 20];

/**
 * Subject-aware VCAA topic distribution. Returns weights matching the order
 * of `topic.order` in the DB for each subject's topic list.
 *
 * Why this exists: `VCAA_TOPIC_DIST` is a 4-tuple that worked when ATAR Hero
 * was Methods-only. When Specialist (6 topics) and General (5 topics) shipped,
 * the form still sent 4 weights in Exam mode. The session picker maps weights
 * to topics by index, so Specialist's 5th + 6th topics (Functions, Space) and
 * General's 5th topic (Space) received weight 0 and never appeared in any
 * Exam-mode paper. This function returns the right length for each subject.
 *
 * Weights are tuned to recent VCAA past-paper averages by topic.
 */
export function vcaaTopicDistFor(subjectSlug: string | undefined): number[] {
  switch (subjectSlug) {
    case "vce-specialist":
      // Specialist topic order: Algebra (complex), Calculus, Stats,
      // Discrete (proofs), Functions (conics/rational), Space (vectors/mech).
      // VCAA weighting roughly: Algebra & Space ~20% each, Calculus ~25%,
      // Stats ~15%, Discrete & Functions ~10% each.
      return [20, 25, 15, 10, 10, 20];
    case "vce-general":
      // General topic order: Algebra (recursion/matrices), Data, Discrete
      // (networks), Functions, Space. VCAA weights: Algebra+Data dominant,
      // Discrete present, Functions/Space lighter.
      return [25, 25, 20, 15, 15];
    case "vce-foundation":
      // Foundation has 4 topics — even split is the safe default.
      return [25, 25, 25, 25];
    case "mathematical-methods":
    default:
      // Methods (4 topics) — keep the original tuple as the default.
      return [...VCAA_TOPIC_DIST];
  }
}

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
  // VCE General Mathematics Exam 2 — multi-part extended-response paper.
  // ~15-18 multi-part questions, 60 marks, 1 hour 30 min including reading.
  // CAS calculator permitted throughout. No MCQ section (unlike Methods/
  // Specialist Exam 2 which splits into Section A multiple-choice + B extended).
  exam2: {
    examCount: 10,
    examCountRange: [9, 12],
    freedomMin: 5,
    freedomMax: 60,
    freedomStep: 5,
    freedomDefault: 10,
    examDescription:
      "Extended-response questions totalling 60 marks — matches the full VCE General Mathematics Exam 2 paper.",
    readingSeconds: 15 * 60,
    writingSeconds: 90 * 60,
    timerDescription: "15 min reading + 1.5 hour writing (matches VCE General Exam 2)",
    calculatorAllowed: true,
  },
  // VCE Foundation Mathematics — single end-of-year examination. Section A
  // (20 MCQ · 20 marks) + Section B (12 multi-part extended-answer questions
  // · 60 marks), scientific calculator permitted throughout. Total 80 marks
  // across 32 questions, 2 hour writing time. The "exam" mode assembles BOTH
  // sections (the full paper); examA / examB below drill a single section.
  exam: {
    examCount: 32,
    freedomMin: 5,
    freedomMax: 60,
    freedomStep: 5,
    freedomDefault: 15,
    examDescription:
      "Full VCE Foundation Mathematics paper — Section A (20 MCQ · 20 marks) + Section B (12 multi-part questions · 60 marks). 80 marks total.",
    readingSeconds: 15 * 60,
    writingSeconds: 2 * 60 * 60,
    timerDescription: "15 min reading + 2 hour writing (matches the VCE Foundation Mathematics paper)",
    calculatorAllowed: true,
  },
  // Foundation Section A — 20 multiple-choice questions, 1 mark each (20 marks).
  examA: {
    examCount: 20,
    freedomMin: 5,
    freedomMax: 30,
    freedomStep: 5,
    freedomDefault: 10,
    examDescription:
      "20 multiple-choice questions at 1 mark each — matches Section A of the VCE Foundation Mathematics paper.",
    readingSeconds: 15 * 60,
    writingSeconds: 30 * 60,
    timerDescription:
      "15 min reading + 30 min writing (Section A's share of the 2-hour Foundation paper)",
    calculatorAllowed: true,
  },
  // Foundation Section B — 12 multi-part extended-answer questions, 60 marks total.
  examB: {
    examCount: 12,
    freedomMin: 5,
    freedomMax: 30,
    freedomStep: 5,
    freedomDefault: 5,
    examDescription:
      "12 multi-part extended-answer questions totalling 60 marks — matches Section B of the VCE Foundation Mathematics paper.",
    readingSeconds: 15 * 60,
    writingSeconds: 90 * 60,
    timerDescription:
      "15 min reading + 1.5 hour writing (Section B's share of the 2-hour Foundation paper)",
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
