"use client";

/**
 * use-meal-health-panel — snap state for the swipe-up health sheet.
 *
 * A tiny two-state machine (collapsed ⇄ peek) driven by the pure
 * `decidePanelSnap` decision, so the gesture math is unit-tested and the hook
 * stays a thin wrapper. The component owns the motion; this owns the state.
 */

import { useCallback, useState } from "react";
import type { PanInfo } from "framer-motion";
import { decidePanelSnap, type PanelSnap } from "@/components/today/panel-snap";

export function useMealHealthPanel() {
  const [snap, setSnap] = useState<PanelSnap>("collapsed");

  const onDragEnd = useCallback((_event: unknown, info: PanInfo) => {
    setSnap((cur) => decidePanelSnap(cur, info.offset.y, info.velocity.y));
  }, []);

  const open = useCallback(() => setSnap("peek"), []);
  const close = useCallback(() => setSnap("collapsed"), []);

  return { snap, isOpen: snap === "peek", open, close, onDragEnd };
}
