import { FOOD_FIRST_HEDGE } from "@/lib/therapeutics/claim-contract";
import { cn } from "@/lib/utils/cn";

/**
 * Phase 1 — the ambient honesty chip. Renders the single `FOOD_FIRST_HEDGE`
 * constant as a persistent, low-emphasis (NOT green — it's a caveat) pill, so the
 * food-first hedge stays visible at a glance even after the clinical evidence
 * collapses behind a tap. Single source of truth; copy can't drift.
 */
export function HonestyChip({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "rounded-full bg-neutral-100 px-3 py-1 text-[10.5px] leading-snug text-[var(--nourish-subtext)]",
        className,
      )}
    >
      {FOOD_FIRST_HEDGE}
    </p>
  );
}
