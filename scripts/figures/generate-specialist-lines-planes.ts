/**
 * Specialist: Vector Equations of Lines and Planes.
 * Tier: modelling-rich → MCQ + SHORT + EXT_ANS + EXT_RESP.
 */

import * as fs from "fs";
import * as path from "path";
import { vector3D, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/specialist-lines-planes";
const JSON_PATH = "scripts/output/qset-specialist-lines-planes.json";
fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Figures ────────────────────────────────────────────────────────────

const figLine = vector3D({
  vectors: [
    { to: { x: 1, y: 2, z: 1 }, label: "r₀" },
    { from: { x: 1, y: 2, z: 1 }, to: { x: 3, y: 3, z: 2 }, label: "d (direction)", color: "#2563eb" },
  ],
  axisExtent: 4,
});

const figPlane = vector3D({
  vectors: [
    { to: { x: 1, y: 1, z: 1 }, label: "r₀" },
    { from: { x: 1, y: 1, z: 1 }, to: { x: 2, y: 2, z: 1 }, label: "u", color: "#2563eb" },
    { from: { x: 1, y: 1, z: 1 }, to: { x: 2, y: 1, z: 2 }, label: "v", color: "#16a34a" },
    { from: { x: 1, y: 1, z: 1 }, to: { x: 1, y: 1, z: 3 }, label: "n (normal)", color: "#dc2626" },
  ],
  axisExtent: 4,
});

const figIntersect = vector3D({
  vectors: [
    { to: { x: 3, y: 0, z: 0 }, label: "L₁" },
    { to: { x: 0, y: 3, z: 0 }, label: "L₂", color: "#2563eb" },
    { to: { x: 0, y: 0, z: 3 }, label: "L₃", color: "#16a34a" },
  ],
  axisExtent: 4,
});

const figSkew = vector3D({
  vectors: [
    { from: { x: 0, y: 0, z: 1 }, to: { x: 3, y: 1, z: 1 }, label: "L₁" },
    { from: { x: 1, y: 0, z: -1 }, to: { x: 1, y: 3, z: 2 }, label: "L₂", color: "#2563eb" },
  ],
  axisExtent: 4,
});

const figures: Record<string, string> = {
  "line.svg": figLine,
  "plane.svg": figPlane,
  "intersect.svg": figIntersect,
  "skew.svg": figSkew,
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
  subtopicSlugs: ["vector-equations-of-lines-and-planes", ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: ["vector-equations-of-lines-and-planes", ...sec],
});

// ─── 12 MCQ ─────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("The vector equation of the line through the point $A(1, 2, 3)$ with direction vector $\\vec d = (2, -1, 4)$ is:",
    ["$\\vec r = (1, 2, 3) + t(2, -1, 4)$", "$\\vec r = (2, -1, 4) + t(1, 2, 3)$", "$\\vec r = (3, 1, 7)t$", "$\\vec r = t(1, 2, 3)$"], "A", "EASY",
    "Vector line: $\\vec r = \\vec r_0 + t\\vec d$ where $\\vec r_0$ is a point on the line. **Answer: A**"),
  m("The parametric equations of the line $\\vec r = (1, 0, 2) + t(3, -1, 2)$ are:",
    ["$x = 1 + 3t, y = -t, z = 2 + 2t$", "$x = 3 + t, y = -1, z = 2 + 2t$", "$x = 3t, y = -t, z = 2t$", "$x = 1 + t, y = 0 - t, z = 2 + 2t$"], "A", "EASY",
    "Read off components: $x = 1 + 3t$, $y = 0 - t = -t$, $z = 2 + 2t$. **Answer: A**"),
  m("The line $\\vec r = t(1, 2, 3)$ passes through which point?",
    ["The origin", "$(1, 2, 3)$ only", "$(1, 1, 1)$", "$(0, 1, 2)$"], "A", "EASY",
    "When $t = 0$: $\\vec r = (0, 0, 0)$, the origin. **Answer: A**"),
  m("Two lines are parallel if their direction vectors are:",
    ["scalar multiples of each other", "perpendicular", "equal in magnitude", "intersecting"], "A", "EASY",
    "Parallel lines have direction vectors that are scalar multiples (including negatives). **Answer: A**"),
  m("The line through $A(1, 0, 0)$ and $B(0, 1, 0)$ has direction vector:",
    ["$(-1, 1, 0)$", "$(1, 1, 0)$", "$(1, 0, 0)$", "$(0, 1, 1)$"], "A", "EASY",
    "$\\vec{AB} = B - A = (-1, 1, 0)$. **Answer: A**"),
  m("A plane through $A(1, 2, 3)$ with normal vector $\\vec n = (2, 1, -1)$ has equation:",
    ["$2x + y - z = 1$", "$2x + y - z = 0$", "$x + 2y + 3z = 0$", "$2x + y - z = 6$"], "A", "MEDIUM",
    "Plane: $\\vec n \\cdot (\\vec r - \\vec A) = 0 \\Rightarrow 2(x-1) + (y-2) - (z-3) = 0 \\Rightarrow 2x + y - z = 1$. **Answer: A**"),
  m("The normal vector of the plane $3x - 2y + z = 5$ is:",
    ["$(3, -2, 1)$", "$(5, 0, 0)$", "$(3, 2, 1)$", "$(-3, 2, -1)$"], "A", "MEDIUM",
    "Coefficients of $x, y, z$ give the normal: $\\vec n = (3, -2, 1)$. **Answer: A**"),
  m("The lines $\\vec r_1 = (0, 0, 0) + t(1, 1, 1)$ and $\\vec r_2 = (1, 2, 3) + s(2, 2, 2)$ are:",
    ["parallel but distinct", "intersecting", "skew", "the same line"], "A", "MEDIUM",
    "Direction vectors $(1,1,1)$ and $(2,2,2)$ are parallel. Check if $(1,2,3)$ lies on first line: would need $t = 1, 2, 3$ — impossible. So parallel but distinct. **Answer: A**"),
  m("The angle between two planes equals the angle between their:",
    ["normal vectors", "direction vectors", "intersection lines", "parallel vectors"], "A", "MEDIUM",
    "The angle between two planes is defined as the angle between their normal vectors. **Answer: A**"),
  m("If line $\\vec r = (1, 2, 0) + t(1, -1, 2)$ meets the plane $z = 4$, then $t$ equals:",
    ["$2$", "$4$", "$-2$", "$0$"], "A", "MEDIUM",
    "$z$-component: $0 + 2t = 4 \\Rightarrow t = 2$. **Answer: A**"),
  m("A line is perpendicular to a plane if its direction vector is:",
    ["parallel to the plane's normal", "perpendicular to the plane's normal", "in the plane", "zero"], "A", "HARD",
    "If the line's direction is parallel to the normal of the plane, the line is perpendicular to the plane. **Answer: A**"),
  m("The intersection of the planes $x + y = 2$ and $y + z = 3$ is a:",
    ["line", "point", "plane", "empty set"], "A", "HARD",
    "Two non-parallel planes intersect in a line (unless they are identical or parallel-distinct). The normals $(1,1,0)$ and $(0,1,1)$ are not parallel, so the intersection is a line. **Answer: A**"),
];

// ─── 8 SHORT_ANSWER ─────────────────────────────────────────────────────

const shortAnswer: FR[] = [
  sq("Find the vector equation of the line through $A(2, -1, 3)$ with direction vector $\\vec d = (1, 2, -1)$.", 2, "EASY",
    "*Step 1 (1 mark):* Use $\\vec r = \\vec r_0 + t \\vec d$.\n*Step 2 (1 mark):* $\\vec r = (2, -1, 3) + t(1, 2, -1)$, $t \\in \\mathbb R$."),
  sq("Find the vector equation of the line through the two points $A(1, 0, 2)$ and $B(3, 2, 4)$.", 3, "EASY",
    "*Step 1 (1 mark):* Direction $\\vec d = \\vec{AB} = (2, 2, 2)$ (or any scalar multiple, e.g., $(1, 1, 1)$).\n*Step 2 (1 mark):* Use point $A$ as $\\vec r_0$.\n*Step 3 (1 mark):* $\\vec r = (1, 0, 2) + t(1, 1, 1)$."),
  sq("Find the Cartesian equation of the plane through $P(1, 2, 3)$ with normal vector $\\vec n = (1, -1, 2)$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Use $\\vec n \\cdot (\\vec r - \\vec P) = 0$: $(1, -1, 2) \\cdot (x-1, y-2, z-3) = 0$.\n*Step 2 (1 mark):* Expand: $(x - 1) - (y - 2) + 2(z - 3) = 0$.\n*Step 3 (1 mark):* Simplify: $x - y + 2z - 5 = 0$ or $x - y + 2z = 5$."),
  sq("Find where the line $\\vec r = (1, 1, 1) + t(2, -1, 3)$ meets the plane $x + y + z = 6$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Substitute: $(1 + 2t) + (1 - t) + (1 + 3t) = 6$.\n*Step 2 (1 mark):* Simplify: $3 + 4t = 6 \\Rightarrow t = 3/4$.\n*Step 3 (1 mark):* Point: $(1 + 3/2, 1 - 3/4, 1 + 9/4) = (5/2, 1/4, 13/4)$."),
  sq("Find the angle between the line $\\vec r = (0, 0, 0) + t(1, 1, 1)$ and the line $\\vec r = (1, 2, 3) + s(1, 0, -1)$, correct to the nearest degree.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Angle = angle between direction vectors $\\vec d_1 = (1, 1, 1)$, $\\vec d_2 = (1, 0, -1)$.\n*Step 2 (1 mark):* $\\cos\\theta = \\dfrac{\\vec d_1 \\cdot \\vec d_2}{|\\vec d_1||\\vec d_2|} = \\dfrac{1 + 0 - 1}{\\sqrt 3 \\sqrt 2} = 0$.\n*Step 3 (1 mark):* So $\\theta = 90°$."),
  sq("Find the equation of the plane passing through three points $A(1, 0, 0)$, $B(0, 1, 0)$, $C(0, 0, 1)$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $\\vec{AB} = (-1, 1, 0)$, $\\vec{AC} = (-1, 0, 1)$.\n*Step 2 (1 mark):* Normal: $\\vec n = \\vec{AB} \\times \\vec{AC} = (1, 1, 1)$.\n*Step 3 (1 mark):* Plane: $1(x - 1) + y + z = 0 \\Rightarrow x + y + z = 1$."),
  sq("Show that the line $\\vec r = (2, -1, 3) + t(1, 4, 0)$ is parallel to the plane $-4x + y - 2z = 7$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Direction of line: $\\vec d = (1, 4, 0)$. Normal to plane: $\\vec n = (-4, 1, -2)$.\n*Step 2 (1 mark):* $\\vec d \\cdot \\vec n = -4 + 4 + 0 = 0$.\n*Step 3 (1 mark):* Since $\\vec d \\perp \\vec n$, the line is parallel to the plane (and not in the plane unless a point of it satisfies the equation)."),
  sq("Find the shortest distance from the point $P(1, 1, 1)$ to the plane $2x - y + 2z = 6$.", 3, "HARD",
    "*Step 1 (1 mark):* Distance formula: $D = \\dfrac{|ax_0 + by_0 + cz_0 - d|}{\\sqrt{a^2 + b^2 + c^2}}$.\n*Step 2 (1 mark):* Numerator: $|2(1) - 1 + 2(1) - 6| = |2 - 1 + 2 - 6| = |-3| = 3$.\n*Step 3 (1 mark):* Denominator: $\\sqrt{4 + 1 + 4} = 3$. So $D = 3/3 = 1$."),
];

// ─── 3 EXT_ANS ──────────────────────────────────────────────────────────

const extendedAnswer: FR[] = [
  sq(`Consider the line $L: \\vec r = (1, 2, 3) + t(2, -1, 1)$ and the plane $\\Pi: x + 2y - z = 4$.

**a.** Show that the line is not parallel to the plane. (2 marks)

**b.** Find the point of intersection of $L$ with $\\Pi$. (3 marks)

**c.** Find the acute angle between the line and the plane, to the nearest degree. (3 marks)

${img("line.svg", "3D vector diagram showing a line passing through a point with a direction vector")}`,
    8, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* Direction of $L$: $\\vec d = (2, -1, 1)$. Normal to $\\Pi$: $\\vec n = (1, 2, -1)$.
*Step 2 (1 mark):* $\\vec d \\cdot \\vec n = 2 - 2 - 1 = -1 \\ne 0$, so $L$ is not parallel to $\\Pi$.

**b. (3 marks)**
*Step 1 (1 mark):* Substitute parametrically: $x = 1 + 2t$, $y = 2 - t$, $z = 3 + t$.
*Step 2 (1 mark):* Into $\\Pi$: $(1 + 2t) + 2(2 - t) - (3 + t) = 4 \\Rightarrow 1 + 2t + 4 - 2t - 3 - t = 4 \\Rightarrow 2 - t = 4 \\Rightarrow t = -2$.
*Step 3 (1 mark):* Point: $(1 - 4, 2 + 2, 3 - 2) = (-3, 4, 1)$.

**c. (3 marks)**
*Step 1 (1 mark):* Angle between line and plane: $\\sin\\theta = \\dfrac{|\\vec d \\cdot \\vec n|}{|\\vec d||\\vec n|}$.
*Step 2 (1 mark):* $|\\vec d| = \\sqrt 6$, $|\\vec n| = \\sqrt 6$. $\\sin\\theta = \\dfrac{1}{6}$.
*Step 3 (1 mark):* $\\theta = \\arcsin(1/6) \\approx 9.59° \\approx 10°$.`),

  sq(`Two lines are given:
$L_1: \\vec r = (1, 0, 1) + t(2, 1, 0)$
$L_2: \\vec r = (3, 2, 1) + s(0, 1, 1)$.

**a.** Find the direction vectors and a point on each line. (2 marks)

**b.** Determine whether $L_1$ and $L_2$ intersect, are parallel, or are skew. If they intersect, find the point of intersection. (5 marks)

**c.** Find the angle between $L_1$ and $L_2$, to the nearest degree. (2 marks)

${img("skew.svg", "Two skew lines in 3D space — non-intersecting and non-parallel")}`,
    9, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* $L_1$: point $(1, 0, 1)$, direction $\\vec d_1 = (2, 1, 0)$.
*Step 2 (1 mark):* $L_2$: point $(3, 2, 1)$, direction $\\vec d_2 = (0, 1, 1)$.

**b. (5 marks)**
*Step 1 (1 mark):* Directions $(2,1,0)$ and $(0,1,1)$ are not parallel (no scalar multiple), so lines are not parallel.
*Step 2 (1 mark):* Set equal: $1 + 2t = 3$, $t = s$, $1 = 1 + s$.
*Step 3 (1 mark):* From first: $t = 1$. From third: $s = 0$. Check second: $t = s$ requires $1 = 0$ — contradiction.
*Step 4 (1 mark):* So lines don't intersect.
*Step 5 (1 mark):* Since not parallel and not intersecting, they are **skew**.

**c. (2 marks)**
*Step 1 (1 mark):* $\\cos\\theta = \\dfrac{\\vec d_1 \\cdot \\vec d_2}{|\\vec d_1||\\vec d_2|} = \\dfrac{0 + 1 + 0}{\\sqrt 5 \\cdot \\sqrt 2} = \\dfrac{1}{\\sqrt{10}}$.
*Step 2 (1 mark):* $\\theta = \\arccos(1/\\sqrt{10}) \\approx 71.57° \\approx 72°$.`),

  sq(`Three points $A(1, 0, 0)$, $B(0, 2, 0)$ and $C(0, 0, 3)$ are in 3D space.

**a.** Find the equation of the plane $\\Pi$ through $A$, $B$, $C$ in the form $ax + by + cz = d$. (4 marks)

**b.** Find the distance from the origin $O$ to the plane $\\Pi$. (2 marks)

**c.** Find the foot of the perpendicular from $O$ to $\\Pi$. (3 marks)

${img("plane.svg", "3D plane with two direction vectors u and v in the plane, and a normal vector n perpendicular to the plane")}`,
    9, "HARD",
    `**a. (4 marks)**
*Step 1 (1 mark):* $\\vec{AB} = (-1, 2, 0)$, $\\vec{AC} = (-1, 0, 3)$.
*Step 2 (1 mark):* Normal: $\\vec n = \\vec{AB} \\times \\vec{AC} = ((2)(3) - (0)(0), (0)(-1) - (-1)(3), (-1)(0) - (2)(-1)) = (6, 3, 2)$.
*Step 3 (1 mark):* Plane: $6(x - 1) + 3y + 2z = 0$.
*Step 4 (1 mark):* Simplify: $6x + 3y + 2z = 6$.

**b. (2 marks)**
*Step 1 (1 mark):* Distance from origin: $D = \\dfrac{|6(0) + 3(0) + 2(0) - 6|}{\\sqrt{36 + 9 + 4}} = \\dfrac{6}{7}$.
*Step 2 (1 mark):* So $D = 6/7$.

**c. (3 marks)**
*Step 1 (1 mark):* Foot of perpendicular: $F = O + \\dfrac{D}{|\\vec n|}\\hat n = \\dfrac{6}{7^2}(6, 3, 2) = \\dfrac{6}{49}(6, 3, 2)$.
*Step 2 (1 mark):* $F = \\left(\\dfrac{36}{49}, \\dfrac{18}{49}, \\dfrac{12}{49}\\right)$.
*Step 3 (1 mark):* Verify: $6(36/49) + 3(18/49) + 2(12/49) = (216 + 54 + 24)/49 = 294/49 = 6$ ✓.`),
];

// ─── 3 EXT_RESP ─────────────────────────────────────────────────────────

const extendedResponse: FR[] = [
  sq(`A drone flies in a straight line from point $A(2, 1, 5)$ to point $B(8, 7, 11)$, both in metres above an origin. It moves at constant speed and reaches $B$ after $3$ seconds.

**a.** Find the velocity vector $\\vec v$ of the drone (in $\\hat i\\hat j\\hat k$ form). (2 marks)

**b.** Write a vector parametric equation for the drone's position $\\vec r(t)$ at time $t \\in [0, 3]$, with $\\vec r(0) = A$. (2 marks)

**c.** Find the position of the drone at $t = 2$ seconds. (2 marks)

**d.** The drone needs to avoid a sensor located at the point $P(5, 4, 6)$. Find the minimum distance between the drone's trajectory line and $P$. (4 marks)

**e.** A second drone moves along the line $\\vec r_2 = (10, 0, 0) + s(0, 1, 2)$ where $s \\in \\mathbb{R}$ (time-parameterised differently). Do the two drone paths intersect? If so, find the intersection point. (3 marks)

${img("line.svg", "3D vector diagram of a line through a point with direction vector")}`,
    13, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* Displacement $\\vec{AB} = (6, 6, 6)$ over 3 seconds.
*Step 2 (1 mark):* Velocity $\\vec v = \\vec{AB}/3 = (2, 2, 2)$ m/s, i.e., $\\vec v = 2\\hat i + 2\\hat j + 2\\hat k$.

**b. (2 marks)**
*Step 1 (1 mark):* $\\vec r(t) = \\vec A + t \\vec v$.
*Step 2 (1 mark):* $\\vec r(t) = (2 + 2t, 1 + 2t, 5 + 2t)$, $t \\in [0, 3]$.

**c. (2 marks)**
*Step 1 (1 mark):* $\\vec r(2) = (2 + 4, 1 + 4, 5 + 4)$.
*Step 2 (1 mark):* $= (6, 5, 9)$.

**d. (4 marks)**
*Step 1 (1 mark):* $\\vec{AP} = P - A = (3, 3, 1)$.
*Step 2 (1 mark):* Project $\\vec{AP}$ onto $\\vec v$: $\\text{proj}_{\\vec v}\\vec{AP} = \\dfrac{(3,3,1)\\cdot(2,2,2)}{|(2,2,2)|^2}(2,2,2) = \\dfrac{14}{12}(2,2,2) = (7/3)(\\hat i + \\hat j + \\hat k)$.
*Step 3 (1 mark):* Perpendicular component: $\\vec{AP} - \\text{proj} = (3 - 7/3, 3 - 7/3, 1 - 7/3) = (2/3, 2/3, -4/3)$.
*Step 4 (1 mark):* Distance $= |(2/3, 2/3, -4/3)| = \\dfrac{1}{3}\\sqrt{4 + 4 + 16} = \\dfrac{\\sqrt{24}}{3} = \\dfrac{2\\sqrt 6}{3}$ m.

**e. (3 marks)**
*Step 1 (1 mark):* Set equal: $2 + 2t = 10$, $1 + 2t = s$, $5 + 2t = 2s$.
*Step 2 (1 mark):* From first: $t = 4$. From second: $s = 9$. Check third: $5 + 8 = 13 = 2(9) = 18$? No, $13 \\ne 18$.
*Step 3 (1 mark):* Inconsistent — the two drone paths do not intersect.`),

  sq(`A laser beam follows the line $L: \\vec r = (1, 2, -1) + t(2, -1, 3)$, $t \\in \\mathbb{R}$. A mirror is mounted on the plane $\\Pi: x + 2y + 2z = 5$.

**a.** Find the point where the laser meets the mirror. (3 marks)

**b.** Find the angle of incidence (between the laser and the plane), to the nearest degree. (3 marks)

**c.** Find a unit vector in the direction of the laser. (2 marks)

**d.** When the laser reflects off the mirror, the direction reverses its component along the plane's normal. Find the direction vector of the reflected beam. (4 marks)

**e.** Verify that the reflected beam makes the same angle with the plane as the incident beam. (2 marks)

${img("plane.svg", "3D plane with direction vectors u, v in the plane, and a normal n perpendicular to the plane")}`,
    14, "HARD",
    `**a. (3 marks)**
*Step 1 (1 mark):* Substitute parametric form: $(1 + 2t) + 2(2 - t) + 2(-1 + 3t) = 5$.
*Step 2 (1 mark):* Simplify: $1 + 2t + 4 - 2t - 2 + 6t = 5 \\Rightarrow 3 + 6t = 5 \\Rightarrow t = 1/3$.
*Step 3 (1 mark):* Point: $(1 + 2/3, 2 - 1/3, -1 + 1) = (5/3, 5/3, 0)$.

**b. (3 marks)**
*Step 1 (1 mark):* Direction of laser: $\\vec d = (2, -1, 3)$. Normal: $\\vec n = (1, 2, 2)$.
*Step 2 (1 mark):* $\\sin\\theta = \\dfrac{|\\vec d \\cdot \\vec n|}{|\\vec d||\\vec n|} = \\dfrac{|2 - 2 + 6|}{\\sqrt{14} \\cdot 3} = \\dfrac{6}{3\\sqrt{14}} = \\dfrac{2}{\\sqrt{14}}$.
*Step 3 (1 mark):* $\\theta = \\arcsin(2/\\sqrt{14}) \\approx \\arcsin(0.5345) \\approx 32°$.

**c. (2 marks)**
*Step 1 (1 mark):* $|\\vec d| = \\sqrt{14}$.
*Step 2 (1 mark):* Unit vector: $\\hat d = \\dfrac{1}{\\sqrt{14}}(2, -1, 3)$.

**d. (4 marks)**
*Step 1 (1 mark):* Reflection formula: $\\vec d_{\\text{ref}} = \\vec d - 2(\\vec d \\cdot \\hat n)\\hat n$ where $\\hat n = \\vec n/|\\vec n| = (1, 2, 2)/3$.
*Step 2 (1 mark):* $\\vec d \\cdot \\hat n = (2 - 2 + 6)/3 = 2$.
*Step 3 (1 mark):* $2(\\vec d \\cdot \\hat n)\\hat n = 4(1, 2, 2)/3 = (4/3, 8/3, 8/3)$.
*Step 4 (1 mark):* $\\vec d_{\\text{ref}} = (2, -1, 3) - (4/3, 8/3, 8/3) = (2/3, -11/3, 1/3)$.

**e. (2 marks)**
*Step 1 (1 mark):* Compute angle of reflected beam: $|\\vec d_{\\text{ref}} \\cdot \\vec n| = |(2 - 22 + 2)/3| = 18/3 = 6$. Magnitudes: $|\\vec d_{\\text{ref}}| = \\sqrt{4/9 + 121/9 + 1/9} = \\sqrt{126/9} = \\sqrt{14}$ (same as incident).
*Step 2 (1 mark):* $\\sin\\theta' = 6/(3\\sqrt{14}) = 2/\\sqrt{14}$, same as before. ✓`),

  sq(`Two planes $\\Pi_1: x + y + z = 6$ and $\\Pi_2: 2x - y + z = 3$ intersect in a line $L$.

**a.** Find a point on $L$ by setting $z = 0$. (2 marks)

**b.** Find a direction vector for $L$ using the cross product of the two normal vectors. (3 marks)

**c.** Write down the vector equation of $L$. (2 marks)

**d.** Find the angle between the two planes, to the nearest degree. (3 marks)

**e.** A third plane $\\Pi_3: x + 2y - z = k$ intersects both $\\Pi_1$ and $\\Pi_2$. Find the value of $k$ such that all three planes share a common point. (4 marks)

${img("intersect.svg", "Three lines along coordinate axes meeting at the origin")}`,
    14, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* Set $z = 0$: $x + y = 6$ and $2x - y = 3$.
*Step 2 (1 mark):* Add: $3x = 9 \\Rightarrow x = 3$, $y = 3$. Point: $(3, 3, 0)$.

**b. (3 marks)**
*Step 1 (1 mark):* $\\vec n_1 = (1, 1, 1)$, $\\vec n_2 = (2, -1, 1)$.
*Step 2 (1 mark):* $\\vec d = \\vec n_1 \\times \\vec n_2 = ((1)(1) - (1)(-1), (1)(2) - (1)(1), (1)(-1) - (1)(2))$.
*Step 3 (1 mark):* $= (2, 1, -3)$.

**c. (2 marks)**
*Step 1 (1 mark):* $\\vec r = \\vec P + t \\vec d$.
*Step 2 (1 mark):* $\\vec r = (3, 3, 0) + t(2, 1, -3)$, $t \\in \\mathbb R$.

**d. (3 marks)**
*Step 1 (1 mark):* $\\cos\\alpha = \\dfrac{\\vec n_1 \\cdot \\vec n_2}{|\\vec n_1||\\vec n_2|} = \\dfrac{2 - 1 + 1}{\\sqrt 3 \\cdot \\sqrt 6}$.
*Step 2 (1 mark):* $= \\dfrac{2}{\\sqrt{18}} = \\dfrac{2}{3\\sqrt 2} = \\dfrac{\\sqrt 2}{3}$.
*Step 3 (1 mark):* $\\alpha = \\arccos(\\sqrt 2/3) \\approx 61.87° \\approx 62°$.

**e. (4 marks)**
*Step 1 (1 mark):* Common point lies on line $L$: $\\vec r = (3, 3, 0) + t(2, 1, -3) = (3 + 2t, 3 + t, -3t)$.
*Step 2 (1 mark):* For all three planes to share a common point, this point must lie in $\\Pi_3$.
*Step 3 (1 mark):* Substitute: $(3 + 2t) + 2(3 + t) - (-3t) = k \\Rightarrow 3 + 2t + 6 + 2t + 3t = k \\Rightarrow 9 + 7t = k$.
*Step 4 (1 mark):* Any $t$ gives a valid common point — actually this means $\\Pi_3$ contains all of $L$ iff $9 + 7t = k$ for all $t$, impossible unless $7 = 0$. For a single common point, any $k$ works (giving a unique $t = (k-9)/7$ and corresponding point). So the system has a unique common solution for any $k \\in \\mathbb R$. (Note: the three planes intersect in a point for every $k$.)`),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to ${JSON_PATH}\n` +
    `Wrote ${Object.keys(figures).length} SVG files to ${FIGURES_DIR}/`,
);
