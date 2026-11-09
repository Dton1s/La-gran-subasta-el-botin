-- Server state for competitive rounds and economic reward sources.
alter table public.game_match_sessions
  add column if not exists server_state jsonb,
  add column if not exists server_revision bigint not null default 0;

create table if not exists public.player_game_metrics (
  user_id uuid not null references auth.users(id) on delete cascade,
  period text not null check (period in ('diaria','semanal','mensual')),
  period_start date not null,
  metric text not null check (metric in ('games','bids','roundWins','matchWins','removals')),
  value integer not null default 0 check (value >= 0),
  primary key(user_id,period,period_start,metric)
);
alter table public.player_game_metrics enable row level security;
revoke all on public.player_game_metrics from anon,authenticated;

create table if not exists public.player_mission_claims (
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id text not null,
  period_start date not null,
  claimed_at timestamptz not null default now(),
  primary key(user_id,mission_id,period_start)
);
alter table public.player_mission_claims enable row level security;
revoke all on public.player_mission_claims from anon,authenticated;

create table if not exists public.player_roulette_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_free_at timestamptz,
  paid_spin_date date,
  paid_spin_count integer not null default 0 check (paid_spin_count >= 0)
);
alter table public.player_roulette_state enable row level security;
revoke all on public.player_roulette_state from anon,authenticated;

create table if not exists public.player_server_chests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id uuid references public.game_match_sessions(id) on delete set null,
  created_at timestamptz not null default now(),
  ready_at timestamptz not null default now()+interval '10 minutes',
  opened_at timestamptz
);
alter table public.player_server_chests enable row level security;
revoke all on public.player_server_chests from anon,authenticated;
create index if not exists player_server_chests_user_ready_idx on public.player_server_chests(user_id,ready_at) where opened_at is null;

create or replace function public.server_record_game_metric(p_user_id uuid,p_metric text,p_amount integer default 1)
returns void language plpgsql security definer set search_path = '' as $$
declare v_now timestamptz:=pg_catalog.now(); v_period text; v_start date;
begin
  if p_user_id is null or p_metric not in ('games','bids','roundWins','matchWins','removals') or p_amount<1 or p_amount>100 then raise exception 'invalid_metric' using errcode='22023'; end if;
  foreach v_period in array array['diaria','semanal','mensual'] loop
    v_start:=case v_period when 'diaria' then v_now::date when 'semanal' then pg_catalog.date_trunc('week',v_now)::date else pg_catalog.date_trunc('month',v_now)::date end;
    insert into public.player_game_metrics(user_id,period,period_start,metric,value) values(p_user_id,v_period,v_start,p_metric,p_amount)
      on conflict(user_id,period,period_start,metric) do update set value=public.player_game_metrics.value+excluded.value;
  end loop;
end; $$;
revoke all on function public.server_record_game_metric(uuid,text,integer) from public,anon,authenticated;
grant execute on function public.server_record_game_metric(uuid,text,integer) to service_role;

create or replace function public.server_claim_mission(p_user_id uuid,p_mission_id text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_period text; v_metric text; v_target integer; v_currency text; v_reward integer; v_start date; v_progress integer; v_wallet record; v_now timestamptz:=pg_catalog.now();
begin
  if p_user_id is null then raise exception 'invalid_user' using errcode='22023'; end if;
  select m.period,m.metric,m.target,m.currency,m.reward into v_period,v_metric,v_target,v_currency,v_reward from (values
    ('d-play','diaria','games',35,'coins',40),('d-bids','diaria','bids',300,'coins',50),('d-rounds','diaria','roundWins',80,'coins',30),('d-win','diaria','matchWins',7,'gems',1),('d-removal','diaria','removals',1,'coins',10),
    ('w-play','semanal','games',100,'coins',100),('w-bids','semanal','bids',900,'coins',150),('w-rounds','semanal','roundWins',230,'coins',200),('w-win','semanal','matchWins',18,'gems',3),('w-removal','semanal','removals',5,'coins',50),
    ('m-play','mensual','games',400,'coins',300),('m-bids','mensual','bids',3600,'coins',450),('m-rounds','mensual','roundWins',900,'coins',600),('m-win','mensual','matchWins',70,'gems',6),('m-removal','mensual','removals',20,'coins',200)
  ) as m(id,period,metric,target,currency,reward) where m.id=p_mission_id;
  if not found then raise exception 'unknown_mission' using errcode='22023'; end if;
  v_start:=case v_period when 'diaria' then v_now::date when 'semanal' then pg_catalog.date_trunc('week',v_now)::date else pg_catalog.date_trunc('month',v_now)::date end;
  select coalesce(value,0) into v_progress from public.player_game_metrics where user_id=p_user_id and period=v_period and period_start=v_start and metric=v_metric;
  if coalesce(v_progress,0)<v_target then raise exception 'mission_not_completed' using errcode='P0001'; end if;
  insert into public.player_mission_claims(user_id,mission_id,period_start) values(p_user_id,p_mission_id,v_start) on conflict do nothing;
  if not found then raise exception 'mission_already_claimed' using errcode='23505'; end if;
  if v_currency='coins' then update public.player_wallets set coins=coins+v_reward,updated_at=v_now where user_id=p_user_id;
  else update public.player_wallets set gems=gems+v_reward,updated_at=v_now where user_id=p_user_id; end if;
  insert into public.wallet_transactions(user_id,currency,amount,source,reference_id,request_id) values(p_user_id,v_currency,v_reward,'game_reward','mission:'||p_mission_id||':'||v_start::text,pg_catalog.gen_random_uuid());
  select coins,gems into v_wallet from public.player_wallets where user_id=p_user_id;
  return jsonb_build_object('mission_id',p_mission_id,'period_start',v_start,'reward',v_reward,'currency',v_currency,'coins',v_wallet.coins,'gems',v_wallet.gems);
end; $$;
revoke all on function public.server_claim_mission(uuid,text) from public,anon,authenticated;
grant execute on function public.server_claim_mission(uuid,text) to service_role;

create or replace function public.server_spin_roulette(p_user_id uuid,p_paid boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_now timestamptz:=pg_catalog.now(); v_today date; v_state public.player_roulette_state%rowtype; v_cost integer; v_roll numeric; v_acc numeric:=0; v_total numeric:=1000; v_index integer; v_coin integer:=0; v_gem integer:=0; v_label text; v_wallet record;
  v_weights numeric[]:=array[230,12,190,3,160,129,130,1,90,0.2,40,15];
  v_coins integer[]:=array[5,0,10,0,15,0,20,0,30,0,50,100];
  v_gems integer[]:=array[0,3,0,6,0,0,0,15,0,30,0,0];
  v_labels text[]:=array['5 🪙','3 💎','10 🪙','6 💎','15 🪙','NADA','20 🪙','15 💎','30 🪙','30 💎','50 🪙','100 🪙'];
begin
  if p_user_id is null then raise exception 'invalid_user' using errcode='22023'; end if;
  v_today:=v_now::date;
  insert into public.player_roulette_state(user_id) values(p_user_id) on conflict do nothing;
  select * into v_state from public.player_roulette_state where user_id=p_user_id for update;
  if p_paid then
    if v_state.paid_spin_date is distinct from v_today then v_state.paid_spin_count:=0; end if;
    v_cost:=least(5+v_state.paid_spin_count*5,25);
    update public.player_wallets set gems=gems-v_cost,updated_at=v_now where user_id=p_user_id and gems>=v_cost returning gems into v_gem;
    if not found then raise exception 'insufficient_funds' using errcode='P0001'; end if;
    update public.player_roulette_state set paid_spin_date=v_today,paid_spin_count=v_state.paid_spin_count+1 where user_id=p_user_id;
    insert into public.wallet_transactions(user_id,currency,amount,source,reference_id,request_id) values(p_user_id,'gems',-v_cost,'wallet_spend','roulette_extra',pg_catalog.gen_random_uuid());
  else
    if v_state.last_free_at is not null and v_state.last_free_at>v_now-interval '24 hours' then raise exception 'roulette_cooldown' using errcode='P0001'; end if;
    update public.player_roulette_state set last_free_at=v_now where user_id=p_user_id;
  end if;
  v_roll:=random()*v_total;
  for i in 1..array_length(v_weights,1) loop v_acc:=v_acc+v_weights[i]; if v_roll<v_acc then v_index:=i; exit; end if; end loop;
  v_coin:=v_coins[v_index]; v_gem:=v_gems[v_index]; v_label:=v_labels[v_index];
  if v_coin>0 then update public.player_wallets set coins=coins+v_coin,updated_at=v_now where user_id=p_user_id;
    insert into public.wallet_transactions(user_id,currency,amount,source,reference_id,request_id) values(p_user_id,'coins',v_coin,'game_reward','roulette:'||v_today::text,pg_catalog.gen_random_uuid()); end if;
  if v_gem>0 then update public.player_wallets set gems=gems+v_gem,updated_at=v_now where user_id=p_user_id;
    insert into public.wallet_transactions(user_id,currency,amount,source,reference_id,request_id) values(p_user_id,'gems',v_gem,'game_reward','roulette:'||v_today::text,pg_catalog.gen_random_uuid()); end if;
  select coins,gems into v_wallet from public.player_wallets where user_id=p_user_id;
  return jsonb_build_object('prize_index',v_index-1,'label',v_label,'coins_awarded',v_coin,'gems_awarded',v_gem,'coins',v_wallet.coins,'gems',v_wallet.gems,'paid_cost',case when p_paid then least(5+(v_state.paid_spin_count)*5,25) else 0 end,'paid_count',case when p_paid then v_state.paid_spin_count+1 else v_state.paid_spin_count end,'last_free_at',case when p_paid then v_state.last_free_at else v_now end);
end; $$;
revoke all on function public.server_spin_roulette(uuid,boolean) from public,anon,authenticated;
grant execute on function public.server_spin_roulette(uuid,boolean) to service_role;

create or replace function public.server_finalize_online_match(p_match_id uuid,p_final_state jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_session public.game_match_sessions%rowtype; v_now timestamptz:=pg_catalog.now(); v_week date; v_month date; v_winners uuid[]; v_user uuid; v_score integer; v_reward integer; v_me uuid:=nullif(p_final_state->>'requester_id','')::uuid; v_my_reward integer:=0; v_wallet record; v_scores jsonb:=p_final_state->'scores'; v_mode text;
begin
  select * into v_session from public.game_match_sessions where id=p_match_id and is_online for update;
  if not found then raise exception 'match_not_found' using errcode='P0001'; end if;
  if v_session.status='completed' then
    select coins,gems into v_wallet from public.player_wallets where user_id=v_me;
    select amount::integer into v_my_reward from public.wallet_transactions where user_id=v_me and reference_id='online_match:'||p_match_id::text and currency='coins';
    return jsonb_build_object('status','completed','coins',v_wallet.coins,'gems',v_wallet.gems,'reward_coins',coalesce(v_my_reward,0),'winner_ids',v_session.server_state->'winner_ids','scores',v_session.server_state->'scores');
  end if;
  if v_session.status<>'active' or jsonb_typeof(v_scores)<>'object' or jsonb_typeof(p_final_state->'winner_ids')<>'array' then raise exception 'invalid_server_match_state' using errcode='P0001'; end if;
  if exists(select 1 from unnest(v_session.participant_ids) id where not (v_scores ? id::text) or (v_scores->>id::text)::integer not between 0 and 2000) then raise exception 'invalid_server_scores' using errcode='22023'; end if;
  select array_agg(x::uuid) into v_winners from jsonb_array_elements_text(p_final_state->'winner_ids') x;
  if exists(select 1 from unnest(coalesce(v_winners,'{}'::uuid[])) id where not id=any(v_session.participant_ids)) then raise exception 'invalid_server_winner' using errcode='22023'; end if;
  v_week:=pg_catalog.date_trunc('week',v_now at time zone 'UTC')::date; v_month:=pg_catalog.date_trunc('month',v_now at time zone 'UTC')::date; v_mode:=v_session.mode;
  update public.game_match_sessions set status='completed',completed_at=v_now,final_scores=(select jsonb_agg(jsonb_build_object('id',id,'score',(v_scores->>id::text)::integer)) from unnest(v_session.participant_ids) id) where id=p_match_id;
  update public.game_match_sessions set server_state=server_state||jsonb_build_object('phase','completed','winner_ids',to_jsonb(coalesce(v_winners,'{}'::uuid[]))) where id=p_match_id;
  for v_user in select unnest(v_session.participant_ids) loop
    v_score:=(v_scores->>v_user::text)::integer;
    v_reward:=case when v_user=any(coalesce(v_winners,'{}'::uuid[])) then case v_mode when 'classic' then 50 when 'teams' then 40 else 25 end else 5 end;
    if v_user=v_me then v_my_reward:=v_reward; end if;
    update public.player_wallets set coins=coins+v_reward,updated_at=v_now where user_id=v_user;
    insert into public.wallet_transactions(user_id,currency,amount,source,reference_id,request_id) values(v_user,'coins',v_reward,'game_reward','online_match:'||p_match_id::text,pg_catalog.gen_random_uuid());
    insert into public.match_results(match_id,user_id,mode,placement,score) values(p_match_id,v_user,v_mode,case when v_user=any(coalesce(v_winners,'{}'::uuid[])) then 1 else 2 end,v_score) on conflict(match_id,user_id) do nothing;
    if v_user=any(coalesce(v_winners,'{}'::uuid[])) then
      insert into public.ranking_totals(user_id,mode,period,period_start,wins) values(v_user,v_mode,'weekly',v_week,1),(v_user,v_mode,'monthly',v_month,1),(v_user,v_mode,'total','1970-01-01',1)
        on conflict(user_id,mode,period,period_start) do update set wins=public.ranking_totals.wins+1,updated_at=v_now;
      perform public.server_record_game_metric(v_user,'matchWins',1);
    end if;
    perform public.server_record_game_metric(v_user,'games',1);
  end loop;
  if cardinality(coalesce(v_winners,'{}'::uuid[]))>0 then
    for v_user in select unnest(v_winners) loop
      if (select count(*) from public.player_server_chests where user_id=v_user and opened_at is null)<3 then insert into public.player_server_chests(user_id,match_id) values(v_user,p_match_id); end if;
    end loop;
  end if;
  select coins,gems into v_wallet from public.player_wallets where user_id=v_me;
  return jsonb_build_object('status','completed','coins',v_wallet.coins,'gems',v_wallet.gems,'reward_coins',v_my_reward,'winner_ids',to_jsonb(coalesce(v_winners,'{}'::uuid[])),'scores',p_final_state->'scores');
end; $$;
revoke all on function public.server_finalize_online_match(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.server_finalize_online_match(uuid,jsonb) to service_role;

create or replace function public.server_claim_match_chest(p_user_id uuid,p_chest_id uuid,p_instant boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_chest public.player_server_chests%rowtype; v_now timestamptz:=pg_catalog.now(); v_roll numeric; v_coins integer:=0; v_gems integer:=0; v_reward text; v_wallet record;
begin
  select * into v_chest from public.player_server_chests where id=p_chest_id and user_id=p_user_id and opened_at is null for update;
  if not found then raise exception 'chest_not_found' using errcode='P0001'; end if;
  if v_chest.ready_at>v_now then
    if not p_instant then raise exception 'chest_not_ready' using errcode='P0001'; end if;
    update public.player_wallets set gems=gems-25,updated_at=v_now where user_id=p_user_id and gems>=25;
    if not found then raise exception 'insufficient_funds' using errcode='P0001'; end if;
    insert into public.wallet_transactions(user_id,currency,amount,source,reference_id,request_id) values(p_user_id,'gems',-25,'wallet_spend','chest_skip',pg_catalog.gen_random_uuid());
  end if;
  v_roll:=random();
  if v_roll<0.05 then v_gems:=10; v_reward:='+10 gemas';
  elsif v_roll<0.07 then v_gems:=20; v_reward:='+20 gemas';
  elsif v_roll<0.075 then v_gems:=50; v_reward:='+50 gemas';
  else v_coins:=(array[20,30,40,50,75,100,125,150])[1+floor(random()*8)::integer]; v_reward:='+'||v_coins||' monedas'; end if;
  update public.player_wallets set coins=coins+v_coins,gems=gems+v_gems,updated_at=v_now where user_id=p_user_id;
  if v_coins>0 then insert into public.wallet_transactions(user_id,currency,amount,source,reference_id,request_id) values(p_user_id,'coins',v_coins,'game_reward','match_chest:'||p_chest_id::text,pg_catalog.gen_random_uuid()); end if;
  if v_gems>0 then insert into public.wallet_transactions(user_id,currency,amount,source,reference_id,request_id) values(p_user_id,'gems',v_gems,'game_reward','match_chest:'||p_chest_id::text,pg_catalog.gen_random_uuid()); end if;
  update public.player_server_chests set opened_at=v_now where id=p_chest_id;
  select coins,gems into v_wallet from public.player_wallets where user_id=p_user_id;
  return jsonb_build_object('reward',v_reward,'coins_awarded',v_coins,'gems_awarded',v_gems,'coins',v_wallet.coins,'gems',v_wallet.gems);
end; $$;
revoke all on function public.server_claim_match_chest(uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.server_claim_match_chest(uuid,uuid,boolean) to service_role;

-- Progress snapshots must never overwrite server-controlled match or reward state.
create or replace function public.save_player_game_progress(p_progress jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user_id uuid:=auth.uid(); v_safe jsonb;
begin
  if v_user_id is null then raise exception 'not_authenticated' using errcode='28000'; end if;
  if p_progress is null or jsonb_typeof(p_progress)<>'object' or pg_catalog.octet_length(p_progress::text)>65536 then raise exception 'invalid_progress' using errcode='22023'; end if;
  v_safe:=p_progress-'coins'-'gems'-'winsByMode'-'winsByPeriod'-'winsPeriodResetAt'-'missions'-'chests'-'lastSpinTime'-'paidSpinsToday'-'paidSpinDate';
  insert into public.player_game_progress(user_id,progress,updated_at) values(v_user_id,v_safe,pg_catalog.now())
    on conflict(user_id) do update set progress=excluded.progress,updated_at=excluded.updated_at;
end; $$;
revoke all on function public.save_player_game_progress(jsonb) from public,anon;
grant execute on function public.save_player_game_progress(jsonb) to authenticated;

create or replace function public.load_player_game_progress()
returns jsonb language sql security definer set search_path = '' as $$
  select coalesce((select p.progress-'missions'-'chests'-'lastSpinTime'-'paidSpinsToday'-'paidSpinDate' from public.player_game_progress p where p.user_id=auth.uid()),'{}'::jsonb);
$$;
revoke all on function public.load_player_game_progress() from public,anon;
grant execute on function public.load_player_game_progress() to authenticated;
