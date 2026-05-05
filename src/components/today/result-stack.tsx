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
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { ScoreBreakdown } from "@/lib/engine/types";
import { evaluatePlate } from "@/lib/engine/plate-evaluation";
import type { PlateEvaluation } from "@/lib/engine/plate-evaluation";
import { EvaluateSheet } from "@/components/results/EvaluateSheet";
import { trpc } from "@/lib/trpc/client";
import { usePreferenceProfile } from "@/lib/hooks/use-preference-profile";
import { dishToFacets } from "@/lib/intelligence/dish-to-facets";

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
  /** Y2 W17 pantry-coverage badge data. Populated end-to-end
   *  once the pairing API threads ingredient data through to
   *  coverage compute. */
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
  void reducedMotion;
  // Y5 D, audit P0 #6 — pipe selection / reroll into the
  // intelligence layer so the editable profile substrate fills
  // in automatically.
  const { recordSignal } = usePreferenceProfile();
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

  // Per-side reroll via tRPC
  const rerollQuery = trpc.pairing.rerollSide.useQuery(
    {
      mainDish,
      excludeIds: Array.from(seenIds),
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

  const handleRerollSide = useCallback(
    (index: number) => {
      // Y5 D #6 — record the reroll as a negative-leaning signal
      // for the side that's being replaced.
      const dropped = sides[index];
      if (dropped) {
        recordSignal({
          kind: "rerolled",
          facets: dishToFacets({
            cuisineFamily: dropped.cuisineFamily,
            tags: dropped.tags,
          }),
        });
      }
      setRerollingIndex(index);
      // Force refetch by invalidating
      setAppliedRerollKey("");
    },
    [sides, recordSignal],
  );

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

  const handleCookSelected = useCallback(() => {
    if (selectedSides.length === 0) return;

    // Y5 D #6 — every picked side is a strong implicit signal.
    // Fire one signal per selected side so multi-select cooks
    // contribute proportionally.
    for (const s of selectedSides) {
      recordSignal({
        kind: "search-result-tapped",
        facets: dishToFacets({
          cuisineFamily: s.cuisineFamily,
          tags: s.tags,
        }),
      });
    }

    if (onCookSelected && selectedSides.length > 1) {
      onCookSelected(selectedSides);
    } else if (selectedSides.length === 1) {
      onCookThis(selectedSides[0]);
    } else {
      // Fallback: cook first selected
      onCookThis(selectedSides[0]);
    }
  }, [selectedSides, onCookSelected, onCookThis, recordSignal]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
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
            onCookThis={() => onCookThis(side)}
          />
        ))}
      </div>

      {/* Reroll moved below the stack as a quiet text link — out
          of the way of the cards but still discoverable. */}
      <button
        onClick={onReroll}
        disabled={isRerolling}
        className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-medium text-[var(--nourish-subtext)] hover:text-[var(--nourish-green)] disabled:opacity-50 transition-colors"
        type="button"
      >
        <RefreshCw size={12} className={isRerolling ? "animate-spin" : ""} />
        Reroll all
      </button>

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
 *  to a qualitative effort label. */
function effortFromPrepBurden(prepBurden: number): string {
  if (!Number.isFinite(prepBurden)) return "Medium";
  if (prepBurden >= 0.7) return "Easy";
  if (prepBurden >= 0.5) return "Medium";
  return "Worth it";
}

/** Pure: build the faint single-line metadata under the title.
 *  Order: cuisine · 0-2 flavor descriptors · effort. Filters out
 *  tags that just echo the cuisine family (case-insensitive) and
 *  drops anything that isn't a plain lowercase word. The whole
 *  line is rendered lowercase for visual consistency.
 *
 *  Exported so the partition + dedup logic is unit-tested. */
export function buildSideMetaLine(input: {
  cuisineFamily: string;
  tags: ReadonlyArray<string> | undefined;
  effortLabel: string;
}): string {
  const cuisineLower = input.cuisineFamily.trim().toLowerCase();
  const safeTags = Array.isArray(input.tags) ? input.tags : [];
  const flavorTags = safeTags
    .filter((t) => typeof t === "string")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => /^[a-z][a-z -]*$/.test(t)) // plain lowercase words
    .filter((t) => t !== cuisineLower) // dedup against cuisine
    .slice(0, 2);
  const parts = [
    cuisineLower,
    ...flavorTags,
    input.effortLabel.toLowerCase(),
  ].filter(Boolean);
  return parts.join(" · ");
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
  const reducedMotion = useReducedMotion();
  void reducedMotion;
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

  // Minimalist redesign: single faint metadata line —
  // cuisine · up-to-2-flavors · effort. Match% / Best-match /
  // Guided labels removed (rule 6: simplicity-first). The
  // partition + dedup logic lives in the pure helper.
  const effortLabel = effortFromPrepBurden(side.scores.prepBurden);
  const metaLine = buildSideMetaLine({
    cuisineFamily: side.cuisineFamily,
    tags: side.tags,
    effortLabel,
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08, duration: 0.3 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-all duration-200",
        selected
          ? "border-[var(--nourish-green)]/30 bg-white shadow-[var(--shadow-card)]"
          : "border-neutral-100 bg-white shadow-none",
      )}
    >
      {/* Card body — tappable to expand. Hero image + right column.
          Selection lives in the bottom action row now, not as a
          floating corner circle. */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full gap-3 p-3 text-left"
        type="button"
        aria-expanded={expanded}
      >
        {/* Hero image — 96×96, rounded-xl */}
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
            <div className="flex h-full w-full items-center justify-center bg-[var(--nourish-cream)]">
              <UtensilsCrossed
                size={24}
                className="text-[var(--nourish-subtext)]/40"
                strokeWidth={1.5}
              />
            </div>
          )}
        </div>

        {/* Right column — title-led, single faint metadata line.
            No eyebrow caps, no match%, no description echo —
            keeps appetite on the title and lets the placeholder
            tile rest. */}
        <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5">
          <h3 className="line-clamp-2 font-serif text-base font-semibold leading-snug text-[var(--nourish-dark)]">
            {side.name}
          </h3>
          <p className="mt-1 text-[11px] text-[var(--nourish-subtext)]">
            {metaLine}
          </p>
          {/* W17 pantry-coverage badge — quiet inline tag.
              Only shows when coverage clears the "you have most
              of this" threshold. */}
          {typeof side.pantryCoverage === "number" &&
            side.pantryCoverage >= 0.7 && (
              <p className="mt-1 text-[10px] font-medium text-[var(--nourish-green)]">
                {typeof side.pantryHaveCount === "number" &&
                typeof side.pantryTotalCount === "number"
                  ? `${side.pantryHaveCount}/${side.pantryTotalCount} from pantry`
                  : "From pantry"}
              </p>
            )}
        </div>
      </button>

      {/* Bottom action row — Swap, Selected toggle, expand chevron.
          Selection used to live as a floating green check circle
          on the image; moved here as a quiet text toggle so the
          card doesn't shout. */}
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
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors",
              selected
                ? "text-[var(--nourish-green)] hover:bg-[var(--nourish-green)]/5"
                : "text-[var(--nourish-subtext)] hover:bg-neutral-50",
            )}
            type="button"
            role="checkbox"
            aria-checked={selected}
            aria-label={`${selected ? "Deselect" : "Select"} ${side.name}`}
          >
            {selected && <Check size={12} strokeWidth={2.5} />}
            <span>{selected ? "Selected" : "Add"}</span>
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--nourish-subtext)] transition-colors hover:bg-neutral-50"
            type="button"
            aria-expanded={expanded}
            aria-label={expanded ? "Hide details" : "Show details"}
          >
            <ChevronDown
              size={16}
              className={cn(
                "transition-transform duration-200",
                expanded && "rotate-180",
              )}
            />
          </button>
        </div>
      </div>

      {/* Expanded: description leads, then a single nutrition star
          row, then the primary cook CTA. The four-percentage-chip
          dashboard is gone — the engine no longer apologises for
          itself in the user's face. */}
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
              {/* Description leads — the "why" in one paragraph,
                  with the AI-enhanced version when expanded. */}
              <p className="text-sm leading-relaxed text-[var(--nourish-dark)]">
                {displayExplanation}
              </p>

              {/* Single 5-star nutrition rating replaces the four
                  percentage chips. One health signal, no dashboard. */}
              <NutritionStars score={side.scores.nutritionBalance} />

              {/* Primary cook CTA — solid green fill. The strongest
                  visual element on the expanded card. */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCookThis();
                }}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold",
                  "bg-[var(--nourish-green)] text-white shadow-[var(--shadow-cta)]",
                  "hover:bg-[var(--nourish-dark-green)] active:scale-[0.98]",
                  "transition-all duration-200",
                )}
                type="button"
              >
                <ChefHat size={16} />
                Start guided cook
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Pure: convert a 0..1 nutrition score into a 0..5 integer
 *  star count. Defensive against NaN / undefined / out-of-range
 *  inputs so the aria-label never surfaces "NaN out of 5". */
export function nutritionScoreToStars(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.min(5, Math.max(0, Math.round(score * 5)));
}

function NutritionStars({ score }: { score: number }) {
  // Map 0..1 score → 0..5 stars. Empty stars stay neutral;
  // filled stars use a quiet sage tone (not the brand-green
  // hero accent — that belongs to the CTA).
  const filled = nutritionScoreToStars(score);
  return (
    <div
      className="flex items-center gap-1.5 text-[11px] text-[var(--nourish-subtext)]"
      aria-label={`Nutrition ${filled} out of 5`}
    >
      <div className="flex" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <svg
            key={i}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            className={cn(
              i < filled ? "text-[var(--nourish-green)]" : "text-neutral-200",
            )}
          >
            <path
              d="M6 1l1.545 3.13L11 4.635l-2.5 2.435L9.09 11 6 9.375 2.91 11l.59-3.93L1 4.635l3.455-.505L6 1z"
              fill="currentColor"
            />
          </svg>
        ))}
      </div>
      <span>Nutrition</span>
    </div>
  );
}
