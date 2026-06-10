"use client";

/**
 * PetSheet — the Tamagotchi Easter egg. Opened only by tapping the tiny pixel
 * dog in the Nutrition header (never introduced or explained anywhere — that's
 * the point). Everything on the little LCD is REAL: hearts/mood derive from
 * today's diary vs your targets, the stat bars are kcal + protein, and the
 * pet's "craving" is your top actual nutrient deficit with real dishes that
 * close it. Feed yourself, and it feels better.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { PixelDoberman } from "./pixel-doberman";
import { computePetState } from "@/lib/nutrition/pet-state";
import {
  aggregateDay,
  useNutritionDiary,
  useDiaryStore,
} from "@/lib/hooks/use-nutrition-diary";
import {
  useStreakFreezes,
  loggingStreakWithFreezes,
} from "@/lib/hooks/streak-freeze";
import { usePersonalTargets } from "@/lib/hooks/use-personal-targets";
import { computeDeficits } from "@/lib/nutrition/deficits";
import { dishesForDeficit } from "@/lib/nutrition/deficit-fill-dishes";
import { haptic } from "@/lib/motion/haptics";
import { cn } from "@/lib/utils/cn";

const MOOD_WORD: Record<string, string> = {
  asleep: "zzz…",
  hungry: "hungry",
  peckish: "peckish",
  content: "content",
  thriving: "thriving!",
};

/** Segmented pixel bar (10 blocks), Tamagotchi style. */
function PixelBar({ label, value }: { label: string; value: number }) {
  const filled = Math.round(value * 10);
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 text-[10px] font-bold uppercase tracking-wider text-[#3a4632]">
        {label}
      </span>
      <div className="flex gap-[2px]">
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-2.5 w-2 rounded-[1px]",
              i < filled ? "bg-[#3a4632]" : "bg-[#3a4632]/15",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function PetSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { entries } = useNutritionDiary();
  const store = useDiaryStore();
  const { used } = useStreakFreezes();
  const { targets } = usePersonalTargets();
  const [hop, setHop] = useState(0);

  const state = useMemo(() => {
    const agg = aggregateDay(entries);
    const kcal = typeof agg?.calories === "number" ? agg.calories : null;
    const protein = typeof agg?.protein_g === "number" ? agg.protein_g : null;
    return computePetState({
      loggedCount: entries.length,
      kcal,
      targetKcal: targets?.kcal ?? 2000,
      protein,
      targetProtein: targets?.protein_g ?? 50,
      deficits: entries.length > 0 ? computeDeficits(agg) : [],
      streak: loggingStreakWithFreezes(store, used, new Date()),
    });
  }, [entries, store, used, targets]);

  const fillDishes = useMemo(
    () => (state.need ? dishesForDeficit(state.need, 2) : []),
    [state.need],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/30">
      <button
        type="button"
        aria-label="Close"
        className="flex-1"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Your pet"
        className="rounded-t-3xl bg-[var(--nourish-cream)] p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        {/* The shell — a little device bezel around an LCD screen. */}
        <div className="relative mx-auto max-w-[300px] rounded-[28px] border-4 border-[#26221f] bg-[#3a4632] p-3 shadow-lg">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close pet"
            className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#26221f] bg-[var(--nourish-cream)] text-[var(--nourish-dark)]"
          >
            <X size={14} />
          </button>

          <div className="rounded-2xl bg-[#c7d4b0] px-4 pb-4 pt-3">
            {/* Hearts — each one is a real daily achievement. */}
            <div
              className="flex justify-center gap-1"
              aria-label={`${state.hearts} of 5 hearts`}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <svg
                  key={i}
                  viewBox="0 0 7 6"
                  width={16}
                  height={14}
                  aria-hidden
                >
                  <path
                    d="M1 0h2v1h1V0h2v1h1v2H6v1H5v1H4v1H3V5H2V4H1V3H0V1h1Z"
                    fill={i < state.hearts ? "#b03a2e" : "#3a463226"}
                  />
                </svg>
              ))}
            </div>

            {/* The dog. Tap = hop (a Tamagotchi must react). */}
            <button
              type="button"
              onClick={() => {
                haptic("success");
                setHop((h) => h + 1);
              }}
              aria-label="Pet the dog"
              className="mx-auto block pt-1 active:scale-95 motion-reduce:active:scale-100"
            >
              <PixelDoberman
                key={hop}
                mood={state.mood}
                size={132}
                className={cn(
                  hop > 0 && "motion-safe:animate-bounce",
                  state.mood === "asleep" && "opacity-80",
                )}
              />
            </button>
            <p className="pt-1 text-center text-[11px] font-bold uppercase tracking-widest text-[#3a4632]">
              {MOOD_WORD[state.mood]}
            </p>

            <div className="space-y-1.5 pt-3">
              <PixelBar label="Food" value={state.fullness} />
              <PixelBar label="Protein" value={state.strength} />
            </div>

            {/* The craving = your top real deficit; the dishes really close it. */}
            {state.need && fillDishes.length > 0 && (
              <div className="pt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#3a4632]">
                  craving {state.need.label}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {fillDishes.map((d) => (
                    <Link
                      key={d.slug}
                      href={`/cook/${d.slug}`}
                      className="rounded-md border-2 border-[#3a4632] bg-[#c7d4b0] px-2 py-1 text-[10px] font-bold uppercase text-[#3a4632] active:translate-y-[1px]"
                    >
                      {d.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
