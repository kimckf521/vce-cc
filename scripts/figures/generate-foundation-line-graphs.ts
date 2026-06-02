/**
 * Foundation generator: line-graphs
 * Tier: core-drill + extended-fit (14 MCQ + 11 SHORT + 3 EXT_ANS = 28)
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/line-graphs.json");

const TOPIC = "data-analysis-probability-and-statistics";
const SUB = "line-graphs";

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
    "A line graph shows the daily temperature in Melbourne over five days:\n\n| Day | Temperature (°C) |\n|---|---|\n| Mon | 18 |\n| Tue | 20 |\n| Wed | 22 |\n| Thu | 17 |\n| Fri | 19 |\n\nThe highest temperature occurred on:",
    ["Monday", "Tuesday", "Wednesday", "Friday"],
    "C",
    "EASY",
    "The peak of the line is on Wednesday at $22$°C.\n\n**Answer: C**",
  ),
  mcq(
    "A line graph shows monthly cafe takings in Brisbane: Jan $\\$4\\,200$, Feb $\\$4\\,500$, Mar $\\$5\\,000$, Apr $\\$5\\,800$. Between which two consecutive months was the largest increase?",
    ["Jan to Feb", "Feb to Mar", "Mar to Apr", "All equal"],
    "C",
    "EASY",
    "Increases: Jan-Feb $\\$300$; Feb-Mar $\\$500$; Mar-Apr $\\$800$. Largest is Mar to Apr.\n\n**Answer: C**",
  ),
  mcq(
    "A line graph shows rainfall in Sydney each month: Jan $80$ mm, Feb $90$ mm, Mar $100$ mm, Apr $60$ mm. The total rainfall over the four months is:",
    ["$280$ mm", "$300$ mm", "$320$ mm", "$330$ mm"],
    "D",
    "EASY",
    "$80 + 90 + 100 + 60 = 330$ mm.\n\n**Answer: D**",
  ),
  mcq(
    "A line graph shows daily school attendance: Mon $480$, Tue $475$, Wed $470$, Thu $460$, Fri $445$. The trend is:",
    ["Increasing", "Decreasing", "Constant", "Cyclical"],
    "B",
    "EASY",
    "Attendance decreases each day, so the trend is decreasing.\n\n**Answer: B**",
  ),
  mcq(
    "A line graph plots distance (km) vs time (hours) for a Melbourne road trip. After $2$ hours the car has travelled $160$ km. The car's average speed (in km/h) is:",
    ["$60$", "$70$", "$80$", "$90$"],
    "C",
    "EASY",
    "Average speed: $\\dfrac{160}{2} = 80$ km/h.\n\n**Answer: C**",
  ),
  mcq(
    "A line graph of monthly sales shows $\\$5\\,000$ in May and $\\$6\\,500$ in June. The percentage increase from May to June is:",
    ["$15\\%$", "$25\\%$", "$30\\%$", "$50\\%$"],
    "C",
    "EASY",
    "Increase: $\\$1\\,500$. Percentage: $\\dfrac{1500}{5000} \\times 100 = 30\\%$.\n\n**Answer: C**",
  ),
  mcq(
    "A line graph plots a Melbourne suburb's population over $4$ years: $4\\,800$, $5\\,200$, $5\\,500$, $5\\,800$. The mean population (to the nearest hundred) is:",
    ["$5\\,000$", "$5\\,200$", "$5\\,300$", "$5\\,500$"],
    "C",
    "MEDIUM",
    "Total: $4\\,800 + 5\\,200 + 5\\,500 + 5\\,800 = 21\\,300$. Mean: $\\dfrac{21300}{4} = 5\\,325$, rounded to $5\\,300$.\n\n**Answer: C**",
  ),
  mcq(
    "A line graph of a Brisbane cafe's weekly customers across $5$ weeks: $200$, $220$, $245$, $240$, $260$. The week-on-week percentage increase from week $2$ to week $3$ is closest to:",
    ["$10\\%$", "$11\\%$", "$15\\%$", "$25\\%$"],
    "B",
    "MEDIUM",
    "Increase: $245 - 220 = 25$. Percentage: $\\dfrac{25}{220} \\times 100 \\approx 11.4\\%$, closest to $11\\%$.\n\n**Answer: B**",
  ),
  mcq(
    "On a line graph showing daily takings of $\\$420$, $\\$510$, $\\$385$, $\\$580$, $\\$720$ across one week, the median is:",
    ["$\\$420$", "$\\$510$", "$\\$580$", "$\\$720$"],
    "B",
    "MEDIUM",
    "Sorted: $\\$385$, $\\$420$, $\\$510$, $\\$580$, $\\$720$. Median (middle of $5$): $\\$510$.\n\n**Answer: B**",
  ),
  mcq(
    "A line graph shows the share price of a Sydney company over $4$ days: $\\$4.20$, $\\$4.10$, $\\$3.95$, $\\$4.50$. The total change in price across these days is:",
    ["$+\\$0.30$", "$+\\$0.40$", "$-\\$0.10$", "$-\\$0.20$"],
    "A",
    "MEDIUM",
    "End minus start: $\\$4.50 - \\$4.20 = +\\$0.30$.\n\n**Answer: A**",
  ),
  mcq(
    "A line graph of a runner's distance over time shows steeper slope between $t = 0$ and $t = 5$ minutes than between $t = 5$ and $t = 10$ minutes. This indicates:",
    ["The runner was faster in the first $5$ minutes", "The runner was slower in the first $5$ minutes", "The runner stopped at $t = 5$ minutes", "The runner ran backwards"],
    "A",
    "MEDIUM",
    "On a distance-time graph, steeper slope = greater speed.\n\n**Answer: A**",
  ),
  mcq(
    "A line graph of monthly rainfall in Melbourne: Jul $42$ mm, Aug $48$ mm, Sep $58$ mm. The percentage change from July to September is:",
    ["$28\\%$ increase", "$38\\%$ increase", "$45\\%$ increase", "$58\\%$ increase"],
    "B",
    "MEDIUM",
    "Change: $58 - 42 = 16$. Percentage: $\\dfrac{16}{42} \\times 100 \\approx 38.1\\%$, so $38\\%$.\n\n**Answer: B**",
  ),
  mcq(
    "A line graph of a company's quarterly profit (Q1 $\\$30\\,000$, Q2 $\\$45\\,000$, Q3 $\\$40\\,000$, Q4 $\\$50\\,000$) gives an annual mean profit per quarter of:",
    ["$\\$40\\,000$", "$\\$41\\,250$", "$\\$42\\,500$", "$\\$45\\,000$"],
    "B",
    "HARD",
    "Total: $30 + 45 + 40 + 50 = \\$165\\,000$. Mean: $\\dfrac{165000}{4} = \\$41\\,250$.\n\n**Answer: B**",
  ),
  mcq(
    "A line graph of weekly cafe takings shows a steady increase of $\\$80$ per week starting from $\\$520$ in week $1$. The takings in week $8$ are:",
    ["$\\$960$", "$\\$1\\,040$", "$\\$1\\,080$", "$\\$1\\,160$"],
    "C",
    "HARD",
    "From week $1$ to week $8$ is $7$ increases of $\\$80$: $520 + 7 \\times 80 = 520 + 560 = \\$1\\,080$.\n\n**Answer: C**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "A line graph shows daily temperatures (in °C): Mon $18$, Tue $20$, Wed $22$, Thu $17$, Fri $19$. State the highest temperature and on which day it occurred.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Highest is $22$°C, on Wednesday.",
  ),
  sa(
    "A line graph plots distance vs time: a Melbourne cyclist covers $30$ km in $1.5$ hours. Calculate the average speed in km/h.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Average speed $= \\dfrac{30}{1.5} = 20$ km/h.",
  ),
  sa(
    "A line graph of monthly cafe sales: Jan $\\$4\\,200$, Feb $\\$4\\,800$. Calculate the increase from Jan to Feb.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $\\$4\\,800 - \\$4\\,200 = \\$600$.",
  ),
  sa(
    "A line graph shows monthly rainfall in Sydney (mm): Jan $80$, Feb $90$, Mar $100$, Apr $60$.\n\n(i) State the month with the lowest rainfall.\n(ii) Calculate the total rainfall over the four months.",
    2,
    "EASY",
    "**Step 1 (1 mark):** (i) April, with $60$ mm.\n\n**Step 2 (1 mark):** (ii) $80 + 90 + 100 + 60 = 330$ mm.",
  ),
  sa(
    "A line graph shows the share price (\\$) of a Brisbane company over $5$ days: $3.20$, $3.40$, $3.60$, $3.50$, $3.80$.\n\nCalculate the total change in share price from day $1$ to day $5$, and express it as a percentage of the day-$1$ price (to one decimal place).",
    2,
    "EASY",
    "**Step 1 (1 mark):** Change: $\\$3.80 - \\$3.20 = \\$0.60$.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{0.60}{3.20} \\times 100 = 18.75\\% \\approx 18.8\\%$.",
  ),
  sa(
    "A line graph of monthly cafe takings shows: Jan $\\$5\\,000$, Feb $\\$5\\,500$, Mar $\\$6\\,000$, Apr $\\$6\\,500$.\n\nCalculate the average (mean) monthly takings.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Total: $\\$5\\,000 + \\$5\\,500 + \\$6\\,000 + \\$6\\,500 = \\$23\\,000$.\n\n**Step 2 (1 mark):** Mean: $\\dfrac{23000}{4} = \\$5\\,750$.",
  ),
  sa(
    "A line graph shows the weekly weight (kg) of a Melbourne athlete over $4$ weeks: $76.0$, $75.4$, $75.0$, $74.2$.\n\nCalculate the total weight loss across the $4$ weeks.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Difference: $76.0 - 74.2 = 1.8$.\n\n**Step 2 (1 mark):** Total weight loss is $1.8$ kg.",
  ),
  sa(
    "A line graph shows the height (cm) of a Sydney sunflower over $4$ weeks: Week $1$: $24$, Week $2$: $36$, Week $3$: $52$, Week $4$: $68$.\n\nCalculate the growth from Week $1$ to Week $4$, and express it as a percentage of the Week $1$ height (to one decimal place).",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Growth: $68 - 24 = 44$ cm.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{44}{24} \\times 100 \\approx 183.3\\%$.",
  ),
  sa(
    "A line graph shows the population (in thousands) of a Melbourne suburb across $5$ years: $24$, $25$, $27$, $30$, $34$.\n\nDescribe the trend in one short sentence and calculate the total population change from year $1$ to year $5$ in thousands.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** The population is increasing each year (an upward trend).\n\n**Step 2 (1 mark):** Change: $34 - 24 = 10$ thousand.",
  ),
  sa(
    "A line graph shows the daily maximum temperature (°C) in Brisbane for one week: $28$, $30$, $32$, $31$, $29$, $27$, $26$.\n\nCalculate the mean daily maximum temperature (to one decimal place), and identify the day with the largest day-to-day drop.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Total: $28 + 30 + 32 + 31 + 29 + 27 + 26 = 203$.\n\n**Step 2 (1 mark):** Mean: $\\dfrac{203}{7} = 29.0$°C.\n\n**Step 3 (1 mark):** Day-to-day drops: $-1$, $-2$, $-2$, $-1$. The largest drops are between days $3$–$4$ and days $4$–$5$, each $2$°C.",
  ),
  sa(
    "A line graph shows a Melbourne business' annual profit (\\$) over $5$ years: $40\\,000$, $44\\,000$, $52\\,000$, $58\\,000$, $66\\,000$.\n\nCalculate the percentage increase from year $1$ to year $5$ (to one decimal place), and the average year-on-year increase in dollars.",
    3,
    "HARD",
    "**Step 1 (1 mark):** Year-$1$ to Year-$5$ change: $\\$66\\,000 - \\$40\\,000 = \\$26\\,000$.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{26000}{40000} \\times 100 = 65.0\\%$.\n\n**Step 3 (1 mark):** Average year-on-year increase: $\\dfrac{\\$26\\,000}{4} = \\$6\\,500$ per year.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "A Melbourne cafe records its weekly takings (\\$) across $6$ weeks in a line graph.\n\n| Week | Takings (\\$) |\n|---|---|\n| 1 | 4\\,200 |\n| 2 | 4\\,600 |\n| 3 | 5\\,100 |\n| 4 | 5\\,300 |\n| 5 | 5\\,800 |\n| 6 | 6\\,400 |",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Describe the overall trend in the line graph.",
        solution: "**Step 1 (1 mark):** The takings show a steady upward (increasing) trend across the $6$ weeks.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the total takings over the $6$ weeks.",
        solution: "**Step 1 (1 mark):** Sum: $4\\,200 + 4\\,600 + 5\\,100 + 5\\,300 + 5\\,800 + 6\\,400$.\n\n**Step 2 (1 mark):** Total: $\\$31\\,400$.",
      },
      {
        label: "c",
        marks: 1,
        content: "Calculate the mean weekly takings.",
        solution: "**Step 1 (1 mark):** Mean: $\\dfrac{\\$31\\,400}{6} \\approx \\$5\\,233.33$ per week.",
      },
      {
        label: "d",
        marks: 2,
        content: "Calculate the percentage increase in takings from week $1$ to week $6$, correct to one decimal place.",
        solution: "**Step 1 (1 mark):** Increase: $\\$6\\,400 - \\$4\\,200 = \\$2\\,200$.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{2200}{4200} \\times 100 \\approx 52.4\\%$.",
      },
    ],
  ),
  ea(
    "A Sydney AFL coach plots the team's points scored across one season's $5$ rounds:\n\n| Round | Points |\n|---|---|\n| 1 | 84 |\n| 2 | 96 |\n| 3 | 110 |\n| 4 | 102 |\n| 5 | 118 |",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "State the round in which the team scored the most points.",
        solution: "**Step 1 (1 mark):** Round $5$, with $118$ points.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the mean points scored per round, correct to one decimal place.",
        solution: "**Step 1 (1 mark):** Total: $84 + 96 + 110 + 102 + 118 = 510$.\n\n**Step 2 (1 mark):** Mean: $\\dfrac{510}{5} = 102.0$ points per round.",
      },
      {
        label: "c",
        marks: 1,
        content: "Calculate the round-on-round change between Round $3$ and Round $4$.",
        solution: "**Step 1 (1 mark):** $102 - 110 = -8$ points (a decrease of $8$).",
      },
      {
        label: "d",
        marks: 2,
        content: "Calculate the percentage increase from Round $1$ to Round $5$, correct to one decimal place.",
        solution: "**Step 1 (1 mark):** Increase: $118 - 84 = 34$ points.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{34}{84} \\times 100 \\approx 40.5\\%$.",
      },
    ],
  ),
  ea(
    "A Brisbane cycling group records the monthly distance (in km) ridden by one rider across $6$ months:\n\n| Month | Distance (km) |\n|---|---|\n| Jan | 120 |\n| Feb | 160 |\n| Mar | 200 |\n| Apr | 180 |\n| May | 220 |\n| Jun | 260 |",
    "HARD",
    [
      {
        label: "a",
        marks: 1,
        content: "State the modal direction of change in the line graph (mostly increasing, mostly decreasing, or constant).",
        solution: "**Step 1 (1 mark):** Mostly increasing (only April shows a small decrease compared to March).",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the total distance ridden over the $6$ months and the mean monthly distance.",
        solution: "**Step 1 (1 mark):** Total: $120 + 160 + 200 + 180 + 220 + 260 = 1\\,140$ km.\n\n**Step 2 (1 mark):** Mean: $\\dfrac{1140}{6} = 190$ km per month.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the percentage change between March and April (using March as the base), correct to one decimal place.",
        solution: "**Step 1 (1 mark):** Change: $180 - 200 = -20$ km.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{-20}{200} \\times 100 = -10.0\\%$ (a $10\\%$ decrease).",
      },
      {
        label: "d",
        marks: 2,
        content: "If the rider's goal is to average at least $200$ km per month over the $6$ months, did she meet her goal? Justify your answer with a calculation.",
        solution: "**Step 1 (1 mark):** Required total: $200 \\times 6 = 1\\,200$ km.\n\n**Step 2 (1 mark):** Actual total: $1\\,140$ km, which is less than $1\\,200$ km, so she did NOT meet her goal (she was $60$ km short).",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`line-graphs: wrote ${items.length} items to ${OUT}`);
