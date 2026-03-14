'use client'

import { FileSpreadsheet, FileText, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { exportToCSV, exportToExcel, resultToRows } from '@/lib/export'

type Props = { data: unknown; baseFilename?: string }

export function ExportButtons({ data, baseFilename = 'parsera-export' }: Props) {
  const [copied, setCopied] = useState(false)
  const rows = resultToRows(data)
  const safeName = baseFilename.replace(/[^a-z0-9-_]/gi, '-').slice(0, 80)

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  if (rows.length === 0) return null

  const ghost =
    'inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-accent/40 hover:bg-white/10'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => exportToCSV(rows, safeName)}
        className={ghost}
      >
        <FileText className="h-4 w-4 text-accent" />
        Export CSV
      </button>
      <button
        type="button"
        onClick={() => exportToExcel(rows, safeName)}
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold uppercase tracking-wide text-zinc-900 shadow-glow-sm hover:brightness-110"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Export Excel
      </button>
      <button type="button" onClick={copyJson} className={ghost}>
        {copied ? (
          <Check className="h-4 w-4 text-accent" />
        ) : (
          <Copy className="h-4 w-4 text-zinc-400" />
        )}
        {copied ? 'Copied' : 'Copy JSON'}
      </button>
    </div>
  )
}
