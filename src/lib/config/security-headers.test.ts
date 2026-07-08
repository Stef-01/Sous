import { describe, expect, it } from "vitest";
import {
  buildSecurityHeaders,
  shouldUseHttpsOnlyHeaders,
} from "./security-headers";

function valueFor(key: string, headers = buildSecurityHeaders()): string {
  return headers.find((header) => header.key === key)?.value ?? "";
}

describe("security headers", () => {
  it("keeps localhost production/e2e on plain HTTP", () => {
    const headers = buildSecurityHeaders({ httpsOnly: false });

    expect(valueFor("Content-Security-Policy", headers)).not.toContain(
      "upgrade-insecure-requests",
    );
    expect(
      headers.some((header) => header.key === "Strict-Transport-Security"),
    ).toBe(false);
  });

  it("keeps strict HTTPS transport headers for deployed hosts", () => {
    const headers = buildSecurityHeaders({ httpsOnly: true });

    expect(valueFor("Content-Security-Policy", headers)).toContain(
      "upgrade-insecure-requests",
    );
    expect(valueFor("Strict-Transport-Security", headers)).toContain(
      "includeSubDomains",
    );
    expect(valueFor("Strict-Transport-Security", headers)).toContain("preload");
  });

  it("enables HTTPS-only directives on Vercel or explicit opt-in", () => {
    expect(shouldUseHttpsOnlyHeaders({ VERCEL: "1" })).toBe(true);
    expect(shouldUseHttpsOnlyHeaders({ SOUS_FORCE_HTTPS_HEADERS: "1" })).toBe(
      true,
    );
    expect(shouldUseHttpsOnlyHeaders({ VERCEL: "0" })).toBe(false);
  });

  it("retains the baseline defensive headers without HTTPS-only transport", () => {
    const keys = buildSecurityHeaders({ httpsOnly: false }).map(
      (header) => header.key,
    );

    expect(keys).toEqual(
      expect.arrayContaining([
        "Content-Security-Policy",
        "X-Frame-Options",
        "X-Content-Type-Options",
        "Referrer-Policy",
        "Permissions-Policy",
      ]),
    );
  });
});
