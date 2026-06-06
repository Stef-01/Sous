import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/types/content";

/**
 * FeaturedHero — the single highlighted story at the top of the Content tab.
 * A big cover image with a scrim, a "Featured" tag, and the title. Minimal
 * text (rule 13): the image + title sell it; tap to read. A future variant can
 * spotlight an ingredient instead of an article.
 */
export function FeaturedHero({ article }: { article: Article }) {
  return (
    <Link
      href={`/community/article/${article.slug}`}
      aria-label={`Featured: ${article.title}`}
      className="group relative block overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]"
    >
      <div className="relative aspect-[16/10] w-full bg-[var(--nourish-cream)]">
        <Image
          src={article.coverImageUrl}
          alt=""
          fill
          sizes="(max-width: 480px) 92vw, 440px"
          className="object-cover transition-transform duration-500 group-active:scale-[1.03]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        <span className="sous-label absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[var(--nourish-dark)] backdrop-blur-sm">
          Featured
        </span>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h2 className="line-clamp-3 font-serif text-[22px] leading-tight text-white">
            {article.title}
          </h2>
          <p className="mt-1 text-[12px] font-medium text-white/80">
            {article.kicker}
          </p>
        </div>
      </div>
    </Link>
  );
}
