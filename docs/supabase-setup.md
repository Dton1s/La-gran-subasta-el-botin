# Supabase setup

## Project connection

1. Copy the project URL and **publishable** key from the Supabase project's Connect dialog.
2. Put them in a local `.env.local` using the names in `.env.example`.
3. The local `.env.local` is ignored by Git. The Pages workflow builds with the project's URL and publishable key; a publishable key is expected to be visible in the static browser bundle. Never add a `service_role` key to Vite, GitHub Pages, or a `VITE_*` variable.
4. Run `supabase/migrations/20261107000000_auth_profiles.sql` in the Supabase SQL Editor (or apply it with the Supabase CLI).

## Auth URL configuration

Set Supabase Auth's Site URL to `https://dton1s.github.io/La-gran-subasta-el-botin/` and add that exact URL to the allowed redirect URLs. For local development also allow `http://localhost:5173/`.

Email/password is handled by Supabase Auth. Turn on email confirmation before public launch and customize the confirmation email template. Password recovery should use the same Pages URL.

## Google and Facebook

Create OAuth apps with Google Cloud and Meta for Developers. In each provider's OAuth settings, add the Supabase callback URL shown in **Authentication → Providers** (usually `https://<project-ref>.supabase.co/auth/v1/callback`). Then add that provider's client ID and secret in Supabase **Authentication → Providers**, enable it, and save. The frontend redirects back to the configured Pages URL; provider secrets remain in Supabase and are never shipped to the browser.

## Data boundaries

- `profiles` stores public display name and equipped avatar presentation fields; users can only edit their own row.
- `player_wallets`, `player_inventory`, and `match_results` are readable only by their owner.
- `ranking_totals` is public for leaderboard reads.
- Browser roles have no insert/update/delete grants for wallets, inventory, match results, or rankings. Later purchase, reward, and match code must write these through trusted Edge Functions/server code, never by trusting client-side game state.
