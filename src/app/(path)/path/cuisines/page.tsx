"use client";

/**
 * /path/cuisines — Cuisine fluency grid (polish-week backfill).
 *
 * Sprint K recon target: patterns #2 (eyebrow caps) + #10
 * (made-it ring) on cuisine cards. Each card shows a cuisine
 * glyph wrapped in a progress ring whose fill represents cooks
 * completed in that cuisine, plus an eyebrow-styled label.
 *
 * Tap a card → sub-page (deferred) showing the W44 vocabulary
 * entries for that cuisine. For now, the grid is the main
 * surface; tap is a no-op + visual feedback only.
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { useCookSessions } from "@/lib/hooks/use-cook-sessions";
import { MadeItRing } from "@/components/shared/made-it-ring";
import {
  buildCuisineCardRows,
  countCooksByCuisine,
} from "@/lib/vocabulary/cuisine-stats";
import { listCuisines, parseVocabularyFile } from "@/lib/vocabulary/lookup";
import vocabRaw from "@/data/cuisine-vocabulary.json";

const CATALOG = parseVocabularyFile(vocabRaw);
const CATALOG_CUISINES = listCuisines(CATALOG);

export default function CuisinesPage() {
  const { sessions } = useCookSessions();

  const rows = useMemo(() => {
    const counts = countCooksByCuisine(sessions);
    return buildCuisineCardRows({
      catalogCuisines: CATALOG_CUISINES,
      cookCounts: counts,
    });
  }, [sessions]);

  const reachedFluency = rows.filter((r) => r.count >= r.target).length;
  const inProgress = rows.filter(
    (r) => r.count > 0 && r.count < r.target,
  ).length;

  return (
    <div className="min-h-full bg-[var(--nourish-cream)] pb-24">
      <header className="app-header px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Link
            href="/path"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[var(--nourish-dark)] transition hover:bg-neutral-50"
            aria-label="Back to Path"
          >
            <ArrowLeft size={16} aria-hidden />
          </Link>
          <h1 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
            Cuisines
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-6 px-4 pt-4">
        {/* Identity strip — pattern #4 (identity reinforcement) */}
        <div className="rounded-2xl border border-[var(--nourish-border-strong)] bg-white/70 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
            Your fluency
          </p>
          <p className="mt-1 text-sm text-[var(--nourish-dark)]">
            <span className="font-semibold">{reachedFluency}</span> cuisine
            {reachedFluency === 1 ? "" : "s"} fluent
            {inProgress > 0 && (
              <>
                {" · "}
                <span className="font-semibold text-[var(--nourish-gold)]">
                  {inProgress}
                </span>{" "}
                in progress
              </>
            )}
          </p>
        </div>

        {/* Cuisine grid */}
        <ul className="grid grid-cols-3 gap-3">
          {rows.map((row) => (
            <li key={row.cuisine}>
              <article
                className="flex flex-col items-center gap-2 rounded-2xl border border-neutral-100/80 bg-white p-3 shadow-sm transition hover:border-neutral-200 hover:shadow-md"
                aria-label={`${row.cuisine} — ${row.count} of ${row.target} cooks`}
              >
                <MadeItRing
                  count={row.count}
                  target={row.target}
                  size={56}
                  centerGlyph={row.glyph}
                />
                {/* Eyebrow caps — pattern #2 */}
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
                  {row.cuisine}
                </p>
                <p className="text-xs text-[var(--nourish-dark)]">
                  {row.count}
                  <span className="text-[var(--nourish-subtext)]">
                    /{row.target}
                  </span>
                </p>
              </article>
            </li>
          ))}
        </ul>

        {/* Footer note — keeps the page calm rather than empty
            for users with no cook history yet. */}
        {rows.every((r) => r.count === 0) && (
          <p className="px-2 text-center text-xs text-[var(--nourish-subtext)]">
            Cook your first dish — the rings fill as you go.
          </p>
        )}
      </main>
    </div>
  );
}
