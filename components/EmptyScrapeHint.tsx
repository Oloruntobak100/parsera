'use client'

/** Parsera-style response when nothing was extracted */
export function emptyScrapeResponse(data: unknown): {
  empty: boolean
  message?: string
  isPaginated?: boolean
} {
  if (data == null || typeof data !== 'object') return { empty: false }
  const o = data as Record<string, unknown>
  const arr = o.data
  const message = typeof o.message === 'string' ? o.message : undefined
  const isPaginated = o.is_paginated === true
  if (!Array.isArray(arr)) return { empty: false }
  const empty = arr.length === 0
  return { empty, message, isPaginated }
}

export function EmptyScrapeBanner({ data }: { data: unknown }) {
  const { empty, message, isPaginated } = emptyScrapeResponse(data)
  if (!empty) return null
  return (
    <div className="mb-4 space-y-3 rounded-xl border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-sm">
      <p className="font-medium text-amber-100">No rows in <code className="rounded bg-black/30 px-1">data</code></p>
      {message && <p className="text-amber-200/90">{message}</p>}
      {isPaginated && (
        <p className="text-amber-200/80">
          This page looks <strong>paginated</strong> — Parsera may only see the first view. Add fields that match visible content, or try <strong>Precision</strong> mode.
        </p>
      )}
      <ul className="list-inside list-disc text-amber-200/70">
        <li>Use <strong>Precision</strong> mode for heavy or dynamic pages.</li>
        <li>Add <strong>Add field</strong> rows (label + what to grab) instead of prompt-only.</li>
        <li>Try another <strong>proxy country</strong> if the site is geo-restricted.</li>
      </ul>
    </div>
  )
}
