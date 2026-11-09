-- Hide trusted SECURITY DEFINER implementations from PostgREST. Public RPCs remain
-- SECURITY INVOKER shims and are the only API surface for signed-in clients.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

-- Preserve the established, authorization-checked implementations while moving
-- them out of exposed schemas.
alter function public.check_username_available(text) set schema private;
alter function private.check_username_available(text) rename to check_username_available_impl;
alter function public.claim_username(text) set schema private;
alter function private.claim_username(text) rename to claim_username_impl;
alter function public.send_friend_request(uuid) set schema private;
alter function private.send_friend_request(uuid) rename to send_friend_request_impl;
alter function public.is_game_party_member(uuid) set schema private;
alter function private.is_game_party_member(uuid) rename to is_game_party_member_impl;
alter function public.create_game_party() set schema private;
alter function private.create_game_party() rename to create_game_party_impl;
alter function public.invite_to_game_party(uuid, uuid) set schema private;
alter function private.invite_to_game_party(uuid, uuid) rename to invite_to_game_party_impl;
alter function public.respond_to_game_party_invite(uuid, boolean) set schema private;
alter function private.respond_to_game_party_invite(uuid, boolean) rename to respond_to_game_party_invite_impl;
alter function public.spend_wallet_balance(text, bigint, text, uuid) set schema private;
alter function private.spend_wallet_balance(text, bigint, text, uuid) rename to spend_wallet_balance_impl;

-- The username is protected by this server function; profile UPDATE permissions
-- cannot be used to bypass its cooldown or wallet debit.
alter table public.profiles add column if not exists username_changed_at timestamptz;
update public.profiles set username_changed_at = pg_catalog.now()
where username is not null and username_changed_at is null;
revoke update (username) on public.profiles from authenticated;

create or replace function private.claim_username_impl(requested_username text)
returns text language plpgsql security definer set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text := btrim(coalesce(requested_username, ''));
  v_old_name text;
  v_changed_at timestamptz;
  v_gems bigint;
begin
  if v_user_id is null then return 'unauthorized'; end if;
  if v_name !~ '^[A-Za-z0-9]{5,16}$' then return 'invalid'; end if;
  select p.username, p.username_changed_at into v_old_name, v_changed_at
    from public.profiles p where p.id = v_user_id for update;
  if not found then return 'missing_profile'; end if;
  if v_old_name = v_name then return 'ok'; end if;

  -- Initial account naming is free. Later renames cost 250 secure gems, once per 30 days.
  if v_old_name is not null then
    if v_changed_at is not null and v_changed_at > pg_catalog.now() - interval '30 days' then
      return 'cooldown';
    end if;
    insert into public.player_wallets (user_id) values (v_user_id) on conflict (user_id) do nothing;
    select w.gems into v_gems from public.player_wallets w where w.user_id = v_user_id for update;
    if v_gems < 250 then return 'insufficient_gems'; end if;
    update public.player_wallets w set gems = w.gems - 250, updated_at = pg_catalog.now()
      where w.user_id = v_user_id;
    insert into public.wallet_transactions (user_id, currency, amount, source, reference_id, request_id)
      values (v_user_id, 'gems', -250, 'wallet_spend', 'profile_rename', pg_catalog.gen_random_uuid());
    v_changed_at := pg_catalog.now();
  else
    v_changed_at := null;
  end if;
  update public.profiles p set username = v_name, display_name = v_name, username_changed_at = v_changed_at
    where p.id = v_user_id;
  return 'ok';
exception when unique_violation then return 'taken';
end;
$$;
revoke all on function private.claim_username_impl(text) from public, anon;
grant execute on function private.claim_username_impl(text) to authenticated;

-- Also reject NULL currency/reason explicitly; SQL's three-valued logic must not
-- allow a NULL currency to fall through as a gem debit.
create or replace function private.spend_wallet_balance_impl(
  p_currency text, p_amount bigint, p_reason text, p_request_id uuid
)
returns table (coins bigint, gems bigint)
language plpgsql security definer set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_balance bigint;
  v_existing_amount bigint;
  v_existing_reason text;
begin
  if v_user_id is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if p_currency is null or p_currency not in ('coins', 'gems')
    or p_amount is null or p_amount <= 0 or p_amount > 1000000 then
    raise exception 'invalid_wallet_spend' using errcode = '22023';
  end if;
  if p_reason is null or p_reason not in ('store_cosmetic', 'store_chat_emote', 'game_entry', 'card_removal', 'chest_skip', 'roulette_extra', 'profile_rename') then
    raise exception 'invalid_wallet_reason' using errcode = '22023';
  end if;
  if p_request_id is null then raise exception 'request_id_required' using errcode = '22023'; end if;

  insert into public.player_wallets(user_id) values (v_user_id) on conflict (user_id) do nothing;
  select case when p_currency = 'coins' then w.coins else w.gems end into v_balance
    from public.player_wallets w where w.user_id = v_user_id for update;
  select t.amount, t.reference_id into v_existing_amount, v_existing_reason
    from public.wallet_transactions t where t.user_id = v_user_id
      and t.request_id = p_request_id and t.currency = p_currency;
  if found then
    if v_existing_amount <> -p_amount or v_existing_reason <> p_reason then
      raise exception 'idempotency_conflict' using errcode = '23505';
    end if;
    return query select w.coins, w.gems from public.player_wallets w where w.user_id = v_user_id;
    return;
  end if;
  if v_balance < p_amount then raise exception 'insufficient_funds' using errcode = 'P0001'; end if;
  if p_currency = 'coins' then
    update public.player_wallets w set coins = w.coins - p_amount, updated_at = pg_catalog.now() where w.user_id = v_user_id;
  else
    update public.player_wallets w set gems = w.gems - p_amount, updated_at = pg_catalog.now() where w.user_id = v_user_id;
  end if;
  insert into public.wallet_transactions(user_id, currency, amount, source, reference_id, request_id)
    values (v_user_id, p_currency, -p_amount, 'wallet_spend', p_reason, p_request_id);
  return query select w.coins, w.gems from public.player_wallets w where w.user_id = v_user_id;
end;
$$;
revoke all on function private.spend_wallet_balance_impl(text, bigint, text, uuid) from public, anon;
grant execute on function private.spend_wallet_balance_impl(text, bigint, text, uuid) to authenticated;

-- Only invoker wrappers are exposed through PostgREST.
create or replace function public.check_username_available(requested_username text)
returns boolean language sql stable security invoker set search_path = ''
as $$ select private.check_username_available_impl(requested_username); $$;
create or replace function public.claim_username(requested_username text)
returns text language sql security invoker set search_path = ''
as $$ select private.claim_username_impl(requested_username); $$;
create or replace function public.send_friend_request(target_user uuid)
returns text language sql security invoker set search_path = ''
as $$ select private.send_friend_request_impl(target_user); $$;
create or replace function public.is_game_party_member(target_party uuid)
returns boolean language sql stable security invoker set search_path = ''
as $$ select private.is_game_party_member_impl(target_party); $$;
create or replace function public.create_game_party()
returns uuid language sql security invoker set search_path = ''
as $$ select private.create_game_party_impl(); $$;
create or replace function public.invite_to_game_party(target_party uuid, target_user uuid)
returns uuid language sql security invoker set search_path = ''
as $$ select private.invite_to_game_party_impl(target_party, target_user); $$;
create or replace function public.respond_to_game_party_invite(invite_id uuid, accept_invite boolean)
returns uuid language sql security invoker set search_path = ''
as $$ select private.respond_to_game_party_invite_impl(invite_id, accept_invite); $$;
create or replace function public.spend_wallet_balance(
  p_currency text, p_amount bigint, p_reason text, p_request_id uuid
)
returns table (coins bigint, gems bigint)
language sql security invoker set search_path = ''
as $$ select * from private.spend_wallet_balance_impl(p_currency, p_amount, p_reason, p_request_id); $$;

revoke all on function public.check_username_available(text) from public, anon;
revoke all on function public.claim_username(text) from public, anon;
revoke all on function public.send_friend_request(uuid) from public, anon;
revoke all on function public.is_game_party_member(uuid) from public, anon;
revoke all on function public.create_game_party() from public, anon;
revoke all on function public.invite_to_game_party(uuid, uuid) from public, anon;
revoke all on function public.respond_to_game_party_invite(uuid, boolean) from public, anon;
revoke all on function public.spend_wallet_balance(text, bigint, text, uuid) from public, anon;
grant execute on function public.check_username_available(text) to authenticated;
grant execute on function public.claim_username(text) to authenticated;
grant execute on function public.send_friend_request(uuid) to authenticated;
grant execute on function public.is_game_party_member(uuid) to authenticated;
grant execute on function public.create_game_party() to authenticated;
grant execute on function public.invite_to_game_party(uuid, uuid) to authenticated;
grant execute on function public.respond_to_game_party_invite(uuid, boolean) to authenticated;
grant execute on function public.spend_wallet_balance(text, bigint, text, uuid) to authenticated;

-- Rebind party RLS to the public invoker wrapper rather than the moved function OID.
drop policy if exists "Party members can view their party" on public.game_parties;
create policy "Party members can view their party" on public.game_parties
  for select to authenticated using (public.is_game_party_member(id));
drop policy if exists "Party members can view their roster" on public.game_party_members;
create policy "Party members can view their roster" on public.game_party_members
  for select to authenticated using (public.is_game_party_member(party_id));
