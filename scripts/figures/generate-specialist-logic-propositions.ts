/**
 * Specialist: Discrete Mathematics — Logic and Propositions.
 * Tier: core-drill → MCQ + SHORT only.
 */

import * as fs from "fs";

const JSON_PATH = "scripts/output/qset-specialist-logic-propositions.json";

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
  subtopicSlugs: ["logic-and-propositions", ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: ["logic-and-propositions", ...sec],
});

// ─── 12 MCQ ─────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("Which of the following is a proposition?",
    ["What time is it?", "Open the door.", "$3 + 5 = 8$.", "Hello, world!"], "C", "EASY",
    "A proposition is a declarative statement that is either true or false. \"$3 + 5 = 8$\" is true, hence a proposition. The others are a question, command, and greeting. **Answer: C**"),
  m("The negation of the proposition \"$5 > 3$\" is:",
    ["$5 < 3$", "$5 = 3$", "$5 \\leq 3$", "$5 \\geq 3$"], "C", "EASY",
    "$\\neg(5 > 3)$ is \"$5$ is not greater than $3$\", i.e. $5 \\leq 3$. **Answer: C**"),
  m("If $P$ is true and $Q$ is false, then $P \\land Q$ is:",
    ["True", "False", "Both", "Undefined"], "B", "EASY",
    "Conjunction $P \\land Q$ is true only when both are true. Here $Q$ is false, so $P \\land Q$ is false. **Answer: B**"),
  m("If $P$ is true and $Q$ is false, then $P \\lor Q$ is:",
    ["True", "False", "Both", "Undefined"], "A", "EASY",
    "Inclusive disjunction $P \\lor Q$ is true if at least one disjunct is true. $P$ is true, so $P \\lor Q$ is true. **Answer: A**"),
  m("The implication $P \\Rightarrow Q$ is **false** only when:",
    ["$P$ false, $Q$ true", "$P$ true, $Q$ true", "$P$ true, $Q$ false", "$P$ false, $Q$ false"], "C", "MEDIUM",
    "$P \\Rightarrow Q$ is false only when the hypothesis is true and the conclusion is false (i.e., $P$ true, $Q$ false). **Answer: C**"),
  m("Which is logically equivalent to $\\neg(P \\land Q)$?",
    ["$\\neg P \\land \\neg Q$", "$\\neg P \\lor \\neg Q$", "$P \\lor Q$", "$P \\Rightarrow Q$"], "B", "MEDIUM",
    "De Morgan's law: $\\neg(P \\land Q) \\equiv \\neg P \\lor \\neg Q$. **Answer: B**"),
  m("Which is logically equivalent to $\\neg(P \\lor Q)$?",
    ["$\\neg P \\land \\neg Q$", "$\\neg P \\lor \\neg Q$", "$\\neg P \\Rightarrow Q$", "$P \\land Q$"], "A", "MEDIUM",
    "De Morgan's law: $\\neg(P \\lor Q) \\equiv \\neg P \\land \\neg Q$. **Answer: A**"),
  m("The converse of $P \\Rightarrow Q$ is:",
    ["$Q \\Rightarrow P$", "$\\neg P \\Rightarrow \\neg Q$", "$\\neg Q \\Rightarrow \\neg P$", "$P \\land Q$"], "A", "MEDIUM",
    "Converse swaps hypothesis and conclusion: $Q \\Rightarrow P$. (The contrapositive is $\\neg Q \\Rightarrow \\neg P$.) **Answer: A**"),
  m("The contrapositive of $P \\Rightarrow Q$ is:",
    ["$Q \\Rightarrow P$", "$\\neg P \\Rightarrow \\neg Q$", "$\\neg Q \\Rightarrow \\neg P$", "$P \\lor Q$"], "C", "MEDIUM",
    "Contrapositive negates and swaps: $\\neg Q \\Rightarrow \\neg P$. **Answer: C**"),
  m("Which of the following is logically equivalent to $P \\Rightarrow Q$?",
    ["$Q \\Rightarrow P$", "$\\neg Q \\Rightarrow \\neg P$", "$P \\land \\neg Q$", "$\\neg P \\Rightarrow Q$"], "B", "MEDIUM",
    "An implication is logically equivalent to its contrapositive $\\neg Q \\Rightarrow \\neg P$, but **not** to its converse $Q \\Rightarrow P$. **Answer: B**"),
  m("Which proposition is a tautology?",
    ["$P \\land \\neg P$", "$P \\lor \\neg P$", "$P \\Rightarrow \\neg P$", "$P \\Leftrightarrow \\neg P$"], "B", "HARD",
    "$P \\lor \\neg P$ (excluded middle) is always true. $P \\land \\neg P$ is a contradiction. **Answer: B**"),
  m("$P \\Leftrightarrow Q$ is true when:",
    ["Both $P$ and $Q$ are true", "Both have the same truth value", "Exactly one is true", "$Q$ implies $P$ only"], "B", "HARD",
    "The biconditional $P \\Leftrightarrow Q$ is true exactly when $P$ and $Q$ share the same truth value (both true or both false). **Answer: B**"),
];

// ─── 8 SHORT_ANSWER ─────────────────────────────────────────────────────

const shortAnswer: FR[] = [
  sq("Let $P$: \"It is raining\" and $Q$: \"The ground is wet\". Write the propositions $P \\Rightarrow Q$, the converse, and the contrapositive in plain English.", 3, "EASY",
    "*Step 1 (1 mark):* $P \\Rightarrow Q$: \"If it is raining, then the ground is wet.\"\n*Step 2 (1 mark):* Converse $Q \\Rightarrow P$: \"If the ground is wet, then it is raining.\"\n*Step 3 (1 mark):* Contrapositive $\\neg Q \\Rightarrow \\neg P$: \"If the ground is not wet, then it is not raining.\""),
  sq("Use De Morgan's laws to write $\\neg(P \\land \\neg Q)$ in a form using only $\\neg$, $\\lor$.", 2, "MEDIUM",
    "*Step 1 (1 mark):* $\\neg(P \\land \\neg Q) \\equiv \\neg P \\lor \\neg(\\neg Q)$.\n*Step 2 (1 mark):* Double negation: $\\neg(\\neg Q) \\equiv Q$. So the form is $\\neg P \\lor Q$."),
  sq("Without a truth table, show that $\\neg P \\lor Q$ is logically equivalent to $P \\Rightarrow Q$.", 2, "MEDIUM",
    "*Step 1 (1 mark):* $P \\Rightarrow Q$ is false only when $P$ is true and $Q$ is false; otherwise it is true.\n*Step 2 (1 mark):* $\\neg P \\lor Q$: false iff $\\neg P$ false and $Q$ false, i.e. $P$ true and $Q$ false. Same truth values in all four cases, hence equivalent."),
  sq("Negate the implication \"If $n$ is even, then $n^2$ is even.\" State your negation in a form not containing $\\Rightarrow$.", 2, "MEDIUM",
    "*Step 1 (1 mark):* $\\neg(P \\Rightarrow Q) \\equiv P \\land \\neg Q$.\n*Step 2 (1 mark):* Negation: \"$n$ is even AND $n^2$ is not even.\""),
  sq("Let $P, Q, R$ be propositions. Show that $(P \\Rightarrow Q) \\land (Q \\Rightarrow R)$ implies $(P \\Rightarrow R)$ by a chain of reasoning.", 3, "HARD",
    "*Step 1 (1 mark):* Assume $P \\Rightarrow Q$ and $Q \\Rightarrow R$ are both true. Suppose $P$ holds.\n*Step 2 (1 mark):* By $P \\Rightarrow Q$, $Q$ holds. By $Q \\Rightarrow R$, $R$ holds.\n*Step 3 (1 mark):* So $P$ implies $R$, i.e. $P \\Rightarrow R$. This is the *hypothetical syllogism*."),
  sq("Determine the truth value of \"$3$ is prime $\\Rightarrow$ $4$ is even\". Justify.", 2, "EASY",
    "*Step 1 (1 mark):* The hypothesis \"$3$ is prime\" is true, and the conclusion \"$4$ is even\" is also true.\n*Step 2 (1 mark):* Since both parts are true, the implication $\\text{T} \\Rightarrow \\text{T}$ is true."),
  sq("Decide whether the following compound statement is a tautology, contradiction, or neither: $(P \\Rightarrow Q) \\lor (Q \\Rightarrow P)$. Justify.", 3, "HARD",
    "*Step 1 (1 mark):* Consider the four assignments of $(P, Q)$.\n*Step 2 (1 mark):* If $P$ true and $Q$ true: $\\text{T} \\lor \\text{T}$ = T. If $P$ true, $Q$ false: $\\text{F} \\lor \\text{T}$ = T. If $P$ false, $Q$ true: $\\text{T} \\lor \\text{F}$ = T. If both false: $\\text{T} \\lor \\text{T}$ = T.\n*Step 3 (1 mark):* All cases evaluate to true, so the statement is a **tautology**."),
  sq("Negate the statement \"$x < 5$ and $y \\geq 2$\" (where $x, y \\in \\mathbb{R}$).", 2, "EASY",
    "*Step 1 (1 mark):* By De Morgan: $\\neg(P \\land Q) \\equiv \\neg P \\lor \\neg Q$.\n*Step 2 (1 mark):* Negation: \"$x \\geq 5$ or $y < 2$\"."),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT to ${JSON_PATH}`,
);
