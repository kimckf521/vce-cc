"use client";

interface CartesianGridProps {
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  xSubdivisions?: number; // small boxes per unit on x-axis
  ySubdivisions?: number; // small boxes per unit on y-axis
}

export default function CartesianGrid({
  xMin = -3,
  xMax = 3,
  yMin = -5,
  yMax = 5,
  xSubdivisions = 2,
  ySubdivisions = 1,
}: CartesianGridProps) {
  const cellSize = 24; // size of each small square in SVG units
  const padLeft = 44;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 20;

  const totalXCells = (xMax - xMin) * xSubdivisions;
  const totalYCells = (yMax - yMin) * ySubdivisions;

  const innerW = totalXCells * cellSize;
  const innerH = totalYCells * cellSize;

  const svgW = innerW + padLeft + padRight;
  const svgH = innerH + padTop + padBottom;

  // Origin in SVG coords
  const ox = padLeft + (-xMin) * xSubdivisions * cellSize;
  const oy = padTop + yMax * ySubdivisions * cellSize;

  // All vertical grid lines
  const vLines = Array.from({ length: totalXCells + 1 }, (_, i) => i);
  // All horizontal grid lines
  const hLines = Array.from({ length: totalYCells + 1 }, (_, i) => i);

  return (
    <div className="my-4 flex justify-center">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="h-auto select-none font-sans"
        style={{ width: "min(100%, 760px)" }}
      >
        {/* Vertical grid lines */}
        {vLines.map((i) => {
          const x = padLeft + i * cellSize;
          const isUnitLine = i % xSubdivisions === 0;
          return (
            <line
              key={`v${i}`}
              x1={x} y1={padTop}
              x2={x} y2={padTop + innerH}
              stroke={isUnitLine ? "#9ca3af" : "#d1d5db"}
              strokeWidth={isUnitLine ? 0.8 : 0.5}
            />
          );
        })}

        {/* Horizontal grid lines */}
        {hLines.map((i) => {
          const y = padTop + i * cellSize;
          const isUnitLine = i % ySubdivisions === 0;
          return (
            <line
              key={`h${i}`}
              x1={padLeft} y1={y}
              x2={padLeft + innerW} y2={y}
              stroke={isUnitLine ? "#9ca3af" : "#d1d5db"}
              strokeWidth={isUnitLine ? 0.8 : 0.5}
            />
          );
        })}

        {/* X axis */}
        <line x1={padLeft} y1={oy} x2={padLeft + innerW} y2={oy} stroke="#374151" strokeWidth={1.5} />
        {/* Y axis */}
        <line x1={ox} y1={padTop} x2={ox} y2={padTop + innerH} stroke="#374151" strokeWidth={1.5} />

        {/* X axis arrow */}
        <polygon
          points={`${padLeft + innerW + 8},${oy} ${padLeft + innerW},${oy - 4} ${padLeft + innerW},${oy + 4}`}
          fill="#374151"
        />
        {/* Y axis arrow */}
        <polygon
          points={`${ox},${padTop - 8} ${ox - 4},${padTop} ${ox + 4},${padTop}`}
          fill="#374151"
        />

        {/* Axis labels */}
        <text x={padLeft + innerW + 12} y={oy + 4} fontSize="13" fill="#374151" fontStyle="italic">x</text>
        <text x={ox + 5} y={padTop - 10} fontSize="13" fill="#374151" fontStyle="italic">y</text>

        {/* X tick labels — at each unit */}
        {Array.from({ length: xMax - xMin + 1 }, (_, i) => xMin + i).map((val) => {
          if (val === 0) return null;
          const x = padLeft + (val - xMin) * xSubdivisions * cellSize;
          return (
            <text key={`xl${val}`} x={x} y={oy + 14} fontSize="11" fill="#374151" textAnchor="middle">
              {val}
            </text>
          );
        })}

        {/* Y tick labels — at each unit */}
        {Array.from({ length: yMax - yMin + 1 }, (_, i) => yMin + i).map((val) => {
          if (val === 0) return null;
          const y = padTop + (yMax - val) * ySubdivisions * cellSize;
          return (
            <text key={`yl${val}`} x={ox - 6} y={y + 4} fontSize="11" fill="#374151" textAnchor="end">
              {val}
            </text>
          );
        })}

        {/* Origin */}
        <text x={ox - 7} y={oy + 14} fontSize="11" fill="#374151" textAnchor="middle">O</text>

        {/* Tick marks on axes */}
        {Array.from({ length: xMax - xMin + 1 }, (_, i) => xMin + i).map((val) => {
          const x = padLeft + (val - xMin) * xSubdivisions * cellSize;
          return <line key={`xt${val}`} x1={x} y1={oy - 3} x2={x} y2={oy + 3} stroke="#374151" strokeWidth={1} />;
        })}
        {Array.from({ length: yMax - yMin + 1 }, (_, i) => yMin + i).map((val) => {
          const y = padTop + (yMax - val) * ySubdivisions * cellSize;
          return <line key={`yt${val}`} x1={ox - 3} y1={y} x2={ox + 3} y2={y} stroke="#374151" strokeWidth={1} />;
        })}
      </svg>
    </div>
  );
}
