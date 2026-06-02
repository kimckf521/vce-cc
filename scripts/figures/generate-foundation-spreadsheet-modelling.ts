/**
 * Foundation generator: spreadsheet-modelling
 * Tier: extended-fit only -> 14 MCQ + 11 SA + 3 EA = 28
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/spreadsheet-modelling.json");

const TOPIC = "algebra-number-and-structure";
const SUB = "spreadsheet-modelling";

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

const ea = (
  preamble: string,
  difficulty: Diff,
  parts: Array<{ label: string; marks: number; content: string; solution: string }>,
): Item => ({
  type: "EXTENDED_ANSWER",
  marks: parts.reduce((s, p) => s + p.marks, 0),
  difficulty,
  topicSlug: TOPIC,
  subtopicSlugs: [SUB],
  preamble,
  parts,
  content: "",
});

const items: Item[] = [
  // ── MCQ (14) ────────────────────────────────────────────────────────
  mcq(
    "In a spreadsheet, cell `A1` contains $5$ and cell `A2` contains $3$. The formula `=A1+A2` evaluates to:",
    ["$2$", "$5$", "$8$", "$15$"],
    "C",
    "EASY",
    "The formula adds the contents: $5 + 3 = 8$.\n\n**Answer: C**",
  ),
  mcq(
    "Cell `B1` contains $20$ and `B2` contains $4$. The formula `=B1/B2` evaluates to:",
    ["$4$", "$5$", "$16$", "$24$"],
    "B",
    "EASY",
    "Division: $\\dfrac{20}{4} = 5$.\n\n**Answer: B**",
  ),
  mcq(
    "In a spreadsheet, cell `C3` contains $12$ and `C4` contains $7$. The formula `=C3-C4` evaluates to:",
    ["$5$", "$7$", "$12$", "$19$"],
    "A",
    "EASY",
    "Subtraction: $12 - 7 = 5$.\n\n**Answer: A**",
  ),
  mcq(
    "The formula `=A1*B1` is used to:",
    ["Add A1 and B1", "Subtract B1 from A1", "Multiply A1 and B1", "Divide A1 by B1"],
    "C",
    "EASY",
    "The `*` symbol means multiplication.\n\n**Answer: C**",
  ),
  mcq(
    "Cells `A1` to `A5` contain $2, 4, 6, 8, 10$ respectively. The formula `=SUM(A1:A5)` evaluates to:",
    ["$10$", "$20$", "$30$", "$40$"],
    "C",
    "EASY",
    "Sum: $2 + 4 + 6 + 8 + 10 = 30$.\n\n**Answer: C**",
  ),
  mcq(
    "Cells `B2` to `B6` contain $10, 20, 30, 40, 50$. The formula `=AVERAGE(B2:B6)` evaluates to:",
    ["$20$", "$25$", "$30$", "$150$"],
    "C",
    "EASY",
    "Average: $\\dfrac{10+20+30+40+50}{5} = \\dfrac{150}{5} = 30$.\n\n**Answer: C**",
  ),
  mcq(
    "Cell `A1` contains $\\$45.00$, the unit price, and cell `B1` contains $4$, the quantity. The total cost is given by:",
    ["`=A1+B1`", "`=A1-B1`", "`=A1*B1`", "`=A1/B1`"],
    "C",
    "EASY",
    "Total cost is unit price multiplied by quantity: `=A1*B1`.\n\n**Answer: C**",
  ),
  mcq(
    "Cells `C1` to `C4` contain $25, 30, 45, 50$. The formula `=MAX(C1:C4)` evaluates to:",
    ["$25$", "$37.5$", "$45$", "$50$"],
    "D",
    "MEDIUM",
    "MAX returns the largest value: $50$.\n\n**Answer: D**",
  ),
  mcq(
    "Cell `A1` contains $\\$240$, the price of an item before GST. The formula for the price after $10\\%$ GST is:",
    ["`=A1+0.1`", "`=A1*0.1`", "`=A1*1.1`", "`=A1/1.1`"],
    "C",
    "MEDIUM",
    "To add $10\\%$ GST: multiply by $1.10$. Formula: `=A1*1.1`.\n\n**Answer: C**",
  ),
  mcq(
    "Cell `A1` contains $50$. The formula `=A1*1.15` evaluates to:",
    ["$57.50$", "$58.50$", "$65.00$", "$75.00$"],
    "A",
    "MEDIUM",
    "$50 \\times 1.15 = 57.50$.\n\n**Answer: A**",
  ),
  mcq(
    "In a spreadsheet, the formula `=A1*(1-0.2)` is used to:",
    ["Add $20\\%$ to A1", "Subtract $20\\%$ from A1", "Multiply A1 by $0.2$", "Divide A1 by $0.2$"],
    "B",
    "MEDIUM",
    "Multiplying by $(1-0.2) = 0.8$ reduces the value by $20\\%$.\n\n**Answer: B**",
  ),
  mcq(
    "Cell `A1` contains $\\$1\\,200$ (principal), `A2` contains $0.05$ (rate per year), `A3` contains $3$ (years). The simple interest formula `=A1*A2*A3` evaluates to:",
    ["$\\$60$", "$\\$150$", "$\\$180$", "$\\$240$"],
    "C",
    "MEDIUM",
    "$1\\,200 \\times 0.05 \\times 3 = 180$.\n\n**Answer: C**",
  ),
  mcq(
    "A spreadsheet has Quantity in column `A` and Unit Price in column `B`. The formula `=A2*B2` in cell `C2` is copied down to `C3`, `C4`, etc. When dragged to `C5`, the formula becomes:",
    ["`=A2*B2`", "`=A5*B5`", "`=A2*B5`", "`=A5*B2`"],
    "B",
    "MEDIUM",
    "Relative references shift with the row: dragging `=A2*B2` down four rows gives `=A5*B5`.\n\n**Answer: B**",
  ),
  mcq(
    "Cells `A1:A4` contain $20, 35, 50, 45$. The formula `=COUNT(A1:A4)` evaluates to:",
    ["$4$", "$37.5$", "$50$", "$150$"],
    "A",
    "HARD",
    "COUNT returns the number of numeric values in the range: $4$.\n\n**Answer: A**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "Cell `A1` contains $12$ and cell `A2` contains $8$. Evaluate the formula `=A1+A2`.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $12 + 8 = 20$.",
  ),
  sa(
    "Cell `B1` contains $50$ and cell `B2` contains $5$. Evaluate the formula `=B1/B2`.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $\\dfrac{50}{5} = 10$.",
  ),
  sa(
    "Cells `A1` to `A4` contain $4, 7, 9, 12$. Evaluate the formula `=SUM(A1:A4)`.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $4 + 7 + 9 + 12 = 32$.",
  ),
  sa(
    "Cells `B1` to `B5` contain $15, 20, 25, 30, 35$. Evaluate the formula `=AVERAGE(B1:B5)`.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Sum: $15 + 20 + 25 + 30 + 35 = 125$.\n\n**Step 2 (1 mark):** Average: $\\dfrac{125}{5} = 25$.",
  ),
  sa(
    "Cell `A1` contains the unit price $\\$8.50$ and cell `B1` contains the quantity $6$. Write the spreadsheet formula that calculates the total cost, and evaluate it.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Formula: `=A1*B1`.\n\n**Step 2 (1 mark):** Value: $\\$8.50 \\times 6 = \\$51.00$.",
  ),
  sa(
    "A spreadsheet has the price in cell `A1`. Write a spreadsheet formula that calculates the price after $10\\%$ GST is added, and evaluate it for the case `A1 = \\$80`.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Formula: `=A1*1.1`.\n\n**Step 2 (1 mark):** Value: $\\$80 \\times 1.10 = \\$88.00$.",
  ),
  sa(
    "Cell `A1` contains $\\$150$. Write a spreadsheet formula that calculates the price after a $20\\%$ discount and evaluate it.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Formula: `=A1*(1-0.2)` (or `=A1*0.8`).\n\n**Step 2 (1 mark):** Value: $\\$150 \\times 0.80 = \\$120.00$.",
  ),
  sa(
    "Cell `A1` contains principal $\\$3\\,000$, cell `A2` contains annual rate $0.06$ and cell `A3` contains time $5$ years. Write the spreadsheet formula for simple interest and evaluate it.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Formula: `=A1*A2*A3`.\n\n**Step 2 (1 mark):** Value: $3\\,000 \\times 0.06 \\times 5 = \\$900$.",
  ),
  sa(
    "Cells `A1:A6` contain the values $40, 60, 55, 70, 45, 90$. Evaluate the formula `=MAX(A1:A6) - MIN(A1:A6)`.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** MAX $= 90$, MIN $= 40$.\n\n**Step 2 (1 mark):** $90 - 40 = 50$.",
  ),
  sa(
    "A spreadsheet has Quantity in cell `A2` and Unit Price in cell `B2`. The cell `C2` contains the formula `=A2*B2`. State the formula that will appear in cell `C7` if `C2` is filled down to `C7`.",
    1,
    "MEDIUM",
    "**Step 1 (1 mark):** The relative references shift to row $7$: `=A7*B7`.",
  ),
  sa(
    "A budget spreadsheet has monthly income in cell `A1 = \\$4\\,200` and monthly expenses in cell `A2 = \\$3\\,150`. Write a formula in cell `A3` that calculates the savings as a percentage of income, and evaluate it to one decimal place.",
    3,
    "HARD",
    "**Step 1 (1 mark):** Savings: `=A1-A2`, value $= \\$4\\,200 - \\$3\\,150 = \\$1\\,050$.\n\n**Step 2 (1 mark):** Percentage of income formula: `=(A1-A2)/A1*100`.\n\n**Step 3 (1 mark):** Value: $\\dfrac{1\\,050}{4\\,200} \\times 100 = 25.0\\%$.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "Tom uses a spreadsheet to track his weekly grocery shopping at a Melbourne supermarket. The spreadsheet records item name in column `A`, quantity in column `B`, and unit price in column `C`. Some sample rows are shown below.\n\n| Row | Item | Quantity | Unit Price |\n|---|---|---|---|\n| 2 | Milk (1 L) | 3 | \\$2.40 |\n| 3 | Bread | 2 | \\$4.50 |\n| 4 | Apples (kg) | 1.5 | \\$4.80 |",
    "EASY",
    [
      {
        label: "a",
        marks: 1,
        content: "Write a spreadsheet formula to be entered in cell `D2` that calculates the total cost for row $2$ (Milk).",
        solution: "**Step 1 (1 mark):** Formula: `=B2*C2`.",
      },
      {
        label: "b",
        marks: 2,
        content: "Evaluate the total cost in cells `D2`, `D3` and `D4`.",
        solution: "**Step 1 (1 mark):** `D2` = $3 \\times \\$2.40 = \\$7.20$. `D3` = $2 \\times \\$4.50 = \\$9.00$.\n\n**Step 2 (1 mark):** `D4` = $1.5 \\times \\$4.80 = \\$7.20$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Tom enters the formula `=SUM(D2:D4)` in cell `D5`. Evaluate `D5`, and write a formula in `D6` that returns the average cost per row.",
        solution: "**Step 1 (1 mark):** `D5` $= \\$7.20 + \\$9.00 + \\$7.20 = \\$23.40$.\n\n**Step 2 (1 mark):** `D6` formula: `=AVERAGE(D2:D4)`. Value: $\\dfrac{\\$23.40}{3} = \\$7.80$.",
      },
    ],
  ),
  ea(
    "Mia is using a spreadsheet to model her monthly mobile-phone usage. Cell `A1` contains the base plan fee of $\\$25$. Cell `A2` contains the cost per additional GB ($\\$5$). Cell `A3` contains the number of additional GB used that month.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 2,
        content: "Write a spreadsheet formula for the total monthly bill in cell `A4`, and evaluate it when `A3 = 3` (i.e. $3$ additional GB).",
        solution: "**Step 1 (1 mark):** Formula: `=A1+A2*A3`.\n\n**Step 2 (1 mark):** Value: $\\$25 + \\$5 \\times 3 = \\$40$.",
      },
      {
        label: "b",
        marks: 1,
        content: "Evaluate the formula `=A1+A2*A3` when `A3 = 0`.",
        solution: "**Step 1 (1 mark):** $\\$25 + \\$5 \\times 0 = \\$25$ (just the base plan).",
      },
      {
        label: "c",
        marks: 2,
        content: "Mia's bill last month was $\\$70$. Use the formula to find the value of `A3` (additional GB used).",
        solution: "**Step 1 (1 mark):** $25 + 5 \\times A3 = 70$, so $5 \\times A3 = 45$.\n\n**Step 2 (1 mark):** $A3 = 9$ additional GB.",
      },
    ],
  ),
  ea(
    "A small Brisbane cafe uses a spreadsheet to record daily takings. The spreadsheet has columns: Day in column `A`, Takings in column `B`. Cells `B2:B6` contain $\\$420$, $\\$510$, $\\$485$, $\\$540$, $\\$595$ for Monday to Friday respectively.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Write a spreadsheet formula to be entered in `B7` to calculate the total takings from Monday to Friday, and evaluate it.",
        solution: "**Step 1 (1 mark):** Formula: `=SUM(B2:B6)`. Value: $\\$420 + \\$510 + \\$485 + \\$540 + \\$595 = \\$2\\,550$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Write a formula in `B8` to calculate the average daily takings and evaluate it.",
        solution: "**Step 1 (1 mark):** Formula: `=AVERAGE(B2:B6)`.\n\n**Step 2 (1 mark):** Value: $\\dfrac{\\$2\\,550}{5} = \\$510$ per day.",
      },
      {
        label: "c",
        marks: 2,
        content: "$10\\%$ GST applies to all takings. Write a formula in `B9` that calculates the total GST collected over the five days, and evaluate it.",
        solution: "**Step 1 (1 mark):** Formula: `=B7/11` (since takings include $10\\%$ GST, the GST is total$/11$).\n\n**Step 2 (1 mark):** GST: $\\dfrac{2\\,550}{11} \\approx \\$231.82$.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`spreadsheet-modelling: wrote ${items.length} items to ${OUT}`);
