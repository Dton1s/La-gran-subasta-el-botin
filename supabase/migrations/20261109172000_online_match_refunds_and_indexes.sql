-- Keep entry refunds out of the gameplay earning totals and index match lookups.
alter table public.wallet_transactions
  drop constraint if exists wallet_transactions_source_check;
alter table public.wallet_transactions
  add constraint wallet_transactions_source_check
  check (source = any (array['xsolla_purchase'::text, 'wallet_spend'::text, 'game_reward'::text, 'match_refund'::text]));

create index if not exists game_match_participants_user_id_idx
  on public.game_match_participants(user_id);
create index if not exists game_match_sessions_status_created_at_idx
  on public.game_match_sessions(status,created_at);

create or replace function public.cancel_online_match(p_match_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_session public.game_match_sessions%rowtype;
  v_refunded integer := 0;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode='28000';
  end if;

  select * into v_session
  from public.game_match_sessions
  where id = p_match_id and is_online
  for update;

  if not found then
    return jsonb_build_object('status','not_found','refunded',0);
  end if;
  if not exists (
    select 1 from public.game_match_participants p
    where p.match_id=p_match_id and p.user_id=v_user
  ) then
    raise exception 'not_match_participant' using errcode='42501';
  end if;
  if v_session.status='completed' then
    return jsonb_build_object('status','completed','refunded',0);
  end if;
  if v_session.status not in ('waiting','cancelled') then
    return jsonb_build_object('status',v_session.status,'refunded',0);
  end if;

  update public.game_match_sessions set status='cancelled' where id=p_match_id;
  with refunded as (
    update public.player_wallets w
    set coins=w.coins+10, updated_at=pg_catalog.now()
    from public.game_match_participants p
    where p.match_id=p_match_id and p.user_id=w.user_id
      and not exists (
        select 1 from public.wallet_transactions t
        where t.user_id=w.user_id and t.currency='coins'
          and t.reference_id='online_match_cancel:'||p_match_id::text
      )
    returning w.user_id
  )
  insert into public.wallet_transactions(user_id,currency,amount,source,reference_id,request_id)
  select r.user_id,'coins',10,'match_refund','online_match_cancel:'||p_match_id::text,pg_catalog.gen_random_uuid()
  from refunded r;
  get diagnostics v_refunded = row_count;
  return jsonb_build_object('status','cancelled','refunded',v_refunded);
end;
$$;

revoke all on function public.cancel_online_match(uuid) from public,anon;
grant execute on function public.cancel_online_match(uuid) to authenticated;
