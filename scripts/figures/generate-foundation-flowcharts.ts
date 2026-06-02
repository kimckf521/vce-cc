/**
 * Foundation generator: flowcharts
 *
 * Core-drill + extended-fit. 14 MCQ + 11 SHORT + 3 EXTENDED_ANSWER = 28 items.
 * Simple flowchart tracing in real-world contexts: input/process/decision
 * boxes, follow yes/no branches, compute the output by inspection.
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/flowcharts.json");

const TOPIC = "discrete-mathematics";
const SUB = "flowcharts";

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

// Helper: render a simple flowchart as a markdown ordered list
const flow = (steps: string[]): string => steps.map((s, i) => `${i + 1}. ${s}`).join("\n");

const items: Item[] = [
  // ── MCQ (14) ─────────────────────────────────────────────────────────
  mcq(
    `A simple flowchart performs the following steps:\n\n${flow([
      "Start.",
      "Input the number $N = 6$.",
      "Multiply by $5$.",
      "Subtract $4$.",
      "Output the result.",
    ])}\n\nThe output is:`,
    ["$26$", "$30$", "$34$", "$56$"],
    "A",
    "EASY",
    "Multiply: $6 \\times 5 = 30$. Subtract: $30 - 4 = 26$.\n\n**Answer: A**",
  ),
  mcq(
    `A flowchart performs the following steps on input $N$:\n\n${flow([
      "Add $3$.",
      "Multiply by $2$.",
      "Output the result.",
    ])}\n\nIf $N = 5$, the output is:`,
    ["$13$", "$16$", "$20$", "$25$"],
    "B",
    "EASY",
    "Add: $5 + 3 = 8$. Multiply: $8 \\times 2 = 16$.\n\n**Answer: B**",
  ),
  mcq(
    `A flowchart takes input $x$ and outputs $y = 3x + 2$. If the input is $x = 7$, the output $y$ is:`,
    ["$10$", "$21$", "$23$", "$27$"],
    "C",
    "EASY",
    "$y = 3 \\times 7 + 2 = 21 + 2 = 23$.\n\n**Answer: C**",
  ),
  mcq(
    `A flowchart asks: 'Is the temperature above $25\\degree\\text{C}$?'. If YES, output 'Hot'. If NO, output 'Mild'. For a temperature of $22\\degree\\text{C}$, the output is:`,
    ["Hot", "Mild", "Cold", "No output"],
    "B",
    "EASY",
    "$22 \\degree\\text{C}$ is NOT above $25\\degree\\text{C}$, so the NO branch outputs 'Mild'.\n\n**Answer: B**",
  ),
  mcq(
    `A flowchart for change at a cafe:\n\n${flow([
      "Input price $P$ and payment $M$.",
      "Calculate change $C = M - P$.",
      "If $C > 0$, output 'change $\\$C$'; otherwise output 'no change'.",
    ])}\n\nFor $P = \\$8.50$ and $M = \\$10$, the output is:`,
    ["no change", "change $\\$1.00$", "change $\\$1.50$", "change $\\$2.00$"],
    "C",
    "EASY",
    "$C = 10 - 8.50 = \\$1.50$, which is greater than $0$. Output: 'change $\\$1.50$'.\n\n**Answer: C**",
  ),
  mcq(
    `A flowchart performs the following sequence on input $N$:\n\n${flow([
      "Square the input.",
      "Add $1$.",
      "Output the result.",
    ])}\n\nFor input $N = 4$, the output is:`,
    ["$9$", "$13$", "$17$", "$25$"],
    "C",
    "MEDIUM",
    "Square: $4^2 = 16$. Add: $16 + 1 = 17$.\n\n**Answer: C**",
  ),
  mcq(
    `A loop flowchart repeats: 'Add $3$ to the running total' until the total reaches $20$ or more. Starting with $0$, how many additions are performed?`,
    ["$5$", "$6$", "$7$", "$8$"],
    "C",
    "MEDIUM",
    "Running totals: $3, 6, 9, 12, 15, 18, 21$. After $7$ additions the total ($21$) reaches $20$ or more. So $7$ additions.\n\n**Answer: C**",
  ),
  mcq(
    `A delivery driver's flowchart:\n\n${flow([
      "Is the postcode within $10$ km? If YES, charge $\\$5$.",
      "Otherwise, is it within $30$ km? If YES, charge $\\$12$.",
      "Otherwise, charge $\\$20$.",
    ])}\n\nA delivery is $18$ km away. The charge is:`,
    ["$\\$5$", "$\\$10$", "$\\$12$", "$\\$20$"],
    "C",
    "MEDIUM",
    "$18$ km is not within $10$ km but is within $30$ km, so the second branch applies: $\\$12$.\n\n**Answer: C**",
  ),
  mcq(
    `A flowchart applies these steps to a number $N$:\n\n${flow([
      "Divide by $2$.",
      "Add $7$.",
      "Multiply by $3$.",
      "Output result.",
    ])}\n\nFor input $N = 8$, the output is:`,
    ["$21$", "$30$", "$33$", "$39$"],
    "C",
    "MEDIUM",
    "Divide: $8 \\div 2 = 4$. Add: $4 + 7 = 11$. Multiply: $11 \\times 3 = 33$.\n\n**Answer: C**",
  ),
  mcq(
    `A flowchart asks: 'Is $N$ even?'. If YES, output $N/2$. If NO, output $3N + 1$. For input $N = 7$, the output is:`,
    ["$3.5$", "$7$", "$21$", "$22$"],
    "D",
    "MEDIUM",
    "$7$ is odd, so use the NO branch: $3 \\times 7 + 1 = 22$.\n\n**Answer: D**",
  ),
  mcq(
    `A gym membership flowchart:\n\n${flow([
      "Is the customer a student? If YES, $\\$25$ per week.",
      "Otherwise, is the customer a pensioner? If YES, $\\$30$ per week.",
      "Otherwise, $\\$45$ per week.",
    ])}\n\nA $40$-year-old non-student, non-pensioner pays per week:`,
    ["$\\$25$", "$\\$30$", "$\\$40$", "$\\$45$"],
    "D",
    "MEDIUM",
    "Neither student nor pensioner, so the final branch applies: $\\$45$ per week.\n\n**Answer: D**",
  ),
  mcq(
    `A counting flowchart starts with $N = 1$ and repeats 'multiply $N$ by $2$' until $N$ is greater than $100$. After how many multiplications does the loop stop?`,
    ["$5$", "$6$", "$7$", "$8$"],
    "C",
    "MEDIUM",
    "Sequence: $1, 2, 4, 8, 16, 32, 64, 128$. After $7$ multiplications, $N = 128 > 100$.\n\n**Answer: C**",
  ),
  mcq(
    `A flowchart computes the total cost of an order:\n\n${flow([
      "Input quantity $Q$ and unit price $\\$P$.",
      "Subtotal $S = Q \\times P$.",
      "If $S \\ge 100$, apply $10\\%$ discount.",
      "Add $10\\%$ GST to the (discounted) subtotal.",
      "Output the total.",
    ])}\n\nFor $Q = 8$ and $P = \\$15$, the output is closest to:`,
    ["$\\$108$", "$\\$118.80$", "$\\$120$", "$\\$132$"],
    "B",
    "HARD",
    "Subtotal: $8 \\times 15 = \\$120$. $S \\ge 100$, so apply $10\\%$ discount: $120 \\times 0.9 = \\$108$. GST: $108 \\times 1.1 = \\$118.80$.\n\n**Answer: B**",
  ),
  mcq(
    `A flowchart applies these steps to two numbers $A$ and $B$:\n\n${flow([
      "If $A > B$, set $X = A - B$.",
      "Otherwise, set $X = B - A$.",
      "Multiply $X$ by $4$.",
      "Output the result.",
    ])}\n\nFor $A = 7$ and $B = 12$, the output is:`,
    ["$5$", "$15$", "$20$", "$76$"],
    "C",
    "HARD",
    "$A < B$, so $X = 12 - 7 = 5$. Multiply: $5 \\times 4 = 20$.\n\n**Answer: C**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    `A flowchart performs these steps:\n\n${flow([
      "Input $N$.",
      "Multiply by $4$.",
      "Add $7$.",
      "Output result.",
    ])}\n\nWhat is the output if $N = 5$?`,
    1,
    "EASY",
    "**Step 1 (1 mark):** $5 \\times 4 = 20$, then $20 + 7 = 27$. Output: $27$.",
  ),
  sa(
    `A flowchart subtracts $3$ from the input, then divides by $2$. What is the output for input $11$?`,
    1,
    "EASY",
    "**Step 1 (1 mark):** $(11 - 3) \\div 2 = 8 \\div 2 = 4$. Output: $4$.",
  ),
  sa(
    `A flowchart asks: 'Is the score $\\ge 50$?'. If YES, output 'Pass'. If NO, output 'Fail'. What is the output for a score of $48$?`,
    1,
    "EASY",
    "**Step 1 (1 mark):** $48 < 50$, so the answer is 'Fail'.",
  ),
  sa(
    `A flowchart performs:\n\n${flow([
      "Input $x$.",
      "Multiply by $3$.",
      "Subtract $5$.",
      "Output result.",
    ])}\n\nFor input $x = 9$, write down each intermediate step and the final output.`,
    2,
    "EASY",
    "**Step 1 (1 mark):** Multiply: $9 \\times 3 = 27$.\n\n**Step 2 (1 mark):** Subtract: $27 - 5 = 22$. Output: $22$.",
  ),
  sa(
    `A flowchart for parking costs at a Melbourne shopping centre:\n\n${flow([
      "Input number of hours $h$.",
      "If $h \\le 2$, charge $\\$3$.",
      "Otherwise, charge $\\$3 + \\$2$ per hour over $2$.",
    ])}\n\nWhat is the parking charge for $5$ hours?`,
    2,
    "EASY",
    "**Step 1 (1 mark):** $h = 5 > 2$, so use the second branch. Hours over $2$: $5 - 2 = 3$.\n\n**Step 2 (1 mark):** Charge: $\\$3 + 3 \\times \\$2 = \\$9$.",
  ),
  sa(
    `A flowchart asks: 'Is $N$ divisible by $3$?'. If YES, output $N \\div 3$. If NO, output $N + 1$. What is the output for $N = 14$?`,
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** $14 \\div 3 = 4$ remainder $2$, so $14$ is NOT divisible by $3$.\n\n**Step 2 (1 mark):** Use the NO branch: output $14 + 1 = 15$.",
  ),
  sa(
    `A loop flowchart starts with $N = 0$ and repeats 'add $4$ to $N$' until $N$ reaches $24$ or more. How many additions are performed?`,
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Running totals: $4, 8, 12, 16, 20, 24$.\n\n**Step 2 (1 mark):** $N$ reaches $24$ after $6$ additions.",
  ),
  sa(
    `A flowchart performs the steps below in order on input $N$:\n\n${flow([
      "Divide $N$ by $2$.",
      "Add $5$.",
      "Multiply by $3$.",
      "Output the result.",
    ])}\n\nFind the output for $N = 12$.`,
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** $12 \\div 2 = 6$, then $6 + 5 = 11$.\n\n**Step 2 (1 mark):** $11 \\times 3 = 33$. Output: $33$.",
  ),
  sa(
    `A flowchart for a phone discount:\n\n${flow([
      "Input the price $\\$P$.",
      "If the customer is a member, apply $15\\%$ off.",
      "If $P > \\$500$, apply an additional $5\\%$ off the already-discounted price.",
      "Output the final price.",
    ])}\n\nA member buys a phone with $P = \\$800$. Calculate the final price.`,
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Member discount: $\\$800 \\times 0.85 = \\$680$.\n\n**Step 2 (1 mark):** $\\$680 > \\$500$, so apply extra $5\\%$ off: $\\$680 \\times 0.95$.\n\n**Step 3 (1 mark):** Final price: $\\$646$.",
  ),
  sa(
    `A flowchart converts Celsius temperature $C$ to Fahrenheit:\n\n${flow([
      "Input $C$.",
      "Multiply by $9$.",
      "Divide by $5$.",
      "Add $32$.",
      "Output the Fahrenheit value $F$.",
    ])}\n\nUse the flowchart to find $F$ when $C = 25\\degree\\text{C}$.`,
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** $25 \\times 9 = 225$.\n\n**Step 2 (1 mark):** $225 \\div 5 = 45$.\n\n**Step 3 (1 mark):** $45 + 32 = 77$. Output: $F = 77\\degree\\text{F}$.",
  ),
  sa(
    `A counting loop starts with $N = 1$ and repeats 'multiply $N$ by $3$' until $N$ exceeds $200$.\n\nList the values of $N$ at each step and state how many multiplications were performed.`,
    3,
    "HARD",
    "**Step 1 (1 mark):** Initial: $N = 1$. After multiplications: $3, 9, 27$.\n\n**Step 2 (1 mark):** Continue: $81, 243$. After $5$ multiplications, $N = 243 > 200$.\n\n**Step 3 (1 mark):** The loop stops after $5$ multiplications. Values: $1, 3, 9, 27, 81, 243$.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    `A school cafeteria uses this flowchart to charge for a meal deal:\n\n${flow([
      "Input price $\\$P$ of selected items.",
      "Is the student a Year 12? If YES, apply $20\\%$ off.",
      "Is $P > \\$15$ (before discount)? If YES, add a free juice (no extra cost).",
      "Output the final price.",
    ])}`,
    "EASY",
    [
      {
        label: "a",
        marks: 1,
        content: "A Year 11 student selects items totalling $\\$10$. What is the final price?",
        solution: "**Step 1 (1 mark):** Year 11, so no discount. Final price: $\\$10$.",
      },
      {
        label: "b",
        marks: 2,
        content: "A Year 12 student selects items totalling $\\$18$. What is the final price (and is the juice included)?",
        solution: "**Step 1 (1 mark):** Apply $20\\%$ off: $\\$18 \\times 0.8 = \\$14.40$.\n\n**Step 2 (1 mark):** $P = \\$18 > \\$15$ (before discount), so juice is free. Final price: $\\$14.40$.",
      },
      {
        label: "c",
        marks: 2,
        content: "A Year 12 student spent a final amount of $\\$10$. What was the original price $P$ they selected?",
        solution: "**Step 1 (1 mark):** Year 12 received $20\\%$ off, so the original price was $P$ where $0.8 P = \\$10$.\n\n**Step 2 (1 mark):** $P = \\dfrac{\\$10}{0.8} = \\$12.50$.",
      },
    ],
  ),
  ea(
    `A simple number-processing flowchart:\n\n${flow([
      "Input a positive whole number $N$.",
      "If $N$ is even, halve it.",
      "Otherwise, add $1$.",
      "Repeat the process until $N = 1$.",
    ])}`,
    "MEDIUM",
    [
      {
        label: "a",
        marks: 2,
        content: "List the sequence of values starting from $N = 8$ until the loop ends.",
        solution: "**Step 1 (1 mark):** Starting $N = 8$: even $\\to$ halve to $4$; even $\\to$ halve to $2$.\n\n**Step 2 (1 mark):** Continue: even $\\to$ halve to $1$. Loop ends. Sequence: $8, 4, 2, 1$.",
      },
      {
        label: "b",
        marks: 2,
        content: "List the sequence of values starting from $N = 5$ until the loop ends.",
        solution: "**Step 1 (1 mark):** Starting $N = 5$: odd $\\to$ add $1$ to get $6$; even $\\to$ halve to $3$.\n\n**Step 2 (1 mark):** Odd $\\to$ add $1$ to get $4$; even $\\to$ $2$; even $\\to$ $1$. Sequence: $5, 6, 3, 4, 2, 1$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Starting from $N = 12$, how many iterations of the loop are needed before $N = 1$?",
        solution: "**Step 1 (1 mark):** From $12$: $12 \\to 6 \\to 3 \\to 4 \\to 2 \\to 1$.\n\n**Step 2 (1 mark):** That is $5$ iterations.",
      },
    ],
  ),
  ea(
    `A water company uses this flowchart to calculate a household's monthly water bill, where $L$ is the litres used in the month:\n\n${flow([
      "Input $L$.",
      "If $L \\le 5\\,000$, the bill is a flat $\\$30$.",
      "Otherwise, the bill is $\\$30$ plus $\\$0.01$ per litre over $5\\,000$.",
      "Add $10\\%$ GST to the bill.",
      "Output the final bill.",
    ])}`,
    "MEDIUM",
    [
      {
        label: "a",
        marks: 2,
        content: "Find the final bill for a household using $4\\,500$ litres in a month.",
        solution: "**Step 1 (1 mark):** $L = 4\\,500 \\le 5\\,000$, so the bill (before GST) is $\\$30$.\n\n**Step 2 (1 mark):** Add GST: $\\$30 \\times 1.1 = \\$33$. Final bill: $\\$33$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Find the final bill for a household using $8\\,000$ litres in a month.",
        solution: "**Step 1 (1 mark):** Litres over $5\\,000$: $8\\,000 - 5\\,000 = 3\\,000$. Bill before GST: $\\$30 + 3\\,000 \\times \\$0.01 = \\$30 + \\$30 = \\$60$.\n\n**Step 2 (1 mark):** Add GST: $\\$60 \\times 1.1 = \\$66$. Final bill: $\\$66$.",
      },
      {
        label: "c",
        marks: 2,
        content: "A household's final bill (including GST) is $\\$55$. How many litres did the household use?",
        solution: "**Step 1 (1 mark):** Bill before GST: $\\dfrac{\\$55}{1.1} = \\$50$. Since $\\$50 > \\$30$ flat, the household used over $5\\,000$ L. Extra cost: $\\$50 - \\$30 = \\$20$.\n\n**Step 2 (1 mark):** Extra litres: $\\dfrac{\\$20}{\\$0.01} = 2\\,000$. Total litres: $5\\,000 + 2\\,000 = 7\\,000$ L.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`flowcharts: wrote ${items.length} items to ${OUT}`);
