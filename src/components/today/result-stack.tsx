"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ChevronDown,
  RefreshCw,
  ChefHat,
  Sparkles,
  Check,
  RotateCcw,
  UtensilsCrossed,
  Globe,
  Leaf,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { ScoreBreakdown } from "@/lib/engine/types";
import {
  buildOutcome,
  hashIntent,
  recordOutcomeLocal,
} from "@/lib/engine/pairing-outcomes";
import { useDeviceId } from "@/lib/hooks/use-device-id";
import { evaluatePlate } from "@/lib/engine/plate-evaluation";
import type { PlateEvaluation } from "@/lib/engine/plate-evaluation";
import { EvaluateSheet } from "@/components/results/EvaluateSheet";
import type { PlateNutritionInput } from "@/lib/nutrition/plate-nutrition";
import { PlateRing } from "@/components/today/plate-ring";
import { CreatorByline } from "@/components/shared/creator-byline";
import { NutritionRingCard } from "@/components/shared/nutrition-ring-card";
import { IngredientsToCheck } from "@/components/shared/ingredients-to-check";
import { BioavailabilityTip } from "@/components/shared/bioavailability-tip";
import { DietaryProfile } from "@/components/shared/dietary-profile";
import {
  getDishNutrition,
  NUTRITION_COVERAGE_FLOOR,
} from "@/lib/engine/dish-nutrition";
import { trpc } from "@/lib/trpc/client";
import { useSignalFlag } from "@/lib/hooks/use-signal-flags";

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
}

interface ResultStackProps {
  mainDish: string;
  /** Resolved slug of the main — drives the combined per-serving nutrition view
   *  in the plate-check sheet (the name alone can't resolve nutrition). */
  mainSlug?: string | null;
  sides: SideResult[];
  onCookThis: (side: SideResult) => void;
  onCookSelected?: (sides: SideResult[]) => void;
  /** Cook the main on its own (skip sides). Provided only when the main has a
   *  guided cook of its own — surfaces a "Skip sides" affordance. */
  onCookMainAlone?: () => void;
  onReroll: () => void;
  isRerolling?: boolean;
  /** W1/W29 context so a rerolled side honours the same pantry + deficiency
   *  nudges as the original plate. */
  pantryOnHand?: string[];
  recentCookSlugs?: string[];
  dayDeficits?: Record<string, number>;
  /** W2 context-fit — local clock so a rerolled side honours the same
   *  time-of-day + season nudge as the original plate. */
  localHour?: number;
  localMonth?: number;
}

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
    .filter((t) => /^[a-z][a-z -]*$/.test(t))
    .filter((t) => t !== cuisineLower)
    .slice(0, 2);
  const parts = [
    cuisineLower,
    ...flavorTags,
    input.effortLabel.toLowerCase(),
  ].filter(Boolean);
  return parts.join(" · ");
}

export function nutritionScoreToStars(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.min(5, Math.max(0, Math.round(score * 5)));
}

/**
 * Result Stack  -  three selectable side dish cards.
 * Users can select 1-3 sides, reroll individual cards, then "Cook selected".
 */
export function ResultStack({
  mainDish,
  mainSlug,
  sides: initialSides,
  onCookThis,
  onCookSelected,
  onCookMainAlone,
  onReroll,
  isRerolling,
  pantryOnHand,
  recentCookSlugs,
  dayDeficits,
  localHour,
  localMonth,
}: ResultStackProps) {
  const reducedMotion = useReducedMotion();
  // W5: a "searching / decision fatigue" signal calms the plate — the
  // "Reroll all" nudge is hidden so there's no invitation to keep re-deciding.
  const calmDeck = useSignalFlag("decisionFatigue");
  // W5: budget signal boosts pantry-reuse on rerolls too, matching the deck.
  const budgetSensitive = useSignalFlag("budgetSensitive");
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

  // ── Moat data flywheel: capture the (shown → picked) tuple as an append-only
  // corpus (pairing-outcomes). Accumulates locally now; the cohort accept-rate it
  // feeds back into the engine stays a no-op until there's cross-user volume (the
  // impression floor). Fire-and-forget, never blocks the result render.
  const deviceId = useDeviceId();
  const batchIdRef = useRef("");
  const slotRankRef = useRef<Map<string, number>>(new Map());
  const dimsOf = useCallback(
    (s: SideResult) => ({
      cuisineFit: s.scores.cuisineFit,
      flavorContrast: s.scores.flavorContrast,
      nutritionBalance: s.scores.nutritionBalance,
      prepBurden: s.scores.prepBurden,
      temperature: s.scores.temperature,
      preference: s.scores.preference,
    }),
    [],
  );
  const capturedKeyRef = useRef("");
  useEffect(() => {
    // Fire once per new batch — the ref guard de-dupes re-renders of the same
    // result set, so no exhaustive-deps disable is needed.
    if (initialSides.length === 0 || capturedKeyRef.current === sidesKey)
      return;
    capturedKeyRef.current = sidesKey;
    const batchId = `${hashIntent(mainDish)}-${Date.now().toString(36)}`;
    const mainHash = hashIntent(mainDish);
    const at = new Date().toISOString();
    const ranks = new Map<string, number>();
    initialSides.forEach((side, rank) => {
      ranks.set(side.slug, rank);
      recordOutcomeLocal(
        buildOutcome(
          {
            batchId,
            rank,
            deviceId,
            mainDishIntentHash: mainHash,
            recipeSlug: side.slug,
            cuisineFamily: side.cuisineFamily,
            totalScore: side.totalScore,
            dimensions: dimsOf(side),
          },
          "shown",
          at,
        ),
      );
    });
    batchIdRef.current = batchId;
    slotRankRef.current = ranks;
  }, [sidesKey, initialSides, mainDish, deviceId, dimsOf]);
  const recordPick = useCallback(
    (picked: SideResult[]) => {
      const batchId = batchIdRef.current;
      if (!batchId) return;
      const mainHash = hashIntent(mainDish);
      const at = new Date().toISOString();
      const ranks = slotRankRef.current;
      for (const side of picked) {
        recordOutcomeLocal(
          buildOutcome(
            {
              batchId,
              rank: ranks.get(side.slug) ?? 0,
              deviceId,
              mainDishIntentHash: mainHash,
              recipeSlug: side.slug,
              cuisineFamily: side.cuisineFamily,
              totalScore: side.totalScore,
              dimensions: dimsOf(side),
            },
            "picked",
            at,
          ),
        );
      }
    },
    [mainDish, deviceId, dimsOf],
  );

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

  // Per-side reroll via tRPC — carries the same pantry + deficiency context as
  // the original plate so a rerolled slot stays consistent with the W1/W29
  // nudges (otherwise a demoted side could resurface ignoring on-hand
  // ingredients and the day's nutrient gaps).
  const rerollQuery = trpc.pairing.rerollSide.useQuery(
    {
      mainDish,
      excludeIds: Array.from(seenIds),
      pantryOnHand,
      recentCookSlugs,
      dayDeficits,
      localHour,
      localMonth,
      budgetSensitive: budgetSensitive || undefined,
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

  // The plate's dishes (a serving each) for the combined nutrition view — the
  // main first, then the picked sides in selection order.
  const plateItems = useMemo<PlateNutritionInput[]>(() => {
    const items: PlateNutritionInput[] = [];
    if (mainSlug) {
      items.push({ name: mainDish, slug: mainSlug, role: "main" });
    }
    for (const s of selectedSides) {
      items.push({ name: s.name, slug: s.slug, role: "side" });
    }
    return items;
  }, [mainSlug, mainDish, selectedSides]);

  const handleCookSelected = useCallback(() => {
    if (selectedSides.length === 0) return;
    recordPick(selectedSides);

    if (onCookSelected && selectedSides.length > 1) {
      onCookSelected(selectedSides);
    } else if (selectedSides.length === 1) {
      onCookThis(selectedSides[0]);
    } else {
      // Fallback: cook first selected
      onCookThis(selectedSides[0]);
    }
  }, [selectedSides, onCookSelected, onCookThis, recordPick]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="sous-label">Recommended sides</h2>
          <p className="truncate text-sm text-[var(--nourish-subtext)]">
            {selectedSides.length} selected for{" "}
            <span className="font-medium text-[var(--nourish-dark)]">
              {mainDish}
            </span>
          </p>
        </div>
        {/* Reroll-all is a rare action (each card has its own reroll), so it's
            demoted to a quiet icon-only affordance in the corner — present for
            the user who wants a whole-new deck, invisible to everyone else
            (rule 13). The 44px hit area keeps it tappable despite the small glyph. */}
        {!calmDeck && (
          <motion.button
            onClick={onReroll}
            disabled={isRerolling}
            whileTap={reducedMotion || isRerolling ? undefined : { scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
              "text-[var(--nourish-subtext-faint)]",
              "hover:bg-neutral-100 hover:text-[var(--nourish-green)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
              "disabled:opacity-50 transition-colors duration-200",
            )}
            type="button"
            aria-label="Reroll all sides"
            title="Reroll all sides"
          >
            <RefreshCw
              size={15}
              className={isRerolling ? "animate-spin" : ""}
            />
          </motion.button>
        )}
      </div>

      <div className="space-y-3">
        {sides.map((side, idx) => (
          // Entrance-only stagger: the three sides cascade in when results
          // land, and a rerolled side fades back in (its id changes → remount).
          // No exit/layout animation — keeps the variable-height expand panel
          // and the sticky cook bar jank-free.
          <motion.div
            key={side.id}
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 25,
              delay: reducedMotion ? 0 : idx * 0.06,
            }}
          >
            <ResultCard
              side={side}
              mainDish={mainDish}
              rank={idx + 1}
              selected={selectedIds.has(side.id)}
              isRerolling={rerollingIndex === idx}
              onToggleSelect={() => toggleSelect(side.id)}
              onRerollSide={() => handleRerollSide(idx)}
              onCookThis={() => {
                recordPick([side]);
                onCookThis(side);
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Cook selected - primary CTA stays reachable while reviewing options.
          A cream gradient backdrop fades the cards out beneath the pill instead
          of letting them bleed through its rounded corners. (corpus:
          fixed-element-offset, whitespace-balance) */}
      <div className="sticky bottom-0 z-20 -mx-[var(--gutter)] space-y-2.5 bg-gradient-to-t from-[var(--nourish-cream)] from-60% to-transparent px-[var(--gutter)] pb-4 pt-5">
        {/* Phase 6 — live plate ring (food-group coverage + honest appraisal),
            tap to open the existing EvaluateSheet. Replaces the old button. */}
        {evaluation && (
          <PlateRing
            evaluation={evaluation}
            onOpen={() => setShowEvaluate(true)}
          />
        )}
        <motion.button
          onClick={handleCookSelected}
          disabled={selectedSides.length === 0}
          whileTap={selectedSides.length > 0 ? { scale: 0.96 } : undefined}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={cn(
            "flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors duration-200",
            selectedSides.length > 0
              ? "border-[var(--nourish-dark)] bg-[var(--nourish-dark)] text-white hover:bg-neutral-800"
              : "cursor-not-allowed border-neutral-200 bg-white text-neutral-400",
          )}
          type="button"
        >
          <ChefHat size={16} className="shrink-0" />
          <span className="truncate">
            {selectedSides.length === 0
              ? "Select sides to cook"
              : selectedSides.length === 1
                ? `Cook ${selectedSides[0].name}`
                : `Cook plate with ${selectedSides.length} sides`}
          </span>
        </motion.button>
        {/* Skip sides — cook the main on its own. Only when the main is itself
            cookable (a guided-cook flow exists for it). */}
        {onCookMainAlone && (
          <button
            type="button"
            onClick={onCookMainAlone}
            className="mx-auto flex min-h-[44px] items-center justify-center px-3 text-xs font-medium text-[var(--nourish-subtext)] transition-colors hover:text-[var(--nourish-green)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40 rounded-full"
          >
            Skip sides — cook it on its own
          </button>
        )}
      </div>

      {/* Evaluate sheet */}
      {evaluation && (
        <EvaluateSheet
          evaluation={evaluation}
          mainDish={mainDish}
          sideDishes={selectedSides.map((s) => s.name)}
          plateItems={plateItems}
          open={showEvaluate}
          onClose={() => setShowEvaluate(false)}
        />
      )}
    </motion.div>
  );
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
  const reducedMotion = useReducedMotion();

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
  const pairingSignal = getPairingSignal(side, rank);

  return (
    <motion.div
      layout={reducedMotion ? false : "position"}
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reducedMotion ? { duration: 0 } : { delay: rank * 0.08, duration: 0.3 }
      }
      className={cn(
        "overflow-hidden rounded-[var(--radius-lg)] border bg-white transition-colors duration-200",
        selected ? "border-[var(--nourish-green)]/45" : "border-neutral-200/80",
      )}
    >
      <div className="flex w-full items-center gap-3 p-3">
        {/* Selection checkbox  -  min 44px touch target wrapping the visual circle */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="-m-2 flex h-11 w-11 shrink-0 items-center justify-center"
          type="button"
          role="checkbox"
          aria-checked={selected}
          aria-label={`${selected ? "Deselect" : "Select"} ${side.name}`}
        >
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full border-2 transition duration-150",
              selected
                ? "border-[var(--nourish-green)] bg-[var(--nourish-green)]"
                : "border-neutral-300 bg-white",
            )}
          >
            {selected && (
              <Check size={10} className="text-white" strokeWidth={3} />
            )}
          </span>
        </motion.button>

        {/* Card content (tappable to expand) */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          type="button"
          aria-expanded={expanded}
        >
          {/* Side dish image */}
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
            {isRerolling ? (
              <div className="flex h-full w-full items-center justify-center">
                <RefreshCw
                  size={16}
                  className="animate-spin text-[var(--nourish-green)]"
                />
              </div>
            ) : side.imageUrl && !imgError ? (
              <Image
                src={side.imageUrl}
                alt={side.name}
                fill
                sizes="80px"
                className="object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-lg"
                style={{
                  background:
                    "linear-gradient(135deg, var(--nourish-green) 0%, var(--nourish-light-green) 60%, #a8d8b9 100%)",
                }}
              >
                <UtensilsCrossed size={22} className="text-white" />
              </div>
            )}
          </div>

          {/* Side dish info */}
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="line-clamp-2 font-semibold leading-snug text-[var(--nourish-dark)]">
              {side.name}
            </h3>
            {/* "by Chef Tu" byline for partner-chef sides. */}
            <CreatorByline slug={side.id} />

            {/* Collapsed card carries ONLY the meaningful signal chips (pairing
                reason, guided, fills-a-gap). The gray descriptor tags (cuisine /
                flavor like "salad", "mediterranean") were noise on the initial
                view — they live in the expand-only detail instead (rule 6/13:
                progressive disclosure, minimal initial text). */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="shrink-0 rounded-full bg-[var(--nourish-green)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--nourish-green)]">
                {pairingSignal}
              </span>
              {side.hasGuidedCook && (
                <span className="shrink-0 rounded-full bg-[var(--nourish-gold)]/15 px-2 py-0.5 text-[11px] font-medium text-[var(--nourish-gold)]">
                  Guided
                </span>
              )}
              {/* W29: this side is a strong source of a nutrient you're short
                  on today (the deficiency-fill reblend lifted it). */}
              {typeof side.scores?.deficiencyFill === "number" &&
                side.scores.deficiencyFill >= 0.25 && (
                  <span className="shrink-0 rounded-full bg-[var(--data-protein)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--data-protein)]">
                    Fills today&apos;s gaps
                  </span>
                )}
            </div>
          </div>

          <ChevronDown
            size={16}
            className={cn(
              "shrink-0 text-[var(--nourish-subtext)] transition-transform duration-200",
              expanded && "rotate-180",
            )}
          />
        </button>

        {/* Per-side reroll  -  min 44px touch target */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onRerollSide();
          }}
          disabled={isRerolling}
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="flex h-11 w-11 shrink-0 items-center justify-center disabled:opacity-40"
          type="button"
          title="Swap this side"
          aria-label={`Swap ${side.name} for a different side`}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 text-[var(--nourish-subtext)] hover:border-[var(--nourish-green)] hover:text-[var(--nourish-green)] transition-colors">
            <RotateCcw size={12} />
          </span>
        </motion.button>
      </div>

      {/* Expanded: "Why this won" + individual Cook this */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-neutral-100 px-4 pb-4 pt-3 space-y-3">
              {/* The one genuine per-pairing insight (already behind a tap). */}
              <p className="text-sm leading-relaxed text-[var(--nourish-dark)]">
                {displayExplanation}
              </p>

              {/* Dimension pills — icon + label, colour encodes strength.
                  No prose, no percentages (rule 13: disclosure on demand). */}
              <div className="flex flex-wrap gap-1.5">
                <DimPill
                  icon={Globe}
                  label="Cuisine fit"
                  value={side.scores.cuisineFit}
                />
                <DimPill
                  icon={Sparkles}
                  label="Flavor contrast"
                  value={side.scores.flavorContrast}
                />
                <DimPill
                  icon={Leaf}
                  label="Nutrition"
                  value={side.scores.nutritionBalance}
                />
                <DimPill
                  icon={Zap}
                  label="Quick prep"
                  value={side.scores.prepBurden}
                />
              </div>

              {/* Nutrition (macro ring) + ingredients-to-check — so you can
                  decide whether to make this side before committing. */}
              <SideNutritionRing slug={side.id} />
              <IngredientsToCheck slug={side.id} />
              <DietaryProfile slug={side.id} />

              {/* Cook just this side  -  secondary inline action */}
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

function getPairingSignal(side: SideResult, rank: number): string {
  if (rank === 1) return "Best match";
  if (side.scores.flavorContrast >= 0.7) return "Bright contrast";
  if (side.scores.prepBurden >= 0.72) return "Quick prep";
  if (side.scores.nutritionBalance >= 0.7) return "Balances plate";
  if (side.scores.cuisineFit >= 0.7) return "Same cuisine";
  return "Smart match";
}

/** The side's macro-ring nutrition, gated by composition coverage. */
function SideNutritionRing({ slug }: { slug: string }) {
  const { perServing, massedCoverage, massedLines, totalLines } =
    getDishNutrition(slug);
  if (!perServing || massedCoverage < NUTRITION_COVERAGE_FLOOR) return null;
  return (
    <div className="space-y-2">
      <div className="rounded-2xl bg-[var(--nourish-cream)]/60 p-3">
        <NutritionRingCard
          nutrition={perServing}
          coverage={{ massed: massedLines, total: totalLines }}
        />
      </div>
      <BioavailabilityTip nutrition={perServing} />
    </div>
  );
}

/** A pairing-dimension pill: icon + label, colour encodes strength. No
 *  percentage, no explanatory prose — the label stands on its own (rule 13). */
function DimPill({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  const tone = value >= 0.7 ? "strong" : value >= 0.45 ? "mid" : "weak";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium",
        tone === "strong"
          ? "bg-[var(--nourish-green)]/10 text-[var(--nourish-green)]"
          : tone === "mid"
            ? "bg-[var(--nourish-gold)]/15 text-[var(--nourish-gold)]"
            : "bg-neutral-100 text-[var(--nourish-subtext)]",
      )}
    >
      <Icon size={13} aria-hidden />
      {label}
    </span>
  );
}
