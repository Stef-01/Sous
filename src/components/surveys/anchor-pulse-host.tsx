"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  usePulseLedger,
  selectEligiblePulse,
  getDeviceId,
  markPulseShown,
} from "@/lib/surveys/pulse-scheduler";
import type { PulseAnchor, PulseDef } from "@/data/pulses";

const PulseHost = dynamic(
  () => import("@/components/surveys/pulse-host").then((m) => m.PulseHost),
  { ssr: false },
);

/**
 * Drops a one-shot pulse check for a mount-time `anchor` onto any surface
 * (§6.2 W4 follow-up — e.g. "plan-open" on the weekly plan). The scheduler
 * enforces all cooldowns + the post-onboarding quiet window, so this stays calm
 * by default and renders nothing unless a pulse is genuinely eligible.
 */
export function AnchorPulseHost({
  anchor,
  enabled = true,
  delayMs = 1200,
}: {
  anchor: PulseAnchor;
  enabled?: boolean;
  delayMs?: number;
}) {
  const { ledger, mounted } = usePulseLedger();
  const [activePulse, setActivePulse] = useState<PulseDef | null>(null);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!mounted || !enabled || checkedRef.current || activePulse) return;
    checkedRef.current = true;
    const id = setTimeout(() => {
      const now = new Date().toISOString();
      const pulse = selectEligiblePulse(anchor, ledger, now, getDeviceId());
      if (pulse) {
        markPulseShown(pulse.id, now);
        setActivePulse(pulse);
      }
    }, delayMs);
    return () => clearTimeout(id);
  }, [mounted, enabled, anchor, ledger, activePulse, delayMs]);

  if (!activePulse) return null;
  return <PulseHost pulse={activePulse} onClose={() => setActivePulse(null)} />;
}
