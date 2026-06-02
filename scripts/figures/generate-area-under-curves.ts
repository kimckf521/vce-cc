/**
 * Wave 1, batch 7: Area Under Curves ext-resp questions.
 *
 * 4 extended-response questions for the Area Under Curves subtopic.
 * First batch to use the new `additionalFns` and `shadeBetween` library
 * options (Q2: two curves with region between them shaded; Q4: curve plus
 * tangent line).
 *
 * Output: scripts/output/qset-methods-b2-area-under-curves.json
 *
 * Usage:
 *   npx tsx scripts/figures/generate-area-under-curves.ts
 */

import * as fs from "fs";
import * as path from "path";
import { functionPlot, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/area-under-curves";
const JSON_PATH = "scripts/output/qset-methods-b2-area-under-curves.json";

fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Diagrams ───────────────────────────────────────────────────────────

const fig1 = functionPlot({
  fn: (x) => 4 * x - x * x,
  xRange: [-0.5, 4.5],
  yRange: [-1, 5],
  fnLabel: "y = 4x − x²",
  fnLabelAt: { x: 2.4, y: 4.5 },
  xTicks: [1, 2, 3, 4],
  yTicks: [1, 2, 3, 4],
  shadedRange: { from: 0, to: 4, fill: "#dbeafe" },
  markedPoints: [
    { x: 0, label: "(0, 0)" },
    { x: 4, label: "(4, 0)" },
  ],
});

const fig2 = functionPlot({
  fn: (x) => x * x,
  xRange: [-0.5, 3],
  yRange: [-0.5, 6],
  fnLabel: "y = x²",
  fnLabelAt: { x: 2.2, y: 5.2 },
  xTicks: [1, 2, 3],
  yTicks: [1, 2, 3, 4, 5],
  shadeBetween: {
    fn2: (x) => 2 * x,
    from: 0,
    to: 2,
    fill: "#dbeafe",
  },
  additionalFns: [
    {
      fn: (x) => 2 * x,
      color: "#16a34a",
      label: "y = 2x",
      labelAt: { x: 1.4, y: 3.5 },
    },
  ],
  markedPoints: [
    { x: 0, label: "(0, 0)" },
    { x: 2, label: "(2, 4)" },
  ],
});

const fig3 = functionPlot({
  fn: (t) => 3 * t * t - 12 * t + 9,
  xRange: [0, 5],
  yRange: [-5, 25],
  fnLabel: "v(t) = 3t² − 12t + 9",
  fnLabelAt: { x: 2, y: 22 },
  xLabel: "t (s)",
  yLabel: "v (m/s)",
  xTicks: [1, 2, 3, 4, 5],
  yTicks: [-3, 5, 10, 15, 20, 24],
  markedPoints: [
    { x: 1, label: "(1, 0)" },
    { x: 3, label: "(3, 0)" },
    { x: 5, label: "(5, 24)" },
  ],
  color: "#7c3aed",
});

const fig4 = functionPlot({
  fn: (x) => x * x,
  xRange: [-0.5, 3],
  yRange: [-3, 6],
  fnLabel: "y = x²",
  fnLabelAt: { x: -0.4, y: 5.5 },
  xTicks: [1, 2, 3],
  yTicks: [-2, 2, 4],
  tangentAt: { x: 2, color: "#16a34a" },
  markedPoints: [
    { x: 2, label: "P(2, 4)" },
  ],
});

const figures: Record<string, string> = {
  "parabola-area.svg": fig1,
  "between-curves.svg": fig2,
  "velocity-signed.svg": fig3,
  "tangent-and-curve.svg": fig4,
};

for (const [name, content] of Object.entries(figures)) {
  fs.writeFileSync(path.join(FIGURES_DIR, name), content);
}

const img = (name: string, alt: string): string =>
  `![${alt}](${toDataUri(figures[name])})`;

// ─── Questions ──────────────────────────────────────────────────────────

const questions = [
  {
    content: `Consider the function $f(x) = 4x - x^2$.

**a.** Find the $x$-intercepts of the graph of $f$. (2 marks)

**b.** Sketch the graph of $f$ on the interval $[0, 4]$ and shade the region enclosed between the graph and the $x$-axis. (2 marks)

**c.** Find the exact area of the region enclosed between $f$ and the $x$-axis. (3 marks)

**d.** Find the average value of $f$ on the interval $[0, 4]$. (3 marks)

${img("parabola-area.svg", "Graph of y = 4x - x squared on the interval from x = 0 to x = 4, showing the parabola with the region between the curve and the x-axis shaded")}`,
    marks: 10,
    difficulty: "MEDIUM",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* Factor: $4x - x^2 = x(4 - x)$.
*Step 2 (1 mark):* $x(4 - x) = 0 \\Rightarrow x = 0$ or $x = 4$.

**b. (2 marks)**
*Step 1 (1 mark):* The graph is a downward-opening parabola with roots at $0$ and $4$ and vertex at $(2, 4)$.
*Step 2 (1 mark):* The enclosed region lies between the curve (above) and the $x$-axis (below) for $0 \\leq x \\leq 4$.

**c. (3 marks)**
*Step 1 (1 mark):* Since $f(x) \\geq 0$ on $[0, 4]$, area $= \\displaystyle\\int_0^4 (4x - x^2)\\, dx$.
*Step 2 (1 mark):* Antiderivative: $2x^2 - \\dfrac{x^3}{3}$.
*Step 3 (1 mark):* Evaluate: $\\left[2(16) - \\dfrac{64}{3}\\right] - 0 = 32 - \\dfrac{64}{3} = \\dfrac{96 - 64}{3} = \\dfrac{32}{3}$ square units.

**d. (3 marks)**
*Step 1 (1 mark):* Average value formula: $\\bar{f} = \\dfrac{1}{b - a}\\displaystyle\\int_a^b f(x)\\, dx$.
*Step 2 (1 mark):* $\\bar{f} = \\dfrac{1}{4 - 0} \\cdot \\dfrac{32}{3}$.
*Step 3 (1 mark):* $\\bar{f} = \\dfrac{32}{12} = \\dfrac{8}{3}$.`,
    subtopicSlugs: ["area-under-curves", "polynomial-functions", "definite-integrals"],
  },

  {
    content: `Consider the curves $y = x^2$ and $y = 2x$.

**a.** Find the coordinates of the points of intersection of the two curves. (3 marks)

**b.** Sketch both curves on the same set of axes, showing clearly the region enclosed between them. (1 mark)

**c.** Find the exact area of the region enclosed between the two curves. (4 marks)

**d.** Find the area of the region bounded by the line $y = 2x$, the $y$-axis, and the horizontal line $y = 4$. (3 marks)

${img("between-curves.svg", "Graphs of y = x squared (red curve) and y = 2x (green straight line) on the same axes, showing the two curves intersecting at (0, 0) and (2, 4) with the enclosed region between them shaded")}`,
    marks: 11,
    difficulty: "MEDIUM",
    solutionContent: `**a. (3 marks)**
*Step 1 (1 mark):* Set $x^2 = 2x$.
*Step 2 (1 mark):* $x^2 - 2x = 0 \\Rightarrow x(x - 2) = 0$, so $x = 0$ or $x = 2$.
*Step 3 (1 mark):* Substitute to find $y$: $(0, 0)$ and $(2, 4)$.

**b. (1 mark)** The line $y = 2x$ lies above the parabola $y = x^2$ on $0 < x < 2$ (since e.g. at $x = 1$, $2x = 2 > x^2 = 1$).

**c. (4 marks)**
*Step 1 (1 mark):* On $[0, 2]$, the upper curve is $y = 2x$ and the lower is $y = x^2$, so area $= \\displaystyle\\int_0^2 (2x - x^2)\\, dx$.
*Step 2 (1 mark):* Antiderivative: $x^2 - \\dfrac{x^3}{3}$.
*Step 3 (1 mark):* $\\left[4 - \\dfrac{8}{3}\\right] - 0 = \\dfrac{12 - 8}{3}$.
*Step 4 (1 mark):* Area $= \\dfrac{4}{3}$ square units.

**d. (3 marks)**
*Step 1 (1 mark):* The region is a triangle with vertices $(0, 0)$, $(0, 4)$, and $(2, 4)$. Alternatively, integrate $x = y/2$ from $y = 0$ to $y = 4$.
*Step 2 (1 mark):* Area $= \\displaystyle\\int_0^4 \\dfrac{y}{2}\\, dy = \\left[\\dfrac{y^2}{4}\\right]_0^4$.
*Step 3 (1 mark):* $= \\dfrac{16}{4} = 4$ square units.`,
    subtopicSlugs: ["area-under-curves", "polynomial-functions", "definite-integrals"],
  },

  {
    content: `A particle moves along a straight line with velocity $v(t)$ (in m/s) at time $t$ (in seconds) given by

$$v(t) = 3 t^2 - 12 t + 9, \\quad 0 \\leq t \\leq 5.$$

**a.** Find the times in $[0, 5]$ at which the particle is momentarily at rest. (3 marks)

**b.** Find the displacement of the particle from its initial position at $t = 5$ seconds. (3 marks)

**c.** Find the total distance travelled by the particle from $t = 0$ to $t = 5$ seconds. (4 marks)

**d.** Briefly explain why the displacement in part b differs from the total distance in part c. (2 marks)

${img("velocity-signed.svg", "Graph of velocity v(t) = 3t squared minus 12t plus 9 over 5 seconds, showing the curve crossing the t-axis at t = 1 and t = 3, with positive values on [0, 1] and [3, 5] and negative values on [1, 3]")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (3 marks)**
*Step 1 (1 mark):* Set $v(t) = 0$: $3 t^2 - 12 t + 9 = 0$.
*Step 2 (1 mark):* Divide by 3 and factor: $(t - 1)(t - 3) = 0$.
*Step 3 (1 mark):* $t = 1$ s or $t = 3$ s.

**b. (3 marks)**
*Step 1 (1 mark):* Displacement $= \\displaystyle\\int_0^5 v(t)\\, dt$.
*Step 2 (1 mark):* Antiderivative: $t^3 - 6 t^2 + 9 t$.
*Step 3 (1 mark):* Evaluate: $\\left[125 - 150 + 45\\right] - 0 = 20$ m.

**c. (4 marks)**
*Step 1 (1 mark):* Total distance $= \\displaystyle\\int_0^5 |v(t)|\\, dt$. Sign of $v$: positive on $[0, 1)$ and $(3, 5]$, negative on $(1, 3)$.
*Step 2 (1 mark):* $\\displaystyle\\int_0^1 v\\, dt = [t^3 - 6 t^2 + 9 t]_0^1 = 1 - 6 + 9 = 4$ m.
*Step 3 (1 mark):* $\\displaystyle\\int_1^3 v\\, dt = [t^3 - 6 t^2 + 9 t]_1^3 = (27 - 54 + 27) - 4 = -4$. So $\\displaystyle\\int_1^3 |v|\\, dt = 4$ m. And $\\displaystyle\\int_3^5 v\\, dt = (125 - 150 + 45) - 0 = 20$ m.
*Step 4 (1 mark):* Total distance $= 4 + 4 + 20 = 28$ m.

**d. (2 marks)**
*Step 1 (1 mark):* Displacement is the net change in position (a signed quantity), while total distance is the cumulative path length (always non-negative).
*Step 2 (1 mark):* Because the particle reverses direction between $t = 1$ and $t = 3$, some of the motion cancels out in the displacement calculation, making the total distance $(28$ m$)$ larger than the displacement $(20$ m$)$.`,
    subtopicSlugs: ["area-under-curves", "rates-of-change", "definite-integrals"],
  },

  {
    content: `Let $f(x) = x^2$ and let $P$ be the point $(2, 4)$ on the graph of $f$.

**a.** Find the equation of the tangent $T$ to the graph of $f$ at the point $P$. (3 marks)

**b.** Find the $x$-intercept of the tangent line $T$. (2 marks)

**c.** Sketch the graph of $f$ together with the tangent line $T$ on the same axes for $-0.5 \\leq x \\leq 3$, indicating the point $P$ and the $x$-intercept of $T$. (2 marks)

**d.** Find the exact area of the region enclosed by the curve $y = f(x)$, the tangent line $T$, and the $x$-axis. (5 marks)

${img("tangent-and-curve.svg", "Graph of y = x squared (red curve) with the tangent line (green) at the point P(2, 4), showing the curve and tangent meeting tangentially at P and the tangent line crossing the x-axis between 0 and 2")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (3 marks)**
*Step 1 (1 mark):* $f'(x) = 2x$.
*Step 2 (1 mark):* Slope at $P$: $f'(2) = 4$.
*Step 3 (1 mark):* Tangent: $y - 4 = 4(x - 2) \\Rightarrow y = 4x - 4$.

**b. (2 marks)**
*Step 1 (1 mark):* Set $y = 0$: $4x - 4 = 0$.
*Step 2 (1 mark):* $x = 1$, so the tangent meets the $x$-axis at $(1, 0)$.

**c. (2 marks)**
*Step 1 (1 mark):* The parabola $y = x^2$ passes through the origin and $(2, 4)$.
*Step 2 (1 mark):* The tangent meets the curve only at $P = (2, 4)$ and crosses the $x$-axis at $(1, 0)$. The enclosed region is bounded above by the curve, on the right by the tangent, and below by the $x$-axis.

**d. (5 marks)**
*Step 1 (1 mark):* For $0 \\leq x \\leq 1$, the region is bounded above by $y = x^2$ and below by $y = 0$.
*Step 2 (1 mark):* For $1 \\leq x \\leq 2$, the region is bounded above by $y = x^2$ and below by $y = 4x - 4$.
*Step 3 (1 mark):* Area $= \\displaystyle\\int_0^1 x^2\\, dx + \\displaystyle\\int_1^2 \\left(x^2 - (4x - 4)\\right)\\, dx = \\displaystyle\\int_0^1 x^2\\, dx + \\displaystyle\\int_1^2 (x - 2)^2\\, dx$.
*Step 4 (1 mark):* $\\displaystyle\\int_0^1 x^2\\, dx = \\dfrac{1}{3}$ and $\\displaystyle\\int_1^2 (x - 2)^2\\, dx = \\left[\\dfrac{(x - 2)^3}{3}\\right]_1^2 = 0 - \\left(-\\dfrac{1}{3}\\right) = \\dfrac{1}{3}$.
*Step 5 (1 mark):* Area $= \\dfrac{1}{3} + \\dfrac{1}{3} = \\dfrac{2}{3}$ square units.`,
    subtopicSlugs: ["area-under-curves", "tangents-and-normals", "definite-integrals"],
  },
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = {
  mcq: [],
  shortAnswer: [],
  extendedAnswer: [],
  extendedResponse: questions,
};

fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
const diffCounts = questions.reduce(
  (acc: Record<string, number>, q) => {
    acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
    return acc;
  },
  { EASY: 0, MEDIUM: 0, HARD: 0 },
);
console.log(
  `Wrote ${questions.length} ext-resp questions to ${JSON_PATH}\n` +
  `Wrote ${Object.keys(figures).length} SVG files to ${FIGURES_DIR}/\n` +
  `Total marks: ${totalMarks} | Difficulty: ${JSON.stringify(diffCounts)}`,
);
