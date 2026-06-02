/**
 * Specialist: Discrete Mathematics — Counterexamples.
 * Tier: core-drill → MCQ + SHORT only.
 */

import * as fs from "fs";

const JSON_PATH = "scripts/output/qset-specialist-counterexamples.json";

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
  subtopicSlugs: ["counterexamples", ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: ["counterexamples", ...sec],
});

// ─── 12 MCQ ─────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("Which of the following is a counterexample to the claim \"For all integers $n$, $n^2 > n$\"?",
    ["$n = 2$", "$n = 1$", "$n = 3$", "$n = -2$"], "B", "EASY",
    "A counterexample makes the statement false. At $n = 1$: $1^2 = 1$, which is not greater than $1$. The other listed values satisfy $n^2 > n$. **Answer: B**"),
  m("A counterexample to the claim \"Every prime number is odd\" is:",
    ["$3$", "$5$", "$2$", "$7$"], "C", "EASY",
    "The prime $2$ is even, so it is the only counterexample to \"every prime is odd\". **Answer: C**"),
  m("To disprove the statement \"For all real $x$, $x^2 \\geq x$\", which value works?",
    ["$x = 0$", "$x = 1$", "$x = 1/2$", "$x = 2$"], "C", "EASY",
    "At $x = 1/2$: $x^2 = 1/4 < 1/2 = x$. So $x = 1/2$ is a counterexample. **Answer: C**"),
  m("Which value disproves the claim \"If $a^2 = b^2$, then $a = b$\"?",
    ["$a = b = 0$", "$a = 2, b = 2$", "$a = -3, b = 3$", "$a = 1, b = 1$"], "C", "EASY",
    "$(-3)^2 = 9 = 3^2$ but $-3 \\neq 3$, so $a = -3, b = 3$ disproves the claim. **Answer: C**"),
  m("A counterexample to \"For every integer $n$, $n^2 + n + 41$ is prime\" is:",
    ["$n = 1$", "$n = 5$", "$n = 40$", "$n = 10$"], "C", "MEDIUM",
    "At $n = 40$: $n^2 + n + 41 = 1600 + 40 + 41 = 1681 = 41^2$, which is not prime. **Answer: C**"),
  m("Which of the following is a counterexample to \"If $n$ is a positive integer, then $2n + 1$ is prime\"?",
    ["$n = 1$ (gives $3$)", "$n = 2$ (gives $5$)", "$n = 4$ (gives $9$)", "$n = 6$ (gives $13$)"], "C", "MEDIUM",
    "At $n = 4$: $2n + 1 = 9 = 3 \\times 3$, not prime. **Answer: C**"),
  m("Which counterexample disproves \"For all real $x$ and $y$, $\\sqrt{x^2 + y^2} = x + y$\"?",
    ["$x = 0, y = 0$", "$x = 1, y = 0$", "$x = 1, y = 1$", "$x = 3, y = 4$"], "C", "MEDIUM",
    "At $x = y = 1$: $\\sqrt{1+1} = \\sqrt 2 \\approx 1.41 \\neq 2 = x + y$. **Answer: C**"),
  m("A counterexample to \"$n!$ is odd for all positive integers $n$\" is:",
    ["$n = 1$", "$n = 2$", "$n = 0$", "$n = 3$ — and only $n=3$"], "B", "EASY",
    "At $n = 2$: $n! = 2$, which is even. **Answer: B**"),
  m("To disprove \"If $a$ and $b$ are irrational, then $a + b$ is irrational\", which works?",
    ["$a = \\sqrt 2, b = \\sqrt 3$", "$a = \\pi, b = e$", "$a = \\sqrt 2, b = -\\sqrt 2$", "$a = \\sqrt 2, b = 2$"], "C", "MEDIUM",
    "Take $a = \\sqrt 2$, $b = -\\sqrt 2$ (both irrational). Then $a + b = 0$, which is rational. **Answer: C**"),
  m("Which value is a counterexample to \"For all integers $n \\geq 1$, the integer $n^2 - n + 11$ is prime\"?",
    ["$n = 1$", "$n = 5$", "$n = 10$", "$n = 11$"], "D", "HARD",
    "At $n = 11$: $n^2 - n + 11 = 121 - 11 + 11 = 121 = 11^2$, not prime. **Answer: D**"),
  m("A counterexample to \"For all positive integers $n$, $n^3 - n$ is divisible by $6$\" is:",
    ["$n = 2$", "$n = 3$", "$n = 4$", "There is no counterexample"], "D", "HARD",
    "For every integer $n$: $n^3 - n = n(n-1)(n+1)$ is a product of three consecutive integers, divisible by $2 \\cdot 3 = 6$. The statement is true, so no counterexample exists. **Answer: D**"),
  m("If a claim is universal (\"for all $x \\in S$, $P(x)$\"), the minimum evidence to refute it is:",
    ["A proof", "Two examples that satisfy $P$", "One example $x \\in S$ with $\\neg P(x)$", "Showing $\\neg P(x)$ for half of $S$"], "C", "EASY",
    "A single counterexample — one $x \\in S$ with $\\neg P(x)$ — suffices to disprove a universal statement. **Answer: C**"),
];

// ─── 8 SHORT_ANSWER ─────────────────────────────────────────────────────

const shortAnswer: FR[] = [
  sq("Disprove the statement: \"For all real $x$, $x^2 > x$\" by giving a counterexample and justifying it.", 2, "EASY",
    "*Step 1 (1 mark):* Choose $x = 1/2$.\n*Step 2 (1 mark):* Then $x^2 = 1/4 < 1/2 = x$, so the statement fails. The value $x = 1/2$ is a counterexample."),
  sq("Show that the statement \"Every odd integer is prime\" is false by giving two distinct counterexamples.", 2, "EASY",
    "*Step 1 (1 mark):* $n = 9$ is odd but $9 = 3 \\times 3$, not prime.\n*Step 2 (1 mark):* $n = 15$ is odd but $15 = 3 \\times 5$, not prime. Both disprove the universal claim."),
  sq("Disprove: \"For all integers $a, b$, if $a \\mid b^2$ then $a \\mid b$.\"", 2, "MEDIUM",
    "*Step 1 (1 mark):* Take $a = 4$, $b = 2$. Then $b^2 = 4$ and $4 \\mid 4$.\n*Step 2 (1 mark):* But $4 \\nmid 2$, so $a \\mid b^2$ does **not** imply $a \\mid b$. Counterexample: $(a, b) = (4, 2)$."),
  sq("Find a counterexample to: \"For all $a, b \\in \\mathbb{R}$, $(a + b)^2 = a^2 + b^2$.\"", 2, "EASY",
    "*Step 1 (1 mark):* Take $a = 1, b = 1$.\n*Step 2 (1 mark):* Then $(a+b)^2 = 4$ but $a^2 + b^2 = 2$. So $4 \\neq 2$ and the claim is false."),
  sq("The statement \"For every $n \\in \\mathbb{N}$, $n^2 + n + 41$ is prime\" looks true for small $n$. Find a counterexample and explain.", 3, "HARD",
    "*Step 1 (1 mark):* The expression equals a prime for $n = 0, 1, 2, \\dots, 39$. To break it, look for a value where the formula is divisible by $41$.\n*Step 2 (1 mark):* At $n = 40$: $40^2 + 40 + 41 = 1600 + 40 + 41 = 1681$.\n*Step 3 (1 mark):* $1681 = 41 \\times 41$, which is composite. Counterexample: $n = 40$."),
  sq("Disprove: \"For all real $x, y$, if $x^2 = y^2$, then $x = y$.\" Justify your counterexample.", 2, "MEDIUM",
    "*Step 1 (1 mark):* Take $x = 1, y = -1$. Both squared give $1$, so $x^2 = y^2$.\n*Step 2 (1 mark):* But $x = 1 \\neq -1 = y$, disproving the implication."),
  sq("Find a counterexample to: \"For all $a, b \\in \\mathbb{Q}$ with $a < b$, there exists $c \\in \\mathbb{Z}$ with $a < c < b$.\"", 3, "MEDIUM",
    "*Step 1 (1 mark):* The claim requires an integer strictly between any two rationals. Choose two rationals very close together.\n*Step 2 (1 mark):* Take $a = 1/4, b = 1/2$. The integers do not fall strictly between them.\n*Step 3 (1 mark):* So no $c \\in \\mathbb{Z}$ satisfies $1/4 < c < 1/2$. Counterexample: $(a, b) = (1/4, 1/2)$."),
  sq("Disprove: \"For all positive integers $n$, $n!$ is greater than $2^n$.\" Find the smallest counterexample.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Test small $n$. $n = 1$: $1 < 2$ — fails. $n = 2$: $2 < 4$ — fails. $n = 3$: $6 < 8$ — fails.\n*Step 2 (1 mark):* So the claim is already false at $n = 1$.\n*Step 3 (1 mark):* Smallest counterexample is $n = 1$ since $1! = 1 < 2^1 = 2$."),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT to ${JSON_PATH}`,
);
