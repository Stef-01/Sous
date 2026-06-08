import { describe, expect, it } from "vitest";
import { streakMilestone, firstMilestone } from "./milestones";

describe("milestones (W14)", () => {
  it("fires only on exact streak thresholds", () => {
    expect(streakMilestone(3)?.id).toBe("streak-3");
    expect(streakMilestone(7)?.id).toBe("streak-7");
    expect(streakMilestone(30)?.id).toBe("streak-30");
    expect(streakMilestone(4)).toBeNull();
    expect(streakMilestone(0)).toBeNull();
  });
  it("celebrates a first cook/log only at count 1", () => {
    expect(firstMilestone("cook", 1)?.id).toBe("first-cook");
    expect(firstMilestone("log", 1)?.id).toBe("first-log");
    expect(firstMilestone("cook", 2)).toBeNull();
  });
});
