"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Bookmark } from "lucide-react";
import {
  ARTICLES,
  FORUM_THREADS,
  REELS,
  RESEARCH_BRIEFS,
} from "@/data/content";
import { useContentBookmarks } from "@/lib/hooks/use-content-bookmarks";
import { ArticleCard } from "@/components/content/article-card";
import { ResearchBriefCard } from "@/components/content/research-brief-card";
import { ForumThreadList } from "@/components/content/forum-thread-list";
import { ReelsRail } from "@/components/content/reels-rail";
import { ReelPlayerSheet } from "@/components/content/reel-player-sheet";
import { BackLink } from "@/components/content/back-link";
import { ContentDisclaimer } from "@/components/content/content-disclaimer";
import { useState } from "react";
import type { Reel } from "@/types/content";

export default function SavedContentPage() {
  const { bookmarks } = useContentBookmarks();
  const [activeReel, setActiveReel] = useState<Reel | null>(null);

  const savedArticles = useMemo(() => {
    const ids = new Set(
      bookmarks.filter((b) => b.kind === "articles").map((b) => b.id),
    );
    return ARTICLES.filter((a) => ids.has(a.id));
  }, [bookmarks]);

  const savedReels = useMemo(() => {
    const ids = new Set(
      bookmarks.filter((b) => b.kind === "reels").map((b) => b.id),
    );
    return REELS.filter((r) => ids.has(r.id));
  }, [bookmarks]);

  const savedResearch = useMemo(() => {
    const ids = new Set(
      bookmarks.filter((b) => b.kind === "research").map((b) => b.id),
    );
    return RESEARCH_BRIEFS.filter((b) => ids.has(b.id));
  }, [bookmarks]);

  const savedThreads = useMemo(() => {
    const ids = new Set(
      bookmarks.filter((b) => b.kind === "forum").map((b) => b.id),
    );
    return FORUM_THREADS.filter((t) => ids.has(t.id));
  }, [bookmarks]);

  const totalSaved =
    savedArticles.length +
    savedReels.length +
    savedResearch.length +
    savedThreads.length;

  return (
    <div className="min-h-full bg-[var(--nourish-cream)] pb-32">
      <div className="px-4 pt-5">
        <BackLink />
      </div>

      <header className="space-y-1 px-4 pt-3">
        <h1 className="font-serif text-2xl text-[var(--nourish-dark)]">
          Saved
        </h1>
        <p className="text-[12px] text-[var(--nourish-subtext)]">
          {totalSaved === 0
            ? "Tap the bookmark on any article, reel, brief, or thread to save it here."
            : `${totalSaved} saved item${totalSaved === 1 ? "" : "s"}.`}
        </p>
      </header>

      <main className="space-y-7 px-4 pt-5">
        {totalSaved === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white p-8 text-center shadow-sm">
            <Bookmark size={32} className="text-[var(--nourish-subtext)]/60" />
            <p className="text-sm text-[var(--nourish-subtext)]">
              Nothing saved yet.
            </p>
            <Link
              href="/community"
              className="rounded-full bg-[var(--nourish-green)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--nourish-dark-green)]"
            >
              Browse Content
            </Link>
          </div>
        )}

        {savedArticles.length > 0 && (
          <section className="space-y-2">
            <h2 className="px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-subtext)]">
              Saved articles
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {savedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {savedReels.length > 0 && (
          <ReelsRail
            reels={savedReels}
            onSelect={(reel) => setActiveReel(reel)}
          />
        )}

        {savedResearch.length > 0 && (
          <section className="space-y-2">
            <h2 className="px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-subtext)]">
              Saved research
            </h2>
            <div className="space-y-2">
              {savedResearch.map((brief) => (
                <ResearchBriefCard key={brief.id} brief={brief} />
              ))}
            </div>
          </section>
        )}

        {savedThreads.length > 0 && (
          <ForumThreadList threads={savedThreads} limit={savedThreads.length} />
        )}

        <ContentDisclaimer />
      </main>

      <ReelPlayerSheet reel={activeReel} onClose={() => setActiveReel(null)} />
    </div>
  );
}
