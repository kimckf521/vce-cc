export default function SessionLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-4 w-28 bg-gray-200 rounded mb-4" />
        <div className="h-8 w-64 bg-gray-200 rounded-lg" />
        <div className="h-4 w-40 bg-gray-100 rounded mt-1" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl bg-white border border-gray-100 p-6 space-y-3">
            <div className="h-5 w-48 bg-gray-200 rounded" />
            <div className="h-16 w-full bg-gray-50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
