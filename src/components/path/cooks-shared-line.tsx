"use client";

import { useMemo } from "react";
import { Send } from "lucide-react";
import { useShareLog } from "@/lib/hooks/use-share-log";
import { FRIEND_COOKS } from "@/data/friend-cooks";

/**
 * CooksSharedLine — a single typographic line on Path, honest + quiet.
 *
 * "3 meals shared — Alex cooked one of them."
 *
 * Silent when the user has not shared anything yet. Friend-overlap line
 * derived deterministically from the mock friend dataset so the tally
 * reads as insight, not fluff. No graphs, no dashboards — a sentence.
 */
export function CooksSharedLine() {
  const { entries, mounted } = useShareLog();

  const friendMatch = useMemo(() => {
    if (entries.length === 0) return null;
    const sharedSlugs = new Set(entries.map((e) => e.dishSlug.toLowerCase()));
    for (const f of FRIEND_COOKS) {
      if (sharedSlugs.has(f.dishSlug.toLowerCase())) return f.friend;
    }
    return null;
  }, [entries]);

  if (!mounted || entries.length === 0) return null;

  const count = entries.length;
  const label = count === 1 ? "1 meal shared" : `${count} meals shared`;

  return (
    <p
      className="flex items-center gap-1.5 px-1 text-[12px] text-[var(--nourish-subtext)]"
      aria-label={`${count} ${count === 1 ? "meal" : "meals"} shared`}
    >
      <Send
        size={12}
        strokeWidth={2}
        className="text-[var(--nourish-green)] shrink-0"
        aria-hidden
      />
      <span>
        {label}
        {friendMatch ? (
          <>
            {" — "}
            <span className="font-semibold text-[var(--nourish-dark)]">
              {friendMatch}
            </span>
            {" cooked one of them."}
          </>
        ) : (
          "."
        )}
      </span>
    </p>
  );
}
