/**
 * SVG diagram generator for VCE Methods question banks.
 *
 * Produces inline SVG strings that can be base64-encoded and embedded as
 * markdown images in question content fields. Drives the wave-1+ figure
 * pipeline — each subtopic's generator imports the helpers from here so the
 * visual style stays consistent across the bank.
 */

// ─── Types ──────────────────────────────────────────────────────────────

export interface Point {
  x: number;
  y: number;
}

// ─── Core wrapper + encoding ────────────────────────────────────────────

export function svg(
  opts: { width: number; height: number; viewBox?: string },
  content: string,
): string {
  const vb = opts.viewBox ?? `0 0 ${opts.width} ${opts.height}`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${opts.width}" height="${opts.height}">` +
    `<rect width="${opts.width}" height="${opts.height}" fill="white"/>` +
    content +
    `</svg>`
  );
}

export function toDataUri(svgString: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svgString).toString("base64")}`;
}

// ─── Primitives ─────────────────────────────────────────────────────────

export function line(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  opts: { stroke?: string; width?: number; dash?: string } = {},
): string {
  const s = opts.stroke ?? "#111";
  const w = opts.width ?? 1.5;
  const d = opts.dash ? ` stroke-dasharray="${opts.dash}"` : "";
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${s}" stroke-width="${w}"${d}/>`;
}

export function circle(
  cx: number,
  cy: number,
  r: number,
  opts: { fill?: string; stroke?: string; width?: number } = {},
): string {
  const f = opts.fill ?? "#111";
  const s = opts.stroke
    ? ` stroke="${opts.stroke}" stroke-width="${opts.width ?? 1}"`
    : "";
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${s}/>`;
}

export function rect(
  x: number,
  y: number,
  w: number,
  h: number,
  opts: {
    fill?: string;
    stroke?: string;
    width?: number;
    dash?: string;
  } = {},
): string {
  const f = opts.fill ?? "none";
  const s = opts.stroke ?? "#111";
  const sw = opts.width ?? 1.5;
  const d = opts.dash ? ` stroke-dasharray="${opts.dash}"` : "";
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" stroke="${s}" stroke-width="${sw}"${d}/>`;
}

export function text(
  x: number,
  y: number,
  content: string,
  opts: {
    size?: number;
    color?: string;
    anchor?: "start" | "middle" | "end";
    italic?: boolean;
    bold?: boolean;
    rotate?: number;
  } = {},
): string {
  const size = opts.size ?? 12;
  const color = opts.color ?? "#111";
  const anchor = opts.anchor ? ` text-anchor="${opts.anchor}"` : "";
  const italic = opts.italic ? ` font-style="italic"` : "";
  const bold = opts.bold ? ` font-weight="bold"` : "";
  const rotate =
    opts.rotate !== undefined
      ? ` transform="rotate(${opts.rotate}, ${x}, ${y})"`
      : "";
  return `<text x="${x}" y="${y}" font-size="${size}" font-family="serif" fill="${color}"${anchor}${italic}${bold}${rotate}>${content}</text>`;
}

export function polyline(
  points: Point[],
  opts: { stroke?: string; width?: number; fill?: string } = {},
): string {
  const pts = points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const s = opts.stroke ?? "#111";
  const w = opts.width ?? 2;
  const f = opts.fill ?? "none";
  return `<polyline points="${pts}" fill="${f}" stroke="${s}" stroke-width="${w}"/>`;
}

export function path(d: string, opts: { stroke?: string; width?: number; fill?: string } = {}): string {
  const s = opts.stroke ?? "#111";
  const w = opts.width ?? 2;
  const f = opts.fill ?? "none";
  return `<path d="${d}" fill="${f}" stroke="${s}" stroke-width="${w}"/>`;
}

// ─── Measurement bracket ────────────────────────────────────────────────

export function bracket(opts: {
  orientation: "horizontal" | "vertical";
  start: number;
  end: number;
  axis: number;
  label: string;
  labelOffset?: number;
  tickSize?: number;
  italic?: boolean;
  size?: number;
}): string {
  const ts = opts.tickSize ?? 4;
  const lo = opts.labelOffset ?? 6;
  const size = opts.size ?? 12;
  const parts: string[] = [];
  if (opts.orientation === "horizontal") {
    const y = opts.axis;
    parts.push(line(opts.start, y, opts.end, y, { width: 1 }));
    parts.push(line(opts.start, y - ts, opts.start, y + ts, { width: 1 }));
    parts.push(line(opts.end, y - ts, opts.end, y + ts, { width: 1 }));
    parts.push(
      text((opts.start + opts.end) / 2, y - lo, opts.label, {
        size,
        anchor: "middle",
        italic: opts.italic,
      }),
    );
  } else {
    const x = opts.axis;
    parts.push(line(x, opts.start, x, opts.end, { width: 1 }));
    parts.push(line(x - ts, opts.start, x + ts, opts.start, { width: 1 }));
    parts.push(line(x - ts, opts.end, x + ts, opts.end, { width: 1 }));
    parts.push(
      text(x - lo - 4, (opts.start + opts.end) / 2, opts.label, {
        size,
        anchor: "middle",
        italic: opts.italic,
        rotate: -90,
      }),
    );
  }
  return parts.join("");
}

// ─── Coordinate axes (with arrows + tick labels) ────────────────────────

const ARROW_DEFS = `<defs><marker id="arr" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L6,3 z" fill="#111"/></marker></defs>`;

export interface AxesOptions {
  xRange: [number, number];
  yRange: [number, number];
  xPixelRange: [number, number]; // [leftPx, rightPx]
  yPixelRange: [number, number]; // [topPx, bottomPx] — top has smaller pixel y
  xLabel?: string;
  yLabel?: string;
  xTicks?: number[];
  yTicks?: number[];
  /** Where the x-axis is drawn — defaults to y=0 if 0 is in range, else bottom */
  xAxisAt?: number;
  /** Where the y-axis is drawn — defaults to x=0 if 0 is in range, else left */
  yAxisAt?: number;
}

export interface CoordSystem {
  xMap: (x: number) => number;
  yMap: (y: number) => number;
  axesContent: string;
}

export function makeCoords(opts: AxesOptions): CoordSystem {
  const { xRange, yRange, xPixelRange, yPixelRange } = opts;
  const [xpL, xpR] = xPixelRange;
  const [ypT, ypB] = yPixelRange;
  const xMap = (x: number) => xpL + ((x - xRange[0]) / (xRange[1] - xRange[0])) * (xpR - xpL);
  const yMap = (y: number) => ypB - ((y - yRange[0]) / (yRange[1] - yRange[0])) * (ypB - ypT);

  const xAxisY =
    opts.xAxisAt !== undefined
      ? yMap(opts.xAxisAt)
      : yRange[0] <= 0 && yRange[1] >= 0
        ? yMap(0)
        : ypB;
  const yAxisX =
    opts.yAxisAt !== undefined
      ? xMap(opts.yAxisAt)
      : xRange[0] <= 0 && xRange[1] >= 0
        ? xMap(0)
        : xpL;

  const parts: string[] = [ARROW_DEFS];

  parts.push(
    `<line x1="${xpL - 15}" y1="${xAxisY}" x2="${xpR + 15}" y2="${xAxisY}" stroke="#111" stroke-width="1.5" marker-end="url(#arr)"/>`,
  );
  parts.push(
    `<line x1="${yAxisX}" y1="${ypB + 15}" x2="${yAxisX}" y2="${ypT - 15}" stroke="#111" stroke-width="1.5" marker-end="url(#arr)"/>`,
  );

  if (opts.xLabel) parts.push(text(xpR + 22, xAxisY + 5, opts.xLabel, { size: 14, italic: true }));
  if (opts.yLabel) parts.push(text(yAxisX + 8, ypT - 18, opts.yLabel, { size: 14, italic: true }));

  if (opts.xTicks) {
    for (const t of opts.xTicks) {
      if (t === 0) continue; // skip origin
      const px = xMap(t);
      parts.push(line(px, xAxisY - 3, px, xAxisY + 3, { width: 1 }));
      parts.push(
        text(px, xAxisY + 16, t < 0 ? `−${Math.abs(t)}` : String(t), {
          size: 11,
          anchor: "middle",
        }),
      );
    }
  }
  if (opts.yTicks) {
    for (const t of opts.yTicks) {
      if (t === 0) continue;
      const py = yMap(t);
      parts.push(line(yAxisX - 3, py, yAxisX + 3, py, { width: 1 }));
      parts.push(
        text(yAxisX - 5, py + 4, t < 0 ? `−${Math.abs(t)}` : String(t), {
          size: 11,
          anchor: "end",
        }),
      );
    }
  }

  return { xMap, yMap, axesContent: parts.join("") };
}

// ─── Function plotter ──────────────────────────────────────────────────

export interface PlotFnOptions {
  fn: (x: number) => number;
  xRange: [number, number];
  yRange: [number, number];
  coords: CoordSystem;
  color?: string;
  width?: number;
  samples?: number;
  /** Optionally clip values outside yRange to avoid line jumping off-screen */
  clip?: boolean;
}

export function plotFn(opts: PlotFnOptions): string {
  const samples = opts.samples ?? 120;
  const { fn, xRange, yRange, coords } = opts;
  const points: Point[] = [];
  for (let i = 0; i <= samples; i++) {
    const x = xRange[0] + (i / samples) * (xRange[1] - xRange[0]);
    const y = fn(x);
    if (opts.clip !== false && (y < yRange[0] || y > yRange[1])) continue;
    points.push({ x: coords.xMap(x), y: coords.yMap(y) });
  }
  return polyline(points, { stroke: opts.color ?? "#dc2626", width: opts.width ?? 2 });
}

// ─── Shaded region under a function ────────────────────────────────────

export function shadeUnder(opts: {
  fn: (x: number) => number;
  xFrom: number;
  xTo: number;
  coords: CoordSystem;
  baseY?: number; // data y for the base (defaults to 0)
  fill?: string;
  samples?: number;
}): string {
  const samples = opts.samples ?? 80;
  const base = opts.baseY ?? 0;
  const { fn, xFrom, xTo, coords } = opts;
  const pts: Point[] = [];
  pts.push({ x: coords.xMap(xFrom), y: coords.yMap(base) });
  for (let i = 0; i <= samples; i++) {
    const x = xFrom + (i / samples) * (xTo - xFrom);
    pts.push({ x: coords.xMap(x), y: coords.yMap(fn(x)) });
  }
  pts.push({ x: coords.xMap(xTo), y: coords.yMap(base) });
  const ptsStr = pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  return `<polygon points="${ptsStr}" fill="${opts.fill ?? "#dbeafe"}" stroke="none"/>`;
}

// ─── Diagram builders (composed using primitives) ──────────────────────

/**
 * Open rectangular box from cardboard with corner cuts and dashed fold lines.
 * Used by Optimisation, Polynomial Functions (box-volume modelling), etc.
 */
export function openBox(opts: {
  outerW: number; // cm
  outerH?: number; // cm (defaults to square)
  cutLabel?: string; // defaults to "x"
}): string {
  const W = opts.outerW;
  const H = opts.outerH ?? W;
  const cutLabel = opts.cutLabel ?? "x";

  const scale = 240 / Math.max(W, H);
  const pxW = W * scale;
  const pxH = H * scale;
  const cut = Math.min(W, H) * 0.16 * scale;
  const padding = { top: 35, right: 60, bottom: 50, left: 60 };

  const vbW = pxW + padding.left + padding.right;
  const vbH = pxH + padding.top + padding.bottom;
  const x0 = padding.left;
  const y0 = padding.top;

  const parts: string[] = [];
  parts.push(rect(x0, y0, pxW, pxH, { stroke: "#111", width: 2 }));
  parts.push(rect(x0, y0, cut, cut, { fill: "#d1d5db", stroke: "#111" }));
  parts.push(rect(x0 + pxW - cut, y0, cut, cut, { fill: "#d1d5db", stroke: "#111" }));
  parts.push(rect(x0, y0 + pxH - cut, cut, cut, { fill: "#d1d5db", stroke: "#111" }));
  parts.push(rect(x0 + pxW - cut, y0 + pxH - cut, cut, cut, { fill: "#d1d5db", stroke: "#111" }));
  parts.push(
    rect(x0 + cut, y0 + cut, pxW - 2 * cut, pxH - 2 * cut, {
      stroke: "#444",
      width: 1,
      dash: "5 3",
    }),
  );
  parts.push(
    bracket({
      orientation: "horizontal",
      start: x0,
      end: x0 + pxW,
      axis: y0 + pxH + 17,
      label: `${W} cm`,
    }),
  );
  parts.push(
    bracket({
      orientation: "vertical",
      start: y0,
      end: y0 + pxH,
      axis: x0 - 18,
      label: `${H} cm`,
    }),
  );
  parts.push(text(x0 + cut / 2, y0 + cut / 2 + 5, cutLabel, { size: 14, anchor: "middle", italic: true }));
  parts.push(
    bracket({
      orientation: "horizontal",
      start: x0,
      end: x0 + cut,
      axis: y0 - 10,
      label: cutLabel,
      italic: true,
    }),
  );
  return svg({ width: vbW, height: vbH }, parts.join(""));
}

/**
 * Plot a function on a coordinate plane with axes, optional marked points,
 * tangent lines, and shaded region. The workhorse for all function-based
 * subtopics (Polynomial, Exponential, Log, Trig, Composite, Inverse, etc.).
 */
export function functionPlot(opts: {
  fn: (x: number) => number;
  xRange: [number, number];
  yRange: [number, number];
  fnLabel?: string;
  fnLabelAt?: Point; // data coords for label placement
  color?: string;
  xLabel?: string; // default "x"
  yLabel?: string; // default "y"
  xTicks?: number[];
  yTicks?: number[];
  markedPoints?: Array<{ x: number; label?: string; color?: string }>;
  tangentAt?: { x: number; color?: string };
  shadedRange?: { from: number; to: number; baseY?: number; fill?: string };
  /** Horizontal asymptote(s) to draw as dashed lines */
  asymptotes?: Array<{ y: number; label?: string; color?: string }>;
  /** Additional functions to draw on the same axes (e.g. for inverse, intersection problems) */
  additionalFns?: Array<{
    fn: (x: number) => number;
    color?: string;
    label?: string;
    labelAt?: Point;
    width?: number;
  }>;
  /** Shade between fn and an additional function over [from, to] */
  shadeBetween?: { fn2: (x: number) => number; from: number; to: number; fill?: string };
  width?: number;
  height?: number;
}): string {
  const w = opts.width ?? 400;
  const h = opts.height ?? 320;
  const margin = { top: 30, right: 50, bottom: 40, left: 50 };
  const coords = makeCoords({
    xRange: opts.xRange,
    yRange: opts.yRange,
    xPixelRange: [margin.left, w - margin.right],
    yPixelRange: [margin.top, h - margin.bottom],
    xLabel: opts.xLabel ?? "x",
    yLabel: opts.yLabel ?? "y",
    xTicks: opts.xTicks,
    yTicks: opts.yTicks,
  });

  const parts: string[] = [];

  // Shaded region first (so curve goes on top)
  if (opts.shadedRange) {
    parts.push(
      shadeUnder({
        fn: opts.fn,
        xFrom: opts.shadedRange.from,
        xTo: opts.shadedRange.to,
        coords,
        baseY: opts.shadedRange.baseY,
        fill: opts.shadedRange.fill,
      }),
    );
  }

  // Shade region between fn and a second function over [from, to]
  if (opts.shadeBetween) {
    const samples = 80;
    const pts: Point[] = [];
    const { fn2, from, to } = opts.shadeBetween;
    // Top edge: fn from `from` to `to`
    for (let i = 0; i <= samples; i++) {
      const x = from + (i / samples) * (to - from);
      pts.push({ x: coords.xMap(x), y: coords.yMap(opts.fn(x)) });
    }
    // Bottom edge: fn2 from `to` back to `from`
    for (let i = samples; i >= 0; i--) {
      const x = from + (i / samples) * (to - from);
      pts.push({ x: coords.xMap(x), y: coords.yMap(fn2(x)) });
    }
    const ptsStr = pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
    parts.push(`<polygon points="${ptsStr}" fill="${opts.shadeBetween.fill ?? "#dbeafe"}" stroke="none"/>`);
  }

  // Axes
  parts.push(coords.axesContent);

  // The function curve
  parts.push(plotFn({ fn: opts.fn, xRange: opts.xRange, yRange: opts.yRange, coords, color: opts.color }));

  // Additional functions
  if (opts.additionalFns) {
    for (const af of opts.additionalFns) {
      parts.push(
        plotFn({
          fn: af.fn,
          xRange: opts.xRange,
          yRange: opts.yRange,
          coords,
          color: af.color ?? "#2563eb",
          width: af.width ?? 2,
        }),
      );
      if (af.label && af.labelAt) {
        parts.push(
          text(coords.xMap(af.labelAt.x), coords.yMap(af.labelAt.y), af.label, {
            size: 13,
            color: af.color ?? "#2563eb",
          }),
        );
      }
    }
  }

  // Horizontal asymptotes (drawn as dashed lines spanning the plot)
  if (opts.asymptotes) {
    for (const a of opts.asymptotes) {
      if (a.y < opts.yRange[0] || a.y > opts.yRange[1]) continue;
      const ay = coords.yMap(a.y);
      parts.push(
        line(coords.xMap(opts.xRange[0]), ay, coords.xMap(opts.xRange[1]), ay, {
          stroke: a.color ?? "#9ca3af",
          width: 1,
          dash: "4 3",
        }),
      );
      if (a.label) {
        parts.push(
          text(coords.xMap(opts.xRange[1]) - 4, ay - 4, a.label, {
            size: 11,
            color: a.color ?? "#6b7280",
            anchor: "end",
            italic: true,
          }),
        );
      }
    }
  }

  // Tangent line
  if (opts.tangentAt) {
    const x0 = opts.tangentAt.x;
    const h0 = 0.0001;
    const slope = (opts.fn(x0 + h0) - opts.fn(x0 - h0)) / (2 * h0);
    const y0 = opts.fn(x0);
    // Extend tangent across xRange
    const tangentFn = (x: number) => slope * (x - x0) + y0;
    parts.push(
      plotFn({
        fn: tangentFn,
        xRange: opts.xRange,
        yRange: opts.yRange,
        coords,
        color: opts.tangentAt.color ?? "#16a34a",
        width: 1.5,
      }),
    );
  }

  // Marked points
  if (opts.markedPoints) {
    for (const mp of opts.markedPoints) {
      const px = coords.xMap(mp.x);
      const py = coords.yMap(opts.fn(mp.x));
      parts.push(circle(px, py, 4, { fill: mp.color ?? "#2563eb" }));
      if (mp.label) {
        parts.push(text(px + 8, py - 6, mp.label, { size: 11, color: mp.color ?? "#2563eb" }));
      }
    }
  }

  // Function label
  if (opts.fnLabel) {
    const labelAt = opts.fnLabelAt ?? { x: opts.xRange[1] * 0.6, y: opts.yRange[1] * 0.7 };
    parts.push(
      text(coords.xMap(labelAt.x), coords.yMap(labelAt.y), opts.fnLabel, {
        size: 13,
        color: opts.color ?? "#dc2626",
      }),
    );
  }

  return svg({ width: w, height: h }, parts.join(""));
}

/**
 * Bar chart for discrete distributions (Binomial, Discrete RV pmfs).
 * Bars are drawn at integer x-positions 0, 1, 2, ... with given heights.
 */
export function barChart(opts: {
  values: number[];
  xLabels?: string[];       // defaults to "0", "1", "2", ...
  xAxisLabel?: string;
  yAxisLabel?: string;      // default "P(X = x)"
  shadedIndices?: number[]; // indices to highlight in a different colour
  title?: string;
  width?: number;
  height?: number;
}): string {
  const w = opts.width ?? 420;
  const h = opts.height ?? 280;
  const margin = { top: 30, right: 30, bottom: 50, left: 60 };
  const n = opts.values.length;
  const maxV = Math.max(...opts.values) * 1.1;
  const innerW = w - margin.left - margin.right;
  const innerH = h - margin.top - margin.bottom;
  const barW = (innerW / n) * 0.7;
  const barGap = (innerW / n) * 0.3;
  const parts: string[] = [];
  parts.push(`<line x1="${margin.left}" y1="${margin.top + innerH}" x2="${margin.left + innerW}" y2="${margin.top + innerH}" stroke="#111" stroke-width="1.5"/>`);
  parts.push(`<line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + innerH}" stroke="#111" stroke-width="1.5"/>`);
  for (let i = 0; i < n; i++) {
    const barH = (opts.values[i] / maxV) * innerH;
    const x = margin.left + i * (innerW / n) + barGap / 2;
    const y = margin.top + innerH - barH;
    const isShaded = opts.shadedIndices?.includes(i) ?? false;
    const fill = isShaded ? "#2563eb" : "#93c5fd";
    parts.push(`<rect x="${x}" y="${y}" width="${barW}" height="${barH}" fill="${fill}" stroke="#1e40af" stroke-width="1"/>`);
    parts.push(text(x + barW / 2, y - 5, opts.values[i].toFixed(3), { size: 10, anchor: "middle" }));
    parts.push(text(x + barW / 2, margin.top + innerH + 14, opts.xLabels?.[i] ?? String(i), { size: 11, anchor: "middle" }));
  }
  if (opts.xAxisLabel) parts.push(text(margin.left + innerW / 2, h - 8, opts.xAxisLabel, { size: 12, anchor: "middle" }));
  if (opts.yAxisLabel ?? true) parts.push(text(15, margin.top + innerH / 2, opts.yAxisLabel ?? "P(X = x)", { size: 12, anchor: "middle", rotate: -90 }));
  if (opts.title) parts.push(text(w / 2, 16, opts.title, { size: 13, anchor: "middle", bold: true }));
  return svg({ width: w, height: h }, parts.join(""));
}

/**
 * Two-stage probability tree (root → first-stage outcomes → second-stage outcomes).
 * Suitable for conditional probability questions.
 */
export function probabilityTree(opts: {
  stage1: Array<{ label: string; prob: string; stage2: Array<{ label: string; prob: string }> }>;
  width?: number;
  height?: number;
  rootLabel?: string;
}): string {
  const w = opts.width ?? 440;
  const h = opts.height ?? 280;
  const rootX = 40;
  const rootY = h / 2;
  const stage1X = 180;
  const stage2X = 360;
  const parts: string[] = [];
  const numS1 = opts.stage1.length;
  const s1Spacing = (h - 60) / Math.max(numS1, 1);
  parts.push(circle(rootX, rootY, 5, { fill: "#111" }));
  if (opts.rootLabel) parts.push(text(rootX, rootY + 22, opts.rootLabel, { size: 11, anchor: "middle" }));
  for (let i = 0; i < numS1; i++) {
    const s1Y = 30 + i * s1Spacing + s1Spacing / 2;
    const s1 = opts.stage1[i];
    parts.push(line(rootX + 5, rootY, stage1X - 5, s1Y));
    parts.push(text((rootX + stage1X) / 2, (rootY + s1Y) / 2 - 6, s1.prob, { size: 11, anchor: "middle", italic: true }));
    parts.push(circle(stage1X, s1Y, 4, { fill: "#2563eb" }));
    parts.push(text(stage1X + 8, s1Y + 4, s1.label, { size: 12, anchor: "start", bold: true }));
    const numS2 = s1.stage2.length;
    const s2Spacing = s1Spacing / Math.max(numS2, 1);
    for (let j = 0; j < numS2; j++) {
      const s2Y = s1Y - s1Spacing / 2 + 8 + j * s2Spacing + s2Spacing / 2;
      const s2 = s1.stage2[j];
      parts.push(line(stage1X + 5, s1Y, stage2X - 5, s2Y));
      parts.push(text((stage1X + stage2X) / 2, (s1Y + s2Y) / 2 - 4, s2.prob, { size: 10, anchor: "middle", italic: true }));
      parts.push(circle(stage2X, s2Y, 3, { fill: "#16a34a" }));
      parts.push(text(stage2X + 6, s2Y + 4, s2.label, { size: 11, anchor: "start" }));
    }
  }
  return svg({ width: w, height: h }, parts.join(""));
}

// ─── Specialist helpers: complex plane, vectors, DEs, polar ─────────────

/**
 * Argand diagram — complex plane with Re/Im axes, marked points, and
 * optional vectors from the origin to those points (modulus/argument
 * visualisations). Used by Complex Numbers (Cartesian + Polar), De Moivre,
 * Roots of Unity, Loci.
 */
export function argandPlot(opts: {
  points?: Array<{ re: number; im: number; label?: string; color?: string }>;
  /** Draw a ray/arrow from origin to each marked point */
  drawVectors?: boolean;
  /** Optional unit circle (used for |z|=1, roots of unity) */
  unitCircle?: boolean;
  /** Optional generic circle e.g. |z - z0| = r */
  circles?: Array<{ cx: number; cy: number; r: number; dash?: boolean; color?: string }>;
  /** Optional rays from origin at given argument (radians) */
  rays?: Array<{ argRad: number; label?: string; color?: string; length?: number }>;
  /** Optional lines (segments) in the complex plane */
  segments?: Array<{ from: { re: number; im: number }; to: { re: number; im: number }; color?: string; dash?: boolean }>;
  /** Plot range (defaults to [-3,3] both) */
  reRange?: [number, number];
  imRange?: [number, number];
  reTicks?: number[];
  imTicks?: number[];
  width?: number;
  height?: number;
}): string {
  const w = opts.width ?? 360;
  const h = opts.height ?? 340;
  const reR = opts.reRange ?? [-3, 3];
  const imR = opts.imRange ?? [-3, 3];
  const margin = { top: 30, right: 40, bottom: 40, left: 50 };
  const coords = makeCoords({
    xRange: reR,
    yRange: imR,
    xPixelRange: [margin.left, w - margin.right],
    yPixelRange: [margin.top, h - margin.bottom],
    xLabel: "Re(z)",
    yLabel: "Im(z)",
    xTicks: opts.reTicks ?? Array.from({ length: reR[1] - reR[0] + 1 }, (_, i) => reR[0] + i).filter((t) => t !== 0),
    yTicks: opts.imTicks ?? Array.from({ length: imR[1] - imR[0] + 1 }, (_, i) => imR[0] + i).filter((t) => t !== 0),
  });

  const parts: string[] = [coords.axesContent];

  if (opts.unitCircle) {
    const r = coords.xMap(1) - coords.xMap(0);
    parts.push(
      `<circle cx="${coords.xMap(0)}" cy="${coords.yMap(0)}" r="${r}" fill="none" stroke="#9ca3af" stroke-width="1" stroke-dasharray="4 3"/>`,
    );
  }

  if (opts.circles) {
    for (const c of opts.circles) {
      const cx = coords.xMap(c.cx);
      const cy = coords.yMap(c.cy);
      const r = Math.abs(coords.xMap(c.r) - coords.xMap(0));
      const dash = c.dash ? ` stroke-dasharray="4 3"` : "";
      parts.push(
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c.color ?? "#2563eb"}" stroke-width="1.5"${dash}/>`,
      );
    }
  }

  if (opts.segments) {
    for (const s of opts.segments) {
      const dash = s.dash ? "5 3" : undefined;
      parts.push(
        line(coords.xMap(s.from.re), coords.yMap(s.from.im), coords.xMap(s.to.re), coords.yMap(s.to.im), {
          stroke: s.color ?? "#2563eb",
          width: 1.5,
          dash,
        }),
      );
    }
  }

  if (opts.rays) {
    for (const ray of opts.rays) {
      const L = ray.length ?? Math.max(Math.abs(reR[0]), Math.abs(reR[1]), Math.abs(imR[0]), Math.abs(imR[1])) * 0.9;
      const re = L * Math.cos(ray.argRad);
      const im = L * Math.sin(ray.argRad);
      parts.push(
        line(coords.xMap(0), coords.yMap(0), coords.xMap(re), coords.yMap(im), {
          stroke: ray.color ?? "#9ca3af",
          width: 1,
          dash: "4 3",
        }),
      );
      if (ray.label) {
        parts.push(
          text(coords.xMap(re * 0.55), coords.yMap(im * 0.55) - 6, ray.label, {
            size: 11,
            color: ray.color ?? "#6b7280",
            italic: true,
          }),
        );
      }
    }
  }

  for (const p of opts.points ?? []) {
    const px = coords.xMap(p.re);
    const py = coords.yMap(p.im);
    if (opts.drawVectors) {
      parts.push(
        `<line x1="${coords.xMap(0)}" y1="${coords.yMap(0)}" x2="${px}" y2="${py}" stroke="${p.color ?? "#dc2626"}" stroke-width="1.8" marker-end="url(#arr)"/>`,
      );
    }
    parts.push(circle(px, py, 4, { fill: p.color ?? "#dc2626" }));
    if (p.label) {
      parts.push(text(px + 8, py - 6, p.label, { size: 12, color: p.color ?? "#dc2626" }));
    }
  }

  return svg({ width: w, height: h }, parts.join(""));
}

/**
 * 2D vector diagram — arrows from a common origin (or explicit tails),
 * useful for force diagrams, vector addition (head-to-tail), projections.
 * Used by Vectors in 2D and 3D, Dot/Cross Product, Forces & Equilibrium.
 */
export function vectorDiagram(opts: {
  vectors: Array<{
    /** Tail (defaults to origin) */
    from?: { x: number; y: number };
    to: { x: number; y: number };
    label?: string;
    color?: string;
    dash?: boolean;
  }>;
  /** Plot range (defaults autoscale) */
  xRange?: [number, number];
  yRange?: [number, number];
  xTicks?: number[];
  yTicks?: number[];
  /** Optional grid */
  showGrid?: boolean;
  width?: number;
  height?: number;
}): string {
  const w = opts.width ?? 360;
  const h = opts.height ?? 320;
  // Auto-scale if not given
  let xRange = opts.xRange;
  let yRange = opts.yRange;
  if (!xRange || !yRange) {
    const xs = [0, ...opts.vectors.map((v) => v.to.x), ...opts.vectors.map((v) => v.from?.x ?? 0)];
    const ys = [0, ...opts.vectors.map((v) => v.to.y), ...opts.vectors.map((v) => v.from?.y ?? 0)];
    const xmin = Math.min(...xs);
    const xmax = Math.max(...xs);
    const ymin = Math.min(...ys);
    const ymax = Math.max(...ys);
    const pad = Math.max(xmax - xmin, ymax - ymin) * 0.2 || 1;
    xRange = xRange ?? [Math.floor(xmin - pad), Math.ceil(xmax + pad)];
    yRange = yRange ?? [Math.floor(ymin - pad), Math.ceil(ymax + pad)];
  }
  const margin = { top: 25, right: 30, bottom: 35, left: 45 };
  const coords = makeCoords({
    xRange,
    yRange,
    xPixelRange: [margin.left, w - margin.right],
    yPixelRange: [margin.top, h - margin.bottom],
    xLabel: "x",
    yLabel: "y",
    xTicks: opts.xTicks,
    yTicks: opts.yTicks,
  });

  const parts: string[] = [];

  if (opts.showGrid) {
    for (let gx = xRange[0]; gx <= xRange[1]; gx++) {
      if (gx === 0) continue;
      parts.push(line(coords.xMap(gx), coords.yMap(yRange[0]), coords.xMap(gx), coords.yMap(yRange[1]), { stroke: "#e5e7eb", width: 0.5 }));
    }
    for (let gy = yRange[0]; gy <= yRange[1]; gy++) {
      if (gy === 0) continue;
      parts.push(line(coords.xMap(xRange[0]), coords.yMap(gy), coords.xMap(xRange[1]), coords.yMap(gy), { stroke: "#e5e7eb", width: 0.5 }));
    }
  }

  parts.push(coords.axesContent);

  for (const v of opts.vectors) {
    const from = v.from ?? { x: 0, y: 0 };
    const x1 = coords.xMap(from.x);
    const y1 = coords.yMap(from.y);
    const x2 = coords.xMap(v.to.x);
    const y2 = coords.yMap(v.to.y);
    const dash = v.dash ? ` stroke-dasharray="5 3"` : "";
    parts.push(
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${v.color ?? "#dc2626"}" stroke-width="2"${dash} marker-end="url(#arr)"/>`,
    );
    if (v.label) {
      const mx = (x1 + x2) / 2 + 8;
      const my = (y1 + y2) / 2 - 6;
      parts.push(text(mx, my, v.label, { size: 13, color: v.color ?? "#dc2626", italic: true, bold: true }));
    }
  }

  return svg({ width: w, height: h }, parts.join(""));
}

/**
 * Isometric 3D vector projection — show vectors as arrows in an isometric
 * (x to lower-right, y to upper-right, z upward) coordinate system. Each
 * axis unit projects to a fixed pixel offset. Used by Vectors 3D,
 * Cross Product, Vector Lines and Planes.
 */
export function vector3D(opts: {
  vectors: Array<{
    from?: { x: number; y: number; z: number };
    to: { x: number; y: number; z: number };
    label?: string;
    color?: string;
    dash?: boolean;
  }>;
  /** Axis extent (default 3 each direction) */
  axisExtent?: number;
  /** Show axis labels x, y, z */
  showAxes?: boolean;
  width?: number;
  height?: number;
}): string {
  const w = opts.width ?? 380;
  const h = opts.height ?? 320;
  const extent = opts.axisExtent ?? 3;
  // Isometric projection: x → (cos(-30°), -sin(-30°)), y → (cos(30°), sin(30°)), z → (0, -1)
  const ux = { x: Math.cos(-Math.PI / 6), y: -Math.sin(-Math.PI / 6) };
  const uy = { x: Math.cos(Math.PI / 6), y: Math.sin(Math.PI / 6) };
  const uz = { x: 0, y: -1 };
  // Unit length in pixels
  const u = Math.min(w, h) / (extent * 3.2);
  const ox = w * 0.45;
  const oy = h * 0.55;
  const project = (p: { x: number; y: number; z: number }): { x: number; y: number } => ({
    x: ox + u * (p.x * ux.x + p.y * uy.x + p.z * uz.x),
    y: oy + u * (p.x * ux.y + p.y * uy.y + p.z * uz.y),
  });

  const parts: string[] = [ARROW_DEFS];

  if (opts.showAxes !== false) {
    const xEnd = project({ x: extent, y: 0, z: 0 });
    const yEnd = project({ x: 0, y: extent, z: 0 });
    const zEnd = project({ x: 0, y: 0, z: extent });
    const o = project({ x: 0, y: 0, z: 0 });
    parts.push(`<line x1="${o.x}" y1="${o.y}" x2="${xEnd.x}" y2="${xEnd.y}" stroke="#6b7280" stroke-width="1.2" marker-end="url(#arr)"/>`);
    parts.push(`<line x1="${o.x}" y1="${o.y}" x2="${yEnd.x}" y2="${yEnd.y}" stroke="#6b7280" stroke-width="1.2" marker-end="url(#arr)"/>`);
    parts.push(`<line x1="${o.x}" y1="${o.y}" x2="${zEnd.x}" y2="${zEnd.y}" stroke="#6b7280" stroke-width="1.2" marker-end="url(#arr)"/>`);
    parts.push(text(xEnd.x + 6, xEnd.y + 4, "x", { size: 13, italic: true, color: "#374151" }));
    parts.push(text(yEnd.x + 6, yEnd.y + 4, "y", { size: 13, italic: true, color: "#374151" }));
    parts.push(text(zEnd.x - 4, zEnd.y - 6, "z", { size: 13, italic: true, color: "#374151" }));
  }

  for (const v of opts.vectors) {
    const from = v.from ?? { x: 0, y: 0, z: 0 };
    const a = project(from);
    const b = project(v.to);
    const dash = v.dash ? ` stroke-dasharray="5 3"` : "";
    parts.push(
      `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${v.color ?? "#dc2626"}" stroke-width="2"${dash} marker-end="url(#arr)"/>`,
    );
    if (v.label) {
      parts.push(text(b.x + 6, b.y - 4, v.label, { size: 13, color: v.color ?? "#dc2626", italic: true, bold: true }));
    }
  }

  return svg({ width: w, height: h }, parts.join(""));
}

/**
 * Slope field (direction field) for a first-order ODE dy/dx = f(x, y).
 * Draws short line segments at each (x, y) gridpoint with slope f(x, y),
 * optionally overlaid with one or more particular solution curves.
 */
export function slopeField(opts: {
  fn: (x: number, y: number) => number;
  xRange: [number, number];
  yRange: [number, number];
  /** Grid density on each axis */
  cols?: number;
  rows?: number;
  /** Optional solution curves to overlay */
  solutions?: Array<{
    /** y(x) parametrisation — null skipped */
    fn: (x: number) => number | null;
    color?: string;
    width?: number;
    label?: string;
    labelAt?: { x: number; y: number };
  }>;
  /** Tick lists */
  xTicks?: number[];
  yTicks?: number[];
  width?: number;
  height?: number;
}): string {
  const w = opts.width ?? 380;
  const h = opts.height ?? 320;
  const cols = opts.cols ?? 12;
  const rows = opts.rows ?? 10;
  const margin = { top: 25, right: 30, bottom: 35, left: 45 };
  const coords = makeCoords({
    xRange: opts.xRange,
    yRange: opts.yRange,
    xPixelRange: [margin.left, w - margin.right],
    yPixelRange: [margin.top, h - margin.bottom],
    xLabel: "x",
    yLabel: "y",
    xTicks: opts.xTicks,
    yTicks: opts.yTicks,
  });

  const parts: string[] = [coords.axesContent];

  // Slope ticks
  const segHalf = Math.min(
    (coords.xMap(opts.xRange[1]) - coords.xMap(opts.xRange[0])) / cols / 2.5,
    (coords.yMap(opts.yRange[0]) - coords.yMap(opts.yRange[1])) / rows / 2.5,
  );
  for (let i = 0; i <= cols; i++) {
    const x = opts.xRange[0] + ((i + 0.5) / (cols + 1)) * (opts.xRange[1] - opts.xRange[0]);
    for (let j = 0; j <= rows; j++) {
      const y = opts.yRange[0] + ((j + 0.5) / (rows + 1)) * (opts.yRange[1] - opts.yRange[0]);
      const m = opts.fn(x, y);
      if (!isFinite(m)) continue;
      const theta = Math.atan(m);
      const dx = segHalf * Math.cos(theta);
      const dy = segHalf * Math.sin(theta);
      const cx = coords.xMap(x);
      const cy = coords.yMap(y);
      parts.push(line(cx - dx, cy + dy, cx + dx, cy - dy, { stroke: "#6b7280", width: 1 }));
    }
  }

  for (const sol of opts.solutions ?? []) {
    const samples = 200;
    const pts: Point[] = [];
    for (let i = 0; i <= samples; i++) {
      const x = opts.xRange[0] + (i / samples) * (opts.xRange[1] - opts.xRange[0]);
      const y = sol.fn(x);
      if (y === null || !isFinite(y) || y < opts.yRange[0] || y > opts.yRange[1]) {
        if (pts.length > 1) parts.push(polyline(pts, { stroke: sol.color ?? "#dc2626", width: sol.width ?? 2 }));
        pts.length = 0;
        continue;
      }
      pts.push({ x: coords.xMap(x), y: coords.yMap(y) });
    }
    if (pts.length > 1) parts.push(polyline(pts, { stroke: sol.color ?? "#dc2626", width: sol.width ?? 2 }));
    if (sol.label && sol.labelAt) {
      parts.push(
        text(coords.xMap(sol.labelAt.x), coords.yMap(sol.labelAt.y), sol.label, {
          size: 12,
          color: sol.color ?? "#dc2626",
          italic: true,
        }),
      );
    }
  }

  return svg({ width: w, height: h }, parts.join(""));
}

/**
 * Polar plot — plot r = f(θ) in polar coordinates with radial and angular
 * reference lines.
 */
export function polarPlot(opts: {
  fn: (theta: number) => number;
  thetaRange?: [number, number];
  /** Outer radius extent (defaults to auto from samples) */
  rMax?: number;
  /** Number of radial circles to draw */
  rTicks?: number[];
  /** Angles (in radians) for reference rays */
  thetaTicks?: number[];
  color?: string;
  width?: number;
  height?: number;
}): string {
  const w = opts.width ?? 340;
  const h = opts.height ?? 340;
  const thetaRange = opts.thetaRange ?? [0, 2 * Math.PI];
  const samples = 360;
  const cx = w / 2;
  const cy = h / 2;

  // Compute auto rMax
  const rs: number[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = thetaRange[0] + (i / samples) * (thetaRange[1] - thetaRange[0]);
    const r = opts.fn(t);
    if (isFinite(r)) rs.push(Math.abs(r));
  }
  const rMax = opts.rMax ?? Math.max(...rs, 1) * 1.05;
  const scale = (Math.min(w, h) / 2 - 25) / rMax;

  const parts: string[] = [];

  // Radial reference circles
  const rTicks = opts.rTicks ?? [rMax * 0.25, rMax * 0.5, rMax * 0.75, rMax];
  for (const r of rTicks) {
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${r * scale}" fill="none" stroke="#e5e7eb" stroke-width="1"/>`);
  }
  // Reference rays
  const thetaTicks = opts.thetaTicks ?? [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4];
  for (const t of thetaTicks) {
    const xr = cx + rMax * scale * Math.cos(t);
    const yr = cy - rMax * scale * Math.sin(t);
    parts.push(line(cx, cy, xr, yr, { stroke: "#e5e7eb", width: 1 }));
  }
  // Axes (re/im style)
  parts.push(line(15, cy, w - 15, cy, { stroke: "#9ca3af", width: 1 }));
  parts.push(line(cx, 15, cx, h - 15, { stroke: "#9ca3af", width: 1 }));
  parts.push(text(w - 12, cy + 12, "0", { size: 11, color: "#6b7280", anchor: "end" }));
  parts.push(text(cx + 12, 18, "π/2", { size: 11, color: "#6b7280", italic: true }));

  // The curve
  const pts: Point[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = thetaRange[0] + (i / samples) * (thetaRange[1] - thetaRange[0]);
    const r = opts.fn(t);
    if (!isFinite(r)) continue;
    pts.push({ x: cx + r * scale * Math.cos(t), y: cy - r * scale * Math.sin(t) });
  }
  parts.push(polyline(pts, { stroke: opts.color ?? "#dc2626", width: 2 }));

  return svg({ width: w, height: h }, parts.join(""));
}

/**
 * Bell curve (normal-distribution-like) with optional shaded probability region.
 * For Normal Distribution, Continuous RVs, and related subtopics.
 */
export function bellCurve(opts: {
  mean?: number;
  sd?: number;
  shadedFrom?: number;
  shadedTo?: number;
  xLabel?: string;
  markedValues?: number[];
  width?: number;
  height?: number;
}): string {
  const mu = opts.mean ?? 0;
  const sigma = opts.sd ?? 1;
  const fn = (x: number) =>
    (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
  const xRange: [number, number] = [mu - 4 * sigma, mu + 4 * sigma];
  const yMax = fn(mu) * 1.1;
  return functionPlot({
    fn,
    xRange,
    yRange: [0, yMax],
    color: "#2563eb",
    xLabel: opts.xLabel,
    yLabel: "density",
    width: opts.width,
    height: opts.height,
    xTicks: opts.markedValues,
    shadedRange:
      opts.shadedFrom !== undefined && opts.shadedTo !== undefined
        ? { from: opts.shadedFrom, to: opts.shadedTo, fill: "#bfdbfe" }
        : undefined,
  });
}

// ─── Foundation Mathematics helpers ─────────────────────────────────────
// These helpers target Foundation's plain-shape, plain-table style.

/**
 * Labelled geometric shape — rectangle, right-triangle, or circle — with
 * dimension labels drawn outside the shape. Used for area/perimeter,
 * Pythagoras, surface-area questions.
 */
export function shapeWithLabels(opts: {
  shape: "rectangle" | "right-triangle" | "circle" | "square";
  /** Width (rectangle/square base) in original units */
  width?: number;
  /** Height (rectangle/triangle) in original units */
  height?: number;
  /** Radius (circle) in original units */
  radius?: number;
  /** Unit text appended to dimension labels (e.g. "cm") */
  unit?: string;
  /** Label override for the width edge */
  widthLabel?: string;
  /** Label override for the height edge */
  heightLabel?: string;
  /** Label for the hypotenuse on a right triangle */
  hypLabel?: string;
  /** Show right-angle marker on a triangle */
  showRightAngle?: boolean;
  /** Pixel cap for the longer dimension */
  maxPixels?: number;
}): string {
  const unit = opts.unit ?? "cm";
  const maxPx = opts.maxPixels ?? 200;
  const pad = { top: 30, right: 40, bottom: 40, left: 50 };

  if (opts.shape === "circle") {
    const r = opts.radius ?? 1;
    const px = maxPx / 2;
    const w = px * 2 + pad.left + pad.right;
    const h = px * 2 + pad.top + pad.bottom;
    const cx = pad.left + px;
    const cy = pad.top + px;
    const parts: string[] = [];
    parts.push(circle(cx, cy, px, { fill: "none", stroke: "#111", width: 2 }));
    // Radius arrow + label
    parts.push(line(cx, cy, cx + px, cy, { stroke: "#2563eb", width: 1.5 }));
    parts.push(circle(cx, cy, 2, { fill: "#111" }));
    const rLabel = opts.widthLabel ?? `r = ${r} ${unit}`;
    parts.push(text(cx + px / 2, cy - 6, rLabel, { size: 12, anchor: "middle", color: "#2563eb" }));
    return svg({ width: w, height: h }, parts.join(""));
  }

  if (opts.shape === "right-triangle") {
    const W = opts.width ?? 3;
    const H = opts.height ?? 4;
    const scale = maxPx / Math.max(W, H);
    const pxW = W * scale;
    const pxH = H * scale;
    const w = pxW + pad.left + pad.right;
    const h = pxH + pad.top + pad.bottom;
    const x0 = pad.left;
    const y0 = pad.top + pxH;
    const parts: string[] = [];
    parts.push(
      `<polygon points="${x0},${y0} ${x0 + pxW},${y0} ${x0},${y0 - pxH}" fill="none" stroke="#111" stroke-width="2"/>`,
    );
    if (opts.showRightAngle !== false) {
      const s = 10;
      parts.push(`<polyline points="${x0 + s},${y0} ${x0 + s},${y0 - s} ${x0},${y0 - s}" fill="none" stroke="#111" stroke-width="1"/>`);
    }
    parts.push(
      bracket({
        orientation: "horizontal",
        start: x0,
        end: x0 + pxW,
        axis: y0 + 20,
        label: opts.widthLabel ?? `${W} ${unit}`,
      }),
    );
    parts.push(
      bracket({
        orientation: "vertical",
        start: y0 - pxH,
        end: y0,
        axis: x0 - 14,
        label: opts.heightLabel ?? `${H} ${unit}`,
      }),
    );
    // Hypotenuse label (mid of slanted edge)
    if (opts.hypLabel) {
      parts.push(
        text(x0 + pxW / 2 + 12, y0 - pxH / 2 - 6, opts.hypLabel, {
          size: 12,
          anchor: "start",
          italic: true,
          color: "#dc2626",
        }),
      );
    }
    return svg({ width: w, height: h }, parts.join(""));
  }

  // rectangle or square
  const W = opts.shape === "square" ? opts.width ?? 1 : opts.width ?? 1;
  const H = opts.shape === "square" ? W : opts.height ?? 1;
  const scale = maxPx / Math.max(W, H);
  const pxW = W * scale;
  const pxH = H * scale;
  const w = pxW + pad.left + pad.right;
  const h = pxH + pad.top + pad.bottom;
  const x0 = pad.left;
  const y0 = pad.top;
  const parts: string[] = [];
  parts.push(rect(x0, y0, pxW, pxH, { stroke: "#111", width: 2 }));
  parts.push(
    bracket({
      orientation: "horizontal",
      start: x0,
      end: x0 + pxW,
      axis: y0 + pxH + 18,
      label: opts.widthLabel ?? `${W} ${unit}`,
    }),
  );
  if (opts.shape !== "square") {
    parts.push(
      bracket({
        orientation: "vertical",
        start: y0,
        end: y0 + pxH,
        axis: x0 - 14,
        label: opts.heightLabel ?? `${H} ${unit}`,
      }),
    );
  }
  return svg({ width: w, height: h }, parts.join(""));
}

/**
 * Two-column item/price table rendered as an SVG (instead of a markdown
 * table). Use when you need precise alignment with a header row.
 */
export function priceTable(opts: {
  rows: Array<{ item: string; price: string }>;
  /** Header row override (default ["Item", "Price"]) */
  headers?: [string, string];
  /** Optional footer row (e.g. ["Total", "$45.20"]) */
  footer?: [string, string];
  title?: string;
  width?: number;
}): string {
  const headers = opts.headers ?? ["Item", "Price"];
  const w = opts.width ?? 320;
  const rowH = 26;
  const titleH = opts.title ? 28 : 0;
  const headerH = 28;
  const footerH = opts.footer ? rowH + 4 : 0;
  const totalH = titleH + headerH + rowH * opts.rows.length + footerH + 12;
  const parts: string[] = [];
  let y = 6;
  if (opts.title) {
    parts.push(text(w / 2, y + 16, opts.title, { size: 13, anchor: "middle", bold: true }));
    y += titleH;
  }
  // Header
  parts.push(rect(6, y, w - 12, headerH, { fill: "#f3f4f6", stroke: "#111", width: 1 }));
  parts.push(text(18, y + 18, headers[0], { size: 12, bold: true, anchor: "start" }));
  parts.push(text(w - 18, y + 18, headers[1], { size: 12, bold: true, anchor: "end" }));
  y += headerH;
  // Body
  for (const r of opts.rows) {
    parts.push(rect(6, y, w - 12, rowH, { fill: "none", stroke: "#d1d5db", width: 1 }));
    parts.push(text(18, y + 17, r.item, { size: 12, anchor: "start" }));
    parts.push(text(w - 18, y + 17, r.price, { size: 12, anchor: "end" }));
    y += rowH;
  }
  // Footer
  if (opts.footer) {
    parts.push(rect(6, y + 2, w - 12, rowH, { fill: "#fef3c7", stroke: "#111", width: 1 }));
    parts.push(text(18, y + 20, opts.footer[0], { size: 12, bold: true, anchor: "start" }));
    parts.push(text(w - 18, y + 20, opts.footer[1], { size: 12, bold: true, anchor: "end" }));
  }
  return svg({ width: w, height: totalH }, parts.join(""));
}

/**
 * Pie chart with labelled slices. Each slice is rendered as an SVG arc with
 * a colour drawn from a brand-consistent palette. Labels are placed outside
 * the circle.
 */
export function pieChart(opts: {
  slices: Array<{ label: string; percentage: number; color?: string }>;
  title?: string;
  width?: number;
  height?: number;
  showPercentages?: boolean;
}): string {
  const w = opts.width ?? 360;
  const h = opts.height ?? 320;
  const cx = w / 2;
  const cy = h / 2 + (opts.title ? 10 : 0);
  const r = Math.min(w, h) / 2 - 50;
  const palette = ["#2563eb", "#dc2626", "#16a34a", "#f59e0b", "#7c3aed", "#0891b2", "#db2777", "#65a30d"];
  const parts: string[] = [];
  if (opts.title) parts.push(text(w / 2, 18, opts.title, { size: 13, anchor: "middle", bold: true }));

  // Normalise percentages
  const total = opts.slices.reduce((a, s) => a + s.percentage, 0) || 100;
  let startAngle = -Math.PI / 2;
  opts.slices.forEach((slice, i) => {
    const frac = slice.percentage / total;
    const endAngle = startAngle + frac * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    const color = slice.color ?? palette[i % palette.length];
    if (opts.slices.length === 1) {
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="#fff" stroke-width="2"/>`);
    } else {
      const d = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
      parts.push(`<path d="${d}" fill="${color}" stroke="#fff" stroke-width="2"/>`);
    }
    // Label
    const midA = (startAngle + endAngle) / 2;
    const lx = cx + (r + 18) * Math.cos(midA);
    const ly = cy + (r + 18) * Math.sin(midA);
    const anchor = Math.cos(midA) >= 0 ? "start" : "end";
    const lbl = opts.showPercentages !== false ? `${slice.label} (${slice.percentage}%)` : slice.label;
    parts.push(text(lx, ly + 4, lbl, { size: 12, anchor: anchor as "start" | "end" }));
    startAngle = endAngle;
  });
  return svg({ width: w, height: h }, parts.join(""));
}

/**
 * Personal-budget table: list of categories with amounts and a total row.
 * Mirrors priceTable styling but tuned for budgeting questions.
 */
export function budgetTable(opts: {
  categories: Array<{ name: string; amount: string }>;
  title?: string;
  /** Total label and value pair (auto-bold) */
  total?: { label: string; value: string };
  width?: number;
}): string {
  return priceTable({
    rows: opts.categories.map((c) => ({ item: c.name, price: c.amount })),
    headers: ["Category", "Amount"],
    footer: opts.total ? [opts.total.label, opts.total.value] : undefined,
    title: opts.title,
    width: opts.width,
  });
}

/**
 * Scale-diagram banner: shows a rectangular drawing of dimension `drawingCm`
 * (in centimetres on paper) with annotation "Scale 1 : N" beneath. Used when
 * the question expects students to convert paper-scale to real-world units.
 */
export function scaleDiagram(opts: {
  /** Drawing size on paper, in cm (visual size of the rectangle) */
  drawingCm: { width: number; height: number };
  /** Scale ratio e.g. 1:100 means scale = 100 */
  scale: number;
  /** Real-world unit to show in label (e.g. "m") */
  realUnit?: string;
  /** Optional label inside the drawing (e.g. "Living room") */
  label?: string;
  width?: number;
}): string {
  const unit = opts.realUnit ?? "m";
  const w = opts.width ?? 320;
  const maxPx = 220;
  const dw = opts.drawingCm.width;
  const dh = opts.drawingCm.height;
  const scalePx = maxPx / Math.max(dw, dh);
  const pxW = dw * scalePx;
  const pxH = dh * scalePx;
  const x0 = (w - pxW) / 2;
  const y0 = 28;
  const realW = (dw * opts.scale) / 100; // cm * scale gives real cm; /100 = m
  const realH = (dh * opts.scale) / 100;
  const parts: string[] = [];
  parts.push(rect(x0, y0, pxW, pxH, { stroke: "#111", width: 2, fill: "#f9fafb" }));
  if (opts.label) parts.push(text(x0 + pxW / 2, y0 + pxH / 2 + 4, opts.label, { size: 13, anchor: "middle", italic: true }));
  parts.push(
    bracket({
      orientation: "horizontal",
      start: x0,
      end: x0 + pxW,
      axis: y0 + pxH + 18,
      label: `${dw} cm  (${realW} ${unit} real)`,
    }),
  );
  parts.push(
    bracket({
      orientation: "vertical",
      start: y0,
      end: y0 + pxH,
      axis: x0 - 18,
      label: `${dh} cm  (${realH} ${unit})`,
    }),
  );
  parts.push(text(w / 2, y0 + pxH + 50, `Scale  1 : ${opts.scale}`, { size: 13, anchor: "middle", bold: true }));
  return svg({ width: w, height: y0 + pxH + 70 }, parts.join(""));
}

/**
 * Simple horizontal/vertical bar chart with discrete category labels (for
 * Foundation's categorical-data questions). Distinct from `barChart` (which
 * targets discrete pmfs).
 */
export function categoryBarChart(opts: {
  bars: Array<{ label: string; value: number; color?: string }>;
  title?: string;
  yAxisLabel?: string;
  /** "horizontal" draws horizontal bars; default vertical */
  orientation?: "vertical" | "horizontal";
  width?: number;
  height?: number;
}): string {
  const w = opts.width ?? 380;
  const h = opts.height ?? 280;
  const horizontal = opts.orientation === "horizontal";
  const margin = horizontal
    ? { top: opts.title ? 32 : 20, right: 40, bottom: 40, left: 110 }
    : { top: opts.title ? 32 : 20, right: 20, bottom: 50, left: 60 };
  const innerW = w - margin.left - margin.right;
  const innerH = h - margin.top - margin.bottom;
  const maxV = Math.max(...opts.bars.map((b) => b.value)) * 1.1;
  const parts: string[] = [];
  if (opts.title) parts.push(text(w / 2, 18, opts.title, { size: 13, anchor: "middle", bold: true }));
  // Axes
  parts.push(line(margin.left, margin.top, margin.left, margin.top + innerH, { width: 1.5 }));
  parts.push(line(margin.left, margin.top + innerH, margin.left + innerW, margin.top + innerH, { width: 1.5 }));

  if (horizontal) {
    const barH = (innerH / opts.bars.length) * 0.7;
    const gap = (innerH / opts.bars.length) * 0.3;
    opts.bars.forEach((b, i) => {
      const yPos = margin.top + i * (innerH / opts.bars.length) + gap / 2;
      const barW = (b.value / maxV) * innerW;
      parts.push(rect(margin.left, yPos, barW, barH, { fill: b.color ?? "#93c5fd", stroke: "#1e40af", width: 1 }));
      parts.push(text(margin.left - 6, yPos + barH / 2 + 4, b.label, { size: 11, anchor: "end" }));
      parts.push(text(margin.left + barW + 4, yPos + barH / 2 + 4, String(b.value), { size: 11, anchor: "start" }));
    });
  } else {
    const barW = (innerW / opts.bars.length) * 0.7;
    const gap = (innerW / opts.bars.length) * 0.3;
    opts.bars.forEach((b, i) => {
      const xPos = margin.left + i * (innerW / opts.bars.length) + gap / 2;
      const barH = (b.value / maxV) * innerH;
      const yPos = margin.top + innerH - barH;
      parts.push(rect(xPos, yPos, barW, barH, { fill: b.color ?? "#93c5fd", stroke: "#1e40af", width: 1 }));
      parts.push(text(xPos + barW / 2, yPos - 4, String(b.value), { size: 10, anchor: "middle" }));
      parts.push(text(xPos + barW / 2, margin.top + innerH + 14, b.label, { size: 11, anchor: "middle" }));
    });
  }
  if (opts.yAxisLabel) {
    parts.push(text(16, margin.top + innerH / 2, opts.yAxisLabel, { size: 12, anchor: "middle", rotate: -90 }));
  }
  return svg({ width: w, height: h }, parts.join(""));
}

/**
 * Simple Venn diagram with two overlapping circles. Counts/labels are placed
 * inside each region.
 */
export function vennTwoSet(opts: {
  /** Label for the left-set ("only A") region */
  leftLabel?: string;
  /** Label for the right-set ("only B") region */
  rightLabel?: string;
  /** Label for the centre intersection region */
  centerLabel?: string;
  /** Set names (drawn above each circle) */
  setNames?: [string, string];
  /** Count outside both sets (universe complement) */
  outsideLabel?: string;
  title?: string;
  width?: number;
  height?: number;
}): string {
  const w = opts.width ?? 360;
  const h = opts.height ?? 240;
  const cy = h / 2 + (opts.title ? 8 : 0);
  const r = 70;
  const cx1 = w / 2 - 40;
  const cx2 = w / 2 + 40;
  const parts: string[] = [];
  if (opts.title) parts.push(text(w / 2, 18, opts.title, { size: 13, anchor: "middle", bold: true }));
  // Universe box
  parts.push(rect(8, 8 + (opts.title ? 14 : 0), w - 16, h - 16 - (opts.title ? 14 : 0), { stroke: "#9ca3af", fill: "none", width: 1 }));
  if (opts.outsideLabel) parts.push(text(w - 18, h - 14, opts.outsideLabel, { size: 12, anchor: "end" }));
  // Circles
  parts.push(`<circle cx="${cx1}" cy="${cy}" r="${r}" fill="#bfdbfe" fill-opacity="0.45" stroke="#1e40af" stroke-width="1.5"/>`);
  parts.push(`<circle cx="${cx2}" cy="${cy}" r="${r}" fill="#fecaca" fill-opacity="0.45" stroke="#b91c1c" stroke-width="1.5"/>`);
  if (opts.setNames) {
    parts.push(text(cx1 - 50, cy - r - 8, opts.setNames[0], { size: 13, bold: true, anchor: "middle" }));
    parts.push(text(cx2 + 50, cy - r - 8, opts.setNames[1], { size: 13, bold: true, anchor: "middle" }));
  }
  if (opts.leftLabel) parts.push(text(cx1 - 30, cy + 4, opts.leftLabel, { size: 14, anchor: "middle", bold: true }));
  if (opts.centerLabel) parts.push(text((cx1 + cx2) / 2, cy + 4, opts.centerLabel, { size: 14, anchor: "middle", bold: true }));
  if (opts.rightLabel) parts.push(text(cx2 + 30, cy + 4, opts.rightLabel, { size: 14, anchor: "middle", bold: true }));
  return svg({ width: w, height: h }, parts.join(""));
}

// ─── VCE General helpers ─────────────────────────────────────────────────

/**
 * Scatterplot with optional regression line and residual lines.
 * Workhorse for bivariate-data / regression / residual-analysis subtopics.
 */
export function scatterPlot(opts: {
  points: Array<{ x: number; y: number; label?: string }>;
  xRange: [number, number];
  yRange: [number, number];
  xLabel?: string;
  yLabel?: string;
  xTicks?: number[];
  yTicks?: number[];
  regressionLine?: { slope: number; intercept: number; color?: string; label?: string };
  residualLines?: boolean;
  pointColor?: string;
  pointRadius?: number;
  title?: string;
  width?: number;
  height?: number;
}): string {
  const w = opts.width ?? 420;
  const h = opts.height ?? 320;
  const margin = { top: opts.title ? 30 : 20, right: 30, bottom: 45, left: 55 };
  const coords = makeCoords({
    xRange: opts.xRange,
    yRange: opts.yRange,
    xPixelRange: [margin.left, w - margin.right],
    yPixelRange: [margin.top, h - margin.bottom],
    xLabel: opts.xLabel ?? "x",
    yLabel: opts.yLabel ?? "y",
    xTicks: opts.xTicks,
    yTicks: opts.yTicks,
    xAxisAt: opts.yRange[0],
    yAxisAt: opts.xRange[0],
  });
  const parts: string[] = [coords.axesContent];
  if (opts.regressionLine) {
    const { slope, intercept } = opts.regressionLine;
    const fn = (x: number) => slope * x + intercept;
    const x1 = opts.xRange[0];
    const x2 = opts.xRange[1];
    parts.push(
      line(coords.xMap(x1), coords.yMap(fn(x1)), coords.xMap(x2), coords.yMap(fn(x2)), {
        stroke: opts.regressionLine.color ?? "#2563eb",
        width: 1.8,
      }),
    );
    if (opts.regressionLine.label) {
      parts.push(
        text(coords.xMap(x2) - 4, coords.yMap(fn(x2)) - 6, opts.regressionLine.label, {
          size: 11,
          anchor: "end",
          color: opts.regressionLine.color ?? "#2563eb",
          italic: true,
        }),
      );
    }
  }
  if (opts.residualLines && opts.regressionLine) {
    const { slope, intercept } = opts.regressionLine;
    for (const p of opts.points) {
      const yFit = slope * p.x + intercept;
      parts.push(
        line(coords.xMap(p.x), coords.yMap(p.y), coords.xMap(p.x), coords.yMap(yFit), {
          stroke: "#9ca3af",
          width: 1,
          dash: "3 2",
        }),
      );
    }
  }
  for (const p of opts.points) {
    parts.push(circle(coords.xMap(p.x), coords.yMap(p.y), opts.pointRadius ?? 3.5, { fill: opts.pointColor ?? "#1e40af" }));
    if (p.label) {
      parts.push(text(coords.xMap(p.x) + 5, coords.yMap(p.y) - 5, p.label, { size: 10 }));
    }
  }
  if (opts.title) parts.push(text(w / 2, 16, opts.title, { size: 13, anchor: "middle", bold: true }));
  return svg({ width: w, height: h }, parts.join(""));
}

/**
 * Horizontal box-and-whisker plot with optional outliers marked.
 */
export function boxPlot(opts: {
  summary: { min: number; q1: number; median: number; q3: number; max: number };
  outliers?: number[];
  xRange?: [number, number];
  xLabel?: string;
  xTicks?: number[];
  title?: string;
  width?: number;
  height?: number;
}): string {
  const w = opts.width ?? 420;
  const h = opts.height ?? 140;
  const margin = { top: opts.title ? 28 : 20, right: 25, bottom: 45, left: 30 };
  const allVals = [opts.summary.min, opts.summary.max, ...(opts.outliers ?? [])];
  let lo = Math.min(...allVals);
  let hi = Math.max(...allVals);
  if (opts.xRange) {
    lo = opts.xRange[0];
    hi = opts.xRange[1];
  } else {
    const pad = (hi - lo) * 0.08;
    lo -= pad;
    hi += pad;
  }
  const xPxL = margin.left;
  const xPxR = w - margin.right;
  const xMap = (x: number) => xPxL + ((x - lo) / (hi - lo)) * (xPxR - xPxL);

  const cy = (h - margin.bottom + margin.top) / 2;
  const boxTop = cy - 18;
  const boxBot = cy + 18;
  const whiskerHalf = 10;

  const parts: string[] = [];
  parts.push(
    rect(
      xMap(opts.summary.q1),
      boxTop,
      xMap(opts.summary.q3) - xMap(opts.summary.q1),
      boxBot - boxTop,
      { fill: "#dbeafe", stroke: "#1e40af", width: 1.5 },
    ),
  );
  parts.push(line(xMap(opts.summary.median), boxTop, xMap(opts.summary.median), boxBot, { stroke: "#1e40af", width: 2 }));
  parts.push(line(xMap(opts.summary.min), cy, xMap(opts.summary.q1), cy, { width: 1.2 }));
  parts.push(line(xMap(opts.summary.q3), cy, xMap(opts.summary.max), cy, { width: 1.2 }));
  parts.push(line(xMap(opts.summary.min), cy - whiskerHalf, xMap(opts.summary.min), cy + whiskerHalf, { width: 1.2 }));
  parts.push(line(xMap(opts.summary.max), cy - whiskerHalf, xMap(opts.summary.max), cy + whiskerHalf, { width: 1.2 }));
  for (const o of opts.outliers ?? []) {
    parts.push(circle(xMap(o), cy, 3.5, { fill: "white", stroke: "#dc2626", width: 1.5 }));
  }
  const axisY = h - margin.bottom + 6;
  parts.push(line(xPxL - 5, axisY, xPxR + 5, axisY, { width: 1.2 }));
  if (opts.xTicks) {
    for (const t of opts.xTicks) {
      const tx = xMap(t);
      parts.push(line(tx, axisY - 3, tx, axisY + 3, { width: 1 }));
      parts.push(text(tx, axisY + 14, String(t), { size: 11, anchor: "middle" }));
    }
  }
  if (opts.xLabel) parts.push(text((xPxL + xPxR) / 2, h - 6, opts.xLabel, { size: 12, anchor: "middle", italic: true }));
  if (opts.title) parts.push(text(w / 2, 16, opts.title, { size: 13, anchor: "middle", bold: true }));

  return svg({ width: w, height: h }, parts.join(""));
}

/**
 * Histogram with configurable bin edges and frequencies.
 */
export function histogramChart(opts: {
  binEdges: number[];
  frequencies: number[];
  xLabel?: string;
  yLabel?: string;
  title?: string;
  highlightBin?: number;
  width?: number;
  height?: number;
}): string {
  const w = opts.width ?? 440;
  const h = opts.height ?? 300;
  const margin = { top: opts.title ? 30 : 20, right: 25, bottom: 50, left: 55 };
  const n = opts.frequencies.length;
  if (opts.binEdges.length !== n + 1) {
    throw new Error("binEdges length must be frequencies length + 1");
  }
  const innerW = w - margin.left - margin.right;
  const innerH = h - margin.top - margin.bottom;
  const xMin = opts.binEdges[0];
  const xMax = opts.binEdges[n];
  const yMax = Math.max(...opts.frequencies) * 1.15;
  const xMap = (x: number) => margin.left + ((x - xMin) / (xMax - xMin)) * innerW;
  const yMap = (y: number) => margin.top + innerH - (y / yMax) * innerH;
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    const x0 = xMap(opts.binEdges[i]);
    const x1 = xMap(opts.binEdges[i + 1]);
    const y0 = yMap(opts.frequencies[i]);
    const fill = opts.highlightBin === i ? "#2563eb" : "#93c5fd";
    parts.push(`<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${margin.top + innerH - y0}" fill="${fill}" stroke="#1e40af" stroke-width="1"/>`);
  }
  parts.push(line(margin.left, margin.top + innerH, margin.left + innerW, margin.top + innerH, { width: 1.5 }));
  parts.push(line(margin.left, margin.top, margin.left, margin.top + innerH, { width: 1.5 }));
  for (let i = 0; i <= n; i++) {
    const tx = xMap(opts.binEdges[i]);
    parts.push(line(tx, margin.top + innerH, tx, margin.top + innerH + 3, { width: 1 }));
    parts.push(text(tx, margin.top + innerH + 14, String(opts.binEdges[i]), { size: 10, anchor: "middle" }));
  }
  const yTickStep = Math.max(1, Math.ceil(yMax / 8));
  for (let t = 0; t <= yMax; t += yTickStep) {
    const ty = yMap(t);
    parts.push(line(margin.left - 3, ty, margin.left, ty, { width: 1 }));
    parts.push(text(margin.left - 5, ty + 4, String(t), { size: 10, anchor: "end" }));
  }
  if (opts.xLabel) parts.push(text(margin.left + innerW / 2, h - 8, opts.xLabel, { size: 12, anchor: "middle", italic: true }));
  if (opts.yLabel) parts.push(text(15, margin.top + innerH / 2, opts.yLabel, { size: 12, anchor: "middle", rotate: -90 }));
  if (opts.title) parts.push(text(w / 2, 16, opts.title, { size: 13, anchor: "middle", bold: true }));
  return svg({ width: w, height: h }, parts.join(""));
}

/**
 * Dot plot — stacked dots per discrete value.
 */
export function dotPlot(opts: {
  values: number[];
  xRange?: [number, number];
  xLabel?: string;
  xTicks?: number[];
  dotColor?: string;
  title?: string;
  width?: number;
  height?: number;
}): string {
  const w = opts.width ?? 440;
  const h = opts.height ?? 200;
  const margin = { top: opts.title ? 28 : 20, right: 25, bottom: 45, left: 30 };
  const counts = new Map<number, number>();
  for (const v of opts.values) counts.set(v, (counts.get(v) ?? 0) + 1);
  const allVals = Array.from(counts.keys()).sort((a, b) => a - b);
  let lo = opts.xRange?.[0] ?? Math.min(...allVals);
  let hi = opts.xRange?.[1] ?? Math.max(...allVals);
  if (lo === hi) { lo -= 1; hi += 1; }
  const innerW = w - margin.left - margin.right;
  const innerH = h - margin.top - margin.bottom;
  const xMap = (x: number) => margin.left + ((x - lo) / (hi - lo)) * innerW;
  const maxStack = Math.max(...Array.from(counts.values()));
  const dotR = Math.min(7, (innerH - 10) / (2 * Math.max(maxStack, 1)));

  const parts: string[] = [];
  const baseY = margin.top + innerH - 2;
  parts.push(line(margin.left - 5, baseY, margin.left + innerW + 5, baseY, { width: 1.2 }));
  for (const [v, cnt] of Array.from(counts.entries())) {
    const cx = xMap(v);
    for (let k = 0; k < cnt; k++) {
      const cy = baseY - dotR - k * (2 * dotR + 1);
      parts.push(circle(cx, cy, dotR, { fill: opts.dotColor ?? "#1e40af" }));
    }
  }
  const ticks = opts.xTicks ?? Array.from({ length: Math.floor(hi - lo) + 1 }, (_, i) => lo + i);
  for (const t of ticks) {
    if (t < lo || t > hi) continue;
    const tx = xMap(t);
    parts.push(line(tx, baseY, tx, baseY + 4, { width: 1 }));
    parts.push(text(tx, baseY + 16, String(t), { size: 10, anchor: "middle" }));
  }
  if (opts.xLabel) parts.push(text(margin.left + innerW / 2, h - 6, opts.xLabel, { size: 12, anchor: "middle", italic: true }));
  if (opts.title) parts.push(text(w / 2, 16, opts.title, { size: 13, anchor: "middle", bold: true }));
  return svg({ width: w, height: h }, parts.join(""));
}

/**
 * Stem-and-leaf plot. Stems = floor(v/stemDiv), leaves sorted ascending.
 */
export function stemAndLeaf(opts: {
  values: number[];
  stemDiv?: number;
  title?: string;
  width?: number;
  rowHeight?: number;
}): string {
  const div = opts.stemDiv ?? 10;
  const rowH = opts.rowHeight ?? 18;
  const stems = new Map<number, number[]>();
  for (const v of opts.values) {
    const stem = Math.floor(v / div);
    const leaf = Math.abs(v % div);
    if (!stems.has(stem)) stems.set(stem, []);
    stems.get(stem)!.push(leaf);
  }
  const sortedStems = Array.from(stems.keys()).sort((a, b) => a - b);
  for (const s of sortedStems) stems.get(s)!.sort((a, b) => a - b);

  const w = opts.width ?? 320;
  const h = (sortedStems.length + 2) * rowH + (opts.title ? 24 : 14);
  const parts: string[] = [];
  const yTop = opts.title ? 30 : 14;
  parts.push(text(60, yTop, "Stem", { size: 12, anchor: "end", italic: true }));
  parts.push(text(75, yTop, "Leaf", { size: 12, anchor: "start", italic: true }));
  parts.push(line(20, yTop + 4, w - 20, yTop + 4, { width: 1 }));
  parts.push(line(68, yTop + 4, 68, yTop + 4 + sortedStems.length * rowH, { width: 1 }));
  sortedStems.forEach((s, i) => {
    const y = yTop + rowH * (i + 1);
    parts.push(text(60, y, String(s), { size: 12, anchor: "end" }));
    parts.push(text(75, y, stems.get(s)!.join(" "), { size: 12, anchor: "start" }));
  });
  if (opts.title) parts.push(text(w / 2, 16, opts.title, { size: 13, anchor: "middle", bold: true }));
  return svg({ width: w, height: h }, parts.join(""));
}

/**
 * Time-series plot with raw points + optional smoothed / trend lines.
 */
export function timeSeriesPlot(opts: {
  points: Array<{ t: number; y: number }>;
  smoothedLine?: Array<{ t: number; y: number }>;
  trendLine?: { slope: number; intercept: number; color?: string };
  yRange?: [number, number];
  xLabel?: string;
  yLabel?: string;
  xTicks?: number[];
  yTicks?: number[];
  title?: string;
  connectPoints?: boolean;
  width?: number;
  height?: number;
}): string {
  const w = opts.width ?? 480;
  const h = opts.height ?? 300;
  const margin = { top: opts.title ? 30 : 20, right: 30, bottom: 45, left: 55 };
  const ts = opts.points.map((p) => p.t);
  const tMin = Math.min(...ts);
  const tMax = Math.max(...ts);
  const ys = opts.points.map((p) => p.y);
  const yLo = opts.yRange?.[0] ?? Math.min(...ys) * 0.95;
  const yHi = opts.yRange?.[1] ?? Math.max(...ys) * 1.05;
  const coords = makeCoords({
    xRange: [tMin, tMax],
    yRange: [yLo, yHi],
    xPixelRange: [margin.left, w - margin.right],
    yPixelRange: [margin.top, h - margin.bottom],
    xLabel: opts.xLabel ?? "t",
    yLabel: opts.yLabel ?? "value",
    xTicks: opts.xTicks,
    yTicks: opts.yTicks,
    xAxisAt: yLo,
    yAxisAt: tMin,
  });
  const parts: string[] = [coords.axesContent];
  if (opts.connectPoints) {
    const pts: Point[] = opts.points.map((p) => ({ x: coords.xMap(p.t), y: coords.yMap(p.y) }));
    parts.push(polyline(pts, { stroke: "#9ca3af", width: 1.3 }));
  }
  for (const p of opts.points) {
    parts.push(circle(coords.xMap(p.t), coords.yMap(p.y), 3, { fill: "#1e40af" }));
  }
  if (opts.smoothedLine) {
    const pts: Point[] = opts.smoothedLine.map((p) => ({ x: coords.xMap(p.t), y: coords.yMap(p.y) }));
    parts.push(polyline(pts, { stroke: "#dc2626", width: 2 }));
  }
  if (opts.trendLine) {
    const { slope, intercept } = opts.trendLine;
    const fn = (t: number) => slope * t + intercept;
    parts.push(
      line(coords.xMap(tMin), coords.yMap(fn(tMin)), coords.xMap(tMax), coords.yMap(fn(tMax)), {
        stroke: opts.trendLine.color ?? "#16a34a",
        width: 1.8,
        dash: "5 3",
      }),
    );
  }
  if (opts.title) parts.push(text(w / 2, 16, opts.title, { size: 13, anchor: "middle", bold: true }));
  return svg({ width: w, height: h }, parts.join(""));
}

/**
 * Matrix table with square brackets and optional row/column labels.
 */
export function matrixTable(opts: {
  values: (number | string)[][];
  label?: string;
  rowLabels?: string[];
  colLabels?: string[];
  cellWidth?: number;
  cellHeight?: number;
  bracketThickness?: number;
  width?: number;
  height?: number;
}): string {
  const cellW = opts.cellWidth ?? 38;
  const cellH = opts.cellHeight ?? 30;
  const rows = opts.values.length;
  const cols = opts.values[0]?.length ?? 0;
  const labelOffset = (opts.rowLabels ? 24 : 0) + (opts.label ? 36 : 0);
  const colLabelOffset = opts.colLabels ? 22 : 0;
  const bracketGap = 6;
  const bracketWidth = 10;
  const padding = 14;
  const innerW = cols * cellW + 2 * bracketGap + 2 * bracketWidth;
  const innerH = rows * cellH;
  const w = opts.width ?? padding * 2 + labelOffset + innerW;
  const h = opts.height ?? padding * 2 + colLabelOffset + innerH;
  const matrixX = padding + labelOffset;
  const matrixY = padding + colLabelOffset;
  const cellsLeft = matrixX + bracketWidth + bracketGap;
  const parts: string[] = [];
  if (opts.label) {
    parts.push(text(padding, matrixY + innerH / 2 + 5, `${opts.label} =`, { size: 16, italic: true, bold: true }));
  }
  if (opts.rowLabels) {
    for (let r = 0; r < rows; r++) {
      parts.push(text(matrixX + bracketWidth - 6, matrixY + r * cellH + cellH / 2 + 4, opts.rowLabels[r] ?? "", { size: 12, anchor: "end", italic: true }));
    }
  }
  if (opts.colLabels) {
    for (let c = 0; c < cols; c++) {
      parts.push(text(cellsLeft + c * cellW + cellW / 2, matrixY - 6, opts.colLabels[c] ?? "", { size: 12, anchor: "middle", italic: true }));
    }
  }
  const bThick = opts.bracketThickness ?? 1.8;
  parts.push(line(matrixX + bracketWidth, matrixY, matrixX, matrixY, { width: bThick }));
  parts.push(line(matrixX, matrixY, matrixX, matrixY + innerH, { width: bThick }));
  parts.push(line(matrixX, matrixY + innerH, matrixX + bracketWidth, matrixY + innerH, { width: bThick }));
  const rightX = cellsLeft + cols * cellW + bracketGap;
  parts.push(line(rightX, matrixY, rightX + bracketWidth, matrixY, { width: bThick }));
  parts.push(line(rightX + bracketWidth, matrixY, rightX + bracketWidth, matrixY + innerH, { width: bThick }));
  parts.push(line(rightX + bracketWidth, matrixY + innerH, rightX, matrixY + innerH, { width: bThick }));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = cellsLeft + c * cellW + cellW / 2;
      const cy = matrixY + r * cellH + cellH / 2 + 5;
      parts.push(text(cx, cy, String(opts.values[r][c]), { size: 13, anchor: "middle" }));
    }
  }
  return svg({ width: w, height: h }, parts.join(""));
}

// ─── Network / graph helpers ────────────────────────────────────────────

export interface NetworkNode {
  id: string;
  x: number;
  y: number;
  label?: string;
  radius?: number;
}
export interface NetworkEdge {
  from: string;
  to: string;
  weight?: number | string;
  color?: string;
  dash?: string;
  highlight?: boolean;
}

/**
 * Generic network graph — used by Graphs/Networks, Adjacency Matrices, MST,
 * Shortest Path, Trees, Hamiltonian/Eulerian, Bipartite, Planar.
 */
export function networkGraph(opts: {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  directed?: boolean;
  highlightedEdges?: Array<[string, string]>;
  highlightedNodes?: string[];
  nodeFill?: string;
  nodeStroke?: string;
  width?: number;
  height?: number;
  xRange?: [number, number];
  yRange?: [number, number];
  padding?: number;
}): string {
  const w = opts.width ?? 400;
  const h = opts.height ?? 320;
  const pad = opts.padding ?? 40;
  const xs = opts.nodes.map((n) => n.x);
  const ys = opts.nodes.map((n) => n.y);
  const xLo = opts.xRange?.[0] ?? Math.min(...xs);
  const xHi = opts.xRange?.[1] ?? Math.max(...xs);
  const yLo = opts.yRange?.[0] ?? Math.min(...ys);
  const yHi = opts.yRange?.[1] ?? Math.max(...ys);
  const xRange = Math.max(1e-9, xHi - xLo);
  const yRange = Math.max(1e-9, yHi - yLo);
  const xMap = (x: number) => pad + ((x - xLo) / xRange) * (w - 2 * pad);
  const yMap = (y: number) => h - pad - ((y - yLo) / yRange) * (h - 2 * pad);

  const byId = new Map(opts.nodes.map((n) => [n.id, n]));
  const isEdgeHighlighted = (a: string, b: string) =>
    opts.highlightedEdges?.some(([x, y]) => (x === a && y === b) || (x === b && y === a)) ?? false;

  const parts: string[] = [];
  if (opts.directed) {
    parts.push(
      `<defs><marker id="net-arr" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L8,3 z" fill="#111"/></marker></defs>`,
    );
  }

  for (const e of opts.edges) {
    const a = byId.get(e.from);
    const b = byId.get(e.to);
    if (!a || !b) continue;
    const ax = xMap(a.x), ay = yMap(a.y);
    const bx = xMap(b.x), by = yMap(b.y);
    const highlight = e.highlight || isEdgeHighlighted(e.from, e.to);
    const color = highlight ? "#dc2626" : (e.color ?? "#111");
    const width = highlight ? 2.5 : 1.5;
    const arrow = opts.directed ? ` marker-end="url(#net-arr)"` : "";
    const dash = e.dash ? ` stroke-dasharray="${e.dash}"` : "";
    const aR = a.radius ?? 14;
    const bR = b.radius ?? 14;
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.max(1e-9, Math.hypot(dx, dy));
    const ux = dx / len;
    const uy = dy / len;
    const sx = ax + ux * aR;
    const sy = ay + uy * aR;
    const ex = bx - ux * bR;
    const ey = by - uy * bR;
    parts.push(`<line x1="${sx.toFixed(2)}" y1="${sy.toFixed(2)}" x2="${ex.toFixed(2)}" y2="${ey.toFixed(2)}" stroke="${color}" stroke-width="${width}"${dash}${arrow}/>`);

    if (e.weight !== undefined && e.weight !== null) {
      const mx = (sx + ex) / 2;
      const my = (sy + ey) / 2;
      const px = -uy * 10;
      const py = ux * 10;
      const lx = mx + px;
      const ly = my + py + 3;
      const wStr = String(e.weight);
      parts.push(`<rect x="${(lx - wStr.length * 4 - 2).toFixed(2)}" y="${(ly - 11).toFixed(2)}" width="${(wStr.length * 8 + 4).toFixed(2)}" height="14" fill="white" stroke="none"/>`);
      parts.push(text(lx, ly, wStr, { size: 11, anchor: "middle", color: highlight ? "#dc2626" : "#1e40af" }));
    }
  }

  for (const n of opts.nodes) {
    const cx = xMap(n.x);
    const cy = yMap(n.y);
    const r = n.radius ?? 14;
    const fill = opts.highlightedNodes?.includes(n.id) ? "#fee2e2" : (opts.nodeFill ?? "#fff");
    const stroke = opts.highlightedNodes?.includes(n.id) ? "#dc2626" : (opts.nodeStroke ?? "#111");
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>`);
    parts.push(text(cx, cy + 4, n.label ?? n.id, { size: 12, anchor: "middle", bold: true }));
  }

  return svg({ width: w, height: h }, parts.join(""));
}

/**
 * Weighted-network with a highlighted path drawn in red.
 */
export function weightedNetworkPath(opts: {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  highlightedPath: string[];
  directed?: boolean;
  width?: number;
  height?: number;
}): string {
  const highlightedEdges: Array<[string, string]> = [];
  for (let i = 0; i < opts.highlightedPath.length - 1; i++) {
    highlightedEdges.push([opts.highlightedPath[i], opts.highlightedPath[i + 1]]);
  }
  return networkGraph({
    nodes: opts.nodes,
    edges: opts.edges,
    directed: opts.directed,
    highlightedEdges,
    highlightedNodes: opts.highlightedPath,
    width: opts.width,
    height: opts.height,
  });
}

/**
 * Transition diagram for Markov chains — directed network with self-loop
 * support for states where the probability of staying is non-zero.
 */
export function transitionDiagram(opts: {
  states: Array<{ id: string; x: number; y: number; label?: string }>;
  transitions: Array<{ from: string; to: string; prob: number | string }>;
  width?: number;
  height?: number;
}): string {
  const selfLoops = opts.transitions.filter((t) => t.from === t.to);
  const pairs = opts.transitions.filter((t) => t.from !== t.to);
  const edges: NetworkEdge[] = pairs.map((t) => ({ from: t.from, to: t.to, weight: t.prob }));
  const base = networkGraph({
    nodes: opts.states.map((s) => ({ id: s.id, x: s.x, y: s.y, label: s.label ?? s.id, radius: 18 })),
    edges,
    directed: true,
    width: opts.width ?? 380,
    height: opts.height ?? 320,
  });
  if (selfLoops.length === 0) return base;
  const pad = 40;
  const w = opts.width ?? 380;
  const h = opts.height ?? 320;
  const xs = opts.states.map((n) => n.x);
  const ys = opts.states.map((n) => n.y);
  const xLo = Math.min(...xs), xHi = Math.max(...xs);
  const yLo = Math.min(...ys), yHi = Math.max(...ys);
  const xRange = Math.max(1e-9, xHi - xLo);
  const yRange = Math.max(1e-9, yHi - yLo);
  const xMap = (x: number) => pad + ((x - xLo) / xRange) * (w - 2 * pad);
  const yMap = (y: number) => h - pad - ((y - yLo) / yRange) * (h - 2 * pad);
  const byId = new Map(opts.states.map((s) => [s.id, s]));
  const extra: string[] = [];
  for (const t of selfLoops) {
    const s = byId.get(t.from);
    if (!s) continue;
    const cx = xMap(s.x), cy = yMap(s.y);
    const loopR = 14;
    const arcCx = cx;
    const arcCy = cy - 28;
    extra.push(`<path d="M ${cx + 6} ${cy - 12} A ${loopR} ${loopR} 0 1 1 ${cx - 6} ${cy - 12}" fill="none" stroke="#111" stroke-width="1.5" marker-end="url(#net-arr)"/>`);
    extra.push(text(arcCx, arcCy - 6, String(t.prob), { size: 11, anchor: "middle", color: "#1e40af" }));
  }
  return base.replace("</svg>", extra.join("") + "</svg>");
}

/**
 * Critical-path diagram — directed activity network. Each activity drawn as
 * an edge with its id and duration label.
 */
export function criticalPathDiagram(opts: {
  nodes: NetworkNode[];
  activities: Array<{ id: string; from: string; to: string; duration: number; onCriticalPath?: boolean }>;
  width?: number;
  height?: number;
}): string {
  const edges: NetworkEdge[] = opts.activities.map((a) => ({
    from: a.from,
    to: a.to,
    weight: `${a.id}, ${a.duration}`,
    highlight: a.onCriticalPath,
    dash: a.duration === 0 ? "4 3" : undefined,
  }));
  return networkGraph({
    nodes: opts.nodes,
    edges,
    directed: true,
    width: opts.width ?? 460,
    height: opts.height ?? 320,
  });
}
