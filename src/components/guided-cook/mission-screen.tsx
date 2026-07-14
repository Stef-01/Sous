"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { UtensilsCrossed, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useSavedDishes } from "@/lib/hooks/use-saved-dishes";
import { haptic } from "@/lib/motion/haptics";
import { PlanCookChip } from "./plan-cook-chip";
import { BigHandsToggle } from "./big-hands-toggle";
import { DishRecallLine } from "./dish-recall-line";
import { CreatorByline } from "@/components/shared/creator-byline";

interface MissionScreenProps {
  dishName: string;
  description: string;
  flavorProfile: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  heroImageUrl: string | null;
  hasIngredients?: boolean;
  /** When provided, surfaces a "last cooked N days ago" recall line if this
   *  dish has been completed before. */
  dishSlug?: string;
  /** Y3 W9: cuisine family for the eyebrow-caps row. Optional;
   *  the eyebrow gracefully degrades to time-only when absent. */
  cuisineFamily?: string;
  onStart: () => void;
}

/**
 * Mission Screen  -  introduces the side dish and what the user will learn.
 * First phase of the Guided Cook flow.
 */
export function MissionScreen({
  dishName,
  description,
  flavorProfile,
  prepTimeMinutes,
  cookTimeMinutes,
  heroImageUrl,
  hasIngredients = true,
  dishSlug,
  cuisineFamily,
  onStart,
}: MissionScreenProps) {
  const reducedMotion = useReducedMotion();
  const [imgError, setImgError] = useState(false);
  const totalTime = prepTimeMinutes + cookTimeMinutes;

  // Save the recipe for later straight from the detail view (the reference
  // mockups' bookmark affordance). Only when we have a slug to key it by.
  const { isDishSaved, saveDish, removeDish } = useSavedDishes();
  const isSaved = dishSlug ? isDishSaved(dishSlug) : false;
  const toggleSaved = () => {
    if (!dishSlug) return;
    haptic("select");
    if (isSaved) removeDish(dishSlug);
    else saveDish(dishSlug, dishName);
  };

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      className="flex min-h-[calc(100dvh-160px)] flex-col gap-3.5"
    >
      {/* Food-first hero: full-width in the mobile rail with no permanent
          controls over the meal. */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 260, damping: 25 }
        }
        data-testid="cook-mission-hero"
        className="relative left-1/2 h-[min(44dvh,370px)] w-screen max-w-md -translate-x-1/2 overflow-hidden rounded-none bg-[var(--nourish-dark)]"
      >
        {heroImageUrl && !imgError ? (
          <Image
            src={heroImageUrl}
            alt={dishName}
            fill
            sizes="(max-width: 768px) 100vw, 448px"
            priority
            className="object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center gap-3"
            style={{ background: "var(--nourish-green)" }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
              <UtensilsCrossed
                size={28}
                className="text-white"
                strokeWidth={1.5}
              />
            </div>
            <span className="text-lg font-serif font-bold text-white/95">
              {dishName}
            </span>
          </div>
        )}
      </motion.div>

      {/* Dish name + meta strip — Y3 W9 visual hierarchy:
          eyebrow caps (#2) → title → flavor pills (#3 meta strip).
          Time chip moves into the eyebrow row so it competes with
          metadata, not with flavor. */}
      <div className="space-y-2">
        {/* Cuisine eyebrow caps — only when there IS a cuisine. */}
        {cuisineFamily && (
          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0 } : { delay: 0.08 }}
            className="sous-label"
          >
            {cuisineFamily}
          </motion.p>
        )}

        {/* Title — the canonical .sous-title serif role (was ad-hoc
            font-serif text-2xl). line-clamp 2 keeps the CTA above the
            fold on 375px viewports. */}
        <motion.h1
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 260, damping: 25, delay: 0.1 }
          }
          className="sous-title line-clamp-2 text-[var(--nourish-dark)]"
        >
          {dishName}
        </motion.h1>

        {/* Creator byline — "by Chef Tu" for partner-chef recipes. */}
        {dishSlug && <CreatorByline slug={dishSlug} className="pt-1.5" />}

        {/* Flavor pills — pattern #3 meta strip. Capped at 3 visible
            pills with a subtle +N overflow so multi-flavor dishes
            (4-5+ tags) don't crowd the space above the CTA on 375px.
            Quieter neutral-outline style replaces the green fill. */}
        {(flavorProfile.length > 0 || totalTime > 0) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {flavorProfile.slice(0, 3).map((flavor, idx) => (
              <motion.span
                key={flavor}
                initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : {
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        delay: 0.15 + idx * 0.05,
                      }
                }
                className="text-[12px] font-medium capitalize text-[var(--nourish-subtext)] after:ml-1.5 after:text-[var(--nourish-border-strong)] after:content-['·'] last:after:hidden"
              >
                {flavor}
              </motion.span>
            ))}
            {flavorProfile.length > 3 && (
              <span className="px-1 text-[11px] font-medium tabular-nums text-[var(--nourish-subtext)]/70">
                +{flavorProfile.length - 3}
              </span>
            )}
            {totalTime > 0 && (
              <motion.span
                initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : {
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        delay: 0.15 + Math.min(flavorProfile.length, 3) * 0.05,
                      }
                }
                className="text-[12px] font-medium text-[var(--nourish-subtext)]"
              >
                {formatMissionDuration(totalTime)}
              </motion.span>
            )}
          </div>
        )}
      </div>

      {/* Recall line  -  "Last cooked 12 days ago · you rated it 5★" */}
      {dishSlug && <DishRecallLine dishSlug={dishSlug} />}

      {/* Description  -  clamped to 3 lines so CTA is never pushed off-screen */}
      <motion.p
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 260, damping: 25, delay: 0.16 }
        }
        className="text-sm text-[var(--nourish-subtext)] leading-relaxed line-clamp-3"
      >
        {description}
      </motion.p>

      {/* Primary action stays ahead of optional controls on short phones. */}
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 25,
          delay: 0.25,
        }}
        className="grid grid-cols-[48px_1fr] gap-2.5"
      >
        {dishSlug ? (
          <button
            type="button"
            onClick={toggleSaved}
            aria-label={isSaved ? "Remove from saved recipes" : "Save recipe"}
            aria-pressed={isSaved}
            className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] border border-[var(--nourish-border-strong)] bg-white text-[var(--nourish-dark)] transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40 motion-reduce:active:scale-100"
          >
            <Bookmark
              size={18}
              strokeWidth={2.2}
              className={cn(
                isSaved &&
                  "fill-[var(--nourish-green)] text-[var(--nourish-green)]",
              )}
            />
          </button>
        ) : (
          <span aria-hidden />
        )}
        <motion.button
          whileTap={reducedMotion ? undefined : { scale: 0.98 }}
          onClick={onStart}
          className={cn(
            "h-12 rounded-[var(--radius-md)] text-sm font-semibold text-white",
            "bg-[var(--nourish-green)] hover:bg-[var(--nourish-dark-green)]",
            "transition-colors duration-200",
          )}
          type="button"
        >
          {hasIngredients ? "Let\u2019s gather" : "Let\u2019s cook"}
        </motion.button>
      </motion.div>

      {/* Plan-my-cook  -  optional eat-time → start-time assist */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 260, damping: 25, delay: 0.22 }
        }
      >
        <PlanCookChip totalMinutes={totalTime} />
      </motion.div>

      {/* Big-hands mode  -  calm opt-in for the rest of this session */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 260, damping: 25, delay: 0.24 }
        }
      >
        <BigHandsToggle />
      </motion.div>
    </motion.div>
  );
}

function formatMissionDuration(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return `${hours}hr${remainder ? ` ${remainder}min` : ""}`;
  }
  return `${minutes} min`;
}
