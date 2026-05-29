/**
 * Charity-charge ledger aggregator (Y4 W5).
 *
 * Sprint B wires up the bake-sale charity-mode flow: events
 * (a real-world bake-sale or virtual fundraiser) collect Stripe
 * charges directed to a verified nonprofit, and the running
 * total surfaces in the app. This module is the pure-helper
 * layer:
 *   - CharityChargeEntry shape (one entry per Stripe charge).
 *   - aggregateCharityRaised({entries, now, lookbackDays}) →
 *     daily totals + per-event breakdown + per-nonprofit
 *     breakdown.
 *   - estimateMonthlyRaisedMicroUsd → 30-day projection.
 *
 * Pure / dependency-free / deterministic. The localStorage
 * layer + the React hook live separately. Real-mode wire-up
 * flips on when STRIPE_SECRET_KEY + verified nonprofits land.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** A single Stripe-backed charity charge. Cost in micro-USD
 *  (10^-6 USD) for sub-cent precision across many entries. */
export interface CharityChargeEntry {
  id: string;
  /** Stripe charge id ("ch_...") in real mode; synthetic in
   *  stub mode. */
  stripeChargeId: string;
  /** Slug of the bake-sale event the charge is attributed to. */
  eventSlug: string;
  /** Slug of the verified nonprofit receiving the funds. */
  nonprofitSlug: string;
  /** Amount donated in micro-USD. */
  amountMicroUsd: number;
  /** ISO timestamp the charge succeeded. */
  chargedAt: string;
  /** "succeeded" / "refunded" / "pending". */
  status: "succeeded" | "refunded" | "pending";
}

export interface CharityDayBucket {
  dayKey: string;
  chargeCount: number;
  raisedMicroUsd: number;
}

export interface CharityRaisedAggregate {
  totalCharges: number;
  totalRaisedMicroUsd: number;
  /** Per-day buckets, ascending, gap-free. */
  daily: CharityDayBucket[];
  /** Per-event rollup (sorted by raised desc). */
  byEvent: Array<{
    eventSlug: string;
    chargeCount: number;
    raisedMicroUsd: number;
  }>;
  /** Per-nonprofit rollup (sorted by raised desc). */
  byNonprofit: Array<{
    nonprofitSlug: string;
    chargeCount: number;
    raisedMicroUsd: number;
  }>;
  /** Status counts. */
  byStatus: Array<{
    status: "succeeded" | "refunded" | "pending";
    chargeCount: number;
  }>;
}

export interface CharityAggregateInput {
  entries: ReadonlyArray<CharityChargeEntry>;
  now: Date;
  lookbackDays: number;
}

/** Pure: ISO YYYY-MM-DD day key (local time). */
export function charityDayKey(date: Date): string {
  if (!Number.isFinite(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function aggregateCharityRaised(
  input: CharityAggregateInput,
): CharityRaisedAggregate {
  const cutoff = input.now.getTime() - input.lookbackDays * DAY_MS;
  // Refunded entries are included in counts but excluded from
  // the raised totals (consumer-friendly: "raised" is net).
  const eligible = input.entries.filter((e) => {
    const ts = new Date(e.chargedAt).getTime();
    if (!Number.isFinite(ts)) return false;
    return ts >= cutoff && ts <= input.now.getTime();
  });

  const dailyMap = new Map<string, CharityDayBucket>();
  for (let i = 0; i <= input.lookbackDays; i++) {
    const day = new Date(input.now.getTime() - i * DAY_MS);
    const key = charityDayKey(day);
    dailyMap.set(key, { dayKey: key, chargeCount: 0, raisedMicroUsd: 0 });
  }
  for (const e of eligible) {
    const key = charityDayKey(new Date(e.chargedAt));
    const bucket = dailyMap.get(key);
    if (!bucket) continue;
    bucket.chargeCount += 1;
    if (e.status === "succeeded") bucket.raisedMicroUsd += e.amountMicroUsd;
  }
  const daily = Array.from(dailyMap.values()).sort((a, b) =>
    a.dayKey.localeCompare(b.dayKey),
  );

  const eventMap = new Map<
    string,
    { chargeCount: number; raisedMicroUsd: number }
  >();
  for (const e of eligible) {
    const acc = eventMap.get(e.eventSlug) ?? {
      chargeCount: 0,
      raisedMicroUsd: 0,
    };
    acc.chargeCount += 1;
    if (e.status === "succeeded") acc.raisedMicroUsd += e.amountMicroUsd;
    eventMap.set(e.eventSlug, acc);
  }
  const byEvent = Array.from(eventMap.entries())
    .map(([eventSlug, acc]) => ({ eventSlug, ...acc }))
    .sort((a, b) => b.raisedMicroUsd - a.raisedMicroUsd);

  const nonprofitMap = new Map<
    string,
    { chargeCount: number; raisedMicroUsd: number }
  >();
  for (const e of eligible) {
    const acc = nonprofitMap.get(e.nonprofitSlug) ?? {
      chargeCount: 0,
      raisedMicroUsd: 0,
    };
    acc.chargeCount += 1;
    if (e.status === "succeeded") acc.raisedMicroUsd += e.amountMicroUsd;
    nonprofitMap.set(e.nonprofitSlug, acc);
  }
  const byNonprofit = Array.from(nonprofitMap.entries())
    .map(([nonprofitSlug, acc]) => ({ nonprofitSlug, ...acc }))
    .sort((a, b) => b.raisedMicroUsd - a.raisedMicroUsd);

  const statusMap = new Map<"succeeded" | "refunded" | "pending", number>();
  for (const e of eligible) {
    statusMap.set(e.status, (statusMap.get(e.status) ?? 0) + 1);
  }
  const byStatus = (["succeeded", "refunded", "pending"] as const).map(
    (status) => ({ status, chargeCount: statusMap.get(status) ?? 0 }),
  );

  let totalCharges = 0;
  let totalRaisedMicroUsd = 0;
  for (const e of eligible) {
    totalCharges += 1;
    if (e.status === "succeeded") totalRaisedMicroUsd += e.amountMicroUsd;
  }

  return {
    totalCharges,
    totalRaisedMicroUsd,
    daily,
    byEvent,
    byNonprofit,
    byStatus,
  };
}

/** Pure: 30-day projection from the last 7 days of activity.
 *  Returns 0 when fewer than 3 days have raised funds (too
 *  noisy to project). */
export function estimateMonthlyRaisedMicroUsd(opts: {
  entries: ReadonlyArray<CharityChargeEntry>;
  now: Date;
}): number {
  const recent = aggregateCharityRaised({
    entries: opts.entries,
    now: opts.now,
    lookbackDays: 7,
  });
  const daysWithRaise = recent.daily.filter((d) => d.raisedMicroUsd > 0).length;
  if (daysWithRaise < 3) return 0;
  return Math.round((recent.totalRaisedMicroUsd * 30) / 7);
}
