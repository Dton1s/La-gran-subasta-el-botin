-- Client wallet mutations may spend only. Positive balances are granted only by
-- service-side settlement, mission, roulette, chest, or verified purchase code.
revoke all on function private.apply_game_wallet_delta_impl(bigint,bigint,uuid) from public,anon,authenticated;
grant execute on function private.apply_game_wallet_delta_impl(bigint,bigint,uuid) to service_role;

create or replace function public.apply_game_wallet_delta(
  p_coins_delta bigint,
  p_gems_delta bigint,
  p_request_id uuid
)
returns table(coins bigint,gems bigint)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated' using errcode='28000'; end if;
  if coalesce(p_coins_delta,0)>0 or coalesce(p_gems_delta,0)>0 then
    raise exception 'positive_wallet_deltas_are_server_only' using errcode='42501';
  end if;
  return query select * from private.apply_game_wallet_delta_impl(p_coins_delta,p_gems_delta,p_request_id);
end;
$$;
revoke all on function public.apply_game_wallet_delta(bigint,bigint,uuid) from public,anon;
grant execute on function public.apply_game_wallet_delta(bigint,bigint,uuid) to authenticated;

-- The former online settlement trusted matching client scoreboards. The edge
-- engine now computes and settles the result; this RPC must not remain callable.
revoke all on function public.report_online_match_result(uuid,jsonb) from public,anon,authenticated;

