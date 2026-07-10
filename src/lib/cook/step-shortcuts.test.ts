import { describe, expect, it } from "vitest";
import { resolveCookStepShortcut } from "./step-shortcuts";

describe("resolveCookStepShortcut", () => {
  it("maps horizontal arrows to step navigation", () => {
    expect(resolveCookStepShortcut({ key: "ArrowRight" })).toBe("next");
    expect(resolveCookStepShortcut({ key: "ArrowLeft" })).toBe("prev");
  });

  it("supports page keys for keyboard-only cooks", () => {
    expect(resolveCookStepShortcut({ key: "PageDown" })).toBe("next");
    expect(resolveCookStepShortcut({ key: "PageUp" })).toBe("prev");
  });

  it("ignores unrelated keys", () => {
    expect(resolveCookStepShortcut({ key: "Enter" })).toBeNull();
    expect(resolveCookStepShortcut({ key: " " })).toBeNull();
    expect(resolveCookStepShortcut({ key: "n" })).toBeNull();
  });

  it("does not fire while editing text", () => {
    expect(
      resolveCookStepShortcut({
        key: "ArrowRight",
        isEditableTarget: true,
      }),
    ).toBeNull();
  });

  it("does not fire while shortcuts are paused", () => {
    expect(
      resolveCookStepShortcut({
        key: "ArrowRight",
        isShortcutPaused: true,
      }),
    ).toBeNull();
  });

  it("does not override modified browser or text-selection chords", () => {
    for (const modifier of [
      "altKey",
      "ctrlKey",
      "metaKey",
      "shiftKey",
    ] as const) {
      expect(
        resolveCookStepShortcut({ key: "ArrowRight", [modifier]: true }),
      ).toBeNull();
    }
  });
});
