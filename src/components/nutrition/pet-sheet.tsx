"use client";

/**
 * PetSheet — the Tamagotchi Easter egg, full-screen edition (founder mockup,
 * 2026-06-10). Tap the tiny pixel dog in the Nutrition header and Dobe's room
 * takes over the screen: pixel room scene, hero sprite, health-stat bars,
 * recent activity, action buttons, pantry inventory, streak.
 *
 * The honesty contract is unchanged: EVERY number is a real store/engine
 * value — kcal vs targets, hydration glasses, vitamin/fiber DV coverage,
 * Path XP/level, today's diary feed, the actual pantry. Buttons do real
 * things (WATER logs a glass; LOG MEAL focuses the real log field). The only
 * theatre is the dog's play-bow.
 */

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { PixelDoberman, PixelDobermanHero } from "./pixel-doberman";
import { PetRoom } from "./pet-room";
import { computePetState } from "@/lib/nutrition/pet-state";
import {
  activityFeed,
  vitaminCoverage,
  fiberCoverage,
  xpToLevel,
} from "@/lib/nutrition/pet-screen-data";
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
import {
  useHydration,
  HYDRATION_GOAL_GLASSES,
} from "@/lib/hooks/use-hydration";
import { useXPSystem } from "@/lib/hooks/use-xp-system";
import { usePantry } from "@/lib/hooks/use-pantry";
import { ingredientEmoji } from "@/lib/utils/ingredient-meta";
import { haptic } from "@/lib/motion/haptics";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const MOOD_LINE: Record<string, string> = {
  asleep: "zzz… log a meal to wake Dobe",
  hungry: "Dobe is hungry — log something real",
  peckish: "Dobe is peckish…",
  content: "Dobe is content",
  thriving: "Great job! Dobe is thriving!",
};

/** Mockup-style stat bar: icon · label · pixel track · %. */
function StatBar({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
}) {
  const p = Math.round(clamp01(value) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 text-center text-[11px]" aria-hidden>
        {icon}
      </span>
      <span className="w-[4.4rem] shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#e8d9b5]">
        {label}
      </span>
      <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-[2px] bg-black/40">
        <span
          className="block h-full"
          style={{ width: `${p}%`, backgroundColor: color }}
        />
      </span>
      <span className="w-8 shrink-0 text-right text-[10px] font-bold tabular-nums text-[#f6efe4]">
        {p}%
      </span>
    </div>
  );
}

/** Pixel-chrome panel (the mockup's dark wood boxes). */
function Panel({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border-2 border-[#6b4f3f] bg-[#241a12]/92 p-3",
        className,
      )}
    >
      {title && (
        <p className="pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#e8d9b5]">
          {title}
        </p>
      )}
      {children}
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
  const router = useRouter();
  const { entries } = useNutritionDiary();
  const store = useDiaryStore();
  const { used } = useStreakFreezes();
  const { targets } = usePersonalTargets();
  const { glasses, setGlasses } = useHydration();
  const { totalXP } = useXPSystem();
  const { items: pantryItems } = usePantry();
  const [pose, setPose] = useState<"stand" | "bow">("stand");

  // Play-bow is a moment, not a state — it relaxes back on its own.
  useEffect(() => {
    if (pose !== "bow") return;
    const t = setTimeout(() => setPose("stand"), 1400);
    return () => clearTimeout(t);
  }, [pose]);

  const agg = useMemo(() => aggregateDay(entries), [entries]);
  const state = useMemo(() => {
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
  }, [agg, entries.length, store, used, targets]);

  const streak = useMemo(
    () => loggingStreakWithFreezes(store, used, new Date()),
    [store, used],
  );
  const lvl = xpToLevel(totalXP);
  const feed = useMemo(
    () => activityFeed(entries, glasses),
    [entries, glasses],
  );
  const fillDishes = useMemo(
    () => (state.need ? dishesForDeficit(state.need, 2) : []),
    [state.need],
  );

  if (!open || typeof document === "undefined") return null;

  const play = () => {
    haptic("success");
    setPose("bow");
  };

  const logWater = () => {
    haptic("commit");
    setGlasses(glasses + 1);
  };

  const goLogMeal = () => {
    onClose();
    // The sheet only opens from /nutrition — the field is on the page below.
    setTimeout(() => {
      const el = document.querySelector<HTMLInputElement>(
        'input[aria-label="Log food"]',
      );
      el?.scrollIntoView({ block: "center" });
      el?.focus();
    }, 80);
  };

  const ACTIONS: Array<{
    key: string;
    label: string;
    icon: string;
    bg: string;
    onClick: () => void;
  }> = [
    {
      key: "meal",
      label: "Log meal",
      icon: "🍗",
      bg: "#b5651d",
      onClick: goLogMeal,
    },
    { key: "play", label: "Play", icon: "🔴", bg: "#5d8a3c", onClick: play },
    {
      key: "water",
      label: "Water",
      icon: "💧",
      bg: "#3c6e9c",
      onClick: logWater,
    },
    {
      key: "cook",
      label: "Cook",
      icon: "🍳",
      bg: "#8a5d9c",
      onClick: () => router.push("/today"),
    },
    {
      key: "stats",
      label: "Stats",
      icon: "📊",
      bg: "#9c7a2e",
      onClick: onClose,
    },
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Dobe's room"
      className="fixed inset-0 z-[80] overflow-y-auto bg-[#1c1620]"
    >
      <div className="min-h-full bg-gradient-to-b from-[#4a3f55] via-[#3a3145] to-[#2a2233]">
        <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-2.5 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]">
          {/* Header — name plate (real level/XP) + streak + close. */}
          <div className="flex items-start gap-2">
            <Panel className="flex flex-1 items-center gap-2.5 py-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[#6b4f3f] bg-black/30">
                <PixelDoberman mood={state.mood} size={26} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold tracking-wide text-[#f6efe4]">
                  DOBE{" "}
                  <span className="font-medium text-[#e8d9b5]/80">
                    Lv {lvl.level}
                  </span>
                </span>
                <span className="mt-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-full max-w-[120px] overflow-hidden rounded-[2px] bg-black/40">
                    <span
                      className="block h-full bg-[#7ab648]"
                      style={{ width: `${(lvl.into / lvl.needed) * 100}%` }}
                    />
                  </span>
                  <span className="shrink-0 text-[9px] font-bold tabular-nums text-[#e8d9b5]/80">
                    {lvl.into}/{lvl.needed} XP
                  </span>
                </span>
              </span>
            </Panel>
            <Panel className="px-2.5 py-2 text-center">
              <span className="block text-[15px] font-bold leading-none text-[#f5a93c]">
                🔥 {streak}
              </span>
              <span className="mt-0.5 block text-[8px] font-bold uppercase tracking-wider text-[#e8d9b5]/80">
                day streak
              </span>
            </Panel>
            <button
              type="button"
              onClick={onClose}
              aria-label="Leave Dobe's room"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-[#6b4f3f] bg-[#241a12]/92 text-[#e8d9b5]"
            >
              <X size={15} />
            </button>
          </div>

          {/* The room band shows the ENTIRE 180×120 scene (3:2). Dobe stands
              on the rug inside it; tap = play-bow. */}
          <PetRoom className="aspect-[3/2] w-full overflow-hidden rounded-xl border-2 border-[#6b4f3f]">
            <button
              type="button"
              onClick={play}
              aria-label="Play with Dobe"
              className="absolute bottom-[3%] left-1/2 -translate-x-1/2 active:scale-95 motion-reduce:active:scale-100"
            >
              <PixelDobermanHero
                mood={state.mood}
                pose={pose}
                size={150}
                className={cn(pose === "bow" && "motion-safe:animate-bounce")}
              />
            </button>
          </PetRoom>
          <p className="text-center text-[11px] font-bold uppercase tracking-widest text-[#f6efe4] [text-shadow:0_1px_0_rgba(0,0,0,.6)]">
            {MOOD_LINE[state.mood]}
          </p>

          {/* Health stats — every bar is a real engine value. */}
          <Panel title="Health stats">
            <div className="space-y-1.5">
              <StatBar
                icon="⚡"
                label="Energy"
                value={state.fullness}
                color="#f2c83c"
              />
              <StatBar
                icon="❤️"
                label="Mood"
                value={state.hearts / 5}
                color="#e85d8a"
              />
              <StatBar
                icon="💧"
                label="Hydration"
                value={glasses / HYDRATION_GOAL_GLASSES}
                color="#4d9de0"
              />
              <StatBar
                icon="🍗"
                label="Protein"
                value={state.strength}
                color="#e88d3c"
              />
              <StatBar
                icon="🌿"
                label="Fiber"
                value={fiberCoverage(agg)}
                color="#7ab648"
              />
              <StatBar
                icon="🛡️"
                label="Vitamins"
                value={vitaminCoverage(agg)}
                color="#9cc24a"
              />
            </div>
          </Panel>

          {/* Recent activity — today's actual diary + water. */}
          {feed.length > 0 && (
            <Panel title="Recent activity">
              <div className="space-y-1.5">
                {feed.map((row, i) => (
                  <div
                    key={`${row.label}-${i}`}
                    className="flex items-center gap-2 rounded-md bg-black/25 px-2 py-1.5"
                  >
                    <span className="text-[11px]" aria-hidden>
                      {row.icon === "water" ? "💧" : "🍗"}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#f6efe4]">
                      {row.label}
                    </span>
                    <span className="shrink-0 text-[10px] font-bold text-[#9cc24a]">
                      {row.detail}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Craving = the top real deficit, with dishes that close it. */}
          {state.need && fillDishes.length > 0 && (
            <Panel title={`Craving ${state.need.label}`}>
              <div className="flex flex-wrap gap-1.5">
                {fillDishes.map((d) => (
                  <Link
                    key={d.slug}
                    href={`/cook/${d.slug}`}
                    className="rounded-md border border-[#6b4f3f] bg-black/25 px-2 py-1 text-[10px] font-bold uppercase text-[#e8d9b5] active:translate-y-[1px]"
                  >
                    {d.name}
                  </Link>
                ))}
              </div>
            </Panel>
          )}

          {/* Actions — each one is real. */}
          <div className="grid grid-cols-5 gap-1.5">
            {ACTIONS.map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={a.onClick}
                className="flex flex-col items-center gap-1 rounded-lg border-2 border-black/30 px-1 py-2 text-[9px] font-bold uppercase tracking-wide text-white shadow-[inset_0_-2px_0_rgba(0,0,0,.3)] active:translate-y-[1px]"
                style={{ backgroundColor: a.bg }}
              >
                <span className="text-[15px] leading-none" aria-hidden>
                  {a.icon}
                </span>
                {a.label}
              </button>
            ))}
          </div>

          {/* Inventory — the actual pantry. */}
          {pantryItems.length > 0 && (
            <Panel title="Inventory">
              <div className="flex flex-wrap items-center gap-1.5">
                {pantryItems.slice(0, 8).map((name) => (
                  <span
                    key={name}
                    title={name}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-[#6b4f3f] bg-black/25 text-[15px]"
                  >
                    {ingredientEmoji(name)}
                  </span>
                ))}
                {pantryItems.length > 8 && (
                  <span className="text-[10px] font-bold text-[#e8d9b5]/80">
                    +{pantryItems.length - 8}
                  </span>
                )}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
