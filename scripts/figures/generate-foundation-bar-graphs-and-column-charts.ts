/**
 * Foundation generator: bar-graphs-and-column-charts
 * Tier: core-drill + extended-fit (14 MCQ + 11 SHORT + 3 EXT_ANS = 28)
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/bar-graphs-and-column-charts.json");

const TOPIC = "data-analysis-probability-and-statistics";
const SUB = "bar-graphs-and-column-charts";

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
    "A bar chart shows the number of goals scored by an AFL team across four quarters: Q1: $3$, Q2: $5$, Q3: $2$, Q4: $6$. Which quarter had the highest number of goals?",
    ["Q1", "Q2", "Q3", "Q4"],
    "D",
    "EASY",
    "The largest bar is Q4 with $6$ goals.\n\n**Answer: D**",
  ),
  mcq(
    "A column chart shows weekend coffee sales at a Brisbane cafe:\n\n| Day | Cups sold |\n|---|---|\n| Saturday | 120 |\n| Sunday | 95 |\n\nThe total cups sold over the weekend is:",
    ["$25$", "$95$", "$120$", "$215$"],
    "D",
    "EASY",
    "Total $= 120 + 95 = 215$ cups.\n\n**Answer: D**",
  ),
  mcq(
    "A bar chart shows favourite ice-cream flavours at a Melbourne school: Vanilla $24$, Chocolate $32$, Strawberry $18$, Mint $14$. The most popular flavour is:",
    ["Vanilla", "Chocolate", "Strawberry", "Mint"],
    "B",
    "EASY",
    "Chocolate has the tallest bar with $32$ students.\n\n**Answer: B**",
  ),
  mcq(
    "A column chart shows daily rainfall in Sydney across one week. Tuesday recorded $8$ mm and Wednesday $5$ mm. The difference between Tuesday and Wednesday rainfall is:",
    ["$3$ mm", "$5$ mm", "$8$ mm", "$13$ mm"],
    "A",
    "EASY",
    "$8 - 5 = 3$ mm.\n\n**Answer: A**",
  ),
  mcq(
    "A bar chart shows the number of pets owned by students in a class: Dog $12$, Cat $8$, Bird $3$, Rabbit $2$. The total number of pets shown is:",
    ["$15$", "$20$", "$23$", "$25$"],
    "D",
    "EASY",
    "$12 + 8 + 3 + 2 = 25$.\n\n**Answer: D**",
  ),
  mcq(
    "On a column chart of weekly cafe sales, the bar for Monday has a height of $4$ small-square-units and each unit represents $\\$50$. Monday's sales are:",
    ["$\\$50$", "$\\$150$", "$\\$200$", "$\\$400$"],
    "C",
    "EASY",
    "$4 \\times \\$50 = \\$200$.\n\n**Answer: C**",
  ),
  mcq(
    "A bar chart shows suburb populations:\n\n| Suburb | Population |\n|---|---|\n| Footscray | 17\\,000 |\n| Brunswick | 25\\,000 |\n| Carlton | 18\\,000 |\n| Richmond | 28\\,000 |\n\nWhich suburb has the smallest population?",
    ["Footscray", "Brunswick", "Carlton", "Richmond"],
    "A",
    "MEDIUM",
    "Smallest value is $17\\,000$ at Footscray.\n\n**Answer: A**",
  ),
  mcq(
    "A column chart shows monthly bookings at a Melbourne restaurant: Jan $80$, Feb $120$, Mar $100$, Apr $140$. The mean monthly bookings is:",
    ["$80$", "$100$", "$110$", "$120$"],
    "C",
    "MEDIUM",
    "Total: $80 + 120 + 100 + 140 = 440$. Mean: $\\dfrac{440}{4} = 110$.\n\n**Answer: C**",
  ),
  mcq(
    "A school sausage sizzle sold $90$ sausages on Friday and $135$ on Saturday. On a column chart, the height of Saturday's bar compared to Friday's is:",
    ["$0.5$ times", "$1.0$ times", "$1.5$ times", "$2.0$ times"],
    "C",
    "MEDIUM",
    "$\\dfrac{135}{90} = 1.5$.\n\n**Answer: C**",
  ),
  mcq(
    "A bar chart shows the number of AFL games attended by four friends: Ali $6$, Ben $4$, Cara $9$, Dee $5$. The total games attended (the sum of all bars) is:",
    ["$18$", "$20$", "$22$", "$24$"],
    "D",
    "MEDIUM",
    "$6 + 4 + 9 + 5 = 24$.\n\n**Answer: D**",
  ),
  mcq(
    "A column chart compares two products' weekly sales in a Brisbane supermarket: Product X sold $480$ units and Product Y sold $320$ units. The ratio of X to Y sales (simplified) is:",
    ["$2:1$", "$3:2$", "$4:3$", "$5:3$"],
    "B",
    "MEDIUM",
    "$\\dfrac{480}{320} = \\dfrac{3}{2}$, so the ratio is $3:2$.\n\n**Answer: B**",
  ),
  mcq(
    "A bar chart shows weekly hours of exercise:\n\n| Person | Hours |\n|---|---|\n| Aisha | 5 |\n| Ben | 8 |\n| Chen | 3 |\n| Dee | 6 |\n\nThe mean number of hours per person is:",
    ["$4.5$", "$5.0$", "$5.5$", "$6.0$"],
    "C",
    "MEDIUM",
    "Total: $5 + 8 + 3 + 6 = 22$. Mean: $\\dfrac{22}{4} = 5.5$ hours.\n\n**Answer: C**",
  ),
  mcq(
    "A column chart of cafe takings shows Monday $\\$420$, Tuesday $\\$510$, Wednesday $\\$385$, Thursday $\\$580$, Friday $\\$720$. The day with takings closest to the mean is:",
    ["Monday", "Tuesday", "Wednesday", "Thursday"],
    "B",
    "HARD",
    "Total: $420 + 510 + 385 + 580 + 720 = \\$2\\,615$. Mean: $\\dfrac{2615}{5} = \\$523$. Tuesday ($\\$510$) is closest.\n\n**Answer: B**",
  ),
  mcq(
    "A bar chart originally shows sales of $200$ units. After a redesign, all values on the chart are scaled up by $15\\%$. The new value displayed for that bar is:",
    ["$215$", "$220$", "$230$", "$250$"],
    "C",
    "HARD",
    "$200 \\times 1.15 = 230$.\n\n**Answer: C**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "A column chart shows AFL goals scored: Q1 $3$, Q2 $5$, Q3 $2$, Q4 $6$. Calculate the total goals.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $3 + 5 + 2 + 6 = 16$ goals.",
  ),
  sa(
    "A bar chart shows favourite sports of $40$ students: Soccer $14$, AFL $12$, Basketball $9$, Netball $5$. Which sport is least popular?",
    1,
    "EASY",
    "**Step 1 (1 mark):** Netball, with $5$ students.",
  ),
  sa(
    "A column chart shows weekly takings at a Sydney cafe: Mon $\\$300$, Tue $\\$420$, Wed $\\$380$. Calculate the total takings.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $\\$300 + \\$420 + \\$380 = \\$1\\,100$.",
  ),
  sa(
    "A bar chart at a Melbourne primary school shows the number of books read in a term by four students: Anna $12$, Beth $9$, Cai $15$, Dan $6$.\n\nCalculate the difference between the highest and lowest number of books read.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Highest: Cai with $15$ books. Lowest: Dan with $6$ books.\n\n**Step 2 (1 mark):** Difference: $15 - 6 = 9$ books.",
  ),
  sa(
    "A column chart records the number of cars passing a Brisbane school crossing each hour: 8 am $42$, 9 am $28$, 10 am $19$, 11 am $25$.\n\nCalculate the mean number of cars per hour.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Total cars: $42 + 28 + 19 + 25 = 114$.\n\n**Step 2 (1 mark):** Mean: $\\dfrac{114}{4} = 28.5$ cars per hour.",
  ),
  sa(
    "A column chart shows ice-cream sales at a Sydney beach kiosk:\n\n| Flavour | Cones sold |\n|---|---|\n| Vanilla | 48 |\n| Chocolate | 36 |\n| Strawberry | 21 |\n| Mango | 15 |\n\nCalculate the total number of cones sold and express vanilla sales as a percentage of the total (to the nearest whole percent).",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Total: $48 + 36 + 21 + 15 = 120$ cones.\n\n**Step 2 (1 mark):** Vanilla percentage: $\\dfrac{48}{120} \\times 100 = 40\\%$.",
  ),
  sa(
    "A bar chart shows the number of AFL games attended by four friends: Ali $7$, Ben $4$, Cara $11$, Dee $6$.\n\nCalculate the mean number of games attended.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Total: $7 + 4 + 11 + 6 = 28$ games.\n\n**Step 2 (1 mark):** Mean: $\\dfrac{28}{4} = 7$ games per person.",
  ),
  sa(
    "A column chart shows monthly cafe takings in Melbourne: Jan $\\$8\\,200$, Feb $\\$7\\,500$, Mar $\\$9\\,400$, Apr $\\$10\\,100$.\n\nCalculate the total takings and the mean monthly takings.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Total: $\\$8\\,200 + \\$7\\,500 + \\$9\\,400 + \\$10\\,100 = \\$35\\,200$.\n\n**Step 2 (1 mark):** Mean: $\\dfrac{\\$35\\,200}{4} = \\$8\\,800$ per month.",
  ),
  sa(
    "On a column chart, $1$ small-square-unit on the vertical axis represents $25$ items. The bar for Tuesday is $6$ small-square-units high.\n\nCalculate the number of items represented for Tuesday.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Each unit represents $25$ items.\n\n**Step 2 (1 mark):** Tuesday total: $6 \\times 25 = 150$ items.",
  ),
  sa(
    "A column chart in a Sydney newspaper shows pizza orders at a takeaway across one week: Mon $40$, Tue $35$, Wed $42$, Thu $58$, Fri $95$, Sat $120$, Sun $80$.\n\nCalculate the total pizzas sold for the week, the mean pizzas per day, and the percentage of weekly orders that occurred on Friday and Saturday combined (to the nearest whole percent).",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Total: $40 + 35 + 42 + 58 + 95 + 120 + 80 = 470$ pizzas.\n\n**Step 2 (1 mark):** Mean: $\\dfrac{470}{7} \\approx 67.1$ pizzas per day.\n\n**Step 3 (1 mark):** Fri+Sat: $95 + 120 = 215$. Percentage: $\\dfrac{215}{470} \\times 100 \\approx 46\\%$.",
  ),
  sa(
    "A bar chart shows the population (in thousands) of four Melbourne suburbs:\n\n| Suburb | Population (thousands) |\n|---|---|\n| Footscray | 17 |\n| Brunswick | 25 |\n| Carlton | 18 |\n| Richmond | 28 |\n\nCalculate the total population of the four suburbs, then calculate the percentage of the total that lives in Richmond (to one decimal place).",
    3,
    "HARD",
    "**Step 1 (1 mark):** Total: $17 + 25 + 18 + 28 = 88$ thousand.\n\n**Step 2 (1 mark):** Richmond's share: $\\dfrac{28}{88}$.\n\n**Step 3 (1 mark):** Percentage: $\\dfrac{28}{88} \\times 100 \\approx 31.8\\%$.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "A Melbourne high school surveyed students about their preferred lunchtime sport. The results are displayed as a column chart:\n\n| Sport | Number of students |\n|---|---|\n| Soccer | 48 |\n| AFL | 36 |\n| Basketball | 28 |\n| Netball | 22 |\n| Other | 16 |",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the total number of students surveyed.",
        solution: "**Step 1 (1 mark):** $48 + 36 + 28 + 22 + 16 = 150$ students.",
      },
      {
        label: "b",
        marks: 1,
        content: "Which sport is the most popular and which is the least popular?",
        solution: "**Step 1 (1 mark):** Most popular: Soccer ($48$). Least popular: Other ($16$).",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the percentage of students who chose AFL, correct to one decimal place.",
        solution: "**Step 1 (1 mark):** AFL count is $36$ out of $150$.\n\n**Step 2 (1 mark):** $\\dfrac{36}{150} \\times 100 = 24.0\\%$.",
      },
      {
        label: "d",
        marks: 2,
        content: "If the school plans to fund the top three sports proportionally and has $\\$4\\,800$ to distribute (in proportion to student counts among Soccer, AFL and Basketball), how much is allocated to AFL?",
        solution: "**Step 1 (1 mark):** Top three total: $48 + 36 + 28 = 112$. AFL share: $\\dfrac{36}{112}$.\n\n**Step 2 (1 mark):** AFL funding: $\\dfrac{36}{112} \\times \\$4\\,800 = \\$1\\,542.86$ (to the nearest cent).",
      },
    ],
  ),
  ea(
    "A Brisbane bakery records its daily croissant sales over one week using a column chart:\n\n| Day | Croissants sold |\n|---|---|\n| Monday | 60 |\n| Tuesday | 45 |\n| Wednesday | 50 |\n| Thursday | 65 |\n| Friday | 85 |\n| Saturday | 120 |\n| Sunday | 95 |",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Identify the busiest day of the week.",
        solution: "**Step 1 (1 mark):** Saturday, with $120$ croissants sold.",
      },
      {
        label: "b",
        marks: 1,
        content: "Calculate the total croissants sold for the week.",
        solution: "**Step 1 (1 mark):** $60 + 45 + 50 + 65 + 85 + 120 + 95 = 520$ croissants.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the mean number of croissants sold per day, correct to one decimal place.",
        solution: "**Step 1 (1 mark):** Total is $520$ over $7$ days.\n\n**Step 2 (1 mark):** Mean: $\\dfrac{520}{7} \\approx 74.3$ croissants per day.",
      },
      {
        label: "d",
        marks: 2,
        content: "If croissants sell for $\\$5.20$ each, calculate the total revenue from croissant sales for the week.",
        solution: "**Step 1 (1 mark):** Revenue per croissant is $\\$5.20$.\n\n**Step 2 (1 mark):** Total revenue: $520 \\times \\$5.20 = \\$2\\,704.00$.",
      },
    ],
  ),
  ea(
    "A Sydney climbing gym recorded the number of members visiting on each day of one week. The data is shown below.\n\n| Day | Visitors |\n|---|---|\n| Mon | 84 |\n| Tue | 102 |\n| Wed | 96 |\n| Thu | 110 |\n| Fri | 145 |\n| Sat | 180 |\n| Sun | 160 |",
    "HARD",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the total number of visitors for the week.",
        solution: "**Step 1 (1 mark):** $84 + 102 + 96 + 110 + 145 + 180 + 160 = 877$ visitors.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the mean number of visitors per day, correct to one decimal place.",
        solution: "**Step 1 (1 mark):** Total: $877$ visitors over $7$ days.\n\n**Step 2 (1 mark):** Mean: $\\dfrac{877}{7} \\approx 125.3$ visitors per day.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the percentage of weekly visitors that came on the weekend (Saturday + Sunday), correct to one decimal place.",
        solution: "**Step 1 (1 mark):** Weekend visitors: $180 + 160 = 340$.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{340}{877} \\times 100 \\approx 38.8\\%$.",
      },
      {
        label: "d",
        marks: 2,
        content: "If each visitor pays $\\$22$ for entry, calculate the gym's weekly revenue from entries.",
        solution: "**Step 1 (1 mark):** Total visitors: $877$.\n\n**Step 2 (1 mark):** Revenue: $877 \\times \\$22 = \\$19\\,294$.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`bar-graphs-and-column-charts: wrote ${items.length} items to ${OUT}`);
