/** Wave 1 batch 13: Continuous Random Variables ext-resp. */
import * as fs from "fs";
import * as path from "path";
import { functionPlot, toDataUri } from "./svg";

const DIR = "scripts/output/figures/continuous-random-variables";
const OUT = "scripts/output/qset-methods-b2-continuous-random-variables.json";
fs.mkdirSync(DIR, { recursive: true });

const fig1 = functionPlot({
  fn: (x) => (x >= 0 && x <= 2) ? (3 / 8) * x * x : 0,
  xRange: [-0.5, 3], yRange: [-0.2, 2],
  fnLabel: "f(x) = (3/8) x²", fnLabelAt: { x: 0.1, y: 1.7 },
  xTicks: [1, 2], yTicks: [0.5, 1, 1.5],
  shadedRange: { from: 0, to: 1, fill: "#bfdbfe" },
  color: "#2563eb",
});

const fig2 = functionPlot({
  fn: (x) => (x >= 0 && x <= 3) ? (2 / 9) * x : 0,
  xRange: [-0.5, 4], yRange: [-0.2, 1],
  fnLabel: "f(x) = (2/9) x", fnLabelAt: { x: 0.2, y: 0.85 },
  xTicks: [1, 2, 3], yTicks: [0.2, 0.4, 0.6],
  shadedRange: { from: 1, to: 2, fill: "#bfdbfe" },
  color: "#2563eb",
});

const fig3 = functionPlot({
  fn: (x) => (x >= 0 && x <= 4) ? (1 / 8) * x : 0,
  xRange: [-0.5, 5], yRange: [-0.2, 0.8],
  fnLabel: "f(x) = x/8", fnLabelAt: { x: 0.2, y: 0.7 },
  xTicks: [1, 2, 3, 4], yTicks: [0.2, 0.4, 0.6],
  markedPoints: [{ x: 8 / 3, label: "E[X] = 8/3" }],
  color: "#2563eb",
});

const fig4 = functionPlot({
  fn: (x) => (x >= 0 && x <= 4) ? (3 / 32) * x * (4 - x) : 0,
  xRange: [-0.5, 5], yRange: [-0.1, 0.5],
  fnLabel: "f(x) = (3/32) x(4 − x)", fnLabelAt: { x: 0.2, y: 0.45 },
  xTicks: [1, 2, 3, 4], yTicks: [0.1, 0.2, 0.3, 0.4],
  shadedRange: { from: 1, to: 3, fill: "#bfdbfe" },
  color: "#2563eb",
});

const figs = { "pdf-quadratic.svg": fig1, "pdf-linear.svg": fig2, "pdf-mean.svg": fig3, "pdf-quartic-fenced.svg": fig4 };
for (const [n, c] of Object.entries(figs)) fs.writeFileSync(path.join(DIR, n), c);
const img = (n: string, a: string) => `![${a}](${toDataUri(figs[n as keyof typeof figs])})`;

const questions = [
  {
    content: `A continuous random variable $X$ has probability density function

$$f(x) = \\begin{cases} \\dfrac{3}{8} x^2 & 0 \\leq x \\leq 2 \\\\ 0 & \\text{elsewhere}. \\end{cases}$$

**a.** Verify that $f$ is a valid probability density function. (3 marks)

**b.** Find $P(X \\leq 1)$. (3 marks)

**c.** Find $P(X > 1.5)$. (2 marks)

**d.** Find the median of $X$ in exact form. (2 marks)

${img("pdf-quadratic.svg", "Probability density function f(x) = three eighths x squared on [0, 2] with the region from 0 to 1 shaded to show P(X ≤ 1)")}`,
    marks: 10,
    difficulty: "MEDIUM",
    solutionContent: `**a. (3 marks)**
*Step 1 (1 mark):* $f(x) \\geq 0$ on $[0, 2]$ since $x^2 \\geq 0$.
*Step 2 (1 mark):* $\\displaystyle\\int_0^2 \\dfrac{3}{8} x^2\\, dx = \\dfrac{3}{8} \\cdot \\dfrac{x^3}{3}\\bigg|_0^2 = \\dfrac{1}{8} \\cdot 8 = 1$.
*Step 3 (1 mark):* Hence $f$ is a valid pdf.

**b. (3 marks)**
*Step 1 (1 mark):* $P(X \\leq 1) = \\displaystyle\\int_0^1 \\dfrac{3}{8} x^2\\, dx$.
*Step 2 (1 mark):* $= \\dfrac{1}{8}\\left[x^3\\right]_0^1$.
*Step 3 (1 mark):* $= \\dfrac{1}{8}$.

**c. (2 marks)**
*Step 1 (1 mark):* $P(X > 1.5) = \\displaystyle\\int_{1.5}^2 \\dfrac{3}{8} x^2\\, dx = \\dfrac{1}{8}\\left[x^3\\right]_{1.5}^2$.
*Step 2 (1 mark):* $= \\dfrac{1}{8}(8 - 3.375) = \\dfrac{4.625}{8} = \\dfrac{37}{64}$.

**d. (2 marks)**
*Step 1 (1 mark):* Median $m$ satisfies $\\displaystyle\\int_0^m \\dfrac{3}{8} x^2\\, dx = \\dfrac{1}{2}$, i.e. $\\dfrac{m^3}{8} = \\dfrac{1}{2}$.
*Step 2 (1 mark):* $m^3 = 4 \\Rightarrow m = \\sqrt[3]{4}$.`,
    subtopicSlugs: ["continuous-random-variables", "normal-distribution"],
  },
  {
    content: `A continuous random variable $X$ has pdf

$$f(x) = \\begin{cases} k x & 0 \\leq x \\leq 3 \\\\ 0 & \\text{elsewhere}. \\end{cases}$$

**a.** Find the exact value of $k$. (3 marks)

**b.** Find $P(1 \\leq X \\leq 2)$. (3 marks)

**c.** Find $E[X]$. (3 marks)

**d.** Find the median of $X$ in exact form. (2 marks)

${img("pdf-linear.svg", "Probability density function f(x) = (2/9) x on [0, 3] with the region from 1 to 2 shaded to show P(1 ≤ X ≤ 2)")}`,
    marks: 11,
    difficulty: "MEDIUM",
    solutionContent: `**a. (3 marks)**
*Step 1 (1 mark):* $\\displaystyle\\int_0^3 k x\\, dx = 1$, so $k \\cdot \\dfrac{9}{2} = 1$.
*Step 2 (1 mark):* $\\dfrac{9 k}{2} = 1$.
*Step 3 (1 mark):* $k = \\dfrac{2}{9}$.

**b. (3 marks)**
*Step 1 (1 mark):* $P(1 \\leq X \\leq 2) = \\displaystyle\\int_1^2 \\dfrac{2}{9} x\\, dx$.
*Step 2 (1 mark):* $= \\dfrac{1}{9}\\left[x^2\\right]_1^2 = \\dfrac{1}{9}(4 - 1)$.
*Step 3 (1 mark):* $= \\dfrac{3}{9} = \\dfrac{1}{3}$.

**c. (3 marks)**
*Step 1 (1 mark):* $E[X] = \\displaystyle\\int_0^3 x \\cdot \\dfrac{2}{9} x\\, dx = \\dfrac{2}{9}\\displaystyle\\int_0^3 x^2\\, dx$.
*Step 2 (1 mark):* $= \\dfrac{2}{9} \\cdot \\dfrac{27}{3}$.
*Step 3 (1 mark):* $= \\dfrac{54}{27} = 2$.

**d. (2 marks)**
*Step 1 (1 mark):* Median $m$: $\\displaystyle\\int_0^m \\dfrac{2}{9} x\\, dx = \\dfrac{1}{2}$, i.e. $\\dfrac{m^2}{9} = \\dfrac{1}{2}$.
*Step 2 (1 mark):* $m^2 = \\dfrac{9}{2} \\Rightarrow m = \\dfrac{3}{\\sqrt{2}} = \\dfrac{3\\sqrt{2}}{2}$.`,
    subtopicSlugs: ["continuous-random-variables"],
  },
  {
    content: `A random variable $X$ has pdf $f(x) = \\dfrac{x}{8}$ for $0 \\leq x \\leq 4$.

**a.** Verify $f$ is a valid pdf. (2 marks)

**b.** Find $E[X]$. (3 marks)

**c.** Find $\\text{Var}(X)$. (4 marks)

**d.** State the standard deviation of $X$, correct to 3 decimal places. (1 mark)

**e.** Find $P(|X - E[X]| < 1)$, correct to 4 decimal places. (2 marks)

${img("pdf-mean.svg", "Probability density function f(x) = x/8 on [0, 4] with the mean E[X] = 8/3 marked on the curve")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* $f \\geq 0$ on $[0, 4]$.
*Step 2 (1 mark):* $\\displaystyle\\int_0^4 \\dfrac{x}{8}\\, dx = \\dfrac{1}{16}\\left[x^2\\right]_0^4 = 1$. ✓

**b. (3 marks)**
*Step 1 (1 mark):* $E[X] = \\displaystyle\\int_0^4 x \\cdot \\dfrac{x}{8}\\, dx$.
*Step 2 (1 mark):* $= \\dfrac{1}{8} \\cdot \\dfrac{x^3}{3}\\bigg|_0^4 = \\dfrac{64}{24}$.
*Step 3 (1 mark):* $= \\dfrac{8}{3}$.

**c. (4 marks)**
*Step 1 (1 mark):* $E[X^2] = \\displaystyle\\int_0^4 x^2 \\cdot \\dfrac{x}{8}\\, dx = \\dfrac{1}{8}\\left[\\dfrac{x^4}{4}\\right]_0^4$.
*Step 2 (1 mark):* $= \\dfrac{1}{8} \\cdot 64 = 8$.
*Step 3 (1 mark):* $\\text{Var}(X) = E[X^2] - (E[X])^2 = 8 - \\dfrac{64}{9}$.
*Step 4 (1 mark):* $= \\dfrac{72 - 64}{9} = \\dfrac{8}{9}$.

**d. (1 mark)** $\\sigma = \\sqrt{8/9} \\approx 0.943$.

**e. (2 marks)**
*Step 1 (1 mark):* $|X - 8/3| < 1 \\Leftrightarrow 5/3 < X < 11/3$. Then $P = \\displaystyle\\int_{5/3}^{11/3} \\dfrac{x}{8}\\, dx = \\dfrac{1}{16}\\left[(11/3)^2 - (5/3)^2\\right] = \\dfrac{1}{16} \\cdot \\dfrac{121 - 25}{9}$.
*Step 2 (1 mark):* $= \\dfrac{96}{144} = \\dfrac{2}{3} \\approx 0.6667$.`,
    subtopicSlugs: ["continuous-random-variables"],
  },
  {
    content: `A random variable $X$ has pdf $f(x) = \\dfrac{3}{32} x(4 - x)$ for $0 \\leq x \\leq 4$.

**a.** Verify that $f$ is a valid pdf. (3 marks)

**b.** By symmetry, state $E[X]$. (2 marks)

**c.** Find $P(1 \\leq X \\leq 3)$. (4 marks)

**d.** Find the mode of $X$ (value where pdf is maximum). (3 marks)

${img("pdf-quartic-fenced.svg", "Probability density function f(x) = (3/32) x (4 - x) on [0, 4], an inverted parabola peaking at x = 2, with the region from 1 to 3 shaded")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (3 marks)**
*Step 1 (1 mark):* $f(x) \\geq 0$ on $[0, 4]$ since $x(4 - x) \\geq 0$ there.
*Step 2 (1 mark):* $\\displaystyle\\int_0^4 \\dfrac{3}{32} x(4 - x)\\, dx = \\dfrac{3}{32}\\displaystyle\\int_0^4 (4 x - x^2)\\, dx = \\dfrac{3}{32}\\left[2 x^2 - \\dfrac{x^3}{3}\\right]_0^4$.
*Step 3 (1 mark):* $= \\dfrac{3}{32}\\left(32 - \\dfrac{64}{3}\\right) = \\dfrac{3}{32} \\cdot \\dfrac{32}{3} = 1$. ✓

**b. (2 marks)**
*Step 1 (1 mark):* The pdf is symmetric about $x = 2$ (since $f(2 + a) = f(2 - a)$ from the factorisation).
*Step 2 (1 mark):* Hence $E[X] = 2$.

**c. (4 marks)**
*Step 1 (1 mark):* $P(1 \\leq X \\leq 3) = \\displaystyle\\int_1^3 \\dfrac{3}{32}(4x - x^2)\\, dx$.
*Step 2 (1 mark):* $= \\dfrac{3}{32}\\left[2 x^2 - \\dfrac{x^3}{3}\\right]_1^3$.
*Step 3 (1 mark):* $= \\dfrac{3}{32}\\left[(18 - 9) - (2 - \\dfrac{1}{3})\\right] = \\dfrac{3}{32}\\left[9 - \\dfrac{5}{3}\\right] = \\dfrac{3}{32} \\cdot \\dfrac{22}{3}$.
*Step 4 (1 mark):* $= \\dfrac{22}{32} = \\dfrac{11}{16}$.

**d. (3 marks)**
*Step 1 (1 mark):* $f'(x) = \\dfrac{3}{32}(4 - 2 x)$.
*Step 2 (1 mark):* $f'(x) = 0 \\Rightarrow x = 2$.
*Step 3 (1 mark):* Mode $= 2$ (matches the symmetry argument).`,
    subtopicSlugs: ["continuous-random-variables", "polynomial-functions"],
  },
];

const output = { mcq: [], shortAnswer: [], extendedAnswer: [], extendedResponse: questions };
fs.writeFileSync(OUT, JSON.stringify(output, null, 2) + "\n");
console.log(`${OUT}: ${questions.length} questions, ${questions.reduce((s, q) => s + q.marks, 0)} marks`);
