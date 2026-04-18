export default function Loading() {
  return (
    <div className="min-h-screen bg-[#050b16] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14 animate-pulse">
        <div className="h-64 rounded-[2rem] bg-white/5 mb-10" />
        <div className="flex items-end justify-between mb-8">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-white/10 rounded" />
            <div className="h-10 w-64 bg-white/10 rounded" />
          </div>
          <div className="h-4 w-32 bg-white/10 rounded" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 rounded-[1.75rem] bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
