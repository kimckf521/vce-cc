/**
 * VCE General Mathematics — Space and Measurement cluster.
 *
 * Generates the question-bank items for the 7 subtopics:
 *   - pythagoras-theorem (core-drill: 12/5/2/2 = 21)
 *   - mensuration (core-drill: 12/5/2/2 = 21)
 *   - area-and-surface-area (extended-fit: 9/4/2/2 = 17)
 *   - volume (extended-fit: 9/4/2/2 = 17)
 *   - similar-triangles (extended-fit: 9/4/2/2 = 17)
 *   - right-angled-trigonometry (extended-fit: 9/4/2/2 = 17)
 *   - sine-and-cosine-rules (extended-fit: 9/4/2/2 = 17)
 *
 * Target ~127 items total.
 */
import * as fs from "fs";
import * as path from "path";
import {
  svg,
  toDataUri,
  line,
  text,
  bracket,
  shapeWithLabels,
} from "./svg";

const OUT_DIR = path.resolve(__dirname, "../output");
const QUESTION_SET_ID = "cmpkc57xo0007ofk0uo58ws59";
const SUBJECT_SLUG = "vce-general";
const TOPIC_SLUG = "space-and-measurement";

type Difficulty = "EASY" | "MEDIUM" | "HARD";
type Tech = "TECH_FREE" | "CAS_ALLOWED" | "CAS_REQUIRED";

interface ItemPart {
  label: string;
  marks: number;
  content: string;
  solution: string;
  subParts?: { label: string; marks: number; content: string; solution: string }[];
}

interface Item {
  type: "MCQ" | "SHORT_ANSWER" | "EXTENDED_ANSWER" | "EXTENDED_RESPONSE";
  topic_slug: string;
  subtopic_slugs: string[];
  difficulty: Difficulty;
  tech: Tech;
  marks: number;
  order: number;
  content: string;
  solutionContent: string;
  preamble: string | null;
  parts: ItemPart[] | null;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  correctOption: string | null;
}

const items: Item[] = [];
let order = 0;

const img = (s: string) => `![diagram](${toDataUri(s)})`;

// ─── Custom triangle diagram helpers ────────────────────────────────────

/**
 * Generic triangle SVG with labelled sides and (optionally) angles.
 * Vertices labelled A, B, C in mathematical convention (angle A opposite
 * side a, etc.). Coordinates supplied in (x, y) — top-left positive y down.
 */
function triangleSvg(opts: {
  vertices: { A: { x: number; y: number }; B: { x: number; y: number }; C: { x: number; y: number } };
  sideLabels?: { a?: string; b?: string; c?: string }; // a opposite A (between B & C), b opp B, c opp C
  angleLabels?: { A?: string; B?: string; C?: string };
  showRightAngleAt?: "A" | "B" | "C";
  width?: number;
  height?: number;
  pad?: number;
}): string {
  const W = opts.width ?? 320;
  const H = opts.height ?? 240;
  const pad = opts.pad ?? 30;
  // Scale so triangle fits in [pad, W-pad] × [pad, H-pad]
  const xs = [opts.vertices.A.x, opts.vertices.B.x, opts.vertices.C.x];
  const ys = [opts.vertices.A.y, opts.vertices.B.y, opts.vertices.C.y];
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const sx = (W - 2 * pad) / Math.max(1e-6, xMax - xMin);
  const sy = (H - 2 * pad) / Math.max(1e-6, yMax - yMin);
  const s = Math.min(sx, sy);
  const px = (x: number) => pad + (x - xMin) * s;
  const py = (y: number) => pad + (y - yMin) * s;
  const A = { x: px(opts.vertices.A.x), y: py(opts.vertices.A.y) };
  const B = { x: px(opts.vertices.B.x), y: py(opts.vertices.B.y) };
  const C = { x: px(opts.vertices.C.x), y: py(opts.vertices.C.y) };

  const parts: string[] = [];
  parts.push(
    `<polygon points="${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}" fill="none" stroke="#111" stroke-width="2"/>`,
  );

  // Vertex labels
  parts.push(text(A.x - 12, A.y - 4, "A", { size: 13, bold: true }));
  parts.push(text(B.x + 4, B.y + 14, "B", { size: 13, bold: true }));
  parts.push(text(C.x + 4, C.y - 4, "C", { size: 13, bold: true }));

  // Side labels — at midpoint, offset perpendicular outward
  const midSide = (P: { x: number; y: number }, Q: { x: number; y: number }, R: { x: number; y: number }, label: string) => {
    const mx = (P.x + Q.x) / 2;
    const my = (P.y + Q.y) / 2;
    // Normal from PQ pointing away from R
    const dx = Q.x - P.x;
    const dy = Q.y - P.y;
    const len = Math.hypot(dx, dy);
    const nx = -dy / len;
    const ny = dx / len;
    // Choose sign so the offset is opposite R
    const test = (mx + nx) * (R.x - mx) + (my + ny) * (R.y - my);
    const sign = test > (mx * (R.x - mx) + my * (R.y - my)) ? -1 : 1;
    const off = 14;
    parts.push(
      text(mx + sign * nx * off, my + sign * ny * off + 4, label, {
        size: 12,
        anchor: "middle",
        color: "#dc2626",
      }),
    );
  };
  if (opts.sideLabels?.a) midSide(B, C, A, opts.sideLabels.a); // a = BC
  if (opts.sideLabels?.b) midSide(A, C, B, opts.sideLabels.b); // b = AC
  if (opts.sideLabels?.c) midSide(A, B, C, opts.sideLabels.c); // c = AB

  // Angle labels — interior offset toward centroid
  const cx = (A.x + B.x + C.x) / 3;
  const cy = (A.y + B.y + C.y) / 3;
  const angleAt = (V: { x: number; y: number }, label: string) => {
    const dx = cx - V.x;
    const dy = cy - V.y;
    const len = Math.hypot(dx, dy);
    const o = 22;
    parts.push(
      text(V.x + (dx / len) * o, V.y + (dy / len) * o + 4, label, {
        size: 12,
        anchor: "middle",
        color: "#2563eb",
      }),
    );
  };
  if (opts.angleLabels?.A) angleAt(A, opts.angleLabels.A);
  if (opts.angleLabels?.B) angleAt(B, opts.angleLabels.B);
  if (opts.angleLabels?.C) angleAt(C, opts.angleLabels.C);

  // Right-angle marker
  if (opts.showRightAngleAt) {
    const V = opts.showRightAngleAt === "A" ? A : opts.showRightAngleAt === "B" ? B : C;
    const others = [A, B, C].filter((p) => p !== V);
    const u1 = { x: others[0].x - V.x, y: others[0].y - V.y };
    const u2 = { x: others[1].x - V.x, y: others[1].y - V.y };
    const n1 = Math.hypot(u1.x, u1.y);
    const n2 = Math.hypot(u2.x, u2.y);
    const sz = 10;
    const p1 = { x: V.x + (u1.x / n1) * sz, y: V.y + (u1.y / n1) * sz };
    const p3 = { x: V.x + (u2.x / n2) * sz, y: V.y + (u2.y / n2) * sz };
    const p2 = { x: p1.x + (u2.x / n2) * sz, y: p1.y + (u2.y / n2) * sz };
    parts.push(
      `<polyline points="${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}" fill="none" stroke="#111" stroke-width="1"/>`,
    );
  }

  return svg({ width: W, height: H }, parts.join(""));
}

/** Simple 3D box (rectangular prism) drawn in oblique projection. */
function box3DSvg(opts: {
  length: number;
  width: number;
  height: number;
  unit?: string;
  showDiagonal?: boolean;
  diagonalLabel?: string;
}): string {
  const unit = opts.unit ?? "cm";
  const W = 320;
  const H = 240;
  const scale = 22; // px per unit
  const off = 24; // depth offset px
  const L = opts.length * scale;
  const Wd = opts.width * scale * 0.6;
  const Hh = opts.height * scale;

  // Maximum extents
  const maxW = L + Wd + 40;
  const maxH = Hh + Wd + 40;
  const cx = (W - maxW) / 2 + 20;
  const cy = (H - maxH) / 2 + 20 + Wd;

  // Front face corners
  const FBL = { x: cx, y: cy + Hh };
  const FBR = { x: cx + L, y: cy + Hh };
  const FTL = { x: cx, y: cy };
  const FTR = { x: cx + L, y: cy };
  // Back face corners
  const BBL = { x: FBL.x + off, y: FBL.y - off };
  const BBR = { x: FBR.x + off, y: FBR.y - off };
  const BTL = { x: FTL.x + off, y: FTL.y - off };
  const BTR = { x: FTR.x + off, y: FTR.y - off };

  const parts: string[] = [];
  // Front face
  parts.push(
    `<polygon points="${FBL.x},${FBL.y} ${FBR.x},${FBR.y} ${FTR.x},${FTR.y} ${FTL.x},${FTL.y}" fill="none" stroke="#111" stroke-width="2"/>`,
  );
  // Back face (dashed)
  parts.push(line(BBL.x, BBL.y, BBR.x, BBR.y, { dash: "4 3", width: 1.2 }));
  parts.push(line(BTL.x, BTL.y, BTR.x, BTR.y, { dash: "4 3", width: 1.2 }));
  parts.push(line(BBL.x, BBL.y, BTL.x, BTL.y, { dash: "4 3", width: 1.2 }));
  parts.push(line(BBR.x, BBR.y, BTR.x, BTR.y, { dash: "4 3", width: 1.2 }));
  // Connecting edges
  parts.push(line(FBR.x, FBR.y, BBR.x, BBR.y, { width: 1.5 }));
  parts.push(line(FTR.x, FTR.y, BTR.x, BTR.y, { width: 1.5 }));
  parts.push(line(FTL.x, FTL.y, BTL.x, BTL.y, { width: 1.5 }));
  parts.push(line(FBL.x, FBL.y, BBL.x, BBL.y, { dash: "4 3", width: 1.2 }));

  // Labels
  parts.push(text((FBL.x + FBR.x) / 2, FBL.y + 16, `${opts.length} ${unit}`, { size: 12, anchor: "middle" }));
  parts.push(text(FBR.x + 6, (FBR.y + FTR.y) / 2 + 4, `${opts.height} ${unit}`, { size: 12 }));
  parts.push(
    text((FTR.x + BTR.x) / 2 + 8, (FTR.y + BTR.y) / 2 - 2, `${opts.width} ${unit}`, { size: 12 }),
  );

  // Space diagonal
  if (opts.showDiagonal) {
    parts.push(line(FBL.x, FBL.y, BTR.x, BTR.y, { stroke: "#dc2626", width: 1.5 }));
    if (opts.diagonalLabel) {
      parts.push(
        text((FBL.x + BTR.x) / 2 + 6, (FBL.y + BTR.y) / 2 + 4, opts.diagonalLabel, {
          size: 12,
          color: "#dc2626",
          italic: true,
        }),
      );
    }
  }

  return svg({ width: W, height: H }, parts.join(""));
}

/** Simple cylinder for surface area / volume problems. */
function cylinderSvg(opts: { radius: number; height: number; unit?: string }): string {
  const unit = opts.unit ?? "cm";
  const W = 240;
  const H = 280;
  const r = opts.radius * 18;
  const h = opts.height * 18;
  const cx = W / 2;
  const top = (H - h) / 2;
  const bot = top + h;
  const ry = r * 0.3;

  const parts: string[] = [];
  // Top ellipse
  parts.push(`<ellipse cx="${cx}" cy="${top}" rx="${r}" ry="${ry}" fill="none" stroke="#111" stroke-width="2"/>`);
  // Sides
  parts.push(line(cx - r, top, cx - r, bot, { width: 2 }));
  parts.push(line(cx + r, top, cx + r, bot, { width: 2 }));
  // Bottom ellipse — front half solid, back half dashed
  parts.push(
    `<path d="M ${cx - r} ${bot} A ${r} ${ry} 0 0 0 ${cx + r} ${bot}" fill="none" stroke="#111" stroke-width="2"/>`,
  );
  parts.push(
    `<path d="M ${cx - r} ${bot} A ${r} ${ry} 0 0 1 ${cx + r} ${bot}" fill="none" stroke="#111" stroke-width="1.2" stroke-dasharray="4 3"/>`,
  );
  // Radius indicator
  parts.push(line(cx, top, cx + r, top, { stroke: "#2563eb", width: 1.2 }));
  parts.push(text(cx + r / 2, top - 6, `${opts.radius} ${unit}`, { size: 12, anchor: "middle", color: "#2563eb" }));
  // Height label
  parts.push(line(cx + r + 10, top, cx + r + 10, bot, { width: 1 }));
  parts.push(line(cx + r + 6, top, cx + r + 14, top, { width: 1 }));
  parts.push(line(cx + r + 6, bot, cx + r + 14, bot, { width: 1 }));
  parts.push(text(cx + r + 18, (top + bot) / 2 + 4, `${opts.height} ${unit}`, { size: 12 }));

  return svg({ width: W, height: H }, parts.join(""));
}

/** Cone diagram. */
function coneSvg(opts: { radius: number; height: number; slant?: number; unit?: string }): string {
  const unit = opts.unit ?? "cm";
  const W = 240;
  const H = 280;
  const r = opts.radius * 18;
  const h = opts.height * 18;
  const cx = W / 2;
  const apex = (H - h) / 2;
  const base = apex + h;
  const ry = r * 0.3;

  const parts: string[] = [];
  // Sides from apex to base ellipse
  parts.push(line(cx, apex, cx - r, base, { width: 2 }));
  parts.push(line(cx, apex, cx + r, base, { width: 2 }));
  // Base ellipse — front solid, back dashed
  parts.push(
    `<path d="M ${cx - r} ${base} A ${r} ${ry} 0 0 0 ${cx + r} ${base}" fill="none" stroke="#111" stroke-width="2"/>`,
  );
  parts.push(
    `<path d="M ${cx - r} ${base} A ${r} ${ry} 0 0 1 ${cx + r} ${base}" fill="none" stroke="#111" stroke-width="1.2" stroke-dasharray="4 3"/>`,
  );
  // Radius
  parts.push(line(cx, base, cx + r, base, { stroke: "#2563eb", width: 1.2, dash: "3 2" }));
  parts.push(text(cx + r / 2, base + 14, `r = ${opts.radius} ${unit}`, { size: 12, anchor: "middle", color: "#2563eb" }));
  // Height (centre dashed line)
  parts.push(line(cx, apex, cx, base, { stroke: "#059669", width: 1.2, dash: "3 2" }));
  parts.push(text(cx + 4, (apex + base) / 2 + 4, `h = ${opts.height} ${unit}`, { size: 12, color: "#059669" }));
  // Slant
  if (opts.slant) {
    parts.push(
      text(cx - r / 2 - 18, (apex + base) / 2 + 4, `l = ${opts.slant} ${unit}`, {
        size: 12,
        anchor: "end",
        italic: true,
      }),
    );
  }

  return svg({ width: W, height: H }, parts.join(""));
}

// ════════════════════════════════════════════════════════════════════════
// Helper item constructors
// ════════════════════════════════════════════════════════════════════════

const mcq = (
  subtopic: string,
  content: string,
  options: [string, string, string, string],
  correct: "A" | "B" | "C" | "D",
  difficulty: Difficulty,
  solution: string,
  tech: Tech = "TECH_FREE",
) => {
  items.push({
    type: "MCQ",
    topic_slug: TOPIC_SLUG,
    subtopic_slugs: [subtopic],
    difficulty,
    tech,
    marks: 1,
    order: order++,
    content,
    solutionContent: solution,
    preamble: null,
    parts: null,
    optionA: options[0],
    optionB: options[1],
    optionC: options[2],
    optionD: options[3],
    correctOption: correct,
  });
};

const short = (
  subtopic: string,
  content: string,
  marks: number,
  difficulty: Difficulty,
  solution: string,
  tech: Tech = "TECH_FREE",
) => {
  items.push({
    type: "SHORT_ANSWER",
    topic_slug: TOPIC_SLUG,
    subtopic_slugs: [subtopic],
    difficulty,
    tech,
    marks,
    order: order++,
    content,
    solutionContent: solution,
    preamble: null,
    parts: null,
    optionA: null,
    optionB: null,
    optionC: null,
    optionD: null,
    correctOption: null,
  });
};

const extAns = (
  subtopic: string,
  parts: ItemPart[],
  difficulty: Difficulty,
  preamble: string | null = null,
  tech: Tech = "CAS_ALLOWED",
) => {
  const marks = parts.reduce(
    (s, p) =>
      s + (p.subParts && p.subParts.length > 0 ? p.subParts.reduce((ss, sp) => ss + sp.marks, 0) : p.marks),
    0,
  );
  items.push({
    type: "EXTENDED_ANSWER",
    topic_slug: TOPIC_SLUG,
    subtopic_slugs: [subtopic],
    difficulty,
    tech,
    marks,
    order: order++,
    content: "",
    solutionContent: "",
    preamble,
    parts,
    optionA: null,
    optionB: null,
    optionC: null,
    optionD: null,
    correctOption: null,
  });
};

const extResp = (
  subtopic: string,
  parts: ItemPart[],
  difficulty: Difficulty,
  preamble: string,
  tech: Tech = "CAS_ALLOWED",
) => {
  const marks = parts.reduce(
    (s, p) =>
      s + (p.subParts && p.subParts.length > 0 ? p.subParts.reduce((ss, sp) => ss + sp.marks, 0) : p.marks),
    0,
  );
  items.push({
    type: "EXTENDED_RESPONSE",
    topic_slug: TOPIC_SLUG,
    subtopic_slugs: [subtopic],
    difficulty,
    tech,
    marks,
    order: order++,
    content: "",
    solutionContent: "",
    preamble,
    parts,
    optionA: null,
    optionB: null,
    optionC: null,
    optionD: null,
    correctOption: null,
  });
};

// ════════════════════════════════════════════════════════════════════════
// SUBTOPIC 1 — PYTHAGORAS' THEOREM (core-drill: 12/5/2/2)
// ════════════════════════════════════════════════════════════════════════

const SUB_PYTH = "pythagoras-theorem";

// ─── Pythagoras MCQ (12) ───────────────────────────────────────────────

mcq(
  SUB_PYTH,
  `According to Pythagoras' theorem, in a right-angled triangle with hypotenuse $c$ and the two shorter sides $a$ and $b$:\n\n`,
  ["$a + b = c$", "$a^2 + b^2 = c^2$", "$a^2 - b^2 = c^2$", "$ab = c$"],
  "B",
  "EASY",
  "**Answer: B**\n\nPythagoras' theorem states that the sum of the squares of the two shorter sides equals the square of the hypotenuse in a right-angled triangle: $a^2 + b^2 = c^2$.",
);

mcq(
  SUB_PYTH,
  `${img(shapeWithLabels({ shape: "right-triangle", width: 3, height: 4, unit: "cm", hypLabel: "x" }))}\n\nFind the value of $x$ in centimetres.\n\n`,
  ["$5$", "$7$", "$\\sqrt{7}$", "$\\sqrt{12}$"],
  "A",
  "EASY",
  "**Answer: A**\n\n$x^2 = 3^2 + 4^2 = 9 + 16 = 25$, so $x = \\sqrt{25} = 5$ cm.\n\n(Distractor B comes from $3+4$; C from $\\sqrt{16-9}$; D from $\\sqrt{3 \\cdot 4}$.)",
);

mcq(
  SUB_PYTH,
  `${img(shapeWithLabels({ shape: "right-triangle", width: 6, height: 8, unit: "m", hypLabel: "?" }))}\n\nThe length of the hypotenuse, in metres, is\n\n`,
  ["$10$", "$14$", "$\\sqrt{28}$", "$\\sqrt{14}$"],
  "A",
  "EASY",
  "**Answer: A**\n\n$h^2 = 6^2 + 8^2 = 36 + 64 = 100$, so $h = 10$ m. (This is a 6-8-10 = 3-4-5 scaled triangle.)",
);

mcq(
  SUB_PYTH,
  `A right-angled triangle has hypotenuse 13 cm and one shorter side 5 cm. The length of the other shorter side, in centimetres, is\n\n`,
  ["$8$", "$12$", "$\\sqrt{194}$", "$18$"],
  "B",
  "EASY",
  "**Answer: B**\n\n$5^2 + b^2 = 13^2$, so $b^2 = 169 - 25 = 144$ and $b = 12$ cm. (This is the 5-12-13 Pythagorean triple.)",
);

mcq(
  SUB_PYTH,
  `Which of the following sets of side lengths can form a right-angled triangle?\n\n`,
  ["$3, 4, 6$", "$5, 12, 13$", "$2, 3, 5$", "$7, 8, 10$"],
  "B",
  "EASY",
  "**Answer: B**\n\nTest each set with $a^2 + b^2 = c^2$:\n- B: $5^2 + 12^2 = 25 + 144 = 169 = 13^2$ ✓\n- A: $3^2 + 4^2 = 25 \\ne 36$ ✗\n- C: $2^2 + 3^2 = 13 \\ne 25$ ✗\n- D: $7^2 + 8^2 = 113 \\ne 100$ ✗",
);

mcq(
  SUB_PYTH,
  `A right-angled triangle has shorter sides of length 9 mm and 12 mm. The length of the hypotenuse, in millimetres, is\n\n`,
  ["$15$", "$\\sqrt{21}$", "$21$", "$\\sqrt{63}$"],
  "A",
  "EASY",
  "**Answer: A**\n\n$h^2 = 9^2 + 12^2 = 81 + 144 = 225$, so $h = 15$ mm. (3-4-5 triangle scaled by 3.)",
);

mcq(
  SUB_PYTH,
  `${img(shapeWithLabels({ shape: "right-triangle", width: 7, height: 24, unit: "cm", hypLabel: "h" }))}\n\nThe length $h$, in centimetres, is\n\n`,
  ["$25$", "$31$", "$\\sqrt{527}$", "$\\sqrt{625}$ rounded to $24.5$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\n$h^2 = 7^2 + 24^2 = 49 + 576 = 625$, so $h = 25$ cm. (7-24-25 Pythagorean triple.)",
);

mcq(
  SUB_PYTH,
  `A rectangular paddock has length 80 m and width 60 m. The length of the diagonal across the paddock, in metres, is\n\n`,
  ["$100$", "$140$", "$\\sqrt{2800}$", "$70$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nThe diagonal of a rectangle satisfies $d^2 = l^2 + w^2 = 80^2 + 60^2 = 6400 + 3600 = 10000$, so $d = 100$ m. (3-4-5 scaled by 20.)",
);

mcq(
  SUB_PYTH,
  `A ladder of length 5 m leans against a vertical wall. The foot of the ladder is 1.5 m from the base of the wall. The height the ladder reaches up the wall, in metres correct to two decimal places, is\n\n`,
  ["$4.77$", "$3.50$", "$\\sqrt{27.25}$", "$5.22$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nLet $h$ be the height up the wall. By Pythagoras, $h^2 + 1.5^2 = 5^2$, so $h^2 = 25 - 2.25 = 22.75$, giving $h = \\sqrt{22.75} \\approx 4.770$ m, which rounds to **$4.77$** m.\n\n(Distractor B is $5 - 1.5$; C reverses the sign; D adds rather than subtracts the squares.)",
  "CAS_ALLOWED",
);

mcq(
  SUB_PYTH,
  `A rectangular box has length 6 cm, width 4 cm and height 3 cm. The length of the space diagonal from one corner to the opposite corner, in centimetres correct to two decimal places, is\n\n`,
  ["$7.81$", "$13.00$", "$5.00$", "$6.71$"],
  "A",
  "HARD",
  "**Answer: A**\n\nSpace diagonal $d$ satisfies $d^2 = l^2 + w^2 + h^2 = 6^2 + 4^2 + 3^2 = 36 + 16 + 9 = 61$, so $d = \\sqrt{61} \\approx 7.81$ cm.",
  "CAS_ALLOWED",
);

mcq(
  SUB_PYTH,
  `A right-angled triangle has hypotenuse $c$ and the two shorter sides $a$ and $b$. Which of the following formulas correctly gives one of the shorter sides?\n\n`,
  ["$a = c - b$", "$a = \\sqrt{c^2 - b^2}$", "$a = \\sqrt{c^2 + b^2}$", "$a = c^2 - b^2$"],
  "B",
  "EASY",
  "**Answer: B**\n\nRearranging $a^2 + b^2 = c^2$ for a shorter side gives $a^2 = c^2 - b^2$, so $a = \\sqrt{c^2 - b^2}$. (A confuses linear subtraction with square subtraction; C reverses the sign; D forgets to take the square root.)",
);

mcq(
  SUB_PYTH,
  `A square has side length 8 cm. The length of the diagonal, in centimetres in surd form, is\n\n`,
  ["$8\\sqrt{2}$", "$16$", "$4\\sqrt{2}$", "$\\sqrt{16}$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nThe diagonal of a square of side $s$ has length $\\sqrt{s^2 + s^2} = s\\sqrt{2}$. With $s = 8$, diagonal $= 8\\sqrt{2}$ cm.",
);

// ─── Pythagoras SHORT_ANSWER (5) ───────────────────────────────────────

short(
  SUB_PYTH,
  `Find the length of the hypotenuse of a right-angled triangle whose shorter sides have lengths 15 cm and 20 cm. (2 marks)`,
  2,
  "EASY",
  "By Pythagoras' theorem, $h^2 = 15^2 + 20^2 = 225 + 400 = 625$. (**1 mark**)\n\nTherefore $h = \\sqrt{625} = 25$ cm. (**1 mark**)\n\n(This is a 3-4-5 triangle scaled by 5.)",
);

short(
  SUB_PYTH,
  `A right-angled triangle has hypotenuse 17 cm and one shorter side of length 8 cm. Find the length of the other shorter side. (2 marks)`,
  2,
  "EASY",
  "Let the unknown side be $b$. By Pythagoras' theorem,\n\n$8^2 + b^2 = 17^2$\n\n$b^2 = 289 - 64 = 225$ (**1 mark** for setting up correctly)\n\nso $b = \\sqrt{225} = 15$ cm. (**1 mark** for correct answer)\n\n(This is the 8-15-17 Pythagorean triple.)",
);

short(
  SUB_PYTH,
  `A ladder 6.5 m long is placed with its foot 2.5 m from the base of a vertical wall. How high up the wall does the ladder reach? Give your answer in metres. (3 marks)`,
  3,
  "MEDIUM",
  "Let $h$ be the height up the wall. The wall, ground, and ladder form a right-angled triangle with the ladder as hypotenuse.\n\nBy Pythagoras' theorem, $2.5^2 + h^2 = 6.5^2$. (**1 mark**)\n\n$h^2 = 42.25 - 6.25 = 36$ (**1 mark**)\n\n$h = \\sqrt{36} = 6$ m. (**1 mark**)",
  "CAS_ALLOWED",
);

short(
  SUB_PYTH,
  `A rectangular swimming pool has length 25 m and width 10 m. Find the length of the diagonal across the pool, correct to two decimal places. (3 marks)`,
  3,
  "MEDIUM",
  "Let $d$ be the diagonal of the rectangle.\n\nBy Pythagoras' theorem, $d^2 = 25^2 + 10^2 = 625 + 100 = 725$. (**1 mark** for set-up)\n\n$d = \\sqrt{725} \\approx 26.9258$ (**1 mark** for value)\n\nCorrect to 2 dp, $d \\approx 26.93$ m. (**1 mark** for rounding)",
  "CAS_ALLOWED",
);

short(
  SUB_PYTH,
  `A rectangular box has dimensions 12 cm by 5 cm by 4 cm.\n\n**a.** Find the length of the diagonal of the rectangular base (12 cm × 5 cm face). (2 marks)\n\n**b.** Hence, find the length of the space diagonal of the box (corner to opposite corner). Give your answer correct to two decimal places. (3 marks) (5 marks total)`,
  5,
  "HARD",
  "**a.** Let $d$ be the diagonal of the base. By Pythagoras, $d^2 = 12^2 + 5^2 = 144 + 25 = 169$ (**1 mark**), so $d = 13$ cm. (**1 mark**)\n\n**b.** The space diagonal $D$ makes a right triangle with the base diagonal $d = 13$ cm and the height $4$ cm.\n\n$D^2 = 13^2 + 4^2 = 169 + 16 = 185$. (**1 mark** for set-up)\n\n$D = \\sqrt{185} \\approx 13.601$ (**1 mark** for value)\n\nCorrect to 2 dp, $D \\approx 13.60$ cm. (**1 mark** for rounding)\n\n[Equivalently $D = \\sqrt{12^2 + 5^2 + 4^2} = \\sqrt{185}$.]",
  "CAS_ALLOWED",
);

// ─── Pythagoras EXTENDED_ANSWER (2) ────────────────────────────────────

extAns(
  SUB_PYTH,
  [
    {
      label: "a",
      marks: 2,
      content: `Show that triangle $PQR$ is right-angled. Justify by checking whether the side lengths satisfy Pythagoras' theorem.`,
      solution:
        "Test: $PQ^2 + QR^2 = 9^2 + 12^2 = 81 + 144 = 225$. (**1 mark**)\n\n$PR^2 = 15^2 = 225$. (**1 mark**)\n\nSince $PQ^2 + QR^2 = PR^2$, by the converse of Pythagoras' theorem the triangle is right-angled at $Q$.",
    },
    {
      label: "b",
      marks: 2,
      content: `A second triangle has sides 11 m, 60 m and 61 m. Is this triangle right-angled? Justify your answer.`,
      solution:
        "$11^2 + 60^2 = 121 + 3600 = 3721$. (**1 mark**)\n\n$61^2 = 3721$, so $11^2 + 60^2 = 61^2$. Therefore the triangle is right-angled (11-60-61 is a Pythagorean triple). (**1 mark**)",
    },
    {
      label: "c",
      marks: 2,
      content: `A triangle has sides 8, 9 and 12. Is it right-angled?`,
      solution:
        "Largest side squared: $12^2 = 144$. (**1 mark**)\n\nSum of other two squared: $8^2 + 9^2 = 64 + 81 = 145$. Since $145 \\ne 144$, by the converse of Pythagoras the triangle is **not** right-angled. (**1 mark**)",
    },
  ],
  "MEDIUM",
  `Triangle $PQR$ has sides $PQ = 9$ cm, $QR = 12$ cm and $PR = 15$ cm.`,
  "CAS_ALLOWED",
);

extAns(
  SUB_PYTH,
  [
    {
      label: "a",
      marks: 2,
      content: `Find the length of the diagonal $BD$ of the base of the shed. Give your answer correct to two decimal places.\n\n${img(box3DSvg({ length: 4, width: 3, height: 2.5, unit: "m", showDiagonal: false }))}`,
      solution:
        "$BD$ is the diagonal of the $4 \\times 3$ rectangular base.\n\n$BD^2 = 4^2 + 3^2 = 16 + 9 = 25$ (**1 mark**)\n\n$BD = 5$ m (exact). To 2 dp: $BD = 5.00$ m. (**1 mark**)",
    },
    {
      label: "b",
      marks: 3,
      content: `A pole is to be stored diagonally inside the shed, running from one bottom corner to the opposite top corner. Find the maximum length of pole that fits, correct to two decimal places.`,
      solution:
        "This is the space diagonal $D$. Combine the base diagonal ($5$ m) and the height ($2.5$ m) into another right triangle (since the height is perpendicular to the base).\n\n$D^2 = BD^2 + h^2 = 5^2 + 2.5^2 = 25 + 6.25 = 31.25$ (**1 mark** for set-up)\n\n$D = \\sqrt{31.25} \\approx 5.5902$ (**1 mark** for value)\n\nMaximum pole length $\\approx 5.59$ m. (**1 mark** for rounding)",
    },
  ],
  "MEDIUM",
  `A garden shed has a rectangular base $ABCD$ measuring 4 m by 3 m and a height of 2.5 m.`,
  "CAS_ALLOWED",
);

// ─── Pythagoras EXTENDED_RESPONSE (2) ──────────────────────────────────

extResp(
  SUB_PYTH,
  [
    {
      label: "a",
      marks: 2,
      content: `Find the length of the diagonal of the base, in metres correct to two decimal places.`,
      solution:
        "Base diagonal $d$ satisfies $d^2 = 12^2 + 9^2 = 144 + 81 = 225$. (**1 mark**)\n\n$d = 15$ m exactly, or $15.00$ m to 2 dp. (**1 mark**)",
    },
    {
      label: "b",
      marks: 3,
      content: `The roof apex is directly above the centre of the base, at a vertical height of 4 m above the floor. Find the slant distance from a base corner to the apex, in metres correct to two decimal places.`,
      solution:
        "Half the base diagonal is $7.5$ m (since apex is above centre). Together with the apex height $4$ m we have a right triangle, hypotenuse = the slant distance $s$.\n\n$s^2 = 7.5^2 + 4^2 = 56.25 + 16 = 72.25$ (**1 mark**)\n\n$s = \\sqrt{72.25} = 8.5$ m exactly. (**2 marks** for value/working)\n\nSo $s \\approx 8.50$ m.",
    },
    {
      label: "c",
      marks: 3,
      content: `The owner wants to brace each base corner to the apex with steel cable. Each cable has 20 cm extra at each end for attachment fittings. There are 4 base corners. Find the total length of cable required, in metres correct to two decimal places.`,
      solution:
        "Length per cable = slant distance + 0.20 m (top) + 0.20 m (bottom) = $8.50 + 0.40 = 8.90$ m. (**1 mark**)\n\nFor 4 corners: $4 \\times 8.90 = 35.60$ m. (**1 mark**)\n\nTotal cable required $= 35.60$ m. (**1 mark** for correct units / rounding)",
    },
    {
      label: "d",
      marks: 3,
      content: `Show that if the apex height were instead $h$ metres, the slant distance would be $s = \\sqrt{56.25 + h^2}$ metres. Then find the value of $h$ for which $s = 10$ m, correct to two decimal places.`,
      solution:
        "From the base centre to a corner is $7.5$ m (half the diagonal, from part **a**). With apex height $h$, the slant $s$ satisfies $s^2 = 7.5^2 + h^2 = 56.25 + h^2$, so $s = \\sqrt{56.25 + h^2}$. (**1 mark**)\n\nSetting $s = 10$: $100 = 56.25 + h^2$, so $h^2 = 43.75$ (**1 mark**)\n\n$h = \\sqrt{43.75} \\approx 6.6144$, so $h \\approx 6.61$ m. (**1 mark**)",
    },
    {
      label: "e",
      marks: 2,
      content: `A second, smaller structure has a square base of side $4$ m and apex height $3$ m above the centre. Find the slant distance from a base corner to the apex, correct to two decimal places.`,
      solution:
        "Diagonal of the square base $= 4\\sqrt{2}$ m, so half-diagonal $= 2\\sqrt{2}$ m.\n\nSlant $s$ satisfies $s^2 = (2\\sqrt{2})^2 + 3^2 = 8 + 9 = 17$ (**1 mark**)\n\n$s = \\sqrt{17} \\approx 4.123$, so $s \\approx 4.12$ m. (**1 mark**)",
    },
  ],
  "HARD",
  `**Pavilion design**\n\nAn open-air pavilion has a rectangular concrete slab base measuring 12 m by 9 m. A steel-framed pyramid roof is to be constructed with its apex directly above the centre of the slab. The design team needs to specify diagonal distances and cable lengths for the structural bracing.`,
  "CAS_ALLOWED",
);

extResp(
  SUB_PYTH,
  [
    {
      label: "a",
      marks: 2,
      content: `Find the length of $AC$, the bottom diagonal across the base of the box, correct to two decimal places.\n\n${img(box3DSvg({ length: 30, width: 12, height: 18, unit: "cm", showDiagonal: false }))}`,
      solution:
        "$AC^2 = 30^2 + 12^2 = 900 + 144 = 1044$ (**1 mark**)\n\n$AC = \\sqrt{1044} \\approx 32.31$ cm. (**1 mark**)",
    },
    {
      label: "b",
      marks: 3,
      content: `Hence find the length of the space diagonal $AG$ — from the bottom corner to the top corner diagonally opposite. Give your answer correct to two decimal places.`,
      solution:
        "Using right triangle $ACG$ (where $CG = 18$ cm vertical):\n\n$AG^2 = AC^2 + CG^2 = 1044 + 18^2 = 1044 + 324 = 1368$ (**1 mark**)\n\n$AG = \\sqrt{1368}$ (**1 mark**)\n\n$AG \\approx 36.99$ cm. (**1 mark**)\n\n[Equivalently $AG = \\sqrt{30^2 + 12^2 + 18^2} = \\sqrt{1368}$.]",
    },
    {
      label: "c",
      marks: 2,
      content: `A telescopic walking stick has segments. When fully extended, its length must fit diagonally inside the box. Will a stick of length 37.5 cm fit? Justify your answer.`,
      solution:
        "From part **b**, the longest internal segment (space diagonal) is approximately $36.99$ cm. (**1 mark**)\n\nSince $37.5 > 36.99$, the stick will **not** fit fully extended. (**1 mark**)",
    },
    {
      label: "d",
      marks: 3,
      content: `A second box of identical dimensions is placed on top of the first, doubling the height to 36 cm. Find the new space diagonal of the combined box, correct to two decimal places.`,
      solution:
        "New space diagonal $D'$ uses the same base diagonal $AC$ but height 36 cm.\n\n$D'^2 = 1044 + 36^2 = 1044 + 1296 = 2340$ (**1 mark**)\n\n$D' = \\sqrt{2340}$ (**1 mark**)\n\n$D' \\approx 48.37$ cm. (**1 mark**)",
    },
    {
      label: "e",
      marks: 2,
      content: `A drone flies in a straight line from corner $A$ (bottom) to a point $P$ on the top face, directly above the centre of the top face. The top face has dimensions $30 \\times 12$ cm. Find the length $AP$, correct to two decimal places, for the original 18-cm-high box.`,
      solution:
        "Centre of top face is at horizontal coordinates $(15, 6)$ from $A$'s vertical column at $(0, 0)$, at height $18$ cm above $A$.\n\n$AP^2 = 15^2 + 6^2 + 18^2 = 225 + 36 + 324 = 585$ (**1 mark**)\n\n$AP = \\sqrt{585} \\approx 24.19$ cm. (**1 mark**)",
    },
  ],
  "HARD",
  `**Storage box diagonals**\n\nA rectangular storage box has internal dimensions 30 cm long, 12 cm wide and 18 cm high. Corners are labelled so that $A$ is the bottom front-left, $B$ bottom front-right, $C$ bottom back-right, $D$ bottom back-left, and $E, F, G, H$ are directly above $A, B, C, D$ respectively.`,
  "CAS_ALLOWED",
);

// ════════════════════════════════════════════════════════════════════════
// SUBTOPIC 2 — MENSURATION (perimeter / circumference) (core-drill: 12/5/2/2)
// ════════════════════════════════════════════════════════════════════════

const SUB_MENS = "mensuration";

// ─── Mensuration MCQ (12) ───────────────────────────────────────────────

mcq(
  SUB_MENS,
  `The perimeter of a rectangle with length 12 cm and width 8 cm is\n\n`,
  ["$20$ cm", "$40$ cm", "$96$ cm", "$24$ cm"],
  "B",
  "EASY",
  "**Answer: B**\n\n$P = 2(l + w) = 2(12 + 8) = 2 \\times 20 = 40$ cm. (Distractor A is $l + w$; C is $l \\times w$ — area; D is $2 \\times l$ only.)",
);

mcq(
  SUB_MENS,
  `The circumference of a circle with radius 5 cm, in centimetres, is\n\n`,
  ["$10\\pi$", "$25\\pi$", "$5\\pi$", "$\\pi/5$"],
  "A",
  "EASY",
  "**Answer: A**\n\n$C = 2\\pi r = 2\\pi(5) = 10\\pi$ cm. (Distractor B is $\\pi r^2$ — area; C is $\\pi r$.)",
);

mcq(
  SUB_MENS,
  `A square has side length $s$ cm. Its perimeter, in centimetres, is\n\n`,
  ["$s^2$", "$4s$", "$2s$", "$s/4$"],
  "B",
  "EASY",
  "**Answer: B**\n\nA square has 4 equal sides, so $P = 4s$. (A is the area; C is half-perimeter; D is one quarter.)",
);

mcq(
  SUB_MENS,
  `The circumference of a circle is $24\\pi$ m. The radius of the circle is\n\n`,
  ["$12$ m", "$24$ m", "$48$ m", "$\\sqrt{24}$ m"],
  "A",
  "EASY",
  "**Answer: A**\n\n$C = 2\\pi r \\Rightarrow 24\\pi = 2\\pi r \\Rightarrow r = 12$ m.",
);

mcq(
  SUB_MENS,
  `A rectangle has length 15 cm and perimeter 50 cm. The width of the rectangle, in centimetres, is\n\n`,
  ["$10$", "$20$", "$35$", "$17.5$"],
  "A",
  "EASY",
  "**Answer: A**\n\n$P = 2(l + w) \\Rightarrow 50 = 2(15 + w) \\Rightarrow 25 = 15 + w \\Rightarrow w = 10$ cm.",
);

mcq(
  SUB_MENS,
  `A semicircle has straight diameter 14 cm. The total perimeter of the semicircle (curved arc plus diameter), in centimetres, to one decimal place, is\n\n`,
  ["$36.0$", "$22.0$", "$43.9$", "$31.4$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nRadius $r = 7$ cm. Curved arc = $\\frac{1}{2} \\cdot 2\\pi r = \\pi r = 7\\pi \\approx 21.99$ cm.\n\nPerimeter = arc + diameter $= 21.99 + 14 = 35.99 \\approx 36.0$ cm.",
  "CAS_ALLOWED",
);

mcq(
  SUB_MENS,
  `A circular athletics track has radius 50 m. The length of one full lap, in metres correct to the nearest metre, is\n\n`,
  ["$314$", "$157$", "$100$", "$251$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\n$C = 2\\pi r = 2\\pi(50) = 100\\pi \\approx 314.16$ m, which rounds to $314$ m.",
  "CAS_ALLOWED",
);

mcq(
  SUB_MENS,
  `A sector has radius 6 cm and a central angle of $60°$. The length of the arc, in centimetres in terms of $\\pi$, is\n\n`,
  ["$2\\pi$", "$6\\pi$", "$12\\pi$", "$\\pi/2$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nArc length $= \\frac{\\theta}{360} \\cdot 2\\pi r = \\frac{60}{360} \\cdot 2\\pi(6) = \\frac{1}{6} \\cdot 12\\pi = 2\\pi$ cm.",
);

mcq(
  SUB_MENS,
  `${img(shapeWithLabels({ shape: "rectangle", width: 9, height: 5, unit: "m" }))}\n\nThe perimeter of the rectangle above, in metres, is\n\n`,
  ["$14$", "$28$", "$45$", "$45/2$"],
  "B",
  "EASY",
  "**Answer: B**\n\n$P = 2(9 + 5) = 28$ m. (A is $l + w$; C is the area.)",
);

mcq(
  SUB_MENS,
  `A composite shape consists of a $10 \\times 8$ rectangle with a semicircle of diameter 8 attached to one of the short ends. The perimeter of the composite, in metres correct to one decimal place, is\n\n`,
  ["$40.6$", "$53.1$", "$36.0$", "$28.0$"],
  "A",
  "HARD",
  "**Answer: A**\n\nPerimeter = three rectangle sides (10 + 10 + 8) + semicircular arc (diameter 8 ⇒ arc $= \\pi \\cdot 4 = 4\\pi$) $- 0$ (the short side is replaced by the arc).\n\nPerimeter $= 10 + 10 + 8 + 4\\pi = 28 + 4\\pi \\approx 28 + 12.566 = 40.566 \\approx 40.6$ m.",
  "CAS_ALLOWED",
);

mcq(
  SUB_MENS,
  `A circle has circumference 18 cm. Its diameter, in centimetres correct to two decimal places, is\n\n`,
  ["$5.73$", "$9.00$", "$2.86$", "$3.14$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\n$C = \\pi d \\Rightarrow d = C / \\pi = 18 / \\pi \\approx 5.73$ cm.",
  "CAS_ALLOWED",
);

mcq(
  SUB_MENS,
  `An equilateral triangle has perimeter 27 cm. The length of one side, in centimetres, is\n\n`,
  ["$9$", "$13.5$", "$81$", "$3$"],
  "A",
  "EASY",
  "**Answer: A**\n\nAn equilateral triangle has 3 equal sides, so each side $= 27 / 3 = 9$ cm.",
);

// ─── Mensuration SHORT_ANSWER (5) ──────────────────────────────────────

short(
  SUB_MENS,
  `A rectangle has length 18 m and width 11 m. Calculate the perimeter of the rectangle. (2 marks)`,
  2,
  "EASY",
  "$P = 2(l + w)$ (**1 mark** for formula or substitution)\n\n$P = 2(18 + 11) = 2 \\times 29 = 58$ m. (**1 mark** for answer)",
);

short(
  SUB_MENS,
  `Calculate the circumference of a circle with radius 12 cm. Give your answer correct to two decimal places. (2 marks)`,
  2,
  "EASY",
  "$C = 2\\pi r = 2\\pi(12) = 24\\pi$ cm (**1 mark**)\n\n$C \\approx 75.398$, so $C \\approx 75.40$ cm. (**1 mark**)",
  "CAS_ALLOWED",
);

short(
  SUB_MENS,
  `A circular running track has radius 35 m.\n\n**a.** Calculate the circumference of the track, correct to the nearest metre. (2 marks)\n\n**b.** A runner completes 8 full laps. Find the total distance run, in kilometres correct to two decimal places. (2 marks) (4 marks total)`,
  4,
  "MEDIUM",
  "**a.** $C = 2\\pi r = 2\\pi(35) = 70\\pi \\approx 219.91$ m. (**1 mark** for formula)\n\nNearest metre: $C \\approx 220$ m. (**1 mark**)\n\n**b.** Total = $8 \\times 219.91 \\approx 1759.29$ m. (**1 mark**)\n\nConvert to km: $1759.29 / 1000 = 1.75929$ km $\\approx 1.76$ km. (**1 mark**)",
  "CAS_ALLOWED",
);

short(
  SUB_MENS,
  `A sector of a circle has radius 9 cm and central angle $120°$.\n\n**a.** Find the arc length of the sector, in centimetres correct to two decimal places. (2 marks)\n\n**b.** Find the perimeter of the sector (arc plus two radii), correct to two decimal places. (1 mark) (3 marks total)`,
  3,
  "MEDIUM",
  "**a.** Arc length $= \\frac{\\theta}{360} \\cdot 2\\pi r = \\frac{120}{360} \\cdot 2\\pi(9) = \\frac{1}{3} \\cdot 18\\pi = 6\\pi$ cm. (**1 mark** for set-up)\n\n$\\approx 18.8496 \\approx 18.85$ cm. (**1 mark** for value)\n\n**b.** Perimeter = arc + 2 × radius = $6\\pi + 18 \\approx 18.85 + 18 = 36.85$ cm. (**1 mark**)",
  "CAS_ALLOWED",
);

short(
  SUB_MENS,
  `A garden bed consists of a rectangle of length 6 m and width 2 m, with a semicircular extension of diameter 2 m added to one of the short ends. Sketch a labelled diagram showing the composite shape and find the total perimeter of the garden bed, correct to two decimal places. (4 marks)`,
  4,
  "HARD",
  "Sketch: rectangle $6 \\times 2$, with a half-circle of diameter 2 (radius 1) bulging out on one short side. (**1 mark** for valid labelled diagram)\n\nPerimeter consists of: $6 + 2 + 6 = 14$ m (two long sides + one short side) plus the semicircular arc that replaces the other short side.\n\nSemicircle arc $= \\pi r = \\pi(1) = \\pi$ m. (**1 mark** for arc)\n\nTotal perimeter $= 14 + \\pi \\approx 14 + 3.14159 = 17.14159$ m. (**1 mark**)\n\nTo 2 dp: $\\approx 17.14$ m. (**1 mark**)",
  "CAS_ALLOWED",
);

// ─── Mensuration EXTENDED_ANSWER (2) ───────────────────────────────────

extAns(
  SUB_MENS,
  [
    {
      label: "a",
      marks: 2,
      content: `Find the perimeter of an athletics track that consists of a rectangle of length 84.39 m and width 73 m, with semicircular ends added to the two short sides (diameter equal to the width). Express the perimeter in terms of $\\pi$ and as a decimal correct to two decimal places.`,
      solution:
        "The track outline = two straight rectangle long sides + two semicircular arcs (radius $= 73/2 = 36.5$ m). The two semicircles together = one full circle.\n\nPerimeter $= 2 \\times 84.39 + 2\\pi(36.5)$ (**1 mark** for set-up)\n\n$= 168.78 + 73\\pi$.\n\n$\\approx 168.78 + 229.336 = 398.116 \\approx 398.12$ m. (**1 mark**)",
    },
    {
      label: "b",
      marks: 2,
      content: `An athlete completes 4 full laps of the track from part **a**. Find the total distance run, in metres and in kilometres correct to two decimal places.`,
      solution:
        "Distance $= 4 \\times 398.12 = 1592.48$ m. (**1 mark**)\n\nIn kilometres: $1592.48 / 1000 = 1.59248$ km $\\approx 1.59$ km. (**1 mark**)",
    },
    {
      label: "c",
      marks: 1,
      content: `Estimate the cost of installing kerbing along the inside edge of one lap if the kerbing costs \\$45 per metre. Give the cost to the nearest dollar.`,
      solution:
        "Cost $= 398.12 \\times 45 \\approx \\$17{,}915$. (**1 mark**)",
    },
  ],
  "MEDIUM",
  `An athletics track has straight sides of length 84.39 m and semicircular ends; the width across the track is 73 m.`,
  "CAS_ALLOWED",
);

extAns(
  SUB_MENS,
  [
    {
      label: "a",
      marks: 2,
      content: `A clock face has a minute hand of length 9 cm. The tip of the minute hand moves along a circle of radius 9 cm. How far does the tip of the minute hand travel in one full revolution (60 minutes)? Give the answer correct to two decimal places.`,
      solution:
        "Circumference $= 2\\pi r = 2\\pi(9) = 18\\pi$ cm. (**1 mark**)\n\n$\\approx 56.5487 \\approx 56.55$ cm. (**1 mark**)",
    },
    {
      label: "b",
      marks: 2,
      content: `How far does the tip travel in 20 minutes? Give your answer correct to two decimal places.`,
      solution:
        "In 20 minutes the hand sweeps $20/60 = 1/3$ of the circle.\n\nArc $= (1/3)(18\\pi) = 6\\pi \\approx 18.8496$ cm $\\approx 18.85$ cm. (**1 mark** for set-up, **1 mark** for value)",
    },
    {
      label: "c",
      marks: 2,
      content: `The hour hand is 6 cm long. How far does the tip of the hour hand travel in 4 hours? Give your answer correct to two decimal places.`,
      solution:
        "The hour hand makes one full revolution in 12 hours, so in 4 hours it sweeps $4/12 = 1/3$ of the circle.\n\nFull circumference for hour hand $= 2\\pi(6) = 12\\pi$ cm. (**1 mark**)\n\nArc in 4 h $= (1/3)(12\\pi) = 4\\pi \\approx 12.5664 \\approx 12.57$ cm. (**1 mark**)",
    },
    {
      label: "d",
      marks: 1,
      content: `In one full day (24 hours), how many full revolutions does the minute hand complete?`,
      solution:
        "The minute hand completes one revolution per hour, so in 24 hours it completes $24$ full revolutions. (**1 mark**)",
    },
  ],
  "MEDIUM",
  `A traditional analogue clock has a minute hand of length 9 cm and an hour hand of length 6 cm.`,
  "CAS_ALLOWED",
);

// ─── Mensuration EXTENDED_RESPONSE (2) ─────────────────────────────────

extResp(
  SUB_MENS,
  [
    {
      label: "a",
      marks: 2,
      content: `Find the circumference of the wheel, in metres correct to four decimal places.`,
      solution:
        "Diameter $= 70$ cm $= 0.70$ m. (**1 mark**)\n\n$C = \\pi d = \\pi(0.70) = 0.7\\pi$ m $\\approx 2.1991$ m. (**1 mark**)",
    },
    {
      label: "b",
      marks: 3,
      content: `How many full revolutions does the wheel make in travelling 1 km? Give your answer to the nearest whole revolution.`,
      solution:
        "One revolution moves the bike forward by the circumference, $0.7\\pi$ m.\n\nNumber of revolutions $= 1000 / (0.7\\pi) = 1000 / 2.1991 \\approx 454.728$. (**1 mark**)\n\nNearest whole revolution: $\\approx 455$ revolutions. (**1 mark**) Strictly, $454$ full revolutions completed plus a partial — but since the question asks 'how many full revolutions in travelling 1 km', the answer is **454** full revolutions (since the 455th is incomplete). (**1 mark** for justification)",
    },
    {
      label: "c",
      marks: 3,
      content: `A cyclist pedals such that the wheel rotates at 80 revolutions per minute. Find the cyclist's speed, in kilometres per hour correct to one decimal place.`,
      solution:
        "Distance per minute $= 80 \\times 0.7\\pi = 56\\pi$ m. (**1 mark**)\n\n$\\approx 175.929$ m/min.\n\nIn km/h: multiply by 60 to get m/h, then divide by 1000:\n\n$175.929 \\times 60 / 1000 = 10.5557$ km/h. (**1 mark**)\n\nTo 1 dp: $\\approx 10.6$ km/h. (**1 mark**)",
    },
    {
      label: "d",
      marks: 3,
      content: `A circular bike track has a 200-metre lap. How many revolutions does the wheel complete per lap, correct to two decimal places? Hence find the lap distance covered after exactly 50 revolutions, in metres correct to two decimal places.`,
      solution:
        "Revolutions per lap $= 200 / (0.7\\pi) \\approx 200 / 2.1991 \\approx 90.946$. (**1 mark**)\n\nTo 2 dp: $\\approx 90.95$ revolutions per lap. (**1 mark**)\n\nAfter 50 revolutions, distance $= 50 \\times 0.7\\pi = 35\\pi \\approx 109.956 \\approx 109.96$ m. (**1 mark**)",
    },
    {
      label: "e",
      marks: 2,
      content: `Comment on whether the wheel's diameter alone determines how far the bike travels per minute, or whether other factors are involved. (Brief reasoning only.)`,
      solution:
        "The distance per minute depends on both the **circumference** (= $\\pi d$, set by the diameter) and the **rotation rate** (revolutions per minute). (**1 mark**)\n\nA larger diameter gives more distance per revolution, but the cyclist's pedalling rate (and gearing) controls revolutions per minute. So diameter is necessary but not sufficient — the rate matters too. (**1 mark**)",
    },
  ],
  "MEDIUM",
  `**Bicycle wheel motion**\n\nA bicycle has a wheel of diameter 70 cm. The wheel rolls without slipping along a flat road; the bike's forward distance per revolution equals the circumference of the wheel.`,
  "CAS_ALLOWED",
);

extResp(
  SUB_MENS,
  [
    {
      label: "a",
      marks: 2,
      content: `Find the total length of fencing required to enclose the rectangular paddock. Note: the side adjacent to the existing fence does **not** need new fencing.`,
      solution:
        "Existing fence is on one of the long sides. New fencing required: two short sides ($30 + 30 = 60$ m) + one remaining long side (50 m). (**1 mark**)\n\nTotal new fencing $= 60 + 50 = 110$ m. (**1 mark**)",
    },
    {
      label: "b",
      marks: 3,
      content: `The farmer then decides to add a circular ornamental pond of diameter 4 m inside the paddock. Find the circumference of the pond, in metres correct to two decimal places, and the total fencing required for the perimeter of the pond.`,
      solution:
        "Pond circumference $= \\pi d = \\pi(4) = 4\\pi \\approx 12.5664$ m. (**1 mark**)\n\nTo 2 dp: $\\approx 12.57$ m. (**1 mark**)\n\nThe perimeter fencing for the pond $= 12.57$ m (one full loop). (**1 mark**)",
    },
    {
      label: "c",
      marks: 2,
      content: `The farmer also wants to add a path that forms a semicircular border on one of the short ends, of diameter equal to the width of the paddock (30 m). Find the perimeter of the semicircular path (arc only), in metres correct to two decimal places.`,
      solution:
        "Radius $= 15$ m. Semicircular arc $= \\pi r = \\pi(15) = 15\\pi \\approx 47.1239$ m. (**1 mark**)\n\nTo 2 dp: $\\approx 47.12$ m. (**1 mark**)",
    },
    {
      label: "d",
      marks: 3,
      content: `Total fencing budget is \\$50/m. Find the total cost of fencing for: the new paddock perimeter (part **a**), the pond perimeter (part **b**), and the semicircular path (part **c**). Give the total cost to the nearest dollar.`,
      solution:
        "Fencing lengths: $110 + 12.57 + 47.12 = 169.69$ m. (**1 mark**)\n\nCost $= 169.69 \\times \\$50 = \\$8484.50$. (**1 mark**)\n\nNearest dollar: $\\approx \\$8{,}485$. (**1 mark**)",
    },
    {
      label: "e",
      marks: 3,
      content: `Suppose the paddock dimensions were to be doubled in both length and width (now 100 m by 60 m). Find the new fencing required for the paddock alone (still excluding one long side as before) and compare it to the original. Express the new perimeter as a ratio of the original.`,
      solution:
        "New required fencing $= 60 + 60 + 100 = 220$ m. (**1 mark**)\n\nOriginal was $110$ m, so ratio $= 220 / 110 = 2 : 1$. (**1 mark**)\n\nThe perimeter doubles when all linear dimensions double — consistent with linear scaling. (**1 mark**)",
    },
  ],
  "MEDIUM",
  `**Paddock and pond fencing**\n\nA farmer has a rectangular paddock measuring 50 m by 30 m. One of the long sides already has an existing fence, and the farmer needs to fence the remaining sides. Additional features will be added later.`,
  "CAS_ALLOWED",
);

// ════════════════════════════════════════════════════════════════════════
// SUBTOPIC 3 — AREA AND SURFACE AREA (extended-fit: 9/4/2/2)
// ════════════════════════════════════════════════════════════════════════

const SUB_AREA = "area-and-surface-area";

// ─── Area MCQ (9) ──────────────────────────────────────────────────────

mcq(
  SUB_AREA,
  `The area of a rectangle with length 14 cm and width 8 cm is\n\n`,
  ["$22$ cm²", "$44$ cm²", "$112$ cm²", "$56$ cm²"],
  "C",
  "EASY",
  "**Answer: C**\n\n$A = l \\times w = 14 \\times 8 = 112$ cm². (Distractor A is half-perimeter; B is full perimeter.)",
);

mcq(
  SUB_AREA,
  `The area of a triangle with base 12 m and perpendicular height 5 m is\n\n`,
  ["$30$ m²", "$60$ m²", "$17$ m²", "$25$ m²"],
  "A",
  "EASY",
  "**Answer: A**\n\n$A = \\frac{1}{2}bh = \\frac{1}{2}(12)(5) = 30$ m². (Distractor B forgets the $\\frac{1}{2}$; C is $b + h$; D is $h^2$.)",
);

mcq(
  SUB_AREA,
  `The area of a circle with radius 10 cm, in cm² in terms of $\\pi$, is\n\n`,
  ["$10\\pi$", "$20\\pi$", "$100\\pi$", "$\\pi/100$"],
  "C",
  "EASY",
  "**Answer: C**\n\n$A = \\pi r^2 = \\pi(10)^2 = 100\\pi$ cm². (A is the radius; B is the circumference.)",
);

mcq(
  SUB_AREA,
  `A trapezium has parallel sides of length 8 cm and 12 cm, and a perpendicular height of 5 cm. Its area, in cm², is\n\n`,
  ["$50$", "$100$", "$25$", "$60$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\n$A = \\frac{1}{2}(a + b)h = \\frac{1}{2}(8 + 12)(5) = \\frac{1}{2}(20)(5) = 50$ cm².",
);

mcq(
  SUB_AREA,
  `A triangle has sides 6 cm and 9 cm with an included angle of $30°$. Its area, in cm², is\n\n`,
  ["$13.5$", "$27$", "$54$", "$23.4$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\n$A = \\frac{1}{2}ab\\sin C = \\frac{1}{2}(6)(9)\\sin 30° = \\frac{1}{2}(54)(0.5) = 13.5$ cm².",
);

mcq(
  SUB_AREA,
  `A sector of a circle has radius 6 cm and central angle $90°$. Its area, in cm² in terms of $\\pi$, is\n\n`,
  ["$3\\pi$", "$6\\pi$", "$9\\pi$", "$36\\pi$"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\n$A = \\frac{\\theta}{360} \\pi r^2 = \\frac{90}{360} \\pi (6)^2 = \\frac{1}{4}(36\\pi) = 9\\pi$ cm².",
);

mcq(
  SUB_AREA,
  `The total surface area of a closed cylinder with radius 4 cm and height 10 cm, in cm² in terms of $\\pi$, is\n\n`,
  ["$80\\pi$", "$112\\pi$", "$40\\pi$", "$160\\pi$"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$SA = 2\\pi r^2 + 2\\pi r h = 2\\pi(16) + 2\\pi(4)(10) = 32\\pi + 80\\pi = 112\\pi$ cm². (A is just the side; C is just the top.)",
);

mcq(
  SUB_AREA,
  `The surface area of a sphere with radius 5 cm, in cm² in terms of $\\pi$, is\n\n`,
  ["$100\\pi$", "$25\\pi$", "$\\frac{500}{3}\\pi$", "$50\\pi$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\n$SA = 4\\pi r^2 = 4\\pi(25) = 100\\pi$ cm². (C is the volume.)",
);

mcq(
  SUB_AREA,
  `A composite shape consists of a rectangle of length 8 cm and width 6 cm, with a semicircle of diameter 6 cm attached to one short side (the diameter matches the 6 cm short side). The total area, in cm² correct to two decimal places, is\n\n`,
  ["$48.00$", "$62.14$", "$76.27$", "$54.71$"],
  "B",
  "HARD",
  "**Answer: B**\n\nRectangle area $= 8 \\times 6 = 48$ cm². (Distractor A.)\n\nSemicircle radius $= 3$ cm, area $= \\frac{1}{2}\\pi r^2 = \\frac{1}{2}\\pi(9) = 4.5\\pi \\approx 14.137$ cm².\n\nTotal area $= 48 + 14.137 \\approx 62.137$, so $\\approx 62.14$ cm². (Distractor C uses radius 6; D uses diameter 6 but full circle.)",
  "CAS_ALLOWED",
);

// ─── Area SHORT_ANSWER (4) ─────────────────────────────────────────────

short(
  SUB_AREA,
  `Calculate the area of a parallelogram with base 14 cm and perpendicular height 9 cm. (2 marks)`,
  2,
  "EASY",
  "$A = b \\times h$ (**1 mark** for formula)\n\n$A = 14 \\times 9 = 126$ cm². (**1 mark**)",
);

short(
  SUB_AREA,
  `Calculate the area of a sector with radius 10 cm and central angle $72°$. Give your answer correct to two decimal places. (3 marks)`,
  3,
  "MEDIUM",
  "$A = \\frac{\\theta}{360} \\pi r^2$ (**1 mark** for formula)\n\n$A = \\frac{72}{360} \\pi (10)^2 = 0.2 \\times 100\\pi = 20\\pi$ cm². (**1 mark**)\n\n$\\approx 62.8319 \\approx 62.83$ cm². (**1 mark**)",
  "CAS_ALLOWED",
);

short(
  SUB_AREA,
  `Find the total surface area of a closed cylinder with radius 5 cm and height 12 cm. Give your answer in terms of $\\pi$ and to the nearest whole cm². (3 marks)`,
  3,
  "MEDIUM",
  "$SA = 2\\pi r^2 + 2\\pi r h$ (**1 mark** for formula)\n\n$= 2\\pi(25) + 2\\pi(5)(12) = 50\\pi + 120\\pi = 170\\pi$ cm². (**1 mark** for exact form)\n\n$\\approx 533.8$, so $\\approx 534$ cm². (**1 mark** for rounded value)",
  "CAS_ALLOWED",
);

short(
  SUB_AREA,
  `A spherical ball has a diameter of 18 cm. Find its surface area, correct to the nearest whole cm². (3 marks)`,
  3,
  "MEDIUM",
  "Radius $r = 9$ cm. (**1 mark**)\n\n$SA = 4\\pi r^2 = 4\\pi(81) = 324\\pi$ cm². (**1 mark**)\n\n$\\approx 1017.9$, so $\\approx 1018$ cm². (**1 mark**)",
  "CAS_ALLOWED",
);

// ─── Area EXTENDED_ANSWER (2) ──────────────────────────────────────────

extAns(
  SUB_AREA,
  [
    {
      label: "a",
      marks: 2,
      content: `Find the area of the rectangular section of the lawn.\n\n${img(shapeWithLabels({ shape: "rectangle", width: 12, height: 8, unit: "m" }))}`,
      solution:
        "$A_{\\text{rect}} = l \\times w = 12 \\times 8 = 96$ m². (**2 marks**)",
    },
    {
      label: "b",
      marks: 3,
      content: `A semicircular flowerbed of diameter 8 m is to be removed (cut out) from one of the short ends of the lawn. Find the area remaining (the lawn minus the flowerbed), correct to two decimal places.`,
      solution:
        "Semicircle radius $= 4$ m. Semicircle area $= \\frac{1}{2}\\pi r^2 = \\frac{1}{2}\\pi(16) = 8\\pi \\approx 25.1327$ m². (**1 mark**)\n\nRemaining area $= 96 - 25.1327 = 70.8673$ m². (**1 mark**)\n\nTo 2 dp: $\\approx 70.87$ m². (**1 mark**)",
    },
    {
      label: "c",
      marks: 2,
      content: `Fertiliser covers 12 m² per kilogram. How many kilograms of fertiliser are needed to cover the remaining lawn? Round up to the nearest 0.5 kg.`,
      solution:
        "Kg needed $= 70.87 / 12 \\approx 5.906$ kg. (**1 mark**)\n\nRound up to nearest 0.5 kg: $6.0$ kg required. (**1 mark**)",
    },
  ],
  "MEDIUM",
  `A rectangular lawn measures 12 m by 8 m.`,
  "CAS_ALLOWED",
);

extAns(
  SUB_AREA,
  [
    {
      label: "a",
      marks: 2,
      content: `Find the total surface area of the closed cylindrical can (top + bottom + side). Give the answer in terms of $\\pi$ and to one decimal place in cm².\n\n${img(cylinderSvg({ radius: 4, height: 10, unit: "cm" }))}`,
      solution:
        "$SA = 2\\pi r^2 + 2\\pi r h = 2\\pi(16) + 2\\pi(4)(10) = 32\\pi + 80\\pi = 112\\pi$ cm². (**1 mark**)\n\n$\\approx 351.86 \\approx 351.9$ cm². (**1 mark**)",
    },
    {
      label: "b",
      marks: 2,
      content: `A label wraps around the curved (side) surface only — not the top or bottom. Find the area of the label, in cm² correct to one decimal place.`,
      solution:
        "Label area $= 2\\pi r h = 2\\pi(4)(10) = 80\\pi$ cm² (**1 mark**)\n\n$\\approx 251.33 \\approx 251.3$ cm². (**1 mark**)",
    },
    {
      label: "c",
      marks: 2,
      content: `An open-topped cylindrical bucket has the same dimensions (radius 4 cm, height 10 cm) but no lid. Find the total external surface area (one circular base + side), correct to one decimal place.`,
      solution:
        "$SA = \\pi r^2 + 2\\pi r h = \\pi(16) + 80\\pi = 16\\pi + 80\\pi = 96\\pi$ cm² (**1 mark**)\n\n$\\approx 301.59 \\approx 301.6$ cm². (**1 mark**)",
    },
  ],
  "MEDIUM",
  `A closed cylindrical can has radius 4 cm and height 10 cm.`,
  "CAS_ALLOWED",
);

// ─── Area EXTENDED_RESPONSE (2) ────────────────────────────────────────

extResp(
  SUB_AREA,
  [
    {
      label: "a",
      marks: 3,
      content: `Find the area of the rectangular living room of dimensions $5 \\text{ m} \\times 4 \\text{ m}$ and the circular dining alcove (radius $1.5$ m) separately. Hence find the total floor area to be carpeted.`,
      solution:
        "Living room: $A_1 = 5 \\times 4 = 20$ m². (**1 mark**)\n\nDining alcove: $A_2 = \\pi r^2 = \\pi(1.5)^2 = 2.25\\pi \\approx 7.0686$ m². (**1 mark**)\n\nTotal $= 20 + 7.0686 = 27.0686 \\approx 27.07$ m². (**1 mark**)",
    },
    {
      label: "b",
      marks: 2,
      content: `Carpet costs \\$85 per square metre and is sold by the whole square metre. Find the cost of carpeting the entire area (rounding up the area to the nearest whole m²).`,
      solution:
        "Round up: $\\lceil 27.07 \\rceil = 28$ m². (**1 mark**)\n\nCost $= 28 \\times \\$85 = \\$2{,}380$. (**1 mark**)",
    },
    {
      label: "c",
      marks: 3,
      content: `A rectangular rug of dimensions $3 \\text{ m} \\times 2 \\text{ m}$ is to be laid in the living room. The rug must have at least 50 cm clearance on all sides from the room walls. Verify whether the rug fits, and find the percentage of the living room floor it covers.`,
      solution:
        "Required clearance: 0.5 m on each side, so usable space = $(5 - 1) \\times (4 - 1) = 4 \\times 3$ m. (**1 mark**)\n\nRug $3 \\times 2$: fits within $4 \\times 3$. ✓ (**1 mark**)\n\nPercentage of room covered: $\\dfrac{3 \\times 2}{5 \\times 4} \\times 100 = \\dfrac{6}{20} \\times 100 = 30\\%$. (**1 mark**)",
    },
    {
      label: "d",
      marks: 3,
      content: `The walls of the living room are 2.4 m high. Find the total area of the four walls (ignoring doors and windows), and hence the cost of painting them at \\$12 per square metre.`,
      solution:
        "Perimeter $= 2(5 + 4) = 18$ m. (**1 mark**)\n\nWall area $= 18 \\times 2.4 = 43.2$ m². (**1 mark**)\n\nPainting cost $= 43.2 \\times \\$12 = \\$518.40$. (**1 mark**)",
    },
    {
      label: "e",
      marks: 2,
      content: `If the room were enlarged so that all horizontal dimensions doubled, what would be the new floor area? Comment on the scale factor for area.`,
      solution:
        "Doubling linear dimensions: living room becomes $10 \\times 8 = 80$ m² and the alcove becomes radius $3$ m, area $9\\pi \\approx 28.27$ m². (**1 mark**)\n\nNew total $\\approx 108.27$ m², compared with original $27.07$ m². Ratio $\\approx 4 : 1$, confirming that areas scale by the square of the linear factor ($k = 2 \\Rightarrow k^2 = 4$). (**1 mark**)",
    },
  ],
  "MEDIUM",
  `**Living-area renovation**\n\nA living room has a rectangular floor plan of 5 m by 4 m, with a small circular dining alcove of radius 1.5 m attached to one side (the alcove area is in addition to the rectangular area). The owner is renovating and needs to estimate carpeting, painting, and rug placement costs.`,
  "CAS_ALLOWED",
);

extResp(
  SUB_AREA,
  [
    {
      label: "a",
      marks: 3,
      content: `Find the total surface area of the closed cylindrical tank (top + bottom + curved side). Give your answer to the nearest whole m².\n\nCylinder dimensions: radius $1.5$ m, height $4$ m.`,
      solution:
        "$SA = 2\\pi r^2 + 2\\pi r h = 2\\pi(2.25) + 2\\pi(1.5)(4) = 4.5\\pi + 12\\pi = 16.5\\pi$ m². (**1 mark**)\n\n$\\approx 51.836$ m². (**1 mark**)\n\nNearest whole: $\\approx 52$ m². (**1 mark**)",
    },
    {
      label: "b",
      marks: 3,
      content: `Paint covers 8 m² per litre. Find the number of full litres of paint required to cover the entire external surface.`,
      solution:
        "Litres $= 51.836 / 8 \\approx 6.4795$. (**1 mark**)\n\nRound up to whole litres: $7$ L required to ensure complete coverage. (**1 mark**)\n\nAlternative: nearest is $6$ — but for *full coverage* you need at least $\\lceil 6.4795 \\rceil = 7$ L. (**1 mark** for justification)",
    },
    {
      label: "c",
      marks: 2,
      content: `If only the curved (side) surface is painted (not top or bottom), find the litres of paint required. Round up to the nearest whole litre.`,
      solution:
        "Curved surface $= 2\\pi r h = 2\\pi(1.5)(4) = 12\\pi \\approx 37.699$ m². (**1 mark**)\n\nLitres $= 37.699 / 8 \\approx 4.712$. Round up: $5$ L. (**1 mark**)",
    },
    {
      label: "d",
      marks: 3,
      content: `A spherical buoy of diameter 1 m is also to be painted. Find its surface area, in m² to one decimal place, and the litres of paint required (round up).`,
      solution:
        "Radius $= 0.5$ m. (**1 mark**)\n\n$SA = 4\\pi r^2 = 4\\pi(0.25) = \\pi$ m² $\\approx 3.1416 \\approx 3.1$ m². (**1 mark**)\n\nLitres $= 3.1416 / 8 \\approx 0.393$. Round up: $1$ L. (**1 mark**)",
    },
    {
      label: "e",
      marks: 2,
      content: `Compare the surface-area-to-volume ratio of the cylindrical tank versus a sphere of the same volume. Why might a sphere be preferred for some applications?`,
      solution:
        "Cylinder volume $V = \\pi r^2 h = \\pi(2.25)(4) = 9\\pi$ m³ $\\approx 28.27$ m³.\n\nFor a sphere of equivalent volume, $\\frac{4}{3}\\pi R^3 = 9\\pi \\Rightarrow R^3 = 6.75 \\Rightarrow R \\approx 1.890$ m.\n\nSphere $SA = 4\\pi(1.890)^2 \\approx 44.89$ m². (**1 mark**)\n\nCylinder $SA = 51.84$ m². The sphere has **less** surface area for the same volume — minimising surface area per unit volume reduces material costs and (for tanks) heat loss/gain. (**1 mark**)",
    },
  ],
  "HARD",
  `**Water-tank coatings**\n\nA water-tank manufacturer needs to estimate the surface area of various tank shapes to determine paint and corrosion-protection costs.`,
  "CAS_ALLOWED",
);

// ════════════════════════════════════════════════════════════════════════
// SUBTOPIC 4 — VOLUME (extended-fit: 9/4/2/2)
// ════════════════════════════════════════════════════════════════════════

const SUB_VOL = "volume";

// ─── Volume MCQ (9) ─────────────────────────────────────────────────────

mcq(
  SUB_VOL,
  `The volume of a cube of side length 6 cm is\n\n`,
  ["$36$ cm³", "$216$ cm³", "$18$ cm³", "$72$ cm³"],
  "B",
  "EASY",
  "**Answer: B**\n\n$V = s^3 = 6^3 = 216$ cm³. (A is $s^2$; C is $3s$; D is $2s^2$.)",
);

mcq(
  SUB_VOL,
  `The volume of a rectangular prism with length 10 cm, width 4 cm and height 5 cm is\n\n`,
  ["$19$ cm³", "$200$ cm³", "$50$ cm³", "$80$ cm³"],
  "B",
  "EASY",
  "**Answer: B**\n\n$V = l \\times w \\times h = 10 \\times 4 \\times 5 = 200$ cm³.",
);

mcq(
  SUB_VOL,
  `The volume of a cylinder with radius 3 cm and height 7 cm, in cm³ in terms of $\\pi$, is\n\n`,
  ["$21\\pi$", "$42\\pi$", "$63\\pi$", "$147\\pi$"],
  "C",
  "EASY",
  "**Answer: C**\n\n$V = \\pi r^2 h = \\pi(9)(7) = 63\\pi$ cm³.",
);

mcq(
  SUB_VOL,
  `The volume of a sphere with radius 6 cm, in cm³ in terms of $\\pi$, is\n\n`,
  ["$72\\pi$", "$144\\pi$", "$216\\pi$", "$288\\pi$"],
  "D",
  "MEDIUM",
  "**Answer: D**\n\n$V = \\frac{4}{3}\\pi r^3 = \\frac{4}{3}\\pi(216) = 288\\pi$ cm³. (B is the surface area $4\\pi r^2 = 144\\pi$.)",
);

mcq(
  SUB_VOL,
  `The volume of a cone with radius 5 cm and height 9 cm, in cm³ in terms of $\\pi$, is\n\n`,
  ["$75\\pi$", "$225\\pi$", "$45\\pi$", "$15\\pi$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\n$V = \\frac{1}{3}\\pi r^2 h = \\frac{1}{3}\\pi(25)(9) = 75\\pi$ cm³. (B forgets the $\\frac{1}{3}$.)",
);

mcq(
  SUB_VOL,
  `A square-based pyramid has base side 8 m and perpendicular height 12 m. Its volume, in m³, is\n\n`,
  ["$96$", "$256$", "$192$", "$768$"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$V = \\frac{1}{3} A_{\\text{base}} h = \\frac{1}{3}(8^2)(12) = \\frac{1}{3}(64)(12) = 256$ m³.",
);

mcq(
  SUB_VOL,
  `A cylinder has volume $200\\pi$ cm³ and radius 5 cm. Its height, in centimetres, is\n\n`,
  ["$8$", "$10$", "$25$", "$40$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\n$V = \\pi r^2 h \\Rightarrow 200\\pi = 25\\pi h \\Rightarrow h = 8$ cm.",
);

mcq(
  SUB_VOL,
  `A hemispherical bowl has radius 6 cm. Its volume (interior), in cm³ correct to the nearest whole number, is\n\n`,
  ["$144$", "$226$", "$452$", "$904$"],
  "C",
  "HARD",
  "**Answer: C**\n\n$V_{\\text{hemisphere}} = \\frac{1}{2} \\cdot \\frac{4}{3}\\pi r^3 = \\frac{2}{3}\\pi r^3 = \\frac{2}{3}\\pi(216) = 144\\pi$ cm³.\n\n$\\approx 452.39 \\approx 452$ cm³. (Distractor D is the full sphere.)",
  "CAS_ALLOWED",
);

mcq(
  SUB_VOL,
  `A composite solid consists of a cylinder of radius 4 cm and height 10 cm with a cone of the same radius and height 3 cm placed on top. The total volume, in cm³ correct to the nearest whole number, is\n\n`,
  ["$553$", "$502$", "$704$", "$176$"],
  "A",
  "HARD",
  "**Answer: A**\n\nCylinder volume $= \\pi r^2 h = \\pi(16)(10) = 160\\pi$ cm³.\n\nCone volume $= \\frac{1}{3}\\pi r^2 h = \\frac{1}{3}\\pi(16)(3) = 16\\pi$ cm³.\n\nTotal $= 160\\pi + 16\\pi = 176\\pi \\approx 552.92 \\approx 553$ cm³.\n\n(Distractor B is cylinder only; C double-counts cone height; D forgets $\\pi$.)",
  "CAS_ALLOWED",
);

// ─── Volume SHORT_ANSWER (4) ───────────────────────────────────────────

short(
  SUB_VOL,
  `Calculate the volume of a rectangular prism with length 8 cm, width 5 cm, and height 6 cm. (2 marks)`,
  2,
  "EASY",
  "$V = l \\times w \\times h$ (**1 mark** for formula)\n\n$V = 8 \\times 5 \\times 6 = 240$ cm³. (**1 mark**)",
);

short(
  SUB_VOL,
  `A cylindrical water tank has radius 1.2 m and height 2 m. Find the volume of water it holds when full, in m³ correct to two decimal places. (3 marks)`,
  3,
  "MEDIUM",
  "$V = \\pi r^2 h$ (**1 mark** for formula)\n\n$V = \\pi(1.44)(2) = 2.88\\pi$ m³ (**1 mark** for exact form)\n\n$\\approx 9.0478 \\approx 9.05$ m³. (**1 mark** for rounded answer)",
  "CAS_ALLOWED",
);

short(
  SUB_VOL,
  `A spherical orange has a diameter of 9 cm. Calculate its volume, in cm³ correct to one decimal place. (3 marks)`,
  3,
  "MEDIUM",
  "Radius $r = 4.5$ cm. (**1 mark**)\n\n$V = \\frac{4}{3}\\pi r^3 = \\frac{4}{3}\\pi(4.5)^3 = \\frac{4}{3}\\pi(91.125) = 121.5\\pi$ cm³. (**1 mark**)\n\n$\\approx 381.704 \\approx 381.7$ cm³. (**1 mark**)",
  "CAS_ALLOWED",
);

short(
  SUB_VOL,
  `A cone has volume $48\\pi$ cm³ and a circular base of radius 4 cm. Find the perpendicular height of the cone. (3 marks)`,
  3,
  "MEDIUM",
  "$V = \\frac{1}{3}\\pi r^2 h$ (**1 mark** for formula)\n\n$48\\pi = \\frac{1}{3}\\pi(16)h \\Rightarrow 48\\pi = \\frac{16\\pi}{3} h$ (**1 mark** for substitution)\n\n$h = \\frac{48 \\times 3}{16} = \\frac{144}{16} = 9$ cm. (**1 mark**)",
);

// ─── Volume EXTENDED_ANSWER (2) ────────────────────────────────────────

extAns(
  SUB_VOL,
  [
    {
      label: "a",
      marks: 2,
      content: `Find the volume of the cylindrical tank.\n\n${img(cylinderSvg({ radius: 2, height: 3, unit: "m" }))}`,
      solution:
        "$V = \\pi r^2 h = \\pi(2)^2 \\times 3 = 12\\pi$ m³. (**1 mark**)\n\n$\\approx 37.70$ m³. (**1 mark**)",
    },
    {
      label: "b",
      marks: 2,
      content: `If 1 m³ of water = 1000 litres, find the capacity of the tank in litres, correct to the nearest litre.`,
      solution:
        "Capacity $= 12\\pi \\times 1000 = 12000\\pi$ L. (**1 mark**)\n\n$\\approx 37{,}699.11 \\approx 37{,}699$ L. (**1 mark**)",
    },
    {
      label: "c",
      marks: 2,
      content: `Water flows in at 60 L/min. How long, in hours and minutes correct to the nearest minute, does it take to fill the empty tank from above?`,
      solution:
        "Time (min) $= 37{,}699 / 60 \\approx 628.32$ min. (**1 mark**)\n\n$628$ min $= 10$ h $28$ min. (**1 mark**)",
    },
  ],
  "MEDIUM",
  `A cylindrical water tank has radius 2 m and height 3 m.`,
  "CAS_ALLOWED",
);

extAns(
  SUB_VOL,
  [
    {
      label: "a",
      marks: 2,
      content: `Find the volume of the cone that forms the ice-cream container, in cm³ correct to two decimal places.\n\n${img(coneSvg({ radius: 3, height: 9, unit: "cm" }))}`,
      solution:
        "$V_{\\text{cone}} = \\frac{1}{3}\\pi r^2 h = \\frac{1}{3}\\pi(9)(9) = 27\\pi$ cm³. (**1 mark**)\n\n$\\approx 84.823 \\approx 84.82$ cm³. (**1 mark**)",
    },
    {
      label: "b",
      marks: 3,
      content: `A hemispherical scoop of ice cream (radius 3 cm) sits on top of the cone. Find the total volume (cone + scoop), in cm³ correct to two decimal places.`,
      solution:
        "Hemisphere volume $= \\frac{2}{3}\\pi r^3 = \\frac{2}{3}\\pi(27) = 18\\pi$ cm³. (**1 mark**)\n\nTotal $= 27\\pi + 18\\pi = 45\\pi$ cm³. (**1 mark**)\n\n$\\approx 141.37$ cm³. (**1 mark**)",
    },
    {
      label: "c",
      marks: 2,
      content: `Assume that ice cream has density 0.9 g/cm³. Find the mass of the scoop only (not the cone), in grams correct to the nearest gram.`,
      solution:
        "Scoop volume from part **b** $= 18\\pi \\approx 56.55$ cm³. (**1 mark**)\n\nMass $= 56.55 \\times 0.9 = 50.89$ g $\\approx 51$ g. (**1 mark**)",
    },
  ],
  "MEDIUM",
  `An ice-cream cone has the shape of an open cone with radius 3 cm and height 9 cm.`,
  "CAS_ALLOWED",
);

// ─── Volume EXTENDED_RESPONSE (2) ──────────────────────────────────────

extResp(
  SUB_VOL,
  [
    {
      label: "a",
      marks: 2,
      content: `Find the volume of the rectangular prism component of the silo, in m³.`,
      solution:
        "Prism volume $= 3 \\times 3 \\times 8 = 72$ m³. (**1 mark**)\n\nA cubic-metre answer is exact and correct. (**1 mark**)",
    },
    {
      label: "b",
      marks: 3,
      content: `On top of the prism sits a square-based pyramid of base 3 m × 3 m and apex height 2 m. Find the volume of the pyramid, in m³.`,
      solution:
        "$V_{\\text{pyr}} = \\frac{1}{3} A_{\\text{base}} h = \\frac{1}{3}(9)(2) = 6$ m³. (**1 mark** for formula)\n\n(**2 marks** for correct value $6$ m³.)",
    },
    {
      label: "c",
      marks: 2,
      content: `Find the total volume of the silo (prism + pyramid).`,
      solution:
        "Total $= 72 + 6 = 78$ m³. (**2 marks**)",
    },
    {
      label: "d",
      marks: 3,
      content: `Grain is dispensed at 4 m³/min. The silo is initially empty. How long does it take to fill the silo to 90% capacity? Give your answer in minutes to the nearest minute.`,
      solution:
        "90% of 78 = $70.2$ m³. (**1 mark**)\n\nTime $= 70.2 / 4 = 17.55$ min. (**1 mark**)\n\nNearest minute: $\\approx 18$ min. (**1 mark**)",
    },
    {
      label: "e",
      marks: 3,
      content: `Find the height of the silo (prism + pyramid combined), in metres. If all linear dimensions of the silo were doubled, find the new total volume, in m³, and the volume scale factor.`,
      solution:
        "Height: prism $8$ m + pyramid apex $2$ m $= 10$ m. (**1 mark**)\n\nDoubling: prism becomes $6 \\times 6 \\times 16 = 576$ m³; pyramid base $6 \\times 6$, height $4$, volume $\\frac{1}{3}(36)(4) = 48$ m³. Total $= 624$ m³. (**1 mark**)\n\nVolume scale: $624 / 78 = 8$. This confirms volumes scale by $k^3$: $k = 2 \\Rightarrow k^3 = 8$. (**1 mark**)",
    },
  ],
  "MEDIUM",
  `**Grain silo design**\n\nA grain silo consists of a square-based rectangular prism (3 m × 3 m × 8 m tall) topped with a square-based pyramid roof of apex height 2 m.`,
  "CAS_ALLOWED",
);

extResp(
  SUB_VOL,
  [
    {
      label: "a",
      marks: 3,
      content: `Find the volume of the cylindrical part of the tank (radius 2 m, height 5 m), in m³ correct to two decimal places.`,
      solution:
        "$V_{\\text{cyl}} = \\pi r^2 h = \\pi(4)(5) = 20\\pi$ m³. (**1 mark**)\n\n$\\approx 62.8319$ m³. (**1 mark**)\n\nTo 2 dp: $\\approx 62.83$ m³. (**1 mark**)",
    },
    {
      label: "b",
      marks: 3,
      content: `The bottom of the tank has a hemispherical cap (radius 2 m, attached below the cylinder). Find the volume of the hemisphere, in m³ correct to two decimal places.`,
      solution:
        "$V_{\\text{hemi}} = \\frac{2}{3}\\pi r^3 = \\frac{2}{3}\\pi(8) = \\frac{16\\pi}{3}$ m³. (**1 mark**)\n\n$\\approx 16.755$ m³. (**1 mark**)\n\nTo 2 dp: $\\approx 16.76$ m³. (**1 mark**)",
    },
    {
      label: "c",
      marks: 2,
      content: `Find the total volume of water the tank can hold (cylinder + hemisphere), in litres correct to the nearest whole litre (1 m³ = 1000 L).`,
      solution:
        "Total $= 62.8319 + 16.7552 = 79.5871$ m³. (**1 mark**)\n\nIn litres: $79.5871 \\times 1000 = 79{,}587.1$ L $\\approx 79{,}587$ L. (**1 mark**)",
    },
    {
      label: "d",
      marks: 3,
      content: `Water flows out at a constant 200 L/min when a valve is opened. How long (in hours and minutes) does it take to drain the full tank, correct to the nearest minute?`,
      solution:
        "Time (min) $= 79{,}587 / 200 \\approx 397.9$ min. (**1 mark**)\n\n$398$ min $= 6 \\times 60 + 38 = 6$ h $38$ min. (**1 mark**)\n\nTime to drain $\\approx 6$ h $38$ min. (**1 mark**)",
    },
    {
      label: "e",
      marks: 2,
      content: `If the height of the cylinder is increased to 6 m (while keeping the same radius and the same hemisphere), find the new total volume and the percentage increase compared to the original.`,
      solution:
        "New cylinder volume $= \\pi(4)(6) = 24\\pi \\approx 75.40$ m³. (**1 mark**)\n\nNew total $= 75.40 + 16.76 = 92.16$ m³. Percentage increase $= (92.16 - 79.59)/79.59 \\times 100 \\approx 15.79\\%$. (**1 mark**)",
    },
  ],
  "HARD",
  `**Hybrid water tank**\n\nA water tank consists of a cylindrical body (radius 2 m, height 5 m) with a hemispherical cap (radius 2 m) attached to the bottom.`,
  "CAS_ALLOWED",
);

// ════════════════════════════════════════════════════════════════════════
// SUBTOPIC 5 — SIMILAR TRIANGLES (extended-fit: 9/4/2/2)
// ════════════════════════════════════════════════════════════════════════

const SUB_SIM = "similar-triangles";

// ─── Similar triangles MCQ (9) ─────────────────────────────────────────

mcq(
  SUB_SIM,
  `Two triangles are similar if\n\n`,
  [
    "all three sides are equal in length",
    "they have the same area",
    "they have the same shape but possibly different sizes (corresponding angles equal and sides in equal ratio)",
    "all three angles add to $180°$",
  ],
  "C",
  "EASY",
  "**Answer: C**\n\nTwo triangles are similar when one is a scaled copy of the other: corresponding angles are equal AND corresponding sides are in the same ratio. (A is *congruence*; B is irrelevant; D is true of every triangle.)",
);

mcq(
  SUB_SIM,
  `Two similar triangles have corresponding side lengths in the ratio $2 : 5$. The ratio of their areas is\n\n`,
  ["$2 : 5$", "$4 : 25$", "$8 : 125$", "$\\sqrt{2} : \\sqrt{5}$"],
  "B",
  "EASY",
  "**Answer: B**\n\nFor similar figures, areas scale by the square of the linear scale factor. Linear ratio $2 : 5 \\Rightarrow$ area ratio $2^2 : 5^2 = 4 : 25$.",
);

mcq(
  SUB_SIM,
  `Two similar triangles have linear scale factor $3 : 4$. The ratio of their volumes (if the figures were extended to similar solids) would be\n\n`,
  ["$3 : 4$", "$9 : 16$", "$27 : 64$", "$\\sqrt{3} : \\sqrt{4}$"],
  "C",
  "EASY",
  "**Answer: C**\n\nVolumes scale by the cube of the linear scale factor: $3^3 : 4^3 = 27 : 64$.",
);

mcq(
  SUB_SIM,
  `Triangle $ABC$ is similar to triangle $DEF$ with $AB = 4$, $BC = 6$, $CA = 8$ and $DE = 6$. Then $EF$ equals\n\n`,
  ["$8$", "$9$", "$12$", "$10$"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nLinear scale factor $= DE / AB = 6/4 = 1.5$. So $EF = 1.5 \\times BC = 1.5 \\times 6 = 9$.",
);

mcq(
  SUB_SIM,
  `In triangle $ABC$, $D$ is on $AB$ and $E$ is on $AC$ with $DE$ parallel to $BC$. If $AD = 4$, $DB = 6$, $AE = 5$, then $EC$ equals\n\n`,
  ["$5$", "$7.5$", "$6$", "$10$"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nWith $DE \\parallel BC$, triangles $ADE$ and $ABC$ are similar. So $\\frac{AD}{AB} = \\frac{AE}{AC} \\Rightarrow \\frac{4}{10} = \\frac{5}{AC} \\Rightarrow AC = 12.5$. Therefore $EC = AC - AE = 12.5 - 5 = 7.5$.",
);

mcq(
  SUB_SIM,
  `A tree casts a shadow 12 m long at the same time as a 1.8 m tall person casts a shadow 1.5 m long. The height of the tree, in metres, is\n\n`,
  ["$10$", "$14.4$", "$12.5$", "$9$"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nSimilar triangles (tree:shadow vs. person:shadow): $\\frac{H_{\\text{tree}}}{12} = \\frac{1.8}{1.5} \\Rightarrow H_{\\text{tree}} = 12 \\times 1.2 = 14.4$ m.",
);

mcq(
  SUB_SIM,
  `Two similar rectangles have areas in the ratio $1 : 16$. The ratio of their corresponding sides is\n\n`,
  ["$1 : 4$", "$1 : 8$", "$1 : 16$", "$1 : 256$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nIf area ratio is $1 : 16$, the linear ratio is $\\sqrt{1} : \\sqrt{16} = 1 : 4$.",
);

mcq(
  SUB_SIM,
  `Two similar cones have heights in the ratio $2 : 5$. The ratio of their volumes is\n\n`,
  ["$2 : 5$", "$4 : 25$", "$8 : 125$", "$16 : 625$"],
  "C",
  "HARD",
  "**Answer: C**\n\nVolume ratio = (linear ratio)³ = $2^3 : 5^3 = 8 : 125$.",
);

mcq(
  SUB_SIM,
  `A model car is built to a scale of $1 : 24$. The model is 18 cm long. The actual length of the car, in metres, is\n\n`,
  ["$4.32$", "$0.75$", "$24$", "$0.43$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nActual length $= 24 \\times 18 = 432$ cm $= 4.32$ m.",
);

// ─── Similar triangles SHORT_ANSWER (4) ────────────────────────────────

short(
  SUB_SIM,
  `Triangle $ABC$ is similar to triangle $PQR$. Given $AB = 6$, $BC = 8$, $CA = 10$ and $PQ = 9$, find the lengths of $QR$ and $RP$. (3 marks)`,
  3,
  "EASY",
  "Scale factor $k = PQ / AB = 9 / 6 = 1.5$. (**1 mark**)\n\n$QR = 1.5 \\times BC = 1.5 \\times 8 = 12$. (**1 mark**)\n\n$RP = 1.5 \\times CA = 1.5 \\times 10 = 15$. (**1 mark**)",
);

short(
  SUB_SIM,
  `A 1.6 m tall person stands next to a tree. At the same instant, the person's shadow is 2.4 m long and the tree's shadow is 18 m long. Find the height of the tree. (3 marks)`,
  3,
  "MEDIUM",
  "Sun's rays produce similar triangles. (**1 mark** for similar-triangle reasoning)\n\n$\\dfrac{H_{\\text{tree}}}{18} = \\dfrac{1.6}{2.4}$ (**1 mark** for ratio set-up)\n\n$H_{\\text{tree}} = 18 \\times \\frac{1.6}{2.4} = 18 \\times \\frac{2}{3} = 12$ m. (**1 mark**)",
);

short(
  SUB_SIM,
  `Two similar pentagons have corresponding sides in the ratio $3 : 5$. The smaller pentagon has area 27 cm². Find:\n\n**a.** the area of the larger pentagon (2 marks)\n\n**b.** if both pentagons are extruded to form similar prisms with proportional heights, find the ratio of their volumes (1 mark)\n\n**c.** if the smaller prism has volume $54$ cm³, find the volume of the larger prism (2 marks). (5 marks total)`,
  5,
  "HARD",
  "**a.** Linear ratio $3:5$, area ratio $3^2 : 5^2 = 9 : 25$.\n\nLarger area $= 27 \\times \\frac{25}{9} = 75$ cm². (**2 marks**: 1 for ratio, 1 for value)\n\n**b.** Volume ratio $= 3^3 : 5^3 = 27 : 125$. (**1 mark**)\n\n**c.** Larger volume $= 54 \\times \\frac{125}{27} = 250$ cm³. (**2 marks**: 1 for ratio, 1 for value)",
  "CAS_ALLOWED",
);

short(
  SUB_SIM,
  `In the figure below, $DE$ is parallel to $BC$ in triangle $ABC$. Given $AD = 6$ cm, $DB = 9$ cm, and $DE = 8$ cm, find the length of $BC$. (3 marks)`,
  3,
  "MEDIUM",
  "Since $DE \\parallel BC$, triangles $ADE$ and $ABC$ are similar. (**1 mark**)\n\n$\\frac{AD}{AB} = \\frac{DE}{BC}$, where $AB = AD + DB = 6 + 9 = 15$. (**1 mark**)\n\n$\\frac{6}{15} = \\frac{8}{BC} \\Rightarrow BC = 8 \\times \\frac{15}{6} = 20$ cm. (**1 mark**)",
);

// ─── Similar triangles EXTENDED_ANSWER (2) ─────────────────────────────

extAns(
  SUB_SIM,
  [
    {
      label: "a",
      marks: 2,
      content: `A 1.5 m tall person stands at a distance of 9 m from a streetlight, and casts a shadow of length 3 m. Using similar triangles, find the height of the streetlight, in metres.`,
      solution:
        "Similar triangles: from the top of the streetlight to the tip of the shadow forms one triangle; from the top of the person to the same tip of the shadow forms a similar triangle.\n\nLet $H$ be the streetlight height. Streetlight base to shadow tip $= 9 + 3 = 12$ m; person base to shadow tip $= 3$ m.\n\n$\\frac{H}{12} = \\frac{1.5}{3} = 0.5$ (**1 mark**)\n\n$H = 6$ m. (**1 mark**)",
    },
    {
      label: "b",
      marks: 2,
      content: `If the person walks closer so that the shadow length becomes 1.5 m, find the new distance from the streetlight base to the person.`,
      solution:
        "Using the same ratio: $\\frac{H}{d + 1.5} = \\frac{1.5}{1.5} = 1 \\Rightarrow H = d + 1.5$. Wait — using person height : shadow $= H : (d + s)$ with $s = 1.5$:\n\n$\\frac{6}{d + 1.5} = \\frac{1.5}{1.5} = 1$, so $d + 1.5 = 6$, giving $d = 4.5$ m. (**2 marks**)",
    },
    {
      label: "c",
      marks: 3,
      content: `Explain why the ratio $\\frac{\\text{shadow length}}{\\text{person height}}$ is constant for a given position of the streetlight. Hence, given any one shadow measurement and the streetlight height (6 m), describe how to find the distance from the streetlight to the person.`,
      solution:
        "Similar triangles share the same shape, so all corresponding ratios are equal. Specifically, the angle of the light's rays striking the ground is fixed (for a given streetlight height and a given person). (**1 mark**)\n\nIf shadow length $= s$ for a person of height $h$, then from similar triangles $\\frac{H}{d + s} = \\frac{h}{s}$, where $d$ is the distance from light to person. (**1 mark**)\n\nSolve: $d = s \\cdot \\frac{H}{h} - s = s \\left( \\frac{H}{h} - 1 \\right)$. With $H = 6$, $h = 1.5$: $d = s \\cdot 3 = 3s$. (**1 mark**)",
    },
  ],
  "MEDIUM",
  `**Streetlight shadows**\n\nA streetlight of unknown height illuminates a flat road. People walking near it cast shadows whose lengths depend on the distance from the streetlight.`,
  "CAS_ALLOWED",
);

extAns(
  SUB_SIM,
  [
    {
      label: "a",
      marks: 2,
      content: `Two similar triangular paddocks have corresponding sides in the ratio $2 : 5$. The smaller has area 48 m². Find the area of the larger paddock.`,
      solution:
        "Area ratio $= 2^2 : 5^2 = 4 : 25$. (**1 mark**)\n\nLarger area $= 48 \\times \\frac{25}{4} = 12 \\times 25 = 300$ m². (**1 mark**)",
    },
    {
      label: "b",
      marks: 3,
      content: `The smaller paddock requires 2 kg of fertiliser per 12 m². How many kg of fertiliser does the larger paddock require? Give your answer correct to one decimal place.`,
      solution:
        "Smaller paddock: $48 / 12 \\times 2 = 8$ kg. (**1 mark**)\n\nLarger paddock: $300 / 12 \\times 2 = 25 \\times 2 = 50$ kg. (**1 mark**)\n\nAlternative: directly scale by area ratio $25/4$: $8 \\times 25/4 = 50$ kg. (**1 mark**)",
    },
    {
      label: "c",
      marks: 2,
      content: `If both paddocks are extended into 3D (e.g. as similar tanks of water with proportional depths), find the ratio of their volumes and hence the volume of the larger tank if the smaller has volume 16 m³.`,
      solution:
        "Volume ratio $= 2^3 : 5^3 = 8 : 125$. (**1 mark**)\n\nLarger volume $= 16 \\times \\frac{125}{8} = 250$ m³. (**1 mark**)",
    },
  ],
  "MEDIUM",
  `Two similar triangular paddocks (one a scaled copy of the other) need fertiliser. Their linear dimensions are in the ratio $2:5$.`,
  "CAS_ALLOWED",
);

// ─── Similar triangles EXTENDED_RESPONSE (2) ───────────────────────────

extResp(
  SUB_SIM,
  [
    {
      label: "a",
      marks: 2,
      content: `A scale-model car is built to a scale of $1 : 18$. The real car is 4.5 m long. Find the length of the model car, in centimetres.`,
      solution:
        "Model length $= 4.5 / 18 = 0.25$ m $= 25$ cm. (**2 marks**: 1 for set-up, 1 for value)",
    },
    {
      label: "b",
      marks: 3,
      content: `The model car has a surface area of approximately 320 cm². Estimate the surface area of the real car, in m² correct to one decimal place.`,
      solution:
        "Linear scale $1 : 18$, so area scale $1 : 18^2 = 1 : 324$. (**1 mark**)\n\nReal SA $= 320 \\times 324 = 103{,}680$ cm² (**1 mark**)\n\n$= 10.368$ m² $\\approx 10.4$ m². (**1 mark**)",
    },
    {
      label: "c",
      marks: 3,
      content: `If the petrol tank of the model has volume $10$ cm³ at the same scale, find the volume of the real petrol tank, in litres correct to one decimal place.`,
      solution:
        "Volume scale $= 1 : 18^3 = 1 : 5832$. (**1 mark**)\n\nReal tank $= 10 \\times 5832 = 58{,}320$ cm³ $= 58.32$ L. (**1 mark**)\n\nTo 1 dp: $\\approx 58.3$ L. (**1 mark**)",
    },
    {
      label: "d",
      marks: 3,
      content: `A second model is built to a scale of $1 : 12$. The real car has surface area approximately $10.4$ m² (from part **b**). Find the surface area of this larger model, in cm² correct to one decimal place.`,
      solution:
        "Linear scale $1 : 12$, area scale $1 : 144$. (**1 mark**)\n\nReal SA $= 10.4$ m² $= 104{,}000$ cm². (**1 mark**)\n\nModel SA $= 104{,}000 / 144 \\approx 722.2$ cm². (**1 mark**)",
    },
    {
      label: "e",
      marks: 2,
      content: `Compare the relative sizes of the two models: which has greater surface area in absolute terms, and by what factor? Briefly explain.`,
      solution:
        "1:18 model: SA $= 320$ cm². 1:12 model: SA $\\approx 722.2$ cm². (**1 mark**)\n\nThe 1:12 model has a greater absolute surface area; the ratio is $722.2 / 320 \\approx 2.26$. This matches $(18/12)^2 = (1.5)^2 = 2.25$ — the 1:12 model is linearly 1.5× larger than the 1:18 model, so its surface area is $1.5^2 = 2.25\\times$ larger. (**1 mark**)",
    },
  ],
  "MEDIUM",
  `**Scale-model cars**\n\nScale-model cars are built at various scales for hobbyists and collectors. The model preserves the *shape* of the real vehicle (so model and real are *similar* solids), but at a reduced size.`,
  "CAS_ALLOWED",
);

extResp(
  SUB_SIM,
  [
    {
      label: "a",
      marks: 2,
      content: `A 1.7 m tall student stands so that their shadow is 1.0 m long. At the same time, a building 30 m away from the student casts a shadow 18 m long. Verify that the configurations form similar triangles, and find the height of the building.`,
      solution:
        "Sun's rays are parallel; both shadows are on the same horizontal ground. The vertical line of the student is parallel to the vertical line of the building; together with the sun's rays, the two triangles share equal angles ⇒ similar. (**1 mark**)\n\n$\\frac{H}{18} = \\frac{1.7}{1.0} \\Rightarrow H = 30.6$ m. (**1 mark**)",
    },
    {
      label: "b",
      marks: 2,
      content: `Compute the area of the smaller similar triangle (student–shadow–top of student) and the larger (building–shadow–top of building) and verify the area ratio is $(1.7 \\times 1.0)/(30.6 \\times 18)$.`,
      solution:
        "Student triangle area $= \\frac{1}{2}(1.0)(1.7) = 0.85$ m². (**1 mark**)\n\nBuilding triangle area $= \\frac{1}{2}(18)(30.6) = 275.4$ m². Ratio $= 0.85 / 275.4 \\approx 0.00309$. Linear ratio = $1.0/18 = 0.0556$; square = $0.00309$. ✓ Verified. (**1 mark**)",
    },
    {
      label: "c",
      marks: 3,
      content: `Later in the day, the student's shadow lengthens to 1.5 m. Assuming similar triangles still apply (rays still parallel), find the new shadow length cast by the building.`,
      solution:
        "Ratio shadow/height $= 1.5 / 1.7$ for the student. (**1 mark**)\n\nFor the building (same time, same rays): shadow $= H \\times 1.5/1.7 = 30.6 \\times 1.5/1.7 = 30.6 \\times 0.8824$ (**1 mark**)\n\n$= 27.0$ m (to 1 dp). (**1 mark**)",
    },
    {
      label: "d",
      marks: 3,
      content: `Suppose the student steps forward 5 m toward the building (so now is $30 - 5 = 25$ m from the building base). The student's shadow is still 1.0 m. Will the height calculation still be valid? Justify, and use the *building's* original shadow (18 m) and re-derive its apparent height.`,
      solution:
        "The student's height-to-shadow ratio depends only on the sun angle, not on horizontal position. So $1.7 / 1.0 = 1.7$. (**1 mark**)\n\nApplying to the building: building height $= 18 \\times 1.7 = 30.6$ m — same answer. (**1 mark**)\n\nValid: the student's position relative to the building does not change because the shadow-ratio depends only on the sun's angle and the vertical dimensions, not horizontal positioning. (**1 mark**)",
    },
    {
      label: "e",
      marks: 2,
      content: `Calculate the shadow length of a flagpole 12 m tall, given the student's shadow is 1.0 m and height 1.7 m.`,
      solution:
        "Same ratio: shadow / height $= 1.0 / 1.7 \\approx 0.588$. (**1 mark**)\n\nFlagpole shadow $= 12 \\times 1.0 / 1.7 \\approx 7.06$ m. (**1 mark**)",
    },
  ],
  "HARD",
  `**Shadow geometry**\n\nOn a sunny afternoon, the angle of the sun's rays is constant over a small region of ground, so all vertical objects cast shadows whose ratios to the objects' heights are equal. This gives rise to *similar triangles*.`,
  "CAS_ALLOWED",
);

// ════════════════════════════════════════════════════════════════════════
// SUBTOPIC 6 — RIGHT-ANGLED TRIGONOMETRY (extended-fit: 9/4/2/2)
// ════════════════════════════════════════════════════════════════════════

const SUB_TRIG = "right-angled-trigonometry";

// Helper to render labelled right triangles for trig
function trigTriSvg(opts: {
  oppLabel: string;
  adjLabel: string;
  hypLabel: string;
  angleLabel: string;
  flip?: boolean;
}): string {
  // A right triangle with: bottom-left (right angle), bottom-right (theta), top-left (other angle)
  // adj along bottom, opp up the left, hyp from top-left to bottom-right
  const W = 320;
  const H = 240;
  const x0 = 60;
  const y0 = 200;
  const x1 = 280;
  const y1 = 60;
  const parts: string[] = [];
  parts.push(
    `<polygon points="${x0},${y0} ${x1},${y0} ${x0},${y1}" fill="none" stroke="#111" stroke-width="2"/>`,
  );
  // Right angle marker
  parts.push(`<polyline points="${x0 + 12},${y0} ${x0 + 12},${y0 - 12} ${x0},${y0 - 12}" fill="none" stroke="#111" stroke-width="1"/>`);
  // Side labels
  parts.push(text((x0 + x1) / 2, y0 + 18, opts.adjLabel, { size: 12, anchor: "middle" }));
  parts.push(text(x0 - 12, (y0 + y1) / 2 + 4, opts.oppLabel, { size: 12, anchor: "end" }));
  parts.push(text((x0 + x1) / 2 + 14, (y0 + y1) / 2 - 4, opts.hypLabel, { size: 12 }));
  // Angle marker at bottom-right
  parts.push(`<path d="M ${x1 - 22} ${y0} A 22 22 0 0 0 ${x1 - 15.5} ${y0 - 15.5}" fill="none" stroke="#2563eb" stroke-width="1.2"/>`);
  parts.push(text(x1 - 30, y0 - 6, opts.angleLabel, { size: 13, color: "#2563eb" }));
  return svg({ width: W, height: H }, parts.join(""));
}

// ─── Right-angled trig MCQ (9) ─────────────────────────────────────────

mcq(
  SUB_TRIG,
  `In a right-angled triangle, with $\\theta$ one of the non-right angles, the **sine** of $\\theta$ is defined as\n\n`,
  ["opposite / adjacent", "opposite / hypotenuse", "adjacent / hypotenuse", "adjacent / opposite"],
  "B",
  "EASY",
  "**Answer: B**\n\nSOHCAHTOA: **Sin** = **O**pposite / **H**ypotenuse. (A is tan; C is cos; D is 1/tan.)",
);

mcq(
  SUB_TRIG,
  `In a right-angled triangle, with $\\theta$ one of the non-right angles, the **tangent** of $\\theta$ is defined as\n\n`,
  ["opposite / adjacent", "opposite / hypotenuse", "adjacent / hypotenuse", "hypotenuse / opposite"],
  "A",
  "EASY",
  "**Answer: A**\n\nSOHCAHTOA: **Tan** = **O**pposite / **A**djacent. (B is sin; C is cos; D is 1/sin.)",
);

mcq(
  SUB_TRIG,
  `${img(trigTriSvg({ oppLabel: "3", adjLabel: "4", hypLabel: "5", angleLabel: "θ" }))}\n\nIn the right-angled triangle, $\\sin \\theta$ equals\n\n`,
  ["$3/5$", "$4/5$", "$3/4$", "$5/3$"],
  "A",
  "EASY",
  "**Answer: A**\n\nFor angle $\\theta$ at the bottom-right vertex, the opposite side is the vertical (length 3) and the hypotenuse is 5. So $\\sin\\theta = 3/5$. (B is cos; C is tan.)",
);

mcq(
  SUB_TRIG,
  `${img(trigTriSvg({ oppLabel: "5", adjLabel: "x", hypLabel: "13", angleLabel: "θ" }))}\n\nIn the right-angled triangle, if $\\sin \\theta = 5/13$, then $\\cos \\theta$ equals\n\n`,
  ["$5/12$", "$12/13$", "$13/12$", "$5/13$"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nBy Pythagoras the third side $x = \\sqrt{13^2 - 5^2} = \\sqrt{144} = 12$. So $\\cos\\theta = 12/13$. (This is the 5-12-13 triangle.)",
);

mcq(
  SUB_TRIG,
  `For a right-angled triangle with hypotenuse 10 cm and one non-right angle $30°$, the length of the side opposite the $30°$ angle, in cm, is\n\n`,
  ["$5$", "$8.66$", "$5\\sqrt{3}$", "$\\sqrt{3}/2$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\n$\\sin 30° = \\text{opp}/\\text{hyp} \\Rightarrow \\text{opp} = 10 \\sin 30° = 10 \\times 0.5 = 5$ cm. (B is the adjacent.)",
);

mcq(
  SUB_TRIG,
  `In a right-angled triangle, the side opposite a $45°$ angle is $6$ cm. The length of the hypotenuse, in cm, is\n\n`,
  ["$6\\sqrt{2}$", "$6$", "$3\\sqrt{2}$", "$12$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\n$\\sin 45° = 6 / h \\Rightarrow h = 6 / \\sin 45° = 6 / (\\sqrt{2}/2) = 12/\\sqrt{2} = 6\\sqrt{2}$ cm.",
);

mcq(
  SUB_TRIG,
  `From the top of a 50 m tower, the angle of depression to a point on the ground is $30°$. The horizontal distance from the base of the tower to that point, in metres correct to two decimal places, is\n\n`,
  ["$50\\sqrt{3}$ ≈ $86.60$", "$50\\tan 30°$ ≈ $28.87$", "$25$", "$100/\\sqrt{3}$ ≈ $57.74$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nAngle of depression from the top equals the angle of elevation from the point. With opposite (tower height) $= 50$ and angle $30°$ at the point:\n\n$\\tan 30° = 50/d \\Rightarrow d = 50/\\tan 30° = 50\\sqrt{3} \\approx 86.60$ m.",
  "CAS_ALLOWED",
);

mcq(
  SUB_TRIG,
  `A boat sails on a bearing of $060°$ for 12 km from port $P$. Its position is best described as\n\n`,
  [
    "12 km due east of $P$",
    "12 km in a direction $60°$ east of north from $P$",
    "12 km due north-east of $P$",
    "12 km due south of $P$",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nA three-figure bearing $060°$ means $60°$ measured clockwise from north. So the boat lies $60°$ east of north from $P$, at a distance of 12 km. (C is bearing $045°$.)",
);

mcq(
  SUB_TRIG,
  `An aircraft climbs at an angle of $5°$ to the horizontal. After travelling 2000 m along its flight path, the increase in altitude, in metres correct to one decimal place, is\n\n`,
  ["$174.3$", "$199.0$", "$1992.4$", "$22.9$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\n$\\sin 5° = \\text{height} / 2000 \\Rightarrow \\text{height} = 2000 \\sin 5° \\approx 2000 \\times 0.08716 \\approx 174.31$ m, or $174.3$ m.",
  "CAS_ALLOWED",
);

// ─── Right-angled trig SHORT_ANSWER (4) ────────────────────────────────

short(
  SUB_TRIG,
  `In a right-angled triangle, the hypotenuse is 20 cm and one angle is $40°$. Find the length of the side opposite the $40°$ angle, correct to two decimal places. (2 marks)`,
  2,
  "EASY",
  "$\\sin 40° = \\text{opp} / 20 \\Rightarrow \\text{opp} = 20 \\sin 40°$. (**1 mark**)\n\n$= 20 \\times 0.6428 \\approx 12.86$ cm. (**1 mark**)",
  "CAS_ALLOWED",
);

short(
  SUB_TRIG,
  `Find angle $\\theta$, correct to one decimal place, in a right-angled triangle where the side opposite $\\theta$ is 7 cm and the hypotenuse is 10 cm. (2 marks)`,
  2,
  "MEDIUM",
  "$\\sin \\theta = 7/10 = 0.7$ (**1 mark**)\n\n$\\theta = \\sin^{-1}(0.7) \\approx 44.43°$, so $\\theta \\approx 44.4°$. (**1 mark**)",
  "CAS_ALLOWED",
);

short(
  SUB_TRIG,
  `A ladder of length 5 m leans against a wall, making an angle of $70°$ with the ground. How high up the wall does the ladder reach? Give your answer in metres correct to two decimal places. (3 marks)`,
  3,
  "MEDIUM",
  "Let $h$ = height up the wall. The ladder is the hypotenuse, $h$ is opposite the $70°$ angle.\n\n$\\sin 70° = h/5$ (**1 mark**)\n\n$h = 5 \\sin 70° \\approx 5 \\times 0.9397$ (**1 mark**)\n\n$h \\approx 4.70$ m. (**1 mark**)",
  "CAS_ALLOWED",
);

short(
  SUB_TRIG,
  `From a point on the ground 60 m from the base of a vertical building, the angle of elevation to the top of the building is $35°$. Find the height of the building, correct to one decimal place. (3 marks)`,
  3,
  "MEDIUM",
  "Let $h$ = height. With horizontal $60$ m (adjacent) and angle $35°$:\n\n$\\tan 35° = h / 60$ (**1 mark**)\n\n$h = 60 \\tan 35° \\approx 60 \\times 0.7002$ (**1 mark**)\n\n$\\approx 42.01$ m, so $h \\approx 42.0$ m. (**1 mark**)",
  "CAS_ALLOWED",
);

// ─── Right-angled trig EXTENDED_ANSWER (2) ─────────────────────────────

extAns(
  SUB_TRIG,
  [
    {
      label: "a",
      marks: 2,
      content: `A ramp of length 4.5 m makes an angle of $12°$ with the horizontal ground. Find the vertical rise of the ramp, in metres correct to two decimal places.`,
      solution:
        "$\\sin 12° = \\text{rise} / 4.5$ (**1 mark**)\n\n$\\text{rise} = 4.5 \\sin 12° \\approx 4.5 \\times 0.2079 \\approx 0.94$ m. (**1 mark**)",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the horizontal distance (the 'run') of the ramp, correct to two decimal places.`,
      solution:
        "$\\cos 12° = \\text{run} / 4.5$ (**1 mark**)\n\n$\\text{run} = 4.5 \\cos 12° \\approx 4.5 \\times 0.9781 \\approx 4.40$ m. (**1 mark**)",
    },
    {
      label: "c",
      marks: 3,
      content: `For wheelchair access, the angle of incline must not exceed $5°$. If the rise must remain 0.94 m (as in part **a**), what is the minimum length of ramp required? Compare with the original 4.5 m ramp.`,
      solution:
        "$\\sin 5° = 0.94 / L \\Rightarrow L = 0.94 / \\sin 5° \\approx 0.94 / 0.08716$ (**1 mark**)\n\n$\\approx 10.78$ m. (**1 mark**)\n\nThis is much longer than the original 4.5 m ramp — about $10.78 / 4.5 \\approx 2.4$ times longer, reflecting the much shallower required angle. (**1 mark**)",
    },
  ],
  "MEDIUM",
  `**Ramp design**\n\nA ramp connects a footpath to a raised platform. The ramp's angle of inclination, length, rise (vertical) and run (horizontal) all relate through right-angled trigonometry.`,
  "CAS_ALLOWED",
);

extAns(
  SUB_TRIG,
  [
    {
      label: "a",
      marks: 2,
      content: `A surveyor at point $A$ measures the angle of elevation to the top of a hill as $25°$. He walks 100 m closer to the hill to point $B$, where the angle of elevation is $40°$. Let $h$ be the height of the hill and $x$ be the horizontal distance from $B$ to the base of the hill. Express $h$ in two ways, one in terms of $x$ and one in terms of $(x + 100)$.`,
      solution:
        "From $B$: $\\tan 40° = h / x \\Rightarrow h = x \\tan 40°$. (**1 mark**)\n\nFrom $A$: $\\tan 25° = h / (x + 100) \\Rightarrow h = (x + 100) \\tan 25°$. (**1 mark**)",
    },
    {
      label: "b",
      marks: 3,
      content: `Solve the two equations simultaneously to find $x$ and then $h$, both in metres correct to one decimal place.`,
      solution:
        "Set the two expressions for $h$ equal:\n\n$x \\tan 40° = (x + 100) \\tan 25°$\n\n$x \\tan 40° - x \\tan 25° = 100 \\tan 25°$\n\n$x (\\tan 40° - \\tan 25°) = 100 \\tan 25°$ (**1 mark**)\n\n$x = \\dfrac{100 \\tan 25°}{\\tan 40° - \\tan 25°} = \\dfrac{100 \\times 0.4663}{0.8391 - 0.4663} = \\dfrac{46.63}{0.3728} \\approx 125.06$ m. (**1 mark**)\n\n$h = x \\tan 40° = 125.06 \\times 0.8391 \\approx 104.93$ m. So $x \\approx 125.1$ m and $h \\approx 104.9$ m. (**1 mark**)",
    },
    {
      label: "c",
      marks: 2,
      content: `If the surveyor measures the angle of elevation to be $50°$ at a point 30 m closer to the hill than $B$, verify (with calculation) that this is consistent with $h \\approx 104.9$ m.`,
      solution:
        "From the new point, horizontal distance $= x - 30 \\approx 95.06$ m.\n\nPredicted angle: $\\tan^{-1}(104.93 / 95.06) = \\tan^{-1}(1.1039) \\approx 47.83°$. (**1 mark**)\n\nThe given angle is $50°$, predicted is $47.8°$ — close but not exactly equal. This discrepancy suggests measurement error or slight variation; for an idealised model, the value is consistent within $\\sim 2°$. (**1 mark**)",
    },
  ],
  "HARD",
  `**Hill-height survey**\n\nA surveyor measures angles of elevation from two known points on a level field to determine the height of a hill ahead. The horizontal distance between the points is known.`,
  "CAS_ALLOWED",
);

// ─── Right-angled trig EXTENDED_RESPONSE (2) ───────────────────────────

extResp(
  SUB_TRIG,
  [
    {
      label: "a",
      marks: 2,
      content: `From the top of a 40 m lighthouse, the angle of depression to a boat is $20°$. Find the horizontal distance from the boat to the base of the lighthouse, correct to one decimal place.`,
      solution:
        "Angle of depression $= 20°$. By alternate angles (horizontal lines parallel), the angle of elevation from the boat to the top is also $20°$. (**1 mark**)\n\n$\\tan 20° = 40 / d \\Rightarrow d = 40 / \\tan 20° \\approx 40 / 0.3640 \\approx 109.9$ m. (**1 mark**)",
    },
    {
      label: "b",
      marks: 3,
      content: `The boat sails directly toward the lighthouse. After 1 minute, the angle of depression from the top of the lighthouse to the boat has increased to $35°$. Find the new horizontal distance from the boat to the lighthouse, and find the boat's speed in m/s correct to one decimal place.`,
      solution:
        "New distance: $\\tan 35° = 40 / d' \\Rightarrow d' = 40 / \\tan 35° \\approx 40 / 0.7002 \\approx 57.13$ m. (**1 mark**)\n\nDistance travelled $= 109.9 - 57.13 = 52.77$ m in 60 seconds. (**1 mark**)\n\nSpeed $= 52.77 / 60 \\approx 0.88$ m/s, so $\\approx 0.9$ m/s. (**1 mark**)",
    },
    {
      label: "c",
      marks: 3,
      content: `Continue: when the boat is exactly 30 m from the lighthouse base, what is the angle of depression? Give your answer correct to one decimal place. How long, in seconds, from the moment in part **b** until the boat reaches this point (at the same speed)?`,
      solution:
        "Angle: $\\tan \\theta = 40/30 = 4/3 \\Rightarrow \\theta = \\tan^{-1}(4/3) \\approx 53.13°$, so $\\approx 53.1°$. (**1 mark**)\n\nDistance from part **b**'s position ($57.13$ m) to $30$ m: $57.13 - 30 = 27.13$ m. (**1 mark**)\n\nTime $= 27.13 / 0.88 \\approx 30.8$ s, so $\\approx 31$ s. (**1 mark**)",
    },
    {
      label: "d",
      marks: 3,
      content: `A second lighthouse stands 80 m east of the first, with the same height of 40 m. From the top of the second lighthouse, the angle of depression to the boat (at the 30 m point from the first) is now what value? Give your answer correct to one decimal place.`,
      solution:
        "The boat is 30 m west of the first lighthouse and 80 m east of the first ⇒ boat is $30 + 80 = 110$ m west of the second lighthouse. (**1 mark**)\n\nAngle $= \\tan^{-1}(40 / 110) = \\tan^{-1}(0.3636) \\approx 19.98°$ (**1 mark**)\n\nSo $\\approx 20.0°$. (**1 mark**)",
    },
    {
      label: "e",
      marks: 2,
      content: `Briefly discuss why the angle of depression decreases as the boat moves further from a lighthouse, and what would happen as the boat approaches the lighthouse base.`,
      solution:
        "As the boat moves further away, the horizontal distance increases while the height remains constant, so the ratio $\\tan \\theta = h/d$ decreases, hence $\\theta$ decreases. (**1 mark**)\n\nAs the boat approaches the lighthouse base, $d \\to 0$, so $\\tan \\theta \\to \\infty$ and $\\theta \\to 90°$. The line of sight becomes more nearly vertical (looking directly downward). (**1 mark**)",
    },
  ],
  "HARD",
  `**Lighthouse and boat**\n\nA lighthouse of height 40 m stands on a flat shoreline. A boat approaches it from the sea. Angles of depression to the boat are measured from the top of the lighthouse.`,
  "CAS_ALLOWED",
);

extResp(
  SUB_TRIG,
  [
    {
      label: "a",
      marks: 2,
      content: `An aircraft flies from airport $A$ on a bearing of $060°$ for 200 km. Find the displacement (i) due north, and (ii) due east, of the aircraft from $A$. Give both answers correct to two decimal places.`,
      solution:
        "Bearing $060°$ means $60°$ east of north.\n\nNorthward: $200 \\cos 60° = 200 \\times 0.5 = 100.00$ km. (**1 mark**)\n\nEastward: $200 \\sin 60° = 200 \\times 0.8660 \\approx 173.21$ km. (**1 mark**)",
    },
    {
      label: "b",
      marks: 3,
      content: `From its current position, the aircraft turns and flies on a bearing of $150°$ for a further 150 km. Find the new northward and eastward displacements from the second leg, and hence the aircraft's total displacement from $A$ (in components).`,
      solution:
        "Bearing $150°$ means $30°$ east of south (or $150°$ clockwise from north). Components:\n\nNorthward (negative because past east axis): $150 \\cos 150° = 150 \\times (-0.8660) \\approx -129.90$ km. (**1 mark**)\n\nEastward: $150 \\sin 150° = 150 \\times 0.5 = 75.00$ km. (**1 mark**)\n\nTotal northward $= 100 + (-129.90) = -29.90$ km (south); total eastward $= 173.21 + 75 = 248.21$ km. (**1 mark**)",
    },
    {
      label: "c",
      marks: 3,
      content: `Find the straight-line distance from $A$ to the aircraft's final position, in km correct to one decimal place.`,
      solution:
        "$d^2 = 29.90^2 + 248.21^2 = 894.01 + 61608.20 = 62502.21$ (**1 mark**)\n\n$d = \\sqrt{62502.21} \\approx 250.00$ km. (**1 mark**)\n\nTo 1 dp: $d \\approx 250.0$ km. (**1 mark**)",
    },
    {
      label: "d",
      marks: 3,
      content: `Find the bearing of the aircraft from $A$, correct to the nearest degree.`,
      solution:
        "The aircraft is east and south of $A$ (positive east, negative north). Bearing is measured clockwise from north.\n\nBearing from $A$ is in the south-east quadrant: $180° - \\tan^{-1}(248.21 / 29.90)$. (**1 mark**)\n\n$\\tan^{-1}(248.21 / 29.90) = \\tan^{-1}(8.30) \\approx 83.13°$. (**1 mark**)\n\nBearing $= 180° - 83.13° = 96.87°$. To nearest degree: bearing $\\approx 097°$. (**1 mark**)",
    },
    {
      label: "e",
      marks: 2,
      content: `If the aircraft flies directly back to $A$, what bearing should it fly on? (To the nearest degree.)`,
      solution:
        "The reverse bearing $= (097° + 180°) \\mod 360° = 277°$. (**2 marks**)",
    },
  ],
  "HARD",
  `**Aircraft bearings and displacement**\n\nA pilot flies an aircraft from airport $A$ in two stages, each on a specified compass bearing. We track the aircraft's position using north and east displacement components.`,
  "CAS_ALLOWED",
);

// ════════════════════════════════════════════════════════════════════════
// SUBTOPIC 7 — SINE AND COSINE RULES (extended-fit: 9/4/2/2)
// ════════════════════════════════════════════════════════════════════════

const SUB_SCR = "sine-and-cosine-rules";

// ─── Sine/cosine rules MCQ (9) ─────────────────────────────────────────

mcq(
  SUB_SCR,
  `The sine rule for a triangle with angles $A$, $B$, $C$ and opposite sides $a$, $b$, $c$ states\n\n`,
  [
    "$\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = \\dfrac{c}{\\sin C}$",
    "$a^2 = b^2 + c^2 - 2bc \\cos A$",
    "$a + b + c = \\sin A + \\sin B + \\sin C$",
    "$\\sin A \\sin B \\sin C = abc$",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\nThe sine rule equates the ratio of each side to the sine of its opposite angle. (B is the cosine rule.)",
);

mcq(
  SUB_SCR,
  `The cosine rule for finding side $a$ given $b$, $c$, and the included angle $A$ is\n\n`,
  [
    "$a = b + c - 2bc \\cos A$",
    "$a^2 = b^2 + c^2 - 2bc \\cos A$",
    "$a^2 = b^2 - c^2 + 2bc \\cos A$",
    "$a^2 = b^2 + c^2 + 2bc \\cos A$",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nThe cosine rule: $a^2 = b^2 + c^2 - 2bc \\cos A$, where $A$ is the angle between sides $b$ and $c$. (A drops the squares; D has the wrong sign.)",
);

mcq(
  SUB_SCR,
  `In triangle $ABC$, angle $A = 40°$, angle $B = 70°$, side $a = 8$. Side $b$ equals\n\n`,
  ["$10.5$ (to 1 dp)", "$11.7$ (to 1 dp)", "$5.5$ (to 1 dp)", "$8.0$"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nBy the sine rule: $\\dfrac{b}{\\sin 70°} = \\dfrac{8}{\\sin 40°}$, so $b = 8 \\cdot \\dfrac{\\sin 70°}{\\sin 40°} = 8 \\cdot \\dfrac{0.9397}{0.6428} \\approx 11.70$.",
  "CAS_ALLOWED",
);

mcq(
  SUB_SCR,
  `In triangle $ABC$, $b = 6$, $c = 9$, $A = 60°$. The length of $a$, in cm correct to two decimal places, is\n\n`,
  ["$\\sqrt{63}$ ≈ $7.94$", "$\\sqrt{135}$ ≈ $11.62$", "$\\sqrt{117}$ ≈ $10.82$", "$15$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nCosine rule: $a^2 = 6^2 + 9^2 - 2(6)(9)\\cos 60° = 36 + 81 - 108(0.5) = 117 - 54 = 63$.\n\n$a = \\sqrt{63} \\approx 7.94$.",
  "CAS_ALLOWED",
);

mcq(
  SUB_SCR,
  `In triangle $ABC$, $a = 7$, $b = 9$, $c = 12$. Angle $A$, correct to the nearest degree, is\n\n`,
  ["$32°$", "$36°$", "$48°$", "$90°$"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nCosine rule (rearranged for angle): $\\cos A = \\dfrac{b^2 + c^2 - a^2}{2bc} = \\dfrac{81 + 144 - 49}{2(9)(12)} = \\dfrac{176}{216} \\approx 0.8148$.\n\n$A = \\cos^{-1}(0.8148) \\approx 35.43° \\approx 36°$.",
  "CAS_ALLOWED",
);

mcq(
  SUB_SCR,
  `The area of a triangle with sides $a = 8$ cm and $b = 10$ cm and included angle $C = 45°$, in cm² correct to two decimal places, is\n\n`,
  ["$28.28$", "$40.00$", "$80.00$", "$14.14$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nArea $= \\frac{1}{2}ab\\sin C = \\frac{1}{2}(8)(10)\\sin 45° = 40 \\times 0.7071 \\approx 28.28$ cm².",
  "CAS_ALLOWED",
);

mcq(
  SUB_SCR,
  `Triangle $ABC$ has $a = 10$, $b = 7$, $A = 50°$. The angle $B$ (assuming the standard non-ambiguous case), in degrees correct to one decimal place, is\n\n`,
  ["$32.4$", "$53.7$", "$67.5$", "$28.0$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nSine rule: $\\dfrac{\\sin B}{7} = \\dfrac{\\sin 50°}{10}$, so $\\sin B = 7 \\cdot \\dfrac{0.7660}{10} = 0.5362$.\n\n$B = \\sin^{-1}(0.5362) \\approx 32.43° \\approx 32.4°$ (acute case).",
  "CAS_ALLOWED",
);

mcq(
  SUB_SCR,
  `Which rule should you use first to find an unknown side, given that you know two angles and one side (AAS) of a triangle?\n\n`,
  ["Cosine rule", "Sine rule", "Pythagoras' theorem", "Trigonometric ratios (SOH CAH TOA)"],
  "B",
  "EASY",
  "**Answer: B**\n\nWhen you have two angles and any side (AAS or ASA), use the sine rule — it directly relates each side to its opposite angle. (The cosine rule is for SAS or SSS configurations; SOH CAH TOA is for right-angled triangles.)",
);

mcq(
  SUB_SCR,
  `In triangle $ABC$, $a = 5$, $b = 6$, $c = 9$. Which of the following is **true**?\n\n`,
  [
    "Triangle is right-angled (since 5-6-9 is a Pythagorean triple)",
    "Triangle is obtuse at angle $C$ (largest)",
    "Triangle is acute (all angles less than $90°$)",
    "Triangle is equilateral",
  ],
  "B",
  "HARD",
  "**Answer: B**\n\nLargest side is $c = 9$, so largest angle is $C$. Cosine rule: $\\cos C = \\dfrac{a^2 + b^2 - c^2}{2ab} = \\dfrac{25 + 36 - 81}{60} = \\dfrac{-20}{60} \\approx -0.333$.\n\n$C = \\cos^{-1}(-0.333) \\approx 109.5°$, which is **obtuse** (>90°). So the triangle is obtuse at $C$.",
  "CAS_ALLOWED",
);

// ─── Sine/cosine rules SHORT_ANSWER (4) ────────────────────────────────

short(
  SUB_SCR,
  `In triangle $ABC$, $A = 30°$, $B = 80°$, and side $a = 12$ cm. Find side $b$, correct to two decimal places. (3 marks)`,
  3,
  "MEDIUM",
  "Sine rule: $\\dfrac{b}{\\sin B} = \\dfrac{a}{\\sin A}$ (**1 mark** for set-up)\n\n$b = a \\cdot \\dfrac{\\sin B}{\\sin A} = 12 \\cdot \\dfrac{\\sin 80°}{\\sin 30°}$ (**1 mark**)\n\n$= 12 \\cdot \\dfrac{0.9848}{0.5} = 12 \\cdot 1.9696 \\approx 23.64$ cm. (**1 mark**)",
  "CAS_ALLOWED",
);

short(
  SUB_SCR,
  `In triangle $PQR$, $p = 8$, $q = 5$, and the included angle $R = 70°$. Find $r$, correct to two decimal places. (3 marks)`,
  3,
  "MEDIUM",
  "Cosine rule: $r^2 = p^2 + q^2 - 2pq\\cos R$ (**1 mark**)\n\n$= 64 + 25 - 2(8)(5)\\cos 70° = 89 - 80(0.3420) = 89 - 27.36 = 61.64$ (**1 mark**)\n\n$r = \\sqrt{61.64} \\approx 7.85$. (**1 mark**)",
  "CAS_ALLOWED",
);

short(
  SUB_SCR,
  `Find the area of a triangle with sides $a = 12$ cm, $b = 15$ cm and included angle $C = 53°$. Give your answer correct to one decimal place. (2 marks)`,
  2,
  "MEDIUM",
  "Area $= \\frac{1}{2}ab\\sin C$ (**1 mark**)\n\n$= \\frac{1}{2}(12)(15)\\sin 53° = 90 \\times 0.7986 \\approx 71.87$ cm², so $\\approx 71.9$ cm². (**1 mark**)",
  "CAS_ALLOWED",
);

short(
  SUB_SCR,
  `A triangle has sides 8 cm, 12 cm and 15 cm. Use the cosine rule to find the largest angle of the triangle, correct to one decimal place. (3 marks)`,
  3,
  "HARD",
  "Largest angle is opposite the longest side (15 cm). Let $C$ be this angle, $c = 15$, $a = 8$, $b = 12$.\n\n$\\cos C = \\dfrac{a^2 + b^2 - c^2}{2ab} = \\dfrac{64 + 144 - 225}{2(8)(12)} = \\dfrac{-17}{192} \\approx -0.0885$. (**1 mark**)\n\n$C = \\cos^{-1}(-0.0885)$ (**1 mark**)\n\n$\\approx 95.08° \\approx 95.1°$. (**1 mark**)",
  "CAS_ALLOWED",
);

// ─── Sine/cosine rules EXTENDED_ANSWER (2) ─────────────────────────────

extAns(
  SUB_SCR,
  [
    {
      label: "a",
      marks: 2,
      content: `In triangle $ABC$, $A = 45°$, $C = 80°$, $a = 10$. Find angle $B$ and use the sine rule to find side $b$, correct to two decimal places.`,
      solution:
        "Angle sum: $B = 180° - 45° - 80° = 55°$. (**1 mark**)\n\nSine rule: $\\dfrac{b}{\\sin 55°} = \\dfrac{10}{\\sin 45°} \\Rightarrow b = 10 \\cdot \\dfrac{\\sin 55°}{\\sin 45°} = 10 \\cdot \\dfrac{0.8192}{0.7071} \\approx 11.58$. (**1 mark**)",
    },
    {
      label: "b",
      marks: 2,
      content: `Find side $c$ of the same triangle, correct to two decimal places.`,
      solution:
        "$\\dfrac{c}{\\sin 80°} = \\dfrac{10}{\\sin 45°} \\Rightarrow c = 10 \\cdot \\dfrac{\\sin 80°}{\\sin 45°} = 10 \\cdot \\dfrac{0.9848}{0.7071} \\approx 13.93$. (**2 marks**)",
    },
    {
      label: "c",
      marks: 2,
      content: `Find the area of triangle $ABC$ using $\\frac{1}{2}ab\\sin C$, correct to two decimal places.`,
      solution:
        "Area $= \\frac{1}{2}(10)(11.58)\\sin 80° = \\frac{1}{2}(115.8)(0.9848) \\approx 57.02$. (**1 mark**)\n\nSo area $\\approx 57.02$ square units. (**1 mark**)",
    },
  ],
  "MEDIUM",
  `**Triangle solution**\n\nGiven two angles and the side opposite one of them (AAS case), use the sine rule to find the remaining sides, and the area formula to find the area.`,
  "CAS_ALLOWED",
);

extAns(
  SUB_SCR,
  [
    {
      label: "a",
      marks: 2,
      content: `A surveyor measures triangle $LMN$ in a field: $LM = 50$ m, $MN = 70$ m, and angle $M = 110°$. Use the cosine rule to find $LN$, correct to one decimal place.`,
      solution:
        "$LN^2 = LM^2 + MN^2 - 2 \\cdot LM \\cdot MN \\cdot \\cos M = 50^2 + 70^2 - 2(50)(70)\\cos 110°$ (**1 mark**)\n\n$= 2500 + 4900 - 7000(-0.3420) = 7400 + 2394 = 9794$\n\n$LN = \\sqrt{9794} \\approx 98.96$, so $LN \\approx 99.0$ m. (**1 mark**)",
    },
    {
      label: "b",
      marks: 3,
      content: `Use the sine rule to find angles $L$ and $N$, each correct to one decimal place. Verify that they sum to the correct value with $M$.`,
      solution:
        "Sine rule: $\\dfrac{\\sin L}{70} = \\dfrac{\\sin 110°}{98.96}$ (**1 mark**)\n\n$\\sin L = 70 \\cdot \\dfrac{0.9397}{98.96} \\approx 0.6646$, so $L = \\sin^{-1}(0.6646) \\approx 41.6°$. (**1 mark**)\n\n$N = 180° - 110° - 41.6° = 28.4°$. Check: $41.6 + 28.4 + 110 = 180°$. ✓ (**1 mark**)",
    },
    {
      label: "c",
      marks: 2,
      content: `Find the area of the triangle, using $\\frac{1}{2}ab\\sin C$ with $a = LM$, $b = MN$, $C = M$.`,
      solution:
        "Area $= \\frac{1}{2}(50)(70)\\sin 110° = 1750 \\times 0.9397 \\approx 1644.5$ m². (**2 marks**: 1 for set-up, 1 for value)",
    },
  ],
  "MEDIUM",
  `**Surveying a field**\n\nA surveyor needs to determine all sides and angles of a triangular paddock, given two sides and the included angle.`,
  "CAS_ALLOWED",
);

// ─── Sine/cosine rules EXTENDED_RESPONSE (2) ───────────────────────────

extResp(
  SUB_SCR,
  [
    {
      label: "a",
      marks: 3,
      content: `A boat sails from port $P$ on a bearing of $060°$ for 25 km to point $Q$. It then changes bearing to $150°$ and sails 18 km to point $R$. Find the size of angle $PQR$ (the interior angle at $Q$ in triangle $PQR$).`,
      solution:
        "At point $Q$, the boat arrived from a bearing of $060°$ (so the line $QP$ has bearing $060° + 180° = 240°$ from $Q$). The boat then heads on bearing $150°$. (**1 mark**)\n\nInterior angle between the two paths at $Q$: from $QP$ at bearing $240°$ to $QR$ at bearing $150°$. (**1 mark**)\n\n$|240° - 150°| = 90°$. So angle $PQR = 90°$. (**1 mark**)",
    },
    {
      label: "b",
      marks: 2,
      content: `Using the cosine rule (or Pythagoras), find the distance $PR$, in km correct to two decimal places.`,
      solution:
        "Since angle $Q = 90°$, the triangle is right-angled, and Pythagoras gives:\n\n$PR^2 = 25^2 + 18^2 = 625 + 324 = 949$ (**1 mark**)\n\n$PR = \\sqrt{949} \\approx 30.81$ km. (**1 mark**)",
    },
    {
      label: "c",
      marks: 3,
      content: `Find the bearing of $R$ from $P$, in degrees correct to one decimal place.`,
      solution:
        "From $P$, the boat first goes on bearing $060°$ to $Q$. The position of $R$ relative to $P$ can be found by computing northward and eastward components.\n\nFirst leg ($P$ to $Q$): east $= 25 \\sin 60° \\approx 21.65$ km; north $= 25 \\cos 60° = 12.50$ km.\n\nSecond leg ($Q$ to $R$ on bearing $150°$): east $= 18 \\sin 150° = 9.00$ km; north $= 18 \\cos 150° \\approx -15.59$ km. (**1 mark**)\n\nTotal east $= 21.65 + 9.00 = 30.65$; total north $= 12.50 - 15.59 = -3.09$ km (south).\n\nBearing of $R$ from $P$: $R$ lies in south-east (positive east, negative north). $\\theta = 180° - \\tan^{-1}(30.65 / 3.09) = 180° - \\tan^{-1}(9.92)$. (**1 mark**)\n\n$\\tan^{-1}(9.92) \\approx 84.24°$. Bearing $= 180° - 84.24° = 95.76°$, so $\\approx 095.8°$. (**1 mark**)",
    },
    {
      label: "d",
      marks: 2,
      content: `Find the area of triangle $PQR$, using $\\frac{1}{2}ab\\sin C$ with $a = PQ$, $b = QR$, $C = Q = 90°$. State the answer in km² correct to one decimal place.`,
      solution:
        "Area $= \\frac{1}{2}(25)(18)\\sin 90° = \\frac{1}{2}(450)(1) = 225$ km². (**1 mark** for set-up)\n\nSo $225.0$ km² exactly. (**1 mark**)",
    },
    {
      label: "e",
      marks: 2,
      content: `If the boat then sails directly from $R$ back to $P$ at a speed of 12 km/h, find the time taken in hours and minutes, correct to the nearest minute.`,
      solution:
        "$PR \\approx 30.81$ km. Time $= 30.81 / 12 \\approx 2.568$ h. (**1 mark**)\n\n$0.568$ h $= 34.06$ min. So time $\\approx 2$ h $34$ min. (**1 mark**)",
    },
  ],
  "HARD",
  `**Boat navigation**\n\nA boat sails on two consecutive legs, each on a specified compass bearing. We use the cosine and sine rules — and basic geometry of bearings — to determine the resulting triangle.`,
  "CAS_ALLOWED",
);

extResp(
  SUB_SCR,
  [
    {
      label: "a",
      marks: 2,
      content: `Two roads meet at a junction $J$ at an angle of $112°$. A traveller drives 8 km from $J$ along the first road to point $X$, then 11 km from $J$ along the second road to point $Y$. Find the straight-line distance $XY$, in km correct to two decimal places.`,
      solution:
        "Cosine rule with $JX = 8$, $JY = 11$, angle at $J = 112°$:\n\n$XY^2 = 8^2 + 11^2 - 2(8)(11)\\cos 112° = 64 + 121 - 176(-0.3746) = 185 + 65.93 = 250.93$. (**1 mark**)\n\n$XY = \\sqrt{250.93} \\approx 15.84$ km. (**1 mark**)",
    },
    {
      label: "b",
      marks: 3,
      content: `Find the angles at $X$ and at $Y$ in triangle $JXY$, each correct to one decimal place.`,
      solution:
        "Sine rule: $\\dfrac{\\sin X}{11} = \\dfrac{\\sin 112°}{15.84}$ (**1 mark**)\n\n$\\sin X = 11 \\cdot \\dfrac{0.9272}{15.84} \\approx 0.6440$, $X = \\sin^{-1}(0.6440) \\approx 40.1°$. (**1 mark**)\n\n$Y = 180° - 112° - 40.1° = 27.9°$. (**1 mark**)",
    },
    {
      label: "c",
      marks: 2,
      content: `Find the area of triangle $JXY$, in km² correct to two decimal places.`,
      solution:
        "Area $= \\frac{1}{2} \\cdot JX \\cdot JY \\cdot \\sin J = \\frac{1}{2}(8)(11)\\sin 112° = 44 \\times 0.9272 \\approx 40.80$ km². (**2 marks**: 1 for set-up, 1 for value)",
    },
    {
      label: "d",
      marks: 3,
      content: `A direct road is to be built from $X$ to $Y$. Construction costs are \\$250,000 per km. Find the cost of building this road, to the nearest dollar.`,
      solution:
        "$XY \\approx 15.84$ km. (**1 mark**)\n\nCost $= 15.84 \\times 250{,}000 = 3{,}960{,}000$. (**1 mark**)\n\nTo nearest dollar: $\\$3{,}960{,}000$. (**1 mark**)",
    },
    {
      label: "e",
      marks: 3,
      content: `An alternative route follows the existing roads from $X$ back to $J$ and then to $Y$. Compare the total distance of this route with the new $XY$ road, and discuss the percentage saving.`,
      solution:
        "Old route: $JX + JY = 8 + 11 = 19$ km. New: $XY \\approx 15.84$ km. (**1 mark**)\n\nDistance saved $= 19 - 15.84 = 3.16$ km. (**1 mark**)\n\nPercentage saving $= 3.16 / 19 \\times 100 \\approx 16.63\\%$. (**1 mark**)",
    },
  ],
  "HARD",
  `**Highway planning**\n\nA city planner is designing a direct road across an angled junction to save travel time. The geometry involves an obtuse triangle defined by the angle at the junction and the lengths of the existing roads.`,
  "CAS_ALLOWED",
);

// ════════════════════════════════════════════════════════════════════════
// Write output
// ════════════════════════════════════════════════════════════════════════

const spec = {
  subject_slug: SUBJECT_SLUG,
  question_set_id: QUESTION_SET_ID,
  items,
};

const outPath = path.join(OUT_DIR, "qset-general-measurement.json");
fs.writeFileSync(outPath, JSON.stringify(spec, null, 2));

console.log(`✓ Wrote ${items.length} items to ${outPath}`);
console.log(`  MCQ:               ${items.filter((i) => i.type === "MCQ").length}`);
console.log(`  SHORT_ANSWER:      ${items.filter((i) => i.type === "SHORT_ANSWER").length}`);
console.log(`  EXTENDED_ANSWER:   ${items.filter((i) => i.type === "EXTENDED_ANSWER").length}`);
console.log(`  EXTENDED_RESPONSE: ${items.filter((i) => i.type === "EXTENDED_RESPONSE").length}`);

// Per-subtopic breakdown
const subtopics = [
  SUB_PYTH,
  SUB_MENS,
  SUB_AREA,
  SUB_VOL,
  SUB_SIM,
  SUB_TRIG,
  SUB_SCR,
];
console.log(`\n  Per-subtopic counts:`);
for (const st of subtopics) {
  const stItems = items.filter((i) => i.subtopic_slugs[0] === st);
  const m = stItems.filter((i) => i.type === "MCQ").length;
  const s = stItems.filter((i) => i.type === "SHORT_ANSWER").length;
  const ea = stItems.filter((i) => i.type === "EXTENDED_ANSWER").length;
  const er = stItems.filter((i) => i.type === "EXTENDED_RESPONSE").length;
  console.log(`    ${st.padEnd(30)} ${m} MCQ / ${s} SHORT / ${ea} EA / ${er} ER  (total ${stItems.length})`);
}
