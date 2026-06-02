import { canAccessPaidPractice } from "@/lib/practice-gate";
import { getSubjectMetadata } from "@/lib/subject-context";
import PaywallScreen from "@/components/PaywallScreen";

/**
 * Gate the per-subject Practice history behind the VCE Maths plan. Admins and
 * active subscribers pass (`canAccessPaidPractice` covers both); free users get
 * the History paywall. Living at the layout level means the session list AND
 * the `/[id]` session review share one check, so neither can be reached by
 * deep-linking. Mirrors the global `/history` gate (app/(app)/history/layout.tsx)
 * and the sibling Bookmark gate.
 */
export default async function SubjectHistoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ curriculum: string; subject: string }>;
}) {
  const { curriculum, subject } = await params;

  const hasPaid = await canAccessPaidPractice();
  if (!hasPaid) {
    return (
      <PaywallScreen
        feature="history"
        backHref={`/${curriculum}/${subject}/topics`}
        backLabel={`Back to ${getSubjectMetadata(subject)?.shortName ?? subject} topics`}
      />
    );
  }

  return <>{children}</>;
}
