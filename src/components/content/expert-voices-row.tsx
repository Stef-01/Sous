"use client";

import Image from "next/image";
import Link from "next/link";
import type { ExpertVoice } from "@/types/content";

interface Props {
  experts: ExpertVoice[];
}

/**
 * ExpertVoicesRow — circular avatar row introducing the prototype's
 * sample expert voices. Tap → expert profile page with their content.
 * Affiliations include the "(sample)" suffix on the profile page so a
 * casual reader is never deceived about the placeholder nature.
 */
export function ExpertVoicesRow({ experts }: Props) {
  if (experts.length === 0) return null;
  return (
    <section aria-label="Expert voices" className="space-y-2">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-subtext)]">
          Expert voices
        </h2>
        <span className="text-[10px] text-[var(--nourish-subtext)]/70">
          Tap to read
        </span>
      </div>

      <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {experts.map((expert) => (
          <li key={expert.id} className="shrink-0">
            <Link
              href={`/community/expert/${expert.slug}`}
              className="group flex w-[88px] flex-col items-center text-center focus-visible:outline-none"
            >
              <div className="relative h-[68px] w-[68px] overflow-hidden rounded-full ring-2 ring-[var(--nourish-green)]/30 ring-offset-2 ring-offset-[var(--nourish-cream)] transition-transform duration-200 group-hover:scale-105">
                <Image
                  src={expert.avatarUrl}
                  alt={expert.name}
                  fill
                  sizes="68px"
                  className="object-cover"
                />
              </div>
              <p className="mt-1.5 text-[12px] font-semibold leading-tight text-[var(--nourish-dark)] line-clamp-1">
                {expert.name}
              </p>
              <p className="text-[10px] leading-tight text-[var(--nourish-subtext)] line-clamp-1">
                {expert.credential}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
