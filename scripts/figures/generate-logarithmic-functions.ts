/**
 * Wave 1, batch 5: Logarithmic Functions ext-resp questions.
 *
 * 4 extended-response questions for the Logarithmic Functions subtopic.
 * Output: scripts/output/qset-methods-b2-logarithmic-functions.json
 *
 * Usage:
 *   npx tsx scripts/figures/generate-logarithmic-functions.ts
 */

import * as fs from "fs";
import * as path from "path";
import { functionPlot, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/logarithmic-functions";
const JSON_PATH = "scripts/output/qset-methods-b2-logarithmic-functions.json";

fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Diagrams ───────────────────────────────────────────────────────────

const fig1 = functionPlot({
  fn: (x) => Math.log(x + 2) - 1,
  xRange: [-1.95, 5],
  yRange: [-3, 2],
  fnLabel: "f(x) = ln(x + 2) − 1",
  fnLabelAt: { x: 1.5, y: 1.5 },
  xTicks: [-1, 1, 2, 3, 4],
  yTicks: [-2, -1, 1],
  markedPoints: [
    { x: Math.E - 2, label: "(e − 2, 0)" },
    { x: 0, label: "(0, ln 2 − 1)" },
  ],
});

const fig2 = functionPlot({
  fn: (x) => Math.log(x) - x + 2,
  xRange: [0.05, 5],
  yRange: [-3, 2],
  fnLabel: "h(x) = ln(x) − x + 2",
  fnLabelAt: { x: 2.2, y: 1.5 },
  xTicks: [1, 2, 3, 4],
  yTicks: [-2, -1, 1],
  markedPoints: [{ x: 1, label: "(1, 1) max" }],
});

const fig3 = functionPlot({
  fn: (x) => x * Math.log(x),
  xRange: [0.01, Math.E + 0.1],
  yRange: [-0.5, 3],
  fnLabel: "f(x) = x ln(x)",
  fnLabelAt: { x: 0.7, y: 2.5 },
  xTicks: [1, 2, Number(Math.E.toFixed(4))],
  yTicks: [1, 2],
  shadedRange: { from: 1, to: Math.E, fill: "#dbeafe" },
  markedPoints: [
    { x: 1 / Math.E, label: "(1/e, −1/e) min" },
    { x: 1, label: "(1, 0)" },
  ],
});

const fig4 = functionPlot({
  fn: (x) => Math.log(2 * x - 6) + 3,
  xRange: [3.05, 10],
  yRange: [-1, 6],
  fnLabel: "g(x) = ln(2x − 6) + 3",
  fnLabelAt: { x: 5.5, y: 5.5 },
  xTicks: [4, 5, 6, 7, 8, 9, 10],
  yTicks: [1, 2, 3, 4, 5],
  markedPoints: [
    { x: 3 + Math.exp(-3) / 2, label: "x-intercept" },
    { x: 4, label: "(4, ln 2 + 3)" },
  ],
});

const figures: Record<string, string> = {
  "log-shifted.svg": fig1,
  "log-minus-x.svg": fig2,
  "x-times-lnx.svg": fig3,
  "log-transformed.svg": fig4,
};

for (const [name, content] of Object.entries(figures)) {
  fs.writeFileSync(path.join(FIGURES_DIR, name), content);
}

const img = (name: string, alt: string): string =>
  `![${alt}](${toDataUri(figures[name])})`;

// ─── Questions ──────────────────────────────────────────────────────────

const questions = [
  {
    content: `Let $f(x) = \\log_e(x + 2) - 1$ for $x > -2$.

**a.** State the domain and range of $f$. (2 marks)

**b.** Find the exact $x$-intercept of the graph of $f$. (2 marks)

**c.** Find the exact $y$-intercept of the graph of $f$. (1 mark)

**d.** State the equation of the vertical asymptote of the graph of $f$. (1 mark)

**e.** Find the inverse function $f^{-1}(x)$, and state its domain and range. (4 marks)

${img("log-shifted.svg", "Graph of f(x) = ln(x + 2) minus 1 for x greater than negative 2, showing the vertical asymptote at x = negative 2 and the curve crossing the x-axis at x = e minus 2")}`,
    marks: 10,
    difficulty: "MEDIUM",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* Domain: from $x + 2 > 0$, $x > -2$ (i.e. $(-2, \\infty)$).
*Step 2 (1 mark):* Range: $\\mathbb{R}$ (since $\\ln$ takes all real values).

**b. (2 marks)**
*Step 1 (1 mark):* Set $f(x) = 0$: $\\ln(x + 2) = 1$.
*Step 2 (1 mark):* $x + 2 = e \\Rightarrow x = e - 2$.

**c. (1 mark)** $f(0) = \\ln 2 - 1$.

**d. (1 mark)** $x = -2$.

**e. (4 marks)**
*Step 1 (1 mark):* Let $y = \\ln(x + 2) - 1$. Add 1: $y + 1 = \\ln(x + 2)$.
*Step 2 (1 mark):* Exponentiate: $e^{y+1} = x + 2$, so $x = e^{y+1} - 2$.
*Step 3 (1 mark):* Swap variables: $f^{-1}(x) = e^{x+1} - 2$.
*Step 4 (1 mark):* Domain of $f^{-1} = $ range of $f = \\mathbb{R}$; range of $f^{-1} = $ domain of $f = (-2, \\infty)$.`,
    subtopicSlugs: ["logarithmic-functions", "inverse-functions", "exponential-functions"],
  },

  {
    content: `Let $h(x) = \\log_e(x) - x + 2$ for $x > 0$.

**a.** Find $h(1)$. (1 mark)

**b.** Find $h'(x)$, and use it to find the coordinates of the stationary point of $h$. (4 marks)

**c.** Use the second derivative test to classify the stationary point. (2 marks)

**d.** State the value of $\\displaystyle\\lim_{x \\to 0^+} h(x)$. (1 mark)

**e.** State the value of $\\displaystyle\\lim_{x \\to \\infty} h(x)$, briefly justifying your answer. (1 mark)

**f.** Hence sketch the graph of $h$ on $(0, 5]$, marking the stationary point. (2 marks)

${img("log-minus-x.svg", "Graph of h(x) = ln(x) minus x plus 2 for x greater than 0, showing a local maximum at (1, 1) with the curve decreasing to negative infinity at both ends")}`,
    marks: 11,
    difficulty: "MEDIUM",
    solutionContent: `**a. (1 mark)** $h(1) = \\ln(1) - 1 + 2 = 0 - 1 + 2 = 1$.

**b. (4 marks)**
*Step 1 (1 mark):* $h'(x) = \\dfrac{1}{x} - 1$.
*Step 2 (1 mark):* Set $h'(x) = 0$: $\\dfrac{1}{x} = 1$.
*Step 3 (1 mark):* $x = 1$.
*Step 4 (1 mark):* $h(1) = 1$, so the stationary point is $(1, 1)$.

**c. (2 marks)**
*Step 1 (1 mark):* $h''(x) = -\\dfrac{1}{x^2}$.
*Step 2 (1 mark):* $h''(1) = -1 < 0$, so $(1, 1)$ is a local maximum.

**d. (1 mark)** As $x \\to 0^+$, $\\ln(x) \\to -\\infty$ while $-x + 2 \\to 2$, so $h(x) \\to -\\infty$.

**e. (1 mark)** As $x \\to \\infty$, the $-x$ term dominates $\\ln(x)$ (since $x$ grows faster than $\\ln x$), so $h(x) \\to -\\infty$.

**f. (2 marks)**
*Step 1 (1 mark):* The curve rises from $-\\infty$ (as $x \\to 0^+$) to the maximum $(1, 1)$.
*Step 2 (1 mark):* Then falls to $-\\infty$ as $x \\to \\infty$. At $x = 5$: $h(5) = \\ln 5 - 3 \\approx -1.39$.`,
    subtopicSlugs: ["logarithmic-functions", "differentiation", "stationary-points-and-curve-sketching"],
  },

  {
    content: `Let $f(x) = x \\log_e(x)$ for $x > 0$. You may assume that $\\displaystyle\\lim_{x \\to 0^+} f(x) = 0$.

**a.** Find $f'(x)$ using the product rule. (2 marks)

**b.** Find the exact coordinates of the stationary point of $f$. (3 marks)

**c.** Classify the stationary point. (2 marks)

**d.** Show that $G(x) = \\dfrac{x^2}{2} \\log_e(x) - \\dfrac{x^2}{4}$ satisfies $G'(x) = x \\log_e(x)$. (3 marks)

**e.** Hence find, in exact form, the area enclosed between the curve $y = f(x)$ and the $x$-axis on the interval $[1, e]$. (2 marks)

${img("x-times-lnx.svg", "Graph of f(x) = x ln(x) for x in (0, e], showing the local minimum at (1/e, -1/e), the x-intercept at (1, 0), and the shaded region between the curve and the x-axis from x = 1 to x = e")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* Product rule on $u(x) = x$ and $v(x) = \\ln(x)$: $u'v + uv' = 1 \\cdot \\ln(x) + x \\cdot \\dfrac{1}{x}$.
*Step 2 (1 mark):* $f'(x) = \\ln(x) + 1$.

**b. (3 marks)**
*Step 1 (1 mark):* Set $f'(x) = 0$: $\\ln(x) = -1$.
*Step 2 (1 mark):* $x = e^{-1} = \\dfrac{1}{e}$.
*Step 3 (1 mark):* $f\\left(\\dfrac{1}{e}\\right) = \\dfrac{1}{e} \\cdot \\ln\\left(\\dfrac{1}{e}\\right) = \\dfrac{1}{e} \\cdot (-1) = -\\dfrac{1}{e}$. Stationary point: $\\left(\\dfrac{1}{e}, -\\dfrac{1}{e}\\right)$.

**c. (2 marks)**
*Step 1 (1 mark):* $f''(x) = \\dfrac{1}{x}$.
*Step 2 (1 mark):* $f''(1/e) = e > 0$, so this is a local minimum.

**d. (3 marks)**
*Step 1 (1 mark):* Differentiate the first term using the product rule: $\\dfrac{d}{dx}\\left[\\dfrac{x^2}{2} \\ln(x)\\right] = x \\ln(x) + \\dfrac{x^2}{2} \\cdot \\dfrac{1}{x} = x \\ln(x) + \\dfrac{x}{2}$.
*Step 2 (1 mark):* Differentiate the second term: $\\dfrac{d}{dx}\\left[-\\dfrac{x^2}{4}\\right] = -\\dfrac{x}{2}$.
*Step 3 (1 mark):* Sum: $G'(x) = x \\ln(x) + \\dfrac{x}{2} - \\dfrac{x}{2} = x \\ln(x)$. ✓

**e. (2 marks)**
*Step 1 (1 mark):* On $[1, e]$, $f(x) = x \\ln(x) \\geq 0$, so area $= G(e) - G(1)$. $G(e) = \\dfrac{e^2}{2} \\cdot 1 - \\dfrac{e^2}{4} = \\dfrac{e^2}{4}$; $G(1) = \\dfrac{1}{2} \\cdot 0 - \\dfrac{1}{4} = -\\dfrac{1}{4}$.
*Step 2 (1 mark):* Area $= \\dfrac{e^2}{4} - \\left(-\\dfrac{1}{4}\\right) = \\dfrac{e^2 + 1}{4}$ square units.`,
    subtopicSlugs: ["logarithmic-functions", "differentiation", "product-rule", "area-under-curves"],
  },

  {
    content: `Let $g(x) = \\log_e(2x - 6) + 3$.

**a.** State the maximal domain and range of $g$. (2 marks)

**b.** State the equation of the vertical asymptote of the graph of $g$. (1 mark)

**c.** Find the exact $x$-intercept of the graph of $g$. (3 marks)

**d.** The graph of $g$ can be obtained from the graph of $y = \\log_e(x)$ by a sequence of three transformations. State the transformations in the correct order. (3 marks)

**e.** Find $g'(x)$. (2 marks)

**f.** Find the equation of the tangent to the graph of $g$ at the point where $x = 4$. (1 mark)

${img("log-transformed.svg", "Graph of g(x) = ln(2x - 6) + 3 for x greater than 3, showing the vertical asymptote at x = 3 and the curve passing through (4, ln 2 + 3) and continuing upward")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* Need $2x - 6 > 0$, i.e. $x > 3$. Domain: $(3, \\infty)$.
*Step 2 (1 mark):* Range: $\\mathbb{R}$.

**b. (1 mark)** $x = 3$ (where the argument of $\\ln$ approaches $0$).

**c. (3 marks)**
*Step 1 (1 mark):* Set $g(x) = 0$: $\\ln(2x - 6) = -3$.
*Step 2 (1 mark):* $2x - 6 = e^{-3}$.
*Step 3 (1 mark):* $x = \\dfrac{6 + e^{-3}}{2} = 3 + \\dfrac{1}{2 e^3}$.

**d. (3 marks)** Starting from $y = \\ln(x)$:
*Step 1 (1 mark):* Dilation by factor $\\dfrac{1}{2}$ from the $y$-axis (i.e. horizontal compression by factor 2): $y = \\ln(2x)$.
*Step 2 (1 mark):* Translation $3$ units to the right: $y = \\ln(2(x - 3)) = \\ln(2x - 6)$.
*Step 3 (1 mark):* Translation $3$ units up: $y = \\ln(2x - 6) + 3$.

**e. (2 marks)**
*Step 1 (1 mark):* Chain rule: $g'(x) = \\dfrac{1}{2x - 6} \\cdot 2 = \\dfrac{2}{2x - 6}$.
*Step 2 (1 mark):* Simplify: $g'(x) = \\dfrac{1}{x - 3}$.

**f. (1 mark)** $g(4) = \\ln 2 + 3$ and $g'(4) = 1$. Tangent: $y - (\\ln 2 + 3) = 1 \\cdot (x - 4)$, i.e. $y = x - 1 + \\ln 2$.`,
    subtopicSlugs: ["logarithmic-functions", "transformations", "tangents-and-normals", "chain-rule"],
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
