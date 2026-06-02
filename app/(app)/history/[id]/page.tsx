import HistorySessionReview from "./SessionReview";

/**
 * Global `/history/[id]` route — a thin wrapper around the shared
 * `HistorySessionReview` body. The back link defaults to the global
 * `/history` list. Subject-scoped reviews live at
 * `/[curriculum]/[subject]/history/[id]` and pass their own `backHref`.
 */
export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <HistorySessionReview params={params} />;
}
