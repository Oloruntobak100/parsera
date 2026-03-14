import { NextRequest, NextResponse } from 'next/server'
import {
  buildParseraPayload,
  validateExtractPayload,
} from '@/lib/parsera'
import { getServiceSupabase } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const payload = buildParseraPayload({
      url: body.url,
      prompt: body.prompt,
      attributes: body.attributes,
      mode: body.mode,
      proxy_country: body.proxy_country,
      cookies: body.cookies,
    })

    const validationError = validateExtractPayload(payload)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const apiKey = process.env.PARSERA_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server misconfiguration: PARSERA_API_KEY is not set.' },
        { status: 500 }
      )
    }

    const rowBase = {
      url: payload.url,
      prompt: payload.prompt ?? null,
      attributes: payload.attributes ?? [],
      mode: payload.mode ?? 'standard',
      proxy_country: payload.proxy_country ?? 'UnitedStates',
      cookies: payload.cookies ?? [],
    }

    const res = await fetch('https://api.parsera.org/v1/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify(payload),
    })

    let data: unknown
    const text = await res.text()
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      data = { raw: text, parseError: true }
    }

    const supabase = getServiceSupabase()

    if (!res.ok) {
      const message =
        typeof data === 'object' &&
        data !== null &&
        'error' in data &&
        typeof (data as { error?: string }).error === 'string'
          ? (data as { error: string }).error
          : typeof data === 'object' &&
              data !== null &&
              'message' in data &&
              typeof (data as { message?: string }).message === 'string'
            ? (data as { message: string }).message
            : `Parsera request failed (${res.status})`

      if (supabase) {
        const { data: inserted } = await supabase
          .from('scrape_results')
          .insert({
            ...rowBase,
            result: data as object,
            status: 'error',
            error_message: message,
          })
          .select('id')
          .single()
        return NextResponse.json(
          { error: message, details: data, historyId: inserted?.id },
          { status: res.status >= 400 && res.status < 600 ? res.status : 502 }
        )
      }

      return NextResponse.json(
        { error: message, details: data },
        { status: res.status >= 400 && res.status < 600 ? res.status : 502 }
      )
    }

    let historyId: string | undefined
    if (supabase) {
      const { data: inserted, error: insErr } = await supabase
        .from('scrape_results')
        .insert({
          ...rowBase,
          result: data as object,
          status: 'success',
          error_message: null,
        })
        .select('id')
        .single()
      if (insErr) console.error('Supabase insert failed:', insErr.message)
      else historyId = inserted?.id
    }

    const out = NextResponse.json(data)
    if (historyId) out.headers.set('X-Scrape-History-Id', historyId)
    return out
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unexpected server error' },
      { status: 500 }
    )
  }
}
