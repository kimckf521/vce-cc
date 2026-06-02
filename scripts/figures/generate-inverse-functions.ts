/** Wave 1 batch 10: Inverse Functions ext-resp. */
import * as fs from "fs";
import * as path from "path";
import { functionPlot, toDataUri } from "./svg";

const DIR = "scripts/output/figures/inverse-functions";
const OUT = "scripts/output/qset-methods-b2-inverse-functions.json";
fs.mkdirSync(DIR, { recursive: true });

const fig1 = functionPlot({
  fn: (x) => 2 * x + 4, xRange: [-6, 6], yRange: [-6, 8],
  fnLabel: "f(x) = 2x + 4", fnLabelAt: { x: 1.5, y: 7 },
  xTicks: [-4, -2, 2, 4], yTicks: [-4, -2, 2, 4, 6],
  additionalFns: [
    { fn: (x) => (x - 4) / 2, color: "#16a34a", label: "f⁻¹(x) = (x − 4)/2", labelAt: { x: -5.8, y: -4 } },
    { fn: (x) => x, color: "#9ca3af", label: "y = x", labelAt: { x: 5, y: 5.5 }, width: 1 },
  ],
});

const fig2 = functionPlot({
  fn: (x) => x * x, xRange: [-3, 3], yRange: [-2, 8],
  fnLabel: "f(x) = x²", fnLabelAt: { x: -2.8, y: 7 },
  xTicks: [-2, -1, 1, 2], yTicks: [1, 2, 4, 6],
  additionalFns: [
    { fn: (x) => x >= 0 ? Math.sqrt(x) : NaN, color: "#16a34a", label: "f⁻¹(x) = √x", labelAt: { x: 4, y: 1.5 } },
    { fn: (x) => x, color: "#9ca3af", labelAt: { x: 2.5, y: 2.5 }, width: 1 },
  ],
  markedPoints: [{ x: 0, label: "(0, 0)" }],
});

const fig3 = functionPlot({
  fn: (x) => Math.exp(x), xRange: [-3, 3], yRange: [-3, 8],
  fnLabel: "f(x) = eˣ", fnLabelAt: { x: 1.8, y: 7 },
  xTicks: [-2, -1, 1, 2], yTicks: [-2, 2, 4, 6],
  additionalFns: [
    { fn: (x) => Math.log(x), color: "#16a34a", label: "f⁻¹(x) = ln(x)", labelAt: { x: 4, y: 0.5 } },
    { fn: (x) => x, color: "#9ca3af", labelAt: { x: 2.5, y: 2.5 }, width: 1 },
  ],
});

const fig4 = functionPlot({
  fn: (x) => (x + 3) / (x - 1), xRange: [-4, 6], yRange: [-5, 8],
  fnLabel: "f(x) = (x + 3)/(x − 1)", fnLabelAt: { x: -3.5, y: -3 },
  xTicks: [-3, -1, 2, 4], yTicks: [-3, 2, 4, 6],
  additionalFns: [{ fn: (x) => (x + 3) / (x - 1), color: "#16a34a" }],
  asymptotes: [{ y: 1, label: "y = 1" }],
});

const figs = { "linear-inverse.svg": fig1, "quadratic-restricted-inverse.svg": fig2, "exp-log-inverse.svg": fig3, "rational-self-inverse.svg": fig4 };
for (const [n, c] of Object.entries(figs)) fs.writeFileSync(path.join(DIR, n), c);
const img = (n: string, a: string) => `![${a}](${toDataUri(figs[n as keyof typeof figs])})`;

const questions = [
  {
    content: `Let $f(x) = 2x + 4$ for $x \\in \\mathbb{R}$.

**a.** Find the inverse function $f^{-1}(x)$. (3 marks)

**b.** State the domain and range of $f^{-1}$. (2 marks)

**c.** Verify that $f^{-1}(f(3)) = 3$. (2 marks)

**d.** Find the coordinates of the point where the graphs of $f$ and $f^{-1}$ intersect. (3 marks)

${img("linear-inverse.svg", "Linear function f(x) = 2x + 4 (red) with its inverse f^(-1)(x) = (x - 4)/2 (green) on the same axes, reflected in the line y = x (grey)")}`,
    marks: 10,
    difficulty: "MEDIUM",
    solutionContent: `**a. (3 marks)**
*Step 1 (1 mark):* Let $y = 2x + 4$. Solve for $x$: $y - 4 = 2x$.
*Step 2 (1 mark):* $x = \\dfrac{y - 4}{2}$.
*Step 3 (1 mark):* Swap: $f^{-1}(x) = \\dfrac{x - 4}{2}$.

**b. (2 marks)**
*Step 1 (1 mark):* Domain: $\\mathbb{R}$ (= range of $f$).
*Step 2 (1 mark):* Range: $\\mathbb{R}$.

**c. (2 marks)**
*Step 1 (1 mark):* $f(3) = 10$.
*Step 2 (1 mark):* $f^{-1}(10) = \\dfrac{10 - 4}{2} = 3$. ✓

**d. (3 marks)**
*Step 1 (1 mark):* Intersection lies on $y = x$: set $f(x) = x$.
*Step 2 (1 mark):* $2x + 4 = x \\Rightarrow x = -4$.
*Step 3 (1 mark):* Point: $(-4, -4)$.`,
    subtopicSlugs: ["inverse-functions"],
  },
  {
    content: `Consider $f(x) = x^2$ for $x \\in \\mathbb{R}$.

**a.** Explain why $f$ is not one-to-one on $\\mathbb{R}$, and hence has no inverse on this domain. (2 marks)

**b.** State a restricted domain on which $f$ is one-to-one and increasing, and find the inverse of $f$ on this restricted domain. (4 marks)

**c.** State the domain and range of this inverse. (2 marks)

**d.** Find the coordinates of the intersection of the restricted $f$ and its inverse (other than the origin if applicable). (3 marks)

${img("quadratic-restricted-inverse.svg", "Parabola y = x squared (red) with the inverse y = square root of x (green) shown on the same axes for the restricted domain x ≥ 0, reflected in y = x (grey)")}`,
    marks: 11,
    difficulty: "MEDIUM",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* For any $a > 0$, $f(a) = f(-a) = a^2$, so two distinct inputs map to the same output.
*Step 2 (1 mark):* Hence $f$ is not one-to-one and has no inverse on $\\mathbb{R}$.

**b. (4 marks)**
*Step 1 (1 mark):* Restrict to $x \\geq 0$ — on this domain $f$ is one-to-one and increasing.
*Step 2 (1 mark):* Let $y = x^2$; solve $x = \\sqrt{y}$ (positive root since $x \\geq 0$).
*Step 3 (1 mark):* Swap: $f^{-1}(x) = \\sqrt{x}$.
*Step 4 (1 mark):* $f^{-1}: [0, \\infty) \\to [0, \\infty)$.

**c. (2 marks)**
*Step 1 (1 mark):* Domain: $[0, \\infty)$.
*Step 2 (1 mark):* Range: $[0, \\infty)$.

**d. (3 marks)**
*Step 1 (1 mark):* Solve $x^2 = x$: $x(x - 1) = 0$.
*Step 2 (1 mark):* $x = 0$ or $x = 1$.
*Step 3 (1 mark):* Other intersection: $(1, 1)$.`,
    subtopicSlugs: ["inverse-functions", "polynomial-functions", "domain-and-range"],
  },
  {
    content: `Consider $f(x) = e^x$ for $x \\in \\mathbb{R}$.

**a.** Find the inverse function $f^{-1}(x)$, and state its domain and range. (4 marks)

**b.** Sketch $f$ and $f^{-1}$ on the same axes for $-3 \\leq x \\leq 3$, showing the line $y = x$. (2 marks)

**c.** Let $g(x) = e^{2x} - 3$. Find $g^{-1}(x)$ and its domain. (4 marks)

**d.** Find the value of $g^{-1}(0)$ in exact form. (2 marks)

${img("exp-log-inverse.svg", "Exponential f(x) = e^x (red) with its inverse f^(-1)(x) = ln(x) (green) on the same axes, reflected in the line y = x (grey)")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (4 marks)**
*Step 1 (1 mark):* Let $y = e^x$, take log: $x = \\ln y$.
*Step 2 (1 mark):* Swap: $f^{-1}(x) = \\ln(x)$.
*Step 3 (1 mark):* Domain: $(0, \\infty)$ (range of $f$).
*Step 4 (1 mark):* Range: $\\mathbb{R}$.

**b. (2 marks)**
*Step 1 (1 mark):* The graphs are reflections of each other in the line $y = x$.
*Step 2 (1 mark):* $f$ passes through $(0, 1)$ with asymptote $y = 0$; $f^{-1}$ passes through $(1, 0)$ with asymptote $x = 0$.

**c. (4 marks)**
*Step 1 (1 mark):* Let $y = e^{2x} - 3$. Then $y + 3 = e^{2x}$.
*Step 2 (1 mark):* Take log: $\\ln(y + 3) = 2x$.
*Step 3 (1 mark):* $x = \\dfrac{1}{2} \\ln(y + 3)$. Swap: $g^{-1}(x) = \\dfrac{1}{2} \\ln(x + 3)$.
*Step 4 (1 mark):* Domain: $x + 3 > 0$, i.e. $x > -3$.

**d. (2 marks)**
*Step 1 (1 mark):* $g^{-1}(0) = \\dfrac{1}{2} \\ln(3)$.
*Step 2 (1 mark):* Exact form: $\\dfrac{\\ln 3}{2}$.`,
    subtopicSlugs: ["inverse-functions", "exponential-functions", "logarithmic-functions"],
  },
  {
    content: `Let $f(x) = \\dfrac{x + 3}{x - 1}$ for $x \\neq 1$.

**a.** State the equation of the vertical asymptote. (1 mark)

**b.** Find the equation of the horizontal asymptote by considering $\\displaystyle\\lim_{x \\to \\pm\\infty} f(x)$. (2 marks)

**c.** Find the inverse function $f^{-1}(x)$. (5 marks)

**d.** State a remarkable feature of $f^{-1}$ in relation to $f$. (2 marks)

**e.** State the domain of $f^{-1}$. (2 marks)

${img("rational-self-inverse.svg", "Graph of f(x) = (x + 3)/(x - 1), a rational function with vertical asymptote x = 1 and horizontal asymptote y = 1")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (1 mark)** $x = 1$.

**b. (2 marks)**
*Step 1 (1 mark):* Divide numerator and denominator by $x$: $f(x) = \\dfrac{1 + 3/x}{1 - 1/x}$.
*Step 2 (1 mark):* As $x \\to \\pm\\infty$, the fractions $\\to 0$, so $f \\to 1$. Horizontal asymptote: $y = 1$.

**c. (5 marks)**
*Step 1 (1 mark):* Let $y = \\dfrac{x + 3}{x - 1}$. Cross-multiply: $y(x - 1) = x + 3$.
*Step 2 (1 mark):* $yx - y = x + 3$.
*Step 3 (1 mark):* Collect $x$ terms: $yx - x = y + 3 \\Rightarrow x(y - 1) = y + 3$.
*Step 4 (1 mark):* $x = \\dfrac{y + 3}{y - 1}$.
*Step 5 (1 mark):* Swap: $f^{-1}(x) = \\dfrac{x + 3}{x - 1}$.

**d. (2 marks)**
*Step 1 (1 mark):* $f^{-1}$ has the same formula as $f$.
*Step 2 (1 mark):* So $f$ is its own inverse (involution); the graph of $f$ is symmetric about the line $y = x$.

**e. (2 marks)**
*Step 1 (1 mark):* Domain of $f^{-1}$ = range of $f = \\mathbb{R} \\setminus \\{1\\}$.
*Step 2 (1 mark):* That is, $x \\neq 1$.`,
    subtopicSlugs: ["inverse-functions", "rational-functions"],
  },
];

const output = { mcq: [], shortAnswer: [], extendedAnswer: [], extendedResponse: questions };
fs.writeFileSync(OUT, JSON.stringify(output, null, 2) + "\n");
console.log(`${OUT}: ${questions.length} questions, ${questions.reduce((s, q) => s + q.marks, 0)} marks`);
