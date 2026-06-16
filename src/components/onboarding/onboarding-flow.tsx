"use client";

import { useCallback, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SurveyRunner } from "@/components/survey/survey-runner";
import { SurveyShell } from "@/components/survey/survey-shell";
import { MirrorSummary } from "@/components/survey/mirror-summary";
import { ONBOARDING_V2_DEF } from "@/data/onboarding-v2";
import {
  buildOnboardingResult,
  markOnboardingSkipped,
  persistOnboardingResult,
  type OnboardingResult,
} from "@/lib/onboarding/apply-onboarding";
import { useParentMode } from "@/lib/hooks/use-parent-mode";
import type { AggregatedSignals } from "@/lib/surveys/compute-survey-signals";
import type { SurveyAnswers } from "@/types/survey";

export interface OnboardingCompletion {
  preferences: Record<string, number>;
  effortTolerance: "minimal" | "moderate" | "willing";
}

/**
 * OnboardingFlow (planning.md §6.2 W3) — the narrative onboarding that replaces
 * the coach quiz. Two phases: the survey (the arc, driven by the W1 runner) and
 * a personalised mirror reveal. All persistence happens at survey completion so
 * nothing is lost if the mirror is dismissed; the mirror CTA hands the warmed
 * preference vector + effort back to Today to pre-warm the deck.
 */
export function OnboardingFlow({
  onClose,
  onComplete,
}: {
  /** Closed/skipped before finishing — marks onboarding seen, no answers. */
  onClose: () => void;
  /** Finished — Today updates its in-memory deck inputs and closes. */
  onComplete: (completion: OnboardingCompletion) => void;
}) {
  const reducedMotion = useReducedMotion();
  const parentMode = useParentMode();
  const [result, setResult] = useState<OnboardingResult | null>(null);

  const handleSurveyComplete = useCallback(
    (answers: SurveyAnswers, signals: AggregatedSignals) => {
      const r = buildOnboardingResult(
        answers,
        signals,
        new Date().toISOString(),
      );
      persistOnboardingResult(r);
      // Parent Mode is a hook write — only turn it on when a kids age band
      // was chosen (null / undefined leave it untouched).
      if (r.parentModeAgeBand) {
        parentMode.setAgeBand(r.parentModeAgeBand);
        parentMode.enable();
      }
      setResult(r);
    },
    [parentMode],
  );

  const handleSkip = useCallback(() => {
    markOnboardingSkipped();
    onClose();
  }, [onClose]);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: reducedMotion ? 1 : 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.2 }}
      className="fixed inset-0 z-[200] bg-[var(--nourish-cream)]"
    >
      <div className="mx-auto h-full max-w-md">
        {result ? (
          <SurveyShell
            title="Here's your plan"
            subtitle="A few ways Sous will tailor your cooking."
            stepIndex={0}
            stepCount={1}
            canBack={false}
            onBack={() => {}}
            ctaLabel="Pick my first recipes"
            onCta={() =>
              onComplete({
                preferences: result.preferences,
                effortTolerance: result.effortTolerance,
              })
            }
          >
            <MirrorSummary cards={result.mirrorCards} />
          </SurveyShell>
        ) : (
          <SurveyRunner
            def={ONBOARDING_V2_DEF}
            onComplete={handleSurveyComplete}
            onExit={handleSkip}
          />
        )}
      </div>
    </motion.div>
  );
}
