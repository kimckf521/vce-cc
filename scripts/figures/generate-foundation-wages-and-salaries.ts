/**
 * Foundation pilot generator: wages-and-salaries
 *
 * Produces a single JSON in scripts/output/foundation-batch/ following the
 * seed-foundation-bank.ts shape: { items: [...] }.
 *
 * Subtopic is a core-drill + extended-fit + modelling-rich slot, so it
 * exercises all four item types.
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/wages-and-salaries.json");

const TOPIC = "algebra-number-and-structure";
const SUB = "wages-and-salaries";

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
    "Maya is paid an hourly rate of $\\$22.50$. In one week she works $30$ hours. Her gross pay for the week is:",
    ["$\\$540.00$", "$\\$652.50$", "$\\$675.00$", "$\\$720.00$"],
    "C",
    "EASY",
    "Multiply hours by rate: $30 \\times \\$22.50 = \\$675$.\n\n**Answer: C**",
  ),
  mcq(
    "An apprentice earns $\\$18.40$ per hour and works $38$ hours per week. The weekly gross pay is closest to:",
    ["$\\$699.20$", "$\\$680.00$", "$\\$735.20$", "$\\$564.40$"],
    "A",
    "EASY",
    "$38 \\times \\$18.40 = \\$699.20$.\n\n**Answer: A**",
  ),
  mcq(
    "Ben's annual salary is $\\$67\\,600$. His weekly salary, assuming $52$ weeks in a year, is:",
    ["$\\$1\\,200$", "$\\$1\\,300$", "$\\$1\\,400$", "$\\$5\\,633$"],
    "B",
    "EASY",
    "$\\dfrac{67\\,600}{52} = \\$1\\,300$.\n\n**Answer: B**",
  ),
  mcq(
    "A part-time worker earns $\\$310$ for a $20$-hour week. The hourly rate is:",
    ["$\\$14.50$", "$\\$15.00$", "$\\$15.50$", "$\\$16.00$"],
    "C",
    "EASY",
    "$\\dfrac{\\$310}{20} = \\$15.50$ per hour.\n\n**Answer: C**",
  ),
  mcq(
    "A nurse is paid time-and-a-half on Saturdays. If her ordinary rate is $\\$36$ per hour, her Saturday rate is:",
    ["$\\$48$", "$\\$50$", "$\\$54$", "$\\$72$"],
    "C",
    "EASY",
    "$1.5 \\times \\$36 = \\$54$.\n\n**Answer: C**",
  ),
  mcq(
    "Lisa works $40$ hours at her ordinary rate of $\\$25$ per hour, plus $5$ hours at time-and-a-half. Her gross pay is:",
    ["$\\$1\\,125.00$", "$\\$1\\,187.50$", "$\\$1\\,250.00$", "$\\$1\\,312.50$"],
    "B",
    "MEDIUM",
    "Ordinary: $40 \\times 25 = \\$1\\,000$. Overtime: $5 \\times 1.5 \\times 25 = \\$187.50$. Total: $\\$1\\,187.50$.\n\n**Answer: B**",
  ),
  mcq(
    "A casual worker earns $\\$24$ per hour plus a $25\\%$ casual loading. The effective hourly rate is:",
    ["$\\$25.00$", "$\\$28.00$", "$\\$30.00$", "$\\$32.00$"],
    "C",
    "MEDIUM",
    "$\\$24 \\times 1.25 = \\$30$.\n\n**Answer: C**",
  ),
  mcq(
    "A real estate agent earns a base salary of $\\$1\\,500$ per month plus $2\\%$ commission on sales. In a month with $\\$240\\,000$ in sales, the agent earns:",
    ["$\\$3\\,300$", "$\\$4\\,800$", "$\\$6\\,300$", "$\\$7\\,800$"],
    "C",
    "MEDIUM",
    "Commission: $2\\% \\text{ of } \\$240\\,000 = \\$4\\,800$. Total: $\\$1\\,500 + \\$4\\,800 = \\$6\\,300$.\n\n**Answer: C**",
  ),
  mcq(
    "A worker is paid $\\$28$ per hour for the first $38$ hours and double-time for any hours over $38$. In a week of $42$ hours she earns:",
    ["$\\$1\\,176$", "$\\$1\\,288$", "$\\$1\\,344$", "$\\$1\\,400$"],
    "B",
    "MEDIUM",
    "Ordinary: $38 \\times \\$28 = \\$1\\,064$. Overtime: $4 \\times 2 \\times \\$28 = \\$224$. Total: $\\$1\\,288$.\n\n**Answer: B**",
  ),
  mcq(
    "A salesperson is paid $\\$800$ retainer per week plus $4\\%$ commission on weekly sales over $\\$5\\,000$. In a week with $\\$12\\,500$ in sales the pay is:",
    ["$\\$1\\,100$", "$\\$1\\,300$", "$\\$1\\,500$", "$\\$1\\,800$"],
    "A",
    "MEDIUM",
    "Sales above threshold: $\\$12\\,500 - \\$5\\,000 = \\$7\\,500$. Commission: $4\\%$ of $\\$7\\,500 = \\$300$. Total: $\\$800 + \\$300 = \\$1\\,100$.\n\n**Answer: A**",
  ),
  mcq(
    "Olivia is paid a piecework rate of $\\$0.85$ for each item assembled. In a shift she assembles $260$ items. Her pay is:",
    ["$\\$200.00$", "$\\$210.50$", "$\\$221.00$", "$\\$240.00$"],
    "C",
    "MEDIUM",
    "$260 \\times \\$0.85 = \\$221.00$.\n\n**Answer: C**",
  ),
  mcq(
    "An employee's gross monthly pay is $\\$5\\,200$. If $\\$1\\,040$ is withheld for tax, the take-home pay represents what percentage of gross?",
    ["$75\\%$", "$80\\%$", "$85\\%$", "$90\\%$"],
    "B",
    "MEDIUM",
    "Take-home $= \\$5\\,200 - \\$1\\,040 = \\$4\\,160$. As percentage: $\\dfrac{4160}{5200} = 0.80 = 80\\%$.\n\n**Answer: B**",
  ),
  mcq(
    "Hua works as a chef on a salary of $\\$78\\,000$ per year. After deductions of $22\\%$, his fortnightly take-home pay is closest to:",
    ["$\\$2\\,300$", "$\\$2\\,340$", "$\\$2\\,500$", "$\\$3\\,000$"],
    "B",
    "HARD",
    "Annual take-home: $78\\,000 \\times 0.78 = \\$60\\,840$. Fortnightly: $\\dfrac{60\\,840}{26} = \\$2\\,340$.\n\n**Answer: B**",
  ),
  mcq(
    "A worker's hourly rate increases from $\\$24.50$ to $\\$26.95$. The percentage increase, to the nearest whole percent, is:",
    ["$8\\%$", "$10\\%$", "$11\\%$", "$25\\%$"],
    "B",
    "HARD",
    "Increase: $\\$26.95 - \\$24.50 = \\$2.45$. Percentage: $\\dfrac{2.45}{24.50} \\times 100 = 10\\%$.\n\n**Answer: B**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "Dan is paid $\\$24.80$ per hour and works $35$ hours in a week. Calculate his weekly gross pay.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $35 \\times \\$24.80 = \\$868.00$.\n\n$$\\text{Gross pay} = \\$868.00$$",
  ),
  sa(
    "Sophie has an annual salary of $\\$58\\,500$. Calculate her gross weekly pay, assuming $52$ weeks in the year.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $\\dfrac{\\$58\\,500}{52} = \\$1\\,125$ per week.",
  ),
  sa(
    "A trainee is paid $\\$19.40$ per hour. Calculate his gross fortnightly pay if he works $76$ hours over the fortnight.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $76 \\times \\$19.40 = \\$1\\,474.40$.",
  ),
  sa(
    "Joel is paid $\\$26.00$ per hour Monday to Friday and time-and-a-half on Saturday. He works $30$ hours during the week and $6$ hours on Saturday.\n\nCalculate his gross weekly pay.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Weekday pay: $30 \\times \\$26 = \\$780$.\n\n**Step 2 (1 mark):** Saturday pay: $6 \\times 1.5 \\times \\$26 = \\$234$. Total: $\\$780 + \\$234 = \\$1\\,014$.",
  ),
  sa(
    "A casual checkout assistant is paid $\\$23$ per hour with a $25\\%$ casual loading. Calculate the loaded hourly rate.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Loading amount: $25\\%$ of $\\$23 = \\$5.75$.\n\n**Step 2 (1 mark):** Loaded rate: $\\$23 + \\$5.75 = \\$28.75$ per hour.",
  ),
  sa(
    "Mei earns a retainer of $\\$1\\,200$ per fortnight plus $3\\%$ commission on her sales. In one fortnight her sales totalled $\\$24\\,000$.\n\nCalculate her gross pay for that fortnight.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Commission: $3\\%$ of $\\$24\\,000 = \\$720$.\n\n**Step 2 (1 mark):** Total: $\\$1\\,200 + \\$720 = \\$1\\,920$.",
  ),
  sa(
    "A factory worker is paid $\\$22.50$ per hour for the first $38$ hours and double-time for any additional hours. In a week he worked $44$ hours.\n\nCalculate his gross weekly pay.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Ordinary pay: $38 \\times \\$22.50 = \\$855.00$.\n\n**Step 2 (1 mark):** Overtime hours: $44 - 38 = 6$ hours. Overtime pay: $6 \\times 2 \\times \\$22.50 = \\$270.00$.\n\n**Step 3 (1 mark):** Gross weekly pay: $\\$855 + \\$270 = \\$1\\,125.00$.",
  ),
  sa(
    "Anna's annual salary is $\\$72\\,800$. She is paid fortnightly. Calculate her gross fortnightly pay, assuming $26$ pay periods in the year.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Annual amount divided by pay periods: $\\dfrac{\\$72\\,800}{26}$.\n\n**Step 2 (1 mark):** $= \\$2\\,800$ per fortnight.",
  ),
  sa(
    "A worker is offered a $4\\%$ pay rise on her current hourly rate of $\\$28.50$. Calculate her new hourly rate, correct to the nearest cent.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Increase: $4\\%$ of $\\$28.50 = \\$1.14$.\n\n**Step 2 (1 mark):** New rate: $\\$28.50 + \\$1.14 = \\$29.64$ per hour.",
  ),
  sa(
    "A salesperson at a car dealership earns a monthly base of $\\$2\\,800$ plus $1.5\\%$ commission on monthly sales over $\\$60\\,000$. In May the dealership recorded $\\$185\\,000$ in sales by this salesperson.\n\nCalculate the salesperson's gross monthly earnings for May.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Sales above threshold: $\\$185\\,000 - \\$60\\,000 = \\$125\\,000$.\n\n**Step 2 (1 mark):** Commission: $1.5\\%$ of $\\$125\\,000 = \\$1\\,875$.\n\n**Step 3 (1 mark):** Total gross: $\\$2\\,800 + \\$1\\,875 = \\$4\\,675$.",
  ),
  sa(
    "Last year Lucy earned $\\$54\\,600$ as a graphic designer. This year she received a $6.2\\%$ pay rise. Calculate her new annual salary, rounded to the nearest dollar.",
    3,
    "HARD",
    "**Step 1 (1 mark):** Increase: $6.2\\%$ of $\\$54\\,600 = 0.062 \\times 54\\,600 = \\$3\\,385.20$.\n\n**Step 2 (1 mark):** New salary: $\\$54\\,600 + \\$3\\,385.20 = \\$57\\,985.20$.\n\n**Step 3 (1 mark):** Rounded: $\\$57\\,985$.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "Tina works at a hardware store. She is paid $\\$22.40$ per hour for ordinary work, time-and-a-half on Saturdays, and double-time on Sundays. Her usual working week is shown below.\n\n| Day | Hours |\n|---|---|\n| Monday | 7 |\n| Tuesday | 7 |\n| Wednesday | 7 |\n| Thursday | 7 |\n| Saturday | 5 |",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate Tina's ordinary pay (Monday to Thursday).",
        solution: "**Step 1 (1 mark):** Ordinary hours: $7 \\times 4 = 28$. Ordinary pay: $28 \\times \\$22.40 = \\$627.20$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate Tina's pay for working $5$ hours on Saturday at time-and-a-half.",
        solution: "**Step 1 (1 mark):** Saturday rate: $1.5 \\times \\$22.40 = \\$33.60$ per hour.\n\n**Step 2 (1 mark):** Pay: $5 \\times \\$33.60 = \\$168.00$.",
      },
      {
        label: "c",
        marks: 1,
        content: "Calculate Tina's total gross weekly pay.",
        solution: "**Step 1 (1 mark):** Total: $\\$627.20 + \\$168.00 = \\$795.20$.",
      },
      {
        label: "d",
        marks: 2,
        content: "If Tina also works $3$ hours on a Sunday at double-time, calculate her new total gross pay for the week.",
        solution: "**Step 1 (1 mark):** Sunday pay: $3 \\times 2 \\times \\$22.40 = \\$134.40$.\n\n**Step 2 (1 mark):** New total: $\\$795.20 + \\$134.40 = \\$929.60$.",
      },
    ],
  ),
  ea(
    "Sam works in retail and is paid an hourly rate of $\\$25.60$ from Monday to Friday. He receives a casual loading of $25\\%$.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate Sam's loaded hourly rate.",
        solution: "**Step 1 (1 mark):** $\\$25.60 \\times 1.25 = \\$32.00$ per hour.",
      },
      {
        label: "b",
        marks: 2,
        content: "Sam works $32$ hours in one week. Calculate his gross weekly pay (using the loaded rate).",
        solution: "**Step 1 (1 mark):** $32 \\times \\$32.00$.\n\n**Step 2 (1 mark):** $= \\$1\\,024.00$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Sam's employer deducts $\\$256$ in tax. Calculate Sam's take-home pay for the week, and express the deduction as a percentage of his gross pay.",
        solution: "**Step 1 (1 mark):** Take-home: $\\$1\\,024 - \\$256 = \\$768$.\n\n**Step 2 (1 mark):** Tax percentage: $\\dfrac{256}{1024} \\times 100 = 25\\%$.",
      },
    ],
  ),
  ea(
    "Priya is paid an annual salary of $\\$64\\,480$ as a junior accountant. She is paid fortnightly ($26$ pay periods per year).",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate Priya's gross fortnightly pay.",
        solution: "**Step 1 (1 mark):** $\\dfrac{\\$64\\,480}{26} = \\$2\\,480$ per fortnight.",
      },
      {
        label: "b",
        marks: 2,
        content: "Priya is offered a $3.5\\%$ pay rise. Calculate her new annual salary, correct to the nearest dollar.",
        solution: "**Step 1 (1 mark):** Increase: $3.5\\%$ of $\\$64\\,480 = \\$2\\,256.80$.\n\n**Step 2 (1 mark):** New salary: $\\$64\\,480 + \\$2\\,256.80 = \\$66\\,736.80$, rounded to $\\$66\\,737$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Using the new annual salary from part b, calculate Priya's new gross fortnightly pay correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** $\\dfrac{\\$66\\,737}{26}$.\n\n**Step 2 (1 mark):** $= \\$2\\,566.81$ per fortnight (to the nearest cent).",
      },
    ],
  ),

  // ── EXTENDED_RESPONSE (2) ───────────────────────────────────────────
  er(
    "Liam is a mechanic who recently moved jobs. His new position pays an annual salary of $\\$78\\,000$ plus a $\\$3\\,500$ tool allowance. He is paid fortnightly ($26$ pay periods per year). His employer deducts $20\\%$ tax from his gross pay and contributes $11\\%$ of his salary (not including the allowance) into superannuation.",
    "HARD",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate Liam's gross fortnightly pay (salary plus allowance combined).",
        solution: "**Step 1 (1 mark):** Annual total: $\\$78\\,000 + \\$3\\,500 = \\$81\\,500$.\n\n**Step 2 (1 mark):** Fortnightly: $\\dfrac{\\$81\\,500}{26} = \\$3\\,134.62$ per fortnight (to the nearest cent).",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the tax deducted from Liam's gross fortnightly pay, correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** Tax rate is $20\\%$ of gross fortnightly pay.\n\n**Step 2 (1 mark):** Tax: $0.20 \\times \\$3\\,134.62 = \\$626.92$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Hence calculate Liam's net (take-home) fortnightly pay.",
        solution: "**Step 1 (1 mark):** Subtract tax from gross.\n\n**Step 2 (1 mark):** Net: $\\$3\\,134.62 - \\$626.92 = \\$2\\,507.70$ per fortnight.",
      },
      {
        label: "d",
        marks: 2,
        content: "Calculate Liam's annual superannuation contribution from his employer. (Superannuation is $11\\%$ of salary only, not the allowance.)",
        solution: "**Step 1 (1 mark):** Super is calculated on the $\\$78\\,000$ salary.\n\n**Step 2 (1 mark):** $0.11 \\times \\$78\\,000 = \\$8\\,580$ per year.",
      },
      {
        label: "e",
        marks: 2,
        content: "Liam saves $20\\%$ of his net (take-home) fortnightly pay. Calculate the total he saves over $26$ fortnights (one year), correct to the nearest dollar.",
        solution: "**Step 1 (1 mark):** Fortnightly saving: $20\\%$ of $\\$2\\,507.70 = \\$501.54$.\n\n**Step 2 (1 mark):** Annual saving: $\\$501.54 \\times 26 = \\$13\\,040.04$, rounded to $\\$13\\,040$.",
      },
    ],
  ),
  er(
    "Aisha works as a sales representative. She is paid a base monthly salary of $\\$3\\,200$ plus a $2.5\\%$ commission on the value of her monthly sales that exceed $\\$40\\,000$. Her monthly sales for the first half of the year are shown below.\n\n| Month | Sales |\n|---|---|\n| January | $\\$38\\,000$ |\n| February | $\\$52\\,000$ |\n| March | $\\$61\\,500$ |\n| April | $\\$45\\,200$ |\n| May | $\\$70\\,000$ |\n| June | $\\$56\\,800$ |",
    "HARD",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate Aisha's gross pay for January.",
        solution: "**Step 1 (1 mark):** January sales of $\\$38\\,000$ are below the $\\$40\\,000$ threshold, so no commission is paid.\n\n**Step 2 (1 mark):** Gross pay: $\\$3\\,200$ (base only).",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate Aisha's gross pay for February.",
        solution: "**Step 1 (1 mark):** Sales above threshold: $\\$52\\,000 - \\$40\\,000 = \\$12\\,000$. Commission: $2.5\\%$ of $\\$12\\,000 = \\$300$.\n\n**Step 2 (1 mark):** Gross pay: $\\$3\\,200 + \\$300 = \\$3\\,500$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate Aisha's total commission earned over the six months (January to June).",
        solution: "**Step 1 (1 mark):** Sales above threshold each month: Jan $\\$0$; Feb $\\$12\\,000$; Mar $\\$21\\,500$; Apr $\\$5\\,200$; May $\\$30\\,000$; Jun $\\$16\\,800$. Total above-threshold sales: $\\$85\\,500$.\n\n**Step 2 (1 mark):** Total commission: $2.5\\%$ of $\\$85\\,500 = \\$2\\,137.50$.",
      },
      {
        label: "d",
        marks: 2,
        content: "Calculate Aisha's total gross earnings over the six months (base salary plus commission).",
        solution: "**Step 1 (1 mark):** Base salary over 6 months: $6 \\times \\$3\\,200 = \\$19\\,200$.\n\n**Step 2 (1 mark):** Total earnings: $\\$19\\,200 + \\$2\\,137.50 = \\$21\\,337.50$.",
      },
      {
        label: "e",
        marks: 2,
        content: "Aisha's employer is reviewing the structure. The new offer is a base of $\\$3\\,500$ per month plus $2\\%$ commission on all sales (with no threshold). Using Aisha's January–June sales, would this new structure have earned her more or less? Justify your answer with a calculation.",
        solution: "**Step 1 (1 mark):** Total sales: $\\$38\\,000 + \\$52\\,000 + \\$61\\,500 + \\$45\\,200 + \\$70\\,000 + \\$56\\,800 = \\$323\\,500$. New commission: $2\\%$ of $\\$323\\,500 = \\$6\\,470$. New base: $6 \\times \\$3\\,500 = \\$21\\,000$. New total: $\\$27\\,470$.\n\n**Step 2 (1 mark):** Comparison: $\\$27\\,470 > \\$21\\,337.50$, so the new structure pays $\\$6\\,132.50$ more. Aisha would be better off under the new structure.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`wages-and-salaries: wrote ${items.length} items to ${OUT}`);
