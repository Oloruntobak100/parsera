# Parsera Scraper

## Env

| Variable | Required | Where |
|----------|----------|--------|
| `PARSERA_API_KEY` | Yes | `/api/scrape` |
| `NEXT_PUBLIC_SUPABASE_URL` | For history | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | For history | Supabase → Settings → API (server only, never expose) |

## Supabase — scrape history

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor** → run the script in **`supabase/scrape_history.sql`** (copied below).
3. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`.
4. Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret).

History is written only from the server. RLS is on with no policies for `anon`, so the browser cannot read the table directly — only your API (service role) can.

## Vercel

Add: `PARSERA_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

## Dev

```bash
npm install
cp .env.example .env.local
npm run dev
```

## SQL (same as `supabase/scrape_history.sql`)

See that file or the user message for the full query.
