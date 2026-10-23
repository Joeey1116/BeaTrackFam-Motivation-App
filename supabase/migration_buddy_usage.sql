-- Hustle & Heart Motivation — migration: Haven buddy daily usage
-- Run ONCE in the Supabase SQL editor (buddy-chat setup step).
--
-- Per-user daily counter of Gemini 2.5 Pro ("deep mode") replies for
-- the buddy-chat Edge Function's free daily limit (DAILY_PRO_LIMIT,
-- a constant at the top of supabase/functions/buddy-chat/index.ts).
-- Each signed-in user gets that many Pro replies per UTC day; after
-- that the function answers in lite mode (Flash) for the rest of the
-- day — the conversation never dead-ends. Haven Plus callers are
-- counted in this same table against a much higher abuse ceiling
-- (PLUS_DAILY_CEILING) instead of the free cap.
--
-- The function reads/writes this table with the SERVICE-ROLE key
-- only. RLS is enabled with NO policies, so anon and authenticated
-- clients can neither read nor write it.
--
-- Fail-open by design: if this migration hasn't been run yet, the
-- function treats every user as under the limit and skips accounting
-- entirely, so setup order never breaks the buddy.

create table if not exists public.buddy_usage (
  user_id   uuid not null,
  day       date not null,
  pro_count int  not null default 0,
  primary key (user_id, day)
);

alter table public.buddy_usage enable row level security;

-- Intentionally NO policies: service-role access only.
