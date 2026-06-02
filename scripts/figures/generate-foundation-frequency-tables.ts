/**
 * Foundation generator: frequency-tables
 * Tier: core-drill + extended-fit (14 MCQ + 11 SHORT + 3 EXT_ANS = 28)
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/frequency-tables.json");

const TOPIC = "data-analysis-probability-and-statistics";
const SUB = "frequency-tables";

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
    "A frequency table of student grades shows: A: $4$, B: $9$, C: $12$, D: $5$. The total number of students is:",
    ["$25$", "$28$", "$30$", "$32$"],
    "C",
    "EASY",
    "Add all frequencies: $4 + 9 + 12 + 5 = 30$.\n\n**Answer: C**",
  ),
  mcq(
    "A frequency table records the number of pets owned by $20$ students:\n\n| Pets | Frequency |\n|---|---|\n| 0 | 6 |\n| 1 | 8 |\n| 2 | 4 |\n| 3 | 2 |\n\nThe most common number of pets is:",
    ["$0$", "$1$", "$2$", "$3$"],
    "B",
    "EASY",
    "The highest frequency is $8$, for $1$ pet.\n\n**Answer: B**",
  ),
  mcq(
    "From the frequency table:\n\n| Score | Frequency |\n|---|---|\n| 1 | 3 |\n| 2 | 5 |\n| 3 | 6 |\n| 4 | 4 |\n| 5 | 2 |\n\nThe number of students who scored $3$ or more is:",
    ["$6$", "$10$", "$12$", "$15$"],
    "C",
    "EASY",
    "Scores of $3$, $4$, $5$: $6 + 4 + 2 = 12$.\n\n**Answer: C**",
  ),
  mcq(
    "A frequency table for goals scored in an AFL game by one team shows: $0$ goals: $1$, $1$ goal: $3$, $2$ goals: $8$, $3$ goals: $5$, $4$ goals: $3$. The total number of games surveyed is:",
    ["$15$", "$18$", "$20$", "$24$"],
    "C",
    "EASY",
    "$1 + 3 + 8 + 5 + 3 = 20$ games.\n\n**Answer: C**",
  ),
  mcq(
    "A frequency table shows the number of children per household in a Melbourne suburb:\n\n| Children | Frequency |\n|---|---|\n| 0 | 12 |\n| 1 | 18 |\n| 2 | 25 |\n| 3 | 10 |\n| 4+ | 5 |\n\nThe total number of households surveyed is:",
    ["$60$", "$70$", "$75$", "$80$"],
    "B",
    "EASY",
    "$12 + 18 + 25 + 10 + 5 = 70$ households.\n\n**Answer: B**",
  ),
  mcq(
    "A frequency table groups data by class interval. Which class interval is correct?",
    ["$[10, 19]$", "$0 < x \\le 9$", "$\\{1, 2, 3\\}$", "$x > 5$"],
    "B",
    "EASY",
    "Foundation class intervals use $a < x \\le b$ style with clear bounds.\n\n**Answer: B**",
  ),
  mcq(
    "From this frequency table:\n\n| Marks | Frequency |\n|---|---|\n| $0$–$10$ | 2 |\n| $10$–$20$ | 5 |\n| $20$–$30$ | 10 |\n| $30$–$40$ | 8 |\n| $40$–$50$ | 5 |\n\nThe class interval with the highest frequency is:",
    ["$0$–$10$", "$10$–$20$", "$20$–$30$", "$30$–$40$"],
    "C",
    "MEDIUM",
    "$20$–$30$ has $10$, the highest frequency.\n\n**Answer: C**",
  ),
  mcq(
    "A frequency table shows daily sales of $20$ cafe items. If the cumulative frequency at item $4$ is $14$, the relative frequency of item $4$ (as a fraction of total) is:",
    ["$\\dfrac{14}{20}$", "$\\dfrac{4}{14}$", "$\\dfrac{4}{20}$", "$\\dfrac{14}{4}$"],
    "A",
    "MEDIUM",
    "Cumulative through item $4$ is $14$ out of $20$, so the cumulative relative frequency is $\\dfrac{14}{20}$.\n\n**Answer: A**",
  ),
  mcq(
    "A frequency table for $50$ students records test scores out of $10$:\n\n| Score | Frequency |\n|---|---|\n| 5 | 4 |\n| 6 | 8 |\n| 7 | 12 |\n| 8 | 14 |\n| 9 | 9 |\n| 10 | 3 |\n\nThe percentage of students who scored exactly $7$ is:",
    ["$12\\%$", "$20\\%$", "$24\\%$", "$28\\%$"],
    "C",
    "MEDIUM",
    "$\\dfrac{12}{50} \\times 100 = 24\\%$.\n\n**Answer: C**",
  ),
  mcq(
    "From a frequency table of $60$ Brisbane households (children per household: $0$ — $9$, $1$ — $14$, $2$ — $20$, $3$ — $12$, $4$ — $5$), the relative frequency (as a percentage) of households with $2$ children is closest to:",
    ["$20\\%$", "$28\\%$", "$33\\%$", "$40\\%$"],
    "C",
    "MEDIUM",
    "$\\dfrac{20}{60} \\times 100 \\approx 33.3\\%$, so closest to $33\\%$.\n\n**Answer: C**",
  ),
  mcq(
    "A frequency table summarises the number of cups of coffee sold each hour at a Sydney cafe:\n\n| Cups | Frequency |\n|---|---|\n| 0–5 | 2 |\n| 6–10 | 5 |\n| 11–15 | 8 |\n| 16–20 | 6 |\n| 21–25 | 4 |\n\nThe number of hours where $11$ or more cups were sold is:",
    ["$8$", "$10$", "$14$", "$18$"],
    "D",
    "MEDIUM",
    "$11$ or more: $8 + 6 + 4 = 18$ hours.\n\n**Answer: D**",
  ),
  mcq(
    "A frequency table is constructed for the heights (cm) of $40$ Year $11$ students using class width $10$. Which class boundary set is appropriate?",
    ["$140$–$150$, $150$–$160$, $\\ldots$", "$140$–$155$, $155$–$170$, $\\ldots$", "$140$–$200$ (one class)", "$\\{145, 155, 165\\}$ (single values)"],
    "A",
    "MEDIUM",
    "Class widths of $10$ cm with consistent bounds is the standard approach.\n\n**Answer: A**",
  ),
  mcq(
    "Below is a frequency table for $50$ AFL match scores:\n\n| Score range | Frequency |\n|---|---|\n| 60–79 | 6 |\n| 80–99 | 14 |\n| 100–119 | 18 |\n| 120–139 | 9 |\n| 140–159 | 3 |\n\nThe percentage of matches with a score of at least $100$ is:",
    ["$30\\%$", "$45\\%$", "$60\\%$", "$70\\%$"],
    "C",
    "HARD",
    "At least $100$: $18 + 9 + 3 = 30$. Percentage: $\\dfrac{30}{50} \\times 100 = 60\\%$.\n\n**Answer: C**",
  ),
  mcq(
    "A frequency table missing one value is shown. The total frequency is $40$.\n\n| Value | Frequency |\n|---|---|\n| A | 8 |\n| B | $x$ |\n| C | 11 |\n| D | 6 |\n\nThe missing value $x$ is:",
    ["$10$", "$12$", "$15$", "$18$"],
    "C",
    "HARD",
    "$x = 40 - (8 + 11 + 6) = 40 - 25 = 15$.\n\n**Answer: C**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "A frequency table shows: A: $5$, B: $7$, C: $3$, D: $5$. Calculate the total number of observations.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $5 + 7 + 3 + 5 = 20$.",
  ),
  sa(
    "From a frequency table of pet ownership ($0$ pets: $5$, $1$ pet: $8$, $2$ pets: $4$), state the modal (most common) number of pets.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Mode is $1$ pet, with frequency $8$.",
  ),
  sa(
    "A frequency table records test scores: Score $7$ has frequency $12$. The class total is $30$. Calculate the relative frequency for score $7$ as a fraction.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Relative frequency $= \\dfrac{12}{30} = \\dfrac{2}{5}$.",
  ),
  sa(
    "Here is a frequency table for the number of goals scored by a Melbourne AFL team in $20$ games:\n\n| Goals | Frequency |\n|---|---|\n| 0 | 1 |\n| 1 | 3 |\n| 2 | 7 |\n| 3 | 6 |\n| 4 | 3 |\n\n(i) State the mode.\n(ii) Calculate the number of games where the team scored at least $3$ goals.",
    2,
    "EASY",
    "**Step 1 (1 mark):** (i) Mode is $2$ goals (frequency $7$).\n\n**Step 2 (1 mark):** (ii) At least $3$ goals: $6 + 3 = 9$ games.",
  ),
  sa(
    "A frequency table for daily ice-cream sales at a Sydney kiosk over $30$ days is:\n\n| Cones sold | Frequency |\n|---|---|\n| 0–9 | 4 |\n| 10–19 | 8 |\n| 20–29 | 12 |\n| 30–39 | 6 |\n\nCalculate the number of days where more than $19$ cones were sold, and express this as a percentage of the $30$ days.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Days with more than $19$ cones: $12 + 6 = 18$.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{18}{30} \\times 100 = 60\\%$.",
  ),
  sa(
    "A frequency table for $50$ Year $11$ students records the number of siblings each has:\n\n| Siblings | Frequency |\n|---|---|\n| 0 | 8 |\n| 1 | 18 |\n| 2 | 15 |\n| 3 | 6 |\n| 4 | 3 |\n\nCalculate the percentage of students who have $2$ or more siblings.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** $2$ or more siblings: $15 + 6 + 3 = 24$.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{24}{50} \\times 100 = 48\\%$.",
  ),
  sa(
    "A Brisbane cafe records the number of coffees sold per hour over $40$ hours. The frequency table is:\n\n| Coffees | Frequency |\n|---|---|\n| 0–10 | 5 |\n| 11–20 | 15 |\n| 21–30 | 12 |\n| 31–40 | 8 |\n\nCalculate the cumulative frequency up to and including the $21$–$30$ class.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Cumulative up to $21$–$30$: $5 + 15 + 12$.\n\n**Step 2 (1 mark):** $= 32$ hours.",
  ),
  sa(
    "A frequency table is missing one value:\n\n| Outcome | Frequency |\n|---|---|\n| Red | 12 |\n| Blue | $x$ |\n| Green | 9 |\n| Yellow | 4 |\n\nThe total frequency is $40$. Calculate $x$, and the percentage of outcomes that were Blue (to the nearest whole percent).",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** $x = 40 - (12 + 9 + 4) = 40 - 25 = 15$.\n\n**Step 2 (1 mark):** Blue percentage: $\\dfrac{15}{40} \\times 100 = 37.5\\% \\approx 38\\%$.",
  ),
  sa(
    "A Melbourne survey records the number of TVs per household in $60$ households:\n\n| TVs | Frequency |\n|---|---|\n| 0 | 5 |\n| 1 | 22 |\n| 2 | 18 |\n| 3 | 10 |\n| 4+ | 5 |\n\nCalculate the cumulative frequency up to (and including) $2$ TVs, and express it as a percentage of the total surveyed.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Cumulative up to $2$ TVs: $5 + 22 + 18 = 45$.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{45}{60} \\times 100 = 75\\%$.",
  ),
  sa(
    "A Sydney researcher records weekly spending on groceries by $80$ households:\n\n| Spending range (\\$) | Frequency |\n|---|---|\n| 0–99 | 6 |\n| 100–199 | 18 |\n| 200–299 | 26 |\n| 300–399 | 22 |\n| 400+ | 8 |\n\nCalculate the relative frequency (as a percentage, to one decimal place) of each of the lowest and highest spending categories.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Lowest ($0$–$99$): $\\dfrac{6}{80} \\times 100 = 7.5\\%$.\n\n**Step 2 (1 mark):** Highest ($400+$): $\\dfrac{8}{80} \\times 100 = 10.0\\%$.\n\n**Step 3 (1 mark):** Both calculations check out: $7.5\\%$ and $10.0\\%$ respectively.",
  ),
  sa(
    "A frequency table for $100$ students records test scores out of $20$. The cumulative frequency at score $15$ is $78$. Calculate the percentage of students who scored less than or equal to $15$, and the percentage who scored more than $15$.",
    3,
    "HARD",
    "**Step 1 (1 mark):** Students with score $\\le 15$: $78$.\n\n**Step 2 (1 mark):** Percentage scoring $\\le 15$: $\\dfrac{78}{100} \\times 100 = 78\\%$.\n\n**Step 3 (1 mark):** Percentage scoring $> 15$: $100\\% - 78\\% = 22\\%$.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "A Melbourne high school surveys $50$ Year $11$ students about the number of after-school activities they do per week. The frequency table is below.\n\n| Activities | Frequency |\n|---|---|\n| 0 | 4 |\n| 1 | 12 |\n| 2 | 18 |\n| 3 | 10 |\n| 4 | 4 |\n| 5 | 2 |",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "State the modal number of activities.",
        solution: "**Step 1 (1 mark):** Mode is $2$ activities (frequency $18$).",
      },
      {
        label: "b",
        marks: 1,
        content: "Calculate the total frequency to confirm it equals $50$.",
        solution: "**Step 1 (1 mark):** $4 + 12 + 18 + 10 + 4 + 2 = 50$. Confirmed.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the percentage of students who do $3$ or more activities per week.",
        solution: "**Step 1 (1 mark):** Students with $\\ge 3$ activities: $10 + 4 + 2 = 16$.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{16}{50} \\times 100 = 32\\%$.",
      },
      {
        label: "d",
        marks: 2,
        content: "Calculate the cumulative frequency up to and including $2$ activities, and express this as a percentage of the total.",
        solution: "**Step 1 (1 mark):** Cumulative: $4 + 12 + 18 = 34$.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{34}{50} \\times 100 = 68\\%$.",
      },
    ],
  ),
  ea(
    "A Brisbane cafe records the daily number of customers ordering a flat white over $40$ days. The data is grouped in a frequency table.\n\n| Number of flat whites | Frequency |\n|---|---|\n| 0–19 | 4 |\n| 20–39 | 9 |\n| 40–59 | 15 |\n| 60–79 | 8 |\n| 80–99 | 4 |",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the total frequency to verify it equals $40$.",
        solution: "**Step 1 (1 mark):** $4 + 9 + 15 + 8 + 4 = 40$. Confirmed.",
      },
      {
        label: "b",
        marks: 1,
        content: "State the modal class.",
        solution: "**Step 1 (1 mark):** Modal class is $40$–$59$ (frequency $15$).",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the percentage of days where the cafe sold fewer than $40$ flat whites (i.e. $0$–$19$ or $20$–$39$).",
        solution: "**Step 1 (1 mark):** Days with $<40$: $4 + 9 = 13$.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{13}{40} \\times 100 = 32.5\\%$.",
      },
      {
        label: "d",
        marks: 2,
        content: "Calculate the percentage of days where the cafe sold $60$ or more flat whites.",
        solution: "**Step 1 (1 mark):** Days with $\\ge 60$: $8 + 4 = 12$.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{12}{40} \\times 100 = 30\\%$.",
      },
    ],
  ),
  ea(
    "A Sydney soccer club records the number of matches each player attended over the season. The frequency table summarises responses from $80$ players.\n\n| Matches attended | Frequency |\n|---|---|\n| 0–4 | 6 |\n| 5–9 | 14 |\n| 10–14 | 24 |\n| 15–19 | 22 |\n| 20–24 | 10 |\n| 25+ | 4 |",
    "HARD",
    [
      {
        label: "a",
        marks: 1,
        content: "State the modal class.",
        solution: "**Step 1 (1 mark):** Modal class is $10$–$14$ (frequency $24$).",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the cumulative frequency up to and including the $10$–$14$ class.",
        solution: "**Step 1 (1 mark):** Cumulative: $6 + 14 + 24$.\n\n**Step 2 (1 mark):** $= 44$ players.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the percentage of players who attended $15$ or more matches.",
        solution: "**Step 1 (1 mark):** Players with $\\ge 15$ matches: $22 + 10 + 4 = 36$.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{36}{80} \\times 100 = 45\\%$.",
      },
      {
        label: "d",
        marks: 2,
        content: "If the club gives a gold-medal award only to the players in the top class ($25+$), what percentage of players will receive an award? Give the answer correct to one decimal place.",
        solution: "**Step 1 (1 mark):** Players with $25+$ matches: $4$.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{4}{80} \\times 100 = 5.0\\%$.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`frequency-tables: wrote ${items.length} items to ${OUT}`);
