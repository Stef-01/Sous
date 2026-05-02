"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { BackLink } from "@/components/content/back-link";
import { ContentDisclaimer } from "@/components/content/content-disclaimer";
import { SectionKicker } from "@/components/shared/section-kicker";
import { EmptyStateCTA } from "@/components/shared/empty-state-cta";

export default function SavedContentPage() {
  const router = useRouter();
  const { bookmarks } = useContentBookmarks();

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
          <EmptyStateCTA
            icon={Bookmark}
            iconSize={32}
            primary="Nothing saved yet."
            helper="Tap the bookmark on any article, reel, brief, or thread to save it here."
            cta={{ label: "Browse Content" }}
            href="/community"
          />
        )}

        {savedArticles.length > 0 && (
          <section className="space-y-2">
            <SectionKicker className="px-1">Saved articles</SectionKicker>
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
            onSelect={(reel) => router.push(`/community/reels#${reel.id}`)}
          />
        )}

        {savedResearch.length > 0 && (
          <section className="space-y-2">
            <SectionKicker className="px-1">Saved research</SectionKicker>
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
    </div>
  );
}
