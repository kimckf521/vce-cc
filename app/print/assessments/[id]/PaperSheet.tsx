import MathContent from "@/components/MathContent";
import type {
  AssessmentDetail,
  AssessmentItemPart,
  AssessmentItemView,
} from "@/lib/teacher-assessments";

/**
 * Presentational print views for one assessment — the student paper and the
 * marking guide share this file so headers, numbering, and part labelling
 * can never drift apart. Server components throughout; only MathContent
 * (KaTeX) hydrates on the client. All styling lives in ./print.css.
 *
 * data-chunk CONTRACT (consumed by PaginatedSheet.tsx): every piece of
 * visible sheet content must live inside exactly ONE data-chunk element —
 * chunks are the atomic units the page-preview paginator packs onto A4 page
 * cards, and they mirror the blocks print already refuses to break inside
 * (.avoid-break). Wrapper elements (question-block sections, .subparts, the
 * guide-solution rail) may CONTAIN chunks but are never chunks themselves —
 * the paginator reconstructs them per page. Never nest one data-chunk inside
 * another, and never add sheet content outside a chunk: the paginator
 * verifies both at runtime and falls back to the continuous sheet if the
 * contract breaks. The guide's per-part solutions are one chunk each even
 * though print may break inside them — the preview renders an over-tall
 * chunk on its own grown page with an honesty caption instead of guessing
 * where the browser would split.
 */

/** One numbered slot on the paper, in item order (built in page.tsx). */
export type PrintSlot =
  | { kind: "item"; order: number; item: AssessmentItemView }
  | { kind: "vcaa"; order: number; marks: number };

// ---------- answer-space sizing (paper variant) ----------

/** Working room scales with the mark allocation, VCAA-style. */
const ANSWER_SPACE_MM_PER_MARK = 22;
/** Zero/unrecorded marks still deserve room to write. */
const MIN_ANSWER_SPACE_MM = 30;
/** Big extended questions cap out rather than eating whole pages. */
const MAX_ANSWER_SPACE_MM = 120;
/**
 * The space renders as ruled lines, one per this many mm — real bordered rows
 * rather than a background image, because browsers skip backgrounds when
 * printing by default but always print borders.
 */
const ANSWER_LINE_SPACING_MM = 10;

function answerLineCount(marks: number): number {
  const mm = Math.min(
    MAX_ANSWER_SPACE_MM,
    Math.max(MIN_ANSWER_SPACE_MM, marks * ANSWER_SPACE_MM_PER_MARK)
  );
  return Math.round(mm / ANSWER_LINE_SPACING_MM);
}

// ---------- shared helpers ----------

// Lifted VERBATIM from app/(app)/teacher/assessments/[id]/ItemCard.tsx (which
// mirrors SUBPART_LABEL_SOURCE in lib/paper-assembler.ts). The editor and the
// print views must extract the same stem from parts-items; ItemCard is a
// client module that doesn't export the helper, so the print route carries
// its own copy — keep the two in sync.
const FIRST_PART_LABEL_RE =
  /(?:^|\s)(?:\*\*\s*\(?a\)?[.)]?\s*\*\*|\(a\)|a[.)])\s+/;

/**
 * Multi-part items duplicate their entire sub-part text inside the flat
 * `content` column, while the shared question stem lives ONLY in content's
 * opening line. When parts render structurally, the flat content must
 * contribute just that stem — rendering it whole prints every question twice.
 */
function stemBeforeParts(content: string): string {
  const m = content.match(FIRST_PART_LABEL_RE);
  return (m ? content.slice(0, m.index) : content).trim();
}

/** item.parts minus the empty-array case (mirrors itemMeta's asParts). */
function nonEmptyParts(item: AssessmentItemView): AssessmentItemPart[] | null {
  return item.parts && item.parts.length > 0 ? item.parts : null;
}

function marksLabel(marks: number): string {
  return `(${marks} mark${marks === 1 ? "" : "s"})`;
}

/** settings.tech drives the standard exam-conditions line. */
function techLine(settings: AssessmentDetail["settings"]): string {
  return settings?.tech === "TECH_FREE"
    ? "Technology-free: no CAS calculator or notes permitted."
    : "CAS calculator permitted.";
}

// ---------- shared building blocks ----------

function QuestionHeading({ number, marks }: { number: number; marks: number }) {
  return (
    <header className="question-heading">
      <span>Question {number}</span>
      <span className="question-marks">{marksLabel(marks)}</span>
    </header>
  );
}

function PartLabel({ label, marks }: { label: string; marks: number }) {
  return (
    <p className="part-label">
      <strong>{label}.</strong>{" "}
      {marks > 0 && <span className="part-marks">{marksLabel(marks)}</span>}
    </p>
  );
}

/** Ruled answer space sized by marks (paper variant only). */
function AnswerSpace({ marks }: { marks: number }) {
  return (
    <div className="answer-lines" aria-hidden="true">
      {Array.from({ length: answerLineCount(marks) }, (_, i) => (
        <div key={i} className="answer-line" />
      ))}
    </div>
  );
}

/**
 * COPYRIGHT GATE (dormant but mandatory): reserved AssessmentItem.questionId
 * rows are VCAA past-exam questions. Their content is never fetched by this
 * route (see page.tsx) and must never be reproduced on a printable paper —
 * we render a reference notice in the question's numbered slot instead.
 */
function VcaaNotice({ number, marks }: { number: number; marks: number }) {
  return (
    <section className="question-block avoid-break" data-chunk="">
      <header className="question-heading">
        <span>Question {number}</span>
        {marks > 0 && <span className="question-marks">{marksLabel(marks)}</span>}
      </header>
      <div className="vcaa-box">
        <p>
          Question {number} is a VCAA past-exam question. For copyright reasons
          it isn&apos;t printed here — practise it free at atarhero.com.au.
        </p>
      </div>
    </section>
  );
}

// ---------- student paper ----------

/** MCQ options with hollow bubbles. The correct option is NEVER marked here. */
function McqBubbleOptions({
  options,
}: {
  options: NonNullable<AssessmentItemView["options"]>;
}) {
  return (
    <div className="mcq-options">
      {(["A", "B", "C", "D"] as const).map((letter) => (
        <div key={letter} className="mcq-option">
          <span className="mcq-bubble" aria-hidden="true" />
          <span className="mcq-letter">{letter}.</span>
          <div className="mcq-option-body">
            <MathContent content={options[letter]} />
          </div>
        </div>
      ))}
    </div>
  );
}

function PaperPart({ part }: { part: AssessmentItemPart }) {
  const subs = part.subParts && part.subParts.length > 0 ? part.subParts : null;
  if (!subs) {
    return (
      <div className="question-part avoid-break" data-chunk="">
        <PartLabel label={part.label} marks={part.marks} />
        {part.content && <MathContent content={part.content} />}
        {/* Unrecorded marks still get space — sizing clamps to the minimum. */}
        <AnswerSpace marks={part.marks ?? 0} />
      </div>
    );
  }
  // Sub-parts each carry their own marks + answer space; the paper may break
  // between them, so only the part's own label/content stays atomic.
  return (
    <div className="question-part">
      <div className="avoid-break" data-chunk="">
        <PartLabel label={part.label} marks={part.marks} />
        {part.content && <MathContent content={part.content} />}
      </div>
      <div className="subparts">
        {subs.map((sub) => (
          <div key={sub.label} className="question-part avoid-break" data-chunk="">
            <PartLabel label={sub.label} marks={sub.marks} />
            {sub.content && <MathContent content={sub.content} />}
            <AnswerSpace marks={sub.marks ?? 0} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PaperQuestion({
  number,
  item,
}: {
  number: number;
  item: AssessmentItemView;
}) {
  const parts = nonEmptyParts(item);
  const stem = parts ? stemBeforeParts(item.content) : item.content;

  const intro = (
    <>
      <QuestionHeading number={number} marks={item.marks} />
      {item.preamble && (
        <div className="question-preamble">
          <MathContent content={item.preamble} />
        </div>
      )}
      {stem && <MathContent content={stem} />}
    </>
  );

  if (!parts) {
    // Single-part question: keep the whole block on one page. MCQs get
    // bubbled options and NO answer space; everything else gets ruled lines
    // sized by the item's marks.
    return (
      <section className="question-block avoid-break" data-chunk="">
        {intro}
        {item.options ? (
          <McqBubbleOptions options={item.options} />
        ) : (
          <AnswerSpace marks={item.marks} />
        )}
      </section>
    );
  }

  // Multi-part question: the intro stays together, but long questions may
  // break BETWEEN parts — each part/sub-part is its own unbreakable chunk.
  return (
    <section className="question-block">
      <div className="avoid-break" data-chunk="">{intro}</div>
      {parts.map((part) => (
        <PaperPart key={part.label} part={part} />
      ))}
    </section>
  );
}

// ---------- marking guide ----------

/** Compact per-part content recap for the marking guide (no answer spaces). */
function GuidePartsContent({ parts }: { parts: AssessmentItemPart[] }) {
  return (
    <>
      {parts.map((part) => {
        const subs =
          part.subParts && part.subParts.length > 0 ? part.subParts : null;
        // One chunk per part: print could break inside a long part's content,
        // but the guide recaps are compact — atomic parts keep the preview
        // honest without paragraph-level bookkeeping.
        return (
          <div key={part.label} className="question-part" data-chunk="">
            <PartLabel label={part.label} marks={part.marks} />
            {part.content && <MathContent content={part.content} />}
            {subs && (
              <div className="subparts">
                {subs.map((sub) => (
                  <div key={sub.label} className="question-part">
                    <PartLabel label={sub.label} marks={sub.marks} />
                    {sub.content && <MathContent content={sub.content} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function GuideSolution({
  item,
  parts,
}: {
  item: AssessmentItemView;
  parts: AssessmentItemPart[] | null;
}) {
  // Mirrors ItemCard's SolutionBlock rule: parts-items usually carry the same
  // worked solution twice (flat blob + per part). The structured per-part
  // solutions win; the whole-item solutionContent is only the fallback.
  const hasPartSolutions =
    parts?.some((p) => p.solution || p.subParts?.some((sub) => sub.solution)) ??
    false;
  const hasAnything =
    !!item.correctOption || !!item.solutionContent || hasPartSolutions;

  return (
    <div className="guide-solution">
      {item.correctOption && (
        <p className="guide-answer" data-chunk="">
          Answer: {item.correctOption}
        </p>
      )}
      {/* Neutral wrapper div: MathContent owns its own root, and the
          paginator needs a chunk boundary here. No styles attach to it. */}
      {item.solutionContent && !hasPartSolutions && (
        <div data-chunk="">
          <MathContent content={item.solutionContent} />
        </div>
      )}
      {/* NOT one .avoid-break per part: the bank has part solutions taller
          than a full A4 page, and an unbreakable chunk that can't fit forces
          a near-blank page before breaking anyway. Instead the heading glues
          to its content (.guide-solution-heading break-after: avoid) and only
          sub-part solutions — which the data shows always fit — stay atomic. */}
      {hasPartSolutions &&
        parts?.map((part) =>
          part.solution || part.subParts?.some((sub) => sub.solution) ? (
            // One chunk per part solution. Print may break INSIDE it (see the
            // comment above) — when it can't fit a page, the preview grows
            // that page and says so rather than faking a break position.
            <div key={part.label} data-chunk="">
              <p className="guide-solution-heading">
                Part {part.label} {part.marks > 0 && marksLabel(part.marks)}
              </p>
              {part.solution && <MathContent content={part.solution} />}
              {part.subParts
                ?.filter((sub) => sub.solution)
                .map((sub) => (
                  <div key={sub.label} className="subparts avoid-break">
                    <p className="guide-solution-heading">
                      Part {part.label}({sub.label}){" "}
                      {sub.marks > 0 && marksLabel(sub.marks)}
                    </p>
                    <MathContent content={sub.solution as string} />
                  </div>
                ))}
            </div>
          ) : null
        )}
      {!hasAnything && (
        <p className="guide-empty" data-chunk="">
          No worked solution is recorded for this question.
        </p>
      )}
    </div>
  );
}

function GuideQuestion({
  number,
  item,
}: {
  number: number;
  item: AssessmentItemView;
}) {
  const parts = nonEmptyParts(item);
  const stem = parts ? stemBeforeParts(item.content) : item.content;
  const options = item.options;

  return (
    <section className="question-block">
      <div className="avoid-break" data-chunk="">
        <QuestionHeading number={number} marks={item.marks} />
        <div className="guide-question">
          {item.preamble && (
            <div className="question-preamble">
              <MathContent content={item.preamble} />
            </div>
          )}
          {stem && <MathContent content={stem} />}
        </div>
      </div>
      <div className="guide-question">
        {parts && <GuidePartsContent parts={parts} />}
        {options && (
          <div className="mcq-options" data-chunk="">
            {(["A", "B", "C", "D"] as const).map((letter) => (
              <div key={letter} className="mcq-option">
                <span className="mcq-letter">{letter}.</span>
                <div className="mcq-option-body">
                  <MathContent content={options[letter]} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <GuideSolution item={item} parts={parts} />
    </section>
  );
}

// ---------- sheet ----------

function PaperHeader({
  assessment,
  totalMarks,
  questionCount,
  solutions,
}: {
  assessment: AssessmentDetail;
  totalMarks: number;
  questionCount: number;
  solutions: boolean;
}) {
  return (
    <header className="print-header avoid-break" data-chunk="">
      <h1 className="print-title">{assessment.title}</h1>
      <p className="print-subject">{assessment.subjectName}</p>
      <p className="print-meta">
        Total marks: {totalMarks} · Questions: {questionCount}
      </p>
      <p className="print-tech">{techLine(assessment.settings)}</p>
      {!solutions && (
        <div className="student-fields">
          {["Name", "Class", "Date"].map((label) => (
            <div key={label} className="student-field">
              <span>{label}</span>
              <span className="field-line" />
            </div>
          ))}
        </div>
      )}
    </header>
  );
}

export default function PaperSheet({
  assessment,
  slots,
  totalMarks,
  solutions,
}: {
  assessment: AssessmentDetail;
  slots: PrintSlot[];
  totalMarks: number;
  solutions: boolean;
}) {
  return (
    <main className="print-sheet">
      <PaperHeader
        assessment={assessment}
        totalMarks={totalMarks}
        questionCount={slots.length}
        solutions={solutions}
      />
      {solutions && (
        <p className="guide-banner" role="note" data-chunk="">
          MARKING GUIDE — teacher copy, not for students
        </p>
      )}
      {slots.length === 0 ? (
        <div className="empty-paper" data-chunk="">
          <p>This paper has no questions yet.</p>
          <p>
            Add questions in the editor and they&apos;ll appear here, ready to
            print.
          </p>
        </div>
      ) : (
        slots.map((slot, i) =>
          slot.kind === "vcaa" ? (
            <VcaaNotice key={`vcaa-${slot.order}`} number={i + 1} marks={slot.marks} />
          ) : solutions ? (
            <GuideQuestion key={slot.item.id} number={i + 1} item={slot.item} />
          ) : (
            <PaperQuestion key={slot.item.id} number={i + 1} item={slot.item} />
          )
        )
      )}
    </main>
  );
}
