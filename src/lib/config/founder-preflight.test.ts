import { describe, expect, it } from "vitest";
import {
  buildFounderPreflightReport,
  formatFounderPreflightReport,
} from "./founder-preflight";

describe("founder preflight", () => {
  it("surfaces database as the first blocked founder action when no env is set", () => {
    const report = buildFounderPreflightReport({});

    expect(report.readyCount).toBe(0);
    expect(report.totalCount).toBe(6);
    expect(report.nextAction).toMatchObject({
      id: "database",
      label: "Database",
      missingEnv: ["DATABASE_URL|POSTGRES_URL"],
    });
  });

  it("moves to auth after the database connection is configured", () => {
    const report = buildFounderPreflightReport({
      DATABASE_URL: "postgres://example",
    });

    expect(report.liveGates).toContain("database");
    expect(report.nextAction).toMatchObject({
      id: "auth",
      missingEnv: ["CLERK_SECRET_KEY", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"],
    });
  });

  it("keeps the formatted report free of secret values", () => {
    const text = formatFounderPreflightReport(
      buildFounderPreflightReport({
        POSTGRES_URL: "postgres://super-secret-password@example",
        CLERK_SECRET_KEY: "sk_live_secret",
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_live_public",
        SOUS_AUTH_ENABLED: "false",
      }),
    );

    expect(text).toContain("Founder unlock preflight");
    expect(text).toContain("configured: POSTGRES_URL");
    expect(text).toContain("blocked by: SOUS_AUTH_ENABLED");
    expect(text).not.toContain("super-secret-password");
    expect(text).not.toContain("sk_live_secret");
    expect(text).not.toContain("pk_live_public");
  });
});
