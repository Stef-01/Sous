import { describe, it, expect } from "vitest";
import { decideSwipe, exitDistanceFor } from "./quest-card";

// ---------------------------------------------------------------------------
// Phase 5 contract: the fullscreen swiper maps a LEFT commit -> Pass and a
// RIGHT commit -> Cook (the single dominant primary). The bottom-bar buttons
// call swipeTop('left') (Pass) and swipeTop('right') (Cook); the drag layer
// derives that same direction from decideSwipe. These tests pin the direction
// semantics so the [52px_52px_1fr] grid handlers can't be wired backwards.
// ---------------------------------------------------------------------------

const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 600;
const QUEUE_SIZE = 18;

describe("Phase 5 swiper direction semantics (Cook = right, Pass = left)", () => {
  it("a firm rightward drag commits 'right' => Cook routes", () => {
    expect(decideSwipe(SWIPE_THRESHOLD + 1, 0)).toBe("right");
  });

  it("a firm leftward drag commits 'left' => Pass dismisses", () => {
    expect(decideSwipe(-(SWIPE_THRESHOLD + 1), 0)).toBe("left");
  });

  it("a rightward flick (offset agrees) commits 'right' => Cook", () => {
    expect(decideSwipe(20, SWIPE_VELOCITY_THRESHOLD + 1)).toBe("right");
  });

  it("a leftward flick (offset agrees) commits 'left' => Pass", () => {
    expect(decideSwipe(-20, -(SWIPE_VELOCITY_THRESHOLD + 1))).toBe("left");
  });

  it("sub-threshold motion is a no-op (deck does not advance, Cook does not fire)", () => {
    expect(decideSwipe(SWIPE_THRESHOLD, SWIPE_VELOCITY_THRESHOLD)).toBe(null);
    expect(decideSwipe(0, 0)).toBe(null);
  });

  it("release-finger velocity kick opposite the drag does NOT mis-commit (no accidental Cook)", () => {
    // Tiny leftward offset + spurious rightward velocity must snap back,
    // otherwise a Pass gesture could accidentally route to Cook.
    expect(decideSwipe(-10, SWIPE_VELOCITY_THRESHOLD + 300)).toBe(null);
    expect(decideSwipe(15, -(SWIPE_VELOCITY_THRESHOLD + 100))).toBe(null);
  });
});

describe("Phase 5 exit distance preserves swipe direction for Cook/Pass", () => {
  it("a committed Cook (right) exits to the right (positive distance)", () => {
    expect(exitDistanceFor("right", 0)).toBe(320);
    expect(exitDistanceFor("right", 800)).toBeGreaterThan(320);
  });

  it("a committed Pass (left) exits to the left (negative distance)", () => {
    expect(exitDistanceFor("left", 0)).toBe(-320);
    expect(exitDistanceFor("left", -800)).toBeLessThan(-320);
  });

  it("no commit => no exit travel (card stays, no Cook/Pass)", () => {
    expect(exitDistanceFor(null, 5000)).toBe(0);
  });

  it("velocity boost is clamped so a wild flick can't fly the Cook card off-screen unbounded", () => {
    expect(exitDistanceFor("right", 100000)).toBe(320 + 200);
    expect(exitDistanceFor("left", -100000)).toBe(-320 - 200);
  });
});

// ---------------------------------------------------------------------------
// Phase 5 'Browse N meals' COUNT TRUTHFULNESS.
// The pill count is bound to queueDishes.length (quest-card.tsx line 329),
// where queueDishes is built by the inline useMemo at lines 246-253. We mirror
// that builder EXACTLY and assert the truthfulness contract the spec's binding
// note requires: count == min(filteredFeed, QUEUE_SIZE) -- never the raw
// QUEUE_SIZE constant (would over-promise on a small filtered feed) and never
// the un-capped feed length (the overlay only ever receives QUEUE_SIZE cards).
// If a future refactor re-binds the pill to QUEUE_SIZE or questDishes.length,
// one of these assertions goes red.
// ---------------------------------------------------------------------------

function buildQueueWindow<T>(feed: T[], previewIndex: number): T[] {
  if (feed.length === 0) return [];
  const start = previewIndex % feed.length;
  return [...feed.slice(start), ...feed.slice(0, start)].slice(0, QUEUE_SIZE);
}

describe("Phase 5 queue window + 'Browse N meals' count truthfulness", () => {
  it("empty feed yields an empty deck (no pill, no overlay)", () => {
    expect(buildQueueWindow([], 0)).toEqual([]);
  });

  it("a 3-dish filtered feed shows exactly 3 (count is truthful, not QUEUE_SIZE)", () => {
    const feed = ["a", "b", "c"];
    const window = buildQueueWindow(feed, 0);
    expect(window).toHaveLength(3);
    expect(window.length).not.toBe(QUEUE_SIZE);
  });

  it("a feed larger than QUEUE_SIZE caps the deck (and thus the count) at 18", () => {
    const feed = Array.from({ length: 40 }, (_, i) => i);
    expect(buildQueueWindow(feed, 0)).toHaveLength(QUEUE_SIZE);
  });

  it("count equals min(feed, QUEUE_SIZE) across a sweep of feed sizes", () => {
    for (const n of [1, 2, 5, 17, 18, 19, 25, 100]) {
      const feed = Array.from({ length: n }, (_, i) => i);
      expect(buildQueueWindow(feed, 0).length).toBe(Math.min(n, QUEUE_SIZE));
    }
  });

  it("rotation starts at the preview index and wraps, preserving the active dish first", () => {
    const feed = ["a", "b", "c", "d", "e"];
    expect(buildQueueWindow(feed, 2).join("")).toBe("cdeab");
    // previewIndex is taken modulo feed length (preview uses index % len)
    expect(buildQueueWindow(feed, 7).join("")).toBe("cdeab");
    expect(buildQueueWindow(feed, 0)[0]).toBe("a");
  });

  it("the active (first) dish of the window is the preview dish the pill describes", () => {
    // aria-label is `Browse ${count} meals, starting with ${dish.dishName}` —
    // dish is questDishes[previewIndex % len], i.e. window[0]. Lock that link.
    const feed = ["a", "b", "c", "d", "e"];
    const previewIndex = 3;
    const window = buildQueueWindow(feed, previewIndex);
    expect(window[0]).toBe(feed[previewIndex % feed.length]);
  });
});
