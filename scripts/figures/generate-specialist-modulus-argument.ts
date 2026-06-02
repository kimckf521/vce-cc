/** Specialist ext-fit: Modulus and Argument. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "modulus-and-argument";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("$|3 + 4i|$ equals:", ["$5$", "$7$", "$25$", "$\\sqrt 7$"], "A", "EASY",
    "$\\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$. **Answer: A**"),
  m("$\\arg(1 + i)$ equals:", ["$\\dfrac{\\pi}{4}$", "$\\dfrac{\\pi}{2}$", "$\\dfrac{3\\pi}{4}$", "$0$"], "A", "EASY",
    "$\\tan^{-1}(1/1) = \\pi/4$ in the first quadrant. **Answer: A**"),
  m("$|i|$ equals:", ["$0$", "$1$", "$i$", "$-1$"], "B", "EASY",
    "$|i| = \\sqrt{0 + 1} = 1$. **Answer: B**"),
  m("If $z = -1 + \\sqrt 3 i$, then $\\arg(z)$ equals:", ["$\\dfrac{2\\pi}{3}$", "$\\dfrac{\\pi}{3}$", "$\\dfrac{5\\pi}{6}$", "$\\dfrac{\\pi}{6}$"], "A", "MEDIUM",
    "Second quadrant: $\\arg = \\pi - \\tan^{-1}(\\sqrt 3/1) = \\pi - \\pi/3 = 2\\pi/3$. **Answer: A**"),
  m("$|z_1 z_2| = |z_1| |z_2|$ is true:", ["only for real $z_i$", "only when $|z_1| = |z_2|$", "always", "only for $|z_i| = 1$"], "C", "MEDIUM",
    "Modulus is multiplicative: $|z_1 z_2| = |z_1||z_2|$ for all complex $z_i$. **Answer: C**"),
  m("$\\arg(\\bar z)$ equals:", ["$\\arg(z)$", "$-\\arg(z)$", "$\\pi - \\arg(z)$", "$2\\pi - \\arg(z)$"], "B", "MEDIUM",
    "Conjugation reflects across the real axis. **Answer: B**"),
  m("If $z = 2(\\cos(\\pi/6) + i\\sin(\\pi/6))$, then in Cartesian form $z =$:", ["$\\sqrt 3 + i$", "$1 + i\\sqrt 3$", "$2 + 2i$", "$\\sqrt 3 - i$"], "A", "HARD",
    "$z = 2\\cos(\\pi/6) + 2i\\sin(\\pi/6) = 2(\\sqrt 3 / 2) + 2i(1/2) = \\sqrt 3 + i$. **Answer: A**"),
  m("$|3 + 4i| \\cdot |1 - i|$ equals:", ["$5\\sqrt 2$", "$5 + \\sqrt 2$", "$\\sqrt{50}$", "$\\sqrt 2 / 5$"], "A", "HARD",
    "$|3+4i| = 5$, $|1-i| = \\sqrt 2$. Product $5\\sqrt 2$ (also $\\sqrt{50}$). The simplest form is $5\\sqrt 2$. **Answer: A**"),
];

const shortAnswer: FR[] = [
  sq("Find $|z|$ and $\\arg(z)$ for $z = -2 + 2i$.", 2, "EASY",
    "*Step 1 (1 mark):* $|z| = \\sqrt{4 + 4} = 2\\sqrt 2$.\n*Step 2 (1 mark):* Second quadrant, $\\tan^{-1}(2/2) = \\pi/4$, so $\\arg(z) = \\pi - \\pi/4 = 3\\pi/4$."),
  sq("If $|z| = 2$ and $\\arg(z) = \\pi/3$, write $z$ in Cartesian form.", 2, "EASY",
    "*Step 1 (1 mark):* $z = 2\\cos(\\pi/3) + 2i\\sin(\\pi/3)$.\n*Step 2 (1 mark):* $= 2(1/2) + 2i(\\sqrt 3/2) = 1 + i\\sqrt 3$."),
  sq("Show that $|z\\bar z| = |z|^2$.", 2, "MEDIUM",
    "*Step 1 (1 mark):* If $z = a + bi$, $z\\bar z = a^2 + b^2$, which is real and equals $|z|^2$.\n*Step 2 (1 mark):* So $|z\\bar z| = |a^2 + b^2| = a^2 + b^2 = |z|^2$."),
  sq("Find $\\arg\\!\\left(\\dfrac{1+i}{1-i}\\right)$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $\\arg\\left(\\dfrac{z_1}{z_2}\\right) = \\arg z_1 - \\arg z_2$.\n*Step 2 (1 mark):* $\\arg(1+i) = \\pi/4$, $\\arg(1-i) = -\\pi/4$.\n*Step 3 (1 mark):* Difference: $\\pi/4 - (-\\pi/4) = \\pi/2$."),
  sq("If $|z - 1| = 2$, describe the locus of $z$ geometrically.", 2, "MEDIUM",
    "*Step 1 (1 mark):* $|z - 1|$ is the distance from $z$ to the point $1 + 0i$.\n*Step 2 (1 mark):* So locus is a circle of radius 2 centred at $(1, 0)$ in the complex plane."),
];

const extendedAnswer: FR[] = [
  sq(`Let $z = 1 - i\\sqrt 3$.

**a.** Find $|z|$ and $\\arg(z)$. (3 marks)

**b.** Hence write $z$ in polar form. (1 mark)

**c.** Calculate $|z^4|$ and $\\arg(z^4)$. (3 marks)`, 7, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* $|z| = \\sqrt{1 + 3} = 2$.
*Step 2 (1 mark):* Fourth quadrant: $\\tan^{-1}(\\sqrt 3/1) = \\pi/3$.
*Step 3 (1 mark):* So $\\arg(z) = -\\pi/3$.

**b. (1 mark)** $z = 2(\\cos(-\\pi/3) + i\\sin(-\\pi/3))$ or $2\\,\\text{cis}(-\\pi/3)$.

**c. (3 marks)**
*Step 1 (1 mark):* $|z^4| = |z|^4 = 2^4 = 16$.
*Step 2 (1 mark):* $\\arg(z^4) = 4 \\cdot (-\\pi/3) = -4\\pi/3$.
*Step 3 (1 mark):* Reduce to principal range $(-\\pi, \\pi]$: $-4\\pi/3 + 2\\pi = 2\\pi/3$.`),

  sq(`Consider $z_1 = 1 + i$ and $z_2 = \\sqrt 3 + i$.

**a.** Find $|z_1|$, $\\arg(z_1)$, $|z_2|$, $\\arg(z_2)$. (4 marks)

**b.** Use these to evaluate $|z_1 z_2|$ and $\\arg(z_1 z_2)$. (3 marks)`, 7, "MEDIUM",
    `**a. (4 marks)**
*Step 1 (1 mark):* $|z_1| = \\sqrt 2$.
*Step 2 (1 mark):* $\\arg(z_1) = \\pi/4$.
*Step 3 (1 mark):* $|z_2| = \\sqrt{3 + 1} = 2$.
*Step 4 (1 mark):* $\\arg(z_2) = \\tan^{-1}(1/\\sqrt 3) = \\pi/6$.

**b. (3 marks)**
*Step 1 (1 mark):* $|z_1 z_2| = |z_1| |z_2| = 2\\sqrt 2$.
*Step 2 (1 mark):* $\\arg(z_1 z_2) = \\arg z_1 + \\arg z_2 = \\pi/4 + \\pi/6 = 3\\pi/12 + 2\\pi/12 = 5\\pi/12$.
*Step 3 (1 mark):* Check via direct multiplication: $z_1 z_2 = (\\sqrt 3 - 1) + (\\sqrt 3 + 1)i$. $|z_1 z_2| = \\sqrt{(\\sqrt 3 - 1)^2 + (\\sqrt 3 + 1)^2} = \\sqrt{8} = 2\\sqrt 2$ ✓.`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse: [] };
fs.writeFileSync("scripts/output/qset-specialist-modulus-argument.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS to scripts/output/qset-specialist-modulus-argument.json`);
