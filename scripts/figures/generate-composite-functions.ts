/** Wave 1 batch 11: Composite Functions ext-resp. */
import * as fs from "fs";
import * as path from "path";
import { functionPlot, toDataUri } from "./svg";

const DIR = "scripts/output/figures/composite-functions";
const OUT = "scripts/output/qset-methods-b2-composite-functions.json";
fs.mkdirSync(DIR, { recursive: true });

const fig1 = functionPlot({
  fn: (x) => (2 * x + 1) ** 2, xRange: [-3, 2], yRange: [-1, 25],
  fnLabel: "(f ∘ g)(x) = (2x + 1)²", fnLabelAt: { x: -2.8, y: 22 },
  xTicks: [-2, -1, 1], yTicks: [4, 9, 16, 25],
  markedPoints: [{ x: -0.5, label: "(−0.5, 0)" }, { x: 0, label: "(0, 1)" }],
});

const fig2 = functionPlot({
  fn: (x) => Math.exp(x * x), xRange: [-2, 2], yRange: [-2, 55],
  fnLabel: "h(x) = e^(x²)", fnLabelAt: { x: -1.8, y: 45 },
  xTicks: [-2, -1, 1, 2], yTicks: [5, 15, 30, 50],
  markedPoints: [{ x: 0, label: "(0, 1) min" }, { x: 1, label: "(1, e)" }, { x: -1, label: "(−1, e)" }],
});

const fig3 = functionPlot({
  fn: (x) => Math.log(x * x + 1), xRange: [-3, 3], yRange: [-0.5, 3],
  fnLabel: "f(g(x)) = ln(x² + 1)", fnLabelAt: { x: -2.5, y: 2.7 },
  xTicks: [-2, -1, 1, 2], yTicks: [0.5, 1, 1.5, 2, 2.5],
  markedPoints: [{ x: 0, label: "(0, 0)" }],
});

const fig4 = functionPlot({
  fn: (x) => Math.sin(2 * x), xRange: [-Math.PI, Math.PI], yRange: [-1.5, 1.5],
  fnLabel: "h(x) = sin(2x)", fnLabelAt: { x: -3, y: 1.3 },
  xTicks: [-Math.PI / 2, 0, Math.PI / 2].map(v => Number(v.toFixed(3))),
  yTicks: [-1, 1],
});

const figs = { "compose-poly.svg": fig1, "compose-exp-quadratic.svg": fig2, "compose-log-quadratic.svg": fig3, "compose-sin-double.svg": fig4 };
for (const [n, c] of Object.entries(figs)) fs.writeFileSync(path.join(DIR, n), c);
const img = (n: string, a: string) => `![${a}](${toDataUri(figs[n as keyof typeof figs])})`;

const questions = [
  {
    content: `Let $f(x) = x^2$ and $g(x) = 2x + 1$.

**a.** Find $(f \\circ g)(x)$ and simplify. (2 marks)

**b.** Find $(g \\circ f)(x)$ and simplify. (2 marks)

**c.** Show that $(f \\circ g)(x) \\neq (g \\circ f)(x)$ in general by evaluating both at $x = 2$. (2 marks)

**d.** Solve $(f \\circ g)(x) = 9$ for $x$. (4 marks)

${img("compose-poly.svg", "Graph of (f composed with g)(x) = (2x + 1) squared, showing the parabola with vertex at (-0.5, 0) and y-intercept at (0, 1)")}`,
    marks: 10,
    difficulty: "MEDIUM",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* $(f \\circ g)(x) = f(g(x)) = f(2x + 1)$.
*Step 2 (1 mark):* $= (2x + 1)^2$.

**b. (2 marks)**
*Step 1 (1 mark):* $(g \\circ f)(x) = g(f(x)) = g(x^2)$.
*Step 2 (1 mark):* $= 2x^2 + 1$.

**c. (2 marks)**
*Step 1 (1 mark):* $(f \\circ g)(2) = (5)^2 = 25$.
*Step 2 (1 mark):* $(g \\circ f)(2) = 2(4) + 1 = 9$. Since $25 \\neq 9$, the compositions differ.

**d. (4 marks)**
*Step 1 (1 mark):* $(2x + 1)^2 = 9$.
*Step 2 (1 mark):* $2x + 1 = \\pm 3$.
*Step 3 (1 mark):* $2x = 2$ or $2x = -4$.
*Step 4 (1 mark):* $x = 1$ or $x = -2$.`,
    subtopicSlugs: ["composite-functions", "polynomial-functions"],
  },
  {
    content: `Let $f(x) = e^x$ and $g(x) = x^2$.

**a.** Find $h(x) = (f \\circ g)(x)$. (2 marks)

**b.** Find $h'(x)$ using the chain rule. (3 marks)

**c.** Find the coordinates of any stationary points of $h$. (3 marks)

**d.** State the minimum value of $h$ on $\\mathbb{R}$, and explain why $h$ has no maximum. (3 marks)

${img("compose-exp-quadratic.svg", "Graph of h(x) = e to the x squared, showing the U-shaped curve with minimum at (0, 1) and rapidly growing toward infinity as |x| increases")}`,
    marks: 11,
    difficulty: "MEDIUM",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* $h(x) = f(g(x)) = f(x^2)$.
*Step 2 (1 mark):* $h(x) = e^{x^2}$.

**b. (3 marks)**
*Step 1 (1 mark):* Outer derivative: $e^u$. Inner: $\\dfrac{d}{dx}(x^2) = 2x$.
*Step 2 (1 mark):* Chain rule: $h'(x) = e^{x^2} \\cdot 2x$.
*Step 3 (1 mark):* $= 2x \\cdot e^{x^2}$.

**c. (3 marks)**
*Step 1 (1 mark):* $h'(x) = 0$: since $e^{x^2} > 0$, $2x = 0 \\Rightarrow x = 0$.
*Step 2 (1 mark):* $h(0) = e^0 = 1$.
*Step 3 (1 mark):* Stationary point: $(0, 1)$.

**d. (3 marks)**
*Step 1 (1 mark):* $x^2 \\geq 0$ with equality only at $x = 0$, so $e^{x^2} \\geq e^0 = 1$.
*Step 2 (1 mark):* Hence minimum value is $1$ at $x = 0$.
*Step 3 (1 mark):* As $|x| \\to \\infty$, $x^2 \\to \\infty$ and $h(x) \\to \\infty$, so $h$ has no maximum.`,
    subtopicSlugs: ["composite-functions", "exponential-functions", "chain-rule"],
  },
  {
    content: `Let $f(x) = \\log_e(x)$ for $x > 0$ and $g(x) = x^2 + 1$.

**a.** Find $(f \\circ g)(x)$ and state its maximal domain. (3 marks)

**b.** Explain why $(g \\circ f)(x)$ has a different domain from $(f \\circ g)(x)$. (3 marks)

**c.** Find $(f \\circ g)'(x)$. (3 marks)

**d.** Find all $x$ for which $(f \\circ g)(x) = \\log_e(5)$. (3 marks)

${img("compose-log-quadratic.svg", "Graph of f composed with g, namely ln(x squared + 1), showing the U-shaped curve with minimum at the origin")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (3 marks)**
*Step 1 (1 mark):* $(f \\circ g)(x) = f(g(x)) = \\ln(x^2 + 1)$.
*Step 2 (1 mark):* Need $x^2 + 1 > 0$, which is true for all $x$.
*Step 3 (1 mark):* Maximal domain: $\\mathbb{R}$.

**b. (3 marks)**
*Step 1 (1 mark):* $(g \\circ f)(x) = (\\ln x)^2 + 1$.
*Step 2 (1 mark):* This requires $\\ln x$ to be defined, i.e. $x > 0$.
*Step 3 (1 mark):* Domain of $(g \\circ f) = (0, \\infty)$, narrower than $(f \\circ g)$'s $\\mathbb{R}$.

**c. (3 marks)**
*Step 1 (1 mark):* Outer: $\\dfrac{1}{u}$. Inner: $\\dfrac{d}{dx}(x^2 + 1) = 2x$.
*Step 2 (1 mark):* Chain rule: $\\dfrac{1}{x^2 + 1} \\cdot 2x$.
*Step 3 (1 mark):* $(f \\circ g)'(x) = \\dfrac{2x}{x^2 + 1}$.

**d. (3 marks)**
*Step 1 (1 mark):* $\\ln(x^2 + 1) = \\ln 5 \\Rightarrow x^2 + 1 = 5$.
*Step 2 (1 mark):* $x^2 = 4$.
*Step 3 (1 mark):* $x = \\pm 2$.`,
    subtopicSlugs: ["composite-functions", "logarithmic-functions", "chain-rule"],
  },
  {
    content: `Let $h(x) = \\sin(2x)$. The function $h$ can be expressed as a composition $f(g(x))$ in multiple ways.

**a.** Identify functions $f$ and $g$ such that $h(x) = f(g(x))$ where $f(u) = \\sin u$. (2 marks)

**b.** Identify alternative functions $f$ and $g$ such that $h(x) = f(g(x))$ where $g(x) = \\sin x$. (3 marks)

**c.** Find $h'(x)$ using the chain rule. (2 marks)

**d.** State the period and amplitude of $h$. (2 marks)

**e.** Find all $x \\in [0, 2\\pi]$ such that $h(x) = 0$. (3 marks)

${img("compose-sin-double.svg", "Graph of h(x) = sin(2x), showing the sinusoidal wave with period pi and amplitude 1")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* $g(x) = 2x$.
*Step 2 (1 mark):* Then $f(g(x)) = \\sin(2x)$ as required.

**b. (3 marks)**
*Step 1 (1 mark):* Using double-angle: $\\sin(2x) = 2 \\sin x \\cos x$.
*Step 2 (1 mark):* Choose $g(x) = \\sin x$.
*Step 3 (1 mark):* Then $f(u) = 2 u \\cos(\\arcsin u)$ (only works for $|u| \\leq 1$) — this composition is less natural. The cleanest alternative is the original: $f(u) = \\sin u$, $g(x) = 2x$.

**c. (2 marks)**
*Step 1 (1 mark):* Outer: $\\cos u$. Inner: $\\dfrac{d}{dx}(2x) = 2$.
*Step 2 (1 mark):* $h'(x) = 2 \\cos(2x)$.

**d. (2 marks)**
*Step 1 (1 mark):* Period $= \\dfrac{2\\pi}{2} = \\pi$.
*Step 2 (1 mark):* Amplitude $= 1$.

**e. (3 marks)**
*Step 1 (1 mark):* $\\sin(2x) = 0 \\Rightarrow 2x = k\\pi$ for integer $k$.
*Step 2 (1 mark):* For $2x \\in [0, 4\\pi]$: $2x = 0, \\pi, 2\\pi, 3\\pi, 4\\pi$.
*Step 3 (1 mark):* $x = 0, \\dfrac{\\pi}{2}, \\pi, \\dfrac{3\\pi}{2}, 2\\pi$.`,
    subtopicSlugs: ["composite-functions", "trigonometric-functions", "chain-rule"],
  },
];

const output = { mcq: [], shortAnswer: [], extendedAnswer: [], extendedResponse: questions };
fs.writeFileSync(OUT, JSON.stringify(output, null, 2) + "\n");
console.log(`${OUT}: ${questions.length} questions, ${questions.reduce((s, q) => s + q.marks, 0)} marks`);
