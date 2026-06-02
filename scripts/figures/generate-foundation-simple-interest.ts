/**
 * Foundation generator: simple-interest
 * Tier: core-drill + extended-fit -> 14 MCQ + 11 SA + 3 EA = 28
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/simple-interest.json");

const TOPIC = "algebra-number-and-structure";
const SUB = "simple-interest";

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
    "Simple interest on $\\$1\\,000$ at $5\\%$ per annum for $1$ year is:",
    ["$\\$20$", "$\\$40$", "$\\$50$", "$\\$100$"],
    "C",
    "EASY",
    "$I = Prt = 1\\,000 \\times 0.05 \\times 1 = \\$50$.\n\n**Answer: C**",
  ),
  mcq(
    "Simple interest on $\\$2\\,000$ at $6\\%$ per annum for $3$ years is:",
    ["$\\$120$", "$\\$300$", "$\\$360$", "$\\$420$"],
    "C",
    "EASY",
    "$I = 2\\,000 \\times 0.06 \\times 3 = \\$360$.\n\n**Answer: C**",
  ),
  mcq(
    "Simple interest on $\\$1\\,500$ at $4\\%$ per annum for $2$ years is:",
    ["$\\$60$", "$\\$80$", "$\\$120$", "$\\$150$"],
    "C",
    "EASY",
    "$I = 1\\,500 \\times 0.04 \\times 2 = \\$120$.\n\n**Answer: C**",
  ),
  mcq(
    "The total amount after investing $\\$800$ at $5\\%$ simple interest per annum for $1$ year is:",
    ["$\\$805$", "$\\$840$", "$\\$845$", "$\\$880$"],
    "B",
    "EASY",
    "Interest: $800 \\times 0.05 \\times 1 = \\$40$. Total: $\\$800 + \\$40 = \\$840$.\n\n**Answer: B**",
  ),
  mcq(
    "Simple interest on $\\$3\\,000$ at $7\\%$ per annum for $4$ years is:",
    ["$\\$210$", "$\\$420$", "$\\$840$", "$\\$1\\,200$"],
    "C",
    "EASY",
    "$I = 3\\,000 \\times 0.07 \\times 4 = \\$840$.\n\n**Answer: C**",
  ),
  mcq(
    "Simple interest on $\\$5\\,000$ at $3.5\\%$ per annum for $2$ years is:",
    ["$\\$175$", "$\\$280$", "$\\$350$", "$\\$525$"],
    "C",
    "EASY",
    "$I = 5\\,000 \\times 0.035 \\times 2 = \\$350$.\n\n**Answer: C**",
  ),
  mcq(
    "The formula for simple interest is $I = Prt$. If $P = \\$2\\,500$, $r = 0.04$ and $t = 5$ years, then $I$ is:",
    ["$\\$250$", "$\\$400$", "$\\$500$", "$\\$2\\,000$"],
    "C",
    "EASY",
    "$I = 2\\,500 \\times 0.04 \\times 5 = \\$500$.\n\n**Answer: C**",
  ),
  mcq(
    "Simple interest on $\\$4\\,200$ at $6\\%$ per annum for $18$ months is:",
    ["$\\$252$", "$\\$378$", "$\\$420$", "$\\$504$"],
    "B",
    "MEDIUM",
    "$t = 1.5$ years. $I = 4\\,200 \\times 0.06 \\times 1.5 = \\$378$.\n\n**Answer: B**",
  ),
  mcq(
    "$\\$2\\,000$ earns $\\$240$ in simple interest over $3$ years. The annual interest rate is:",
    ["$2\\%$", "$3\\%$", "$4\\%$", "$5\\%$"],
    "C",
    "MEDIUM",
    "$r = \\dfrac{I}{Pt} = \\dfrac{240}{2\\,000 \\times 3} = 0.04 = 4\\%$.\n\n**Answer: C**",
  ),
  mcq(
    "How long does it take $\\$5\\,000$ to earn $\\$600$ simple interest at $4\\%$ per annum?",
    ["$2$ years", "$3$ years", "$4$ years", "$5$ years"],
    "B",
    "MEDIUM",
    "$t = \\dfrac{I}{Pr} = \\dfrac{600}{5\\,000 \\times 0.04} = \\dfrac{600}{200} = 3$ years.\n\n**Answer: B**",
  ),
  mcq(
    "Simple interest on $\\$8\\,000$ at $5\\%$ per annum for $9$ months is:",
    ["$\\$200$", "$\\$300$", "$\\$360$", "$\\$400$"],
    "B",
    "MEDIUM",
    "$t = \\dfrac{9}{12} = 0.75$ years. $I = 8\\,000 \\times 0.05 \\times 0.75 = \\$300$.\n\n**Answer: B**",
  ),
  mcq(
    "Aaron invests $\\$6\\,500$ at $4.2\\%$ per annum simple interest for $5$ years. The total amount at the end is:",
    ["$\\$7\\,865$", "$\\$7\\,820$", "$\\$8\\,015$", "$\\$8\\,250$"],
    "A",
    "MEDIUM",
    "Interest: $6\\,500 \\times 0.042 \\times 5 = \\$1\\,365$. Total: $\\$6\\,500 + \\$1\\,365 = \\$7\\,865$.\n\n**Answer: A**",
  ),
  mcq(
    "$\\$4\\,000$ is invested for $4$ years and earns $\\$720$ simple interest. The interest rate per annum is:",
    ["$3\\%$", "$4\\%$", "$4.5\\%$", "$5\\%$"],
    "C",
    "HARD",
    "$r = \\dfrac{720}{4\\,000 \\times 4} = 0.045 = 4.5\\%$.\n\n**Answer: C**",
  ),
  mcq(
    "A principal of $P$ doubles in $20$ years at simple interest. The annual interest rate is:",
    ["$2.5\\%$", "$3\\%$", "$5\\%$", "$10\\%$"],
    "C",
    "HARD",
    "Doubling means interest $= P$. From $I = Prt$: $P = P \\times r \\times 20$, so $r = \\dfrac{1}{20} = 0.05 = 5\\%$.\n\n**Answer: C**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "Calculate the simple interest earned on $\\$1\\,200$ invested at $5\\%$ per annum for $2$ years.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $I = 1\\,200 \\times 0.05 \\times 2 = \\$120$.",
  ),
  sa(
    "Calculate the simple interest earned on $\\$3\\,000$ at $4\\%$ per annum for $3$ years.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $I = 3\\,000 \\times 0.04 \\times 3 = \\$360$.",
  ),
  sa(
    "Calculate the simple interest earned on $\\$500$ at $6\\%$ per annum for $1$ year.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $I = 500 \\times 0.06 \\times 1 = \\$30$.",
  ),
  sa(
    "$\\$4\\,500$ is deposited at $3\\%$ per annum simple interest for $5$ years. Calculate the total amount in the account at the end of $5$ years.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Interest: $4\\,500 \\times 0.03 \\times 5 = \\$675$.\n\n**Step 2 (1 mark):** Total: $\\$4\\,500 + \\$675 = \\$5\\,175$.",
  ),
  sa(
    "Calculate the simple interest on $\\$2\\,400$ at $4.5\\%$ per annum for $2$ years.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $I = 2\\,400 \\times 0.045 \\times 2 = \\$216$.",
  ),
  sa(
    "Calculate the simple interest on $\\$10\\,000$ at $5\\%$ per annum for $6$ months.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Convert time: $6$ months $= 0.5$ years.\n\n**Step 2 (1 mark):** $I = 10\\,000 \\times 0.05 \\times 0.5 = \\$250$.",
  ),
  sa(
    "Calculate the interest rate per annum if $\\$2\\,000$ invested for $4$ years earns $\\$320$ in simple interest.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Rearrange $I = Prt$: $r = \\dfrac{I}{Pt} = \\dfrac{320}{2\\,000 \\times 4}$.\n\n**Step 2 (1 mark):** $r = 0.04 = 4\\%$ per annum.",
  ),
  sa(
    "Calculate the time required for $\\$3\\,000$ at $6\\%$ per annum simple interest to earn $\\$540$.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** $t = \\dfrac{I}{Pr} = \\dfrac{540}{3\\,000 \\times 0.06}$.\n\n**Step 2 (1 mark):** $t = \\dfrac{540}{180} = 3$ years.",
  ),
  sa(
    "A principal of $P$ is invested at $5\\%$ per annum simple interest. After $3$ years, the interest earned is $\\$675$. Calculate $P$.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Rearrange $I = Prt$: $P = \\dfrac{I}{rt} = \\dfrac{675}{0.05 \\times 3}$.\n\n**Step 2 (1 mark):** $P = \\dfrac{675}{0.15} = \\$4\\,500$.",
  ),
  sa(
    "Calculate the simple interest on $\\$7\\,500$ at $4.8\\%$ per annum for $30$ months.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Convert time: $30$ months $= 2.5$ years.\n\n**Step 2 (1 mark):** $I = 7\\,500 \\times 0.048 \\times 2.5$.\n\n**Step 3 (1 mark):** $= \\$900$.",
  ),
  sa(
    "An investment of $\\$8\\,000$ earns $\\$1\\,920$ in simple interest over $4$ years. Calculate the annual interest rate as a percentage, correct to one decimal place.",
    3,
    "HARD",
    "**Step 1 (1 mark):** Rearrange $I = Prt$: $r = \\dfrac{I}{Pt}$.\n\n**Step 2 (1 mark):** $r = \\dfrac{1\\,920}{8\\,000 \\times 4} = \\dfrac{1\\,920}{32\\,000}$.\n\n**Step 3 (1 mark):** $r = 0.06 = 6.0\\%$ per annum.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "Nina is comparing two savings options at her local bank. Option A offers $\\$2\\,000$ invested at $4\\%$ per annum simple interest. Option B offers $\\$2\\,000$ invested at $4.5\\%$ per annum simple interest.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the simple interest earned on Option A after $3$ years.",
        solution: "**Step 1 (1 mark):** $I = 2\\,000 \\times 0.04 \\times 3 = \\$240$.",
      },
      {
        label: "b",
        marks: 1,
        content: "Calculate the simple interest earned on Option B after $3$ years.",
        solution: "**Step 1 (1 mark):** $I = 2\\,000 \\times 0.045 \\times 3 = \\$270$.",
      },
      {
        label: "c",
        marks: 2,
        content: "How much more interest does Option B earn over $3$ years, and what is the total balance in Option B at the end of $3$ years?",
        solution: "**Step 1 (1 mark):** Extra interest: $\\$270 - \\$240 = \\$30$.\n\n**Step 2 (1 mark):** Total in Option B: $\\$2\\,000 + \\$270 = \\$2\\,270$.",
      },
    ],
  ),
  ea(
    "Daniel borrows $\\$5\\,000$ from a credit union to buy a second-hand car. He is charged $7.5\\%$ per annum simple interest, and agrees to repay the loan over $4$ years.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the total interest charged on the loan over the $4$ years.",
        solution: "**Step 1 (1 mark):** $I = 5\\,000 \\times 0.075 \\times 4 = \\$1\\,500$.",
      },
      {
        label: "b",
        marks: 1,
        content: "Calculate the total amount Daniel will repay over the $4$ years.",
        solution: "**Step 1 (1 mark):** Total: $\\$5\\,000 + \\$1\\,500 = \\$6\\,500$.",
      },
      {
        label: "c",
        marks: 2,
        content: "If Daniel pays the loan back in $48$ equal monthly repayments, calculate the value of each monthly repayment correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** Number of months: $4 \\times 12 = 48$.\n\n**Step 2 (1 mark):** Monthly repayment: $\\dfrac{\\$6\\,500}{48} = \\$135.42$ (to the nearest cent).",
      },
    ],
  ),
  ea(
    "Layla wins $\\$12\\,000$ in a competition. She splits it into two amounts and invests them. She places $\\$8\\,000$ in a term deposit at $4\\%$ per annum simple interest for $3$ years, and the remaining $\\$4\\,000$ in a high-interest account at $5\\%$ per annum simple interest for $3$ years.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the simple interest earned on the $\\$8\\,000$ term deposit over $3$ years.",
        solution: "**Step 1 (1 mark):** $I = 8\\,000 \\times 0.04 \\times 3 = \\$960$.",
      },
      {
        label: "b",
        marks: 1,
        content: "Calculate the simple interest earned on the $\\$4\\,000$ high-interest account over $3$ years.",
        solution: "**Step 1 (1 mark):** $I = 4\\,000 \\times 0.05 \\times 3 = \\$600$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate Layla's total combined balance (principal plus interest) at the end of $3$ years.",
        solution: "**Step 1 (1 mark):** Total interest: $\\$960 + \\$600 = \\$1\\,560$.\n\n**Step 2 (1 mark):** Total balance: $\\$12\\,000 + \\$1\\,560 = \\$13\\,560$.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`simple-interest: wrote ${items.length} items to ${OUT}`);
