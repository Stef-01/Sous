"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  fallbackHref?: string;
  label?: string;
}

/**
 * BackLink — thin shared back-nav for Content detail pages.
 * Falls back to /community when there is no router history.
 */
export function BackLink({
  fallbackHref = "/community",
  label = "Back",
}: Props) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }}
      className="inline-flex items-center gap-1.5 text-sm text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)] transition-colors active:scale-95"
      aria-label={label}
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}
