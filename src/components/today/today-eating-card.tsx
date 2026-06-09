"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { NutritionRingCard } from "@/components/shared/nutrition-ring-card";
import { useNutritionDiary } from "@/lib/hooks/use-nutrition-diary";

/**
 * Phase 4 — "your plate today" on the screen users open daily. Quiet + conditional:
 * renders nothing until something is logged (the empty state is the first-run
 * invitation, owned elsewhere). Once logged, a compact ring + the count + a
 * tap-through to the editable diary. Zero new fetch — `dayNutrition` is already
 * memoised on the diary hook. Today = today's plate (live); Path = the longer arc.
 */
export function TodayEatingCard() {
  const { mounted, entries, dayNutrition } = useNutritionDiary();
  if (!mounted || entries.length === 0 || !dayNutrition) return null;

  return (
    <Link
      href="/path/diary"
      aria-label="Open today's diary"
      className="block rounded-2xl border border-[var(--nourish-border)] bg-white/70 p-4 transition-colors hover:bg-white"
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="sous-label">Your plate today</p>
        <span className="inline-flex items-center gap-0.5 text-[12px] font-medium text-[var(--nourish-subtext)]">
          {entries.length} logged
          <ChevronRight size={14} aria-hidden />
        </span>
      </div>
      <NutritionRingCard nutrition={dayNutrition} compact />
    </Link>
  );
}
