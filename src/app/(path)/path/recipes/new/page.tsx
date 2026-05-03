"use client";

/**
 * /path/recipes/new — recipe-authoring page (Stage-5 W27).
 *
 * Builds on the W17-W24 infrastructure:
 *   - W17 UserRecipe Zod schema (source of truth)
 *   - W23 pure draft helpers (defaultRecipeDraft, append/remove/reorder)
 *   - W23 react-hook-form (consensus pick from LIBRARY-RECOMMENDATIONS.md)
 *   - W24 useRecipeDrafts (localStorage persistence)
 *   - W43 seed-fork adapter (templates the user can fork)
 *
 * The form surface itself lives in `RecipeForm`, shared with
 * `/path/recipes/[id]/edit` (W29). This page is just the header
 * shell + a `defaultRecipeDraft()` factory call (or a forked-seed
 * draft when `?fork=<slug>` is present).
 */

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import {
  defaultRecipeDraft,
  type RecipeDraft,
} from "@/lib/recipe-authoring/recipe-draft";
import { seedToRecipeDraft } from "@/lib/recipe-authoring/seed-fork";
import { RecipeForm } from "@/components/recipe-authoring/recipe-form";
import {
  getStaticCookData,
  getStaticMealCookData,
} from "@/data/guided-cook-steps";

export default function NewRecipePage() {
  return (
    <Suspense fallback={null}>
      <NewRecipePageContent />
    </Suspense>
  );
}

function NewRecipePageContent() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const searchParams = useSearchParams();
  const forkSlug = searchParams.get("fork");

  const initialDraft = useMemo<RecipeDraft>(() => {
    if (!forkSlug) return defaultRecipeDraft();
    const seed = getStaticCookData(forkSlug) ?? getStaticMealCookData(forkSlug);
    if (!seed) return defaultRecipeDraft();
    return seedToRecipeDraft(seed);
  }, [forkSlug]);

  const heading =
    forkSlug && initialDraft.title.startsWith("My ")
      ? "Fork recipe"
      : "New recipe";

  return (
    <motion.div
      className="min-h-full bg-[var(--nourish-cream)] pb-24"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
    >
      <header className="app-header px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/path")}
            aria-label="Back to Path"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[var(--nourish-dark)] transition hover:bg-neutral-50"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
            {heading}
          </h1>
        </div>
      </header>

      <RecipeForm initialValues={initialDraft} mode="new" />
    </motion.div>
  );
}
