"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Zap, ArrowRight } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import CurriculumPill from "@/components/CurriculumPill";
import SubjectsMegaMenu from "@/components/SubjectsMegaMenu";
import UserAvatarMenu from "@/components/UserAvatarMenu";
import MobileDrawer from "@/components/MobileDrawer";
import { isKnownCurriculum, DEFAULT_CURRICULUM_SLUG } from "@/lib/curriculum-context";
import { isKnownSubject, getSubjectMetadata } from "@/lib/subject-context";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/profile": "Profile",
  "/search": "Search",
  "/history": "History",
  "/referrals": "Referrals",
  "/admin": "Admin",
};

const SECTION_LABELS: Record<string, string> = {
  topics: "Topics",
  exams: "Past papers",
  practice: "Practice",
  questions: "Questions",
};

type ParsedPath =
  | {
      mode: "subject";
      curriculum: string;
      subject: string;
      section?: string;
      slug?: string;
    }
  | { mode: "global"; title: string };

function parsePath(pathname: string): ParsedPath {
  // /[curriculum]/[subject]/[section?]/[slug?]
  const segments = pathname.split("/").filter(Boolean);
  if (
    segments.length >= 2 &&
    isKnownCurriculum(segments[0]) &&
    isKnownSubject(segments[1])
  ) {
    return {
      mode: "subject",
      curriculum: segments[0],
      subject: segments[1],
      section: segments[2],
      slug: segments[3],
    };
  }
  // Fallback to global page title
  for (const [prefix, label] of Object.entries(PAGE_TITLES)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return { mode: "global", title: label };
    }
  }
  return { mode: "global", title: "ATAR Hero" };
}

type Props = {
  isAdmin?: boolean;
  /** Drives the mega-menu footer upsell — free users see it, paid don't. */
  isPaid?: boolean;
  displayName?: string | null;
  email?: string | null;
  /** Student's registered maths subjects (URL slugs) — filters the mobile
   *  drawer's subject switcher. Empty/undefined → all subjects. */
  studyingSubjects?: string[];
};

/**
 * Top bar — persistent header across the (app)/ tree.
 *
 * Desktop: logo + curriculum pill + subjects mega-menu + (right) avatar menu
 * Mobile:  hamburger (left) + breadcrumb (centre) + avatar menu (right)
 *
 * Inside a subject route the mobile breadcrumb shows `<Subject> · <Section>`;
 * tapping it opens the same MobileDrawer the hamburger opens (which has the
 * subject-swap UI). Outside subject routes the breadcrumb is just the page
 * title.
 */
export default function TopBar({
  isAdmin = false,
  isPaid = false,
  displayName,
  email,
  studyingSubjects,
}: Props) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const parsed = parsePath(pathname);

  const curriculum =
    parsed.mode === "subject" ? parsed.curriculum : DEFAULT_CURRICULUM_SLUG;

  // Footer slot for the mega-menu — free users see a single upsell line.
  const megaMenuFooter = isPaid ? undefined : (
    <Link
      href="/pricing"
      className="flex items-center gap-2 text-sm font-medium text-brand-700 dark:text-brand-300 hover:text-brand-800 dark:hover:text-brand-200 transition-colors"
    >
      <Zap className="h-4 w-4" />
      <span className="flex-1">
        Unlock VCE Maths — $9.99/month for all 4 maths subjects
      </span>
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 h-14 lg:h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="h-full flex items-center px-4 lg:px-6 gap-3">
          {/* Mobile: hamburger */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Desktop: logo + wordmark */}
          <Link
            href="/"
            className="hidden lg:flex items-center gap-2.5 text-brand-700 dark:text-brand-400 font-bold text-lg flex-shrink-0"
          >
            <BrandMark className="h-8 w-auto" />
            ATAR Hero
          </Link>

          {/* Desktop: curriculum pill + subjects mega-menu */}
          <div className="hidden lg:flex items-center gap-2 ml-2">
            <CurriculumPill current={curriculum} />
            <SubjectsMegaMenu
              curriculum={curriculum}
              footer={megaMenuFooter}
              studyingSubjects={studyingSubjects}
            />
          </div>

          {/* Mobile: breadcrumb (centre, flex-1) */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden flex-1 min-w-0 flex items-center gap-1.5 px-2 py-1 -mx-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <Breadcrumb parsed={parsed} />
          </button>

          {/* Spacer for desktop */}
          <div className="hidden lg:block flex-1" />

          {/* Right: avatar (both layouts) */}
          <UserAvatarMenu
            isAdmin={isAdmin}
            displayName={displayName}
            email={email}
          />
        </div>
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isAdmin={isAdmin}
        curriculum={curriculum}
        activeSubject={
          parsed.mode === "subject" ? parsed.subject : undefined
        }
        studyingSubjects={studyingSubjects}
      />
    </>
  );
}

function Breadcrumb({ parsed }: { parsed: ParsedPath }) {
  if (parsed.mode === "global") {
    return (
      <span className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
        {parsed.title}
      </span>
    );
  }

  const meta = getSubjectMetadata(parsed.subject);
  const subjectLabel = meta?.shortName ?? parsed.subject;
  const sectionLabel = parsed.section
    ? SECTION_LABELS[parsed.section]
    : undefined;

  return (
    <>
      <span className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
        {subjectLabel}
      </span>
      {sectionLabel && (
        <>
          <span className="text-gray-300 dark:text-gray-600 flex-shrink-0">
            ·
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {sectionLabel}
          </span>
        </>
      )}
    </>
  );
}
