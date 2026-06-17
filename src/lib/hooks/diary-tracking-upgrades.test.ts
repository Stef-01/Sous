import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  frequentDishes,
  diaryLogCook,
  diaryUpdateServings,
  diaryRemoveEntry,
  diaryRemoveBatch,
  dayKey,
  type DiaryEntry,
} from "./use-nutrition-diary";

const NOW = new Date("2026-06-09T12:00:00");
const entry = (slug: string, at: string, brand?: string): DiaryEntry => ({
  slug,
  name: slug,
  servings: 1,
  at,
  ...(brand ? { brand } : {}),
});
const back = (n: number) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - n);
  return dayKey(d);
};

describe("frequentDishes — stage 4 quick-add ranking", () => {
  it("ranks staples (higher 30-day count) above newer one-offs", () => {
    const store = {
      [back(0)]: [entry("oatmeal", "2026-06-09T08:00:00Z")],
      [back(1)]: [
        entry("oatmeal", "2026-06-08T08:00:00Z"),
        entry("sushi", "2026-06-08T19:00:00Z"),
      ],
      [back(2)]: [entry("oatmeal", "2026-06-07T08:00:00Z")],
    };
    const out = frequentDishes(store, 6, NOW).map((d) => d.slug);
    expect(out[0]).toBe("oatmeal"); // 3 logs beats sushi's 1, despite sushi being recent
    expect(out).toContain("sushi");
  });

  it("ties break by recency and entries older than 30 days are ignored", () => {
    const store = {
      [back(0)]: [entry("a", "2026-06-09T10:00:00Z")],
      [back(1)]: [entry("b", "2026-06-08T10:00:00Z")],
      [back(40)]: [
        entry("old", "2026-04-30T10:00:00Z"),
        entry("old", "2026-04-30T11:00:00Z"),
      ],
    };
    const out = frequentDishes(store, 6, NOW).map((d) => d.slug);
    expect(out).toEqual(["a", "b"]); // a newer than b; old (2 logs) outside window
  });

  it("excludes branded entries and respects the limit", () => {
    const store = {
      [back(0)]: [
        entry("dish", "2026-06-09T10:00:00Z"),
        entry("off:123", "2026-06-09T11:00:00Z", "BrandCo"),
      ],
    };
    expect(frequentDishes(store, 6, NOW).map((d) => d.slug)).toEqual(["dish"]);
    expect(frequentDishes(store, 0, NOW)).toEqual([]);
  });
});

describe("store actions — stage 3 update-servings + stage 5 date-aware", () => {
  beforeEach(() => {
    const mem: Record<string, string> = {};
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => mem[k] ?? null,
        setItem: (k: string, v: string) => {
          mem[k] = v;
        },
      },
    });
  });

  const todayEntries = () =>
    JSON.parse(window.localStorage.getItem("sous-nutrition-diary-v1") ?? "{}")[
      dayKey(new Date())
    ] ?? [];

  it("diaryUpdateServings edits in place; invalid values are ignored", () => {
    diaryLogCook("dal", "Masoor Dal", 1);
    const at = todayEntries()[0].at;
    diaryUpdateServings(at, 2.5);
    expect(todayEntries()[0].servings).toBe(2.5);
    diaryUpdateServings(at, 0); // ignored
    diaryUpdateServings(at, NaN); // ignored
    expect(todayEntries()[0].servings).toBe(2.5);
  });

  it("diaryLogCook with a past date writes to that day; remove honours the date", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    diaryLogCook("pho", "Pho", 1, { date: yesterday });
    const store = JSON.parse(
      window.localStorage.getItem("sous-nutrition-diary-v1") ?? "{}",
    );
    const yEntries = store[dayKey(yesterday)] ?? [];
    expect(yEntries.some((e: DiaryEntry) => e.slug === "pho")).toBe(true);
    diaryRemoveEntry(yEntries[0].at, yesterday);
    const after = JSON.parse(
      window.localStorage.getItem("sous-nutrition-diary-v1") ?? "{}",
    );
    expect((after[dayKey(yesterday)] ?? []).length).toBe(yEntries.length - 1);
  });

  // P0: combined cook logged N dishes but Undo removed only the main, orphaning
  // the sides. diaryRemoveBatch un-logs the whole session.
  // (The diary store is a module singleton whose in-memory snapshot accumulates
  // across tests, so assertions filter by a unique batchId rather than absolute
  // store length.)
  const batchCount = (id: string) =>
    todayEntries().filter((e: DiaryEntry) => e.batchId === id).length;

  it("diaryRemoveBatch removes every dish sharing a batchId", () => {
    diaryLogCook("main", "Main", 1, { auto: true, batchId: "b-rm" });
    diaryLogCook("side-a", "Side A", 1, { auto: true, batchId: "b-rm" });
    diaryLogCook("side-b", "Side B", 1, { auto: true, batchId: "b-rm" });
    expect(batchCount("b-rm")).toBe(3);
    const removed = diaryRemoveBatch("b-rm");
    expect(removed.length).toBe(3);
    expect(batchCount("b-rm")).toBe(0);
  });

  it("diaryRemoveBatch leaves non-batch + other-batch entries untouched", () => {
    diaryLogCook("plain", "Plain", 1); // no batchId
    diaryLogCook("s1-dish", "S1", 1, { auto: true, batchId: "b-keep-1" });
    diaryLogCook("s2-dish", "S2", 1, { auto: true, batchId: "b-keep-2" });
    diaryRemoveBatch("b-keep-1");
    const slugs = todayEntries().map((e: DiaryEntry) => e.slug);
    expect(slugs).toContain("plain");
    expect(slugs).toContain("s2-dish");
    expect(slugs).not.toContain("s1-dish");
  });

  it("diaryRemoveBatch with an unknown id is a no-op", () => {
    diaryLogCook("a", "A", 1, { auto: true, batchId: "b-noop" });
    diaryLogCook("b", "B", 1, { auto: true, batchId: "b-noop" });
    const before = todayEntries().length;
    expect(diaryRemoveBatch("nope")).toEqual([]);
    expect(todayEntries().length).toBe(before);
  });

  it("diaryRemoveBatch spans days (cross-midnight session)", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    diaryLogCook("today-dish", "Today", 1, { auto: true, batchId: "b-span" });
    diaryLogCook("yday-dish", "Yday", 1, {
      auto: true,
      batchId: "b-span",
      date: yesterday,
    });
    const removed = diaryRemoveBatch("b-span");
    expect(removed.length).toBe(2);
    const store = JSON.parse(
      window.localStorage.getItem("sous-nutrition-diary-v1") ?? "{}",
    );
    const leftWithBatch = Object.values(store)
      .flat()
      .filter((e) => (e as DiaryEntry).batchId === "b-span");
    expect(leftWithBatch.length).toBe(0);
  });
});
