"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

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
const PAD_R = 24;
const PAD_T = 20;
const PAD_B = 44;
const INNER_W = 600;
const INNER_H = 220;
const VB_W = PAD_L + INNER_W + PAD_R;
const VB_H = PAD_T + INNER_H + PAD_B;

const Y_TICKS = [0, 20, 40, 60, 80, 100];
const GOAL = 80;

const MODE_FILTERS = [
  { key: "all", label: "All" },
  { key: "Exam 1", label: "Exam 1" },
  { key: "Exam 2A", label: "Exam 2A" },
  { key: "Exam 2B", label: "Exam 2B" },
  { key: "Exam 2A & 2B", label: "Exam 2A & 2B" },
] as const;

/* ── helpers ── */

function toSvgX(index: number, total: number): number {
  if (total <= 1) return PAD_L + INNER_W / 2;
  return PAD_L + (index / (total - 1)) * INNER_W;
}

function toSvgY(score: number): number {
  return PAD_T + ((100 - score) / 100) * INNER_H;
}

function dotColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 50) return "#eab308";
  return "#ef4444";
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
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const html = document.documentElement;
    setIsDark(html.classList.contains("dark"));
    const obs = new MutationObserver(() => {
      setIsDark(html.classList.contains("dark"));
    });
    obs.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Filter data by selected mode
  const filtered = useMemo(
    () => (filter === "all" ? data : data.filter((d) => d.mode === filter)),
    [data, filter]
  );

  // Available modes in the data (for showing only relevant filter chips)
  const availableModes = useMemo(() => {
    const set = new Set(data.map((d) => d.mode));
    return set;
  }, [data]);

  // Summary stats
  const stats = useMemo(() => {
    if (filtered.length === 0) return null;
    const scores = filtered.map((d) => d.score);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const best = Math.round(Math.max(...scores));
    const worst = Math.round(Math.min(...scores));
    const trend =
      filtered.length >= 2
        ? Math.round(filtered[filtered.length - 1].score - filtered[0].score)
        : 0;
    return { avg, best, worst, trend };
  }, [filtered]);

  if (data.length === 0) return null;

  const n = filtered.length;

  /* ── x-axis label stepping (dedupe consecutive same-date labels) ── */
  const spacingPerPoint = n > 1 ? INNER_W / (n - 1) : INNER_W;
  const minLabelWidth = 52;
  const step = Math.max(1, Math.ceil(minLabelWidth / spacingPerPoint));

  const xLabelIndices = new Set<number>();
  if (n > 0) {
    xLabelIndices.add(0);
    if (n > 1) xLabelIndices.add(n - 1);
    for (let i = step; i < n - step; i += step) xLabelIndices.add(i);
  }

  // Dedupe: if the label at i is the same formatted date as at the
  // previous labeled index, skip it
  const renderedLabels = new Map<number, string>();
  const sortedIndices = Array.from(xLabelIndices).sort((a, b) => a - b);
  let lastLabel = "";
  for (const i of sortedIndices) {
    const label = formatShortDate(filtered[i].completedAt);
    if (label !== lastLabel) {
      renderedLabels.set(i, label);
      lastLabel = label;
    }
  }

  /* ── build polyline points ── */
  const points = filtered
    .map((_, i) => `${toSvgX(i, n)},${toSvgY(filtered[i].score)}`)
    .join(" ");

  /* ── build area fill path ── */
  const baseline = toSvgY(0);
  const areaPath = n > 1
    ? [
        `M ${toSvgX(0, n)},${baseline}`,
        ...filtered.map((_, i) => `L ${toSvgX(i, n)},${toSvgY(filtered[i].score)}`),
        `L ${toSvgX(n - 1, n)},${baseline}`,
        "Z",
      ].join(" ")
    : "";

  /* ── colours ── */
  const gradTop = isDark ? "rgba(96,165,250,0.25)" : "rgba(96,165,250,0.18)";
  const gradBot = "rgba(96,165,250,0)";
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const textColor = isDark ? "#9ca3af" : "#6b7280";
  const lineColor = isDark ? "#60a5fa" : "#3b82f6";
  const goalColor = isDark ? "rgba(34,197,94,0.35)" : "rgba(34,197,94,0.45)";
  const goalTextColor = isDark ? "#4ade80" : "#16a34a";
  const crosshairColor = isDark ? "rgba(156,163,175,0.4)" : "rgba(107,114,128,0.35)";

  /* ── tooltip positioning ── */
  const tooltipData = hovered !== null && filtered[hovered] ? filtered[hovered] : null;
  let tooltipLeftPct = 0;
  let tooltipTopPct = 0;
  let tooltipTransform = "translate(-50%, calc(-100% - 12px))";
  if (hovered !== null && filtered[hovered]) {
    tooltipLeftPct = (toSvgX(hovered, n) / VB_W) * 100;
    tooltipTopPct = (toSvgY(filtered[hovered].score) / VB_H) * 100;
    // Keep tooltip inside the container horizontally
    if (tooltipLeftPct < 18) {
      tooltipTransform = "translate(0%, calc(-100% - 12px))";
    } else if (tooltipLeftPct > 82) {
      tooltipTransform = "translate(-100%, calc(-100% - 12px))";
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      {availableModes.size > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {MODE_FILTERS.filter(
            (f) => f.key === "all" || availableModes.has(f.key)
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filter === f.key
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Summary stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-2">
          <StatBlock label="Avg" value={`${stats.avg}%`} />
          <StatBlock label="Best" value={`${stats.best}%`} tone="good" />
          <StatBlock label="Worst" value={`${stats.worst}%`} tone="bad" />
          <StatBlock
            label="Trend"
            value={`${stats.trend >= 0 ? "+" : ""}${stats.trend}%`}
            tone={stats.trend >= 0 ? "good" : "bad"}
          />
        </div>
      )}

      {/* Chart */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
          No data for this filter yet.
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="h-auto select-none w-full"
            style={{ maxWidth: "100%" }}
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
              80%
            </text>

            {/* Area fill */}
            {n > 1 && <path d={areaPath} fill="url(#scoreFill)" />}

            {/* Crosshair when hovered */}
            {hovered !== null && filtered[hovered] && (
              <line
                x1={toSvgX(hovered, n)}
                y1={PAD_T}
                x2={toSvgX(hovered, n)}
                y2={PAD_T + INNER_H}
                stroke={crosshairColor}
                strokeWidth={1}
                strokeDasharray="3 3"
              />
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
            {filtered.map((pt, i) => (
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
            {filtered.map((pt, i) => (
              <circle
                key={`hit-${pt.id}`}
                cx={toSvgX(i, n)}
                cy={toSvgY(pt.score)}
                r={20}
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
            {filtered.map((pt, i) => {
              const label = renderedLabels.get(i);
              if (!label) return null;
              return (
                <text
                  key={`xl-${pt.id}`}
                  x={toSvgX(i, n)}
                  y={PAD_T + INNER_H + 24}
                  textAnchor="middle"
                  fontSize={11}
                  fill={textColor}
                >
                  {label}
                </text>
              );
            })}
          </svg>

          {/* Tooltip */}
          {tooltipData && hovered !== null && (
            <div
              className="pointer-events-none absolute z-10 rounded-lg bg-gray-900 dark:bg-gray-700 px-3 py-2 shadow-xl whitespace-nowrap"
              style={{
                left: `${tooltipLeftPct}%`,
                top: `${tooltipTopPct}%`,
                transform: tooltipTransform,
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: dotColor(tooltipData.score) }}
                />
                <p className="text-sm font-bold text-white">
                  {Math.round(tooltipData.score)}%
                </p>
              </div>
              <p className="mt-0.5 text-xs text-gray-300">{tooltipData.mode}</p>
              <p className="text-xs text-gray-400">
                {formatFullDate(tooltipData.completedAt)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "good" | "bad";
}) {
  const valueColor =
    tone === "good"
      ? "text-green-600 dark:text-green-400"
      : tone === "bad"
        ? "text-red-600 dark:text-red-400"
        : "text-gray-900 dark:text-gray-100";
  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
      <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className={cn("text-base lg:text-lg font-bold tabular-nums", valueColor)}>
        {value}
      </p>
    </div>
  );
}
