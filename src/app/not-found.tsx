import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-[var(--nourish-cream)] flex flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--nourish-green)]/10">
        <UtensilsCrossed
          size={28}
          className="text-[var(--nourish-green)]"
          strokeWidth={1.8}
        />
      </div>
      <div className="space-y-1.5">
        <h2 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
          Page not found
        </h2>
        <p className="text-sm text-[var(--nourish-subtext)] max-w-xs">
          That page doesn&apos;t exist. Head back to Today to keep cooking.
        </p>
      </div>
      <Link
        href="/today"
        className="rounded-xl bg-[var(--nourish-green)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--nourish-dark-green)]"
      >
        Back to Today
      </Link>
    </div>
  );
}
