"use client";

/**
 * /path/llm-spend (Y4 W3) — Anthropic-spend dashboard.
 *
 * Developer-facing surface for the founder to monitor real-mode
 * LLM spend during Y4 Sprint A wire-up. Reads the W2 hook + the
 * W1 aggregator, renders via the W3 LlmSpendCard.
 *
 * Real-mode wire-up: when Sprint A flips voice-conversation /
 * voice-to-draft / pod-agentic-pick / viral-search /
 * viral-extraction / pantry-vision into real Anthropic calls,
 * each call records via `recordLlmCall()`. This page surfaces
 * the rolling aggregate so spend stays bounded.
 *
 * Auth: V1 unauthenticated (URL-only gate). Sprint C lands a
 * proper internal-route auth check once Postgres + Clerk are
 * live. The dashboard data is local-only telemetry — nothing
 * here leaves the device until the server-sync arrives.
 */

import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { LlmSpendCard } from "@/components/telemetry/llm-spend-card";
import { useLlmSpend } from "@/lib/hooks/use-llm-spend";
import { dayKey } from "@/lib/telemetry/llm-spend";

export default function LlmSpendPage() {
  const { mounted, aggregate, monthlyBurnMicroUsd, clearAll, entries } =
    useLlmSpend({ lookbackDays: 14 });
  const todayKey = dayKey(new Date());

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
              Internal · Y4 Sprint A
            </p>
            <h1 className="font-serif text-base font-semibold text-[var(--nourish-dark)]">
              LLM spend
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
            <LlmSpendCard
              aggregate={aggregate}
              monthlyBurnMicroUsd={monthlyBurnMicroUsd}
              todayKey={todayKey}
            />

            {entries.length === 0 && (
              <p className="rounded-xl border border-dashed border-[var(--nourish-border-strong)] bg-white px-4 py-3 text-xs text-[var(--nourish-subtext)]">
                No LLM calls recorded yet. Telemetry populates once the Sprint A
                wire-up flips a substrate into real-mode (voice conversation,
                voice-to-draft, pod agentic pick, viral search + extraction,
                pantry vision).
              </p>
            )}

            {entries.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Clear all LLM spend telemetry?")) clearAll();
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
