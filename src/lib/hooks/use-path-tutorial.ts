"use client";

import { useCallback, useState } from "react";

/**
 * Path tutorial state. The design-audit direction is to keep Path usable on
 * first load and expose the orientation as an explicit, optional help action.
 */
export function usePathTutorial() {
  const [open, setOpen] = useState(false);

  const complete = useCallback(() => setOpen(false), []);
  const replay = useCallback(() => setOpen(true), []);

  return { open, complete, replay };
}
