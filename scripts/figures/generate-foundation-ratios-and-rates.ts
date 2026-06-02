/**
 * Foundation generator: ratios-and-rates
 * Tier: core-drill + extended-fit -> 14 MCQ + 11 SA + 3 EA = 28
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/ratios-and-rates.json");

const TOPIC = "algebra-number-and-structure";
const SUB = "ratios-and-rates";

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
  // ── MCQ (14) ────────────────────────────────────────────────────────
  mcq(
    "The ratio $12 : 18$ simplified to its lowest terms is:",
    ["$1 : 2$", "$2 : 3$", "$3 : 4$", "$6 : 9$"],
    "B",
    "EASY",
    "Divide both terms by $6$: $12 \\div 6 = 2$ and $18 \\div 6 = 3$, giving $2 : 3$.\n\n**Answer: B**",
  ),
  mcq(
    "A recipe uses flour and sugar in the ratio $4 : 1$. If $200$ g of flour is used, the amount of sugar needed is:",
    ["$40$ g", "$50$ g", "$80$ g", "$100$ g"],
    "B",
    "EASY",
    "Each ratio part: $200 \\div 4 = 50$ g. Sugar: $1 \\times 50 = 50$ g.\n\n**Answer: B**",
  ),
  mcq(
    "A car travels $240$ km in $3$ hours. Its average speed is:",
    ["$60$ km/h", "$70$ km/h", "$80$ km/h", "$90$ km/h"],
    "C",
    "EASY",
    "$\\dfrac{240}{3} = 80$ km/h.\n\n**Answer: C**",
  ),
  mcq(
    "A tap fills a $40$-litre tub in $8$ minutes. The flow rate is:",
    ["$3$ L/min", "$4$ L/min", "$5$ L/min", "$6$ L/min"],
    "C",
    "EASY",
    "$\\dfrac{40}{8} = 5$ L/min.\n\n**Answer: C**",
  ),
  mcq(
    "If $6$ apples cost $\\$4.50$, the cost of one apple is:",
    ["$\\$0.65$", "$\\$0.70$", "$\\$0.75$", "$\\$0.85$"],
    "C",
    "EASY",
    "$\\dfrac{\\$4.50}{6} = \\$0.75$ per apple.\n\n**Answer: C**",
  ),
  mcq(
    "Mix concrete in the ratio $1 : 2 : 4$ (cement : sand : gravel) by volume. For $14$ buckets of gravel, the buckets of sand needed are:",
    ["$3$", "$4$", "$7$", "$8$"],
    "C",
    "EASY",
    "Sand-to-gravel ratio is $2 : 4 = 1 : 2$. So sand $= 14 \\div 2 = 7$ buckets.\n\n**Answer: C**",
  ),
  mcq(
    "A bushwalker walks $15$ km in $2.5$ hours. Her average speed is:",
    ["$5$ km/h", "$6$ km/h", "$7$ km/h", "$7.5$ km/h"],
    "B",
    "EASY",
    "$\\dfrac{15}{2.5} = 6$ km/h.\n\n**Answer: B**",
  ),
  mcq(
    "$\\$420$ is shared between Tom and Jane in the ratio $3 : 4$. Jane receives:",
    ["$\\$140$", "$\\$180$", "$\\$240$", "$\\$280$"],
    "C",
    "MEDIUM",
    "Total parts: $3 + 4 = 7$. Each part: $\\dfrac{\\$420}{7} = \\$60$. Jane's share: $4 \\times \\$60 = \\$240$.\n\n**Answer: C**",
  ),
  mcq(
    "A printer prints $24$ pages per minute. The time to print $360$ pages is:",
    ["$12$ min", "$15$ min", "$18$ min", "$20$ min"],
    "B",
    "MEDIUM",
    "$\\dfrac{360}{24} = 15$ minutes.\n\n**Answer: B**",
  ),
  mcq(
    "A $750$ mL bottle of juice costs $\\$3.75$. Calculate the unit price per $100$ mL.",
    ["$\\$0.40$", "$\\$0.45$", "$\\$0.50$", "$\\$0.55$"],
    "C",
    "MEDIUM",
    "Per mL: $\\dfrac{\\$3.75}{750} = \\$0.005$. Per $100$ mL: $\\$0.005 \\times 100 = \\$0.50$.\n\n**Answer: C**",
  ),
  mcq(
    "If $5$ workers can paint a fence in $12$ hours, the time taken by $4$ workers (working at the same rate) is:",
    ["$10$ hours", "$13$ hours", "$15$ hours", "$16$ hours"],
    "C",
    "MEDIUM",
    "Total worker-hours: $5 \\times 12 = 60$. Time for $4$ workers: $\\dfrac{60}{4} = 15$ hours.\n\n**Answer: C**",
  ),
  mcq(
    "A car uses $7.5$ L of petrol per $100$ km. The petrol needed for a $640$ km trip is:",
    ["$36$ L", "$42$ L", "$48$ L", "$54$ L"],
    "C",
    "MEDIUM",
    "Petrol: $\\dfrac{7.5}{100} \\times 640 = 48$ L.\n\n**Answer: C**",
  ),
  mcq(
    "$\\$540$ is shared between three friends in the ratio $2 : 3 : 4$. The largest share is:",
    ["$\\$120$", "$\\$180$", "$\\$240$", "$\\$270$"],
    "C",
    "HARD",
    "Total parts: $2 + 3 + 4 = 9$. Each part: $\\dfrac{\\$540}{9} = \\$60$. Largest share ($4$ parts): $4 \\times \\$60 = \\$240$.\n\n**Answer: C**",
  ),
  mcq(
    "A train travels $180$ km at an average speed of $60$ km/h, then $120$ km at $80$ km/h. The average speed for the whole journey is closest to:",
    ["$66$ km/h", "$67$ km/h", "$70$ km/h", "$72$ km/h"],
    "B",
    "HARD",
    "Time leg 1: $\\dfrac{180}{60} = 3$ h. Time leg 2: $\\dfrac{120}{80} = 1.5$ h. Total time: $4.5$ h, distance $300$ km. Average: $\\dfrac{300}{4.5} \\approx 66.67$ km/h $\\approx 67$ km/h.\n\n**Answer: B**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "Simplify the ratio $20 : 35$ to its lowest terms.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Divide both terms by $5$: $20 \\div 5 = 4$ and $35 \\div 5 = 7$, giving $4 : 7$.",
  ),
  sa(
    "A car travels $180$ km in $2.5$ hours. Calculate the average speed in km/h.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $\\dfrac{180}{2.5} = 72$ km/h.",
  ),
  sa(
    "$8$ pencils cost $\\$6.40$. Calculate the cost per pencil.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $\\dfrac{\\$6.40}{8} = \\$0.80$ per pencil.",
  ),
  sa(
    "Concrete is mixed in the ratio cement : sand $= 1 : 5$ by volume. If $12$ buckets of sand are used, calculate the buckets of cement needed.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Cement $= \\dfrac{12}{5} = 2.4$ buckets.",
  ),
  sa(
    "A tap delivers water at $6$ L/min. Calculate the time taken to fill a $48$-litre drum.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $\\dfrac{48}{6} = 8$ minutes.",
  ),
  sa(
    "Share $\\$360$ between Aisha and Ben in the ratio $5 : 4$.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Total parts: $5 + 4 = 9$. Each part: $\\dfrac{\\$360}{9} = \\$40$.\n\n**Step 2 (1 mark):** Aisha: $5 \\times \\$40 = \\$200$. Ben: $4 \\times \\$40 = \\$160$.",
  ),
  sa(
    "A car uses $8.5$ L of petrol per $100$ km. Calculate the petrol used on a $420$ km drive.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Rate: $0.085$ L per km.\n\n**Step 2 (1 mark):** $0.085 \\times 420 = 35.70$ L.",
  ),
  sa(
    "A factory produces $1\\,500$ widgets in an $8$-hour shift. Calculate the production rate per hour.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** $\\dfrac{1\\,500}{8}$.\n\n**Step 2 (1 mark):** $= 187.5$ widgets per hour.",
  ),
  sa(
    "Compare unit prices: a $400$ g jar of pasta sauce costs $\\$3.60$ and a $750$ g jar costs $\\$6.30$. Calculate the unit price per $100$ g for each.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** $400$ g jar: $\\dfrac{\\$3.60}{400} \\times 100 = \\$0.90$ per $100$ g.\n\n**Step 2 (1 mark):** $750$ g jar: $\\dfrac{\\$6.30}{750} \\times 100 = \\$0.84$ per $100$ g.\n\n**Step 3 (1 mark):** The $750$ g jar is the better unit price.",
  ),
  sa(
    "Cement, sand and gravel are mixed in the ratio $1 : 3 : 5$ by volume to produce concrete. If the total volume of the mix is $36$ buckets, calculate the volume of sand used.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Total parts: $1 + 3 + 5 = 9$. Each part: $\\dfrac{36}{9} = 4$ buckets.\n\n**Step 2 (1 mark):** Sand: $3 \\times 4 = 12$ buckets.",
  ),
  sa(
    "A train travels $240$ km at $80$ km/h and then a further $120$ km at $60$ km/h. Calculate the average speed for the whole journey, correct to one decimal place.",
    3,
    "HARD",
    "**Step 1 (1 mark):** Time leg 1: $\\dfrac{240}{80} = 3$ h. Time leg 2: $\\dfrac{120}{60} = 2$ h.\n\n**Step 2 (1 mark):** Total: distance $= 360$ km, time $= 5$ h.\n\n**Step 3 (1 mark):** Average speed: $\\dfrac{360}{5} = 72.0$ km/h.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "A school is preparing a fruit punch for a Year 12 event. The recipe uses orange juice, pineapple juice and soda water in the ratio $3 : 2 : 5$ by volume.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the total number of ratio parts.",
        solution: "**Step 1 (1 mark):** $3 + 2 + 5 = 10$ parts.",
      },
      {
        label: "b",
        marks: 2,
        content: "The school needs $20$ litres of punch in total. Calculate the volume of orange juice required.",
        solution: "**Step 1 (1 mark):** Each part: $\\dfrac{20}{10} = 2$ litres.\n\n**Step 2 (1 mark):** Orange juice: $3 \\times 2 = 6$ litres.",
      },
      {
        label: "c",
        marks: 2,
        content: "Orange juice costs $\\$4.50$ per litre, pineapple juice $\\$3.80$ per litre and soda water $\\$1.20$ per litre. Calculate the total cost of ingredients for $20$ litres of punch.",
        solution: "**Step 1 (1 mark):** Pineapple: $2 \\times 2 = 4$ L. Soda: $5 \\times 2 = 10$ L.\n\n**Step 2 (1 mark):** Cost: $6 \\times \\$4.50 + 4 \\times \\$3.80 + 10 \\times \\$1.20 = \\$27.00 + \\$15.20 + \\$12.00 = \\$54.20$.",
      },
    ],
  ),
  ea(
    "Two families are planning a road trip from Melbourne to Brisbane (approximately $1\\,680$ km).",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Family A's car uses $6.5$ L per $100$ km. Calculate the litres of petrol they will need for the trip.",
        solution: "**Step 1 (1 mark):** $\\dfrac{6.5}{100} \\times 1\\,680 = 109.2$ L.",
      },
      {
        label: "b",
        marks: 1,
        content: "Family B's car uses $8.2$ L per $100$ km. Calculate the litres of petrol they will need.",
        solution: "**Step 1 (1 mark):** $\\dfrac{8.2}{100} \\times 1\\,680 = 137.76$ L.",
      },
      {
        label: "c",
        marks: 2,
        content: "Petrol costs $\\$1.90$ per litre. Calculate the petrol cost for each family, correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** Family A: $109.2 \\times \\$1.90 = \\$207.48$.\n\n**Step 2 (1 mark):** Family B: $137.76 \\times \\$1.90 = \\$261.74$ (to the nearest cent).",
      },
    ],
  ),
  ea(
    "A bakery in Sydney sells two sizes of sourdough loaf. The small loaf weighs $450$ g and costs $\\$6.30$. The large loaf weighs $750$ g and costs $\\$9.75$.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the unit price per $100$ g for each loaf, correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** Small: $\\dfrac{\\$6.30}{450} \\times 100 = \\$1.40$ per $100$ g.\n\n**Step 2 (1 mark):** Large: $\\dfrac{\\$9.75}{750} \\times 100 = \\$1.30$ per $100$ g.",
      },
      {
        label: "b",
        marks: 1,
        content: "Which loaf offers the better unit price?",
        solution: "**Step 1 (1 mark):** The large loaf is cheaper per $100$ g ($\\$1.30$ vs $\\$1.40$), so it offers better value.",
      },
      {
        label: "c",
        marks: 2,
        content: "A customer needs $3$ kg of bread for a party. Compare buying $7$ small loaves ($3.15$ kg) versus $4$ large loaves ($3.00$ kg). Calculate the total cost of each option.",
        solution: "**Step 1 (1 mark):** $7$ small: $7 \\times \\$6.30 = \\$44.10$.\n\n**Step 2 (1 mark):** $4$ large: $4 \\times \\$9.75 = \\$39.00$. The large-loaf option is cheaper by $\\$5.10$.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`ratios-and-rates: wrote ${items.length} items to ${OUT}`);
