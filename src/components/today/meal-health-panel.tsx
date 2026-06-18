"use client";

/**
 * MealHealthPanel — the content of the swipe-up health sheet (Culinary
 * Therapeutics, swipe-up panel phase 3).
 *
 * A *static* presentational shell: it renders the food-first evidence a single
 * dish realizes, reusing the same evidence-row shaping as the per-condition
 * EvidenceProvenanceStrip (via `interventionToEvidenceRow`) so the two surfaces
 * can never drift. The drag/snap gesture lives in the wrapper hook — this
 * component owns no motion, so it needs no reduced-motion gate.
 *
 * Safety (rule 11): personalized framing ("matched to your focus") renders ONLY
 * when the registry has cleared clinician review (`reviewed`, founder gate G1,
 * env-gated default OFF). Until then every dish shows the neutral "Educational"
 * badge and the mandatory food-first hedge — no personalization is asserted.
 */

import type { ConditionId } from "@/types/therapeutics";
import type { FoodGroup } from "@/types/ingredient";
import {
  interventionToEvidenceRow,
  type EvidenceRow,
} from "@/lib/therapeutics/evidence-card";
import {
  matchInterventionsForDish,
  gramsForSignal,
} from "@/lib/engine/therapeutic-fit";
import { getDishTherapeuticProfile } from "@/lib/engine/dish-therapeutic-profile";
import { NutritionRingCard } from "@/components/shared/nutrition-ring-card";
import { IngredientsToCheck } from "@/components/shared/ingredients-to-check";
import { BioavailabilityTip } from "@/components/shared/bioavailability-tip";
import { AyurvedicDishNote } from "@/components/shared/ayurvedic-dish-note";
import { GlycemicPill } from "@/components/shared/glycemic-pill";
import { NutritionShareButton } from "@/components/shared/nutrition-share-button";
import { LogItButton } from "@/components/shared/log-it-button";
import { DietaryProfile } from "@/components/shared/dietary-profile";
import {
  getDishNutrition,
  getDishPerServing,
  getDishCompositionGrams,
  getDishIngredientIds,
  NUTRITION_COVERAGE_FLOOR,
  type DishCompositionGrams,
} from "@/lib/engine/dish-nutrition";
import { FOOD_FIRST_HEDGE } from "@/lib/therapeutics/claim-contract";
import { CONDITIONS } from "@/data/therapeutics";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SousReadCard } from "@/components/shared/sous-read-card";
import { HonestyChip } from "@/components/shared/honesty-chip";
import {
  EvidenceTierBadge,
  gradeToTier,
} from "@/components/shared/evidence-tier";
import {
  useHealthLens,
  lensFilter,
  HEALTH_LENSES,
  type HealthLens,
} from "@/lib/hooks/use-health-lens";

export interface MealHealthPanelProps {
  dishName: string;
  tags: string[];
  /** Dish slug — resolves the ingredient profile for food-identity matching. */
  slug?: string;
  /** Dish description — richer fallback identity for meals without links. */
  description?: string;
  /** The user's active health focus (care profile). Empty = generic view. */
  conditions: readonly ConditionId[];
  /** registryIsClinicianApproved() — gates personalized framing (gate G1). */
  reviewed: boolean;
  /** clinicianReviewMode() — shows personalization for clinician evaluation,
   *  badged "Clinician review" (unreviewed), never "Reviewed". */
  clinicianReview?: boolean;
  /** therapeuticsActive() — when false, the panel is NUTRITION ONLY: the
   *  therapeutic evidence deep-dive + the review-status framing are hidden, but
   *  the macro glance / Sous-read / ring / log always render. Default true. */
  showTherapeutic?: boolean;
  className?: string;
}

export function MealHealthPanel({
  dishName,
  tags,
  slug,
  description,
  conditions,
  reviewed,
  clinicianReview = false,
  showTherapeutic = true,
  className,
}: MealHealthPanelProps) {
  const [showEvidence, setShowEvidence] = useState(false);
  // Scope to the user's conditions when set (relevant view); otherwise surface
  // what the dish brings across every condition (generic discovery view).
  const scope = conditions.length > 0 ? conditions : undefined;
  // Bridge: resolved ingredient classes/groups let matching reason over food
  // identity, not spelling. Linked dishes use their ingredient list; meals
  // (no links) fall back to identity named in their title, tags + description.
  const profile = getDishTherapeuticProfile(
    slug,
    `${dishName} ${tags.join(" ")} ${description ?? ""}`,
  );
  // Per-serving grams of each food group/class → the quantity context shown
  // beside a matched signal ("legumes ~67g"). Empty for unlinked dishes.
  const composition = getDishCompositionGrams(slug);
  const matches = matchInterventionsForDish(
    {
      name: dishName,
      tags,
      resolvedClasses: profile.therapeuticClasses,
      resolvedGroups: profile.foodGroups,
    },
    scope,
  );
  // Personalization shows when approved (G1) OR in clinician-review mode.
  const personalized = (reviewed || clinicianReview) && conditions.length > 0;
  const statusLabel = reviewed
    ? "Reviewed"
    : clinicianReview
      ? "Clinician review"
      : "Educational";

  // Glance nutrition (Sous-read + compact ring + tip + log), gated at coverage.
  const { perServing, massedCoverage, massedLines, totalLines } =
    getDishNutrition(slug);
  const hasNutrition =
    !!perServing && massedCoverage >= NUTRITION_COVERAGE_FLOOR;
  const ingredientIds = getDishIngredientIds(slug);

  // Decision-point macros — SEED-FIRST + coverage-gated (display-grade or
  // honestly hidden), so accurate per-serving calories/macros reach the Info
  // sheet the user opens to decide whether to cook. Before this they were gated
  // behind the composed path and missing for ~every dish (incl. the 13 seeded
  // ones with hand-authored numbers). The deeper composed views below stay.
  const { perServing: glanceServing, coverage: glanceCoverage } =
    getDishPerServing(slug);
  // A hand-authored seed (coverage 1) is the accurate source — show its macro
  // pill and suppress the composed ring below (whose ingredient-math estimate
  // would otherwise contradict it). Non-seeded dishes keep the composed ring.
  const isSeedGlance = !!glanceServing && glanceCoverage >= 1;

  // Phase 10 — the reading lens (default everyday). It gates only the OPTIONAL
  // layers; the status badge + hedge render regardless, and the AyurvedicDishNote
  // auto-respects it via the now-derived useAyurvedicMode (lens === "ayurvedic").
  const { lens, setLens } = useHealthLens();
  const showEvidenceRows = lensFilter(lens).showEvidence;

  // The clinical layer + full breakdown — collapsed behind one disclosure. The
  // status badge + hedge live WITH the evidence here (R1), and a glance-level
  // status pill (below) carries the "not reviewed" signal even when collapsed.
  const evidenceBlock = (
    <div className="space-y-6">
      {/* Lens switcher — Everyday (default) · Therapeutic · Ayurvedic. A view
          toggle, not a settings panel (Rule 3); subordinate to Log it (Rule 2). */}
      <LensSwitcher lens={lens} onChange={setLens} />

      {/* Therapeutic lens only: the food-first evidence rows + their status badge,
          gated exactly as before by reviewed/clinicianReview. */}
      {showEvidenceRows && (
        <>
          <header className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--tier-strong)]">
              Food-first evidence
            </p>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                reviewed
                  ? "bg-[var(--nourish-green)]/12 text-[var(--nourish-green)]"
                  : clinicianReview
                    ? "bg-amber-100 text-amber-800"
                    : "bg-neutral-100 text-[var(--nourish-subtext)]",
              )}
            >
              {statusLabel}
            </span>
          </header>

          {matches.length === 0 ? (
            <EmptyState hasConditions={conditions.length > 0} />
          ) : (
            <div className="flex flex-col gap-3">
              {personalized && <PersonalizedSubhead conditions={conditions} />}
              <ul className="flex flex-col divide-y divide-neutral-100/80">
                {matches.map((m) => (
                  <EvidenceRowItem
                    key={m.record.id}
                    row={interventionToEvidenceRow(m.record)}
                    signals={m.matchedSignals}
                    composition={composition}
                  />
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <WholeFoodComposition foodGroups={profile.foodGroups} />

      {hasNutrition && <GlycemicPill nutrition={perServing} />}
      {/* Ayurvedic lens only (auto-gated inside via the derived useAyurvedicMode). */}
      <AyurvedicDishNote ingredientIds={ingredientIds} />
      <IngredientsToCheck slug={slug} />
      <DietaryProfile slug={slug} />

      {hasNutrition && !isSeedGlance && (
        <div className="rounded-2xl bg-[var(--nourish-cream)]/50 p-4">
          <NutritionRingCard
            nutrition={perServing}
            coverage={{ massed: massedLines, total: totalLines }}
          />
        </div>
      )}

      <p className="text-[10.5px] leading-relaxed text-[var(--nourish-subtext-faint)]">
        {FOOD_FIRST_HEDGE}
      </p>
    </div>
  );

  return (
    <section
      aria-label={`Health info for ${dishName}`}
      className={cn("flex flex-col gap-4", className)}
    >
      {/* GLANCE — ambient honesty + the review-status pill (R1: glance-visible). */}
      <div className="flex flex-wrap items-center gap-2">
        <HonestyChip />
        {showTherapeutic && !reviewed && (
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-medium text-[var(--nourish-subtext)]">
            {clinicianReview
              ? "Clinician review · unreviewed"
              : "Educational · not reviewed"}
          </span>
        )}
      </div>

      {/* Decision-point macro glance — accurate calories + P/C/F at the top of
          the Info sheet, so the user can weigh nutrition BEFORE committing to
          cook (rule 13: one compact row, no prose). */}
      {isSeedGlance && (
        <div className="flex items-center gap-3 rounded-2xl bg-[var(--nourish-cream)]/60 px-4 py-2.5">
          <span className="tabular-nums text-[16px] font-semibold text-[var(--nourish-dark)]">
            {Math.round(glanceServing.calories ?? 0)}
            <span className="ml-0.5 text-[11px] font-medium text-[var(--nourish-subtext)]">
              cal
            </span>
          </span>
          <span className="text-[11px] text-[var(--nourish-subtext-faint)]">
            / serving
          </span>
          <span className="ml-auto flex items-center gap-2.5 tabular-nums text-[12px] font-semibold">
            <span style={{ color: "var(--data-protein)" }}>
              {Math.round(glanceServing.protein_g ?? 0)}g P
            </span>
            <span style={{ color: "var(--data-carb)" }}>
              {Math.round(glanceServing.totalCarbs_g ?? 0)}g C
            </span>
            <span style={{ color: "var(--data-fat)" }}>
              {Math.round(glanceServing.totalFat_g ?? 0)}g F
            </span>
          </span>
        </div>
      )}

      {hasNutrition && (
        <SousReadCard
          nutrition={perServing}
          foodGroups={profile.foodGroups}
          coverage={massedCoverage}
        />
      )}

      {hasNutrition && !isSeedGlance && (
        <div className="rounded-2xl bg-[var(--nourish-cream)]/50 p-4">
          <NutritionRingCard
            nutrition={perServing}
            compact
            coverage={{ massed: massedLines, total: totalLines }}
          />
        </div>
      )}

      {hasNutrition && (
        <BioavailabilityTip
          nutrition={perServing}
          ingredientIds={ingredientIds}
        />
      )}

      {hasNutrition && (
        <div className="flex items-center justify-between gap-2">
          {slug ? <LogItButton slug={slug} name={dishName} /> : <span />}
          <NutritionShareButton title={dishName} nutrition={perServing} />
        </div>
      )}

      {/* DEEP-DIVE — therapeutic evidence + full nutrition. Gated by the
          therapeutics flag; when off, the panel above is the full (nutrition)
          experience and this clinician layer is hidden. */}
      {showTherapeutic && (
        <div className="border-t border-[var(--nourish-border)] pt-1">
          <button
            type="button"
            onClick={() => setShowEvidence((s) => !s)}
            aria-expanded={showEvidence}
            className="flex w-full items-center justify-between py-2 text-[13px] font-semibold text-[var(--nourish-dark)]"
          >
            Evidence &amp; full nutrition
            <ChevronDown
              size={16}
              className={cn(
                "text-[var(--nourish-subtext)] transition-transform",
                showEvidence && "rotate-180",
              )}
              aria-hidden
            />
          </button>
          {showEvidence && <div className="mt-2">{evidenceBlock}</div>}
        </div>
      )}
    </section>
  );
}

/**
 * Notable whole-food groups, in display order. Minor groups (condiments,
 * spices, sweeteners, beverages) are omitted — they don't describe the dish's
 * nutrition character. This signal is mass- and serving-INDEPENDENT, so it is
 * accurate even where composed per-serving macros are not yet display-grade.
 */
const LENS_LABEL: Record<HealthLens, string> = {
  everyday: "Everyday",
  therapeutic: "Therapeutic",
  ayurvedic: "Ayurvedic",
};

function LensSwitcher({
  lens,
  onChange,
}: {
  lens: HealthLens;
  onChange: (l: HealthLens) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Health reading lens"
      className="flex rounded-full bg-neutral-100 p-0.5"
    >
      {HEALTH_LENSES.map((l) => (
        <button
          key={l}
          type="button"
          role="tab"
          aria-selected={lens === l}
          onClick={() => onChange(l)}
          className={cn(
            "flex-1 rounded-full px-2 py-1.5 text-[11px] font-semibold transition-colors",
            lens === l
              ? "bg-white text-[var(--nourish-dark)] shadow-sm"
              : "text-[var(--nourish-subtext)]",
          )}
        >
          {LENS_LABEL[l]}
        </button>
      ))}
    </div>
  );
}

const NOTABLE_GROUPS: ReadonlyArray<FoodGroup> = [
  "leafy-green",
  "vegetable",
  "legume",
  "fruit",
  "nut-seed",
  "seafood",
  "poultry",
  "egg",
  "red-meat",
  "grain",
  "dairy",
  "fat-oil",
];

const FOOD_GROUP_LABEL: Record<FoodGroup, string> = {
  vegetable: "vegetables",
  "leafy-green": "leafy greens",
  fruit: "fruit",
  legume: "legumes",
  grain: "grains",
  "nut-seed": "nuts & seeds",
  dairy: "dairy",
  egg: "eggs",
  "red-meat": "red meat",
  poultry: "poultry",
  seafood: "seafood",
  "fat-oil": "healthy oils",
  "herb-spice": "herbs & spices",
  sweetener: "sweeteners",
  condiment: "condiments",
  beverage: "beverages",
  other: "other",
};

function WholeFoodComposition({
  foodGroups,
}: {
  foodGroups: ReadonlyArray<FoodGroup>;
}) {
  const set = new Set(foodGroups);
  const shown = NOTABLE_GROUPS.filter((g) => set.has(g)).slice(0, 5);
  if (shown.length === 0) return null;
  return (
    <div>
      <p className="sous-label mb-2">Built on</p>
      <div className="flex flex-wrap gap-1.5">
        {shown.map((g) => (
          <span
            key={g}
            className="rounded-full bg-[var(--nourish-cream)] px-2.5 py-1 text-[11.5px] font-medium text-[var(--nourish-dark)]"
          >
            {FOOD_GROUP_LABEL[g]}
          </span>
        ))}
      </div>
    </div>
  );
}

function PersonalizedSubhead({
  conditions,
}: {
  conditions: readonly ConditionId[];
}) {
  const names = conditions.map((c) => CONDITIONS[c].displayName).join(" · ");
  return (
    <p className="text-[12px] font-medium text-[var(--nourish-dark)]">
      Matched to your focus:{" "}
      <span className="text-[var(--tier-strong)]">{names}</span>
    </p>
  );
}

function EvidenceRowItem({
  row,
  signals,
  composition,
}: {
  row: EvidenceRow;
  signals: string[];
  composition: DishCompositionGrams;
}) {
  // Annotate each signal with how much realizing food the dish has per serving
  // ("legumes ~67g"), when we have quantities. Honest quantity context.
  const labelFor = (sig: string) => {
    const grams = gramsForSignal(sig, composition);
    return grams >= 1 ? `${sig} ~${Math.round(grams)}g` : sig;
  };
  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-[14.5px] font-semibold leading-snug text-[var(--nourish-dark)]">
          {row.label}
        </h4>
        {/* Phase 8 — one quality grammar; moderate now reads as its own amber
            tier, not green (R6 honesty correction). */}
        <EvidenceTierBadge
          tier={gradeToTier(row.grade)}
          label={row.gradeLabel}
          className="mt-0.5"
        />
      </div>
      <p className="sous-label mt-0.5">{row.classLabel}</p>

      {row.effectText && (
        <p className="mt-2.5 rounded-lg bg-[var(--tier-strong-bg)] px-2.5 py-1.5 text-[12.5px] font-medium text-[var(--nourish-dark)]">
          {row.effectText}
        </p>
      )}
      <p className="mt-2.5 text-[12.5px] leading-relaxed text-[var(--nourish-subtext)]">
        {row.note}
      </p>

      {(signals.length > 0 || row.doseSignal) && (
        <div className="mt-2.5 space-y-1 text-[11px] leading-snug text-[var(--nourish-subtext-faint)]">
          {signals.length > 0 && (
            <p>In this dish: {signals.map(labelFor).join(" · ")}</p>
          )}
          {row.doseSignal && <p>Typically needs {row.doseSignal}</p>}
        </div>
      )}
    </li>
  );
}

function EmptyState({ hasConditions }: { hasConditions: boolean }) {
  return (
    <div className="rounded-xl bg-[var(--nourish-cream)]/60 px-3 py-4 text-center">
      <p className="text-[13px] font-medium text-[var(--nourish-dark)]">
        No food-first evidence encoded for this dish yet
      </p>
      <p className="mt-1 text-[12px] leading-snug text-[var(--nourish-subtext)]">
        {hasConditions
          ? "We only surface ingredient-level evidence we can cite — this dish doesn’t match one yet."
          : "Set a health focus in your profile to see evidence relevant to you."}
      </p>
    </div>
  );
}
