# Xsolla and secure wallet setup

The project is **320352**. The in-game catalog is in `src/data/realMoneyCatalog.ts`; the server allowlist is in `functions/_shared/real-money-catalog.ts`; database SKUs and rewards are seeded by the migrations. Keep those three lists aligned.

## Packages

| Type | Price | Contents |
| --- | ---: | --- |
| Mixed | €1.19 | 80 gems + 800 coins |
| Mixed | €2.30 | 170 gems + 1,800 coins |
| Mixed | €4.99 | 400 gems + 4,500 coins |
| Mixed | €9.99 | 900 gems + 10,000 coins |
| Mixed | €19.99 | 2,000 gems + 22,000 coins |
| Mixed | €49.99 | 5,400 gems + 60,000 coins |
| Mixed | €99.99 | 11,000 gems + 125,000 coins |
| Gems only | €1.19 | 120 gems |
| Gems only | €2.30 | 240 gems |
| Gems only | €4.99 | 520 gems |
| Gems only | €9.99 | 1,100 gems |
| Gems only | €19.99 | 2,300 gems |
| Gems only | €49.99 | 6,000 gems |
| Gems only | €99.99 | 12,500 gems |

These are proposed store prices and contents, not yet published products in Xsolla. Configure every SKU with the matching EUR price in the Xsolla project before enabling checkout. Xsolla's catalog controls the actual charge amount.

## Server secrets

Set these as **Supabase Edge Function secrets**, never as `VITE_*` variables or browser code:

- `XSOLLA_PROJECT_ID=320352`
- `XSOLLA_API_KEY=<private Xsolla API key>`
- `XSOLLA_WEBHOOK_SECRET=<Xsolla webhook secret>`
- `XSOLLA_RETURN_URL=https://www.nebuladigitalstudio.es/lagransubasta/`

Supabase supplies its URL and service role to Edge Functions. The service role must never be placed in Vercel client environment variables. The project ID is not secret; API and webhook secrets are.

Configure the Xsolla webhook to call:

`https://urluvygzebllnbyfmeai.supabase.co/functions/v1/xsolla-webhook`

The handler validates the Xsolla signature against the raw request and credits a pending order once, using the server-side SKU reward. The checkout function uses Xsolla sandbox mode. Keep checkout disabled until the Xsolla application is approved, SKUs are configured, secrets are stored, and sandbox payment plus webhook delivery are verified.

## Wallet boundaries

- Browser users can read only their own wallet and ledger rows.
- Browser writes to `player_wallets`, orders, and ledger are denied.
- `spend_wallet_balance` can only subtract a bounded amount for an allowlisted reason; repeated request IDs are idempotent.
- Only the service role can execute `apply_xsolla_wallet_purchase`; it resolves rewards from the database catalog, not from browser input.
- Refunds and chargebacks still need reversal handling and reconciliation before production checkout is enabled.
- Existing offline game currency remains local. Moving it to this account wallet requires wiring the signed-in UI and trusted online match rewards to the server; do not mirror client-generated offline rewards into the secure wallet.
