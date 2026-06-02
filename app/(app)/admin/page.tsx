import { redirect } from "next/navigation";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import {
  ArrowRight,
  CirclePlus,
  CreditCard,
  FilePlus2,
  FileText,
  FlaskConical,
  Gift,
  HelpCircle,
  ImageIcon,
  ScrollText,
  Settings2,
  Sparkles,
  Star,
  Tags,
  Users,
  Webhook,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole, roleLabel } from "@/lib/utils";
import { SUBJECTS, getDbSubjectSlug } from "@/lib/subject-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;
type Accent = "brand" | "emerald" | "violet" | "amber";

interface QuickAction {
  href: string;
  icon: IconComponent;
  title: string;
  description: string;
  accent: Accent;
  superAdminOnly?: boolean;
}

interface QuickActionGroup {
  heading: string;
  description?: string;
  accent: Accent;
  items: QuickAction[];
}

// ─── Quick actions, grouped by purpose ────────────────────────────────────────
// Each group gets its own heading so admins can find what they want in seconds.

const QUICK_ACTION_GROUPS: QuickActionGroup[] = [
  {
    heading: "Content management",
    description: "Build the syllabus, paper bank, and AI-generated question sets.",
    accent: "brand",
    items: [
      {
        href: "/admin/question-sets",
        icon: Star,
        title: "Question sets & default",
        description: "Pick which set serves the Practice page; flip the default with one click.",
        accent: "brand",
      },
      {
        href: "/admin/exams/new",
        icon: FilePlus2,
        title: "Add exam",
        description: "Upload a new past paper and attach its PDF.",
        accent: "brand",
      },
      {
        href: "/admin/questions/new",
        icon: CirclePlus,
        title: "Add question",
        description: "Add a question with topic, marks, and solution.",
        accent: "brand",
      },
      {
        href: "/admin/topics",
        icon: Tags,
        title: "Manage topics",
        description: "Add or edit topics and subtopics for each subject.",
        accent: "brand",
      },
    ],
  },
  {
    heading: "Billing & plans",
    description: "Stripe configuration, plan catalog, and webhook health.",
    accent: "emerald",
    items: [
      {
        href: "/admin/plans",
        icon: CreditCard,
        title: "Plans",
        description: "Read-only view of PRICE_CATALOG and which subjects each plan unlocks.",
        accent: "emerald",
      },
      {
        href: "/admin/billing-config",
        icon: Settings2,
        title: "Billing config",
        description: "Live diagnostic of Stripe env vars + price verification.",
        accent: "emerald",
      },
      {
        href: "/admin/webhooks",
        icon: Webhook,
        title: "Webhooks",
        description: "Recent Stripe webhook deliveries with status + error detail.",
        accent: "emerald",
      },
    ],
  },
  {
    heading: "Operations",
    description: "Audit trail and uploaded extraction artifacts.",
    accent: "violet",
    items: [
      {
        href: "/admin/audit",
        icon: ScrollText,
        title: "Audit log",
        description: "Recent admin actions — role changes, deletions, credits.",
        accent: "violet",
      },
      {
        href: "/admin/extraction",
        icon: ImageIcon,
        title: "Extraction Storage",
        description: "View and manage uploaded extraction images.",
        accent: "violet",
      },
    ],
  },
  {
    heading: "Developer tools",
    description: "Destructive seed / reset utilities — Super Admin only.",
    accent: "amber",
    items: [
      {
        href: "/admin/testing",
        icon: FlaskConical,
        title: "Testing",
        description: "Seed or clear test data for development.",
        accent: "amber",
        superAdminOnly: true,
      },
    ],
  },
];

// Tailwind class strings per accent. Centralised so the look stays consistent
// even when new actions are added.
const ACCENT_CLASSES: Record<Accent, {
  icon: string;
  iconBg: string;
  hoverBorder: string;
  ring: string;
}> = {
  brand: {
    icon: "text-brand-600 dark:text-brand-400",
    iconBg: "bg-brand-50 dark:bg-brand-950",
    hoverBorder: "hover:border-brand-300 dark:hover:border-brand-700",
    ring: "focus-visible:ring-brand-500",
  },
  emerald: {
    icon: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-950",
    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700",
    ring: "focus-visible:ring-emerald-500",
  },
  violet: {
    icon: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-50 dark:bg-violet-950",
    hoverBorder: "hover:border-violet-300 dark:hover:border-violet-700",
    ring: "focus-visible:ring-violet-500",
  },
  amber: {
    icon: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-50 dark:bg-amber-950",
    hoverBorder: "hover:border-amber-300 dark:hover:border-amber-700",
    ring: "focus-visible:ring-amber-500",
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!isAdminRole(dbUser?.role)) redirect("/dashboard");

  const isSuperAdmin = dbUser?.role === "SUPER_ADMIN";
  // Dev tools only render in dev OR for super admins.
  const showDevTools =
    process.env.NODE_ENV === "development" || isSuperAdmin;

  const [
    examCount,
    examQuestionCount,
    setItemCount,
    userCount,
    affiliateCount,
    questionSetCount,
    examBySubject,
    questionBySubject,
    setItemByTopicSubject,
    subjects,
  ] = await Promise.all([
    prisma.exam.count(),
    prisma.question.count(),
    prisma.questionSetItem.count(),
    prisma.user.count(),
    prisma.affiliate.count(),
    prisma.questionSet.count(),
    prisma.exam.groupBy({ by: ["subjectId"], _count: true }),
    prisma.question.groupBy({ by: ["subjectId"], _count: true }),
    prisma.questionSetItem.findMany({ select: { topic: { select: { subjectId: true } } } }),
    prisma.subject.findMany({ select: { id: true, slug: true } }),
  ]);
  const totalQuestionCount = examQuestionCount + setItemCount;

  // Build per-subject lookup: db-slug → { exams, examQuestions, setItems }
  const subjectIdToDbSlug = new Map(subjects.map((s) => [s.id, s.slug]));
  type Bucket = { exams: number; examQuestions: number; setItems: number };
  const bySubject = new Map<string, Bucket>();
  const getBucket = (dbSlug: string): Bucket => {
    let b = bySubject.get(dbSlug);
    if (!b) {
      b = { exams: 0, examQuestions: 0, setItems: 0 };
      bySubject.set(dbSlug, b);
    }
    return b;
  };
  for (const row of examBySubject) {
    const slug = row.subjectId ? subjectIdToDbSlug.get(row.subjectId) : null;
    if (slug) getBucket(slug).exams = row._count;
  }
  for (const row of questionBySubject) {
    const slug = row.subjectId ? subjectIdToDbSlug.get(row.subjectId) : null;
    if (slug) getBucket(slug).examQuestions = row._count;
  }
  for (const item of setItemByTopicSubject) {
    const slug = item.topic.subjectId ? subjectIdToDbSlug.get(item.topic.subjectId) : null;
    if (slug) getBucket(slug).setItems += 1;
  }

  const greetingName =
    dbUser?.name?.trim() ||
    user.email?.split("@")[0] ||
    "Admin";

  const stats: {
    label: string;
    value: number;
    subLabel?: string;
    icon: IconComponent;
    href: string;
  }[] = [
    { label: "Exams", value: examCount, icon: FileText, href: "/admin/exams" },
    {
      label: "Questions",
      value: totalQuestionCount,
      subLabel: `${examQuestionCount.toLocaleString()} from papers · ${setItemCount.toLocaleString()} in sets`,
      icon: HelpCircle,
      href: "/admin/questions",
    },
    { label: "Question sets", value: questionSetCount, icon: Star, href: "/admin/question-sets" },
    { label: "Users", value: userCount, icon: Users, href: "/admin/users" },
    { label: "Affiliates", value: affiliateCount, icon: Gift, href: "/admin/affiliates" },
  ];

  return (
    <div>
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          Admin
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400">
          Welcome back, <span className="font-medium text-gray-900 dark:text-gray-100">{greetingName}</span>
          <span className="text-gray-400 dark:text-gray-500"> · {roleLabel(dbUser?.role)}</span>
        </p>
      </header>

      {/* Per-subject content overview — promoted to the top because content gaps
          drive the most common admin decisions. */}
      <section aria-labelledby="by-subject-heading" className="mb-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2
            id="by-subject-heading"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            By subject
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
            Click a card to see its question library
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUBJECTS.map((subject) => {
            const bucket = bySubject.get(getDbSubjectSlug(subject.urlSlug)) ?? {
              exams: 0,
              examQuestions: 0,
              setItems: 0,
            };
            const totalQs = bucket.examQuestions + bucket.setItems;
            const isEmpty = totalQs === 0;
            return (
              <Link
                key={subject.urlSlug}
                href={`/admin/questions?subject=${subject.urlSlug}`}
                className="group rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 lg:p-6 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-950"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${subject.colors.badge}`}
                  >
                    {subject.badge}
                  </span>
                  <p className={`text-sm font-semibold ${subject.colors.text}`}>
                    {subject.shortName}
                  </p>
                </div>
                <p
                  className={`text-2xl font-bold ${
                    isEmpty
                      ? "text-gray-400 dark:text-gray-600"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {totalQs.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    {" "}questions
                  </span>
                </p>
                {isEmpty ? (
                  <p className="text-xs text-brand-600 dark:text-brand-400 mt-1 font-medium inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
                    Generate questions
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {bucket.exams.toLocaleString()} papers ·{" "}
                    {bucket.examQuestions.toLocaleString()} paper qs ·{" "}
                    {bucket.setItems.toLocaleString()} set items
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Global stats — read-only at-a-glance numbers, lighter visual treatment. */}
      <section aria-labelledby="global-stats-heading" className="mb-12">
        <h2
          id="global-stats-heading"
          className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4"
        >
          Platform totals
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {stats.map(({ label, value, subLabel, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              className="group rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-950"
            >
              <div className="flex items-start justify-between mb-2">
                <Icon className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-brand-500 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                {value.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {label}
              </p>
              {subLabel && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 leading-tight">
                  {subLabel}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Quick actions — grouped by purpose so admins can scan to the right
          section first, then choose the specific tool. */}
      <section aria-labelledby="actions-heading">
        <h2
          id="actions-heading"
          className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4"
        >
          Quick actions
        </h2>

        <div className="space-y-8">
          {QUICK_ACTION_GROUPS.map((group) => {
            // Strip super-admin-only items for non-super admins.
            const visibleItems = group.items.filter(
              (item) => !item.superAdminOnly || showDevTools,
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.heading}>
                <div className="flex items-baseline gap-3 mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                    {group.heading}
                  </h3>
                  {group.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                      {group.description}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                  {visibleItems.map((action) => (
                    <QuickActionCard key={action.href} action={action} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {!showDevTools && (
          <p className="mt-8 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            More tools available to super admins
          </p>
        )}
      </section>
    </div>
  );
}

// ─── Components ───────────────────────────────────────────────────────────────

function QuickActionCard({ action }: { action: QuickAction }) {
  const Icon = action.icon;
  const accent = ACCENT_CLASSES[action.accent];
  return (
    <Link
      href={action.href}
      className={`group rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 transition-all ${accent.hoverBorder} hover:shadow-md focus-visible:outline-none focus-visible:ring-2 ${accent.ring} focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-950`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent.iconBg}`}>
          <Icon className={`h-4 w-4 ${accent.icon}`} />
        </div>
        <ArrowRight
          className={`h-4 w-4 text-gray-300 dark:text-gray-600 transition-all group-hover:translate-x-0.5 ${accent.icon.replace("text-", "group-hover:text-")}`}
        />
      </div>
      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
        {action.title}
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
        {action.description}
      </p>
    </Link>
  );
}
