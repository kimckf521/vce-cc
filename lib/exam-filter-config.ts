/**
 * Per-subject configuration for the "Exam" chips on the topic page.
 *
 * Each option maps a URL param value (e.g. `EXAM_1`) to a chip label and
 * the set of QuestionSetItem types it surfaces from the generated bank.
 * This lets each subject use chips that match its real VCAA paper layout:
 *
 *   - Methods / Specialist: Exam 1 = SHORT, Exam 2A = MCQ, Exam 2B = extended
 *   - General:              Exam 1 = MCQ,   Exam 2  = short + extended
 *   - Foundation:           Section A = short + MCQ, Section B = extended
 *
 * Used by:
 *   - components/TopicFilters.tsx (chip rendering)
 *   - components/TopicGuidanceChips.tsx ("Exam X focus" suggested links)
 *   - lib/question-set-groups.ts (filter → type mapping)
 */

export type QSIType = "MCQ" | "SHORT_ANSWER" | "EXTENDED_ANSWER" | "EXTENDED_RESPONSE";

export interface ExamFilterOption {
  /** URL param value (stable across releases — back-compat) */
  value: string;
  /** Chip label shown to students */
  label: string;
  /** QuestionSetItem types this option surfaces */
  types: QSIType[];
}

// Methods + Specialist share the same paper layout (Exam 1 short-answer
// tech-free + Exam 2 MCQ Section A + Exam 2 extended-response Section B).
const METHODS_STYLE: ExamFilterOption[] = [
  { value: "EXAM_1", label: "Exam 1", types: ["SHORT_ANSWER"] },
  { value: "EXAM_2_MC", label: "Exam 2A", types: ["MCQ"] },
  { value: "EXAM_2_B", label: "Exam 2B", types: ["EXTENDED_ANSWER", "EXTENDED_RESPONSE"] },
];

// General Mathematics — clean two-type split matching the real VCAA paper:
//   Exam 1 = 40 MCQ × 1 mark
//   Exam 2 = short-answer parts grouped into multi-part scenarios
// The bank reflects this exactly: every item is either MCQ or SHORT_ANSWER
// (any multi-part scenario was flattened into a single SHORT_ANSWER card
// with labelled parts inline — see scripts/migrate-general-flatten-to-short.ts).
const GENERAL_STYLE: ExamFilterOption[] = [
  { value: "EXAM_1", label: "Exam 1", types: ["MCQ"] },
  { value: "EXAM_2", label: "Exam 2", types: ["SHORT_ANSWER"] },
];

// Foundation Mathematics: single paper.
//   Section A = 20 multiple-choice (1 mark each), pure MCQ in the real VCAA paper.
//   Section B = multi-part questions where each part is a short answer (1-3 marks).
// We map SHORT_ANSWER drills under Section B since they exercise the short-answer
// part style; MCQ stays in Section A to match the real Section A format.
const FOUNDATION_STYLE: ExamFilterOption[] = [
  { value: "SECTION_A", label: "Section A", types: ["MCQ"] },
  { value: "SECTION_B", label: "Section B", types: ["SHORT_ANSWER", "EXTENDED_ANSWER", "EXTENDED_RESPONSE"] },
];

const BY_SUBJECT: Record<string, ExamFilterOption[]> = {
  "mathematical-methods": METHODS_STYLE,
  "vce-specialist": METHODS_STYLE,
  "vce-general": GENERAL_STYLE,
  "vce-foundation": FOUNDATION_STYLE,
};

export function getExamFilterOptions(subjectSlug?: string): ExamFilterOption[] {
  if (subjectSlug && BY_SUBJECT[subjectSlug]) return BY_SUBJECT[subjectSlug];
  return METHODS_STYLE; // safe default
}

/**
 * Comma-joined `exam` query value that represents "Exam 2 focus" — all
 * non-Exam-1 options selected. Used by the guidance chips.
 */
export function getExam2FocusValue(subjectSlug?: string): string {
  const opts = getExamFilterOptions(subjectSlug);
  return opts
    .filter((o) => !o.value.includes("EXAM_1") && !o.value.includes("SECTION_A"))
    .map((o) => o.value)
    .join(",");
}

/**
 * The single "Exam 1 focus" / "Section A focus" URL value.
 */
export function getExam1FocusValue(subjectSlug?: string): string {
  const opts = getExamFilterOptions(subjectSlug);
  const first = opts.find((o) => o.value.includes("EXAM_1") || o.value.includes("SECTION_A"));
  return first?.value ?? "EXAM_1";
}

/**
 * Whether a drill item is "calculator-free" for the question-card badge.
 *
 * Only Methods & Specialist have a technology-free exam (Exam 1 = SHORT_ANSWER);
 * its items are calculator-free, while MCQ (Exam 2A) and extended (Exam 2B)
 * belong to the calculator-active Exam 2. Foundation & General have no
 * technology-free exam → always false (their badge is omitted anyway).
 *
 * Driving the badge off question TYPE (exam section) keeps it consistent with
 * the Exam 1 / 2A / 2B filter, which is also type-based — so filtering "Exam 2"
 * never surfaces a "Calculator-free" question.
 */
export function isCalculatorFreeType(
  subjectSlug: string | undefined,
  type: QSIType,
): boolean {
  if (subjectSlug !== "mathematical-methods" && subjectSlug !== "vce-specialist") {
    return false;
  }
  const exam1 = getExamFilterOptions(subjectSlug).find((o) => o.value === "EXAM_1");
  return exam1?.types.includes(type) ?? false;
}
