/**
 * Foundation generator: percentages
 * Tier: core-drill + extended-fit + modelling-rich -> 14 MCQ + 11 SA + 3 EA + 2 ER
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/percentages.json");

const TOPIC = "algebra-number-and-structure";
const SUB = "percentages";

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
  // ── MCQ (14) ────────────────────────────────────────────────────────
  mcq(
    "$25\\%$ of $\\$80$ is equal to:",
    ["$\\$15$", "$\\$18$", "$\\$20$", "$\\$25$"],
    "C",
    "EASY",
    "$0.25 \\times \\$80 = \\$20$.\n\n**Answer: C**",
  ),
  mcq(
    "Expressed as a percentage, $\\dfrac{3}{5}$ is:",
    ["$30\\%$", "$50\\%$", "$60\\%$", "$65\\%$"],
    "C",
    "EASY",
    "$\\dfrac{3}{5} = 0.6 = 60\\%$.\n\n**Answer: C**",
  ),
  mcq(
    "$15\\%$ of $\\$220$ is equal to:",
    ["$\\$22$", "$\\$30$", "$\\$33$", "$\\$44$"],
    "C",
    "EASY",
    "$0.15 \\times \\$220 = \\$33$.\n\n**Answer: C**",
  ),
  mcq(
    "A jumper priced at $\\$60$ is discounted by $20\\%$. The discount amount is:",
    ["$\\$6$", "$\\$10$", "$\\$12$", "$\\$15$"],
    "C",
    "EASY",
    "$0.20 \\times \\$60 = \\$12$.\n\n**Answer: C**",
  ),
  mcq(
    "A handbag is on sale with $30\\%$ off the original price of $\\$120$. The sale price is:",
    ["$\\$36$", "$\\$84$", "$\\$90$", "$\\$96$"],
    "B",
    "EASY",
    "Discount: $0.30 \\times \\$120 = \\$36$. Sale price: $\\$120 - \\$36 = \\$84$.\n\n**Answer: B**",
  ),
  mcq(
    "A meal costs $\\$45$ before GST. The GST ($10\\%$) on this meal is:",
    ["$\\$3.50$", "$\\$4.00$", "$\\$4.50$", "$\\$5.00$"],
    "C",
    "EASY",
    "$0.10 \\times \\$45 = \\$4.50$.\n\n**Answer: C**",
  ),
  mcq(
    "In a class of $25$ students, $20$ passed a test. The percentage who passed is:",
    ["$70\\%$", "$75\\%$", "$80\\%$", "$85\\%$"],
    "C",
    "EASY",
    "$\\dfrac{20}{25} = 0.80 = 80\\%$.\n\n**Answer: C**",
  ),
  mcq(
    "A $\\$48$ shirt is increased in price by $15\\%$. The new price is:",
    ["$\\$52.80$", "$\\$54.00$", "$\\$55.20$", "$\\$63.00$"],
    "C",
    "MEDIUM",
    "$\\$48 \\times 1.15 = \\$55.20$.\n\n**Answer: C**",
  ),
  mcq(
    "A laptop is advertised at $\\$1\\,320$ including $10\\%$ GST. The price before GST is:",
    ["$\\$1\\,188$", "$\\$1\\,200$", "$\\$1\\,210$", "$\\$1\\,452$"],
    "B",
    "MEDIUM",
    "Pre-GST price: $\\dfrac{\\$1\\,320}{1.10} = \\$1\\,200$.\n\n**Answer: B**",
  ),
  mcq(
    "A jacket originally priced at $\\$240$ is discounted by $35\\%$. The sale price is:",
    ["$\\$84$", "$\\$144$", "$\\$156$", "$\\$176$"],
    "C",
    "MEDIUM",
    "Discount: $0.35 \\times \\$240 = \\$84$. Sale price: $\\$240 - \\$84 = \\$156$.\n\n**Answer: C**",
  ),
  mcq(
    "A coffee shop's daily sales rose from $\\$650$ to $\\$767$. The percentage increase is:",
    ["$15\\%$", "$17\\%$", "$18\\%$", "$20\\%$"],
    "C",
    "MEDIUM",
    "Increase: $\\$767 - \\$650 = \\$117$. Percentage: $\\dfrac{117}{650} \\times 100 = 18\\%$.\n\n**Answer: C**",
  ),
  mcq(
    "A car worth $\\$28\\,000$ depreciates by $12\\%$ in its first year. Its value after one year is:",
    ["$\\$3\\,360$", "$\\$22\\,400$", "$\\$24\\,640$", "$\\$25\\,200$"],
    "C",
    "MEDIUM",
    "Depreciation: $0.12 \\times \\$28\\,000 = \\$3\\,360$. New value: $\\$28\\,000 - \\$3\\,360 = \\$24\\,640$.\n\n**Answer: C**",
  ),
  mcq(
    "A restaurant bill of $\\$96.80$ already includes $10\\%$ GST. The GST component is closest to:",
    ["$\\$8.80$", "$\\$9.30$", "$\\$9.68$", "$\\$10.65$"],
    "A",
    "HARD",
    "Pre-GST: $\\dfrac{\\$96.80}{1.10} = \\$88.00$. GST: $\\$96.80 - \\$88.00 = \\$8.80$.\n\n**Answer: A**",
  ),
  mcq(
    "A pair of shoes is discounted by $20\\%$ and then a further $15\\%$ off the discounted price. The total percentage discount on the original price is:",
    ["$30\\%$", "$32\\%$", "$33\\%$", "$35\\%$"],
    "B",
    "HARD",
    "Multiplier: $0.80 \\times 0.85 = 0.68$. Total discount: $1 - 0.68 = 0.32 = 32\\%$.\n\n**Answer: B**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "Calculate $40\\%$ of $\\$250$.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $0.40 \\times \\$250 = \\$100$.",
  ),
  sa(
    "Express $\\dfrac{7}{20}$ as a percentage.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $\\dfrac{7}{20} = 0.35 = 35\\%$.",
  ),
  sa(
    "A water bottle costs $\\$18$ before GST. Calculate the GST ($10\\%$) on this purchase.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $0.10 \\times \\$18 = \\$1.80$.",
  ),
  sa(
    "A pair of jeans originally priced at $\\$90$ is reduced by $25\\%$. Calculate the sale price.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Discount: $0.25 \\times \\$90 = \\$22.50$.\n\n**Step 2 (1 mark):** Sale price: $\\$90 - \\$22.50 = \\$67.50$.",
  ),
  sa(
    "A school has $480$ students. $45\\%$ of them travel to school by bus. Calculate the number of students who travel by bus.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $0.45 \\times 480 = 216$ students.",
  ),
  sa(
    "A bookshop increases the price of a novel from $\\$24$ to $\\$27$. Calculate the percentage increase.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Increase: $\\$27 - \\$24 = \\$3$.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{3}{24} \\times 100 = 12.5\\%$.",
  ),
  sa(
    "A retailer marks up a wholesale item by $35\\%$. If the wholesale cost is $\\$80$, calculate the retail price.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Mark-up: $0.35 \\times \\$80 = \\$28$.\n\n**Step 2 (1 mark):** Retail price: $\\$80 + \\$28 = \\$108$.",
  ),
  sa(
    "A meal at a Melbourne cafe costs $\\$66$ including $10\\%$ GST. Calculate the price of the meal before GST.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Divide by $1.10$: $\\dfrac{\\$66}{1.10}$.\n\n**Step 2 (1 mark):** $= \\$60.00$.",
  ),
  sa(
    "A car was purchased for $\\$32\\,500$. After two years its value has decreased by $24\\%$. Calculate the current value of the car.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Depreciation: $0.24 \\times \\$32\\,500 = \\$7\\,800$.\n\n**Step 2 (1 mark):** Current value: $\\$32\\,500 - \\$7\\,800 = \\$24\\,700$.",
  ),
  sa(
    "A salary increases from $\\$54\\,000$ to $\\$58\\,320$. Calculate the percentage increase.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Increase: $\\$58\\,320 - \\$54\\,000 = \\$4\\,320$.\n\n**Step 2 (1 mark):** As a fraction of the original: $\\dfrac{4\\,320}{54\\,000}$.\n\n**Step 3 (1 mark):** $= 0.08 = 8\\%$ increase.",
  ),
  sa(
    "A pair of shoes is reduced by $30\\%$ and then a further $10\\%$ off the reduced price. The original price was $\\$180$. Calculate the final sale price.",
    3,
    "HARD",
    "**Step 1 (1 mark):** First discount: $\\$180 \\times 0.70 = \\$126$.\n\n**Step 2 (1 mark):** Second discount: $\\$126 \\times 0.90 = \\$113.40$.\n\n**Step 3 (1 mark):** Final sale price: $\\$113.40$.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "An electronics store in Brisbane is running a clearance sale. A television is advertised at an original price of $\\$1\\,500$, with $20\\%$ off marked at the register. The advertised price includes $10\\%$ GST.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the discount amount applied to the television.",
        solution: "**Step 1 (1 mark):** Discount: $0.20 \\times \\$1\\,500 = \\$300$.",
      },
      {
        label: "b",
        marks: 1,
        content: "Calculate the sale price of the television.",
        solution: "**Step 1 (1 mark):** Sale price: $\\$1\\,500 - \\$300 = \\$1\\,200$.",
      },
      {
        label: "c",
        marks: 2,
        content: "The sale price includes $10\\%$ GST. Calculate the GST component of the sale price (correct to the nearest cent).",
        solution: "**Step 1 (1 mark):** Pre-GST price: $\\dfrac{\\$1\\,200}{1.10} = \\$1\\,090.91$.\n\n**Step 2 (1 mark):** GST: $\\$1\\,200 - \\$1\\,090.91 = \\$109.09$.",
      },
    ],
  ),
  ea(
    "A bicycle shop buys mountain bikes from a wholesaler for $\\$420$ each. The shop adds a $45\\%$ markup, then charges $10\\%$ GST on the marked-up price when selling to customers.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the markup amount added to the wholesale price.",
        solution: "**Step 1 (1 mark):** Markup: $0.45 \\times \\$420 = \\$189$.",
      },
      {
        label: "b",
        marks: 1,
        content: "Calculate the marked-up price (before GST).",
        solution: "**Step 1 (1 mark):** Marked-up price: $\\$420 + \\$189 = \\$609$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the final retail price including $10\\%$ GST.",
        solution: "**Step 1 (1 mark):** GST: $0.10 \\times \\$609 = \\$60.90$.\n\n**Step 2 (1 mark):** Retail price: $\\$609 + \\$60.90 = \\$669.90$.",
      },
    ],
  ),
  ea(
    "An online store in Sydney is offering a promotion: $15\\%$ off all orders over $\\$200$, plus a further $5\\%$ off if the customer pays by direct deposit. Mia plans to buy items totalling $\\$340$.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the price after the first $15\\%$ discount.",
        solution: "**Step 1 (1 mark):** Discount: $0.15 \\times \\$340 = \\$51$.\n\n**Step 2 (1 mark):** Price after first discount: $\\$340 - \\$51 = \\$289$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Mia pays by direct deposit. Calculate the final price after the further $5\\%$ discount is applied to the previously discounted price.",
        solution: "**Step 1 (1 mark):** Further discount: $0.05 \\times \\$289 = \\$14.45$.\n\n**Step 2 (1 mark):** Final price: $\\$289 - \\$14.45 = \\$274.55$.",
      },
      {
        label: "c",
        marks: 1,
        content: "Express Mia's total saving (compared to the original $\\$340$) as a percentage of the original price, correct to one decimal place.",
        solution: "**Step 1 (1 mark):** Saving: $\\$340 - \\$274.55 = \\$65.45$. Percentage: $\\dfrac{65.45}{340} \\times 100 = 19.25\\% \\approx 19.3\\%$.",
      },
    ],
  ),

  // ── EXTENDED_RESPONSE (2) ───────────────────────────────────────────
  er(
    "Chen runs a small Melbourne electronics shop. He imports speakers from overseas at a cost of $\\$240$ per unit. He adds a $50\\%$ markup, then charges $10\\%$ GST on the marked-up price. During a sale he advertises $25\\%$ off the marked retail price (including GST).",
    "HARD",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the marked-up price of one speaker (before GST).",
        solution: "**Step 1 (1 mark):** Markup: $0.50 \\times \\$240 = \\$120$.\n\n**Step 2 (1 mark):** Marked-up price: $\\$240 + \\$120 = \\$360$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the normal retail price including $10\\%$ GST.",
        solution: "**Step 1 (1 mark):** GST: $0.10 \\times \\$360 = \\$36$.\n\n**Step 2 (1 mark):** Retail price: $\\$360 + \\$36 = \\$396$.",
      },
      {
        label: "c",
        marks: 2,
        content: "During the sale, the retail price is discounted by $25\\%$. Calculate the sale price.",
        solution: "**Step 1 (1 mark):** Discount: $0.25 \\times \\$396 = \\$99$.\n\n**Step 2 (1 mark):** Sale price: $\\$396 - \\$99 = \\$297$.",
      },
      {
        label: "d",
        marks: 2,
        content: "Calculate Chen's profit on each speaker sold at the sale price (subtract the import cost of $\\$240$). Note: GST collected is paid to the ATO, so it is not part of profit. The pre-GST sale price is $\\dfrac{\\$297}{1.10}$.",
        solution: "**Step 1 (1 mark):** Pre-GST sale price: $\\dfrac{\\$297}{1.10} = \\$270$.\n\n**Step 2 (1 mark):** Profit per speaker: $\\$270 - \\$240 = \\$30$.",
      },
      {
        label: "e",
        marks: 2,
        content: "Express the sale-price profit as a percentage of the import cost, correct to one decimal place. Compare this with the normal retail profit margin of $50\\%$.",
        solution: "**Step 1 (1 mark):** Profit margin: $\\dfrac{30}{240} \\times 100 = 12.5\\%$.\n\n**Step 2 (1 mark):** The sale margin ($12.5\\%$) is much lower than the normal $50\\%$ margin, so Chen earns less per unit during the sale.",
      },
    ],
  ),
  er(
    "Sara is comparing two job offers in Sydney. Offer A pays an annual salary of $\\$72\\,000$ with a $4\\%$ pay rise after one year. Offer B pays an annual salary of $\\$68\\,000$ with a $7\\%$ pay rise after one year. Both employers deduct $22\\%$ income tax from gross pay.",
    "HARD",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the gross annual salary for each offer after the one-year pay rise.",
        solution: "**Step 1 (1 mark):** Offer A: $\\$72\\,000 \\times 1.04 = \\$74\\,880$.\n\n**Step 2 (1 mark):** Offer B: $\\$68\\,000 \\times 1.07 = \\$72\\,760$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the take-home (after-tax) annual salary for each offer in the first year (before the pay rise).",
        solution: "**Step 1 (1 mark):** Offer A: $\\$72\\,000 \\times 0.78 = \\$56\\,160$.\n\n**Step 2 (1 mark):** Offer B: $\\$68\\,000 \\times 0.78 = \\$53\\,040$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the take-home annual salary for each offer after the one-year pay rise.",
        solution: "**Step 1 (1 mark):** Offer A: $\\$74\\,880 \\times 0.78 = \\$58\\,406.40$.\n\n**Step 2 (1 mark):** Offer B: $\\$72\\,760 \\times 0.78 = \\$56\\,752.80$.",
      },
      {
        label: "d",
        marks: 2,
        content: "Calculate the total take-home pay for each offer over the first two years (year 1 + year 2).",
        solution: "**Step 1 (1 mark):** Offer A: $\\$56\\,160 + \\$58\\,406.40 = \\$114\\,566.40$.\n\n**Step 2 (1 mark):** Offer B: $\\$53\\,040 + \\$56\\,752.80 = \\$109\\,792.80$.",
      },
      {
        label: "e",
        marks: 2,
        content: "Which offer pays more take-home over two years, and by how much? Express the difference as a percentage of Offer B's two-year take-home, correct to one decimal place.",
        solution: "**Step 1 (1 mark):** Difference: $\\$114\\,566.40 - \\$109\\,792.80 = \\$4\\,773.60$. Offer A is higher.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{4\\,773.60}{109\\,792.80} \\times 100 \\approx 4.3\\%$.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`percentages: wrote ${items.length} items to ${OUT}`);
