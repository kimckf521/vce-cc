/**
 * Shared helpers for building AI-generated question set JSON files.
 *
 * Exports:
 *   - graphImage(f, opts, alt)    — render a function as an auto-ticked SVG
 *                                   plot and return a markdown image tag with
 *                                   the SVG base64-encoded inline.
 *   - dechainSolution(markdown)   — split `$$A = B = C$$` chains into separate
 *                                   single-equation display blocks.
 *   - MCQ, FR                     — question object types.
 *   - writeQset(path, data)       — validate counts + mark sizes and write.
 */
import fs from "fs";

// ─── SVG plotter ─────────────────────────────────────────────────────────────
export interface PlotOpts {
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

export function makeSVG(f: (x: number) => number, opts: PlotOpts): string {
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

export function graphImage(
  f: (x: number) => number,
  opts: PlotOpts,
  alt: string
): string {
  const svg = makeSVG(f, opts);
  const b64 = Buffer.from(svg, "utf-8").toString("base64");
  return `![${alt}](data:image/svg+xml;base64,${b64})`;
}

// ─── Chain-equality splitter ─────────────────────────────────────────────────
function splitChain(body: string): string[] | null {
  const eqPositions: number[] = [];
  let depth = 0;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === "(" || c === "{" || c === "[") depth++;
    else if (c === ")" || c === "}" || c === "]") depth--;
    else if (c === "=" && depth === 0) eqPositions.push(i);
  }
  if (eqPositions.length < 2) return null;
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

export function dechainSolution(content: string): string {
  return content.replace(/\$\$([\s\S]*?)\$\$/g, (match, body) => {
    const split = splitChain(body);
    if (!split) return match;
    return split.map((b) => `$$${b}$$`).join("\n\n");
  });
}

// ─── Geometry figure primitives ──────────────────────────────────────────────
// Each function returns a markdown image tag with a base64-encoded SVG. The
// figures are schematic — labels are plain text (the true values live in the
// question body, and the figure shows their relative positions).

function wrapSVG(inner: string, W: number, H: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="white"/>${inner}</svg>`;
  const b64 = Buffer.from(svg, "utf-8").toString("base64");
  return `data:image/svg+xml;base64,${b64}`;
}

function mdImage(dataUrl: string, alt: string): string {
  return `![${alt}](${dataUrl})`;
}

// Common style fragments
const STROKE = "#111";
const STROKE_W = "2";
const FILL = "#e0e7ff";
const LABEL_STYLE = `font-size="14" font-family="serif" fill="#111" text-anchor="middle"`;
const LABEL_STYLE_LEFT = `font-size="14" font-family="serif" fill="#111" text-anchor="end"`;
const LABEL_STYLE_RIGHT = `font-size="14" font-family="serif" fill="#111" text-anchor="start"`;

/** A labelled rectangle. Labels accept plain text (e.g. "a", "2^(n+1) cm"). */
export function rectangleFigure(labels: {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}): string {
  const W = 300;
  const H = 180;
  const padX = 50;
  const padY = 40;
  const x1 = padX;
  const y1 = padY;
  const x2 = W - padX;
  const y2 = H - padY;
  const parts: string[] = [];
  parts.push(
    `<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" fill="${FILL}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>`
  );
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  if (labels.top) {
    parts.push(
      `<text x="${cx}" y="${y1 - 10}" ${LABEL_STYLE}>${labels.top}</text>`
    );
  }
  if (labels.bottom) {
    parts.push(
      `<text x="${cx}" y="${y2 + 22}" ${LABEL_STYLE}>${labels.bottom}</text>`
    );
  }
  if (labels.left) {
    parts.push(
      `<text x="${x1 - 10}" y="${cy + 5}" ${LABEL_STYLE_LEFT}>${labels.left}</text>`
    );
  }
  if (labels.right) {
    parts.push(
      `<text x="${x2 + 10}" y="${cy + 5}" ${LABEL_STYLE_RIGHT}>${labels.right}</text>`
    );
  }
  return mdImage(wrapSVG(parts.join(""), W, H), "Rectangle diagram");
}

/** A right triangle with legs on the x and y axes. Labels for the two legs
 *  and the hypotenuse. */
export function rightTriangleFigure(labels: {
  leg1?: string; // bottom (horizontal) leg
  leg2?: string; // right (vertical) leg
  hyp?: string; // hypotenuse
  angleLabel?: string; // label for the non-right angle at the bottom-left
}): string {
  const W = 280;
  const H = 220;
  const pad = 40;
  const ax = pad; // top-left of right angle... we'll put right angle bottom-right
  const ay = H - pad; // bottom-left
  const bx = W - pad; // bottom-right (right-angle corner)
  const by = H - pad;
  const cx = W - pad; // top-right
  const cy = pad;
  const parts: string[] = [];
  // Filled triangle
  parts.push(
    `<polygon points="${ax},${ay} ${bx},${by} ${cx},${cy}" fill="${FILL}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>`
  );
  // Right angle square at (bx, by)
  const rSz = 12;
  parts.push(
    `<rect x="${bx - rSz}" y="${by - rSz}" width="${rSz}" height="${rSz}" fill="none" stroke="${STROKE}" stroke-width="1.5"/>`
  );
  if (labels.leg1) {
    parts.push(
      `<text x="${(ax + bx) / 2}" y="${by + 22}" ${LABEL_STYLE}>${labels.leg1}</text>`
    );
  }
  if (labels.leg2) {
    parts.push(
      `<text x="${bx + 14}" y="${(by + cy) / 2 + 5}" ${LABEL_STYLE_RIGHT}>${labels.leg2}</text>`
    );
  }
  if (labels.hyp) {
    // Midpoint of hypotenuse (from a to c), offset perpendicular
    const mx = (ax + cx) / 2;
    const my = (ay + cy) / 2;
    parts.push(
      `<text x="${mx - 12}" y="${my - 6}" ${LABEL_STYLE_LEFT}>${labels.hyp}</text>`
    );
  }
  if (labels.angleLabel) {
    // Small arc near vertex a
    const r = 22;
    parts.push(
      `<path d="M ${ax + r} ${ay} A ${r} ${r} 0 0 0 ${ax + r * 0.7} ${ay - r * 0.7}" fill="none" stroke="${STROKE}" stroke-width="1.2"/>`
    );
    parts.push(
      `<text x="${ax + r + 6}" y="${ay - r * 0.35}" ${LABEL_STYLE_RIGHT}>${labels.angleLabel}</text>`
    );
  }
  return mdImage(wrapSVG(parts.join(""), W, H), "Right triangle diagram");
}

/** An isometric (3D-looking) box with labeled length, width, height. */
export function boxFigure(labels: {
  l?: string; // length (front horizontal)
  w?: string; // width (depth, diagonal)
  h?: string; // height (vertical)
}): string {
  const W = 300;
  const H = 220;
  // Front face
  const fx1 = 60, fy1 = 80;
  const fx2 = 200, fy2 = 180;
  // Depth offset (isometric)
  const dx = 50, dy = -40;
  const parts: string[] = [];
  // Back face (hidden edges — dashed)
  parts.push(
    `<polyline points="${fx1 + dx},${fy1 + dy} ${fx2 + dx},${fy1 + dy} ${fx2 + dx},${fy2 + dy} ${fx1 + dx},${fy2 + dy} ${fx1 + dx},${fy1 + dy}" fill="${FILL}" stroke="${STROKE}" stroke-width="1.5"/>`
  );
  // Connecting edges
  parts.push(
    `<line x1="${fx1}" y1="${fy1}" x2="${fx1 + dx}" y2="${fy1 + dy}" stroke="${STROKE}" stroke-width="1.5"/>`
  );
  parts.push(
    `<line x1="${fx2}" y1="${fy1}" x2="${fx2 + dx}" y2="${fy1 + dy}" stroke="${STROKE}" stroke-width="1.5"/>`
  );
  parts.push(
    `<line x1="${fx2}" y1="${fy2}" x2="${fx2 + dx}" y2="${fy2 + dy}" stroke="${STROKE}" stroke-width="1.5"/>`
  );
  parts.push(
    `<line x1="${fx1}" y1="${fy2}" x2="${fx1 + dx}" y2="${fy2 + dy}" stroke="${STROKE}" stroke-width="1"  stroke-dasharray="4 3"/>`
  );
  // Front face on top
  parts.push(
    `<rect x="${fx1}" y="${fy1}" width="${fx2 - fx1}" height="${fy2 - fy1}" fill="${FILL}" fill-opacity="0.85" stroke="${STROKE}" stroke-width="${STROKE_W}"/>`
  );
  if (labels.l) {
    parts.push(
      `<text x="${(fx1 + fx2) / 2}" y="${fy2 + 22}" ${LABEL_STYLE}>${labels.l}</text>`
    );
  }
  if (labels.h) {
    parts.push(
      `<text x="${fx1 - 10}" y="${(fy1 + fy2) / 2 + 5}" ${LABEL_STYLE_LEFT}>${labels.h}</text>`
    );
  }
  if (labels.w) {
    // Label on the top depth edge
    const mx = (fx2 + fx2 + dx) / 2;
    const my = (fy1 + fy1 + dy) / 2;
    parts.push(
      `<text x="${mx + 14}" y="${my + 5}" ${LABEL_STYLE_RIGHT}>${labels.w}</text>`
    );
  }
  return mdImage(wrapSVG(parts.join(""), W, H), "Box diagram");
}

/** A square with a single label for the side length. Draws an actual
 *  square (equal width and height), not a rectangle. */
export function squareFigure(sideLabel?: string): string {
  const W = 220;
  const H = 220;
  const side = 140; // actual square side in px
  const x1 = (W - side) / 2;
  const y1 = (H - side) / 2;
  const x2 = x1 + side;
  const y2 = y1 + side;
  const parts: string[] = [];
  parts.push(
    `<rect x="${x1}" y="${y1}" width="${side}" height="${side}" fill="${FILL}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>`
  );
  if (sideLabel) {
    // Label below the bottom edge
    parts.push(
      `<text x="${(x1 + x2) / 2}" y="${y2 + 22}" ${LABEL_STYLE}>${sideLabel}</text>`
    );
    // Label to the right of the right edge
    parts.push(
      `<text x="${x2 + 10}" y="${(y1 + y2) / 2 + 5}" ${LABEL_STYLE_RIGHT}>${sideLabel}</text>`
    );
  }
  return mdImage(wrapSVG(parts.join(""), W, H), "Square diagram");
}

/** A circle with an optional radius line and label. */
export function circleFigure(radiusLabel?: string): string {
  const W = 220;
  const H = 220;
  const cx = W / 2;
  const cy = H / 2;
  const r = 70;
  const parts: string[] = [];
  parts.push(
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${FILL}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>`
  );
  // Centre point
  parts.push(
    `<circle cx="${cx}" cy="${cy}" r="2.5" fill="${STROKE}"/>`
  );
  if (radiusLabel) {
    // Radius to the right
    parts.push(
      `<line x1="${cx}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="${STROKE}" stroke-width="1.5"/>`
    );
    parts.push(
      `<text x="${cx + r / 2}" y="${cy - 6}" ${LABEL_STYLE}>${radiusLabel}</text>`
    );
  }
  return mdImage(wrapSVG(parts.join(""), W, H), "Circle diagram");
}

/** A cube (equal sides) in isometric projection with an optional side label. */
export function cubeFigure(sideLabel?: string): string {
  const W = 260;
  const H = 240;
  // Front face — an actual square
  const side = 110;
  const fx1 = 50;
  const fy1 = 80;
  const fx2 = fx1 + side;
  const fy2 = fy1 + side;
  // Isometric depth offset (same magnitude → still a cube)
  const dx = 55, dy = -45;
  const parts: string[] = [];
  // Back face
  parts.push(
    `<polyline points="${fx1 + dx},${fy1 + dy} ${fx2 + dx},${fy1 + dy} ${fx2 + dx},${fy2 + dy} ${fx1 + dx},${fy2 + dy} ${fx1 + dx},${fy1 + dy}" fill="${FILL}" stroke="${STROKE}" stroke-width="1.5"/>`
  );
  // Connecting edges
  parts.push(
    `<line x1="${fx1}" y1="${fy1}" x2="${fx1 + dx}" y2="${fy1 + dy}" stroke="${STROKE}" stroke-width="1.5"/>`
  );
  parts.push(
    `<line x1="${fx2}" y1="${fy1}" x2="${fx2 + dx}" y2="${fy1 + dy}" stroke="${STROKE}" stroke-width="1.5"/>`
  );
  parts.push(
    `<line x1="${fx2}" y1="${fy2}" x2="${fx2 + dx}" y2="${fy2 + dy}" stroke="${STROKE}" stroke-width="1.5"/>`
  );
  parts.push(
    `<line x1="${fx1}" y1="${fy2}" x2="${fx1 + dx}" y2="${fy2 + dy}" stroke="${STROKE}" stroke-width="1" stroke-dasharray="4 3"/>`
  );
  // Front face on top
  parts.push(
    `<rect x="${fx1}" y="${fy1}" width="${side}" height="${side}" fill="${FILL}" fill-opacity="0.85" stroke="${STROKE}" stroke-width="${STROKE_W}"/>`
  );
  if (sideLabel) {
    parts.push(
      `<text x="${(fx1 + fx2) / 2}" y="${fy2 + 22}" ${LABEL_STYLE}>${sideLabel}</text>`
    );
    parts.push(
      `<text x="${fx1 - 10}" y="${(fy1 + fy2) / 2 + 5}" ${LABEL_STYLE_LEFT}>${sideLabel}</text>`
    );
  }
  return mdImage(wrapSVG(parts.join(""), W, H), "Cube diagram");
}

/** A cone (triangular cross-section with curved elliptical base). */
export function coneFigure(labels: {
  r?: string;
  h?: string;
  slant?: string;
}): string {
  const W = 240;
  const H = 240;
  const apexX = 120, apexY = 40;
  const baseY = 190;
  const r = 70; // half-width of the base ellipse
  const parts: string[] = [];
  // Back half of base ellipse (dashed — hidden edge)
  parts.push(
    `<path d="M ${apexX - r} ${baseY} A ${r} 16 0 0 1 ${apexX + r} ${baseY}" fill="none" stroke="${STROKE}" stroke-width="1" stroke-dasharray="4 3"/>`
  );
  // Sides of cone
  parts.push(
    `<polygon points="${apexX - r},${baseY} ${apexX},${apexY} ${apexX + r},${baseY}" fill="${FILL}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>`
  );
  // Front half of base ellipse
  parts.push(
    `<path d="M ${apexX - r} ${baseY} A ${r} 16 0 0 0 ${apexX + r} ${baseY}" fill="none" stroke="${STROKE}" stroke-width="${STROKE_W}"/>`
  );
  // Height line from apex to centre of base (dashed)
  parts.push(
    `<line x1="${apexX}" y1="${apexY}" x2="${apexX}" y2="${baseY}" stroke="${STROKE}" stroke-width="1" stroke-dasharray="3 3"/>`
  );
  // Radius line
  parts.push(
    `<line x1="${apexX}" y1="${baseY}" x2="${apexX + r}" y2="${baseY}" stroke="${STROKE}" stroke-width="1.2"/>`
  );
  if (labels.h) {
    parts.push(
      `<text x="${apexX - 10}" y="${(apexY + baseY) / 2 + 5}" ${LABEL_STYLE_LEFT}>${labels.h}</text>`
    );
  }
  if (labels.r) {
    parts.push(
      `<text x="${apexX + r / 2}" y="${baseY - 6}" ${LABEL_STYLE}>${labels.r}</text>`
    );
  }
  if (labels.slant) {
    parts.push(
      `<text x="${apexX + r / 2 + 16}" y="${(apexY + baseY) / 2 + 5}" ${LABEL_STYLE_RIGHT}>${labels.slant}</text>`
    );
  }
  return mdImage(wrapSVG(parts.join(""), W, H), "Cone diagram");
}

/** A unit square with an inscribed circle (used for geometric probability). */
export function squareWithInscribedCircleFigure(): string {
  const W = 220;
  const H = 220;
  const side = 140;
  const x1 = (W - side) / 2;
  const y1 = (H - side) / 2;
  const cx = x1 + side / 2;
  const cy = y1 + side / 2;
  const r = side / 2;
  const parts: string[] = [];
  parts.push(
    `<rect x="${x1}" y="${y1}" width="${side}" height="${side}" fill="${FILL}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>`
  );
  parts.push(
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#c7d2fe" stroke="${STROKE}" stroke-width="${STROKE_W}"/>`
  );
  return mdImage(wrapSVG(parts.join(""), W, H), "Square with inscribed circle");
}

/** A square containing a right triangle in its bottom-left corner (used for
 *  geometric probability — point in square / point in triangle). */
export function squareWithTriangleFigure(): string {
  const W = 220;
  const H = 220;
  const side = 140;
  const x1 = (W - side) / 2;
  const y1 = (H - side) / 2;
  const x2 = x1 + side;
  const y2 = y1 + side;
  const parts: string[] = [];
  parts.push(
    `<rect x="${x1}" y="${y1}" width="${side}" height="${side}" fill="${FILL}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>`
  );
  parts.push(
    `<polygon points="${x1},${y2} ${x2},${y2} ${x1},${y1}" fill="#c7d2fe" stroke="${STROKE}" stroke-width="${STROKE_W}"/>`
  );
  return mdImage(wrapSVG(parts.join(""), W, H), "Square with inscribed triangle");
}

/** A semicircle with an inscribed rectangle (base on diameter). */
export function semicircleWithRectangleFigure(): string {
  const W = 280;
  const H = 180;
  const cx = W / 2;
  const cy = 140;
  const r = 100;
  // Diameter line
  const parts: string[] = [];
  // Semicircle (upper half)
  parts.push(
    `<path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z" fill="${FILL}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>`
  );
  // Inscribed rectangle: choose aspect ratio so corners sit on the arc.
  // Take half-width w = r*cos(30°), height h = r*sin(30°) roughly.
  const rw = r * Math.cos(Math.PI / 5);
  const rh = r * Math.sin(Math.PI / 5);
  parts.push(
    `<rect x="${cx - rw}" y="${cy - rh}" width="${2 * rw}" height="${rh}" fill="#c7d2fe" stroke="${STROKE}" stroke-width="${STROKE_W}"/>`
  );
  return mdImage(wrapSVG(parts.join(""), W, H), "Semicircle with inscribed rectangle");
}

/** A labelled general triangle with vertex labels (A, B, C) and side labels. */
export function triangleFigure(opts: {
  vertices?: [string, string, string];
  sides?: { ab?: string; bc?: string; ca?: string };
}): string {
  const W = 280;
  const H = 220;
  // Equilateral-ish placement
  const ax = 50, ay = 180;
  const bx = 230, by = 180;
  const cx = 140, cy = 50;
  const parts: string[] = [];
  parts.push(
    `<polygon points="${ax},${ay} ${bx},${by} ${cx},${cy}" fill="${FILL}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>`
  );
  const [vA, vB, vC] = opts.vertices ?? ["A", "B", "C"];
  parts.push(`<text x="${ax - 10}" y="${ay + 16}" ${LABEL_STYLE_LEFT}>${vA}</text>`);
  parts.push(`<text x="${bx + 10}" y="${by + 16}" ${LABEL_STYLE_RIGHT}>${vB}</text>`);
  parts.push(`<text x="${cx}" y="${cy - 8}" ${LABEL_STYLE}>${vC}</text>`);
  if (opts.sides?.ab) {
    parts.push(
      `<text x="${(ax + bx) / 2}" y="${(ay + by) / 2 + 22}" ${LABEL_STYLE}>${opts.sides.ab}</text>`
    );
  }
  if (opts.sides?.bc) {
    parts.push(
      `<text x="${(bx + cx) / 2 + 14}" y="${(by + cy) / 2 + 5}" ${LABEL_STYLE_RIGHT}>${opts.sides.bc}</text>`
    );
  }
  if (opts.sides?.ca) {
    parts.push(
      `<text x="${(cx + ax) / 2 - 14}" y="${(cy + ay) / 2 + 5}" ${LABEL_STYLE_LEFT}>${opts.sides.ca}</text>`
    );
  }
  return mdImage(wrapSVG(parts.join(""), W, H), "Triangle diagram");
}

// ─── Types ───────────────────────────────────────────────────────────────────
export interface MCQ {
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

export interface FR {
  content: string;
  marks: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  solutionContent: string;
  subtopicSlugs: string[];
}

export interface GeneratedSet {
  mcq: MCQ[];
  shortAnswer: FR[];
  extendedResponse: FR[];
}

const ALLOWED_ER_MARKS = new Set([9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21]);

export function writeQset(outPath: string, data: GeneratedSet): void {
  if (data.mcq.length !== 20)
    throw new Error(`${outPath}: expected 20 MCQs, got ${data.mcq.length}`);
  if (data.shortAnswer.length !== 10)
    throw new Error(`${outPath}: expected 10 SA, got ${data.shortAnswer.length}`);
  if (data.extendedResponse.length !== 5)
    throw new Error(`${outPath}: expected 5 ER, got ${data.extendedResponse.length}`);
  for (const er of data.extendedResponse) {
    if (!ALLOWED_ER_MARKS.has(er.marks)) {
      throw new Error(`${outPath}: ER mark ${er.marks} not in allowed set`);
    }
  }
  for (const q of data.mcq) q.solutionContent = dechainSolution(q.solutionContent);
  for (const q of data.shortAnswer) q.solutionContent = dechainSolution(q.solutionContent);
  for (const q of data.extendedResponse) q.solutionContent = dechainSolution(q.solutionContent);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf-8");
  const erSizes = data.extendedResponse.map((e) => e.marks).join(", ");
  console.log(`✅ ${outPath}  (ER sizes: [${erSizes}])`);
}
