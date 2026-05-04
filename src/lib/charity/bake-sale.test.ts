import { describe, expect, it } from "vitest";
import {
  DEFAULT_BAKE_SALE_ROLES,
  aggregatePodShoppingList,
  assignRoles,
  formatReflectionCard,
} from "./bake-sale";

// ── aggregatePodShoppingList ──────────────────────────────

describe("aggregatePodShoppingList", () => {
  it("empty pod → empty list", () => {
    expect(aggregatePodShoppingList([])).toEqual([]);
  });

  it("single member single item", () => {
    const out = aggregatePodShoppingList([
      { name: "Alice", items: [{ item: "flour" }] },
    ]);
    expect(out.length).toBe(1);
    expect(out[0]?.name).toBe("flour");
    expect(out[0]?.totalCount).toBe(1);
    expect(out[0]?.contributors).toEqual(["Alice"]);
  });

  it("two members same item → totalCount sums + both contributors", () => {
    const out = aggregatePodShoppingList([
      { name: "Alice", items: [{ item: "flour" }] },
      { name: "Bob", items: [{ item: "flour" }] },
    ]);
    expect(out.length).toBe(1);
    expect(out[0]?.totalCount).toBe(2);
    expect(out[0]?.contributors).toEqual(["Alice", "Bob"]);
  });

  it("normalises 'Fresh Basil Leaves' + 'basil' to one row", () => {
    const out = aggregatePodShoppingList([
      { name: "Alice", items: [{ item: "Fresh Basil Leaves" }] },
      { name: "Bob", items: [{ item: "basil" }] },
    ]);
    expect(out.length).toBe(1);
    expect(out[0]?.totalCount).toBe(2);
  });

  it("multiplier doubles the count", () => {
    const out = aggregatePodShoppingList([
      { name: "Alice", items: [{ item: "flour", multiplier: 3 }] },
    ]);
    expect(out[0]?.totalCount).toBe(3);
  });

  it("0 / negative / NaN multiplier → item dropped", () => {
    const out = aggregatePodShoppingList([
      {
        name: "Alice",
        items: [
          { item: "x", multiplier: 0 },
          { item: "y", multiplier: -1 },
          { item: "z", multiplier: Number.NaN },
        ],
      },
    ]);
    expect(out).toEqual([]);
  });

  it("output sorted alphabetically", () => {
    const out = aggregatePodShoppingList([
      {
        name: "Alice",
        items: [{ item: "zucchini" }, { item: "apple" }, { item: "mango" }],
      },
    ]);
    const names = out.map((e) => e.name);
    expect(names).toEqual([...names].sort());
  });

  it("empty / whitespace items dropped", () => {
    const out = aggregatePodShoppingList([
      { name: "Alice", items: [{ item: "" }, { item: "  " }] },
    ]);
    expect(out).toEqual([]);
  });
});

// ── assignRoles ───────────────────────────────────────────

describe("assignRoles", () => {
  it("members <= roles: each member gets a unique role", () => {
    const out = assignRoles(["A", "B", "C"], ["baker", "setup", "cashier"]);
    expect(out.assignments.map((a) => a.member)).toEqual(["A", "B", "C"]);
    expect(out.assignments.map((a) => a.role)).toEqual([
      "baker",
      "setup",
      "cashier",
    ]);
    expect(out.unassignedRoles).toEqual([]);
  });

  it("members > roles: roles repeat in order", () => {
    const out = assignRoles(["A", "B", "C", "D", "E"], ["baker", "setup"]);
    expect(out.assignments.map((a) => a.role)).toEqual([
      "baker",
      "setup",
      "baker",
      "setup",
      "baker",
    ]);
    expect(out.unassignedRoles).toEqual([]);
  });

  it("roles > members: tail roles unassigned", () => {
    const out = assignRoles(
      ["A", "B"],
      ["baker", "setup", "cashier", "runner"],
    );
    expect(out.assignments.length).toBe(2);
    expect(out.unassignedRoles).toEqual(["cashier", "runner"]);
  });

  it("empty members → no assignments + all roles unassigned", () => {
    const out = assignRoles([], ["baker", "setup"]);
    expect(out.assignments).toEqual([]);
    expect(out.unassignedRoles).toEqual(["baker", "setup"]);
  });

  it("empty roles → no assignments", () => {
    const out = assignRoles(["A", "B"], []);
    expect(out.assignments).toEqual([]);
    expect(out.unassignedRoles).toEqual([]);
  });

  it("default role list when no roles passed", () => {
    const out = assignRoles(["A"]);
    expect(out.assignments[0]?.role).toBe(DEFAULT_BAKE_SALE_ROLES[0]);
  });

  it("DEFAULT_BAKE_SALE_ROLES has the 4 starter roles", () => {
    expect(DEFAULT_BAKE_SALE_ROLES).toEqual([
      "baker",
      "setup",
      "cashier",
      "runner",
    ]);
  });

  it("deterministic: same input → same output", () => {
    const a = assignRoles(["A", "B", "C"]);
    const b = assignRoles(["A", "B", "C"]);
    expect(a).toEqual(b);
  });
});

// ── formatReflectionCard ──────────────────────────────────

describe("formatReflectionCard", () => {
  it("happy path with raised + nonprofit + pod + date", () => {
    const out = formatReflectionCard({
      raisedMinor: 12000,
      currency: "USD",
      nonprofit: { name: "Sample Charity" },
      eventDate: "2026-05-17",
      podName: "Saturday Pod",
    });
    expect(out).toContain("$120");
    expect(out).toContain("Sample Charity");
    expect(out).toContain("Saturday Pod");
    expect(out).toContain("2026-05-17");
  });

  it("0 raised → thank-you variant (no '$0' framing)", () => {
    const out = formatReflectionCard({
      raisedMinor: 0,
      currency: "USD",
      nonprofit: { name: "Sample Charity" },
    });
    expect(out.toLowerCase()).toContain("thank you");
    expect(out).not.toContain("$0");
  });

  it("negative raised → thank-you variant", () => {
    const out = formatReflectionCard({
      raisedMinor: -100,
      currency: "USD",
      nonprofit: { name: "Sample Charity" },
    });
    expect(out.toLowerCase()).toContain("thank you");
  });

  it("missing nonprofit name → 'the chosen charity' fallback", () => {
    const out = formatReflectionCard({
      raisedMinor: 5000,
      currency: "USD",
      nonprofit: { name: "" },
    });
    expect(out).toContain("the chosen charity");
  });

  it("missing pod name → no orphan whitespace", () => {
    const out = formatReflectionCard({
      raisedMinor: 5000,
      currency: "USD",
      nonprofit: { name: "Sample" },
    });
    expect(out).not.toMatch(/^\s+/);
    expect(out).not.toContain("  ");
  });

  it("trims whitespace in pod + nonprofit + date", () => {
    const out = formatReflectionCard({
      raisedMinor: 1000,
      currency: "USD",
      nonprofit: { name: "  Sample  " },
      podName: "  Pod  ",
      eventDate: "  2026-05-17  ",
    });
    expect(out).toContain("Sample");
    expect(out).toContain("Pod");
    expect(out).toContain("2026-05-17");
    expect(out).not.toContain("  Sample");
  });
});
