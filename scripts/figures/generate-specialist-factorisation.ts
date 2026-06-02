/** Specialist ext-fit: Factorisation of Polynomials over ℂ. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "factorisation-of-polynomials-over";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("Over $\\mathbb{C}$, $z^2 + 4$ factors as:", ["$(z+2)(z-2)$", "$(z-2i)(z+2i)$", "$(z+4)(z-4)$", "$(z+2i)^2$"], "B", "EASY",
    "$z^2 + 4 = z^2 - (2i)^2 = (z-2i)(z+2i)$. **Answer: B**"),
  m("Over $\\mathbb{C}$, $z^2 - 2z + 5$ has roots:", ["$1 \\pm 2i$", "$2 \\pm i$", "$-1 \\pm 2i$", "$1 \\pm i$"], "A", "EASY",
    "Quadratic formula: $z = (2 \\pm \\sqrt{4-20})/2 = 1 \\pm 2i$. **Answer: A**"),
  m("The number of roots over $\\mathbb{C}$ of a degree-5 polynomial (with multiplicity) is:", ["$\\le 5$", "exactly 5", "may exceed 5", "depends on coefficients"], "B", "EASY",
    "Fundamental Theorem of Algebra: exactly 5 with multiplicity. **Answer: B**"),
  m("If $z = 2 + i$ is a root of a real cubic, then another root is:", ["$2 - i$", "$-2 - i$", "$-2 + i$", "$i$"], "A", "MEDIUM",
    "Real coefficients → complex roots in conjugate pairs: $2 - i$ also a root. **Answer: A**"),
  m("$z^3 + 8 = 0$ over $\\mathbb{C}$ has roots:", ["$-2, 1 \\pm i\\sqrt 3$", "$-2$ only", "$2, -1 \\pm i\\sqrt 3$", "$\\pm 2$"], "A", "MEDIUM",
    "$z^3 = -8 = 8\\text{cis}(\\pi)$, so $z = 2\\text{cis}((π + 2kπ)/3)$, $k = 0, 1, 2$ giving $z = 2\\text{cis}(π/3), 2\\text{cis}(π), 2\\text{cis}(5π/3) = 1 + i\\sqrt 3, -2, 1 - i\\sqrt 3$. **Answer: A**"),
  m("Linear factor over $\\mathbb{C}$ corresponding to root $z = 3 - 2i$ is:", ["$z - 3 + 2i$", "$z - 3 - 2i$", "$z + 3 - 2i$", "$z + 3 + 2i$"], "A", "MEDIUM",
    "Linear factor for root $a$ is $z - a$, so $z - (3 - 2i) = z - 3 + 2i$. **Answer: A**"),
  m("Over $\\mathbb{R}$, $z^4 + 4$ factors as:", ["$(z^2 - 2z + 2)(z^2 + 2z + 2)$", "$(z^2 + 2)^2$", "$(z^2 + 2)(z^2 - 2)$", "irreducible"], "A", "HARD",
    "$z^4 + 4 = (z^2 + 2)^2 - 4z^2 = (z^2 + 2 - 2z)(z^2 + 2 + 2z)$. **Answer: A**"),
  m("A polynomial $P(z)$ of degree 4 with real coefficients has roots $2i$ and $1 + i$. The polynomial is:", ["$(z^2+4)(z^2-2z+2)$", "$(z^2-4)(z^2+2)$", "$(z-2i)(z-1-i)$", "$(z+2i)^2(z-1-i)$"], "A", "HARD",
    "Conjugate pairs: $\\pm 2i$ and $1 \\pm i$. Quadratic from $\\pm 2i$: $z^2 + 4$. From $1 \\pm i$: $z^2 - 2z + 2$. **Answer: A**"),
];

const shortAnswer: FR[] = [
  sq("Factorise $z^2 + 9$ over $\\mathbb{C}$.", 1, "EASY",
    "$z^2 + 9 = (z - 3i)(z + 3i)$."),
  sq("Find all roots of $z^2 - 6z + 13 = 0$ over $\\mathbb{C}$.", 2, "EASY",
    "*Step 1 (1 mark):* Discriminant $= 36 - 52 = -16$, so $z = (6 \\pm \\sqrt{-16})/2 = (6 \\pm 4i)/2$.\n*Step 2 (1 mark):* $z = 3 \\pm 2i$."),
  sq("Factorise $z^3 - 1$ over $\\mathbb{R}$ then over $\\mathbb{C}$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Over $\\mathbb{R}$: $z^3 - 1 = (z-1)(z^2+z+1)$.\n*Step 2 (1 mark):* Roots of $z^2 + z + 1$: $z = (-1 \\pm i\\sqrt 3)/2$.\n*Step 3 (1 mark):* Over $\\mathbb{C}$: $(z - 1)(z - \\omega)(z - \\bar\\omega)$ where $\\omega = (-1 + i\\sqrt 3)/2$."),
  sq("If $z = 1 - 2i$ is a root of $z^2 + bz + c = 0$ with $b, c \\in \\mathbb{R}$, find $b$ and $c$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Conjugate root: $1 + 2i$.\n*Step 2 (1 mark):* Sum of roots $= 2 = -b$ so $b = -2$.\n*Step 3 (1 mark):* Product $= (1)^2 + (2)^2 = 5 = c$. So $b = -2$, $c = 5$."),
  sq("Factorise $z^4 + 1$ over $\\mathbb{R}$.", 3, "HARD",
    "*Step 1 (1 mark):* Add/subtract: $z^4 + 1 = (z^2 + 1)^2 - 2z^2$.\n*Step 2 (1 mark):* Difference of squares: $= (z^2 + 1 - \\sqrt 2 z)(z^2 + 1 + \\sqrt 2 z)$.\n*Step 3 (1 mark):* So $z^4 + 1 = (z^2 - \\sqrt 2 z + 1)(z^2 + \\sqrt 2 z + 1)$."),
];

const extendedAnswer: FR[] = [
  sq(`Let $P(z) = z^4 - 2z^3 + 6z^2 - 2z + 5$.

**a.** Show that $z = i$ is a root of $P(z) = 0$. (2 marks)

**b.** Write down the conjugate root and find a real quadratic factor of $P(z)$. (3 marks)

**c.** Factorise $P(z)$ over $\\mathbb{R}$ and over $\\mathbb{C}$. (3 marks)`, 8, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* $i^4 = 1$, $i^3 = -i$, $i^2 = -1$.
*Step 2 (1 mark):* $P(i) = 1 - 2(-i) + 6(-1) - 2i + 5 = 1 + 2i - 6 - 2i + 5 = 0$. ✓

**b. (3 marks)**
*Step 1 (1 mark):* Conjugate root: $z = -i$.
*Step 2 (1 mark):* Sum $= 0$, product $= 1$.
*Step 3 (1 mark):* Real quadratic factor: $z^2 + 1$.

**c. (3 marks)**
*Step 1 (1 mark):* Polynomial divide $P(z) / (z^2 + 1) = z^2 - 2z + 5$.
*Step 2 (1 mark):* Roots of $z^2 - 2z + 5$: $z = 1 \\pm 2i$.
*Step 3 (1 mark):* Over $\\mathbb{R}$: $(z^2 + 1)(z^2 - 2z + 5)$. Over $\\mathbb{C}$: $(z - i)(z + i)(z - 1 - 2i)(z - 1 + 2i)$.`),

  sq(`Let $P(z) = z^3 + az^2 + bz - 10$ with $a, b \\in \\mathbb{R}$.

**a.** Given $z = 1 + 3i$ is a root, write down a second root and explain. (2 marks)

**b.** Using the third (real) root and the product of all three roots, find that real root. (2 marks)

**c.** Hence find $a$ and $b$. (3 marks)`, 7, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* Real coefficients → conjugate root: $z = 1 - 3i$.
*Step 2 (1 mark):* This follows from the Conjugate Root Theorem.

**b. (2 marks)**
*Step 1 (1 mark):* Product of all roots $= -(-10)/1 = 10$ (by Vieta's).
*Step 2 (1 mark):* Product of complex pair: $(1)^2 + (3)^2 = 10$. So real root $= 10/10 = 1$.

**c. (3 marks)**
*Step 1 (1 mark):* Sum of roots $= -a = (1+3i) + (1-3i) + 1 = 3$, so $a = -3$.
*Step 2 (1 mark):* Sum of products in pairs $= b = (1+3i)(1-3i) + (1+3i)(1) + (1-3i)(1) = 10 + 2 = 12$.
*Step 3 (1 mark):* So $a = -3$, $b = 12$. Check: $z^3 - 3z^2 + 12z - 10$ at $z = 1$: $1 - 3 + 12 - 10 = 0$ ✓.`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse: [] };
fs.writeFileSync("scripts/output/qset-specialist-factorisation.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS to scripts/output/qset-specialist-factorisation.json`);
