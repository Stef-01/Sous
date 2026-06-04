/**
 * Snap decision for the swipe-up health panel — pure, mirrors `decideSwipe`.
 *
 * The panel has exactly two snap points: `collapsed` (photo full) and `peek`
 * (photo bottom-half visible, panel raised). A vertical drag commits to a snap
 * by offset OR a velocity flick; an uncommitted drag returns to where it started.
 *
 * Convention: a drag delta `offsetY` is NEGATIVE when dragging UP (toward the
 * top of the screen), POSITIVE when dragging down — matching pointer math.
 */

export const PANEL_OFFSET_THRESHOLD = 80; // px to commit a snap
export const PANEL_VELOCITY_THRESHOLD = 500; // px/s flick to commit

export type PanelSnap = "collapsed" | "peek";

export function decidePanelSnap(
  from: PanelSnap,
  offsetY: number,
  velocityY: number,
): PanelSnap {
  const offsetCommit = Math.abs(offsetY) > PANEL_OFFSET_THRESHOLD;
  const velocityCommit = Math.abs(velocityY) > PANEL_VELOCITY_THRESHOLD;

  // Neither threshold met → snap back to where the drag started.
  if (!offsetCommit && !velocityCommit) return from;

  // A decisive flick overrides a small/opposing offset (follow the flick).
  if (
    velocityCommit &&
    (!offsetCommit || Math.sign(velocityY) !== Math.sign(offsetY))
  ) {
    return velocityY < 0 ? "peek" : "collapsed";
  }

  // Offset-driven: up opens (peek), down closes (collapsed).
  return offsetY < 0 ? "peek" : "collapsed";
}
