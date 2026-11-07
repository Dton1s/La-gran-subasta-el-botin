-- Account foundation for La gran subasta: El botín.
-- Browser clients may read public profile/ranking data, but cannot award currency,
-- grant inventory, or submit match outcomes. Those writes belong to trusted server code.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Capitán'
    check (char_length(display_name) between 3 and 24),
  avatar_id text not null default '🐱'
    check (char_length(avatar_id) between 1 and 120),
  avatar_color text not null default '#ffe477'
    check (avatar_color ~ '^#[0-9A-Fa-f]{6}$'),
  frame_id text not null default 'base'
    check (char_length(frame_id) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant update (display_name, avatar_id, avatar_color, frame_id)
  on public.profiles to authenticated;

drop policy if exists "Public profiles are readable" on public.profiles;
create policy "Public profiles are readable"
  on public.profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "Players update their own profile" on public.profiles;
create policy "Players update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_profile_updated_at();

create or replace function public.handle_new_player()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate_name text;
begin
  candidate_name := nullif(btrim(coalesce(
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(coalesce(new.email, ''), '@', 1),
    'Capitán'
  )), '');

  if candidate_name is null or char_length(candidate_name) < 3 then
    candidate_name := 'Capitán';
  end if;

  insert into public.profiles (id, display_name, avatar_id)
  values (
    new.id,
    left(candidate_name, 24),
    left(coalesce(new.raw_user_meta_data ->> 'avatar_id', '🐱'), 120)
  )
  on conflict (id) do nothing;

  insert into public.player_wallets (user_id, coins, gems)
  values (new.id, 100, 10)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- A private balance: the client can read it but cannot edit or award currency.
create table if not exists public.player_wallets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  coins bigint not null default 100 check (coins >= 0),
  gems bigint not null default 10 check (gems >= 0),
  updated_at timestamptz not null default now()
);

alter table public.player_wallets enable row level security;
revoke all on public.player_wallets from anon, authenticated;
grant select on public.player_wallets to authenticated;

drop policy if exists "Players read their own wallet" on public.player_wallets;
create policy "Players read their own wallet"
  on public.player_wallets for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Purchases are recorded by trusted server functions only. Client-side writes are denied.
create table if not exists public.player_inventory (
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id text not null check (char_length(item_id) between 1 and 120),
  acquired_at timestamptz not null default now(),
  source text not null default 'purchase'
    check (source in ('purchase', 'reward', 'starter', 'chest')),
  primary key (user_id, item_id)
);

alter table public.player_inventory enable row level security;
revoke all on public.player_inventory from anon, authenticated;
grant select on public.player_inventory to authenticated;

drop policy if exists "Players read their own inventory" on public.player_inventory;
create policy "Players read their own inventory"
  on public.player_inventory for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Server-owned match results are private per player; public leaderboards will use
-- a separate aggregate table/view so raw match history and email stay private.
create table if not exists public.match_results (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null check (mode in ('classic', 'teams', 'duel')),
  placement smallint not null check (placement > 0),
  score integer not null default 0,
  played_at timestamptz not null default now(),
  unique (match_id, user_id)
);

alter table public.match_results enable row level security;
revoke all on public.match_results from anon, authenticated;
grant select on public.match_results to authenticated;

drop policy if exists "Players read their own match results" on public.match_results;
create policy "Players read their own match results"
  on public.match_results for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Aggregates are safe to expose for rankings; only trusted server code may write them.
create table if not exists public.ranking_totals (
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null check (mode in ('classic', 'teams', 'duel')),
  period text not null check (period in ('weekly', 'monthly', 'total')),
  period_start date not null,
  wins integer not null default 0 check (wins >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, mode, period, period_start)
);

alter table public.ranking_totals enable row level security;
revoke all on public.ranking_totals from anon, authenticated;
grant select on public.ranking_totals to anon, authenticated;

drop policy if exists "Ranking totals are public" on public.ranking_totals;
create policy "Ranking totals are public"
  on public.ranking_totals for select
  to anon, authenticated
  using (true);

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_player();
