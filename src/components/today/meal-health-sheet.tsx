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
import { useRef } from "react";
import { X } from "lucide-react";
import type { ConditionId } from "@/types/therapeutics";
import { useDismissOnEscape, useFocusTrap } from "@/lib/hooks/use-overlay-a11y";
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
  const sheetRef = useRef<HTMLDivElement>(null);
  const handleDragEnd = reducedMotion ? undefined : onDragEnd;
  useFocusTrap(isOpen, sheetRef);
  useDismissOnEscape(isOpen, onClose);

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
            ref={sheetRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={`Info for ${dishName}`}
            className="absolute inset-x-0 bottom-0 z-50 flex h-[68%] flex-col rounded-t-[var(--radius-lg)] bg-white focus:outline-none"
            initial={reducedMotion ? false : { y: "100%" }}
            animate={{ y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            drag={reducedMotion ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6, left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
          >
            <div className="relative shrink-0 px-5 pt-3 pb-1">
              <div
                className="mx-auto h-1 w-9 rounded-full bg-neutral-300/80"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close info"
                className="absolute right-3 top-1 flex h-11 w-11 items-center justify-center rounded-full text-[var(--nourish-subtext)] transition hover:bg-neutral-100 hover:text-[var(--nourish-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>
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
