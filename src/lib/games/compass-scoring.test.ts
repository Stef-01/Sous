import { describe, expect, it } from "vitest";
import {
  COMPASS_MAX_SCORE,
  compassDistancePoints,
  compassScore,
  compassTimeMultiplier,
  starsForScore,
} from "./compass-scoring";

const BANGKOK = { lat: 13.7563, lng: 100.5018 };
const NEAR_BANGKOK = { lat: 14.5, lng: 101.0 }; // ~98 km away
const PARIS = { lat: 48.8566, lng: 2.3522 };

describe("compassDistancePoints", () => {
  it("zero distance scores the max", () => {
    expect(compassDistancePoints(0)).toBe(COMPASS_MAX_SCORE);
  });

  it("decays exponentially with distance (2000km = ~1839)", () => {
    // 5000 * exp(-1) ≈ 1839
    expect(compassDistancePoints(2000)).toBeCloseTo(
      COMPASS_MAX_SCORE * Math.exp(-1),
      0,
    );
  });

  it("8000km gives <100 points (cross-continent miss)", () => {
    expect(compassDistancePoints(8000)).toBeLessThan(100);
  });

  it("returns 0 for negative or non-finite distance (defensive)", () => {
    expect(compassDistancePoints(-100)).toBe(0);
    expect(compassDistancePoints(Number.NaN)).toBe(0);
  });
});

describe("compassTimeMultiplier", () => {
  it("first 5 seconds count as 'free' → multiplier 1.0", () => {
    expect(compassTimeMultiplier(0)).toBe(1);
    expect(compassTimeMultiplier(3)).toBe(1);
    expect(compassTimeMultiplier(5)).toBe(1);
  });

  it("decays linearly past 5 seconds", () => {
    // At 35s: overrun 30 → 1 - 30/60 = 0.5
    expect(compassTimeMultiplier(35)).toBe(0.5);
    // At 20s: overrun 15 → 1 - 0.25 = 0.75
    expect(compassTimeMultiplier(20)).toBeCloseTo(0.75, 5);
  });

  it("clamps at the 0.5 floor for very long elapsed times", () => {
    expect(compassTimeMultiplier(120)).toBe(0.5);
    expect(compassTimeMultiplier(999)).toBe(0.5);
  });

  it("clamps at 1.0 for negative elapsed (defensive)", () => {
    expect(compassTimeMultiplier(-5)).toBe(1);
    expect(compassTimeMultiplier(Number.NaN)).toBe(1);
  });
});

describe("compassScore", () => {
  it("near-perfect guess in 8s scores high", () => {
    const out = compassScore({
      guess: NEAR_BANGKOK,
      answer: BANGKOK,
      elapsedSec: 8,
    });
    expect(out.distanceKm).toBeLessThan(120);
    expect(out.score).toBeGreaterThan(4400);
    expect(out.stars).toBe(5);
  });

  it("wrong continent in slow time scores poorly", () => {
    const out = compassScore({
      guess: PARIS,
      answer: BANGKOK,
      elapsedSec: 28,
    });
    expect(out.distanceKm).toBeGreaterThan(8000);
    expect(out.score).toBeLessThan(200);
    expect(out.stars).toBeLessThanOrEqual(1);
  });

  it("identical points + zero time = max score", () => {
    const out = compassScore({
      guess: BANGKOK,
      answer: BANGKOK,
      elapsedSec: 0,
    });
    expect(out.score).toBe(COMPASS_MAX_SCORE);
    expect(out.stars).toBe(5);
  });

  it("invalid guess returns 0 + NaN distance + 0 stars", () => {
    const out = compassScore({
      guess: { lat: 999, lng: 0 },
      answer: BANGKOK,
      elapsedSec: 5,
    });
    expect(out.score).toBe(0);
    expect(Number.isNaN(out.distanceKm)).toBe(true);
    expect(out.stars).toBe(0);
  });

  it("score never exceeds COMPASS_MAX_SCORE", () => {
    const out = compassScore({
      guess: BANGKOK,
      answer: BANGKOK,
      elapsedSec: 0,
    });
    expect(out.score).toBeLessThanOrEqual(COMPASS_MAX_SCORE);
  });

  it("score never goes negative", () => {
    const out = compassScore({
      guess: { lat: -90, lng: 180 },
      answer: { lat: 90, lng: -180 },
      elapsedSec: 999,
    });
    expect(out.score).toBeGreaterThanOrEqual(0);
  });
});

describe("starsForScore", () => {
  it("maps top scores to 5 stars", () => {
    expect(starsForScore(5000)).toBe(5);
    expect(starsForScore(4500)).toBe(5);
  });

  it("maps mid scores to 3-4 stars", () => {
    expect(starsForScore(4000)).toBe(4);
    expect(starsForScore(3000)).toBe(3);
  });

  it("maps low scores to 1-2 stars", () => {
    expect(starsForScore(2000)).toBe(2);
    expect(starsForScore(1000)).toBe(1);
  });

  it("returns 0 for very low or zero", () => {
    expect(starsForScore(0)).toBe(0);
    expect(starsForScore(100)).toBe(0);
  });

  it("returns 0 for non-finite (defensive)", () => {
    expect(starsForScore(Number.NaN)).toBe(0);
    expect(starsForScore(-100)).toBe(0);
  });
});
