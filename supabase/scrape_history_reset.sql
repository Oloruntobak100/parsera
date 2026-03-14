-- OPTIONAL — only if you want to wipe history and recreate empty table
-- WARNING: deletes all rows and drops the table.

-- drop table if exists public.scrape_results cascade;

-- Then run scrape_history.sql again (or the CREATE block below)

/*
drop table if exists public.scrape_results cascade;

create table public.scrape_results (
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

create index scrape_results_created_at_idx
  on public.scrape_results (created_at desc);

alter table public.scrape_results enable row level security;
*/
