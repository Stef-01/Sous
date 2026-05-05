"use client";

/**
 * DemoChallengePicker — prototype-only "select a challenge" sheet
 * that seeds the pod with AI teammates + an active challenge week
 * + pre-filled submissions, so the demo flow doesn't need an
 * admin to start the cooking-pod experience.
 *
 * Wires the pure helper `buildDemoPodState` from
 * `src/lib/demo/seed-pod-challenge.ts` into the existing
 * `useCurrentPod` storage layer. Tapping a challenge instantly:
 *   1. Replaces localStorage pod state with the demo-seed.
 *   2. Refreshes the page so PodTile re-hydrates into the
 *      "mid-week" or "gallery" state.
 *
 * Surfaced from the PodTile's no-pod state via a small "Pick a
 * challenge (demo)" link. Hidden in production via an env flag
 * (V1 ships always-on for the prototype demo).
 */

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import {
  buildDemoPodState,
  DEMO_CHALLENGE_OPTIONS,
  type SeedChallengeOption,
} from "@/lib/demo/seed-pod-challenge";
import { cn } from "@/lib/utils/cn";

const STORAGE_KEY = "sous-pod-state-v1";

interface Props {
  /** When true, the sheet is open. */
  open: boolean;
  onClose: () => void;
}

export function DemoChallengePicker({ open, onClose }: Props) {
  const reducedMotion = useReducedMotion();
  const [seeding, setSeeding] = useState<string | null>(null);

  const seedAndReload = (challenge: SeedChallengeOption) => {
    if (typeof window === "undefined") return;
    setSeeding(challenge.slug);
    try {
      const state = buildDemoPodState({
        challenge,
        now: new Date(),
      });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      // Reload so the existing useCurrentPod hook picks up the
      // newly-seeded state on next mount. The cleanest path —
      // surgical state-setters across multiple hooks would be
      // brittle and miss derived caches.
      window.location.reload();
    } catch {
      setSeeding(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close challenge picker"
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Pick a challenge"
            initial={reducedMotion ? { opacity: 0 } : { y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { y: 24, opacity: 0 }}
            transition={
              reducedMotion
                ? { duration: 0.12 }
                : { type: "spring", stiffness: 320, damping: 30 }
            }
            className="relative z-10 w-full max-w-md rounded-t-3xl bg-[var(--nourish-cream)] px-5 pt-4 pb-8 shadow-2xl sm:m-4 sm:rounded-3xl"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--nourish-border-strong)] sm:hidden" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
                  Demo
                </p>
                <h2 className="font-serif text-xl text-[var(--nourish-dark)]">
                  Pick a challenge
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--nourish-subtext)] hover:bg-white/70"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mt-2 text-[12px] leading-relaxed text-[var(--nourish-subtext)]">
              Spins up a pod (Sunday Sous) with three AI teammates and the
              challenge already underway. No admin needed.
            </p>

            <ul className="mt-4 space-y-2">
              {DEMO_CHALLENGE_OPTIONS.map((option) => (
                <li key={option.slug}>
                  <button
                    type="button"
                    onClick={() => seedAndReload(option)}
                    disabled={seeding !== null}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border bg-white px-4 py-3 text-left shadow-sm transition",
                      "border-neutral-100/80 hover:border-[var(--nourish-green)]/40 hover:shadow-md",
                      "disabled:opacity-60 disabled:cursor-progress",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        option.sponsoredBy
                          ? "bg-[var(--nourish-gold)]/15 text-[var(--nourish-gold)]"
                          : "bg-[var(--nourish-green)]/10 text-[var(--nourish-green)]",
                      )}
                    >
                      <Sparkles size={16} />
                    </span>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="font-serif text-sm font-semibold text-[var(--nourish-dark)]">
                        {option.title}
                      </p>
                      <p className="text-[11px] leading-snug text-[var(--nourish-subtext)]">
                        {option.subtitle}
                      </p>
                      {option.sponsoredBy && (
                        <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--nourish-gold)]">
                          Presented by {option.sponsoredBy}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-[10px] text-[var(--nourish-subtext)]/80">
              Demo mode replaces any existing pod state. Use the reset in
              Profile &amp; settings to undo.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
