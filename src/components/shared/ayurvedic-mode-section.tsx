"use client";

import { useState } from "react";
import { Leaf, ChevronDown, ExternalLink, AlertTriangle } from "lucide-react";
import { useAyurvedicMode } from "@/lib/hooks/use-ayurvedic-mode";
import {
  AYURVEDIC_HERBS,
  type EvidenceStrength,
} from "@/data/ayurvedic-evidence";
import { cn } from "@/lib/utils/cn";

const STRENGTH: Record<EvidenceStrength, { label: string; cls: string }> = {
  strong: {
    label: "Good evidence",
    cls: "bg-[var(--nourish-green)]/12 text-[var(--nourish-green)]",
  },
  moderate: { label: "Some evidence", cls: "bg-amber-100 text-amber-700" },
  limited: {
    label: "Limited evidence",
    cls: "bg-neutral-100 text-neutral-500",
  },
};

/**
 * AyurvedicModeSection — the Profile-sheet home for the Ayurvedic lens: a toggle
 * (drives the per-dish notes) plus the full, honestly-framed evidence reference.
 * Only culinary herbs with modern clinical evidence; the dosha framework is
 * deliberately excluded.
 */
export function AyurvedicModeSection() {
  const { enabled, mounted, toggle } = useAyurvedicMode();
  const [open, setOpen] = useState(false);
  const on = mounted && enabled;

  return (
    <section className="mt-4 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="sous-label flex items-center gap-1.5">
            <Leaf
              size={12}
              className="text-[var(--nourish-green)]"
              aria-hidden
            />
            Ayurvedic lens
          </p>
          <p className="mt-1 text-[12px] leading-snug text-[var(--nourish-subtext)]">
            Surfaces evidence-backed Ayurvedic herbs on a dish&apos;s Info —
            only ones with modern clinical evidence. No dosha typing.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Ayurvedic lens"
          onClick={toggle}
          className={cn(
            "relative h-7 w-12 shrink-0 rounded-full transition-colors",
            on ? "bg-[var(--nourish-green)]" : "bg-neutral-300",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
              on ? "translate-x-[22px]" : "translate-x-0.5",
            )}
          />
        </button>
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-3 flex w-full items-center gap-1.5 border-t border-[var(--nourish-border)] pt-3 text-left"
      >
        <span className="flex-1 text-[12.5px] font-semibold text-[var(--nourish-dark)]">
          The herbs &amp; the evidence
        </span>
        <ChevronDown
          size={15}
          className={cn(
            "text-[var(--nourish-subtext)] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <p className="text-[11px] leading-snug text-[var(--nourish-subtext-faint)]">
            Ayurveda&apos;s broader framework (doshas and the like) isn&apos;t
            validated by rigorous trials and isn&apos;t included here. These are
            its culinary herbs that ALSO carry modern evidence. Food amounts
            differ from the concentrated doses studied. Educational, not medical
            advice — some herbs interact with medications; check with your
            clinician, especially if pregnant or on medication.
          </p>
          {/* W6 — the 3-tier evidence legend. */}
          <div className="flex flex-wrap gap-1.5 text-[10px] font-medium">
            <span className="rounded-full bg-[var(--nourish-green)]/12 px-2 py-0.5 text-[var(--nourish-green)]">
              Good · consistent meta-analyses
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
              Some · mixed / dose-dependent
            </span>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-500">
              Limited · early but real
            </span>
          </div>
          {AYURVEDIC_HERBS.map((h) => {
            const s = STRENGTH[h.strength];
            return (
              <div
                key={h.id}
                className="rounded-xl bg-[var(--nourish-cream)]/60 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-[12.5px] font-semibold text-[var(--nourish-dark)]">
                    {h.name}
                    <span className="font-normal text-[var(--nourish-subtext)]">
                      {" · "}
                      {h.ayurvedicName}{" "}
                      <span className="italic">({h.botanical})</span>
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                      s.cls,
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                <p className="mt-1 text-[11.5px] text-[var(--nourish-subtext)]">
                  {h.traditionalUse}
                </p>
                <p className="mt-1 text-[11.5px] text-[var(--nourish-dark)]">
                  <span className="font-semibold">Research:</span> {h.research}
                </p>
                <p className="mt-1 flex items-start gap-1 text-[11px] text-amber-700">
                  <AlertTriangle
                    size={11}
                    className="mt-0.5 shrink-0"
                    aria-hidden
                  />
                  <span>{h.safety}</span>
                </p>
                <div className="mt-1.5 space-y-1">
                  {h.sources.map((src) => (
                    <a
                      key={src.url}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-1 text-[11px] font-medium text-[var(--nourish-green)] hover:underline"
                    >
                      <ExternalLink
                        size={10}
                        className="mt-0.5 shrink-0"
                        aria-hidden
                      />
                      <span>{src.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
