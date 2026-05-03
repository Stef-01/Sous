"use client";

/**
 * /path/recipes/[id]/edit — edit a previously-saved recipe.
 *
 * W29 follow-on to the W27 author surface. Shares the form body
 * with /path/recipes/new via `<RecipeForm>`; this page just
 * resolves the recipe by id from `useRecipeDrafts` and feeds it in
 * as `initialValues`.
 *
 * Lifecycle:
 *   - Pre-hydration → skeleton (matches form-shell height so the
 *     page doesn't jump).
 *   - Hydrated, recipe found → RecipeForm with the recipe as
 *     initialValues. `commitDraft` is idempotent on already-
 *     committed drafts so it preserves id/slug/createdAt and
 *     bumps updatedAt — same submit pipeline as /new, no special-
 *     cased "update" path.
 *   - Hydrated, recipe missing → not-found card with a back link.
 */

import { use } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ChefHat } from "lucide-react";
import { RecipeForm } from "@/components/recipe-authoring/recipe-form";
import { useRecipeDrafts } from "@/lib/recipe-authoring/use-recipe-drafts";
import type { RecipeDraft } from "@/lib/recipe-authoring/recipe-draft";

export default function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { drafts, mounted } = useRecipeDrafts();

  // UserRecipe is a strict superset of RecipeDraft (the draft has
  // four optional fields that UserRecipe always provides), so the
  // cast is safe. RecipeForm's `commitDraft` step preserves id /
  // slug / createdAt verbatim and bumps updatedAt.
  const recipe = drafts.find((r) => r.id === id);

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
            onClick={() => router.push("/path/recipes")}
            aria-label="Back to My recipes"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[var(--nourish-dark)] transition hover:bg-neutral-50"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
            Edit recipe
          </h1>
        </div>
      </header>

      {!mounted ? (
        <div className="mx-auto max-w-md space-y-4 px-4 pt-4">
          <div className="h-44 animate-pulse rounded-2xl bg-white/70" />
          <div className="h-24 animate-pulse rounded-2xl bg-white/70" />
          <div className="h-24 animate-pulse rounded-2xl bg-white/70" />
        </div>
      ) : recipe ? (
        <RecipeForm
          initialValues={recipe as unknown as RecipeDraft}
          mode="edit"
        />
      ) : (
        <NotFoundCard onBack={() => router.push("/path/recipes")} />
      )}
    </motion.div>
  );
}

function NotFoundCard({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto mt-6 flex max-w-md flex-col items-center gap-4 rounded-2xl border border-dashed border-neutral-200 bg-white/40 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--nourish-green)]/10">
        <ChefHat
          size={24}
          className="text-[var(--nourish-green)]"
          strokeWidth={1.8}
        />
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-[var(--nourish-dark)]">
          Recipe not found
        </p>
        <p className="max-w-[260px] text-xs text-[var(--nourish-subtext)]">
          We couldn&apos;t find this recipe in your saved drafts. It may have
          been removed or saved on a different device.
        </p>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="rounded-xl bg-[var(--nourish-green)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--nourish-dark-green)] active:scale-95"
      >
        Back to My recipes
      </button>
    </div>
  );
}
