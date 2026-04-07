"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  RefreshCw,
  ChefHat,
  Sparkles,
  Check,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { ScoreBreakdown } from "@/lib/engine/types";
import { evaluatePlate } from "@/lib/engine/plate-evaluation";
import type { PlateEvaluation } from "@/lib/engine/plate-evaluation";
import { EvaluateSheet } from "@/components/results/EvaluateSheet";
import { trpc } from "@/lib/trpc/client";

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
  sides: SideResult[];
  onCookThis: (side: SideResult) => void;
  onCookSelected?: (sides: SideResult[]) => void;
  onReroll: () => void;
  isRerolling?: boolean;
}

/**
 * Result Stack — three selectable side dish cards.
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
    if (
      rerollingIndex !== null &&
      lastRerollData?.success &&
      lastRerollData.side &&
      !rerollQuery.isFetching
    ) {
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
  }, [rerollingIndex, lastRerollData, rerollQuery.isFetching, appliedRerollKey]);
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

  const handleCookSelected = () => {
    if (selectedSides.length === 0) return;

    if (onCookSelected && selectedSides.length > 1) {
      onCookSelected(selectedSides);
    } else if (selectedSides.length === 1) {
      onCookThis(selectedSides[0]);
    } else {
      // Fallback: cook first selected
      onCookThis(selectedSides[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
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
            onCookThis={() => onCookThis(side)}
          />
        ))}
      </div>

      {/* Cook selected — primary CTA */}
      <motion.button
        onClick={handleCookSelected}
        disabled={selectedSides.length === 0}
        whileTap={selectedSides.length > 0 ? { scale: 0.96 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all duration-200",
          selectedSides.length > 0
            ? "bg-[var(--nourish-green)] text-white hover:bg-[var(--nourish-dark-green)] shadow-sm shadow-[var(--nourish-green)]/20"
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

      {/* Evaluate plate button — visually secondary */}
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

  // AI-enhanced pairing explanation — fires when expanded
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08, duration: 0.3 }}
      className={cn(
        "overflow-hidden rounded-xl border bg-white transition-colors",
        selected
          ? "border-[var(--nourish-green)]/30 shadow-sm"
          : "border-neutral-100 opacity-60",
      )}
    >
      <div className="flex w-full items-center gap-3 p-4">
        {/* Selection checkbox — min 44px touch target, visual circle stays h-6 w-6 */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150",
            selected
              ? "border-[var(--nourish-green)] bg-[var(--nourish-green)]"
              : "border-neutral-300 bg-white"
          )}
          type="button"
          role="checkbox"
          aria-checked={selected}
          aria-label={`${selected ? "Deselect" : "Select"} ${side.name}`}
        >
          {selected && <Check size={10} className="text-white" strokeWidth={3} />}
        </motion.button>

        {/* Card content (tappable to expand) */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex flex-1 items-center gap-2.5 text-left min-w-0"
          type="button"
        >
          {/* Side dish image */}
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
            {isRerolling ? (
              <div className="flex h-full w-full items-center justify-center">
                <RefreshCw
                  size={16}
                  className="animate-spin text-[var(--nourish-green)]"
                />
              </div>
            ) : (
              side.imageUrl && (
                <Image
                  src={side.imageUrl}
                  alt={side.name}
                  fill
                  className="object-cover"
                />
              )
            )}
          </div>

          {/* Side dish info */}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-[var(--nourish-dark)] truncate">
              {side.name}
            </h3>
            {(rank === 1 && selected || side.hasGuidedCook) && (
              <div className="flex items-center gap-1.5 mt-0.5">
                {rank === 1 && selected && (
                  <span className="shrink-0 rounded-full bg-[var(--nourish-green)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--nourish-green)]">
                    Best match
                  </span>
                )}
                {side.hasGuidedCook && (
                  <span className="shrink-0 rounded-full bg-[var(--nourish-gold)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--nourish-gold)]">
                    Guided
                  </span>
                )}
              </div>
            )}
            <p className="mt-0.5 text-xs text-[var(--nourish-subtext)] line-clamp-1">
              {side.explanation}
            </p>
          </div>

          <ChevronDown
            size={16}
            className={cn(
              "shrink-0 text-[var(--nourish-subtext)] transition-transform duration-200",
              expanded && "rotate-180",
            )}
          />
        </button>

        {/* Per-side reroll — min 44px touch target */}
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
              <p className="text-sm text-[var(--nourish-subtext)] leading-relaxed">
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
        "rounded-full px-2 py-0.5 text-[10px] font-medium",
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
