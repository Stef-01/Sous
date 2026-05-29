import { describe, expect, it } from "vitest";
import type { UserCohortInput } from "./segmentation";
import {
  buildSnapshot,
  buildTierTrend,
  diffSnapshots,
  pickSnapshotAt,
  type CohortSnapshot,
} from "./snapshot-ledger";

const user = (overrides: Partial<UserCohortInput> = {}): UserCohortInput => ({
  userId: "u-1",
  firstCookAt: "2026-05-04T00:00:00Z",
  cooksLast28Days: 5,
  ...overrides,
});

describe("buildSnapshot", () => {
  it("emits tier totals and segment counts", () => {
    const snap = buildSnapshot({
      users: [
        user({ userId: "1", cooksLast28Days: 0 }),
        user({ userId: "2", cooksLast28Days: 2 }),
        user({ userId: "3", cooksLast28Days: 5 }),
        user({ userId: "4", cooksLast28Days: 20 }),
      ],
      capturedAt: new Date("2026-05-10T00:00:00Z"),
    });
    expect(snap.tierTotals).toEqual({
      dormant: 1,
      casual: 1,
      regular: 1,
      core: 1,
    });
    expect(Object.keys(snap.segmentCounts)).toHaveLength(4);
  });

  it("groups same-segment users into one count", () => {
    const snap = buildSnapshot({
      users: [
        user({ userId: "1", cooksLast28Days: 5 }),
        user({ userId: "2", cooksLast28Days: 7 }),
      ],
      capturedAt: new Date("2026-05-10T00:00:00Z"),
    });
    // Both classified as "regular" with the same firstCookAt.
    expect(snap.segmentCounts["2026-W19/regular"]).toBe(2);
  });

  it("captures the snapshot timestamp as ISO", () => {
    const snap = buildSnapshot({
      users: [],
      capturedAt: new Date("2026-05-10T12:30:00Z"),
    });
    expect(snap.capturedAt).toBe("2026-05-10T12:30:00.000Z");
  });
});

describe("buildTierTrend", () => {
  it("sorts ascending by capturedAt", () => {
    const snaps: CohortSnapshot[] = [
      {
        capturedAt: "2026-05-10T00:00:00.000Z",
        segmentCounts: {},
        tierTotals: { dormant: 0, casual: 1, regular: 1, core: 1 },
      },
      {
        capturedAt: "2026-05-03T00:00:00.000Z",
        segmentCounts: {},
        tierTotals: { dormant: 0, casual: 0, regular: 1, core: 0 },
      },
    ];
    const trend = buildTierTrend({ snapshots: snaps });
    expect(trend[0].capturedAt).toBe("2026-05-03T00:00:00.000Z");
    expect(trend[1].capturedAt).toBe("2026-05-10T00:00:00.000Z");
  });
});

describe("diffSnapshots", () => {
  const previous: CohortSnapshot = {
    capturedAt: "2026-05-03T00:00:00.000Z",
    segmentCounts: {
      "2026-W19/regular": 5,
      "2026-W19/casual": 3,
    },
    tierTotals: { dormant: 0, casual: 3, regular: 5, core: 0 },
  };
  const current: CohortSnapshot = {
    capturedAt: "2026-05-10T00:00:00.000Z",
    segmentCounts: {
      "2026-W19/regular": 8,
      "2026-W19/core": 2,
    },
    tierTotals: { dormant: 0, casual: 0, regular: 8, core: 2 },
  };

  it("computes per-segment delta covering both snapshots' keys", () => {
    const deltas = diffSnapshots({ current, previous });
    const regular = deltas.find((d) => d.segmentKey === "2026-W19/regular");
    expect(regular?.delta).toBe(3); // 8 - 5
    const casual = deltas.find((d) => d.segmentKey === "2026-W19/casual");
    expect(casual?.delta).toBe(-3); // 0 - 3
    const core = deltas.find((d) => d.segmentKey === "2026-W19/core");
    expect(core?.delta).toBe(2); // 2 - 0
  });

  it("sorts by |delta| descending", () => {
    const deltas = diffSnapshots({ current, previous });
    expect(Math.abs(deltas[0].delta)).toBeGreaterThanOrEqual(
      Math.abs(deltas[1].delta),
    );
  });
});

describe("pickSnapshotAt", () => {
  const snaps: CohortSnapshot[] = [
    {
      capturedAt: "2026-05-01T00:00:00.000Z",
      segmentCounts: {},
      tierTotals: { dormant: 0, casual: 0, regular: 0, core: 0 },
    },
    {
      capturedAt: "2026-05-05T00:00:00.000Z",
      segmentCounts: {},
      tierTotals: { dormant: 0, casual: 0, regular: 0, core: 0 },
    },
    {
      capturedAt: "2026-05-10T00:00:00.000Z",
      segmentCounts: {},
      tierTotals: { dormant: 0, casual: 0, regular: 0, core: 0 },
    },
  ];

  it("picks the closest snapshot at or before the target", () => {
    const picked = pickSnapshotAt({
      snapshots: snaps,
      at: new Date("2026-05-07T00:00:00Z"),
    });
    expect(picked?.capturedAt).toBe("2026-05-05T00:00:00.000Z");
  });

  it("returns null when no snapshot exists at or before target", () => {
    const picked = pickSnapshotAt({
      snapshots: snaps,
      at: new Date("2026-04-01T00:00:00Z"),
    });
    expect(picked).toBeNull();
  });

  it("picks exact-match capturedAt", () => {
    const picked = pickSnapshotAt({
      snapshots: snaps,
      at: new Date("2026-05-05T00:00:00Z"),
    });
    expect(picked?.capturedAt).toBe("2026-05-05T00:00:00.000Z");
  });
});
