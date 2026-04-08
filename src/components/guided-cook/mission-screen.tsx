"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface MissionScreenProps {
  dishName: string;
  description: string;
  flavorProfile: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  heroImageUrl: string | null;
  hasIngredients?: boolean;
  onStart: () => void;
}

/**
 * Mission Screen — introduces the side dish and what the user will learn.
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
  onStart,
}: MissionScreenProps) {
  const [imgError, setImgError] = useState(false);
  const totalTime = prepTimeMinutes + cookTimeMinutes;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-5"
    >
      {/* Hero image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="relative aspect-[4/3] overflow-hidden rounded-2xl"
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
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{
              background:
                "linear-gradient(135deg, rgba(45,90,61,0.15) 0%, #fafaf8 55%, rgba(45,90,61,0.08) 100%)",
            }}
          >
            <span className="text-6xl">🍽️</span>
            <span className="text-sm font-medium text-[var(--nourish-subtext)]">
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

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 25, delay: 0.2 }}
        className="text-sm text-[var(--nourish-subtext)] leading-relaxed"
      >
        {description}
      </motion.p>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
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
    </motion.div>
  );
}
