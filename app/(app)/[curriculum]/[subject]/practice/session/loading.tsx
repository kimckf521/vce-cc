export default function SessionLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-4 w-40 bg-gray-100 dark:bg-gray-800 rounded mt-1" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 space-y-3">
            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-16 w-full bg-gray-50 dark:bg-gray-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
