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

## AI buddy — Haven (Edge Function)

Since build 24 the Companion chat is a real AI (Google Gemini, free
tier) instead of scripted replies. The intelligence lives in the
`buddy-chat` Edge Function in `supabase/functions/` — the app sends the
recent conversation with the user's JWT, the function calls Gemini
server-side, and the API key never ships in the app.

One-time setup:

1. **Get a free Gemini API key** — [Google AI Studio](https://aistudio.google.com)
   → "Get API key" → create a key. No billing needed.
2. **Add the secret** — Supabase dashboard → your project → Edge
   Functions → Secrets → add `GEMINI_API_KEY` with that key.
3. **Deploy the function** — from a machine logged into the Supabase CLI:

   ```sh
   supabase functions deploy buddy-chat
   ```

Model strategy (constants at the top of the function): replies default
to **Gemini 2.5 Pro**; its free-tier daily request cap is small, so on
a 429 the function retries once against **Gemini 2.5 Flash** before
giving up. The buddy is a signed-in feature — signed-out or offline,
the app answers with its built-in scripted replies instead, and crisis
language is always handled on-device first (resources show instantly,
no network involved).
