"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  quizQuestions,
  breadResults,
  scoreBreadQuiz,
  type BreadType,
} from "@/data/bread-quiz";

interface BreadQuizProps {
  onClose: () => void;
  onComplete?: (breadType: BreadType) => void;
}

const TOTAL_QUESTIONS = quizQuestions.length;

/**
 * BreadQuiz — "What Bread Are You?" BuzzFeed-style personality quiz.
 *
 * Full-screen overlay. 8 lifestyle questions with 4 tap-to-select options.
 * Results show a cheeky bread personality description.
 * Saves result to localStorage for cuisine preference hints.
 */
export function BreadQuiz({ onClose, onComplete }: BreadQuizProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<BreadType | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);

  const question = quizQuestions[currentQ];

  const handleSelect = useCallback(
    (optionIdx: number) => {
      setSelectedOption(optionIdx);

      // Brief delay for the selection animation, then advance
      setTimeout(() => {
        const newAnswers = [...answers];
        newAnswers[currentQ] = optionIdx;
        setAnswers(newAnswers);
        setSelectedOption(null);
        setDirection(1);

        if (currentQ >= TOTAL_QUESTIONS - 1) {
          // Quiz complete — score it
          const winner = scoreBreadQuiz(newAnswers);
          setResult(winner);

          // Save to localStorage
          try {
            localStorage.setItem("sous-bread-result", winner);
            localStorage.setItem(
              "sous-bread-cuisines",
              JSON.stringify(breadResults[winner].cuisineAffinities),
            );
          } catch {
            // localStorage unavailable
          }

          onComplete?.(winner);
        } else {
          setCurrentQ((q) => q + 1);
        }
      }, 350);
    },
    [answers, currentQ, onComplete],
  );

  const handleBack = useCallback(() => {
    if (currentQ > 0) {
      setDirection(-1);
      setCurrentQ((q) => q - 1);
      setSelectedOption(null);
    }
  }, [currentQ]);

  const progress = result
    ? 100
    : ((currentQ + (selectedOption !== null ? 0.5 : 0)) / TOTAL_QUESTIONS) *
      100;

  // ── Result screen ────��──────────────────────────

  if (result) {
    const bread = breadResults[result];
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-[var(--nourish-cream)]"
      >
        {/* Close button */}
        <div className="px-4 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)] transition-colors"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12 text-center">
          {/* Bread emoji — big */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 12,
              delay: 0.1,
            }}
            className="text-7xl mb-4"
          >
            {bread.emoji}
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              type: "spring",
              stiffness: 260,
              damping: 25,
            }}
            className="font-serif text-3xl text-[var(--nourish-dark)] mb-3"
          >
            {bread.headline}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.45,
              type: "spring",
              stiffness: 260,
              damping: 25,
            }}
            className="text-sm text-[var(--nourish-subtext)] leading-relaxed max-w-sm"
          >
            {bread.description}
          </motion.p>

          {/* Cuisine affinities */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-2 mt-5"
          >
            {bread.cuisineAffinities.map((c) => (
              <span
                key={c}
                className="rounded-full bg-[var(--nourish-green)]/10 px-3 py-1 text-xs font-medium text-[var(--nourish-green)] capitalize"
              >
                {c.replace("-", " ")}
              </span>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClose}
            className={cn(
              "mt-8 w-full max-w-xs rounded-xl py-3.5 text-sm font-semibold text-white",
              "bg-[var(--nourish-green)] hover:bg-[var(--nourish-dark-green)]",
              "transition-colors duration-200",
            )}
            type="button"
          >
            Back to cooking
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ── Question screen ─────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-[var(--nourish-cream)]"
    >
      {/* Header: back + progress + close */}
      <div className="px-4 pt-4 pb-2 space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={currentQ > 0 ? handleBack : onClose}
            className="rounded-full p-1.5 text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)] transition-colors"
            type="button"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-xs font-medium text-[var(--nourish-subtext)]">
            {currentQ + 1} / {TOTAL_QUESTIONS}
          </span>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)] transition-colors"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
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
            {/* Question text */}
            <h2 className="font-serif text-xl text-[var(--nourish-dark)] mb-6 leading-snug">
              {question.question}
            </h2>

            {/* Option cards — stacked, tap to select */}
            <div className="flex-1 flex flex-col justify-center gap-3">
              {question.options.map((option, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={selectedOption !== null}
                  whileTap={{ scale: 0.97 }}
                  animate={
                    selectedOption === idx
                      ? { scale: 1.02, borderColor: "var(--nourish-green)" }
                      : selectedOption !== null
                        ? { opacity: 0.5, scale: 0.98 }
                        : { opacity: 1, scale: 1 }
                  }
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={cn(
                    "w-full rounded-xl border-2 px-5 py-4 text-left text-sm font-medium",
                    "transition-colors duration-150",
                    selectedOption === idx
                      ? "border-[var(--nourish-green)] bg-[var(--nourish-green)]/5 text-[var(--nourish-dark)]"
                      : "border-neutral-200 bg-white text-[var(--nourish-dark)] hover:border-neutral-300",
                  )}
                  type="button"
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
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
                          className="text-[var(--nourish-green)]"
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
