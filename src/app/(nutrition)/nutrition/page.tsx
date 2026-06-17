"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { UtensilsCrossed, Sparkles } from "lucide-react";
import { deficitFillFor } from "@/lib/nutrition/deficit-fill-dishes";
import { AiImportSheet } from "@/components/import/ai-import-sheet";
import { LogFood } from "@/components/nutrition/log-food";
import { PetSheet } from "@/components/nutrition/pet-sheet";
import { useNutrientGoals } from "@/lib/hooks/use-nutrient-goals";
import { PixelDoberman } from "@/components/nutrition/pixel-doberman";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import { DiaryEntryRow } from "@/components/nutrition/diary-entry-row";
import {
  WeekStrip,
  CaloriesCard,
  MacrosCard,
  DiarySlotCard,
  bucketBySlot,
  type MealSlot,
} from "@/components/nutrition/tracking-cards";
import { WeeklyTrendCard } from "@/components/nutrition/weekly-trend-card";
import { HydrationCard } from "@/components/nutrition/hydration-card";
import {
  useNutritionDiary,
  useDiaryHistory,
  useDiaryStore,
  dayKey,
} from "@/lib/hooks/use-nutrition-diary";
import {
  useStreakFreezes,
  loggingStreakWithFreezes,
  availableFreezes,
} from "@/lib/hooks/streak-freeze";
import { NutritionRingCard } from "@/components/shared/nutrition-ring-card";
import { usePersonalTargets } from "@/lib/hooks/use-personal-targets";
import { haptic } from "@/lib/motion/haptics";

/** FDA DV fallback when no personal profile is set (#6). */
const ENERGY_TARGET_KCAL = 2000;
/** How far back the day pager reaches — matches the weekly trend window. */
const MAX_DAYS_BACK = 6;

function labelFor(offset: number, d: Date): string {
  if (offset === 0) return "Today";
  if (offset === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long" });
}

/**
 * The Nutrition tab — the diary promoted to a first-class surface. One screen,
 * action-first: glance (day ring + kcal left + biggest gap) → entries (adjust
 * servings in place, remove with undo) → log (type/dictate with kcal previews,
 * one-tap staples, packaged) → insights (weekly trend, hydration).
 *
 * Stage 5: the day pager (‹ Today ›) reaches back 7 days, and every log
 * affordance writes to the VIEWED day — "I forgot to log yesterday's dinner"
 * is a two-tap fix, not a lost day. Cooked recipes auto-log on completion, so
 * for most users this page is read-mostly — the ring fills itself.
 */
export default function NutritionPage() {
  // Diary rows FLIP-animate add/remove; under reduced motion we skip the
  // AnimatePresence so there are no enter/exit transitions at all (W10).
  const reducedMotion = useReducedMotion();
  const [dayOffset, setDayOffset] = useState(0);
  const [petOpen, setPetOpen] = useState(false);
  const [showAllSlots, setShowAllSlots] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const { plan: goalPlan } = useNutrientGoals();
  const viewedDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - dayOffset);
    return d;
  }, [dayOffset]);

  const { entries, dayNutrition, cookedDayNutrition } =
    useNutritionDiary(viewedDate);
  const isToday = dayOffset === 0;
  // #3 — biggest gap + the dishes that close it (memo: catalogue scan).
  const deficitFill = useMemo(
    () => deficitFillFor(cookedDayNutrition),
    [cookedDayNutrition],
  );
  const history = useDiaryHistory();

  // #10 — streak freeze: the at-risk chip offers a one-tap save when
  // yesterday broke a ≥3-day run and a freeze is banked. (The streak number
  // itself lives in the pet room — header stays clean.)
  const { used: frozenDays, spendFreezeOn } = useStreakFreezes();
  const diaryStore = useDiaryStore();
  const freezesAvailable = availableFreezes(diaryStore, frozenDays, new Date());
  const yesterdayKey = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return dayKey(d);
  }, []);
  const streakAtRisk =
    isToday &&
    freezesAvailable > 0 &&
    !frozenDays.includes(yesterdayKey) &&
    (diaryStore[yesterdayKey]?.length ?? 0) === 0 &&
    loggingStreakWithFreezes(
      diaryStore,
      [...frozenDays, yesterdayKey],
      new Date(),
    ) >= 3;

  const consumedKcal = dayNutrition?.calories ?? 0;
  const slotted = useMemo(() => bucketBySlot(entries), [entries]);
  const focusLogFood = () => {
    const el = document.querySelector<HTMLInputElement>(
      'input[aria-label="Log food"]',
    );
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    el?.focus({ preventScroll: true });
  };
  // #6 — personal Mifflin targets drive the cards once the profile is set.
  const { targets: personalTargets } = usePersonalTargets();

  return (
    <div className="min-h-dvh bg-[var(--nourish-cream)]">
      <header className="app-header page-x py-2.5">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="sous-label">{isToday ? "Today" : "Diary"}</p>
            <h1 className="font-serif text-[19px] leading-tight text-[var(--nourish-dark)]">
              Nutrition
            </h1>
          </div>
          {/* Easter egg — never introduced anywhere. Those who notice the
              tiny dog find their day as a Tamagotchi (PetSheet). */}
          <button
            type="button"
            onClick={() => setPetOpen(true)}
            aria-label="Pixel dog"
            className="flex h-9 w-7 items-end justify-center pb-0.5 transition-transform hover:-translate-y-0.5 active:scale-90 motion-reduce:transition-none"
          >
            <PixelDoberman mood="content" size={20} />
          </button>
        </div>
      </header>

      <PetSheet open={petOpen} onClose={() => setPetOpen(false)} />

      <main className="mx-auto max-w-md page-x space-y-4 pb-28 pt-4">
        {/* Week strip (founder mockup) — real logged-day checks; tap = view. */}
        <WeekStrip
          store={diaryStore}
          dayOffset={dayOffset}
          onSelect={setDayOffset}
          maxDaysBack={MAX_DAYS_BACK}
        />

        {/* #10 — one-tap streak save when yesterday broke a ≥3-day run. */}
        {streakAtRisk && (
          <button
            type="button"
            onClick={() => {
              haptic("success");
              spendFreezeOn(yesterdayKey);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--nourish-gold)]/40 bg-[var(--nourish-gold)]/10 px-3 py-2.5 text-[12.5px] font-semibold text-[var(--nourish-dark)] transition hover:bg-[var(--nourish-gold)]/15 active:scale-[0.98]"
          >
            🧊 Streak at risk — use a freeze ({freezesAvailable} banked)
          </button>
        )}

        {/* Calories + macros (founder mockup grammar) — same aggregate +
            personal targets every other surface reads. */}
        <CaloriesCard
          consumed={consumedKcal}
          target={personalTargets?.kcal ?? ENERGY_TARGET_KCAL}
        />
        <MacrosCard
          carbs={dayNutrition?.totalCarbs_g ?? 0}
          fat={dayNutrition?.totalFat_g ?? 0}
          protein={dayNutrition?.protein_g ?? 0}
          targets={{
            carbs_g: personalTargets?.carbs_g ?? 275,
            fat_g: personalTargets?.fat_g ?? 78,
            protein_g: personalTargets?.protein_g ?? 50,
          }}
        />

        {/* Day ring — the glanceable status */}
        {dayNutrition ? (
          <div className="space-y-2">
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-4">
              <NutritionRingCard nutrition={dayNutrition} microsOnly />
            </div>
            {isToday && deficitFill && (
              <div className="rounded-xl bg-[var(--tier-strong-bg)] px-3 py-2.5">
                <p className="text-[12.5px] leading-snug text-[var(--nourish-dark)]">
                  Biggest gap today:{" "}
                  <span className="font-semibold">
                    {deficitFill.deficit.label}
                  </span>
                </p>
                {/* #3 — the food-first fix: dishes that close the gap, straight
                    from the same engine that reweights the side reranker. */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {deficitFill.suggestions.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/cook/${s.slug}`}
                      className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11.5px] font-medium text-[var(--nourish-dark)] transition-colors hover:bg-[var(--nourish-green)]/5 active:scale-[0.97]"
                    >
                      {s.name}
                      <span className="font-semibold text-[var(--tier-strong)]">
                        +{Math.min(100, s.closesPct)}%
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-center">
            <UtensilsCrossed
              size={22}
              className="mx-auto text-[var(--nourish-subtext-faint)]"
            />
            <p className="mt-2 text-[13px] text-[var(--nourish-subtext)]">
              {isToday
                ? "Cook a recipe and it logs itself — or add anything below."
                : `Nothing logged ${labelFor(dayOffset, viewedDate).toLowerCase()} — add what you ate below.`}
            </p>
            {/* Rule 2 — the one primary action points at the existing primary
                (the Today craving search), never a rival CTA. */}
            {isToday && (
              <Link
                href="/today"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--nourish-green)] px-4 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.97]"
              >
                Find something to cook
              </Link>
            )}
          </div>
        )}

        {/* Diary — meal-slot cards (founder mockup): summary + real C/F/P
            split per slot, Log focuses the field, tap to expand + edit. */}
        <section className="space-y-2.5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[17px] font-bold text-[var(--nourish-dark)]">
              Diary
            </h2>
            {entries.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAllSlots((v) => !v)}
                className="text-[13px] font-medium text-[var(--nourish-green)]"
              >
                {showAllSlots ? "Collapse" : "View all"}
              </button>
            )}
          </div>
          {(Object.keys(slotted) as MealSlot[]).map((slot) => (
            <DiarySlotCard
              key={slot}
              slot={slot}
              entries={slotted[slot]}
              onLog={focusLogFood}
              forceExpanded={showAllSlots || undefined}
            >
              {reducedMotion ? (
                slotted[slot].map((e) => (
                  <DiaryEntryRow key={e.at} entry={e} date={viewedDate} />
                ))
              ) : (
                <AnimatePresence initial={false}>
                  {slotted[slot].map((e) => (
                    <DiaryEntryRow key={e.at} entry={e} date={viewedDate} />
                  ))}
                </AnimatePresence>
              )}
            </DiarySlotCard>
          ))}
        </section>

        {/* Active goal-plan pattern note (claim-safe, one line, only when
            the plan carries one). */}
        {goalPlan?.avoid && (
          <p className="text-[11px] leading-snug text-[var(--nourish-subtext-faint)]">
            {goalPlan.label}: {goalPlan.avoid}
          </p>
        )}

        {/* ONE logging surface: type/dictate (dishes + packaged + restaurant,
            merged), camera that READS text/barcodes, staples when idle. */}
        <LogFood date={viewedDate} frequents={history.frequents} />

        {/* Bulk-log a whole day's meals via the AI paste bridge. */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowImport(true)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3 text-[12px] font-medium text-[var(--nourish-subtext)] transition-colors hover:text-[var(--nourish-green)]"
          >
            <Sparkles size={13} aria-hidden />
            Import a day from ChatGPT
          </button>
        </div>

        {/* Insights — weekly trend + hydration (nutrition lives on Nutrition). */}
        <WeeklyTrendCard />
        <HydrationCard />
      </main>

      <AiImportSheet
        open={showImport}
        onClose={() => setShowImport(false)}
        initialKind="nutrition"
      />
    </div>
  );
}
