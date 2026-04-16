"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Heart } from "lucide-react";
import { ScrapbookEntryCard } from "@/components/path/scrapbook-entry-card";
import { useCookSessions } from "@/lib/hooks/use-cook-sessions";
import { stableEvaluatorScores } from "@/lib/utils/scrapbook-evaluator";

/**
 * Favorites — filtered view of favorite cooks only.
 */
export default function FavoritesPage() {
  const { favoriteSessions, toggleFavorite } = useCookSessions();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard: must set state after mount to avoid SSR/client mismatch
  useEffect(() => setMounted(true), []);

  const handleReplay = useCallback(
    (slug: string) => {
      router.push(`/cook/${slug}`);
    },
    [router],
  );

  return (
    <div className="min-h-full bg-[var(--nourish-cream)]">
      {/* Header */}
      <header className="app-header px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <motion.button
            onClick={() => router.push("/path")}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[var(--nourish-dark)] transition hover:bg-neutral-50"
            type="button"
            aria-label="Back to Path"
          >
            <ArrowLeft size={18} />
          </motion.button>
          <h1 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
            Favorites
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-md px-4 pt-4 pb-28 space-y-2">
        {!mounted ? (
          <div className="space-y-2 animate-pulse">
            <div className="rounded-xl bg-neutral-100 h-20" />
            <div className="rounded-xl bg-neutral-100 h-20" />
          </div>
        ) : favoriteSessions.length > 0 ? (
          favoriteSessions.map((session, idx) => (
            <ScrapbookEntryCard
              key={session.sessionId}
              session={session}
              onReplay={handleReplay}
              onToggleFavorite={toggleFavorite}
              index={idx}
              evaluatorScores={stableEvaluatorScores(
                session.sessionId,
                session.rating,
              )}
            />
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="flex flex-col items-center gap-4 surface-card px-6 py-12 text-center mt-8"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50">
              <Heart size={24} className="text-pink-400" strokeWidth={1.8} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--nourish-dark)]">
                No favorites yet
              </p>
              <p className="text-xs text-[var(--nourish-subtext)] max-w-[220px]">
                Tap the heart on any dish to save it here — your go-to cooks,
                always one tap away.
              </p>
            </div>
            <motion.button
              onClick={() => router.push("/today")}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="mt-1 rounded-xl bg-[var(--nourish-green)] px-5 py-2.5 text-sm font-semibold text-white cta-shadow transition-colors hover:bg-[var(--nourish-dark-green)]"
              type="button"
            >
              Find something to cook →
            </motion.button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
