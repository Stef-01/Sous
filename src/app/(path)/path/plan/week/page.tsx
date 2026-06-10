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
import { isoWeekKey, dayKeyFromDate, type DayKey } from "@/types/meal-plan";

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

  const { slotMap, mounted, clearAll } = useMealPlanWeek(weekKey);
  const summary = summariseSlotMap(slotMap);

  // Adding routes into the swipe planner; a picked slot rides along so the
  // first schedule lands exactly where the user pointed (reference popover).
  const goPlan = () => router.push("/path/plan");
  const goPlanSlot = (day: DayKey, meal: string) =>
    router.push(`/path/plan?slot=${day}-${meal}`);

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
            onAddToSlot={goPlanSlot}
            onTapMeal={goPlan}
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
