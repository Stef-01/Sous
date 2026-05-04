"use client";

/**
 * DailyNoveltyChip — Y3 W8 substrate × W19 surface bridge.
 *
 * Consumes the W8 `generateDailyNovelty` engine + renders the
 * Today chip between CookAgainChip and FriendsStrip. The chip
 * renders ONLY when the engine returns a result (score above
 * threshold + cool-down clear + pantry feasible). Below
 * threshold the chip simply doesn't render — never filled
 * with a stale fallback.
 *
 * Tap → expands inline to show the matched ingredients (with
 * pantry-status dots), the pairing rationale, and a one-tap
 * "make it tonight" CTA.
 *
 * The chip is curiosity-styled per the variable-reward
 * behavioural overlay. NEVER FOMO ("everyone is making this
 * except you" is forbidden); always invitation ("did you
 * know...?" / "have you tried...?").
 */

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";
import { generateDailyNovelty, type NoveltyResult } from "@/lib/engine/novelty";
import { usePantry } from "@/lib/hooks/use-pantry";
import { useCookSessions } from "@/lib/hooks/use-cook-sessions";
import { IngredientPantryDot } from "@/components/shared/ingredient-pantry-dot";
import { cn } from "@/lib/utils/cn";

const RECENT_COOK_LOOKBACK_DAYS = 30;
const RECENT_SUGGESTION_STORAGE_KEY = "sous-novelty-recent";

interface RecentSuggestion {
  id: string;
  surfacedAt: string;
}

/** Pure: read recent novelty suggestions from localStorage.
 *  Defends against malformed JSON / shape drift. */
function readRecentSuggestions(): RecentSuggestion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SUGGESTION_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is RecentSuggestion =>
        typeof e === "object" &&
        e !== null &&
        typeof e.id === "string" &&
        typeof e.surfacedAt === "string",
    );
  } catch {
    return [];
  }
}

export function DailyNoveltyChip() {
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const { items: pantryItems, mounted: pantryMounted } = usePantry();
  const { sessions } = useCookSessions();

  const novelty = useMemo<NoveltyResult | null>(() => {
    // Wait for pantry hydration to avoid an SSR/CSR flash. Cook
    // sessions hook hydrates synchronously from a localStorage
    // read so no separate gate needed.
    if (!pantryMounted) return null;
    if (typeof window === "undefined") return null;

    const now = new Date();
    const cutoff =
      now.getTime() - RECENT_COOK_LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
    const recentCookIngredientSets = sessions
      .filter((s) => {
        if (!s.completedAt) return false;
        const ts = new Date(s.completedAt).getTime();
        return Number.isFinite(ts) && ts >= cutoff;
      })
      // Without ingredient lists per session in V1, use the
      // dish slug as a single-token proxy. The W17 expansion
      // pulls the actual ingredient set from the recipe table.
      .map((s) => [s.recipeSlug.toLowerCase().replace(/-/g, " ")]);

    return generateDailyNovelty({
      pantry: pantryItems.map((p) => p.toLowerCase()),
      recentCookIngredientSets,
      recentSuggestionIds: readRecentSuggestions(),
      now,
    });
  }, [pantryItems, sessions, pantryMounted]);

  if (!novelty) return null;

  const onExpand = () => {
    setExpanded((v) => !v);
    // Mark this suggestion as surfaced — drives the cool-down.
    if (typeof window !== "undefined" && !expanded) {
      try {
        const recent = readRecentSuggestions();
        // Drop entries older than 60 days to keep the array
        // bounded.
        const cutoff = Date.now() - 60 * 24 * 60 * 60 * 1000;
        const filtered = recent.filter((r) => {
          const ts = new Date(r.surfacedAt).getTime();
          return Number.isFinite(ts) && ts >= cutoff;
        });
        // De-dup on id.
        const next = filtered.filter((r) => r.id !== novelty.id);
        next.push({ id: novelty.id, surfacedAt: new Date().toISOString() });
        window.localStorage.setItem(
          RECENT_SUGGESTION_STORAGE_KEY,
          JSON.stringify(next),
        );
      } catch {
        // ignore — quota / privacy mode
      }
    }
  };

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
      className="rounded-2xl border border-[var(--nourish-border-soft)] bg-white shadow-sm"
      aria-label="Today's novelty suggestion"
    >
      <button
        type="button"
        onClick={onExpand}
        aria-expanded={expanded}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-3 text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40 rounded-2xl",
        )}
      >
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--nourish-gold)]/15"
        >
          <Sparkles
            size={16}
            className="text-[var(--nourish-gold)]"
            aria-hidden
          />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
            From your pantry
          </p>
          <p className="truncate text-sm font-medium text-[var(--nourish-dark)]">
            {/* Curiosity copy — never FOMO */}
            Have you tried {novelty.suggestedDishName.toLowerCase()}?
          </p>
        </div>
        <ChevronRight
          size={16}
          className={cn(
            "shrink-0 text-[var(--nourish-subtext)] transition-transform",
            expanded && "rotate-90",
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-[var(--nourish-border-soft)] px-4 py-3">
              {/* Pairing rationale */}
              <p className="text-xs leading-relaxed text-[var(--nourish-subtext)]">
                {novelty.pairingExplanation}
              </p>

              {/* Ingredient list with pantry dots */}
              <ul className="space-y-1">
                {novelty.ingredients.map((ing) => (
                  <li
                    key={ing}
                    className="flex items-center gap-2 text-sm text-[var(--nourish-dark)]"
                  >
                    <IngredientPantryDot
                      status="have"
                      className="self-center"
                    />
                    <span className="capitalize">{ing}</span>
                  </li>
                ))}
              </ul>

              {/* Meta + CTA */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[var(--nourish-subtext)]">
                  {novelty.prepTimeMinutes} min · {novelty.suggestedDishType}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    // V1: simply collapses + acknowledges. The
                    // 'write to today's dinner slot' integration
                    // lands at Y3 W22 with the MealPlanWeek hook.
                    setExpanded(false);
                  }}
                  className="rounded-full bg-[var(--nourish-green)] px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-[var(--nourish-dark-green)]"
                >
                  Save the idea
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
