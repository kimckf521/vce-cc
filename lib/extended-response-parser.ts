/**
 * Splits a generated EXTENDED_RESPONSE QuestionSetItem into the multi-part
 * shape that QuestionGroup expects (preamble + parts a/b/c/...), so the
 * Exam 2B Practice screen renders questions in the same row-per-part style
 * as the Past Papers viewer.
 *
 * Generated items store every part inside a single markdown content blob:
 *
 *   {preamble paragraph}
 *
 *   **a.** {part a text} (3 marks)
 *
 *   **b.** {part b text} (2 marks)
 *
 *   **c.** Let $a = 3$.
 *
 *     **i.**  ... (2 marks)
 *     **ii.** ... (1 mark)
 *
 *   **d.** ... (2 marks)
 *
 * This helper finds the top-level `**a.**`, `**b.**`, ... markers and
 * returns the preamble + each part with its content + marks. Sub-parts
 * (**i.**, **ii.**) stay nested inside their parent part — their marks are
 * summed into the parent's total.
 *
 * The solution string is split on the same letter markers used by the
 * generation pipeline (`**a. (X marks)**`) so each part can show its own
 * worked answer.
 */

// Restrict top-level part markers to a–h (Math Methods Section B questions
// have at most 5 parts, so this comfortably covers them while excluding
// Roman-numeral sub-parts like **i.**, **ii.**, **iii.**, **iv.**, **v.**
// that would otherwise match `[a-z]`.
const PART_MARKER_RE = /(?:^|\n)\s*\*\*([a-h])\.\*\*/g;
const MARKS_RE = /\((\d+)\s+marks?\)/gi;
const SOLUTION_HEADER_RE = /\*\*([a-z])(?:\.[ivxIVX]+)?\.?\s*\(\d+\s+marks?\)\*\*/g;

export interface ParsedPart {
  /** Single lowercase letter — "a", "b", "c", ... */
  part: string;
  /** Sum of marks across this part (and any nested sub-parts). */
  marks: number;
  /** Markdown content for this part, with the leading `**a.**` stripped. */
  content: string;
  /** Per-part solution slice, or null if the solution couldn't be split. */
  solution: string | null;
}

export interface ParsedExtendedResponse {
  preamble: string | null;
  parts: ParsedPart[];
}

/** Sum every "(N marks)" marker inside a string. Defaults to 0 if none. */
function sumMarks(text: string): number {
  let total = 0;
  let m: RegExpExecArray | null;
  // Reset lastIndex on the shared regex by creating a fresh local copy.
  const re = new RegExp(MARKS_RE.source, "gi");
  while ((m = re.exec(text)) !== null) {
    total += parseInt(m[1], 10);
  }
  return total;
}

/** Group solution chunks by their letter prefix (handles a, a.i, a.ii, ...). */
function splitSolutionByLetter(
  solutionContent: string
): Record<string, string> {
  const matches: { letter: string; index: number }[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(SOLUTION_HEADER_RE.source, "g");
  while ((m = re.exec(solutionContent)) !== null) {
    matches.push({ letter: m[1].toLowerCase(), index: m.index });
  }

  const byLetter: Record<string, string> = {};
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end =
      i < matches.length - 1 ? matches[i + 1].index : solutionContent.length;
    const segment = solutionContent.slice(start, end).trim();
    const letter = matches[i].letter;
    byLetter[letter] = byLetter[letter]
      ? `${byLetter[letter]}\n\n${segment}`
      : segment;
  }
  return byLetter;
}

export function splitExtendedResponse(
  content: string,
  solutionContent: string | null,
  fallbackTotalMarks: number
): ParsedExtendedResponse {
  // Find every top-level part marker. Use a fresh regex so lastIndex is 0.
  const re = new RegExp(PART_MARKER_RE.source, "g");
  const matches: { letter: string; markerStart: number; markerEnd: number }[] =
    [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    // m.index is at the start of the optional leading newline; we want the
    // marker itself (`**a.**`) so we use the captured group's offset.
    const markerStart = m.index + m[0].indexOf("**");
    matches.push({
      letter: m[1],
      markerStart,
      markerEnd: re.lastIndex,
    });
  }

  // No multi-part markers — bail out with a single synthetic part holding
  // the entire content. The caller will render it as a single-part group.
  if (matches.length === 0) {
    return {
      preamble: null,
      parts: [
        {
          part: "",
          marks: fallbackTotalMarks,
          content: content.trim(),
          solution: solutionContent,
        },
      ],
    };
  }

  const preambleRaw = content.slice(0, matches[0].markerStart).trim();
  const preamble = preambleRaw.length > 0 ? preambleRaw : null;

  const solByLetter = solutionContent
    ? splitSolutionByLetter(solutionContent)
    : {};

  const parts: ParsedPart[] = matches.map((match, i) => {
    const start = match.markerEnd;
    const end =
      i < matches.length - 1 ? matches[i + 1].markerStart : content.length;
    const rawPartContent = content.slice(start, end).trim();
    const marks = sumMarks(rawPartContent);
    // Strip the trailing "(N marks)" annotations — the marks badge already
    // shows them, and Past Papers content doesn't carry them inline.
    const cleanedContent = rawPartContent
      .replace(/\s*\(\d+\s+marks?\)\s*/gi, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    return {
      part: match.letter,
      marks: marks > 0 ? marks : 0,
      content: cleanedContent,
      solution: solByLetter[match.letter] ?? null,
    };
  });

  // If we somehow extracted zero marks total, fall back to dividing the
  // QuestionSetItem.marks evenly across parts so the totals still add up.
  const grandTotal = parts.reduce((s, p) => s + p.marks, 0);
  if (grandTotal === 0 && fallbackTotalMarks > 0) {
    const each = Math.floor(fallbackTotalMarks / parts.length);
    let remainder = fallbackTotalMarks - each * parts.length;
    parts.forEach((p) => {
      p.marks = each + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
    });
  }

  return { preamble, parts };
}
