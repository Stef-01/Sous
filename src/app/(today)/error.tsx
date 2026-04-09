"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TodayError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  useEffect(() => {
    console.error("[Sous] Today error:", error);
  }, [error]);

  return (
    <div className="min-h-full flex flex-col items-center justify-center gap-5 px-6 text-center bg-[var(--nourish-cream)]">
      <span className="text-4xl">😕</span>
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-[var(--nourish-dark)]">
          Something went wrong
        </p>
        <p className="text-xs text-[var(--nourish-subtext)] max-w-[240px]">
          {error.message || "An unexpected error occurred."}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-[var(--nourish-green)] px-5 py-2.5 text-sm font-semibold text-white"
          type="button"
        >
          Try again
        </button>
        <button
          onClick={() => router.push("/")}
          className="rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-medium text-[var(--nourish-subtext)]"
          type="button"
        >
          Back to Today
        </button>
      </div>
    </div>
  );
}
