/**
 * Push delivery log + aggregator (Y4 W22).
 *
 * Pure helpers for the per-device delivery ledger the Sprint F
 * dispatcher writes one entry per attempt to. The Y4 W3-style
 * dashboard reads the rolling-window aggregate.
 *
 * Same shape as the LLM-spend (W1) + charity-ledger (W5)
 * substrates: pure aggregator + storage + hook + dashboard.
 *
 * Pure / dependency-free.
 */

import type { PushChannel } from "./key-registry";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface PushDeliveryEntry {
  id: string;
  /** Channel the dispatch was attempted via. */
  channel: PushChannel;
  /** ISO timestamp the attempt fired. */
  attemptedAt: string;
  /** "delivered" / "failed" / "skipped-quiet-hours" /
   *  "skipped-opt-out" / "rate-limited". */
  outcome:
    | "delivered"
    | "failed"
    | "skipped-quiet-hours"
    | "skipped-opt-out"
    | "rate-limited";
  /** Notification intent (mirrors W21 enum). */
  intent: string;
  /** Optional error code from the channel ("BadDeviceToken",
   *  "Unregistered", etc.). */
  errorCode?: string;
}

export interface PushDeliveryDayBucket {
  dayKey: string;
  attempts: number;
  delivered: number;
  failed: number;
  skipped: number;
}

export interface PushDeliveryAggregate {
  totalAttempts: number;
  totalDelivered: number;
  totalFailed: number;
  totalSkipped: number;
  daily: PushDeliveryDayBucket[];
  byChannel: Array<{
    channel: PushChannel;
    attempts: number;
    delivered: number;
    failed: number;
  }>;
  byIntent: Array<{ intent: string; attempts: number }>;
  byOutcome: Array<{
    outcome: PushDeliveryEntry["outcome"];
    attempts: number;
  }>;
}

export function pushDayKey(date: Date): string {
  if (!Number.isFinite(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface AggregatePushInput {
  entries: ReadonlyArray<PushDeliveryEntry>;
  now: Date;
  lookbackDays: number;
}

export function aggregatePushDeliveries(
  input: AggregatePushInput,
): PushDeliveryAggregate {
  const cutoff = input.now.getTime() - input.lookbackDays * DAY_MS;
  const eligible = input.entries.filter((e) => {
    const ts = new Date(e.attemptedAt).getTime();
    if (!Number.isFinite(ts)) return false;
    return ts >= cutoff && ts <= input.now.getTime();
  });

  // Per-day rollup pre-populated for gap-free buckets.
  const dailyMap = new Map<string, PushDeliveryDayBucket>();
  for (let i = 0; i <= input.lookbackDays; i++) {
    const day = new Date(input.now.getTime() - i * DAY_MS);
    const key = pushDayKey(day);
    dailyMap.set(key, {
      dayKey: key,
      attempts: 0,
      delivered: 0,
      failed: 0,
      skipped: 0,
    });
  }
  for (const e of eligible) {
    const key = pushDayKey(new Date(e.attemptedAt));
    const bucket = dailyMap.get(key);
    if (!bucket) continue;
    bucket.attempts += 1;
    if (e.outcome === "delivered") bucket.delivered += 1;
    else if (e.outcome === "failed") bucket.failed += 1;
    else bucket.skipped += 1;
  }
  const daily = Array.from(dailyMap.values()).sort((a, b) =>
    a.dayKey.localeCompare(b.dayKey),
  );

  // Per-channel rollup.
  const channelMap = new Map<
    PushChannel,
    { attempts: number; delivered: number; failed: number }
  >();
  for (const e of eligible) {
    const acc = channelMap.get(e.channel) ?? {
      attempts: 0,
      delivered: 0,
      failed: 0,
    };
    acc.attempts += 1;
    if (e.outcome === "delivered") acc.delivered += 1;
    if (e.outcome === "failed") acc.failed += 1;
    channelMap.set(e.channel, acc);
  }
  const byChannel = Array.from(channelMap.entries())
    .map(([channel, acc]) => ({ channel, ...acc }))
    .sort((a, b) => b.attempts - a.attempts);

  // Per-intent rollup.
  const intentMap = new Map<string, number>();
  for (const e of eligible) {
    intentMap.set(e.intent, (intentMap.get(e.intent) ?? 0) + 1);
  }
  const byIntent = Array.from(intentMap.entries())
    .map(([intent, attempts]) => ({ intent, attempts }))
    .sort((a, b) => b.attempts - a.attempts);

  // Per-outcome rollup (fixed shape).
  const outcomeMap = new Map<PushDeliveryEntry["outcome"], number>();
  for (const e of eligible) {
    outcomeMap.set(e.outcome, (outcomeMap.get(e.outcome) ?? 0) + 1);
  }
  const byOutcome = (
    [
      "delivered",
      "failed",
      "skipped-quiet-hours",
      "skipped-opt-out",
      "rate-limited",
    ] as const
  ).map((outcome) => ({
    outcome,
    attempts: outcomeMap.get(outcome) ?? 0,
  }));

  let totalAttempts = 0;
  let totalDelivered = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  for (const e of eligible) {
    totalAttempts += 1;
    if (e.outcome === "delivered") totalDelivered += 1;
    else if (e.outcome === "failed") totalFailed += 1;
    else totalSkipped += 1;
  }

  return {
    totalAttempts,
    totalDelivered,
    totalFailed,
    totalSkipped,
    daily,
    byChannel,
    byIntent,
    byOutcome,
  };
}

/** Pure: compute the delivery success rate (0..1). Returns
 *  null when zero attempts. */
export function deliverySuccessRate(
  aggregate: PushDeliveryAggregate,
): number | null {
  if (aggregate.totalAttempts === 0) return null;
  return aggregate.totalDelivered / aggregate.totalAttempts;
}
