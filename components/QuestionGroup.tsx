"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type React from "react";
import dynamic from "next/dynamic";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, BookmarkIcon, BookOpen, CalendarDays, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import MathContent from "@/components/MathContent";

const SolutionModal = dynamic(() => import("@/components/SolutionModal"), { ssr: false });
import SolutionContent from "@/components/SolutionContent";
const CartesianGrid = dynamic(() => import("@/components/CartesianGrid"), { ssr: false });
const FunctionGraph = dynamic(() => import("@/components/FunctionGraph"), { ssr: false });

type AttemptStatus = "ATTEMPTED" | "CORRECT" | "INCORRECT" | "NEEDS_REVIEW" | null;

interface QuestionPart {
  id: string;
  questionNumber: number;
  part: string | null;
  marks: number;
  content: string;
  imageUrl?: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  solution?: { content: string; imageUrl?: string | null; videoUrl?: string | null } | null;
  initialStatus?: AttemptStatus;
  initialBookmarked?: boolean;
}

function QuestionVisual({ imageUrl }: { imageUrl?: string | null }) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("grid:")) {
    const cfg = JSON.parse(imageUrl.slice(5));
    return <CartesianGrid {...cfg} />;
  }
  if (imageUrl.startsWith("function:")) {
    const cfg = JSON.parse(imageUrl.slice(9));
    return <FunctionGraph {...cfg} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={imageUrl} alt="Question diagram" loading="lazy" decoding="async" className="my-4 max-w-full rounded-lg border border-gray-100" />;
}

interface QuestionGroupProps {
  year: number;
  examType: "EXAM_1" | "EXAM_2";
  /** Precise section label — "Exam 1", "Exam 2A" (MCQ), "Exam 2B" (Extended), or a custom label (e.g. "MCQ", "Short Answer") for generated items */
  sectionLabel?: string;
  /** Sequential position within the current topic/view (1-based) */
  questionIndex?: number;
  /** Highest frequency tier among this question's subtopics */
  frequency?: "rare" | "normal" | "often";
  topic: string;
  subtopics?: string[];
  calculatorAllowed?: boolean;
  parts: QuestionPart[];
  /** Whether to show the "Show Solution" button. Defaults to true. */
  showSolutionButton?: boolean;
  /**
   * "modal" (default): the existing click-to-reveal overlay (SolutionModal).
   * "inline": renders the solution as an always-in-DOM block toggled by a
   * CSS `hidden` class instead of conditional mounting — used on the public
   * SEO-indexed exam/question pages so Googlebot sees real solution text
   * (see components/SolutionContent.tsx for why). Visitor-facing behaviour
   * (hidden until "Show solution" is clicked) is identical either way.
   */
  solutionDisplay?: "modal" | "inline";
  /** Exam mode: hide instant MCQ feedback, hide status buttons */
  examMode?: boolean;
  /** Reveal correct/incorrect answers (after exam submit) */
  revealAnswers?: boolean;
  /** Callback when an MCQ option is selected in exam mode */
  onMcqSelect?: (questionId: string, letter: string) => void;
  /** Whether the current user is an admin (enables solution editing) */
  isAdmin?: boolean;
  /**
   * Skip `router.refresh()` after status/bookmark saves. Use this when the
   * parent server component would re-randomise its data on refresh (e.g. the
   * practice session page, which re-shuffles the question pool on every
   * server render). The optimistic local state is sufficient.
   */
  disableServerRefresh?: boolean;
  /** Hide the difficulty / topic / subtopic / frequency / calculator badges. */
  hideBadges?: boolean;
  /** Hide just the topic badge (used on topic pages where the topic is implied). */
  hideTopicBadge?: boolean;
  /**
   * When false, the Mark Correct / Mark Incorrect / Bookmark buttons show a
   * locked state and clicks (and the c/x/r keyboard shortcuts) are no-ops.
   * Used to gate progress tracking behind the paid plan. Defaults to true.
   */
  canTrackProgress?: boolean;
  /**
   * Href of this question's standalone public page. When set (public exam
   * pages), the card header renders a small permalink anchor — the internal
   * link that keeps the ~2,900 public question pages out of orphan status.
   */
  permalink?: string;
  /**
   * Where a click on a LOCKED mark/bookmark button should go (only used when
   * canTrackProgress is false). On public pages this converts the dead-end
   * "please log in" 401 into a signup CTA — e.g. `/signup?next=<this page>`
   * for anonymous visitors, or `/pricing` for a free user on a paid topic.
   */
  lockedCtaHref?: string;
  /** Tooltip for the locked buttons (defaults to "Standard plan required"). */
  lockedTitle?: string;
}

const difficultyStyles = {
  EASY: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400",
  MEDIUM: "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400",
  HARD: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
};
const difficultyLabel = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };

// Parse preamble out of the first part's content if it uses ---PREAMBLE--- marker
function parsePreamble(content: string): { preamble: string | null; question: string } {
  if (!content.startsWith("---PREAMBLE---")) return { preamble: null, question: content };
  const [, rest] = content.split("---PREAMBLE---");
  const [preambleRaw, questionRaw] = rest.split("---QUESTION---");
  return { preamble: preambleRaw.trim(), question: questionRaw?.trim() ?? "" };
}

// Parse MCQ content into question body + lettered options
function parseMCQContent(content: string): { body: string; options: { letter: string; text: string }[] } | null {
  const optionRegex = /\*\*([A-E])\.\*\*/g;
  const matches = Array.from(content.matchAll(optionRegex));
  if (matches.length < 2) return null;
  const body = content.slice(0, matches[0].index).trim();
  const options: { letter: string; text: string }[] = [];
  for (let i = 0; i < matches.length; i++) {
    const letter = matches[i][1];
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : content.length;
    options.push({ letter, text: content.slice(start, end).trim() });
  }
  return { body, options };
}

// Extract correct answer letter from solution content
export function parseMCQAnswer(solutionContent?: string | null): string | null {
  if (!solutionContent) return null;
  // Match both "**Answer: X**" and "answer is **X**" formats
  const m = solutionContent.match(/\*\*Answer:\s*([A-E])\*\*/) ?? solutionContent.match(/answer is \*\*([A-E])\*\*/i);
  return m ? m[1] : null;
}

// Interactive lettered option list for MCQ questions
function InteractiveMCQOptions({
  options,
  correctAnswer,
  selectedOption,
  onSelect,
  examMode,
  revealAnswers,
}: {
  options: { letter: string; text: string }[];
  correctAnswer: string | null;
  selectedOption: string | null;
  onSelect: (letter: string) => void;
  /** In exam mode, don't reveal correct/incorrect on selection */
  examMode?: boolean;
  /** Force reveal correct/incorrect (used after exam submit) */
  revealAnswers?: boolean;
}) {
  const hasAnswered = selectedOption !== null;
  // In exam mode: only reveal after explicit revealAnswers flag
  const showFeedback = revealAnswers || (!examMode && hasAnswered);

  return (
    <div className="mt-3 space-y-2">
      {options.map(({ letter, text }) => {
        const isSelected = selectedOption === letter;
        const isCorrect = correctAnswer === letter;

        let wrapperStyle = "border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-brand-200 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-950";
        let badgeStyle = "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400";
        let icon: React.ReactNode = null;

        if (showFeedback) {
          if (isCorrect) {
            wrapperStyle = "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950";
            badgeStyle = "border-green-500 bg-green-500 text-white";
            if (isSelected) icon = <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />;
          } else if (isSelected) {
            wrapperStyle = "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950";
            badgeStyle = "border-red-400 bg-red-400 text-white";
            icon = <XCircle className="h-5 w-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />;
          } else {
            wrapperStyle = "border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-50";
          }
        } else if (examMode && isSelected) {
          wrapperStyle = "border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-950";
          badgeStyle = "border-brand-500 bg-brand-500 text-white";
        }

        // In exam mode before reveal, allow changing answer
        const canSelect = examMode ? !revealAnswers : !hasAnswered;

        return (
          <button
            key={letter}
            onClick={() => canSelect && onSelect(letter)}
            disabled={!canSelect}
            className={cn(
              "w-full flex items-start gap-3 rounded-xl border px-4 py-2.5 text-left transition-colors",
              wrapperStyle,
              canSelect && "cursor-pointer",
              !canSelect && "cursor-default"
            )}
          >
            <span className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
              badgeStyle
            )}>
              {letter}
            </span>
            <div className="flex-1 text-base leading-relaxed pt-0.5">
              <MathContent content={text} />
            </div>
            {icon}
          </button>
        );
      })}
    </div>
  );
}

// Rewrite inline part labels into the topic-page display format:
//   "**a.** <body>. (N marks)"          → "**a (N marks).**\n\n<body>."
//   "  **i.** <body>. (N marks)"        → "**parent.i (N marks).**\n\n<body>."
// Top-level letters (a–z) at column 0 are tracked as the current parent so
// indented sub-parts (i, ii, iii…) get rendered as combined labels (e.g. "b.i").
// A horizontal rule is inserted between top-level parts for visual separation.
function rewritePartLabels(content: string): string {
  const lines = content.split("\n");
  const out: string[] = [];
  let parentLetter = "";
  let firstTopPartSeen = false;

  // Match a top-level part at column 0: **a.** body... possibly followed by (N marks)
  const TOP_RE = /^\*\*([a-z]+)\.\*\*\s+([\s\S]*?)\s*(?:\((\d+)\s+(marks?)\))?\s*$/;
  // Match an indented sub-part: at least one leading space, **i.** body... (N marks)
  const SUB_RE = /^([ \t]+)\*\*([a-z]+)\.\*\*\s+([\s\S]*?)\s*(?:\((\d+)\s+(marks?)\))?\s*$/;

  for (const line of lines) {
    // Indented sub-part takes precedence (matched first)
    const subMatch = line.match(SUB_RE);
    if (subMatch && /^[ \t]/.test(line)) {
      const [, , letter, body, num, unit] = subMatch;
      const combinedLetter = parentLetter ? `${parentLetter}.${letter}` : letter;
      const label = num
        ? `**${combinedLetter} (${num} ${unit}).**`
        : `**${combinedLetter}.**`;
      out.push(label);
      if (body && body.trim()) {
        out.push("");
        out.push(body.trim());
      }
      continue;
    }

    const topMatch = line.match(TOP_RE);
    if (topMatch) {
      const [, letter, body, num, unit] = topMatch;
      parentLetter = letter;
      // Insert a divider between top-level parts (skip before the very first one)
      if (firstTopPartSeen) {
        out.push("");
        out.push("---");
      }
      firstTopPartSeen = true;
      const label = num
        ? `**${letter} (${num} ${unit}).**`
        : `**${letter}.**`;
      out.push(label);
      if (body && body.trim()) {
        out.push("");
        out.push(body.trim());
      }
      continue;
    }

    out.push(line);
  }

  return out.join("\n");
}

// Render content that may contain [GRAPH] placeholder (non-MCQ only)
function PartContent({ content, imageUrl }: { content: string; imageUrl?: string | null }) {
  const transformed = rewritePartLabels(content);
  if (transformed.includes("[GRAPH]")) {
    const segments = transformed.split("[GRAPH]");
    return (
      <>
        {segments.map((seg, si) => (
          <div key={si}>
            {seg.trim() && <div className="text-base leading-relaxed"><MathContent content={seg.trim()} /></div>}
            {si < segments.length - 1 && <QuestionVisual imageUrl={imageUrl} />}
          </div>
        ))}
      </>
    );
  }
  return (
    <>
      <div className="text-base leading-relaxed"><MathContent content={transformed} /></div>
      <QuestionVisual imageUrl={imageUrl} />
    </>
  );
}

const FREQ_LABEL: Record<"rare" | "normal" | "often", string> = {
  rare: "Rare",
  normal: "Most years",
  often: "Every year",
};

export default function QuestionGroup({ year, examType, sectionLabel, questionIndex, frequency, topic, subtopics, calculatorAllowed, parts, showSolutionButton = true, examMode, revealAnswers, onMcqSelect, isAdmin, disableServerRefresh, hideBadges, hideTopicBadge, canTrackProgress = true, permalink, lockedCtaHref, lockedTitle, solutionDisplay = "modal" }: QuestionGroupProps) {
  const router = useRouter();
  const [showSolution, setShowSolution] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, AttemptStatus>>(
    Object.fromEntries(parts.map((p) => [p.id, p.initialStatus ?? null]))
  );
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>(
    Object.fromEntries(parts.map((p) => [p.id, p.initialBookmarked ?? false]))
  );
  const [mcqSelections, setMcqSelections] = useState<Record<string, string | null>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  // When a save fails with 403 PAYWALL (a free user marking a paid-topic
  // question on a public page), the error carries an upgrade link instead of a
  // generic "failed" — the paid-tier equivalent of the anon signup CTA.
  const [saveCtaHref, setSaveCtaHref] = useState<string | null>(null);

  function reportSaveFailure(status: number) {
    if (status === 403) {
      setSaveError("Saving progress on this topic is part of VCE Maths.");
      setSaveCtaHref("/pricing");
    } else if (status === 401) {
      setSaveError("Please log in to save your progress.");
      setSaveCtaHref(null);
    } else {
      setSaveError("Failed to save. Please try again.");
      setSaveCtaHref(null);
    }
  }

  function clearSaveError() {
    setSaveError(null);
    setSaveCtaHref(null);
  }
  const cardRef = useRef<HTMLDivElement>(null);

  // Generated items (year === 0) have no matching Question row,
  // so attempt tracking is unavailable — skip API calls and hide status buttons.
  const isGenerated = year === 0;

  // For multi-part generated items (Exam 2B Practice), each visible part has
  // a synthetic id `${itemId}::a`, `::b`, ... so React keys and per-part
  // self-marking work. Status & bookmark always live on the parent
  // QuestionSetItem though, so API calls strip the suffix and visual state
  // propagates across every sibling sharing the same parent.
  function getParentId(id: string): string {
    const i = id.indexOf("::");
    return i === -1 ? id : id.slice(0, i);
  }
  function siblingPartIds(id: string): string[] {
    const parent = getParentId(id);
    return parts
      .filter((p) => getParentId(p.id) === parent)
      .map((p) => p.id);
  }

  const questionNumber = parts[0].questionNumber;
  const totalMarks = parts.reduce((sum, p) => sum + p.marks, 0);
  const hasParts = parts.length > 1 || parts.some((p) => p.part !== null);
  const hasSolution = parts.some((p) => p.solution);
  const overallDifficulty = parts[0].difficulty;

  // Derived section label — falls back gracefully when prop is not supplied
  const derivedSectionLabel = sectionLabel ?? (examType === "EXAM_1" ? "Exam 1" : "Exam 2");
  // When year is 0 (e.g. generated items), omit it from the reference tag
  const referenceTag = year === 0
    ? `${derivedSectionLabel} · #${questionNumber}`
    : `${year} · ${derivedSectionLabel} · Q${questionNumber}`;
  const questionLabel = `${referenceTag}`;

  // Extract shared preamble from the first part — renders once above all
  // parts as a "shared context" header for the whole question.
  const { preamble, question: firstPartQuestion } = parsePreamble(parts[0].content);

  // Strip preamble markers from every other part too. When a compound is
  // built from multiple source items (Exam 1), each item's first sub-part
  // may carry its own preamble. We can't render those in the shared header
  // (it's only one slot), so we inline them at the start of that part's
  // content with a paragraph break — the marker text never leaks.
  const renderedParts = parts.map((p, i) => {
    if (i === 0 && preamble) {
      return { ...p, content: firstPartQuestion };
    }
    if (i === 0) return p;
    const inner = parsePreamble(p.content);
    if (!inner.preamble) return p;
    return { ...p, content: `${inner.preamble}\n\n${inner.question}` };
  });

  const combinedSolutions = parts
    .filter((p) => p.solution)
    .map((p) => ({ questionId: p.id, part: p.part, content: p.solution!.content, imageUrl: p.solution!.imageUrl, videoUrl: p.solution!.videoUrl }));

  async function toggleStatus(id: string, s: AttemptStatus) {
    if (!canTrackProgress) {
      // Locked: on public pages, convert the click into a signup/upgrade CTA
      // instead of silently doing nothing (or a 401 dead-end).
      if (lockedCtaHref) router.push(lockedCtaHref);
      return;
    }
    const prev = statuses[id];
    // When clicking same status to un-toggle, clear to null visually
    // but send ATTEMPTED to API (preserves bookmark in DB)
    const isClearing = prev === s;
    const next: AttemptStatus = isClearing ? null : s;
    const siblings = siblingPartIds(id);
    // Propagate visual state to every sibling part sharing the same parent
    // QuestionSetItem so the row icons stay in sync with the saved state.
    setStatuses((cur) => {
      const updated = { ...cur };
      siblings.forEach((sid) => {
        updated[sid] = next;
      });
      return updated;
    });
    clearSaveError();

    const endpoint = isGenerated ? "/api/generated-attempts" : "/api/attempts";
    const idField = isGenerated ? "questionSetItemId" : "questionId";
    const apiId = getParentId(id);

    try {
      // When clearing status, use ATTEMPTED instead of DELETE to preserve bookmarks
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [idField]: apiId, status: next ?? "ATTEMPTED" }),
      });

      if (!res.ok) {
        // Revert optimistic update on failure across all siblings
        setStatuses((cur) => {
          const updated = { ...cur };
          siblings.forEach((sid) => {
            updated[sid] = prev;
          });
          return updated;
        });
        reportSaveFailure(res.status);
      } else if (!disableServerRefresh) {
        router.refresh();
      }
    } catch {
      // Network error — revert
      setStatuses((cur) => {
        const updated = { ...cur };
        siblings.forEach((sid) => {
          updated[sid] = prev;
        });
        return updated;
      });
      setSaveError("Network error. Please check your connection.");
    }
  }

  async function toggleBookmark(id: string) {
    if (!canTrackProgress) {
      if (lockedCtaHref) router.push(lockedCtaHref);
      return;
    }
    const prev = bookmarks[id];
    const next = !prev;
    const siblings = siblingPartIds(id);
    setBookmarks((cur) => {
      const updated = { ...cur };
      siblings.forEach((sid) => {
        updated[sid] = next;
      });
      return updated;
    });
    clearSaveError();

    // For generated items, persist via the generated-attempts endpoint
    if (isGenerated) {
      const apiId = getParentId(id);
      try {
        const res = await fetch("/api/generated-attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionSetItemId: apiId, bookmarked: next }),
        });
        if (!res.ok) {
          setBookmarks((cur) => {
            const updated = { ...cur };
            siblings.forEach((sid) => {
              updated[sid] = prev;
            });
            return updated;
          });
          reportSaveFailure(res.status);
        } else if (!disableServerRefresh) {
          router.refresh();
        }
      } catch {
        setBookmarks((cur) => {
          const updated = { ...cur };
          siblings.forEach((sid) => {
            updated[sid] = prev;
          });
          return updated;
        });
        setSaveError("Network error. Please check your connection.");
      }
      return;
    }

    // For exam questions, bookmark is independent of status
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: id, bookmarked: next }),
      });
      if (!res.ok) {
        setBookmarks((cur) => ({ ...cur, [id]: prev }));
        setSaveError(res.status === 401 ? "Please log in to save your progress." : "Failed to save. Please try again.");
      } else if (!disableServerRefresh) {
        router.refresh();
      }
    } catch {
      setBookmarks((cur) => ({ ...cur, [id]: prev }));
      setSaveError("Network error. Please check your connection.");
    }
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (examMode) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const firstPartId = parts[0]?.id;
      if (!firstPartId) return;

      // Mark/bookmark shortcuts are no-ops when tracking is locked — a keypress
      // must never silently navigate the user away (the visible locked buttons
      // are the explicit signup/upgrade CTA; a stray `c` shouldn't teleport).
      const canMark = canTrackProgress;

      switch (e.key) {
        case "c":
          if (canMark) toggleStatus(firstPartId, "CORRECT");
          break;
        case "x":
          if (canMark) toggleStatus(firstPartId, "INCORRECT");
          break;
        case "r":
          if (canMark) toggleBookmark(firstPartId);
          break;
        case "s":
          if (hasSolution) setShowSolution(true);
          break;
        case "j":
        case "ArrowDown": {
          e.preventDefault();
          const next = cardRef.current?.parentElement?.nextElementSibling?.querySelector<HTMLElement>("[tabindex]");
          next?.focus();
          next?.scrollIntoView({ behavior: "smooth", block: "center" });
          break;
        }
        case "k":
        case "ArrowUp": {
          e.preventDefault();
          const prev = cardRef.current?.parentElement?.previousElementSibling?.querySelector<HTMLElement>("[tabindex]");
          prev?.focus();
          prev?.scrollIntoView({ behavior: "smooth", block: "center" });
          break;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [examMode, parts, hasSolution, canTrackProgress]
  );

  return (
    <div
      ref={cardRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden focus:outline-none focus:ring-2 focus:ring-brand-300 dark:focus:ring-brand-700"
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 lg:px-7 lg:pt-6 lg:pb-4">
        <div className="flex-1">
          {/* Row 1: "Question N — M marks" · difficulty · frequency.
              In Exam Version (`examMode`), the difficulty / frequency badges
              are hidden — real VCAA papers don't pre-label questions with
              their difficulty, so showing them would leak strategic info to
              the student during the exam. The Question/marks line stays
              because real papers do print that. */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {questionIndex !== undefined ? (
              <span className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100">
                Question {questionIndex}
                <span className="text-gray-400 dark:text-gray-500 font-normal mx-1.5">—</span>
                {totalMarks} {totalMarks === 1 ? "mark" : "marks"}
              </span>
            ) : (
              <span className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100">
                {totalMarks} {totalMarks === 1 ? "mark" : "marks"}
              </span>
            )}
            {!examMode && !hideBadges && (
              <span className={cn("rounded-full px-3 py-1 text-sm lg:text-base font-medium", difficultyStyles[overallDifficulty])}>
                {difficultyLabel[overallDifficulty]}
              </span>
            )}
            {/* Frequency hidden on phone — saves a row of metadata clutter */}
            {!examMode && !hideBadges && frequency && (
              <span className="hidden sm:flex items-center gap-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-0.5 text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                <CalendarDays className="h-3 w-3 lg:h-3.5 lg:w-3.5 text-gray-400 dark:text-gray-500" />
                {FREQ_LABEL[frequency]}
              </span>
            )}
            {permalink && !examMode && (
              <NextLink
                href={permalink}
                aria-label={`Open question ${questionIndex ?? ""} on its own page`}
                className="ml-auto inline-flex min-h-[40px] items-center gap-1 px-1 text-xs lg:text-sm font-medium text-gray-400 dark:text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                <Link2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Permalink</span>
              </NextLink>
            )}
          </div>
          {/* Row 2: Topic · subtopics · calculator. Hidden in Exam Version
              for the same reason — naming the topic / subtopic in advance
              tells the student which technique to reach for. The calculator
              badge is communicated at the section level instead (e.g. the
              setup page header says "No calculator" / "CAS Calculator
              allowed" for the whole paper). */}
          {!examMode && !hideBadges && (
            <div className="flex flex-wrap gap-2 items-center">
              {!hideTopicBadge && (
                <span className="rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400 px-3 py-1 text-sm lg:text-base font-medium">{topic}</span>
              )}
              {/* Subtopic pills hidden on phone after the first one to keep
                  the card header from wrapping onto 3 rows. The first
                  subtopic still gives context. */}
              {subtopics?.map((s, i) => (
                <span
                  key={s}
                  className={cn(
                    "rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 text-sm lg:text-base font-medium",
                    i > 0 && "hidden sm:inline"
                  )}
                >
                  {s}
                </span>
              ))}
              {calculatorAllowed !== undefined && (
                <span className={cn(
                  "rounded-full px-3 py-1 text-sm lg:text-base font-medium",
                  calculatorAllowed
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                    : "bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400"
                )}>
                  {calculatorAllowed ? "Calculator-assumed" : "Calculator-free"}
                </span>
              )}
            </div>
          )}
        </div>
        {/* Icon row: BookOpen (reference) · Check · X · Bookmark */}
        <div className="flex items-center gap-0.5 shrink-0 mt-1">
          {/* BookOpen — hover tooltip shows reference */}
          <div className="group relative cursor-default p-1 lg:p-1.5">
            <BookOpen className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
            <div className="pointer-events-none absolute top-full right-0 mt-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <div className="rounded-lg bg-gray-900 text-white text-xs lg:text-sm px-3 py-1.5 shadow-lg whitespace-nowrap font-mono">
                {referenceTag}
              </div>
              <div className="absolute bottom-full right-3 border-4 border-transparent border-b-gray-900" />
            </div>
          </div>
          {/* For MCQs: status buttons live here in the header (hidden in exam mode) */}
          {!hasParts && !examMode && (
            <>
              <button onClick={() => toggleStatus(parts[0].id, "CORRECT")} title={canTrackProgress ? "Mark correct" : (lockedTitle ?? "Standard plan required")}
                className={cn(
                  "rounded-lg p-2.5 lg:p-1.5 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center",
                  !canTrackProgress && "text-gray-300 dark:text-gray-600",
                  canTrackProgress && statuses[parts[0].id] === "CORRECT" && "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
                  canTrackProgress && statuses[parts[0].id] !== "CORRECT" && "text-gray-400 dark:text-gray-500 hover:text-green-500",
                )}>
                <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5" />
              </button>
              <button onClick={() => toggleStatus(parts[0].id, "INCORRECT")} title={canTrackProgress ? "Mark incorrect" : (lockedTitle ?? "Standard plan required")}
                className={cn(
                  "rounded-lg p-2.5 lg:p-1.5 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center",
                  !canTrackProgress && "text-gray-300 dark:text-gray-600",
                  canTrackProgress && statuses[parts[0].id] === "INCORRECT" && "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
                  canTrackProgress && statuses[parts[0].id] !== "INCORRECT" && "text-gray-400 dark:text-gray-500 hover:text-red-500",
                )}>
                <XCircle className="h-4 w-4 lg:h-5 lg:w-5" />
              </button>
              <button onClick={() => toggleBookmark(parts[0].id)} title={canTrackProgress ? "Bookmark for review" : (lockedTitle ?? "Standard plan required")}
                className={cn(
                  "rounded-lg p-2.5 lg:p-1.5 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center",
                  !canTrackProgress && "text-gray-300 dark:text-gray-600",
                  canTrackProgress && bookmarks[parts[0].id] && "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400",
                  canTrackProgress && !bookmarks[parts[0].id] && "text-gray-400 dark:text-gray-500 hover:text-yellow-500",
                )}>
                <BookmarkIcon className="h-4 w-4 lg:h-5 lg:w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Shared preamble (above all parts) */}
      {preamble && (
        <div className="px-5 lg:px-7 pb-2">
          <PartContent content={preamble} imageUrl={parts[0].imageUrl} />
        </div>
      )}

      {/* Question body — all parts */}
      <div className="px-5 lg:px-7 pb-4 lg:pb-6 space-y-4 lg:space-y-5">
        {renderedParts.map((p, i) => (
          <div key={p.id}>
            {/* Part label row — only for multi-part Section B questions */}
            {hasParts && (
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {p.part && (
                    <span className="text-base lg:text-lg font-bold text-gray-800 dark:text-gray-200">
                      {p.part.toLowerCase()} ({p.marks} {p.marks === 1 ? "mark" : "marks"}).
                    </span>
                  )}
                  {!p.part && (
                    <span className="text-sm lg:text-base text-gray-400 dark:text-gray-500">
                      {p.marks} {p.marks === 1 ? "mark" : "marks"}
                    </span>
                  )}
                </div>
                {!examMode && (
                <div className="flex items-center gap-0.5">
                  <button onClick={() => toggleStatus(p.id, "CORRECT")} title={canTrackProgress ? "Mark correct" : (lockedTitle ?? "Standard plan required")}
                    className={cn(
                      "rounded-lg p-2.5 lg:p-1.5 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center",
                      !canTrackProgress && "text-gray-300 dark:text-gray-600",
                      canTrackProgress && statuses[p.id] === "CORRECT" && "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
                      canTrackProgress && statuses[p.id] !== "CORRECT" && "text-gray-400 dark:text-gray-500 hover:text-green-500",
                    )}>
                    <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5" />
                  </button>
                  <button onClick={() => toggleStatus(p.id, "INCORRECT")} title={canTrackProgress ? "Mark incorrect" : (lockedTitle ?? "Standard plan required")}
                    className={cn(
                      "rounded-lg p-2.5 lg:p-1.5 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center",
                      !canTrackProgress && "text-gray-300 dark:text-gray-600",
                      canTrackProgress && statuses[p.id] === "INCORRECT" && "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
                      canTrackProgress && statuses[p.id] !== "INCORRECT" && "text-gray-400 dark:text-gray-500 hover:text-red-500",
                    )}>
                    <XCircle className="h-4 w-4 lg:h-5 lg:w-5" />
                  </button>
                  <button onClick={() => toggleBookmark(p.id)} title={canTrackProgress ? "Bookmark for review" : (lockedTitle ?? "Standard plan required")}
                    className={cn(
                      "rounded-lg p-2.5 lg:p-1.5 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center",
                      !canTrackProgress && "text-gray-300 dark:text-gray-600",
                      canTrackProgress && bookmarks[p.id] && "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400",
                      canTrackProgress && !bookmarks[p.id] && "text-gray-400 dark:text-gray-500 hover:text-yellow-500",
                    )}>
                    <BookmarkIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                  </button>
                </div>
                )}
              </div>
            )}

            {/* Part content — interactive for MCQ, standard otherwise */}
            {(() => {
              const mcqParsed = parseMCQContent(p.content);
              if (mcqParsed) {
                return (
                  <>
                    <div className="text-base leading-relaxed"><MathContent content={mcqParsed.body} /></div>
                    <QuestionVisual imageUrl={preamble ? null : p.imageUrl} />
                    <InteractiveMCQOptions
                      options={mcqParsed.options}
                      correctAnswer={parseMCQAnswer(p.solution?.content)}
                      selectedOption={mcqSelections[p.id] ?? null}
                      onSelect={(letter) => {
                        setMcqSelections((prev) => ({ ...prev, [p.id]: letter }));
                        onMcqSelect?.(p.id, letter);
                      }}
                      examMode={examMode}
                      revealAnswers={revealAnswers}
                    />
                    {!examMode && mcqSelections[p.id] !== undefined && mcqSelections[p.id] !== null && (
                      <button
                        onClick={() => setMcqSelections((prev) => ({ ...prev, [p.id]: null }))}
                        className="mt-2 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 underline underline-offset-2"
                      >
                        Try again
                      </button>
                    )}
                  </>
                );
              }
              return <PartContent content={p.content} imageUrl={preamble ? null : p.imageUrl} />;
            })()}

            {i < renderedParts.length - 1 && (
              <div className="mt-4 border-t border-dashed border-gray-100 dark:border-gray-800" />
            )}
          </div>
        ))}
      </div>

      {/* Save error message — a 403 (paid-topic save) carries an upgrade link. */}
      {saveError && (
        <div className="mx-5 lg:mx-7 mb-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-2.5 text-sm text-red-700 dark:text-red-400 flex items-center justify-between gap-3">
          <span>
            {saveError}
            {saveCtaHref && (
              <NextLink href={saveCtaHref} className="ml-1 font-semibold underline underline-offset-2 hover:text-red-900 dark:hover:text-red-200">
                Upgrade →
              </NextLink>
            )}
          </span>
          <button onClick={clearSaveError} className="text-red-400 hover:text-red-600 dark:hover:text-red-300 text-lg leading-none shrink-0">×</button>
        </div>
      )}

      {/* Single solution button at the bottom. In "inline" mode this toggles
          the always-mounted block below rather than opening the modal, so
          the label flips to "Hide solution" once revealed. */}
      {hasSolution && showSolutionButton && (
        <div className="px-5 lg:px-7 pb-5 lg:pb-6 pt-1 border-t border-gray-50 dark:border-gray-800">
          <button
            onClick={() =>
              solutionDisplay === "inline" ? setShowSolution((v) => !v) : setShowSolution(true)
            }
            className="rounded-xl px-6 lg:px-8 py-2.5 lg:py-3 text-base lg:text-lg font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          >
            {solutionDisplay === "inline" && showSolution ? "Hide solution" : "Show solution"}
          </button>
        </div>
      )}

      {solutionDisplay === "inline" ? (
        /* Always in the DOM — server-rendered on first paint — and toggled
           with a CSS `hidden` class rather than conditional mounting, so
           search crawlers see real worked-solution text (see
           components/SolutionContent.tsx for why this matters). Visually
           identical to a modal reveal for real visitors: hidden until they
           click "Show solution" above. */
        hasSolution && (
          <div className={cn("px-5 lg:px-7 pb-5 lg:pb-6", !showSolution && "hidden")}>
            <SolutionContent solutions={combinedSolutions} />
          </div>
        )
      ) : (
        /* Combined solution modal (default — unchanged everywhere except the
           public exam/question pages that opt into solutionDisplay="inline"). */
        showSolution && (
          <SolutionModal
            questionLabel={questionLabel}
            solutions={combinedSolutions}
            onClose={() => setShowSolution(false)}
            isAdmin={isAdmin}
          />
        )
      )}
    </div>
  );
}
