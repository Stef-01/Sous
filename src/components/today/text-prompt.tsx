"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Camera } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { sides, meals } from "@/data";

interface LocalResult {
  name: string;
  cuisine: string;
  emoji: string;
}

function getDishEmoji(tags: string[], cuisine: string): string {
  const all = [...tags.map((t) => t.toLowerCase()), cuisine.toLowerCase()];
  if (all.some((t) => ["salad", "raw", "greens"].includes(t))) return "🥗";
  if (all.some((t) => ["soup", "broth", "stew"].includes(t))) return "🍲";
  if (all.some((t) => ["rice"].includes(t))) return "🍚";
  if (all.some((t) => ["bread", "toast", "baked"].includes(t))) return "🍞";
  if (all.some((t) => ["pasta", "noodle"].includes(t))) return "🍝";
  if (all.some((t) => ["mexican", "taco", "wrap"].includes(t))) return "🌮";
  if (all.some((t) => ["indian", "curry"].includes(t))) return "🍛";
  if (all.some((t) => ["japanese", "korean", "sushi"].includes(t))) return "🍱";
  if (all.some((t) => ["thai", "chinese", "asian"].includes(t))) return "🍜";
  if (all.some((t) => ["mediterranean", "italian"].includes(t))) return "🫒";
  if (all.some((t) => ["sweet", "dessert"].includes(t))) return "🍮";
  if (all.some((t) => ["roasted", "grilled"].includes(t))) return "🥘";
  return "🍽️";
}

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

function searchLocal(query: string): LocalResult[] {
  const q = query.toLowerCase().trim();
  if (q.length < 1) return [];

  const results: LocalResult[] = [];
  const seen = new Set<string>();

  // Search meals first (main dishes)
  for (const meal of meals) {
    const matches =
      meal.name.toLowerCase().includes(q) ||
      meal.aliases.some((a) => a.toLowerCase().includes(q));
    if (matches && !seen.has(meal.id)) {
      seen.add(meal.id);
      results.push({
        name: meal.name,
        cuisine: meal.cuisine,
        emoji: getDishEmoji([meal.cuisine.toLowerCase()], meal.cuisine),
      });
    }
  }

  // Search sides
  for (const side of sides) {
    const matches =
      side.name.toLowerCase().includes(q) ||
      side.tags.some((t) => t.toLowerCase().includes(q));
    if (matches && !seen.has(side.id)) {
      seen.add(side.id);
      const cuisine = getCuisineFromTags(side.tags);
      results.push({
        name: side.name,
        cuisine,
        emoji: getDishEmoji(side.tags, cuisine),
      });
    }
  }

  return results.slice(0, 6);
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced local catalog search
  useEffect(() => {
    if (!text.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLocalResults(searchLocal(text));
      setHasSearched(true);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text]);

  // Derive empty state outside effect to avoid synchronous setState in effects
  const effectiveResults = text.trim() ? localResults : [];
  const effectiveHasSearched = text.trim() ? hasSearched : false;

  const handleSubmit = useCallback(
    (value?: string) => {
      const trimmed = (value ?? text).trim();
      if (trimmed && !isLoading) {
        onSubmit(trimmed);
      }
    },
    [text, isLoading, onSubmit],
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
  const showSuggestions = !text && suggestions.length > 0;

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

      {/* Popular suggestion chips — shown when input is empty */}
      <AnimatePresence mode="wait">
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
          >
            {effectiveResults.length > 0 ? (
              <div className="rounded-xl border border-neutral-100 bg-white overflow-hidden divide-y divide-neutral-50">
                {effectiveResults.map((result, idx) => (
                  <motion.button
                    key={result.name}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => handleSelectResult(result.name)}
                    whileTap={{ scale: 0.98 }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[var(--nourish-green)]/5 transition-colors"
                    type="button"
                  >
                    <span className="text-xl shrink-0 w-7 text-center">
                      {result.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--nourish-dark)] truncate">
                        {result.name}
                      </p>
                      <p className="text-[11px] text-[var(--nourish-subtext)]">
                        {result.cuisine} · ~15 min
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <span className="text-3xl">🔍</span>
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
