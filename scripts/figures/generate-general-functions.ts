/**
 * VCE General Mathematics — Functions, Relations, and Graphs cluster.
 *
 * Subtopics (7):
 *   - linear-functions                       (core-drill, 21 items)
 *   - linear-inequalities                    (core-drill, 21 items)
 *   - direct-and-inverse-variation           (extended-fit, 17 items)
 *   - joint-variation                        (extended-fit, 17 items)
 *   - piecewise-linear-functions             (extended-fit, 17 items)
 *   - simultaneous-linear-equations-graphical (extended-fit, 17 items)
 *   - linear-modelling                       (modelling-rich, 16 items)
 *
 * Target: ~126 items.
 *
 * No calculus. Linear-only content (with y = k/x for inverse variation).
 */
import * as fs from "fs";
import * as path from "path";
import {
  svg,
  toDataUri,
  functionPlot,
  line,
  circle,
  text,
} from "./svg";

const OUT_DIR = path.resolve(__dirname, "../output");
const QUESTION_SET_ID = "cmpkc57xo0007ofk0uo58ws59";
const SUBJECT_SLUG = "vce-general";
const TOPIC_SLUG = "functions-relations-and-graphs";

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

// ─── Custom SVG: number-line for linear inequalities ───────────────────

function numberLine(opts: {
  min: number;
  max: number;
  ticks: number[];
  /** "open" = unfilled circle (strict), "closed" = filled circle (≤/≥) */
  point?: { x: number; type: "open" | "closed" };
  /** Direction of shading; "left" shades to -∞, "right" shades to +∞, "between" shades [a,b] */
  shade?:
    | { type: "left"; from: number }
    | { type: "right"; from: number }
    | { type: "between"; a: number; b: number };
  label?: string;
  width?: number;
}): string {
  const w = opts.width ?? 420;
  const h = 80;
  const margin = 30;
  const xMap = (v: number) => margin + ((v - opts.min) / (opts.max - opts.min)) * (w - 2 * margin);
  const axisY = 40;
  const parts: string[] = [];

  parts.push(
    `<defs><marker id="arrL" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L6,3 z" fill="#111"/></marker><marker id="arrR" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L6,3 z" fill="#111"/></marker></defs>`,
  );

  // Shading (drawn first so it sits under the line and ticks)
  if (opts.shade) {
    let sx = 0;
    let ex = 0;
    if (opts.shade.type === "left") {
      sx = margin;
      ex = xMap(opts.shade.from);
    } else if (opts.shade.type === "right") {
      sx = xMap(opts.shade.from);
      ex = w - margin;
    } else {
      sx = xMap(opts.shade.a);
      ex = xMap(opts.shade.b);
    }
    parts.push(
      line(sx, axisY, ex, axisY, { stroke: "#2563eb", width: 5 }),
    );
  }

  // Main axis (with arrowheads)
  parts.push(
    `<line x1="${margin - 10}" y1="${axisY}" x2="${w - margin + 10}" y2="${axisY}" stroke="#111" stroke-width="1.5" marker-end="url(#arrR)" marker-start="url(#arrL)"/>`,
  );

  // Ticks + labels
  for (const t of opts.ticks) {
    const px = xMap(t);
    parts.push(line(px, axisY - 4, px, axisY + 4, { width: 1.2 }));
    parts.push(
      text(px, axisY + 18, t < 0 ? `−${Math.abs(t)}` : String(t), {
        size: 12,
        anchor: "middle",
      }),
    );
  }

  // Marker point(s)
  if (opts.point) {
    const px = xMap(opts.point.x);
    if (opts.point.type === "closed") {
      parts.push(circle(px, axisY, 5, { fill: "#2563eb", stroke: "#2563eb" }));
    } else {
      parts.push(circle(px, axisY, 5, { fill: "white", stroke: "#2563eb", width: 2 }));
    }
  }

  // Optional label below
  if (opts.label) {
    parts.push(text(w / 2, h - 5, opts.label, { size: 12, anchor: "middle", italic: true }));
  }

  return svg({ width: w, height: h }, parts.join(""));
}

// ─── Helper constructors ───────────────────────────────────────────────

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
  tech: Tech = "TECH_FREE",
) => {
  const marks = parts.reduce(
    (s, p) =>
      s +
      (p.subParts && p.subParts.length > 0
        ? p.subParts.reduce((ss, sp) => ss + sp.marks, 0)
        : p.marks),
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
  tech: Tech = "TECH_FREE",
) => {
  const marks = parts.reduce(
    (s, p) =>
      s +
      (p.subParts && p.subParts.length > 0
        ? p.subParts.reduce((ss, sp) => ss + sp.marks, 0)
        : p.marks),
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
// SUBTOPIC 1 — Linear functions  (core-drill, 21 items)
// ════════════════════════════════════════════════════════════════════════

const LF = "linear-functions";

// Shared diagrams
const lfPlotSvg = functionPlot({
  fn: (x) => 2 * x - 3,
  xRange: [-2, 6],
  yRange: [-6, 8],
  xTicks: [-2, -1, 1, 2, 3, 4, 5, 6],
  yTicks: [-6, -4, -2, 2, 4, 6, 8],
  color: "#dc2626",
  markedPoints: [
    { x: 0, label: "(0, −3)" },
    { x: 3, label: "(3, 3)" },
  ],
});

const lfTwoLinesSvg = functionPlot({
  fn: (x) => x + 2,
  xRange: [-4, 6],
  yRange: [-4, 8],
  xTicks: [-4, -2, 2, 4, 6],
  yTicks: [-4, -2, 2, 4, 6, 8],
  color: "#dc2626",
  fnLabel: "y = x + 2",
  fnLabelAt: { x: 4, y: 7 },
  additionalFns: [
    {
      fn: (x) => -2 * x + 4,
      color: "#2563eb",
      label: "y = −2x + 4",
      labelAt: { x: -2, y: 7 },
    },
  ],
});

// ─── MCQ (12) ──────────────────────────────────────────────────────────

mcq(
  LF,
  `The gradient of the line passing through $(1, 2)$ and $(5, 10)$ is\n\n`,
  ["$\\dfrac{1}{2}$", "$2$", "$3$", "$8$"],
  "B",
  "EASY",
  "**Answer: B**\n\nGradient $m = \\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{10 - 2}{5 - 1} = \\dfrac{8}{4} = 2$.",
);

mcq(
  LF,
  `The y-intercept of the line $y = 4x - 7$ is\n\n`,
  ["$-7$", "$4$", "$7$", "$\\dfrac{7}{4}$"],
  "A",
  "EASY",
  "**Answer: A**\n\nIn the form $y = mx + c$, the y-intercept is $c = -7$.",
);

mcq(
  LF,
  `The x-intercept of the line $y = 3x + 12$ is\n\n`,
  ["$-12$", "$-4$", "$4$", "$12$"],
  "B",
  "EASY",
  "**Answer: B**\n\nSet $y = 0$: $0 = 3x + 12$, so $3x = -12$, giving $x = -4$.",
);

mcq(
  LF,
  `Which line is parallel to $y = -2x + 5$?\n\n`,
  ["$y = 2x + 5$", "$y = -2x - 3$", "$y = \\dfrac{1}{2}x + 5$", "$y = -\\dfrac{1}{2}x + 1$"],
  "B",
  "EASY",
  "**Answer: B**\n\nParallel lines share the same gradient. The given line has gradient $-2$; only $y = -2x - 3$ shares this gradient.",
);

mcq(
  LF,
  `A line has gradient $\\dfrac{2}{3}$. The gradient of a line perpendicular to it is\n\n`,
  ["$\\dfrac{2}{3}$", "$-\\dfrac{2}{3}$", "$\\dfrac{3}{2}$", "$-\\dfrac{3}{2}$"],
  "D",
  "EASY",
  "**Answer: D**\n\nPerpendicular gradients multiply to $-1$: $\\dfrac{2}{3} \\times m_\\perp = -1$, so $m_\\perp = -\\dfrac{3}{2}$.",
);

mcq(
  LF,
  `The equation of the line with gradient $-3$ passing through the point $(2, 1)$ is\n\n`,
  ["$y = -3x + 7$", "$y = -3x - 5$", "$y = -3x + 5$", "$y = 3x - 5$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nUsing point-slope: $y - 1 = -3(x - 2) = -3x + 6$, so $y = -3x + 7$.",
);

mcq(
  LF,
  `${img(lfPlotSvg)}\n\nThe equation of the line shown is\n\n`,
  ["$y = 2x - 3$", "$y = 2x + 3$", "$y = -2x - 3$", "$y = \\dfrac{1}{2}x - 3$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nFrom the marked points, the y-intercept is $-3$ and the gradient is $\\dfrac{3 - (-3)}{3 - 0} = 2$. So $y = 2x - 3$.",
);

mcq(
  LF,
  `The gradient of the line $2x - 5y + 10 = 0$ is\n\n`,
  ["$-\\dfrac{5}{2}$", "$-\\dfrac{2}{5}$", "$\\dfrac{2}{5}$", "$\\dfrac{5}{2}$"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nRearrange to gradient–intercept form: $5y = 2x + 10$, so $y = \\dfrac{2}{5}x + 2$. Gradient $= \\dfrac{2}{5}$.",
);

mcq(
  LF,
  `A line passes through $(-1, 4)$ and $(3, -4)$. Its equation is\n\n`,
  ["$y = -2x + 2$", "$y = 2x + 2$", "$y = -2x - 2$", "$y = -\\dfrac{1}{2}x + \\dfrac{7}{2}$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nGradient $= \\dfrac{-4 - 4}{3 - (-1)} = \\dfrac{-8}{4} = -2$. Use point $(-1, 4)$: $4 = -2(-1) + c$, so $c = 2$. Equation: $y = -2x + 2$.",
);

mcq(
  LF,
  `The line $y = mx + c$ passes through $(0, -4)$ and is parallel to $y = 3x + 7$. The value of $m + c$ is\n\n`,
  ["$-7$", "$-1$", "$3$", "$11$"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nParallel ⇒ $m = 3$. Passes through $(0, -4)$ ⇒ $c = -4$. So $m + c = 3 + (-4) = -1$.",
);

mcq(
  LF,
  `The line $\\ell_1$ has equation $y = \\dfrac{1}{4}x + 2$. The line $\\ell_2$ is perpendicular to $\\ell_1$ and passes through the origin. The equation of $\\ell_2$ is\n\n`,
  ["$y = \\dfrac{1}{4}x$", "$y = -\\dfrac{1}{4}x$", "$y = 4x$", "$y = -4x$"],
  "D",
  "HARD",
  "**Answer: D**\n\n$m_1 = \\dfrac{1}{4}$, so $m_2 = -4$ (negative reciprocal). Through origin ⇒ $c = 0$. So $\\ell_2: y = -4x$.",
);

mcq(
  LF,
  `A line has x-intercept $-2$ and y-intercept $6$. Its gradient is\n\n`,
  ["$-3$", "$\\dfrac{1}{3}$", "$3$", "$-\\dfrac{1}{3}$"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nThe line passes through $(-2, 0)$ and $(0, 6)$. Gradient $= \\dfrac{6 - 0}{0 - (-2)} = \\dfrac{6}{2} = 3$.",
);

// ─── SHORT_ANSWER (5) ──────────────────────────────────────────────────

short(
  LF,
  `Find the equation of the line passing through the points $(2, 5)$ and $(6, 13)$. (2 marks)`,
  2,
  "EASY",
  "Gradient $m = \\dfrac{13 - 5}{6 - 2} = \\dfrac{8}{4} = 2$.\n\nUsing point $(2, 5)$: $y - 5 = 2(x - 2)$, so $y = 2x + 1$.\n\n**Equation: $y = 2x + 1$.**",
);

short(
  LF,
  `Determine the equation of the line that is perpendicular to $y = \\dfrac{2}{3}x - 4$ and passes through the point $(6, -1)$. (3 marks)`,
  3,
  "MEDIUM",
  "Gradient of given line is $\\dfrac{2}{3}$, so perpendicular gradient $m_\\perp = -\\dfrac{3}{2}$. (1 mark)\n\nUsing $(6, -1)$: $-1 = -\\dfrac{3}{2}(6) + c$, so $-1 = -9 + c$, giving $c = 8$. (1 mark)\n\n**Equation: $y = -\\dfrac{3}{2}x + 8$.** (1 mark)",
);

short(
  LF,
  `The line $\\ell$ has equation $4x - 3y + 12 = 0$.\n\n**a.** Find the gradient and y-intercept of $\\ell$. (2 marks)\n\n**b.** Find the x-intercept of $\\ell$. (1 mark) (3 marks)`,
  3,
  "MEDIUM",
  "**a.** Rearrange: $3y = 4x + 12$, so $y = \\dfrac{4}{3}x + 4$. Gradient $= \\dfrac{4}{3}$, y-intercept $= 4$. (2 marks)\n\n**b.** Set $y = 0$: $4x + 12 = 0$, so $x = -3$. **x-intercept = $-3$.** (1 mark)",
);

short(
  LF,
  `Find the equation of the line that passes through the point $(-2, 3)$ and is parallel to the line joining $(1, -4)$ and $(4, 2)$. (3 marks)`,
  3,
  "MEDIUM",
  "Gradient of joining line: $m = \\dfrac{2 - (-4)}{4 - 1} = \\dfrac{6}{3} = 2$. (1 mark)\n\nParallel ⇒ new line also has gradient $2$.\n\nUsing $(-2, 3)$: $3 = 2(-2) + c$, so $c = 7$. (1 mark)\n\n**Equation: $y = 2x + 7$.** (1 mark)",
);

short(
  LF,
  `The line $y = 3x - 5$ intersects the line $y = -x + 7$ at the point $P$.\n\n**a.** Find the coordinates of $P$. (2 marks)\n\n**b.** State whether $P$ lies in the first quadrant. (1 mark) (3 marks)`,
  3,
  "MEDIUM",
  "**a.** Equating: $3x - 5 = -x + 7$, so $4x = 12$, $x = 3$. Then $y = 3(3) - 5 = 4$. **$P = (3, 4)$.** (2 marks)\n\n**b.** Both coordinates positive ⇒ $P$ **lies in the first quadrant**. (1 mark)",
);

// ─── EXTENDED_ANSWER (2) ───────────────────────────────────────────────

extAns(
  LF,
  [
    {
      label: "a",
      marks: 2,
      content: `Find the gradient of the line shown and write down its y-intercept.\n\n${img(lfPlotSvg)}`,
      solution:
        "From the marked points $(0, -3)$ and $(3, 3)$:\n\nGradient $= \\dfrac{3 - (-3)}{3 - 0} = \\dfrac{6}{3} = 2$.\n\ny-intercept $= -3$. (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `Write down the equation of the line in the form $y = mx + c$.`,
      solution: "From part **a**, $m = 2$ and $c = -3$. **Equation: $y = 2x - 3$.** (2 marks)",
    },
    {
      label: "c",
      marks: 1,
      content: `Find the x-intercept of the line.`,
      solution: "Set $y = 0$: $0 = 2x - 3$, so $x = \\dfrac{3}{2}$. **x-intercept = $\\dfrac{3}{2}$.** (1 mark)",
    },
  ],
  "MEDIUM",
  `The graph below shows a straight line $\\ell$ passing through the points $(0, -3)$ and $(3, 3)$.`,
);

extAns(
  LF,
  [
    {
      label: "a",
      marks: 2,
      content: `Find the gradient of the line that joins $A$ and $B$, where $A = (-1, 5)$ and $B = (4, -10)$.`,
      solution: "$m = \\dfrac{-10 - 5}{4 - (-1)} = \\dfrac{-15}{5} = -3$. (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the equation of the line $AB$ in the form $y = mx + c$.`,
      solution:
        "Using $A = (-1, 5)$: $5 = -3(-1) + c$, so $c = 2$. **Equation: $y = -3x + 2$.** (2 marks)",
    },
    {
      label: "c",
      marks: 2,
      content: `Find the equation of the line through $C = (2, 7)$ that is perpendicular to $AB$.`,
      solution:
        "Gradient of $AB$ is $-3$, so $m_\\perp = \\dfrac{1}{3}$. Using $C = (2, 7)$: $7 = \\dfrac{1}{3}(2) + c$, so $c = 7 - \\dfrac{2}{3} = \\dfrac{19}{3}$. **Equation: $y = \\dfrac{1}{3}x + \\dfrac{19}{3}$.** (2 marks)",
    },
  ],
  "MEDIUM",
);

// ─── EXTENDED_RESPONSE (2) ─────────────────────────────────────────────

extResp(
  LF,
  [
    {
      label: "a",
      marks: 2,
      content: `Find the gradient of the line $\\ell_1$ that passes through $A(1, 2)$ and $B(5, 14)$.`,
      solution: "$m_1 = \\dfrac{14 - 2}{5 - 1} = \\dfrac{12}{4} = 3$. (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `Write down the equation of $\\ell_1$ in the form $y = mx + c$.`,
      solution:
        "Using $A(1, 2)$: $2 = 3(1) + c$, so $c = -1$. **Equation: $y = 3x - 1$.** (2 marks)",
    },
    {
      label: "c",
      marks: 2,
      content: `The line $\\ell_2$ passes through $C(3, 0)$ and is parallel to $\\ell_1$. Find the equation of $\\ell_2$.`,
      solution:
        "Parallel ⇒ $m_2 = 3$. Using $C(3, 0)$: $0 = 3(3) + c$, so $c = -9$. **Equation: $y = 3x - 9$.** (2 marks)",
    },
    {
      label: "d",
      marks: 2,
      content: `The line $\\ell_3$ is perpendicular to $\\ell_1$ and passes through $D(-1, 4)$. Find the equation of $\\ell_3$.`,
      solution:
        "Perpendicular ⇒ $m_3 = -\\dfrac{1}{3}$. Using $D(-1, 4)$: $4 = -\\dfrac{1}{3}(-1) + c$, so $c = 4 - \\dfrac{1}{3} = \\dfrac{11}{3}$. **Equation: $y = -\\dfrac{1}{3}x + \\dfrac{11}{3}$.** (2 marks)",
    },
    {
      label: "e",
      marks: 2,
      content: `Find the coordinates of the point where $\\ell_1$ crosses the x-axis.`,
      solution:
        "Set $y = 0$ in $\\ell_1$: $0 = 3x - 1$, so $x = \\dfrac{1}{3}$. **Coordinates: $\\left(\\dfrac{1}{3}, 0\\right)$.** (2 marks)",
    },
  ],
  "MEDIUM",
  `**Question — Linear functions in coordinate geometry**\n\nThree lines $\\ell_1$, $\\ell_2$, $\\ell_3$ are studied in this question. They are defined by their gradients, y-intercepts, and known points on each line. Carry as much exact-value working as possible.`,
);

extResp(
  LF,
  [
    {
      label: "a",
      marks: 2,
      content: `The graph below shows two lines, $y = x + 2$ and $y = -2x + 4$. State the y-intercept of each line.\n\n${img(lfTwoLinesSvg)}`,
      solution:
        "$y = x + 2$ has y-intercept $2$.\n\n$y = -2x + 4$ has y-intercept $4$. (2 marks — 1 mark each)",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the x-intercept of each line.`,
      solution:
        "$y = x + 2$: $0 = x + 2 \\Rightarrow x = -2$.\n\n$y = -2x + 4$: $0 = -2x + 4 \\Rightarrow x = 2$. (2 marks)",
    },
    {
      label: "c",
      marks: 2,
      content: `Find the point of intersection of the two lines by setting them equal.`,
      solution:
        "$x + 2 = -2x + 4 \\Rightarrow 3x = 2 \\Rightarrow x = \\dfrac{2}{3}$.\n\n$y = \\dfrac{2}{3} + 2 = \\dfrac{8}{3}$.\n\n**Intersection: $\\left(\\dfrac{2}{3}, \\dfrac{8}{3}\\right)$.** (2 marks)",
    },
    {
      label: "d",
      marks: 2,
      content: `Are the two lines perpendicular? Justify your answer.`,
      solution:
        "Gradients are $1$ and $-2$. Product $= 1 \\times (-2) = -2 \\neq -1$.\n\n**The lines are NOT perpendicular.** (2 marks)",
    },
    {
      label: "e",
      marks: 3,
      content: `Write down the equation of the line through the origin that is parallel to $y = -2x + 4$, and state where it crosses the line $y = x + 2$.`,
      solution:
        "Parallel through origin: gradient $-2$, y-intercept $0$ ⇒ $y = -2x$. (1 mark)\n\nIntersection with $y = x + 2$: $-2x = x + 2$, so $-3x = 2$, $x = -\\dfrac{2}{3}$, $y = \\dfrac{4}{3}$. (2 marks)\n\n**Intersection: $\\left(-\\dfrac{2}{3}, \\dfrac{4}{3}\\right)$.**",
    },
  ],
  "HARD",
  `**Question — Two straight lines on a Cartesian plane**\n\nThe graph below shows two straight lines, $y = x + 2$ and $y = -2x + 4$. The lines intersect at a single point and divide the plane into four regions. Use the diagram to answer the parts that follow.`,
);

// ════════════════════════════════════════════════════════════════════════
// SUBTOPIC 2 — Linear inequalities  (core-drill, 21 items)
// ════════════════════════════════════════════════════════════════════════

const LI = "linear-inequalities";

// Shared number-line diagrams
const liNumLineShade = numberLine({
  min: -3,
  max: 7,
  ticks: [-2, -1, 0, 1, 2, 3, 4, 5, 6],
  point: { x: 3, type: "closed" },
  shade: { type: "left", from: 3 },
});

const liNumLineOpenRight = numberLine({
  min: -3,
  max: 7,
  ticks: [-2, -1, 0, 1, 2, 3, 4, 5, 6],
  point: { x: 1, type: "open" },
  shade: { type: "right", from: 1 },
});

// ─── MCQ (12) ──────────────────────────────────────────────────────────

mcq(
  LI,
  `The solution to the inequality $2x + 5 \\le 11$ is\n\n`,
  ["$x \\le 3$", "$x \\ge 3$", "$x \\le 8$", "$x \\le -3$"],
  "A",
  "EASY",
  "**Answer: A**\n\n$2x + 5 \\le 11 \\Rightarrow 2x \\le 6 \\Rightarrow x \\le 3$.",
);

mcq(
  LI,
  `The solution to $-3x > 12$ is\n\n`,
  ["$x > -4$", "$x < -4$", "$x > 4$", "$x < 4$"],
  "B",
  "EASY",
  "**Answer: B**\n\nDivide by $-3$ and reverse the inequality: $x < -4$.",
);

mcq(
  LI,
  `${img(liNumLineShade)}\n\nThe number line above represents the inequality\n\n`,
  ["$x < 3$", "$x \\le 3$", "$x > 3$", "$x \\ge 3$"],
  "B",
  "EASY",
  "**Answer: B**\n\nThe filled (closed) circle at $3$ means $x = 3$ is included, and shading extends to the left ⇒ $x \\le 3$.",
);

mcq(
  LI,
  `${img(liNumLineOpenRight)}\n\nThe number line above represents the inequality\n\n`,
  ["$x \\ge 1$", "$x > 1$", "$x \\le 1$", "$x < 1$"],
  "B",
  "EASY",
  "**Answer: B**\n\nOpen circle at $1$ ⇒ $x = 1$ is excluded, shading to the right ⇒ $x > 1$.",
);

mcq(
  LI,
  `The solution to $4x - 7 < 9$ is\n\n`,
  ["$x < 4$", "$x > 4$", "$x < \\dfrac{1}{2}$", "$x < 16$"],
  "A",
  "EASY",
  "**Answer: A**\n\n$4x - 7 < 9 \\Rightarrow 4x < 16 \\Rightarrow x < 4$.",
);

mcq(
  LI,
  `The solution to $5 - 2x \\le 13$ is\n\n`,
  ["$x \\le -4$", "$x \\ge -4$", "$x \\le 4$", "$x \\ge 4$"],
  "B",
  "EASY",
  "**Answer: B**\n\n$5 - 2x \\le 13 \\Rightarrow -2x \\le 8 \\Rightarrow x \\ge -4$ (flip when dividing by negative).",
);

mcq(
  LI,
  `Solving $\\dfrac{x + 3}{2} > 5$ gives\n\n`,
  ["$x > 7$", "$x > 13$", "$x > 8$", "$x > 2$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nMultiply both sides by $2$: $x + 3 > 10$, so $x > 7$.",
);

mcq(
  LI,
  `The solution to the compound inequality $-3 < 2x + 1 \\le 7$ is\n\n`,
  ["$-2 < x \\le 3$", "$-2 \\le x \\le 3$", "$-1 < x \\le 4$", "$-2 < x < 3$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nSubtract $1$: $-4 < 2x \\le 6$. Divide by $2$: $-2 < x \\le 3$.",
);

mcq(
  LI,
  `Which point $(x, y)$ satisfies the inequality $2x + 3y < 12$?\n\n`,
  ["$(1, 2)$", "$(3, 3)$", "$(4, 2)$", "$(2, 4)$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nSubstitute each option:\n\n- $(1, 2)$: $2(1) + 3(2) = 2 + 6 = 8 < 12$ ✓\n- $(3, 3)$: $2(3) + 3(3) = 6 + 9 = 15 < 12$ ✗\n- $(4, 2)$: $2(4) + 3(2) = 8 + 6 = 14 < 12$ ✗\n- $(2, 4)$: $2(2) + 3(4) = 4 + 12 = 16 < 12$ ✗\n\nOnly $(1, 2)$ satisfies.",
);

mcq(
  LI,
  `The shaded region in the plane defined by $x + y \\le 4$, $x \\ge 0$, $y \\ge 0$ has area\n\n`,
  ["$4$ sq units", "$8$ sq units", "$12$ sq units", "$16$ sq units"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nThe region is a right triangle with vertices $(0, 0)$, $(4, 0)$, $(0, 4)$.\n\nArea $= \\dfrac{1}{2} \\times 4 \\times 4 = 8$ square units.",
);

mcq(
  LI,
  `If $x$ is a positive integer, the number of solutions to $2x - 5 < 11$ is\n\n`,
  ["$6$", "$7$", "$8$", "infinitely many"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$2x - 5 < 11 \\Rightarrow 2x < 16 \\Rightarrow x < 8$.\n\nPositive integer solutions: $1, 2, 3, 4, 5, 6, 7$ — that is **7 values**.",
);

mcq(
  LI,
  `Solving the inequality $3(x - 2) > 2(x + 1) - 7$ gives\n\n`,
  ["$x > -3$", "$x > 1$", "$x < 1$", "$x < -3$"],
  "B",
  "HARD",
  "**Answer: B**\n\nExpand: $3x - 6 > 2x + 2 - 7 = 2x - 5$.\n\n$3x - 2x > -5 + 6$, so $x > 1$.",
);

// ─── SHORT_ANSWER (5) ──────────────────────────────────────────────────

short(
  LI,
  `Solve the inequality $5x + 2 \\ge 17$ and represent the solution on a number line. (2 marks)`,
  2,
  "EASY",
  "$5x + 2 \\ge 17 \\Rightarrow 5x \\ge 15 \\Rightarrow x \\ge 3$.\n\nOn a number line: filled (closed) circle at $3$, shading to the right (extending to $+\\infty$). (2 marks — 1 algebra, 1 number-line representation)",
);

short(
  LI,
  `Solve the inequality $3 - 4x < 19$. (2 marks)`,
  2,
  "EASY",
  "$3 - 4x < 19 \\Rightarrow -4x < 16 \\Rightarrow x > -4$ (inequality reversed when dividing by a negative). (2 marks)",
);

short(
  LI,
  `Solve $\\dfrac{2x - 1}{3} \\le 5$. (3 marks)`,
  3,
  "MEDIUM",
  "Multiply both sides by $3$: $2x - 1 \\le 15$. (1 mark)\n\nAdd $1$: $2x \\le 16$. (1 mark)\n\nDivide by $2$: $x \\le 8$. (1 mark)",
);

short(
  LI,
  `Solve the compound inequality $-7 \\le 3x - 1 < 8$. Represent the solution on a number line. (4 marks)`,
  4,
  "MEDIUM",
  "Add $1$ throughout: $-6 \\le 3x < 9$. (1 mark)\n\nDivide by $3$: $-2 \\le x < 3$. (1 mark)\n\n**Solution: $-2 \\le x < 3$.** (1 mark)\n\nNumber line: closed circle at $-2$, open circle at $3$, shading between. (1 mark)",
);

short(
  LI,
  `A taxi charges a \\$3.00 flag-fall plus \\$2.50 per kilometre. A passenger has a budget of at most \\$20.00.\n\n**a.** Write a linear inequality in $x$ for the maximum distance $x$ (km) the passenger can travel. (1 mark)\n\n**b.** Solve for $x$ and state the maximum whole-kilometre distance. (3 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** $3 + 2.5x \\le 20$. (1 mark)\n\n**b.** $2.5x \\le 17$, so $x \\le 6.8$. (2 marks)\n\nMaximum whole-kilometre distance = **6 km**. (1 mark)",
);

// ─── EXTENDED_ANSWER (2) ───────────────────────────────────────────────

extAns(
  LI,
  [
    {
      label: "a",
      marks: 2,
      content: `Solve the inequality $4x - 7 < 2x + 9$.`,
      solution:
        "$4x - 7 < 2x + 9 \\Rightarrow 2x < 16 \\Rightarrow x < 8$. (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `Solve the inequality $3 - \\dfrac{x}{2} \\ge 5$.`,
      solution:
        "$-\\dfrac{x}{2} \\ge 2$, so $\\dfrac{x}{2} \\le -2$, giving $x \\le -4$. (2 marks)",
    },
    {
      label: "c",
      marks: 2,
      content: `Solve the compound inequality $1 < 2 - 3x \\le 8$ and represent the solution on a number line.`,
      solution:
        "From $1 < 2 - 3x$: $-1 < -3x$, so $x < \\dfrac{1}{3}$.\n\nFrom $2 - 3x \\le 8$: $-3x \\le 6$, so $x \\ge -2$.\n\nCombined: $-2 \\le x < \\dfrac{1}{3}$. (1 mark)\n\nNumber line: closed circle at $-2$, open circle at $\\dfrac{1}{3}$, shading between. (1 mark)",
    },
  ],
  "MEDIUM",
);

extAns(
  LI,
  [
    {
      label: "a",
      marks: 2,
      content: `The region $R$ in the Cartesian plane is defined by $x + 2y \\le 8$, $x \\ge 0$, $y \\ge 0$. Find the three vertices of $R$.`,
      solution:
        "Boundary line $x + 2y = 8$ has x-intercept $8$ (at $y = 0$) and y-intercept $4$ (at $x = 0$). With $x \\ge 0$, $y \\ge 0$, the vertices are $(0, 0)$, $(8, 0)$, $(0, 4)$. (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the area of region $R$.`,
      solution:
        "$R$ is a right triangle with legs $8$ (along x-axis) and $4$ (along y-axis).\n\nArea $= \\dfrac{1}{2} \\times 8 \\times 4 = 16$ square units. (2 marks)",
    },
    {
      label: "c",
      marks: 1,
      content: `Does the point $(2, 3)$ lie in $R$? Justify.`,
      solution:
        "Check $x + 2y = 2 + 6 = 8 \\le 8$ ✓. Also $x = 2 \\ge 0$ ✓ and $y = 3 \\ge 0$ ✓. **Yes**, $(2, 3)$ lies in $R$ (on the boundary). (1 mark)",
    },
  ],
  "MEDIUM",
);

// ─── EXTENDED_RESPONSE (2) ─────────────────────────────────────────────

extResp(
  LI,
  [
    {
      label: "a",
      marks: 2,
      content: `Solve the inequality $\\dfrac{5 - 2x}{3} > -1$.`,
      solution:
        "Multiply both sides by $3$: $5 - 2x > -3$.\n\nSubtract $5$: $-2x > -8$. Divide by $-2$ (flip): $x < 4$. **Solution: $x < 4$.** (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `Solve $4 - 3x \\ge x + 16$.`,
      solution:
        "$4 - 3x \\ge x + 16$\n\n$-4x \\ge 12$\n\n$x \\le -3$ (flip when dividing by negative). (2 marks)",
    },
    {
      label: "c",
      marks: 2,
      content: `Solve the compound inequality $-5 \\le 3 - 2x < 9$.`,
      solution:
        "$-5 \\le 3 - 2x < 9$\n\nSubtract $3$: $-8 \\le -2x < 6$.\n\nDivide by $-2$ (flip both): $4 \\ge x > -3$, i.e. $-3 < x \\le 4$. (2 marks)",
    },
    {
      label: "d",
      marks: 3,
      content: `A student earns \\$15 per hour at a part-time job. They also receive a fixed weekly allowance of \\$30. To save at least \\$120 in a week (combining wages and allowance), how many hours must the student work? Write a linear inequality and solve it.`,
      solution:
        "Let $h$ = hours worked.\n\nInequality: $15h + 30 \\ge 120$. (1 mark)\n\nSolving: $15h \\ge 90 \\Rightarrow h \\ge 6$. (1 mark)\n\nThe student must work **at least 6 hours**. (1 mark)",
    },
    {
      label: "e",
      marks: 3,
      content: `An ice-cream truck operator earns a daily profit of $P = 4n - 80$ dollars, where $n$ is the number of ice creams sold and \\$80 is the daily fixed cost. To make a profit of at least \\$120 on a given day, how many ice creams must be sold? Set up and solve an inequality.`,
      solution:
        "Need $4n - 80 \\ge 120$. (1 mark)\n\n$4n \\ge 200 \\Rightarrow n \\ge 50$. (1 mark)\n\n**The operator must sell at least 50 ice creams.** (1 mark)",
    },
  ],
  "HARD",
  `**Question — Linear inequalities**\n\nThis question explores solving linear inequalities (single, two-sided, and applied) and interpreting solutions in real-world contexts.`,
);

extResp(
  LI,
  [
    {
      label: "a",
      marks: 2,
      content: `A rectangle has length $(2x + 3)$ cm and width $(x - 1)$ cm. The perimeter is at most $32$ cm. Write an inequality for $x$.`,
      solution:
        "Perimeter $= 2[(2x + 3) + (x - 1)] = 2(3x + 2) = 6x + 4 \\le 32$.\n\n**Inequality: $6x + 4 \\le 32$.** (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `Solve the inequality and state the maximum integer value of $x$.`,
      solution:
        "$6x + 4 \\le 32 \\Rightarrow 6x \\le 28 \\Rightarrow x \\le \\dfrac{28}{6} = \\dfrac{14}{3} \\approx 4.67$.\n\n**Maximum integer value of $x$ is $4$.** (2 marks)",
    },
    {
      label: "c",
      marks: 2,
      content: `Width must also be positive. Write a second inequality for $x$ and combine with part **a**'s result.`,
      solution:
        "Width $(x - 1) > 0 \\Rightarrow x > 1$. (1 mark)\n\nCombined with $x \\le \\dfrac{14}{3}$: $1 < x \\le \\dfrac{14}{3}$.\n\nInteger values: $x \\in \\{2, 3, 4\\}$. (1 mark)",
    },
    {
      label: "d",
      marks: 3,
      content: `For each integer value of $x$ found in part **c**, compute the perimeter and identify the largest perimeter possible (within the constraint).`,
      solution:
        "$x = 2$: $P = 6(2) + 4 = 16$ cm.\n\n$x = 3$: $P = 6(3) + 4 = 22$ cm.\n\n$x = 4$: $P = 6(4) + 4 = 28$ cm.\n\n**Largest perimeter (within the constraint $P \\le 32$): $28$ cm** at $x = 4$. (3 marks)",
    },
    {
      label: "e",
      marks: 2,
      content: `If instead the requirement were that the perimeter equals exactly $32$ cm, would there be any positive integer $x$ that works? Show working.`,
      solution:
        "$6x + 4 = 32 \\Rightarrow 6x = 28 \\Rightarrow x = \\dfrac{14}{3}$, which is not an integer.\n\n**No** positive integer $x$ gives perimeter exactly $32$ cm. (2 marks)",
    },
  ],
  "MEDIUM",
  `**Question — Inequalities in geometric context**\n\nA rectangle has length $(2x + 3)$ cm and width $(x - 1)$ cm, where $x$ is a positive number. We will explore the perimeter constraint $P \\le 32$ cm and the integer values of $x$ that satisfy both this and the positive-width condition.`,
);

// ════════════════════════════════════════════════════════════════════════
// SUBTOPIC 3 — Direct and inverse variation (extended-fit, 17 items)
// ════════════════════════════════════════════════════════════════════════

const DIV = "direct-and-inverse-variation";

// Shared diagram: inverse variation graph y = 12/x
const inverseGraphSvg = functionPlot({
  fn: (x) => 12 / x,
  xRange: [0.5, 12],
  yRange: [0, 25],
  xTicks: [1, 2, 3, 4, 6, 8, 10, 12],
  yTicks: [5, 10, 15, 20, 25],
  color: "#dc2626",
  fnLabel: "y = 12/x",
  fnLabelAt: { x: 8, y: 5 },
  markedPoints: [
    { x: 2, label: "(2, 6)" },
    { x: 6, label: "(6, 2)" },
  ],
});

// ─── MCQ (9) ──────────────────────────────────────────────────────────

mcq(
  DIV,
  `If $y$ varies directly with $x$ and $y = 20$ when $x = 4$, the constant of proportionality $k$ is\n\n`,
  ["$0.2$", "$4$", "$5$", "$80$"],
  "C",
  "EASY",
  "**Answer: C**\n\n$y = kx$ ⇒ $20 = k(4) \\Rightarrow k = 5$.",
);

mcq(
  DIV,
  `If $y \\propto x$ and $y = 18$ when $x = 6$, then when $x = 10$, $y$ equals\n\n`,
  ["$3$", "$24$", "$30$", "$60$"],
  "C",
  "EASY",
  "**Answer: C**\n\n$k = \\dfrac{18}{6} = 3$, so $y = 3x$. At $x = 10$: $y = 30$.",
);

mcq(
  DIV,
  `If $y$ varies inversely with $x$ and $y = 8$ when $x = 3$, the constant $k$ is\n\n`,
  ["$\\dfrac{3}{8}$", "$\\dfrac{8}{3}$", "$11$", "$24$"],
  "D",
  "EASY",
  "**Answer: D**\n\n$y = \\dfrac{k}{x}$ ⇒ $8 = \\dfrac{k}{3} \\Rightarrow k = 24$.",
);

mcq(
  DIV,
  `If $y$ varies inversely with $x$ and $y = 12$ when $x = 5$, then when $x = 15$, $y$ equals\n\n`,
  ["$4$", "$36$", "$60$", "$25$"],
  "A",
  "EASY",
  "**Answer: A**\n\n$k = xy = 5 \\times 12 = 60$, so $y = \\dfrac{60}{x}$. At $x = 15$: $y = \\dfrac{60}{15} = 4$.",
);

mcq(
  DIV,
  `If $y$ varies directly with $x$ and $x$ is doubled, then $y$ is\n\n`,
  ["halved", "doubled", "tripled", "unchanged"],
  "B",
  "EASY",
  "**Answer: B**\n\n$y = kx$ — doubling $x$ doubles $y$.",
);

mcq(
  DIV,
  `If $y$ varies inversely with $x$ and $x$ is halved, then $y$ is\n\n`,
  ["halved", "doubled", "quartered", "tripled"],
  "B",
  "EASY",
  "**Answer: B**\n\n$y = \\dfrac{k}{x}$ — halving $x$ doubles $y$.",
);

mcq(
  DIV,
  `${img(inverseGraphSvg)}\n\nThe graph shown represents $y$ varying inversely with $x$. The equation of the curve is\n\n`,
  ["$y = 12x$", "$y = \\dfrac{12}{x}$", "$y = \\dfrac{x}{12}$", "$y = 12 - x$"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nAt the marked point $(2, 6)$: $xy = 2 \\times 6 = 12$. Check $(6, 2)$: $xy = 12$ ✓. Hence $y = \\dfrac{12}{x}$.",
);

mcq(
  DIV,
  `If $y \\propto x^2$ and $y = 50$ when $x = 5$, then when $x = 10$, $y$ equals\n\n`,
  ["$100$", "$150$", "$200$", "$500$"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\n$y = kx^2$ ⇒ $50 = k(25)$, so $k = 2$. At $x = 10$: $y = 2(100) = 200$.",
);

mcq(
  DIV,
  `If $y \\propto \\dfrac{1}{x^2}$ and $y = 8$ when $x = 2$, then when $x = 4$, $y$ equals\n\n`,
  ["$1$", "$2$", "$4$", "$32$"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$y = \\dfrac{k}{x^2}$ ⇒ $8 = \\dfrac{k}{4}$, so $k = 32$. At $x = 4$: $y = \\dfrac{32}{16} = 2$.",
);

// ─── SHORT_ANSWER (4) ──────────────────────────────────────────────────

short(
  DIV,
  `$y$ varies directly with $x$, and $y = 35$ when $x = 7$.\n\n**a.** Find the constant of proportionality. (1 mark)\n\n**b.** Find $y$ when $x = 12$. (1 mark)\n\n**c.** Find $x$ when $y = 60$. (1 mark) (3 marks)`,
  3,
  "EASY",
  "**a.** $y = kx \\Rightarrow 35 = 7k \\Rightarrow k = 5$. (1 mark)\n\n**b.** $y = 5(12) = 60$. (1 mark)\n\n**c.** $60 = 5x \\Rightarrow x = 12$. (1 mark)",
);

short(
  DIV,
  `$y$ varies inversely with $x$, and $y = 15$ when $x = 4$.\n\n**a.** Find the constant of proportionality. (1 mark)\n\n**b.** Find $y$ when $x = 10$. (2 marks) (3 marks)`,
  3,
  "EASY",
  "**a.** $y = \\dfrac{k}{x} \\Rightarrow 15 = \\dfrac{k}{4} \\Rightarrow k = 60$. (1 mark)\n\n**b.** $y = \\dfrac{60}{10} = 6$. (2 marks)",
);

short(
  DIV,
  `The volume $V$ of a gas at constant temperature varies inversely with its pressure $P$. When $P = 200$ kPa, $V = 5$ L.\n\n**a.** Write a formula for $V$ in terms of $P$. (2 marks)\n\n**b.** Find $V$ when $P = 500$ kPa. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** $V = \\dfrac{k}{P}$, with $5 = \\dfrac{k}{200} \\Rightarrow k = 1000$. **Formula: $V = \\dfrac{1000}{P}$.** (2 marks)\n\n**b.** $V = \\dfrac{1000}{500} = 2$ L. (2 marks)",
);

short(
  DIV,
  `The distance $d$ travelled by a falling object varies directly with the square of the time $t$. If $d = 80$ m when $t = 4$ s, find:\n\n**a.** The formula for $d$ in terms of $t$. (2 marks)\n\n**b.** $d$ when $t = 6$ s. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** $d = kt^2 \\Rightarrow 80 = k(16) \\Rightarrow k = 5$. **Formula: $d = 5t^2$.** (2 marks)\n\n**b.** $d = 5(36) = 180$ m. (2 marks)",
);

// ─── EXTENDED_ANSWER (2) ───────────────────────────────────────────────

extAns(
  DIV,
  [
    {
      label: "a",
      marks: 2,
      content: `$y$ varies directly with $x$. When $x = 8$, $y = 36$. Find the constant of proportionality and write the equation relating $y$ and $x$.`,
      solution:
        "$y = kx \\Rightarrow 36 = 8k \\Rightarrow k = 4.5$. **Equation: $y = 4.5x$.** (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `Use the equation from part **a** to find $y$ when $x = 14$, and find $x$ when $y = 27$.`,
      solution:
        "$y = 4.5(14) = 63$. (1 mark)\n\n$27 = 4.5x \\Rightarrow x = 6$. (1 mark)",
    },
    {
      label: "c",
      marks: 2,
      content: `If $x$ is tripled from $4$ to $12$, by what factor does $y$ change? Verify by computing both values of $y$.`,
      solution:
        "Direct variation ⇒ tripling $x$ triples $y$. (1 mark)\n\nVerify: $x = 4$ gives $y = 18$; $x = 12$ gives $y = 54$. $54 \\div 18 = 3$ ✓. (1 mark)",
    },
  ],
  "EASY",
);

extAns(
  DIV,
  [
    {
      label: "a",
      marks: 2,
      content: `The intensity $I$ of light varies inversely with the square of the distance $d$ from its source. At $d = 2$ m, $I = 50$ lux. Find the constant and write the equation.`,
      solution:
        "$I = \\dfrac{k}{d^2} \\Rightarrow 50 = \\dfrac{k}{4} \\Rightarrow k = 200$.\n\n**Equation: $I = \\dfrac{200}{d^2}$.** (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `Find $I$ when $d = 5$ m.`,
      solution: "$I = \\dfrac{200}{25} = 8$ lux. (2 marks)",
    },
    {
      label: "c",
      marks: 2,
      content: `Find $d$ when $I = 2$ lux.`,
      solution:
        "$2 = \\dfrac{200}{d^2} \\Rightarrow d^2 = 100 \\Rightarrow d = 10$ m (positive root). (2 marks)",
    },
    {
      label: "d",
      marks: 1,
      content: `If the distance from the light source is doubled, by what factor does the intensity change?`,
      solution:
        "$I \\propto \\dfrac{1}{d^2}$ — doubling $d$ multiplies $I$ by $\\dfrac{1}{4}$ (i.e. intensity is quartered). (1 mark)",
    },
  ],
  "MEDIUM",
);

// ─── EXTENDED_RESPONSE (2) ─────────────────────────────────────────────

extResp(
  DIV,
  [
    {
      label: "a",
      marks: 2,
      content: `The wages $W$ earned by a worker vary directly with the hours $h$ worked. A worker is paid \\$140 for $8$ hours of work. Find the constant of proportionality and write the formula for $W$ in terms of $h$.`,
      solution:
        "$W = kh \\Rightarrow 140 = 8k \\Rightarrow k = 17.5$.\n\n**Formula: $W = 17.5h$** (i.e. \\$17.50/hour). (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `How much does the worker earn for working $12.5$ hours?`,
      solution: "$W = 17.5 \\times 12.5 = \\$218.75$. (2 marks)",
    },
    {
      label: "c",
      marks: 2,
      content: `If the worker wants to earn at least \\$280, how many hours must they work?`,
      solution:
        "$17.5h \\ge 280 \\Rightarrow h \\ge 16$.\n\nThe worker must work **at least 16 hours**. (2 marks)",
    },
    {
      label: "d",
      marks: 3,
      content: `A second worker is paid under a different scheme where wages vary inversely with the number of co-workers $n$ sharing a fixed weekly pool of \\$1200 (i.e. $W = \\dfrac{1200}{n}$). Compare the wages of the two workers when (i) $n = 4$, and (ii) the first worker works exactly $8$ hours. Which pays more in this case?`,
      solution:
        "(i) Second worker's wages with $n = 4$: $W_2 = \\dfrac{1200}{4} = \\$300$. (1 mark)\n\n(ii) First worker at $8$ hours: $W_1 = 17.5 \\times 8 = \\$140$. (1 mark)\n\n**The second worker earns more** under these conditions (\\$300 > \\$140). (1 mark)",
    },
  ],
  "MEDIUM",
  `**Question — Direct and inverse variation in pay schemes**\n\nA worker earns wages $W$ that vary directly with the hours $h$ worked. Another worker is paid inversely with the number of co-workers sharing a fixed pool. We compare the two schemes.`,
);

extResp(
  DIV,
  [
    {
      label: "a",
      marks: 2,
      content: `Boyle's Law states that for a gas at constant temperature, pressure $P$ varies inversely with volume $V$. A balloon contains gas at $P = 100$ kPa and $V = 4$ L. Find the constant $k$ and the formula relating $P$ and $V$.`,
      solution:
        "$P = \\dfrac{k}{V} \\Rightarrow 100 = \\dfrac{k}{4} \\Rightarrow k = 400$.\n\n**Formula: $P = \\dfrac{400}{V}$.** (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `Find $P$ when $V = 2.5$ L.`,
      solution: "$P = \\dfrac{400}{2.5} = 160$ kPa. (2 marks)",
    },
    {
      label: "c",
      marks: 2,
      content: `Find $V$ when $P = 250$ kPa.`,
      solution: "$250 = \\dfrac{400}{V} \\Rightarrow V = \\dfrac{400}{250} = 1.6$ L. (2 marks)",
    },
    {
      label: "d",
      marks: 3,
      content: `By what factor does the pressure change if the volume is reduced to one-quarter of its original value?`,
      solution:
        "$P \\propto \\dfrac{1}{V}$. If $V$ is multiplied by $\\dfrac{1}{4}$, then $P$ is multiplied by $4$.\n\n**Pressure is quadrupled** (becomes $4 \\times$ original). (3 marks)",
    },
    {
      label: "e",
      marks: 3,
      content: `A second gas obeys $P = \\dfrac{600}{V^2}$. At what volume do the two gases have equal pressure? (Show working.)`,
      solution:
        "Set $\\dfrac{400}{V} = \\dfrac{600}{V^2}$. (1 mark)\n\nCross-multiply: $400 V^2 = 600 V$, so $V^2 = 1.5 V$, giving $V = 1.5$ L (rejecting $V = 0$). (2 marks)",
    },
  ],
  "HARD",
  `**Question — Boyle's Law and inverse variation**\n\nA gas at constant temperature obeys Boyle's Law: pressure $P$ varies inversely with volume $V$. This question uses two different gases and compares their pressure–volume relationships.`,
);

// ════════════════════════════════════════════════════════════════════════
// SUBTOPIC 4 — Joint variation (extended-fit, 17 items)
// ════════════════════════════════════════════════════════════════════════

const JV = "joint-variation";

// ─── MCQ (9) ──────────────────────────────────────────────────────────

mcq(
  JV,
  `If $z$ varies jointly with $x$ and $y$ and $z = 24$ when $x = 2$, $y = 3$, the constant $k$ is\n\n`,
  ["$1$", "$2$", "$4$", "$6$"],
  "C",
  "EASY",
  "**Answer: C**\n\n$z = kxy \\Rightarrow 24 = k(2)(3) = 6k \\Rightarrow k = 4$.",
);

mcq(
  JV,
  `If $z = kxy$ and $z = 60$ when $x = 5$, $y = 4$, then when $x = 6$, $y = 2$, $z$ equals\n\n`,
  ["$24$", "$36$", "$48$", "$72$"],
  "B",
  "EASY",
  "**Answer: B**\n\n$k = \\dfrac{60}{5 \\times 4} = 3$. So $z = 3 \\times 6 \\times 2 = 36$.",
);

mcq(
  JV,
  `If $z$ varies jointly with $x$ and $y$, and $x$ is doubled while $y$ is halved, then $z$ is\n\n`,
  ["unchanged", "doubled", "halved", "quartered"],
  "A",
  "EASY",
  "**Answer: A**\n\n$z = kxy$. New $z = k(2x)(y/2) = kxy$ — unchanged.",
);

mcq(
  JV,
  `If $z$ varies directly with $x$ and inversely with $y$, and $z = 10$ when $x = 4$, $y = 2$, the constant $k$ is\n\n`,
  ["$1$", "$2.5$", "$5$", "$20$"],
  "C",
  "EASY",
  "**Answer: C**\n\n$z = \\dfrac{kx}{y} \\Rightarrow 10 = \\dfrac{4k}{2} = 2k \\Rightarrow k = 5$.",
);

mcq(
  JV,
  `If $z = \\dfrac{kx}{y}$ with $k = 6$, then when $x = 8$, $y = 4$, $z$ equals\n\n`,
  ["$3$", "$12$", "$24$", "$48$"],
  "B",
  "EASY",
  "**Answer: B**\n\n$z = \\dfrac{6 \\times 8}{4} = 12$.",
);

mcq(
  JV,
  `The force $F$ between two objects varies jointly with their masses $m_1$ and $m_2$. If $F = 24$ N when $m_1 = 3$ kg and $m_2 = 4$ kg, then $F$ when $m_1 = 5$ kg and $m_2 = 6$ kg is\n\n`,
  ["$30$", "$45$", "$60$", "$90$"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\n$k = \\dfrac{24}{3 \\times 4} = 2$. So $F = 2 \\times 5 \\times 6 = 60$ N.",
);

mcq(
  JV,
  `If $z$ varies directly with $x^2$ and inversely with $y$, and $z = 18$ when $x = 3$, $y = 2$, the constant $k$ is\n\n`,
  ["$2$", "$4$", "$6$", "$12$"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$z = \\dfrac{kx^2}{y} \\Rightarrow 18 = \\dfrac{9k}{2} \\Rightarrow k = 4$.",
);

mcq(
  JV,
  `If $w$ varies jointly with $x$ and $y$ and inversely with $z$, and $x$ is doubled, $y$ is tripled, and $z$ is halved, then $w$ becomes\n\n`,
  ["$3$ times original", "$6$ times original", "$12$ times original", "$1.5$ times original"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\n$w = \\dfrac{kxy}{z}$. New $w = \\dfrac{k(2x)(3y)}{z/2} = \\dfrac{6kxy}{z/2} = 12 \\cdot \\dfrac{kxy}{z} = 12w$.",
);

mcq(
  JV,
  `The kinetic energy $E$ of a moving object varies jointly with its mass $m$ and the square of its speed $v$. If $E = 100$ J when $m = 2$ kg and $v = 10$ m/s, the constant $k$ in $E = kmv^2$ is\n\n`,
  ["$0.5$", "$1$", "$2$", "$5$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\n$100 = k(2)(100) = 200k \\Rightarrow k = 0.5$. (Aligns with $E = \\tfrac{1}{2} m v^2$.)",
);

// ─── SHORT_ANSWER (4) ──────────────────────────────────────────────────

short(
  JV,
  `$z$ varies jointly with $x$ and $y$. When $x = 2$ and $y = 5$, $z = 30$.\n\n**a.** Find the constant of proportionality. (1 mark)\n\n**b.** Find $z$ when $x = 4$ and $y = 7$. (2 marks) (3 marks)`,
  3,
  "EASY",
  "**a.** $z = kxy \\Rightarrow 30 = k(2)(5) = 10k \\Rightarrow k = 3$. (1 mark)\n\n**b.** $z = 3(4)(7) = 84$. (2 marks)",
);

short(
  JV,
  `$z$ varies directly with $x$ and inversely with $y$. When $x = 6$, $y = 3$, $z = 8$.\n\n**a.** Find the constant. (2 marks)\n\n**b.** Find $z$ when $x = 9$, $y = 4$. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** $z = \\dfrac{kx}{y} \\Rightarrow 8 = \\dfrac{6k}{3} = 2k \\Rightarrow k = 4$. (2 marks)\n\n**b.** $z = \\dfrac{4(9)}{4} = 9$. (2 marks)",
);

short(
  JV,
  `The volume $V$ of a cylinder varies jointly with the square of its radius $r$ and its height $h$. A cylinder with $r = 3$ cm and $h = 10$ cm has $V = 90\\pi$ cm³.\n\n**a.** Find the constant of proportionality (it should be $\\pi$). (2 marks)\n\n**b.** Find $V$ when $r = 4$ cm and $h = 5$ cm. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** $V = kr^2 h \\Rightarrow 90\\pi = k(9)(10) = 90k \\Rightarrow k = \\pi$. (Confirms standard formula $V = \\pi r^2 h$.) (2 marks)\n\n**b.** $V = \\pi(16)(5) = 80\\pi$ cm³. (2 marks)",
);

short(
  JV,
  `The cost $C$ of building a fence varies jointly with the length $\\ell$ and the height $h$ of the fence. A fence of length $20$ m and height $1.5$ m costs \\$1200.\n\n**a.** Find the constant of proportionality. (2 marks)\n\n**b.** Find the cost of a fence of length $30$ m and height $2$ m. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** $C = k \\ell h \\Rightarrow 1200 = k(20)(1.5) = 30k \\Rightarrow k = 40$. **\\$40 per m·m.** (2 marks)\n\n**b.** $C = 40 \\times 30 \\times 2 = \\$2400$. (2 marks)",
);

// ─── EXTENDED_ANSWER (2) ───────────────────────────────────────────────

extAns(
  JV,
  [
    {
      label: "a",
      marks: 2,
      content: `$z$ varies jointly with $x$ and $y$. When $x = 4$ and $y = 6$, $z = 48$. Find the constant of proportionality and write the equation.`,
      solution: "$z = kxy \\Rightarrow 48 = 24k \\Rightarrow k = 2$. **Equation: $z = 2xy$.** (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `Find $z$ when $x = 5$ and $y = 7$, and find $x$ when $y = 3$ and $z = 36$.`,
      solution:
        "$z = 2(5)(7) = 70$. (1 mark)\n\n$36 = 2x(3) = 6x \\Rightarrow x = 6$. (1 mark)",
    },
    {
      label: "c",
      marks: 2,
      content: `If both $x$ and $y$ are doubled, by what factor does $z$ change? Verify numerically.`,
      solution:
        "$z = kxy$. New $z = k(2x)(2y) = 4kxy = 4z$. (1 mark)\n\nVerify: at $x = 4, y = 6$, $z = 48$. At $x = 8, y = 12$, $z = 2(8)(12) = 192 = 48 \\times 4$ ✓. (1 mark)",
    },
  ],
  "EASY",
);

extAns(
  JV,
  [
    {
      label: "a",
      marks: 2,
      content: `The force $F$ of attraction between two charged particles varies jointly with their charges $q_1$ and $q_2$ and inversely with the square of the distance $r$ between them. Write a general formula and identify the constant of proportionality symbol.`,
      solution:
        "$F = \\dfrac{k q_1 q_2}{r^2}$, where $k$ is Coulomb's constant. (2 marks)",
    },
    {
      label: "b",
      marks: 3,
      content: `If $F = 18$ N when $q_1 = 2$, $q_2 = 3$ and $r = 1$ m, find $k$.`,
      solution:
        "$18 = \\dfrac{k(2)(3)}{1^2} = 6k \\Rightarrow k = 3$. (3 marks)",
    },
    {
      label: "c",
      marks: 2,
      content: `Using the value of $k$ from part **b**, find $F$ when $q_1 = 4$, $q_2 = 5$, $r = 2$ m.`,
      solution:
        "$F = \\dfrac{3(4)(5)}{4} = \\dfrac{60}{4} = 15$ N. (2 marks)",
    },
  ],
  "MEDIUM",
);

// ─── EXTENDED_RESPONSE (2) ─────────────────────────────────────────────

extResp(
  JV,
  [
    {
      label: "a",
      marks: 2,
      content: `The cost $C$ to manufacture a metal box varies jointly with the surface area $S$ and the thickness $t$ of the metal. A box with $S = 0.6$ m² and $t = 2$ mm costs \\$24.\n\nFind the constant of proportionality and write the formula.`,
      solution:
        "$C = k S t \\Rightarrow 24 = k(0.6)(2) = 1.2k \\Rightarrow k = 20$.\n\n**Formula: $C = 20 St$** (with $S$ in m² and $t$ in mm). (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the cost of a box with surface area $1.2$ m² and thickness $3$ mm.`,
      solution: "$C = 20 \\times 1.2 \\times 3 = \\$72$. (2 marks)",
    },
    {
      label: "c",
      marks: 2,
      content: `If the manufacturer wants the cost to remain at \\$24 but the surface area increases to $1.0$ m², what thickness should be used?`,
      solution:
        "$24 = 20 \\times 1.0 \\times t \\Rightarrow t = 1.2$ mm. (2 marks)",
    },
    {
      label: "d",
      marks: 3,
      content: `By what factor does the cost change if both surface area and thickness are tripled?`,
      solution:
        "$C \\propto St$. Tripling both ⇒ new $C = k(3S)(3t) = 9kSt$.\n\n**Cost increases by a factor of 9.** Verify: original $\\$24 \\to 9 \\times 24 = \\$216$. (3 marks)",
    },
    {
      label: "e",
      marks: 2,
      content: `A second model varies $C$ jointly with $S^2$ and $t$. Under the same data ($S = 0.6$, $t = 2$, $C = \\$24$), find this model's constant.`,
      solution:
        "$C = k' S^2 t \\Rightarrow 24 = k'(0.36)(2) = 0.72 k' \\Rightarrow k' = \\dfrac{24}{0.72} \\approx 33.33$. (2 marks)",
    },
  ],
  "MEDIUM",
  `**Question — Joint variation in manufacturing**\n\nThe cost $C$ to manufacture a metal box varies jointly with its surface area $S$ (in m²) and the thickness $t$ (in mm) of the metal. We compare two costing models against measured data.`,
);

extResp(
  JV,
  [
    {
      label: "a",
      marks: 2,
      content: `The resistance $R$ of a wire varies directly with its length $L$ and inversely with the cross-sectional area $A$. A wire of length $4$ m and cross-section $0.5$ mm² has resistance $0.4$ Ω. Find $k$ and the formula.`,
      solution:
        "$R = \\dfrac{kL}{A} \\Rightarrow 0.4 = \\dfrac{4k}{0.5} = 8k \\Rightarrow k = 0.05$.\n\n**Formula: $R = \\dfrac{0.05 L}{A}$** (with $L$ in m, $A$ in mm²). (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `Find $R$ for a wire of length $10$ m and cross-section $2$ mm².`,
      solution: "$R = \\dfrac{0.05 \\times 10}{2} = 0.25$ Ω. (2 marks)",
    },
    {
      label: "c",
      marks: 2,
      content: `If the length is tripled and the cross-section is doubled, by what factor does the resistance change?`,
      solution:
        "New $R = \\dfrac{k(3L)}{2A} = \\dfrac{3}{2} \\cdot \\dfrac{kL}{A} = 1.5 R$.\n\n**Resistance increases by a factor of $1.5$.** (2 marks)",
    },
    {
      label: "d",
      marks: 3,
      content: `For a fixed cross-section of $0.5$ mm², plot or describe the relationship $R(L)$. What kind of function is this — direct, inverse, or neither? Justify.`,
      solution:
        "With $A = 0.5$ fixed: $R = \\dfrac{0.05 L}{0.5} = 0.1 L$.\n\nThis is a **direct linear relationship** between $R$ and $L$ ($R \\propto L$). Graph is a straight line through the origin with slope $0.1$. (3 marks)",
    },
    {
      label: "e",
      marks: 2,
      content: `For a fixed length of $4$ m, find the cross-section $A$ that gives a resistance of $0.1$ Ω.`,
      solution:
        "$0.1 = \\dfrac{0.05 \\times 4}{A} = \\dfrac{0.2}{A} \\Rightarrow A = 2$ mm². (2 marks)",
    },
  ],
  "HARD",
  `**Question — Resistance of a wire**\n\nThe resistance $R$ of a wire varies directly with its length $L$ and inversely with its cross-sectional area $A$. We model and analyse this joint variation.`,
);

// ════════════════════════════════════════════════════════════════════════
// SUBTOPIC 5 — Piecewise-linear functions (extended-fit, 17 items)
// ════════════════════════════════════════════════════════════════════════

const PWL = "piecewise-linear-functions";

// Shared diagrams
// Pay rate piecewise: standard rate $20/hr up to 40 hrs, overtime $30/hr beyond
const payScalePiecewise = (h: number) => (h <= 40 ? 20 * h : 800 + 30 * (h - 40));
const payScaleSvg = functionPlot({
  fn: payScalePiecewise,
  xRange: [0, 60],
  yRange: [0, 1500],
  xTicks: [10, 20, 30, 40, 50, 60],
  yTicks: [200, 400, 600, 800, 1000, 1200, 1400],
  color: "#dc2626",
  xLabel: "hours (h)",
  yLabel: "pay ($)",
  markedPoints: [{ x: 40, label: "(40, 800)" }],
});

// Tax bracket function (simplified)
const taxBracket = (i: number) => {
  if (i <= 20000) return 0;
  if (i <= 50000) return 0.15 * (i - 20000);
  return 4500 + 0.30 * (i - 50000);
};

// ─── MCQ (9) ──────────────────────────────────────────────────────────

mcq(
  PWL,
  `For the piecewise function $f(x) = \\begin{cases} 2x + 1, & x < 3 \\\\ x + 5, & x \\ge 3 \\end{cases}$, the value of $f(3)$ is\n\n`,
  ["$5$", "$7$", "$8$", "undefined"],
  "C",
  "EASY",
  "**Answer: C**\n\nFor $x \\ge 3$ we use the second branch: $f(3) = 3 + 5 = 8$.",
);

mcq(
  PWL,
  `For the same function as above, $f(0)$ equals\n\n`,
  ["$1$", "$5$", "$7$", "$-1$"],
  "A",
  "EASY",
  "**Answer: A**\n\nFor $x < 3$ we use the first branch: $f(0) = 2(0) + 1 = 1$.",
);

mcq(
  PWL,
  `${img(payScaleSvg)}\n\nAn employee is paid \\$20 per hour for the first 40 hours, then \\$30 per hour overtime. For working $50$ hours total, the pay is\n\n`,
  ["\\$800", "\\$1000", "\\$1100", "\\$1500"],
  "C",
  "EASY",
  "**Answer: C**\n\nFirst 40 hours: $40 \\times \\$20 = \\$800$. Overtime $10$ hours: $10 \\times \\$30 = \\$300$. Total: \\$1100.",
);

mcq(
  PWL,
  `${img(payScaleSvg)}\n\nUsing the same pay scale (standard \\$20/hr up to 40 hrs, then \\$30/hr), what hours are required to earn exactly \\$1250?\n\n`,
  ["$45$", "$55$", "$57$", "$62.5$"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nStandard 40 hours give \\$800. Additional \\$450 needed at \\$30/hr ⇒ $\\dfrac{450}{30} = 15$ hours. Total = $40 + 15 = 55$ hours.",
);

mcq(
  PWL,
  `The piecewise function $g(x) = \\begin{cases} -x, & x \\le 0 \\\\ x, & x > 0 \\end{cases}$ describes the\n\n`,
  ["absolute value function", "identity function", "reciprocal function", "step function"],
  "A",
  "EASY",
  "**Answer: A**\n\nThis is $g(x) = |x|$. Negative $x$ maps to $-x$ (positive); positive $x$ stays the same.",
);

mcq(
  PWL,
  `An electricity tariff charges \\$0.30/kWh for the first $200$ kWh and \\$0.45/kWh after. The bill for $350$ kWh is\n\n`,
  ["\\$105.00", "\\$120.00", "\\$127.50", "\\$157.50"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nFirst 200 kWh: $200 \\times \\$0.30 = \\$60$. Remaining 150 kWh: $150 \\times \\$0.45 = \\$67.50$. Total = \\$127.50.",
);

mcq(
  PWL,
  `For $f(x) = \\begin{cases} x + 4, & x \\le -1 \\\\ -2x + 1, & -1 < x \\le 3 \\\\ x - 5, & x > 3 \\end{cases}$, the value of $f(-1) + f(2) + f(5)$ equals\n\n`,
  ["$0$", "$2$", "$3$", "$6$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\n$f(-1) = -1 + 4 = 3$ (first branch, $x \\le -1$).\n\n$f(2) = -2(2) + 1 = -3$ (second branch, $-1 < x \\le 3$).\n\n$f(5) = 5 - 5 = 0$ (third branch, $x > 3$).\n\nSum: $3 + (-3) + 0 = 0$.",
);

mcq(
  PWL,
  `${img(payScaleSvg)}\n\nThe gradient of the second piece of the pay-scale function (for hours beyond 40) represents\n\n`,
  [
    "the standard hourly rate",
    "the total weekly pay",
    "the overtime hourly rate (\\$30/hr)",
    "the total overtime pay",
  ],
  "C",
  "EASY",
  "**Answer: C**\n\nThe gradient of a line in this context is dollars per hour — for hours beyond 40, the gradient is the overtime rate of \\$30/hr.",
);

mcq(
  PWL,
  `For the simplified tax function $T(i) = \\begin{cases} 0, & i \\le 20{,}000 \\\\ 0.15(i - 20{,}000), & 20{,}000 < i \\le 50{,}000 \\\\ 4{,}500 + 0.30(i - 50{,}000), & i > 50{,}000 \\end{cases}$, the tax on an income of \\$60{,}000 is\n\n`,
  ["\\$3,000", "\\$6,000", "\\$7,500", "\\$13,500"],
  "C",
  "HARD",
  "**Answer: C**\n\nIncome \\$60,000 falls in the third bracket: $T = 4{,}500 + 0.30(60{,}000 - 50{,}000) = 4{,}500 + 3{,}000 = \\$7{,}500$.",
);

// ─── SHORT_ANSWER (4) ──────────────────────────────────────────────────

short(
  PWL,
  `Consider the piecewise-linear function $f(x) = \\begin{cases} 3x - 2, & x < 1 \\\\ -x + 4, & x \\ge 1 \\end{cases}$\n\n**a.** Find $f(0)$. (1 mark)\n\n**b.** Find $f(1)$. (1 mark)\n\n**c.** Find $f(3)$. (1 mark) (3 marks)`,
  3,
  "EASY",
  "**a.** $x = 0 < 1$ ⇒ first branch: $f(0) = 3(0) - 2 = -2$. (1 mark)\n\n**b.** $x = 1 \\ge 1$ ⇒ second branch: $f(1) = -1 + 4 = 3$. (1 mark)\n\n**c.** $x = 3 \\ge 1$ ⇒ second branch: $f(3) = -3 + 4 = 1$. (1 mark)",
);

short(
  PWL,
  `A delivery courier charges \\$8 for the first $5$ km, and an additional \\$1.20 per km beyond $5$ km.\n\n**a.** Write a piecewise-linear function $C(d)$ for the cost in dollars when $d$ is the distance in km. (2 marks)\n\n**b.** Find $C(3)$ and $C(12)$. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** $C(d) = \\begin{cases} 8, & 0 \\le d \\le 5 \\\\ 8 + 1.20(d - 5), & d > 5 \\end{cases}$ (2 marks)\n\n**b.** $C(3) = \\$8$ (flat fee). $C(12) = 8 + 1.20(7) = 8 + 8.40 = \\$16.40$. (2 marks)",
);

short(
  PWL,
  `An electrician charges a call-out fee of \\$80 plus an hourly rate of \\$60 for the first $2$ hours, and \\$45 per hour after that.\n\n**a.** Write a piecewise-linear cost function $C(h)$ for $h$ hours of work. (2 marks)\n\n**b.** Compute the total cost for a $5$-hour job. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** $C(h) = \\begin{cases} 80 + 60h, & 0 < h \\le 2 \\\\ 200 + 45(h - 2), & h > 2 \\end{cases}$ (2 marks)\n\n**b.** $h = 5 > 2$: $C(5) = 200 + 45(3) = 200 + 135 = \\$335$. (2 marks)",
);

short(
  PWL,
  `A parking garage charges \\$3 for the first hour, then \\$2 per additional hour up to $4$ hours, then a flat \\$15 for $4$ to $24$ hours.\n\n**a.** Write the piecewise function $P(t)$ for $t$ hours parked, $0 < t \\le 24$. (3 marks)\n\n**b.** Compute $P(3)$ and $P(8)$. (1 mark) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** $P(t) = \\begin{cases} 3, & 0 < t \\le 1 \\\\ 3 + 2(t - 1), & 1 < t \\le 4 \\\\ 15, & 4 < t \\le 24 \\end{cases}$ (3 marks)\n\n**b.** $P(3) = 3 + 2(2) = \\$7$. $P(8) = \\$15$. (1 mark)",
);

// ─── EXTENDED_ANSWER (2) ───────────────────────────────────────────────

extAns(
  PWL,
  [
    {
      label: "a",
      marks: 2,
      content: `An employee earns \\$25/hr for the first $35$ hours and \\$40/hr (time-and-a-half overtime) thereafter, capped at $50$ total hours per week. Write the piecewise pay function $W(h)$.\n\n${img(payScaleSvg)}\n\n(Diagram for illustration; values differ.)`,
      solution:
        "$W(h) = \\begin{cases} 25h, & 0 \\le h \\le 35 \\\\ 875 + 40(h - 35), & 35 < h \\le 50 \\end{cases}$ (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `Compute the weekly pay for working $30$, $40$, and $50$ hours.`,
      solution:
        "$W(30) = 25 \\times 30 = \\$750$. (1 mark)\n\n$W(40) = 875 + 40(5) = 875 + 200 = \\$1075$. $W(50) = 875 + 40(15) = 875 + 600 = \\$1475$. (1 mark)",
    },
    {
      label: "c",
      marks: 2,
      content: `How many hours must the employee work to earn at least \\$1200?`,
      solution:
        "At $h = 35$: pay = \\$875 (< \\$1200). So need $875 + 40(h - 35) \\ge 1200$.\n\n$40(h - 35) \\ge 325 \\Rightarrow h - 35 \\ge 8.125 \\Rightarrow h \\ge 43.125$ hours.\n\n**Must work at least 43.125 hours** (or 44 hours in whole hours). (2 marks)",
    },
  ],
  "MEDIUM",
);

extAns(
  PWL,
  [
    {
      label: "a",
      marks: 2,
      content: `The simplified tax function for annual income $i$ is $T(i) = \\begin{cases} 0, & i \\le 20{,}000 \\\\ 0.15(i - 20{,}000), & 20{,}000 < i \\le 50{,}000 \\\\ 4{,}500 + 0.30(i - 50{,}000), & i > 50{,}000 \\end{cases}$\n\nFind $T(15{,}000)$, $T(35{,}000)$, and $T(80{,}000)$.`,
      solution:
        "$T(15{,}000) = \\$0$. (1 mark)\n\n$T(35{,}000) = 0.15 \\times 15{,}000 = \\$2{,}250$. $T(80{,}000) = 4{,}500 + 0.30 \\times 30{,}000 = 4{,}500 + 9{,}000 = \\$13{,}500$. (1 mark)",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the income $i$ for which the tax payable is exactly \\$6,000.`,
      solution:
        "$\\$6{,}000 > \\$4{,}500$, so use bracket 3: $4{,}500 + 0.30(i - 50{,}000) = 6{,}000$. $0.30(i - 50{,}000) = 1{,}500$, so $i - 50{,}000 = 5{,}000$, giving $i = \\$55{,}000$. (2 marks)",
    },
    {
      label: "c",
      marks: 2,
      content: `Verify that $T$ is continuous at the bracket boundary $i = 50{,}000$ — i.e. the two pieces give the same value at $i = 50{,}000$.`,
      solution:
        "Bracket 2 at $i = 50{,}000$: $0.15(50{,}000 - 20{,}000) = 0.15 \\times 30{,}000 = \\$4{,}500$.\n\nBracket 3 at $i = 50{,}000$: $4{,}500 + 0.30(0) = \\$4{,}500$.\n\nBoth match ⇒ **continuous** at $i = 50{,}000$. (2 marks)",
    },
  ],
  "MEDIUM",
);

// ─── EXTENDED_RESPONSE (2) ─────────────────────────────────────────────

extResp(
  PWL,
  [
    {
      label: "a",
      marks: 2,
      content: `${img(payScaleSvg)}\n\nThe pay-scale graph shows weekly pay against hours worked. Identify the hourly rate in each piece (i.e. for $0 \\le h \\le 40$ and for $h > 40$).`,
      solution:
        "First piece (0 ≤ h ≤ 40): gradient = $\\dfrac{800}{40} = \\$20$/hour.\n\nSecond piece (h > 40): gradient = $\\dfrac{1400 - 800}{60 - 40} = \\dfrac{600}{20} = \\$30$/hour. (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `Write the piecewise function $W(h)$ for the weekly pay in terms of hours $h$.`,
      solution:
        "$W(h) = \\begin{cases} 20h, & 0 \\le h \\le 40 \\\\ 800 + 30(h - 40), & h > 40 \\end{cases}$ (2 marks)",
    },
    {
      label: "c",
      marks: 2,
      content: `Calculate the pay for working $35$ hours and $50$ hours.`,
      solution:
        "$W(35) = 20 \\times 35 = \\$700$. (1 mark)\n\n$W(50) = 800 + 30(10) = \\$1100$. (1 mark)",
    },
    {
      label: "d",
      marks: 3,
      content: `Determine the number of hours required to earn exactly \\$1400.`,
      solution:
        "Check $h = 40$: \\$800 < \\$1400. So use second piece: $800 + 30(h - 40) = 1400$.\n\n$30(h - 40) = 600 \\Rightarrow h - 40 = 20 \\Rightarrow h = 60$ hours. (3 marks)",
    },
    {
      label: "e",
      marks: 2,
      content: `Sketch how the weekly pay $W$ changes with hours, and explain in words why the graph is steeper after $40$ hours.`,
      solution:
        "Description: the graph rises linearly from the origin with slope $20$ to $(40, 800)$, then rises more steeply with slope $30$ from $(40, 800)$ onward.\n\nThe second piece is steeper because the overtime hourly rate (\\$30/hr) is higher than the standard rate (\\$20/hr). For every extra hour after 40, pay increases by \\$30 instead of \\$20. (2 marks)",
    },
  ],
  "MEDIUM",
  `**Question — Piecewise-linear pay scale**\n\nA local employee is paid \\$20 per hour for the first 40 hours each week, with overtime paid at \\$30 per hour beyond that. The graph shows weekly pay $W$ as a function of hours $h$ worked.`,
);

extResp(
  PWL,
  [
    {
      label: "a",
      marks: 2,
      content: `An electricity provider has the tariff: \\$0.25/kWh for the first $400$ kWh per quarter, then \\$0.40/kWh thereafter. Write the piecewise cost function $C(u)$ for usage $u$ kWh.`,
      solution:
        "$C(u) = \\begin{cases} 0.25u, & 0 \\le u \\le 400 \\\\ 100 + 0.40(u - 400), & u > 400 \\end{cases}$ (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `Compute the bill for using $250$ kWh, $400$ kWh, and $600$ kWh in a quarter.`,
      solution:
        "$C(250) = 0.25 \\times 250 = \\$62.50$. $C(400) = \\$100$. $C(600) = 100 + 0.40 \\times 200 = 100 + 80 = \\$180$. (2 marks)",
    },
    {
      label: "c",
      marks: 2,
      content: `A household has a budget of \\$160 per quarter for electricity. How many kWh can they use?`,
      solution:
        "At $u = 400$: \\$100 (still within budget). Need $C(u) = 160$ with $u > 400$: $100 + 0.40(u - 400) = 160$.\n\n$0.40(u - 400) = 60 \\Rightarrow u - 400 = 150 \\Rightarrow u = 550$ kWh.\n\n**Maximum usage: $550$ kWh.** (2 marks)",
    },
    {
      label: "d",
      marks: 3,
      content: `The provider proposes a new flat tariff of \\$0.30/kWh for all usage. For what usage levels would this new tariff cost the household *more* than the current piecewise tariff? Set up and solve an equation.`,
      solution:
        "New cost: $C_\\text{new}(u) = 0.30u$.\n\nNew > Old: $0.30u > C(u)$.\n\nFor $u \\le 400$: $0.30u > 0.25u$ iff $0.05u > 0$, i.e. for all $u > 0$. So new is more expensive on the first 400 kWh.\n\nFor $u > 400$: $0.30u > 100 + 0.40(u - 400) = 0.40u - 60$, i.e. $-0.10u > -60$, so $u < 600$. (3 marks)\n\nSo the new tariff is more expensive when $0 < u < 600$ kWh. At $u = 600$ both equal \\$180; beyond that, the old tariff is more expensive.",
    },
    {
      label: "e",
      marks: 2,
      content: `If a household uses exactly $400$ kWh, find both the marginal rate (\\$/kWh) for the next kWh under each tariff scheme. Comment on which is cheaper at the margin.`,
      solution:
        "Marginal old (next kWh after 400): \\$0.40/kWh.\n\nMarginal new: \\$0.30/kWh.\n\n**At the margin (and just past 400 kWh), the new flat tariff is cheaper.** (2 marks)",
    },
  ],
  "HARD",
  `**Question — Electricity tariff comparison**\n\nAn electricity provider offers a tiered tariff: \\$0.25/kWh for the first $400$ kWh per quarter, then \\$0.40/kWh thereafter. A new flat-rate option of \\$0.30/kWh is being considered.`,
);

// ════════════════════════════════════════════════════════════════════════
// SUBTOPIC 6 — Simultaneous linear equations (graphical) (17 items)
// ════════════════════════════════════════════════════════════════════════

const SLE = "simultaneous-linear-equations-graphical";

// Shared diagrams: two intersecting lines y = x + 1 and y = -2x + 7
const sleIntersectSvg = functionPlot({
  fn: (x) => x + 1,
  xRange: [-2, 6],
  yRange: [-3, 8],
  xTicks: [-2, -1, 1, 2, 3, 4, 5, 6],
  yTicks: [-3, -2, -1, 1, 2, 3, 4, 5, 6, 7],
  color: "#dc2626",
  fnLabel: "y = x + 1",
  fnLabelAt: { x: 4, y: 6 },
  additionalFns: [
    {
      fn: (x) => -2 * x + 7,
      color: "#2563eb",
      label: "y = −2x + 7",
      labelAt: { x: -1.5, y: 6 },
    },
  ],
  markedPoints: [{ x: 2, label: "P(2, 3)" }],
});

// Parallel lines (no solution) y = 2x + 1, y = 2x + 4
const sleParallelSvg = functionPlot({
  fn: (x) => 2 * x + 1,
  xRange: [-3, 4],
  yRange: [-4, 10],
  xTicks: [-3, -2, -1, 1, 2, 3, 4],
  yTicks: [-4, -2, 2, 4, 6, 8, 10],
  color: "#dc2626",
  fnLabel: "y = 2x + 1",
  fnLabelAt: { x: 2.5, y: 5 },
  additionalFns: [
    {
      fn: (x) => 2 * x + 4,
      color: "#2563eb",
      label: "y = 2x + 4",
      labelAt: { x: -2.5, y: 1 },
    },
  ],
});

// ─── MCQ (9) ──────────────────────────────────────────────────────────

mcq(
  SLE,
  `${img(sleIntersectSvg)}\n\nThe solution to the simultaneous equations $y = x + 1$ and $y = -2x + 7$ is\n\n`,
  ["$(1, 2)$", "$(2, 3)$", "$(3, 4)$", "$(0, 7)$"],
  "B",
  "EASY",
  "**Answer: B**\n\nThe two lines intersect at the marked point $P(2, 3)$. Check: $3 = 2 + 1$ ✓ and $3 = -2(2) + 7 = 3$ ✓.",
);

mcq(
  SLE,
  `Two lines intersect at the point $(4, -1)$. The lines are\n\n`,
  [
    "$y = x - 5$ and $y = -x + 3$",
    "$y = 2x - 9$ and $y = -x + 5$",
    "$y = x + 5$ and $y = 2x - 9$",
    "$y = -x + 3$ and $y = 2x - 9$",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\nCheck each at $(4, -1)$: $y = 4 - 5 = -1$ ✓ AND $y = -4 + 3 = -1$ ✓. Only option A satisfies both.",
);

mcq(
  SLE,
  `${img(sleParallelSvg)}\n\nThe system $y = 2x + 1$ and $y = 2x + 4$ has\n\n`,
  [
    "exactly one solution",
    "no solutions",
    "infinitely many solutions",
    "exactly two solutions",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nThe two lines have the same gradient ($2$) but different y-intercepts — they are parallel and **never intersect**. Hence no solutions.",
);

mcq(
  SLE,
  `If a system of two linear equations has infinitely many solutions, the two lines must be\n\n`,
  ["parallel and distinct", "perpendicular", "the same line (coincident)", "intersecting at one point"],
  "C",
  "EASY",
  "**Answer: C**\n\nInfinitely many solutions ⇔ every point on one line is on the other ⇔ they are the same line.",
);

mcq(
  SLE,
  `The system $y = 3x - 2$ and $y = 3x + 5$ has\n\n`,
  ["one solution", "no solutions", "infinitely many solutions", "depends on $x$"],
  "B",
  "EASY",
  "**Answer: B**\n\nBoth lines have gradient $3$ but different intercepts — parallel and distinct ⇒ no solutions.",
);

mcq(
  SLE,
  `When solving $y = 2x - 1$ and $y = -x + 5$ simultaneously, the x-coordinate of the intersection is\n\n`,
  ["$0$", "$1$", "$2$", "$3$"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nSet equal: $2x - 1 = -x + 5 \\Rightarrow 3x = 6 \\Rightarrow x = 2$.",
);

mcq(
  SLE,
  `The graphs of two lines intersect at $(3, 5)$. If one line has gradient $2$ and the other has gradient $-1$, the equations of the lines are\n\n`,
  [
    "$y = 2x - 1$ and $y = -x + 8$",
    "$y = 2x + 1$ and $y = -x - 2$",
    "$y = 2x + 5$ and $y = -x - 3$",
    "$y = 2x - 1$ and $y = -x + 2$",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nLine 1 (gradient 2 through (3, 5)): $5 = 2(3) + c \\Rightarrow c = -1$, so $y = 2x - 1$.\n\nLine 2 (gradient $-1$ through (3, 5)): $5 = -3 + c \\Rightarrow c = 8$, so $y = -x + 8$.",
);

mcq(
  SLE,
  `The system $2x + y = 7$ and $x - y = 2$ is solved graphically. The y-coordinate of the intersection is\n\n`,
  ["$1$", "$2$", "$3$", "$5$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nAdd: $3x = 9 \\Rightarrow x = 3$. Then $y = x - 2 = 1$. Intersection $(3, 1)$.",
);

mcq(
  SLE,
  `A line has gradient $-2$ and y-intercept $8$. It intersects the x-axis at the point\n\n`,
  ["$(-4, 0)$", "$(2, 0)$", "$(4, 0)$", "$(-2, 0)$"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nEquation: $y = -2x + 8$. At y = 0: $0 = -2x + 8 \\Rightarrow x = 4$. Point: $(4, 0)$.",
);

// ─── SHORT_ANSWER (4) ──────────────────────────────────────────────────

short(
  SLE,
  `Solve the system $y = 2x + 3$ and $y = -x + 9$ by setting the two equal. State the solution as an ordered pair. (3 marks)`,
  3,
  "EASY",
  "$2x + 3 = -x + 9 \\Rightarrow 3x = 6 \\Rightarrow x = 2$. (2 marks)\n\nThen $y = 2(2) + 3 = 7$. **Solution: $(2, 7)$.** (1 mark)",
);

short(
  SLE,
  `${img(sleIntersectSvg)}\n\nThe graph shows two lines: $y = x + 1$ (red) and $y = -2x + 7$ (blue).\n\n**a.** From the graph, write down the coordinates of the point of intersection. (1 mark)\n\n**b.** Verify your answer algebraically. (2 marks) (3 marks)`,
  3,
  "EASY",
  "**a.** Point of intersection: $(2, 3)$. (1 mark)\n\n**b.** Set $x + 1 = -2x + 7 \\Rightarrow 3x = 6 \\Rightarrow x = 2$. $y = 2 + 1 = 3$. Verified: $(2, 3)$. (2 marks)",
);

short(
  SLE,
  `The lines $\\ell_1: y = 3x - 4$ and $\\ell_2: y = -x + 8$ intersect at point $P$.\n\n**a.** Find the coordinates of $P$. (2 marks)\n\n**b.** Find the equation of the line through $P$ with gradient $\\dfrac{1}{2}$. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** $3x - 4 = -x + 8 \\Rightarrow 4x = 12 \\Rightarrow x = 3$. $y = 3(3) - 4 = 5$. $P = (3, 5)$. (2 marks)\n\n**b.** Through $(3, 5)$ with gradient $\\dfrac{1}{2}$: $5 = \\dfrac{1}{2}(3) + c \\Rightarrow c = 5 - 1.5 = 3.5$. **Equation: $y = \\dfrac{1}{2}x + 3.5$.** (2 marks)",
);

short(
  SLE,
  `The two lines $y = mx + 4$ and $y = -2x + 10$ intersect at the point with x-coordinate $x = 2$.\n\n**a.** Find the y-coordinate of the intersection. (1 mark)\n\n**b.** Find the value of $m$. (2 marks) (3 marks)`,
  3,
  "MEDIUM",
  "**a.** At $x = 2$ on $y = -2x + 10$: $y = -4 + 10 = 6$. Intersection $(2, 6)$. (1 mark)\n\n**b.** Substitute $(2, 6)$ into $y = mx + 4$: $6 = 2m + 4 \\Rightarrow m = 1$. (2 marks)",
);

// ─── EXTENDED_ANSWER (2) ───────────────────────────────────────────────

extAns(
  SLE,
  [
    {
      label: "a",
      marks: 2,
      content: `${img(sleIntersectSvg)}\n\nFrom the graph, identify the gradient and y-intercept of each line.`,
      solution:
        "Red line ($y = x + 1$): gradient = $1$, y-intercept = $1$.\n\nBlue line ($y = -2x + 7$): gradient = $-2$, y-intercept = $7$. (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `Verify the point of intersection $P(2, 3)$ shown on the graph by substituting into both equations.`,
      solution:
        "Red: $y = 2 + 1 = 3$ ✓.\n\nBlue: $y = -2(2) + 7 = 3$ ✓.\n\nBoth equations satisfied ⇒ $(2, 3)$ is a valid intersection. (2 marks)",
    },
    {
      label: "c",
      marks: 2,
      content: `Find the area of the triangle formed by the two lines and the x-axis.`,
      solution:
        "x-intercept of red line: $y = 0 \\Rightarrow x = -1$. x-intercept of blue: $0 = -2x + 7 \\Rightarrow x = 3.5$.\n\nTriangle vertices: $(-1, 0)$, $(3.5, 0)$, $(2, 3)$ — base on x-axis has length $3.5 - (-1) = 4.5$, height (y of intersection) $= 3$.\n\nArea $= \\dfrac{1}{2} \\times 4.5 \\times 3 = 6.75$ square units. (2 marks)",
    },
  ],
  "MEDIUM",
);

extAns(
  SLE,
  [
    {
      label: "a",
      marks: 2,
      content: `${img(sleParallelSvg)}\n\nExplain why the system $y = 2x + 1$ and $y = 2x + 4$ has no solution.`,
      solution:
        "Both lines have gradient $2$ but different y-intercepts ($1$ and $4$). They are **parallel** but distinct — they never intersect, so the system has no solution. (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `Find a value of $c$ for which the system $y = 2x + 1$ and $y = 2x + c$ has infinitely many solutions.`,
      solution:
        "Infinitely many solutions require the two lines to be **the same line**, i.e. same gradient AND same y-intercept. So $c = 1$. (2 marks)",
    },
    {
      label: "c",
      marks: 2,
      content: `For what gradient $m$ would the line $y = mx + 1$ have exactly one solution with $y = 2x + 4$? Justify briefly.`,
      solution:
        "Exactly one solution ⇔ lines intersect at one point ⇔ different gradients. So $m \\neq 2$ (any value but $2$). (2 marks)",
    },
  ],
  "MEDIUM",
);

// ─── EXTENDED_RESPONSE (2) ─────────────────────────────────────────────

extResp(
  SLE,
  [
    {
      label: "a",
      marks: 2,
      content: `Consider the lines $\\ell_1: y = -x + 6$ and $\\ell_2: y = 2x - 3$. Sketch a description of each line (gradient and y-intercept).`,
      solution:
        "$\\ell_1$: gradient $-1$, y-intercept $6$. Decreasing line crossing x-axis at $(6, 0)$.\n\n$\\ell_2$: gradient $2$, y-intercept $-3$. Increasing line crossing x-axis at $(1.5, 0)$. (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `Solve the system algebraically and identify the point of intersection.`,
      solution:
        "$-x + 6 = 2x - 3 \\Rightarrow 9 = 3x \\Rightarrow x = 3$.\n\n$y = -3 + 6 = 3$. **Intersection: $(3, 3)$.** (2 marks)",
    },
    {
      label: "c",
      marks: 2,
      content: `${img(sleIntersectSvg)}\n\n(Diagram for reference — different system.) For the original system in this question, find the y-intercept of each line and the x-intercept of each line, and use these to sketch the lines.`,
      solution:
        "$\\ell_1$: x-int = $6$ (set $y = 0$: $0 = -x + 6$), y-int = $6$.\n\n$\\ell_2$: x-int = $1.5$ (set $y = 0$: $0 = 2x - 3$), y-int = $-3$. (2 marks)",
    },
    {
      label: "d",
      marks: 3,
      content: `Find the area of the triangle formed by $\\ell_1$, $\\ell_2$, and the y-axis.`,
      solution:
        "y-intercepts: $\\ell_1$ at $(0, 6)$, $\\ell_2$ at $(0, -3)$. Intersection of $\\ell_1, \\ell_2$: $(3, 3)$.\n\nTriangle vertices: $(0, 6)$, $(0, -3)$, $(3, 3)$.\n\nBase along y-axis = $6 - (-3) = 9$. Height (horizontal distance from y-axis to vertex $(3, 3)$) = $3$.\n\nArea $= \\dfrac{1}{2} \\times 9 \\times 3 = 13.5$ square units. (3 marks)",
    },
    {
      label: "e",
      marks: 3,
      content: `A third line $\\ell_3: y = mx + 1$ passes through the intersection $(3, 3)$ found in part **b**. Find the value of $m$ and state whether $\\ell_3$ is parallel, perpendicular, or neither to $\\ell_1$.`,
      solution:
        "Substitute $(3, 3)$: $3 = 3m + 1 \\Rightarrow m = \\dfrac{2}{3}$. (2 marks)\n\nGradient of $\\ell_1$ is $-1$. Product = $\\dfrac{2}{3} \\times (-1) = -\\dfrac{2}{3} \\neq -1$, and gradients differ ⇒ **neither parallel nor perpendicular**. (1 mark)",
    },
  ],
  "MEDIUM",
  `**Question — Graphical simultaneous equations**\n\nTwo lines $\\ell_1: y = -x + 6$ and $\\ell_2: y = 2x - 3$ are studied. We find their intersection, sketch them via intercepts, compute an area, and add a third line through the intersection.`,
);

extResp(
  SLE,
  [
    {
      label: "a",
      marks: 2,
      content: `A small business sells two products, $A$ and $B$. The price of $A$ is \\$x and of $B$ is \\$y. In one transaction, the customer bought $2$ of $A$ and $3$ of $B$ for \\$23. In another, $1$ of $A$ and $4$ of $B$ for \\$24. Write the two simultaneous linear equations.`,
      solution:
        "Equation 1: $2x + 3y = 23$.\n\nEquation 2: $x + 4y = 24$. (2 marks)",
    },
    {
      label: "b",
      marks: 3,
      content: `Solve the system to find $x$ and $y$.`,
      solution:
        "From Eq 2: $x = 24 - 4y$. Substitute into Eq 1: $2(24 - 4y) + 3y = 23 \\Rightarrow 48 - 8y + 3y = 23 \\Rightarrow -5y = -25 \\Rightarrow y = 5$. (2 marks)\n\nThen $x = 24 - 20 = 4$. **$x = \\$4$, $y = \\$5$.** (1 mark)",
    },
    {
      label: "c",
      marks: 2,
      content: `Sketch both equations on a Cartesian plane (describe gradients and intercepts).`,
      solution:
        "Eq 1 ($2x + 3y = 23$): x-intercept $\\dfrac{23}{2} = 11.5$, y-intercept $\\dfrac{23}{3} \\approx 7.67$. Gradient $-\\dfrac{2}{3}$.\n\nEq 2 ($x + 4y = 24$): x-intercept $24$, y-intercept $6$. Gradient $-\\dfrac{1}{4}$.\n\nLines intersect at $(4, 5)$. (2 marks)",
    },
    {
      label: "d",
      marks: 2,
      content: `In a third transaction, the customer bought $5$ of $A$ and $2$ of $B$. Find the total cost.`,
      solution:
        "Cost = $5x + 2y = 5(4) + 2(5) = 20 + 10 = \\$30$. (2 marks)",
    },
    {
      label: "e",
      marks: 3,
      content: `Suppose the owner introduces a third product $C$ at \\$3. In a new transaction, the customer buys $3$ of $A$, $2$ of $B$ and $4$ of $C$. Show that the cost is the same as the original first transaction (\\$23) plus the cost of the $C$ items.`,
      solution:
        "Cost = $3x + 2y + 4(3) = 3(4) + 2(5) + 12 = 12 + 10 + 12 = \\$34$. (1 mark)\n\nOriginal first transaction = \\$23. Cost of $C$ items only = $4 \\times 3 = \\$12$.\n\nDifference: $34 - 23 = \\$11$, which is **NOT** equal to $\\$12$ — so the statement is **false**. (2 marks)\n\nThe new transaction differs from the first by: $-1$ of $A$ ($-4$), $+1$ of $B$ ($+5$), and $+4$ of $C$ ($+12$), giving total change $= -4 + 5 + 12 = +\\$11$ above \\$23, so \\$34. The cost of $C$ items alone (\\$12) over-states the difference by the net effect of changing A/B counts.",
    },
  ],
  "HARD",
  `**Question — Simultaneous equations in a pricing scenario**\n\nA small business sells two products, $A$ at price \\$x and $B$ at price \\$y. Two transaction records give a 2×2 system of linear equations. We solve, interpret, and analyse a price change.`,
);

// ════════════════════════════════════════════════════════════════════════
// SUBTOPIC 7 — Linear modelling (modelling-rich, 16 items)
// ════════════════════════════════════════════════════════════════════════

const LM = "linear-modelling";

// Shared: linear cost model y = 50x + 200
const lmCostSvg = functionPlot({
  fn: (x) => 50 * x + 200,
  xRange: [0, 20],
  yRange: [0, 1200],
  xTicks: [4, 8, 12, 16, 20],
  yTicks: [200, 400, 600, 800, 1000, 1200],
  color: "#dc2626",
  xLabel: "items (x)",
  yLabel: "cost ($)",
  fnLabel: "C = 50x + 200",
  fnLabelAt: { x: 10, y: 500 },
});

// ─── MCQ (7) ──────────────────────────────────────────────────────────

mcq(
  LM,
  `A taxi charges a \\$3.50 flag-fall plus \\$2.00 per km. The linear model for the cost $C$ in dollars after $d$ km is\n\n`,
  ["$C = 3.50d + 2.00$", "$C = 2.00d + 3.50$", "$C = 5.50d$", "$C = 2.00d - 3.50$"],
  "B",
  "EASY",
  "**Answer: B**\n\nFixed cost \\$3.50 + variable \\$2.00/km ⇒ $C = 2.00d + 3.50$.",
);

mcq(
  LM,
  `${img(lmCostSvg)}\n\nThe graph shows the cost $C$ (in \\$) of producing $x$ items. The fixed cost (set-up) is\n\n`,
  ["\\$0", "\\$50", "\\$200", "\\$1000"],
  "C",
  "EASY",
  "**Answer: C**\n\nThe y-intercept of the cost line represents the fixed cost, which is \\$200.",
);

mcq(
  LM,
  `${img(lmCostSvg)}\n\nUsing the cost model $C = 50x + 200$, the variable cost per item is\n\n`,
  ["\\$0", "\\$50", "\\$200", "\\$250"],
  "B",
  "EASY",
  "**Answer: B**\n\nThe gradient $50$ represents the additional cost per item, i.e. variable cost.",
);

mcq(
  LM,
  `A water tank initially holds $100$ L. It is being filled at a constant rate of $5$ L/min. After $t$ minutes the volume is\n\n`,
  ["$V = 100t + 5$", "$V = 5t + 100$", "$V = 5t - 100$", "$V = 100 + 5/t$"],
  "B",
  "EASY",
  "**Answer: B**\n\nInitial volume + (rate × time) = $100 + 5t$, or $V = 5t + 100$.",
);

mcq(
  LM,
  `A plumber charges a \\$60 call-out fee plus \\$80 per hour. A 3-hour job costs\n\n`,
  ["\\$240", "\\$260", "\\$300", "\\$320"],
  "C",
  "EASY",
  "**Answer: C**\n\n$C = 60 + 80(3) = 60 + 240 = \\$300$.",
);

mcq(
  LM,
  `A linear cost model for a small business is $C = 12n + 480$, where $n$ is the number of items produced and $C$ is the total cost in dollars. The break-even revenue model is $R = 20n$. The break-even point (in units) is\n\n`,
  ["$30$", "$40$", "$60$", "$80$"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nBreak-even: $R = C \\Rightarrow 20n = 12n + 480 \\Rightarrow 8n = 480 \\Rightarrow n = 60$.",
);

mcq(
  LM,
  `A car depreciates linearly. It is bought for \\$25,000 and is worth \\$13,000 after 6 years. The annual depreciation rate is\n\n`,
  ["\\$1,500", "\\$2,000", "\\$2,167", "\\$2,500"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nTotal depreciation over 6 years = $25{,}000 - 13{,}000 = \\$12{,}000$. Annual rate = $\\dfrac{12{,}000}{6} = \\$2{,}000$/year.",
);

// ─── SHORT_ANSWER (4) ──────────────────────────────────────────────────

short(
  LM,
  `A mobile phone plan has a fixed monthly fee of \\$25 and a per-minute call charge of \\$0.20. Let $C$ be the monthly cost in dollars and $m$ the number of minutes used.\n\n**a.** Write a linear model for $C$ in terms of $m$. (1 mark)\n\n**b.** Find the cost when $m = 150$. (1 mark)\n\n**c.** How many minutes correspond to a bill of \\$70? (2 marks) (4 marks)`,
  4,
  "EASY",
  "**a.** $C = 0.20m + 25$. (1 mark)\n\n**b.** $C = 0.20(150) + 25 = 30 + 25 = \\$55$. (1 mark)\n\n**c.** $0.20m + 25 = 70 \\Rightarrow 0.20m = 45 \\Rightarrow m = 225$ minutes. (2 marks)",
);

short(
  LM,
  `${img(lmCostSvg)}\n\nThe graph shows the cost $C$ in dollars of producing $x$ items: $C = 50x + 200$.\n\n**a.** What is the fixed cost? (1 mark)\n\n**b.** What is the marginal cost (cost per additional item)? (1 mark)\n\n**c.** How many items can be produced for exactly \\$700? (2 marks) (4 marks)`,
  4,
  "EASY",
  "**a.** Fixed cost (y-intercept) = \\$200. (1 mark)\n\n**b.** Marginal cost (gradient) = \\$50/item. (1 mark)\n\n**c.** $50x + 200 = 700 \\Rightarrow 50x = 500 \\Rightarrow x = 10$ items. (2 marks)",
);

short(
  LM,
  `A swimming pool currently holds $4500$ L. It is being drained at a constant rate of $50$ L/min.\n\n**a.** Write a linear model for the volume $V$ (in L) after $t$ minutes. (2 marks)\n\n**b.** How long until the pool is empty? (1 mark)\n\n**c.** When will the pool contain $2000$ L? (1 mark) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** $V = 4500 - 50t$. (2 marks)\n\n**b.** $V = 0 \\Rightarrow 4500 - 50t = 0 \\Rightarrow t = 90$ minutes. (1 mark)\n\n**c.** $2000 = 4500 - 50t \\Rightarrow 50t = 2500 \\Rightarrow t = 50$ minutes. (1 mark)",
);

short(
  LM,
  `A taxi service has two fare schemes:\n\n- **Scheme A:** \\$4 flag-fall plus \\$1.80/km\n- **Scheme B:** \\$2 flag-fall plus \\$2.20/km\n\n**a.** Write linear models $C_A(d)$ and $C_B(d)$ for the cost in dollars after $d$ km. (2 marks)\n\n**b.** At what distance do the two schemes cost the same? (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** $C_A(d) = 1.80d + 4$. $C_B(d) = 2.20d + 2$. (2 marks)\n\n**b.** Equal cost: $1.80d + 4 = 2.20d + 2 \\Rightarrow 2 = 0.40d \\Rightarrow d = 5$ km. (2 marks)",
);

// ─── EXTENDED_ANSWER (2) ───────────────────────────────────────────────

extAns(
  LM,
  [
    {
      label: "a",
      marks: 2,
      content: `A car is purchased for \\$32,000 and depreciates linearly by \\$2,500 per year. Write a linear model for the car's value $V$ after $t$ years.`,
      solution: "$V = 32{,}000 - 2{,}500 t$. (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the value of the car after $5$ years.`,
      solution: "$V = 32{,}000 - 2{,}500(5) = 32{,}000 - 12{,}500 = \\$19{,}500$. (2 marks)",
    },
    {
      label: "c",
      marks: 2,
      content: `After how many years will the car be worth less than \\$10,000?`,
      solution:
        "$32{,}000 - 2{,}500 t < 10{,}000 \\Rightarrow 22{,}000 < 2{,}500 t \\Rightarrow t > 8.8$ years.\n\n**The car is worth less than \\$10,000 after 8.8 years (or, in whole years, from year 9).** (2 marks)",
    },
    {
      label: "d",
      marks: 1,
      content: `State an assumption / limitation of the linear depreciation model.`,
      solution:
        "Linear depreciation assumes the value drops at a constant rate forever — in reality, depreciation slows as the car ages, and the value never goes below zero. (1 mark)",
    },
  ],
  "MEDIUM",
);

extAns(
  LM,
  [
    {
      label: "a",
      marks: 2,
      content: `A printing company has a fixed cost of \\$300 per job plus a variable cost of \\$0.15 per copy. Write a linear cost model $C(n)$ for $n$ copies.`,
      solution: "$C(n) = 0.15n + 300$. (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `If the company sells each copy for \\$0.30, write the revenue model $R(n)$ and find the break-even point.`,
      solution:
        "$R(n) = 0.30n$. Break-even: $0.30n = 0.15n + 300 \\Rightarrow 0.15n = 300 \\Rightarrow n = 2000$ copies. (2 marks)",
    },
    {
      label: "c",
      marks: 2,
      content: `Find the profit when $n = 5000$ copies are produced and sold.`,
      solution:
        "Profit $= R(5000) - C(5000) = 0.30(5000) - (0.15 \\times 5000 + 300) = 1500 - 1050 = \\$450$. (2 marks)",
    },
    {
      label: "d",
      marks: 1,
      content: `Identify the profit-per-copy after break-even.`,
      solution:
        "After break-even, each additional copy yields $0.30 - 0.15 = \\$0.15$ in profit. (1 mark)",
    },
  ],
  "MEDIUM",
);

// ─── EXTENDED_RESPONSE (3) ─────────────────────────────────────────────

extResp(
  LM,
  [
    {
      label: "a",
      marks: 2,
      content: `${img(lmCostSvg)}\n\nA factory's daily cost $C$ (in dollars) to produce $x$ items is modelled by $C = 50x + 200$. State the fixed cost and the variable cost per item.`,
      solution:
        "Fixed cost = \\$200 (y-intercept).\n\nVariable cost per item = \\$50 (gradient). (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `The factory sells each item for \\$70. Write the revenue model $R(x)$ and find the break-even quantity.`,
      solution:
        "$R(x) = 70x$. Break-even: $70x = 50x + 200 \\Rightarrow 20x = 200 \\Rightarrow x = 10$ items. (2 marks)",
    },
    {
      label: "c",
      marks: 2,
      content: `Find the profit when 25 items are produced and sold.`,
      solution:
        "Profit $= R(25) - C(25) = 70(25) - (50 \\cdot 25 + 200) = 1750 - 1450 = \\$300$. (2 marks)",
    },
    {
      label: "d",
      marks: 3,
      content: `The factory wants a profit of at least \\$500. How many items must be produced and sold? Set up and solve an inequality.`,
      solution:
        "Profit = $R(x) - C(x) = 70x - (50x + 200) = 20x - 200$.\n\nNeed $20x - 200 \\ge 500 \\Rightarrow 20x \\ge 700 \\Rightarrow x \\ge 35$ items.\n\n**At least 35 items must be sold.** (3 marks)",
    },
    {
      label: "e",
      marks: 3,
      content: `A supplier offers to reduce the variable cost from \\$50 to \\$40 per item, but the fixed cost rises to \\$300. Does this benefit the factory at production levels below the original break-even point ($x < 10$)? Justify with computation.`,
      solution:
        "New cost model: $C'(x) = 40x + 300$.\n\nCompare at $x = 10$: $C = 700$, $C' = 700$ — equal.\n\nCompare at $x = 5$ (below break-even): $C = 450$, $C' = 500$. New is **\\$50 more** at $x = 5$.\n\n**No** — for production levels below $x = 10$, the new arrangement is more expensive. The crossover where they cost the same is $x = 10$. The new arrangement only benefits the factory above $x = 10$. (3 marks)",
    },
  ],
  "MEDIUM",
  `**Question — Linear cost-revenue modelling**\n\nA factory's daily cost $C$ (in \\$) to produce $x$ items is $C = 50x + 200$, and each item sells for \\$70. We analyse break-even, profit, and a proposed change in cost structure.`,
);

extResp(
  LM,
  [
    {
      label: "a",
      marks: 2,
      content: `A taxi service charges a \\$4.00 flag-fall plus \\$2.10 per km. Write the linear model $C(d)$ for the cost in dollars after $d$ km. State the gradient and y-intercept in context.`,
      solution:
        "$C(d) = 2.10d + 4$. (1 mark)\n\nGradient: \\$2.10/km — the per-km rate. y-intercept: \\$4.00 — the flag-fall (fixed fee paid when entering the taxi). (1 mark)",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the cost for a $7$-km trip and the distance corresponding to a \\$25 fare.`,
      solution:
        "$C(7) = 2.10 \\times 7 + 4 = 14.70 + 4 = \\$18.70$. (1 mark)\n\n$2.10d + 4 = 25 \\Rightarrow d = \\dfrac{21}{2.10} = 10$ km. (1 mark)",
    },
    {
      label: "c",
      marks: 2,
      content: `A rival taxi charges a flat \\$3.00/km with no flag-fall. Write its cost function and find the distance at which the two are equal.`,
      solution:
        "Rival: $C_2(d) = 3.00d$.\n\nEqual: $2.10d + 4 = 3.00d \\Rightarrow 4 = 0.90d \\Rightarrow d = \\dfrac{4}{0.90} \\approx 4.44$ km. (2 marks)",
    },
    {
      label: "d",
      marks: 3,
      content: `Under what distances is the original taxi cheaper, and under what distances is the rival cheaper? Justify by comparing the functions.`,
      solution:
        "At $d = 0$: original = \\$4, rival = \\$0 — rival cheaper.\n\nAt $d = 10$: original = \\$25, rival = \\$30 — original cheaper.\n\nCrossover at $d \\approx 4.44$ km. **For $d < 4.44$ km, the rival is cheaper; for $d > 4.44$ km, the original is cheaper.** (3 marks)",
    },
    {
      label: "e",
      marks: 3,
      content: `The original taxi service plans a 10% surcharge for late-night fares. Write the surcharged model $C'(d)$ and determine the new crossover distance with the rival.`,
      solution:
        "Surcharged: $C'(d) = 1.10 \\times (2.10d + 4) = 2.31d + 4.40$.\n\nEqual with rival $3.00d$: $2.31d + 4.40 = 3.00d \\Rightarrow 4.40 = 0.69d \\Rightarrow d \\approx 6.38$ km.\n\n**New crossover ≈ 6.38 km** — the rival is now cheaper for distances up to ~6.4 km. (3 marks)",
    },
  ],
  "HARD",
  `**Question — Taxi fare modelling**\n\nA taxi service charges a flag-fall of \\$4.00 plus \\$2.10 per km. We compare it against a rival service charging \\$3.00/km flat, and analyse the impact of a 10% late-night surcharge.`,
);

extResp(
  LM,
  [
    {
      label: "a",
      marks: 2,
      content: `A swimming pool starts with $200$ L of water. Two hoses are turned on: Hose A adds water at $15$ L/min, Hose B adds water at $25$ L/min. Write a linear model for the volume $V$ after $t$ minutes, with both hoses running.`,
      solution:
        "Total rate $= 15 + 25 = 40$ L/min. $V(t) = 40t + 200$. (2 marks)",
    },
    {
      label: "b",
      marks: 2,
      content: `When will the pool contain $1000$ L?`,
      solution:
        "$40t + 200 = 1000 \\Rightarrow 40t = 800 \\Rightarrow t = 20$ minutes. (2 marks)",
    },
    {
      label: "c",
      marks: 2,
      content: `Suppose only Hose A is used (Hose B is broken). Write the new model $V_A(t)$ and find when the pool reaches $1000$ L.`,
      solution:
        "$V_A(t) = 15t + 200$. $15t + 200 = 1000 \\Rightarrow t = \\dfrac{800}{15} \\approx 53.3$ minutes. (2 marks)",
    },
    {
      label: "d",
      marks: 3,
      content: `If Hose A runs alone for the first $10$ minutes, then Hose B joins, find the piecewise linear model $V(t)$ for the total volume.`,
      solution:
        "Phase 1 ($0 \\le t \\le 10$): $V(t) = 15t + 200$.\n\nAt $t = 10$: $V = 350$. (1 mark)\n\nPhase 2 ($t > 10$): both hoses running, rate $40$ L/min. $V(t) = 350 + 40(t - 10) = 40t - 50$.\n\n$V(t) = \\begin{cases} 15t + 200, & 0 \\le t \\le 10 \\\\ 40t - 50, & t > 10 \\end{cases}$ (2 marks)",
    },
    {
      label: "e",
      marks: 3,
      content: `Using the piecewise model in part **d**, find when the pool reaches $1500$ L.`,
      solution:
        "At $t = 10$: $V = 350 < 1500$.\n\nUse phase 2: $40t - 50 = 1500 \\Rightarrow 40t = 1550 \\Rightarrow t = 38.75$ minutes.\n\n**Pool reaches 1500 L at $t \\approx 38.75$ minutes.** (3 marks)",
    },
  ],
  "HARD",
  `**Question — Filling a pool with two hoses**\n\nA swimming pool starts with $200$ L of water. Two hoses, A and B, can be used to fill it. Hose A delivers $15$ L/min and Hose B delivers $25$ L/min. We model the volume over time in different scenarios.`,
);

// ─── Write output ──────────────────────────────────────────────────────

const spec = {
  subject_slug: SUBJECT_SLUG,
  question_set_id: QUESTION_SET_ID,
  items,
};

const outPath = path.join(OUT_DIR, "qset-general-functions.json");
fs.writeFileSync(outPath, JSON.stringify(spec, null, 2));
console.log(`Wrote ${items.length} items to ${outPath}`);
console.log(`  MCQ:               ${items.filter((i) => i.type === "MCQ").length}`);
console.log(`  SHORT_ANSWER:      ${items.filter((i) => i.type === "SHORT_ANSWER").length}`);
console.log(`  EXTENDED_ANSWER:   ${items.filter((i) => i.type === "EXTENDED_ANSWER").length}`);
console.log(`  EXTENDED_RESPONSE: ${items.filter((i) => i.type === "EXTENDED_RESPONSE").length}`);

// Per-subtopic count breakdown
const subtopics = [
  "linear-functions",
  "linear-inequalities",
  "direct-and-inverse-variation",
  "joint-variation",
  "piecewise-linear-functions",
  "simultaneous-linear-equations-graphical",
  "linear-modelling",
];
console.log(`\n  Subtopic breakdown:`);
for (const s of subtopics) {
  const subItems = items.filter((i) => i.subtopic_slugs.includes(s));
  const mcqCount = subItems.filter((i) => i.type === "MCQ").length;
  const shortCount = subItems.filter((i) => i.type === "SHORT_ANSWER").length;
  const extACount = subItems.filter((i) => i.type === "EXTENDED_ANSWER").length;
  const extRCount = subItems.filter((i) => i.type === "EXTENDED_RESPONSE").length;
  console.log(`    ${s.padEnd(45)} ${subItems.length} (M${mcqCount}/S${shortCount}/EA${extACount}/ER${extRCount})`);
}
