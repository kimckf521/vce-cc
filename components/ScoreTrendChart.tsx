"use client";

import { useState, useEffect, useRef } from "react";

interface ChartDataPoint {
  id: string;
  score: number;
  mode: string;
  completedAt: string;
}

interface ScoreTrendChartProps {
  data: ChartDataPoint[];
}

/* ── layout constants (SVG coordinate units) ── */
const PAD_L = 48;
const PAD_R = 16;
const PAD_T = 20;
const PAD_B = 44;
const INNER_W = 600;
const INNER_H = 220;
const VB_W = PAD_L + INNER_W + PAD_R;
const VB_H = PAD_T + INNER_H + PAD_B;

const Y_TICKS = [0, 20, 40, 60, 80, 100];
const GOAL = 80;

/* ── helpers ── */

function toSvgX(index: number, total: number): number {
  if (total <= 1) return PAD_L + INNER_W / 2;
  return PAD_L + (index / (total - 1)) * INNER_W;
}

function toSvgY(score: number): number {
  return PAD_T + ((100 - score) / 100) * INNER_H;
}

function dotColor(score: number): string {
  if (score >= 80) return "#22c55e"; // green-500
  if (score >= 50) return "#eab308"; // yellow-500
  return "#ef4444"; // red-500
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ScoreTrendChart({ data }: ScoreTrendChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* detect dark mode */
  useEffect(() => {
    const html = document.documentElement;
    setIsDark(html.classList.contains("dark"));
    const obs = new MutationObserver(() => {
      setIsDark(html.classList.contains("dark"));
    });
    obs.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  if (data.length === 0) return null;

  const n = data.length;

  /* ── x-axis label stepping ── */
  const spacingPerPoint = n > 1 ? INNER_W / (n - 1) : INNER_W;
  const minLabelWidth = 48;
  const step = Math.max(1, Math.ceil(minLabelWidth / spacingPerPoint));

  /* Build which indices get an x-label: always first + last, then every `step` */
  const xLabelIndices = new Set<number>();
  xLabelIndices.add(0);
  xLabelIndices.add(n - 1);
  for (let i = 0; i < n; i++) {
    if (i % step === 0) xLabelIndices.add(i);
  }

  /* ── build polyline points ── */
  const points = data
    .map((_, i) => `${toSvgX(i, n)},${toSvgY(data[i].score)}`)
    .join(" ");

  /* ── build area fill path ── */
  const baseline = toSvgY(0);
  const areaPath = [
    `M ${toSvgX(0, n)},${baseline}`,
    ...data.map((_, i) => `L ${toSvgX(i, n)},${toSvgY(data[i].score)}`),
    `L ${toSvgX(n - 1, n)},${baseline}`,
    "Z",
  ].join(" ");

  /* ── gradient colours ── */
  const gradTop = isDark ? "rgba(96,165,250,0.25)" : "rgba(96,165,250,0.18)";
  const gradBot = isDark ? "rgba(96,165,250,0)" : "rgba(96,165,250,0)";
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const textColor = isDark ? "#9ca3af" : "#6b7280";
  const lineColor = isDark ? "#60a5fa" : "#3b82f6";
  const goalColor = isDark
    ? "rgba(34,197,94,0.35)"
    : "rgba(34,197,94,0.45)";
  const goalTextColor = isDark ? "#4ade80" : "#16a34a";

  /* ── tooltip positioning ── */
  const tooltipData = hovered !== null ? data[hovered] : null;
  let tooltipLeft = 0;
  let tooltipTop = 0;
  let tooltipAlign: "left" | "right" | "center" = "center";
  if (hovered !== null) {
    tooltipLeft = (toSvgX(hovered, n) / VB_W) * 100;
    tooltipTop = (toSvgY(data[hovered].score) / VB_H) * 100;
    if (tooltipLeft < 25) tooltipAlign = "left";
    else if (tooltipLeft > 75) tooltipAlign = "right";
  }

  return (
    <div ref={containerRef} className="relative">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="h-auto select-none"
        style={{ width: "min(100%, 760px)" }}
      >
        <defs>
          <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradTop} />
            <stop offset="100%" stopColor={gradBot} />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines + labels */}
        {Y_TICKS.map((tick) => {
          const y = toSvgY(tick);
          return (
            <g key={tick}>
              <line
                x1={PAD_L}
                y1={y}
                x2={PAD_L + INNER_W}
                y2={y}
                stroke={gridColor}
                strokeWidth={0.5}
              />
              <text
                x={PAD_L - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={11}
                fill={textColor}
              >
                {tick}%
              </text>
            </g>
          );
        })}

        {/* Goal line at 80% */}
        <line
          x1={PAD_L}
          y1={toSvgY(GOAL)}
          x2={PAD_L + INNER_W}
          y2={toSvgY(GOAL)}
          stroke={goalColor}
          strokeWidth={1.5}
          strokeDasharray="6 4"
        />
        <text
          x={PAD_L + INNER_W + 2}
          y={toSvgY(GOAL) + 4}
          fontSize={10}
          fill={goalTextColor}
          fontWeight={600}
        >
          Goal
        </text>

        {/* Area fill */}
        {n > 1 && (
          <path d={areaPath} fill="url(#scoreFill)" />
        )}

        {/* Line */}
        {n > 1 && (
          <polyline
            points={points}
            fill="none"
            stroke={lineColor}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Data point dots */}
        {data.map((pt, i) => (
          <circle
            key={pt.id}
            cx={toSvgX(i, n)}
            cy={toSvgY(pt.score)}
            r={hovered === i ? 6 : 4}
            fill={dotColor(pt.score)}
            stroke={isDark ? "#111827" : "#ffffff"}
            strokeWidth={2}
            className="transition-[r] duration-150"
          />
        ))}

        {/* Invisible hover targets */}
        {data.map((pt, i) => (
          <circle
            key={`hit-${pt.id}`}
            cx={toSvgX(i, n)}
            cy={toSvgY(pt.score)}
            r={16}
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onTouchStart={(e) => {
              e.preventDefault();
              setHovered(i);
            }}
          />
        ))}

        {/* X-axis date labels */}
        {data.map((pt, i) => {
          if (!xLabelIndices.has(i)) return null;
          return (
            <text
              key={`xl-${pt.id}`}
              x={toSvgX(i, n)}
              y={PAD_T + INNER_H + 24}
              textAnchor="middle"
              fontSize={11}
              fill={textColor}
            >
              {formatShortDate(pt.completedAt)}
            </text>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltipData && hovered !== null && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg bg-gray-900 dark:bg-gray-700 px-3 py-2 shadow-lg transition-opacity duration-100"
          style={{
            left: `${tooltipLeft}%`,
            top: `${tooltipTop}%`,
            transform:
              tooltipAlign === "left"
                ? "translate(8px, -110%)"
                : tooltipAlign === "right"
                  ? "translate(-100%, -110%) translateX(-8px)"
                  : "translate(-50%, -110%)",
          }}
        >
          <p className="text-sm font-bold text-white">
            {Math.round(tooltipData.score)}%
          </p>
          <p className="text-xs text-gray-300">{tooltipData.mode}</p>
          <p className="text-xs text-gray-400">
            {formatFullDate(tooltipData.completedAt)}
          </p>
        </div>
      )}
    </div>
  );
}
