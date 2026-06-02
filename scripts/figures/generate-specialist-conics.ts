/**
 * Specialist: Implicit Relations - Ellipses and Hyperbolas.
 * Tier: modelling-rich → MCQ + SHORT + EXT_ANS + EXT_RESP.
 *
 * Targets: 12 MCQ + 8 SHORT + 3 EXT_ANS + 3 EXT_RESP.
 */

import * as fs from "fs";
import * as path from "path";
import { functionPlot, svg, circle, line, text, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/specialist-conics";
const JSON_PATH = "scripts/output/qset-specialist-conics.json";
fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Figures ────────────────────────────────────────────────────────────

// Ellipse x^2/9 + y^2/4 = 1, parametrised as (3 cos t, 2 sin t)
function parametricPlot(opts: {
  x: (t: number) => number;
  y: (t: number) => number;
  tRange: [number, number];
  xRange: [number, number];
  yRange: [number, number];
  color?: string;
  samples?: number;
  width?: number;
  height?: number;
  title?: string;
  markedPoints?: Array<{ x: number; y: number; label?: string; color?: string }>;
  extraLines?: Array<{ x1: number; y1: number; x2: number; y2: number; dash?: boolean; color?: string }>;
}): string {
  const w = opts.width ?? 380;
  const h = opts.height ?? 320;
  const margin = { top: 30, right: 50, bottom: 40, left: 50 };
  const samples = opts.samples ?? 200;

  // Build inner using makeCoords approach inline (we re-use functionPlot helpers below)
  const xpL = margin.left;
  const xpR = w - margin.right;
  const ypT = margin.top;
  const ypB = h - margin.bottom;
  const xMap = (x: number) => xpL + ((x - opts.xRange[0]) / (opts.xRange[1] - opts.xRange[0])) * (xpR - xpL);
  const yMap = (y: number) => ypB - ((y - opts.yRange[0]) / (opts.yRange[1] - opts.yRange[0])) * (ypB - ypT);

  const ARROW_DEFS = `<defs><marker id="arr" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L6,3 z" fill="#111"/></marker></defs>`;

  const parts: string[] = [ARROW_DEFS];
  // Axes
  const xAxisY = yMap(0);
  const yAxisX = xMap(0);
  parts.push(
    `<line x1="${xpL - 15}" y1="${xAxisY}" x2="${xpR + 15}" y2="${xAxisY}" stroke="#111" stroke-width="1.5" marker-end="url(#arr)"/>`,
  );
  parts.push(
    `<line x1="${yAxisX}" y1="${ypB + 15}" x2="${yAxisX}" y2="${ypT - 15}" stroke="#111" stroke-width="1.5" marker-end="url(#arr)"/>`,
  );
  parts.push(text(xpR + 22, xAxisY + 5, "x", { size: 14, italic: true }));
  parts.push(text(yAxisX + 8, ypT - 18, "y", { size: 14, italic: true }));

  // Ticks: integers across xRange / yRange
  for (let t = Math.ceil(opts.xRange[0]); t <= Math.floor(opts.xRange[1]); t++) {
    if (t === 0) continue;
    const px = xMap(t);
    parts.push(line(px, xAxisY - 3, px, xAxisY + 3, { width: 1 }));
    parts.push(
      text(px, xAxisY + 16, t < 0 ? `−${Math.abs(t)}` : String(t), {
        size: 11,
        anchor: "middle",
      }),
    );
  }
  for (let t = Math.ceil(opts.yRange[0]); t <= Math.floor(opts.yRange[1]); t++) {
    if (t === 0) continue;
    const py = yMap(t);
    parts.push(line(yAxisX - 3, py, yAxisX + 3, py, { width: 1 }));
    parts.push(
      text(yAxisX - 5, py + 4, t < 0 ? `−${Math.abs(t)}` : String(t), {
        size: 11,
        anchor: "end",
      }),
    );
  }

  // Extra dashed lines (e.g., asymptotes)
  for (const e of opts.extraLines ?? []) {
    const dash = e.dash ? "5 3" : undefined;
    parts.push(
      line(xMap(e.x1), yMap(e.y1), xMap(e.x2), yMap(e.y2), {
        stroke: e.color ?? "#9ca3af",
        width: 1,
        dash,
      }),
    );
  }

  // Plot the parametric curve as a polyline
  const pts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = opts.tRange[0] + (i / samples) * (opts.tRange[1] - opts.tRange[0]);
    const x = opts.x(t);
    const y = opts.y(t);
    if (!isFinite(x) || !isFinite(y)) continue;
    if (x < opts.xRange[0] - 0.5 || x > opts.xRange[1] + 0.5) continue;
    if (y < opts.yRange[0] - 0.5 || y > opts.yRange[1] + 0.5) continue;
    pts.push(`${xMap(x).toFixed(2)},${yMap(y).toFixed(2)}`);
  }
  parts.push(`<polyline points="${pts.join(" ")}" fill="none" stroke="${opts.color ?? "#dc2626"}" stroke-width="2"/>`);

  // Marked points
  for (const mp of opts.markedPoints ?? []) {
    const px = xMap(mp.x);
    const py = yMap(mp.y);
    parts.push(circle(px, py, 4, { fill: mp.color ?? "#2563eb" }));
    if (mp.label) {
      parts.push(text(px + 8, py - 6, mp.label, { size: 12, color: mp.color ?? "#2563eb" }));
    }
  }

  if (opts.title) {
    parts.push(text(w / 2, 16, opts.title, { size: 13, anchor: "middle", bold: true }));
  }

  return svg({ width: w, height: h }, parts.join(""));
}

// Ellipse x^2/9 + y^2/4 = 1
const figEllipse = parametricPlot({
  x: (t) => 3 * Math.cos(t),
  y: (t) => 2 * Math.sin(t),
  tRange: [0, 2 * Math.PI],
  xRange: [-4, 4],
  yRange: [-3, 3],
  color: "#dc2626",
  markedPoints: [
    { x: 3, y: 0, label: "(3, 0)" },
    { x: 0, y: 2, label: "(0, 2)" },
    { x: -3, y: 0, label: "(−3, 0)" },
    { x: 0, y: -2, label: "(0, −2)" },
  ],
});

// Hyperbola x^2/9 - y^2/4 = 1 — two branches
const figHyperbola = (() => {
  const w = 400;
  const h = 340;
  const margin = { top: 30, right: 50, bottom: 40, left: 50 };
  const xRange: [number, number] = [-7, 7];
  const yRange: [number, number] = [-5, 5];
  const xpL = margin.left;
  const xpR = w - margin.right;
  const ypT = margin.top;
  const ypB = h - margin.bottom;
  const xMap = (x: number) => xpL + ((x - xRange[0]) / (xRange[1] - xRange[0])) * (xpR - xpL);
  const yMap = (y: number) => ypB - ((y - yRange[0]) / (yRange[1] - yRange[0])) * (ypB - ypT);
  const ARROW_DEFS = `<defs><marker id="arr" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L6,3 z" fill="#111"/></marker></defs>`;
  const parts: string[] = [ARROW_DEFS];

  // Axes
  parts.push(`<line x1="${xpL - 15}" y1="${yMap(0)}" x2="${xpR + 15}" y2="${yMap(0)}" stroke="#111" stroke-width="1.5" marker-end="url(#arr)"/>`);
  parts.push(`<line x1="${xMap(0)}" y1="${ypB + 15}" x2="${xMap(0)}" y2="${ypT - 15}" stroke="#111" stroke-width="1.5" marker-end="url(#arr)"/>`);
  parts.push(text(xpR + 22, yMap(0) + 5, "x", { size: 14, italic: true }));
  parts.push(text(xMap(0) + 8, ypT - 18, "y", { size: 14, italic: true }));

  for (let t = -6; t <= 6; t++) {
    if (t === 0) continue;
    parts.push(line(xMap(t), yMap(0) - 3, xMap(t), yMap(0) + 3, { width: 1 }));
    parts.push(text(xMap(t), yMap(0) + 16, t < 0 ? `−${Math.abs(t)}` : String(t), { size: 11, anchor: "middle" }));
  }
  for (let t = -4; t <= 4; t++) {
    if (t === 0) continue;
    parts.push(line(xMap(0) - 3, yMap(t), xMap(0) + 3, yMap(t), { width: 1 }));
    parts.push(text(xMap(0) - 5, yMap(t) + 4, t < 0 ? `−${Math.abs(t)}` : String(t), { size: 11, anchor: "end" }));
  }

  // Asymptotes y = ±(2/3)x
  parts.push(line(xMap(-6), yMap(-4), xMap(6), yMap(4), { stroke: "#9ca3af", width: 1, dash: "5 3" }));
  parts.push(line(xMap(-6), yMap(4), xMap(6), yMap(-4), { stroke: "#9ca3af", width: 1, dash: "5 3" }));
  parts.push(text(xMap(5.5), yMap(3.4), "y = 2x/3", { size: 10, color: "#6b7280", italic: true }));
  parts.push(text(xMap(5.5), yMap(-3.0), "y = −2x/3", { size: 10, color: "#6b7280", italic: true }));

  // Right branch: x = 3 sec t, y = 2 tan t, t in (-π/2, π/2)
  const samples = 120;
  const right: string[] = [];
  for (let i = 1; i < samples; i++) {
    const t = -Math.PI / 2 + (i / samples) * Math.PI;
    const x = 3 / Math.cos(t);
    const y = 2 * Math.tan(t);
    if (x < xRange[0] - 0.5 || x > xRange[1] + 0.5) continue;
    if (y < yRange[0] - 0.5 || y > yRange[1] + 0.5) continue;
    right.push(`${xMap(x).toFixed(2)},${yMap(y).toFixed(2)}`);
  }
  parts.push(`<polyline points="${right.join(" ")}" fill="none" stroke="#dc2626" stroke-width="2"/>`);

  // Left branch: x = -3 sec t, y = 2 tan t
  const left: string[] = [];
  for (let i = 1; i < samples; i++) {
    const t = -Math.PI / 2 + (i / samples) * Math.PI;
    const x = -3 / Math.cos(t);
    const y = 2 * Math.tan(t);
    if (x < xRange[0] - 0.5 || x > xRange[1] + 0.5) continue;
    if (y < yRange[0] - 0.5 || y > yRange[1] + 0.5) continue;
    left.push(`${xMap(x).toFixed(2)},${yMap(y).toFixed(2)}`);
  }
  parts.push(`<polyline points="${left.join(" ")}" fill="none" stroke="#dc2626" stroke-width="2"/>`);

  // Vertices
  parts.push(circle(xMap(3), yMap(0), 4, { fill: "#2563eb" }));
  parts.push(text(xMap(3) + 6, yMap(0) - 6, "(3, 0)", { size: 11, color: "#2563eb" }));
  parts.push(circle(xMap(-3), yMap(0), 4, { fill: "#2563eb" }));
  parts.push(text(xMap(-3) - 50, yMap(0) - 6, "(−3, 0)", { size: 11, color: "#2563eb" }));

  return svg({ width: w, height: h }, parts.join(""));
})();

// Translated ellipse (x-2)^2/4 + (y+1)^2/9 = 1, centred at (2, -1)
const figEllipseTrans = parametricPlot({
  x: (t) => 2 + 2 * Math.cos(t),
  y: (t) => -1 + 3 * Math.sin(t),
  tRange: [0, 2 * Math.PI],
  xRange: [-2, 6],
  yRange: [-5, 3],
  color: "#dc2626",
  markedPoints: [
    { x: 2, y: -1, label: "centre (2, −1)", color: "#16a34a" },
    { x: 4, y: -1 },
    { x: 0, y: -1 },
    { x: 2, y: 2 },
    { x: 2, y: -4 },
  ],
});

// Vertical ellipse x^2/4 + y^2/9 = 1
const figEllipseVert = parametricPlot({
  x: (t) => 2 * Math.cos(t),
  y: (t) => 3 * Math.sin(t),
  tRange: [0, 2 * Math.PI],
  xRange: [-4, 4],
  yRange: [-4, 4],
  color: "#dc2626",
  markedPoints: [
    { x: 2, y: 0, label: "(2, 0)" },
    { x: 0, y: 3, label: "(0, 3)" },
    { x: -2, y: 0 },
    { x: 0, y: -3 },
  ],
});

const figures: Record<string, string> = {
  "ellipse.svg": figEllipse,
  "hyperbola.svg": figHyperbola,
  "ellipse-translated.svg": figEllipseTrans,
  "ellipse-vertical.svg": figEllipseVert,
};
for (const [name, content] of Object.entries(figures)) {
  fs.writeFileSync(path.join(FIGURES_DIR, name), content);
}
const img = (name: string, alt: string) => `![${alt}](${toDataUri(figures[name])})`;

// ─── Types + helpers ────────────────────────────────────────────────────

interface MCQ {
  content: string; optionA: string; optionB: string; optionC: string; optionD: string;
  correctOption: "A" | "B" | "C" | "D"; marks: number;
  difficulty: "EASY" | "MEDIUM" | "HARD"; solutionContent: string; subtopicSlugs: string[];
}
interface FR {
  content: string; marks: number; difficulty: "EASY" | "MEDIUM" | "HARD";
  solutionContent: string; subtopicSlugs: string[];
}
const m = (
  c: string, o: [string, string, string, string], k: "A" | "B" | "C" | "D",
  d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): MCQ => ({
  content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3],
  correctOption: k, marks: 1, difficulty: d, solutionContent: s,
  subtopicSlugs: ["implicit-relations-ellipses-hyperbolas", ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: ["implicit-relations-ellipses-hyperbolas", ...sec],
});

// ─── 12 MCQ ─────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("The graph of $\\dfrac{x^2}{9} + \\dfrac{y^2}{4} = 1$ is an ellipse with $x$-intercepts at:",
    ["$x = \\pm 2$", "$x = \\pm 3$", "$x = \\pm 9$", "$x = \\pm 4$"], "B", "EASY",
    "For $\\dfrac{x^2}{a^2} + \\dfrac{y^2}{b^2} = 1$, $x$-intercepts occur at $x = \\pm a$. Here $a^2 = 9$ so $a = 3$. **Answer: B**"),
  m("The graph of $\\dfrac{x^2}{16} + \\dfrac{y^2}{25} = 1$ has $y$-intercepts at:",
    ["$y = \\pm 4$", "$y = \\pm 16$", "$y = \\pm 5$", "$y = \\pm 25$"], "C", "EASY",
    "$y$-intercepts occur when $x = 0$: $y^2 = 25 \\Rightarrow y = \\pm 5$. **Answer: C**"),
  m("Which equation represents an ellipse?",
    ["$\\dfrac{x^2}{4} - \\dfrac{y^2}{9} = 1$", "$\\dfrac{x^2}{4} + \\dfrac{y^2}{9} = 1$", "$x^2 + y^2 = 4$ (circle, not ellipse)", "$y = x^2 + 4$"], "B", "EASY",
    "An ellipse has the form $\\dfrac{x^2}{a^2} + \\dfrac{y^2}{b^2} = 1$ with $a \\ne b$. Option A is a hyperbola, C is a circle, D is a parabola. **Answer: B**"),
  m("The equation $\\dfrac{x^2}{25} - \\dfrac{y^2}{9} = 1$ represents:",
    ["an ellipse", "a hyperbola opening left/right", "a hyperbola opening up/down", "a circle"], "B", "EASY",
    "Minus sign between the squared terms gives a hyperbola; the positive $x^2$ term means it opens horizontally. **Answer: B**"),
  m("For the ellipse $\\dfrac{x^2}{a^2} + \\dfrac{y^2}{b^2} = 1$ with $a > b > 0$, the lengths of the major and minor axes are:",
    ["$a$ and $b$", "$2a$ and $2b$", "$a^2$ and $b^2$", "$\\sqrt{a}$ and $\\sqrt{b}$"], "B", "EASY",
    "Major axis length $= 2a$, minor axis length $= 2b$. **Answer: B**"),
  m("The asymptotes of the hyperbola $\\dfrac{x^2}{9} - \\dfrac{y^2}{4} = 1$ are:",
    ["$y = \\pm \\dfrac{3}{2}x$", "$y = \\pm \\dfrac{2}{3}x$", "$y = \\pm \\dfrac{4}{9}x$", "$y = \\pm \\dfrac{9}{4}x$"], "B", "MEDIUM",
    "For $\\dfrac{x^2}{a^2} - \\dfrac{y^2}{b^2} = 1$, asymptotes are $y = \\pm \\dfrac{b}{a}x$. Here $a = 3$, $b = 2$. **Answer: B**"),
  m("The centre of the ellipse $\\dfrac{(x - 3)^2}{16} + \\dfrac{(y + 2)^2}{9} = 1$ is at:",
    ["$(3, 2)$", "$(-3, 2)$", "$(3, -2)$", "$(-3, -2)$"], "C", "MEDIUM",
    "Centre is at $(h, k)$ where the equation is $\\dfrac{(x - h)^2}{a^2} + \\dfrac{(y - k)^2}{b^2} = 1$. So $h = 3$, $k = -2$. **Answer: C**"),
  m("A circle is a special ellipse where:",
    ["$a > b$", "$a < b$", "$a = b$", "$a = 0$"], "C", "EASY",
    "When $a = b$, both axes have equal length and the equation becomes $x^2 + y^2 = a^2$, a circle. **Answer: C**"),
  m("Implicit differentiation of $x^2 + y^2 = 25$ gives $\\dfrac{dy}{dx} = $",
    ["$\\dfrac{x}{y}$", "$-\\dfrac{x}{y}$", "$\\dfrac{2x}{2y}$", "$\\dfrac{y}{x}$"], "B", "MEDIUM",
    "Differentiate: $2x + 2y \\dfrac{dy}{dx} = 0 \\Rightarrow \\dfrac{dy}{dx} = -\\dfrac{x}{y}$. **Answer: B**"),
  m("The gradient of the tangent to the ellipse $\\dfrac{x^2}{4} + \\dfrac{y^2}{9} = 1$ at the point $(0, 3)$ is:",
    ["$0$ (horizontal)", "undefined (vertical)", "$1$", "$-\\dfrac{3}{4}$"], "A", "MEDIUM",
    "At $(0, 3)$, which is the top vertex on the minor axis, the tangent is horizontal so the gradient is $0$. (Use implicit differentiation: $\\dfrac{2x}{4} + \\dfrac{2y}{9} \\dfrac{dy}{dx} = 0$ gives $\\dfrac{dy}{dx} = -\\dfrac{9x}{4y} = 0$ at $x = 0$.) **Answer: A**"),
  m("The number of points where the line $y = x$ intersects the ellipse $\\dfrac{x^2}{4} + \\dfrac{y^2}{9} = 1$ is:",
    ["$0$", "$1$", "$2$", "$4$"], "C", "MEDIUM",
    "Substitute $y = x$: $\\dfrac{x^2}{4} + \\dfrac{x^2}{9} = 1 \\Rightarrow x^2(9 + 4)/36 = 1 \\Rightarrow x^2 = 36/13$, giving two real solutions $x = \\pm 6/\\sqrt{13}$. **Answer: C**"),
  m("Which of the following is the equation of a hyperbola with vertices at $(\\pm 4, 0)$ and asymptotes $y = \\pm \\dfrac{3}{4}x$?",
    ["$\\dfrac{x^2}{16} - \\dfrac{y^2}{9} = 1$", "$\\dfrac{x^2}{9} - \\dfrac{y^2}{16} = 1$", "$\\dfrac{x^2}{16} + \\dfrac{y^2}{9} = 1$", "$\\dfrac{y^2}{16} - \\dfrac{x^2}{9} = 1$"], "A", "HARD",
    "Vertices at $(\\pm 4, 0)$ means $a = 4$ so $a^2 = 16$. Asymptotes $y = \\pm \\dfrac{b}{a}x = \\pm \\dfrac{3}{4}x \\Rightarrow b = 3$, so $b^2 = 9$. **Answer: A**"),
];

// ─── 8 SHORT (Exam-1-style technique drills) ────────────────────────────

const shortAnswer: FR[] = [
  sq("Sketch the ellipse $\\dfrac{x^2}{9} + \\dfrac{y^2}{4} = 1$ on the labelled $xy$-plane, indicating axes intercepts.\n\n" +
    img("ellipse.svg", "Ellipse x²/9 + y²/4 = 1 with intercepts at (±3, 0) and (0, ±2)"),
    2, "EASY",
    "*Step 1 (1 mark):* Identify $a = 3$, $b = 2$. $x$-intercepts at $(\\pm 3, 0)$, $y$-intercepts at $(0, \\pm 2)$.\n*Step 2 (1 mark):* Sketch a horizontally-oriented ellipse passing through these four points; centre at origin. See diagram."),
  sq("Use implicit differentiation to find $\\dfrac{dy}{dx}$ for the curve $\\dfrac{x^2}{9} + \\dfrac{y^2}{4} = 1$.", 2, "MEDIUM",
    "*Step 1 (1 mark):* Differentiate both sides with respect to $x$: $\\dfrac{2x}{9} + \\dfrac{2y}{4} \\cdot \\dfrac{dy}{dx} = 0$.\n*Step 2 (1 mark):* Solve: $\\dfrac{dy}{dx} = -\\dfrac{2x/9}{y/2} = -\\dfrac{4x}{9y}$."),
  sq("Find the equation of the tangent line to the ellipse $x^2 + 4y^2 = 8$ at the point $(2, 1)$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Verify $(2,1)$ lies on the curve: $4 + 4 = 8$ ✓.\n*Step 2 (1 mark):* Implicit differentiation: $2x + 8y \\dfrac{dy}{dx} = 0 \\Rightarrow \\dfrac{dy}{dx} = -\\dfrac{x}{4y}$. At $(2,1)$: $m = -\\dfrac{2}{4} = -\\dfrac{1}{2}$.\n*Step 3 (1 mark):* Tangent: $y - 1 = -\\dfrac{1}{2}(x - 2) \\Rightarrow y = -\\dfrac{1}{2}x + 2$."),
  sq("State the centre and lengths of the major and minor axes for the ellipse $\\dfrac{(x - 1)^2}{25} + \\dfrac{(y + 3)^2}{16} = 1$.", 2, "EASY",
    "*Step 1 (1 mark):* Centre: $(1, -3)$.\n*Step 2 (1 mark):* $a^2 = 25 \\Rightarrow a = 5$, major axis length $= 10$ (horizontal). $b^2 = 16 \\Rightarrow b = 4$, minor axis length $= 8$ (vertical)."),
  sq("Find the equations of the asymptotes and the vertices of the hyperbola $\\dfrac{x^2}{16} - \\dfrac{y^2}{9} = 1$.\n\n" +
    img("hyperbola.svg", "Hyperbola x²/9 - y²/4 = 1 with two branches and dashed asymptotes"),
    3, "MEDIUM",
    "*Step 1 (1 mark):* For $\\dfrac{x^2}{a^2} - \\dfrac{y^2}{b^2} = 1$: $a = 4$, $b = 3$.\n*Step 2 (1 mark):* Vertices: $(\\pm a, 0) = (\\pm 4, 0)$.\n*Step 3 (1 mark):* Asymptotes: $y = \\pm \\dfrac{b}{a} x = \\pm \\dfrac{3}{4} x$."),
  sq("Write $\\dfrac{(x - 2)^2}{4} + \\dfrac{(y + 1)^2}{9} = 1$ in the form showing centre, semi-axes, and orientation. Then state where the tangent is vertical.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Centre $(2, -1)$, semi-axes $a = 2$ (horizontal) and $b = 3$ (vertical) — major axis is vertical since $b > a$.\n*Step 2 (1 mark):* Vertical tangents occur where $\\dfrac{dy}{dx}$ is undefined, i.e. at the endpoints of the horizontal (minor) axis: $y = -1$ and $x = 2 \\pm 2$, so $(0, -1)$ and $(4, -1)$.\n*Step 3 (1 mark):* These are the two points on the curve where $y = -1$ (centre's $y$-value) and $x = h \\pm a$."),
  sq("The curve $x^2 - y^2 = 4$ is a hyperbola. Find $\\dfrac{dy}{dx}$ at the point $(\\sqrt 5, 1)$.", 3, "HARD",
    "*Step 1 (1 mark):* Check point: $5 - 1 = 4$ ✓.\n*Step 2 (1 mark):* Differentiate: $2x - 2y \\dfrac{dy}{dx} = 0 \\Rightarrow \\dfrac{dy}{dx} = \\dfrac{x}{y}$.\n*Step 3 (1 mark):* At $(\\sqrt 5, 1)$: $\\dfrac{dy}{dx} = \\sqrt 5$."),
  sq("Show that the ellipse $\\dfrac{x^2}{4} + \\dfrac{y^2}{9} = 1$ and the line $y = x + 1$ intersect at exactly two points, and find them in surd form.\n\n" +
    img("ellipse-vertical.svg", "Vertical ellipse x²/4 + y²/9 = 1 with semi-axes 2 and 3"),
    3, "HARD",
    "*Step 1 (1 mark):* Substitute $y = x + 1$: $\\dfrac{x^2}{4} + \\dfrac{(x+1)^2}{9} = 1$.\n*Step 2 (1 mark):* Multiply by 36: $9x^2 + 4(x+1)^2 = 36 \\Rightarrow 9x^2 + 4x^2 + 8x + 4 = 36 \\Rightarrow 13x^2 + 8x - 32 = 0$.\n*Step 3 (1 mark):* Discriminant $= 64 + 4 \\cdot 13 \\cdot 32 = 1728 > 0$ so two real solutions. $x = \\dfrac{-8 \\pm \\sqrt{1728}}{26} = \\dfrac{-8 \\pm 24\\sqrt 3}{26} = \\dfrac{-4 \\pm 12\\sqrt 3}{13}$, with corresponding $y = x + 1$."),
];

// ─── 3 EXT_ANS (Section A multi-part) ───────────────────────────────────

const extendedAnswer: FR[] = [
  sq(`Consider the ellipse $\\dfrac{x^2}{9} + \\dfrac{y^2}{4} = 1$.

**a.** State the $x$- and $y$-intercepts. (1 mark)

**b.** Use implicit differentiation to find $\\dfrac{dy}{dx}$ in terms of $x$ and $y$. (2 marks)

**c.** Hence find the equation of the tangent to the ellipse at the point $\\left(\\dfrac{3}{2}, \\sqrt{3}\\right)$. (3 marks)

${img("ellipse.svg", "Ellipse x²/9 + y²/4 = 1 with intercepts marked")}`,
    6, "MEDIUM",
    `**a. (1 mark)**
$x$-intercepts: $(\\pm 3, 0)$. $y$-intercepts: $(0, \\pm 2)$.

**b. (2 marks)**
*Step 1 (1 mark):* Differentiate: $\\dfrac{2x}{9} + \\dfrac{2y}{4} \\cdot \\dfrac{dy}{dx} = 0$.
*Step 2 (1 mark):* Solve: $\\dfrac{dy}{dx} = -\\dfrac{4x}{9y}$.

**c. (3 marks)**
*Step 1 (1 mark):* Verify $\\left(\\tfrac{3}{2}, \\sqrt 3\\right)$ lies on the curve: $\\dfrac{9/4}{9} + \\dfrac{3}{4} = \\dfrac{1}{4} + \\dfrac{3}{4} = 1$ ✓.
*Step 2 (1 mark):* Substitute into $\\dfrac{dy}{dx}$: $m = -\\dfrac{4 \\cdot 3/2}{9 \\sqrt 3} = -\\dfrac{6}{9\\sqrt 3} = -\\dfrac{2}{3\\sqrt 3} = -\\dfrac{2\\sqrt 3}{9}$.
*Step 3 (1 mark):* Tangent: $y - \\sqrt 3 = -\\dfrac{2\\sqrt 3}{9}\\left(x - \\dfrac{3}{2}\\right)$.`),

  sq(`The hyperbola $H$ has equation $\\dfrac{x^2}{16} - \\dfrac{y^2}{9} = 1$.

**a.** Write down the coordinates of the vertices and the equations of the asymptotes. (2 marks)

**b.** Sketch $H$ showing the vertices, asymptotes, and overall shape. (2 marks)

**c.** Find the points (if any) where the line $y = x$ intersects $H$, giving exact coordinates. (3 marks)

${img("hyperbola.svg", "Hyperbola showing two branches with vertices at (±3, 0) and dashed asymptotes")}`,
    7, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* Vertices: $(\\pm 4, 0)$ since $a = 4$.
*Step 2 (1 mark):* Asymptotes: $y = \\pm \\dfrac{b}{a} x = \\pm \\dfrac{3}{4} x$.

**b. (2 marks)**
*Step 1 (1 mark):* Draw asymptotes as dashed lines through origin with gradients $\\pm 3/4$.
*Step 2 (1 mark):* Draw two branches opening horizontally, each touching its vertex at $(\\pm 4, 0)$ and approaching the asymptotes.

**c. (3 marks)**
*Step 1 (1 mark):* Substitute $y = x$: $\\dfrac{x^2}{16} - \\dfrac{x^2}{9} = 1$.
*Step 2 (1 mark):* Common denominator: $\\dfrac{9x^2 - 16x^2}{144} = 1 \\Rightarrow -7x^2 = 144 \\Rightarrow x^2 = -\\dfrac{144}{7}$.
*Step 3 (1 mark):* No real solutions — the line $y = x$ lies strictly between the asymptotes $y = \\pm \\dfrac{3}{4} x$ when viewed against $\\pm x$, but actually $|1| > 3/4$, so the line is steeper than the asymptotes and never reaches the hyperbola branches. The line and hyperbola do not intersect.`),

  sq(`Consider the curve given implicitly by $x^2 + 4y^2 - 4x + 8y + 4 = 0$.

**a.** By completing the square, rewrite the equation in the standard form $\\dfrac{(x - h)^2}{a^2} + \\dfrac{(y - k)^2}{b^2} = 1$. (3 marks)

**b.** Hence state the centre and the lengths of the semi-axes. (2 marks)

**c.** Find $\\dfrac{dy}{dx}$ at the point $(2, 0)$. (3 marks)

${img("ellipse-translated.svg", "Translated ellipse with centre at (2, -1)")}`,
    8, "HARD",
    `**a. (3 marks)**
*Step 1 (1 mark):* Group: $(x^2 - 4x) + 4(y^2 + 2y) + 4 = 0$.
*Step 2 (1 mark):* Complete squares: $(x - 2)^2 - 4 + 4(y + 1)^2 - 4 + 4 = 0 \\Rightarrow (x-2)^2 + 4(y+1)^2 = 4$.
*Step 3 (1 mark):* Divide by 4: $\\dfrac{(x - 2)^2}{4} + \\dfrac{(y + 1)^2}{1} = 1$.

**b. (2 marks)**
*Step 1 (1 mark):* Centre: $(2, -1)$.
*Step 2 (1 mark):* Semi-axes: $a = 2$ (along $x$-direction), $b = 1$ (along $y$-direction).

**c. (3 marks)**
*Step 1 (1 mark):* Implicit differentiate the original: $2x + 8y \\dfrac{dy}{dx} - 4 + 8 \\dfrac{dy}{dx} = 0$.
*Step 2 (1 mark):* Rearrange: $(8y + 8) \\dfrac{dy}{dx} = 4 - 2x \\Rightarrow \\dfrac{dy}{dx} = \\dfrac{4 - 2x}{8(y + 1)} = \\dfrac{2 - x}{4(y + 1)}$.
*Step 3 (1 mark):* At $(2, 0)$: $\\dfrac{dy}{dx} = \\dfrac{2 - 2}{4(0 + 1)} = 0$ — horizontal tangent at the top of the ellipse.`),
];

// ─── 3 EXT_RESP (Section B modelling-rich scenarios) ────────────────────

const extendedResponse: FR[] = [
  sq(`An astronomer models the orbit of a comet around the Sun as an ellipse with the Sun at one focus. Using a coordinate system in which the Sun is at the origin and the major axis of the ellipse lies along the $x$-axis, the orbit satisfies $\\dfrac{(x - 5)^2}{169} + \\dfrac{y^2}{144} = 1$, where $x$ and $y$ are in astronomical units (AU).

**a.** State the centre of the ellipse and the lengths of the semi-major and semi-minor axes. (2 marks)

**b.** Find the perihelion distance (closest approach to the Sun) by computing the smallest value of $\\sqrt{x^2 + y^2}$ subject to the constraint. You may use the fact that the closest point on the orbit to the Sun-focus lies on the major axis. (3 marks)

**c.** Find $\\dfrac{dy}{dx}$ at the point where the comet's $x$-coordinate is $5$ (i.e., directly above or below the centre). (3 marks)

**d.** Verify your answer to part **c** by considering the geometric meaning of the tangent at the endpoints of the minor axis. (2 marks)

${img("ellipse-translated.svg", "Translated ellipse with marked centre")}`,
    10, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* Centre: $(5, 0)$.
*Step 2 (1 mark):* $a^2 = 169 \\Rightarrow a = 13$ (semi-major, horizontal). $b^2 = 144 \\Rightarrow b = 12$ (semi-minor).

**b. (3 marks)**
*Step 1 (1 mark):* Smallest $|x|$-distance from origin occurs on the major axis ($y = 0$): orbit cuts $y = 0$ at $x = 5 \\pm 13$, i.e. $x = -8$ or $x = 18$.
*Step 2 (1 mark):* Distances from origin: $|-8| = 8$ AU and $|18| = 18$ AU.
*Step 3 (1 mark):* Perihelion distance = $8$ AU.

**c. (3 marks)**
*Step 1 (1 mark):* Implicit differentiate: $\\dfrac{2(x - 5)}{169} + \\dfrac{2y}{144} \\cdot \\dfrac{dy}{dx} = 0$.
*Step 2 (1 mark):* Solve: $\\dfrac{dy}{dx} = -\\dfrac{144(x - 5)}{169 y}$.
*Step 3 (1 mark):* At $x = 5$: $\\dfrac{dy}{dx} = 0$ (the numerator vanishes).

**d. (2 marks)**
*Step 1 (1 mark):* When $x = 5$ (the $x$-coordinate of the centre), the curve passes through $(5, \\pm 12)$, the endpoints of the minor axis.
*Step 2 (1 mark):* The tangent to an ellipse at the endpoints of an axis is perpendicular to that axis; here it must be horizontal, so $\\dfrac{dy}{dx} = 0$ ✓.`),

  sq(`A reflecting cooling tower has a vertical cross-section in the shape of a hyperbola. With the centre of the tower at the origin, the cross-section satisfies $\\dfrac{x^2}{100} - \\dfrac{y^2}{225} = 1$, where $x$ is horizontal width (m) and $y$ is height above the narrowest point (m).

**a.** State the half-width of the tower at its narrowest point. (1 mark)

**b.** A ground-level inspection wall is located at $y = -30\\text{ m}$ (i.e., 30 m below the narrowest point). What is the half-width of the tower at this level? (3 marks)

**c.** Find the equations of the asymptotes and explain their physical meaning in this scenario. (2 marks)

**d.** Use implicit differentiation to find an expression for $\\dfrac{dy}{dx}$. (2 marks)

**e.** Compute the gradient of the curve at the point $(10, 0)$ and interpret. (2 marks)

${img("hyperbola.svg", "Cooling tower hyperbola cross-section")}`,
    10, "HARD",
    `**a. (1 mark)**
At the narrowest point ($y = 0$): $\\dfrac{x^2}{100} = 1 \\Rightarrow x = \\pm 10$. Half-width = $10$ m.

**b. (3 marks)**
*Step 1 (1 mark):* At $y = -30$: $\\dfrac{x^2}{100} - \\dfrac{900}{225} = 1$.
*Step 2 (1 mark):* $\\dfrac{x^2}{100} - 4 = 1 \\Rightarrow x^2 = 500$.
*Step 3 (1 mark):* $x = \\pm \\sqrt{500} = \\pm 10\\sqrt 5 \\approx 22.4$ m. Half-width = $10\\sqrt 5$ m.

**c. (2 marks)**
*Step 1 (1 mark):* Asymptotes: $y = \\pm \\dfrac{b}{a} x = \\pm \\dfrac{15}{10} x = \\pm \\dfrac{3}{2} x$.
*Step 2 (1 mark):* Physically, as one moves far from the narrowest point ($|y|$ large), the tower walls become approximately straight lines with slope $\\pm 3/2$.

**d. (2 marks)**
*Step 1 (1 mark):* Implicit derivative: $\\dfrac{2x}{100} - \\dfrac{2y}{225} \\dfrac{dy}{dx} = 0$.
*Step 2 (1 mark):* Solve: $\\dfrac{dy}{dx} = \\dfrac{225 x}{100 y} = \\dfrac{9x}{4y}$.

**e. (2 marks)**
*Step 1 (1 mark):* At $(10, 0)$, denominator is zero — the derivative is undefined.
*Step 2 (1 mark):* This means the tangent at the narrowest point $(10, 0)$ is vertical: the tower walls are momentarily vertical there.`),

  sq(`A ramp on a Cartesian coordinate plane is bounded by the ellipse $E:\\ \\dfrac{x^2}{25} + \\dfrac{y^2}{4} = 1$ in the upper half-plane ($y \\ge 0$), measured in metres.

**a.** Sketch the upper half of the ellipse, marking its endpoints on the $x$-axis. (2 marks)

**b.** Use implicit differentiation to find $\\dfrac{dy}{dx}$ in terms of $x$ and $y$. (2 marks)

**c.** Find the coordinates of the point $P$ on the upper half of $E$ where the tangent has gradient $-\\dfrac{1}{5}$. (4 marks)

**d.** A surveyor stands at the centre of the ellipse and wants to identify the steepest descent direction along the ramp. Explain why the gradient at $P$ in part **c** corresponds to a tangent line direction, and discuss whether the tangent direction $(-5, 1)/\\sqrt{26}$ aligns with steepest descent on the ramp. (4 marks)

${img("ellipse.svg", "Ellipse x²/25 + y²/4 = 1 upper half representing the ramp")}`,
    12, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* Endpoints at $(\\pm 5, 0)$ and top at $(0, 2)$.
*Step 2 (1 mark):* Sketch the upper-half curve: smooth arc from $(-5, 0)$ up to $(0, 2)$ and back down to $(5, 0)$.

**b. (2 marks)**
*Step 1 (1 mark):* $\\dfrac{2x}{25} + \\dfrac{2y}{4} \\dfrac{dy}{dx} = 0$.
*Step 2 (1 mark):* $\\dfrac{dy}{dx} = -\\dfrac{4x}{25 y}$.

**c. (4 marks)**
*Step 1 (1 mark):* Set $-\\dfrac{4x}{25 y} = -\\dfrac{1}{5} \\Rightarrow \\dfrac{4x}{25 y} = \\dfrac{1}{5} \\Rightarrow 20 x = 25 y \\Rightarrow y = \\dfrac{4x}{5}$.
*Step 2 (1 mark):* Substitute into ellipse equation: $\\dfrac{x^2}{25} + \\dfrac{(4x/5)^2}{4} = 1 \\Rightarrow \\dfrac{x^2}{25} + \\dfrac{16 x^2 / 25}{4} = 1$.
*Step 3 (1 mark):* $\\dfrac{x^2}{25} + \\dfrac{4 x^2}{25} = 1 \\Rightarrow \\dfrac{5 x^2}{25} = 1 \\Rightarrow x^2 = 5 \\Rightarrow x = \\pm \\sqrt 5$.
*Step 4 (1 mark):* For the upper half with gradient $-1/5 < 0$, take $x = \\sqrt 5 > 0$ (right half, downward slope). Then $y = \\dfrac{4\\sqrt 5}{5}$. So $P = \\left(\\sqrt 5,\\ \\dfrac{4\\sqrt 5}{5}\\right)$.

**d. (4 marks)**
*Step 1 (1 mark):* The gradient $\\dfrac{dy}{dx}$ at $P$ gives the slope of the tangent line to the curve, not motion along a surface. It tells us at $P$ a small horizontal step $dx$ produces vertical change $-\\dfrac{1}{5} dx$.
*Step 2 (1 mark):* The tangent direction $(-5, 1)/\\sqrt{26}$ has horizontal component $-5$ and vertical $+1$, corresponding to slope $-1/5$ ✓.
*Step 3 (1 mark):* "Steepest descent" along a curve means moving along the curve where $y$ decreases fastest; on a 1D curve there is only one tangent direction (and its reverse), so steepest descent is just the tangent direction with $dy < 0$.
*Step 4 (1 mark):* From $P$, the tangent direction with $dy < 0$ is $(5, -1)/\\sqrt{26}$ (the reverse of the given direction). The given direction $(-5, 1)/\\sqrt{26}$ actually moves *up* the ramp (toward the apex), not down. Steepest descent from $P$ along the curve points in $(5, -1)/\\sqrt{26}$.`),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to ${JSON_PATH}\n` +
    `Wrote ${Object.keys(figures).length} SVG files to ${FIGURES_DIR}/`,
);
