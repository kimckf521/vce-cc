/**
 * Foundation generator: range-and-spread
 *
 * Tier: core-drill ONLY.
 * Targets: 14 MCQ + 11 SHORT_ANSWER = 25 items.
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/range-and-spread.json");

const TOPIC = "data-analysis-probability-and-statistics";
const SUB = "range-and-spread";

type Diff = "EASY" | "MEDIUM" | "HARD";
type ItemType = "MCQ" | "SHORT_ANSWER" | "EXTENDED_ANSWER" | "EXTENDED_RESPONSE";

interface Item {
  type: ItemType;
  marks: number;
  difficulty: Diff;
  topicSlug: string;
  subtopicSlugs: string[];
  content: string;
  preamble?: string | null;
  parts?: Array<{ label: string; marks: number; content: string; solution: string }> | null;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: "A" | "B" | "C" | "D";
  solutionContent?: string | null;
}

const mcq = (
  content: string,
  options: [string, string, string, string],
  correct: "A" | "B" | "C" | "D",
  difficulty: Diff,
  solution: string,
): Item => ({
  type: "MCQ",
  marks: 1,
  difficulty,
  topicSlug: TOPIC,
  subtopicSlugs: [SUB],
  content,
  optionA: options[0],
  optionB: options[1],
  optionC: options[2],
  optionD: options[3],
  correctOption: correct,
  solutionContent: solution,
});

const sa = (content: string, marks: number, difficulty: Diff, solution: string): Item => ({
  type: "SHORT_ANSWER",
  marks,
  difficulty,
  topicSlug: TOPIC,
  subtopicSlugs: [SUB],
  content,
  solutionContent: solution,
});

const items: Item[] = [
  // ── MCQ (14) ─────────────────────────────────────────────────────────
  mcq(
    "The range of the data set $\\{5, 7, 3, 8, 12, 6\\}$ is:",
    ["$5$", "$8$", "$9$", "$12$"],
    "C",
    "EASY",
    "Range $=$ max $-$ min $= 12 - 3 = 9$.\n\n**Answer: C**",
  ),
  mcq(
    "The range of the data set $\\{14, 20, 18, 22, 17\\}$ is:",
    ["$4$", "$5$", "$8$", "$22$"],
    "C",
    "EASY",
    "Range $= 22 - 14 = 8$.\n\n**Answer: C**",
  ),
  mcq(
    "Which of the following is the formula for the range of a numerical data set?",
    [
      "max $+$ min",
      "max $-$ min",
      "Sum of all values divided by count",
      "Middle value when sorted",
    ],
    "B",
    "EASY",
    "Range $=$ maximum value $-$ minimum value.\n\n**Answer: B**",
  ),
  mcq(
    "The lowest temperature recorded in Melbourne over a week was $4^{\\circ}\\text{C}$ and the highest was $19^{\\circ}\\text{C}$. The range of temperatures is:",
    ["$15^{\\circ}\\text{C}$", "$19^{\\circ}\\text{C}$", "$23^{\\circ}\\text{C}$", "$76^{\\circ}\\text{C}$"],
    "A",
    "EASY",
    "Range $= 19 - 4 = 15^{\\circ}\\text{C}$.\n\n**Answer: A**",
  ),
  mcq(
    "A bag of biscuits has weights (in grams) $\\{45, 48, 50, 52, 49, 47\\}$. The range is:",
    ["$5$ g", "$6$ g", "$7$ g", "$8$ g"],
    "C",
    "EASY",
    "Range $= 52 - 45 = 7$ g.\n\n**Answer: C**",
  ),
  mcq(
    "Two data sets are compared. Data set A has a range of $5$, Data set B has a range of $15$. Which statement is true?",
    [
      "Set A is more spread out than Set B",
      "Set B is more spread out than Set A",
      "Both sets are equally spread",
      "The mean of Set A is higher",
    ],
    "B",
    "EASY",
    "A larger range indicates a greater spread of values.\n\n**Answer: B**",
  ),
  mcq(
    "The minimum and maximum daily rainfall in a Brisbane suburb were $0$ mm and $35$ mm. The range is:",
    ["$0$ mm", "$17.5$ mm", "$35$ mm", "$70$ mm"],
    "C",
    "EASY",
    "Range $= 35 - 0 = 35$ mm.\n\n**Answer: C**",
  ),
  mcq(
    "The data set $\\{3.2, 4.5, 2.8, 5.1, 4.0\\}$ has a range of:",
    ["$2.0$", "$2.3$", "$2.5$", "$3.0$"],
    "B",
    "MEDIUM",
    "Max $= 5.1$, Min $= 2.8$. Range $= 5.1 - 2.8 = 2.3$.\n\n**Answer: B**",
  ),
  mcq(
    "A class records test scores: $\\{72, 85, 68, 91, 77, 84, 65\\}$. The range of scores is:",
    ["$23$", "$26$", "$28$", "$30$"],
    "B",
    "MEDIUM",
    "Max $= 91$, Min $= 65$. Range $= 91 - 65 = 26$.\n\n**Answer: B**",
  ),
  mcq(
    "Which one of these data sets has the smallest range?",
    [
      "$\\{10, 12, 15, 18, 22\\}$",
      "$\\{20, 22, 22, 23, 25\\}$",
      "$\\{5, 8, 10, 14, 16\\}$",
      "$\\{30, 35, 40, 45, 50\\}$",
    ],
    "B",
    "MEDIUM",
    "Ranges: A $= 22 - 10 = 12$; B $= 25 - 20 = 5$; C $= 16 - 5 = 11$; D $= 50 - 30 = 20$. Smallest is B.\n\n**Answer: B**",
  ),
  mcq(
    "Sarah's exam marks across $5$ subjects are $\\{72, 78, 85, 90, 65\\}$. Her range is:",
    ["$15$", "$18$", "$25$", "$30$"],
    "C",
    "MEDIUM",
    "Max $= 90$, Min $= 65$. Range $= 25$.\n\n**Answer: C**",
  ),
  mcq(
    "A data set has a range of $24$ and a minimum value of $13$. The maximum value is:",
    ["$11$", "$24$", "$37$", "$48$"],
    "C",
    "MEDIUM",
    "Max $=$ Min $+$ Range $= 13 + 24 = 37$.\n\n**Answer: C**",
  ),
  mcq(
    "Two factories produce parts. Factory A's part lengths (cm) have a range of $0.6$; Factory B's range is $0.2$. Which factory has more CONSISTENT (less spread) lengths?",
    [
      "Factory A",
      "Factory B",
      "Both are equally consistent",
      "Not enough information",
    ],
    "B",
    "HARD",
    "Smaller range means less spread, so values are more consistent. Factory B has range $0.2 < 0.6$.\n\n**Answer: B**",
  ),
  mcq(
    "A data set $\\{a, 8, 11, 15, b\\}$ (already sorted) has a range of $14$. If $a = 4$, then $b$ is:",
    ["$11$", "$14$", "$17$", "$18$"],
    "D",
    "HARD",
    "$b = a + \\text{range} = 4 + 14 = 18$.\n\n**Answer: D**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "Find the range of the data set $\\{6, 9, 4, 11, 7\\}$.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Range $= 11 - 4 = 7$.",
  ),
  sa(
    "The daily maximum temperatures (in degrees Celsius) for a Sydney week are $\\{22, 25, 28, 24, 21, 30, 27\\}$. Find the range.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Range $= 30 - 21 = 9^{\\circ}\\text{C}$.",
  ),
  sa(
    "Find the range of the heights (in cm) $\\{160, 172, 158, 165, 170\\}$.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Range $= 172 - 158 = 14$ cm.",
  ),
  sa(
    "Calculate the range of $\\{0.4, 1.2, 0.9, 1.5, 0.7\\}$.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Range $= 1.5 - 0.4 = 1.1$.",
  ),
  sa(
    "The number of customers in a Melbourne cafe each day for a week is $\\{42, 50, 38, 47, 55, 41, 49\\}$.\n\n**a.** State the minimum and maximum values.\n\n**b.** Calculate the range.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Minimum: $38$. Maximum: $55$.\n\n**Step 2 (1 mark):** Range $= 55 - 38 = 17$ customers.",
  ),
  sa(
    "The masses (in kg) of $5$ parcels are $\\{1.4, 2.1, 0.9, 1.8, 1.2\\}$.\n\nFind the range of the masses.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Maximum: $2.1$. Minimum: $0.9$.\n\n**Step 2 (1 mark):** Range $= 2.1 - 0.9 = 1.2$ kg.",
  ),
  sa(
    "A class's test scores out of $50$ are listed below.\n\n$\\{32, 41, 27, 39, 45, 30, 36\\}$\n\n**a.** Find the range of the scores.\n\n**b.** Briefly explain what the range tells you about the spread of the data.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Range $= 45 - 27 = 18$.\n\n**Step 2 (1 mark):** A range of $18$ means there is a gap of $18$ marks between the lowest and highest scores, indicating moderate spread.",
  ),
  sa(
    "The heights (in cm) of two boys' basketball teams are recorded.\n\nTeam A: $\\{175, 180, 182, 178, 185\\}$\n\nTeam B: $\\{170, 195, 178, 174, 188\\}$\n\nCalculate the range for each team and state which team has more variable heights.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Team A: $185 - 175 = 10$ cm.\n\n**Step 2 (1 mark):** Team B: $195 - 170 = 25$ cm.\n\n**Step 3 (1 mark):** Team B has the larger range, so it has more variable (more spread out) heights.",
  ),
  sa(
    "The price (in dollars) of $6$ types of bread at a Melbourne bakery: $\\{4.50, 5.20, 3.80, 6.10, 4.90, 5.50\\}$.\n\nCalculate the range of prices.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Maximum: $\\$6.10$. Minimum: $\\$3.80$.\n\n**Step 2 (1 mark):** Range $= \\$6.10 - \\$3.80 = \\$2.30$.",
  ),
  sa(
    "Five rainfall measurements (in mm) are recorded as $\\{0, 12, 8, 25, x\\}$. If the range of the data is $30$ mm and $x$ is the largest value, find the value of $x$.",
    3,
    "HARD",
    "**Step 1 (1 mark):** Current minimum (without $x$): $0$.\n\n**Step 2 (1 mark):** Since $x$ is the largest value, $x = \\text{min} + \\text{range}$.\n\n**Step 3 (1 mark):** $x = 0 + 30 = 30$ mm.",
  ),
  sa(
    "A factory measures the lengths (in cm) of $10$ metal rods. The range is $0.8$ cm, and the shortest rod is $24.5$ cm. \n\n**a.** Find the length of the longest rod.\n\n**b.** Comment on what a small range tells you about the rods produced.",
    3,
    "HARD",
    "**Step 1 (1 mark):** Longest $=$ shortest $+$ range $= 24.5 + 0.8 = 25.3$ cm.\n\n**Step 2 (1 mark):** A small range means rod lengths are close together.\n\n**Step 3 (1 mark):** This suggests the factory produces rods of fairly consistent length.",
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`range-and-spread: wrote ${items.length} items to ${OUT}`);
