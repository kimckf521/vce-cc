export default function AppLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 space-y-3">
            <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 space-y-3">
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
