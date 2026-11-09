create or replace function public.server_finalize_offline_match(p_match_id uuid,p_final_state jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid:=nullif(p_final_state->>'requester_id','')::uuid;
  v_session public.game_match_sessions%rowtype;
  v_score integer;
  v_won boolean;
  v_now timestamptz:=pg_catalog.now();
  v_week date;
  v_month date;
  v_wallet record;
  v_reward integer:=5;
begin
  select * into v_session from public.game_match_sessions where id=p_match_id and not is_online for update;
  if not found or v_user is null or not (v_user=any(v_session.participant_ids)) then raise exception 'invalid_offline_match' using errcode='42501'; end if;
  if v_session.status='completed' then
    select coins,gems into v_wallet from public.player_wallets where user_id=v_user;
    return jsonb_build_object('status','completed','coins',v_wallet.coins,'gems',v_wallet.gems,'reward_coins',coalesce((select amount from public.wallet_transactions where user_id=v_user and reference_id='offline_match:'||p_match_id::text and currency='coins'),0),'winner_ids',coalesce(v_session.server_state->'winner_ids','[]'::jsonb),'scores',v_session.server_state->'scores');
  end if;
  if v_session.status<>'active' or jsonb_typeof(p_final_state->'scores')<>'object' or jsonb_typeof(p_final_state->'winner_ids')<>'array' then raise exception 'invalid_offline_match_state' using errcode='P0001'; end if;
  if p_final_state->>'matchId'<>p_match_id::text or (p_final_state->>'phase')<>'completed_pending' then raise exception 'invalid_offline_match_state' using errcode='22023'; end if;
  if not (p_final_state->'scores' ? v_user::text) then raise exception 'invalid_offline_score' using errcode='22023'; end if;
  v_score:=(p_final_state->'scores'->>v_user::text)::integer;
  if v_score<0 or v_score>2000 then raise exception 'invalid_offline_score' using errcode='22023'; end if;
  v_won:=(p_final_state->'winner_ids') @> pg_catalog.jsonb_build_array(v_user::text);
  update public.game_match_sessions set status='completed',completed_at=v_now,
    final_scores=pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object('id',v_user,'score',v_score)),
    server_state=p_final_state||pg_catalog.jsonb_build_object('phase','completed') where id=p_match_id;
  update public.player_wallets set coins=coins+v_reward,updated_at=v_now where user_id=v_user;
  insert into public.wallet_transactions(user_id,currency,amount,source,reference_id,request_id)
    values(v_user,'coins',v_reward,'game_reward','offline_match:'||p_match_id::text,pg_catalog.gen_random_uuid());
  insert into public.match_results(match_id,user_id,mode,placement,score)
    values(p_match_id,v_user,v_session.mode,case when v_won then 1 else 2 end,v_score)
    on conflict(match_id,user_id) do nothing;
  if v_won then
    v_week:=pg_catalog.date_trunc('week',v_now at time zone 'UTC')::date;
    v_month:=pg_catalog.date_trunc('month',v_now at time zone 'UTC')::date;
    insert into public.ranking_totals(user_id,mode,period,period_start,wins)
      values(v_user,v_session.mode,'weekly',v_week,1),(v_user,v_session.mode,'monthly',v_month,1),(v_user,v_session.mode,'total','1970-01-01',1)
      on conflict(user_id,mode,period,period_start) do update set wins=public.ranking_totals.wins+1,updated_at=v_now;
    perform public.server_record_game_metric(v_user,'matchWins',1);
    if (select count(*) from public.player_server_chests where user_id=v_user and opened_at is null)<3 then insert into public.player_server_chests(user_id,match_id) values(v_user,p_match_id); end if;
  end if;
  perform public.server_record_game_metric(v_user,'games',1);
  select coins,gems into v_wallet from public.player_wallets where user_id=v_user;
  return pg_catalog.jsonb_build_object('status','completed','coins',v_wallet.coins,'gems',v_wallet.gems,'reward_coins',v_reward,'winner_ids',p_final_state->'winner_ids','scores',p_final_state->'scores');
end;
$$;
revoke all on function public.server_finalize_offline_match(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.server_finalize_offline_match(uuid,jsonb) to service_role;

-- The old endpoint completed offline matches without validating any rounds.
revoke all on function public.complete_offline_match(uuid) from public,anon,authenticated;

