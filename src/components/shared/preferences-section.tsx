"use client";

/**
 * PreferencesSection — chip-based editor for the Y5 intelligence-
 * layer profile (Y5 D, audit P0 #4 + #5).
 *
 * Surfaces the user's inferred + manual preference tags inside the
 * existing Profile & Settings sheet:
 *
 *   - Cuisines you love
 *   - Flavors you love
 *   - Things you don't eat
 *   - When you cook (learned time-of-day patterns)
 *
 * Tags from `manualTags.likes` render solid; inferred-only tags
 * render with a faint "· learned" suffix. Tap to edit (toggle
 * dislike / suppress / clear). Add a tag via the inline input.
 *
 * Confidence-aware empty states keep the surface honest at
 * cold-start instead of pretending the ML knows you yet.
 */

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import {
  TIME_OF_DAY_ORDER,
  timeOfDayLabel,
} from "@/lib/intelligence/time-of-day";
import { classifyManualState } from "@/lib/intelligence/manual-edit-merge";
import { usePreferenceProfile } from "@/lib/hooks/use-preference-profile";
import type { ManualTags, TagWeightMap } from "@/types/preference-profile";
import { cn } from "@/lib/utils/cn";
import { SectionKicker } from "@/components/shared/section-kicker";

interface ChipsBlockProps {
  label: string;
  axis: "likes" | "dislikes";
  /** Inferred weights for this axis — only positive ones surface. */
  inferred: TagWeightMap;
  manual: ManualTags;
  onAdd: (tag: string) => void;
  onClear: (tag: string) => void;
  emptyHint: string;
}

function ChipsBlock({
  label,
  axis,
  inferred,
  manual,
  onAdd,
  onClear,
  emptyHint,
}: ChipsBlockProps) {
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);

  // Compose the rendered chip list. For "likes" we show all
  // user likes + any inferred tag with weight > 0.4.
  // For "dislikes" we only show explicit dislikes (the recommender
  // already handles negative-inferred suppression silently).
  const chips: { tag: string; manual: boolean }[] = useMemo(() => {
    if (axis === "likes") {
      const out: { tag: string; manual: boolean }[] = manual.likes.map((t) => ({
        tag: t,
        manual: true,
      }));
      const seen = new Set(out.map((c) => c.tag.toLowerCase()));
      for (const [tag, w] of Object.entries(inferred)) {
        if (w < 0.4) continue;
        const lc = tag.toLowerCase();
        if (seen.has(lc)) continue;
        const state = classifyManualState({ tag, manual });
        if (state === "disliked" || state === "suppressed") continue;
        out.push({ tag, manual: false });
      }
      return out;
    }
    // dislikes
    return manual.dislikes.map((t) => ({ tag: t, manual: true }));
  }, [axis, inferred, manual]);

  const submit = () => {
    const t = draft.trim().toLowerCase();
    if (!t) return;
    onAdd(t);
    setDraft("");
    setAdding(false);
  };

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium text-[var(--nourish-subtext)]">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {chips.length === 0 && !adding && (
          <p className="text-[11px] italic text-[var(--nourish-subtext)]/70">
            {emptyHint}
          </p>
        )}
        {chips.map(({ tag, manual: isManual }) => (
          <span
            key={tag}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
              isManual
                ? axis === "likes"
                  ? "bg-[var(--nourish-green)]/10 text-[var(--nourish-green)]"
                  : "bg-red-50 text-red-600"
                : "border border-[var(--nourish-border-strong)] bg-white/60 text-[var(--nourish-subtext)]",
            )}
          >
            <span>{tag}</span>
            {!isManual && (
              <span className="text-[9px] uppercase tracking-wider opacity-70">
                · learned
              </span>
            )}
            <button
              type="button"
              onClick={() => onClear(tag)}
              className="ml-0.5 rounded-full p-0.5 hover:bg-black/5"
              aria-label={`Remove ${tag}`}
            >
              <X size={10} />
            </button>
          </span>
        ))}
        {adding ? (
          <div className="inline-flex items-center gap-1 rounded-full border border-[var(--nourish-green)]/30 bg-white px-2 py-0.5">
            <input
              autoFocus
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                if (e.key === "Escape") {
                  setDraft("");
                  setAdding(false);
                }
              }}
              onBlur={submit}
              placeholder={
                axis === "likes" ? "e.g. thai · spicy" : "e.g. beef · cilantro"
              }
              className="w-32 bg-transparent text-[11px] text-[var(--nourish-dark)] placeholder:text-[var(--nourish-subtext)]/60 focus:outline-none"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-[var(--nourish-border-strong)] bg-white/40 px-2.5 py-1 text-[11px] font-medium text-[var(--nourish-subtext)] hover:border-[var(--nourish-green)]/40 hover:text-[var(--nourish-green)]"
          >
            <Plus size={10} />
            Add
          </button>
        )}
      </div>
    </div>
  );
}

export function PreferencesSection() {
  const { profile, confidence, mounted, applyEdit, reset, patternFor } =
    usePreferenceProfile();

  if (!mounted) {
    return (
      <section className="mt-4 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
        <div className="h-3 w-24 animate-pulse rounded bg-neutral-100" />
      </section>
    );
  }

  const inferredAll: TagWeightMap = {
    ...profile.inferredTags.cuisines,
    ...profile.inferredTags.flavors,
    ...profile.inferredTags.dishClasses,
  };

  return (
    <section className="mt-4 space-y-4 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
      <div>
        <SectionKicker as="p" size="10px">
          Your kitchen
        </SectionKicker>
        <p className="mt-1 text-[12px] text-[var(--nourish-subtext)]">
          {confidence === "cold-start"
            ? "Keep swiping — we'll learn what you like."
            : confidence === "weak"
              ? "Just getting started. A few more cooks and this will sharpen."
              : "Tap any chip to edit. We never override your manual choices."}
        </p>
      </div>

      <ChipsBlock
        label="Cuisines & flavors you love"
        axis="likes"
        inferred={inferredAll}
        manual={profile.manualTags}
        onAdd={(tag) => applyEdit({ kind: "like", tag })}
        onClear={(tag) =>
          applyEdit({
            kind:
              classifyManualState({ tag, manual: profile.manualTags }) ===
              "liked"
                ? "clear-like"
                : "suppress",
            tag,
          })
        }
        emptyHint={
          confidence === "cold-start"
            ? "Add a few favorites to get started, e.g. thai, italian, spicy."
            : "Cooks aren't pointing strongly at anything yet."
        }
      />

      <ChipsBlock
        label="Things you don't eat"
        axis="dislikes"
        inferred={{}}
        manual={profile.manualTags}
        onAdd={(tag) => applyEdit({ kind: "dislike", tag })}
        onClear={(tag) => applyEdit({ kind: "clear-dislike", tag })}
        emptyHint="Add anything you'd rather skip — beef, cilantro, anchovies."
      />

      {confidence === "strong" || confidence === "very-strong" ? (
        <div className="space-y-1.5 border-t border-neutral-100 pt-3">
          <p className="text-[11px] font-medium text-[var(--nourish-subtext)]">
            When you cook (learned)
          </p>
          <ul className="space-y-1">
            {TIME_OF_DAY_ORDER.map((bucket) => {
              const tags = patternFor(bucket);
              return (
                <li
                  key={bucket}
                  className="flex items-baseline gap-2 text-[11px] text-[var(--nourish-dark)]"
                >
                  <span className="w-20 shrink-0 text-[var(--nourish-subtext)]">
                    {timeOfDayLabel(bucket)}
                  </span>
                  <span>
                    {tags.length === 0 ? (
                      <span className="italic text-[var(--nourish-subtext)]/70">
                        Learning…
                      </span>
                    ) : (
                      tags.join(", ")
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="border-t border-neutral-100 pt-3">
        <button
          type="button"
          onClick={() => {
            if (
              typeof window !== "undefined" &&
              !window.confirm(
                "Reset learned preferences? Your manual likes/dislikes stay.",
              )
            ) {
              return;
            }
            // Reset wipes both manual + inferred. We re-apply the
            // user's manual lists right after so only the inferred
            // signal log gets cleared (matches the editor copy).
            const keepLikes = profile.manualTags.likes;
            const keepDislikes = profile.manualTags.dislikes;
            const keepSuppressed = profile.manualTags.suppressed;
            reset();
            for (const t of keepLikes) applyEdit({ kind: "like", tag: t });
            for (const t of keepDislikes)
              applyEdit({ kind: "dislike", tag: t });
            for (const t of keepSuppressed)
              applyEdit({ kind: "suppress", tag: t });
          }}
          className="text-[11px] font-medium text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)]"
        >
          Reset learned preferences
        </button>
      </div>
    </section>
  );
}
