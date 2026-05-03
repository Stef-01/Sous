"use client";

/**
 * /path/recipes — list view of user-authored recipes.
 *
 * W28 follow-on to W27 (the /path/recipes/new author surface).
 * The W27 success toast points users here ("Find it under Path →
 * My recipes") so this page closes the navigation loop.
 *
 * Reads from the W24 `useRecipeDrafts` localStorage hook. No
 * server round-trip — the founder-unlock Postgres swap is post-
 * W52 per the runbook.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ChefHat, Plus } from "lucide-react";
import { useRecipeDrafts } from "@/lib/recipe-authoring/use-recipe-drafts";
import { SectionKicker } from "@/components/shared/section-kicker";

export default function MyRecipesPage() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { drafts, mounted } = useRecipeDrafts();

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
            My recipes
          </h1>
          <Link
            href="/path/recipes/new"
            className="ml-auto inline-flex items-center gap-1 rounded-full bg-[var(--nourish-green)] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[var(--nourish-dark-green)]"
          >
            <Plus size={12} aria-hidden /> New
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pt-4">
        {!mounted ? (
          // Pre-hydration skeleton — matches the height of one card so
          // the page doesn't jump when localStorage resolves.
          <div className="h-24 animate-pulse rounded-2xl bg-white/70" />
        ) : drafts.length === 0 ? (
          <EmptyState onCreate={() => router.push("/path/recipes/new")} />
        ) : (
          <ul className="space-y-3">
            {drafts.map((recipe) => (
              <li key={recipe.id}>
                <Link
                  href={`/path/recipes/${recipe.id}/edit`}
                  className="block rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm transition hover:border-neutral-200 hover:shadow-md"
                >
                  <SectionKicker as="p" size="10px">
                    {recipe.cuisineFamily}
                  </SectionKicker>
                  <h2 className="mt-1 font-serif text-base font-semibold text-[var(--nourish-dark)]">
                    {recipe.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--nourish-subtext)]">
                    {recipe.description}
                  </p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.06em] text-[var(--nourish-subtext)]/70">
                    {recipe.ingredients.length} ingredients ·{" "}
                    {recipe.steps.length} steps · serves {recipe.serves}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </motion.div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-neutral-200 bg-white/40 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--nourish-green)]/10">
        <ChefHat
          size={24}
          className="text-[var(--nourish-green)]"
          strokeWidth={1.8}
        />
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-[var(--nourish-dark)]">
          No recipes yet
        </p>
        <p className="text-xs text-[var(--nourish-subtext)] max-w-[260px]">
          Save the dishes you cook from memory or adapt from elsewhere. Each one
          becomes a guided cook flow you can return to.
        </p>
      </div>
      <button
        type="button"
        onClick={onCreate}
        className="rounded-xl bg-[var(--nourish-green)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--nourish-dark-green)] active:scale-95"
      >
        Add your first recipe
      </button>
    </div>
  );
}
