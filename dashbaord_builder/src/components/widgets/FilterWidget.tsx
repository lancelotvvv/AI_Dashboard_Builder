import { useEffect, useState } from 'react'
import type { WidgetProps } from '@/registry/widget-registry'
import type { FilterConfig } from '@/schemas/widget-configs.schema'
import { useFilterStore } from '@/store/filter.store'
import { useDataProvider } from '@/providers/provider-context'

export function FilterWidget({ config }: WidgetProps) {
  const c = config as unknown as FilterConfig
  const { setFilter, clearFilter } = useFilterStore()
  const provider = useDataProvider()
  const [options, setOptions] = useState<(string | number)[]>(c.options ?? [])
  const [selected, setSelected] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Derive a stable widget ID from config identity — FilterWidget gets its ID via a data attribute on the parent,
  // but simpler: use datasetId+field as the filter key. We need the widget ID though.
  // We'll use a ref-based approach: the WidgetRenderer passes the widget ID.
  // For now, use datasetId+field as a unique key.
  const filterKey = `filter_${c.datasetId}_${c.field}`

  // Auto-populate options when not provided
  useEffect(() => {
    if (c.options && c.options.length > 0) {
      setOptions(c.options)
      return
    }
    if (!c.datasetId || !c.field) return

    provider.query({ datasetId: c.datasetId }).then((result) => {
      const unique = [...new Set(result.rows.map((r) => r[c.field]).filter((v) => v != null))] as (string | number)[]
      unique.sort()
      setOptions(unique)
    })
  }, [c.datasetId, c.field, c.options, provider])

  if (!c.datasetId || !c.field) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-slate-400">
        Set datasetId and field to configure filter
      </div>
    )
  }

  function handleSelect(value: string) {
    setSelected(value)
    if (value === '' || value === '__all__') {
      clearFilter(filterKey)
    } else {
      setFilter(filterKey, { field: c.field, datasetId: c.datasetId, op: 'eq', value })
    }
  }

  function handleDateChange(from: string, to: string) {
    setDateFrom(from)
    setDateTo(to)
    // Clear both first
    clearFilter(filterKey + '_gte')
    clearFilter(filterKey + '_lte')
    if (from) {
      useFilterStore.getState().setFilter(filterKey + '_gte', { field: c.field, datasetId: c.datasetId, op: 'gte', value: from })
    }
    if (to) {
      useFilterStore.getState().setFilter(filterKey + '_lte', { field: c.field, datasetId: c.datasetId, op: 'lte', value: to })
    }
  }

  if (c.displayType === 'date-range') {
    return (
      <div className="flex items-center gap-3 px-3 h-full">
        <span className="text-xs font-medium text-slate-500 shrink-0">{c.label}</span>
        <input
          type="date"
          className="border border-slate-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-tech-blue/30 focus:border-tech-blue outline-none"
          value={dateFrom}
          onChange={(e) => handleDateChange(e.target.value, dateTo)}
        />
        <span className="text-xs text-slate-400">to</span>
        <input
          type="date"
          className="border border-slate-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-tech-blue/30 focus:border-tech-blue outline-none"
          value={dateTo}
          onChange={(e) => handleDateChange(dateFrom, e.target.value)}
        />
      </div>
    )
  }

  if (c.displayType === 'button-group') {
    return (
      <div className="flex items-center gap-2 px-3 h-full flex-wrap">
        <span className="text-xs font-medium text-slate-500 shrink-0">{c.label}</span>
        <button
          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
            selected === '' || selected === '__all__'
              ? 'bg-tech-blue text-white'
              : 'bg-white/60 text-slate-600 hover:bg-white/80'
          }`}
          onClick={() => handleSelect('__all__')}
        >
          All
        </button>
        {options.map((opt) => (
          <button
            key={String(opt)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              selected === String(opt)
                ? 'bg-tech-blue text-white'
                : 'bg-white/60 text-slate-600 hover:bg-white/80'
            }`}
            onClick={() => handleSelect(String(opt))}
          >
            {String(opt)}
          </button>
        ))}
      </div>
    )
  }

  // Default: dropdown
  return (
    <div className="flex items-center gap-3 px-3 h-full">
      <span className="text-xs font-medium text-slate-500 shrink-0">{c.label}</span>
      <select
        className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-tech-blue/30 focus:border-tech-blue outline-none flex-1"
        value={selected}
        onChange={(e) => handleSelect(e.target.value)}
      >
        <option value="__all__">All</option>
        {options.map((opt) => (
          <option key={String(opt)} value={String(opt)}>
            {String(opt)}
          </option>
        ))}
      </select>
    </div>
  )
}
