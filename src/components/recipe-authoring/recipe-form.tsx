"use client";

/**
 * RecipeForm — shared authoring form for /path/recipes/new and
 * /path/recipes/[id]/edit. The two pages render identical form
 * surfaces; only the initial values + the toast wording differ.
 *
 * Extracted in W29 when the edit view shipped — the new-recipe
 * page (W27) was duplicated wholesale, so the extract-now move
 * keeps the form contract single-source.
 *
 * Submit pipeline (same for both modes since `commitDraft` is
 * idempotent on already-committed drafts):
 *   draft → commitDraft (fills/preserves id/slug/createdAt;
 *           always bumps updatedAt)
 *         → userRecipeSchema.safeParse  (zod validation)
 *         → drafts.upsert (id-keyed upsert into localStorage)
 *         → router.push('/path')
 */

import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import {
  appendBlankIngredient,
  appendBlankStep,
  commitDraft,
  removeStepAt,
  type RecipeDraft,
} from "@/lib/recipe-authoring/recipe-draft";
import {
  parsePointerLines,
  serialisePointerLines,
} from "@/lib/cook/attention-pointer-text";
import { useRecipeDrafts } from "@/lib/recipe-authoring/use-recipe-drafts";
import { userRecipeSchema } from "@/types/user-recipe";
import { toast } from "@/lib/hooks/use-toast";
import { SectionKicker } from "@/components/shared/section-kicker";
import { cn } from "@/lib/utils/cn";
import { SortableStepList } from "./sortable-step-list";

export interface RecipeFormProps {
  initialValues: RecipeDraft;
  /** Controls the toast wording on save. Both modes redirect to
   *  /path on success since `My recipes` is the canonical landing. */
  mode: "new" | "edit";
}

export function RecipeForm({ initialValues, mode }: RecipeFormProps) {
  const router = useRouter();
  const drafts = useRecipeDrafts();

  const form = useForm<RecipeDraft>({
    defaultValues: initialValues,
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
      title:
        mode === "new"
          ? `Saved "${validated.data.title}"`
          : `Updated "${validated.data.title}"`,
      body: "Find it under Path → My recipes.",
      dedupKey: "recipe-saved",
    });
    router.push("/path");
  });

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-6 px-4 pt-4">
      {/* Basics */}
      <section className="space-y-3 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
        <SectionKicker as="p" size="10px">
          Basics
        </SectionKicker>
        <FormField label="Title" error={form.formState.errors.title?.message}>
          <input
            {...form.register("title", {
              onChange: (e) => {
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
              {...form.register("prepTimeMinutes", { valueAsNumber: true })}
              className={inputClass}
            />
          </FormField>
          <FormField label="Cook (min)">
            <input
              type="number"
              min={0}
              {...form.register("cookTimeMinutes", { valueAsNumber: true })}
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
        <SortableStepList
          fieldIds={stepsArray.fields.map((f) => f.id)}
          steps={form.getValues("steps")}
          renderStepInstruction={(idx) => (
            <textarea
              {...form.register(`steps.${idx}.instruction`)}
              placeholder="Bloom the cumin seeds in oil for 30 seconds."
              rows={2}
              className={cn(inputClass, "resize-none")}
            />
          )}
          renderStepDetails={(idx) => (
            <div className="space-y-2">
              <FormField label="Timer (seconds)">
                <input
                  type="number"
                  min={0}
                  max={7200}
                  {...form.register(`steps.${idx}.timerSeconds`, {
                    setValueAs: (v) =>
                      v === "" || v === null ? null : Number(v),
                  })}
                  placeholder="e.g. 60"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Doneness cue">
                <input
                  {...form.register(`steps.${idx}.donenessCue`)}
                  placeholder="Edges should be golden, not brown."
                  className={inputClass}
                  maxLength={400}
                />
              </FormField>
              <FormField label="Mistake warning">
                <textarea
                  {...form.register(`steps.${idx}.mistakeWarning`)}
                  placeholder="Don't let the garlic burn — bitter flavour."
                  rows={2}
                  className={cn(inputClass, "resize-none")}
                  maxLength={400}
                />
              </FormField>
              <FormField label="Quick hack">
                <textarea
                  {...form.register(`steps.${idx}.quickHack`)}
                  placeholder="Tear the bread by hand for crispier croutons."
                  rows={2}
                  className={cn(inputClass, "resize-none")}
                  maxLength={400}
                />
              </FormField>
              <FormField label="Cuisine fact">
                <textarea
                  {...form.register(`steps.${idx}.cuisineFact`)}
                  placeholder="Caesar salad was invented in Tijuana."
                  rows={2}
                  className={cn(inputClass, "resize-none")}
                  maxLength={400}
                />
              </FormField>
              <FormField label="Image URL">
                <input
                  {...form.register(`steps.${idx}.imageUrl`)}
                  placeholder="https://… (optional)"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Attention pointers (one per line)">
                <textarea
                  defaultValue={serialisePointerLines(
                    form.getValues(`steps.${idx}.attentionPointers`),
                  )}
                  onBlur={(e) =>
                    form.setValue(
                      `steps.${idx}.attentionPointers`,
                      parsePointerLines(e.target.value),
                      { shouldDirty: true },
                    )
                  }
                  placeholder={
                    "circle: 0.3, 0.5 - watch the bubbles\narrow: 0.7, 0.2 - stir here"
                  }
                  rows={3}
                  className={cn(
                    inputClass,
                    "resize-none font-mono text-[12px]",
                  )}
                />
              </FormField>
            </div>
          )}
          onReorder={(next) => stepsArray.replace(next)}
          onRemove={(idx) =>
            stepsArray.replace(removeStepAt(form.getValues("steps"), idx))
          }
          canRemove={stepsArray.fields.length > 1}
        />
      </section>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full rounded-2xl bg-[var(--nourish-green)] py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {mode === "new" ? "Save recipe" : "Save changes"}
      </button>
    </form>
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
