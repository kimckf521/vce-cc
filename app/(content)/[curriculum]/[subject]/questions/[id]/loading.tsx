export default function QuestionLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="flex gap-2">
              <div className="h-6 w-24 bg-gray-100 dark:bg-gray-800 rounded-full" />
              <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded-full" />
            </div>
          </div>
        </div>
        <div className="h-24 w-full bg-gray-50 dark:bg-gray-800 rounded" />
        <div className="h-10 w-40 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>
    </div>
  );
}
