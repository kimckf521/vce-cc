/**
 * Foundation generator: pythagoras-theorem (extended-fit)
 *
 * 14 MCQ + 11 SHORT + 3 EXT_ANS = 28 items. No EXT_RESP.
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/pythagoras-theorem.json");

const TOPIC = "space-and-measurement";
const SUB = "pythagoras-theorem";

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
    "In a right-angled triangle, the side opposite the right angle is called the:",
    ["Adjacent", "Opposite", "Hypotenuse", "Perpendicular"],
    "C",
    "EASY",
    "The side opposite the right angle is the hypotenuse.\n\n**Answer: C**",
  ),
  mcq(
    "Pythagoras' Theorem states that, for a right-angled triangle with legs $a$ and $b$ and hypotenuse $c$:",
    ["$a + b = c$", "$a^2 + b^2 = c^2$", "$a^2 - b^2 = c^2$", "$a^2 + b^2 = c$"],
    "B",
    "EASY",
    "Pythagoras: $a^2 + b^2 = c^2$ where $c$ is the hypotenuse.\n\n**Answer: B**",
  ),
  mcq(
    "A right-angled triangle has legs of $3$ cm and $4$ cm. The length of the hypotenuse is:",
    ["$5\\text{ cm}$", "$6\\text{ cm}$", "$7\\text{ cm}$", "$25\\text{ cm}$"],
    "A",
    "EASY",
    "$c = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5\\text{ cm}$.\n\n**Answer: A**",
  ),
  mcq(
    "A right-angled triangle has legs of $6$ cm and $8$ cm. The length of the hypotenuse is:",
    ["$10\\text{ cm}$", "$12\\text{ cm}$", "$14\\text{ cm}$", "$48\\text{ cm}$"],
    "A",
    "EASY",
    "$c = \\sqrt{6^2 + 8^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10\\text{ cm}$.\n\n**Answer: A**",
  ),
  mcq(
    "A square has a diagonal of length $\\sqrt{50}\\text{ cm}$. The side length of the square is:",
    ["$5\\text{ cm}$", "$10\\text{ cm}$", "$25\\text{ cm}$", "$50\\text{ cm}$"],
    "A",
    "EASY",
    "Let the side be $s$. Then $s^2 + s^2 = 50$, so $2s^2 = 50$ and $s^2 = 25$, giving $s = 5\\text{ cm}$.\n\n**Answer: A**",
  ),
  mcq(
    "Which of the following sets could form the sides of a right-angled triangle?",
    ["$5, 12, 14$", "$5, 12, 13$", "$3, 5, 7$", "$4, 6, 8$"],
    "B",
    "EASY",
    "Check $5^2 + 12^2 = 25 + 144 = 169 = 13^2$. So $(5,12,13)$ is a Pythagorean triple.\n\n**Answer: B**",
  ),
  mcq(
    "A right-angled triangle has hypotenuse $13$ cm and one leg $5$ cm. The other leg has length:",
    ["$8\\text{ cm}$", "$10\\text{ cm}$", "$12\\text{ cm}$", "$18\\text{ cm}$"],
    "C",
    "MEDIUM",
    "$b = \\sqrt{13^2 - 5^2} = \\sqrt{169 - 25} = \\sqrt{144} = 12\\text{ cm}$.\n\n**Answer: C**",
  ),
  mcq(
    "A ladder $5$ m long leans against a wall. The foot of the ladder is $3$ m from the base of the wall. The height the ladder reaches up the wall is:",
    ["$2\\text{ m}$", "$4\\text{ m}$", "$\\sqrt{16}\\text{ m}$", "$\\sqrt{34}\\text{ m}$"],
    "B",
    "MEDIUM",
    "Height $= \\sqrt{5^2 - 3^2} = \\sqrt{25 - 9} = \\sqrt{16} = 4\\text{ m}$.\n\n**Answer: B**",
  ),
  mcq(
    "A rectangular sheet of paper measures $9$ cm by $12$ cm. The length of its diagonal is:",
    ["$15\\text{ cm}$", "$21\\text{ cm}$", "$\\sqrt{63}\\text{ cm}$", "$\\sqrt{225}\\text{ m}$"],
    "A",
    "MEDIUM",
    "Diagonal $= \\sqrt{9^2 + 12^2} = \\sqrt{81 + 144} = \\sqrt{225} = 15\\text{ cm}$.\n\n**Answer: A**",
  ),
  mcq(
    "A right-angled triangle has legs of $7$ m and $24$ m. The length of the hypotenuse is:",
    ["$23\\text{ m}$", "$25\\text{ m}$", "$28\\text{ m}$", "$31\\text{ m}$"],
    "B",
    "MEDIUM",
    "$c = \\sqrt{7^2 + 24^2} = \\sqrt{49 + 576} = \\sqrt{625} = 25\\text{ m}$.\n\n**Answer: B**",
  ),
  mcq(
    "A wheelchair ramp is $2.5$ m long and rises $0.7$ m at its high end. The horizontal distance from the start to the base of the ramp is closest to:",
    ["$1.8\\text{ m}$", "$2.0\\text{ m}$", "$2.4\\text{ m}$", "$3.2\\text{ m}$"],
    "C",
    "MEDIUM",
    "Horizontal $= \\sqrt{2.5^2 - 0.7^2} = \\sqrt{6.25 - 0.49} = \\sqrt{5.76} = 2.4\\text{ m}$.\n\n**Answer: C**",
  ),
  mcq(
    "A right-angled triangle has legs $1.5$ cm and $2.0$ cm. The hypotenuse has length:",
    ["$2.0\\text{ cm}$", "$2.5\\text{ cm}$", "$3.5\\text{ cm}$", "$6.25\\text{ cm}$"],
    "B",
    "MEDIUM",
    "$c = \\sqrt{1.5^2 + 2.0^2} = \\sqrt{2.25 + 4} = \\sqrt{6.25} = 2.5\\text{ cm}$.\n\n**Answer: B**",
  ),
  mcq(
    "A flat-screen TV has a $40$-inch diagonal and a width of $32$ inches. The height of the screen is closest to:",
    ["$22$ in", "$24$ in", "$26$ in", "$28$ in"],
    "B",
    "HARD",
    "Height $= \\sqrt{40^2 - 32^2} = \\sqrt{1600 - 1024} = \\sqrt{576} = 24$ in.\n\n**Answer: B**",
  ),
  mcq(
    "A rectangular gate measures $1.6$ m wide and $1.2$ m tall. A diagonal brace is fitted from corner to corner. The length of the brace is closest to:",
    ["$1.8\\text{ m}$", "$2.0\\text{ m}$", "$2.4\\text{ m}$", "$2.8\\text{ m}$"],
    "B",
    "HARD",
    "Brace $= \\sqrt{1.6^2 + 1.2^2} = \\sqrt{2.56 + 1.44} = \\sqrt{4.00} = 2.0\\text{ m}$.\n\n**Answer: B**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "A right-angled triangle has legs of $9$ cm and $12$ cm. Calculate the length of the hypotenuse.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $c = \\sqrt{9^2 + 12^2} = \\sqrt{81 + 144} = \\sqrt{225} = 15\\text{ cm}$.",
  ),
  sa(
    "A right-angled triangle has legs of $5$ cm and $12$ cm. Calculate the length of the hypotenuse.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $c = \\sqrt{5^2 + 12^2} = \\sqrt{25 + 144} = \\sqrt{169} = 13\\text{ cm}$.",
  ),
  sa(
    "A right-angled triangle has a hypotenuse of $25$ cm and one leg of $7$ cm. Calculate the length of the other leg.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $b = \\sqrt{25^2 - 7^2} = \\sqrt{625 - 49} = \\sqrt{576} = 24\\text{ cm}$.",
  ),
  sa(
    "A rectangular field measures $30$ m by $40$ m. Calculate the length of the diagonal across the field.",
    2,
    "EASY",
    "**Step 1 (1 mark):** $d^2 = 30^2 + 40^2 = 900 + 1\\,600 = 2\\,500$.\n\n**Step 2 (1 mark):** $d = \\sqrt{2\\,500} = 50\\text{ m}$.",
  ),
  sa(
    "A ladder $4$ m long leans against a wall. The foot of the ladder is $1.5$ m from the base of the wall. Calculate the height up the wall that the ladder reaches, correct to two decimal places.",
    2,
    "EASY",
    "**Step 1 (1 mark):** $h^2 = 4^2 - 1.5^2 = 16 - 2.25 = 13.75$.\n\n**Step 2 (1 mark):** $h = \\sqrt{13.75} \\approx 3.71\\text{ m}$.",
  ),
  sa(
    "A right-angled triangle has legs of $7$ m and $24$ m. Calculate the length of the hypotenuse.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** $c^2 = 7^2 + 24^2 = 49 + 576 = 625$.\n\n**Step 2 (1 mark):** $c = \\sqrt{625} = 25\\text{ m}$.",
  ),
  sa(
    "A flagpole is supported by a straight wire that is anchored to the ground $4$ m from the base of the pole. The wire is attached $3$ m up the pole. Calculate the length of the wire.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** $L^2 = 3^2 + 4^2 = 9 + 16 = 25$.\n\n**Step 2 (1 mark):** $L = \\sqrt{25} = 5\\text{ m}$.",
  ),
  sa(
    "A square has a diagonal of $\\sqrt{72}$ cm. Calculate the side length of the square, correct to two decimal places.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Let the side be $s$. Then $s^2 + s^2 = 72$.\n\n**Step 2 (1 mark):** $2s^2 = 72$, so $s^2 = 36$.\n\n**Step 3 (1 mark):** $s = \\sqrt{36} = 6.00\\text{ cm}$.",
  ),
  sa(
    "A rectangular picture frame measures $0.8$ m by $0.6$ m. A diagonal strip of timber will be fitted from corner to corner. Calculate the length of timber required.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** $d^2 = 0.8^2 + 0.6^2 = 0.64 + 0.36 = 1.00$.\n\n**Step 2 (1 mark):** $d = \\sqrt{1.00} = 1.00\\text{ m}$.",
  ),
  sa(
    "A right-angled triangle has hypotenuse $17$ cm and one leg $8$ cm. Calculate the length of the other leg.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** $b^2 = 17^2 - 8^2 = 289 - 64 = 225$.\n\n**Step 2 (1 mark):** $b = \\sqrt{225} = 15\\text{ cm}$.",
  ),
  sa(
    "A flat-screen TV is advertised as $50$ inches (this is the diagonal). The screen is $43.6$ inches wide. Calculate the height of the screen, correct to one decimal place.",
    3,
    "HARD",
    "**Step 1 (1 mark):** $h^2 = 50^2 - 43.6^2$.\n\n**Step 2 (1 mark):** $h^2 = 2\\,500 - 1\\,900.96 = 599.04$.\n\n**Step 3 (1 mark):** $h = \\sqrt{599.04} \\approx 24.5$ in.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "A painter places a ladder $6$ m long against a wall. The base of the ladder is $1.8$ m from the wall on a horizontal floor.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the height up the wall reached by the top of the ladder, correct to two decimal places.",
        solution: "**Step 1 (1 mark):** $h^2 = 6^2 - 1.8^2 = 36 - 3.24 = 32.76$.\n\n**Step 2 (1 mark):** $h = \\sqrt{32.76} \\approx 5.72\\text{ m}$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Safety guidelines recommend that the base of the ladder be at most one-quarter of the ladder's length away from the wall. Determine whether the painter's setup meets this guideline. Show working.",
        solution: "**Step 1 (1 mark):** Maximum allowed base distance: $\\dfrac{1}{4} \\times 6 = 1.5\\text{ m}$.\n\n**Step 2 (1 mark):** Actual base distance is $1.8$ m, which is greater than $1.5$ m. The setup does not meet the guideline.",
      },
      {
        label: "c",
        marks: 1,
        content: "If the painter moves the base to exactly $1.5$ m from the wall (to meet the guideline), calculate the new height reached up the wall, correct to two decimal places.",
        solution: "**Step 1 (1 mark):** $h = \\sqrt{6^2 - 1.5^2} = \\sqrt{36 - 2.25} = \\sqrt{33.75} \\approx 5.81\\text{ m}$.",
      },
    ],
  ),
  ea(
    "A wheelchair access ramp is being designed for a community centre. The ramp must rise $0.6$ m (the height of the entrance above the ground) and meet a horizontal length of $7.2$ m at the bottom.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the length of the sloped ramp surface, correct to two decimal places.",
        solution: "**Step 1 (1 mark):** $L^2 = 7.2^2 + 0.6^2 = 51.84 + 0.36 = 52.20$.\n\n**Step 2 (1 mark):** $L = \\sqrt{52.20} \\approx 7.22\\text{ m}$.",
      },
      {
        label: "b",
        marks: 2,
        content: "The Australian standard requires a ramp gradient no steeper than $1\\!:\\!14$ (rise:run). Determine whether the proposed ramp meets the standard. Justify with calculation.",
        solution: "**Step 1 (1 mark):** Gradient: rise:run $= 0.6 : 7.2 = 1 : 12$.\n\n**Step 2 (1 mark):** $1 : 12$ is steeper than $1 : 14$, so the ramp does not meet the standard.",
      },
      {
        label: "c",
        marks: 2,
        content: "To meet the $1\\!:\\!14$ gradient, what minimum horizontal length is needed for a $0.6$ m rise? Calculate the new sloped ramp surface length, correct to two decimal places.",
        solution: "**Step 1 (1 mark):** New horizontal length: $0.6 \\times 14 = 8.4\\text{ m}$.\n\n**Step 2 (1 mark):** New ramp length: $\\sqrt{8.4^2 + 0.6^2} = \\sqrt{70.56 + 0.36} = \\sqrt{70.92} \\approx 8.42\\text{ m}$.",
      },
    ],
  ),
  ea(
    "A rectangular sports field measures $80$ m by $40$ m. A team must run a sprint workout. One sprint is along the long side; the second is along the diagonal of the field.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "State the length of the first sprint (along the long side).",
        solution: "**Step 1 (1 mark):** The long side is $80\\text{ m}$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the length of the diagonal sprint, correct to two decimal places.",
        solution: "**Step 1 (1 mark):** $d^2 = 80^2 + 40^2 = 6\\,400 + 1\\,600 = 8\\,000$.\n\n**Step 2 (1 mark):** $d = \\sqrt{8\\,000} \\approx 89.44\\text{ m}$.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the difference between the two sprint lengths, correct to two decimal places.",
        solution: "**Step 1 (1 mark):** Difference: $89.44 - 80 = 9.44\\text{ m}$.\n\n**Step 2 (1 mark):** The diagonal sprint is approximately $9.44\\text{ m}$ longer than the side sprint.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`pythagoras-theorem: wrote ${items.length} items to ${OUT}`);
