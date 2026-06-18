import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/**
 * Regression guard for the recurring "lost nutrition preview" bug.
 *
 * The Today deck's "Info" button + its nutrition MealHealthSheet kept
 * DISAPPEARING because they were coupled to `therapeuticsActive()` — the
 * clinician THERAPEUTIC feature flag. So any build that turned the therapeutic
 * layer off (the FTC/FDA kill-switch) also silently killed the core nutrition
 * preview. The fix decouples them: nutrition is ALWAYS shown; only the
 * therapeutic evidence layer is flag-gated (passed down via `showTherapeutic`).
 *
 * These source-invariant checks fail loudly if anyone re-introduces the
 * coupling, so the feature can't quietly regress again.
 */
const here = dirname(fileURLToPath(import.meta.url));
const questCard = readFileSync(join(here, "quest-card.tsx"), "utf8");
const panel = readFileSync(join(here, "meal-health-panel.tsx"), "utf8");

describe("Today nutrition Info preview — decoupled from therapeuticsActive", () => {
  it("the Info button is NOT gated by therapeuticsActive()", () => {
    expect(questCard).not.toContain(
      "therapeuticsActive() && !healthPanel.isOpen",
    );
  });

  it("the MealHealthSheet is NOT gated by therapeuticsActive()", () => {
    expect(questCard).not.toMatch(/activeDish && therapeuticsActive\(\) &&/);
  });

  it("the therapeutic layer is still passed down as a gated prop (not gating the whole sheet)", () => {
    expect(questCard).toContain("showTherapeutic={therapeuticsActive()}");
  });

  it("the Info button + nutrition sheet still exist on the deck", () => {
    expect(questCard).toContain("Show info for");
    expect(questCard).toContain("<MealHealthSheet");
  });

  it("the panel's nutrition macro glance is NOT inside the showTherapeutic gate", () => {
    // The decision-point macro glance + Sous-read render unconditionally; only
    // the deep-dive evidence block is wrapped in `{showTherapeutic && (`.
    const gateIdx = panel.indexOf("{showTherapeutic && (");
    const glanceIdx = panel.indexOf("/ serving"); // the macro glance row
    expect(glanceIdx).toBeGreaterThan(-1);
    expect(gateIdx).toBeGreaterThan(-1);
    // The macro glance appears BEFORE the therapeutic gate in the JSX.
    expect(glanceIdx).toBeLessThan(gateIdx);
  });
});
