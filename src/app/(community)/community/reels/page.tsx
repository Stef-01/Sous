"use client";

import { useMemo, useState } from "react";
import { REELS } from "@/data/content";
import { ReelPlayerSheet } from "@/components/content/reel-player-sheet";
import { ReelsRail } from "@/components/content/reels-rail";
import { BackLink } from "@/components/content/back-link";
import { ContentDisclaimer } from "@/components/content/content-disclaimer";
import type { Reel } from "@/types/content";

/**
 * Full-screen reels feed — vertical-snap rail of all reels. Tap a card
 * to open the simulated player sheet (same component used on the home).
 */
export default function ReelsFeedPage() {
  const [active, setActive] = useState<Reel | null>(null);
  const sorted = useMemo(
    () =>
      [...REELS].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [],
  );

  return (
    <div className="min-h-full bg-[var(--nourish-cream)] pb-32">
      <div className="px-4 pt-5">
        <BackLink />
      </div>
      <header className="space-y-1 px-4 pt-3">
        <h1 className="font-serif text-2xl text-[var(--nourish-dark)]">
          All reels
        </h1>
        <p className="text-[12px] text-[var(--nourish-subtext)]">
          Sample TikTok-style cooking shorts. Simulated playback for prototype.
        </p>
      </header>

      <div className="mt-4 space-y-6 px-4">
        <ReelsRail reels={sorted} onSelect={(reel) => setActive(reel)} />

        <ul className="grid grid-cols-3 gap-2">
          {sorted.map((reel) => (
            <li key={reel.id}>
              <button
                type="button"
                onClick={() => setActive(reel)}
                className="group relative block aspect-[9/16] w-full overflow-hidden rounded-xl bg-neutral-900 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
                aria-label={`Open ${reel.title}`}
              >
                <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/30" />
                <span className="absolute inset-x-1.5 bottom-1.5 text-[10px] font-semibold leading-tight text-white drop-shadow-sm line-clamp-2">
                  {reel.title}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <ContentDisclaimer variant="inline" />
      </div>

      <ReelPlayerSheet reel={active} onClose={() => setActive(null)} />
    </div>
  );
}
