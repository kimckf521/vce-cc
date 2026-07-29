import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, XCircle, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isTeacherRole } from "@/lib/teacher-gate";
import MarketingNav from "@/components/MarketingNav";
import TeacherApplyForm from "@/components/TeacherApplyForm";

export const dynamic = "force-dynamic";

// Application form is account-scoped — never index.
export const metadata: Metadata = {
  title: "Apply for a teacher account",
  robots: { index: false, follow: false },
};

/**
 * /teachers/apply — auth-required application form.
 *   no session          → /login?next=/teachers/apply
 *   already TEACHER/admin → /teacher (nothing to apply for)
 *   live application    → status card instead of the form
 *   REJECTED            → status card + the form again (re-apply)
 */
export default async function TeacherApplyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/teachers/apply");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, name: true },
  });
  if (isTeacherRole(dbUser?.role)) redirect("/teacher");

  const application = await prisma.teacherApplication.findUnique({
    where: { userId: user.id },
    select: { status: true, schoolEmail: true, reviewNote: true },
  });

  const showForm = !application || application.status === "REJECTED";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MarketingNav />
      <main className="mx-auto max-w-xl px-4 py-10 sm:py-14">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Apply for a teacher account
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Free for VIT-registered teachers and private tutors. We verify every
          application against the{" "}
          <a
            href="https://www.vit.vic.edu.au/search-the-register"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-brand-600 dark:hover:text-brand-400"
          >
            VIT register
          </a>
          , usually within one school day.
        </p>

        {application?.status === "PENDING_EMAIL" && (
          <StatusCard
            icon={<MailCheck className="h-8 w-8 text-brand-500" />}
            title="Check your inbox"
            body={`We've sent a verification link to ${application.schoolEmail}. Click it to move your application into review. Wrong address? Submit the form again below.`}
          />
        )}
        {application?.status === "PENDING_REVIEW" && (
          <StatusCard
            icon={<Clock className="h-8 w-8 text-brand-500" />}
            title="Application under review"
            body="Your email is confirmed and our team is reviewing your application against the VIT register. We'll email you as soon as it's approved — usually within one school day."
          />
        )}
        {application?.status === "REJECTED" && (
          <StatusCard
            icon={<XCircle className="h-8 w-8 text-red-500" />}
            title="Your previous application wasn't approved"
            body={
              application.reviewNote
                ? `Reviewer note: ${application.reviewNote}. You can apply again below — double-check your VIT number and name match your registration.`
                : "You can apply again below — double-check your VIT number and name match your VIT registration."
            }
          />
        )}

        {/* PENDING_EMAIL keeps the form visible so a typo'd address can be fixed
            by re-submitting (which regenerates the token + resends the email). */}
        {(showForm || application?.status === "PENDING_EMAIL") && (
          <TeacherApplyForm initialName={dbUser?.name ?? ""} />
        )}

        <p className="mt-8 text-center text-sm text-gray-400 dark:text-gray-500">
          Questions?{" "}
          <Link href="/teachers" className="underline hover:text-brand-600 dark:hover:text-brand-400">
            Learn more about teacher accounts
          </Link>
        </p>
      </main>
    </div>
  );
}

function StatusCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="mb-8 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex gap-4">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{body}</p>
      </div>
    </div>
  );
}
