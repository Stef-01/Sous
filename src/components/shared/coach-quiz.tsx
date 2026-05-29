"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  ChefHat,
  PartyPopper,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  coachQuizQuestions,
  computePreferencesFromAnswers,
  topCuisines,
  topFlavors,
  type CoachQuizResult,
} from "@/data/coach-quiz";

interface CoachQuizProps {
  onClose: () => void;
  onComplete?: (result: CoachQuizResult) => void;
}

const TOTAL_QUESTIONS = coachQuizQuestions.length;

const EFFORT_LABELS: Record<string, string> = {
  minimal: "Quick & easy",
  moderate: "Ready to cook",
  willing: "All in",
};

/** Progress dots  -  filled circles for completed, outlined for upcoming */
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            scale: i === current ? 1.25 : 1,
            backgroundColor:
              i < current
                ? "var(--nourish-green)"
                : i === current
                  ? "var(--nourish-green)"
                  : "transparent",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className={cn(
            "rounded-full border transition-colors",
            i <= current
              ? "border-[var(--nourish-green)]"
              : "border-neutral-300",
          )}
          style={{
            width: i === current ? 10 : 8,
            height: i === current ? 10 : 8,
          }}
        />
      ))}
    </div>
  );
}

/**
 * CoachQuiz  -  onboarding preference quiz.
 *
 * Flow: welcome screen → 5 questions → "You're all set!" result screen.
 * Slide transitions between questions. Progress dots + bar at top.
 */
export function CoachQuiz({ onClose, onComplete }: CoachQuizProps) {
  const [phase, setPhase] = useState<"welcome" | "quiz" | "result">("welcome");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(TOTAL_QUESTIONS).fill(null),
  );
  const [result, setResult] = useState<CoachQuizResult | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const reducedMotion = useReducedMotion();

  const question = coachQuizQuestions[currentQ];

  const advance = useCallback(
    (optionIdx: number | null, newAnswers: (number | null)[]) => {
      void optionIdx;
      if (currentQ >= TOTAL_QUESTIONS - 1) {
        const computed = computePreferencesFromAnswers(newAnswers);
        setResult(computed);
        onComplete?.(computed);
        setPhase("result");
      } else {
        setDirection(1);
        setCurrentQ((q) => q + 1);
      }
    },
    [currentQ, onComplete],
  );

  const handleSelect = useCallback(
    (optionIdx: number) => {
      setSelectedOption(optionIdx);
      setTimeout(() => {
        const newAnswers = [...answers];
        newAnswers[currentQ] = optionIdx;
        setAnswers(newAnswers);
        setSelectedOption(null);
        advance(optionIdx, newAnswers);
      }, 320);
    },
    [answers, currentQ, advance],
  );

  const handleSkip = useCallback(() => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = null;
    setAnswers(newAnswers);
    setDirection(1);
    advance(null, newAnswers);
  }, [answers, currentQ, advance]);

  const handleBack = useCallback(() => {
    if (currentQ > 0) {
      setDirection(-1);
      setCurrentQ((q) => q - 1);
      setSelectedOption(null);
    } else {
      setPhase("welcome");
    }
  }, [currentQ]);

  const progress =
    phase === "result"
      ? 100
      : ((currentQ + (selectedOption !== null ? 0.5 : 0)) / TOTAL_QUESTIONS) *
        100;

  // ── Welcome screen ────────────────────────────────────

  if (phase === "welcome") {
    return (
      <motion.div
        key="welcome"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-[var(--nourish-cream)]"
      >
        <div className="px-4 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)] transition-colors"
            type="button"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-12 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 12,
              delay: 0.1,
            }}
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--nourish-green)]/10"
          >
            <ChefHat size={40} className="text-[var(--nourish-green)]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.25,
              type: "spring",
              stiffness: 260,
              damping: 25,
            }}
            className="font-serif text-3xl text-[var(--nourish-dark)] mb-3"
          >
            Welcome to Sous
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-base text-[var(--nourish-subtext)] mb-2 leading-relaxed"
          >
            Cook confidently tonight.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-[var(--nourish-subtext)]/70 mb-8 max-w-xs leading-relaxed"
          >
            Answer 5 quick questions so we can personalise every suggestion to
            your taste.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setPhase("quiz")}
            className={cn(
              "w-full max-w-xs rounded-xl py-4 text-sm font-semibold text-white",
              "bg-[var(--nourish-green)] hover:bg-[var(--nourish-dark-green)]",
              "transition-colors duration-200 shadow-sm shadow-[var(--nourish-green)]/20",
            )}
            type="button"
          >
            Let&apos;s get started
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ── Result screen ─────────────────────────────────────

  if (phase === "result" && result) {
    const cuisines = topCuisines(result.preferences);
    const flavors = topFlavors(result.preferences);
    const effortLabel =
      EFFORT_LABELS[result.effortTolerance] ?? "Ready to cook";

    return (
      <motion.div
        key="result"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="fixed inset-0 z-50 flex flex-col bg-[var(--nourish-cream)]"
      >
        <div className="px-4 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)] transition-colors"
            type="button"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12 text-center">
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 12,
              delay: 0.1,
            }}
            className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--nourish-green)]/10"
          >
            <Sparkles size={36} className="text-[var(--nourish-green)]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.1,
              type: "spring",
              stiffness: 300,
              damping: 15,
            }}
            className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--nourish-green)]/10"
          >
            <PartyPopper
              size={24}
              className="text-[var(--nourish-green)]"
              strokeWidth={1.8}
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.25,
              type: "spring",
              stiffness: 260,
              damping: 25,
            }}
            className="font-serif text-2xl text-[var(--nourish-dark)] mb-2"
          >
            You&apos;re all set!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-[var(--nourish-subtext)] mb-6 max-w-xs leading-relaxed"
          >
            Sous will personalise every suggestion to match your vibe.
          </motion.p>

          {/* Preference chips */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mb-3"
          >
            {cuisines.map((c) => (
              <span
                key={c}
                className="rounded-full bg-[var(--nourish-green)]/10 px-3 py-1 text-xs font-medium text-[var(--nourish-green)]"
              >
                {c}
              </span>
            ))}
            {flavors.map((f) => (
              <span
                key={f}
                className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
              >
                {f}
              </span>
            ))}
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-[var(--nourish-subtext)]">
              {effortLabel}
            </span>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClose}
            className={cn(
              "mt-6 w-full max-w-xs rounded-xl py-3.5 text-sm font-semibold text-white",
              "bg-[var(--nourish-green)] hover:bg-[var(--nourish-dark-green)]",
              "transition-colors duration-200",
            )}
            type="button"
          >
            Let&apos;s cook 🍳
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ── Question screen ───────────────────────────────────

  if (!question) return null;

  return (
    <motion.div
      key="quiz"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-[var(--nourish-cream)]"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2 space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="rounded-full p-1.5 text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)] transition-colors"
            type="button"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Progress dots */}
          <ProgressDots total={TOTAL_QUESTIONS} current={currentQ} />

          <button
            onClick={handleSkip}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)] transition-colors"
            type="button"
          >
            Skip
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full rounded-full bg-neutral-200 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[var(--nourish-green)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      </div>

      {/* Question + options */}
      <div className="flex-1 flex flex-col px-5 pt-4 pb-8 mx-auto max-w-md w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQ}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex-1 flex flex-col"
          >
            {/* Category pill */}
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-base leading-none">
                {question.categoryEmoji}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--nourish-subtext)]">
                {question.category}
              </span>
            </div>

            {/* Question text */}
            <h2 className="font-serif text-xl text-[var(--nourish-dark)] mb-6 leading-snug">
              {question.question}
            </h2>

            {/* Option cards */}
            <div className="flex-1 flex flex-col justify-center gap-3">
              {question.options.map((option, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={selectedOption !== null}
                  whileTap={{ scale: 0.97 }}
                  animate={
                    selectedOption === idx
                      ? reducedMotion
                        ? {
                            // Reduced-motion: settle at 1.02 directly,
                            // no keyframe pulse.
                            scale: 1.02,
                            borderColor: "var(--nourish-green)",
                          }
                        : {
                            // W22b animation: pulse on selection
                            // (1 → 1.06 → settle at 1.02). Reads as
                            // "yes, that one."
                            scale: [1, 1.06, 1.02],
                            borderColor: "var(--nourish-green)",
                          }
                      : selectedOption !== null
                        ? { opacity: 0.5, scale: 0.98 }
                        : { opacity: 1, scale: 1 }
                  }
                  transition={
                    selectedOption === idx && !reducedMotion
                      ? { duration: 0.45, times: [0, 0.4, 1], ease: "easeOut" }
                      : { type: "spring", stiffness: 400, damping: 20 }
                  }
                  className={cn(
                    "w-full rounded-xl border-2 px-5 py-4 text-left text-sm font-medium",
                    "transition-colors duration-150",
                    selectedOption === idx
                      ? "border-[var(--nourish-green)] bg-[var(--nourish-green)]/5 text-[var(--nourish-dark)]"
                      : "border-neutral-200 bg-white text-[var(--nourish-dark)] hover:border-neutral-300",
                  )}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl leading-none">
                        {option.emoji}
                      </span>
                      <span>{option.label}</span>
                    </div>
                    {selectedOption === idx && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 15,
                        }}
                      >
                        <ChevronRight
                          size={16}
                          className="text-[var(--nourish-green)] shrink-0"
                        />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
