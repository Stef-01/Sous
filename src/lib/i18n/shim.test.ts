import { describe, expect, it } from "vitest";
import { isI18nConfigured, t } from "./shim";

describe("i18n shim — t()", () => {
  it("returns the default value when no translation is configured", () => {
    expect(t("today.search.placeholder", "What are you craving?")).toBe(
      "What are you craving?",
    );
  });

  it("interpolates {value} placeholders from the values map", () => {
    expect(
      t("path.cooks_count", "You've cooked {n} times this week", {
        values: { n: 3 },
      }),
    ).toBe("You've cooked 3 times this week");
  });

  it("interpolates the count placeholder", () => {
    expect(t("path.cooks_count_short", "{count} cooks", { count: 5 })).toBe(
      "5 cooks",
    );
  });

  it("supports both count and values together", () => {
    expect(
      t("test.combo", "{count} {item}", {
        count: 2,
        values: { item: "tacos" },
      }),
    ).toBe("2 tacos");
  });

  it("returns the default unchanged when no context provided", () => {
    expect(t("anything", "hello")).toBe("hello");
  });
});

describe("isI18nConfigured", () => {
  it("returns false until the framework is wired (W22a)", () => {
    expect(isI18nConfigured()).toBe(false);
  });
});
