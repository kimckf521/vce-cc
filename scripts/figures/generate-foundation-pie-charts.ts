/**
 * Foundation generator: pie-charts
 *
 * Tier: core-drill + extended-fit (no modelling-rich).
 * Targets: 14 MCQ + 11 SHORT_ANSWER + 3 EXTENDED_ANSWER = 28 items.
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/pie-charts.json");

const TOPIC = "data-analysis-probability-and-statistics";
const SUB = "pie-charts";

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
    "A pie chart shows the favourite drinks of $60$ students. The slice labelled 'Water' represents $25\\%$ of the chart. How many students chose Water?",
    ["$12$", "$15$", "$18$", "$20$"],
    "B",
    "EASY",
    "$25\\%$ of $60 = 0.25 \\times 60 = 15$.\n\n**Answer: B**",
  ),
  mcq(
    "A pie chart is divided into four slices: red $40\\%$, blue $30\\%$, green $20\\%$, and yellow. The percentage for yellow is:",
    ["$5\\%$", "$10\\%$", "$15\\%$", "$20\\%$"],
    "B",
    "EASY",
    "Slices total $100\\%$. Yellow $= 100 - 40 - 30 - 20 = 10\\%$.\n\n**Answer: B**",
  ),
  mcq(
    "A whole pie chart represents $360^{\\circ}$. The slice representing $50\\%$ of the data has an angle of:",
    ["$90^{\\circ}$", "$120^{\\circ}$", "$180^{\\circ}$", "$240^{\\circ}$"],
    "C",
    "EASY",
    "$50\\%$ of $360^{\\circ} = 180^{\\circ}$.\n\n**Answer: C**",
  ),
  mcq(
    "In a pie chart, the slice representing 'Bus' has an angle of $72^{\\circ}$. The percentage of people who travel by bus is:",
    ["$15\\%$", "$20\\%$", "$25\\%$", "$30\\%$"],
    "B",
    "EASY",
    "Percentage $= \\dfrac{72}{360} \\times 100 = 20\\%$.\n\n**Answer: B**",
  ),
  mcq(
    "A pie chart of $200$ people shows that $25\\%$ chose pizza. The number who chose pizza is:",
    ["$25$", "$40$", "$50$", "$75$"],
    "C",
    "EASY",
    "$25\\%$ of $200 = 50$.\n\n**Answer: C**",
  ),
  mcq(
    "The slice in a pie chart representing $\\dfrac{1}{4}$ of the data has an angle of:",
    ["$45^{\\circ}$", "$60^{\\circ}$", "$72^{\\circ}$", "$90^{\\circ}$"],
    "D",
    "EASY",
    "$\\dfrac{1}{4} \\times 360^{\\circ} = 90^{\\circ}$.\n\n**Answer: D**",
  ),
  mcq(
    "Which of the following types of data is best displayed using a pie chart?",
    [
      "Maximum daily temperature over a month",
      "Proportion of students choosing each elective subject",
      "Heights of students in a class",
      "A student's test marks over a year",
    ],
    "B",
    "EASY",
    "Pie charts compare parts of a single whole — best for proportions of categorical data.\n\n**Answer: B**",
  ),
  mcq(
    "A pie chart shows the budget for a school camp of $\\$8\\,000$. The slice for 'Transport' is $45^{\\circ}$. The amount spent on transport is:",
    ["$\\$800$", "$\\$1\\,000$", "$\\$1\\,200$", "$\\$1\\,800$"],
    "B",
    "MEDIUM",
    "Fraction: $\\dfrac{45}{360} = \\dfrac{1}{8}$. Amount: $\\dfrac{1}{8} \\times \\$8\\,000 = \\$1\\,000$.\n\n**Answer: B**",
  ),
  mcq(
    "In a survey of $720$ people, a pie chart shows that $35\\%$ prefer coffee. The angle of the 'coffee' slice is:",
    ["$108^{\\circ}$", "$126^{\\circ}$", "$135^{\\circ}$", "$140^{\\circ}$"],
    "B",
    "MEDIUM",
    "Angle $= 35\\%$ of $360^{\\circ} = 0.35 \\times 360 = 126^{\\circ}$.\n\n**Answer: B**",
  ),
  mcq(
    "A pie chart shows household spending. The slice for 'Rent' is $144^{\\circ}$. If total monthly spending is $\\$3\\,600$, the amount spent on rent is:",
    ["$\\$1\\,200$", "$\\$1\\,440$", "$\\$1\\,800$", "$\\$2\\,400$"],
    "B",
    "MEDIUM",
    "Fraction: $\\dfrac{144}{360} = 0.4$. Rent: $0.4 \\times \\$3\\,600 = \\$1\\,440$.\n\n**Answer: B**",
  ),
  mcq(
    "A class of $30$ students chose their favourite sport. $12$ chose soccer. The angle on a pie chart for soccer is:",
    ["$120^{\\circ}$", "$135^{\\circ}$", "$144^{\\circ}$", "$150^{\\circ}$"],
    "C",
    "MEDIUM",
    "Fraction: $\\dfrac{12}{30} = 0.4$. Angle: $0.4 \\times 360^{\\circ} = 144^{\\circ}$.\n\n**Answer: C**",
  ),
  mcq(
    "A pie chart of $240$ people shows two equal slices for 'tea' and 'juice' totalling half the chart. The number of people who chose tea is:",
    ["$30$", "$40$", "$60$", "$120$"],
    "C",
    "MEDIUM",
    "Half of $240 = 120$ for tea + juice. Each (equal): $\\dfrac{120}{2} = 60$.\n\n**Answer: C**",
  ),
  mcq(
    "A pie chart shows the population of a small town with four age categories. If $0$-$17$ years is $108^{\\circ}$ and the town has $1\\,500$ people, the number aged $0$-$17$ is:",
    ["$300$", "$420$", "$450$", "$540$"],
    "C",
    "HARD",
    "Fraction: $\\dfrac{108}{360} = 0.3$. People: $0.3 \\times 1\\,500 = 450$.\n\n**Answer: C**",
  ),
  mcq(
    "A pie chart shows four categories with percentages $30\\%$, $25\\%$, $20\\%$, and one unknown. If the unknown slice has an angle of $90^{\\circ}$, the four percentages should sum to:",
    ["$95\\%$", "$100\\%$", "$105\\%$", "$110\\%$"],
    "B",
    "HARD",
    "Unknown slice: $\\dfrac{90}{360} \\times 100 = 25\\%$. Total: $30 + 25 + 20 + 25 = 100\\%$.\n\n**Answer: B**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "A pie chart shows that $40\\%$ of $250$ students walk to school. How many students walk?",
    1,
    "EASY",
    "**Step 1 (1 mark):** $40\\%$ of $250 = 0.4 \\times 250 = 100$ students.",
  ),
  sa(
    "A pie chart is divided into three slices: $50\\%$, $30\\%$, and the rest. Find the percentage of the third slice.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Third slice: $100 - 50 - 30 = 20\\%$.",
  ),
  sa(
    "A pie chart has a slice of $108^{\\circ}$. Express this slice as a percentage of the whole.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Percentage: $\\dfrac{108}{360} \\times 100 = 30\\%$.",
  ),
  sa(
    "In a pie chart, a slice representing $25\\%$ of the data has what angle?",
    1,
    "EASY",
    "**Step 1 (1 mark):** $25\\%$ of $360^{\\circ} = 0.25 \\times 360 = 90^{\\circ}$.",
  ),
  sa(
    "A pie chart of $480$ students shows three slices: Bus $50\\%$, Car $30\\%$, Walk $20\\%$. How many students travel by car?",
    2,
    "EASY",
    "**Step 1 (1 mark):** Fraction for car: $30\\% = 0.3$.\n\n**Step 2 (1 mark):** Students: $0.3 \\times 480 = 144$.",
  ),
  sa(
    "A pie chart has four equal slices. State the angle and the percentage represented by each slice.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Angle: $\\dfrac{360^{\\circ}}{4} = 90^{\\circ}$.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{100\\%}{4} = 25\\%$.",
  ),
  sa(
    "A pie chart shows that the slice for 'Drama' has an angle of $54^{\\circ}$. There are $200$ students surveyed. How many chose Drama?",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Fraction: $\\dfrac{54}{360} = 0.15$.\n\n**Step 2 (1 mark):** Students: $0.15 \\times 200 = 30$.",
  ),
  sa(
    "A pie chart shows the proportion of $80$ students who study each language. $24$ study Japanese. Find the angle of the 'Japanese' slice on the pie chart.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Fraction: $\\dfrac{24}{80} = 0.3$.\n\n**Step 2 (1 mark):** Angle: $0.3 \\times 360^{\\circ} = 108^{\\circ}$.",
  ),
  sa(
    "In a survey of $400$ people about preferred takeaway food, $35\\%$ chose pizza, $25\\%$ chose burgers, and $15\\%$ chose Thai food. The rest chose 'other'.\n\nCalculate the number of people who chose 'other'.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Percentage for 'other': $100 - 35 - 25 - 15 = 25\\%$.\n\n**Step 2 (1 mark):** People: $0.25 \\times 400 = 100$.",
  ),
  sa(
    "A pie chart shows household monthly spending of $\\$4\\,500$. The slice for 'Groceries' has an angle of $96^{\\circ}$.\n\nCalculate the amount spent on groceries, correct to the nearest dollar.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Fraction: $\\dfrac{96}{360}$.\n\n**Step 2 (1 mark):** Amount: $\\dfrac{96}{360} \\times \\$4\\,500 = \\$1\\,200$.\n\n**Step 3 (1 mark):** Rounded: $\\$1\\,200$.",
  ),
  sa(
    "A pie chart of $50$ students shows that $18$ chose Maths, $15$ chose English, $10$ chose Science, and the rest chose History.\n\nCalculate the angle (in degrees) for the History slice on the pie chart, correct to one decimal place.",
    3,
    "HARD",
    "**Step 1 (1 mark):** History students: $50 - 18 - 15 - 10 = 7$.\n\n**Step 2 (1 mark):** Fraction: $\\dfrac{7}{50} = 0.14$.\n\n**Step 3 (1 mark):** Angle: $0.14 \\times 360^{\\circ} = 50.4^{\\circ}$.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "A pie chart represents the type of transport used by $360$ students to travel to a Melbourne high school. The percentages are shown below.\n\n| Transport | Percentage |\n|---|---|\n| Walk | $25\\%$ |\n| Bus | $35\\%$ |\n| Car | $30\\%$ |\n| Bike | $10\\%$ |",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Verify that the percentages sum to $100\\%$.",
        solution: "**Step 1 (1 mark):** $25 + 35 + 30 + 10 = 100\\%$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the number of students who travel by bus.",
        solution: "**Step 1 (1 mark):** Fraction for bus: $35\\% = 0.35$.\n\n**Step 2 (1 mark):** Students: $0.35 \\times 360 = 126$.",
      },
      {
        label: "c",
        marks: 1,
        content: "Calculate the angle in degrees for the 'Car' slice on the pie chart.",
        solution: "**Step 1 (1 mark):** Angle: $0.3 \\times 360^{\\circ} = 108^{\\circ}$.",
      },
      {
        label: "d",
        marks: 2,
        content: "How many more students walk to school than ride a bike?",
        solution: "**Step 1 (1 mark):** Walk: $0.25 \\times 360 = 90$. Bike: $0.10 \\times 360 = 36$.\n\n**Step 2 (1 mark):** Difference: $90 - 36 = 54$ students.",
      },
    ],
  ),
  ea(
    "A small Brisbane cafe records sales of four drink types over a single day. The pie chart angles are shown below.\n\n| Drink | Angle |\n|---|---|\n| Coffee | $162^{\\circ}$ |\n| Tea | $72^{\\circ}$ |\n| Juice | $54^{\\circ}$ |\n| Water | $72^{\\circ}$ |",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Verify that the four angles sum to $360^{\\circ}$.",
        solution: "**Step 1 (1 mark):** $162 + 72 + 54 + 72 = 360^{\\circ}$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Express the proportion of customers who ordered coffee as a percentage.",
        solution: "**Step 1 (1 mark):** Fraction: $\\dfrac{162}{360}$.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{162}{360} \\times 100 = 45\\%$.",
      },
      {
        label: "c",
        marks: 2,
        content: "The cafe served $200$ drinks in total. Calculate the number of teas served.",
        solution: "**Step 1 (1 mark):** Tea fraction: $\\dfrac{72}{360} = 0.2$.\n\n**Step 2 (1 mark):** Number: $0.2 \\times 200 = 40$ teas.",
      },
    ],
  ),
  ea(
    "A community sports club has $400$ members. A pie chart shows the sports played, with the following percentages: Football $40\\%$, Netball $25\\%$, Cricket $20\\%$, and Tennis $15\\%$.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the number of football players.",
        solution: "**Step 1 (1 mark):** $40\\%$ of $400 = 0.4 \\times 400 = 160$ players.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the pie chart angle for the 'Netball' slice.",
        solution: "**Step 1 (1 mark):** Fraction: $25\\% = 0.25$.\n\n**Step 2 (1 mark):** Angle: $0.25 \\times 360^{\\circ} = 90^{\\circ}$.",
      },
      {
        label: "c",
        marks: 2,
        content: "$25$ new members join the club and choose to play tennis. Calculate the new percentage of tennis players, correct to one decimal place.",
        solution: "**Step 1 (1 mark):** Tennis originally: $0.15 \\times 400 = 60$. New tennis: $60 + 25 = 85$. New total: $400 + 25 = 425$.\n\n**Step 2 (1 mark):** New percentage: $\\dfrac{85}{425} \\times 100 = 20.0\\%$.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`pie-charts: wrote ${items.length} items to ${OUT}`);
