"use client";

import { useState } from "react";
import { Leaf, ChevronDown, ExternalLink, AlertTriangle } from "lucide-react";
import { useAyurvedicMode } from "@/lib/hooks/use-ayurvedic-mode";
import {
  ayurvedicHerbsForDish,
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
 * AyurvedicDishNote — only renders when the Ayurvedic lens is ON and the dish
 * contains an evidence-validated Ayurvedic herb. Traditional use + modern
 * evidence are kept separate; each row discloses the safety note + the paper.
 */
export function AyurvedicDishNote({
  ingredientIds,
}: {
  ingredientIds?: ReadonlySet<string>;
}) {
  const { enabled, mounted } = useAyurvedicMode();
  const [openId, setOpenId] = useState<string | null>(null);

  if (!mounted || !enabled) return null;
  const herbs = ayurvedicHerbsForDish(ingredientIds);
  if (herbs.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[var(--nourish-border)] bg-[var(--nourish-cream)]/40 p-3">
      <p className="sous-label flex items-center gap-1.5">
        <Leaf size={12} className="text-[var(--nourish-green)]" aria-hidden />
        Ayurvedic lens
      </p>
      <ul className="mt-2 space-y-1">
        {herbs.map((h) => {
          const open = openId === h.id;
          const s = STRENGTH[h.strength];
          return (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : h.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-2 rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-white/60"
              >
                <span className="flex-1 text-[12.5px] text-[var(--nourish-dark)]">
                  <span className="font-semibold">{h.name}</span>
                  <span className="text-[var(--nourish-subtext)]">
                    {" · "}
                    {h.ayurvedicName}
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
                <ChevronDown
                  size={14}
                  className={cn(
                    "shrink-0 text-[var(--nourish-subtext)] transition-transform",
                    open && "rotate-180",
                  )}
                />
              </button>
              {open && (
                <div className="space-y-1.5 px-1 pb-2 pt-0.5">
                  <p className="text-[11.5px] text-[var(--nourish-subtext)]">
                    {h.traditionalUse}
                  </p>
                  <p className="text-[11.5px] text-[var(--nourish-dark)]">
                    <span className="font-semibold">Research:</span>{" "}
                    {h.research}
                  </p>
                  <p className="flex items-start gap-1 text-[11px] text-amber-700">
                    <AlertTriangle
                      size={11}
                      className="mt-0.5 shrink-0"
                      aria-hidden
                    />
                    <span>{h.safety}</span>
                  </p>
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
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[10px] leading-snug text-[var(--nourish-subtext-faint)]">
        Traditional use alongside modern evidence — food amounts differ from the
        concentrated doses studied. Educational, not medical advice.
      </p>
    </section>
  );
}
