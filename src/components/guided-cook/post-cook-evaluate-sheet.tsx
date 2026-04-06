"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Sparkles, ChevronDown, BookmarkPlus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { trpc } from "@/lib/trpc/client";

export interface PostCookEvaluation {
  rating: number;
  note: string;
}

interface PostCookEvaluateSheetProps {
  open: boolean;
  dishName: string;
  cuisineFamily?: string;
  isFirstCook?: boolean;
  streak?: number;
  totalSteps?: number;
  initialRating?: number;
  onSave: (evaluation: PostCookEvaluation) => void;
  onClose: () => void;
}

const POSITIVE_CHIPS = [
  "Nailed the timing",
  "Great flavors",
  "Clean technique",
  "Easy to follow",
  "Turned out better than expected",
];

const IMPROVE_CHIPS = [
  "Slightly overcooked",
  "Missing flavor",
  "Too rushed",
  "Would simplify",
  "Need better equipment",
];

/**
 * PostCookEvaluateSheet — Evaluate B.
 *
 * Bottom sheet for post-cook reflection: star rating, what went well,
 * what to improve, optional note, AI-powered reflection, and save.
 *
 * Always optional. Never judgmental. Strengths before suggestions.
 */
export function PostCookEvaluateSheet({
  open,
  dishName,
  cuisineFamily = "",
  isFirstCook = false,
  streak = 0,
  totalSteps = 0,
  initialRating = 0,
  onSave,
  onClose,
}: PostCookEvaluateSheetProps) {
  const [rating, setRating] = useState(initialRating);
  const [positiveChips, setPositiveChips] = useState<string[]>([]);
  const [improveChips, setImproveChips] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [showReflection, setShowReflection] = useState(false);

  // AI reflection — fires when user taps "Reflect"
  const reflection = trpc.ai.generateReflection.useQuery(
    {
      dishName,
      cuisineFamily,
      rating: rating || undefined,
      note: note.trim() || undefined,
      hasPhoto: false,
      completedSteps: totalSteps,
      totalSteps,
      isFirstCook,
      currentStreak: streak,
    },
    { enabled: open && showReflection, staleTime: Infinity },
  );

  const toggleChip = (
    chip: string,
    list: string[],
    setList: (v: string[]) => void,
  ) => {
    setList(
      list.includes(chip) ? list.filter((c) => c !== chip) : [...list, chip],
    );
  };

  const handleSave = () => {
    const chipNote = [
      positiveChips.length > 0
        ? `What worked: ${positiveChips.join(", ")}.`
        : "",
      improveChips.length > 0 ? `To improve: ${improveChips.join(", ")}.` : "",
      note.trim(),
    ]
      .filter(Boolean)
      .join(" ");

    onSave({ rating, note: chipNote });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-neutral-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-2 pb-4">
              <h2 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
                How did it go?
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)] transition-colors"
                type="button"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-5 pb-28 space-y-6">
              {/* Star rating — prominent */}
              <div className="space-y-2 text-center">
                <p className="text-sm font-medium text-[var(--nourish-dark)]">
                  Rate {dishName}
                </p>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      onClick={() => setRating(star)}
                      whileTap={{ scale: 1.25, rotate: -10 }}
                      className="p-1"
                      type="button"
                    >
                      <Star
                        size={32}
                        className={cn(
                          "transition-colors",
                          star <= rating
                            ? "fill-[var(--nourish-gold)] text-[var(--nourish-gold)]"
                            : "text-neutral-200 fill-neutral-100",
                        )}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* What went well */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[var(--nourish-subtext)] uppercase tracking-wide">
                  What went well
                </p>
                <div className="flex flex-wrap gap-2">
                  {POSITIVE_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() =>
                        toggleChip(chip, positiveChips, setPositiveChips)
                      }
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        positiveChips.includes(chip)
                          ? "border-[var(--nourish-green)]/40 bg-[var(--nourish-green)]/10 text-[var(--nourish-green)]"
                          : "border-neutral-200 text-[var(--nourish-subtext)] hover:border-neutral-300",
                      )}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* What to improve */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[var(--nourish-subtext)] uppercase tracking-wide">
                  For next time
                </p>
                <div className="flex flex-wrap gap-2">
                  {IMPROVE_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() =>
                        toggleChip(chip, improveChips, setImproveChips)
                      }
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        improveChips.includes(chip)
                          ? "border-amber-300 bg-amber-50 text-amber-700"
                          : "border-neutral-200 text-[var(--nourish-subtext)] hover:border-neutral-300",
                      )}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-[var(--nourish-subtext)] uppercase tracking-wide">
                  Anything else?
                </p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="How did it taste? What would you change?"
                  rows={2}
                  className="w-full rounded-xl border border-neutral-200 bg-[var(--nourish-input-bg)] px-3 py-2.5 text-sm placeholder:text-[var(--nourish-subtext)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--nourish-green)]/20 resize-none"
                />
              </div>

              {/* AI Reflection — optional */}
              <div className="w-full">
                <motion.button
                  onClick={() => setShowReflection(!showReflection)}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className={cn(
                    "flex w-full items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all duration-150",
                    showReflection
                      ? "border-[var(--nourish-green)]/30 text-[var(--nourish-green)] bg-[var(--nourish-green)]/5"
                      : "border-neutral-200 text-[var(--nourish-subtext)] hover:border-neutral-300",
                  )}
                  type="button"
                >
                  <Sparkles size={14} />
                  Reflect on this meal
                  <motion.div
                    animate={{ rotate: showReflection ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={14} />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {showReflection && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 space-y-3">
                        {reflection.isLoading && (
                          <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
                            <p className="text-xs text-[var(--nourish-subtext)] animate-pulse">
                              Thinking about your cook...
                            </p>
                          </div>
                        )}

                        {reflection.data && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 260,
                              damping: 25,
                            }}
                            className="space-y-3"
                          >
                            {/* Strengths */}
                            <div className="rounded-xl border border-[var(--nourish-green)]/20 bg-[var(--nourish-green)]/5 p-4 space-y-2 text-left">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nourish-green)]">
                                What went well
                              </p>
                              {reflection.data.strengths.map((s, i) => (
                                <motion.p
                                  key={i}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    delay: i * 0.1,
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 25,
                                  }}
                                  className="text-sm text-[var(--nourish-dark)] leading-relaxed"
                                >
                                  {s}
                                </motion.p>
                              ))}
                            </div>

                            {/* Next-time suggestions */}
                            {reflection.data.nextTimeSuggestions.length > 0 && (
                              <div className="rounded-xl border border-[var(--nourish-gold)]/20 bg-[var(--nourish-gold)]/5 p-4 space-y-2 text-left">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nourish-gold)]">
                                  For next time
                                </p>
                                {reflection.data.nextTimeSuggestions.map(
                                  (s, i) => (
                                    <motion.p
                                      key={i}
                                      initial={{ opacity: 0, x: -8 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{
                                        delay: 0.3 + i * 0.1,
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 25,
                                      }}
                                      className="text-sm text-[var(--nourish-dark)] leading-relaxed"
                                    >
                                      {s.message}
                                    </motion.p>
                                  ),
                                )}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CTA */}
              <div className="space-y-2 pt-1">
                <motion.button
                  onClick={handleSave}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--nourish-green)] py-3.5 text-sm font-semibold text-white hover:bg-[var(--nourish-dark-green)] transition-colors shadow-sm shadow-[var(--nourish-green)]/20"
                  type="button"
                >
                  <BookmarkPlus size={16} />
                  Save to scrapbook
                </motion.button>

                <button
                  onClick={onClose}
                  className="w-full py-2 text-xs text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)] transition-colors"
                  type="button"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
