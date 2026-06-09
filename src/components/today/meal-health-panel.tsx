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

  // The clinical layer + full breakdown — collapsed behind one disclosure. The
  // status badge + hedge live WITH the evidence here (R1), and a glance-level
  // status pill (below) carries the "not reviewed" signal even when collapsed.
  const evidenceBlock = (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-green)]">
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

      <WholeFoodComposition foodGroups={profile.foodGroups} />

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

      {hasNutrition && <GlycemicPill nutrition={perServing} />}
      <AyurvedicDishNote ingredientIds={ingredientIds} />
      <IngredientsToCheck slug={slug} />
      <DietaryProfile slug={slug} />

      {hasNutrition && (
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
        {!reviewed && (
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-medium text-[var(--nourish-subtext)]">
            {clinicianReview
              ? "Clinician review · unreviewed"
              : "Educational · not reviewed"}
          </span>
        )}
      </div>

      {hasNutrition && (
        <SousReadCard
          nutrition={perServing}
          foodGroups={profile.foodGroups}
          coverage={massedCoverage}
        />
      )}

      {hasNutrition && (
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

      {/* DEEP-DIVE — clinical evidence + full nutrition, one tap away. */}
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
    </section>
  );
}

/**
 * Notable whole-food groups, in display order. Minor groups (condiments,
 * spices, sweeteners, beverages) are omitted — they don't describe the dish's
 * nutrition character. This signal is mass- and serving-INDEPENDENT, so it is
 * accurate even where composed per-serving macros are not yet display-grade.
 */
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
      <span className="text-[var(--nourish-green)]">{names}</span>
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
  const strongGrade = row.grade === "high" || row.grade === "moderate";
  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-[14.5px] font-semibold leading-snug text-[var(--nourish-dark)]">
          {row.label}
        </h4>
        <span
          className={cn(
            "mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
            strongGrade
              ? "bg-[var(--nourish-green)]/12 text-[var(--nourish-green)]"
              : "bg-amber-100 text-amber-700",
          )}
        >
          {row.gradeLabel}
        </span>
      </div>
      <p className="sous-label mt-0.5">{row.classLabel}</p>

      {row.effectText && (
        <p className="mt-2.5 rounded-lg bg-[var(--nourish-green)]/[0.07] px-2.5 py-1.5 text-[12.5px] font-medium text-[var(--nourish-dark)]">
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
