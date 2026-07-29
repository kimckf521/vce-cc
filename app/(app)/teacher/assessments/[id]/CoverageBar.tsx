"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { AssessmentItemView } from "@/lib/teacher-assessments";

// Brand-scale segment colours, ordered so adjacent segments always contrast.
const SEGMENT_COLORS = [
  "bg-brand-700",
  "bg-brand-400",
  "bg-brand-900",
  "bg-brand-500",
  "bg-brand-300",
  "bg-brand-800",
  "bg-brand-600",
  "bg-brand-200",
];

/**
 * Horizontal stacked bar of marks share per topic, with a legend. Pure
 * client-side aggregation over the current items — re-renders on every
 * mutation since the parent replaces its item list wholesale.
 */
export default function CoverageBar({ items }: { items: AssessmentItemView[] }) {
  const segments = useMemo(() => {
    const byTopic = new Map<string, { topicId: string; name: string; marks: number }>();
    for (const item of items) {
      const existing = byTopic.get(item.topicId);
      if (existing) existing.marks += item.marks;
      else byTopic.set(item.topicId, { topicId: item.topicId, name: item.topicName, marks: item.marks });
    }
    // Largest share first so the bar reads left-to-right by weight.
    return Array.from(byTopic.values()).sort((a, b) => b.marks - a.marks);
  }, [items]);

  const total = segments.reduce((sum, seg) => sum + seg.marks, 0);
  if (total === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Topic coverage</h2>
      <div
        className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
        role="img"
        aria-label={`Marks by topic: ${segments
          .map((seg) => `${seg.name} ${Math.round((seg.marks / total) * 100)}%`)
          .join(", ")}`}
      >
        {segments.map((seg, i) => (
          <div
            key={seg.topicId}
            className={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
            style={{ width: `${(seg.marks / total) * 100}%` }}
            title={`${seg.name} — ${seg.marks} mark${seg.marks === 1 ? "" : "s"}`}
          />
        ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((seg, i) => (
          <li
            key={seg.topicId}
            className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"
          >
            <span
              className={cn("h-2.5 w-2.5 shrink-0 rounded-full", SEGMENT_COLORS[i % SEGMENT_COLORS.length])}
              aria-hidden="true"
            />
            {seg.name} · {seg.marks} mark{seg.marks === 1 ? "" : "s"}
          </li>
        ))}
      </ul>
    </div>
  );
}
