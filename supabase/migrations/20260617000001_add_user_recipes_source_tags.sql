-- Add source_tags to user_recipes (schema-drift fix).
--
-- The Drizzle mirror (src/lib/db/y2-tables.ts) and the Zod schema
-- (src/types/user-recipe.ts) carry `sourceTags` — the "where did this come
-- from" categorisation chosen on the AI paste-import — but the provisioned
-- table did not. jsonb array, nullable (old rows + non-import authoring leave
-- it unset). `recipes.upsert` now writes it, so without this column the upsert
-- would error on the missing column once it's wired.
alter table public.user_recipes
  add column if not exists source_tags jsonb;
