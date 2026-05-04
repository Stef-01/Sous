"use client";

/**
 * /path/plan/week — Y3 W27 week-calendar review surface.
 *
 * Standalone page the W26 swipe planner's completion screen
 * navigates to + that users can return to any time. Renders
 * the planned week using the W27 WeekCalendar component, with
 * per-slot swap + clear affordances.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw } from "lucide-react";
import {
  WeekCalendar,
  summariseSlotMap,
} from "@/components/planner/week-calendar";
import { useMealPlanWeek } from "@/lib/hooks/use-meal-plan-week";

export default function WeekPlanPage() {
  const router = useRouter();
  const { slotMap, mounted, clearAll } = useMealPlanWeek();
  const summary = summariseSlotMap(slotMap);

  const onAddToSlot = () => {
    // Re-enter the swipe planner to fill more slots. The
    // planner reads + appends to the same MealPlanWeek so the
    // existing slots persist.
    router.push("/path/plan");
  };

  const onTapFilled = (slot: string) => {
    // V1 swap-affordance: re-enter the planner. A future
    // commit could open a per-slot pool overlay; the simplest
    // V1 path lets the user clear + re-pick.
    void slot;
    router.push("/path/plan");
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
            This week&apos;s plan
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 pt-3">
        {/* Status strip */}
        <section className="rounded-2xl border border-[var(--nourish-border-strong)] bg-white px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
            Slots scheduled
          </p>
          <p className="mt-0.5 text-sm text-[var(--nourish-dark)]">
            <span className="font-semibold">{summary.filled}</span> of{" "}
            {summary.total}
          </p>
        </section>

        {/* Calendar */}
        {!mounted ? (
          <div
            className="h-64 animate-pulse rounded-2xl border border-[var(--nourish-border-soft)] bg-white"
            aria-hidden
          />
        ) : (
          <WeekCalendar
            slotMap={slotMap}
            onAddToSlot={onAddToSlot}
            onTapFilled={onTapFilled}
          />
        )}

        {/* Footer actions */}
        <div className="flex flex-col gap-2 pt-2">
          <Link
            href="/path/plan"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--nourish-green)] py-3 text-sm font-semibold text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-[var(--nourish-dark-green)]"
          >
            Add more cooks
          </Link>
          {summary.filled > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Clear the whole week's plan?")) clearAll();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--nourish-border-strong)] bg-white py-3 text-sm font-medium text-[var(--nourish-subtext)] hover:bg-neutral-50"
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
