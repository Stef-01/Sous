"use client";

/**
 * EcoModeToggle — Profile-sheet section for the Y4 W7 / Y5
 * Eco Mode (audit P0 #1).
 *
 * Mirrors the Parent Mode toggle visually. Calm, never-shame
 * copy: "tilts suggestions toward lower-carbon picks" — never
 * "stop eating beef". Consumes the existing `useEcoMode` hook
 * + the carbon-math substrate.
 */

import { Leaf } from "lucide-react";
import { useEcoMode } from "@/lib/hooks/use-eco-mode";
import { useHaptic } from "@/lib/hooks/use-haptic";
import { SectionKicker } from "@/components/shared/section-kicker";
import { SettingToggle } from "@/components/ui/setting-toggle";

export function EcoModeToggle() {
  const { profile, toggle, mounted } = useEcoMode();
  const haptic = useHaptic();

  // The hook already gates `mounted` behind a hydration-safe
  // useEffect, so render a quiet skeleton until it flips.
  if (!mounted) {
    return (
      <section className="mt-4 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
        <div className="h-3 w-20 shimmer rounded" />
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <SectionKicker as="p" size="10px">
            Eco Mode
          </SectionKicker>
          <p className="text-[13px] text-[var(--nourish-dark)]">
            Tilt suggestions toward lower-carbon picks. Surfaces your savings on
            the win screen and Today.
          </p>
          {profile.enabled && (
            <p className="flex items-center gap-1 text-[11px] text-[var(--nourish-green)]">
              <Leaf size={11} className="shrink-0" />
              On since {prettyDate(profile.enabledAt)}
            </p>
          )}
        </div>
        <SettingToggle
          checked={profile.enabled}
          onChange={() => {
            haptic();
            toggle();
          }}
          label={profile.enabled ? "Turn Eco Mode off" : "Turn Eco Mode on"}
        />
      </div>
    </section>
  );
}

function prettyDate(iso: string): string {
  if (!iso) return "today";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "today";
  const now = new Date();
  const days = Math.floor(
    (now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
