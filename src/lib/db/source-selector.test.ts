import { describe, expect, it } from "vitest";
import { selectDataSource } from "./source-selector";

describe("selectDataSource", () => {
  it("returns local mode when DATABASE_URL is missing (browser)", () => {
    const out = selectDataSource({ hasDatabaseUrl: false, isBrowser: true });
    expect(out.kind).toBe("local");
    expect(out.rationale).toMatch(/localStorage/);
  });

  it("returns local mode when DATABASE_URL is missing (SSR)", () => {
    const out = selectDataSource({ hasDatabaseUrl: false, isBrowser: false });
    expect(out.kind).toBe("local");
  });

  it("returns postgres mode in browser when DATABASE_URL is set", () => {
    const out = selectDataSource({ hasDatabaseUrl: true, isBrowser: true });
    expect(out.kind).toBe("postgres");
    expect(out.rationale).toMatch(/hydrates from Postgres/);
  });

  it("returns postgres mode in SSR when DATABASE_URL is set", () => {
    const out = selectDataSource({ hasDatabaseUrl: true, isBrowser: false });
    expect(out.kind).toBe("postgres");
    expect(out.rationale).toMatch(/Server-side/);
  });

  it("rationale is non-empty in every mode", () => {
    const cases = [
      { hasDatabaseUrl: false, isBrowser: true },
      { hasDatabaseUrl: false, isBrowser: false },
      { hasDatabaseUrl: true, isBrowser: true },
      { hasDatabaseUrl: true, isBrowser: false },
    ];
    for (const c of cases) {
      const out = selectDataSource(c);
      expect(out.rationale.length).toBeGreaterThan(0);
    }
  });
});
