/**
 * Parent-track ranker — promotes audience: 'parent' content items to
 * the top of mixed lists when Parent Mode is on.
 *
 * Pure function. No mutation of input arrays. Stable sort: original
 * within-group order is preserved for parent items and for general
 * items, so feeds stay deterministic across renders.
 *
 * (Stage 2 W12.)
 */

import type { BaseContentItem } from "@/types/content";

export function rankForParentMode<T extends Pick<BaseContentItem, "audience">>(
  items: T[],
  parentModeOn: boolean,
): T[] {
  if (!parentModeOn || items.length === 0) return items.slice();
  const parentItems: T[] = [];
  const generalItems: T[] = [];
  for (const item of items) {
    if (item.audience === "parent") parentItems.push(item);
    else generalItems.push(item);
  }
  return [...parentItems, ...generalItems];
}
