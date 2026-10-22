/**
 * delete-account — Supabase Edge Function for Hustle & Heart Motivation.
 *
 * Permanently deletes the CALLER's account:
 *   1. Verifies the caller's JWT (Authorization header from the app).
 *   2. Deletes the caller's auth user with the service-role key. This app
 *      keeps no per-user rows in the database (only the shared, public
 *      `quotes` table), so deleting the auth user removes the account and
 *      everything tied to it server-side. On-device data is wiped by the
 *      app itself after this call succeeds.
 *
 * The service-role key comes from the function's environment
 * (SUPABASE_SERVICE_ROLE_KEY is injected automatically by Supabase for
 * every Edge Function) — it is never committed to this repo and never
 * shipped in the app.
 *
 * Deploy:  supabase functions deploy delete-account
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'Missing Authorization header' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: 'Function is not configured' }, 500);
  }

  // Who is calling? Resolve the user from THEIR token — never trust a
  // user id sent in the request body.
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) {
    return json({ error: 'Invalid or expired session' }, 401);
  }

  // Delete the auth user with the service-role (admin) client.
  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return json({ error: deleteError.message }, 500);
  }

  return json({ deleted: true });
});
