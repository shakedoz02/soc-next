-- ============================================================
-- SOC-Next — Supabase Schema
-- הדבק את כל הקוד הזה ב-SQL Editor של Supabase והרץ
-- ============================================================

-- -------------------------------------------------------
-- 1. PROFILES — פרופיל משתמש (מורחב מ-auth.users)
-- -------------------------------------------------------
create table public.profiles (
  id             uuid        primary key references auth.users on delete cascade,
  email          text        not null,
  name           text        not null default 'אנליסט חדש',
  level          integer     not null default 1,
  xp             integer     not null default 0,
  xp_to_next     integer     not null default 1000,
  rank           text        not null default 'Junior Analyst',
  sessions_completed integer not null default 0,
  accuracy       numeric(5,2) not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- -------------------------------------------------------
-- 2. INVESTIGATIONS — היסטוריית חקירות
-- -------------------------------------------------------
create table public.investigations (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references public.profiles on delete cascade,
  scenario_id    text        not null,
  scenario_title text        not null default '',
  score          integer     not null,
  xp_earned      integer     not null,
  elapsed_seconds integer    not null,
  mistakes       integer     not null default 0,
  commands       jsonb       not null default '[]',
  completed_at   timestamptz not null default now()
);

-- -------------------------------------------------------
-- 3. ROW-LEVEL SECURITY
-- -------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.investigations enable row level security;

-- Profiles: כל משתמש רואה ומעדכן רק את הפרופיל שלו
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Investigations: כל משתמש רואה ומוסיף רק את החקירות שלו
create policy "investigations_select_own"
  on public.investigations for select
  using (auth.uid() = user_id);

create policy "investigations_insert_own"
  on public.investigations for insert
  with check (auth.uid() = user_id);

-- -------------------------------------------------------
-- 4. FUNCTIONS & TRIGGERS
-- -------------------------------------------------------

-- יצירת פרופיל אוטומטית כשמשתמש נרשם
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', 'אנליסט חדש')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- עדכון updated_at אוטומטי
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- -------------------------------------------------------
-- 5. HELPER FUNCTION — חישוב רמה לפי XP
-- -------------------------------------------------------
create or replace function public.compute_level(xp_val integer)
returns table(level integer, xp_to_next integer, rank text)
language plpgsql
as $$
declare
  thresholds integer[] := array[0, 1000, 2500, 5000, 9000, 15000, 23000, 35000, 50000, 70000];
  lvl integer := 1;
  i integer;
begin
  for i in 1..array_length(thresholds, 1) loop
    if xp_val >= thresholds[i] then
      lvl := i;
    end if;
  end loop;

  return query select
    lvl,
    case
      when lvl < array_length(thresholds, 1) then thresholds[lvl + 1]
      else thresholds[array_length(thresholds, 1)] * 2
    end,
    case
      when lvl >= 9 then 'Elite Analyst'
      when lvl >= 7 then 'Lead Analyst'
      when lvl >= 5 then 'Senior Analyst'
      when lvl >= 3 then 'Analyst'
      else 'Junior Analyst'
    end;
end;
$$;

-- -------------------------------------------------------
-- 6. SECURE XP-UPDATE FUNCTION (מניעת זיוף XP מצד לקוח)
-- -------------------------------------------------------
create or replace function public.add_xp_and_save_investigation(
  p_user_id        uuid,
  p_xp_to_add      integer,
  p_scenario_id    text,
  p_scenario_title text,
  p_score          integer,
  p_elapsed        integer,
  p_mistakes       integer,
  p_commands       jsonb
)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  current_xp   integer;
  new_xp       integer;
  new_level    integer;
  new_xp_next  integer;
  new_rank     text;
  new_sessions integer;
  new_accuracy numeric(5,2);
  inv_id       uuid;
begin
  -- Validate caller
  if auth.uid() != p_user_id then
    raise exception 'Unauthorized';
  end if;

  -- Fetch current stats
  select xp, sessions_completed, accuracy
  into current_xp, new_sessions, new_accuracy
  from public.profiles
  where id = p_user_id;

  new_xp := current_xp + p_xp_to_add;

  -- Compute new level/rank
  select cl.level, cl.xp_to_next, cl.rank
  into new_level, new_xp_next, new_rank
  from public.compute_level(new_xp) cl;

  new_sessions := new_sessions + 1;

  -- Recalculate accuracy as rolling average
  new_accuracy := ((new_accuracy * (new_sessions - 1)) + p_score) / new_sessions;

  -- Update profile
  update public.profiles set
    xp                 = new_xp,
    level              = new_level,
    xp_to_next         = new_xp_next,
    rank               = new_rank,
    sessions_completed = new_sessions,
    accuracy           = new_accuracy
  where id = p_user_id;

  -- Save investigation record
  insert into public.investigations
    (user_id, scenario_id, scenario_title, score, xp_earned, elapsed_seconds, mistakes, commands)
  values
    (p_user_id, p_scenario_id, p_scenario_title, p_score, p_xp_to_add, p_elapsed, p_mistakes, p_commands)
  returning id into inv_id;

  return json_build_object(
    'xp',                new_xp,
    'level',             new_level,
    'xp_to_next',        new_xp_next,
    'rank',              new_rank,
    'sessions_completed', new_sessions,
    'accuracy',          new_accuracy,
    'investigation_id',  inv_id
  );
end;
$$;

grant execute on function public.compute_level(integer)                   to authenticated;
grant execute on function public.add_xp_and_save_investigation(uuid, integer, text, text, integer, integer, integer, jsonb) to authenticated;

-- -------------------------------------------------------
-- 7. STORAGE BUCKET (אופציונלי — לדוחות PDF)
-- -------------------------------------------------------
-- insert into storage.buckets (id, name, public) values ('reports', 'reports', false);

-- create policy "Users upload own reports"
--   on storage.objects for insert
--   with check (bucket_id = 'reports' and auth.uid()::text = (storage.foldername(name))[1]);

-- create policy "Users view own reports"
--   on storage.objects for select
--   using (bucket_id = 'reports' and auth.uid()::text = (storage.foldername(name))[1]);

-- -------------------------------------------------------
-- 8. INDEXES לביצועים
-- -------------------------------------------------------
create index investigations_user_id_idx on public.investigations(user_id);
create index investigations_completed_at_idx on public.investigations(completed_at desc);
create index profiles_xp_idx on public.profiles(xp desc);

-- -------------------------------------------------------
-- סיום — כל מה שצריך כדי להפעיל את SOC-Next עם Supabase
-- -------------------------------------------------------
