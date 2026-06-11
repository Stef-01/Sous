"use client";

/**
 * Tracking cards (founder mockup, 2026-06-11) — the MacroFactor-style glance
 * layer for the Nutrition tab:
 *
 *   WeekStrip    S–S check circles for REAL logged days; tap = view that day
 *                (replaces the ‹ Today › pager, same offset contract).
 *   CaloriesCard "976 cal / 2,074 · 1,098 left" + progress bar.
 *   MacrosCard   three columns (Carbs · Fat · Protein), g / target + mini bar.
 *   DiarySlots   Breakfast/Lunch/Dinner cards — summary line, kcal + real
 *                C/F/P split, per-slot Log; tap a slot to expand its entries.
 *
 * Same stores as everything else: aggregateDay + personal targets. No new
 * numbers — just the mockup's presentation grammar.
 */

import { useState, type ReactNode } from "react";
import {
  ArrowLeftRight,
  Check,
  Coffee,
  Soup,
  UtensilsCrossed,
} from "lucide-react";
import { dayKey, type DiaryEntry } from "@/lib/hooks/use-nutrition-diary";
import { haptic } from "@/lib/motion/haptics";
import { cn } from "@/lib/utils/cn";

/* ── Week strip ──────────────────────────────────────────────────────────── */

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

export function WeekStrip({
  store,
  dayOffset,
  onSelect,
  maxDaysBack,
}: {
  store: Record<string, DiaryEntry[]>;
  /** Days back from today currently viewed (0 = today). */
  dayOffset: number;
  onSelect: (offset: number) => void;
  maxDaysBack: number;
}) {
  const today = new Date();
  const todayDow = today.getDay(); // 0 = Sunday
  return (
    <div className="flex items-center justify-between">
      {DAY_LETTERS.map((letter, dow) => {
        const offset = todayDow - dow; // this week's Sun..Sat
        const d = new Date(today);
        d.setDate(d.getDate() - offset);
        const logged = (store[dayKey(d)]?.length ?? 0) > 0;
        const isFuture = offset < 0;
        const selectable = !isFuture && offset <= maxDaysBack;
        const isViewed = offset === dayOffset;
        return (
          <button
            key={dow}
            type="button"
            disabled={!selectable}
            onClick={() => {
              haptic("select");
              onSelect(offset);
            }}
            aria-label={`View ${d.toLocaleDateString(undefined, { weekday: "long" })}`}
            aria-pressed={isViewed}
            className="flex flex-col items-center gap-1.5"
          >
            <span
              className={cn(
                "text-[11px] font-semibold",
                isViewed
                  ? "text-[var(--nourish-dark)]"
                  : "text-[var(--nourish-subtext-faint)]",
              )}
            >
              {letter}
            </span>
            <span className="relative">
              {isViewed && (
                <span className="absolute -top-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--nourish-green)]" />
              )}
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors",
                  logged
                    ? "border-[var(--nourish-dark)] bg-[var(--nourish-dark)]"
                    : isFuture
                      ? "border-neutral-200"
                      : "border-neutral-300",
                )}
              >
                {logged && (
                  <Check size={13} className="text-white" strokeWidth={3} />
                )}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Calories card ───────────────────────────────────────────────────────── */

export function CaloriesCard({
  consumed,
  target,
}: {
  consumed: number;
  target: number;
}) {
  const left = Math.max(0, Math.round(target - consumed));
  const pct = Math.min(100, (consumed / target) * 100);
  return (
    <div className="rounded-2xl border border-neutral-200/60 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_28px_-14px_rgba(0,0,0,0.14)]">
      <p className="text-[13px] font-medium text-[var(--nourish-subtext)]">
        Calories
      </p>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <p className="text-[var(--nourish-dark)]">
          <span className="text-[28px] font-extrabold tracking-tight tabular-nums">
            {Math.round(consumed).toLocaleString()} cal
          </span>{" "}
          <span className="text-[14px] font-medium text-[var(--nourish-subtext)]">
            / {Math.round(target).toLocaleString()}
          </span>
        </p>
        <p className="text-[13px] font-medium text-[var(--nourish-subtext)] tabular-nums">
          {left.toLocaleString()} left
        </p>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-[var(--nourish-green)] transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── Macros card ─────────────────────────────────────────────────────────── */

function MacroCol({
  label,
  grams,
  target,
  color,
  mode,
}: {
  label: string;
  grams: number;
  target: number;
  color: string;
  mode: "consumed" | "left";
}) {
  const pct = target > 0 ? Math.min(100, (grams / target) * 100) : 0;
  const shown = mode === "left" ? Math.max(0, target - grams) : grams;
  return (
    <div className="min-w-0 flex-1">
      <p className="text-[13px] font-medium text-[var(--nourish-subtext)]">
        {label}
      </p>
      <p className="mt-0.5 whitespace-nowrap text-[15px] font-bold tabular-nums text-[var(--nourish-dark)]">
        {Math.round(shown)}g
        <span className="text-[11px] font-medium text-[var(--nourish-subtext-faint)]">
          {" "}
          {mode === "left" ? "left" : `/${Math.round(target)}`}
        </span>
      </p>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function MacrosCard({
  carbs,
  fat,
  protein,
  targets,
}: {
  carbs: number;
  fat: number;
  protein: number;
  targets: { carbs_g: number; fat_g: number; protein_g: number };
}) {
  // The mockup's ⇄: consumed ⇄ remaining, same stores either way.
  const [mode, setMode] = useState<"consumed" | "left">("consumed");
  return (
    <div className="relative flex gap-3 rounded-2xl border border-neutral-200/60 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_28px_-14px_rgba(0,0,0,0.14)]">
      <MacroCol
        label="Carbs"
        grams={carbs}
        target={targets.carbs_g}
        color="#14b8a6"
        mode={mode}
      />
      <MacroCol
        label="Fat"
        grams={fat}
        target={targets.fat_g}
        color="#9333ea"
        mode={mode}
      />
      <MacroCol
        label="Protein"
        grams={protein}
        target={targets.protein_g}
        color="#f59e0b"
        mode={mode}
      />
      <button
        type="button"
        onClick={() => setMode((m) => (m === "consumed" ? "left" : "consumed"))}
        aria-label={mode === "consumed" ? "Show remaining" : "Show consumed"}
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-[var(--nourish-subtext)] transition active:scale-90"
      >
        <ArrowLeftRight size={12} />
      </button>
    </div>
  );
}

/* ── Diary slots ─────────────────────────────────────────────────────────── */

export type MealSlot = "breakfast" | "lunch" | "dinner";

/** Pure: bucket entries by logged hour (same boundaries as pickCurrentMeal). */
export function bucketBySlot(
  entries: ReadonlyArray<DiaryEntry>,
): Record<MealSlot, DiaryEntry[]> {
  const out: Record<MealSlot, DiaryEntry[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
  };
  for (const e of entries) {
    const hour = new Date(e.at).getHours();
    if (hour < 11) out.breakfast.push(e);
    else if (hour < 16) out.lunch.push(e);
    else out.dinner.push(e);
  }
  return out;
}

/** Pure: slot summary — kcal total + macro-calorie split (4/4/9). */
export function slotSummary(entries: ReadonlyArray<DiaryEntry>): {
  kcal: number;
  c: number;
  f: number;
  p: number;
} | null {
  let kcal = 0;
  let cG = 0;
  let fG = 0;
  let pG = 0;
  let any = false;
  for (const e of entries) {
    const n = e.nutrition as
      | {
          calories?: number;
          totalCarbs_g?: number;
          totalFat_g?: number;
          protein_g?: number;
        }
      | undefined;
    if (!n || typeof n.calories !== "number") continue;
    any = true;
    kcal += n.calories * e.servings;
    cG += (n.totalCarbs_g ?? 0) * e.servings;
    fG += (n.totalFat_g ?? 0) * e.servings;
    pG += (n.protein_g ?? 0) * e.servings;
  }
  if (!any) return null;
  const macroKcal = cG * 4 + fG * 9 + pG * 4;
  if (macroKcal <= 0) return { kcal: Math.round(kcal), c: 0, f: 0, p: 0 };
  return {
    kcal: Math.round(kcal),
    c: Math.round(((cG * 4) / macroKcal) * 100),
    f: Math.round(((fG * 9) / macroKcal) * 100),
    p: Math.round(((pG * 4) / macroKcal) * 100),
  };
}

const SLOT_META: Record<MealSlot, { label: string; icon: typeof Coffee }> = {
  breakfast: { label: "Breakfast", icon: Coffee },
  lunch: { label: "Lunch", icon: Soup },
  dinner: { label: "Dinner", icon: UtensilsCrossed },
};

export function DiarySlotCard({
  slot,
  entries,
  onLog,
  forceExpanded,
  children,
}: {
  slot: MealSlot;
  entries: DiaryEntry[];
  onLog: () => void;
  /** "View all" override — when set, wins over the tap state. */
  forceExpanded?: boolean;
  /** Expanded body — the editable entry rows. */
  children?: ReactNode;
}) {
  const [tapped, setTapped] = useState(false);
  const expanded = forceExpanded || tapped;
  const meta = SLOT_META[slot];
  const Icon = meta.icon;
  const summary = slotSummary(entries);
  const names =
    entries.length === 0
      ? null
      : entries.length === 1
        ? entries[0].name
        : `${entries[0].name} and ${entries.length - 1} more`;

  return (
    <div className="rounded-2xl border border-neutral-200/60 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_28px_-14px_rgba(0,0,0,0.14)]">
      <div className="flex items-center gap-3 p-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--nourish-green)]/10 text-[var(--nourish-green)]">
          <Icon size={16} />
        </span>
        <button
          type="button"
          onClick={() => entries.length > 0 && setTapped((e) => !e)}
          aria-expanded={expanded}
          className="min-w-0 flex-1 text-left"
        >
          <p className="text-[14px] font-semibold text-[var(--nourish-dark)]">
            {meta.label}
          </p>
          {names ? (
            <>
              <p className="truncate text-[12px] text-[var(--nourish-subtext)]">
                {names}
              </p>
              {summary && (
                <p className="mt-0.5 whitespace-nowrap text-[11px] tabular-nums text-[var(--nourish-subtext-faint)]">
                  {summary.kcal} cal · C {summary.c}% F {summary.f}% P{" "}
                  {summary.p}%
                </p>
              )}
            </>
          ) : (
            <p className="text-[12px] text-[var(--nourish-subtext-faint)]">
              Nothing yet
            </p>
          )}
        </button>
        <button
          type="button"
          onClick={onLog}
          className="shrink-0 rounded-full bg-[var(--nourish-green)]/12 px-4 py-1.5 text-[13px] font-semibold text-[var(--nourish-green)] transition active:scale-[0.96]"
        >
          Log
        </button>
      </div>
      {expanded && entries.length > 0 && (
        <div className="space-y-1.5 border-t border-neutral-100 p-3">
          {children}
        </div>
      )}
    </div>
  );
}
