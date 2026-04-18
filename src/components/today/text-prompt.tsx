"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Camera,
  UtensilsCrossed,
  Flame,
  Fish,
  Leaf,
  CookingPot,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { sides, meals } from "@/data";
import {
  getStaticCookData,
  getStaticMealCookData,
} from "@/data/guided-cook-steps";
import { findClosestDishes } from "@/lib/engine/find-closest-dishes";
import { useCravingHistory } from "@/lib/hooks/use-craving-history";
import {
  useQuestFilters,
  cookTimeCapMinutes,
  type CookTimeFilter,
  type CuisineFilter,
} from "@/lib/hooks/use-quest-filters";

interface LocalResultAxes {
  label: string;
  value: string;
}

interface LocalResult {
  name: string;
  cuisine: string;
  /** Why this dish surfaced — e.g. "Same pasta · cream sauce". Only set for
   *  semantically-matched suggestions. */
  reason?: string;
  /** `true` when this row came from the semantic matcher (not a literal
   *  substring hit). Lets the UI tag it as a "closest match". */
  semantic?: boolean;
  /** Per-axis match breakdown for the "Why this match?" expander. */
  axes?: LocalResultAxes[];
}

function getTotalMinutes(id: string, isMeal: boolean): number | null {
  const d = isMeal ? getStaticMealCookData(id) : getStaticCookData(id);
  if (!d) return null;
  return d.prepTimeMinutes + d.cookTimeMinutes;
}

const CUISINE_ICON: Record<string, LucideIcon> = {
  japanese: Fish,
  korean: Flame,
  thai: Leaf,
  chinese: CookingPot,
  vietnamese: Leaf,
  filipino: CookingPot,
  indian: Flame,
  italian: UtensilsCrossed,
  mexican: Flame,
  mediterranean: Leaf,
};

function getCuisineFromTags(tags: string[]): string {
  const cuisineTags = [
    "italian",
    "indian",
    "japanese",
    "korean",
    "thai",
    "chinese",
    "mexican",
    "mediterranean",
    "vietnamese",
    "filipino",
  ];
  const found = tags.find((t) => cuisineTags.includes(t.toLowerCase()));
  if (found) return found.charAt(0).toUpperCase() + found.slice(1);
  return "Classic";
}

interface FilterApplyOptions {
  cookTime: CookTimeFilter;
  cuisine: CuisineFilter;
}

function matchesFilters(
  id: string,
  cuisine: string,
  isMeal: boolean,
  filters: FilterApplyOptions,
): boolean {
  if (filters.cuisine !== "any") {
    if (cuisine.toLowerCase() !== filters.cuisine.toLowerCase()) return false;
  }
  if (filters.cookTime !== "any") {
    const cap = cookTimeCapMinutes(filters.cookTime);
    const mins = getTotalMinutes(id, isMeal);
    // If we can't estimate the time, leave it in rather than hiding a dish
    // the user explicitly searched for. Strict mode would be worse UX.
    if (mins !== null && mins > cap) return false;
  }
  return true;
}

function searchLocal(
  query: string,
  filters: FilterApplyOptions,
): LocalResult[] {
  const q = query.toLowerCase().trim();
  if (q.length < 1) return [];

  const results: LocalResult[] = [];
  const seen = new Set<string>();

  // Pass 1 — literal substring hits (fast, predictable).
  for (const meal of meals) {
    const hit =
      meal.name.toLowerCase().includes(q) ||
      meal.aliases.some((a) => a.toLowerCase().includes(q));
    if (hit && !seen.has(meal.id)) {
      if (!matchesFilters(meal.id, meal.cuisine, true, filters)) continue;
      seen.add(meal.id);
      results.push({ name: meal.name, cuisine: meal.cuisine });
    }
  }

  for (const side of sides) {
    const hit =
      side.name.toLowerCase().includes(q) ||
      side.tags.some((t) => t.toLowerCase().includes(q));
    if (hit && !seen.has(side.id)) {
      const cuisine = getCuisineFromTags(side.tags);
      if (!matchesFilters(side.id, cuisine, false, filters)) continue;
      seen.add(side.id);
      results.push({ name: side.name, cuisine });
    }
  }

  // Pass 2 — semantic "closest" matches from the taxonomy index. These
  // only surface dishes we did not already catch literally, and each
  // carries a short reason ("Same pasta · cream sauce"). We cap the list
  // so the literal matches still dominate when they exist.
  const semantic = findClosestDishes(q, 8);
  for (const m of semantic) {
    if (seen.has(m.dish.id)) continue;
    const isMeal = meals.some((meal) => meal.id === m.dish.id);
    if (!matchesFilters(m.dish.id, m.dish.cuisine, isMeal, filters)) continue;
    seen.add(m.dish.id);
    const axes: LocalResultAxes[] = [];
    if (m.matched.exactName) axes.push({ label: "name", value: "exact match" });
    else if (m.matched.aliasHit)
      axes.push({ label: "name", value: "known alias" });
    if (m.matched.forms.length)
      axes.push({ label: "form", value: m.matched.forms.join(", ") });
    if (m.matched.sauces.length) {
      const sauces = m.matched.sauces.filter((s) => s !== "none");
      if (sauces.length)
        axes.push({ label: "sauce", value: sauces.join(", ") });
    }
    if (m.matched.proteins.length)
      axes.push({ label: "protein", value: m.matched.proteins.join(", ") });
    if (m.matched.flavors.length)
      axes.push({ label: "flavor", value: m.matched.flavors.join(", ") });
    if (m.matched.techniques.length)
      axes.push({
        label: "technique",
        value: m.matched.techniques.join(", "),
      });
    if (m.matched.cuisineHit)
      axes.push({ label: "cuisine", value: m.dish.cuisine });
    results.push({
      name: m.dish.name,
      cuisine: m.dish.cuisine,
      reason: m.reason,
      semantic: true,
      axes: axes.length > 0 ? axes : undefined,
    });
    if (results.length >= 12) break;
  }

  return results.slice(0, 8);
}

interface TextPromptProps {
  onSubmit: (text: string) => void;
  onCameraClick: () => void;
  isLoading: boolean;
  suggestions?: string[];
}

export function TextPrompt({
  onSubmit,
  onCameraClick,
  isLoading,
  suggestions = [
    "Pasta",
    "Stir Fry",
    "Salad",
    "Curry",
    "Tacos",
    "Soup",
    "Rice",
    "Chicken",
  ],
}: TextPromptProps) {
  const [text, setText] = useState("");
  const [localResults, setLocalResults] = useState<LocalResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { entries: historyEntries, record: recordHistory } =
    useCravingHistory();
  const questFilters = useQuestFilters();

  // Debounced local catalog search
  useEffect(() => {
    if (!text.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLocalResults(
        searchLocal(text, {
          cookTime: questFilters.cookTime,
          cuisine: questFilters.cuisine,
        }),
      );
      setHasSearched(true);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text, questFilters.cookTime, questFilters.cuisine]);

  // Derive empty state outside effect to avoid synchronous setState in effects
  const effectiveResults = text.trim() ? localResults : [];
  const effectiveHasSearched = text.trim() ? hasSearched : false;

  const handleSubmit = useCallback(
    (value?: string) => {
      const trimmed = (value ?? text).trim();
      if (trimmed && !isLoading) {
        recordHistory(trimmed);
        onSubmit(trimmed);
      }
    },
    [text, isLoading, onSubmit, recordHistory],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleSelectResult = useCallback(
    (name: string) => {
      setText(name);
      handleSubmit(name);
    },
    [handleSubmit],
  );

  const showResults = !!text && !isLoading && effectiveHasSearched;
  const showHistory =
    !text && isFocused && historyEntries.length > 0 && !isLoading;
  const showSuggestions = !text && !showHistory && suggestions.length > 0;

  const activeFilterLabel = (() => {
    const parts: string[] = [];
    if (questFilters.cookTime !== "any") {
      parts.push(`≤${questFilters.cookTime} min`);
    }
    if (questFilters.cuisine !== "any") {
      const label =
        questFilters.cuisine.charAt(0).toUpperCase() +
        questFilters.cuisine.slice(1);
      parts.push(label);
    }
    return parts.length > 0 ? parts.join(" · ") : null;
  })();
  const clearFilters = useCallback(() => {
    questFilters.reset();
  }, [questFilters]);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[var(--nourish-subtext)]">
        What&apos;s your main dish?
      </label>

      <div className="relative">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Slight delay so chip clicks register before the row hides.
            window.setTimeout(() => setIsFocused(false), 120);
          }}
          placeholder="Roast chicken, pasta, curry..."
          disabled={isLoading}
          autoFocus
          className={cn(
            "w-full rounded-xl border border-neutral-200 bg-[var(--nourish-input-bg)] px-4 py-3.5 pr-24 text-base",
            "placeholder:text-[var(--nourish-subtext)]/60",
            "focus:outline-none focus:ring-2 focus:ring-[var(--nourish-green)]/30 focus:border-[var(--nourish-green)]",
            "disabled:opacity-50",
            "transition-all duration-200",
          )}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          <motion.button
            onClick={onCameraClick}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="rounded-lg p-2 text-[var(--nourish-subtext)] hover:bg-neutral-200/60 transition-colors"
            aria-label="Take a photo"
            type="button"
          >
            <Camera size={18} />
          </motion.button>
          <motion.button
            onClick={() => handleSubmit()}
            disabled={!text.trim() || isLoading}
            whileTap={text.trim() && !isLoading ? { scale: 0.88 } : undefined}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={cn(
              "rounded-lg p-2 transition-all duration-200",
              text.trim() && !isLoading
                ? "bg-[var(--nourish-green)] text-white hover:bg-[var(--nourish-dark-green)]"
                : "text-[var(--nourish-subtext)]/40 cursor-not-allowed",
            )}
            aria-label="Search"
            type="button"
          >
            <Search size={18} />
          </motion.button>
        </div>
      </div>

      {/* Recent craving history — shown on focus when empty. One-tap rerun. */}
      <AnimatePresence mode="wait">
        {showHistory && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="space-y-1.5"
          >
            <p className="px-1 text-[10px] font-bold uppercase tracking-wide text-[var(--nourish-subtext)]/80">
              Recent
            </p>
            <div className="flex flex-wrap gap-2">
              {historyEntries.map((entry) => (
                <motion.button
                  key={entry.query}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectResult(entry.query);
                  }}
                  whileTap={{ scale: 0.93 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className={cn(
                    "rounded-full border border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/5 px-3 py-1.5 text-sm",
                    "text-[var(--nourish-green)] hover:bg-[var(--nourish-green)]/10",
                    "transition-colors duration-150",
                  )}
                  type="button"
                >
                  {entry.query}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Popular suggestion chips — shown when input is empty */}
        {showSuggestions && (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex flex-wrap gap-2"
          >
            {suggestions.map((suggestion) => (
              <motion.button
                key={suggestion}
                onClick={() => handleSelectResult(suggestion)}
                whileTap={{ scale: 0.93 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={cn(
                  "rounded-full border border-neutral-200 px-3 py-1.5 text-sm",
                  "text-[var(--nourish-subtext)] hover:border-[var(--nourish-green)] hover:text-[var(--nourish-green)]",
                  "transition-colors duration-150",
                )}
                type="button"
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Local search results */}
        {showResults && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="space-y-2"
          >
            {activeFilterLabel && (
              <button
                onClick={clearFilters}
                type="button"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full",
                  "border border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/5",
                  "px-3 py-1 text-[11px] font-medium text-[var(--nourish-green)]",
                  "hover:bg-[var(--nourish-green)]/10 transition-colors",
                )}
                aria-label="Clear active filters"
              >
                <span>Filters on: {activeFilterLabel}</span>
                <span aria-hidden className="text-[var(--nourish-green)]/70">
                  ✕ clear
                </span>
              </button>
            )}
            {effectiveResults.length > 0 ? (
              (() => {
                const literalHits = effectiveResults.filter((r) => !r.semantic);
                const semanticHits = effectiveResults.filter((r) => r.semantic);
                return (
                  <div className="space-y-3">
                    {literalHits.length > 0 && (
                      <div className="rounded-xl border border-neutral-100 bg-white overflow-hidden divide-y divide-neutral-50">
                        {literalHits.map((result, idx) => (
                          <ResultRow
                            key={result.name}
                            result={result}
                            idx={idx}
                            onSelect={handleSelectResult}
                          />
                        ))}
                      </div>
                    )}

                    {semanticHits.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="px-1 text-[10px] font-bold uppercase tracking-wide text-[var(--nourish-subtext)]/80">
                          Closest to what you&apos;re craving
                        </p>
                        <div className="rounded-xl border border-dashed border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/[0.03] overflow-hidden divide-y divide-[var(--nourish-green)]/10">
                          {semanticHits.map((result, idx) => (
                            <ResultRow
                              key={result.name}
                              result={result}
                              idx={idx}
                              onSelect={handleSelectResult}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-6 space-y-2">
                <Search size={28} className="text-[var(--nourish-subtext)]" />
                <p className="text-sm text-[var(--nourish-subtext)]">
                  No dishes match &ldquo;{text.trim()}&rdquo;
                </p>
                <p className="text-xs text-[var(--nourish-subtext)]/70">
                  Hit search to find sides for any dish
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultRow({
  result,
  idx,
  onSelect,
}: {
  result: LocalResult;
  idx: number;
  onSelect: (name: string) => void;
}) {
  const Icon = CUISINE_ICON[result.cuisine.toLowerCase()] ?? UtensilsCrossed;
  const [expanded, setExpanded] = useState(false);
  const hasExpander = !!result.axes && result.axes.length > 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.04 }}
      className="flex w-full flex-col"
    >
      <div className="flex w-full items-center">
        <button
          onClick={() => onSelect(result.name)}
          className="flex flex-1 items-center gap-3 px-3 py-2.5 text-left hover:bg-[var(--nourish-green)]/5 transition-colors min-w-0"
          type="button"
        >
          <Icon
            size={18}
            className="shrink-0 text-[var(--nourish-green)]"
            strokeWidth={1.8}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--nourish-dark)] truncate">
              {result.name}
            </p>
            <p className="text-[11px] text-[var(--nourish-subtext)] truncate">
              {result.cuisine}
              {result.reason ? ` · ${result.reason}` : " · ~15 min"}
            </p>
          </div>
        </button>
        {hasExpander && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            aria-expanded={expanded}
            aria-label={expanded ? "Hide match details" : "Why this match?"}
            className={cn(
              "shrink-0 px-2.5 py-1 mr-2 rounded-md text-[10px] font-semibold uppercase tracking-wide",
              "text-[var(--nourish-green)] hover:bg-[var(--nourish-green)]/10 transition-colors",
            )}
            type="button"
          >
            {expanded ? "Hide" : "Why?"}
          </button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {expanded && result.axes && (
          <motion.div
            key="why-expander"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <ul className="px-3 pb-2.5 space-y-0.5 text-[11px] text-[var(--nourish-subtext)]">
              {result.axes.map((axis) => (
                <li key={axis.label} className="flex items-baseline gap-1.5">
                  <span className="w-16 shrink-0 text-[10px] uppercase tracking-wide text-[var(--nourish-subtext)]/70">
                    {axis.label}
                  </span>
                  <span className="font-medium text-[var(--nourish-dark)]">
                    {axis.value}
                  </span>
                  <span
                    className="ml-auto text-[var(--nourish-green)] font-bold"
                    aria-hidden
                  >
                    ✓
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
