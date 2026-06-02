/**
 * Foundation generator: surface-area
 * Tier: core-drill + extended-fit (14 MCQ + 11 SHORT + 3 EXT_ANS = 28)
 * Topic: space-and-measurement
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/surface-area.json");

const TOPIC = "space-and-measurement";
const SUB = "surface-area";

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
    "A cube has side length $5$ cm. Its total surface area is:",
    ["$25$ cm$^2$", "$100$ cm$^2$", "$125$ cm$^2$", "$150$ cm$^2$"],
    "D",
    "EASY",
    "A cube has $6$ identical square faces. Surface area $= 6 \\times 5^2 = 6 \\times 25 = 150$ cm$^2$.\n\n**Answer: D**",
  ),
  mcq(
    "A rectangular box measures $4$ cm by $3$ cm by $2$ cm. Its total surface area is:",
    ["$24$ cm$^2$", "$36$ cm$^2$", "$52$ cm$^2$", "$72$ cm$^2$"],
    "C",
    "EASY",
    "Surface area $= 2(4 \\times 3) + 2(4 \\times 2) + 2(3 \\times 2) = 24 + 16 + 12 = 52$ cm$^2$.\n\n**Answer: C**",
  ),
  mcq(
    "The total surface area of a cube with side length $10$ cm is:",
    ["$60$ cm$^2$", "$100$ cm$^2$", "$600$ cm$^2$", "$1\\,000$ cm$^2$"],
    "C",
    "EASY",
    "Surface area $= 6 \\times 10^2 = 600$ cm$^2$.\n\n**Answer: C**",
  ),
  mcq(
    "A cube has a total surface area of $24$ cm$^2$. The side length of the cube is:",
    ["$1$ cm", "$2$ cm", "$3$ cm", "$4$ cm"],
    "B",
    "EASY",
    "$6s^2 = 24$, so $s^2 = 4$ and $s = 2$ cm.\n\n**Answer: B**",
  ),
  mcq(
    "The curved surface area of a cylinder with radius $r$ and height $h$ is given by:",
    ["$\\pi r^2$", "$2\\pi r h$", "$2\\pi r^2 h$", "$\\pi r^2 h$"],
    "B",
    "EASY",
    "Curved surface area of a cylinder is $2\\pi r h$.\n\n**Answer: B**",
  ),
  mcq(
    "A rectangular prism is $6$ cm long, $4$ cm wide, and $3$ cm high. Its total surface area is:",
    ["$72$ cm$^2$", "$84$ cm$^2$", "$108$ cm$^2$", "$144$ cm$^2$"],
    "C",
    "MEDIUM",
    "Surface area $= 2(6 \\times 4) + 2(6 \\times 3) + 2(4 \\times 3) = 48 + 36 + 24 = 108$ cm$^2$.\n\n**Answer: C**",
  ),
  mcq(
    "A closed cylindrical can has radius $5$ cm and height $10$ cm. Using $\\pi \\approx 3.14$, its total surface area is closest to:",
    ["$314$ cm$^2$", "$392$ cm$^2$", "$471$ cm$^2$", "$628$ cm$^2$"],
    "C",
    "MEDIUM",
    "Total SA $= 2\\pi r^2 + 2\\pi r h = 2\\pi(5^2) + 2\\pi(5)(10) = 50\\pi + 100\\pi = 150\\pi \\approx 150 \\times 3.14 = 471$ cm$^2$.\n\n**Answer: C**",
  ),
  mcq(
    "A cube of side $7$ cm has total surface area:",
    ["$49$ cm$^2$", "$196$ cm$^2$", "$294$ cm$^2$", "$343$ cm$^2$"],
    "C",
    "MEDIUM",
    "$6 \\times 7^2 = 6 \\times 49 = 294$ cm$^2$.\n\n**Answer: C**",
  ),
  mcq(
    "An open-top cardboard box has a square base of side $8$ cm and height $5$ cm. The area of cardboard required to make the box is:",
    ["$104$ cm$^2$", "$160$ cm$^2$", "$224$ cm$^2$", "$320$ cm$^2$"],
    "C",
    "MEDIUM",
    "Base: $8 \\times 8 = 64$ cm$^2$. Four sides: $4 \\times (8 \\times 5) = 160$ cm$^2$. Total: $64 + 160 = 224$ cm$^2$.\n\n**Answer: C**",
  ),
  mcq(
    "A closed cylinder has radius $4$ cm and height $10$ cm. Its total surface area, in exact form, is:",
    ["$80\\pi$ cm$^2$", "$96\\pi$ cm$^2$", "$112\\pi$ cm$^2$", "$160\\pi$ cm$^2$"],
    "C",
    "MEDIUM",
    "Total SA $= 2\\pi r^2 + 2\\pi r h = 2\\pi(16) + 2\\pi(4)(10) = 32\\pi + 80\\pi = 112\\pi$ cm$^2$.\n\n**Answer: C**",
  ),
  mcq(
    "A rectangular prism has dimensions $5$ cm by $5$ cm by $8$ cm. Its surface area is:",
    ["$130$ cm$^2$", "$180$ cm$^2$", "$210$ cm$^2$", "$240$ cm$^2$"],
    "C",
    "MEDIUM",
    "Surface area $= 2(5 \\times 5) + 4(5 \\times 8) = 50 + 160 = 210$ cm$^2$.\n\n**Answer: C**",
  ),
  mcq(
    "A box of tissues is a rectangular prism measuring $24$ cm by $12$ cm by $8$ cm. The area of cardboard needed to make a closed box is:",
    ["$288$ cm$^2$", "$576$ cm$^2$", "$1\\,152$ cm$^2$", "$2\\,304$ cm$^2$"],
    "C",
    "MEDIUM",
    "Surface area $= 2(24 \\times 12) + 2(24 \\times 8) + 2(12 \\times 8) = 576 + 384 + 192 = 1\\,152$ cm$^2$.\n\n**Answer: C**",
  ),
  mcq(
    "A cylindrical water tank (closed at both ends) has diameter $2$ m and height $3$ m. Using $\\pi \\approx 3.14$, the total external surface area of the tank is closest to:",
    ["$18.8$ m$^2$", "$25.1$ m$^2$", "$31.4$ m$^2$", "$37.7$ m$^2$"],
    "B",
    "HARD",
    "Radius $r = 1$ m. Total SA $= 2\\pi r^2 + 2\\pi r h = 2\\pi(1) + 2\\pi(1)(3) = 2\\pi + 6\\pi = 8\\pi \\approx 8 \\times 3.14 = 25.12$ m$^2$.\n\n**Answer: B**",
  ),
  mcq(
    "An open cylindrical drum (no top, but has a bottom) has radius $0.5$ m and height $1$ m. Using $\\pi \\approx 3.14$, the total surface area is closest to:",
    ["$2.36$ m$^2$", "$3.14$ m$^2$", "$3.93$ m$^2$", "$4.71$ m$^2$"],
    "C",
    "HARD",
    "Bottom only: $\\pi r^2 = \\pi(0.25) = 0.25\\pi$. Curved: $2\\pi r h = 2\\pi(0.5)(1) = \\pi$. Total: $0.25\\pi + \\pi = 1.25\\pi \\approx 1.25 \\times 3.14 = 3.925$ m$^2$.\n\n**Answer: C**",
  ),

  // ── SHORT_ANSWER (11) ────────────────────────────────────────────────
  sa(
    "Calculate the total surface area of a cube with side length $6$ cm.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $6 \\times 6^2 = 6 \\times 36 = 216$ cm$^2$.",
  ),
  sa(
    "Calculate the total surface area of a rectangular prism with dimensions $3$ cm by $4$ cm by $5$ cm.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Pairs of faces: $2(3 \\times 4) + 2(3 \\times 5) + 2(4 \\times 5) = 24 + 30 + 40$.\n\n**Step 2 (1 mark):** Total surface area $= 94$ cm$^2$.",
  ),
  sa(
    "A cube has side length $9$ cm. Calculate its total surface area.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $6 \\times 9^2 = 6 \\times 81 = 486$ cm$^2$.",
  ),
  sa(
    "Calculate the curved surface area of a cylinder with radius $3$ cm and height $10$ cm. Give your answer in exact form (in terms of $\\pi$).",
    2,
    "EASY",
    "**Step 1 (1 mark):** Curved surface area $= 2\\pi r h = 2\\pi(3)(10)$.\n\n**Step 2 (1 mark):** $= 60\\pi$ cm$^2$.",
  ),
  sa(
    "A rectangular fish tank (open at the top) has length $80$ cm, width $40$ cm, and height $30$ cm. Calculate the total area of glass used (including the base) in square centimetres.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Base: $80 \\times 40 = 3\\,200$ cm$^2$.\n\n**Step 2 (1 mark):** Two long sides: $2 \\times (80 \\times 30) = 4\\,800$ cm$^2$. Two short sides: $2 \\times (40 \\times 30) = 2\\,400$ cm$^2$.\n\n**Step 3 (1 mark):** Total: $3\\,200 + 4\\,800 + 2\\,400 = 10\\,400$ cm$^2$.",
  ),
  sa(
    "A closed cylindrical can has radius $4$ cm and height $12$ cm. Calculate its total surface area, in exact form.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Total surface area formula: $2\\pi r^2 + 2\\pi r h = 2\\pi(16) + 2\\pi(4)(12)$.\n\n**Step 2 (1 mark):** $= 32\\pi + 96\\pi = 128\\pi$ cm$^2$.",
  ),
  sa(
    "A closed cylindrical can has radius $5$ cm and height $14$ cm. Calculate its total surface area, correct to the nearest square centimetre. Use $\\pi \\approx 3.14$.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Two circular ends: $2\\pi r^2 = 2\\pi(25) = 50\\pi$.\n\n**Step 2 (1 mark):** Curved surface: $2\\pi r h = 2\\pi(5)(14) = 140\\pi$. Total: $190\\pi$ cm$^2$.\n\n**Step 3 (1 mark):** $190 \\times 3.14 \\approx 596.6$, so approximately $597$ cm$^2$.",
  ),
  sa(
    "A cube has a total surface area of $96$ cm$^2$. Find its side length.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** $6s^2 = 96 \\Rightarrow s^2 = 16$.\n\n**Step 2 (1 mark):** $s = 4$ cm.",
  ),
  sa(
    "A wooden cube of side $20$ cm is to be painted on all $6$ faces. Calculate the total surface area to be painted, in square metres.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Surface area: $6 \\times 20^2 = 2\\,400$ cm$^2$.\n\n**Step 2 (1 mark):** Convert to m$^2$: $2\\,400 \\div 10\\,000 = 0.24$ m$^2$.",
  ),
  sa(
    "An open-top rectangular box has a base measuring $12$ cm by $8$ cm and a height of $5$ cm. Calculate the area of cardboard needed to make the box.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Base only (no top): $12 \\times 8 = 96$ cm$^2$.\n\n**Step 2 (1 mark):** Two long sides: $2 \\times (12 \\times 5) = 120$. Two short sides: $2 \\times (8 \\times 5) = 80$.\n\n**Step 3 (1 mark):** Total: $96 + 120 + 80 = 296$ cm$^2$.",
  ),
  sa(
    "A closed cylindrical water tank has diameter $1.4$ m and height $2$ m. Calculate the total surface area of the tank, correct to one decimal place. Use $\\pi \\approx 3.14$.",
    3,
    "HARD",
    "**Step 1 (1 mark):** Radius: $r = 0.7$ m. Two circular ends: $2\\pi r^2 = 2\\pi(0.49) = 0.98\\pi$.\n\n**Step 2 (1 mark):** Curved surface: $2\\pi r h = 2\\pi(0.7)(2) = 2.8\\pi$. Total: $3.78\\pi$ m$^2$.\n\n**Step 3 (1 mark):** $3.78 \\times 3.14 \\approx 11.87$, so approximately $11.9$ m$^2$.",
  ),

  // ── EXTENDED_ANSWER (3) ──────────────────────────────────────────────
  ea(
    "A storage warehouse uses rectangular shipping crates that measure $1.2$ m long, $0.8$ m wide, and $0.6$ m high. The outside of each crate is painted.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the total surface area of one crate, in square metres.",
        solution: "**Step 1 (1 mark):** Pairs of faces: $2(1.2 \\times 0.8) + 2(1.2 \\times 0.6) + 2(0.8 \\times 0.6)$.\n\n**Step 2 (1 mark):** $= 1.92 + 1.44 + 0.96 = 4.32$ m$^2$.",
      },
      {
        label: "b",
        marks: 1,
        content: "One litre of paint covers $12$ m$^2$. Calculate the volume of paint required (in litres) to paint one crate.",
        solution: "**Step 1 (1 mark):** $\\dfrac{4.32}{12} = 0.36$ L.",
      },
      {
        label: "c",
        marks: 2,
        content: "The warehouse has $20$ crates to paint. Paint is sold only in $1$-litre tins at $\\$22$ each. Calculate the total cost of paint to paint all $20$ crates.",
        solution: "**Step 1 (1 mark):** Total paint needed: $20 \\times 0.36 = 7.2$ L. Round up to whole tins: $8$ tins.\n\n**Step 2 (1 mark):** Cost: $8 \\times \\$22 = \\$176$.",
      },
    ],
  ),
  ea(
    "A food company produces cylindrical baked-bean cans with radius $4$ cm and height $11$ cm. The label on the can wraps fully around the curved surface (it does not cover the top or bottom). Use $\\pi \\approx 3.14$ where needed.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the area of the label, correct to the nearest square centimetre.",
        solution: "**Step 1 (1 mark):** Label area $= 2\\pi r h = 2\\pi(4)(11) = 88\\pi$ cm$^2$.\n\n**Step 2 (1 mark):** $88 \\times 3.14 \\approx 276.32$, so approximately $276$ cm$^2$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the total surface area of the can (including top and bottom), correct to the nearest square centimetre.",
        solution: "**Step 1 (1 mark):** Total SA $= 2\\pi r^2 + 2\\pi r h = 2\\pi(16) + 88\\pi = 32\\pi + 88\\pi = 120\\pi$ cm$^2$.\n\n**Step 2 (1 mark):** $120 \\times 3.14 = 376.8$, so approximately $377$ cm$^2$.",
      },
      {
        label: "c",
        marks: 1,
        content: "The company makes $5\\,000$ cans per day. Calculate the total label area required per day, in square metres (to one decimal place).",
        solution: "**Step 1 (1 mark):** Total: $5\\,000 \\times 276 = 1\\,380\\,000$ cm$^2$ $= 138$ m$^2$.",
      },
    ],
  ),
  ea(
    "A swimming pool has the shape of a rectangular prism. It is $25$ m long, $10$ m wide, and $2$ m deep. The pool is open at the top.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the total area of the inside surfaces of the pool (base and four sides) in square metres.",
        solution: "**Step 1 (1 mark):** Base: $25 \\times 10 = 250$ m$^2$. Two long sides: $2 \\times (25 \\times 2) = 100$ m$^2$.\n\n**Step 2 (1 mark):** Two short sides: $2 \\times (10 \\times 2) = 40$ m$^2$. Total: $250 + 100 + 40 = 390$ m$^2$.",
      },
      {
        label: "b",
        marks: 2,
        content: "The pool is to be tiled on all inside surfaces. Tiles cost $\\$45$ per square metre, including labour. Calculate the total cost of tiling the pool.",
        solution: "**Step 1 (1 mark):** Total cost: $390 \\times \\$45$.\n\n**Step 2 (1 mark):** $= \\$17\\,550$.",
      },
      {
        label: "c",
        marks: 1,
        content: "If only the four side walls (not the base) are to be tiled, calculate the cost.",
        solution: "**Step 1 (1 mark):** Side wall area: $100 + 40 = 140$ m$^2$. Cost: $140 \\times \\$45 = \\$6\\,300$.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`surface-area: wrote ${items.length} items to ${OUT}`);
