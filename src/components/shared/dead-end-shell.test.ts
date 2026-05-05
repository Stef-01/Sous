import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = join(HERE, "..", "..", "app");

/**
 * Project-wide invariant: every error / not-found / generic
 * "terminal" empty-state screen MUST route through DeadEndShell.
 * The shell guarantees a fixed top-left back button + safe-area
 * padding + a real <Link> escape that survives any JS click race.
 *
 * RCA (2026-05-04): the cook empty state shipped as a bare
 * <div> with `min-h-full flex items-center justify-center` and
 * a single CTA button. On real mobile the layout collapsed AND
 * the single click was the only escape — when it raced with a
 * page transition the user was stranded.
 *
 * This test fails if any error.tsx / not-found.tsx in src/app
 * stops importing DeadEndShell. Adding a new dead-end without
 * the shell is a build-break, by design.
 */

interface ScanResult {
  path: string;
  hasShell: boolean;
}

function listFiles(dir: string, names: ReadonlyArray<string>): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      out.push(...listFiles(p, names));
    } else if (names.includes(entry)) {
      out.push(p);
    }
  }
  return out;
}

function scan(path: string): ScanResult {
  const src = readFileSync(path, "utf8");
  return {
    path,
    hasShell: src.includes("DeadEndShell") || src.includes("dead-end-shell"),
  };
}

describe("DeadEndShell invariant", () => {
  it("every error.tsx in src/app uses DeadEndShell", () => {
    const errorFiles = listFiles(APP_ROOT, ["error.tsx"]);
    expect(errorFiles.length).toBeGreaterThan(0);
    const offenders = errorFiles
      .map(scan)
      .filter((r) => !r.hasShell)
      .map((r) => r.path);
    if (offenders.length > 0) {
      throw new Error(
        `These error.tsx files don't use DeadEndShell:\n  - ${offenders.join("\n  - ")}\n` +
          "Migrate them — see src/components/shared/dead-end-shell.tsx for usage. " +
          "Bare empty-state shells are a known dead-end pattern (RCA 2026-05-04).",
      );
    }
    expect(offenders).toEqual([]);
  });

  it("every not-found.tsx in src/app uses DeadEndShell", () => {
    const notFoundFiles = listFiles(APP_ROOT, ["not-found.tsx"]);
    expect(notFoundFiles.length).toBeGreaterThan(0);
    const offenders = notFoundFiles
      .map(scan)
      .filter((r) => !r.hasShell)
      .map((r) => r.path);
    if (offenders.length > 0) {
      throw new Error(
        `These not-found.tsx files don't use DeadEndShell:\n  - ${offenders.join("\n  - ")}`,
      );
    }
    expect(offenders).toEqual([]);
  });
});
