import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  isKnownSubject,
  getUrlSubjectSlug,
  DEFAULT_SUBJECT_SLUG,
  type SubjectSlug,
} from "@/lib/subject-context";
import OnboardingForm from "./OnboardingForm";
import Celebration from "./Celebration";

const STUDYING_COOKIE = "vce_studying";

// Don't index either welcome state — the celebration leaks Stripe's
// session_id and the onboarding form is only meaningful when logged in.
export const metadata: Metadata = {
  title: "Welcome to ATAR Hero",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

/**
 * Welcome page — single route, two states:
 *   - ?session_id present  → Stripe checkout celebration page
 *   - no session_id        → first-signup onboarding form
 *
 * Bounces unauthenticated users to /login (the celebration carries Supabase
 * auth via cookie so this is rare for paid users).
 */
export default async function WelcomePage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, referredByCode: true },
  });

  const { session_id } = await searchParams;

  if (session_id) {
    return <Celebration displayName={dbUser?.name ?? null} />;
  }

  // Pre-fill subject selection so returning users don't get reset to Methods.
  // Priority: (1) vce_studying cookie set by previous onboarding submission,
  // (2) PAID enrolments (subjects they've actually committed to), (3) Methods
  // as a sensible default for brand-new users.
  const initialSelectedSubjects = await resolveInitialSubjects(user.id);

  return (
    <OnboardingForm
      displayName={dbUser?.name ?? null}
      isReferred={Boolean(dbUser?.referredByCode)}
      initialSelectedSubjects={initialSelectedSubjects}
    />
  );
}

async function resolveInitialSubjects(userId: string): Promise<SubjectSlug[]> {
  const store = await cookies();
  const cookieValue = store.get(STUDYING_COOKIE)?.value;
  if (cookieValue) {
    const fromCookie = cookieValue
      .split(",")
      .map((s) => s.trim())
      .filter((s): s is SubjectSlug => isKnownSubject(s));
    if (fromCookie.length > 0) return fromCookie;
  }

  const paidEnrolments = await prisma.subjectEnrolment.findMany({
    where: { userId, tier: "PAID" },
    select: { subject: { select: { slug: true } } },
  });
  const fromPaid = paidEnrolments
    .map((e) => getUrlSubjectSlug(e.subject.slug))
    .filter((s): s is SubjectSlug => s !== null);
  if (fromPaid.length > 0) return fromPaid;

  return [DEFAULT_SUBJECT_SLUG];
}
