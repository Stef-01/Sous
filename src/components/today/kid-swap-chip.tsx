"use client";

/**
 * KidSwapChip — quest-card affordance that opens a bottom sheet of
 * 2-3 short kid-friendly swap suggestions for a borderline-acceptable
 * dish. Deterministic-first via kid-swap-lookup; AI-augmented via
 * trpc.ai.suggestKidSwaps when fewer than 2 deterministic swaps land
 * AND a real provider is configured (mock parity preserved).
 *
 * Minimalism (POLISH-CHECKLIST §1.5.2):
 *   - Renders ONLY when (a) Parent Mode is on, (b) dish has a label,
 *     (c) label is parentModeEligible, (d) score is in the
 *     middle-of-the-road band 0.30-0.65 — high-scoring dishes need no
 *     help; low-scoring ones won't be in the pool.
 *   - Single chip; bottom sheet shows 2-3 swap chips, each one line.
 *   - No expand/collapse, no nested settings.
 *   - Sheet auto-closes on tap-to-apply.
 *   - Selected swap writes to the existing recipe-overlay system so it
 *     persists in the upcoming cook flow.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useHaptic } from "@/lib/hooks/use-haptic";
import { useParentMode } from "@/lib/hooks/use-parent-mode";
import { useRecipeOverlays } from "@/lib/hooks/use-recipe-overlays";
import { trpc } from "@/lib/trpc/client";
import { getKidFriendlinessLabel } from "@/data/parent-mode/kid-friendliness-labels";
import { kidFriendlinessScore } from "@/lib/engine/scorers/kid-friendliness";
import {
  suggestKidSwapsFromLabel,
  isDeterministicLookupSufficient,
  type KidSwap,
} from "@/lib/parent-mode/kid-swap-lookup";

const LOWER_BOUND = 0.3;
const UPPER_BOUND = 0.65;

interface Props {
  dishSlug: string;
  cuisineFamily: string;
  recipeName: string;
}

export function KidSwapChip({ dishSlug, cuisineFamily, recipeName }: Props) {
  const { profile } = useParentMode();
  const [open, setOpen] = useState(false);
  const haptic = useHaptic();

  if (!profile.enabled) return null;
  const label = getKidFriendlinessLabel(dishSlug);
  if (!label || !label.parentModeEligible) return null;
  const score = kidFriendlinessScore(label);
  if (score < LOWER_BOUND || score >= UPPER_BOUND) return null;

  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.93 }}
        transition={{ type: "spring", stiffness: 420, damping: 18 }}
        onClick={() => {
          haptic();
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--nourish-green)]/30 bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--nourish-green)] hover:bg-[var(--nourish-green)]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
        aria-label={`Make ${recipeName} more kid-friendly`}
      >
        <Sparkles size={11} />
        Make it kid-friendly
      </motion.button>

      <KidSwapSheet
        open={open}
        onClose={() => setOpen(false)}
        dishSlug={dishSlug}
        cuisineFamily={cuisineFamily}
        recipeName={recipeName}
      />
    </>
  );
}

function KidSwapSheet({
  open,
  onClose,
  dishSlug,
  cuisineFamily,
  recipeName,
}: {
  open: boolean;
  onClose: () => void;
  dishSlug: string;
  cuisineFamily: string;
  recipeName: string;
}) {
  const { profile } = useParentMode();
  const { saveStepNote } = useRecipeOverlays();
  const haptic = useHaptic();
  const label = getKidFriendlinessLabel(dishSlug);
  const deterministic: KidSwap[] = label ? suggestKidSwapsFromLabel(label) : [];
  const sufficient = isDeterministicLookupSufficient(deterministic);

  // AI fallback only when deterministic is short. Mock provider mirrors
  // the lookup so dev parity holds without a real API key.
  const aiQuery = trpc.ai.suggestKidSwaps.useQuery(
    {
      recipeName,
      cuisineFamily,
      ageBand: profile.ageBand,
      signals: label
        ? {
            bitterLoad: label.bitterLoad,
            smellIntensity: label.smellIntensity,
            textureRisk: label.textureRisk,
            visibleGreenFlecks: label.visibleGreenFlecks,
            deconstructable: label.deconstructable,
            heatLevel: label.heatLevel,
            familiarityAnchor: label.familiarityAnchor,
            colorBrightness: label.colorBrightness,
          }
        : {
            bitterLoad: 0,
            smellIntensity: 0,
            textureRisk: 0,
            visibleGreenFlecks: false,
            deconstructable: false,
            heatLevel: 0,
            familiarityAnchor: false,
            colorBrightness: 0,
          },
    },
    { enabled: open && !sufficient && !!label, staleTime: 60_000 },
  );

  const swaps: KidSwap[] = sufficient
    ? deterministic
    : (aiQuery.data?.swaps ?? deterministic);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleApply = (swap: KidSwap) => {
    haptic();
    // Write a step-0 note on the overlay so the cook flow surfaces the
    // chosen swap when the user starts cooking. Step 0 is the Mission
    // intro across all guided cooks.
    saveStepNote(dishSlug, 0, `Kid plate: ${swap.label}. ${swap.rationale}`);
    onClose();
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
            aria-label="Close kid-friendly swaps"
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Kid-friendly swaps for ${recipeName}`}
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative z-10 w-full max-w-md rounded-t-3xl bg-[var(--nourish-cream)] px-5 pt-4 pb-6 shadow-2xl sm:rounded-3xl sm:m-4"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--nourish-border-strong)] sm:hidden" />
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-subtext)]">
                  Make it kid-friendly
                </p>
                <h2 className="font-serif text-lg leading-tight text-[var(--nourish-dark)]">
                  {recipeName}
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

            <p className="mt-2 text-[12px] text-[var(--nourish-subtext)]">
              Tap a swap to save it for the kid plate. The adult plate stays as
              written.
            </p>

            <div className="mt-4 space-y-2">
              {swaps.length === 0 && (
                <p className="rounded-xl bg-white p-3 text-[12px] text-[var(--nourish-subtext)]">
                  This dish already lands well for kids — no swap needed.
                </p>
              )}
              {swaps.map((swap, i) => (
                <button
                  key={`${swap.label}-${i}`}
                  type="button"
                  onClick={() => handleApply(swap)}
                  className={cn(
                    "block w-full rounded-2xl border border-neutral-100 bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
                  )}
                >
                  <p className="text-[13px] font-semibold text-[var(--nourish-dark)]">
                    {swap.label}
                  </p>
                  <p className="mt-1 text-[12px] leading-snug text-[var(--nourish-subtext)]">
                    {swap.rationale}
                  </p>
                </button>
              ))}
            </div>

            <p className="mt-3 text-[10px] leading-snug text-[var(--nourish-subtext)]/80">
              Suggestions are general guidance for kids 4 and older. Not medical
              advice — your child&rsquo;s needs may differ.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
