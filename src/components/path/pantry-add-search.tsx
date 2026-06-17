"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Search } from "lucide-react";
import { usePantry } from "@/lib/hooks/use-pantry";
import { searchIngredients } from "@/lib/pantry/ingredient-search";
import { haptic } from "@/lib/motion/haptics";

/**
 * Pantry search-to-add — a typeahead over the canonical ingredient registry,
 * plus a free-text "Add …" row for anything not in the registry. Gives the
 * pantry a simple manual add path (it was AI-import-only). Adds are idempotent
 * (the pantry is a Set) and the input clears + keeps focus for fast multi-add.
 */
export function PantryAddSearch() {
  const { add, has } = usePantry();
  const [q, setQ] = useState("");
  const trimmed = q.trim();
  const results = useMemo(() => searchIngredients(trimmed), [trimmed]);
  const exactMatch = results.some(
    (r) => r.name.toLowerCase() === trimmed.toLowerCase(),
  );

  const addName = (name: string) => {
    const value = name.trim();
    if (!value) return;
    haptic("select");
    add(value);
    setQ("");
  };

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 transition-colors focus-within:border-[var(--nourish-green)]/45">
        <Search
          size={15}
          className="shrink-0 text-[var(--nourish-subtext)]"
          aria-hidden
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addName(results[0]?.name ?? trimmed);
            }
          }}
          placeholder="Add an ingredient…"
          aria-label="Search ingredients to add to your pantry"
          className="min-w-0 flex-1 bg-transparent text-sm text-[var(--nourish-dark)] placeholder:text-[var(--nourish-subtext)] focus:outline-none"
        />
      </div>

      {trimmed.length >= 2 && (
        <ul className="mt-1.5 space-y-1">
          {results.map((r) => {
            const already = has(r.name);
            return (
              <li key={r.id}>
                <button
                  type="button"
                  disabled={already}
                  onClick={() => addName(r.name)}
                  className="flex w-full items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left text-sm capitalize text-[var(--nourish-dark)] transition-colors hover:border-[var(--nourish-green)]/40 disabled:cursor-default disabled:opacity-60"
                >
                  <span className="flex-1 truncate">{r.name}</span>
                  {already ? (
                    <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-[var(--nourish-green)]">
                      <Check size={12} aria-hidden /> Added
                    </span>
                  ) : (
                    <Plus
                      size={15}
                      className="shrink-0 text-[var(--nourish-green)]"
                      aria-hidden
                    />
                  )}
                </button>
              </li>
            );
          })}

          {!exactMatch && (
            <li>
              <button
                type="button"
                onClick={() => addName(trimmed)}
                className="flex w-full items-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-white px-3 py-2 text-left text-sm text-[var(--nourish-subtext)] transition-colors hover:border-[var(--nourish-green)]/40"
              >
                <Plus
                  size={15}
                  className="shrink-0 text-[var(--nourish-green)]"
                  aria-hidden
                />
                <span className="truncate">
                  Add &ldquo;
                  <span className="font-medium text-[var(--nourish-dark)]">
                    {trimmed}
                  </span>
                  &rdquo;
                </span>
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
