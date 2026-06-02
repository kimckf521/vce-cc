/** Wave 1 batch 9: Transformations ext-resp. */
import * as fs from "fs";
import * as path from "path";
import { functionPlot, toDataUri } from "./svg";

const DIR = "scripts/output/figures/transformations";
const OUT = "scripts/output/qset-methods-b2-transformations.json";
fs.mkdirSync(DIR, { recursive: true });

const fig1 = functionPlot({
  fn: (x) => x * x, xRange: [-4, 4], yRange: [-2, 10],
  fnLabel: "y = x² (base)", fnLabelAt: { x: 2.2, y: 8 },
  xTicks: [-3, -2, -1, 1, 2, 3], yTicks: [2, 4, 6, 8],
  additionalFns: [{ fn: (x) => 2 * (x - 1) ** 2 - 3, color: "#16a34a", label: "y = 2(x − 1)² − 3", labelAt: { x: -3.8, y: 9 } }],
  markedPoints: [{ x: 0, label: "(0, 0)" }, { x: 1, label: "(1, −3)" }],
});

const fig2 = functionPlot({
  fn: (x) => Math.sin(x), xRange: [-Math.PI, 2 * Math.PI], yRange: [-3, 3],
  fnLabel: "y = sin(x)", fnLabelAt: { x: 4, y: 1.2 },
  xTicks: [-Math.PI, 0, Math.PI, 2 * Math.PI].map(v => Number(v.toFixed(3))),
  yTicks: [-2, -1, 1, 2],
  additionalFns: [{ fn: (x) => 2 * Math.sin(x - Math.PI / 4), color: "#dc2626", label: "y = 2 sin(x − π/4)", labelAt: { x: -2.8, y: 2.5 } }],
});

const fig3 = functionPlot({
  fn: (x) => Math.exp(x), xRange: [-2, 3], yRange: [-3, 8],
  fnLabel: "y = eˣ", fnLabelAt: { x: 2, y: 7.5 },
  xTicks: [-1, 1, 2], yTicks: [-2, 2, 4, 6],
  additionalFns: [{ fn: (x) => -Math.exp(x - 1) + 2, color: "#7c3aed", label: "y = −e^(x−1) + 2", labelAt: { x: -1.8, y: -2.5 } }],
  asymptotes: [{ y: 2, label: "y = 2 (transformed)" }, { y: 0, label: "y = 0 (base)" }],
});

const fig4 = functionPlot({
  fn: (x) => Math.log(x), xRange: [0.1, 5], yRange: [-3, 4],
  fnLabel: "y = ln(x)", fnLabelAt: { x: 3.2, y: 1.3 },
  xTicks: [1, 2, 3, 4], yTicks: [-2, 1, 2, 3],
  additionalFns: [{ fn: (x) => Math.log(x - 1) + 3, color: "#0891b2", label: "y = ln(x − 1) + 3", labelAt: { x: 1.5, y: 3.8 } }],
});

const figs = { "quadratic-transformed.svg": fig1, "sine-transformed.svg": fig2, "exp-reflected.svg": fig3, "log-transformed.svg": fig4 };
for (const [n, c] of Object.entries(figs)) fs.writeFileSync(path.join(DIR, n), c);
const img = (n: string, a: string) => `![${a}](${toDataUri(figs[n as keyof typeof figs])})`;

const questions = [
  {
    content: `The graph of $y = 2(x - 1)^2 - 3$ is obtained from the graph of $y = x^2$ by a sequence of three transformations.

**a.** Describe the three transformations in order. (3 marks)

**b.** State the coordinates of the vertex of $y = 2(x - 1)^2 - 3$. (1 mark)

**c.** Find the y-intercept. (2 marks)

**d.** Find the x-intercepts in exact form. (4 marks)

${img("quadratic-transformed.svg", "Both y = x squared (red) and y = 2 (x minus 1) squared minus 3 (green) on the same axes, showing the original parabola and the transformed one with vertex shifted to (1, -3) and steeper")}`,
    marks: 10,
    difficulty: "MEDIUM",
    solutionContent: `**a. (3 marks)**
*Step 1 (1 mark):* Dilation by factor 2 from x-axis: $y = 2x^2$.
*Step 2 (1 mark):* Translation 1 unit right: $y = 2(x - 1)^2$.
*Step 3 (1 mark):* Translation 3 units down: $y = 2(x - 1)^2 - 3$.

**b. (1 mark)** Vertex: $(1, -3)$.

**c. (2 marks)**
*Step 1 (1 mark):* $x = 0$: $y = 2(1) - 3$.
*Step 2 (1 mark):* $y = -1$.

**d. (4 marks)**
*Step 1 (1 mark):* Set $y = 0$: $2(x - 1)^2 = 3$.
*Step 2 (1 mark):* $(x - 1)^2 = \\dfrac{3}{2}$.
*Step 3 (1 mark):* $x - 1 = \\pm \\sqrt{\\dfrac{3}{2}} = \\pm \\dfrac{\\sqrt{6}}{2}$.
*Step 4 (1 mark):* $x = 1 \\pm \\dfrac{\\sqrt{6}}{2}$.`,
    subtopicSlugs: ["transformations", "polynomial-functions"],
  },
  {
    content: `Let $g(x) = 2 \\sin\\left(x - \\dfrac{\\pi}{4}\\right)$.

**a.** Describe how the graph of $g$ is obtained from $y = \\sin(x)$ by a sequence of two transformations. (2 marks)

**b.** State the amplitude and period of $g$. (2 marks)

**c.** State the range of $g$. (1 mark)

**d.** Find the value of $g\\left(\\dfrac{\\pi}{4}\\right)$. (2 marks)

**e.** Find all values of $x$ in $[0, 2\\pi]$ for which $g(x) = \\sqrt{2}$. (4 marks)

${img("sine-transformed.svg", "Both y = sin(x) (red) and y = 2 sin(x minus pi over 4) (dark red) on the same axes, showing the original sine wave and the transformed one with amplitude 2 and a phase shift of pi/4 to the right")}`,
    marks: 11,
    difficulty: "MEDIUM",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* Dilation by factor 2 from x-axis: $y = 2 \\sin(x)$.
*Step 2 (1 mark):* Translation $\\dfrac{\\pi}{4}$ to the right: $y = 2 \\sin\\left(x - \\dfrac{\\pi}{4}\\right)$.

**b. (2 marks)**
*Step 1 (1 mark):* Amplitude $= 2$.
*Step 2 (1 mark):* Period $= 2\\pi$ (unchanged).

**c. (1 mark)** Range: $[-2, 2]$.

**d. (2 marks)**
*Step 1 (1 mark):* $g(\\pi/4) = 2 \\sin(0)$.
*Step 2 (1 mark):* $= 0$.

**e. (4 marks)**
*Step 1 (1 mark):* $2 \\sin(x - \\pi/4) = \\sqrt{2} \\Rightarrow \\sin(x - \\pi/4) = \\dfrac{\\sqrt{2}}{2}$.
*Step 2 (1 mark):* Let $u = x - \\pi/4 \\in [-\\pi/4, 7\\pi/4]$. $\\sin u = \\dfrac{\\sqrt{2}}{2} \\Rightarrow u = \\dfrac{\\pi}{4}$ or $\\dfrac{3\\pi}{4}$.
*Step 3 (1 mark):* $x = \\dfrac{\\pi}{2}$ or $x = \\pi$.
*Step 4 (1 mark):* Both values lie in $[0, 2\\pi]$.`,
    subtopicSlugs: ["transformations", "trigonometric-functions", "trigonometric-equations"],
  },
  {
    content: `Let $f(x) = -e^{x - 1} + 2$.

**a.** Describe how the graph of $f$ is obtained from $y = e^x$ by a sequence of three transformations. (3 marks)

**b.** State the equation of the horizontal asymptote. (1 mark)

**c.** Find the x-intercept of $f$ in exact form. (3 marks)

**d.** State the y-intercept. (2 marks)

**e.** State the domain and range. (3 marks)

${img("exp-reflected.svg", "Both y = e^x (red) and y = negative e^(x-1) + 2 (purple) on the same axes, showing the original exponential and the reflected/translated transformed function with horizontal asymptote y = 2")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (3 marks)**
*Step 1 (1 mark):* Translation 1 unit right: $y = e^{x - 1}$.
*Step 2 (1 mark):* Reflection in the x-axis: $y = -e^{x - 1}$.
*Step 3 (1 mark):* Translation 2 units up: $y = -e^{x - 1} + 2$.

**b. (1 mark)** As $x \\to -\\infty$, $-e^{x-1} \\to 0$, so asymptote: $y = 2$.

**c. (3 marks)**
*Step 1 (1 mark):* $-e^{x - 1} + 2 = 0 \\Rightarrow e^{x - 1} = 2$.
*Step 2 (1 mark):* $x - 1 = \\ln 2$.
*Step 3 (1 mark):* $x = 1 + \\ln 2$.

**d. (2 marks)**
*Step 1 (1 mark):* $f(0) = -e^{-1} + 2$.
*Step 2 (1 mark):* $= 2 - \\dfrac{1}{e}$.

**e. (3 marks)**
*Step 1 (1 mark):* Domain: $\\mathbb{R}$.
*Step 2 (1 mark):* As $x \\to -\\infty$, $f \\to 2$ (from below). As $x \\to \\infty$, $f \\to -\\infty$.
*Step 3 (1 mark):* Range: $(-\\infty, 2)$.`,
    subtopicSlugs: ["transformations", "exponential-functions"],
  },
  {
    content: `Let $h(x) = \\log_e(x - 1) + 3$.

**a.** Describe how the graph of $h$ is obtained from $y = \\log_e(x)$ by a sequence of two transformations. (2 marks)

**b.** State the maximal domain and range of $h$. (2 marks)

**c.** State the equation of the vertical asymptote. (1 mark)

**d.** Find the x-intercept of $h$ in exact form. (3 marks)

**e.** Find $h^{-1}(x)$ and its domain. (4 marks)

${img("log-transformed.svg", "Both y = ln(x) (red) and y = ln(x - 1) + 3 (teal) on the same axes, showing the original logarithm and the transformed one shifted 1 right and 3 up with asymptote x = 1")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* Translation 1 unit right: $y = \\ln(x - 1)$.
*Step 2 (1 mark):* Translation 3 units up: $y = \\ln(x - 1) + 3$.

**b. (2 marks)**
*Step 1 (1 mark):* Domain: $x - 1 > 0 \\Rightarrow x > 1$, i.e. $(1, \\infty)$.
*Step 2 (1 mark):* Range: $\\mathbb{R}$.

**c. (1 mark)** $x = 1$.

**d. (3 marks)**
*Step 1 (1 mark):* $\\ln(x - 1) + 3 = 0 \\Rightarrow \\ln(x - 1) = -3$.
*Step 2 (1 mark):* $x - 1 = e^{-3}$.
*Step 3 (1 mark):* $x = 1 + e^{-3}$.

**e. (4 marks)**
*Step 1 (1 mark):* Let $y = \\ln(x - 1) + 3 \\Rightarrow y - 3 = \\ln(x - 1)$.
*Step 2 (1 mark):* Exponentiate: $e^{y - 3} = x - 1$.
*Step 3 (1 mark):* $x = e^{y - 3} + 1$. Swap: $h^{-1}(x) = e^{x - 3} + 1$.
*Step 4 (1 mark):* Domain of $h^{-1}$ = range of $h = \\mathbb{R}$.`,
    subtopicSlugs: ["transformations", "logarithmic-functions", "inverse-functions"],
  },
];

const output = { mcq: [], shortAnswer: [], extendedAnswer: [], extendedResponse: questions };
fs.writeFileSync(OUT, JSON.stringify(output, null, 2) + "\n");
console.log(`${OUT}: ${questions.length} questions, ${questions.reduce((s, q) => s + q.marks, 0)} marks`);
