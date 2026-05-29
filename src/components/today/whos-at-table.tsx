"use client";

/**
 * WhosAtTable — picker on /today for "who's eating tonight".
 *
 * W35 surface from the household-memory arc (Sprint G W32-W36).
 * Reads the W32 useHouseholdMembers + W35 useTonightTable hooks,
 * lets the user toggle each member on/off, and shows the
 * aggregated household constraints (dietary flags + min spice
 * tolerance) so the user understands what's binding.
 *
 * Pure-display except for the toggle calls; the aggregation
 * logic lives in `lib/household/table-aggregate.ts` and is
 * unit-tested independently.
 *
 * The picker renders nothing when no household members exist —
 * it's a /today affordance only when the user has invested in
 * the household-memory loop. CTA pointing to /path/household
 * surfaces in that empty case.
 */

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useHouseholdMembers } from "@/lib/hooks/use-household-members";
import { useTonightTable } from "@/lib/hooks/use-tonight-table";
import { aggregateTable } from "@/lib/household/table-aggregate";
import { cn } from "@/lib/utils/cn";

export function WhosAtTable() {
  const reducedMotion = useReducedMotion();
  const { members, mounted: membersReady } = useHouseholdMembers();
  const { selectedIds, mounted: tableReady, toggle } = useTonightTable();

  const aggregate = useMemo(
    () => aggregateTable(members, selectedIds),
    [members, selectedIds],
  );

  // Don't render at all until both hooks have hydrated. Avoids
  // the brief "no members" flash on first paint.
  if (!membersReady || !tableReady) {
    return <div className="h-12 animate-pulse rounded-2xl bg-white/40" />;
  }

  // Empty-roster: render nothing. The "Add household members"
  // dashed-border hint that used to sit here was distracting on
  // the home page (rule 6: simplicity-first). Discovery of the
  // feature still happens via /path/household in the Path tab.
  if (members.length === 0) return null;

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
      className="space-y-2 rounded-2xl border border-neutral-100/80 bg-white p-3 shadow-sm"
      aria-label="Who's at the table"
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
          At the table tonight
        </p>
        {aggregate.count > 0 && (
          <span className="text-[10px] font-medium text-[var(--nourish-subtext)]/70">
            {aggregate.count} of {members.length}
          </span>
        )}
      </div>

      {/* Y3 W7: horizontal scroll with snap-x for 6+ member rosters
          on narrow viewports. flex-wrap broke awkwardly into 3-row
          stacks at 375px once the household passed five members. */}
      <div
        className="-mx-3 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
        role="group"
        aria-label="Household members at the table tonight"
      >
        <div className="flex gap-1.5 pb-1">
          {members.map((m) => {
            const isOn = selectedIds.includes(m.id);
            const fallbackInitial = m.name.trim().charAt(0).toUpperCase();
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggle(m.id)}
                aria-pressed={isOn}
                className={cn(
                  "inline-flex shrink-0 snap-start items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                  isOn
                    ? "bg-[var(--nourish-green)] text-white"
                    : "bg-neutral-100 text-[var(--nourish-subtext)] hover:bg-neutral-200",
                )}
              >
                <span aria-hidden>{m.avatar || fallbackInitial}</span>
                {m.name}
              </button>
            );
          })}
        </div>
      </div>

      {aggregate.count > 0 && (
        <p className="pt-1 text-[10px] text-[var(--nourish-subtext)]/80">
          {aggregate.dietaryFlags.length > 0 && (
            <>
              <span className="font-semibold">filters:</span>{" "}
              {aggregate.dietaryFlags.join(", ")} ·{" "}
            </>
          )}
          <span className="font-semibold">spice ≤</span>{" "}
          {aggregate.minSpiceTolerance}/5
          {aggregate.hasChild && (
            <>
              {" · "}
              <span className="font-semibold">kid-friendly</span>
            </>
          )}
        </p>
      )}
    </motion.section>
  );
}
