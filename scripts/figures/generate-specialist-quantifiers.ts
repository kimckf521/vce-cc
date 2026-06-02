/**
 * Specialist: Discrete Mathematics — Quantifiers.
 * Tier: core-drill → MCQ + SHORT only.
 */

import * as fs from "fs";

const JSON_PATH = "scripts/output/qset-specialist-quantifiers.json";

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
  subtopicSlugs: ["quantifiers", ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: ["quantifiers", ...sec],
});

// ─── 12 MCQ ─────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("The symbol $\\forall$ means:",
    ["There exists", "For all", "Such that", "Implies"], "B", "EASY",
    "$\\forall$ is the universal quantifier, meaning \"for all\". **Answer: B**"),
  m("The symbol $\\exists$ means:",
    ["For all", "There exists", "Not equal", "Element of"], "B", "EASY",
    "$\\exists$ is the existential quantifier, meaning \"there exists\". **Answer: B**"),
  m("\"$\\forall x \\in \\mathbb{R}, x^2 \\geq 0$\" reads as:",
    ["There exists a real $x$ with $x^2 \\geq 0$", "For all real $x$, $x^2 \\geq 0$", "Some real number squared is non-negative", "$x^2 \\geq 0$ for $x = 0$ only"], "B", "EASY",
    "\"$\\forall x \\in \\mathbb{R}$\" is read as \"for all real $x$\". **Answer: B**"),
  m("\"$\\exists n \\in \\mathbb{Z}, n^2 = 4$\" reads as:",
    ["For every integer $n$, $n^2 = 4$", "There exists an integer $n$ with $n^2 = 4$", "All integers $n$ satisfy $n^2 = 4$", "$n^2 = 4$ has no integer solution"], "B", "EASY",
    "\"$\\exists n \\in \\mathbb{Z}$\" means \"there exists an integer $n$\". **Answer: B**"),
  m("The negation of $\\forall x, P(x)$ is:",
    ["$\\forall x, \\neg P(x)$", "$\\exists x, \\neg P(x)$", "$\\exists x, P(x)$", "$\\neg \\exists x, P(x)$"], "B", "MEDIUM",
    "Rule: $\\neg(\\forall x, P(x)) \\equiv \\exists x, \\neg P(x)$. **Answer: B**"),
  m("The negation of $\\exists x, P(x)$ is:",
    ["$\\forall x, P(x)$", "$\\exists x, \\neg P(x)$", "$\\forall x, \\neg P(x)$", "$\\neg \\forall x, P(x)$"], "C", "MEDIUM",
    "Rule: $\\neg(\\exists x, P(x)) \\equiv \\forall x, \\neg P(x)$. **Answer: C**"),
  m("The negation of \"All squares are rectangles\" is:",
    ["No square is a rectangle", "All non-squares are non-rectangles", "Some square is not a rectangle", "Some non-square is a rectangle"], "C", "MEDIUM",
    "Negate $\\forall x, P(x)$ as $\\exists x, \\neg P(x)$ — \"there exists a square that is not a rectangle\". **Answer: C**"),
  m("The negation of \"$\\forall x \\in \\mathbb{R}, x^2 > 0$\" is:",
    ["$\\forall x \\in \\mathbb{R}, x^2 \\leq 0$", "$\\exists x \\in \\mathbb{R}, x^2 \\leq 0$", "$\\exists x \\in \\mathbb{R}, x^2 \\geq 0$", "$\\forall x \\in \\mathbb{R}, x^2 < 0$"], "B", "MEDIUM",
    "Negation: $\\exists x \\in \\mathbb{R}, \\neg(x^2 > 0) \\equiv \\exists x, x^2 \\leq 0$. (And $x = 0$ confirms the original is false.) **Answer: B**"),
  m("Which statement is **true**?",
    ["$\\forall n \\in \\mathbb{N}, n^2 \\geq n$", "$\\forall x \\in \\mathbb{R}, x^2 > x$", "$\\exists x \\in \\mathbb{R}, x^2 < 0$", "$\\forall n \\in \\mathbb{Z}, n > 0$"], "A", "MEDIUM",
    "For all natural numbers $n$ (with $\\mathbb{N} = \\{1, 2, 3, \\ldots\\}$ or including $0$), $n^2 \\geq n$. **Answer: A**"),
  m("Negate the statement $\\forall \\varepsilon > 0, \\exists \\delta > 0, P(\\varepsilon, \\delta)$:",
    ["$\\exists \\varepsilon > 0, \\forall \\delta > 0, \\neg P(\\varepsilon, \\delta)$", "$\\forall \\varepsilon > 0, \\exists \\delta > 0, \\neg P(\\varepsilon, \\delta)$", "$\\exists \\varepsilon > 0, \\exists \\delta > 0, \\neg P$", "$\\forall \\delta > 0, \\exists \\varepsilon > 0, P$"], "A", "HARD",
    "Flip every quantifier and negate the inner statement: $\\exists \\varepsilon > 0, \\forall \\delta > 0, \\neg P$. **Answer: A**"),
  m("The statement \"$\\exists !\\,n \\in \\mathbb{Z}, n^2 = 9$\" means:",
    ["There is at least one such $n$", "There is no such $n$", "There is exactly one such $n$", "There are exactly nine such $n$"], "C", "HARD",
    "$\\exists !\\,x$ denotes \"there exists a **unique** $x$\". The statement here is false because both $n = 3$ and $n = -3$ work, but the symbol means \"exactly one\". **Answer: C**"),
  m("Which is the negation of \"$\\exists n \\in \\mathbb{Z}, n^2 < 0$\"?",
    ["$\\forall n \\in \\mathbb{Z}, n^2 \\geq 0$", "$\\exists n \\in \\mathbb{Z}, n^2 \\geq 0$", "$\\forall n \\in \\mathbb{Z}, n^2 < 0$", "$\\exists n \\in \\mathbb{Z}, n^2 > 0$"], "A", "MEDIUM",
    "Negate by swapping $\\exists$ to $\\forall$ and negating the body: $\\forall n \\in \\mathbb{Z}, n^2 \\geq 0$. **Answer: A**"),
];

// ─── 8 SHORT_ANSWER ─────────────────────────────────────────────────────

const shortAnswer: FR[] = [
  sq("Write the statement \"Every real number has a non-negative square\" using formal quantifier notation.", 2, "EASY",
    "*Step 1 (1 mark):* \"Every real number\" -> $\\forall x \\in \\mathbb{R}$.\n*Step 2 (1 mark):* \"has a non-negative square\" -> $x^2 \\geq 0$. Full statement: $\\forall x \\in \\mathbb{R}, x^2 \\geq 0$."),
  sq("Negate the statement \"$\\forall n \\in \\mathbb{N}, n + 1 > n^2$\" and decide whether the original or its negation is true.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Negation: $\\exists n \\in \\mathbb{N}, n + 1 \\leq n^2$.\n*Step 2 (1 mark):* Test $n = 2$: $n + 1 = 3, n^2 = 4$, so $3 \\leq 4$. The negation holds at $n = 2$.\n*Step 3 (1 mark):* The negation is **true**; the original is **false**."),
  sq("Translate to plain English and decide whether it is true: $\\exists x \\in \\mathbb{R}, \\forall y \\in \\mathbb{R}, x + y = y$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* English: \"There exists a real $x$ such that for every real $y$, $x + y = y$.\"\n*Step 2 (1 mark):* This says \"there is an additive identity in $\\mathbb{R}$\".\n*Step 3 (1 mark):* Take $x = 0$: $0 + y = y$ for every $y$, so the statement is **true**."),
  sq("Decide whether the order of quantifiers matters: is $\\forall x \\in \\mathbb{R}, \\exists y \\in \\mathbb{R}, y > x$ logically equivalent to $\\exists y \\in \\mathbb{R}, \\forall x \\in \\mathbb{R}, y > x$? Justify.", 3, "HARD",
    "*Step 1 (1 mark):* First statement: for every real $x$, we can find some $y$ (depending on $x$) with $y > x$. True (take $y = x + 1$).\n*Step 2 (1 mark):* Second statement: there is a single $y$ greater than every real $x$. False — no real number exceeds every real number.\n*Step 3 (1 mark):* They are not logically equivalent. **Order of quantifiers matters.**"),
  sq("Negate the statement \"$\\forall x > 0, \\exists n \\in \\mathbb{N}, n x > 1$\" and decide the truth value of each.", 3, "HARD",
    "*Step 1 (1 mark):* Negation: $\\exists x > 0, \\forall n \\in \\mathbb{N}, n x \\leq 1$.\n*Step 2 (1 mark):* The original is the Archimedean property — true.\n*Step 3 (1 mark):* So the negation is false."),
  sq("Translate \"There is no integer between $0$ and $1$\" into quantifier notation, then decide its truth value.", 2, "MEDIUM",
    "*Step 1 (1 mark):* $\\neg \\exists n \\in \\mathbb{Z}, 0 < n < 1$, equivalently $\\forall n \\in \\mathbb{Z}, \\neg(0 < n < 1)$.\n*Step 2 (1 mark):* The only integers near this range are $0$ and $1$, and neither satisfies $0 < n < 1$ strictly. The statement is **true**."),
  sq("State the negation of: \"Every prime number greater than 2 is odd.\" Express the negation symbolically using quantifiers.", 2, "MEDIUM",
    "*Step 1 (1 mark):* Symbolically the original is $\\forall p \\in \\mathbb{P}, (p > 2 \\Rightarrow p \\text{ is odd})$.\n*Step 2 (1 mark):* Negation: $\\exists p \\in \\mathbb{P}, (p > 2 \\land p \\text{ is even})$. (\"There exists a prime greater than 2 that is even.\")"),
  sq("Decide the truth value of $\\forall a, b \\in \\mathbb{R}, (a^2 = b^2 \\Rightarrow a = b)$. Justify by giving a counterexample if false.", 2, "EASY",
    "*Step 1 (1 mark):* Take $a = 1, b = -1$: $a^2 = b^2 = 1$ but $a \\neq b$.\n*Step 2 (1 mark):* So the statement is **false**; the counterexample $(1, -1)$ disproves it."),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT to ${JSON_PATH}`,
);
