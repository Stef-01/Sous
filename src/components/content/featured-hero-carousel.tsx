"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import type { Article } from "@/types/content";
import { getExpertById } from "@/data/content";
import { BookmarkButton } from "./bookmark-button";

interface Props {
  articles: Article[];
}

/**
 * FeaturedHeroCarousel — three swipeable hero cards at the top of the
 * Content home page. Snap-scroll, no autoplay (per reduced-motion sweep
 * decisions in Stage 0.9). Below the deck a tiny dot indicator tracks
 * the visible card.
 */
export function FeaturedHeroCarousel({ articles }: Props) {
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (articles.length === 0) return null;

  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const cardWidth = scroller.clientWidth;
    if (cardWidth === 0) return;
    const next = Math.round(scroller.scrollLeft / cardWidth);
    if (next !== activeIndex) setActiveIndex(next);
  };

  return (
    <section aria-label="Featured stories" className="space-y-2">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 scrollbar-hide"
      >
        {articles.map((article) => {
          const author = getExpertById(article.authorId);
          return (
            <Link
              key={article.id}
              href={`/community/article/${article.slug}`}
              className="group relative block aspect-[3/2] w-[88%] shrink-0 snap-center overflow-hidden rounded-3xl bg-[var(--nourish-cream)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
            >
              <Image
                src={article.coverImageUrl}
                alt={article.title}
                fill
                sizes="(max-width: 480px) 88vw, 360px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/0" />
              <div className="absolute right-3 top-3">
                <BookmarkButton
                  kind="articles"
                  id={article.id}
                  label={article.title}
                  variant="overlay"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 space-y-2 p-5 text-white">
                <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur-sm">
                  {article.kicker}
                </span>
                <h3 className="font-serif text-2xl leading-tight drop-shadow-sm">
                  {article.title}
                </h3>
                <p className="line-clamp-2 text-[13px] leading-snug text-white/85">
                  {article.excerpt}
                </p>
                <p className="text-[11px] text-white/75">
                  {author ? author.name : "Sous editorial"} ·{" "}
                  {article.readMinutes} min read
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {articles.length > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {articles.map((_, index) => (
            <motion.span
              key={index}
              animate={{
                width: index === activeIndex ? 18 : 5,
                opacity: index === activeIndex ? 1 : 0.4,
              }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className={cn(
                "h-1.5 rounded-full",
                index === activeIndex
                  ? "bg-[var(--nourish-green)]"
                  : "bg-[var(--nourish-subtext)]",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
