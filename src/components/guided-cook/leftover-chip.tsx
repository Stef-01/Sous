"use client";

/**
 * LeftoverChip — Y3 W22 win-screen leftovers affordance.
 *
 * Consumes the W2 findSuccessorRecipe helper + W21pre big-batch
 * tag catalog + renders a one-tap "Tomorrow's lunch?" chip on
 * the win screen when the just-completed recipe is tagged as
 * big-batch AND a successor with adequate pantry coverage exists.
 *
 * Below threshold or non-big-batch → renders nothing. Never
 * filled with stale fallback (same discipline as the W8 daily
 * novelty chip + Y2 W42 viral chip).
 *
 * Tap accept → caller's onAcceptSuccessor(slug) fires. Tap
 * dismiss → component fades out.
 *
 * Pure-rendering — wraps the engine call in useMemo. No side
 * effects of its own; the parent owns the meal-plan write.
 */

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChefHat, X } from "lucide-react";
import {
  findSuccessorRecipe,
  formatLeftoverChipCopy,
} from "@/lib/recipe/big-batch";
import bigBatchTagsRaw from "@/data/big-batch-tags.json";
import { cn } from "@/lib/utils/cn";

interface LeftoverChipProps {
  /** Slug of the just-completed recipe. */
  cookedSlug: string;
  /** Current pantry — ingredient names. */
  pantry: ReadonlyArray<string>;
  /** Recently-cooked slugs (last 7 days) — drives the W2
   *  repeat-avoidance gate. */
  recentCookSlugs: ReadonlyArray<string>;
  /** Caller's accept handler. Receives the successor slug. */
  onAcceptSuccessor: (slug: string) => void;
  /** Optional human-readable name lookup so the copy can read
   *  "tomorrow's chicken-rice-bowl" naturally. Caller passes a
   *  Record<slug, displayName>. Falls back to slug humanisation. */
  successorDisplayNames?: Record<string, string>;
}

interface BigBatchTagJSON {
  recipeSlug: string;
  leftoverLabel: string;
  expectedLeftoverItems: string[];
  successorRecipeSlugs: string[];
}

interface SuccessorCandidateJSON {
  recipeSlug: string;
  requiredIngredients: string[];
  optionalIngredients?: string[];
}

/** V1: derive successor candidates inline from the tag catalog
 *  + a tiny ingredient-requirement table. Y4 wires this to the
 *  full recipe catalog when Postgres lights up. */
const SUCCESSOR_REQUIREMENTS: ReadonlyArray<SuccessorCandidateJSON> = [
  {
    recipeSlug: "chicken-rice-bowl",
    requiredIngredients: ["chicken meat", "rice"],
  },
  {
    recipeSlug: "chicken-salad-wrap",
    requiredIngredients: ["chicken meat", "tortilla", "lettuce"],
  },
  {
    recipeSlug: "chicken-noodle-soup",
    requiredIngredients: ["chicken meat", "noodles", "broth"],
  },
  {
    recipeSlug: "spaghetti-marinara",
    requiredIngredients: ["spaghetti", "tomato sauce"],
  },
  {
    recipeSlug: "shakshuka",
    requiredIngredients: ["tomato sauce", "egg"],
  },
  {
    recipeSlug: "marinara-poached-eggs",
    requiredIngredients: ["tomato sauce", "egg"],
  },
  {
    recipeSlug: "pulled-pork-tacos",
    requiredIngredients: ["pulled pork", "tortilla", "lime"],
  },
  {
    recipeSlug: "pork-fried-rice",
    requiredIngredients: ["pulled pork", "rice", "egg"],
  },
  {
    recipeSlug: "pork-banh-mi",
    requiredIngredients: ["pulled pork", "bread"],
  },
  {
    recipeSlug: "egg-fried-rice",
    requiredIngredients: ["rice", "egg"],
  },
  {
    recipeSlug: "rice-pudding",
    requiredIngredients: ["rice", "milk"],
  },
  {
    recipeSlug: "rice-arancini",
    requiredIngredients: ["rice", "egg", "breadcrumbs"],
  },
  {
    recipeSlug: "veg-grain-bowl",
    requiredIngredients: ["roasted veg", "rice"],
  },
  {
    recipeSlug: "veg-frittata",
    requiredIngredients: ["roasted veg", "egg"],
  },
  {
    recipeSlug: "veg-pita",
    requiredIngredients: ["roasted veg", "pita", "hummus"],
  },
  {
    recipeSlug: "lentil-soup",
    requiredIngredients: ["cooked lentils", "broth"],
  },
  {
    recipeSlug: "lentil-tacos",
    requiredIngredients: ["cooked lentils", "tortilla"],
  },
  {
    recipeSlug: "lentil-shepherds-pie",
    requiredIngredients: ["cooked lentils", "potato"],
  },
  {
    recipeSlug: "spaghetti-bolognese",
    requiredIngredients: ["spaghetti", "bolognese"],
  },
  {
    recipeSlug: "lasagna",
    requiredIngredients: ["bolognese", "lasagna sheets", "cheese"],
  },
  {
    recipeSlug: "stuffed-peppers",
    requiredIngredients: ["bolognese", "bell pepper"],
  },
  {
    recipeSlug: "bean-quesadilla",
    requiredIngredients: ["cooked beans", "tortilla", "cheese"],
  },
  {
    recipeSlug: "bean-soup",
    requiredIngredients: ["cooked beans", "broth"],
  },
  {
    recipeSlug: "bean-burrito-bowl",
    requiredIngredients: ["cooked beans", "rice"],
  },
];

const TAG_TABLE = bigBatchTagsRaw as BigBatchTagJSON[];

/** Pure: humanise a slug — "chicken-rice-bowl" → "chicken rice bowl". */
function humaniseSlug(slug: string): string {
  return slug.replace(/-/g, " ");
}

export function LeftoverChip({
  cookedSlug,
  pantry,
  recentCookSlugs,
  onAcceptSuccessor,
  successorDisplayNames,
}: LeftoverChipProps) {
  const reducedMotion = useReducedMotion();
  const [dismissed, setDismissed] = useState(false);

  const successor = useMemo(() => {
    return findSuccessorRecipe({
      cookedSlug,
      pantry,
      recentCookSlugs,
      tagTable: TAG_TABLE,
      successorTable: SUCCESSOR_REQUIREMENTS,
    });
  }, [cookedSlug, pantry, recentCookSlugs]);

  if (!successor.ok || dismissed) return null;

  const displayName =
    successorDisplayNames?.[successor.slug] ?? humaniseSlug(successor.slug);
  const copy = formatLeftoverChipCopy({
    leftoverLabel: successor.leftoverLabel,
    successorDisplayName: displayName,
  });

  return (
    <AnimatePresence>
      <motion.section
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
        transition={{ duration: reducedMotion ? 0 : 0.2 }}
        className="relative rounded-2xl border border-[var(--nourish-green)]/25 bg-[var(--nourish-green)]/5 p-4 shadow-sm"
        aria-label="Tomorrow's lunch suggestion from this cook's leftovers"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--nourish-green)]/15"
          >
            <ChefHat
              size={16}
              className="text-[var(--nourish-green)]"
              aria-hidden
            />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
              Tomorrow&apos;s lunch
            </p>
            <p className="mt-0.5 text-sm font-medium leading-snug text-[var(--nourish-dark)]">
              {copy}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss leftover suggestion"
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--nourish-subtext)] transition-colors hover:bg-white/40 hover:text-[var(--nourish-dark)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
            )}
          >
            <X size={14} aria-hidden />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onAcceptSuccessor(successor.slug)}
          className={cn(
            "mt-3 w-full rounded-xl bg-[var(--nourish-green)] py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-cta)] transition-colors",
            "hover:bg-[var(--nourish-dark-green)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
          )}
        >
          Plan it for tomorrow
        </button>
      </motion.section>
    </AnimatePresence>
  );
}
