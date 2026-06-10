import { describe, expect, it } from "vitest";
import { mergeRemoteEntries, type SyncEntry } from "./diary-sync";
import type { DiaryEntry } from "@/lib/hooks/use-nutrition-diary";

const local = (slug: string, at: string): DiaryEntry => ({
  slug,
  name: slug,
  servings: 1,
  at,
});
const remote = (
  day: string,
  at: string,
  slug: string,
  deleted = false,
): SyncEntry => ({ day, at, slug, name: slug, servings: 1, deleted });

describe("mergeRemoteEntries (#1 sync — the pure core)", () => {
  it("adds unseen remote entries to their day (sorted by at)", () => {
    const out = mergeRemoteEntries({ "2026-06-09": [local("a", "T2")] }, [
      remote("2026-06-09", "T1", "b"),
      remote("2026-06-10", "T3", "c"),
    ]);
    expect(out.changed).toBe(true);
    expect(out.store["2026-06-09"].map((e) => e.at)).toEqual(["T1", "T2"]);
    expect(out.store["2026-06-10"].map((e) => e.slug)).toEqual(["c"]);
  });

  it("remote tombstones delete matching local entries", () => {
    const out = mergeRemoteEntries(
      { "2026-06-09": [local("a", "T1"), local("b", "T2")] },
      [remote("2026-06-09", "T1", "a", true)],
    );
    expect(out.changed).toBe(true);
    expect(out.store["2026-06-09"].map((e) => e.at)).toEqual(["T2"]);
  });

  it("tombstones for entries we never had are a no-op (idempotent replays)", () => {
    const before = { "2026-06-09": [local("a", "T1")] };
    const out = mergeRemoteEntries(before, [
      remote("2026-06-09", "T9", "ghost", true),
    ]);
    expect(out.changed).toBe(false);
    expect(out.store).toBe(before); // same reference when nothing changed
  });

  it("local-only entries are returned for push (first-sync upload), known ones are not", () => {
    const out = mergeRemoteEntries(
      { "2026-06-09": [local("a", "T1"), local("b", "T2")] },
      [remote("2026-06-09", "T1", "a")],
    );
    expect(out.toPush.map((e) => e.at)).toEqual(["T2"]);
    expect(out.toPush[0].day).toBe("2026-06-09");
  });

  it("a clean two-device union converges (merge is symmetric on live rows)", () => {
    const deviceA = { d: [local("a", "T1")] };
    const fromB = [remote("d", "T2", "b")];
    const merged = mergeRemoteEntries(deviceA, fromB);
    expect(merged.store["d"].map((e) => e.at).sort()).toEqual(["T1", "T2"]);
    expect(merged.toPush.map((e) => e.at)).toEqual(["T1"]);
  });
});
