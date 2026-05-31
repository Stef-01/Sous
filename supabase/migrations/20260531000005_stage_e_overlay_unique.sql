-- Stage E (preferences) — docs/MVP-FEATURE-PLAN.md.
-- One note per (user, recipe, step) so step-note saves upsert idempotently.
create unique index if not exists uniq_recipe_overlay_user_recipe_step
  on public.recipe_overlay(user_id, recipe_slug, step_index);
