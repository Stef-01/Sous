-- Stage C (saved items) — docs/MVP-FEATURE-PLAN.md.

-- Idempotent dish toggles: one saved row per (user, dish).
create unique index if not exists uniq_saved_recipe_user_dish
  on public.saved_recipes(user_id, side_dish_id);

-- Polymorphic content bookmarks (article / reel / research / expert /
-- forum). Content items are static JSON, so item_id is plain text.
create table if not exists public.content_bookmarks (
  id       uuid primary key default gen_random_uuid(),
  user_id  text not null references public.users(id) on delete cascade,
  kind     text not null,
  item_id  text not null,
  saved_at timestamp default now(),
  unique (user_id, kind, item_id)
);
create index if not exists idx_content_bookmark_user on public.content_bookmarks(user_id);

-- RLS on, deny-by-default (server role bypasses; per-user policies arrive
-- with auth in Stage I).
alter table public.content_bookmarks enable row level security;
