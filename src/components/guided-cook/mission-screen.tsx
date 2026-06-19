"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils/cn";
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

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-3 min-h-[calc(100dvh-160px)]"
    >
      {/* Hero image — food-first 4:3 aspect ratio (pattern #1
          standardisation across recipe surfaces). Falls back to a
          gradient + name overlay when no hero image is available. */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 260, damping: 25 }
        }
        className="relative overflow-hidden rounded-[var(--radius-lg)]"
        style={{ aspectRatio: "4 / 3" }}
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
            style={{
              background:
                "linear-gradient(135deg, var(--nourish-green) 0%, var(--nourish-light-green) 40%, #a8d8b9 100%)",
            }}
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
        {/* Eyebrow caps — the canonical .sous-label role (was an ad-hoc
            text-[10px] caps that drifted off the type scale). */}
        <motion.p
          initial={reducedMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { delay: 0.08 }}
          className="sous-label"
        >
          {cuisineFamily ? `${cuisineFamily} · ` : ""}
          {totalTime} min
        </motion.p>

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
        {flavorProfile.length > 0 && (
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
                className="rounded-full border border-[var(--nourish-green)]/20 bg-[var(--nourish-green)]/[0.06] px-2 py-0.5 text-[11px] font-medium text-[var(--nourish-subtext)] capitalize"
              >
                {flavor}
              </motion.span>
            ))}
            {flavorProfile.length > 3 && (
              <span className="px-1 text-[11px] font-medium tabular-nums text-[var(--nourish-subtext)]/70">
                +{flavorProfile.length - 3}
              </span>
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
      <motion.button
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 25,
          delay: 0.25,
        }}
        whileTap={{ scale: 0.96 }}
        onClick={onStart}
        className={cn(
          "w-full rounded-xl py-3.5 text-sm font-semibold text-white",
          "bg-[var(--nourish-green)] hover:bg-[var(--nourish-dark-green)]",
          "transition-colors duration-200",
        )}
        type="button"
      >
        {hasIngredients ? "Let\u2019s gather" : "Let\u2019s cook"}
      </motion.button>

      {/* Plan-my-cook  -  optional eat-time → start-time assist */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 25,
          delay: 0.22,
        }}
      >
        <PlanCookChip totalMinutes={totalTime} />
      </motion.div>

      {/* Big-hands mode  -  calm opt-in for the rest of this session */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 25,
          delay: 0.24,
        }}
      >
        <BigHandsToggle />
      </motion.div>
    </motion.div>
  );
}
