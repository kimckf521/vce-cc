/**
 * Splits a generated SHORT_ANSWER QuestionSetItem into its preamble + sub-parts
 * (if it has any). Generated 4+ mark items often contain markdown like:
 *
 *   A company claims 80% customer satisfaction. A sample of n=400 ...
 *
 *   a. State the expected mean and SD of p̂ under the claim. (2 marks)
 *   b. Compute the z-score. (1 mark)
 *   c. Comment on whether the result is consistent with the claim. (1 mark)
 *
 * Real VCAA Exam 1 marks each of these sub-parts independently — so we
 * pull them out as first-class entries with their own marks count, and
 * the practice page renders one self-mark stepper per sub-part.
 *
 * Returns no sub-parts when:
 *   - The content has no sub-part markers (single-part item).
 *   - The extracted sub-part marks don't sum to the parent item's marks
 *     (would corrupt the exam total — safer to fall back to single-part).
 */

const SUB_PART_RE = /(?:^|\n)([ \t]*)(\*\*)?([a-h])\.(\*\*)?(\s)/g;
const INLINE_MARKS_RE = /\((\d+)\s+marks?\)/i;

export interface ShortAnswerSubpart {
  /** Lowercase letter — "a", "b", "c", ... */
  label: string;
  /** Marks extracted from the inline `(N marks)` annotation. */
  marks: number;
  /** Sub-part body with the leading marker and trailing `(N marks)` stripped. */
  content: string;
}

export interface ParsedShortAnswer {
  preamble: string | null;
  subparts: ShortAnswerSubpart[];
}

export function parseShortAnswerSubparts(
  content: string,
  parentMarks: number
): ParsedShortAnswer {
  // Find every sub-part marker. Capture the whole match span (including any
  // leading whitespace) so we can slice the content cleanly.
  const re = new RegExp(SUB_PART_RE.source, "g");
  const matches: { letter: string; markerStart: number; markerEnd: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    // m.index points at the optional leading newline; the marker itself
    // starts where `**?[a-h]` begins. Locate it precisely.
    const localMarkerOffset = m[0].search(/\*\*?[a-h]\./);
    const markerStart = m.index + localMarkerOffset;
    matches.push({
      letter: m[3],
      markerStart,
      markerEnd: re.lastIndex,
    });
  }

  // Single-part item — no sub-parts to extract.
  if (matches.length < 2) {
    return { preamble: null, subparts: [] };
  }

  const preambleRaw = content.slice(0, matches[0].markerStart).trim();
  const preamble = preambleRaw.length > 0 ? preambleRaw : null;

  const subparts: ShortAnswerSubpart[] = matches.map((match, i) => {
    const sliceStart = match.markerEnd;
    const sliceEnd =
      i < matches.length - 1 ? matches[i + 1].markerStart : content.length;
    const rawSliced = content.slice(sliceStart, sliceEnd).trim();

    // Pull marks from the trailing `(N marks)` annotation.
    const marksMatch = rawSliced.match(INLINE_MARKS_RE);
    const marks = marksMatch ? parseInt(marksMatch[1], 10) : 0;

    // Strip the inline marks annotation — the badge already shows it.
    const cleaned = rawSliced
      .replace(/\s*\(\d+\s+marks?\)\s*/gi, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return { label: match.letter, marks, content: cleaned };
  });

  // Sanity check: sub-part marks must sum to the parent's marks. If they
  // don't (parser missed an annotation, weird formatting, etc.), bail out
  // and let the caller treat it as a single-part item — keeps the exam
  // total accurate at the cost of finer-grained marking on this item.
  const sum = subparts.reduce((s, sp) => s + sp.marks, 0);
  if (sum !== parentMarks) {
    return { preamble: null, subparts: [] };
  }

  return { preamble, subparts };
}
