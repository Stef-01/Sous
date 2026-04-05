"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface MissionScreenProps {
  dishName: string;
  description: string;
  flavorProfile: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  heroImageUrl: string | null;
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
  onStart,
}: MissionScreenProps) {
  const totalTime = prepTimeMinutes + cookTimeMinutes;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5"
    >
      {/* Hero image */}
      {heroImageUrl && (
        <div className="overflow-hidden rounded-2xl">
          <img
            src={heroImageUrl}
            alt={dishName}
            className="w-full aspect-[4/3] object-cover"
          />
        </div>
      )}

      {/* Dish name + flavor badges */}
      <div className="space-y-3">
        <h1 className="font-serif text-2xl text-[var(--nourish-dark)]">
          {dishName}
        </h1>

        <div className="flex flex-wrap gap-2">
          {flavorProfile.map((flavor) => (
            <span
              key={flavor}
              className="rounded-full bg-[var(--nourish-green)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--nourish-green)] capitalize"
            >
              {flavor}
            </span>
          ))}
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-[var(--nourish-subtext)]">
            {totalTime} min
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--nourish-subtext)] leading-relaxed">
        {description}
      </p>

      {/* CTA */}
      <button
        onClick={onStart}
        className={cn(
          "w-full rounded-xl py-3.5 text-sm font-semibold text-white",
          "bg-[var(--nourish-green)] hover:bg-[var(--nourish-dark-green)]",
          "transition-colors duration-200"
        )}
        type="button"
      >
        Let&apos;s gather
      </button>
    </motion.div>
  );
}
