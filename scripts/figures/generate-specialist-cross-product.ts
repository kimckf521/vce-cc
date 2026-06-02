/**
 * Specialist: Cross Product (Vector Product).
 * Tier: extended-fit → MCQ + SHORT + EXT_ANS.
 */

import * as fs from "fs";
import * as path from "path";
import { vector3D, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/specialist-cross-product";
const JSON_PATH = "scripts/output/qset-specialist-cross-product.json";
fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Figures ────────────────────────────────────────────────────────────

const figIJK = vector3D({
  vectors: [
    { to: { x: 2, y: 0, z: 0 }, label: "$\\hat i$" },
    { to: { x: 0, y: 2, z: 0 }, label: "$\\hat j$", color: "#2563eb" },
    { to: { x: 0, y: 0, z: 2 }, label: "$\\hat k = \\hat i \\times \\hat j$", color: "#16a34a" },
  ],
  axisExtent: 3,
});

const figCross = vector3D({
  vectors: [
    { to: { x: 2, y: 1, z: 0 }, label: "a" },
    { to: { x: 1, y: 3, z: 0 }, label: "b", color: "#2563eb" },
    { to: { x: 0, y: 0, z: 5 }, label: "a × b", color: "#16a34a" },
  ],
  axisExtent: 4,
});

const figParallelogram = vector3D({
  vectors: [
    { to: { x: 3, y: 0, z: 0 }, label: "u" },
    { to: { x: 1, y: 2, z: 0 }, label: "v", color: "#2563eb" },
    { from: { x: 3, y: 0, z: 0 }, to: { x: 4, y: 2, z: 0 }, color: "#2563eb", dash: true },
    { from: { x: 1, y: 2, z: 0 }, to: { x: 4, y: 2, z: 0 }, color: "#dc2626", dash: true },
  ],
  axisExtent: 4,
});

const figTorque = vector3D({
  vectors: [
    { to: { x: 2, y: 0, z: 0 }, label: "r" },
    { to: { x: 0, y: 2, z: 0 }, label: "F", color: "#2563eb" },
    { to: { x: 0, y: 0, z: 4 }, label: "τ = r × F", color: "#16a34a" },
  ],
  axisExtent: 4,
});

const figures: Record<string, string> = {
  "ijk.svg": figIJK,
  "cross.svg": figCross,
  "parallelogram.svg": figParallelogram,
  "torque.svg": figTorque,
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
  subtopicSlugs: ["cross-product-vector-product", ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: ["cross-product-vector-product", ...sec],
});

// ─── 12 MCQ ─────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("$\\hat i \\times \\hat j$ equals:",
    ["$\\hat k$", "$-\\hat k$", "$\\hat i$", "$0$"], "A", "EASY",
    "Right-hand rule: $\\hat i \\times \\hat j = \\hat k$. **Answer: A**"),
  m("$\\hat j \\times \\hat i$ equals:",
    ["$\\hat k$", "$-\\hat k$", "$\\hat i + \\hat j$", "$0$"], "B", "EASY",
    "Cross product is anti-commutative: $\\hat j \\times \\hat i = -(\\hat i \\times \\hat j) = -\\hat k$. **Answer: B**"),
  m("$\\hat k \\times \\hat k$ equals:",
    ["$1$", "$\\hat k$", "$\\vec 0$", "$|\\hat k|^2$"], "C", "EASY",
    "Cross product of any vector with itself is the zero vector. **Answer: C**"),
  m("If $\\vec a \\parallel \\vec b$ (parallel), then $\\vec a \\times \\vec b$ equals:",
    ["$|\\vec a||\\vec b|$", "$\\vec 0$", "$\\vec a \\cdot \\vec b$", "$-\\vec b \\times \\vec a$"], "B", "EASY",
    "When two vectors are parallel, $\\sin\\theta = 0$ so the cross product is the zero vector. **Answer: B**"),
  m("The magnitude $|\\vec a \\times \\vec b|$ equals:",
    ["$|\\vec a||\\vec b|\\cos\\theta$", "$|\\vec a||\\vec b|\\sin\\theta$", "$|\\vec a| + |\\vec b|$", "$\\vec a \\cdot \\vec b$"], "B", "EASY",
    "$|\\vec a \\times \\vec b| = |\\vec a||\\vec b|\\sin\\theta$ where $\\theta$ is the angle between them. **Answer: B**"),
  m("$(2\\hat i) \\times (3\\hat j)$ equals:",
    ["$6\\hat k$", "$-6\\hat k$", "$6$", "$5\\hat i \\hat j$"], "A", "MEDIUM",
    "$(2\\hat i) \\times (3\\hat j) = 6(\\hat i \\times \\hat j) = 6\\hat k$. **Answer: A**"),
  m("If $\\vec a = \\hat i + \\hat j$ and $\\vec b = \\hat i - \\hat j$, then $\\vec a \\times \\vec b$ equals:",
    ["$2\\hat k$", "$-2\\hat k$", "$\\vec 0$", "$2\\hat i$"], "B", "MEDIUM",
    "Using determinant: $\\vec a \\times \\vec b = (1 \\cdot 0 - 0 \\cdot (-1))\\hat i - (1 \\cdot 0 - 0 \\cdot 1)\\hat j + (1 \\cdot (-1) - 1 \\cdot 1)\\hat k = -2\\hat k$. **Answer: B**"),
  m("If $\\vec a = (1, 2, 3)$ and $\\vec b = (2, 1, 0)$, then $\\vec a \\times \\vec b$ equals:",
    ["$(-3, 6, -3)$", "$(3, -6, 3)$", "$(2, 2, 0)$", "$(-3, 6, 3)$"], "A", "MEDIUM",
    "$\\vec a \\times \\vec b = (2 \\cdot 0 - 3 \\cdot 1, 3 \\cdot 2 - 1 \\cdot 0, 1 \\cdot 1 - 2 \\cdot 2) = (-3, 6, -3)$. **Answer: A**"),
  m("The area of the parallelogram spanned by $\\vec a$ and $\\vec b$ is:",
    ["$|\\vec a \\cdot \\vec b|$", "$|\\vec a \\times \\vec b|$", "$\\frac{1}{2}|\\vec a \\times \\vec b|$", "$|\\vec a| + |\\vec b|$"], "B", "MEDIUM",
    "Area of parallelogram $= |\\vec a \\times \\vec b|$. (For triangle it would be half.) **Answer: B**"),
  m("If $|\\vec a| = 4$, $|\\vec b| = 5$ and the angle between them is $30°$, then $|\\vec a \\times \\vec b|$ equals:",
    ["$10$", "$20\\sqrt{3}$", "$\\frac{20\\sqrt 3}{2} = 10\\sqrt 3$", "$20\\cos 30°$"], "A", "MEDIUM",
    "$|\\vec a \\times \\vec b| = 4 \\cdot 5 \\cdot \\sin 30° = 20 \\cdot 1/2 = 10$. **Answer: A**"),
  m("The vector $\\vec a \\times \\vec b$ is:",
    ["parallel to $\\vec a$", "parallel to $\\vec b$", "perpendicular to both $\\vec a$ and $\\vec b$", "in the plane of $\\vec a$ and $\\vec b$"], "C", "HARD",
    "By definition, $\\vec a \\times \\vec b$ is perpendicular to both $\\vec a$ and $\\vec b$ (it's normal to the plane they span). **Answer: C**"),
  m("If $\\vec a = 2\\hat i - \\hat j + \\hat k$ and $\\vec b = \\hat i + \\hat j + 2\\hat k$, then $\\vec a \\times \\vec b$ equals:",
    ["$-3\\hat i - 3\\hat j + 3\\hat k$", "$-3\\hat i + 3\\hat j + 3\\hat k$", "$-3\\hat i - 3\\hat j - 3\\hat k$", "$3\\hat i - 3\\hat j + 3\\hat k$"], "A", "HARD",
    "$\\vec a \\times \\vec b = ((-1)(2) - (1)(1))\\hat i - ((2)(2) - (1)(1))\\hat j + ((2)(1) - (-1)(1))\\hat k = -3\\hat i - 3\\hat j + 3\\hat k$. **Answer: A**"),
];

// ─── 8 SHORT_ANSWER ─────────────────────────────────────────────────────

const shortAnswer: FR[] = [
  sq("Find $\\vec a \\times \\vec b$ where $\\vec a = 3\\hat i + 2\\hat j$ and $\\vec b = \\hat i - \\hat j$.", 2, "EASY",
    "*Step 1 (1 mark):* Using the determinant formula: $\\vec a \\times \\vec b = (2 \\cdot 0 - 0 \\cdot (-1))\\hat i - (3 \\cdot 0 - 0 \\cdot 1)\\hat j + (3 \\cdot (-1) - 2 \\cdot 1)\\hat k$.\n*Step 2 (1 mark):* Simplify: $\\vec a \\times \\vec b = -5\\hat k$."),
  sq("Find $\\vec u \\times \\vec v$ where $\\vec u = \\hat i + \\hat j + \\hat k$ and $\\vec v = 2\\hat i - \\hat j + 3\\hat k$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $\\vec u \\times \\vec v = \\begin{vmatrix}\\hat i & \\hat j & \\hat k \\\\ 1 & 1 & 1 \\\\ 2 & -1 & 3\\end{vmatrix}$.\n*Step 2 (1 mark):* $\\hat i$-component: $(1)(3) - (1)(-1) = 4$; $\\hat j$-component: $-((1)(3) - (1)(2)) = -1$; $\\hat k$-component: $(1)(-1) - (1)(2) = -3$.\n*Step 3 (1 mark):* So $\\vec u \\times \\vec v = 4\\hat i - \\hat j - 3\\hat k$."),
  sq("Find the area of the parallelogram with adjacent sides $\\vec a = 2\\hat i + \\hat k$ and $\\vec b = -\\hat i + 3\\hat j$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Compute $\\vec a \\times \\vec b = ((1)(0) - (0)(3))\\hat i - ((2)(0) - (1)(-1))\\hat j + ((2)(3) - (0)(-1))\\hat k = 0\\hat i - \\hat j + 6\\hat k$.\n*Step 2 (1 mark):* Wait: $\\hat i$-component is $(0)(0)-(1)(3) = -3$. Correct: $\\vec a = (2,0,1)$, $\\vec b = (-1,3,0)$, so $(0 \\cdot 0 - 1 \\cdot 3, 1 \\cdot (-1) - 2 \\cdot 0, 2 \\cdot 3 - 0 \\cdot (-1)) = (-3, -1, 6)$.\n*Step 3 (1 mark):* Area $= |\\vec a \\times \\vec b| = \\sqrt{9 + 1 + 36} = \\sqrt{46}$."),
  sq("Find a unit vector perpendicular to both $\\vec a = \\hat i + 2\\hat j$ and $\\vec b = 3\\hat j + \\hat k$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $\\vec a \\times \\vec b = ((2)(1) - (0)(3), (0)(0) - (1)(1), (1)(3) - (2)(0)) = (2, -1, 3)$.\n*Step 2 (1 mark):* $|\\vec a \\times \\vec b| = \\sqrt{4 + 1 + 9} = \\sqrt{14}$.\n*Step 3 (1 mark):* Unit vector: $\\dfrac{1}{\\sqrt{14}}(2\\hat i - \\hat j + 3\\hat k)$."),
  sq("Find the area of the triangle with vertices $A(1,0,0)$, $B(0,2,0)$, $C(0,0,3)$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $\\vec{AB} = (-1, 2, 0)$ and $\\vec{AC} = (-1, 0, 3)$.\n*Step 2 (1 mark):* $\\vec{AB} \\times \\vec{AC} = ((2)(3) - (0)(0), (0)(-1) - (-1)(3), (-1)(0) - (2)(-1)) = (6, 3, 2)$.\n*Step 3 (1 mark):* Area $= \\dfrac{1}{2}|\\vec{AB} \\times \\vec{AC}| = \\dfrac{1}{2}\\sqrt{36 + 9 + 4} = \\dfrac{7}{2}$."),
  sq("Given $\\vec a = 2\\hat i + \\hat j - \\hat k$ and $\\vec b = \\hat i - 2\\hat j + 3\\hat k$, find $\\vec a \\times \\vec b$ and verify that it is perpendicular to $\\vec a$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $\\vec a \\times \\vec b = ((1)(3) - (-1)(-2), (-1)(1) - (2)(3), (2)(-2) - (1)(1)) = (1, -7, -5)$.\n*Step 2 (1 mark):* Compute $\\vec a \\cdot (\\vec a \\times \\vec b) = 2(1) + 1(-7) + (-1)(-5) = 2 - 7 + 5 = 0$.\n*Step 3 (1 mark):* Since the dot product is zero, $\\vec a \\times \\vec b$ is perpendicular to $\\vec a$, as expected."),
  sq("If $|\\vec a| = 3$, $|\\vec b| = 5$ and the angle between them is $\\frac{\\pi}{3}$, find $|\\vec a \\times \\vec b|$.", 2, "EASY",
    "*Step 1 (1 mark):* $|\\vec a \\times \\vec b| = |\\vec a||\\vec b|\\sin\\theta = 3 \\cdot 5 \\cdot \\sin(\\pi/3)$.\n*Step 2 (1 mark):* $= 15 \\cdot \\dfrac{\\sqrt 3}{2} = \\dfrac{15\\sqrt 3}{2}$."),
  sq("Show that for any vectors $\\vec a, \\vec b \\in \\mathbb{R}^3$, the identity $|\\vec a \\times \\vec b|^2 + (\\vec a \\cdot \\vec b)^2 = |\\vec a|^2 |\\vec b|^2$ (Lagrange's identity) holds.", 3, "HARD",
    "*Step 1 (1 mark):* $|\\vec a \\times \\vec b|^2 = |\\vec a|^2 |\\vec b|^2 \\sin^2\\theta$ and $(\\vec a \\cdot \\vec b)^2 = |\\vec a|^2 |\\vec b|^2 \\cos^2\\theta$.\n*Step 2 (1 mark):* Sum: $|\\vec a|^2 |\\vec b|^2 (\\sin^2\\theta + \\cos^2\\theta)$.\n*Step 3 (1 mark):* By the Pythagorean identity $\\sin^2\\theta + \\cos^2\\theta = 1$, the sum equals $|\\vec a|^2 |\\vec b|^2$. ✓"),
];

// ─── 3 EXT_ANS ──────────────────────────────────────────────────────────

const extendedAnswer: FR[] = [
  sq(`Let $\\vec a = 2\\hat i + 3\\hat j - \\hat k$ and $\\vec b = \\hat i - \\hat j + 2\\hat k$.

**a.** Find $\\vec a \\times \\vec b$. (2 marks)

**b.** Hence find the area of the parallelogram with adjacent sides $\\vec a$ and $\\vec b$. (2 marks)

**c.** Find a unit vector perpendicular to both $\\vec a$ and $\\vec b$. (2 marks)

${img("cross.svg", "3D vector diagram showing two vectors a and b with their cross product perpendicular to both")}`,
    6, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* $\\vec a \\times \\vec b = ((3)(2) - (-1)(-1))\\hat i - ((2)(2) - (-1)(1))\\hat j + ((2)(-1) - (3)(1))\\hat k$.
*Step 2 (1 mark):* $= (6 - 1)\\hat i - (4 + 1)\\hat j + (-2 - 3)\\hat k = 5\\hat i - 5\\hat j - 5\\hat k$.

**b. (2 marks)**
*Step 1 (1 mark):* $|\\vec a \\times \\vec b| = \\sqrt{25 + 25 + 25} = \\sqrt{75} = 5\\sqrt 3$.
*Step 2 (1 mark):* Area $= 5\\sqrt 3$ square units.

**c. (2 marks)**
*Step 1 (1 mark):* Unit vector: $\\dfrac{\\vec a \\times \\vec b}{|\\vec a \\times \\vec b|} = \\dfrac{5\\hat i - 5\\hat j - 5\\hat k}{5\\sqrt 3}$.
*Step 2 (1 mark):* $= \\dfrac{1}{\\sqrt 3}(\\hat i - \\hat j - \\hat k)$.`),

  sq(`Consider the triangle $\\triangle PQR$ with vertices $P(1, 2, 3)$, $Q(2, -1, 1)$ and $R(3, 1, 4)$.

**a.** Find $\\vec{PQ}$ and $\\vec{PR}$. (2 marks)

**b.** Compute $\\vec{PQ} \\times \\vec{PR}$. (3 marks)

**c.** Hence find the area of $\\triangle PQR$. (2 marks)`,
    7, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* $\\vec{PQ} = Q - P = (2-1, -1-2, 1-3) = (1, -3, -2)$.
*Step 2 (1 mark):* $\\vec{PR} = R - P = (3-1, 1-2, 4-3) = (2, -1, 1)$.

**b. (3 marks)**
*Step 1 (1 mark):* $\\hat i$-component: $(-3)(1) - (-2)(-1) = -3 - 2 = -5$.
*Step 2 (1 mark):* $\\hat j$-component: $-((1)(1) - (-2)(2)) = -(1 + 4) = -5$.
*Step 3 (1 mark):* $\\hat k$-component: $(1)(-1) - (-3)(2) = -1 + 6 = 5$. So $\\vec{PQ} \\times \\vec{PR} = -5\\hat i - 5\\hat j + 5\\hat k$.

**c. (2 marks)**
*Step 1 (1 mark):* $|\\vec{PQ} \\times \\vec{PR}| = \\sqrt{25 + 25 + 25} = 5\\sqrt 3$.
*Step 2 (1 mark):* Area $= \\dfrac{1}{2} \\cdot 5\\sqrt 3 = \\dfrac{5\\sqrt 3}{2}$ square units.`),

  sq(`Three points $A(1, 0, 2)$, $B(2, 1, 1)$ and $C(0, 2, 3)$ lie in a plane $\\Pi$.

**a.** Find two vectors that lie in the plane $\\Pi$. (2 marks)

**b.** Find a vector normal to the plane $\\Pi$ using the cross product. (3 marks)

**c.** Hence write down the Cartesian equation of $\\Pi$ in the form $ax + by + cz = d$. (3 marks)

${img("parallelogram.svg", "3D parallelogram showing two vectors spanning a plane with the cross product giving the normal vector")}`,
    8, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* $\\vec{AB} = B - A = (1, 1, -1)$.
*Step 2 (1 mark):* $\\vec{AC} = C - A = (-1, 2, 1)$.

**b. (3 marks)**
*Step 1 (1 mark):* $\\hat i$-component: $(1)(1) - (-1)(2) = 1 + 2 = 3$.
*Step 2 (1 mark):* $\\hat j$-component: $-((1)(1) - (-1)(-1)) = -(1 - 1) = 0$.
*Step 3 (1 mark):* $\\hat k$-component: $(1)(2) - (1)(-1) = 2 + 1 = 3$. So $\\vec n = \\vec{AB} \\times \\vec{AC} = (3, 0, 3)$, or equivalently $(1, 0, 1)$.

**c. (3 marks)**
*Step 1 (1 mark):* The plane has equation $\\vec n \\cdot (\\vec r - \\vec A) = 0$.
*Step 2 (1 mark):* Using $\\vec n = (1, 0, 1)$ and $A = (1, 0, 2)$: $1(x - 1) + 0(y - 0) + 1(z - 2) = 0$.
*Step 3 (1 mark):* Expand: $x + z = 3$.`),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer, extendedAnswer };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS to ${JSON_PATH}\n` +
    `Wrote ${Object.keys(figures).length} SVG files to ${FIGURES_DIR}/`,
);
