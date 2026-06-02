/**
 * Specialist: Vectors in 2D and 3D.
 * Tier: modelling-rich → MCQ + SHORT + EXT_ANS + EXT_RESP.
 */

import * as fs from "fs";
import * as path from "path";
import { vectorDiagram, vector3D, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/specialist-vectors-2d3d";
const JSON_PATH = "scripts/output/qset-specialist-vectors-2d3d.json";
fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Figures ────────────────────────────────────────────────────────────

const figAddition = vectorDiagram({
  vectors: [
    { to: { x: 3, y: 1 }, label: "a" },
    { from: { x: 3, y: 1 }, to: { x: 4, y: 3 }, label: "b", color: "#2563eb" },
    { to: { x: 4, y: 3 }, label: "a + b", color: "#16a34a" },
  ],
  xRange: [-1, 5],
  yRange: [-1, 4],
});

const figResultant = vectorDiagram({
  vectors: [
    { to: { x: 4, y: 0 }, label: "u" },
    { to: { x: 0, y: 3 }, label: "v", color: "#2563eb" },
    { to: { x: 4, y: 3 }, label: "u + v", color: "#16a34a" },
  ],
  xRange: [-1, 5],
  yRange: [-1, 4],
});

const fig3D = vector3D({
  vectors: [
    { to: { x: 2, y: 1, z: 2 }, label: "v = (2, 1, 2)" },
  ],
  axisExtent: 3,
});

const figPosition = vectorDiagram({
  vectors: [
    { to: { x: 2, y: 1 }, label: "A" },
    { to: { x: 4, y: 3 }, label: "B", color: "#2563eb" },
    { from: { x: 2, y: 1 }, to: { x: 4, y: 3 }, label: "AB", color: "#16a34a" },
  ],
  xRange: [-1, 5],
  yRange: [-1, 4],
});

const figures: Record<string, string> = {
  "addition.svg": figAddition,
  "resultant.svg": figResultant,
  "3d.svg": fig3D,
  "position.svg": figPosition,
};
for (const [name, content] of Object.entries(figures)) {
  fs.writeFileSync(path.join(FIGURES_DIR, name), content);
}
const img = (name: string, alt: string) => `![${alt}](${toDataUri(figures[name])})`;

// ─── Types + helpers ────────────────────────────────────────────────────

interface MCQ {
  content: string; optionA: string; optionB: string; optionC: string; optionD: string;
  correctOption: "A" | "B" | "C" | "D"; marks: number;
  difficulty: "EASY" | "MEDIUM" | "HARD"; solutionContent: string; subtopicSlugs: string[];
}
interface FR {
  content: string; marks: number; difficulty: "EASY" | "MEDIUM" | "HARD";
  solutionContent: string; subtopicSlugs: string[];
}
const m = (
  c: string, o: [string, string, string, string], k: "A" | "B" | "C" | "D",
  d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): MCQ => ({
  content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3],
  correctOption: k, marks: 1, difficulty: d, solutionContent: s,
  subtopicSlugs: ["vectors-in-2d-and-3d", ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: ["vectors-in-2d-and-3d", ...sec],
});

// ─── 12 MCQ ─────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("The magnitude of $\\vec a = 3\\hat i + 4\\hat j$ is:",
    ["$5$", "$7$", "$25$", "$\\sqrt 7$"], "A", "EASY",
    "$|\\vec a| = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$. **Answer: A**"),
  m("The magnitude of $\\vec v = 2\\hat i - \\hat j + 2\\hat k$ is:",
    ["$3$", "$5$", "$\\sqrt 5$", "$9$"], "A", "EASY",
    "$|\\vec v| = \\sqrt{4 + 1 + 4} = \\sqrt 9 = 3$. **Answer: A**"),
  m("If $\\vec a = 2\\hat i + 3\\hat j$ and $\\vec b = 5\\hat i - \\hat j$, then $\\vec a + \\vec b$ equals:",
    ["$7\\hat i + 2\\hat j$", "$7\\hat i - 2\\hat j$", "$3\\hat i + 4\\hat j$", "$-3\\hat i + 4\\hat j$"], "A", "EASY",
    "Add components: $(2 + 5)\\hat i + (3 - 1)\\hat j = 7\\hat i + 2\\hat j$. **Answer: A**"),
  m("$2(\\hat i + 3\\hat j) - 3(2\\hat i - \\hat j)$ equals:",
    ["$-4\\hat i + 9\\hat j$", "$4\\hat i + 9\\hat j$", "$-4\\hat i + 3\\hat j$", "$8\\hat i + 3\\hat j$"], "A", "EASY",
    "$2\\hat i + 6\\hat j - 6\\hat i + 3\\hat j = -4\\hat i + 9\\hat j$. **Answer: A**"),
  m("The unit vector in the direction of $\\vec a = 3\\hat i + 4\\hat j$ is:",
    ["$\\dfrac{1}{5}(3\\hat i + 4\\hat j)$", "$3\\hat i + 4\\hat j$", "$\\dfrac{1}{25}(3\\hat i + 4\\hat j)$", "$\\dfrac{1}{7}(3\\hat i + 4\\hat j)$"], "A", "EASY",
    "$\\hat a = \\dfrac{\\vec a}{|\\vec a|} = \\dfrac{1}{5}(3\\hat i + 4\\hat j)$. **Answer: A**"),
  m("If $A = (1, 2)$ and $B = (4, 6)$, then $\\vec{AB}$ equals:",
    ["$3\\hat i + 4\\hat j$", "$5\\hat i + 8\\hat j$", "$-3\\hat i - 4\\hat j$", "$3\\hat j + 4\\hat j$"], "A", "MEDIUM",
    "$\\vec{AB} = B - A = (3, 4) = 3\\hat i + 4\\hat j$. **Answer: A**"),
  m("If $A = (2, -1, 3)$ and $B = (5, 1, 0)$, then $|\\vec{AB}|$ equals:",
    ["$\\sqrt{22}$", "$3$", "$\\sqrt{22} = $ none of these", "$\\sqrt{14}$"], "A", "MEDIUM",
    "$\\vec{AB} = (3, 2, -3)$. $|\\vec{AB}| = \\sqrt{9 + 4 + 9} = \\sqrt{22}$. **Answer: A**"),
  m("Vectors $\\vec a = 2\\hat i + k\\hat j$ and $\\vec b = 4\\hat i + 6\\hat j$ are parallel when $k$ equals:",
    ["$3$", "$-3$", "$12$", "$2$"], "A", "MEDIUM",
    "For parallel: $\\vec b = \\lambda \\vec a$. From $\\hat i$: $\\lambda = 2$. So $6 = 2k \\Rightarrow k = 3$. **Answer: A**"),
  m("If $\\vec a = (1, 2, -1)$ and $\\vec b = (3, 0, 4)$, then $\\vec b - 2\\vec a$ equals:",
    ["$(1, -4, 6)$", "$(5, 4, 2)$", "$(-1, 4, -6)$", "$(1, 4, -6)$"], "A", "MEDIUM",
    "$\\vec b - 2\\vec a = (3 - 2, 0 - 4, 4 - (-2)) = (1, -4, 6)$. **Answer: A**"),
  m("The position vector of the midpoint $M$ of $A(1, 3, 5)$ and $B(7, 1, -3)$ is:",
    ["$(4, 2, 1)$", "$(3, -1, -4)$", "$(8, 4, 2)$", "$(6, -2, -8)$"], "A", "MEDIUM",
    "$M = \\dfrac{A + B}{2} = \\left(\\dfrac{8}{2}, \\dfrac{4}{2}, \\dfrac{2}{2}\\right) = (4, 2, 1)$. **Answer: A**"),
  m("Given $\\vec a, \\vec b$ with $|\\vec a| = |\\vec b| = 1$ and $\\vec a \\cdot \\vec b = 0.5$, then $|\\vec a - \\vec b|$ equals:",
    ["$1$", "$\\sqrt 2$", "$\\sqrt 3$", "$2$"], "A", "HARD",
    "$|\\vec a - \\vec b|^2 = |\\vec a|^2 - 2 \\vec a \\cdot \\vec b + |\\vec b|^2 = 1 - 1 + 1 = 1$. So $|\\vec a - \\vec b| = 1$. **Answer: A**"),
  m("If $\\vec r = \\vec a + t(\\vec b - \\vec a)$ for $t \\in [0, 1]$, the locus of $\\vec r$ is:",
    ["the line segment from $A$ to $B$", "a circle through $A$ and $B$", "the perpendicular bisector of $AB$", "the entire line through $A$ and $B$"], "A", "HARD",
    "This is the parametric form of the line segment, with $t = 0$ giving $A$ and $t = 1$ giving $B$. **Answer: A**"),
];

// ─── 8 SHORT_ANSWER ─────────────────────────────────────────────────────

const shortAnswer: FR[] = [
  sq("Find $|\\vec v|$ where $\\vec v = -2\\hat i + 4\\hat j + 4\\hat k$.", 2, "EASY",
    "*Step 1 (1 mark):* $|\\vec v|^2 = 4 + 16 + 16 = 36$.\n*Step 2 (1 mark):* $|\\vec v| = 6$."),
  sq("Find a unit vector in the direction of $\\vec u = 2\\hat i - 3\\hat j + 6\\hat k$.", 2, "EASY",
    "*Step 1 (1 mark):* $|\\vec u| = \\sqrt{4 + 9 + 36} = 7$.\n*Step 2 (1 mark):* $\\hat u = \\dfrac{1}{7}(2\\hat i - 3\\hat j + 6\\hat k)$."),
  sq("Given $A = (3, -1, 2)$ and $B = (1, 4, -3)$, find $\\vec{AB}$ and $|\\vec{AB}|$.", 3, "EASY",
    "*Step 1 (1 mark):* $\\vec{AB} = B - A = (-2, 5, -5)$.\n*Step 2 (1 mark):* $|\\vec{AB}|^2 = 4 + 25 + 25 = 54$.\n*Step 3 (1 mark):* $|\\vec{AB}| = \\sqrt{54} = 3\\sqrt 6$."),
  sq("Find the values of $a$ and $b$ such that $a(2\\hat i + \\hat j) + b(\\hat i - \\hat j) = 5\\hat i + 2\\hat j$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* From $\\hat i$ component: $2a + b = 5$.\n*Step 2 (1 mark):* From $\\hat j$ component: $a - b = 2$.\n*Step 3 (1 mark):* Adding: $3a = 7 \\Rightarrow a = 7/3$. Then $b = a - 2 = 1/3$."),
  sq("Find the position vector of the point $P$ that divides $AB$ in the ratio $2:1$ where $A = (1, 0, -1)$ and $B = (4, 3, 2)$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Section formula: $\\vec P = \\dfrac{1 \\cdot \\vec A + 2 \\cdot \\vec B}{1 + 2} = \\dfrac{\\vec A + 2\\vec B}{3}$.\n*Step 2 (1 mark):* Compute: $\\dfrac{(1, 0, -1) + (8, 6, 4)}{3} = \\dfrac{(9, 6, 3)}{3}$.\n*Step 3 (1 mark):* $\\vec P = (3, 2, 1)$."),
  sq("Determine whether the vectors $\\vec a = \\hat i + 2\\hat j - \\hat k$ and $\\vec b = -2\\hat i - 4\\hat j + 2\\hat k$ are parallel.", 2, "MEDIUM",
    "*Step 1 (1 mark):* Test if $\\vec b = \\lambda \\vec a$. From $\\hat i$: $\\lambda = -2$. Check: $-2 \\vec a = -2\\hat i - 4\\hat j + 2\\hat k = \\vec b$. ✓\n*Step 2 (1 mark):* So $\\vec b = -2\\vec a$, hence they are parallel (in opposite directions)."),
  sq("Find a vector of magnitude $10$ in the direction of $\\vec a = 3\\hat i + 4\\hat j$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $|\\vec a| = 5$.\n*Step 2 (1 mark):* Unit vector: $\\hat a = \\dfrac{1}{5}(3\\hat i + 4\\hat j)$.\n*Step 3 (1 mark):* Required vector: $10\\hat a = 2(3\\hat i + 4\\hat j) = 6\\hat i + 8\\hat j$."),
  sq("Show that the points $A(1, 2, 3)$, $B(2, 4, 5)$ and $C(4, 8, 9)$ are collinear.", 3, "HARD",
    "*Step 1 (1 mark):* $\\vec{AB} = (1, 2, 2)$.\n*Step 2 (1 mark):* $\\vec{AC} = (3, 6, 6)$.\n*Step 3 (1 mark):* Since $\\vec{AC} = 3\\vec{AB}$, the vectors are parallel and share point $A$, so $A$, $B$, $C$ are collinear."),
];

// ─── 3 EXT_ANS ──────────────────────────────────────────────────────────

const extendedAnswer: FR[] = [
  sq(`Let $\\vec a = \\hat i + 2\\hat j - \\hat k$, $\\vec b = 3\\hat i - \\hat j + 2\\hat k$ and $\\vec c = -2\\hat i + \\hat j + 4\\hat k$.

**a.** Find $\\vec a + 2\\vec b - \\vec c$. (2 marks)

**b.** Find $|\\vec a + 2\\vec b - \\vec c|$. (2 marks)

**c.** Find the unit vector in the direction of $\\vec a + 2\\vec b - \\vec c$. (2 marks)`,
    6, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* $2\\vec b = 6\\hat i - 2\\hat j + 4\\hat k$.
*Step 2 (1 mark):* $\\vec a + 2\\vec b - \\vec c = (1 + 6 + 2)\\hat i + (2 - 2 - 1)\\hat j + (-1 + 4 - 4)\\hat k = 9\\hat i - \\hat j - \\hat k$.

**b. (2 marks)**
*Step 1 (1 mark):* $|9\\hat i - \\hat j - \\hat k|^2 = 81 + 1 + 1 = 83$.
*Step 2 (1 mark):* $|9\\hat i - \\hat j - \\hat k| = \\sqrt{83}$.

**c. (2 marks)**
*Step 1 (1 mark):* Divide by magnitude: $\\dfrac{1}{\\sqrt{83}}(9\\hat i - \\hat j - \\hat k)$.
*Step 2 (1 mark):* This is the required unit vector.`),

  sq(`The points $A$, $B$ and $C$ have position vectors $\\vec a = \\hat i + \\hat j$, $\\vec b = 3\\hat i + 4\\hat j$ and $\\vec c = 5\\hat i + 7\\hat j$ respectively.

**a.** Find $\\vec{AB}$ and $\\vec{BC}$. (2 marks)

**b.** Show that $A$, $B$, $C$ are collinear. (3 marks)

**c.** Find the ratio in which $B$ divides $AC$. (2 marks)

${img("position.svg", "Position vectors showing two points A and B with displacement vector AB")}`,
    7, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* $\\vec{AB} = \\vec b - \\vec a = 2\\hat i + 3\\hat j$.
*Step 2 (1 mark):* $\\vec{BC} = \\vec c - \\vec b = 2\\hat i + 3\\hat j$.

**b. (3 marks)**
*Step 1 (1 mark):* $\\vec{AB} = \\vec{BC}$, so the vectors are parallel.
*Step 2 (1 mark):* Since they share the point $B$, the three points lie on the same line.
*Step 3 (1 mark):* Hence $A$, $B$, $C$ are collinear.

**c. (2 marks)**
*Step 1 (1 mark):* Since $\\vec{AB} = \\vec{BC}$, $B$ is the midpoint of $AC$.
*Step 2 (1 mark):* So $B$ divides $AC$ in the ratio $1:1$.`),

  sq(`In a quadrilateral $ABCD$, the position vectors of the vertices are $\\vec a, \\vec b, \\vec c, \\vec d$. Let $P$, $Q$, $R$, $S$ be the midpoints of $AB$, $BC$, $CD$, $DA$ respectively.

**a.** Write down the position vectors of $P$, $Q$, $R$, $S$ in terms of $\\vec a, \\vec b, \\vec c, \\vec d$. (2 marks)

**b.** Find $\\vec{PQ}$ and $\\vec{SR}$. (3 marks)

**c.** Hence prove that $PQRS$ is a parallelogram (i.e., $\\vec{PQ} = \\vec{SR}$). (3 marks)`,
    8, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* $\\vec P = \\dfrac{\\vec a + \\vec b}{2}$, $\\vec Q = \\dfrac{\\vec b + \\vec c}{2}$.
*Step 2 (1 mark):* $\\vec R = \\dfrac{\\vec c + \\vec d}{2}$, $\\vec S = \\dfrac{\\vec d + \\vec a}{2}$.

**b. (3 marks)**
*Step 1 (1 mark):* $\\vec{PQ} = \\vec Q - \\vec P = \\dfrac{\\vec b + \\vec c}{2} - \\dfrac{\\vec a + \\vec b}{2} = \\dfrac{\\vec c - \\vec a}{2}$.
*Step 2 (1 mark):* $\\vec{SR} = \\vec R - \\vec S = \\dfrac{\\vec c + \\vec d}{2} - \\dfrac{\\vec d + \\vec a}{2} = \\dfrac{\\vec c - \\vec a}{2}$.
*Step 3 (1 mark):* So $\\vec{PQ} = \\vec{SR}$.

**c. (3 marks)**
*Step 1 (1 mark):* Since $\\vec{PQ} = \\vec{SR}$, sides $PQ$ and $SR$ are equal in length and parallel.
*Step 2 (1 mark):* Hence $PQRS$ has one pair of opposite sides equal and parallel.
*Step 3 (1 mark):* This implies $PQRS$ is a parallelogram (Varignon's theorem). ∎`),
];

// ─── 3 EXT_RESP ─────────────────────────────────────────────────────────

const extendedResponse: FR[] = [
  sq(`A plane in $\\mathbb{R}^3$ contains the points $A(1, 0, 2)$, $B(2, 3, 0)$ and $C(0, 1, 4)$.

**a.** Find $\\vec{AB}$ and $\\vec{AC}$. (2 marks)

**b.** Show that the points $A$, $B$, $C$ are not collinear (i.e., they form a valid triangle). (2 marks)

**c.** Find the position vector of the centroid $G$ of $\\triangle ABC$. (2 marks)

**d.** Find $|\\vec{AB}|$, $|\\vec{BC}|$ and $|\\vec{CA}|$. (3 marks)

**e.** Determine whether $\\triangle ABC$ is equilateral, isosceles, or scalene, justifying your answer. (2 marks)

${img("3d.svg", "3D vector diagram showing a vector with components (2, 1, 2) in three-dimensional space")}`,
    11, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* $\\vec{AB} = B - A = (1, 3, -2)$.
*Step 2 (1 mark):* $\\vec{AC} = C - A = (-1, 1, 2)$.

**b. (2 marks)**
*Step 1 (1 mark):* For collinearity, would need $\\vec{AC} = \\lambda \\vec{AB}$.
*Step 2 (1 mark):* From $\\hat i$: $\\lambda = -1$. Check $\\hat j$: $1 = -1 \\cdot 3 = -3$ ✗. Not collinear.

**c. (2 marks)**
*Step 1 (1 mark):* $\\vec G = \\dfrac{\\vec A + \\vec B + \\vec C}{3}$.
*Step 2 (1 mark):* $= \\dfrac{(1, 0, 2) + (2, 3, 0) + (0, 1, 4)}{3} = \\dfrac{(3, 4, 6)}{3} = (1, 4/3, 2)$.

**d. (3 marks)**
*Step 1 (1 mark):* $|\\vec{AB}| = \\sqrt{1 + 9 + 4} = \\sqrt{14}$.
*Step 2 (1 mark):* $\\vec{BC} = C - B = (-2, -2, 4)$, so $|\\vec{BC}| = \\sqrt{4 + 4 + 16} = \\sqrt{24} = 2\\sqrt 6$.
*Step 3 (1 mark):* $|\\vec{CA}| = |\\vec{AC}| = \\sqrt{1 + 1 + 4} = \\sqrt 6$.

**e. (2 marks)**
*Step 1 (1 mark):* Side lengths: $\\sqrt{14} \\approx 3.74$, $2\\sqrt 6 \\approx 4.90$, $\\sqrt 6 \\approx 2.45$.
*Step 2 (1 mark):* All three are different, so $\\triangle ABC$ is **scalene**.`),

  sq(`A plane is flying at velocity $\\vec v_p = 200\\hat i + 50\\hat j$ km/h relative to the ground (where $\\hat i$ points East and $\\hat j$ points North). The wind has velocity $\\vec v_w = -30\\hat i + 40\\hat j$ km/h.

**a.** Find the plane's velocity relative to the wind (its air velocity), $\\vec v_a = \\vec v_p - \\vec v_w$. (2 marks)

**b.** Find the plane's airspeed $|\\vec v_a|$. (2 marks)

**c.** Find the plane's ground speed $|\\vec v_p|$. (2 marks)

**d.** Find the bearing (measured clockwise from North) of the plane's actual course over the ground, to the nearest degree. (3 marks)

**e.** If the plane maintains its current heading and wind continues for $2$ hours, find the plane's displacement from its starting point. (3 marks)

${img("resultant.svg", "Vector diagram showing two vectors u and v with their resultant sum forming a right-angle parallelogram")}`,
    12, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* $\\vec v_a = \\vec v_p - \\vec v_w = (200 - (-30))\\hat i + (50 - 40)\\hat j$.
*Step 2 (1 mark):* $\\vec v_a = 230\\hat i + 10\\hat j$ km/h.

**b. (2 marks)**
*Step 1 (1 mark):* $|\\vec v_a|^2 = 230^2 + 10^2 = 52900 + 100 = 53000$.
*Step 2 (1 mark):* $|\\vec v_a| = \\sqrt{53000} \\approx 230.2$ km/h.

**c. (2 marks)**
*Step 1 (1 mark):* $|\\vec v_p|^2 = 200^2 + 50^2 = 40000 + 2500 = 42500$.
*Step 2 (1 mark):* $|\\vec v_p| = \\sqrt{42500} \\approx 206.2$ km/h.

**d. (3 marks)**
*Step 1 (1 mark):* The ground velocity points in direction $(200, 50)$. Bearing is measured clockwise from North.
*Step 2 (1 mark):* Bearing $= \\arctan(\\text{East}/\\text{North}) = \\arctan(200/50) = \\arctan(4)$.
*Step 3 (1 mark):* $\\arctan(4) \\approx 75.96° \\approx 076°$.

**e. (3 marks)**
*Step 1 (1 mark):* Displacement $= \\vec v_p \\cdot t$ where $t = 2$ h.
*Step 2 (1 mark):* $= 2 \\cdot (200\\hat i + 50\\hat j) = 400\\hat i + 100\\hat j$ km.
*Step 3 (1 mark):* So plane is displaced 400 km East and 100 km North of starting point.`),

  sq(`Three particles $A$, $B$, $C$ with position vectors $\\vec a(t) = (\\cos t)\\hat i + (\\sin t)\\hat j$, $\\vec b(t) = (\\sin t)\\hat i + (\\cos t)\\hat j$, $\\vec c(t) = t\\hat i + t^2 \\hat j$ move in the plane (where $t \\ge 0$ is time in seconds).

**a.** Find $\\vec a(0)$, $\\vec b(0)$ and $\\vec c(0)$. (2 marks)

**b.** Find $|\\vec a(t)|$ and $|\\vec b(t)|$ for all $t$. Comment on the paths followed by $A$ and $B$. (3 marks)

**c.** Find the position vector of the midpoint $M(t)$ of $AB$. (2 marks)

**d.** Find the time $t > 0$ (correct to two decimal places) when $A$, $B$ and $C$ are collinear, by setting up an appropriate condition. (4 marks)

**e.** Sketch (qualitatively) the paths followed by $A$, $B$, $C$ in the $xy$-plane over $t \\in [0, \\pi]$. (1 mark)`,
    12, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* $\\vec a(0) = (1, 0)$ and $\\vec b(0) = (0, 1)$.
*Step 2 (1 mark):* $\\vec c(0) = (0, 0)$ (origin).

**b. (3 marks)**
*Step 1 (1 mark):* $|\\vec a(t)| = \\sqrt{\\cos^2 t + \\sin^2 t} = 1$.
*Step 2 (1 mark):* $|\\vec b(t)| = \\sqrt{\\sin^2 t + \\cos^2 t} = 1$.
*Step 3 (1 mark):* Both $A$ and $B$ move on the unit circle centred at the origin (constant distance 1).

**c. (2 marks)**
*Step 1 (1 mark):* $M(t) = \\dfrac{\\vec a + \\vec b}{2} = \\dfrac{(\\cos t + \\sin t)\\hat i + (\\sin t + \\cos t)\\hat j}{2}$.
*Step 2 (1 mark):* $= \\dfrac{\\cos t + \\sin t}{2}(\\hat i + \\hat j)$.

**d. (4 marks)**
*Step 1 (1 mark):* Collinearity: $\\vec{AB}(t) \\parallel \\vec{AC}(t)$, equivalently the cross-product determinant is zero. $\\vec{AB} = (\\sin t - \\cos t, \\cos t - \\sin t)$, $\\vec{AC} = (t - \\cos t, t^2 - \\sin t)$.
*Step 2 (1 mark):* Determinant: $(\\sin t - \\cos t)(t^2 - \\sin t) - (\\cos t - \\sin t)(t - \\cos t) = 0$.
*Step 3 (1 mark):* Note $\\cos t - \\sin t = -(\\sin t - \\cos t)$. So expression $= (\\sin t - \\cos t)[(t^2 - \\sin t) + (t - \\cos t)] = (\\sin t - \\cos t)(t^2 + t - \\sin t - \\cos t) = 0$.
*Step 4 (1 mark):* First factor zero when $\\sin t = \\cos t \\Rightarrow t = \\pi/4 \\approx 0.79$. (Second factor is positive for small $t > 0$, so first crossing.) $t \\approx 0.79$.

**e. (1 mark)**
$A$: starts at $(1, 0)$, moves anticlockwise on unit circle. $B$: starts at $(0, 1)$, moves clockwise (downward initially) on unit circle. $C$: starts at origin, traces parabola $y = x^2$ going right and up.`),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to ${JSON_PATH}\n` +
    `Wrote ${Object.keys(figures).length} SVG files to ${FIGURES_DIR}/`,
);
