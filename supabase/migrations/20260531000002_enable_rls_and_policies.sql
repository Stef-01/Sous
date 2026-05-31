-- ════════════════════════════════════════════════════════════════
-- Security posture.
--
-- The app's server (Drizzle + postgres-js over DATABASE_URL) uses the
-- `postgres` role, which has BYPASSRLS — so enabling RLS does NOT
-- affect server-side access. RLS here governs only the anon /
-- authenticated roles reachable with the publishable key via PostgREST.
--
--   * Content catalog tables  → public read-only (non-sensitive).
--   * All user-data / write    → RLS on, NO anon policy
--     tables                     (deny-by-default; server bypasses).
-- ════════════════════════════════════════════════════════════════

alter table public.users                  enable row level security;
alter table public.side_dishes            enable row level security;
alter table public.meals                  enable row level security;
alter table public.cook_steps             enable row level security;
alter table public.ingredients            enable row level security;
alter table public.cook_sessions          enable row level security;
alter table public.saved_recipes          enable row level security;
alter table public.quiz_responses         enable row level security;
alter table public.parent_profile         enable row level security;
alter table public.kid_friendliness_label enable row level security;
alter table public.kids_ate_it_log        enable row level security;
alter table public.recipe_overlay         enable row level security;
alter table public.user_recipes           enable row level security;
alter table public.recipe_score_breakdowns enable row level security;
alter table public.pods                   enable row level security;
alter table public.pod_members            enable row level security;
alter table public.pod_challenge_weeks    enable row level security;
alter table public.pod_submissions        enable row level security;
alter table public.notifications          enable row level security;
alter table public.meal_plan_slots        enable row level security;
alter table public.llm_call_entries       enable row level security;
alter table public.charity_charge_entries enable row level security;

-- Public read-only on the non-sensitive content catalog.
create policy "Public read content" on public.side_dishes
  for select to anon, authenticated using (true);
create policy "Public read content" on public.meals
  for select to anon, authenticated using (true);
create policy "Public read content" on public.cook_steps
  for select to anon, authenticated using (true);
create policy "Public read content" on public.ingredients
  for select to anon, authenticated using (true);
create policy "Public read content" on public.kid_friendliness_label
  for select to anon, authenticated using (true);
