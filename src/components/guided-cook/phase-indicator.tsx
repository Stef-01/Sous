"use client";

import { cn } from "@/lib/utils/cn";

type Phase = "mission" | "grab" | "cook" | "win";

const PHASES: { id: Phase; label: string }[] = [
  { id: "mission", label: "Mission" },
  { id: "grab", label: "Grab" },
  { id: "cook", label: "Cook" },
  { id: "win", label: "Win" },
];

interface PhaseIndicatorProps {
  currentPhase: Phase;
}

/**
 * Phase Indicator  -  visual progress through Mission → Grab → Cook → Win.
 * Just dots, no word: four small pips with the current phase elongated into a
 * subtle "you are here" pill. The phase name lives in the aria-label so the
 * header stays nearly weightless (rule 6 / rule 13).
 */
export function PhaseIndicator({ currentPhase }: PhaseIndicatorProps) {
  const currentIndex = PHASES.findIndex((p) => p.id === currentPhase);

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`${PHASES[currentIndex]?.label ?? currentPhase} — step ${currentIndex + 1} of ${PHASES.length}`}
    >
      {PHASES.map((phase, idx) => (
        <div
          key={phase.id}
          aria-hidden
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            idx === currentIndex
              ? "w-3.5 bg-[var(--nourish-green)]"
              : idx < currentIndex
                ? "w-1.5 bg-[var(--nourish-green)]"
                : "w-1.5 bg-neutral-200",
          )}
        />
      ))}
    </div>
  );
}
