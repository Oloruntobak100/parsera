'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  History,
  Loader2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { ResultsTable } from '@/components/ResultsTable'

export type HistoryListRow = {
  id: string
  created_at: string
  url: string
  prompt: string | null
  mode: string
  proxy_country: string | null
  status: string
  error_message: string | null
}

type FullRow = HistoryListRow & { result: unknown; attributes: unknown }

export function HistoryPanel({ refreshKey }: { refreshKey: number }) {
  const [rows, setRows] = useState<HistoryListRow[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const limit = 15
  const [loading, setLoading] = useState(true)
  const [unconfigured, setUnconfigured] = useState(false)
  const [detail, setDetail] = useState<FullRow | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/history?limit=${limit}&offset=${offset}`)
      const j = await r.json()
      if (r.status === 503) {
        setUnconfigured(true)
        setRows([])
        return
      }
      setUnconfigured(false)
      setRows(j.rows ?? [])
      setTotal(j.total ?? 0)
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [offset])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  const openDetail = async (id: string) => {
    setDetailLoading(true)
    setDetail(null)
    try {
      const r = await fetch(`/api/history/${id}`)
      const j = await r.json()
      if (r.ok) setDetail(j as FullRow)
    } finally {
      setDetailLoading(false)
    }
  }

  const remove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this history entry?')) return
    await fetch(`/api/history/${id}`, { method: 'DELETE' })
    load()
    if (detail?.id === id) setDetail(null)
  }

  const pages = Math.max(1, Math.ceil(total / limit))
  const page = Math.floor(offset / limit) + 1

  if (unconfigured) {
    return (
      <section className="panel-card mt-8 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <History className="h-6 w-6 text-zinc-500" />
          <h2 className="font-display text-lg font-bold text-white">History</h2>
        </div>
        <p className="mt-4 text-sm text-zinc-500">
          Supabase is not configured. Add{' '}
          <code className="rounded bg-black/40 px-1 text-accent">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{' '}
          and{' '}
          <code className="rounded bg-black/40 px-1 text-accent">
            SUPABASE_SERVICE_ROLE_KEY
          </code>{' '}
          to enable saved history.
        </p>
      </section>
    )
  }

  return (
    <>
      <section className="panel-card mt-8 rounded-2xl p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                Scrape history
              </h2>
              <p className="text-xs text-zinc-500">
                Stored in Supabase · {total} total
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOffset((o) => Math.max(0, o - limit))}
              disabled={offset === 0 || loading}
              className="rounded-lg border border-accent/30 bg-accent/10 p-2 text-accent hover:bg-accent/20 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-zinc-500">
              {page} / {pages}
            </span>
            <button
              type="button"
              onClick={() => setOffset((o) => o + limit)}
              disabled={offset + limit >= total || loading}
              className="rounded-lg border border-accent/30 bg-accent/10 p-2 text-accent hover:bg-accent/20 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-zinc-500">
            No scrapes yet. Run one above — it will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th className="px-3 py-3 font-display text-xs font-bold uppercase tracking-wider text-accent-glow">
                    When
                  </th>
                  <th className="px-3 py-3 font-display text-xs font-bold uppercase tracking-wider text-accent-glow">
                    URL
                  </th>
                  <th className="px-3 py-3 font-display text-xs font-bold uppercase tracking-wider text-accent-glow">
                    Mode
                  </th>
                  <th className="px-3 py-3 font-display text-xs font-bold uppercase tracking-wider text-accent-glow">
                    Status
                  </th>
                  <th className="px-3 py-3 text-right font-display text-xs font-bold uppercase tracking-wider text-accent-glow">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/5 odd:bg-transparent even:bg-white/[0.02]"
                  >
                    <td className="whitespace-nowrap px-3 py-2.5 text-zinc-400">
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                    <td className="max-w-[200px] truncate px-3 py-2.5 text-zinc-200">
                      {row.url}
                    </td>
                    <td className="px-3 py-2.5 text-zinc-400">{row.mode}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={
                          row.status === 'success'
                            ? 'rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400'
                            : 'rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400'
                        }
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => openDetail(row.id)}
                        className="mr-1 inline-flex rounded-lg border border-white/15 p-2 text-zinc-300 hover:border-accent/50 hover:text-accent"
                        aria-label="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => remove(row.id, e)}
                        className="inline-flex rounded-lg border border-white/15 p-2 text-zinc-500 hover:border-red-500/50 hover:text-red-400"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {(detail || detailLoading) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal
          aria-labelledby="history-detail-title"
        >
          <div className="panel-card max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h3
                id="history-detail-title"
                className="font-display text-lg font-bold text-white"
              >
                Scrape result
              </h3>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[calc(90vh-5rem)] overflow-auto p-6">
              {detailLoading && (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              )}
              {detail && !detailLoading && (
                <>
                  <dl className="mb-4 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-zinc-500">URL</dt>
                      <dd className="break-all text-zinc-200">{detail.url}</dd>
                    </div>
                    <div>
                      <dt className="text-zinc-500">When</dt>
                      <dd className="text-zinc-200">
                        {new Date(detail.created_at).toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-zinc-500">Status</dt>
                      <dd className="text-zinc-200">{detail.status}</dd>
                    </div>
                    {detail.error_message && (
                      <div className="sm:col-span-2">
                        <dt className="text-zinc-500">Error</dt>
                        <dd className="text-red-300">{detail.error_message}</dd>
                      </div>
                    )}
                  </dl>
                  {detail.status === 'success' && detail.result != null && (
                    <>
                      <ResultsTable
                        data={detail.result}
                        extractedAt={new Date(detail.created_at)}
                        baseFilename="history-export"
                      />
                    </>
                  )}
                  {detail.status === 'error' && (
                    <pre className="overflow-auto rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-zinc-400">
                      {JSON.stringify(detail.result, null, 2)}
                    </pre>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
