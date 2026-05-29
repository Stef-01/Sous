"use client";

/**
 * Reels feed page (V2 — TikTok-style immersive).
 *
 * Replaces the V1 horizontal-rail-plus-shoot-once-sheet with a
 * single full-bleed vertical snap feed. Entry comes from:
 *   - the Content home Reels rail (deep-link via #reel-id hash)
 *   - the Content category-filter strip "Reels" pill (no hash)
 *   - direct route /community/reels
 *
 * The route group's TabBar is intentionally NOT visible here — the
 * feed is a fullscreen immersive surface (Z above the bottom nav).
 * Close (×) returns to wherever the user came from.
 */

import { Suspense } from "react";
import { REELS } from "@/data/content";
import { ReelsFeed } from "@/components/content/reels-feed";

export default function ReelsFeedPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black text-white/70">
          <span className="text-sm">Loading reels…</span>
        </div>
      }
    >
      <ReelsFeedRoute />
    </Suspense>
  );
}

function ReelsFeedRoute() {
  // Hash-based deep-link initial position (e.g. /community/reels#reel-tadka-101)
  const initialReelId =
    typeof window !== "undefined" && window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : null;

  return <ReelsFeed reels={REELS} initialReelId={initialReelId} />;
}
