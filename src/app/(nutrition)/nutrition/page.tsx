"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Flame,
  Plus,
  UtensilsCrossed,
  Barcode,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { deficitFillFor } from "@/lib/nutrition/deficit-fill-dishes";
import { BrandedFoodSearch } from "@/components/nutrition/branded-food-search";
import { DiaryEntryRow } from "@/components/nutrition/diary-entry-row";
import { TextQuickLog } from "@/components/shared/text-quick-log";
import { WeeklyTrendCard } from "@/components/nutrition/weekly-trend-card";
import { HydrationCard } from "@/components/nutrition/hydration-card";
import { cn } from "@/lib/utils/cn";
import {
  useNutritionDiary,
  useDiaryHistory,
  useDiaryStore,
  diaryLogCook,
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
import { StaggerList, StaggerItem } from "@/components/shared/stagger-list";

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
  const [dayOffset, setDayOffset] = useState(0);
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
  const [showBranded, setShowBranded] = useState(false);

  // #10 — streak freeze: frozen days bridge the chain (not counted). The
  // header shows the bridged streak; an at-risk chip offers a one-tap save
  // when yesterday broke a ≥3-day run and a freeze is banked.
  const { used: frozenDays, spendFreezeOn } = useStreakFreezes();
  const diaryStore = useDiaryStore();
  const bridgedStreak = loggingStreakWithFreezes(
    diaryStore,
    frozenDays,
    new Date(),
  );
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
  // #6 — "kcal left" counts down from YOUR target once the profile is set.
  const { targets: personalTargets } = usePersonalTargets();
  const kcalLeft = Math.max(
    0,
    Math.round((personalTargets?.kcal ?? ENERGY_TARGET_KCAL) - consumedKcal),
  );

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
          {/* Stage 7 — the tracking glance: what's left today (only when
              something is logged; complements the ring's consumed-vs-targets). */}
          {isToday && consumedKcal > 0 && (
            <span className="text-[12px] font-medium text-[var(--nourish-subtext)]">
              {kcalLeft} kcal left
            </span>
          )}
          {bridgedStreak > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--nourish-gold)]/15 px-2.5 py-1 text-[12px] font-semibold text-[var(--nourish-gold)]">
              <Flame size={13} />
              {bridgedStreak}-day
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-md page-x space-y-4 pb-28 pt-4">
        {/* Stage 5 — day pager: review or back-fill the last 7 days. */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setDayOffset((o) => Math.min(MAX_DAYS_BACK, o + 1))}
            disabled={dayOffset >= MAX_DAYS_BACK}
            aria-label="Previous day"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-[var(--nourish-dark)] transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setDayOffset(0)}
            disabled={isToday}
            className={cn(
              "rounded-full px-3 py-1 text-[13px] font-semibold transition-colors",
              isToday
                ? "text-[var(--nourish-dark)]"
                : "bg-neutral-100 text-[var(--nourish-dark)] hover:bg-neutral-200",
            )}
            aria-label={isToday ? "Viewing today" : "Jump back to today"}
          >
            {labelFor(dayOffset, viewedDate)}
          </button>
          <button
            type="button"
            onClick={() => setDayOffset((o) => Math.max(0, o - 1))}
            disabled={isToday}
            aria-label="Next day"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-[var(--nourish-dark)] transition-colors disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>

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

        {/* Day ring — the glanceable status */}
        {dayNutrition ? (
          <div className="space-y-2">
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-4">
              <NutritionRingCard nutrition={dayNutrition} />
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

        {/* Entries — adjust servings in place (stage 3), remove with undo. */}
        {entries.length > 0 && (
          <section>
            <p className="sous-label mb-1.5">
              {isToday ? "Logged today" : "Logged"}
            </p>
            <StaggerList className="space-y-1.5">
              {entries.map((e) => (
                <StaggerItem key={e.at}>
                  <DiaryEntryRow entry={e} date={viewedDate} />
                </StaggerItem>
              ))}
            </StaggerList>
          </section>
        )}

        {/* W29 — log a dish by typing / dictating; writes to the viewed day. */}
        <TextQuickLog date={viewedDate} />

        {/* Quick add — 30-day staples first (stage 4: frequency + recency). */}
        {history.frequents.length > 0 && (
          <section>
            <p className="sous-label mb-1.5">Quick add</p>
            <StaggerList className="flex flex-wrap gap-2">
              {history.frequents.map((r) => (
                <StaggerItem key={r.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      haptic("commit");
                      // #7 — logs the dish's USUAL portion, not always ×1.
                      diaryLogCook(r.slug, r.name, r.usual, {
                        date: viewedDate,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--nourish-dark)] transition-colors hover:border-[var(--nourish-green)]/50 hover:bg-[var(--nourish-green)]/5"
                  >
                    <Plus size={12} className="text-[var(--nourish-green)]" />
                    {r.name}
                    {r.usual !== 1 && (
                      <span className="text-[var(--nourish-subtext-faint)]">
                        ×{r.usual}
                      </span>
                    )}
                  </button>
                </StaggerItem>
              ))}
            </StaggerList>
          </section>
        )}

        {/* W21 — log a packaged/branded food (barcode scan is founder-gated). */}
        <section>
          <button
            type="button"
            onClick={() => setShowBranded((s) => !s)}
            aria-expanded={showBranded}
            className="flex w-full items-center gap-2 rounded-xl border border-neutral-200/80 bg-white px-3 py-2.5 text-left"
          >
            <Barcode size={15} className="text-[var(--nourish-subtext)]" />
            <span className="flex-1 text-[13px] font-medium text-[var(--nourish-dark)]">
              Add a packaged food
            </span>
            <ChevronDown
              size={16}
              className={cn(
                "text-[var(--nourish-subtext)] transition-transform",
                showBranded && "rotate-180",
              )}
            />
          </button>
          {showBranded && (
            <div className="mt-2">
              <BrandedFoodSearch />
            </div>
          )}
        </section>

        {/* Insights — weekly trend + hydration (nutrition lives on Nutrition). */}
        <WeeklyTrendCard />
        <HydrationCard />
      </main>
    </div>
  );
}
