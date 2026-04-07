"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CookError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Sous] Cook error:", error);
  }, [error]);

  const router = useRouter();

  return (
    <div className="min-h-full bg-[var(--nourish-cream)] flex flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="text-4xl">🍳</div>
      <div className="space-y-1.5">
        <h2 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
          Couldn&apos;t load recipe
        </h2>
        <p className="text-sm text-[var(--nourish-subtext)] max-w-xs">
          Something went wrong loading this recipe. Try again or pick a
          different dish.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-[var(--nourish-dark)] shadow-sm"
          type="button"
        >
          Try again
        </button>
        <button
          onClick={() => router.push("/")}
          className="rounded-xl bg-[var(--nourish-green)] px-5 py-2.5 text-sm font-medium text-white shadow-sm"
          type="button"
        >
          Back to Today
        </button>
      </div>
    </div>
  );
}
