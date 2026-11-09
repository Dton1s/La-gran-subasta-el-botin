-- Publicly readable active catalog; orders and wallet balances remain private.
drop policy if exists "Anyone can read active real money products" on public.real_money_products;
create policy "Anyone can read active real money products"
  on public.real_money_products for select to authenticated
  using (active);

grant select on public.real_money_products to authenticated;
