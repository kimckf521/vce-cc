"use client";

interface CustomTick {
  value: number;
  label: string;     // plain text shown below/left of tick
  subLabel?: string; // optional second line (e.g. "e" under "1/")
}

interface Asymptote {
  type: "vertical" | "horizontal";
  value: number;
  label?: string;
  labelPos?: "top" | "bottom" | "left" | "right"; // where to place label
}

interface Intercept {
  x: number;
  y: number;
  label?: string;
  labelAnchor?: "above-left" | "above-right" | "below-left" | "below-right" | "right" | "left";
  offsetX?: number;
  offsetY?: number;
  useArrow?: boolean;
  // Absolute label position in graph coordinates (overrides anchor/offset)
  labelX?: number;
  labelY?: number;
}

interface FunctionGraphProps {
  fn: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xStart?: number;
  xTicks?: CustomTick[];
  yTicks?: CustomTick[];
  showGrid?: boolean;
  asymptotes?: Asymptote[];
  intercepts?: Intercept[];
  label?: string;
}

export default function FunctionGraph({
  fn,
  xMin,
  xMax,
  yMin,
  yMax,
  xStart,
  xTicks: customXTicks,
  yTicks: customYTicks,
  showGrid = false,
  asymptotes = [],
  intercepts = [],
  label,
}: FunctionGraphProps) {
  const padLeft = 48;
  const padRight = 32;
  const padTop = 24;
  const padBottom = 48;
  const innerW = 360;
  const innerH = 240;
  const svgW = innerW + padLeft + padRight;
  const svgH = innerH + padTop + padBottom;

  const toSvgX = (x: number) => padLeft + ((x - xMin) / (xMax - xMin)) * innerW;
  const toSvgY = (y: number) => padTop + ((yMax - y) / (yMax - yMin)) * innerH;

  // Sample the function
  const steps = 600;
  const start = xStart ?? xMin;
  // eslint-disable-next-line no-new-func
  const f = new Function("x", `return ${fn};`);
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = start + (i / steps) * (xMax - start);
    try {
      const y = f(x);
      if (isFinite(y)) points.push({ x, y });
    } catch {}
  }

  // Build SVG path — use penDown flag to correctly handle both branches
  let pathD = "";
  let penDown = false;
  for (let i = 0; i < points.length; i++) {
    const { x, y } = points[i];
    const sy = toSvgY(y);
    // Lift pen when out of visible area (handles asymptotes / discontinuities)
    if (sy < padTop - 10 || sy > padTop + innerH + 10) {
      penDown = false;
      continue;
    }
    if (!penDown) {
      pathD += ` M ${toSvgX(x)},${sy}`;
      penDown = true;
    } else {
      pathD += ` L ${toSvgX(x)},${sy}`;
    }
  }

  // Auto-generate integer ticks if custom not provided
  const xTicks: CustomTick[] = customXTicks ?? Array.from(
    { length: Math.floor(xMax - xMin) + 1 },
    (_, i) => ({ value: Math.floor(xMin) + i, label: String(Math.floor(xMin) + i) })
  );
  const yTicks: CustomTick[] = customYTicks ?? Array.from(
    { length: Math.floor(yMax - yMin) + 1 },
    (_, i) => ({ value: Math.floor(yMin) + i, label: String(Math.floor(yMin) + i) })
  );

  const ox = toSvgX(Math.max(xMin, 0));
  const oy = toSvgY(Math.max(yMin, 0));

  return (
    <div className="my-4 flex flex-col items-center gap-1">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="h-auto select-none"
        style={{ width: "min(100%, 460px)" }}
      >
        <defs>
          <clipPath id="plot-area">
            <rect x={padLeft} y={padTop} width={innerW} height={innerH} />
          </clipPath>
        </defs>

        {/* Optional grid */}
        {showGrid && xTicks.map((t) => (
          <line key={`vg${t.value}`} x1={toSvgX(t.value)} y1={padTop} x2={toSvgX(t.value)} y2={padTop + innerH}
            stroke="#e5e7eb" strokeWidth={0.8} />
        ))}
        {showGrid && yTicks.map((t) => (
          <line key={`hg${t.value}`} x1={padLeft} y1={toSvgY(t.value)} x2={padLeft + innerW} y2={toSvgY(t.value)}
            stroke="#e5e7eb" strokeWidth={0.8} />
        ))}

        {/* Axes */}
        <line x1={padLeft} y1={oy} x2={padLeft + innerW + 14} y2={oy} stroke="#374151" strokeWidth={1.5} />
        <line x1={ox} y1={padTop + innerH + 8} x2={ox} y2={padTop - 4} stroke="#374151" strokeWidth={1.5} />

        {/* Arrows */}
        <polygon points={`${padLeft + innerW + 14},${oy} ${padLeft + innerW + 6},${oy - 4} ${padLeft + innerW + 6},${oy + 4}`} fill="#374151" />
        <polygon points={`${ox},${padTop - 4} ${ox - 4},${padTop + 6} ${ox + 4},${padTop + 6}`} fill="#374151" />

        {/* Axis labels */}
        <text x={padLeft + innerW + 22} y={oy + 4} fontSize="13" fill="#374151" fontStyle="italic">x</text>
        <text x={ox + 6} y={padTop - 8} fontSize="13" fill="#374151" fontStyle="italic">y</text>

        {/* X ticks */}
        {xTicks.map((t) => {
          const sx = toSvgX(t.value);
          const isOrigin = t.value === 0;
          return (
            <g key={`xt${t.value}`}>
              <line x1={sx} y1={oy - 3} x2={sx} y2={oy + 3} stroke="#374151" strokeWidth={1} />
              {!isOrigin && !t.subLabel && (
                <text x={sx} y={oy + 15} fontSize="12" fill="#374151" textAnchor="middle">{t.label}</text>
              )}
              {/* Proper fraction rendering (e.g. 1/e) */}
              {!isOrigin && t.subLabel && (
                <>
                  {/* numerator */}
                  <text x={sx} y={oy + 14} fontSize="11" fill="#374151" textAnchor="middle">{t.label}</text>
                  {/* fraction bar */}
                  <line x1={sx - 6} y1={oy + 17} x2={sx + 6} y2={oy + 17} stroke="#374151" strokeWidth={0.9} />
                  {/* denominator */}
                  <text x={sx} y={oy + 29} fontSize="11" fill="#374151" textAnchor="middle">{t.subLabel}</text>
                </>
              )}
            </g>
          );
        })}

        {/* Y ticks */}
        {yTicks.map((t) => {
          if (t.value === 0) return null;
          return (
            <g key={`yt${t.value}`}>
              <line x1={ox - 3} y1={toSvgY(t.value)} x2={ox + 3} y2={toSvgY(t.value)} stroke="#374151" strokeWidth={1} />
              <text x={ox - 8} y={toSvgY(t.value) + 4} fontSize="12" fill="#374151" textAnchor="end">{t.label}</text>
            </g>
          );
        })}

        {/* Origin label */}
        <text x={ox - 8} y={oy + 15} fontSize="12" fill="#374151" textAnchor="middle">0</text>

        {/* Asymptotes (dashed) */}
        {asymptotes.map((a, i) => (
          a.type === "vertical"
            ? <line key={`as${i}`} x1={toSvgX(a.value)} y1={padTop} x2={toSvgX(a.value)} y2={padTop + innerH}
                stroke="#555" strokeWidth={1.4} strokeDasharray="6,4" />
            : <line key={`as${i}`} x1={padLeft} y1={toSvgY(a.value)} x2={padLeft + innerW} y2={toSvgY(a.value)}
                stroke="#555" strokeWidth={1.4} strokeDasharray="6,4" />
        ))}
        {/* Asymptote labels */}
        {asymptotes.map((a, i) => {
          if (!a.label) return null;
          const pos = a.labelPos ?? (a.type === "vertical" ? "bottom" : "right");
          if (a.type === "vertical") {
            const lx = toSvgX(a.value) + 5;
            const ly = pos === "bottom" ? padTop + innerH - 6 : padTop + 14;
            return <text key={`asl${i}`} x={lx} y={ly} fontSize="11" fill="#333">{a.label}</text>;
          } else {
            const lx = pos === "right" ? padLeft + innerW - 4 : padLeft + 4;
            const ly = toSvgY(a.value) - 5;
            const anchor = pos === "right" ? "end" : "start";
            return <text key={`asl${i}`} x={lx} y={ly} fontSize="11" fill="#333" textAnchor={anchor}>{a.label}</text>;
          }
        })}

        {/* Function curve */}
        <path d={pathD} fill="none" stroke="#1a1a1a" strokeWidth={2} clipPath="url(#plot-area)" />

        {/* Intercept dots + labels */}
        {intercepts.map((pt, i) => {
          const cx = toSvgX(pt.x);
          const cy = toSvgY(pt.y);

          // Use absolute graph coords if provided, else fall back to anchor+offset
          let lx: number, ly: number, textAnchor: string;
          if (pt.labelX !== undefined && pt.labelY !== undefined) {
            lx = toSvgX(pt.labelX);
            ly = toSvgY(pt.labelY);
            textAnchor = "start"; // always start — label position is the left edge of the text
          } else {
            const anchor = pt.labelAnchor ?? "above-right";
            const baseDx = anchor.includes("left") || anchor === "left" ? -10 : 10;
            const baseDy = anchor === "right" || anchor === "left" ? 4
              : anchor.includes("above") ? -10 : 16;
            lx = cx + baseDx + (pt.offsetX ?? 0);
            ly = cy + baseDy + (pt.offsetY ?? 0);
            textAnchor = anchor.includes("left") || anchor === "left" ? "end" : "start";
          }

          if (pt.useArrow) {
            // Arrow goes FROM the dot TOWARD the label, arrowhead at the label end.
            // Text sits at the label position, extending AWAY from the arrowhead.
            const adx = lx - cx;  // direction vector: dot → label
            const ady = ly - cy;
            const dist = Math.sqrt(adx * adx + ady * ady);

            // Arrow starts just outside the dot (5 px gap)
            const startGap = 5;
            const x1 = cx + (adx / dist) * startGap;
            const y1 = cy + (ady / dist) * startGap;

            // Arrow ends slightly before the label so the head is visible
            const endGap = 6;
            const x2 = lx - (adx / dist) * endGap;
            const y2 = ly - (ady / dist) * endGap;

            // Text anchor: extend the text AWAY from the arrowhead.
            // If the arrow goes left (adx < 0), the arrowhead approaches from the right,
            // so anchor "end" (text extends left) keeps it clear.
            // If the arrow goes right (adx >= 0), use "start".
            const arrowAnchor = adx < 0 ? "end" : "start";

            // Text baseline: place below the label point so the text body sits
            // on the far side of the arrowhead tip.
            const textX = lx;
            const textY = ly + 10; // baseline below label point → text reads beneath tip

            return (
              <g key={`ic${i}`}>
                <defs>
                  <marker id={`arr${i}`} markerWidth="6" markerHeight="6"
                    refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#374151" />
                  </marker>
                </defs>
                <circle cx={cx} cy={cy} r={3} fill="#1a1a1a" />
                <line
                  x1={x1} y1={y1}
                  x2={x2} y2={y2}
                  stroke="#374151" strokeWidth={1}
                  markerEnd={`url(#arr${i})`}
                />
                {pt.label && (
                  <text
                    x={textX}
                    y={textY}
                    fontSize="11"
                    fill="#374151"
                    textAnchor={arrowAnchor}
                  >
                    {pt.label}
                  </text>
                )}
              </g>
            );
          }

          return (
            <g key={`ic${i}`}>
              <circle cx={cx} cy={cy} r={3} fill="#1a1a1a" />
              {pt.label && (
                <text x={lx} y={ly} fontSize="11" fill="#374151" textAnchor={textAnchor}>{pt.label}</text>
              )}
            </g>
          );
        })}
      </svg>
      {label && <p className="text-xs text-gray-500 italic">{label}</p>}
    </div>
  );
}
