"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Bookmark, Users, ChevronRight, X, Trophy } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SectionHeader } from "@/components/content/section-header";
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
      <header className="page-x pt-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="sous-label text-[var(--nourish-green)]">
              The Kitchen
            </p>
            <h1 className="sous-title mt-1 text-[var(--nourish-dark)]">
              Content
            </h1>
          </div>
          <Link
            href="/community/saved"
            aria-label="Saved content"
            className="-mr-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--nourish-dark)] transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
          >
            <Bookmark size={18} />
          </Link>
        </div>
      </header>

      {/* Sticky in-page nav — a pinned segmented control. Sits OUTSIDE the
          padded header so its hairline + blur span the full column width. */}
      <div className="sticky top-0 z-20 mt-3 border-b border-[var(--nourish-border)] bg-[var(--nourish-cream)]/85 backdrop-blur-md">
        <div className="page-x py-2">
          <CommunitySectionNav />
        </div>
      </div>

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
          <SectionHeader eyebrow="Read" title="Learn" />
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

const SECTIONS = [
  { id: "watch", label: "Watch" },
  { id: "learn", label: "Learn" },
  { id: "experts", label: "Experts" },
  { id: "questions", label: "Ask" },
] as const;

/**
 * CommunitySectionNav — a segmented control (track + sliding white lozenge)
 * with scroll-spy: the active segment tracks the section scrolled under the
 * sticky bar, and the pill slides between segments via a shared layoutId. The
 * modern iOS/Flo tab idiom; collapses to an instant swap under reduced motion.
 */
function CommunitySectionNav() {
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  // Guard scroll-spy from fighting a user's tap for the scroll's duration.
  const lockRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (lockRef.current) return;
        const onScreen = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (onScreen[0]) setActive(onScreen[0].target.id);
      },
      { rootMargin: "-72px 0px -55% 0px", threshold: 0 },
    );
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const handleTap = (id: string) => {
    setActive(id);
    lockRef.current = true;
    document.getElementById(id)?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
    window.setTimeout(() => (lockRef.current = false), 650);
  };

  return (
    <nav
      aria-label="Content sections"
      className="flex gap-1 rounded-full bg-black/[0.04] p-1"
    >
      {SECTIONS.map((s) => {
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => handleTap(s.id)}
            aria-current={isActive ? "true" : undefined}
            className="relative flex-1 rounded-full px-2 py-[11px] text-[13px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
          >
            {isActive && (
              <motion.span
                layoutId="content-tab-pill"
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 34 }
                }
                className="absolute inset-0 rounded-full bg-white shadow-[var(--shadow-card)]"
              />
            )}
            <span
              className={cn(
                "relative z-10 transition-colors",
                isActive
                  ? "text-[var(--nourish-dark)]"
                  : "text-[var(--nourish-subtext)]",
              )}
            >
              {s.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
