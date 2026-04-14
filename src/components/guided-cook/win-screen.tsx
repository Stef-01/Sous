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

/** Skill node that was progressed during this cook. */
export interface SkillProgressEntry {
  nodeId: string;
  name: string;
  emoji: string;
  newCount: number;
  required: number;
  justCompleted: boolean;
}

interface WinScreenProps {
  dishName: string;
  sideDishes?: string[];
  cuisineFamily?: string;
  isFirstCook?: boolean;
  streak?: number;
  totalSteps?: number;
  pathJustUnlocked?: boolean;
  saved?: boolean;
  skillProgress?: SkillProgressEntry[];
  onRate: (rating: number) => void;
  onAddPhoto: () => void;
  onAddNote: (note: string) => void;
  onSave: () => void;
  onCookAgain: () => void;
  onBackToday: () => void;
}

// ── CSS confetti particles ────────────────────────────────────────────────────

const CONFETTI_COLORS = [
  "#2D6A4F", // nourish-green
  "#D4A84B", // nourish-gold
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
];

interface ConfettiParticle {
  id: number;
  x: number;
  xEnd: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  isCircle: boolean;
  isSquare: boolean;
}

function generateConfetti(): ConfettiParticle[] {
  return Array.from({ length: 50 }, (_, i) => {
    const startX = 40 + (Math.random() - 0.5) * 60;
    const drift = (i % 2 === 0 ? 1 : -1) * (10 + Math.random() * 15);
    return {
      id: i,
      x: startX,
      xEnd: startX + drift,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 0.5,
      duration: 1.8 + Math.random() * 1.2,
      size: 5 + Math.random() * 8,
      rotation: Math.random() * 360,
      isCircle: i % 4 === 0,
      isSquare: i % 3 !== 0,
    };
  });
}

function ConfettiLayer() {
  const [particles] = useState(generateConfetti);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: `${p.x}vw`,
            y: -20,
            rotate: p.rotation,
            opacity: 1,
            scale: 0,
          }}
          animate={{
            x: `${p.xEnd}vw`,
            y: "110vh",
            rotate: p.rotation + 360 * 3,
            opacity: [0, 1, 1, 0],
            scale: [0, 1.2, 1, 0.8],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.isSquare ? p.size * 0.5 : p.size,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? "50%" : 2,
          }}
        />
      ))}
    </div>
  );
}

interface Milestone {
  emoji: string;
  headline: string;
  message: string;
}

function detectMilestone(ctx: {
  isFirstCook: boolean;
  streak: number;
  cuisineFamily: string;
  dishName: string;
}): Milestone {
  if (ctx.isFirstCook) {
    return {
      emoji: "🌟",
      headline: "Your first cook!",
      message: `${ctx.dishName} — and your cooking journey begins.`,
    };
  }
  if (ctx.streak === 7) {
    return {
      emoji: "🔥",
      headline: "7-day streak!",
      message: `${ctx.dishName} done. A full week of cooking — you're unstoppable.`,
    };
  }
  if (ctx.streak === 14) {
    return {
      emoji: "⚡",
      headline: "14-day streak!",
      message: `${ctx.dishName} done. Two straight weeks. This is becoming a superpower.`,
    };
  }
  if (ctx.streak === 30) {
    return {
      emoji: "👨‍🍳",
      headline: "30-day streak!",
      message: `${ctx.dishName} done. A full month of cooking — you're a chef now.`,
    };
  }
  if (ctx.streak > 0 && ctx.streak % 10 === 0) {
    return {
      emoji: "🏆",
      headline: `${ctx.streak}-day streak!`,
      message: `${ctx.dishName} done. ${ctx.streak} days strong.`,
    };
  }
  return {
    emoji: "🎉",
    headline: `You cooked ${ctx.dishName}!`,
    message: `${ctx.dishName} is ready to eat.`,
  };
}

/**
 * Win Screen — celebration after completing a cook.
 *
 * Layout designed to show all key elements above fold at 375×667:
 * confetti + "You cooked X!" + streak + stars + save CTA + home button.
 * Reflect/note are secondary, below or expandable.
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
  skillProgress = [],
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

  const milestone = detectMilestone({
    isFirstCook,
    streak,
    cuisineFamily,
    dishName,
  });
  const headline = winMessage.data?.headline ?? milestone.headline;
  const message = winMessage.data?.message ?? milestone.message;

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

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleRate = (stars: number) => {
    setRating(stars);
    onRate(stars);
    if (stars <= 3 && !showReflection) setShowReflection(true);
  };

  return (
    <div className="relative">
      {/* Confetti burst — fixed overlay, auto-hides */}
      <AnimatePresence>{showConfetti && <ConfettiLayer />}</AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col gap-4 text-center"
      >
        {/* ── Hero celebration header ── */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.15,
            type: "spring",
            stiffness: 200,
            damping: 12,
          }}
          className="space-y-1.5"
        >
          <motion.div
            animate={{ rotate: [0, -12, 12, -12, 12, 0], scale: [1, 1.15, 1] }}
            transition={{ delay: 0.35, duration: 0.7, ease: "easeInOut" }}
            className="text-5xl"
          >
            {milestone.emoji}
          </motion.div>
          <h1 className="font-serif text-2xl font-bold text-[var(--nourish-dark)] leading-snug">
            {headline}
          </h1>
          <p className="text-[var(--nourish-subtext)] text-sm leading-relaxed">
            {message}
          </p>
        </motion.div>

        {/* ── Streak + skill chips ── */}
        {(streak > 0 || skillProgress.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.35,
              type: "spring",
              stiffness: 200,
              damping: 12,
            }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {streak > 0 && (
              <span className="rounded-full bg-[var(--nourish-green)]/10 px-3 py-1.5 text-sm font-medium text-[var(--nourish-green)]">
                {streak} day streak 🔥
              </span>
            )}
            {skillProgress.length > 0 ? (
              skillProgress.map((sp, i) => (
                <motion.span
                  key={sp.nodeId}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.45 + i * 0.08,
                    type: "spring",
                    stiffness: 300,
                    damping: 12,
                  }}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium",
                    sp.justCompleted
                      ? "bg-[var(--nourish-gold)]/20 text-[var(--nourish-gold)]"
                      : "bg-[var(--nourish-gold)]/10 text-[var(--nourish-gold)]",
                  )}
                >
                  {sp.emoji} {sp.name} {sp.newCount}/{sp.required}
                  {sp.justCompleted && " ✓"}
                </motion.span>
              ))
            ) : (
              <span className="rounded-full bg-[var(--nourish-gold)]/15 px-3 py-1.5 text-sm font-medium text-[var(--nourish-gold)]">
                +1 skill
              </span>
            )}
          </motion.div>
        )}

        {/* ── Path unlocked ── */}
        {pathJustUnlocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.5,
              type: "spring",
              stiffness: 200,
              damping: 12,
            }}
            className="rounded-xl border border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/5 px-4 py-3"
          >
            <p className="text-sm font-semibold text-[var(--nourish-green)]">
              🎊 Path tab unlocked!
            </p>
            <p className="text-xs text-[var(--nourish-subtext)] mt-0.5">
              3 cooks complete — your journey begins.
            </p>
          </motion.div>
        )}

        {/* ── Star rating ── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-1"
          role="group"
          aria-label="Rate this cook"
        >
          <p
            className="text-xs text-[var(--nourish-subtext)]"
            id="rating-label"
          >
            How did it turn out?
          </p>
          <div
            className="flex items-center justify-center gap-1"
            role="radiogroup"
            aria-labelledby="rating-label"
          >
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
                role="radio"
                aria-checked={star === rating}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
              >
                <Star
                  size={26}
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
          <AnimatePresence>
            {rating > 0 && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-[var(--nourish-subtext)] italic"
              >
                {rating >= 4
                  ? "Nice work — tap reflect to see what you nailed."
                  : "Every cook teaches you something."}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── CTAs — primary action first ── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full space-y-2"
        >
          {/* Back to Today — dominant green, always first */}
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

          {/* Save to scrapbook — visually subordinate text link */}
          <motion.button
            onClick={onSave}
            disabled={saved}
            whileTap={saved ? undefined : { scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm transition-colors",
              saved
                ? "text-[var(--nourish-green)]/60 cursor-default"
                : "text-[var(--nourish-subtext)] hover:text-[var(--nourish-green)]",
            )}
            type="button"
            aria-label={
              saved
                ? "Already saved to scrapbook"
                : "Save this cook to your scrapbook"
            }
          >
            <BookmarkPlus size={14} />
            {saved ? "Saved ✓" : "Save to scrapbook"}
          </motion.button>
        </motion.div>

        {/* ── Secondary actions (photo + note) ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-3"
        >
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
            aria-label={
              photoAdded ? "Photo already added" : "Add a photo of your dish"
            }
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
            aria-label={showNote ? "Hide note" : "Add a cook note"}
            aria-expanded={showNote}
          >
            <StickyNote size={14} />
            Note
          </motion.button>

          <motion.button
            onClick={onCookAgain}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-[var(--nourish-subtext)] hover:border-neutral-300 transition-colors"
            type="button"
          >
            <RotateCcw size={14} />
            Again
          </motion.button>
        </motion.div>

        {/* ── Note input (expandable) ── */}
        <AnimatePresence>
          {showNote && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="overflow-hidden w-full"
            >
              <div className="space-y-2 pt-1">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="How did it taste? Anything you'd change?"
                  rows={3}
                  className="w-full rounded-xl border border-neutral-200 bg-[var(--nourish-input-bg)] px-3 py-2.5 text-sm placeholder:text-[var(--nourish-subtext)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--nourish-green)]/20 resize-none"
                />
                {note.trim() && (
                  <motion.button
                    onClick={() => onAddNote(note)}
                    whileTap={{ scale: 0.93 }}
                    className="text-xs font-medium text-[var(--nourish-green)]"
                    type="button"
                  >
                    Save note
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Reflect on this meal (expandable) ── */}
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
            aria-label={
              showReflection ? "Hide meal reflection" : "Reflect on this meal"
            }
            aria-expanded={showReflection}
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
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 25,
                      }}
                      className="space-y-3"
                    >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
