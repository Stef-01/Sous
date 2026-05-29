"use client";

/**
 * LlmSpendCard (Y4 W3) — Anthropic-spend dashboard primitive.
 *
 * Renders the W1 aggregate + W2 hook output as a compact
 * developer-facing card. Three rows of stats up top (today /
 * window / monthly projection), per-surface breakdown,
 * 14-day spark, outcome summary.
 *
 * Pure presentational — accepts the aggregate + projection.
 * The hosting page wires `useLlmSpend()` and passes the
 * result. Lets us test the rendering with seeded fixtures.
 */

import { formatMicroUsd, type SpendAggregate } from "@/lib/telemetry/llm-spend";
import { summariseLlmSpendForDashboard } from "@/lib/telemetry/llm-spend-summary";

export interface LlmSpendCardProps {
  aggregate: SpendAggregate;
  monthlyBurnMicroUsd: number;
  /** ISO YYYY-MM-DD of "today" so the today-bucket lookup is
   *  deterministic in tests. */
  todayKey: string;
}

export function LlmSpendCard({
  aggregate,
  monthlyBurnMicroUsd,
  todayKey,
}: LlmSpendCardProps) {
  const summary = summariseLlmSpendForDashboard({
    aggregate,
    todayKey,
    monthlyBurnMicroUsd,
  });

  return (
    <div className="space-y-4">
      {/* Top stats: today / window / monthly projection. */}
      <section className="grid grid-cols-3 gap-2">
        <Stat
          label="Today"
          cost={summary.today.costMicroUsd}
          sub={`${summary.today.callCount} calls`}
        />
        <Stat
          label="Window"
          cost={summary.window.costMicroUsd}
          sub={`${summary.window.callCount} calls`}
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

      {/* Per-surface breakdown. */}
      <section className="rounded-2xl border border-[var(--nourish-border-strong)] bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
          By surface
        </p>
        {aggregate.bySurface.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--nourish-subtext)]">
            No calls in this window.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {aggregate.bySurface.map((s) => (
              <li
                key={s.surface}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-[var(--nourish-dark)]">{s.surface}</span>
                <span className="font-mono text-xs tabular-nums text-[var(--nourish-subtext)]">
                  {formatMicroUsd(s.costMicroUsd)} ·{" "}
                  {s.callCount.toLocaleString()} calls
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 14-day spark. */}
      <section className="rounded-2xl border border-[var(--nourish-border-strong)] bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
          Daily
        </p>
        <DailySpark daily={aggregate.daily} />
      </section>

      {/* Outcome counts. */}
      <section className="rounded-2xl border border-[var(--nourish-border-strong)] bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
          Outcomes
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
          <OutcomeChip label="ok" count={summary.outcomes.ok} />
          <OutcomeChip label="error" count={summary.outcomes.error} />
          <OutcomeChip label="rejected" count={summary.outcomes.rejected} />
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

function OutcomeChip({ label, count }: { label: string; count: number }) {
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

function DailySpark({ daily }: { daily: SpendAggregate["daily"] }) {
  if (daily.length === 0) {
    return (
      <p className="mt-2 text-sm text-[var(--nourish-subtext)]">
        No data in the window.
      </p>
    );
  }
  const maxCost = Math.max(1, ...daily.map((d) => d.costMicroUsd));
  return (
    <div className="mt-2 flex h-16 items-end gap-1">
      {daily.map((d) => {
        const heightPct = Math.max(2, (d.costMicroUsd / maxCost) * 100);
        return (
          <div
            key={d.dayKey}
            className="flex flex-1 flex-col items-center justify-end"
            title={`${d.dayKey}: ${formatMicroUsd(d.costMicroUsd)} (${d.callCount} calls)`}
          >
            <div
              className="w-full rounded-sm bg-[var(--nourish-green)]"
              style={{ height: `${heightPct}%` }}
              aria-hidden
            />
          </div>
        );
      })}
    </div>
  );
}
