"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ScrapbookEntryCard } from "@/components/path/scrapbook-entry-card";
import { useCookSessions } from "@/lib/hooks/use-cook-sessions";

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
      <header className="border-b border-neutral-100/80 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button
            onClick={() => router.push("/path")}
            className="rounded-lg p-1.5 text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)] transition-colors"
            type="button"
          >
            <ArrowLeft size={20} />
          </button>
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
            />
          ))
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-100 bg-white px-6 py-12 text-center mt-8">
            <span className="text-4xl">🤍</span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--nourish-dark)]">
                No favorites yet
              </p>
              <p className="text-xs text-[var(--nourish-subtext)] max-w-[220px]">
                Tap the heart on any dish to save it here — your go-to cooks,
                always one tap away.
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="mt-1 rounded-xl bg-[var(--nourish-green)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--nourish-dark-green)]"
              type="button"
            >
              Find something to cook →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
