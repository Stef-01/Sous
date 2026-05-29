"use client";

/**
 * useActiveReel — IntersectionObserver-driven "which reel is the user
 * actually looking at right now" hook.
 *
 * Returns the data-reel-id of the most-visible reel page. Designed for
 * a snap-mandatory vertical feed where exactly one reel fills the
 * viewport at a time.
 *
 * Implementation notes:
 *   - Uses two thresholds (0.6 + 0.95) so the active reel transitions
 *     cleanly mid-scroll (TikTok-style) rather than only at full snap.
 *   - The hook does NOT take an explicit element ref list; it observes
 *     every element in the document with `data-reel-id` so the feed
 *     can grow lazily without re-attaching observers.
 *   - Caller is responsible for tagging each reel page with
 *     `data-reel-id={reel.id}`.
 */

import { useEffect, useState } from "react";

export function useActiveReel(): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    let observer: IntersectionObserver | null = null;

    const attach = () => {
      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting && e.intersectionRatio >= 0.6)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (visible?.target instanceof HTMLElement) {
            const id = visible.target.dataset.reelId;
            if (id) setActiveId(id);
          }
        },
        { threshold: [0.6, 0.95] },
      );
      document
        .querySelectorAll<HTMLElement>("[data-reel-id]")
        .forEach((el) => observer!.observe(el));
    };

    // Initial attach + re-attach on DOM mutations so newly-mounted reel
    // cards are observed without manual re-binding.
    attach();
    const mutation = new MutationObserver(attach);
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer?.disconnect();
      mutation.disconnect();
    };
  }, []);

  return activeId;
}
