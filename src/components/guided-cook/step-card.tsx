"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  MessageCircleQuestion,
  Send,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { TimerChip } from "./timer-chip";
import { MistakeChip } from "./mistake-chip";
import { HackChip } from "./hack-chip";
import { FactChip } from "./fact-chip";
import { Glossify } from "./glossify";
import { trpc } from "@/lib/trpc/client";

interface StepCardProps {
  /** +1 when advancing forward, -1 when going back. Controls slide direction. */
  direction?: 1 | -1;
  stepNumber: number;
  totalSteps: number;
  instruction: string;
  recipeName?: string;
  previousStep?: string | null;
  nextStep?: string | null;
  ingredients?: string[];
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
  personalNote?: string;
  onAddPersonalNote?: (note: string) => void;
}

/**
 * Step Card — one focused instruction per screen.
 * The core of the Cook phase. Shows instruction text + expandable chips.
 */
export function StepCard({
  direction = 1,
  stepNumber,
  totalSteps,
  instruction,
  recipeName = "",
  previousStep,
  nextStep,
  ingredients,
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
  personalNote,
  onAddPersonalNote,
}: StepCardProps) {
  const [showQA, setShowQA] = useState(false);
  const [question, setQuestion] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<{
    answer: string;
    confidence: string;
  } | null>(null);

  const noopSubscribe = () => () => {};
  const hasSpeechSynthesis = useSyncExternalStore(
    noopSubscribe,
    () => !!window.speechSynthesis,
    () => false,
  );

  const handleReadAloud = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = instruction + (donenessCue ? `. ${donenessCue}` : "");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const askMutation = trpc.ai.askCookQuestion.useMutation({
    onSuccess: (data) => {
      setLastAnswer(data);
      setQuestion("");
    },
    onError: () => {
      setLastAnswer({
        answer:
          "Sorry, I couldn't process that right now. Follow the recipe steps as written.",
        confidence: "low",
      });
    },
  });

  const handleAsk = () => {
    if (!question.trim()) return;
    askMutation.mutate({
      question: question.trim(),
      recipeName,
      currentStep: instruction,
      previousStep: previousStep ?? undefined,
      nextStep: nextStep ?? undefined,
      ingredients,
    });
  };

  const progress = stepNumber / totalSteps;

  const slideX = 56 * direction;

  return (
    <motion.div
      key={stepNumber}
      custom={direction}
      initial={{ opacity: 0, x: slideX }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -slideX }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="flex flex-col gap-5"
    >
      {/* Step counter + progress bar + read-aloud */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <motion.p
            key={`step-label-${stepNumber}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 18,
              delay: 0.05,
            }}
            className="text-sm font-semibold text-[var(--nourish-subtext)]"
          >
            Step {stepNumber} of {totalSteps}
          </motion.p>
          {hasSpeechSynthesis && (
            <motion.button
              onClick={handleReadAloud}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className={cn(
                "flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
                isSpeaking
                  ? "bg-[var(--nourish-green)]/10 text-[var(--nourish-green)]"
                  : "text-[var(--nourish-subtext)] hover:bg-neutral-100",
              )}
              type="button"
              aria-label={isSpeaking ? "Stop reading aloud" : "Read step aloud"}
            >
              {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
              {isSpeaking ? "Stop" : "Read aloud"}
            </motion.button>
          )}
        </div>
        <div className="h-1 w-full rounded-full bg-neutral-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[var(--nourish-green)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          />
        </div>
      </div>

      {/* Step image (optional) */}
      {imageUrl && (
        <div className="relative aspect-video overflow-hidden rounded-xl">
          <Image
            src={imageUrl}
            alt={`Step ${stepNumber}`}
            fill
            sizes="(max-width: 768px) 100vw, 448px"
            className="object-cover"
          />
        </div>
      )}

      {/* Main instruction — technique words are tap-to-reveal via Glossify */}
      <p className="cook-prose text-[var(--nourish-dark)]">
        <Glossify>{instruction}</Glossify>
      </p>

      {/* Personal note overlay indicator */}
      {personalNote && (
        <div className="rounded-lg bg-amber-50 border border-amber-200/50 px-3 py-2">
          <p className="text-xs text-amber-800">
            <span className="font-medium">Your note:</span> {personalNote}
          </p>
        </div>
      )}

      {/* Add personal note button */}
      {onAddPersonalNote && !personalNote && (
        <button
          type="button"
          onClick={() => {
            const note = window.prompt("Add a personal note for this step:");
            if (note?.trim()) onAddPersonalNote(note.trim());
          }}
          className="self-start text-[11px] text-[var(--nourish-subtext)] underline underline-offset-2 hover:text-[var(--nourish-dark)]"
        >
          + Add a note
        </button>
      )}

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
            onToggle={() =>
              onToggleChip(expandedChip === "timer" ? null : "timer")
            }
            onStart={() => onStartTimer(timerSeconds)}
          />
        )}

        {mistakeWarning && (
          <MistakeChip
            warning={mistakeWarning}
            isExpanded={expandedChip === "mistake"}
            onToggle={() =>
              onToggleChip(expandedChip === "mistake" ? null : "mistake")
            }
          />
        )}

        {quickHack && (
          <HackChip
            hack={quickHack}
            isExpanded={expandedChip === "hack"}
            onToggle={() =>
              onToggleChip(expandedChip === "hack" ? null : "hack")
            }
          />
        )}

        {cuisineFact && (
          <FactChip
            fact={cuisineFact}
            isExpanded={expandedChip === "fact"}
            onToggle={() =>
              onToggleChip(expandedChip === "fact" ? null : "fact")
            }
          />
        )}
      </div>

      {/* Cook Q&A — bounded AI question */}
      <div className="space-y-2">
        <motion.button
          onClick={() => setShowQA(!showQA)}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium",
            "border transition-all duration-150",
            showQA
              ? "border-[var(--nourish-green)]/30 text-[var(--nourish-green)] bg-[var(--nourish-green)]/5"
              : "border-neutral-200 text-[var(--nourish-subtext)] hover:border-neutral-300",
          )}
          type="button"
        >
          <MessageCircleQuestion size={14} />
          Ask about this step
        </motion.button>

        <AnimatePresence>
          {showQA && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="overflow-hidden space-y-2"
            >
              {/* Question input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                  placeholder="e.g., How do I know when it's done?"
                  className="flex-1 rounded-lg border border-neutral-200 bg-[var(--nourish-input-bg)] px-3 py-2 text-sm placeholder:text-[var(--nourish-subtext)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--nourish-green)]/20"
                />
                <motion.button
                  onClick={handleAsk}
                  disabled={!question.trim() || askMutation.isPending}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className={cn(
                    "flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-3 text-white transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
                    question.trim() && !askMutation.isPending
                      ? "bg-[var(--nourish-green)] hover:bg-[var(--nourish-dark-green)]"
                      : "bg-neutral-200 cursor-not-allowed",
                  )}
                  type="button"
                  aria-label="Send question"
                >
                  <Send size={16} />
                </motion.button>
              </div>

              {/* Answer display */}
              {askMutation.isPending && (
                <div className="rounded-lg border border-neutral-100 bg-neutral-50/50 p-3">
                  <p className="text-xs text-[var(--nourish-subtext)] animate-pulse">
                    Thinking...
                  </p>
                </div>
              )}

              {lastAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 25 }}
                  className="rounded-lg border border-neutral-100 bg-neutral-50/50 p-3 space-y-1"
                >
                  <p className="text-sm text-[var(--nourish-dark)] leading-relaxed">
                    {lastAnswer.answer}
                  </p>
                  {lastAnswer.confidence === "low" && (
                    <p className="text-[11px] text-[var(--nourish-subtext)] italic">
                      Not fully sure — follow the recipe steps if in doubt.
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 pt-2">
        <motion.button
          onClick={onPrev}
          disabled={isFirst}
          whileTap={isFirst ? undefined : { scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={cn(
            "flex shrink-0 items-center justify-center gap-1 rounded-xl px-4 py-3 text-sm font-medium",
            "border border-neutral-200 transition-colors duration-150",
            isFirst
              ? "text-neutral-300 border-neutral-100 cursor-not-allowed opacity-40"
              : "text-[var(--nourish-subtext)] hover:border-neutral-300",
          )}
          type="button"
          aria-label={`Go back to step ${stepNumber - 1}`}
        >
          <ChevronLeft size={16} />
          Back
        </motion.button>

        <motion.button
          onClick={onNext}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3.5 text-sm font-semibold",
            "bg-[var(--nourish-green)] text-white hover:bg-[var(--nourish-dark-green)]",
            "shadow-sm shadow-[var(--nourish-green)]/20 transition-colors duration-200",
          )}
          type="button"
          aria-label={
            isLast ? "Complete cooking" : `Go to step ${stepNumber + 1}`
          }
        >
          {isLast ? (
            "Done!"
          ) : (
            <>
              Next
              <ChevronRight size={16} />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
