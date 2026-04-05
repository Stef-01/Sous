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
 * Phase Indicator — visual progress through Mission → Grab → Cook → Win.
 * Shows four circles, filled up to and including the current phase.
 */
export function PhaseIndicator({ currentPhase }: PhaseIndicatorProps) {
  const currentIndex = PHASES.findIndex((p) => p.id === currentPhase);

  return (
    <div className="flex items-center gap-1.5">
      <span className="mr-1 text-sm font-medium text-[var(--nourish-dark)] capitalize">
        {currentPhase}
      </span>
      {PHASES.map((phase, idx) => (
        <div
          key={phase.id}
          className={cn(
            "h-2.5 w-2.5 rounded-full transition-colors duration-300",
            idx <= currentIndex
              ? "bg-[var(--nourish-green)]"
              : "bg-neutral-200"
          )}
          aria-label={`${phase.label}: ${idx <= currentIndex ? "complete" : "upcoming"}`}
        />
      ))}
    </div>
  );
}
