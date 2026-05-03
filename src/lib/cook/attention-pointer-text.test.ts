import { describe, expect, it } from "vitest";
import {
  parsePointerLines,
  serialisePointerLines,
} from "./attention-pointer-text";

describe("parsePointerLines — basic shapes", () => {
  it("returns empty array on empty / null / undefined", () => {
    expect(parsePointerLines("")).toEqual([]);
  });

  it("parses a circle without a label", () => {
    expect(parsePointerLines("circle: 0.3, 0.5")).toEqual([
      { shape: "circle", x: 0.3, y: 0.5 },
    ]);
  });

  it("parses a circle with a label", () => {
    expect(parsePointerLines("circle: 0.3, 0.5 - watch bubbles")).toEqual([
      { shape: "circle", x: 0.3, y: 0.5, label: "watch bubbles" },
    ]);
  });

  it("parses an arrow", () => {
    expect(parsePointerLines("arrow: 0.7, 0.2 - stir here")).toEqual([
      { shape: "arrow", x: 0.7, y: 0.2, label: "stir here" },
    ]);
  });
});

describe("parsePointerLines — multi-line + whitespace", () => {
  it("parses multiple lines preserving order", () => {
    const text = "circle: 0.3, 0.5\narrow: 0.7, 0.2 - here";
    expect(parsePointerLines(text)).toEqual([
      { shape: "circle", x: 0.3, y: 0.5 },
      { shape: "arrow", x: 0.7, y: 0.2, label: "here" },
    ]);
  });

  it("ignores blank lines", () => {
    const text = "\n\ncircle: 0.3, 0.5\n\n";
    expect(parsePointerLines(text)).toHaveLength(1);
  });

  it("tolerates surrounding whitespace and crlf line endings", () => {
    const text = "  circle: 0.3 , 0.5  \r\n  arrow: 0.7,0.2 ";
    expect(parsePointerLines(text)).toHaveLength(2);
  });

  it("accepts en-dash / em-dash / hyphen as the label separator", () => {
    expect(parsePointerLines("circle: 0.5, 0.5 – em")[0]?.label).toBe("em");
    expect(parsePointerLines("circle: 0.5, 0.5 — em")[0]?.label).toBe("em");
    expect(parsePointerLines("circle: 0.5, 0.5 - em")[0]?.label).toBe("em");
  });
});

describe("parsePointerLines — error tolerance", () => {
  it("drops malformed lines silently", () => {
    const text = [
      "circle: 0.3, 0.5", // valid
      "garbage line", // invalid shape
      "arrow: notanumber, 0.5", // invalid coord
      "arrow: 0.7, 0.2", // valid
    ].join("\n");
    const result = parsePointerLines(text);
    expect(result).toHaveLength(2);
    expect(result[0].shape).toBe("circle");
    expect(result[1].shape).toBe("arrow");
  });

  it("drops lines whose shape isn't circle or arrow", () => {
    expect(parsePointerLines("triangle: 0.3, 0.5")).toEqual([]);
  });

  it("caps label at 24 chars", () => {
    const long = "a".repeat(50);
    const result = parsePointerLines(`circle: 0.5, 0.5 - ${long}`);
    expect(result[0].label?.length).toBe(24);
  });

  it("treats whitespace-only label as no label", () => {
    expect(
      parsePointerLines("circle: 0.5, 0.5 -    ")[0].label,
    ).toBeUndefined();
  });

  it("accepts case-insensitive shape", () => {
    expect(parsePointerLines("CIRCLE: 0.5, 0.5")[0].shape).toBe("circle");
    expect(parsePointerLines("Arrow: 0.5, 0.5")[0].shape).toBe("arrow");
  });

  it("accepts negative coords (clamped at render time, not parse time)", () => {
    expect(parsePointerLines("circle: -0.1, 1.2")[0]).toEqual({
      shape: "circle",
      x: -0.1,
      y: 1.2,
    });
  });
});

describe("serialisePointerLines", () => {
  it("returns empty string on empty / null / undefined", () => {
    expect(serialisePointerLines([])).toBe("");
    expect(serialisePointerLines(null)).toBe("");
    expect(serialisePointerLines(undefined)).toBe("");
  });

  it("serialises without a label", () => {
    expect(serialisePointerLines([{ shape: "circle", x: 0.3, y: 0.5 }])).toBe(
      "circle: 0.3, 0.5",
    );
  });

  it("serialises with a label", () => {
    expect(
      serialisePointerLines([
        { shape: "arrow", x: 0.7, y: 0.2, label: "stir here" },
      ]),
    ).toBe("arrow: 0.7, 0.2 - stir here");
  });

  it("serialises multiple pointers as newline-separated lines", () => {
    expect(
      serialisePointerLines([
        { shape: "circle", x: 0.3, y: 0.5 },
        { shape: "arrow", x: 0.7, y: 0.2, label: "here" },
      ]),
    ).toBe("circle: 0.3, 0.5\narrow: 0.7, 0.2 - here");
  });

  it("strips trailing zeros from coords", () => {
    expect(serialisePointerLines([{ shape: "circle", x: 0.5, y: 1 }])).toBe(
      "circle: 0.5, 1",
    );
  });

  it("trims and caps label on the way out too", () => {
    const long = "a".repeat(40);
    const result = serialisePointerLines([
      { shape: "circle", x: 0.5, y: 0.5, label: `  ${long}  ` },
    ]);
    expect(result).toContain(long);
  });
});

describe("parse → serialise round-trip", () => {
  it("round-trips a typical authoring block", () => {
    const text = [
      "circle: 0.3, 0.5",
      "arrow: 0.7, 0.2 - stir here",
      "circle: 0.5, 0.5 - look",
    ].join("\n");
    const parsed = parsePointerLines(text);
    const serialised = serialisePointerLines(parsed);
    expect(parsePointerLines(serialised)).toEqual(parsed);
  });
});
