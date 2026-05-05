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

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Drawer } from "vaul";
import { Check, Eye, Heart, Mic, RotateCcw, UserRound, X } from "lucide-react";
import { useParentMode } from "@/lib/hooks/use-parent-mode";
import { useVoiceCookPref } from "@/lib/voice/use-voice-cook-pref";
import { useVisualModePref } from "@/lib/cook/use-visual-mode-pref";
import { cn } from "@/lib/utils/cn";
import { useHaptic } from "@/lib/hooks/use-haptic";
import { SectionKicker } from "@/components/shared/section-kicker";
import type { AgeBand } from "@/types/nutrition";
import { EcoModeToggle } from "@/components/shared/eco-mode-toggle";
import { PreferencesSection } from "@/components/shared/preferences-section";

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
  const voicePref = useVoiceCookPref();
  const visualPref = useVisualModePref();
  const haptic = useHaptic();
  const reducedMotion = useReducedMotion();

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[59] bg-black/30 backdrop-blur-[2px]" />
        <Drawer.Content
          aria-label="Profile and settings"
          className="fixed inset-x-0 bottom-0 z-[60] mx-auto flex h-auto max-h-[92dvh] max-w-md flex-col rounded-t-3xl bg-[var(--nourish-cream)] shadow-2xl outline-none sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
        >
          {/* Sticky header — drag handle + title + close.
              Stays fixed while the body scrolls. */}
          <div className="flex-shrink-0 rounded-t-3xl bg-[var(--nourish-cream)] px-5 pt-3 pb-2">
            <div
              aria-hidden
              className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--nourish-border-strong)] sm:hidden"
            />
            <div className="flex items-center justify-between">
              <Drawer.Title className="font-serif text-xl text-[var(--nourish-dark)]">
                Profile &amp; settings
              </Drawer.Title>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--nourish-subtext)] hover:bg-white/70"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <Drawer.Description className="sr-only">
              Adjust Parent Mode, Eco Mode, learned preferences, voice + visual
              cook, and demo data.
            </Drawer.Description>
          </div>

          {/* Scrollable body. The content stack lives here so any
              overflow is handled inside the sheet rather than
              spilling out of the viewport. */}
          <div
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5"
            style={{
              paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
            }}
          >
            {/* Profile placeholder section. Friendlier framing of the
                "no auth yet" state — explains the trade-off without
                making it feel half-built. */}
            <section className="mt-5 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--nourish-cream)] text-[var(--nourish-subtext)]"
                >
                  <UserRound size={16} />
                </span>
                <div className="space-y-1">
                  <SectionKicker as="p" size="10px">
                    Profile
                  </SectionKicker>
                  <p className="text-[13px] leading-snug text-[var(--nourish-dark)]">
                    Sign-in is coming. For now, your cooks live on this device.
                  </p>
                </div>
              </div>
            </section>

            {/* Parent Mode section */}
            <section className="mt-4 rounded-2xl bg-white p-4 border border-neutral-100/80 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <SectionKicker as="p" size="10px">
                    Parent Mode
                  </SectionKicker>
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
                    layout={!reducedMotion}
                    transition={
                      reducedMotion
                        ? { duration: 0.12 }
                        : { type: "spring", stiffness: 500, damping: 30 }
                    }
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
                    initial={
                      reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }
                    }
                    animate={
                      reducedMotion
                        ? { opacity: 1 }
                        : { opacity: 1, height: "auto" }
                    }
                    exit={
                      reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }
                    }
                    transition={{ duration: reducedMotion ? 0.12 : 0.2 }}
                    className="overflow-hidden"
                  >
                    <SectionKicker as="p" size="10px" className="mt-4">
                      Age at the table
                    </SectionKicker>
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

            {/* Eco Mode (Y4 W7 substrate · Y5 D UI wire-up). Calm,
                never-shame copy. Toggle is the same shape as Parent
                Mode for visual consistency. */}
            <EcoModeToggle />

            {/* Preferences section (Y5 C substrate · Y5 D UI wire-up).
                Surfaces inferred + manual tags + time-of-day patterns.
                Tap any chip to edit; "Reset learned" wipes the
                signal log without touching manual likes/dislikes. */}
            <PreferencesSection />

            {/* Voice Cook section (Stage-5 W16). Opt-in, off by default.
                Per CLAUDE.md rule 3, this lives in the single Settings
                sheet — there is NO separate voice-cook page. */}
            <section className="mt-4 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--nourish-cream)] text-[var(--nourish-subtext)]"
                  >
                    <Mic size={16} />
                  </span>
                  <div className="space-y-1">
                    <SectionKicker as="p" size="10px">
                      Voice cook
                    </SectionKicker>
                    <p className="text-[13px] leading-snug text-[var(--nourish-dark)]">
                      Hands-free step navigation — say &ldquo;next&rdquo;,
                      &ldquo;back&rdquo;, &ldquo;repeat&rdquo;.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={voicePref.enabled}
                  onClick={() => {
                    haptic();
                    voicePref.setEnabled(!voicePref.enabled);
                  }}
                  className={cn(
                    "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                    voicePref.enabled
                      ? "bg-[var(--nourish-green)]"
                      : "bg-neutral-200",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
                      voicePref.enabled ? "translate-x-5" : "translate-x-0.5",
                    )}
                  />
                </button>
              </div>
            </section>

            {/* Visual Mode section (Stage-5 W22, MVP 3 of the
                Google-Maps-style cook-nav initiative). The cook step
                page promotes the step image to a large element when
                this is on, with the instruction text shrunk to a
                two-line summary. Useful for hands-free cooking when
                voice cook is also on; equally useful for users who
                prefer pictures to prose. */}
            <section className="mt-4 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--nourish-cream)] text-[var(--nourish-subtext)]"
                  >
                    <Eye size={16} />
                  </span>
                  <div className="space-y-1">
                    <SectionKicker as="p" size="10px">
                      Visual mode
                    </SectionKicker>
                    <p className="text-[13px] leading-snug text-[var(--nourish-dark)]">
                      Lean on pictures — large image per step, short caption.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={visualPref.enabled}
                  onClick={() => {
                    haptic();
                    visualPref.setEnabled(!visualPref.enabled);
                  }}
                  className={cn(
                    "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                    visualPref.enabled
                      ? "bg-[var(--nourish-green)]"
                      : "bg-neutral-200",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
                      visualPref.enabled ? "translate-x-5" : "translate-x-0.5",
                    )}
                  />
                </button>
              </div>
            </section>

            {/* Demo reset (Y5 D, audit P1 #23). Quiet text link so
                it's discoverable but doesn't compete with primary
                surfaces. Wipes the pod-demo localStorage key so the
                next Community visit re-seeds clean teammates. */}
            <section className="mt-4 rounded-2xl border border-dashed border-neutral-200/80 bg-transparent p-4">
              <SectionKicker as="p" size="10px">
                Demo
              </SectionKicker>
              <p className="mt-1.5 text-[12px] leading-snug text-[var(--nourish-subtext)]">
                Reset the cooking-pod demo data — clears your pod, AI teammates,
                and submissions. The next Community visit re-seeds a fresh
                challenge.
              </p>
              <button
                type="button"
                onClick={() => {
                  haptic();
                  if (typeof window === "undefined") return;
                  try {
                    window.localStorage.removeItem("sous-pod-state-v1");
                  } catch {
                    // ignore — privacy mode / quota
                  }
                  // Hard reload so any in-memory React state seeded
                  // off the old pod blob syncs cleanly.
                  window.location.reload();
                }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-medium text-[var(--nourish-subtext)] hover:border-[var(--nourish-warm)]/30 hover:text-[var(--nourish-warm)]"
              >
                <RotateCcw size={11} aria-hidden />
                Reset demo data
              </button>
            </section>

            {/* About section */}
            <section className="mt-4 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
              <SectionKicker as="p" size="10px">
                About
              </SectionKicker>
              <p className="mt-1.5 text-[12px] leading-snug text-[var(--nourish-subtext)]">
                Sous is a free public-good cooking app. No ads, no paid tier.
                Stanford-attributed content carries the source URL on each
                article; sample placeholder content is clearly labeled.
              </p>
              <p className="mt-3 flex items-center gap-1.5 text-[10px] text-[var(--nourish-subtext)]/70">
                <Heart
                  size={10}
                  fill="currentColor"
                  className="text-pink-400/70"
                  aria-hidden
                />
                <span>Made for cooking confidence at home.</span>
              </p>
            </section>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
