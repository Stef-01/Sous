"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PlanCookChip } from "./plan-cook-chip";
import { BigHandsToggle } from "./big-hands-toggle";
import { DishRecallLine } from "./dish-recall-line";

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
      {/* Hero image  -  fixed height so CTA stays above fold on 375px phones */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 260, damping: 25 }
        }
        className="relative h-[160px] overflow-hidden rounded-2xl"
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
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <UtensilsCrossed
                size={28}
                className="text-white drop-shadow-sm"
                strokeWidth={1.5}
              />
            </div>
            <span className="text-lg font-serif font-bold text-white/95 drop-shadow-sm">
              {dishName}
            </span>
          </div>
        )}
      </motion.div>

      {/* Dish name + flavor badges */}
      <div className="space-y-3">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 25,
            delay: 0.1,
          }}
          className="font-serif text-2xl text-[var(--nourish-dark)]"
        >
          {dishName}
        </motion.h1>

        <div className="flex flex-wrap gap-2">
          {flavorProfile.map((flavor, idx) => (
            <motion.span
              key={flavor}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.15 + idx * 0.05,
              }}
              className="rounded-full bg-[var(--nourish-green)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--nourish-green)] capitalize"
            >
              {flavor}
            </motion.span>
          ))}
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.15 + flavorProfile.length * 0.05,
            }}
            className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-[var(--nourish-subtext)]"
          >
            {totalTime} min
          </motion.span>
        </div>
      </div>

      {/* Recall line  -  "Last cooked 12 days ago · you rated it 5★" */}
      {dishSlug && <DishRecallLine dishSlug={dishSlug} />}

      {/* Description  -  clamped to 3 lines so CTA is never pushed off-screen */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 25, delay: 0.2 }}
        className="text-sm text-[var(--nourish-subtext)] leading-relaxed line-clamp-3"
      >
        {description}
      </motion.p>

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

      {/* CTA  -  mt-auto pins to bottom of the flex container */}
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
          "mt-auto w-full rounded-xl py-3.5 text-sm font-semibold text-white",
          "bg-[var(--nourish-green)] hover:bg-[var(--nourish-dark-green)]",
          "cta-shadow transition-colors duration-200",
        )}
        type="button"
      >
        {hasIngredients ? "Let\u2019s gather" : "Let\u2019s cook"}
      </motion.button>
    </motion.div>
  );
}
