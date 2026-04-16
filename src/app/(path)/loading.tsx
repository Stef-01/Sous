export default function PathLoading() {
  return (
    <div className="min-h-screen bg-[var(--nourish-cream)]">
      {/* Header skeleton */}
      <header className="app-header px-4 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="h-5 w-20 rounded shimmer" />
          <div className="flex gap-3">
            <div className="h-7 w-14 rounded-full shimmer" />
            <div className="h-7 w-14 rounded-full shimmer" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-5 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-neutral-100 bg-white p-4 space-y-2"
            >
              <div className="h-6 w-10 rounded shimmer" />
              <div className="h-3 w-16 rounded shimmer" />
            </div>
          ))}
        </div>

        {/* Next unlock card */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-4 flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded shimmer" />
            <div className="h-2.5 w-full rounded-full shimmer" />
          </div>
        </div>

        {/* Skill tree placeholder */}
        <div className="space-y-3">
          <div className="h-4 w-24 rounded shimmer" />
          <div className="flex flex-wrap gap-4 justify-center py-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 w-16 rounded-full shimmer" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
