"use client";

import { useState } from "react";
import { Activity } from "lucide-react";
import {
  estimateGlycemicLoad,
  type GlycemicBand,
} from "@/lib/nutrition/glycemic";
import type { PerServingNutrition } from "@/types/nutrition";
import { cn } from "@/lib/utils/cn";

const BAND: Record<GlycemicBand, { label: string; cls: string }> = {
  low: {
    label: "Low",
    cls: "bg-[var(--nourish-green)]/12 text-[var(--nourish-green)]",
  },
  medium: { label: "Medium", cls: "bg-amber-100 text-amber-700" },
  high: { label: "High", cls: "bg-orange-100 text-orange-700" },
};

/**
 * GlycemicPill (W28) — a soft, clearly-ESTIMATED glycemic-load pill. One icon +
 * short label; the rough-estimate caveat is behind a tap (rule 13). Renders
 * nothing without carb data. Never a measured GI/GL or medical claim.
 */
export function GlycemicPill({
  nutrition,
}: {
  nutrition: PerServingNutrition;
}) {
  const [open, setOpen] = useState(false);
  const est = estimateGlycemicLoad(nutrition);
  if (!est) return null;
  const b = BAND[est.band];

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`Estimated glycemic load: ${b.label}. Tap for details.`}
        className="inline-flex items-center gap-1.5 rounded-full bg-neutral-50 py-1 pl-2 pr-2.5 text-[11px] font-medium text-[var(--nourish-subtext)] transition-colors hover:bg-neutral-100"
      >
        <Activity
          size={12}
          className="text-[var(--nourish-subtext)]"
          aria-hidden
        />
        Glycemic load
        <span className={cn("rounded-full px-1.5 py-0.5", b.cls)}>
          {b.label}
        </span>
        <span className="text-[var(--nourish-subtext-faint)]">est.</span>
      </button>
      {open && (
        <p className="mt-1.5 text-[11px] leading-snug text-[var(--nourish-subtext)]">
          A rough estimate from the carbs and fibre here (load ≈ {est.gl}).
          Lower means a gentler effect on blood sugar. It&apos;s a guide from
          the macros, not a measured GI or a medical figure.
        </p>
      )}
    </div>
  );
}
