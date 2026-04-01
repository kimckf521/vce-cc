"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type { QuestionGroupData, TopicQuestionFilters } from "@/lib/question-groups";
import { loadMoreGroups } from "@/app/(app)/topics/[slug]/actions";

const QuestionGroup = dynamic(() => import("@/components/QuestionGroup"), { ssr: false });

// Sentinel is placed after the 4th question in each loaded batch,
// so the next batch prefetches while the user still has content to scroll.
const SENTINEL_POSITION = 4;

interface InfiniteQuestionListProps {
  initialGroups: QuestionGroupData[];
  initialHasMore: boolean;
  topicSlug: string;
  filters: TopicQuestionFilters;
  isAdmin?: boolean;
}

export default function InfiniteQuestionList({
  initialGroups,
  initialHasMore,
  topicSlug,
  filters,
  isAdmin,
}: InfiniteQuestionListProps) {
  const [groups, setGroups] = useState(initialGroups);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Track where the next sentinel should appear (absolute index in the list)
  const sentinelIndexRef = useRef(Math.min(SENTINEL_POSITION, initialGroups.length) - 1);

  // Reset when filters or initial data change
  useEffect(() => {
    setGroups(initialGroups);
    setHasMore(initialHasMore);
    sentinelIndexRef.current = Math.min(SENTINEL_POSITION, initialGroups.length) - 1;
  }, [initialGroups, initialHasMore]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const result = await loadMoreGroups(topicSlug, filters, groups.length);
      setGroups((prev) => {
        const next = [...prev, ...result.groups];
        // Move sentinel to 4 questions into the newly loaded batch
        sentinelIndexRef.current = prev.length + Math.min(SENTINEL_POSITION, result.groups.length) - 1;
        return next;
      });
      setHasMore(result.hasMore);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, groups.length, topicSlug, filters]);

  // Intersection Observer on sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Use smaller prefetch margin on mobile to save bandwidth
    const isMobile = window.innerWidth < 768;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: isMobile ? "100px" : "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
        No questions found for this filter.
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      {groups.map((group, i) => (
        <div key={group.key}>
          <QuestionGroup
            year={group.year}
            examType={group.examType}
            sectionLabel={group.sectionLabel}
            questionIndex={i + 1}
            frequency={group.frequency}
            topic={group.topicName}
            subtopics={group.subtopics}
            calculatorAllowed={group.calculatorAllowed}
            parts={group.parts}
            isAdmin={isAdmin}
          />
          {/* Invisible sentinel after the 4th question of the latest batch */}
          {hasMore && i === sentinelIndexRef.current && (
            <div ref={sentinelRef} aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  );
}
