"use client";

export default function CookError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--nourish-cream)] px-4 text-center">
      <p className="text-sm text-[var(--nourish-subtext)]">
        Couldn&apos;t load this cook. Try a different dish.
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-[var(--nourish-green)] px-5 py-2.5 text-sm font-medium text-white"
      >
        Try again
      </button>
    </div>
  );
}
