/**
 * Foundation generator: probability-of-everyday-events
 *
 * Tier: core-drill + extended-fit (no modelling-rich).
 * Targets: 14 MCQ + 11 SHORT_ANSWER + 3 EXTENDED_ANSWER = 28 items.
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/probability-of-everyday-events.json");

const TOPIC = "data-analysis-probability-and-statistics";
const SUB = "probability-of-everyday-events";

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
    "A fair six-sided die is rolled once. The probability of rolling a $3$ is:",
    ["$\\dfrac{1}{2}$", "$\\dfrac{1}{3}$", "$\\dfrac{1}{6}$", "$\\dfrac{3}{6}$"],
    "C",
    "EASY",
    "There is $1$ favourable outcome out of $6$ possible outcomes: $\\dfrac{1}{6}$.\n\n**Answer: C**",
  ),
  mcq(
    "A standard deck has $52$ cards (no jokers). The probability of drawing a heart is:",
    ["$\\dfrac{1}{4}$", "$\\dfrac{1}{13}$", "$\\dfrac{1}{2}$", "$\\dfrac{4}{52}$"],
    "A",
    "EASY",
    "There are $13$ hearts in $52$ cards: $\\dfrac{13}{52} = \\dfrac{1}{4}$.\n\n**Answer: A**",
  ),
  mcq(
    "A bag has $3$ red, $4$ blue, and $5$ green marbles. The probability of drawing a red marble is:",
    ["$\\dfrac{1}{12}$", "$\\dfrac{1}{4}$", "$\\dfrac{1}{3}$", "$\\dfrac{3}{12}$"],
    "B",
    "EASY",
    "Total marbles: $3 + 4 + 5 = 12$. Red: $\\dfrac{3}{12} = \\dfrac{1}{4}$.\n\n**Answer: B**",
  ),
  mcq(
    "A coin is tossed once. The probability of obtaining a head is:",
    ["$0$", "$\\dfrac{1}{4}$", "$\\dfrac{1}{2}$", "$1$"],
    "C",
    "EASY",
    "A fair coin has $2$ equally likely outcomes, so $P(\\text{Head}) = \\dfrac{1}{2}$.\n\n**Answer: C**",
  ),
  mcq(
    "If $P(A) = 0.3$, then $P(\\text{not } A)$ is:",
    ["$0.3$", "$0.5$", "$0.7$", "$1.3$"],
    "C",
    "EASY",
    "$P(\\text{not } A) = 1 - 0.3 = 0.7$.\n\n**Answer: C**",
  ),
  mcq(
    "A weather forecast states there is a $70\\%$ chance of rain tomorrow. The probability that it does NOT rain is:",
    ["$0.3$", "$0.5$", "$0.7$", "$1$"],
    "A",
    "EASY",
    "$P(\\text{no rain}) = 1 - 0.7 = 0.3$.\n\n**Answer: A**",
  ),
  mcq(
    "Which of the following events is impossible?",
    [
      "Tossing a coin and getting heads",
      "Rolling a $7$ on a standard six-sided die",
      "Drawing a red card from a standard deck",
      "Picking a vowel from the word 'CAT'",
    ],
    "B",
    "EASY",
    "A standard die only has faces $1$–$6$, so rolling a $7$ has probability $0$.\n\n**Answer: B**",
  ),
  mcq(
    "A spinner is divided into $8$ equal sectors numbered $1$ to $8$. The probability of spinning an even number is:",
    ["$\\dfrac{1}{8}$", "$\\dfrac{1}{4}$", "$\\dfrac{1}{2}$", "$\\dfrac{3}{4}$"],
    "C",
    "MEDIUM",
    "Even numbers between $1$ and $8$: $\\{2,4,6,8\\}$. Probability: $\\dfrac{4}{8} = \\dfrac{1}{2}$.\n\n**Answer: C**",
  ),
  mcq(
    "A bag contains $8$ red, $6$ blue, and $6$ white marbles. The probability of drawing either a blue or a white marble is:",
    ["$\\dfrac{3}{10}$", "$\\dfrac{2}{5}$", "$\\dfrac{1}{2}$", "$\\dfrac{3}{5}$"],
    "D",
    "MEDIUM",
    "Total marbles: $8 + 6 + 6 = 20$. Blue or white: $6 + 6 = 12$. Probability: $\\dfrac{12}{20} = \\dfrac{3}{5}$.\n\n**Answer: D**",
  ),
  mcq(
    "Out of $200$ buses surveyed, $150$ arrived on time. The relative frequency (estimated probability) that a bus arrives on time is:",
    ["$0.50$", "$0.65$", "$0.75$", "$0.80$"],
    "C",
    "MEDIUM",
    "$\\dfrac{150}{200} = 0.75$.\n\n**Answer: C**",
  ),
  mcq(
    "A box contains $5$ chocolate biscuits and $7$ plain biscuits. Two are drawn one at a time WITH replacement. The probability that the first is chocolate AND the second is plain is:",
    ["$\\dfrac{5}{12}$", "$\\dfrac{5}{24}$", "$\\dfrac{35}{144}$", "$\\dfrac{7}{12}$"],
    "C",
    "MEDIUM",
    "$P(\\text{chocolate}) = \\dfrac{5}{12}$. $P(\\text{plain}) = \\dfrac{7}{12}$. With replacement: $\\dfrac{5}{12} \\times \\dfrac{7}{12} = \\dfrac{35}{144}$.\n\n**Answer: C**",
  ),
  mcq(
    "The probability of a randomly selected light bulb being faulty is $0.04$. In a batch of $500$ light bulbs, the expected number of faulty bulbs is:",
    ["$2$", "$10$", "$20$", "$40$"],
    "C",
    "MEDIUM",
    "Expected: $0.04 \\times 500 = 20$.\n\n**Answer: C**",
  ),
  mcq(
    "Two fair coins are tossed at the same time. The probability of getting exactly one head is:",
    ["$\\dfrac{1}{4}$", "$\\dfrac{1}{3}$", "$\\dfrac{1}{2}$", "$\\dfrac{3}{4}$"],
    "C",
    "HARD",
    "Outcomes: HH, HT, TH, TT. Exactly one head: HT and TH, so probability $= \\dfrac{2}{4} = \\dfrac{1}{2}$.\n\n**Answer: C**",
  ),
  mcq(
    "A spinner has the sectors red, blue, green and yellow. $P(\\text{red}) = 0.3$, $P(\\text{blue}) = 0.25$, $P(\\text{green}) = 0.2$. The probability of spinning yellow is:",
    ["$0.1$", "$0.2$", "$0.25$", "$0.75$"],
    "C",
    "HARD",
    "Probabilities sum to $1$. Yellow: $1 - 0.3 - 0.25 - 0.2 = 0.25$.\n\n**Answer: C**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "A bag contains $7$ red, $3$ green and $2$ yellow lollies. One lolly is drawn at random. Write down the probability that the lolly is yellow as a fraction.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Total: $7 + 3 + 2 = 12$. Probability of yellow: $\\dfrac{2}{12} = \\dfrac{1}{6}$.",
  ),
  sa(
    "The probability that a train arrives late is $0.15$. What is the probability that it does NOT arrive late?",
    1,
    "EASY",
    "**Step 1 (1 mark):** $P(\\text{not late}) = 1 - 0.15 = 0.85$.",
  ),
  sa(
    "A standard six-sided die is rolled. Write the probability of rolling a number less than $4$ as a fraction in simplest form.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Favourable outcomes: $\\{1,2,3\\}$, so probability $= \\dfrac{3}{6} = \\dfrac{1}{2}$.",
  ),
  sa(
    "In a class of $30$ students, $18$ play sport. A student is chosen at random. Write the probability that the chosen student plays sport as a fraction in simplest form.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $\\dfrac{18}{30} = \\dfrac{3}{5}$.",
  ),
  sa(
    "A standard six-sided die is rolled.\n\n**a.** Write down the probability of rolling an even number.\n\n**b.** Write down the probability of rolling a $5$ or a $6$.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Even outcomes: $\\{2,4,6\\}$, so $P(\\text{even}) = \\dfrac{3}{6} = \\dfrac{1}{2}$.\n\n**Step 2 (1 mark):** $P(5 \\text{ or } 6) = \\dfrac{2}{6} = \\dfrac{1}{3}$.",
  ),
  sa(
    "A school survey found that $24$ out of $80$ students walk to school.\n\nCalculate the relative frequency (estimated probability) that a randomly chosen student walks. Give your answer as a decimal.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Relative frequency: $\\dfrac{24}{80}$.\n\n**Step 2 (1 mark):** $= 0.3$.",
  ),
  sa(
    "Out of $400$ flights at Melbourne Airport, $80$ are delayed. Estimate the probability that the next flight will be delayed, giving your answer as a fraction in simplest form.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Probability: $\\dfrac{80}{400}$.\n\n**Step 2 (1 mark):** $= \\dfrac{1}{5}$.",
  ),
  sa(
    "A jar contains $5$ chocolate, $3$ caramel and $2$ mint sweets. A sweet is selected at random.\n\nWrite the probability that the selected sweet is NOT chocolate as a fraction in simplest form.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Total: $5 + 3 + 2 = 10$. Non-chocolate: $3 + 2 = 5$.\n\n**Step 2 (1 mark):** Probability: $\\dfrac{5}{10} = \\dfrac{1}{2}$.",
  ),
  sa(
    "A spinner has $5$ equal sectors labelled $1, 2, 3, 4, 5$. The spinner is spun once.\n\nWrite down the probability that the spinner lands on an odd number, expressed as a fraction in simplest form.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Odd outcomes: $\\{1,3,5\\}$, so $3$ favourable out of $5$.\n\n**Step 2 (1 mark):** $P(\\text{odd}) = \\dfrac{3}{5}$.",
  ),
  sa(
    "Two fair coins are tossed at the same time.\n\n**a.** List all four possible outcomes.\n\n**b.** Find the probability of getting two heads.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Sample space: $\\{HH, HT, TH, TT\\}$.\n\n**Step 2 (1 mark):** Favourable outcome: $HH$ (one outcome).\n\n**Step 3 (1 mark):** $P(HH) = \\dfrac{1}{4}$.",
  ),
  sa(
    "A box contains $4$ apples and $6$ oranges. Mia picks one fruit at random, eats it, and then picks a second.\n\nFind the probability that both are apples. Give your answer as a fraction in simplest form.",
    3,
    "HARD",
    "**Step 1 (1 mark):** $P(\\text{first apple}) = \\dfrac{4}{10} = \\dfrac{2}{5}$.\n\n**Step 2 (1 mark):** After eating: $3$ apples in $9$ fruits. $P(\\text{second apple}) = \\dfrac{3}{9} = \\dfrac{1}{3}$.\n\n**Step 3 (1 mark):** $P(\\text{both apples}) = \\dfrac{2}{5} \\times \\dfrac{1}{3} = \\dfrac{2}{15}$.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "A bag contains $12$ marbles: $5$ red, $4$ blue, and $3$ green. A marble is drawn at random.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Find the probability of drawing a red marble. Give your answer as a fraction in simplest form.",
        solution: "**Step 1 (1 mark):** $P(\\text{red}) = \\dfrac{5}{12}$.",
      },
      {
        label: "b",
        marks: 1,
        content: "Find the probability of drawing a blue or green marble.",
        solution: "**Step 1 (1 mark):** $P(\\text{blue or green}) = \\dfrac{4 + 3}{12} = \\dfrac{7}{12}$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Find the probability of NOT drawing a green marble.",
        solution: "**Step 1 (1 mark):** $P(\\text{green}) = \\dfrac{3}{12} = \\dfrac{1}{4}$.\n\n**Step 2 (1 mark):** $P(\\text{not green}) = 1 - \\dfrac{1}{4} = \\dfrac{3}{4}$.",
      },
      {
        label: "d",
        marks: 2,
        content: "If $5$ more red marbles are added to the bag, find the new probability of drawing a red marble. Give your answer as a fraction in simplest form.",
        solution: "**Step 1 (1 mark):** New reds: $5 + 5 = 10$. New total: $12 + 5 = 17$.\n\n**Step 2 (1 mark):** $P(\\text{red}) = \\dfrac{10}{17}$.",
      },
    ],
  ),
  ea(
    "A weather station in Melbourne records that it rains on $60$ out of $200$ days. A day is selected at random from these records.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 2,
        content: "Estimate the probability that it rained on the selected day. Give your answer as a decimal.",
        solution: "**Step 1 (1 mark):** Relative frequency: $\\dfrac{60}{200}$.\n\n**Step 2 (1 mark):** $= 0.3$.",
      },
      {
        label: "b",
        marks: 1,
        content: "Estimate the probability that it did NOT rain on the selected day.",
        solution: "**Step 1 (1 mark):** $P(\\text{no rain}) = 1 - 0.3 = 0.7$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Based on this data, predict how many of the next $50$ days will be rainy.",
        solution: "**Step 1 (1 mark):** Expected rainy days: $0.3 \\times 50$.\n\n**Step 2 (1 mark):** $= 15$ days.",
      },
    ],
  ),
  ea(
    "A spinner is divided into $10$ equal sectors. Three sectors are red, two sectors are blue, and the remaining sectors are yellow.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "How many sectors are yellow?",
        solution: "**Step 1 (1 mark):** Yellow sectors: $10 - 3 - 2 = 5$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Find the probability of spinning yellow, expressed as a fraction in simplest form.",
        solution: "**Step 1 (1 mark):** Yellow over total: $\\dfrac{5}{10}$.\n\n**Step 2 (1 mark):** $= \\dfrac{1}{2}$.",
      },
      {
        label: "c",
        marks: 1,
        content: "Find the probability of spinning red or blue. Give your answer as a fraction in simplest form.",
        solution: "**Step 1 (1 mark):** $P(\\text{red or blue}) = \\dfrac{3 + 2}{10} = \\dfrac{1}{2}$.",
      },
      {
        label: "d",
        marks: 2,
        content: "If the spinner is spun $80$ times, estimate the number of times you would expect it to land on red.",
        solution: "**Step 1 (1 mark):** $P(\\text{red}) = \\dfrac{3}{10}$.\n\n**Step 2 (1 mark):** Expected: $\\dfrac{3}{10} \\times 80 = 24$ times.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`probability-of-everyday-events: wrote ${items.length} items to ${OUT}`);
