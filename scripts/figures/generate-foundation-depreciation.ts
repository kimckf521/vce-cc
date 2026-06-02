/**
 * Foundation generator: depreciation
 *
 * core-drill + extended-fit tier:
 *   14 MCQ + 11 SHORT_ANSWER + 3 EXTENDED_ANSWER = 28
 *
 * Foundation depreciation focuses on flat-rate (straight-line) and a touch of
 * reducing-balance (percentage of current value).
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/depreciation.json");

const TOPIC = "algebra-number-and-structure";
const SUB = "depreciation";

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
    "A laptop is bought for $\\$1\\,800$ and loses $\\$300$ in value each year (flat-rate depreciation). After $1$ year its value is:",
    ["$\\$300$", "$\\$1\\,200$", "$\\$1\\,500$", "$\\$2\\,100$"],
    "C",
    "EASY",
    "Subtract one year's depreciation: $\\$1\\,800 - \\$300 = \\$1\\,500$.\n\n**Answer: C**",
  ),
  mcq(
    "A printer is depreciated at $\\$80$ per year. After $5$ years, the total depreciation is:",
    ["$\\$80$", "$\\$160$", "$\\$320$", "$\\$400$"],
    "D",
    "EASY",
    "Total depreciation $= 5 \\times \\$80 = \\$400$.\n\n**Answer: D**",
  ),
  mcq(
    "Flat-rate depreciation means the asset loses:",
    [
      "a fixed dollar amount each year",
      "a fixed percentage of its current value each year",
      "all of its value in one year",
      "value only when sold",
    ],
    "A",
    "EASY",
    "Flat-rate (straight-line) depreciation subtracts the same dollar amount each year.\n\n**Answer: A**",
  ),
  mcq(
    "A photocopier costs $\\$4\\,200$ new and is depreciated at $\\$420$ per year. After $5$ years its book value is:",
    ["$\\$2\\,100$", "$\\$2\\,520$", "$\\$2\\,100$", "$\\$3\\,780$"],
    "A",
    "EASY",
    "Depreciation over $5$ years: $5 \\times \\$420 = \\$2\\,100$. Book value: $\\$4\\,200 - \\$2\\,100 = \\$2\\,100$.\n\n**Answer: A**",
  ),
  mcq(
    "A car worth $\\$24\\,000$ is depreciated at $10\\%$ per year using reducing-balance depreciation. Its value after $1$ year is:",
    ["$\\$2\\,400$", "$\\$21\\,600$", "$\\$23\\,990$", "$\\$26\\,400$"],
    "B",
    "EASY",
    "After $1$ year: $\\$24\\,000 \\times 0.9 = \\$21\\,600$.\n\n**Answer: B**",
  ),
  mcq(
    "A delivery van originally cost $\\$30\\,000$ and depreciates at a flat rate of $\\$3\\,500$ per year. After how many full years will its value first drop below $\\$10\\,000$?",
    ["$5$", "$6$", "$7$", "$8$"],
    "B",
    "MEDIUM",
    "Loss needed: more than $\\$20\\,000$. Years needed: $\\dfrac{\\$20\\,000}{\\$3\\,500} \\approx 5.71$. So after $6$ full years the value is $\\$30\\,000 - 6 \\times \\$3\\,500 = \\$9\\,000 < \\$10\\,000$.\n\n**Answer: B**",
  ),
  mcq(
    "Office furniture is purchased for $\\$8\\,000$ and depreciates at $\\$600$ per year. The salvage value after $10$ years is:",
    ["$\\$0$", "$\\$2\\,000$", "$\\$1\\,400$", "$\\$2\\,400$"],
    "B",
    "MEDIUM",
    "Total depreciation: $10 \\times \\$600 = \\$6\\,000$. Salvage value: $\\$8\\,000 - \\$6\\,000 = \\$2\\,000$.\n\n**Answer: B**",
  ),
  mcq(
    "A computer worth $\\$2\\,500$ depreciates at $20\\%$ per year on reducing balance. Its value after $2$ years is:",
    ["$\\$1\\,500$", "$\\$1\\,600$", "$\\$1\\,600.00$", "$\\$1\\,600$"],
    "B",
    "MEDIUM",
    "After $2$ years: $\\$2\\,500 \\times 0.8^2 = \\$2\\,500 \\times 0.64 = \\$1\\,600$.\n\n**Answer: B**",
  ),
  mcq(
    "A piece of machinery was bought for $\\$50\\,000$ and is worth $\\$30\\,000$ after $4$ years using flat-rate depreciation. The annual depreciation amount is:",
    ["$\\$2\\,500$", "$\\$4\\,000$", "$\\$5\\,000$", "$\\$7\\,500$"],
    "C",
    "MEDIUM",
    "Total loss: $\\$50\\,000 - \\$30\\,000 = \\$20\\,000$ over $4$ years. Annual: $\\dfrac{\\$20\\,000}{4} = \\$5\\,000$.\n\n**Answer: C**",
  ),
  mcq(
    "A photocopier valued at $\\$3\\,000$ depreciates at a flat rate of $15\\%$ of its original value per year. Its value after $3$ years is:",
    ["$\\$1\\,350$", "$\\$1\\,500$", "$\\$1\\,650$", "$\\$2\\,550$"],
    "C",
    "MEDIUM",
    "Annual depreciation: $15\\%$ of $\\$3\\,000 = \\$450$. Over $3$ years: $\\$1\\,350$. Value: $\\$3\\,000 - \\$1\\,350 = \\$1\\,650$.\n\n**Answer: C**",
  ),
  mcq(
    "Flat-rate depreciation of a $\\$1\\,200$ asset uses a rate of $\\$150$ per year. The effective annual depreciation rate as a percentage of the original value is:",
    ["$8\\%$", "$10\\%$", "$12.5\\%$", "$15\\%$"],
    "C",
    "MEDIUM",
    "$\\dfrac{150}{1200} \\times 100 = 12.5\\%$ per annum.\n\n**Answer: C**",
  ),
  mcq(
    "A car worth $\\$18\\,000$ depreciates at $12\\%$ per year on reducing balance. Its value after $2$ years is closest to:",
    ["$\\$13\\,824$", "$\\$13\\,939.20$", "$\\$14\\,400$", "$\\$15\\,840$"],
    "B",
    "MEDIUM",
    "After $2$ years: $18\\,000 \\times 0.88^2 = 18\\,000 \\times 0.7744 = \\$13\\,939.20$.\n\n**Answer: B**",
  ),
  mcq(
    "A power tool depreciates from $\\$2\\,000$ to $\\$1\\,250$ over $5$ years using flat-rate depreciation. The annual depreciation as a percentage of the original value is:",
    ["$5\\%$", "$7.5\\%$", "$10\\%$", "$15\\%$"],
    "B",
    "HARD",
    "Loss: $\\$2\\,000 - \\$1\\,250 = \\$750$ over $5$ years. Annual: $\\$150$. Rate: $\\dfrac{150}{2000} \\times 100 = 7.5\\%$.\n\n**Answer: B**",
  ),
  mcq(
    "An asset worth $\\$10\\,000$ depreciates at $25\\%$ per year on reducing balance. After how many full years does its value first drop below $\\$5\\,000$?",
    ["$2$", "$3$", "$4$", "$5$"],
    "B",
    "HARD",
    "After $1$ yr: $\\$7\\,500$. After $2$ yrs: $\\$5\\,625$. After $3$ yrs: $\\$4\\,218.75 < \\$5\\,000$. So $3$ years.\n\n**Answer: B**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "A laptop costs $\\$1\\,500$ and depreciates at $\\$300$ per year. Calculate its value after $1$ year using flat-rate depreciation.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $\\$1\\,500 - \\$300 = \\$1\\,200$.",
  ),
  sa(
    "A printer depreciates at $\\$90$ per year. Calculate the total depreciation over $4$ years.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $4 \\times \\$90 = \\$360$.",
  ),
  sa(
    "A coffee machine was bought for $\\$2\\,400$ and is worth $\\$1\\,200$ after $4$ years. Calculate the annual flat-rate depreciation amount.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Total loss: $\\$2\\,400 - \\$1\\,200 = \\$1\\,200$ over $4$ years.\n\n**Step 2 (1 mark):** Annual: $\\dfrac{\\$1\\,200}{4} = \\$300$ per year.",
  ),
  sa(
    "A car worth $\\$30\\,000$ depreciates at $10\\%$ per year on reducing balance. Calculate its value after $1$ year.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $\\$30\\,000 \\times 0.9 = \\$27\\,000$.",
  ),
  sa(
    "A photocopier costs $\\$5\\,000$ new. It depreciates at $\\$650$ per year. Calculate its book value after $6$ years.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Total depreciation: $6 \\times \\$650 = \\$3\\,900$.\n\n**Step 2 (1 mark):** Book value: $\\$5\\,000 - \\$3\\,900 = \\$1\\,100$.",
  ),
  sa(
    "A van costs $\\$36\\,000$ and depreciates at $8\\%$ of its original value per year (flat-rate). Calculate its book value after $5$ years.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Annual depreciation: $8\\% \\times \\$36\\,000 = \\$2\\,880$. Total over $5$ years: $5 \\times \\$2\\,880 = \\$14\\,400$.\n\n**Step 2 (1 mark):** Book value: $\\$36\\,000 - \\$14\\,400 = \\$21\\,600$.",
  ),
  sa(
    "A truck worth $\\$45\\,000$ depreciates at $15\\%$ per year on reducing balance. Calculate its value after $2$ years, correct to the nearest cent.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** $\\$45\\,000 \\times 0.85^2 = \\$45\\,000 \\times 0.7225$.\n\n**Step 2 (1 mark):** $= \\$32\\,512.50$.",
  ),
  sa(
    "An asset originally cost $\\$8\\,000$ and is depreciated at $\\$900$ per year. Calculate the number of full years before its value drops below $\\$2\\,000$.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Required depreciation: more than $\\$8\\,000 - \\$2\\,000 = \\$6\\,000$.\n\n**Step 2 (1 mark):** Years required: $\\dfrac{\\$6\\,000}{\\$900} = 6.67$.\n\n**Step 3 (1 mark):** Therefore after $7$ full years the value first drops below $\\$2\\,000$.",
  ),
  sa(
    "A car worth $\\$22\\,000$ depreciates at $12\\%$ per year on reducing balance. Calculate its value after $3$ years, correct to the nearest cent.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Multiplier per year: $1 - 0.12 = 0.88$.\n\n**Step 2 (1 mark):** $\\$22\\,000 \\times 0.88^3 = \\$22\\,000 \\times 0.681472$.\n\n**Step 3 (1 mark):** $= \\$14\\,992.38$.",
  ),
  sa(
    "Office equipment was bought for $\\$12\\,000$ and depreciated at $\\$1\\,500$ per year. Calculate its book value after $4$ years and express the total depreciation as a percentage of the original cost.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Total depreciation: $4 \\times \\$1\\,500 = \\$6\\,000$.\n\n**Step 2 (1 mark):** Book value: $\\$12\\,000 - \\$6\\,000 = \\$6\\,000$.\n\n**Step 3 (1 mark):** Percentage: $\\dfrac{6000}{12\\,000} \\times 100 = 50\\%$.",
  ),
  sa(
    "A tractor costing $\\$60\\,000$ is depreciated using flat-rate depreciation. After $8$ years its book value is $\\$20\\,000$. Calculate the annual depreciation rate as a percentage of the original cost, correct to one decimal place.",
    3,
    "HARD",
    "**Step 1 (1 mark):** Total depreciation: $\\$60\\,000 - \\$20\\,000 = \\$40\\,000$.\n\n**Step 2 (1 mark):** Annual depreciation: $\\dfrac{\\$40\\,000}{8} = \\$5\\,000$.\n\n**Step 3 (1 mark):** Rate: $\\dfrac{5000}{60\\,000} \\times 100 = 8.3\\%$ (to one decimal place).",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "A small business buys a delivery van for $\\$32\\,000$. The van depreciates at a flat rate of $\\$3\\,200$ per year.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the value of the van after $1$ year.",
        solution: "**Step 1 (1 mark):** $\\$32\\,000 - \\$3\\,200 = \\$28\\,800$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the book value after $5$ years.",
        solution: "**Step 1 (1 mark):** Total depreciation: $5 \\times \\$3\\,200 = \\$16\\,000$.\n\n**Step 2 (1 mark):** Book value: $\\$32\\,000 - \\$16\\,000 = \\$16\\,000$.",
      },
      {
        label: "c",
        marks: 2,
        content: "After how many full years does the book value first drop below $\\$5\\,000$? Show working.",
        solution: "**Step 1 (1 mark):** Depreciation required: more than $\\$32\\,000 - \\$5\\,000 = \\$27\\,000$.\n\n**Step 2 (1 mark):** Years needed: $\\dfrac{\\$27\\,000}{\\$3\\,200} = 8.4375$. So $9$ full years.",
      },
    ],
  ),
  ea(
    "A camera worth $\\$2\\,400$ depreciates at $25\\%$ per year on reducing balance.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Write down the depreciation multiplier per year.",
        solution: "**Step 1 (1 mark):** Multiplier $= 1 - 0.25 = 0.75$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the camera's value after $2$ years, correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** $\\$2\\,400 \\times 0.75^2 = \\$2\\,400 \\times 0.5625$.\n\n**Step 2 (1 mark):** $= \\$1\\,350.00$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the depreciation loss over the $2$ years.",
        solution: "**Step 1 (1 mark):** Subtract the new value from the original.\n\n**Step 2 (1 mark):** Loss: $\\$2\\,400 - \\$1\\,350 = \\$1\\,050.00$.",
      },
    ],
  ),
  ea(
    "A machine originally cost $\\$48\\,000$. The owner is comparing two depreciation methods over $4$ years:\n\n- **Method A:** Flat-rate of $\\$6\\,000$ per year.\n- **Method B:** Reducing balance at $20\\%$ per year.",
    "HARD",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the book value under Method A after $4$ years.",
        solution: "**Step 1 (1 mark):** Total depreciation: $4 \\times \\$6\\,000 = \\$24\\,000$.\n\n**Step 2 (1 mark):** Book value: $\\$48\\,000 - \\$24\\,000 = \\$24\\,000$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the book value under Method B after $4$ years, correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** $\\$48\\,000 \\times 0.8^4 = \\$48\\,000 \\times 0.4096$.\n\n**Step 2 (1 mark):** $= \\$19\\,660.80$.",
      },
      {
        label: "c",
        marks: 2,
        content: "State which method gives a higher book value after $4$ years, and by how much (to the nearest cent).",
        solution: "**Step 1 (1 mark):** Compare: Method A $\\$24\\,000$; Method B $\\$19\\,660.80$. Method A is higher.\n\n**Step 2 (1 mark):** Difference: $\\$24\\,000 - \\$19\\,660.80 = \\$4\\,339.20$.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`depreciation: wrote ${items.length} items to ${OUT}`);
