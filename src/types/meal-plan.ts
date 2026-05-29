/**
 * MealPlanWeek schema (Y3 W23).
 *
 * Per-user weekly meal plan. localStorage-backed in Y3; the
 * Postgres-backed real-mode version lights up at Y4 W3 with
 * the same Zod schema gating the wire-up.
 *
 * Twenty-one slot keys (3 meals × 7 days) plus housekeeping
 * fields. Slots are sparse — an empty week has no scheduled
 * entries; the chip surfaces appear only when slots fill.
 */

import { z } from "zod";

export const dayKeyEnum = z.enum([
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
]);
export type DayKey = z.infer<typeof dayKeyEnum>;

export const mealKeyEnum = z.enum(["breakfast", "lunch", "dinner"]);
export type MealKey = z.infer<typeof mealKeyEnum>;

export const slotKeyRegex =
  /^(mon|tue|wed|thu|fri|sat|sun)-(breakfast|lunch|dinner)$/;
export type SlotKey = `${DayKey}-${MealKey}`;

export const mealPlanSourceEnum = z.enum([
  "swipe-planned",
  "leftovers-auto",
  "manual",
  "shopping-list-write-back",
  "novelty-save",
]);
export type MealPlanSource = z.infer<typeof mealPlanSourceEnum>;

export const mealPlanSlotSchema = z.object({
  /** Slot key — e.g. "tue-lunch". */
  slot: z.string().regex(slotKeyRegex),
  /** Recipe slug occupying the slot. */
  recipeSlug: z.string().min(1).max(80),
  /** Where this slot was planned from. */
  source: mealPlanSourceEnum,
  /** ISO timestamp the slot was scheduled. */
  scheduledAt: z.string().datetime(),
});
export type MealPlanSlot = z.infer<typeof mealPlanSlotSchema>;

export const MEAL_PLAN_SCHEMA_VERSION = 1 as const;

export const mealPlanWeekSchema = z.object({
  schemaVersion: z.literal(MEAL_PLAN_SCHEMA_VERSION),
  /** ISO 8601 week key — "2026-W19". Same shape as the Y2 W36
   *  weeklyPickToken so cross-feature linking works. */
  weekKey: z.string().regex(/^\d{4}-W\d{2}$/),
  scheduled: z.array(mealPlanSlotSchema).default([]),
  /** ISO timestamp this week record was last touched — for
   *  conflict resolution when the Postgres-backed version
   *  syncs in real mode. */
  updatedAt: z.string().datetime(),
});
export type MealPlanWeek = z.infer<typeof mealPlanWeekSchema>;

/** Pure: build a slot key from day + meal. */
export function buildSlotKey(day: DayKey, meal: MealKey): SlotKey {
  return `${day}-${meal}` as SlotKey;
}

/** Pure: parse a slot key into its day + meal parts. Returns
 *  null on invalid input. */
export function parseSlotKey(
  raw: string,
): { day: DayKey; meal: MealKey } | null {
  const match = raw.match(slotKeyRegex);
  if (!match) return null;
  return {
    day: match[1] as DayKey,
    meal: match[2] as MealKey,
  };
}

/** Pure: compute the ISO 8601 week key from a date. Same logic
 *  as Y2 W36 weeklyPickToken (matches the Pod challenge week
 *  identifier). */
export function isoWeekKey(date: Date): string {
  if (!Number.isFinite(date.getTime())) return "";
  // Convert to UTC + adjust to nearest Thursday (ISO 8601 week
  // belongs to the year with the majority of days; Thursday
  // is the canonical anchor).
  const target = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayOfWeek = (target.getUTCDay() + 6) % 7; // Mon=0, Sun=6
  target.setUTCDate(target.getUTCDate() - dayOfWeek + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const diff = target.getTime() - firstThursday.getTime();
  const week = 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Pure: get the day-of-week for the next-day's slot. Used by
 *  the leftover-chip handler to plan tomorrow's lunch. Wraps
 *  around: Sunday → Monday. */
export function nextDayKey(today: DayKey): DayKey {
  const order: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const idx = order.indexOf(today);
  if (idx < 0) return "mon";
  return order[(idx + 1) % 7] ?? "mon";
}

/** Pure: derive today's DayKey from a Date. */
export function dayKeyFromDate(date: Date): DayKey {
  const order: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  if (!Number.isFinite(date.getTime())) return "mon";
  return order[date.getDay()] ?? "mon";
}
