-- Internal Parsera app — no auth, no user_id
-- Run in Supabase → SQL Editor
--
-- Access: use SUPABASE_SERVICE_ROLE_KEY only from your server (API routes).
-- RLS is ON with no policies → anon/authenticated clients cannot read/write this table.
-- Service role bypasses RLS.

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

-- Optional: allow read-only from PostgREST for a future internal admin UI using anon key
-- (only if you accept anyone with the anon key reading history — usually skip this)
-- create policy "public read for internal" on public.scrape_results
--   for select using (true);

comment on table public.scrape_results is 'Parsera runs; server-only via service role';
