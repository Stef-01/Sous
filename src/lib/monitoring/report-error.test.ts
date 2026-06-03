import { describe, expect, it, afterEach, vi } from "vitest";
import {
  reportError,
  setErrorSink,
  isMonitoringConfigured,
} from "./report-error";

describe("reportError", () => {
  afterEach(() => {
    setErrorSink(null);
    vi.restoreAllMocks();
  });

  it("never throws, whatever it's handed", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => reportError(new Error("x"))).not.toThrow();
    expect(() => reportError("string error", { a: 1 })).not.toThrow();
    expect(() => reportError(null)).not.toThrow();
    expect(() => reportError(undefined)).not.toThrow();
    spy.mockRestore();
  });

  it("forwards the error + context to an installed sink", () => {
    const sink = vi.fn();
    setErrorSink(sink);
    const err = new Error("boom");
    reportError(err, { source: "test" });
    expect(sink).toHaveBeenCalledTimes(1);
    expect(sink).toHaveBeenCalledWith(err, { source: "test" });
  });

  it("swallows a throwing sink — reporting must never break the app", () => {
    setErrorSink(() => {
      throw new Error("sink blew up");
    });
    expect(() => reportError(new Error("x"))).not.toThrow();
  });

  it("falls back to console (not the sink) once the sink is removed", () => {
    const sink = vi.fn();
    setErrorSink(sink);
    setErrorSink(null);
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    reportError(new Error("after-removal"));
    expect(sink).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("isMonitoringConfigured is false without a DSN", () => {
    expect(isMonitoringConfigured()).toBe(false);
  });
});
