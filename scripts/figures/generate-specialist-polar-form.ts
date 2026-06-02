/**
 * Specialist: Complex Numbers (Polar Form).
 * Tier: modelling-rich → MCQ + SHORT + EXT_ANS + EXT_RESP.
 */

import * as fs from "fs";
import * as path from "path";
import { argandPlot, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/specialist-polar-form";
const JSON_PATH = "scripts/output/qset-specialist-polar-form.json";
fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Figures ────────────────────────────────────────────────────────────

const figPolar1 = argandPlot({
  points: [
    { re: 1, im: Math.sqrt(3), label: "z = 2 cis(π/3)" },
  ],
  drawVectors: true,
  rays: [{ argRad: Math.PI / 3, label: "arg(z) = π/3" }],
  reRange: [-1, 3],
  imRange: [-1, 3],
});

const figPolarMult = argandPlot({
  points: [
    { re: Math.sqrt(2), im: Math.sqrt(2), label: "z₁ = 2 cis(π/4)" },
    { re: 0, im: 2, label: "z₂ = 2 cis(π/2)", color: "#2563eb" },
    { re: -2 * Math.sqrt(2), im: 2 * Math.sqrt(2), label: "z₁z₂ = 4 cis(3π/4)", color: "#16a34a" },
  ],
  drawVectors: true,
  reRange: [-4, 3],
  imRange: [-1, 4],
});

const figModulus = argandPlot({
  points: [
    { re: 3, im: 4, label: "z = 3 + 4i, |z| = 5" },
  ],
  drawVectors: true,
  rays: [{ argRad: Math.atan2(4, 3), label: "θ = arg(z)" }],
  reRange: [-1, 5],
  imRange: [-1, 5],
});

const figures: Record<string, string> = {
  "polar1.svg": figPolar1,
  "polar-mult.svg": figPolarMult,
  "modulus.svg": figModulus,
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
  subtopicSlugs: ["complex-numbers-polar-form", ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: ["complex-numbers-polar-form", ...sec],
});

// ─── 12 MCQ ─────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("The polar form of $z = 1 + i$ is:",
    ["$\\sqrt 2 \\,\\text{cis}\\,(\\pi/4)$", "$2 \\,\\text{cis}\\,(\\pi/4)$", "$\\sqrt 2 \\,\\text{cis}\\,(\\pi/2)$", "$\\sqrt 2 \\,\\text{cis}\\,(\\pi/3)$"], "A", "EASY",
    "$|z| = \\sqrt{1 + 1} = \\sqrt 2$ and $\\arg(z) = \\arctan(1/1) = \\pi/4$. So $z = \\sqrt 2 \\,\\text{cis}\\,(\\pi/4)$. **Answer: A**"),
  m("Express $z = 2\\,\\text{cis}\\,(\\pi/2)$ in Cartesian form.",
    ["$2$", "$2i$", "$-2i$", "$\\sqrt 2 + \\sqrt 2 i$"], "B", "EASY",
    "$\\cos(\\pi/2) = 0$, $\\sin(\\pi/2) = 1$. So $z = 2(0 + i) = 2i$. **Answer: B**"),
  m("If $z = \\sqrt 3 - i$, then $|z|$ equals:",
    ["$2$", "$\\sqrt 2$", "$4$", "$\\sqrt 3 + 1$"], "A", "EASY",
    "$|z| = \\sqrt{3 + 1} = \\sqrt 4 = 2$. **Answer: A**"),
  m("The principal argument of $z = -1 + i$ is:",
    ["$\\pi/4$", "$3\\pi/4$", "$-\\pi/4$", "$-3\\pi/4$"], "B", "EASY",
    "$z$ is in the second quadrant. $\\arctan(1/(-1)) = -\\pi/4$ but adding $\\pi$: $\\arg(z) = \\pi - \\pi/4 = 3\\pi/4$. **Answer: B**"),
  m("Express $4\\,\\text{cis}\\,(\\pi/3)$ in Cartesian form.",
    ["$2 + 2\\sqrt 3 i$", "$2\\sqrt 3 + 2i$", "$4 + 4i$", "$2 - 2\\sqrt 3 i$"], "A", "MEDIUM",
    "$\\cos(\\pi/3) = 1/2$, $\\sin(\\pi/3) = \\sqrt 3/2$. So $4(1/2 + i\\sqrt 3/2) = 2 + 2\\sqrt 3 i$. **Answer: A**"),
  m("If $z_1 = 2\\,\\text{cis}\\,(\\pi/6)$ and $z_2 = 3\\,\\text{cis}\\,(\\pi/4)$, then $z_1 z_2$ equals:",
    ["$6\\,\\text{cis}\\,(\\pi/24)$", "$6\\,\\text{cis}\\,(5\\pi/12)$", "$5\\,\\text{cis}\\,(5\\pi/12)$", "$6\\,\\text{cis}\\,(\\pi/2)$"], "B", "MEDIUM",
    "Multiplying in polar: multiply moduli, add arguments. $|z_1 z_2| = 2 \\cdot 3 = 6$, $\\arg = \\pi/6 + \\pi/4 = 2\\pi/12 + 3\\pi/12 = 5\\pi/12$. **Answer: B**"),
  m("If $z_1 = 8\\,\\text{cis}\\,(2\\pi/3)$ and $z_2 = 2\\,\\text{cis}\\,(\\pi/6)$, then $z_1/z_2$ equals:",
    ["$4\\,\\text{cis}\\,(\\pi/3)$", "$4\\,\\text{cis}\\,(\\pi/2)$", "$6\\,\\text{cis}\\,(\\pi/2)$", "$16\\,\\text{cis}\\,(5\\pi/6)$"], "B", "MEDIUM",
    "Dividing in polar: divide moduli, subtract arguments. $|z_1/z_2| = 8/2 = 4$, $\\arg = 2\\pi/3 - \\pi/6 = 4\\pi/6 - \\pi/6 = 3\\pi/6 = \\pi/2$. **Answer: B**"),
  m("If $z = 2\\,\\text{cis}\\,(\\pi/3)$, then $\\bar z$ in polar form is:",
    ["$2\\,\\text{cis}\\,(\\pi/3)$", "$2\\,\\text{cis}\\,(-\\pi/3)$", "$-2\\,\\text{cis}\\,(\\pi/3)$", "$1/2\\,\\text{cis}\\,(\\pi/3)$"], "B", "MEDIUM",
    "Conjugate reflects across the real axis: same modulus, negated argument. $\\bar z = 2\\,\\text{cis}\\,(-\\pi/3)$. **Answer: B**"),
  m("The polar form of $z = -\\sqrt 3 - i$ (principal argument) is:",
    ["$2\\,\\text{cis}\\,(-5\\pi/6)$", "$2\\,\\text{cis}\\,(5\\pi/6)$", "$2\\,\\text{cis}\\,(7\\pi/6)$", "$\\sqrt 2 \\,\\text{cis}\\,(-5\\pi/6)$"], "A", "MEDIUM",
    "$|z| = \\sqrt{3 + 1} = 2$. $z$ is in third quadrant. $\\tan\\theta = -1 / -\\sqrt 3 = 1/\\sqrt 3$ gives reference $\\pi/6$, third quadrant gives principal arg $-\\pi + \\pi/6 = -5\\pi/6$. **Answer: A**"),
  m("If $z = r\\,\\text{cis}\\,\\theta$ with $r > 0$, then $1/z$ equals:",
    ["$r\\,\\text{cis}\\,(-\\theta)$", "$(1/r)\\,\\text{cis}\\,(\\theta)$", "$(1/r)\\,\\text{cis}\\,(-\\theta)$", "$r\\,\\text{cis}\\,(\\theta + \\pi)$"], "C", "MEDIUM",
    "$1/z = \\bar z/|z|^2 = (1/r)\\,\\text{cis}\\,(-\\theta)$. **Answer: C**"),
  m("The complex number $z = 4(\\cos 150° + i\\sin 150°)$ in Cartesian form is:",
    ["$-2\\sqrt 3 + 2i$", "$2\\sqrt 3 - 2i$", "$-2 + 2\\sqrt 3 i$", "$2 - 2\\sqrt 3 i$"], "A", "HARD",
    "$\\cos 150° = -\\sqrt 3/2$, $\\sin 150° = 1/2$. So $z = 4(-\\sqrt 3/2 + i/2) = -2\\sqrt 3 + 2i$. **Answer: A**"),
  m("If $z = 2\\,\\text{cis}\\,(\\pi/5)$ and $w$ is a complex number such that $zw = 6\\,\\text{cis}\\,(3\\pi/10)$, then $w$ equals:",
    ["$3\\,\\text{cis}\\,(\\pi/10)$", "$3\\,\\text{cis}\\,(\\pi/2)$", "$12\\,\\text{cis}\\,(\\pi/10)$", "$3\\,\\text{cis}\\,(-\\pi/10)$"], "A", "HARD",
    "$w = (zw)/z = (6/2)\\,\\text{cis}\\,(3\\pi/10 - \\pi/5) = 3\\,\\text{cis}\\,(3\\pi/10 - 2\\pi/10) = 3\\,\\text{cis}\\,(\\pi/10)$. **Answer: A**"),
];

// ─── 8 SHORT ────────────────────────────────────────────────────────────

const shortAnswer: FR[] = [
  sq("Express $z = -1 + \\sqrt 3 i$ in the polar form $r\\,\\text{cis}\\,\\theta$, with $-\\pi < \\theta \\le \\pi$.", 2, "EASY",
    "*Step 1 (1 mark):* $|z| = \\sqrt{1 + 3} = 2$.\n*Step 2 (1 mark):* In Q2: reference angle $\\arctan(\\sqrt 3/1) = \\pi/3$, principal $\\arg(z) = \\pi - \\pi/3 = 2\\pi/3$. So $z = 2\\,\\text{cis}\\,(2\\pi/3)$."),
  sq("Express $z = 5\\,\\text{cis}\\,(\\pi/4)$ in Cartesian form, exact values.", 2, "EASY",
    "*Step 1 (1 mark):* $\\cos(\\pi/4) = \\sin(\\pi/4) = \\sqrt 2/2$.\n*Step 2 (1 mark):* $z = 5(\\sqrt 2/2 + \\sqrt 2/2 i) = \\dfrac{5\\sqrt 2}{2} + \\dfrac{5\\sqrt 2}{2} i$."),
  sq("If $z_1 = 4\\,\\text{cis}\\,(\\pi/3)$ and $z_2 = 2\\,\\text{cis}\\,(\\pi/12)$, find $z_1 z_2$ and $z_1/z_2$ in polar form.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $z_1 z_2 = (4 \\cdot 2)\\,\\text{cis}\\,(\\pi/3 + \\pi/12) = 8\\,\\text{cis}\\,(4\\pi/12 + \\pi/12) = 8\\,\\text{cis}\\,(5\\pi/12)$.\n*Step 2 (1 mark):* $z_1/z_2 = (4/2)\\,\\text{cis}\\,(\\pi/3 - \\pi/12) = 2\\,\\text{cis}\\,(4\\pi/12 - \\pi/12)$.\n*Step 3 (1 mark):* $= 2\\,\\text{cis}\\,(3\\pi/12) = 2\\,\\text{cis}\\,(\\pi/4)$."),
  sq("Find the modulus and principal argument of $z = -3 - 3i$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $|z| = \\sqrt{9 + 9} = 3\\sqrt 2$.\n*Step 2 (1 mark):* $z$ in Q3, reference angle $\\arctan(3/3) = \\pi/4$.\n*Step 3 (1 mark):* Principal argument: $\\arg(z) = -\\pi + \\pi/4 = -3\\pi/4$."),
  sq("Express $\\dfrac{1 + i}{1 - i}$ in polar form.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $1 + i = \\sqrt 2\\,\\text{cis}\\,(\\pi/4)$ and $1 - i = \\sqrt 2\\,\\text{cis}\\,(-\\pi/4)$.\n*Step 2 (1 mark):* Quotient: $\\dfrac{\\sqrt 2}{\\sqrt 2}\\,\\text{cis}\\,(\\pi/4 - (-\\pi/4)) = 1 \\cdot \\text{cis}\\,(\\pi/2)$.\n*Step 3 (1 mark):* So the result is $\\text{cis}\\,(\\pi/2) = i$."),
  sq("Express $z = -2\\sqrt 3 + 2i$ in polar form with principal argument.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $|z| = \\sqrt{12 + 4} = 4$.\n*Step 2 (1 mark):* In Q2: reference angle $\\arctan(2/(2\\sqrt 3)) = \\arctan(1/\\sqrt 3) = \\pi/6$.\n*Step 3 (1 mark):* Principal argument $= \\pi - \\pi/6 = 5\\pi/6$. So $z = 4\\,\\text{cis}\\,(5\\pi/6)$."),
  sq("Show that if $z = r\\,\\text{cis}\\,\\theta$ then $z\\bar z = r^2$.", 2, "MEDIUM",
    "*Step 1 (1 mark):* $\\bar z = r\\,\\text{cis}\\,(-\\theta)$ (conjugate negates argument).\n*Step 2 (1 mark):* $z\\bar z = r \\cdot r \\,\\text{cis}\\,(\\theta + (-\\theta)) = r^2\\,\\text{cis}\\,(0) = r^2$."),
  sq("Given $z = 2\\,\\text{cis}\\,(5\\pi/6)$, evaluate $z^2$ in polar form (with principal argument).", 3, "HARD",
    "*Step 1 (1 mark):* $z^2 = 2^2\\,\\text{cis}\\,(2 \\cdot 5\\pi/6) = 4\\,\\text{cis}\\,(5\\pi/3)$.\n*Step 2 (1 mark):* $5\\pi/3$ is outside $(-\\pi, \\pi]$. Subtract $2\\pi$: $5\\pi/3 - 2\\pi = -\\pi/3$.\n*Step 3 (1 mark):* So $z^2 = 4\\,\\text{cis}\\,(-\\pi/3)$."),
];

// ─── 3 EXT_ANS ──────────────────────────────────────────────────────────

const extendedAnswer: FR[] = [
  sq(`Let $z = -1 + i$.

**a.** Express $z$ in polar form $r\\,\\text{cis}\\,\\theta$ with principal argument. (2 marks)

**b.** Hence express $z^4$ in Cartesian form. (3 marks)

**c.** Find the smallest positive integer $n$ for which $z^n$ is real. (2 marks)

${img("polar1.svg", "Argand diagram showing z = 2 cis(π/3) with vector and reference ray")}`,
    7, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* $|z| = \\sqrt{1 + 1} = \\sqrt 2$.
*Step 2 (1 mark):* $z$ in Q2: $\\arg(z) = \\pi - \\pi/4 = 3\\pi/4$. So $z = \\sqrt 2\\,\\text{cis}\\,(3\\pi/4)$.

**b. (3 marks)**
*Step 1 (1 mark):* $z^4 = (\\sqrt 2)^4\\,\\text{cis}\\,(4 \\cdot 3\\pi/4) = 4\\,\\text{cis}\\,(3\\pi)$.
*Step 2 (1 mark):* $3\\pi \\equiv \\pi\\pmod{2\\pi}$, so $z^4 = 4\\,\\text{cis}\\,\\pi$.
*Step 3 (1 mark):* In Cartesian: $z^4 = 4(\\cos\\pi + i\\sin\\pi) = -4$.

**c. (2 marks)**
*Step 1 (1 mark):* $z^n = (\\sqrt 2)^n\\,\\text{cis}\\,(3n\\pi/4)$ is real when $3n\\pi/4$ is a multiple of $\\pi$, i.e. $3n/4 \\in \\mathbb Z$.
*Step 2 (1 mark):* Smallest positive integer $n$ with $3n$ divisible by $4$: $n = 4$.`),

  sq(`Let $w = \\text{cis}\\,(\\pi/6)$ and $z = 2\\,\\text{cis}\\,(\\pi/4)$.

**a.** Find $wz$ in polar form. (2 marks)

**b.** Find $\\bar z / w$ in polar form with principal argument. (3 marks)

**c.** Find a value of $n \\in \\mathbb Z^+$ such that $w^n = 1$. (2 marks)`,
    7, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* $|wz| = 1 \\cdot 2 = 2$, $\\arg = \\pi/6 + \\pi/4 = 2\\pi/12 + 3\\pi/12 = 5\\pi/12$.
*Step 2 (1 mark):* So $wz = 2\\,\\text{cis}\\,(5\\pi/12)$.

**b. (3 marks)**
*Step 1 (1 mark):* $\\bar z = 2\\,\\text{cis}\\,(-\\pi/4)$.
*Step 2 (1 mark):* $\\bar z/w = (2/1)\\,\\text{cis}\\,(-\\pi/4 - \\pi/6) = 2\\,\\text{cis}\\,(-3\\pi/12 - 2\\pi/12) = 2\\,\\text{cis}\\,(-5\\pi/12)$.
*Step 3 (1 mark):* $-5\\pi/12 \\in (-\\pi, \\pi]$, so principal form $= 2\\,\\text{cis}\\,(-5\\pi/12)$.

**c. (2 marks)**
*Step 1 (1 mark):* $w^n = \\text{cis}\\,(n\\pi/6)$, equals $1$ when $n\\pi/6$ is a multiple of $2\\pi$.
*Step 2 (1 mark):* So $n/6 \\in 2\\mathbb Z$, smallest positive $n = 12$.`),

  sq(`Let $z = r\\,\\text{cis}\\,\\theta$ with $r > 0$, $-\\pi < \\theta \\le \\pi$.

**a.** Write $-z$ in polar form (giving the principal argument). (2 marks)

**b.** Show that $|z + \\bar z| = 2r|\\cos\\theta|$. (3 marks)

**c.** If $\\arg(z) = \\pi/3$ and $|z + \\bar z| = 4$, find $z$. (3 marks)`,
    8, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* $-z = -r\\,\\text{cis}\\,\\theta = r\\,\\text{cis}\\,(\\theta + \\pi)$ (since multiplying by $-1 = \\text{cis}\\,\\pi$).
*Step 2 (1 mark):* If $\\theta \\le 0$ then $\\theta + \\pi \\in (-\\pi, \\pi]$ ✓; if $\\theta > 0$ then $\\theta + \\pi > \\pi$, so subtract $2\\pi$ giving $\\theta - \\pi$. Principal arg is $\\theta + \\pi$ if $\\theta \\le 0$ else $\\theta - \\pi$.

**b. (3 marks)**
*Step 1 (1 mark):* $z + \\bar z = r\\,\\text{cis}\\,\\theta + r\\,\\text{cis}\\,(-\\theta) = r[(\\cos\\theta + i\\sin\\theta) + (\\cos\\theta - i\\sin\\theta)]$.
*Step 2 (1 mark):* $= 2r\\cos\\theta$, which is a real number.
*Step 3 (1 mark):* So $|z + \\bar z| = |2r\\cos\\theta| = 2r|\\cos\\theta|$.

**c. (3 marks)**
*Step 1 (1 mark):* $|z + \\bar z| = 2r\\cos(\\pi/3) = 2r \\cdot 1/2 = r$.
*Step 2 (1 mark):* Setting $r = 4$.
*Step 3 (1 mark):* So $z = 4\\,\\text{cis}\\,(\\pi/3) = 2 + 2\\sqrt 3 i$.`),
];

// ─── 3 EXT_RESP ─────────────────────────────────────────────────────────

const extendedResponse: FR[] = [
  sq(`A rotating mechanism in the complex plane multiplies any complex input $z$ by a fixed complex factor $w = \\sqrt 3 + i$ at each step.

**a.** Express $w$ in polar form $r\\,\\text{cis}\\,\\theta$ with $-\\pi < \\theta \\le \\pi$. (2 marks)

**b.** A particle starts at $z_0 = 1$. Find $z_1 = w z_0$ and $z_2 = w^2 z_0$ in polar form. (3 marks)

**c.** State the rotation and dilation effect of multiplying by $w$. (2 marks)

**d.** Find the smallest positive integer $n$ such that $z_n = w^n z_0$ has argument $\\pi$. (2 marks)

**e.** Hence find $|z_n|$ for this value of $n$. (2 marks)

${img("polar-mult.svg", "Argand diagram showing the product of z₁ = 2 cis(π/4) and z₂ = 2 cis(π/2) yielding z₁z₂ = 4 cis(3π/4)")}`,
    11, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* $|w| = \\sqrt{3 + 1} = 2$.
*Step 2 (1 mark):* $\\arg(w) = \\arctan(1/\\sqrt 3) = \\pi/6$. So $w = 2\\,\\text{cis}\\,(\\pi/6)$.

**b. (3 marks)**
*Step 1 (1 mark):* $z_0 = 1 = 1\\,\\text{cis}\\,(0)$.
*Step 2 (1 mark):* $z_1 = w z_0 = 2\\,\\text{cis}\\,(\\pi/6)$.
*Step 3 (1 mark):* $z_2 = w^2 z_0 = 4\\,\\text{cis}\\,(2\\pi/6) = 4\\,\\text{cis}\\,(\\pi/3)$.

**c. (2 marks)**
*Step 1 (1 mark):* Rotation by $\\pi/6$ (30°) anticlockwise about the origin.
*Step 2 (1 mark):* Dilation (scaling) by factor $|w| = 2$ from the origin.

**d. (2 marks)**
*Step 1 (1 mark):* $z_n = 2^n\\,\\text{cis}\\,(n\\pi/6)$. Need $n\\pi/6 \\equiv \\pi\\pmod{2\\pi}$, i.e. $n \\equiv 6\\pmod{12}$.
*Step 2 (1 mark):* Smallest positive $n = 6$.

**e. (2 marks)**
*Step 1 (1 mark):* $|z_6| = 2^6 = 64$.
*Step 2 (1 mark):* So at $n = 6$, the particle is at $-64$ on the real axis.`),

  sq(`Two complex numbers are given by $z_1 = 2\\,\\text{cis}\\,(\\pi/4)$ and $z_2 = 3\\,\\text{cis}\\,(\\pi/3)$.

**a.** Find $z_1 z_2$ and $z_1/z_2$ in polar form (principal argument). (3 marks)

**b.** Express $z_1 + z_2$ in Cartesian form, and hence compute $|z_1 + z_2|$ correct to two decimal places. (3 marks)

**c.** Find the principal argument of $z_1 + z_2$ correct to three decimal places (radians). (2 marks)

**d.** Show that $|z_1 z_2| = |z_1||z_2|$ for these specific numbers, and explain why this identity holds in general. (3 marks)`,
    11, "HARD",
    `**a. (3 marks)**
*Step 1 (1 mark):* $z_1 z_2 = 2 \\cdot 3\\,\\text{cis}\\,(\\pi/4 + \\pi/3) = 6\\,\\text{cis}\\,(3\\pi/12 + 4\\pi/12) = 6\\,\\text{cis}\\,(7\\pi/12)$.
*Step 2 (1 mark):* $z_1/z_2 = (2/3)\\,\\text{cis}\\,(\\pi/4 - \\pi/3) = (2/3)\\,\\text{cis}\\,(3\\pi/12 - 4\\pi/12) = (2/3)\\,\\text{cis}\\,(-\\pi/12)$.
*Step 3 (1 mark):* Both arguments lie in $(-\\pi, \\pi]$ so are principal forms.

**b. (3 marks)**
*Step 1 (1 mark):* $z_1 = 2\\cos(\\pi/4) + 2i\\sin(\\pi/4) = \\sqrt 2 + \\sqrt 2 i$ and $z_2 = 3\\cos(\\pi/3) + 3i\\sin(\\pi/3) = 3/2 + (3\\sqrt 3/2)i$.
*Step 2 (1 mark):* $z_1 + z_2 = (\\sqrt 2 + 3/2) + (\\sqrt 2 + 3\\sqrt 3/2)i \\approx (1.414 + 1.5) + (1.414 + 2.598)i = 2.914 + 4.012 i$.
*Step 3 (1 mark):* $|z_1 + z_2| \\approx \\sqrt{8.493 + 16.10} = \\sqrt{24.59} \\approx 4.96$.

**c. (2 marks)**
*Step 1 (1 mark):* Argument $\\approx \\arctan(4.012/2.914)$.
*Step 2 (1 mark):* $\\approx \\arctan(1.377) \\approx 0.943$ radians.

**d. (3 marks)**
*Step 1 (1 mark):* $|z_1 z_2| = |6\\,\\text{cis}\\,(7\\pi/12)| = 6$ and $|z_1||z_2| = 2 \\cdot 3 = 6$. So equality holds.
*Step 2 (1 mark):* General argument: if $z = r_1\\,\\text{cis}\\,\\theta_1$ and $w = r_2\\,\\text{cis}\\,\\theta_2$, then $zw = r_1 r_2\\,\\text{cis}\\,(\\theta_1 + \\theta_2)$.
*Step 3 (1 mark):* So $|zw| = r_1 r_2 = |z||w|$ for any complex numbers.`),

  sq(`Consider $z = 1 - i\\sqrt 3$.

**a.** Express $z$ in polar form $r\\,\\text{cis}\\,\\theta$ with $-\\pi < \\theta \\le \\pi$. (2 marks)

**b.** Find $z^5$ in polar form (principal argument) and hence in Cartesian form. (3 marks)

**c.** Find all solutions $w$ to $w^3 = z$ in polar form, with arguments in $(-\\pi, \\pi]$. (4 marks)

**d.** Hence, plot the three solutions of $w^3 = z$ on an Argand diagram and describe their geometric arrangement. (3 marks)

${img("modulus.svg", "Argand diagram showing z = 3 + 4i with |z| = 5 and argument ray")}`,
    12, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* $|z| = \\sqrt{1 + 3} = 2$.
*Step 2 (1 mark):* $z$ in Q4: $\\arg(z) = -\\arctan(\\sqrt 3/1) = -\\pi/3$. So $z = 2\\,\\text{cis}\\,(-\\pi/3)$.

**b. (3 marks)**
*Step 1 (1 mark):* $z^5 = 2^5\\,\\text{cis}\\,(5 \\cdot (-\\pi/3)) = 32\\,\\text{cis}\\,(-5\\pi/3)$.
*Step 2 (1 mark):* $-5\\pi/3 + 2\\pi = \\pi/3$, so $z^5 = 32\\,\\text{cis}\\,(\\pi/3)$.
*Step 3 (1 mark):* Cartesian: $z^5 = 32(\\cos(\\pi/3) + i\\sin(\\pi/3)) = 32(1/2 + i\\sqrt 3/2) = 16 + 16\\sqrt 3 i$.

**c. (4 marks)**
*Step 1 (1 mark):* Let $w = s\\,\\text{cis}\\,\\phi$. Then $w^3 = s^3\\,\\text{cis}\\,(3\\phi) = 2\\,\\text{cis}\\,(-\\pi/3)$.
*Step 2 (1 mark):* $s^3 = 2 \\Rightarrow s = 2^{1/3}$, and $3\\phi = -\\pi/3 + 2k\\pi$ for $k = 0, 1, 2$.
*Step 3 (1 mark):* So $\\phi = -\\pi/9 + 2k\\pi/3$, giving $\\phi_0 = -\\pi/9$, $\\phi_1 = -\\pi/9 + 2\\pi/3 = 5\\pi/9$, $\\phi_2 = -\\pi/9 - 2\\pi/3 = -7\\pi/9$.
*Step 4 (1 mark):* Solutions: $w = 2^{1/3}\\,\\text{cis}\\,(-\\pi/9),\\ 2^{1/3}\\,\\text{cis}\\,(5\\pi/9),\\ 2^{1/3}\\,\\text{cis}\\,(-7\\pi/9)$. All arguments lie in $(-\\pi, \\pi]$. ✓

**d. (3 marks)**
*Step 1 (1 mark):* All three points lie on a circle of radius $2^{1/3}$ centred at the origin.
*Step 2 (1 mark):* Their arguments differ by $2\\pi/3$ (120°), so they are equally spaced.
*Step 3 (1 mark):* The three points form the vertices of an equilateral triangle inscribed in the circle.`),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to ${JSON_PATH}\n` +
    `Wrote ${Object.keys(figures).length} SVG files to ${FIGURES_DIR}/`,
);
