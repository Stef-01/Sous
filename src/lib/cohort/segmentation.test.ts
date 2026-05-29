import { describe, expect, it } from "vitest";
import {
  buildSegmentLabel,
  classifyEngagementTier,
  isoWeekKey,
  rollupCohorts,
  totalsByTier,
  type UserCohortInput,
} from "./segmentation";

describe("isoWeekKey", () => {
  it("returns YYYY-Www for a mid-year date", () => {
    expect(isoWeekKey(new Date("2026-05-04T00:00:00Z"))).toBe("2026-W19");
  });

  it("zero-pads the week number", () => {
    expect(isoWeekKey(new Date("2026-01-05T00:00:00Z"))).toBe("2026-W02");
  });

  it("handles year boundary correctly (week 53 / week 1)", () => {
    // 2026-01-04 falls in W01 (per ISO 8601).
    expect(isoWeekKey(new Date("2026-01-04T00:00:00Z"))).toBe("2026-W01");
  });

  it("returns empty string for invalid date", () => {
    expect(isoWeekKey(new Date("not a date"))).toBe("");
  });
});

describe("classifyEngagementTier", () => {
  it("dormant for zero cooks", () => {
    expect(classifyEngagementTier(0)).toBe("dormant");
  });

  it("casual for 1-3 cooks", () => {
    expect(classifyEngagementTier(1)).toBe("casual");
    expect(classifyEngagementTier(3)).toBe("casual");
  });

  it("regular for 4-11 cooks", () => {
    expect(classifyEngagementTier(4)).toBe("regular");
    expect(classifyEngagementTier(11)).toBe("regular");
  });

  it("core for 12+ cooks", () => {
    expect(classifyEngagementTier(12)).toBe("core");
    expect(classifyEngagementTier(50)).toBe("core");
  });

  it("treats negative input as dormant (defensive)", () => {
    expect(classifyEngagementTier(-1)).toBe("dormant");
  });
});

describe("buildSegmentLabel", () => {
  it("composes acquisitionWeek/engagementTier", () => {
    const label = buildSegmentLabel({
      firstCookAt: "2026-05-04T00:00:00Z",
      cooksLast28Days: 8,
    });
    expect(label.acquisitionWeek).toBe("2026-W19");
    expect(label.engagementTier).toBe("regular");
    expect(label.segmentKey).toBe("2026-W19/regular");
  });

  it("uses 'unknown' acquisition week for invalid input", () => {
    const label = buildSegmentLabel({
      firstCookAt: "not a date",
      cooksLast28Days: 0,
    });
    expect(label.acquisitionWeek).toBe("unknown");
    expect(label.segmentKey).toBe("unknown/dormant");
  });
});

describe("rollupCohorts", () => {
  const users: UserCohortInput[] = [
    {
      userId: "u1",
      firstCookAt: "2026-05-04T00:00:00Z",
      cooksLast28Days: 5,
    },
    {
      userId: "u2",
      firstCookAt: "2026-05-04T00:00:00Z",
      cooksLast28Days: 6,
    },
    {
      userId: "u3",
      firstCookAt: "2026-05-04T00:00:00Z",
      cooksLast28Days: 0,
    },
    {
      userId: "u4",
      firstCookAt: "2026-04-27T00:00:00Z",
      cooksLast28Days: 14,
    },
  ];

  it("groups same (week, tier) into one row", () => {
    const out = rollupCohorts({ users });
    const regular = out.find((r) => r.segmentKey === "2026-W19/regular");
    expect(regular?.userCount).toBe(2);
  });

  it("preserves distinct segments", () => {
    const out = rollupCohorts({ users });
    expect(out.length).toBeGreaterThanOrEqual(3);
    expect(out.some((r) => r.engagementTier === "core")).toBe(true);
    expect(out.some((r) => r.engagementTier === "dormant")).toBe(true);
  });

  it("sorts by acquisitionWeek desc then tier order (core first)", () => {
    const out = rollupCohorts({ users });
    // First group should be 2026-W19 (latest week).
    expect(out[0].acquisitionWeek).toBe("2026-W19");
  });

  it("returns empty array for no users", () => {
    expect(rollupCohorts({ users: [] })).toEqual([]);
  });
});

describe("totalsByTier", () => {
  it("counts each user into exactly one tier", () => {
    const out = totalsByTier({
      users: [
        {
          userId: "1",
          firstCookAt: "2026-05-04T00:00:00Z",
          cooksLast28Days: 0,
        },
        {
          userId: "2",
          firstCookAt: "2026-05-04T00:00:00Z",
          cooksLast28Days: 2,
        },
        {
          userId: "3",
          firstCookAt: "2026-05-04T00:00:00Z",
          cooksLast28Days: 5,
        },
        {
          userId: "4",
          firstCookAt: "2026-05-04T00:00:00Z",
          cooksLast28Days: 20,
        },
      ],
    });
    expect(out.dormant).toBe(1);
    expect(out.casual).toBe(1);
    expect(out.regular).toBe(1);
    expect(out.core).toBe(1);
  });

  it("returns all-zero record for empty input", () => {
    expect(totalsByTier({ users: [] })).toEqual({
      dormant: 0,
      casual: 0,
      regular: 0,
      core: 0,
    });
  });
});
