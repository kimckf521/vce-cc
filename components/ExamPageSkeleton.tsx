/**
 * Loading skeleton for the exam detail page.
 *
 * Lives here, not in a route-level `loading.tsx`. A `loading.tsx` puts its
 * Suspense boundary ABOVE the page component, so Next flushes a 200 shell
 * before the page runs — and every status the page then tries to set degrades:
 * `notFound()` becomes a 200 carrying 404 UI, and `permanentRedirect()` becomes
 * a `<meta http-equiv="refresh">` with no Location header. Measured on this very
 * route: /exams/2099-exam-1 answered 200, leaving an unbounded {year}-exam-{n}
 * URL space indexable, and legacy cuid URLs never sent a real 308.
 *
 * Rendered from a `<Suspense>` INSIDE the page instead, the boundary sits below
 * the guards, so the status is decided first and the heavy body still streams.
 */
export default function ExamPageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
      <div className="h-8 w-72 bg-gray-200 dark:bg-gray-700 rounded-lg mb-1" />
      <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded mb-8" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 space-y-3"
          >
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="flex gap-2">
                  <div className="h-6 w-24 bg-gray-100 dark:bg-gray-800 rounded-full" />
                  <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded-full" />
                </div>
              </div>
            </div>
            <div className="h-12 w-full bg-gray-50 dark:bg-gray-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
