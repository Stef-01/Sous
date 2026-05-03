"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import {
  buildDishProgress,
  type DishProgressInput,
} from "@/lib/cook/dish-progress";

/**
 * DishProgressStrip — dual-track step-progress strip for
 * `/cook/combined`. Shows every dish's progress at a glance so
 * the user sees they're 60% through dish A and 0% through dish
 * B without paging through.
 *
 * W29 from the W28 carry-forward (`/cook/combined` density wave 2,
 * second piece). The strip renders nothing for single-dish
 * sessions — the StepCard's own progress bar already covers
 * that case.
 *
 * Pure-display: takes raw cook-store indices and a list of
 * dishes, computes progress via the `buildDishProgress` helper
 * (unit-tested), and renders one labelled bar per dish.
 */

export interface DishProgressStripProps {
  dishes: ReadonlyArray<DishProgressInput>;
  activeDishIndex: number;
  activeStepIndex: number;
  className?: string;
}

export function DishProgressStrip({
  dishes,
  activeDishIndex,
  activeStepIndex,
  className,
}: DishProgressStripProps) {
  const reducedMotion = useReducedMotion();
  // Single-dish or zero-dish sessions don't benefit from a
  // dual-track strip — fall back to the StepCard's own bar.
  if (dishes.length < 2) return null;

  const entries = buildDishProgress(dishes, activeDishIndex, activeStepIndex);

  return (
    <ul
      className={cn("flex flex-col gap-1.5", className)}
      aria-label="Multi-dish progress"
    >
      {entries.map((entry, idx) => (
        <li key={`${entry.name}-${idx}`} className="space-y-0.5">
          <div className="flex items-center justify-between text-[11px]">
            <span
              className={cn(
                "font-medium",
                entry.isActive
                  ? "text-[var(--nourish-green)]"
                  : "text-[var(--nourish-subtext)]",
              )}
            >
              {entry.name}
            </span>
            <span className="text-[var(--nourish-subtext)]/70 tabular-nums">
              {entry.completedSteps}/{entry.totalSteps}
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-100">
            <motion.div
              className={cn(
                "h-full rounded-full",
                entry.isActive
                  ? "bg-[var(--nourish-green)]"
                  : entry.progress >= 1
                    ? "bg-[var(--nourish-green)]/60"
                    : "bg-neutral-300",
              )}
              initial={false}
              animate={{ width: `${entry.progress * 100}%` }}
              transition={
                reducedMotion
                  ? { duration: 0.12 }
                  : { type: "spring", stiffness: 200, damping: 25 }
              }
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
