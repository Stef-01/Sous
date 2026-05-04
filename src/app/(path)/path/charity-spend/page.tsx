"use client";

/**
 * /path/charity-spend (Y4 W7) — bake-sale running-total.
 *
 * Sprint B internal monitoring surface. Founder pastes
 * STRIPE_SECRET_KEY + the verified-nonprofit list and watches
 * charity charges roll in.
 *
 * Auth: V1 unauthenticated (URL-only). Sprint C lands proper
 * auth once Postgres + Clerk are live.
 */

import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { CharityDashboardCard } from "@/components/charity/charity-dashboard-card";
import { charityDayKey } from "@/lib/charity/charity-ledger";
import { useCharityLedger } from "@/lib/hooks/use-charity-ledger";

export default function CharitySpendPage() {
  const { mounted, aggregate, monthlyRaisedMicroUsd, clearAll, entries } =
    useCharityLedger({ lookbackDays: 30 });
  const todayKey = charityDayKey(new Date());

  return (
    <div className="min-h-full bg-[var(--nourish-cream)] pb-24">
      <header className="app-header sticky top-0 z-10 px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Link
            href="/path"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--nourish-border-strong)] bg-white text-[var(--nourish-dark)] transition hover:bg-neutral-50"
            aria-label="Back to Path"
          >
            <ArrowLeft size={16} aria-hidden />
          </Link>
          <div className="flex-1">
            <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
              Internal · Y4 Sprint B
            </p>
            <h1 className="font-serif text-base font-semibold text-[var(--nourish-dark)]">
              Charity raised
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 pt-3">
        {!mounted ? (
          <div
            className="h-64 animate-pulse rounded-2xl border border-[var(--nourish-border-soft)] bg-white"
            aria-hidden
          />
        ) : (
          <>
            <CharityDashboardCard
              aggregate={aggregate}
              monthlyRaisedMicroUsd={monthlyRaisedMicroUsd}
              todayKey={todayKey}
            />

            {entries.length === 0 && (
              <p className="rounded-xl border border-dashed border-[var(--nourish-border-strong)] bg-white px-4 py-3 text-xs text-[var(--nourish-subtext)]">
                No charity charges recorded yet. Telemetry populates once a
                bake-sale event lands its first Stripe charge for a verified
                nonprofit.
              </p>
            )}

            {entries.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Clear all charity ledger telemetry?"))
                    clearAll();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--nourish-border-strong)] bg-white py-3 text-sm font-medium text-[var(--nourish-subtext)] hover:bg-neutral-50"
              >
                <RotateCcw size={14} aria-hidden />
                Reset telemetry
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
