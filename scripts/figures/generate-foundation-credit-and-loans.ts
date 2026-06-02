/**
 * Foundation generator: credit-and-loans
 *
 * core-drill + extended-fit + modelling-rich tier:
 *   14 MCQ + 11 SHORT_ANSWER + 3 EXTENDED_ANSWER + 2 EXTENDED_RESPONSE = 30
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/credit-and-loans.json");

const TOPIC = "algebra-number-and-structure";
const SUB = "credit-and-loans";

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

const er = (
  preamble: string,
  difficulty: Diff,
  parts: Array<{ label: string; marks: number; content: string; solution: string }>,
): Item => ({
  type: "EXTENDED_RESPONSE",
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
    "A purchase has a sticker price of $\\$1\\,200$. A $\\$200$ deposit is paid up front. The remaining balance to be financed is:",
    ["$\\$1\\,400$", "$\\$1\\,200$", "$\\$1\\,000$", "$\\$800$"],
    "C",
    "EASY",
    "Balance financed $= \\$1\\,200 - \\$200 = \\$1\\,000$.\n\n**Answer: C**",
  ),
  mcq(
    "A short-term loan of $\\$3\\,000$ has a $\\$60$ application fee. The total amount to be repaid (excluding interest) is:",
    ["$\\$2\\,940$", "$\\$3\\,000$", "$\\$3\\,060$", "$\\$3\\,120$"],
    "C",
    "EASY",
    "Total $= \\$3\\,000 + \\$60 = \\$3\\,060$.\n\n**Answer: C**",
  ),
  mcq(
    "Mia repays a loan in $24$ monthly instalments of $\\$150$. The total amount she repays is:",
    ["$\\$1\\,800$", "$\\$3\\,000$", "$\\$3\\,600$", "$\\$4\\,800$"],
    "C",
    "EASY",
    "$24 \\times \\$150 = \\$3\\,600$.\n\n**Answer: C**",
  ),
  mcq(
    "A credit card charges a flat annual fee of $\\$120$, billed monthly. The monthly charge is:",
    ["$\\$10$", "$\\$12$", "$\\$15$", "$\\$120$"],
    "A",
    "EASY",
    "$\\dfrac{\\$120}{12} = \\$10$ per month.\n\n**Answer: A**",
  ),
  mcq(
    "A personal loan of $\\$8\\,000$ is to be repaid in $40$ equal monthly instalments. Ignoring interest, the monthly repayment is:",
    ["$\\$150$", "$\\$180$", "$\\$200$", "$\\$240$"],
    "C",
    "EASY",
    "$\\dfrac{\\$8\\,000}{40} = \\$200$ per month.\n\n**Answer: C**",
  ),
  mcq(
    "A credit card has an unpaid balance of $\\$500$ and charges $1.5\\%$ interest for one month. The interest charged for that month is:",
    ["$\\$5.00$", "$\\$7.50$", "$\\$15.00$", "$\\$75.00$"],
    "B",
    "MEDIUM",
    "Interest $= 1.5\\% \\times \\$500 = 0.015 \\times 500 = \\$7.50$.\n\n**Answer: B**",
  ),
  mcq(
    "A loan of $\\$2\\,000$ is taken at simple interest of $8\\%$ per annum for $2$ years. The total amount repayable is:",
    ["$\\$2\\,160$", "$\\$2\\,320$", "$\\$2\\,160$", "$\\$2\\,400$"],
    "B",
    "MEDIUM",
    "Interest $= 2000 \\times 0.08 \\times 2 = \\$320$. Total $= \\$2\\,000 + \\$320 = \\$2\\,320$.\n\n**Answer: B**",
  ),
  mcq(
    "Daniel borrows $\\$5\\,000$ at simple interest of $6\\%$ per annum for $3$ years. The interest he must pay is:",
    ["$\\$300$", "$\\$600$", "$\\$900$", "$\\$1\\,500$"],
    "C",
    "MEDIUM",
    "$I = 5000 \\times 0.06 \\times 3 = \\$900$.\n\n**Answer: C**",
  ),
  mcq(
    "A car loan of $\\$15\\,000$ is repaid in $60$ monthly instalments of $\\$300$. The total interest paid is:",
    ["$\\$3\\,000$", "$\\$15\\,000$", "$\\$18\\,000$", "$\\$300$"],
    "A",
    "MEDIUM",
    "Total repaid $= 60 \\times \\$300 = \\$18\\,000$. Interest $= \\$18\\,000 - \\$15\\,000 = \\$3\\,000$.\n\n**Answer: A**",
  ),
  mcq(
    "A store credit account charges $18\\%$ per annum on outstanding balances. The monthly rate is:",
    ["$0.15\\%$", "$1.5\\%$", "$1.8\\%$", "$15\\%$"],
    "B",
    "MEDIUM",
    "$\\dfrac{18\\%}{12} = 1.5\\%$ per month.\n\n**Answer: B**",
  ),
  mcq(
    "A credit card has an outstanding balance of $\\$1\\,200$ and a monthly interest rate of $2\\%$. If only the interest is paid this month, the next month's starting balance is:",
    ["$\\$1\\,200$", "$\\$1\\,176$", "$\\$1\\,224$", "$\\$1\\,440$"],
    "A",
    "MEDIUM",
    "Paying only the interest means the principal does not reduce, so the balance remains $\\$1\\,200$.\n\n**Answer: A**",
  ),
  mcq(
    "A laptop costs $\\$1\\,800$ on a $24$-month interest-free finance plan with monthly instalments. The monthly instalment is:",
    ["$\\$50$", "$\\$60$", "$\\$75$", "$\\$90$"],
    "C",
    "MEDIUM",
    "$\\dfrac{\\$1\\,800}{24} = \\$75$ per month.\n\n**Answer: C**",
  ),
  mcq(
    "An advertised monthly repayment for a personal loan is $\\$240$ over $5$ years. The total amount repaid is:",
    ["$\\$2\\,880$", "$\\$5\\,760$", "$\\$12\\,000$", "$\\$14\\,400$"],
    "D",
    "HARD",
    "Total instalments $= 5 \\times 12 = 60$ months. Total repaid $= 60 \\times \\$240 = \\$14\\,400$.\n\n**Answer: D**",
  ),
  mcq(
    "A loan of $\\$4\\,000$ at simple interest is repaid by $\\$5\\,200$ at the end of $3$ years. The annual simple interest rate is:",
    ["$5\\%$", "$8\\%$", "$10\\%$", "$15\\%$"],
    "C",
    "HARD",
    "Interest $= \\$5\\,200 - \\$4\\,000 = \\$1\\,200$. Rate $= \\dfrac{1200}{4000 \\times 3} = 0.10 = 10\\%$ per annum.\n\n**Answer: C**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "A credit card statement shows an unpaid balance of $\\$400$ and a monthly interest rate of $2\\%$. Calculate the interest charged this month.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Interest $= 2\\% \\times \\$400 = 0.02 \\times 400 = \\$8.00$.",
  ),
  sa(
    "Ben repays a personal loan in $36$ monthly instalments of $\\$250$. Calculate the total amount he repays.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Total $= 36 \\times \\$250 = \\$9\\,000$.",
  ),
  sa(
    "A $\\$1\\,500$ TV is purchased with a $\\$300$ deposit and the balance financed. Calculate the amount to be financed.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Balance $= \\$1\\,500 - \\$300 = \\$1\\,200$.",
  ),
  sa(
    "A loan of $\\$2\\,500$ is taken at simple interest of $7\\%$ per annum for $4$ years. Calculate the simple interest charged.",
    2,
    "EASY",
    "**Step 1 (1 mark):** $I = P \\times r \\times t = 2500 \\times 0.07 \\times 4$.\n\n**Step 2 (1 mark):** $= \\$700$.",
  ),
  sa(
    "Lisa borrows $\\$6\\,000$ at $5\\%$ per annum simple interest for $3$ years. Calculate the total amount she must repay.",
    2,
    "EASY",
    "**Step 1 (1 mark):** $I = 6000 \\times 0.05 \\times 3 = \\$900$.\n\n**Step 2 (1 mark):** Total $= \\$6\\,000 + \\$900 = \\$6\\,900$.",
  ),
  sa(
    "A credit card has an unpaid balance of $\\$800$ and an annual interest rate of $18\\%$. Calculate the interest charged for one month.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Monthly rate $= \\dfrac{18\\%}{12} = 1.5\\%$.\n\n**Step 2 (1 mark):** Interest $= 0.015 \\times \\$800 = \\$12.00$.",
  ),
  sa(
    "A car loan of $\\$20\\,000$ is repaid over $5$ years at $\\$400$ per month. Calculate the total interest paid over the life of the loan.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Total repaid $= 5 \\times 12 \\times \\$400 = \\$24\\,000$.\n\n**Step 2 (1 mark):** Interest $= \\$24\\,000 - \\$20\\,000 = \\$4\\,000$.",
  ),
  sa(
    "A furniture store advertises a $\\$2\\,400$ lounge with $24$ monthly interest-free instalments. Calculate the monthly instalment.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Monthly $= \\dfrac{\\$2\\,400}{24}$.\n\n**Step 2 (1 mark):** $= \\$100.00$ per month.",
  ),
  sa(
    "A short-term loan of $\\$1\\,800$ is taken for $9$ months at $12\\%$ per annum simple interest. Calculate the interest charged, correct to the nearest cent.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Time in years: $t = \\dfrac{9}{12} = 0.75$.\n\n**Step 2 (1 mark):** $I = 1800 \\times 0.12 \\times 0.75$.\n\n**Step 3 (1 mark):** $= \\$162.00$.",
  ),
  sa(
    "Amir's credit card balance is $\\$1\\,500$. The card charges interest at $1.8\\%$ per month on the unpaid balance. Calculate the new balance after one month, assuming no repayments and no new purchases.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Interest $= 0.018 \\times \\$1\\,500 = \\$27.00$.\n\n**Step 2 (1 mark):** New balance $= \\$1\\,500 + \\$27 = \\$1\\,527.00$.",
  ),
  sa(
    "A loan of $\\$3\\,000$ is repaid with $24$ monthly instalments of $\\$140$. Calculate the total interest paid and express it as a percentage of the original loan amount, correct to one decimal place.",
    3,
    "HARD",
    "**Step 1 (1 mark):** Total repaid $= 24 \\times \\$140 = \\$3\\,360$.\n\n**Step 2 (1 mark):** Interest $= \\$3\\,360 - \\$3\\,000 = \\$360$.\n\n**Step 3 (1 mark):** Percentage $= \\dfrac{360}{3000} \\times 100 = 12.0\\%$.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "Hannah is buying a fridge that costs $\\$1\\,500$. She pays a deposit of $\\$300$ and finances the rest with a loan at $8\\%$ per annum simple interest, repaid over $2$ years in monthly instalments.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the amount she finances.",
        solution: "**Step 1 (1 mark):** Amount financed $= \\$1\\,500 - \\$300 = \\$1\\,200$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the simple interest charged over the $2$-year loan.",
        solution: "**Step 1 (1 mark):** $I = 1200 \\times 0.08 \\times 2$.\n\n**Step 2 (1 mark):** $= \\$192$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate her monthly repayment, correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** Total to repay: $\\$1\\,200 + \\$192 = \\$1\\,392$. Months: $24$.\n\n**Step 2 (1 mark):** Monthly: $\\dfrac{\\$1\\,392}{24} = \\$58.00$ per month.",
      },
    ],
  ),
  ea(
    "Rohan has a credit card with an unpaid balance of $\\$2\\,000$. The card charges $18\\%$ per annum on unpaid balances, calculated monthly.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the monthly interest rate.",
        solution: "**Step 1 (1 mark):** Monthly rate $= \\dfrac{18\\%}{12} = 1.5\\%$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the interest charged in the first month if no repayment is made.",
        solution: "**Step 1 (1 mark):** Interest $= 0.015 \\times \\$2\\,000$.\n\n**Step 2 (1 mark):** $= \\$30.00$.",
      },
      {
        label: "c",
        marks: 2,
        content: "If Rohan repays $\\$100$ at the end of the first month, calculate the balance carried into the second month.",
        solution: "**Step 1 (1 mark):** Balance after interest: $\\$2\\,000 + \\$30 = \\$2\\,030$.\n\n**Step 2 (1 mark):** After repayment: $\\$2\\,030 - \\$100 = \\$1\\,930$.",
      },
    ],
  ),
  ea(
    "Sophie takes a car loan of $\\$15\\,000$ to be repaid in monthly instalments of $\\$310$ over $5$ years.",
    "HARD",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the total number of repayments.",
        solution: "**Step 1 (1 mark):** Repayments $= 5 \\times 12 = 60$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the total amount Sophie repays.",
        solution: "**Step 1 (1 mark):** Total $= 60 \\times \\$310$.\n\n**Step 2 (1 mark):** $= \\$18\\,600$.",
      },
      {
        label: "c",
        marks: 1,
        content: "Calculate the total interest she pays over the loan.",
        solution: "**Step 1 (1 mark):** Interest $= \\$18\\,600 - \\$15\\,000 = \\$3\\,600$.",
      },
      {
        label: "d",
        marks: 2,
        content: "Express the total interest as a percentage of the original loan, correct to one decimal place.",
        solution: "**Step 1 (1 mark):** $\\dfrac{3600}{15\\,000} \\times 100$.\n\n**Step 2 (1 mark):** $= 24.0\\%$.",
      },
    ],
  ),

  // ── EXTENDED_RESPONSE (2) ───────────────────────────────────────────
  er(
    "Karen is buying a new washing machine for $\\$1\\,800$. She is considering three payment options:\n\n- **Option 1:** Pay cash now.\n- **Option 2:** Pay a $\\$300$ deposit and the balance over $12$ months at $\\$135$ per month.\n- **Option 3:** Use a credit card (no deposit) with no instalment plan, charged at $19.2\\%$ per annum on the unpaid balance. Pay $\\$180$ each month off the balance.",
    "HARD",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the total Karen pays under Option 2.",
        solution: "**Step 1 (1 mark):** Instalments total: $12 \\times \\$135 = \\$1\\,620$.\n\n**Step 2 (1 mark):** Total including deposit: $\\$300 + \\$1\\,620 = \\$1\\,920$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the amount of interest paid under Option 2.",
        solution: "**Step 1 (1 mark):** Total paid: $\\$1\\,920$ (from part a). Cost of washing machine: $\\$1\\,800$.\n\n**Step 2 (1 mark):** Interest $= \\$1\\,920 - \\$1\\,800 = \\$120$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Under Option 3, calculate the interest charged in the first month (before any repayment).",
        solution: "**Step 1 (1 mark):** Monthly rate $= \\dfrac{19.2\\%}{12} = 1.6\\%$.\n\n**Step 2 (1 mark):** Interest $= 0.016 \\times \\$1\\,800 = \\$28.80$.",
      },
      {
        label: "d",
        marks: 2,
        content: "Under Option 3, calculate the balance carried into the second month after Karen's first $\\$180$ repayment.",
        solution: "**Step 1 (1 mark):** After interest: $\\$1\\,800 + \\$28.80 = \\$1\\,828.80$.\n\n**Step 2 (1 mark):** After repayment: $\\$1\\,828.80 - \\$180 = \\$1\\,648.80$.",
      },
      {
        label: "e",
        marks: 2,
        content: "Karen has $\\$1\\,800$ in savings. Which option would you recommend? Justify your answer in one sentence, referring to the figures above.",
        solution: "**Step 1 (1 mark):** Option 1 (cash) costs only $\\$1\\,800$ — no interest is paid. Option 2 costs $\\$1\\,920$, $\\$120$ more. Option 3 carries an even higher balance and ongoing interest.\n\n**Step 2 (1 mark):** Recommendation: Option 1 is cheapest overall by at least $\\$120$, so Karen should pay cash provided she still keeps enough savings for emergencies.",
      },
    ],
  ),
  er(
    "Tom is comparing two short-term personal loans to finance a $\\$5\\,000$ holiday.\n\n- **Loan A:** $\\$5\\,000$ at $9\\%$ per annum simple interest over $3$ years, with equal monthly instalments.\n- **Loan B:** $\\$5\\,000$ at $14\\%$ per annum simple interest over $2$ years, with equal monthly instalments.",
    "HARD",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the total interest payable under Loan A.",
        solution: "**Step 1 (1 mark):** $I = 5000 \\times 0.09 \\times 3$.\n\n**Step 2 (1 mark):** $= \\$1\\,350$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the monthly repayment under Loan A, correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** Total repaid: $\\$5\\,000 + \\$1\\,350 = \\$6\\,350$ over $36$ months.\n\n**Step 2 (1 mark):** Monthly: $\\dfrac{\\$6\\,350}{36} = \\$176.39$ per month.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the total interest payable under Loan B.",
        solution: "**Step 1 (1 mark):** $I = 5000 \\times 0.14 \\times 2$.\n\n**Step 2 (1 mark):** $= \\$1\\,400$.",
      },
      {
        label: "d",
        marks: 2,
        content: "Calculate the monthly repayment under Loan B, correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** Total repaid: $\\$5\\,000 + \\$1\\,400 = \\$6\\,400$ over $24$ months.\n\n**Step 2 (1 mark):** Monthly: $\\dfrac{\\$6\\,400}{24} = \\$266.67$ per month.",
      },
      {
        label: "e",
        marks: 2,
        content: "Tom wants to minimise both the total interest paid and the monthly repayment. Which loan should he choose? Justify your answer with reference to your calculations.",
        solution: "**Step 1 (1 mark):** Loan A: total interest $\\$1\\,350$, monthly $\\$176.39$. Loan B: total interest $\\$1\\,400$, monthly $\\$266.67$.\n\n**Step 2 (1 mark):** Loan A is better on both measures — it has $\\$50$ less total interest and a much lower monthly repayment, so Tom should choose Loan A.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`credit-and-loans: wrote ${items.length} items to ${OUT}`);
