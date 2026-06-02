/**
 * Wave 1, batch 2: Exponential Functions ext-resp questions.
 *
 * 4 extended-response questions for the Exponential Functions subtopic.
 * Output: scripts/output/qset-methods-b2-exponential-functions.json
 *
 * Usage:
 *   npx tsx scripts/figures/generate-exponential-functions.ts
 */

import * as fs from "fs";
import * as path from "path";
import { functionPlot, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/exponential-functions";
const JSON_PATH = "scripts/output/qset-methods-b2-exponential-functions.json";

fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Diagrams ───────────────────────────────────────────────────────────

const fig1 = functionPlot({
  fn: (t) => 22 + 68 * Math.exp(-0.04 * t),
  xRange: [0, 80],
  yRange: [15, 100],
  fnLabel: "T(t) = 22 + 68 e^(−0.04 t)",
  fnLabelAt: { x: 28, y: 78 },
  xLabel: "t (min)",
  yLabel: "T (°C)",
  xTicks: [20, 40, 60, 80],
  yTicks: [22, 50, 90],
  markedPoints: [{ x: 0, label: "(0, 90)" }],
  asymptotes: [{ y: 22, label: "T → 22 (room temp)" }],
});

const fig2 = functionPlot({
  fn: (t) => 500 * Math.exp(0.2 * t),
  xRange: [0, 12],
  yRange: [0, 6000],
  fnLabel: "N(t) = 500 e^(0.2 t)",
  fnLabelAt: { x: 1, y: 5000 },
  xLabel: "t (h)",
  yLabel: "N",
  xTicks: [2, 4, 6, 8, 10, 12],
  yTicks: [500, 1000, 2000, 3000, 5000],
  markedPoints: [
    { x: 0, label: "(0, 500)" },
    { x: 5 * Math.log(2), label: "double" },
  ],
  color: "#16a34a",
});

const fig3 = functionPlot({
  fn: (t) => 10 * Math.exp(-0.3 * t) - 10 * Math.exp(-0.5 * t),
  xRange: [0, 15],
  yRange: [-0.3, 2.5],
  fnLabel: "C(t) = 10 e^(−0.3 t) − 10 e^(−0.5 t)",
  fnLabelAt: { x: 4, y: 2.2 },
  xLabel: "t (h)",
  yLabel: "C (mg/L)",
  xTicks: [2, 4, 6, 8, 10, 12, 14],
  yTicks: [0.5, 1, 1.5, 2],
  markedPoints: [
    { x: 0, label: "(0, 0)" },
    { x: 5 * Math.log(5 / 3), label: "max" },
  ],
  color: "#7c3aed",
});

const fig4 = functionPlot({
  fn: (x) => Math.exp(2 * x) - 4 * Math.exp(x) + 3,
  xRange: [-2, 1.5],
  yRange: [-1.5, 5],
  fnLabel: "f(x) = e^(2x) − 4e^x + 3",
  fnLabelAt: { x: -1.9, y: 4.5 },
  xTicks: [-2, -1, 1],
  yTicks: [-1, 1, 2, 3, 4],
  markedPoints: [
    { x: 0, label: "(0, 0)" },
    { x: Math.log(2), label: "(ln 2, −1)" },
    { x: Math.log(3), label: "(ln 3, 0)" },
  ],
  asymptotes: [{ y: 3, label: "y = 3" }],
});

const figures: Record<string, string> = {
  "cooling-decay.svg": fig1,
  "exponential-growth.svg": fig2,
  "drug-concentration.svg": fig3,
  "transformed-exponential.svg": fig4,
};

for (const [name, content] of Object.entries(figures)) {
  fs.writeFileSync(path.join(FIGURES_DIR, name), content);
}

const img = (name: string, alt: string): string =>
  `![${alt}](${toDataUri(figures[name])})`;

// ─── Questions ──────────────────────────────────────────────────────────

const questions = [
  {
    content: `A cup of coffee cools in a room. The temperature $T$ (in °C) at time $t$ minutes after pouring is modelled by

$$T(t) = 22 + 68 e^{-0.04t}, \\quad t \\geq 0.$$

**a.** State the initial temperature of the coffee. (1 mark)

**b.** State the limiting temperature as $t \\to \\infty$, and interpret this value in the context of the problem. (2 marks)

**c.** Find, correct to 1 decimal place, the time at which the coffee first reaches a temperature of $50$°C. (3 marks)

**d.** Find $T'(t)$. (2 marks)

**e.** State the rate of cooling at $t = 10$ minutes, correct to 2 decimal places (in °C per minute). (2 marks)

${img("cooling-decay.svg", "Graph of T(t) = 22 + 68 e to the negative 0.04 t, showing the coffee cooling from 90 degrees Celsius and asymptoting to the room temperature of 22 degrees Celsius over 80 minutes")}`,
    marks: 10,
    difficulty: "MEDIUM",
    solutionContent: `**a. (1 mark)** $T(0) = 22 + 68 = 90$°C.

**b. (2 marks)**
*Step 1 (1 mark):* As $t \\to \\infty$, $e^{-0.04t} \\to 0$, so $T(t) \\to 22$°C.
*Step 2 (1 mark):* This represents the room temperature — the coffee cools until it reaches thermal equilibrium with its surroundings.

**c. (3 marks)**
*Step 1 (1 mark):* Set $T(t) = 50$: $22 + 68 e^{-0.04t} = 50 \\Rightarrow e^{-0.04t} = \\dfrac{28}{68} = \\dfrac{7}{17}$.
*Step 2 (1 mark):* Take logs: $-0.04t = \\ln\\left(\\dfrac{7}{17}\\right)$, so $t = \\dfrac{\\ln(17/7)}{0.04}$.
*Step 3 (1 mark):* Numerically: $\\ln(17/7) \\approx 0.8873$, so $t \\approx 22.2$ minutes.

**d. (2 marks)**
*Step 1 (1 mark):* By the chain rule, $\\dfrac{d}{dt}\\left(68 e^{-0.04t}\\right) = 68 \\cdot (-0.04) e^{-0.04t}$.
*Step 2 (1 mark):* $T'(t) = -2.72 e^{-0.04t}$.

**e. (2 marks)**
*Step 1 (1 mark):* $T'(10) = -2.72 e^{-0.4}$.
*Step 2 (1 mark):* $\\approx -2.72 \\times 0.6703 \\approx -1.82$°C/min. (Negative sign indicates cooling.)`,
    subtopicSlugs: ["exponential-functions", "differentiation", "chain-rule"],
  },

  {
    content: `A colony of bacteria grows according to the model

$$N(t) = 500 e^{0.2t},$$

where $N$ is the population (in bacteria) and $t$ is time (in hours), $t \\geq 0$.

**a.** State the initial population. (1 mark)

**b.** Find, in exact form, the time required for the population to double. (3 marks)

**c.** Find $N'(t)$. (2 marks)

**d.** Find the rate of growth at $t = 5$ hours, correct to the nearest bacterium per hour. (2 marks)

**e.** Find, correct to 1 decimal place, the time required for the population to first exceed $5000$. (2 marks)

${img("exponential-growth.svg", "Graph of N(t) = 500 e to the 0.2 t over 12 hours, showing exponential growth from an initial population of 500 to about 5500 bacteria, with the doubling point marked")}`,
    marks: 10,
    difficulty: "MEDIUM",
    solutionContent: `**a. (1 mark)** $N(0) = 500 e^{0} = 500$ bacteria.

**b. (3 marks)**
*Step 1 (1 mark):* Set $N(t) = 1000$: $500 e^{0.2t} = 1000 \\Rightarrow e^{0.2t} = 2$.
*Step 2 (1 mark):* Take logs: $0.2t = \\ln 2$.
*Step 3 (1 mark):* $t = \\dfrac{\\ln 2}{0.2} = 5\\ln 2$ hours.

**c. (2 marks)**
*Step 1 (1 mark):* Chain rule: $\\dfrac{d}{dt}\\left(500 e^{0.2t}\\right) = 500 \\cdot 0.2 \\cdot e^{0.2t}$.
*Step 2 (1 mark):* $N'(t) = 100 e^{0.2t}$.

**d. (2 marks)**
*Step 1 (1 mark):* $N'(5) = 100 e^{1} = 100 e$.
*Step 2 (1 mark):* $\\approx 271.83$, so approximately $272$ bacteria/hour.

**e. (2 marks)**
*Step 1 (1 mark):* Set $N(t) = 5000$: $e^{0.2t} = 10 \\Rightarrow 0.2t = \\ln 10 \\Rightarrow t = 5\\ln 10$.
*Step 2 (1 mark):* $5\\ln 10 \\approx 11.5$ hours.`,
    subtopicSlugs: ["exponential-functions", "differentiation", "chain-rule"],
  },

  {
    content: `A drug is administered at time $t = 0$. Its concentration $C$ (in mg/L) in the bloodstream at time $t$ hours after administration is modelled by

$$C(t) = 10 e^{-0.3t} - 10 e^{-0.5t}, \\quad t \\geq 0.$$

**a.** Show that $C(0) = 0$. (1 mark)

**b.** Find $C'(t)$. (2 marks)

**c.** Find the exact time at which the concentration is at its maximum, in terms of natural logarithms. (4 marks)

**d.** Find the maximum concentration, correct to 2 decimal places. (3 marks)

**e.** State the limiting concentration as $t \\to \\infty$ and interpret this in context. (2 marks)

${img("drug-concentration.svg", "Graph of C(t) = 10 e to the negative 0.3 t minus 10 e to the negative 0.5 t, showing the concentration rising from zero at t = 0 to a peak of about 1.86 mg/L around t = 2.55 hours, then decaying back toward zero")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (1 mark)** $C(0) = 10 e^{0} - 10 e^{0} = 10 - 10 = 0$. ✓

**b. (2 marks)**
*Step 1 (1 mark):* Differentiate each term: $\\dfrac{d}{dt}\\left(10 e^{-0.3t}\\right) = -3 e^{-0.3t}$ and $\\dfrac{d}{dt}\\left(10 e^{-0.5t}\\right) = -5 e^{-0.5t}$.
*Step 2 (1 mark):* $C'(t) = -3 e^{-0.3t} + 5 e^{-0.5t}$.

**c. (4 marks)**
*Step 1 (1 mark):* Set $C'(t) = 0$: $3 e^{-0.3t} = 5 e^{-0.5t}$.
*Step 2 (1 mark):* Divide both sides by $e^{-0.5t}$: $3 e^{-0.3t + 0.5t} = 5$, i.e. $3 e^{0.2t} = 5$.
*Step 3 (1 mark):* $e^{0.2t} = \\dfrac{5}{3} \\Rightarrow 0.2 t = \\ln\\left(\\dfrac{5}{3}\\right)$.
*Step 4 (1 mark):* $t = 5 \\ln\\left(\\dfrac{5}{3}\\right)$ hours.

**d. (3 marks)**
*Step 1 (1 mark):* Numerically, $\\ln(5/3) \\approx 0.5108$, so $t \\approx 2.554$ hours.
*Step 2 (1 mark):* $C(2.554) = 10 e^{-0.766} - 10 e^{-1.277}$.
*Step 3 (1 mark):* $\\approx 10(0.4651) - 10(0.2789) \\approx 4.651 - 2.789 \\approx 1.86$ mg/L.

**e. (2 marks)**
*Step 1 (1 mark):* As $t \\to \\infty$, both $e^{-0.3t}$ and $e^{-0.5t}$ tend to $0$, so $C(t) \\to 0$.
*Step 2 (1 mark):* In context, the drug is eventually fully eliminated from the bloodstream.`,
    subtopicSlugs: ["exponential-functions", "differentiation", "exponential-equations"],
  },

  {
    content: `Let $f(x) = e^{2x} - 4 e^x + 3$ for $x \\in \\mathbb{R}$.

**a.** By letting $u = e^x$, show that the x-intercepts of the graph of $f$ satisfy $u^2 - 4u + 3 = 0$, and hence find the x-intercepts in exact form. (3 marks)

**b.** Find $f'(x)$. (2 marks)

**c.** Find the exact coordinates of the stationary point of $f$. (3 marks)

**d.** Use the second derivative test to classify the stationary point. (2 marks)

**e.** State the y-intercept of the graph and the equation of the horizontal asymptote as $x \\to -\\infty$. (2 marks)

${img("transformed-exponential.svg", "Graph of f(x) = e to the 2x minus 4 e to the x plus 3 for x from -2 to 1.5, showing x-intercepts at x = 0 and x = ln 3, a local minimum at (ln 2, -1), and a horizontal asymptote y = 3 as x tends to negative infinity")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (3 marks)**
*Step 1 (1 mark):* Substitute $u = e^x$: $f(x) = u^2 - 4u + 3$. Set $f(x) = 0$: $u^2 - 4u + 3 = 0$.
*Step 2 (1 mark):* Factor: $(u - 1)(u - 3) = 0$, so $u = 1$ or $u = 3$.
*Step 3 (1 mark):* Back-substitute: $e^x = 1 \\Rightarrow x = 0$, or $e^x = 3 \\Rightarrow x = \\ln 3$. X-intercepts: $x = 0$ and $x = \\ln 3$.

**b. (2 marks)**
*Step 1 (1 mark):* $\\dfrac{d}{dx}\\left(e^{2x}\\right) = 2 e^{2x}$ (chain rule).
*Step 2 (1 mark):* $f'(x) = 2 e^{2x} - 4 e^x$.

**c. (3 marks)**
*Step 1 (1 mark):* Set $f'(x) = 0$: $2 e^{2x} = 4 e^x$. Divide by $2 e^x$: $e^x = 2$.
*Step 2 (1 mark):* $x = \\ln 2$.
*Step 3 (1 mark):* $f(\\ln 2) = e^{2 \\ln 2} - 4 e^{\\ln 2} + 3 = 4 - 8 + 3 = -1$. Stationary point: $(\\ln 2, -1)$.

**d. (2 marks)**
*Step 1 (1 mark):* $f''(x) = 4 e^{2x} - 4 e^x$.
*Step 2 (1 mark):* $f''(\\ln 2) = 4 \\cdot 4 - 4 \\cdot 2 = 8 > 0$, so the stationary point is a local minimum.

**e. (2 marks)**
*Step 1 (1 mark):* y-intercept: $f(0) = 1 - 4 + 3 = 0$.
*Step 2 (1 mark):* As $x \\to -\\infty$, $e^{2x} \\to 0$ and $e^x \\to 0$, so $f(x) \\to 3$. Horizontal asymptote: $y = 3$.`,
    subtopicSlugs: ["exponential-functions", "exponential-equations", "stationary-points-and-curve-sketching"],
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
