/**
 * Foundation generator: units-of-measurement
 * Tier: core-drill ONLY (14 MCQ + 11 SHORT = 25)
 * Topic: space-and-measurement
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/units-of-measurement.json");

const TOPIC = "space-and-measurement";
const SUB = "units-of-measurement";

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
  // ── MCQ (14) ─────────────────────────────────────────────────────────
  mcq(
    "$3.5$ metres expressed in centimetres is:",
    ["$35$ cm", "$350$ cm", "$3\\,500$ cm", "$35\\,000$ cm"],
    "B",
    "EASY",
    "$1$ m $= 100$ cm, so $3.5 \\times 100 = 350$ cm.\n\n**Answer: B**",
  ),
  mcq(
    "$4\\,500$ grams expressed in kilograms is:",
    ["$0.45$ kg", "$4.5$ kg", "$45$ kg", "$450$ kg"],
    "B",
    "EASY",
    "$1$ kg $= 1\\,000$ g, so $4\\,500 \\div 1\\,000 = 4.5$ kg.\n\n**Answer: B**",
  ),
  mcq(
    "$2.4$ kilometres expressed in metres is:",
    ["$24$ m", "$240$ m", "$2\\,400$ m", "$24\\,000$ m"],
    "C",
    "EASY",
    "$1$ km $= 1\\,000$ m, so $2.4 \\times 1\\,000 = 2\\,400$ m.\n\n**Answer: C**",
  ),
  mcq(
    "$750$ millilitres expressed in litres is:",
    ["$0.075$ L", "$0.75$ L", "$7.5$ L", "$75$ L"],
    "B",
    "EASY",
    "$1$ L $= 1\\,000$ mL, so $750 \\div 1\\,000 = 0.75$ L.\n\n**Answer: B**",
  ),
  mcq(
    "$60$ millimetres expressed in centimetres is:",
    ["$0.6$ cm", "$6$ cm", "$60$ cm", "$600$ cm"],
    "B",
    "EASY",
    "$1$ cm $= 10$ mm, so $60 \\div 10 = 6$ cm.\n\n**Answer: B**",
  ),
  mcq(
    "$0.3$ tonnes expressed in kilograms is:",
    ["$3$ kg", "$30$ kg", "$300$ kg", "$3\\,000$ kg"],
    "C",
    "MEDIUM",
    "$1$ t $= 1\\,000$ kg, so $0.3 \\times 1\\,000 = 300$ kg.\n\n**Answer: C**",
  ),
  mcq(
    "$3$ square metres expressed in square centimetres is:",
    ["$300$ cm$^2$", "$3\\,000$ cm$^2$", "$30\\,000$ cm$^2$", "$300\\,000$ cm$^2$"],
    "C",
    "MEDIUM",
    "$1$ m$^2 = 10\\,000$ cm$^2$, so $3 \\times 10\\,000 = 30\\,000$ cm$^2$.\n\n**Answer: C**",
  ),
  mcq(
    "$2\\,500$ cm$^3$ expressed in millilitres is:",
    ["$25$ mL", "$250$ mL", "$2\\,500$ mL", "$25\\,000$ mL"],
    "C",
    "MEDIUM",
    "$1$ cm$^3 = 1$ mL, so $2\\,500$ cm$^3 = 2\\,500$ mL.\n\n**Answer: C**",
  ),
  mcq(
    "A water bottle holds $1.5$ litres. This volume in millilitres is:",
    ["$15$ mL", "$150$ mL", "$1\\,500$ mL", "$15\\,000$ mL"],
    "C",
    "MEDIUM",
    "$1$ L $= 1\\,000$ mL, so $1.5 \\times 1\\,000 = 1\\,500$ mL.\n\n**Answer: C**",
  ),
  mcq(
    "$5\\,000$ mm$^2$ expressed in cm$^2$ is:",
    ["$5$ cm$^2$", "$50$ cm$^2$", "$500$ cm$^2$", "$5\\,000$ cm$^2$"],
    "B",
    "MEDIUM",
    "$1$ cm$^2 = 100$ mm$^2$, so $5\\,000 \\div 100 = 50$ cm$^2$.\n\n**Answer: B**",
  ),
  mcq(
    "A box of cereal weighs $750$ g. The weight in kilograms is:",
    ["$0.075$ kg", "$0.75$ kg", "$7.5$ kg", "$75$ kg"],
    "B",
    "MEDIUM",
    "$1$ kg $= 1\\,000$ g, so $750 \\div 1\\,000 = 0.75$ kg.\n\n**Answer: B**",
  ),
  mcq(
    "A milligram is what fraction of a gram?",
    ["$\\dfrac{1}{10}$", "$\\dfrac{1}{100}$", "$\\dfrac{1}{1\\,000}$", "$\\dfrac{1}{10\\,000}$"],
    "C",
    "MEDIUM",
    "$1$ g $= 1\\,000$ mg, so $1$ mg $= \\dfrac{1}{1\\,000}$ g.\n\n**Answer: C**",
  ),
  mcq(
    "$0.045$ kilolitres expressed in litres is:",
    ["$0.45$ L", "$4.5$ L", "$45$ L", "$450$ L"],
    "C",
    "HARD",
    "$1$ kL $= 1\\,000$ L, so $0.045 \\times 1\\,000 = 45$ L.\n\n**Answer: C**",
  ),
  mcq(
    "A garden bed is $2.5$ m by $4$ m. Its area in square centimetres is:",
    ["$1\\,000$ cm$^2$", "$10\\,000$ cm$^2$", "$100\\,000$ cm$^2$", "$1\\,000\\,000$ cm$^2$"],
    "C",
    "HARD",
    "Area in m$^2$: $2.5 \\times 4 = 10$ m$^2$. Convert: $10 \\times 10\\,000 = 100\\,000$ cm$^2$.\n\n**Answer: C**",
  ),

  // ── SHORT_ANSWER (11) ────────────────────────────────────────────────
  sa(
    "Convert $5.6$ metres to centimetres.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $5.6 \\times 100 = 560$ cm.",
  ),
  sa(
    "Convert $3\\,250$ grams to kilograms.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $3\\,250 \\div 1\\,000 = 3.25$ kg.",
  ),
  sa(
    "Convert $0.6$ litres to millilitres.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $0.6 \\times 1\\,000 = 600$ mL.",
  ),
  sa(
    "Convert $4.8$ kilometres to metres.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $4.8 \\times 1\\,000 = 4\\,800$ m.",
  ),
  sa(
    "Convert $85$ millimetres to centimetres.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $85 \\div 10 = 8.5$ cm.",
  ),
  sa(
    "Convert $0.75$ tonnes to kilograms.",
    1,
    "MEDIUM",
    "**Step 1 (1 mark):** $0.75 \\times 1\\,000 = 750$ kg.",
  ),
  sa(
    "Convert $2.5$ m$^2$ to cm$^2$.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** $1$ m$^2 = 10\\,000$ cm$^2$.\n\n**Step 2 (1 mark):** $2.5 \\times 10\\,000 = 25\\,000$ cm$^2$.",
  ),
  sa(
    "Convert $1\\,500$ cm$^3$ to millilitres.",
    1,
    "MEDIUM",
    "**Step 1 (1 mark):** $1$ cm$^3 = 1$ mL, so $1\\,500$ cm$^3 = 1\\,500$ mL.",
  ),
  sa(
    "A bag of flour weighs $1.2$ kg. The recipe calls for $250$ g. After using the recipe, how many grams of flour remain in the bag?",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** $1.2$ kg $= 1\\,200$ g.\n\n**Step 2 (1 mark):** Remaining: $1\\,200 - 250 = 950$ g.",
  ),
  sa(
    "Lena pours $850$ mL of water from a $2$ L jug. How many millilitres remain in the jug?",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** $2$ L $= 2\\,000$ mL.\n\n**Step 2 (1 mark):** $2\\,000 - 850 = 1\\,150$ mL.",
  ),
  sa(
    "A rectangular block of land has dimensions $40$ m by $25$ m. Calculate its area and express the answer in hectares (one hectare $= 10\\,000$ m$^2$).",
    3,
    "HARD",
    "**Step 1 (1 mark):** Area: $40 \\times 25 = 1\\,000$ m$^2$.\n\n**Step 2 (1 mark):** Convert: $1\\,000 \\div 10\\,000 = 0.1$.\n\n**Step 3 (1 mark):** Area $= 0.1$ hectare.",
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`units-of-measurement: wrote ${items.length} items to ${OUT}`);
