/**
 * Specialist pilot: Complex Numbers (Cartesian Form).
 * Tier: modelling-rich → MCQ + SHORT + EXT_ANS + EXT_RESP.
 * Demonstrates argandPlot usage for the rest of the bank.
 */

import * as fs from "fs";
import * as path from "path";
import { argandPlot, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/specialist-complex-cartesian";
const JSON_PATH = "scripts/output/qset-specialist-complex-cartesian.json";
fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Figures ────────────────────────────────────────────────────────────

const figConjugate = argandPlot({
  points: [
    { re: 3, im: 2, label: "z = 3 + 2i" },
    { re: 3, im: -2, label: " ̅​z = 3 - 2i", color: "#2563eb" },
  ],
  drawVectors: true,
  reRange: [-1, 5],
  imRange: [-3, 3],
});

const figSum = argandPlot({
  points: [
    { re: 2, im: 1, label: "z₁ = 2 + i" },
    { re: 1, im: 3, label: "z₂ = 1 + 3i", color: "#2563eb" },
    { re: 3, im: 4, label: "z₁ + z₂", color: "#16a34a" },
  ],
  drawVectors: true,
  segments: [
    { from: { re: 2, im: 1 }, to: { re: 3, im: 4 }, dash: true, color: "#2563eb" },
  ],
  reRange: [-1, 5],
  imRange: [-1, 5],
});

const figProduct = argandPlot({
  points: [
    { re: 1, im: 1, label: "z = 1 + i" },
    { re: 0, im: 2, label: "z² = 2i", color: "#2563eb" },
    { re: -2, im: 2, label: "z³ = -2 + 2i", color: "#16a34a" },
  ],
  drawVectors: true,
  reRange: [-3, 3],
  imRange: [-1, 3],
});

const figDivision = argandPlot({
  points: [
    { re: 4, im: 2, label: "z = 4 + 2i" },
    { re: 0.8, im: 0.4, label: "z/5", color: "#2563eb" },
    { re: 4, im: -2, label: "z̄ = 4 - 2i", color: "#9ca3af" },
  ],
  drawVectors: true,
  reRange: [-1, 5],
  imRange: [-3, 3],
});

const figures: Record<string, string> = {
  "conjugate.svg": figConjugate,
  "sum.svg": figSum,
  "product.svg": figProduct,
  "division.svg": figDivision,
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
  subtopicSlugs: ["complex-numbers-cartesian-form", ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: ["complex-numbers-cartesian-form", ...sec],
});

// ─── 15 MCQ ─────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("If $z = 3 + 2i$, then $\\bar{z}$ equals:",
    ["$3 + 2i$", "$3 - 2i$", "$-3 + 2i$", "$-3 - 2i$"], "B", "EASY",
    "Complex conjugate flips the sign of the imaginary part: $\\bar{z} = 3 - 2i$. **Answer: B**"),
  m("$\\text{Re}(4 - 7i)$ equals:",
    ["$4$", "$-7$", "$7$", "$-4$"], "A", "EASY",
    "$\\text{Re}(a + bi) = a$, so $\\text{Re}(4 - 7i) = 4$. **Answer: A**"),
  m("$(2 + 3i) + (5 - i)$ equals:",
    ["$7 + 2i$", "$7 + 4i$", "$-3 + 2i$", "$7 - 2i$"], "A", "EASY",
    "Add real and imaginary parts: $(2 + 5) + (3 - 1)i = 7 + 2i$. **Answer: A**"),
  m("$(1 + i)(1 - i)$ equals:",
    ["$0$", "$2$", "$2i$", "$1 - i^2$"], "B", "EASY",
    "Difference of squares: $1 - i^2 = 1 - (-1) = 2$. **Answer: B**"),
  m("$i^4$ equals:",
    ["$-1$", "$1$", "$-i$", "$i$"], "B", "EASY",
    "$i^2 = -1$, $i^4 = (i^2)^2 = 1$. **Answer: B**"),
  m("If $z = 2 - i$, then $z \\bar{z}$ equals:",
    ["$3$", "$5$", "$4 + i^2$", "$5i$"], "B", "MEDIUM",
    "$z\\bar{z} = |z|^2 = 2^2 + (-1)^2 = 5$. **Answer: B**"),
  m("The solutions to $z^2 = -9$ over $\\mathbb{C}$ are:",
    ["$z = 3$ only", "$z = \\pm 3$", "$z = \\pm 3i$", "$z = \\pm 9i$"], "C", "MEDIUM",
    "$z^2 = -9 \\Rightarrow z = \\pm\\sqrt{-9} = \\pm 3i$. **Answer: C**"),
  m("$(3 + 2i)(1 - i)$ equals:",
    ["$3 - 2i^2$", "$5 - i$", "$1 + 5i$", "$5 + i$"], "B", "MEDIUM",
    "$(3 + 2i)(1 - i) = 3 - 3i + 2i - 2i^2 = 3 - i + 2 = 5 - i$. **Answer: B**"),
  m("$\\dfrac{1}{i}$ equals:",
    ["$i$", "$-i$", "$0$", "$1$"], "B", "MEDIUM",
    "$\\dfrac{1}{i} \\cdot \\dfrac{i}{i} = \\dfrac{i}{i^2} = -i$. **Answer: B**"),
  m("$\\dfrac{2 + i}{1 - i}$ in Cartesian form equals:",
    ["$\\dfrac{1}{2} + \\dfrac{3}{2}i$", "$1 + i$", "$2 + 3i$", "$3 + i$"], "A", "MEDIUM",
    "Multiply by conjugate: $\\dfrac{(2 + i)(1 + i)}{(1 - i)(1 + i)} = \\dfrac{2 + 2i + i - 1}{2} = \\dfrac{1 + 3i}{2}$. **Answer: A**"),
  m("If $(a + bi)(2 + i) = 5 + 5i$ with $a, b \\in \\mathbb{R}$, then $a$ equals:",
    ["$1$", "$3$", "$5$", "$2$"], "B", "MEDIUM",
    "$(a + bi)(2 + i) = (2a - b) + (a + 2b)i$. Set $2a - b = 5$, $a + 2b = 5$: solve $a = 3$, $b = 1$. **Answer: B**"),
  m("$i^{2026}$ equals:",
    ["$1$", "$-1$", "$i$", "$-i$"], "B", "HARD",
    "Powers of $i$ cycle with period 4: $2026 = 4 \\cdot 506 + 2$, so $i^{2026} = i^2 = -1$. **Answer: B**"),
  m("If $z$ satisfies $z + 2\\bar{z} = 6 + i$, then $z$ equals:",
    ["$2 + i$", "$2 - i$", "$6 + i$", "$3 + i$"], "B", "HARD",
    "Let $z = a + bi$: $z + 2\\bar{z} = (a + bi) + 2(a - bi) = 3a - bi = 6 + i$. So $a = 2$, $b = -1$, i.e. $z = 2 - i$. **Answer: B**"),
  m("If $z\\bar{z} - 2z = 3 + 2i$, the imaginary part of $z$ is:",
    ["$1$", "$-1$", "$2$", "$-2$"], "B", "HARD",
    "Let $z = a + bi$. $z\\bar{z} = a^2 + b^2$ is real, $-2z = -2a - 2bi$. Imaginary part: $-2b = 2 \\Rightarrow b = -1$. **Answer: B**"),
  m("The complex number $z$ with $z^2 = 5 + 12i$ in Cartesian form is:",
    ["$3 + 2i$", "$2 + 3i$", "$\\pm(3 + 2i)$", "$\\pm(2 + 3i)$"], "C", "HARD",
    "Let $z = a + bi$: $a^2 - b^2 = 5$ and $2ab = 12$. Try $a = 3$, $b = 2$: $9 - 4 = 5$ ✓ and $2 \\cdot 3 \\cdot 2 = 12$ ✓. So $z = \\pm(3 + 2i)$. **Answer: C**"),
];

// ─── 10 SHORT (technique drills, Exam-1-style) ──────────────────────────

const shortAnswer: FR[] = [
  sq("Simplify $(3 - 2i) + (4 + 5i) - (1 + i)$, giving your answer in the form $a + bi$.", 2, "EASY",
    "*Step 1 (1 mark):* Combine real parts: $3 + 4 - 1 = 6$.\n*Step 2 (1 mark):* Combine imaginary parts: $-2 + 5 - 1 = 2$. Answer: $6 + 2i$."),
  sq("Expand and simplify $(2 + i)(3 - 4i)$, giving your answer in the form $a + bi$.", 2, "EASY",
    "*Step 1 (1 mark):* $(2 + i)(3 - 4i) = 6 - 8i + 3i - 4i^2$.\n*Step 2 (1 mark):* Simplify with $i^2 = -1$: $6 - 8i + 3i + 4 = 10 - 5i$."),
  sq("Express $\\dfrac{3 + 4i}{1 + 2i}$ in the form $a + bi$ where $a, b \\in \\mathbb{R}$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Multiply numerator and denominator by the conjugate $1 - 2i$.\n*Step 2 (1 mark):* Numerator: $(3 + 4i)(1 - 2i) = 3 - 6i + 4i + 8 = 11 - 2i$.\n*Step 3 (1 mark):* Denominator: $(1 + 2i)(1 - 2i) = 1 + 4 = 5$. Hence $\\dfrac{11 - 2i}{5} = \\dfrac{11}{5} - \\dfrac{2}{5}i$."),
  sq("Find all complex numbers $z$ satisfying $z^2 = 8 + 6i$, giving each answer in the form $a + bi$.", 3, "HARD",
    "*Step 1 (1 mark):* Let $z = a + bi$, so $z^2 = (a^2 - b^2) + 2abi$. Then $a^2 - b^2 = 8$ and $2ab = 6 \\Rightarrow ab = 3$.\n*Step 2 (1 mark):* From $b = 3/a$: $a^2 - 9/a^2 = 8 \\Rightarrow a^4 - 8a^2 - 9 = 0 \\Rightarrow (a^2 - 9)(a^2 + 1) = 0 \\Rightarrow a^2 = 9$ (since $a$ real).\n*Step 3 (1 mark):* $a = \\pm 3$ giving $b = \\pm 1$. Answers: $z = 3 + i$ or $z = -3 - i$."),
  sq("If $z = 2 - 3i$, evaluate $z^2 - 4z + 13$ and hence write down a quadratic equation with real coefficients of which $z$ is a root.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $z^2 = (2 - 3i)^2 = 4 - 12i + 9i^2 = -5 - 12i$.\n*Step 2 (1 mark):* $z^2 - 4z + 13 = (-5 - 12i) - 4(2 - 3i) + 13 = -5 - 12i - 8 + 12i + 13 = 0$.\n*Step 3 (1 mark):* So $z = 2 - 3i$ satisfies $z^2 - 4z + 13 = 0$, a real-coefficient quadratic."),
  sq("Find real numbers $a$ and $b$ such that $(a + bi)(2 - i) = 3 + 4i$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Expand: $(a + bi)(2 - i) = 2a - ai + 2bi - bi^2 = (2a + b) + (-a + 2b)i$.\n*Step 2 (1 mark):* Equate parts: $2a + b = 3$ and $-a + 2b = 4$.\n*Step 3 (1 mark):* Solving: $4a + 2b = 6$, subtract: $5a = 2 \\Rightarrow a = 2/5$, $b = 3 - 4/5 = 11/5$."),
  sq("Evaluate $i^{30} + i^{31} + i^{32} + i^{33}$, justifying your working.", 2, "MEDIUM",
    "*Step 1 (1 mark):* Powers of $i$ cycle with period 4. Reducing: $30 = 4 \\cdot 7 + 2$, so $i^{30} = i^2 = -1$; similarly $i^{31} = -i$, $i^{32} = 1$, $i^{33} = i$.\n*Step 2 (1 mark):* Sum: $-1 - i + 1 + i = 0$."),
  sq("If $z + \\bar{z} = 6$ and $z\\bar{z} = 13$, find $z$ in the form $a + bi$ with $b > 0$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $z + \\bar{z} = 2a = 6 \\Rightarrow a = 3$.\n*Step 2 (1 mark):* $z\\bar{z} = a^2 + b^2 = 13 \\Rightarrow b^2 = 4$.\n*Step 3 (1 mark):* Taking $b > 0$: $b = 2$. So $z = 3 + 2i$."),
  sq("Let $z = 1 - i$. Express $z^4$ in the form $a + bi$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $z^2 = (1 - i)^2 = 1 - 2i + i^2 = -2i$.\n*Step 2 (1 mark):* $z^4 = (z^2)^2 = (-2i)^2 = 4 i^2$.\n*Step 3 (1 mark):* $= -4$. So $z^4 = -4 + 0 i = -4$."),
  sq("Let $z = a + bi$ where $a, b \\in \\mathbb{R}$. Show that $z + \\bar{z}$ is real and that $z - \\bar{z}$ is purely imaginary.", 2, "MEDIUM",
    "*Step 1 (1 mark):* $z + \\bar{z} = (a + bi) + (a - bi) = 2a$, which is real.\n*Step 2 (1 mark):* $z - \\bar{z} = (a + bi) - (a - bi) = 2bi$, which is purely imaginary."),
];

// ─── 4 EXT_ANS (Section A / Exam-1 multi-part) ──────────────────────────

const extendedAnswer: FR[] = [
  sq(`Let $z = 2 + 3i$ and $w = 1 - i$.

**a.** Calculate $zw$, giving your answer in the form $a + bi$. (2 marks)

**b.** Calculate $\\dfrac{z}{w}$, giving your answer in the form $a + bi$. (3 marks)

**c.** Find $|z|^2 + |w|^2$. (1 mark)`,
    6, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* $zw = (2 + 3i)(1 - i) = 2 - 2i + 3i + 3 = 5 + i$.

**b. (3 marks)**
*Step 1 (1 mark):* Multiply by $\\bar{w} = 1 + i$: $\\dfrac{z\\bar{w}}{w\\bar{w}}$.
*Step 2 (1 mark):* Numerator: $(2 + 3i)(1 + i) = 2 + 2i + 3i - 3 = -1 + 5i$.
*Step 3 (1 mark):* Denominator: $|w|^2 = 1 + 1 = 2$. So $\\dfrac{z}{w} = -\\dfrac{1}{2} + \\dfrac{5}{2} i$.

**c. (1 mark)** $|z|^2 + |w|^2 = (4 + 9) + (1 + 1) = 15$.`),

  sq(`Let $P(z) = z^2 - 4z + 13$.

**a.** Show that $z = 2 + 3i$ is a root of $P(z) = 0$. (2 marks)

**b.** Hence write down a second complex root of $P(z) = 0$ and explain your reasoning. (2 marks)

**c.** Factorise $P(z)$ over $\\mathbb{C}$. (2 marks)`,
    6, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* $(2 + 3i)^2 = 4 + 12i + 9 i^2 = -5 + 12 i$.
*Step 2 (1 mark):* $P(2 + 3i) = -5 + 12i - 4(2 + 3i) + 13 = -5 + 12i - 8 - 12i + 13 = 0$. ✓

**b. (2 marks)**
*Step 1 (1 mark):* Since $P$ has real coefficients, complex roots occur in conjugate pairs.
*Step 2 (1 mark):* So $z = 2 - 3i$ is also a root.

**c. (2 marks)**
*Step 1 (1 mark):* The two linear factors are $z - (2 + 3i)$ and $z - (2 - 3i)$.
*Step 2 (1 mark):* $P(z) = (z - (2 + 3i))(z - (2 - 3i))$.`),

  sq(`Consider the equation $z^2 + (3 - i)z + a = 0$, where $a \\in \\mathbb{C}$ is a constant.

**a.** Given that $z = 1$ is a solution, find $a$. (2 marks)

**b.** Hence find the other solution to the equation in Cartesian form. (3 marks)

**c.** Verify your second solution by substitution. (2 marks)`,
    7, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* Substituting $z = 1$: $1 + (3 - i) + a = 0$.
*Step 2 (1 mark):* So $a = -4 + i$.

**b. (3 marks)**
*Step 1 (1 mark):* By Vieta's, product of roots $= a = -4 + i$, and one root is $1$.
*Step 2 (1 mark):* So the other root $z_2 = \\dfrac{-4 + i}{1} = -4 + i$.
*Step 3 (1 mark):* Alternative check: sum of roots $= -(3 - i) = -3 + i$, so $z_2 = -3 + i - 1 = -4 + i$ ✓.

**c. (2 marks)**
*Step 1 (1 mark):* $z_2^2 = (-4 + i)^2 = 16 - 8i + i^2 = 15 - 8i$.
*Step 2 (1 mark):* $z_2^2 + (3 - i)z_2 + a = (15 - 8i) + (3 - i)(-4 + i) + (-4 + i) = (15 - 8i) + (-12 + 3i + 4i + 1) + (-4 + i) = (15 - 11 - 4) + (-8 + 7 + 1)i = 0$. ✓`),

  sq(`Let $z = a + bi$ where $a, b \\in \\mathbb{R}$ and $b \\ne 0$.

**a.** Show that $z + \\dfrac{1}{z}$ is real if and only if $a^2 + b^2 = 1$. (4 marks)

**b.** Hence find all complex numbers $z = a + bi$ with $a, b \\in \\mathbb{R}$, $b \\ne 0$, satisfying $z + \\dfrac{1}{z} = 1$. (3 marks)

${img("conjugate.svg", "Argand diagram showing z = 3 + 2i and its conjugate z̄ = 3 - 2i with vectors drawn from the origin")}`,
    7, "HARD",
    `**a. (4 marks)**
*Step 1 (1 mark):* $\\dfrac{1}{z} = \\dfrac{\\bar{z}}{|z|^2} = \\dfrac{a - bi}{a^2 + b^2}$.
*Step 2 (1 mark):* So $z + \\dfrac{1}{z} = a + bi + \\dfrac{a - bi}{a^2 + b^2} = \\left(a + \\dfrac{a}{a^2 + b^2}\\right) + \\left(b - \\dfrac{b}{a^2 + b^2}\\right) i$.
*Step 3 (1 mark):* This is real iff its imaginary part is zero: $b - \\dfrac{b}{a^2 + b^2} = 0$.
*Step 4 (1 mark):* Since $b \\ne 0$: $1 - \\dfrac{1}{a^2 + b^2} = 0 \\Rightarrow a^2 + b^2 = 1$. ✓

**b. (3 marks)**
*Step 1 (1 mark):* Using part **a**, $a^2 + b^2 = 1$ so $|z| = 1$. Then $z + \\dfrac{1}{z} = z + \\bar{z} = 2a$.
*Step 2 (1 mark):* So $2a = 1 \\Rightarrow a = \\dfrac{1}{2}$.
*Step 3 (1 mark):* $b^2 = 1 - 1/4 = 3/4 \\Rightarrow b = \\pm\\dfrac{\\sqrt 3}{2}$. So $z = \\dfrac{1}{2} \\pm \\dfrac{\\sqrt 3}{2} i$.`),
];

// ─── 3 EXT_RESP (Section B / Exam-2 modelling-rich) ─────────────────────

const extendedResponse: FR[] = [
  sq(`Consider the polynomial $P(z) = z^4 + 4z^3 + 14z^2 + 20z + 25$.

**a.** Verify that $z = -1 + 2i$ is a root of $P(z) = 0$, showing your working. (3 marks)

**b.** Write down a second root of $P(z) = 0$ and explain how you know. (2 marks)

**c.** Hence find a real quadratic factor of $P(z)$. (3 marks)

**d.** Find all remaining complex roots of $P(z) = 0$ in Cartesian form. (4 marks)

${img("product.svg", "Argand diagram showing z = 1 + i, z² = 2i, and z³ = -2 + 2i with rays from origin")}`,
    12, "HARD",
    `**a. (3 marks)**
*Step 1 (1 mark):* $(-1 + 2i)^2 = 1 - 4i + 4i^2 = -3 - 4i$.
*Step 2 (1 mark):* $(-1 + 2i)^3 = (-1 + 2i)(-3 - 4i) = 3 + 4i - 6i + 8 = 11 - 2i$. $(-1 + 2i)^4 = ((-1+2i)^2)^2 = (-3 - 4i)^2 = 9 + 24i + 16i^2 = -7 + 24i$.
*Step 3 (1 mark):* $P(-1 + 2i) = (-7 + 24i) + 4(11 - 2i) + 14(-3 - 4i) + 20(-1 + 2i) + 25 = (-7 + 44 - 42 - 20 + 25) + (24 - 8 - 56 + 40)i = 0 + 0i = 0$. ✓

**b. (2 marks)**
*Step 1 (1 mark):* $P$ has real coefficients, so complex roots come in conjugate pairs.
*Step 2 (1 mark):* So $z = -1 - 2i$ is also a root.

**c. (3 marks)**
*Step 1 (1 mark):* Sum of these two roots: $(-1 + 2i) + (-1 - 2i) = -2$.
*Step 2 (1 mark):* Product: $(-1 + 2i)(-1 - 2i) = 1 + 4 = 5$.
*Step 3 (1 mark):* So a real quadratic factor is $z^2 - (\\text{sum})z + (\\text{prod}) = z^2 + 2z + 5$.

**d. (4 marks)**
*Step 1 (1 mark):* Polynomial divide: $P(z) = (z^2 + 2z + 5)(z^2 + bz + 5)$ for some real $b$, matching the constant term $25 = 5 \\cdot 5$.
*Step 2 (1 mark):* Expand and match the $z^3$ coefficient: $b + 2 = 4 \\Rightarrow b = 2$. So $P(z) = (z^2 + 2z + 5)^2$ — wait, then check $z^2$ coefficient: $5 + 5 + b \\cdot 2 = 10 + 4 = 14$ ✓. And $z^1$ coefficient: $5b + 5 \\cdot 2 = 10 + 10 = 20$ ✓. So $P(z) = (z^2 + 2z + 5)^2$.
*Step 3 (1 mark):* Quadratic formula: $z = \\dfrac{-2 \\pm \\sqrt{4 - 20}}{2} = -1 \\pm 2i$.
*Step 4 (1 mark):* So all roots are $z = -1 + 2i$ (double) and $z = -1 - 2i$ (double).`),

  sq(`Let $z_1 = 2 + i$ and $z_2 = 1 + 3i$.

**a.** Plot $z_1$, $z_2$, and $z_1 + z_2$ on an Argand diagram. (2 marks)

**b.** Show geometrically that the points $0$, $z_1$, $z_1 + z_2$, and $z_2$ form a parallelogram. (3 marks)

**c.** Calculate $|z_1|$, $|z_2|$, and $|z_1 + z_2|$. (3 marks)

**d.** Use the triangle inequality $|z_1 + z_2| \\le |z_1| + |z_2|$ to comment on whether equality is achieved in this case, and explain geometrically why or why not. (3 marks)

${img("sum.svg", "Argand diagram showing z₁ = 2 + i, z₂ = 1 + 3i, and their sum z₁ + z₂ = 3 + 4i with parallelogram completed")}`,
    11, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* Plot $z_1$ at $(2, 1)$ and $z_2$ at $(1, 3)$ on the Argand diagram (Re-axis horizontal, Im-axis vertical).
*Step 2 (1 mark):* $z_1 + z_2 = 3 + 4i$ plots at $(3, 4)$.

**b. (3 marks)**
*Step 1 (1 mark):* Vector from $0$ to $z_1$ is $(2, 1)$, and from $z_2$ to $z_1 + z_2$ is $(3 - 1, 4 - 3) = (2, 1)$.
*Step 2 (1 mark):* Vector from $0$ to $z_2$ is $(1, 3)$, and from $z_1$ to $z_1 + z_2$ is $(3 - 2, 4 - 1) = (1, 3)$.
*Step 3 (1 mark):* Opposite sides are equal and parallel, so the four points form a parallelogram.

**c. (3 marks)**
*Step 1 (1 mark):* $|z_1| = \\sqrt{4 + 1} = \\sqrt 5$.
*Step 2 (1 mark):* $|z_2| = \\sqrt{1 + 9} = \\sqrt{10}$.
*Step 3 (1 mark):* $|z_1 + z_2| = \\sqrt{9 + 16} = 5$.

**d. (3 marks)**
*Step 1 (1 mark):* $|z_1| + |z_2| = \\sqrt 5 + \\sqrt{10} \\approx 2.236 + 3.162 \\approx 5.398 > 5 = |z_1 + z_2|$.
*Step 2 (1 mark):* The inequality is strict, so equality is **not** achieved here.
*Step 3 (1 mark):* Geometrically: equality in the triangle inequality occurs only when $z_1$ and $z_2$ have the same argument (point in the same direction from the origin). Here $z_1, z_2$ are not parallel as vectors, so the parallelogram is non-degenerate and the diagonal is strictly shorter than the sum of the two adjacent sides.`),

  sq(`A particle in the complex plane starts at $z_0 = 1 + 0i$. At each step, its position is multiplied by $w = 1 + i$.

**a.** Calculate $z_1 = w \\, z_0$ and $z_2 = w \\, z_1$ in Cartesian form. (2 marks)

**b.** Express $w$ in polar form $r(\\cos\\theta + i\\sin\\theta)$. (2 marks)

**c.** Hence describe the geometric effect on a complex number of multiplying by $w$ — i.e., the rotation and dilation. (2 marks)

**d.** After $n$ steps, find the position $z_n$ in terms of $n$, justifying via repeated multiplication. (3 marks)

**e.** Find the smallest positive integer $n$ such that $z_n$ is purely imaginary with positive imaginary part. (3 marks)

${img("product.svg", "Argand diagram showing rotation under multiplication by 1+i: z = 1+i, z² = 2i, z³ = -2+2i")}`,
    12, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* $z_1 = (1 + i)(1) = 1 + i$.
*Step 2 (1 mark):* $z_2 = (1 + i)(1 + i) = 1 + 2i + i^2 = 2i$.

**b. (2 marks)**
*Step 1 (1 mark):* $r = |1 + i| = \\sqrt 2$, $\\arg(w) = \\arctan(1/1) = \\pi/4$.
*Step 2 (1 mark):* So $w = \\sqrt 2 (\\cos(\\pi/4) + i \\sin(\\pi/4))$.

**c. (2 marks)**
*Step 1 (1 mark):* Multiplying by $w$ rotates by $\\pi/4$ (45°) anticlockwise.
*Step 2 (1 mark):* And dilates the modulus by factor $\\sqrt 2$.

**d. (3 marks)**
*Step 1 (1 mark):* By induction or iteration, $z_n = w^n z_0 = w^n$ (since $z_0 = 1$).
*Step 2 (1 mark):* In polar form $w^n = (\\sqrt 2)^n (\\cos(n\\pi/4) + i\\sin(n\\pi/4)) = 2^{n/2}(\\cos(n\\pi/4) + i\\sin(n\\pi/4))$.
*Step 3 (1 mark):* So $z_n = 2^{n/2}\\,\\text{cis}(n\\pi/4)$.

**e. (3 marks)**
*Step 1 (1 mark):* Purely imaginary with positive imaginary part means $\\arg(z_n) = \\pi/2$ (i.e. $n\\pi/4 \\equiv \\pi/2 \\pmod{2\\pi}$).
*Step 2 (1 mark):* This gives $n \\equiv 2 \\pmod 8$.
*Step 3 (1 mark):* Smallest positive: $n = 2$. Check: $z_2 = 2i$ ✓ (purely imaginary, positive imaginary part).`),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to ${JSON_PATH}\n` +
    `Wrote ${Object.keys(figures).length} SVG files to ${FIGURES_DIR}/`,
);
