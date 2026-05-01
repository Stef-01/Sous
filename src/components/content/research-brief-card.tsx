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
 * ResearchBriefCard — wide single-column card with paper-style typography.
 * Visual cue: small microscope icon + lab name in monospace caption to
 * differentiate research-spotlight items from editorial articles.
 */
export function ResearchBriefCard({ brief }: Props) {
  return (
    <Link
      href={`/community/research/${brief.slug}`}
      className="group flex overflow-hidden rounded-2xl border border-neutral-100/80 bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
    >
      <div className="relative aspect-square w-28 shrink-0 overflow-hidden bg-[var(--nourish-cream)]">
        <Image
          src={brief.coverImageUrl}
          alt={brief.title}
          fill
          sizes="112px"
          className="object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        <div className="space-y-1.5">
          <p className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--nourish-green)]">
            <Microscope size={12} />
            {brief.labName}
          </p>
          <h3 className="font-serif text-base leading-tight text-[var(--nourish-dark)] line-clamp-2">
            {brief.title}
          </h3>
          <p className="line-clamp-2 text-[12px] leading-snug text-[var(--nourish-subtext)]">
            {brief.takeaway}
          </p>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="text-[var(--nourish-green)] font-semibold group-hover:underline">
            Read brief →
          </span>
          <BookmarkButton kind="research" id={brief.id} label={brief.title} />
        </div>
      </div>
    </Link>
  );
}
