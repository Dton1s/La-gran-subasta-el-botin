-- Secure server-authoritative wallet and fixed-price Xsolla catalog.
-- Client code may read balances and request debits; only the payment webhook
-- running with the service role can credit currency.

create table if not exists public.real_money_products (
  sku text primary key check (sku ~ '^[a-z0-9-]{3,80}$'),
  display_name text not null,
  product_type text not null check (product_type in ('bundle', 'gems')),
  price_cents integer not null check (price_cents > 0),
  currency text not null default 'EUR' check (currency = 'EUR'),
  gems bigint not null default 0 check (gems >= 0),
  coins bigint not null default 0 check (coins >= 0),
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  check (gems > 0 or coins > 0)
);

insert into public.real_money_products (sku, display_name, product_type, price_cents, currency, gems, coins)
values
  ('subasta-mixto-119', 'Bolsa del principiante', 'bundle', 119, 'EUR', 80, 800),
  ('subasta-mixto-230', 'Saco del subastador', 'bundle', 230, 'EUR', 170, 1800),
  ('subasta-mixto-499', 'Alijo del botín', 'bundle', 499, 'EUR', 400, 4500),
  ('subasta-mixto-999', 'Cofre del apostador', 'bundle', 999, 'EUR', 900, 10000),
  ('subasta-mixto-1999', 'Tesoro del capitán', 'bundle', 1999, 'EUR', 2000, 22000),
  ('subasta-mixto-4999', 'Bóveda de la mesa', 'bundle', 4999, 'EUR', 5400, 60000),
  ('subasta-mixto-9999', 'Gran tesoro', 'bundle', 9999, 'EUR', 11000, 125000),
  ('subasta-gemas-119', 'Puñado de gemas', 'gems', 119, 'EUR', 120, 0),
  ('subasta-gemas-230', 'Bolsa de gemas', 'gems', 230, 'EUR', 240, 0),
  ('subasta-gemas-499', 'Saco de gemas', 'gems', 499, 'EUR', 520, 0),
  ('subasta-gemas-999', 'Cofre de gemas', 'gems', 999, 'EUR', 1100, 0),
  ('subasta-gemas-1999', 'Tesoro de gemas', 'gems', 1999, 'EUR', 2300, 0),
  ('subasta-gemas-4999', 'Bóveda de gemas', 'gems', 4999, 'EUR', 6000, 0),
  ('subasta-gemas-9999', 'Gran bóveda de gemas', 'gems', 9999, 'EUR', 12500, 0)
on conflict (sku) do update set
  display_name = excluded.display_name,
  product_type = excluded.product_type,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  gems = excluded.gems,
  coins = excluded.coins,
  active = true,
  updated_at = now();

create table if not exists public.real_money_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  sku text not null references public.real_money_products(sku),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  xsolla_order_id text,
  xsolla_transaction_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists real_money_orders_user_created_idx
  on public.real_money_orders (user_id, created_at desc);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  currency text not null check (currency in ('coins', 'gems')),
  amount bigint not null check (amount <> 0),
  source text not null check (source in ('xsolla_purchase', 'wallet_spend')),
  reference_id text not null,
  request_id uuid,
  created_at timestamptz not null default now(),
  unique (reference_id, currency, source)
);

create unique index if not exists wallet_transactions_request_currency_unique
  on public.wallet_transactions (request_id, currency)
  where request_id is not null;
create index if not exists wallet_transactions_user_created_idx
  on public.wallet_transactions (user_id, created_at desc);

alter table public.real_money_products enable row level security;
alter table public.real_money_orders enable row level security;
alter table public.wallet_transactions enable row level security;

drop policy if exists "Players read their own real money orders" on public.real_money_orders;
create policy "Players read their own real money orders"
  on public.real_money_orders for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Players read their own wallet transactions" on public.wallet_transactions;
create policy "Players read their own wallet transactions"
  on public.wallet_transactions for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.real_money_products from anon, authenticated;
revoke insert, update, delete on public.player_wallets from anon, authenticated;
revoke all on public.real_money_orders from anon, authenticated;
revoke all on public.wallet_transactions from anon, authenticated;
grant select on public.real_money_orders, public.wallet_transactions to authenticated;

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

  if exists (
    select 1 from public.wallet_transactions t
    where t.user_id = v_user_id and t.request_id = p_request_id and t.currency = p_currency
  ) then
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

create or replace function public.apply_xsolla_wallet_purchase(
  p_order_id uuid,
  p_transaction_id text
)
returns table (coins bigint, gems bigint, already_processed boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.real_money_orders%rowtype;
  v_product public.real_money_products%rowtype;
  v_existing_order uuid;
begin
  if p_order_id is null or coalesce(length(trim(p_transaction_id)), 0) = 0 or length(p_transaction_id) > 200 then
    raise exception 'invalid_payment_reference' using errcode = '22023';
  end if;
  select o.* into v_order from public.real_money_orders o where o.id = p_order_id for update;
  if not found then raise exception 'order_not_found' using errcode = 'P0002'; end if;
  if v_order.status = 'paid' then
    if v_order.xsolla_transaction_id <> p_transaction_id then raise exception 'order_already_paid' using errcode = '23505'; end if;
    return query select w.coins, w.gems, true from public.player_wallets w where w.user_id = v_order.user_id;
    return;
  end if;
  if v_order.status <> 'pending' then raise exception 'order_not_pending' using errcode = 'P0001'; end if;
  select o.id into v_existing_order from public.real_money_orders o where o.xsolla_transaction_id = p_transaction_id;
  if found then raise exception 'transaction_already_used' using errcode = '23505'; end if;
  select p.* into v_product from public.real_money_products p where p.sku = v_order.sku and p.active;
  if not found then raise exception 'product_unavailable' using errcode = 'P0002'; end if;

  insert into public.player_wallets (user_id) values (v_order.user_id) on conflict (user_id) do nothing;
  update public.player_wallets w set
    coins = w.coins + v_product.coins,
    gems = w.gems + v_product.gems,
    updated_at = now()
  where w.user_id = v_order.user_id;

  if v_product.coins > 0 then
    insert into public.wallet_transactions (user_id, currency, amount, source, reference_id)
    values (v_order.user_id, 'coins', v_product.coins, 'xsolla_purchase', p_order_id::text);
  end if;
  if v_product.gems > 0 then
    insert into public.wallet_transactions (user_id, currency, amount, source, reference_id)
    values (v_order.user_id, 'gems', v_product.gems, 'xsolla_purchase', p_order_id::text);
  end if;

  update public.real_money_orders set status = 'paid', xsolla_transaction_id = p_transaction_id, paid_at = now(), updated_at = now()
  where id = p_order_id;
  return query select w.coins, w.gems, false from public.player_wallets w where w.user_id = v_order.user_id;
end;
$$;

revoke all on function public.spend_wallet_balance(text, bigint, text, uuid) from public, anon;
grant execute on function public.spend_wallet_balance(text, bigint, text, uuid) to authenticated;
revoke all on function public.apply_xsolla_wallet_purchase(uuid, text) from public, anon, authenticated;
grant execute on function public.apply_xsolla_wallet_purchase(uuid, text) to service_role;
