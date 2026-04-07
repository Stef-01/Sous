"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Camera,
  StickyNote,
  BookmarkPlus,
  RotateCcw,
  Home,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { trpc } from "@/lib/trpc/client";
import {
  PostCookEvaluateSheet,
  type PostCookEvaluation,
} from "@/components/guided-cook/post-cook-evaluate-sheet";

interface WinScreenProps {
  dishName: string;
  sideDishes?: string[];
  cuisineFamily?: string;
  isFirstCook?: boolean;
  streak?: number;
  totalSteps?: number;
  pathJustUnlocked?: boolean;
  saved?: boolean;
  onSave: (evaluation: PostCookEvaluation) => void;
  onCookAgain: () => void;
  onBackToday: () => void;
}

/**
 * Win Screen — celebration after completing a cook.
 *
 * Shows the celebration header (AI headline + streak), then surfaces two
 * actions:
 *   • "How did it go?" → opens PostCookEvaluateSheet (Evaluate B)
 *   • "Save to scrapbook" → quick-save with current inline rating
 *
 * AI-powered personalized headline with deterministic fallback.
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
  onSave,
  onCookAgain,
  onBackToday,
}: WinScreenProps) {
  const [rating, setRating] = useState(0);
  const [evaluateOpen, setEvaluateOpen] = useState(false);
  const [, setShowConfetti] = useState(true);

  // AI-powered win message (mock or real, depending on API key)
  const winMessage = trpc.ai.generateWinMessage.useQuery(
    {
      dishName,
      sideDishes,
      cuisineFamily,
      isFirstCook,
      currentStreak: streak,
    },
    { staleTime: Infinity },
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
    { enabled: showReflection, staleTime: Infinity },
  );

  // Hide confetti after animation
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleQuickSave = () => {
    onSave({ rating, note: "" });
  };

  const handleEvaluateSave = (evaluation: PostCookEvaluation) => {
    setEvaluateOpen(false);
    onSave(evaluation);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-6 text-center"
      >
        {/* Celebration header */}
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
        <p className="text-[var(--nourish-subtext)]">{message}</p>
      </motion.div>

      {/* Streak + skill */}
      {streak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.4,
            type: "spring",
            stiffness: 200,
            damping: 12,
          }}
          className="flex items-center gap-3"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.5,
              type: "spring",
              stiffness: 300,
              damping: 12,
            }}
            className="rounded-full bg-[var(--nourish-green)]/10 px-3 py-1.5 text-sm font-medium text-[var(--nourish-green)]"
          >
            Streak: {streak} 🔥
          </motion.div>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.6,
              type: "spring",
              stiffness: 300,
              damping: 12,
            }}
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
          transition={{
            delay: 0.6,
            type: "spring",
            stiffness: 200,
            damping: 12,
          }}
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
        <p className="text-xs text-[var(--nourish-subtext)]">
          How did it turn out?
        </p>
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
                    : "text-neutral-200 fill-neutral-100",
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
              : "border-neutral-200 text-[var(--nourish-subtext)] hover:border-neutral-300",
          )}
          type="button"
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
          <p className="text-[var(--nourish-subtext)]">{message}</p>
        </motion.div>

        {/* Streak + skill */}
        {streak > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.4,
              type: "spring",
              stiffness: 200,
              damping: 12,
            }}
            className="flex items-center gap-3"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.5,
                type: "spring",
                stiffness: 300,
                damping: 12,
              }}
              className="rounded-full bg-[var(--nourish-green)]/10 px-3 py-1.5 text-sm font-medium text-[var(--nourish-green)]"
            >
              Streak: {streak} 🔥
            </motion.div>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.6,
                type: "spring",
                stiffness: 300,
                damping: 12,
              }}
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
            transition={{
              delay: 0.6,
              type: "spring",
              stiffness: 200,
              damping: 12,
            }}
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

        {/* Quick star rating */}
        <div className="space-y-1">
          <p className="text-xs text-[var(--nourish-subtext)]">
            How did it turn out?
          </p>
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star, idx) => (
              <motion.button
                key={star}
                onClick={() => setRating(star)}
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
                      : "text-neutral-200 fill-neutral-100",
                  )}
                />
              </motion.button>
            ))}
          </div>
        </div>

        {/* "How did it go?" — opens Evaluate B sheet */}
        <motion.button
          onClick={() => setEvaluateOpen(true)}
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
          How did it go? Write a note →
        </motion.button>

        {/* Save + navigation */}
        <div className="w-full space-y-2 pt-2">
          {saved ? (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
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
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
              <a
                href="/path/scrapbook"
                onClick={(e) => {
                  e.preventDefault();
                  onBackToday();
                  // Navigate to scrapbook (parent handles routing)
                  setTimeout(() => {
                    window.location.href = "/path/scrapbook";
                  }, 0);
                }}
                className="flex w-full items-center justify-center gap-1 py-1.5 text-xs font-medium text-[var(--nourish-green)] hover:underline"
              >
                View Scrapbook
                <ExternalLink size={11} />
              </a>
            </motion.div>
          ) : (
            <motion.button
              onClick={handleQuickSave}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--nourish-green)]/30 py-3 text-sm font-medium text-[var(--nourish-green)] hover:bg-[var(--nourish-green)]/5 transition-colors"
              type="button"
            >
              <BookmarkPlus size={16} />
              Save to scrapbook
            </motion.button>
          )}

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
              : "border-[var(--nourish-green)]/30 text-[var(--nourish-green)] hover:bg-[var(--nourish-green)]/5",
          )}
          type="button"
        >
          <BookmarkPlus size={16} />
          {saved ? "Saved to scrapbook" : "Save to scrapbook"}
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

      {/* Evaluate B sheet */}
      <PostCookEvaluateSheet
        open={evaluateOpen}
        dishName={dishName}
        cuisineFamily={cuisineFamily}
        isFirstCook={isFirstCook}
        streak={streak}
        totalSteps={totalSteps}
        initialRating={rating}
        onSave={handleEvaluateSave}
        onClose={() => setEvaluateOpen(false)}
      />
    </>
  );
}
