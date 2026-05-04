# Reels V2 — TikTok-Style Infinite Vertical Feed

> **Authored:** 2026-05-01
> **Status:** Design ready (slots into STAGE-1-2-6MO-TIMELINE.md Phase D)
> **Reads from:** [`STAGE-3-LEAN-CONTENT.md`](./STAGE-3-LEAN-CONTENT.md), the current `src/components/content/reels-rail.tsx` + `reel-player-sheet.tsx`
> **Karpathy guard:** Replaces a placeholder, doesn't bolt on a parallel one. The horizontal rail on the Content home stays as discovery; the immersive feed becomes the canonical Reels surface.

---

## 1. Why this is a real overhaul

Stage 3 shipped Reels as: a horizontal rail of portrait posters on the Content home + a single full-screen sheet that opens one reel at a time with simulated player chrome. That works as a placeholder but it is **not** how TikTok / Instagram / YouTube Shorts actually feel. Real reels feel like:

- Open the surface, the first reel autoplays full-bleed.
- Swipe up, the next reel snaps into place and autoplays.
- Swipe down, the previous one returns.
- The rail of "tap a poster to play one" is a desktop affordance; on mobile, you live in the feed.

The user's ask: _"feel almost exactly like TikTok with infinite scrolling vertically."_ That is a substantive UX change, not a polish pass.

---

## 2. End-state UX

### 2.1 Entry points (unchanged)

- Tapping a card on the Content home Reels rail.
- Tapping `Reels` on the category filter strip.
- Tapping `See all` next to the rail header.
- Direct route `/community/reels`.

### 2.2 Feed layout

- Full-bleed vertical viewport. No tab bar visible (immersive).
- One reel per "page" — `100dvh` snap container with `scroll-snap-type: y mandatory`.
- Each reel page:
  - Background: poster image (V2.0) or actual video (V2.5+).
  - Top: thin progress bar.
  - Right rail: Like, Save, Share, Comment-count (read-only V2.0), Cook-this (if `dishSlug`).
  - Bottom-left: creator handle, caption (2-line clamp with "more" expand), technique chip.
  - Top-left: small `×` close — returns to wherever the user came from (uses `router.back()` with `/community` fallback).

### 2.3 Behaviour

- **Autoplay-on-view**: an `IntersectionObserver` with `threshold ≥ 0.7` marks the visible reel as active; only the active reel's "play" UI runs (progress bar advances). Inactive reels are paused/idle.
- **Snap scroll**: vertical snap-mandatory; one full reel per snap point.
- **Infinite-feel**: feed is a single in-memory list of reels initially; when the user passes the last one, the list shuffles and concatenates seen reels at the end (deterministic shuffle seeded by date so "fresh" feels real but is not random per render). V2.5 adds a "loaded more" pagination call once we have more than ~50 reels.
- **No double-tap-to-like** in V2.0 (avoids accidental likes during navigation); single-tap on the right-rail Like icon only.
- **Long-press to pause** (TikTok parity): holding any reel pauses its progress bar; release resumes.
- **Reduced motion**: with `prefers-reduced-motion`, the snap behaviour stays (it's structural, not decorative) but the bottom-text fade-in animation is removed.

### 2.4 Player chrome (still simulated in V2.0)

Until we have real video assets (Stage 3+ workstream), each reel renders the existing poster image with:

- Subtle Ken-Burns zoom over `durationSeconds` (slow scale 1.00 → 1.06).
- Progress bar that fills over `durationSeconds` then triggers `nextReel()` programmatically (auto-advance to the next reel, mirroring TikTok's auto-advance when a video ends — but only after a full play, so dwell time is honest).
- Caption fade-in.

When real video lands (V2.5+), the simulated chrome is swapped for a real `<video>` element; the rest of the layout is unchanged.

### 2.5 What the horizontal rail becomes

The Content-home rail stays — it's still the best discovery affordance for a magazine-style surface. Tapping a poster on the rail now opens the **immersive feed** scrolled to that reel (using the reel ID as initial position), not the old single-reel sheet.

The standalone "Reel Player Sheet" component (`src/components/content/reel-player-sheet.tsx`) is **retired** in V2.0. Its bookmark / like / share rail logic is lifted into the feed page.

---

## 3. Architecture

### 3.1 New / changed files

```
src/
  app/
    (community)/
      community/
        reels/
          page.tsx              # REPLACES current /community/reels grid
                                # New: vertical-snap immersive feed.
  components/
    content/
      reels-feed.tsx            # NEW: the snap-scroll container + IO logic
      reel-card.tsx             # NEW: single-reel page (poster + chrome + actions)
      reel-action-rail.tsx      # NEW: right-side Like/Save/Share/Cook column
      reels-rail.tsx            # CHANGED: tap → push /community/reels#<id>
      reel-player-sheet.tsx     # RETIRED: deleted in V2.0
  lib/
    hooks/
      use-active-reel.ts        # NEW: IntersectionObserver-driven active id
      use-reels-feed-cursor.ts  # NEW: deterministic infinite-shuffle cursor
```

Net: 4 new files, 1 changed, 1 deleted. The horizontal Content-home rail stays.

### 3.2 Initial-position routing

`router.push('/community/reels#reel-tadka-101')` opens the feed and immediately scrolls so `#reel-tadka-101` is the active snap point. Implemented via `useEffect(() => element?.scrollIntoView({ behaviour: 'instant', block: 'start' }))` keyed on the hash.

### 3.3 Infinite shuffle (V2.0)

```ts
function buildInfiniteFeed(reels: Reel[], seed: string): Reel[] {
  // First pass: chronological newest-first.
  const first = [...reels].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  // Second pass: deterministic shuffle of the same set (seeded by today's date)
  const shuffled = deterministicShuffle(first, seed);
  // Third pass: reverse-shuffle (so the user genuinely sees variety
  // without it feeling random per scroll).
  const reverse = [...shuffled].reverse();
  return [...first, ...shuffled, ...reverse];
}
```

3× the catalog ≈ 24 reels at current seed. Lazy-load once we exceed it. Pure function, vitest-coverable.

### 3.4 Active-reel detection

```ts
export function useActiveReel(): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting && e.intersectionRatio >= 0.7)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target instanceof HTMLElement) {
          setActiveId(visible.target.dataset.reelId ?? null);
        }
      },
      { threshold: [0.7, 0.95] },
    );
    document
      .querySelectorAll("[data-reel-id]")
      .forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return activeId;
}
```

### 3.5 The retirement trade-off

We delete `reel-player-sheet.tsx` rather than keep it as an alternate sheet because two divergent reel surfaces will drift in chrome / behaviour and confuse users. The immersive feed is now THE reel experience; the rail is just an entry point.

---

## 4. Migration / acceptance criteria

|                                                                                        | V2.0 |
| -------------------------------------------------------------------------------------- | ---- |
| `/community/reels` renders the vertical feed                                           | ✅   |
| Tapping a poster in the Content-home rail opens the feed at that reel                  | ✅   |
| Snap-scroll works on iOS Safari + Android Chrome                                       | ✅   |
| Active reel autoplays simulated chrome; inactive reels pause                           | ✅   |
| Long-press pauses; release resumes                                                     | ✅   |
| Right rail (Like, Save, Share, Cook) functions; like + save persist via existing hooks | ✅   |
| Bottom caption clamps to 2 lines with `more` toggle                                    | ✅   |
| `reel-player-sheet.tsx` deleted; no dead imports                                       | ✅   |
| `prefers-reduced-motion` removes Ken-Burns + caption fade-in but keeps snap            | ✅   |
| Lighthouse Mobile score on `/community/reels` ≥ 85                                     | ✅   |
| 6+ vitest cases on `useActiveReel` + `buildInfiniteFeed`                               | ✅   |

---

## 5. Out of scope for V2.0

- Real `<video>` assets and transcoding pipeline (Stage 3+).
- Comments / replies (V2.5).
- Recommendation algorithm (post-V2 — V2.0 is deterministic shuffle).
- Creator profiles + follow (V2.5).
- Sound on by default (V2.5; need real audio).

---

## 6. Where this lands in the timeline

- **Phase D · Week 22b** (carved out of Week 22 polish budget): build + ship V2.0 immersive feed; retire `reel-player-sheet.tsx`.
- **Phase D · Week 23** legal review covers the retired sheet's disclaimer pattern transferring to the new chrome — not a new ask.
- **V2.5** (real video) is post-launch Stage 3+ work; this plan stops at V2.0.

This is integrated into [`STAGE-1-2-6MO-TIMELINE.md`](./STAGE-1-2-6MO-TIMELINE.md) §2.6.
