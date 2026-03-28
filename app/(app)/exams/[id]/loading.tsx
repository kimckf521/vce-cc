export default function ExamLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-24 bg-gray-200 rounded mb-6" />
      <div className="h-8 w-72 bg-gray-200 rounded-lg mb-1" />
      <div className="h-4 w-48 bg-gray-100 rounded mb-8" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-2xl bg-white border border-gray-100 p-6 space-y-3">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="h-5 w-40 bg-gray-200 rounded" />
                <div className="flex gap-2">
                  <div className="h-6 w-24 bg-gray-100 rounded-full" />
                  <div className="h-6 w-16 bg-gray-100 rounded-full" />
                </div>
              </div>
            </div>
            <div className="h-12 w-full bg-gray-50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
