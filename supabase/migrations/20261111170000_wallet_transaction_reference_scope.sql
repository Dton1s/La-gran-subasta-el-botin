-- Transaction references such as game_entry and roulette_extra describe an
-- operation type, not a globally unique transaction. Idempotency is already
-- enforced by wallet_transactions_request_currency_unique on request_id.
-- Keep reference uniqueness only for provider purchase references, which are
-- globally unique and are used to deduplicate external payment callbacks.
alter table public.wallet_transactions
  drop constraint if exists wallet_transactions_reference_id_currency_source_key;

create unique index if not exists wallet_transactions_xsolla_reference_unique
  on public.wallet_transactions (reference_id, currency, source)
  where source = 'xsolla_purchase';
