/**
 * Foundation generator: two-way-tables
 *
 * Tier: core-drill + extended-fit (no modelling-rich).
 * Targets: 14 MCQ + 11 SHORT_ANSWER + 3 EXTENDED_ANSWER = 28 items.
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/two-way-tables.json");

const TOPIC = "data-analysis-probability-and-statistics";
const SUB = "two-way-tables";

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
    "The two-way table shows the type of pet owned by students.\n\n| | Boys | Girls | Total |\n|---|---|---|---|\n| Dog | $8$ | $7$ | $15$ |\n| Cat | $5$ | $9$ | $14$ |\n| Total | $13$ | $16$ | $29$ |\n\nThe number of boys who own a cat is:",
    ["$5$", "$8$", "$13$", "$14$"],
    "A",
    "EASY",
    "From the Boys column and Cat row: $5$.\n\n**Answer: A**",
  ),
  mcq(
    "A two-way table summarises favourite drinks.\n\n| | Tea | Coffee | Total |\n|---|---|---|---|\n| Adults | $12$ | $30$ | $42$ |\n| Students | $18$ | $10$ | $28$ |\n| Total | $30$ | $40$ | $70$ |\n\nThe total number of people surveyed is:",
    ["$30$", "$40$", "$42$", "$70$"],
    "D",
    "EASY",
    "The grand total in the bottom-right cell is $70$.\n\n**Answer: D**",
  ),
  mcq(
    "Refer to the two-way table:\n\n| | Walk | Bus | Total |\n|---|---|---|---|\n| Year 9 | $14$ | $26$ | $40$ |\n| Year 10 | $20$ | $20$ | $40$ |\n| Total | $34$ | $46$ | $80$ |\n\nThe total number of students who travel by bus is:",
    ["$20$", "$26$", "$34$", "$46$"],
    "D",
    "EASY",
    "From the Bus column total: $46$.\n\n**Answer: D**",
  ),
  mcq(
    "A two-way table has rows 'Yes', 'No' and columns 'Male', 'Female'. The row total for 'Yes' is $42$ and the column total for 'Male' is $35$. If $25$ males said 'Yes', then the number of females who said 'Yes' is:",
    ["$10$", "$17$", "$25$", "$67$"],
    "B",
    "EASY",
    "Females who said Yes $=$ row total Yes $-$ males who said Yes $= 42 - 25 = 17$.\n\n**Answer: B**",
  ),
  mcq(
    "In a two-way table, the corner cell (bottom right) shows:",
    [
      "The total of a single row",
      "The total of a single column",
      "The grand total of all data",
      "The largest single value",
    ],
    "C",
    "EASY",
    "The bottom-right corner cell of a two-way table is always the grand total of all data.\n\n**Answer: C**",
  ),
  mcq(
    "The two-way table shows students who walk or take the bus, by gender. If $30$ girls take the bus and $20$ boys take the bus, the column total for 'Bus' is:",
    ["$10$", "$30$", "$40$", "$50$"],
    "D",
    "EASY",
    "Bus total: $30 + 20 = 50$.\n\n**Answer: D**",
  ),
  mcq(
    "In a survey of $200$ people, $120$ are female. If $48$ females support a proposal, the number of MALES in the survey is:",
    ["$48$", "$72$", "$80$", "$152$"],
    "C",
    "EASY",
    "Males $= 200 - 120 = 80$.\n\n**Answer: C**",
  ),
  mcq(
    "From the two-way table:\n\n| | Music | Drama | Total |\n|---|---|---|---|\n| Junior | $15$ | $10$ | $25$ |\n| Senior | $5$ | $20$ | $25$ |\n| Total | $20$ | $30$ | $50$ |\n\nThe fraction of students who are Senior AND chose Drama is:",
    ["$\\dfrac{1}{5}$", "$\\dfrac{2}{5}$", "$\\dfrac{1}{2}$", "$\\dfrac{20}{30}$"],
    "B",
    "MEDIUM",
    "Senior and Drama: $20$ students out of $50$ total. Fraction: $\\dfrac{20}{50} = \\dfrac{2}{5}$.\n\n**Answer: B**",
  ),
  mcq(
    "Using this table:\n\n| | Yes | No | Total |\n|---|---|---|---|\n| Adults | $25$ | $15$ | $40$ |\n| Children | $30$ | $30$ | $60$ |\n| Total | $55$ | $45$ | $100$ |\n\nThe percentage of children who said 'Yes' is:",
    ["$30\\%$", "$50\\%$", "$55\\%$", "$60\\%$"],
    "B",
    "MEDIUM",
    "Children who said Yes: $30$ out of $60$. Percentage: $\\dfrac{30}{60} \\times 100 = 50\\%$.\n\n**Answer: B**",
  ),
  mcq(
    "From a survey of $80$ people, $35$ are men and $20$ men drive to work. The number of women who DON'T drive to work, if $30$ women drive, is:",
    ["$10$", "$15$", "$20$", "$25$"],
    "B",
    "MEDIUM",
    "Women total: $80 - 35 = 45$. Women who don't drive: $45 - 30 = 15$.\n\n**Answer: B**",
  ),
  mcq(
    "Using the two-way table:\n\n| | Hot | Cold | Total |\n|---|---|---|---|\n| Lunch | $20$ | $30$ | $50$ |\n| Dinner | $40$ | $10$ | $50$ |\n| Total | $60$ | $40$ | $100$ |\n\nA person is chosen at random. The probability they had a hot dinner is:",
    ["$0.1$", "$0.2$", "$0.4$", "$0.5$"],
    "C",
    "MEDIUM",
    "Hot dinner: $40$ out of $100$ total. Probability: $\\dfrac{40}{100} = 0.4$.\n\n**Answer: C**",
  ),
  mcq(
    "A two-way table shows:\n\n| | Glasses | No glasses | Total |\n|---|---|---|---|\n| Boys | $12$ | | $30$ |\n| Girls | $14$ | $26$ | $40$ |\n| Total | | $44$ | $70$ |\n\nThe number of boys WITHOUT glasses is:",
    ["$12$", "$14$", "$18$", "$26$"],
    "C",
    "MEDIUM",
    "Boys without glasses $= 30 - 12 = 18$.\n\n**Answer: C**",
  ),
  mcq(
    "A class is surveyed on whether they play sport ($S$) or play a musical instrument ($M$). $20$ play sport, $15$ play music, and $8$ play BOTH. If there are $30$ students in total, the number who play NEITHER is:",
    ["$3$", "$8$", "$10$", "$13$"],
    "A",
    "HARD",
    "Play sport or music or both: $20 + 15 - 8 = 27$. Play neither: $30 - 27 = 3$.\n\n**Answer: A**",
  ),
  mcq(
    "In a two-way table, $60\\%$ of $200$ surveyed people are female, and $\\dfrac{1}{4}$ of females prefer green tea. The number of females who prefer green tea is:",
    ["$15$", "$25$", "$30$", "$45$"],
    "C",
    "HARD",
    "Females: $0.6 \\times 200 = 120$. Prefer green tea: $\\dfrac{1}{4} \\times 120 = 30$.\n\n**Answer: C**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "Refer to the two-way table:\n\n| | Yes | No | Total |\n|---|---|---|---|\n| Year 11 | $18$ | $12$ | $30$ |\n| Year 12 | $20$ | $10$ | $30$ |\n| Total | $38$ | $22$ | $60$ |\n\nHow many Year 12 students answered 'Yes'?",
    1,
    "EASY",
    "**Step 1 (1 mark):** From the Year 12 row, Yes column: $20$ students.",
  ),
  sa(
    "A two-way table shows transport modes. The Bus column total is $34$ and the Walk column total is $26$. Calculate the grand total of students.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Total $= 34 + 26 = 60$ students.",
  ),
  sa(
    "From this two-way table:\n\n| | Cake | Biscuit | Total |\n|---|---|---|---|\n| Children | $12$ | $8$ | $20$ |\n| Adults | $10$ | $15$ | $25$ |\n| Total | $22$ | $23$ | $45$ |\n\nState the number of adults who chose biscuit.",
    1,
    "EASY",
    "**Step 1 (1 mark):** From the Adults row, Biscuit column: $15$.",
  ),
  sa(
    "A two-way table has $40$ males and $35$ females. Calculate the grand total of people surveyed.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $40 + 35 = 75$ people.",
  ),
  sa(
    "A class of $25$ students is surveyed.\n\n| | Maths | English | Total |\n|---|---|---|---|\n| Boys | $7$ | $5$ | $12$ |\n| Girls | $8$ | $5$ | $13$ |\n| Total | $15$ | $10$ | $25$ |\n\n**a.** State the number of girls who chose Maths.\n\n**b.** State the total number of students who chose English.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Girls who chose Maths: $8$.\n\n**Step 2 (1 mark):** Total who chose English: $10$.",
  ),
  sa(
    "Complete the missing row total and column total in the two-way table below.\n\n| | Likes | Dislikes | Total |\n|---|---|---|---|\n| Year 9 | $20$ | $10$ | ? |\n| Year 10 | $14$ | $16$ | $30$ |\n| Total | ? | $26$ | |",
    2,
    "EASY",
    "**Step 1 (1 mark):** Year 9 row total: $20 + 10 = 30$.\n\n**Step 2 (1 mark):** Likes column total: $20 + 14 = 34$.",
  ),
  sa(
    "Refer to the two-way table:\n\n| | Walk | Drive | Total |\n|---|---|---|---|\n| Adults | $18$ | $42$ | $60$ |\n| Teens | $32$ | $8$ | $40$ |\n| Total | $50$ | $50$ | $100$ |\n\nCalculate the percentage of teens who walk.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Teens who walk: $32$ out of $40$ teens.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{32}{40} \\times 100 = 80\\%$.",
  ),
  sa(
    "A survey of $120$ people produced the following two-way table:\n\n| | Coffee | Tea | Total |\n|---|---|---|---|\n| Morning | $45$ | $15$ | $60$ |\n| Evening | $20$ | $40$ | $60$ |\n| Total | $65$ | $55$ | $120$ |\n\nA person is selected at random. Write the probability that they prefer tea in the evening, as a fraction in simplest form.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Tea in the evening: $40$ out of $120$ total.\n\n**Step 2 (1 mark):** $\\dfrac{40}{120} = \\dfrac{1}{3}$.",
  ),
  sa(
    "A two-way table for a class of $50$ students is partly given:\n\n| | Sport | No Sport | Total |\n|---|---|---|---|\n| Year 11 | $18$ | $7$ | $25$ |\n| Year 12 | $14$ | ? | ? |\n| Total | ? | ? | $50$ |\n\nFill in the missing values for Year 12 'No Sport', Year 12 row total, and column totals.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Year 12 row total: $50 - 25 = 25$. Year 12 No Sport: $25 - 14 = 11$.\n\n**Step 2 (1 mark):** Sport column total: $18 + 14 = 32$.\n\n**Step 3 (1 mark):** No Sport column total: $7 + 11 = 18$.",
  ),
  sa(
    "A two-way table shows the favourite holiday destination of $200$ employees:\n\n| | Beach | Mountains | Total |\n|---|---|---|---|\n| Females | $54$ | $36$ | $90$ |\n| Males | $66$ | $44$ | $110$ |\n| Total | $120$ | $80$ | $200$ |\n\nCalculate the percentage of all employees who chose the beach.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Total chose beach: $120$ out of $200$.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{120}{200} \\times 100 = 60\\%$.",
  ),
  sa(
    "A two-way table summarises students at a school:\n\n| | Wears glasses | No glasses | Total |\n|---|---|---|---|\n| Year 11 | $24$ | $76$ | $100$ |\n| Year 12 | $36$ | $64$ | $100$ |\n| Total | $60$ | $140$ | $200$ |\n\nOne student is chosen at random. Find:\n\n**a.** the probability that the student wears glasses, and\n\n**b.** the probability that a randomly chosen Year 11 student wears glasses.",
    3,
    "HARD",
    "**Step 1 (1 mark):** $P(\\text{glasses}) = \\dfrac{60}{200} = \\dfrac{3}{10}$.\n\n**Step 2 (1 mark):** For Year 11, glasses: $24$ out of $100$ Year 11 students.\n\n**Step 3 (1 mark):** $P(\\text{glasses} \\mid \\text{Year 11}) = \\dfrac{24}{100} = \\dfrac{6}{25}$.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "A Year 11 class is surveyed about the breakfast they eat: cereal or toast. The two-way table below shows results.\n\n| | Cereal | Toast | Total |\n|---|---|---|---|\n| Boys | $9$ | $6$ | $15$ |\n| Girls | $7$ | $8$ | $15$ |\n| Total | $16$ | $14$ | $30$ |",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "State the number of girls who eat toast.",
        solution: "**Step 1 (1 mark):** From the Girls row, Toast column: $8$.",
      },
      {
        label: "b",
        marks: 1,
        content: "State the total number of students who eat cereal.",
        solution: "**Step 1 (1 mark):** Total Cereal column: $16$ students.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the percentage of boys who eat cereal.",
        solution: "**Step 1 (1 mark):** Boys who eat cereal: $9$ out of $15$ boys.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{9}{15} \\times 100 = 60\\%$.",
      },
      {
        label: "d",
        marks: 2,
        content: "A student is selected at random. Find the probability that the student is a girl who eats toast, expressed as a fraction in simplest form.",
        solution: "**Step 1 (1 mark):** Girls who eat toast: $8$ out of $30$ total.\n\n**Step 2 (1 mark):** $\\dfrac{8}{30} = \\dfrac{4}{15}$.",
      },
    ],
  ),
  ea(
    "A Sydney shopping centre records the customer behaviour of $150$ shoppers on a Saturday. Some entered a clothing store and some entered a food store; some made a purchase, some did not.\n\n| | Purchased | Did not purchase | Total |\n|---|---|---|---|\n| Clothing | $36$ | $24$ | $60$ |\n| Food | $63$ | $27$ | $90$ |\n| Total | $99$ | $51$ | $150$ |",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "State the total number of shoppers who entered the food store.",
        solution: "**Step 1 (1 mark):** Food row total: $90$ shoppers.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the percentage of shoppers who made a purchase overall.",
        solution: "**Step 1 (1 mark):** $99$ purchased out of $150$.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{99}{150} \\times 100 = 66\\%$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the percentage of food-store visitors who made a purchase.",
        solution: "**Step 1 (1 mark):** Food + Purchased: $63$ out of $90$ food-store visitors.\n\n**Step 2 (1 mark):** $\\dfrac{63}{90} \\times 100 = 70\\%$.",
      },
      {
        label: "d",
        marks: 1,
        content: "A shopper is chosen at random. Find the probability that the shopper visited the clothing store and did not purchase.",
        solution: "**Step 1 (1 mark):** $\\dfrac{24}{150} = \\dfrac{4}{25}$.",
      },
    ],
  ),
  ea(
    "$120$ Year 12 students were surveyed about whether they had a part-time job and whether they had a driver's licence. Some cells in the two-way table are missing.\n\n| | Has job | No job | Total |\n|---|---|---|---|\n| Has licence | $42$ | $18$ | ? |\n| No licence | $24$ | ? | ? |\n| Total | ? | ? | $120$ |",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the row total for 'Has licence' and the column total for 'Has job'.",
        solution: "**Step 1 (1 mark):** Has licence row total: $42 + 18 = 60$.\n\n**Step 2 (1 mark):** Has job column total $= 120 - \\text{No job total}$. First, No licence row: $120 - 60 = 60$. No job column: needs both rows. Has job column: $42 + 24 = 66$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Find the missing value for the 'No licence and No job' cell.",
        solution: "**Step 1 (1 mark):** No licence row total: $120 - 60 = 60$.\n\n**Step 2 (1 mark):** No licence, No job: $60 - 24 = 36$.",
      },
      {
        label: "c",
        marks: 2,
        content: "A student is selected at random. Find the probability that the student has both a part-time job and a licence, as a fraction in simplest form.",
        solution: "**Step 1 (1 mark):** Has job AND licence: $42$ out of $120$.\n\n**Step 2 (1 mark):** $\\dfrac{42}{120} = \\dfrac{7}{20}$.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`two-way-tables: wrote ${items.length} items to ${OUT}`);
