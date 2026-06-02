/**
 * Foundation generator: currency-conversion
 *
 * core-drill + extended-fit + modelling-rich tier:
 *   14 MCQ + 11 SHORT_ANSWER + 3 EXTENDED_ANSWER + 2 EXTENDED_RESPONSE = 30
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/currency-conversion.json");

const TOPIC = "algebra-number-and-structure";
const SUB = "currency-conversion";

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
  // ── MCQ (14) ─────────────────────────────────────────────────────────
  mcq(
    "The exchange rate is $\\text{AUD } \\$1 = \\text{USD } \\$0.65$. Converting $\\$100$ AUD gives:",
    ["USD $\\$65$", "USD $\\$100$", "USD $\\$135$", "USD $\\$153.85$"],
    "A",
    "EASY",
    "Multiply by the rate: $100 \\times 0.65 = \\$65$ USD.\n\n**Answer: A**",
  ),
  mcq(
    "If $\\text{AUD } \\$1 = \\text{EUR } \\$0.60$, then $\\$50$ AUD is equivalent to:",
    ["EUR $\\$30$", "EUR $\\$50$", "EUR $\\$80$", "EUR $\\$83.33$"],
    "A",
    "EASY",
    "$50 \\times 0.60 = \\$30$ EUR.\n\n**Answer: A**",
  ),
  mcq(
    "The exchange rate $\\text{AUD } \\$1 = \\text{NZD } \\$1.10$ means that:",
    [
      "$\\$1$ AUD buys $\\$1.10$ NZD",
      "$\\$1.10$ AUD buys $\\$1$ NZD",
      "$\\$1$ NZD buys $\\$1.10$ AUD",
      "$\\$1$ AUD equals $\\$1$ NZD",
    ],
    "A",
    "EASY",
    "The rate gives the amount of NZD obtained for one AUD, so $\\$1$ AUD buys $\\$1.10$ NZD.\n\n**Answer: A**",
  ),
  mcq(
    "Lina exchanges $\\$200$ AUD when the rate is $\\text{AUD } \\$1 = \\text{GBP } \\$0.50$. She receives:",
    ["GBP $\\$50$", "GBP $\\$100$", "GBP $\\$200$", "GBP $\\$400$"],
    "B",
    "EASY",
    "$200 \\times 0.50 = \\$100$ GBP.\n\n**Answer: B**",
  ),
  mcq(
    "A traveller has $\\$240$ AUD. The rate is $\\text{AUD } \\$1 = \\text{JPY } 95$. The amount of JPY received is:",
    ["JPY $9\\,500$", "JPY $22\\,800$", "JPY $24\\,000$", "JPY $240$"],
    "B",
    "EASY",
    "$240 \\times 95 = 22\\,800$ JPY.\n\n**Answer: B**",
  ),
  mcq(
    "If $\\text{AUD } \\$1 = \\text{USD } \\$0.65$, then USD $\\$130$ is equivalent to:",
    ["AUD $\\$84.50$", "AUD $\\$130$", "AUD $\\$195$", "AUD $\\$200$"],
    "D",
    "MEDIUM",
    "Reverse: divide by the rate. $\\dfrac{130}{0.65} = \\$200$ AUD.\n\n**Answer: D**",
  ),
  mcq(
    "Daisy has EUR $\\$120$ and wants to exchange it for AUD. The rate is $\\text{AUD } \\$1 = \\text{EUR } \\$0.60$. She will receive:",
    ["AUD $\\$72$", "AUD $\\$120$", "AUD $\\$180$", "AUD $\\$200$"],
    "D",
    "MEDIUM",
    "Divide EUR by the rate: $\\dfrac{120}{0.60} = \\$200$ AUD.\n\n**Answer: D**",
  ),
  mcq(
    "The exchange rate is $\\text{AUD } \\$1 = \\text{USD } \\$0.68$. After a $2\\%$ commission, exchanging $\\$500$ AUD gives a net amount of USD:",
    ["USD $\\$333.20$", "USD $\\$340.00$", "USD $\\$346.80$", "USD $\\$500.00$"],
    "A",
    "MEDIUM",
    "Gross: $500 \\times 0.68 = \\$340$. Commission: $2\\% \\times \\$340 = \\$6.80$. Net: $\\$340 - \\$6.80 = \\$333.20$.\n\n**Answer: A**",
  ),
  mcq(
    "A bag at a Melbourne airport costs $\\$120$ AUD. The same model in a New York store costs USD $\\$70$. The rate is $\\text{AUD } \\$1 = \\text{USD } \\$0.70$. The New York price in AUD is:",
    ["AUD $\\$84$", "AUD $\\$100$", "AUD $\\$120$", "AUD $\\$170$"],
    "B",
    "MEDIUM",
    "Convert: $\\dfrac{70}{0.70} = \\$100$ AUD.\n\n**Answer: B**",
  ),
  mcq(
    "An item costs JPY $7\\,500$. The exchange rate is $\\text{AUD } \\$1 = \\text{JPY } 95$. The cost in AUD is closest to:",
    ["AUD $\\$71.25$", "AUD $\\$78.95$", "AUD $\\$79.50$", "AUD $\\$85.00$"],
    "B",
    "MEDIUM",
    "Divide: $\\dfrac{7500}{95} = \\$78.95$ AUD (correct to the nearest cent).\n\n**Answer: B**",
  ),
  mcq(
    "The rate $\\text{AUD } \\$1 = \\text{USD } \\$0.65$ changes to $\\text{AUD } \\$1 = \\text{USD } \\$0.70$. This means the Australian dollar has:",
    ["weakened against the USD", "strengthened against the USD", "stayed the same", "doubled in value"],
    "B",
    "MEDIUM",
    "Each AUD now buys more USD ($\\$0.70$ vs $\\$0.65$), so the AUD has strengthened.\n\n**Answer: B**",
  ),
  mcq(
    "Eve exchanges $\\$1\\,000$ AUD into USD at $\\text{AUD } \\$1 = \\text{USD } \\$0.65$. On returning, she changes the USD back to AUD at $\\text{AUD } \\$1 = \\text{USD } \\$0.65$. Ignoring fees, she ends with:",
    ["AUD $\\$650$", "AUD $\\$1\\,000$", "AUD $\\$1\\,300$", "AUD $\\$1\\,538.46$"],
    "B",
    "MEDIUM",
    "Forward: $1000 \\times 0.65 = \\$650$ USD. Back: $\\dfrac{650}{0.65} = \\$1\\,000$ AUD.\n\n**Answer: B**",
  ),
  mcq(
    "A hotel in Bali costs IDR $1\\,500\\,000$ per night. The rate is $\\text{AUD } \\$1 = \\text{IDR } 10\\,000$. The cost per night in AUD is:",
    ["AUD $\\$15$", "AUD $\\$100$", "AUD $\\$150$", "AUD $\\$1\\,500$"],
    "C",
    "HARD",
    "$\\dfrac{1\\,500\\,000}{10\\,000} = \\$150$ AUD per night.\n\n**Answer: C**",
  ),
  mcq(
    "A traveller exchanges $\\$800$ AUD at $\\text{AUD } \\$1 = \\text{EUR } \\$0.60$, with a flat fee of $\\$5$ AUD deducted before conversion. The net EUR received is:",
    ["EUR $\\$471.00$", "EUR $\\$477.00$", "EUR $\\$480.00$", "EUR $\\$485.00$"],
    "B",
    "HARD",
    "After fee in AUD: $\\$800 - \\$5 = \\$795$. Convert: $795 \\times 0.60 = \\$477.00$ EUR.\n\n**Answer: B**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "Convert $\\$50$ AUD to USD at the rate $\\text{AUD } \\$1 = \\text{USD } \\$0.70$.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $50 \\times 0.70 = \\$35$ USD.",
  ),
  sa(
    "Convert $\\$80$ AUD to EUR at the rate $\\text{AUD } \\$1 = \\text{EUR } \\$0.60$.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $80 \\times 0.60 = \\$48$ EUR.",
  ),
  sa(
    "Convert $\\$250$ AUD to NZD at the rate $\\text{AUD } \\$1 = \\text{NZD } \\$1.08$, correct to the nearest cent.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $250 \\times 1.08 = \\$270.00$ NZD.",
  ),
  sa(
    "Convert USD $\\$140$ to AUD at the rate $\\text{AUD } \\$1 = \\text{USD } \\$0.70$.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $\\dfrac{140}{0.70} = \\$200$ AUD.",
  ),
  sa(
    "A camera in Sydney costs $\\$880$ AUD. The same camera in Tokyo costs JPY $80\\,000$. The exchange rate is $\\text{AUD } \\$1 = \\text{JPY } 95$. Calculate the Tokyo price in AUD, correct to the nearest cent.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** $\\dfrac{80\\,000}{95}$.\n\n**Step 2 (1 mark):** $= \\$842.11$ AUD.",
  ),
  sa(
    "A traveller exchanges $\\$300$ AUD at $\\text{AUD } \\$1 = \\text{USD } \\$0.65$. The exchange bureau charges a $2\\%$ commission on the USD received. Calculate the net amount of USD received.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Gross USD: $300 \\times 0.65 = \\$195.00$.\n\n**Step 2 (1 mark):** Commission: $2\\% \\times \\$195 = \\$3.90$.\n\n**Step 3 (1 mark):** Net USD: $\\$195.00 - \\$3.90 = \\$191.10$.",
  ),
  sa(
    "A hotel in Bali charges IDR $850\\,000$ per night. The exchange rate is $\\text{AUD } \\$1 = \\text{IDR } 10\\,000$. Calculate the cost in AUD per night.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** $\\dfrac{850\\,000}{10\\,000}$.\n\n**Step 2 (1 mark):** $= \\$85.00$ AUD per night.",
  ),
  sa(
    "Mei has $\\$400$ AUD and converts it to GBP. The rate is $\\text{AUD } \\$1 = \\text{GBP } \\$0.52$. After her trip, she has GBP $\\$50$ left. Calculate the GBP she spent.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** GBP received: $400 \\times 0.52 = \\$208.00$.\n\n**Step 2 (1 mark):** GBP spent: $\\$208.00 - \\$50.00 = \\$158.00$.",
  ),
  sa(
    "Last week the rate was $\\text{AUD } \\$1 = \\text{USD } \\$0.66$. This week it is $\\text{AUD } \\$1 = \\text{USD } \\$0.69$. Calculate the percentage change in the rate from last week to this week, correct to two decimal places.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Change: $0.69 - 0.66 = 0.03$.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{0.03}{0.66} \\times 100 = 4.55\\%$ (correct to two decimal places).",
  ),
  sa(
    "Sam exchanged $\\$600$ AUD at $\\text{AUD } \\$1 = \\text{EUR } \\$0.60$. On return he exchanges his remaining EUR $\\$120$ back to AUD at $\\text{AUD } \\$1 = \\text{EUR } \\$0.62$. Calculate the AUD he receives back, correct to the nearest cent.",
    3,
    "HARD",
    "**Step 1 (1 mark):** EUR received initially: $600 \\times 0.60 = \\$360$.\n\n**Step 2 (1 mark):** Returning rate gives AUD per EUR: $\\dfrac{1}{0.62}$.\n\n**Step 3 (1 mark):** AUD received: $\\dfrac{120}{0.62} = \\$193.55$ AUD.",
  ),
  sa(
    "A flight from Melbourne to Singapore costs $\\$650$ AUD. The same airline lists the same flight from Singapore at SGD $\\$540$. The rate is $\\text{AUD } \\$1 = \\text{SGD } \\$0.90$. Which option is cheaper in AUD, and by how much (to the nearest cent)?",
    3,
    "HARD",
    "**Step 1 (1 mark):** Convert SGD price to AUD: $\\dfrac{540}{0.90} = \\$600$ AUD.\n\n**Step 2 (1 mark):** Compare: $\\$650$ vs $\\$600$.\n\n**Step 3 (1 mark):** The Singapore-priced flight is cheaper by $\\$650 - \\$600 = \\$50.00$.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "Sarah is planning a holiday in the USA. She has $\\$2\\,000$ AUD to convert into USD. The exchange rate is $\\text{AUD } \\$1 = \\text{USD } \\$0.65$.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the amount of USD Sarah will receive (ignoring fees).",
        solution: "**Step 1 (1 mark):** $2000 \\times 0.65 = \\$1\\,300$ USD.",
      },
      {
        label: "b",
        marks: 2,
        content: "The exchange bureau also charges a $\\$10$ AUD flat fee for the transaction. Calculate Sarah's net USD received after the fee is deducted in AUD first.",
        solution: "**Step 1 (1 mark):** AUD available after fee: $\\$2\\,000 - \\$10 = \\$1\\,990$.\n\n**Step 2 (1 mark):** Net USD: $1990 \\times 0.65 = \\$1\\,293.50$ USD.",
      },
      {
        label: "c",
        marks: 2,
        content: "Sarah returns home with USD $\\$120$ left. She converts them back at $\\text{AUD } \\$1 = \\text{USD } \\$0.66$ (no fee). Calculate the AUD she receives, correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** Apply reverse rate: $\\dfrac{120}{0.66}$.\n\n**Step 2 (1 mark):** $= \\$181.82$ AUD (to the nearest cent).",
      },
    ],
  ),
  ea(
    "Carlos is travelling from Australia to New Zealand for a wedding. The exchange rate at his bank is $\\text{AUD } \\$1 = \\text{NZD } \\$1.05$.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Convert $\\$1\\,200$ AUD into NZD at this rate.",
        solution: "**Step 1 (1 mark):** $1200 \\times 1.05 = \\$1\\,260$ NZD.",
      },
      {
        label: "b",
        marks: 2,
        content: "On his trip, Carlos spends NZD $\\$980$. Calculate the NZD he has left and convert it back to AUD at $\\text{AUD } \\$1 = \\text{NZD } \\$1.05$, correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** NZD remaining: $\\$1\\,260 - \\$980 = \\$280$.\n\n**Step 2 (1 mark):** AUD received: $\\dfrac{280}{1.05} = \\$266.67$ AUD.",
      },
      {
        label: "c",
        marks: 2,
        content: "If the rate had been $\\text{AUD } \\$1 = \\text{NZD } \\$1.10$ when Carlos initially exchanged, how much more NZD would he have received from his $\\$1\\,200$ AUD?",
        solution: "**Step 1 (1 mark):** New NZD received: $1200 \\times 1.10 = \\$1\\,320$.\n\n**Step 2 (1 mark):** Extra: $\\$1\\,320 - \\$1\\,260 = \\$60$ NZD.",
      },
    ],
  ),
  ea(
    "A coffee machine retails for $\\$420$ AUD in Melbourne. The same model is listed at USD $\\$260$ on a US site and at EUR $\\$245$ on a European site. The exchange rates are $\\text{AUD } \\$1 = \\text{USD } \\$0.65$ and $\\text{AUD } \\$1 = \\text{EUR } \\$0.60$. Shipping is free in all cases.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 2,
        content: "Convert the US site price to AUD, correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** $\\dfrac{260}{0.65}$.\n\n**Step 2 (1 mark):** $= \\$400.00$ AUD.",
      },
      {
        label: "b",
        marks: 2,
        content: "Convert the European site price to AUD, correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** $\\dfrac{245}{0.60}$.\n\n**Step 2 (1 mark):** $= \\$408.33$ AUD.",
      },
      {
        label: "c",
        marks: 2,
        content: "Which option is the cheapest and by how much compared to the Melbourne price?",
        solution: "**Step 1 (1 mark):** Compare: Melbourne $\\$420$; US $\\$400$; Europe $\\$408.33$. Cheapest is the US site at $\\$400$.\n\n**Step 2 (1 mark):** Saving vs Melbourne: $\\$420 - \\$400 = \\$20.00$.",
      },
    ],
  ),

  // ── EXTENDED_RESPONSE (2) ───────────────────────────────────────────
  er(
    "Aisha is planning a two-week trip to Japan and the United States. The exchange rates available at her bank are:\n\n| Currency | Rate |\n|---|---|\n| Japanese yen (JPY) | $\\text{AUD } \\$1 = \\text{JPY } 95$ |\n| US dollar (USD) | $\\text{AUD } \\$1 = \\text{USD } \\$0.65$ |\n\nShe budgets $\\$3\\,000$ AUD for Japan and $\\$2\\,000$ AUD for the USA. The bank charges a $1\\%$ commission on each transaction (deducted from the foreign currency).",
    "HARD",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the gross JPY Aisha receives for her Japan budget (before commission).",
        solution: "**Step 1 (1 mark):** Apply the rate.\n\n**Step 2 (1 mark):** $3000 \\times 95 = 285\\,000$ JPY.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the net JPY received after the $1\\%$ commission is deducted.",
        solution: "**Step 1 (1 mark):** Commission: $1\\% \\times 285\\,000 = 2\\,850$ JPY.\n\n**Step 2 (1 mark):** Net JPY: $285\\,000 - 2\\,850 = 282\\,150$ JPY.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the gross USD Aisha receives for her USA budget (before commission).",
        solution: "**Step 1 (1 mark):** Apply the rate.\n\n**Step 2 (1 mark):** $2000 \\times 0.65 = \\$1\\,300$ USD.",
      },
      {
        label: "d",
        marks: 2,
        content: "Calculate the net USD received after the $1\\%$ commission is deducted.",
        solution: "**Step 1 (1 mark):** Commission: $1\\% \\times \\$1\\,300 = \\$13$ USD.\n\n**Step 2 (1 mark):** Net USD: $\\$1\\,300 - \\$13 = \\$1\\,287$ USD.",
      },
      {
        label: "e",
        marks: 3,
        content: "On Aisha's return, she has USD $\\$80$ and JPY $4\\,500$ left. The bank converts both back to AUD at the same rates with a $1\\%$ commission. Calculate the total AUD she receives back, correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** USD $\\$80$ to AUD: $\\dfrac{80}{0.65} = \\$123.08$ AUD (to the nearest cent). After $1\\%$ commission: $\\$123.08 \\times 0.99 = \\$121.85$.\n\n**Step 2 (1 mark):** JPY $4\\,500$ to AUD: $\\dfrac{4500}{95} = \\$47.37$ AUD. After $1\\%$ commission: $\\$47.37 \\times 0.99 = \\$46.90$.\n\n**Step 3 (1 mark):** Total AUD back: $\\$121.85 + \\$46.90 = \\$168.75$.",
      },
    ],
  ),
  er(
    "A small Melbourne business imports kitchen knives from Japan and Germany.\n\n- A Japanese supplier charges JPY $19\\,000$ per knife. The shipping cost is JPY $25\\,000$ for the order.\n- A German supplier charges EUR $\\$110$ per knife. Shipping is EUR $\\$80$ for the order.\n\nThe business orders $10$ knives per supplier. Exchange rates: $\\text{AUD } \\$1 = \\text{JPY } 95$ and $\\text{AUD } \\$1 = \\text{EUR } \\$0.60$.",
    "HARD",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the total cost of the Japanese order (including shipping) in AUD, correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** Total JPY: $10 \\times 19\\,000 + 25\\,000 = 190\\,000 + 25\\,000 = 215\\,000$ JPY.\n\n**Step 2 (1 mark):** AUD: $\\dfrac{215\\,000}{95} = \\$2\\,263.16$ AUD.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the total cost of the German order (including shipping) in AUD, correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** Total EUR: $10 \\times 110 + 80 = 1\\,100 + 80 = \\$1\\,180$ EUR.\n\n**Step 2 (1 mark):** AUD: $\\dfrac{1180}{0.60} = \\$1\\,966.67$ AUD.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the per-knife landed cost in AUD for each supplier, correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** Japanese: $\\dfrac{\\$2\\,263.16}{10} = \\$226.32$ per knife.\n\n**Step 2 (1 mark):** German: $\\dfrac{\\$1\\,966.67}{10} = \\$196.67$ per knife.",
      },
      {
        label: "d",
        marks: 2,
        content: "The business sells each knife for $\\$320$ AUD. Calculate the total profit on the German order ($10$ knives), correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** Sales revenue: $10 \\times \\$320 = \\$3\\,200$ AUD.\n\n**Step 2 (1 mark):** Profit: $\\$3\\,200 - \\$1\\,966.67 = \\$1\\,233.33$ AUD.",
      },
      {
        label: "e",
        marks: 2,
        content: "The exchange rate to JPY changes from $95$ to $90$ ($\\text{AUD } \\$1 = \\text{JPY } 90$). Recalculate the total cost of the Japanese order in AUD, and state whether the business pays more or less and by how much (to the nearest cent).",
        solution: "**Step 1 (1 mark):** New AUD cost: $\\dfrac{215\\,000}{90} = \\$2\\,388.89$ AUD.\n\n**Step 2 (1 mark):** Difference: $\\$2\\,388.89 - \\$2\\,263.16 = \\$125.73$ more. The business pays $\\$125.73$ more under the new rate.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`currency-conversion: wrote ${items.length} items to ${OUT}`);
