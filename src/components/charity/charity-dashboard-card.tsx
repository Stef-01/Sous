"use client";

/**
 * CharityDashboardCard (Y4 W7).
 *
 * Renders the charity-raised aggregate (W5) + monthly
 * projection (W5) + summary helper (W7) as a developer-facing
 * card. Mirrors the Y4 W3 LlmSpendCard layout: top stats, daily
 * spark, status breakdown.
 */

import { type CharityRaisedAggregate } from "@/lib/charity/charity-ledger";
import { summariseCharityForDashboard } from "@/lib/charity/charity-summary";
import { formatMicroUsd } from "@/lib/telemetry/llm-spend";

export interface CharityDashboardCardProps {
  aggregate: CharityRaisedAggregate;
  monthlyRaisedMicroUsd: number;
  todayKey: string;
}

export function CharityDashboardCard({
  aggregate,
  monthlyRaisedMicroUsd,
  todayKey,
}: CharityDashboardCardProps) {
  const summary = summariseCharityForDashboard({
    aggregate,
    todayKey,
    monthlyRaisedMicroUsd,
  });

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-3 gap-2">
        <Stat
          label="Today"
          cost={summary.today.raisedMicroUsd}
          sub={`${summary.today.chargeCount} charges`}
        />
        <Stat
          label="Window"
          cost={summary.window.raisedMicroUsd}
          sub={`${summary.window.chargeCount} charges`}
        />
        <Stat
          label="Monthly est."
          cost={summary.monthlyMicroUsd}
          sub={
            summary.monthlyMicroUsd > 0
              ? "30-day project"
              : "Need 3+ days of data"
          }
        />
      </section>

      <section className="rounded-2xl border border-[var(--nourish-border-strong)] bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
          Reach
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="font-mono text-lg font-semibold tabular-nums text-[var(--nourish-dark)]">
              {summary.eventCount}
            </p>
            <p className="text-[10px] text-[var(--nourish-subtext)]">events</p>
          </div>
          <div>
            <p className="font-mono text-lg font-semibold tabular-nums text-[var(--nourish-dark)]">
              {summary.nonprofitCount}
            </p>
            <p className="text-[10px] text-[var(--nourish-subtext)]">
              nonprofits
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--nourish-border-strong)] bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
          Status
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
          <StatusChip label="succeeded" count={summary.statuses.succeeded} />
          <StatusChip label="refunded" count={summary.statuses.refunded} />
          <StatusChip label="pending" count={summary.statuses.pending} />
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  cost,
  sub,
}: {
  label: string;
  cost: number;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--nourish-border-strong)] bg-white px-3 py-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-[var(--nourish-dark)]">
        {formatMicroUsd(cost)}
      </p>
      <p className="text-[10px] text-[var(--nourish-subtext)]">{sub}</p>
    </div>
  );
}

function StatusChip({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-xl border border-[var(--nourish-border-soft)] bg-[var(--nourish-cream)] px-2 py-1.5 text-center">
      <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-sm tabular-nums">
        {count.toLocaleString()}
      </p>
    </div>
  );
}
