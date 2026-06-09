"use client";

import { ChevronRight } from "lucide-react";
import { MadeItRing } from "@/components/shared/made-it-ring";
import type { PlateEvaluation } from "@/lib/engine/plate-evaluation";
import { cn } from "@/lib/utils/cn";

/**
 * Phase 6 — the live "your plate" ring on the result stack. Reuses MadeItRing
 * (count = food groups covered 0..3, target 3) + the honest appraisal sentence,
 * coloured by tone. Re-renders instantly as sides are selected/rerolled. Tapping
 * opens the existing EvaluateSheet.
 *
 * HONESTY (binding R3): this encodes a 0/1/2/3 food-group COUNT (an arc, never a
 * number or letter) + the claim-safe appraisal SENTENCE — never a grade/percentage.
 * It answers "is my plate balanced?" (food-group coverage); the Info Sous-read
 * answers "what is this dish made of?" — deliberately different questions.
 */
export function PlateRing({
  evaluation,
  onOpen,
}: {
  evaluation: PlateEvaluation;
  onOpen: () => void;
}) {
  const c = evaluation.categoryCoverage;
  const covered = [c.vegetables, c.protein, c.carbs].filter(Boolean).length;
  const tone =
    evaluation.appraisalTone === "balanced" ||
    evaluation.appraisalTone === "strong"
      ? "text-[var(--nourish-green)]"
      : evaluation.appraisalTone === "needs-work"
        ? "text-amber-600"
        : "text-[var(--nourish-subtext)]";

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Your plate covers ${covered} of 3 food groups. Tap for detail.`}
      className="flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-left transition-colors hover:border-[var(--nourish-green)]/40"
    >
      <MadeItRing
        count={covered}
        target={3}
        size={40}
        ariaLabel={`${covered} of 3 food groups covered`}
      />
      <div className="min-w-0 flex-1">
        <p className="sous-label">Your plate</p>
        <p className={cn("truncate text-[13px] font-medium", tone)}>
          {evaluation.appraisal}
        </p>
      </div>
      <ChevronRight
        size={16}
        className="shrink-0 text-[var(--nourish-subtext)]"
        aria-hidden
      />
    </button>
  );
}
