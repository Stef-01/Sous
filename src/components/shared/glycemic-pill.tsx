"use client";

import { useState } from "react";
import { Activity } from "lucide-react";
import {
  estimateGlycemicLoad,
  type GlycemicBand,
} from "@/lib/nutrition/glycemic";
import type { PerServingNutrition } from "@/types/nutrition";
// Phase 8 — glycemic load is DIRECTIONAL (low good → high bad), NOT a strength,
// so it is deliberately kept OFF the evidence-tier ramp: rendering "high glycemic"
// in the same amber as "moderate evidence" would conflate a warning with a
// quality. We show a neutral label + a single sage dot only when the load is low.
const BAND_LABEL: Record<GlycemicBand, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
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
  const label = BAND_LABEL[est.band];

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`Estimated glycemic load: ${label}. Tap for details.`}
        className="inline-flex items-center gap-1.5 rounded-full bg-neutral-50 py-1 pl-2 pr-2.5 text-[11px] font-medium text-[var(--nourish-subtext)] transition-colors hover:bg-neutral-100"
      >
        <Activity
          size={12}
          className="text-[var(--nourish-subtext)]"
          aria-hidden
        />
        Glycemic load
        <span className="inline-flex items-center gap-1 font-semibold text-[var(--nourish-dark)]">
          {est.band === "low" && (
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "var(--tier-strong)" }}
              aria-hidden
            />
          )}
          {label}
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
