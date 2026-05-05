/**
 * Signal aggregator (Y5 C foundation).
 *
 * Pure: takes a list of PreferenceSignals + a "now" reference and
 * computes per-tag time-decayed weights. Output feeds the
 * PreferenceProfile.inferredTags + timeOfDayPatterns.
 *
 * Decay: each signal's contribution is multiplied by
 *   exp(-age_days / 60)
 * so signals older than ~120 days have <13% influence and signals
 * older than ~180 days have <5%. Per-tag weight is the
 * decayed-sum / decayed-volume → keeps the output in [-1, 1] even
 * when signal volume varies wildly between users.
 *
 * Signal weights:
 *   cooked              +1.5  (very strong positive)
 *   swipe-right         +1.0
 *   saved               +0.8
 *   search-result-tapped +0.6
 *   search-issued       +0.4
 *   skipped             -0.2  (mild negative)
 *   rerolled            -0.3
 *   swipe-left          -0.6
 *
 * Pure / dependency-free / deterministic.
 */

import type {
  InferredTags,
  PreferenceSignal,
  SignalKind,
  TagWeightMap,
  TimeOfDay,
  TimeOfDayPattern,
} from "@/types/preference-profile";

const DAY_MS = 24 * 60 * 60 * 1000;
const DECAY_HALF_LIFE_DAYS = 60;

const SIGNAL_WEIGHTS: Record<SignalKind, number> = {
  cooked: 1.5,
  "swipe-right": 1.0,
  saved: 0.8,
  "search-result-tapped": 0.6,
  "search-issued": 0.4,
  skipped: -0.2,
  rerolled: -0.3,
  "swipe-left": -0.6,
};

/** Pure: time-decay multiplier for a signal of `ageDays`. Uses
 *  exponential decay with a 60-day half-life. */
export function decayMultiplier(ageDays: number): number {
  if (!Number.isFinite(ageDays) || ageDays < 0) return 1;
  return Math.pow(0.5, ageDays / DECAY_HALF_LIFE_DAYS);
}

interface PerTagAccumulator {
  /** Sum of (signal-weight × decay) across signals on this tag. */
  weightedSum: number;
  /** Raw signal count (NOT decayed) — divisor for normalisation
   *  so age decay shapes the output instead of cancelling out. */
  signalCount: number;
}

function emptyTagAcc(): PerTagAccumulator {
  return { weightedSum: 0, signalCount: 0 };
}

function applyToMap(
  map: Map<string, PerTagAccumulator>,
  tag: string,
  weighted: number,
): void {
  if (!tag) return;
  const lc = tag.toLowerCase().trim();
  if (!lc) return;
  const acc = map.get(lc) ?? emptyTagAcc();
  acc.weightedSum += weighted;
  acc.signalCount += 1;
  map.set(lc, acc);
}

function finalize(map: Map<string, PerTagAccumulator>): TagWeightMap {
  const out: TagWeightMap = {};
  for (const [tag, acc] of map) {
    if (acc.signalCount <= 0) continue;
    // Per-tag weight = decayed weighted sum / raw signal count.
    // Older signals contribute LESS (decay shrinks the numerator)
    // while still counting in the denominator — so a single old
    // cook produces a smaller weight than a single recent cook.
    const raw = acc.weightedSum / acc.signalCount;
    out[tag] = Math.max(-1, Math.min(1, raw));
  }
  return out;
}

export interface AggregateInput {
  signals: ReadonlyArray<PreferenceSignal>;
  /** Reference "now" for decay calculation. */
  now: Date;
}

export interface AggregatedTags {
  inferred: InferredTags;
  timeOfDayPatterns: Record<TimeOfDay, TimeOfDayPattern>;
  /** Number of signals that contributed (post-filter — invalid
   *  timestamps + zero-decay signals are excluded). */
  contributingSignalCount: number;
}

/** Pure: aggregate a list of signals into per-tag weights +
 *  time-of-day patterns. Returns AggregatedTags ready to drop
 *  into a PreferenceProfile. */
export function aggregateSignals(input: AggregateInput): AggregatedTags {
  const cuisines = new Map<string, PerTagAccumulator>();
  const flavors = new Map<string, PerTagAccumulator>();
  const proteins = new Map<string, PerTagAccumulator>();
  const dishClasses = new Map<string, PerTagAccumulator>();

  // Per-bucket: per-tag accumulator + signal count (for confidence).
  const byBucket: Record<
    TimeOfDay,
    { tags: Map<string, PerTagAccumulator>; count: number }
  > = {
    morning: { tags: new Map(), count: 0 },
    lunch: { tags: new Map(), count: 0 },
    afternoon: { tags: new Map(), count: 0 },
    dinner: { tags: new Map(), count: 0 },
    "late-night": { tags: new Map(), count: 0 },
  };

  let contributingSignalCount = 0;

  for (const signal of input.signals) {
    const ts = new Date(signal.capturedAt).getTime();
    if (!Number.isFinite(ts)) continue;
    const ageDays = Math.max(0, (input.now.getTime() - ts) / DAY_MS);
    const decay = decayMultiplier(ageDays);
    if (decay <= 0) continue;
    const weight = SIGNAL_WEIGHTS[signal.kind] ?? 0;
    if (weight === 0) continue;
    contributingSignalCount += 1;
    const weighted = weight * decay;

    // Per-axis accumulators
    applyToMap(cuisines, signal.facets.cuisine, weighted);
    for (const f of signal.facets.flavors) applyToMap(flavors, f, weighted);
    for (const p of signal.facets.proteins) applyToMap(proteins, p, weighted);
    applyToMap(dishClasses, signal.facets.dishClass, weighted);

    // Per-bucket accumulator (mixes all axes — bucket level cares
    // about "which tags dominate this slot of day", not which axis).
    const bucket = byBucket[signal.timeOfDay];
    if (bucket) {
      bucket.count += 1;
      applyToMap(bucket.tags, signal.facets.cuisine, weighted);
      for (const f of signal.facets.flavors)
        applyToMap(bucket.tags, f, weighted);
      applyToMap(bucket.tags, signal.facets.dishClass, weighted);
    }
  }

  const inferred: InferredTags = {
    cuisines: finalize(cuisines),
    flavors: finalize(flavors),
    proteins: finalize(proteins),
    dishClasses: finalize(dishClasses),
  };

  const timeOfDayPatterns: Record<TimeOfDay, TimeOfDayPattern> = {
    morning: bucketToPattern(byBucket.morning),
    lunch: bucketToPattern(byBucket.lunch),
    afternoon: bucketToPattern(byBucket.afternoon),
    dinner: bucketToPattern(byBucket.dinner),
    "late-night": bucketToPattern(byBucket["late-night"]),
  };

  return { inferred, timeOfDayPatterns, contributingSignalCount };
}

const BUCKET_CONFIDENCE_FLOOR = 5; // need ≥5 signals before showing
const BUCKET_CONFIDENCE_FULL = 25; // ≥25 signals = full confidence

function bucketToPattern(input: {
  tags: Map<string, PerTagAccumulator>;
  count: number;
}): TimeOfDayPattern {
  if (input.count < BUCKET_CONFIDENCE_FLOOR) {
    return { topTags: [], confidence: 0 };
  }
  // Pick top 4 tags by net positive weight.
  const ranked: Array<[string, number]> = [];
  for (const [tag, acc] of input.tags) {
    if (acc.signalCount <= 0) continue;
    const w = acc.weightedSum / acc.signalCount;
    if (w <= 0) continue; // only positive tags surface
    ranked.push([tag, w]);
  }
  ranked.sort((a, b) => b[1] - a[1]);
  const topTags = ranked.slice(0, 4).map(([tag]) => tag);
  const confidence = Math.min(
    1,
    (input.count - BUCKET_CONFIDENCE_FLOOR + 1) /
      (BUCKET_CONFIDENCE_FULL - BUCKET_CONFIDENCE_FLOOR + 1),
  );
  return { topTags, confidence };
}
