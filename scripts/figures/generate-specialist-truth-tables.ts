/**
 * Specialist: Discrete Mathematics — Truth Tables.
 * Tier: core-drill → MCQ + SHORT only.
 */

import * as fs from "fs";

const JSON_PATH = "scripts/output/qset-specialist-truth-tables.json";

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
  subtopicSlugs: ["truth-tables", ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: ["truth-tables", ...sec],
});

// ─── 12 MCQ ─────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("How many rows does a truth table for $n$ propositional variables have?",
    ["$n$", "$2n$", "$n^2$", "$2^n$"], "D", "EASY",
    "Each variable contributes a factor of 2 in possible truth combinations, so the table has $2^n$ rows. **Answer: D**"),
  m("In the truth table for $P \\land Q$, the conjunction is true in how many of the four rows?",
    ["$0$", "$1$", "$2$", "$3$"], "B", "EASY",
    "$P \\land Q$ is true only when both $P$ and $Q$ are true: 1 row out of 4. **Answer: B**"),
  m("In the truth table for $P \\lor Q$, the (inclusive) disjunction is **false** in how many of the four rows?",
    ["$0$", "$1$", "$2$", "$3$"], "B", "EASY",
    "$P \\lor Q$ is false only when both are false: 1 row. **Answer: B**"),
  m("Given the truth table\n\n| $P$ | $Q$ | $?$ |\n|---|---|---|\n| T | T | T |\n| T | F | F |\n| F | T | F |\n| F | F | F |\n\nwhich connective does the `?` column represent?",
    ["$P \\lor Q$", "$P \\land Q$", "$P \\Rightarrow Q$", "$P \\Leftrightarrow Q$"], "B", "EASY",
    "The output is true only when both inputs are true — the standard truth table for $P \\land Q$. **Answer: B**"),
  m("Given the truth table\n\n| $P$ | $Q$ | $?$ |\n|---|---|---|\n| T | T | T |\n| T | F | F |\n| F | T | T |\n| F | F | T |\n\nwhich connective does the `?` column represent?",
    ["$P \\lor Q$", "$P \\land Q$", "$P \\Rightarrow Q$", "$P \\Leftrightarrow Q$"], "C", "MEDIUM",
    "The only false row is $P$ T, $Q$ F — the truth table of $P \\Rightarrow Q$. **Answer: C**"),
  m("In the truth table for $P \\Rightarrow Q$, the implication is true in how many of the four rows?",
    ["$1$", "$2$", "$3$", "$4$"], "C", "MEDIUM",
    "$P \\Rightarrow Q$ is false in only one row (TF). The other three rows are true. **Answer: C**"),
  m("Which compound statement has the truth table\n\n| $P$ | $Q$ | $?$ |\n|---|---|---|\n| T | T | T |\n| T | F | F |\n| F | T | F |\n| F | F | T |\n\nin its `?` column?",
    ["$P \\Leftrightarrow Q$", "$P \\Rightarrow Q$", "$\\neg(P \\Leftrightarrow Q)$", "$P \\lor \\neg Q$"], "A", "MEDIUM",
    "True iff $P$ and $Q$ have the same truth value — biconditional $P \\Leftrightarrow Q$. **Answer: A**"),
  m("Suppose the truth table for a compound proposition shows T in every row. The proposition is:",
    ["A contradiction", "A tautology", "Contingent", "Not a proposition"], "B", "MEDIUM",
    "A statement true in every row of its truth table is called a *tautology*. (Always false = contradiction.) **Answer: B**"),
  m("How many rows does the truth table for $(P \\lor Q) \\land R$ have?",
    ["$4$", "$6$", "$8$", "$9$"], "C", "EASY",
    "Three variables -> $2^3 = 8$ rows. **Answer: C**"),
  m("Looking at the truth tables for $\\neg(P \\land Q)$ and $\\neg P \\lor \\neg Q$, the two columns agree in:",
    ["No rows", "One row", "Two rows", "All four rows"], "D", "MEDIUM",
    "De Morgan's law: $\\neg(P \\land Q) \\equiv \\neg P \\lor \\neg Q$. Their truth values agree in every row. **Answer: D**"),
  m("Which proposition is a **contradiction** (i.e., false in every row of its truth table)?",
    ["$P \\lor \\neg P$", "$P \\land \\neg P$", "$P \\Rightarrow Q$", "$P \\Leftrightarrow Q$"], "B", "HARD",
    "$P \\land \\neg P$ is always false: $P$ and its negation cannot both hold. **Answer: B**"),
  m("In a truth table for $P \\oplus Q$ (exclusive or), the result is true in how many rows?",
    ["$0$", "$1$", "$2$", "$3$"], "C", "HARD",
    "$P \\oplus Q$ is true exactly when one — but not both — of $P, Q$ is true: 2 rows (TF and FT). **Answer: C**"),
];

// ─── 8 SHORT_ANSWER ─────────────────────────────────────────────────────

const shortAnswer: FR[] = [
  sq("Construct the truth table for $P \\Rightarrow Q$.", 2, "EASY",
    "*Step 1 (1 mark):* Enumerate all four combinations of truth values for $P$ and $Q$.\n*Step 2 (1 mark):* Apply the definition (false only when $P$ true and $Q$ false):\n\n| $P$ | $Q$ | $P \\Rightarrow Q$ |\n|---|---|---|\n| T | T | T |\n| T | F | F |\n| F | T | T |\n| F | F | T |"),
  sq("Construct the truth table for $\\neg P \\lor Q$ and hence verify that $\\neg P \\lor Q \\equiv P \\Rightarrow Q$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Compute $\\neg P$:\n\n| $P$ | $Q$ | $\\neg P$ | $\\neg P \\lor Q$ |\n|---|---|---|---|\n| T | T | F | T |\n| T | F | F | F |\n| F | T | T | T |\n| F | F | T | T |\n\n*Step 2 (1 mark):* Compare with $P \\Rightarrow Q$ column (T, F, T, T).\n*Step 3 (1 mark):* All four rows match, so $\\neg P \\lor Q \\equiv P \\Rightarrow Q$."),
  sq("Use a truth table to show that $\\neg(P \\lor Q) \\equiv \\neg P \\land \\neg Q$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Enumerate $P, Q$ and compute both sides.\n\n| $P$ | $Q$ | $P \\lor Q$ | $\\neg(P \\lor Q)$ | $\\neg P$ | $\\neg Q$ | $\\neg P \\land \\neg Q$ |\n|---|---|---|---|---|---|---|\n| T | T | T | F | F | F | F |\n| T | F | T | F | F | T | F |\n| F | T | T | F | T | F | F |\n| F | F | F | T | T | T | T |\n\n*Step 2 (1 mark):* Compare $\\neg(P \\lor Q)$ with $\\neg P \\land \\neg Q$: (F, F, F, T) vs (F, F, F, T).\n*Step 3 (1 mark):* Identical in all rows, so the equivalence holds (De Morgan's law)."),
  sq("Use a truth table to show that $P \\Rightarrow Q$ is logically equivalent to its contrapositive $\\neg Q \\Rightarrow \\neg P$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Build the table:\n\n| $P$ | $Q$ | $P \\Rightarrow Q$ | $\\neg Q$ | $\\neg P$ | $\\neg Q \\Rightarrow \\neg P$ |\n|---|---|---|---|---|---|\n| T | T | T | F | F | T |\n| T | F | F | T | F | F |\n| F | T | T | F | T | T |\n| F | F | T | T | T | T |\n\n*Step 2 (1 mark):* Compare columns 3 and 6: (T, F, T, T) vs (T, F, T, T).\n*Step 3 (1 mark):* Identical in every row, hence $P \\Rightarrow Q \\equiv \\neg Q \\Rightarrow \\neg P$."),
  sq("Construct the truth table for $(P \\land Q) \\lor \\neg P$ and decide whether it is a tautology.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Compute step by step:\n\n| $P$ | $Q$ | $P \\land Q$ | $\\neg P$ | $(P \\land Q) \\lor \\neg P$ |\n|---|---|---|---|---|\n| T | T | T | F | T |\n| T | F | F | F | F |\n| F | T | F | T | T |\n| F | F | F | T | T |\n\n*Step 2 (1 mark):* The final column is (T, F, T, T), with one false row.\n*Step 3 (1 mark):* Not all rows are T, so the proposition is **not a tautology**."),
  sq("Use a truth table to determine whether $(P \\Rightarrow Q) \\land (Q \\Rightarrow P)$ is logically equivalent to $P \\Leftrightarrow Q$.", 3, "HARD",
    "*Step 1 (1 mark):* Build:\n\n| $P$ | $Q$ | $P \\Rightarrow Q$ | $Q \\Rightarrow P$ | $(P \\Rightarrow Q) \\land (Q \\Rightarrow P)$ | $P \\Leftrightarrow Q$ |\n|---|---|---|---|---|---|\n| T | T | T | T | T | T |\n| T | F | F | T | F | F |\n| F | T | T | F | F | F |\n| F | F | T | T | T | T |\n\n*Step 2 (1 mark):* Compare columns 5 and 6: (T, F, F, T) vs (T, F, F, T).\n*Step 3 (1 mark):* Identical, hence the equivalence holds: $P \\Leftrightarrow Q \\equiv (P \\Rightarrow Q) \\land (Q \\Rightarrow P)$."),
  sq("Build the truth table for the three-variable proposition $(P \\land Q) \\lor R$.", 3, "HARD",
    "*Step 1 (1 mark):* List the $2^3 = 8$ rows for $(P, Q, R)$.\n*Step 2 (1 mark):* Compute $P \\land Q$ first, then OR with $R$:\n\n| $P$ | $Q$ | $R$ | $P \\land Q$ | $(P \\land Q) \\lor R$ |\n|---|---|---|---|---|\n| T | T | T | T | T |\n| T | T | F | T | T |\n| T | F | T | F | T |\n| T | F | F | F | F |\n| F | T | T | F | T |\n| F | T | F | F | F |\n| F | F | T | F | T |\n| F | F | F | F | F |\n\n*Step 3 (1 mark):* Final column $(P \\land Q) \\lor R$: T, T, T, F, T, F, T, F."),
  sq("Construct a truth table to decide whether $(P \\Rightarrow Q) \\Rightarrow ((Q \\Rightarrow P))$ is a tautology, contradiction, or contingent.", 3, "HARD",
    "*Step 1 (1 mark):* Build:\n\n| $P$ | $Q$ | $P \\Rightarrow Q$ | $Q \\Rightarrow P$ | $(P \\Rightarrow Q) \\Rightarrow (Q \\Rightarrow P)$ |\n|---|---|---|---|---|\n| T | T | T | T | T |\n| T | F | F | T | T |\n| F | T | T | F | F |\n| F | F | T | T | T |\n\n*Step 2 (1 mark):* The final column is (T, T, F, T) — true in three rows, false in one.\n*Step 3 (1 mark):* Since it is neither always true nor always false, the statement is **contingent**."),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT to ${JSON_PATH}`,
);
