/**
 * Specialist: Dot Product (Scalar Product).
 * Tier: extended-fit → MCQ + SHORT + EXT_ANS.
 */

import * as fs from "fs";
import * as path from "path";
import { vectorDiagram, vector3D, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/specialist-dot-product";
const JSON_PATH = "scripts/output/qset-specialist-dot-product.json";
fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Figures ────────────────────────────────────────────────────────────

const figAngle = vectorDiagram({
  vectors: [
    { to: { x: 4, y: 0 }, label: "a" },
    { to: { x: 2, y: 3 }, label: "b", color: "#2563eb" },
  ],
  xRange: [-1, 5],
  yRange: [-1, 4],
});

const figProjection = vectorDiagram({
  vectors: [
    { to: { x: 5, y: 0 }, label: "a" },
    { to: { x: 3, y: 2 }, label: "b", color: "#2563eb" },
    { to: { x: 3, y: 0 }, label: "proj_a(b)", color: "#16a34a" },
    { from: { x: 3, y: 0 }, to: { x: 3, y: 2 }, color: "#9ca3af", dash: true },
  ],
  xRange: [-1, 6],
  yRange: [-1, 4],
});

const figPerp = vectorDiagram({
  vectors: [
    { to: { x: 3, y: 0 }, label: "a" },
    { to: { x: 0, y: 3 }, label: "b ⊥ a", color: "#2563eb" },
  ],
  xRange: [-1, 4],
  yRange: [-1, 4],
});

const fig3D = vector3D({
  vectors: [
    { to: { x: 2, y: 1, z: 2 }, label: "u" },
    { to: { x: 1, y: 2, z: 1 }, label: "v", color: "#2563eb" },
  ],
  axisExtent: 3,
});

const figures: Record<string, string> = {
  "angle.svg": figAngle,
  "projection.svg": figProjection,
  "perp.svg": figPerp,
  "3d.svg": fig3D,
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
  subtopicSlugs: ["dot-product-scalar-product", ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: ["dot-product-scalar-product", ...sec],
});

// ─── 12 MCQ ─────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("If $\\vec a = 2\\hat i + 3\\hat j$ and $\\vec b = \\hat i - \\hat j$, then $\\vec a \\cdot \\vec b$ equals:",
    ["$-1$", "$5$", "$1$", "$2$"], "A", "EASY",
    "$\\vec a \\cdot \\vec b = (2)(1) + (3)(-1) = 2 - 3 = -1$. **Answer: A**"),
  m("$\\hat i \\cdot \\hat i$ equals:",
    ["$0$", "$1$", "$\\hat i$", "$|\\hat i|$"], "B", "EASY",
    "Unit vector dotted with itself: $\\hat i \\cdot \\hat i = 1$. **Answer: B**"),
  m("$\\hat i \\cdot \\hat j$ equals:",
    ["$1$", "$\\hat k$", "$0$", "$-1$"], "C", "EASY",
    "Different standard basis vectors are orthogonal: $\\hat i \\cdot \\hat j = 0$. **Answer: C**"),
  m("If $\\vec a \\perp \\vec b$, then $\\vec a \\cdot \\vec b$ equals:",
    ["$|\\vec a||\\vec b|$", "$\\vec 0$", "$0$", "$-|\\vec a||\\vec b|$"], "C", "EASY",
    "When two vectors are perpendicular, $\\cos\\theta = 0$ so the dot product equals zero (a scalar). **Answer: C**"),
  m("If $|\\vec a| = 3$, $|\\vec b| = 4$, and the angle between them is $60°$, then $\\vec a \\cdot \\vec b$ equals:",
    ["$6$", "$12$", "$6\\sqrt{3}$", "$0$"], "A", "EASY",
    "$\\vec a \\cdot \\vec b = |\\vec a||\\vec b|\\cos\\theta = 3 \\cdot 4 \\cdot \\cos 60° = 12 \\cdot 1/2 = 6$. **Answer: A**"),
  m("If $\\vec a = (1, 2, -3)$ and $\\vec b = (4, 0, 1)$, then $\\vec a \\cdot \\vec b$ equals:",
    ["$1$", "$5$", "$0$", "$7$"], "A", "MEDIUM",
    "$\\vec a \\cdot \\vec b = (1)(4) + (2)(0) + (-3)(1) = 4 + 0 - 3 = 1$. **Answer: A**"),
  m("Which value of $k$ makes $\\vec a = 2\\hat i + k\\hat j$ perpendicular to $\\vec b = 3\\hat i - \\hat j$?",
    ["$k = -6$", "$k = 6$", "$k = 3$", "$k = 0$"], "B", "MEDIUM",
    "$\\vec a \\cdot \\vec b = 6 - k = 0 \\Rightarrow k = 6$. **Answer: B**"),
  m("$\\vec a \\cdot \\vec a$ equals:",
    ["$|\\vec a|$", "$|\\vec a|^2$", "$0$", "$2\\vec a$"], "B", "EASY",
    "$\\vec a \\cdot \\vec a = |\\vec a|^2$ (sum of squares of components). **Answer: B**"),
  m("The cosine of the angle between $\\vec a = \\hat i + \\hat j$ and $\\vec b = \\hat i$ is:",
    ["$\\dfrac{1}{2}$", "$\\dfrac{1}{\\sqrt 2}$", "$1$", "$\\sqrt 2$"], "B", "MEDIUM",
    "$\\cos\\theta = \\dfrac{\\vec a \\cdot \\vec b}{|\\vec a||\\vec b|} = \\dfrac{1}{\\sqrt 2 \\cdot 1} = \\dfrac{1}{\\sqrt 2}$. **Answer: B**"),
  m("The scalar projection of $\\vec b = (3, 4)$ onto $\\vec a = (1, 0)$ is:",
    ["$3$", "$4$", "$5$", "$\\frac{3}{5}$"], "A", "MEDIUM",
    "Scalar projection $= \\dfrac{\\vec a \\cdot \\vec b}{|\\vec a|} = \\dfrac{3}{1} = 3$. **Answer: A**"),
  m("If $\\vec a = 2\\hat i - \\hat j + 2\\hat k$ and $\\vec b = \\hat i + 2\\hat j - 2\\hat k$, the angle $\\theta$ between them satisfies $\\cos\\theta = $:",
    ["$\\dfrac{4}{9}$", "$-\\dfrac{4}{9}$", "$\\dfrac{1}{3}$", "$0$"], "B", "HARD",
    "$\\vec a \\cdot \\vec b = 2 - 2 - 4 = -4$. $|\\vec a| = 3$, $|\\vec b| = 3$. So $\\cos\\theta = -4/9$. **Answer: B**"),
  m("If $\\vec u + \\vec v = 3\\hat i + \\hat j$, $\\vec u - \\vec v = \\hat i + 3\\hat j$ and $|\\vec u|^2 = 5$, then $\\vec u \\cdot \\vec v$ equals:",
    ["$2$", "$-2$", "$0$", "$3$"], "B", "HARD",
    "From $\\vec u = 2\\hat i + 2\\hat j$, $\\vec v = \\hat i - \\hat j$: $\\vec u \\cdot \\vec v = 2 - 2 = 0$. Wait, let's recheck: $\\vec u + \\vec v = 3\\hat i + \\hat j$, $\\vec u - \\vec v = \\hat i + 3\\hat j$, so $2\\vec u = 4\\hat i + 4\\hat j$, giving $\\vec u = 2\\hat i + 2\\hat j$, $\\vec v = \\hat i - \\hat j$. Check $|\\vec u|^2 = 4 + 4 = 8 \\ne 5$. Use alternative identity: $|\\vec u + \\vec v|^2 - |\\vec u - \\vec v|^2 = 4 \\vec u \\cdot \\vec v$. $|3\\hat i + \\hat j|^2 = 10$, $|\\hat i + 3\\hat j|^2 = 10$, so $4 \\vec u \\cdot \\vec v = 0$, hence $\\vec u \\cdot \\vec v = 0$. Closest answer to 0 in options: hmm. Recompute with given data: $\\vec u \\cdot \\vec v = \\dfrac{|\\vec u + \\vec v|^2 - |\\vec u|^2 - |\\vec v|^2}{2}$... given $|\\vec u|^2 = 5$, we'd need $|\\vec v|^2$. Using $|\\vec u + \\vec v|^2 + |\\vec u - \\vec v|^2 = 2(|\\vec u|^2 + |\\vec v|^2)$: $10 + 10 = 2(5 + |\\vec v|^2)$, so $|\\vec v|^2 = 5$. Then $\\vec u \\cdot \\vec v = (10 - 5 - 5)/2 = 0$. Hmm, but B says $-2$. Use $|\\vec u - \\vec v|^2 = |\\vec u|^2 - 2\\vec u \\cdot \\vec v + |\\vec v|^2$: $10 = 5 - 2\\vec u \\cdot \\vec v + 5 \\Rightarrow 2\\vec u \\cdot \\vec v = 0$. The answer is 0, but to align with the multiple-choice format, this question is corrected: $\\vec u \\cdot \\vec v = 0$ (and B has been edited)."),
];

// Fix: replace the last MCQ with a cleaner one
mcq[11] = m("If $\\vec a = (k, 2, 1)$ and $\\vec b = (3, -1, 2)$ are perpendicular, then $k$ equals:",
  ["$0$", "$-2/3$", "$2/3$", "$1$"], "A", "HARD",
  "$\\vec a \\cdot \\vec b = 3k - 2 + 2 = 3k$. Perpendicular requires $3k = 0$, so $k = 0$. **Answer: A**");

// ─── 8 SHORT_ANSWER ─────────────────────────────────────────────────────

const shortAnswer: FR[] = [
  sq("Find $\\vec a \\cdot \\vec b$ where $\\vec a = 3\\hat i - 2\\hat j + \\hat k$ and $\\vec b = \\hat i + 4\\hat j + 2\\hat k$.", 2, "EASY",
    "*Step 1 (1 mark):* Multiply component-wise: $(3)(1) + (-2)(4) + (1)(2)$.\n*Step 2 (1 mark):* Sum: $3 - 8 + 2 = -3$."),
  sq("Find the angle, to the nearest degree, between $\\vec a = \\hat i + 2\\hat j$ and $\\vec b = 3\\hat i - \\hat j$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $\\vec a \\cdot \\vec b = 3 - 2 = 1$.\n*Step 2 (1 mark):* $|\\vec a| = \\sqrt 5$, $|\\vec b| = \\sqrt{10}$, so $\\cos\\theta = \\dfrac{1}{\\sqrt{50}} = \\dfrac{1}{5\\sqrt 2}$.\n*Step 3 (1 mark):* $\\theta = \\arccos(1/(5\\sqrt 2)) \\approx \\arccos(0.1414) \\approx 81.87° \\approx 82°$."),
  sq("Find the value of $k$ such that $\\vec a = 2\\hat i + k\\hat j - 3\\hat k$ is perpendicular to $\\vec b = \\hat i - 2\\hat j + \\hat k$.", 2, "MEDIUM",
    "*Step 1 (1 mark):* $\\vec a \\cdot \\vec b = 2 - 2k - 3 = -1 - 2k$.\n*Step 2 (1 mark):* Set to zero: $-1 - 2k = 0 \\Rightarrow k = -\\dfrac{1}{2}$."),
  sq("Find the scalar projection of $\\vec b = 3\\hat i + 4\\hat j$ onto $\\vec a = \\hat i$.", 2, "EASY",
    "*Step 1 (1 mark):* Scalar projection $= \\dfrac{\\vec a \\cdot \\vec b}{|\\vec a|}$.\n*Step 2 (1 mark):* $= \\dfrac{3}{1} = 3$."),
  sq("Find the vector projection of $\\vec b = 4\\hat i + 3\\hat j$ onto $\\vec a = \\hat i + \\hat j$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $\\vec a \\cdot \\vec b = 4 + 3 = 7$, $|\\vec a|^2 = 2$.\n*Step 2 (1 mark):* Vector projection: $\\text{proj}_{\\vec a}\\vec b = \\dfrac{\\vec a \\cdot \\vec b}{|\\vec a|^2}\\vec a = \\dfrac{7}{2}(\\hat i + \\hat j)$.\n*Step 3 (1 mark):* $= \\dfrac{7}{2}\\hat i + \\dfrac{7}{2}\\hat j$."),
  sq("Use the dot product to find the angle (to the nearest degree) between the vectors $\\vec u = (1, 1, 1)$ and $\\vec v = (1, 2, 3)$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $\\vec u \\cdot \\vec v = 1 + 2 + 3 = 6$.\n*Step 2 (1 mark):* $|\\vec u| = \\sqrt 3$, $|\\vec v| = \\sqrt{14}$. So $\\cos\\theta = \\dfrac{6}{\\sqrt{42}}$.\n*Step 3 (1 mark):* $\\theta = \\arccos(6/\\sqrt{42}) \\approx \\arccos(0.9258) \\approx 22°$."),
  sq("Show that the dot product is distributive: prove $\\vec a \\cdot (\\vec b + \\vec c) = \\vec a \\cdot \\vec b + \\vec a \\cdot \\vec c$ in component form for $\\mathbb{R}^3$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Let $\\vec a = (a_1, a_2, a_3)$, $\\vec b = (b_1, b_2, b_3)$, $\\vec c = (c_1, c_2, c_3)$.\n*Step 2 (1 mark):* $\\vec a \\cdot (\\vec b + \\vec c) = a_1(b_1 + c_1) + a_2(b_2 + c_2) + a_3(b_3 + c_3)$.\n*Step 3 (1 mark):* $= (a_1 b_1 + a_2 b_2 + a_3 b_3) + (a_1 c_1 + a_2 c_2 + a_3 c_3) = \\vec a \\cdot \\vec b + \\vec a \\cdot \\vec c$. ✓"),
  sq("Prove the identity $|\\vec a + \\vec b|^2 = |\\vec a|^2 + 2\\vec a \\cdot \\vec b + |\\vec b|^2$ using the dot product, and hence find $|\\vec a + \\vec b|$ when $|\\vec a| = 3$, $|\\vec b| = 4$ and $\\vec a \\cdot \\vec b = 6$.", 3, "HARD",
    "*Step 1 (1 mark):* $|\\vec a + \\vec b|^2 = (\\vec a + \\vec b) \\cdot (\\vec a + \\vec b) = \\vec a \\cdot \\vec a + \\vec a \\cdot \\vec b + \\vec b \\cdot \\vec a + \\vec b \\cdot \\vec b = |\\vec a|^2 + 2\\vec a \\cdot \\vec b + |\\vec b|^2$.\n*Step 2 (1 mark):* Substitute: $|\\vec a + \\vec b|^2 = 9 + 12 + 16 = 37$.\n*Step 3 (1 mark):* $|\\vec a + \\vec b| = \\sqrt{37}$."),
];

// ─── 3 EXT_ANS ──────────────────────────────────────────────────────────

const extendedAnswer: FR[] = [
  sq(`Let $\\vec a = 2\\hat i + \\hat j - 2\\hat k$ and $\\vec b = \\hat i + 2\\hat j + 2\\hat k$.

**a.** Find $|\\vec a|$ and $|\\vec b|$. (2 marks)

**b.** Find $\\vec a \\cdot \\vec b$. (1 mark)

**c.** Find the angle between $\\vec a$ and $\\vec b$ correct to one decimal place. (2 marks)

**d.** Find the scalar projection of $\\vec b$ onto $\\vec a$. (2 marks)

${img("angle.svg", "2D vector diagram showing two vectors a and b from a common origin with an angle between them")}`,
    7, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* $|\\vec a| = \\sqrt{4 + 1 + 4} = 3$.
*Step 2 (1 mark):* $|\\vec b| = \\sqrt{1 + 4 + 4} = 3$.

**b. (1 mark)**
$\\vec a \\cdot \\vec b = 2 + 2 - 4 = 0$.

**c. (2 marks)**
*Step 1 (1 mark):* $\\cos\\theta = \\dfrac{\\vec a \\cdot \\vec b}{|\\vec a||\\vec b|} = \\dfrac{0}{9} = 0$.
*Step 2 (1 mark):* So $\\theta = 90.0°$ (the vectors are perpendicular).

**d. (2 marks)**
*Step 1 (1 mark):* Scalar projection $= \\dfrac{\\vec a \\cdot \\vec b}{|\\vec a|}$.
*Step 2 (1 mark):* $= \\dfrac{0}{3} = 0$ (consistent with perpendicularity).`),

  sq(`Consider the triangle $\\triangle ABC$ with $A(1, 0, 0)$, $B(0, 1, 0)$ and $C(0, 0, 1)$.

**a.** Find $\\vec{AB}$, $\\vec{AC}$ and $\\vec{BC}$. (3 marks)

**b.** Find the angle at vertex $A$ in degrees, correct to one decimal place. (3 marks)

**c.** Show that the triangle is equilateral, justifying via side lengths. (2 marks)`,
    8, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* $\\vec{AB} = (-1, 1, 0)$.
*Step 2 (1 mark):* $\\vec{AC} = (-1, 0, 1)$.
*Step 3 (1 mark):* $\\vec{BC} = (0, -1, 1)$.

**b. (3 marks)**
*Step 1 (1 mark):* Angle at $A$ is between $\\vec{AB}$ and $\\vec{AC}$. $\\vec{AB} \\cdot \\vec{AC} = 1 + 0 + 0 = 1$.
*Step 2 (1 mark):* $|\\vec{AB}| = \\sqrt 2$, $|\\vec{AC}| = \\sqrt 2$. So $\\cos(\\angle A) = \\dfrac{1}{2}$.
*Step 3 (1 mark):* $\\angle A = 60.0°$.

**c. (2 marks)**
*Step 1 (1 mark):* All three side lengths: $|\\vec{AB}| = |\\vec{AC}| = |\\vec{BC}| = \\sqrt 2$.
*Step 2 (1 mark):* All three sides equal, so the triangle is equilateral.`),

  sq(`Let $\\vec a = 3\\hat i + 4\\hat j$ and $\\vec b = \\hat i + 2\\hat j$.

**a.** Find the vector projection $\\text{proj}_{\\vec a} \\vec b$. (3 marks)

**b.** Hence resolve $\\vec b$ into a component parallel to $\\vec a$ and a component perpendicular to $\\vec a$. (3 marks)

**c.** Verify that the perpendicular component you found is indeed perpendicular to $\\vec a$. (2 marks)

${img("projection.svg", "Vector projection diagram showing b decomposed into components parallel and perpendicular to a")}`,
    8, "HARD",
    `**a. (3 marks)**
*Step 1 (1 mark):* $\\vec a \\cdot \\vec b = 3 + 8 = 11$.
*Step 2 (1 mark):* $|\\vec a|^2 = 9 + 16 = 25$.
*Step 3 (1 mark):* $\\text{proj}_{\\vec a}\\vec b = \\dfrac{11}{25}(3\\hat i + 4\\hat j) = \\dfrac{33}{25}\\hat i + \\dfrac{44}{25}\\hat j$.

**b. (3 marks)**
*Step 1 (1 mark):* Parallel component: $\\vec b_\\parallel = \\text{proj}_{\\vec a}\\vec b = \\dfrac{33}{25}\\hat i + \\dfrac{44}{25}\\hat j$.
*Step 2 (1 mark):* Perpendicular component: $\\vec b_\\perp = \\vec b - \\vec b_\\parallel = (1 - 33/25)\\hat i + (2 - 44/25)\\hat j$.
*Step 3 (1 mark):* $= -\\dfrac{8}{25}\\hat i + \\dfrac{6}{25}\\hat j$.

**c. (2 marks)**
*Step 1 (1 mark):* Compute $\\vec a \\cdot \\vec b_\\perp = 3(-8/25) + 4(6/25) = (-24 + 24)/25 = 0$.
*Step 2 (1 mark):* Since the dot product is zero, $\\vec b_\\perp$ is perpendicular to $\\vec a$. ✓`),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer, extendedAnswer };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS to ${JSON_PATH}\n` +
    `Wrote ${Object.keys(figures).length} SVG files to ${FIGURES_DIR}/`,
);
