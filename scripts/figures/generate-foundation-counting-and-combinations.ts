/**
 * Foundation generator: counting-and-combinations
 *
 * Core-drill + extended-fit. 14 MCQ + 11 SHORT + 3 EXTENDED_ANSWER = 28 items.
 * Informal counting via multiplication principle, listing, basic combinations
 * (no nCr formula required — counted by inspection/listing).
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/counting-and-combinations.json");

const TOPIC = "discrete-mathematics";
const SUB = "counting-and-combinations";

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
    "A cafe offers $4$ types of bread and $3$ types of filling for a sandwich. How many different one-bread, one-filling sandwiches are possible?",
    ["$7$", "$10$", "$12$", "$15$"],
    "C",
    "EASY",
    "Multiplication principle: $4 \\times 3 = 12$.\n\n**Answer: C**",
  ),
  mcq(
    "A school uniform has $3$ shirt colours and $2$ pants colours. How many shirt-pants combinations are possible?",
    ["$3$", "$5$", "$6$", "$8$"],
    "C",
    "EASY",
    "$3 \\times 2 = 6$ combinations.\n\n**Answer: C**",
  ),
  mcq(
    "Tom is choosing one main, one drink, and one dessert from a menu. There are $5$ mains, $4$ drinks, and $3$ desserts. The total number of possible meals is:",
    ["$12$", "$30$", "$45$", "$60$"],
    "D",
    "EASY",
    "Multiplication principle: $5 \\times 4 \\times 3 = 60$.\n\n**Answer: D**",
  ),
  mcq(
    "A combination padlock has $4$ wheels, each showing the digits $0$ to $9$. The total number of possible codes is:",
    ["$40$", "$1\\,000$", "$10\\,000$", "$100\\,000$"],
    "C",
    "EASY",
    "Each wheel has $10$ digits and there are $4$ wheels: $10 \\times 10 \\times 10 \\times 10 = 10\\,000$.\n\n**Answer: C**",
  ),
  mcq(
    "How many different two-letter codes can be made using letters A, B, C and D if letters can be repeated?",
    ["$8$", "$12$", "$16$", "$24$"],
    "C",
    "EASY",
    "Each position has $4$ choices: $4 \\times 4 = 16$.\n\n**Answer: C**",
  ),
  mcq(
    "Mia has $5$ different books on her shelf. In how many different orders can she line them up?",
    ["$25$", "$60$", "$100$", "$120$"],
    "D",
    "MEDIUM",
    "$5 \\times 4 \\times 3 \\times 2 \\times 1 = 120$ orders.\n\n**Answer: D**",
  ),
  mcq(
    "A pizza shop offers $6$ toppings. A customer chooses any $2$ different toppings (order does not matter). How many pairs of toppings are possible?",
    ["$12$", "$15$", "$20$", "$30$"],
    "B",
    "MEDIUM",
    "List the pairs: with $6$ toppings, the number of unordered pairs is $\\dfrac{6 \\times 5}{2} = 15$.\n\n**Answer: B**",
  ),
  mcq(
    "A car number plate has $3$ letters followed by $3$ digits. Letters and digits may repeat. The total number of possible plates is:",
    ["$26^3 \\times 10^3 = 17\\,576\\,000$", "$26 \\times 3 + 10 \\times 3 = 108$", "$26^3 + 10^3 = 18\\,576$", "$36^6$"],
    "A",
    "MEDIUM",
    "$3$ letters: $26 \\times 26 \\times 26 = 17\\,576$ combinations. $3$ digits: $10 \\times 10 \\times 10 = 1\\,000$. Total: $17\\,576 \\times 1\\,000 = 17\\,576\\,000$.\n\n**Answer: A**",
  ),
  mcq(
    "How many three-digit numbers can be made using the digits $1$, $2$, $3$, $4$, $5$ if no digit is repeated?",
    ["$15$", "$60$", "$125$", "$120$"],
    "B",
    "MEDIUM",
    "First digit: $5$ choices. Second: $4$ choices. Third: $3$ choices. Total: $5 \\times 4 \\times 3 = 60$.\n\n**Answer: B**",
  ),
  mcq(
    "A class of $4$ students will choose a captain and a vice-captain (two different students). How many different captain–vice-captain orderings are possible?",
    ["$4$", "$6$", "$12$", "$16$"],
    "C",
    "MEDIUM",
    "Captain: $4$ choices. Vice-captain: $3$ remaining. $4 \\times 3 = 12$.\n\n**Answer: C**",
  ),
  mcq(
    "A meal deal at a Melbourne cafe offers $3$ sandwiches, $2$ sides, and $4$ drinks. The total number of meal deals is:",
    ["$9$", "$14$", "$18$", "$24$"],
    "D",
    "MEDIUM",
    "$3 \\times 2 \\times 4 = 24$ meal deals.\n\n**Answer: D**",
  ),
  mcq(
    "A four-digit PIN uses digits from $0$ to $9$ and may have repeated digits, but the first digit cannot be $0$. The total number of possible PINs is:",
    ["$5\\,040$", "$9\\,000$", "$9\\,999$", "$10\\,000$"],
    "B",
    "MEDIUM",
    "First digit: $9$ choices (1–9). Each of the other three: $10$ choices. Total: $9 \\times 10 \\times 10 \\times 10 = 9\\,000$.\n\n**Answer: B**",
  ),
  mcq(
    "A school cricket team must pick $3$ batters from $5$ available players (order of selection does not matter). How many different groups of $3$ batters can be chosen?",
    ["$8$", "$10$", "$15$", "$60$"],
    "B",
    "HARD",
    "List groups: with $5$ players choose any $3$, the count is $\\dfrac{5 \\times 4 \\times 3}{3 \\times 2 \\times 1} = 10$.\n\n**Answer: B**",
  ),
  mcq(
    "A travel agent has $4$ flights from Melbourne to Sydney and $3$ flights from Sydney to Brisbane. A traveller wants to fly Melbourne $\\to$ Sydney $\\to$ Brisbane and return by the same route (any flight). The total number of different round-trip itineraries is:",
    ["$7$", "$12$", "$84$", "$144$"],
    "D",
    "HARD",
    "Outbound: $4 \\times 3 = 12$ ways. Return: another $3 \\times 4 = 12$ ways. Total: $12 \\times 12 = 144$.\n\n**Answer: D**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "A school canteen offers $5$ different rolls and $4$ different fillings. How many different one-roll, one-filling combinations can be made?",
    1,
    "EASY",
    "**Step 1 (1 mark):** Multiplication principle: $5 \\times 4 = 20$ combinations.",
  ),
  sa(
    "How many different two-digit numbers can be made using the digits $2$, $5$, $7$ if digits can be repeated?",
    1,
    "EASY",
    "**Step 1 (1 mark):** Each position has $3$ choices: $3 \\times 3 = 9$ numbers.",
  ),
  sa(
    "An ice-cream shop offers $6$ flavours. How many different two-scoop cones can be made if the two scoops must be different flavours and the order of scoops matters (top vs bottom)?",
    1,
    "EASY",
    "**Step 1 (1 mark):** $6 \\times 5 = 30$ different cones.",
  ),
  sa(
    "Lucy is choosing a one-piece outfit. She has $4$ tops and $3$ skirts. How many different top-skirt outfits can she put together?",
    2,
    "EASY",
    "**Step 1 (1 mark):** Multiplication principle gives $4 \\times 3$.\n\n**Step 2 (1 mark):** $= 12$ outfits.",
  ),
  sa(
    "A locker code has $3$ digits, each from $0$ to $9$, and digits may repeat. How many different codes are possible?",
    2,
    "EASY",
    "**Step 1 (1 mark):** Each position has $10$ choices: $10 \\times 10 \\times 10$.\n\n**Step 2 (1 mark):** $= 1\\,000$ codes.",
  ),
  sa(
    "A bookshop has $4$ thriller novels and $5$ romance novels. A reader buys one of each type. How many different pairs of books are possible?",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Thriller choices: $4$. Romance choices: $5$.\n\n**Step 2 (1 mark):** Total pairs: $4 \\times 5 = 20$.",
  ),
  sa(
    "A school team must pick a captain and a vice-captain from $6$ students (no student can hold both roles). How many different captain–vice-captain arrangements are possible?",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Captain: $6$ choices. Vice-captain: $5$ remaining choices.\n\n**Step 2 (1 mark):** Total: $6 \\times 5 = 30$ arrangements.",
  ),
  sa(
    "A take-away menu offers $4$ burgers, $3$ sides, and $5$ drinks. A meal deal consists of one of each. How many different meal deals can be made?",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Multiplication principle gives $4 \\times 3 \\times 5$.\n\n**Step 2 (1 mark):** $= 60$ meal deals.",
  ),
  sa(
    "A four-letter password uses letters from A, B, C, D, E only. Letters may repeat. How many different passwords are possible?",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Each of the $4$ positions has $5$ choices: $5 \\times 5 \\times 5 \\times 5$.\n\n**Step 2 (1 mark):** $= 5^4 = 625$ passwords.",
  ),
  sa(
    "A pizza shop has $5$ different toppings. A customer chooses any $3$ different toppings to make a pizza (order does not matter). List all the possible groups of $3$ toppings using the letters $A, B, C, D, E$, and state how many groups there are in total.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** List the groups systematically: $\\{A,B,C\\}$, $\\{A,B,D\\}$, $\\{A,B,E\\}$, $\\{A,C,D\\}$, $\\{A,C,E\\}$.\n\n**Step 2 (1 mark):** Continue: $\\{A,D,E\\}$, $\\{B,C,D\\}$, $\\{B,C,E\\}$, $\\{B,D,E\\}$, $\\{C,D,E\\}$.\n\n**Step 3 (1 mark):** Total groups: $10$.",
  ),
  sa(
    "A car number plate has the form: $2$ letters followed by $3$ digits (e.g. AB123). Letters and digits may both repeat. How many different number plates are possible?",
    3,
    "HARD",
    "**Step 1 (1 mark):** Letter combinations: $26 \\times 26 = 676$.\n\n**Step 2 (1 mark):** Digit combinations: $10 \\times 10 \\times 10 = 1\\,000$.\n\n**Step 3 (1 mark):** Total plates: $676 \\times 1\\,000 = 676\\,000$.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "A cafe in Brisbane offers a 'build-your-own' brunch deal. Customers must choose one item from each of three columns:\n\n| Main | Side | Drink |\n|---|---|---|\n| Avocado toast | Hash brown | Coffee |\n| Eggs benedict | Bacon | Tea |\n| Pancakes | Sausage | Juice |\n| Bowl of granola | Mushrooms | Smoothie |",
    "EASY",
    [
      {
        label: "a",
        marks: 1,
        content: "How many different brunch deals are possible if a customer chooses one main, one side, and one drink?",
        solution: "**Step 1 (1 mark):** $4 \\times 4 \\times 4 = 64$ different deals.",
      },
      {
        label: "b",
        marks: 2,
        content: "If 'Avocado toast' must always be the main (other choices are free), how many different deals are possible?",
        solution: "**Step 1 (1 mark):** Main is fixed (1 choice). Side: $4$ choices. Drink: $4$ choices.\n\n**Step 2 (1 mark):** $1 \\times 4 \\times 4 = 16$ deals.",
      },
      {
        label: "c",
        marks: 2,
        content: "The cafe adds 'Bagel' as a fifth main option and 'Iced tea' as a fifth drink option (sides remain the same). How many different deals are now possible if a customer chooses one main, one side, and one drink?",
        solution: "**Step 1 (1 mark):** Main: $5$ choices. Side: $4$ choices. Drink: $5$ choices.\n\n**Step 2 (1 mark):** $5 \\times 4 \\times 5 = 100$ deals.",
      },
    ],
  ),
  ea(
    "A school has $5$ Year 11 students who applied for the student council: Anna, Ben, Carla, Dan and Eli. The council needs to pick a President and a Treasurer. No student may hold both roles.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "How many different (President, Treasurer) ordered pairs are possible?",
        solution: "**Step 1 (1 mark):** President: $5$ choices. Treasurer: $4$ remaining. Total: $5 \\times 4 = 20$ pairs.",
      },
      {
        label: "b",
        marks: 2,
        content: "If Anna must be the President, how many different (President, Treasurer) pairs are possible?",
        solution: "**Step 1 (1 mark):** President is fixed (Anna).\n\n**Step 2 (1 mark):** Treasurer: $4$ remaining choices. Total: $1 \\times 4 = 4$ pairs.",
      },
      {
        label: "c",
        marks: 2,
        content: "Instead of two roles, the council picks $2$ general members (no ranking, no roles). List all $10$ possible pairs (using the first letter of each name).",
        solution: "**Step 1 (1 mark):** Pairs with $A$: $\\{A,B\\}, \\{A,C\\}, \\{A,D\\}, \\{A,E\\}$. Pairs with $B$ (not $A$): $\\{B,C\\}, \\{B,D\\}, \\{B,E\\}$.\n\n**Step 2 (1 mark):** Pairs with $C$ (not $A$ or $B$): $\\{C,D\\}, \\{C,E\\}$. Pair with $D$ and $E$: $\\{D,E\\}$. Total $10$ pairs.",
      },
    ],
  ),
  ea(
    "A bike-lock code has $4$ wheels. Each wheel can show any digit from $0$ to $9$.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "How many different codes are possible if digits may repeat?",
        solution: "**Step 1 (1 mark):** $10 \\times 10 \\times 10 \\times 10 = 10\\,000$ codes.",
      },
      {
        label: "b",
        marks: 2,
        content: "If all four digits must be different, how many codes are possible?",
        solution: "**Step 1 (1 mark):** First digit: $10$ choices. Second: $9$. Third: $8$. Fourth: $7$.\n\n**Step 2 (1 mark):** $10 \\times 9 \\times 8 \\times 7 = 5\\,040$ codes.",
      },
      {
        label: "c",
        marks: 2,
        content: "Hassan wants to try every possible code (with no repeated digit restriction). If he can try $1$ code every $5$ seconds, how many hours, to the nearest hour, would it take him to try all of them?",
        solution: "**Step 1 (1 mark):** Total time: $10\\,000 \\times 5 = 50\\,000$ seconds.\n\n**Step 2 (1 mark):** In hours: $\\dfrac{50\\,000}{3\\,600} \\approx 13.89$ hours, or about $14$ hours.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`counting-and-combinations: wrote ${items.length} items to ${OUT}`);
