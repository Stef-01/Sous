"use client";

import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { notFound } from "next/navigation";
import { getArticleBySlug, getExpertById, ARTICLES } from "@/data/content";
import { BackLink } from "@/components/content/back-link";
import { BookmarkButton } from "@/components/content/bookmark-button";
import { ContentDisclaimer } from "@/components/content/content-disclaimer";
import { SourceAttribution } from "@/components/shared/source-attribution";

export default function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const author = getExpertById(article.authorId);

  const related = ARTICLES.filter(
    (a) =>
      a.id !== article.id &&
      (a.authorId === article.authorId ||
        a.tags.some((tag) => article.tags.includes(tag))),
  ).slice(0, 3);

  return (
    <article className="min-h-full bg-[var(--nourish-cream)] pb-24">
      <div className="px-4 pt-5">
        <BackLink />
      </div>

      <header className="mt-3 space-y-3 px-4">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center rounded-full bg-[var(--nourish-green)]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nourish-green)]">
            {article.kicker}
          </span>
          <BookmarkButton
            kind="articles"
            id={article.id}
            label={article.title}
          />
        </div>
        <h1 className="font-serif text-2xl leading-tight text-[var(--nourish-dark)]">
          {article.title}
        </h1>
        {author && (
          <Link
            href={`/community/expert/${author.slug}`}
            className="inline-flex items-center gap-2 text-[12px] text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)]"
          >
            <span className="relative h-7 w-7 overflow-hidden rounded-full bg-[var(--nourish-cream)]">
              <Image
                src={author.avatarUrl}
                alt={author.name}
                fill
                sizes="28px"
                className="object-cover"
              />
            </span>
            <span>
              <span className="font-semibold text-[var(--nourish-dark)]">
                {author.name}
              </span>{" "}
              · {author.credential} · {article.readMinutes} min read
            </span>
          </Link>
        )}
      </header>

      <div className="relative mx-4 mt-4 aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--nourish-cream)]">
        <Image
          src={article.coverImageUrl}
          alt={article.title}
          fill
          sizes="(max-width: 480px) 92vw, 420px"
          className="object-cover"
          priority
        />
      </div>

      {/* Body: deliberate reading rhythm. Excerpt sits separately as a
          lede above the body so the eye lands on it first; first body
          paragraph gets a slightly heavier weight; subsequent
          paragraphs use a generous leading for sustained reading. */}
      <div className="px-5 pt-5">
        <p className="border-l-2 border-[var(--nourish-green)]/40 pl-3 text-[15px] font-medium leading-[1.55] text-[var(--nourish-dark)]">
          {article.excerpt}
        </p>
      </div>
      <div className="space-y-5 px-5 pt-5">
        {article.body.map((paragraph, idx) => (
          <p
            key={idx}
            className={
              idx === 0
                ? "text-[15.5px] font-medium leading-[1.7] text-[var(--nourish-dark)]"
                : "text-[15px] leading-[1.72] text-[var(--nourish-dark)]/85"
            }
          >
            {paragraph}
          </p>
        ))}

        <div className="flex flex-wrap gap-2 pt-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]"
            >
              #{tag}
            </span>
          ))}
        </div>

        {article.sourceUrl && article.sourceTitle && (
          <SourceAttribution
            sourceUrl={article.sourceUrl}
            sourceTitle={article.sourceTitle}
            sourceFetchedAt={article.sourceFetchedAt}
            variant="tinted"
            className="mt-5"
          />
        )}
      </div>

      {related.length > 0 && (
        <section className="mt-8 space-y-3 px-4">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-subtext)]">
            Related
          </h2>
          <ul className="space-y-2">
            {related.map((rel) => (
              <li key={rel.id}>
                <Link
                  href={`/community/article/${rel.slug}`}
                  className="block rounded-2xl border border-neutral-100/80 bg-white p-3 text-sm font-semibold text-[var(--nourish-dark)] shadow-sm hover:shadow-md transition-shadow"
                >
                  {rel.title}
                  <span className="block pt-0.5 text-[11px] font-normal text-[var(--nourish-subtext)]">
                    {rel.kicker} · {rel.readMinutes} min
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="px-4 pt-6">
        <ContentDisclaimer />
      </div>
    </article>
  );
}
