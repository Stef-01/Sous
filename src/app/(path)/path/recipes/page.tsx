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
import { ArrowLeft, ChefHat, Pencil, Play, Plus, Sparkles } from "lucide-react";
import { useRecipeDrafts } from "@/lib/recipe-authoring/use-recipe-drafts";
import { RECIPE_TEMPLATES } from "@/lib/recipe-authoring/templates";
import {
  matchesRecipeFilter,
  useRecipeFilter,
} from "@/lib/recipe-authoring/use-recipe-filter";
import { RecipeFilterChips } from "@/components/recipe-authoring/recipe-filter-chips";
import { SectionKicker } from "@/components/shared/section-kicker";

export default function MyRecipesPage() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { drafts, mounted } = useRecipeDrafts();
  // W47 source filter — chip row drives both the templates row
  // (treated as nourish-verified) and the user-drafts list.
  const { filter } = useRecipeFilter();
  const filteredDrafts = drafts.filter((d) =>
    matchesRecipeFilter(d.source, filter),
  );

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
          <div className="ml-auto flex items-center gap-1.5">
            <Link
              href="/path/recipes/quick-add"
              className="inline-flex items-center gap-1 rounded-full border border-[var(--nourish-green)]/30 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[var(--nourish-green)] transition hover:bg-[var(--nourish-green)]/5"
              title="Describe a recipe in plain text — autogen drafts it"
            >
              <Sparkles size={11} aria-hidden /> Quick
            </Link>
            <Link
              href="/path/recipes/new"
              className="inline-flex items-center gap-1 rounded-full bg-[var(--nourish-green)] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[var(--nourish-dark-green)]"
            >
              <Plus size={12} aria-hidden /> New
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-6 px-4 pt-4">
        {/* W47 source-filter chip row — pivots both the templates
            row (Nourish-verified) and the user-drafts list. */}
        <RecipeFilterChips className="px-1" />

        {/* W43 templates — visible whenever the filter accepts
            Nourish-verified recipes (i.e. "all" or "nourish-
            verified"). Hidden under "mine" / "community" so the
            user sees only what they're filtering for. */}
        {(filter === "all" || filter === "nourish-verified") && (
          <TemplatesRow />
        )}

        {!mounted ? (
          // Pre-hydration skeleton — matches the height of one card so
          // the page doesn't jump when localStorage resolves.
          <div className="h-24 animate-pulse rounded-2xl bg-white/70" />
        ) : filteredDrafts.length === 0 ? (
          drafts.length === 0 ? (
            <EmptyState onCreate={() => router.push("/path/recipes/new")} />
          ) : (
            <FilteredEmptyState filter={filter} />
          )
        ) : (
          <ul className="space-y-3">
            {filteredDrafts.map((recipe) => (
              <li
                key={recipe.id}
                className="rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <SectionKicker as="p" size="10px">
                    {recipe.cuisineFamily}
                  </SectionKicker>
                  <SourceBadge source={recipe.source} />
                </div>
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
                {/* W31 actions row — Cook (primary) + Edit (secondary).
                    Cook navigates to /cook/<slug>; the cook step
                    page falls back to user recipes when the seed
                    catalog has no match. */}
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/cook/${recipe.slug}`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--nourish-green)] py-2 text-xs font-semibold text-white transition hover:bg-[var(--nourish-dark-green)]"
                  >
                    <Play size={12} aria-hidden /> Cook
                  </Link>
                  <Link
                    href={`/path/recipes/${recipe.id}/edit`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-medium text-[var(--nourish-subtext)] transition hover:border-neutral-300 hover:text-[var(--nourish-dark)]"
                  >
                    <Pencil size={12} aria-hidden /> Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </motion.div>
  );
}

function TemplatesRow() {
  return (
    <section className="space-y-2">
      <SectionKicker className="px-1">Start from a template</SectionKicker>
      <div className="-mx-4 overflow-x-auto px-4">
        <ul className="flex w-max gap-2 pb-1">
          {RECIPE_TEMPLATES.map((t) => (
            <li key={t.slug} className="w-44 shrink-0">
              <Link
                href={`/path/recipes/new?fork=${t.slug}`}
                className="flex h-full flex-col gap-1 rounded-2xl border border-neutral-100/80 bg-white p-3 shadow-sm transition hover:border-neutral-200 hover:shadow-md"
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
                  {t.cuisine}
                </span>
                <span className="font-serif text-sm font-semibold text-[var(--nourish-dark)]">
                  {t.name}
                </span>
                <span className="line-clamp-2 text-[11px] text-[var(--nourish-subtext)]">
                  {t.pitch}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SourceBadge({
  source,
}: {
  source: "user" | "community" | "nourish-verified";
}) {
  if (source === "user") return null; // no badge for own recipes
  if (source === "nourish-verified") {
    return (
      <span
        title="Nourish-verified"
        className="inline-flex items-center rounded-full bg-[var(--nourish-green)]/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-[var(--nourish-green)]"
      >
        Nourish ✓
      </span>
    );
  }
  return (
    <span
      title="Community recipe (awaiting Nourish verification)"
      className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-700"
    >
      Community
    </span>
  );
}

function FilteredEmptyState({
  filter,
}: {
  filter: "mine" | "community" | "nourish-verified" | "all";
}) {
  const label =
    filter === "mine"
      ? "your authored recipes"
      : filter === "community"
        ? "community recipes"
        : filter === "nourish-verified"
          ? "Nourish-verified recipes"
          : "recipes";
  return (
    <div className="rounded-2xl border border-dashed border-neutral-200 bg-white/40 px-4 py-6 text-center">
      <p className="text-sm font-semibold text-[var(--nourish-dark)]">
        No {label} yet
      </p>
      <p className="mt-1 text-xs text-[var(--nourish-subtext)]">
        Switch the filter to see other recipes, or add a new one.
      </p>
    </div>
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
