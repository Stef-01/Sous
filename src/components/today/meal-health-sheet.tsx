"use client";

/**
 * MealHealthSheet — the controlled health sheet for the fullscreen meal card.
 *
 * The OPEN/CLOSED state is owned by the queue overlay (so the trigger can be a
 * floating "Info" button anchored just above the recipe name, where it can never
 * be occluded by the action bar). When open, a bottom sheet rises over the lower
 * ~60% of the card carrying the static `MealHealthPanel`; drag it down or tap the
 * scrim to dismiss. Reduced-motion users get a fade instead of a slide.
 */

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import type { ConditionId } from "@/types/therapeutics";
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
  /** therapeuticsActive() — gates ONLY the therapeutic evidence layer inside the
   *  panel. Nutrition always shows regardless, so the preview never disappears. */
  showTherapeutic?: boolean;
  /** Controlled open state (owned by the queue overlay). */
  isOpen: boolean;
  onClose: () => void;
  onDragEnd: (event: unknown, info: PanInfo) => void;
}

export function MealHealthSheet({
  dishName,
  tags,
  slug,
  description,
  conditions,
  reviewed,
  clinicianReview,
  showTherapeutic = true,
  isOpen,
  onClose,
  onDragEnd,
}: Props) {
  const reducedMotion = useReducedMotion();
  const handleDragEnd = reducedMotion ? undefined : onDragEnd;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="scrim"
            className="absolute inset-0 z-40 bg-black/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-label={`Info for ${dishName}`}
            className="absolute inset-x-0 bottom-0 z-50 flex h-[68%] flex-col rounded-t-[var(--radius-lg)] bg-white shadow-[0_-10px_44px_rgba(0,0,0,0.22)]"
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
                showTherapeutic={showTherapeutic}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
