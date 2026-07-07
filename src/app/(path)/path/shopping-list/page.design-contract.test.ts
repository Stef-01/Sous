import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "page.tsx"),
  "utf8",
);

describe("ShoppingListPage design contract", () => {
  it("keeps list chrome on shared caption, spacing, and motion tokens", () => {
    expect(source).toContain("sous-meta shrink-0 font-medium");
    expect(source).toContain("motionTransition(SPRING.soft, reducedMotion)");
    expect(source).toContain("py-[var(--row-gap)]");
    expect(source).toContain("gap-[var(--row-gap)]");

    expect(source).not.toContain("text-[13px]");
    expect(source).not.toContain("py-2.5");
    expect(source).not.toContain("p-2.5");
    expect(source).not.toContain("space-y-2");
    expect(source).not.toContain(
      "transition={reducedMotion ? { duration: 0 } : SPRING.soft}",
    );
  });
});
