"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import {
  ARTICLES,
  EXPERT_VOICES,
  FORUM_THREADS,
  REELS,
  RESEARCH_BRIEFS,
  getFeaturedArticles,
} from "@/data/content";
import { CategoryFilterStrip } from "@/components/content/category-filter-strip";
import { FeaturedHeroCarousel } from "@/components/content/featured-hero-carousel";
import { ReelsRail } from "@/components/content/reels-rail";
import { ReelPlayerSheet } from "@/components/content/reel-player-sheet";
import { ArticleCard } from "@/components/content/article-card";
import { ResearchBriefCard } from "@/components/content/research-brief-card";
import { ExpertVoicesRow } from "@/components/content/expert-voices-row";
import { ForumThreadList } from "@/components/content/forum-thread-list";
import { ContentDisclaimer } from "@/components/content/content-disclaimer";
import { useContentFilter } from "@/lib/hooks/use-content-filter";
import type { Reel } from "@/types/content";

/**
 * Content tab home — Stage 3 lean-vibe magazine surface.
 *
 * Sections render conditionally on the active category pill so the
 * "For You" view shows everything, while the named pills isolate one
 * domain at a time. All content is sample / placeholder editorial copy
 * (see src/data/content/* for source-of-truth and STAGE-3-LEAN-CONTENT.md
 * for the spec).
 */
export default function ContentPage() {
  const router = useRouter();
  const { filter, setFilter } = useContentFilter();
  const [activeReel, setActiveReel] = useState<Reel | null>(null);

  const featured = useMemo(() => getFeaturedArticles(), []);
  const sortedArticles = useMemo(
    () =>
      [...ARTICLES].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [],
  );
  const sortedReels = useMemo(
    () =>
      [...REELS].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [],
  );
  const sortedResearch = useMemo(
    () =>
      [...RESEARCH_BRIEFS].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [],
  );
  const sortedThreads = useMemo(
    () =>
      [...FORUM_THREADS].sort(
        (a, b) =>
          new Date(b.lastActiveAt).getTime() -
          new Date(a.lastActiveAt).getTime(),
      ),
    [],
  );

  const showHero = filter === "for-you" || filter === "articles";
  const showReels = filter === "for-you" || filter === "reels";
  const showArticles = filter === "for-you" || filter === "articles";
  const showResearch = filter === "for-you" || filter === "research";
  const showExperts = filter === "for-you" || filter === "experts";
  const showForum = filter === "for-you" || filter === "forum";

  return (
    <div className="min-h-full bg-[var(--nourish-cream)] pb-32">
      <header className="space-y-3 px-4 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <h1 className="font-serif text-2xl text-[var(--nourish-dark)]">
              Content
            </h1>
            <p className="text-[12px] text-[var(--nourish-subtext)]">
              Cook smarter, eat better — backed by people who know what
              they&rsquo;re talking about.
            </p>
          </div>
          <Link
            href="/community/saved"
            aria-label="Saved content"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--nourish-dark)] shadow-sm border border-neutral-100 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
          >
            <Bookmark size={18} />
          </Link>
        </div>

        <CategoryFilterStrip active={filter} onChange={setFilter} />
      </header>

      <main className="space-y-7 px-4 pt-5">
        {showHero && featured.length > 0 && (
          <FeaturedHeroCarousel articles={featured} />
        )}

        {showReels && (
          <ReelsRail
            reels={sortedReels}
            onSelect={(reel) => setActiveReel(reel)}
            onSeeAll={() => router.push("/community/reels")}
          />
        )}

        {showArticles && (
          <section aria-label="Articles" className="space-y-2">
            <div className="flex items-baseline justify-between px-1">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-subtext)]">
                Articles &amp; blogs
              </h2>
              <span className="text-[10px] text-[var(--nourish-subtext)]/70">
                Long reads
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {sortedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {showResearch && (
          <section aria-label="Research spotlight" className="space-y-2">
            <div className="flex items-baseline justify-between px-1">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-subtext)]">
                Research spotlight
              </h2>
              <span className="text-[10px] text-[var(--nourish-subtext)]/70">
                Plain-language briefs
              </span>
            </div>
            <div className="space-y-2">
              {sortedResearch.map((brief) => (
                <ResearchBriefCard key={brief.id} brief={brief} />
              ))}
            </div>
          </section>
        )}

        {showExperts && <ExpertVoicesRow experts={EXPERT_VOICES} />}

        {showForum && <ForumThreadList threads={sortedThreads} limit={4} />}

        <ContentDisclaimer />
      </main>

      <ReelPlayerSheet reel={activeReel} onClose={() => setActiveReel(null)} />
    </div>
  );
}
