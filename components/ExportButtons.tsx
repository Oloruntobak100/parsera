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

  const btn =
    'inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => exportToCSV(rows, safeName)} className={btn}>
        <FileText className="h-4 w-4 text-zinc-500" />
        Export CSV
      </button>
      <button
        type="button"
        onClick={() => exportToExcel(rows, safeName)}
        className={btn}
      >
        <FileSpreadsheet className="h-4 w-4 text-zinc-500" />
        Export Excel
      </button>
      <button type="button" onClick={copyJson} className={btn}>
        {copied ? (
          <Check className="h-4 w-4 text-zinc-400" />
        ) : (
          <Copy className="h-4 w-4 text-zinc-500" />
        )}
        {copied ? 'Copied' : 'Copy JSON'}
      </button>
    </div>
  )
}
