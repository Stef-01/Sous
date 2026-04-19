import { describe, it, expect, beforeEach } from "vitest";
import { toast } from "./use-toast";

describe("toast queue", () => {
  beforeEach(() => {
    toast.clear();
  });

  it("pushes a toast and exposes it at the head", () => {
    const id = toast.push({ variant: "info", title: "Hello" });
    const snapshot = toast._snapshot();
    expect(snapshot).toHaveLength(1);
    expect(snapshot[0]?.id).toBe(id);
    expect(snapshot[0]?.title).toBe("Hello");
  });

  it("preserves FIFO order across multiple pushes", () => {
    toast.push({ variant: "info", title: "A" });
    toast.push({ variant: "info", title: "B" });
    toast.push({ variant: "info", title: "C" });
    const titles = toast._snapshot().map((t) => t.title);
    expect(titles).toEqual(["A", "B", "C"]);
  });

  it("dedupes by dedupKey  -  new entry replaces the old one at the end", () => {
    toast.push({ variant: "info", title: "first", dedupKey: "k1" });
    toast.push({ variant: "info", title: "keep", dedupKey: "k2" });
    toast.push({ variant: "info", title: "second", dedupKey: "k1" });
    const titles = toast._snapshot().map((t) => t.title);
    expect(titles).toEqual(["keep", "second"]);
  });

  it("pushMany adds all toasts and respects dedupKey across the batch", () => {
    toast.push({ variant: "info", title: "existing", dedupKey: "shared" });
    toast.pushMany([
      { variant: "info", title: "a" },
      { variant: "info", title: "b", dedupKey: "shared" },
    ]);
    const titles = toast._snapshot().map((t) => t.title);
    expect(titles).toEqual(["a", "b"]);
  });

  it("dismiss removes the toast by id", () => {
    const id1 = toast.push({ variant: "info", title: "A" });
    const id2 = toast.push({ variant: "info", title: "B" });
    toast.dismiss(id1);
    const snapshot = toast._snapshot();
    expect(snapshot).toHaveLength(1);
    expect(snapshot[0]?.id).toBe(id2);
  });

  it("dismiss is a no-op for unknown id", () => {
    toast.push({ variant: "info", title: "A" });
    toast.dismiss("does-not-exist");
    expect(toast._snapshot()).toHaveLength(1);
  });

  it("clear empties the queue", () => {
    toast.push({ variant: "info", title: "A" });
    toast.push({ variant: "info", title: "B" });
    toast.clear();
    expect(toast._snapshot()).toHaveLength(0);
  });

  it("assigns unique ids to rapid pushes", () => {
    const a = toast.push({ variant: "info", title: "A" });
    const b = toast.push({ variant: "info", title: "B" });
    const c = toast.push({ variant: "info", title: "C" });
    expect(new Set([a, b, c]).size).toBe(3);
  });
});
