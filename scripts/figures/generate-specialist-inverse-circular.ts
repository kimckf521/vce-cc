/**
 * Specialist: Inverse Circular Functions (arcsin, arccos, arctan).
 * Tier: extended-fit → MCQ + SHORT + EXT_ANS (no EXT_RESP).
 *
 * Targets: 12 MCQ + 8 SHORT + 3 EXT_ANS.
 */

import * as fs from "fs";
import * as path from "path";
import { functionPlot, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/specialist-inverse-circular";
const JSON_PATH = "scripts/output/qset-specialist-inverse-circular.json";
fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Figures ────────────────────────────────────────────────────────────

const figArcsin = functionPlot({
  fn: (x) => Math.asin(x),
  xRange: [-1.2, 1.2],
  yRange: [-2, 2],
  xTicks: [-1, 1],
  yTicks: [-1.5708, 1.5708],
  color: "#dc2626",
  fnLabel: "y = arcsin x",
  fnLabelAt: { x: 0.6, y: 1.4 },
  width: 360,
  height: 320,
});

const figArccos = functionPlot({
  fn: (x) => Math.acos(x),
  xRange: [-1.2, 1.2],
  yRange: [-0.5, 3.5],
  xTicks: [-1, 1],
  yTicks: [1.5708, 3.1416],
  color: "#dc2626",
  fnLabel: "y = arccos x",
  fnLabelAt: { x: 0.5, y: 2.5 },
  width: 360,
  height: 320,
});

const figArctan = functionPlot({
  fn: (x) => Math.atan(x),
  xRange: [-6, 6],
  yRange: [-2, 2],
  xTicks: [-4, -2, 2, 4],
  yTicks: [-1.5708, 1.5708],
  asymptotes: [
    { y: Math.PI / 2, label: "y = π/2" },
    { y: -Math.PI / 2, label: "y = −π/2" },
  ],
  color: "#dc2626",
  fnLabel: "y = arctan x",
  fnLabelAt: { x: 3, y: 0.8 },
  width: 380,
  height: 320,
});

const figArcsinTrans = functionPlot({
  fn: (x) => 2 * Math.asin(x / 2),
  xRange: [-3, 3],
  yRange: [-4, 4],
  xTicks: [-2, 2],
  yTicks: [-3.1416, 3.1416],
  color: "#dc2626",
  fnLabel: "y = 2 arcsin(x/2)",
  fnLabelAt: { x: 1.2, y: 2.8 },
  width: 360,
  height: 320,
});

const figures: Record<string, string> = {
  "arcsin.svg": figArcsin,
  "arccos.svg": figArccos,
  "arctan.svg": figArctan,
  "arcsin-dilated.svg": figArcsinTrans,
};
for (const [name, content] of Object.entries(figures)) {
  fs.writeFileSync(path.join(FIGURES_DIR, name), content);
}
const img = (name: string, alt: string) => `![${alt}](${toDataUri(figures[name])})`;

// ─── Types + helpers ────────────────────────────────────────────────────

interface MCQ {
  content: string; optionA: string; optionB: string; optionC: string; optionD: string;
  correctOption: "A" | "B" | "C" | "D"; marks: number;
  difficulty: "EASY" | "MEDIUM" | "HARD"; solutionContent: string; subtopicSlugs: string[];
}
interface FR {
  content: string; marks: number; difficulty: "EASY" | "MEDIUM" | "HARD";
  solutionContent: string; subtopicSlugs: string[];
}
const m = (
  c: string, o: [string, string, string, string], k: "A" | "B" | "C" | "D",
  d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): MCQ => ({
  content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3],
  correctOption: k, marks: 1, difficulty: d, solutionContent: s,
  subtopicSlugs: ["inverse-circular-functions-arcsin-arccos-arctan", ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: ["inverse-circular-functions-arcsin-arccos-arctan", ...sec],
});

// ─── 12 MCQ ─────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("The principal value of $\\arcsin\\left(\\dfrac{1}{2}\\right)$ is:",
    ["$\\dfrac{\\pi}{6}$", "$\\dfrac{\\pi}{3}$", "$\\dfrac{\\pi}{4}$", "$\\dfrac{5\\pi}{6}$"], "A", "EASY",
    "$\\arcsin(1/2) = \\pi/6$ since $\\sin(\\pi/6) = 1/2$ and $\\pi/6 \\in [-\\pi/2, \\pi/2]$. **Answer: A**"),
  m("The domain of $\\arccos$ is:",
    ["$\\mathbb{R}$", "$[-1, 1]$", "$[0, \\pi]$", "$(-\\infty, \\infty)$"], "B", "EASY",
    "$\\arccos$ is defined only for inputs in $[-1, 1]$. **Answer: B**"),
  m("The range of $\\arctan$ is:",
    ["$[-1, 1]$", "$(-\\pi, \\pi)$", "$\\left(-\\dfrac{\\pi}{2}, \\dfrac{\\pi}{2}\\right)$", "$[0, \\pi]$"], "C", "EASY",
    "By convention $\\arctan: \\mathbb R \\to (-\\pi/2, \\pi/2)$. **Answer: C**"),
  m("$\\arccos\\left(-\\dfrac{\\sqrt 3}{2}\\right) = $",
    ["$\\dfrac{\\pi}{6}$", "$\\dfrac{5\\pi}{6}$", "$-\\dfrac{\\pi}{6}$", "$\\dfrac{2\\pi}{3}$"], "B", "EASY",
    "$\\cos(5\\pi/6) = -\\sqrt 3 / 2$ and $5\\pi/6 \\in [0, \\pi]$. **Answer: B**"),
  m("$\\arctan(1) = $",
    ["$\\dfrac{\\pi}{6}$", "$\\dfrac{\\pi}{4}$", "$\\dfrac{\\pi}{3}$", "$\\dfrac{\\pi}{2}$"], "B", "EASY",
    "$\\tan(\\pi/4) = 1$ and $\\pi/4 \\in (-\\pi/2, \\pi/2)$. **Answer: B**"),
  m("The range of $\\arcsin$ is:",
    ["$[-1, 1]$", "$\\left[-\\dfrac{\\pi}{2}, \\dfrac{\\pi}{2}\\right]$", "$[0, \\pi]$", "$\\mathbb{R}$"], "B", "EASY",
    "$\\arcsin: [-1, 1] \\to [-\\pi/2, \\pi/2]$. **Answer: B**"),
  m("$\\dfrac{d}{dx}\\left(\\arcsin x\\right) = $",
    ["$\\dfrac{1}{\\sqrt{1 + x^2}}$", "$\\dfrac{1}{\\sqrt{1 - x^2}}$", "$\\dfrac{-1}{\\sqrt{1 - x^2}}$", "$\\dfrac{1}{1 + x^2}$"], "B", "MEDIUM",
    "$\\dfrac{d}{dx} \\arcsin x = \\dfrac{1}{\\sqrt{1 - x^2}}$. (Distractor C is $\\arccos'$, D is $\\arctan'$.) **Answer: B**"),
  m("$\\dfrac{d}{dx}\\left(\\arctan(2x)\\right) = $",
    ["$\\dfrac{1}{1 + 4x^2}$", "$\\dfrac{2}{1 + 4x^2}$", "$\\dfrac{2}{1 + 2x^2}$", "$\\dfrac{2}{\\sqrt{1 - 4x^2}}$"], "B", "MEDIUM",
    "Chain rule: $\\dfrac{d}{dx} \\arctan(u) = \\dfrac{u'}{1 + u^2} = \\dfrac{2}{1 + (2x)^2} = \\dfrac{2}{1 + 4x^2}$. **Answer: B**"),
  m("$\\arcsin(\\sin(3\\pi / 4))$ equals:",
    ["$3\\pi/4$", "$\\pi/4$", "$-\\pi/4$", "$\\pi/2$"], "B", "MEDIUM",
    "$\\sin(3\\pi/4) = \\sqrt 2 / 2$; $\\arcsin(\\sqrt 2 / 2) = \\pi/4$ (the principal value). **Answer: B**"),
  m("$\\arccos(\\cos(7\\pi / 6))$ equals:",
    ["$7\\pi/6$", "$\\pi/6$", "$5\\pi/6$", "$-\\pi/6$"], "C", "HARD",
    "$\\cos(7\\pi/6) = -\\sqrt 3 / 2$. $\\arccos(-\\sqrt 3 / 2) = 5\\pi/6$ (in $[0, \\pi]$). **Answer: C**"),
  m("$\\arctan(\\tan(5\\pi / 6))$ equals:",
    ["$5\\pi/6$", "$-\\pi/6$", "$\\pi/6$", "$-5\\pi/6$"], "B", "HARD",
    "$\\tan(5\\pi/6) = -\\tan(\\pi/6) = -1/\\sqrt 3$. $\\arctan(-1/\\sqrt 3) = -\\pi/6$. **Answer: B**"),
  m("If $y = \\arcsin(x/3)$, then $\\dfrac{dy}{dx}$ at $x = 0$ equals:",
    ["$\\dfrac{1}{3}$", "$3$", "$1$", "$\\dfrac{1}{9}$"], "A", "MEDIUM",
    "$y = \\arcsin(x/3) \\Rightarrow \\dfrac{dy}{dx} = \\dfrac{1/3}{\\sqrt{1 - x^2/9}}$; at $x = 0$, this is $\\dfrac{1/3}{1} = \\dfrac{1}{3}$. **Answer: A**"),
];

// ─── 8 SHORT (technique drills) ─────────────────────────────────────────

const shortAnswer: FR[] = [
  sq("Evaluate $\\arcsin\\left(-\\dfrac{\\sqrt 3}{2}\\right)$, giving an exact answer.\n\n" +
    img("arcsin.svg", "Graph of y = arcsin x"),
    1, "EASY",
    "*Step 1 (1 mark):* $\\sin(-\\pi/3) = -\\sqrt 3 / 2$ and $-\\pi/3 \\in [-\\pi/2, \\pi/2]$. Therefore $\\arcsin(-\\sqrt 3 / 2) = -\\pi/3$."),
  sq("State the maximal domain and range of $f(x) = \\arccos(x)$, and sketch its graph.\n\n" +
    img("arccos.svg", "Graph of y = arccos x with domain [-1, 1] and range [0, π]"),
    2, "EASY",
    "*Step 1 (1 mark):* Domain: $[-1, 1]$; range: $[0, \\pi]$.\n*Step 2 (1 mark):* Graph decreases from $(\\,-1, \\pi)$ through $(0, \\pi/2)$ to $(1, 0)$. See diagram."),
  sq("Differentiate $y = \\arctan(3x)$ with respect to $x$.", 2, "MEDIUM",
    "*Step 1 (1 mark):* Chain rule: $\\dfrac{dy}{dx} = \\dfrac{d/dx(3x)}{1 + (3x)^2}$.\n*Step 2 (1 mark):* $\\dfrac{dy}{dx} = \\dfrac{3}{1 + 9 x^2}$."),
  sq("Find $\\dfrac{d}{dx}\\left[\\arcsin\\left(\\dfrac{x}{2}\\right)\\right]$ and state where it is defined.\n\n" +
    img("arcsin-dilated.svg", "Dilated arcsin: y = 2 arcsin(x/2)"),
    3, "MEDIUM",
    "*Step 1 (1 mark):* $\\dfrac{d}{dx}\\arcsin(u) = \\dfrac{u'}{\\sqrt{1 - u^2}}$ with $u = x/2$, $u' = 1/2$.\n*Step 2 (1 mark):* $\\dfrac{d}{dx} \\arcsin(x/2) = \\dfrac{1/2}{\\sqrt{1 - x^2/4}} = \\dfrac{1}{\\sqrt{4 - x^2}}$.\n*Step 3 (1 mark):* Defined on $(-2, 2)$, where the radicand is positive."),
  sq("Solve $\\arccos(x) = \\dfrac{2\\pi}{3}$ for $x$.", 2, "EASY",
    "*Step 1 (1 mark):* Apply $\\cos$ to both sides: $x = \\cos(2\\pi/3)$.\n*Step 2 (1 mark):* $\\cos(2\\pi/3) = -1/2$, so $x = -1/2$."),
  sq("Express $\\sin(\\arccos(x))$ as an algebraic expression in $x$ (no trig functions), valid for $x \\in [-1, 1]$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Let $\\theta = \\arccos x$, so $\\cos\\theta = x$ and $\\theta \\in [0, \\pi]$.\n*Step 2 (1 mark):* Then $\\sin\\theta \\ge 0$ on $[0, \\pi]$ and $\\sin^2\\theta + \\cos^2\\theta = 1$, so $\\sin\\theta = \\sqrt{1 - x^2}$.\n*Step 3 (1 mark):* Therefore $\\sin(\\arccos x) = \\sqrt{1 - x^2}$."),
  sq("Find the equation of the tangent to $y = \\arctan(x)$ at the point where $x = 1$, giving your answer in exact form.\n\n" +
    img("arctan.svg", "Graph of y = arctan x with horizontal asymptotes at y = ±π/2"),
    3, "MEDIUM",
    "*Step 1 (1 mark):* $y(1) = \\arctan 1 = \\pi/4$. $y'(x) = \\dfrac{1}{1 + x^2}$, so $y'(1) = 1/2$.\n*Step 2 (1 mark):* Point–gradient form: $y - \\pi/4 = \\dfrac{1}{2}(x - 1)$.\n*Step 3 (1 mark):* Simplify: $y = \\dfrac{1}{2} x + \\dfrac{\\pi}{4} - \\dfrac{1}{2}$."),
  sq("Solve the equation $2 \\arcsin(x) = \\arccos(x)$ for $x \\in [-1, 1]$, justifying your solution.", 3, "HARD",
    "*Step 1 (1 mark):* Use $\\arcsin x + \\arccos x = \\pi/2 \\Rightarrow \\arccos x = \\pi/2 - \\arcsin x$. Substitute: $2 \\arcsin x = \\pi/2 - \\arcsin x$.\n*Step 2 (1 mark):* Solve: $3 \\arcsin x = \\pi/2 \\Rightarrow \\arcsin x = \\pi/6$.\n*Step 3 (1 mark):* So $x = \\sin(\\pi/6) = 1/2$. Verify: $2 \\cdot \\pi/6 = \\pi/3 = \\arccos(1/2)$ ✓."),
];

// ─── 3 EXT_ANS ──────────────────────────────────────────────────────────

const extendedAnswer: FR[] = [
  sq(`Consider $f(x) = \\arcsin(x)$ defined on its maximal domain.

**a.** State the domain and range of $f$. (1 mark)

**b.** Find $f'(x)$ and explain its sign on the interior of the domain. (3 marks)

**c.** Find the equation of the tangent to $y = \\arcsin x$ at $x = \\dfrac{1}{2}$, giving exact values. (3 marks)

${img("arcsin.svg", "Graph of y = arcsin x")}`,
    7, "MEDIUM",
    `**a. (1 mark)** Domain: $[-1, 1]$; range: $[-\\pi/2, \\pi/2]$.

**b. (3 marks)**
*Step 1 (1 mark):* Let $y = \\arcsin x$, so $\\sin y = x$ with $y \\in [-\\pi/2, \\pi/2]$.
*Step 2 (1 mark):* Implicit differentiate: $\\cos y \\cdot y' = 1 \\Rightarrow y' = \\dfrac{1}{\\cos y}$.
*Step 3 (1 mark):* On $(-\\pi/2, \\pi/2)$, $\\cos y = \\sqrt{1 - \\sin^2 y} = \\sqrt{1 - x^2} > 0$, so $f'(x) = \\dfrac{1}{\\sqrt{1 - x^2}} > 0$. $f$ is strictly increasing on its domain.

**c. (3 marks)**
*Step 1 (1 mark):* $y(1/2) = \\arcsin(1/2) = \\pi/6$.
*Step 2 (1 mark):* $f'(1/2) = \\dfrac{1}{\\sqrt{1 - 1/4}} = \\dfrac{1}{\\sqrt{3/4}} = \\dfrac{2}{\\sqrt 3} = \\dfrac{2\\sqrt 3}{3}$.
*Step 3 (1 mark):* Tangent: $y - \\dfrac{\\pi}{6} = \\dfrac{2\\sqrt 3}{3}\\left(x - \\dfrac{1}{2}\\right)$.`),

  sq(`Let $g(x) = \\arctan(2x - 1)$.

**a.** State the maximal domain and range of $g$. (2 marks)

**b.** Find $g'(x)$. (2 marks)

**c.** Determine the equation of any horizontal asymptotes of $y = g(x)$. (2 marks)

**d.** Sketch $y = g(x)$, indicating intercepts and asymptotes. (2 marks)

${img("arctan.svg", "Graph of y = arctan x with horizontal asymptotes at y = ±π/2")}`,
    8, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* $\\arctan$ is defined on all of $\\mathbb R$, and $2x - 1$ is too, so the domain of $g$ is $\\mathbb R$.
*Step 2 (1 mark):* Range: $(-\\pi/2, \\pi/2)$, the range of $\\arctan$.

**b. (2 marks)**
*Step 1 (1 mark):* Chain rule: $g'(x) = \\dfrac{d/dx (2x - 1)}{1 + (2x - 1)^2}$.
*Step 2 (1 mark):* $g'(x) = \\dfrac{2}{1 + (2x - 1)^2}$.

**c. (2 marks)**
*Step 1 (1 mark):* As $x \\to +\\infty$, $2x - 1 \\to \\infty$ so $g(x) \\to \\pi/2$.
*Step 2 (1 mark):* As $x \\to -\\infty$, $g(x) \\to -\\pi/2$. Horizontal asymptotes: $y = \\pi/2$ and $y = -\\pi/2$.

**d. (2 marks)**
*Step 1 (1 mark):* $g(1/2) = \\arctan(0) = 0$ gives the $x$-intercept $(1/2, 0)$. $g(0) = \\arctan(-1) = -\\pi/4$ gives $y$-intercept $(0, -\\pi/4)$.
*Step 2 (1 mark):* Strictly increasing (since $g' > 0$), passing through $(1/2, 0)$ between two horizontal asymptotes at $y = \\pm \\pi/2$.`),

  sq(`Define $h(x) = \\arccos(x) + \\arcsin(x)$ on the domain $[-1, 1]$.

**a.** Find $h'(x)$ for $x \\in (-1, 1)$. (3 marks)

**b.** What does part **a** tell you about $h$? Hence state the value of $h(x)$ for all $x \\in [-1, 1]$, with justification. (3 marks)

**c.** Use the result of part **b** to evaluate $\\arccos\\left(\\dfrac{3}{5}\\right) + \\arcsin\\left(\\dfrac{3}{5}\\right)$ without using a calculator. (2 marks)`,
    8, "HARD",
    `**a. (3 marks)**
*Step 1 (1 mark):* $\\dfrac{d}{dx} \\arccos x = -\\dfrac{1}{\\sqrt{1 - x^2}}$.
*Step 2 (1 mark):* $\\dfrac{d}{dx} \\arcsin x = \\dfrac{1}{\\sqrt{1 - x^2}}$.
*Step 3 (1 mark):* Sum: $h'(x) = -\\dfrac{1}{\\sqrt{1 - x^2}} + \\dfrac{1}{\\sqrt{1 - x^2}} = 0$ for all $x \\in (-1, 1)$.

**b. (3 marks)**
*Step 1 (1 mark):* Since $h'(x) = 0$ on the open interval $(-1, 1)$, $h$ is constant there.
*Step 2 (1 mark):* Continuity of $\\arcsin$ and $\\arccos$ extends $h$ to be constant on $[-1, 1]$ as well.
*Step 3 (1 mark):* Evaluate at $x = 0$: $h(0) = \\arccos(0) + \\arcsin(0) = \\pi/2 + 0 = \\pi/2$. So $h(x) = \\pi/2$ for all $x \\in [-1, 1]$.

**c. (2 marks)**
*Step 1 (1 mark):* By part **b**, $\\arccos x + \\arcsin x = \\pi/2$ for any $x \\in [-1, 1]$.
*Step 2 (1 mark):* With $x = 3/5 \\in [-1, 1]$: $\\arccos(3/5) + \\arcsin(3/5) = \\pi/2$.`),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer, extendedAnswer, extendedResponse: [] };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, 0 EXT_RESP to ${JSON_PATH}\n` +
    `Wrote ${Object.keys(figures).length} SVG files to ${FIGURES_DIR}/`,
);
