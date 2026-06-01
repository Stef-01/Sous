"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import {
  ARTICLES,
  EXPERT_VOICES,
  FORUM_THREADS,
  REELS,
  RESEARCH_BRIEFS,
} from "@/data/content";
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
        <ReelsRail
          reels={sortedReels}
          onSelect={(reel) => router.push(`/community/reels?start=${reel.id}`)}
          onSeeAll={() => router.push("/community/reels")}
        />

        <section
          id="learn"
          aria-label="Learn"
          className="scroll-mt-24 space-y-4"
        >
          <SectionHeader
            title="Learn"
            subtitle="Readable cooking ideas and plain-English food research."
          />
          <div className="grid grid-cols-2 gap-3">
            {sortedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
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
      <Link
        href="/community/reels"
        className="inline-flex min-h-[44px] items-center rounded-full px-2.5 py-1.5 text-[var(--nourish-dark)] hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
      >
        Watch
      </Link>
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
