/**
 * Specialist: Discrete Mathematics — Number-Theoretic Proofs.
 * Tier: extended-fit → MCQ + SHORT + EXT_ANS.
 */

import * as fs from "fs";

const JSON_PATH = "scripts/output/qset-specialist-number-theoretic-proofs.json";

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
  subtopicSlugs: ["number-theoretic-proofs", ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: ["number-theoretic-proofs", ...sec],
});

// ─── 12 MCQ ─────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("\"$a \\mid b$\" formally means:",
    ["$a < b$", "$b/a$ is finite", "$\\exists k \\in \\mathbb{Z}$ with $b = ak$", "$a$ and $b$ share a factor"], "C", "EASY",
    "Definition: $a$ divides $b$ iff there exists an integer $k$ with $b = ak$. **Answer: C**"),
  m("\"$a \\equiv b \\pmod n$\" formally means:",
    ["$a$ and $b$ are both less than $n$", "$n \\mid (a - b)$", "$a - b = n$", "$a \\cdot b \\equiv 0 \\pmod n$"], "B", "EASY",
    "Definition: $a \\equiv b \\pmod n$ iff $n$ divides $a - b$, i.e., $n \\mid (a - b)$. **Answer: B**"),
  m("If $a$ is an odd integer, then $a^2 \\equiv$ ___ $\\pmod 4$:",
    ["$0$", "$1$", "$2$", "$3$"], "B", "MEDIUM",
    "Write $a = 2k + 1$. Then $a^2 = 4k^2 + 4k + 1 \\equiv 1 \\pmod 4$. **Answer: B**"),
  m("If $a$ is an even integer, then $a^2 \\equiv$ ___ $\\pmod 4$:",
    ["$0$", "$1$", "$2$", "$3$"], "A", "MEDIUM",
    "$a = 2k \\Rightarrow a^2 = 4k^2 \\equiv 0 \\pmod 4$. **Answer: A**"),
  m("Suppose $a, b \\in \\mathbb{Z}$ and $a \\mid b$. Which of the following is **always** true?",
    ["$a \\leq b$", "$a^2 \\mid b^2$", "$a + 1 \\mid b + 1$", "$a \\mid b + 1$"], "B", "MEDIUM",
    "If $b = ak$, then $b^2 = a^2 k^2$, so $a^2 \\mid b^2$. The others can fail (e.g. $a = -2, b = 4$ has $a < 0 < b$ but $a \\leq b$ still holds; however $a + 1 = -1 \\nmid 5 = b + 1$, etc.). **Answer: B**"),
  m("For every integer $n$, $n^2$ leaves remainder ___ modulo 3:",
    ["$0$ or $1$", "$0$ or $2$", "$1$ or $2$", "$0, 1$, or $2$"], "A", "MEDIUM",
    "Cases mod 3: if $n \\equiv 0$, $n^2 \\equiv 0$. If $n \\equiv 1$, $n^2 \\equiv 1$. If $n \\equiv 2$, $n^2 \\equiv 4 \\equiv 1$. So $n^2 \\bmod 3 \\in \\{0, 1\\}$. **Answer: A**"),
  m("Which of the following is a valid first line in proving that the product of two consecutive integers is even?",
    ["Let $n$ and $n + 1$ be two consecutive integers.", "Let $n$ be an even integer.", "Let $a, b$ be any two integers.", "Let $n$ and $m$ both be even."], "A", "EASY",
    "The hypothesis names two consecutive integers, written naturally as $n$ and $n + 1$. **Answer: A**"),
  m("Which is true about $\\gcd(a, b)$?",
    ["$\\gcd(a, b)$ divides both $a$ and $b$", "$\\gcd(a, b) > \\max(a, b)$", "$\\gcd(a, b)$ is always prime", "$\\gcd(a, b) = ab$ when $a, b$ are coprime"], "A", "MEDIUM",
    "By definition, $\\gcd(a, b)$ divides both $a$ and $b$. The others fail in general. **Answer: A**"),
  m("If $\\gcd(a, b) = 1$ (coprime) and $a \\mid bc$, then:",
    ["$a \\mid b$", "$a \\mid c$", "$a \\mid b + c$", "$a^2 \\mid bc$"], "B", "HARD",
    "Euclid's lemma: if $a \\mid bc$ and $\\gcd(a, b) = 1$, then $a \\mid c$. **Answer: B**"),
  m("The integer $5^n - 1$, for $n \\geq 1$, is always divisible by:",
    ["$2$", "$3$", "$4$", "$6$"], "C", "MEDIUM",
    "Since $5 \\equiv 1 \\pmod 4$, $5^n \\equiv 1 \\pmod 4$ for all $n$. So $4 \\mid (5^n - 1)$. **Answer: C**"),
  m("Suppose $p$ is prime and $p \\mid ab$. Then:",
    ["$p \\mid a$ or $p \\mid b$", "$p \\mid a + b$", "$p^2 \\mid ab$", "$\\gcd(p, ab) = 1$"], "A", "HARD",
    "Euclid's lemma for primes: $p \\mid ab$ implies $p \\mid a$ or $p \\mid b$. **Answer: A**"),
  m("Which expression is divisible by 8 for every integer $n$?",
    ["$n^2 + 1$", "$n(n + 1)(n + 2)$", "$n^2 - 1$ when $n$ is odd", "$n^3 - n$"], "C", "HARD",
    "If $n$ is odd, $n = 2k + 1$ and $n^2 - 1 = (2k+1)^2 - 1 = 4k^2 + 4k = 4k(k + 1)$. Since $k(k+1)$ is even, $n^2 - 1$ is divisible by 8. **Answer: C**"),
];

// ─── 8 SHORT_ANSWER ─────────────────────────────────────────────────────

const shortAnswer: FR[] = [
  sq("Prove that for every integer $n$, $n^2 - n$ is divisible by 2.", 2, "EASY",
    "*Step 1 (1 mark):* $n^2 - n = n(n - 1)$, a product of two consecutive integers.\n*Step 2 (1 mark):* Exactly one of $n, n - 1$ is even, so the product is divisible by 2."),
  sq("Prove that for every integer $n$, $n^3 - n$ is divisible by 6.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Factor: $n^3 - n = n(n - 1)(n + 1) = (n - 1)\\,n\\,(n + 1)$, a product of three consecutive integers.\n*Step 2 (1 mark):* Among three consecutive integers, one is divisible by 3, so $3 \\mid n^3 - n$.\n*Step 3 (1 mark):* Among three consecutive integers, at least one is even, so $2 \\mid n^3 - n$. Since $\\gcd(2, 3) = 1$, $6 \\mid n^3 - n$."),
  sq("Prove that the square of any odd integer is of the form $8k + 1$ for some integer $k$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Let $n = 2m + 1$ be odd. Then $n^2 = 4m^2 + 4m + 1 = 4m(m + 1) + 1$.\n*Step 2 (1 mark):* Since $m$ and $m + 1$ are consecutive integers, one of them is even, so $m(m + 1) = 2t$ for some integer $t$.\n*Step 3 (1 mark):* $n^2 = 4(2t) + 1 = 8t + 1$, i.e. of the form $8k + 1$."),
  sq("Prove that if $a \\equiv b \\pmod n$ and $c \\equiv d \\pmod n$, then $a + c \\equiv b + d \\pmod n$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $a \\equiv b \\pmod n$ means $a - b = nk$ for some integer $k$. Similarly $c - d = nl$ for some integer $l$.\n*Step 2 (1 mark):* $(a + c) - (b + d) = (a - b) + (c - d) = nk + nl = n(k + l)$.\n*Step 3 (1 mark):* $k + l \\in \\mathbb{Z}$, so $n \\mid ((a + c) - (b + d))$, hence $a + c \\equiv b + d \\pmod n$."),
  sq("Prove that for every integer $n$, $n^2 \\bmod 4 \\in \\{0, 1\\}$ (i.e. squares are never $\\equiv 2$ or $3 \\pmod 4$).", 3, "MEDIUM",
    "*Step 1 (1 mark):* Any integer is either even or odd.\n*Step 2 (1 mark):* If $n = 2k$ is even, $n^2 = 4k^2 \\equiv 0 \\pmod 4$.\n*Step 3 (1 mark):* If $n = 2k + 1$ is odd, $n^2 = 4k(k + 1) + 1 \\equiv 1 \\pmod 4$. So $n^2 \\bmod 4 \\in \\{0, 1\\}$."),
  sq("Prove that if $3 \\mid n$, then $3 \\mid n^2$.", 2, "EASY",
    "*Step 1 (1 mark):* If $3 \\mid n$ then $n = 3k$ for some integer $k$.\n*Step 2 (1 mark):* Then $n^2 = 9k^2 = 3(3k^2)$, so $3 \\mid n^2$."),
  sq("Prove that the sum of three consecutive odd integers is divisible by 3.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Three consecutive odd integers have the form $2k - 1, 2k + 1, 2k + 3$ for some integer $k$.\n*Step 2 (1 mark):* Sum: $(2k - 1) + (2k + 1) + (2k + 3) = 6k + 3$.\n*Step 3 (1 mark):* $6k + 3 = 3(2k + 1)$, divisible by 3."),
  sq("Let $p$ be an odd prime. Show that $p^2 \\equiv 1 \\pmod 8$.", 3, "HARD",
    "*Step 1 (1 mark):* Any odd prime $p$ is odd, so write $p = 2k + 1$ for some integer $k$.\n*Step 2 (1 mark):* $p^2 = 4k(k + 1) + 1$.\n*Step 3 (1 mark):* $k(k + 1)$ is a product of two consecutive integers, hence even. So $4k(k + 1)$ is divisible by 8. Thus $p^2 = 8m + 1$ for some integer $m$, i.e. $p^2 \\equiv 1 \\pmod 8$."),
];

// ─── 3 EXT_ANS ──────────────────────────────────────────────────────────

const extendedAnswer: FR[] = [
  sq(`Let $n$ be an integer.

**a.** Prove that if $n$ is odd, then $n^2 - 1$ is divisible by 8. (3 marks)

**b.** Hence prove that the product of two odd integers minus one, $ab - 1$, is divisible by 2 (but not necessarily 8). (2 marks)

**c.** Give an example of odd integers $a, b$ with $ab - 1$ divisible by exactly 2 (not 4). (2 marks)`,
    7, "HARD",
    `**a. (3 marks)**
*Step 1 (1 mark):* Let $n = 2k + 1$ odd. Then $n^2 - 1 = (2k + 1)^2 - 1 = 4k^2 + 4k = 4k(k + 1)$.
*Step 2 (1 mark):* $k(k + 1)$ is a product of two consecutive integers, so one of them is even — hence $k(k + 1)$ is even.
*Step 3 (1 mark):* Thus $4k(k + 1) = 4 \\cdot 2m = 8m$ for some integer $m$, so $8 \\mid n^2 - 1$.

**b. (2 marks)**
*Step 1 (1 mark):* Let $a = 2m + 1, b = 2n + 1$ odd. Then $ab = (2m + 1)(2n + 1) = 4mn + 2m + 2n + 1$.
*Step 2 (1 mark):* $ab - 1 = 4mn + 2m + 2n = 2(2mn + m + n)$, divisible by 2 but not necessarily by higher powers.

**c. (2 marks)**
*Step 1 (1 mark):* Take $a = 3, b = 5$.
*Step 2 (1 mark):* Then $ab - 1 = 15 - 1 = 14 = 2 \\cdot 7$, divisible by 2 but **not** by 4.`),

  sq(`**a.** Prove that for every integer $n$, exactly one of $n - 1$, $n$, $n + 1$ is divisible by 3. (3 marks)

**b.** Hence prove that $n^3 - n$ is divisible by 6 for every integer $n$. (3 marks)

**c.** Is it also true that $n^3 - n$ is divisible by 12 for every integer $n$? Justify with a proof or counterexample. (2 marks)`,
    8, "HARD",
    `**a. (3 marks)**
*Step 1 (1 mark):* By the division algorithm, $n \\equiv 0, 1,$ or $2 \\pmod 3$ for every integer $n$.
*Step 2 (1 mark):* If $n \\equiv 0$, then $3 \\mid n$. If $n \\equiv 1$, then $n - 1 \\equiv 0$, so $3 \\mid (n - 1)$. If $n \\equiv 2$, then $n + 1 \\equiv 0$, so $3 \\mid (n + 1)$.
*Step 3 (1 mark):* In each case, exactly one of $n - 1, n, n + 1$ is divisible by 3 (the other two have residues $\\not\\equiv 0$).

**b. (3 marks)**
*Step 1 (1 mark):* $n^3 - n = (n - 1)\\,n\\,(n + 1)$, three consecutive integers.
*Step 2 (1 mark):* By part **a**, one factor is divisible by 3. At least one of the three is even, so the product is divisible by 2.
*Step 3 (1 mark):* Since $\\gcd(2, 3) = 1$, the product is divisible by $2 \\cdot 3 = 6$.

**c. (2 marks)**
*Step 1 (1 mark):* Test $n = 2$: $n^3 - n = 8 - 2 = 6$, which is **not** divisible by 12.
*Step 2 (1 mark):* So the claim fails for $n = 2$; the answer is **no**.`),

  sq(`**a.** Prove that for any integer $n$, $n^2 \\bmod 5 \\in \\{0, 1, 4\\}$. (4 marks)

**b.** Hence prove that no integer $n$ satisfies $n^2 \\equiv 2 \\pmod 5$ or $n^2 \\equiv 3 \\pmod 5$. (2 marks)

**c.** Find all integers $n$ with $0 \\leq n < 5$ such that $n^2 \\equiv 4 \\pmod 5$. (2 marks)`,
    8, "HARD",
    `**a. (4 marks)**
*Step 1 (1 mark):* Any integer $n$ satisfies $n \\equiv 0, 1, 2, 3,$ or $4 \\pmod 5$ by the division algorithm.
*Step 2 (1 mark):* $0^2 \\equiv 0, 1^2 \\equiv 1, 2^2 \\equiv 4, 3^2 \\equiv 9 \\equiv 4, 4^2 \\equiv 16 \\equiv 1$ all $\\pmod 5$.
*Step 3 (1 mark):* So $n^2 \\bmod 5$ is one of $\\{0, 1, 4, 4, 1\\}$.
*Step 4 (1 mark):* As a set, $n^2 \\bmod 5 \\in \\{0, 1, 4\\}$ for every integer $n$.

**b. (2 marks)**
*Step 1 (1 mark):* From part **a**, $n^2 \\bmod 5$ only takes values $0, 1, 4$.
*Step 2 (1 mark):* So $n^2 \\equiv 2 \\pmod 5$ and $n^2 \\equiv 3 \\pmod 5$ are impossible.

**c. (2 marks)**
*Step 1 (1 mark):* From part **a**, $n^2 \\equiv 4 \\pmod 5$ iff $n \\equiv 2$ or $n \\equiv 3 \\pmod 5$ (i.e., $n \\equiv \\pm 2$).
*Step 2 (1 mark):* With $0 \\leq n < 5$: $n \\in \\{2, 3\\}$.`),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer, extendedAnswer };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS to ${JSON_PATH}`,
);
