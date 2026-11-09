create table if not exists public.player_card_entitlements(
  user_id uuid not null references auth.users(id) on delete cascade,
  card_key text not null check (card_key ~ '^(basica|banda|cuchillo|escudo|dorado|veneno)-[1-9]$'),
  acquired_at timestamptz not null default now(),
  source text not null default 'legacy_migration',
  primary key(user_id,card_key)
);
alter table public.player_card_entitlements enable row level security;
revoke all on public.player_card_entitlements from anon,authenticated;

create table if not exists public.player_card_loadouts(
  user_id uuid primary key references auth.users(id) on delete cascade,
  deck_ids text[] not null default array['basica']::text[],
  updated_at timestamptz not null default now(),
  constraint player_card_loadouts_count check (cardinality(deck_ids) between 1 and 3)
);
alter table public.player_card_loadouts enable row level security;
revoke all on public.player_card_loadouts from anon,authenticated;

insert into public.player_card_entitlements(user_id,card_key,source)
select p.user_id,card_key,'legacy_migration'
from public.player_game_progress p
cross join lateral jsonb_array_elements_text(case when jsonb_typeof(p.progress->'ownedCards')='array' then p.progress->'ownedCards' else '[]'::jsonb end) as c(card_key)
where card_key ~ '^(basica|banda|cuchillo|escudo|dorado|veneno)-[1-9]$'
on conflict do nothing;
insert into public.player_card_entitlements(user_id,card_key,source)
select u.id,'basica-'||n::text,'initial_base_deck'
from auth.users u cross join generate_series(1,9) n
where not exists(select 1 from public.player_card_entitlements e where e.user_id=u.id)
on conflict do nothing;
insert into public.player_card_loadouts(user_id,deck_ids)
select p.user_id,coalesce(array(select distinct d from unnest(array(select jsonb_array_elements_text(case when jsonb_typeof(p.progress->'equippedCards')='array' then p.progress->'equippedCards' else '[]'::jsonb end))) d where d=any(array['basica','banda','cuchillo','escudo','dorado','veneno']) limit 3),array['basica']::text[])
from public.player_game_progress p
on conflict(user_id) do nothing;
insert into public.player_card_loadouts(user_id,deck_ids)
select u.id,array['basica']::text[] from auth.users u
on conflict(user_id) do nothing;

create or replace function private.ensure_initial_card_collection()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.player_card_entitlements(user_id,card_key,source)
    select new.id,'basica-'||n::text,'initial_base_deck' from generate_series(1,9) n on conflict do nothing;
  insert into public.player_card_loadouts(user_id,deck_ids) values(new.id,array['basica']::text[]) on conflict do nothing;
  return new;
end;
$$;
revoke all on function private.ensure_initial_card_collection() from public,anon,authenticated;
drop trigger if exists ensure_initial_card_collection on auth.users;
create trigger ensure_initial_card_collection after insert on auth.users for each row execute function private.ensure_initial_card_collection();

create or replace function public.server_purchase_card(p_user_id uuid,p_card_key text,p_request_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_deck text; v_price integer; v_value integer; v_wallet record; v_existing public.wallet_transactions%rowtype; v_owned jsonb;
begin
  if p_user_id is null or p_request_id is null or p_card_key !~ '^(basica|banda|cuchillo|escudo|dorado|veneno)-[1-9]$' then raise exception 'invalid_card_purchase' using errcode='22023'; end if;
  v_deck:=split_part(p_card_key,'-',1); v_value:=split_part(p_card_key,'-',2)::integer;
  v_price:=case v_deck when 'basica' then 0 when 'banda' then 300 when 'cuchillo' then 350 when 'escudo' then 400 when 'dorado' then 550 when 'veneno' then 450 end;
  insert into public.player_wallets(user_id) values(p_user_id) on conflict(user_id) do nothing;
  select * into v_wallet from public.player_wallets where user_id=p_user_id for update;
  select * into v_existing from public.wallet_transactions where user_id=p_user_id and request_id=p_request_id and currency='coins';
  if found then
    if v_existing.reference_id<>'card_purchase:'||p_card_key or v_existing.amount<>-v_price then raise exception 'idempotency_conflict' using errcode='23505'; end if;
  else
    if exists(select 1 from public.player_card_entitlements where user_id=p_user_id and card_key=p_card_key) then raise exception 'card_already_owned' using errcode='23505'; end if;
    if v_wallet.coins<v_price then raise exception 'insufficient_funds' using errcode='P0001'; end if;
    if v_price>0 then
      update public.player_wallets set coins=coins-v_price,updated_at=now() where user_id=p_user_id returning coins,gems into v_wallet;
      insert into public.wallet_transactions(user_id,currency,amount,source,reference_id,request_id) values(p_user_id,'coins',-v_price,'wallet_spend','card_purchase:'||p_card_key,p_request_id);
    end if;
    insert into public.player_card_entitlements(user_id,card_key,source) values(p_user_id,p_card_key,'store_purchase') on conflict do nothing;
  end if;
  select coalesce(jsonb_agg(card_key order by card_key),'[]'::jsonb) into v_owned from public.player_card_entitlements where user_id=p_user_id;
  return jsonb_build_object('card_key',p_card_key,'owned_cards',v_owned,'coins',v_wallet.coins,'gems',v_wallet.gems);
end;
$$;
revoke all on function public.server_purchase_card(uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.server_purchase_card(uuid,text,uuid) to service_role;

create or replace function public.server_set_card_loadout(p_user_id uuid,p_deck_ids text[])
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_decks text[]; v_owned jsonb;
begin
  if p_user_id is null or p_deck_ids is null or cardinality(p_deck_ids)<1 or cardinality(p_deck_ids)>3
    or array_position(p_deck_ids,null) is not null or (select count(distinct d) from unnest(p_deck_ids) d)<>cardinality(p_deck_ids)
    or exists(select 1 from unnest(p_deck_ids) d where d<>all(array['basica','banda','cuchillo','escudo','dorado','veneno'])) then raise exception 'invalid_card_loadout' using errcode='22023'; end if;
  if exists(select 1 from unnest(p_deck_ids) d where not exists(select 1 from public.player_card_entitlements e where e.user_id=p_user_id and e.card_key like d||'-%')) then raise exception 'deck_not_owned' using errcode='42501'; end if;
  insert into public.player_card_loadouts(user_id,deck_ids,updated_at) values(p_user_id,p_deck_ids,now())
    on conflict(user_id) do update set deck_ids=excluded.deck_ids,updated_at=excluded.updated_at;
  select coalesce(jsonb_agg(card_key order by card_key),'[]'::jsonb) into v_owned from public.player_card_entitlements where user_id=p_user_id;
  return jsonb_build_object('equipped_cards',p_deck_ids,'owned_cards',v_owned);
end;
$$;
revoke all on function public.server_set_card_loadout(uuid,text[]) from public,anon,authenticated;
grant execute on function public.server_set_card_loadout(uuid,text[]) to service_role;

create or replace function public.save_player_game_progress(p_progress jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user_id uuid:=auth.uid(); v_safe jsonb;
begin
  if v_user_id is null then raise exception 'not_authenticated' using errcode='28000'; end if;
  if p_progress is null or jsonb_typeof(p_progress)<>'object' or pg_catalog.octet_length(p_progress::text)>65536 then raise exception 'invalid_progress' using errcode='22023'; end if;
  v_safe:=p_progress-'coins'-'gems'-'winsByMode'-'winsByPeriod'-'winsPeriodResetAt'-'missions'-'chests'-'lastSpinTime'-'paidSpinsToday'-'paidSpinDate'-'ownedCards'-'equippedCards'-'equippedCard';
  insert into public.player_game_progress(user_id,progress,updated_at) values(v_user_id,v_safe,pg_catalog.now()) on conflict(user_id) do update set progress=excluded.progress,updated_at=excluded.updated_at;
end; $$;
revoke all on function public.save_player_game_progress(jsonb) from public,anon;
grant execute on function public.save_player_game_progress(jsonb) to authenticated;

create or replace function public.load_player_game_progress()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_progress jsonb; v_owned jsonb; v_decks text[];
begin
  if auth.uid() is null then raise exception 'not_authenticated' using errcode='28000'; end if;
  select coalesce(progress-'missions'-'chests'-'lastSpinTime'-'paidSpinsToday'-'paidSpinDate'-'ownedCards'-'equippedCards'-'equippedCard','{}'::jsonb) into v_progress from public.player_game_progress where user_id=auth.uid();
  v_progress:=coalesce(v_progress,'{}'::jsonb);
  insert into public.player_card_loadouts(user_id,deck_ids) values(auth.uid(),array['basica']::text[]) on conflict do nothing;
  select deck_ids into v_decks from public.player_card_loadouts where user_id=auth.uid();
  select coalesce(jsonb_agg(card_key order by card_key),'[]'::jsonb) into v_owned from public.player_card_entitlements where user_id=auth.uid();
  return v_progress||jsonb_build_object('ownedCards',v_owned,'equippedCards',to_jsonb(coalesce(v_decks,array['basica']::text[])),'equippedCard',coalesce(v_decks[1],'basica'));
end;
$$;
revoke all on function public.load_player_game_progress() from public,anon;
grant execute on function public.load_player_game_progress() to authenticated;

