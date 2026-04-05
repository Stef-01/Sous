"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Camera, StickyNote, BookmarkPlus, RotateCcw, Home, Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { trpc } from "@/lib/trpc/client";

interface WinScreenProps {
  dishName: string;
  sideDishes?: string[];
  cuisineFamily?: string;
  isFirstCook?: boolean;
  streak?: number;
  totalSteps?: number;
  pathJustUnlocked?: boolean;
  saved?: boolean;
  onRate: (rating: number) => void;
  onAddPhoto: () => void;
  onAddNote: (note: string) => void;
  onSave: () => void;
  onCookAgain: () => void;
  onBackToday: () => void;
}

/**
 * Win Screen — celebration after completing a cook.
 * Shows streak, optional photo/note/rating, and navigation.
 * AI-powered personalized headline + message with deterministic fallback.
 */
export function WinScreen({
  dishName,
  sideDishes = [],
  cuisineFamily = "",
  isFirstCook = false,
  streak = 0,
  totalSteps = 0,
  pathJustUnlocked,
  saved = false,
  onRate,
  onAddPhoto,
  onAddNote,
  onSave,
  onCookAgain,
  onBackToday,
}: WinScreenProps) {
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [photoAdded, setPhotoAdded] = useState(false);

  // AI-powered win message (mock or real, depending on API key)
  const winMessage = trpc.ai.generateWinMessage.useQuery(
    {
      dishName,
      sideDishes,
      cuisineFamily,
      isFirstCook,
      currentStreak: streak,
    },
    { staleTime: Infinity }
  );

  const headline = winMessage.data?.headline ?? "You did it!";
  const message = winMessage.data?.message ?? `${dishName} is ready.`;

  // Post-cook reflection (fetches when the user taps "Reflect on this meal")
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
    { enabled: showReflection, staleTime: Infinity }
  );

  // Hide confetti after animation
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleRate = (stars: number) => {
    setRating(stars);
    onRate(stars);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-6 text-center"
    >
      {/* Celebration header */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 12 }}
        className="space-y-2"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeInOut" }}
          className="text-4xl"
        >
          🎉
        </motion.div>
        <h1 className="font-serif text-2xl text-[var(--nourish-dark)]">
          {headline}
        </h1>
        <p className="text-[var(--nourish-subtext)]">
          {message}
        </p>
      </motion.div>

      {/* Streak + skill */}
      {streak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 12 }}
          className="flex items-center gap-3"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 12 }}
            className="rounded-full bg-[var(--nourish-green)]/10 px-3 py-1.5 text-sm font-medium text-[var(--nourish-green)]"
          >
            Streak: {streak} 🔥
          </motion.div>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 12 }}
            className="rounded-full bg-[var(--nourish-gold)]/15 px-3 py-1.5 text-sm font-medium text-[var(--nourish-gold)]"
          >
            +1 skill
          </motion.div>
        </motion.div>
      )}

      {/* Path unlocked celebration */}
      {pathJustUnlocked && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 12 }}
          className="rounded-xl border border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/5 p-4"
        >
          <p className="text-sm font-semibold text-[var(--nourish-green)]">
            🎊 Path tab unlocked!
          </p>
          <p className="text-xs text-[var(--nourish-subtext)] mt-1">
            3 cooks complete — your journey begins.
          </p>
        </motion.div>
      )}

      {/* Star rating */}
      <div className="space-y-1">
        <p className="text-xs text-[var(--nourish-subtext)]">How did it turn out?</p>
        <div className="flex items-center justify-center gap-1">
          {[1, 2, 3, 4, 5].map((star, idx) => (
            <motion.button
              key={star}
              onClick={() => handleRate(star)}
              whileTap={{ scale: 1.3, rotate: -15 }}
              animate={star <= rating ? { scale: [1, 1.2, 1] } : {}}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
                delay: star <= rating ? idx * 0.05 : 0,
              }}
              className="p-1"
              type="button"
            >
              <Star
                size={24}
                className={cn(
                  "transition-colors",
                  star <= rating
                    ? "fill-[var(--nourish-gold)] text-[var(--nourish-gold)]"
                    : "text-neutral-200 fill-neutral-100"
                )}
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-3">
        <motion.button
          onClick={() => {
            onAddPhoto();
            setPhotoAdded(true);
          }}
          disabled={photoAdded}
          whileTap={photoAdded ? undefined : { scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
            photoAdded
              ? "border-[var(--nourish-green)]/30 text-[var(--nourish-green)] bg-[var(--nourish-green)]/5 cursor-default"
              : "border-neutral-200 text-[var(--nourish-subtext)] hover:border-neutral-300"
          )}
          type="button"
        >
          <Camera size={14} />
          {photoAdded ? "Photo added" : "Add photo"}
        </motion.button>

        <motion.button
          onClick={() => setShowNote(!showNote)}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-[var(--nourish-subtext)] hover:border-neutral-300 transition-colors"
          type="button"
        >
          <StickyNote size={14} />
          Note
        </motion.button>
      </div>

      {/* Note input */}
      {showNote && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full space-y-2"
        >
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="How did it taste? Anything you'd change?"
            rows={3}
            className="w-full rounded-xl border border-neutral-200 bg-[var(--nourish-input-bg)] px-3 py-2.5 text-sm placeholder:text-[var(--nourish-subtext)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--nourish-green)]/20 resize-none"
          />
          {note.trim() && (
            <button
              onClick={() => onAddNote(note)}
              className="text-xs font-medium text-[var(--nourish-green)]"
              type="button"
            >
              Save note
            </button>
          )}
        </motion.div>
      )}

      {/* Reflect on this meal — optional expandable */}
      <div className="w-full">
        <motion.button
          onClick={() => setShowReflection(!showReflection)}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={cn(
            "flex w-full items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all duration-150",
            showReflection
              ? "border-[var(--nourish-green)]/30 text-[var(--nourish-green)] bg-[var(--nourish-green)]/5"
              : "border-neutral-200 text-[var(--nourish-subtext)] hover:border-neutral-300"
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
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
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
                    transition={{ type: "spring", stiffness: 260, damping: 25 }}
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
                          transition={{ delay: i * 0.1, type: "spring", stiffness: 260, damping: 25 }}
                          className="text-sm text-[var(--nourish-dark)] leading-relaxed"
                        >
                          {s}
                        </motion.p>
                      ))}
                    </div>

                    {/* Next-time suggestions (only shown if any) */}
                    {reflection.data.nextTimeSuggestions.length > 0 && (
                      <div className="rounded-xl border border-[var(--nourish-gold)]/20 bg-[var(--nourish-gold)]/5 p-4 space-y-2 text-left">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nourish-gold)]">
                          For next time
                        </p>
                        {reflection.data.nextTimeSuggestions.map((s, i) => (
                          <motion.p
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 260, damping: 25 }}
                            className="text-sm text-[var(--nourish-dark)] leading-relaxed"
                          >
                            {s.message}
                          </motion.p>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Save + navigation */}
      <div className="w-full space-y-2 pt-2">
        <motion.button
          onClick={onSave}
          disabled={saved}
          whileTap={saved ? undefined : { scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors",
            saved
              ? "border-[var(--nourish-green)]/40 bg-[var(--nourish-green)]/10 text-[var(--nourish-green)] cursor-default"
              : "border-[var(--nourish-green)]/30 text-[var(--nourish-green)] hover:bg-[var(--nourish-green)]/5"
          )}
          type="button"
        >
          <BookmarkPlus size={16} />
          {saved ? "Saved to scrapbook" : "Save to scrapbook"}
        </motion.button>

        {/* Primary CTA — dominant */}
        <motion.button
          onClick={onBackToday}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--nourish-green)] py-3.5 text-sm font-semibold text-white hover:bg-[var(--nourish-dark-green)] transition-colors shadow-sm shadow-[var(--nourish-green)]/20"
          type="button"
        >
          <Home size={14} />
          Back to Today
        </motion.button>

        {/* Secondary — visually subordinate */}
        <button
          onClick={onCookAgain}
          className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-medium text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)] transition-colors"
          type="button"
        >
          <RotateCcw size={12} />
          Cook again
        </button>
      </div>
    </motion.div>
  );
}
