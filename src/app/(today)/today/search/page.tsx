"use client";

/**
 * /today/search — Agentic recipe search results (Y3 W4).
 *
 * Recon-backfill #3: patterns #2 (eyebrow caps) + #9 (filter
 * chip row). Wires the Y2 W39 search adapter on the surface.
 * Stub mode returns a deterministic 5-result fixture; real
 * mode (post-Y4 founder unlock of TAVILY_API_KEY) returns
 * live search results without surface change.
 *
 * Filter chip row: cuisine · cook-time · dietary. Multi-
 * select within each axis; OR within axis, AND across axes.
 * The same shape used by the existing /community/forum surface,
 * adapted for search.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import {
  searchRecipeWeb,
  type SearchResult,
} from "@/lib/agentic/search-adapter";
import { cn } from "@/lib/utils/cn";
import { AgentSearchFallback } from "@/components/agentic/agent-search-fallback";

type FilterAxis = "cuisine" | "time" | "dietary";

interface FilterOption {
  axis: FilterAxis;
  value: string;
  label: string;
}

const FILTER_OPTIONS: ReadonlyArray<FilterOption> = [
  { axis: "cuisine", value: "italian", label: "Italian" },
  { axis: "cuisine", value: "indian", label: "Indian" },
  { axis: "cuisine", value: "japanese", label: "Japanese" },
  { axis: "cuisine", value: "thai", label: "Thai" },
  { axis: "time", value: "quick", label: "Under 30 min" },
  { axis: "time", value: "weekend", label: "Weekend project" },
  { axis: "dietary", value: "vegetarian", label: "Vegetarian" },
  { axis: "dietary", value: "vegan", label: "Vegan" },
  { axis: "dietary", value: "gluten-free", label: "Gluten-free" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  // Debounced search — runs 300ms after the last keystroke.
  /* eslint-disable react-hooks/set-state-in-effect -- legitimate: debounced async fetch + flag set */
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      const out = await searchRecipeWeb(query);
      setResults(out);
      setLoading(false);
    }, 300);
    return () => {
      clearTimeout(handle);
      setLoading(false);
    };
  }, [query]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const filteredResults = useMemo(() => {
    // V1: stub fixture doesn't tag results, so chip toggles
    // surface the UX without changing the result set. Real
    // tagging + filtering wires up at Y4 founder-key day. The
    // `activeFilters` state is still consumed by the chip-row
    // pressed states; the filter pass is intentionally a no-op.
    void activeFilters;
    return results;
  }, [results, activeFilters]);

  const toggleFilter = (key: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="min-h-full bg-[var(--nourish-cream)] pb-24">
      <header className="app-header sticky top-0 z-10 px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Link
            href="/today"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--nourish-border-strong)] bg-white text-[var(--nourish-dark)] transition hover:bg-neutral-50"
            aria-label="Back to Today"
          >
            <ArrowLeft size={16} aria-hidden />
          </Link>
          <h1 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
            Search
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 pt-3">
        {/* Search input */}
        <label className="relative flex items-center gap-2 rounded-xl border border-[var(--nourish-border-strong)] bg-white px-3 py-2.5 shadow-sm focus-within:border-[var(--nourish-green)] focus-within:ring-2 focus-within:ring-[var(--nourish-green)]/30">
          <Search
            size={16}
            aria-hidden
            className="text-[var(--nourish-subtext)]"
          />
          <input
            type="search"
            inputMode="search"
            placeholder="Try 'viral pasta', 'Kim K smoothie'…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[var(--nourish-dark)] outline-none placeholder:text-[var(--nourish-subtext)]"
            aria-label="Search recipes"
          />
        </label>

        {/* Filter chip row — pattern #9 */}
        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex gap-2 whitespace-nowrap">
            {FILTER_OPTIONS.map((opt) => {
              const key = `${opt.axis}:${opt.value}`;
              const active = activeFilters.has(key);
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => toggleFilter(key)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
                      active
                        ? "border-[var(--nourish-green)] bg-[var(--nourish-green)] text-white"
                        : "border-[var(--nourish-border-strong)] bg-white text-[var(--nourish-subtext)] hover:bg-neutral-50",
                    )}
                  >
                    {opt.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Results / states */}
        {query.trim().length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--nourish-border-strong)] bg-white/40 px-4 py-8 text-center text-xs text-[var(--nourish-subtext)]">
            Type to search across recipe blogs, social trends, and chef
            archives.
          </p>
        ) : loading ? (
          <ul className="space-y-3">
            {[0, 1, 2].map((i) => (
              <li
                key={i}
                className="h-24 animate-pulse rounded-2xl border border-[var(--nourish-border-soft)] bg-white"
                aria-hidden
              />
            ))}
          </ul>
        ) : filteredResults.length === 0 ? (
          <div className="space-y-3">
            <p className="rounded-xl border border-dashed border-[var(--nourish-border-strong)] bg-white/40 px-4 py-6 text-center text-xs text-[var(--nourish-subtext)]">
              No matches yet. Try a broader query.
            </p>
            {/* Y5 E agentic fallback — opt-in CTA that asks the
                autogen agent for a candidate draft. Stub-mode V1
                returns a deterministic fixture so the UX works
                end-to-end without a key. */}
            <AgentSearchFallback query={query} />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Verified shelf eyebrow — pairs with the Unverified
                agent fallback above to make the taxonomy explicit
                when both are visible (audit P0 #14). */}
            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--nourish-green)]">
              Verified · catalog
            </p>
            <ul className="space-y-3">
              {filteredResults.map((result, idx) => (
                <SearchResultCard key={result.url} result={result} idx={idx} />
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

function SearchResultCard({
  result,
  idx,
}: {
  result: SearchResult;
  idx: number;
}) {
  return (
    <li
      className="rounded-2xl border border-[var(--nourish-border-soft)] bg-white p-4 shadow-sm"
      style={{ animationDelay: `${idx * 40}ms` }}
    >
      {/* Eyebrow caps — pattern #2 */}
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
        {result.sourceDomain}
      </p>
      <h2 className="font-serif text-base font-semibold leading-snug text-[var(--nourish-dark)]">
        {result.title}
      </h2>
      {result.snippet && (
        <p className="mt-1 line-clamp-2 text-xs text-[var(--nourish-subtext)]">
          {result.snippet}
        </p>
      )}
      <a
        href={result.url}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex text-xs font-semibold text-[var(--nourish-green)] hover:underline"
      >
        View original →
      </a>
    </li>
  );
}
