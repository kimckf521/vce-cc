export default function TopicLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-20 bg-gray-200 rounded mb-6" />
      <div className="h-8 w-64 bg-gray-200 rounded-lg mb-1" />
      <div className="h-4 w-32 bg-gray-100 rounded mb-8" />
      <div className="h-10 w-full bg-gray-100 rounded-xl mb-6" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl bg-white border border-gray-100 p-6 space-y-3">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="h-5 w-48 bg-gray-200 rounded" />
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-gray-100 rounded-full" />
                  <div className="h-6 w-16 bg-gray-100 rounded-full" />
                </div>
              </div>
              <div className="flex gap-1">
                <div className="h-6 w-6 bg-gray-100 rounded" />
                <div className="h-6 w-6 bg-gray-100 rounded" />
                <div className="h-6 w-6 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="h-16 w-full bg-gray-50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
