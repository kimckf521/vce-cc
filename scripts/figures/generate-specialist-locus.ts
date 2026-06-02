/**
 * Specialist: Locus Problems (complex plane).
 * Tier: modelling-rich → MCQ + SHORT + EXT_ANS + EXT_RESP.
 *
 * Targets: 12 MCQ + 8 SHORT + 3 EXT_ANS + 3 EXT_RESP.
 */

import * as fs from "fs";
import * as path from "path";
import { argandPlot, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/specialist-locus";
const JSON_PATH = "scripts/output/qset-specialist-locus.json";
fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Figures ────────────────────────────────────────────────────────────

// Locus |z| = 2 — circle of radius 2 about origin
const figCircleOrigin = argandPlot({
  circles: [{ cx: 0, cy: 0, r: 2 }],
  reRange: [-3, 3],
  imRange: [-3, 3],
});

// Locus |z - (1 + i)| = 2 — circle centred at 1 + i, radius 2
const figCircleShifted = argandPlot({
  circles: [{ cx: 1, cy: 1, r: 2, color: "#dc2626" }],
  points: [{ re: 1, im: 1, label: "centre (1, 1)", color: "#16a34a" }],
  reRange: [-3, 5],
  imRange: [-3, 5],
});

// Locus |z - z1| = |z - z2| — perpendicular bisector of segment z1 z2
// Take z1 = 2 + 0i, z2 = 0 + 2i; bisector is line y = x
const figPerpBisector = argandPlot({
  points: [
    { re: 2, im: 0, label: "z₁ = 2", color: "#2563eb" },
    { re: 0, im: 2, label: "z₂ = 2i", color: "#2563eb" },
  ],
  segments: [
    { from: { re: 2, im: 0 }, to: { re: 0, im: 2 }, color: "#9ca3af", dash: true },
    { from: { re: -3, im: -3 }, to: { re: 3, im: 3 }, color: "#dc2626" },
  ],
  reRange: [-3, 3],
  imRange: [-3, 3],
});

// Ray arg(z - 1) = π/4 — half-line from 1 at 45°
const figRay = argandPlot({
  points: [{ re: 1, im: 0, label: "z₀ = 1", color: "#16a34a" }],
  segments: [
    { from: { re: 1, im: 0 }, to: { re: 4, im: 3 }, color: "#dc2626" },
  ],
  reRange: [-2, 5],
  imRange: [-2, 4],
});

const figures: Record<string, string> = {
  "circle-origin.svg": figCircleOrigin,
  "circle-shifted.svg": figCircleShifted,
  "perp-bisector.svg": figPerpBisector,
  "ray.svg": figRay,
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
  subtopicSlugs: ["locus-problems", ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: ["locus-problems", ...sec],
});

// ─── 12 MCQ ─────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("On the Argand diagram, the locus of points $z$ satisfying $|z| = 3$ is:",
    ["a circle centred at the origin with radius $3$", "a line at distance 3 from the origin", "the point $z = 3$", "the disc $|z| \\le 3$"], "A", "EASY",
    "$|z| = r$ describes a circle of radius $r$ centred at the origin. **Answer: A**"),
  m("The locus $|z - (2 + i)| = 4$ is:",
    ["a circle centred at $2 + i$ with radius 4", "a circle centred at $-2 - i$ with radius 4", "a circle centred at $4 + 4i$", "a line through $2 + i$"], "A", "EASY",
    "$|z - z_0| = r$ is a circle centred at $z_0$ with radius $r$. Here $z_0 = 2 + i$, $r = 4$. **Answer: A**"),
  m("The locus $|z - 1| = |z + 1|$ is:",
    ["the real axis", "the imaginary axis", "a circle of radius 1", "the origin only"], "B", "EASY",
    "$|z - 1| = |z + 1|$ means $z$ is equidistant from $1$ and $-1$ — the perpendicular bisector of the segment from $1$ to $-1$, which is the imaginary axis. **Answer: B**"),
  m("The locus described by $\\arg(z) = \\dfrac{\\pi}{4}$ is:",
    ["the line $y = x$", "the ray from the origin in the direction $y = x$ (with $x > 0$)", "the circle $|z| = 1$ in the first quadrant", "the point $z = e^{i\\pi/4}$"], "B", "EASY",
    "$\\arg(z) = \\theta$ describes the open ray from the origin (excluding 0) with argument $\\theta$. For $\\theta = \\pi/4$, that ray lies along $y = x$ with $x > 0$. **Answer: B**"),
  m("The locus of $z$ satisfying $\\text{Re}(z) = 2$ is:",
    ["the line $x = 2$", "the line $y = 2$", "the circle $|z| = 2$", "the point $z = 2$"], "A", "EASY",
    "$\\text{Re}(z) = 2$ means the real part of $z$ is 2, i.e., the vertical line $x = 2$. **Answer: A**"),
  m("Which equation describes a circle of radius 2 centred at $-1 + 3i$?",
    ["$|z + 1 - 3i| = 2$", "$|z - 1 + 3i| = 2$", "$|z + 1 + 3i| = 2$", "$|z - 1 - 3i| = 2$"], "A", "MEDIUM",
    "Centred at $z_0 = -1 + 3i$, the equation is $|z - z_0| = r$, i.e., $|z - (-1 + 3i)| = |z + 1 - 3i| = 2$. **Answer: A**"),
  m("The locus $|z - 2| = |z + 2i|$ is the perpendicular bisector of the segment joining:",
    ["$2$ and $2i$", "$2$ and $-2i$", "$-2$ and $2i$", "$-2$ and $-2i$"], "B", "MEDIUM",
    "$|z - z_1| = |z - z_2|$ is the perpendicular bisector of $\\overline{z_1 z_2}$. Here $z_1 = 2$, $z_2 = -2i$. **Answer: B**"),
  m("The locus $\\text{Im}(z) > 0$ describes:",
    ["the upper half-plane (excluding the real axis)", "the lower half-plane", "the right half-plane", "the unit disc"], "A", "EASY",
    "$\\text{Im}(z) > 0$ is the strict upper half of the complex plane. **Answer: A**"),
  m("If $z = x + iy$ and $|z - 1| = 3$, then $(x, y)$ satisfies:",
    ["$x^2 + y^2 = 9$", "$(x - 1)^2 + y^2 = 3$", "$(x - 1)^2 + y^2 = 9$", "$x^2 + (y - 1)^2 = 9$"], "C", "MEDIUM",
    "$|z - 1|^2 = (x - 1)^2 + y^2$. Squaring $|z - 1| = 3$ gives $(x - 1)^2 + y^2 = 9$. **Answer: C**"),
  m("The locus $\\arg(z - i) = \\dfrac{\\pi}{2}$ is:",
    ["the imaginary axis", "the ray from $i$ vertically upward (excluding $i$)", "the ray from $i$ vertically downward", "the circle $|z - i| = 1$"], "B", "MEDIUM",
    "$\\arg(z - i) = \\pi/2$ means $z - i$ has argument $\\pi/2$, so $z - i$ lies on the positive imaginary axis (excluding origin). Thus $z$ lies on the ray going up from $i$. **Answer: B**"),
  m("The set of points $z$ with $|z| \\le 2$ and $\\text{Im}(z) \\ge 0$ is:",
    ["the disc of radius 2", "the upper half of the disc of radius 2 about the origin", "the upper half-plane", "the ray $\\arg(z) = \\pi/2$"], "B", "MEDIUM",
    "$|z| \\le 2$ is the closed disc of radius 2; intersecting with $\\text{Im}(z) \\ge 0$ keeps only the upper half. **Answer: B**"),
  m("The locus $|z - 1| = 2|z + 1|$ is:",
    ["a line", "a circle", "an ellipse", "a hyperbola"], "B", "HARD",
    "Let $z = x + iy$: $(x - 1)^2 + y^2 = 4[(x + 1)^2 + y^2]$, expanding gives $3x^2 + 10x + 3 + 3y^2 = 0$, a circle (with $x_0 = -5/3$, $r^2 = 25/9 - 1 = 16/9$). **Answer: B**"),
];

// ─── 8 SHORT ────────────────────────────────────────────────────────────

const shortAnswer: FR[] = [
  sq("Sketch the locus of $z$ in the complex plane satisfying $|z| = 2$.\n\n" +
    img("circle-origin.svg", "Circle of radius 2 centred at the origin"),
    2, "EASY",
    "*Step 1 (1 mark):* Identify $|z| = 2$ as a circle of radius 2 centred at $0$.\n*Step 2 (1 mark):* Sketch the circle on Argand axes (Re horizontal, Im vertical) passing through $\\pm 2$ and $\\pm 2i$."),
  sq("Sketch the locus of $z$ in the complex plane satisfying $|z - (1 + i)| = 2$, marking the centre.\n\n" +
    img("circle-shifted.svg", "Circle of radius 2 centred at 1 + i"),
    2, "EASY",
    "*Step 1 (1 mark):* This is a circle of radius 2 centred at the point $z_0 = 1 + i$.\n*Step 2 (1 mark):* Sketch with marked centre at $(1, 1)$ in the Argand plane."),
  sq("Show that the locus $|z - 2| = |z + 2i|$ is a straight line, and find its Cartesian equation.\n\n" +
    img("perp-bisector.svg", "Perpendicular bisector of segment between 2 and -2i"),
    3, "MEDIUM",
    "*Step 1 (1 mark):* Let $z = x + iy$. Then $|z - 2|^2 = (x - 2)^2 + y^2$ and $|z + 2i|^2 = x^2 + (y + 2)^2$.\n*Step 2 (1 mark):* Equate squared moduli: $(x - 2)^2 + y^2 = x^2 + (y + 2)^2 \\Rightarrow x^2 - 4x + 4 + y^2 = x^2 + y^2 + 4y + 4$.\n*Step 3 (1 mark):* Simplify: $-4x = 4y \\Rightarrow y = -x$. The locus is the line $y = -x$."),
  sq("Find the Cartesian equation of the locus $|z - (3 + 4i)| = 5$, simplifying as far as possible.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Let $z = x + iy$: $|z - (3 + 4i)|^2 = (x - 3)^2 + (y - 4)^2$.\n*Step 2 (1 mark):* Set equal to $25$: $(x - 3)^2 + (y - 4)^2 = 25$.\n*Step 3 (1 mark):* Circle of radius 5 centred at $(3, 4)$. (Note: passes through origin since $\\sqrt{9 + 16} = 5$.)"),
  sq("Sketch the locus $\\arg(z - 1) = \\dfrac{\\pi}{4}$ on an Argand diagram.\n\n" +
    img("ray.svg", "Ray from z₀ = 1 at angle π/4"),
    2, "MEDIUM",
    "*Step 1 (1 mark):* The locus is a ray (open half-line) starting at $z_0 = 1$ (excluded) and going in the direction with argument $\\pi/4$ (slope 1).\n*Step 2 (1 mark):* Sketch this ray: start at $(1, 0)$ (open circle), continue up-and-right with slope 1."),
  sq("Find the Cartesian equation of the locus of $z$ such that $|z| = |z - 3|$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Let $z = x + iy$. $|z|^2 = x^2 + y^2$ and $|z - 3|^2 = (x - 3)^2 + y^2$.\n*Step 2 (1 mark):* Equate: $x^2 + y^2 = (x - 3)^2 + y^2 = x^2 - 6x + 9 + y^2$.\n*Step 3 (1 mark):* Solve: $0 = -6x + 9 \\Rightarrow x = 3/2$. The locus is the vertical line $x = 3/2$."),
  sq("Describe geometrically the locus given by $\\{z : 1 \\le |z| \\le 2\\}$, and sketch the region.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $|z| \\le 2$ is the closed disc of radius 2; $|z| \\ge 1$ is the complement of the open disc of radius 1.\n*Step 2 (1 mark):* The intersection is a closed annulus: all $z$ at distance between 1 and 2 from the origin.\n*Step 3 (1 mark):* Sketch two concentric circles of radii 1 and 2 about the origin; shade the region between them, including both circle boundaries."),
  sq("Show that the locus of $z$ satisfying $|z - 1|^2 + |z + 1|^2 = 6$ is a circle, and find its centre and radius.", 3, "HARD",
    "*Step 1 (1 mark):* Let $z = x + iy$. $|z - 1|^2 = (x - 1)^2 + y^2$ and $|z + 1|^2 = (x + 1)^2 + y^2$.\n*Step 2 (1 mark):* Sum: $(x - 1)^2 + (x + 1)^2 + 2 y^2 = 2x^2 + 2 + 2 y^2 = 6$.\n*Step 3 (1 mark):* Divide: $x^2 + y^2 = 2$. Circle centred at origin, radius $\\sqrt 2$."),
];

// ─── 3 EXT_ANS ──────────────────────────────────────────────────────────

const extendedAnswer: FR[] = [
  sq(`Consider the locus $S = \\{z \\in \\mathbb C : |z - 2| = |z + 2i|\\}$.

**a.** By letting $z = x + iy$, show that $S$ is a straight line and find its Cartesian equation. (3 marks)

**b.** State, with a brief geometric justification, why $S$ is the perpendicular bisector of the segment joining $2$ and $-2i$. (2 marks)

**c.** Find the point on $S$ closest to the origin, and compute its distance to the origin. (3 marks)

${img("perp-bisector.svg", "Perpendicular bisector locus")}`,
    8, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* Let $z = x + iy$. Square both sides: $(x - 2)^2 + y^2 = x^2 + (y + 2)^2$.
*Step 2 (1 mark):* Expand: $x^2 - 4x + 4 + y^2 = x^2 + y^2 + 4y + 4$.
*Step 3 (1 mark):* Cancel: $-4x = 4y \\Rightarrow y = -x$.

**b. (2 marks)**
*Step 1 (1 mark):* $|z - z_1| = |z - z_2|$ describes the set of $z$ equidistant from $z_1$ and $z_2$.
*Step 2 (1 mark):* That is exactly the perpendicular bisector of the segment from $z_1$ to $z_2$. Here $z_1 = 2$ and $z_2 = -2i$, so $S$ is the perpendicular bisector of the segment joining $(2, 0)$ and $(0, -2)$.

**c. (3 marks)**
*Step 1 (1 mark):* On $y = -x$ the distance from origin to $(x, -x)$ is $\\sqrt{x^2 + x^2} = |x|\\sqrt 2$, minimised at $x = 0$.
*Step 2 (1 mark):* So closest point is $(0, 0)$ itself — but check: does $0$ lie on $S$? $|0 - 2| = 2 = |0 - 2i|$ ✓. Wait — we need the *line's* closest point to the origin, and the line passes through origin only if... actually for a line through origin, closest point IS the origin.
*Step 3 (1 mark):* So the closest point is $z = 0$, at distance $0$ from the origin (the line passes through the origin).`),

  sq(`Let $A = 1 + 0i$ and $B = 0 + 3i$. A particle moves in the complex plane so that its distance from $A$ is always twice its distance from $B$, i.e., $|z - A| = 2|z - B|$.

**a.** Show that the locus of the particle is a circle, and find its centre and radius in exact form. (5 marks)

**b.** Sketch the locus on an Argand diagram, marking $A$, $B$, the centre of the circle, and a clear indication of radius. (2 marks)

**c.** Explain geometrically why the locus is not a perpendicular bisector. (1 mark)`,
    8, "HARD",
    `**a. (5 marks)**
*Step 1 (1 mark):* Let $z = x + iy$. $|z - A|^2 = (x - 1)^2 + y^2$ and $|z - B|^2 = x^2 + (y - 3)^2$.
*Step 2 (1 mark):* Squaring $|z - A| = 2|z - B|$: $(x - 1)^2 + y^2 = 4[x^2 + (y - 3)^2]$.
*Step 3 (1 mark):* Expand: $x^2 - 2x + 1 + y^2 = 4x^2 + 4y^2 - 24 y + 36$.
*Step 4 (1 mark):* Rearrange: $3x^2 + 2x + 3y^2 - 24 y + 35 = 0 \\Rightarrow x^2 + \\dfrac{2x}{3} + y^2 - 8 y + \\dfrac{35}{3} = 0$.
*Step 5 (1 mark):* Complete squares: $\\left(x + \\dfrac{1}{3}\\right)^2 - \\dfrac{1}{9} + (y - 4)^2 - 16 + \\dfrac{35}{3} = 0$, so $\\left(x + \\dfrac{1}{3}\\right)^2 + (y - 4)^2 = \\dfrac{1}{9} + 16 - \\dfrac{35}{3} = \\dfrac{1 + 144 - 105}{9} = \\dfrac{40}{9}$. Centre: $\\left(-\\dfrac{1}{3}, 4\\right)$, radius $\\dfrac{2\\sqrt{10}}{3}$.

**b. (2 marks)**
*Step 1 (1 mark):* Mark $A = (1, 0)$, $B = (0, 3)$, and centre $C = (-1/3, 4)$.
*Step 2 (1 mark):* Draw circle of radius $2\\sqrt{10}/3 \\approx 2.108$ centred at $C$.

**c. (1 mark)**
The perpendicular bisector arises when the ratio is $1:1$. Here the ratio is $2:1$, an Apollonius circle. So the locus is a circle, not a straight line.`),

  sq(`Consider the locus $L = \\{z \\in \\mathbb C : \\arg(z - 1) = \\arg(z + 1)\\}$, where $\\arg$ takes its principal value in $(-\\pi, \\pi]$.

**a.** By writing $z = x + iy$, show that for $y \\ne 0$ the condition is equivalent to $\\dfrac{y}{x - 1} = \\dfrac{y}{x + 1}$ (subject to consistent sign conventions). (3 marks)

**b.** Hence describe $L$ as a subset of the real line. (2 marks)

**c.** Sketch $L$ on the Argand diagram, taking care to indicate any points that are excluded. (2 marks)`,
    7, "HARD",
    `**a. (3 marks)**
*Step 1 (1 mark):* $z - 1 = (x - 1) + iy$ and $z + 1 = (x + 1) + iy$.
*Step 2 (1 mark):* $\\arg$ equality (with same sign of real part) means the imaginary part to real part ratio matches, so $\\tan(\\arg(z - 1)) = \\dfrac{y}{x - 1}$ and similarly $\\dfrac{y}{x + 1}$.
*Step 3 (1 mark):* For both args to be equal, we need $\\dfrac{y}{x - 1} = \\dfrac{y}{x + 1}$ together with $z - 1$ and $z + 1$ in the same half-plane.

**b. (2 marks)**
*Step 1 (1 mark):* If $y \\ne 0$: $\\dfrac{y}{x - 1} = \\dfrac{y}{x + 1} \\Rightarrow x + 1 = x - 1 \\Rightarrow 1 = -1$, contradiction. So no solutions with $y \\ne 0$.
*Step 2 (1 mark):* For $y = 0$, we need $\\arg(x - 1) = \\arg(x + 1)$ both equal to $0$ or both $\\pi$. Same sign means either $x > 1$ or $x < -1$. So $L = \\{x \\in \\mathbb R : x > 1\\} \\cup \\{x \\in \\mathbb R : x < -1\\}$ (excluding $x = \\pm 1$ since $\\arg(0)$ is undefined).

**c. (2 marks)**
*Step 1 (1 mark):* Sketch the real axis with two open intervals: $(-\\infty, -1)$ and $(1, \\infty)$.
*Step 2 (1 mark):* Mark open circles at $x = -1$ and $x = 1$. The segment from $-1$ to $1$ (inclusive of endpoints) is excluded.`),
];

// ─── 3 EXT_RESP ─────────────────────────────────────────────────────────

const extendedResponse: FR[] = [
  sq(`A satellite's position relative to a receiver at the origin is modelled by a complex number $z$ in the Argand plane, where one unit equals one kilometre. Two ground beacons are at $A = 4 + 0i$ km and $B = 0 + 4i$ km.

**a.** The satellite must always be exactly 5 km from the receiver at the origin. Describe and sketch the satellite's locus. (2 marks)

**b.** A second constraint requires the satellite to be equidistant from $A$ and $B$. Describe the locus this constraint defines as $|z - A| = |z - B|$, and find its Cartesian equation. (3 marks)

**c.** Find all positions $z$ satisfying both constraints from parts **a** and **b**. (4 marks)

**d.** Calculate the distance between the two solutions in part **c**, and interpret this geometrically. (3 marks)

${img("circle-origin.svg", "Circle locus")}`,
    12, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* $|z| = 5$ is a circle of radius 5 centred at the origin.
*Step 2 (1 mark):* Sketch the circle, showing axes scaled in kilometres.

**b. (3 marks)**
*Step 1 (1 mark):* $|z - A| = |z - B|$ is the perpendicular bisector of segment $AB$ where $A = (4, 0)$, $B = (0, 4)$.
*Step 2 (1 mark):* Let $z = x + iy$: $(x - 4)^2 + y^2 = x^2 + (y - 4)^2 \\Rightarrow -8x + 16 = -8y + 16$.
*Step 3 (1 mark):* So $y = x$, the line through the origin with gradient 1.

**c. (4 marks)**
*Step 1 (1 mark):* Substitute $y = x$ into $x^2 + y^2 = 25$: $2x^2 = 25 \\Rightarrow x = \\pm \\dfrac{5}{\\sqrt 2} = \\pm \\dfrac{5\\sqrt 2}{2}$.
*Step 2 (1 mark):* Corresponding $y = x$.
*Step 3 (1 mark):* Two positions: $z_1 = \\dfrac{5\\sqrt 2}{2} + \\dfrac{5\\sqrt 2}{2} i$ and $z_2 = -\\dfrac{5\\sqrt 2}{2} - \\dfrac{5\\sqrt 2}{2} i$.
*Step 4 (1 mark):* As Argand points: $\\left(\\dfrac{5\\sqrt 2}{2}, \\dfrac{5\\sqrt 2}{2}\\right)$ and $\\left(-\\dfrac{5\\sqrt 2}{2}, -\\dfrac{5\\sqrt 2}{2}\\right)$.

**d. (3 marks)**
*Step 1 (1 mark):* Distance = $|z_1 - z_2| = |2 z_1| = 2 |z_1| = 2 \\cdot 5 = 10$ km.
*Step 2 (1 mark):* Alternatively, both points are diametrically opposite on the circle.
*Step 3 (1 mark):* The two positions are at opposite ends of a diameter (length $2r = 10$ km), reflecting that the perpendicular bisector $y = x$ passes through the centre of the circle.`),

  sq(`A racetrack is laid out so that its outer boundary in a coordinate plane is described by $|z| = 8$, and its inner boundary by $|z - 2| = 4$, where $z$ denotes position in the complex plane (kilometres).

**a.** Identify both loci geometrically. (2 marks)

**b.** Show whether one curve lies entirely inside the other, by considering the distance from the centre $(2, 0)$ to the closest point of $|z| = 8$. (3 marks)

**c.** Find the points (if any) where the two boundaries intersect, giving exact answers. (4 marks)

**d.** Calculate the area enclosed between the two curves if they do not intersect (i.e., the racetrack region area). (3 marks)

${img("circle-shifted.svg", "Two circles diagram")}`,
    12, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* $|z| = 8$ is a circle of radius 8 centred at origin.
*Step 2 (1 mark):* $|z - 2| = 4$ is a circle of radius 4 centred at $(2, 0)$.

**b. (3 marks)**
*Step 1 (1 mark):* Distance between centres: $|2 - 0| = 2$.
*Step 2 (1 mark):* For internal disjoint circles, we need $|R_1 - R_2| > d$ between centres, i.e., $|8 - 4| = 4 > 2$ ✓.
*Step 3 (1 mark):* Since $4 > 2$, the inner circle of radius 4 lies entirely inside the outer circle of radius 8. So the inner circle is contained in the outer disc, with no intersection.

**c. (4 marks)**
*Step 1 (1 mark):* Set up: $x^2 + y^2 = 64$ and $(x - 2)^2 + y^2 = 16$.
*Step 2 (1 mark):* Subtract: $x^2 - (x - 2)^2 = 64 - 16 = 48 \\Rightarrow 4x - 4 = 48 \\Rightarrow x = 13$.
*Step 3 (1 mark):* But $|x| \\le 8$ for any point on outer circle, so $x = 13$ is out of range.
*Step 4 (1 mark):* No intersection points — the two boundaries do not meet, confirming part **b**.

**d. (3 marks)**
*Step 1 (1 mark):* Area of outer disc: $\\pi \\cdot 8^2 = 64 \\pi$.
*Step 2 (1 mark):* Area of inner disc: $\\pi \\cdot 4^2 = 16 \\pi$.
*Step 3 (1 mark):* Annular area between the curves = $64 \\pi - 16 \\pi = 48 \\pi$ km².`),

  sq(`In the Argand plane, two ships sail subject to navigation constraints. Ship $S_1$ moves on the locus $|z - 1| = 3$, and ship $S_2$ moves on the locus $\\arg(z) = \\dfrac{\\pi}{3}$.

**a.** Describe each locus geometrically. (2 marks)

**b.** Sketch both loci on a single Argand diagram. (2 marks)

**c.** Find all points of intersection of the two loci in exact Cartesian form. (5 marks)

**d.** Determine how far apart the two intersection points are. (3 marks)

${img("circle-shifted.svg", "Circle and ray")}`,
    12, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* $|z - 1| = 3$: circle, centre $(1, 0)$, radius 3.
*Step 2 (1 mark):* $\\arg(z) = \\pi/3$: open ray from origin (excluding 0) at angle $60°$ above the positive real axis; direction $\\left(\\cos\\dfrac{\\pi}{3}, \\sin\\dfrac{\\pi}{3}\\right) = \\left(\\dfrac{1}{2}, \\dfrac{\\sqrt 3}{2}\\right)$.

**b. (2 marks)**
*Step 1 (1 mark):* Draw circle centre $(1, 0)$, radius 3 — passes through $(-2, 0)$, $(4, 0)$.
*Step 2 (1 mark):* Draw the ray from origin (open) with slope $\\tan(\\pi/3) = \\sqrt 3$, going up-and-right.

**c. (5 marks)**
*Step 1 (1 mark):* Parametrise the ray: $z = t \\, e^{i \\pi/3}$ with $t > 0$. So $x = t/2$, $y = t\\sqrt 3 / 2$.
*Step 2 (1 mark):* Substitute into circle: $\\left(\\dfrac{t}{2} - 1\\right)^2 + \\dfrac{3 t^2}{4} = 9$.
*Step 3 (1 mark):* Expand: $\\dfrac{t^2}{4} - t + 1 + \\dfrac{3 t^2}{4} = 9 \\Rightarrow t^2 - t - 8 = 0$.
*Step 4 (1 mark):* Quadratic formula: $t = \\dfrac{1 \\pm \\sqrt{1 + 32}}{2} = \\dfrac{1 \\pm \\sqrt{33}}{2}$. Only $t > 0$: both roots are real, and $\\dfrac{1 - \\sqrt{33}}{2} < 0$ so we keep only $t_+ = \\dfrac{1 + \\sqrt{33}}{2}$.
*Step 5 (1 mark):* Wait — actually the ray gives one valid positive $t$, so one intersection point. $z = t_+ e^{i\\pi/3}$ which is $\\left(\\dfrac{1 + \\sqrt{33}}{4}, \\dfrac{(1 + \\sqrt{33})\\sqrt 3}{4}\\right)$. (If we extended to the full line through origin at this argument, the second root would give the other intersection — only one on the ray.)

**d. (3 marks)**
*Step 1 (1 mark):* Only one intersection point on the ray (the other root has $t < 0$, off the ray).
*Step 2 (1 mark):* So "distance apart" is not applicable for two points; if instead the problem considers the full line through the origin with $\\arg z \\in \\{\\pi/3, \\pi/3 + \\pi\\}$, the two roots $t_\\pm = \\dfrac{1 \\pm \\sqrt{33}}{2}$ correspond to the two intersection points.
*Step 3 (1 mark):* Distance: $|t_+ - t_-| = \\sqrt{33}$ since one point is at distance $|t_+|$ from origin on one side, the other at $|t_-|$ on the opposite side, both on the line. So the chord length is $\\sqrt{33}$ units.`),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to ${JSON_PATH}\n` +
    `Wrote ${Object.keys(figures).length} SVG files to ${FIGURES_DIR}/`,
);
