"use client";

/**
 * /path/plan — Swipe planner surface (Y3 W26).
 *
 * 90-second weekly meal-plan flow. Reads the W25 pool, shows
 * one card at a time, three button actions: Skip / Twist /
 * Schedule. Seven schedule actions land the user on the W27
 * week-calendar review.
 *
 * V1 buttons-only — real swipe gestures land at a future
 * commit alongside touch-event edge-case handling. Buttons
 * are keyboard-navigable + reduced-motion-safe by default.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, X, Check } from "lucide-react";
import dishShapePatternsRaw from "@/data/dish-shape-patterns.json";
import {
  buildSwipeCardPool,
  type PoolCandidate,
  type SwipeCard,
} from "@/lib/planner/swipe-pool";
import { usePantry } from "@/lib/hooks/use-pantry";
import { useCookSessions } from "@/lib/hooks/use-cook-sessions";
import { useMealPlanWeek } from "@/lib/hooks/use-meal-plan-week";
import {
  buildSlotKey,
  type DayKey,
  type MealKey,
  type SlotKey,
} from "@/types/meal-plan";
import { cn } from "@/lib/utils/cn";

interface DishShapePatternJSON {
  requiredAny: string[][];
  dishName: string;
  dishType: string;
  prepTimeMinutes: number;
  pairingExplanation: string;
}

const PATTERNS = dishShapePatternsRaw as DishShapePatternJSON[];

/** Pure: convert the dish-shape catalog into PoolCandidate
 *  shapes so the W25 helper can rank them. V1 stub —
 *  real seed-catalog wiring lands at a follow-up. */
function patternsToCandidates(
  patterns: ReadonlyArray<DishShapePatternJSON>,
): PoolCandidate[] {
  return patterns.map((p) => ({
    recipeSlug: p.dishName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title: p.dishName,
    cuisineFamily: "varied",
    // Use the FIRST candidate from each requiredAny slot as
    // the canonical ingredient. Pantry-coverage matching uses
    // the bidirectional substring helper so partial matches
    // still land coverage.
    ingredients: p.requiredAny.map((slot) => slot[0] ?? "").filter(Boolean),
    prepTimeMinutes: p.prepTimeMinutes,
    dietaryFlags: [],
    source: "seed",
  }));
}

/** Pure: which day-meal slots remain unfilled in the week's
 *  scheduled list? Returns an ordered list (Mon→Sun, breakfast→
 *  dinner) of empty slot keys. */
function nextEmptySlot(
  filledSlots: ReadonlySet<string>,
  preferredMeal: MealKey = "dinner",
): SlotKey | null {
  const days: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  // Try preferred-meal slot first across the week, then fall
  // through to lunch / breakfast.
  const mealOrder: MealKey[] = [preferredMeal];
  for (const m of ["dinner", "lunch", "breakfast"] as const) {
    if (!mealOrder.includes(m)) mealOrder.push(m);
  }
  for (const meal of mealOrder) {
    for (const day of days) {
      const key = buildSlotKey(day, meal);
      if (!filledSlots.has(key)) return key;
    }
  }
  return null;
}

export default function SwipePlannerPage() {
  const reducedMotion = useReducedMotion();
  const { items: pantryItems, mounted: pantryMounted } = usePantry();
  const { sessions } = useCookSessions();
  const { slotMap, scheduleSlot, mounted: planMounted } = useMealPlanWeek();

  const [poolCursor, setPoolCursor] = useState(0);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [twistVersion, setTwistVersion] = useState(0);

  const pool = useMemo<SwipeCard[]>(() => {
    if (!pantryMounted) return [];
    void twistVersion; // re-derive on twist requests
    return buildSwipeCardPool({
      candidates: patternsToCandidates(PATTERNS),
      pantry: pantryItems,
      dietaryUnion: [],
      recentCooks: sessions
        .filter((s) => s.completedAt && s.recipeSlug && s.cuisineFamily)
        .map((s) => ({
          recipeSlug: s.recipeSlug,
          cuisineFamily: s.cuisineFamily,
          completedAt: s.completedAt!,
        })),
      now: new Date(),
      // Drop the coverage floor for V1 since the dish-shape
      // patterns use generic ingredient names that may not
      // perfectly match user pantries until W18 expansion +
      // canonical-ingredient mapping land.
      minCoverage: 0.4,
    });
  }, [pantryItems, pantryMounted, sessions, twistVersion]);

  const filledSlots = useMemo(() => new Set(Object.keys(slotMap)), [slotMap]);

  /* eslint-disable react-hooks/set-state-in-effect -- legitimate: reset cursor when pool changes */
  useEffect(() => {
    setPoolCursor(0);
  }, [twistVersion]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const currentCard = pool[poolCursor] ?? null;
  const TARGET_SCHEDULED = 7;
  const isComplete = scheduledCount >= TARGET_SCHEDULED;
  const exhausted = poolCursor >= pool.length;

  const onSkip = () => {
    setPoolCursor((c) => c + 1);
  };

  const onTwist = () => {
    setTwistVersion((v) => v + 1);
  };

  const onSchedule = () => {
    if (!currentCard) return;
    const slot = nextEmptySlot(filledSlots);
    if (!slot) return; // calendar full
    scheduleSlot(slot, currentCard.recipeSlug, "swipe-planned");
    setScheduledCount((c) => c + 1);
    setPoolCursor((c) => c + 1);
  };

  return (
    <div className="min-h-full bg-[var(--nourish-cream)] pb-24">
      <header className="app-header sticky top-0 z-10 px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Link
            href="/path"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--nourish-border-strong)] bg-white text-[var(--nourish-dark)] transition hover:bg-neutral-50"
            aria-label="Back to Path"
          >
            <ArrowLeft size={16} aria-hidden />
          </Link>
          <h1 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
            Plan the week
          </h1>
        </div>
      </header>

      <main className="mx-auto flex max-w-md flex-col px-4 pt-3">
        {/* Progress strip */}
        <div className="mb-4 rounded-2xl border border-[var(--nourish-border-strong)] bg-white px-4 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
            Swipe to plan
          </p>
          <p className="mt-1 text-xs text-[var(--nourish-dark)]">
            <span className="font-semibold">{scheduledCount}</span> of{" "}
            {TARGET_SCHEDULED} scheduled · 90-second flow
          </p>
        </div>

        {!planMounted || !pantryMounted ? (
          <div className="h-64 animate-pulse rounded-2xl border border-[var(--nourish-border-soft)] bg-white" />
        ) : isComplete ? (
          <CompletionPanel scheduled={scheduledCount} />
        ) : currentCard ? (
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={`${currentCard.recipeSlug}-${twistVersion}-${poolCursor}`}
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.96, y: 8 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.96, y: -8 }
              }
              transition={{ duration: reducedMotion ? 0 : 0.18 }}
              className="rounded-2xl border border-[var(--nourish-border-soft)] bg-white shadow-sm"
              aria-label={`Card ${poolCursor + 1}: ${currentCard.title}`}
            >
              <div
                aria-hidden
                className="relative w-full bg-gradient-to-br from-[var(--nourish-cream)] to-[var(--nourish-input-bg)]"
                style={{ aspectRatio: "16 / 10" }}
              >
                <div className="flex h-full w-full items-center justify-center text-5xl">
                  🍽️
                </div>
              </div>
              <div className="space-y-2 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
                  {currentCard.cuisineFamily} · {currentCard.prepTimeMinutes}{" "}
                  min
                </p>
                <h2 className="font-serif text-xl font-semibold leading-snug text-[var(--nourish-dark)]">
                  {currentCard.title}
                </h2>
                <p className="text-xs text-[var(--nourish-subtext)]">
                  Pantry coverage:{" "}
                  <span className="font-semibold text-[var(--nourish-green)]">
                    {Math.round(currentCard.pantryCoverage * 100)}%
                  </span>
                </p>
              </div>
            </motion.article>
          </AnimatePresence>
        ) : (
          <EmptyPoolPanel
            exhausted={exhausted}
            onTwist={onTwist}
            scheduled={scheduledCount}
          />
        )}

        {!isComplete && currentCard && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <ActionButton
              label="Skip"
              icon={<X size={14} aria-hidden />}
              onClick={onSkip}
              tone="neutral"
            />
            <ActionButton
              label="Twist"
              icon={<Sparkles size={14} aria-hidden />}
              onClick={onTwist}
              tone="warm"
            />
            <ActionButton
              label="Schedule"
              icon={<Check size={14} aria-hidden />}
              onClick={onSchedule}
              tone="primary"
            />
          </div>
        )}

        {isComplete && (
          <Link
            href="/today"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--nourish-green)] py-3 text-sm font-semibold text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-[var(--nourish-dark-green)]"
          >
            See it on Today
            <ArrowRight size={14} aria-hidden />
          </Link>
        )}
      </main>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  tone,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  tone: "neutral" | "warm" | "primary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-xl py-3 text-xs font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
        tone === "neutral" &&
          "border border-[var(--nourish-border-strong)] bg-white text-[var(--nourish-subtext)] hover:bg-neutral-50",
        tone === "warm" &&
          "border border-[var(--nourish-gold)]/30 bg-[var(--nourish-gold)]/10 text-[var(--nourish-dark)] hover:bg-[var(--nourish-gold)]/15",
        tone === "primary" &&
          "bg-[var(--nourish-green)] text-white shadow-[var(--shadow-cta)] hover:bg-[var(--nourish-dark-green)]",
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function CompletionPanel({ scheduled }: { scheduled: number }) {
  return (
    <section className="rounded-2xl border border-[var(--nourish-green)]/25 bg-[var(--nourish-green)]/5 p-6 text-center">
      <span className="text-3xl" aria-hidden>
        🎉
      </span>
      <p className="mt-3 font-serif text-lg text-[var(--nourish-dark)]">
        Week planned — {scheduled} cooks queued
      </p>
      <p className="mt-1 text-xs text-[var(--nourish-subtext)]">
        Today will surface each day&apos;s pick when it&apos;s time to cook.
      </p>
    </section>
  );
}

function EmptyPoolPanel({
  exhausted,
  onTwist,
  scheduled,
}: {
  exhausted: boolean;
  onTwist: () => void;
  scheduled: number;
}) {
  return (
    <section className="rounded-2xl border border-dashed border-[var(--nourish-border-strong)] bg-white/40 p-6 text-center">
      <p className="font-serif text-base text-[var(--nourish-dark)]">
        {exhausted ? "Out of cards for now" : "Nothing matched your pantry"}
      </p>
      <p className="mt-2 text-xs text-[var(--nourish-subtext)]">
        {scheduled > 0
          ? `${scheduled} planned so far. Twist for a fresh batch or come back tomorrow.`
          : "Try adding a few more pantry items, or twist for a different angle."}
      </p>
      <button
        type="button"
        onClick={onTwist}
        className="mt-4 rounded-xl border border-[var(--nourish-border-strong)] bg-white px-4 py-2 text-sm font-medium text-[var(--nourish-dark)] hover:bg-neutral-50"
      >
        Twist for a fresh batch
      </button>
    </section>
  );
}
