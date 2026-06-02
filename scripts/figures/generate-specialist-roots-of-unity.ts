/** Specialist ext-fit: Roots of Unity. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "roots-of-unity";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("The number of distinct $n$th roots of unity over $\\mathbb{C}$ is:", ["$1$", "$2$", "$n$", "infinite"], "C", "EASY",
    "There are exactly $n$ distinct $n$th roots of unity. **Answer: C**"),
  m("The 3rd roots of unity are:", ["$1, i, -i$", "$1, -1$", "$1, \\omega, \\omega^2$ where $\\omega = e^{2\\pi i/3}$", "$1$ only"], "C", "EASY",
    "Cube roots of 1: $z = e^{2k\\pi i/3}$, $k = 0, 1, 2$. **Answer: C**"),
  m("The 4th roots of unity are:", ["$\\pm 1, \\pm i$", "$\\pm 1$", "$\\pm i$", "$\\pm 2$"], "A", "EASY",
    "$z^4 = 1 \\Rightarrow z = 1, i, -1, -i$. **Answer: A**"),
  m("The sum of all $n$th roots of unity ($n \\ge 2$) is:", ["$0$", "$1$", "$n$", "$-1$"], "A", "MEDIUM",
    "Roots of $z^n - 1$; sum = $-$(coefficient of $z^{n-1}$) = 0. **Answer: A**"),
  m("If $\\omega = e^{2\\pi i / 5}$, then $1 + \\omega + \\omega^2 + \\omega^3 + \\omega^4 =$:", ["$0$", "$1$", "$5$", "$-1$"], "A", "MEDIUM",
    "Sum of all 5th roots of unity $= 0$. **Answer: A**"),
  m("The 6th roots of unity form a regular hexagon centred at the origin with one vertex at:", ["$0$", "$1$", "$-1$", "$i$"], "B", "MEDIUM",
    "The 6th roots include $z = 1$ at angle 0. **Answer: B**"),
  m("$\\omega^3$ where $\\omega$ is a primitive 6th root of unity is:", ["$1$", "$-1$", "$\\omega$", "$0$"], "B", "HARD",
    "Primitive 6th root: $\\omega = e^{2\\pi i /6}$. $\\omega^3 = e^{\\pi i} = -1$. **Answer: B**"),
  m("The product of all 5th roots of unity is:", ["$0$", "$1$", "$-1$", "$5$"], "B", "HARD",
    "Roots of $z^5 - 1 = 0$; product $= (-1)^5 \\cdot (-1) = 1$ (constant term sign-adjusted). Direct: product of $e^{2\\pi i k/5}$ for $k=0..4$ is $e^{2\\pi i (0+1+2+3+4)/5} = e^{2\\pi i \\cdot 2} = 1$. **Answer: B**"),
];

const shortAnswer: FR[] = [
  sq("Find all 4th roots of unity.", 2, "EASY",
    "*Step 1 (1 mark):* $z^4 = 1 \\Rightarrow z = e^{2k\\pi i/4}$, $k = 0, 1, 2, 3$.\n*Step 2 (1 mark):* $z = 1, i, -1, -i$."),
  sq("Find the cube roots of unity, giving them in Cartesian form.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $z = e^{2k\\pi i/3}$, $k = 0, 1, 2$.\n*Step 2 (1 mark):* $z_0 = 1$. $z_1 = \\cos(2\\pi/3) + i\\sin(2\\pi/3) = -1/2 + i\\sqrt 3/2$.\n*Step 3 (1 mark):* $z_2 = \\cos(4\\pi/3) + i\\sin(4\\pi/3) = -1/2 - i\\sqrt 3/2$."),
  sq("Show that $1 + \\omega + \\omega^2 = 0$ where $\\omega$ is a non-real cube root of unity.", 2, "MEDIUM",
    "*Step 1 (1 mark):* $\\omega^3 - 1 = 0 \\Rightarrow (\\omega - 1)(\\omega^2 + \\omega + 1) = 0$.\n*Step 2 (1 mark):* Since $\\omega \\ne 1$, the second factor must be zero, so $1 + \\omega + \\omega^2 = 0$."),
  sq("Find all solutions of $z^6 = 1$ in polar form $r\\,\\text{cis}\\,\\theta$.", 3, "HARD",
    "*Step 1 (1 mark):* $r^6 = 1 \\Rightarrow r = 1$.\n*Step 2 (1 mark):* $6\\theta = 2k\\pi \\Rightarrow \\theta = k\\pi/3$, $k = 0, 1, \\ldots, 5$.\n*Step 3 (1 mark):* So $z = \\text{cis}(k\\pi/3)$ for $k = 0, 1, 2, 3, 4, 5$."),
  sq("The 5th roots of unity are vertices of a regular polygon. State the polygon and its centre.", 2, "MEDIUM",
    "*Step 1 (1 mark):* 5 vertices on unit circle equally spaced → regular pentagon.\n*Step 2 (1 mark):* Centre is the origin."),
];

const extendedAnswer: FR[] = [
  sq(`**a.** Find all 6th roots of unity in polar form. (3 marks)

**b.** Convert each to Cartesian form. (3 marks)

**c.** Verify the sum of all 6 roots is 0. (2 marks)`, 8, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* $z^6 = 1 = \\text{cis}(0)$; $r = 1$.
*Step 2 (1 mark):* $\\theta = 2k\\pi/6 = k\\pi/3$.
*Step 3 (1 mark):* Roots: $\\text{cis}(0), \\text{cis}(\\pi/3), \\text{cis}(2\\pi/3), \\text{cis}(\\pi), \\text{cis}(4\\pi/3), \\text{cis}(5\\pi/3)$.

**b. (3 marks)**
*Step 1 (1 mark):* $\\text{cis}(0) = 1$, $\\text{cis}(\\pi) = -1$.
*Step 2 (1 mark):* $\\text{cis}(\\pi/3) = 1/2 + i\\sqrt 3/2$, $\\text{cis}(2\\pi/3) = -1/2 + i\\sqrt 3/2$.
*Step 3 (1 mark):* $\\text{cis}(4\\pi/3) = -1/2 - i\\sqrt 3/2$, $\\text{cis}(5\\pi/3) = 1/2 - i\\sqrt 3/2$.

**c. (2 marks)**
*Step 1 (1 mark):* Group conjugate pairs: real parts cancel as $1 + (-1) + 2(1/2) + 2(-1/2) = 0$.
*Step 2 (1 mark):* Imaginary parts: $\\sqrt 3/2 + \\sqrt 3/2 - \\sqrt 3/2 - \\sqrt 3/2 = 0$. Sum = $0$ ✓.`),

  sq(`Let $\\omega = \\text{cis}(2\\pi/5)$ be a primitive 5th root of unity.

**a.** State the value of $\\omega^5$. (1 mark)

**b.** Hence find $\\omega + \\omega^2 + \\omega^3 + \\omega^4$. (3 marks)

**c.** Show that $\\omega \\bar\\omega = 1$. (2 marks)`, 6, "HARD",
    `**a. (1 mark)** $\\omega^5 = \\text{cis}(2\\pi) = 1$.

**b. (3 marks)**
*Step 1 (1 mark):* $\\omega$ is a root of $z^5 - 1 = 0$, i.e. $(z-1)(z^4 + z^3 + z^2 + z + 1) = 0$.
*Step 2 (1 mark):* Since $\\omega \\ne 1$, $\\omega^4 + \\omega^3 + \\omega^2 + \\omega + 1 = 0$.
*Step 3 (1 mark):* Hence $\\omega + \\omega^2 + \\omega^3 + \\omega^4 = -1$.

**c. (2 marks)**
*Step 1 (1 mark):* $|\\omega| = 1$, so $\\omega \\bar\\omega = |\\omega|^2 = 1$.
*Step 2 (1 mark):* Equivalently, $\\bar\\omega = \\text{cis}(-2\\pi/5) = \\omega^{-1} = \\omega^4$ (since $\\omega^5 = 1$).`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse: [] };
fs.writeFileSync("scripts/output/qset-specialist-roots-of-unity.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS to scripts/output/qset-specialist-roots-of-unity.json`);
