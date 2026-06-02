/**
 * Foundation generator: scientific-notation
 * Tier: core-drill ONLY -> 14 MCQ + 11 SA = 25
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/scientific-notation.json");

const TOPIC = "algebra-number-and-structure";
const SUB = "scientific-notation";

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

const items: Item[] = [
  // ── MCQ (14) ────────────────────────────────────────────────────────
  mcq(
    "The number $4\\,500$ written in scientific notation is:",
    ["$4.5 \\times 10^{2}$", "$4.5 \\times 10^{3}$", "$45 \\times 10^{2}$", "$0.45 \\times 10^{4}$"],
    "B",
    "EASY",
    "Move the decimal point three places left: $4\\,500 = 4.5 \\times 10^{3}$.\n\n**Answer: B**",
  ),
  mcq(
    "The number $0.0036$ written in scientific notation is:",
    ["$3.6 \\times 10^{-2}$", "$3.6 \\times 10^{-3}$", "$3.6 \\times 10^{3}$", "$36 \\times 10^{-4}$"],
    "B",
    "EASY",
    "Move the decimal point three places right: $0.0036 = 3.6 \\times 10^{-3}$.\n\n**Answer: B**",
  ),
  mcq(
    "$2.4 \\times 10^{5}$ written as an ordinary number is:",
    ["$24\\,000$", "$240\\,000$", "$2\\,400\\,000$", "$24\\,000\\,000$"],
    "B",
    "EASY",
    "$2.4 \\times 10^{5} = 2.4 \\times 100\\,000 = 240\\,000$.\n\n**Answer: B**",
  ),
  mcq(
    "$7.2 \\times 10^{-4}$ written as an ordinary decimal is:",
    ["$0.00072$", "$0.0072$", "$0.072$", "$0.72$"],
    "A",
    "EASY",
    "$7.2 \\times 10^{-4} = 0.00072$ (move the decimal four places left).\n\n**Answer: A**",
  ),
  mcq(
    "The mass of an apple is approximately $0.15$ kg. Expressed in scientific notation this is:",
    ["$1.5 \\times 10^{-1}$ kg", "$1.5 \\times 10^{1}$ kg", "$15 \\times 10^{-1}$ kg", "$1.5 \\times 10^{-2}$ kg"],
    "A",
    "EASY",
    "$0.15 = 1.5 \\times 10^{-1}$.\n\n**Answer: A**",
  ),
  mcq(
    "The population of a city is approximately $3\\,200\\,000$. In scientific notation this is:",
    ["$3.2 \\times 10^{5}$", "$3.2 \\times 10^{6}$", "$3.2 \\times 10^{7}$", "$32 \\times 10^{5}$"],
    "B",
    "EASY",
    "Six zeros (after the leading $3.2$): $3\\,200\\,000 = 3.2 \\times 10^{6}$.\n\n**Answer: B**",
  ),
  mcq(
    "The number $8.05 \\times 10^{4}$ as an ordinary number is:",
    ["$8\\,050$", "$80\\,050$", "$80\\,500$", "$805\\,000$"],
    "C",
    "EASY",
    "$8.05 \\times 10\\,000 = 80\\,500$.\n\n**Answer: C**",
  ),
  mcq(
    "Which of the following is the correct scientific notation form?",
    ["$45 \\times 10^{3}$", "$4.5 \\times 10^{4}$", "$0.45 \\times 10^{5}$", "$4.5 \\times 10^{3.5}$"],
    "B",
    "MEDIUM",
    "Scientific notation requires the coefficient $a$ to satisfy $1 \\le a < 10$ and the exponent to be an integer. Only $4.5 \\times 10^{4}$ fits.\n\n**Answer: B**",
  ),
  mcq(
    "$(3 \\times 10^{4}) \\times (2 \\times 10^{3})$ in scientific notation equals:",
    ["$5 \\times 10^{7}$", "$6 \\times 10^{7}$", "$6 \\times 10^{12}$", "$5 \\times 10^{12}$"],
    "B",
    "MEDIUM",
    "Multiply coefficients: $3 \\times 2 = 6$. Add exponents: $4 + 3 = 7$. Result: $6 \\times 10^{7}$.\n\n**Answer: B**",
  ),
  mcq(
    "$\\dfrac{8 \\times 10^{6}}{2 \\times 10^{2}}$ in scientific notation equals:",
    ["$4 \\times 10^{3}$", "$4 \\times 10^{4}$", "$6 \\times 10^{3}$", "$6 \\times 10^{4}$"],
    "B",
    "MEDIUM",
    "Divide coefficients: $\\dfrac{8}{2} = 4$. Subtract exponents: $6 - 2 = 4$. Result: $4 \\times 10^{4}$.\n\n**Answer: B**",
  ),
  mcq(
    "Light travels at $3 \\times 10^{8}$ m/s. The distance light travels in $4$ seconds, in metres, is:",
    ["$1.2 \\times 10^{8}$", "$1.2 \\times 10^{9}$", "$1.2 \\times 10^{10}$", "$1.2 \\times 10^{12}$"],
    "B",
    "MEDIUM",
    "Distance: $4 \\times 3 \\times 10^{8} = 12 \\times 10^{8} = 1.2 \\times 10^{9}$ m.\n\n**Answer: B**",
  ),
  mcq(
    "A virus has a diameter of $1.2 \\times 10^{-7}$ m. Expressed as an ordinary decimal, this is:",
    ["$0.0000012$ m", "$0.00000012$ m", "$0.0000000012$ m", "$1.2 \\times 0.0000001$ m"],
    "B",
    "MEDIUM",
    "$1.2 \\times 10^{-7} = 0.00000012$ m (move the decimal seven places left).\n\n**Answer: B**",
  ),
  mcq(
    "$(4.5 \\times 10^{-3}) + (2 \\times 10^{-2})$ in scientific notation is:",
    ["$6.5 \\times 10^{-3}$", "$2.45 \\times 10^{-2}$", "$2.45 \\times 10^{-3}$", "$6.5 \\times 10^{-2}$"],
    "B",
    "HARD",
    "Convert to same exponent: $4.5 \\times 10^{-3} = 0.45 \\times 10^{-2}$. Sum: $0.45 \\times 10^{-2} + 2 \\times 10^{-2} = 2.45 \\times 10^{-2}$.\n\n**Answer: B**",
  ),
  mcq(
    "The Earth has a mass of approximately $5.97 \\times 10^{24}$ kg and the Moon $7.35 \\times 10^{22}$ kg. The Earth's mass is approximately how many times the Moon's mass?",
    ["$8$", "$81$", "$810$", "$8\\,100$"],
    "B",
    "HARD",
    "Ratio: $\\dfrac{5.97 \\times 10^{24}}{7.35 \\times 10^{22}} = \\dfrac{5.97}{7.35} \\times 10^{2} \\approx 0.812 \\times 100 \\approx 81$.\n\n**Answer: B**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "Write $86\\,000$ in scientific notation.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Move the decimal four places left: $86\\,000 = 8.6 \\times 10^{4}$.",
  ),
  sa(
    "Write $0.00045$ in scientific notation.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Move the decimal four places right: $0.00045 = 4.5 \\times 10^{-4}$.",
  ),
  sa(
    "Write $5.6 \\times 10^{3}$ as an ordinary number.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $5.6 \\times 1\\,000 = 5\\,600$.",
  ),
  sa(
    "Write $9.1 \\times 10^{-2}$ as an ordinary decimal.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Move the decimal two places left: $9.1 \\times 10^{-2} = 0.091$.",
  ),
  sa(
    "The diameter of a human hair is approximately $0.00008$ m. Write this in scientific notation.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Move the decimal five places right: $0.00008 = 8 \\times 10^{-5}$ m.",
  ),
  sa(
    "Evaluate $(2 \\times 10^{5}) \\times (4 \\times 10^{3})$, giving your answer in scientific notation.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Multiply coefficients: $2 \\times 4 = 8$. Add exponents: $5 + 3 = 8$.\n\n**Step 2 (1 mark):** Result: $8 \\times 10^{8}$.",
  ),
  sa(
    "Evaluate $\\dfrac{9 \\times 10^{8}}{3 \\times 10^{5}}$, giving your answer in scientific notation.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Divide coefficients: $\\dfrac{9}{3} = 3$. Subtract exponents: $8 - 5 = 3$.\n\n**Step 2 (1 mark):** Result: $3 \\times 10^{3}$.",
  ),
  sa(
    "A bacterium has a mass of $2.5 \\times 10^{-12}$ g. Express this mass as an ordinary decimal number.",
    1,
    "MEDIUM",
    "**Step 1 (1 mark):** Move the decimal twelve places left: $2.5 \\times 10^{-12} = 0.0000000000025$ g.",
  ),
  sa(
    "Express $25 \\times 10^{4}$ in correct scientific notation.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Rewrite the coefficient with $1 \\le a < 10$: $25 = 2.5 \\times 10^{1}$.\n\n**Step 2 (1 mark):** Combine exponents: $2.5 \\times 10^{1} \\times 10^{4} = 2.5 \\times 10^{5}$.",
  ),
  sa(
    "Evaluate $(6 \\times 10^{-3}) \\times (5 \\times 10^{7})$, giving your answer in scientific notation.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Multiply coefficients: $6 \\times 5 = 30$.\n\n**Step 2 (1 mark):** Add exponents: $-3 + 7 = 4$, giving $30 \\times 10^{4}$.\n\n**Step 3 (1 mark):** Rewrite in correct scientific notation: $30 \\times 10^{4} = 3 \\times 10^{5}$.",
  ),
  sa(
    "The mass of an atom is $4 \\times 10^{-26}$ kg. Calculate the total mass, in kg, of $5 \\times 10^{20}$ such atoms. Give your answer in scientific notation.",
    3,
    "HARD",
    "**Step 1 (1 mark):** Multiply coefficients: $4 \\times 5 = 20$.\n\n**Step 2 (1 mark):** Add exponents: $-26 + 20 = -6$, giving $20 \\times 10^{-6}$.\n\n**Step 3 (1 mark):** Rewrite: $20 \\times 10^{-6} = 2 \\times 10^{-5}$ kg.",
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`scientific-notation: wrote ${items.length} items to ${OUT}`);
