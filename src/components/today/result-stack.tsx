"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ChevronDown,
  RefreshCw,
  ChefHat,
  Sparkles,
  Check,
  RotateCcw,
  UtensilsCrossed,
  Clock,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { ScoreBreakdown } from "@/lib/engine/types";
import {
  PENDING_BREAKDOWN_KEY,
  buildPendingBreakdown,
} from "@/lib/engine/attach-score-breakdown";
import { evaluatePlate } from "@/lib/engine/plate-evaluation";
import type { PlateEvaluation } from "@/lib/engine/plate-evaluation";
import { EvaluateSheet } from "@/components/results/EvaluateSheet";
import { trpc } from "@/lib/trpc/client";
import { useUserWeights } from "@/lib/hooks/use-user-weights";
import { useHouseholdDietary } from "@/lib/hooks/use-household-dietary";

export interface SideResult {
  id: string;
  slug: string;
  name: string;
  cuisineFamily: string;
  tags: string[];
  pairingReason: string | null;
  nutritionCategory: string | null;
  explanation: string;
  totalScore: number;
  scores: ScoreBreakdown;
  imageUrl: string;
  description: string;
  hasGuidedCook?: boolean;
  /** Y2 W17 pantry-coverage badge data. Optional + nullable so
   *  legacy + no-pantry-data candidates degrade silently to "no
   *  badge". Populated end-to-end once the pairing API threads
   *  ingredient data through to coverage compute (substrate
   *  ready, founder-gated on the seed-catalog ingredient
   *  expansion).
   *  - pantryCoverage: 0..1 fractional coverage
   *  - pantryHaveCount / pantryTotalCount: raw counts for the
   *    "X / Y from pantry" badge label
   */
  pantryCoverage?: number | null;
  pantryHaveCount?: number | null;
  pantryTotalCount?: number | null;
}

interface ResultStackProps {
  mainDish: string;
  sides: SideResult[];
  onCookThis: (side: SideResult) => void;
  onCookSelected?: (sides: SideResult[]) => void;
  onReroll: () => void;
  isRerolling?: boolean;
}

/**
 * Result Stack  -  three selectable side dish cards.
 * Users can select 1-3 sides, reroll individual cards, then "Cook selected".
 */
export function ResultStack({
  mainDish,
  sides: initialSides,
  onCookThis,
  onCookSelected,
  onReroll,
  isRerolling,
}: ResultStackProps) {
  const reducedMotion = useReducedMotion();
  const [showEvaluate, setShowEvaluate] = useState(false);
  const [sides, setSides] = useState<SideResult[]>(initialSides);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(initialSides.map((s) => s.id)),
  );
  // Track all IDs that have appeared (for excluding during reroll)
  const [seenIds, setSeenIds] = useState<Set<string>>(
    () => new Set(initialSides.map((s) => s.id)),
  );
  const [rerollingIndex, setRerollingIndex] = useState<number | null>(null);

  // Sync when parent provides new sides (full reroll)
  const sidesKey = initialSides.map((s) => s.id).join(",");
  const [lastSidesKey, setLastSidesKey] = useState(sidesKey);
  /* eslint-disable react-hooks/set-state-in-effect -- sync parent prop change into local state */
  useEffect(() => {
    if (sidesKey !== lastSidesKey) {
      setSides(initialSides);
      setSelectedIds(new Set(initialSides.map((s) => s.id)));
      setSeenIds(new Set(initialSides.map((s) => s.id)));
      setLastSidesKey(sidesKey);
    }
  }, [sidesKey, lastSidesKey, initialSides]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const selectedSides = useMemo(
    () => sides.filter((s) => selectedIds.has(s.id)),
    [sides, selectedIds],
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // W30 pairing-engine V2: trained weight vector. Reroll respects
  // the same personalisation as the initial pairing.
  const { weights: userWeights } = useUserWeights();
  // W37 household dietary constraint — reroll respects the same
  // hard filter as the initial pairing so swaps stay compliant.
  const { dietaryFlags: householdDietaryFlags } = useHouseholdDietary();

  // Per-side reroll via tRPC
  const rerollQuery = trpc.pairing.rerollSide.useQuery(
    {
      mainDish,
      excludeIds: Array.from(seenIds),
      userWeights,
      householdDietaryFlags:
        householdDietaryFlags.length > 0 ? householdDietaryFlags : undefined,
    },
    {
      enabled: rerollingIndex !== null,
      staleTime: 0,
    },
  );

  // Handle reroll result
  const lastRerollData = rerollQuery.data;
  const [appliedRerollKey, setAppliedRerollKey] = useState("");

  /* eslint-disable react-hooks/set-state-in-effect -- async tRPC result drives state machine transition */
  useEffect(() => {
    if (rerollingIndex !== null && !rerollQuery.isFetching) {
      if (rerollQuery.isError) {
        setRerollingIndex(null);
        return;
      }
      // No alternatives available  -  server returned { success: false, side: null }.
      // Without this branch the spinner sticks on forever. See AUDIT-2026-04-17 P0-3.
      if (lastRerollData && !lastRerollData.success) {
        setRerollingIndex(null);
        return;
      }
      if (lastRerollData?.success && lastRerollData.side) {
        const rerollKey = `${rerollingIndex}-${lastRerollData.side.id}`;
        if (rerollKey !== appliedRerollKey) {
          const newSide = lastRerollData.side as SideResult;
          const idx = rerollingIndex;

          setSides((prev) => {
            const next = [...prev];
            const oldId = next[idx].id;
            setSelectedIds((sel) => {
              const updated = new Set(sel);
              if (updated.has(oldId)) {
                updated.delete(oldId);
                updated.add(newSide.id);
              }
              return updated;
            });
            next[idx] = newSide;
            return next;
          });

          setSeenIds((prev) => new Set([...prev, newSide.id]));
          setAppliedRerollKey(rerollKey);
          setRerollingIndex(null);
        }
      }
    }
  }, [
    rerollingIndex,
    lastRerollData,
    rerollQuery.isFetching,
    rerollQuery.isError,
    appliedRerollKey,
  ]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleRerollSide = useCallback((index: number) => {
    setRerollingIndex(index);
    // Force refetch by invalidating
    setAppliedRerollKey("");
  }, []);

  // Run plate evaluation on selected sides
  const evaluation = useMemo<PlateEvaluation | null>(() => {
    if (selectedSides.length === 0) return null;

    const meal = {
      id: "search-main",
      name: mainDish,
      aliases: [],
      heroImageUrl: "",
      sidePool: [],
      cuisine: "",
      description: mainDish,
    };

    const sideDishes = selectedSides.map((s) => ({
      id: s.id,
      name: s.name,
      imageUrl: s.imageUrl,
      tags: s.tags,
      description: s.description,
      pairingReason: s.pairingReason ?? "",
      nutritionCategory: (s.nutritionCategory ?? "vegetable") as
        | "protein"
        | "carb"
        | "vegetable",
    }));

    return evaluatePlate({ meal, sides: sideDishes });
  }, [mainDish, selectedSides]);

  const toneColor =
    evaluation?.appraisalTone === "balanced"
      ? "text-[var(--nourish-green)]"
      : evaluation?.appraisalTone === "needs-work"
        ? "text-amber-600"
        : "text-[var(--nourish-subtext)]";

  /** Y2 W6 V3 trainer dependency. When the user picks a side,
   *  stash the engine's ScoreBreakdown in sessionStorage so the
   *  cook page can attach it to the new cook session at start
   *  time. Pure helper composes the payload; the write is a
   *  one-liner inside the handler. */
  const stashBreakdownForSide = useCallback((side: SideResult) => {
    if (typeof window === "undefined") return;
    try {
      const pending = buildPendingBreakdown(
        side.slug,
        side.scores,
        side.totalScore,
      );
      sessionStorage.setItem(PENDING_BREAKDOWN_KEY, JSON.stringify(pending));
    } catch {
      // ignore — quota / privacy mode
    }
  }, []);

  const handleCookSingle = useCallback(
    (side: SideResult) => {
      stashBreakdownForSide(side);
      onCookThis(side);
    },
    [stashBreakdownForSide, onCookThis],
  );

  const handleCookSelected = useCallback(() => {
    if (selectedSides.length === 0) return;

    if (onCookSelected && selectedSides.length > 1) {
      // Multi-dish cook — stash the highest-totalScore side's
      // breakdown as the V3 signal anchor.
      const anchor = selectedSides.reduce((best, s) =>
        s.totalScore > best.totalScore ? s : best,
      );
      stashBreakdownForSide(anchor);
      onCookSelected(selectedSides);
    } else if (selectedSides.length === 1) {
      handleCookSingle(selectedSides[0]);
    } else {
      // Fallback: cook first selected
      handleCookSingle(selectedSides[0]);
    }
  }, [selectedSides, onCookSelected, handleCookSingle, stashBreakdownForSide]);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--nourish-subtext)]">
          For:{" "}
          <span className="font-medium text-[var(--nourish-dark)]">
            {mainDish}
          </span>
        </p>
        <button
          onClick={onReroll}
          disabled={isRerolling}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
            "border border-neutral-200 text-[var(--nourish-subtext)]",
            "hover:border-[var(--nourish-green)] hover:text-[var(--nourish-green)]",
            "disabled:opacity-50 transition-all duration-200",
          )}
          type="button"
        >
          <RefreshCw size={14} className={isRerolling ? "animate-spin" : ""} />
          Reroll all
        </button>
      </div>

      <div className="space-y-3">
        {sides.map((side, idx) => (
          <ResultCard
            key={side.id}
            side={side}
            mainDish={mainDish}
            rank={idx + 1}
            selected={selectedIds.has(side.id)}
            isRerolling={rerollingIndex === idx}
            onToggleSelect={() => toggleSelect(side.id)}
            onRerollSide={() => handleRerollSide(idx)}
            onCookThis={() => handleCookSingle(side)}
          />
        ))}
      </div>

      {/* Cook selected  -  primary CTA */}
      <motion.button
        onClick={handleCookSelected}
        disabled={selectedSides.length === 0}
        whileTap={selectedSides.length > 0 ? { scale: 0.96 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all duration-200",
          selectedSides.length > 0
            ? "bg-[var(--nourish-green)] text-white hover:bg-[var(--nourish-dark-green)] cta-shadow"
            : "bg-neutral-100 text-neutral-400 cursor-not-allowed",
        )}
        type="button"
      >
        <ChefHat size={16} />
        {selectedSides.length === 0
          ? "Select sides to cook"
          : selectedSides.length === 1
            ? `Cook ${selectedSides[0].name}`
            : `Cook ${selectedSides.length} selected sides`}
      </motion.button>

      {/* Evaluate plate button  -  visually secondary */}
      {evaluation && (
        <motion.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => setShowEvaluate(true)}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl",
            "border border-neutral-200 bg-white py-2.5 text-xs font-medium",
            "text-[var(--nourish-subtext)] hover:border-[var(--nourish-green)]/40",
            "hover:text-[var(--nourish-green)] transition-all duration-200",
          )}
          type="button"
        >
          <Sparkles size={14} />
          <span>Evaluate plate</span>
          {evaluation.appraisal && (
            <span className={cn("ml-1", toneColor)}>
              ·{" "}
              {evaluation.status === "balanced"
                ? "Balanced"
                : evaluation.status === "good_start"
                  ? "Good start"
                  : "Room to improve"}
            </span>
          )}
        </motion.button>
      )}

      {/* Evaluate sheet */}
      {evaluation && (
        <EvaluateSheet
          evaluation={evaluation}
          mainDish={mainDish}
          sideDishes={selectedSides.map((s) => s.name)}
          open={showEvaluate}
          onClose={() => setShowEvaluate(false)}
        />
      )}
    </motion.div>
  );
}

/** Pure helper: map a prepBurden score (0-1, higher = quicker)
 *  to a qualitative effort label for the recipe-card meta strip.
 *  See docs/UX-RECON-FRAMEWORK.md pattern #3 (time-effort-trust). */
function effortFromPrepBurden(prepBurden: number): string {
  if (!Number.isFinite(prepBurden)) return "Medium";
  if (prepBurden >= 0.7) return "Easy";
  if (prepBurden >= 0.5) return "Medium";
  return "Worth it";
}

function ResultCard({
  side,
  mainDish,
  rank,
  selected,
  isRerolling,
  onToggleSelect,
  onRerollSide,
  onCookThis,
}: {
  side: SideResult;
  mainDish: string;
  rank: number;
  selected: boolean;
  isRerolling: boolean;
  onToggleSelect: () => void;
  onRerollSide: () => void;
  onCookThis: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // AI-enhanced pairing explanation  -  fires when expanded
  const aiExplanation = trpc.ai.explainPairing.useQuery(
    {
      mainDish,
      sideDish: side.name,
      cuisineFamily: side.cuisineFamily,
      pairingReason: side.pairingReason ?? "",
      tags: side.tags,
    },
    { enabled: expanded, staleTime: Infinity },
  );

  const displayExplanation =
    aiExplanation.data?.explanation ?? side.explanation;

  // W11 hero-card upgrade — UX-RECON-FRAMEWORK pattern #1 (hero
  // recipe card), pattern #2 (eyebrow categorisation), pattern
  // #3 (time-effort-trust meta strip). The card now leads with
  // a 96px hero image instead of a 44px thumbnail; eyebrow is
  // cuisine family in caps; meta strip is effort label + match%.
  const effortLabel = effortFromPrepBurden(side.scores.prepBurden);
  const matchPct = Math.round(side.totalScore * 100);
  const cuisineEyebrow = side.cuisineFamily.toUpperCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08, duration: 0.3 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-white transition-all duration-200",
        selected
          ? "border-[var(--nourish-green)]/40 shadow-[var(--shadow-card)]"
          : "border-neutral-100 shadow-none",
      )}
    >
      {/* Selection toggle — floats top-right of the whole card.
          Pattern #4 (save-corner): single tap target reachable
          without crowding. 44px touch target wraps a 24px circle. */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect();
        }}
        whileTap={{ scale: 0.85 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center"
        type="button"
        role="checkbox"
        aria-checked={selected}
        aria-label={`${selected ? "Deselect" : "Select"} ${side.name}`}
      >
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full border-2 shadow-sm transition-all duration-150",
            selected
              ? "border-[var(--nourish-green)] bg-[var(--nourish-green)]"
              : "border-neutral-200 bg-white",
          )}
        >
          {selected && (
            <Check size={12} className="text-white" strokeWidth={3} />
          )}
        </span>
      </motion.button>

      {/* Card body — tappable to expand. Hero image + right column. */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full gap-3 p-3 text-left"
        type="button"
        aria-expanded={expanded}
      >
        {/* Hero image — 96×96 (was 44×44), rounded-xl */}
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
          {isRerolling ? (
            <div className="flex h-full w-full items-center justify-center">
              <RefreshCw
                size={20}
                className="animate-spin text-[var(--nourish-green)]"
              />
            </div>
          ) : side.imageUrl && !imgError ? (
            <Image
              src={side.imageUrl}
              alt={side.name}
              fill
              sizes="96px"
              className="object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-2xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--nourish-green) 0%, var(--nourish-light-green) 60%, #a8d8b9 100%)",
              }}
            >
              <UtensilsCrossed
                size={28}
                className="text-white drop-shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Right column — eyebrow + title + meta strip + 1-line description.
            pr-9 reserves space for the floating selection toggle. */}
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5 pr-9">
          <div className="min-w-0">
            {/* Eyebrow row — pattern #2 */}
            <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-[var(--nourish-subtext)]">
              <span className="uppercase">{cuisineEyebrow}</span>
              {rank === 1 && selected && (
                <>
                  <span className="text-neutral-300">·</span>
                  <span className="uppercase text-[var(--nourish-green)]">
                    Best match
                  </span>
                </>
              )}
              {side.hasGuidedCook && (
                <>
                  <span className="text-neutral-300">·</span>
                  <span className="uppercase text-[var(--nourish-gold)]">
                    Guided
                  </span>
                </>
              )}
              {/* W17 pantry badge — renders only when coverage
                  data is populated AND coverage clears the
                  "you have most of this" threshold (matching
                  W16's discontinuity). */}
              {typeof side.pantryCoverage === "number" &&
                side.pantryCoverage >= 0.7 && (
                  <>
                    <span className="text-neutral-300">·</span>
                    <span className="uppercase text-[var(--nourish-green)]">
                      {typeof side.pantryHaveCount === "number" &&
                      typeof side.pantryTotalCount === "number"
                        ? `${side.pantryHaveCount}/${side.pantryTotalCount} from pantry`
                        : "From pantry"}
                    </span>
                  </>
                )}
            </div>

            {/* Title */}
            <h3 className="mt-0.5 line-clamp-2 text-base font-semibold leading-snug text-[var(--nourish-dark)]">
              {side.name}
            </h3>

            {/* Meta strip — pattern #3 */}
            <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--nourish-subtext)]">
              <Clock size={11} className="shrink-0" />
              <span>{effortLabel}</span>
              <span className="text-neutral-300">·</span>
              <span className="font-medium text-[var(--nourish-green)]">
                {matchPct}% match
              </span>
            </div>
          </div>

          {/* Short description */}
          <p className="mt-1.5 line-clamp-1 text-xs text-[var(--nourish-subtext)]">
            {side.explanation}
          </p>
        </div>
      </button>

      {/* Bottom action row — Swap on left, "Why this won" on right.
          Replaces the cramped chevron + reroll-icon column from the
          old layout with two text-labelled affordances. */}
      <div className="flex items-center justify-between border-t border-neutral-100 px-2 py-1.5">
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onRerollSide();
          }}
          disabled={isRerolling}
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-[var(--nourish-subtext)] transition-colors hover:bg-neutral-50 disabled:opacity-40"
          type="button"
          aria-label={`Swap ${side.name} for a different side`}
        >
          <RotateCcw size={12} />
          <span>Swap</span>
        </motion.button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-[var(--nourish-subtext)] transition-colors hover:bg-neutral-50"
          type="button"
          aria-expanded={expanded}
        >
          <span>{expanded ? "Less" : "Why this won"}</span>
          <ChevronDown
            size={14}
            className={cn(
              "transition-transform duration-200",
              expanded && "rotate-180",
            )}
          />
        </button>
      </div>

      {/* Expanded: score badges + AI explanation + Cook this */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-neutral-100 px-4 pb-4 pt-3">
              {/* Score highlights */}
              <div className="flex flex-wrap gap-2">
                <ScoreBadge
                  label="Cuisine fit"
                  value={side.scores.cuisineFit}
                />
                <ScoreBadge
                  label="Flavor contrast"
                  value={side.scores.flavorContrast}
                />
                <ScoreBadge
                  label="Nutrition"
                  value={side.scores.nutritionBalance}
                />
                <ScoreBadge label="Quick prep" value={side.scores.prepBurden} />
              </div>

              {/* AI-enhanced pairing explanation */}
              <p className="text-sm leading-relaxed text-[var(--nourish-subtext)]">
                {displayExplanation}
              </p>

              {/* Cook just this side — secondary inline action */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCookThis();
                }}
                className={cn(
                  "w-full rounded-xl border border-[var(--nourish-green)]/30 py-2.5 text-xs font-medium",
                  "text-[var(--nourish-green)] hover:bg-[var(--nourish-green)]/5",
                  "transition-colors duration-200",
                  "flex items-center justify-center gap-2",
                )}
                type="button"
              >
                {side.hasGuidedCook && <ChefHat size={14} />}
                {side.hasGuidedCook
                  ? "Start guided cook"
                  : "Cook just this one"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ScoreBadge({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-medium",
        pct >= 70
          ? "bg-[var(--nourish-green)]/10 text-[var(--nourish-green)]"
          : pct >= 50
            ? "bg-[var(--nourish-gold)]/15 text-[var(--nourish-gold)]"
            : "bg-neutral-100 text-[var(--nourish-subtext)]",
      )}
    >
      {label} {pct}%
    </span>
  );
}
