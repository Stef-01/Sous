/**
 * gold-economy — pure earn-rate table for Doge gold (the toy currency).
 *
 * THE WALL (docs/DOGE-INTEGRATION-PLAN.md §3.1): this module — and gold-ledger —
 * import NOTHING from the nutrition / XP / diary / session stores. Gold is a
 * one-way, write-only sink: Sous events compute gold and post it to the game; it
 * never flows back, and the pet's MOOD stays a pure function of the diary,
 * independent of gold. All inputs here are plain numbers passed by the caller.
 *
 * Tuning goal: a daily habit out-earns a one-day binge. A normal day (1 check-in
 * + 1 cook) ≈ 35 gold; a power day caps at MAX_GOLD_PER_DAY.
 */

export const MAX_GOLD_PER_DAY = 110;

const COOK_BASE = 25;
const COOK_OVERFLOW = 5; // 4th+ cook in a day
const PLATE_PER_EXTRA_DISH = 5;
const PLATE_BONUS_MAX = 15;
const STREAK_7_BONUS = 10;
const STREAK_14_BONUS = 20;
const CHECKIN = 10;
const LOG = 3;
const MAX_MANUAL_LOGS_PAID = 4;

/**
 * Gold for completing a real cook. The first 3 cooks/day pay full (base + plate +
 * streak bonuses); the 4th+ pays a flat token so binging doesn't out-earn a
 * steady daily habit.
 */
export function goldForCook(args: {
  dishCount: number;
  streak: number;
  cooksAlreadyPaidToday: number;
}): number {
  const { dishCount, streak, cooksAlreadyPaidToday } = args;
  if (cooksAlreadyPaidToday >= 3) return COOK_OVERFLOW;

  let gold = COOK_BASE;
  const extraDishes = Math.max(0, Math.floor(dishCount) - 1);
  gold += Math.min(extraDishes * PLATE_PER_EXTRA_DISH, PLATE_BONUS_MAX);
  if (streak >= 14) gold += STREAK_14_BONUS;
  else if (streak >= 7) gold += STREAK_7_BONUS;
  return gold;
}

/** Gold for the first app-open of the day (engagement). */
export function goldForCheckin(): number {
  return CHECKIN;
}

/** Gold for a manual meal log — capped per day; auto cook-logs pay 0 (caller gates). */
export function goldForLog(manualLogsToday: number): number {
  return manualLogsToday >= MAX_MANUAL_LOGS_PAID ? 0 : LOG;
}

/** Clamp a proposed credit so the day total never exceeds MAX_GOLD_PER_DAY. */
export function clampToDailyCap(
  proposed: number,
  alreadyToday: number,
): number {
  return Math.max(
    0,
    Math.min(Math.floor(proposed), MAX_GOLD_PER_DAY - alreadyToday),
  );
}
