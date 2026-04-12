/**
 * Generate scripts/output/qset-exponent-and-logarithm-laws.json
 *
 * Builds a full question set for the "Exponent and Logarithm Laws" subtopic
 * in the "Algebra, Number, and Structure" topic:
 *   - 20 MCQ (1 mark each)
 *   - 10 Short Answer (2–4 marks)
 *   - 5 Extended Response (VCE Exam 2 Section B style)
 *
 * SVG graph plotter is inlined so graph questions embed as base64 data URLs.
 * Auto-stepped tick spacing so axis labels never overlap.
 */

import fs from "fs";
import path from "path";

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
  const minStep = (span * minPxPerLabel) / pxAvailable;
  const pow = Math.pow(10, Math.floor(Math.log10(minStep)));
  for (const m of [1, 2, 5, 10]) {
    if (m * pow >= minStep) return m * pow;
  }
  return 10 * pow;
}

function makeSVG(f: (x: number) => number, opts: PlotOpts): string {
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

  const xStep = niceTickStep(xMax - xMin, plotW, 30);
  const yStep = niceTickStep(yMax - yMin, plotH, 22);
  const firstXTick = Math.ceil(xMin / xStep) * xStep;
  const firstYTick = Math.ceil(yMin / yStep) * yStep;

  const parts: string[] = [];
  parts.push(`<rect width="${W}" height="${H}" fill="white"/>`);

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

  parts.push(
    `<rect x="${padL}" y="${padT}" width="${plotW}" height="${plotH}" fill="none" stroke="#d1d5db" stroke-width="0.8"/>`
  );

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

  const fmt = (v: number) => {
    const r = Math.round(v * 1000) / 1000;
    return r.toString();
  };
  const xAxisY = yMin <= 0 && yMax >= 0 ? sy(0) : padT + plotH;
  const yAxisX = xMin <= 0 && xMax >= 0 ? sx(0) : padL;

  for (let x = firstXTick; x <= xMax + 1e-9; x += xStep) {
    if (Math.abs(x) < 1e-9) continue;
    parts.push(
      `<text x="${sx(x)}" y="${xAxisY + 14}" font-size="12" font-family="serif" text-anchor="middle" fill="#111">${fmt(x)}</text>`
    );
  }
  for (let y = firstYTick; y <= yMax + 1e-9; y += yStep) {
    if (Math.abs(y) < 1e-9) continue;
    parts.push(
      `<text x="${yAxisX - 6}" y="${sy(y) + 4}" font-size="12" font-family="serif" text-anchor="end" fill="#111">${fmt(y)}</text>`
    );
  }
  if (xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0) {
    parts.push(
      `<text x="${yAxisX - 6}" y="${xAxisY + 14}" font-size="12" font-family="serif" text-anchor="end" fill="#111">0</text>`
    );
  }

  parts.push(
    `<text x="${padL + plotW + 4}" y="${xAxisY + 5}" font-size="14" font-style="italic" font-family="serif" fill="#111">x</text>`
  );
  parts.push(
    `<text x="${yAxisX + 6}" y="${padT - 6}" font-size="14" font-style="italic" font-family="serif" fill="#111">y</text>`
  );

  // Sample curve, split into segments inside y range
  const N = 500;
  const segments: string[][] = [];
  let current: string[] = [];
  for (let i = 0; i <= N; i++) {
    const x = xMin + (i / N) * (xMax - xMin);
    const y = f(x);
    if (Number.isFinite(y) && y >= yMin - 0.5 && y <= yMax + 0.5) {
      current.push(
        `${sx(x).toFixed(2)},${sy(Math.max(yMin, Math.min(yMax, y))).toFixed(2)}`
      );
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

function graphImage(
  f: (x: number) => number,
  opts: PlotOpts,
  alt: string
): string {
  const svg = makeSVG(f, opts);
  const b64 = Buffer.from(svg, "utf-8").toString("base64");
  return `![${alt}](data:image/svg+xml;base64,${b64})`;
}

// ─── Chained-equality splitter ───────────────────────────────────────────────
// Rewrite every `$$A = B = C$$` block into
//   `$$A = B$$\n\n$$= C$$`
// so that each derivation step sits on its own display-math line, as the
// question-set spec requires. Skip blocks that already contain list
// separators (comma, \quad, \qquad, \;, \\) because those are parallel
// equations, not a chain.
function splitChain(body: string): string[] | null {
  // Locate every `=` at depth 0 (outside of {}, (), []).
  const eqPositions: number[] = [];
  let depth = 0;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === "(" || c === "{" || c === "[") depth++;
    else if (c === ")" || c === "}" || c === "]") depth--;
    else if (c === "=" && depth === 0) eqPositions.push(i);
  }
  if (eqPositions.length < 2) return null;
  // If any list separator appears BETWEEN the first and last `=`, this is
  // a multi-equation line (e.g. "A = x, \quad B = y"), not a chain.
  const interior = body.slice(
    eqPositions[0],
    eqPositions[eqPositions.length - 1]
  );
  if (/,|\\quad|\\qquad|\\\\|\\implies|\\Rightarrow|\\iff|\\Leftrightarrow/.test(interior)) {
    return null;
  }
  const blocks: string[] = [];
  let start = 0;
  for (let i = 1; i < eqPositions.length; i++) {
    blocks.push(body.slice(start, eqPositions[i]).trim());
    start = eqPositions[i];
  }
  blocks.push(body.slice(start).trim());
  return blocks;
}

function dechainSolution(content: string): string {
  // Process display math blocks ($$...$$)
  return content.replace(/\$\$([\s\S]*?)\$\$/g, (match, body) => {
    const split = splitChain(body);
    if (!split) return match;
    return split.map((b) => `$$${b}$$`).join("\n\n");
  });
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface MCQ {
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  marks: 1;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  solutionContent: string;
  subtopicSlugs: string[];
}

interface FR {
  content: string;
  marks: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  solutionContent: string;
  subtopicSlugs: string[];
}

const SUBTOPIC = ["exponent-and-logarithm-laws"];

// ─── MCQs ────────────────────────────────────────────────────────────────────
const mcq: MCQ[] = [];

// --- EASY (6) ---
mcq.push({
  content: "Simplify $2^5 \\times 2^3$.",
  optionA: "$2^{15}$",
  optionB: "$2^8$",
  optionC: "$4^8$",
  optionD: "$4^{15}$",
  correctOption: "B",
  marks: 1,
  difficulty: "EASY",
  solutionContent:
    "**Step 1 (1 mark):** Apply the index law $a^m \\times a^n = a^{m+n}$.\n\n$$2^5 \\times 2^3 = 2^{5+3} = 2^8.$$\n\n**Answer: B**",
  subtopicSlugs: SUBTOPIC,
});

mcq.push({
  content: "$\\log_2 16$ equals:",
  optionA: "$2$",
  optionB: "$4$",
  optionC: "$8$",
  optionD: "$16$",
  correctOption: "B",
  marks: 1,
  difficulty: "EASY",
  solutionContent:
    "**Step 1 (1 mark):** Write $16$ as a power of $2$.\n\n$$16 = 2^4,$$\n\nso $\\log_2 16 = 4$.\n\n**Answer: B**",
  subtopicSlugs: SUBTOPIC,
});

mcq.push({
  content: "$\\dfrac{3^7}{3^2}$ equals:",
  optionA: "$3^{14}$",
  optionB: "$3^{9}$",
  optionC: "$3^{5}$",
  optionD: "$1^{5}$",
  correctOption: "C",
  marks: 1,
  difficulty: "EASY",
  solutionContent:
    "**Step 1 (1 mark):** Apply $\\dfrac{a^m}{a^n} = a^{m-n}$.\n\n$$\\dfrac{3^7}{3^2} = 3^{7-2} = 3^5.$$\n\n**Answer: C**",
  subtopicSlugs: SUBTOPIC,
});

mcq.push({
  content: "The value of $\\log_{10} 1$ is:",
  optionA: "$0$",
  optionB: "$1$",
  optionC: "$10$",
  optionD: "undefined",
  correctOption: "A",
  marks: 1,
  difficulty: "EASY",
  solutionContent:
    "**Step 1 (1 mark):** Since $10^0 = 1$, by definition of a logarithm,\n\n$$\\log_{10} 1 = 0.$$\n\n**Answer: A**",
  subtopicSlugs: SUBTOPIC,
});

mcq.push({
  content: "Simplify $(5^2)^3$.",
  optionA: "$5^5$",
  optionB: "$5^6$",
  optionC: "$5^8$",
  optionD: "$25^3$",
  correctOption: "B",
  marks: 1,
  difficulty: "EASY",
  solutionContent:
    "**Step 1 (1 mark):** Apply $(a^m)^n = a^{mn}$.\n\n$$(5^2)^3 = 5^{2 \\times 3} = 5^6.$$\n\n**Answer: B**",
  subtopicSlugs: SUBTOPIC,
});

mcq.push({
  content: "The value of $16^{1/2}$ is:",
  optionA: "$4$",
  optionB: "$8$",
  optionC: "$32$",
  optionD: "$256$",
  correctOption: "A",
  marks: 1,
  difficulty: "EASY",
  solutionContent:
    "**Step 1 (1 mark):** Apply $a^{1/2} = \\sqrt{a}$.\n\n$$16^{1/2} = \\sqrt{16} = 4.$$\n\n**Answer: A**",
  subtopicSlugs: SUBTOPIC,
});

// --- MEDIUM (10) ---
mcq.push({
  content: "The expression $(a^3 b^2)^2 \\cdot a^2 b^3$ simplifies to:",
  optionA: "$a^8 b^7$",
  optionB: "$a^{10} b^7$",
  optionC: "$a^8 b^{12}$",
  optionD: "$a^6 b^5$",
  correctOption: "A",
  marks: 1,
  difficulty: "MEDIUM",
  solutionContent:
    "**Step 1 (1 mark):** Expand and combine using index laws.\n\n$$(a^3 b^2)^2 = a^6 b^4,$$\n\nso\n\n$$(a^3 b^2)^2 \\cdot a^2 b^3 = a^6 b^4 \\cdot a^2 b^3 = a^{6+2} b^{4+3} = a^8 b^7.$$\n\n**Answer: A**",
  subtopicSlugs: SUBTOPIC,
});

mcq.push({
  content: "$\\log_2 24 - \\log_2 3$ equals:",
  optionA: "$\\log_2 21$",
  optionB: "$8$",
  optionC: "$3$",
  optionD: "$\\log_2 72$",
  correctOption: "C",
  marks: 1,
  difficulty: "MEDIUM",
  solutionContent:
    "**Step 1 (1 mark):** Use the quotient law $\\log_a x - \\log_a y = \\log_a(x/y)$.\n\n$$\\log_2 24 - \\log_2 3 = \\log_2 \\frac{24}{3} = \\log_2 8 = 3.$$\n\n**Answer: C**",
  subtopicSlugs: SUBTOPIC,
});

mcq.push({
  content: "The value of $27^{2/3}$ is:",
  optionA: "$6$",
  optionB: "$9$",
  optionC: "$18$",
  optionD: "$81$",
  correctOption: "B",
  marks: 1,
  difficulty: "MEDIUM",
  solutionContent:
    "**Step 1 (1 mark):** Apply $a^{m/n} = (a^{1/n})^m$.\n\n$$27^{2/3} = (27^{1/3})^2 = 3^2 = 9.$$\n\n**Answer: B**",
  subtopicSlugs: SUBTOPIC,
});

mcq.push({
  content:
    "Using the change-of-base rule, $\\log_2 5$ can be written as:",
  optionA: "$\\dfrac{\\log_{10} 2}{\\log_{10} 5}$",
  optionB: "$\\dfrac{\\log_{10} 5}{\\log_{10} 2}$",
  optionC: "$\\log_{10} 5 - \\log_{10} 2$",
  optionD: "$\\log_{10} 10$",
  correctOption: "B",
  marks: 1,
  difficulty: "MEDIUM",
  solutionContent:
    "**Step 1 (1 mark):** Apply $\\log_a b = \\dfrac{\\log_c b}{\\log_c a}$ with $c = 10$.\n\n$$\\log_2 5 = \\dfrac{\\log_{10} 5}{\\log_{10} 2}.$$\n\n**Answer: B**",
  subtopicSlugs: SUBTOPIC,
});

// MCQ with GRAPH 1: y = 2^x
mcq.push({
  content: `The graph of a function $y = f(x)$ is shown below.\n\n${graphImage(
    (x) => Math.pow(2, x),
    {
      xMin: -3,
      xMax: 4,
      yMin: -2,
      yMax: 16,
      marks: [
        { x: 0, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 4 },
        { x: 3, y: 8 },
      ],
    },
    "Graph of y = 2^x"
  )}\n\nWhich of the following is the rule for $f(x)$?`,
  optionA: "$f(x) = 2x$",
  optionB: "$f(x) = x^2$",
  optionC: "$f(x) = 2^x$",
  optionD: "$f(x) = \\log_2 x$",
  correctOption: "C",
  marks: 1,
  difficulty: "MEDIUM",
  solutionContent:
    "**Step 1 (1 mark):** Read marked points and test.\n\nThe graph passes through $(0, 1), (1, 2), (2, 4), (3, 8)$. Each time $x$ increases by $1$, $y$ doubles. This is exponential growth with base $2$, so\n\n$$f(x) = 2^x.$$\n\n**Answer: C**",
  subtopicSlugs: SUBTOPIC,
});

// MCQ with GRAPH 2: y = log_2 x
mcq.push({
  content: `The graph of $y = g(x)$ is shown below.\n\n${graphImage(
    (x) => Math.log2(x),
    {
      xMin: -1,
      xMax: 10,
      yMin: -4,
      yMax: 4,
      marks: [
        { x: 1, y: 0 },
        { x: 2, y: 1 },
        { x: 4, y: 2 },
        { x: 8, y: 3 },
      ],
    },
    "Graph of y = log_2 x"
  )}\n\nThe rule for $g(x)$ is:`,
  optionA: "$g(x) = 2^x$",
  optionB: "$g(x) = \\log_2 x$",
  optionC: "$g(x) = \\log_{10} x$",
  optionD: "$g(x) = \\sqrt{x}$",
  correctOption: "B",
  marks: 1,
  difficulty: "MEDIUM",
  solutionContent:
    "**Step 1 (1 mark):** Check the marked points.\n\nThe graph passes through $(1, 0), (2, 1), (4, 2), (8, 3)$. Each time $x$ doubles, $y$ increases by $1$, matching $\\log_2 x$:\n\n$$g(x) = \\log_2 x.$$\n\n**Answer: B**",
  subtopicSlugs: SUBTOPIC,
});

// MCQ with GRAPH 3: y = (1/2)^x (decay)
mcq.push({
  content: `The graph below shows an exponential function $y = h(x)$.\n\n${graphImage(
    (x) => Math.pow(0.5, x),
    {
      xMin: -3,
      xMax: 4,
      yMin: -2,
      yMax: 10,
      marks: [
        { x: -2, y: 4 },
        { x: -1, y: 2 },
        { x: 0, y: 1 },
        { x: 1, y: 0.5 },
      ],
    },
    "Graph of y = (1/2)^x"
  )}\n\nWhich of the following is the rule for $h(x)$?`,
  optionA: "$h(x) = 2^x$",
  optionB: "$h(x) = \\left(\\tfrac{1}{2}\\right)^x$",
  optionC: "$h(x) = -2^x$",
  optionD: "$h(x) = \\log_2 x$",
  correctOption: "B",
  marks: 1,
  difficulty: "MEDIUM",
  solutionContent:
    "**Step 1 (1 mark):** Observe the decay pattern.\n\nAs $x$ increases by $1$, $y$ halves: $h(0) = 1,\\, h(1) = \\tfrac12,\\, h(-1) = 2$. This matches the decay exponential\n\n$$h(x) = \\left(\\tfrac{1}{2}\\right)^x = 2^{-x}.$$\n\n**Answer: B**",
  subtopicSlugs: SUBTOPIC,
});

// MCQ with TABLE 1: values of 2^x
mcq.push({
  content:
    "A table of values of $2^x$ is shown below.\n\n| $x$ | $0$ | $1$ | $2$ | $3$ | $4$ | $5$ |\n|---|---|---|---|---|---|---|\n| $2^x$ | $1$ | $2$ | $4$ | $8$ | $16$ | $32$ |\n\nUsing the table, the value of $\\log_2 32$ is:",
  optionA: "$2$",
  optionB: "$4$",
  optionC: "$5$",
  optionD: "$16$",
  correctOption: "C",
  marks: 1,
  difficulty: "MEDIUM",
  solutionContent:
    "**Step 1 (1 mark):** Read the table.\n\nFrom the table, $2^5 = 32$, so $\\log_2 32 = 5$.\n\n**Answer: C**",
  subtopicSlugs: SUBTOPIC,
});

// MCQ with TABLE 2: log_10 values for change of base / product
mcq.push({
  content:
    "Some values of $\\log_{10} x$ are given below.\n\n| $x$ | $2$ | $3$ | $5$ | $7$ |\n|---|---|---|---|---|\n| $\\log_{10} x$ | $0.301$ | $0.477$ | $0.699$ | $0.845$ |\n\nUsing only the table, the value of $\\log_{10} 15$ is closest to:",
  optionA: "$0.398$",
  optionB: "$1.176$",
  optionC: "$1.322$",
  optionD: "$2.176$",
  correctOption: "B",
  marks: 1,
  difficulty: "MEDIUM",
  solutionContent:
    "**Step 1 (1 mark):** Use $\\log(xy) = \\log x + \\log y$.\n\n$$\\log_{10} 15 = \\log_{10} 3 + \\log_{10} 5$$\n\n$$= 0.477 + 0.699$$\n\n$$= 1.176.$$\n\n**Answer: B**",
  subtopicSlugs: SUBTOPIC,
});

mcq.push({
  content:
    "A rectangle has length $2^{n+1}$ cm and width $2^{n-1}$ cm, where $n$ is a positive integer. The area of the rectangle, in cm$^2$, is:",
  optionA: "$2^{2n}$",
  optionB: "$2^{n^2-1}$",
  optionC: "$4^{n}$",
  optionD: "$2^{2n-1}$",
  correctOption: "A",
  marks: 1,
  difficulty: "MEDIUM",
  solutionContent:
    "**Step 1 (1 mark):** Multiply and apply $a^m \\cdot a^n = a^{m+n}$.\n\n$$\\text{Area} = 2^{n+1} \\cdot 2^{n-1}$$\n\n$$= 2^{(n+1)+(n-1)}$$\n\n$$= 2^{2n}.$$\n\n**Answer: A**",
  subtopicSlugs: SUBTOPIC,
});

// --- HARD (4) ---
mcq.push({
  content:
    "Given $\\log_a 2 = p$ and $\\log_a 3 = q$, the value of $\\log_a 72$ is:",
  optionA: "$6pq$",
  optionB: "$3p + 2q$",
  optionC: "$2p + 3q$",
  optionD: "$pq + 1$",
  correctOption: "B",
  marks: 1,
  difficulty: "HARD",
  solutionContent:
    "**Step 1 (1 mark):** Factor $72$ into prime powers and apply log laws.\n\n$$72 = 2^3 \\cdot 3^2,$$\n\nso\n\n$$\\log_a 72 = 3 \\log_a 2 + 2 \\log_a 3 = 3p + 2q.$$\n\n**Answer: B**",
  subtopicSlugs: SUBTOPIC,
});

mcq.push({
  content:
    "The value of $\\dfrac{\\log_2 81}{\\log_2 9}$ is:",
  optionA: "$2$",
  optionB: "$4$",
  optionC: "$\\log_2 9$",
  optionD: "$9$",
  correctOption: "A",
  marks: 1,
  difficulty: "HARD",
  solutionContent:
    "**Step 1 (1 mark):** Use the power law and cancel.\n\n$$\\log_2 81 = \\log_2 3^4 = 4 \\log_2 3,$$\n\n$$\\log_2 9 = \\log_2 3^2 = 2 \\log_2 3.$$\n\nSo\n\n$$\\dfrac{\\log_2 81}{\\log_2 9} = \\dfrac{4 \\log_2 3}{2 \\log_2 3} = 2.$$\n\n**Answer: A**",
  subtopicSlugs: SUBTOPIC,
});

// MCQ with GRAPH 4: y = 3^x with marked points
mcq.push({
  content: `The graph of an exponential function $y = f(x) = a^x$ is shown below, passing through the marked points.\n\n${graphImage(
    (x) => Math.pow(3, x),
    {
      xMin: -2,
      xMax: 3,
      yMin: -2,
      yMax: 30,
      marks: [
        { x: 0, y: 1 },
        { x: 1, y: 3, label: "(1, 3)" },
        { x: 2, y: 9, label: "(2, 9)" },
      ],
    },
    "Graph of y = 3^x"
  )}\n\nThe value of $a$ is:`,
  optionA: "$2$",
  optionB: "$3$",
  optionC: "$9$",
  optionD: "$\\log_3 9$",
  correctOption: "B",
  marks: 1,
  difficulty: "HARD",
  solutionContent:
    "**Step 1 (1 mark):** Use a marked point.\n\nSince the curve passes through $(1, 3)$,\n\n$$a^1 = 3,$$\n\nso $a = 3$. Check with $(2, 9)$: $3^2 = 9$. ✓\n\n**Answer: B**",
  subtopicSlugs: SUBTOPIC,
});

mcq.push({
  content:
    "A cube has volume $8^{k+2}$, where $k$ is a positive integer. The side length of the cube, expressed as a power of $2$, is:",
  optionA: "$2^{k+2}$",
  optionB: "$2^{3k+6}$",
  optionC: "$2^{k+6}$",
  optionD: "$2^{3(k+2)^3}$",
  correctOption: "A",
  marks: 1,
  difficulty: "HARD",
  solutionContent:
    "**Step 1 (1 mark):** Rewrite the volume as a power of $2$ and take the cube root.\n\n$$V = 8^{k+2} = (2^3)^{k+2} = 2^{3(k+2)} = 2^{3k+6}.$$\n\nThe side length is $s = V^{1/3}$:\n\n$$s = \\left(2^{3k+6}\\right)^{1/3} = 2^{k+2}.$$\n\n**Answer: A**",
  subtopicSlugs: SUBTOPIC,
});

// ─── Short answer ────────────────────────────────────────────────────────────
const shortAnswer: FR[] = [];

shortAnswer.push({
  content: "Simplify $\\dfrac{x^7 y^4}{x^3 y^2}$.",
  marks: 2,
  difficulty: "EASY",
  solutionContent:
    "**Step 1 (1 mark):** Apply the quotient law to each variable.\n\n$$\\dfrac{x^7 y^4}{x^3 y^2} = x^{7-3} \\cdot y^{4-2}.$$\n\n**Step 2 (1 mark):** Simplify the exponents.\n\n$$= x^4 y^2.$$",
  subtopicSlugs: SUBTOPIC,
});

shortAnswer.push({
  content: "Evaluate $\\log_3 81 + \\log_3 \\dfrac{1}{9}$.",
  marks: 2,
  difficulty: "EASY",
  solutionContent:
    "**Step 1 (1 mark):** Evaluate each log separately.\n\n$$\\log_3 81 = \\log_3 3^4 = 4,$$\n\n$$\\log_3 \\tfrac{1}{9} = \\log_3 3^{-2} = -2.$$\n\n**Step 2 (1 mark):** Add the results.\n\n$$4 + (-2) = 2.$$",
  subtopicSlugs: SUBTOPIC,
});

shortAnswer.push({
  content: "Evaluate $16^{3/4} \\times 9^{1/2}$ without a calculator.",
  marks: 2,
  difficulty: "MEDIUM",
  solutionContent:
    "**Step 1 (1 mark):** Evaluate $16^{3/4}$ by writing $16 = 2^4$.\n\n$$16^{3/4} = (2^4)^{3/4} = 2^3 = 8.$$\n\n**Step 2 (1 mark):** Evaluate $9^{1/2}$ and multiply.\n\n$$9^{1/2} = 3,$$\n\n$$8 \\times 3 = 24.$$",
  subtopicSlugs: SUBTOPIC,
});

shortAnswer.push({
  content:
    "Express $3\\log_2 x - 2\\log_2 y + \\log_2 z$ as a single logarithm.",
  marks: 3,
  difficulty: "MEDIUM",
  solutionContent:
    "**Step 1 (1 mark):** Apply the power law to move the coefficients inside.\n\n$$3 \\log_2 x = \\log_2 x^3,$$\n\n$$2 \\log_2 y = \\log_2 y^2.$$\n\n**Step 2 (1 mark):** Combine using the quotient law.\n\n$$\\log_2 x^3 - \\log_2 y^2 = \\log_2 \\dfrac{x^3}{y^2}.$$\n\n**Step 3 (1 mark):** Add $\\log_2 z$ using the product law.\n\n$$\\log_2 \\dfrac{x^3}{y^2} + \\log_2 z = \\log_2 \\dfrac{x^3 z}{y^2}.$$",
  subtopicSlugs: SUBTOPIC,
});

shortAnswer.push({
  content:
    "Given $\\log_a 2 = 0.30$ and $\\log_a 5 = 0.70$, find the exact value of $\\log_a 200$.",
  marks: 3,
  difficulty: "MEDIUM",
  solutionContent:
    "**Step 1 (1 mark):** Factor $200$ into prime powers.\n\n$$200 = 2^3 \\cdot 5^2.$$\n\n**Step 2 (1 mark):** Apply the product and power laws.\n\n$$\\log_a 200 = 3 \\log_a 2 + 2 \\log_a 5.$$\n\n**Step 3 (1 mark):** Substitute the given values.\n\n$$= 3(0.30) + 2(0.70) = 0.90 + 1.40 = 2.30.$$",
  subtopicSlugs: SUBTOPIC,
});

shortAnswer.push({
  content:
    "Simplify $\\dfrac{(2a^2 b^{-1})^3}{4 a^{-1} b^2}$, writing your answer with positive exponents.",
  marks: 3,
  difficulty: "MEDIUM",
  solutionContent:
    "**Step 1 (1 mark):** Expand the numerator using $(xy)^n = x^n y^n$.\n\n$$(2 a^2 b^{-1})^3 = 2^3 a^6 b^{-3} = 8 a^6 b^{-3}.$$\n\n**Step 2 (1 mark):** Divide term by term.\n\n$$\\dfrac{8 a^6 b^{-3}}{4 a^{-1} b^2} = 2 \\cdot a^{6-(-1)} \\cdot b^{-3-2} = 2 a^7 b^{-5}.$$\n\n**Step 3 (1 mark):** Rewrite with positive exponents.\n\n$$= \\dfrac{2 a^7}{b^5}.$$",
  subtopicSlugs: SUBTOPIC,
});

shortAnswer.push({
  content:
    "The values of $f(x) = 2^x - 8$ at selected integer values of $x$ are shown below.\n\n| $x$ | $0$ | $1$ | $2$ | $3$ | $4$ | $5$ |\n|---|---|---|---|---|---|---|\n| $f(x)$ | $-7$ | $-6$ | $-4$ | $0$ | $8$ | $24$ |\n\na. Using the table, write down the value of $x$ at which $f(x) = 0$. (1 mark)\n\nb. Hence solve the inequality $2^x > 8$ for real $x$. (2 marks)",
  marks: 3,
  difficulty: "MEDIUM",
  solutionContent:
    "**Step 1 (1 mark):** Read the table for part a.\n\nFrom the row, $f(3) = 0$, so $x = 3$.\n\n**Step 2 (1 mark):** For part b, rewrite the inequality using the same base.\n\n$$2^x > 8 \\iff 2^x > 2^3.$$\n\n**Step 3 (1 mark):** Since $2^x$ is strictly increasing, the inequality is equivalent to $x > 3$.",
  subtopicSlugs: SUBTOPIC,
});

shortAnswer.push({
  content:
    "A rectangle has length $2^{n+2}$ cm and width $2^{n-1}$ cm, where $n$ is a positive integer.\n\na. Find the area of the rectangle as a power of $2$. (1 mark)\n\nb. Show that the perimeter can be written in the form $k \\cdot 2^n$ for an integer constant $k$ to be determined. (2 marks)",
  marks: 3,
  difficulty: "MEDIUM",
  solutionContent:
    "**Step 1 (1 mark):** Multiply for the area.\n\n$$A = 2^{n+2} \\cdot 2^{n-1} = 2^{(n+2)+(n-1)} = 2^{2n+1}.$$\n\n**Step 2 (1 mark):** Add the two side lengths and multiply by $2$.\n\n$$P = 2(2^{n+2} + 2^{n-1}) = 2^{n+3} + 2^n.$$\n\n**Step 3 (1 mark):** Factor out $2^n$ to obtain the required form.\n\n$$P = 2^n(2^3 + 1) = 9 \\cdot 2^n,$$\n\nso $k = 9$.",
  subtopicSlugs: SUBTOPIC,
});

shortAnswer.push({
  content:
    "a. Using the change-of-base formula, show that $\\log_a b \\cdot \\log_b c = \\log_a c$ for positive $a, b, c$ with $a \\neq 1, b \\neq 1$. (2 marks)\n\nb. Hence evaluate $\\log_2 3 \\cdot \\log_3 4 \\cdot \\log_4 5 \\cdot \\log_5 8$. (2 marks)",
  marks: 4,
  difficulty: "HARD",
  solutionContent:
    "**Step 1 (1 mark):** Apply change of base to the natural logarithm.\n\n$$\\log_a b = \\dfrac{\\ln b}{\\ln a}, \\qquad \\log_b c = \\dfrac{\\ln c}{\\ln b}.$$\n\n**Step 2 (1 mark):** Multiply and cancel $\\ln b$.\n\n$$\\log_a b \\cdot \\log_b c = \\dfrac{\\ln b}{\\ln a} \\cdot \\dfrac{\\ln c}{\\ln b} = \\dfrac{\\ln c}{\\ln a} = \\log_a c. \\;\\checkmark$$\n\n**Step 3 (1 mark):** Telescope the chain from part b.\n\n$$\\log_2 3 \\cdot \\log_3 4 \\cdot \\log_4 5 \\cdot \\log_5 8 = \\log_2 8.$$\n\n**Step 4 (1 mark):** Evaluate.\n\n$$\\log_2 8 = \\log_2 2^3 = 3.$$",
  subtopicSlugs: SUBTOPIC,
});

shortAnswer.push({
  content: "Solve $4^x - 2^{x+1} - 3 = 0$ for real $x$, giving an exact answer.",
  marks: 3,
  difficulty: "HARD",
  solutionContent:
    "**Step 1 (1 mark):** Substitute $u = 2^x$ so that $4^x = (2^x)^2 = u^2$ and $2^{x+1} = 2 \\cdot 2^x = 2u$.\n\n$$u^2 - 2u - 3 = 0.$$\n\n**Step 2 (1 mark):** Factor the quadratic.\n\n$$(u - 3)(u + 1) = 0,$$\n\nso $u = 3$ or $u = -1$.\n\n**Step 3 (1 mark):** Reject the negative root since $u = 2^x > 0$, and solve $2^x = 3$.\n\n$$x = \\log_2 3.$$",
  subtopicSlugs: SUBTOPIC,
});

// ─── Extended response ──────────────────────────────────────────────────────
// Marks sampled from the VCE Section B distribution.
// Draws: 11, 10, 14, 12, 13  (modal size 11 appears; all in allowed set)
const extendedResponse: FR[] = [];

// ER1 — 11 marks
extendedResponse.push({
  content:
    "The function $f: \\mathbb{R}^+ \\to \\mathbb{R}$ is defined by $f(x) = \\log_2 x$.\n\n**a.** Evaluate $f(1) + f(2) + f(4) + f(8)$. (2 marks)\n\n**b.** Show that $f(2^n) = n$ for any integer $n$. (1 mark)\n\n**c.** Let $g(x) = f(x^2) - f(x)$ for $x > 0$. Show that $g(x) = \\log_2 x$. (2 marks)\n\n**d.** Solve $f(x) + f(x + 2) = 3$ for $x$. (3 marks)\n\n**e.** A rectangle has vertices $(0, 0)$, $(m, 0)$, $(m,\\, f(2^m))$ and $(0,\\, f(2^m))$, where $m$ is a positive integer.\n\n  **i.** Find the area of the rectangle in terms of $m$. (1 mark)\n\n  **ii.** Find the value of $m$ for which the area of the rectangle equals $16$ square units. (2 marks)",
  marks: 11,
  difficulty: "HARD",
  solutionContent:
    "**a. (2 marks)**\n\n*Step 1 (1 mark):* Evaluate each term using $\\log_2 2^n = n$.\n\n$$f(1) = 0, \\quad f(2) = 1, \\quad f(4) = 2, \\quad f(8) = 3.$$\n\n*Step 2 (1 mark):* Add.\n\n$$0 + 1 + 2 + 3 = 6.$$\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* Apply the definition of $\\log_2$.\n\n$$f(2^n) = \\log_2 2^n = n. \\;\\checkmark$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Expand $f(x^2)$ using the power law.\n\n$$f(x^2) = \\log_2 x^2 = 2 \\log_2 x.$$\n\n*Step 2 (1 mark):* Subtract $f(x) = \\log_2 x$.\n\n$$g(x) = 2 \\log_2 x - \\log_2 x = \\log_2 x. \\;\\checkmark$$\n\n**d. (3 marks)**\n\n*Step 1 (1 mark):* Combine the logs using the product law.\n\n$$\\log_2 x + \\log_2(x + 2) = \\log_2\\!\\big(x(x+2)\\big) = 3.$$\n\n*Step 2 (1 mark):* Convert from log form and simplify.\n\n$$x(x + 2) = 2^3 = 8,$$\n\n$$x^2 + 2x - 8 = 0,$$\n\n$$(x - 2)(x + 4) = 0.$$\n\n*Step 3 (1 mark):* Domain requires $x > 0$ and $x + 2 > 0$, so reject $x = -4$. Hence $x = 2$.\n\n**e.i. (1 mark)**\n\n*Step 1 (1 mark):* Width is $m$, height is $f(2^m) = m$ (by part b), so\n\n$$\\text{Area} = m \\cdot m = m^2.$$\n\n**e.ii. (2 marks)**\n\n*Step 1 (1 mark):* Set the area equal to $16$.\n\n$$m^2 = 16.$$\n\n*Step 2 (1 mark):* Since $m$ is a positive integer, $m = 4$.",
  subtopicSlugs: SUBTOPIC,
});

// ER2 — 10 marks
extendedResponse.push({
  content:
    "The population of a colony of bacteria $t$ hours after the start of an experiment is given by\n\n$$P(t) = 200 \\cdot 2^{t/3}.$$\n\n**a.** State the initial population $P(0)$. (1 mark)\n\n**b.** Find the population after $6$ hours. (2 marks)\n\n**c.** Show that $\\log_2 P(t)$ can be written in the form $a + bt$, where $a$ and $b$ are constants to be determined. (3 marks)\n\n**d.** Find the exact value of $t$ for which $P(t) = 3200$. (2 marks)\n\n**e.** Find, to the nearest minute, the time taken for the population to triple. (2 marks)",
  marks: 10,
  difficulty: "HARD",
  solutionContent:
    "**a. (1 mark)**\n\n*Step 1 (1 mark):* Substitute $t = 0$.\n\n$$P(0) = 200 \\cdot 2^0 = 200.$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Substitute $t = 6$.\n\n$$P(6) = 200 \\cdot 2^{6/3} = 200 \\cdot 2^2.$$\n\n*Step 2 (1 mark):* Evaluate.\n\n$$= 200 \\cdot 4 = 800.$$\n\n**c. (3 marks)**\n\n*Step 1 (1 mark):* Apply the product law.\n\n$$\\log_2 P(t) = \\log_2 200 + \\log_2 2^{t/3}.$$\n\n*Step 2 (1 mark):* Simplify the second term using the power law.\n\n$$\\log_2 2^{t/3} = \\tfrac{t}{3}.$$\n\n*Step 3 (1 mark):* Identify constants.\n\n$$\\log_2 P(t) = \\log_2 200 + \\tfrac{1}{3} t,$$\n\nso $a = \\log_2 200$ and $b = \\tfrac{1}{3}$.\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* Divide by $200$.\n\n$$200 \\cdot 2^{t/3} = 3200,$$\n\n$$2^{t/3} = 16 = 2^4.$$\n\n*Step 2 (1 mark):* Equate exponents.\n\n$$\\tfrac{t}{3} = 4 \\implies t = 12.$$\n\n**e. (2 marks)**\n\n*Step 1 (1 mark):* Set $P(t) = 3 \\cdot 200 = 600$.\n\n$$2^{t/3} = 3,$$\n\n$$t = 3 \\log_2 3.$$\n\n*Step 2 (1 mark):* Evaluate numerically.\n\n$$3 \\log_2 3 \\approx 3 \\times 1.5850 \\approx 4.7549 \\text{ hours},$$\n\nwhich is about $4$ hours $45$ minutes (to the nearest minute).",
  subtopicSlugs: SUBTOPIC,
});

// ER3 — 14 marks
extendedResponse.push({
  content:
    "Consider the function $h: (0, 16) \\to \\mathbb{R}$ defined by\n\n$$h(x) = \\log_2 x + \\log_2(16 - x).$$\n\n**a.** Write $h(x)$ in the form $\\log_2\\!\\big(p(x)\\big)$ where $p(x)$ is a polynomial in $x$. (2 marks)\n\n**b.** Evaluate $h(2)$ in the form $\\log_2 k$ for an integer $k$. (1 mark)\n\n**c.** Using part a, find the maximum value of $h(x)$ and the value of $x$ at which it occurs. (4 marks)\n\n**d.** Solve $h(x) = 5$ for $x$, giving exact values. (3 marks)\n\n**e.** A rectangle has length $x$ metres and width $(16 - x)$ metres, where $0 < x < 16$.\n\n  **i.** Show that the area $A$ of the rectangle satisfies $A = 2^{h(x)}$. (2 marks)\n\n  **ii.** Hence state the maximum possible area and the value of $x$ at which it occurs. (2 marks)",
  marks: 14,
  difficulty: "HARD",
  solutionContent:
    "**a. (2 marks)**\n\n*Step 1 (1 mark):* Combine using the product law of logs.\n\n$$h(x) = \\log_2\\!\\big(x(16 - x)\\big).$$\n\n*Step 2 (1 mark):* Expand the polynomial inside.\n\n$$p(x) = 16x - x^2.$$\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* Substitute $x = 2$.\n\n$$h(2) = \\log_2\\!\\big(2 \\cdot 14\\big) = \\log_2 28.$$\n\n**c. (4 marks)**\n\n*Step 1 (1 mark):* Since $\\log_2$ is strictly increasing, $h(x)$ is maximised when $p(x) = 16x - x^2$ is maximised.\n\n*Step 2 (1 mark):* Complete the square or differentiate.\n\n$$p(x) = -(x^2 - 16x) = -\\!\\big((x - 8)^2 - 64\\big) = 64 - (x - 8)^2.$$\n\n*Step 3 (1 mark):* The maximum value of $p$ is $64$, reached at $x = 8$.\n\n*Step 4 (1 mark):* Hence the maximum value of $h$ is\n\n$$h_{\\max} = \\log_2 64,$$\n\nattained at $x = 8$. So $h_{\\max} = 6$.\n\n**d. (3 marks)**\n\n*Step 1 (1 mark):* Convert from log form.\n\n$$x(16 - x) = 2^5 = 32.$$\n\n*Step 2 (1 mark):* Rearrange into a quadratic.\n\n$$x^2 - 16x + 32 = 0.$$\n\n*Step 3 (1 mark):* Apply the quadratic formula.\n\n$$x = \\dfrac{16 \\pm \\sqrt{256 - 128}}{2} = \\dfrac{16 \\pm \\sqrt{128}}{2} = 8 \\pm 4\\sqrt{2}.$$\n\nBoth solutions lie in $(0, 16)$, so $x = 8 - 4\\sqrt{2}$ or $x = 8 + 4\\sqrt{2}$.\n\n**e.i. (2 marks)**\n\n*Step 1 (1 mark):* The rectangle has area\n\n$$A = x(16 - x).$$\n\n*Step 2 (1 mark):* By part a, $A = p(x)$, so\n\n$$\\log_2 A = h(x) \\implies A = 2^{h(x)}. \\;\\checkmark$$\n\n**e.ii. (2 marks)**\n\n*Step 1 (1 mark):* By part c, $h_{\\max} = 6$, so\n\n$$A_{\\max} = 2^6 = 64 \\text{ m}^2.$$\n\n*Step 2 (1 mark):* The maximum occurs at $x = 8$ m (a square with both sides $8$ m).",
  subtopicSlugs: SUBTOPIC,
});

// ER4 — 12 marks
extendedResponse.push({
  content:
    "A cube expands over time $t$ (in hours) in such a way that its volume is given by\n\n$$V(t) = V_0 \\cdot 3^{t/2},$$\n\nwhere $V_0$ is the initial volume in cm$^3$.\n\nThroughout this question, assume $V_0 = 8$ cm$^3$.\n\n**a.** Find the side length of the cube at $t = 0$. (1 mark)\n\n**b.** Using the fact that $V = s^3$ where $s$ is the side length, show that\n\n$$s(t) = 2 \\cdot 3^{t/6}.$$\n\n(2 marks)\n\n**c.** Express $\\log_3 s(t)$ in the form $a + bt$ where $a$ and $b$ are constants. (3 marks)\n\n**d.** Find the exact value of $t$ at which the side length first equals $6$ cm. (3 marks)\n\n**e.** Show that the ratio $\\dfrac{V(t + 6)}{V(t)}$ is independent of $t$, and state its value. (3 marks)",
  marks: 12,
  difficulty: "HARD",
  solutionContent:
    "**a. (1 mark)**\n\n*Step 1 (1 mark):* At $t = 0$, $V = 8$ cm$^3$. So\n\n$$s = 8^{1/3} = 2 \\text{ cm}.$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Set $s(t)^3 = V(t) = 8 \\cdot 3^{t/2}$.\n\n*Step 2 (1 mark):* Take cube roots using $(xy)^{1/3} = x^{1/3} y^{1/3}$.\n\n$$s(t) = \\big(8 \\cdot 3^{t/2}\\big)^{1/3} = 8^{1/3} \\cdot \\big(3^{t/2}\\big)^{1/3} = 2 \\cdot 3^{t/6}. \\;\\checkmark$$\n\n**c. (3 marks)**\n\n*Step 1 (1 mark):* Apply the product law.\n\n$$\\log_3 s(t) = \\log_3 2 + \\log_3\\!\\big(3^{t/6}\\big).$$\n\n*Step 2 (1 mark):* Simplify the second term using the power law.\n\n$$\\log_3\\!\\big(3^{t/6}\\big) = \\tfrac{t}{6}.$$\n\n*Step 3 (1 mark):* Identify constants.\n\n$$\\log_3 s(t) = \\log_3 2 + \\tfrac{1}{6} t,$$\n\nso $a = \\log_3 2$ and $b = \\tfrac{1}{6}$.\n\n**d. (3 marks)**\n\n*Step 1 (1 mark):* Set $s(t) = 6$.\n\n$$2 \\cdot 3^{t/6} = 6.$$\n\n*Step 2 (1 mark):* Divide by $2$.\n\n$$3^{t/6} = 3.$$\n\n*Step 3 (1 mark):* Equate exponents.\n\n$$\\tfrac{t}{6} = 1 \\implies t = 6 \\text{ hours}.$$\n\n**e. (3 marks)**\n\n*Step 1 (1 mark):* Form the ratio.\n\n$$\\dfrac{V(t + 6)}{V(t)} = \\dfrac{V_0 \\cdot 3^{(t+6)/2}}{V_0 \\cdot 3^{t/2}}.$$\n\n*Step 2 (1 mark):* Apply the quotient law of indices.\n\n$$= 3^{(t+6)/2 - t/2} = 3^{6/2} = 3^3.$$\n\n*Step 3 (1 mark):* Evaluate.\n\n$$= 27,$$\n\nwhich is independent of $t$.",
  subtopicSlugs: SUBTOPIC,
});

// ER5 — 13 marks
extendedResponse.push({
  content:
    "Let $f(x) = 2^x$ and $g(x) = \\log_2 x$.\n\n**a.** Evaluate $f\\!\\big(g(8)\\big)$. (1 mark)\n\n**b.** Solve $f(x) \\cdot g(8) = 24$ for $x$. (3 marks)\n\n**c.** Use the laws of logarithms to show that $g\\!\\big(f(x)\\big) = x$ for all real $x$. (2 marks)\n\n**d.** Find the exact values of $x$ satisfying\n\n$$f(2x) - 3 f(x) + 2 = 0.$$\n\n(4 marks)\n\n**e.** A rectangle in the coordinate plane has one side of length $f(x)$ and another of length $g\\!\\big(f(x)\\big)$, where $x > 0$. Find the exact value of $x$ for which the area of the rectangle is $8$ square units. (3 marks)",
  marks: 13,
  difficulty: "HARD",
  solutionContent:
    "**a. (1 mark)**\n\n*Step 1 (1 mark):* Compute inner log, then exponent.\n\n$$g(8) = \\log_2 8 = 3,$$\n\n$$f(3) = 2^3 = 8.$$\n\nSo $f(g(8)) = 8$.\n\n**b. (3 marks)**\n\n*Step 1 (1 mark):* Substitute $g(8) = 3$.\n\n$$3 \\cdot 2^x = 24.$$\n\n*Step 2 (1 mark):* Divide by $3$.\n\n$$2^x = 8.$$\n\n*Step 3 (1 mark):* Take $\\log_2$.\n\n$$x = \\log_2 8 = 3.$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Substitute $f(x) = 2^x$.\n\n$$g(f(x)) = \\log_2\\!\\big(2^x\\big).$$\n\n*Step 2 (1 mark):* Apply the power law.\n\n$$= x \\log_2 2 = x. \\;\\checkmark$$\n\n**d. (4 marks)**\n\n*Step 1 (1 mark):* Note $f(2x) = 2^{2x} = (2^x)^2$. Let $u = 2^x$.\n\n$$u^2 - 3u + 2 = 0.$$\n\n*Step 2 (1 mark):* Factor.\n\n$$(u - 1)(u - 2) = 0.$$\n\n*Step 3 (1 mark):* Solve for $u$.\n\n$$u = 1 \\text{ or } u = 2.$$\n\n*Step 4 (1 mark):* Convert back to $x$ (both are positive so both are valid).\n\n$$2^x = 1 \\implies x = 0,$$\n\n$$2^x = 2 \\implies x = 1.$$\n\n**e. (3 marks)**\n\n*Step 1 (1 mark):* By part c, $g(f(x)) = x$, so the area is\n\n$$A(x) = f(x) \\cdot g(f(x)) = 2^x \\cdot x.$$\n\n*Step 2 (1 mark):* Set $A(x) = 8$.\n\n$$x \\cdot 2^x = 8.$$\n\n*Step 3 (1 mark):* By inspection $x = 2$ satisfies $2 \\cdot 2^2 = 2 \\cdot 4 = 8$, and since $x \\cdot 2^x$ is strictly increasing for $x > 0$ this is the only positive solution.",
  subtopicSlugs: SUBTOPIC,
});

// ─── Apply chain splitter to every solution ─────────────────────────────────
for (const q of mcq) q.solutionContent = dechainSolution(q.solutionContent);
for (const q of shortAnswer)
  q.solutionContent = dechainSolution(q.solutionContent);
for (const q of extendedResponse)
  q.solutionContent = dechainSolution(q.solutionContent);

// ─── Write file ──────────────────────────────────────────────────────────────
const output = {
  mcq,
  shortAnswer,
  extendedResponse,
};

// Sanity checks
if (mcq.length !== 20) throw new Error(`Expected 20 MCQs, got ${mcq.length}`);
if (shortAnswer.length !== 10)
  throw new Error(`Expected 10 SA, got ${shortAnswer.length}`);
if (extendedResponse.length !== 5)
  throw new Error(`Expected 5 ER, got ${extendedResponse.length}`);

const allowedErMarks = new Set([9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21]);
for (const er of extendedResponse) {
  if (!allowedErMarks.has(er.marks)) {
    throw new Error(`ER mark value ${er.marks} not in allowed set`);
  }
}

const outPath = path.resolve(
  __dirname,
  "output",
  "qset-exponent-and-logarithm-laws.json"
);
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");

const totalErMarks = extendedResponse.reduce((s, e) => s + e.marks, 0);
const erSizes = extendedResponse.map((e) => e.marks).join(", ");
console.log(`✅ Wrote ${outPath}`);
console.log(
  `   ${mcq.length} MCQ, ${shortAnswer.length} SA, ${extendedResponse.length} ER`
);
console.log(`   ER mark sizes: [${erSizes}]  (total ${totalErMarks})`);
