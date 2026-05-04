"use client";

import Image from "next/image";
import { use } from "react";
import { notFound } from "next/navigation";
import { ARTICLES, getExpertBySlug } from "@/data/content";
import { ArticleCard } from "@/components/content/article-card";
import { BackLink } from "@/components/content/back-link";
import { ContentDisclaimer } from "@/components/content/content-disclaimer";
import { SectionKicker } from "@/components/shared/section-kicker";
import { MetaPill } from "@/components/shared/meta-pill";

export default function ExpertProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const expert = getExpertBySlug(slug);
  if (!expert) notFound();

  const articles = ARTICLES.filter((a) => expert.articleIds.includes(a.id));

  return (
    <div className="min-h-full bg-[var(--nourish-cream)] pb-24">
      <div className="px-4 pt-5">
        <BackLink />
      </div>

      <header className="mt-4 flex items-center gap-4 px-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-[var(--nourish-green)]/30 ring-offset-2 ring-offset-[var(--nourish-cream)]">
          <Image
            src={expert.avatarUrl}
            alt={expert.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <div className="space-y-0.5">
          <h1 className="font-serif text-xl text-[var(--nourish-dark)]">
            {expert.name}
          </h1>
          <p className="text-[12px] font-semibold text-[var(--nourish-green)]">
            {expert.credential}
          </p>
          <p className="text-[11px] italic text-[var(--nourish-subtext)]">
            {expert.affiliation}
          </p>
          {expert.isPlaceholder === false && (
            <MetaPill
              variant="green"
              size="xs"
              className="mt-1 font-bold uppercase"
            >
              Verified clinician
            </MetaPill>
          )}
        </div>
      </header>

      <p className="mt-5 px-5 text-[14px] leading-relaxed text-[var(--nourish-dark)]/85">
        {expert.bio}
      </p>

      <section className="mt-7 space-y-2 px-4">
        <div className="flex items-baseline justify-between">
          <SectionKicker>From {expert.name.split(" ")[0]}</SectionKicker>
          {articles.length > 0 && (
            <span className="tabular-nums text-[11px] text-[var(--nourish-subtext)]">
              {articles.length} article{articles.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
        {articles.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-neutral-200 bg-white/60 px-4 py-6 text-center text-[12px] text-[var(--nourish-subtext)]">
            No articles yet from this expert.
          </p>
        ) : (
          <ul className="space-y-2">
            {articles.map((article) => (
              <li key={article.id}>
                <ArticleCard article={article} variant="compact" />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="px-4 pt-6">
        <ContentDisclaimer />
      </div>
    </div>
  );
}
