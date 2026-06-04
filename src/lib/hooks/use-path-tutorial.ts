"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Path onboarding tutorial state. First visit auto-opens once (gated on the
 * localStorage flag the PathTutorial component sets to "done" on completion),
 * plus the `complete` / `replay` controls. Extracted from PathPage so the page
 * stays orchestration-only.
 */
const TUTORIAL_SEEN_KEY = "sous-path-tutorial-v1";

export function usePathTutorial(mounted: boolean) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    const id = window.setTimeout(() => {
      try {
        if (localStorage.getItem(TUTORIAL_SEEN_KEY) !== "done") setOpen(true);
      } catch {
        setOpen(true);
      }
    }, 400);
    return () => clearTimeout(id);
  }, [mounted]);

  const complete = useCallback(() => setOpen(false), []);
  const replay = useCallback(() => setOpen(true), []);

  return { open, complete, replay };
}
