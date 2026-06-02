/**
 * Foundation generator: area-and-perimeter (modelling-rich)
 *
 * 14 MCQ + 11 SHORT + 3 EXT_ANS + 2 EXT_RESP = 30 items.
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/area-and-perimeter.json");

const TOPIC = "space-and-measurement";
const SUB = "area-and-perimeter";

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
    "A rectangular kitchen bench is $2.4$ m long and $0.6$ m wide. Its area is:",
    ["$1.20\\text{ m}^2$", "$1.44\\text{ m}^2$", "$3.00\\text{ m}^2$", "$6.00\\text{ m}^2$"],
    "B",
    "EASY",
    "Area $= 2.4 \\times 0.6 = 1.44\\text{ m}^2$.\n\n**Answer: B**",
  ),
  mcq(
    "The perimeter of a rectangular paddock that is $80$ m by $35$ m is:",
    ["$115\\text{ m}$", "$200\\text{ m}$", "$230\\text{ m}$", "$2800\\text{ m}$"],
    "C",
    "EASY",
    "Perimeter $= 2(80 + 35) = 2 \\times 115 = 230\\text{ m}$.\n\n**Answer: C**",
  ),
  mcq(
    "A square pavers patio has a side length of $3.5$ m. Its area is:",
    ["$7.00\\text{ m}^2$", "$10.50\\text{ m}^2$", "$12.25\\text{ m}^2$", "$14.00\\text{ m}^2$"],
    "C",
    "EASY",
    "Area $= 3.5^2 = 12.25\\text{ m}^2$.\n\n**Answer: C**",
  ),
  mcq(
    "A triangular sail has a base of $4$ m and a perpendicular height of $3$ m. Its area is:",
    ["$3.5\\text{ m}^2$", "$6.0\\text{ m}^2$", "$7.0\\text{ m}^2$", "$12.0\\text{ m}^2$"],
    "B",
    "EASY",
    "Area $= \\tfrac{1}{2} \\times 4 \\times 3 = 6\\text{ m}^2$.\n\n**Answer: B**",
  ),
  mcq(
    "A circular garden bed has a radius of $1.5$ m. Its area, to two decimal places, is closest to (use $\\pi \\approx 3.14$):",
    ["$4.71\\text{ m}^2$", "$7.07\\text{ m}^2$", "$9.42\\text{ m}^2$", "$2.25\\text{ m}^2$"],
    "B",
    "EASY",
    "Area $= \\pi r^2 = 3.14 \\times 1.5^2 = 3.14 \\times 2.25 = 7.065 \\approx 7.07\\text{ m}^2$.\n\n**Answer: B**",
  ),
  mcq(
    "A rectangular lawn measures $12$ m by $8$ m. The amount of edging needed to enclose the lawn is:",
    ["$20\\text{ m}$", "$40\\text{ m}$", "$48\\text{ m}$", "$96\\text{ m}$"],
    "B",
    "EASY",
    "Edging is the perimeter: $2(12 + 8) = 40\\text{ m}$.\n\n**Answer: B**",
  ),
  mcq(
    "A circle has a diameter of $20$ cm. Its circumference, using $\\pi \\approx 3.14$, is closest to:",
    ["$31.4\\text{ cm}$", "$62.8\\text{ cm}$", "$125.6\\text{ cm}$", "$314\\text{ cm}$"],
    "B",
    "EASY",
    "Circumference $= \\pi d = 3.14 \\times 20 = 62.8\\text{ cm}$.\n\n**Answer: B**",
  ),
  mcq(
    "An L-shaped courtyard is formed by joining a $5$ m by $4$ m rectangle and a $3$ m by $2$ m rectangle. The total area is:",
    ["$14\\text{ m}^2$", "$20\\text{ m}^2$", "$26\\text{ m}^2$", "$40\\text{ m}^2$"],
    "C",
    "MEDIUM",
    "Area $= (5 \\times 4) + (3 \\times 2) = 20 + 6 = 26\\text{ m}^2$.\n\n**Answer: C**",
  ),
  mcq(
    "A trapezium-shaped garden has parallel sides of $6$ m and $10$ m and a perpendicular distance of $4$ m between them. Its area is:",
    ["$16\\text{ m}^2$", "$24\\text{ m}^2$", "$32\\text{ m}^2$", "$40\\text{ m}^2$"],
    "C",
    "MEDIUM",
    "Area $= \\tfrac{1}{2}(a + b)h = \\tfrac{1}{2}(6 + 10) \\times 4 = \\tfrac{1}{2} \\times 16 \\times 4 = 32\\text{ m}^2$.\n\n**Answer: C**",
  ),
  mcq(
    "Paint is sold in $4$-L tins, each covering $16\\text{ m}^2$. A wall measuring $6$ m by $2.5$ m requires:",
    ["$1$ tin", "$2$ tins", "$3$ tins", "$4$ tins"],
    "A",
    "MEDIUM",
    "Wall area: $6 \\times 2.5 = 15\\text{ m}^2$. One tin covers $16\\text{ m}^2$, so $1$ tin is enough.\n\n**Answer: A**",
  ),
  mcq(
    "A rectangular swimming pool is $12$ m long and $5$ m wide. A $1$ m wide concrete path is built around the pool. The area of the path is:",
    ["$34\\text{ m}^2$", "$38\\text{ m}^2$", "$60\\text{ m}^2$", "$98\\text{ m}^2$"],
    "B",
    "MEDIUM",
    "Pool area: $12 \\times 5 = 60\\text{ m}^2$. Outer rectangle (including path): $(12 + 2) \\times (5 + 2) = 14 \\times 7 = 98\\text{ m}^2$. Path area: $98 - 60 = 38\\text{ m}^2$.\n\n**Answer: B**",
  ),
  mcq(
    "Carpet costs $\\$48$ per square metre. The cost of carpeting a room that is $4.5$ m by $3$ m is:",
    ["$\\$360.00$", "$\\$540.00$", "$\\$648.00$", "$\\$720.00$"],
    "C",
    "MEDIUM",
    "Area: $4.5 \\times 3 = 13.5\\text{ m}^2$. Cost: $13.5 \\times \\$48 = \\$648$.\n\n**Answer: C**",
  ),
  mcq(
    "A semicircular flower bed has a diameter of $4$ m. Its area, using $\\pi \\approx 3.14$, is closest to:",
    ["$6.28\\text{ m}^2$", "$12.56\\text{ m}^2$", "$3.14\\text{ m}^2$", "$25.12\\text{ m}^2$"],
    "A",
    "HARD",
    "Radius $= 2$ m. Full circle area: $\\pi \\times 2^2 = 12.56\\text{ m}^2$. Semicircle: $12.56 \\div 2 = 6.28\\text{ m}^2$.\n\n**Answer: A**",
  ),
  mcq(
    "A rectangular sticker is $80$ mm long and $50$ mm wide. Its area in square centimetres is:",
    ["$13\\text{ cm}^2$", "$40\\text{ cm}^2$", "$130\\text{ cm}^2$", "$400\\text{ cm}^2$"],
    "B",
    "HARD",
    "Convert: $80\\text{ mm} = 8\\text{ cm}$ and $50\\text{ mm} = 5\\text{ cm}$. Area: $8 \\times 5 = 40\\text{ cm}^2$.\n\n**Answer: B**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "Calculate the perimeter of a rectangular vegetable plot that is $6$ m long and $2.5$ m wide.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $P = 2(6 + 2.5) = 2 \\times 8.5 = 17\\text{ m}$.",
  ),
  sa(
    "A square room has a side length of $4.2$ m. Calculate its area.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $A = 4.2^2 = 17.64\\text{ m}^2$.",
  ),
  sa(
    "Calculate the area of a rectangular driveway that is $9$ m long and $3.2$ m wide.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $A = 9 \\times 3.2 = 28.8\\text{ m}^2$.",
  ),
  sa(
    "A triangular sandpit has a base of $2.4$ m and a perpendicular height of $1.5$ m. Calculate its area.",
    2,
    "EASY",
    "**Step 1 (1 mark):** $A = \\tfrac{1}{2} \\times b \\times h = \\tfrac{1}{2} \\times 2.4 \\times 1.5$.\n\n**Step 2 (1 mark):** $A = 1.8\\text{ m}^2$.",
  ),
  sa(
    "A circular tabletop has a radius of $0.6$ m. Calculate its area, using $\\pi \\approx 3.14$, correct to two decimal places.",
    2,
    "EASY",
    "**Step 1 (1 mark):** $A = \\pi r^2 = 3.14 \\times 0.6^2 = 3.14 \\times 0.36$.\n\n**Step 2 (1 mark):** $A = 1.1304 \\approx 1.13\\text{ m}^2$.",
  ),
  sa(
    "A rectangular living room is $5.4$ m by $4.2$ m. Calculate the cost of carpeting the floor at $\\$65$ per square metre.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Area: $5.4 \\times 4.2 = 22.68\\text{ m}^2$.\n\n**Step 2 (1 mark):** Cost: $22.68 \\times \\$65 = \\$1\\,474.20$.",
  ),
  sa(
    "A garden path has the shape of a trapezium with parallel sides of $3.0$ m and $4.5$ m and a perpendicular height of $2$ m. Calculate the area of the path.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** $A = \\tfrac{1}{2}(a + b)h = \\tfrac{1}{2}(3.0 + 4.5) \\times 2$.\n\n**Step 2 (1 mark):** $A = \\tfrac{1}{2} \\times 7.5 \\times 2 = 7.5\\text{ m}^2$.",
  ),
  sa(
    "An L-shaped patio is formed by joining a $4$ m by $3$ m rectangle and a $2$ m by $1.5$ m rectangle. Calculate the total area.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Areas: $4 \\times 3 = 12\\text{ m}^2$ and $2 \\times 1.5 = 3\\text{ m}^2$.\n\n**Step 2 (1 mark):** Total: $12 + 3 = 15\\text{ m}^2$.",
  ),
  sa(
    "A circular pool has a diameter of $6$ m. Calculate the circumference of the pool, using $\\pi \\approx 3.14$.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** $C = \\pi d = 3.14 \\times 6$.\n\n**Step 2 (1 mark):** $C = 18.84\\text{ m}$.",
  ),
  sa(
    "A rectangular advertising sign measures $1\\,200$ mm by $800$ mm. Calculate its area in square metres.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Convert to metres: $1\\,200\\text{ mm} = 1.2\\text{ m}$ and $800\\text{ mm} = 0.8\\text{ m}$.\n\n**Step 2 (1 mark):** Area: $1.2 \\times 0.8$.\n\n**Step 3 (1 mark):** $A = 0.96\\text{ m}^2$.",
  ),
  sa(
    "A semicircular lawn has a straight edge of $8$ m (the diameter). Calculate the area of the lawn, using $\\pi \\approx 3.14$, correct to two decimal places.",
    3,
    "HARD",
    "**Step 1 (1 mark):** Radius $= 8 \\div 2 = 4\\text{ m}$.\n\n**Step 2 (1 mark):** Full circle area: $\\pi r^2 = 3.14 \\times 4^2 = 3.14 \\times 16 = 50.24\\text{ m}^2$.\n\n**Step 3 (1 mark):** Semicircle: $50.24 \\div 2 = 25.12\\text{ m}^2$.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "Liam is laying new turf in a rectangular backyard that measures $14$ m by $9$ m. Turf is sold by the square metre.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the area of the backyard.",
        solution: "**Step 1 (1 mark):** $A = 14 \\times 9 = 126\\text{ m}^2$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Turf costs $\\$12.50$ per square metre. Calculate the total cost of the turf.",
        solution: "**Step 1 (1 mark):** Multiply area by rate: $126 \\times \\$12.50$.\n\n**Step 2 (1 mark):** Total: $\\$1\\,575.00$.",
      },
      {
        label: "c",
        marks: 1,
        content: "Liam also needs to install timber edging around the entire backyard. Calculate the length of edging required.",
        solution: "**Step 1 (1 mark):** Perimeter $= 2(14 + 9) = 46\\text{ m}$.",
      },
    ],
  ),
  ea(
    "A rectangular sports field is $80$ m long and $50$ m wide. A circular discus throwing area is marked out at one end with a radius of $3$ m.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the area of the entire sports field.",
        solution: "**Step 1 (1 mark):** $A = 80 \\times 50 = 4\\,000\\text{ m}^2$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the area of the circular throwing area, using $\\pi \\approx 3.14$, correct to two decimal places.",
        solution: "**Step 1 (1 mark):** $A = \\pi r^2 = 3.14 \\times 3^2$.\n\n**Step 2 (1 mark):** $A = 3.14 \\times 9 = 28.26\\text{ m}^2$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the area of the playable region (the field with the throwing area removed), correct to two decimal places.",
        solution: "**Step 1 (1 mark):** Subtract circle area from field area.\n\n**Step 2 (1 mark):** $4\\,000 - 28.26 = 3\\,971.74\\text{ m}^2$.",
      },
    ],
  ),
  ea(
    "A rectangular bedroom measures $4.8$ m by $3.5$ m. The floor is to be carpeted, and the walls are to be painted. The room is $2.4$ m high. There are no doors or windows to subtract.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the floor area of the room.",
        solution: "**Step 1 (1 mark):** $A = 4.8 \\times 3.5$.\n\n**Step 2 (1 mark):** $A = 16.8\\text{ m}^2$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the total area of the four walls.",
        solution: "**Step 1 (1 mark):** Wall perimeter: $2(4.8 + 3.5) = 16.6\\text{ m}$.\n\n**Step 2 (1 mark):** Wall area: $16.6 \\times 2.4 = 39.84\\text{ m}^2$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Carpet costs $\\$58$ per square metre. Calculate the total carpet cost, rounded up to the nearest dollar.",
        solution: "**Step 1 (1 mark):** Cost: $16.8 \\times \\$58 = \\$974.40$.\n\n**Step 2 (1 mark):** Rounded up: $\\$975$.",
      },
    ],
  ),

  // ── EXTENDED_RESPONSE (2) ───────────────────────────────────────────
  er(
    "Mia is renovating a rectangular courtyard at her house in Melbourne. The courtyard measures $8$ m long by $5$ m wide. She is planning the following:\n\n- Pave the entire courtyard with concrete pavers (cost: $\\$95$ per square metre, supplied and laid).\n- Install a circular feature pond with a radius of $1.2$ m in the middle of the courtyard (pavers will not be laid in this area).\n- Build a timber fence around the perimeter of the courtyard (cost: $\\$140$ per metre).",
    "HARD",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the total area of the courtyard.",
        solution: "**Step 1 (1 mark):** $A = 8 \\times 5$.\n\n**Step 2 (1 mark):** $A = 40\\text{ m}^2$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the area of the circular pond, using $\\pi \\approx 3.14$, correct to two decimal places.",
        solution: "**Step 1 (1 mark):** $A = \\pi r^2 = 3.14 \\times 1.2^2 = 3.14 \\times 1.44$.\n\n**Step 2 (1 mark):** $A = 4.5216 \\approx 4.52\\text{ m}^2$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the area to be paved (the courtyard with the pond removed), correct to two decimal places.",
        solution: "**Step 1 (1 mark):** Subtract pond area from courtyard.\n\n**Step 2 (1 mark):** $40 - 4.52 = 35.48\\text{ m}^2$.",
      },
      {
        label: "d",
        marks: 2,
        content: "Calculate the cost of the pavers (to the area calculated in part c), correct to the nearest cent.",
        solution: "**Step 1 (1 mark):** Cost: $35.48 \\times \\$95$.\n\n**Step 2 (1 mark):** $= \\$3\\,370.60$.",
      },
      {
        label: "e",
        marks: 2,
        content: "Calculate the cost of the timber fence around the courtyard.",
        solution: "**Step 1 (1 mark):** Perimeter: $2(8 + 5) = 26\\text{ m}$.\n\n**Step 2 (1 mark):** Cost: $26 \\times \\$140 = \\$3\\,640$.",
      },
    ],
  ),
  er(
    "A community group is planning a rectangular dog park in Sydney. The site available is $30$ m long by $20$ m wide. They plan to fence the entire perimeter and cover the inside with a soft grass surface. A circular shaded shelter (radius $2.5$ m) will be installed inside the park; this area will not be grassed.",
    "HARD",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the total area of the dog park.",
        solution: "**Step 1 (1 mark):** $A = 30 \\times 20$.\n\n**Step 2 (1 mark):** $A = 600\\text{ m}^2$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the area of the circular shelter, using $\\pi \\approx 3.14$, correct to two decimal places.",
        solution: "**Step 1 (1 mark):** $A = \\pi r^2 = 3.14 \\times 2.5^2 = 3.14 \\times 6.25$.\n\n**Step 2 (1 mark):** $A = 19.625 \\approx 19.63\\text{ m}^2$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Hence calculate the area to be grassed (the dog park area with the shelter removed), correct to two decimal places.",
        solution: "**Step 1 (1 mark):** Subtract shelter area from park area.\n\n**Step 2 (1 mark):** $600 - 19.63 = 580.37\\text{ m}^2$.",
      },
      {
        label: "d",
        marks: 2,
        content: "Soft grass costs $\\$22$ per square metre to install. Calculate the cost of grassing the park, correct to the nearest dollar.",
        solution: "**Step 1 (1 mark):** Cost: $580.37 \\times \\$22 = \\$12\\,768.14$.\n\n**Step 2 (1 mark):** Rounded: $\\$12\\,768$.",
      },
      {
        label: "e",
        marks: 2,
        content: "The fencing costs $\\$85$ per metre. Calculate the total cost of fencing the perimeter of the dog park.",
        solution: "**Step 1 (1 mark):** Perimeter: $2(30 + 20) = 100\\text{ m}$.\n\n**Step 2 (1 mark):** Cost: $100 \\times \\$85 = \\$8\\,500$.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`area-and-perimeter: wrote ${items.length} items to ${OUT}`);
