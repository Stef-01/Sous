"use client";

import { useEffect, useState } from "react";
import { Search, X, Plus, Minus, Loader2 } from "lucide-react";
import { useNutritionDiary } from "@/lib/hooks/use-nutrition-diary";
import type { BrandedFood } from "@/lib/nutrition/branded-food";
import { toast } from "@/lib/hooks/use-toast";

/**
 * BrandedFoodSearch (W20-W21) — search Open Food Facts for a packaged food and
 * log it to the diary alongside cooked dishes. Opens a search sheet; debounced
 * server-proxied query; pick a servings count, then tap a result to log it.
 */
export function BrandedFoodSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<BrandedFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [servings, setServings] = useState(1);
  const { logBranded } = useNutritionDiary();

  /* eslint-disable react-hooks/set-state-in-effect -- debounced search: clears
     stale results + drives loading/error state when the query or sheet changes */
  useEffect(() => {
    if (!open) return;
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/branded-food/search?q=${encodeURIComponent(term)}`, {
        signal: ctrl.signal,
      })
        .then((r) => r.json())
        .then((data) => {
          setResults(data.foods ?? []);
          setError(data.error ?? null);
        })
        .catch(() => {
          if (!ctrl.signal.aborted) setError("Search is unavailable.");
        })
        .finally(() => setLoading(false));
    }, 350);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Close on Escape (keyboard accessibility for the modal sheet).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    setQ("");
    setResults([]);
    setServings(1);
  };

  const pick = (f: BrandedFood) => {
    logBranded(f, servings);
    toast.push({
      variant: "success",
      title: `Logged ${servings === 1 ? "" : `${servings}× `}${f.name}`,
      body: "Added to today's nutrition",
      dedupKey: "branded-log",
    });
    close();
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setQ("");
          setResults([]);
          setServings(1);
          setOpen(true);
        }}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--nourish-border-strong)] bg-white py-3 text-sm font-medium text-[var(--nourish-dark)] transition-colors hover:bg-neutral-50"
      >
        <Search
          size={15}
          className="text-[var(--nourish-subtext)]"
          aria-hidden
        />
        Log a packaged food
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/30">
      <button
        type="button"
        aria-label="Close"
        className="flex-1"
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search packaged foods"
        className="max-h-[80dvh] overflow-hidden rounded-t-3xl bg-[var(--nourish-cream)] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center gap-2 border-b border-[var(--nourish-border)] p-4">
          <Search
            size={18}
            className="text-[var(--nourish-subtext)]"
            aria-hidden
          />
          {}
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a packaged food…"
            className="flex-1 bg-transparent text-[15px] text-[var(--nourish-dark)] outline-none placeholder:text-[var(--nourish-subtext-faint)]"
          />
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--nourish-subtext)] hover:bg-neutral-200/60"
          >
            <X size={16} />
          </button>
        </div>

        {/* Servings stepper — applies to the next food you tap. Half-step so a
            half portion ("half a soda") is loggable. */}
        <div className="flex items-center justify-between border-b border-[var(--nourish-border)] px-4 py-2.5">
          <span className="text-[13px] font-medium text-[var(--nourish-subtext)]">
            Servings
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setServings((s) => Math.max(0.5, s - 0.5))}
              disabled={servings <= 0.5}
              aria-label="Fewer servings"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--nourish-border-strong)] bg-white text-[var(--nourish-dark)] transition-colors hover:bg-neutral-50 disabled:opacity-40"
            >
              <Minus size={15} />
            </button>
            <span className="w-8 text-center text-[15px] font-semibold tabular-nums text-[var(--nourish-dark)]">
              {servings % 1 === 0 ? servings : servings.toFixed(1)}
            </span>
            <button
              type="button"
              onClick={() => setServings((s) => Math.min(10, s + 0.5))}
              disabled={servings >= 10}
              aria-label="More servings"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--nourish-border-strong)] bg-white text-[var(--nourish-dark)] transition-colors hover:bg-neutral-50 disabled:opacity-40"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>

        <div className="max-h-[60dvh] overflow-y-auto p-2">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-[13px] text-[var(--nourish-subtext)]">
              <Loader2 size={15} className="animate-spin" aria-hidden />{" "}
              Searching…
            </div>
          )}
          {!loading && error && (
            <p className="px-3 py-6 text-center text-[13px] text-[var(--nourish-subtext)]">
              {error}
            </p>
          )}
          {!loading &&
            !error &&
            q.trim().length >= 2 &&
            results.length === 0 && (
              <p className="px-3 py-6 text-center text-[13px] text-[var(--nourish-subtext)]">
                No matches. Try a brand or product name.
              </p>
            )}
          <ul className="space-y-1">
            {results.map((f) => (
              <li key={f.barcode}>
                <button
                  type="button"
                  onClick={() => pick(f)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-[var(--nourish-dark)]">
                      {f.name}
                    </span>
                    <span className="block truncate text-[12px] text-[var(--nourish-subtext)]">
                      {f.brand ? `${f.brand} · ` : ""}
                      {Math.round(f.nutrition.calories)} kcal / {f.servingSizeG}{" "}
                      g
                    </span>
                  </span>
                  <Plus
                    size={16}
                    className="shrink-0 text-[var(--nourish-green)]"
                    aria-hidden
                  />
                </button>
              </li>
            ))}
          </ul>
          <p className="px-3 py-3 text-center text-[10.5px] text-[var(--nourish-subtext-faint)]">
            Packaged-food data from Open Food Facts · an estimate.
          </p>
        </div>
      </div>
    </div>
  );
}
