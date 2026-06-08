"use client";

import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * QuestFilterButton (Today Filter — Phase C) — the single entry that replaces
 * the old cook-time + cuisine pills. Shows "Filter · N" with a filled state when
 * any facet is active.
 */
export function QuestFilterButton({
  activeCount,
  onClick,
}: {
  activeCount: number;
  onClick: () => void;
}) {
  const active = activeCount > 0;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? `Filters — ${activeCount} active` : "Filters"}
      aria-haspopup="dialog"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors active:scale-95",
        active
          ? "bg-[var(--nourish-green)] text-white"
          : "border border-[var(--nourish-border-strong)] bg-white text-[var(--nourish-dark)] hover:bg-neutral-50",
      )}
    >
      <SlidersHorizontal size={14} aria-hidden />
      Filter{active ? ` · ${activeCount}` : ""}
    </button>
  );
}
