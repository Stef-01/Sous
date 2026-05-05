import { describe, expect, it } from "vitest";
import {
  classifyDate,
  classifyHour,
  TIME_OF_DAY_ORDER,
  timeOfDayLabel,
} from "./time-of-day";

describe("classifyHour — bucket boundaries", () => {
  it("4:59am is late-night (boundary just before morning)", () => {
    expect(classifyHour({ hour: 4 })).toBe("late-night");
  });

  it("5:00am exactly is morning (start boundary)", () => {
    expect(classifyHour({ hour: 5 })).toBe("morning");
  });

  it("10:59am is morning (just before lunch)", () => {
    expect(classifyHour({ hour: 10 })).toBe("morning");
  });

  it("11:00am is lunch (boundary)", () => {
    expect(classifyHour({ hour: 11 })).toBe("lunch");
  });

  it("13:59 is lunch (just before afternoon)", () => {
    expect(classifyHour({ hour: 13 })).toBe("lunch");
  });

  it("14:00 is afternoon (boundary)", () => {
    expect(classifyHour({ hour: 14 })).toBe("afternoon");
  });

  it("16:59 is afternoon (just before dinner)", () => {
    expect(classifyHour({ hour: 16 })).toBe("afternoon");
  });

  it("17:00 is dinner (boundary)", () => {
    expect(classifyHour({ hour: 17 })).toBe("dinner");
  });

  it("20:59 is dinner (just before late-night)", () => {
    expect(classifyHour({ hour: 20 })).toBe("dinner");
  });

  it("21:00 is late-night (boundary)", () => {
    expect(classifyHour({ hour: 21 })).toBe("late-night");
  });

  it("23:30 is late-night (mid-evening)", () => {
    expect(classifyHour({ hour: 23 })).toBe("late-night");
  });

  it("0:00 (midnight) is late-night (wraps)", () => {
    expect(classifyHour({ hour: 0 })).toBe("late-night");
  });

  it("3:00am is late-night (wraps midnight)", () => {
    expect(classifyHour({ hour: 3 })).toBe("late-night");
  });
});

describe("classifyHour — defensive inputs", () => {
  it("returns 'morning' for non-finite hour (defensive default)", () => {
    expect(classifyHour({ hour: Number.NaN })).toBe("morning");
    expect(classifyHour({ hour: Number.POSITIVE_INFINITY })).toBe("morning");
  });

  it("normalises hours over 23 into 0-23 range", () => {
    expect(classifyHour({ hour: 26 })).toBe(classifyHour({ hour: 2 }));
    expect(classifyHour({ hour: 50 })).toBe(classifyHour({ hour: 2 }));
  });

  it("normalises negative hours via mod 24", () => {
    // -1 mod 24 = 23 → late-night
    expect(classifyHour({ hour: -1 })).toBe("late-night");
  });

  it("floors fractional hours (8.7 → 8 → morning)", () => {
    expect(classifyHour({ hour: 8.7 })).toBe("morning");
  });
});

describe("classifyDate", () => {
  it("classifies a Date object using its local hour", () => {
    const sevenAm = new Date(2026, 4, 4, 7, 30);
    expect(classifyDate(sevenAm)).toBe("morning");
    const sevenPm = new Date(2026, 4, 4, 19, 0);
    expect(classifyDate(sevenPm)).toBe("dinner");
  });

  it("returns 'morning' for an invalid Date (defensive)", () => {
    expect(classifyDate(new Date("nope"))).toBe("morning");
  });

  it("returns 'morning' when given a non-Date value", () => {
    expect(classifyDate("string" as unknown as Date)).toBe("morning");
    expect(classifyDate(null as unknown as Date)).toBe("morning");
  });
});

describe("timeOfDayLabel", () => {
  it("returns Title-case labels for every bucket", () => {
    expect(timeOfDayLabel("morning")).toBe("Morning");
    expect(timeOfDayLabel("lunch")).toBe("Lunch");
    expect(timeOfDayLabel("afternoon")).toBe("Afternoon");
    expect(timeOfDayLabel("dinner")).toBe("Dinner");
    expect(timeOfDayLabel("late-night")).toBe("Late night");
  });
});

describe("TIME_OF_DAY_ORDER", () => {
  it("contains all 5 buckets in chronological order", () => {
    expect(TIME_OF_DAY_ORDER).toEqual([
      "morning",
      "lunch",
      "afternoon",
      "dinner",
      "late-night",
    ]);
  });
});
