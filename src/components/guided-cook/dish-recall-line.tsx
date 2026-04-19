"use client";

import { useMemo } from "react";
import { Star } from "lucide-react";
import { useCookSessions } from "@/lib/hooks/use-cook-sessions";

interface DishRecallLineProps {
  dishSlug: string;
}

function daysAgoLabel(completedAt: string, now: number = Date.now()): string {
  const ms = now - new Date(completedAt).getTime();
  const days = Math.max(0, Math.round(ms / (24 * 60 * 60 * 1000)));
  if (days <= 0) return "earlier today";
  if (days === 1) return "yesterday";
  if (days <= 6) return `${days} days ago`;
  if (days <= 14) return "last week";
  if (days <= 30) return `${Math.round(days / 7)} weeks ago`;
  if (days <= 60) return "last month";
  if (days <= 365) return `${Math.round(days / 30)} months ago`;
  return "over a year ago";
}

/**
 * A single stat line on the Mission screen  -  "Last cooked 12 days ago  -
 * you rated it 5 stars." Silent if the user has never cooked this dish
 * before. No scolding, no auto-rebook prompt.
 */
export function DishRecallLine({ dishSlug }: DishRecallLineProps) {
  const { completedSessions } = useCookSessions();
  const latest = useMemo(() => {
    const matching = completedSessions
      .filter((s) => s.recipeSlug === dishSlug && !!s.completedAt)
      .sort(
        (a, b) =>
          new Date(b.completedAt!).getTime() -
          new Date(a.completedAt!).getTime(),
      );
    return matching[0] ?? null;
  }, [completedSessions, dishSlug]);

  if (!latest) return null;

  const when = daysAgoLabel(latest.completedAt!);
  const rating = latest.rating;

  return (
    <div className="flex items-center justify-center gap-1.5 text-[11px] italic text-[var(--nourish-subtext)]/90">
      <span>Last cooked {when}</span>
      {typeof rating === "number" && rating > 0 && (
        <>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-0.5">
            you rated it {rating}
            <Star
              size={10}
              className="fill-[var(--nourish-gold)] text-[var(--nourish-gold)]"
              strokeWidth={1.5}
              aria-hidden
            />
          </span>
        </>
      )}
    </div>
  );
}
