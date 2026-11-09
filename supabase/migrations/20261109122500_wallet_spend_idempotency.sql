create or replace function public.spend_wallet_balance(
  p_currency text,
  p_amount bigint,
  p_reason text,
  p_request_id uuid
)
returns table (coins bigint, gems bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_balance bigint;
  v_existing_amount bigint;
  v_existing_reason text;
begin
  if v_user_id is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if p_currency not in ('coins', 'gems') or p_amount is null or p_amount <= 0 or p_amount > 1000000 then
    raise exception 'invalid_wallet_spend' using errcode = '22023';
  end if;
  if p_reason not in ('store_cosmetic', 'store_chat_emote', 'game_entry', 'card_removal', 'chest_skip', 'roulette_extra', 'profile_rename') then
    raise exception 'invalid_wallet_reason' using errcode = '22023';
  end if;
  if p_request_id is null then raise exception 'request_id_required' using errcode = '22023'; end if;

  insert into public.player_wallets (user_id) values (v_user_id) on conflict (user_id) do nothing;
  select case when p_currency = 'coins' then w.coins else w.gems end into v_balance
  from public.player_wallets w where w.user_id = v_user_id for update;

  select t.amount, t.reference_id into v_existing_amount, v_existing_reason
  from public.wallet_transactions t
  where t.user_id = v_user_id and t.request_id = p_request_id and t.currency = p_currency;
  if found then
    if v_existing_amount <> -p_amount or v_existing_reason <> p_reason then
      raise exception 'idempotency_conflict' using errcode = '23505';
    end if;
    return query select w.coins, w.gems from public.player_wallets w where w.user_id = v_user_id;
    return;
  end if;

  if v_balance < p_amount then raise exception 'insufficient_funds' using errcode = 'P0001'; end if;
  if p_currency = 'coins' then
    update public.player_wallets w set coins = w.coins - p_amount, updated_at = now() where w.user_id = v_user_id;
  else
    update public.player_wallets w set gems = w.gems - p_amount, updated_at = now() where w.user_id = v_user_id;
  end if;
  insert into public.wallet_transactions (user_id, currency, amount, source, reference_id, request_id)
  values (v_user_id, p_currency, -p_amount, 'wallet_spend', p_reason, p_request_id);
  return query select w.coins, w.gems from public.player_wallets w where w.user_id = v_user_id;
end;
$$;

revoke all on function public.spend_wallet_balance(text, bigint, text, uuid) from public, anon;
grant execute on function public.spend_wallet_balance(text, bigint, text, uuid) to authenticated;
