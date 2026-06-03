"use client";

import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/types/content";
import { getExpertById } from "@/data/content";
import { BookmarkButton } from "./bookmark-button";

interface Props {
  article: Article;
  variant?: "default" | "compact";
}

/**
 * ArticleCard — single article tile for grids and lists. The default
 * variant is a vertical card with a 4:3 cover; "compact" is a denser
 * row layout suitable for the saved list and expert profile pages.
 */
export function ArticleCard({ article, variant = "default" }: Props) {
  const author = getExpertById(article.authorId);

  if (variant === "compact") {
    return (
      <Link
        href={`/community/article/${article.slug}`}
        className="group flex items-center gap-3 rounded-2xl border border-neutral-100/80 bg-white p-2.5 transition-colors hover:border-[var(--nourish-green)]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--nourish-cream)]">
          <Image
            src={article.coverImageUrl}
            alt={article.title}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-subtext)]">
            {article.kicker}
          </p>
          <p className="line-clamp-2 text-sm font-semibold leading-tight text-[var(--nourish-dark)]">
            {article.title}
          </p>
          <p className="text-[11px] text-[var(--nourish-subtext)]">
            {author?.name ?? "Sous editorial"} · {article.readMinutes} min
          </p>
        </div>
        <BookmarkButton kind="articles" id={article.id} label={article.title} />
      </Link>
    );
  }

  return (
    <Link
      href={`/community/article/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100/80 bg-white transition-colors hover:border-[var(--nourish-green)]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--nourish-cream)]">
        <Image
          src={article.coverImageUrl}
          alt={article.title}
          fill
          sizes="(max-width: 480px) 50vw, 220px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        <div className="absolute right-2 top-2">
          <BookmarkButton
            kind="articles"
            id={article.id}
            label={article.title}
            variant="overlay"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="truncate text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--nourish-green)]">
          {article.kicker}
        </p>
        <h3 className="font-serif text-base leading-tight text-[var(--nourish-dark)] line-clamp-2">
          {article.title}
        </h3>
        <p className="mt-auto pt-1.5 text-[11px] text-[var(--nourish-subtext)]">
          {author?.name ?? "Sous editorial"} · {article.readMinutes} min read
        </p>
      </div>
    </Link>
  );
}
