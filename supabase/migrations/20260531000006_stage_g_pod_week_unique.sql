-- Stage G (cooking pods) — docs/MVP-FEATURE-PLAN.md.
-- One challenge week per (pod, weekKey) so week upserts are idempotent.
create unique index if not exists uniq_pod_challenge_week_pod_weekkey
  on public.pod_challenge_weeks(pod_id, week_key);
