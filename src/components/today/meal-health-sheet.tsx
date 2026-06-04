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
import { ChevronUp, HeartPulse } from "lucide-react";
import type { ConditionId } from "@/types/therapeutics";
import { useMealHealthPanel } from "@/lib/hooks/use-meal-health-panel";
import { MealHealthPanel } from "./meal-health-panel";

/**
 * Distance from the screen bottom to rest the collapsed grabber, clearing the
 * floating Pass/Save/Cook bar. Matches the card's `pb-[126px]` image inset.
 */
const GRABBER_BOTTOM_PX = 134;

interface Props {
  dishName: string;
  tags: string[];
  /** Dish slug — resolves the ingredient profile for food-identity matching. */
  slug?: string;
  conditions: readonly ConditionId[];
  /** registryIsClinicianApproved() — gates personalized framing (gate G1). */
  reviewed: boolean;
}

export function MealHealthSheet({
  dishName,
  tags,
  slug,
  conditions,
  reviewed,
}: Props) {
  const reducedMotion = useReducedMotion();
  const { isOpen, open, close, onDragEnd } = useMealHealthPanel();

  const handleDragEnd = reducedMotion
    ? undefined
    : (event: unknown, info: PanInfo) => onDragEnd(event, info);

  return (
    <>
      {/* Collapsed affordance — a draggable, tappable "Health" grabber. */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="grabber"
            type="button"
            onClick={open}
            drag={reducedMotion ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.6, bottom: 0, left: 0, right: 0 }}
            dragSnapToOrigin
            onDragEnd={handleDragEnd}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 8 }}
            style={{ bottom: GRABBER_BOTTOM_PX }}
            className="absolute inset-x-0 z-30 mx-auto flex w-fit cursor-grab touch-none items-center gap-1.5 rounded-full bg-black/55 px-4 py-2 text-[12px] font-semibold text-white shadow-lg backdrop-blur-md active:cursor-grabbing"
            aria-label={`Show health information for ${dishName}`}
          >
            <HeartPulse size={14} strokeWidth={2.2} />
            Health
            <ChevronUp
              size={13}
              strokeWidth={2.4}
              className="opacity-75"
              aria-hidden="true"
            />
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
              aria-label={`Health information for ${dishName}`}
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
                  conditions={conditions}
                  reviewed={reviewed}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
