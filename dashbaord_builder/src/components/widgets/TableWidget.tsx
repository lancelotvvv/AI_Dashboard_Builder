import { useState } from 'react'
import type { WidgetProps } from '@/registry/widget-registry'
import type { TableConfig } from '@/schemas/widget-configs.schema'
import { ArrowUpDown } from 'lucide-react'

export function TableWidget({ config, data }: WidgetProps) {
  const c = config as TableConfig
  const rows = data?.rows ?? []
  const allCols = data?.fields?.map(f => f.name) ?? Object.keys(rows[0] ?? {})
  const columns = c.columns?.length ? c.columns : allCols
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(0)

  if (!rows.length) {
    return <div className="flex items-center justify-center h-full text-slate-400">No data. Bind a dataset.</div>
  }

  let sorted = [...rows]
  if (sortCol) {
    sorted.sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol]
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sortAsc ? cmp : -cmp
    })
  }

  const pageSize = c.pageSize || 10
  const totalPages = Math.ceil(sorted.length / pageSize)
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize)
  const py = c.compact ? 'py-1' : 'py-2'

  function handleSort(col: string) {
    if (sortCol === col) setSortAsc(!sortAsc)
    else { setSortCol(col); setSortAsc(true) }
  }

  return (
    <div className="overflow-auto h-full flex flex-col p-2">
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {c.showRowNumbers && (
                <th className={`text-left px-2 ${py} bg-paper-100 first:rounded-tl-lg text-slate-400 font-medium text-[10px] w-8`}>#</th>
              )}
              {columns.map(col => (
                <th
                  key={col}
                  className={`text-left px-2 ${py} cursor-pointer hover:bg-white/50 bg-paper-100 text-slate-600 font-medium ${!c.showRowNumbers ? 'first:rounded-tl-lg' : ''} last:rounded-tr-lg`}
                  onClick={() => handleSort(col)}
                >
                  <span className="flex items-center gap-1">
                    {col}
                    <ArrowUpDown size={12} className={sortCol === col ? 'text-tech-blue' : 'text-slate-400'} />
                    {sortCol === col && <span className="text-[10px] text-tech-blue">{sortAsc ? '↑' : '↓'}</span>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => {
              const rowNum = page * pageSize + i + 1
              const stripe = c.striped && i % 2 !== 0
              return (
                <tr key={i} className={`border-b border-slate-100 hover:bg-white/50 ${stripe ? 'bg-paper-50/50' : 'bg-transparent'}`}>
                  {c.showRowNumbers && (
                    <td className={`px-2 ${py} text-slate-400 text-[10px]`}>{rowNum}</td>
                  )}
                  {columns.map(col => (
                    <td key={col} className={`px-2 ${py} text-slate-700`}>{String(row[col] ?? '')}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-1.5 border-t border-slate-100 text-xs text-slate-400 shrink-0">
          <button
            className="hover:text-slate-600 disabled:opacity-30"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            ← Prev
          </button>
          <span>{page + 1} / {totalPages}</span>
          <button
            className="hover:text-slate-600 disabled:opacity-30"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
