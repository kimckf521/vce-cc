/**
 * Wave 1, batch 6: Rates of Change ext-resp questions.
 *
 * 4 extended-response questions for the Rates of Change subtopic.
 * First batch to use the `tangentAt` option in functionPlot (Q3 visualises
 * the instantaneous rate as a tangent line).
 *
 * Output: scripts/output/qset-methods-b2-rates-of-change.json
 *
 * Usage:
 *   npx tsx scripts/figures/generate-rates-of-change.ts
 */

import * as fs from "fs";
import * as path from "path";
import { functionPlot, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/rates-of-change";
const JSON_PATH = "scripts/output/qset-methods-b2-rates-of-change.json";

fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Diagrams ───────────────────────────────────────────────────────────

const fig1 = functionPlot({
  fn: (t) => t ** 3 - 6 * t ** 2 + 9 * t + 2,
  xRange: [0, 5],
  yRange: [-1, 22],
  fnLabel: "x(t) = t³ − 6t² + 9t + 2",
  fnLabelAt: { x: 2.4, y: 19 },
  xLabel: "t (s)",
  yLabel: "x (m)",
  xTicks: [1, 2, 3, 4, 5],
  yTicks: [2, 6, 10, 15, 20],
  markedPoints: [
    { x: 0, label: "(0, 2)" },
    { x: 1, label: "(1, 6) rest" },
    { x: 3, label: "(3, 2) rest" },
  ],
});

const fig2 = functionPlot({
  fn: (t) => 200 * (10 - t) ** 2,
  xRange: [0, 10],
  yRange: [0, 22000],
  fnLabel: "V(t) = 200(10 − t)²",
  fnLabelAt: { x: 3.5, y: 18500 },
  xLabel: "t (min)",
  yLabel: "V (L)",
  xTicks: [2, 4, 5, 6, 8, 10],
  yTicks: [5000, 10000, 15000, 20000],
  markedPoints: [
    { x: 0, label: "(0, 20000)" },
    { x: 10, label: "(10, 0) empty" },
  ],
  color: "#0369a1",
});

const fig3 = functionPlot({
  fn: (t) => (Math.PI * t * t) / 4,
  xRange: [0, 10],
  yRange: [0, 80],
  fnLabel: "A(t) = π t²/4",
  fnLabelAt: { x: 0.6, y: 70 },
  xLabel: "t (min)",
  yLabel: "A (m²)",
  xTicks: [2, 4, 6, 8, 10],
  yTicks: [10, 20, 40, 60, 80],
  markedPoints: [{ x: 4, label: "(4, 4π)" }],
  tangentAt: { x: 4, color: "#16a34a" },
});

const fig4 = functionPlot({
  fn: (t) => 50 + 10 * t - 0.25 * t * t,
  xRange: [0, 30],
  yRange: [40, 160],
  fnLabel: "P(t) = 50 + 10t − 0.25 t²",
  fnLabelAt: { x: 3, y: 152 },
  xLabel: "t (years from 2000)",
  yLabel: "P (thousand)",
  xTicks: [5, 10, 15, 20, 25, 30],
  yTicks: [50, 75, 100, 125, 150],
  markedPoints: [
    { x: 0, label: "(0, 50)" },
    { x: 20, label: "(20, 150) max" },
  ],
  color: "#7c3aed",
});

const figures: Record<string, string> = {
  "particle-motion.svg": fig1,
  "tank-draining.svg": fig2,
  "oil-slick-area.svg": fig3,
  "town-population.svg": fig4,
};

for (const [name, content] of Object.entries(figures)) {
  fs.writeFileSync(path.join(FIGURES_DIR, name), content);
}

const img = (name: string, alt: string): string =>
  `![${alt}](${toDataUri(figures[name])})`;

// ─── Questions ──────────────────────────────────────────────────────────

const questions = [
  {
    content: `A particle moves along a straight line. Its position $x$ (in metres) from the origin at time $t$ (in seconds) is given by

$$x(t) = t^3 - 6t^2 + 9t + 2, \\quad t \\geq 0.$$

**a.** State the initial position of the particle. (1 mark)

**b.** Find the velocity $v(t)$ and the acceleration $a(t)$. (2 marks)

**c.** Find all times at which the particle is momentarily at rest. (3 marks)

**d.** State the velocity at $t = 2$ seconds, and explain what its sign tells you about the motion at that instant. (2 marks)

**e.** Find the displacement of the particle from its initial position at $t = 4$ seconds. (2 marks)

${img("particle-motion.svg", "Position graph x(t) = t cubed minus 6 t squared plus 9 t plus 2 for t from 0 to 5 seconds, showing the particle starting at x = 2, reaching local maximum (1, 6), local minimum (3, 2), then continuing to rise")}`,
    marks: 10,
    difficulty: "MEDIUM",
    solutionContent: `**a. (1 mark)** $x(0) = 2$ m.

**b. (2 marks)**
*Step 1 (1 mark):* Velocity: $v(t) = x'(t) = 3 t^2 - 12 t + 9$.
*Step 2 (1 mark):* Acceleration: $a(t) = v'(t) = 6 t - 12$.

**c. (3 marks)**
*Step 1 (1 mark):* Set $v(t) = 0$: $3 t^2 - 12 t + 9 = 0$.
*Step 2 (1 mark):* Divide by 3 and factor: $t^2 - 4 t + 3 = (t - 1)(t - 3) = 0$.
*Step 3 (1 mark):* $t = 1$ second or $t = 3$ seconds.

**d. (2 marks)**
*Step 1 (1 mark):* $v(2) = 12 - 24 + 9 = -3$ m/s.
*Step 2 (1 mark):* The negative sign indicates the particle is moving in the negative direction (back toward the origin) at $t = 2$.

**e. (2 marks)**
*Step 1 (1 mark):* $x(4) = 64 - 96 + 36 + 2 = 6$ m.
*Step 2 (1 mark):* Displacement from initial position $= x(4) - x(0) = 6 - 2 = 4$ m.`,
    subtopicSlugs: ["rates-of-change", "differentiation", "polynomial-functions"],
  },

  {
    content: `A cylindrical water tank is being drained. The volume $V$ (in litres) of water in the tank at time $t$ (in minutes) after draining begins is given by

$$V(t) = 200 (10 - t)^2, \\quad 0 \\leq t \\leq 10.$$

**a.** State the initial volume of water in the tank. (1 mark)

**b.** Find the time at which the tank becomes empty. (1 mark)

**c.** Find $V'(t)$. (2 marks)

**d.** State the rate of change of volume at $t = 0$, $t = 5$, and $t = 10$ (in L/min). (3 marks)

**e.** Interpret what the changing magnitude of the rate over time suggests about the draining process. (2 marks)

**f.** Find the average rate of draining over the entire $10$ minutes. (2 marks)

${img("tank-draining.svg", "Volume graph V(t) = 200 (10 - t) squared for t from 0 to 10 minutes, showing the parabolic decay from 20000 litres at t = 0 to 0 litres at t = 10")}`,
    marks: 11,
    difficulty: "MEDIUM",
    solutionContent: `**a. (1 mark)** $V(0) = 200 \\times 100 = 20{,}000$ L.

**b. (1 mark)** $V(t) = 0 \\Rightarrow (10 - t)^2 = 0 \\Rightarrow t = 10$ minutes.

**c. (2 marks)**
*Step 1 (1 mark):* Use the chain rule: $\\dfrac{d}{dt}\\left[(10 - t)^2\\right] = 2(10 - t)(-1) = -2(10 - t)$.
*Step 2 (1 mark):* $V'(t) = 200 \\cdot (-2)(10 - t) = -400(10 - t)$.

**d. (3 marks)**
*Step 1 (1 mark):* $V'(0) = -400 \\times 10 = -4000$ L/min.
*Step 2 (1 mark):* $V'(5) = -400 \\times 5 = -2000$ L/min.
*Step 3 (1 mark):* $V'(10) = -400 \\times 0 = 0$ L/min.

**e. (2 marks)**
*Step 1 (1 mark):* The negative sign indicates volume is decreasing throughout (water is leaving the tank).
*Step 2 (1 mark):* The magnitude is largest at $t = 0$ and decreases to $0$ at $t = 10$ — the tank drains fastest at the start and gradually slows, which is consistent with gravity-driven outflow where flow rate depends on remaining water depth.

**f. (2 marks)**
*Step 1 (1 mark):* Average rate $= \\dfrac{V(10) - V(0)}{10 - 0} = \\dfrac{0 - 20000}{10}$.
*Step 2 (1 mark):* $= -2000$ L/min.`,
    subtopicSlugs: ["rates-of-change", "differentiation", "chain-rule"],
  },

  {
    content: `An oil slick is approximately circular in shape. The radius $r$ (in metres) increases at a constant rate of $0.5$ m/min. Let $A$ be the area of the slick (in square metres) and $t$ be time (in minutes) since the slick began forming. At $t = 0$, the radius is $0$.

**a.** Write $r$ as a function of $t$. (1 mark)

**b.** Write $A$ as a function of $r$. (1 mark)

**c.** Express $A$ as a function of $t$. (2 marks)

**d.** Find $\\dfrac{dA}{dt}$. (2 marks)

**e.** Find the rate at which the area is increasing at $t = 4$ minutes. Give an exact answer in m²/min. (2 marks)

**f.** Find the time at which the area first reaches $50$ m². Give an exact answer. (4 marks)

${img("oil-slick-area.svg", "Graph of A(t) = pi t squared over 4 from t = 0 to t = 10 minutes showing the parabolic growth of area, with a tangent line drawn at t = 4 to illustrate the instantaneous rate of change there")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (1 mark)** Constant rate from $r(0) = 0$: $r(t) = 0.5 t$.

**b. (1 mark)** $A(r) = \\pi r^2$.

**c. (2 marks)**
*Step 1 (1 mark):* Substitute $r = 0.5 t$: $A = \\pi (0.5 t)^2$.
*Step 2 (1 mark):* $A(t) = \\dfrac{\\pi t^2}{4}$.

**d. (2 marks)**
*Step 1 (1 mark):* Differentiate $A(t) = \\dfrac{\\pi}{4} t^2$.
*Step 2 (1 mark):* $\\dfrac{dA}{dt} = \\dfrac{\\pi t}{2}$.

**e. (2 marks)**
*Step 1 (1 mark):* Substitute $t = 4$: $\\dfrac{dA}{dt}\\bigg|_{t=4} = \\dfrac{4\\pi}{2}$.
*Step 2 (1 mark):* $= 2\\pi$ m²/min.

**f. (4 marks)**
*Step 1 (1 mark):* Set $A(t) = 50$: $\\dfrac{\\pi t^2}{4} = 50$.
*Step 2 (1 mark):* $t^2 = \\dfrac{200}{\\pi}$.
*Step 3 (1 mark):* $t = \\sqrt{\\dfrac{200}{\\pi}}$ (taking positive root since $t \\geq 0$).
*Step 4 (1 mark):* Simplify: $t = \\dfrac{\\sqrt{200}}{\\sqrt{\\pi}} = \\dfrac{10\\sqrt{2}}{\\sqrt{\\pi}} = 10\\sqrt{\\dfrac{2}{\\pi}}$ minutes.`,
    subtopicSlugs: ["rates-of-change", "differentiation", "composite-functions"],
  },

  {
    content: `The population $P$ (in thousands) of a small town at time $t$ (in years from 2000) is modelled by

$$P(t) = 50 + 10 t - 0.25 t^2, \\quad 0 \\leq t \\leq 30.$$

**a.** State the population in 2000. (1 mark)

**b.** Find $P'(t)$ and use it to find the year in which the population is increasing fastest. (3 marks)

**c.** Find the maximum population and the year in which it is reached. (3 marks)

**d.** Find the average rate of change of population from 2000 to 2010 (in thousand per year). (2 marks)

**e.** Find, in exact form, the year in which the population would first return to its $2000$ value if the model were extrapolated beyond 2030. (3 marks)

${img("town-population.svg", "Graph of P(t) = 50 + 10 t minus 0.25 t squared from t = 0 to 30 years, showing the population rising from 50 thousand in 2000 to a maximum of 150 thousand in 2020 then declining")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (1 mark)** $P(0) = 50$ thousand.

**b. (3 marks)**
*Step 1 (1 mark):* $P'(t) = 10 - 0.5 t$.
*Step 2 (1 mark):* $P''(t) = -0.5 < 0$, so $P'(t)$ is strictly decreasing throughout the interval.
*Step 3 (1 mark):* Hence $P'(t)$ is largest at $t = 0$ — the population grows fastest in $2000$ (at $P'(0) = 10$ thousand/year).

**c. (3 marks)**
*Step 1 (1 mark):* Maximum population when $P'(t) = 0$: $10 - 0.5 t = 0 \\Rightarrow t = 20$.
*Step 2 (1 mark):* $P(20) = 50 + 200 - 100 = 150$ thousand.
*Step 3 (1 mark):* Maximum is $150{,}000$ in year $2020$.

**d. (2 marks)**
*Step 1 (1 mark):* $P(10) = 50 + 100 - 25 = 125$ thousand.
*Step 2 (1 mark):* Average rate $= \\dfrac{P(10) - P(0)}{10} = \\dfrac{125 - 50}{10} = 7.5$ thousand/year.

**e. (3 marks)**
*Step 1 (1 mark):* Set $P(t) = 50$: $50 + 10 t - 0.25 t^2 = 50 \\Rightarrow 10 t - 0.25 t^2 = 0$.
*Step 2 (1 mark):* Factor: $0.25 t (40 - t) = 0$, so $t = 0$ or $t = 40$.
*Step 3 (1 mark):* The other root is $t = 40$, corresponding to year $2040$.`,
    subtopicSlugs: ["rates-of-change", "differentiation", "polynomial-functions"],
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
