-- Usernames, friend graph, party invitations, and Realtime matchmaking support.
-- Run after 20261107000000_auth_profiles.sql.

alter table public.profiles add column if not exists username text;
create unique index if not exists profiles_username_lower_unique
  on public.profiles (lower(username)) where username is not null;
alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles add constraint profiles_username_format
  check (username is null or username ~ '^[A-Za-z0-9]{5,16}$');
grant update (username) on public.profiles to authenticated;

create or replace function public.check_username_available(requested_username text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized text := lower(btrim(coalesce(requested_username, '')));
begin
  if normalized !~ '^[a-z0-9]{5,16}$' then return false; end if;
  return not exists (select 1 from public.profiles p where lower(p.username) = normalized);
end;
$$;
revoke all on function public.check_username_available(text) from public, anon;
grant execute on function public.check_username_available(text) to authenticated;

create or replace function public.claim_username(requested_username text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized text := btrim(coalesce(requested_username, ''));
begin
  if auth.uid() is null then return 'unauthorized'; end if;
  if normalized !~ '^[A-Za-z0-9]{5,16}$' then return 'invalid'; end if;
  update public.profiles set username = normalized, display_name = normalized
    where id = auth.uid();
  if not found then return 'missing_profile'; end if;
  return 'ok';
exception when unique_violation then
  return 'taken';
end;
$$;
revoke all on function public.claim_username(text) from public, anon;
grant execute on function public.claim_username(text) to authenticated;

create table if not exists public.game_friendships (
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  primary key (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);
create unique index if not exists game_friendships_pair_unique
  on public.game_friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
alter table public.game_friendships enable row level security;
revoke all on public.game_friendships from anon, authenticated;
grant select, delete on public.game_friendships to authenticated;
grant update (status) on public.game_friendships to authenticated;
drop policy if exists "Players read their friendship edges" on public.game_friendships;
create policy "Players read their friendship edges" on public.game_friendships
  for select to authenticated using (auth.uid() in (requester_id, addressee_id));
drop policy if exists "Friend request recipient accepts" on public.game_friendships;
create policy "Friend request recipient accepts" on public.game_friendships
  for update to authenticated using (auth.uid() = addressee_id and status = 'pending')
  with check (auth.uid() = addressee_id and status = 'accepted');
drop policy if exists "Either player removes friendship" on public.game_friendships;
create policy "Either player removes friendship" on public.game_friendships
  for delete to authenticated using (auth.uid() in (requester_id, addressee_id));

create or replace function public.send_friend_request(target_user uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then return 'unauthorized'; end if;
  if target_user is null or target_user = auth.uid() then return 'invalid'; end if;
  if not exists (select 1 from public.profiles where id = target_user and username is not null) then return 'not_found'; end if;
  if exists (select 1 from public.game_friendships f where
    (f.requester_id = auth.uid() and f.addressee_id = target_user) or
    (f.requester_id = target_user and f.addressee_id = auth.uid())) then return 'exists'; end if;
  insert into public.game_friendships(requester_id, addressee_id, status)
    values (auth.uid(), target_user, 'pending');
  return 'sent';
exception when unique_violation then
  return 'exists';
end;
$$;
revoke all on function public.send_friend_request(uuid) from public, anon;
grant execute on function public.send_friend_request(uuid) to authenticated;

create table if not exists public.game_parties (
  id uuid primary key default gen_random_uuid(),
  captain_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'queued', 'playing')),
  created_at timestamptz not null default now()
);
create table if not exists public.game_party_members (
  party_id uuid not null references public.game_parties(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (party_id, user_id),
  unique (user_id)
);
create table if not exists public.game_party_invites (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.game_parties(id) on delete cascade,
  inviter_id uuid not null references auth.users(id) on delete cascade,
  invitee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  check (inviter_id <> invitee_id)
);

-- Security-definer helper avoids a recursive RLS lookup when checking party membership.
create or replace function public.is_game_party_member(target_party uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.game_party_members m
    where m.party_id = target_party and m.user_id = auth.uid()
  );
$$;
revoke all on function public.is_game_party_member(uuid) from public, anon;
grant execute on function public.is_game_party_member(uuid) to authenticated;

alter table public.game_parties enable row level security;
alter table public.game_party_members enable row level security;
alter table public.game_party_invites enable row level security;
revoke all on public.game_parties, public.game_party_members, public.game_party_invites from anon, authenticated;
grant select on public.game_parties, public.game_party_members, public.game_party_invites to authenticated;
grant update (status) on public.game_party_invites to authenticated;
drop policy if exists "Party members can view their party" on public.game_parties;
create policy "Party members can view their party" on public.game_parties
  for select to authenticated using (public.is_game_party_member(id));
drop policy if exists "Party members can view their roster" on public.game_party_members;
create policy "Party members can view their roster" on public.game_party_members
  for select to authenticated using (public.is_game_party_member(party_id));
drop policy if exists "Party invite participants can view invites" on public.game_party_invites;
create policy "Party invite participants can view invites" on public.game_party_invites
  for select to authenticated using (auth.uid() in (inviter_id, invitee_id));
drop policy if exists "Invitee responds to party invite" on public.game_party_invites;
create policy "Invitee responds to party invite" on public.game_party_invites
  for update to authenticated using (auth.uid() = invitee_id and status = 'pending')
  with check (auth.uid() = invitee_id and status in ('accepted', 'declined'));

create or replace function public.create_game_party()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare new_party uuid;
begin
  if auth.uid() is null then raise exception 'Debes iniciar sesión.'; end if;
  delete from public.game_party_members where user_id = auth.uid();
  insert into public.game_parties(captain_id) values (auth.uid()) returning id into new_party;
  insert into public.game_party_members(party_id, user_id) values (new_party, auth.uid());
  return new_party;
end;
$$;
revoke all on function public.create_game_party() from public, anon;
grant execute on function public.create_game_party() to authenticated;

create or replace function public.invite_to_game_party(target_party uuid, target_user uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare invitation uuid;
begin
  if auth.uid() is null then raise exception 'Debes iniciar sesión.'; end if;
  if not exists(select 1 from public.game_party_members where party_id = target_party and user_id = auth.uid()) then raise exception 'No perteneces a este grupo.'; end if;
  if (select count(*) from public.game_party_members where party_id = target_party) >= 2 then raise exception 'El grupo ya está completo.'; end if;
  if not exists(select 1 from public.game_friendships where status = 'accepted' and ((requester_id = auth.uid() and addressee_id = target_user) or (requester_id = target_user and addressee_id = auth.uid()))) then raise exception 'Solo puedes invitar a tus amigos.'; end if;
  insert into public.game_party_invites(party_id, inviter_id, invitee_id)
    values (target_party, auth.uid(), target_user) returning id into invitation;
  return invitation;
end;
$$;
revoke all on function public.invite_to_game_party(uuid, uuid) from public, anon;
grant execute on function public.invite_to_game_party(uuid, uuid) to authenticated;

create or replace function public.respond_to_game_party_invite(invite_id uuid, accept_invite boolean)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare invitation public.game_party_invites%rowtype;
begin
  if auth.uid() is null then raise exception 'Debes iniciar sesión.'; end if;
  select * into invitation from public.game_party_invites where id = invite_id and invitee_id = auth.uid() and status = 'pending' for update;
  if not found then raise exception 'La invitación ya no está disponible.'; end if;
  if not accept_invite then
    update public.game_party_invites set status = 'declined' where id = invite_id;
    return null;
  end if;
  if (select count(*) from public.game_party_members where party_id = invitation.party_id) >= 2 then raise exception 'El grupo ya está completo.'; end if;
  delete from public.game_party_members where user_id = auth.uid();
  insert into public.game_party_members(party_id, user_id) values (invitation.party_id, auth.uid());
  update public.game_party_invites set status = 'accepted' where id = invite_id;
  return invitation.party_id;
end;
$$;
revoke all on function public.respond_to_game_party_invite(uuid, boolean) from public, anon;
grant execute on function public.respond_to_game_party_invite(uuid, boolean) to authenticated;
