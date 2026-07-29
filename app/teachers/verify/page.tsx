import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";
import MarketingNav from "@/components/MarketingNav";

export const dynamic = "force-dynamic";

// One-time verification link target — never index.
export const metadata: Metadata = {
  title: "Verify your email",
  robots: { index: false, follow: false },
};

const ADMIN_NOTIFY_EMAIL = "support@atarhero.com.au";

type VerifyOutcome = "verified" | "already" | "invalid";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

/**
 * GET /teachers/verify?token=… — clicked from the verification email.
 * PENDING_EMAIL → PENDING_REVIEW (+ notify the admin inbox that a review is
 * waiting). Idempotent: a second click lands on "already verified".
 */
export default async function TeacherVerifyPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  let outcome: VerifyOutcome = "invalid";
  if (token && token.length >= 16) {
    const application = await prisma.teacherApplication.findUnique({
      where: { emailToken: token },
      select: { id: true, status: true, fullName: true, applicantType: true, vitNumber: true, schoolName: true, schoolEmail: true, domainTier: true, nameMatch: true, gradYearFlag: true },
    });
    if (application) {
      if (application.status === "PENDING_EMAIL") {
        await prisma.teacherApplication.update({
          where: { id: application.id },
          data: { status: "PENDING_REVIEW", emailVerifiedAt: new Date() },
        });
        outcome = "verified";
        // Best-effort heads-up to the founder that the queue has work.
        void sendEmail({
          to: ADMIN_NOTIFY_EMAIL,
          subject: `[ATAR Hero] Teacher application awaiting review — ${application.fullName}`,
          text: [
            `A teacher application just verified its email and is awaiting review.`,
            ``,
            `Name: ${application.fullName}`,
            `Type: ${application.applicantType}`,
            `School: ${application.schoolName ?? "(private tutor)"}`,
            `Email: ${application.schoolEmail} (tier: ${application.domainTier}, name match: ${application.nameMatch ? "yes" : "no"}${application.gradYearFlag ? ", GRAD-YEAR FLAG" : ""})`,
            `VIT number: ${application.vitNumber}`,
            ``,
            `Review: ${SITE_URL}/admin/teacher-applications`,
          ].join("\n"),
        }).catch((err) => console.error("[teachers/verify] admin notify failed:", err));
      } else if (application.status === "PENDING_REVIEW" || application.status === "APPROVED") {
        outcome = "already";
      }
    }
  }

  const card =
    outcome === "verified"
      ? {
          icon: <CheckCircle className="h-12 w-12 text-green-500" />,
          title: "Email confirmed — you're in the queue",
          body: "Our team now reviews your application against the VIT register, usually within one school day. We'll email you the moment it's approved.",
        }
      : outcome === "already"
        ? {
            icon: <Clock className="h-12 w-12 text-brand-500" />,
            title: "Already confirmed",
            body: "This email address is already verified. Your application is with our review team — no further action needed.",
          }
        : {
            icon: <XCircle className="h-12 w-12 text-red-500" />,
            title: "This link isn't valid",
            body: "The verification link is invalid or has been replaced by a newer application. Please submit the application form again to receive a fresh link.",
          };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MarketingNav />
      <main className="mx-auto max-w-lg px-4 py-16 sm:py-24 text-center">
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 sm:p-10 shadow-sm">
          <div className="flex justify-center mb-4">{card.icon}</div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {card.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{card.body}</p>
          <Link
            href={outcome === "invalid" ? "/teachers/apply" : "/dashboard"}
            className="mt-6 inline-flex rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            {outcome === "invalid" ? "Back to the application" : "Go to dashboard"}
          </Link>
        </div>
      </main>
    </div>
  );
}
