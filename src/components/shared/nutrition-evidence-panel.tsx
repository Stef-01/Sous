"use client";

import { useState } from "react";
import { FlaskConical, ChevronDown, ExternalLink } from "lucide-react";
import { NUTRITION_EVIDENCE } from "@/data/nutrition-evidence";
import { cn } from "@/lib/utils/cn";

/**
 * NutritionEvidencePanel — "the science behind the tips", tucked into the Profile
 * sheet (rule 13: hidden away, click in). Collapsed by default; expands to the
 * curated bioavailability cues with their mechanism + the actual papers. Honest:
 * a standing "educational, not medical advice" note; sources open in a new tab.
 */
export function NutritionEvidencePanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-[var(--nourish-border)] pt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 text-left"
      >
        <FlaskConical
          size={15}
          className="text-[var(--nourish-green)]"
          aria-hidden
        />
        <span className="flex-1 text-[13px] font-semibold text-[var(--nourish-dark)]">
          The science behind our tips
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "text-[var(--nourish-subtext)] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="mt-3 space-y-4">
          <p className="text-[11px] leading-snug text-[var(--nourish-subtext-faint)]">
            General educational summaries of well-established nutrition science
            — not medical advice. Tap a source to read the paper.
          </p>

          {NUTRITION_EVIDENCE.map((e) => (
            <div
              key={e.id}
              className="rounded-xl bg-[var(--nourish-cream)]/60 p-3"
            >
              <p className="text-[12.5px] font-semibold text-[var(--nourish-dark)]">
                {e.title}
              </p>
              <p className="mt-0.5 text-[12px] text-[var(--nourish-dark)]">
                {e.takeaway}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-[var(--nourish-subtext)]">
                {e.mechanism}
              </p>
              <div className="mt-2 space-y-1">
                {e.sources.map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-1 text-[11px] font-medium text-[var(--nourish-green)] hover:underline"
                  >
                    <ExternalLink
                      size={11}
                      className="mt-0.5 shrink-0"
                      aria-hidden
                    />
                    <span>{s.label}</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
