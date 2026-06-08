"use client";

/**
 * MealHealthSheet — the swipe-up health sheet for the fullscreen meal card
 * (Culinary Therapeutics, swipe-up panel phase 4).
 *
 * Collapsed, it's a single frosted "Health" grabber resting at the bottom of
 * the photo. Drag it up (or tap) and a bottom sheet rises over the lower ~60%
 * of the card — the top of the food photo stays visible — carrying the static
 * `MealHealthPanel`. Drag the sheet down (or tap the scrim) to dismiss.
 *
 * The gesture is `drag="y"` only, living OUTSIDE the card's horizontal
 * swipe — the two never share a pointer, so skip/cook is untouched. Snap
 * decisions come from the pure, tested `decidePanelSnap`. Reduced-motion users
 * get an instant tap-to-toggle with no drag and no slide.
 */

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { Info } from "lucide-react";
import type { ConditionId } from "@/types/therapeutics";
import { useMealHealthPanel } from "@/lib/hooks/use-meal-health-panel";
import { MealHealthPanel } from "./meal-health-panel";

interface Props {
  dishName: string;
  tags: string[];
  /** Dish slug — resolves the ingredient profile for food-identity matching. */
  slug?: string;
  /** Dish description — richer fallback identity for meals without links. */
  description?: string;
  conditions: readonly ConditionId[];
  /** registryIsClinicianApproved() — gates personalized framing (gate G1). */
  reviewed: boolean;
  /** clinicianReviewMode() — personalization visible, badged for evaluation. */
  clinicianReview?: boolean;
}

export function MealHealthSheet({
  dishName,
  tags,
  slug,
  description,
  conditions,
  reviewed,
  clinicianReview,
}: Props) {
  const reducedMotion = useReducedMotion();
  const { isOpen, open, close, onDragEnd } = useMealHealthPanel();

  const handleDragEnd = reducedMotion
    ? undefined
    : (event: unknown, info: PanInfo) => onDragEnd(event, info);

  return (
    <>
      {/* Collapsed affordance — a clear, tappable "Info" pill at the top-right of
          the photo. (Was a bottom-center grabber pinned to a magic offset that
          the taller Pass/Save/Cook bar occluded into an unusable sliver.) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="grabber"
            type="button"
            onClick={open}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            className="absolute right-4 top-4 z-30 flex items-center gap-1.5 rounded-full bg-black/55 px-3.5 py-2 text-[12px] font-semibold text-white shadow-lg backdrop-blur-md"
            aria-label={`Show info for ${dishName}`}
          >
            <Info size={14} strokeWidth={2.2} />
            Info
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="scrim"
              className="absolute inset-0 z-40 bg-black/35"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              aria-hidden="true"
            />
            <motion.div
              key="sheet"
              role="dialog"
              aria-label={`Info for ${dishName}`}
              className="absolute inset-x-0 bottom-0 z-50 flex h-[60%] flex-col rounded-t-[var(--radius-lg)] bg-white shadow-[0_-10px_44px_rgba(0,0,0,0.22)]"
              initial={reducedMotion ? false : { y: "100%" }}
              animate={{ y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 36 }}
              drag={reducedMotion ? false : "y"}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6, left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
            >
              <div
                className="mx-auto mt-3 mb-1 h-1 w-9 shrink-0 rounded-full bg-neutral-300/80"
                aria-hidden="true"
              />
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-8 pt-2">
                <MealHealthPanel
                  dishName={dishName}
                  tags={tags}
                  slug={slug}
                  description={description}
                  conditions={conditions}
                  reviewed={reviewed}
                  clinicianReview={clinicianReview}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
