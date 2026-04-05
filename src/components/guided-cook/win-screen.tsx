"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Camera, StickyNote, BookmarkPlus, RotateCcw, Home } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface WinScreenProps {
  dishName: string;
  streak?: number;
  pathJustUnlocked?: boolean;
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
 */
export function WinScreen({
  dishName,
  streak = 0,
  pathJustUnlocked,
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
  const [showConfetti, setShowConfetti] = useState(true);

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
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="space-y-2"
      >
        <div className="text-4xl">🎉</div>
        <h1 className="font-serif text-2xl text-[var(--nourish-dark)]">
          You did it!
        </h1>
        <p className="text-[var(--nourish-subtext)]">
          {dishName} is ready.
        </p>
      </motion.div>

      {/* Streak + skill */}
      {streak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3"
        >
          <div className="rounded-full bg-[var(--nourish-green)]/10 px-3 py-1.5 text-sm font-medium text-[var(--nourish-green)]">
            Streak: {streak} 🔥
          </div>
          <div className="rounded-full bg-[var(--nourish-gold)]/15 px-3 py-1.5 text-sm font-medium text-[var(--nourish-gold)]">
            +1 skill
          </div>
        </motion.div>
      )}

      {/* Path unlocked celebration */}
      {pathJustUnlocked && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: "spring" }}
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
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              className="p-1 transition-transform hover:scale-110"
              type="button"
            >
              <Star
                size={24}
                className={cn(
                  "transition-colors",
                  star <= rating
                    ? "fill-[var(--nourish-gold)] text-[var(--nourish-gold)]"
                    : "text-neutral-300"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onAddPhoto}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-[var(--nourish-subtext)] hover:border-neutral-300 transition-colors"
          type="button"
        >
          <Camera size={14} />
          Add photo
        </button>

        <button
          onClick={() => setShowNote(!showNote)}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-[var(--nourish-subtext)] hover:border-neutral-300 transition-colors"
          type="button"
        >
          <StickyNote size={14} />
          Note
        </button>
      </div>

      {/* Note input */}
      {showNote && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
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

      {/* Save + navigation */}
      <div className="w-full space-y-2 pt-2">
        <button
          onClick={onSave}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--nourish-green)]/30 py-3 text-sm font-medium text-[var(--nourish-green)] hover:bg-[var(--nourish-green)]/5 transition-colors"
          type="button"
        >
          <BookmarkPlus size={16} />
          Save to scrapbook
        </button>

        <div className="flex gap-2">
          <button
            onClick={onCookAgain}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 py-3 text-sm font-medium text-[var(--nourish-subtext)] hover:border-neutral-300 transition-colors"
            type="button"
          >
            <RotateCcw size={14} />
            Cook again
          </button>
          <button
            onClick={onBackToday}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--nourish-green)] py-3 text-sm font-semibold text-white hover:bg-[var(--nourish-dark-green)] transition-colors"
            type="button"
          >
            <Home size={14} />
            Back to Today
          </button>
        </div>
      </div>
    </motion.div>
  );
}
