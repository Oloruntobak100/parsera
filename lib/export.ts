import * as XLSX from 'xlsx'

function columnObjectToRows(obj: Record<string, unknown>): Record<string, unknown>[] {
  const entries = Object.entries(obj).filter(
    ([, v]) => Array.isArray(v) && v.length > 0
  )
  if (entries.length === 0) return []
  const keys = entries.map(([k]) => k)
  const cols = entries.map(([, v]) => v as unknown[])
  const len = Math.min(...cols.map((c) => c.length))
  if (len === 0) return []
  const rows: Record<string, unknown>[] = []
  for (let i = 0; i < len; i++) {
    const row: Record<string, unknown> = {}
    keys.forEach((k, j) => {
      row[k] = cols[j][i]
    })
    rows.push(row)
  }
  return rows
}

export function exportToExcel(data: Record<string, unknown>[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Results')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(ws)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Parse Parsera response into row-oriented table data.
 * Handles: { data: Row[] }, top-level Row[], or column-oriented { col: values[] }.
 */
export function resultTableRows(result: unknown): Record<string, unknown>[] {
  if (result == null) return []

  // Top-level array of row objects
  if (Array.isArray(result)) {
    if (result.every((x) => x && typeof x === 'object' && !Array.isArray(x))) {
      return result as Record<string, unknown>[]
    }
    return []
  }

  if (typeof result !== 'object') return []

  const obj = result as Record<string, unknown>

  // { data: Row[] } or { data: { col: values[] } } — tabular or list extractor
  if ('data' in obj) {
    const d = obj.data
    if (Array.isArray(d) && d.every((x) => x && typeof x === 'object' && !Array.isArray(x))) {
      return d as Record<string, unknown>[]
    }
    if (d && typeof d === 'object' && !Array.isArray(d)) {
      const fromCols = columnObjectToRows(d as Record<string, unknown>)
      if (fromCols.length > 0) return fromCols
    }
  }

  // Column-oriented: { item: ["a","b"], price: ["1","2"] } — List extractor
  return columnObjectToRows(obj)
}

/** Normalize Parsera result to array of flat rows for export */
export function resultToRows(result: unknown): Record<string, unknown>[] {
  const fromTable = resultTableRows(result)
  if (fromTable.length > 0) return fromTable
  if (result == null) return []
  if (Array.isArray(result)) {
    return result.every((x) => x && typeof x === 'object' && !Array.isArray(x))
      ? (result as Record<string, unknown>[])
      : [{ value: JSON.stringify(result) }]
  }
  if (typeof result === 'object') return [result as Record<string, unknown>]
  return [{ value: String(result) }]
}
