import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-[var(--nourish-cream)] flex flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="text-4xl">🥄</div>
      <div className="space-y-1.5">
        <h2 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
          Page not found
        </h2>
        <p className="text-sm text-[var(--nourish-subtext)] max-w-xs">
          That page doesn&apos;t exist. Head back to Today to keep cooking.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-xl bg-[var(--nourish-green)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--nourish-dark-green)]"
      >
        Back to Today
      </Link>
    </div>
  );
}
