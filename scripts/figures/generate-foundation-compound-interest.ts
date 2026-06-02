/**
 * Foundation generator: compound-interest
 *
 * core-drill + extended-fit tier (no modelling-rich):
 *   14 MCQ + 11 SHORT_ANSWER + 3 EXTENDED_ANSWER = 28
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/compound-interest.json");

const TOPIC = "algebra-number-and-structure";
const SUB = "compound-interest";

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
  // ── MCQ (14) ─────────────────────────────────────────────────────────
  mcq(
    "Lina invests $\\$1\\,000$ at $5\\%$ per annum compounded annually. After $1$ year the amount in the account is:",
    ["$\\$1\\,005$", "$\\$1\\,050$", "$\\$1\\,500$", "$\\$1\\,055$"],
    "B",
    "EASY",
    "After one year, the amount is $\\$1\\,000 \\times 1.05 = \\$1\\,050$.\n\n**Answer: B**",
  ),
  mcq(
    "Which expression gives the value of $\\$2\\,000$ invested at $4\\%$ per annum compounded annually for $3$ years?",
    ["$\\$2\\,000 \\times 1.04 \\times 3$", "$\\$2\\,000 \\times 1.04^3$", "$\\$2\\,000 \\times 3^{1.04}$", "$\\$2\\,000 + 0.04 \\times 3$"],
    "B",
    "EASY",
    "Compound interest uses $A = P(1+r)^n$, so $A = \\$2\\,000 \\times 1.04^3$.\n\n**Answer: B**",
  ),
  mcq(
    "The compound interest multiplier for a rate of $6\\%$ per annum over $1$ year is:",
    ["$0.06$", "$0.94$", "$1.06$", "$6.00$"],
    "C",
    "EASY",
    "The compound multiplier is $1 + r = 1 + 0.06 = 1.06$.\n\n**Answer: C**",
  ),
  mcq(
    "An amount of $\\$5\\,000$ is invested at $3\\%$ per annum compounded annually. The value after $2$ years is closest to:",
    ["$\\$5\\,150.00$", "$\\$5\\,300.00$", "$\\$5\\,304.50$", "$\\$5\\,309.00$"],
    "C",
    "EASY",
    "$A = 5000 \\times 1.03^2 = 5000 \\times 1.0609 = \\$5\\,304.50$.\n\n**Answer: C**",
  ),
  mcq(
    "Compound interest differs from simple interest because:",
    [
      "Simple interest pays out monthly",
      "Compound interest is calculated on the original amount only",
      "Compound interest is calculated on the previous balance, including past interest",
      "Compound interest always uses a higher rate",
    ],
    "C",
    "EASY",
    "Compound interest is added to the balance and earns further interest in following periods.\n\n**Answer: C**",
  ),
  mcq(
    "A bank offers $4\\%$ per annum compounded quarterly. The interest rate per quarter is:",
    ["$0.4\\%$", "$1\\%$", "$1.5\\%$", "$4\\%$"],
    "B",
    "MEDIUM",
    "Divide the annual rate by the number of periods: $\\dfrac{4\\%}{4} = 1\\%$ per quarter.\n\n**Answer: B**",
  ),
  mcq(
    "$\\$8\\,000$ is invested at $5\\%$ per annum compounded annually. The amount after $3$ years is closest to:",
    ["$\\$9\\,200.00$", "$\\$9\\,261.00$", "$\\$9\\,400.00$", "$\\$8\\,800.00$"],
    "B",
    "MEDIUM",
    "$A = 8000 \\times 1.05^3 = 8000 \\times 1.157625 = \\$9\\,261.00$.\n\n**Answer: B**",
  ),
  mcq(
    "$\\$3\\,500$ is invested at $4\\%$ per annum compounded annually for $2$ years. The compound interest earned is closest to:",
    ["$\\$140.00$", "$\\$280.00$", "$\\$285.60$", "$\\$291.20$"],
    "C",
    "MEDIUM",
    "$A = 3500 \\times 1.04^2 = \\$3\\,785.60$. Interest: $\\$3\\,785.60 - \\$3\\,500 = \\$285.60$.\n\n**Answer: C**",
  ),
  mcq(
    "Ravi invests $\\$10\\,000$ at $6\\%$ per annum compounded annually. After $5$ years the value is closest to:",
    ["$\\$13\\,000$", "$\\$13\\,382$", "$\\$13\\,500$", "$\\$16\\,000$"],
    "B",
    "MEDIUM",
    "$A = 10\\,000 \\times 1.06^5 = 10\\,000 \\times 1.33823 = \\$13\\,382.26$, closest to $\\$13\\,382$.\n\n**Answer: B**",
  ),
  mcq(
    "An investment of $\\$1\\,500$ earns $5\\%$ per annum compounded annually for $4$ years. The interest earned is closest to:",
    ["$\\$300.00$", "$\\$323.00$", "$\\$330.00$", "$\\$375.00$"],
    "B",
    "MEDIUM",
    "$A = 1500 \\times 1.05^4 = 1500 \\times 1.21551 = \\$1\\,823.26$. Interest: $\\$1\\,823.26 - \\$1\\,500 = \\$323.26$, closest to $\\$323$.\n\n**Answer: B**",
  ),
  mcq(
    "A term deposit of $\\$4\\,000$ pays $3\\%$ per annum compounded annually. After $2$ years the balance is closest to:",
    ["$\\$4\\,120.00$", "$\\$4\\,243.60$", "$\\$4\\,360.00$", "$\\$4\\,500.00$"],
    "B",
    "MEDIUM",
    "$A = 4000 \\times 1.03^2 = 4000 \\times 1.0609 = \\$4\\,243.60$.\n\n**Answer: B**",
  ),
  mcq(
    "$\\$2\\,400$ is invested at $6\\%$ per annum compounded half-yearly for $1$ year. The value after $1$ year is closest to:",
    ["$\\$2\\,544.00$", "$\\$2\\,546.16$", "$\\$2\\,569.44$", "$\\$2\\,564.00$"],
    "B",
    "MEDIUM",
    "Half-yearly rate: $3\\%$. Two periods: $A = 2400 \\times 1.03^2 = 2400 \\times 1.0609 = \\$2\\,546.16$.\n\n**Answer: B**",
  ),
  mcq(
    "$\\$5\\,000$ is invested at $8\\%$ per annum compounded quarterly for $1$ year. The value after $1$ year is closest to:",
    ["$\\$5\\,400.00$", "$\\$5\\,412.16$", "$\\$5\\,410.00$", "$\\$5\\,800.00$"],
    "B",
    "HARD",
    "Quarterly rate: $2\\%$. Four periods: $A = 5000 \\times 1.02^4 = 5000 \\times 1.08243 = \\$5\\,412.16$.\n\n**Answer: B**",
  ),
  mcq(
    "A sum of money doubles in $12$ years when invested at a compound rate. Using the rule of $72$, the approximate annual rate is:",
    ["$3\\%$", "$5\\%$", "$6\\%$", "$8\\%$"],
    "C",
    "HARD",
    "Rule of $72$: rate $\\approx \\dfrac{72}{12} = 6\\%$ per annum.\n\n**Answer: C**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "Calculate the compound multiplier per year for an interest rate of $7\\%$ per annum.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Multiplier $= 1 + 0.07 = 1.07$.",
  ),
  sa(
    "$\\$2\\,000$ is invested at $4\\%$ per annum compounded annually. Calculate the balance after $1$ year.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $A = 2000 \\times 1.04 = \\$2\\,080.00$.",
  ),
  sa(
    "$\\$1\\,500$ is invested at $5\\%$ per annum compounded annually. Calculate the balance after $2$ years, correct to the nearest cent.",
    2,
    "EASY",
    "**Step 1 (1 mark):** $A = 1500 \\times 1.05^2 = 1500 \\times 1.1025$.\n\n**Step 2 (1 mark):** $= \\$1\\,653.75$.",
  ),
  sa(
    "Calculate the interest earned when $\\$800$ is invested for $1$ year at $6\\%$ per annum compounded annually.",
    2,
    "EASY",
    "**Step 1 (1 mark):** $A = 800 \\times 1.06 = \\$848.00$.\n\n**Step 2 (1 mark):** Interest $= \\$848 - \\$800 = \\$48.00$.",
  ),
  sa(
    "A term deposit pays $3\\%$ per annum compounded annually. Calculate the value of a $\\$10\\,000$ deposit after $2$ years.",
    2,
    "EASY",
    "**Step 1 (1 mark):** $A = 10\\,000 \\times 1.03^2 = 10\\,000 \\times 1.0609$.\n\n**Step 2 (1 mark):** $= \\$10\\,609.00$.",
  ),
  sa(
    "Hayden invests $\\$6\\,000$ at $4.5\\%$ per annum compounded annually for $3$ years. Calculate the balance, correct to the nearest cent.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** $A = 6000 \\times 1.045^3 = 6000 \\times 1.141166$.\n\n**Step 2 (1 mark):** $= \\$6\\,846.99$.",
  ),
  sa(
    "$\\$2\\,500$ is invested at $5\\%$ per annum compounded annually for $4$ years. Calculate the compound interest earned, correct to the nearest cent.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** $A = 2500 \\times 1.05^4 = 2500 \\times 1.215506$.\n\n**Step 2 (1 mark):** $A = \\$3\\,038.77$.\n\n**Step 3 (1 mark):** Interest $= \\$3\\,038.77 - \\$2\\,500 = \\$538.77$.",
  ),
  sa(
    "$\\$4\\,000$ is invested at $6\\%$ per annum compounded half-yearly. Calculate the balance after $1$ year, correct to the nearest cent.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Half-yearly rate $= 3\\%$, periods $= 2$. $A = 4000 \\times 1.03^2$.\n\n**Step 2 (1 mark):** $= \\$4\\,243.60$.",
  ),
  sa(
    "$\\$1\\,200$ is invested at $4\\%$ per annum compounded quarterly. Calculate the balance after $1$ year, correct to the nearest cent.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Quarterly rate: $\\dfrac{4\\%}{4} = 1\\%$. Periods: $4$.\n\n**Step 2 (1 mark):** $A = 1200 \\times 1.01^4 = 1200 \\times 1.04060$.\n\n**Step 3 (1 mark):** $= \\$1\\,248.73$.",
  ),
  sa(
    "Maria invests $\\$3\\,000$ at $5\\%$ per annum compounded annually for $5$ years. Calculate the total interest earned, correct to the nearest cent.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** $A = 3000 \\times 1.05^5 = 3000 \\times 1.276282$.\n\n**Step 2 (1 mark):** $A = \\$3\\,828.85$.\n\n**Step 3 (1 mark):** Interest $= \\$3\\,828.85 - \\$3\\,000 = \\$828.85$.",
  ),
  sa(
    "$\\$8\\,000$ is invested at $4\\%$ per annum compounded annually for $10$ years. Calculate the balance and the interest earned, both correct to the nearest cent.",
    3,
    "HARD",
    "**Step 1 (1 mark):** $A = 8000 \\times 1.04^{10} = 8000 \\times 1.480244$.\n\n**Step 2 (1 mark):** $A = \\$11\\,841.95$.\n\n**Step 3 (1 mark):** Interest $= \\$11\\,841.95 - \\$8\\,000 = \\$3\\,841.95$.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "Kim invests $\\$5\\,000$ in a savings account paying $4\\%$ per annum compounded annually.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Write down the compound interest multiplier per year.",
        solution: "**Step 1 (1 mark):** Multiplier $= 1 + 0.04 = 1.04$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the balance after $1$ year and after $2$ years, both to the nearest cent.",
        solution: "**Step 1 (1 mark):** After $1$ year: $5000 \\times 1.04 = \\$5\\,200.00$.\n\n**Step 2 (1 mark):** After $2$ years: $5000 \\times 1.04^2 = 5000 \\times 1.0816 = \\$5\\,408.00$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the total interest earned after $3$ years, correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** $A = 5000 \\times 1.04^3 = 5000 \\times 1.124864 = \\$5\\,624.32$.\n\n**Step 2 (1 mark):** Interest $= \\$5\\,624.32 - \\$5\\,000 = \\$624.32$.",
      },
    ],
  ),
  ea(
    "Daniel deposits $\\$3\\,200$ into a term deposit that pays $5\\%$ per annum compounded half-yearly. He plans to leave it for $2$ years.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the half-yearly interest rate.",
        solution: "**Step 1 (1 mark):** Half-yearly rate $= \\dfrac{5\\%}{2} = 2.5\\%$ per half-year.",
      },
      {
        label: "b",
        marks: 1,
        content: "State the number of compounding periods over $2$ years.",
        solution: "**Step 1 (1 mark):** Periods $= 2 \\times 2 = 4$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the balance after $2$ years, correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** $A = 3200 \\times 1.025^4 = 3200 \\times 1.103813$.\n\n**Step 2 (1 mark):** $= \\$3\\,532.20$.",
      },
      {
        label: "d",
        marks: 1,
        content: "Calculate the total interest earned over the $2$ years.",
        solution: "**Step 1 (1 mark):** Interest $= \\$3\\,532.20 - \\$3\\,200 = \\$332.20$.",
      },
    ],
  ),
  ea(
    "Two investment options for a deposit of $\\$4\\,000$ over $3$ years are being compared.\n\n| Option | Rate (per annum) | Compounding |\n|---|---|---|\n| A | $5\\%$ | Annually |\n| B | $4.8\\%$ | Quarterly |",
    "HARD",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the balance for Option A after $3$ years, correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** $A = 4000 \\times 1.05^3 = 4000 \\times 1.157625$.\n\n**Step 2 (1 mark):** $= \\$4\\,630.50$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the balance for Option B after $3$ years, correct to the nearest cent. (Quarterly rate is $1.2\\%$; there are $12$ periods.)",
        solution: "**Step 1 (1 mark):** $A = 4000 \\times 1.012^{12} = 4000 \\times 1.153868$.\n\n**Step 2 (1 mark):** $= \\$4\\,615.47$.",
      },
      {
        label: "c",
        marks: 1,
        content: "Which option gives the higher final balance? State the difference, to the nearest cent.",
        solution: "**Step 1 (1 mark):** Option A gives more. Difference $= \\$4\\,630.50 - \\$4\\,615.47 = \\$15.03$.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`compound-interest: wrote ${items.length} items to ${OUT}`);
