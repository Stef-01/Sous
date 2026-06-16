"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Search, ChefHat, X, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils/cn";

interface SideRow {
  slug: string;
  name: string;
  tags: string[];
  cuisineFamily: string;
  imageUrl: string | null;
  hasGuidedCook: boolean;
}

/**
 * Pure filter: match sides by name or tag against a query (case-insensitive,
 * trimmed). Empty query returns the list unchanged. Exported for unit tests.
 */
export function filterSides<T extends { name: string; tags: string[] }>(
  sides: T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return sides;
  return sides.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q)),
  );
}

/**
 * Minimalist side search (Feature B): one search box over every cookable side,
 * filtered client-side for instant results, tap → guided cook. Rendered at
 * `/sides` when no `?main` is present. No pairing, no main — just "find a side
 * and cook it."
 */
export function SideSearch() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const { data, isLoading } = trpc.pairing.listSides.useQuery(undefined, {
    staleTime: Infinity,
  });

  // Only cookable sides — a search result must lead to a guided cook.
  const cookable = useMemo(
    () =>
      ((data as SideRow[] | undefined) ?? []).filter((s) => s.hasGuidedCook),
    [data],
  );
  const results = useMemo(
    () => filterSides(cookable, query),
    [cookable, query],
  );

  return (
    <motion.div
      className="min-h-dvh bg-[var(--nourish-cream)] pb-8"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="app-header page-x py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <motion.button
            type="button"
            onClick={() => router.back()}
            whileTap={reducedMotion ? undefined : { scale: 0.88 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[var(--nourish-dark)] transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </motion.button>
          <div className="min-w-0 flex-1">
            <p className="sous-label">Find a side</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-3 page-x pt-4">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--nourish-subtext)]"
          />
          {}
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sides…"
            aria-label="Search sides"
            className="w-full rounded-full border border-[var(--nourish-border)] bg-white py-3 pl-10 pr-10 text-[15px] text-[var(--nourish-dark)] placeholder:text-[var(--nourish-subtext)] focus:border-[var(--nourish-green)] focus:outline-none focus:ring-2 focus:ring-[var(--nourish-green)]/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--nourish-subtext)] hover:bg-neutral-100"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-3"
              >
                <div className="h-12 w-12 shrink-0 rounded-lg shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-28 rounded shimmer" />
                  <div className="h-2.5 w-20 rounded shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-xl border border-neutral-100 bg-white p-6 text-center">
            <Search
              size={26}
              className="mx-auto mb-2 text-[var(--nourish-subtext)]"
            />
            <p className="text-sm text-[var(--nourish-subtext)]">
              No sides match “{query.trim()}”.
            </p>
          </div>
        ) : (
          <ul className="space-y-2" aria-label="Sides">
            {results.map((s) => (
              <li key={s.slug}>
                <button
                  type="button"
                  onClick={() => router.push(`/cook/${s.slug}`)}
                  className="flex w-full items-center gap-3 rounded-xl border border-neutral-100 bg-white p-2.5 text-left transition hover:border-[var(--nourish-green)]/40 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
                >
                  <SideThumb name={s.name} imageUrl={s.imageUrl} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[var(--nourish-dark)]">
                      {s.name}
                    </span>
                    <span className="block truncate text-xs capitalize text-[var(--nourish-subtext)]">
                      {s.cuisineFamily.replace(/-/g, " ")}
                    </span>
                  </span>
                  <ChevronRight
                    size={18}
                    className="shrink-0 text-[var(--nourish-subtext)]"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </motion.div>
  );
}

function SideThumb({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl: string | null;
}) {
  const [err, setErr] = useState(false);
  if (imageUrl && !err) {
    return (
      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="48px"
          className="object-cover"
          onError={() => setErr(true)}
        />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
      )}
      style={{
        background:
          "linear-gradient(135deg, var(--nourish-green) 0%, var(--nourish-dark-green) 100%)",
      }}
      aria-hidden
    >
      <ChefHat size={18} className="text-white/90" />
    </span>
  );
}
