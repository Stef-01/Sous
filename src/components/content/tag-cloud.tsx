"use client";

import Link from "next/link";
import type { Article } from "@/types/content";
import { SectionKicker } from "@/components/shared/section-kicker";

/**
 * TagCloud — quietly surfaces the top tags across the article corpus
 * as a tappable cloud, sized by article-count.
 *
 * W9 from STAGE-3-VIBECODE-AUTONOMOUS-12MO.md. Pairs with the
 * tag-filter view (W2 in the Stage-4 backlog, shipped earlier this
 * session) — the cloud is the discovery surface, the filter view is
 * the destination.
 *
 * Pure render — receives `articles` from the caller. Pure helper
 * `topTagsByCount` is exported for unit testing.
 */

interface TagCount {
  tag: string;
  count: number;
}

/** Pure helper: return the top N tags by article count, sorted by
 *  count desc then tag asc (stable for equal counts). */
export function topTagsByCount(articles: Article[], limit: number): TagCount[] {
  const counts = new Map<string, number>();
  for (const article of articles) {
    for (const tag of article.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.tag.localeCompare(b.tag);
    })
    .slice(0, limit);
}

interface Props {
  articles: Article[];
  /** Cap the cloud at this many tags. Default 12 keeps the cloud
   *  visually under control. */
  limit?: number;
}

export function TagCloud({ articles, limit = 12 }: Props) {
  const tags = topTagsByCount(articles, limit);
  if (tags.length === 0) return null;

  // Find min/max counts so we can scale the pill text-size for
  // visual hierarchy. Count-1 tags read as "rare" pills; count-N
  // tags read as "central" pills.
  const maxCount = tags[0].count;
  const minCount = tags[tags.length - 1].count;
  const sizeFor = (count: number): string => {
    if (maxCount === minCount) return "text-[12px]";
    const ratio = (count - minCount) / (maxCount - minCount);
    if (ratio > 0.66) return "text-[14px] font-semibold";
    if (ratio > 0.33) return "text-[13px] font-semibold";
    return "text-[12px]";
  };

  return (
    <section aria-label="Browse by topic" className="space-y-2">
      <SectionKicker className="px-1">Browse by topic</SectionKicker>
      <div className="flex flex-wrap gap-2 px-1">
        {tags.map(({ tag, count }) => (
          <Link
            key={tag}
            href={`/community?tag=${encodeURIComponent(tag)}`}
            className={`inline-flex items-baseline gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-neutral-200 transition-colors hover:ring-[var(--nourish-green)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40 ${sizeFor(count)}`}
          >
            <span className="text-[var(--nourish-dark)]">#{tag}</span>
            <span className="tabular-nums text-[10px] text-[var(--nourish-subtext)]">
              {count}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
