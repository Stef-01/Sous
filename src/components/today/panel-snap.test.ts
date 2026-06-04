import { describe, expect, it } from "vitest";
import {
  decidePanelSnap,
  PANEL_OFFSET_THRESHOLD,
  PANEL_VELOCITY_THRESHOLD,
} from "./panel-snap";

const up = -1; // negative offset/velocity = upward
const down = 1;

describe("decidePanelSnap", () => {
  it("stays put when neither threshold is met", () => {
    expect(decidePanelSnap("collapsed", up * 10, up * 50)).toBe("collapsed");
    expect(decidePanelSnap("peek", down * 10, down * 50)).toBe("peek");
  });

  it("opens (peek) on a committed upward drag", () => {
    expect(
      decidePanelSnap("collapsed", up * (PANEL_OFFSET_THRESHOLD + 20), 0),
    ).toBe("peek");
  });

  it("closes (collapsed) on a committed downward drag", () => {
    expect(
      decidePanelSnap("peek", down * (PANEL_OFFSET_THRESHOLD + 20), 0),
    ).toBe("collapsed");
  });

  it("opens on a fast upward flick even with a small offset", () => {
    expect(
      decidePanelSnap(
        "collapsed",
        up * 10,
        up * (PANEL_VELOCITY_THRESHOLD + 100),
      ),
    ).toBe("peek");
  });

  it("closes on a fast downward flick even with a small offset", () => {
    expect(
      decidePanelSnap(
        "peek",
        down * 10,
        down * (PANEL_VELOCITY_THRESHOLD + 100),
      ),
    ).toBe("collapsed");
  });

  it("a decisive flick overrides an opposing committed offset", () => {
    // dragged down past threshold, but flicked hard upward → opens
    expect(
      decidePanelSnap(
        "collapsed",
        down * (PANEL_OFFSET_THRESHOLD + 50),
        up * (PANEL_VELOCITY_THRESHOLD + 200),
      ),
    ).toBe("peek");
  });

  it("is deterministic across repeated calls", () => {
    const args: [PanelSnapArg, number, number] = [
      "collapsed",
      up * 120,
      up * 700,
    ];
    const a = decidePanelSnap(...args);
    for (let i = 0; i < 50; i++) expect(decidePanelSnap(...args)).toBe(a);
  });
});

type PanelSnapArg = "collapsed" | "peek";
