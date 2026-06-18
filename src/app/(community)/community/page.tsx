"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Users, ChevronRight, X, Trophy } from "lucide-react";
import { ActiveChallengeBanner } from "@/components/community/active-challenge-banner";
import {
  ARTICLES,
  EXPERT_VOICES,
  FORUM_THREADS,
  REELS,
  RESEARCH_BRIEFS,
} from "@/data/content";
import { FeaturedHero } from "@/components/content/featured-hero";
import { ReelsRail } from "@/components/content/reels-rail";
import { ArticleCard } from "@/components/content/article-card";
import { ResearchBriefCard } from "@/components/content/research-brief-card";
import { ExpertVoicesRow } from "@/components/content/expert-voices-row";
import { ForumThreadList } from "@/components/content/forum-thread-list";
import { ContentDisclaimer } from "@/components/content/content-disclaimer";

/**
 * Community tab home: a cooking-content surface for reels, learning, and reads.
 *
 * A single curated feed keeps the top-level navigation small: Watch, Learn,
 * Experts, and Ask. The individual routes still exist for deeper reading.
 */
export default function CommunityPage() {
  const router = useRouter();

  // Tag filter (restored): article #tags deep-link to /community?tag=X. Read it
  // client-side (no Suspense constraint) and narrow the Learn list, with a clear
  // chip — the lightweight tag-discovery view, no TagCloud revival needed.
  const [tag, setTag] = useState<string | null>(null);
  /* eslint-disable react-hooks/set-state-in-effect -- read ?tag= from the URL on mount */
  useEffect(() => {
    setTag(new URLSearchParams(window.location.search).get("tag"));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

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
  // Featured story: the flagged article, else the most recent.
  const featured = useMemo(
    () => sortedArticles.find((a) => a.featured) ?? sortedArticles[0],
    [sortedArticles],
  );
  const articlesToShow = useMemo(
    () =>
      tag ? sortedArticles.filter((a) => a.tags.includes(tag)) : sortedArticles,
    [tag, sortedArticles],
  );

  return (
    <div className="min-h-full bg-[var(--nourish-cream)] pb-32">
      <header className="space-y-4 page-x pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <h1 className="sous-title text-[var(--nourish-dark)]">Content</h1>
            <p className="text-[12px] text-[var(--nourish-subtext)]">
              Watch, learn, and ask better cooking questions.
            </p>
          </div>
          <Link
            href="/community/saved"
            aria-label="Saved content"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--nourish-dark)] hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
          >
            <Bookmark size={18} />
          </Link>
        </div>

        <CommunitySectionNav />
      </header>

      <main className="space-y-8 page-x pt-5">
        {/* Featured — the one highlighted story at the very top. */}
        {featured && <FeaturedHero article={featured} />}

        {/* Seasonal/sponsored challenge banner — self-hides when none is active
            (restored: was built but never rendered). */}
        <ActiveChallengeBanner />

        {/* Group challenge — minimal entry (rule 13: a button, not an
            explainer; the pod page details it on tap). */}
        <Link
          href="/community/pod"
          className="flex items-center gap-2.5 rounded-2xl border border-[var(--nourish-green)]/20 bg-white px-4 py-3 transition hover:border-[var(--nourish-green)]/40"
        >
          <Users
            size={18}
            className="shrink-0 text-[var(--nourish-green)]"
            strokeWidth={1.9}
            aria-hidden
          />
          <span className="flex-1 text-sm font-semibold text-[var(--nourish-dark)]">
            Group Challenge
          </span>
          <ChevronRight
            size={18}
            className="shrink-0 text-[var(--nourish-subtext)]"
            aria-hidden
          />
        </Link>

        {/* Leaderboard — restore an inbound link (the page existed but was
            unreachable). Slim, subordinate to the Group Challenge entry. */}
        <Link
          href="/community/leaderboard"
          className="flex items-center gap-2 px-1 text-[12px] font-medium text-[var(--nourish-subtext)] transition hover:text-[var(--nourish-green)]"
        >
          <Trophy
            size={14}
            className="shrink-0"
            strokeWidth={1.9}
            aria-hidden
          />
          <span className="flex-1">This week’s leaderboard</span>
          <ChevronRight size={14} className="shrink-0" aria-hidden />
        </Link>

        <div id="watch" className="scroll-mt-24">
          <ReelsRail
            reels={sortedReels}
            onSelect={(reel) =>
              router.push(`/community/reels?start=${reel.id}`)
            }
            onSeeAll={() => router.push("/community/reels")}
          />
        </div>

        <section
          id="learn"
          aria-label="Learn"
          className="scroll-mt-24 space-y-4"
        >
          <SectionHeader
            title="Learn"
            subtitle="Readable cooking ideas and plain-English food research."
          />
          {tag && (
            <button
              type="button"
              onClick={() => {
                setTag(null);
                router.replace("/community");
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--nourish-green)]/10 px-3 py-1.5 text-[12px] font-semibold text-[var(--nourish-green)]"
              aria-label={`Clear the #${tag} filter`}
            >
              Tagged #{tag}
              <X size={13} aria-hidden />
            </button>
          )}
          <div className="grid grid-cols-2 gap-3">
            {articlesToShow.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
            {tag && articlesToShow.length === 0 && (
              <p className="col-span-2 text-[13px] text-[var(--nourish-subtext)]">
                No reads tagged #{tag} yet.
              </p>
            )}
          </div>
          <div className="space-y-2">
            {sortedResearch.map((brief) => (
              <ResearchBriefCard key={brief.id} brief={brief} />
            ))}
          </div>
        </section>

        <div id="experts" className="scroll-mt-24">
          <ExpertVoicesRow experts={EXPERT_VOICES} />
        </div>

        <div id="questions" className="scroll-mt-24">
          <ForumThreadList threads={sortedThreads} limit={4} />
        </div>

        <ContentDisclaimer />
      </main>
    </div>
  );
}

function CommunitySectionNav() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <nav
      aria-label="Community sections"
      className="flex items-center justify-between border-y border-[var(--nourish-border)] py-2 text-[13px] font-medium"
    >
      <button
        type="button"
        onClick={() => scrollTo("watch")}
        className="inline-flex min-h-[44px] items-center rounded-full px-2.5 py-1.5 text-[var(--nourish-subtext)] hover:bg-white/70 hover:text-[var(--nourish-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
      >
        Watch
      </button>
      <button
        type="button"
        onClick={() => scrollTo("learn")}
        className="inline-flex min-h-[44px] items-center rounded-full px-2.5 py-1.5 text-[var(--nourish-subtext)] hover:bg-white/70 hover:text-[var(--nourish-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
      >
        Learn
      </button>
      <button
        type="button"
        onClick={() => scrollTo("experts")}
        className="inline-flex min-h-[44px] items-center rounded-full px-2.5 py-1.5 text-[var(--nourish-subtext)] hover:bg-white/70 hover:text-[var(--nourish-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
      >
        Experts
      </button>
      <button
        type="button"
        onClick={() => scrollTo("questions")}
        className="inline-flex min-h-[44px] items-center rounded-full px-2.5 py-1.5 text-[var(--nourish-subtext)] hover:bg-white/70 hover:text-[var(--nourish-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
      >
        Ask
      </button>
    </nav>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-0.5 px-1">
      <h2 className="font-serif text-xl text-[var(--nourish-dark)]">{title}</h2>
      <p className="text-[12px] leading-snug text-[var(--nourish-subtext)]">
        {subtitle}
      </p>
    </div>
  );
}
