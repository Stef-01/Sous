import { describe, expect, it } from "vitest";
import {
  herbsDueForReview,
  EVIDENCE_REVIEW_CADENCE_DAYS,
} from "./evidence-freshness";
import { AYURVEDIC_HERBS } from "@/data/ayurvedic-evidence";

const reviewed = Date.parse("2026-06-08");
const DAY = 86_400_000;

describe("evidence freshness job (W31)", () => {
  it("nothing is due right after review", () => {
    expect(herbsDueForReview(reviewed + 30 * DAY)).toEqual([]);
  });
  it("everything is due once the cadence has elapsed", () => {
    const due = herbsDueForReview(
      reviewed + (EVIDENCE_REVIEW_CADENCE_DAYS + 5) * DAY,
    );
    expect(due.length).toBe(AYURVEDIC_HERBS.length);
  });
  it("the cadence is honoured exactly (nothing due at the boundary)", () => {
    expect(
      herbsDueForReview(reviewed + (EVIDENCE_REVIEW_CADENCE_DAYS - 1) * DAY),
    ).toEqual([]);
  });
});
