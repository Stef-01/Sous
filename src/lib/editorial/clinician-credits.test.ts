import { describe, expect, it } from "vitest";
import {
  isValidOrcid,
  transitionPublicationStatus,
  validateEditorialCompleteness,
  type ClinicianCredit,
  type PublicationQueueEntry,
} from "./clinician-credits";

const credit = (overrides: Partial<ClinicianCredit> = {}): ClinicianCredit => ({
  id: "c-1",
  name: "Dr. Maya Lin",
  affiliation: "Stanford Medicine",
  orcid: "0000-0001-2345-6789",
  role: "author",
  bylineOrder: 0,
  ...overrides,
});

const entry = (
  overrides: Partial<PublicationQueueEntry> = {},
): PublicationQueueEntry => ({
  id: "e-1",
  contentSlug: "smart-snacks",
  status: "draft",
  statusChangedAt: "2026-05-01T00:00:00Z",
  credits: [credit()],
  sourceUrl: "https://med.stanford.edu/news/smart-snacks",
  sourceTitle: "Smart Snacks for Kids",
  permissionEvidence: "docs/editorial/permission/smart-snacks.pdf",
  ...overrides,
});

describe("isValidOrcid", () => {
  it("accepts canonical 4-block ORCID", () => {
    expect(isValidOrcid("0000-0001-2345-6789")).toBe(true);
  });

  it("accepts ORCID ending in X", () => {
    expect(isValidOrcid("0000-0001-2345-678X")).toBe(true);
  });

  it("rejects missing dashes", () => {
    expect(isValidOrcid("0000000123456789")).toBe(false);
  });

  it("rejects extra characters", () => {
    expect(isValidOrcid("0000-0001-2345-6789-extra")).toBe(false);
  });
});

describe("validateEditorialCompleteness", () => {
  it("ready when all fields present", () => {
    const out = validateEditorialCompleteness(entry());
    expect(out.ready).toBe(true);
    expect(out.missingFields).toEqual([]);
  });

  it("flags missing sourceUrl", () => {
    const out = validateEditorialCompleteness(entry({ sourceUrl: "" }));
    expect(out.ready).toBe(false);
    expect(out.missingFields).toContain("sourceUrl");
  });

  it("flags empty credits", () => {
    const out = validateEditorialCompleteness(entry({ credits: [] }));
    expect(out.missingFields).toContain("credits");
  });

  it("flags credit with missing affiliation", () => {
    const out = validateEditorialCompleteness(
      entry({
        credits: [credit({ id: "c-x", affiliation: "" })],
      }),
    );
    expect(out.ready).toBe(false);
    expect(out.missingFields.some((f) => f.includes("affiliation"))).toBe(true);
  });

  it("flags invalid ORCID format", () => {
    const out = validateEditorialCompleteness(
      entry({
        credits: [credit({ id: "c-x", orcid: "not-an-orcid" })],
      }),
    );
    expect(out.ready).toBe(false);
    expect(out.missingFields.some((f) => f.includes("invalid ORCID"))).toBe(
      true,
    );
  });

  it("permits credit without ORCID (optional field)", () => {
    const credit_no_orcid = { ...credit() };
    delete credit_no_orcid.orcid;
    const out = validateEditorialCompleteness(
      entry({ credits: [credit_no_orcid] }),
    );
    expect(out.ready).toBe(true);
  });
});

describe("transitionPublicationStatus", () => {
  it("blocks draft → published", () => {
    const out = transitionPublicationStatus({
      entry: entry({ status: "draft" }),
      to: "published",
    });
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason).toMatch(/in-review/);
  });

  it("allows draft → in-review", () => {
    const out = transitionPublicationStatus({
      entry: entry({ status: "draft" }),
      to: "in-review",
    });
    expect(out.ok).toBe(true);
  });

  it("blocks ready-to-publish → published when incomplete", () => {
    const out = transitionPublicationStatus({
      entry: entry({ status: "ready-to-publish", credits: [] }),
      to: "published",
    });
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason).toMatch(/Cannot publish/);
  });

  it("allows ready-to-publish → published when complete", () => {
    const out = transitionPublicationStatus({
      entry: entry({ status: "ready-to-publish" }),
      to: "published",
    });
    expect(out.ok).toBe(true);
  });

  it("blocks transitions out of withdrawn", () => {
    const out = transitionPublicationStatus({
      entry: entry({ status: "withdrawn" }),
      to: "draft",
    });
    expect(out.ok).toBe(false);
  });
});
