import * as XLSX from 'xlsx'

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

/** Parsera often returns { data: Row[] } — use that for table/export */
export function resultTableRows(result: unknown): Record<string, unknown>[] {
  if (result == null) return []
  if (Array.isArray(result)) {
    return result.every((x) => x && typeof x === 'object' && !Array.isArray(x))
      ? (result as Record<string, unknown>[])
      : []
  }
  if (typeof result === 'object' && result !== null && 'data' in result) {
    const d = (result as { data: unknown }).data
    if (Array.isArray(d) && d.every((x) => x && typeof x === 'object' && !Array.isArray(x))) {
      return d as Record<string, unknown>[]
    }
  }
  return []
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
