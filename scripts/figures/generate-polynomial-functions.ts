/**
 * Wave 1, batch 1: Polynomial Functions ext-resp questions.
 *
 * Generates 4 extended-response questions for the Polynomial Functions
 * subtopic, with embedded SVG diagrams produced by the svg.ts library.
 * Output: scripts/output/qset-methods-b2-polynomial-functions.json
 *
 * Usage:
 *   npx tsx scripts/figures/generate-polynomial-functions.ts
 */

import * as fs from "fs";
import * as path from "path";
import { functionPlot, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/polynomial-functions";
const JSON_PATH = "scripts/output/qset-methods-b2-polynomial-functions.json";

fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Diagrams ───────────────────────────────────────────────────────────

const fig1 = functionPlot({
  fn: (x) => x * x * (x - 2) ** 2,
  xRange: [-1, 3],
  yRange: [-0.5, 5],
  fnLabel: "f(x) = x²(x − 2)²",
  fnLabelAt: { x: -0.8, y: 4.5 },
  xTicks: [-1, 1, 2, 3],
  yTicks: [1, 2, 3, 4],
  markedPoints: [
    { x: 0, label: "(0, 0)" },
    { x: 1, label: "(1, 1)" },
    { x: 2, label: "(2, 0)" },
  ],
});

const fig2 = functionPlot({
  fn: (x) => x ** 3 - 3 * x ** 2 + 2,
  xRange: [-1.5, 3.5],
  yRange: [-3, 3],
  fnLabel: "f(x) = x³ − 3x² + a   (case a = 2)",
  fnLabelAt: { x: -1.3, y: 2.5 },
  xTicks: [-1, 1, 2, 3],
  yTicks: [-2, -1, 1, 2],
  markedPoints: [
    { x: 0, label: "(0, a) local max" },
    { x: 2, label: "(2, a−4) local min" },
  ],
});

const fig3 = functionPlot({
  fn: (x) => x ** 3 - 6 * x ** 2 + 9 * x,
  xRange: [-0.5, 4],
  yRange: [-1, 5],
  fnLabel: "y = x³ − 6x² + 9x",
  fnLabelAt: { x: 1.8, y: 4.5 },
  xTicks: [1, 2, 3],
  yTicks: [1, 2, 3, 4],
  shadedRange: { from: 0, to: 3, fill: "#dbeafe" },
  markedPoints: [
    { x: 1, label: "(1, 4)" },
    { x: 3, label: "(3, 0)" },
  ],
});

const fig4 = functionPlot({
  fn: (x) => (4 / 9) * (x + 1) ** 2 * (x - 3) ** 2 - 4,
  xRange: [-2.5, 4.5],
  yRange: [-5, 10],
  fnLabel: "f(x) = (4/9)(x+1)²(x−3)² − 4",
  fnLabelAt: { x: -2.3, y: 8 },
  xTicks: [-2, -1, 1, 2, 3, 4],
  yTicks: [-4, -2, 2, 4, 6, 8],
  markedPoints: [
    { x: -1, label: "(−1, −4)" },
    { x: 1, label: "local max" },
    { x: 3, label: "(3, −4)" },
  ],
});

const figures: Record<string, string> = {
  "quartic-w-shape.svg": fig1,
  "cubic-three-roots.svg": fig2,
  "cubic-tangent-shaded.svg": fig3,
  "quartic-two-minima.svg": fig4,
};

for (const [name, content] of Object.entries(figures)) {
  fs.writeFileSync(path.join(FIGURES_DIR, name), content);
}

const img = (name: string, alt: string): string =>
  `![${alt}](${toDataUri(figures[name])})`;

// ─── Questions ──────────────────────────────────────────────────────────

const questions = [
  {
    content: `Let $f(x) = x^4 - 4x^3 + 4x^2$ for $x \\in \\mathbb{R}$.

**a.** Show that $f(x) = x^2(x - 2)^2$. (1 mark)

**b.** State the x-intercepts and y-intercept of the graph of $f$. (2 marks)

**c.** Find $f'(x)$ and determine the coordinates of all stationary points. (4 marks)

**d.** Classify each stationary point using the second derivative test. (2 marks)

**e.** Sketch the graph of $f$ on the interval $[-1, 3]$, marking and labelling all stationary points and intercepts. (1 mark)

${img("quartic-w-shape.svg", "Graph of f(x) = x squared times (x minus 2) squared on the interval from -1 to 3, showing the characteristic W-shape with two local minima at (0, 0) and (2, 0), a local maximum at (1, 1), and rising values at the endpoints")}`,
    marks: 10,
    difficulty: "MEDIUM",
    solutionContent: `**a. (1 mark)** Expand and re-factor: $x^4 - 4x^3 + 4x^2 = x^2(x^2 - 4x + 4) = x^2(x-2)^2$.

**b. (2 marks)**
*Step 1 (1 mark):* x-intercepts: $x^2(x-2)^2 = 0 \\Rightarrow x = 0$ or $x = 2$ (both are repeated roots).
*Step 2 (1 mark):* y-intercept: $f(0) = 0$.

**c. (4 marks)**
*Step 1 (1 mark):* $f'(x) = 4x^3 - 12x^2 + 8x$.
*Step 2 (1 mark):* Factor: $f'(x) = 4x(x^2 - 3x + 2) = 4x(x-1)(x-2)$.
*Step 3 (1 mark):* $f'(x) = 0 \\Rightarrow x = 0, 1, 2$.
*Step 4 (1 mark):* Evaluate $f$: $f(0) = 0$, $f(1) = 1$, $f(2) = 0$. Stationary points: $(0, 0)$, $(1, 1)$, $(2, 0)$.

**d. (2 marks)**
*Step 1 (1 mark):* $f''(x) = 12x^2 - 24x + 8$.
*Step 2 (1 mark):* $f''(0) = 8 > 0$ (local min); $f''(1) = -4 < 0$ (local max); $f''(2) = 8 > 0$ (local min).

**e. (1 mark)** Sketch shows a W-shape: local minima at $(0, 0)$ and $(2, 0)$ touching the x-axis, local maximum at $(1, 1)$ between them, and the curve rising to $f(-1) = 9$ at the left endpoint and $f(3) = 9$ at the right endpoint.`,
    subtopicSlugs: ["polynomial-functions", "stationary-points-and-curve-sketching"],
  },

  {
    content: `Let $f(x) = x^3 - 3x^2 + a$, where $a$ is a real constant.

**a.** Find $f'(x)$. (1 mark)

**b.** Find the coordinates of the stationary points of the graph of $f$, in terms of $a$. (3 marks)

**c.** Use the second derivative test to classify each stationary point. (2 marks)

**d.** Find the values of $a$ for which the graph of $f$ has:

  **i.** exactly three x-intercepts (2 marks)

  **ii.** exactly one x-intercept (2 marks)

${img("cubic-three-roots.svg", "Graph of f(x) = x cubed minus 3 x squared plus a for the case a = 2, showing a local maximum at (0, 2) and a local minimum at (2, -2), with three x-intercepts")}`,
    marks: 10,
    difficulty: "MEDIUM",
    solutionContent: `**a. (1 mark)** $f'(x) = 3x^2 - 6x$.

**b. (3 marks)**
*Step 1 (1 mark):* $f'(x) = 0 \\Rightarrow 3x(x - 2) = 0 \\Rightarrow x = 0$ or $x = 2$.
*Step 2 (1 mark):* $f(0) = a$, so one stationary point is $(0, a)$.
*Step 3 (1 mark):* $f(2) = 8 - 12 + a = a - 4$, so the other is $(2, a - 4)$.

**c. (2 marks)**
*Step 1 (1 mark):* $f''(x) = 6x - 6$.
*Step 2 (1 mark):* $f''(0) = -6 < 0$ so $(0, a)$ is a local maximum; $f''(2) = 6 > 0$ so $(2, a-4)$ is a local minimum.

**d. (4 marks)**

**i. (2 marks)** Three x-intercepts requires the local maximum above the x-axis AND the local minimum below: $a > 0$ AND $a - 4 < 0$, i.e. $0 < a < 4$.

**ii. (2 marks)** One x-intercept requires either the local max below the axis ($a < 0$) OR the local min above ($a - 4 > 0$, i.e. $a > 4$). So $a < 0$ or $a > 4$.`,
    subtopicSlugs: ["polynomial-functions", "polynomial-equations", "stationary-points-and-curve-sketching"],
  },

  {
    content: `Consider the curve with equation $y = x^3 - 6x^2 + 9x$.

**a.** Show that the curve can be written in the factored form $y = x(x - 3)^2$. (2 marks)

**b.** Find the coordinates of the local maximum and the local minimum of the curve. (4 marks)

**c.** Find the equation of the tangent to the curve at the point where $x = 2$. (3 marks)

**d.** Find the area of the region enclosed by the curve and the x-axis between $x = 0$ and $x = 3$. (3 marks)

${img("cubic-tangent-shaded.svg", "Graph of y = x cubed minus 6 x squared plus 9 x, showing the local maximum at (1, 4), the local minimum at (3, 0), and the shaded region between the curve and the x-axis from x = 0 to x = 3")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* Factor out $x$: $y = x(x^2 - 6x + 9)$.
*Step 2 (1 mark):* Recognise $x^2 - 6x + 9 = (x - 3)^2$, so $y = x(x - 3)^2$.

**b. (4 marks)**
*Step 1 (1 mark):* $\\frac{dy}{dx} = 3x^2 - 12x + 9$.
*Step 2 (1 mark):* Factor: $\\frac{dy}{dx} = 3(x^2 - 4x + 3) = 3(x - 1)(x - 3)$. Stationary points at $x = 1$ and $x = 3$.
*Step 3 (1 mark):* $y(1) = 1 - 6 + 9 = 4$; $y(3) = 27 - 54 + 27 = 0$. So points are $(1, 4)$ and $(3, 0)$.
*Step 4 (1 mark):* $\\frac{d^2 y}{dx^2} = 6x - 12$. At $x = 1$: $-6 < 0$ (local max). At $x = 3$: $6 > 0$ (local min). Local maximum $(1, 4)$, local minimum $(3, 0)$.

**c. (3 marks)**
*Step 1 (1 mark):* At $x = 2$: $y(2) = 8 - 24 + 18 = 2$.
*Step 2 (1 mark):* Slope: $y'(2) = 12 - 24 + 9 = -3$.
*Step 3 (1 mark):* Tangent: $y - 2 = -3(x - 2)$, i.e. $y = -3x + 8$.

**d. (3 marks)**
*Step 1 (1 mark):* The curve lies on or above the x-axis on $[0, 3]$ (since $y = x(x-3)^2 \\geq 0$ there). So the area is $\\int_0^3 (x^3 - 6x^2 + 9x)\\, dx$.
*Step 2 (1 mark):* Antiderivative: $\\frac{x^4}{4} - 2x^3 + \\frac{9x^2}{2}$.
*Step 3 (1 mark):* Evaluate: $\\left[\\frac{81}{4} - 54 + \\frac{81}{2}\\right] - 0 = \\frac{81}{4} + \\frac{162}{4} - \\frac{216}{4} = \\frac{27}{4}$ square units.`,
    subtopicSlugs: ["polynomial-functions", "tangents-and-normals", "area-under-curves"],
  },

  {
    content: `A quartic function $f$ has local minima at the points $(-1, -4)$ and $(3, -4)$, and the graph of $f$ passes through the origin.

**a.** Show that the polynomial $g(x) = f(x) + 4$ has double zeros at $x = -1$ and $x = 3$. (2 marks)

**b.** Hence write $f(x)$ in the form $a(x + 1)^2(x - 3)^2 + c$, and determine the values of $a$ and $c$. (4 marks)

**c.** Find the coordinates of the local maximum of $f$. (3 marks)

**d.** Find all x-intercepts of the graph of $f$, giving exact answers. (3 marks)

${img("quartic-two-minima.svg", "Graph of the quartic f(x) = (4/9)(x+1) squared (x-3) squared minus 4, showing two local minima at (-1, -4) and (3, -4), a local maximum at x = 1, and the curve passing through the origin")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* At $x = -1$, $f(-1) = -4$, so $g(-1) = f(-1) + 4 = 0$. Since $f$ has a local minimum at $x = -1$, $f'(-1) = 0$, hence $g'(-1) = 0$. So $x = -1$ is a double zero of $g$.
*Step 2 (1 mark):* Same argument at $x = 3$: $g(3) = 0$ and $g'(3) = 0$, so $x = 3$ is a double zero of $g$.

**b. (4 marks)**
*Step 1 (1 mark):* Since $g(x) = f(x) + 4$ is a quartic with double zeros at $-1$ and $3$, $g(x) = a(x + 1)^2(x - 3)^2$ for some constant $a$, so $f(x) = a(x + 1)^2(x - 3)^2 - 4$ (giving $c = -4$).
*Step 2 (1 mark):* Use $f(0) = 0$: $a(1)^2(-3)^2 - 4 = 0$.
*Step 3 (1 mark):* $9a = 4 \\Rightarrow a = \\dfrac{4}{9}$.
*Step 4 (1 mark):* So $f(x) = \\dfrac{4}{9}(x + 1)^2(x - 3)^2 - 4$, with $a = \\dfrac{4}{9}$ and $c = -4$.

**c. (3 marks)**
*Step 1 (1 mark):* By the symmetry of $(x+1)^2(x-3)^2$ about $x = 1$, the local maximum is at $x = 1$.
*Step 2 (1 mark):* $f(1) = \\dfrac{4}{9}(2)^2(-2)^2 - 4 = \\dfrac{4}{9} \\cdot 16 - 4 = \\dfrac{64}{9} - \\dfrac{36}{9} = \\dfrac{28}{9}$.
*Step 3 (1 mark):* Local maximum at $\\left(1, \\dfrac{28}{9}\\right)$.

**d. (3 marks)**
*Step 1 (1 mark):* Set $f(x) = 0$: $\\dfrac{4}{9}(x + 1)^2(x - 3)^2 = 4 \\Rightarrow (x + 1)^2(x - 3)^2 = 9$, so $|(x + 1)(x - 3)| = 3$.
*Step 2 (1 mark):* Case 1: $(x + 1)(x - 3) = -3 \\Rightarrow x^2 - 2x - 3 = -3 \\Rightarrow x^2 - 2x = 0 \\Rightarrow x = 0$ or $x = 2$.
*Step 3 (1 mark):* Case 2: $(x + 1)(x - 3) = 3 \\Rightarrow x^2 - 2x - 6 = 0 \\Rightarrow x = 1 \\pm \\sqrt{7}$. So x-intercepts: $0$, $2$, $1 - \\sqrt{7}$, $1 + \\sqrt{7}$.`,
    subtopicSlugs: ["polynomial-functions", "polynomial-equations"],
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

console.log(
  `Wrote ${questions.length} ext-resp questions to ${JSON_PATH}\n` +
  `Wrote ${Object.keys(figures).length} SVG files to ${FIGURES_DIR}/`,
);

const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
const diffCounts = questions.reduce(
  (acc, q) => ({ ...acc, [q.difficulty]: (acc[q.difficulty as keyof typeof acc] || 0) + 1 }),
  { EASY: 0, MEDIUM: 0, HARD: 0 } as Record<string, number>,
);
console.log(
  `Total marks: ${totalMarks} | Difficulty: ${JSON.stringify(diffCounts)}`,
);
