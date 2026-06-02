/** Wave 1 batch 12: Exponential Equations ext-resp. */
import * as fs from "fs";
import * as path from "path";
import { functionPlot, toDataUri } from "./svg";

const DIR = "scripts/output/figures/exponential-equations";
const OUT = "scripts/output/qset-methods-b2-exponential-equations.json";
fs.mkdirSync(DIR, { recursive: true });

const fig1 = functionPlot({
  fn: (x) => Math.exp(x) - 5, xRange: [-1, 3], yRange: [-6, 12],
  fnLabel: "y = eˣ − 5", fnLabelAt: { x: -0.8, y: 11 },
  xTicks: [-1, 1, 2], yTicks: [-4, 4, 8],
  markedPoints: [{ x: Math.log(5), label: "(ln 5, 0)" }, { x: 0, label: "(0, −4)" }],
  asymptotes: [{ y: -5, label: "y = −5" }],
});

const fig2 = functionPlot({
  fn: (x) => Math.exp(2 * x) - 4 * Math.exp(x) + 3, xRange: [-2, 2], yRange: [-2, 8],
  fnLabel: "y = e^(2x) − 4eˣ + 3", fnLabelAt: { x: -1.8, y: 7 },
  xTicks: [-1, 1, 2], yTicks: [-1, 2, 4, 6],
  markedPoints: [{ x: 0, label: "(0, 0)" }, { x: Math.log(2), label: "(ln 2, −1)" }, { x: Math.log(3), label: "(ln 3, 0)" }],
});

const fig3 = functionPlot({
  fn: (x) => 2 ** x, xRange: [-2, 4], yRange: [-1, 18],
  fnLabel: "y = 2ˣ", fnLabelAt: { x: 0, y: 16 },
  xTicks: [-1, 1, 2, 3], yTicks: [2, 4, 8, 16],
  additionalFns: [{ fn: () => 10, color: "#16a34a", label: "y = 10", labelAt: { x: 0, y: 11 } }],
  markedPoints: [{ x: Math.log(10) / Math.log(2), label: "(log₂10, 10)" }],
});

const fig4 = functionPlot({
  fn: (t) => 100 * (1 - Math.exp(-0.2 * t)), xRange: [0, 30], yRange: [0, 110],
  fnLabel: "P(t) = 100(1 − e^(−0.2t))", fnLabelAt: { x: 1, y: 105 },
  xLabel: "t (days)", yLabel: "P (%)",
  xTicks: [5, 10, 15, 20, 25, 30], yTicks: [25, 50, 75, 100],
  markedPoints: [{ x: 0, label: "(0, 0)" }, { x: 5 * Math.log(2), label: "(5 ln 2, 50)" }],
  asymptotes: [{ y: 100, label: "100%" }],
});

const figs = { "exp-minus-5.svg": fig1, "exp-quadratic-substitution.svg": fig2, "two-to-x-equals-10.svg": fig3, "saturating-growth.svg": fig4 };
for (const [n, c] of Object.entries(figs)) fs.writeFileSync(path.join(DIR, n), c);
const img = (n: string, a: string) => `![${a}](${toDataUri(figs[n as keyof typeof figs])})`;

const questions = [
  {
    content: `Consider the equation $e^x - 5 = 0$.

**a.** Solve for $x$ in exact form. (2 marks)

**b.** State $x$ correct to 4 decimal places. (1 mark)

**c.** Find all $x$ for which $e^x = 5 - x$. Give an exact form if possible; otherwise estimate. (3 marks)

**d.** Solve $e^{2x} = 9 e^x$ exactly. (4 marks)

${img("exp-minus-5.svg", "Graph of y = e^x minus 5 showing the curve crossing the x-axis at x = ln 5 with horizontal asymptote y = negative 5")}`,
    marks: 10,
    difficulty: "MEDIUM",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* $e^x = 5$.
*Step 2 (1 mark):* $x = \\ln 5$.

**b. (1 mark)** $\\ln 5 \\approx 1.6094$.

**c. (3 marks)**
*Step 1 (1 mark):* Rearrange: $e^x + x - 5 = 0$. This has no elementary solution.
*Step 2 (1 mark):* Use numerical methods: at $x = 1$, $e + 1 - 5 = -1.28$; at $x = 1.5$, $e^{1.5} + 1.5 - 5 \\approx -0.02$; at $x = 1.6$, $\\approx 0.55$.
*Step 3 (1 mark):* So $x \\approx 1.51$ (one real solution).

**d. (4 marks)**
*Step 1 (1 mark):* Divide both sides by $e^x$ (always positive): $\\dfrac{e^{2x}}{e^x} = 9$.
*Step 2 (1 mark):* Simplify: $e^x = 9$.
*Step 3 (1 mark):* Take logs: $x = \\ln 9$.
*Step 4 (1 mark):* Equivalently $x = 2 \\ln 3$.`,
    subtopicSlugs: ["exponential-equations", "exponential-functions"],
  },
  {
    content: `Consider the equation $e^{2x} - 4 e^x + 3 = 0$.

**a.** By letting $u = e^x$, rewrite the equation as a quadratic in $u$. (2 marks)

**b.** Solve the quadratic for $u$. (3 marks)

**c.** Find all real solutions for $x$ in exact form. (3 marks)

**d.** Solve the related inequality $e^{2x} - 4 e^x + 3 < 0$ in exact form. (3 marks)

${img("exp-quadratic-substitution.svg", "Graph of y = e^(2x) minus 4 e^x plus 3, showing two x-intercepts at x = 0 and x = ln 3, a minimum at (ln 2, -1), and a horizontal asymptote y = 3 as x tends to negative infinity")}`,
    marks: 11,
    difficulty: "MEDIUM",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* Note $e^{2x} = (e^x)^2 = u^2$.
*Step 2 (1 mark):* Equation becomes $u^2 - 4u + 3 = 0$.

**b. (3 marks)**
*Step 1 (1 mark):* Factor: $(u - 1)(u - 3) = 0$.
*Step 2 (1 mark):* $u = 1$ or $u = 3$.
*Step 3 (1 mark):* Both positive, so both yield valid $x$.

**c. (3 marks)**
*Step 1 (1 mark):* $u = 1 \\Rightarrow e^x = 1 \\Rightarrow x = 0$.
*Step 2 (1 mark):* $u = 3 \\Rightarrow e^x = 3 \\Rightarrow x = \\ln 3$.
*Step 3 (1 mark):* Solutions: $x = 0$ or $x = \\ln 3$.

**d. (3 marks)**
*Step 1 (1 mark):* $u^2 - 4u + 3 < 0 \\Rightarrow (u - 1)(u - 3) < 0 \\Rightarrow 1 < u < 3$.
*Step 2 (1 mark):* $1 < e^x < 3$.
*Step 3 (1 mark):* $\\ln 1 < x < \\ln 3 \\Rightarrow 0 < x < \\ln 3$.`,
    subtopicSlugs: ["exponential-equations", "exponential-functions"],
  },
  {
    content: `Consider the equation $2^x = 10$.

**a.** Find $x$ in exact form using $\\log_2$. (2 marks)

**b.** Find $x$ in exact form using $\\ln$. (2 marks)

**c.** Find $x$ correct to 4 decimal places. (2 marks)

**d.** Solve $2^{x+1} \\cdot 5^x = 100$ exactly. (3 marks)

**e.** Solve $3^{2x} - 3^{x+1} + 2 = 0$ in exact form. (3 marks)

${img("two-to-x-equals-10.svg", "Graph of y = 2^x with horizontal line y = 10 intersecting at x = log base 2 of 10")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* Take $\\log_2$: $x = \\log_2 10$.
*Step 2 (1 mark):* (This is the exact form.)

**b. (2 marks)**
*Step 1 (1 mark):* Take $\\ln$: $x \\ln 2 = \\ln 10$.
*Step 2 (1 mark):* $x = \\dfrac{\\ln 10}{\\ln 2}$.

**c. (2 marks)**
*Step 1 (1 mark):* $\\ln 10 \\approx 2.3026$ and $\\ln 2 \\approx 0.6931$.
*Step 2 (1 mark):* $x \\approx 3.3219$.

**d. (3 marks)**
*Step 1 (1 mark):* $2 \\cdot 2^x \\cdot 5^x = 100 \\Rightarrow 2 \\cdot 10^x = 100$.
*Step 2 (1 mark):* $10^x = 50$.
*Step 3 (1 mark):* $x = \\log_{10} 50$.

**e. (3 marks)**
*Step 1 (1 mark):* Let $u = 3^x$: $u^2 - 3 u + 2 = 0$.
*Step 2 (1 mark):* $(u - 1)(u - 2) = 0$, so $u = 1$ or $u = 2$.
*Step 3 (1 mark):* $3^x = 1 \\Rightarrow x = 0$; $3^x = 2 \\Rightarrow x = \\log_3 2$.`,
    subtopicSlugs: ["exponential-equations", "exponent-and-logarithm-laws"],
  },
  {
    content: `The proportion $P$ (as a percentage) of a population that has heard a piece of news $t$ days after release is modelled by

$$P(t) = 100 (1 - e^{-0.2 t}), \\quad t \\geq 0.$$

**a.** Find $P(0)$ and interpret in context. (2 marks)

**b.** Find $\\displaystyle\\lim_{t \\to \\infty} P(t)$ and interpret in context. (2 marks)

**c.** Find the exact time at which $P(t) = 50$. (3 marks)

**d.** Find the time at which $P(t) = 95$, correct to 1 decimal place. (3 marks)

**e.** Solve $P(t) = 100$ exactly, and explain what your answer means. (2 marks)

${img("saturating-growth.svg", "Graph of P(t) = 100(1 - e^(-0.2t)) showing saturating growth from 0% at t = 0 toward asymptote 100% as time increases, passing through (5 ln 2, 50)")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* $P(0) = 100(1 - 1) = 0$.
*Step 2 (1 mark):* At release, no one has yet heard the news.

**b. (2 marks)**
*Step 1 (1 mark):* As $t \\to \\infty$, $e^{-0.2t} \\to 0$, so $P(t) \\to 100$.
*Step 2 (1 mark):* Eventually almost the entire population is informed.

**c. (3 marks)**
*Step 1 (1 mark):* $100(1 - e^{-0.2t}) = 50 \\Rightarrow 1 - e^{-0.2t} = 0.5$.
*Step 2 (1 mark):* $e^{-0.2t} = 0.5 \\Rightarrow -0.2 t = \\ln 0.5 = -\\ln 2$.
*Step 3 (1 mark):* $t = 5 \\ln 2$ days.

**d. (3 marks)**
*Step 1 (1 mark):* $100(1 - e^{-0.2t}) = 95 \\Rightarrow e^{-0.2t} = 0.05$.
*Step 2 (1 mark):* $-0.2 t = \\ln 0.05 \\Rightarrow t = -5 \\ln 0.05 = 5 \\ln 20$.
*Step 3 (1 mark):* $\\approx 5 \\times 2.996 \\approx 15.0$ days.

**e. (2 marks)**
*Step 1 (1 mark):* $100(1 - e^{-0.2t}) = 100 \\Rightarrow e^{-0.2t} = 0$, which has no solution.
*Step 2 (1 mark):* So $P(t)$ never exactly reaches $100\\%$ — the asymptote is approached but never attained.`,
    subtopicSlugs: ["exponential-equations", "exponential-functions"],
  },
];

const output = { mcq: [], shortAnswer: [], extendedAnswer: [], extendedResponse: questions };
fs.writeFileSync(OUT, JSON.stringify(output, null, 2) + "\n");
console.log(`${OUT}: ${questions.length} questions, ${questions.reduce((s, q) => s + q.marks, 0)} marks`);
