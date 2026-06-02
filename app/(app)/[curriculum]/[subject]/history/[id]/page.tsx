import HistorySessionReview from "@/app/(app)/history/[id]/SessionReview";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ curriculum: string; subject: string; id: string }>;
}

/**
 * Subject-scoped practice-session review.
 *
 * Reuses the global history-detail page component (which reads only the
 * session `id`) so both URLs render identical content — the only difference is
 * the address. The session list at `/[curriculum]/[subject]/history` links
 * here so review URLs stay inside the subject namespace
 * (`/vce/<subject>/history/<id>`) instead of the legacy global `/history/<id>`.
 */
export default async function SubjectHistoryDetailPage({ params }: PageProps) {
  const { curriculum, subject, id } = await params;
  return (
    <HistorySessionReview
      params={Promise.resolve({ id })}
      backHref={`/${curriculum}/${subject}/history`}
    />
  );
}
