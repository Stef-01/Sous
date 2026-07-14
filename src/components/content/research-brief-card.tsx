"use client";

import Image from "next/image";
import Link from "next/link";
import { Microscope } from "lucide-react";
import type { ResearchBrief } from "@/types/content";
import { BookmarkButton } from "./bookmark-button";
import { SampleTag } from "./sample-tag";

interface Props {
  brief: ResearchBrief;
}

/** Compact evidence row for the curated Community home. */
export function ResearchBriefCard({ brief }: Props) {
  return (
    <Link
      href={`/community/research/${brief.slug}`}
      className="group flex min-h-[104px] items-center gap-3 rounded-[var(--radius-md)] border border-[var(--nourish-border-soft)] bg-white p-2 transition duration-150 hover:border-[var(--nourish-border-strong)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40 motion-reduce:active:scale-100"
    >
      <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--nourish-cream)]">
        <Image
          src={brief.coverImageUrl}
          alt={brief.title}
          fill
          sizes="88px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="sous-label flex items-center gap-1 truncate text-[var(--nourish-green)]">
          <Microscope size={11} className="shrink-0" />
          <span className="truncate">{brief.labName}</span>
          {brief.isPlaceholder && <SampleTag />}
        </p>
        <h3 className="line-clamp-2 font-serif text-[15px] leading-tight text-[var(--nourish-dark)]">
          {brief.title}
        </h3>
        <p className="line-clamp-2 text-[11px] leading-snug text-[var(--nourish-subtext)]">
          {brief.takeaway}
        </p>
      </div>
      <BookmarkButton kind="research" id={brief.id} label={brief.title} />
    </Link>
  );
}
