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
import { matchInterventionsForDish } from "@/lib/engine/therapeutic-fit";
import { getDishTherapeuticProfile } from "@/lib/engine/dish-therapeutic-profile";
import { getDishNutrition } from "@/lib/engine/dish-nutrition";
import { FOOD_FIRST_HEDGE } from "@/lib/therapeutics/claim-contract";
import { CONDITIONS } from "@/data/therapeutics";
import { cn } from "@/lib/utils/cn";

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

  return (
    <section
      aria-label={`Food-first evidence for ${dishName}`}
      className={cn("flex flex-col gap-3", className)}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--nourish-green)]">
          Food-first evidence
        </p>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium",
            reviewed
              ? "bg-[var(--nourish-green)]/12 text-[var(--nourish-green)]"
              : clinicianReview
                ? "bg-amber-100 text-amber-800"
                : "bg-neutral-100 text-[var(--nourish-subtext)]",
          )}
        >
          {statusLabel}
        </span>
      </div>

      <WholeFoodComposition foodGroups={profile.foodGroups} />

      {matches.length === 0 ? (
        <EmptyState hasConditions={conditions.length > 0} />
      ) : (
        <>
          {personalized && <PersonalizedSubhead conditions={conditions} />}
          <ul className="space-y-3">
            {matches.map((m) => (
              <EvidenceRowItem
                key={m.record.id}
                row={interventionToEvidenceRow(m.record)}
                signals={m.matchedSignals}
              />
            ))}
          </ul>
        </>
      )}

      <NutritionSnapshot slug={slug} />

      <p className="text-[10px] leading-snug text-[var(--nourish-subtext-faint)]">
        {FOOD_FIRST_HEDGE}
      </p>
    </section>
  );
}

/** Coverage below which composed macros are too partial to show honestly. */
const NUTRITION_DISPLAY_FLOOR = 0.7;

function NutritionSnapshot({ slug }: { slug?: string }) {
  const { perServing, massedCoverage } = getDishNutrition(slug);
  if (!perServing || massedCoverage < NUTRITION_DISPLAY_FLOOR) return null;

  const items: Array<{ label: string; value: string }> = [
    { label: "Calories", value: `${Math.round(perServing.calories)}` },
    { label: "Fiber", value: `${perServing.fiber_g.toFixed(1)} g` },
    { label: "Sodium", value: `${Math.round(perServing.sodium_mg)} mg` },
    { label: "Sat fat", value: `${perServing.saturatedFat_g.toFixed(1)} g` },
  ];

  return (
    <div className="border-t border-neutral-100 pt-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--nourish-subtext-faint)]">
        Estimated nutrition · per serving
      </p>
      <dl className="mt-1.5 grid grid-cols-4 gap-2">
        {items.map((it) => (
          <div key={it.label}>
            <dt className="text-[10px] text-[var(--nourish-subtext-faint)]">
              {it.label}
            </dt>
            <dd className="text-[13px] font-semibold text-[var(--nourish-dark)]">
              {it.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-1.5 text-[10px] leading-snug text-[var(--nourish-subtext-faint)]">
        Composed from USDA ingredient data · assumes{" "}
        {perServing.servingsPerRecipe} servings · frying oil partially absorbed
        · an estimate, not a label.
      </p>
    </div>
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
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--nourish-subtext-faint)]">
        Built on
      </span>
      {shown.map((g) => (
        <span
          key={g}
          className="rounded-full bg-[var(--nourish-cream)] px-2 py-0.5 text-[11px] font-medium text-[var(--nourish-dark)]"
        >
          {FOOD_GROUP_LABEL[g]}
        </span>
      ))}
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
}: {
  row: EvidenceRow;
  signals: string[];
}) {
  return (
    <li className="border-t border-neutral-100 pt-3 first:border-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[13px] font-semibold text-[var(--nourish-dark)]">
          {row.label}
        </span>
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
            row.isEducation
              ? "bg-neutral-100 text-[var(--nourish-subtext)]"
              : "bg-[var(--nourish-green)]/12 text-[var(--nourish-green)]",
          )}
        >
          {row.classLabel}
        </span>
        <span className="rounded-full bg-[var(--nourish-cream)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--nourish-subtext)]">
          {row.gradeLabel} evidence
        </span>
      </div>
      {row.effectText && (
        <p className="mt-1 text-[12px] font-medium text-[var(--nourish-dark)]">
          {row.effectText}
        </p>
      )}
      {row.doseSignal && (
        <p className="mt-0.5 text-[11px] text-[var(--nourish-subtext)]">
          Typically needs: {row.doseSignal}
        </p>
      )}
      <p className="mt-1 text-[12px] leading-snug text-[var(--nourish-subtext)]">
        {row.note}
      </p>
      {signals.length > 0 && (
        <p className="mt-1.5 text-[11px] text-[var(--nourish-subtext-faint)]">
          In this dish: {signals.join(" · ")}
        </p>
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
