/**
 * Retrofit geometry figures into existing qset JSON files.
 *
 * Scans every question's content for geometric keywords (rectangle, square,
 * right triangle, triangle, cube, box, circle, sphere, cylinder, cone) and
 * injects a schematic SVG figure from qset-helpers.ts just before the
 * question's question mark / final sentence.
 *
 * Labels are generic ("length", "width", "s", "a", "b", etc.) — the actual
 * numeric or symbolic dimensions remain in the question text.
 *
 * Usage:
 *   cd /Volumes/Extreme/Claude/VCE-Claude/vce-methods
 *   npx tsx scripts/retrofit-geometry-figures.ts
 */
import fs from "fs";
import path from "path";
import {
  rectangleFigure,
  rightTriangleFigure,
  triangleFigure,
  squareFigure,
  boxFigure,
  cubeFigure,
  coneFigure,
  circleFigure,
  squareWithInscribedCircleFigure,
  squareWithTriangleFigure,
  semicircleWithRectangleFigure,
} from "./qset-helpers";

const OUTPUT_DIR = path.resolve(__dirname, "output");

interface QItem {
  content: string;
  [k: string]: any;
}
interface QSet {
  mcq?: QItem[];
  shortAnswer?: QItem[];
  extendedResponse?: QItem[];
}

// ─── Pattern detection ───────────────────────────────────────────────────────
// Returns a figure markdown image tag, or null if no figure should be added.
// Only considers the content with geometry-diagram markers stripped (function
// graph plots are preserved and not treated as existing figures).
function pickFigure(content: string): string | null {
  // Skip if a function graph is already present (we don't want to add a second
  // image to a question that already has a curve plot)
  if (/!\[Graph[^\]]*\]\(data:image\/svg/.test(content)) return null;
  // Geometry diagrams (Rectangle/Square/Box/Triangle/Circle) are replaced, not
  // skipped, so the caller should have already stripped them before calling.

  const c = content;

  // ── Composite / inscribed figures (check FIRST, most specific) ─────────
  // Rectangle inscribed in a semicircle
  if (/rectangle (?:is )?inscribed in (?:a )?semicircle/i.test(c)) {
    return semicircleWithRectangleFigure();
  }
  // Square with inscribed circle (unit square geometric probability)
  if (/(?:unit )?square.*(?:inscribed circle|inscribed in|lies within)/i.test(c)) {
    return squareWithInscribedCircleFigure();
  }
  // Point chosen in square, lies in triangle (geometric probability)
  if (/square.*(?:triangle|lies in the triangle)/i.test(c) && /point/i.test(c)) {
    return squareWithTriangleFigure();
  }

  // ── Container boxes (probability with balls/marbles/objects) — NO FIGURE ─
  // A "box" in a probability question is a container, not a geometric shape.
  // Detect by: mention of balls / marbles / red / blue / green / drawn / etc.
  const isContainerBox =
    /\bbox(?:es)?\b/i.test(c) &&
    /(?:\bballs?\b|\bmarbles?\b|\bred\b|\bblue\b|\bgreen\b|\byellow\b|\bdrawn\b|\bdraw\b|\breplacement\b|Pr\(|probability)/i.test(c) &&
    !/rectangular box|open-top box|cubic box/i.test(c);
  if (isContainerBox) return null;

  // ── Box or rectangular prism — check before "rectangle" ─────────────────
  if (
    /\b(?:rectangular prism|rectangular box|open-top box|cubic box)\b/i.test(c) ||
    (/\bbox\b/i.test(c) &&
      /(?:\bvolume\b|\bsurface area\b|\bheight\b|\bsheet\b|\bcard\b|\blength\b|dimensions|\bsides?\b|\bfold)/i.test(c) &&
      !isContainerBox)
  ) {
    // If the box is described as having a square base, use cube-ish visual
    if (/square base|square cross[- ]?section/i.test(c)) {
      return boxFigure({ l: "x", w: "x", h: "h" });
    }
    return boxFigure({ l: "l", w: "w", h: "h" });
  }

  // Cube — use a real cube figure
  if (/\bcube\b/i.test(c) || /\bice cube\b/i.test(c)) {
    return cubeFigure("s");
  }

  // Cone
  if (/\bcone\b/i.test(c)) {
    return coneFigure({ r: "r", h: "h" });
  }

  // Cylinder
  if (/\bcylinder\b/i.test(c)) {
    // Cross-section: a rectangle with diameter and height labels
    return rectangleFigure({ top: "2r", left: "h" });
  }

  // Sphere — use circle
  if (/\bsphere\b/i.test(c)) {
    return circleFigure("r");
  }

  // ── Triangles ──────────────────────────────────────────────────────────
  // Right triangle / right-angled triangle — check before general "triangle"
  if (/\bright[- ]?(?:angled )?triangle\b/i.test(c)) {
    return rightTriangleFigure({ leg1: "a", leg2: "b", hyp: "c" });
  }

  // A triangle with one vertex at origin and the other two on the axes —
  // recognise patterns like "(0, 0), (a, 0), (0, b)" → right triangle
  if (
    /\btriangle\b/i.test(c) &&
    /\(\s*0\s*,\s*0\s*\)/.test(c) &&
    /\(\s*[^,]+\s*,\s*0\s*\)/.test(c) &&
    /\(\s*0\s*,\s*[^)]+\s*\)/.test(c)
  ) {
    return rightTriangleFigure({ leg1: "a", leg2: "b", hyp: "c" });
  }

  // Triangle bounded by axes and a line (e.g. "triangle bounded by y=x, y=0, x=4")
  if (/\btriangle\b/i.test(c) && /\bbounded\b/i.test(c) && /y\s*=\s*0|x\s*=\s*0|axis/i.test(c)) {
    return rightTriangleFigure({ leg1: "a", leg2: "b", hyp: "c" });
  }

  // General triangle
  if (/\btriangle\b/i.test(c)) {
    return triangleFigure({ vertices: ["A", "B", "C"] });
  }

  // ── Rectangle ──────────────────────────────────────────────────────────
  if (
    /\brectangle\b|\brectangular (?:garden|region|sheet|block|field|paddock|plot|plate|area)/i.test(c)
  ) {
    return rectangleFigure({ top: "length", left: "width" });
  }

  // ── Square ─────────────────────────────────────────────────────────────
  // Exclude algebraic/idiom uses
  if (
    /\bsquare\b/i.test(c) &&
    !/square root|squared|square\s+of|complete the square|perfect square|square (?:base|cross[- ]?section|matrix|metres|meters|kilometers|kilometres|units)/i.test(c)
  ) {
    return squareFigure("s");
  }

  // ── Circle ─────────────────────────────────────────────────────────────
  if (/\bcircle\b|\bcircular (?:board|disc|disk|region|area|plate|sector)/i.test(c)) {
    return circleFigure("r");
  }

  return null;
}

// ─── Injection ───────────────────────────────────────────────────────────────
// Insert the figure near the top of the content, after the first sentence
// that mentions the shape (so the figure sits logically close to the
// descriptive text).
function injectFigure(content: string, figure: string): string {
  // Split on the first blank line — place the figure just before any
  // trailing prompt question or between the setup sentence and the options.
  // Simple approach: append the figure to the setup sentence, ensuring blank
  // lines around it for markdown rendering.
  //
  // Find the first sentence that contains a shape keyword. Insert after it.
  const SHAPE_RX = /\b(rectangle|square|triangle|circle|cube|box|cylinder|cone|sphere|rectangular)\b/i;
  // Split into sentences (naive — on . ? followed by space, but also on \n\n)
  const paragraphs = content.split(/\n\n+/);
  for (let i = 0; i < paragraphs.length; i++) {
    if (SHAPE_RX.test(paragraphs[i])) {
      // Split this paragraph at the first sentence break AFTER the shape keyword
      const para = paragraphs[i];
      const match = para.match(SHAPE_RX);
      if (!match) continue;
      const idx = match.index! + match[0].length;
      // Find the next sentence terminator (".", "?", "!") after idx
      const rest = para.slice(idx);
      const endMatch = rest.match(/[.?!]\s/);
      let splitAt: number;
      if (endMatch) {
        splitAt = idx + endMatch.index! + endMatch[0].length;
      } else {
        splitAt = para.length;
      }
      const before = para.slice(0, splitAt).trimEnd();
      const after = para.slice(splitAt).trimStart();
      paragraphs[i] = after ? `${before}\n\n${figure}\n\n${after}` : `${before}\n\n${figure}`;
      return paragraphs.join("\n\n");
    }
  }
  // Fallback: prepend figure at the very top
  return `${figure}\n\n${content}`;
}

// Strip previously-injected geometry diagrams (not function curve plots).
// These are identified by their alt text (Rectangle/Square/Box/Triangle/
// Circle diagram).
function stripExistingGeometryFigures(content: string): string {
  const pattern = /\n*!\[(?:Rectangle|Square|Right triangle|Triangle|Box|Cube|Cone|Circle)[^\]]*\]\(data:image\/svg\+xml;base64,[^)]*\)\n*/g;
  return content.replace(pattern, "\n\n").replace(/\n{3,}/g, "\n\n").trim() + "";
}

// ─── Main ────────────────────────────────────────────────────────────────────
function processFile(filePath: string): { changed: boolean; count: number; stripped: number } {
  const raw = fs.readFileSync(filePath, "utf-8");
  const data: QSet = JSON.parse(raw);
  let count = 0;
  let stripped = 0;
  const buckets: (keyof QSet)[] = ["mcq", "shortAnswer", "extendedResponse"];
  for (const key of buckets) {
    const arr = data[key];
    if (!arr) continue;
    for (const item of arr) {
      const before = item.content;
      const cleaned = stripExistingGeometryFigures(before);
      if (cleaned !== before) {
        stripped++;
        item.content = cleaned;
      }
      const fig = pickFigure(item.content);
      if (fig) {
        item.content = injectFigure(item.content, fig);
        count++;
      }
    }
  }
  if (count > 0 || stripped > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  }
  return { changed: count > 0 || stripped > 0, count, stripped };
}

function main() {
  const files = fs
    .readdirSync(OUTPUT_DIR)
    .filter((f) => f.startsWith("qset-") && f.endsWith(".json"))
    .map((f) => path.join(OUTPUT_DIR, f));

  let totalFigures = 0;
  let totalStripped = 0;
  let filesChanged = 0;
  for (const file of files) {
    const res = processFile(file);
    if (res.changed) {
      filesChanged++;
      totalFigures += res.count;
      totalStripped += res.stripped;
      console.log(
        `✏️  ${path.basename(file)}: stripped ${res.stripped}, added ${res.count}`
      );
    }
  }
  console.log(
    `\n✅ Stripped ${totalStripped} old figures, added ${totalFigures} new figures across ${filesChanged} files.`
  );
}

main();
