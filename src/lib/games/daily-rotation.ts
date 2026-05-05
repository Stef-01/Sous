/**
 * Daily-rotation resolver for Cuisine Compass.
 *
 * Deterministic mapping from a UTC calendar day → puzzle index.
 * The same day produces the same puzzle for every user globally.
 *
 * Anchor date: 2026-05-04 = Day 1 (the launch day). Days advance
 * at UTC midnight. The dish set is rotated modulo dataset size so
 * a 50-dish initial set repeats every 50 days; growing the set
 * extends the unique-rotation window.
 *
 * Pure / dependency-free / deterministic.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
/** UTC anchor: 2026-05-04T00:00:00Z = Day 1. */
const ANCHOR_UTC_MS = Date.UTC(2026, 4, 4);

export interface DailyRotationInput {
  /** Reference "now" — caller passes in for testability. */
  now: Date;
  /** Total number of dishes available in the dataset. */
  datasetSize: number;
}

export interface DailyPuzzleSlot {
  /** 1-based day number (Day 1 = anchor). */
  dayNumber: number;
  /** 0-based dataset index for the puzzle of the day. */
  dishIndex: number;
  /** ISO date string for the day (YYYY-MM-DD, UTC). */
  isoDate: string;
}

/** Pure: resolve which puzzle slot is active "now". */
export function resolveDailyPuzzle(input: DailyRotationInput): DailyPuzzleSlot {
  const ms = input.now.getTime();
  if (!Number.isFinite(ms)) {
    return { dayNumber: 1, dishIndex: 0, isoDate: isoFromMs(ANCHOR_UTC_MS) };
  }
  const todayUtcMs = utcMidnightOf(ms);
  const dayDelta = Math.floor((todayUtcMs - ANCHOR_UTC_MS) / DAY_MS);
  const dayNumber = Math.max(1, dayDelta + 1);
  const datasetSize = Math.max(1, Math.floor(input.datasetSize));
  const dishIndex =
    (((dayNumber - 1) % datasetSize) + datasetSize) % datasetSize;
  return {
    dayNumber,
    dishIndex,
    isoDate: isoFromMs(todayUtcMs),
  };
}

/** Pure: ISO YYYY-MM-DD from a UTC ms timestamp. */
function isoFromMs(ms: number): string {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Pure: floor a UTC timestamp to the start of its UTC day. */
function utcMidnightOf(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Pure: ms remaining until the next UTC midnight (puzzle reset). */
export function msUntilNextPuzzle(now: Date): number {
  const ms = now.getTime();
  if (!Number.isFinite(ms)) return 0;
  const tomorrow = utcMidnightOf(ms) + DAY_MS;
  return Math.max(0, tomorrow - ms);
}
