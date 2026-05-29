/**
 * V3 trainer feedback log (Y4 W25).
 *
 * Pure helpers for the per-recommendation feedback trail the
 * V3 trainer's next retune cycle (Y4 W26 + Sprint G) consumes.
 * Each ResultStack render emits one entry per shown side; the
 * accept/reject signal feeds back into the per-dimension
 * trainer as a stronger causal signal than cook completion
 * alone.
 *
 * Same shape as the LLM-spend / charity / push aggregators:
 * pure-helper layer with rolling-window aggregator + per-key
 * rollups. Storage layer + hook + dashboard land in W26 + W27.
 *
 * Pure / dependency-free.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export type TrainerFeedbackOutcome =
  /** User cooked this side (strongest positive signal). */
  | "cooked"
  /** User added to plan but did not cook. */
  | "scheduled"
  /** User rerolled this card (negative signal). */
  | "rerolled"
  /** User dismissed the result without picking anything. */
  | "dismissed"
  /** Card was shown but no user action (timeout / nav-away). */
  | "no-action";

export interface TrainerFeedbackEntry {
  id: string;
  recipeSlug: string;
  /** ISO timestamp the entry was captured. */
  capturedAt: string;
  /** Outcome enum above. */
  outcome: TrainerFeedbackOutcome;
  /** Position in the ResultStack (0-indexed). */
  rank: number;
  /** Total score the engine assigned (0..1). */
  totalScore: number;
  /** Per-dimension score breakdown captured at pick time. */
  dimensions: {
    cuisineFit: number;
    flavorContrast: number;
    nutritionBalance: number;
    prepBurden: number;
    temperatureComplement: number;
    userPreference: number;
  };
}

export interface TrainerFeedbackDayBucket {
  dayKey: string;
  shown: number;
  cooked: number;
  scheduled: number;
  rerolled: number;
  dismissed: number;
}

export interface TrainerFeedbackAggregate {
  totalShown: number;
  totalCooked: number;
  totalScheduled: number;
  totalRerolled: number;
  totalDismissed: number;
  daily: TrainerFeedbackDayBucket[];
  byRank: Array<{
    rank: number;
    shown: number;
    cookRate: number;
  }>;
  byOutcome: Array<{
    outcome: TrainerFeedbackOutcome;
    count: number;
  }>;
  /** Per-dimension acceptance signal: mean dimension score for
   *  cooked outcomes minus mean for rerolled. The W26 retune
   *  uses this as its primary input. */
  dimensionDeltas: {
    cuisineFit: number;
    flavorContrast: number;
    nutritionBalance: number;
    prepBurden: number;
    temperatureComplement: number;
    userPreference: number;
  };
}

export function trainerDayKey(date: Date): string {
  if (!Number.isFinite(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface AggregateTrainerInput {
  entries: ReadonlyArray<TrainerFeedbackEntry>;
  now: Date;
  lookbackDays: number;
}

export function aggregateTrainerFeedback(
  input: AggregateTrainerInput,
): TrainerFeedbackAggregate {
  const cutoff = input.now.getTime() - input.lookbackDays * DAY_MS;
  const eligible = input.entries.filter((e) => {
    const ts = new Date(e.capturedAt).getTime();
    if (!Number.isFinite(ts)) return false;
    return ts >= cutoff && ts <= input.now.getTime();
  });

  // Daily rollup pre-populated for gap-free buckets.
  const dailyMap = new Map<string, TrainerFeedbackDayBucket>();
  for (let i = 0; i <= input.lookbackDays; i++) {
    const day = new Date(input.now.getTime() - i * DAY_MS);
    const key = trainerDayKey(day);
    dailyMap.set(key, {
      dayKey: key,
      shown: 0,
      cooked: 0,
      scheduled: 0,
      rerolled: 0,
      dismissed: 0,
    });
  }
  for (const e of eligible) {
    const key = trainerDayKey(new Date(e.capturedAt));
    const bucket = dailyMap.get(key);
    if (!bucket) continue;
    bucket.shown += 1;
    if (e.outcome === "cooked") bucket.cooked += 1;
    else if (e.outcome === "scheduled") bucket.scheduled += 1;
    else if (e.outcome === "rerolled") bucket.rerolled += 1;
    else if (e.outcome === "dismissed") bucket.dismissed += 1;
  }
  const daily = Array.from(dailyMap.values()).sort((a, b) =>
    a.dayKey.localeCompare(b.dayKey),
  );

  // Per-rank rollup.
  const rankMap = new Map<number, { shown: number; cooked: number }>();
  for (const e of eligible) {
    const acc = rankMap.get(e.rank) ?? { shown: 0, cooked: 0 };
    acc.shown += 1;
    if (e.outcome === "cooked") acc.cooked += 1;
    rankMap.set(e.rank, acc);
  }
  const byRank = Array.from(rankMap.entries())
    .map(([rank, acc]) => ({
      rank,
      shown: acc.shown,
      cookRate: acc.shown > 0 ? acc.cooked / acc.shown : 0,
    }))
    .sort((a, b) => a.rank - b.rank);

  // Per-outcome rollup (fixed five-bucket).
  const outcomeMap = new Map<TrainerFeedbackOutcome, number>();
  for (const e of eligible) {
    outcomeMap.set(e.outcome, (outcomeMap.get(e.outcome) ?? 0) + 1);
  }
  const byOutcome = (
    ["cooked", "scheduled", "rerolled", "dismissed", "no-action"] as const
  ).map((outcome) => ({
    outcome,
    count: outcomeMap.get(outcome) ?? 0,
  }));

  // Per-dimension deltas (cooked mean minus rerolled mean).
  const dimensionKeys = [
    "cuisineFit",
    "flavorContrast",
    "nutritionBalance",
    "prepBurden",
    "temperatureComplement",
    "userPreference",
  ] as const;
  const dimensionDeltas = {
    cuisineFit: 0,
    flavorContrast: 0,
    nutritionBalance: 0,
    prepBurden: 0,
    temperatureComplement: 0,
    userPreference: 0,
  };
  const cooked = eligible.filter((e) => e.outcome === "cooked");
  const rerolled = eligible.filter((e) => e.outcome === "rerolled");
  if (cooked.length > 0 && rerolled.length > 0) {
    for (const dim of dimensionKeys) {
      const cookedMean =
        cooked.reduce((s, e) => s + e.dimensions[dim], 0) / cooked.length;
      const rerolledMean =
        rerolled.reduce((s, e) => s + e.dimensions[dim], 0) / rerolled.length;
      dimensionDeltas[dim] = cookedMean - rerolledMean;
    }
  }

  let totalShown = 0;
  let totalCooked = 0;
  let totalScheduled = 0;
  let totalRerolled = 0;
  let totalDismissed = 0;
  for (const e of eligible) {
    totalShown += 1;
    if (e.outcome === "cooked") totalCooked += 1;
    else if (e.outcome === "scheduled") totalScheduled += 1;
    else if (e.outcome === "rerolled") totalRerolled += 1;
    else if (e.outcome === "dismissed") totalDismissed += 1;
  }

  return {
    totalShown,
    totalCooked,
    totalScheduled,
    totalRerolled,
    totalDismissed,
    daily,
    byRank,
    byOutcome,
    dimensionDeltas,
  };
}

/** Pure: cook rate (0..1) across the window. Returns null when
 *  no entries shown. */
export function trainerCookRate(
  aggregate: TrainerFeedbackAggregate,
): number | null {
  if (aggregate.totalShown === 0) return null;
  return aggregate.totalCooked / aggregate.totalShown;
}
