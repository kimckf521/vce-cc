/**
 * Foundation generator: similarity-and-congruence
 * Tier: core-drill + extended-fit (14 MCQ + 11 SHORT + 3 EXT_ANS = 28)
 * Topic: space-and-measurement
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/similarity-and-congruence.json");

const TOPIC = "space-and-measurement";
const SUB = "similarity-and-congruence";

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
    "Two triangles are similar with a scale factor of $2$. If a side of the smaller triangle is $5$ cm, the corresponding side of the larger triangle is:",
    ["$5$ cm", "$7$ cm", "$10$ cm", "$25$ cm"],
    "C",
    "EASY",
    "Multiply by the scale factor: $5 \\times 2 = 10$ cm.\n\n**Answer: C**",
  ),
  mcq(
    "Two shapes are congruent if they have the same:",
    ["shape only", "size only", "shape and size", "colour and shape"],
    "C",
    "EASY",
    "Congruent shapes are identical in shape and size.\n\n**Answer: C**",
  ),
  mcq(
    "Two rectangles are similar. The first measures $4$ cm by $6$ cm. The second has its shorter side measuring $12$ cm. The longer side of the second rectangle is:",
    ["$14$ cm", "$16$ cm", "$18$ cm", "$24$ cm"],
    "C",
    "EASY",
    "Scale factor: $\\dfrac{12}{4} = 3$. Longer side: $6 \\times 3 = 18$ cm.\n\n**Answer: C**",
  ),
  mcq(
    "Two similar triangles have corresponding sides of $3$ cm and $9$ cm. The scale factor from the smaller to the larger is:",
    ["$2$", "$3$", "$6$", "$9$"],
    "B",
    "EASY",
    "$\\dfrac{9}{3} = 3$.\n\n**Answer: B**",
  ),
  mcq(
    "Which of the following statements is true?",
    [
      "All congruent shapes are similar.",
      "All similar shapes are congruent.",
      "Congruent and similar mean the same thing.",
      "Two shapes with the same area are always similar.",
    ],
    "A",
    "EASY",
    "Congruent shapes are identical in shape and size, so they are a special case of similar shapes (scale factor $1$).\n\n**Answer: A**",
  ),
  mcq(
    "A small flag measures $20$ cm by $30$ cm. A similar larger flag has its longer side measuring $90$ cm. The shorter side of the larger flag is:",
    ["$45$ cm", "$50$ cm", "$60$ cm", "$72$ cm"],
    "C",
    "MEDIUM",
    "Scale factor: $\\dfrac{90}{30} = 3$. Shorter side: $20 \\times 3 = 60$ cm.\n\n**Answer: C**",
  ),
  mcq(
    "A model car is built to a scale of $1:25$. If the model is $16$ cm long, the actual car is:",
    ["$0.64$ m", "$1.6$ m", "$4$ m", "$25$ m"],
    "C",
    "MEDIUM",
    "Actual: $16 \\times 25 = 400$ cm $= 4$ m.\n\n**Answer: C**",
  ),
  mcq(
    "A photograph that is $10$ cm by $15$ cm is enlarged by a scale factor of $2.5$. The dimensions of the enlargement are:",
    ["$12.5$ cm by $17.5$ cm", "$25$ cm by $37.5$ cm", "$20$ cm by $30$ cm", "$50$ cm by $75$ cm"],
    "B",
    "MEDIUM",
    "Multiply each dimension by $2.5$: $10 \\times 2.5 = 25$ cm and $15 \\times 2.5 = 37.5$ cm.\n\n**Answer: B**",
  ),
  mcq(
    "Two similar triangles have corresponding sides in the ratio $2:5$. If a side of the smaller triangle is $8$ cm, the corresponding side of the larger triangle is:",
    ["$10$ cm", "$15$ cm", "$20$ cm", "$25$ cm"],
    "C",
    "MEDIUM",
    "Scale factor: $\\dfrac{5}{2} = 2.5$. Corresponding side: $8 \\times 2.5 = 20$ cm.\n\n**Answer: C**",
  ),
  mcq(
    "Triangles $ABC$ and $DEF$ are similar. Side $AB = 6$ cm corresponds to $DE = 9$ cm. If $BC = 8$ cm, then $EF$ equals:",
    ["$8$ cm", "$10$ cm", "$11$ cm", "$12$ cm"],
    "D",
    "MEDIUM",
    "Scale factor: $\\dfrac{9}{6} = 1.5$. $EF = 8 \\times 1.5 = 12$ cm.\n\n**Answer: D**",
  ),
  mcq(
    "A flagpole casts a shadow of $15$ m. At the same time a vertical $2$ m post casts a shadow of $3$ m. Using similar triangles, the height of the flagpole is:",
    ["$5$ m", "$10$ m", "$12$ m", "$15$ m"],
    "B",
    "MEDIUM",
    "Set up proportion: $\\dfrac{h}{15} = \\dfrac{2}{3}$, so $h = \\dfrac{2 \\times 15}{3} = 10$ m.\n\n**Answer: B**",
  ),
  mcq(
    "A map uses a scale of $1:50\\,000$. Two towns are $7$ cm apart on the map. The actual distance between the towns is:",
    ["$0.35$ km", "$3.5$ km", "$35$ km", "$350$ km"],
    "B",
    "MEDIUM",
    "Actual: $7 \\times 50\\,000 = 350\\,000$ cm $= 3\\,500$ m $= 3.5$ km.\n\n**Answer: B**",
  ),
  mcq(
    "Two similar rectangles have corresponding sides in the ratio $3:4$. The smaller rectangle has an area of $36$ cm$^2$. The area of the larger rectangle is:",
    ["$48$ cm$^2$", "$54$ cm$^2$", "$60$ cm$^2$", "$64$ cm$^2$"],
    "D",
    "HARD",
    "Area ratio is the square of the side ratio: $\\left(\\dfrac{4}{3}\\right)^2 = \\dfrac{16}{9}$. Larger area: $36 \\times \\dfrac{16}{9} = 64$ cm$^2$.\n\n**Answer: D**",
  ),
  mcq(
    "A photograph is enlarged so the new dimensions are $1.5$ times the original. If the original area was $80$ cm$^2$, the new area is:",
    ["$120$ cm$^2$", "$160$ cm$^2$", "$180$ cm$^2$", "$240$ cm$^2$"],
    "C",
    "HARD",
    "Area scales by the square of the linear factor: $1.5^2 = 2.25$. New area: $80 \\times 2.25 = 180$ cm$^2$.\n\n**Answer: C**",
  ),

  // ── SHORT_ANSWER (11) ────────────────────────────────────────────────
  sa(
    "Two triangles are similar with a scale factor of $4$. A side of the smaller triangle is $7$ cm. Find the corresponding side of the larger triangle.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $7 \\times 4 = 28$ cm.",
  ),
  sa(
    "Two similar rectangles have corresponding sides of $6$ cm and $15$ cm. Find the scale factor from the smaller rectangle to the larger.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Scale factor $= \\dfrac{15}{6} = 2.5$.",
  ),
  sa(
    "A small picture measures $8$ cm by $12$ cm. It is enlarged by a scale factor of $3$. Find the dimensions of the enlargement.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Shorter side: $8 \\times 3 = 24$ cm.\n\n**Step 2 (1 mark):** Longer side: $12 \\times 3 = 36$ cm.",
  ),
  sa(
    "Triangles $PQR$ and $STU$ are similar. $PQ = 5$ cm corresponds to $ST = 15$ cm, and $QR = 8$ cm. Find the length of $TU$.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Scale factor: $\\dfrac{15}{5} = 3$.\n\n**Step 2 (1 mark):** $TU = 8 \\times 3 = 24$ cm.",
  ),
  sa(
    "A model train is built to a scale of $1:87$. The model is $20$ cm long. Find the length of the actual train in metres.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Actual length: $20 \\times 87 = 1\\,740$ cm.\n\n**Step 2 (1 mark):** Convert to metres: $1\\,740 \\div 100 = 17.4$ m.",
  ),
  sa(
    "Two similar triangles have corresponding sides $9$ cm and $12$ cm. The longest side of the smaller triangle is $15$ cm. Find the corresponding longest side of the larger triangle.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Scale factor: $\\dfrac{12}{9} = \\dfrac{4}{3}$.\n\n**Step 2 (1 mark):** Corresponding side: $15 \\times \\dfrac{4}{3} = 20$ cm.",
  ),
  sa(
    "A map has a scale of $1:25\\,000$. The distance between two landmarks on the map is $6$ cm. Find the actual distance between the landmarks, in kilometres.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Actual distance: $6 \\times 25\\,000 = 150\\,000$ cm.\n\n**Step 2 (1 mark):** Convert to km: $150\\,000 \\div 100\\,000 = 1.5$ km.",
  ),
  sa(
    "A vertical tree casts a shadow of $24$ m. At the same time of day, a $1.8$ m stick casts a shadow of $3$ m. Using similar triangles, find the height of the tree.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Set up proportion: $\\dfrac{h}{24} = \\dfrac{1.8}{3}$.\n\n**Step 2 (1 mark):** $h = \\dfrac{1.8 \\times 24}{3} = 14.4$ m.",
  ),
  sa(
    "Two similar triangles $ABC$ and $DEF$ have $AB = 4$ cm, $BC = 6$ cm, $AC = 7$ cm, and $DE = 6$ cm. Find $EF$ and $DF$.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Scale factor: $\\dfrac{DE}{AB} = \\dfrac{6}{4} = 1.5$.\n\n**Step 2 (1 mark):** $EF = 6 \\times 1.5 = 9$ cm.\n\n**Step 3 (1 mark):** $DF = 7 \\times 1.5 = 10.5$ cm.",
  ),
  sa(
    "Two similar rectangles have corresponding sides in the ratio $2:3$. The smaller rectangle has an area of $40$ cm$^2$. Find the area of the larger rectangle.",
    3,
    "HARD",
    "**Step 1 (1 mark):** Area scales by the square of the side ratio: $\\left(\\dfrac{3}{2}\\right)^2 = \\dfrac{9}{4}$.\n\n**Step 2 (1 mark):** Larger area: $40 \\times \\dfrac{9}{4}$.\n\n**Step 3 (1 mark):** $= 90$ cm$^2$.",
  ),
  sa(
    "A scale drawing of a kitchen uses the scale $1:40$. On the drawing the kitchen measures $15$ cm by $9$ cm. Find the actual dimensions of the kitchen in metres.",
    3,
    "HARD",
    "**Step 1 (1 mark):** Length: $15 \\times 40 = 600$ cm $= 6$ m.\n\n**Step 2 (1 mark):** Width: $9 \\times 40 = 360$ cm $= 3.6$ m.\n\n**Step 3 (1 mark):** Actual kitchen is $6$ m by $3.6$ m.",
  ),

  // ── EXTENDED_ANSWER (3) ──────────────────────────────────────────────
  ea(
    "An architect is preparing a scale drawing of a rectangular hall. The actual hall measures $24$ m long by $15$ m wide. The drawing uses a scale of $1:200$.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the length of the hall on the drawing, in centimetres.",
        solution: "**Step 1 (1 mark):** $24$ m $= 2\\,400$ cm. On drawing: $\\dfrac{2\\,400}{200} = 12$ cm.",
      },
      {
        label: "b",
        marks: 1,
        content: "Calculate the width of the hall on the drawing, in centimetres.",
        solution: "**Step 1 (1 mark):** $15$ m $= 1\\,500$ cm. On drawing: $\\dfrac{1\\,500}{200} = 7.5$ cm.",
      },
      {
        label: "c",
        marks: 2,
        content: "A doorway is drawn $0.4$ cm wide on the plan. Calculate the actual width of the doorway in metres.",
        solution: "**Step 1 (1 mark):** Actual width: $0.4 \\times 200 = 80$ cm.\n\n**Step 2 (1 mark):** $80$ cm $= 0.8$ m.",
      },
    ],
  ),
  ea(
    "A photographer wants to enlarge a $10$ cm by $15$ cm photograph for printing. She wants the enlargement to be similar to the original (same proportions).",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "The new shorter side is to be $30$ cm. Calculate the scale factor used.",
        solution: "**Step 1 (1 mark):** Scale factor: $\\dfrac{30}{10} = 3$.",
      },
      {
        label: "b",
        marks: 1,
        content: "Calculate the new longer side of the enlarged photograph.",
        solution: "**Step 1 (1 mark):** Longer side: $15 \\times 3 = 45$ cm.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the area of the original photograph and the area of the enlarged photograph.",
        solution: "**Step 1 (1 mark):** Original area: $10 \\times 15 = 150$ cm$^2$.\n\n**Step 2 (1 mark):** Enlarged area: $30 \\times 45 = 1\\,350$ cm$^2$.",
      },
    ],
  ),
  ea(
    "Tara wants to measure the height of a tall tree at her school. She places a $1.5$ m vertical pole upright in the ground. She measures the shadow of the pole as $2$ m and the shadow of the tree as $14$ m. The sun's rays make the same angle with the ground for both objects, so the triangles formed by the pole/shadow and tree/shadow are similar.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Identify the scale factor between the pole's shadow and the tree's shadow.",
        solution: "**Step 1 (1 mark):** Scale factor: $\\dfrac{14}{2} = 7$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Use similar triangles to find the height of the tree.",
        solution: "**Step 1 (1 mark):** Set up proportion: $\\dfrac{h}{14} = \\dfrac{1.5}{2}$.\n\n**Step 2 (1 mark):** $h = \\dfrac{1.5 \\times 14}{2} = 10.5$ m.",
      },
      {
        label: "c",
        marks: 1,
        content: "Tara realises her pole was only $1.4$ m tall, not $1.5$ m. Recalculate the height of the tree using the corrected pole height.",
        solution: "**Step 1 (1 mark):** $h = \\dfrac{1.4 \\times 14}{2} = 9.8$ m.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`similarity-and-congruence: wrote ${items.length} items to ${OUT}`);
