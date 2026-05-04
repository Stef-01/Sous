/**
 * Editorial queue resolver (Y4 W30).
 *
 * Pure helpers that compose the W29 publication queue with
 * the existing Y3 content tab data. Two pieces:
 *
 *   - resolvePublishedSlugs({entries}) → Set of contentSlugs
 *     whose queue status is "published" AND which pass the
 *     W29 completeness gate.
 *   - filterReadyContent({items, publishedSlugs, mode}) →
 *     swap layer for the Content tab. In "preview" mode the
 *     placeholder items still render (Y3 Stage 3 lean vibe).
 *     In "production" mode only published items survive.
 *
 * Real-mode wire-up: when the editorial workstream populates
 * the queue, the Content tab page calls
 * `filterReadyContent({items, publishedSlugs, mode: "production"})`
 * and swaps in real content automatically. Until then,
 * "preview" mode keeps the demo experience working.
 *
 * Pure / dependency-free.
 */

import {
  validateEditorialCompleteness,
  type PublicationQueueEntry,
} from "./clinician-credits";

export interface ResolvedQueue {
  /** Slugs ready to render. */
  publishedSlugs: ReadonlySet<string>;
  /** Slugs that hit completeness blockers (for the editor
   *  dashboard's "needs work" list). */
  blockedSlugs: ReadonlyArray<{
    slug: string;
    missing: ReadonlyArray<string>;
  }>;
}

/** Pure: walk the queue, collect publishable slugs. */
export function resolvePublishedSlugs(input: {
  entries: ReadonlyArray<PublicationQueueEntry>;
}): ResolvedQueue {
  const published = new Set<string>();
  const blocked: Array<{ slug: string; missing: ReadonlyArray<string> }> = [];
  for (const entry of input.entries) {
    if (entry.status !== "published") continue;
    const completeness = validateEditorialCompleteness(entry);
    if (completeness.ready) {
      published.add(entry.contentSlug);
    } else {
      blocked.push({
        slug: entry.contentSlug,
        missing: completeness.missingFields,
      });
    }
  }
  return { publishedSlugs: published, blockedSlugs: blocked };
}

export type ContentRenderMode = "preview" | "production";

export interface FilterableContentItem {
  id: string;
  /** True for Y3 lean-vibe placeholder items. */
  isPlaceholder: boolean;
}

export interface FilterContentInput<T extends FilterableContentItem> {
  items: ReadonlyArray<T>;
  publishedSlugs: ReadonlySet<string>;
  mode: ContentRenderMode;
}

/** Pure: filter a list of content items based on mode. */
export function filterReadyContent<T extends FilterableContentItem>(
  input: FilterContentInput<T>,
): ReadonlyArray<T> {
  if (input.mode === "preview") {
    // Stage 3 lean-vibe behaviour: render placeholder + real
    // items together. Editorial workstream not blocking the
    // app shell.
    return input.items;
  }
  // Production: render only items whose id is in publishedSlugs.
  // Placeholder items never render in production unless
  // explicitly published.
  return input.items.filter((item) => {
    if (item.isPlaceholder) return false;
    return input.publishedSlugs.has(item.id);
  });
}

export interface QueueStatusSummary {
  total: number;
  draft: number;
  inReview: number;
  readyToPublish: number;
  published: number;
  withdrawn: number;
  blocked: number;
}

/** Pure: build the editor dashboard summary strip. */
export function summariseEditorialQueue(input: {
  entries: ReadonlyArray<PublicationQueueEntry>;
}): QueueStatusSummary {
  let draft = 0;
  let inReview = 0;
  let readyToPublish = 0;
  let published = 0;
  let withdrawn = 0;
  let blocked = 0;
  for (const entry of input.entries) {
    if (entry.status === "draft") draft += 1;
    else if (entry.status === "in-review") inReview += 1;
    else if (entry.status === "ready-to-publish") readyToPublish += 1;
    else if (entry.status === "published") {
      published += 1;
      const completeness = validateEditorialCompleteness(entry);
      if (!completeness.ready) blocked += 1;
    } else if (entry.status === "withdrawn") withdrawn += 1;
  }
  return {
    total: input.entries.length,
    draft,
    inReview,
    readyToPublish,
    published,
    withdrawn,
    blocked,
  };
}
