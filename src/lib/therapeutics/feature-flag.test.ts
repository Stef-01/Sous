import { describe, expect, it, afterEach } from "vitest";
import { therapeuticsActive } from "./feature-flag";

/**
 * Guards the safety-critical activation policy for Culinary Therapeutics
 * (educational mode). The defaults must keep the feature OFF in test +
 * production (preserving the dormancy golden guarantee and the G5 legal gate),
 * and only an explicit env opt-in turns it on in prod.
 */
describe("therapeuticsActive — educational-mode gate", () => {
  const original = process.env.NEXT_PUBLIC_THERAPEUTICS_ACTIVE;
  afterEach(() => {
    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_THERAPEUTICS_ACTIVE;
    } else {
      process.env.NEXT_PUBLIC_THERAPEUTICS_ACTIVE = original;
    }
  });

  it("is OFF by default in the test env — dormancy + golden guarantee preserved", () => {
    delete process.env.NEXT_PUBLIC_THERAPEUTICS_ACTIVE;
    // NODE_ENV is "test" here, which is neither "development" nor an explicit
    // opt-in, so the feature must stay dormant.
    expect(therapeuticsActive()).toBe(false);
  });

  it("explicit '1' activates it (the founder's post-G5 production one-flip)", () => {
    process.env.NEXT_PUBLIC_THERAPEUTICS_ACTIVE = "1";
    expect(therapeuticsActive()).toBe(true);
  });

  it("explicit '0' is a hard kill switch regardless of environment", () => {
    process.env.NEXT_PUBLIC_THERAPEUTICS_ACTIVE = "0";
    expect(therapeuticsActive()).toBe(false);
  });
});
