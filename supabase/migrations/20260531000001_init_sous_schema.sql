-- ════════════════════════════════════════════════════════════════
-- Sous V1 schema. Mirrors the Drizzle definitions in
-- src/lib/db/{schema,y2-tables,y4-tables}.ts plus the `meals` table.
-- `users` is the union of the two (historically conflicting) Drizzle
-- `users` definitions so every FK + both readers are satisfied.
-- Applied to project bkkjtmvyayieyeeshbim on 2026-05-31.
-- ════════════════════════════════════════════════════════════════

-- ── users (union of schema.ts + y2-tables.ts) ──────────────────
create table if not exists public.users (
  id                  text primary key,
  display_name        text,
  avatar_url          text,
  avatar              text,
  preference_vector   jsonb default '{}'::jsonb,
  completed_cooks     integer default 0,
  current_streak      integer default 0,
  longest_streak      integer default 0,
  path_unlocked       boolean default false,
  community_unlocked  boolean default false,
  coach_tone          text default 'gentle',
  created_at          timestamp not null default now(),
  last_synced_at      timestamp default now()
);

-- ── side_dishes ────────────────────────────────────────────────
create table if not exists public.side_dishes (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  slug                 text not null unique,
  description          text not null,
  cuisine_family       text not null,
  prep_time_minutes    integer not null,
  cook_time_minutes    integer not null,
  skill_level          text not null,
  flavor_profile       jsonb not null,
  temperature          text not null,
  protein_grams        real,
  fiber_grams          real,
  calories_per_serving integer,
  hero_image_url       text,
  best_paired_with     jsonb not null,
  tags                 jsonb default '[]'::jsonb,
  pairing_reason       text,
  nutrition_category   text,
  is_published         boolean default true,
  created_at           timestamp default now(),
  updated_at           timestamp default now()
);

-- ── meals (from src/data/meals.json) ───────────────────────────
create table if not exists public.meals (
  id              text primary key,
  name            text not null,
  aliases         jsonb not null default '[]'::jsonb,
  hero_image_url  text,
  side_pool       jsonb not null default '[]'::jsonb,
  cuisine         text not null,
  description     text not null,
  nourish_verified boolean not null default false,
  created_at      timestamp default now(),
  updated_at      timestamp default now()
);

-- ── cook_steps ─────────────────────────────────────────────────
create table if not exists public.cook_steps (
  id              uuid primary key default gen_random_uuid(),
  side_dish_id    uuid not null references public.side_dishes(id) on delete cascade,
  phase           text not null,
  step_number     integer not null,
  instruction     text not null,
  timer_seconds   integer,
  mistake_warning text,
  quick_hack      text,
  cuisine_fact    text,
  doneness_cue    text,
  image_url       text
);

-- ── ingredients ────────────────────────────────────────────────
create table if not exists public.ingredients (
  id           uuid primary key default gen_random_uuid(),
  side_dish_id uuid not null references public.side_dishes(id) on delete cascade,
  name         text not null,
  quantity     text not null,
  is_optional  boolean default false,
  substitution text
);

-- ── cook_sessions ──────────────────────────────────────────────
create table if not exists public.cook_sessions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              text not null references public.users(id) on delete cascade,
  side_dish_id         uuid not null references public.side_dishes(id),
  main_dish_input      text,
  input_mode           text not null,
  status               text not null,
  completion_photo_url text,
  personal_note        text,
  rating               integer,
  started_at           timestamp default now(),
  completed_at         timestamp
);

-- ── saved_recipes ──────────────────────────────────────────────
create table if not exists public.saved_recipes (
  id           uuid primary key default gen_random_uuid(),
  user_id      text not null references public.users(id) on delete cascade,
  side_dish_id uuid not null references public.side_dishes(id),
  saved_at     timestamp default now()
);

-- ── quiz_responses ─────────────────────────────────────────────
create table if not exists public.quiz_responses (
  id           uuid primary key default gen_random_uuid(),
  user_id      text not null references public.users(id) on delete cascade,
  question_key text not null,
  answer       text not null,
  answered_at  timestamp default now()
);

-- ── parent_profile ─────────────────────────────────────────────
create table if not exists public.parent_profile (
  id                uuid primary key default gen_random_uuid(),
  user_id           text not null unique references public.users(id) on delete cascade,
  enabled           boolean not null default false,
  age_band          text not null default '4-8',
  spice_tolerance   integer not null default 3,
  flagged_allergens jsonb default '[]'::jsonb,
  enabled_at        timestamp,
  updated_at        timestamp default now()
);

-- ── kid_friendliness_label ─────────────────────────────────────
create table if not exists public.kid_friendliness_label (
  id                   uuid primary key default gen_random_uuid(),
  recipe_slug          text not null unique,
  bitter_load          integer not null,
  smell_intensity      integer not null,
  texture_risk         integer not null,
  visible_green_flecks boolean not null,
  deconstructable      boolean not null,
  heat_level           integer not null,
  familiarity_anchor   boolean not null,
  color_brightness     integer not null,
  parent_mode_eligible boolean not null,
  rubric_note          text,
  created_at           timestamp default now(),
  updated_at           timestamp default now()
);

-- ── kids_ate_it_log ────────────────────────────────────────────
create table if not exists public.kids_ate_it_log (
  id              uuid primary key default gen_random_uuid(),
  cook_session_id text not null,
  user_id         text references public.users(id) on delete set null,
  recipe_slug     text not null,
  verdict         text not null,
  logged_at       timestamp default now()
);

-- ── recipe_overlay ─────────────────────────────────────────────
create table if not exists public.recipe_overlay (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null references public.users(id) on delete cascade,
  recipe_slug text not null,
  step_index  integer not null,
  note        text not null,
  updated_at  timestamp default now()
);

-- ════════════════════ Y2 tables ════════════════════════════════

create table if not exists public.user_recipes (
  id                  text primary key,
  owner_id            text not null references public.users(id) on delete cascade,
  schema_version      integer not null default 1,
  slug                text not null,
  title               text not null,
  dish_name           text not null,
  cuisine_family      text not null,
  flavor_profile      jsonb not null,
  dietary_flags       jsonb not null,
  temperature         text not null,
  skill_level         text not null,
  prep_time_minutes   integer not null,
  cook_time_minutes   integer not null,
  serves              integer not null,
  hero_image_url      text,
  description         text not null,
  ingredients         jsonb not null,
  steps               jsonb not null,
  source              text not null,
  nourish_approved_at timestamp,
  nourish_approved_by text,
  author_display_name text,
  created_at          timestamp not null default now(),
  updated_at          timestamp not null default now()
);

create table if not exists public.recipe_score_breakdowns (
  id                uuid primary key default gen_random_uuid(),
  session_id        text not null,
  owner_id          text not null references public.users(id) on delete cascade,
  recipe_slug       text not null,
  cuisine_fit       real not null,
  flavor_contrast   real not null,
  nutrition_balance real not null,
  prep_burden       real not null,
  temperature       real not null,
  preference        real not null,
  total_score       real not null,
  attached_at       timestamp not null default now()
);

create table if not exists public.pods (
  id                     text primary key,
  schema_version         integer not null default 1,
  name                   text not null,
  owner_id               text not null references public.users(id) on delete cascade,
  admin_ids              jsonb not null default '[]'::jsonb,
  dietary_flags          jsonb not null default '[]'::jsonb,
  pod_timezone           text,
  reveal_at_hour         integer not null default 21,
  invite_code            text not null unique,
  invite_code_expires_at timestamp,
  paused_this_week       boolean not null default false,
  created_at             timestamp not null default now()
);

create table if not exists public.pod_members (
  id                  text primary key,
  pod_id              text not null references public.pods(id) on delete cascade,
  user_id             text references public.users(id) on delete set null,
  schema_version      integer not null default 1,
  display_name        text not null,
  avatar              text,
  age_band            text not null,
  dietary_flags       jsonb not null default '[]'::jsonb,
  cuisine_preferences jsonb not null default '[]'::jsonb,
  joined_at           timestamp not null default now(),
  vacation_since      timestamp,
  weeks_missed        integer not null default 0
);

create table if not exists public.pod_challenge_weeks (
  id                    uuid primary key default gen_random_uuid(),
  pod_id                text not null references public.pods(id) on delete cascade,
  week_key              text not null,
  recipe_slug           text not null,
  twist                 text,
  started_at            timestamp not null,
  donation_tags_enabled boolean not null default true
);

create table if not exists public.pod_submissions (
  id              text primary key,
  pod_id          text not null references public.pods(id) on delete cascade,
  week_key        text not null,
  member_id       text not null references public.pod_members(id) on delete cascade,
  day_key         text not null,
  submitted_at    timestamp not null default now(),
  photo_uri       text not null,
  self_rating     integer not null,
  caption         text,
  donate_tags     jsonb not null default '[]'::jsonb,
  step_completion real not null,
  aesthetic_score real not null,
  has_step_image  boolean not null default false,
  computed_score  real not null
);

create table if not exists public.notifications (
  id            uuid primary key default gen_random_uuid(),
  owner_id      text not null references public.users(id) on delete cascade,
  kind          text not null,
  scheduled_for timestamp not null,
  payload       jsonb not null,
  status        text not null default 'pending',
  created_at    timestamp not null default now(),
  delivered_at  timestamp
);

-- ════════════════════ Y4 tables (no FK by design) ══════════════

create table if not exists public.meal_plan_slots (
  id           text primary key,
  owner_id     text not null,
  week_key     text not null,
  slot         text not null,
  recipe_slug  text not null,
  source       text not null,
  scheduled_at timestamp not null default now()
);

create table if not exists public.llm_call_entries (
  id             text primary key,
  owner_id       text not null,
  surface        text not null,
  called_at      timestamp not null,
  tokens_billed  integer not null,
  cost_micro_usd bigint not null,
  outcome        text not null
);

create table if not exists public.charity_charge_entries (
  id               text primary key,
  owner_id         text,
  stripe_charge_id text not null unique,
  event_slug       text not null,
  nonprofit_slug   text not null,
  amount_micro_usd bigint not null,
  charged_at       timestamp not null,
  status           text not null
);

-- ════════════════════ Indexes ══════════════════════════════════
create index if not exists idx_side_dish_cuisine        on public.side_dishes(cuisine_family);
create index if not exists idx_cook_step_side_dish      on public.cook_steps(side_dish_id);
create index if not exists idx_ingredient_side_dish     on public.ingredients(side_dish_id);
create index if not exists idx_cook_session_user        on public.cook_sessions(user_id);
create index if not exists idx_cook_session_status      on public.cook_sessions(status);
create index if not exists idx_saved_recipe_user        on public.saved_recipes(user_id);
create index if not exists idx_quiz_response_user       on public.quiz_responses(user_id);
create index if not exists idx_user_recipe_owner        on public.user_recipes(owner_id);
create index if not exists idx_user_recipe_slug         on public.user_recipes(slug);
create index if not exists idx_pod_member_pod           on public.pod_members(pod_id);
create index if not exists idx_pod_submission_pod_week  on public.pod_submissions(pod_id, week_key);
create index if not exists idx_notification_owner       on public.notifications(owner_id, scheduled_for);
create index if not exists meal_plan_slots_owner_week_idx     on public.meal_plan_slots(owner_id, week_key);
create index if not exists llm_call_entries_owner_called_idx  on public.llm_call_entries(owner_id, called_at);
create index if not exists llm_call_entries_surface_idx       on public.llm_call_entries(surface);
create index if not exists charity_charge_entries_event_idx     on public.charity_charge_entries(event_slug);
create index if not exists charity_charge_entries_nonprofit_idx on public.charity_charge_entries(nonprofit_slug);
create index if not exists charity_charge_entries_charged_idx   on public.charity_charge_entries(charged_at);
