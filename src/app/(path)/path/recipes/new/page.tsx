"use client";

/**
 * /path/recipes/new — recipe-authoring page (Stage-5 W27).
 *
 * Builds on the W17-W24 infrastructure:
 *   - W17 UserRecipe Zod schema (source of truth)
 *   - W23 pure draft helpers (defaultRecipeDraft, append/remove/reorder)
 *   - W23 react-hook-form (consensus pick from LIBRARY-RECOMMENDATIONS.md)
 *   - W24 useRecipeDrafts (localStorage persistence)
 *
 * This is the FIRST user-facing recipe authoring surface. The form
 * pairs react-hook-form's `useFieldArray` for ingredients + steps
 * with the existing Zod schema via @hookform/resolvers/zod —
 * exactly the use case react-hook-form beats formik on (per the
 * W23 master pick rationale: half the bundle, perf via uncontrolled
 * inputs, first-class Zod resolver).
 */

import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import {
  appendBlankIngredient,
  appendBlankStep,
  commitDraft,
  defaultRecipeDraft,
  removeStepAt,
  type RecipeDraft,
} from "@/lib/recipe-authoring/recipe-draft";
import { useRecipeDrafts } from "@/lib/recipe-authoring/use-recipe-drafts";
import { userRecipeSchema } from "@/types/user-recipe";
import { toast } from "@/lib/hooks/use-toast";
import { SectionKicker } from "@/components/shared/section-kicker";
import { cn } from "@/lib/utils/cn";

export default function NewRecipePage() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const drafts = useRecipeDrafts();

  // react-hook-form drives the form state. Schema validation
  // happens inside onSubmit via `userRecipeSchema.safeParse` after
  // commitDraft fills in the auto-managed fields — that's
  // structurally cleaner than wiring a partial-resolver here. RCA
  // from W27 Loop 2: the @hookform/resolvers/zod resolver wants a
  // schema whose type matches the form's TFieldValues exactly, but
  // RecipeDraft has 4 fields (id / slug / createdAt / updatedAt)
  // that the form should NOT collect — they're filled by commitDraft.
  // Using `.partial()` on the schema widens those fields to
  // optional but the resolver's TS contract still mismatches at
  // the call site. Manual validation in onSubmit avoids the
  // mismatch entirely.
  const form = useForm<RecipeDraft>({
    defaultValues: defaultRecipeDraft(),
    mode: "onBlur",
  });

  const ingredientsArray = useFieldArray({
    control: form.control,
    name: "ingredients",
  });
  const stepsArray = useFieldArray({
    control: form.control,
    name: "steps",
  });

  const onSubmit = form.handleSubmit((draft) => {
    const committed = commitDraft(draft);
    const validated = userRecipeSchema.safeParse(committed);
    if (!validated.success) {
      toast.push({
        variant: "info",
        title: "Recipe needs a tweak",
        body: validated.error.issues[0]?.message ?? "Validation failed",
        dedupKey: "recipe-validation",
      });
      return;
    }
    drafts.upsert(validated.data);
    toast.push({
      variant: "success",
      title: `Saved "${validated.data.title}"`,
      body: "Find it under Path → My recipes.",
      dedupKey: "recipe-saved",
    });
    router.push("/path");
  });

  return (
    <motion.div
      className="min-h-full bg-[var(--nourish-cream)] pb-24"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
    >
      <header className="app-header px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/path")}
            aria-label="Back to Path"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[var(--nourish-dark)] transition hover:bg-neutral-50"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
            New recipe
          </h1>
        </div>
      </header>

      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-md space-y-6 px-4 pt-4"
      >
        {/* Basics */}
        <section className="space-y-3 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
          <SectionKicker as="p" size="10px">
            Basics
          </SectionKicker>
          <FormField label="Title" error={form.formState.errors.title?.message}>
            <input
              {...form.register("title", {
                onChange: (e) => {
                  // Mirror title to dishName when dishName is empty
                  // (UX nicety; the user can still customise dishName
                  // separately by typing into it).
                  if (!form.getValues("dishName")) {
                    form.setValue("dishName", e.target.value);
                  }
                },
              })}
              placeholder="My famous chana masala"
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Cuisine family"
            error={form.formState.errors.cuisineFamily?.message}
          >
            <input
              {...form.register("cuisineFamily")}
              placeholder="indian / italian / mexican / …"
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Description"
            error={form.formState.errors.description?.message}
          >
            <textarea
              {...form.register("description")}
              placeholder="A short description of the dish."
              rows={3}
              className={cn(inputClass, "resize-none")}
            />
          </FormField>

          <div className="grid grid-cols-3 gap-2">
            <FormField label="Prep (min)">
              <input
                type="number"
                min={0}
                {...form.register("prepTimeMinutes", {
                  valueAsNumber: true,
                })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Cook (min)">
              <input
                type="number"
                min={0}
                {...form.register("cookTimeMinutes", {
                  valueAsNumber: true,
                })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Serves">
              <input
                type="number"
                min={1}
                {...form.register("serves", { valueAsNumber: true })}
                className={inputClass}
              />
            </FormField>
          </div>
        </section>

        {/* Ingredients */}
        <section className="space-y-3 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <SectionKicker as="p" size="10px">
              Ingredients
            </SectionKicker>
            <button
              type="button"
              onClick={() =>
                ingredientsArray.replace(
                  appendBlankIngredient(form.getValues("ingredients")),
                )
              }
              className="inline-flex items-center gap-1 rounded-full bg-[var(--nourish-green)]/10 px-2.5 py-1 text-[11px] font-semibold text-[var(--nourish-green)] hover:bg-[var(--nourish-green)]/20"
            >
              <Plus size={11} aria-hidden /> Add
            </button>
          </div>
          <ul className="space-y-2">
            {ingredientsArray.fields.map((field, idx) => (
              <li
                key={field.id}
                className="flex items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-50/60 p-2"
              >
                <input
                  {...form.register(`ingredients.${idx}.quantity`)}
                  placeholder="1 tbsp"
                  className={cn(inputClass, "w-20 shrink-0")}
                />
                <input
                  {...form.register(`ingredients.${idx}.name`)}
                  placeholder="cumin seeds"
                  className={inputClass}
                />
                {ingredientsArray.fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => ingredientsArray.remove(idx)}
                    aria-label={`Remove ingredient ${idx + 1}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-[var(--nourish-dark)]"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Steps */}
        <section className="space-y-3 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <SectionKicker as="p" size="10px">
              Steps
            </SectionKicker>
            <button
              type="button"
              onClick={() =>
                stepsArray.replace(appendBlankStep(form.getValues("steps")))
              }
              className="inline-flex items-center gap-1 rounded-full bg-[var(--nourish-green)]/10 px-2.5 py-1 text-[11px] font-semibold text-[var(--nourish-green)] hover:bg-[var(--nourish-green)]/20"
            >
              <Plus size={11} aria-hidden /> Add
            </button>
          </div>
          <ol className="space-y-2">
            {stepsArray.fields.map((field, idx) => (
              <li
                key={field.id}
                className="flex items-start gap-2 rounded-xl border border-neutral-100 bg-neutral-50/60 p-2"
              >
                <span className="mt-1.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--nourish-green)]/10 text-[11px] font-semibold text-[var(--nourish-green)]">
                  {idx + 1}
                </span>
                <textarea
                  {...form.register(`steps.${idx}.instruction`)}
                  placeholder="Bloom the cumin seeds in oil for 30 seconds."
                  rows={2}
                  className={cn(inputClass, "resize-none")}
                />
                {stepsArray.fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      stepsArray.replace(
                        removeStepAt(form.getValues("steps"), idx),
                      )
                    }
                    aria-label={`Remove step ${idx + 1}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-[var(--nourish-dark)]"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </li>
            ))}
          </ol>
        </section>

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full rounded-2xl bg-[var(--nourish-green)] py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          Save recipe
        </button>
      </form>
    </motion.div>
  );
}

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[14px] text-[var(--nourish-dark)] placeholder:text-[var(--nourish-subtext)]/70 focus:border-[var(--nourish-green)] focus:outline-none focus:ring-2 focus:ring-[var(--nourish-green)]/20";

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
        {label}
      </span>
      {children}
      {error && (
        <span className="text-[11px] text-rose-500" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
