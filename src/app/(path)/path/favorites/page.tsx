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
  useEffect(() => setMounted(true), []);

  const handleReplay = useCallback(
    (slug: string) => {
      router.push(`/cook/${slug}`);
    },
    [router]
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
          <div className="rounded-xl border border-neutral-100 bg-white p-8 text-center mt-8">
            <p className="text-sm text-[var(--nourish-subtext)]">
              No favorites yet.
            </p>
            <p className="text-xs text-[var(--nourish-subtext)] mt-1">
              Tap the heart on any cook to save it here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
