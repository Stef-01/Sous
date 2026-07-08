import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const TODAY_PAGE = join(__dirname, "page.tsx");
const src = readFileSync(TODAY_PAGE, "utf8");

describe("Today performance budget", () => {
  const lazySurfaces = [
    {
      exportName: "TextPrompt",
      path: "@/components/today/text-prompt",
      wrapperName: "LazyTextPrompt",
      wrapperPath: "@/components/today/lazy-text-prompt",
      reason:
        "search taxonomy and catalog matching only run after search opens",
    },
    {
      exportName: "SavedRecipesStrip",
      path: "@/components/today/saved-recipes-strip",
      wrapperName: "LazySavedRecipesStrip",
      wrapperPath: "@/components/today/lazy-saved-recipes-strip",
      reason: "saved recipes sit below the primary meal hero",
    },
    {
      exportName: "FriendsStrip",
      path: "@/components/today/friends-strip",
      wrapperName: "LazyFriendsStrip",
      wrapperPath: "@/components/today/lazy-friends-strip",
      reason: "the social rail is below the fold",
    },
  ];

  it("keeps post-interaction and below-fold surfaces out of static Today imports", () => {
    for (const surface of lazySurfaces) {
      const staticImport = new RegExp(
        `^import\\s+\\{[^}]*\\b${surface.exportName}\\b[^}]*\\}\\s+from\\s+["']${surface.path}["'];`,
        "m",
      );

      expect(
        staticImport.test(src),
        `${surface.exportName} must stay dynamically imported: ${surface.reason}`,
      ).toBe(false);
      expect(src).toContain(
        `import { ${surface.wrapperName} } from "${surface.wrapperPath}"`,
      );
    }
  });
});
