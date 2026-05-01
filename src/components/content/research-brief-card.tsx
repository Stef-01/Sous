"use client";

import Image from "next/image";
import Link from "next/link";
import { Microscope } from "lucide-react";
import type { ResearchBrief } from "@/types/content";
import { BookmarkButton } from "./bookmark-button";

interface Props {
  brief: ResearchBrief;
}

/**
 * ResearchBriefCard — stacked-portrait research card.
 *
 * W19b delta #5: switched from a wide-with-side-image layout to a
 * vertical card with a 16:9 cover, a Microscope-icon eyebrow, and a
 * paper-style title block below. This visually separates research
 * briefs from editorial articles (which are 4:3 grid cards) so the
 * Content surface no longer flattens them into the same rhythm.
 *
 * Inspired by Flo's research-brief treatment + Apple News editorial
 * card hierarchy.
 */
export function ResearchBriefCard({ brief }: Props) {
  return (
    <Link
      href={`/community/research/${brief.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100/80 bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--nourish-cream)]">
        <Image
          src={brief.coverImageUrl}
          alt={brief.title}
          fill
          sizes="(max-width: 480px) 92vw, 420px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute right-2 top-2">
          <BookmarkButton
            kind="research"
            id={brief.id}
            label={brief.title}
            variant="overlay"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 p-3.5">
        <p className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--nourish-green)]">
          <Microscope size={12} />
          {brief.labName}
        </p>
        <h3 className="font-serif text-[17px] leading-tight text-[var(--nourish-dark)] line-clamp-2">
          {brief.title}
        </h3>
        <p className="line-clamp-3 text-[13px] leading-[1.55] text-[var(--nourish-subtext)]">
          {brief.takeaway}
        </p>
        <p className="pt-1 text-[11px] font-semibold text-[var(--nourish-green)] group-hover:underline">
          Read brief →
        </p>
      </div>
    </Link>
  );
}
