"use client";

import Image from "next/image";
import { use } from "react";
import { notFound } from "next/navigation";
import { ExternalLink, Microscope } from "lucide-react";

function formatFetchedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
import { getResearchBriefBySlug } from "@/data/content";
import { BackLink } from "@/components/content/back-link";
import { BookmarkButton } from "@/components/content/bookmark-button";
import { ContentDisclaimer } from "@/components/content/content-disclaimer";

export default function ResearchBriefPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const brief = getResearchBriefBySlug(slug);
  if (!brief) notFound();

  return (
    <article className="min-h-full bg-[var(--nourish-cream)] pb-24">
      <div className="px-4 pt-5">
        <BackLink />
      </div>

      <header className="mt-3 space-y-3 px-4">
        <div className="flex items-start justify-between gap-3">
          <p className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nourish-green)]">
            <Microscope size={12} aria-hidden /> {brief.labName}
          </p>
          <BookmarkButton kind="research" id={brief.id} label={brief.title} />
        </div>
        <h1 className="font-serif text-2xl leading-tight text-[var(--nourish-dark)]">
          {brief.title}
        </h1>
        {/* Citation block lifted from a thin italic line into a proper
            paper-card so the source paper feels load-bearing. */}
        <div className="rounded-xl border border-neutral-200/80 bg-white/70 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nourish-subtext)]">
            Source paper
          </p>
          <p className="mt-0.5 text-[12px] leading-snug text-[var(--nourish-dark)]/85">
            {brief.paperTitle}
          </p>
        </div>
      </header>

      <div className="relative mx-4 mt-4 aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--nourish-cream)]">
        <Image
          src={brief.coverImageUrl}
          alt={brief.title}
          fill
          sizes="(max-width: 480px) 92vw, 420px"
          className="object-cover"
          priority
        />
      </div>

      <div className="space-y-4 px-5 pt-5">
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-neutral-100/80">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-subtext)]">
            Takeaway
          </p>
          <p className="mt-1.5 text-[15px] font-medium leading-[1.6] text-[var(--nourish-dark)]">
            {brief.takeaway}
          </p>
        </div>

        {brief.body.map((paragraph, idx) => (
          <p
            key={idx}
            className="text-[15px] leading-[1.65] text-[var(--nourish-dark)]/85"
          >
            {paragraph}
          </p>
        ))}

        <div className="rounded-2xl bg-[var(--nourish-green)]/8 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-green)]">
            Why it matters
          </p>
          <p className="mt-1.5 text-[14px] leading-[1.6] text-[var(--nourish-dark)]/90">
            {brief.whyItMatters}
          </p>
        </div>

        {brief.sourceUrl && brief.sourceTitle && (
          <aside
            className="mt-3 rounded-2xl border border-[var(--nourish-green)]/25 bg-white p-4 text-[12px] text-[var(--nourish-dark)]/85"
            aria-label="Original source"
          >
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nourish-green)]">
              Sourced from
            </p>
            <p className="font-semibold text-[var(--nourish-dark)]">
              {brief.sourceTitle}
            </p>
            <a
              href={brief.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--nourish-cream)] px-3 py-1.5 text-[11px] font-semibold text-[var(--nourish-green)] ring-1 ring-[var(--nourish-green)]/20 hover:ring-[var(--nourish-green)]/40"
            >
              Read the original
              <ExternalLink size={11} aria-hidden />
            </a>
            {brief.sourceFetchedAt && (
              <p className="mt-2 text-[10px] text-[var(--nourish-subtext)]">
                Summary captured {formatFetchedAt(brief.sourceFetchedAt)} · Sous
                paraphrase, not a reproduction.
              </p>
            )}
          </aside>
        )}
      </div>

      <div className="px-4 pt-6">
        <ContentDisclaimer />
      </div>
    </article>
  );
}
