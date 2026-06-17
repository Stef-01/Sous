"use client";

/**
 * /path/plan/week — the planned week, rendered as a premium day-by-day list
 * (WeekDayList): big serif title, a week navigator, date-aware day sections
 * with photo thumbnails + colour-coded meal-type pills, warm cream separators.
 *
 * "now" is captured once after mount (Date is impure in render — react-compiler)
 * so the week dates + today highlight are correct without an impure render.
 * The meal-plan hook is week-key-addressed, so the ‹ › navigator simply moves
 * the offset and the hook re-loads that week's slots.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  RotateCcw,
} from "lucide-react";
import { useMealPlanWeek } from "@/lib/hooks/use-meal-plan-week";
import { summariseSlotMap } from "@/components/planner/week-calendar";
import { WeekDayList } from "@/components/planner/week-day-list";
import { PlanAddSheet } from "@/components/planner/plan-add-sheet";
import { lookupDish, isCustomDishSlug } from "@/lib/utils/dish-lookup";
import {
  buildSlotKey,
  dayKeyFromDate,
  isoWeekKey,
  type DayKey,
  type MealKey,
  type SlotKey,
} from "@/types/meal-plan";

function startOfWeekMonday(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const dow = (x.getDay() + 6) % 7; // 0 = Monday
  x.setDate(x.getDate() - dow);
  return x;
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function fmt(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function WeekPlanPage() {
  const router = useRouter();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const id = setTimeout(() => setNow(new Date()), 0);
    return () => clearTimeout(id);
  }, []);
  const [offset, setOffset] = useState(0);

  const monday = now ? startOfWeekMonday(addDays(now, offset * 7)) : null;
  const weekDates = monday
    ? Array.from({ length: 7 }, (_, i) => addDays(monday, i))
    : [];
  const weekKey = monday ? isoWeekKey(monday) : undefined;
  const todayKey: DayKey | null =
    now && offset === 0 ? dayKeyFromDate(now) : null;

  const { slotMap, mounted, clearAll, clearSlot, scheduleSlot } =
    useMealPlanWeek(weekKey);
  const summary = summariseSlotMap(slotMap);

  // Empty-slot add → a search-to-add sheet (search the catalog or type a custom
  // meal), instead of being stuck bouncing to the swipe planner. The cards stay
  // one tap away via the sheet's "Browse ideas" escape hatch.
  const [addSlot, setAddSlot] = useState<SlotKey | null>(null);
  const openAddSheet = (day: DayKey, meal: string) =>
    setAddSlot(buildSlotKey(day, meal as MealKey));

  // Tap a planned meal → manage it in place (cook / move / remove) instead of
  // bouncing back to the swipe planner (mockup-plan roadmap #3).
  const [manage, setManage] = useState<{
    slot: SlotKey;
    slug: string;
  } | null>(null);

  return (
    <div className="min-h-full bg-[var(--nourish-cream)] pb-24">
      <header className="app-header sticky top-0 z-10 page-x py-2.5">
        <div className="mx-auto flex max-w-md items-center">
          <Link
            href="/path"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--nourish-subtext)] transition hover:bg-white hover:text-[var(--nourish-dark)]"
            aria-label="Back to Path"
          >
            <ArrowLeft size={18} aria-hidden />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md page-x">
        {/* Title row — big serif, matching the reference's prominence. */}
        <div className="flex items-center justify-between gap-2 pt-1 pb-2">
          <h1 className="sous-title text-[var(--nourish-dark)]">Meal Plan</h1>
          {summary.filled > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Clear this week's plan?")) clearAll();
              }}
              aria-label="Clear this week's plan"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--nourish-border-strong)] bg-white text-[var(--nourish-subtext)] transition hover:text-[var(--nourish-dark)] active:scale-90 motion-reduce:active:scale-100"
            >
              <MoreHorizontal size={18} aria-hidden />
            </button>
          )}
        </div>

        {/* Week navigator */}
        <div className="flex items-center justify-between py-1.5">
          <button
            type="button"
            onClick={() => setOffset((o) => o - 1)}
            aria-label="Previous week"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--nourish-subtext)] transition-colors hover:bg-white hover:text-[var(--nourish-dark)] active:scale-90 motion-reduce:active:scale-100"
          >
            <ChevronLeft size={20} aria-hidden />
          </button>
          <p className="text-[15px] font-semibold text-[var(--nourish-dark)]">
            {monday ? `${fmt(weekDates[0])} – ${fmt(weekDates[6])}` : " "}
          </p>
          <button
            type="button"
            onClick={() => setOffset((o) => o + 1)}
            aria-label="Next week"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--nourish-subtext)] transition-colors hover:bg-white hover:text-[var(--nourish-dark)] active:scale-90 motion-reduce:active:scale-100"
          >
            <ChevronRight size={20} aria-hidden />
          </button>
        </div>

        <div
          className="-mx-[var(--gutter)] h-1.5 bg-[var(--divider-warm)]"
          aria-hidden
        />

        {!now || !mounted ? (
          <div
            className="mt-4 h-64 shimmer rounded-2xl border border-[var(--nourish-border-soft)]"
            aria-hidden
          />
        ) : (
          <WeekDayList
            weekDates={weekDates}
            slotMap={slotMap}
            todayKey={todayKey}
            onAddToSlot={openAddSheet}
            onTapMeal={(slot, slug) =>
              setManage({ slot: slot as SlotKey, slug })
            }
          />
        )}

        {manage && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/30">
            <button
              type="button"
              aria-label="Close"
              className="flex-1"
              onClick={() => setManage(null)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Manage planned meal"
              className="rounded-t-3xl bg-[var(--nourish-cream)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            >
              <p className="truncate text-[15px] font-semibold text-[var(--nourish-dark)]">
                {lookupDish(manage.slug).name}
              </p>

              {/* Move — tap any empty slot. Rows = days, cols = B/L/D. */}
              <div className="mt-3 space-y-1">
                {(
                  ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as DayKey[]
                ).map((d) => (
                  <div key={d} className="flex items-center gap-1.5">
                    <span className="w-9 text-[11px] font-medium uppercase text-[var(--nourish-subtext-faint)]">
                      {d}
                    </span>
                    {(["breakfast", "lunch", "dinner"] as MealKey[]).map(
                      (m) => {
                        const key = buildSlotKey(d, m);
                        const isSelf = key === manage.slot;
                        const taken = !isSelf && Boolean(slotMap[key]);
                        return (
                          <button
                            key={key}
                            type="button"
                            disabled={taken || isSelf}
                            aria-label={`Move to ${d} ${m}`}
                            onClick={() => {
                              scheduleSlot(key, manage.slug, "swipe-planned");
                              clearSlot(manage.slot);
                              setManage(null);
                            }}
                            className={
                              isSelf
                                ? "h-8 flex-1 rounded-lg bg-[var(--nourish-green)] text-[10px] font-semibold uppercase text-white"
                                : taken
                                  ? "h-8 flex-1 rounded-lg border border-neutral-200 bg-neutral-100 text-[10px] uppercase text-neutral-400"
                                  : "h-8 flex-1 rounded-lg border border-neutral-200 bg-white text-[10px] font-medium uppercase text-[var(--nourish-subtext)] transition-colors hover:border-[var(--nourish-green)]/50"
                            }
                          >
                            {m[0]}
                          </button>
                        );
                      },
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                {/* Custom free-text meals have no guided recipe to cook. */}
                {!isCustomDishSlug(manage.slug) && (
                  <button
                    type="button"
                    onClick={() => router.push(`/cook/${manage.slug}`)}
                    className="flex-1 rounded-xl bg-[var(--nourish-green)] py-2.5 text-[13px] font-semibold text-white active:scale-[0.98]"
                  >
                    Cook now
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    clearSlot(manage.slot);
                    setManage(null);
                  }}
                  className="flex-1 rounded-xl border border-neutral-200 bg-white py-2.5 text-[13px] font-medium text-[var(--nourish-subtext)] active:scale-[0.98]"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {addSlot && (
          <PlanAddSheet
            slot={addSlot}
            onPick={(slug) => {
              scheduleSlot(addSlot, slug, "manual");
              setAddSlot(null);
            }}
            onClose={() => setAddSlot(null)}
            onBrowseCards={() => router.push(`/path/plan?slot=${addSlot}`)}
          />
        )}

        <div className="flex flex-col gap-2 pt-5">
          <Link
            href="/path/plan"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--nourish-green)] py-3 text-sm font-semibold text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-[var(--nourish-dark-green)] active:scale-[0.99] motion-reduce:active:scale-100"
          >
            Add more cooks
          </Link>
          {summary.filled > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Clear the whole week's plan?")) clearAll();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--nourish-border-strong)] bg-white py-3 text-sm font-medium text-[var(--nourish-subtext)] transition hover:bg-neutral-50"
            >
              <RotateCcw size={14} aria-hidden />
              Clear the week
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
