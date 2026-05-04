import { describe, expect, it } from "vitest";
import type { CohortSnapshot } from "./snapshot-ledger";
import { summariseCohortDashboard } from "./dashboard-summary";

const snap = (overrides: Partial<CohortSnapshot> = {}): CohortSnapshot => ({
  capturedAt: "2026-05-10T00:00:00.000Z",
  segmentCounts: {},
  tierTotals: { dormant: 1, casual: 2, regular: 3, core: 4 },
  ...overrides,
});

describe("summariseCohortDashboard", () => {
  it("returns zeros when no snapshots present", () => {
    const out = summariseCohortDashboard({ snapshots: [] });
    expect(out.latestCapturedAt).toBeNull();
    expect(out.totalUsers).toBe(0);
    expect(out.engagementRate).toBe(0);
    expect(out.topMovers).toEqual([]);
  });

  it("uses latest snapshot for tierTotals + totalUsers", () => {
    const out = summariseCohortDashboard({
      snapshots: [
        snap({ capturedAt: "2026-05-01T00:00:00.000Z" }),
        snap({
          capturedAt: "2026-05-10T00:00:00.000Z",
          tierTotals: { dormant: 5, casual: 5, regular: 10, core: 10 },
        }),
      ],
    });
    expect(out.latestCapturedAt).toBe("2026-05-10T00:00:00.000Z");
    expect(out.totalUsers).toBe(30);
    expect(out.tierTotals.regular).toBe(10);
  });

  it("computes engagement rate as (regular + core) / total", () => {
    const out = summariseCohortDashboard({
      snapshots: [
        snap({
          tierTotals: { dormant: 0, casual: 10, regular: 30, core: 10 },
        }),
      ],
    });
    expect(out.engagementRate).toBeCloseTo(0.8, 3);
  });

  it("returns engagement 0 when no users", () => {
    const out = summariseCohortDashboard({
      snapshots: [
        snap({
          tierTotals: { dormant: 0, casual: 0, regular: 0, core: 0 },
        }),
      ],
    });
    expect(out.engagementRate).toBe(0);
  });

  it("emits empty topMovers + zero deltas with single snapshot", () => {
    const out = summariseCohortDashboard({ snapshots: [snap()] });
    expect(out.topMovers).toEqual([]);
    expect(out.tierDeltas.regular).toBe(0);
    expect(out.tierDeltas.core).toBe(0);
  });

  it("computes tier deltas vs previous snapshot", () => {
    const out = summariseCohortDashboard({
      snapshots: [
        snap({
          capturedAt: "2026-05-01T00:00:00.000Z",
          tierTotals: { dormant: 5, casual: 5, regular: 5, core: 5 },
        }),
        snap({
          capturedAt: "2026-05-10T00:00:00.000Z",
          tierTotals: { dormant: 3, casual: 5, regular: 8, core: 10 },
        }),
      ],
    });
    expect(out.tierDeltas.dormant).toBe(-2);
    expect(out.tierDeltas.casual).toBe(0);
    expect(out.tierDeltas.regular).toBe(3);
    expect(out.tierDeltas.core).toBe(5);
  });

  it("returns top movers sorted by absolute delta desc", () => {
    const out = summariseCohortDashboard({
      snapshots: [
        snap({
          capturedAt: "2026-05-01T00:00:00.000Z",
          segmentCounts: { "a/regular": 1, "b/regular": 5 },
        }),
        snap({
          capturedAt: "2026-05-10T00:00:00.000Z",
          segmentCounts: { "a/regular": 10, "b/regular": 5 },
        }),
      ],
    });
    // a/regular: +9 ; b/regular: 0 → a is the top mover.
    expect(out.topMovers[0].segmentKey).toBe("a/regular");
    expect(out.topMovers[0].delta).toBe(9);
  });

  it("caps topMovers at 5 entries", () => {
    const segmentCountsCurrent: Record<string, number> = {};
    const segmentCountsPrev: Record<string, number> = {};
    for (let i = 0; i < 10; i++) {
      segmentCountsCurrent[`seg-${i}/regular`] = i + 1;
      segmentCountsPrev[`seg-${i}/regular`] = 0;
    }
    const out = summariseCohortDashboard({
      snapshots: [
        snap({
          capturedAt: "2026-05-01T00:00:00.000Z",
          segmentCounts: segmentCountsPrev,
        }),
        snap({
          capturedAt: "2026-05-10T00:00:00.000Z",
          segmentCounts: segmentCountsCurrent,
        }),
      ],
    });
    expect(out.topMovers).toHaveLength(5);
  });
});
