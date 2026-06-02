"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Calculator,
  Atom,
  BookOpen,
  Globe,
  Languages,
  Palette,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SUBJECTS,
  visibleSwitcherSubjects,
  type SubjectMetadata,
} from "@/lib/subject-context";
import { DEFAULT_CURRICULUM_SLUG } from "@/lib/curriculum-context";

type AreaKey =
  | "mathematics"
  | "sciences"
  | "english"
  | "humanities"
  | "languages"
  | "arts";

type Area = {
  key: AreaKey;
  name: string;
  icon: typeof Calculator;
  available: boolean;
  /** Subjects shown in col 2 when this area is hovered (empty for unavailable). */
  subjects: SubjectMetadata[];
};

// 6 VCE faculties — Mathematics is the only live one today; the rest are
// brand promise greyed "coming soon" entries, same pattern as the curriculum
// pill's coming-soon list.
const AREAS: Area[] = [
  {
    key: "mathematics",
    name: "Mathematics",
    icon: Calculator,
    available: true,
    subjects: SUBJECTS,
  },
  {
    key: "sciences",
    name: "Sciences",
    icon: Atom,
    available: false,
    subjects: [],
  },
  {
    key: "english",
    name: "English",
    icon: BookOpen,
    available: false,
    subjects: [],
  },
  {
    key: "humanities",
    name: "Humanities",
    icon: Globe,
    available: false,
    subjects: [],
  },
  {
    key: "languages",
    name: "Languages",
    icon: Languages,
    available: false,
    subjects: [],
  },
  {
    key: "arts",
    name: "Arts",
    icon: Palette,
    available: false,
    subjects: [],
  },
];

type Props = {
  /** Active curriculum slug — controls which curriculum the links nest under. */
  curriculum?: string;
  /** Footer upsell slot — B4 fills this with the upsell line for free users. */
  footer?: React.ReactNode;
  /**
   * Student's registered maths subjects (URL slugs). This menu stays a full
   * catalogue, but subjects the student hasn't registered render greyed out
   * and unclickable. Empty/undefined → all clickable.
   */
  studyingSubjects?: string[];
};

/**
 * "Subjects ▾" mega-menu — opens a 2-column panel:
 *   col 1: subject areas (Mathematics live; others greyed "coming soon")
 *   col 2: subjects within the hovered area (today Mathematics only)
 *
 * Closes on click-outside / ESC / route change. Click an area name to land
 * on the area page (`/{curriculum}/{area}`) — those routes don't exist yet;
 * they're planned for B5.
 */
export default function SubjectsMegaMenu({
  curriculum = DEFAULT_CURRICULUM_SLUG,
  footer,
  studyingSubjects,
}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hoveredArea, setHoveredArea] = useState<AreaKey>("mathematics");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on outside click + ESC
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const activeArea = AREAS.find((a) => a.key === hoveredArea) ?? AREAS[0];

  // Registered subjects (URL slugs) — unregistered ones render greyed/disabled.
  // Empty registration → all registered (everything clickable).
  const registeredSlugs = new Set<string>(
    visibleSwitcherSubjects(studyingSubjects).map((s) => s.urlSlug),
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        Subjects
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 mt-2 w-[720px] max-w-[calc(100vw-2rem)] rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl ring-1 ring-black/5 dark:ring-white/5 z-50 overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {curriculum.toUpperCase()} subjects
            </span>
          </div>

          <div className="grid grid-cols-[200px_1fr]">
            {/* Col 1: subject areas */}
            <div className="border-r border-gray-100 dark:border-gray-800 py-2">
              {AREAS.map((area) => (
                <AreaRow
                  key={area.key}
                  area={area}
                  curriculum={curriculum}
                  isHovered={hoveredArea === area.key}
                  onHover={() => setHoveredArea(area.key)}
                />
              ))}
            </div>

            {/* Col 2: subjects within hovered area */}
            <div className="py-2 min-h-[280px]">
              {activeArea.available ? (
                activeArea.subjects.map((subject) => {
                  // Unregistered subjects stay visible (this menu is the full
                  // catalogue) but greyed out and unclickable — the student
                  // adds them in Profile → Subjects.
                  if (!registeredSlugs.has(subject.urlSlug)) {
                    return (
                      <div
                        key={subject.urlSlug}
                        role="menuitem"
                        aria-disabled="true"
                        title="Add this subject in Profile → Subjects to study it"
                        className="flex items-center gap-3 px-5 py-2.5 cursor-not-allowed"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold flex-shrink-0 bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600">
                          {subject.badge}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-400 dark:text-gray-600 truncate">
                            {subject.shortName}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-600 truncate">
                            {subject.displayName}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={subject.urlSlug}
                      href={`/${curriculum}/${subject.urlSlug}/topics`}
                      role="menuitem"
                      className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold flex-shrink-0",
                          subject.colors.badge
                        )}
                      >
                        {subject.badge}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {subject.shortName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {subject.displayName}
                        </p>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="flex items-center justify-center h-full px-5 py-12">
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center">
                    {activeArea.name} is coming soon.
                    <br />
                    We&apos;re working on it.
                  </p>
                </div>
              )}
            </div>
          </div>

          {footer && (
            <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-3 bg-gray-50 dark:bg-gray-950/50">
              {footer}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AreaRow({
  area,
  curriculum,
  isHovered,
  onHover,
}: {
  area: Area;
  curriculum: string;
  isHovered: boolean;
  onHover: () => void;
}) {
  const Icon = area.icon;
  const className = cn(
    "flex items-center gap-3 px-5 py-2.5 w-full text-left transition-colors",
    isHovered && area.available
      ? "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      : area.available
        ? "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        : "text-gray-400 dark:text-gray-600 cursor-not-allowed"
  );

  const body = (
    <>
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1 text-sm font-medium truncate">{area.name}</span>
      {!area.available && (
        <Clock className="h-3 w-3 flex-shrink-0 opacity-60" />
      )}
    </>
  );

  if (!area.available) {
    return (
      <div className={className} onMouseEnter={onHover}>
        {body}
      </div>
    );
  }

  return (
    <Link
      href={`/${curriculum}/${area.key}`}
      role="menuitem"
      onMouseEnter={onHover}
      onFocus={onHover}
      className={className}
    >
      {body}
    </Link>
  );
}
