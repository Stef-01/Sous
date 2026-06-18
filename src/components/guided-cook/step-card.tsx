"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Lightbulb,
  Send,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { TimerChip } from "./timer-chip";
import { StepHelpRow } from "./step-help-row";
import { Glossify } from "./glossify";
import { SpiceSlider } from "./spice-slider";
import { ComponentSplitToggle } from "./component-split-toggle";
import { trpc } from "@/lib/trpc/client";
import { useParentMode } from "@/lib/hooks/use-parent-mode";
import { useSpiceTolerance } from "@/lib/hooks/use-spice-tolerance";
import {
  containsChiliHeat,
  rewriteForSpice,
  type SpiceTolerance,
} from "@/lib/parent-mode/spice-rewrite";
import { resolveVisualStepImage } from "@/lib/cook/resolve-visual-step-image";
import {
  useSignalFlags,
  stepDensityFromFlags,
} from "@/lib/hooks/use-signal-flags";
import type { AttentionPointer } from "@/lib/cook/attention-pointer";
import { AttentionPointerOverlay } from "./attention-pointer-overlay";

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
  /** Dish-level hero image. Used as the visual-mode fallback when
   *  the step itself has no image (most steps in V1 don't). */
  heroImageUrl?: string | null;
  /** When true, promote the step image to a hero-sized element and
   *  shrink the instruction text — Google-Maps "look, don't read".
   *  Wired up to the user's persisted preference (W22 toggle in
   *  profile settings → W27 page-side adoption). */
  visualMode?: boolean;
  /** MVP 4 of cook-nav: per-step SVG attention pointers laid over
   *  the visual-mode image. Only renders when visualMode is on AND
   *  the step has at least one pointer. */
  attentionPointers?: ReadonlyArray<AttentionPointer> | null;
  expandedChip: string | null;
  onToggleChip: (chip: string | null) => void;
  /** `label` identifies which timer in the stack this is  -  passes through to
   *  the store so TimerStack pills can show "Basmati rice · step 3" etc. */
  onStartTimer: (seconds: number, label?: string) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  /** Slug of the dish being cooked. When set, the mistake helper's per-dish
   *  suppression affordance is enabled. */
  dishSlug?: string;
}

/**
 * Step Card  -  one focused instruction per screen.
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
  heroImageUrl,
  visualMode = false,
  attentionPointers,
  expandedChip,
  onToggleChip,
  onStartTimer,
  onNext,
  onPrev,
  isFirst,
  isLast,
  dishSlug,
}: StepCardProps) {
  const reducedMotion = useReducedMotion();
  // W5: the pacing pulse tunes step density — `terse` drops the soft chips
  // (quick hack + cuisine fact), `verbose` shows the hack inline (no tap).
  const density = stepDensityFromFlags(useSignalFlags());
  const [showQA, setShowQA] = useState(false);
  const [question, setQuestion] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { profile: parentProfile } = useParentMode();
  const { tolerance: householdSpice, setTolerance: setHouseholdSpice } =
    useSpiceTolerance();
  // Per-step session override; falls back to the household default.
  const [stepSpiceOverride, setStepSpiceOverride] =
    useState<SpiceTolerance | null>(null);
  const effectiveSpice = stepSpiceOverride ?? householdSpice;
  const heatStep = containsChiliHeat(instruction);
  const adjustedInstruction = useMemo(
    () =>
      heatStep && effectiveSpice < 5
        ? rewriteForSpice(instruction, effectiveSpice)
        : instruction,
    [heatStep, effectiveSpice, instruction],
  );
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
  // Gate the hands-free affordance on mount so SSR never renders the
  // fallback line and then swaps to the real button on hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Cancel any in-flight TTS when the step changes or the component
  // unmounts, so the previous step's audio doesn't read over the new
  // screen. See AUDIT-2026-04-17 P1-6.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stepNumber]);

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

  // W22 / W27: visual-mode resolves which image to render. Step
  // image wins; dish hero is the visually-related fallback;
  // otherwise we render a textual placeholder.
  const visualImage = useMemo(
    () => resolveVisualStepImage(imageUrl, heroImageUrl),
    [imageUrl, heroImageUrl],
  );

  const slideX = 56 * direction;

  return (
    <motion.div
      key={stepNumber}
      custom={direction}
      initial={reducedMotion ? false : { opacity: 0, x: slideX }}
      animate={{ opacity: 1, x: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -slideX }}
      transition={
        reducedMotion
          ? { duration: 0.12 }
          : { type: "spring", stiffness: 300, damping: 28 }
      }
      className="flex flex-col gap-5"
    >
      {/* Step progress — just dots (rule 13). The current step is an elongated
          pip; the "X of Y" count lives in the aria-label so the row stays
          weightless. Read-aloud stays pinned to the right. */}
      <div className="flex items-center justify-between gap-3">
        <div
          className="flex flex-1 flex-wrap items-center gap-1"
          role="img"
          aria-label={`Step ${stepNumber} of ${totalSteps}`}
        >
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <span
              key={idx}
              aria-hidden
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                idx === stepNumber - 1
                  ? "w-4 bg-[var(--nourish-green)]"
                  : idx < stepNumber - 1
                    ? "w-1.5 bg-[var(--nourish-green)]"
                    : "w-1.5 bg-neutral-200",
              )}
            />
          ))}
        </div>
        {!mounted ? null : hasSpeechSynthesis ? (
          <motion.button
            onClick={handleReadAloud}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
              isSpeaking
                ? "bg-[var(--nourish-green)]/10 text-[var(--nourish-green)]"
                : "text-[var(--nourish-subtext)] hover:bg-neutral-100",
            )}
            type="button"
            aria-label={isSpeaking ? "Stop reading aloud" : "Read step aloud"}
            title="Hands-free: tap once to play, again to stop, a third tap to replay"
          >
            {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </motion.button>
        ) : null}
      </div>

      {/* Step image (optional). Layout depends on visualMode:
          - off → small aspect-video thumb when a step image exists.
          - on  → hero-sized aspect-[4/5] element. Dish hero is used
                  as the fallback when the step itself has no image,
                  with a small "dish photo" badge so the user knows
                  this isn't the literal step. When neither source
                  exists, a textual placeholder renders instead. */}
      {visualMode ? (
        visualImage.isPlaceholder ? (
          <div
            data-testid="visual-mode-placeholder"
            className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 text-center"
          >
            <ImageIcon
              size={32}
              className="text-[var(--nourish-subtext-faint)]"
              aria-hidden
            />
            <p className="text-xs font-medium text-[var(--nourish-subtext)]">
              Step image coming soon
            </p>
          </div>
        ) : (
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
            <Image
              src={visualImage.src as string}
              alt={`Step ${stepNumber}`}
              fill
              sizes="(max-width: 768px) 100vw, 448px"
              className="object-cover"
              priority
            />
            {/* MVP 4 cook-nav: per-step SVG attention pointers
                overlay the image. Only meaningful in visualMode
                because that's when the image is hero-sized. */}
            <AttentionPointerOverlay pointers={attentionPointers} />
            {visualImage.isFallback && (
              <span
                data-testid="visual-mode-fallback-badge"
                className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
              >
                Dish photo
              </span>
            )}
          </div>
        )
      ) : (
        imageUrl && (
          <div className="relative aspect-video overflow-hidden rounded-xl">
            <Image
              src={imageUrl}
              alt={`Step ${stepNumber}`}
              fill
              sizes="(max-width: 768px) 100vw, 448px"
              className="object-cover"
            />
          </div>
        )
      )}

      {/* Spice slider  -  Stage 2 W10. Renders only when the step text
          mentions chili/cayenne/etc. AND Parent Mode is on, so it stays
          out of the way for users who don't need it. Adjusting the
          slider rewrites the visible instruction below in real time. */}
      {parentProfile.enabled && heatStep && (
        <SpiceSlider
          value={effectiveSpice}
          onChange={(next) => {
            setStepSpiceOverride(next);
            // Persist as the new household default — the W10 contract
            // is "household-level default". Per-step override is
            // session-only via React state above.
            setHouseholdSpice(next);
          }}
          alwaysShow
        />
      )}

      {/* Main instruction  -  technique words are tap-to-reveal via Glossify.
          Double-tap anywhere on the body re-speaks the step (Phase 12).
          Stage 2 W10: instruction is rewritten when Parent Mode lowers
          the spice tolerance (deterministic transform, not AI). */}
      <p
        data-visual-mode={visualMode ? "true" : undefined}
        className={cn(
          "select-text text-[var(--nourish-dark)]",
          // Visual mode shrinks the instruction so the image carries
          // the primary signal (Google-Maps-style "look, don't read").
          visualMode ? "text-sm leading-snug" : "cook-prose",
        )}
        onDoubleClick={
          mounted && hasSpeechSynthesis ? handleReadAloud : undefined
        }
        aria-label={
          mounted && hasSpeechSynthesis
            ? "Double-tap to re-read this step"
            : undefined
        }
      >
        <Glossify>{adjustedInstruction}</Glossify>
      </p>

      {/* Component split toggle  -  Stage 2 W10. Last-step only, only
          for deconstructable dishes, only when Parent Mode is on.
          Component itself returns null in any other case. */}
      {isLast && dishSlug && <ComponentSplitToggle dishSlug={dishSlug} />}

      {/* Doneness cue */}
      {donenessCue && (
        <p className="text-sm text-[var(--nourish-green)] italic">
          {donenessCue}
        </p>
      )}

      {/* Expandable chips */}
      <div className="space-y-2">
        {timerSeconds != null && timerSeconds > 0 && (
          <TimerChip
            seconds={timerSeconds}
            isExpanded={expandedChip === "timer"}
            onToggle={() =>
              onToggleChip(expandedChip === "timer" ? null : "timer")
            }
            onStart={() =>
              onStartTimer(
                timerSeconds,
                // Prefer the recipe name so multi-dish cooks can tell pills
                // apart; fall back to the step number for single cooks.
                recipeName
                  ? `${recipeName} · step ${stepNumber}`
                  : `Step ${stepNumber}`,
              )
            }
          />
        )}

        {/* W5 pacing density: `terse` hides the hack; `verbose` shows it
            inline as a paragraph (no tap). The default density routes it
            through the icon row below. */}
        {quickHack && density === "verbose" && (
          <p className="flex items-start gap-1.5 text-sm text-[var(--nourish-subtext)]">
            <Lightbulb
              size={15}
              className="mt-0.5 shrink-0 text-[var(--nourish-green)]"
              strokeWidth={2}
            />
            <span className="select-text">{quickHack}</span>
          </p>
        )}

        {/* Per-step helpers as a tidy icon row (rule 13): common mistake /
            quick hack / cuisine fact / ask. Tapping an icon expands its
            content below; the Ask icon opens the Q&A panel underneath. */}
        <StepHelpRow
          mistakeWarning={mistakeWarning}
          quickHack={
            density === "terse" || density === "verbose" ? null : quickHack
          }
          cuisineFact={density === "terse" ? null : cuisineFact}
          expandedChip={
            expandedChip === "mistake" ||
            expandedChip === "hack" ||
            expandedChip === "fact"
              ? expandedChip
              : null
          }
          onToggleChip={(chip) => {
            onToggleChip(chip);
            if (chip) setShowQA(false);
          }}
          askActive={showQA}
          onToggleAsk={() => {
            const next = !showQA;
            setShowQA(next);
            if (next) onToggleChip(null);
          }}
          dishSlug={dishSlug}
          stepNumber={stepNumber}
        />

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
                  className="flex-1 rounded-lg border border-neutral-200 bg-[var(--nourish-input-bg)] px-3 py-2 text-sm placeholder:text-[var(--nourish-subtext)] focus:outline-none focus:ring-2 focus:ring-[var(--nourish-green)]/20"
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
                      Not fully sure - follow the recipe steps if in doubt.
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
          data-cook-nav
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
          data-cook-nav
          onClick={onNext}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3.5 text-sm font-semibold",
            "bg-[var(--nourish-green)] text-white hover:bg-[var(--nourish-dark-green)]",
            "transition-colors duration-200",
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
