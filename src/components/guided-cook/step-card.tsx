"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { TimerChip } from "./timer-chip";
import { MistakeChip } from "./mistake-chip";
import { HackChip } from "./hack-chip";
import { FactChip } from "./fact-chip";

interface StepCardProps {
  stepNumber: number;
  totalSteps: number;
  instruction: string;
  timerSeconds?: number | null;
  mistakeWarning?: string | null;
  quickHack?: string | null;
  cuisineFact?: string | null;
  donenessCue?: string | null;
  imageUrl?: string | null;
  expandedChip: string | null;
  onToggleChip: (chip: string | null) => void;
  onStartTimer: (seconds: number) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

/**
 * Step Card — one focused instruction per screen.
 * The core of the Cook phase. Shows instruction text + expandable chips.
 */
export function StepCard({
  stepNumber,
  totalSteps,
  instruction,
  timerSeconds,
  mistakeWarning,
  quickHack,
  cuisineFact,
  donenessCue,
  imageUrl,
  expandedChip,
  onToggleChip,
  onStartTimer,
  onNext,
  onPrev,
  isFirst,
  isLast,
}: StepCardProps) {
  return (
    <motion.div
      key={stepNumber}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-5"
    >
      {/* Step counter */}
      <p className="text-sm text-[var(--nourish-subtext)]">
        Step {stepNumber} of {totalSteps}
      </p>

      {/* Step image (optional) */}
      {imageUrl && (
        <div className="overflow-hidden rounded-xl">
          <img
            src={imageUrl}
            alt={`Step ${stepNumber}`}
            className="w-full aspect-video object-cover"
          />
        </div>
      )}

      {/* Main instruction */}
      <p className="text-lg text-[var(--nourish-dark)] leading-relaxed">
        {instruction}
      </p>

      {/* Doneness cue */}
      {donenessCue && (
        <p className="text-sm text-[var(--nourish-green)] italic">
          {donenessCue}
        </p>
      )}

      {/* Expandable chips */}
      <div className="space-y-2">
        {timerSeconds && (
          <TimerChip
            seconds={timerSeconds}
            isExpanded={expandedChip === "timer"}
            onToggle={() => onToggleChip(expandedChip === "timer" ? null : "timer")}
            onStart={() => onStartTimer(timerSeconds)}
          />
        )}

        {mistakeWarning && (
          <MistakeChip
            warning={mistakeWarning}
            isExpanded={expandedChip === "mistake"}
            onToggle={() => onToggleChip(expandedChip === "mistake" ? null : "mistake")}
          />
        )}

        {quickHack && (
          <HackChip
            hack={quickHack}
            isExpanded={expandedChip === "hack"}
            onToggle={() => onToggleChip(expandedChip === "hack" ? null : "hack")}
          />
        )}

        {cuisineFact && (
          <FactChip
            fact={cuisineFact}
            isExpanded={expandedChip === "fact"}
            onToggle={() => onToggleChip(expandedChip === "fact" ? null : "fact")}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className={cn(
            "flex items-center gap-1 rounded-lg px-4 py-2.5 text-sm font-medium",
            "border border-neutral-200 transition-all duration-150",
            isFirst
              ? "text-neutral-300 cursor-not-allowed"
              : "text-[var(--nourish-subtext)] hover:border-neutral-300"
          )}
          type="button"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <button
          onClick={onNext}
          className={cn(
            "flex items-center gap-1 rounded-lg px-6 py-2.5 text-sm font-semibold",
            isLast
              ? "bg-[var(--nourish-green)] text-white hover:bg-[var(--nourish-dark-green)]"
              : "bg-[var(--nourish-green)] text-white hover:bg-[var(--nourish-dark-green)]",
            "transition-colors duration-200"
          )}
          type="button"
        >
          {isLast ? "Done!" : "Next"}
          {!isLast && <ChevronRight size={16} />}
        </button>
      </div>
    </motion.div>
  );
}
