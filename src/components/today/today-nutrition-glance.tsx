"use client";

/**
 * TodayNutritionGlance — the compact, glanceable metrics doorway on the Today
 * page. Integrates food stats (calories + what you ate), nutrient stats (macros
 * + the biggest gap), cravings (the gap's dishes link straight to /cook), AND
 * the pet: a small Doberman whose mood is computed from today's eating
 * (computePetState) and which taps through to the Doge game. Tapping the rest of
 * the card opens the full dashboard at /nutrition.
 *
 * Subordinate to the QuestCard hero (rule 2). Reads the shared aggregate via
 * useTodayStats — one source of truth with the Nutrition page. The pet mood is
 * the same computation the Nutrition page's Dobe uses, so the dog reads the same
 * everywhere. See docs/TODAY-DASHBOARD-PLAN.md.
 */
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useTodayStats } from "@/lib/today/use-today-stats";
import type { TodayMacro } from "@/lib/today/today-stats";
import { computePetState, type PetMood } from "@/lib/nutrition/pet-state";
import { PixelDoberman } from "@/components/nutrition/pixel-doberman";

const MACRO_LETTER: Record<TodayMacro["key"], string> = {
  carbs: "C",
  fat: "F",
  protein: "P",
};

const MOOD_WORD: Record<PetMood, string> = {
  asleep: "napping",
  hungry: "hungry",
  peckish: "peckish",
  content: "content",
  thriving: "thriving",
};

/** The pet, reflecting today's plate, tapping through to the Doge game. */
function DobeAvatar({ mood }: { mood: PetMood }) {
  return (
    <Link
      href="/doge"
      aria-label={`Dobe is ${MOOD_WORD[mood]} — open the game`}
      className="shrink-0 rounded-full transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
    >
      <span className="pet-breathe block">
        <PixelDoberman mood={mood} size={30} />
      </span>
    </Link>
  );
}

function MacroBar({ macro }: { macro: TodayMacro }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5">
      <span className="text-[11px] font-bold tabular-nums text-[var(--nourish-subtext)]">
        {MACRO_LETTER[macro.key]}
      </span>
      <span
        className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--nourish-cream)]"
        role="img"
        aria-label={`${macro.label} ${macro.grams} of ${macro.target} grams`}
      >
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--nourish-green)]/70"
          style={{ width: `${macro.pct}%` }}
        />
      </span>
      <span className="text-[10.5px] tabular-nums text-[var(--nourish-subtext-faint)]">
        {macro.grams}
      </span>
    </div>
  );
}

export function TodayNutritionGlance({ streak = 0 }: { streak?: number }) {
  const reduce = useReducedMotion();
  const stats = useTodayStats();

  // Dobe's mood IS your plate — the same computePetState the Nutrition page uses.
  // Only loggedCount/kcal/protein/streak drive the mood, all already on hand.
  const protein = stats.macros.find((m) => m.key === "protein");
  const mood = computePetState({
    loggedCount: stats.meals.length,
    kcal: stats.logged ? stats.kcal.consumed : null,
    targetKcal: stats.kcal.target,
    protein: stats.logged ? (protein?.grams ?? null) : null,
    targetProtein: protein?.target ?? 50,
    deficits: [],
    streak,
  }).mood;

  // Empty state — Dobe naps until you log; a warm doorway, never a rival CTA.
  if (!stats.logged) {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl border border-dashed border-[var(--nourish-green)]/25 bg-white/70 px-4 py-2.5 shadow-[var(--shadow-card)]">
        <DobeAvatar mood={mood} />
        <Link
          href="/nutrition"
          className="flex flex-1 items-center justify-between text-[var(--nourish-subtext)] active:scale-[0.99]"
          aria-label="Track today's plate"
        >
          <span className="text-[13px]">
            <span className="font-semibold text-[var(--nourish-dark)]">
              Today&rsquo;s plate
            </span>{" "}
            — nothing logged yet
          </span>
          <ChevronRight
            size={16}
            className="text-[var(--nourish-subtext-faint)]"
            aria-hidden
          />
        </Link>
      </div>
    );
  }

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)]"
      aria-label="Today's nutrition"
    >
      {/* Header row: Dobe (→ game) + the dashboard doorway (→ /nutrition). */}
      <div className="flex items-center gap-2.5 px-4 pt-3">
        <DobeAvatar mood={mood} />
        <Link
          href="/nutrition"
          className="flex flex-1 items-center justify-between gap-2 active:scale-[0.99]"
        >
          <span className="sous-label">Today&rsquo;s plate</span>
          <span className="flex items-center gap-0.5 text-[12px] font-semibold text-[var(--nourish-green)]">
            {stats.kcal.left.toLocaleString()} left
            <ChevronRight size={14} aria-hidden />
          </span>
        </Link>
      </div>

      {/* Calories bar */}
      <div className="px-4 pt-2">
        <span className="relative block h-2 overflow-hidden rounded-full bg-[var(--nourish-cream)]">
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-[var(--nourish-green)]"
            style={{ width: `${stats.kcal.pct}%` }}
          />
        </span>
        <p className="mt-1 text-[11.5px] tabular-nums text-[var(--nourish-subtext)]">
          <span className="font-semibold text-[var(--nourish-dark)]">
            {stats.kcal.consumed.toLocaleString()}
          </span>{" "}
          / {stats.kcal.target.toLocaleString()} kcal
        </p>
      </div>

      {/* Macro mini-bars */}
      <div className="flex items-center gap-3 px-4 pt-2">
        {stats.macros.map((m) => (
          <MacroBar key={m.key} macro={m} />
        ))}
      </div>

      {/* What you actually ate today — the concrete food stats under the macros. */}
      {stats.meals.length > 0 && (
        <p className="truncate px-4 pb-3 pt-1.5 text-[11px] text-[var(--nourish-subtext-faint)]">
          {stats.meals.join(" · ")}
        </p>
      )}

      {/* The integration: biggest nutrient gap → real dishes that close it. */}
      {stats.gap && stats.gap.suggestions.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-hidden border-t border-[var(--nourish-cream)] bg-[var(--tier-strong-bg)] px-4 py-2">
          <span className="shrink-0 text-[11.5px] text-[var(--nourish-dark)]">
            Low on <span className="font-semibold">{stats.gap.label}</span>
          </span>
          {stats.gap.suggestions.map((s) => (
            <Link
              key={s.slug}
              href={`/cook/${s.slug}`}
              className="inline-flex min-w-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[var(--nourish-dark)] shadow-[var(--shadow-card)] transition hover:bg-[var(--nourish-green)]/5 active:scale-[0.97]"
              title={s.name}
            >
              <span className="truncate">{s.name}</span>
              <span className="shrink-0 font-semibold text-[var(--tier-strong)]">
                +{Math.min(100, s.closesPct)}%
              </span>
            </Link>
          ))}
        </div>
      )}
    </motion.section>
  );
}
