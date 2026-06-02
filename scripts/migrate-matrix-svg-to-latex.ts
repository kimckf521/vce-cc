/**
 * Replace embedded SVG matrix images with inline LaTeX bmatrix/array
 * expressions across all QuestionSetItems in any subject's bank.
 *
 * Why: the SVG matrices have several display issues — small fixed pixel
 * size, white background that clashes with dark theme, row-label position
 * collides with the bracket. KaTeX bmatrix renders the same content with
 * proper theme inheritance, scales with surrounding text, and is crisp on
 * every display.
 *
 * Mechanism: every `data:image/svg+xml;base64,...` data URI in a question
 * `content` (or `parts` JSON) is decoded. SVGs that match the matrixTable
 * structure (label + brackets + grid of numeric text) are parsed for their
 * values, row/column labels, and scalar label, then re-emitted as a LaTeX
 * fragment. Non-matrix SVGs (scatterplots, networks, etc.) are left alone.
 *
 * Idempotent: items whose content no longer contains a matrix SVG are
 * skipped. Safe to re-run.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/migrate-matrix-svg-to-latex.ts [--dry]
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

// ─── SVG matrix parser ─────────────────────────────────────────────────

interface TextEl {
  x: number;
  y: number;
  anchor: "start" | "middle" | "end";
  italic: boolean;
  bold: boolean;
  text: string;
}

function parseTextElements(svg: string): TextEl[] {
  const out: TextEl[] = [];
  const re = /<text\s+([^>]*?)>([\s\S]*?)<\/text>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(svg)) !== null) {
    const attrs = m[1];
    const body = m[2].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
    const xMatch = /\bx="([-\d.]+)"/.exec(attrs);
    const yMatch = /\by="([-\d.]+)"/.exec(attrs);
    const anchorMatch = /text-anchor="(start|middle|end)"/.exec(attrs);
    const italic = /font-style="italic"/.test(attrs);
    const bold = /font-weight="bold"/.test(attrs);
    if (!xMatch || !yMatch) continue;
    out.push({
      x: parseFloat(xMatch[1]),
      y: parseFloat(yMatch[1]),
      anchor: (anchorMatch?.[1] as "start" | "middle" | "end") ?? "start",
      italic,
      bold,
      text: body,
    });
  }
  return out;
}

interface LineEl {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function parseLines(svg: string): LineEl[] {
  const out: LineEl[] = [];
  const re = /<line\s+([^>]*?)\/?>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(svg)) !== null) {
    const a = m[1];
    const x1 = /\bx1="([-\d.]+)"/.exec(a)?.[1];
    const y1 = /\by1="([-\d.]+)"/.exec(a)?.[1];
    const x2 = /\bx2="([-\d.]+)"/.exec(a)?.[1];
    const y2 = /\by2="([-\d.]+)"/.exec(a)?.[1];
    if (x1 && y1 && x2 && y2) {
      out.push({ x1: +x1, y1: +y1, x2: +x2, y2: +y2 });
    }
  }
  return out;
}

/**
 * matrixTable emits exactly 6 lines forming two brackets:
 *   4 short horizontals (top + bottom cap of each bracket, ~10px wide)
 *   2 long verticals (one per bracket, matrix height)
 * The two verticals must be at the same y-range (same matrix box).
 */
function isMatrixBracketGeometry(lines: LineEl[]): boolean {
  if (lines.length !== 6) return false;
  const horiz = lines.filter((l) => l.y1 === l.y2 && Math.abs(l.x2 - l.x1) < 20);
  const vert = lines.filter((l) => l.x1 === l.x2 && Math.abs(l.y2 - l.y1) >= 20);
  if (horiz.length !== 4 || vert.length !== 2) return false;
  // Both verticals span the same y-range (the matrix box)
  const [v1, v2] = vert;
  const v1Top = Math.min(v1.y1, v1.y2);
  const v1Bot = Math.max(v1.y1, v1.y2);
  const v2Top = Math.min(v2.y1, v2.y2);
  const v2Bot = Math.max(v2.y1, v2.y2);
  if (Math.abs(v1Top - v2Top) > 1 || Math.abs(v1Bot - v2Bot) > 1) return false;
  // The 4 horizontal caps should sit at y == v1Top or y == v1Bot
  return horiz.every((h) => Math.abs(h.y1 - v1Top) < 1 || Math.abs(h.y1 - v1Bot) < 1);
}

interface MatrixData {
  label: string | null;        // e.g. "T"
  rowLabels: string[] | null;
  colLabels: string[] | null;
  values: string[][];
}

/**
 * Detect & parse a matrixTable-style SVG. Returns null if the SVG isn't a
 * matrix (lacks the 6 bracket lines or has no numeric grid).
 */
function parseMatrixSvg(svg: string): MatrixData | null {
  // matrixTable always emits exactly 6 <line> elements forming bracket pairs.
  // Reject anything whose line geometry doesn't match — small network
  // graphs with 6 random edges look similar at a glance.
  if (!isMatrixBracketGeometry(parseLines(svg))) return null;

  const texts = parseTextElements(svg);

  // Bold + italic = matrix label like "T ="
  const labelEls = texts.filter((t) => t.bold && t.italic);
  const label = labelEls[0]?.text.replace(/\s*=\s*$/, "") || null;

  // Italic non-bold + anchor=end = row labels
  const rowLabelEls = texts.filter((t) => t.italic && !t.bold && t.anchor === "end");
  // Italic non-bold + anchor=middle = column labels (these sit ABOVE the matrix area)
  const colLabelEls = texts.filter((t) => t.italic && !t.bold && t.anchor === "middle");

  // Non-italic + anchor=middle = cell values
  const cellEls = texts.filter((t) => !t.italic && t.anchor === "middle");
  if (cellEls.length === 0) return null;

  // Group cells into rows by y-coordinate (cells in same row share a y).
  const rowYs = Array.from(new Set(cellEls.map((c) => c.y))).sort((a, b) => a - b);
  const grouped = rowYs.map((y) => cellEls.filter((c) => c.y === y).sort((a, b) => a.x - b.x).map((c) => c.text));
  if (grouped.length === 0 || grouped[0].length === 0) return null;
  // Sanity: every row should have the same number of cells
  const cols = grouped[0].length;
  if (!grouped.every((r) => r.length === cols)) return null;

  // Row labels in order (sort by y)
  const rowLabels = rowLabelEls.length === grouped.length
    ? rowLabelEls.slice().sort((a, b) => a.y - b.y).map((t) => t.text)
    : null;
  // Column labels in order (sort by x). Filter out any that happen to be at row-label y-values.
  const cellRowYs = new Set(rowYs);
  const colLabels = colLabelEls.length >= cols
    ? colLabelEls.filter((t) => !cellRowYs.has(t.y)).slice().sort((a, b) => a.x - b.x).slice(0, cols).map((t) => t.text)
    : null;

  return {
    label,
    rowLabels,
    colLabels: colLabels && colLabels.length === cols ? colLabels : null,
    values: grouped,
  };
}

// ─── LaTeX emitter ─────────────────────────────────────────────────────

/**
 * Build a LaTeX expression for the matrix. With both row + column labels,
 * uses a labelled \begin{array}{c|cc...} form. Without labels, plain bmatrix.
 */
function matrixToLatex(m: MatrixData): string {
  const cols = m.values[0].length;
  const rows = m.values.length;

  const hasRowLabels = m.rowLabels && m.rowLabels.length === rows;
  const hasColLabels = m.colLabels && m.colLabels.length === cols;

  let body: string;
  if (!hasRowLabels && !hasColLabels) {
    // Plain bmatrix
    const rowsStr = m.values.map((r) => r.join(" & ")).join(" \\\\ ");
    body = `\\begin{bmatrix} ${rowsStr} \\end{bmatrix}`;
  } else {
    // Use array with optional row-label column. Column spec: c| then cols ×c
    const spec = (hasRowLabels ? "c|" : "") + "c".repeat(cols);
    const lines: string[] = [];
    if (hasColLabels) {
      const headerCells = [hasRowLabels ? "" : null, ...m.colLabels!].filter((x) => x !== null) as string[];
      lines.push(headerCells.join(" & "));
    }
    for (let i = 0; i < rows; i++) {
      const cells = [
        ...(hasRowLabels ? [m.rowLabels![i]] : []),
        ...m.values[i],
      ];
      lines.push(cells.join(" & "));
    }
    const bodyRows = hasColLabels ? lines[0] + " \\\\ \\hline " + lines.slice(1).join(" \\\\ ") : lines.join(" \\\\ ");
    body = `\\left[\\begin{array}{${spec}} ${bodyRows} \\end{array}\\right]`;
  }

  const prefix = m.label ? `${m.label} = ` : "";
  // Wrap as display math so the matrix gets centred on its own line, which
  // matches the original SVG block-image positioning.
  return `$$${prefix}${body}$$`;
}

// ─── Content rewriter ──────────────────────────────────────────────────

const URI_REGEX = /!\[[^\]]*\]\(data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)\)/g;

function rewriteContent(content: string): { content: string; replaced: number; skipped: number } {
  let replaced = 0;
  let skipped = 0;
  const out = content.replace(URI_REGEX, (match, b64) => {
    let svg: string;
    try {
      svg = Buffer.from(b64, "base64").toString("utf-8");
    } catch {
      skipped++;
      return match;
    }
    const matrix = parseMatrixSvg(svg);
    if (!matrix) {
      skipped++;
      return match;
    }
    const latex = matrixToLatex(matrix);
    replaced++;
    return latex;
  });
  return { content: out, replaced, skipped };
}

// ─── Main ──────────────────────────────────────────────────────────────

async function main() {
  const dry = process.argv.includes("--dry");

  const items = await prisma.questionSetItem.findMany({
    where: { content: { contains: "data:image/svg+xml" } },
    select: { id: true, content: true },
  });

  console.log(`Scanning ${items.length} items with embedded SVG…`);
  let updated = 0;
  let totalReplaced = 0;
  let totalSkipped = 0;
  let previewCount = 0;

  for (const it of items) {
    const { content, replaced, skipped } = rewriteContent(it.content);
    totalReplaced += replaced;
    totalSkipped += skipped;
    if (replaced === 0) continue;
    if (dry && previewCount < 3) {
      console.log(`\n--- ${it.id} (replaced ${replaced}) ---`);
      // Print the first LaTeX block emitted
      const m = content.match(/\$\$[\s\S]*?\$\$/);
      if (m) console.log("LaTeX:", m[0].slice(0, 400));
      previewCount++;
    }
    if (!dry) {
      await prisma.questionSetItem.update({
        where: { id: it.id },
        data: { content },
      });
    }
    updated++;
  }

  console.log(`\nItems with at least one matrix replaced: ${updated}`);
  console.log(`Matrix images replaced: ${totalReplaced}`);
  console.log(`Non-matrix SVGs skipped: ${totalSkipped}`);
  if (dry) console.log("(--dry: no writes)");

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
