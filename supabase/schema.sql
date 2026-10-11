-- Hustle & Heart Motivation — quotes table
-- Run in the Supabase SQL Editor. Safe to re-run (IF NOT EXISTS / idempotent policies).
-- NOTE: this lives alongside the loyalty app's tables in the same project — it
-- only touches the `quotes` table and never drops anything.

create table if not exists public.quotes (
  id         text primary key,
  text       text not null,
  language   text not null default 'en',
  tracks     text[] not null default '{}',
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists quotes_language_idx on public.quotes (language);
create index if not exists quotes_tracks_idx on public.quotes using gin (tracks);

alter table public.quotes enable row level security;

drop policy if exists "quotes readable by anon" on public.quotes;
create policy "quotes readable by anon"
  on public.quotes for select
  to anon
  using (active = true);
