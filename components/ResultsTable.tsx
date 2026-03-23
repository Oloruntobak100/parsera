'use client'

import { Clock, Download } from 'lucide-react'
import { resultTableRows } from '@/lib/export'
import { exportToCSV, exportToExcel } from '@/lib/export'

type Props = {
  data: unknown
  extractedAt?: Date | null
  baseFilename?: string
}

function formatExtractedAt(d: Date) {
  return d.toLocaleString(undefined, {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function ResultsTable({ data, extractedAt, baseFilename = 'export' }: Props) {
  if (data == null) return null

  const rows = resultTableRows(data)
  const safeName = baseFilename.replace(/[^a-z0-9-_]/gi, '-').slice(0, 80)
  const when = extractedAt ?? new Date()

  if (rows.length > 0) {
    const keys = Object.keys(rows[0] as object).filter((k) => k !== '#')
    const showHash = true

    return (
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#12161c] shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Clock className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
            <span>
              Extracted on <span className="text-zinc-200">{formatExtractedAt(when)}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-zinc-500">Sources (1/1)</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => exportToCSV(rows, safeName)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/10"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
              <button
                type="button"
                onClick={() => exportToExcel(rows, safeName)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-zinc-900 hover:brightness-110"
              >
                Excel
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/20 bg-black/40">
                {showHash && (
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    #
                  </th>
                )}
                {keys.map((k) => (
                  <th
                    key={k}
                    className="border-r border-white/10 px-4 py-3 text-left text-xs font-semibold lowercase tracking-wide text-zinc-400 last:border-r-0"
                  >
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-white/[0.08] hover:bg-white/[0.04] transition-colors"
                >
                  {showHash && (
                    <td className="border-r border-white/5 px-3 py-3 tabular-nums text-zinc-500">
                      {i + 1}
                    </td>
                  )}
                  {keys.map((k) => (
                    <td
                      key={k}
                      className="border-r border-white/5 px-4 py-3 text-zinc-200 last:border-r-0"
                    >
                      <span className="line-clamp-4 block whitespace-pre-wrap break-words">
                        {formatCell(row[k])}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (typeof data === 'object' && !Array.isArray(data)) {
    const entries = Object.entries(data as object).filter(([k]) => k !== 'data')
    return (
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#12161c]">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-sm text-zinc-400">
          <Clock className="h-4 w-4 text-zinc-500" />
          Extracted on{' '}
          <span className="text-zinc-200">{formatExtractedAt(when)}</span>
        </div>
        <dl className="divide-y divide-white/10">
          {entries.map(([k, v]) => (
            <div
              key={k}
              className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[minmax(8rem,1fr)_2fr]"
            >
              <dt className="text-xs font-semibold lowercase text-zinc-500">{k}</dt>
              <dd className="break-all text-zinc-200">{formatCell(v)}</dd>
            </div>
          ))}
        </dl>
      </div>
    )
  }

  return (
    <pre className="overflow-auto rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-zinc-300">
      {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
    </pre>
  )
}

function formatCell(v: unknown): string {
  if (v == null) return '—'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

export function countResults(data: unknown): number {
  const rows = resultTableRows(data)
  if (rows.length > 0) return rows.length
  if (Array.isArray(data)) return data.length
  if (data != null && typeof data === 'object') return 1
  return 0
}
