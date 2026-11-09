-- Secure account progress, online match entry and consensus settlement.
-- Online results are accepted only after every charged participant reports the
-- same final scoreboard. Wallet and ranking writes stay in trusted SQL.

create table if not exists public.player_game_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint player_game_progress_object check (jsonb_typeof(progress) = 'object')
);
alter table public.player_game_progress enable row level security;
revoke all on public.player_game_progress from anon, authenticated;
grant select on public.player_game_progress to authenticated;
drop policy if exists "Players read their own game progress" on public.player_game_progress;
create policy "Players read their own game progress" on public.player_game_progress
  for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.load_player_game_progress()
returns jsonb language sql security definer set search_path = '' as $$
  select coalesce((select p.progress from public.player_game_progress p where p.user_id=auth.uid()),'{}'::jsonb);
$$;
revoke all on function public.load_player_game_progress() from public,anon;
grant execute on function public.load_player_game_progress() to authenticated;

create table if not exists public.game_match_sessions (
  id uuid primary key,
  mode text not null check (mode in ('classic','teams','duel')),
  is_online boolean not null,
  expected_players smallint not null check (expected_players in (1,2,4)),
  participant_ids uuid[] not null,
  status text not null default 'waiting' check (status in ('waiting','active','completed','cancelled')),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  final_scores jsonb,
  check (cardinality(participant_ids) = expected_players)
);
alter table public.game_match_sessions enable row level security;
revoke all on public.game_match_sessions from anon, authenticated;

create table if not exists public.game_match_participants (
  match_id uuid not null references public.game_match_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  team smallint not null default 0 check (team in (0,1,2)),
  joined_at timestamptz not null default now(),
  result_report jsonb,
  reported_at timestamptz,
  primary key (match_id,user_id)
);
alter table public.game_match_participants enable row level security;
revoke all on public.game_match_participants from anon, authenticated;

create or replace function public.save_player_game_progress(p_progress jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user_id uuid := auth.uid(); v_safe jsonb;
begin
  if v_user_id is null then raise exception 'not_authenticated' using errcode='28000'; end if;
  if p_progress is null or jsonb_typeof(p_progress) <> 'object' or pg_catalog.octet_length(p_progress::text) > 65536 then
    raise exception 'invalid_progress' using errcode='22023';
  end if;
  -- Wallet and competitive ranking fields are always server-owned.
  v_safe := p_progress - 'coins' - 'gems' - 'winsByMode' - 'winsByPeriod' - 'winsPeriodResetAt';
  insert into public.player_game_progress(user_id,progress,updated_at) values (v_user_id,v_safe,pg_catalog.now())
  on conflict (user_id) do update set progress=excluded.progress,updated_at=excluded.updated_at;
end; $$;
revoke all on function public.save_player_game_progress(jsonb) from public,anon;
grant execute on function public.save_player_game_progress(jsonb) to authenticated;

create or replace function public.start_offline_match(p_match_id uuid,p_mode text)
returns table(match_id uuid,coins bigint,gems bigint) language plpgsql security definer set search_path = '' as $$
declare v_user uuid:=auth.uid(); v_expected smallint;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode='28000'; end if;
  if p_match_id is null or p_mode not in ('classic','teams','duel') then raise exception 'invalid_match' using errcode='22023'; end if;
  v_expected:=1;
  if exists(select 1 from public.game_match_sessions s where s.id=p_match_id) then
    raise exception 'match_id_already_used' using errcode='23505';
  end if;
  perform * from private.spend_wallet_balance_impl('coins',10,'game_entry',pg_catalog.gen_random_uuid());
  insert into public.game_match_sessions(id,mode,is_online,expected_players,participant_ids,status,started_at)
    values(p_match_id,p_mode,false,v_expected,array[v_user],'active',pg_catalog.now());
  insert into public.game_match_participants(match_id,user_id,team) values(p_match_id,v_user,0);
  return query select p_match_id,w.coins,w.gems from public.player_wallets w where w.user_id=v_user;
end; $$;
revoke all on function public.start_offline_match(uuid,text) from public,anon;
grant execute on function public.start_offline_match(uuid,text) to authenticated;

create or replace function public.complete_offline_match(p_match_id uuid)
returns table(coins bigint,gems bigint,reward_coins integer) language plpgsql security definer set search_path = '' as $$
declare v_user uuid:=auth.uid(); v_session public.game_match_sessions%rowtype; v_reward integer:=5;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode='28000'; end if;
  select * into v_session from public.game_match_sessions where id=p_match_id for update;
  if not found or v_session.is_online then raise exception 'offline_match_not_completable' using errcode='P0001'; end if;
  if not exists(select 1 from public.game_match_participants p where p.match_id=p_match_id and p.user_id=v_user) then raise exception 'not_match_participant' using errcode='42501'; end if;
  if v_session.status='completed' then
    return query select w.coins,w.gems,0 from public.player_wallets w where w.user_id=v_user;
    return;
  end if;
  if v_session.status<>'active' then raise exception 'offline_match_not_completable' using errcode='P0001'; end if;
  if v_session.created_at > pg_catalog.now()-interval '30 seconds' then raise exception 'match_too_short' using errcode='P0001'; end if;
  update public.game_match_sessions set status='completed',completed_at=pg_catalog.now() where id=p_match_id;
  update public.player_wallets set coins=coins+v_reward,updated_at=pg_catalog.now() where user_id=v_user;
  insert into public.wallet_transactions(user_id,currency,amount,source,reference_id,request_id)
    values(v_user,'coins',v_reward,'game_reward','offline_completion:'||p_match_id::text,pg_catalog.gen_random_uuid());
  return query select w.coins,w.gems,v_reward from public.player_wallets w where w.user_id=v_user;
exception when unique_violation then
  return query select w.coins,w.gems,0 from public.player_wallets w where w.user_id=auth.uid();
end; $$;
revoke all on function public.complete_offline_match(uuid) from public,anon;
grant execute on function public.complete_offline_match(uuid) to authenticated;

create or replace function public.create_online_match(p_match_id uuid,p_mode text,p_participant_ids uuid[])
returns text language plpgsql security definer set search_path = '' as $$
declare v_user uuid:=auth.uid(); v_expected smallint; v_team smallint:=0; v_coins bigint;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode='28000'; end if;
  if p_match_id is null or p_mode not in ('classic','teams','duel') then raise exception 'invalid_match' using errcode='22023'; end if;
  v_expected:=case p_mode when 'duel' then 2 else 4 end;
  if p_participant_ids is null or cardinality(p_participant_ids)<>v_expected or array_position(p_participant_ids,null) is not null
    or (select count(distinct x) from unnest(p_participant_ids) x)<>v_expected or not (v_user=any(p_participant_ids)) then
    raise exception 'invalid_roster' using errcode='22023';
  end if;
  if exists(select 1 from public.game_match_sessions where id=p_match_id) then raise exception 'match_id_already_used' using errcode='23505'; end if;
  select w.coins into v_coins from public.player_wallets w where w.user_id=v_user for update;
  if coalesce(v_coins,0)<10 then raise exception 'insufficient_funds' using errcode='P0001'; end if;
  update public.player_wallets set coins=coins-10,updated_at=pg_catalog.now() where user_id=v_user;
  insert into public.wallet_transactions(user_id,currency,amount,source,reference_id,request_id)
    values(v_user,'coins',-10,'wallet_spend','game_entry',pg_catalog.gen_random_uuid());
  insert into public.game_match_sessions(id,mode,is_online,expected_players,participant_ids,status)
    values(p_match_id,p_mode,true,v_expected,p_participant_ids,'waiting');
  v_team:=case when p_mode='teams' then case when array_position(p_participant_ids,v_user)<=2 then 1 else 2 end else 0 end;
  insert into public.game_match_participants(match_id,user_id,team) values(p_match_id,v_user,v_team);
  return 'waiting';
end; $$;
revoke all on function public.create_online_match(uuid,text,uuid[]) from public,anon;
grant execute on function public.create_online_match(uuid,text,uuid[]) to authenticated;

create or replace function public.join_online_match(p_match_id uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare v_user uuid:=auth.uid(); v_session public.game_match_sessions%rowtype; v_team smallint:=0; v_coins bigint; v_count integer;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode='28000'; end if;
  select * into v_session from public.game_match_sessions where id=p_match_id for update;
  if not found or not v_session.is_online or not (v_user=any(v_session.participant_ids)) then raise exception 'invalid_match_invite' using errcode='42501'; end if;
  if exists(select 1 from public.game_match_participants where match_id=p_match_id and user_id=v_user) then return v_session.status; end if;
  if v_session.status<>'waiting' then raise exception 'match_already_started' using errcode='P0001'; end if;
  select coins into v_coins from public.player_wallets where user_id=v_user for update;
  if coalesce(v_coins,0)<10 then raise exception 'insufficient_funds' using errcode='P0001'; end if;
  update public.player_wallets set coins=coins-10,updated_at=pg_catalog.now() where user_id=v_user;
  insert into public.wallet_transactions(user_id,currency,amount,source,reference_id,request_id)
    values(v_user,'coins',-10,'wallet_spend','game_entry',pg_catalog.gen_random_uuid());
  v_team:=case when v_session.mode='teams' then case when array_position(v_session.participant_ids,v_user)<=2 then 1 else 2 end else 0 end;
  insert into public.game_match_participants(match_id,user_id,team) values(p_match_id,v_user,v_team);
  select count(*) into v_count from public.game_match_participants where match_id=p_match_id;
  if v_count=v_session.expected_players then
    update public.game_match_sessions set status='active',started_at=pg_catalog.now() where id=p_match_id;
    return 'active';
  end if;
  return 'waiting';
end; $$;
revoke all on function public.join_online_match(uuid) from public,anon;
grant execute on function public.join_online_match(uuid) to authenticated;

create or replace function public.online_match_status(p_match_id uuid)
returns text language sql security definer set search_path = '' as $$
  select case when auth.uid() is null then null
    when exists(select 1 from public.game_match_participants p where p.match_id=p_match_id and p.user_id=auth.uid())
    then (select s.status from public.game_match_sessions s where s.id=p_match_id) else null end;
$$;
revoke all on function public.online_match_status(uuid) from public,anon;
grant execute on function public.online_match_status(uuid) to authenticated;

create or replace function public.report_online_match_result(p_match_id uuid,p_scores jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user uuid:=auth.uid(); v_session public.game_match_sessions%rowtype; v_expected_ids uuid[]; v_report jsonb; v_reports integer; v_distinct integer; v_mode text; v_now timestamptz:=pg_catalog.now(); v_period_week date; v_period_month date; v_user_id uuid; v_score integer; v_placement smallint; v_winning_team smallint; v_is_winner boolean; v_reward integer; v_wallet record; v_winner_ids uuid[]; v_my_reward integer:=0; v_existing_report jsonb;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode='28000'; end if;
  if p_scores is null or jsonb_typeof(p_scores)<>'array' or pg_catalog.jsonb_array_length(p_scores)>4 then raise exception 'invalid_result' using errcode='22023'; end if;
  select * into v_session from public.game_match_sessions where id=p_match_id and is_online for update;
  if not found or v_session.status not in ('active','completed') then raise exception 'invalid_match_state' using errcode='P0001'; end if;
  if not exists(select 1 from public.game_match_participants p where p.match_id=p_match_id and p.user_id=v_user) then raise exception 'not_match_participant' using errcode='42501'; end if;
  if v_session.status='completed' then
    select w.coins,w.gems into v_wallet from public.player_wallets w where w.user_id=v_user;
    select coalesce(t.amount,0)::integer into v_my_reward from public.wallet_transactions t
      where t.user_id=v_user and t.reference_id='online_match:'||p_match_id::text and t.currency='coins';
    return jsonb_build_object('status','completed','scores',v_session.final_scores,'coins',v_wallet.coins,'gems',v_wallet.gems,'reward_coins',coalesce(v_my_reward,0));
  end if;
  select array_agg(id order by id) into v_expected_ids from unnest(v_session.participant_ids) id;
  if jsonb_array_length(p_scores)<>v_session.expected_players
    or exists(select 1 from jsonb_to_recordset(p_scores) as x(id uuid,score integer) where x.id is null or x.score is null or x.score<0 or x.score>2000)
    or (select array_agg(x.id order by x.id) from jsonb_to_recordset(p_scores) as x(id uuid,score integer))<>v_expected_ids then
    raise exception 'invalid_scoreboard' using errcode='22023';
  end if;
  select jsonb_agg(jsonb_build_object('id',x.id,'score',x.score) order by x.id) into v_report
    from jsonb_to_recordset(p_scores) as x(id uuid,score integer);
  select result_report into v_existing_report from public.game_match_participants where match_id=p_match_id and user_id=v_user;
  if v_existing_report is not null and v_existing_report<>v_report then return jsonb_build_object('status','report_already_submitted'); end if;
  if v_existing_report is null then
    update public.game_match_participants set result_report=v_report,reported_at=v_now where match_id=p_match_id and user_id=v_user;
  end if;
  select count(*) into v_reports from public.game_match_participants where match_id=p_match_id and result_report is not null;
  select count(distinct result_report) into v_distinct from public.game_match_participants where match_id=p_match_id and result_report is not null;
  if v_distinct>1 then
    update public.game_match_sessions set status='cancelled' where id=p_match_id;
    return jsonb_build_object('status','participant_result_mismatch');
  end if;
  if v_reports<v_session.expected_players then return jsonb_build_object('status','awaiting_reports','reported',v_reports,'expected',v_session.expected_players); end if;
  v_period_week:=pg_catalog.date_trunc('week',v_now at time zone 'UTC')::date;
  v_period_month:=pg_catalog.date_trunc('month',v_now at time zone 'UTC')::date;
  v_mode:=v_session.mode;
  update public.game_match_sessions set status='completed',completed_at=v_now,final_scores=v_report where id=p_match_id;
  if v_mode='teams' then
    select case when sum(x.score) filter(where p.team=1)>sum(x.score) filter(where p.team=2) then 1 else 2 end into v_winning_team
      from jsonb_to_recordset(v_report) as x(id uuid,score integer)
      join public.game_match_participants p on p.match_id=p_match_id and p.user_id=x.id;
    for v_user_id in select unnest(v_session.participant_ids) loop
      select x.score into v_score from jsonb_to_recordset(v_report) as x(id uuid,score integer) where x.id=v_user_id;
      select case when p.team=v_winning_team then 1 else 2 end into v_placement from public.game_match_participants p where p.match_id=p_match_id and p.user_id=v_user_id;
      insert into public.match_results(match_id,user_id,mode,placement,score)
        values(p_match_id,v_user_id,v_mode,v_placement,v_score) on conflict(match_id,user_id) do nothing;
    end loop;
    if (select sum(x.score) filter(where p.team=1) from jsonb_to_recordset(v_report) as x(id uuid,score integer) join public.game_match_participants p on p.match_id=p_match_id and p.user_id=x.id)
       <> (select sum(x.score) filter(where p.team=2) from jsonb_to_recordset(v_report) as x(id uuid,score integer) join public.game_match_participants p on p.match_id=p_match_id and p.user_id=x.id) then
      for v_user_id in select p.user_id from public.game_match_participants p where p.match_id=p_match_id and p.team=v_winning_team loop
        insert into public.ranking_totals(user_id,mode,period,period_start,wins) values(v_user_id,v_mode,'weekly',v_period_week,1),(v_user_id,v_mode,'monthly',v_period_month,1),(v_user_id,v_mode,'total','1970-01-01',1)
        on conflict(user_id,mode,period,period_start) do update set wins=public.ranking_totals.wins+1,updated_at=v_now;
      end loop;
    end if;
  else
    select max(x.score) into v_score from jsonb_to_recordset(v_report) as x(id uuid,score integer);
    for v_user_id in select x.id from jsonb_to_recordset(v_report) as x(id uuid,score integer) where x.score=v_score loop
      insert into public.match_results(match_id,user_id,mode,placement,score) values(p_match_id,v_user_id,v_mode,1,v_score) on conflict(match_id,user_id) do nothing;
      if (select count(*) from jsonb_to_recordset(v_report) as x(id uuid,score integer) where x.score=v_score)=1 then
        insert into public.ranking_totals(user_id,mode,period,period_start,wins) values(v_user_id,v_mode,'weekly',v_period_week,1),(v_user_id,v_mode,'monthly',v_period_month,1),(v_user_id,v_mode,'total','1970-01-01',1)
        on conflict(user_id,mode,period,period_start) do update set wins=public.ranking_totals.wins+1,updated_at=v_now;
      end if;
    end loop;
    insert into public.match_results(match_id,user_id,mode,placement,score)
      select p_match_id,x.id,v_mode,2,x.score from jsonb_to_recordset(v_report) as x(id uuid,score integer) where x.score<v_score on conflict(match_id,user_id) do nothing;
  end if;
  if v_mode='teams' then
    if (select sum(x.score) filter(where p.team=1) from jsonb_to_recordset(v_report) as x(id uuid,score integer) join public.game_match_participants p on p.match_id=p_match_id and p.user_id=x.id)
      <> (select sum(x.score) filter(where p.team=2) from jsonb_to_recordset(v_report) as x(id uuid,score integer) join public.game_match_participants p on p.match_id=p_match_id and p.user_id=x.id) then
      select array_agg(p.user_id) into v_winner_ids from public.game_match_participants p where p.match_id=p_match_id and p.team=v_winning_team;
    else v_winner_ids:='{}'::uuid[]; end if;
  else
    select array_agg(x.id) into v_winner_ids from jsonb_to_recordset(v_report) as x(id uuid,score integer)
      where x.score=(select max(y.score) from jsonb_to_recordset(v_report) as y(id uuid,score integer))
      and (select count(*) from jsonb_to_recordset(v_report) as y(id uuid,score integer) where y.score=x.score)=1;
  end if;
  for v_user_id in select unnest(v_session.participant_ids) loop
    v_is_winner:=v_user_id=any(coalesce(v_winner_ids,'{}'::uuid[]));
    select (select x.score from jsonb_to_recordset(v_report) as x(id uuid,score integer) where x.id=v_user_id) into v_score;
    v_reward:=case when v_mode='classic' then 5 else 5 end;
    if v_is_winner then v_reward:=case v_mode when 'classic' then 50 when 'teams' then 40 else 25 end; end if;
    if v_user_id=v_user then v_my_reward:=v_reward; end if;
    update public.player_wallets set coins=coins+v_reward,updated_at=v_now where user_id=v_user_id;
    insert into public.wallet_transactions(user_id,currency,amount,source,reference_id,request_id)
      values(v_user_id,'coins',v_reward,'game_reward','online_match:'||p_match_id::text,pg_catalog.gen_random_uuid());
  end loop;
  select coins,gems into v_wallet from public.player_wallets where user_id=v_user;
  return jsonb_build_object('status','completed','scores',v_report,'winner_ids',to_jsonb(coalesce(v_winner_ids,'{}'::uuid[])),'coins',v_wallet.coins,'gems',v_wallet.gems,'reward_coins',v_my_reward);
end; $$;
revoke all on function public.report_online_match_result(uuid,jsonb) from public,anon;
grant execute on function public.report_online_match_result(uuid,jsonb) to authenticated;

