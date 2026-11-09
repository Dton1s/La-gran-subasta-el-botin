-- Keep AI and online play on the same authenticated Supabase wallet.
-- Positive gameplay earnings are deliberately rate-limited; paid currency must
-- continue to be credited only by the verified Xsolla webhook.

alter table public.wallet_transactions
  drop constraint if exists wallet_transactions_source_check;
alter table public.wallet_transactions
  add constraint wallet_transactions_source_check
  check (source = any (array['xsolla_purchase'::text, 'wallet_spend'::text, 'game_reward'::text]));

create or replace function private.apply_game_wallet_delta_impl(
  p_coins_delta bigint,
  p_gems_delta bigint,
  p_request_id uuid
)
returns table (coins bigint, gems bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_coin_delta bigint := coalesce(p_coins_delta, 0);
  v_gem_delta bigint := coalesce(p_gems_delta, 0);
  v_balance bigint;
  v_existing_amount bigint;
  v_existing_reference text;
  v_today_earned bigint;
  v_reference text;
begin
  if v_user_id is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if p_request_id is null or (v_coin_delta = 0 and v_gem_delta = 0) then
    raise exception 'invalid_wallet_delta' using errcode = '22023';
  end if;
  if v_coin_delta > 1000 or v_coin_delta < -1000000 or v_gem_delta > 100 or v_gem_delta < -1000000 then
    raise exception 'wallet_delta_out_of_range' using errcode = '22023';
  end if;

  insert into public.player_wallets(user_id) values (v_user_id) on conflict (user_id) do nothing;
  select w.coins, w.gems into coins, gems
    from public.player_wallets w where w.user_id = v_user_id for update;

  foreach v_reference in array array['coins', 'gems'] loop
    if v_reference = 'coins' then
      v_balance := coins;
      v_existing_amount := null;
      v_existing_reference := null;
      select t.amount, t.reference_id into v_existing_amount, v_existing_reference
        from public.wallet_transactions t
        where t.user_id = v_user_id and t.request_id = p_request_id and t.currency = 'coins';
      if found then
        if v_existing_amount <> v_coin_delta or v_existing_reference <> 'gameplay:' || p_request_id::text then
          raise exception 'idempotency_conflict' using errcode = '23505';
        end if;
        continue;
      end if;
      if v_coin_delta = 0 then continue; end if;
      if v_coin_delta > 0 then
        select coalesce(sum(t.amount), 0) into v_today_earned
          from public.wallet_transactions t
          where t.user_id = v_user_id and t.currency = 'coins' and t.source = 'game_reward'
            and t.created_at >= (pg_catalog.date_trunc('day', pg_catalog.now() at time zone 'UTC') at time zone 'UTC');
        if v_today_earned + v_coin_delta > 2500 then raise exception 'daily_coin_earning_limit' using errcode = 'P0001'; end if;
      elsif v_balance < -v_coin_delta then
        raise exception 'insufficient_funds' using errcode = 'P0001';
      end if;
      update public.player_wallets w set coins = w.coins + v_coin_delta, updated_at = pg_catalog.now() where w.user_id = v_user_id;
      insert into public.wallet_transactions(user_id, currency, amount, source, reference_id, request_id)
        values (v_user_id, 'coins', v_coin_delta, case when v_coin_delta > 0 then 'game_reward' else 'wallet_spend' end, 'gameplay:' || p_request_id::text, p_request_id);
    else
      v_balance := gems;
      v_existing_amount := null;
      v_existing_reference := null;
      select t.amount, t.reference_id into v_existing_amount, v_existing_reference
        from public.wallet_transactions t
        where t.user_id = v_user_id and t.request_id = p_request_id and t.currency = 'gems';
      if found then
        if v_existing_amount <> v_gem_delta or v_existing_reference <> 'gameplay:' || p_request_id::text then
          raise exception 'idempotency_conflict' using errcode = '23505';
        end if;
        continue;
      end if;
      if v_gem_delta = 0 then continue; end if;
      if v_gem_delta > 0 then
        select coalesce(sum(t.amount), 0) into v_today_earned
          from public.wallet_transactions t
          where t.user_id = v_user_id and t.currency = 'gems' and t.source = 'game_reward'
            and t.created_at >= (pg_catalog.date_trunc('day', pg_catalog.now() at time zone 'UTC') at time zone 'UTC');
        if v_today_earned + v_gem_delta > 100 then raise exception 'daily_gem_earning_limit' using errcode = 'P0001'; end if;
      elsif v_balance < -v_gem_delta then
        raise exception 'insufficient_funds' using errcode = 'P0001';
      end if;
      update public.player_wallets w set gems = w.gems + v_gem_delta, updated_at = pg_catalog.now() where w.user_id = v_user_id;
      insert into public.wallet_transactions(user_id, currency, amount, source, reference_id, request_id)
        values (v_user_id, 'gems', v_gem_delta, case when v_gem_delta > 0 then 'game_reward' else 'wallet_spend' end, 'gameplay:' || p_request_id::text, p_request_id);
    end if;
  end loop;

  return query select w.coins, w.gems from public.player_wallets w where w.user_id = v_user_id;
end;
$$;

revoke all on function private.apply_game_wallet_delta_impl(bigint, bigint, uuid) from public, anon;
grant execute on function private.apply_game_wallet_delta_impl(bigint, bigint, uuid) to authenticated;

create or replace function public.apply_game_wallet_delta(
  p_coins_delta bigint,
  p_gems_delta bigint,
  p_request_id uuid
)
returns table (coins bigint, gems bigint)
language sql
security invoker
set search_path = ''
as $$
  select * from private.apply_game_wallet_delta_impl(p_coins_delta, p_gems_delta, p_request_id);
$$;

revoke all on function public.apply_game_wallet_delta(bigint, bigint, uuid) from public, anon;
grant execute on function public.apply_game_wallet_delta(bigint, bigint, uuid) to authenticated;
