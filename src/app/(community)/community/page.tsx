"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Bookmark, X } from "lucide-react";
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
// Reel player sheet retired in W22b — Reels now live in the immersive
// vertical feed at /community/reels (deep-linked via #reel-id).
import { ArticleCard } from "@/components/content/article-card";
import { ResearchBriefCard } from "@/components/content/research-brief-card";
import { ExpertVoicesRow } from "@/components/content/expert-voices-row";
import { ForumThreadList } from "@/components/content/forum-thread-list";
import { ContentDisclaimer } from "@/components/content/content-disclaimer";
import { PodTile } from "@/components/community/pod-tile";
import { TagCloud } from "@/components/content/tag-cloud";
import { useContentFilter } from "@/lib/hooks/use-content-filter";
import { useParentMode } from "@/lib/hooks/use-parent-mode";
import { rankForParentMode } from "@/lib/content/parent-track";
import { SectionKicker } from "@/components/shared/section-kicker";

/** Cap the For-You view at this many cards per category before
 *  showing a "See all" link that switches to the dedicated tab.
 *  Codifies the pagination decision from STAGE-3-RETROSPECTIVE.md
 *  ("17 Stanford articles is starting to feel substantial"). */
const FOR_YOU_ARTICLE_LIMIT = 6;
const FOR_YOU_RESEARCH_LIMIT = 3;

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
  // useSearchParams must be wrapped in Suspense for static prerender
  // to succeed (Next 16 / Turbopack requirement). The fallback uses
  // the same shell as the inner page so the FOUC is invisible.
  return (
    <Suspense
      fallback={
        <div className="min-h-full bg-[var(--nourish-cream)] pb-32">
          <header className="space-y-3 px-4 pt-6">
            <div className="space-y-0.5">
              <h1 className="font-serif text-2xl text-[var(--nourish-dark)]">
                Content
              </h1>
              <p className="text-[12px] text-[var(--nourish-subtext)]">
                Loading…
              </p>
            </div>
          </header>
        </div>
      }
    >
      <ContentPageInner />
    </Suspense>
  );
}

function ContentPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");
  const { filter, setFilter } = useContentFilter();
  // Parent Mode promotes audience: 'parent' items to the top of every
  // mixed list. (Stage 2 W12.)
  const { profile } = useParentMode();

  const featured = useMemo(() => getFeaturedArticles(), []);
  const sortedArticles = useMemo(() => {
    const ranked = rankForParentMode(
      [...ARTICLES].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
      profile.enabled,
    );
    if (!activeTag) return ranked;
    // Tag-filter view: keep only articles that carry the active tag.
    // Case-insensitive match — the tag URL param is whatever the user
    // tapped on the article-detail page.
    const needle = activeTag.toLowerCase();
    return ranked.filter((a) => a.tags.some((t) => t.toLowerCase() === needle));
  }, [profile.enabled, activeTag]);
  const sortedReels = useMemo(
    () =>
      rankForParentMode(
        [...REELS].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
        profile.enabled,
      ),
    [profile.enabled],
  );
  const sortedResearch = useMemo(
    () =>
      rankForParentMode(
        [...RESEARCH_BRIEFS].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
        profile.enabled,
      ),
    [profile.enabled],
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

  // When a tag is active, narrow the view to articles only — the
  // tag is an article-side concept, so the other section types
  // (reels, research, experts, forum) would be misleading next to a
  // filtered article grid.
  const tagFilterActive = !!activeTag;
  const showHero =
    !tagFilterActive && (filter === "for-you" || filter === "articles");
  const showReels =
    !tagFilterActive && (filter === "for-you" || filter === "reels");
  const showArticles =
    tagFilterActive || filter === "for-you" || filter === "articles";
  const showResearch =
    !tagFilterActive && (filter === "for-you" || filter === "research");
  const showExperts =
    !tagFilterActive && (filter === "for-you" || filter === "experts");
  const showForum =
    !tagFilterActive && (filter === "for-you" || filter === "forum");

  return (
    <div className="min-h-full bg-[var(--nourish-cream)] pb-32">
      <header className="space-y-3 px-4 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <h1 className="font-serif text-2xl text-[var(--nourish-dark)]">
              Community
            </h1>
          </div>
          <Link
            href="/community/saved"
            aria-label="Saved"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--nourish-dark)] shadow-sm border border-neutral-100 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
          >
            <Bookmark size={18} />
          </Link>
        </div>

        {tagFilterActive && (
          <div className="flex items-center justify-between gap-2 rounded-2xl bg-[var(--nourish-green)]/8 px-3 py-2">
            <p className="flex flex-wrap items-center gap-1.5 text-[12px] text-[var(--nourish-dark)]">
              <span className="text-[var(--nourish-subtext)]">
                Showing articles tagged
              </span>
              <span className="font-bold text-[var(--nourish-green)]">
                #{activeTag}
              </span>
              <span className="tabular-nums text-[var(--nourish-subtext)]">
                ({sortedArticles.length})
              </span>
            </p>
            <Link
              href="/community"
              className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--nourish-subtext)] ring-1 ring-neutral-200 hover:text-[var(--nourish-dark)]"
              aria-label="Clear tag filter"
            >
              Clear
              <X size={11} aria-hidden />
            </Link>
          </div>
        )}
      </header>

      <main className="space-y-7 px-4 pt-5">
        {/* Pod CTA leads — social cooking is the engagement core
            of the Community tab. Editorial content sits below as
            a quiet shelf, not as the hero. */}
        <PodTile />

        {/* Category filter strip moved here from header — it's
            for the editorial shelf below, not the social header. */}
        <CategoryFilterStrip active={filter} onChange={setFilter} />

        {showHero && featured.length > 0 && (
          <FeaturedHeroCarousel articles={featured} />
        )}

        {showReels && (
          <ReelsRail
            reels={sortedReels}
            onSelect={(reel) => router.push(`/community/reels#${reel.id}`)}
            onSeeAll={() => router.push("/community/reels")}
          />
        )}

        {showArticles && (
          <section aria-label="Articles" className="space-y-2">
            <div className="flex items-baseline justify-between px-1">
              <SectionKicker>Articles &amp; blogs</SectionKicker>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(!tagFilterActive && filter === "for-you"
                ? sortedArticles.slice(0, FOR_YOU_ARTICLE_LIMIT)
                : sortedArticles
              ).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            {!tagFilterActive &&
              filter === "for-you" &&
              sortedArticles.length > FOR_YOU_ARTICLE_LIMIT && (
                <button
                  type="button"
                  onClick={() => setFilter("articles")}
                  className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-[var(--nourish-green)] ring-1 ring-[var(--nourish-green)]/20 hover:ring-[var(--nourish-green)]/40"
                >
                  See all {sortedArticles.length} articles →
                </button>
              )}
            {tagFilterActive && sortedArticles.length === 0 && (
              <p className="rounded-2xl border border-dashed border-neutral-200 bg-white/60 px-5 py-7 text-center text-[12px] text-[var(--nourish-subtext)]">
                No articles tagged{" "}
                <span className="font-semibold text-[var(--nourish-dark)]">
                  #{activeTag}
                </span>
                . Tap{" "}
                <span className="font-semibold text-[var(--nourish-green)]">
                  Clear
                </span>{" "}
                above to see everything.
              </p>
            )}
          </section>
        )}

        {showResearch && (
          <section aria-label="Research spotlight" className="space-y-2">
            <div className="flex items-baseline justify-between px-1">
              <SectionKicker>Research spotlight</SectionKicker>
            </div>
            <div className="space-y-2">
              {(filter === "for-you"
                ? sortedResearch.slice(0, FOR_YOU_RESEARCH_LIMIT)
                : sortedResearch
              ).map((brief) => (
                <ResearchBriefCard key={brief.id} brief={brief} />
              ))}
            </div>
            {filter === "for-you" &&
              sortedResearch.length > FOR_YOU_RESEARCH_LIMIT && (
                <button
                  type="button"
                  onClick={() => setFilter("research")}
                  className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-[var(--nourish-green)] ring-1 ring-[var(--nourish-green)]/20 hover:ring-[var(--nourish-green)]/40"
                >
                  See all {sortedResearch.length} briefs →
                </button>
              )}
          </section>
        )}

        {showExperts && <ExpertVoicesRow experts={EXPERT_VOICES} />}

        {showForum && <ForumThreadList threads={sortedThreads} limit={4} />}

        {/* W9: tag cloud for discovery. Only renders on the For-You
            view (not when a tag is already selected — would be
            self-referential — and not on category-isolated views
            where the user has already narrowed). Sources tags from
            the FULL article corpus, not the parent-mode-ranked
            sortedArticles, so the cloud reflects the catalog rather
            than the current filter. */}
        {!tagFilterActive && filter === "for-you" && (
          <TagCloud articles={ARTICLES} limit={12} />
        )}

        <ContentDisclaimer />
      </main>
    </div>
  );
}
