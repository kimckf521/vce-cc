/**
 * Foundation generator: maps-and-plans (modelling-rich)
 *
 * 14 MCQ + 11 SHORT + 3 EXT_ANS + 2 EXT_RESP = 30 items.
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/maps-and-plans.json");

const TOPIC = "space-and-measurement";
const SUB = "maps-and-plans";

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
    "A map has a scale of $1\\!:\\!1000$. This means that $1$ cm on the map represents:",
    ["$10$ cm in real life", "$100$ cm in real life", "$1\\,000$ cm in real life", "$10\\,000$ cm in real life"],
    "C",
    "EASY",
    "Scale $1\\!:\\!1000$ means each map unit equals $1000$ real units. So $1$ cm $= 1000$ cm.\n\n**Answer: C**",
  ),
  mcq(
    "On a floor plan with scale $1\\!:\\!50$, a wall measures $8$ cm. The actual length of the wall is:",
    ["$0.4$ m", "$4$ m", "$40$ m", "$400$ m"],
    "B",
    "EASY",
    "Actual length $= 8\\text{ cm} \\times 50 = 400\\text{ cm} = 4\\text{ m}$.\n\n**Answer: B**",
  ),
  mcq(
    "A street map has a scale of $1\\!:\\!10\\,000$. Two parks are $5$ cm apart on the map. The actual distance between them is:",
    ["$50$ m", "$500$ m", "$5\\,000$ m", "$50\\,000$ m"],
    "B",
    "EASY",
    "Actual $= 5\\text{ cm} \\times 10\\,000 = 50\\,000\\text{ cm} = 500\\text{ m}$.\n\n**Answer: B**",
  ),
  mcq(
    "On a building plan with scale $1\\!:\\!100$, an actual room is $4$ m long. Its length on the plan is:",
    ["$2$ cm", "$4$ cm", "$40$ cm", "$400$ cm"],
    "B",
    "EASY",
    "Plan length $= 4\\text{ m} \\div 100 = 0.04\\text{ m} = 4\\text{ cm}$.\n\n**Answer: B**",
  ),
  mcq(
    "A road map uses the scale $1$ cm $= 5$ km. Two towns appear $7$ cm apart on the map. The actual distance is:",
    ["$0.35$ km", "$3.5$ km", "$35$ km", "$350$ km"],
    "C",
    "EASY",
    "Actual distance $= 7 \\times 5 = 35\\text{ km}$.\n\n**Answer: C**",
  ),
  mcq(
    "A garden plan is drawn to a scale of $1\\!:\\!25$. A garden bed is shown as $12$ cm long. Its actual length is:",
    ["$0.3$ m", "$3$ m", "$30$ m", "$300$ m"],
    "B",
    "EASY",
    "Actual length $= 12 \\times 25 = 300\\text{ cm} = 3\\text{ m}$.\n\n**Answer: B**",
  ),
  mcq(
    "A scale drawing uses $1\\!:\\!200$. An object measures $2.4$ m in real life. Its length on the drawing is:",
    ["$1.2$ cm", "$12$ cm", "$120$ cm", "$1.2$ m"],
    "A",
    "MEDIUM",
    "Drawing length $= 2.4\\text{ m} \\div 200 = 0.012\\text{ m} = 1.2\\text{ cm}$.\n\n**Answer: A**",
  ),
  mcq(
    "A map has a scale of $1$ cm represents $250$ m. A bushwalking trail is $4.5$ cm long on the map. Its actual length is:",
    ["$112.5$ m", "$1\\,125$ m", "$11\\,250$ m", "$112\\,500$ m"],
    "B",
    "MEDIUM",
    "Actual $= 4.5 \\times 250 = 1\\,125\\text{ m}$.\n\n**Answer: B**",
  ),
  mcq(
    "On a $1\\!:\\!50$ floor plan, a kitchen measures $6\\text{ cm}$ by $4\\text{ cm}$. The actual floor area of the kitchen is:",
    ["$0.24\\text{ m}^2$", "$2.4\\text{ m}^2$", "$6\\text{ m}^2$", "$60\\text{ m}^2$"],
    "C",
    "MEDIUM",
    "Actual dimensions: $6 \\times 50 = 300\\text{ cm} = 3\\text{ m}$ and $4 \\times 50 = 200\\text{ cm} = 2\\text{ m}$. Area $= 3 \\times 2 = 6\\text{ m}^2$.\n\n**Answer: C**",
  ),
  mcq(
    "A walking map uses the scale $1$ cm $= 250$ m. The legend shows a $3$ cm bar. The bar represents an actual distance of:",
    ["$75$ m", "$250$ m", "$750$ m", "$7\\,500$ m"],
    "C",
    "MEDIUM",
    "Distance $= 3 \\times 250 = 750\\text{ m}$.\n\n**Answer: C**",
  ),
  mcq(
    "A factory floor plan is drawn at $1\\!:\\!200$. The plan shows a rectangular workshop that is $8\\text{ cm}$ by $5\\text{ cm}$. The actual perimeter of the workshop is:",
    ["$13$ m", "$26$ m", "$52$ m", "$80$ m"],
    "C",
    "MEDIUM",
    "Actual dimensions: $8 \\times 200 = 1600\\text{ cm} = 16\\text{ m}$ and $5 \\times 200 = 1000\\text{ cm} = 10\\text{ m}$. Perimeter $= 2(16 + 10) = 52\\text{ m}$.\n\n**Answer: C**",
  ),
  mcq(
    "A road map uses the scale $1\\!:\\!500\\,000$. Two towns are $24$ cm apart on the map. The actual distance between them in kilometres is:",
    ["$12$ km", "$120$ km", "$1\\,200$ km", "$12\\,000$ km"],
    "B",
    "HARD",
    "Actual $= 24 \\times 500\\,000 = 12\\,000\\,000\\text{ cm} = 120\\,000\\text{ m} = 120\\text{ km}$.\n\n**Answer: B**",
  ),
  mcq(
    "A scaled drawing uses $1\\!:\\!40$. A floor area on the drawing measures $50\\text{ cm}^2$. The actual floor area is:",
    ["$2\\,000\\text{ cm}^2$", "$2\\,000\\text{ m}^2$", "$8\\text{ m}^2$", "$80\\text{ m}^2$"],
    "C",
    "HARD",
    "Area scale factor: $40^2 = 1600$. Actual area: $50 \\times 1600 = 80\\,000\\text{ cm}^2 = 8\\text{ m}^2$.\n\n**Answer: C**",
  ),
  mcq(
    "On a map of scale $1\\!:\\!25\\,000$, a hiking trail is shown as $8.4$ cm long. The actual length of the trail in kilometres is:",
    ["$0.21$ km", "$2.1$ km", "$21$ km", "$210$ km"],
    "B",
    "HARD",
    "Actual $= 8.4 \\times 25\\,000 = 210\\,000\\text{ cm} = 2\\,100\\text{ m} = 2.1\\text{ km}$.\n\n**Answer: B**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "A map has scale $1\\!:\\!100$. A length on the map is $7$ cm. Calculate the actual length, in metres.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $7 \\times 100 = 700\\text{ cm} = 7\\text{ m}$.",
  ),
  sa(
    "A scale drawing has scale $1\\!:\\!50$. A wall length is $9$ cm on the drawing. Calculate the actual length of the wall, in metres.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Actual length $= 9 \\times 50 = 450\\text{ cm} = 4.5\\text{ m}$.",
  ),
  sa(
    "A road map uses $1$ cm $= 4$ km. Two towns are $11$ cm apart on the map. Calculate the actual distance in km.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $11 \\times 4 = 44\\text{ km}$.",
  ),
  sa(
    "A floor plan has scale $1\\!:\\!100$. A room is $5.4$ m long in real life. Calculate the length of the room on the plan, in centimetres.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Convert $5.4$ m to cm: $5.4\\text{ m} = 540\\text{ cm}$.\n\n**Step 2 (1 mark):** Plan length $= 540 \\div 100 = 5.4\\text{ cm}$.",
  ),
  sa(
    "A street map has a scale of $1\\!:\\!5\\,000$. Two cafés are shown $3$ cm apart on the map. Calculate the actual distance between them in metres.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Actual $= 3 \\times 5\\,000 = 15\\,000\\text{ cm}$.\n\n**Step 2 (1 mark):** Convert: $15\\,000\\text{ cm} = 150\\text{ m}$.",
  ),
  sa(
    "A garden plan is drawn at $1\\!:\\!25$. A path is $14$ cm long on the plan. Calculate the actual length of the path, in metres.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Actual $= 14 \\times 25 = 350\\text{ cm}$.\n\n**Step 2 (1 mark):** Convert: $350\\text{ cm} = 3.5\\text{ m}$.",
  ),
  sa(
    "A house plan uses scale $1\\!:\\!100$. A kitchen on the plan measures $4.2\\text{ cm}$ by $3.0\\text{ cm}$. Calculate the actual area of the kitchen, in square metres.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Actual length $= 4.2 \\times 100 = 420\\text{ cm} = 4.2\\text{ m}$. Actual width $= 3.0 \\times 100 = 300\\text{ cm} = 3.0\\text{ m}$.\n\n**Step 2 (1 mark):** Area $= 4.2 \\times 3.0$.\n\n**Step 3 (1 mark):** $A = 12.6\\text{ m}^2$.",
  ),
  sa(
    "A scaled map uses $1\\!:\\!20\\,000$. A bike trail is $14$ cm long on the map. Calculate the actual length of the trail in kilometres.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Actual $= 14 \\times 20\\,000 = 280\\,000\\text{ cm}$.\n\n**Step 2 (1 mark):** Convert: $280\\,000\\text{ cm} = 2\\,800\\text{ m} = 2.8\\text{ km}$.",
  ),
  sa(
    "On a road map, the scale is $1$ cm represents $25$ km. Two regional towns are $4.6$ cm apart on the map. Calculate the actual driving distance between them in kilometres.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Multiply: $4.6 \\times 25$.\n\n**Step 2 (1 mark):** Distance $= 115\\text{ km}$.",
  ),
  sa(
    "A building plan uses scale $1\\!:\\!200$. An actual room is $8$ m long. Calculate the length of the room on the plan, in centimetres.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Convert: $8\\text{ m} = 800\\text{ cm}$.\n\n**Step 2 (1 mark):** Plan length $= 800 \\div 200 = 4\\text{ cm}$.",
  ),
  sa(
    "A topographic map has a scale of $1\\!:\\!50\\,000$. On the map, a straight road appears as $9.2$ cm long. Calculate the actual length of the road in kilometres.",
    3,
    "HARD",
    "**Step 1 (1 mark):** Actual $= 9.2 \\times 50\\,000 = 460\\,000\\text{ cm}$.\n\n**Step 2 (1 mark):** Convert cm to m: $460\\,000\\text{ cm} = 4\\,600\\text{ m}$.\n\n**Step 3 (1 mark):** Convert m to km: $4\\,600\\text{ m} = 4.6\\text{ km}$.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "Sienna is reading a floor plan of a new home. The scale is $1\\!:\\!100$. On the plan, the living room is shown as a rectangle measuring $6\\text{ cm}$ by $4.5\\text{ cm}$.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the actual dimensions of the living room in metres.",
        solution: "**Step 1 (1 mark):** Length $= 6 \\times 100 = 600\\text{ cm} = 6\\text{ m}$.\n\n**Step 2 (1 mark):** Width $= 4.5 \\times 100 = 450\\text{ cm} = 4.5\\text{ m}$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the actual floor area of the living room, in square metres.",
        solution: "**Step 1 (1 mark):** $A = 6 \\times 4.5$.\n\n**Step 2 (1 mark):** $A = 27\\text{ m}^2$.",
      },
      {
        label: "c",
        marks: 1,
        content: "Calculate the perimeter of the living room, in metres.",
        solution: "**Step 1 (1 mark):** $P = 2(6 + 4.5) = 21\\text{ m}$.",
      },
    ],
  ),
  ea(
    "A road map has a scale of $1\\!:\\!100\\,000$. The straight-line distance between two regional towns measures $7.5$ cm on the map.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the straight-line distance between the two towns, in kilometres.",
        solution: "**Step 1 (1 mark):** Actual $= 7.5 \\times 100\\,000 = 750\\,000\\text{ cm}$.\n\n**Step 2 (1 mark):** Convert: $750\\,000\\text{ cm} = 7\\,500\\text{ m} = 7.5\\text{ km}$.",
      },
      {
        label: "b",
        marks: 2,
        content: "The driving route between the two towns is $25\\%$ longer than the straight-line distance. Calculate the actual driving distance, in kilometres.",
        solution: "**Step 1 (1 mark):** Increase: $25\\%$ of $7.5\\text{ km} = 1.875\\text{ km}$.\n\n**Step 2 (1 mark):** Driving distance $= 7.5 + 1.875 = 9.375\\text{ km}$.",
      },
      {
        label: "c",
        marks: 1,
        content: "A driver travels at an average speed of $60\\text{ km/h}$. Calculate the time, in minutes, to drive between the two towns. Round to the nearest minute.",
        solution: "**Step 1 (1 mark):** Time $= \\dfrac{9.375}{60} \\text{ h} = 0.15625\\text{ h} = 0.15625 \\times 60 = 9.375\\text{ min}$, rounded to $9$ min.",
      },
    ],
  ),
  ea(
    "A garden landscaper produces a plan of a backyard at scale $1\\!:\\!50$. On the plan, the lawn is shown as a rectangle measuring $12\\text{ cm}$ by $8\\text{ cm}$.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the actual dimensions of the lawn, in metres.",
        solution: "**Step 1 (1 mark):** Length $= 12 \\times 50 = 600\\text{ cm} = 6\\text{ m}$.\n\n**Step 2 (1 mark):** Width $= 8 \\times 50 = 400\\text{ cm} = 4\\text{ m}$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the actual area of the lawn, in square metres.",
        solution: "**Step 1 (1 mark):** $A = 6 \\times 4$.\n\n**Step 2 (1 mark):** $A = 24\\text{ m}^2$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Turf costs $\\$14$ per square metre. Calculate the cost of turfing the entire lawn.",
        solution: "**Step 1 (1 mark):** Cost $= 24 \\times \\$14$.\n\n**Step 2 (1 mark):** $= \\$336.00$.",
      },
    ],
  ),

  // ── EXTENDED_RESPONSE (2) ───────────────────────────────────────────
  er(
    "Daniel is planning the layout for a new café. The floor plan is drawn to a scale of $1\\!:\\!50$. On the plan:\n\n- The total floor space is a rectangle measuring $20\\text{ cm}$ by $14\\text{ cm}$.\n- The kitchen takes up a corner rectangle of $8\\text{ cm}$ by $6\\text{ cm}$.\n- The remaining area is the dining floor for tables.",
    "HARD",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the actual dimensions of the total floor space, in metres.",
        solution: "**Step 1 (1 mark):** Length $= 20 \\times 50 = 1\\,000\\text{ cm} = 10\\text{ m}$.\n\n**Step 2 (1 mark):** Width $= 14 \\times 50 = 700\\text{ cm} = 7\\text{ m}$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the actual area of the total floor space, in square metres.",
        solution: "**Step 1 (1 mark):** $A = 10 \\times 7$.\n\n**Step 2 (1 mark):** $A = 70\\text{ m}^2$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the actual area of the kitchen, in square metres.",
        solution: "**Step 1 (1 mark):** Kitchen length $= 8 \\times 50 = 400\\text{ cm} = 4\\text{ m}$. Kitchen width $= 6 \\times 50 = 300\\text{ cm} = 3\\text{ m}$.\n\n**Step 2 (1 mark):** $A = 4 \\times 3 = 12\\text{ m}^2$.",
      },
      {
        label: "d",
        marks: 2,
        content: "Calculate the actual area of the dining floor (total minus kitchen), in square metres.",
        solution: "**Step 1 (1 mark):** Subtract kitchen from total.\n\n**Step 2 (1 mark):** Dining area $= 70 - 12 = 58\\text{ m}^2$.",
      },
      {
        label: "e",
        marks: 2,
        content: "Each table needs about $2.5\\text{ m}^2$ of dining space. Calculate the maximum whole number of tables that can fit on the dining floor.",
        solution: "**Step 1 (1 mark):** $58 \\div 2.5 = 23.2$.\n\n**Step 2 (1 mark):** Maximum whole number of tables $= 23$.",
      },
    ],
  ),
  er(
    "A council has produced a map of a town park at a scale of $1\\!:\\!1000$. On the map:\n\n- The park boundary is a rectangle of $18\\text{ cm}$ by $12\\text{ cm}$.\n- A rectangular playground inside is $4\\text{ cm}$ by $3\\text{ cm}$.\n- A walking path runs straight from one corner to the diagonally opposite corner of the playground, measuring $5\\text{ cm}$ on the map.",
    "HARD",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the actual dimensions of the park, in metres.",
        solution: "**Step 1 (1 mark):** Length $= 18 \\times 1000 = 18\\,000\\text{ cm} = 180\\text{ m}$.\n\n**Step 2 (1 mark):** Width $= 12 \\times 1000 = 12\\,000\\text{ cm} = 120\\text{ m}$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the actual area of the park, in square metres.",
        solution: "**Step 1 (1 mark):** $A = 180 \\times 120$.\n\n**Step 2 (1 mark):** $A = 21\\,600\\text{ m}^2$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the actual area of the playground, in square metres.",
        solution: "**Step 1 (1 mark):** Playground length $= 4 \\times 1000 = 4\\,000\\text{ cm} = 40\\text{ m}$. Playground width $= 3 \\times 1000 = 3\\,000\\text{ cm} = 30\\text{ m}$.\n\n**Step 2 (1 mark):** $A = 40 \\times 30 = 1\\,200\\text{ m}^2$.",
      },
      {
        label: "d",
        marks: 2,
        content: "Calculate the actual length of the walking path (the diagonal), in metres.",
        solution: "**Step 1 (1 mark):** Multiply map length by scale: $5 \\times 1000 = 5\\,000\\text{ cm}$.\n\n**Step 2 (1 mark):** Convert: $5\\,000\\text{ cm} = 50\\text{ m}$.",
      },
      {
        label: "e",
        marks: 2,
        content: "The council plans to install grass around the playground (i.e. the park area minus the playground). Grass costs $\\$8$ per square metre. Calculate the cost of grassing this area.",
        solution: "**Step 1 (1 mark):** Grassed area: $21\\,600 - 1\\,200 = 20\\,400\\text{ m}^2$.\n\n**Step 2 (1 mark):** Cost $= 20\\,400 \\times \\$8 = \\$163\\,200$.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`maps-and-plans: wrote ${items.length} items to ${OUT}`);
