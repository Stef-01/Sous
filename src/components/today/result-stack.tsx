"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock, Flame, RefreshCw, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ScoreBreakdown } from "@/lib/engine/types";

interface SideResult {
  id: string;
  slug: string;
  name: string;
  cuisineFamily: string;
  tags: string[];
  pairingReason: string | null;
  nutritionCategory: string | null;
  explanation: string;
  totalScore: number;
  scores: ScoreBreakdown;
  imageUrl: string;
  description: string;
  hasGuidedCook?: boolean;
}

interface ResultStackProps {
  mainDish: string;
  sides: SideResult[];
  onCookThis: (side: SideResult) => void;
  onReroll: () => void;
  isRerolling?: boolean;
}

/**
 * Result Stack — three side dish cards with explanations.
 * One primary action per card: "Cook this".
 * Tap to expand the "why this won" breakdown.
 */
export function ResultStack({
  mainDish,
  sides,
  onCookThis,
  onReroll,
  isRerolling,
}: ResultStackProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--nourish-subtext)]">
          For: <span className="font-medium text-[var(--nourish-dark)]">{mainDish}</span>
        </p>
        <button
          onClick={onReroll}
          disabled={isRerolling}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
            "border border-neutral-200 text-[var(--nourish-subtext)]",
            "hover:border-[var(--nourish-green)] hover:text-[var(--nourish-green)]",
            "disabled:opacity-50 transition-all duration-200"
          )}
          type="button"
        >
          <RefreshCw size={14} className={isRerolling ? "animate-spin" : ""} />
          Reroll
        </button>
      </div>

      <div className="space-y-3">
        {sides.map((side, idx) => (
          <ResultCard
            key={side.id}
            side={side}
            rank={idx + 1}
            onCookThis={() => onCookThis(side)}
          />
        ))}
      </div>
    </motion.div>
  );
}

function ResultCard({
  side,
  rank,
  onCookThis,
}: {
  side: SideResult;
  rank: number;
  onCookThis: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08, duration: 0.3 }}
      className={cn(
        "overflow-hidden rounded-xl border bg-white",
        rank === 1 ? "border-[var(--nourish-green)]/30 shadow-sm" : "border-neutral-100"
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left"
        type="button"
      >
        {/* Side dish image */}
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
          {side.imageUrl && (
            <img
              src={side.imageUrl}
              alt={side.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        {/* Side dish info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[var(--nourish-dark)] truncate">
              {side.name}
            </h3>
            {rank === 1 && (
              <span className="shrink-0 rounded-full bg-[var(--nourish-green)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--nourish-green)]">
                Best match
              </span>
            )}
            {side.hasGuidedCook && (
              <span className="shrink-0 rounded-full bg-[var(--nourish-gold)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--nourish-gold)]">
                Guided
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[var(--nourish-subtext)] line-clamp-1">
            {side.explanation}
          </p>
        </div>

        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-[var(--nourish-subtext)] transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>

      {/* Expanded: "Why this won" + Cook this button */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-neutral-100 px-4 pb-4 pt-3 space-y-3">
              {/* Score highlights */}
              <div className="flex flex-wrap gap-2">
                <ScoreBadge label="Cuisine fit" value={side.scores.cuisineFit} />
                <ScoreBadge label="Flavor contrast" value={side.scores.flavorContrast} />
                <ScoreBadge label="Nutrition" value={side.scores.nutritionBalance} />
                <ScoreBadge label="Quick prep" value={side.scores.prepBurden} />
              </div>

              {/* Description */}
              <p className="text-sm text-[var(--nourish-subtext)] leading-relaxed">
                {side.description}
              </p>

              {/* Cook this button — primary action */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCookThis();
                }}
                className={cn(
                  "w-full rounded-xl py-3 text-sm font-semibold text-white",
                  "bg-[var(--nourish-green)] hover:bg-[var(--nourish-dark-green)]",
                  "transition-colors duration-200",
                  "flex items-center justify-center gap-2"
                )}
                type="button"
              >
                {side.hasGuidedCook && <ChefHat size={16} />}
                {side.hasGuidedCook ? "Start guided cook" : "Cook this"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ScoreBadge({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-medium",
        pct >= 70
          ? "bg-[var(--nourish-green)]/10 text-[var(--nourish-green)]"
          : pct >= 50
          ? "bg-[var(--nourish-gold)]/15 text-[var(--nourish-gold)]"
          : "bg-neutral-100 text-[var(--nourish-subtext)]"
      )}
    >
      {label} {pct}%
    </span>
  );
}
