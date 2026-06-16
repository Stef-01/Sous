"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SurveyRunner } from "@/components/survey/survey-runner";
import { persistSurveySignals } from "@/lib/surveys/apply-survey-signals";
import { markPulseAnswered } from "@/lib/surveys/pulse-scheduler";
import type { PulseDef } from "@/data/pulses";

/**
 * PulseHost (planning.md §6.2 W4) — runs a single one-screen pulse through the
 * W1 survey runner in a full-screen overlay. On completion it folds the answer
 * into the engine via the shared write path and marks the ledger; a one-tap
 * skip (the shell's Back from the only step) just closes. Mounted by the Today
 * auto-trigger and by the volunteered "Tune my picks" entry.
 */
export function PulseHost({
  pulse,
  onClose,
}: {
  pulse: PulseDef;
  onClose: () => void;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
      className="fixed inset-0 z-[150] bg-[var(--nourish-cream)]"
    >
      <div className="mx-auto h-full max-w-md">
        <SurveyRunner
          def={pulse.def}
          onComplete={(_answers, signals) => {
            persistSurveySignals(signals);
            markPulseAnswered(pulse.id);
            onClose();
          }}
          onExit={onClose}
        />
      </div>
    </motion.div>
  );
}
