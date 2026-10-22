# Hustle & Heart Motivation — backend setup

Same Supabase project as the loyalty app (free tier is fine). This app only
adds a `quotes` table — it never touches the loyalty tables.

1. **Open the SQL Editor**
   - Supabase dashboard → your project → **SQL Editor** (left sidebar).

2. **Create the table**
   - Open `supabase/schema.sql` on your computer, copy everything.
   - Paste into the SQL Editor → **Run**. Safe to re-run.

3. **Seed the quotes**
   - Clear the editor. Copy everything in `supabase/seed.sql`, paste, **Run**.
   - 380 rows: 260 English (40 per track) · 80 Hebrew · 40 Spanish. Idempotent.

4. **Verify**
   - Table Editor → `quotes` → you should see 380 rows.
   - The app reads with the **anon** key (RLS policy allows `select` where
     `active = true`). No service-role key is ever needed client-side.

**Adding a language later:** add a `data/quotes/<lang>.json` file in the repo
(`{"language": "<lang>", "quotes": [{"id","text","tracks"}]}`), re-run the
seed generator step, and add the locale file + `Language` entry. No code
changes needed for quotes.

## Account deletion (Edge Function)

The app's Delete Account button (Settings → Account, signed-in users only)
calls the `delete-account` Edge Function in `supabase/functions/`.
Deploy it once, from a machine logged into the Supabase CLI:

```sh
supabase functions deploy delete-account
```

The function verifies the caller's JWT and deletes their auth user with
the service-role key, which Supabase injects into the function
environment automatically (`SUPABASE_SERVICE_ROLE_KEY`) — never commit
that key anywhere. This app stores no per-user database rows (only the
shared `quotes` table), so deleting the auth user fully deletes the
account server-side; the app wipes on-device data itself.
