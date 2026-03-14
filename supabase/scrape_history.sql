-- Parsera scrape history (internal app — no auth)
-- Run in Supabase → SQL Editor
--
-- Safe to re-run: uses IF NOT EXISTS. If you already created the table manually
-- and it matches this schema, you can skip this file entirely.

create table if not exists public.scrape_results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  url text not null,
  prompt text,
  attributes jsonb default '[]'::jsonb,
  mode text not null default 'standard',
  proxy_country text default 'UnitedStates',
  cookies jsonb default '[]'::jsonb,
  result jsonb,
  status text not null default 'success',
  error_message text,
  credits_used int default 1
);

create index if not exists scrape_results_created_at_idx
  on public.scrape_results (created_at desc);

alter table public.scrape_results enable row level security;

comment on table public.scrape_results is 'Parsera runs; API uses service role only';
