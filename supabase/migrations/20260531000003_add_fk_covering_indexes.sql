-- Covering indexes for foreign keys flagged by the performance
-- advisor (unindexed_foreign_keys). Speeds FK lookups + cascade
-- deletes once these tables carry traffic.
create index if not exists idx_cook_session_side_dish on public.cook_sessions(side_dish_id);
create index if not exists idx_saved_recipe_side_dish on public.saved_recipes(side_dish_id);
create index if not exists idx_kids_ate_it_user on public.kids_ate_it_log(user_id);
create index if not exists idx_recipe_overlay_user on public.recipe_overlay(user_id);
create index if not exists idx_recipe_score_owner on public.recipe_score_breakdowns(owner_id);
create index if not exists idx_pod_owner on public.pods(owner_id);
create index if not exists idx_pod_member_user on public.pod_members(user_id);
create index if not exists idx_pod_challenge_week_pod on public.pod_challenge_weeks(pod_id);
create index if not exists idx_pod_submission_member on public.pod_submissions(member_id);
