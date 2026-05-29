import { describe, expect, it } from "vitest";
import type {
  ClinicianCredit,
  PublicationQueueEntry,
} from "./clinician-credits";
import {
  filterReadyContent,
  resolvePublishedSlugs,
  summariseEditorialQueue,
} from "./queue-resolver";

const credit = (): ClinicianCredit => ({
  id: "c-1",
  name: "Dr. Maya Lin",
  affiliation: "Stanford Medicine",
  orcid: "0000-0001-2345-6789",
  role: "author",
  bylineOrder: 0,
});

const completeEntry = (
  overrides: Partial<PublicationQueueEntry> = {},
): PublicationQueueEntry => ({
  id: "e-1",
  contentSlug: "smart-snacks",
  status: "published",
  statusChangedAt: "2026-05-01T00:00:00Z",
  credits: [credit()],
  sourceUrl: "https://med.stanford.edu/x",
  sourceTitle: "Smart Snacks",
  permissionEvidence: "docs/permission/x.pdf",
  ...overrides,
});

describe("resolvePublishedSlugs", () => {
  it("collects only published entries", () => {
    const out = resolvePublishedSlugs({
      entries: [
        completeEntry({ contentSlug: "a", status: "published" }),
        completeEntry({ contentSlug: "b", status: "in-review" }),
        completeEntry({ contentSlug: "c", status: "draft" }),
      ],
    });
    expect(Array.from(out.publishedSlugs)).toEqual(["a"]);
  });

  it("blocks published-but-incomplete entries with missing fields", () => {
    const out = resolvePublishedSlugs({
      entries: [
        completeEntry({ contentSlug: "ok", status: "published" }),
        completeEntry({
          contentSlug: "broken",
          status: "published",
          credits: [],
        }),
      ],
    });
    expect(Array.from(out.publishedSlugs)).toEqual(["ok"]);
    expect(out.blockedSlugs).toHaveLength(1);
    expect(out.blockedSlugs[0].slug).toBe("broken");
    expect(out.blockedSlugs[0].missing).toContain("credits");
  });
});

describe("filterReadyContent", () => {
  const items = [
    { id: "a", isPlaceholder: false, title: "Real" },
    { id: "b", isPlaceholder: true, title: "Placeholder" },
  ];

  it("preview mode passes all items through", () => {
    const out = filterReadyContent({
      items,
      publishedSlugs: new Set(),
      mode: "preview",
    });
    expect(out).toHaveLength(2);
  });

  it("production mode drops placeholders and unpublished items", () => {
    const out = filterReadyContent({
      items,
      publishedSlugs: new Set(["a"]),
      mode: "production",
    });
    expect(out.map((i) => i.id)).toEqual(["a"]);
  });

  it("production mode drops a non-placeholder item not in published set", () => {
    const out = filterReadyContent({
      items,
      publishedSlugs: new Set(),
      mode: "production",
    });
    expect(out).toHaveLength(0);
  });
});

describe("summariseEditorialQueue", () => {
  it("counts entries per status", () => {
    const out = summariseEditorialQueue({
      entries: [
        completeEntry({ id: "1", status: "draft" }),
        completeEntry({ id: "2", status: "draft" }),
        completeEntry({ id: "3", status: "in-review" }),
        completeEntry({ id: "4", status: "ready-to-publish" }),
        completeEntry({ id: "5", status: "published" }),
        completeEntry({ id: "6", status: "withdrawn" }),
      ],
    });
    expect(out.total).toBe(6);
    expect(out.draft).toBe(2);
    expect(out.inReview).toBe(1);
    expect(out.readyToPublish).toBe(1);
    expect(out.published).toBe(1);
    expect(out.withdrawn).toBe(1);
    expect(out.blocked).toBe(0);
  });

  it("flags published-but-incomplete entries as blocked", () => {
    const out = summariseEditorialQueue({
      entries: [
        completeEntry({ id: "ok", status: "published" }),
        completeEntry({ id: "broken", status: "published", credits: [] }),
      ],
    });
    expect(out.published).toBe(2);
    expect(out.blocked).toBe(1);
  });

  it("returns zeros for empty input", () => {
    const out = summariseEditorialQueue({ entries: [] });
    expect(out.total).toBe(0);
    expect(out.published).toBe(0);
    expect(out.blocked).toBe(0);
  });
});
