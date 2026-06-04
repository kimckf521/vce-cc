export default function ExamsListLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2" />
      <div className="h-4 w-80 bg-gray-100 dark:bg-gray-800 rounded mb-8" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 space-y-3"
          >
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
