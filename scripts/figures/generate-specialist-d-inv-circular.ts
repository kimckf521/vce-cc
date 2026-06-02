/**
 * Specialist Calculus: Differentiation of Inverse Circular Functions.
 * Tier: extended-fit → MCQ + SHORT + EXT_ANS.
 */

import * as fs from "fs";
import * as path from "path";
import { functionPlot, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/specialist-d-inv-circular";
const JSON_PATH = "scripts/output/qset-specialist-d-inv-circular.json";
fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Figures ────────────────────────────────────────────────────────────

const figArcsin = functionPlot({
  fn: (x: number) => Math.asin(x),
  xRange: [-1, 1],
  yRange: [-Math.PI / 2 - 0.3, Math.PI / 2 + 0.3],
  fnLabel: "y = arcsin(x)",
  fnLabelAt: { x: 0.4, y: 1 },
  color: "#dc2626",
  xLabel: "x",
  yLabel: "y",
  xTicks: [-1, -0.5, 0.5, 1],
  yTicks: [-Math.PI / 2, -Math.PI / 4, Math.PI / 4, Math.PI / 2],
});

const figArctan = functionPlot({
  fn: (x: number) => Math.atan(x),
  xRange: [-5, 5],
  yRange: [-Math.PI / 2 - 0.3, Math.PI / 2 + 0.3],
  fnLabel: "y = arctan(x)",
  fnLabelAt: { x: 2, y: 1.2 },
  color: "#dc2626",
  xLabel: "x",
  yLabel: "y",
  xTicks: [-4, -2, 2, 4],
  yTicks: [-Math.PI / 2, -Math.PI / 4, Math.PI / 4, Math.PI / 2],
  asymptotes: [
    { y: Math.PI / 2, label: "y = π/2" },
    { y: -Math.PI / 2, label: "y = -π/2" },
  ],
});

const figures: Record<string, string> = {
  "arcsin.svg": figArcsin,
  "arctan.svg": figArctan,
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
const SLUG = "differentiation-of-inverse-circular-functions";
const m = (
  c: string, o: [string, string, string, string], k: "A" | "B" | "C" | "D",
  d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): MCQ => ({
  content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3],
  correctOption: k, marks: 1, difficulty: d, solutionContent: s,
  subtopicSlugs: [SLUG, ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: [SLUG, ...sec],
});

// ─── 12 MCQ ─────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("$\\dfrac{d}{dx}\\arcsin x$ equals:",
    ["$\\dfrac{1}{\\sqrt{1 - x^2}}$", "$\\dfrac{1}{1 + x^2}$", "$\\dfrac{-1}{\\sqrt{1 - x^2}}$", "$\\dfrac{1}{\\sqrt{x^2 - 1}}$"], "A", "EASY",
    "Standard derivative: $\\dfrac{d}{dx}\\arcsin x = \\dfrac{1}{\\sqrt{1 - x^2}}$. **Answer: A**"),
  m("$\\dfrac{d}{dx}\\arctan x$ equals:",
    ["$\\dfrac{1}{\\sqrt{1 - x^2}}$", "$\\dfrac{1}{1 + x^2}$", "$\\sec^2 x$", "$\\dfrac{-1}{1 + x^2}$"], "B", "EASY",
    "Standard derivative: $\\dfrac{d}{dx}\\arctan x = \\dfrac{1}{1 + x^2}$. **Answer: B**"),
  m("$\\dfrac{d}{dx}\\arccos x$ equals:",
    ["$\\dfrac{1}{\\sqrt{1 - x^2}}$", "$\\dfrac{-1}{\\sqrt{1 - x^2}}$", "$\\dfrac{-1}{1 + x^2}$", "$\\dfrac{1}{\\sqrt{x^2 - 1}}$"], "B", "EASY",
    "$\\dfrac{d}{dx}\\arccos x = -\\dfrac{1}{\\sqrt{1 - x^2}}$. **Answer: B**"),
  m("If $y = \\arcsin(2x)$, then $\\dfrac{dy}{dx}$ equals:",
    ["$\\dfrac{1}{\\sqrt{1 - 4 x^2}}$", "$\\dfrac{2}{\\sqrt{1 - 4 x^2}}$", "$\\dfrac{2}{\\sqrt{1 - x^2}}$", "$\\dfrac{1}{\\sqrt{1 - x^2}}$"], "B", "EASY",
    "Chain rule: $\\dfrac{d}{dx}\\arcsin(u) = \\dfrac{u'}{\\sqrt{1 - u^2}}$ with $u = 2x$, $u' = 2$: gives $\\dfrac{2}{\\sqrt{1 - 4 x^2}}$. **Answer: B**"),
  m("If $y = \\arctan(3x)$, then $\\dfrac{dy}{dx}$ at $x = 0$ equals:",
    ["$1$", "$3$", "$\\dfrac{1}{3}$", "$0$"], "B", "EASY",
    "$\\dfrac{dy}{dx} = \\dfrac{3}{1 + 9 x^2}$. At $x = 0$: $\\dfrac{3}{1} = 3$. **Answer: B**"),
  m("$\\dfrac{d}{dx}\\arcsin\\left(\\dfrac{x}{2}\\right)$ equals:",
    ["$\\dfrac{1}{\\sqrt{4 - x^2}}$", "$\\dfrac{1}{2\\sqrt{1 - x^2/4}}$", "$\\dfrac{1}{\\sqrt{1 - x^2/4}}$", "$\\dfrac{2}{\\sqrt{4 - x^2}}$"], "A", "MEDIUM",
    "Using $u = x/2$: $\\dfrac{1/2}{\\sqrt{1 - x^2/4}} = \\dfrac{1/2}{\\sqrt{(4 - x^2)/4}} = \\dfrac{1/2}{\\sqrt{4 - x^2}/2} = \\dfrac{1}{\\sqrt{4 - x^2}}$. **Answer: A**"),
  m("If $y = x\\arctan x$, then $\\dfrac{dy}{dx}$ equals:",
    ["$\\arctan x + \\dfrac{x}{1 + x^2}$", "$\\arctan x$", "$\\dfrac{x}{1 + x^2}$", "$1 + \\dfrac{1}{1 + x^2}$"], "A", "MEDIUM",
    "Product rule: $\\dfrac{dy}{dx} = \\arctan x + x \\cdot \\dfrac{1}{1 + x^2}$. **Answer: A**"),
  m("Let $y = \\arcsin(\\sqrt{x})$. Then $\\dfrac{dy}{dx}$ equals:",
    ["$\\dfrac{1}{2\\sqrt{x(1 - x)}}$", "$\\dfrac{1}{\\sqrt{1 - x}}$", "$\\dfrac{1}{2\\sqrt{1 - x}}$", "$\\dfrac{1}{2\\sqrt{x}\\sqrt{1 - \\sqrt x}}$"], "A", "MEDIUM",
    "$u = \\sqrt x$, $u' = \\dfrac{1}{2\\sqrt x}$. Then $\\dfrac{dy}{dx} = \\dfrac{1/(2\\sqrt x)}{\\sqrt{1 - x}} = \\dfrac{1}{2\\sqrt{x(1 - x)}}$. **Answer: A**"),
  m("If $y = \\arctan(x^2)$, then $\\dfrac{dy}{dx}$ equals:",
    ["$\\dfrac{2x}{1 + x^4}$", "$\\dfrac{1}{1 + x^4}$", "$\\dfrac{2x}{1 + x^2}$", "$\\dfrac{x^2}{1 + x^2}$"], "A", "MEDIUM",
    "$u = x^2$, $u' = 2x$. $\\dfrac{dy}{dx} = \\dfrac{2x}{1 + x^4}$. **Answer: A**"),
  m("The slope of $y = \\arcsin x$ at $x = \\dfrac{1}{2}$ is:",
    ["$\\dfrac{2}{\\sqrt 3}$", "$\\dfrac{\\sqrt 3}{2}$", "$\\dfrac{1}{2}$", "$2$"], "A", "MEDIUM",
    "$\\dfrac{dy}{dx} = \\dfrac{1}{\\sqrt{1 - 1/4}} = \\dfrac{1}{\\sqrt{3/4}} = \\dfrac{2}{\\sqrt 3}$. **Answer: A**"),
  m("If $y = \\arctan\\left(\\dfrac{1}{x}\\right)$ for $x > 0$, then $\\dfrac{dy}{dx}$ equals:",
    ["$\\dfrac{-1}{1 + x^2}$", "$\\dfrac{1}{1 + x^2}$", "$\\dfrac{-1}{x^2 + 1/x^2}$", "$\\dfrac{1}{x(1 + x^2)}$"], "A", "HARD",
    "$u = 1/x$, $u' = -1/x^2$. $\\dfrac{dy}{dx} = \\dfrac{-1/x^2}{1 + 1/x^2} = \\dfrac{-1/x^2}{(x^2 + 1)/x^2} = \\dfrac{-1}{1 + x^2}$. **Answer: A**"),
  m("If $y = e^{\\arctan x}$, then $\\dfrac{dy}{dx}$ equals:",
    ["$\\dfrac{e^{\\arctan x}}{1 + x^2}$", "$e^{\\arctan x}$", "$\\dfrac{1}{1 + x^2}$", "$\\arctan x \\cdot e^{\\arctan x}$"], "A", "HARD",
    "Chain rule: $\\dfrac{dy}{dx} = e^{\\arctan x} \\cdot \\dfrac{1}{1 + x^2}$. **Answer: A**"),
];

// ─── 8 SHORT ───────────────────────────────────────────────────────────

const shortAnswer: FR[] = [
  sq("Differentiate $y = \\arcsin(3x)$ with respect to $x$.", 2, "EASY",
    "*Step 1 (1 mark):* Chain rule with $u = 3x$: $\\dfrac{dy}{dx} = \\dfrac{u'}{\\sqrt{1 - u^2}}$.\n*Step 2 (1 mark):* $u' = 3$, so $\\dfrac{dy}{dx} = \\dfrac{3}{\\sqrt{1 - 9 x^2}}$."),
  sq("Find $\\dfrac{dy}{dx}$ if $y = \\arctan(x^2 + 1)$.", 2, "EASY",
    "*Step 1 (1 mark):* $u = x^2 + 1$, $u' = 2x$. $\\dfrac{dy}{dx} = \\dfrac{u'}{1 + u^2}$.\n*Step 2 (1 mark):* $\\dfrac{dy}{dx} = \\dfrac{2x}{1 + (x^2 + 1)^2}$."),
  sq("Differentiate $y = \\arccos\\left(\\dfrac{x}{3}\\right)$, simplifying your answer.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $u = x/3$, $u' = 1/3$.\n*Step 2 (1 mark):* $\\dfrac{dy}{dx} = -\\dfrac{u'}{\\sqrt{1 - u^2}} = -\\dfrac{1/3}{\\sqrt{1 - x^2/9}}$.\n*Step 3 (1 mark):* $= -\\dfrac{1/3}{\\sqrt{(9 - x^2)/9}} = -\\dfrac{1}{\\sqrt{9 - x^2}}$."),
  sq("Find $\\dfrac{dy}{dx}$ if $y = (\\arctan x)^2$.", 2, "MEDIUM",
    "*Step 1 (1 mark):* Chain rule: $\\dfrac{dy}{dx} = 2\\arctan x \\cdot \\dfrac{d}{dx}(\\arctan x)$.\n*Step 2 (1 mark):* $= \\dfrac{2\\arctan x}{1 + x^2}$."),
  sq("If $y = x \\arcsin x + \\sqrt{1 - x^2}$, show that $\\dfrac{dy}{dx} = \\arcsin x$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Differentiate term-by-term: $\\dfrac{d}{dx}(x\\arcsin x) = \\arcsin x + \\dfrac{x}{\\sqrt{1 - x^2}}$.\n*Step 2 (1 mark):* $\\dfrac{d}{dx}\\sqrt{1 - x^2} = \\dfrac{-x}{\\sqrt{1 - x^2}}$.\n*Step 3 (1 mark):* Sum: $\\arcsin x + \\dfrac{x}{\\sqrt{1 - x^2}} - \\dfrac{x}{\\sqrt{1 - x^2}} = \\arcsin x$ ✓."),
  sq("Find $\\dfrac{dy}{dx}$ at $x = 1$ if $y = \\arctan(x) + \\arctan(1/x)$ (for $x > 0$). Hence comment on the form of $y$ for $x > 0$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $\\dfrac{d}{dx}\\arctan(x) = \\dfrac{1}{1 + x^2}$.\n*Step 2 (1 mark):* $\\dfrac{d}{dx}\\arctan(1/x) = \\dfrac{-1/x^2}{1 + 1/x^2} = \\dfrac{-1}{1 + x^2}$.\n*Step 3 (1 mark):* Sum is $0$, so $y$ is constant for $x > 0$. Evaluating at $x = 1$: $y = \\arctan 1 + \\arctan 1 = \\pi/4 + \\pi/4 = \\pi/2$."),
  sq("Find the equation of the tangent to $y = \\arctan x$ at $x = 1$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* At $x = 1$: $y = \\arctan 1 = \\pi/4$.\n*Step 2 (1 mark):* Slope: $\\dfrac{dy}{dx}\\Big|_{x=1} = \\dfrac{1}{1 + 1} = \\dfrac{1}{2}$.\n*Step 3 (1 mark):* Tangent: $y - \\pi/4 = \\dfrac{1}{2}(x - 1) \\Rightarrow y = \\dfrac{x}{2} + \\dfrac{\\pi}{4} - \\dfrac{1}{2}$."),
  sq("Differentiate $y = \\arcsin(\\cos x)$ for $x \\in (0, \\pi)$, simplifying your answer.", 3, "HARD",
    "*Step 1 (1 mark):* $\\dfrac{dy}{dx} = \\dfrac{-\\sin x}{\\sqrt{1 - \\cos^2 x}} = \\dfrac{-\\sin x}{\\sqrt{\\sin^2 x}}$.\n*Step 2 (1 mark):* On $(0, \\pi)$, $\\sin x > 0$, so $\\sqrt{\\sin^2 x} = \\sin x$.\n*Step 3 (1 mark):* So $\\dfrac{dy}{dx} = \\dfrac{-\\sin x}{\\sin x} = -1$. (Indeed $\\arcsin(\\cos x) = \\pi/2 - x$ on this interval.)"),
];

// ─── 3 EXT_ANS ──────────────────────────────────────────────────────────

const extendedAnswer: FR[] = [
  sq(`Let $f(x) = \\arcsin x$ for $x \\in [-1, 1]$.

**a.** State the range of $f$. (1 mark)

**b.** Show that $f'(x) = \\dfrac{1}{\\sqrt{1 - x^2}}$. (3 marks)

**c.** Use the result of **b** to find the equation of the tangent line to $y = \\arcsin x$ at $x = \\dfrac{1}{2}$. (3 marks)

${img("arcsin.svg", "Graph of y = arcsin(x) on [-1,1] with range [-π/2, π/2]")}`,
    7, "MEDIUM",
    `**a. (1 mark)** Range = $[-\\pi/2, \\pi/2]$.

**b. (3 marks)**
*Step 1 (1 mark):* Let $y = \\arcsin x$, so $\\sin y = x$ with $y \\in [-\\pi/2, \\pi/2]$.
*Step 2 (1 mark):* Differentiate implicitly: $\\cos y \\cdot \\dfrac{dy}{dx} = 1 \\Rightarrow \\dfrac{dy}{dx} = \\dfrac{1}{\\cos y}$.
*Step 3 (1 mark):* On $(-\\pi/2, \\pi/2)$, $\\cos y > 0$, and $\\cos y = \\sqrt{1 - \\sin^2 y} = \\sqrt{1 - x^2}$. So $f'(x) = \\dfrac{1}{\\sqrt{1 - x^2}}$.

**c. (3 marks)**
*Step 1 (1 mark):* At $x = 1/2$: $y_0 = \\arcsin(1/2) = \\pi/6$.
*Step 2 (1 mark):* Slope $= \\dfrac{1}{\\sqrt{1 - 1/4}} = \\dfrac{1}{\\sqrt{3}/2} = \\dfrac{2}{\\sqrt 3} = \\dfrac{2\\sqrt 3}{3}$.
*Step 3 (1 mark):* Tangent: $y - \\dfrac{\\pi}{6} = \\dfrac{2\\sqrt 3}{3}\\left(x - \\dfrac{1}{2}\\right)$.`),

  sq(`Let $g(x) = \\arctan(2x - 1)$.

**a.** State the domain and range of $g$. (2 marks)

**b.** Find $g'(x)$ and evaluate $g'(0)$ and $g'(1)$. (3 marks)

**c.** Show that the tangent to $g$ at $x = 1/2$ has slope $2$, and find its equation. (2 marks)

${img("arctan.svg", "Graph of y = arctan(x) with horizontal asymptotes at y = ±π/2")}`,
    7, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* Domain: all $x \\in \\mathbb{R}$ (since arctan accepts any real input).
*Step 2 (1 mark):* Range: $(-\\pi/2, \\pi/2)$ (range of arctan is $(-\\pi/2, \\pi/2)$).

**b. (3 marks)**
*Step 1 (1 mark):* Let $u = 2x - 1$, $u' = 2$.
*Step 2 (1 mark):* $g'(x) = \\dfrac{u'}{1 + u^2} = \\dfrac{2}{1 + (2x - 1)^2}$.
*Step 3 (1 mark):* $g'(0) = \\dfrac{2}{1 + 1} = 1$; $g'(1) = \\dfrac{2}{1 + 1} = 1$.

**c. (2 marks)**
*Step 1 (1 mark):* At $x = 1/2$: $u = 0$, slope $= \\dfrac{2}{1 + 0} = 2$. ✓ Also $g(1/2) = \\arctan 0 = 0$.
*Step 2 (1 mark):* Tangent: $y - 0 = 2(x - 1/2) \\Rightarrow y = 2x - 1$.`),

  sq(`The function $h(x) = \\arcsin x + \\arccos x$ is defined on $[-1, 1]$.

**a.** Compute $h(0)$, $h(1/2)$, and $h(1)$. (2 marks)

**b.** By differentiating $h$, show that $h(x)$ is a constant function on $[-1, 1]$. (3 marks)

**c.** Hence write down the value of $h(x)$ for all $x \\in [-1, 1]$. (1 mark)

**d.** Confirm by writing $\\arccos x = \\dfrac{\\pi}{2} - \\arcsin x$ directly. (1 mark)`,
    7, "EASY",
    `**a. (2 marks)**
*Step 1 (1 mark):* $h(0) = 0 + \\pi/2 = \\pi/2$.
*Step 2 (1 mark):* $h(1/2) = \\pi/6 + \\pi/3 = \\pi/2$; $h(1) = \\pi/2 + 0 = \\pi/2$.

**b. (3 marks)**
*Step 1 (1 mark):* $h'(x) = \\dfrac{1}{\\sqrt{1 - x^2}} + \\left(-\\dfrac{1}{\\sqrt{1 - x^2}}\\right)$.
*Step 2 (1 mark):* $h'(x) = 0$ for all $x \\in (-1, 1)$.
*Step 3 (1 mark):* Since $h'(x) = 0$ throughout an interval, $h$ is constant on $(-1, 1)$. By continuity, $h$ is constant on the closed interval $[-1, 1]$.

**c. (1 mark)** $h(x) = \\pi/2$ for all $x \\in [-1, 1]$.

**d. (1 mark)** $\\arccos x = \\pi/2 - \\arcsin x$ (a standard identity), so $\\arcsin x + \\arccos x = \\arcsin x + (\\pi/2 - \\arcsin x) = \\pi/2$.`),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer, extendedAnswer };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS to ${JSON_PATH}\n` +
    `Wrote ${Object.keys(figures).length} SVG files to ${FIGURES_DIR}/`,
);
