/** Wave 1 batch 8: Stationary Points & Curve Sketching ext-resp. */
import * as fs from "fs";
import * as path from "path";
import { functionPlot, toDataUri } from "./svg";

const DIR = "scripts/output/figures/stationary-points";
const OUT = "scripts/output/qset-methods-b2-stationary-points-and-curve-sketching.json";
fs.mkdirSync(DIR, { recursive: true });

const fig1 = functionPlot({
  fn: (x) => x ** 3 - 3 * x ** 2 - 9 * x + 5,
  xRange: [-3, 5], yRange: [-25, 15],
  fnLabel: "f(x) = x³ − 3x² − 9x + 5", fnLabelAt: { x: -2.7, y: 13 },
  xTicks: [-2, -1, 1, 2, 3, 4], yTicks: [-20, -10, 10],
  markedPoints: [{ x: -1, label: "(−1, 10) max" }, { x: 3, label: "(3, −22) min" }],
});

const fig2 = functionPlot({
  fn: (x) => (x ** 2 - 4) ** 2,
  xRange: [-3, 3], yRange: [-2, 18],
  fnLabel: "f(x) = (x² − 4)²", fnLabelAt: { x: -2.8, y: 16 },
  xTicks: [-2, -1, 1, 2], yTicks: [4, 8, 12, 16],
  markedPoints: [{ x: -2, label: "(−2, 0)" }, { x: 0, label: "(0, 16) max" }, { x: 2, label: "(2, 0)" }],
});

const fig3 = functionPlot({
  fn: (x) => x + 1 / x,
  xRange: [0.2, 4], yRange: [-5, 6],
  fnLabel: "f(x) = x + 1/x", fnLabelAt: { x: 0.5, y: 5.3 },
  xTicks: [1, 2, 3], yTicks: [-4, -2, 2, 4],
  markedPoints: [{ x: 1, label: "(1, 2) min" }],
  asymptotes: [],
});

const fig4 = functionPlot({
  fn: (x) => x * Math.exp(-x),
  xRange: [-0.5, 5], yRange: [-0.3, 0.5],
  fnLabel: "f(x) = x e^(−x)", fnLabelAt: { x: 2.5, y: 0.45 },
  xTicks: [1, 2, 3, 4, 5], yTicks: [0.1, 0.2, 0.3, 0.4],
  markedPoints: [{ x: 1, label: "(1, 1/e) max" }, { x: 0, label: "(0, 0)" }],
  asymptotes: [{ y: 0, label: "y = 0" }],
});

const figs = { "cubic-max-min.svg": fig1, "quartic-touching.svg": fig2, "rational-min.svg": fig3, "x-times-exp-neg-x.svg": fig4 };
for (const [n, c] of Object.entries(figs)) fs.writeFileSync(path.join(DIR, n), c);
const img = (n: string, a: string) => `![${a}](${toDataUri(figs[n as keyof typeof figs])})`;

const questions = [
  {
    content: `Let $f(x) = x^3 - 3x^2 - 9x + 5$.

**a.** Find $f'(x)$. (1 mark)

**b.** Find the coordinates of all stationary points. (4 marks)

**c.** Use the second derivative test to classify each stationary point. (3 marks)

**d.** Sketch the graph on the interval $[-3, 5]$, marking the stationary points and y-intercept. (2 marks)

${img("cubic-max-min.svg", "Cubic graph f(x) = x cubed minus 3 x squared minus 9 x plus 5 showing local maximum at (-1, 10) and local minimum at (3, -22)")}`,
    marks: 10,
    difficulty: "MEDIUM",
    solutionContent: `**a. (1 mark)** $f'(x) = 3x^2 - 6x - 9 = 3(x^2 - 2x - 3) = 3(x - 3)(x + 1)$.

**b. (4 marks)**
*Step 1 (1 mark):* $f'(x) = 0 \\Rightarrow x = -1$ or $x = 3$.
*Step 2 (1 mark):* $f(-1) = -1 - 3 + 9 + 5 = 10$.
*Step 3 (1 mark):* $f(3) = 27 - 27 - 27 + 5 = -22$.
*Step 4 (1 mark):* Stationary points: $(-1, 10)$ and $(3, -22)$.

**c. (3 marks)**
*Step 1 (1 mark):* $f''(x) = 6x - 6$.
*Step 2 (1 mark):* $f''(-1) = -12 < 0$ ⇒ local maximum at $(-1, 10)$.
*Step 3 (1 mark):* $f''(3) = 12 > 0$ ⇒ local minimum at $(3, -22)$.

**d. (2 marks)**
*Step 1 (1 mark):* y-intercept: $f(0) = 5$.
*Step 2 (1 mark):* Sketch shows cubic rising to $(-1, 10)$, falling through $(0, 5)$ and through the x-axis between 0 and 3 (one root near $x \\approx 0.49$), down to $(3, -22)$, then rising.`,
    subtopicSlugs: ["stationary-points-and-curve-sketching", "polynomial-functions", "differentiation"],
  },
  {
    content: `Let $f(x) = (x^2 - 4)^2$.

**a.** Expand $f(x)$ and find $f'(x)$. (3 marks)

**b.** Find the coordinates of all stationary points. (4 marks)

**c.** Classify each stationary point. (3 marks)

**d.** Sketch the graph for $-3 \\leq x \\leq 3$, marking all stationary points and intercepts. (1 mark)

${img("quartic-touching.svg", "Quartic f(x) = (x squared minus 4) squared showing two local minima touching the x-axis at (-2, 0) and (2, 0), with a local maximum at (0, 16)")}`,
    marks: 11,
    difficulty: "MEDIUM",
    solutionContent: `**a. (3 marks)**
*Step 1 (1 mark):* $f(x) = x^4 - 8x^2 + 16$.
*Step 2 (1 mark):* $f'(x) = 4x^3 - 16x$.
*Step 3 (1 mark):* Factor: $f'(x) = 4x(x^2 - 4) = 4x(x - 2)(x + 2)$.

**b. (4 marks)**
*Step 1 (1 mark):* $f'(x) = 0 \\Rightarrow x = -2, 0, 2$.
*Step 2 (1 mark):* $f(-2) = 0$.
*Step 3 (1 mark):* $f(0) = 16$.
*Step 4 (1 mark):* $f(2) = 0$. Stationary points: $(-2, 0)$, $(0, 16)$, $(2, 0)$.

**c. (3 marks)**
*Step 1 (1 mark):* $f''(x) = 12x^2 - 16$.
*Step 2 (1 mark):* $f''(-2) = 32 > 0$ (min); $f''(2) = 32 > 0$ (min).
*Step 3 (1 mark):* $f''(0) = -16 < 0$ (max). So $(\\pm 2, 0)$ are minima; $(0, 16)$ is max.

**d. (1 mark)** Sketch shows symmetric W-like quartic touching the x-axis at $\\pm 2$, peaking at $(0, 16)$, opening upward.`,
    subtopicSlugs: ["stationary-points-and-curve-sketching", "polynomial-functions"],
  },
  {
    content: `Let $f(x) = x + \\dfrac{1}{x}$ for $x > 0$.

**a.** Find $f'(x)$ and $f''(x)$. (3 marks)

**b.** Find the exact coordinates of the stationary point of $f$. (3 marks)

**c.** Use the second derivative test to classify it. (2 marks)

**d.** Describe the behaviour of $f(x)$ as $x \\to 0^+$ and as $x \\to \\infty$. (2 marks)

**e.** Hence sketch the graph on $(0, 4]$. (2 marks)

${img("rational-min.svg", "Graph of f(x) = x + 1/x for x positive, showing the local minimum at (1, 2) with the curve approaching infinity as x approaches 0 and rising for large x")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (3 marks)**
*Step 1 (1 mark):* $f'(x) = 1 - \\dfrac{1}{x^2}$.
*Step 2 (1 mark):* $f''(x) = \\dfrac{2}{x^3}$.
*Step 3 (1 mark):* (Combined form for use in later parts.)

**b. (3 marks)**
*Step 1 (1 mark):* $f'(x) = 0 \\Rightarrow 1 = \\dfrac{1}{x^2}$.
*Step 2 (1 mark):* $x^2 = 1$, taking $x > 0$: $x = 1$.
*Step 3 (1 mark):* $f(1) = 2$. Stationary point: $(1, 2)$.

**c. (2 marks)**
*Step 1 (1 mark):* $f''(1) = 2 > 0$.
*Step 2 (1 mark):* So $(1, 2)$ is a local minimum.

**d. (2 marks)**
*Step 1 (1 mark):* As $x \\to 0^+$, $\\dfrac{1}{x} \\to \\infty$, so $f(x) \\to \\infty$.
*Step 2 (1 mark):* As $x \\to \\infty$, $\\dfrac{1}{x} \\to 0$, so $f(x) \\to \\infty$ (asymptotic to $y = x$).

**e. (2 marks)**
*Step 1 (1 mark):* Curve descends from $\\infty$ at $x = 0^+$ to $(1, 2)$.
*Step 2 (1 mark):* Then rises slowly thereafter; $f(4) = 4.25$.`,
    subtopicSlugs: ["stationary-points-and-curve-sketching", "rational-functions", "differentiation"],
  },
  {
    content: `Let $f(x) = x e^{-x}$ for $x \\geq 0$.

**a.** Find $f'(x)$ using the product rule. (3 marks)

**b.** Find the exact coordinates of the stationary point. (3 marks)

**c.** Classify the stationary point. (3 marks)

**d.** State the value of $\\displaystyle\\lim_{x \\to \\infty} f(x)$, and hence the horizontal asymptote. (3 marks)

${img("x-times-exp-neg-x.svg", "Graph of f(x) = x e to the negative x for x greater than or equal to 0, showing the curve rising to a local maximum at (1, 1/e) and then decaying toward zero")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (3 marks)**
*Step 1 (1 mark):* Product rule: $f'(x) = 1 \\cdot e^{-x} + x \\cdot (-e^{-x})$.
*Step 2 (1 mark):* $= e^{-x}(1 - x)$.
*Step 3 (1 mark):* Equivalent form.

**b. (3 marks)**
*Step 1 (1 mark):* $f'(x) = 0$: since $e^{-x} > 0$, need $1 - x = 0$.
*Step 2 (1 mark):* $x = 1$.
*Step 3 (1 mark):* $f(1) = 1 \\cdot e^{-1} = \\dfrac{1}{e}$. Stationary point: $\\left(1, \\dfrac{1}{e}\\right)$.

**c. (3 marks)**
*Step 1 (1 mark):* $f''(x) = -e^{-x}(1 - x) + e^{-x}(-1) = e^{-x}(x - 2)$.
*Step 2 (1 mark):* $f''(1) = e^{-1}(-1) < 0$.
*Step 3 (1 mark):* So $\\left(1, \\dfrac{1}{e}\\right)$ is a local maximum.

**d. (3 marks)**
*Step 1 (1 mark):* $\\displaystyle\\lim_{x \\to \\infty} x e^{-x}$: exponential decay dominates polynomial growth.
*Step 2 (1 mark):* The limit is $0$.
*Step 3 (1 mark):* Horizontal asymptote: $y = 0$.`,
    subtopicSlugs: ["stationary-points-and-curve-sketching", "exponential-functions", "product-rule"],
  },
];

const output = { mcq: [], shortAnswer: [], extendedAnswer: [], extendedResponse: questions };
fs.writeFileSync(OUT, JSON.stringify(output, null, 2) + "\n");
console.log(`${OUT}: ${questions.length} questions, ${questions.reduce((s, q) => s + q.marks, 0)} marks`);
