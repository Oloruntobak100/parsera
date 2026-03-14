import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const supabase = getServiceSupabase()
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase not configured (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).' },
      { status: 503 }
    )
  }

  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 100)
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0)

  const { data, error, count } = await supabase
    .from('scrape_results')
    .select(
      'id, created_at, url, prompt, mode, proxy_country, status, error_message',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    rows: data ?? [],
    total: count ?? 0,
    limit,
    offset,
  })
}
