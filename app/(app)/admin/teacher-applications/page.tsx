import Link from "next/link";
import { ArrowLeft, ExternalLink, GraduationCap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { VIT_REGISTER_URL } from "@/lib/teacher-application";
import TeacherApplicationActions from "@/components/admin/TeacherApplicationActions";

export const dynamic = "force-dynamic";

// Domain-tier presentation for the review queue. STUDENT_DOMAIN is the red
// flag (government student accounts); GOV_STAFF is the strongest signal.
const TIER_BADGE: Record<string, { label: string; className: string }> = {
  GOV_STAFF: {
    label: "Gov staff domain",
    className: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  },
  SCHOOL: {
    label: "School domain",
    className: "bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300",
  },
  STUDENT_DOMAIN: {
    label: "STUDENT domain",
    className: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  },
  PERSONAL: {
    label: "Personal email",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
  OTHER: {
    label: "Other domain",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  },
};

const STATUS_BADGE: Record<string, string> = {
  PENDING_EMAIL: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  PENDING_REVIEW: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

interface PageProps {
  searchParams: Promise<{ view?: string }>;
}

/**
 * /admin/teacher-applications — review queue for teacher/tutor applications.
 * Default view: actionable applications (PENDING_REVIEW first, then
 * PENDING_EMAIL). ?view=all includes decided ones. Auth is enforced by the
 * /admin layout guard.
 */
export default async function TeacherApplicationsPage({ searchParams }: PageProps) {
  const { view } = await searchParams;
  const showAll = view === "all";

  const applications = await prisma.teacherApplication.findMany({
    where: showAll ? {} : { status: { in: ["PENDING_REVIEW", "PENDING_EMAIL"] } },
    include: { user: { select: { email: true, role: true, createdAt: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    take: 100,
  });

  // PENDING_REVIEW (actionable) above PENDING_EMAIL (waiting on applicant).
  const sorted = [...applications].sort((a, b) => {
    const rank = (s: string) =>
      s === "PENDING_REVIEW" ? 0 : s === "PENDING_EMAIL" ? 1 : 2;
    return rank(a.status) - rank(b.status);
  });

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Admin
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-brand-600 dark:text-brand-400" />
          Teacher applications
        </h1>
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/admin/teacher-applications"
            className={!showAll ? "font-semibold text-brand-600 dark:text-brand-400" : "text-gray-500 dark:text-gray-400 hover:underline"}
          >
            Pending
          </Link>
          <span className="text-gray-300 dark:text-gray-700">·</span>
          <Link
            href="/admin/teacher-applications?view=all"
            className={showAll ? "font-semibold text-brand-600 dark:text-brand-400" : "text-gray-500 dark:text-gray-400 hover:underline"}
          >
            All
          </Link>
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Cross-check every applicant against the{" "}
        <a
          href={VIT_REGISTER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-brand-600 dark:hover:text-brand-400"
        >
          VIT register
        </a>{" "}
        (name + registration number must match) before approving.
      </p>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center text-gray-400 dark:text-gray-500">
          No {showAll ? "" : "pending "}applications.
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((app) => {
            const tier = TIER_BADGE[app.domainTier] ?? TIER_BADGE.OTHER;
            return (
              <div
                key={app.id}
                className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {app.fullName}
                      </span>
                      <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                        {app.applicantType === "SCHOOL_TEACHER" ? "School teacher" : "Private tutor"}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[app.status]}`}>
                        {app.status.replace("_", " ")}
                      </span>
                    </div>
                    <dl className="text-sm text-gray-500 dark:text-gray-400 space-y-0.5">
                      {app.schoolName && (
                        <div>
                          <dt className="inline font-medium">School: </dt>
                          <dd className="inline">{app.schoolName}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="inline font-medium">Account: </dt>
                        <dd className="inline">{app.user.email} ({app.user.role})</dd>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <dt className="font-medium">Verify email:</dt>
                        <dd>{app.schoolEmail}</dd>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tier.className}`}>
                          {tier.label}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            app.nameMatch
                              ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {app.nameMatch ? "Name matches email" : "No name match"}
                        </span>
                        {app.gradYearFlag && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/50 dark:text-red-300">
                            Grad-year digits ⚠
                          </span>
                        )}
                      </div>
                      <div>
                        <dt className="inline font-medium">VIT: </dt>
                        <dd className="inline font-mono">{app.vitNumber}</dd>
                        {app.abn && (
                          <>
                            {" · "}
                            <dt className="inline font-medium">ABN: </dt>
                            <dd className="inline font-mono">{app.abn}</dd>
                          </>
                        )}
                      </div>
                      {app.reviewNote && (
                        <div>
                          <dt className="inline font-medium">Note: </dt>
                          <dd className="inline">{app.reviewNote}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {(app.status === "PENDING_REVIEW" || app.status === "PENDING_EMAIL") && (
                    <div className="flex flex-col items-stretch gap-2 w-full sm:w-auto">
                      <a
                        href={VIT_REGISTER_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Check VIT register
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <TeacherApplicationActions applicationId={app.id} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
