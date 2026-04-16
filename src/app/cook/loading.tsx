export default function CookLoading() {
  return (
    <div className="min-h-full bg-[var(--nourish-cream)]">
      {/* Header skeleton */}
      <header className="app-header px-4 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="h-8 w-8 rounded-lg shimmer" />
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-2 w-2 rounded-full shimmer" />
            ))}
          </div>
          <div className="w-8" />
        </div>
      </header>

      {/* Content skeleton — mission screen shape */}
      <main className="mx-auto max-w-md px-4 py-6 space-y-6">
        {/* Hero image */}
        <div className="w-full aspect-[4/3] rounded-2xl shimmer" />

        {/* Title + meta */}
        <div className="space-y-3">
          <div className="h-6 w-48 rounded shimmer" />
          <div className="flex gap-3">
            <div className="h-4 w-16 rounded shimmer" />
            <div className="h-4 w-16 rounded shimmer" />
            <div className="h-4 w-16 rounded shimmer" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded shimmer" />
            <div className="h-3 w-4/5 rounded shimmer" />
          </div>
        </div>

        {/* CTA button */}
        <div className="h-12 w-full rounded-xl shimmer" />
      </main>
    </div>
  );
}
