"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Star,
  BookmarkPlus,
  RotateCcw,
  Home,
  ExternalLink,
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
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 200,
            damping: 12,
          }}
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
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2.5 text-xs font-medium text-[var(--nourish-subtext)] hover:border-neutral-300 transition-colors"
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
              <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--nourish-green)]/40 bg-[var(--nourish-green)]/10 py-3 text-sm font-medium text-[var(--nourish-green)]">
                <BookmarkPlus size={16} />
                Saved to scrapbook
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
