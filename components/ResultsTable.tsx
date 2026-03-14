'use client'

type Props = { data: unknown }

export function ResultsTable({ data }: Props) {
  if (data == null) return null

  if (Array.isArray(data) && data.length > 0) {
    const first = data[0]
    if (first && typeof first === 'object' && !Array.isArray(first)) {
      const keys = Object.keys(first as object)
      return (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/25">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                {keys.map((k) => (
                  <th
                    key={k}
                    className="whitespace-nowrap px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-accent-glow"
                  >
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data as Record<string, unknown>[]).map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-white/5 odd:bg-transparent even:bg-white/[0.02]"
                >
                  {keys.map((k) => (
                    <td
                      key={k}
                      className="max-w-xs truncate px-4 py-2.5 text-zinc-300"
                    >
                      {formatCell(row[k])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
  }

  if (typeof data === 'object' && !Array.isArray(data)) {
    const entries = Object.entries(data as object)
    return (
      <dl className="divide-y divide-white/10 rounded-xl border border-white/10 bg-black/25">
        {entries.map(([k, v]) => (
          <div
            key={k}
            className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[minmax(8rem,1fr)_2fr]"
          >
            <dt className="font-medium text-accent">{k}</dt>
            <dd className="break-all text-zinc-200">{formatCell(v)}</dd>
          </div>
        ))}
      </dl>
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
  if (Array.isArray(data)) return data.length
  if (data != null && typeof data === 'object') return 1
  return 0
}
