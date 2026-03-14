'use client'

import { Plus, X } from 'lucide-react'

export type AttributeRow = { name: string; description: string }

type Props = {
  rows: AttributeRow[]
  onChange: (rows: AttributeRow[]) => void
}

export function AttributesBuilder({ rows, onChange }: Props) {
  const add = () => onChange([...rows, { name: '', description: '' }])
  const remove = (i: number) => onChange(rows.filter((_, j) => j !== i))
  const update = (i: number, field: keyof AttributeRow, value: string) => {
    const next = rows.map((r, j) =>
      j === i ? { ...r, [field]: value } : r
    )
    onChange(next)
  }

  const inputRow =
    'w-full rounded-lg border border-white/10 bg-surface-input px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent/40 sm:flex-1'

  return (
    <div className="space-y-3 rounded-xl border border-accent/20 bg-accent/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex rounded-md bg-accent px-2 py-0.5 font-display text-xs font-bold uppercase tracking-wider text-zinc-900">
            Columns
          </span>
          <span className="text-xs text-zinc-500">
            Field names become JSON keys
          </span>
        </div>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-bold text-zinc-900 shadow-glow-sm hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Add field
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm leading-relaxed text-zinc-500">
          Optional if you use a prompt below. Each row:{' '}
          <span className="font-medium text-accent-glow">Name</span> = column
          key,{' '}
          <span className="font-medium text-accent-glow">Description</span> =
          what to extract.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row, i) => (
            <li
              key={i}
              className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/30 p-3 sm:flex-row sm:items-start"
            >
              <div className="flex-1 space-y-1 sm:max-w-[40%]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                  Name
                </span>
                <input
                  type="text"
                  placeholder="e.g. title, price"
                  value={row.name}
                  onChange={(e) => update(i, 'name', e.target.value)}
                  className={inputRow + ' w-full'}
                />
              </div>
              <div className="min-w-0 flex-[2] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                  Description
                </span>
                <input
                  type="text"
                  placeholder="What to pull from the page"
                  value={row.description}
                  onChange={(e) => update(i, 'description', e.target.value)}
                  className={inputRow + ' w-full'}
                />
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="shrink-0 self-end rounded-lg p-2 text-zinc-500 hover:bg-white/10 hover:text-zinc-300 sm:self-center"
                aria-label="Remove row"
              >
                <X className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
