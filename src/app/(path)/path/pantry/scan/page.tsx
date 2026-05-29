"use client";

/**
 * /path/pantry/scan — Photo-to-pantry haul-shot flow (Y3 W13).
 *
 * Stub-mode V1: skips real camera capture + vision call. Tap
 * 'Run a demo scan' to see the flow end-to-end with a
 * deterministic fixture. The real-mode wire (Anthropic vision
 * + camera capture) lights up at Y4 W5 founder-key day.
 *
 * Three states:
 *   - capture: 'Run a demo scan' button (stub) or camera (real)
 *   - confirm: detected items as chips, per-item delete, accept-all
 *   - done:    confirmation toast + back-to-pantry affordance
 */

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, X, Check } from "lucide-react";
import { usePantry } from "@/lib/hooks/use-pantry";
import { toast } from "@/lib/hooks/use-toast";
import {
  applyConfirmationOp,
  detectPantryItemsStub,
  mergeWithExistingPantry,
  type DetectedItem,
} from "@/lib/pantry/photo-pipeline";
import { cn } from "@/lib/utils/cn";

type ScanState =
  | { phase: "capture" }
  | { phase: "confirm"; items: DetectedItem[] }
  | { phase: "done"; addedCount: number };

export default function PantryScanPage() {
  const { items: existingPantry, add } = usePantry();
  const [state, setState] = useState<ScanState>({ phase: "capture" });

  const runDemoScan = () => {
    // Random byte-length proxy so consecutive demos vary the
    // fixture subset.
    const fakeBytes = 1000 + Math.floor(Math.random() * 5000);
    const result = detectPantryItemsStub(fakeBytes);
    setState({ phase: "confirm", items: result.detected });
  };

  const onReject = (itemName: string) => {
    if (state.phase !== "confirm") return;
    setState({
      phase: "confirm",
      items: applyConfirmationOp(state.items, {
        kind: "reject",
        itemName,
      }),
    });
  };

  const onAcceptAll = () => {
    if (state.phase !== "confirm") return;
    const { addedNames } = mergeWithExistingPantry(state.items, existingPantry);
    for (const name of addedNames) add(name);
    if (addedNames.length > 0) {
      toast.push({
        variant: "success",
        title: `Added ${addedNames.length} item${addedNames.length === 1 ? "" : "s"} to pantry`,
        body: addedNames.slice(0, 3).join(", "),
        dedupKey: "pantry-scan-add",
      });
    }
    setState({ phase: "done", addedCount: addedNames.length });
  };

  return (
    <div className="min-h-full bg-[var(--nourish-cream)] pb-24">
      <header className="app-header sticky top-0 z-10 px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Link
            href="/path/pantry"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--nourish-border-strong)] bg-white text-[var(--nourish-dark)] transition hover:bg-neutral-50"
            aria-label="Back to pantry"
          >
            <ArrowLeft size={16} aria-hidden />
          </Link>
          <h1 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
            Scan to add
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 pt-3">
        {state.phase === "capture" && (
          <section className="rounded-2xl border border-[var(--nourish-border-strong)] bg-white p-6 shadow-sm">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
              Photo to pantry
            </p>
            <h2 className="mb-2 font-serif text-xl text-[var(--nourish-dark)]">
              Take a photo of your haul
            </h2>
            <p className="mb-5 text-sm leading-relaxed text-[var(--nourish-subtext)]">
              One picture of the counter, fridge, or pantry — we&apos;ll list
              what we find and you confirm in one tap.
            </p>

            <button
              type="button"
              disabled
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--nourish-border-strong)] bg-[var(--nourish-input-bg)] py-3 text-sm font-medium text-[var(--nourish-subtext)]"
            >
              <Camera size={16} aria-hidden />
              Camera (lights up at real-mode launch)
            </button>

            <button
              type="button"
              onClick={runDemoScan}
              className="w-full rounded-xl bg-[var(--nourish-green)] py-3 text-sm font-semibold text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-[var(--nourish-dark-green)]"
            >
              Run a demo scan
            </button>
          </section>
        )}

        {state.phase === "confirm" && (
          <section className="space-y-3">
            <div className="rounded-2xl border border-[var(--nourish-border-soft)] bg-white p-4">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
                Found {state.items.length} item
                {state.items.length === 1 ? "" : "s"}
              </p>
              <p className="text-sm text-[var(--nourish-dark)]">
                Tap to remove anything we got wrong, then accept all to add to
                pantry.
              </p>
            </div>

            <ul className="flex flex-wrap gap-2">
              {state.items.map((item) => (
                <li key={item.name}>
                  <button
                    type="button"
                    onClick={() => onReject(item.name)}
                    aria-label={`Remove ${item.name}`}
                    className={cn(
                      "group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
                      "border border-[var(--nourish-border-strong)] bg-white text-[var(--nourish-dark)] hover:border-[var(--nourish-evaluate)]/50 hover:bg-[var(--nourish-evaluate)]/5",
                    )}
                  >
                    <span className="capitalize">{item.name}</span>
                    <X
                      size={12}
                      aria-hidden
                      className="text-[var(--nourish-subtext)] group-hover:text-[var(--nourish-evaluate)]"
                    />
                  </button>
                </li>
              ))}
            </ul>

            {state.items.length > 0 ? (
              <button
                type="button"
                onClick={onAcceptAll}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--nourish-green)] py-3 text-sm font-semibold text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-[var(--nourish-dark-green)]"
              >
                <Check size={14} aria-hidden />
                Accept all + add to pantry
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setState({ phase: "capture" })}
                className="w-full rounded-xl border border-[var(--nourish-border-strong)] bg-white py-3 text-sm font-medium text-[var(--nourish-subtext)] hover:bg-neutral-50"
              >
                Try another scan
              </button>
            )}
          </section>
        )}

        {state.phase === "done" && (
          <section className="rounded-2xl border border-[var(--nourish-green)]/25 bg-[var(--nourish-green)]/5 p-6 text-center">
            <span className="text-3xl" aria-hidden>
              ✅
            </span>
            <p className="mt-3 font-serif text-lg text-[var(--nourish-dark)]">
              {state.addedCount > 0
                ? `Added ${state.addedCount} new item${state.addedCount === 1 ? "" : "s"}`
                : "Already in your pantry"}
            </p>
            <p className="mt-1 text-xs text-[var(--nourish-subtext)]">
              Pantry coverage will start showing on every recipe.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                href="/path/pantry"
                className="rounded-xl bg-[var(--nourish-green)] py-3 text-sm font-semibold text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-[var(--nourish-dark-green)]"
              >
                Back to pantry
              </Link>
              <button
                type="button"
                onClick={() => setState({ phase: "capture" })}
                className="rounded-xl border border-[var(--nourish-border-strong)] bg-white py-3 text-sm font-medium text-[var(--nourish-subtext)] hover:bg-neutral-50"
              >
                Scan again
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
