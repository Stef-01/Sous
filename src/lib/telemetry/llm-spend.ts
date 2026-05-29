/**
 * LLM-spend telemetry aggregator (Y4 W1).
 *
 * The Y4 Sprint A wire-up flips five Y2-Y3 substrates from
 * stub mode into real mode (voice conversation, voice-to-
 * draft, pod agentic pick, viral search + extraction, pantry
 * vision). Each call costs Anthropic credits + needs surfacing
 * in a cost-monitoring dashboard so spend stays bounded.
 *
 * This module is the pure-helper layer:
 *   - LlmCallEntry shape (caller logs one entry per real-mode
 *     call). Covers Anthropic + future provider calls.
 *   - aggregateSpend({entries, now, lookbackDays}) → daily
 *     totals + per-surface breakdown.
 *   - estimateMonthlyBurn({entries, now}) → projection from
 *     last 7 days.
 *
 * Pure / dependency-free / deterministic. The localStorage
 * write/read layer + the React hook live separately.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Surfaces the LLM telemetry knows about. Add to this union
 *  when new real-mode wire-ups land in Y4 Sprint A. */
export type LlmSurface =
  | "voice-conversation"
  | "voice-to-draft"
  | "pod-agentic-pick"
  | "viral-search"
  | "viral-extraction"
  | "pantry-vision";

export interface LlmCallEntry {
  id: string;
  surface: LlmSurface;
  /** ISO timestamp the call fired. */
  calledAt: string;
  /** Tokens billed (prompt + completion combined). */
  tokensBilled: number;
  /** Cost in micro-dollars (10^-6 USD) for accurate sub-cent
   *  arithmetic. Avoid floating-point drift across many
   *  small entries. */
  costMicroUsd: number;
  /** "ok" / "error" / "rejected-by-validator". */
  outcome: "ok" | "error" | "rejected";
}

export interface SpendBucket {
  /** ISO date (YYYY-MM-DD) — local-day-key. */
  dayKey: string;
  callCount: number;
  tokensBilled: number;
  costMicroUsd: number;
}

export interface SpendAggregate {
  /** Overall total in the lookback window. */
  totalCalls: number;
  totalTokens: number;
  totalCostMicroUsd: number;
  /** Per-day buckets. Sorted ascending. Empty days are
   *  represented (zeroed) so the chart layer doesn't gap. */
  daily: SpendBucket[];
  /** Per-surface breakdown across the window. */
  bySurface: Array<{
    surface: LlmSurface;
    callCount: number;
    tokensBilled: number;
    costMicroUsd: number;
  }>;
  /** Outcome breakdown. */
  byOutcome: Array<{
    outcome: "ok" | "error" | "rejected";
    callCount: number;
  }>;
}

export interface AggregateInput {
  entries: ReadonlyArray<LlmCallEntry>;
  now: Date;
  lookbackDays: number;
}

/** Pure: ISO YYYY-MM-DD day key from a Date. Local-time
 *  oriented (matches the existing dayKey in pod-score.ts). */
export function dayKey(date: Date): string {
  if (!Number.isFinite(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Pure: walk the lookback window and aggregate entries. */
export function aggregateSpend(input: AggregateInput): SpendAggregate {
  const cutoff = input.now.getTime() - input.lookbackDays * DAY_MS;
  const eligible = input.entries.filter((e) => {
    const ts = new Date(e.calledAt).getTime();
    if (!Number.isFinite(ts)) return false;
    return ts >= cutoff && ts <= input.now.getTime();
  });

  // Per-day rollup.
  const dailyMap = new Map<string, SpendBucket>();
  // Pre-populate every day in the window so the chart has
  // gap-free buckets.
  for (let i = 0; i <= input.lookbackDays; i++) {
    const day = new Date(input.now.getTime() - i * DAY_MS);
    const key = dayKey(day);
    dailyMap.set(key, {
      dayKey: key,
      callCount: 0,
      tokensBilled: 0,
      costMicroUsd: 0,
    });
  }
  for (const e of eligible) {
    const key = dayKey(new Date(e.calledAt));
    const bucket = dailyMap.get(key);
    if (!bucket) continue;
    bucket.callCount += 1;
    bucket.tokensBilled += e.tokensBilled;
    bucket.costMicroUsd += e.costMicroUsd;
  }
  const daily = Array.from(dailyMap.values()).sort((a, b) =>
    a.dayKey.localeCompare(b.dayKey),
  );

  // Per-surface rollup.
  const surfaceMap = new Map<
    LlmSurface,
    { callCount: number; tokensBilled: number; costMicroUsd: number }
  >();
  for (const e of eligible) {
    const acc = surfaceMap.get(e.surface) ?? {
      callCount: 0,
      tokensBilled: 0,
      costMicroUsd: 0,
    };
    acc.callCount += 1;
    acc.tokensBilled += e.tokensBilled;
    acc.costMicroUsd += e.costMicroUsd;
    surfaceMap.set(e.surface, acc);
  }
  const bySurface = Array.from(surfaceMap.entries())
    .map(([surface, acc]) => ({ surface, ...acc }))
    .sort((a, b) => b.costMicroUsd - a.costMicroUsd);

  // Per-outcome rollup.
  const outcomeMap = new Map<"ok" | "error" | "rejected", number>();
  for (const e of eligible) {
    outcomeMap.set(e.outcome, (outcomeMap.get(e.outcome) ?? 0) + 1);
  }
  const byOutcome = (["ok", "error", "rejected"] as const).map((outcome) => ({
    outcome,
    callCount: outcomeMap.get(outcome) ?? 0,
  }));

  let totalCalls = 0;
  let totalTokens = 0;
  let totalCostMicroUsd = 0;
  for (const e of eligible) {
    totalCalls += 1;
    totalTokens += e.tokensBilled;
    totalCostMicroUsd += e.costMicroUsd;
  }

  return {
    totalCalls,
    totalTokens,
    totalCostMicroUsd,
    daily,
    bySurface,
    byOutcome,
  };
}

/** Pure: project monthly burn from the last 7 days. Useful
 *  for the alarm threshold "$X projected this month vs $Y
 *  budget". Returns 0 when fewer than 3 days have data
 *  (too noisy to project). */
export function estimateMonthlyBurn(opts: {
  entries: ReadonlyArray<LlmCallEntry>;
  now: Date;
}): number {
  const recent = aggregateSpend({
    entries: opts.entries,
    now: opts.now,
    lookbackDays: 7,
  });
  const daysWithData = recent.daily.filter((d) => d.callCount > 0).length;
  if (daysWithData < 3) return 0;
  // 30/7 multiplier on the 7-day total.
  return Math.round((recent.totalCostMicroUsd * 30) / 7);
}

/** Pure: convert micro-dollars to a display-friendly USD
 *  string. 4_500_000 → "$4.50"; 12_000 → "$0.012". */
export function formatMicroUsd(microUsd: number): string {
  if (!Number.isFinite(microUsd)) return "$0";
  const usd = microUsd / 1_000_000;
  if (usd === 0) return "$0";
  if (Math.abs(usd) < 0.01) return `$${usd.toFixed(4)}`;
  if (Math.abs(usd) < 1) return `$${usd.toFixed(3)}`;
  return `$${usd.toFixed(2)}`;
}
