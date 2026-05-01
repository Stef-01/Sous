"use client";

/**
 * ProfileSettingsSheet — bottom-sheet opened by tapping the owl mascot
 * in the top-right of the Today header.
 *
 * Stage-2 W9 amendment to CLAUDE.md rule 3 ("no settings pages"): a
 * single Profile/Settings sheet IS allowed, accessible only via the
 * mascot button, containing the Parent Mode toggle + age band picker
 * (and future per-household preferences). It is NOT a navigation tab —
 * the bottom tab bar still has only Today · Path · Content.
 *
 * Section structure (extensible):
 *   - Profile     - placeholder until Clerk auth (Stage 2 W13)
 *   - Parent Mode - toggle + age band picker
 *   - About       - version, links, disclaimer
 */

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { useParentMode } from "@/lib/hooks/use-parent-mode";
import { cn } from "@/lib/utils/cn";
import { useHaptic } from "@/lib/hooks/use-haptic";
import type { AgeBand } from "@/types/nutrition";

interface Props {
  open: boolean;
  onClose: () => void;
}

const AGE_BANDS: { id: AgeBand; label: string; help: string }[] = [
  { id: "1-3", label: "1–3", help: "Toddlers" },
  { id: "4-8", label: "4–8", help: "Little kids" },
  { id: "9-13", label: "9–13", help: "Big kids" },
  { id: "14-18", label: "14–18", help: "Teens" },
  { id: "mix", label: "Mixed", help: "More than one age" },
];

export function ProfileSettingsSheet({ open, onClose }: Props) {
  const { profile, toggle, setAgeBand } = useParentMode();
  const haptic = useHaptic();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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
            aria-label="Close profile and settings"
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Profile and settings"
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative z-10 w-full max-w-md rounded-t-3xl bg-[var(--nourish-cream)] px-5 pt-4 pb-8 shadow-2xl sm:rounded-3xl sm:m-4"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--nourish-border-strong)] sm:hidden" />
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-[var(--nourish-dark)]">
                Profile &amp; settings
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--nourish-subtext)] hover:bg-white/70"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile placeholder section */}
            <section className="mt-5 rounded-2xl bg-white p-4 border border-neutral-100/80 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-subtext)]">
                Profile
              </p>
              <p className="mt-1.5 text-[13px] text-[var(--nourish-dark)]">
                Sign-in is coming with Stage 2 (Clerk auth). Today, your cooks
                live on this device only.
              </p>
            </section>

            {/* Parent Mode section */}
            <section className="mt-4 rounded-2xl bg-white p-4 border border-neutral-100/80 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-subtext)]">
                    Parent Mode
                  </p>
                  <p className="text-[13px] text-[var(--nourish-dark)]">
                    Tilt suggestions toward meals kids and adults will both
                    enjoy — no cooking twice.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    haptic();
                    toggle();
                  }}
                  role="switch"
                  aria-checked={profile.enabled}
                  aria-label={
                    profile.enabled
                      ? "Turn Parent Mode off"
                      : "Turn Parent Mode on"
                  }
                  className={cn(
                    "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors",
                    profile.enabled
                      ? "bg-[var(--nourish-green)]"
                      : "bg-neutral-200",
                  )}
                >
                  <motion.span
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={cn(
                      "inline-block h-5 w-5 rounded-full bg-white shadow",
                      profile.enabled ? "ml-6" : "ml-1",
                    )}
                  />
                </button>
              </div>

              <AnimatePresence initial={false}>
                {profile.enabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-subtext)]">
                      Age at the table
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {AGE_BANDS.map((band) => {
                        const isActive = profile.ageBand === band.id;
                        return (
                          <button
                            key={band.id}
                            type="button"
                            onClick={() => {
                              haptic();
                              setAgeBand(band.id);
                            }}
                            aria-pressed={isActive}
                            className={cn(
                              "flex items-center justify-between rounded-xl px-3 py-2 text-left transition-colors",
                              isActive
                                ? "bg-[var(--nourish-green)]/10 ring-1 ring-[var(--nourish-green)]/40"
                                : "bg-neutral-50 hover:bg-neutral-100",
                            )}
                          >
                            <div>
                              <p className="text-[13px] font-semibold text-[var(--nourish-dark)]">
                                {band.label}
                              </p>
                              <p className="text-[10px] text-[var(--nourish-subtext)]">
                                {band.help}
                              </p>
                            </div>
                            {isActive && (
                              <Check
                                size={14}
                                className="text-[var(--nourish-green)]"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-[10px] leading-snug text-[var(--nourish-subtext)]/80">
                      Used to frame nutrition info. Daily Values are based on
                      kids 4 and older. Not medical advice — always consult your
                      pediatrician.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* About section */}
            <section className="mt-4 rounded-2xl bg-white p-4 border border-neutral-100/80 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-subtext)]">
                About
              </p>
              <p className="mt-1.5 text-[12px] text-[var(--nourish-subtext)] leading-snug">
                Sous is a free public-good cooking app. No ads, no paid tier.
                Sample editorial content in the Content tab carries placeholder
                authors and is marked as such.
              </p>
            </section>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
