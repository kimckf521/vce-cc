/**
 * Specialist: Discrete Mathematics — Direct Proof.
 * Tier: extended-fit → MCQ + SHORT + EXT_ANS.
 */

import * as fs from "fs";

const JSON_PATH = "scripts/output/qset-specialist-direct-proof.json";

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
  subtopicSlugs: ["direct-proof", ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: ["direct-proof", ...sec],
});

// ─── 12 MCQ ─────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("To give a direct proof of \"$P \\Rightarrow Q$\", you should:",
    ["Assume $\\neg Q$ and derive $\\neg P$", "Assume $P$ and derive $Q$", "Assume $\\neg P \\land Q$ and derive a contradiction", "Show a counterexample"], "B", "EASY",
    "A direct proof of $P \\Rightarrow Q$ assumes the hypothesis $P$ and uses logical/algebraic steps to derive $Q$. **Answer: B**"),
  m("To directly prove \"If $n$ is even, then $n^2$ is even\", a typical opening line is:",
    ["Suppose $n^2$ is even...", "Suppose $n$ is odd...", "Let $n = 2k$ for some integer $k$...", "Assume $n^2$ is odd..."], "C", "EASY",
    "Using the definition of even: $n$ even means $n = 2k$. Then build $n^2$ from there. **Answer: C**"),
  m("Suppose $a$ and $b$ are even integers. In a direct proof that $a + b$ is even, the next step after writing $a = 2m$ and $b = 2n$ is:",
    ["$a + b = 2mn$", "$a + b = 2(m + n)$", "$a + b = 2m + 2n + 1$", "$a + b = m + n$"], "B", "EASY",
    "$a + b = 2m + 2n = 2(m + n)$, which is even. **Answer: B**"),
  m("To prove that the product of two odd integers is odd directly, you would set:",
    ["$a = 2m$ and $b = 2n$", "$a = 2m + 1$ and $b = 2n + 1$", "$a = 2m - 1$ and $b = 2n$", "$ab = $ even"], "B", "EASY",
    "Definition of odd: $a = 2m + 1$ and $b = 2n + 1$ for integers $m, n$. Then $ab = (2m+1)(2n+1) = 2(2mn + m + n) + 1$, odd. **Answer: B**"),
  m("In a direct proof of \"If $a$ and $b$ are rational, then $a + b$ is rational\", the first step is:",
    ["Write $a + b = \\sqrt 2$", "Write $a = p/q$ and $b = r/s$ with $p, r \\in \\mathbb{Z}$, $q, s \\in \\mathbb{Z}_{\\neq 0}$", "Assume $a + b$ is irrational", "Apply contrapositive"], "B", "MEDIUM",
    "Use the definition of rational: each rational is a ratio of integers with nonzero denominator. Then sum them. **Answer: B**"),
  m("If $n$ is an integer, then $5n + 3$ is:",
    ["Always odd", "Always even", "Even iff $n$ is odd", "Even iff $n$ is even"], "C", "MEDIUM",
    "$5n + 3$ has the same parity as $n + 1$, so it is even when $n$ is odd and odd when $n$ is even. **Answer: C**"),
  m("To directly prove \"For any integer $n$, $n^2 + n$ is even\", which factorisation is useful?",
    ["$n^2 + n = n(n + 1)$", "$n^2 + n = (n + 1)^2 - 1$", "$n^2 + n = n^2(1 + 1/n)$", "$n^2 + n = n(n - 1)$"], "A", "MEDIUM",
    "$n^2 + n = n(n + 1)$ is the product of two consecutive integers, so one of them is even, hence so is the product. **Answer: A**"),
  m("Which is the conclusion of a direct proof that \"if $a$ divides $b$ and $a$ divides $c$, then $a$ divides $b + c$\"?",
    ["$a \\mid b + c$", "$b + c$ is even", "$a < b + c$", "$\\gcd(b, c) = a$"], "A", "MEDIUM",
    "We want to conclude $a \\mid (b + c)$. With $b = ak$ and $c = al$, $b + c = a(k + l)$, so $a \\mid (b + c)$. **Answer: A**"),
  m("To prove \"the sum of any three consecutive integers is divisible by 3\" directly, write the integers as:",
    ["$n, n, n$", "$n - 1, n, n + 1$", "$2n, 2n + 1, 2n + 2$", "$n, n + 2, n + 4$"], "B", "MEDIUM",
    "Three consecutive integers can be written $n - 1, n, n + 1$, summing to $3n$, divisible by 3. **Answer: B**"),
  m("If $a$ and $b$ are odd integers, which of the following must be true?",
    ["$a + b$ is odd", "$ab$ is even", "$a + b$ is even", "$a^2 - b^2$ is odd"], "C", "MEDIUM",
    "Odd + odd = even ($a + b = 2m + 1 + 2n + 1 = 2(m + n + 1)$). So $a + b$ is even. **Answer: C**"),
  m("In a direct proof, the standard step \"by definition of divisibility\" is justified because $a \\mid b$ means:",
    ["$b/a$ is finite", "There exists an integer $k$ with $b = ak$", "$a$ and $b$ share a factor", "$a < b$"], "B", "HARD",
    "Definition: $a \\mid b$ iff $\\exists k \\in \\mathbb{Z}, b = ak$. Direct proofs use this to rewrite the divisibility hypothesis algebraically. **Answer: B**"),
  m("Which of the following is **not** a valid step in a direct proof of a universal statement?",
    ["Use the hypothesis", "Apply algebraic manipulation", "Cite a previously proven result", "Verify the statement for one example and conclude"], "D", "HARD",
    "Checking a single example is not a valid proof of a universal statement (it might be an illustration, but not a proof). The other steps are standard. **Answer: D**"),
];

// ─── 8 SHORT_ANSWER ─────────────────────────────────────────────────────

const shortAnswer: FR[] = [
  sq("Prove directly that if $n$ is an even integer, then $n^2$ is even.", 2, "EASY",
    "*Step 1 (1 mark):* Assume $n$ is even. By definition, $n = 2k$ for some integer $k$.\n*Step 2 (1 mark):* Then $n^2 = (2k)^2 = 4k^2 = 2(2k^2)$. Since $2k^2 \\in \\mathbb{Z}$, $n^2$ is divisible by 2, hence even."),
  sq("Prove directly that the sum of two odd integers is even.", 2, "EASY",
    "*Step 1 (1 mark):* Let $a, b$ be odd integers. Then $a = 2m + 1$ and $b = 2n + 1$ for some integers $m, n$.\n*Step 2 (1 mark):* $a + b = (2m + 1) + (2n + 1) = 2m + 2n + 2 = 2(m + n + 1)$, which is even."),
  sq("Prove directly that the product of two odd integers is odd.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Let $a = 2m + 1$, $b = 2n + 1$ for integers $m, n$.\n*Step 2 (1 mark):* $ab = (2m + 1)(2n + 1) = 4mn + 2m + 2n + 1$.\n*Step 3 (1 mark):* Factor out: $ab = 2(2mn + m + n) + 1$, which has the form $2k + 1$. Hence $ab$ is odd."),
  sq("Prove directly that for any integer $n$, the integer $n^2 + n$ is even.", 2, "MEDIUM",
    "*Step 1 (1 mark):* $n^2 + n = n(n + 1)$, a product of two consecutive integers.\n*Step 2 (1 mark):* Among any two consecutive integers, one is even, so the product is even."),
  sq("Prove directly that if $a, b \\in \\mathbb{Q}$, then $a + b \\in \\mathbb{Q}$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Suppose $a, b \\in \\mathbb{Q}$. By definition, $a = p/q$ and $b = r/s$ for integers $p, q, r, s$ with $q, s \\neq 0$.\n*Step 2 (1 mark):* Then $a + b = ps/(qs) + qr/(qs) = (ps + qr)/(qs)$.\n*Step 3 (1 mark):* The numerator $ps + qr$ is an integer, and the denominator $qs$ is a nonzero integer. Hence $a + b$ is rational."),
  sq("Prove directly: if $n$ is an integer, then $n^3 - n$ is divisible by 3.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Factor: $n^3 - n = n(n^2 - 1) = (n - 1)\\,n\\,(n + 1)$.\n*Step 2 (1 mark):* This is the product of three consecutive integers.\n*Step 3 (1 mark):* Among any three consecutive integers, exactly one is divisible by 3, hence so is the product. Therefore $3 \\mid (n^3 - n)$."),
  sq("Prove directly that the sum of any five consecutive integers is divisible by 5.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Five consecutive integers can be written $n - 2, n - 1, n, n + 1, n + 2$ for some integer $n$.\n*Step 2 (1 mark):* Their sum is $(n - 2) + (n - 1) + n + (n + 1) + (n + 2) = 5n$.\n*Step 3 (1 mark):* $5n$ is a multiple of 5, so the sum is divisible by 5."),
  sq("Prove directly: if $a \\mid b$ and $a \\mid c$ (with $a, b, c \\in \\mathbb{Z}$), then $a \\mid (mb + nc)$ for any integers $m, n$.", 3, "HARD",
    "*Step 1 (1 mark):* Since $a \\mid b$ there exists $k \\in \\mathbb{Z}$ with $b = ak$. Similarly $c = al$ for some $l \\in \\mathbb{Z}$.\n*Step 2 (1 mark):* Then $mb + nc = m(ak) + n(al) = a(mk + nl)$.\n*Step 3 (1 mark):* $mk + nl \\in \\mathbb{Z}$, so $a \\mid (mb + nc)$ by definition of divisibility."),
];

// ─── 3 EXT_ANS ──────────────────────────────────────────────────────────

const extendedAnswer: FR[] = [
  sq(`Let $n$ be an integer.

**a.** Prove directly that if $n$ is odd, then $n^2$ is odd. (3 marks)

**b.** Hence prove directly that if $n^2$ is odd then $n$ is odd is *not* established by part **a**, and explain what additional reasoning is required. (2 marks)

**c.** Prove that for any integer $n$, exactly one of $n$ and $n + 1$ is even. (2 marks)`,
    7, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* Assume $n$ is odd. Then $n = 2k + 1$ for some integer $k$.
*Step 2 (1 mark):* $n^2 = (2k + 1)^2 = 4k^2 + 4k + 1$.
*Step 3 (1 mark):* $n^2 = 2(2k^2 + 2k) + 1$, of the form $2m + 1$. So $n^2$ is odd.

**b. (2 marks)**
*Step 1 (1 mark):* Part **a** proves $n$ odd $\\Rightarrow$ $n^2$ odd. The statement \"$n^2$ odd $\\Rightarrow$ $n$ odd\" is the *converse*.
*Step 2 (1 mark):* A direct proof of the converse needs a separate argument (e.g. via the contrapositive: if $n$ is even, then $n^2 = (2k)^2 = 4k^2$ is even, so $n^2$ odd forces $n$ odd).

**c. (2 marks)**
*Step 1 (1 mark):* For any integer $n$, either $n = 2k$ (even) or $n = 2k + 1$ (odd) for some integer $k$. These cases are mutually exclusive.
*Step 2 (1 mark):* If $n$ is even, $n + 1 = 2k + 1$ is odd; if $n$ is odd, $n + 1 = 2k + 2 = 2(k+1)$ is even. Exactly one of $n, n + 1$ is even.`),

  sq(`**a.** Prove directly that for all integers $n$, the integer $n(n + 1)(n + 2)$ is divisible by 6. (4 marks)

**b.** Use the result of part **a** to show that for any integer $n$, $n^3 + 3n^2 + 2n$ is divisible by 6. (3 marks)`,
    7, "HARD",
    `**a. (4 marks)**
*Step 1 (1 mark):* $n(n + 1)(n + 2)$ is the product of three consecutive integers.
*Step 2 (1 mark):* Among any three consecutive integers, at least one is divisible by 2 (since every second integer is even). So $2 \\mid n(n+1)(n+2)$.
*Step 3 (1 mark):* Similarly, among any three consecutive integers, exactly one is divisible by 3. So $3 \\mid n(n+1)(n+2)$.
*Step 4 (1 mark):* Since $\\gcd(2, 3) = 1$ and both divide the product, $6 \\mid n(n + 1)(n + 2)$.

**b. (3 marks)**
*Step 1 (1 mark):* Factor: $n^3 + 3n^2 + 2n = n(n^2 + 3n + 2) = n(n + 1)(n + 2)$.
*Step 2 (1 mark):* By part **a**, $6 \\mid n(n + 1)(n + 2)$.
*Step 3 (1 mark):* Hence $6 \\mid (n^3 + 3n^2 + 2n)$.`),

  sq(`**a.** Prove directly that if $a$ and $b$ are integers with $a \\mid b$ and $b \\mid c$, then $a \\mid c$. (3 marks)

**b.** Hence prove that for integers $a, b$, if $a \\mid b$ and $a \\mid (b + c)$, then $a \\mid c$. (3 marks)

**c.** Give an example of integers $a, b, c$ with $a \\mid bc$ but $a \\nmid b$ and $a \\nmid c$. (2 marks)`,
    8, "HARD",
    `**a. (3 marks)**
*Step 1 (1 mark):* $a \\mid b$ means $b = ak$ for some integer $k$.
*Step 2 (1 mark):* $b \\mid c$ means $c = bl$ for some integer $l$.
*Step 3 (1 mark):* Substituting: $c = (ak)l = a(kl)$ with $kl \\in \\mathbb{Z}$. Hence $a \\mid c$.

**b. (3 marks)**
*Step 1 (1 mark):* $a \\mid b$ gives $b = ak$ for some $k \\in \\mathbb{Z}$. $a \\mid (b + c)$ gives $b + c = al$ for some $l \\in \\mathbb{Z}$.
*Step 2 (1 mark):* Then $c = (b + c) - b = al - ak = a(l - k)$.
*Step 3 (1 mark):* $l - k \\in \\mathbb{Z}$, so $a \\mid c$.

**c. (2 marks)**
*Step 1 (1 mark):* Take $a = 6, b = 4, c = 3$.
*Step 2 (1 mark):* Then $bc = 12$ and $6 \\mid 12$, but $6 \\nmid 4$ and $6 \\nmid 3$. So divisibility of a product does not, in general, imply divisibility of either factor.`),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer, extendedAnswer };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS to ${JSON_PATH}`,
);
