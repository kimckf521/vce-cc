/**
 * Wave 1, batch 3: Trigonometric Functions ext-resp questions.
 *
 * 4 extended-response questions for the Trigonometric Functions subtopic.
 * Output: scripts/output/qset-methods-b2-trigonometric-functions.json
 *
 * Usage:
 *   npx tsx scripts/figures/generate-trigonometric-functions.ts
 */

import * as fs from "fs";
import * as path from "path";
import { functionPlot, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/trigonometric-functions";
const JSON_PATH = "scripts/output/qset-methods-b2-trigonometric-functions.json";

fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Diagrams ───────────────────────────────────────────────────────────

const fig1 = functionPlot({
  fn: (t) => 5 + 3 * Math.sin((Math.PI * t) / 6),
  xRange: [0, 24],
  yRange: [0, 10],
  fnLabel: "d(t) = 5 + 3 sin(πt/6)",
  fnLabelAt: { x: 9, y: 9.3 },
  xLabel: "t (h)",
  yLabel: "d (m)",
  xTicks: [3, 6, 9, 12, 15, 18, 21, 24],
  yTicks: [2, 5, 8],
  markedPoints: [
    { x: 3, label: "high (8 m)" },
    { x: 9, label: "low (2 m)" },
  ],
  color: "#0369a1",
});

const fig2 = functionPlot({
  fn: (t) => 12 - 10 * Math.cos(Math.PI * t),
  xRange: [0, 5],
  yRange: [0, 24],
  fnLabel: "h(t) = 12 − 10 cos(πt)",
  fnLabelAt: { x: 1.6, y: 23 },
  xLabel: "t (min)",
  yLabel: "h (m)",
  xTicks: [1, 2, 3, 4, 5],
  yTicks: [2, 12, 22],
  markedPoints: [
    { x: 0, label: "(0, 2) board" },
    { x: 1, label: "(1, 22) top" },
  ],
  color: "#7c3aed",
});

const fig3 = functionPlot({
  fn: (x) => Math.sin(2 * x),
  xRange: [0, 2 * Math.PI],
  yRange: [-1.3, 1.3],
  fnLabel: "f(x) = sin(2x)",
  fnLabelAt: { x: 3.3, y: 1.2 },
  xTicks: [Math.PI / 2, Math.PI, (3 * Math.PI) / 2, 2 * Math.PI].map((v) => Number(v.toFixed(4))),
  yTicks: [-1, 1],
  shadedRange: { from: 0, to: Math.PI / 2, fill: "#dbeafe" },
  markedPoints: [
    { x: 0, label: "0" },
    { x: Math.PI / 2, label: "π/2" },
    { x: Math.PI, label: "π" },
    { x: (3 * Math.PI) / 2, label: "3π/2" },
    { x: 2 * Math.PI, label: "2π" },
  ],
});

const fig4 = functionPlot({
  fn: (t) => 18 - 8 * Math.cos((Math.PI * (t - 4)) / 12),
  xRange: [0, 24],
  yRange: [5, 30],
  fnLabel: "T(t) = 18 − 8 cos(π(t−4)/12)",
  fnLabelAt: { x: 6, y: 28 },
  xLabel: "t (h)",
  yLabel: "T (°C)",
  xTicks: [4, 8, 12, 16, 20, 24],
  yTicks: [10, 14, 18, 22, 26],
  markedPoints: [
    { x: 4, label: "min (10°C)" },
    { x: 16, label: "max (26°C)" },
  ],
  color: "#dc2626",
});

const figures: Record<string, string> = {
  "tidal-depth.svg": fig1,
  "ferris-wheel.svg": fig2,
  "sin-2x-shaded.svg": fig3,
  "daily-temperature.svg": fig4,
};

for (const [name, content] of Object.entries(figures)) {
  fs.writeFileSync(path.join(FIGURES_DIR, name), content);
}

const img = (name: string, alt: string): string =>
  `![${alt}](${toDataUri(figures[name])})`;

// ─── Questions ──────────────────────────────────────────────────────────

const questions = [
  {
    content: `The depth $d$ (in metres) of water at a harbour entrance at time $t$ hours after midnight is modelled by

$$d(t) = 5 + 3 \\sin\\left(\\frac{\\pi t}{6}\\right), \\quad 0 \\leq t \\leq 24.$$

**a.** State the maximum and minimum depths of water at the harbour entrance. (2 marks)

**b.** State the period of the model in hours, and briefly explain what this period represents physically. (2 marks)

**c.** Find $d'(t)$. (2 marks)

**d.** Find $d'(3)$, and interpret the result in the context of the tides. (2 marks)

**e.** Find all times $t$ in $[0, 12]$ at which the depth equals $6.5$ m. (2 marks)

${img("tidal-depth.svg", "Graph of tidal depth d(t) = 5 + 3 sin(pi t over 6) over 24 hours, showing two complete tide cycles with high tides at 3 and 15 hours (depth 8 m) and low tides at 9 and 21 hours (depth 2 m)")}`,
    marks: 10,
    difficulty: "MEDIUM",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* Maximum when $\\sin(\\pi t/6) = 1$: $d_{\\max} = 5 + 3 = 8$ m.
*Step 2 (1 mark):* Minimum when $\\sin(\\pi t/6) = -1$: $d_{\\min} = 5 - 3 = 2$ m.

**b. (2 marks)**
*Step 1 (1 mark):* Period $= \\dfrac{2\\pi}{\\pi/6} = 12$ hours.
*Step 2 (1 mark):* This is the time between consecutive high tides (one complete tide cycle).

**c. (2 marks)**
*Step 1 (1 mark):* Chain rule: $\\dfrac{d}{dt}\\left[3 \\sin(\\pi t / 6)\\right] = 3 \\cdot \\dfrac{\\pi}{6} \\cos(\\pi t / 6)$.
*Step 2 (1 mark):* $d'(t) = \\dfrac{\\pi}{2} \\cos\\left(\\dfrac{\\pi t}{6}\\right)$.

**d. (2 marks)**
*Step 1 (1 mark):* $d'(3) = \\dfrac{\\pi}{2} \\cos(\\pi / 2) = 0$ m/h.
*Step 2 (1 mark):* At $t = 3$ hours the depth is momentarily neither rising nor falling — this is the turning point (high tide).

**e. (2 marks)**
*Step 1 (1 mark):* $d(t) = 6.5 \\Rightarrow \\sin(\\pi t/6) = \\dfrac{1}{2}$, so $\\dfrac{\\pi t}{6} = \\dfrac{\\pi}{6}$ or $\\dfrac{5\\pi}{6}$ in $[0, 2\\pi]$.
*Step 2 (1 mark):* $t = 1$ hour or $t = 5$ hours.`,
    subtopicSlugs: ["trigonometric-functions", "trigonometric-equations", "differentiation"],
  },

  {
    content: `A ferris wheel of radius $10$ m rotates at constant speed, completing one revolution every $2$ minutes. The lowest point of the wheel is $2$ m above the ground. The height $h$ (in metres) of a passenger above the ground at time $t$ minutes after boarding is given by

$$h(t) = 12 - 10 \\cos(\\pi t), \\quad t \\geq 0.$$

**a.** Verify that $h(0) = 2$, consistent with boarding at the lowest point. (1 mark)

**b.** State the period of $h$ and confirm it equals 2 minutes. (2 marks)

**c.** State the maximum height reached by the passenger. (1 mark)

**d.** Find the first time at which the passenger is exactly $17$ m above the ground. Give your answer in exact form. (3 marks)

**e.** Find $h'(t)$, and use it to determine the rate (in m/min) at which the passenger is rising at $t = 0.5$ minutes. (4 marks)

${img("ferris-wheel.svg", "Graph of ferris wheel passenger height h(t) = 12 - 10 cos(pi t) over 5 minutes, showing the height oscillating between 2 m at boarding and 22 m at the top with a period of 2 minutes")}`,
    marks: 11,
    difficulty: "MEDIUM",
    solutionContent: `**a. (1 mark)** $h(0) = 12 - 10 \\cos(0) = 12 - 10 = 2$ ✓.

**b. (2 marks)**
*Step 1 (1 mark):* Period $= \\dfrac{2\\pi}{\\pi} = 2$ minutes ✓.
*Step 2 (1 mark):* This matches the stated revolution time of 2 minutes per cycle.

**c. (1 mark)** Maximum height $= 12 + 10 = 22$ m (when $\\cos(\\pi t) = -1$).

**d. (3 marks)**
*Step 1 (1 mark):* Set $h(t) = 17$: $12 - 10 \\cos(\\pi t) = 17 \\Rightarrow \\cos(\\pi t) = -\\dfrac{1}{2}$.
*Step 2 (1 mark):* First positive solution: $\\pi t = \\dfrac{2\\pi}{3}$.
*Step 3 (1 mark):* $t = \\dfrac{2}{3}$ minutes.

**e. (4 marks)**
*Step 1 (1 mark):* Chain rule: $\\dfrac{d}{dt}\\left[-10 \\cos(\\pi t)\\right] = 10 \\pi \\sin(\\pi t)$.
*Step 2 (1 mark):* $h'(t) = 10 \\pi \\sin(\\pi t)$.
*Step 3 (1 mark):* $h'(0.5) = 10 \\pi \\sin(\\pi/2) = 10 \\pi$.
*Step 4 (1 mark):* $10 \\pi \\approx 31.4$ m/min (positive — passenger is rising).`,
    subtopicSlugs: ["trigonometric-functions", "differentiation", "chain-rule"],
  },

  {
    content: `Let $f(x) = 2 \\sin x \\cos x$ for $x \\in [0, 2\\pi]$.

**a.** Show that $f(x) = \\sin(2x)$. (1 mark)

**b.** State the maximum and minimum values of $f$. (2 marks)

**c.** State the period of $f$. (1 mark)

**d.** Find all values of $x$ in $[0, 2\\pi]$ for which $f(x) = 0$. (3 marks)

**e.** Find $f'(x)$. (1 mark)

**f.** Find the exact area enclosed between the curve $y = f(x)$ and the $x$-axis on the interval $\\left[0, \\dfrac{\\pi}{2}\\right]$. (4 marks)

${img("sin-2x-shaded.svg", "Graph of f(x) = sin(2x) on the interval from 0 to 2 pi, showing the curve completing two full periods, with the region between the curve and the x-axis from x = 0 to x = pi over 2 shaded")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (1 mark)** By the double angle formula, $\\sin(2x) = 2 \\sin x \\cos x$. So $f(x) = \\sin(2x)$.

**b. (2 marks)**
*Step 1 (1 mark):* Maximum of $\\sin$ is $1$, so $f_{\\max} = 1$.
*Step 2 (1 mark):* Minimum of $\\sin$ is $-1$, so $f_{\\min} = -1$.

**c. (1 mark)** Period $= \\dfrac{2\\pi}{2} = \\pi$.

**d. (3 marks)**
*Step 1 (1 mark):* Set $\\sin(2x) = 0$: $2x = 0, \\pi, 2\\pi, 3\\pi, 4\\pi$ for $2x \\in [0, 4\\pi]$.
*Step 2 (1 mark):* Divide each by 2: $x = 0, \\dfrac{\\pi}{2}, \\pi, \\dfrac{3\\pi}{2}, 2\\pi$.
*Step 3 (1 mark):* All five values are in $[0, 2\\pi]$.

**e. (1 mark)** $f'(x) = 2 \\cos(2x)$ (chain rule).

**f. (4 marks)**
*Step 1 (1 mark):* On $\\left[0, \\dfrac{\\pi}{2}\\right]$, $\\sin(2x) \\geq 0$, so area $= \\displaystyle\\int_{0}^{\\pi/2} \\sin(2x)\\, dx$.
*Step 2 (1 mark):* Antiderivative: $-\\dfrac{1}{2} \\cos(2x)$.
*Step 3 (1 mark):* Evaluate: $\\left[-\\dfrac{1}{2} \\cos(2x)\\right]_{0}^{\\pi/2} = -\\dfrac{1}{2} \\cos(\\pi) - \\left(-\\dfrac{1}{2} \\cos(0)\\right) = \\dfrac{1}{2} + \\dfrac{1}{2}$.
*Step 4 (1 mark):* Area $= 1$ square unit.`,
    subtopicSlugs: ["trigonometric-functions", "trigonometric-equations", "area-under-curves"],
  },

  {
    content: `The temperature $T$ (in °C) on a particular day at time $t$ hours after midnight is modelled by

$$T(t) = 18 - 8 \\cos\\left(\\frac{\\pi (t - 4)}{12}\\right), \\quad 0 \\leq t \\leq 24.$$

**a.** Find the temperature at midnight ($t = 0$), giving an exact answer. (2 marks)

**b.** Find the maximum and minimum temperatures, and the times during the day at which they occur. (4 marks)

**c.** Find all times $t$ in $[0, 24]$ at which the temperature equals $22$°C. (4 marks)

**d.** Find $T'(8)$, correct to 2 decimal places, and interpret in context. (2 marks)

${img("daily-temperature.svg", "Graph of daily temperature T(t) = 18 - 8 cos(pi (t-4) over 12) over 24 hours, showing minimum temperature 10 degrees Celsius at t = 4 hours and maximum 26 degrees Celsius at t = 16 hours")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* $T(0) = 18 - 8 \\cos\\left(\\dfrac{-4\\pi}{12}\\right) = 18 - 8 \\cos\\left(\\dfrac{\\pi}{3}\\right)$ (cosine is even).
*Step 2 (1 mark):* $= 18 - 8 \\cdot \\dfrac{1}{2} = 14$°C.

**b. (4 marks)**
*Step 1 (1 mark):* Maximum when $\\cos\\left(\\dfrac{\\pi(t-4)}{12}\\right) = -1$, i.e. $\\dfrac{\\pi(t-4)}{12} = \\pi$.
*Step 2 (1 mark):* $t - 4 = 12 \\Rightarrow t = 16$. Max $T = 18 + 8 = 26$°C at $t = 16$ (4 pm).
*Step 3 (1 mark):* Minimum when $\\cos(...) = 1$: $\\dfrac{\\pi(t-4)}{12} = 0 \\Rightarrow t = 4$.
*Step 4 (1 mark):* Min $T = 18 - 8 = 10$°C at $t = 4$ (4 am).

**c. (4 marks)**
*Step 1 (1 mark):* Set $T(t) = 22$: $-8 \\cos\\left(\\dfrac{\\pi(t-4)}{12}\\right) = 4 \\Rightarrow \\cos\\left(\\dfrac{\\pi(t-4)}{12}\\right) = -\\dfrac{1}{2}$.
*Step 2 (1 mark):* Let $\\theta = \\dfrac{\\pi(t-4)}{12}$. For $t \\in [0, 24]$, $\\theta \\in \\left[-\\dfrac{\\pi}{3}, \\dfrac{5\\pi}{3}\\right]$. Solutions to $\\cos\\theta = -\\dfrac{1}{2}$: $\\theta = \\dfrac{2\\pi}{3}$ or $\\theta = \\dfrac{4\\pi}{3}$.
*Step 3 (1 mark):* $\\dfrac{\\pi(t-4)}{12} = \\dfrac{2\\pi}{3} \\Rightarrow t - 4 = 8 \\Rightarrow t = 12$.
*Step 4 (1 mark):* $\\dfrac{\\pi(t-4)}{12} = \\dfrac{4\\pi}{3} \\Rightarrow t - 4 = 16 \\Rightarrow t = 20$.

**d. (2 marks)**
*Step 1 (1 mark):* $T'(t) = -8 \\cdot \\left(-\\dfrac{\\pi}{12}\\right) \\sin\\left(\\dfrac{\\pi(t-4)}{12}\\right) = \\dfrac{2\\pi}{3} \\sin\\left(\\dfrac{\\pi(t-4)}{12}\\right)$. So $T'(8) = \\dfrac{2\\pi}{3} \\sin\\left(\\dfrac{\\pi}{3}\\right) = \\dfrac{2\\pi}{3} \\cdot \\dfrac{\\sqrt{3}}{2} = \\dfrac{\\pi\\sqrt{3}}{3} \\approx 1.81$°C/h.
*Step 2 (1 mark):* At $t = 8$ (8 am), the temperature is rising at approximately $1.81$°C per hour.`,
    subtopicSlugs: ["trigonometric-functions", "trigonometric-equations", "differentiation", "chain-rule"],
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
