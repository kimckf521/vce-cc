/**
 * Replace 5 items in "Questions Set testing" with graph-based polynomial
 * questions. The graph is rendered as an inline SVG, base64-encoded, and
 * embedded in markdown via ![alt](data:image/svg+xml;base64,...).
 */

import { prisma } from "../lib/prisma";

// ─── SVG plotter ─────────────────────────────────────────────────────────────
interface PlotOpts {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  marks?: { x: number; y: number; label?: string }[];
  curveColor?: string;
}

function niceTickStep(span: number, pxAvailable: number, minPxPerLabel = 28): number {
  // Pick a step from {1, 2, 5} * 10^k so that each label has at least
  // minPxPerLabel pixels of room.
  const minStep = (span * minPxPerLabel) / pxAvailable;
  const pow = Math.pow(10, Math.floor(Math.log10(minStep)));
  for (const m of [1, 2, 5, 10]) {
    if (m * pow >= minStep) return m * pow;
  }
  return 10 * pow;
}

function makePolynomialSVG(f: (x: number) => number, opts: PlotOpts): string {
  const W = 440;
  const H = 340;
  const padL = 42;
  const padR = 22;
  const padT = 22;
  const padB = 32;
  const { xMin, xMax, yMin, yMax } = opts;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const sx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * plotW;
  const sy = (y: number) => padT + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

  // Auto-pick tick step so labels never overlap
  const xStep = niceTickStep(xMax - xMin, plotW, 30);
  const yStep = niceTickStep(yMax - yMin, plotH, 22);

  // Snap first tick to a multiple of step
  const firstXTick = Math.ceil(xMin / xStep) * xStep;
  const firstYTick = Math.ceil(yMin / yStep) * yStep;

  const parts: string[] = [];
  parts.push(`<rect width="${W}" height="${H}" fill="white"/>`);

  // Grid lines at tick positions only
  for (let x = firstXTick; x <= xMax + 1e-9; x += xStep) {
    parts.push(
      `<line x1="${sx(x)}" y1="${padT}" x2="${sx(x)}" y2="${padT + plotH}" stroke="#e5e7eb" stroke-width="0.6"/>`
    );
  }
  for (let y = firstYTick; y <= yMax + 1e-9; y += yStep) {
    parts.push(
      `<line x1="${padL}" y1="${sy(y)}" x2="${padL + plotW}" y2="${sy(y)}" stroke="#e5e7eb" stroke-width="0.6"/>`
    );
  }

  // Plot area border
  parts.push(
    `<rect x="${padL}" y="${padT}" width="${plotW}" height="${plotH}" fill="none" stroke="#d1d5db" stroke-width="0.8"/>`
  );

  // Axes (only if 0 is in range)
  if (yMin <= 0 && yMax >= 0) {
    parts.push(
      `<line x1="${padL}" y1="${sy(0)}" x2="${padL + plotW}" y2="${sy(0)}" stroke="#374151" stroke-width="1.5"/>`
    );
  }
  if (xMin <= 0 && xMax >= 0) {
    parts.push(
      `<line x1="${sx(0)}" y1="${padT}" x2="${sx(0)}" y2="${padT + plotH}" stroke="#374151" stroke-width="1.5"/>`
    );
  }

  // Tick labels — placed along the axes (textbook style), but with
  // auto-stepped tick spacing so they cannot crowd or overlap.
  const fmt = (v: number) => {
    const r = Math.round(v * 1000) / 1000;
    return r.toString();
  };
  const xAxisY = yMin <= 0 && yMax >= 0 ? sy(0) : padT + plotH;
  const yAxisX = xMin <= 0 && xMax >= 0 ? sx(0) : padL;
  // x-tick labels: just below the x-axis
  for (let x = firstXTick; x <= xMax + 1e-9; x += xStep) {
    if (Math.abs(x) < 1e-9) continue; // skip 0 (origin label handled below)
    parts.push(
      `<text x="${sx(x)}" y="${xAxisY + 14}" font-size="12" font-family="serif" text-anchor="middle" fill="#111">${fmt(x)}</text>`
    );
  }
  // y-tick labels: just left of the y-axis
  for (let y = firstYTick; y <= yMax + 1e-9; y += yStep) {
    if (Math.abs(y) < 1e-9) continue;
    parts.push(
      `<text x="${yAxisX - 6}" y="${sy(y) + 4}" font-size="12" font-family="serif" text-anchor="end" fill="#111">${fmt(y)}</text>`
    );
  }
  // Origin "0" label (only when both axes pass through interior)
  if (xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0) {
    parts.push(
      `<text x="${yAxisX - 6}" y="${xAxisY + 14}" font-size="12" font-family="serif" text-anchor="end" fill="#111">0</text>`
    );
  }
  // Axis name labels
  parts.push(
    `<text x="${padL + plotW + 4}" y="${xAxisY + 5}" font-size="14" font-style="italic" font-family="serif" fill="#111">x</text>`
  );
  parts.push(
    `<text x="${yAxisX + 6}" y="${padT - 6}" font-size="14" font-style="italic" font-family="serif" fill="#111">y</text>`
  );

  // Curve — sample and split into segments that stay within y range
  const N = 500;
  const segments: string[][] = [];
  let current: string[] = [];
  for (let i = 0; i <= N; i++) {
    const x = xMin + (i / N) * (xMax - xMin);
    const y = f(x);
    if (Number.isFinite(y) && y >= yMin - 0.5 && y <= yMax + 0.5) {
      current.push(`${sx(x).toFixed(2)},${sy(Math.max(yMin, Math.min(yMax, y))).toFixed(2)}`);
    } else if (current.length > 0) {
      segments.push(current);
      current = [];
    }
  }
  if (current.length > 0) segments.push(current);

  const color = opts.curveColor ?? "#2563eb";
  for (const seg of segments) {
    parts.push(
      `<polyline points="${seg.join(" ")}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`
    );
  }

  // Marked points
  for (const m of opts.marks ?? []) {
    parts.push(
      `<circle cx="${sx(m.x)}" cy="${sy(m.y)}" r="3.5" fill="#dc2626" stroke="white" stroke-width="1.2"/>`
    );
    if (m.label) {
      parts.push(
        `<text x="${sx(m.x) + 6}" y="${sy(m.y) - 6}" font-size="11" font-family="serif" fill="#dc2626">${m.label}</text>`
      );
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${parts.join("")}</svg>`;
}

function svgToMarkdownImage(svg: string, alt: string): string {
  const b64 = Buffer.from(svg, "utf-8").toString("base64");
  return `![${alt}](data:image/svg+xml;base64,${b64})`;
}

// ─── Questions ────────────────────────────────────────────────────────────────

interface GraphMCQ {
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  solutionContent: string;
}

const questions: GraphMCQ[] = [];

// Q1: cubic with three distinct roots at -2, 1, 3
{
  const f = (x: number) => (x + 2) * (x - 1) * (x - 3);
  const svg = makePolynomialSVG(f, {
    xMin: -4,
    xMax: 5,
    yMin: -10,
    yMax: 12,
    marks: [
      { x: -2, y: 0 },
      { x: 1, y: 0 },
      { x: 3, y: 0 },
    ],
  });
  const img = svgToMarkdownImage(svg, "Graph of cubic p(x)");
  questions.push({
    content: `The graph of $y = p(x)$, where $p(x)$ is a cubic polynomial, is shown below.\n\n${img}\n\nWhich of the following is the rule for $p(x)$?`,
    optionA: "$p(x) = (x - 2)(x + 1)(x + 3)$",
    optionB: "$p(x) = (x + 2)(x - 1)(x - 3)$",
    optionC: "$p(x) = (x + 2)(x + 1)(x - 3)$",
    optionD: "$p(x) = -(x + 2)(x - 1)(x - 3)$",
    correctOption: "B",
    difficulty: "MEDIUM",
    solutionContent:
      "**Step 1 (1 mark):** Read the $x$-intercepts from the graph.\n\nThe graph crosses the $x$-axis at $x = -2$, $x = 1$, and $x = 3$, so the factors are $(x + 2), (x - 1), (x - 3)$. The positive leading coefficient matches the cubic shape (down on the left, up on the right).\n\n**Answer: B**",
  });
}

// Q2: parabola y = x^2 - 4
{
  const f = (x: number) => x * x - 4;
  const svg = makePolynomialSVG(f, {
    xMin: -4,
    xMax: 4,
    yMin: -6,
    yMax: 8,
    marks: [
      { x: -2, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: -4 },
    ],
  });
  const img = svgToMarkdownImage(svg, "Graph of parabola");
  questions.push({
    content: `The graph of $y = p(x)$ is shown below.\n\n${img}\n\nThe set of $x$ values for which $p(x) \\leq 0$ is:`,
    optionA: "$x \\leq -2$ or $x \\geq 2$",
    optionB: "$-2 \\leq x \\leq 2$",
    optionC: "$-2 < x < 2$",
    optionD: "$x \\leq 0$",
    correctOption: "B",
    difficulty: "EASY",
    solutionContent:
      "**Step 1 (1 mark):** Read the interval where the curve is on or below the $x$-axis.\n\nThe parabola is at or below the $x$-axis between its zeros at $x = -2$ and $x = 2$. Including the endpoints (because of $\\leq$): $-2 \\leq x \\leq 2$.\n\n**Answer: B**",
  });
}

// Q3: cubic with double root, y = -(x + 1)(x - 2)^2
{
  const f = (x: number) => -(x + 1) * (x - 2) * (x - 2);
  const svg = makePolynomialSVG(f, {
    xMin: -3,
    xMax: 5,
    yMin: -8,
    yMax: 12,
    marks: [
      { x: -1, y: 0 },
      { x: 2, y: 0 },
    ],
  });
  const img = svgToMarkdownImage(svg, "Graph of cubic with double root");
  questions.push({
    content: `The graph of a cubic polynomial $y = p(x)$ is shown below.\n\n${img}\n\nWhich of the following best describes the roots of $p(x) = 0$?`,
    optionA: "Three distinct real roots",
    optionB: "One real root (at $x = -1$) and no other real roots",
    optionC: "A simple root at $x = -1$ and a double root at $x = 2$",
    optionD: "A double root at $x = -1$ and a simple root at $x = 2$",
    correctOption: "C",
    difficulty: "MEDIUM",
    solutionContent:
      "**Step 1 (1 mark):** Identify roots by behaviour at each $x$-intercept.\n\nAt $x = -1$ the curve crosses the $x$-axis — a simple (multiplicity 1) root. At $x = 2$ the curve touches the $x$-axis and turns around without crossing — a double (multiplicity 2) root. Total multiplicity $= 3$, consistent with a cubic.\n\n**Answer: C**",
  });
}

// Q4: quartic y = x^4 - 5x^2 + 4
{
  const f = (x: number) => x * x * x * x - 5 * x * x + 4;
  const svg = makePolynomialSVG(f, {
    xMin: -3,
    xMax: 3,
    yMin: -4,
    yMax: 8,
    marks: [
      { x: -2, y: 0 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ],
  });
  const img = svgToMarkdownImage(svg, "Graph of quartic");
  questions.push({
    content: `The graph of a quartic polynomial $y = p(x)$ is shown below.\n\n${img}\n\nThe number of distinct real solutions to the equation $p(x) = 0$ is:`,
    optionA: "$2$",
    optionB: "$3$",
    optionC: "$4$",
    optionD: "$0$",
    correctOption: "C",
    difficulty: "EASY",
    solutionContent:
      "**Step 1 (1 mark):** Count the $x$-intercepts.\n\nThe graph crosses the $x$-axis at four distinct points: $x = -2, -1, 1, 2$. So $p(x) = 0$ has $4$ distinct real solutions.\n\n**Answer: C**",
  });
}

// Q5: quadratic y = -(x - 1)(x + 3) with turning point
{
  const f = (x: number) => -(x - 1) * (x + 3);
  const svg = makePolynomialSVG(f, {
    xMin: -5,
    xMax: 3,
    yMin: -6,
    yMax: 6,
    marks: [
      { x: -3, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 4, label: "(-1, 4)" },
    ],
  });
  const img = svgToMarkdownImage(svg, "Graph of downward parabola");
  questions.push({
    content: `The graph of $y = p(x)$ is shown below, with turning point $(-1, 4)$ marked.\n\n${img}\n\nThe rule for $p(x)$ is:`,
    optionA: "$p(x) = (x - 1)(x + 3)$",
    optionB: "$p(x) = -(x - 1)(x + 3)$",
    optionC: "$p(x) = -(x + 1)(x - 3)$",
    optionD: "$p(x) = (x + 1)(x - 3)$",
    correctOption: "B",
    difficulty: "MEDIUM",
    solutionContent:
      "**Step 1 (1 mark):** Use the $x$-intercepts and concavity.\n\nThe graph has $x$-intercepts at $x = -3$ and $x = 1$, so it has factors $(x + 3)$ and $(x - 1)$. Because the parabola opens downward (turning point is a maximum), the leading coefficient is negative: $p(x) = -(x - 1)(x + 3)$. Check: $p(-1) = -(-2)(2) = 4$ ✓.\n\n**Answer: B**",
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const set = await prisma.questionSet.findFirst({
    where: { name: "Questions Set testing" },
  });
  if (!set) throw new Error("Question set not found");

  // Take the first 5 MCQ items (by order) and replace their content.
  const items = await prisma.questionSetItem.findMany({
    where: { questionSetId: set.id, type: "MCQ" },
    orderBy: { order: "asc" },
    take: 5,
  });
  if (items.length < 5) throw new Error(`Only found ${items.length} MCQ items`);

  for (let i = 0; i < 5; i++) {
    const item = items[i];
    const q = questions[i];
    await prisma.questionSetItem.update({
      where: { id: item.id },
      data: {
        content: q.content,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        difficulty: q.difficulty,
        solutionContent: q.solutionContent,
      },
    });
    console.log(`✅ Updated MCQ ${i + 1} (order=${item.order}) — ${q.difficulty}`);
  }

  console.log(`\n🎉 Replaced 5 MCQs with graph-based questions`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
