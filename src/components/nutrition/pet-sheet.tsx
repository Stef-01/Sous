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
import {
  PixelDoberman,
  PixelDobermanHero,
  cosmeticsForLevel,
} from "./pixel-doberman";
import { PetRoom, type Daypart } from "./pet-room";
import { PixelFrame } from "./pixel-frame";
import { PixelIcon, type PixelIconName } from "./pixel-icons";
import { pixelFont } from "@/lib/fonts/pixel-font";
import { statTrends, type TrendDirection } from "@/lib/nutrition/pet-trends";
import { computePetState, seasonFromMonth } from "@/lib/nutrition/pet-state";
import {
  activityFeed,
  vitaminCoverage,
  fiberCoverage,
  xpToLevel,
} from "@/lib/nutrition/pet-screen-data";
import {
  aggregateDay,
  dayKey,
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
import { spotlightForNutrient } from "@/data/content/nutrient-spotlight";
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

/** Mockup-style stat bar: pixel icon · label · capped track · % · honest
 *  day-over-day arrow (omitted when yesterday has no data). */
function StatBar({
  icon,
  label,
  value,
  color,
  trend,
}: {
  icon: PixelIconName;
  label: string;
  value: number;
  color: string;
  trend?: TrendDirection | null;
}) {
  const p = Math.round(clamp01(value) * 100);
  return (
    <div className="flex items-center gap-2">
      <PixelIcon name={icon} size={13} className="shrink-0" />
      <span className="w-[4.6rem] shrink-0 text-[11px] font-bold uppercase tracking-wider text-[#e8d9b5]">
        {label}
      </span>
      <span className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-[1px] bg-black/45 shadow-[inset_0_1px_0_rgba(0,0,0,.6)]">
        <span
          className="block h-full shadow-[inset_0_-1px_0_rgba(0,0,0,.35),inset_0_1px_0_rgba(255,255,255,.25)]"
          style={{ width: `${p}%`, backgroundColor: color }}
        />
      </span>
      <span className="w-8 shrink-0 text-right text-[11px] font-bold tabular-nums text-[#f6efe4]">
        {p}%
      </span>
      <span
        className="w-3 shrink-0 text-center text-[10px] font-bold"
        aria-hidden
      >
        {trend === "up" && <span className="text-[#7ab648]">▲</span>}
        {trend === "down" && <span className="text-[#9c8a7a]">▼</span>}
      </span>
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
  const [blink, setBlink] = useState(false);
  const [earFlick, setEarFlick] = useState(false);

  // Idle life: random blinks every few seconds (a big static sprite reads
  // dead — round-5 research). Skipped while asleep (lids already down).
  useEffect(() => {
    if (!open || entries.length === 0) return;
    let lid: ReturnType<typeof setTimeout>;
    const iv = setInterval(
      () => {
        setBlink(true);
        lid = setTimeout(() => setBlink(false), 160);
      },
      3500 + Math.random() * 2500,
    );
    return () => {
      clearInterval(iv);
      clearTimeout(lid);
    };
  }, [open, entries.length]);

  // Second idle animation: an occasional ear flick, offset from blinks so the
  // sprite never reads static. Skipped while asleep (ears already folded).
  useEffect(() => {
    if (!open || entries.length === 0) return;
    let down: ReturnType<typeof setTimeout>;
    const iv = setInterval(
      () => {
        setEarFlick(true);
        down = setTimeout(() => setEarFlick(false), 220);
      },
      6000 + Math.random() * 4000,
    );
    return () => {
      clearInterval(iv);
      clearTimeout(down);
    };
  }, [open, entries.length]);

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
  // Earned cosmetics from the real Path level (goal-gradient, no fake economy):
  // a chef's toque at Lv2, a red collar at Lv3, a gold one at Lv6. The puppy
  // also grows (smaller below Lv3).
  const cosmetics = cosmeticsForLevel(lvl.level);
  const heroSize = lvl.level >= 3 ? 176 : 150;

  // Finch pattern: the pet visibly reacts to the REAL thing you just did.
  // A meal logged in the last 10 minutes puts its bowl on the rug and Dobe
  // lights up; the moment self-clears.
  const [openedAt, setOpenedAt] = useState(0);
  /* eslint-disable react-hooks/set-state-in-effect -- stamping the open
     moment once per open is the intent; recency must not drift per render */
  useEffect(() => {
    if (open) setOpenedAt(Date.now());
  }, [open, entries.length]);
  /* eslint-enable react-hooks/set-state-in-effect */
  const recentMeal = useMemo(() => {
    const last = entries[entries.length - 1];
    if (!last || !openedAt) return null;
    const ageMs = openedAt - new Date(last.at).getTime();
    return ageMs < 10 * 60_000 ? last : null;
  }, [entries, openedAt]);
  const [mealAckAt, setMealAckAt] = useState<string | null>(null);
  useEffect(() => {
    if (!recentMeal || !open) return;
    const t = setTimeout(() => setMealAckAt(recentMeal.at), 6000);
    return () => clearTimeout(t);
  }, [recentMeal, open]);
  const showMeal = Boolean(recentMeal) && mealAckAt !== recentMeal?.at;

  // The room lives on your clock (Animal Crossing presence pattern).
  const now = new Date();
  const hour = now.getHours();
  const daypart: Daypart =
    hour >= 7 && hour < 17 ? "day" : hour >= 17 && hour < 20 ? "dusk" : "night";
  const season = seasonFromMonth(now.getMonth());
  const feed = useMemo(
    () => activityFeed(entries, glasses),
    [entries, glasses],
  );
  const trends = useMemo(
    () =>
      statTrends(store, new Date(), {
        kcal: targets?.kcal ?? 2000,
        protein_g: targets?.protein_g ?? 50,
      }),
    [store, targets],
  );
  const fillDishes = useMemo(
    () => (state.need ? dishesForDeficit(state.need, 2) : []),
    [state.need],
  );
  // Dobe's reading corner — the existing nutrient-spotlight article matching
  // the craving, when one exists (contextual education, not a feed).
  const reading = state.need ? spotlightForNutrient(state.need.key) : null;

  // Weekly ritual (Pokémon-Sleep pattern, earned not nagged): once last week
  // has ≥3 logged days, the room offers the wrapped — the count varies the
  // moment, so it never replays identically.
  const lastWeekDays = useMemo(() => {
    let n = 0;
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      if ((store[dayKey(d)]?.length ?? 0) > 0) n++;
    }
    return n;
  }, [store]);

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
    icon: PixelIconName;
    bg: string;
    onClick: () => void;
  }> = [
    {
      key: "meal",
      label: "Log meal",
      icon: "drumstick",
      bg: "#c06a1e",
      onClick: goLogMeal,
    },
    { key: "play", label: "Play", icon: "ball", bg: "#5d9c3c", onClick: play },
    {
      key: "water",
      label: "Water",
      icon: "droplet",
      bg: "#3c7ab0",
      onClick: logWater,
    },
    {
      key: "cook",
      label: "Cook",
      icon: "pan",
      bg: "#8a5da8",
      onClick: () => router.push("/today"),
    },
    {
      key: "stats",
      label: "Stats",
      icon: "chart",
      bg: "#b08a2e",
      onClick: onClose,
    },
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Dobe's room"
      className={cn(
        "fixed inset-0 z-[80] overflow-y-auto bg-[#1c1620]",
        pixelFont.className,
      )}
    >
      <div className="min-h-full bg-gradient-to-b from-[#4a3f55] via-[#3a3145] to-[#2a2233]">
        <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-2.5 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]">
          {/* Header — name plate (real level/XP) + streak + close. */}
          <div className="flex items-start gap-2">
            <PixelFrame
              className="flex-1"
              contentClassName="flex items-center gap-2.5 py-2"
            >
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
                  <span className="h-1.5 w-full overflow-hidden rounded-[1px] bg-black/40">
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
            </PixelFrame>
            <PixelFrame contentClassName="px-2.5 py-2 text-center">
              <span className="flex items-center justify-center gap-1 text-[15px] font-bold leading-none text-[#f5a93c]">
                <PixelIcon name="flame" size={13} /> {streak}
              </span>
              <span className="mt-0.5 block text-[8px] font-bold uppercase tracking-wider text-[#e8d9b5]/80">
                day streak
              </span>
            </PixelFrame>
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
          <PetRoom
            daypart={daypart}
            season={season}
            className="aspect-[3/2] w-full overflow-hidden rounded-xl border-2 border-[#6b4f3f]"
          >
            {showMeal && recentMeal && (
              <span
                aria-hidden
                className="absolute bottom-[8%] left-[68%] flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#171310] bg-[#8a6648] text-[16px] shadow-[inset_0_-2px_0_rgba(0,0,0,.4)]"
              >
                {ingredientEmoji(recentMeal.name)}
              </span>
            )}
            <button
              type="button"
              onClick={play}
              aria-label="Play with Dobe"
              className="absolute bottom-[3%] left-1/2 -translate-x-1/2 active:scale-95 motion-reduce:active:scale-100"
            >
              <PixelDobermanHero
                mood={showMeal ? "thriving" : state.mood}
                pose={pose}
                collar={cosmetics.collar}
                blink={blink}
                earFlick={earFlick}
                toque={cosmetics.toque}
                size={heroSize}
                className={cn(
                  "pet-breathe",
                  pose === "bow" && "motion-safe:animate-bounce",
                )}
              />
            </button>
          </PetRoom>
          <p className="text-center text-[11px] font-bold uppercase tracking-widest text-[#f6efe4] [text-shadow:0_1px_0_rgba(0,0,0,.6)]">
            {showMeal && recentMeal
              ? `Dobe enjoyed the ${recentMeal.name}!`
              : MOOD_LINE[state.mood]}
          </p>
          {lastWeekDays >= 3 && (
            <Link
              href="/path/recap"
              className="mx-auto -mt-0.5 rounded-md border border-[#8a6648] bg-[#2e2014]/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#f0d9a0] active:translate-y-[1px]"
            >
              {lastWeekDays}-day week — see Dobe&apos;s recap
            </Link>
          )}

          {/* Health stats — every bar is a real engine value. */}
          <PixelFrame title="Health stats">
            <div className="space-y-1.5">
              <StatBar
                icon="bolt"
                label="Energy"
                value={state.fullness}
                color="#f5c93c"
                trend={trends.energy}
              />
              <StatBar
                icon="heart"
                label="Mood"
                value={state.hearts / 5}
                color="#ef5d8f"
              />
              <StatBar
                icon="droplet"
                label="Hydration"
                value={glasses / HYDRATION_GOAL_GLASSES}
                color="#48a8f0"
              />
              <StatBar
                icon="drumstick"
                label="Protein"
                value={state.strength}
                color="#f08a36"
                trend={trends.protein}
              />
              <StatBar
                icon="leaf"
                label="Fiber"
                value={fiberCoverage(agg)}
                color="#7dc24a"
                trend={trends.fiber}
              />
              <StatBar
                icon="shield"
                label="Vitamins"
                value={vitaminCoverage(agg)}
                color="#a8cf4a"
                trend={trends.vitamins}
              />
            </div>
          </PixelFrame>

          {/* Recent activity — today's actual diary + water. */}
          {feed.length > 0 && (
            <PixelFrame title="Recent activity">
              <div className="space-y-1.5">
                {feed.map((row, i) => (
                  <div
                    key={`${row.label}-${i}`}
                    className="flex items-center gap-2 rounded-md bg-black/25 px-2 py-1.5"
                  >
                    <PixelIcon
                      name={row.icon === "water" ? "droplet" : "drumstick"}
                      size={12}
                      className="shrink-0"
                    />
                    <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#f6efe4]">
                      {row.label}
                    </span>
                    <span className="shrink-0 text-[10px] font-bold text-[#9cc24a]">
                      {row.detail}
                    </span>
                  </div>
                ))}
              </div>
            </PixelFrame>
          )}

          {/* Craving = the top real deficit, with dishes that close it. */}
          {state.need && fillDishes.length > 0 && (
            <PixelFrame title={`Craving ${state.need.label}`}>
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
                {reading && (
                  <Link
                    href={`/community/article/${reading.slug}`}
                    className="rounded-md border border-[#8a6648] bg-[#8a6648]/30 px-2 py-1 text-[10px] font-bold uppercase text-[#f0d9a0] active:translate-y-[1px]"
                  >
                    Read why
                  </Link>
                )}
              </div>
            </PixelFrame>
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
                <PixelIcon name={a.icon} size={16} />
                {a.label}
              </button>
            ))}
          </div>

          {/* Inventory — the actual pantry. */}
          {pantryItems.length > 0 && (
            <PixelFrame title="Inventory">
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
            </PixelFrame>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
