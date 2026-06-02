/**
 * Specialist: Conjugate Root Theorem.
 * Tier: extended-fit → MCQ + SHORT + EXT_ANS.
 */

import * as fs from "fs";

const JSON_PATH = "scripts/output/qset-specialist-conjugate-root.json";

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
  subtopicSlugs: ["conjugate-root-theorem", ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: ["conjugate-root-theorem", ...sec],
});

// ─── 12 MCQ ─────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("If a polynomial with real coefficients has $z = 2 + 3i$ as a root, then which of the following must also be a root?",
    ["$2 - 3i$", "$-2 + 3i$", "$-2 - 3i$", "$3 + 2i$"], "A", "EASY",
    "Complex roots of real-coefficient polynomials occur in conjugate pairs. The conjugate of $2 + 3i$ is $2 - 3i$. **Answer: A**"),
  m("Which of the following polynomials must have complex roots occurring in conjugate pairs?",
    ["$P(z) = z^2 + iz + 1$", "$P(z) = z^3 - 2z + 5$", "$P(z) = z^2 + (1+i)$", "$P(z) = (z + i)(z - 2i)$"], "B", "EASY",
    "Conjugate root theorem requires real coefficients. Only option B has all real coefficients. **Answer: B**"),
  m("A real-coefficient polynomial has roots $z = 1 + i$ and $z = 3$. The minimum degree of the polynomial is:",
    ["$2$", "$3$", "$4$", "$5$"], "B", "EASY",
    "Conjugate $1 - i$ is also a root, so total roots are $\\{1+i, 1-i, 3\\}$, giving minimum degree 3. **Answer: B**"),
  m("If $z = i$ is a root of a real-coefficient polynomial $P(z)$, then $P(z)$ is divisible by:",
    ["$z + i$", "$z - i$", "$z^2 + 1$", "$z^2 - 1$"], "C", "EASY",
    "Conjugate $-i$ is also a root. So $(z - i)(z + i) = z^2 + 1$ divides $P(z)$. **Answer: C**"),
  m("If $z = 2 - i$ is a root of $P(z) = z^2 + bz + c$ with $b, c \\in \\mathbb R$, then $b$ equals:",
    ["$-4$", "$4$", "$-2$", "$2$"], "A", "MEDIUM",
    "Conjugate $2 + i$ is also a root. Sum of roots $= -b/1$, so $(2-i) + (2+i) = 4 = -b \\Rightarrow b = -4$. **Answer: A**"),
  m("If $z = 1 + i\\sqrt 2$ is a root of $P(z) = z^2 + bz + c$ with $b, c \\in \\mathbb R$, then $c$ equals:",
    ["$3$", "$-3$", "$1$", "$\\sqrt 2$"], "A", "MEDIUM",
    "Conjugate $1 - i\\sqrt 2$ is also a root. Product of roots: $(1+i\\sqrt 2)(1-i\\sqrt 2) = 1 + 2 = 3 = c$. **Answer: A**"),
  m("If $P(z) = z^3 + az^2 + bz + c$ with $a, b, c \\in \\mathbb R$ has roots $z = 2$ and $z = 1 + i$, then $a$ equals:",
    ["$-4$", "$4$", "$-2$", "$2$"], "A", "MEDIUM",
    "Roots: $2, 1+i, 1-i$. Sum $= 2 + (1+i) + (1-i) = 4 = -a \\Rightarrow a = -4$. **Answer: A**"),
  m("A monic real-coefficient quadratic has $z = 3 + 4i$ as a root. The quadratic is:",
    ["$z^2 - 6z + 25$", "$z^2 + 6z + 25$", "$z^2 - 6z - 25$", "$z^2 - 6z + 7$"], "A", "MEDIUM",
    "Roots $3 \\pm 4i$: sum $= 6$, product $= 9 + 16 = 25$. So $z^2 - 6z + 25$. **Answer: A**"),
  m("The polynomial $P(z) = z^4 - 1$ has roots:",
    ["$1, -1$ only", "$1, -1, i, -i$", "$1, -1, i, -i$ with $i$ paired with $-i$ by conjugate root theorem", "$1, i$ only"], "C", "MEDIUM",
    "$z^4 - 1 = (z^2-1)(z^2+1) = (z-1)(z+1)(z-i)(z+i)$. Complex roots $i$ and $-i$ are a conjugate pair (real coefficients). **Answer: C**"),
  m("Let $P(z)$ be a real-coefficient polynomial of degree 5. Which of the following CANNOT be true?",
    ["$P(z)$ has 5 real roots", "$P(z)$ has 3 real roots and 2 complex roots", "$P(z)$ has 1 real root and 4 complex roots", "$P(z)$ has 0 real roots and 5 complex roots"], "D", "HARD",
    "Complex roots come in conjugate pairs, so the count of non-real roots is always even. Degree 5 cannot have 0 real roots. **Answer: D**"),
  m("If $P(z) = z^3 + az + b$ with $a, b \\in \\mathbb R$ has $z = 1 + 2i$ as a root, then $b$ equals:",
    ["$5$", "$10$", "$-5$", "$-10$"], "B", "HARD",
    "Conjugate $1 - 2i$ is also a root. Coefficient of $z^2$ is $0$, so sum of all roots $= 0$: third real root $r = -(1+2i) - (1-2i) = -2$. For monic cubic $z^3 + az + b$, product of roots $= -b$: $(1+2i)(1-2i)(-2) = 5 \\cdot (-2) = -10 = -b$, so $b = 10$. **Answer: B**"),
  m("If $z = 1 + i$ is a root of $P(z) = z^3 - 2z^2 + az + b$ with $a, b \\in \\mathbb R$, then $a + b$ equals:",
    ["$0$", "$2$", "$4$", "$-2$"], "B", "HARD",
    "Roots include $1+i$ and $1-i$. Sum of roots $= 2$ (since coefficient of $z^2$ is $-2$), so third root $r = 2 - (1+i) - (1-i) = 0$. The polynomial factors as $z(z^2 - 2z + 2) = z^3 - 2z^2 + 2z$. Matching: $a = 2$, $b = 0$, so $a + b = 2$. **Answer: B**"),
];

// ─── 8 SHORT ────────────────────────────────────────────────────────────

const shortAnswer: FR[] = [
  sq("State the conjugate root theorem and use it to find the other complex root of a real-coefficient polynomial that has $z = -2 + 5i$ as a root.", 2, "EASY",
    "*Step 1 (1 mark):* The conjugate root theorem states that if $P(z)$ is a polynomial with real coefficients and $z_0$ is a complex (non-real) root, then $\\overline{z_0}$ is also a root.\n*Step 2 (1 mark):* So the other complex root is $\\overline{-2 + 5i} = -2 - 5i$."),
  sq("Find the monic quadratic with real coefficients that has $z = 3 - 2i$ as one of its roots.", 2, "EASY",
    "*Step 1 (1 mark):* By conjugate root theorem, $z = 3 + 2i$ is also a root.\n*Step 2 (1 mark):* The quadratic is $(z - (3-2i))(z - (3+2i)) = z^2 - 6z + (9 + 4) = z^2 - 6z + 13$."),
  sq("Let $P(z) = z^3 + az^2 + bz + c$ with $a, b, c \\in \\mathbb R$. Given $z = 2$ and $z = 1 - i$ are roots, find $a$, $b$, and $c$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* By conjugate root theorem, $z = 1 + i$ is also a root.\n*Step 2 (1 mark):* $P(z) = (z - 2)(z - (1-i))(z - (1+i)) = (z - 2)(z^2 - 2z + 2)$.\n*Step 3 (1 mark):* Expanding: $z^3 - 2z^2 + 2z - 2z^2 + 4z - 4 = z^3 - 4z^2 + 6z - 4$. So $a = -4$, $b = 6$, $c = -4$."),
  sq("Show that $z = 1 + 2i$ is a root of $P(z) = z^2 - 2z + 5$ and write down the other root.", 2, "MEDIUM",
    "*Step 1 (1 mark):* $P(1 + 2i) = (1+2i)^2 - 2(1+2i) + 5 = (1 + 4i - 4) - 2 - 4i + 5 = -3 + 4i - 4i + 3 = 0$. ✓\n*Step 2 (1 mark):* By conjugate root theorem (real-coefficient polynomial), other root is $\\overline{1 + 2i} = 1 - 2i$."),
  sq("A real-coefficient cubic $P(z)$ has roots $z_1 = -1$ and $z_2 = 3 - 4i$. Find $P(z)$ as a monic cubic in expanded form.", 3, "MEDIUM",
    "*Step 1 (1 mark):* By conjugate root theorem, $z_3 = 3 + 4i$ is also a root.\n*Step 2 (1 mark):* The quadratic factor for the complex pair: $(z - (3-4i))(z - (3+4i)) = z^2 - 6z + (9 + 16) = z^2 - 6z + 25$.\n*Step 3 (1 mark):* $P(z) = (z + 1)(z^2 - 6z + 25) = z^3 - 6z^2 + 25z + z^2 - 6z + 25 = z^3 - 5z^2 + 19z + 25$."),
  sq("Find all roots of $z^3 - 4z^2 + 14z - 20 = 0$ given that $z = 1 - 3i$ is one root.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Real-coefficient cubic, so $z = 1 + 3i$ is also a root. Quadratic factor: $(z - (1-3i))(z - (1+3i)) = z^2 - 2z + 10$.\n*Step 2 (1 mark):* Divide $z^3 - 4z^2 + 14z - 20$ by $z^2 - 2z + 10$: quotient $z - 2$, remainder $0$.\n*Step 3 (1 mark):* Third root: $z - 2 = 0 \\Rightarrow z = 2$. Roots: $z = 2,\\ 1 + 3i,\\ 1 - 3i$."),
  sq("Explain why a real-coefficient polynomial of odd degree must have at least one real root, using the conjugate root theorem.", 2, "MEDIUM",
    "*Step 1 (1 mark):* By the conjugate root theorem, all non-real complex roots come in conjugate pairs, so the number of non-real roots is even.\n*Step 2 (1 mark):* An odd-degree polynomial has an odd number of roots in total (counted with multiplicity), so subtracting an even number of non-real roots leaves at least one real root."),
  sq("A monic real-coefficient quartic polynomial has roots $z = 2 + i$ and $z = -3 + i$. Find the polynomial in expanded form.", 3, "HARD",
    "*Step 1 (1 mark):* Other roots: $z = 2 - i$ and $z = -3 - i$.\n*Step 2 (1 mark):* Quadratic factors: $(z-(2+i))(z-(2-i)) = z^2 - 4z + 5$ and $(z-(-3+i))(z-(-3-i)) = z^2 + 6z + 10$.\n*Step 3 (1 mark):* Product: $(z^2 - 4z + 5)(z^2 + 6z + 10) = z^4 + 6z^3 + 10z^2 - 4z^3 - 24z^2 - 40z + 5z^2 + 30z + 50 = z^4 + 2z^3 - 9z^2 - 10z + 50$."),
];

// ─── 3 EXT_ANS ──────────────────────────────────────────────────────────

const extendedAnswer: FR[] = [
  sq(`Let $P(z) = z^3 + az^2 + bz + c$ where $a, b, c \\in \\mathbb R$. Given that $z = 1 + i$ is a root of $P(z) = 0$ and that $P(0) = -4$:

**a.** Find the other complex root and explain your reasoning. (2 marks)

**b.** Hence find the third (real) root. (3 marks)

**c.** Find the values of $a$, $b$, and $c$. (3 marks)`,
    8, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* Since $P$ has real coefficients, complex roots occur in conjugate pairs.
*Step 2 (1 mark):* So the other complex root is $\\overline{1+i} = 1 - i$.

**b. (3 marks)**
*Step 1 (1 mark):* $P(0) = c = -4$, so $c = -4$. For monic cubic $z^3 + az^2 + bz + c$, product of roots $= -c = 4$.
*Step 2 (1 mark):* Product of complex conjugate pair: $(1+i)(1-i) = 1 + 1 = 2$.
*Step 3 (1 mark):* So third root $r = 4/2 = 2$.

**c. (3 marks)**
*Step 1 (1 mark):* Sum of all roots $= -a$: $(1+i) + (1-i) + 2 = 4 = -a \\Rightarrow a = -4$.
*Step 2 (1 mark):* Sum of products of pairs $= b$: $(1+i)(1-i) + 2(1+i) + 2(1-i) = 2 + 2 + 2i + 2 - 2i = 6 = b$.
*Step 3 (1 mark):* $c = -4$ (found above). So $a = -4$, $b = 6$, $c = -4$.`),

  sq(`Let $P(z) = z^4 + az^3 + bz^2 + cz + d$ where $a, b, c, d \\in \\mathbb R$.

Given $P(z)$ has roots $z = i$, $z = 2 + i$, and the leading coefficient is $1$:

**a.** Write down the other two roots, justifying your answer. (2 marks)

**b.** Determine the polynomial $P(z)$ in expanded form. (4 marks)

**c.** State all values of $a$, $b$, $c$, $d$. (2 marks)`,
    8, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* By the conjugate root theorem (applied to real-coefficient $P$), $z = -i$ is also a root.
*Step 2 (1 mark):* Similarly $z = 2 - i$ is also a root, giving four roots $\\{i, -i, 2+i, 2-i\\}$.

**b. (4 marks)**
*Step 1 (1 mark):* Quadratic factor for $\\{i, -i\\}$: $(z - i)(z + i) = z^2 + 1$.
*Step 2 (1 mark):* Quadratic factor for $\\{2+i, 2-i\\}$: $(z - (2+i))(z - (2-i)) = z^2 - 4z + 5$.
*Step 3 (1 mark):* $P(z) = (z^2 + 1)(z^2 - 4z + 5)$.
*Step 4 (1 mark):* Expand: $z^4 - 4z^3 + 5z^2 + z^2 - 4z + 5 = z^4 - 4z^3 + 6z^2 - 4z + 5$.

**c. (2 marks)**
*Step 1 (1 mark):* Matching coefficients: $a = -4$, $b = 6$.
*Step 2 (1 mark):* $c = -4$, $d = 5$.`),

  sq(`Consider the polynomial $P(z) = z^4 + 2z^3 + 6z^2 + 2z + 5$, with all real coefficients.

**a.** Show that $z = i$ is a root of $P(z)$. (2 marks)

**b.** Hence find a real quadratic factor of $P(z)$. (2 marks)

**c.** Find the other quadratic factor by polynomial division. (3 marks)

**d.** Hence find all roots of $P(z) = 0$. (2 marks)`,
    9, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* $P(i) = i^4 + 2i^3 + 6i^2 + 2i + 5 = 1 - 2i - 6 + 2i + 5$.
*Step 2 (1 mark):* $= (1 - 6 + 5) + (-2i + 2i) = 0$. ✓

**b. (2 marks)**
*Step 1 (1 mark):* By the conjugate root theorem, $z = -i$ is also a root.
*Step 2 (1 mark):* So $(z - i)(z + i) = z^2 + 1$ is a real quadratic factor of $P(z)$.

**c. (3 marks)**
*Step 1 (1 mark):* Divide $P(z) = z^4 + 2z^3 + 6z^2 + 2z + 5$ by $z^2 + 1$.
*Step 2 (1 mark):* Quotient $= z^2 + 2z + 5$, remainder $= 0$. (Check: $(z^2 + 1)(z^2 + 2z + 5) = z^4 + 2z^3 + 5z^2 + z^2 + 2z + 5 = z^4 + 2z^3 + 6z^2 + 2z + 5$ ✓)
*Step 3 (1 mark):* So $P(z) = (z^2 + 1)(z^2 + 2z + 5)$.

**d. (2 marks)**
*Step 1 (1 mark):* $z^2 + 1 = 0 \\Rightarrow z = \\pm i$. Quadratic formula for $z^2 + 2z + 5 = 0$: $z = (-2 \\pm \\sqrt{4 - 20})/2 = -1 \\pm 2i$.
*Step 2 (1 mark):* All roots: $z = i, -i, -1 + 2i, -1 - 2i$.`),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer, extendedAnswer };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS to ${JSON_PATH}`,
);
