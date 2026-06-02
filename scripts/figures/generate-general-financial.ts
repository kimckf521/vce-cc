/**
 * VCE General Mathematics — cluster: financial.
 *
 * Subtopics & counts:
 *   - simple-interest (extended-fit):                                       9 MCQ + 4 SHORT + 2 EXT_ANS + 2 EXT_RESP = 17
 *   - compound-interest (modelling-rich):                                   7 MCQ + 4 SHORT + 2 EXT_ANS + 3 EXT_RESP = 16
 *   - depreciation-flat-rate-reducing-balance-unit-cost (modelling-rich):   7 MCQ + 4 SHORT + 2 EXT_ANS + 3 EXT_RESP = 16
 *   - loans-and-annuities (modelling-rich):                                 7 MCQ + 4 SHORT + 2 EXT_ANS + 3 EXT_RESP = 16
 *   - perpetuities (modelling-rich):                                        7 MCQ + 4 SHORT + 2 EXT_ANS + 3 EXT_RESP = 16
 *
 * Target: ~81 items.
 */
import * as fs from "fs";
import * as path from "path";

const OUT_DIR = path.resolve(__dirname, "../output");
const QUESTION_SET_ID = "cmpkc57xo0007ofk0uo58ws59";
const SUBJECT_SLUG = "vce-general";
const TOPIC_SLUG = "algebra-number-and-structure";

type Difficulty = "EASY" | "MEDIUM" | "HARD";
type Tech = "TECH_FREE" | "CAS_ALLOWED" | "CAS_REQUIRED";

interface ItemPart {
  label: string;
  marks: number;
  content: string;
  solution: string;
  subParts?: { label: string; marks: number; content: string; solution: string }[];
}

interface Item {
  type: "MCQ" | "SHORT_ANSWER" | "EXTENDED_ANSWER" | "EXTENDED_RESPONSE";
  topic_slug: string;
  subtopic_slugs: string[];
  difficulty: Difficulty;
  tech: Tech;
  marks: number;
  order: number;
  content: string;
  solutionContent: string;
  preamble: string | null;
  parts: ItemPart[] | null;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  correctOption: string | null;
}

const items: Item[] = [];
let order = 0;

// ─── helpers ────────────────────────────────────────────────────────────

const mcq = (
  subtopic: string,
  content: string,
  options: [string, string, string, string],
  correct: "A" | "B" | "C" | "D",
  difficulty: Difficulty,
  solution: string,
  tech: Tech = "TECH_FREE",
) => {
  items.push({
    type: "MCQ",
    topic_slug: TOPIC_SLUG,
    subtopic_slugs: [subtopic],
    difficulty,
    tech,
    marks: 1,
    order: order++,
    content,
    solutionContent: solution,
    preamble: null,
    parts: null,
    optionA: options[0],
    optionB: options[1],
    optionC: options[2],
    optionD: options[3],
    correctOption: correct,
  });
};

const short = (
  subtopic: string,
  content: string,
  marks: number,
  difficulty: Difficulty,
  solution: string,
  tech: Tech = "TECH_FREE",
) => {
  items.push({
    type: "SHORT_ANSWER",
    topic_slug: TOPIC_SLUG,
    subtopic_slugs: [subtopic],
    difficulty,
    tech,
    marks,
    order: order++,
    content,
    solutionContent: solution,
    preamble: null,
    parts: null,
    optionA: null,
    optionB: null,
    optionC: null,
    optionD: null,
    correctOption: null,
  });
};

const extAns = (
  subtopic: string,
  parts: ItemPart[],
  difficulty: Difficulty,
  preamble: string | null = null,
  tech: Tech = "CAS_ALLOWED",
) => {
  const marks = parts.reduce(
    (s, p) =>
      s + (p.subParts && p.subParts.length > 0 ? p.subParts.reduce((ss, sp) => ss + sp.marks, 0) : p.marks),
    0,
  );
  items.push({
    type: "EXTENDED_ANSWER",
    topic_slug: TOPIC_SLUG,
    subtopic_slugs: [subtopic],
    difficulty,
    tech,
    marks,
    order: order++,
    content: "",
    solutionContent: "",
    preamble,
    parts,
    optionA: null,
    optionB: null,
    optionC: null,
    optionD: null,
    correctOption: null,
  });
};

const extResp = (
  subtopic: string,
  parts: ItemPart[],
  difficulty: Difficulty,
  preamble: string,
  tech: Tech = "CAS_ALLOWED",
) => {
  const marks = parts.reduce(
    (s, p) =>
      s + (p.subParts && p.subParts.length > 0 ? p.subParts.reduce((ss, sp) => ss + sp.marks, 0) : p.marks),
    0,
  );
  items.push({
    type: "EXTENDED_RESPONSE",
    topic_slug: TOPIC_SLUG,
    subtopic_slugs: [subtopic],
    difficulty,
    tech,
    marks,
    order: order++,
    content: "",
    solutionContent: "",
    preamble,
    parts,
    optionA: null,
    optionB: null,
    optionC: null,
    optionD: null,
    correctOption: null,
  });
};

// ════════════════════════════════════════════════════════════════════════
// SUBTOPIC 1: SIMPLE INTEREST (extended-fit)
//   9 MCQ + 4 SHORT + 2 EXT_ANS + 2 EXT_RESP = 17 items
// ════════════════════════════════════════════════════════════════════════

const SI = "simple-interest";

// ─── MCQ (9) ───────────────────────────────────────────────────────────

mcq(
  SI,
  `The formula for simple interest is $I = Prt$, where $P$ is principal, $r$ is the interest rate per period (as a decimal) and $t$ is time. The simple interest earned on \\$1,200 invested for 3 years at 5% per annum is\n\n`,
  ["\\$60.00", "\\$120.00", "\\$180.00", "\\$240.00"],
  "C",
  "EASY",
  "**Answer: C**\n\n$I = Prt = 1200 \\times 0.05 \\times 3 = \\$180.00$.",
);

mcq(
  SI,
  `A principal of \\$2,500 is invested for 4 years and earns \\$400 simple interest. The annual interest rate is\n\n`,
  ["2%", "4%", "5%", "10%"],
  "B",
  "EASY",
  "**Answer: B**\n\n$r = \\dfrac{I}{Pt} = \\dfrac{400}{2500 \\times 4} = 0.04 = 4\\%$.",
);

mcq(
  SI,
  `Maria invests \\$3,000 at 6% per annum simple interest. The total amount in the account after 5 years is\n\n`,
  ["\\$900.00", "\\$3,180.00", "\\$3,900.00", "\\$4,200.00"],
  "C",
  "EASY",
  "**Answer: C**\n\n$I = 3000 \\times 0.06 \\times 5 = \\$900$. Total $A = P + I = 3000 + 900 = \\$3,900.00$.",
);

mcq(
  SI,
  `\\$4,500 earns \\$675 simple interest after 3 years. The annual interest rate is\n\n`,
  ["3%", "5%", "7.5%", "15%"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$r = \\dfrac{I}{Pt} = \\dfrac{675}{4500 \\times 3} = \\dfrac{675}{13500} = 0.05 = 5\\%$.",
);

mcq(
  SI,
  `At 4.5% per annum simple interest, how long will it take for \\$1,000 to earn \\$225 in interest?\n\n`,
  ["3 years", "4 years", "5 years", "6 years"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\n$t = \\dfrac{I}{Pr} = \\dfrac{225}{1000 \\times 0.045} = \\dfrac{225}{45} = 5$ years.",
);

mcq(
  SI,
  `If a principal $P$ is invested at simple interest rate $r$ per annum for $t$ years, the total amount $A$ is given by\n\n`,
  [
    "$A = P(1 + rt)$",
    "$A = P(1 + r)^t$",
    "$A = Prt$",
    "$A = P + r + t$",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\n$A = P + I = P + Prt = P(1 + rt)$. Option B is the compound-interest formula — a common confusion.",
);

mcq(
  SI,
  `A loan of \\$8,000 is charged simple interest at 7% per annum. The total interest payable over 6 months is\n\n`,
  ["\\$28.00", "\\$280.00", "\\$560.00", "\\$3,360.00"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n6 months = $\\dfrac{1}{2}$ year. $I = 8000 \\times 0.07 \\times 0.5 = \\$280.00$.",
);

mcq(
  SI,
  `Daniel invests an amount at 4% per annum simple interest. After 8 years the investment is worth \\$5,280. The original principal was\n\n`,
  ["\\$3,500.00", "\\$4,000.00", "\\$4,500.00", "\\$4,800.00"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$A = P(1 + rt) \\Rightarrow P = \\dfrac{A}{1 + rt} = \\dfrac{5280}{1 + 0.04 \\times 8} = \\dfrac{5280}{1.32} = \\$4,000.00$.",
);

mcq(
  SI,
  `Two investments are made for the same time period. Investment X is \\$5,000 at 3% per annum and Investment Y is \\$3,000 at $r$% per annum, both simple interest. If both investments earn the same total interest over 4 years, the value of $r$ is\n\n`,
  ["3%", "4%", "5%", "6%"],
  "C",
  "HARD",
  "**Answer: C**\n\nInvestment X: $I_X = 5000 \\times 0.03 \\times 4 = \\$600$.\n\nInvestment Y: $I_Y = 3000 \\times r/100 \\times 4 = 120r$.\n\nSet equal: $120r = 600 \\Rightarrow r = 5$. So 5%.",
);

// ─── SHORT (4) ─────────────────────────────────────────────────────────

short(
  SI,
  `Anna invests \\$6,500 in an account that pays 4.2% per annum simple interest.\n\n**a.** Find the simple interest earned after 5 years. (1 mark)\n\n**b.** State the total value of the investment after 5 years. (1 mark)\n\n**c.** Determine how many full years it would take for the simple interest earned to first exceed \\$2,000. (2 marks) (4 marks)`,
  4,
  "EASY",
  "**a.** $I = 6500 \\times 0.042 \\times 5 = \\$1,365.00$.\n\n**b.** $A = 6500 + 1365 = \\$7,865.00$.\n\n**c.** Require $6500 \\times 0.042 \\times t > 2000 \\Rightarrow 273t > 2000 \\Rightarrow t > 7.326...$. Smallest full year is $t = 8$. So **8 years**.",
);

short(
  SI,
  `A loan of \\$12,000 is taken out at 8.5% per annum simple interest. The loan is repaid in a single payment at the end of 30 months.\n\n**a.** Calculate the total interest charged. (2 marks)\n\n**b.** State the total amount repaid. (1 mark) (3 marks)`,
  3,
  "EASY",
  "**a.** $t = 30/12 = 2.5$ years. $I = 12000 \\times 0.085 \\times 2.5 = \\$2,550.00$.\n\n**b.** Total repaid $= 12000 + 2550 = \\$14,550.00$.",
);

short(
  SI,
  `Beatrice deposits \\$P$ in a simple-interest account paying $r\\%$ per annum. After 3 years the account contains \\$4,500. After 7 years it contains \\$5,500.\n\n**a.** Form two equations in $P$ and $r$. (2 marks)\n\n**b.** Solve to find $P$ and $r$. (3 marks) (5 marks)`,
  5,
  "MEDIUM",
  "**a.** Use $A = P(1 + rt)$ where $r$ is decimal:\n\n$P(1 + 3r) = 4500$ ... (1)\n\n$P(1 + 7r) = 5500$ ... (2)\n\n**b.** Subtract (1) from (2): $P(7r - 3r) = 1000 \\Rightarrow 4Pr = 1000 \\Rightarrow Pr = 250$.\n\nFrom (1): $P + 3Pr = 4500 \\Rightarrow P + 750 = 4500 \\Rightarrow P = \\$3,750.00$.\n\nThen $r = 250/3750 = 0.0667... = 6\\dfrac{2}{3}\\%$ (or 6.67%).",
  "CAS_ALLOWED",
);

short(
  SI,
  `A car dealership offers two payment plans for a \\$20,000 vehicle:\n\n* Plan A: pay \\$5,000 deposit and take out a loan for the balance at 9% per annum simple interest, repayable in 3 years.\n* Plan B: pay the full \\$20,000 immediately.\n\n**a.** Find the total interest charged under Plan A. (2 marks)\n\n**b.** Find the total cost of the vehicle under Plan A. (1 mark)\n\n**c.** Determine the saving (in dollars) by choosing Plan B over Plan A. (1 mark) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** Loan amount = $20000 - 5000 = \\$15,000$. $I = 15000 \\times 0.09 \\times 3 = \\$4,050.00$.\n\n**b.** Total cost under Plan A = $5000 + 15000 + 4050 = \\$24,050.00$.\n\n**c.** Saving = $24050 - 20000 = \\$4,050.00$.",
);

// ─── EXT_ANS (2) ───────────────────────────────────────────────────────

extAns(
  SI,
  [
    {
      label: "a",
      marks: 1,
      content: `Calculate the interest earned by Caleb in the first year.`,
      solution: "$I_{\\text{year 1}} = 10000 \\times 0.0375 \\times 1 = \\$375.00$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the total amount in the account at the end of 6 years.`,
      solution: "$I = 10000 \\times 0.0375 \\times 6 = \\$2,250.00$. Total $A = 10000 + 2250 = \\$12,250.00$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Caleb wishes to save \\$15,000 for a deposit on a car. How many full years from the start of the investment will this take, assuming no extra deposits?`,
      solution: "Require $A \\geq 15000$. $10000(1 + 0.0375 \\times t) \\geq 15000 \\Rightarrow 1 + 0.0375t \\geq 1.5 \\Rightarrow 0.0375t \\geq 0.5 \\Rightarrow t \\geq 13.33...$ years. Smallest full year is $t = 14$. So **14 years**.",
    },
    {
      label: "d",
      marks: 2,
      content: `If instead Caleb wanted to reach \\$15,000 in exactly 10 years, what annual simple-interest rate would be required?`,
      solution: "Require $10000(1 + 10r) = 15000 \\Rightarrow 1 + 10r = 1.5 \\Rightarrow r = 0.05 = \\textbf{5\\% p.a.}$.",
    },
  ],
  "MEDIUM",
  `Caleb invests \\$10,000 in a savings account that earns 3.75% per annum simple interest. He does not deposit or withdraw any money after the initial deposit.`,
);

extAns(
  SI,
  [
    {
      label: "a",
      marks: 2,
      content: `Determine the simple interest charged on the loan over the 4-year term.`,
      solution: "$I = 18000 \\times 0.072 \\times 4 = \\$5,184.00$.",
    },
    {
      label: "b",
      marks: 2,
      content: `The total amount owing (principal + interest) is repaid in 48 equal monthly instalments. Calculate the size of each monthly repayment, correct to the nearest cent.`,
      solution: "Total to repay = $18000 + 5184 = \\$23,184.00$. Monthly = $23184/48 = \\$483.00$.",
    },
    {
      label: "c",
      marks: 2,
      content: `A second lender offers the same \\$18,000 loan at 6.9% per annum simple interest over 5 years. Determine which loan is cheaper overall, and by how much.`,
      solution: "Lender 2 interest: $I = 18000 \\times 0.069 \\times 5 = \\$6,210$. Total = \\$24,210.\n\nLender 1 total = \\$23,184; Lender 2 total = \\$24,210. **Lender 1 is cheaper by** $24210 - 23184 = \\$1,026.00$.",
    },
  ],
  "MEDIUM",
  `A small business takes out an \\$18,000 loan at 7.2% per annum simple interest, repayable over 4 years.`,
);

// ─── EXT_RESP (2) ──────────────────────────────────────────────────────

extResp(
  SI,
  [
    {
      label: "a",
      marks: 1,
      content: `State the formula for simple interest and identify each variable in the formula.`,
      solution: "$I = Prt$, where $I$ = simple interest (\\$), $P$ = principal (\\$), $r$ = interest rate per period (decimal), $t$ = time (in matching periods).",
    },
    {
      label: "b",
      marks: 2,
      content: `Calculate the simple interest earned on Account A after 6 years.`,
      solution: "Account A: $P = 8000$, $r = 0.038$, $t = 6$. $I_A = 8000 \\times 0.038 \\times 6 = \\$1,824.00$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Calculate the simple interest earned on Account B after 6 years and state which account has earned more, and by how much.`,
      solution: "Account B: $P = 6500$, $r = 0.052$, $t = 6$. $I_B = 6500 \\times 0.052 \\times 6 = \\$2,028.00$.\n\nDifference = $2028 - 1824 = \\$204$. **Account B earns more**, by \\$204.00.",
    },
    {
      label: "d",
      marks: 2,
      content: `Determine after how many full years the total value of Account B first exceeds the total value of Account A.`,
      solution: "$A_A(t) = 8000(1 + 0.038t) = 8000 + 304t$\n\n$A_B(t) = 6500(1 + 0.052t) = 6500 + 338t$\n\nSet $A_B > A_A$: $6500 + 338t > 8000 + 304t \\Rightarrow 34t > 1500 \\Rightarrow t > 44.117...$. Smallest full year = **45**.",
    },
    {
      label: "e",
      marks: 3,
      content: `A third account, Account C, offers a rate of $r\\%$ per annum simple interest with a principal of \\$10,000. Find the rate $r$ required so that Account C reaches a total of \\$13,000 in exactly 5 years.`,
      solution: "$10000(1 + 5 \\times r/100) = 13000 \\Rightarrow 1 + 0.05r = 1.3 \\Rightarrow 0.05r = 0.3 \\Rightarrow r = 6$. So **6% p.a.**",
    },
  ],
  "MEDIUM",
  `**Question — Comparing simple-interest accounts**\n\nTwo savings accounts both earn simple interest. Account A starts with a principal of \\$8,000 at 3.8% per annum. Account B starts with a principal of \\$6,500 at 5.2% per annum. Neither account allows further deposits or withdrawals.`,
);

extResp(
  SI,
  [
    {
      label: "a",
      marks: 2,
      content: `Calculate the simple interest charged over the 5-year term.`,
      solution: "$I = 22000 \\times 0.0825 \\times 5 = \\$9,075.00$.",
    },
    {
      label: "b",
      marks: 1,
      content: `State the total amount Eli will repay (principal + interest).`,
      solution: "Total repaid = $22000 + 9075 = \\$31,075.00$.",
    },
    {
      label: "c",
      marks: 2,
      content: `The loan is repaid in equal monthly instalments over 5 years. Find the size of each monthly repayment, correct to the nearest cent.`,
      solution: "Months = $5 \\times 12 = 60$. Monthly = $31075/60 = \\$517.9166...$ = **\\$517.92** (nearest cent).",
    },
    {
      label: "d",
      marks: 3,
      content: `Eli is offered an alternative loan plan: pay a flat application fee of \\$500 and 7.4% per annum simple interest over 5 years on the same \\$22,000. Show that this plan costs less than the original, and state the saving.`,
      solution: "Alternative interest: $I = 22000 \\times 0.074 \\times 5 = \\$8,140.00$. With fee: $8140 + 500 = \\$8,640$.\n\nOriginal interest = \\$9,075. **Alternative is cheaper** by $9075 - 8640 = \\$435.00$.",
    },
    {
      label: "e",
      marks: 3,
      content: `Eli now considers repaying the original loan after just 30 months instead of 60. If 30 months of interest is charged at the same 8.25% per annum simple-interest rate, and the loan must be paid off in a lump sum, calculate (i) the interest charged and (ii) the total payout amount.`,
      solution: "**(i)** $t = 30/12 = 2.5$ years. $I = 22000 \\times 0.0825 \\times 2.5 = \\$4,537.50$.\n\n**(ii)** Total payout = $22000 + 4537.50 = \\$26,537.50$.",
    },
  ],
  "HARD",
  `**Question — Personal loan analysis**\n\nEli takes out a personal loan of \\$22,000 at an interest rate of 8.25% per annum simple interest. The loan is repaid in equal monthly instalments over 5 years.`,
);

// ════════════════════════════════════════════════════════════════════════
// SUBTOPIC 2: COMPOUND INTEREST (modelling-rich)
//   7 MCQ + 4 SHORT + 2 EXT_ANS + 3 EXT_RESP = 16 items
// ════════════════════════════════════════════════════════════════════════

const CI = "compound-interest";

// ─── MCQ (7) ───────────────────────────────────────────────────────────

mcq(
  CI,
  `The compound-interest formula for an investment of principal $P$ at nominal annual rate $r$ compounded $n$ times per year for $t$ years is\n\n`,
  [
    "$A = P(1 + r)^t$",
    "$A = P(1 + r/n)^{nt}$",
    "$A = P(1 + rt)^n$",
    "$A = P + rt$",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\n$A = P(1 + r/n)^{nt}$. Option A is the special case $n = 1$ (annual compounding). Option D is simple-interest growth.",
);

mcq(
  CI,
  `An amount of \\$5,000 is invested at 6% per annum compounded annually for 4 years. The amount at the end of the period is closest to\n\n`,
  ["\\$5,840.00", "\\$6,200.00", "\\$6,312.38", "\\$6,816.40"],
  "C",
  "EASY",
  "**Answer: C**\n\n$A = 5000(1.06)^4 = 5000 \\times 1.262477 = \\$6,312.38$.",
);

mcq(
  CI,
  `If \\$10,000 is invested at 4% per annum compounded quarterly for 3 years, the future value is closest to\n\n`,
  ["\\$11,200.00", "\\$11,249.86", "\\$11,268.25", "\\$12,486.65"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\n$A = 10000(1 + 0.04/4)^{4 \\times 3} = 10000(1.01)^{12} = 10000 \\times 1.126825... = \\$11,268.25$.",
);

mcq(
  CI,
  `For an investment of \\$2,000 at 8% per annum compounded monthly, the recurrence relation modelling the balance $V_n$ (after $n$ months) is\n\n`,
  [
    "$V_{n+1} = 1.08 V_n$, $V_0 = 2000$",
    "$V_{n+1} = 1.008 V_n$, $V_0 = 2000$",
    "$V_{n+1} = 1.00\\overline{6} V_n$, $V_0 = 2000$",
    "$V_{n+1} = V_n + 0.08 \\times 2000$, $V_0 = 2000$",
  ],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nMonthly compounding: $r/n = 0.08/12 = 0.00\\overline{6}$, so $R = 1 + 0.08/12 = 1.00\\overline{6}\\dots$ (which equals $1.00666...$). Option B uses $r = 0.008$, mistakenly treating 8% as already a monthly rate.",
);

mcq(
  CI,
  `The effective annual interest rate when 6% per annum is compounded monthly is closest to\n\n`,
  ["6.00%", "6.12%", "6.17%", "6.30%"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\n$r_e = (1 + 0.06/12)^{12} - 1 = (1.005)^{12} - 1 = 1.0617 - 1 = 0.0617 = \\textbf{6.17\\%}$.",
);

mcq(
  CI,
  `A sum of \\$P$ is invested at 5% per annum compounded annually. After how many full years will the investment have **more than doubled** in value?\n\n`,
  ["12", "13", "14", "15"],
  "D",
  "HARD",
  "**Answer: D**\n\nRequire $(1.05)^t > 2$. Taking logs: $t > \\log 2 / \\log 1.05 = 0.6931 / 0.04879 = 14.207$. Smallest integer $t = 15$. (At $t = 14$: $1.05^{14} = 1.9799$ — not yet doubled; at $t = 15$: $1.05^{15} = 2.0789$.)",
  "CAS_ALLOWED",
);

mcq(
  CI,
  `\\$8,000 is invested for 5 years at 4% per annum compounded monthly. The future value is closest to\n\n`,
  ["\\$9,600.00", "\\$9,733.07", "\\$9,767.97", "\\$10,210.20"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\n$A = 8000(1 + 0.04/12)^{60} = 8000(1.00333\\overline{3})^{60} = 8000 \\times 1.220997 = \\$9,767.97$.",
  "CAS_ALLOWED",
);

// ─── SHORT (4) ─────────────────────────────────────────────────────────

short(
  CI,
  `An amount of \\$4,500 is invested at 5.4% per annum compounded annually.\n\n**a.** Write a recurrence relation for the balance $V_n$ after $n$ years, including $V_0$. (2 marks)\n\n**b.** Find the balance at the end of 4 years, correct to the nearest cent. (2 marks)\n\n**c.** Determine the total interest earned over the 4 years. (1 mark) (5 marks)`,
  5,
  "EASY",
  "**a.** $V_{n+1} = 1.054 V_n$, $V_0 = 4500$.\n\n**b.** $V_4 = 4500(1.054)^4 = 4500 \\times 1.234064... = \\$5,553.29$.\n\n**c.** Interest = $5553.29 - 4500 = \\$1,053.29$.",
  "CAS_ALLOWED",
);

short(
  CI,
  `\\$12,000 is invested at 6% per annum compounded quarterly.\n\n**a.** State the interest rate per compounding period. (1 mark)\n\n**b.** State the total number of compounding periods over 5 years. (1 mark)\n\n**c.** Find the future value of the investment after 5 years, correct to the nearest cent. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** Rate per period = $0.06/4 = 0.015$ = **1.5% per quarter**.\n\n**b.** Periods = $5 \\times 4 = $ **20 quarters**.\n\n**c.** $A = 12000(1.015)^{20} = 12000 \\times 1.346855 = \\$16,162.27$.",
  "CAS_ALLOWED",
);

short(
  CI,
  `Compare two investment options for \\$10,000 over 3 years:\n\n* Option X: 6.0% per annum simple interest.\n* Option Y: 5.8% per annum compounded monthly.\n\n**a.** Find the total amount under Option X. (1 mark)\n\n**b.** Find the total amount under Option Y, correct to the nearest cent. (2 marks)\n\n**c.** State which option produces the larger return, and by how much. (1 mark) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** $A_X = 10000(1 + 0.06 \\times 3) = 10000 \\times 1.18 = \\$11,800.00$.\n\n**b.** $A_Y = 10000(1 + 0.058/12)^{36} = 10000(1.004833...)^{36} = 10000 \\times 1.189775... = \\$11,897.75$.\n\n**c.** **Option Y** is larger by $11897.75 - 11800.00 = \\$97.75$.",
  "CAS_ALLOWED",
);

short(
  CI,
  `An investment of \\$P$ at 7.2% per annum compounded monthly grows to \\$15,000 in 8 years.\n\n**a.** Set up an equation in $P$ using the compound-interest formula. (1 mark)\n\n**b.** Solve to find $P$, correct to the nearest cent. (3 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** $P(1 + 0.072/12)^{8 \\times 12} = 15000$, i.e. $P(1.006)^{96} = 15000$.\n\n**b.** $(1.006)^{96} = 1.776982...$\n\n$P = 15000 / 1.776982 = \\$8,441.18$ (nearest cent).",
  "CAS_REQUIRED",
);

// ─── EXT_ANS (2) ───────────────────────────────────────────────────────

extAns(
  CI,
  [
    {
      label: "a",
      marks: 2,
      content: `Write a recurrence relation modelling the balance $V_n$ at the end of year $n$, including the initial condition $V_0$.`,
      solution: "Annual rate = 4.8%. $V_{n+1} = 1.048 V_n$, with $V_0 = 25000$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the balance at the end of 3 years, correct to the nearest cent.`,
      solution: "$V_3 = 25000(1.048)^3 = 25000 \\times 1.151023 = \\$28,775.56$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Find the total interest earned over the 3-year period and the average annual interest.`,
      solution: "Interest = $V_3 - V_0 = 28775.56 - 25000 = \\$3,775.56$.\n\nAverage annual interest = $3775.56 / 3 = \\$1,258.52$.",
    },
    {
      label: "d",
      marks: 3,
      content: `If the bank changes the compounding frequency to quarterly (keeping the nominal annual rate at 4.8%), find the new balance after 3 years and the additional interest earned compared with annual compounding.`,
      solution: "Quarterly: $A = 25000(1 + 0.048/4)^{12} = 25000(1.012)^{12} = 25000 \\times 1.153876 = \\$28,847.37$.\n\nAdditional interest = $28847.37 - 28775.56 = \\$71.81$.",
    },
  ],
  "MEDIUM",
  `Lily deposits \\$25,000 into a high-interest account that pays 4.8% per annum, compounded annually. She makes no further deposits or withdrawals.`,
);

extAns(
  CI,
  [
    {
      label: "a",
      marks: 2,
      content: `Find the balance of Account A after 5 years, correct to the nearest cent.`,
      solution: "Account A: monthly compounding at 5.4% pa. $A = 8000(1 + 0.054/12)^{60} = 8000(1.0045)^{60} = 8000 \\times 1.309171 = \\$10,473.37$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the balance of Account B after 5 years, correct to the nearest cent.`,
      solution: "Account B: half-yearly compounding at 5.6% pa. $A = 8000(1 + 0.056/2)^{10} = 8000(1.028)^{10} = 8000 \\times 1.318048 = \\$10,544.38$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Determine the effective annual rate for each account, correct to 2 decimal places, and explain which account produces the higher return.`,
      solution: "Account A: $r_e = (1 + 0.054/12)^{12} - 1 = (1.0045)^{12} - 1 = 0.055357 = \\textbf{5.54\\%}$.\n\nAccount B: $r_e = (1 + 0.056/2)^{2} - 1 = (1.028)^2 - 1 = 0.056784 = \\textbf{5.68\\%}$.\n\n**Account B** is higher (5.68% > 5.54%), consistent with its higher 5-year value.",
    },
  ],
  "MEDIUM",
  `Two banks offer competing investment accounts. Account A pays a nominal rate of 5.4% per annum compounded monthly. Account B pays a nominal rate of 5.6% per annum compounded half-yearly. Theo invests \\$8,000 in each account.`,
);

// ─── EXT_RESP (3) ──────────────────────────────────────────────────────

extResp(
  CI,
  [
    {
      label: "a",
      marks: 2,
      content: `Write a recurrence relation for the balance $V_n$ after $n$ months. State $V_0$.`,
      solution: "Monthly rate = $0.072/12 = 0.006$. Recurrence: $V_{n+1} = 1.006 V_n$, $V_0 = 50000$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Compute $V_1$, $V_2$ and $V_3$ (balance after 1, 2 and 3 months), correct to the nearest cent.`,
      solution: "$V_1 = 50000 \\times 1.006 = \\$50,300.00$.\n\n$V_2 = 50300 \\times 1.006 = \\$50,601.80$.\n\n$V_3 = 50601.80 \\times 1.006 = \\$50,905.41$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Find the balance after 4 years (48 months), correct to the nearest cent.`,
      solution: "$V_{48} = 50000(1.006)^{48} = 50000 \\times 1.332610 = \\$66,630.50$.",
    },
    {
      label: "d",
      marks: 2,
      content: `Find the total interest earned over the 4-year period.`,
      solution: "Interest = $66630.50 - 50000 = \\$16,630.50$.",
    },
    {
      label: "e",
      marks: 3,
      content: `Determine the effective annual rate of interest for this account, correct to 2 decimal places. Express your answer as a percentage.`,
      solution: "$r_e = (1 + 0.072/12)^{12} - 1 = (1.006)^{12} - 1 = 1.074424 - 1 = 0.07442$ = **7.44%**.",
    },
  ],
  "MEDIUM",
  `**Question — Investment growth with monthly compounding**\n\nA university savings fund holds \\$50,000 in an account that pays 7.2% per annum compounded monthly. No further deposits or withdrawals are made.`,
);

extResp(
  CI,
  [
    {
      label: "a",
      marks: 1,
      content: `Determine the periodic interest rate (rate per compounding period) for the investment, expressed as a decimal.`,
      solution: "Quarterly rate = $0.064/4 = 0.016$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Write a recurrence relation for the balance $V_n$ after $n$ quarters, including $V_0$.`,
      solution: "$V_{n+1} = 1.016 V_n$, $V_0 = 30000$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Find the balance at the end of 6 years, correct to the nearest cent.`,
      solution: "$n = 6 \\times 4 = 24$. $V_{24} = 30000(1.016)^{24} = 30000 \\times 1.463690 = \\$43,910.69$.",
    },
    {
      label: "d",
      marks: 3,
      content: `Determine how many full quarters are required for the investment to first exceed \\$50,000.`,
      solution: "Require $30000(1.016)^n > 50000 \\Rightarrow (1.016)^n > 5/3 = 1.6667$.\n\n$n > \\log(1.6667)/\\log(1.016) = 0.22185/0.006893 = 32.181$.\n\nSmallest integer $n$ = **33 quarters** (approximately 8.25 years). Check: $(1.016)^{33} = 1.688466$, so $V_{33} = 30000 \\times 1.688466 = \\$50,653.99$ — first exceeds \\$50,000.",
    },
    {
      label: "e",
      marks: 3,
      content: `The bank introduces an option to switch to monthly compounding at the same nominal rate of 6.4% per annum. Find the future value after 6 years under monthly compounding (correct to the nearest cent), and state the additional interest earned compared with quarterly compounding.`,
      solution: "Monthly: $A = 30000(1 + 0.064/12)^{72} = 30000(1.00533\\overline{3})^{72} = 30000 \\times 1.466648 = \\$43,999.44$.\n\nAdditional interest = $43999.44 - 43910.69 = \\$88.75$.",
    },
  ],
  "HARD",
  `**Question — Savings fund with quarterly compounding**\n\nA family savings account holds \\$30,000 invested at 6.4% per annum compounded quarterly. No further deposits or withdrawals are made.`,
);

extResp(
  CI,
  [
    {
      label: "a",
      marks: 2,
      content: `Determine the effective annual interest rate for Plan A and Plan B, both correct to 3 decimal places.`,
      solution: "Plan A (annual): $r_e = 0.055 = \\textbf{5.500\\%}$.\n\nPlan B (monthly): $r_e = (1 + 0.054/12)^{12} - 1 = (1.0045)^{12} - 1 = 0.055370... = \\textbf{5.537\\%}$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Based on the effective annual rates, which plan delivers a higher return on a single sum invested over any whole number of years? Justify briefly.`,
      solution: "**Plan B** has the higher effective annual rate (5.537% vs 5.500%), so Plan B compounds more aggressively over each year. Over a fixed term, Plan B will always produce a larger balance from the same starting amount, irrespective of the term length (provided the term is at least 1 year).",
    },
    {
      label: "c",
      marks: 3,
      content: `Phoebe invests \\$20,000 in Plan B. Find the balance after 7 years, correct to the nearest cent.`,
      solution: "Periods = $7 \\times 12 = 84$. $A = 20000(1.0045)^{84} = 20000 \\times 1.458126 = \\$29,162.52$.",
    },
    {
      label: "d",
      marks: 2,
      content: `Calculate how much **more** Phoebe earns in 7 years from Plan B compared with Plan A on the same \\$20,000 principal.`,
      solution: "Plan A after 7 yrs: $20000(1.055)^7 = 20000 \\times 1.454679 = \\$29,093.58$.\n\nDifference: $29162.52 - 29093.58 = \\$68.94$. Plan B beats Plan A by about \\$68.94 over 7 years on \\$20,000.",
    },
    {
      label: "e",
      marks: 3,
      content: `Plan A is now changed: the nominal rate becomes 5.6% per annum, still compounded annually. Determine the **smallest whole number of years** $t$ for which Plan A's balance overtakes Plan B's balance (using the original Plan B at 5.4% pa monthly), starting from the same \\$20,000 principal.`,
      solution: "New Plan A: $A_A(t) = 20000(1.056)^t$.\n\nPlan B: $A_B(t) = 20000(1.0045)^{12t} = 20000(1.055357)^t$ (using the effective annual rate of Plan B).\n\nSet $A_A > A_B$: $(1.056)^t > (1.055357)^t$. Since $1.056 > 1.055357$, the inequality is satisfied for all $t \\geq 1$.\n\nSo the smallest whole number is **$t = 1$**. Verification: $A_A(1) = 21120.00$; $A_B(1) = 20000 \\times 1.055357 = 21107.14$. Confirmed $A_A > A_B$ after 1 year.",
    },
  ],
  "HARD",
  `**Question — Comparing investment plans**\n\nA bank offers two competing investment plans. Plan A pays 5.5% per annum compounded annually. Plan B pays 5.4% per annum compounded monthly.`,
);

// ════════════════════════════════════════════════════════════════════════
// SUBTOPIC 3: DEPRECIATION (modelling-rich)
//   7 MCQ + 4 SHORT + 2 EXT_ANS + 3 EXT_RESP = 16 items
// ════════════════════════════════════════════════════════════════════════

const DEP = "depreciation-flat-rate-reducing-balance-unit-cost";

// ─── MCQ (7) ───────────────────────────────────────────────────────────

mcq(
  DEP,
  `A machine purchased for \\$12,000 depreciates by \\$900 per year using flat-rate (straight-line) depreciation. Its book value after 5 years is\n\n`,
  ["\\$7,500.00", "\\$7,800.00", "\\$8,100.00", "\\$8,400.00"],
  "A",
  "EASY",
  "**Answer: A**\n\nFlat-rate: $V_5 = 12000 - 5 \\times 900 = 12000 - 4500 = \\$7,500.00$.",
);

mcq(
  DEP,
  `An asset depreciates by 12% per annum using reducing-balance depreciation. The recurrence relation for the book value $V_n$ at the end of year $n$ (with $V_0$ = initial value) is\n\n`,
  [
    "$V_{n+1} = V_n - 0.12$",
    "$V_{n+1} = 0.12 V_n$",
    "$V_{n+1} = 0.88 V_n$",
    "$V_{n+1} = 1.12 V_n$",
  ],
  "C",
  "EASY",
  "**Answer: C**\n\nReducing balance: $V_{n+1} = (1 - r) V_n$ where $r = 0.12$, so factor is $0.88$.",
);

mcq(
  DEP,
  `A car purchased for \\$32,000 depreciates by 18% per annum reducing balance. The book value at the end of 3 years is closest to\n\n`,
  ["\\$17,643.78", "\\$17,664.00", "\\$19,968.00", "\\$21,440.00"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\n$V_3 = 32000(1 - 0.18)^3 = 32000(0.82)^3 = 32000 \\times 0.551368 = \\$17,643.78$.",
);

mcq(
  DEP,
  `A delivery van costs \\$45,000 and is depreciated using unit-cost depreciation at a rate of \\$0.40 per kilometre travelled. After the van has travelled 75,000 km, its book value is\n\n`,
  ["\\$15,000.00", "\\$25,000.00", "\\$30,000.00", "\\$33,750.00"],
  "A",
  "EASY",
  "**Answer: A**\n\n$V = V_0 - u \\cdot k = 45000 - 0.40 \\times 75000 = 45000 - 30000 = \\$15,000.00$.",
);

mcq(
  DEP,
  `A laptop initially worth \\$2,400 is depreciated using flat-rate at \\$300 per year. The number of complete years before its book value first falls below \\$1,000 is\n\n`,
  ["4", "5", "6", "7"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$V_n = 2400 - 300n < 1000 \\Rightarrow 300n > 1400 \\Rightarrow n > 4.667$. Smallest integer $n = 5$. Check: $V_4 = 2400 - 1200 = 1200$ (still ≥ 1000); $V_5 = 2400 - 1500 = 900$ (below 1000). So **5 years**.",
);

mcq(
  DEP,
  `Which of the following statements about reducing-balance depreciation is **false**?\n\n`,
  [
    "The percentage depreciation rate is constant from year to year",
    "The dollar amount of depreciation in each year is smaller than the previous year",
    "The depreciation amount in year 1 is the largest single-year dollar drop",
    "The dollar amount of depreciation each year is constant",
  ],
  "D",
  "MEDIUM",
  "**Answer: D**\n\nIn reducing-balance depreciation, the percentage rate is constant but the **dollar amount** decreases each year (because each year's depreciation is calculated on a smaller balance). Statements A, B and C are all true. Statement D is the description of **flat-rate** depreciation, not reducing-balance — so D is false.",
);

mcq(
  DEP,
  `A printer initially valued at \\$1,200 depreciates at 15% per annum reducing balance. The total amount of depreciation (in dollars) over the first 2 years is\n\n`,
  ["\\$180.00", "\\$333.00", "\\$360.00", "\\$867.00"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$V_2 = 1200(0.85)^2 = 1200 \\times 0.7225 = \\$867.00$. Total depreciation over 2 years = $V_0 - V_2 = 1200 - 867 = \\$333.00$.",
);

// ─── SHORT (4) ─────────────────────────────────────────────────────────

short(
  DEP,
  `A van is purchased for \\$36,000 and depreciates by 12% per annum reducing balance.\n\n**a.** Write a recurrence relation for the book value $V_n$ at the end of year $n$, including $V_0$. (2 marks)\n\n**b.** Find the book value at the end of year 5, correct to the nearest cent. (2 marks)\n\n**c.** Find the total depreciation over 5 years. (1 mark) (5 marks)`,
  5,
  "EASY",
  "**a.** $V_{n+1} = 0.88 V_n$, $V_0 = 36000$.\n\n**b.** $V_5 = 36000(0.88)^5 = 36000 \\times 0.527732... = \\$18,998.36$.\n\n**c.** Depreciation = $36000 - 18998.36 = \\$17,001.64$.",
  "CAS_ALLOWED",
);

short(
  DEP,
  `A tractor cost \\$80,000 new and depreciates using flat-rate depreciation. After 8 years its book value is \\$32,000.\n\n**a.** Find the annual flat-rate depreciation amount. (2 marks)\n\n**b.** Express the annual depreciation as a percentage of the initial cost. (1 mark)\n\n**c.** Find the book value at the end of year 12. (1 mark) (4 marks)`,
  4,
  "EASY",
  "**a.** $V_n = V_0 - n \\cdot d$. $32000 = 80000 - 8d \\Rightarrow 8d = 48000 \\Rightarrow d = \\$6,000$ per year.\n\n**b.** As a percentage: $6000/80000 = 0.075 = $ **7.5%** of the initial cost.\n\n**c.** $V_{12} = 80000 - 12 \\times 6000 = 80000 - 72000 = \\$8,000.00$.",
);

short(
  DEP,
  `A photocopier purchased for \\$12,500 depreciates at \\$0.025 per copy made (unit-cost). In a typical year, the photocopier makes 60,000 copies.\n\n**a.** Find the annual depreciation in a typical year. (1 mark)\n\n**b.** Find the book value at the end of year 4, assuming 60,000 copies per year. (1 mark)\n\n**c.** Determine the number of copies needed to reduce the book value to exactly \\$2,500. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** Annual depreciation = $0.025 \\times 60000 = \\$1,500.00$.\n\n**b.** Total copies in 4 years = $4 \\times 60000 = 240000$. $V_4 = 12500 - 0.025 \\times 240000 = 12500 - 6000 = \\$6,500.00$.\n\n**c.** Require $12500 - 0.025 k = 2500 \\Rightarrow 0.025 k = 10000 \\Rightarrow k = $ **400,000 copies**.",
);

short(
  DEP,
  `Compare the book value of a \\$20,000 asset over 5 years under two depreciation methods:\n\n* Flat-rate: depreciates by \\$2,400 per year.\n* Reducing-balance: depreciates at 15% per annum.\n\n**a.** Find the book value at the end of year 5 under flat-rate depreciation. (1 mark)\n\n**b.** Find the book value at the end of year 5 under reducing-balance depreciation, correct to the nearest cent. (2 marks)\n\n**c.** State which method gives the higher book value at the end of year 5, and the difference. (1 mark) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** Flat-rate: $V_5 = 20000 - 5 \\times 2400 = 20000 - 12000 = \\$8,000.00$.\n\n**b.** Reducing-balance: $V_5 = 20000(0.85)^5 = 20000 \\times 0.443705 = \\$8,874.11$.\n\n**c.** **Reducing-balance** gives the higher value, by $8874.11 - 8000 = \\$874.11$.",
  "CAS_ALLOWED",
);

// ─── EXT_ANS (2) ───────────────────────────────────────────────────────

extAns(
  DEP,
  [
    {
      label: "a",
      marks: 2,
      content: `Write a recurrence relation for the book value $V_n$ at the end of year $n$, including $V_0$. State whether this is flat-rate or reducing-balance depreciation.`,
      solution: "$V_{n+1} = V_n - 5000$, $V_0 = 60000$. This is **flat-rate** depreciation.",
    },
    {
      label: "b",
      marks: 2,
      content: `Calculate $V_1$, $V_2$ and $V_5$.`,
      solution: "$V_1 = 60000 - 5000 = \\$55,000$.\n\n$V_2 = 55000 - 5000 = \\$50,000$.\n\n$V_5 = 60000 - 5 \\times 5000 = \\$35,000$.",
    },
    {
      label: "c",
      marks: 3,
      content: `Determine the year in which the book value first falls below \\$20,000.`,
      solution: "$V_n = 60000 - 5000 n < 20000 \\Rightarrow 5000 n > 40000 \\Rightarrow n > 8$. Smallest integer = 9. So the book value first falls below \\$20,000 at the end of **year 9** (when $V_9 = 60000 - 45000 = \\$15,000$).",
    },
  ],
  "EASY",
  `A manufacturing company purchases a machine for \\$60,000. The machine is depreciated by \\$5,000 per year using flat-rate depreciation.`,
);

extAns(
  DEP,
  [
    {
      label: "a",
      marks: 2,
      content: `Calculate the book value of the car at the end of years 1, 2 and 3.`,
      solution: "$V_1 = 28000 \\times 0.80 = \\$22,400.00$.\n\n$V_2 = 22400 \\times 0.80 = \\$17,920.00$.\n\n$V_3 = 17920 \\times 0.80 = \\$14,336.00$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the book value at the end of year 6, correct to the nearest cent.`,
      solution: "$V_6 = 28000(0.80)^6 = 28000 \\times 0.262144 = \\$7,340.03$.",
    },
    {
      label: "c",
      marks: 3,
      content: `Determine the smallest whole number of years after which the book value first falls below \\$5,000.`,
      solution: "$28000(0.80)^n < 5000 \\Rightarrow (0.80)^n < 5/28 = 0.178571$.\n\n$n > \\log(0.178571)/\\log(0.80) = (-0.7482)/(-0.0969) = 7.722$.\n\nSmallest integer $n = 8$. Check: $V_7 = 28000(0.80)^7 = \\$5,872.02$ (still above \\$5,000); $V_8 = \\$4,697.62$ (below). So **year 8**.",
    },
  ],
  "MEDIUM",
  `A car is bought for \\$28,000 and depreciates at 20% per annum reducing balance.`,
);

// ─── EXT_RESP (3) ──────────────────────────────────────────────────────

extResp(
  DEP,
  [
    {
      label: "a",
      marks: 2,
      content: `Calculate the annual flat-rate depreciation amount on Bus A and the book value at the end of year 1, 2 and 3.`,
      solution: "Annual depreciation = $0.085 \\times 90000 = \\$7,650.00$.\n\n$V_1 = 90000 - 7650 = \\$82,350$. $V_2 = \\$74,700$. $V_3 = \\$67,050$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the book value of Bus A at the end of year 8.`,
      solution: "$V_8 = 90000 - 8 \\times 7650 = 90000 - 61200 = \\$28,800.00$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Bus B is depreciated using reducing-balance depreciation at 12% per annum. Find the book value of Bus B at the end of year 8, correct to the nearest cent.`,
      solution: "$V_8 = 95000(0.88)^8 = 95000 \\times 0.359635 = \\$34,165.28$.",
    },
    {
      label: "d",
      marks: 3,
      content: `At the end of year 8, which bus has the higher book value and by how much?`,
      solution: "Bus B: \\$34,165.28. Bus A: \\$28,800.00. **Bus B** has the higher book value by $34165.28 - 28800.00 = \\$5,365.28$.",
    },
    {
      label: "e",
      marks: 3,
      content: `Find the smallest whole number of years $n$ after which Bus B's book value first falls below \\$30,000.`,
      solution: "$95000(0.88)^n < 30000 \\Rightarrow (0.88)^n < 30/95 = 0.31579$.\n\n$n > \\log(0.31579)/\\log(0.88) = (-0.50057)/(-0.05552) = 9.017$.\n\nSmallest integer $n = 10$. Check: $V_9 = 95000(0.88)^9 = \\$30,065.45$ (above \\$30,000); $V_{10} = \\$26,457.59$ (below). So **year 10**.",
    },
  ],
  "MEDIUM",
  `**Question — Bus fleet depreciation**\n\nA bus company depreciates two new buses bought in 2026. Bus A cost \\$90,000 and is depreciated using flat-rate depreciation at 8.5% of its original cost per year. Bus B cost \\$95,000 and is depreciated using reducing-balance depreciation at 12% per annum.`,
);

extResp(
  DEP,
  [
    {
      label: "a",
      marks: 2,
      content: `Calculate the depreciation in dollar terms for each of the first three years of ownership.`,
      solution: "Year 1: $40000 \\times 0.25 = \\$10,000$. So $V_1 = \\$30,000$.\n\nYear 2: $30000 \\times 0.25 = \\$7,500$. So $V_2 = \\$22,500$.\n\nYear 3: $22500 \\times 0.25 = \\$5,625$. So $V_3 = \\$16,875$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Describe one feature of reducing-balance depreciation that is illustrated by your answers in part **a**.`,
      solution: "The **dollar amount** of depreciation decreases each year (\\$10,000 → \\$7,500 → \\$5,625), even though the **percentage rate** (25%) is constant. This reflects the fact that each year's depreciation is calculated on a smaller base.",
    },
    {
      label: "c",
      marks: 2,
      content: `Find the book value at the end of year 6, correct to the nearest cent.`,
      solution: "$V_6 = 40000(0.75)^6 = 40000 \\times 0.177978... = \\$7,119.14$.",
    },
    {
      label: "d",
      marks: 3,
      content: `The truck is also used as a delivery vehicle and travels approximately 50,000 km per year. If unit-cost depreciation were used at a rate of \\$0.18 per km instead, find the book value at the end of year 6 under this method.`,
      solution: "Total km in 6 years = $6 \\times 50000 = 300000$ km. Depreciation = $0.18 \\times 300000 = \\$54,000$.\n\nBut depreciation cannot exceed the initial value. Since \\$54,000 > \\$40,000, the truck's book value reaches \\$0 before the end of year 6.\n\n*Alternatively*, the asset is fully depreciated at $k = 40000/0.18 \\approx 222{,}222$ km, which occurs during year $222222/50000 \\approx 4.44$ — that is, around year 5. After year 5, book value = \\$0.00.",
    },
    {
      label: "e",
      marks: 3,
      content: `Compare the three depreciation methods (reducing-balance at 25% pa, flat-rate at \\$5,000 per year, unit-cost at \\$0.18/km with 50,000 km/year). Which method results in the lowest book value at the end of year 4? Show calculations.`,
      solution: "Reducing-balance: $V_4 = 40000(0.75)^4 = 40000 \\times 0.31641 = \\$12,656.25$.\n\nFlat-rate: $V_4 = 40000 - 4 \\times 5000 = \\$20,000$.\n\nUnit-cost: $V_4 = 40000 - 0.18 \\times 200000 = 40000 - 36000 = \\$4,000$.\n\n**Unit-cost** gives the lowest book value (\\$4,000).",
    },
  ],
  "HARD",
  `**Question — Truck depreciation comparison**\n\nA truck is bought for \\$40,000. The company is considering three depreciation methods: reducing-balance at 25% per annum, flat-rate at \\$5,000 per year, and unit-cost at \\$0.18 per kilometre travelled.`,
);

extResp(
  DEP,
  [
    {
      label: "a",
      marks: 2,
      content: `Calculate the value of the machine at the end of year 1, year 2 and year 3.`,
      solution: "$V_1 = 50000 \\times 0.84 = \\$42,000$.\n\n$V_2 = 42000 \\times 0.84 = \\$35,280$.\n\n$V_3 = 35280 \\times 0.84 = \\$29,635.20$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the book value at the end of year 7, correct to the nearest cent.`,
      solution: "$V_7 = 50000(0.84)^7 = 50000 \\times 0.295636... = \\$14,781.78$.",
    },
    {
      label: "c",
      marks: 2,
      content: `The company has a policy of replacing the machine when its book value first falls below \\$10,000. Find the year in which the machine will be replaced.`,
      solution: "Require $50000(0.84)^n < 10000 \\Rightarrow (0.84)^n < 0.2 \\Rightarrow n > \\log 0.2 / \\log 0.84 = (-0.69897)/(-0.07572) = 9.23$.\n\nSmallest integer $n = 10$. Check: $V_9 = 50000(0.84)^9 = \\$10,431.36$ (above); $V_{10} = \\$8,762.34$ (below). The machine is replaced at the **end of year 10**.",
    },
    {
      label: "d",
      marks: 3,
      content: `The company considers switching to flat-rate depreciation at \\$6,000 per year on the same machine. Determine in which year, under the flat-rate scheme, the book value would first fall below \\$10,000, and compare with the reducing-balance result from part **c**.`,
      solution: "Flat-rate: $V_n = 50000 - 6000n < 10000 \\Rightarrow 6000n > 40000 \\Rightarrow n > 6.667$. Smallest integer $n = 7$. So replaced at the **end of year 7**, three years earlier than under reducing-balance.",
    },
    {
      label: "e",
      marks: 3,
      content: `Compare the **total** depreciation under the two methods up to the year that triggers replacement (year 10 for reducing-balance, year 7 for flat-rate). For each method, state the total amount depreciated.`,
      solution: "**Reducing-balance** (replaces year 10): $V_{10} = \\$8,762.34$. Total depreciation = $50000 - 8762.34 = \\$41,237.66$.\n\n**Flat-rate** (replaces year 7): $V_7 = 50000 - 42000 = \\$8,000$. Total depreciation = $50000 - 8000 = \\$42,000$.\n\nFlat-rate depreciates slightly more in absolute dollar terms (\\$42,000 vs \\$41,237.66) but reaches the replacement threshold sooner.",
    },
  ],
  "HARD",
  `**Question — Machine replacement policy**\n\nAn industrial machine is purchased for \\$50,000. It is depreciated using reducing-balance depreciation at 16% per annum.`,
);

// ════════════════════════════════════════════════════════════════════════
// SUBTOPIC 4: LOANS AND ANNUITIES (modelling-rich)
//   7 MCQ + 4 SHORT + 2 EXT_ANS + 3 EXT_RESP = 16 items
// ════════════════════════════════════════════════════════════════════════

const LA = "loans-and-annuities";

// ─── MCQ (7) ───────────────────────────────────────────────────────────

mcq(
  LA,
  `For a reducing-balance loan with monthly payments, the recurrence relation for the balance $V_n$ after $n$ months is\n\n`,
  [
    "$V_{n+1} = R V_n + d$",
    "$V_{n+1} = R V_n - d$",
    "$V_{n+1} = V_n - d$",
    "$V_{n+1} = V_n + R d$",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nFor a loan, interest is added then a payment $d$ is subtracted: $V_{n+1} = R V_n - d$ where $R = 1 + r$ (per-period interest factor).",
);

mcq(
  LA,
  `A loan of \\$200,000 is taken out at 4.8% per annum compounded monthly. The interest charged on the original \\$200,000 in the first month is\n\n`,
  ["\\$80.00", "\\$800.00", "\\$960.00", "\\$9,600.00"],
  "B",
  "EASY",
  "**Answer: B**\n\nMonthly rate = $0.048/12 = 0.004$. Interest = $200000 \\times 0.004 = \\$800.00$.",
);

mcq(
  LA,
  `An annuity is best described as\n\n`,
  [
    "A lump sum that grows with compound interest only",
    "A regular series of payments made to or from an investment for a fixed term",
    "A loan that is repaid in unequal instalments",
    "An investment that pays interest only and never returns the principal",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nAn annuity is a sequence of equal payments made at regular intervals over a fixed term. Option D describes a perpetuity, not an annuity.",
);

mcq(
  LA,
  `In an amortisation table for a reducing-balance loan, the **principal reduction** in any single payment is found by\n\n`,
  [
    "Payment − Interest charged that period",
    "Interest charged that period − Payment",
    "Previous balance × interest rate",
    "Payment + Interest charged that period",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nPrincipal reduction = Payment − Interest. Each payment first covers interest accrued; the remainder reduces the principal.",
);

mcq(
  LA,
  `A loan of \\$10,000 charges 6% per annum compounded monthly. If a fixed monthly repayment of \\$200 is made, the balance after the first repayment is\n\n`,
  ["\\$9,800.00", "\\$9,850.00", "\\$9,860.00", "\\$10,050.00"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nMonthly rate = $0.06/12 = 0.005$. Interest in month 1 = $10000 \\times 0.005 = \\$50$. New balance = $10000 + 50 - 200 = \\$9,850.00$.",
);

mcq(
  LA,
  `For an annuity of \\$50,000 earning 5% per annum compounded annually, with annual withdrawals of \\$4,000, the balance immediately after the first withdrawal is\n\n`,
  ["\\$46,000.00", "\\$48,500.00", "\\$50,500.00", "\\$48,750.00"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nAnnual interest = $50000 \\times 0.05 = \\$2,500$. New balance = $50000 + 2500 - 4000 = \\$48,500.00$.",
);

mcq(
  LA,
  `Over the life of an amortising loan, the proportion of each repayment that goes to interest (vs. principal) generally\n\n`,
  [
    "Stays constant",
    "Increases over time",
    "Decreases over time",
    "Fluctuates randomly",
  ],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nAs the loan balance decreases, the interest charged per period decreases. Since the total payment is fixed, a larger portion of each payment goes to principal in later periods.",
);

// ─── SHORT (4) ─────────────────────────────────────────────────────────

short(
  LA,
  `A reducing-balance loan of \\$25,000 charges 7.2% per annum compounded monthly. The borrower makes a monthly repayment of \\$500.\n\n**a.** State the monthly interest rate as a decimal. (1 mark)\n\n**b.** Write a recurrence relation for the balance $V_n$ after $n$ months, including $V_0$. (2 marks)\n\n**c.** Find the balance after 1 month and after 2 months (correct to the nearest cent). (2 marks) (5 marks)`,
  5,
  "EASY",
  "**a.** Monthly rate = $0.072/12 = 0.006$.\n\n**b.** $V_{n+1} = 1.006 V_n - 500$, $V_0 = 25000$.\n\n**c.** $V_1 = 1.006 \\times 25000 - 500 = 25150 - 500 = \\$24,650.00$.\n\n$V_2 = 1.006 \\times 24650 - 500 = 24797.90 - 500 = \\$24,297.90$.",
  "CAS_ALLOWED",
);

short(
  LA,
  `Tom borrows \\$8,000 at 9% per annum compounded monthly to be repaid by equal monthly payments over 3 years.\n\nThe first row of the amortisation table shows the **interest** on the first payment is \\$60.00 and the **principal reduction** is \\$194.49.\n\n**a.** State the monthly repayment $d$. (1 mark)\n\n**b.** Show how the interest of \\$60.00 is obtained. (1 mark)\n\n**c.** Find the new balance after the first payment. (1 mark)\n\n**d.** Find the interest charged in the second payment, correct to the nearest cent. (2 marks) (5 marks)`,
  5,
  "MEDIUM",
  "**a.** $d = 60.00 + 194.49 = \\$254.49$.\n\n**b.** Monthly rate = $0.09/12 = 0.0075$. Interest on \\$8,000 in month 1 = $8000 \\times 0.0075 = \\$60.00$. ✓\n\n**c.** Balance after payment 1 = $8000 - 194.49 = \\$7,805.51$.\n\n**d.** Interest in month 2 = $7805.51 \\times 0.0075 = \\$58.5413... = \\$58.54$.",
  "CAS_ALLOWED",
);

short(
  LA,
  `An annuity is purchased for \\$120,000 and earns 4.8% per annum compounded annually. The investor withdraws \\$10,000 at the end of each year.\n\n**a.** Write a recurrence relation for the balance $V_n$ after $n$ years, including $V_0$. (2 marks)\n\n**b.** Find the balance at the end of years 1, 2 and 3, each correct to the nearest cent. (3 marks) (5 marks)`,
  5,
  "MEDIUM",
  "**a.** $V_{n+1} = 1.048 V_n - 10000$, $V_0 = 120000$.\n\n**b.** $V_1 = 1.048 \\times 120000 - 10000 = 125760 - 10000 = \\$115,760.00$.\n\n$V_2 = 1.048 \\times 115760 - 10000 = 121316.48 - 10000 = \\$111,316.48$.\n\n$V_3 = 1.048 \\times 111316.48 - 10000 = 116659.67 - 10000 = \\$106,659.67$.",
  "CAS_ALLOWED",
);

short(
  LA,
  `A loan of \\$50,000 is taken out at 6% per annum compounded monthly. The borrower has a maximum repayment ability of \\$700 per month.\n\n**a.** Find the interest charged on the original \\$50,000 in the first month. (1 mark)\n\n**b.** Determine whether the monthly repayment of \\$700 is sufficient to reduce the loan, and by how much in the first month. (2 marks)\n\n**c.** If instead the borrower wishes the loan to be paid off in exactly 10 years (120 monthly repayments), the required monthly payment is approximately \\$555.10. Construct the first row of the amortisation table for this payment. (2 marks) (5 marks)`,
  5,
  "HARD",
  "**a.** Monthly rate = $0.06/12 = 0.005$. Interest = $50000 \\times 0.005 = \\$250.00$.\n\n**b.** \\$700 > \\$250 (interest), so the loan reduces. Principal reduction in month 1 = $700 - 250 = \\$450.00$. New balance = $50000 - 450 = \\$49,550.00$.\n\n**c.** First row of amortisation table with \\$555.10 payment:\n\n| Payment # | Payment | Interest | Principal reduction | Balance |\n|---|---|---|---|---|\n| 1 | \\$555.10 | \\$250.00 | \\$305.10 | \\$49,694.90 |\n\nInterest = $50000 \\times 0.005 = 250$; principal reduction = $555.10 - 250 = 305.10$; new balance = $50000 - 305.10 = 49694.90$.",
  "CAS_ALLOWED",
);

// ─── EXT_ANS (2) ───────────────────────────────────────────────────────

extAns(
  LA,
  [
    {
      label: "a",
      marks: 1,
      content: `State the monthly interest rate as a decimal.`,
      solution: "$r = 0.054/12 = 0.0045$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Write the recurrence relation for the balance $V_n$ after $n$ monthly repayments of \\$300, including $V_0$.`,
      solution: "$V_{n+1} = 1.0045 V_n - 300$, $V_0 = 15000$.",
    },
    {
      label: "c",
      marks: 3,
      content: `Complete the first three rows of the amortisation table below.\n\n| Payment # | Payment | Interest | Principal reduction | Balance |\n|---|---|---|---|---|\n| 1 | \\$300.00 | ? | ? | ? |\n| 2 | \\$300.00 | ? | ? | ? |\n| 3 | \\$300.00 | ? | ? | ? |`,
      solution: "| Payment # | Payment | Interest | Principal reduction | Balance |\n|---|---|---|---|---|\n| 1 | \\$300.00 | \\$67.50 | \\$232.50 | \\$14,767.50 |\n| 2 | \\$300.00 | \\$66.45 | \\$233.55 | \\$14,533.95 |\n| 3 | \\$300.00 | \\$65.40 | \\$234.60 | \\$14,299.35 |\n\nMonth 1: Int = 15000 × 0.0045 = 67.50; PR = 300 − 67.50 = 232.50; Bal = 15000 − 232.50 = 14,767.50.\n\nMonth 2: Int = 14767.50 × 0.0045 = 66.4538 ≈ 66.45; PR = 300 − 66.45 = 233.55; Bal = 14767.50 − 233.55 = 14,533.95.\n\nMonth 3: Int = 14533.95 × 0.0045 = 65.4028 ≈ 65.40; PR = 300 − 65.40 = 234.60; Bal = 14533.95 − 234.60 = 14,299.35.",
    },
  ],
  "MEDIUM",
  `A reducing-balance loan of \\$15,000 charges 5.4% per annum compounded monthly. The borrower makes monthly repayments of \\$300.`,
);

extAns(
  LA,
  [
    {
      label: "a",
      marks: 2,
      content: `Write a recurrence relation for the balance $V_n$ after $n$ years of withdrawals, including $V_0$.`,
      solution: "Annual rate = 6.5%. $V_{n+1} = 1.065 V_n - 5000$, $V_0 = 80000$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the balance at the end of years 1, 2 and 3, each correct to the nearest cent.`,
      solution: "$V_1 = 1.065 \\times 80000 - 5000 = 85200 - 5000 = \\$80,200.00$.\n\n$V_2 = 1.065 \\times 80200 - 5000 = 85413 - 5000 = \\$80,413.00$.\n\n$V_3 = 1.065 \\times 80413 - 5000 = 85639.85 - 5000 = \\$80,639.85$.",
    },
    {
      label: "c",
      marks: 3,
      content: `Comment on what happens to the balance over time. What does this tell you about the relationship between annual interest earned and annual withdrawals?`,
      solution: "The balance is **slowly increasing** ($V_0 = 80000$, $V_3 = 80639.85$). This is because the annual interest earned ($80000 \\times 0.065 = \\$5,200$) is **greater** than the annual withdrawal (\\$5,000). So the annuity is sustainable indefinitely — in the limit, the balance would approach a stable level only if interest = withdrawal. With interest > withdrawal, the balance grows; with interest < withdrawal, the balance falls and the annuity eventually runs out.",
    },
  ],
  "MEDIUM",
  `An annuity of \\$80,000 is invested at 6.5% per annum compounded annually. The investor withdraws \\$5,000 at the end of each year.`,
);

// ─── EXT_RESP (3) ──────────────────────────────────────────────────────

extResp(
  LA,
  [
    {
      label: "a",
      marks: 1,
      content: `State the monthly interest rate as a decimal.`,
      solution: "$r = 0.06/12 = 0.005$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Calculate the interest charged on the original \\$300,000 in the first month.`,
      solution: "Interest = $300000 \\times 0.005 = \\$1,500.00$.",
    },
    {
      label: "c",
      marks: 3,
      content: `Complete the first three rows of the amortisation table.\n\n| Payment # | Payment | Interest | Principal reduction | Balance |\n|---|---|---|---|---|\n| 1 | \\$1,800.00 | ? | ? | ? |\n| 2 | \\$1,800.00 | ? | ? | ? |\n| 3 | \\$1,800.00 | ? | ? | ? |`,
      solution: "| Payment # | Payment | Interest | Principal reduction | Balance |\n|---|---|---|---|---|\n| 1 | \\$1,800.00 | \\$1,500.00 | \\$300.00 | \\$299,700.00 |\n| 2 | \\$1,800.00 | \\$1,498.50 | \\$301.50 | \\$299,398.50 |\n| 3 | \\$1,800.00 | \\$1,496.99 | \\$303.01 | \\$299,095.49 |\n\nMonth 2: Int = 299700 × 0.005 = 1498.50; PR = 1800 − 1498.50 = 301.50; Bal = 299700 − 301.50 = 299,398.50.\n\nMonth 3: Int = 299398.50 × 0.005 = 1496.9925 ≈ 1496.99; PR = 1800 − 1496.99 = 303.01; Bal = 299398.50 − 303.01 = 299,095.49.",
    },
    {
      label: "d",
      marks: 3,
      content: `After the first year (12 payments of \\$1,800), the balance is approximately \\$296,299.33. State the total interest paid over the first year and the total principal reduced.`,
      solution: "Total paid in year 1 = $12 \\times 1800 = \\$21,600.00$.\n\nPrincipal reduced = $300000 - 296299.33 = \\$3,700.67$.\n\nInterest paid = total paid − principal reduced = $21600 - 3700.67 = \\$17,899.33$.",
    },
    {
      label: "e",
      marks: 3,
      content: `Comment on what proportion of the first year's payments go to interest vs. principal, and explain qualitatively how this proportion changes as the loan progresses.`,
      solution: "First year: Interest ≈ \\$17,899 out of \\$21,600 paid = $17899/21600 \\approx 82.9\\%$ to interest, only ≈17.1% to principal.\n\nAs the loan balance decreases over time, the interest charged each month (= balance × rate) also decreases. Since the payment is fixed, an **increasing** proportion of each payment goes to principal reduction. By the final year of the loan, the bulk of each payment is going to principal, with very little interest. This is a key feature of amortising reducing-balance loans.",
    },
  ],
  "MEDIUM",
  `**Question — Mortgage amortisation**\n\nA \\$300,000 home loan is taken out at 6% per annum compounded monthly. The monthly repayment is \\$1,800.`,
);

extResp(
  LA,
  [
    {
      label: "a",
      marks: 2,
      content: `Write the recurrence relation for the balance $V_n$ after $n$ years of withdrawals, including the initial condition $V_0$.`,
      solution: "Annual rate = $0.048$. $V_{n+1} = 1.048 V_n - 12000$, $V_0 = 250000$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Calculate the balance at the end of year 1 and at the end of year 5, correct to the nearest cent.`,
      solution: "$V_1 = 1.048 \\times 250000 - 12000 = 262000 - 12000 = \\$250,000.00$.\n\nFor $V_5$: this is a recurrence; use the closed form or iterate.\n\nClosed form: $V_n = R^n V_0 - d \\dfrac{R^n - 1}{R - 1}$ with $R = 1.048$.\n\n$V_5 = (1.048)^5 \\times 250000 - 12000 \\times \\dfrac{(1.048)^5 - 1}{0.048}$.\n\n$(1.048)^5 = 1.264216$.\n\n$V_5 = 1.264216 \\times 250000 - 12000 \\times (0.264216/0.048) = 316054 - 12000 \\times 5.5045 = 316054 - 66054 = \\$250,000.00$.\n\nSo the balance is **constant at \\$250,000** because the annual interest exactly equals the annual withdrawal.",
    },
    {
      label: "c",
      marks: 2,
      content: `Explain why your balance from part **b** behaves this way. What is the relationship between the annual interest and the annual withdrawal?`,
      solution: "Annual interest at year 1 = $250000 \\times 0.048 = \\$12,000$, which is **exactly equal** to the annual withdrawal of \\$12,000. So each year, interest earned tops up the account exactly enough to cover the withdrawal, leaving the balance unchanged. This is the **perpetuity condition** — the account can sustain withdrawals of \\$12,000 forever.",
    },
    {
      label: "d",
      marks: 3,
      content: `If the withdrawal is increased to \\$14,000 per year, find the balance at the end of year 1, year 2 and year 3.`,
      solution: "$V_{n+1} = 1.048 V_n - 14000$, $V_0 = 250000$.\n\n$V_1 = 1.048 \\times 250000 - 14000 = 262000 - 14000 = \\$248,000.00$.\n\n$V_2 = 1.048 \\times 248000 - 14000 = 259904 - 14000 = \\$245,904.00$.\n\n$V_3 = 1.048 \\times 245904 - 14000 = 257707.39 - 14000 = \\$243,707.39$.",
    },
    {
      label: "e",
      marks: 3,
      content: `For the \\$14,000 annual-withdrawal scenario, determine the approximate number of full years before the balance first falls below \\$200,000.`,
      solution: "Using the closed form $V_n = R^n V_0 - d \\dfrac{R^n - 1}{R - 1}$ with $V_0 = 250000$, $R = 1.048$, $d = 14000$:\n\n$V_n < 200000 \\Rightarrow 1.048^n (250000) - \\dfrac{14000(1.048^n - 1)}{0.048} < 200000$.\n\nLet $x = 1.048^n$: $250000 x - 14000 (x - 1)/0.048 < 200000 \\Rightarrow 250000 x - 291666.67 x + 291666.67 < 200000$.\n\n$-41666.67 x < -91666.67 \\Rightarrow x > 2.2$.\n\n$1.048^n > 2.2 \\Rightarrow n > \\log 2.2 / \\log 1.048 = 0.34242 / 0.020361 = 16.82$.\n\nSmallest integer $n = 17$. So the balance first falls below \\$200,000 at the **end of year 17**.",
    },
  ],
  "HARD",
  `**Question — Retirement annuity**\n\nA retiree invests \\$250,000 in an annuity earning 4.8% per annum compounded annually. The retiree withdraws \\$12,000 at the end of each year.`,
);

extResp(
  LA,
  [
    {
      label: "a",
      marks: 1,
      content: `State the quarterly interest rate as a decimal.`,
      solution: "$r = 0.072/4 = 0.018$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Write the recurrence relation for the loan balance $V_n$ after $n$ quarters, including $V_0$, given equal quarterly repayments of \\$2,000.`,
      solution: "$V_{n+1} = 1.018 V_n - 2000$, $V_0 = 40000$.",
    },
    {
      label: "c",
      marks: 3,
      content: `Construct the first three rows of the amortisation table.\n\n| Payment # | Payment | Interest | Principal reduction | Balance |\n|---|---|---|---|---|\n| 1 | \\$2,000.00 | ? | ? | ? |\n| 2 | \\$2,000.00 | ? | ? | ? |\n| 3 | \\$2,000.00 | ? | ? | ? |`,
      solution: "| Payment # | Payment | Interest | Principal reduction | Balance |\n|---|---|---|---|---|\n| 1 | \\$2,000.00 | \\$720.00 | \\$1,280.00 | \\$38,720.00 |\n| 2 | \\$2,000.00 | \\$696.96 | \\$1,303.04 | \\$37,416.96 |\n| 3 | \\$2,000.00 | \\$673.51 | \\$1,326.49 | \\$36,090.47 |\n\nQ1: Int = 40000 × 0.018 = 720; PR = 2000 − 720 = 1280; Bal = 40000 − 1280 = 38720.\n\nQ2: Int = 38720 × 0.018 = 696.96; PR = 2000 − 696.96 = 1303.04; Bal = 38720 − 1303.04 = 37416.96.\n\nQ3: Int = 37416.96 × 0.018 = 673.5053 ≈ 673.51; PR = 2000 − 673.51 = 1326.49; Bal = 37416.96 − 1326.49 = 36090.47.",
    },
    {
      label: "d",
      marks: 3,
      content: `The loan is to be paid off in exactly 5 years (20 quarterly payments). Using the closed-form annuity formula or systematic iteration, find the **required quarterly payment** (to the nearest cent) for the loan to reach exactly \\$0 after 20 payments.`,
      solution: "Use the loan amortisation formula: $d = V_0 \\dfrac{r}{1 - (1+r)^{-n}}$, where $V_0 = 40000$, $r = 0.018$, $n = 20$.\n\n$(1.018)^{-20} = 1/(1.018)^{20} = 1/1.428748 = 0.699914$.\n\n$1 - 0.699914 = 0.300086$.\n\n$d = 40000 \\times 0.018 / 0.300086 = 720 / 0.300086 = \\$2,399.31$.\n\nSo the required quarterly payment is **\\$2,399.31** (to the nearest cent).",
    },
    {
      label: "e",
      marks: 3,
      content: `Compare the total amount repaid under the original \\$2,000 quarterly plan with the 5-year payoff plan (\\$2,399.31 per quarter for 20 quarters). State the total interest paid in each case (the original \\$2,000 plan does not pay off in 5 years — calculate only the totals as far as it has been amortised, i.e. give the total paid over the first 20 quarters and the remaining balance).`,
      solution: "**Original plan (\\$2,000 × 20 quarters):** Total paid = $20 \\times 2000 = \\$40,000$. After 20 payments, balance is approximately $V_{20} \\approx 40000(1.018)^{20} - 2000 \\dfrac{(1.018)^{20}-1}{0.018} = 40000 \\times 1.428748 - 2000 \\times 23.8193 = 57149.94 - 47638.61 = \\$9,511.27$. So principal reduced = $40000 - 9511.27 = \\$30,488.73$; interest paid = $40000 - 30488.73 = \\$9,511.27$. Balance remains \\$9,511.27 to clear.\n\n**5-year payoff plan (\\$2,399.31 × 20 quarters):** Total paid = $20 \\times 2399.31 = \\$47,986.20$. Loan paid off → principal reduced = \\$40,000; interest paid = $47986.20 - 40000 = \\$7,986.20$.",
    },
  ],
  "HARD",
  `**Question — Business loan amortisation**\n\nA small business takes out a reducing-balance loan of \\$40,000 at 7.2% per annum compounded quarterly. Repayments are made at the end of each quarter.`,
);

// ════════════════════════════════════════════════════════════════════════
// SUBTOPIC 5: PERPETUITIES (modelling-rich)
//   7 MCQ + 4 SHORT + 2 EXT_ANS + 3 EXT_RESP = 16 items
// ════════════════════════════════════════════════════════════════════════

const PER = "perpetuities";

// ─── MCQ (7) ───────────────────────────────────────────────────────────

mcq(
  PER,
  `A perpetuity is best defined as\n\n`,
  [
    "A regular payment received forever, funded purely by the interest from an invested lump sum",
    "An investment whose principal grows indefinitely",
    "A loan repaid in a finite number of equal instalments",
    "An annuity that pays a higher rate than the market rate",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\nA perpetuity is a sustainable forever-payment from interest only — the principal is never withdrawn, only the interest is paid out each period.",
);

mcq(
  PER,
  `The relationship between the principal $P$, the periodic payment $d$, and the periodic interest rate $r$ (as a decimal) of a perpetuity is\n\n`,
  ["$P = d \\cdot r$", "$P = d/r$", "$P = d + r$", "$P = r/d$"],
  "B",
  "EASY",
  "**Answer: B**\n\nThe principal must generate exactly $d$ per period from interest: $P \\cdot r = d \\Rightarrow P = d/r$.",
);

mcq(
  PER,
  `A perpetuity pays \\$500 per month and is funded by an investment earning 6% per annum compounded monthly. The principal required is\n\n`,
  ["\\$8,333.33", "\\$100,000.00", "\\$83,333.33", "\\$60,000.00"],
  "B",
  "EASY",
  "**Answer: B**\n\nMonthly rate = $0.06/12 = 0.005$. $P = d/r = 500/0.005 = \\$100,000.00$.",
);

mcq(
  PER,
  `An amount of \\$80,000 is invested as a perpetuity at 5% per annum compounded annually. The annual payment that can be withdrawn forever is\n\n`,
  ["\\$1,600.00", "\\$4,000.00", "\\$8,000.00", "\\$16,000.00"],
  "B",
  "EASY",
  "**Answer: B**\n\nAnnual payment = $P \\cdot r = 80000 \\times 0.05 = \\$4,000.00$.",
);

mcq(
  PER,
  `Which of the following actions would **increase** the regular payment from a perpetuity (keeping all other factors equal)?\n\n`,
  [
    "Decreasing the principal",
    "Increasing the principal",
    "Decreasing the interest rate",
    "Switching from annual to monthly compounding at the same nominal annual rate",
  ],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nSince $d = P \\cdot r$, increasing the principal (with rate fixed) increases the payment. Options A and C both reduce $d$. Option D changes the periodic payment frequency but not the annual total significantly — typically the annual sum stays close to $P \\cdot r$ (nominal).",
);

mcq(
  PER,
  `A perpetuity is funded by \\$60,000 invested at 4.8% per annum compounded **quarterly**. The quarterly payment is\n\n`,
  ["\\$240.00", "\\$720.00", "\\$2,400.00", "\\$2,880.00"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nQuarterly rate = $0.048/4 = 0.012$. Quarterly payment $= P \\cdot r = 60000 \\times 0.012 = \\$720.00$.",
);

mcq(
  PER,
  `A perpetuity pays \\$15,000 per year at an interest rate of 5% per annum. If the interest rate drops to 4% per annum, the new principal required to sustain the same \\$15,000 annual payment is\n\n`,
  ["\\$300,000.00", "\\$345,000.00", "\\$375,000.00", "\\$400,000.00"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\n$P_{\\text{new}} = d/r_{\\text{new}} = 15000 / 0.04 = \\$375,000.00$. (Originally, $P = 15000/0.05 = \\$300,000$.)",
);

// ─── SHORT (4) ─────────────────────────────────────────────────────────

short(
  PER,
  `A philanthropist wishes to establish a perpetual scholarship of \\$3,500 per year. The funds will be invested at 5.6% per annum compounded annually.\n\n**a.** State the formula relating principal, payment and rate for a perpetuity. (1 mark)\n\n**b.** Find the principal required, correct to the nearest cent. (2 marks)\n\n**c.** If the interest rate falls to 4%, find the new principal needed to maintain the same \\$3,500 annual payment. (1 mark) (4 marks)`,
  4,
  "EASY",
  "**a.** $P = d/r$, where $d$ = payment per period and $r$ = interest rate per period (decimal).\n\n**b.** $P = 3500 / 0.056 = \\$62,500.00$.\n\n**c.** $P_{\\text{new}} = 3500 / 0.04 = \\$87,500.00$.",
);

short(
  PER,
  `A trust fund of \\$250,000 is invested at 4.8% per annum, compounded quarterly, as a perpetuity.\n\n**a.** Find the periodic interest rate per quarter as a decimal. (1 mark)\n\n**b.** Find the quarterly payment that can be drawn forever. (2 marks)\n\n**c.** State the total annual payment received. (1 mark) (4 marks)`,
  4,
  "EASY",
  "**a.** Quarterly rate = $0.048/4 = 0.012$.\n\n**b.** Quarterly payment = $P \\cdot r = 250000 \\times 0.012 = \\$3,000.00$.\n\n**c.** Annual total = $4 \\times 3000 = \\$12,000.00$.",
);

short(
  PER,
  `A perpetuity earns 6% per annum compounded monthly and pays \\$500 per month forever.\n\n**a.** Find the principal required to fund the perpetuity. (2 marks)\n\n**b.** Write a recurrence relation $V_n$ for the balance after $n$ months, including $V_0$, assuming the payment is withdrawn at the end of each month. (2 marks)\n\n**c.** Verify that the recurrence is consistent: compute $V_1$ and confirm it equals $V_0$. (1 mark) (5 marks)`,
  5,
  "MEDIUM",
  "**a.** Monthly rate = $0.06/12 = 0.005$. $P = 500/0.005 = \\$100,000.00$.\n\n**b.** $V_{n+1} = 1.005 V_n - 500$, $V_0 = 100000$.\n\n**c.** $V_1 = 1.005 \\times 100000 - 500 = 100500 - 500 = \\$100,000 = V_0$. ✓ The principal does not change — exactly as expected for a perpetuity.",
);

short(
  PER,
  `Compare two perpetuity options that both promise \\$10,000 per year:\n\n* Option A: 4% per annum compounded annually.\n* Option B: 5% per annum compounded annually.\n\n**a.** Find the principal required for each option. (2 marks)\n\n**b.** State the savings (in dollars) by choosing Option B over Option A. (1 mark)\n\n**c.** If the donor has only \\$200,000 available and uses Option B, find the maximum annual payment that can be sustained forever. (2 marks) (5 marks)`,
  5,
  "MEDIUM",
  "**a.** Option A: $P = 10000/0.04 = \\$250,000$.\n\nOption B: $P = 10000/0.05 = \\$200,000$.\n\n**b.** Option B saves $250000 - 200000 = \\$50,000$ in principal required.\n\n**c.** Maximum annual payment from \\$200,000 at 5% = $200000 \\times 0.05 = \\$10,000.00$.",
);

// ─── EXT_ANS (2) ───────────────────────────────────────────────────────

extAns(
  PER,
  [
    {
      label: "a",
      marks: 2,
      content: `Find the principal required to fund a perpetuity that pays \\$8,000 per year, given an interest rate of 6.4% per annum compounded annually.`,
      solution: "$P = d/r = 8000 / 0.064 = \\$125,000.00$.",
    },
    {
      label: "b",
      marks: 2,
      content: `If the same fund instead earns 6.4% per annum compounded quarterly, what quarterly payment can be drawn forever?`,
      solution: "Quarterly rate = $0.064/4 = 0.016$. Quarterly payment = $P \\cdot r = 125000 \\times 0.016 = \\$2,000.00$.\n\n(Annual total = $4 \\times 2000 = \\$8,000$, matching part **a**.)",
    },
    {
      label: "c",
      marks: 2,
      content: `Construct a small balance table showing the balance after 1, 2 and 3 quarters under the quarterly-payment scheme in part **b**. Confirm the perpetuity is sustainable.`,
      solution: "Recurrence: $V_{n+1} = 1.016 V_n - 2000$, $V_0 = 125000$.\n\n| Quarter | Interest | Payment | Balance |\n|---|---|---|---|\n| 0 | — | — | \\$125,000.00 |\n| 1 | \\$2,000.00 | \\$2,000.00 | \\$125,000.00 |\n| 2 | \\$2,000.00 | \\$2,000.00 | \\$125,000.00 |\n| 3 | \\$2,000.00 | \\$2,000.00 | \\$125,000.00 |\n\nThe balance is **constant at \\$125,000** every quarter — the interest exactly funds the payment. The perpetuity is **sustainable forever**. ✓",
    },
  ],
  "MEDIUM",
  `A perpetuity is to be funded by a single lump-sum investment. The investment earns 6.4% per annum.`,
);

extAns(
  PER,
  [
    {
      label: "a",
      marks: 2,
      content: `Determine the annual payment that can be drawn from a perpetuity of \\$180,000 invested at 5% per annum.`,
      solution: "Annual payment = $P \\cdot r = 180000 \\times 0.05 = \\$9,000.00$.",
    },
    {
      label: "b",
      marks: 3,
      content: `Suppose the foundation instead wants to pay \\$11,000 per year. What additional principal would be needed, given the same 5% interest rate?`,
      solution: "New principal required: $P_{\\text{new}} = 11000/0.05 = \\$220,000$.\n\nAdditional principal = $220000 - 180000 = \\$40,000$.",
    },
    {
      label: "c",
      marks: 3,
      content: `If the interest rate available drops to 3.5% per annum but the foundation still wants to draw \\$11,000 per year, what principal would be required, and how much more is this than your answer in part **b**?`,
      solution: "$P = 11000 / 0.035 = \\$314,285.71$ (to the nearest cent).\n\nThis is $314285.71 - 220000 = \\$94,285.71$ more than the principal at 5%.",
    },
  ],
  "MEDIUM",
  `A charity foundation wishes to establish a perpetual grant.`,
);

// ─── EXT_RESP (3) ──────────────────────────────────────────────────────

extResp(
  PER,
  [
    {
      label: "a",
      marks: 1,
      content: `State the formula relating principal, payment, and interest rate for a perpetuity.`,
      solution: "$P = d/r$, where $P$ = principal, $d$ = payment per period, $r$ = interest rate per period (decimal).",
    },
    {
      label: "b",
      marks: 2,
      content: `Determine the principal required to fund a \\$2,500 monthly payment at 6% per annum compounded monthly.`,
      solution: "Monthly rate = $0.06/12 = 0.005$. $P = 2500/0.005 = \\$500,000.00$.",
    },
    {
      label: "c",
      marks: 3,
      content: `The donor has only \\$400,000 available. Using the same monthly interest rate, find the maximum sustainable monthly payment from \\$400,000.`,
      solution: "Monthly payment = $P \\cdot r = 400000 \\times 0.005 = \\$2,000.00$ per month.",
    },
    {
      label: "d",
      marks: 3,
      content: `Alternatively, the donor finds a fund that pays 7.2% per annum compounded monthly. Find the maximum sustainable monthly payment from \\$400,000 in this fund, and state the gain (in dollars per month) over the 6% fund.`,
      solution: "Monthly rate = $0.072/12 = 0.006$. Monthly payment = $400000 \\times 0.006 = \\$2,400.00$ per month.\n\nGain = $2400 - 2000 = \\$400$ per month (or \\$4,800 per year).",
    },
    {
      label: "e",
      marks: 3,
      content: `Compare the two strategies for the donor:\n\n* Strategy 1: \\$500,000 at 6% pa monthly (the original target).\n* Strategy 2: \\$400,000 at 7.2% pa monthly.\n\nFor each strategy, state the principal, the monthly payment, and the **payment-to-principal ratio**. Which strategy delivers more payment per dollar of principal?`,
      solution: "**Strategy 1**: $P = \\$500,000$, $d = \\$2,500$, ratio = $2500/500000 = 0.005 = 0.5\\%$ per month.\n\n**Strategy 2**: $P = \\$400,000$, $d = \\$2,400$, ratio = $2400/400000 = 0.006 = 0.6\\%$ per month.\n\n**Strategy 2** delivers more payment per dollar invested (0.6% vs 0.5% per month), reflecting the higher interest rate.",
    },
  ],
  "MEDIUM",
  `**Question — Endowment fund**\n\nA donor wants to set up a perpetuity to fund a community arts grant. The grant will be paid monthly forever.`,
);

extResp(
  PER,
  [
    {
      label: "a",
      marks: 2,
      content: `Find the principal needed to fund Scholarship A: \\$6,000 per year forever at 4% per annum compounded annually.`,
      solution: "$P = 6000/0.04 = \\$150,000.00$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the principal needed to fund Scholarship B: \\$1,500 per quarter forever at 4% per annum compounded quarterly.`,
      solution: "Quarterly rate = $0.04/4 = 0.01$. $P = 1500/0.01 = \\$150,000.00$.\n\n(Both scholarships pay \\$6,000 per year — identical principal because the annual total and the nominal rate are the same.)",
    },
    {
      label: "c",
      marks: 2,
      content: `Find the principal needed to fund Scholarship C: \\$500 per month forever at 4.8% per annum compounded monthly.`,
      solution: "Monthly rate = $0.048/12 = 0.004$. $P = 500/0.004 = \\$125,000.00$.",
    },
    {
      label: "d",
      marks: 3,
      content: `Suppose the university has \\$200,000 to invest at 4.8% per annum compounded monthly. Find (i) the maximum monthly payment that can be sustained forever, and (ii) the equivalent annual total.`,
      solution: "**(i)** Monthly rate = $0.048/12 = 0.004$. Monthly payment = $200000 \\times 0.004 = \\$800.00$.\n\n**(ii)** Annual total = $12 \\times 800 = \\$9,600.00$.",
    },
    {
      label: "e",
      marks: 3,
      content: `The university has been offered two perpetual investments:\n\n* Fund X: \\$200,000 at 4.8% pa monthly.\n* Fund Y: \\$200,000 at 5% pa annually.\n\nFind the annual income each fund delivers and recommend which fund the university should select.`,
      solution: "Fund X: monthly \\$800 × 12 = **\\$9,600** per year.\n\nFund Y: $200000 \\times 0.05 = $ **\\$10,000** per year (single annual payment).\n\n**Fund Y delivers more annual income** (\\$10,000 vs \\$9,600). Recommendation: choose Fund Y. (Note: Fund X has the convenience of monthly payments, but Fund Y delivers \\$400 more income per year on the same principal.)",
    },
  ],
  "HARD",
  `**Question — Scholarship funding**\n\nA university is designing several perpetual scholarship funds.`,
);

extResp(
  PER,
  [
    {
      label: "a",
      marks: 2,
      content: `Show that the principal required is \\$250,000.`,
      solution: "Required: $P \\cdot r = d$ where $d = 1000$ per month, $r = 0.048/12 = 0.004$.\n\n$P = 1000/0.004 = \\$250,000$. ✓",
    },
    {
      label: "b",
      marks: 2,
      content: `Write a recurrence relation for the balance $V_n$ at the end of month $n$, including $V_0$.`,
      solution: "$V_{n+1} = 1.004 V_n - 1000$, $V_0 = 250000$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Verify that the recurrence preserves a constant balance by computing $V_1$, $V_2$, and $V_{12}$ (the balance after 1 month, 2 months, and 12 months).`,
      solution: "$V_1 = 1.004 \\times 250000 - 1000 = 251000 - 1000 = \\$250,000.00$.\n\nSince $V_1 = V_0$, the balance is constant — so $V_2 = V_3 = \\ldots = V_{12} = \\$250,000.00$.",
    },
    {
      label: "d",
      marks: 3,
      content: `Suppose Diane decides to increase her withdrawal to \\$1,200 per month, but the principal remains \\$250,000 and the interest rate remains 4.8% pa monthly. The perpetuity is no longer self-sustaining. Find the balance at the end of months 1, 2, and 3, and identify the long-term behaviour.`,
      solution: "$V_{n+1} = 1.004 V_n - 1200$, $V_0 = 250000$.\n\n$V_1 = 251000 - 1200 = \\$249,800.00$.\n\n$V_2 = 1.004 \\times 249800 - 1200 = 250799.20 - 1200 = \\$249,599.20$.\n\n$V_3 = 1.004 \\times 249599.20 - 1200 = 250597.60 - 1200 = \\$249,397.60$.\n\nThe balance is **decreasing**. Each month, the interest earned (≈\\$999) is less than the withdrawal (\\$1,200), so the principal erodes. Long-term: the balance will eventually reach \\$0 — this is no longer a perpetuity, but a **depleting annuity**.",
    },
    {
      label: "e",
      marks: 3,
      content: `Determine the **maximum** monthly withdrawal Diane can make so that her perpetuity remains exactly self-sustaining at \\$250,000 principal and 4.8% pa compounded monthly. State your answer to the nearest cent.`,
      solution: "Maximum sustainable withdrawal = $P \\cdot r = 250000 \\times 0.004 = \\$1,000.00$ per month exactly.\n\nAny withdrawal greater than \\$1,000 will reduce the principal over time; any smaller withdrawal will allow the principal to grow.",
    },
  ],
  "HARD",
  `**Question — Self-sustaining retirement perpetuity**\n\nDiane wishes to set up a perpetuity that pays her \\$1,000 every month forever. She has access to an investment paying 4.8% per annum compounded monthly.`,
);

// ─── Write output ──────────────────────────────────────────────────────

const spec = {
  subject_slug: SUBJECT_SLUG,
  question_set_id: QUESTION_SET_ID,
  items,
};

const outPath = path.join(OUT_DIR, "qset-general-financial.json");
fs.writeFileSync(outPath, JSON.stringify(spec, null, 2));

const counts = {
  MCQ: items.filter((i) => i.type === "MCQ").length,
  SHORT_ANSWER: items.filter((i) => i.type === "SHORT_ANSWER").length,
  EXTENDED_ANSWER: items.filter((i) => i.type === "EXTENDED_ANSWER").length,
  EXTENDED_RESPONSE: items.filter((i) => i.type === "EXTENDED_RESPONSE").length,
};

const perSubtopic = (slug: string) => {
  const subset = items.filter((i) => i.subtopic_slugs.includes(slug));
  return {
    total: subset.length,
    mcq: subset.filter((i) => i.type === "MCQ").length,
    short: subset.filter((i) => i.type === "SHORT_ANSWER").length,
    extAns: subset.filter((i) => i.type === "EXTENDED_ANSWER").length,
    extResp: subset.filter((i) => i.type === "EXTENDED_RESPONSE").length,
  };
};

console.log(`Wrote ${items.length} items to ${outPath}`);
console.log(`  MCQ:               ${counts.MCQ}`);
console.log(`  SHORT_ANSWER:      ${counts.SHORT_ANSWER}`);
console.log(`  EXTENDED_ANSWER:   ${counts.EXTENDED_ANSWER}`);
console.log(`  EXTENDED_RESPONSE: ${counts.EXTENDED_RESPONSE}`);
console.log("");
console.log("Per-subtopic breakdown:");
for (const slug of [
  "simple-interest",
  "compound-interest",
  "depreciation-flat-rate-reducing-balance-unit-cost",
  "loans-and-annuities",
  "perpetuities",
]) {
  const s = perSubtopic(slug);
  console.log(
    `  ${slug.padEnd(55)} total=${s.total}  MCQ=${s.mcq} SHORT=${s.short} EXT_ANS=${s.extAns} EXT_RESP=${s.extResp}`,
  );
}
