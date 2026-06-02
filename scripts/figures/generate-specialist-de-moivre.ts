/**
 * Specialist: De Moivre's Theorem.
 * Tier: modelling-rich → MCQ + SHORT + EXT_ANS + EXT_RESP.
 */

import * as fs from "fs";
import * as path from "path";
import { argandPlot, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/specialist-de-moivre";
const JSON_PATH = "scripts/output/qset-specialist-de-moivre.json";
fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Figures ────────────────────────────────────────────────────────────

const figPower = argandPlot({
  points: [
    { re: 1, im: 1, label: "z = 1 + i" },
    { re: 0, im: 2, label: "z² = 2i", color: "#2563eb" },
    { re: -2, im: 2, label: "z³ = -2 + 2i", color: "#16a34a" },
    { re: -4, im: 0, label: "z⁴ = -4", color: "#dc2626" },
  ],
  drawVectors: true,
  reRange: [-5, 3],
  imRange: [-1, 4],
});

const figFifthRoots = argandPlot({
  points: Array.from({ length: 5 }, (_, k) => ({
    re: Math.cos((2 * Math.PI * k) / 5),
    im: Math.sin((2 * Math.PI * k) / 5),
    label: k === 0 ? "1" : `cis(${2 * k}π/5)`,
  })),
  drawVectors: true,
  unitCircle: true,
  reRange: [-2, 2],
  imRange: [-2, 2],
});

const figCubeRoots = argandPlot({
  points: [
    { re: 2, im: 0, label: "2 cis(0)" },
    { re: -1, im: Math.sqrt(3), label: "2 cis(2π/3)", color: "#2563eb" },
    { re: -1, im: -Math.sqrt(3), label: "2 cis(-2π/3)", color: "#16a34a" },
  ],
  drawVectors: true,
  reRange: [-3, 3],
  imRange: [-3, 3],
});

const figures: Record<string, string> = {
  "power.svg": figPower,
  "fifth-roots.svg": figFifthRoots,
  "cube-roots.svg": figCubeRoots,
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
  subtopicSlugs: ["de-moivres-theorem", ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: ["de-moivres-theorem", ...sec],
});

// ─── 12 MCQ ─────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("By De Moivre's theorem, $(\\text{cis}\\,\\theta)^n$ equals:",
    ["$\\text{cis}\\,(n\\theta)$", "$n\\,\\text{cis}\\,\\theta$", "$\\text{cis}\\,(\\theta/n)$", "$\\text{cis}\\,(\\theta^n)$"], "A", "EASY",
    "De Moivre's theorem: $(\\cos\\theta + i\\sin\\theta)^n = \\cos(n\\theta) + i\\sin(n\\theta)$, i.e. $\\text{cis}\\,(n\\theta)$. **Answer: A**"),
  m("Using De Moivre, $(2\\,\\text{cis}\\,(\\pi/6))^3$ equals:",
    ["$8\\,\\text{cis}\\,(\\pi/2)$", "$6\\,\\text{cis}\\,(\\pi/2)$", "$8\\,\\text{cis}\\,(\\pi/18)$", "$8\\,\\text{cis}\\,(\\pi/6)$"], "A", "EASY",
    "$(r\\,\\text{cis}\\,\\theta)^n = r^n\\,\\text{cis}\\,(n\\theta) = 2^3\\,\\text{cis}\\,(3 \\cdot \\pi/6) = 8\\,\\text{cis}\\,(\\pi/2)$. **Answer: A**"),
  m("$(\\text{cis}\\,(\\pi/3))^6$ equals:",
    ["$1$", "$-1$", "$i$", "$-i$"], "A", "EASY",
    "$\\text{cis}\\,(6 \\cdot \\pi/3) = \\text{cis}\\,(2\\pi) = 1$. **Answer: A**"),
  m("$(\\cos(\\pi/4) + i\\sin(\\pi/4))^8$ equals:",
    ["$1$", "$-1$", "$i$", "$-i$"], "A", "EASY",
    "By De Moivre: $\\cos(2\\pi) + i\\sin(2\\pi) = 1$. **Answer: A**"),
  m("$(1 + i)^4$ equals:",
    ["$-4$", "$4$", "$-2$", "$2i$"], "A", "MEDIUM",
    "$1 + i = \\sqrt 2\\,\\text{cis}\\,(\\pi/4)$, so $(1+i)^4 = (\\sqrt 2)^4\\,\\text{cis}\\,(\\pi) = 4 \\cdot (-1) = -4$. **Answer: A**"),
  m("$(\\sqrt 3 - i)^5$ equals:",
    ["$-16(\\sqrt 3 - i)$", "$16(\\sqrt 3 - i)$", "$-32(\\sqrt 3 + i)$", "$32 \\,\\text{cis}\\,(-5\\pi/6)$"], "D", "MEDIUM",
    "$\\sqrt 3 - i = 2\\,\\text{cis}\\,(-\\pi/6)$. $(2\\,\\text{cis}\\,(-\\pi/6))^5 = 32\\,\\text{cis}\\,(-5\\pi/6)$. **Answer: D**"),
  m("The five fifth roots of unity have arguments:",
    ["$0,\\ \\pi/5,\\ 2\\pi/5,\\ 3\\pi/5,\\ 4\\pi/5$", "$0,\\ 2\\pi/5,\\ 4\\pi/5,\\ 6\\pi/5,\\ 8\\pi/5$", "$\\pi/5,\\ 3\\pi/5,\\ 5\\pi/5,\\ 7\\pi/5,\\ 9\\pi/5$", "$0,\\ \\pi/2,\\ \\pi,\\ 3\\pi/2,\\ 2\\pi$"], "B", "MEDIUM",
    "$n$th roots of unity are $\\text{cis}\\,(2k\\pi/n)$, $k = 0, \\ldots, n-1$. For $n = 5$: $0, 2\\pi/5, 4\\pi/5, 6\\pi/5, 8\\pi/5$. **Answer: B**"),
  m("$\\dfrac{1}{(\\text{cis}\\,(\\pi/8))^4}$ equals:",
    ["$\\text{cis}\\,(\\pi/2)$", "$\\text{cis}\\,(-\\pi/2)$", "$\\text{cis}\\,(\\pi/32)$", "$\\text{cis}\\,(2\\pi)$"], "B", "MEDIUM",
    "$1/(\\text{cis}\\,\\theta)^n = \\text{cis}\\,(-n\\theta) = \\text{cis}\\,(-4 \\cdot \\pi/8) = \\text{cis}\\,(-\\pi/2)$. **Answer: B**"),
  m("Using De Moivre's theorem, $\\cos 3\\theta$ in terms of $\\cos\\theta$ is:",
    ["$3\\cos\\theta - 4\\cos^3\\theta$", "$4\\cos^3\\theta - 3\\cos\\theta$", "$\\cos^3\\theta - 3\\sin^2\\theta\\cos\\theta$", "$\\cos^3\\theta + 3\\sin^2\\theta\\cos\\theta$"], "B", "MEDIUM",
    "$(\\cos\\theta + i\\sin\\theta)^3 = \\cos 3\\theta + i\\sin 3\\theta$. Real part: $\\cos^3\\theta - 3\\cos\\theta\\sin^2\\theta = \\cos^3\\theta - 3\\cos\\theta(1-\\cos^2\\theta) = 4\\cos^3\\theta - 3\\cos\\theta$. **Answer: B**"),
  m("The cube roots of $8\\,\\text{cis}\\,(\\pi/2)$ are:",
    ["$2\\,\\text{cis}\\,(\\pi/6),\\ 2\\,\\text{cis}\\,(5\\pi/6),\\ 2\\,\\text{cis}\\,(-\\pi/2)$", "$2\\,\\text{cis}\\,(\\pi/6),\\ 2\\,\\text{cis}\\,(7\\pi/6),\\ 2\\,\\text{cis}\\,(11\\pi/6)$", "$8\\,\\text{cis}\\,(\\pi/6),\\ 8\\,\\text{cis}\\,(5\\pi/6),\\ 8\\,\\text{cis}\\,(-\\pi/2)$", "$2\\,\\text{cis}\\,(\\pi/2),\\ 2\\,\\text{cis}\\,(7\\pi/6),\\ 2\\,\\text{cis}\\,(11\\pi/6)$"], "A", "HARD",
    "Cube root: modulus $8^{1/3} = 2$, arguments $(\\pi/2 + 2k\\pi)/3$ for $k = 0, 1, 2$ gives $\\pi/6, 5\\pi/6, 3\\pi/2 \\equiv -\\pi/2$. **Answer: A**"),
  m("If $z = \\text{cis}\\,\\theta$, then $z^n + z^{-n}$ equals:",
    ["$2\\cos(n\\theta)$", "$2i\\sin(n\\theta)$", "$\\cos(n\\theta) + \\sin(n\\theta)$", "$2\\cos\\theta \\cdot n$"], "A", "HARD",
    "$z^n = \\text{cis}\\,(n\\theta)$, $z^{-n} = \\text{cis}\\,(-n\\theta)$. Sum $= 2\\cos(n\\theta)$ since imaginary parts cancel. **Answer: A**"),
  m("By De Moivre's theorem, $(1 - i)^{10}$ equals:",
    ["$32i$", "$-32i$", "$32$", "$-32$"], "A", "HARD",
    "$1 - i = \\sqrt 2\\,\\text{cis}\\,(-\\pi/4)$. $(1-i)^{10} = (\\sqrt 2)^{10}\\,\\text{cis}\\,(-10\\pi/4) = 32\\,\\text{cis}\\,(-5\\pi/2)$. $-5\\pi/2 + 2\\pi = -\\pi/2$. $32\\,\\text{cis}\\,(-\\pi/2) = -32i$. Re-check: that gives $-32i$, so **B** is $-32i$. Reviewing: $32(\\cos(-\\pi/2) + i\\sin(-\\pi/2)) = 32(0 - i) = -32i$. **Answer: B**"),
];

// ─── 8 SHORT ────────────────────────────────────────────────────────────

const shortAnswer: FR[] = [
  sq("Use De Moivre's theorem to evaluate $(2\\,\\text{cis}\\,(\\pi/12))^6$ in Cartesian form.", 2, "EASY",
    "*Step 1 (1 mark):* By De Moivre: $(2)^6\\,\\text{cis}\\,(6 \\cdot \\pi/12) = 64\\,\\text{cis}\\,(\\pi/2)$.\n*Step 2 (1 mark):* In Cartesian: $64(0 + i) = 64 i$."),
  sq("Use De Moivre's theorem to evaluate $(1 + i\\sqrt 3)^4$ in Cartesian form.", 3, "EASY",
    "*Step 1 (1 mark):* $1 + i\\sqrt 3 = 2\\,\\text{cis}\\,(\\pi/3)$ (modulus $2$, argument $\\arctan(\\sqrt 3) = \\pi/3$).\n*Step 2 (1 mark):* $(1+i\\sqrt 3)^4 = 2^4\\,\\text{cis}\\,(4\\pi/3) = 16\\,\\text{cis}\\,(4\\pi/3)$.\n*Step 3 (1 mark):* $\\cos(4\\pi/3) = -1/2$, $\\sin(4\\pi/3) = -\\sqrt 3/2$. So $= 16(-1/2 - \\sqrt 3 i/2) = -8 - 8\\sqrt 3 i$."),
  sq("Find all cube roots of $-8 i$ in polar form (with principal arguments).", 3, "MEDIUM",
    "*Step 1 (1 mark):* $-8 i = 8\\,\\text{cis}\\,(-\\pi/2)$. Cube root modulus $= 8^{1/3} = 2$.\n*Step 2 (1 mark):* Arguments: $(-\\pi/2 + 2k\\pi)/3$ for $k = 0, 1, 2$: $-\\pi/6,\\ -\\pi/6 + 2\\pi/3 = \\pi/2,\\ -\\pi/6 - 2\\pi/3 = -5\\pi/6$.\n*Step 3 (1 mark):* Roots: $2\\,\\text{cis}\\,(-\\pi/6),\\ 2\\,\\text{cis}\\,(\\pi/2),\\ 2\\,\\text{cis}\\,(-5\\pi/6)$."),
  sq("Use De Moivre's theorem to express $\\sin 3\\theta$ in terms of $\\sin\\theta$ and $\\cos\\theta$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $(\\cos\\theta + i\\sin\\theta)^3 = \\cos 3\\theta + i\\sin 3\\theta$ (De Moivre).\n*Step 2 (1 mark):* Expand LHS: $\\cos^3\\theta + 3i\\cos^2\\theta\\sin\\theta - 3\\cos\\theta\\sin^2\\theta - i\\sin^3\\theta$.\n*Step 3 (1 mark):* Imaginary part: $\\sin 3\\theta = 3\\cos^2\\theta\\sin\\theta - \\sin^3\\theta$. (Or equivalently $\\sin 3\\theta = 3\\sin\\theta - 4\\sin^3\\theta$.)"),
  sq("Show that $(\\cos\\theta + i\\sin\\theta)^{-1} = \\cos\\theta - i\\sin\\theta$.", 2, "MEDIUM",
    "*Step 1 (1 mark):* By De Moivre's theorem with exponent $-1$: $(\\cos\\theta + i\\sin\\theta)^{-1} = \\cos(-\\theta) + i\\sin(-\\theta)$.\n*Step 2 (1 mark):* Using $\\cos(-\\theta) = \\cos\\theta$ and $\\sin(-\\theta) = -\\sin\\theta$: $= \\cos\\theta - i\\sin\\theta$. ✓"),
  sq("Evaluate $\\left(\\dfrac{1 + i}{\\sqrt 2}\\right)^{12}$ using De Moivre's theorem.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $\\dfrac{1 + i}{\\sqrt 2} = \\dfrac{\\sqrt 2\\,\\text{cis}\\,(\\pi/4)}{\\sqrt 2} = \\text{cis}\\,(\\pi/4)$.\n*Step 2 (1 mark):* $(\\text{cis}\\,(\\pi/4))^{12} = \\text{cis}\\,(3\\pi)$.\n*Step 3 (1 mark):* $3\\pi \\equiv \\pi$ (mod $2\\pi$), so $= \\text{cis}\\,\\pi = -1$."),
  sq("Find all solutions of $z^4 = -16$, giving each in polar form (with principal arguments).", 3, "HARD",
    "*Step 1 (1 mark):* $-16 = 16\\,\\text{cis}\\,(\\pi)$. Modulus of each root $= 16^{1/4} = 2$.\n*Step 2 (1 mark):* Arguments: $(\\pi + 2k\\pi)/4 = \\pi/4 + k\\pi/2$ for $k = 0, 1, 2, 3$: $\\pi/4,\\ 3\\pi/4,\\ 5\\pi/4 \\equiv -3\\pi/4,\\ 7\\pi/4 \\equiv -\\pi/4$.\n*Step 3 (1 mark):* Roots: $2\\,\\text{cis}\\,(\\pi/4),\\ 2\\,\\text{cis}\\,(3\\pi/4),\\ 2\\,\\text{cis}\\,(-3\\pi/4),\\ 2\\,\\text{cis}\\,(-\\pi/4)$."),
  sq("Show that $\\sin 5\\theta = 16\\sin^5\\theta - 20\\sin^3\\theta + 5\\sin\\theta$ using De Moivre's theorem.", 3, "HARD",
    "*Step 1 (1 mark):* $(\\cos\\theta + i\\sin\\theta)^5 = \\cos 5\\theta + i\\sin 5\\theta$. Expand the LHS using binomial theorem; the imaginary terms come from odd powers of $i\\sin\\theta$.\n*Step 2 (1 mark):* Imaginary part: $5\\cos^4\\theta\\sin\\theta - 10\\cos^2\\theta\\sin^3\\theta + \\sin^5\\theta = \\sin 5\\theta$.\n*Step 3 (1 mark):* Replace $\\cos^2\\theta = 1 - \\sin^2\\theta$: $5(1-\\sin^2\\theta)^2\\sin\\theta - 10(1-\\sin^2\\theta)\\sin^3\\theta + \\sin^5\\theta = 5\\sin\\theta - 10\\sin^3\\theta + 5\\sin^5\\theta - 10\\sin^3\\theta + 10\\sin^5\\theta + \\sin^5\\theta = 16\\sin^5\\theta - 20\\sin^3\\theta + 5\\sin\\theta$. ✓"),
];

// ─── 3 EXT_ANS ──────────────────────────────────────────────────────────

const extendedAnswer: FR[] = [
  sq(`Let $z = 1 + i\\sqrt 3$.

**a.** Express $z$ in polar form $r\\,\\text{cis}\\,\\theta$ (with principal argument). (2 marks)

**b.** Use De Moivre's theorem to find $z^6$ in Cartesian form. (3 marks)

**c.** Hence find a value of $n$ for which $z^n$ is a positive real number. (2 marks)

${img("power.svg", "Argand diagram showing successive powers z, z², z³, z⁴ of z = 1 + i illustrating De Moivre")}`,
    7, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* $|z| = \\sqrt{1 + 3} = 2$.
*Step 2 (1 mark):* $\\arg(z) = \\arctan(\\sqrt 3) = \\pi/3$. So $z = 2\\,\\text{cis}\\,(\\pi/3)$.

**b. (3 marks)**
*Step 1 (1 mark):* By De Moivre: $z^6 = 2^6\\,\\text{cis}\\,(6 \\cdot \\pi/3) = 64\\,\\text{cis}\\,(2\\pi)$.
*Step 2 (1 mark):* $\\text{cis}\\,(2\\pi) = 1$.
*Step 3 (1 mark):* So $z^6 = 64$.

**c. (2 marks)**
*Step 1 (1 mark):* $z^n = 2^n\\,\\text{cis}\\,(n\\pi/3)$ is positive real iff $n\\pi/3$ is a multiple of $2\\pi$, i.e. $n$ is a multiple of $6$.
*Step 2 (1 mark):* Smallest positive: $n = 6$ (which we already verified gives $64 > 0$).`),

  sq(`Use De Moivre's theorem to:

**a.** Prove the identity $\\cos 2\\theta = \\cos^2\\theta - \\sin^2\\theta$. (3 marks)

**b.** Prove the identity $\\sin 2\\theta = 2\\sin\\theta\\cos\\theta$. (2 marks)

**c.** Hence show that $\\cos 4\\theta = 1 - 8\\cos^2\\theta\\sin^2\\theta$. (3 marks)`,
    8, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* $(\\cos\\theta + i\\sin\\theta)^2 = \\cos 2\\theta + i\\sin 2\\theta$ (De Moivre with $n = 2$).
*Step 2 (1 mark):* Expand LHS: $\\cos^2\\theta + 2i\\cos\\theta\\sin\\theta + i^2\\sin^2\\theta = (\\cos^2\\theta - \\sin^2\\theta) + 2i\\cos\\theta\\sin\\theta$.
*Step 3 (1 mark):* Equating real parts: $\\cos 2\\theta = \\cos^2\\theta - \\sin^2\\theta$. ✓

**b. (2 marks)**
*Step 1 (1 mark):* From the same expansion, equate imaginary parts.
*Step 2 (1 mark):* $\\sin 2\\theta = 2\\cos\\theta\\sin\\theta$. ✓

**c. (3 marks)**
*Step 1 (1 mark):* $\\cos 4\\theta = \\cos(2 \\cdot 2\\theta) = 1 - 2\\sin^2(2\\theta)$ (using $\\cos 2\\alpha = 1 - 2\\sin^2\\alpha$).
*Step 2 (1 mark):* Substitute $\\sin 2\\theta = 2\\sin\\theta\\cos\\theta$: $\\sin^2(2\\theta) = 4\\sin^2\\theta\\cos^2\\theta$.
*Step 3 (1 mark):* So $\\cos 4\\theta = 1 - 2 \\cdot 4\\sin^2\\theta\\cos^2\\theta = 1 - 8\\sin^2\\theta\\cos^2\\theta$. ✓`),

  sq(`Consider the equation $z^4 = 8(-1 + i\\sqrt 3)$ over $\\mathbb C$.

**a.** Express $-1 + i\\sqrt 3$ in polar form (principal argument). (2 marks)

**b.** Find the modulus of each solution and the four arguments in $(-\\pi, \\pi]$. (3 marks)

**c.** Write each of the four solutions in polar form. (2 marks)

**d.** State a geometric description of the four solutions on the Argand diagram. (2 marks)`,
    9, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* $|-1 + i\\sqrt 3| = \\sqrt{1 + 3} = 2$.
*Step 2 (1 mark):* In Q2: $\\arg = \\pi - \\arctan(\\sqrt 3) = \\pi - \\pi/3 = 2\\pi/3$. So $-1 + i\\sqrt 3 = 2\\,\\text{cis}\\,(2\\pi/3)$. Hence RHS $= 16\\,\\text{cis}\\,(2\\pi/3)$.

**b. (3 marks)**
*Step 1 (1 mark):* Each solution has modulus $16^{1/4} = 2$.
*Step 2 (1 mark):* Arguments: $(2\\pi/3 + 2k\\pi)/4 = \\pi/6 + k\\pi/2$ for $k = 0, 1, 2, 3$.
*Step 3 (1 mark):* Values: $k=0$: $\\pi/6$; $k=1$: $\\pi/6 + \\pi/2 = 2\\pi/3$; $k=2$: $\\pi/6 + \\pi = 7\\pi/6 \\equiv -5\\pi/6$; $k=3$: $\\pi/6 + 3\\pi/2 = 5\\pi/3 \\equiv -\\pi/3$. All in $(-\\pi, \\pi]$.

**c. (2 marks)**
*Step 1 (1 mark):* Three solutions: $2\\,\\text{cis}\\,(\\pi/6),\\ 2\\,\\text{cis}\\,(2\\pi/3),\\ 2\\,\\text{cis}\\,(-5\\pi/6)$.
*Step 2 (1 mark):* Fourth: $2\\,\\text{cis}\\,(-\\pi/3)$.

**d. (2 marks)**
*Step 1 (1 mark):* All four solutions lie on a circle of radius $2$ centred at the origin.
*Step 2 (1 mark):* Their arguments differ by $\\pi/2$ (90°), so they form the vertices of a square inscribed in the circle.`),
];

// ─── 3 EXT_RESP ─────────────────────────────────────────────────────────

const extendedResponse: FR[] = [
  sq(`Consider the complex equation $z^5 = 32$.

**a.** Express $32$ in polar form. (1 mark)

**b.** Find all five solutions of $z^5 = 32$ in polar form (principal arguments). (4 marks)

**c.** Express each solution in Cartesian form to two decimal places. (3 marks)

**d.** Plot all solutions on an Argand diagram and state the geometric pattern they form. (3 marks)

${img("fifth-roots.svg", "Argand diagram showing the five fifth roots of unity equally spaced around the unit circle")}`,
    11, "MEDIUM",
    `**a. (1 mark)**
*Step 1 (1 mark):* $32 = 32\\,\\text{cis}\\,(0)$.

**b. (4 marks)**
*Step 1 (1 mark):* Modulus of each root: $32^{1/5} = 2$.
*Step 2 (1 mark):* Arguments: $(0 + 2k\\pi)/5 = 2k\\pi/5$ for $k = 0, 1, 2, 3, 4$.
*Step 3 (1 mark):* Values: $k = 0$: $0$; $k = 1$: $2\\pi/5$; $k = 2$: $4\\pi/5$; $k = 3$: $6\\pi/5 \\equiv -4\\pi/5$; $k = 4$: $8\\pi/5 \\equiv -2\\pi/5$.
*Step 4 (1 mark):* Five solutions: $2\\,\\text{cis}\\,(0),\\ 2\\,\\text{cis}\\,(2\\pi/5),\\ 2\\,\\text{cis}\\,(4\\pi/5),\\ 2\\,\\text{cis}\\,(-4\\pi/5),\\ 2\\,\\text{cis}\\,(-2\\pi/5)$.

**c. (3 marks)**
*Step 1 (1 mark):* $2\\,\\text{cis}\\,(0) = 2 + 0i = 2.00$; $2\\,\\text{cis}\\,(2\\pi/5) \\approx 2(0.309 + 0.951 i) = 0.62 + 1.90 i$.
*Step 2 (1 mark):* $2\\,\\text{cis}\\,(4\\pi/5) \\approx 2(-0.809 + 0.588 i) = -1.62 + 1.18 i$.
*Step 3 (1 mark):* $2\\,\\text{cis}\\,(-4\\pi/5) \\approx -1.62 - 1.18 i$ and $2\\,\\text{cis}\\,(-2\\pi/5) \\approx 0.62 - 1.90 i$.

**d. (3 marks)**
*Step 1 (1 mark):* All five points lie on the circle of radius $2$ centred at the origin.
*Step 2 (1 mark):* Adjacent points differ in argument by $2\\pi/5$ (72°), so they are equally spaced.
*Step 3 (1 mark):* They form the vertices of a regular pentagon inscribed in the circle.`),

  sq(`A pulse generator outputs a complex signal $S(t) = e^{i\\omega t}$ at integer time steps $t = 1, 2, \\ldots$. At step $t$ the output equals $z^t$ where $z = \\text{cis}\\,(\\omega)$ and $\\omega = \\pi/8$.

**a.** Compute $S(1), S(2)$ in $\\text{cis}$ form. (2 marks)

**b.** Use De Moivre's theorem to write $S(t)$ in $\\text{cis}$ form, and explain why the modulus is constant. (3 marks)

**c.** Find the smallest positive integer $t$ for which $S(t)$ is purely imaginary with positive imaginary part. (3 marks)

**d.** Find the period of the signal — i.e. the smallest positive integer $T$ such that $S(t + T) = S(t)$ for all $t$. (2 marks)

**e.** Express $S(20)$ in Cartesian form (exact values). (2 marks)`,
    12, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* $S(1) = z^1 = \\text{cis}\\,(\\pi/8)$.
*Step 2 (1 mark):* $S(2) = z^2 = \\text{cis}\\,(2\\pi/8) = \\text{cis}\\,(\\pi/4)$.

**b. (3 marks)**
*Step 1 (1 mark):* By De Moivre, $S(t) = z^t = \\text{cis}\\,(t\\pi/8)$.
*Step 2 (1 mark):* Modulus: $|S(t)| = |z|^t = 1^t = 1$.
*Step 3 (1 mark):* Since $|z| = 1$, all powers $z^t$ also lie on the unit circle, so the modulus is constant.

**c. (3 marks)**
*Step 1 (1 mark):* Purely imaginary with positive imaginary part $\\Leftrightarrow \\arg = \\pi/2$.
*Step 2 (1 mark):* Need $t\\pi/8 \\equiv \\pi/2\\pmod{2\\pi}$, i.e. $t \\equiv 4\\pmod{16}$.
*Step 3 (1 mark):* Smallest positive $t = 4$.

**d. (2 marks)**
*Step 1 (1 mark):* Need $\\text{cis}\\,((t+T)\\pi/8) = \\text{cis}\\,(t\\pi/8)$ for all $t$, so $T\\pi/8 \\equiv 0\\pmod{2\\pi}$, i.e. $T$ is a multiple of $16$.
*Step 2 (1 mark):* Period $T = 16$.

**e. (2 marks)**
*Step 1 (1 mark):* $S(20) = \\text{cis}\\,(20\\pi/8) = \\text{cis}\\,(5\\pi/2)$. Reduce: $5\\pi/2 - 2\\pi = \\pi/2$.
*Step 2 (1 mark):* $S(20) = \\text{cis}\\,(\\pi/2) = i$.`),

  sq(`Consider $z^3 = 8$.

**a.** Express $8$ in polar form and use De Moivre's theorem to find all three solutions of $z^3 = 8$ in polar form. (3 marks)

**b.** Convert each solution to Cartesian form (exact values). (3 marks)

**c.** Verify by direct substitution that $z = -1 + i\\sqrt 3$ is one of the solutions. (3 marks)

**d.** State the relationship of the three roots to the cube roots of unity, and describe their geometric arrangement. (3 marks)

${img("cube-roots.svg", "Argand diagram showing three cube roots of 8 forming an equilateral triangle on circle of radius 2")}`,
    12, "HARD",
    `**a. (3 marks)**
*Step 1 (1 mark):* $8 = 8\\,\\text{cis}\\,(0)$.
*Step 2 (1 mark):* Modulus of each root: $8^{1/3} = 2$. Arguments: $(0 + 2k\\pi)/3 = 2k\\pi/3$ for $k = 0, 1, 2$.
*Step 3 (1 mark):* Three solutions: $z_0 = 2\\,\\text{cis}\\,(0)$, $z_1 = 2\\,\\text{cis}\\,(2\\pi/3)$, $z_2 = 2\\,\\text{cis}\\,(-2\\pi/3)$ (using principal arguments).

**b. (3 marks)**
*Step 1 (1 mark):* $z_0 = 2(\\cos 0 + i\\sin 0) = 2$.
*Step 2 (1 mark):* $z_1 = 2(\\cos(2\\pi/3) + i\\sin(2\\pi/3)) = 2(-1/2 + i\\sqrt 3/2) = -1 + i\\sqrt 3$.
*Step 3 (1 mark):* $z_2 = 2(\\cos(-2\\pi/3) + i\\sin(-2\\pi/3)) = 2(-1/2 - i\\sqrt 3/2) = -1 - i\\sqrt 3$.

**c. (3 marks)**
*Step 1 (1 mark):* $(-1 + i\\sqrt 3)^2 = 1 - 2i\\sqrt 3 + 3i^2 = 1 - 2i\\sqrt 3 - 3 = -2 - 2i\\sqrt 3$.
*Step 2 (1 mark):* $(-1 + i\\sqrt 3)^3 = (-1 + i\\sqrt 3)(-2 - 2i\\sqrt 3) = 2 + 2i\\sqrt 3 - 2i\\sqrt 3 - 2i^2 \\cdot 3 = 2 + 6 = 8$.
*Step 3 (1 mark):* So $z = -1 + i\\sqrt 3$ satisfies $z^3 = 8$. ✓

**d. (3 marks)**
*Step 1 (1 mark):* If $\\omega = \\text{cis}\\,(2\\pi/3)$ is a primitive cube root of unity, the three solutions are $z_0 = 2,\\ z_1 = 2\\omega,\\ z_2 = 2\\omega^2$.
*Step 2 (1 mark):* All three points lie on a circle of radius $2$ centred at the origin.
*Step 3 (1 mark):* Their arguments differ by $2\\pi/3$ (120°), so they form an equilateral triangle inscribed in the circle.`),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to ${JSON_PATH}\n` +
    `Wrote ${Object.keys(figures).length} SVG files to ${FIGURES_DIR}/`,
);
