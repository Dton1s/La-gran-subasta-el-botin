-- Let an authenticated player re-check their own username after a refreshed
-- session without treating it as occupied by somebody else.
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
  return not exists (
    select 1
    from public.profiles p
    where lower(p.username) = normalized
      and p.id is distinct from auth.uid()
  );
end;
$$;
revoke all on function public.check_username_available(text) from public, anon;
grant execute on function public.check_username_available(text) to authenticated;

-- Claiming an unchanged username is idempotent. The unique index still
-- prevents a player from taking another account's username.
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

  update public.profiles
    set username = normalized, display_name = normalized
    where id = auth.uid();
  if not found then return 'missing_profile'; end if;
  return 'ok';
exception when unique_violation then
  return 'taken';
end;
$$;
revoke all on function public.claim_username(text) from public, anon;
grant execute on function public.claim_username(text) to authenticated;
